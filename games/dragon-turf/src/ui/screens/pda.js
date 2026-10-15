import { Screen } from '../screens.js';
import { FACTIONS } from '../../data/factions.js';
import { GOODS, DISTRICT_NAMES } from '../../data/goods.js';
import { MISSION_BY_ID } from '../../data/missions.js';
import { fmtMoney, pad2 } from '../../core/math.js';

const TABS = [['map', 'MAP'], ['jobs', 'MISSIONS'], ['crew', 'CREW'], ['trade', 'DEALERS'], ['stats', 'PROGRESS']];

// The in-game phone: city map with turf control, jobs, crew income, market intel, stats.
export class PdaScreen extends Screen {
  open(props = {}) {
    this.tab = props.tab || 'map'; this.t = 0;
    this.html(`<div class="panel pda"><div class="pda-head"><h2>PDA</h2><div class="tabs">${TABS.map(([k, n]) => `<div class="tab" data-t="${k}"><span>${n}</span></div>`).join('')}</div><div class="pda-clock">${this.game.clock.label()} · Day ${this.game.clock.day}</div></div><div class="pda-body"></div><div class="hint pda-foot"><kbd>Tab</kbd> close · click the map to place a waypoint · right-click to clear</div></div>`);
    this.$$('.tab').forEach((t) => t.addEventListener('click', () => { this.tab = t.dataset.t; this.game.audio.ui('tick'); this.render(); }));
    this.render();
  }
  render() {
    this.$$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.t === this.tab));
    const b = this.$('.pda-body'); b.innerHTML = ''; this.mapCanvas = null; this['tab_' + this.tab](b);
  }
  update(dt) { this.t += dt; if (this.tab === 'map' && this.mapCanvas) this.drawMap(); }
  onKey(e) { if (e.code === 'Tab' || e.code === 'KeyM') { this.close(); return true; } const n = +e.key; if (n >= 1 && n <= TABS.length) { this.tab = TABS[n - 1][0]; this.render(); return true; } return false; }

  /* ---------- map ---------- */
  tab_map(b) {
    const g = this.game, world = g.world;
    b.innerHTML = `<div class="map-wrap"><canvas class="map" width="900" height="760"></canvas><div class="map-side"></div></div>`;
    const cv = this.mapCanvas = b.querySelector('canvas'); this.side = b.querySelector('.map-side');
    this.mapCtx = cv.getContext('2d'); this.hover = null;
    const toWorld = (e) => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (cv.width / r.width), y = (e.clientY - r.top) * (cv.height / r.height); return { x: (x - this.tf.ox) / this.tf.S, y: (y - this.tf.oy) / this.tf.S }; };
    cv.addEventListener('mousemove', (e) => { if (!this.tf) return; const p = toWorld(e), id = world.turfAtPx(p.x, p.y); this.hover = id >= 0 ? world.turfs[id] : null; this.updateSide(); });
    cv.addEventListener('click', (e) => { if (!this.tf) return; const p = toWorld(e); g.waypoint = { x: p.x, y: p.y }; g.audio.ui('ok'); g.hud.toast('Waypoint set', 1400); });
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); g.waypoint = null; });
    this.updateSide();
  }
  updateSide() {
    const g = this.game, t = this.hover, owned = g.turf.owned();
    const legend = Object.values(FACTIONS).filter((f) => f.id !== 'none').map((f) => `<div class="lg"><i style="background:${f.color}"></i>${f.name} <b>${g.world.turfs.filter((q) => q.owner === f.id).length}</b></div>`).join('');
    let info = `<div class="hint">Hover a district</div>`;
    if (t) { const f = FACTIONS[t.owner]; info = `<div class="turf-card" style="border-color:${f.color}"><div class="tn">${t.name}</div><div style="color:${f.color};font-family:var(--font);letter-spacing:.1em;font-size:12px">${f.name.toUpperCase()}</div><div class="hint" style="margin-top:6px">Income ${t.income ? fmtMoney(t.income) + '/hr' : '—'}${t.underAttack ? '<br><span style="color:#ff6a5a">UNDER ATTACK</span>' : ''}</div></div>`; }
    const keys = `<div class="legend2"><span><b style="color:#ffd23a">☯ ☎</b> contacts</span><span><b style="color:#2fd07a">⌂</b> safehouse</span><span><b style="color:#ff8a2a">✦</b> arms</span><span><b style="color:#ff5a5a">+</b> clinic</span><span><b style="color:#c26bff">✎</b> respray</span><span><b style="color:#7fd8ff">⚙</b> chop shop</span><span><b>⚑</b> hideouts</span><span><b style="color:#ffd23a">$</b> dealers</span><span><b style="color:#37e6ff">✈</b> airbase: plane &amp; heli</span><span><b style="color:#9acd32">★</b> tank yard</span><span><b style="color:#5fd0e0">⚓</b> boats</span></div>`;
    this.side.innerHTML = `<h3>TURF</h3>${legend}<div class="sep"></div><h3>MAP KEY</h3>${keys}<div class="sep"></div>${info}<div class="sep"></div><div class="hint">Your crew holds <b style="color:#2fd07a">${owned.length}</b> of ${g.world.turfs.length} turfs.<br>Income: <b style="color:#7ed957">${fmtMoney(g.turf.income())}</b>/hr<br>Waiting at safehouse: <b style="color:#7ed957">${fmtMoney(g.turf.stash)}</b></div>`;
  }
  drawMap() {
    const g = this.game, c = this.mapCtx, cv = this.mapCanvas; this.tf = g.hud.mini.drawFull(c, cv.width, cv.height);
    const { S, ox, oy } = this.tf; const tx = (x) => ox + x * S, ty = (y) => oy + y * S;
    if (g.waypoint) { c.save(); c.translate(tx(g.waypoint.x), ty(g.waypoint.y)); c.fillStyle = '#ffd23a'; c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(-7, -16); c.lineTo(7, -16); c.closePath(); c.fill(); c.stroke(); c.restore(); }
    const icon = (x, y, ch, col) => { c.beginPath(); c.arc(tx(x), ty(y), 9, 0, 6.283); c.fillStyle = '#0b0710'; c.fill(); c.lineWidth = 2; c.strokeStyle = col; c.stroke(); c.fillStyle = col; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, tx(x), ty(y) + 0.5); };
    const ICON = { contact: ['', '#ffd23a'], safehouse: ['⌂', '#2fd07a'], shop_gun: ['✦', '#ff8a2a'], hospital: ['+', '#ff5a5a'], spray: ['✎', '#c26bff'], chop: ['⚙', '#7fd8ff'], hideout: ['⚑', '#ffffff'], airfield: ['✈', '#37e6ff'], depot: ['★', '#9acd32'], marina: ['⚓', '#5fd0e0'] };
    for (const q of g.world.pois) { const d = ICON[q.type]; if (!d) continue; icon(q.x, q.y, q.type === 'contact' ? (q.contact === 'wei' ? '☯' : '☎') : q.type === 'hideout' ? '⚑' : d[0], q.type === 'hideout' ? (g.world.turfs[q.turf].owner === 'jade' ? '#2fd07a' : '#ff6a5a') : d[1]); }
    for (const s of g.world.dealerSpots || []) icon(s.x, s.y, '$', '#ffd23a');
    for (const k of g.missions.markers()) if (!k.small) { c.beginPath(); c.arc(tx(k.x), ty(k.y), 7 + Math.sin(this.t * 6) * 2, 0, 6.283); c.lineWidth = 3; c.strokeStyle = k.color; c.stroke(); }
    if (this.hover) { const t = this.hover; c.strokeStyle = '#fff'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.arc(tx(t.cx), ty(t.cy), 26, 0, 6.283); c.stroke(); c.setLineDash([]); }
  }

  /* ---------- jobs ---------- */
  tab_jobs(b) {
    const g = this.game, rows = g.missions.allStates();
    const order = { active: 0, available: 1, locked: 2, done: 3 };
    rows.sort((a, c) => order[a.state] - order[c.state]);
    b.innerHTML = `<div class="list">${rows.map(({ def, state }) => {
      const pill = state === 'done' ? '<span class="pill good">DONE</span>' : state === 'active' ? '<span class="pill gold">ACTIVE</span>' : state === 'locked' ? '<span class="pill bad">LOCKED</span>' : '<span class="pill gold">AVAILABLE</span>';
      const giver = def.giver === 'wei' ? 'Uncle Wei' : 'Madam Lin';
      return `<div class="item" style="${state === 'locked' ? 'opacity:.55' : ''}"><span class="ico">${def.giver === 'wei' ? '☯' : '☎'}</span><div><div class="t">${def.title}</div><div class="d">${def.brief}</div><div class="d" style="color:#c9b87a">${giver} · reward ${fmtMoney(def.reward.cash || 0)}${state === 'locked' ? ' · ' + g.missions.lockReason(def) : ''}</div></div>${pill}</div>`;
    }).join('')}</div><div class="hint" style="margin-top:10px">Visit a contact (☯ Uncle Wei, ☎ Madam Lin, gold on the map) to start a mission. Press <kbd>R</kbd> right after a failure to retry.</div>`;
    void MISSION_BY_ID;
  }

  /* ---------- crew ---------- */
  tab_crew(b) {
    const g = this.game, mine = g.turf.owned();
    b.innerHTML = `<div class="grid2"><div><h3>YOUR TURF</h3><div class="list">${mine.length ? mine.map((t) => `<div class="item"><span class="ico">⚑</span><div><div class="t">${t.name}</div><div class="d">${t.underAttack ? '<span style="color:#ff6a5a">UNDER ATTACK — defend it!</span>' : 'Secure'}</div></div><span class="price">${fmtMoney(t.income)}/hr</span></div>`).join('') : '<div class="hint">You hold no turf. Raid a hideout (⚑) to claim one.</div>'}</div>
      <div class="sep"></div><div class="row"><div><div class="hint">Safehouse stash</div><div class="price" style="font-size:22px">${fmtMoney(g.turf.stash)}</div></div><div class="hint" style="flex:1">Collect it at your safehouse (🏠).</div></div></div>
      <div><h3>THE CREWS</h3><div class="list">${['dragon', 'lotus', 'tiger'].map((id) => { const f = FACTIONS[id], n = g.world.turfs.filter((t) => t.owner === id).length; return `<div class="item" style="border-left:4px solid ${f.color}"><span class="ico" style="color:${f.color}">⚔</span><div><div class="t">${f.name}</div><div class="d">Boss: ${f.boss} · ${n} turf${n === 1 ? '' : 's'}</div></div><span class="pill ${n ? 'bad' : 'good'}">${n ? 'ACTIVE' : 'BROKEN'}</span></div>`; }).join('')}</div></div></div>`;
  }

  /* ---------- market intel ---------- */
  tab_trade(b) {
    const g = this.game, tr = g.trade;
    const head = DISTRICT_NAMES.map((n, i) => `<th class="${g.world.districtAtPx(g.player.x, g.player.y) === i ? 'here' : ''}">${n}</th>`).join('');
    const rows = GOODS.map((gd) => { const cells = DISTRICT_NAMES.map((_, d) => { const p = tr.price(d, gd.id), r = p / gd.base, cls = r > 1.18 ? 'hi' : r < 0.84 ? 'lo' : ''; return `<td class="${cls}">${fmtMoney(p)}</td>`; }).join(''); return `<tr><td class="g">${gd.icon} ${gd.name}<small>${tr.cargo[gd.id]} carried</small></td>${cells}</tr>`; }).join('');
    b.innerHTML = `<div class="hint">Buy where prices are low (<b style="color:#ff7a6a">red</b>), sell where they are high (<b style="color:#7ed957">green</b>). Dealers work the alleys of every district after dark (19:00–05:30): look for <b style="color:#ffd23a">$</b> on the map and yellow dots on the radar.</div>
      <table class="market"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>
      <div class="grid2" style="margin-top:14px"><div><h3>CARGO</h3><div class="hint">${tr.carried}/${tr.capacity} crates · career profit <b style="color:#7ed957">${fmtMoney(tr.profit)}</b></div></div>
      <div><h3>NEWS</h3><div class="list">${tr.news.length ? tr.news.slice(0, 5).map((n) => `<div class="item" style="grid-template-columns:1fr"><div class="d" style="color:${n.spike ? '#7ed957' : '#c9c0e0'}">${n.at} · ${n.msg}</div></div>`).join('') : '<div class="hint">No market news yet.</div>'}</div></div></div>`;
  }

  /* ---------- stats ---------- */
  tab_stats(b) {
    const g = this.game, s = g.stats, hrs = (g.playTime / 3600).toFixed(1);
    const rows = [['Time played', `${hrs} h`], ['Cash on hand', fmtMoney(g.economy.cash)], ['Total earned', fmtMoney(g.economy.earned)], ['Jobs completed', s.jobs], ['Turfs captured', s.turfsTaken], ['Gangsters down', s.gangKills || 0], ['Civilians killed', s.kills], ['Cops killed', s.copKills], ['Cars jacked', s.carjacks], ['Day', g.clock.day], ['Time', g.clock.label()]];
    const pr = g.progress, pct = pr.completion();
    const bar = (a, n) => `<span class="price">${a}/${n}</span>`;
    const goals = [['Story missions', bar(g.missions.done.size, 14)], ['Turfs held', bar(g.turf.owned().length, g.world.turfs.length)], ['Jade Dragons found', bar(pr.found.size, pr.statues.length)], ['Unique stunt jumps', bar(pr.jumps.size, pr.ramps.length)], ['Rampages', bar(pr.rampsDone.size, pr.skulls.length)], ['Best kill streak', `<span class="price">×${pr.bestStreak}</span>`]];
    b.innerHTML = `<div class="grid2"><div><h3>CITY COMPLETION · ${pct}%</h3><div class="xpbar"><i style="width:${pct}%"></i></div>
      <div class="hint" style="margin:8px 0 10px">Rank <b style="color:#7dff6a">${pr.rankName}</b> · ${pr.XP} respect${pr.rank < 11 ? ` · next rank at ${pr.nextXP}` : ''}</div>
      <div class="list">${goals.map(([k, v]) => `<div class="item" style="grid-template-columns:1fr auto"><div class="t">${k}</div>${v}</div>`).join('')}</div>
      <div class="hint" style="margin-top:10px;line-height:1.7">Jade Dragons hide in alleys, parks and piers (rewards at 10/20/30). Yellow ramps are stunt jumps (hit them fast). Red skulls on the radar start rampages. Wreck cop cars to shake off stars.</div></div>
      <div><div class="list">${rows.map(([k, v]) => `<div class="item" style="grid-template-columns:1fr auto"><div class="t">${k}</div><span class="price">${v}</span></div>`).join('')}</div>
      <h3 style="margin-top:12px">CONTROLS</h3><div class="hint" style="line-height:1.9"><kbd>WASD</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> roll / handbrake<br><kbd>LMB</kbd> shoot · <kbd>RMB</kbd> melee / vehicle weapon 2 · <kbd>G</kbd> throw · <kbd>1-9</kbd> weapons<br><kbd>E</kbd> use · <kbd>B</kbd> call backup (rank 5) · <kbd>H</kbd> horn · <kbd>T</kbd> radio<br><kbd>Tab</kbd> PDA · <kbd>Esc</kbd> pause</div></div></div>`;
  }
}
void pad2;
