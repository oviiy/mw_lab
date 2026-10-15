import { scaleLinear, scaleLog, scaleSqrt } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IssuerMeta, SlimBond } from "../lib/data";
import { date, INSTRUMENT_LABEL, local, pct, usd } from "../lib/format";
import { useWidth } from "../lib/hooks";
import BondCard from "./BondCard";
import IssuerMark from "./IssuerMark";

interface Props {
  bonds: SlimBond[];
  issuers: IssuerMeta[];
}

type SortKey = "trade_date" | "amount_usd" | "tenor_years" | "coupon_pct" | "spread_bp" | "issuer_id";

interface State {
  issuers: string[];
  currency: string;
  type: string;
  aiOnly: boolean;
  q: string;
  tenor: [number, number] | null;
  sort: SortKey;
  desc: boolean;
}

const DEFAULT: State = { issuers: [], currency: "", type: "", aiOnly: false, q: "", tenor: null, sort: "trade_date", desc: true };

/** Filter state lives in the URL hash (#explore?...) so any view can be shared. */
function readHash(): State {
  if (typeof window === "undefined") return DEFAULT;
  const h = window.location.hash;
  if (!h.startsWith("#explore?")) return DEFAULT;
  const p = new URLSearchParams(h.slice("#explore?".length));
  const tenor = p.get("tenor")?.split("-").map(Number);
  return {
    issuers: p.get("issuer")?.split(",").filter(Boolean) ?? [],
    currency: p.get("ccy") ?? "",
    type: p.get("type") ?? "",
    aiOnly: p.get("ai") === "1",
    q: p.get("q") ?? "",
    tenor: tenor && tenor.length === 2 && tenor.every(Number.isFinite) ? [tenor[0], tenor[1]] : null,
    sort: (p.get("sort") as SortKey) ?? "trade_date",
    desc: p.get("dir") !== "asc",
  };
}

function writeHash(s: State) {
  const p = new URLSearchParams();
  if (s.issuers.length) p.set("issuer", s.issuers.join(","));
  if (s.currency) p.set("ccy", s.currency);
  if (s.type) p.set("type", s.type);
  if (s.aiOnly) p.set("ai", "1");
  if (s.q) p.set("q", s.q);
  if (s.tenor) p.set("tenor", s.tenor.map((v) => v.toFixed(1)).join("-"));
  if (s.sort !== "trade_date") p.set("sort", s.sort);
  if (!s.desc) p.set("dir", "asc");
  const str = p.toString();
  history.replaceState(null, "", str ? `#explore?${str}` : window.location.pathname + window.location.search);
}

