// Parametric Chinese shadow puppets (皮影). Profile heads facing left, translucent dyed
// leather with cut-out patterns that let the lamp through, jointed arms, and control rods.
import type { JSX } from 'preact';

export type FaceStyle = 'hollow' | 'red' | 'black' | 'white' | 'gold' | 'blue' | 'green' | 'mask';
export type Headgear = 'scholar' | 'official' | 'helmet' | 'crown' | 'bun' | 'straw' | 'band' | 'horns' | 'tall' | 'tufts' | 'stars' | 'cap';
export type Beard = 'none' | 'long' | 'full' | 'red';
export type Garb = 'robe' | 'armor' | 'short' | 'dress';
export type Pattern = 'cloud' | 'scale' | 'flower' | 'coin' | 'wave' | 'stars';
export type Prop = 'fan' | 'sword' | 'spear' | 'mace' | 'staff' | 'feather' | 'brush' | 'rod' | 'blade' | 'whip' | 'ring' | 'chisel' | 'kerchief' | 'none';

export interface PuppetSpec {
  face: FaceStyle;
  head: Headgear;
  beard: Beard;
  garb: Garb;
  pattern: Pattern;
  robe: string;
  trim: string;
  prop: Prop;
  /** Warriors wear back flags (靠旗). */
  flags?: boolean;
  /** Paint detail on the face. */
  paint?: 'crescent' | 'butterfly' | 'heart' | 'eyes' | 'none';
  scale?: number;
}

const INK = '#2B140A';
const LIGHT = '#FFE7B5';
const SKIN = '#F2C9A0';

const FACE_FILL: Record<FaceStyle, string> = {
  hollow: 'none',
  red: '#C62F25',
  black: '#2A1C18',
  white: '#F4EBDD',
  gold: '#D9A12B',
  blue: '#2E5C9A',
  green: '#3E8A55',
  mask: '#1E1714',
};

const stroke = { stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;

// ---------- patterns: lamp-light cut-outs ----------

function Cutouts({ pattern, box }: { pattern: Pattern; box: [number, number, number, number] }) {
  const [x0, y0, w, h] = box;
  const out: JSX.Element[] = [];
  const cols = 4;
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + (c + 0.5 + (r % 2) * 0.5) * (w / cols);
      const y = y0 + (r + 0.5) * (h / rows);
      if (x > x0 + w) continue;
      switch (pattern) {
        case 'cloud':
          out.push(<path d={`M${x - 6} ${y} a4 4 0 1 1 6 -3 a4 4 0 1 1 6 3 a3 3 0 0 1 -12 0 z`} />);
          break;
        case 'scale':
          out.push(<path d={`M${x - 7} ${y - 2} a7 7 0 0 0 14 0 l-2 0 a5 5 0 0 1 -10 0 z`} />);
          break;
        case 'flower':
          for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2;
            out.push(<ellipse cx={x + Math.cos(a) * 3.5} cy={y + Math.sin(a) * 3.5} rx="2.2" ry="2.2" />);
          }
          break;
        case 'coin':
          out.push(<path d={`M${x} ${y - 5} a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 z M${x - 1.8} ${y - 1.8} h3.6 v3.6 h-3.6 z`} fill-rule="evenodd" />);
          break;
        case 'wave':
          out.push(<path d={`M${x - 8} ${y} q4 -5 8 0 q4 5 8 0 l0 2 q-4 5 -8 0 q-4 -5 -8 0 z`} />);
          break;
        case 'stars':
          out.push(<path d={`M${x} ${y - 5} l1.5 3.4 3.6 .3 -2.8 2.4 .9 3.6 -3.2 -2 -3.2 2 .9 -3.6 -2.8 -2.4 3.6 -.3 z`} />);
          break;
      }
    }
  }
  return (
    <g fill={LIGHT} opacity="0.82" style={{ mixBlendMode: 'screen' }}>
      {out}
    </g>
  );
}

