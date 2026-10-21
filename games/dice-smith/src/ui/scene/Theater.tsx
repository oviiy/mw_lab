import type { ComponentChildren } from 'preact';
import { Puppet, type PuppetState } from '../puppet/Puppet';
import { ROSTER } from '../puppet/roster';

const G = '#E2B13C';

function Couplet({ x, y, text, h }: { x: number; y: number; text: string; h: number }) {
  const step = Math.min(30, (h - 20) / text.length);
  return (
    <g>
      <rect x={x - 15} y={y} width="30" height={h} rx="3" fill="#1A0E0A" stroke={G} stroke-width="1.5" />
      {[...text].map((ch, i) => (
        <text x={x} y={y + 22 + i * step} text-anchor="middle" font-size={step * 0.78} fill={G} font-family="'Ma Shan Zheng', 'STKaiti', serif">
          {ch}
        </text>
      ))}
    </g>
  );
}

function Drape({ side, w, h, top }: { side: 'l' | 'r'; w: number; h: number; top: number }) {
  // Gathered red curtain at the screen's edge.
  const x0 = side === 'l' ? 40 : w - 40;
  const dir = side === 'l' ? 1 : -1;
  const d = `M${x0} ${top} L${x0 + dir * 86} ${top} C${x0 + dir * 70} ${top + 40} ${x0 + dir * 40} ${top + 70} ${x0 + dir * 26} ${top + 110} C${x0 + dir * 30} ${top + 170} ${x0 + dir * 22} ${h - 70} ${x0 + dir * 16} ${h - 40} L${x0} ${h - 40} Z`;
  return (
    <g>
      <path d={d} fill="url(#th-drape)" />
      {[0.3, 0.55, 0.8].map((k) => (
        <path d={`M${x0 + dir * 86 * k} ${top} C${x0 + dir * 70 * k} ${top + 60} ${x0 + dir * 30 * k} ${top + 90} ${x0 + dir * 18 * k} ${h - 40}`} stroke="rgba(40,0,0,0.35)" stroke-width="2" fill="none" />
      ))}
      <path d={`M${x0 + dir * 28} ${top + 106} q${dir * 10} 6 ${dir * 2} 18`} stroke={G} stroke-width="5" fill="none" />
    </g>
  );
}

export interface TheaterProps {
  w: number;
  h: number;
  opponent: string | null;
  state?: PuppetState;
  /** Increment to replay the entrance. */
  enterKey?: string;
  plaque?: string;
  couplet?: [string, string];
  children?: ComponentChildren;
  compact?: boolean;
}

