import { scaleBand, scaleLinear } from "d3";
import { Fragment, useState } from "react";
import type { IssuerMeta } from "../../lib/data";
import { usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";

interface Props {
  wall: Record<string, Record<string, number>>;
  issuers: IssuerMeta[];
  /** last maturity year by which servers bought so far are written off */
  writtenOffBy: number;
  height?: number;
}

const FIRST = 2027;
const LAST = 2066;

/** When the money comes due, stacked by issuer. Years past LAST collapse into one bar. */
export default function Wall({ wall, issuers, writtenOffBy, height = 300 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(700);
  const [hover, setHover] = useState<string | null>(null);
  const m = { top: 28, right: 8, bottom: 26, left: 44 };
  const yearsList = Array.from({ length: LAST - FIRST + 1 }, (_, i) => String(FIRST + i));
  const later = Object.keys(wall).filter((y) => +y > LAST);
  const buckets = [...yearsList, "later"];
  const val = (b: string): Record<string, number> => {
    if (b !== "later") return wall[b] ?? {};
    const o: Record<string, number> = {};
    for (const y of later) for (const [k, v] of Object.entries(wall[y])) o[k] = (o[k] ?? 0) + v;
    return o;
  };
  const total = (b: string) => Object.values(val(b)).reduce((s, v) => s + v, 0);
  const x = scaleBand().domain(buckets).range([m.left, width - m.right]).padding(0.18);
  const y = scaleLinear().domain([0, Math.max(...buckets.map(total))]).nice().range([height - m.bottom, m.top]);
  const order = issuers.map((i) => i.id);
  const color = Object.fromEntries(issuers.map((i) => [i.id, i.color]));
  const shadeEnd = x(String(writtenOffBy))! + x.bandwidth();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label="AI-era debt by year of maturity.">
        <rect x={m.left} y={m.top - 22} width={shadeEnd - m.left} height={height - m.bottom - m.top + 22}
          fill="var(--claret-soft)" opacity={0.55} />
        <text x={(m.left + shadeEnd) / 2} y={m.top - 8} textAnchor="middle" style={{ fill: "var(--claret)", fontWeight: 600 }}>
          In service
        </text>
        <text x={shadeEnd + 6} y={m.top - 8} style={{ fill: "var(--blue)", fontWeight: 600 }}>
          Servers written off, debt still owed →
        </text>
        <g className="grid">
          {y.ticks(4).map((t) => (
            <g key={t}>
              <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
              <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? "0" : usd(t, 0)}</text>
            </g>
          ))}
        </g>
        {buckets.map((b) => {
          let acc = 0;
          return (
            <g key={b} onPointerEnter={() => setHover(b)} onPointerLeave={() => setHover(null)}>
              <rect x={x(b)} y={m.top} width={x.bandwidth()} height={height - m.top - m.bottom} fill="transparent" />
              {order.map((k) => {
                const v = val(b)[k];
                if (!v) return null;
                const y1 = y(acc + v);
                const h = y(acc) - y1;
                acc += v;
                return <rect key={k} x={x(b)} y={y1} width={x.bandwidth()} height={h} fill={color[k]}
                  opacity={hover && hover !== b ? 0.5 : 1} />;
              })}
            </g>
          );
        })}
        <g className="axis">
          {buckets.filter((b) => b === "later" || +b % 5 === 0).map((b) => (
            <text key={b} x={x(b)! + x.bandwidth() / 2} y={height - 8} textAnchor="middle">
              {b === "later" ? `${later[0] ?? ""}+` : b}
            </text>
          ))}
        </g>
      </svg>
      {hover && total(hover) > 0 && (
        <div className="card" style={{ left: Math.min(x(hover)! + 14, width - 240), top: y(total(hover)) - 10 }}>
          <div className="card-name num">
            {hover === "later" ? `After ${LAST}` : `Due in ${hover}`}: {usd(total(hover))}
          </div>
          <dl className="card-grid num">
            {issuers.filter((i) => val(hover)[i.id]).map((i) => (
              <Fragment key={i.id}><dt>{i.name}</dt><dd>{usd(val(hover)[i.id])}</dd></Fragment>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
