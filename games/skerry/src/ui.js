import { TERRAIN_INFO } from './tiles.js';

export const $ = (id) => document.getElementById(id);

const SVGNS = 'http://www.w3.org/2000/svg';
const pt = (i, r = 1) => `${(Math.cos((i * Math.PI) / 3) * r).toFixed(4)},${(Math.sin((i * Math.PI) / 3) * r).toFixed(4)}`;

// Draw a tile as six coloured wedges. The rotation lives on an inner group so CSS can animate it.
export function drawHex(svg, tile, deg = 0, marks = null) {
  svg.textContent = '';
  if (!tile) return;
  const g = document.createElementNS(SVGNS, 'g');
  g.setAttribute('class', 'rot');
  g.style.transform = `rotate(${deg}deg)`;
  for (let i = 0; i < 6; i++) {
    const p = document.createElementNS(SVGNS, 'polygon');
    p.setAttribute('points', `0,0 ${pt(i)} ${pt(i + 1)}`);
    p.setAttribute('fill', TERRAIN_INFO[tile.edges[i]].color);
    p.setAttribute('stroke', TERRAIN_INFO[tile.edges[i]].color);
    p.setAttribute('stroke-width', '0.02');
    g.appendChild(p);
  }
  const rim = document.createElementNS(SVGNS, 'polygon');
  rim.setAttribute('points', [0, 1, 2, 3, 4, 5].map((i) => pt(i)).join(' '));
  rim.setAttribute('fill', 'none');
  rim.setAttribute('stroke', 'rgba(28,42,47,0.55)');
  rim.setAttribute('stroke-width', '0.05');
  rim.setAttribute('stroke-linejoin', 'round');
  g.appendChild(rim);
  if (tile.quest) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', '0.2');
    c.setAttribute('fill', '#fff');
    c.setAttribute('stroke', TERRAIN_INFO[tile.quest.terrain].color);
    c.setAttribute('stroke-width', '0.09');
    g.appendChild(c);
  }
  svg.appendChild(g);
  return g;
}

export function setHexRotation(svg, deg) {
  const g = svg.querySelector('.rot');
  if (g) g.style.transform = `rotate(${deg}deg)`;
}

const noun = { meadow: 'meadow', forest: 'forest', field: 'field', village: 'village', water: 'lake' };

export function renderQuests(el, board) {
  const qs = board.activeQuests();
  el.textContent = '';
  for (const q of qs) {
    const p = board.questProgress(q);
    const row = document.createElement('div');
    row.className = 'quest';
    row.dataset.id = q.id;
    row.innerHTML = `<span class="sw" style="background:${TERRAIN_INFO[q.terrain].color}"></span>
      <span><b>Grow the ${noun[q.terrain]}</b><small>Reward: ${board.questReward} tiles, ${q.target * (board.type.questPoints || 10)} points</small></span>
      <span class="n">${p.size}/${p.target}</span>`;
    el.appendChild(row);
  }
}

let coachTimer = null;
export function coach(text, showOk = true) {
  clearTimeout(coachTimer);
  $('coachText').innerHTML = text;
  $('coachOk').hidden = !showOk;
  $('coach').classList.remove('hide');
}

let bannerTimer = null;
export function banner(title, text) {
  $('bannerTitle').textContent = title;
  $('bannerText').textContent = text;
  const b = $('banner');
  b.classList.remove('hide');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.add('hide'), 3600);
}

let achTimer = null;
export function achievement(entry) {
  const a = $('ach');
  a.innerHTML = `<span class="ic">${entry.icon}</span><span><small>New in your journal</small><b>${entry.name}</b></span>`;
  a.classList.remove('hide');
  clearTimeout(achTimer);
  achTimer = setTimeout(() => a.classList.add('hide'), 3200);
}
export function hideCoach() { $('coach').classList.add('hide'); }

let toastTimer = null;
export function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.remove('hide');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hide'), 2200);
}

export function popAt(x, y, text, cls = '', sub = '') {
  const d = document.createElement('div');
  d.className = 'pop ' + cls;
  d.style.left = x + 'px';
  d.style.top = y + 'px';
  d.textContent = text;
  if (sub) { const s = document.createElement('small'); s.textContent = sub; d.appendChild(s); }
  $('labels').appendChild(d);
  setTimeout(() => d.remove(), 1600);
}

export function soundIcon(muted) {
  return muted
    ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
}

