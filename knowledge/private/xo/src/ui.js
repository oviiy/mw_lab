// DOM side: HUD, world-anchored bubbles and numbers, the 海克斯 picker and the screens.
import * as THREE from 'three';
import { AUGMENTS, STAT_UPGRADES, TIER_NAME, SUBTITLE, ENEMY_NAMES, HERO, HUBBY, WAVES, PICKUPS, BUILD_PATHS } from './config.js';
import { xpNeed } from './game.js';

const $ = (id) => document.getElementById(id);
const AUG = Object.fromEntries(AUGMENTS.map((a) => [a.id, a]));
const STAT = Object.fromEntries(STAT_UPGRADES.map((a) => [a.id, a]));

export function createUI(camera) {
  const labels = $('labels');
  $('tagline').textContent = SUBTITLE;
  // the cast on the title screen: one row per role, each name its own chip
  const pills = (names, cls) => names.map((n) => `<span class="pill ${cls}">${n}</span>`).join('');
  const foes = ['durian', 'ginger', 'orange', 'dingding', 'oyster', 'goat', 'caesar', 'chenwei', 'jia', 'yi', 'guo', 'thief', 'mao'].map((k) => ENEMY_NAMES[k]);
  $('cast').innerHTML = `<div class="row"><b>主角</b>${pills([HERO], 'hero')}<b>队友</b>${pills([HUBBY], 'mate')}</div>`
    + `<div class="row"><b>对手</b>${pills(foes, 'foe')}</div>`
    + `<div class="row"><b>Boss</b>${pills([ENEMY_NAMES.bigmao, ENEMY_NAMES.judge], 'boss')}</div>`;

  const v = new THREE.Vector3();
  function project(x, h, y) {
    v.set(x, h, -y).project(camera);
    return [(v.x * 0.5 + 0.5) * innerWidth, (-v.y * 0.5 + 0.5) * innerHeight, v.z < 1];
  }
  const place = (el, x, h, y) => { const [sx, sy, ok] = project(x, h, y); el.style.left = sx + 'px'; el.style.top = sy + 'px'; el.style.display = ok ? '' : 'none'; };

  // hero speech bubble
  const bubble = document.createElement('div');
  bubble.className = 'bubble'; bubble.hidden = true;
  labels.appendChild(bubble);
  let bubbleText = '';

  // short-lived world text
  const floats = [];
  function float(cls, text, x, y, h = 1.2, life = 100) {
    if (floats.length > 60) { const old = floats.shift(); old.el.remove(); }
    const el = document.createElement('div');
    el.className = cls; el.textContent = text;
    labels.appendChild(el);
    floats.push({ el, x: x + (Math.random() - 0.5) * 0.4, y, h, life });
  }
  const dmg = (x, y, n, crit) => float('dmg' + (crit ? ' crit' : ''), String(n), x, y, 1.1, 42);
  const pop = (x, y, text, cls) => float('pop ' + (cls || ''), text, x, y, cls === 'ping' ? 0.5 : 1.8, 96);

  // name tags for enemies
  const tags = new Map();

  function updateLabels(g) {
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      if (--f.life <= 0) { f.el.remove(); floats.splice(i, 1); continue; }
      place(f.el, f.x, f.h, f.y);
    }
    const h = g.hero;
    if (h && h.sayT > 0 && (g.state === 'play' || g.state === 'over')) {
      if (bubbleText !== h.say) { bubbleText = h.say; bubble.textContent = h.say; bubble.hidden = false; bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = ''; }
      place(bubble, h.x, 1.55, h.y);
    } else if (!bubble.hidden) { bubble.hidden = true; bubbleText = ''; }

    const seen = new Set();
    const showAll = g.enemies.length < 26;
    for (const e of g.state === 'play' ? g.enemies : []) {
      const boss = e.type === 'judge' || e.type === 'bigmao';
      if (!boss && !e.elite && (!showAll || e.type === 'maoqiu')) continue;
      seen.add(e.id);
      let el = tags.get(e.id);
      if (!el) { el = document.createElement('div'); el.className = 'tag' + (boss || e.elite ? ' boss' : ''); el.textContent = e.name; labels.appendChild(el); tags.set(e.id, el); }
      const hgt = ({ judge: 4.6, bigmao: 3.9, mao: 1.9, jia: 2.4, yi: 2.4, guo: 2.1, thief: 2.1, caesar: 1.9, chenwei: 1.9, dingding: 2.3, ginger: 1.45 }[e.type] || 1.25) * (e.elite ? 1.35 : 1);
      place(el, e.x, hgt, e.y);
    }
    for (const p of g.state === 'play' ? g.pickups || [] : []) {
      const id = 'p' + p.id; seen.add(id);
      let el = tags.get(id);
      if (!el) { el = document.createElement('div'); el.className = 'tag pick'; el.textContent = PICKUPS[p.kind].name; labels.appendChild(el); tags.set(id, el); }
      place(el, p.x, 1.9, p.y);
    }
    for (const [id, el] of tags) if (!seen.has(id)) { el.remove(); tags.delete(id); }
  }

  function clearLabels() { for (const f of floats) f.el.remove(); floats.length = 0; for (const el of tags.values()) el.remove(); tags.clear(); bubble.hidden = true; }

  // ---------- HUD ----------
  let lastAugs = -1;
  function hud(g) {
    const h = g.hero, s = h.s;
    $('hpFill').style.width = Math.max(0, s.hp / s.maxhp * 100) + '%';
    $('hpText').textContent = `${Math.ceil(Math.max(0, s.hp))} / ${s.maxhp}`;
    $('xpFill').style.width = Math.min(100, h.xp / xpNeed(h.lvl) * 100) + '%';
    $('lvl').textContent = 'Lv ' + h.lvl;
    $('shields').innerHTML = '<i></i>'.repeat(h.shields);
    $('waveNum').textContent = `第 ${g.wave} / ${WAVES} 波`;
    const wt = $('waveTime');
    if (g.bossWave) { wt.textContent = 'BOSS'; wt.classList.remove('low'); }
    else if (g.waveT === 0) { wt.textContent = `清场 ${g.enemies.length + g.spawns.length}`; wt.classList.remove('low'); }
    else { const sec = Math.ceil(g.waveT / 60); wt.textContent = `${sec / 60 | 0}:${String(sec % 60).padStart(2, '0')}`; wt.classList.toggle('low', sec <= 5); }
    const bb = $('bossbar');
    if (g.boss) { bb.hidden = false; $('bossName').textContent = g.boss.name + (g.boss.invulnerable > 0 ? ' · 招式中' : ''); $('bossFill').style.width = Math.max(0, g.boss.hp / g.boss.max * 100) + '%'; } else bb.hidden = true;
    $('kills').textContent = '击败 ' + g.kills;
    $('score').firstChild.nodeValue = g.score.toLocaleString();
    const cb = $('combo');
    if (g.combo >= 3) {
      cb.hidden = false;
      if ($('comboN').textContent !== String(g.combo)) { $('comboN').textContent = g.combo; cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
      $('comboBar').style.width = (g.comboT / 150 * 90) + 'px';
    } else cb.hidden = true;
    const ub = $('ultBtn');
    ub.style.setProperty('--p', h.ult);
    ub.classList.toggle('ready', h.ult >= 100);
    if (h.augs.length !== lastAugs) {
      lastAugs = h.augs.length;
      const counts = {};
      for (const id of h.augs) counts[id] = (counts[id] || 0) + 1;
      $('augs').innerHTML = Object.entries(counts).map(([id, n]) => `<i class="${AUG[id].tier}">${AUG[id].name}${n > 1 ? ' ×' + n : ''}</i>`).join('');
    }
  }

  // ---------- screens ----------
  const screens = ['title', 'pick', 'pause', 'over', 'win'];
  function show(state) {
    for (const s of screens) $(s).hidden = s !== state;
    $('hud').hidden = !(state === 'play' || state === 'pause' || state === 'pick');
    if (state === 'title') lastAugs = -1;
  }

  function banner(title, sub, boss) {
    const b = $('banner');
    $('bannerTitle').textContent = title; $('bannerSub').textContent = sub || '';
    b.className = ''; void b.offsetWidth; b.className = 'show' + (boss ? ' boss' : '');
  }

  let pickKey = '';
  function renderPick(g, onPick) {
    const isStat = g.offer.kind === 'stat';
    const key = g.offer.kind + g.offer.list.join() + g.picks + g.rerolls;
    if (key === pickKey) return;
    pickKey = key;
    const tier = isStat ? 'stat' : g.offer.tier;
    const em = $('pickTier');
    $('pickTitle').textContent = isStat ? '基础升级' : '海克斯强化';
    em.textContent = isStat ? '1 / 2' : TIER_NAME[tier] + ' · 2 / 2'; em.className = tier;
    $('pickSub').textContent = isStat ? `${HUBBY}：先练一项本事，再选海克斯` : `${HUBBY}：再选一个海克斯吧 · 本局倾向 ${BUILD_PATHS[g.meta.focus]}`;
    const lw = g.lastWave;
    const s = g.hero.s;
    const stats = isStat ? `<span>子弹 ${s.count} 发</span><span>伤害 ${s.dmg.toFixed(1)}</span><span>生命 ${Math.ceil(s.hp)}/${s.maxhp}</span><span>恢复 ${s.regen}/6 秒</span>` : '';
    $('summary').innerHTML = (lw ? `<span class="rate ${lw.rating}">${lw.rating}</span><span>第 ${lw.n} 波完成</span><span>击败 ${lw.kills}</span><span>最高连杀 ${lw.best}</span><span>自动拾取 ${lw.gems} 糖果 · ${lw.supplies} 补给</span>${lw.bonus ? `<span>评价奖励 +${lw.bonus}</span>` : ''}${lw.reroll ? '<span>无伤：海克斯重掷 +1</span>' : ''}` : '') + stats;
    const own = (id) => (isStat ? g.hero.statUps : g.hero.augs).filter((a) => a === id).length;
    $('cards').innerHTML = g.offer.list.map((id, i) => {
      const a = isStat ? STAT[id] : AUG[id];
      return `<button class="card ${tier}" data-i="${i}"><div class="in"><div class="hex" aria-hidden="true">${a.icon}</div><div><h3>${a.name}</h3><p>${a.desc}</p>${own(id) ? `<div class="own">已拥有 ×${own(id)}</div>` : ''}</div></div><kbd>${i + 1}</kbd></button>`;
    }).join('');
    for (const el of $('cards').children) el.onclick = () => onPick(Number(el.dataset.i));
    const rb = $('rerollBtn');
    rb.parentElement.hidden = isStat;
    rb.textContent = `换一批（剩 ${g.rerolls} 次）`;
    rb.disabled = g.rerolls <= 0; rb.style.opacity = g.rerolls > 0 ? 1 : 0.5;
  }
  const resetPick = () => { pickKey = ''; };

  function stats(g) {
    const h = g.hero;
    let oldBest = 0;
    try { oldBest = Number(localStorage.getItem('xo.best') || 0); } catch { /* Browsers may disable storage. */ }
    const best = Math.max(g.score, oldBest);
    try { localStorage.setItem('xo.best', best); } catch { /* The run still works without storage. */ }
    const rows = [[g.score.toLocaleString(), '甜度' + (g.score > oldBest ? '（新纪录！）' : '')], [best.toLocaleString(), '最佳甜度'], ['+' + g.earned, '本局糖票'], [g.meta.points, '持有糖票'], [g.wave + ' / ' + WAVES, '波次'], [g.kills, '击败'], [g.bestCombo, '最高连杀'], [g.hitsTotal, '我箭中了（次）']];
    return rows.map(([b, s]) => `<div><b>${b}</b><small>${s}</small></div>`).join('');
  }
  function renderOver(g) { $('overTitle').textContent = g.overQuote; $('overStats').innerHTML = stats(g); }
  function renderWin(g) { $('winStats').innerHTML = stats(g); }

  function toast(text, cls = '', color) {
    const box = $('toasts');
    if (box.children.length > 3) box.firstChild.remove();
    const el = document.createElement('div');
    el.className = 'toast ' + cls; el.textContent = text;
    if (color) el.style.setProperty('--c', color);
    box.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
  function streak(text, n, tier) {
    const s = $('streak');
    $('streakT').textContent = text; $('streakP').textContent = `${n} 连杀`;
    s.className = ''; void s.offsetWidth; s.className = 'show t' + tier;
  }

  function hurtFlash() { const f = $('hurtFlash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 60); }

  return { updateLabels, clearLabels, hud, show, banner, renderPick, resetPick, renderOver, renderWin, dmg, pop, hurtFlash, toast, streak };
}
