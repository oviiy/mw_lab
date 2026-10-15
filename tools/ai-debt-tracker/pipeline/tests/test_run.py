from aidebt.enrich import Series
from aidebt.run import HEADLINE_EXCLUDES, dedupe
from aidebt.text import html_to_text, sections


def _rec(**kw):
    base = dict(issuer_id="coreweave", currency="USD", amount=2e9, maturity_date="2030-06-01",
                coupon_pct=9.25, instrument_type="senior_notes", trade_date="2025-05-21",
                ai_flag="general", source_url="a", price_pct=None)
    base.update(kw)
    return base


def test_dedupe_merges_pricing_release_and_closing_8k():
    pricing = _rec(source_url="pricing", price_pct=100.0)
    closing = _rec(source_url="closing", trade_date="2025-05-27", ai_flag="explicit")
    out = dedupe([closing, pricing])
    assert len(out) == 1
    r = out[0]
    assert r["source_url"] == "pricing"           # richer record wins
    assert r["trade_date"] == "2025-05-21"        # earliest date kept
    assert r["ai_flag"] == "explicit"             # any explicit mention wins
    assert r["other_sources"] == ["closing"]


def test_distinct_tranches_survive_dedupe():
    out = dedupe([_rec(), _rec(maturity_date="2031-02-01", coupon_pct=9.0)])
    assert len(out) == 2


def test_revolvers_are_not_headline_debt():
    assert "revolver" in HEADLINE_EXCLUDES
    assert "term_loan" not in HEADLINE_EXCLUDES


def test_series_asof_uses_last_observation():
    s = Series([("2025-01-02", 0.8), ("2025-01-03", 0.82), ("2025-01-06", 0.85)])
    assert s.asof("2025-01-05") == 0.82  # weekend -> Friday
    assert s.asof("2025-01-01") is None
    assert s.since("2025-01-03") == [("2025-01-03", 0.82), ("2025-01-06", 0.85)]


def test_html_to_text_and_sections():
    html = (b"<p>Table of Contents</p><p>Use of Proceeds</p><p>Risk</p>"
            b"<p>Use of Proceeds</p><p>We intend to use the net proceeds for data centers.</p>"
            b"<table><tr><td>A</td><td>B</td></tr></table>")
    text = html_to_text(html)
    assert "A | B" in text
    wins = sections(text, "Use of Proceeds")
    assert len(wins) == 1 and "data centers" in wins[0]
