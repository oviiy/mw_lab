import { line, scaleLinear, scaleLog } from "d3";
import { useMemo, useState } from "react";
import type { IssuerMeta, SlimBond } from "../../lib/data";
import { useWidth } from "../../lib/hooks";
import BondCard from "../BondCard";
import IssuerMark from "../IssuerMark";
import { curveSample, fitCurve as fit, type CurveFit } from "../../lib/stats";

interface Props {
  bonds: SlimBond[];
  issuers: IssuerMeta[];
}

type Period = "all" | "before" | "since";
const SPLIT = "2026-01-01";
const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "All deals" },
  { id: "before", label: "2024–2025" },
  { id: "since", label: "2026" },
];

/** New-issue spread against tenor for USD fixed-rate bonds, with a fitted curve per issuer. */
export default function CreditCurves({ bonds, issuers }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const [period, setPeriod] = useState<Period>("all");
  const [hover, setHover] = useState<{ b: SlimBond; x: number; y: number } | null>(null);
  const meta = Object.fromEntries(issuers.map((i) => [i.id, i]));

  const usable = useMemo(() => curveSample(bonds), [bonds]);
  const pts = usable.filter((b) =>
    period === "all" ? true : period === "before" ? b.trade_date < SPLIT : b.trade_date >= SPLIT,
  );
  const ids = issuers.map((i) => i.id).filter((id) => usable.some((b) => b.issuer_id === id));
  const fits = Object.fromEntries(ids.map((id) => [id, fit(pts.filter((b) => b.issuer_id === id))]));

  const narrow = width < 600;
  const height = narrow ? 320 : 400;
  const m = { top: 20, right: narrow ? 12 : 170, bottom: 34, left: 44 };
  const x = scaleLog().domain([2, 45]).range([m.left, width - m.right]).clamp(true);
  const y = scaleLinear().domain([0, Math.max(200, ...usable.map((b) => b.spread_bp!)) * 1.05]).nice().range([height - m.bottom, m.top]);
  const curve = (f: CurveFit, lo: number, hi: number) =>
    line<number>().x((t) => x(t)).y((t) => y(f.a + f.b * Math.log(t)))(
      Array.from({ length: 30 }, (_, i) => lo * (hi / lo) ** (i / 29)),
    ) ?? "";

  const labels = ids
    .filter((id) => fits[id])
    .map((id) => ({ id, y: y(fits[id]!.a + fits[id]!.b * Math.log(40)) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + 15);

  return (
    <div>
      <div className="segmented sans" role="radiogroup" aria-label="Pricing period">
        {PERIODS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={period === p.id}
            className={period === p.id ? "on" : ""} onClick={() => setPeriod(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <div ref={ref} style={{ position: "relative" }}>
        <svg className="chart" width={width} height={height} role="img"
          aria-label="New-issue spread over Treasuries against years to maturity, with a fitted curve per issuer.">
          <g className="grid">
            {y.ticks(5).map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t}</text>
              </g>
            ))}
            <text x={m.left - 6} y={m.top - 6} textAnchor="end">bp</text>
          </g>
          <g className="axis">
            {[2, 3, 5, 7, 10, 20, 30, 40].map((t) => (
              <text key={t} x={x(t)} y={height - 16} textAnchor="middle">{t}y</text>
            ))}
            <text x={(m.left + width - m.right) / 2} y={height - 1} textAnchor="middle">Years to maturity (log scale)</text>
          </g>
          {ids.map((id) => {
            const f = fits[id];
            if (!f) return null;
            const own = pts.filter((b) => b.issuer_id === id).map((b) => b.tenor_years);
            return <path key={id} d={curve(f, Math.max(2, Math.min(...own)), Math.min(45, Math.max(...own)))}
              fill="none" stroke={meta[id].color} strokeWidth={2.25} />;
          })}
          {pts.map((b) => {
            const cx = Math.round(x(b.tenor_years) * 100) / 100;
            const cy = Math.round(y(b.spread_bp!) * 100) / 100;
            return (
              <circle key={b.id} cx={cx} cy={cy} r={4.5} fill={meta[b.issuer_id].color} fillOpacity={0.55}
                stroke="var(--paper)" style={{ cursor: "pointer" }}
                onPointerEnter={() => setHover({ b, x: cx, y: cy })} onPointerLeave={() => setHover(null)}
                onClick={() => window.open(b.source_url, "_blank", "noopener")} />
            );
          })}
          {!narrow &&
            labels.map((l) => (
              <text key={l.id} x={width - m.right + 8} y={l.y + 4} style={{ fill: meta[l.id].color, fontWeight: 600 }}>
                {meta[l.id].name} <tspan style={{ fill: "var(--muted)", fontWeight: 400 }}>
                  {Math.round(fits[l.id]!.at10)}bp @10y
                </tspan>
              </text>
            ))}
        </svg>
        {hover && (
          <BondCard bond={hover.b} issuerName={meta[hover.b.issuer_id].name} color={meta[hover.b.issuer_id].color}
            x={hover.x} y={hover.y + 8} bound={width} />
        )}
      </div>
      <table className="fit-table num">
        <caption className="visually-hidden">Fitted credit curves</caption>
        <thead>
          <tr><th scope="col">Issuer</th><th className="n" scope="col">Bonds</th><th className="n" scope="col">Spread at 10y</th>
            <th className="n" scope="col">Slope per doubling of tenor</th><th className="n" scope="col">R²</th></tr>
        </thead>
        <tbody>
          {ids.filter((id) => fits[id]).map((id) => (
            <tr key={id}>
              <td><span className="with-mark"><IssuerMark id={id} color={meta[id].color} size={16} />{meta[id].name}</span></td>
              <td className="n">{fits[id]!.n}</td>
              <td className="n">{Math.round(fits[id]!.at10)}bp</td>
              <td className="n">{(fits[id]!.b * Math.LN2).toFixed(1)}bp</td>
              <td className="n">{fits[id]!.r2.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
