import { scaleBand, scaleLinear } from "d3";
import { useMemo, useState } from "react";
import type { IssuerMeta } from "../../lib/data";
import { usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";
import type { GapRow } from "../../lib/types";
import IssuerMark from "../IssuerMark";

interface Props {
  years: Record<string, GapRow[]>;
  issuers: IssuerMeta[];
  /** headline bonds and loans priced inside each issuer's fiscal year, keyed `${issuer}|${fy}` */
  bondsInYear: Record<string, number>;
  initialIssuer?: string;
}

interface Step {
  key: string;
  label: string;
  value: number;
  kind: "in" | "out" | "total" | "source";
  fill: string;
}

/** From operating cash to the funding gap, and what filled it. Ends at zero by construction. */
export default function Waterfall({ years, issuers, bondsInYear, initialIssuer = "oracle" }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const avail = issuers.filter((i) => (years[i.id] ?? []).some((r) => r.gap != null));
  const [issuer, setIssuer] = useState(avail.some((i) => i.id === initialIssuer) ? initialIssuer : avail[0]?.id);
  const rows = useMemo(() => (years[issuer] ?? []).filter((r) => r.gap != null), [years, issuer]);
  const [fy, setFy] = useState<number | null>(null);
  const row = rows.find((r) => r.fy === fy) ?? rows[rows.length - 1];
  const name = issuers.find((i) => i.id === issuer)?.name ?? issuer;

  if (!row) return null;
  const steps: Step[] = [
    { key: "ocf", label: "Cash from operations", value: row.ocf!, kind: "in", fill: "var(--flow)" },
    { key: "capex", label: "Capital spending", value: -row.capex!, kind: "out", fill: "var(--claret)" },
    { key: "div", label: "Dividends", value: -row.dividends!, kind: "out", fill: "var(--muted)" },
    { key: "bb", label: "Buybacks", value: -row.buybacks!, kind: "out", fill: "var(--muted)" },
    { key: "gap", label: row.gap! < 0 ? "Funding gap" : "Cash left over", value: row.gap!, kind: "total",
      fill: row.gap! < 0 ? "var(--claret)" : "var(--flow)" },
    { key: "debt", label: "Net debt raised", value: row.net_debt!, kind: "source", fill: "var(--blue)" },
    { key: "cash", label: "Cash drawn down", value: row.cash_drawdown!, kind: "source", fill: "var(--flow-soft)" },
    { key: "other", label: "Other flows", value: row.other!, kind: "source", fill: "var(--rule)" },
  ];
  // running positions
  let run = 0;
  const bars = steps.map((s) => {
    let y0: number;
    let y1: number;
    if (s.kind === "total") {
      y0 = 0;
      y1 = s.value;
      run = s.value;
    } else {
      y0 = run;
      y1 = run + s.value;
      run = y1;
    }
    return { ...s, y0, y1 };
  });

  const narrow = width < 640;
  const height = narrow ? 340 : 380;
  const m = { top: 24, right: 12, bottom: narrow ? 64 : 48, left: 56 };
  const lo = Math.min(0, ...bars.map((b) => Math.min(b.y0, b.y1)));
  const hi = Math.max(0, ...bars.map((b) => Math.max(b.y0, b.y1)));
  const y = scaleLinear().domain([lo, hi]).nice().range([height - m.bottom, m.top]);
  const x = scaleBand().domain(bars.map((b) => b.key)).range([m.left, width - m.right]).padding(0.28);
  const bonds = bondsInYear[`${issuer}|${row.fy}`] ?? 0;
  const assumed = row.assumed_zero.length ? ` ${row.assumed_zero.join(", ").replace(/_/g, " ")} not reported; read as zero.` : "";

  return (
    <div>
      <div className="picker" role="radiogroup" aria-label="Company">
        {avail.map((i) => (
          <button key={i.id} type="button" role="radio" aria-checked={issuer === i.id} className={issuer === i.id ? "on" : ""}
            onClick={() => { setIssuer(i.id); setFy(null); }}>
            <IssuerMark id={i.id} size={16} />{i.name}
          </button>
        ))}
        <label className="visually-hidden" htmlFor="wf-fy">Fiscal year</label>
        <select id="wf-fy" value={row.fy} onChange={(e) => setFy(Number(e.target.value))}>
          {rows.map((r) => <option key={r.fy} value={r.fy}>{r.label}</option>)}
        </select>
      </div>
      <div ref={ref}>
        <svg className="chart" width={width} height={height} role="img"
          aria-label={`${name} ${row.label}: operating cash flow, uses of cash, the funding gap and how it was filled.`}>
          <g className="grid">
            {y.ticks(5).map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? "0" : usd(t, 0)}</text>
              </g>
            ))}
          </g>
          <line x1={m.left} x2={width - m.right} y1={y(0)} y2={y(0)} stroke="var(--ink)" />
          {bars.map((b, i) => {
            const top = y(Math.max(b.y0, b.y1));
            const h = Math.max(1, Math.abs(y(b.y0) - y(b.y1)));
            const next = bars[i + 1];
            return (
              <g key={b.key}>
                <rect x={x(b.key)} y={top} width={x.bandwidth()} height={h} fill={b.fill}
                  stroke={b.kind === "total" ? "var(--ink)" : "none"} strokeWidth={1.2} />
                {next && next.kind !== "total" && (
                  <line x1={x(b.key)! + x.bandwidth()} x2={x(next.key)} y1={y(b.y1)} y2={y(b.y1)}
                    stroke="var(--muted)" strokeDasharray="2 2" />
                )}
                <text x={x(b.key)! + x.bandwidth() / 2} y={top - 5} textAnchor="middle" className="label-strong">
                  {b.value >= 0 ? "+" : "−"}{usd(Math.abs(b.value), 1)}
                </text>
                <text x={x(b.key)! + x.bandwidth() / 2} y={height - m.bottom + 16} textAnchor="middle"
                  style={{ fontSize: 11 }}>
                  {narrow ? b.label.split(" ").slice(0, 2).join(" ") : b.label}
                </text>
              </g>
            );
          })}
          <line x1={x("gap")! - 6} x2={x("gap")! - 6} y1={m.top} y2={height - m.bottom + 4} stroke="var(--ink)" strokeDasharray="1 3" />
        </svg>
      </div>
      <p className="reconcile">
        {name}, {row.label} (fiscal year ending {row.period_end}): the bonds and loans in this dataset priced in that fiscal
        year total <strong>{usd(bonds)}</strong>; the cash-flow statement reports net debt raised of <strong>{usd(row.net_debt!)}</strong>.
        The two differ because the cash-flow line nets repayments and includes commercial paper and loans, and because a bond's pricing
        and settlement can fall in different years.{assumed}
      </p>
    </div>
  );
}
