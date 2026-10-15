import { useRef, useState, type ReactNode } from "react";
import { exportPng } from "../lib/exportPng";

interface Props {
  id: string;
  title: string;
  source: string;
  children: ReactNode;
  /** "Figure 3" — numbered like a paper so the text can refer to it. */
  number?: string;
  /** One-line guide shown under the title: what the encodings mean. */
  how?: string;
  /** Methodological notes printed under the chart, journal style. */
  notes?: string;
  /** Optional link for the source line (a filing, an API endpoint, a FRED series). */
  sourceUrl?: string;
  /** Hide share controls (used inside /embed pages, which are already the shared thing). */
  bare?: boolean;
}

/** Wraps a chart with its title, source line and the three ways to take it elsewhere. */
export default function ChartFrame({ id, title, source, children, number, how, notes, sourceUrl, bare }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [panel, setPanel] = useState<null | "embed">(null);
  const [copied, setCopied] = useState<string | null>(null);

  const base = typeof window === "undefined" ? "" : `${window.location.origin}${import.meta.env.BASE_URL}`;
  const link = `${base}#${id}`;
  const embed = `<iframe src="${base}embed/${id}/" width="100%" height="520" style="border:0" title="${title}" loading="lazy"></iframe>`;

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const save = () => {
    const svg = ref.current?.querySelector<SVGSVGElement>("svg.chart");
    if (svg) exportPng(svg, number ? `${number}. ${title}` : title, `${source} · AI Debt Tracker`, `ai-debt-${id}.png`);
  };

  return (
    <figure className="frame" id={id} ref={ref}>
      <figcaption className="frame-title">
        {number && <span className="frame-number">{number}</span>}
        {title}
      </figcaption>
      {how && <p className="frame-how">{how}</p>}
      <div className="frame-body">{children}</div>
      <div className="frame-foot">
        <span className="frame-source">
          {notes && <span className="frame-notes"><em>Notes:</em> {notes} </span>}
          <span>
            <em>Source:</em>{" "}
            {sourceUrl ? <a href={sourceUrl}>{source.replace(/^Sources?:\s*/, "")}</a> : source.replace(/^Sources?:\s*/, "")}
          </span>
        </span>
        {!bare && (
          <span className="frame-actions">
            <button type="button" onClick={() => copy(link, "link")}>
              {copied === "link" ? "Link copied" : "Copy link"}
            </button>
            <button type="button" aria-expanded={panel === "embed"} onClick={() => setPanel(panel ? null : "embed")}>
              Embed
            </button>
            <button type="button" onClick={save}>Save image</button>
          </span>
        )}
      </div>
      {panel === "embed" && (
        <div className="frame-embed">
          <label htmlFor={`${id}-embed`}>Paste this where you want the chart. It updates when the data does.</label>
          <textarea id={`${id}-embed`} readOnly rows={3} value={embed} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={() => copy(embed, "embed")}>
            {copied === "embed" ? "Embed code copied" : "Copy embed code"}
          </button>
        </div>
      )}
    </figure>
  );
}