export function animateNumber(el, to) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if (from === to) { el.textContent = to.toLocaleString('en-US'); return; }
  const t0 = performance.now(), dur = 550;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (to - from) * e).toLocaleString('en-US');
    if (k < 1 && Number(el.dataset.v) === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function bump(el) {
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// Picture cards for first-timers.
function hexSvg(edges, cx, cy, r, extra = '') {
  let out = `<g transform="translate(${cx} ${cy})">`;
  for (let i = 0; i < 6; i++) {
    out += `<polygon points="0,0 ${pt(i, r)} ${pt(i + 1, r)}" fill="${TERRAIN_INFO[edges[i]].color}" stroke="${TERRAIN_INFO[edges[i]].color}" stroke-width="0.02"/>`;
  }
  out += `<polygon points="${[0, 1, 2, 3, 4, 5].map((i) => pt(i, r)).join(' ')}" fill="none" stroke="rgba(28,42,47,0.5)" stroke-width="0.04" stroke-linejoin="round"/>${extra}</g>`;
  return out;
}
const INTRO = [
  {
    title: 'A tile has six sides',
    text: 'Each side shows a kind of land: meadow, forest, field, village or water.',
    svg: () => {
      const e = ['forest', 'forest', 'meadow', 'meadow', 'field', 'meadow'];
      let labels = '';
      const names = { forest: 'forest', meadow: 'meadow', field: 'field' };
      for (let i = 0; i < 6; i++) {
        const a = ((i * 60 + 30) * Math.PI) / 180;
        labels += `<text x="${(Math.cos(a) * 1.32).toFixed(3)}" y="${(Math.sin(a) * 1.32 + 0.06).toFixed(3)}" text-anchor="middle" font-size="0.2">${names[e[i]]}</text>`;
      }
      return `<svg viewBox="-1.9 -1.5 3.8 3">${hexSvg(e, 0, 0, 1)}${labels}</svg>`;
    },
  },
  {
    title: 'Match the sides that touch',
    text: 'Place each tile beside your island. Where the same land meets on both tiles, that side matches and scores 10.',
    svg: () => {
      const A = ['forest', 'meadow', 'meadow', 'field', 'field', 'forest'];
      const B = ['meadow', 'meadow', 'field', 'forest', 'forest', 'meadow'];
      const ax = -0.75, ay = -0.433, bx = 0.75, by = 0.433;
      const c0 = pt(0).split(',').map(Number), c1 = pt(1).split(',').map(Number);
      const line = `<line x1="${ax + c0[0]}" y1="${ay + c0[1]}" x2="${ax + c1[0]}" y2="${ay + c1[1]}" stroke="#5fe07a" stroke-width="0.11" stroke-linecap="round"/>`;
      const tag = `<g transform="translate(1.05 -0.85)"><rect x="-0.55" y="-0.2" width="1.1" height="0.36" rx="0.18" fill="#1c2a2f"/><text x="0" y="0.05" text-anchor="middle" font-size="0.2" fill="#fff" font-weight="700">match +10</text></g>`;
      return `<svg viewBox="-2.1 -1.55 4.2 3.1">${hexSvg(A, ax, ay, 1)}${hexSvg(B, bx, by, 1)}${line}${tag}</svg>`;
    },
  },
  {
    title: 'Make your tiles count',
    text: 'You get a limited pile of tiles, and the game ends when it runs out. Good matches win extra tiles, so a careful builder grows a bigger island.',
    svg: () => {
      let stack = '';
      for (let k = 3; k >= 0; k--) stack += hexSvg(['meadow', 'forest', 'field', 'meadow', 'village', 'water'], -0.6, 0.35 - k * 0.16, 0.85);
      const plus = `<g transform="translate(1.1 -0.2)"><circle r="0.42" fill="#ffd76a"/><text y="0.1" text-anchor="middle" font-size="0.3" font-weight="700" fill="#3b2a05">+1</text></g>`;
      return `<svg viewBox="-2 -1.5 4 3">${stack}${plus}</svg>`;
    },
  },
];
export function renderIntro(i) {
  const s = INTRO[i];
  $('introArt').innerHTML = s.svg();
  $('introTitle').textContent = s.title;
  $('introText').textContent = s.text;
  $('introDots').innerHTML = INTRO.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
  $('introBack').hidden = i === 0;
  $('introNext').textContent = i < INTRO.length - 1 ? 'Next' : 'Start playing';
}

// One square per placement, ten to a row, for the shareable result.
const STRIP = { perfect: '⭐', snug: '🟩', match: '🟨', none: '⬜' };
export function placementStrip(log) {
  const rows = [];
  for (let i = 0; i < log.length; i += 10) rows.push(log.slice(i, i + 10).map((x) => STRIP[x]).join(''));
  return rows.join('\n');
}

// Ten emoji summarising what the island is made of.
export function emojiBar(comp) {
  const total = Object.values(comp).reduce((a, b) => a + b, 0) || 1;
  const order = ['meadow', 'forest', 'field', 'village', 'water'];
  const raw = order.map((t) => ({ t, v: (comp[t] / total) * 10 }));
  const out = raw.map((r) => ({ t: r.t, n: Math.floor(r.v), f: r.v - Math.floor(r.v) }));
  let left = 10 - out.reduce((a, b) => a + b.n, 0);
  [...out].sort((a, b) => b.f - a.f).slice(0, left).forEach((r) => r.n++);
  return out.map((r) => TERRAIN_INFO[r.t].emoji.repeat(r.n)).join('');
}
