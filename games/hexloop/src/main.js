import * as G from './game.js';
import { Board } from './scene.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { K, P, hd } from './hex.js';
import { TUTORIAL } from './levels.js';

const SKEY = 'hexloop.v2';
const S = G.S;
const $ = (s) => document.querySelector(s);
const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };

// ---------------------------------------------------------------- save
function load() {
  S.meta = G.defMeta(); let run = null;
  try { const s = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (s && s.meta) { S.meta = Object.assign(G.defMeta(), s.meta); run = s.run || null; } } catch (_) {}
  G.setRun(run);
  if (run && run.phase === 'won') G.finalizeRun();
}
function save() { try { localStorage.setItem(SKEY, JSON.stringify({ v: 2, meta: S.meta, run: S.run })); } catch (_) {} }
load();

// ---------------------------------------------------------------- boot
let board;
try { board = new Board($('#app'), { low: S.meta.gfx === 'low' }); }
catch (e) { $('#fallback').hidden = false; throw e; }
const ui = new UI();
const audio = new Audio(); audio.muted = S.meta.muted; audio.musicOn = S.meta.music;
const view = { legal: new Map(), threat: new Map(), pressed: null, preview: null, tailLen: 8 };
let queue = [], busy = false, pending = null, enemyQueue = [];
const DEMO = { rad: 4, walls: ['2,-2', '-2,2', '-3,0', '3,-1'], tail: [], player: [0, 0], enemies: [], pickups: {}, spawns: [] };

const live = () => !!(S.run && S.run.mode !== 'tutorial' && ['play', 'pick', 'dead'].includes(S.run.phase));
const canInput = () => S.run && S.run.phase === 'play' && !ui.open && !busy;

// ---------------------------------------------------------------- view
function computeView() {
  const r = S.run;
  view.legal = new Map(); view.threat = new Map(); view.preview = null;
  if (!r) return;
  view.tailLen = G.tailLen(); view.threat = G.threatMap();
  if (r.phase === 'play' && !busy) for (const m of G.moves()) { const k = K(m.q, m.r), pv = G.preview(m); view.legal.set(k, { m, pv, live: pv.live, danger: view.threat.has(k) }); }
  if (view.pressed && view.legal.has(view.pressed)) view.preview = view.legal.get(view.pressed).pv;
  else view.pressed = null;
}
function refresh(snap = false) {
  computeView();
  board.sync(S.run, view, { snap });
  hud();
}
function hud() {
  const r = S.run; if (!r) return;
  ui.hud(r, S.meta, G.tailLen(), G.enemiesLeft(), G.canUndo());
  ui.hint(hintFor());
  updateChip();
  const [pq, pr] = r.player;
  const near = r.enemies.filter((e) => !e.sleep && hd(e.q, e.r, pq, pr) <= 2).length;
  audio.intensity = Math.min(1, (r.boss ? 0.5 : 0) + near * 0.25 + (r.hp <= 1 ? 0.3 : 0));
}
function hintFor() {
  const r = S.run;
  if (!r || r.phase !== 'play') return '';
  if (r.mode === 'tutorial') return r.hint;
  if (view.pressed) {
    const lm = view.legal.get(view.pressed);
    if (lm && lm.live) return '<b>Lift to close the loop!</b>';
    if (lm && lm.danger) return '<span class="d">That hex is red: you will take 1 damage.</span>';
  }
  if (view.threat.has(K(r.player[0], r.player[1]))) return '<span class="d">You\'re on red. Move!</span>';
  if ([...view.legal.values()].some((l) => l.live && l.pv.victims.length)) return 'An <b>amber</b> hex closes a loop. Go!';
  if (r.turn < 4) return r.hint;
  if (r.tail.length >= G.tailLen()) return 'Tail full: your oldest segment drops each move.';
  return r.boss ? 'Loop the Hive to damage it.' : `Loop them. ${G.enemiesLeft()} left.`;
}
function updateChip() {
  if (!view.pressed || !S.run) { ui.previewChip(); return; }
  const lm = view.legal.get(view.pressed); if (!lm) { ui.previewChip(); return; }
  if (lm.live) {
    let q = 0, r = 0; for (const k of lm.pv.inside) { const [a, b] = P(k); q += a; r += b; }
    const n = lm.pv.inside.length, [x, y] = board.screenOf(q / n, r / n, 1.2), v = lm.pv.victims.length;
    ui.previewChip(x, y, v ? `LOOP ×${v}` : 'LOOP · LOOT');
  } else if (lm.danger) { const [x, y] = board.screenOf(lm.m.q, lm.m.r, 1.1); ui.previewChip(x, y, '−1 HP', 'hurt'); }
  else ui.previewChip();
}
function setPressed(k) {
  if (view.pressed === k) return;
  view.pressed = k;
  const lm = k && view.legal.get(k);
  if (lm && lm.live) audio.play('ready');
  refresh();
}

