/**
 * Hero illustration, drawn like an engraving: a GPU whose pins run out into
 * the threads of Figure 1. Each thread is claret for the chip's working life,
 * then blue for the years the debt keeps running, ending at a bond certificate.
 * Horizontal scale is 7px per year, so the picture is roughly to scale.
 */
interface Props {
  life: number;
  longestYear: number;
  startYear: number;
}

const PX = 7;
const X0 = 214;

export default function HeroArt({ life, longestYear, startYear }: Props) {
  const lifeX = X0 + life * PX;
  // thread lengths in years, echoing the real distribution: a few short, most 10–40
  const threads = [5, 7, 10, 10, 20, 30, 40, 40];
  const pinY = (i: number) => 116 + i * 16;
  const yr = (y: number) => X0 + (y - startYear) * PX;
  return (
    <svg className="hero-art" viewBox="0 0 560 360" role="img"
      aria-label="Illustration: a GPU chip whose pins stretch into long lines ending at a bond certificate. The lines are claret for the chip's working life and blue for the decades of debt after it.">
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink)" strokeWidth=".6" opacity=".35" />
        </pattern>
        <pattern id="hatch-claret" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="var(--paper)" strokeWidth=".5" opacity=".35" />
        </pattern>
        <pattern id="guilloche" width="14" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 Q3.5 0 7 4 T14 4" fill="none" stroke="var(--blue)" strokeWidth=".45" opacity=".45" />
        </pattern>
      </defs>

      {/* bond certificate, slightly turned, with a print shadow */}
      <g transform="rotate(-5 470 105)">
        <rect x="392" y="44" width="152" height="112" fill="var(--rule)" transform="translate(4 4)" />
        <rect x="392" y="44" width="152" height="112" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.3" />
        <rect x="399" y="51" width="138" height="98" fill="url(#guilloche)" stroke="var(--blue)" strokeWidth=".8" />
        <rect x="404" y="56" width="128" height="88" fill="none" stroke="var(--blue)" strokeWidth=".5" strokeDasharray="2 2" />
        <text x="468" y="76" textAnchor="middle" style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 11, fill: "var(--ink)", letterSpacing: ".04em" }}>
          Senior Notes
        </text>
        <text x="468" y="90" textAnchor="middle" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 9, fill: "var(--ink-2)" }}>
          due {longestYear}
        </text>
        <path d="M418 104h56M418 112h44M418 120h50" stroke="var(--ink)" strokeWidth=".7" opacity=".5" />
        <circle cx="512" cy="122" r="13" fill="var(--blue)" />
        <circle cx="512" cy="122" r="9.5" fill="none" stroke="var(--paper)" strokeWidth=".7" />
        <path d="M505 133l-4 14 6-4 4 6 1-15M519 133l4 14-6-4-4 6" fill="var(--blue)" />
      </g>

      {/* ruler */}
      <g style={{ fontFamily: "var(--sans)", fontSize: 10.5, fill: "var(--muted)" }}>
        <line x1={X0} x2={yr(startYear + 44)} y1="300" y2="300" stroke="var(--rule)" />
        {[startYear, startYear + Math.round(life), startYear + 20, startYear + 40].map((y) => (
          <g key={y}>
            <line x1={yr(y)} x2={yr(y)} y1="296" y2="304" stroke="var(--muted)" />
            <text x={yr(y)} y="318" textAnchor="middle">{y}</text>
          </g>
        ))}
        <text x={yr(startYear + 44)} y="304" textAnchor="end" style={{ fill: "var(--blue)", fontWeight: 600 }}>→ {startYear + 100}</text>
      </g>
      <rect x={X0} y="104" width={lifeX - X0} height="190" fill="var(--claret)" opacity=".07" />

      {/* threads out of the chip's right-hand pins */}
      {threads.map((len, i) => {
        const y = pinY(i);
        const end = X0 + len * PX;
        return (
          <g key={i} strokeLinecap="round">
            <line x1="200" x2={X0} y1={y} y2={y} stroke="var(--ink)" strokeWidth="2.2" />
            <line x1={X0} x2={Math.min(end, lifeX)} y1={y} y2={y} stroke="var(--claret)" strokeWidth="2.4" />
            {end > lifeX && <line x1={lifeX} x2={end} y1={y} y2={y} stroke="var(--blue)" strokeWidth={i % 3 === 0 ? 2.6 : 1.6} />}
          </g>
        );
      })}
      {/* the longest thread climbs to the certificate */}
      <path d={`M${X0 + 40 * PX} ${pinY(7)} C ${X0 + 40 * PX + 30} ${pinY(7)}, 440 210, 446 150`}
        fill="none" stroke="var(--blue)" strokeWidth="1.6" strokeDasharray="3 3" />

      {/* GPU package */}
      <rect x="44" y="96" width="156" height="156" rx="6" fill="var(--rule)" transform="translate(4 4)" />
      <rect x="44" y="96" width="156" height="156" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="56" y="108" width="132" height="132" rx="3" fill="url(#hatch)" stroke="var(--ink)" strokeWidth=".8" />
      <rect x="80" y="132" width="84" height="84" rx="2" fill="var(--claret)" />
      <rect x="80" y="132" width="84" height="84" rx="2" fill="url(#hatch-claret)" />
      {Array.from({ length: 16 }, (_, k) => (
        <rect key={k} x={86 + (k % 4) * 19} y={138 + Math.floor(k / 4) * 19} width="15" height="15" rx="1"
          fill="none" stroke="var(--paper)" strokeWidth=".7" opacity=".85" />
      ))}
      {/* pins on the other three sides */}
      {Array.from({ length: 8 }, (_, k) => {
        const p = 112 + k * 18;
        return (
          <g key={k} stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
            <line x1={p} x2={p} y1="96" y2="84" />
            <line x1={p} x2={p} y1="252" y2="264" />
            <line x1="44" x2="32" y1={p - 4} y2={p - 4} />
          </g>
        );
      })}

      {/* captions */}
      <g style={{ fontFamily: "var(--sans)", fontSize: 12 }}>
        <text x="122" y="286" textAnchor="middle" style={{ fill: "var(--claret)", fontWeight: 600 }}>The chip</text>
        <text x="122" y="301" textAnchor="middle" style={{ fill: "var(--muted)" }}>written off in ~{Math.round(life)} years</text>
        <text x="420" y="262" textAnchor="middle" style={{ fill: "var(--blue)", fontWeight: 600 }}>The debt</text>
        <text x="420" y="277" textAnchor="middle" style={{ fill: "var(--muted)" }}>owed for up to {longestYear - startYear} years</text>
      </g>
    </svg>
  );
}
