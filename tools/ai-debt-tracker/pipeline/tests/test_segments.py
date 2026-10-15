"""Segment numbers are only published if their quote is verbatim in the filing and contains the number."""
import re

from aidebt import segments as S
from aidebt.text import html_to_text

FILING = b"""
<html><body>
<xbrli:context id="c-aws-q"><xbrli:entity><xbrli:segment>
<xbrldi:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">amzn:AmazonWebServicesSegmentMember</xbrldi:explicitMember>
</xbrli:segment></xbrli:entity><xbrli:period><xbrli:startDate>2026-04-01</xbrli:startDate><xbrli:endDate>2026-06-30</xbrli:endDate></xbrli:period></xbrli:context>
<xbrli:context id="c-na-q"><xbrli:entity><xbrli:segment>
<xbrldi:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">amzn:NorthAmericaSegmentMember</xbrldi:explicitMember>
</xbrli:segment></xbrli:entity><xbrli:period><xbrli:startDate>2026-04-01</xbrli:startDate><xbrli:endDate>2026-06-30</xbrli:endDate></xbrli:period></xbrli:context>
<table>
<tr><td>North America</td><td><ix:nonFraction name="us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax" contextRef="c-na-q" scale="6">110,512</ix:nonFraction></td></tr>
<tr><td>AWS</td><td>$</td><td><ix:nonFraction name="us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax" contextRef="c-aws-q" scale="6" decimals="-6">42,230</ix:nonFraction></td></tr>
</table>
<p>Azure and other cloud services revenue increased 40%. Windows revenue decreased 2%.</p>
</body></html>
"""
SPEC = {"member": ["us-gaap:StatementBusinessSegmentsAxis", "amzn:AmazonWebServicesSegmentMember"],
        "tags": ["RevenueFromContractWithCustomerExcludingAssessedTax"]}


def test_ixbrl_fact_extracted_with_row_quote():
    facts = S.ixbrl_facts(FILING.decode(), SPEC["member"], SPEC["tags"])
    assert len(facts) == 1  # North America has a different member and is ignored
    f = facts[0]
    assert f["val"] == 42_230_000_000
    assert (f["start"], f["end"]) == ("2026-04-01", "2026-06-30")
    assert "AWS" in f["quote"] and "42,230" in f["quote"]
    assert S.validate(f, html_to_text(FILING)) == []


def test_wrong_quote_is_rejected():
    f = S.ixbrl_facts(FILING.decode(), SPEC["member"], SPEC["tags"])[0]
    forged = dict(f, quote="AWS | $ | 24,230")  # a digit changed: not in the filing
    assert "quote not found verbatim in filing" in S.validate(forged, html_to_text(FILING))


def test_number_must_appear_in_its_quote():
    f = S.ixbrl_facts(FILING.decode(), SPEC["member"], SPEC["tags"])[0]
    swapped = dict(f, quote="North America | 110,512")  # real text, but not this number's row
    assert "number does not appear in its quote" in S.validate(swapped, html_to_text(FILING))


def test_azure_growth_pattern_matches_disclosed_percentage():
    pattern = "Azure and other cloud services revenue (?:increased|grew) (\\d+(?:\\.\\d+)?)%"
    text = html_to_text(FILING)
    m = re.search(pattern, text)
    assert m and m.group(1) == "40"
