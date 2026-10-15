"""The extraction eval is a CI gate: key fields must match the gold labels exactly."""
import json
import shutil

from aidebt import evaluate as ev


def test_extractions_match_gold_labels():
    r = ev.evaluate()
    assert r["documents"] >= 15
    assert r["tranche_recall"] == 1.0, [d for d in r["docs"] if d["missing"]]
    assert r["tranche_precision"] == 1.0, [d for d in r["docs"] if d["extra"]]
    for field, acc in r["field_accuracy"].items():
        assert acc == 1.0, (field, [d["field_errors"] for d in r["docs"] if d["field_errors"]])


def test_eval_detects_injected_errors(tmp_path, monkeypatch):
    """Guard against a vacuous eval: corrupt one extraction and expect it to be caught."""
    for p in ev.EXTRACTIONS.glob("*.json"):
        shutil.copy(p, tmp_path / p.name)
    target = tmp_path / "0001193125-25-258837.json"
    data = json.loads(target.read_text())
    data["tranches"][0]["amount"] = 4_500_000_000   # wrong amount
    data["tranches"][1]["spread_bp"] = 71            # wrong spread
    data["tranches"].pop()                           # dropped tranche
    target.write_text(json.dumps(data))
    monkeypatch.setattr(ev, "EXTRACTIONS", tmp_path)

    r = ev.evaluate()
    assert r["tranche_recall"] < 1.0
    assert r["field_accuracy"]["amount"] < 1.0
    assert r["field_accuracy"]["spread_bp"] < 1.0
