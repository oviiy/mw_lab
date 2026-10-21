// The night market behind the stage: indigo sky, moon, rooftops with lit windows,
// strings of red lanterns, and drifting embers.

function Lantern({ x, y, s = 1, d = 0 }: { x: number; y: number; s?: number; d?: number }) {
  return (
    <g class="nm-lantern" style={{ transformOrigin: `${x}px ${y - 10}px`, animationDelay: `${d}s` }}>
      <circle cx={x} cy={y + 14 * s} r={46 * s} fill="url(#nm-glow)" />
      <path d={`M${x} ${y - 10} v8`} stroke="#2A1A10" stroke-width="1.5" />
      <rect x={x - 7 * s} y={y - 2} width={14 * s} height={4 * s} fill="#C99A3A" />
      <ellipse cx={x} cy={y + 14 * s} rx={14 * s} ry={17 * s} fill="url(#nm-lamp)" />
      <path d={`M${x - 13 * s} ${y + 14 * s} h${26 * s} M${x - 10 * s} ${y + 4 * s} h${20 * s} M${x - 10 * s} ${y + 24 * s} h${20 * s}`} stroke="rgba(120,20,10,0.55)" stroke-width="1" />
      <rect x={x - 7 * s} y={y + 30 * s} width={14 * s} height={4 * s} fill="#C99A3A" />
      <path d={`M${x} ${y + 34 * s} v${12 * s}`} stroke="#E0A040" stroke-width="2" />
    </g>
  );
}

function catenary(x0: number, y0: number, x1: number, y1: number, sag: number) {
  return `M${x0} ${y0} Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag} ${x1} ${y1}`;
}

function onCurve(x0: number, y0: number, x1: number, y1: number, sag: number, t: number) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag;
  const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
  const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
  return [x, y] as const;
}

export function NightMarket({ w, h }: { w: number; h: number }) {
  const strings: [number, number, number, number, number, number][] = [
    [-20, 40, w * 0.5, 20, 60, 6],
    [w * 0.5, 20, w + 20, 46, 60, 6],
    [-20, h * 0.42, w + 20, h * 0.38, 90, 11],
  ];
  const roofs = [];
  let x = -30;
  let k = 0;
  while (x < w + 40) {
    const rw = 120 + ((k * 53) % 90);
    const rh = 70 + ((k * 37) % 70);
    roofs.push({ x, w: rw, h: rh, k });
    x += rw - 10;
    k++;
  }
  return (
    <div class="night-market" aria-hidden="true">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="nm-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#070B1E" />
            <stop offset="0.55" stop-color="#16123A" />
            <stop offset="1" stop-color="#3A1528" />
          </linearGradient>
          <radialGradient id="nm-glow">
            <stop offset="0" stop-color="#FF7A3A" stop-opacity="0.45" />
            <stop offset="1" stop-color="#FF7A3A" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="nm-lamp" cx="40%" cy="35%">
            <stop offset="0" stop-color="#FFD58A" />
            <stop offset="0.5" stop-color="#F0442A" />
            <stop offset="1" stop-color="#8E1712" />
          </radialGradient>
          <radialGradient id="nm-moon">
            <stop offset="0" stop-color="#FFF6DA" />
            <stop offset="0.6" stop-color="#F4E2B0" />
            <stop offset="1" stop-color="#F4E2B0" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill="url(#nm-sky)" />
        {Array.from({ length: 70 }, (_, i) => (
          <circle cx={(i * 197) % w} cy={((i * 113) % (h * 0.5)) + 4} r={i % 7 === 0 ? 1.4 : 0.8} fill="#FFF6DA" opacity={0.25 + ((i * 37) % 50) / 100} class={i % 5 === 0 ? 'nm-twinkle' : ''} style={{ animationDelay: `${(i % 9) * 0.6}s` }} />
        ))}
        <circle cx={w * 0.86} cy={h * 0.12} r={70} fill="url(#nm-moon)" opacity="0.5" />
        <circle cx={w * 0.86} cy={h * 0.12} r={26} fill="#FFF3D2" opacity="0.9" />
        {/* distant rooftops */}
        <g fill="#0A0814">
          {roofs.map((r) => (
            <g>
              <path d={`M${r.x} ${h} L${r.x} ${h * 0.62 - r.h * 0.3} L${r.x - 14} ${h * 0.62 - r.h * 0.3} Q${r.x + r.w / 2} ${h * 0.62 - r.h - 10} ${r.x + r.w + 14} ${h * 0.62 - r.h * 0.3} L${r.x + r.w} ${h * 0.62 - r.h * 0.3} L${r.x + r.w} ${h} Z`} />
              {[0, 1, 2].map((j) =>
                (r.k + j) % 3 !== 0 ? (
                  <rect x={r.x + 16 + j * (r.w / 3.2)} y={h * 0.62 - r.h * 0.15 + (j % 2) * 18} width="10" height="14" fill="#F2A64A" opacity={0.35 + ((r.k * 7 + j) % 5) / 12} class="nm-window" />
                ) : null,
              )}
            </g>
          ))}
        </g>
        {strings.map(([x0, y0, x1, y1, sag, n]) => (
          <g>
            <path d={catenary(x0, y0, x1, y1, sag)} stroke="#1A0E0A" stroke-width="1.6" fill="none" />
            {Array.from({ length: n }, (_, i) => {
              const [lx, ly] = onCurve(x0, y0, x1, y1, sag, (i + 0.5) / n);
              return <Lantern x={lx} y={ly + 10} s={y0 > 100 ? 1 : 0.8} d={i * 0.37} />;
            })}
          </g>
        ))}
      </svg>
      <div class="embers">
        {Array.from({ length: 16 }, (_, i) => (
          <i style={{ left: `${(i * 61) % 100}%`, animationDelay: `${(i * 1.3) % 9}s`, animationDuration: `${9 + (i % 5) * 2}s` }} />
        ))}
      </div>
    </div>
  );
}
