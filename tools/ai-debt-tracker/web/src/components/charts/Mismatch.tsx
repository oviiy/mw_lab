import { scaleBand, scaleLinear } from "d3";
import type { IssuerMeta } from "../../lib/data";
import { share } from "../../lib/format";
import { useReducedMotion, useSeen, useWidth } from "../../lib/hooks";
import type { Mismatch as Row } from "../../lib/types";
import { IssuerMarkG } from "../IssuerMark";

interface Props {
  rows: Row[];
  issuers: IssuerMeta[];
  /** 0 = hardware life only, 1 = + average debt term, 2 = + longest bond */
  stage?: number;
}

const CAP = 42;

/** The signature chart: how long the servers last vs how long the money is owed. */
export default function Mismatch({ rows, issuers, stage = 2 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(700);
  const [seenRef, seen] = useSeen<HTMLDivElement>(0.35);
  const reduced = useReducedMotion();
  const narrow = width < 560;
  const m = { top: 34, right: narrow ? 44 : 150, bottom: 16, left: narrow ? 96 : 130 };
  const ordered = [...rows].sort((a, b) => b.wavg_tenor_years - a.wavg_tenor_years);
  const height = m.top + m.bottom + ordered.length * 62;
  const y = scaleBand().domain(ordered.map((r) => r.issuer_id)).range([m.top, height - m.bottom]).padding(0.28);
  const x = scaleLinear().domain([0, CAP]).range([m.left, width - m.right]);
  const meta = Object.fromEntries(issuers.map((i) => [i.id, i]));
  const bh = y.bandwidth() / 2 - 2;
  // width as a CSS property so it can transition from 0 when the chart scrolls into view
  const grow = (w: number, delay: number) =>
    reduced ? { width: w } : { width: w, transition: `width 900ms cubic-bezier(.3,.6,.2,1) ${delay}ms` };
  const go = seen || reduced;

  return (
    <div ref={seenRef}>
      <div ref={ref}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label="For each company, the depreciation life of its servers compared with the average and longest term of its AI-era debt.">
        <g className="axis">
          {[0, 5, 10, 20, 30, 40].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={m.top - 6} y2={height - m.bottom} strokeDasharray="1 4" />
              <text x={x(t)} y={m.top - 12} textAnchor="middle">{t === 0 ? "0" : `${t} yrs`}</text>
            </g>
          ))}
        </g>
        {ordered.map((r, k) => {
          const y0 = y(r.issuer_id)!;
          const longest = Math.min(r.longest_tenor_years, CAP);
          return (
            <g key={r.issuer_id}>
              <IssuerMarkG id={r.issuer_id} color={meta[r.issuer_id].color} cx={10} cy={y0 + bh + 1} size={20} />
              <text x={26} y={y0 + bh + 5} className="label-strong">{meta[r.issuer_id].name}</text>
              <rect x={x(0)} y={y0} height={bh} fill="var(--claret)"
                style={grow(go ? x(r.useful_life_years) - x(0) : 0, k * 90)} />
              {stage >= 1 && (
                <rect x={x(0)} y={y0 + bh + 4} height={bh} fill="var(--blue)"
                  style={grow(go ? x(r.wavg_tenor_years) - x(0) : 0, 500 + k * 90)} />
              )}
              {stage >= 2 && (
                <g opacity={go ? 1 : 0} style={{ transition: reduced ? "none" : `opacity 400ms ${1300 + k * 90}ms` }}>
                  <line x1={x(r.wavg_tenor_years)} x2={x(longest)} y1={y0 + bh * 1.5 + 4} y2={y0 + bh * 1.5 + 4}
                    stroke="var(--blue)" strokeDasharray="2 3" />
                  <line x1={x(longest)} x2={x(longest)} y1={y0 + bh + 4} y2={y0 + bh * 2 + 4} stroke="var(--blue)" strokeWidth={2} />
                  {r.longest_tenor_years > CAP && (
                    <text x={x(CAP) + 5} y={y0 + bh * 1.5 + 8} style={{ fill: "var(--blue)", fontWeight: 600 }}>
                      {Math.round(r.longest_tenor_years)}
                    </text>
                  )}
                  {!narrow && (
                    <text x={width - m.right + 40} y={y0 + bh + 6}>
                      <tspan className="label-strong">{share(r.share_outliving_hardware)}</tspan> outlives servers
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
}
