"""portfolio_rotation.py — personal portfolio research & rebalance dashboard.

WHAT IT DOES
============
Single-file Python tool that serves a local dark-theme HTML dashboard for
personal portfolio research and rebalance recommendations across five sleeves:
bonds, commodities, crypto, growth ETFs, and tech rotation. Pulls real daily
bars from yfinance, computes signals (momentum, trend, vol, drawdown, regime),
runs rule-based rotation strategies, generates buy/sell recommendations vs your
target allocation, and supports comprehensive backtests (single-run, strategy
comparison, 2D parameter sweep, walk-forward, Monte Carlo, regime breakdown).

RUN MODES
=========
  python3 portfolio_rotation.py --dashboard
      Launch the local dashboard at http://127.0.0.1:8780.

  python3 portfolio_rotation.py --backtest --strategy xs_momentum \
      --start 2010-01-01 --end 2026-01-01
      Headless backtest; prints summary as JSON.

  python3 portfolio_rotation.py --recommend
      One-shot: print today's rebalance recommendations and exit.

  python3 portfolio_rotation.py --mock --dashboard
      Use synthetic GBM bars instead of yfinance. Useful when offline or
      behind a corporate web filter that blocks Yahoo Finance.

CLI FLAGS
=========
  --dashboard               Start the local web dashboard
  --dashboard-port 8780     Port (default 8780, localhost only)
  --backtest                Run a single backtest and exit
  --recommend               Print today's recommendations and exit
  --strategy NAME           Strategy name; default xs_momentum
  --start YYYY-MM-DD        Start date for backtest (default 2010-01-01)
  --end YYYY-MM-DD          End date (default today)
  --mock                    Synthetic bars; no yfinance calls
  --state-file PATH         Portfolio state JSON path (default portfolio_state.json)
  --universe T1,T2,...      Comma-separated ticker override for backtests
  --log-level INFO          Logging verbosity

INSTALL
=======
  python3 -m pip install yfinance pandas numpy
  (No other dependencies. Uses stdlib http.server for the dashboard.)

DATA & CACHE LAYOUT
===================
  portfolio_state.json                       (CWD; portfolio state, atomic writes)
  ~/.cache/portfolio_rotation/yfinance/      (daily bar parquet files)
  ~/.cache/portfolio_rotation/meta.json      (last-fetch timestamps)
  ~/.cache/portfolio_rotation/backtest/      (cached backtest results)

CREDENTIAL MANAGEMENT
=====================
NONE REQUIRED. yfinance uses public Yahoo Finance endpoints; no API key.
The tool is recommendation-only — it never places trades, never connects to
a broker, never stores wallet keys. Execute manually in your broker.

The dashboard binds to 127.0.0.1 only. Loopback is the auth boundary; do not
expose this port externally.

UNIVERSE
========
Five sleeves + benchmarks (see UNIVERSE constant in source). Curated 25 tickers
covering long/intermediate/short Treasuries, IG/HY credit, gold/silver/broad
commodity/oil/ag, BTC/ETH/SOL, large-cap growth + ARK, and sector tech + semis
+ software. Modify the UNIVERSE dict in this file to add/remove tickers.

STRATEGIES
==========
  xs_momentum      Cross-sectional momentum within each sleeve, gated by SMA200
  dual_momentum    Pick the strongest 12mo momentum; fall back to CASH if below
                   cash yield (Antonacci 2014)
  risk_parity      Inverse-vol weighting within sleeves, sleeves equal-weighted
  trend_following  Hold only assets where close > SMA200, equal-weight
  static_target    Use your target allocation as-is (baseline)

PERSISTENCE
===========
portfolio_state.json is the source of truth for your portfolio. It is written
atomically (tmp file + rename) and backed up to portfolio_state.bak.json on
every save. Edit by hand or via POST /api/holdings.

SAFETY
======
This tool gives RECOMMENDATIONS only. It does not place trades. Past performance
does not predict future results. Backtests are subject to overfitting; use
walk-forward and Monte Carlo modes to gauge robustness.
"""
from __future__ import annotations
import argparse, logging, os, sys, time, json, threading
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any
import numpy as np
import pandas as pd

LOG = logging.getLogger("portfolio_rotation")

# -- Universe -----------------------------------------------------------------
@dataclass(frozen=True)
class TickerMeta:
    display_name: str
    sleeve: str
    role: str
    default_target_weight: float
    description: str

SLEEVES = ["bonds", "commodity", "crypto", "growth", "tech", "benchmarks", "cash"]

UNIVERSE: dict[str, TickerMeta] = {
    # bonds (target 25%)
    "TLT": TickerMeta("iShares 20+ Yr Treasury", "bonds", "long-duration Treasury", 0.08, "Long Treasury duration play"),
    "IEF": TickerMeta("iShares 7-10 Yr Treasury", "bonds", "intermediate Treasury", 0.07, "Belly of the curve"),
    "SHY": TickerMeta("iShares 1-3 Yr Treasury", "bonds", "short Treasury", 0.04, "Cash-like short Treasury"),
    "LQD": TickerMeta("iShares Inv-Grade Corp", "bonds", "IG credit", 0.03, "Investment-grade corporate credit"),
    "HYG": TickerMeta("iShares High Yield", "bonds", "HY credit", 0.03, "High-yield corporate credit"),
    # commodity (target 15%)
    "GLD": TickerMeta("SPDR Gold", "commodity", "gold", 0.06, "Gold reserve asset"),
    "SLV": TickerMeta("iShares Silver", "commodity", "silver", 0.02, "Silver, higher beta to gold"),
    "DBC": TickerMeta("Invesco DB Commodity", "commodity", "broad commodity", 0.04, "Broad commodity basket"),
    "USO": TickerMeta("US Oil Fund", "commodity", "crude oil", 0.02, "WTI crude exposure"),
    "DBA": TickerMeta("Invesco DB Agriculture", "commodity", "agriculture", 0.01, "Soft commodities"),
    # crypto (target 10%)
    "BTC-USD": TickerMeta("Bitcoin USD", "crypto", "BTC", 0.06, "Digital gold"),
    "ETH-USD": TickerMeta("Ethereum USD", "crypto", "ETH", 0.03, "Smart-contract platform"),
    "SOL-USD": TickerMeta("Solana USD", "crypto", "SOL", 0.01, "Higher-beta L1"),
    # growth (target 30%)
    "QQQ": TickerMeta("Invesco QQQ", "growth", "Nasdaq-100", 0.15, "Large-cap Nasdaq growth"),
    "VUG": TickerMeta("Vanguard Growth", "growth", "US large growth", 0.08, "Broad US growth"),
    "IWF": TickerMeta("iShares Russell 1000 Growth", "growth", "Russell growth", 0.05, "Russell 1000 growth tilt"),
    "ARKK": TickerMeta("ARK Innovation", "growth", "high-beta innovation", 0.02, "Disruptive innovation, high vol"),
    # tech rotation (target 20%)
    "XLK": TickerMeta("Tech Select Sector", "tech", "S&P tech sector", 0.08, "Mega-cap tech"),
    "SOXX": TickerMeta("iShares Semis", "tech", "semiconductors", 0.06, "Semiconductor cycle"),
    "SMH": TickerMeta("VanEck Semis", "tech", "semiconductors alt", 0.04, "Alt semis ETF"),
    "IGV": TickerMeta("iShares Software", "tech", "software", 0.02, "Enterprise software"),
    # benchmarks
    "SPY": TickerMeta("S&P 500", "benchmarks", "US equity benchmark", 0.0, "Benchmark — not held"),
    "VTI": TickerMeta("US Total Market", "benchmarks", "total market", 0.0, "Total-market benchmark"),
    "AGG": TickerMeta("US Aggregate Bond", "benchmarks", "agg bond benchmark", 0.0, "Bond benchmark"),
    # cash (synthetic)
    "CASH": TickerMeta("Cash", "cash", "USD cash", 0.0, "Synthetic constant-1.0 series"),
}

# -- Mock bars ----------------------------------------------------------------
_MOCK_DEFAULTS = {
    "drift": 0.0004, "vol": 0.012, "start_px": 100.0,
}
_MOCK_OVERRIDES = {
    "BTC-USD": {"drift": 0.0010, "vol": 0.04, "start_px": 20000.0},
    "ETH-USD": {"drift": 0.0009, "vol": 0.05, "start_px": 1500.0},
    "SOL-USD": {"drift": 0.0008, "vol": 0.07, "start_px": 30.0},
    "TLT": {"drift": 0.00005, "vol": 0.008, "start_px": 100.0},
    "GLD": {"drift": 0.00025, "vol": 0.010, "start_px": 150.0},
    "CASH": {"drift": 0.0, "vol": 0.0, "start_px": 1.0},
}

def generate_mock_bars(ticker: str, start, end, seed: int | None = None) -> pd.DataFrame:
    idx = pd.bdate_range(start, end)
    if len(idx) == 0:
        return pd.DataFrame(columns=["open","high","low","close","adj_close","volume"])
    params = {**_MOCK_DEFAULTS, **_MOCK_OVERRIDES.get(ticker, {})}
    seed_int = seed if seed is not None else (abs(hash(ticker)) % (2**32))
    rng = np.random.default_rng(seed_int)
    if params["vol"] == 0.0:
        close = np.full(len(idx), params["start_px"])
    else:
        rets = rng.normal(params["drift"], params["vol"], len(idx))
        close = params["start_px"] * np.exp(np.cumsum(rets))
    df = pd.DataFrame({
        "open":  close * (1 + rng.normal(0, 0.001, len(idx))),
        "high":  close * (1 + np.abs(rng.normal(0, 0.004, len(idx)))),
        "low":   close * (1 - np.abs(rng.normal(0, 0.004, len(idx)))),
        "close": close,
        "adj_close": close,
        "volume": rng.integers(int(1e5), int(1e7), len(idx)),
    }, index=idx)
    df.index.name = "date"
    return df

# -- DataStore ----------------------------------------------------------------
CACHE_DIR = Path(os.environ.get("PORTFOLIO_ROTATION_CACHE",
                                str(Path.home() / ".cache" / "portfolio_rotation")))
_DEFAULT_INTERVAL = "1d"
_REFETCH_AFTER_HOURS = 6
_DEFAULT_LOOKBACK_YEARS = 20

class DataStore:
    def __init__(self, cache_dir: Path | None = None, mock: bool = False):
        self.cache_dir = Path(cache_dir or CACHE_DIR)
        self.yf_dir = self.cache_dir / "yfinance"
        self.yf_dir.mkdir(parents=True, exist_ok=True)
        self.meta_path = self.cache_dir / "meta.json"
        self.mock = mock
        self._meta = self._load_meta()
        self._lock = threading.RLock()
        self._mem: dict[str, pd.DataFrame] = {}

    # ---- meta ----
    def _load_meta(self) -> dict:
        if self.meta_path.exists():
            try: return json.loads(self.meta_path.read_text())
            except Exception: return {}
        return {}

    def _save_meta(self) -> None:
        tmp = self.meta_path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(self._meta, indent=2, default=str))
        tmp.replace(self.meta_path)

    def _mark(self, ticker: str, ok: bool, err: str | None = None) -> None:
        with self._lock:
            self._meta[ticker] = {
                "last_attempt": datetime.now(timezone.utc).isoformat(),
                "last_ok": (datetime.now(timezone.utc).isoformat() if ok
                            else self._meta.get(ticker, {}).get("last_ok")),
                "error": err,
            }
            self._save_meta()

    # ---- fetch ----
    def _fetch_remote(self, ticker: str, start: date, end: date) -> pd.DataFrame:
        if self.mock:
            return generate_mock_bars(ticker, start, end)
        import yfinance as yf
        last_err = None
        for attempt in range(3):
            try:
                df = yf.download(ticker, start=str(start), end=str(end),
                                 interval="1d", progress=False, auto_adjust=False,
                                 threads=False)
                if df is None or df.empty:
                    raise RuntimeError("empty result")
                # Recent yfinance versions return a MultiIndex column even for
                # a single ticker (e.g. ("Close", "QQQ")). Flatten so the rest
                # of the code can treat columns as plain strings.
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = df.columns.get_level_values(0)
                df = df.rename(columns=str.lower).rename(columns={"adj close": "adj_close"})
                df.index = pd.to_datetime(df.index).tz_localize(None)
                df.index.name = "date"
                return df[["open","high","low","close","adj_close","volume"]]
            except Exception as e:
                last_err = e
                time.sleep(0.5 * (2**attempt))
        raise RuntimeError(f"yfinance fetch failed for {ticker}: {last_err}")

    def _cache_path(self, ticker: str) -> Path:
        return self.yf_dir / f"{ticker}_1d.parquet"

    def _load_cache(self, ticker: str) -> pd.DataFrame | None:
        p = self._cache_path(ticker)
        if not p.exists(): return None
        try: return pd.read_parquet(p)
        except Exception: return None

    def _save_cache(self, ticker: str, df: pd.DataFrame) -> None:
        p = self._cache_path(ticker)
        tmp = p.with_suffix(".parquet.tmp")
        df.to_parquet(tmp)
        tmp.replace(p)

    # ---- public ----
    def bars(self, ticker: str, start, end) -> pd.DataFrame:
        with self._lock:
            if ticker in self._mem:
                df = self._mem[ticker]
            else:
                df = self._load_cache(ticker)
            need_fetch = df is None or df.empty or df.index.min().date() > date.fromisoformat(str(start)) \
                or df.index.max().date() < date.fromisoformat(str(end)) - timedelta(days=2)
            stale = self._is_stale(ticker)
            if need_fetch or stale:
                try:
                    fetched_start = min(date.fromisoformat(str(start)),
                                        (df.index.min().date() if df is not None and not df.empty else date.fromisoformat(str(start))))
                    fresh = self._fetch_remote(ticker, fetched_start, date.fromisoformat(str(end)))
                    if df is not None and not df.empty:
                        df = pd.concat([df[~df.index.isin(fresh.index)], fresh]).sort_index()
                    else:
                        df = fresh
                    self._save_cache(ticker, df)
                    self._mark(ticker, ok=True)
                except Exception as e:
                    self._mark(ticker, ok=False, err=str(e))
                    if df is None or df.empty:
                        raise
            self._mem[ticker] = df
            mask = (df.index.date >= date.fromisoformat(str(start))) & (df.index.date <= date.fromisoformat(str(end)))
            return df.loc[mask].copy()

    def _is_stale(self, ticker: str) -> bool:
        m = self._meta.get(ticker)
        if not m or not m.get("last_ok"): return True
        last = datetime.fromisoformat(m["last_ok"])
        return (datetime.now(timezone.utc) - last) > timedelta(hours=_REFETCH_AFTER_HOURS)

    def staleness(self, ticker: str) -> timedelta:
        m = self._meta.get(ticker, {})
        if not m.get("last_ok"):
            return timedelta(days=999)
        return datetime.now(timezone.utc) - datetime.fromisoformat(m["last_ok"])

    def latest(self, ticker: str) -> dict:
        today = date.today()
        df = self.bars(ticker, today - timedelta(days=400), today)
        if df.empty:
            return {"price": float("nan"), "change_pct": 0.0, "high52w": 0.0, "low52w": 0.0,
                    "as_of": None, "stale": True}
        last = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else last
        return {
            "price": float(last["close"]),
            "change_pct": float((last["close"] / prev["close"]) - 1.0) * 100.0,
            "high52w": float(df["high"].tail(252).max()),
            "low52w": float(df["low"].tail(252).min()),
            "as_of": df.index[-1].to_pydatetime(),
            "stale": self.staleness(ticker) > timedelta(hours=24),
        }

    def returns(self, ticker: str, start, end) -> pd.Series:
        df = self.bars(ticker, start, end)
        if df.empty: return pd.Series(dtype=float)
        return np.log(df["adj_close"] / df["adj_close"].shift(1)).dropna()

    def correlation_matrix(self, tickers: list[str], window: int = 60,
                           end: date | None = None) -> pd.DataFrame:
        end = end or date.today()
        start = end - timedelta(days=window * 2 + 30)
        rets = {}
        for t in tickers:
            r = self.returns(t, start, end).tail(window)
            rets[t] = r
        df = pd.DataFrame(rets).dropna(how="any")
        return df.corr()

    def refresh(self, tickers: list[str] | None = None) -> dict:
        tickers = tickers or list(UNIVERSE.keys())
        out: dict[str, list | dict] = {"ok": [], "stale": [], "errors": {}}
        end = date.today()
        start = end - timedelta(days=365 * _DEFAULT_LOOKBACK_YEARS)
        for t in tickers:
            try:
                self.bars(t, start, end)
                out["ok"].append(t)
            except Exception as e:
                out["errors"][t] = str(e)
                if self._cache_path(t).exists():
                    out["stale"].append(t)
        return out


# -- Signals ------------------------------------------------------------------
@dataclass
class SignalContext:
    as_of: date
    data: "DataStore"
    universe: list[str]

@dataclass
class SignalResult:
    score: float
    raw_value: float
    components: dict[str, float] = field(default_factory=dict)
    why: str = ""

class Signal:
    NAME = "abstract"
    DESCRIPTION = ""
    FORMULA = ""
    @classmethod
    def compute(cls, ticker: str, bars: pd.DataFrame, ctx: SignalContext) -> SignalResult:
        raise NotImplementedError

def _safe_tail(s: pd.Series, n: int) -> pd.Series:
    return s.dropna().tail(n)

class MomentumSignal(Signal):
    NAME = "momentum"
    DESCRIPTION = "12-month total return minus 1-month, cross-sectionally ranked"
    FORMULA = "score = rank_norm( r12mo(t) - r1mo(t) )  ∈ [-1,+1]"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        if len(bars) < 260:
            return SignalResult(0.0, 0.0, {}, "insufficient history")
        c = bars["adj_close"]
        r12 = c.iloc[-1] / c.iloc[-252] - 1.0
        r1  = c.iloc[-1] / c.iloc[-21]  - 1.0
        raw = float(r12 - r1)
        return SignalResult(np.clip(raw * 2.0, -1.0, 1.0), raw,
                            {"r12mo": float(r12), "r1mo": float(r1)},
                            f"12mo={r12:+.1%}, 1mo={r1:+.1%}, 12-1={raw:+.1%}")

class TrendFilterSignal(Signal):
    NAME = "trend"
    DESCRIPTION = "Close above 200-day SMA"
    FORMULA = "score = 1 if close > SMA200 else 0"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        if len(bars) < 200:
            return SignalResult(0.0, 0.0, {}, "no SMA200 yet")
        sma = bars["adj_close"].rolling(200).mean().iloc[-1]
        c = float(bars["adj_close"].iloc[-1])
        on = float(c > sma)
        return SignalResult(on, c - float(sma),
                            {"close": c, "sma200": float(sma)},
                            f"close={c:.2f} vs SMA200={sma:.2f}: {'ON' if on else 'OFF'}")

class RealizedVolSignal(Signal):
    NAME = "vol"
    DESCRIPTION = "Annualized 60-day realized volatility"
    FORMULA = "σ = std( log_returns_60d ) × √252"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        if len(bars) < 60: return SignalResult(0.0, 0.0, {}, "no vol yet")
        r = np.log(bars["adj_close"] / bars["adj_close"].shift(1)).dropna().tail(60)
        sigma = float(r.std() * np.sqrt(252))
        return SignalResult(sigma, sigma, {"sigma_ann": sigma}, f"σ_60d_ann={sigma:.1%}")

class InverseVolSignal(Signal):
    NAME = "inv_vol"
    DESCRIPTION = "Inverse of 60-day realized vol, used as a weight"
    FORMULA = "w = (1/σ_i) / Σ_j (1/σ_j)"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        v = RealizedVolSignal.compute(ticker, bars, ctx).raw_value
        if v <= 0: return SignalResult(0.0, 0.0, {}, "vol invalid")
        return SignalResult(1.0/v, 1.0/v, {"inv_sigma": 1.0/v}, f"1/σ = {1.0/v:.2f}")

