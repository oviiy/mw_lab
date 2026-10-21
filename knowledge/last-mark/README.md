# Same Loan, Different Price

**Valuation Dispersion and Gradual Loss Recognition in Private Credit**: evidence from loans shared across business development companies, 2022–2026. (Project name: The Last Mark.)

An open, loan-level dataset of how business development companies (BDCs) mark the *same* private loans, built only from SEC inline-XBRL schedules of investments. The output is one self-contained scrolling article: `web/index.html`.

## What it shows (data through Q2 2026)

The article is laid out as a working paper on parchment, in the style of AI Debt Tracker. It is in English by default, with a Chinese toggle.

| | |
|---|---|
| Coverage | 18 BDCs; 170 of 456 filings pass the 3% reconciliation test |
| Same loan held by 2+ BDCs | 2,000 matched loan-quarters across 278 borrowers |
| Median high–low gap | **0.4 pts** where the median mark is 97+ (n = 1,733); **5.8 pts** below 85 (n = 36); 27–39% of the implied discount below 97 |
| Widest case | Help/Systems second lien, Jun 2026: Palmer Square 47.5 vs Prospect 82.6, same 12.74% coupon and May 2029 maturity |
| Path to distress (81 events with a full year of history) | 47% at 90+ four quarters before, 9% one quarter before; 31 abrupt cases vs 134 gradual |
| Who was right | Lower mark closer a year later in 15 cases, higher in 17; 24 of 40 gaps of 5+ points never closed |
| Lender deviations (lenders with 10+ borrowers) | Prospect +7.2 (10 borrowers), Golub +1.3, Ares −1.4; dollar effect at most 0.4% of par-loan principal |
| A year later | 97+: 77% still at 90+; 85–90: 41%; 60–70: 41–70% below 60 or restructured, depending on exits |
| PIK share of par-loan principal (5-BDC panel) | 13.4% → 16.7%; noisy |

See `PREPUBLICATION.md` for the review log and the right-of-reply checklist.

Page structure:

- **Front matter:** abstract, keywords and JEL codes, main results.
- **1** Introduction.
- **2** Institutional background (Box 1).
- **3** Data and sample construction (Table 1).
- **4** Results:
  - 4.1 Pluralsight case, scrollytelling (Fig. 1)
  - 4.2 Dispersion by credit quality (Fig. 2)
  - 4.3 Case evidence (Fig. 3)
  - 4.4 Lender-level differences (Fig. 4)
  - 4.5 Path to distress (Fig. 5)
  - 4.6 Who was right (Table 2)
  - 4.7 Information content of marks (Fig. 6–7)
  - 4.8 PIK (Fig. 8)
- **5** Robustness and limitations.
- **6** Conclusion.
- **Back matter:** data availability with a searchable explorer, references, suggested citation, appendix (Fig. A1).

## Run it

```bash
python3 pipeline/fetch.py          # downloads XBRL for 28 BDCs -> data/raw/ (slow: ~450 filings; run tickers in parallel if needed)
python3 pipeline/build.py          # validate, match, analyse -> data/public/story.json, marks.csv, validation.json
python3 web/build_page.py          # inject data into web/template.html -> web/index.html + web/data/*.csv
python3 -m http.server 4410 --directory web   # open http://localhost:4410
```

Set `SEC_USER_AGENT="Your Name you@example.com"` for SEC fair-access. Standard library only.

## How it works

1. **Fetch** (`pipeline/fetch.py`). For every 10-Q/10-K since mid-2022, it reads the XBRL instance and keeps facts dated at the period end that carry `InvestmentIdentifierAxis`: fair value, cost, principal, interest rate and PIK rate.
2. **Clean.** It drops:
   - rows without both fair value and cost (roll-forward and affiliate tables repeat positions);
   - issuer-level subtotals (an id that prefixes another id);
   - duplicate positions (same issuer, fair value and cost).
3. **Reconcile (the gate).** A lender-quarter is used only if its line items sum to the company's own reported total investments at fair value within 3%. Failures are listed in `data/public/validation.json` and never used.
4. **Par loans.** Debt lines with cost between 90% and 105% of principal, and fair value at most 105% of principal. This removes:
   - unfunded commitments;
   - discount purchases;
   - restructured paper;
   - currency-mismatched principal.
5. **Same loan.** Two BDCs hold the same loan when all of the following hold:
   - same normalized borrower and same quarter;
   - coupon within 15bp and at most 15%;
   - term loans only (no revolvers or delayed-draw lines);
   - not first lien against second lien, and not split first-out/last-out tranches;
   - the same pair of lenders also matches in an adjacent quarter.

   For filers that tag the whole table row as the identifier (Crescent, Palmer Square, BlackRock TCP and others), the borrower is the longest known borrower name found in the row. Blue Owl (OBDC) tags no interest rates, so it cannot be matched.

## Limits

- **Uneven coverage.** Most smaller BDCs only reconcile from mid-2025. FS KKR, Oaktree Specialty Lending, New Mountain, Carlyle and a few others never do (joint-venture tagging), so they are excluded.
- **Borrower matching is automatic.** Treat any single row as a lead and check it against the linked filing.
- **"Left the book" is ambiguous.** It can mean repaid, sold or written off. It is never counted as a default.

Not investment advice.
