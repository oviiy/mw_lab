import { scaleBand, scaleLinear } from "d3";
import { Fragment, useMemo, useState } from "react";
import type { IssuerMeta } from "../../lib/data";
import { usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";
import type { IntensityRow } from "../../lib/types";
import IssuerMark from "../IssuerMark";

interface Props {
  rows: Record<string, IntensityRow[]>; // quarterly capex + revenue per issuer
  issuers: IssuerMeta[];
}

/** Claret tints, darkest at the base: every bar is capex, so every bar is claret. */
const TINTS = ["#5e0a26", "#7a0d31", "#990f3d", "#b4405f", "#cc7086", "#e2a2b0"];

/** Calendar quarter a fiscal quarter mostly falls in (e.g. Oracle's Jun–Aug quarter -> Q3). */
export function calendarQuarter(periodEnd: string): string {
  const d = new Date(`${periodEnd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 30);
  return `${d.getUTCFullYear()} Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
}

interface Bucket {
  key: string;
  byIssuer: Record<string, number>;
  revenue: number;
  capex: number;
}

/** Quarterly capex by company, aligned to calendar quarters, with capex ÷ revenue overlaid. */
export default function CapexQuarterly({ rows, issuers }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const [mode, setMode] = useState<"quarter" | "year">("quarter");
  const [hover, setHover] = useState<string | null>(null);

  const order = useMemo(() => {
    const totals = issuers.map((i) => ({ id: i.id, t: (rows[i.id] ?? []).reduce((s, r) => s + r.capex, 0) }));
    return totals.filter((x) => x.t > 0).sort((a, b) => b.t - a.t).map((x) => x.id);
  }, [rows, issuers]);

  const buckets = useMemo(() => {
    const map = new Map<string, Bucket>();
    for (const id of order) {
      for (const r of rows[id] ?? []) {
        const key = mode === "quarter" ? calendarQuarter(r.period_end) : calendarQuarter(r.period_end).slice(0, 4);
        const b = map.get(key) ?? { key, byIssuer: {}, revenue: 0, capex: 0 };
        b.byIssuer[id] = (b.byIssuer[id] ?? 0) + r.capex;
        b.capex += r.capex;
        b.revenue += r.revenue;
        map.set(key, b);
      }
    }
    let list = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
    // a period is complete when every issuer has all of its quarters in it
    const counts = (b: Bucket) => Object.keys(b.byIssuer).length;
    if (mode === "year") {
      const quarterCount = new Map<string, number>();
      for (const id of order) for (const r of rows[id] ?? []) {
        const y = calendarQuarter(r.period_end).slice(0, 4);
        quarterCount.set(y, (quarterCount.get(y) ?? 0) + 1);
      }
      list = list.filter((b) => (quarterCount.get(b.key) ?? 0) === counts(b) * 4);
    }
    while (list.length > 1 && counts(list[list.length - 1]) < counts(list[list.length - 2])) list.pop();
    return list.filter((b) => b.key >= "2023");
  }, [rows, order, mode]);

  const narrow = width < 640;
  const height = narrow ? 320 : 400;
  const m = { top: 20, right: 52, bottom: 30, left: 52 };
  const x = scaleBand().domain(buckets.map((b) => b.key)).range([m.left, width - m.right]).padding(0.22);
  const y = scaleLinear().domain([0, Math.max(...buckets.map((b) => b.capex)) * 1.08]).nice().range([height - m.bottom, m.top]);
  const yI = scaleLinear().domain([0, Math.max(0.5, ...buckets.map((b) => b.capex / b.revenue)) * 1.1]).nice()
    .range([height - m.bottom, m.top]);
  const tint = Object.fromEntries(order.map((id, i) => [id, TINTS[i % TINTS.length]]));
  const meta = Object.fromEntries(issuers.map((i) => [i.id, i]));
  const hb = buckets.find((b) => b.key === hover);
  const linePts = buckets.map((b) => `${x(b.key)! + x.bandwidth() / 2},${yI(b.capex / b.revenue)}`).join(" ");
  const last = buckets[buckets.length - 1];

  return (
    <div>
      <div className="segmented sans" role="radiogroup" aria-label="Period">
        {(["quarter", "year"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={mode === k} className={mode === k ? "on" : ""}
            onClick={() => setMode(k)}>{k === "quarter" ? "Quarterly" : "Calendar years"}</button>
        ))}
      </div>
      <ul className="key sans" aria-label="Legend">
        {order.map((id) => (
          <li key={id}><span className="swatch" style={{ background: tint[id] }} aria-hidden="true" /><IssuerMark id={id} size={16} />{meta[id].name}</li>
        ))}
        <li><span className="key-line flow" aria-hidden="true" />Capex as a share of revenue (right axis)</li>
      </ul>
      <div ref={ref} style={{ position: "relative" }}>
        <svg className="chart" width={width} height={height} role="img"
          aria-label="Capital expenditure by company per calendar quarter, with capex as a share of revenue.">
          <g className="grid">
            {y.ticks(5).map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? "0" : usd(t, 0)}</text>
              </g>
            ))}
            {yI.ticks(4).map((t) => (
              <text key={`i${t}`} x={width - m.right + 6} y={yI(t) + 4} style={{ fill: "var(--flow)" }}>{Math.round(t * 100)}%</text>
            ))}
          </g>
          {buckets.map((b) => {
            let acc = 0;
            return (
              <g key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)}>
                <rect x={x(b.key)} y={m.top} width={x.bandwidth()} height={height - m.top - m.bottom} fill="transparent" />
                {order.map((id) => {
                  const v = b.byIssuer[id];
                  if (!v) return null;
                  const y1 = y(acc + v);
                  const h = y(acc) - y1;
                  acc += v;
                  return <rect key={id} x={x(b.key)} y={y1} width={x.bandwidth()} height={Math.max(0, h - 0.5)}
                    fill={tint[id]} opacity={hover && hover !== b.key ? 0.55 : 1} />;
                })}
              </g>
            );
          })}
          <polyline points={linePts} fill="none" stroke="var(--flow)" strokeWidth={2} />
          {buckets.map((b) => (
            <circle key={`p${b.key}`} cx={x(b.key)! + x.bandwidth() / 2} cy={yI(b.capex / b.revenue)} r={2.6} fill="var(--flow)" />
          ))}
          {last && (
            <text x={x(last.key)! + x.bandwidth() / 2} y={yI(last.capex / last.revenue) - 9} textAnchor="end"
              style={{ fill: "var(--flow)", fontWeight: 600 }}>
              {Math.round((last.capex / last.revenue) * 100)}% of revenue
            </text>
          )}
          <g className="axis">
            {buckets.map((b, i) => (narrow ? i % 4 === 0 : mode === "year" || b.key.endsWith("Q1")) ? (
              <text key={b.key} x={x(b.key)! + x.bandwidth() / 2} y={height - 10} textAnchor="middle">
                {mode === "year" ? b.key : b.key.slice(0, 4)}
              </text>
            ) : null)}
          </g>
        </svg>
        {hb && (
          <div className="card" style={{ left: Math.min(x(hb.key)! + x.bandwidth() + 8, width - 290), top: 30 }}>
            <div className="card-name num">{hb.key}: {usd(hb.capex)} capex</div>
            <dl className="card-grid num">
              {order.filter((id) => hb.byIssuer[id]).map((id) => (
                <Fragment key={id}>
                  <dt>{meta[id].name}</dt><dd>{usd(hb.byIssuer[id])}</dd>
                </Fragment>
              ))}
              <dt>Capex ÷ revenue</dt><dd>{Math.round((hb.capex / hb.revenue) * 100)}%</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