// ---------------------------------------------------------------- turns
function at(t, fn) { queue.push({ at: board.gameTime + t, fn }); }
function commit(m) {
  if (!S.run || S.run.phase !== 'play' || ui.open) return;
  if (busy) { pending = m; return; }
  view.pressed = null; ui.previewChip();
  if (!G.doMove(m)) { audio.play('bump'); return; }
  playEvents(G.takeEvents());
}
function commitWait() { if (S.run) commit({ q: S.run.player[0], r: S.run.player[1] }); }
function floatAt(q, r, text, color, opts) { const [x, y] = board.screenOf(q, r); ui.float(x, y, text, color, opts); }

function playEvents(evs) {
  busy = true;
  let t = 0, moved = false;
  const newEnemies = [];
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    switch (ev.t) {
      case 'move':
        at(t, () => { board.onMove(ev); board.lightTail(ev.tail, G.tailLen()); audio.play(ev.wait ? 'wait' : 'move'); if (!ev.wait) vibrate(6); });
        t += ev.wait ? 0.12 : ev.dash ? 0.22 : 0.16;
        break;
      case 'capture': {
        let kills = 0;
        for (let j = i + 1; j < evs.length && !['capture', 'hurt', 'beam', 'enemyMove'].includes(evs[j].t); j++) if ((evs[j].t === 'kill' && evs[j].cause !== 'thorns') || evs[j].t === 'bossHit') kills++;
        const at0 = t;
        at(at0, () => {
          board.hitstop(0.09);
          board.onCapture(ev, kills);
          audio.play('capture', S.run ? S.run.combo : 1);
          if (kills >= 2) board.slowmo(0.3, 0.35);
          vibrate(kills ? [25, 40, 35] : 12);
        });
        t += kills ? 0.55 : 0.3;
        break;
      }
      case 'kill':
        if (ev.cause === 'loop' || ev.cause === 'warn' || ev.cause === 'hive') at(Math.max(0, t - 0.2), () => audio.play('kill'));
        else at(t, () => { board.onKill(ev); audio.play('kill'); });
        break;
      case 'bossHit': at(Math.max(0, t - 0.25), () => { const e = S.run && S.run.enemies.find((x) => x.id === ev.id); if (e) floatAt(e.q, e.r, 'HIVE −1', '#ff3d6e', { big: true }); }); break;
      case 'score': at(Math.max(0, t - 0.2), () => floatAt(ev.at[0], ev.at[1], '+' + ev.n.toLocaleString('en-US'), '#ffb547', { big: ev.n >= 300, fly: true })); break;
      case 'combo': at(Math.max(0, t - 0.2), () => ui.combo(ev.combo)); break;
      case 'shard': at(t, () => { board.onShard(ev.k); audio.play('shard'); }); break;
      case 'heal': at(t, () => { board.onHeal(ev.k); audio.play('heal'); const [q, r] = P(ev.k); floatAt(q, r, '+1 ♥', '#5dffa0'); }); break;
      case 'hurt':
        at(t, () => { board.onHurt(); ui.hurtFx(); audio.play('hit'); vibrate(90); const p = S.run.player; floatAt(p[0], p[1], '−1', '#ff3d6e', { big: true }); hud(); });
        t += 0.3;
        break;
      case 'block': at(t, () => { board.onBlock(); audio.play('block'); const p = S.run.player; floatAt(p[0], p[1], 'BLOCKED', '#3de8ff'); }); t += 0.2; break;
      case 'secondwind': at(t, () => { const p = S.run.player; floatAt(p[0], p[1], 'SECOND WIND', '#ffb547', { big: true }); }); break;
      case 'beam': at(t, () => { audio.play('beam'); board.onBeam(ev); }); t += 0.28; break;
      case 'enemyMove': at(t, () => board.onEnemyMove(ev)); moved = true; break;
      case 'chomp': at(t + 0.12, () => { board.onChomp(ev.k); audio.play('chomp'); }); break;
      case 'spawn': at(t, () => { board.onSpawn(ev); audio.play('spawn'); }); break;
      case 'warn': at(t, () => audio.play('charge')); break;
      case 'newEnemy': newEnemies.push(ev.type); break;
      case 'dead': at(t + 0.35, () => { audio.play('die'); showOver(); }); t += 0.4; break;
      case 'clear': at(t + 0.2, () => { board.celebrate(); audio.play('clear'); vibrate([30, 50, 30]); }); at(t + 1.5, () => ui.pick(S.run)); break;
      case 'won': at(t + 0.2, () => { board.celebrate(); audio.play('clear'); }); at(t + 1.6, () => showOver()); break;
      case 'tutwin': at(t + 0.15, () => { board.celebrate(); audio.play('clear'); ui.banner('', 'Nice!'); }); at(t + 1.5, () => advanceTutorial()); break;
    }
  }
  at(t + (moved ? 0.22 : 0.02), () => {
    busy = false; refresh(); save();
    if (newEnemies.length && S.run && S.run.phase === 'play') { enemyQueue.push(...newEnemies); showEnemyCard(); }
    else if (pending) { const m = pending; pending = null; commit(m); }
  });
}
function showEnemyCard() { const t = enemyQueue.shift(); if (t) ui.enemy(t); }

