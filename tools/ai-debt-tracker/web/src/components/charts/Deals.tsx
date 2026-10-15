import { scaleBand, scaleSqrt, scaleUtc } from "d3";
import { useState } from "react";
import type { Deal, IssuerMeta } from "../../lib/data";
import { date, INSTRUMENT_LABEL, usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";
import { IssuerMarkG } from "../IssuerMark";

export type DealMode = "issuer" | "currency" | "type";

interface Props {
  deals: Deal[];
  issuers: IssuerMeta[];
  today: string;
  mode?: DealMode;
  height?: number;
  /** Text shown on the row of an issuer with no deals. */
  notes?: Record<string, string>;
}

const d = (s: string) => new Date(`${s}T00:00:00Z`);

/** One circle per deal (all tranches priced by an issuer on one day); area = size. */
export default function Deals({ deals, issuers, today, mode = "issuer", height: heightProp = 420, notes = {} }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(700);
  const height = width < 560 ? Math.min(heightProp, 320) : heightProp;
  const [hover, setHover] = useState<Deal | null>(null);
  const narrow = width < 560;
  const m = { top: 16, right: 24, bottom: 28, left: narrow ? 96 : 128 };
  const x = scaleUtc().domain([d("2024-03-01"), d(today)]).range([m.left, width - m.right]);
  const y = scaleBand().domain(issuers.map((i) => i.id)).range([m.top, height - m.bottom]).padding(0.1);
  const r = scaleSqrt().domain([0, Math.max(...deals.map((x) => x.amount_usd))]).range([0, Math.min(y.bandwidth() * 0.62, 46)]);
  const meta = Object.fromEntries(issuers.map((i) => [i.id, i]));

  const fill = (dl: Deal) => {
    if (mode === "currency") return dl.currencies.some((c) => c !== "USD") ? "var(--blue)" : "var(--rule)";
    if (mode === "type")
      return dl.types.some((t) => t === "term_loan" || t === "convertible_notes" || t === "secured_notes")
        ? "var(--claret)"
        : "var(--rule)";
    return meta[dl.issuer_id].color;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label={`${deals.length} borrowing deals since 2024, by issuer and date.`}>
        {issuers.map((i) => (
          <g key={i.id}>
            <line x1={m.left} x2={width - m.right} y1={y(i.id)! + y.bandwidth() / 2} y2={y(i.id)! + y.bandwidth() / 2}
              stroke="var(--rule)" />
            <IssuerMarkG id={i.id} color={i.color} cx={9} cy={y(i.id)! + y.bandwidth() / 2} size={18} />
            <text x={24} y={y(i.id)! + y.bandwidth() / 2 + 4} className="label-strong">{i.name}</text>
            {!deals.some((dl) => dl.issuer_id === i.id) && (
              <text x={m.left + 8} y={y(i.id)! + y.bandwidth() / 2 - 8} style={{ fontStyle: "italic" }}>
                {notes[i.id] ?? "No new bonds since 2024."}
              </text>
            )}
          </g>
        ))}
        <g className="axis">
          {[2024, 2025, 2026].map((yr) => {
            const t = d(`${yr}-${yr === 2024 ? "03" : "01"}-01`);
            return <text key={yr} x={x(t)} y={height - 8}>{yr}</text>;
          })}
        </g>
        {[...deals]
          .sort((a, b) => b.amount_usd - a.amount_usd)
          .map((dl) => (
            <circle key={dl.key} cx={x(d(dl.date))} cy={y(dl.issuer_id)! + y.bandwidth() / 2} r={r(dl.amount_usd)}
              fill={fill(dl)} fillOpacity={hover && hover !== dl ? 0.35 : 0.85}
              stroke="var(--paper)" strokeWidth={1.5}
              style={{ transition: "fill 450ms, fill-opacity 200ms", cursor: "pointer" }}
              onPointerEnter={() => setHover(dl)} onPointerLeave={() => setHover(null)}
              onClick={() => window.open(dl.source_url, "_blank", "noopener")}>
              <title>{`${meta[dl.issuer_id].name}, ${date(dl.date)}: ${usd(dl.amount_usd)}`}</title>
            </circle>
          ))}
        {mode === "currency" &&
          deals
            .filter((dl) => dl.currencies.some((c) => c !== "USD") && r(dl.amount_usd) > 14)
            .map((dl) => (
              <text key={`l-${dl.key}`} x={x(d(dl.date))} y={y(dl.issuer_id)! + y.bandwidth() / 2 + 4}
                textAnchor="middle" style={{ fill: "var(--paper)", fontWeight: 600, pointerEvents: "none" }}>
                {dl.currencies.filter((c) => c !== "USD").join("/")}
              </text>
            ))}
      </svg>
      {hover && (
        <div className="card" style={{ left: Math.min(x(d(hover.date)) + 12, width - 280), top: y(hover.issuer_id)! + y.bandwidth() }}>
          <div className="card-issuer">
            <span className="card-dot" style={{ background: meta[hover.issuer_id].color }} />
            {meta[hover.issuer_id].name}, {date(hover.date)}
          </div>
          <div className="card-name num">{usd(hover.amount_usd)}</div>
          <dl className="card-grid num">
            <dt>Tranches</dt><dd>{hover.n}</dd>
            <dt>Currencies</dt><dd>{hover.currencies.join(", ")}</dd>
            <dt>Longest</dt><dd>{hover.longest.slice(0, 4)}</dd>
            <dt>Type</dt><dd>{hover.types.map((t) => INSTRUMENT_LABEL[t]).join(", ")}</dd>
          </dl>
          <div className="card-src">Click to open the SEC filing</div>
        </div>
      )}
    </div>
  );
}
