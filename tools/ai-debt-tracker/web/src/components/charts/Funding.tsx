import { area, line, max, scaleLinear, scalePoint } from "d3";
import type { FundingRow, IssuerMeta } from "../../lib/data";
import { share, usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";
import { IssuerMarkG } from "../IssuerMark";

interface Props {
  rows: FundingRow[];
  issuers: IssuerMeta[];
  highlight?: string[] | null;
}

/**
 * Small multiples: capital spending (claret) against cash from operations (ink),
 * total debt (blue). The shaded gap is spending the business did not earn.
 */
export default function Funding({ rows, issuers, highlight }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(700);
  const cols = width < 520 ? 2 : 3;
  const gap = 18;
  const pw = (width - gap * (cols - 1)) / cols;
  const ph = 150;
  const m = { top: 40, right: 8, bottom: 20, left: 8 };
  const list = issuers.filter((i) => rows.some((r) => r.issuer_id === i.id));
  const height = Math.ceil(list.length / cols) * (ph + m.top + m.bottom + 12);

  return (
    <div ref={ref}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label="Capital expenditure versus operating cash flow and total debt, by company and fiscal year.">
        {list.map((iss, k) => {
          const rs = rows.filter((r) => r.issuer_id === iss.id);
          const ox = (k % cols) * (pw + gap);
          const oy = Math.floor(k / cols) * (ph + m.top + m.bottom + 12);
          const x = scalePoint<string>().domain(rs.map((r) => r.year)).range([m.left + 6, pw - m.right - 6]);
          const top = max(rs, (r) => Math.max(r.capex, r.ocf, r.debt ?? 0)) ?? 1;
          const y = scaleLinear().domain([0, top * 1.1]).range([ph, 0]);
          const last = rs[rs.length - 1];
          const ratio = last.capex / last.ocf;
          const over = area<FundingRow>().x((r) => x(r.year)!).y0((r) => y(r.ocf)).y1((r) => y(Math.max(r.capex, r.ocf)));
          const ln = (f: (r: FundingRow) => number | null) =>
            line<FundingRow>().defined((r) => f(r) != null).x((r) => x(r.year)!).y((r) => y(f(r)!))(rs) ?? "";
          const dim = highlight && !highlight.includes(iss.id);
          return (
            <g key={iss.id} transform={`translate(${ox},${oy})`} opacity={dim ? 0.3 : 1} style={{ transition: "opacity 400ms" }}>
              <IssuerMarkG id={iss.id} color={iss.color} cx={9} cy={11} size={18} />
              <text x={23} y={16} className="label-strong" style={{ fontSize: 14 }}>{iss.name}</text>
              <text x={0} y={32} style={{ fill: ratio > 1 ? "var(--claret)" : "var(--muted)" }}>
                FY{last.year} capex = {share(ratio)} of operating cash
              </text>
              <g transform={`translate(0,${m.top})`}>
                <line x1={0} x2={pw} y1={ph} y2={ph} stroke="var(--rule)" />
                <path d={over(rs) ?? ""} fill="var(--claret-soft)" />
                <path d={ln((r) => r.debt)} fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeDasharray="3 3" />
                <path d={ln((r) => r.ocf)} fill="none" stroke="var(--flow)" strokeWidth={1.75} />
                <path d={ln((r) => r.capex)} fill="none" stroke="var(--claret)" strokeWidth={2.25} />
                <text x={x(last.year)!} y={y(last.capex) - 6} textAnchor="end" style={{ fill: "var(--claret)", fontWeight: 600 }}>
                  {usd(last.capex, 0)}
                </text>
                {rs.map((r) => (
                  <text key={r.year} x={x(r.year)} y={ph + 15} textAnchor="middle" style={{ fontSize: 11 }}>
                    {`’${r.year.slice(2)}`}
                  </text>
                ))}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