// ---------------------------------------------------------------- flow
function measure() {
  const hint = $('#hint').getBoundingClientRect(), foot = $('.bottom').getBoundingClientRect();
  const top = Math.max(hint.bottom, 90) + 8, bottom = Math.max(innerHeight - foot.top, 90) + 4;
  board.setMargins(top, bottom);
}
function enterLevel(evs = []) {
  ui.hide(); document.body.classList.add('playing');
  board.setLevel(S.run);
  ui.resetScore(S.run.score);
  view.pressed = null; refresh(true); measure();
  const r = S.run;
  if (r.mode === 'tutorial') ui.banner(`LESSON ${r.tut + 1} / ${TUTORIAL.length}`, r.title);
  else ui.banner(r.boss ? 'BOSS' : `SECTOR ${r.sector}`, r.boss ? 'The Hive' : r.sector === 1 ? 'Go!' : 'Engage');
  const fresh = evs.filter((e) => e.t === 'newEnemy').map((e) => e.type);
  if (fresh.length && r.mode !== 'tutorial') { enemyQueue.push(...fresh); setTimeout(() => { if (!ui.open) showEnemyCard(); }, 1100); }
  save();
}
function startGame(mode) {
  audio.start();
  if (S.run) G.finalizeRun();
  G.startRun(mode);
  enterLevel(G.takeEvents());
}
function advanceTutorial() {
  G.nextTutorial();
  const evs = G.takeEvents();
  if (S.run.phase === 'tutdone') { G.finalizeRun(); save(); document.body.classList.remove('playing'); ui.tutDone(); return; }
  enterLevel(evs);
}
function toTitle() {
  if (S.run && S.run.phase === 'dead') G.finalizeRun();
  if (S.run && S.run.mode === 'tutorial') { G.setRun(null); }
  save();
  document.body.classList.remove('playing');
  ui.previewChip();
  board.setLevel(DEMO); board.attract = true;
  ui.title(S.meta, live(), S.run, G.utcDate());
}
function resume() {
  const r = S.run; if (!r) return toTitle();
  if (ui.current === 'pause') { ui.hide(); return; }
  enterLevel();
  if (r.phase === 'pick') ui.pick(r);
  else if (r.phase === 'dead') showOver();
  else if (r.phase === 'tutwin') advanceTutorial();
}
function showOver() {
  const r = S.run; if (!r) return;
  if (r.mode === 'tutorial') {
    ui.show(`<div class="card glass" style="text-align:center"><div class="kicker d">OUCH</div><h2>Out of HP</h2><p class="lead">Red hexes hurt. Watch the arrows and step aside.</p><button class="btn primary" data-a="retryTut">TRY AGAIN</button></div>`, { name: 'tutdead' });
    return;
  }
  const won = r.phase === 'won';
  const sum = { mode: r.mode, score: r.score, sector: r.sector, kills: r.kills, shards: r.shardsRun, log: won ? r.log : [...r.log, '🟥'], won, newBest: r.score > S.meta.best };
  const nu = G.nextUnlock(), unlock = nu ? { core: nu.core, have: S.meta.shards + r.shardsRun, need: nu.need } : null;
  const canUndo = !won && G.canUndo();
  if (won) { G.finalizeRun(); save(); }
  ui.over(sum, unlock, canUndo, r.undoLeft);
}
function share() {
  const d = S.meta.daily; if (!d) return;
  const txt = `HEXLOOP Daily ${d.date}\n${(d.log || []).join('')}\nSector ${d.sector}/${G.FINAL} · ${d.score.toLocaleString('en-US')} pts${S.meta.streak.n > 1 ? ` · 🔥${S.meta.streak.n}` : ''}`;
  const copy = () => { try { navigator.clipboard.writeText(txt).then(() => ui.toast('Result copied!'), () => ui.toast(txt.replace(/\n/g, '<br>'), 4000)); } catch (_) { ui.toast(txt.replace(/\n/g, '<br>'), 4000); } };
  if (navigator.share) navigator.share({ text: txt }).catch(copy); else copy();
}
let backTo = toTitle;
ui.onAction = (a, v) => {
  audio.start(); audio.play('ui');
  switch (a) {
    case 'tutorial': if (live()) { backTo = ui.current === 'pause' ? () => ui.pause(S.meta) : toTitle; ui.confirm('Starting the tutorial ends your current run.', 'tutGo', 'END RUN'); } else startGame('tutorial'); break;
    case 'tutGo': startGame('tutorial'); break;
    case 'retryTut': G.retryTutorial(); enterLevel(G.takeEvents()); break;
    case 'continue': resume(); break;
    case 'resume': ui.hide(); break;
    case 'new': if (live()) { backTo = toTitle; ui.confirm('Abandon your current run and start fresh?', 'newGo', 'ABANDON'); } else startGame('run'); break;
    case 'newGo': case 'again': startGame('run'); break;
    case 'daily': if (live()) { backTo = toTitle; ui.confirm('Abandon your current run to play today\'s Daily?', 'dailyGo', 'ABANDON'); } else startGame('daily'); break;
    case 'dailyGo': startGame('daily'); break;
    case 'share': share(); break;
    case 'cores': if (S.run && S.run.phase === 'dead') G.finalizeRun(); save(); ui.cores(S.meta); break;
    case 'pickcore': S.meta.core = v; save(); ui.cores(S.meta); break;
    case 'buycore': { const c = G.CORES.find((x) => x.id === v); if (c && S.meta.shards >= c.cost && !S.meta.unlocked.includes(v)) { S.meta.shards -= c.cost; S.meta.unlocked.push(v); S.meta.core = v; save(); audio.play('pick'); ui.toast(`<b>${c.n}</b> unlocked!`); } ui.cores(S.meta); break; }
    case 'settings': ui.settings(S.meta); break;
    case 'mute': S.meta.muted = !S.meta.muted; audio.setMuted(S.meta.muted); save(); ui.current === 'pause' ? ui.pause(S.meta) : ui.settings(S.meta); break;
    case 'music': S.meta.music = !S.meta.music; audio.setMusic(S.meta.music); save(); ui.current === 'pause' ? ui.pause(S.meta) : ui.settings(S.meta); break;
    case 'gfx': S.meta.gfx = S.meta.gfx === 'low' ? 'high' : 'low'; save(); location.reload(); break;
    case 'export': { const code = 'HXL2.' + btoa(unescape(encodeURIComponent(JSON.stringify({ meta: S.meta, run: S.run })))); const ta = $('#saveCode'); ta.value = code; ta.select(); try { navigator.clipboard.writeText(code).then(() => ui.toast('Save code copied'), () => ui.toast('Code selected: copy it manually')); } catch (_) {} break; }
    case 'import': try {
      const o = JSON.parse(decodeURIComponent(escape(atob(($('#saveCode').value || '').trim().replace(/^HXL2\./, '')))));
      if (!o || !o.meta) throw 0;
      const m = G.mergeImported(o); S.meta = m.meta; G.setRun(m.run); save(); ui.settings(S.meta, 'Save imported.');
    } catch (_) { ui.settings(S.meta, 'That code is not a valid save.'); } break;
    case 'reset': backTo = () => ui.settings(S.meta); ui.confirm('Erase all progress, shards and unlocks?', 'resetGo', 'ERASE'); break;
    case 'resetGo': S.meta = G.defMeta(); G.setRun(null); save(); toTitle(); break;
    case 'title': toTitle(); break;
    case 'back': backTo(); break;
    case 'abandon': backTo = () => ui.pause(S.meta); ui.confirm('End this run now? Shards you collected are kept.', 'abandonGo', 'END RUN'); break;
    case 'abandonGo': if (S.run) { S.run.phase = 'dead'; G.finalizeRun(); } toTitle(); break;
    case 'choose': {
      if (!G.chooseMod(v)) break;
      audio.play('pick');
      enterLevel(G.takeEvents());
      break;
    }
    case 'enemyOk': ui.hide(); if (enemyQueue.length) showEnemyCard(); break;
    case 'undoDeath': doUndo(); break;
  }
};
function doUndo() {
  if (busy || !G.undo()) return;
  G.takeEvents(); ui.hide();
  board.snapPlayer(S.run); refresh(true);
  ui.resetScore(S.run.score);
  audio.play('wait'); ui.toast('Rewound one move');
  save();
}