// ---------- head ----------

const HEAD_PATH = 'M14 -27 C-4 -31 -20 -21 -22 -7 L-29 2 L-22 6 L-25 12 L-20 16 C-16 26 -2 30 10 26 C22 20 26 6 25 -8 C23 -20 20 -25 14 -27 Z';

function Head({ s }: { s: PuppetSpec }) {
  const fill = FACE_FILL[s.face];
  const hollow = s.face === 'hollow';
  return (
    <g>
      {/* hair / back of head */}
      <path d="M14 -27 C26 -24 30 -8 26 6 C24 14 18 20 12 24 L8 4 Z" fill="#2A1A14" opacity="0.92" />
      <path d={HEAD_PATH} fill={hollow ? 'rgba(255,231,181,0.15)' : fill} {...stroke} stroke-width={hollow ? 2.8 : 2.2} opacity={hollow ? 1 : 0.92} />
      {s.paint === 'crescent' && <path d="M-12 -20 a6 6 0 1 0 8 0 a4.5 4.5 0 1 1 -8 0 z" fill="#F4EBDD" />}
      {s.paint === 'butterfly' && <path d="M-18 -10 q8 -10 16 0 q-8 6 -16 0 z M-14 4 q6 6 14 2 l-4 6 q-8 0 -10 -8 z" fill="#F4EBDD" />}
      {s.paint === 'heart' && <path d="M-16 -6 q-4 -10 6 -10 q8 0 6 10 q-3 8 -6 10 q-4 -2 -6 -10 z" fill="#C62F25" opacity="0.9" />}
      {s.paint === 'eyes' && <path d="M-20 -8 q10 -6 20 0 M-18 -2 l14 0" stroke="#2A1C18" stroke-width="2.4" fill="none" />}
      {/* eye: a long almond slit, the signature of shadow puppets */}
      <path d="M-18 -5 q7 -5 14 -1 q-7 3 -14 1 z" fill={hollow ? INK : LIGHT} opacity={hollow ? 0.85 : 0.95} />
      <path d="M-20 -11 q9 -6 18 -2" fill="none" stroke={INK} stroke-width="2" />
      {hollow && <path d="M-24 10 q3 2 6 0" stroke="#C62F25" stroke-width="2.4" fill="none" />}
      {s.face === 'mask' && <path d="M-22 -14 L18 -14 M-24 -2 L16 -2 M-22 10 L14 10" stroke="#D9A12B" stroke-width="2" />}
      <Beard kind={s.beard} />
      <Gear kind={s.head} s={s} />
    </g>
  );
}

function Beard({ kind }: { kind: Beard }) {
  if (kind === 'none') return null;
  const col = kind === 'red' ? '#A8251C' : '#1E1410';
  if (kind === 'full')
    return <path d="M-22 10 C-30 40 -14 62 6 64 C2 50 14 40 12 22 C2 26 -14 22 -22 10 Z" fill={col} {...stroke} stroke-width="1.6" opacity="0.95" />;
  return (
    <g fill="none" stroke={col} stroke-width="4" stroke-linecap="round">
      <path d="M-20 14 C-24 40 -18 70 -14 92" />
      <path d="M-12 18 C-14 44 -8 72 -6 96" />
      <path d="M-4 20 C-2 46 2 70 4 90" />
    </g>
  );
}