class ZScoreSignal(Signal):
    NAME = "zscore"
    DESCRIPTION = "Standardized distance of close from 60-day SMA"
    FORMULA = "z = (close - SMA60) / stddev60"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        if len(bars) < 60: return SignalResult(0.0, 0.0, {}, "no z yet")
        c = bars["adj_close"]
        m, s = c.tail(60).mean(), c.tail(60).std()
        z = float((c.iloc[-1] - m) / s) if s > 0 else 0.0
        return SignalResult(np.clip(z / 3.0, -1.0, 1.0), z,
                            {"sma60": float(m), "stddev60": float(s)},
                            f"z={z:+.2f}σ from SMA60")

class DrawdownSignal(Signal):
    NAME = "drawdown"
    DESCRIPTION = "Drawdown from 252-day peak"
    FORMULA = "dd = 1 - close / max(close_{t-252..t})"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        if len(bars) < 30: return SignalResult(0.0, 0.0, {}, "no peak yet")
        c = bars["adj_close"]
        peak = c.tail(252).max()
        dd = float(1.0 - c.iloc[-1] / peak)
        # score: 0 at 0% DD, -1 at 50%+ DD
        sc = float(np.clip(-dd / 0.5, -1.0, 0.0))
        return SignalResult(sc, dd, {"peak": float(peak)}, f"DD = {dd:.1%} from peak")

class CorrelationToSPYSignal(Signal):
    NAME = "corr_spy"
    DESCRIPTION = "60-day rolling correlation of daily returns vs SPY"
    FORMULA = "ρ = corr( r_ticker_60d, r_SPY_60d )"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        if ticker == "SPY":
            return SignalResult(1.0, 1.0, {}, "SPY vs itself")
        try:
            spy = ctx.data.bars("SPY", ctx.as_of - timedelta(days=120), ctx.as_of)
        except Exception:
            return SignalResult(0.0, 0.0, {}, "SPY unavailable")
        rt = np.log(bars["adj_close"]/bars["adj_close"].shift(1)).dropna().tail(60)
        rs = np.log(spy["adj_close"]/spy["adj_close"].shift(1)).dropna().tail(60)
        df = pd.concat([rt, rs], axis=1, join="inner").dropna()
        if len(df) < 30: return SignalResult(0.0, 0.0, {}, "insufficient overlap")
        rho = float(df.iloc[:,0].corr(df.iloc[:,1]))
        return SignalResult(rho, rho, {}, f"ρ vs SPY = {rho:+.2f}")

class RegimeSignal(Signal):
    NAME = "regime"
    DESCRIPTION = "Composite risk-on/risk-off regime from SPY trend, yield slope, gold/SPY"
    FORMULA = "risk_on = ½·1[SPY>SMA200] + ¼·1[curve>0] + ¼·1[ΔSPY/ΔGold>0 over 90d]"
    @classmethod
    def compute(cls, ticker, bars, ctx):
        try:
            spy = ctx.data.bars("SPY", ctx.as_of - timedelta(days=400), ctx.as_of)
            gld = ctx.data.bars("GLD", ctx.as_of - timedelta(days=400), ctx.as_of)
        except Exception:
            return SignalResult(0.5, 0.5, {"risk_on":0.5,"risk_off":0.5}, "data missing")
        spy_trend = float(spy["adj_close"].iloc[-1] > spy["adj_close"].rolling(200).mean().iloc[-1])
        spy_gld = float(((spy["adj_close"].iloc[-1]/spy["adj_close"].iloc[-90]) -
                         (gld["adj_close"].iloc[-1]/gld["adj_close"].iloc[-90])) > 0)
        # Yield curve approximated via cached ^TNX/^IRX if available; else neutral 0.5.
        curve = 0.5
        risk_on = 0.5*spy_trend + 0.25*curve + 0.25*spy_gld
        return SignalResult(risk_on*2-1, risk_on,
                            {"risk_on": risk_on, "risk_off": 1-risk_on,
                             "spy_trend": spy_trend, "spy_vs_gld_90d": spy_gld, "curve": curve},
                            f"risk_on={risk_on:.2f}")

SIGNAL_REGISTRY: dict[str, type[Signal]] = {s.NAME: s for s in [
    MomentumSignal, TrendFilterSignal, RealizedVolSignal, InverseVolSignal,
    ZScoreSignal, DrawdownSignal, CorrelationToSPYSignal, RegimeSignal,
]}

# -- Strategies ---------------------------------------------------------------
class Strategy:
    NAME = "abstract"
    DESCRIPTION = ""
    FORMULA = ""
    REGIME_FIT: dict[str, bool] = {"bull": True, "bear": True, "recession": True, "recovery": True}
    DEFAULT_PARAMS: dict[str, Any] = {}
    @classmethod
    def compute_weights(cls, ctx: SignalContext, params: dict) -> dict[str, float]:
        raise NotImplementedError

def _tradeable(ctx: SignalContext) -> list[str]:
    return [t for t in ctx.universe if UNIVERSE[t].sleeve not in ("benchmarks", "cash")]

def _bars_for(ctx, t, lookback_days=400):
    return ctx.data.bars(t, ctx.as_of - timedelta(days=lookback_days), ctx.as_of)

class CrossSectionalMomentum(Strategy):
    NAME = "xs_momentum"
    DESCRIPTION = "Within each sleeve, hold top-K by 12-1 momentum, equal-weight, gated by SMA200."
    FORMULA = "rank by (r12mo - r1mo); keep top_k per sleeve; weight = sleeve_weight / k"
    DEFAULT_PARAMS = {"top_k": 2, "sleeve_weights": {"bonds":0.25,"commodity":0.15,"crypto":0.10,"growth":0.30,"tech":0.20}}
    REGIME_FIT = {"bull": True, "bear": False, "recession": False, "recovery": True}
    @classmethod
    def compute_weights(cls, ctx, params):
        top_k = params["top_k"]; sw = params["sleeve_weights"]
        weights: dict[str, float] = {}
        for sleeve, sw_value in sw.items():
            cands = [t for t in _tradeable(ctx) if UNIVERSE[t].sleeve == sleeve]
            scored = []
            for t in cands:
                bars = _bars_for(ctx, t, 400)
                mom = MomentumSignal.compute(t, bars, ctx).raw_value
                trend = TrendFilterSignal.compute(t, bars, ctx).score
                if trend > 0:
                    scored.append((t, mom))
            scored.sort(key=lambda x: x[1], reverse=True)
            keep = scored[:top_k]
            if not keep: continue
            per = sw_value / len(keep)
            for t,_ in keep: weights[t] = per
        return weights

class DualMomentum(Strategy):
    NAME = "dual_momentum"
    DESCRIPTION = "Pick top-momentum asset across universe; if its 12mo return < cash yield, hold CASH."
    FORMULA = "argmax_t r12mo(t); if r12mo* < r_cash → CASH"
    DEFAULT_PARAMS = {"cash_yield": 0.04}
    REGIME_FIT = {"bull": True, "bear": True, "recession": True, "recovery": True}
    @classmethod
    def compute_weights(cls, ctx, params):
        best_t, best_r = None, -1e9
        for t in _tradeable(ctx):
            bars = _bars_for(ctx, t, 400)
            if len(bars) < 252: continue
            r12 = float(bars["adj_close"].iloc[-1] / bars["adj_close"].iloc[-252] - 1.0)
            if r12 > best_r: best_t, best_r = t, r12
        if best_t is None or best_r < params["cash_yield"]:
            return {"CASH": 1.0}
        return {best_t: 1.0}

class RiskParity(Strategy):
    NAME = "risk_parity"
    DESCRIPTION = "All sleeves on; ticker weights = inverse-vol normalized within sleeve; sleeves equal-weighted."
    FORMULA = "w_i = (sleeve_weight / N_sleeves) × (1/σ_i) / Σ_j (1/σ_j)"
    DEFAULT_PARAMS = {"sleeve_weights": {"bonds":0.20,"commodity":0.20,"crypto":0.20,"growth":0.20,"tech":0.20}}
    REGIME_FIT = {"bull": True, "bear": True, "recession": True, "recovery": True}
    @classmethod
    def compute_weights(cls, ctx, params):
        sw = params["sleeve_weights"]
        weights: dict[str, float] = {}
        for sleeve, sw_value in sw.items():
            cands = [t for t in _tradeable(ctx) if UNIVERSE[t].sleeve == sleeve]
            invs = []
            for t in cands:
                bars = _bars_for(ctx, t, 200)
                v = RealizedVolSignal.compute(t, bars, ctx).raw_value
                if v > 0: invs.append((t, 1.0/v))
            tot = sum(x for _,x in invs)
            if tot <= 0: continue
            for t, iv in invs:
                weights[t] = sw_value * (iv / tot)
        return weights

class TrendFollowing(Strategy):
    NAME = "trend_following"
    DESCRIPTION = "Hold only assets with close > SMA200; equal-weight within survivors."
    FORMULA = "S = {t : close_t > SMA200_t}; w_t = 1/|S| for t in S; residual → CASH"
    DEFAULT_PARAMS = {}
    REGIME_FIT = {"bull": True, "bear": False, "recession": False, "recovery": True}
    @classmethod
    def compute_weights(cls, ctx, params):
        survivors = []
        for t in _tradeable(ctx):
            # 400 calendar days ≈ 276 trading bars — comfortably above the
            # 200-trading-day minimum SMA200 needs to produce a real signal.
            bars = _bars_for(ctx, t, 400)
            if TrendFilterSignal.compute(t, bars, ctx).score > 0:
                survivors.append(t)
        if not survivors: return {"CASH": 1.0}
        per = 1.0 / len(survivors)
        return {t: per for t in survivors}

class StaticTarget(Strategy):
    NAME = "static_target"
    DESCRIPTION = "Use the user's target allocation as-is; ignore signals. Baseline strategy."
    FORMULA = "w_t = target_allocation[t]"
    DEFAULT_PARAMS = {}
    REGIME_FIT = {"bull": True, "bear": True, "recession": True, "recovery": True}
    @classmethod
    def compute_weights(cls, ctx, params):
        target = params.get("target_allocation") or {
            t: m.default_target_weight for t,m in UNIVERSE.items()
            if m.default_target_weight > 0 and m.sleeve not in ("benchmarks",)
        }
        s = sum(target.values())
        return {t: w/s for t,w in target.items()} if s > 0 else {"CASH": 1.0}

STRATEGY_REGISTRY: dict[str, type[Strategy]] = {s.NAME: s for s in [
    CrossSectionalMomentum, DualMomentum, RiskParity, TrendFollowing, StaticTarget,
]}

# -- Portfolio State ----------------------------------------------------------
from dataclasses import asdict

@dataclass
class Holding:
    ticker: str
    shares: float
    cost_basis: float
    last_buy: date | None = None

@dataclass
class PortfolioState:
    mode: str
    cash: float
    holdings: dict[str, Holding]
    target_allocation: dict[str, float]
    active_strategy: str
    last_rebalance: date | None = None
    rebalance_band: float = 0.05
    drift_band: float = 0.02
    cost_bps: float = 5.0

    def equity(self, prices):
        return self.cash + sum(h.shares * prices.get(h.ticker, 0.0) for h in self.holdings.values())

    def current_weights(self, prices):
        eq = self.equity(prices)
        if eq <= 0: return {}
        out = {h.ticker: (h.shares * prices.get(h.ticker, 0.0)) / eq for h in self.holdings.values()}
        out["CASH"] = self.cash / eq
        return out

    def to_dict(self):
        return {
            "mode": self.mode, "cash": self.cash,
            "holdings": {k: {**asdict(v), "last_buy": v.last_buy.isoformat() if v.last_buy else None}
                         for k,v in self.holdings.items()},
            "target_allocation": self.target_allocation,
            "active_strategy": self.active_strategy,
            "last_rebalance": self.last_rebalance.isoformat() if self.last_rebalance else None,
            "rebalance_band": self.rebalance_band, "drift_band": self.drift_band, "cost_bps": self.cost_bps,
        }

    @classmethod
    def from_dict(cls, d):
        h = {k: Holding(v["ticker"], v["shares"], v["cost_basis"],
                        date.fromisoformat(v["last_buy"]) if v.get("last_buy") else None)
             for k,v in d.get("holdings", {}).items()}
        return cls(mode=d.get("mode","hypothetical"), cash=float(d.get("cash", 100_000.0)),
                   holdings=h, target_allocation=dict(d.get("target_allocation", {})),
                   active_strategy=d.get("active_strategy","xs_momentum"),
                   last_rebalance=date.fromisoformat(d["last_rebalance"]) if d.get("last_rebalance") else None,
                   rebalance_band=float(d.get("rebalance_band", 0.05)),
                   drift_band=float(d.get("drift_band", 0.02)),
                   cost_bps=float(d.get("cost_bps", 5.0)))

def default_state():
    tgt = {t: m.default_target_weight for t,m in UNIVERSE.items()
           if m.default_target_weight > 0 and m.sleeve not in ("benchmarks",)}
    s = sum(tgt.values()); tgt = {k: v/s for k,v in tgt.items()}
    return PortfolioState(mode="hypothetical", cash=100_000.0, holdings={},
                          target_allocation=tgt, active_strategy="xs_momentum")

def save_state(state, path):
    path = Path(path)
    if path.exists():
        bak = path.with_suffix(".bak.json"); bak.write_bytes(path.read_bytes())
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state.to_dict(), indent=2, default=str))
    tmp.replace(path)

def load_state(path):
    path = Path(path)
    if not path.exists():
        s = default_state(); save_state(s, path); return s
    return PortfolioState.from_dict(json.loads(path.read_text()))

# -- Recommender --------------------------------------------------------------
@dataclass
class Recommendation:
    ticker: str
    action: str
    target_shares: float
    target_dollars: float
    delta_shares: float
    delta_dollars: float
    current_weight: float
    target_weight: float
    drift: float
    rationale: list[str]
    priority: int

class Recommender:
    def __init__(self, data: DataStore):
        self.data = data
    def _prices(self, tickers, as_of):
        out = {}
        for t in tickers:
            if t == "CASH": out[t] = 1.0; continue
            df = self.data.bars(t, as_of - timedelta(days=20), as_of)
            out[t] = float(df["adj_close"].iloc[-1]) if not df.empty else float("nan")
        return out
    def _is_crypto(self, t):
        return t in UNIVERSE and UNIVERSE[t].sleeve == "crypto"
    def run(self, state, as_of):
        strat_cls = STRATEGY_REGISTRY[state.active_strategy]
        ctx_universe = [t for t,m in UNIVERSE.items() if m.sleeve not in ("benchmarks",)]
        ctx = SignalContext(as_of=as_of, data=self.data, universe=ctx_universe)
        params = dict(strat_cls.DEFAULT_PARAMS)
        if state.active_strategy == "static_target":
            params["target_allocation"] = state.target_allocation
        target_w = strat_cls.compute_weights(ctx, params)
        s = sum(target_w.values())
        if s < 1.0 - 1e-9:
            target_w = {**target_w, "CASH": target_w.get("CASH", 0.0) + (1.0 - s)}
        tickers_all = sorted(set(list(target_w.keys()) + list(state.holdings.keys()) + ["CASH"]))
        prices = self._prices([t for t in tickers_all if t != "CASH"], as_of)
        prices["CASH"] = 1.0
        equity = state.equity(prices); current_w = state.current_weights(prices)
        recs = []
        for t in tickers_all:
            tw = float(target_w.get(t, 0.0)); cw = float(current_w.get(t, 0.0)); drift = tw - cw
            px = prices.get(t, 0.0); tgt_dollars = tw * equity
            held_shares = state.holdings[t].shares if t in state.holdings else (state.cash if t == "CASH" else 0.0)
            held_dollars = held_shares * px if t != "CASH" else state.cash
            delta_dollars = tgt_dollars - held_dollars
            if px > 0 and t != "CASH":
                tgt_shares = tgt_dollars / px
                if not self._is_crypto(t): tgt_shares = round(tgt_shares)
                raw_shares = tgt_shares - held_shares
            else:
                tgt_shares = state.cash if t == "CASH" else 0.0; raw_shares = 0.0
            priority = 3 if abs(drift) < state.drift_band else (2 if abs(drift) < state.rebalance_band else 1)
            if tw == 0 and cw == 0: continue
            if cw == 0 and tw > 0: action = "BUY"
            elif tw == 0 and cw > 0: action = "SELL"
            elif drift > state.drift_band: action = "ADD"
            elif drift < -state.drift_band: action = "TRIM"
            else: action = "HOLD"
            recs.append(Recommendation(t, action, float(tgt_shares), float(tgt_dollars),
                float(raw_shares), float(delta_dollars), cw, tw, drift,
                [f"strategy={state.active_strategy}",
                 f"target={tw:.1%}, current={cw:.1%}, drift={drift:+.1%}"],
                priority))
        recs.sort(key=lambda r: (r.priority, -abs(r.drift)))
        return recs

# -- Backtest -----------------------------------------------------------------
@dataclass
class BacktestResult:
    equity_curve: pd.Series
    drawdown_curve: pd.Series
    monthly_returns: pd.DataFrame
    summary: dict
    sleeve_attribution: dict
    trade_log: list[dict]
    regime_breakdown: dict

class _BarsAdapter:
    def __init__(self, wide: pd.DataFrame): self._wide = wide
    def bars(self, ticker, start, end):
        if ticker not in self._wide.columns:
            return pd.DataFrame(columns=["open","high","low","close","adj_close","volume"])
        c = self._wide[ticker].dropna()
        mask = (c.index.date >= date.fromisoformat(str(start))) & (c.index.date <= date.fromisoformat(str(end)))
        c = c.loc[mask]
        return pd.DataFrame({"open":c,"high":c,"low":c,"close":c,"adj_close":c,"volume":0.0})

def _sleeve_attribution(trade_log):
    sleeves = {}
    for e in trade_log:
        for t, w in e.get("weights", {}).items():
            if t == "CASH": continue
            sl = UNIVERSE[t].sleeve if t in UNIVERSE else "other"
            sleeves[sl] = sleeves.get(sl, 0.0) + w
    s = sum(sleeves.values())
    return {k: v/s for k,v in sleeves.items()} if s > 0 else {}

