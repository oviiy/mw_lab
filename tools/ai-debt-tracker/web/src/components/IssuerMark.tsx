/**
 * Company logos, used only to identify issuers (nominative use).
 * Sources and trademark notice: src/assets/logos/SOURCES.md. The logos are shown
 * in their original colours; the issuer palette is still used for the data.
 * They are inlined as SVG markup so they survive "Save image" PNG export.
 */
import alphabet from "../assets/logos/alphabet.svg?raw";
import amazon from "../assets/logos/amazon.svg?raw";
import coreweave from "../assets/logos/coreweave.svg?raw";
import meta from "../assets/logos/meta.svg?raw";
import microsoft from "../assets/logos/microsoft.svg?raw";
import oracle from "../assets/logos/oracle.svg?raw";

const LOGOS: Record<string, string> = { meta, alphabet, amazon, oracle, microsoft, coreweave };

/** Force the root <svg> to fill its box; keep everything else exactly as published. */
function sized(svg: string): string {
  return svg.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    const clean = attrs.replace(/\s(width|height)=("[^"]*"|'[^']*')/g, "");
    return `<svg${clean} width="100%" height="100%">`;
  });
}

const SIZED: Record<string, string> = Object.fromEntries(Object.entries(LOGOS).map(([k, v]) => [k, sized(v)]));

interface Props {
  id: string;
  /** kept for API compatibility; logos use their own colours */
  color?: string;
  size?: number;
  name?: string;
}

export default function IssuerMark({ id, size = 22, name }: Props) {
  const svg = SIZED[id];
  if (!svg) return null;
  return (
    <span
      className="issuer-mark"
      role={name ? "img" : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
      style={{ display: "inline-block", width: size, height: size, flex: "none", verticalAlign: "middle", lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Same logo inside a chart SVG. (cx, cy) is the centre. */
export function IssuerMarkG({ id, cx, cy, size = 18 }: { id: string; color?: string; cx: number; cy: number; size?: number }) {
  const svg = SIZED[id];
  if (!svg) return null;
  return (
    <svg x={cx - size / 2} y={cy - size / 2} width={size} height={size} overflow="visible" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
