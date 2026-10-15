import { line, scaleLinear, scaleUtc } from "d3";
import { useState } from "react";
import type { IssuerMeta, SlimBond } from "../../lib/data";
import { useWidth } from "../../lib/hooks";
import BondCard from "../BondCard";

interface Props {
  bonds: SlimBond[];
  issuers: IssuerMeta[];
  index: { ig: [string, number][]; bbb: [string, number][] };
  today: string;
  /** tenor window in years, e.g. [8, 12] for "around ten years" */
  tenor: [number, number];
  showBonds?: boolean;
  highlight?: string | null;
  height?: number;
}

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const START = "2024-06-01";

/** New-issue spreads over Treasuries against the market-wide index. */
export default function Spreads({ bonds, issuers, index, today, tenor, showBonds = true, highlight, height: heightProp = 420 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(700);
  const height = width < 560 ? Math.min(heightProp, 320) : heightProp;
  const [hover, setHover] = useState<{ b: SlimBond; x: number; y: number } | null>(null);
  const m = { top: 20, right: 116, bottom: 28, left: 40 };
  const pts = bonds.filter(
    (b) => b.currency === "USD" && b.spread_bp != null && b.tenor_years >= tenor[0] && b.tenor_years <= tenor[1],
  );
  const x = scaleUtc().domain([d(START), d(today)]).range([m.left, width - m.right]);
  const yMax = Math.max(160, ...pts.map((p) => p.spread_bp!)) * 1.08;
  const y = scaleLinear().domain([0, yMax]).nice().range([height - m.bottom, m.top]);
  const meta = Object.fromEntries(issuers.map((i) => [i.id, i]));
  const path = line<[string, number]>().x((p) => x(d(p[0]))).y((p) => y(p[1]));
  const clip = (s: [string, number][]) => s.filter((p) => p[0] >= START);
  const ig = clip(index.ig);
  const bbb = clip(index.bbb);
  const hl = highlight ? pts.filter((p) => p.issuer_id === highlight).sort((a, b) => a.trade_date.localeCompare(b.trade_date)) : [];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label="New-issue spreads of AI borrowers' bonds compared with investment-grade and BBB index spreads.">
        <g className="grid">
          {y.ticks(5).map((t) => (
            <g key={t}>
              <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
              <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t}</text>
            </g>
          ))}
          <text x={m.left - 6} y={m.top - 6} textAnchor="end">bp</text>
        </g>
        <path d={path(bbb) ?? ""} fill="none" stroke="var(--muted)" strokeWidth={1.25} strokeDasharray="4 3" />
        <path d={path(ig) ?? ""} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={width - m.right + 6} y={y(ig.at(-1)![1]) + 4} className="label-strong">All IG bonds</text>
        <text x={width - m.right + 6} y={y(bbb.at(-1)![1]) + 4}>BBB bonds</text>
        <g className="axis">
          {[2025, 2026].map((yr) => <text key={yr} x={x(d(`${yr}-01-01`))} y={height - 8}>{yr}</text>)}
        </g>
        {showBonds && hl.length > 1 && (
          <path d={line<SlimBond>().x((b) => x(d(b.trade_date))).y((b) => y(b.spread_bp!))(hl) ?? ""}
            fill="none" stroke={meta[highlight!].color} strokeWidth={2} />
        )}
        {showBonds &&
          pts.map((b) => {
            const cx = x(d(b.trade_date));
            const cy = y(b.spread_bp!);
            const faded = highlight && b.issuer_id !== highlight;
            return (
              <circle key={b.id} cx={cx} cy={cy} r={faded ? 4 : 5.5}
                fill={meta[b.issuer_id].color} fillOpacity={faded ? 0.25 : 0.95}
                stroke="var(--paper)" strokeWidth={1.5} style={{ cursor: "pointer", transition: "all 300ms" }}
                onPointerEnter={() => setHover({ b, x: cx, y: cy })} onPointerLeave={() => setHover(null)}
                onClick={() => window.open(b.source_url, "_blank", "noopener")} />
            );
          })}
        {showBonds && hl.length > 0 && (
          <text x={x(d(hl.at(-1)!.trade_date)) + 9} y={y(hl.at(-1)!.spread_bp!) + 4} className="label-strong">
            {meta[highlight!].name} +{hl.at(-1)!.spread_bp}bp
          </text>
        )}
      </svg>
      {hover && (
        <BondCard bond={hover.b} issuerName={meta[hover.b.issuer_id].name} color={meta[hover.b.issuer_id].color}
          x={hover.x} y={hover.y + 8} bound={width} />
      )}
    </div>
  );
}
