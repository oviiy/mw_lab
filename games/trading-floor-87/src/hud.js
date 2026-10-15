// Open Outcry HUD: deal bubbles over the pit, the position tube + heat, cash, prompts, end card.
import { fmtMoney, pitClock, clamp } from './util.js';
import { PREV_SETTLE, SESSION_MIN } from './market/calibration.js';
import { MAX_LOTS, START_EQUITY, GRADE_RULE } from './outcry.js';
import { TIERS, AUGMENTS } from './augments.js';

const $ = (id) => document.getElementById(id);

export class Hud {
  constructor(onTake) {
    this.onTake = onTake;
    this.bubbles = new Map();
    this.bannerT = 0;
    this.sparkT = 0;
    const cells = [];
    for (let i = MAX_LOTS; i >= -MAX_LOTS; i--) cells.push(`<i data-l="${i}" class="${i === 0 ? 'mid' : ''}"></i>`);
    $('tube-cells').innerHTML = cells.join('');
  }

  banner(text, sub = '', cls = 'amber', dur = 2.6) {
    const b = $('banner');
    b.className = `${cls} show`;
    b.innerHTML = `${text}${sub ? `<small>${sub}</small>` : ''}`;
    this.bannerT = dur;
  }

  // Floating text at a screen point (fills, gains).
  float(text, x, y, color, big = false) {
    const el = document.createElement('div');
    el.className = 'float' + (big ? ' big' : '');
    el.textContent = text;
    el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
    $('floats').appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  // ── Rewards ──
  streak(g) {
    const box = $('streakbox');
    const n = g.streak, t = g.tier;
    box.classList.toggle('on', n > 0);
    box.className = `${n > 0 ? 'on ' : ''}t${t.level}` + (box.classList.contains('pump') ? ' pump' : '');
    $('streak-n').innerHTML = `${n}<small>× STREAK</small>`;
    $('streak-tier').textContent = t.name || 'WARMING UP';
    const start = g.mods.streakStart, shift = 3 - start;
    const next = t.level === 0 ? 3 - shift : t.level === 1 ? 6 - shift : t.level === 2 ? 10 - shift : null;
    const nextName = t.level === 0 ? 'HOT' : t.level === 1 ? 'ON FIRE' : 'LEGEND';
    $('streak-next').textContent = next ? `${next - n} more profitable close${next - n > 1 ? 's' : ''} → ${nextName}` : 'DESK BONUS: 100% OF EVERY WIN';
    box.querySelector('.flames').style.transform = `scaleX(${Math.min(1, 0.2 + n / 10)})`;
  }

  pump() { const b = $('streakbox'); b.classList.remove('pump'); void b.offsetWidth; b.classList.add('pump'); }

  celebrate(big = false) {
    const f = $('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    const n = big ? 90 : 36;
    const cols = ['#ffd23a', '#3dff6e', '#ff6a2a', '#d98bff', '#fff'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = `${Math.random() * 100}vw`; c.style.top = `${-10 - Math.random() * 20}px`;
      c.style.background = cols[i % cols.length];
      c.style.setProperty('--dx', `${(Math.random() - 0.5) * 300}px`);
      c.style.setProperty('--r', `${Math.random() * 1080}deg`);
      c.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2200);
    }
  }

  augsBar(ids) {
    $('augs').innerHTML = ids.map((id) => { const a = AUGMENTS.find((x) => x.id === id); return `<span class="${a.tier}" title="${a.name}: ${a.desc}">${a.icon}</span>`; }).join('');
  }

  showOffer(offer, phase, onPick) {
    const el = $('augpick');
    el.hidden = false;
    $('ap-title').textContent = 'CHOOSE YOUR EDGE';
    $('ap-sub').textContent = `${phase.name} BEGINS · PICK ONE AUGMENT (1 · 2 · 3)`;
    $('augcards').innerHTML = offer.map((a, i) => `<div class="aug ${a.tier}" data-i="${i}"><div class="tier" style="color:${TIERS[a.tier].color}">${TIERS[a.tier].name}</div><div class="ico">${a.icon}</div><div class="nm">${a.name}</div><div class="ds">${a.desc}</div><div class="key">PRESS ${i + 1}</div></div>`).join('');
    for (const card of $('augcards').children) card.addEventListener('click', () => onPick(+card.dataset.i));
  }

  hideOffer() { $('augpick').hidden = true; }

  // ── Wire + Dow ──
  news(text, hot = false) {
    this.wire = [text, ...(this.wire || [])].slice(0, 6);
    const t = $('wire-text');
    t.textContent = this.wire.join('   •••   ');
    this.wireX = $('wire-track').clientWidth; // restart the crawl from the right with the newest first
    const l = $('wire-lbl');
    l.textContent = hot ? 'BULLETIN' : 'DJ NEWS WIRE';
    l.classList.toggle('hot', hot);
    clearTimeout(this.wireHot);
    if (hot) this.wireHot = setTimeout(() => { l.textContent = 'DJ NEWS WIRE'; l.classList.remove('hot'); }, 6000);
  }

  dow(value, chg) {
    $('dow-n').textContent = value.toFixed(2);
    const c = $('dow-c');
    c.textContent = `${chg >= 0 ? '+' : '−'}${Math.abs(chg).toFixed(2)} (${(chg / 2246.74 * 100).toFixed(1)}%)`;
    c.style.color = chg >= 0 ? 'var(--green)' : 'var(--red)';
  }

  crawl(dt) {
    if (this.wireX == null) return;
    const t = $('wire-text');
    this.wireX -= dt * 90;
    if (this.wireX < -t.scrollWidth) this.wireX = $('wire-track').clientWidth;
    t.style.transform = `translateX(${this.wireX}px)`;
  }

  // ── Tomorrow's front page ──
  showPaper(card, onDone) {
    const el = $('paper');
    el.hidden = false;
    const pts = Math.round(-card.dowChg), pct = (-card.dowChg / 2246.74 * 100).toFixed(1);
    $('pp-head').textContent = pts >= 400 ? `STOCKS PLUNGE ${pts} POINTS` : pts > 0 ? `DOW SINKS ${pts} POINTS` : 'MARKETS STEADY';
    $('pp-deck').textContent = `Biggest one-day percentage drop in the Dow's history: down ${pct}%; index futures fall ${(-card.dayRet * 100).toFixed(1)}% in Chicago`;
    $('pp-story').textContent = 'CHICAGO — Traders in the index futures pit described scenes of chaos yesterday as waves of selling by portfolio insurance programs swamped the few buyers left on the floor. '
      + 'By early afternoon the New York Stock Exchange\'s order routing system was running far behind, the ticker tape lagged by more than an hour, and the normal link between futures and stocks had broken down. '
      + '"Nobody was bidding," one veteran local said. "You\'d shout a price and the whole crowd would turn their backs." Volume set records on both exchanges. Officials in Washington said they were monitoring the situation closely.';
    const won = !card.busted && card.pnl > 0;
    $('pp-side-h').textContent = card.busted ? 'Local trader wiped out' : won ? `Trader 'ACE' up ${fmtMoney(card.pnl)}` : `Trader 'ACE' bruised`;
    $('pp-side').textContent = card.busted
      ? `One local, known on the floor as ACE, was closed out by the clearing firm at ${pitClock(card.closedAt)} after holding too large a position into the slide.`
      : won ? `Amid the wreckage, at least one local walked off the floor richer. ACE, trading a personal account, made ${card.trades} trades, ran a best streak of ${card.bestStreak} winning close${card.bestStreak === 1 ? '' : 's'}, and finished up ${fmtMoney(card.pnl)}.`
      : `ACE, a local trading a personal account, lost ${fmtMoney(-card.pnl)} over ${card.trades} trades but kept the badge. "I'll be back tomorrow," he said.`;
    drawChart($('pp-chart'), card.bars, null, { compact: true, paper: true });
    const done = () => { el.hidden = true; removeEventListener('keydown', done); el.removeEventListener('click', done); onDone(); };
    setTimeout(() => { el.addEventListener('click', done); addEventListener('keydown', done); }, 900);
  }

  prompt(html) {
    const p = $('prompt');
    if (!html) { p.hidden = true; return; }
    p.hidden = false; p.innerHTML = html;
  }

  // deals: [{deal, screen:{x,y,visible}}]
  bubblesUpdate(items) {
    const live = new Set();
    for (const { deal: d, screen } of items) {
      live.add(d.id);
      let el = this.bubbles.get(d.id);
      if (!el) {
        el = document.createElement('button');
        el.className = `deal ${d.side}`;
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.onTake(d.id, el); });
        $('deals').appendChild(el);
        this.bubbles.set(d.id, el);
        el.dataset.key = '';
      }
      const good = d.edge > 0.02;
      const key = `${d.px}|${good}|${Math.round(d.edge * 20)}|${d.withTape}`;
      if (el.dataset.key !== key) {
        el.dataset.key = key;
        el.classList.toggle('good', good);
        el.classList.toggle('bad', !good);
        el.innerHTML = (d.withTape ? '<span class="tape">↗ TAPE</span>' : '') + `<b>${d.side === 'buy' ? 'BUY' : 'SELL'} ${d.qty}</b><span class="px">${d.px.toFixed(2)}</span>`
          + `<span class="edge">${good ? '★ ' : ''}${Math.abs(d.edge).toFixed(2)} ${d.side === 'buy' ? (d.edge >= 0 ? 'UNDER' : 'OVER') : (d.edge >= 0 ? 'OVER' : 'UNDER')} BOARD</span><i class="ring"></i>`;
      }
      const bx = clamp(screen.x, 330, innerWidth - 120), by = clamp(screen.y, 250, innerHeight - 130);
      el.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -100%)`;
      el.style.visibility = screen.visible ? 'visible' : 'hidden';
      const frac = d.ttl > 100 ? 1 : clamp(d.left / d.ttl, 0, 1);
      el.style.setProperty('--t', frac);
      el.classList.toggle('hurry', frac < 0.35);
    }
    for (const [id, el] of this.bubbles) if (!live.has(id)) { el.remove(); this.bubbles.delete(id); }
  }

  update(dt, g) {
    const sim = g.sim;
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) $('banner').classList.remove('show'); }
    // Cash
    const eq = g.equity(), pnl = eq - START_EQUITY;
    const c = $('cash');
    c.textContent = `${pnl >= 0 ? '+' : '−'}${fmtMoney(Math.abs(pnl)).replace('$', '$')}`;
    c.className = pnl >= 0 ? 'up' : 'dn';
    $('cash-sub').innerHTML = `EQUITY ${fmtMoney(eq)} · CLOSED OUT BELOW ${fmtMoney(g.mods.bust)}${g.bonus ? `<br><span style="color:#ffb52e">BONUSES +${fmtMoney(g.bonus)}</span>` : ''}`;
    // Clock
    $('k-phase').textContent = sim.phase.name;
    $('k-time').textContent = pitClock(sim.t);
    const chg = g.mark - PREV_SETTLE;
    const kp = $('k-px');
    kp.textContent = `${g.mark.toFixed(2)}  ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}`;
    kp.style.color = chg >= 0 ? 'var(--green)' : 'var(--red)';
    $('k-bar').style.width = `${(sim.t / SESSION_MIN) * 100}%`;
    // Tube
    const lots = g.pos / g.lot;
    for (const cell of $('tube-cells').children) {
      const l = +cell.dataset.l;
      cell.className = (l === 0 ? 'mid ' : '') + (lots > 0 && l > 0 && l <= lots ? 'long' : lots < 0 && l < 0 && l >= lots ? 'short' : '');
    }
    const lbl = $('tube-lbl');
    lbl.textContent = g.pos === 0 ? 'FLAT' : `${g.pos > 0 ? 'LONG' : 'SHORT'} ${Math.abs(g.pos)}`;
    lbl.style.color = g.pos > 0 ? 'var(--green)' : g.pos < 0 ? 'var(--red)' : '#ccc';
    const u = g.unrealized();
    const op = $('tube-pnl');
    op.textContent = g.pos ? `${u >= 0 ? '+' : '−'}${fmtMoney(Math.abs(u))}` : '';
    op.style.color = u >= 0 ? 'var(--green)' : 'var(--red)';
    $('tube-avg').textContent = g.pos ? `avg ${g.avg.toFixed(2)}` : '';
    const h = $('heat-fill');
    h.style.width = `${g.heat * 100}%`;
    h.style.background = g.heat > 0.75 ? 'var(--red)' : g.heat > 0.45 ? '#ff8a2a' : 'var(--amber)';
    $('heat').classList.toggle('hot', g.heat > 0.75);
    // Danger vignette: close to the bust line, or about to get dumped.
    const bustRisk = clamp((START_EQUITY * 0.6 - (eq - g.mods.bust)) / (START_EQUITY * 0.6), 0, 1);
    this.streak(g);
    $('vignette').style.opacity = String(clamp(Math.max(bustRisk, (g.heat - 0.7) * 3) * 0.85, 0, 0.85));

    this.sparkT -= dt;
    if (this.sparkT <= 0) { this.sparkT = 0.5; drawChart($('spark'), sim.bars, sim, { compact: true }); }
  }

  showEnd(card, best) {
    document.body.classList.remove('playing');
    $('end').hidden = false;
    $('e-grade').textContent = card.grade;
    $('e-grade').style.color = { S: '#ffd23a', A: '#3dff6e', B: '#9fe870', C: '#ffb52e', D: '#ff8a3a', F: '#ff3b2f' }[card.grade];
    $('e-title').textContent = card.busted ? 'CLOSED OUT' : 'CLOSING BELL';
    $('e-sub').textContent = card.busted
      ? `THE CLERK CLOSED YOU OUT AT ${pitClock(card.closedAt)} CT`
      : `S&P FUTURES SETTLE ${card.settle.toFixed(2)} (${(card.dayRet * 100).toFixed(1)}%)`;
    drawChart($('endchart'), card.bars, null, { curve: card.curve });
    const st = [
      ['DAY P&L', `${card.pnl >= 0 ? '+' : '−'}${fmtMoney(Math.abs(card.pnl))}`, card.pnl >= 0 ? '#3dff6e' : '#ff3b2f'],
      ['TRADES', String(card.trades), '#fff'],
      ['BEST TRADE', card.best ? `+${fmtMoney(card.best)}` : '—', '#ffd23a'],
      ['WORST DRAWDOWN', `−${fmtMoney(card.maxDD)}`, '#ffb52e'],
      ['BEST STREAK', `${card.bestStreak ?? 0}×`, '#ff8a2a'],
      ['DESK BONUSES', `+${fmtMoney(card.bonus ?? 0)}`, '#ffd23a'],
      ['RISK-DESK DUMPS', String(card.forced ?? 0), '#ff8a3a'],
      ['BEST DAY', best ? `${best.pnl >= 0 ? '+' : '−'}${fmtMoney(Math.abs(best.pnl))} (${best.grade})` : '—', '#ffd23a'],
    ];
    $('e-stats').innerHTML = st.map(([k, v, col]) => `<div class="stat"><div class="k">${k}</div><div class="v" style="color:${col}">${v}</div></div>`).join('');
    $('e-why').textContent = `GRADE: ${GRADE_RULE}`;
    $('e-augs').innerHTML = (card.augments || []).map((a) => `<span style="border-color:${TIERS[a.tier].color}">${a.icon} ${a.name}</span>`).join('');
    $('e-note').textContent = card.busted
      ? 'You held too much while the floor gave way. Keep the tube small and dump early when the board turns against you.'
      : card.pnl >= 250000 ? 'You read the board, flipped the tube, and walked off the floor richer on the worst day in market history.'
      : card.pnl >= 0 ? 'You survived Black Monday with your shirt on. Now try to make it pay: sell into the bounces, buy only to get flat.'
      : 'Cheap prices on a falling board are traps. Trade with the move, and use the heat meter as your exit signal.';
  }
}

// Intraday chart: futures bars, cash index, and (on the scorecard) your equity curve.
export function drawChart(cv, bars, sim, opts = {}) {
  const g = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  g.clearRect(0, 0, W, H);
  g.fillStyle = opts.paper ? '#e8dfc8' : '#050403'; g.fillRect(0, 0, W, H);
  const pts = bars.map((b) => ({ t: b.t, c: b.c, h: b.h, l: b.l, cash: b.cash }));
  if (sim) pts.push({ t: sim.t, c: sim.lastPx, h: sim.lastPx, l: sim.lastPx, cash: sim.cash });
  if (pts.length < 2) return;
  let lo = Infinity, hi = -Infinity;
  for (const p of pts) { lo = Math.min(lo, p.l, p.cash ?? p.l); hi = Math.max(hi, p.h, p.cash ?? p.h, PREV_SETTLE); }
  const pad = (hi - lo) * 0.08 + 0.5; lo -= pad; hi += pad;
  const L = opts.compact ? 8 : 70, R = opts.compact ? 70 : 90, T = opts.compact ? 10 : 20, B = opts.compact ? 18 : 34;
  const x = (t) => L + (t / SESSION_MIN) * (W - L - R);
  const y = (p) => T + (1 - (p - lo) / (hi - lo)) * (H - T - B);
  const fs = opts.compact ? 18 : 22;
  g.font = `700 ${fs}px "Courier New", monospace`;
  // Grid
  g.strokeStyle = 'rgba(255,181,46,0.09)'; g.lineWidth = 1;
  const step = (hi - lo) > 60 ? 20 : (hi - lo) > 25 ? 10 : 5;
  g.fillStyle = 'rgba(255,181,46,0.5)';
  for (let v = Math.ceil(lo / step) * step; v < hi; v += step) {
    g.beginPath(); g.moveTo(L, y(v)); g.lineTo(W - R, y(v)); g.stroke();
    g.fillText(String(v), W - R + 6, y(v) + 6);
  }
  // Prior settle
  g.setLineDash([8, 8]); g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.beginPath(); g.moveTo(L, y(PREV_SETTLE)); g.lineTo(W - R, y(PREV_SETTLE)); g.stroke(); g.setLineDash([]);
  // Cash
  g.strokeStyle = 'rgba(220,220,220,0.55)'; g.lineWidth = opts.compact ? 2 : 3;
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(x(p.t), y(p.cash)) : g.moveTo(x(p.t), y(p.cash)))); g.stroke();
  // Futures
  g.strokeStyle = opts.paper ? '#1a1612' : '#ffb52e'; g.lineWidth = opts.compact ? 3 : 4;
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(x(p.t), y(p.c)) : g.moveTo(x(p.t), y(p.c)))); g.stroke();
  // Equity curve on its own axis
  if (opts.curve && opts.curve.length > 1) {
    const eqs = opts.curve.map((c) => c.equity);
    let elo = Math.min(...eqs, 0), ehi = Math.max(...eqs);
    const ep = (ehi - elo) * 0.1 + 1; elo -= ep; ehi += ep;
    const ey = (v) => T + (1 - (v - elo) / (ehi - elo)) * (H - T - B);
    g.strokeStyle = '#3dff6e'; g.lineWidth = 3;
    g.beginPath(); opts.curve.forEach((c, i) => (i ? g.lineTo(x(c.t), ey(c.equity)) : g.moveTo(x(c.t), ey(c.equity)))); g.stroke();
    g.fillStyle = 'rgba(61,255,110,0.75)';
    for (const v of [ehi - ep, (ehi + elo) / 2, elo + ep]) g.fillText(`$${Math.round(v / 1000)}k`, 4, ey(v) + 6);
  }
  if (opts.compact) {
    g.fillStyle = '#ffb52e'; g.fillText('FUT', L + 4, H - 2);
    g.fillStyle = '#ccc'; g.fillText('CASH', L + 60, H - 2);
  } else {
    const bw = 260, bx = W - R - bw - 10, by = T + 8, rows = [['#ffb52e', 'S&P FUTURES'], ['#ccc', 'NYSE CASH'], ...(opts.curve ? [['#3dff6e', 'YOUR EQUITY (left $)']] : [])];
    g.fillStyle = 'rgba(5,4,3,0.85)'; g.fillRect(bx, by, bw, 14 + rows.length * 28);
    rows.forEach(([c, t], i) => { g.fillStyle = c; g.fillRect(bx + 12, by + 16 + i * 28, 22, 5); g.fillText(t, bx + 44, by + 26 + i * 28); });
  }
  if (!opts.compact) {
    g.fillStyle = 'rgba(255,181,46,0.6)';
    for (const [m, lbl] of [[0, '8:30'], [90, '10:00'], [210, '12:00'], [330, '14:00'], [405, '15:15']]) g.fillText(lbl, x(m) - 20, H - 8);
  }
}