function Gear({ kind, s }: { kind: Headgear; s: PuppetSpec }) {
  const t = s.trim;
  switch (kind) {
    case 'scholar':
      return (
        <g>
          <path d="M-20 -22 C-14 -42 18 -44 26 -24 L22 -16 C10 -26 -6 -26 -18 -16 Z" fill="#1F2A3A" {...stroke} />
          <path d="M24 -22 C40 -18 52 -6 56 8 M22 -18 C36 -10 44 4 44 18" stroke="#1F2A3A" stroke-width="5" fill="none" stroke-linecap="round" />
        </g>
      );
    case 'official':
      return (
        <g>
          <path d="M-18 -20 C-16 -44 22 -46 24 -22 Z" fill="#1A1412" {...stroke} />
          <path d="M-8 -40 C0 -52 16 -50 18 -38 Z" fill="#1A1412" {...stroke} />
          <path d="M22 -30 L64 -38" stroke="#1A1412" stroke-width="3.5" />
          <path d="M-16 -30 L-58 -38" stroke="#1A1412" stroke-width="3.5" />
          <ellipse cx="68" cy="-39" rx="9" ry="5" fill="#1A1412" />
          <ellipse cx="-62" cy="-39" rx="9" ry="5" fill="#1A1412" />
          <circle cx="2" cy="-30" r="3" fill={t} />
        </g>
      );
    case 'helmet':
      return (
        <g>
          <path d="M-22 -18 C-22 -46 24 -50 28 -18 L22 -12 C8 -20 -8 -20 -18 -12 Z" fill={t} {...stroke} />
          <circle cx="2" cy="-46" r="7" fill="#C62F25" {...stroke} stroke-width="1.6" />
          <circle cx="-16" cy="-34" r="4" fill="#C62F25" />
          <circle cx="20" cy="-34" r="4" fill="#C62F25" />
          {/* pheasant tail feathers */}
          <path d="M6 -48 C40 -110 110 -120 150 -80" stroke="#3A2416" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M0 -48 C20 -120 90 -150 140 -122" stroke="#3A2416" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M6 -48 C40 -110 110 -120 150 -80" stroke={LIGHT} stroke-width="1.4" fill="none" stroke-dasharray="3 6" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M-24 -18 L-20 -44 L-8 -32 L2 -50 L12 -32 L24 -44 L28 -18 Z" fill={t} {...stroke} />
          <circle cx="2" cy="-50" r="4" fill="#C62F25" />
          <path d="M-22 -18 q-6 14 -2 26 M-18 -16 q-4 14 0 22" stroke={t} stroke-width="2" fill="none" />
          {[-20, -12, -4, 4, 12, 20].map((x) => (
            <circle cx={x} cy={-12 + Math.abs(x) * 0.15} r="1.8" fill="#C62F25" />
          ))}
          <path d="M8 -48 C40 -100 100 -110 140 -76" stroke="#3A2416" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
      );
    case 'bun':
      return (
        <g>
          <path d="M-20 -18 C-18 -36 20 -40 26 -16 C30 -2 26 8 20 14 Z" fill="#1E1410" {...stroke} />
          <circle cx="18" cy="-30" r="12" fill="#1E1410" {...stroke} />
          <path d="M8 -38 L36 -48 M6 -32 L40 -36" stroke={t} stroke-width="2.4" />
          <circle cx="-6" cy="-30" r="5" fill="#C62F25" />
          <circle cx="-14" cy="-24" r="3" fill={t} />
        </g>
      );
    case 'straw':
      return (
        <g>
          <path d="M-46 -14 L4 -46 L50 -12 Z" fill="#B88A3C" {...stroke} />
          <path d="M-30 -18 L2 -40 M-10 -16 L4 -42 M14 -16 L6 -42 M34 -16 L8 -42" stroke={INK} stroke-width="1.2" opacity="0.6" />
        </g>
      );
    case 'band':
      return (
        <g>
          <path d="M-22 -16 C-16 -30 20 -32 26 -16" stroke="#E2B13C" stroke-width="5" fill="none" />
          <path d="M-22 -16 C-30 -26 -36 -42 -30 -56" stroke="#E2B13C" stroke-width="3" fill="none" />
          <path d="M26 -16 C34 -28 36 -44 30 -56" stroke="#E2B13C" stroke-width="3" fill="none" />
          <ellipse cx="18" cy="-4" rx="7" ry="9" fill="#D9A12B" {...stroke} stroke-width="1.6" />
        </g>
      );
    case 'horns':
      return (
        <g>
          <path d="M-14 -22 C-30 -40 -44 -46 -54 -40 C-40 -38 -30 -30 -24 -16 Z" fill="#E9DFC9" {...stroke} />
          <path d="M14 -24 C24 -46 40 -54 52 -48 C40 -44 30 -34 24 -18 Z" fill="#E9DFC9" {...stroke} />
          <path d="M-20 -18 C-12 -34 18 -34 24 -18" fill="#3A2416" {...stroke} />
        </g>
      );
    case 'tall':
      return (
        <g>
          <path d="M-18 -20 L-8 -96 L24 -96 L26 -20 Z" fill="#F4EBDD" {...stroke} />
          <text x="8" y="-58" text-anchor="middle" font-size="13" fill={INK} font-family="'Ma Shan Zheng', serif" style={{ writingMode: 'vertical-rl' as any }}>
            一见
          </text>
          <text x="8" y="-34" text-anchor="middle" font-size="13" fill={INK} font-family="'Ma Shan Zheng', serif">
            财
          </text>
        </g>
      );
    case 'tufts':
      return (
        <g>
          <circle cx="-10" cy="-30" r="10" fill="#1E1410" {...stroke} />
          <circle cx="18" cy="-30" r="10" fill="#1E1410" {...stroke} />
          <path d="M-12 -20 C-6 -26 12 -26 20 -20" stroke="#C62F25" stroke-width="3" fill="none" />
        </g>
      );
    case 'stars':
      return (
        <g>
          <path d="M-26 -18 L-30 -60 L-14 -40 L-6 -74 L4 -44 L14 -80 L20 -44 L34 -66 L30 -18 Z" fill="#1A1412" {...stroke} />
          {[
            [-30, -60],
            [-6, -74],
            [14, -80],
            [34, -66],
            [-18, -44],
            [4, -50],
            [22, -40],
          ].map(([x, y]) => (
            <circle cx={x} cy={y} r="3.6" fill="#E2B13C" />
          ))}
          <path d="M-24 -26 L30 -26" stroke="#E2B13C" stroke-width="2" />
        </g>
      );
    case 'cap':
      return <path d="M-20 -18 C-16 -36 18 -38 26 -18 L20 -14 C8 -22 -8 -22 -16 -14 Z" fill={t} {...stroke} />;
  }
}

