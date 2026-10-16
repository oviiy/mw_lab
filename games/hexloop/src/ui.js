import { MODS, TIER, CORES, ENEMY_INFO, FINAL, BOSS_EVERY, coreOf, HEAT, actOf, actInfo } from './game.js';
import { MOD_ICON, ENEMY_ICON, UI_ICON, hexPip } from './icons.js';
import { TUTORIAL } from './levels.js';

const $ = (s) => document.querySelector(s);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

export class UI {
  constructor() {
    this.screens = $('#screens'); this.floats = $('#floats');
    $('#pauseBtn').innerHTML = UI_ICON.pause;
    $('#undoBtn').insertAdjacentHTML('afterbegin', UI_ICON.undo);
    $('#waitBtn .wi').innerHTML = UI_ICON.wait;
    this.shownScore = 0; this.score = 0; this.lastHp = null; this.chip = null; this.hintKey = '';
    this.onAction = () => {};
    this.screens.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) this.onAction(b.dataset.a, b.dataset.v, b); });
    $('#mods').addEventListener('click', (e) => { const b = e.target.closest('[data-mod]'); if (b) { const m = MODS[b.dataset.mod]; this.toast(`<b>${m.n}</b> — ${m.d}`, 2600); } });
  }

  // ---------------------------------------------------------------- HUD
  hud(run, meta, tailLen, enemiesLeft, canUndo) {
    if (!run) return;
    const tut = run.mode === 'tutorial';
    let hp = '';
    for (let i = 0; i < run.maxHp; i++) hp += hexPip(i < run.hp);
    const hpEl = $('#hp'); hpEl.innerHTML = hp;
    if (this.lastHp !== null && run.hp < this.lastHp) { const p = hpEl.children[run.hp]; if (p) p.classList.add('lost'); }
    this.lastHp = run.hp;
    // sector
    let bar = '';
    if (tut) { for (let i = 0; i < TUTORIAL.length; i++) bar += `<i class="${i < run.tut ? 'done' : i === run.tut ? 'cur' : ''}"></i>`; }
    else { const base = Math.floor((run.sector - 1) / FINAL) * FINAL; for (let s = base + 1; s <= base + FINAL; s++) bar += `<i class="${s % BOSS_EVERY === 0 ? 'boss ' : ''}${s < run.sector ? 'done' : s === run.sector ? 'cur' : ''}"></i>`; }
    $('#secBar').innerHTML = bar;
    $('#secLabel').innerHTML = tut ? `TUTORIAL <em>${run.tut + 1}/${TUTORIAL.length}</em>`
      : run.boss ? `<span class="boss">BOSS</span> <em>· ${(ENEMY_INFO[run.bossType] || ENEMY_INFO.hive).n.toUpperCase()} ${'◆'.repeat(Math.max(0, Math.min(9, enemiesLeft)))}</em>`
      : `ACT ${actOf(run.sector) + 1} · ${run.sector} <em>· ${enemiesLeft} left</em>`;
    this.score = run.score;
    // tail meter
    const n = run.tail.length;
    let segs = '';
    for (let i = 0; i < tailLen; i++) segs += `<i class="${i < n ? 'on' : ''}${i === 0 && n >= tailLen ? ' old' : ''}"></i>`;
    $('#tailSegs').innerHTML = segs; $('#tailNum').textContent = `${n}/${tailLen}`;
    $('#mods').innerHTML = Object.keys(run.mods).map((id) => {
      const used = (id === 'aegis' && run.shieldUsed) || (id === 'secondwind' && run.swUsed) || (id === 'strike' && run.strikeUsed);
      return `<button class="mod-chip ${used ? 'used' : ''}" data-mod="${id}" title="${MODS[id].n}">${MOD_ICON[id]}${run.mods[id] > 1 ? `<sup>${run.mods[id]}</sup>` : ''}</button>`;
    }).join('') + (run.dash ? `<span class="mod-chip" title="Dash charges">${MOD_ICON.overclock}<sup>${run.dash}</sup></span>` : '');
    $('#undoBtn').disabled = !canUndo; $('#undoBadge').textContent = run.undoLeft;
    $('#skipTut').hidden = !(tut && meta.tutorialDone);
  }
  hint(html) {
    const el = $('#hint'), t = $('#hintText');
    if (this.hintKey === html) return;
    this.hintKey = html; t.innerHTML = html; el.hidden = !html;
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  combo(n) { const c = $('#combo'); c.textContent = n > 1 ? `COMBO ×${n}` : ''; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
  tick(dt) {
    if (this.shownScore !== this.score) {
      const d = this.score - this.shownScore;
      this.shownScore += Math.sign(d) * Math.max(1, Math.abs(d) * Math.min(1, dt * 8));
      if (Math.abs(this.score - this.shownScore) < 1) this.shownScore = this.score;
      $('#score').textContent = fmt(this.shownScore);
    }
  }
  resetScore(v) { this.score = this.shownScore = v; $('#score').textContent = fmt(v); this.lastHp = null; }
  hurtFx() { const v = $('#vignette'); v.classList.remove('hit'); void v.offsetWidth; v.classList.add('hit'); }
  float(x, y, text, color, { big = false, fly = false } = {}) {
    const el = document.createElement('div');
    el.className = 'float' + (big ? ' big' : ''); el.textContent = text; el.style.color = color; el.style.left = x + 'px'; el.style.top = y + 'px';
    this.floats.appendChild(el);
    if (fly) {
      setTimeout(() => {
        const r = $('#score').getBoundingClientRect();
        el.classList.add('fly'); el.style.left = r.left + r.width / 2 + 'px'; el.style.top = r.top + r.height / 2 + 'px'; el.style.transform = 'translate(-50%,-50%) scale(.5)'; el.style.opacity = '0.2';
      }, 520);
      setTimeout(() => el.remove(), 1150);
    } else setTimeout(() => el.remove(), 1150);
  }
  previewChip(x, y, html, cls = '') {
    if (!html) { if (this.chip) { this.chip.remove(); this.chip = null; } return; }
    if (!this.chip) { this.chip = document.createElement('div'); this.floats.appendChild(this.chip); }
    this.chip.className = 'pv-chip ' + cls; this.chip.innerHTML = html; this.chip.style.left = x + 'px'; this.chip.style.top = y + 'px';
  }
  toast(html, ms = 1800) { const t = $('#toast'); t.innerHTML = html; t.classList.add('show'); clearTimeout(this.tt); this.tt = setTimeout(() => t.classList.remove('show'), ms); }
  banner(n, title) {
    const el = document.createElement('div'); el.className = 'tut-banner';
    el.innerHTML = `<div class="n">${n}</div><div class="t">${title}</div>`; this.floats.appendChild(el); setTimeout(() => el.remove(), 1700);
  }

  // ---------------------------------------------------------------- screens
  show(html, { dim = true, name = '' } = {}) { this.screens.innerHTML = `<div class="screen ${dim ? 'dim' : ''}" data-name="${name}">${html}</div>`; this.current = name; }
  hide() { this.screens.innerHTML = ''; this.current = ''; }
  get open() { return !!this.current; }

  title(meta, hasRun, run, today) {
    const d = meta.daily, dailyDone = d && d.date === today && d.done, dailyLive = hasRun && run.mode === 'daily';
    const streak = meta.streak && meta.streak.n ? `<small>${UI_ICON.flame.replace('<svg', '<svg style="width:14px;height:14px;display:inline;vertical-align:-2px"')} ${meta.streak.n}</small>` : '';
    const primary = hasRun && run.mode !== 'tutorial'
      ? `<button class="btn primary" data-a="continue">${UI_ICON.play} CONTINUE <small>${run.mode === 'daily' ? 'DAILY · ' : ''}SECTOR ${run.sector}</small></button>`
      : !meta.tutorialDone ? `<button class="btn primary" data-a="tutorial">${UI_ICON.play} PLAY</button>`
      : `<button class="btn primary" data-a="new">${UI_ICON.play} NEW RUN <small>${coreOf(meta.core).n.toUpperCase()}</small></button>`;
    this.show(`<div class="title-wrap">
      <div class="emblem"><svg viewBox="0 0 92 92"><path class="ring" d="M46 8l33 19v38L46 84 13 65V27z" fill="none" stroke="#3de8ff" stroke-width="4"/><circle cx="46" cy="46" r="9" fill="#ffb547"/><circle class="dot" cx="46" cy="14" r="5" fill="#e9fdff"/></svg></div>
      <div class="logo">HEXLOOP</div>
      <div class="tagline">Loop them. Pop them.</div>
      ${primary}
      ${hasRun && run.mode !== 'tutorial' ? `<button class="btn" data-a="new">NEW RUN <small>${coreOf(meta.core).n.toUpperCase()}</small></button>` : ''}
      <div class="row">
        ${dailyDone ? `<button class="btn gold" data-a="share">${UI_ICON.calendar} ${fmt(d.score)} ${streak}</button>` : dailyLive ? '' : `<button class="btn gold" data-a="daily">${UI_ICON.calendar} DAILY ${streak}</button>`}
        <button class="btn" data-a="cores">${UI_ICON.core} CORES <small>${UI_ICON.shard.replace('<svg', '<svg style="width:12px;height:12px;display:inline;color:#ffb547"')}${meta.shards}</small></button>
      </div>
      ${meta.heat ? `<div class="heat-row">${HEAT.slice(0, meta.heat + 1).map((h, i) => `<button class="heat ${i === (meta.heatSel || 0) ? 'on' : ''}" data-a="heat" data-v="${i}" title="${h.d}">${i ? '🔥' + i : 'NORMAL'}</button>`).join('')}</div>` : ''}
      <div class="row"><button class="btn" data-a="tutorial">HOW TO PLAY</button><button class="btn" data-a="codex">${UI_ICON.book} CODEX</button><button class="btn" data-a="settings">${UI_ICON.gear}</button></div>
      <div class="foot">BEST ${fmt(meta.best)} · SECTOR ${meta.bestSector}${meta.bestEndless ? ` · ENDLESS ${meta.bestEndless}` : ''}${meta.heat ? ` · HEAT ${meta.heatSel || 0}: ${HEAT[meta.heatSel || 0].d}` : ''}</div>
    </div>`, { dim: true, name: 'title' });
  }
  pause(meta) {
    this.show(`<div class="card glass"><div class="kicker">PAUSED</div><h2>Take a breath</h2>
      <button class="btn primary" data-a="resume">RESUME</button>
      <div class="row"><button class="btn" data-a="mute">SOUND ${meta.muted ? 'OFF' : 'ON'}</button><button class="btn" data-a="music">MUSIC ${meta.music ? 'ON' : 'OFF'}</button></div>
      <button class="btn" data-a="tutorial">REPLAY TUTORIAL</button>
      <button class="btn" data-a="title">MAIN MENU</button>
      <button class="btn danger" data-a="abandon">ABANDON RUN</button>
      <div class="foot">Drag to draw a path · Tap a hex to walk there · Saved after every move</div></div>`, { name: 'pause' });
  }
  pick(run) {
    const cards = run.choices.map((id) => `<button class="mod-card tier-${MODS[id].t}" data-a="choose" data-v="${id}"><span class="mi">${MOD_ICON[id]}</span><span><small class="tl">${TIER[MODS[id].t].n}</small><b>${MODS[id].n}${run.mods[id] ? ' +' : ''}</b><span class="d">${MODS[id].d}</span></span></button>`).join('');
    const next = run.sector + 1, tier = TIER[run.choiceTier || 'silver'];
    this.show(`<div class="card glass"><div class="kicker">SECTOR ${run.sector} CLEARED</div><h2>Choose a <span style="color:${tier.c}">${tier.n.toLowerCase()}</span> augment</h2>
      <div>${cards}
      ${run.hp < run.maxHp ? `<button class="mod-card heal" data-a="choose" data-v="repair"><span class="mi">${MOD_ICON.repair}</span><span><b>Repair</b><span class="d">Restore 1 HP instead.</span></span></button>` : ''}</div>
      <div class="foot">NEXT · ${next % BOSS_EVERY === 0 ? `<span style="color:var(--danger)">BOSS: THE ${ENEMY_INFO[actInfo(next).boss].n.toUpperCase()}</span>` : `ACT ${actOf(next) + 1} · ${actInfo(next).n.toUpperCase()} · SECTOR ${next}`}</div></div>`, { name: 'pick' });
  }
  enemy(type) {
    const info = ENEMY_INFO[type];
    this.show(`<div class="card glass enemy-card"><div class="kicker d">NEW THREAT</div><div class="ei ${type === 'eater' ? 'purple' : ''}">${ENEMY_ICON[type]}</div>
      <h2>${info.n}</h2><p class="lead">${info.d}</p><button class="btn primary" data-a="enemyOk">GOT IT</button></div>`, { name: 'enemy' });
  }
  over(sum, unlock, canUndo, undoLeft, canEndless = false) {
    const pct = unlock ? Math.min(100, (unlock.have / unlock.need) * 100) : 100;
    const ready = unlock && unlock.have >= unlock.need;
    this.show(`<div class="card glass">
      <div class="kicker ${sum.won ? '' : 'd'}" style="text-align:center">${sum.won ? 'ALL SECTORS CLEAR' : sum.endless ? `ENDLESS · REACHED SECTOR ${sum.sector}` : 'LOOP BROKEN'}</div>
      <div class="big-score" id="overScore">0</div>
      ${sum.newBest ? '<div style="text-align:center"><span class="badge-new">NEW BEST</span></div>' : ''}
      ${sum.heatUnlocked ? `<div style="text-align:center;margin-top:6px"><span class="badge-new" style="background:var(--danger);color:#fff">🔥 HEAT ${sum.heatUnlocked} UNLOCKED</span></div>` : ''}
      <div class="emo">${sum.log.join('')}</div>
      <div class="stats"><div class="stat"><b>${sum.sector}</b><span>SECTOR</span></div><div class="stat"><b>${sum.kills}</b><span>POPPED</span></div><div class="stat"><b style="color:var(--amber)">+${sum.shards}</b><span>SHARDS</span></div></div>
      ${unlock ? `<div class="unlock"><div class="ut"><span>${ready ? 'Ready to unlock' : 'Next core'}: <b>${unlock.core.n}</b></span><span>${Math.min(unlock.have, unlock.need)}/${unlock.need}</span></div><div class="bar"><i id="ubar" style="width:0%"></i></div></div>` : ''}
      ${canEndless ? '<button class="btn gold" data-a="endless">∞ CONTINUE IN ENDLESS</button>' : ''}
      ${canUndo ? `<button class="btn" data-a="undoDeath">${UI_ICON.undo} UNDO LAST MOVE <small>${undoLeft} left</small></button>` : ''}
      ${sum.mode === 'daily' ? `<button class="btn gold" data-a="share">SHARE DAILY</button>` : `<button class="btn primary" data-a="again">RUN AGAIN</button>`}
      <div class="row">${ready ? '<button class="btn gold" data-a="cores">UNLOCK</button>' : ''}<button class="btn" data-a="title">MENU</button></div>
    </div>`, { name: 'over' });
    requestAnimationFrame(() => { const b = $('#ubar'); if (b) b.style.width = pct + '%'; });
    const el = $('#overScore'), t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 1100); el.textContent = fmt(sum.score * (1 - Math.pow(1 - k, 3))); if (k < 1 && document.body.contains(el)) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  tutDone() {
    this.show(`<div class="card glass" style="text-align:center"><div class="kicker">TUTORIAL COMPLETE</div><h2>You've got the loop.</h2>
      <p class="lead">Now the real thing: 9 sectors, upgrades after each one, and a Hive boss every 3rd sector. Shards unlock new cores.</p>
      <button class="btn primary" data-a="new">${UI_ICON.play} START RUN</button></div>`, { name: 'tutdone' });
  }
  cores(meta) {
    const list = CORES.map((c) => {
      const own = meta.unlocked.includes(c.id), sel = meta.core === c.id;
      const b = sel ? '<button class="btn" disabled>IN USE</button>' : own ? `<button class="btn" data-a="pickcore" data-v="${c.id}">USE</button>`
        : `<button class="btn gold" data-a="buycore" data-v="${c.id}" ${meta.shards < c.cost ? 'disabled' : ''}>◆ ${c.cost}</button>`;
      return `<div class="core-card ${sel ? 'sel' : ''}"><div class="ci" style="color:${c.color};background:${c.color}22">${UI_ICON.core}</div><div class="cb"><b>${c.n}</b><p>${c.d}</p></div>${b}</div>`;
    }).join('');
    this.show(`<div class="card glass"><div class="kicker">CORES · ◆ ${meta.shards}</div><h2>Choose your spark</h2>${list}<button class="btn" data-a="title">BACK</button></div>`, { name: 'cores' });
  }
  codex(meta) {
    const en = Object.keys(ENEMY_INFO).map((t) => { const seen = meta.seen.includes(t); return `<div class="cx ${seen ? '' : 'locked'}"><span class="ci2" style="color:${t === 'eater' ? 'var(--purple)' : 'var(--danger)'}">${ENEMY_ICON[t]}</span><span><b>${seen ? ENEMY_INFO[t].n : '???'}</b><small>${seen ? ENEMY_INFO[t].d : 'Not met yet.'}</small></span></div>`; }).join('');
    const mods = ['silver', 'gold', 'prism'].map((tier) => `<div class="cx-h" style="color:${TIER[tier].c}">${TIER[tier].n}</div>` + Object.keys(MODS).filter((id) => MODS[id].t === tier).map((id) => { const seen = (meta.seenMods || []).includes(id); return `<div class="cx ${seen ? '' : 'locked'}"><span class="ci2" style="color:${TIER[tier].c}">${MOD_ICON[id]}</span><span><b>${seen ? MODS[id].n : '???'}</b><small>${seen ? MODS[id].d : 'Find it in a run.'}</small></span></div>`; }).join('')).join('');
    const nEn = meta.seen.length, nMods = (meta.seenMods || []).length;
    this.show(`<div class="card glass codex"><div class="kicker">CODEX</div><h2>Enemies ${nEn}/${Object.keys(ENEMY_INFO).length} · Augments ${nMods}/${Object.keys(MODS).length}</h2>
      <div class="cx-h">ENEMIES & BOSSES</div>${en}<div class="cx-h" style="margin-top:14px">HEX AUGMENTS</div>${mods}<button class="btn" data-a="title">BACK</button></div>`, { name: 'codex' });
  }
  settings(meta, msg = '') {
    this.show(`<div class="card glass"><div class="kicker">SETTINGS</div><h2>Options</h2>
      <button class="toggle" data-a="mute">Sound <i>${meta.muted ? 'OFF' : 'ON'}</i></button>
      <button class="toggle" data-a="music">Music <i>${meta.music ? 'ON' : 'OFF'}</i></button>
      <button class="toggle" data-a="gfx">Graphics <i>${meta.gfx === 'low' ? 'BATTERY SAVER' : 'HIGH'}</i></button>
      <div class="foot" style="text-align:left;margin-top:16px">MOVE YOUR SAVE BETWEEN PHONE AND LAPTOP</div>
      <textarea id="saveCode" placeholder="Paste a save code, then tap Import"></textarea>
      <div class="row"><button class="btn" data-a="export">EXPORT</button><button class="btn" data-a="import">IMPORT</button></div>
      ${msg ? `<div class="foot" style="color:var(--amber)">${msg}</div>` : ''}
      <button class="btn danger" data-a="reset">RESET PROGRESS</button>
      <button class="btn" data-a="title">BACK</button></div>`, { name: 'settings' });
  }
  confirm(text, yes, yesLabel = 'YES') {
    this.show(`<div class="card glass"><h2>Are you sure?</h2><p class="lead">${text}</p><button class="btn danger" data-a="${yes}">${yesLabel}</button><button class="btn" data-a="back">CANCEL</button></div>`, { name: 'confirm' });
  }
}
