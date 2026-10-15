# Contributing

Corrections and new issuers are welcome. The bar for data changes is simple: **every number must trace back to a filing.**

## Report a data error

Open an issue with:

* the tranche (issuer, name, or CUSIP);
* what is wrong;
* a link to the SEC filing that shows the correct value.

## Fix an extraction

1. Edit `pipeline/extractions/<accession>.json`, or add an entry to `pipeline/config/overrides.yaml` with a `reason`.
2. Run `python -m aidebt.run --offline && pytest -q` from `pipeline/`.
3. Open a PR. The diff of `data/public/bonds.csv` shows reviewers exactly what changed.

## Add an issuer

1. Add the company to `pipeline/config/issuers.yaml`. You need its SEC CIK, a color, and an `inclusion_reason`: why its capex is AI-driven.
2. Add its server useful life to `pipeline/config/useful_life.yaml`, with a verbatim quote and a 10-K link.
3. If it borrows through 8-K-only deals (144A notes, loans), list those filings in `pipeline/config/extra_documents.yaml`.
4. Run the pipeline with `ANTHROPIC_API_KEY` set to extract the new filings. Then check `data/review/queue.json`.
5. Ideally, add one or two of its filings to `eval/labels/`, labelled by hand from the filing text.

## Code style

* **Python**: standard library first, type hints, small modules. Tests live in `pipeline/tests/`.
* **Web**: each chart is a self-contained component in `web/src/components/charts/` that takes plain data as props. Story prose lives in `web/src/story/copy.ts`, and its numbers are interpolated from the data, never typed by hand.