function toCsv(rows: SlimBond[]) {
  const cols: (keyof SlimBond)[] = ["issuer_id", "name", "instrument_type", "trade_date", "maturity_date", "tenor_years",
    "currency", "amount", "amount_usd", "coupon_pct", "floating_spread_bp", "spread_bp", "cusip", "ai_flag", "source_url"];
  const esc = (v: unknown) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export default function Explorer({ bonds, issuers }: Props) {
  const [s, setS] = useState<State>(DEFAULT);
  const [ref, width] = useWidth<HTMLDivElement>(900);
  const [hover, setHover] = useState<{ b: SlimBond; x: number; y: number } | null>(null);
  const drag = useRef<number | null>(null);
  const [dragX, setDragX] = useState<[number, number] | null>(null);
  const meta = useMemo(() => Object.fromEntries(issuers.map((i) => [i.id, i])), [issuers]);

  useEffect(() => setS(readHash()), []);
  const update = (patch: Partial<State>) =>
    setS((prev) => {
      const next = { ...prev, ...patch };
      writeHash(next);
      return next;
    });

  const currencies = useMemo(() => [...new Set(bonds.map((b) => b.currency))].sort(), [bonds]);
  const types = useMemo(() => [...new Set(bonds.map((b) => b.instrument_type))].sort(), [bonds]);

  const base = useMemo(
    () =>
      bonds.filter(
        (b) =>
          (!s.issuers.length || s.issuers.includes(b.issuer_id)) &&
          (!s.currency || b.currency === s.currency) &&
          (!s.type || b.instrument_type === s.type) &&
          (!s.aiOnly || b.ai_flag === "explicit") &&
          (!s.q || `${b.name} ${b.cusip ?? ""} ${meta[b.issuer_id]?.name}`.toLowerCase().includes(s.q.toLowerCase())),
      ),
    [bonds, s, meta],
  );
  const rows = useMemo(() => {
    const list = s.tenor ? base.filter((b) => b.tenor_years >= s.tenor![0] && b.tenor_years <= s.tenor![1]) : base;
    const k = s.sort;
    return [...list].sort((a, b) => {
      const av = a[k] ?? -Infinity;
      const bv = b[k] ?? -Infinity;
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return s.desc ? -c : c;
    });
  }, [base, s.tenor, s.sort, s.desc]);

  const total = rows.reduce((t, b) => t + b.amount_usd, 0);

  // scatter: tenor (log) vs coupon
  const h = 300;
  const m = { top: 16, right: 16, bottom: 34, left: 44 };
  const x = scaleLog().domain([1, 110]).range([m.left, width - m.right]).clamp(true);
  const fixed = base.filter((b) => b.coupon_pct != null);
  const y = scaleLinear().domain([0, Math.max(10, ...fixed.map((b) => b.coupon_pct!))]).nice().range([h - m.bottom, m.top]);
  const r = scaleSqrt().domain([0, Math.max(...bonds.map((b) => b.amount_usd))]).range([2, 16]);

  const startDrag = (e: React.PointerEvent<SVGRectElement>) => {
    const px = e.clientX - e.currentTarget.ownerSVGElement!.getBoundingClientRect().left;
    drag.current = px;
    setDragX([px, px]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent<SVGRectElement>) => {
    if (drag.current == null) return;
    const px = e.clientX - e.currentTarget.ownerSVGElement!.getBoundingClientRect().left;
    setDragX([Math.min(drag.current, px), Math.max(drag.current, px)]);
  };
  const endDrag = () => {
    if (drag.current == null || !dragX) return;
    drag.current = null;
    if (dragX[1] - dragX[0] < 6) update({ tenor: null });
    else update({ tenor: [x.invert(dragX[0]), x.invert(dragX[1])] });
    setDragX(null);
  };
  const band = dragX ?? (s.tenor ? [x(s.tenor[0]), x(s.tenor[1])] : null);

  const th = (k: SortKey, label: string, numeric = false) => (
    <th scope="col" className={numeric ? "n" : ""}
      aria-sort={s.sort === k ? (s.desc ? "descending" : "ascending") : "none"}>
      <button type="button" onClick={() => update({ sort: k, desc: s.sort === k ? !s.desc : true })}>
        {label}{s.sort === k ? (s.desc ? " ↓" : " ↑") : ""}
      </button>
    </th>
  );

  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-debt-tracker-selection.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="explorer">
      <div className="filters" role="group" aria-label="Filter bonds">
        <div className="chips">
          {issuers.filter((i) => bonds.some((b) => b.issuer_id === i.id)).map((i) => {
            const on = s.issuers.includes(i.id);
            return (
              <button key={i.id} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on}
                onClick={() => update({ issuers: on ? s.issuers.filter((x) => x !== i.id) : [...s.issuers, i.id] })}>
                <IssuerMark id={i.id} color={i.color} size={18} />
                {i.name}
              </button>
            );
          })}
        </div>
        <div className="controls">
          <label>Currency
            <select value={s.currency} onChange={(e) => update({ currency: e.target.value })}>
              <option value="">All</option>
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Type
            <select value={s.type} onChange={(e) => update({ type: e.target.value })}>
              <option value="">All</option>
              {types.map((t) => <option key={t} value={t}>{INSTRUMENT_LABEL[t]}</option>)}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={s.aiOnly} onChange={(e) => update({ aiOnly: e.target.checked })} />
            Use of proceeds names AI
          </label>
          <label className="search">Search
            <input type="search" value={s.q} placeholder="Name or CUSIP" onChange={(e) => update({ q: e.target.value })} />
          </label>
          {(s.issuers.length || s.currency || s.type || s.aiOnly || s.q || s.tenor) ? (
            <button type="button" className="link" onClick={() => update({ ...DEFAULT, sort: s.sort, desc: s.desc })}>
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div ref={ref} style={{ position: "relative" }}>
        <svg className="chart" width={width} height={h} role="img"
          aria-label="Scatter plot of fixed-rate bonds by term and coupon. Drag across it to filter by term.">
          <g className="grid">
            {y.ticks(5).map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end">{t}%</text>
              </g>
            ))}
          </g>
          <g className="axis">
            {[1, 2, 5, 10, 20, 30, 50, 100].map((t) => (
              <text key={t} x={x(t)} y={h - 14} textAnchor="middle">{t}y</text>
            ))}
            <text x={width - m.right} y={h - 1} textAnchor="end">Years to maturity (log scale). Drag to filter.</text>
          </g>
          {band && <rect x={band[0]} y={m.top} width={band[1] - band[0]} height={h - m.top - m.bottom} fill="var(--blue-soft)" opacity={0.5} />}
          <rect x={m.left} y={m.top} width={width - m.left - m.right} height={h - m.top - m.bottom} fill="transparent"
            style={{ cursor: "crosshair", touchAction: "pan-y" }}
            onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} />
          {fixed.map((b) => {
            const inTenor = !s.tenor || (b.tenor_years >= s.tenor[0] && b.tenor_years <= s.tenor[1]);
            // rounded so server and client render identical attribute strings
            const cx = Math.round(x(b.tenor_years) * 100) / 100;
            const cy = Math.round(y(b.coupon_pct!) * 100) / 100;
            return (
              <circle key={b.id} cx={cx} cy={cy} r={r(b.amount_usd)} fill={meta[b.issuer_id].color}
                fillOpacity={inTenor ? 0.7 : 0.12} stroke="var(--paper)"
                style={{ pointerEvents: drag.current != null ? "none" : "auto", cursor: "pointer" }}
                onPointerEnter={() => setHover({ b, x: cx, y: cy })} onPointerLeave={() => setHover(null)}
                onClick={() => window.open(b.source_url, "_blank", "noopener")} />
            );
          })}
        </svg>
        {hover && (
          <BondCard bond={hover.b} issuerName={meta[hover.b.issuer_id].name} color={meta[hover.b.issuer_id].color}
            life={meta[hover.b.issuer_id].life} x={hover.x} y={hover.y + 10} bound={width} />
        )}
      </div>

      <div className="table-head">
        <p className="num" aria-live="polite">
          <strong>{rows.length}</strong> of {bonds.length} bonds and loans, totalling <strong>{usd(total)}</strong>
        </p>
        <button type="button" onClick={download}>Download these rows (CSV)</button>
      </div>
      <div className="table-scroll">
        <table className="num">
          <thead>
            <tr>
              {th("issuer_id", "Issuer")}
              <th scope="col">Bond</th>
              {th("trade_date", "Priced")}
              {th("amount_usd", "Amount", true)}
              {th("coupon_pct", "Coupon", true)}
              {th("tenor_years", "Term", true)}
              {th("spread_bp", "Spread", true)}
              <th scope="col">Filing</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td><span className="with-mark"><IssuerMark id={b.issuer_id} color={meta[b.issuer_id].color} size={16} />{meta[b.issuer_id].name}</span></td>
                <td className="bond-name">{b.name}</td>
                <td>{date(b.trade_date)}</td>
                <td className="n">{local(b.amount, b.currency)}</td>
                <td className="n">{b.coupon_pct != null ? pct(b.coupon_pct) : b.floating_spread_bp != null ? `+${b.floating_spread_bp}bp` : "—"}</td>
                <td className="n">{b.tenor_years.toFixed(1)}y</td>
                <td className="n">{b.spread_bp != null ? `+${b.spread_bp}` : "—"}</td>
                <td><a href={b.source_url} target="_blank" rel="noopener">SEC</a></td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={8} className="empty">No bonds match these filters. Clear a filter to see more.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