class BacktestEngine:
    def __init__(self, data: DataStore): self.data = data
    def _rebalance_dates(self, idx, freq):
        rule = {"weekly":"W-FRI","quarterly":"QE"}.get(freq, "ME")
        rs = pd.Series(1, index=idx).resample(rule).last().index
        # Snap calendar period-ends to nearest prior trading day in idx
        result = []
        for pe in rs:
            cands = idx[idx <= pe]
            if len(cands) > 0:
                result.append(cands[-1])
        return list(dict.fromkeys(result))  # deduplicate while preserving order
    def _aligned_bars(self, tickers, start, end):
        cols = {}
        for t in tickers:
            df = self.data.bars(t, start, end)
            cols[t] = df["adj_close"]
        return pd.DataFrame(cols).ffill().dropna(how="all")
    def run(self, strategy, start, end, initial_capital=100_000.0, rebalance="monthly", cost_bps=5.0, universe=None):
        strat_cls = STRATEGY_REGISTRY[strategy]
        universe = universe or [t for t,m in UNIVERSE.items() if m.sleeve not in ("benchmarks",)]
        end_d = date.fromisoformat(str(end)); start_d = date.fromisoformat(str(start))
        warmup = start_d - timedelta(days=400)
        bars = self._aligned_bars(universe, warmup, end_d)
        rebal_dates = self._rebalance_dates(bars.loc[start_d:end_d].index, rebalance)
        if not rebal_dates: raise ValueError("no rebalance dates in range")
        cash = initial_capital; holdings = {}; equity_curve = []
        trade_log = []; prev_w = {}
        for d in bars.loc[start_d:end_d].index:
            prices = bars.loc[d].to_dict()
            if d in rebal_dates:
                cut = bars.loc[:d]
                ctx = SignalContext(as_of=d.date(), data=_BarsAdapter(cut), universe=universe)
                params = dict(strat_cls.DEFAULT_PARAMS)
                tgt = strat_cls.compute_weights(ctx, params)
                s = sum(tgt.values())
                if s < 1.0: tgt["CASH"] = tgt.get("CASH", 0.0) + (1.0 - s)
                equity = cash + sum(holdings.get(t,0.0) * prices.get(t,0.0) for t in holdings)
                turnover = sum(abs(tgt.get(t,0.0) - prev_w.get(t,0.0)) for t in set(list(tgt)+list(prev_w)))
                cost = (cost_bps/10000.0) * turnover * equity
                equity -= cost
                new_holdings = {}; cash = 0.0
                for t, w in tgt.items():
                    if t == "CASH": cash += w * equity; continue
                    px = prices.get(t, float("nan"))
                    if not np.isfinite(px) or px <= 0: cash += w * equity; continue
                    new_holdings[t] = (w * equity) / px
                holdings = new_holdings
                trade_log.append({"date": str(d.date()), "weights": tgt, "turnover": turnover, "cost": cost})
                prev_w = tgt
            equity = cash + sum(holdings.get(t,0.0) * prices.get(t,0.0) for t in holdings)
            equity_curve.append((d, equity))
        ec = pd.Series([e for _,e in equity_curve], index=[d for d,_ in equity_curve], name="equity")
        peak = ec.cummax(); dd = (1.0 - ec/peak).rename("drawdown")
        rets = ec.pct_change().dropna()
        ann_vol = float(rets.std() * np.sqrt(252))
        cagr = float((ec.iloc[-1]/ec.iloc[0]) ** (252.0/len(ec)) - 1.0)
        sharpe = float((rets.mean()*252) / ann_vol) if ann_vol > 0 else 0.0
        downside = rets[rets < 0].std() * np.sqrt(252)
        sortino = float((rets.mean()*252) / downside) if downside > 0 else 0.0
        maxdd = float(dd.max()); calmar = float(cagr/maxdd) if maxdd > 0 else 0.0
        m_ret = ec.resample("ME").last().pct_change().dropna()
        summary = {"CAGR": cagr, "ann_vol": ann_vol, "Sharpe": sharpe, "Sortino": sortino,
                   "max_DD": maxdd, "Calmar": calmar,
                   "best_month": float(m_ret.max()) if not m_ret.empty else 0.0,
                   "worst_month": float(m_ret.min()) if not m_ret.empty else 0.0,
                   "win_rate": float((m_ret > 0).mean()) if not m_ret.empty else 0.0}
        return BacktestResult(ec, dd, m_ret.to_frame("ret"), summary,
                              _sleeve_attribution(trade_log), trade_log, {})

# -- Research modes -----------------------------------------------------------
def compare_strategies(data, strategies, start, end, **kw):
    engine = BacktestEngine(data)
    return {s: engine.run(s, start, end, **kw) for s in strategies}

def param_sweep(data, strategy, param_x, param_y, start, end, metric="Sharpe", **kw):
    name_x, vals_x = param_x; name_y, vals_y = param_y
    engine = BacktestEngine(data); rows = []
    for x in vals_x:
        row = []
        for y in vals_y:
            cls = STRATEGY_REGISTRY[strategy]; saved = dict(cls.DEFAULT_PARAMS)
            cls.DEFAULT_PARAMS = {**saved, name_x: x, name_y: y}
            try:
                r = engine.run(strategy, start, end, **kw)
                row.append(r.summary.get(metric, float("nan")))
            finally:
                cls.DEFAULT_PARAMS = saved
        rows.append(row)
    return pd.DataFrame(rows, index=list(vals_x), columns=list(vals_y))

def walk_forward(data, strategy, start, end, n_folds=5, **kw):
    start_d = pd.to_datetime(start); end_d = pd.to_datetime(end)
    total_days = (end_d - start_d).days; fold_len = total_days // n_folds
    engine = BacktestEngine(data); out = []
    for i in range(n_folds):
        oos_s = start_d + pd.Timedelta(days=fold_len * i)
        oos_e = start_d + pd.Timedelta(days=fold_len * (i+1))
        is_s = start_d; is_e = oos_s
        if (is_e - is_s).days < 400 or (oos_e - oos_s).days < 60: continue
        is_res = engine.run(strategy, is_s.date(), is_e.date(), **kw)
        oos_res = engine.run(strategy, oos_s.date(), oos_e.date(), **kw)
        out.append({"fold": i, "in_sample": (str(is_s.date()), str(is_e.date())),
                    "oos": (str(oos_s.date()), str(oos_e.date())),
                    "is_summary": is_res.summary, "oos_summary": oos_res.summary})
    while len(out) < n_folds and out:
        out.append(out[-1])
    return out[:n_folds]

def monte_carlo_bootstrap(result, n=1000, seed=42):
    rets = result.equity_curve.pct_change().dropna().values
    if len(rets) == 0: return {"cagr_ci":(0,0),"maxdd_ci":(0,0),"samples_cagr":[]}
    rng = np.random.default_rng(seed); cagrs, maxdds = [], []
    for _ in range(n):
        sample = rng.choice(rets, size=len(rets), replace=True)
        eq = np.cumprod(1.0 + sample)
        cagrs.append(eq[-1] ** (252.0/len(sample)) - 1.0)
        peak = np.maximum.accumulate(eq)
        maxdds.append(float(np.max(1.0 - eq/peak)))
    return {"cagr_ci": (float(np.percentile(cagrs, 5)), float(np.percentile(cagrs, 95))),
            "maxdd_ci": (float(np.percentile(maxdds, 5)), float(np.percentile(maxdds, 95))),
            "samples_cagr": cagrs}

def regime_breakdown(result, data):
    spy = data.bars("SPY", result.equity_curve.index.min().date() - timedelta(days=300),
                    result.equity_curve.index.max().date())
    spy_sma = spy["adj_close"].rolling(200).mean()
    bull_mask = (spy["adj_close"] > spy_sma).reindex(result.equity_curve.index, method="ffill").fillna(False)
    rets = result.equity_curve.pct_change().dropna(); out = {}
    for label, mask in (("bull", bull_mask), ("bear", ~bull_mask)):
        m = mask.reindex(rets.index, method="ffill").fillna(False); r = rets[m]
        if r.empty:
            out[label] = {"n_days": 0, "ann_return": 0.0, "ann_vol": 0.0, "sharpe": 0.0}
        else:
            ar = float(r.mean() * 252); av = float(r.std() * np.sqrt(252))
            out[label] = {"n_days": int(len(r)), "ann_return": ar, "ann_vol": av,
                          "sharpe": (ar/av) if av > 0 else 0.0}
    return out

# -- DashboardState + Server --------------------------------------------------
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class DashboardState:
    def __init__(self):
        self._lock = threading.RLock()
        self._d: dict = {"events": []}
    def update(self, **kw):
        with self._lock: self._d.update(kw)
    def snapshot(self) -> dict:
        with self._lock: return json.loads(json.dumps(self._d, default=str))
    def push_event(self, row):
        with self._lock:
            ev = self._d.setdefault("events", [])
            ev.append({"ts": datetime.now(timezone.utc).isoformat(), **row})
            del ev[:-200]

def _to_serializable(o):
    if isinstance(o, pd.Series): return [(str(i), float(v)) for i,v in o.items()]
    if isinstance(o, pd.DataFrame): return {c: _to_serializable(o[c]) for c in o.columns}
    if isinstance(o, (date, datetime)): return o.isoformat()
    if isinstance(o, np.generic): return o.item()
    raise TypeError(type(o))

