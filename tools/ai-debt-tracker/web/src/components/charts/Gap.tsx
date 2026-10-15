import { area, line, scaleLinear, scaleUtc } from "d3";
import { useMemo, useState } from "react";
import type { IssuerMeta, SlimBond } from "../../lib/data";
import { share, usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";

interface Props {
  bonds: SlimBond[];
  issuers: IssuerMeta[];
  today: string;
  /** hide the slider (embeds) */
  fixed?: boolean;
}

const YEAR_MS = 365.25 * 864e5;
const t0 = Date.UTC(2024, 0, 1);
const t1 = Date.UTC(2070, 0, 1);

interface Point {
  t: number;
  debt: number;
  asset: number;
}

/**
 * Stylised asset–liability profile. Each tranche is assumed to finance servers of
 * equal cost bought on its pricing date and depreciated straight-line over the
 * issuer's disclosed useful life (or the life chosen with the slider).
 */
function profile(bonds: SlimBond[], lifeOf: (id: string) => number): Point[] {
  const pts: Point[] = [];
  for (let t = t0; t <= t1; t += YEAR_MS / 4) {
    let debt = 0;
    let asset = 0;
    for (const b of bonds) {
      const s = Date.parse(`${b.trade_date}T00:00:00Z`);
      if (t < s) continue;
      const m = Date.parse(`${b.maturity_date}T00:00:00Z`);
      if (t < m) debt += b.amount_usd;
      const age = (t - s) / YEAR_MS;
      asset += b.amount_usd * Math.max(0, 1 - age / lifeOf(b.issuer_id));
    }
    pts.push({ t, debt, asset });
  }
  return pts;
}

export default function Gap({ bonds, issuers, today, fixed }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const [life, setLife] = useState<number | null>(null); // null = disclosed lives
  const [hoverT, setHoverT] = useState<number | null>(null);
  const lives = useMemo(() => Object.fromEntries(issuers.map((i) => [i.id, i.life])), [issuers]);
  const pts = useMemo(() => profile(bonds, (id) => life ?? lives[id] ?? 6), [bonds, life, lives]);

  const narrow = width < 600;
  const height = narrow ? 300 : 380;
  const m = { top: 24, right: 16, bottom: 30, left: 52 };
  const x = scaleUtc().domain([t0, t1]).range([m.left, width - m.right]);
  const y = scaleLinear().domain([0, Math.max(...pts.map((p) => p.debt)) * 1.08]).nice().range([height - m.bottom, m.top]);
  const debtArea = area<Point>().x((p) => x(p.t)).y0(y(0)).y1((p) => y(p.debt));
  const assetArea = area<Point>().x((p) => x(p.t)).y0(y(0)).y1((p) => y(p.asset));
  const debtLine = line<Point>().x((p) => x(p.t)).y((p) => y(p.debt));

  const todayT = Date.parse(`${today}T00:00:00Z`);
  // the point where book value of hardware has fallen to half of the debt still owed
  const cross = pts.find((p) => p.t > todayT && p.asset < p.debt * 0.5);
  const at = (t: number) => pts.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best), pts[0]);
  const probe = at(hoverT ?? Date.UTC(2032, 0, 1));
  const uncovered = Math.max(0, probe.debt - probe.asset);
  const totalBorrowed = bonds.reduce((s, b) => s + b.amount_usd, 0);
  const outliving = bonds
    .filter((b) => b.tenor_years > (life ?? lives[b.issuer_id] ?? 6))
    .reduce((s, b) => s + b.amount_usd, 0) / totalBorrowed;

  return (
    <div className="gap">
      {!fixed && (
        <div className="gap-controls sans">
          <label htmlFor="gap-life">
            Assumed life of what the debt bought:{" "}
            <strong>{life == null ? "as disclosed (5–6 years)" : `${life} years`}</strong>
          </label>
          <input id="gap-life" type="range" min={3} max={30} step={1} value={life ?? 6}
            onChange={(e) => setLife(Number(e.target.value))} aria-describedby="gap-readout" />
          <span className="gap-presets">
            <button type="button" className={life == null ? "on" : ""} onClick={() => setLife(null)}>Disclosed</button>
            <button type="button" className={life === 10 ? "on" : ""} onClick={() => setLife(10)}>10 yrs</button>
            <button type="button" className={life === 20 ? "on" : ""} onClick={() => setLife(20)}>20 yrs (mixed with buildings)</button>
          </span>
          <p id="gap-readout" className="gap-readout" aria-live="polite">
            At this life, <strong>{share(outliving)}</strong> of the money is still owed after the asset is fully written off.
          </p>
        </div>
      )}
      <div ref={ref} style={{ position: "relative" }}>
        <svg className="chart" width={width} height={height} role="img"
          aria-label="Debt outstanding versus the remaining book value of the servers it financed, 2024 to 2070."
          onPointerMove={(e) => {
            const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
            const t = +x.invert(px);
            setHoverT(t >= t0 && t <= t1 ? t : null);
          }}
          onPointerLeave={() => setHoverT(null)}>
          <g className="grid">
            {y.ticks(4).map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? "0" : usd(t, 0)}</text>
              </g>
            ))}
          </g>
          <path d={debtArea(pts) ?? ""} fill="var(--blue-soft)" opacity={0.75} />
          <path d={assetArea(pts) ?? ""} fill="var(--claret)" opacity={0.85} style={{ transition: "d 300ms" }} />
          <path d={debtLine(pts) ?? ""} fill="none" stroke="var(--blue)" strokeWidth={2} />
          <g className="axis">
            {[2025, 2030, 2040, 2050, 2060, 2070].map((yr) => (
              <text key={yr} x={x(Date.UTC(yr, 0, 1))} y={height - 10} textAnchor="middle">{yr}</text>
            ))}
          </g>
          <line x1={x(todayT)} x2={x(todayT)} y1={m.top} y2={height - m.bottom} stroke="var(--ink)" strokeDasharray="2 3" />
          <text x={x(todayT) + 4} y={m.top + 10} className="label-strong">Today</text>

          {(() => {
            const p40 = at(Date.UTC(2040, 0, 1));
            return (
              <text x={x(p40.t)} y={y(p40.debt) - 10} style={{ fill: "var(--blue)", fontWeight: 600 }}>
                Debt still owed after the hardware is written off
              </text>
            );
          })()}
          {cross && (
            <g>
              <text x={x(cross.t) + 6} y={y(cross.asset) - 8} style={{ fill: "var(--claret)", fontWeight: 600 }}>
                Remaining book value of the servers
              </text>
            </g>
          )}
          {hoverT != null && (
            <g>
              <line x1={x(probe.t)} x2={x(probe.t)} y1={m.top} y2={height - m.bottom} stroke="var(--ink)" />
              <circle cx={x(probe.t)} cy={y(probe.debt)} r={4} fill="var(--blue)" />
              <circle cx={x(probe.t)} cy={y(probe.asset)} r={4} fill="var(--claret)" />
            </g>
          )}
        </svg>
        <p className="gap-probe sans">
          In <strong>{new Date(probe.t).getUTCFullYear()}</strong>: {usd(probe.debt)} still owed, against {usd(probe.asset)} of
          undepreciated hardware. Gap: <strong className="blue">{usd(uncovered)}</strong>.{" "}
          <span className="muted">{hoverT == null ? "Move across the chart to read other years." : ""}</span>
        </p>
      </div>
    </div>
  );
}
