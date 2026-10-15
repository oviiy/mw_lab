import type { SlimBond } from "../lib/data";
import { date, INSTRUMENT_LABEL, local, pct, usd, years } from "../lib/format";
import IssuerMark from "./IssuerMark";

interface Props {
  bond: SlimBond;
  issuerName: string;
  color: string;
  life?: number;
  x: number;
  y: number;
  /** container width, to flip the card left near the right edge */
  bound: number;
}

/** Hover card for a single tranche. Every figure links back to the filing it came from. */
export default function BondCard({ bond: b, issuerName, color, life, x, y, bound }: Props) {
  const left = x > bound - 300 ? x - 292 : x + 16;
  const rate =
    b.coupon_pct != null
      ? pct(b.coupon_pct)
      : b.floating_spread_bp != null
        ? `SOFR + ${b.floating_spread_bp}bp`
        : "—";
  return (
    <div className="card" style={{ left, top: y }} role="status">
      <div className="card-issuer">
        <IssuerMark id={b.issuer_id} color={color} size={20} />
        {issuerName}
      </div>
      <div className="card-name">{b.name}</div>
      <dl className="card-grid num">
        <dt>Amount</dt>
        <dd>
          {local(b.amount, b.currency)}
          {b.currency !== "USD" && <span className="muted"> ≈ {usd(b.amount_usd)}</span>}
        </dd>
        <dt>Rate</dt>
        <dd>{rate}</dd>
        <dt>Priced</dt>
        <dd>{date(b.trade_date)}</dd>
        <dt>Matures</dt>
        <dd>
          {date(b.maturity_date)} <span className="muted">({years(b.tenor_years)})</span>
        </dd>
        {b.spread_bp != null && (
          <>
            <dt>Spread</dt>
            <dd>
              +{b.spread_bp}bp{b.currency === "USD" ? " over Treasuries" : " over govt."}
            </dd>
          </>
        )}
        {life != null && (
          <>
            <dt>Outlives servers by</dt>
            <dd className={b.tenor_years > life ? "blue" : ""}>
              {b.tenor_years > life ? years(b.tenor_years - life) : "—"}
            </dd>
          </>
        )}
        <dt>Type</dt>
        <dd>{INSTRUMENT_LABEL[b.instrument_type]}</dd>
      </dl>
      <div className="card-src">Click to open the SEC filing</div>
    </div>
  );
}
