import { line, scaleSymlog, scaleUtc } from "d3";
import { useState } from "react";
import type { IssuerMeta } from "../../lib/data";
import { useWidth } from "../../lib/hooks";
import type { CoverageRow } from "../../lib/types";
import { IssuerMarkG } from "../IssuerMark";

interface Props {
  coverage: Record<string, CoverageRow[]>;
  issuers: IssuerMeta[];
  highlight?: string[];
}

const d = (s: string) => new Date(`${s}T00:00:00Z`);

/** Trailing-four-quarter operating income ÷ interest expense, on a symmetric-log scale. */
export default function Coverage({ coverage, issuers, highlight = ["oracle", "coreweave"] }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const [hover, setHover] = useState<string | null>(null);
  const list = issuers.filter((i) => (coverage[i.id] ?? []).length > 0);
  const all = list.flatMap((i) => coverage[i.id]);
  const narrow = width < 640;
  const height = narrow ? 320 : 400;
  const m = { top: 16, right: narrow ? 70 : 150, bottom: 28, left: 46 };
  const x = scaleUtc().domain([d(all.reduce((a, r) => (r.period_end < a ? r.period_end : a), "9999")),
    d(all.reduce((a, r) => (r.period_end > a ? r.period_end : a), "0000"))]).range([m.left, width - m.right]);
  const y = scaleSymlog().constant(1).domain([Math.min(-1, ...all.map((r) => r.coverage)), Math.max(200, ...all.map((r) => r.coverage))])
    .range([height - m.bottom, m.top]);
  const ticks = [-1, 0, 1, 3, 10, 30, 100].filter((t) => t >= y.domain()[0] && t <= y.domain()[1]);
  const meta = Object.fromEntries(issuers.map((i) => [i.id, i]));
  const path = line<CoverageRow>().x((r) => x(d(r.period_end))).y((r) => y(r.coverage));

  // end labels, pushed apart
  const ends = list.map((i) => {
    const r = coverage[i.id][coverage[i.id].length - 1];
    return { id: i.id, y: y(r.coverage), v: r.coverage };
  }).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) ends[k].y = Math.max(ends[k].y, ends[k - 1].y + 16);

  return (
    <div ref={ref}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label="Interest coverage by company over time. Oracle and CoreWeave are far below the others.">
        <g className="grid">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
              <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t}×</text>
            </g>
          ))}
        </g>
        <line x1={m.left} x2={width - m.right} y1={y(1)} y2={y(1)} stroke="var(--claret)" strokeDasharray="4 3" />
        <text x={m.left + 4} y={y(1) - 5} style={{ fill: "var(--claret)", fontWeight: 600 }}>
          1×: operating income only just covers interest
        </text>
        <g className="axis">
          {x.ticks(narrow ? 3 : 5).map((t) => (
            <text key={+t} x={x(t)} y={height - 8} textAnchor="middle">{t.getUTCFullYear()}</text>
          ))}
        </g>
        {list.map((i) => {
          const on = highlight.includes(i.id) || hover === i.id;
          return (
            <path key={i.id} d={path(coverage[i.id]) ?? ""} fill="none"
              stroke={on ? meta[i.id].color : "var(--muted)"} strokeWidth={on ? 2.6 : 1.2} opacity={on ? 1 : 0.55}
              onPointerEnter={() => setHover(i.id)} onPointerLeave={() => setHover(null)} />
          );
        })}
        {ends.map((e) => {
          const on = highlight.includes(e.id) || hover === e.id;
          return (
            <g key={e.id} opacity={on ? 1 : 0.7}>
              <IssuerMarkG id={e.id} cx={width - m.right + 14} cy={e.y} size={14} />
              <text x={width - m.right + 24} y={e.y + 4} style={{ fontWeight: on ? 600 : 400, fill: on ? "var(--ink)" : "var(--muted)" }}>
                {narrow ? "" : `${meta[e.id].name} `}{e.v >= 10 ? Math.round(e.v) : e.v.toFixed(1)}×
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
