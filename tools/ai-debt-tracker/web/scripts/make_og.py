"""Render the 1200x630 social card (public/og.png) from the live dataset.

The card is the hero chart in miniature: one line per bond, claret while the
financed servers are in service, blue after. Run by `npm run build`.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WEB = Path(__file__).resolve().parents[1]
DATA = WEB.parent / "data" / "public"
FONTS = WEB / "node_modules" / "@fontsource"

PAPER = (248, 241, 231)
INK = (28, 26, 23)
MUTED = (110, 101, 91)
CLARET = (153, 15, 61)
BLUE = (15, 84, 153)
S = 2  # supersample, then downscale for smooth lines


def font(family: str, weight: int, size: int) -> ImageFont.FreeTypeFont:
    path = FONTS / family / "files" / f"{family}-latin-{weight}-normal.woff"
    return ImageFont.truetype(str(path), size * S)


def years_since(d0: date, iso: str) -> float:
    return (date.fromisoformat(iso) - d0).days / 365.25


def main() -> None:
    bonds = [b for b in json.loads((DATA / "bonds.json").read_text())["bonds"] if b["in_headline"]]
    issuers = json.loads((DATA / "issuers.json").read_text())["issuers"]
    metrics = json.loads((DATA / "metrics.json").read_text())
    life = {i["id"]: (i["useful_life"] or {}).get("years", 6) for i in issuers}
    bonds.sort(key=lambda b: (b["trade_date"], -b["tenor_years"]))

    W, H = 1200 * S, 630 * S
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    title = font("spectral", 700, 50)
    sub = font("spectral", 400, 24)
    small = font("ibm-plex-sans-condensed", 500, 17)

    pad = 64 * S
    d.text((pad, 52 * S), "The chips wear out in six years.", font=title, fill=INK)
    d.text((pad, 112 * S), "The debt runs for decades.", font=title, fill=INK)
    total = metrics["headline_usd"] / 1e9
    share = round(metrics["share_outliving_hardware"] * 100)
    d.text((pad, 186 * S), f"${total:,.0f} billion borrowed to build AI since 2024. {share}% outlives the servers.",
           font=sub, fill=MUTED)

    # chart band
    top, bottom = 250 * S, 560 * S
    x0, x1 = pad, W - pad
    start = date(2024, 1, 1)
    span = 44.0  # years shown: 2024 -> 2068
    step = (bottom - top) / max(1, len(bonds))
    max_amt = max(b["amount_usd"] for b in bonds)
    for i, b in enumerate(bonds):
        y = top + i * step
        w = max(1, round((0.35 + 2.4 * (b["amount_usd"] / max_amt) ** 0.5) * S))
        a = years_since(start, b["trade_date"])
        m = min(years_since(start, b["maturity_date"]), span)
        l_end = min(a + life.get(b["issuer_id"], 6), m)
        X = lambda t: x0 + (x1 - x0) * t / span  # noqa: E731
        d.line([(X(a), y), (X(l_end), y)], fill=CLARET, width=w)
        if m > l_end:
            d.line([(X(l_end), y), (X(m), y)], fill=BLUE, width=w)

    d.text((pad, 580 * S), "AI Debt Tracker  |  every bond from SEC filings", font=small, fill=MUTED)

    out = img.resize((1200, 630), Image.LANCZOS)
    (WEB / "public").mkdir(exist_ok=True)
    out.save(WEB / "public" / "og.png", optimize=True)
    print("wrote public/og.png")


if __name__ == "__main__":
    main()