// ---------------------------------------------------------------- input
const cv = board.renderer.domElement;
let down = false;
function pointAt(e, isDown) {
  const k = board.pick(e.clientX, e.clientY);
  if (k && view.legal.has(k)) { setPressed(k); return; }
  setPressed(null);
  if (!isDown || !k || !S.run) return;
  const r = S.run, e2 = r.enemies.find((x) => K(x.q, x.r) === k);
  if (k === K(r.player[0], r.player[1])) ui.toast('Tap <b>WAIT</b> to stay in place.');
  else if (e2) ui.toast(`<b>${G.ENEMY_INFO[e2.type].n}</b>: ${G.ENEMY_INFO[e2.type].d}`, 2800);
  else if (r.walls.includes(k)) ui.toast('Rocks block movement, but count as part of a loop.');
  else ui.toast('Move one hex at a time: tap a glowing neighbour.');
}
cv.addEventListener('pointerdown', (e) => { audio.start(); if (!canInput()) return; down = true; try { cv.setPointerCapture(e.pointerId); } catch (_) {} pointAt(e, true); });
cv.addEventListener('pointermove', (e) => { if (!canInput()) return; if (down || e.pointerType === 'mouse') pointAt(e, false); });
cv.addEventListener('pointerup', (e) => {
  if (!down) return; down = false;
  const lm = view.pressed && view.legal.get(view.pressed);
  if (lm && canInput()) commit(lm.m);
  else if (e.pointerType !== 'mouse') setPressed(null);
});
cv.addEventListener('pointercancel', () => { down = false; setPressed(null); });
cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !down) setPressed(null); });
$('#waitBtn').addEventListener('click', () => { audio.start(); if (canInput() || busy) commitWait(); });
$('#undoBtn').addEventListener('click', () => { audio.start(); if (!ui.open) doUndo(); });
$('#pauseBtn').addEventListener('click', () => { audio.start(); audio.play('ui'); if (S.run && !ui.open) ui.pause(S.meta); });
$('#skipTut').addEventListener('click', () => { if (S.run && S.run.mode === 'tutorial') { G.finalizeRun(); S.meta.tutorialDone = true; startGame('run'); } });
const KEYDIR = { d: 0, e: 1, q: 2, a: 3, z: 4, c: 5 };
addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'TEXTAREA') return;
  const k = e.key.toLowerCase();
  if (k === 'escape') { if (ui.current === 'pause') ui.hide(); else if (S.run && !ui.open && document.body.classList.contains('playing')) ui.pause(S.meta); return; }
  if (!S.run || S.run.phase !== 'play' || ui.open) return;
  audio.start();
  if (k in KEYDIR) {
    const d = KEYDIR[k], ms = [...view.legal.values()].map((l) => l.m).filter((m) => m.d === d);
    const m = ms.find((x) => (e.shiftKey ? x.dash : !x.dash)) || ms.find((x) => !x.dash);
    if (m) commit(m); else audio.play('bump');
    e.preventDefault();
  } else if (k === 's' || k === ' ') { commitWait(); e.preventDefault(); }
  else if (k === 'u') doUndo();
});
addEventListener('resize', () => { board.resize(); measure(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

// ---------------------------------------------------------------- loop
let last = performance.now();
function frame(dt) {
  board.update(dt);
  if (queue.length) {
    const due = queue.filter((q) => q.at <= board.gameTime);
    if (due.length) { queue = queue.filter((q) => q.at > board.gameTime); due.sort((a, b) => a.at - b.at).forEach((q) => q.fn()); }
  }
  ui.tick(dt);
  if (view.pressed) updateChip();
}
function loop(now) { const dt = Math.min(0.1, (now - last) / 1000); last = now; frame(dt); requestAnimationFrame(loop); }
// debug: advance the simulation by hand (used by headless playtests)
const tick = (sec) => { for (let t = 0; t < sec; t += 1 / 60) frame(1 / 60); };
toTitle();
requestAnimationFrame(loop);
globalThis.__HEX = { G, S, board, ui, view, commit, playEvents, enterLevel, startGame, advanceTutorial, toTitle, tick };
