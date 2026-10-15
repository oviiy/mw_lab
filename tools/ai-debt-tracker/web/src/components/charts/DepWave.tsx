import { scaleBand, scaleLinear } from "d3";
import { useMemo, useState } from "react";
import type { IssuerMeta } from "../../lib/data";
import { depreciationWave } from "../../lib/depreciation";
import { share, usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";
import type { WaveIssuer } from "../../lib/types";
import IssuerMark from "../IssuerMark";

interface Props {
  wave: Record<string, WaveIssuer>;
  issuers: IssuerMeta[];
  initialIssuer?: string;
  fixed?: boolean;
}

/**
 * Illustrative: depreciation of capex already spent, by fiscal year, if a share of each
 * year's capex is servers depreciated over the chosen life and the rest over a long life.
 * No future capex is assumed, so projected years are a floor.
 */
export default function DepWave({ wave, issuers, initialIssuer = "oracle", fixed }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const avail = issuers.filter((i) => wave[i.id]);
  const [issuer, setIssuer] = useState(wave[initialIssuer] ? initialIssuer : avail[0]?.id);
  const [life, setLife] = useState<number | null>(null); // null = disclosed lives incl. history
  const w = wave[issuer];
  const [serverShare, setServerShare] = useState(w?.server_share ?? 0.5);

  const rows = useMemo(() => {
    if (!w) return [];
    const disclosed = new Map(w.vintages.map((v) => [v.fy, v.server_life]));
    const out = depreciationWave(w.vintages, (fy) => life ?? disclosed.get(fy) ?? 6, serverShare, w.other_life,
      w.years.map((y) => y.fy));
    return out.map((r, i) => ({ ...r, reported: w.years[i].reported_depreciation, projected: w.years[i].projected }));
  }, [w, life, serverShare]);

  if (!w) return null;
  const narrow = width < 640;
  const height = narrow ? 300 : 360;
  const m = { top: 24, right: 16, bottom: 30, left: 56 };
  const x = scaleBand().domain(rows.map((r) => String(r.fy))).range([m.left, width - m.right]).padding(0.25);
  const y = scaleLinear().domain([0, Math.max(...rows.map((r) => Math.max(r.total, r.reported ?? 0))) * 1.15]).nice()
    .range([height - m.bottom, m.top]);
  const peak = rows.filter((r) => r.projected).reduce((a, r) => (r.total > (a?.total ?? -1) ? r : a), null as null | typeof rows[0]);
  const name = issuers.find((i) => i.id === issuer)?.name;
  const disclosedLives = [...new Set(w.vintages.map((v) => v.server_life))].sort((a, b) => a - b).join(" → ");

  return (
    <div>
      <div className="picker" role="radiogroup" aria-label="Company">
        {avail.map((i) => (
          <button key={i.id} type="button" role="radio" aria-checked={issuer === i.id} className={issuer === i.id ? "on" : ""}
            onClick={() => setIssuer(i.id)}>
            <IssuerMark id={i.id} size={16} />{i.name}
          </button>
        ))}
      </div>
      {!fixed && (
        <div className="gap-controls sans">
          <label htmlFor="dw-life">
            Server life: <strong>{life == null ? `as disclosed (${disclosedLives} years by vintage)` : `${life} years for every vintage`}</strong>
          </label>
          <input id="dw-life" type="range" min={3} max={10} step={0.5} value={life ?? w.vintages.at(-1)!.server_life}
            onChange={(e) => setLife(Number(e.target.value))} />
          <label htmlFor="dw-share">
            Share of capex that is servers: <strong>{share(serverShare)}</strong> <span className="muted">(illustrative; not disclosed)</span>
          </label>
          <input id="dw-share" type="range" min={0.2} max={0.8} step={0.05} value={serverShare}
            onChange={(e) => setServerShare(Number(e.target.value))} />
          <span className="gap-presets">
            <button type="button" className={life == null ? "on" : ""} onClick={() => setLife(null)}>Disclosed lives</button>
            <button type="button" className={life === 4 ? "on" : ""} onClick={() => setLife(4)}>4 yrs</button>
            <button type="button" className={life === 8 ? "on" : ""} onClick={() => setLife(8)}>8 yrs</button>
          </span>
        </div>
      )}
      <div ref={ref}>
        <svg className="chart" width={width} height={height} role="img"
          aria-label={`${name}: modelled depreciation of capex already spent, by fiscal year, against reported depreciation.`}>
          <g className="grid">
            {y.ticks(5).map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? "0" : usd(t, 0)}</text>
              </g>
            ))}
          </g>
          {rows.map((r) => {
            const xx = x(String(r.fy))!;
            return (
              <g key={r.fy} opacity={r.projected ? 0.78 : 1}>
                <rect x={xx} y={y(r.server)} width={x.bandwidth()} height={y(0) - y(r.server)} fill="var(--claret)" />
                <rect x={xx} y={y(r.total)} width={x.bandwidth()} height={y(r.server) - y(r.total)} fill="var(--claret-soft)" />
                {r.projected && (
                  <rect x={xx} y={y(r.total)} width={x.bandwidth()} height={y(0) - y(r.total)} fill="url(#dw-hatch)" />
                )}
                {r.reported != null && (
                  <circle cx={xx + x.bandwidth() / 2} cy={y(r.reported)} r={4.5} fill="var(--ink)" stroke="var(--paper)" strokeWidth={1.5} />
                )}
                <text x={xx + x.bandwidth() / 2} y={height - 10} textAnchor="middle">
                  {`FY${String(r.fy).slice(2)}`}
                </text>
              </g>
            );
          })}
          <defs>
            <pattern id="dw-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="var(--paper)" strokeWidth="1.2" opacity=".6" />
            </pattern>
          </defs>
          {peak && w.latest_revenue && (
            <text x={x(String(peak.fy))! + x.bandwidth() / 2} y={y(peak.total) - 8} textAnchor="middle" className="label-strong">
              {usd(peak.total)} = {share(peak.total / w.latest_revenue)} of FY{w.latest_fy} revenue
            </text>
          )}
          <line x1={x(String(w.latest_fy))! + x.bandwidth() + 4} x2={x(String(w.latest_fy))! + x.bandwidth() + 4}
            y1={m.top} y2={height - m.bottom} stroke="var(--ink)" strokeDasharray="2 3" />
          <text x={x(String(w.latest_fy))! + x.bandwidth() + 8} y={m.top + 8}>projected →</text>
        </svg>
      </div>
      <ul className="key sans" aria-label="Legend">
        <li><span className="swatch claret" aria-hidden="true" />Servers ({share(serverShare)} of capex)</li>
        <li><span className="swatch" style={{ background: "var(--claret-soft)" }} aria-hidden="true" />Buildings and other ({w.other_life}-year life)</li>
        <li><span className="key-dot" aria-hidden="true" />Reported depreciation</li>
      </ul>
    </div>
  );
}