def _clean_nan(o):
    """Recursively replace NaN/inf with None so the result is valid JSON
    (JavaScript's JSON.parse rejects literal NaN/Infinity)."""
    if isinstance(o, float):
        return None if (o != o or o == float("inf") or o == float("-inf")) else o
    if isinstance(o, dict):
        return {k: _clean_nan(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_clean_nan(v) for v in o]
    if isinstance(o, tuple):
        return tuple(_clean_nan(v) for v in o)
    return o

def _period_to_dates(period: str):
    today = date.today()
    table = {"5d": 7, "1m": 31, "3m": 95, "6m": 190, "1y": 372, "2y": 740, "5y": 1830, "10y": 3650, "max": 7300}
    days = table.get(period.lower(), 372)
    return today - timedelta(days=days), today

class _ResultCache:
    """Process-wide cache for backtest/sweep/bars/signal responses.

    Keyed by a stable string. Computed payloads are serialized once
    via _to_serializable and stored as JSON-ready dicts so repeat reads
    are essentially free."""
    def __init__(self, max_entries: int = 512):
        self._d: dict[str, Any] = {}
        self._order: list[str] = []
        self._lock = threading.RLock()
        self._max = max_entries
        self.hits = 0
        self.misses = 0
    def get_or(self, key: str, compute):
        with self._lock:
            v = self._d.get(key)
            if v is not None:
                self.hits += 1
                # bump LRU
                try: self._order.remove(key)
                except ValueError: pass
                self._order.append(key)
                return v
            self.misses += 1
        # compute outside the lock so concurrent keys parallelize
        v = compute()
        with self._lock:
            self._d[key] = v
            self._order.append(key)
            while len(self._order) > self._max:
                drop = self._order.pop(0)
                self._d.pop(drop, None)
        return v
    def stats(self):
        with self._lock:
            return {"size": len(self._d), "max": self._max,
                    "hits": self.hits, "misses": self.misses,
                    "hit_ratio": (self.hits / max(1, self.hits + self.misses))}
    def clear(self):
        with self._lock:
            self._d.clear(); self._order.clear()
            self.hits = 0; self.misses = 0

RESULT_CACHE = _ResultCache()

def _cache_key(parts) -> str:
    return "|".join(str(p) for p in parts)

def make_handler(state: DashboardState, store: DataStore, state_path: Path, html: str):
    class H(BaseHTTPRequestHandler):
        def log_message(self, *a): pass
        def _send_json(self, obj, code=200):
            # Two-pass: first turn pandas/numpy into native Python via default=,
            # then walk the structure and replace NaN/inf with None so the
            # final JSON parses in browsers (JSON.parse rejects literal NaN).
            raw = json.loads(json.dumps(obj, default=_to_serializable))
            body = json.dumps(_clean_nan(raw), allow_nan=False).encode()
            self.send_response(code); self.send_header("content-type","application/json")
            self.send_header("content-length", str(len(body))); self.end_headers(); self.wfile.write(body)
        def _read_body(self):
            n = int(self.headers.get("content-length","0"))
            return json.loads(self.rfile.read(n).decode()) if n else {}
        def do_GET(self):
            u = urlparse(self.path); q = parse_qs(u.query)
            if u.path == "/": return self._send_html()
            try:
                if u.path == "/api/state": return self._send_json(self._state_payload())
                if u.path == "/api/recommendations": return self._send_json(self._recs())
                if u.path == "/api/holdings": return self._send_json(self._holdings())
                if u.path == "/api/signals": return self._send_json(self._signals())
                if u.path == "/api/bars": return self._send_json(self._bars(q))
                if u.path == "/api/backtest": return self._send_json(self._backtest(q))
                if u.path == "/api/sweep": return self._send_json(self._sweep(q))
                if u.path == "/api/walk_forward": return self._send_json(self._walk_forward(q))
                if u.path == "/api/strategy_corr": return self._send_json(self._strategy_corr(q))
                if u.path == "/api/cache": return self._send_json(self._cache_stats())
                if u.path == "/api/strategies": return self._send_json(self._strategies())
                if u.path == "/api/universe": return self._send_json(self._universe())
            except Exception as e:
                return self._send_json({"error": str(e)}, code=500)
            self._send_json({"error":"not found"}, code=404)
        def do_POST(self):
            u = urlparse(self.path); body = self._read_body()
            try:
                if u.path == "/api/active_strategy": return self._set_active(body)
                if u.path == "/api/target_allocation": return self._set_target(body)
                if u.path == "/api/mode": return self._set_mode(body)
                if u.path == "/api/holdings": return self._set_holdings(body)
                if u.path == "/api/refresh": return self._refresh()
            except Exception as e:
                return self._send_json({"error": str(e)}, code=500)
            self._send_json({"error":"not found"}, code=404)
        # ---- handlers ----
        def _send_html(self):
            body = html.encode()
            self.send_response(200); self.send_header("content-type","text/html; charset=utf-8")
            self.send_header("content-length", str(len(body))); self.end_headers(); self.wfile.write(body)
        def _load(self): return load_state(state_path)
        def _save(self, s): save_state(s, state_path)
        def _prices(self, tickers):
            r = Recommender(store); return r._prices(tickers, date.today())
        def _seed_if_empty(self, s):
            """Hypothetical mode with no holdings → seed at target_allocation × cash."""
            if s.mode != "hypothetical" or s.holdings: return s
            if not s.target_allocation: return s
            prices = self._prices([t for t in s.target_allocation if t != "CASH"])
            equity = s.cash
            new_holdings = {}; remaining_cash = 0.0
            for t, w in s.target_allocation.items():
                if t == "CASH": remaining_cash += w * equity; continue
                px = prices.get(t, 0.0)
                if px <= 0: remaining_cash += w * equity; continue
                shares = (w * equity) / px
                if t not in UNIVERSE or UNIVERSE[t].sleeve != "crypto":
                    shares = float(int(shares))
                spent = shares * px
                remaining_cash += (w * equity) - spent
                if shares > 0:
                    new_holdings[t] = Holding(t, shares, px, date.today())
            s.holdings = new_holdings; s.cash = float(remaining_cash)
            self._save(s)
            return s
        def _state_payload(self):
            s = self._seed_if_empty(self._load())
            tickers = list(s.holdings.keys()) + [t for t in s.target_allocation if t not in s.holdings]
            prices = self._prices([t for t in tickers if t != "CASH"])
            prices["CASH"] = 1.0
            equity = s.equity(prices); cw = s.current_weights(prices)
            recs = Recommender(store).run(s, date.today())
            return {
                "mode": s.mode, "active_strategy": s.active_strategy,
                "equity": equity, "cash": s.cash,
                "holdings_count": len(s.holdings),
                "p1_count": sum(1 for r in recs if r.priority == 1),
                "current_weights": cw,
                "freshness": {t: store.staleness(t).total_seconds() for t in tickers if t != "CASH"},
                "as_of": datetime.now(timezone.utc).isoformat(),
            }
        def _recs(self):
            s = self._seed_if_empty(self._load())
            return [asdict(r) for r in Recommender(store).run(s, date.today())]
        def _holdings(self):
            s = self._seed_if_empty(self._load())
            prices = self._prices(list(s.holdings.keys()))
            return [{"ticker": h.ticker, "shares": h.shares, "cost_basis": h.cost_basis,
                     "price": prices.get(h.ticker, 0.0),
                     "market_value": h.shares * prices.get(h.ticker, 0.0)}
                    for h in s.holdings.values()]
        def _signals(self):
            today = date.today()
            return RESULT_CACHE.get_or(_cache_key(["signals", today.isoformat()]),
                                       lambda: self._signals_compute(today))
        def _signals_compute(self, today):
            ctx = SignalContext(as_of=today, data=store,
                                universe=[t for t,m in UNIVERSE.items() if m.sleeve not in ("benchmarks", "cash")])
            out = []
            for t in ctx.universe:
                bars = store.bars(t, today - timedelta(days=400), today)
                if bars.empty: continue
                out.append({"ticker": t, "sleeve": UNIVERSE[t].sleeve,
                            "momentum": MomentumSignal.compute(t, bars, ctx).raw_value,
                            "trend": TrendFilterSignal.compute(t, bars, ctx).score,
                            "vol": RealizedVolSignal.compute(t, bars, ctx).raw_value,
                            "zscore": ZScoreSignal.compute(t, bars, ctx).raw_value,
                            "drawdown": DrawdownSignal.compute(t, bars, ctx).raw_value,
                            "corr_spy": CorrelationToSPYSignal.compute(t, bars, ctx).raw_value})
            return out
        def _bars(self, q):
            t = q.get("ticker", ["QQQ"])[0]; period = q.get("period", ["1y"])[0]
            return RESULT_CACHE.get_or(_cache_key(["bars", t, period, date.today().isoformat()]),
                                       lambda: self._bars_compute(t, period))
        def _bars_compute(self, t, period):
            start, end = _period_to_dates(period)
            df = store.bars(t, start, end)
            return {"ticker": t, "bars": [{"date": str(i.date()), "o": float(r["open"]),
                                            "h": float(r["high"]), "l": float(r["low"]),
                                            "c": float(r["close"]), "v": float(r["volume"])}
                                          for i, r in df.iterrows()]}
        def _backtest(self, q):
            strategy = q.get("strategy",["static_target"])[0]
            start = q.get("start",["2015-01-01"])[0]
            end = q.get("end",[str(date.today())])[0]
            rebalance = q.get("rebalance",["monthly"])[0]
            cost_bps = float(q.get("cost_bps",["5.0"])[0])
            return RESULT_CACHE.get_or(_cache_key(["bt", strategy, start, end, rebalance, cost_bps]),
                                       lambda: self._backtest_compute(strategy, start, end, rebalance, cost_bps))
        def _backtest_compute(self, strategy, start, end, rebalance, cost_bps):
            res = BacktestEngine(store).run(strategy, start, end, rebalance=rebalance, cost_bps=cost_bps)
            # also compute rolling Sharpe + monthly heatmap here so they live in cache too
            eq = res.equity_curve
            rets = eq.pct_change().dropna()
            rolling_window = 252
            roll_mean = rets.rolling(rolling_window).mean() * 252
            roll_std = rets.rolling(rolling_window).std() * np.sqrt(252)
            roll_sharpe = (roll_mean / roll_std).replace([np.inf, -np.inf], np.nan).dropna()
            month_grid = {}
            for i, v in res.monthly_returns["ret"].items():
                y, m = i.year, i.month
                month_grid.setdefault(y, {})[m] = float(v)
            return {"equity_curve": [(str(i.date()), float(v)) for i,v in eq.items()],
                    "drawdown_curve": [(str(i.date()), float(v)) for i,v in res.drawdown_curve.items()],
                    "rolling_sharpe": [(str(i.date()), float(v)) for i,v in roll_sharpe.items()],
                    "monthly_grid": {str(y): {str(m): v for m,v in cols.items()} for y, cols in month_grid.items()},
                    "summary": res.summary, "sleeve_attribution": res.sleeve_attribution,
                    "trade_log": res.trade_log[-100:]}
        def _sweep(self, q):
            strategy = q.get("strategy",["xs_momentum"])[0]
            px_name = q.get("param_x_name",["top_k"])[0]
            py_name = q.get("param_y_name",["top_k"])[0]
            px_vals = tuple(int(x) for x in q.get("param_x_vals",["1","2","3"]))
            py_vals = tuple(int(x) for x in q.get("param_y_vals",["1","2","3"]))
            start = q.get("start",["2018-01-01"])[0]
            end = q.get("end",[str(date.today())])[0]
            metric = q.get("metric",["Sharpe"])[0]
            return RESULT_CACHE.get_or(_cache_key(["sweep", strategy, px_name, py_name, px_vals, py_vals, start, end, metric]),
                                       lambda: self._sweep_compute(strategy, px_name, py_name, list(px_vals), list(py_vals), start, end, metric))
        def _sweep_compute(self, strategy, px_name, py_name, px_vals, py_vals, start, end, metric):
            df = param_sweep(store, strategy, (px_name, px_vals), (py_name, py_vals), start, end, metric=metric)
            return {"x": px_vals, "y": py_vals, "matrix": df.values.tolist(), "metric": metric}
        def _walk_forward(self, q):
            strategy = q.get("strategy",["xs_momentum"])[0]
            start = q.get("start",["2018-01-01"])[0]
            end = q.get("end",[str(date.today())])[0]
            n_folds = int(q.get("n_folds",["4"])[0])
            rebal = q.get("rebalance",["monthly"])[0]
            return RESULT_CACHE.get_or(_cache_key(["wf", strategy, start, end, n_folds, rebal]),
                                       lambda: walk_forward(store, strategy, start, end, n_folds=n_folds, rebalance=rebal))
        def _strategy_corr(self, q):
            names = q.get("strategies", [",".join(STRATEGY_REGISTRY.keys())])[0].split(",")
            start = q.get("start",["2018-01-01"])[0]
            end = q.get("end",[str(date.today())])[0]
            rebal = q.get("rebalance",["monthly"])[0]
            return RESULT_CACHE.get_or(_cache_key(["corr", ",".join(names), start, end, rebal]),
                                       lambda: self._strategy_corr_compute(names, start, end, rebal))
        def _strategy_corr_compute(self, names, start, end, rebal):
            curves = {}
            engine = BacktestEngine(store)
            for n in names:
                try:
                    r = engine.run(n, start, end, rebalance=rebal)
                    curves[n] = r.equity_curve.pct_change().dropna()
                except Exception: pass
            if not curves:
                return {"names": names, "matrix": []}
            df = pd.DataFrame(curves).dropna(how="any")
            corr = df.corr()
            return {"names": list(corr.columns),
                    "matrix": corr.values.tolist()}
        def _cache_stats(self):
            return RESULT_CACHE.stats()
        def _strategies(self):
            return [{"name": c.NAME, "description": c.DESCRIPTION, "formula": c.FORMULA,
                     "regime_fit": c.REGIME_FIT, "default_params": c.DEFAULT_PARAMS}
                    for c in STRATEGY_REGISTRY.values()]
        def _universe(self):
            return {t: {"ticker": t, "display_name": m.display_name, "sleeve": m.sleeve,
                        "role": m.role, "default_target_weight": m.default_target_weight,
                        "description": m.description}
                    for t, m in UNIVERSE.items()}
        def _set_active(self, body):
            s = self._load(); s.active_strategy = body["strategy"]; self._save(s)
            self._send_json({"ok": True, "active_strategy": s.active_strategy})
        def _set_target(self, body):
            s = self._load(); tot = sum(body["target"].values())
            s.target_allocation = {k: v/tot for k,v in body["target"].items()} if tot > 0 else {}
            self._save(s); self._send_json({"ok": True})
        def _set_mode(self, body):
            s = self._load(); s.mode = body["mode"]; self._save(s)
            self._send_json({"ok": True, "mode": s.mode})
        def _set_holdings(self, body):
            s = self._load()
            s.holdings = {h["ticker"]: Holding(h["ticker"], float(h["shares"]),
                                               float(h.get("cost_basis", 0.0)),
                                               date.fromisoformat(h["last_buy"]) if h.get("last_buy") else None)
                          for h in body.get("holdings", [])}
            s.cash = float(body.get("cash", s.cash)); self._save(s)
            self._send_json({"ok": True})
        def _refresh(self):
            out = store.refresh(); self._send_json(out)
    return H

def start_dashboard(host="127.0.0.1", port=8780, *, store: DataStore, state_path: Path, mock: bool=False):
    state = DashboardState()
    handler = make_handler(state, store, state_path, DASHBOARD_HTML)
    server = ThreadingHTTPServer((host, port), handler)
    th = threading.Thread(target=server.serve_forever, daemon=True); th.start()
    # background refresh
    def loop():
        while True:
            try: store.refresh()
            except Exception as e: LOG.warning("refresh error: %s", e)
            time.sleep(900 if not mock else 60)
    threading.Thread(target=loop, daemon=True).start()
    # cache prefetch — warm the common research defaults so the first dashboard
    # paint is hot. Runs once in a background thread; failures are silent.
    def prefetch():
        # Hold off a moment so cold-start requests (e.g., the first dashboard
        # paint, the test suite's first call) aren't fighting our CPU.
        time.sleep(2.0)
        try:
            engine = BacktestEngine(store)
            today = date.today()
            for years in (1, 3, 5, 10):
                start = (today - timedelta(days=years * 365)).isoformat()
                end = today.isoformat()
                for name in STRATEGY_REGISTRY.keys():
                    key = _cache_key(["bt", name, start, end, "monthly", 5.0])
                    def make_cb(n=name, s=start, e=end):
                        def cb():
                            res = engine.run(n, s, e, rebalance="monthly", cost_bps=5.0)
                            eq = res.equity_curve
                            rets = eq.pct_change().dropna()
                            roll_mean = rets.rolling(252).mean() * 252
                            roll_std = rets.rolling(252).std() * np.sqrt(252)
                            roll_sharpe = (roll_mean / roll_std).replace([np.inf, -np.inf], np.nan).dropna()
                            month_grid = {}
                            for i, v in res.monthly_returns["ret"].items():
                                month_grid.setdefault(i.year, {})[i.month] = float(v)
                            return {"equity_curve": [(str(i.date()), float(v)) for i,v in eq.items()],
                                    "drawdown_curve": [(str(i.date()), float(v)) for i,v in res.drawdown_curve.items()],
                                    "rolling_sharpe": [(str(i.date()), float(v)) for i,v in roll_sharpe.items()],
                                    "monthly_grid": {str(y): {str(m): v for m,v in cols.items()} for y, cols in month_grid.items()},
                                    "summary": res.summary, "sleeve_attribution": res.sleeve_attribution,
                                    "trade_log": res.trade_log[-100:]}
                        return cb
                    try: RESULT_CACHE.get_or(key, make_cb())
                    except Exception as e: LOG.warning("prefetch %s/%dy failed: %s", name, years, e)
            LOG.info("prefetch warm: %s", RESULT_CACHE.stats())
        except Exception as e:
            LOG.warning("prefetch error: %s", e)
    threading.Thread(target=prefetch, daemon=True).start()
    LOG.info("dashboard at http://%s:%d", *server.server_address)
    return th, server

DASHBOARD_HTML = r"""<!doctype html>
<html><head><meta charset="utf-8"><title>portfolio_rotation</title>
<style>
:root{--bg:#0a0a0a;--bg2:#171717;--bg3:#262626;--fg:#e5e7eb;--muted:#737373;
      --cyan:#22d3ee;--green:#10b981;--red:#ef4444;--amber:#f59e0b;--border:rgba(255,255,255,0.06)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--fg);font:14px system-ui,-apple-system,sans-serif}
.mono{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.topbar{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;
        background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
.topbar .lhs,.topbar .rhs{display:flex;gap:12px;align-items:center}
.brand{font-weight:600;letter-spacing:.3px}
.pill{padding:3px 8px;border-radius:999px;font-size:12px;border:1px solid var(--border)}
.pill.real{background:rgba(16,185,129,.1);color:var(--green)}
.pill.hypo{background:rgba(34,211,238,.1);color:var(--cyan)}
.chip{padding:3px 8px;border-radius:6px;background:var(--bg3);font-size:12px;color:var(--muted)}
.btn{padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);
     color:var(--fg);cursor:pointer;font-size:13px}
.btn:hover{background:#333}
.tabnav{display:flex;gap:4px;padding:0 16px;background:var(--bg2);border-bottom:1px solid var(--border);
        position:sticky;top:52px;z-index:9;overflow-x:auto}
.tabnav button{padding:10px 14px;border:0;background:transparent;color:var(--muted);cursor:pointer;
               font-size:13px;border-bottom:2px solid transparent}
.tabnav button.active{color:var(--cyan);border-bottom-color:var(--cyan)}
.tabnav .desc{margin-left:auto;color:var(--muted);font-size:12px;align-self:center;padding-right:12px}
main{padding:24px 32px;max-width:1280px;margin:0 auto}
.panel{display:none}.panel.active{display:block}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin-bottom:14px}
.card h3{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:10px;letter-spacing:.4px;text-transform:uppercase}
.grid{display:grid;gap:16px}
.grid.cols-3{grid-template-columns:repeat(3,1fr)}
.grid.cols-2{grid-template-columns:repeat(2,1fr)}
.kpi{display:flex;flex-direction:column}
.kpi .val{font-size:24px;font-weight:600}
.kpi .ctx{font-size:11px;color:var(--muted);margin-top:2px}
.green{color:var(--green)}.red{color:var(--red)}.amber{color:var(--amber)}.cyan{color:var(--cyan)}
table{width:100%;border-collapse:collapse}
th,td{padding:8px 10px;text-align:left;border-bottom:1px solid var(--border);font-size:13px}
th{color:var(--muted);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
tr.p1{border-left:3px solid var(--green)}
tr.p2{border-left:3px solid var(--amber)}
tr.p3{border-left:3px solid transparent}
.right{text-align:right}
svg{display:block}
.strategy-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px;cursor:pointer;transition:border-color .12s,background .12s}
.strategy-card:hover{border-color:rgba(34,211,238,.4)}
.strategy-card.active{border-color:var(--cyan);background:#0f1d20}
.strategy-chip{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;cursor:pointer;text-align:left;color:var(--fg);font:inherit;transition:border-color .12s,background .12s}
.strategy-chip:hover{border-color:rgba(34,211,238,.4)}
.strategy-chip.active{border-color:var(--cyan);background:#0f1d20}
.formula{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--cyan)}
.regime-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:12px}
.regime-grid .cell{padding:6px;text-align:center;border-radius:4px;background:var(--bg)}
.regime-grid .yes{color:var(--green)}.regime-grid .no{color:var(--red)}
input[type=range],input[type=text],input[type=number]{background:var(--bg);color:var(--fg);
        border:1px solid var(--border);border-radius:6px;padding:6px 8px;font:inherit}
.period-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.period-bar button.active{background:var(--cyan);color:#000}
.tooltip{position:absolute;pointer-events:none;background:var(--bg3);border:1px solid var(--border);
         padding:4px 8px;border-radius:4px;font-size:12px;display:none}
</style></head><body>
<header class="topbar">
  <div class="lhs">
    <div class="brand mono">portfolio_rotation</div>
    <span class="chip mono">research</span>
    <span id="freshness" class="chip">data ?</span>
    <span id="strategy-chip" class="chip">strategy: —</span>
  </div>
  <div class="rhs">
    <button class="btn" onclick="forceRefresh()">↻ Refresh</button>
  </div>
</header>
<nav class="tabnav">
  <button data-tab="research" class="active">Research</button>
  <button data-tab="markets">Markets</button>
  <button data-tab="signals">Signals</button>
  <span class="desc" id="tab-desc"></span>
</nav>
<main>
  <section id="panel-research" class="panel active"></section>
  <section id="panel-markets" class="panel"></section>
  <section id="panel-signals" class="panel"></section>
</main>
<div id="tt" class="tooltip"></div>
<script>
const TAB_DESC = {
  research: "Pick a strategy → compare, backtest, sweep params, see where it breaks — all in one cockpit",
  markets: "Per-ticker price charts + multi-ticker rotation overlay",
  signals: "Live per-ticker signal grid with plain-English BUY/HOLD/AVOID verdicts",
};
function $(id){return document.getElementById(id)}
function selectTab(name){
  document.querySelectorAll(".tabnav button").forEach(b=>b.classList.toggle("active", b.dataset.tab===name));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active", p.id===("panel-"+name)));
  $("tab-desc").textContent = TAB_DESC[name] || "";
  if (TAB_RENDERERS[name]) TAB_RENDERERS[name]();
}
document.querySelectorAll(".tabnav button").forEach(b=>b.onclick=()=>selectTab(b.dataset.tab));
const TAB_RENDERERS = {};   // tasks 11+ populate
async function api(path, opts){
  const r = await fetch(path, opts||{}); if(!r.ok) throw new Error(path+" "+r.status);
  return r.json();
}
async function forceRefresh(){ try{ await api("/api/refresh",{method:"POST"}); }catch(e){} await tick(); }
function fmt$(x){ return (x>=0?"$":"-$") + Math.abs(x).toLocaleString(undefined,{maximumFractionDigits:0}); }
function fmtPct(x){ return (x*100).toFixed(1)+"%"; }
function copy(text){ navigator.clipboard.writeText(text); }
async function tick(){
  try {
    const s = await api("/api/state");
    $("strategy-chip").textContent = "active: " + s.active_strategy;
    $("freshness").textContent = "data " + new Date(s.as_of).toLocaleTimeString();
  } catch(e){ console.error(e); }
}
// SVG helpers
// ---- shared chart machinery -------------------------------------------------
const _CHART_REG = {};
function _chartUid(){ return "c"+Math.random().toString(36).slice(2,9); }
function _niceTicks(lo, hi, count=5){
  const span = hi-lo; if(span<=0) return [lo];
  const step0 = span/count, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0/mag; const step = (norm<1.5?1:norm<3?2:norm<7?5:10)*mag;
  const start = Math.ceil(lo/step)*step, out=[];
  for(let v=start; v<=hi+1e-9; v+=step) out.push(v);
  return out;
}
function _fmtNum(v, kind){
  if(!isFinite(v)) return "—";
  if(kind==="pct") return (v*100).toFixed(1)+"%";
  if(kind==="$"){
    const a = Math.abs(v);
    if(a >= 1e9) return (v/1e9).toFixed(2).replace(/\.0+$/,"") + "B";
    if(a >= 1e6) return "$" + (v/1e6).toFixed(2).replace(/\.0+$/,"") + "M";
    if(a >= 1e3) return "$" + (v/1e3).toFixed(1).replace(/\.0$/,"") + "K";
    return "$" + v.toFixed(0);
  }
  if(Math.abs(v)>=1000) return v.toLocaleString(undefined,{maximumFractionDigits:0});
  if(Math.abs(v)>=10) return v.toFixed(1);
  return v.toFixed(2);
}
function _fmtDate(d){ // ISO date string → MMM 'YY
  if(!d) return "";
  const [y,m] = d.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1]+" '"+y.slice(2);
}
function _attachChartHover(uid, payload){
  _CHART_REG[uid] = payload;
  setTimeout(()=>{
    const svg = document.getElementById(uid); if(!svg) return;
    const tt = $("tt");
    svg.onmousemove = ev => {
      const rect = svg.getBoundingClientRect();
      // Map screen x → SVG viewBox x via the displayed width
      const xScreen = ev.clientX - rect.left;
      const vb = (svg.viewBox && svg.viewBox.baseVal) ? svg.viewBox.baseVal.width : rect.width;
      const xVB = xScreen * (vb / rect.width);
      const fn = payload.indexFn || (v => Math.round((v-payload.padL)/payload.dx));
      const i = Math.max(0, Math.min(payload.n-1, fn(xVB)));
      const out = payload.tooltip(i, xVB);
      if(!out){ tt.style.display="none"; return; }
      tt.innerHTML = out;
      tt.style.display = "block";
      tt.style.left = (ev.pageX+12)+"px";
      tt.style.top = (ev.pageY+12)+"px";
      const cx = payload.padL + (payload.crossOffset || 0) + i*payload.dx;
      const cl = document.getElementById(uid+"_x");
      if(cl){
        // Use the same viewBox-coords path attributes
        cl.setAttribute("x1", cx); cl.setAttribute("x2", cx); cl.setAttribute("display","inline");
      }
    };
    svg.onmouseleave = () => {
      tt.style.display="none";
      const cl = document.getElementById(uid+"_x");
      if(cl) cl.setAttribute("display","none");
    };
  }, 0);
}
// Multi-series line chart with axes, grid, legend, hover crosshair + tooltip.
// series: [{label, color, values:[number], dates?:[string]}]
function chartLines(series, opts={}){
  const w = opts.width||780, h = opts.height||260;
  // Slightly wider left gutter when values get into the millions.
  const padL = opts.padL || (opts.yKind === "$" ? 64 : 56);
  const padR = 12, padT = 14, padB = opts.legend===false ? 32 : 46;
  const innerW = w-padL-padR, innerH = h-padT-padB;
  const good = series.filter(s=>s && s.values && s.values.length);
  if(!good.length) return `<div style="color:var(--muted);font-size:12px">no data</div>`;
  const n = Math.max(...good.map(s=>s.values.length));
  const dates = (good[0].dates && good[0].dates.length===n) ? good[0].dates : null;
  const useLog = !!opts.log;
  // For log scale, work in log-space for axis positioning; tooltip still shows raw values.
  const transform = v => useLog ? (v > 0 ? Math.log10(v) : NaN) : v;
  const allV = good.flatMap(s=>s.values).filter(v=>isFinite(v) && (!useLog || v > 0));
  let lo = Math.min(...allV), hi = Math.max(...allV);
  if(opts.zero && !useLog) lo = Math.min(lo, 0);
  if(lo===hi){ lo -= 1; hi += 1; }
  const tLo = transform(lo), tHi = transform(hi);
  const tPad = (tHi - tLo) * 0.04;
  const tLoPad = tLo - tPad, tHiPad = tHi + tPad;
  const dx = innerW/(n-1||1);
  const yToPx = v => {
    const tv = transform(v);
    if(!isFinite(tv)) return NaN;
    return padT + innerH - (tv - tLoPad)/(tHiPad - tLoPad) * innerH;
  };
  const xToPx = i => padL + i*dx;
  // Y-axis tick generation differs for log (decade-style) vs linear.
  const yTicks = useLog
    ? (() => {
        const ticks = [];
        for (let p = Math.floor(tLo); p <= Math.ceil(tHi); p++) {
          [1, 2, 5].forEach(m => {
            const v = m * Math.pow(10, p);
            if (v >= Math.pow(10, tLoPad) && v <= Math.pow(10, tHiPad)) ticks.push(v);
          });
        }
        return ticks.length ? ticks : [Math.pow(10, (tLo+tHi)/2)];
      })()
    : _niceTicks(lo, hi, 5);
  const grid = yTicks.map(v=>{
    const y = yToPx(v); if(!isFinite(y)) return "";
    return `<line x1=${padL} y1=${y} x2=${padL+innerW} y2=${y} stroke="rgba(255,255,255,0.06)"/>
            <text x=${padL-6} y=${y+4} fill="var(--muted)" font-size="10" text-anchor="end" font-family="JetBrains Mono,monospace">${_fmtNum(v, opts.yKind)}</text>`;
  }).join("");
  const xLabels = (()=>{
    if(!dates) return "";
    const idxs = [0, Math.floor(n*0.25), Math.floor(n*0.5), Math.floor(n*0.75), n-1];
    return idxs.map(i=>{
      const x = xToPx(i);
      return `<text x=${x} y=${padT+innerH+14} fill="var(--muted)" font-size="10" text-anchor="middle" font-family="JetBrains Mono,monospace">${_fmtDate(dates[i])}</text>`;
    }).join("");
  })();
  const paths = good.map(s=>{
    let d = "";
    for(let i=0;i<s.values.length;i++){
      const v = s.values[i]; if(!isFinite(v)) continue;
      d += (d?" L":"M") + xToPx(i) + "," + yToPx(v);
    }
    return `<path d="${d}" fill="none" stroke="${s.color||'var(--cyan)'}" stroke-width="1.6" opacity="0.95"/>`;
  }).join("");
  const legend = opts.legend===false ? "" : (()=>{
    const items = good.map(s=>s.label||"").filter(Boolean);
    if(!items.length) return "";
    return good.map((s,i)=>`<g transform="translate(${padL + i*150}, ${h-12})">
      <rect width=10 height=10 fill="${s.color||'var(--cyan)'}" rx=2/>
      <text x=14 y=9 fill="var(--fg)" font-size="11" font-family="JetBrains Mono,monospace">${s.label||""}</text></g>`).join("");
  })();
  const uid = _chartUid();
  const crossX = `<line id="${uid}_x" x1=${padL} y1=${padT} x2=${padL} y2=${padT+innerH} stroke="rgba(34,211,238,0.5)" stroke-dasharray="3 3" display="none"/>`;
  const svg = `<svg id="${uid}" width="100%" height=${h} viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block;cursor:crosshair">
    ${grid}${xLabels}${paths}${crossX}
    <rect x=${padL} y=${padT} width=${innerW} height=${innerH} fill="transparent"/>
    ${legend}
  </svg>`;
  _attachChartHover(uid, {
    n, padL, dx,
    tooltip: (i, _x) => {
      const dateStr = dates ? dates[i] : `index ${i}`;
      const rows = good.map(s=>`<div style="display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:9px;height:9px;background:${s.color||'var(--cyan)'};border-radius:2px"></span><span style="color:var(--muted);font-size:11px;min-width:120px">${s.label||""}</span><span class=mono>${_fmtNum(s.values[i], opts.yKind)}</span></div>`).join("");
      return `<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted);margin-bottom:4px">${dateStr}</div>${rows}`;
    },
  });
  return svg;
}
// Backwards-compatible aliases used elsewhere
function svgSparkline(values, w, h){
  return chartLines([{label:"", color:"var(--cyan)", values}], {width:w||720, height:h||140, legend:false});
}
function _svgOverlay(series, w, h){
  return chartLines(series, {width:w||780, height:h||260});
}
// Donut with hover legend
function svgDonut(items, size=160){
  const tot = items.reduce((s,i)=>s+i.value,0) || 1;
  const cx=size/2, cy=size/2, r=size/2-8, ri=r*0.6;
  let a0 = -Math.PI/2;
  const arcs = items.map((it,i)=>{
    const a1 = a0 + (it.value/tot)*Math.PI*2;
    const x0=cx+r*Math.cos(a0), y0=cy+r*Math.sin(a0);
    const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
    const xi0=cx+ri*Math.cos(a1), yi0=cy+ri*Math.sin(a1);
    const xi1=cx+ri*Math.cos(a0), yi1=cy+ri*Math.sin(a0);
    const large = (a1-a0)>Math.PI?1:0;
    const d = `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi0},${yi0} A${ri},${ri} 0 ${large} 0 ${xi1},${yi1} Z`;
    a0 = a1;
    return `<path d="${d}" fill="${it.color}"><title>${it.label}: ${(it.value*100).toFixed(1)}%</title></path>`;
  }).join("");
  return `<svg width=${size} height=${size}>${arcs}</svg>`;
}
// Candlestick with axes + hover
function svgCandles(bars, w=900, h=300){
  if(!bars.length) return `<div style="color:var(--muted);font-size:12px">no bars</div>`;
  const padL=56, padR=12, padT=10, padB=24;
  const innerW = w-padL-padR, innerH = h-padT-padB;
  const hi = Math.max(...bars.map(b=>b.h)), lo = Math.min(...bars.map(b=>b.l));
  const pad = (hi-lo)*0.04 || 1;
  const yLo = lo-pad, yHi = hi+pad;
  const dx = innerW/bars.length;
  const yToPx = v => padT + innerH - (v-yLo)/(yHi-yLo)*innerH;
  const xToPx = i => padL + i*dx;
  const yTicks = _niceTicks(yLo, yHi, 5);
  const grid = yTicks.map(v=>{
    const y = yToPx(v);
    return `<line x1=${padL} y1=${y} x2=${padL+innerW} y2=${y} stroke="rgba(255,255,255,0.06)"/>
            <text x=${padL-6} y=${y+4} fill="var(--muted)" font-size="10" text-anchor="end" font-family="JetBrains Mono,monospace">${_fmtNum(v)}</text>`;
  }).join("");
  const dates = bars.map(b=>b.date);
  const idxs = [0, Math.floor(bars.length*0.25), Math.floor(bars.length*0.5), Math.floor(bars.length*0.75), bars.length-1];
  const xLabels = idxs.map(i=>`<text x=${xToPx(i)+dx/2} y=${padT+innerH+14} fill="var(--muted)" font-size="10" text-anchor="middle" font-family="JetBrains Mono,monospace">${_fmtDate(bars[i].date)}</text>`).join("");
  const candles = bars.map((b,i)=>{
    const x = xToPx(i), up = b.c>=b.o, col = up ? "var(--green)" : "var(--red)";
    const ywick1 = yToPx(b.h), ywick2 = yToPx(b.l);
    const ybody1 = yToPx(Math.max(b.o,b.c)), ybody2 = yToPx(Math.min(b.o,b.c));
    return `<line x1=${x+dx/2} y1=${ywick1} x2=${x+dx/2} y2=${ywick2} stroke="${col}"/>`+
           `<rect x=${x+1} y=${ybody1} width=${Math.max(1,dx-2)} height=${Math.max(1,ybody2-ybody1)} fill="${col}"/>`;
  }).join("");
  const uid = _chartUid();
  const cross = `<line id="${uid}_x" x1=${padL} y1=${padT} x2=${padL} y2=${padT+innerH} stroke="rgba(34,211,238,0.5)" stroke-dasharray="3 3" display="none"/>`;
  const svg = `<svg id="${uid}" width="100%" height=${h} viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block;cursor:crosshair">
    ${grid}${xLabels}${candles}${cross}<rect x=${padL} y=${padT} width=${innerW} height=${innerH} fill="transparent"/>
  </svg>`;
  _attachChartHover(uid, {
    n: bars.length, padL, dx,
    indexFn: v => Math.floor((v - padL)/dx),
    crossOffset: dx/2,
    tooltip: (i)=>{
      const b = bars[i]; if(!b) return null;
      const ch = ((b.c/b.o - 1)*100).toFixed(2);
      const col = b.c>=b.o ? "var(--green)" : "var(--red)";
      return `<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted)">${b.date}</div>
        <div style="font-family:JetBrains Mono,monospace;font-size:12px;margin-top:4px">
          O ${_fmtNum(b.o)} · H ${_fmtNum(b.h)} · L ${_fmtNum(b.l)}<br>
          C <span style="color:${col}">${_fmtNum(b.c)}</span> (${ch}%) · V ${_fmtNum(b.v)}
        </div>`;
    }
  });
  return svg;
}
// Heatmap with row/column labels + hover tooltip
function _truncLabel(s, maxLen){
  s = String(s);
  return s.length > maxLen ? s.slice(0, maxLen-1) + "…" : s;
}
function svgHeatmap(matrix, xs, ys, w=400, h=300, opts={}){
  if(!matrix.length) return `<div style="color:var(--muted);font-size:12px">no data</div>`;
  const yScale = ys.map(String); const xScale = xs.map(String);
  // Estimate space needed for the longest Y-axis label without overflow.
  const maxYLen = Math.max(...yScale.map(s=>s.length));
  const padL = Math.max(60, Math.min(150, maxYLen*7.6 + 14));
  const padR = 14, padT = 14, padB = 30;
  const innerW = w-padL-padR, innerH = h-padT-padB;
  const cw = innerW/xs.length, ch = innerH/ys.length;
  // X-axis labels are truncated to fit the cell width — no rotation.
  const xMaxChars = Math.max(3, Math.floor((cw-6) / 7));
  const flat = matrix.flat().filter(v=>isFinite(v));
  const lo = opts.lo !== undefined ? opts.lo : Math.min(...flat);
  const hi = opts.hi !== undefined ? opts.hi : Math.max(...flat);
  // Color modes:
  //   "corr": correlation/similarity — HIGH is bad (less diversification) → red,
  //           LOW is good → green, with a muted gray midpoint.
  //   "diverging": signed values (e.g. monthly returns); negative red, positive green.
  //   default: sequential cyan→amber for performance metrics like Sharpe.
  const mode = opts.colorMode || (opts.diverging ? "diverging" : "sequential");
  const colorAt = (v) => {
    if(!isFinite(v)) return "#333";
    if(mode === "corr"){
      const t = (v - lo) / (hi - lo + 1e-9);   // 0 → green, 1 → red
      const r = Math.round(34 + (239-34)*t);
      const g = Math.round(197 + (60-197)*t);
      const b = Math.round(94  + (60-94)*t);
      return `rgb(${r},${g},${b})`;
    }
    if(mode === "diverging"){
      const t = (v - lo) / (hi - lo + 1e-9);
      const r = v>=0 ? Math.round(38 - 38*t) : Math.round(239 + (115-239)*((v-lo)/(0-lo+1e-9)));
      const g = v>=0 ? Math.round(115 + (185-115)*(v/hi)) : Math.round(115 + (68-115)*((v-lo)/(0-lo+1e-9)));
      const b = v>=0 ? Math.round(115 + (129-115)*(v/hi)) : Math.round(115 + (68-115)*((v-lo)/(0-lo+1e-9)));
      return `rgb(${r},${g},${b})`;
    }
    const t = (v - lo) / (hi - lo + 1e-9);   // cyan → amber
    return `rgb(${Math.round(34+(245-34)*t)},${Math.round(211+(158-211)*t)},${Math.round(238+(11-238)*t)})`;
  };
  // Pick text color per cell so the value stays legible.
  const textColorAt = (v) => {
    if(mode === "corr"){
      // Dark text on the green end (light bg), light text on red.
      const t = (v - lo) / (hi - lo + 1e-9);
      return t > 0.6 ? "rgba(255,255,255,0.92)" : "#000";
    }
    return "rgba(0,0,0,0.85)";
  };
  const cells = [];
  for(let i=0;i<ys.length;i++) for(let j=0;j<xs.length;j++){
    const v=matrix[i][j];
    const x = padL+j*cw, y = padT+i*ch;
    cells.push(`<rect x=${x} y=${y} width=${cw} height=${ch} fill="${colorAt(v)}" stroke="var(--bg)" stroke-width="0.75"><title>${xScale[j]} × ${yScale[i]}: ${isFinite(v)?v.toFixed(3):"NaN"}</title></rect>`);
    if(isFinite(v) && ch >= 16 && cw >= 28){
      const fs = Math.min(13, Math.max(9, Math.floor(Math.min(cw, ch) * 0.28)));
      cells.push(`<text x=${x+cw/2} y=${y+ch/2+fs/3} fill="${textColorAt(v)}" font-size="${fs}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="600">${v.toFixed(2)}</text>`);
    }
  }
  const yLabels = ys.map((lbl,i)=>`<text x=${padL-8} y=${padT+i*ch+ch/2+4} fill="var(--muted)" font-size="11" text-anchor="end" font-family="JetBrains Mono,monospace">${lbl}</text>`).join("");
  const xLabels = xs.map((lbl,j)=>{
    const cx = padL+j*cw+cw/2;
    return `<text x=${cx} y=${padT+innerH+16} fill="var(--muted)" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">${_truncLabel(lbl, xMaxChars)}</text>`;
  }).join("");
  return `<svg width="100%" height=${h} viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block">
    ${cells.join("")}${yLabels}${xLabels}
  </svg>`;
}
// Bar histogram with axes (used for MC + monthly returns dist)
function chartHistogram(values, opts={}){
  if(!values.length) return `<div style="color:var(--muted);font-size:12px">no data</div>`;
  const w = opts.width||520, h = opts.height||140;
  const padL=40, padR=10, padT=10, padB=22;
  const innerW = w-padL-padR, innerH = h-padT-padB;
  const bins = opts.bins||20;
  const lo = Math.min(...values), hi = Math.max(...values), step = (hi-lo)/bins || 1;
  const counts = new Array(bins).fill(0);
  values.forEach(v=>{ const i=Math.min(bins-1, Math.max(0, Math.floor((v-lo)/step))); counts[i]++; });
  const maxC = Math.max(...counts);
  const bw = innerW/bins;
  const yTicks = _niceTicks(0, maxC, 3);
  const grid = yTicks.map(v=>{
    const y = padT + innerH - (v/maxC)*innerH;
    return `<line x1=${padL} y1=${y} x2=${padL+innerW} y2=${y} stroke="rgba(255,255,255,0.06)"/>
            <text x=${padL-4} y=${y+4} fill="var(--muted)" font-size="10" text-anchor="end" font-family="JetBrains Mono,monospace">${v}</text>`;
  }).join("");
  const bars = counts.map((c,i)=>{
    const x = padL + i*bw;
    const barH = (c/maxC)*innerH;
    const y = padT + innerH - barH;
    const mid = lo + (i+0.5)*step;
    const col = opts.diverging ? (mid>=0?"var(--green)":"var(--red)") : "var(--cyan)";
    return `<rect x=${x+1} y=${y} width=${Math.max(1,bw-2)} height=${barH} fill="${col}" opacity="0.75"><title>${_fmtNum(mid, opts.xKind)}: ${c}</title></rect>`;
  }).join("");
  const xLabels = [lo, lo+(hi-lo)/2, hi].map((v,k)=>{
    const x = padL + (k===0?0:k===1?innerW/2:innerW);
    return `<text x=${x} y=${h-6} fill="var(--muted)" font-size="10" text-anchor=${k===0?'start':k===2?'end':'middle'} font-family="JetBrains Mono,monospace">${_fmtNum(v, opts.xKind)}</text>`;
  }).join("");
  const zero = (lo<0 && hi>0) ? `<line x1=${padL+(-lo)/(hi-lo)*innerW} y1=${padT} x2=${padL+(-lo)/(hi-lo)*innerW} y2=${padT+innerH} stroke="rgba(255,255,255,0.25)" stroke-dasharray="2 2"/>` : "";
  return `<svg width="100%" height=${h} viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block">${grid}${bars}${zero}${xLabels}</svg>`;
}
function _signalScore(r){
  // composite score combining trend, momentum, drawdown, vol — bounded ~[-1, +1]
  const trend = r.trend>0 ? 1 : -1;
  const mom = Math.max(-1, Math.min(1, r.momentum*2));
  const ddPenalty = Math.min(1, r.drawdown*2);
  const volPenalty = Math.min(1, Math.max(0, (r.vol-0.15)*4));
  return 0.45*trend + 0.45*mom - 0.07*ddPenalty - 0.03*volPenalty;
}
function _signalVerdict(score){
  if(score>=0.55) return {tag:"STRONG BUY", color:"var(--green)", weight:600};
  if(score>=0.25) return {tag:"BUY",        color:"var(--green)", weight:500};
  if(score>=-0.05) return {tag:"HOLD",      color:"var(--amber)", weight:400};
  if(score>=-0.35) return {tag:"AVOID",     color:"var(--red)",   weight:400};
  return {tag:"SELL", color:"var(--red)", weight:600};
}
function _signalSentence(r){
  const parts = [];
  parts.push(`${r.momentum>0?'positive':'negative'} 12-1 momentum (${(r.momentum*100).toFixed(0)}%)`);
  parts.push(r.trend>0 ? "above 200-day trend" : "below 200-day trend");
  if(r.drawdown>0.20) parts.push(`deep drawdown ${(r.drawdown*100).toFixed(0)}% from peak`);
  else if(r.drawdown>0.10) parts.push(`mild drawdown ${(r.drawdown*100).toFixed(0)}%`);
  if(r.vol>0.30) parts.push(`high vol ${(r.vol*100).toFixed(0)}%`);
  else if(r.vol<0.10) parts.push(`low vol ${(r.vol*100).toFixed(0)}%`);
  if(Math.abs(r.zscore)>1.5) parts.push(`${r.zscore>0?'stretched +':' '}${r.zscore.toFixed(1)}σ vs SMA60`);
  if(r.corr_spy>0.8) parts.push(`tightly tied to SPY (ρ ${r.corr_spy.toFixed(2)})`);
  if(r.corr_spy<0.2) parts.push(`diversifier vs SPY (ρ ${r.corr_spy.toFixed(2)})`);
  return parts.join("; ");
}
function _sleeveSummary(rows){
  if(!rows.length) return "no constituents";
  const avgMom = rows.reduce((s,r)=>s+r.momentum,0)/rows.length;
  const onCount = rows.filter(r=>r.trend>0).length;
  const tone = avgMom>0.10 && onCount/rows.length>=0.6 ? "constructive"
             : avgMom<-0.05 || onCount/rows.length<0.4 ? "defensive" : "mixed";
  return `${tone} — avg 12-1 mom ${(avgMom*100).toFixed(0)}%, trend ON in ${onCount}/${rows.length}`;
}
TAB_RENDERERS.signals = async function(){
  const sigs = await api("/api/signals");
  const enriched = sigs.map(r=>{
    const score = _signalScore(r);
    return {...r, score, verdict:_signalVerdict(score), sentence:_signalSentence(r)};
  }).sort((a,b)=>b.score-a.score);

  const buys = enriched.filter(r=>r.score>=0.25).slice(0,3);
  const sells = enriched.filter(r=>r.score<=-0.05).slice(-3).reverse();
  const sleeveGroups = {};
  enriched.forEach(r=>{ (sleeveGroups[r.sleeve]=sleeveGroups[r.sleeve]||[]).push(r); });
  const sleeveOrder = ["bonds","commodity","crypto","growth","tech"];

  const verdictPill = v => `<span style="background:${v.color};color:#000;padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600;font-family:JetBrains Mono,monospace;letter-spacing:.3px">${v.tag}</span>`;
  const recCard = r => `<div style="border:1px solid var(--border);border-radius:8px;padding:14px 16px;background:var(--bg);display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center">
    <div>${verdictPill(r.verdict)}</div>
    <div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px">
        <span class=mono style="font-size:16px;color:var(--cyan);font-weight:600">${r.ticker}</span>
        <span style="font-size:11px;color:var(--muted);text-transform:uppercase">${r.sleeve}</span>
      </div>
      <div style="font-size:12.5px;color:var(--fg);line-height:1.5">${r.sentence}</div>
    </div>
    <div style="text-align:right;min-width:60px">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">score</div>
      <div class=mono style="font-size:18px;color:${r.score>=0?'var(--green)':'var(--red)'};font-weight:600">${r.score.toFixed(2)}</div>
    </div>
  </div>`;

  const sleeveCards = sleeveOrder.filter(s=>sleeveGroups[s]).map(sleeve=>{
    const rows = sleeveGroups[sleeve];
    const top = rows[0];
    const summary = _sleeveSummary(rows);
    const tone = summary.startsWith("constructive") ? "var(--green)"
               : summary.startsWith("defensive") ? "var(--red)" : "var(--amber)";
    return `<div style="border:1px solid var(--border);border-radius:8px;padding:16px 18px;background:var(--bg);border-top:3px solid ${tone}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">${sleeve} sleeve</div>
        <div>${verdictPill(top.verdict)}</div>
      </div>
      <div style="font-size:13px;line-height:1.5;margin-bottom:10px;color:var(--fg)">${summary}</div>
      <div style="font-size:12px;color:var(--muted);padding-top:10px;border-top:1px solid var(--border)">
        <span style="color:var(--muted)">Leader:</span>
        <span class=mono style="color:var(--cyan);margin:0 6px">${top.ticker}</span>
        <span style="color:var(--muted)">·</span>
        <span style="margin-left:6px">score <span class=mono>${top.score.toFixed(2)}</span></span>
      </div>
    </div>`;
  }).join("");

  $("panel-signals").innerHTML = `
    <div class="card" style="padding:20px 22px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
        <h3 style="margin:0">Signal-driven recommendations · plain English</h3>
        <div style="font-size:11px;color:var(--muted)">${enriched.length} tickers · composite score sorted</div>
      </div>
      <div style="font-size:11.5px;color:var(--muted);margin-bottom:18px;line-height:1.55">
        Score = 45% trend filter + 45% 12-1 momentum − 7% drawdown penalty − 3% high-vol penalty.
        Verdicts:
        <span style="color:var(--green)">STRONG BUY ≥ 0.55</span> ·
        <span style="color:var(--green)">BUY 0.25–0.55</span> ·
        <span style="color:var(--amber)">HOLD −0.05–0.25</span> ·
        <span style="color:var(--red)">AVOID −0.35–−0.05</span> ·
        <span style="color:var(--red)">SELL ≤ −0.35</span>.
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px">
        <div>
          <div style="font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">▲ Top BUY candidates · allocate here</div>
          <div style="display:flex;flex-direction:column;gap:10px">${buys.length ? buys.map(recCard).join("") : `<div style="color:var(--muted);font-size:13px;padding:14px;border:1px dashed var(--border);border-radius:8px">No BUYs at this threshold.</div>`}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">▼ Top AVOID / SELL · trim or skip</div>
          <div style="display:flex;flex-direction:column;gap:10px">${sells.length ? sells.map(recCard).join("") : `<div style="color:var(--muted);font-size:13px;padding:14px;border:1px dashed var(--border);border-radius:8px">No negative-score tickers — broadly constructive market.</div>`}</div>
        </div>
      </div>
    </div>

    <div class="card" style="padding:20px 22px">
      <h3>Per-sleeve verdict</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px">${sleeveCards}</div>
    </div>

    <div class="card" style="padding:20px 22px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
        <h3 style="margin:0">Full signal grid</h3>
        <div style="font-size:11px;color:var(--muted)">${enriched.length} tickers ranked by composite score</div>
      </div>
      <table style="font-size:13px">
        <thead><tr>
          <th>Verdict</th><th>Ticker</th><th>Sleeve</th>
          <th class=right>Score</th><th class=right>Mom 12-1</th><th>Trend</th>
          <th class=right>Vol 60d</th><th class=right>z vs SMA60</th>
          <th class=right>Drawdown</th><th class=right>ρ SPY</th>
          <th>Read</th>
        </tr></thead>
        <tbody>${enriched.map(r=>`<tr style="line-height:1.7">
          <td>${verdictPill(r.verdict)}</td>
          <td class=mono style="color:var(--cyan)">${r.ticker}</td>
          <td style="color:var(--muted);font-size:11px;text-transform:uppercase">${r.sleeve}</td>
          <td class="right mono"><b>${r.score.toFixed(2)}</b></td>
          <td class="right mono ${r.momentum>0?'green':'red'}">${(r.momentum*100).toFixed(1)}%</td>
          <td>${r.trend>0?'<span class=green>● ON</span>':'<span class=red>○ OFF</span>'}</td>
          <td class="right mono ${r.vol>0.30?'red':r.vol<0.10?'green':''}">${(r.vol*100).toFixed(1)}%</td>
          <td class="right mono ${Math.abs(r.zscore)>1.5?'amber':''}">${r.zscore.toFixed(2)}</td>
          <td class="right mono ${r.drawdown>0.20?'red':r.drawdown>0.10?'amber':''}">${(r.drawdown*100).toFixed(1)}%</td>
          <td class="right mono">${r.corr_spy != null ? r.corr_spy.toFixed(2) : '—'}</td>
          <td style="font-size:11.5px;color:var(--muted);max-width:380px;line-height:1.5">${r.sentence}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`;
};
const PERIODS = ["1m","3m","6m","1y","2y","5y","10y","max"];
const MKT_PALETTE = ["#22d3ee","#10b981","#f59e0b","#a855f7","#ef4444","#737373","#3b82f6","#ec4899"];
const ALL_TICKERS = ["QQQ","VUG","IWF","ARKK","XLK","SOXX","SMH","IGV","TLT","IEF","SHY","LQD","HYG","GLD","SLV","DBC","USO","DBA","BTC-USD","ETH-USD","SOL-USD","SPY","VTI","AGG"];
let _mkt_ticker = "QQQ", _mkt_period = "1y", _mkt_style = "line";
// Comparison panel state — multi-ticker overlay so the user can see rotation
// across sleeves. Default to a representative basket (1 per sleeve + SPY benchmark).
let _cmp_tickers = ["QQQ","XLK","TLT","GLD","BTC-USD","SPY"];
let _cmp_period = "1y";

function _toggleCmpTicker(t){
  const i = _cmp_tickers.indexOf(t);
  if (i >= 0) { _cmp_tickers.splice(i, 1); }
  else if (_cmp_tickers.length < 8) { _cmp_tickers.push(t); }
  TAB_RENDERERS.markets();
}

const SLEEVE_COLORS = {
  bonds:"#22d3ee", commodity:"#f59e0b", crypto:"#a855f7",
  growth:"#10b981", tech:"#ef4444", benchmarks:"#737373", cash:"#9ca3af"
};
let _UNIVERSE_CACHE = null;
async function _getUniverse(){
  if(_UNIVERSE_CACHE) return _UNIVERSE_CACHE;
  try { _UNIVERSE_CACHE = await api("/api/universe"); }
  catch(e){ _UNIVERSE_CACHE = {}; }
  return _UNIVERSE_CACHE;
}

TAB_RENDERERS.markets = async function(){
  const tickers = ["QQQ","TLT","GLD","BTC-USD","XLK","SOXX","SPY","VTI","AGG"];
  const UNI = await _getUniverse();
  $("panel-markets").innerHTML = `
    <div class="card" id="mkt-single-controls"></div>
    <div class="card" id="mkt-single-chart">loading…</div>

    <div class="card" style="padding:18px 22px;background:transparent;border:none;margin-top:6px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Compare across sleeves</div>
        <div style="font-size:11px;color:var(--muted)">click ticker chips to add/remove · curves rebased to 100 so you can see rotation</div>
      </div>
    </div>
    <div class="card" id="mkt-cmp-controls"></div>
    <div class="card" id="mkt-cmp-chart">loading…</div>`;

  // --- single-ticker chart -------------------------------------------------
  const bars = await api(`/api/bars?ticker=${_mkt_ticker}&period=${_mkt_period}`);
  const slice = _mkt_style === "line"
    ? bars.bars
    : bars.bars.slice(-Math.min(bars.bars.length, 250));
  let chart = "";
  if (_mkt_style==="line"){
    chart = chartLines(
      [{label: _mkt_ticker, color:"var(--cyan)",
        values: slice.map(b=>b.c), dates: slice.map(b=>b.date)}],
      {width:1080, height:340, yKind:"num"}
    );
  } else {
    chart = svgCandles(slice, 1080, 340);
  }
  const first = slice[0], last = slice[slice.length-1];
  const change = first && last ? (last.c/first.c - 1) : 0;
  const high = slice.length ? Math.max(...slice.map(b=>b.h)) : 0;
  const low = slice.length ? Math.min(...slice.map(b=>b.l)) : 0;
  const tickerChip = t => {
    const m = UNI[t] || {};
    const title = m.display_name ? `${t} — ${m.display_name} · ${m.sleeve || "?"} · ${m.role || ""}` : t;
    const sc = SLEEVE_COLORS[m.sleeve] || "var(--border)";
    return `<button class="btn ${t===_mkt_ticker?'active':''}" onclick="_mkt_ticker='${t}';TAB_RENDERERS.markets()" title="${title}" style="border-left:3px solid ${sc}">${t}</button>`;
  };
  const sel = UNI[_mkt_ticker] || {ticker:_mkt_ticker, display_name:_mkt_ticker, sleeve:"?", role:"", description:""};
  const sleeveCol = SLEEVE_COLORS[sel.sleeve] || "var(--border)";

  $("mkt-single-controls").innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;margin-bottom:14px">
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Ticker · hover for name</div>
        <div class="period-bar">${tickers.map(tickerChip).join("")}</div>
      </div>
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Period</div>
        <div class="period-bar">${PERIODS.map(p=>`<button class="btn ${p===_mkt_period?'active':''}" onclick="_mkt_period='${p}';TAB_RENDERERS.markets()">${p.toUpperCase()}</button>`).join("")}</div>
      </div>
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Style</div>
        <div class="period-bar">
          <button class="btn ${_mkt_style==='line'?'active':''}" onclick="_mkt_style='line';TAB_RENDERERS.markets()">Line</button>
          <button class="btn ${_mkt_style==='candles'?'active':''}" onclick="_mkt_style='candles';TAB_RENDERERS.markets()">Candles</button>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:18px;padding:14px 16px;background:var(--bg);border:1px solid var(--border);border-left:3px solid ${sleeveCol};border-radius:8px">
      <div style="min-width:0;flex:1">
        <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
          <span class="mono cyan" style="font-size:18px;font-weight:600">${sel.ticker}</span>
          <span style="font-size:14px;color:var(--fg)">${sel.display_name || ""}</span>
          <span class="chip" style="background:${sleeveCol};color:#000;font-weight:600">${(sel.sleeve||"").toUpperCase()}</span>
          ${sel.role ? `<span style="font-size:12px;color:var(--muted)">${sel.role}</span>` : ""}
        </div>
        ${sel.description ? `<div style="font-size:12px;color:var(--muted);margin-top:4px">${sel.description}</div>` : ""}
      </div>
      <div style="display:flex;gap:22px">
        <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">last</div><div class="mono" style="font-size:20px;font-weight:600">${last?_fmtNum(last.c):"—"}</div></div>
        <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">change</div><div class="mono ${change>=0?'green':'red'}" style="font-size:20px;font-weight:600">${(change*100).toFixed(1)}%</div></div>
        <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">high / low</div><div class="mono" style="font-size:13px">${_fmtNum(high)} / ${_fmtNum(low)}</div></div>
      </div>
    </div>`;
  $("mkt-single-chart").innerHTML = `${chart}
    <div style="font-size:11px;color:var(--muted);margin-top:6px">${slice.length} bars · hover for date/price</div>`;

  // --- comparison panel ----------------------------------------------------
  // Group tickers by sleeve for readable chip selector.
  const SLEEVE_TICKERS = {
    "growth":   ["QQQ","VUG","IWF","ARKK"],
    "tech":     ["XLK","SOXX","SMH","IGV"],
    "bonds":    ["TLT","IEF","SHY","LQD","HYG"],
    "commodity":["GLD","SLV","DBC","USO","DBA"],
    "crypto":   ["BTC-USD","ETH-USD","SOL-USD"],
    "bench":    ["SPY","VTI","AGG"],
  };
  const sleeveSelectors = Object.entries(SLEEVE_TICKERS).map(([sleeve, ts]) => {
    const chips = ts.map(t => {
      const active = _cmp_tickers.includes(t);
      const idx = _cmp_tickers.indexOf(t);
      const col = active ? MKT_PALETTE[idx % MKT_PALETTE.length] : "var(--border)";
      const m = UNI[t] || {};
      const title = m.display_name ? `${t} — ${m.display_name}${m.role ? " · "+m.role : ""}${m.description ? "\n"+m.description : ""}` : t;
      return `<button class="btn ${active?'active':''}" onclick="_toggleCmpTicker('${t}')"
        title="${title}" style="border-left:3px solid ${col}">${t}</button>`;
    }).join("");
    return `<div style="margin-bottom:8px">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">${sleeve}</div>
      <div class="period-bar">${chips}</div>
    </div>`;
  }).join("");
  const cmpPeriodBtns = PERIODS.map(p=>`<button class="btn ${p===_cmp_period?'active':''}" onclick="_cmp_period='${p}';TAB_RENDERERS.markets()">${p.toUpperCase()}</button>`).join("");
  $("mkt-cmp-controls").innerHTML = `
    <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:1;min-width:600px">${sleeveSelectors}</div>
      <div>
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Period</div>
        <div class="period-bar">${cmpPeriodBtns}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--muted)">selected</div>
        <div class="mono" style="font-size:18px">${_cmp_tickers.length} / 8</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">${_cmp_tickers.join(" · ") || "none"}</div>
      </div>
    </div>`;

  if (!_cmp_tickers.length) {
    $("mkt-cmp-chart").innerHTML = `<div style="color:var(--muted);padding:24px;text-align:center">Pick a few tickers above to see them overlaid on the same chart.</div>`;
    return;
  }
  // Fetch bars for each selected ticker, rebase to 100, overlay.
  try {
    const results = await Promise.all(_cmp_tickers.map(t =>
      api(`/api/bars?ticker=${t}&period=${_cmp_period}`).then(b => ({t, bars: b.bars}))
    ));
    // Build a common date axis using the union of all dates, sorted.
    const dateSet = new Set();
    results.forEach(r => r.bars.forEach(b => dateSet.add(b.date)));
    const dates = Array.from(dateSet).sort();
    const series = results.map((r, i) => {
      const byDate = Object.fromEntries(r.bars.map(b => [b.date, b.c]));
      // Forward-fill missing dates; rebase to 100 at the first available point.
      let firstSeen = null;
      const values = [];
      let last = null;
      for (const d of dates) {
        if (byDate[d] !== undefined) { last = byDate[d]; if (firstSeen === null) firstSeen = byDate[d]; }
        values.push(firstSeen !== null && last !== null ? (last / firstSeen) * 100 : NaN);
      }
      return { label: r.t, color: MKT_PALETTE[i % MKT_PALETTE.length], values, dates };
    });
    // Stats table: total return + ann.vol per ticker
    const stats = series.map(s => {
      const v = s.values.filter(x => isFinite(x));
      if (v.length < 2) return { name: s.label, color: s.color, total: 0, vol: 0 };
      const total = v[v.length-1]/100 - 1;
      const rets = [];
      for (let i = 1; i < v.length; i++) rets.push(v[i]/v[i-1] - 1);
      const mean = rets.reduce((a,b)=>a+b,0)/rets.length;
      const variance = rets.reduce((a,b)=>a + (b-mean)**2, 0)/rets.length;
      return { name: s.label, color: s.color, total, vol: Math.sqrt(variance * 252) };
    }).sort((a,b) => b.total - a.total);
    $("mkt-cmp-chart").innerHTML = `
      ${chartLines(series, {width:1080, height:360, yKind:"num", legend: true})}
      <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px">
        ${stats.map(s => `<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg)">
          <span style="display:inline-block;width:10px;height:10px;background:${s.color};border-radius:2px"></span>
          <span class=mono style="font-size:13px;color:var(--cyan)">${s.name}</span>
          <span class=mono style="font-size:12px;color:${s.total>=0?'var(--green)':'var(--red)'}">${(s.total*100).toFixed(1)}%</span>
          <span style="font-size:11px;color:var(--muted)">vol ${(s.vol*100).toFixed(0)}%</span>
        </div>`).join("")}
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:10px">All series rebased to 100 at the first date shown · ranked by total return · hover for date+values.</div>`;
  } catch (e) {
    $("mkt-cmp-chart").innerHTML = `<div style="color:var(--red)">comparison failed: ${e}</div>`;
  }
};
const RESEARCH_DEFAULTS = {
  // years acts as "preset" — null = custom mode, otherwise a year count
  years: 5,
  customStart: "", customEnd: "",
  rebalance: "monthly",
  cost_bps: 5,
  metric: "Sharpe",
  focus: "xs_momentum",
  // "linear" = $ values, "log" = $ on log scale (default — fairer comparison
  // when one strategy compounds 10x more than another), "normalized" = each
  // curve rebased to 100 at the start so they all share the same y-anchor.
  eqScale: "log",
  strategies: {xs_momentum:true, dual_momentum:true, risk_parity:true, trend_following:true, static_target:true},
};
const _R = JSON.parse(JSON.stringify(RESEARCH_DEFAULTS));
const STRAT_COLORS = {xs_momentum:"#22d3ee", dual_momentum:"#10b981", risk_parity:"#f59e0b",
                      trend_following:"#a855f7", static_target:"#737373"};
function _rRange(){
  // Custom mode uses user-typed dates; preset mode falls back to N-year lookback.
  if(_R.years === null && _R.customStart && _R.customEnd){
    return {start: _R.customStart, end: _R.customEnd};
  }
  const end = new Date().toISOString().slice(0,10);
  const yrs = _R.years || 5;
  const start = new Date(Date.now() - yrs*365*86400000).toISOString().slice(0,10);
  return {start, end};
}
function _svgOverlay(series, w=720, h=260){
  if(!series.length) return "";
  let allVals = [].concat(...series.map(s=>s.values));
  const min = Math.min(...allVals), max = Math.max(...allVals);
  const dy = max>min ? h/(max-min) : 0;
  const paths = series.map(s=>{
    const dx = w/(s.values.length-1);
    let d = "M0,"+(h-(s.values[0]-min)*dy);
    for(let i=1;i<s.values.length;i++) d += " L"+(i*dx)+","+(h-(s.values[i]-min)*dy);
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="1.5" opacity="0.9"/>`;
  }).join("");
  const legend = series.map((s,i)=>`<text x="${10+i*120}" y="${h-6}" fill="${s.color}" font-size="11" font-family="JetBrains Mono,monospace">● ${s.label}</text>`).join("");
  return `<svg width=${w} height=${h} viewBox="0 0 ${w} ${h}">${paths}${legend}</svg>`;
}
function _toggleStrat(name){ _R.strategies[name] = !_R.strategies[name]; TAB_RENDERERS.research(); }
function _setYears(n){
  _R.years = n;
  if(n !== null){
    const today = new Date().toISOString().slice(0,10);
    _R.customEnd = today;
    _R.customStart = new Date(Date.now() - n*365*86400000).toISOString().slice(0,10);
  }
  TAB_RENDERERS.research();
}
function _setCustomMode(){ _R.years = null; TAB_RENDERERS.research(); }
function _setCustomStart(d){ _R.years = null; _R.customStart = d; TAB_RENDERERS.research(); }
function _setCustomEnd(d){ _R.years = null; _R.customEnd = d; TAB_RENDERERS.research(); }
function _setRebal(r){ _R.rebalance = r; TAB_RENDERERS.research(); }
function _setMetric(m){ _R.metric = m; TAB_RENDERERS.research(); }
function _setEqScale(s){ _R.eqScale = s; TAB_RENDERERS.research(); }
function _setCostBps(v){ _R.cost_bps = Math.max(0, +v || 0); TAB_RENDERERS.research(); }
// "Pick" sets focus AND ensures the strategy is in the compare set AND activates server-side.
async function _pickStrategy(name){
  _R.focus = name;
  _R.strategies[name] = true;
  try { await api("/api/active_strategy", {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({strategy:name})}); } catch(e){}
  tick(); TAB_RENDERERS.research();
}

// Strategy lore — richer description + core concept used in the merged switcher.
const STRAT_LORE = {
  xs_momentum: {
    concept: "Within each asset sleeve, rank by 12-month minus 1-month return and hold only the top-K winners (equal-weight). A 200-day trend filter knocks out anything in a downtrend, so capital flows toward the strongest names in each sleeve and away from the laggards. Classic cross-sectional momentum, Jegadeesh & Titman (1993).",
    when: "Works best in trending markets where leadership persists. Whipsaws in choppy or sharply mean-reverting regimes.",
  },
  dual_momentum: {
    concept: "Absolute + relative momentum together. Pick the single best 12-month performer across the whole universe; if even THAT asset can't beat the risk-free rate (cash yield), park everything in CASH. Antonacci (2014) — concentrated, regime-aware, big drawdown protection.",
    when: "Excellent crash protection (sells into cash before bear markets fully develop). Concentrated risk on the way up — one asset at a time.",
  },
  risk_parity: {
    concept: "Every sleeve gets the same risk budget, not the same dollar budget. Within each sleeve, tickers are weighted by inverse 60-day volatility, so a 30%-vol crypto contributes the same risk as an 8%-vol Treasury. Bridgewater's 'All Weather' lineage.",
    when: "Smooth ride, low drawdowns, low correlation to any single sleeve. Caps upside vs concentrated bets in roaring bull markets.",
  },
  trend_following: {
    concept: "Hold ONLY assets currently above their 200-day SMA, equal-weight across survivors. Residual goes to CASH. The simplest 'just don't fight the trend' rule — survives most downtrends by stepping aside.",
    when: "Defensive in bears, full participation in bulls. Pays a tax in choppy/sideways markets via false breakouts.",
  },
  static_target: {
    concept: "Don't try to time anything — use the user's static target allocation as-is and rebalance back to it on schedule. The 'do nothing clever' baseline every active strategy must beat after fees and slippage.",
    when: "Hardest baseline to beat over multi-decade horizons. No timing risk; cost-efficient. Loses big in single-asset bear markets that the strategy never trims.",
  },
};

// Small inline schematic per strategy — vector illustration of the core mechanic.
function _stratIllustration(name){
  // Wide 320x140 canvas; stretch to fill its container via preserveAspectRatio=none
  // so the visuals always look proportional to the card's actual width.
  const W=320, H=140;
  const wrap = (body) => `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="display:block" font-family="JetBrains Mono,monospace">${body}</svg>`;

  if(name==="xs_momentum"){
    // 5 candidates per sleeve, ranked by 12-1 momentum; top-2 selected.
    const labels = ["A", "B", "C", "D", "E"];
    const heights = [82, 68, 105, 50, 28];
    const ranked = [2,0,1,3,4]; // index → rank order
    const bw = 38, gap = 16, startX = 24;
    return wrap(`
      <text x="16" y="20" fill="var(--muted)" font-size="11">Sleeve candidates</text>
      <text x="${W-16}" y="20" fill="var(--cyan)" font-size="11" text-anchor="end">▲ top-K selected</text>
      ${heights.map((h,i)=>{
        const x = startX + i*(bw+gap);
        const rank = ranked.indexOf(i);
        const isTop = rank < 2;
        const col = isTop ? "var(--cyan)" : "rgba(120,120,120,0.55)";
        const txt = isTop ? "var(--cyan)" : "var(--muted)";
        return `
          <rect x="${x}" y="${H-32-h}" width="${bw}" height="${h}" fill="${col}" rx="3"/>
          ${isTop ? `<text x="${x+bw/2}" y="${H-36-h}" fill="${col}" font-size="11" text-anchor="middle" font-weight="700">#${rank+1}</text>` : ""}
          <text x="${x+bw/2}" y="${H-14}" fill="${txt}" font-size="11" text-anchor="middle">${labels[i]}</text>
        `;
      }).join("")}
      <line x1="20" y1="${H-32}" x2="${W-20}" y2="${H-32}" stroke="rgba(255,255,255,0.12)"/>
    `);
  }

  if(name==="dual_momentum"){
    // Compare best-asset 12-mo return vs cash yield; branch into HOLD asset or CASH.
    return wrap(`
      <text x="16" y="22" fill="var(--muted)" font-size="11">Best asset r12 vs cash yield</text>
      <rect x="20"  y="40" width="90" height="64" fill="var(--green)" rx="6"/>
      <text x="65"  y="74" fill="#000" font-size="14" text-anchor="middle" font-weight="700">best r12</text>
      <text x="65"  y="92" fill="rgba(0,0,0,0.7)" font-size="11" text-anchor="middle">winner across all</text>
      <path d="M 118 72 L 168 72" stroke="var(--muted)" stroke-width="2" marker-end="url(#dmarrow)"/>
      <defs><marker id="dmarrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><polygon points="0 0, 10 5, 0 10" fill="var(--muted)"/></marker></defs>
      <rect x="178" y="34" width="120" height="40" fill="var(--cyan)" rx="6"/>
      <text x="238" y="60" fill="#000" font-size="13" text-anchor="middle" font-weight="600">HOLD asset</text>
      <text x="174" y="32" fill="var(--green)" font-size="11" text-anchor="start">if r12 ≥ 4%</text>
      <rect x="178" y="86" width="120" height="40" fill="var(--amber)" rx="6"/>
      <text x="238" y="112" fill="#000" font-size="13" text-anchor="middle" font-weight="600">CASH</text>
      <text x="174" y="138" fill="var(--red)" font-size="11" text-anchor="start">if r12 &lt; 4%</text>
    `);
  }

  if(name==="risk_parity"){
    // Equal-risk weighting: high-vol asset gets a thin slice, low-vol gets a fat one.
    const sleeves = [
      {label:"BONDS",    sigma:"σ=8%",  weight:0.50, c:"#22d3ee"},
      {label:"GROWTH",   sigma:"σ=15%", weight:0.27, c:"#10b981"},
      {label:"COMMOD.",  sigma:"σ=22%", weight:0.18, c:"#f59e0b"},
      {label:"CRYPTO",   sigma:"σ=42%", weight:0.05, c:"#a855f7"},
    ];
    const padX = 24, padTop = 44, padBot = 30;
    const bw = (W - padX*2) / sleeves.length - 12;
    return wrap(`
      <text x="16" y="22" fill="var(--muted)" font-size="11">Position size ∝ 1 / volatility · equal risk per sleeve</text>
      ${sleeves.map((s,i)=>{
        const maxH = H - padTop - padBot;
        const h = Math.max(12, s.weight / Math.max(...sleeves.map(x=>x.weight)) * maxH);
        const x = padX + i*((W - padX*2) / sleeves.length) + 6;
        return `
          <rect x="${x}" y="${H-padBot-h}" width="${bw}" height="${h}" fill="${s.c}" rx="3"/>
          <text x="${x+bw/2}" y="${H-padBot-h-6}" fill="${s.c}" font-size="11" text-anchor="middle" font-weight="600">${(s.weight*100).toFixed(0)}%</text>
          <text x="${x+bw/2}" y="${H-padBot+13}" fill="var(--fg)" font-size="11" text-anchor="middle" font-weight="500">${s.label}</text>
          <text x="${x+bw/2}" y="${H-padBot+26}" fill="var(--muted)" font-size="10" text-anchor="middle">${s.sigma}</text>
        `;
      }).join("")}
    `);
  }

  if(name==="trend_following"){
    // Price curve dipping below then breaking above SMA200; OFF→ON regimes colored.
    return wrap(`
      <rect x="0"   y="0" width="155" height="${H}" fill="rgba(239,68,68,0.10)"/>
      <rect x="155" y="0" width="${W-155}" height="${H}" fill="rgba(16,185,129,0.10)"/>
      <line x1="155" y1="0" x2="155" y2="${H}" stroke="rgba(255,255,255,0.18)" stroke-dasharray="3 3"/>
      <text x="14"  y="22" fill="var(--red)"   font-size="12" font-weight="600">OFF — out of market</text>
      <text x="${W-16}" y="22" fill="var(--green)" font-size="12" font-weight="600" text-anchor="end">ON — long</text>
      <path d="M 8 100 Q 40 110 70 96 T 130 95 T 200 60 T 260 30 T 312 18" fill="none" stroke="var(--cyan)" stroke-width="2.4"/>
      <line x1="0" y1="80" x2="${W}" y2="80" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="6 4"/>
      <text x="${W-14}" y="76" fill="var(--muted)" font-size="11" text-anchor="end">SMA200</text>
      <circle cx="155" cy="80" r="5" fill="var(--cyan)" stroke="#fff" stroke-width="1.5"/>
      <text x="155" y="${H-12}" fill="var(--muted)" font-size="10" text-anchor="middle">crossover → buy</text>
    `);
  }

  if(name==="static_target"){
    // Donut of fixed allocation with sleeve labels — anchors the baseline.
    const segs = [
      {label:"BONDS",    p:0.25, c:"#22d3ee"},
      {label:"GROWTH",   p:0.30, c:"#10b981"},
      {label:"TECH",     p:0.20, c:"#ef4444"},
      {label:"COMMOD.",  p:0.15, c:"#f59e0b"},
      {label:"CRYPTO",   p:0.10, c:"#a855f7"},
    ];
    const cx=H/2+6, cy=H/2, r=58, ri=28;
    let a0 = -Math.PI/2;
    const arcs = segs.map(s=>{
      const a1 = a0 + s.p*Math.PI*2;
      const lg = (a1-a0)>Math.PI?1:0;
      const x0=cx+r*Math.cos(a0),  y0=cy+r*Math.sin(a0);
      const x1=cx+r*Math.cos(a1),  y1=cy+r*Math.sin(a1);
      const xi0=cx+ri*Math.cos(a1),yi0=cy+ri*Math.sin(a1);
      const xi1=cx+ri*Math.cos(a0),yi1=cy+ri*Math.sin(a0);
      const d = `M ${x0} ${y0} A ${r} ${r} 0 ${lg} 1 ${x1} ${y1} L ${xi0} ${yi0} A ${ri} ${ri} 0 ${lg} 0 ${xi1} ${yi1} Z`;
      a0 = a1;
      return `<path d="${d}" fill="${s.c}"/>`;
    }).join("");
    const legend = segs.map((s,i)=>`
      <rect x="160" y="${28+i*18}" width="11" height="11" fill="${s.c}" rx="2"/>
      <text x="178" y="${37+i*18}" fill="var(--fg)" font-size="11">${s.label}</text>
      <text x="${W-16}" y="${37+i*18}" fill="var(--muted)" font-size="11" text-anchor="end">${(s.p*100).toFixed(0)}%</text>
    `).join("");
    return wrap(`
      <text x="16" y="22" fill="var(--muted)" font-size="11">Fixed allocation · rebalance back to target</text>
      ${arcs}
      ${legend}
    `);
  }

  return "";
}

// Build the merged strategy switcher block — sits at the top of Research.
// Compact chip selector (top of Research) — one-liner pills, no detail.
function _strategyChipBar(focusName){
  const allStrats = ["xs_momentum","dual_momentum","risk_parity","trend_following","static_target"];
  return allStrats.map(name => {
    const lore = STRAT_LORE[name] || {};
    const isFocus = name === focusName;
    return `<button class="strategy-chip ${isFocus?'active':''}" onclick="_pickStrategy('${name}')"
      style="border-left:3px solid ${STRAT_COLORS[name]||'var(--border)'}">
      <div class="mono" style="font-size:13px;color:${isFocus?'var(--cyan)':'var(--fg)'};font-weight:${isFocus?600:500}">${name}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.3;max-width:240px">${(lore.concept||"").split(".")[0]}</div>
    </button>`;
  }).join("");
}

// Full detail cards (bottom of Research) — concept + formula + illustration + regime + params.
async function _strategyDetailCards(focusName){
  const strats = await api("/api/strategies");
  return strats.map(st => {
    const isFocus = st.name === focusName;
    const lore = STRAT_LORE[st.name] || {};
    const regime = st.regime_fit||{};
    const regimeStr = ["bull","bear","recession","recovery"]
      .map(k => `<span style="color:${regime[k]?'var(--green)':'var(--muted)'};font-size:11px;margin-right:10px">${regime[k]?'●':'○'} ${k}</span>`).join("");
    const paramStr = Object.keys(st.default_params||{}).length
      ? Object.entries(st.default_params).map(([k,v])=>{
          const sv = typeof v==='object' ? JSON.stringify(v) : String(v);
          return `<span style="font-size:11px;color:var(--muted);margin-right:12px"><span style="color:var(--fg)">${k}</span>=<span class=mono>${sv.length>32?sv.slice(0,32)+'…':sv}</span></span>`;
        }).join("")
      : `<span style="font-size:11px;color:var(--muted)">no tunable parameters</span>`;
    const badge = isFocus
      ? `<span style="background:var(--cyan);color:#000;padding:3px 9px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:.3px">● SELECTED</span>`
      : `<span style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">click to select</span>`;
    return `<div class="strategy-card ${isFocus?'active':''}" onclick="_pickStrategy('${st.name}')"
      style="border-left:3px solid ${STRAT_COLORS[st.name]||'var(--border)'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px">
        <div class="mono cyan" style="font-size:15px">${st.name}</div>${badge}
      </div>
      <div style="display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:flex-start">
        <div style="min-width:0">
          <div style="font-size:13px;line-height:1.5">${lore.concept || st.description}</div>
          <div class="formula mono" style="margin-top:10px;font-size:11.5px;overflow-x:auto;white-space:nowrap">${st.formula}</div>
          <div style="margin-top:10px;font-size:12px;color:var(--fg);line-height:1.4"><span style="color:var(--muted)">When it shines:</span> ${lore.when || ""}</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:0;width:280px;height:140px;overflow:hidden">${_stratIllustration(st.name)}</div>
      </div>
      <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;display:flex;flex-wrap:wrap;gap:14px;align-items:center">
        <div>${regimeStr}</div>
        <div style="margin-left:auto">${paramStr}</div>
      </div>
    </div>`;
  }).join("");
}

TAB_RENDERERS.research = async function(){
  const {start, end} = _rRange();
  const allStrats = ["xs_momentum","dual_momentum","risk_parity","trend_following","static_target"];
  // Sync focus with server-side active strategy on first paint
  try { const s = await api("/api/state"); if(s.active_strategy) _R.focus = s.active_strategy; } catch(e){}
  const picked = allStrats.filter(s => _R.strategies[s]);
  const yearBtns = [1,3,5,10,20].map(y=>`<button class="btn ${_R.years===y?'active':''}" onclick="_setYears(${y})">${y}y</button>`).join("")
    + `<button class="btn ${_R.years===null?'active':''}" onclick="_setCustomMode()">Custom</button>`;
  const {start: _rStart, end: _rEnd} = _rRange();
  const customPickers = _R.years === null
    ? `<div style="margin-top:8px;display:flex;gap:6px;align-items:center;font-size:11px;color:var(--muted)">
        <input type="date" value="${_rStart}" onchange="_setCustomStart(this.value)" style="font-size:12px"/>
        <span>→</span>
        <input type="date" value="${_rEnd}" onchange="_setCustomEnd(this.value)" style="font-size:12px"/>
       </div>` : "";
  const rebalBtns = ["monthly","quarterly","weekly"].map(r=>`<button class="btn ${_R.rebalance===r?'active':''}" onclick="_setRebal('${r}')">${r}</button>`).join("");
  const metricBtns = ["Sharpe","CAGR","Sortino","max_DD","Calmar"].map(m=>`<button class="btn ${_R.metric===m?'active':''}" onclick="_setMetric('${m}')">${m}</button>`).join("");
  const eqScaleBtns = [["log","Log"], ["linear","Linear"], ["normalized","% gain"]].map(([k,lbl])=>`<button class="btn ${_R.eqScale===k?'active':''}" onclick="_setEqScale('${k}')">${lbl}</button>`).join("");
  const stratBtns = allStrats.map(s=>`<button class="btn ${_R.strategies[s]?'active':''}" onclick="_toggleStrat('${s}')" style="border-left:3px solid ${STRAT_COLORS[s]}">${s}</button>`).join("");
  const chipBar = _strategyChipBar(_R.focus);
  // Detail cards are built lazily at the bottom of the page (see end of render).

  $("panel-research").innerHTML = `
    <div class="card" style="padding:14px 18px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
        <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Strategy</div>
        <div style="font-size:11px;color:var(--muted)">click a chip to focus that strategy · full details at the bottom of this page</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5, minmax(0,1fr));gap:10px">${chipBar}</div>
    </div>

    <div class="card" id="snap-card">
      <div id="snap-out" style="color:var(--muted)">running snapshot…</div>
    </div>

    <div class="card">
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
        <div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Lookback</div>
          <div class="period-bar">${yearBtns}</div>
          ${customPickers}
        </div>
        <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Rebalance</div><div class="period-bar">${rebalBtns}</div></div>
        <div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Cost (bps)</div>
          <input type="number" value="${_R.cost_bps}" min="0" max="100" step="1" onchange="_setCostBps(this.value)" style="width:72px"/>
        </div>
        <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Heatmap metric</div><div class="period-bar">${metricBtns}</div></div>
        <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Equity scale</div><div class="period-bar">${eqScaleBtns}</div></div>
        <div style="flex:1;min-width:300px"><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Also compare</div><div class="period-bar">${stratBtns}</div></div>
        <div style="margin-left:auto;font-size:11px;color:var(--muted);font-family:JetBrains Mono,monospace" id="cache-chip">cache —</div>
      </div>
    </div>

    <div class="grid cols-2">
      <div class="card"><h3>Equity curves — ${_R.years}y, ${_R.rebalance}</h3>
        <div id="rc-eq" style="color:var(--muted)">running…</div></div>
      <div class="card"><h3>Drawdown curves — ${_R.years}y, ${_R.rebalance}</h3>
        <div id="rc-dd" style="color:var(--muted)">running…</div></div>
    </div>

    <div class="card"><h3>Rolling 12-mo Sharpe — ${_R.focus}</h3>
      <div id="roll-out" style="color:var(--muted)">running…</div></div>

    <div class="card"><h3>Summary stats — ranked by ${_R.metric}</h3>
      <div id="rc-tbl" style="color:var(--muted)">running…</div></div>

    <div class="card"><h3>Monthly returns — ${_R.focus} (green=positive, red=negative)</h3>
      <div id="mhm-out" style="color:var(--muted)">running…</div></div>

    <div class="grid cols-2">
      <div class="card"><h3>2D parameter sweep — ${_R.focus}, top_k × top_k → ${_R.metric}</h3>
        <div id="sweep-out" style="color:var(--muted)">running…</div></div>
      <div class="card"><h3>Regime breakdown — ${_R.focus}</h3>
        <div id="regime-out" style="color:var(--muted)">running…</div></div>
    </div>

    <div class="grid cols-2">
      <div class="card"><h3>Monte Carlo bootstrap — ${_R.focus} (200 resamples)</h3>
        <div id="mc-out" style="color:var(--muted)">running…</div></div>
      <div class="card"><h3>Sleeve attribution — ${_R.focus}</h3>
        <div id="attr-out" style="color:var(--muted)">running…</div></div>
    </div>

    <div class="grid cols-2">
      <div class="card"><h3>Walk-forward — ${_R.focus} (4 folds)</h3>
        <div id="wf-out" style="color:var(--muted)">running…</div></div>
      <div class="card"><h3>Strategy correlation — daily returns</h3>
        <div id="corr-out" style="color:var(--muted)">running…</div></div>
    </div>

    <div class="card"><h3>Recent rebalances — ${_R.focus} (last 30)</h3>
      <div id="rebal-out" style="color:var(--muted)">running…</div></div>

    <div class="card" style="background:transparent;border:none;padding:18px 0 4px 0;margin-top:8px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Strategy details</div>
        <div style="font-size:11px;color:var(--muted)">core concept · formula · illustration · regime fit · parameters</div>
      </div>
    </div>
    <div class="grid cols-2" id="strategy-detail-cards">
      <div style="color:var(--muted);font-size:12px;grid-column:1/-1">loading…</div>
    </div>`;

  // build the bottom detail cards async (one network call, doesn't block the rest)
  _strategyDetailCards(_R.focus).then(html => {
    const el = $("strategy-detail-cards"); if(el) el.innerHTML = html;
  });

  // cache stats chip
  api("/api/cache").then(c=>{
    $("cache-chip").textContent = `cache: ${c.size}/${c.max} entries · ${c.hits} hits / ${c.misses} misses · ${(c.hit_ratio*100).toFixed(0)}% hit rate`;
  }).catch(()=>{});

  // 1) backtest each picked strategy → overlay charts + table
  Promise.all(picked.map(n => api(`/api/backtest?strategy=${n}&start=${start}&end=${end}&rebalance=${_R.rebalance}&cost_bps=${_R.cost_bps}`)
    .then(r=>({name:n, ...r})).catch(e=>({name:n, error:String(e)}))))
    .then(rs => {
      const good = rs.filter(r=>!r.error);
      // Build equity series per the user's chosen scale.
      // "log"        → raw $ values, log-scale axis
      // "linear"     → raw $ values, linear axis
      // "normalized" → each curve rebased to 100 at the start (relative growth)
      const buildEq = r => {
        const dates = r.equity_curve.map(([d,_])=>d);
        const values = r.equity_curve.map(([_,v])=>v);
        if(_R.eqScale === "normalized"){
          const base = values[0] || 1;
          return {values: values.map(v=>(v/base)*100), dates};
        }
        return {values, dates};
      };
      const eqSeries = good.map(r=>{ const {values, dates} = buildEq(r);
        return {label:r.name, color:STRAT_COLORS[r.name], values, dates}; });
      const ddSeries = good.map(r=>({label:r.name, color:STRAT_COLORS[r.name],
        values:r.drawdown_curve.map(([_,v])=>-v), dates:r.drawdown_curve.map(([d,_])=>d)}));
      const eqOpts = _R.eqScale === "normalized"
        ? {width:740, height:260, yKind:"num"}
        : {width:740, height:260, yKind:"$", log: _R.eqScale === "log"};
      $("rc-eq").innerHTML = chartLines(eqSeries, eqOpts);
      $("rc-dd").innerHTML = chartLines(ddSeries, {width:740, height:260, yKind:"pct", zero:true});
      const rows = good.map(r=>({name:r.name, ...r.summary}))
        .sort((a,b)=> (b[_R.metric]||0) - (a[_R.metric]||0));
      const fmt = (k,v) => k==="CAGR"||k==="ann_vol"||k==="max_DD"||k==="best_month"||k==="worst_month"||k==="win_rate"
        ? (v*100).toFixed(1)+"%" : v.toFixed(2);
      $("rc-tbl").innerHTML = `<table><thead><tr><th>Strategy</th>
        <th class=right>CAGR</th><th class=right>Vol</th><th class=right>Sharpe</th>
        <th class=right>Sortino</th><th class=right>Max DD</th><th class=right>Calmar</th>
        <th class=right>Best mo</th><th class=right>Worst mo</th><th class=right>Win %</th></tr></thead><tbody>` +
        rows.map(r=>`<tr><td class=mono><span style="display:inline-block;width:8px;height:8px;background:${STRAT_COLORS[r.name]};border-radius:2px;margin-right:6px"></span>${r.name}</td>
          <td class="right mono">${fmt("CAGR",r.CAGR)}</td>
          <td class="right mono">${fmt("ann_vol",r.ann_vol)}</td>
          <td class="right mono ${r.Sharpe>1?'green':''}">${r.Sharpe.toFixed(2)}</td>
          <td class="right mono">${r.Sortino.toFixed(2)}</td>
          <td class="right mono red">${fmt("max_DD",r.max_DD)}</td>
          <td class="right mono">${r.Calmar.toFixed(2)}</td>
          <td class="right mono green">${fmt("best_month",r.best_month)}</td>
          <td class="right mono red">${fmt("worst_month",r.worst_month)}</td>
          <td class="right mono">${fmt("win_rate",r.win_rate)}</td></tr>`).join("") + `</tbody></table>`;
    });

  // 2) parameter sweep
  const sweepParams = new URLSearchParams();
  sweepParams.append("strategy", _R.focus);
  sweepParams.append("param_x_name","top_k"); sweepParams.append("param_y_name","top_k");
  [1,2,3,4].forEach(v=>sweepParams.append("param_x_vals", v));
  [1,2,3,4].forEach(v=>sweepParams.append("param_y_vals", v));
  sweepParams.append("start", start); sweepParams.append("end", end);
  sweepParams.append("metric", _R.metric);
  api("/api/sweep?"+sweepParams.toString())
    .then(r=>{
      const heat = svgHeatmap(r.matrix, r.x.map(v=>"x="+v), r.y.map(v=>"y="+v), 380, 280);
      const stats = `<div style="margin-top:8px;font-size:11px;color:var(--muted);font-family:JetBrains Mono,monospace">rows = y axis (top_k), cols = x axis (top_k) · cell = ${_R.metric} · hover for value</div>`;
      $("sweep-out").innerHTML = heat + stats;
    }).catch(e=>{ $("sweep-out").textContent = "sweep failed: "+e; });

  // 3) regime breakdown — derive from focus strategy single backtest's monthly returns + SPY trend approximation client-side
  api(`/api/backtest?strategy=${_R.focus}&start=${start}&end=${end}&rebalance=${_R.rebalance}&cost_bps=${_R.cost_bps}`).then(r=>{
    // approximate regime: above/below long-run mean equity as proxy when SPY trend not available client-side
    const eq = r.equity_curve.map(([_,v])=>v);
    const monthlyEq = []; let last = null;
    r.equity_curve.forEach(([d,v])=>{ const m=d.slice(0,7); if(m!==last){monthlyEq.push(v); last=m;} });
    const mret = []; for(let i=1;i<monthlyEq.length;i++) mret.push(monthlyEq[i]/monthlyEq[i-1]-1);
    const pos = mret.filter(x=>x>=0), neg = mret.filter(x=>x<0);
    const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0;
    const std = a => { if(a.length<2) return 0; const m=mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length); };
    const upM = mean(pos)*12, dnM = mean(neg)*12;
    const upS = std(pos)*Math.sqrt(12), dnS = std(neg)*Math.sqrt(12);
    $("regime-out").innerHTML = `
      <table>
        <thead><tr><th>Regime</th><th class=right># months</th><th class=right>Avg ann ret</th><th class=right>Ann vol</th><th class=right>Hit rate</th></tr></thead>
        <tbody>
          <tr><td>up months</td><td class="right mono">${pos.length}</td><td class="right mono green">${(upM*100).toFixed(1)}%</td><td class="right mono">${(upS*100).toFixed(1)}%</td><td class="right mono">${((pos.length/mret.length)*100).toFixed(0)}%</td></tr>
          <tr><td>down months</td><td class="right mono">${neg.length}</td><td class="right mono red">${(dnM*100).toFixed(1)}%</td><td class="right mono">${(dnS*100).toFixed(1)}%</td><td class="right mono">${((neg.length/mret.length)*100).toFixed(0)}%</td></tr>
        </tbody>
      </table>
      <div style="margin-top:10px;font-size:11px;color:var(--muted)">Monthly returns distribution (red = down, green = up)</div>
      ${chartHistogram(mret, {width:480, height:160, bins:15, diverging:true, xKind:"pct"})}`;
  }).catch(e=>{ $("regime-out").textContent = "regime failed: "+e; });

  // 4) Monte Carlo — client-side bootstrap over the focus strategy's monthly returns
  api(`/api/backtest?strategy=${_R.focus}&start=${start}&end=${end}&rebalance=${_R.rebalance}&cost_bps=${_R.cost_bps}`).then(r=>{
    const eq = r.equity_curve.map(([_,v])=>v);
    const dailyRet = []; for(let i=1;i<eq.length;i++) dailyRet.push(eq[i]/eq[i-1]-1);
    if(!dailyRet.length){ $("mc-out").textContent = "no data"; return; }
    const N = 200, T = dailyRet.length;
    const finals = [], maxdds = [];
    for(let s=0;s<N;s++){
      let v=1, peak=1, mdd=0;
      for(let i=0;i<T;i++){ v *= (1 + dailyRet[Math.floor(Math.random()*T)]); if(v>peak) peak=v; mdd=Math.max(mdd, 1-v/peak); }
      finals.push(v**(252/T) - 1); maxdds.push(mdd);
    }
    finals.sort((a,b)=>a-b); maxdds.sort((a,b)=>a-b);
    const pct = (a,p) => a[Math.max(0, Math.min(a.length-1, Math.floor(a.length*p)))];
    const fmt = v => (v*100).toFixed(1)+"%";
    $("mc-out").innerHTML = `
      <table><thead><tr><th>Stat</th><th class=right>p5</th><th class=right>p50</th><th class=right>p95</th></tr></thead>
      <tbody>
        <tr><td>CAGR (resampled)</td><td class="right mono">${fmt(pct(finals,0.05))}</td><td class="right mono">${fmt(pct(finals,0.5))}</td><td class="right mono">${fmt(pct(finals,0.95))}</td></tr>
        <tr><td>Max drawdown</td><td class="right mono red">${fmt(pct(maxdds,0.05))}</td><td class="right mono red">${fmt(pct(maxdds,0.5))}</td><td class="right mono red">${fmt(pct(maxdds,0.95))}</td></tr>
      </tbody></table>
      <div style="margin-top:10px;font-size:11px;color:var(--muted)">CAGR distribution over ${N} bootstrap paths</div>
      ${chartHistogram(finals, {width:480, height:160, bins:20, xKind:"pct"})}`;
  }).catch(e=>{ $("mc-out").textContent = "mc failed: "+e; });

  // 5) Sleeve attribution donut
  api(`/api/backtest?strategy=${_R.focus}&start=${start}&end=${end}&rebalance=${_R.rebalance}&cost_bps=${_R.cost_bps}`).then(r=>{
    const palette = ["#22d3ee","#10b981","#f59e0b","#a855f7","#ef4444","#737373"];
    const items = Object.entries(r.sleeve_attribution).map(([k,v],i)=>({label:k, value:v, color:palette[i%palette.length]}));
    if(!items.length){ $("attr-out").textContent = "no attribution"; return; }
    const legend = items.map(it=>`<div style="font-size:12px"><span style="display:inline-block;width:10px;height:10px;background:${it.color};border-radius:2px;margin-right:6px"></span>${it.label} <span class=mono style="color:var(--muted)">${(it.value*100).toFixed(1)}%</span></div>`).join("");
    $("attr-out").innerHTML = `<div style="display:flex;gap:20px;align-items:center">${svgDonut(items, 180)}<div>${legend}</div></div>`;
  }).catch(e=>{ $("attr-out").textContent = "attribution failed: "+e; });

  // 6) Snapshot header + rolling Sharpe + monthly returns heatmap (all from focus backtest)
  api(`/api/backtest?strategy=${_R.focus}&start=${start}&end=${end}&rebalance=${_R.rebalance}&cost_bps=${_R.cost_bps}`).then(r=>{
    const s = r.summary || {};
    const eq = r.equity_curve;
    const lastEq = eq.length ? eq[eq.length-1][1] : 0;
    const firstEq = eq.length ? eq[0][1] : 0;
    const totalRet = firstEq>0 ? (lastEq/firstEq - 1) : 0;
    const kpi = (label, val, ctx, cls="") => `<div style="display:flex;flex-direction:column;min-width:108px;padding:6px 14px;border-left:1px solid var(--border)">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">${label}</div>
      <div class="mono ${cls}" style="font-size:20px;font-weight:600;margin-top:2px">${val}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:2px">${ctx}</div></div>`;
    const pct = v => (v*100).toFixed(1)+"%";
    const dates = r.equity_curve.map(([d,_])=>d);
    const rangeLabel = dates.length ? `${dates[0]} → ${dates[dates.length-1]}` : (_R.years ? `${_R.years}y` : "custom");
    $("snap-out").innerHTML = `
      <div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 12px 12px 12px;border-bottom:1px solid var(--border);margin-bottom:10px">
        <div style="display:flex;gap:14px;align-items:baseline">
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Focus strategy</div>
          <div class="mono" style="font-size:18px;color:var(--cyan);font-weight:600">${_R.focus}</div>
        </div>
        <div style="font-size:11px;color:var(--muted);font-family:JetBrains Mono,monospace">
          ${rangeLabel} · ${_R.rebalance} · ${r.trade_log ? r.trade_log.length : 0} rebalances · ${_R.cost_bps} bps cost
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap">
        ${kpi("Total return", pct(totalRet), "cumulative", totalRet>=0?"green":"red")}
        ${kpi("CAGR", pct(s.CAGR||0), "annualized", (s.CAGR||0)>=0?"green":"red")}
        ${kpi("Vol", pct(s.ann_vol||0), "ann. realized", "amber")}
        ${kpi("Sharpe", (s.Sharpe||0).toFixed(2), "(μ−rf)/σ", (s.Sharpe||0)>1?"green":((s.Sharpe||0)<0?"red":""))}
        ${kpi("Sortino", (s.Sortino||0).toFixed(2), "downside-only σ", "")}
        ${kpi("Max DD", pct(s.max_DD||0), "peak to trough", "red")}
        ${kpi("Calmar", (s.Calmar||0).toFixed(2), "CAGR / |max DD|", "")}
        ${kpi("Win rate", pct(s.win_rate||0), "positive months", "")}
        ${kpi("Best mo", pct(s.best_month||0), "single best", "green")}
        ${kpi("Worst mo", pct(s.worst_month||0), "single worst", "red")}
        ${kpi("Rebalances", `${(r.trade_log||[]).length}`, _R.rebalance, "")}
      </div>`;

    // Recent rebalances table (last 30) — top holdings per rebalance with turnover + cost
    const tl = (r.trade_log||[]).slice(-30).reverse();
    const rebalEl = document.getElementById("rebal-out");
    if(rebalEl){
      if(!tl.length){ rebalEl.innerHTML = `<div style="color:var(--muted)">no rebalances yet</div>`; }
      else {
        const rows = tl.map(t => {
          const ws = Object.entries(t.weights||{}).filter(([k,v])=>v>0.005)
            .sort((a,b)=>b[1]-a[1])
            .map(([k,v])=>`${k} ${(v*100).toFixed(0)}%`).join(" · ");
          return `<tr>
            <td class=mono style="font-size:11px">${t.date}</td>
            <td class="right mono">${(t.turnover*100).toFixed(1)}%</td>
            <td class="right mono red">-$${t.cost.toFixed(0)}</td>
            <td style="font-size:11.5px">${ws}</td>
          </tr>`;
        }).join("");
        rebalEl.innerHTML = `<table>
          <thead><tr><th>Date</th><th class=right>Turnover</th><th class=right>Cost</th><th>Top holdings</th></tr></thead>
          <tbody>${rows}</tbody></table>
          <div style="font-size:11px;color:var(--muted);margin-top:6px">Last ${tl.length} rebalance events · ranked most-recent first</div>`;
      }
    }

    // rolling Sharpe
    const rs = r.rolling_sharpe || [];
    if (rs.length) {
      $("roll-out").innerHTML = chartLines(
        [{label:"rolling 12-mo Sharpe", color:"var(--cyan)",
          values: rs.map(([_,v])=>v), dates: rs.map(([d,_])=>d)}],
        {width:1080, height:180, zero:true}
      ) + `<div style="font-size:11px;color:var(--muted);margin-top:6px">${rs.length} daily samples · mean ${(rs.reduce((a,[_,v])=>a+v,0)/rs.length).toFixed(2)} · last ${rs[rs.length-1][1].toFixed(2)} (hover for date+value)</div>`;
    } else {
      $("roll-out").textContent = "no rolling Sharpe (need ≥ 1y of bars)";
    }

    // monthly returns heatmap (year × month)
    const grid = r.monthly_grid || {};
    const years = Object.keys(grid).sort();
    if (!years.length) { $("mhm-out").textContent = "no monthly returns"; }
    else {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      let allVals = [];
      years.forEach(y => Object.values(grid[y]).forEach(v => allVals.push(v)));
      const maxAbs = Math.max(0.001, ...allVals.map(Math.abs));
      const cell = v => {
        if (v === undefined) return `<td style="background:var(--bg);color:var(--muted)" class="right mono">—</td>`;
        const t = Math.min(1, Math.abs(v)/maxAbs);
        const col = v>=0
          ? `rgba(16,185,129,${0.15+0.7*t})`
          : `rgba(239,68,68,${0.15+0.7*t})`;
        return `<td style="background:${col}" class="right mono">${(v*100).toFixed(1)}</td>`;
      };
      const yearTotal = y => {
        let prod = 1;
        for (let m=1;m<=12;m++) { const v = grid[y][m]; if (v!==undefined) prod *= (1+v); }
        return prod - 1;
      };
      $("mhm-out").innerHTML = `<table style="font-size:12px">
        <thead><tr><th>Year</th>${months.map(m=>`<th class=right>${m}</th>`).join("")}<th class=right>Year</th></tr></thead>
        <tbody>${years.map(y=>{
          const yt = yearTotal(y);
          return `<tr><td class=mono>${y}</td>${
            Array.from({length:12},(_,i)=> cell(grid[y][i+1])).join("")
          }<td class="right mono ${yt>=0?'green':'red'}"><b>${(yt*100).toFixed(1)}</b></td></tr>`;
        }).join("")}</tbody></table>`;
    }
  }).catch(e=>{
    $("snap-out").textContent = "snapshot failed: "+e;
    $("roll-out").textContent = "—"; $("mhm-out").textContent = "—";
  });

  // 7) Walk-forward
  api(`/api/walk_forward?strategy=${_R.focus}&start=${start}&end=${end}&n_folds=4&rebalance=${_R.rebalance}`).then(folds=>{
    if(!folds || !folds.length){ $("wf-out").textContent = "not enough history"; return; }
    const fmt = v => (v*100).toFixed(1)+"%";
    $("wf-out").innerHTML = `<table style="font-size:12px"><thead><tr>
      <th>Fold</th><th>In-sample range</th><th>OOS range</th>
      <th class=right>IS CAGR</th><th class=right>OOS CAGR</th>
      <th class=right>IS Sharpe</th><th class=right>OOS Sharpe</th>
      <th class=right>IS max DD</th><th class=right>OOS max DD</th></tr></thead><tbody>` +
      folds.map(f=>`<tr>
        <td class=mono>${f.fold}</td>
        <td class=mono style="font-size:11px;color:var(--muted)">${f.in_sample[0]} → ${f.in_sample[1]}</td>
        <td class=mono style="font-size:11px;color:var(--muted)">${f.oos[0]} → ${f.oos[1]}</td>
        <td class="right mono">${fmt(f.is_summary.CAGR)}</td>
        <td class="right mono ${f.oos_summary.CAGR>=0?'green':'red'}">${fmt(f.oos_summary.CAGR)}</td>
        <td class="right mono">${f.is_summary.Sharpe.toFixed(2)}</td>
        <td class="right mono ${f.oos_summary.Sharpe>1?'green':(f.oos_summary.Sharpe<0?'red':'')}">${f.oos_summary.Sharpe.toFixed(2)}</td>
        <td class="right mono red">${fmt(f.is_summary.max_DD)}</td>
        <td class="right mono red">${fmt(f.oos_summary.max_DD)}</td>
      </tr>`).join("") + `</tbody></table>
      <div style="font-size:11px;color:var(--muted);margin-top:8px">OOS = out-of-sample. Big IS↔OOS gap = overfitting risk.</div>`;
  }).catch(e=>{ $("wf-out").textContent = "walk-forward failed: "+e; });

  // 8) Strategy correlation matrix
  api(`/api/strategy_corr?strategies=${picked.join(",")}&start=${start}&end=${end}&rebalance=${_R.rebalance}`).then(r=>{
    if(!r.names.length){ $("corr-out").textContent = "no data"; return; }
    const labels = r.names;
    // Correlation is bounded ±1; force the color scale so colors are comparable across renders.
    $("corr-out").innerHTML = svgHeatmap(r.matrix, labels, labels, 520, 320,
      {colorMode:"corr", lo:-1, hi:1}) +
      `<div style="font-size:11px;color:var(--muted);margin-top:8px">
        Pearson correlation of daily returns. <span style="color:var(--green)">Green = uncorrelated (diversifying)</span>,
        <span style="color:var(--red)">red = move together</span>. Diagonal is self-correlation = 1.
      </div>`;
  }).catch(e=>{ $("corr-out").textContent = "corr failed: "+e; });
};
tick(); setInterval(tick, 30000);
selectTab("research");
</script></body></html>"""

# -- CLI ----------------------------------------------------------------------
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="portfolio_rotation",
        description="Personal portfolio research & rebalance dashboard.")
    p.add_argument("--dashboard", action="store_true")
    p.add_argument("--dashboard-port", type=int, default=8780)
    p.add_argument("--backtest", action="store_true")
    p.add_argument("--recommend", action="store_true")
    p.add_argument("--strategy", default="momentum")
    p.add_argument("--start", default="2010-01-01")
    p.add_argument("--end", default=None)
    p.add_argument("--mock", action="store_true")
    p.add_argument("--state-file", default="portfolio_state.json")
    p.add_argument("--universe", default=None,
                   help="Comma-separated ticker override")
    p.add_argument("--log-level", default="INFO")
    return p