// ---------- body ----------

function Garment({ s }: { s: PuppetSpec }) {
  const R = s.robe;
  const T = s.trim;
  switch (s.garb) {
    case 'armor':
      return (
        <g>
          <path d="M120 118 C108 150 104 200 96 300 L204 300 C196 200 192 150 180 118 C168 108 132 108 120 118 Z" fill={R} {...stroke} opacity="0.9" />
          <path d="M112 196 L188 196 L196 250 L104 250 Z" fill={T} {...stroke} opacity="0.85" />
          <circle cx="150" cy="150" r="14" fill={T} {...stroke} />
          <circle cx="150" cy="150" r="6" fill={LIGHT} opacity="0.8" />
          <path d="M98 300 L104 250 L118 300 L126 252 L140 300 L150 252 L160 300 L174 252 L182 300 L196 250 L202 300" fill={R} {...stroke} opacity="0.9" />
          <Cutouts pattern={s.pattern} box={[116, 170, 68, 24]} />
          <Cutouts pattern={s.pattern} box={[108, 254, 84, 40]} />
        </g>
      );
    case 'short':
      return (
        <g>
          <path d="M120 118 C110 150 108 190 104 236 L196 236 C192 190 190 150 180 118 C168 108 132 108 120 118 Z" fill={R} {...stroke} opacity="0.9" />
          <path d="M104 228 L196 228 L196 240 L104 240 Z" fill={T} {...stroke} />
          <Cutouts pattern={s.pattern} box={[114, 140, 72, 84]} />
        </g>
      );
    case 'dress':
      return (
        <g>
          <path d="M126 118 C116 140 118 170 122 190 L178 190 C182 170 184 140 174 118 C164 108 136 108 126 118 Z" fill={R} {...stroke} opacity="0.9" />
          <path d="M122 186 C104 230 92 272 84 312 L216 312 C208 272 196 230 178 186 Z" fill={T} {...stroke} opacity="0.88" />
          <path d="M118 190 L182 190" stroke={INK} stroke-width="5" />
          <Cutouts pattern={s.pattern} box={[100, 210, 100, 90]} />
          <path d="M92 300 L208 300" stroke={LIGHT} stroke-width="1.6" stroke-dasharray="2 5" opacity="0.8" />
        </g>
      );
    default:
      return (
        <g>
          <path d="M122 116 C108 150 100 220 90 316 L210 316 C200 220 192 150 178 116 C166 106 134 106 122 116 Z" fill={R} {...stroke} opacity="0.9" />
          <path d="M136 112 L150 172 L164 112" fill="none" stroke={T} stroke-width="5" />
          <path d="M92 306 L208 306" stroke={T} stroke-width="8" />
          <Cutouts pattern={s.pattern} box={[106, 180, 88, 118]} />
          <path d="M112 150 C106 220 100 270 96 300 M188 150 C194 220 200 270 204 300" stroke={LIGHT} stroke-width="1.4" stroke-dasharray="2 5" fill="none" opacity="0.7" />
        </g>
      );
  }
}

