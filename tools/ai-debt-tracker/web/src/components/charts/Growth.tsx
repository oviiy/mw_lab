import { line, scaleLinear, scalePoint } from "d3";
import type { IssuerMeta } from "../../lib/data";
import { useWidth } from "../../lib/hooks";
import type { GrowthRow } from "../../lib/types";
import { IssuerMarkG } from "../IssuerMark";

interface Props {
  growth: Record<string, { quarters: GrowthRow[]; basis: string }>;
  issuers: IssuerMeta[];
  /** what "cloud" means for each issuer, from config/segments.yaml */
  labels: Record<string, string>;
}

/** Small multiples: capex growth (claret) against cloud-revenue growth (flow), year over year. */
export default function Growth({ growth, issuers, labels }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const list = issuers.filter((i) => (growth[i.id]?.quarters ?? []).some((r) => r.capex_yoy_pct != null));
  const cols = width < 560 ? 1 : width < 860 ? 2 : 3;
  const gap = 22;
  const pw = (width - gap * (cols - 1)) / cols;
  const ph = 140;
  const head = 46;
  const rowH = ph + head + 34;
  const height = Math.ceil(list.length / cols) * rowH;

  return (
    <div ref={ref}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label="For each company, year-over-year growth in capital spending compared with growth in cloud revenue.">
        {list.map((iss, k) => {
          const rs = growth[iss.id].quarters.filter((r) => r.capex_yoy_pct != null || r.cloud_yoy_pct != null);
          const ox = (k % cols) * (pw + gap);
          const oy = Math.floor(k / cols) * rowH;
          const x = scalePoint<string>().domain(rs.map((r) => r.label)).range([6, pw - 46]);
          const vals = rs.flatMap((r) => [r.capex_yoy_pct, r.cloud_yoy_pct]).filter((v): v is number => v != null);
          const y = scaleLinear().domain([Math.min(0, ...vals), Math.max(10, ...vals)]).nice().range([ph, 0]);
          const path = (f: (r: GrowthRow) => number | null) =>
            line<GrowthRow>().defined((r) => f(r) != null).x((r) => x(r.label)!).y((r) => y(f(r)!))(rs) ?? "";
          const last = (f: (r: GrowthRow) => number | null) => [...rs].reverse().find((r) => f(r) != null);
          const lc = last((r) => r.capex_yoy_pct);
          const lr = last((r) => r.cloud_yoy_pct);
          // latest values go in the subtitle, so panels never collide with their own labels
          return (
            <g key={iss.id} transform={`translate(${ox},${oy})`}>
              <IssuerMarkG id={iss.id} cx={9} cy={11} size={18} />
              <text x={23} y={16} className="label-strong" style={{ fontSize: 14 }}>{iss.name}</text>
              <text x={0} y={33} style={{ fontSize: 11 }}>
                {lc && <tspan style={{ fill: "var(--claret)", fontWeight: 600 }}>capex {lc.capex_yoy_pct! >= 0 ? "+" : ""}{Math.round(lc.capex_yoy_pct!)}%</tspan>}
                {lr && <tspan style={{ fill: "var(--flow)", fontWeight: 600 }}>{"  "}vs {lr.cloud_yoy_pct! >= 0 ? "+" : ""}{Math.round(lr.cloud_yoy_pct!)}%</tspan>}
                <tspan>{" "}{labels[iss.id] ?? "revenue"}</tspan>
              </text>
              <g transform={`translate(0,${head})`}>
                {y.ticks(3).map((t) => (
                  <g key={t} className="grid">
                    <line x1={0} x2={pw - 46} y1={y(t)} y2={y(t)} />
                    <text x={pw - 42} y={y(t) + 4}>{t}%</text>
                  </g>
                ))}
                <line x1={0} x2={pw - 46} y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth={0.8} />
                <path d={path((r) => r.cloud_yoy_pct)} fill="none" stroke="var(--flow)" strokeWidth={2} strokeDasharray="5 3" />
                <path d={path((r) => r.capex_yoy_pct)} fill="none" stroke="var(--claret)" strokeWidth={2.25} />
                {lc && <circle cx={x(lc.label)} cy={y(lc.capex_yoy_pct!)} r={3} fill="var(--claret)" />}
                {lr && <circle cx={x(lr.label)} cy={y(lr.cloud_yoy_pct!)} r={3} fill="var(--flow)" />}
                <text x={0} y={ph + 16} style={{ fontSize: 11 }}>{rs[0]?.label}</text>
                <text x={pw - 46} y={ph + 16} textAnchor="end" style={{ fontSize: 11 }}>{rs[rs.length - 1]?.label}</text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
