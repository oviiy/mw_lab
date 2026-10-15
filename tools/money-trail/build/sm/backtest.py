"""Buy-and-hold clone of a manager's reported long book, rebalanced at each disclosure."""
from __future__ import annotations

import math
from dataclasses import dataclass

import pandas as pd


@dataclass
class Rebalance:
    date: pd.Timestamp
    weights: dict[str, float]
    coverage: float


def trading_day_after(index: pd.DatetimeIndex, d) -> pd.Timestamp | None:
    pos = index.searchsorted(pd.Timestamp(d), side="right")
    return index[pos] if pos < len(index) else None


def trading_day_on_or_before(index: pd.DatetimeIndex, d) -> pd.Timestamp | None:
    pos = index.searchsorted(pd.Timestamp(d), side="right") - 1
    return index[pos] if pos >= 0 else None


def make_rebalance(day: pd.Timestamp, positions: pd.Series, total_value: float, px: pd.DataFrame) -> Rebalance | None:
    priced = {}
    for t, v in positions.items():
        if t and t in px.columns and pd.notna(px.at[day, t]) and v > 0:
            priced[t] = float(v)
    s = sum(priced.values())
    if s <= 0 or total_value <= 0:
        return None
    return Rebalance(day, {t: v / s for t, v in priced.items()}, s / total_value)


def run_clone(rebs: list[Rebalance], px: pd.DataFrame, end: pd.Timestamp) -> pd.Series:
    rebs = sorted({r.date: r for r in rebs}.values(), key=lambda r: r.date)
    parts, level = [], 1.0
    for i, r in enumerate(rebs):
        stop = rebs[i + 1].date if i + 1 < len(rebs) else end
        seg = px.loc[r.date:stop, list(r.weights)]
        rel = (seg / seg.iloc[0]).mul(pd.Series(r.weights)).sum(axis=1)
        vals = level * rel
        level = float(vals.iloc[-1])
        parts.append(vals.iloc[:-1] if i + 1 < len(rebs) else vals)
    return pd.concat(parts)


def perf_stats(v: pd.Series) -> dict:
    r = v.pct_change().dropna()
    years = (v.index[-1] - v.index[0]).days / 365.25
    cagr = (v.iloc[-1] / v.iloc[0]) ** (1 / years) - 1 if years > 0 else None
    vol = float(r.std() * math.sqrt(252)) if len(r) > 1 else None
    sharpe = float(r.mean() * 252 / vol) if vol else None
    mdd = float((v / v.cummax() - 1).min())
    return {"cagr": None if cagr is None else float(cagr), "vol": vol, "sharpe": sharpe, "mdd": mdd}
