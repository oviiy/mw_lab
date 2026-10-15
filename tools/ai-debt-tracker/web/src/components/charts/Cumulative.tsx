import { area, curveStepAfter, max, scaleLinear, scaleUtc, stack } from "d3";
import { useMemo } from "react";
import type { IssuerMeta } from "../../lib/data";
import { usd } from "../../lib/format";
import { useWidth } from "../../lib/hooks";
import { IssuerMarkG } from "../IssuerMark";

export interface Annotation {
  date: string;
  label: string;
}

interface Props {
  cumulative: Array<Record<string, number | string>>;
  issuers: IssuerMeta[];
  today: string;
  highlight?: string | null;
  shadeFrom?: string | null;
  annotations?: Annotation[];
  height?: number;
}

const d = (s: string) => new Date(`${s}T00:00:00Z`);

/** Stacked running total of AI borrowing by issuer. */
export default function Cumulative({ cumulative, issuers, today, highlight, shadeFrom, annotations = [], height: heightProp = 440 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(700);
  const height = width < 560 ? Math.min(heightProp, 320) : heightProp;
  const m = { top: 24, right: 128, bottom: 28, left: 44 };

  const order = useMemo(() => {
    const last = cumulative[cumulative.length - 1] ?? {};
    return issuers
      .filter((i) => typeof last[i.id] === "number")
      .sort((a, b) => (last[b.id] as number) - (last[a.id] as number))
      .map((i) => i.id);
  }, [cumulative, issuers]);

  const rows = useMemo(() => {
    const filled = cumulative.map((r) => {
      const o: Record<string, number> = { t: +d(r.date as string) };
      for (const k of order) o[k] = (r[k] as number) ?? 0;
      return o;
    });
    // carry the final level out to today
    const last = filled[filled.length - 1];
    return [{ ...Object.fromEntries(order.map((k) => [k, 0])), t: +d("2024-01-01") }, ...filled, { ...last, t: +d(today) }];
  }, [cumulative, order, today]);

  const series = stack<Record<string, number>>().keys(order)(rows);
  const x = scaleUtc().domain([d("2024-01-01"), d(today)]).range([m.left, width - m.right]);
  const top = max(series[series.length - 1], (p) => p[1]) ?? 1;
  const y = scaleLinear().domain([0, top * 1.05]).nice().range([height - m.bottom, m.top]);
  const shape = area<[number, number] & { data: Record<string, number> }>()
    .x((p) => x(p.data.t))
    .y0((p) => y(p[0]))
    .y1((p) => y(p[1]))
    .curve(curveStepAfter);
  const color = Object.fromEntries(issuers.map((i) => [i.id, i.color]));
  const name = Object.fromEntries(issuers.map((i) => [i.id, i.name]));

  return (
    <div ref={ref}>
      <svg className="chart" width={width} height={height} role="img"
        aria-label={`Cumulative AI-related borrowing reached ${usd(top)} by ${today}.`}>
        {shadeFrom && (
          <rect x={x(d(shadeFrom))} y={m.top} width={x(d(today)) - x(d(shadeFrom))}
            height={height - m.top - m.bottom} fill="var(--paper-deep)" />
        )}
        <g className="grid">
          {y.ticks(4).map((t) => (
            <g key={t}>
              <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
              <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t === 0 ? "$0" : usd(t, 0)}</text>
            </g>
          ))}
        </g>
        {series.map((s) => (
          <path key={s.key} d={shape(s as never) ?? ""} fill={color[s.key]}
            opacity={highlight && highlight !== s.key ? 0.18 : 0.92}
            style={{ transition: "opacity 400ms" }} />
        ))}
        {(() => {
          // labels in the right margin, centred on each band, pushed apart to avoid overlap
          const placed: { key: string; y: number }[] = [];
          for (const sr of series) {
            const last = sr[sr.length - 1];
            placed.push({ key: sr.key, y: (y(last[0]) + y(last[1])) / 2 + 4 });
          }
          placed.sort((a, b) => b.y - a.y);
          for (let i = 1; i < placed.length; i++) placed[i].y = Math.min(placed[i].y, placed[i - 1].y - 14);
          return placed.map((p) => (
            <g key={p.key} opacity={highlight && highlight !== p.key ? 0.35 : 1}>
              <IssuerMarkG id={p.key} color={color[p.key]} cx={width - m.right + 14} cy={p.y - 4} size={14} />
              <text x={width - m.right + 24} y={p.y} style={{ fill: color[p.key], fontWeight: 600 }}>
                {name[p.key]}
              </text>
            </g>
          ));
        })()}
        <g className="axis">
          {[2024, 2025, 2026].map((yr) => (
            <text key={yr} x={x(d(`${yr}-01-01`))} y={height - 8}>{yr}</text>
          ))}
        </g>
        {annotations.map((a, i) => {
          const ax = x(d(a.date));
          const total = rows.filter((r) => r.t <= +d(a.date)).at(-1);
          const ty = total ? y(order.reduce((s, k) => s + (total[k] ?? 0), 0)) : m.top;
          return (
            <g key={i}>
              <line x1={ax} x2={ax} y1={ty - 4} y2={ty - 34} stroke="var(--ink)" />
              <text x={ax - 4} y={ty - 40} textAnchor="end" className="label-strong">{a.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
