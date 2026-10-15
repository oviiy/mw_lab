import { scaleSqrt, scaleUtc } from "d3";
import { useEffect, useMemo, useState } from "react";
import type { IssuerMeta, SlimBond } from "../../lib/data";
import { useReducedMotion, useWidth } from "../../lib/hooks";
import BondCard from "../BondCard";

interface Props {
  bonds: SlimBond[];
  issuers: IssuerMeta[];
  today: string;
  /** compact = embed / small multiples */
  compact?: boolean;
  /** amount-weighted median maturity (ISO date), drawn as a reference line */
  median?: string;
}

const X_END = new Date(Date.UTC(2068, 0, 1));
const addYears = (iso: string, y: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Date(d.getTime() + y * 365.25 * 864e5);
};

/**
 * The hero: one horizontal thread per bond, from pricing date to maturity.
 * Claret while the servers it financed are still being depreciated, blue after.
 */
export default function Threads({ bonds, issuers, today, compact, median }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(1100);
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const meta = useMemo(() => Object.fromEntries(issuers.map((i) => [i.id, i])), [issuers]);

  const rows = useMemo(
    () =>
      [...bonds].sort(
        (a, b) => a.trade_date.localeCompare(b.trade_date) || b.tenor_years - a.tenor_years,
      ),
    [bonds],
  );

  const narrow = width < 640;
  const step = compact ? 2.2 : narrow ? 2.4 : 3.1;
  const MARG = compact ? 0 : narrow ? 36 : 56; // marginal histogram of $ due per year
  const m = { top: 30 + MARG, right: narrow ? 36 : 64, bottom: compact ? 12 : 34, left: narrow ? 8 : 4 };
  const height = m.top + m.bottom + rows.length * step;
  const x = scaleUtc()
    .domain([new Date(Date.UTC(2024, 0, 1)), X_END])
    .range([m.left, width - m.right]);
  const sw = scaleSqrt()
    .domain([0, Math.max(...rows.map((r) => r.amount_usd))])
    .range([0.4, narrow ? 2.4 : 3.2]);

  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const dueByYear = new Map<number, number>();
  for (const r of rows) {
    const yr = Math.min(+r.maturity_date.slice(0, 4), 2067);
    dueByYear.set(yr, (dueByYear.get(yr) ?? 0) + r.amount_usd);
  }
  const maxDue = Math.max(...dueByYear.values());
  const lifeLo = Math.min(...issuers.map((i) => i.life));
  const lifeHi = Math.max(...issuers.map((i) => i.life));
  const ticks = [2030, 2040, 2050, 2060].map((y) => new Date(Date.UTC(y, 0, 1)));
  const todayX = x(new Date(`${today}T00:00:00Z`));
  const overflow = rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => new Date(`${r.maturity_date}T00:00:00Z`) > X_END);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const py = e.clientY - box.top;
    const i = Math.round((py - m.top) / step);
    if (i < 0 || i >= rows.length) return setHover(null);
    setHover({ i, x: e.clientX - box.left, y: Math.min(py + 12, height - 40) });
  };

  const hovered = hover ? rows[hover.i] : null;

  return (
    <div className="threads" ref={ref} style={{ position: "relative" }}>
      <svg
        className="chart"
        width={width}
        height={height}
        role="img"
        aria-label={`${rows.length} AI-related bonds and loans drawn from issue date to maturity. Most run decades beyond the depreciation life of the servers they financed.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={() => hovered && window.open(hovered.source_url, "_blank", "noopener")}
        style={{ cursor: hovered ? "pointer" : "default", touchAction: "pan-y" }}
      >
        <g className="axis">
          {ticks.map((t) => (
            <g key={+t} transform={`translate(${x(t)},0)`} opacity={Math.abs(x(t) - todayX) < 44 ? 0 : 1}>
              <line y1={m.top - 8} y2={height - m.bottom} strokeDasharray="1 4" />
              <text y={22} textAnchor="middle">
                {t.getUTCFullYear()}
              </text>
            </g>
          ))}
        </g>
        <g>
          <line x1={todayX} x2={todayX} y1={m.top - 8} y2={height - m.bottom} stroke="var(--ink)" strokeWidth={1} />
          <text x={todayX + 5} y={22} className="label-strong">
            Today
          </text>
        </g>

        {MARG > 0 && (
          <g aria-hidden="true">
            {[...dueByYear.entries()].map(([yr, v]) => {
              const bx = x(new Date(Date.UTC(yr, 0, 1)));
              const bw = Math.max(1, x(new Date(Date.UTC(yr + 1, 0, 1))) - bx - 1);
              const bh = (v / maxDue) * (MARG - 14);
              return <rect key={yr} x={bx} y={m.top - 10 - bh} width={bw} height={bh} fill="var(--blue)" opacity={0.55} />;
            })}
            {!narrow && (
              <text x={x(new Date(Date.UTC(2045, 0, 1)))} y={m.top - MARG + 8} style={{ fontSize: 11 }}>
                Dollars falling due each year
              </text>
            )}
          </g>
        )}
        {median && (() => {
          const mx = x(new Date(`${median}T00:00:00Z`));
          return (
            <g>
              <line x1={mx} x2={mx} y1={m.top - 8} y2={height - m.bottom} stroke="var(--blue)" strokeDasharray="5 4" strokeWidth={1.25} />
              {!compact && (
                <text x={mx + 6} y={height - m.bottom + 16} style={{ fill: "var(--blue)", fontWeight: 600 }}>
                  Half of the money is owed past {median.slice(0, 4)}
                </text>
              )}
            </g>
          );
        })()}
        {!compact && !narrow && (
          <text x={m.left} y={height - m.bottom + 16} style={{ fill: "var(--claret)", fontWeight: 600 }}>
            Servers depreciated over {lifeLo}–{lifeHi} years
          </text>
        )}

        {rows.map((r, i) => {
          const y = m.top + i * step;
          const x0 = x(new Date(`${r.trade_date}T00:00:00Z`));
          const mat = new Date(`${r.maturity_date}T00:00:00Z`);
          const life = meta[r.issuer_id]?.life ?? 6;
          const lifeEnd = addYears(r.trade_date, life);
          const xLife = x(lifeEnd < mat ? lifeEnd : mat);
          const xEnd = x(mat > X_END ? X_END : mat);
          const dim = hovered && hovered !== r ? 0.25 : 1;
          const delay = reduced ? 0 : (i / rows.length) * 900;
          const t = (ms: number, d = 0) =>
            reduced ? "none" : `stroke-dashoffset ${ms}ms cubic-bezier(.3,.6,.2,1) ${delay + d}ms`;
          return (
            <g key={r.id} opacity={dim} strokeWidth={sw(r.amount_usd)} strokeLinecap="butt">
              <line
                x1={x0} x2={xLife} y1={y} y2={y}
                stroke="var(--claret)"
                pathLength={1} strokeDasharray="1 1"
                strokeDashoffset={drawn ? 0 : 1}
                style={{ transition: t(450) }}
              />
              {mat > lifeEnd && (
                <line
                  x1={xLife} x2={xEnd} y1={y} y2={y}
                  stroke="var(--blue)"
                  pathLength={1} strokeDasharray="1 1"
                  strokeDashoffset={drawn ? 0 : 1}
                  style={{ transition: t(1500, 420) }}
                />
              )}
            </g>
          );
        })}

        {overflow.reduce<{ id: string; y: number; label: string }[]>((acc, { r, i }) => {
          // nudge labels apart when neighbouring rows both overflow
          const natural = m.top + i * step + 4;
          const y = acc.length ? Math.max(natural, acc[acc.length - 1].y + 12) : natural;
          return [...acc, { id: r.id, y, label: r.maturity_date.slice(0, 4) }];
        }, []).map((l) => (
          <text key={l.id} x={x(X_END) + (narrow ? 3 : 6)} y={l.y} className="overflow-label">{narrow ? l.label : `→ ${l.label}`}</text>
        ))}
      </svg>
      {hovered && hover && (
        <BondCard
          bond={hovered}
          issuerName={meta[hovered.issuer_id]?.name ?? hovered.issuer_id}
          color={meta[hovered.issuer_id]?.color ?? "#000"}
          life={meta[hovered.issuer_id]?.life}
          x={hover.x}
          y={hover.y}
          bound={width}
        />
      )}
    </div>
  );
}