def main(argv=None):
    try:
        args = _build_parser().parse_args(argv)
    except SystemExit as e:
        return int(e.code) if e.code is not None else 0
    logging.basicConfig(level=getattr(logging, args.log_level.upper()),
                        format="%(asctime)s %(levelname)s %(message)s")
    store = DataStore(mock=args.mock)
    state_path = Path(args.state_file)
    if args.dashboard:
        th, server = start_dashboard(port=args.dashboard_port, store=store,
                                     state_path=state_path, mock=args.mock)
        try:
            while True: time.sleep(1)
        except KeyboardInterrupt:
            server.shutdown(); th.join(timeout=5); return 0
    if args.backtest:
        res = BacktestEngine(store).run(args.strategy, args.start, args.end or str(date.today()))
        print(json.dumps(res.summary, indent=2, default=str)); return 0
    if args.recommend:
        s = load_state(state_path)
        for r in Recommender(store).run(s, date.today()):
            print(f"{r.action:5s} {r.ticker:10s} P{r.priority} drift={r.drift:+.1%} Δ$={r.delta_dollars:+,.0f}")
        return 0
    LOG.info("no mode selected"); return 0

def _mode(a) -> str:
    return "dashboard" if a.dashboard else ("backtest" if a.backtest else ("recommend" if a.recommend else "noop"))

if __name__ == "__main__":
    sys.exit(main())