function Legs({ s }: { s: PuppetSpec }) {
  if (s.garb === 'short') {
    return (
      <g>
        <path d="M120 236 L114 316 L136 316 L146 236 Z" fill="#3A2A22" {...stroke} />
        <path d="M154 236 L164 316 L186 316 L180 236 Z" fill="#3A2A22" {...stroke} />
        <path d="M108 316 L140 316 L140 332 L100 332 Z M160 316 L192 316 L198 332 L160 332 Z" fill="#1A1210" {...stroke} />
      </g>
    );
  }
  return <path d="M112 312 L144 312 L144 332 L102 332 Z M156 312 L188 312 L196 332 L156 332 Z" fill="#1A1210" {...stroke} />;
}

function Flags({ s }: { s: PuppetSpec }) {
  if (!s.flags) return null;
  return (
    <g opacity="0.92">
      {[-28, -10, 10, 28].map((dx, k) => (
        <g transform={`rotate(${dx * 0.8} 160 120)`}>
          <path d={`M162 120 L${168 + k * 2} 20`} stroke={INK} stroke-width="2.4" />
          <path d={`M${168 + k * 2} 22 L${214 + k * 2} 34 L${170 + k * 2} 74 Z`} fill={s.trim} {...stroke} stroke-width="1.6" />
          <path d={`M${178 + k * 2} 36 l14 4`} stroke={LIGHT} stroke-width="1.4" />
        </g>
      ))}
    </g>
  );
}

// ---------- props ----------

