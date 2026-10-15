"""Signals that separate informative disclosed buys from noise, all computed without look-ahead.

- skill: a player's average 3-month excess return on earlier buys whose outcome was already known on this date
- consensus: distinct players buying the ticker in the trailing 60 days (this buy included)
- groups60: distinct player groups (fund / congress / insider) buying it in the trailing 60 days
- mom: the stock's return over the 63 trading days before the buy became public
"""
from __future__ import annotations

import numpy as np
import pandas as pd

HOLD = 63
WINDOW_DAYS = 60

RULES = {
    "fund_mom": "fund buys of stocks up ≥10% over the prior 3 months, by managers with a positive walk-forward record",
    "fund_proven": "fund buys by managers whose earlier buys averaged ≥2% excess (walk-forward)",
    "congress_crowd": "Congress buys of a stock that ≥3 members bought within 60 days",
    "insider_confirmed": "insider buys confirmed by a fund or Congress buy of the same stock within 60 days",
}


def realised_excess(events: pd.DataFrame, px: pd.DataFrame, hold: int = HOLD) -> tuple[np.ndarray, np.ndarray]:
    """(excess return vs SPY `hold` days after day 0, date on which that result became known)."""
    from .congress_export import excess_paths

    paths, starts = excess_paths(events.reset_index(drop=True), px, "date", days=hold)
    idx = px.index
    known = np.array([idx[s + hold] if 0 <= s < len(idx) - hold else np.datetime64("2100-01-01") for s in starts], dtype="datetime64[ns]")
    return paths[:, hold], known


def walk_skill(pid: np.ndarray, date: np.ndarray, known: np.ndarray, ex: np.ndarray, min_n: int = 5) -> tuple[np.ndarray, np.ndarray]:
    """For each event, the player's mean `ex` over their own events with known < date (strictly earlier results)."""
    skill = np.full(len(pid), np.nan)
    count = np.zeros(len(pid), dtype=int)
    order = pd.Series(np.arange(len(pid))).groupby(pid).apply(list)
    for rows in order:
        rows = np.array(rows)
        kd, kx, dd = known[rows], ex[rows], date[rows]
        srt = np.argsort(kd)
        kd_s, kx_s = kd[srt], kx[srt]
        ok = np.isfinite(kx_s)
        csum = np.cumsum(np.where(ok, kx_s, 0.0))
        ccnt = np.cumsum(ok)
        pos = np.searchsorted(kd_s, dd, side="left")          # results known strictly before the event date
        for r, p in zip(rows, pos):
            n = ccnt[p - 1] if p > 0 else 0
            if n >= min_n:
                skill[r] = csum[p - 1] / n
                count[r] = n
    return skill, count


def trailing_distinct(ticker: np.ndarray, date: np.ndarray, key: np.ndarray, days: int = WINDOW_DAYS) -> np.ndarray:
    """Distinct `key` values among events on the same ticker within (date - days, date]."""
    out = np.zeros(len(ticker), dtype=int)
    win = np.timedelta64(days, "D")
    for rows in pd.Series(np.arange(len(ticker))).groupby(ticker).apply(list):
        rows = np.array(rows)
        d, k = date[rows], key[rows]
        srt = np.argsort(d)
        d, k, rows = d[srt], k[srt], rows[srt]
        lo = 0
        for i in range(len(rows)):
            while d[lo] < d[i] - win:
                lo += 1
            hi = np.searchsorted(d, d[i], side="right")
            out[rows[i]] = len(set(k[lo:hi]))
    return out


def momentum(events: pd.DataFrame, px: pd.DataFrame, lookback: int = 63) -> np.ndarray:
    idx = px.index
    cols = {c: i for i, c in enumerate(px.columns)}
    vals = px.values
    pos = idx.searchsorted(pd.to_datetime(events["date"]).values, side="right")
    out = np.full(len(events), np.nan)
    for k, (t, p) in enumerate(zip(events["ticker"].values, pos)):
        j = cols.get(t)
        if j is not None and lookback <= p < len(idx) and vals[p - lookback, j] > 0:
            out[k] = vals[p, j] / vals[p - lookback, j] - 1
    return out


def annotate(events: pd.DataFrame, px: pd.DataFrame) -> pd.DataFrame:
    """events: g, pid, ticker, date. Adds ex, known, skill, skill_n, consensus, groups60, mom and the rule flags."""
    e = events.copy()
    e["date"] = pd.to_datetime(e["date"])
    e = e.sort_values("date").reset_index(drop=True)
    e["ex"], e["known"] = realised_excess(e, px)
    e["skill"], e["skill_n"] = walk_skill(e["pid"].values, e["date"].values.astype("datetime64[ns]"), e["known"].values, e["ex"].values)
    e["consensus"] = trailing_distinct(e["ticker"].values, e["date"].values.astype("datetime64[ns]"), e["pid"].values)
    e["groups60"] = trailing_distinct(e["ticker"].values, e["date"].values.astype("datetime64[ns]"), e["g"].values)
    e["mom"] = momentum(e, px)
    e["fund_mom"] = (e["g"] == "fund") & (e["mom"] >= 0.10) & (e["skill"] > 0)
    e["fund_proven"] = (e["g"] == "fund") & (e["skill"] > 0.02)
    e["congress_crowd"] = (e["g"] == "congress") & (e["consensus"] >= 3)
    e["insider_confirmed"] = (e["g"] == "insider") & (e["groups60"] >= 2)
    e["smart"] = e[list(RULES)].any(axis=1)
    return e