export function Theater({ w, h, opponent, state = 'idle', enterKey, plaque = '骰宝台', couplet = ['台上三更戏', '人间一掷缘'], children, compact }: TheaterProps) {
  const top = compact ? 40 : 60;
  const side = compact ? 18 : 46;
  const bottom = compact ? 22 : 38;
  const spec = opponent ? ROSTER[opponent] : null;
  const puppetSize = Math.min((h - top - bottom) * 0.98, w * 0.42);
  return (
    <div class={`theater ${compact ? 'is-compact' : ''}`} style={{ width: `${w}px`, height: `${h}px` }}>
      <div class="screen" data-fx="screen" style={{ left: `${side}px`, right: `${side}px`, top: `${top}px`, bottom: `${bottom}px` }}>
        <div class="screen-light" />
        <div class="screen-weave" />
        {spec && (
          <div class="puppet-layer" key={enterKey ?? opponent} data-fx="puppet">
            <Puppet spec={spec} state={state} size={puppetSize * (340 / 420) * 1.08} />
          </div>
        )}
        <div class="screen-overlay">{children}</div>
      </div>
      <svg class="theater-frame" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <defs>
          <linearGradient id="th-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#B0281C" />
            <stop offset="1" stop-color="#6E120C" />
          </linearGradient>
          <linearGradient id="th-pillar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#5A0E0A" />
            <stop offset="0.45" stop-color="#B0281C" />
            <stop offset="1" stop-color="#4A0A08" />
          </linearGradient>
          <linearGradient id="th-drape" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#7E0F12" />
            <stop offset="0.5" stop-color="#C21E22" />
            <stop offset="1" stop-color="#6A0A0E" />
          </linearGradient>
          <linearGradient id="th-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3A2010" />
            <stop offset="1" stop-color="#1A0D06" />
          </linearGradient>
        </defs>
        {!compact && (
          <>
            {/* Upturned eaves and tiles */}
            <path d={`M-10 30 Q${w * 0.08} 6 ${w * 0.2} 14 L${w * 0.8} 14 Q${w * 0.92} 6 ${w + 10} 30 L${w + 10} 40 L-10 40 Z`} fill="#160C10" />
            {Array.from({ length: Math.floor(w / 14) }, (_, i) => (
              <path d={`M${i * 14 + 6} 18 v20`} stroke="#2E1A22" stroke-width="5" />
            ))}
            <path d={`M-10 30 Q${w * 0.08} 6 ${w * 0.2} 14 L${w * 0.8} 14 Q${w * 0.92} 6 ${w + 10} 30`} stroke={G} stroke-width="2" fill="none" />
          </>
        )}
        {/* Lintel */}
        <rect x="0" y={top - (compact ? 26 : 26)} width={w} height="26" fill="url(#th-beam)" />
        <path d={`M0 ${top - 24} H${w} M0 ${top - 3} H${w}`} stroke={G} stroke-width="1.5" />
        {Array.from({ length: Math.floor(w / 36) }, (_, i) => (
          <path d={`M${18 + i * 36} ${top - 13} m-8 0 a8 5 0 1 0 16 0 a8 5 0 1 0 -16 0`} stroke={G} stroke-width="1" fill="none" opacity="0.6" />
        ))}
        {/* Plaque */}
        <g transform={`translate(${w / 2} ${top - 14})`}>
          <rect x={compact ? -52 : -70} y={compact ? -16 : -24} width={compact ? 104 : 140} height={compact ? 30 : 40} rx="4" fill="#120A08" stroke={G} stroke-width="2.2" />
          <text y={compact ? 7 : 9} text-anchor="middle" font-size={compact ? 20 : 27} fill={G} font-family="'Ma Shan Zheng', 'STKaiti', serif" letter-spacing="4">
            {plaque}
          </text>
        </g>
        <Drape side="l" w={w} h={h} top={top} />
        <Drape side="r" w={w} h={h} top={top} />
        {/* Scalloped valance */}
        <path
          d={`M${side} ${top} ${Array.from({ length: 14 }, (_, i) => {
            const x0 = side + ((w - side * 2) / 14) * i;
            const x1 = side + ((w - side * 2) / 14) * (i + 1);
            return `Q${(x0 + x1) / 2} ${top + 16} ${x1} ${top}`;
          }).join(' ')} Z`}
          fill="#A3181C"
          stroke={G}
          stroke-width="1.2"
        />
        {/* Pillars */}
        {!compact && (
          <>
            <rect x="6" y={top - 26} width="40" height={h - top + 26} fill="url(#th-pillar)" />
            <rect x={w - 46} y={top - 26} width="40" height={h - top + 26} fill="url(#th-pillar)" />
            <Couplet x={26} y={top + 14} text={couplet[0]} h={Math.min(190, h - top - 60)} />
            <Couplet x={w - 26} y={top + 14} text={couplet[1]} h={Math.min(190, h - top - 60)} />
          </>
        )}
        {/* Apron */}
        <rect x="0" y={h - bottom} width={w} height={bottom} fill="url(#th-wood)" />
        <path d={`M0 ${h - bottom + 2} H${w}`} stroke={G} stroke-width="2" />
        {Array.from({ length: Math.floor(w / 28) }, (_, i) => (
          <path d={`M${i * 28 + 4} ${h - bottom + 10} h18 v${Math.max(6, bottom - 18)} h-18 z`} stroke="rgba(226,177,60,0.35)" fill="none" />
        ))}
        {/* Tassels */}
        {[side + 4, w - side - 4].map((x) => (
          <g class="tassel" style={{ transformOrigin: `${x}px ${top}px` }}>
            <path d={`M${x} ${top} v18`} stroke={G} stroke-width="2" />
            <circle cx={x} cy={top + 20} r="4" fill={G} />
            <path d={`M${x - 4} ${top + 22} L${x - 6} ${top + 44} M${x} ${top + 23} V${top + 46} M${x + 4} ${top + 22} L${x + 6} ${top + 44}`} stroke="#C21E22" stroke-width="2.4" />
          </g>
        ))}
      </svg>
    </div>
  );
}