function PropArt({ kind, trim }: { kind: Prop; trim: string }) {
  switch (kind) {
    case 'fan':
      return <path d="M0 0 L-30 -28 A40 40 0 0 1 10 -40 Z" fill={trim} {...stroke} />;
    case 'feather':
      return (
        <g>
          <path d="M0 0 L-6 -12 C-34 -30 -30 -62 -6 -64 C18 -62 14 -30 -6 -12" fill="#F4EBDD" {...stroke} />
          <path d="M-6 -12 L-6 -60 M-6 -24 l-10 -10 M-6 -36 l-12 -10 M-6 -24 l10 -10 M-6 -36 l12 -10" stroke={INK} stroke-width="1.2" />
        </g>
      );
    case 'sword':
      return (
        <g>
          <path d="M0 0 L-4 -86" stroke="#C9D2D8" stroke-width="5" />
          <path d="M0 0 L-4 -86" stroke={INK} stroke-width="1" />
          <path d="M-12 -2 L10 -6" stroke={trim} stroke-width="5" stroke-linecap="round" />
          <path d="M0 0 L2 14" stroke={trim} stroke-width="6" stroke-linecap="round" />
        </g>
      );
    case 'spear':
      return (
        <g>
          <path d="M8 60 L-10 -120" stroke="#5A3A22" stroke-width="4" />
          <path d="M-10 -120 L-16 -146 L-4 -122 Z" fill="#C9D2D8" {...stroke} stroke-width="1.4" />
          <path d="M-10 -116 q-10 6 -4 16 q6 -10 12 -14" fill="#C62F25" />
        </g>
      );
    case 'blade':
      return (
        <g>
          <path d="M10 70 L-12 -110" stroke="#5A3A22" stroke-width="5" />
          <path d="M-12 -110 C-40 -120 -46 -150 -24 -170 C-26 -150 -14 -130 -4 -120 Z" fill="#C9D2D8" {...stroke} />
          <path d="M-14 -104 q-10 4 -8 12" stroke="#C62F25" stroke-width="5" fill="none" />
        </g>
      );
    case 'mace':
      return (
        <g>
          <path d="M0 0 L-6 -60" stroke="#5A3A22" stroke-width="5" />
          <circle cx="-7" cy="-68" r="13" fill="#4A4A52" {...stroke} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <path d={`M${-7 + Math.cos((k * Math.PI) / 3) * 13} ${-68 + Math.sin((k * Math.PI) / 3) * 13} l${Math.cos((k * Math.PI) / 3) * 6} ${Math.sin((k * Math.PI) / 3) * 6}`} stroke={INK} stroke-width="3" />
          ))}
        </g>
      );
    case 'staff':
      return (
        <g>
          <path d="M30 80 L-30 -120" stroke="#C62F25" stroke-width="7" stroke-linecap="round" />
          <path d="M26 66 L34 92 M-26 -106 L-34 -132" stroke="#E2B13C" stroke-width="8" stroke-linecap="round" />
        </g>
      );
    case 'brush':
      return (
        <g>
          <path d="M0 0 L-4 -54" stroke="#5A3A22" stroke-width="4" />
          <path d="M-4 -54 C-10 -66 -4 -78 -4 -84 C0 -76 4 -66 -4 -54 Z" fill="#1E1410" />
        </g>
      );
    case 'rod':
      return (
        <g>
          <path d="M0 0 C-30 -60 -70 -100 -120 -110" stroke="#5A3A22" stroke-width="3" fill="none" />
          <path d="M-120 -110 L-124 -40" stroke={INK} stroke-width="1" />
          <path d="M-128 -40 q4 10 8 0" stroke={INK} stroke-width="1.6" fill="none" />
        </g>
      );
    case 'whip':
      return (
        <g>
          <path d="M0 0 L-20 -60" stroke="#5A3A22" stroke-width="4" />
          {[0, 1, 2, 3, 4].map((k) => (
            <circle cx={-20 - k * 1.5} cy={-60 + k * 4} r="3.5" fill={k % 2 ? '#C62F25' : trim} />
          ))}
          <path d="M-22 -60 C-30 -40 -26 -20 -34 -6" stroke={trim} stroke-width="3" fill="none" />
        </g>
      );
    case 'ring':
      return (
        <g>
          <circle cx="-10" cy="-24" r="20" fill="none" stroke="#E2B13C" stroke-width="6" />
          <path d="M-30 -24 C-50 -10 -60 20 -40 40" stroke="#C62F25" stroke-width="5" fill="none" />
        </g>
      );
    case 'chisel':
      return (
        <g>
          <path d="M0 0 L-8 -40" stroke="#5A3A22" stroke-width="7" stroke-linecap="round" />
          <path d="M-8 -40 L-12 -72 L-4 -72 Z" fill="#C9D2D8" {...stroke} stroke-width="1.4" />
          <rect x="-34" y="10" width="22" height="22" rx="4" fill="#F1E3C2" {...stroke} transform="rotate(-18 -23 21)" />
          <circle cx="-26" cy="18" r="2.6" fill="#C62F25" />
        </g>
      );
    case 'kerchief':
      return <path d="M0 0 C-20 10 -30 40 -18 60 C-10 40 0 30 10 26 Z" fill={trim} {...stroke} opacity="0.9" />;
    default:
      return null;
  }
}

