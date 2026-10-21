// Small object illustrations for the 40 artifacts, drawn in gold, ivory, cinnabar and jade
// on lacquer. viewBox 0 0 64 64.
import type { JSX } from 'preact';

const Au = '#E8B84A';
const Iv = '#F3E6C8';
const Rd = '#D2382C';
const Jd = '#46A57A';
const Ik = '#1A0E08';
const Bl = '#5B86C2';
const s = { stroke: Ik, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;

const coin = (x: number, y: number, r: number, fill = Au) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={fill} {...s} />
    <rect x={x - r * 0.32} y={y - r * 0.32} width={r * 0.64} height={r * 0.64} fill={Ik} />
  </g>
);

const dieFace = (x: number, y: number, w: number, pips: [number, number][], red = false) => (
  <g>
    <rect x={x} y={y} width={w} height={w} rx={w * 0.2} fill={Iv} {...s} />
    {pips.map(([px, py]) => (
      <circle cx={x + px * w} cy={y + py * w} r={w * 0.1} fill={red ? Rd : Ik} />
    ))}
  </g>
);

export const ICONS: Record<string, () => JSX.Element> = {
  coin: () => coin(32, 32, 20),
  redcord: () => (
    <g>
      <path d="M14 10 C30 20 10 30 30 38 C48 44 36 56 52 58" fill="none" stroke={Rd} stroke-width="5" stroke-linecap="round" />
      <path d="M24 30 l8 -4 l2 8 l-8 4 z" fill={Rd} {...s} stroke-width="1.5" />
      <circle cx="14" cy="10" r="4" fill={Au} {...s} stroke-width="1.5" />
    </g>
  ),
  qimen: () => (
    <g>
      <path d="M32 6 L54 32 L32 58 L10 32 Z" fill="#2B2A44" {...s} />
      {[[32, 18], [24, 32], [40, 32], [32, 46], [32, 32]].map(([x, y]) => <circle cx={x} cy={y} r="3.4" fill={Au} />)}
    </g>
  ),
  shuangxi: () => (
    <g>
      <rect x="8" y="8" width="48" height="48" rx="6" fill={Rd} {...s} />
      <text x="32" y="44" text-anchor="middle" font-size="34" fill={Au} font-family="'Ma Shan Zheng', serif">囍</text>
    </g>
  ),
  fish: () => (
    <g>
      <circle cx="32" cy="32" r="24" fill={Jd} {...s} />
      <path d="M20 22 q12 -8 20 4 q-4 8 -16 6 l-6 4 z" fill={Iv} {...s} stroke-width="1.5" />
      <path d="M44 42 q-12 8 -20 -4 q4 -8 16 -6 l6 -4 z" fill={Iv} {...s} stroke-width="1.5" />
      <circle cx="34" cy="25" r="1.6" fill={Ik} />
      <circle cx="30" cy="39" r="1.6" fill={Ik} />
    </g>
  ),
  ladder: () => (
    <g>
      <path d="M18 6 L22 58 M42 6 L46 58" stroke="#8B6B3A" stroke-width="5" stroke-linecap="round" />
      {[14, 26, 38, 50].map((y) => <path d={`M19 ${y} L44 ${y}`} stroke="#B89155" stroke-width="4" />)}
    </g>
  ),
  tiger: () => (
    <g>
      <path d="M10 40 C8 24 22 14 36 16 C50 18 56 28 54 38 L48 48 L14 48 Z" fill={Au} {...s} />
      <path d="M20 26 l6 6 M30 22 l2 8 M40 24 l-2 8" stroke={Ik} stroke-width="2.4" />
      <circle cx="46" cy="30" r="2" fill={Ik} />
      <path d="M32 16 v32" stroke={Ik} stroke-width="1.4" stroke-dasharray="3 3" />
    </g>
  ),
  weight: () => (
    <g>
      <path d="M32 6 v8" stroke={Ik} stroke-width="3" />
      <circle cx="32" cy="10" r="4" fill="none" stroke={Ik} stroke-width="2" />
      <path d="M20 22 L44 22 L52 56 L12 56 Z" fill="#4A4A52" {...s} />
      <path d="M24 30 h16" stroke={Au} stroke-width="2" />
    </g>
  ),
  smallscale: () => (
    <g>
      <path d="M8 18 L56 18" stroke="#8B6B3A" stroke-width="4" stroke-linecap="round" />
      <path d="M32 10 V18" stroke={Ik} stroke-width="2" />
      <path d="M14 18 L8 38 M14 18 L20 38" stroke={Ik} stroke-width="1.4" />
      <path d="M4 38 q10 8 20 0 z" fill={Au} {...s} />
      <circle cx="48" cy="34" r="8" fill="#4A4A52" {...s} />
      <path d="M48 18 v8" stroke={Ik} stroke-width="1.4" />
    </g>
  ),
  bowl: () => (
    <g>
      <path d="M8 28 L56 28 C54 46 44 54 32 54 C20 54 10 46 8 28 Z" fill={Iv} {...s} />
      <path d="M12 34 h40" stroke={Bl} stroke-width="3" />
      <path d="M22 54 h20 v4 h-20 z" fill={Iv} {...s} />
      <path d="M16 40 q4 -4 8 0 q4 4 8 0 q4 -4 8 0 q4 4 8 0" fill="none" stroke={Bl} stroke-width="1.6" />
    </g>
  ),
  gourd: () => (
    <g>
      <circle cx="32" cy="20" r="10" fill={Au} {...s} />
      <circle cx="32" cy="42" r="15" fill={Au} {...s} />
      <path d="M32 6 v6" stroke="#5A3A22" stroke-width="4" />
      <path d="M24 30 q8 4 16 0" stroke={Rd} stroke-width="4" fill="none" />
      <path d="M38 30 l6 12" stroke={Rd} stroke-width="3" />
    </g>
  ),
  purse: () => (
    <g>
      <path d="M18 22 C10 34 10 54 32 56 C54 54 54 34 46 22 Z" fill={Rd} {...s} />
      <path d="M20 22 L44 22 L40 14 L24 14 Z" fill={Rd} {...s} />
      <path d="M22 22 q10 4 20 0" stroke={Au} stroke-width="3" fill="none" />
      {coin(32, 40, 8)}
    </g>
  ),
  lantern: () => (
    <g>
      <path d="M32 2 v6" stroke={Ik} stroke-width="2" />
      <rect x="24" y="8" width="16" height="5" fill={Au} {...s} stroke-width="1.5" />
      <ellipse cx="32" cy="32" rx="18" ry="20" fill={Rd} {...s} />
      <path d="M14 32 h36 M17 22 h30 M17 42 h30" stroke="#8E1712" stroke-width="1.4" />
      <ellipse cx="32" cy="32" rx="6" ry="20" fill="none" stroke="#8E1712" stroke-width="1.4" />
      <rect x="24" y="51" width="16" height="5" fill={Au} {...s} stroke-width="1.5" />
      <path d="M32 56 v6" stroke={Au} stroke-width="3" />
    </g>
  ),
  fan: () => (
    <g>
      <path d="M32 54 L4 22 A40 40 0 0 1 60 22 Z" fill={Iv} {...s} />
      {[10, 18, 26, 32, 38, 46, 54].map((x) => <path d={`M32 54 L${x} ${x < 32 ? 22 - (32 - x) * 0.2 : 22 - (x - 32) * 0.2}`} stroke="#8B6B3A" stroke-width="1.4" />)}
      <path d="M14 30 q8 -8 18 -2 q8 -10 18 0" stroke={Rd} stroke-width="2.4" fill="none" />
    </g>
  ),
  compass: () => (
    <g>
      <rect x="6" y="6" width="52" height="52" rx="4" fill="#8B6B3A" {...s} />
      <circle cx="32" cy="32" r="20" fill={Au} {...s} />
      <circle cx="32" cy="32" r="13" fill="none" stroke={Ik} stroke-width="1.2" />
      <path d="M32 18 L36 32 L32 46 L28 32 Z" fill={Rd} {...s} stroke-width="1.2" />
      <circle cx="32" cy="32" r="2.4" fill={Ik} />
    </g>
  ),
  rings: () => (
    <g fill="none" stroke={Au} stroke-width="3.6">
      {[0, 1, 2, 3, 4].map((k) => <circle cx={14 + k * 9} cy={26 + (k % 2) * 6} r="8" />)}
      <path d="M10 46 L54 46" stroke="#8B6B3A" stroke-width="4" stroke-linecap="round" />
    </g>
  ),
  yinyang: () => (
    <g>
      <circle cx="32" cy="32" r="24" fill={Iv} {...s} />
      <path d="M32 8 a24 24 0 0 1 0 48 a12 12 0 0 1 0 -24 a12 12 0 0 0 0 -24 z" fill={Ik} />
      <circle cx="32" cy="20" r="4" fill={Ik} />
      <circle cx="32" cy="44" r="4" fill={Iv} />
    </g>
  ),
  abacus: () => (
    <g>
      <rect x="6" y="10" width="52" height="44" rx="3" fill="none" stroke="#8B6B3A" stroke-width="4" />
      <path d="M6 24 H58" stroke="#8B6B3A" stroke-width="3" />
      {[14, 24, 34, 44, 52].map((x, k) => (
        <g>
          <path d={`M${x} 10 V54`} stroke={Ik} stroke-width="1.2" />
          <ellipse cx={x} cy={k % 2 ? 18 : 15} rx="4" ry="3" fill={Rd} {...s} stroke-width="1" />
          <ellipse cx={x} cy={30 + (k % 3) * 2} rx="4" ry="3" fill={Ik} />
          <ellipse cx={x} cy={38 + (k % 3) * 2} rx="4" ry="3" fill={Ik} />
        </g>
      ))}
    </g>
  ),
  zoetrope: () => (
    <g>
      <path d="M14 14 h36 l6 10 h-48 z" fill={Rd} {...s} />
      <rect x="12" y="24" width="40" height="26" fill={Au} {...s} />
      {[18, 30, 42].map((x) => <path d={`M${x} 46 l3 -10 l3 4 l3 -8`} stroke={Ik} stroke-width="1.8" fill="none" />)}
      <path d="M14 50 h36 l-4 8 h-28 z" fill={Rd} {...s} />
    </g>
  ),
  whetstone: () => (
    <g>
      <path d="M6 44 L48 32 L58 40 L16 52 Z" fill="#6E7F86" {...s} />
      <path d="M20 10 L44 34" stroke="#C9D2D8" stroke-width="6" stroke-linecap="round" />
      <path d="M14 4 L22 12" stroke="#5A3A22" stroke-width="7" stroke-linecap="round" />
      <path d="M38 22 l4 -4 M44 28 l4 -4" stroke={Au} stroke-width="2" />
    </g>
  ),
  treasure: () => (
    <g>
      <path d="M8 34 C8 52 56 52 56 34 Z" fill={Au} {...s} />
      <ellipse cx="32" cy="34" rx="24" ry="6" fill="#B88A3C" {...s} />
      {coin(22, 28, 7)}
      {coin(36, 24, 7)}
      <path d="M44 30 l6 -10 l4 10 z" fill={Jd} {...s} stroke-width="1.4" />
    </g>
  ),
  ledger: () => (
    <g>
      <rect x="12" y="6" width="40" height="52" rx="2" fill={Iv} {...s} />
      <rect x="12" y="6" width="8" height="52" fill="#2E5C9A" {...s} />
      {[16, 24, 32, 40, 48].map((y) => <path d={`M26 ${y} h20`} stroke={Ik} stroke-width="1.6" />)}
      <circle cx="44" cy="48" r="5" fill={Rd} />
    </g>
  ),
  twinlamp: () => (
    <g>
      {[20, 44].map((x) => (
        <g>
          <path d={`M${x} 6 q-6 8 0 14 q6 -6 0 -14`} fill="#FFB347" {...s} stroke-width="1.2" />
          <rect x={x - 8} y="22" width="16" height="28" fill={Rd} {...s} />
          <path d={`M${x - 10} 52 h20`} stroke={Au} stroke-width="4" />
        </g>
      ))}
    </g>
  ),
  drum: () => (
    <g>
      <ellipse cx="32" cy="20" rx="22" ry="8" fill={Iv} {...s} />
      <path d="M10 20 V44 C10 52 54 52 54 44 V20" fill={Rd} {...s} />
      <ellipse cx="32" cy="20" rx="22" ry="8" fill={Iv} {...s} />
      {[14, 24, 40, 50].map((x) => <circle cx={x} cy="30" r="1.8" fill={Au} />)}
      <path d="M44 4 L30 18 M56 8 L38 20" stroke="#5A3A22" stroke-width="3" stroke-linecap="round" />
    </g>
  ),
  puppet: () => (
    <g>
      <circle cx="30" cy="14" r="7" fill="none" {...s} />
      <path d="M22 22 L40 22 L44 46 L18 46 Z" fill={Rd} {...s} opacity="0.85" />
      <path d="M22 26 L10 38 M40 26 L50 16" stroke={Ik} stroke-width="3" stroke-linecap="round" />
      <path d="M10 38 L14 62 M50 16 L44 62 M31 22 V62" stroke="#5A3A22" stroke-width="1.4" />
      <path d="M26 30 h8 M24 36 h12" stroke={Au} stroke-width="1.6" />
    </g>
  ),
  cat: () => (
    <g>
      <path d="M14 24 L18 8 L26 18 L38 18 L46 8 L50 24 C54 44 48 56 32 56 C16 56 10 44 14 24 Z" fill={Iv} {...s} />
      <path d="M22 30 q3 -3 6 0 M36 30 q3 -3 6 0" stroke={Ik} stroke-width="2" fill="none" />
      <path d="M30 36 l2 2 l2 -2" stroke={Rd} stroke-width="2" fill="none" />
      <path d="M50 20 L58 6" stroke={Iv} stroke-width="6" stroke-linecap="round" />
      <path d="M50 20 L58 6" stroke={Ik} stroke-width="1" />
      {coin(32, 48, 6)}
    </g>
  ),
  ironabacus: () => (
    <g>
      <rect x="6" y="14" width="52" height="36" rx="3" fill="#3C3F46" {...s} />
      {[16, 26, 36, 46].map((x, k) => (
        <g>
          <path d={`M${x} 14 V50`} stroke="#9AA2AA" stroke-width="1.4" />
          {[0, 1, 2].map((j) => <rect x={x - 4} y={20 + j * 9 + (k % 2) * 3} width="8" height="6" rx="2" fill="#9AA2AA" />)}
        </g>
      ))}
    </g>
  ),
  astrolabe: () => (
    <g>
      <circle cx="32" cy="32" r="24" fill="#1F2A44" {...s} />
      <circle cx="32" cy="32" r="16" fill="none" stroke={Au} stroke-width="1.6" />
      {[[22, 20], [30, 16], [38, 20], [44, 28], [40, 38], [46, 46], [52, 42]].map(([x, y]) => <circle cx={x} cy={y} r="2.4" fill={Au} />)}
      <path d="M22 20 L30 16 L38 20 L44 28 L40 38 L46 46 L52 42" stroke={Au} stroke-width="1" fill="none" />
    </g>
  ),
  sixes: () => (
    <g>
      {dieFace(6, 14, 26, [[0.27, 0.27], [0.73, 0.27], [0.27, 0.5], [0.73, 0.5], [0.27, 0.73], [0.73, 0.73]])}
      {dieFace(32, 22, 26, [[0.27, 0.27], [0.73, 0.27], [0.27, 0.5], [0.73, 0.5], [0.27, 0.73], [0.73, 0.73]])}
    </g>
  ),
  yaoji: () => (
    <g>
      <path d="M18 50 C10 36 18 18 34 18 L40 10 L42 20 C52 26 52 44 40 50 Z" fill={Au} {...s} />
      <path d="M40 10 l6 -4 l-2 8" fill={Rd} {...s} stroke-width="1.4" />
      <circle cx="40" cy="24" r="2" fill={Ik} />
      <path d="M48 26 l8 2 l-8 3" fill={Rd} />
      {dieFace(20, 34, 18, [[0.5, 0.5]], true)}
    </g>
  ),
  diecup: () => (
    <g>
      <path d="M14 14 L50 14 L46 54 C46 58 18 58 18 54 Z" fill="#8B5A2B" {...s} />
      <ellipse cx="32" cy="14" rx="18" ry="5" fill="#5A3A22" {...s} />
      <path d="M18 30 h28 M18 42 h28" stroke={Au} stroke-width="2" />
      {dieFace(36, 4, 14, [[0.5, 0.5]], true)}
    </g>
  ),
  spearback: () => (
    <g>
      <path d="M8 52 C24 44 40 30 48 12" stroke="#5A3A22" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M48 12 L58 4 L54 18 Z" fill="#C9D2D8" {...s} stroke-width="1.4" />
      <path d="M44 22 q-8 2 -10 10" stroke={Rd} stroke-width="4" fill="none" />
      <path d="M14 40 a10 10 0 1 1 10 10" stroke={Au} stroke-width="2.4" fill="none" />
      <path d="M24 50 l4 -6 l-7 -1" stroke={Au} stroke-width="2.4" fill="none" />
    </g>
  ),
  rattle: () => (
    <g>
      <path d="M32 42 V62" stroke="#8B5A2B" stroke-width="5" stroke-linecap="round" />
      <circle cx="32" cy="26" r="16" fill={Rd} {...s} />
      <circle cx="32" cy="26" r="10" fill={Au} {...s} stroke-width="1.4" />
      <path d="M16 26 L6 20 M48 26 L58 20" stroke={Ik} stroke-width="1.6" />
      <circle cx="5" cy="19" r="3.5" fill={Iv} {...s} stroke-width="1.2" />
      <circle cx="59" cy="19" r="3.5" fill={Iv} {...s} stroke-width="1.2" />
    </g>
  ),
  paperweight: () => (
    <g>
      <rect x="6" y="38" width="52" height="16" rx="3" fill={Iv} {...s} />
      <path d="M12 44 h40" stroke={Ik} stroke-width="1" opacity="0.4" />
      <rect x="14" y="24" width="36" height="14" rx="4" fill={Jd} {...s} />
      <path d="M22 24 q10 -14 20 0" fill={Jd} {...s} />
      <circle cx="32" cy="18" r="2.4" fill={Au} />
    </g>
  ),
  allin: () => (
    <g>
      {coin(20, 40, 10)}
      {coin(32, 32, 10)}
      {coin(44, 24, 10)}
      <path d="M50 46 l8 8 M58 46 l-8 8" stroke={Rd} stroke-width="3" stroke-linecap="round" />
    </g>
  ),
  lion: () => (
    <g>
      <circle cx="32" cy="32" r="24" fill={Rd} {...s} />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return <circle cx={32 + Math.cos(a) * 22} cy={32 + Math.sin(a) * 22} r="5" fill={Au} />;
      })}
      <circle cx="32" cy="32" r="15" fill={Au} {...s} stroke-width="1.6" />
      <circle cx="26" cy="28" r="3" fill={Ik} />
      <circle cx="38" cy="28" r="3" fill={Ik} />
      <path d="M24 38 q8 6 16 0" stroke={Rd} stroke-width="3" fill="none" />
    </g>
  ),
  chest: () => (
    <g>
      <rect x="8" y="24" width="48" height="30" rx="3" fill="#7A3A1C" {...s} />
      <path d="M8 24 C8 10 56 10 56 24 Z" fill="#8E4A24" {...s} />
      <path d="M8 34 h48" stroke={Au} stroke-width="3" />
      <rect x="27" y="30" width="10" height="12" rx="2" fill={Au} {...s} stroke-width="1.4" />
      <circle cx="32" cy="35" r="1.8" fill={Ik} />
    </g>
  ),
  luoshu: () => (
    <g>
      <path d="M8 34 C8 16 56 16 56 34 C56 52 8 52 8 34 Z" fill="#3E7A5A" {...s} />
      <path d="M8 34 h-4 M56 34 h4 M24 50 l-4 8 M40 50 l4 8 M32 18 v-8" stroke="#3E7A5A" stroke-width="5" stroke-linecap="round" />
      {[[24, 28], [32, 28], [40, 28], [24, 36], [32, 36], [40, 36], [28, 44], [36, 44], [32, 22]].map(([x, y], k) => (
        <circle cx={x} cy={y} r="2.4" fill={k % 2 ? Iv : Ik} />
      ))}
    </g>
  ),
  rubbing: () => (
    <g>
      <rect x="6" y="8" width="30" height="40" fill={Iv} {...s} />
      <rect x="28" y="16" width="30" height="40" fill={Iv} {...s} />
      <path d="M12 16 h18 M12 24 h18 M12 32 h12" stroke={Ik} stroke-width="2" />
      <path d="M34 24 h18 M34 32 h18 M34 40 h12" stroke={Ik} stroke-width="2" opacity="0.45" />
    </g>
  ),
  seal: () => (
    <g>
      <rect x="20" y="6" width="24" height="26" rx="4" fill={Jd} {...s} />
      <path d="M26 6 q6 -6 12 0" fill={Jd} {...s} />
      <rect x="14" y="34" width="36" height="24" rx="3" fill={Rd} {...s} />
      <text x="32" y="52" text-anchor="middle" font-size="16" fill={Iv} font-family="'Ma Shan Zheng', serif">印</text>
    </g>
  ),
  guanyin: () => (
    <g>
      {Array.from({ length: 10 }, (_, k) => {
        const a = Math.PI + (k / 9) * Math.PI;
        return <path d={`M32 34 L${32 + Math.cos(a) * 26} ${34 + Math.sin(a) * 26}`} stroke={Au} stroke-width="3" stroke-linecap="round" />;
      })}
      <circle cx="32" cy="34" r="22" fill="none" stroke={Au} stroke-width="1.4" opacity="0.6" />
      <circle cx="32" cy="22" r="7" fill={Iv} {...s} />
      <path d="M22 58 C22 40 42 40 42 58 Z" fill={Iv} {...s} />
    </g>
  ),
  onesix: () => (
    <g>
      {dieFace(4, 18, 24, [[0.5, 0.5]], true)}
      <path d="M30 30 h6 l-3 -4 m3 4 l-3 4" stroke={Au} stroke-width="2.4" fill="none" />
      {dieFace(36, 18, 24, [[0.27, 0.27], [0.73, 0.27], [0.27, 0.5], [0.73, 0.5], [0.27, 0.73], [0.73, 0.73]])}
    </g>
  ),
  brush: () => (
    <g>
      <path d="M50 6 L20 44" stroke={Rd} stroke-width="6" stroke-linecap="round" />
      <path d="M20 44 C12 50 10 58 6 60 C14 60 22 56 24 48 Z" fill={Ik} />
      <path d="M48 8 L52 4" stroke={Au} stroke-width="6" stroke-linecap="round" />
    </g>
  ),
  idol: () => (
    <g>
      <path d="M18 58 L46 58 L42 40 L22 40 Z" fill="#8B6B3A" {...s} />
      <circle cx="32" cy="22" r="14" fill={Au} {...s} />
      <path d="M22 18 q4 -4 8 0 M34 18 q4 -4 8 0" stroke={Ik} stroke-width="2" fill="none" />
      <path d="M26 28 q6 5 12 0" stroke={Ik} stroke-width="2" fill="none" />
      <circle cx="32" cy="8" r="3" fill={Rd} />
      {dieFace(24, 42, 16, [[0.5, 0.5]], true)}
    </g>
  ),
  qiankun: () => (
    <g>
      <path d="M14 26 C6 40 10 58 32 58 C54 58 58 40 50 26 Z" fill="#6A3F86" {...s} />
      <path d="M20 26 L44 26 L38 16 L26 16 Z" fill="#6A3F86" {...s} />
      <path d="M22 24 q10 6 20 0" stroke={Au} stroke-width="3" fill="none" />
      <circle cx="32" cy="42" r="8" fill="none" stroke={Au} stroke-width="2" />
      <path d="M32 34 a4 4 0 0 1 0 8 a4 4 0 0 0 0 8" fill="none" stroke={Au} stroke-width="1.6" />
    </g>
  ),
  forge: () => (
    <g>
      <path d="M12 56 L18 22 L46 22 L52 56 Z" fill="#4A3A32" {...s} />
      <path d="M18 22 L22 10 L42 10 L46 22" fill="#5A4A42" {...s} />
      <path d="M24 46 q8 -16 16 0 q-8 6 -16 0" fill="#FF8A3A" />
      <path d="M28 46 q4 -8 8 0" fill="#FFE07A" />
    </g>
  ),
  inkstone: () => (
    <g>
      <rect x="8" y="16" width="48" height="38" rx="6" fill="#2B2A30" {...s} />
      <ellipse cx="30" cy="38" rx="14" ry="9" fill="#0E0D12" />
      <path d="M40 22 q8 2 10 10" stroke={Au} stroke-width="1.4" fill="none" />
      <rect x="40" y="4" width="8" height="22" rx="2" fill={Ik} transform="rotate(20 44 15)" />
    </g>
  ),
  sword: () => (
    <g>
      <path d="M50 6 L18 46" stroke="#C9D2D8" stroke-width="6" stroke-linecap="round" />
      {[[44, 14], [40, 19], [36, 24], [32, 29], [28, 34], [24, 39], [21, 43]].map(([x, y]) => <circle cx={x} cy={y} r="1.6" fill={Au} />)}
      <path d="M12 40 L26 52" stroke={Au} stroke-width="5" stroke-linecap="round" />
      <path d="M18 46 L8 58" stroke={Rd} stroke-width="5" stroke-linecap="round" />
    </g>
  ),
};

export function ArtifactIcon({ id, size = 56 }: { id: string; size?: number }) {
  const f = ICONS[id];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      {f ? f() : <circle cx="32" cy="32" r="20" fill={Au} />}
    </svg>
  );
}
