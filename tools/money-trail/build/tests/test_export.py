import json

import pytest

from sm import export as ex
from tests import tiny


@pytest.fixture(scope="module")
def out(tmp_path_factory):
    d = tmp_path_factory.mktemp("data")
    stats = ex.export_all(tiny.inputs(), tiny.SETTINGS, tiny.MANAGERS, d)
    return d, stats


def J(d, rel):
    return json.loads((d / rel).read_text(encoding="utf-8"))


def test_files_written(out):
    d, stats = out
    assert (d / "meta.json").exists() and (d / "home.json").exists()
    assert sorted(p.name for p in (d / "managers").iterdir()) == ["1.json", "2.json"]
    assert sorted(p.name for p in (d / "stocks").iterdir()) == ["AAA.json", "BBB.json", "CCC.json"]
    assert stats["stocks"] == 3


def test_manager_alpha(out):
    m = J(out[0], "managers/1.json")
    assert m["periods"] == ["2025-03-31", "2025-06-30", "2025-09-30"]
    assert m["series"]["n"] == [2, 2, 2]
    assert m["series"]["turnover"][1] == 0.0
    kinds = {r["t"] or r["n"]: r["k"] for r in m["changes"]["rows"]}
    assert kinds == {"AAA": "hold", "CCC": "new", "BBB": "exit"}   # 2:1 split on AAA is not an add
    assert m["changes"]["prev_period"] == "2025-06-30"
    assert m["options"] == [{"t": "AAA", "n": "AAA CORP", "pc": "PUT", "v": 300}]
    assert m["city"] == "NEW YORK"
    assert m["sources"][-1]["url"].startswith("https://www.sec.gov/cgi-bin/browse-edgar")
    assert m["backtest"] is not None and len(m["backtest"]["coverage"]) == 3
    assert m["race"]["frames"][2][0] == {"t": "AAA", "v": 2600}


def test_manager_beta_missing_quarter_and_unmapped(out):
    m = J(out[0], "managers/2.json")
    assert m["series"]["value"] == [100, None, 310]
    assert m["sectors"]["weights"][1] is None
    assert m["race"]["frames"][1] == []
    rows = {r["n"]: r for r in m["changes"]["rows"]}
    assert rows["MYSTERY CO"]["k"] == "new" and rows["MYSTERY CO"]["t"] is None
    assert rows["AAA CORP"]["k"] == "hold"
    assert m["changes"]["prev_period"] == "2025-03-31"
    assert m["backtest"]["coverage"][-1] == pytest.approx(260 / 310, abs=1e-3)


def test_stock_bbb(out):
    s = J(out[0], "stocks/BBB.json")
    assert s["holders"]["count"] == [2, 2, 1]
    assert s["holders"]["pct"][0] == pytest.approx(0.105)
    items = {(i["kind"], i["group"]): i["dollars"] for i in s["flows"]["items"]}
    assert items == {("exit", "curated"): 2200, ("trim", "other"): 11500}
    assert s["curated"] == []
    assert len(s["price"]["dates"]) == len(s["price"]["close"]) > 30


def test_stock_aaa_curated_holders(out):
    s = J(out[0], "stocks/AAA.json")
    names = {c["name"]: c for c in s["curated"]}
    assert set(names) == {"Alpha Capital", "Beta Partners"}
    assert names["Alpha Capital"]["first"] == "2025-03-31"
    assert 0 <= s["crowding"]["score"] <= 100


def test_home(out):
    h = J(out[0], "home.json")
    bought = {r["t"]: r for r in h["most_bought"]}
    assert bought["CCC"]["new"] == 1 and bought["CCC"]["who"] == ["Alpha Capital"]
    sold = {r["t"]: r for r in h["most_sold"]}
    assert sold["BBB"]["exit"] == 1 and sold["BBB"]["net"] == 1
    assert h["sector_flows"]["sells"]["金融"] == 2200
    assert h["sector_flows"]["buys"]["能源"] == 500


def test_meta(out):
    m = J(out[0], "meta.json")
    assert m["latest_period"] == "2025-09-30"
    assert [x["cik"] for x in m["managers"]] == [1, 2]
    alpha = m["managers"][0]
    assert alpha["chg"] == {"new": 1, "add": 0, "trim": 0, "exit": 1} and alpha["top"][0]["t"] == "AAA"
    assert alpha["period"] == "2025-09-30" and alpha["cagr"] is not None
    assert {s["t"] for s in m["stocks"]} == {"AAA", "BBB", "CCC"}
    assert m["universe"]["filers"] == 3
    assert m["coverage"]["unmapped_cusips"] == 1


def test_budget_enforced(tmp_path):
    small = tiny.SETTINGS.__class__(**{**tiny.SETTINGS.__dict__, "stock_json_max_kb": 0})
    with pytest.raises(ex.BudgetError, match="stocks/"):
        ex.export_all(tiny.inputs(), small, tiny.MANAGERS, tmp_path)


def test_flows(out):
    f = J(out[0], "flows.json")
    assert f["managers"]["1"] == "Alpha Capital"
    rows = {(r[0], r[1], r[2]): (r[3], r[4]) for r in f["rows"]}
    assert rows[(1, 1, "BBB")] == ("a", 1100)          # +50 shares at $22
    assert rows[(2, 1, "BBB")] == ("x", -2200)         # sold out 100 shares at $22
    assert rows[(2, 1, "CCC")] == ("n", 500)
    assert (2, 1, "AAA") not in rows                   # 2:1 split, unchanged
    assert rows[(2, 2, "MYSTERY CO")] == ("n", 50)     # beta, compared with its p0 filing
    assert f["stocks"]["MYSTERY CO"][2] is False and f["stocks"]["CCC"][2] is True