function Arm({ side, s }: { side: 'front' | 'back'; s: PuppetSpec }) {
  const front = side === 'front';
  const sx = front ? 122 : 178;
  const sleeve = s.robe;
  // Upper arm to elbow, forearm to hand; long water sleeve hangs from the cuff.
  const elbow: [number, number] = front ? [98, 170] : [196, 176];
  const hand: [number, number] = front ? [80, 136] : [206, 222];
  return (
    <g class={`pp-arm pp-arm-${side}`} style={{ transformOrigin: `${sx}px 124px` }}>
      <path d={`M${sx} 122 L${elbow[0]} ${elbow[1]}`} stroke={sleeve} stroke-width="20" stroke-linecap="round" />
      <path d={`M${sx} 122 L${elbow[0]} ${elbow[1]}`} stroke={INK} stroke-width="22" stroke-linecap="round" opacity="0.25" />
      <g class="pp-forearm" style={{ transformOrigin: `${elbow[0]}px ${elbow[1]}px` }}>
        <path d={`M${elbow[0]} ${elbow[1]} L${hand[0]} ${hand[1]}`} stroke={sleeve} stroke-width="16" stroke-linecap="round" />
        {!front && s.garb !== 'armor' && (
          <path d={`M${hand[0]} ${hand[1]} C${hand[0] + 6} ${hand[1] + 30} ${hand[0] - 10} ${hand[1] + 60} ${hand[0] + 4} ${hand[1] + 80}`} stroke="#F4EBDD" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.85" class="pp-sleeve" />
        )}
        <circle cx={hand[0]} cy={hand[1]} r="7" fill={SKIN} {...stroke} stroke-width="1.6" />
        {front && (
          <g transform={`translate(${hand[0]} ${hand[1]})`}>
            <PropArt kind={s.prop} trim={s.trim} />
          </g>
        )}
        {/* control rod from the hand down past the screen */}
        <path d={`M${hand[0]} ${hand[1]} L${hand[0] + (front ? -10 : 30)} 420`} stroke="#1A0E08" stroke-width="1.4" opacity="0.55" />
      </g>
    </g>
  );
}

export type PuppetState = 'idle' | 'hit' | 'down' | 'enter';

export function Puppet({ spec, state = 'idle', size = 300 }: { spec: PuppetSpec; state?: PuppetState; size?: number }) {
  const sc = spec.scale ?? 1;
  return (
    <svg viewBox="-20 -60 340 420" width={size} height={(size * 420) / 340} class={`puppet is-${state}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <g class="pp-root" style={{ transformOrigin: '150px 340px' }} transform={sc !== 1 ? `translate(150 340) scale(${sc}) translate(-150 -340)` : undefined}>
        <Flags s={spec} />
        <Arm side="back" s={spec} />
        <Legs s={spec} />
        <Garment s={spec} />
        <g class="pp-head" style={{ transformOrigin: '150px 104px' }}>
          <path d="M142 96 L142 114 L158 114 L158 96 Z" fill={SKIN} {...stroke} stroke-width="1.6" />
          <g transform="translate(150 76)">
            <Head s={spec} />
          </g>
        </g>
        <Arm side="front" s={spec} />
        {/* main rod from the neck */}
        <path d="M150 114 L150 420" stroke="#1A0E08" stroke-width="2" opacity="0.5" />
      </g>
    </svg>
  );
}
