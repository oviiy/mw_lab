"""Daily prices and split events behind a swappable PriceSource (default: yfinance)."""
from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path
from typing import Protocol

import pandas as pd

from .config import CACHE_DIR

PRICE_COLS = ["date", "ticker", "close", "adj_close", "split"]


def _empty() -> pd.DataFrame:
    return pd.DataFrame({"date": pd.Series(dtype="datetime64[ns]"), "ticker": pd.Series(dtype=str),
                         "close": pd.Series(dtype=float), "adj_close": pd.Series(dtype=float),
                         "split": pd.Series(dtype=float)})


class PriceSource(Protocol):
    def fetch(self, tickers: list[str], start: date, end: date) -> pd.DataFrame: ...


class YFinanceSource:
    def fetch(self, tickers: list[str], start: date, end: date) -> pd.DataFrame:
        import yfinance as yf

        raw = yf.download(tickers, start=start.isoformat(), end=(end + timedelta(days=1)).isoformat(),
                          actions=True, auto_adjust=False, progress=False, threads=True, group_by="column")
        if raw is None or raw.empty:
            return _empty()
        parts = [raw[col].stack(future_stack=True).rename(name)
                 for col, name in (("Close", "close"), ("Adj Close", "adj_close"), ("Stock Splits", "split"))]
        df = pd.concat(parts, axis=1).reset_index()
        df.columns = PRICE_COLS
        df = df.dropna(subset=["close"])
        df["split"] = df["split"].fillna(0.0)
        return df


def update_prices(source: PriceSource, tickers, start: date, end: date, path: Path = CACHE_DIR / "prices.parquet",
                  chunk: int = 100, today: date | None = None, passes: int = 3, pause: float = 3.0,
                  sleep=None) -> pd.DataFrame:
    """Fetch missing (or, when the cache is stale, all) tickers; retry still-missing ones in later passes,
    since Yahoo rate-limits bursts and silently drops tickers."""
    import time

    sleep = sleep or time.sleep
    path = Path(path)
    today = today or date.today()
    have = pd.read_parquet(path) if path.exists() else _empty()
    stale = have.empty or have["date"].max().date() < min(end, today) - timedelta(days=4)
    wanted = sorted(set(tickers))
    need = wanted if stale else sorted(set(wanted) - set(have["ticker"].unique()))
    frames = [have[~have["ticker"].isin(need)]] if not have.empty else []
    for p in range(passes):
        if not need:
            break
        if p:
            print(f"[prices] pass {p + 1}: retrying {len(need)} tickers after a pause")
            sleep(60 * p)
        got = []
        for i in range(0, len(need), chunk):
            print(f"[prices] {i + len(need[i:i + chunk])}/{len(need)}")
            df = source.fetch(need[i:i + chunk], start, end)
            frames.append(df)
            got += list(df["ticker"].unique())
            sleep(pause)
        need = sorted(set(need) - set(got))
    if need:
        print(f"[prices] no data for {len(need)} tickers (delisted or not on Yahoo): {need[:20]}")
    out = pd.concat(frames, ignore_index=True) if frames else _empty()
    out = out.drop_duplicates(["date", "ticker"], keep="last").sort_values(["ticker", "date"]).reset_index(drop=True)
    path.parent.mkdir(parents=True, exist_ok=True)
    out.to_parquet(path, index=False)
    return out


def split_factors(prices: pd.DataFrame, ticker_by_cusip: dict[str, str], periods: list[date]) -> pd.DataFrame:
    cols = ["cusip", "pi", "factor"]
    sp = prices[prices["split"] > 0]
    if sp.empty:
        return pd.DataFrame(columns=cols)
    ends = pd.to_datetime(pd.Series(periods)).values
    pi = ends.searchsorted(sp["date"].values, side="left")
    sp = sp.assign(pi=pi)
    sp = sp[(sp["pi"] >= 1) & (sp["pi"] < len(periods))]
    by_t = sp.groupby(["ticker", "pi"])["split"].prod().rename("factor").reset_index()
    m = pd.DataFrame(list(ticker_by_cusip.items()), columns=["cusip", "ticker"])
    out = m.merge(by_t, on="ticker")[cols]
    return out[out["factor"] != 1].reset_index(drop=True)


def wide_adj_close(prices: pd.DataFrame) -> pd.DataFrame:
    w = prices.pivot_table(index="date", columns="ticker", values="adj_close", aggfunc="last").sort_index()
    return w.ffill()
