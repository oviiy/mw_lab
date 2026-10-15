/**
 * The five story chapters. Each pairs scrolling prose (from src/story/copy.ts)
 * with one pinned chart whose state follows the active step.
 */
import type { Deal, FundingRow, IssuerMeta, SlimBond } from "../lib/data";
import type { Mismatch as MismatchRow } from "../lib/types";
import ChartFrame from "./ChartFrame";
import { fig } from "../lib/figures";
import Scrolly from "./Scrolly";
import { BondIcon, ServerIcon } from "./icons";
import Cumulative, { type Annotation } from "./charts/Cumulative";
import Deals, { type DealMode } from "./charts/Deals";
import Funding from "./charts/Funding";
import Mismatch from "./charts/Mismatch";
import Spreads from "./charts/Spreads";

const SRC = "Source: SEC EDGAR filings, extracted and validated by AI Debt Tracker";

export function HowMuch(props: {
  steps: string[];
  cumulative: Array<Record<string, number | string>>;
  issuers: IssuerMeta[];
  today: string;
  shadeFrom: string;
  biggest: Annotation;
  biggestIssuer: string;
}) {
  return (
    <Scrolly steps={props.steps}>
      {(s) => (
        <ChartFrame id="cumulative" number={fig("cumulative")} title="Cumulative AI-era borrowing, by company" source={SRC}
          how="Running total of principal raised, stacked by issuer. Each step is a pricing date."
          notes="Headline debt only: bonds, notes, convertibles and term loans at committed size; revolving credit excluded. Non-USD tranches converted at the H.10 rate on the pricing date.">
          <Cumulative
            cumulative={props.cumulative}
            issuers={props.issuers}
            today={props.today}
            shadeFrom={s === 1 ? props.shadeFrom : null}
            annotations={s === 2 ? [props.biggest] : []}
            highlight={s === 3 ? "coreweave" : s === 2 ? props.biggestIssuer : null}
          />
        </ChartFrame>
      )}
    </Scrolly>
  );
}

export function WhoBorrows(props: {
  steps: string[];
  deals: Deal[];
  issuers: IssuerMeta[];
  today: string;
  notes: Record<string, string>;
}) {
  const modes: DealMode[] = ["issuer", "currency", "type", "issuer"];
  return (
    <Scrolly steps={props.steps}>
      {(s) => (
        <ChartFrame id="deals" number={fig("deals")} title="Every deal since 2024, sized by amount" source={SRC}
          how="One circle per deal (all tranches priced by an issuer on one day). Circle area is proportional to USD-equivalent size."
          notes="Pricing releases and closing 8-Ks for the same notes are merged, so no deal is counted twice.">
          <Deals deals={props.deals} issuers={props.issuers} today={props.today} mode={modes[s] ?? "issuer"} notes={props.notes} />
        </ChartFrame>
      )}
    </Scrolly>
  );
}

export function MarketPrice(props: {
  steps: string[];
  bonds: SlimBond[];
  issuers: IssuerMeta[];
  index: { ig: [string, number][]; bbb: [string, number][] };
  today: string;
}) {
  return (
    <Scrolly steps={props.steps}>
      {(s) => (
        <ChartFrame
          id="spreads"
          number={fig("spreads")}
          how="Dots: spread over the benchmark Treasury paid on new USD bonds with 8–12 years to maturity, on the day they were priced. Lines: market-wide index spreads."
          notes="Issue spreads are quoted against a single on-the-run Treasury; the ICE BofA indices are option-adjusted spreads over the whole curve. Compare directions, not levels to the basis point."
          title="Spread over Treasuries on new ten-year bonds, in basis points"
          source="Sources: SEC EDGAR pricing term sheets; ICE BofA US Corporate and BBB indices (option-adjusted) via FRED"
        >
          <Spreads bonds={props.bonds} issuers={props.issuers} index={props.index} today={props.today}
            tenor={[8, 12]} showBonds={s >= 1} highlight={s >= 2 ? "oracle" : null} />
        </ChartFrame>
      )}
    </Scrolly>
  );
}

export function WhereMoneyGoes(props: { steps: string[]; rows: FundingRow[]; issuers: IssuerMeta[] }) {
  const focus: (string[] | null)[] = [null, ["amazon"], ["oracle", "coreweave"], ["microsoft"]];
  return (
    <Scrolly steps={props.steps}>
      {(s) => (
        <ChartFrame id="funding" number={fig("funding")} title="Capital spending vs cash from operations, by fiscal year"
          how="Claret: capital expenditure. Dark grey: net cash from operating activities. Blue dashes: total debt. Shading: capex in excess of operating cash flow."
          notes="Fiscal years as reported (Oracle ends in May, Microsoft in June). Each panel has its own vertical scale."
          source="Source: company 10-K filings via the SEC XBRL API">
          <Funding rows={props.rows} issuers={props.issuers} highlight={focus[s] ?? null} />
        </ChartFrame>
      )}
    </Scrolly>
  );
}

export function TheMismatch(props: { steps: string[]; rows: MismatchRow[]; issuers: IssuerMeta[] }) {
  return (
    <Scrolly steps={props.steps}>
      {(s) => (
        <ChartFrame id="mismatch" number={fig("mismatch")} title="How long the servers last vs how long the debt is owed"
          how="Claret bar: disclosed depreciation life of servers. Blue bar: amount-weighted average term of debt raised since 2024. Tick: longest single tranche."
          notes="Terms are measured from pricing date to final maturity, ignoring call options. CoreWeave delayed-draw loans use the facility's final maturity."
          source="Sources: server useful lives from each company's latest 10-K; debt terms from SEC EDGAR">
          <ul className="key sans" aria-label="Legend">
            <li><ServerIcon size={20} /><span className="swatch claret" aria-hidden="true" />Server depreciation life</li>
            <li style={{ opacity: s >= 1 ? 1 : 0.3 }}><BondIcon size={20} /><span className="swatch blue" aria-hidden="true" />Average debt term</li>
            <li style={{ opacity: s >= 2 ? 1 : 0.3 }}><span className="key-tick" aria-hidden="true" />Longest tranche</li>
          </ul>
          <Mismatch rows={props.rows} issuers={props.issuers} stage={s} />
        </ChartFrame>
      )}
    </Scrolly>
  );
}
