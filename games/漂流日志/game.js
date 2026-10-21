'use strict';
/* 漂流日志 · 游戏逻辑（v3 上线版）
 * 阶段一：沉城十小时 —— 时间只在行动时流逝（移动 / 结账 / 卸货 / 组装 / 事件）
 * 阶段二：漂流 —— 可暂停的实时模拟，危险时自动暂停，夜里可以跳到天亮
 */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmtHM = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
const fmtDur = m => m >= 60 ? `${Math.floor(m / 60)} 小时${m % 60 ? ` ${m % 60} 分` : ''}` : `${m} 分钟`;

/* ================= 存档 ================= */
const SAVE_KEY = 'driftlog_v2', RUN_KEY = 'driftlog_run_v3';
const DEFAULT_SAVE = () => ({ loop: 1, bottles: [], best: 0, wins: 0, ach: [], diff: 'normal' });
function loadSave() { try { return Object.assign(DEFAULT_SAVE(), JSON.parse(localStorage.getItem(SAVE_KEY))); } catch (e) { return DEFAULT_SAVE(); } }
let SAVE = loadSave();
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { } };
const has = id => SAVE.bottles.includes(id);

let S = null, scene = 'title', mouse = null;

function saveRun() {
  if (!S || !(scene === 'prep' || scene === 'drift') || S.travel || modalOpen) return;
  try { localStorage.setItem(RUN_KEY, JSON.stringify({ scene, S: Object.assign({}, S, { ch: S.ch.id, fx: [], shots: [], hover: null, buildSel: null }) })); } catch (e) { }
}
function loadRunData() { try { return JSON.parse(localStorage.getItem(RUN_KEY)); } catch (e) { return null; } }
function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { } }
addEventListener('beforeunload', saveRun);

/* ================= 通用 UI ================= */
function toast(msg, type = '') {
  const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg;
  $('#feed').appendChild(t); setTimeout(() => t.remove(), 5000);
  while ($('#feed').children.length > 4) $('#feed').firstChild.remove();
}
function log(msg, type = '') {
  if (S) S.log.push({ t: S.min == null ? `准备 ${fmtHM(480 + S.t1)}` : `D${dayOf()} ${fmtHM(hod())}`, msg });
  toast(msg, type);
}
function floatText(x, y, txt, col) { if (S && S.fx) S.fx.push({ type: 'float', x, y, t: 0, txt, col }); }
let modalOpen = false, modalOnClose = null;
function openModal(html, { closable = true, onClose = null, width } = {}) {
  const box = $('#modal .box');
  box.innerHTML = (closable ? '<button class="x">✕</button>' : '') + html;
  box.style.width = width || '';
  $('#modal').classList.remove('hidden'); modalOpen = true; modalOnClose = onClose;
  if (closable) box.querySelector('.x').onclick = closeModal;
  hideTip();
  return box;
}
function closeModal() { $('#modal').classList.add('hidden'); modalOpen = false; const f = modalOnClose; modalOnClose = null; if (f) f(); saveRun(); }
$('#modal').addEventListener('mousedown', e => { if (e.target.id === 'modal' && $('#modal .x')) closeModal(); });
function show(id, on) { $(id).classList.toggle('hidden', !on); }
document.addEventListener('click', e => { if (e.target.closest('.btn, .ccard, .bcard')) AUDIO.sfx('click'); }, true);
document.addEventListener('pointerdown', () => AUDIO.init(), { once: false });

/* ================= 成就 ================= */
function unlock(id) {
  if (!ACHIEVEMENTS[id] || SAVE.ach.includes(id)) return;
  SAVE.ach.push(id); persist(); AUDIO.sfx('ach');
  toast(`🏆 成就解锁：${ACHIEVEMENTS[id].i} ${ACHIEVEMENTS[id].n} —— ${ACHIEVEMENTS[id].d}`, 'gold');
}
function checkAch() {
  if (!S || S.min == null) return;
  const d = dayOf(), st = S.stats;
  if (d >= 2 && hod() >= 6 * 60) unlock('night1');
  if (d >= 4) unlock('tide1');
  if (d >= 8) unlock('day7');
  if (st.fish >= 25) unlock('fisher');
  if (st.kills >= 20) unlock('hunter');
  if (st.built >= 15) unlock('builder');
  if (st.soups >= 8) unlock('chef');
  if (S.crew.length >= 3) unlock('captain');
  if (d >= 4 && S.departT1 < 420) unlock('swift');
}
function openAch() {
  openModal(`<h2>🏆 成就 <span class="sm">${SAVE.ach.length} / ${Object.keys(ACHIEVEMENTS).length}</span></h2><div class="achgrid">${Object.entries(ACHIEVEMENTS).map(([k, a]) => `<div class="ach ${SAVE.ach.includes(k) ? '' : 'lock'}"><div class="i">${a.i}</div><div><b>${a.n}</b><p>${a.d}</p></div></div>`).join('')}</div>`, { width: '820px' });
}

/* ================= 设置 / 菜单 / 帮助 ================= */
function openSettings(back) {
  const tg = (k, n, d) => `<div class="setrow"><div>${n}<div class="sm">${d}</div></div><div class="toggle ${SETTINGS[k] ? 'on' : ''}" data-k="${k}"></div></div>`;
  const box = openModal(`<h2>⚙ 设置</h2>
    <div class="setrow"><div>主音量</div><input type="range" id="vol" min="0" max="1" step="0.05" value="${SETTINGS.vol}"></div>
    ${tg('music', '音乐', '缓慢的氛围和弦')}${tg('amb', '环境音', '海浪、雨声、风声')}${tg('sfx', '音效', '交互与战斗反馈')}
    ${tg('tips', '目标提示', '屏幕上方的“下一步”提示')}${tg('shake', '屏幕震动', '甲板被摧毁时的震动与红闪')}
    ${back ? '<div style="margin-top:14px;text-align:right"><button class="btn" id="back">返回</button></div>' : ''}`, { width: '520px' });
  box.querySelector('#vol').oninput = e => { SETTINGS.vol = +e.target.value; saveSettings(); };
  box.querySelectorAll('.toggle').forEach(t => t.onclick = () => { SETTINGS[t.dataset.k] = !SETTINGS[t.dataset.k]; t.classList.toggle('on'); saveSettings(); if (S) updateGoal(); });
  const b = box.querySelector('#back'); if (b) b.onclick = back;
}
function openHelp(back) {
  const box = openModal(`<h2>❔ 玩法说明</h2><div class="help">
    <h3>你要做什么</h3><p>你溺死过一次，回到了大潮前的 10 小时。<b>第一阶段</b>在城里采购、在码头把木筏造好；<b>第二阶段</b>在海上活下去，第 12 天起方舟会出现在海图上，抵达即获救。死了也没关系——写一封漂流瓶给下一轮的自己。</p>
    <h3>第一阶段 · 沉城十小时</h3><ul>
      <li>时间<b>只在行动时流逝</b>：走路、结账、卸货、组装、处理事件。不动就不会过时间。</li>
      <li>城市从低处开始被淹，地图上标着每个地点的淹没时间。12:00 后物价每小时上涨。</li>
      <li>背包有负重上限。东西要<b>运回码头</b>才算装上木筏；部分商店可以<b>送货到码头</b>（14:00 前），五金店有<b>手推车</b>。</li>
      <li>在码头可以提前<b>组装设施</b>——但会花时间。</li></ul>
    <h3>第二阶段 · 漂流</h3><ul>
      <li>管理 <b>饱食 / 水分 / 体力 / 士气 / 生命</b>。太饿太渴时角色会本能地吃喝。</li>
      <li><b>浮力即容量</b>：东西越重吃水越深，超载会持续进水。扩建甲板、绑浮桶能增加浮力。</li>
      <li>每天 06:00 规划航线，16:00 抵达。夜里黑潮兽会啃木筏边缘——<b>点击它们用鱼叉刺</b>，防护栏和鱼叉炮能帮你守夜。第 3/6/9/12 夜是大潮夜。</li>
      <li>危险出现时游戏会<b>自动暂停</b>。夜里安全时可以「⏭ 跳到天亮」。</li></ul>
    <h3>操作</h3><p><kbd>空格</kbd> 暂停/继续　<kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> 倍速　<kbd>B</kbd> 建造　<kbd>Esc</kbd> 菜单/取消　右键 取消建造　鼠标悬停 查看设施信息</p>
    ${back ? '<div style="text-align:right;margin-top:10px"><button class="btn" id="back">返回</button></div>' : ''}</div>`, { width: '720px' });
  const b = box.querySelector('#back'); if (b) b.onclick = back;
}
function openMenu() {
  if (!S || !(scene === 'prep' || scene === 'drift')) return;
  if (scene === 'drift') setSpeed(0);
  const box = openModal(`<h2>☰ 暂停</h2><div class="menu">
    <button class="btn gold" id="mResume">继续游戏</button><button class="btn" id="mHelp">❔ 玩法说明</button>
    <button class="btn" id="mSet">⚙ 设置</button><button class="btn" id="mAch">🏆 成就</button>
    <button class="btn" id="mQuit">💾 保存并返回标题</button></div>`, { width: '380px' });
  box.querySelector('#mResume').onclick = closeModal;
  box.querySelector('#mHelp').onclick = () => openHelp(openMenu);
  box.querySelector('#mSet').onclick = () => openSettings(openMenu);
  box.querySelector('#mAch').onclick = openAch;
  box.querySelector('#mQuit').onclick = () => { modalOpen = false; saveRun(); closeModal(); showTitle(); };
}
$('#gear').onclick = openMenu;

/* ================= 标题 ================= */
function showTitle() {
  scene = 'title'; S = null;
  show('#title', true); show('#p1', false); show('#p2', false); show('#buildpanel', false); show('#hint', false); show('#gear', false); show('#goal', false); hideTip();
  if (SAVE.bottles.length >= 5) unlock('bottles');
  const b = SAVE.bottles.map(id => `<span class="b">🍾 <b>${BOTTLES[id].n}</b><br><span style="color:var(--dim)">${BOTTLES[id].d}</span></span>`).join('');
  $('#bottles').innerHTML = `<div class="sm" style="margin-bottom:6px">第 ${SAVE.loop} 次轮回 · 最远漂流 ${SAVE.best} 天 · 抵达方舟 ${SAVE.wins} 次 · 成就 ${SAVE.ach.length}/${Object.keys(ACHIEVEMENTS).length}${SAVE.bottles.length ? ' · 冲上岸的漂流瓶：' : ''}</div>${b}`;
  const run = loadRunData();
  show('#btnContinue', !!run);
  if (run) $('#btnContinue').textContent = run.scene === 'prep' ? `继续上次 · 准备阶段 ${fmtHM(480 + run.S.t1)}` : `继续上次 · 漂流第 ${Math.floor(run.S.min / 1440) + 1} 天`;
  AUDIO.setScene('sea', 'cloud'); AUDIO.setMood('night');
}
$('#btnStart').onclick = () => { if (loadRunData() && !confirm('开始新的轮回会覆盖上次未完成的进度。确定？')) return; chooseChar(); };
$('#btnContinue').onclick = continueRun;
$('#btnAch').onclick = openAch;
$('#btnHelp').onclick = () => openHelp();
$('#btnSet').onclick = () => openSettings();
$('#btnReset').onclick = () => { if (confirm('清除所有轮回记录、漂流瓶、成就和存档？')) { SAVE = DEFAULT_SAVE(); persist(); clearRun(); showTitle(); } };
function chooseChar() {
  const render = () => {
    const df = DIFFS[SAVE.diff];
    const box = openModal(`<h2>选择身份</h2><p class="sm" style="margin-bottom:12px">不同的身份，意味着完全不同的十小时。</p>
    <div class="diffrow">${Object.entries(DIFFS).map(([k, d]) => `<button class="btn ${SAVE.diff === k ? 'on' : ''}" data-d="${k}">${d.n}</button>`).join('')}<span class="sm" style="align-self:center;margin-left:8px">${df.d}</span></div>
    <div class="cards">${CHARS.map(c => `<div class="ccard" data-c="${c.id}"><div class="big">${c.i}</div><h4>${c.n}</h4>
    <div class="money">$ ${Math.round((c.cash + (has('cash') ? 250 : 0)) * df.cash)}</div><p>${c.desc}</p></div>`).join('')}</div>`);
    box.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { SAVE.diff = b.dataset.d; persist(); render(); });
    box.querySelectorAll('.ccard').forEach(el => el.onclick = () => { closeModal(); intro(CHARS.find(c => c.id === el.dataset.c)); });
  };
  render();
}
function intro(ch) {
  const lines = SAVE.loop === 1
    ? ['冰冷的海水灌进肺里。', '你记得最后看到的画面：整座港城沉在海面下，只剩楼顶像墓碑。', '……然后你睁开了眼。', '<b style="color:var(--gold)">早上 08:00。</b>窗外阳光很好，街上的人还在买早餐。', '只有你知道——<b style="color:var(--tide)">今晚 18:00，大潮会吞掉这里。</b>', '码头上有一条你租来钓鱼的旧木筏。它是你唯一的船。']
    : [`第 ${SAVE.loop} 次了。`, '你又一次在 08:00 醒来，嘴里还是海水的咸味。', SAVE.bottles.length ? '床边有几只漂流瓶，是你写给自己的。' : '这一次，你要记住更多。', '<b style="color:var(--tide)">慢慢来。这一次，一步都别浪费。</b>'];
  const box = openModal(`<div class="story">${lines.map((l, i) => `<p style="animation-delay:${i * .6}s">${l}</p>`).join('')}</div>
    <div style="text-align:right;margin-top:20px"><button class="btn gold" id="go">出 门</button></div>`, { closable: false });
  box.querySelector('#go').onclick = () => { closeModal(); startPrep(ch); };
}
function continueRun() {
  const d = loadRunData(); if (!d) return;
  S = d.S; S.ch = CHARS.find(c => c.id === S.ch) || CHARS[0]; scene = d.scene;
  S.fx = []; S.shots = []; S.travel = null;
  show('#title', false); show('#gear', true);
  if (scene === 'prep') { show('#p1', true); show('#p2', false); setView(S.view || 'city'); }
  else { show('#p1', false); show('#p2', true); show('#buildpanel', false); $('#looptxt').textContent = `Loop: ${SAVE.loop}`; $('#actions').dataset.sig = ''; setSpeed(0); renderBuildPanel(); updateDriftHUD(); }
  log('你回到了上次的轮回。', 'gold');
}

/* ================= 共用：木筏 ================= */
function newRaft() {
  const tiles = {};
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) tiles[tkey(x, y)] = { x, y, hp: 100, fac: null };
  if (has('oldwood')) for (let y = -1; y <= 1; y++) tiles[tkey(2, y)] = { x: 2, y, hp: 100, fac: null };
  return tiles;
}
const facs = t => Object.values(S.tiles).filter(x => x.fac && x.fac.t === t);
const countFac = t => facs(t).length;
const isEdge = t => isEdgeT(S, t);
const DF = () => DIFFS[S.diff] || DIFFS.normal;
function weightKg() {
  let kg = S.water || 0;
  for (const k in S.stock) if (k !== 'float') kg += ITEMS[k].kg * S.stock[k];
  for (const t of Object.values(S.tiles)) if (t.fac) kg += FAC[t.fac.t].kg;
  return kg;
}
function buoyancy() { return Object.keys(S.tiles).length * 15 * (has('buoy') ? 1.2 : 1) + (S.stock.float || 0) * 25; }
function addStock(k, q = 1) {
  if (q <= 0) return; S.stock[k] = (S.stock[k] || 0) + q;
  if (k === 'fish' && S.fishT) { for (let i = 0; i < q; i++) S.fishT.push(S.min || 0); if (S.stats) S.stats.fish += q; }
}
function takeStock(k, q = 1) { if ((S.stock[k] || 0) < q) return false; S.stock[k] -= q; if (!S.stock[k]) delete S.stock[k]; if (k === 'fish' && S.fishT) S.fishT.splice(0, q); return true; }
function battCap() { return 150 + countFac('batt') * 400; }
function isAdjacentEmpty(x, y) { return !S.tiles[tkey(x, y)] && DIRS.some(([dx, dy]) => S.tiles[tkey(x + dx, y + dy)]) && Math.abs(x) <= 4 && Math.abs(y) <= 4; }
function canAfford(f) { return Object.entries(FAC[f].c).every(([k, q]) => (S.stock[k] || 0) >= q); }
function buildMins(f) { return Math.round(FAC[f].t * (S.ch.id === 'docker' ? .5 : 1)); }

/* ================= 阶段一：沉城十小时 ================= */
function startPrep(ch) {
  scene = 'prep'; clearRun();
  S = {
    ch, diff: SAVE.diff, cash: Math.round((ch.cash + (has('cash') ? 250 : 0)) * DIFFS[SAVE.diff].cash), cap: ch.cap, t1: 0, at: 'dock', travel: null, view: 'city',
    bag: {}, stock: {}, tiles: newRaft(), log: [], shop: {}, flooded: {}, water: 0, fx: [], debris: [], evDone: {},
    weather: 'sun', wind: .4, monsters: [], shots: [], crewPos: [], pl: { x: 0, y: 0, tx: 0, ty: 0, col: [70, 80, 96], hood: true },
    stats: { fish: 0, kills: 0, built: 0, soups: 0, lost: 0, nodes: 0, meals: 0 },
  };
  if (ch.id === 'rider') S.stock.battery = 1;
  DISTRICTS.forEach(d => S.shop[d.id] = d.items.map(it => it[2]));
  show('#title', false); show('#p1', true); show('#p2', false); show('#gear', true);
  setView('city');
  log('先去哪儿？低处的区域会先被淹。时间只在你行动时流逝。', 'gold');
}
const floodAt = d => d.flood + (has('tide') ? 60 : 0);
function seaY(t) {
  const tt = t - (has('tide') ? 60 : 0);
  if (tt <= 0) return SEA_CURVE[0][1];
  for (let i = 1; i < SEA_CURVE.length; i++) {
    const [t0, y0] = SEA_CURVE[i - 1], [t1, y1] = SEA_CURVE[i];
    if (tt <= t1) return y0 + (y1 - y0) * (tt - t0) / (t1 - t0);
  }
  return SEA_CURVE[SEA_CURVE.length - 1][1];
}
const bagKg = () => Object.entries(S.bag).reduce((s, [k, q]) => s + ITEMS[k].kg * q, 0);
const loc = id => id === 'dock' ? DOCK : DISTRICTS.find(d => d.id === id);
const panicMul = () => 1 + Math.max(0, S.t1 / 60 - 4) * 0.08;
function price(d, base) {
  let m = panicMul();
  if (d.disc && has('shipyard') && S.t1 < 240) m *= 0.7;
  return Math.round(base * m);
}
function travelMins(from, to) {
  const a = loc(from), b = loc(to);
  let m = 10 + Math.hypot(a.x - b.x, a.y - b.y) / 11;
  if (S.ch.id === 'rider') m *= 0.6;
  if (bagKg() > S.cap) m *= 1.5;
  return Math.round(m);
}
function advancePrep(mins) {
  S.t1 += mins;
  DISTRICTS.forEach(d => {
    if (!S.flooded[d.id] && S.t1 >= floodAt(d)) {
      S.flooded[d.id] = true;
      log(`🌊 ${d.n} 被海水淹没了！`, 'bad'); AUDIO.sfx('splash');
      if (S.at === d.id && !S.travel) {
        if (modalOpen) { modalOnClose = null; closeModal(); }
        const lost = loseFraction(S.bag, .3);
        log(`你蹚着齐腰的水逃回码头${lost ? '，背包里的东西冲走了一些' : ''}。`, 'bad');
        S.at = 'dock'; setView('dock');
      }
    }
  });
  if (S.t1 >= 600) { endPrep(true); return; }
  updatePrepHUD(); saveRun();
}
function loseFraction(store, f) {
  let lost = 0;
  for (const k in store) { const l = Math.round(store[k] * f); store[k] -= l; lost += l; if (store[k] <= 0) delete store[k]; }
  return lost;
}
function setView(v) {
  S.view = v;
  show('#cityui', v === 'city'); show('#dockui', v === 'dock'); show('#buildpanel', v === 'dock');
  S.buildSel = null; updateHint();
  if (v === 'dock') { renderBuildPanel(); S.pl.x = S.pl.tx = 0; S.pl.y = S.pl.ty = 1; }
  AUDIO.setScene(v === 'dock' ? 'sea' : 'city', 'sun'); AUDIO.setMood('day');
  updatePrepHUD();
}
function goTo(id) {
  if (S.travel) return;
  if (id === S.at) { if (id === 'dock') setView('dock'); else openShop(loc(id)); return; }
  const d = loc(id);
  if (id !== 'dock' && S.flooded[id]) { toast(`${d.n} 已经沉在水下了。`, 'bad'); return; }
  const mins = travelMins(S.at, id);
  if (S.t1 + mins >= 600 && !confirm(`走过去要 ${fmtDur(mins)}，到时大潮已经来了。确定？`)) return;
  S.travel = { from: S.at, to: id, start: performance.now(), dur: 700 + mins * 12, mins };
  AUDIO.sfx('walk');
}
function finishTravel() {
  const tr = S.travel; S.travel = null; S.at = tr.to;
  advancePrep(tr.mins);
  if (scene !== 'prep') return;
  if (S.at !== 'dock' && S.flooded[S.at]) { log('你赶到时，这里已经被淹了。', 'bad'); return; }
  const go = () => { if (scene !== 'prep') return; if (S.at === 'dock') setView('dock'); else if (!S.flooded[S.at]) openShop(loc(S.at)); };
  if (!tryPrepEvent(go)) go();
}
function tryPrepEvent(then) {
  const ev = PREP_EVENTS.find(e => e.at.includes(S.at) && !S.evDone[e.id] && e.cond(S) && (e.id === 'neighbor' || Math.random() < .45));
  if (!ev) return false;
  S.evDone[ev.id] = true;
  const box = openModal(`<h2>${ev.title}</h2><p style="line-height:1.9;margin-bottom:16px">${ev.text}</p><div style="display:flex;gap:10px;flex-wrap:wrap">${ev.opts.map((o, i) => `<button class="btn ${i ? '' : 'gold'}" data-o="${i}" ${o.cond && !o.cond(S) ? 'disabled' : ''}>${o.n}</button>`).join('')}</div>`, { closable: false, width: '560px' });
  AUDIO.sfx('page');
  box.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
    const r = ev.opts[+b.dataset.o].f(S); closeModal(); log(r.msg, 'gold');
    if (r.mins) advancePrep(r.mins); else updatePrepHUD();
    then();
  });
  return true;
}
function bagGridHTML(store, min = 18) {
  const cells = Object.entries(store).map(([k, q]) => `<div class="cell" title="${ITEMS[k].n}">${ITEMS[k].i}<small>${q}</small></div>`);
  while (cells.length < min) cells.push('<div class="cell"></div>');
  return `<div class="grid">${cells.join('')}</div>`;
}
function desc(id) {
  const it = ITEMS[id];
  if (it.cap) return `背包上限 +${it.cap}kg（不占背包）`;
  if (it.food) return `饱食 +${it.food}${it.mor ? ` · 士气 ${it.mor > 0 ? '+' : ''}${it.mor}` : ''}${it.rot ? ' · 一天内会臭' : ''}`;
  if (it.L) return `淡水 ${it.L}L`;
  if (it.buoy) return `绑在筏底 +${it.buoy}kg 浮力`;
  if (it.heal) return `生命 +${it.heal}`;
  const uses = BUILD_ORDER.filter(f => FAC[f].c[id]).map(f => FAC[f].n);
  return uses.length ? `用于：${uses.slice(0, 3).join(' / ')}` : '';
}
function openShop(d) {
  const cart = {};
  let deliver = false;
  const render = () => {
    const canDeliver = d.deliver && S.t1 < DELIVERY_UNTIL;
    if (!canDeliver) deliver = false;
    const lines = d.items.map(([id, base], idx) => ({ id, idx, p: price(d, base), q: cart[idx] || 0, rem: S.shop[d.id][idx] }));
    const total = lines.reduce((s, l) => s + l.p * l.q, 0) + (deliver ? DELIVERY_FEE : 0);
    const n = lines.reduce((s, l) => s + l.q, 0);
    const addKg = lines.reduce((s, l) => s + (ITEMS[l.id].cap ? 0 : ITEMS[l.id].kg * l.q), 0);
    const capAfter = S.cap + lines.reduce((s, l) => s + (ITEMS[l.id].cap || 0) * l.q, 0);
    const kgAfter = bagKg() + (deliver ? 0 : addKg);
    const mins = n ? 5 + n : 0;
    const tooHeavy = kgAfter > capAfter * 1.5;
    const pm = Math.round((panicMul() - 1) * 100);
    const rows = lines.map(l => {
      const it = ITEMS[l.id];
      return `<div class="sitem"><div class="ic">${it.i}</div><div><div class="nm">${it.n}</div><div class="meta">${it.kg ? it.kg + 'kg · ' : ''}${desc(l.id)}</div></div>
        <div class="right"><div class="rem">剩 ${l.rem - l.q}</div><div class="pr">$${l.p}</div>
        <div class="qty"><button class="btn" data-m="${l.idx}">−</button><b>${l.q}</b><button class="btn" data-p="${l.idx}" ${l.rem - l.q <= 0 || S.cash < total + l.p ? 'disabled' : ''}>+</button></div></div></div>`;
    }).join('');
    const box = openModal(`<div class="shopwrap">
      <div><h2>🎒 背包</h2><div style="font-size:13px;display:flex;justify-content:space-between"><span>负重（结账后）</span><span style="color:${kgAfter > capAfter ? 'var(--red)' : 'var(--dim)'}">${kgAfter.toFixed(1)} / ${capAfter} kg</span></div>
        <div class="loadbar ${kgAfter > capAfter ? 'over' : kgAfter > capAfter * .8 ? 'warn' : ''}"><div style="width:${Math.min(100, kgAfter / capAfter * 100)}%"></div></div>
        ${bagGridHTML(S.bag)}
        <p class="sm" style="margin-top:12px;line-height:1.7">· 结账耗时 5 分钟 + 每件 1 分钟<br>· 超重后走路慢 50%，最多超载 50%<br>· 背包里的东西要<b style="color:var(--text)">运回码头</b>才算装上木筏${d.deliver ? '<br>· 本店可<b style="color:var(--text)">送货到码头</b>（14:00 前）' : ''}</p>
        <div style="margin-top:14px;font-size:22px;color:var(--gold);font-weight:800">现金 $${S.cash}</div></div>
      <div><h2>${d.i} ${d.n} <span style="font-size:13px;color:${floodAt(d) - S.t1 < 90 ? 'var(--red)' : 'var(--dim)'};font-weight:400">${d.flood > 1e8 ? '高地，不会被淹' : `🌊 ${fmtHM(floodAt(d) - S.t1)} 后淹没`}</span>
        ${pm > 0 ? `<span class="chip" style="color:var(--amber)">恐慌涨价 +${pm}%</span>` : ''}${d.disc && has('shipyard') && S.t1 < 240 ? '<span class="chip" style="color:var(--green2)">🍾 早市 -30%</span>' : ''}</h2>
        ${rows}
        <div class="cartbar"><div>合计 <span class="tot">$${total}</span></div><div class="sm">${n} 件 · ${addKg.toFixed(1)}kg · 耗时 ${mins} 分钟</div>
          ${d.deliver ? `<label style="${canDeliver ? '' : 'opacity:.4'}"><input type="checkbox" id="dlv" ${deliver ? 'checked' : ''} ${canDeliver ? '' : 'disabled'}> 🚚 送货到码头 +$${DELIVERY_FEE}${canDeliver ? '' : '（司机已经跑了）'}</label>` : ''}
          <button class="btn green" id="pay" style="margin-left:auto;padding:10px 22px" ${n && total <= S.cash && !tooHeavy ? '' : 'disabled'}>${tooHeavy ? '背不动了' : '结 账'}</button></div></div></div>`, { width: '1040px' });
    box.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { cart[b.dataset.p] = (cart[b.dataset.p] || 0) + 1; render(); });
    box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { cart[b.dataset.m] = Math.max(0, (cart[b.dataset.m] || 0) - 1); render(); });
    const dl = box.querySelector('#dlv'); if (dl) dl.onchange = () => { deliver = dl.checked; render(); };
    box.querySelector('#pay').onclick = () => {
      S.cash -= total; AUDIO.sfx('coin');
      lines.forEach(l => {
        if (!l.q) return; S.shop[d.id][l.idx] -= l.q;
        if (ITEMS[l.id].cap) { S.cap += ITEMS[l.id].cap * l.q; log(`🛒 买了手推车，背包上限 +${ITEMS[l.id].cap}kg`, 'good'); return; }
        const dst = deliver ? S.stock : S.bag; dst[l.id] = (dst[l.id] || 0) + l.q;
      });
      if (deliver) log(`🚚 货车会把 ${n} 件东西直接送到码头`, 'good');
      for (const k in cart) delete cart[k];
      advancePrep(mins);
      if (scene === 'prep' && S.at === d.id && !S.flooded[d.id]) render();
    };
  };
  render();
}
function unloadBag() { for (const k in S.bag) S.stock[k] = (S.stock[k] || 0) + S.bag[k]; S.bag = {}; }
function waterL(store) { return Object.entries(store).reduce((s, [k, q]) => s + (ITEMS[k].L || 0) * q, 0); }
function spotterTotals() {
  const all = {}; [S.bag, S.stock].forEach(st => { for (const k in st) all[k] = (all[k] || 0) + st[k]; });
  const sum = f => Object.entries(all).reduce((s, [k, q]) => s + (f(ITEMS[k], k) || 0) * q, 0);
  const built = t => countFac(t);
  return [
    ['🍖 食物', sum(it => it.food), 350, v => Math.round(v)],
    ['💧 淡水', sum(it => it.L), 30, v => v.toFixed(0) + 'L'],
    ['🪵 原木', sum((it, k) => k === 'plank' ? 1 : 0) + Object.values(S.tiles).filter(t => t.fac).length, 6, v => v],
    ['☔ 造水设施', built('rain') + built('still') + built('purifier') + sum((it, k) => ['tarp', 'glass'].includes(k) ? 1 : 0), 1, v => v],
    ['🎣 捕鱼', built('netf') + sum((it, k) => k === 'net' ? 1 : 0), 1, v => v],
    ['🔱 防御', built('fence') + built('turret') + sum((it, k) => k === 'harpoon' ? 1 : 0), 2, v => v],
    ['⛑️ 医疗', sum(it => it.heal ? 1 : 0), 1, v => v],
  ];
}
function updatePrepHUD() {
  if (scene !== 'prep') return;
  const left = Math.max(0, 600 - S.t1);
  $('#tnow').textContent = fmtHM(480 + S.t1);
  $('#tsub').innerHTML = `大潮 18:00 · 还剩 <b>${fmtDur(left)}</b>`;
  $('#tidebar div').style.width = (S.t1 / 6) + '%';
  $('#cash').innerHTML = `$ ${S.cash}${panicMul() > 1 ? `<small>物价 +${Math.round((panicMul() - 1) * 100)}%</small>` : ''}`;
  $('#spotter').innerHTML = `<div class="ph3"><span>📋 囤货清单</span><span class="sm" style="font-weight:400">背包 + 木筏</span></div>` +
    spotterTotals().map(([n, v, goal, f]) => `<div class="chk ${v >= goal ? 'ok' : ''}"><div class="bx">${v >= goal ? '✓' : ''}</div>${n}<span class="v">${f(v)} / ${f(goal)}</span></div>`).join('') +
    `<div class="sm" style="margin-top:8px;line-height:1.6">点地图上的地点前往。原木和材料要在<b style="color:var(--text)">码头</b>组装成设施。</div>`;
  const kg = bagKg(), over = kg > S.cap, wk = weightKg(), by = buoyancy();
  const raftBar = `<div class="sm">⛵ 木筏载重 ${wk.toFixed(0)} / ${by.toFixed(0)} kg</div><div class="loadbar ${wk > by ? 'over' : wk > by * .8 ? 'warn' : ''}"><div style="width:${Math.min(100, wk / by * 100)}%"></div></div>`;
  $('#bagbox').innerHTML = `<div class="ph3"><span>🎒 背包</span>${over ? '<span class="chip tag-red">超重 · 走得慢</span>' : ''}</div>
    <div class="sm">${kg.toFixed(1)} / ${S.cap} kg</div><div class="loadbar ${over ? 'over' : kg > S.cap * .8 ? 'warn' : ''}"><div style="width:${Math.min(100, kg / S.cap * 100)}%"></div></div>${raftBar}
    <div class="sm">📍 ${loc(S.at).n}${S.preCrew ? ' · 🙋 林姐同行' : ''}</div>`;
  if (S.view === 'dock') {
    const bagN = Object.values(S.bag).reduce((a, b) => a + b, 0);
    $('#dockbtns').innerHTML = `<button class="btn green" id="dUnload" ${bagN ? '' : 'disabled'}>${bagN ? `🎒 卸下背包（${bagN} 件 · 10 分钟）` : '🎒 背包是空的'}</button><button class="btn" id="dCity">🏙️ 回到城市地图</button>`;
    $('#dUnload').onclick = () => { unloadBag(); AUDIO.sfx('build'); log('东西都搬上了木筏。'); advancePrep(10); if (scene === 'prep') renderBuildPanel(); };
    $('#dCity').onclick = () => setView('city');
    const wl = waterL(S.stock);
    $('#raftbox').innerHTML = `<div class="ph3"><span>⛵ 你的木筏</span><span class="sm">${Object.keys(S.tiles).length} 格甲板</span></div>
      <div style="font-size:13px;display:flex;justify-content:space-between"><span>载重 / 浮力</span><span style="color:${wk > by ? 'var(--red)' : wk > by * .8 ? 'var(--amber)' : 'var(--green2)'}">${wk.toFixed(0)} / ${by.toFixed(0)} kg</span></div>
      <div class="loadbar ${wk > by ? 'over' : wk > by * .8 ? 'warn' : ''}"><div style="width:${Math.min(100, wk / by * 100)}%"></div></div>
      <div class="sm" style="margin-bottom:6px;line-height:1.6">${wk > by ? '<b style="color:var(--red)">超载了！漂流时会持续进水。</b>扩建甲板或绑浮桶。' : '每格甲板提供 15kg 浮力，浮桶 +25kg。超过 85% 浪会冲走散放的物资。'}</div>
      <div>${Object.entries(S.stock).map(([k, q]) => `<span class="chip">${ITEMS[k].i} ${ITEMS[k].n} ×${q}</span>`).join('') || '<span class="sm">还是空的。去城里买点东西，或者叫送货。</span>'}</div>
      ${wl ? `<div class="sm" style="margin-top:6px">💧 共 ${wl.toFixed(0)}L 淡水</div>` : ''}`;
  }
  updateGoal();
}
$('#endprep').onclick = () => {
  if (scene !== 'prep') return;
  const box = openModal(`<h2>提前启航？</h2><p class="sm" style="margin-bottom:16px;font-size:14px;line-height:1.8">还剩 ${fmtDur(600 - S.t1)}。${S.at === 'dock' ? '背包会自动卸到木筏上。' : '<b style="color:var(--red)">你不在码头，得先跑回去（背包会带上），城里没买的就没了。</b>'}<br>启航后就不能再回城了。</p>
    <button class="btn gold" id="yes">启 航</button>`);
  box.querySelector('#yes').onclick = () => { closeModal(); endPrep(false); };
};
function endPrep(forced) {
  if (scene !== 'prep') return;
  scene = 'transition'; S.departT1 = S.t1;
  if (modalOpen) { modalOnClose = null; $('#modal').classList.add('hidden'); modalOpen = false; }
  if (forced && S.at !== 'dock') { const l = loseFraction(S.bag, .5); if (l) log('你在齐腰深的水里狂奔回码头，丢了一半东西。', 'bad'); }
  unloadBag();
  AUDIO.sfx('splash'); AUDIO.setMood('night');
  const box = openModal(`<div class="story"><p>${forced ? '18:00。远处传来一声闷响。' : '你解开了缆绳。'}</p>
    <p style="animation-delay:.8s">海平面像一堵墙一样站了起来。</p><p style="animation-delay:1.6s">街道、车、红绿灯……在你脚下一点点消失。</p>
    <p style="animation-delay:2.4s"><b style="color:var(--tide)">漂流开始了。</b></p></div>
    <div style="text-align:right;margin-top:20px"><button class="btn gold" id="go">继 续</button></div>`, { closable: false });
  box.querySelector('#go').onclick = () => { closeModal(); startDrift(); };
}

/* ================= 目标提示 ================= */
function goalText() {
  if (scene === 'prep') {
    const all = {}; [S.bag, S.stock].forEach(st => { for (const k in st) all[k] = (all[k] || 0) + st[k]; });
    const bagN = Object.values(S.bag).reduce((a, b) => a + b, 0);
    if (S.t1 >= 510) return S.at === 'dock' ? '大潮快来了。清单差不多就点左下角「启航」。' : '大潮快来了！赶紧回码头。';
    if (bagN && S.at !== 'dock' && bagKg() > S.cap * .7) return '背包快满了——回<b>码头</b>卸货，东西才算装上木筏。';
    if (!all.plank && !S.flooded.shipyard) return '先去<b>船厂</b>买原木和缆绳：扩建甲板和大多数设施都要用。勾选「送货到码头」可以省下往返时间。';
    if (waterL(all) < 15) return '去<b>超市</b>买水。漂流时淡水是最急迫的。';
    if (bagN && S.at === 'dock') return '在码头点「卸下背包」，然后用左侧面板组装设施。';
    if (!countFac('rain') && !countFac('still') && (all.tarp || all.glass) && all.plank) return '回<b>码头</b>组装「雨水收集器」或「蒸馏器」——海上的淡水全靠它们。';
    if (!all.net && !countFac('netf') && !S.flooded.tackle) return '<b>渔具店</b>有渔网和鱼叉：渔网被动捕鱼，鱼叉用来对付夜里的东西。';
    if (S.view === 'dock' && Object.keys(S.stock).length && BUILD_ORDER.some(f => f !== 'deck' && canAfford(f)) && Object.values(S.tiles).filter(t => t.fac).length < 3) return '材料够了——在左侧面板选一个设施，点空甲板放下。';
    return '对照左侧清单补齐缺口；觉得够了也可以提前启航。';
  }
  if (scene === 'drift') {
    const d = dayOf(), h = hod();
    if (S.monsters.length) return '<b>点击黑潮兽</b>用鱼叉刺它们！甲板受伤可以「修补甲板」。';
    if (S.speed === 0 && S.min < 18 * 60 + 30) return '按 <b>▶</b> 或空格让时间流动。左下是行动，右上「建造」可以继续扩建。';
    if (S.water < 4 && !countFac('rain') && !countFac('still') && !countFac('purifier')) return '淡水快没了！先造<b>雨水收集器</b>或<b>蒸馏器</b>。';
    if (S.stock.fish && countFac('stove')) return '有生鱼，记得<b>烹饪</b>——放一天就臭。';
    if (S.stock.fish && !countFac('stove')) return '生鱼直接吃会降士气。有金属件的话造个<b>油桶炉</b>。';
    if (weightKg() / buoyancy() > .85) return '木筏太重，浪会冲走散放物资：<b>扩建甲板</b>或造<b>储物箱</b>。';
    if (TIDE_NIGHTS.includes(d + (h >= 19 * 60 ? 0 : 0)) && h >= 6 * 60 && h < 22 * 60 && !countFac('fence') && !countFac('turret')) return `今晚是<b>大潮夜</b>！造防护栏 / 鱼叉炮，留几根原木修补。`;
    if (TIDE_NIGHTS.includes(d + 1) && h >= 6 * 60) return `明晚是<b>大潮夜</b>，提前加固木筏边缘。`;
    if (S.wish) return `[愿望] 吃到 ${S.wish.items.map(k => ITEMS[k].n).join(' / ')} 中的一样，士气大涨。`;
    if (isNight() && !S.monsters.length && h < 21 * 60 + 50 && h >= 19 * 60) return '夜里安静的时候，可以按「⏭ 跳到天亮」。';
    return d >= 12 ? '方舟就在附近——每天早上留意海图上的 🚢。' : `活下去。第 12 天起，方舟会出现在海图上（还有 ${12 - d} 天）。`;
  }
  return '';
}
function updateGoal() {
  const g = $('#goal');
  if (!SETTINGS.tips || !S || !(scene === 'prep' || scene === 'drift') || (scene === 'prep' && S.view === 'dock' && S.buildSel)) return g.classList.add('hidden');
  const t = goalText(); if (!t) return g.classList.add('hidden');
  g.classList.remove('hidden');
  const parent = scene === 'drift' ? $('#p2') : document.body; if (g.parentNode !== parent) parent.appendChild(g);
  g.innerHTML = `<b>📌 下一步</b><span>${t}</span>`;
}

/* ================= 建造（码头 & 漂流共用） ================= */
function renderBuildPanel() {
  if (!S) return;
  const prep = scene === 'prep';
  $('#buildpanel').innerHTML = `<div class="ph3"><span>🔨 ${prep ? '组装木筏' : '建造'}</span><span class="sm" style="font-weight:400">右键 / Esc 取消</span></div>` +
    BUILD_ORDER.map(f => {
      const F = FAC[f], ok = canAfford(f);
      const cost = Object.entries(F.c).map(([k, q]) => `<span style="color:${(S.stock[k] || 0) >= q ? 'var(--amber)' : '#c76a60'}">${ITEMS[k].i}${ITEMS[k].n}×${q}</span>`).join(' ');
      return `<div class="bcard ${ok ? '' : 'no'} ${S.buildSel === f ? 'sel' : ''}" data-f="${f}"><div class="ic">${F.i}</div><div style="flex:1"><div class="nm">${F.n}${F.w ? ` <span style="font-size:11px;color:var(--cyan)">${F.w}W</span>` : ''}${prep ? ` <span class="sm" style="float:right">⏱ ${buildMins(f)} 分</span>` : ''}</div><div class="ds">${F.d}</div><div class="cs">${cost}</div></div></div>`;
    }).join('') + `<div class="bcard ${S.buildSel === 'remove' ? 'sel' : ''}" data-f="remove"><div class="ic">🪓</div><div><div class="nm">拆除</div><div class="ds">返还一半材料</div></div></div>`
    + (prep ? '<div class="sm" style="padding:8px;line-height:1.6">材料必须先放到<b style="color:var(--text)">木筏上</b>（卸下背包或送货）才能组装。</div>' : '');
  $$('#buildpanel .bcard').forEach(c => c.onclick = () => {
    const f = c.dataset.f;
    if (f !== 'remove' && !canAfford(f)) return toast('材料不足（材料要在木筏上）', 'bad');
    S.buildSel = S.buildSel === f ? null : f; renderBuildPanel(); updateHint(); updateGoal();
  });
}
function updateHint() {
  const h = $('#hint');
  if (!S || !S.buildSel) return h.classList.add('hidden');
  h.classList.remove('hidden');
  h.textContent = S.buildSel === 'deck' ? '点击木筏边缘的虚线格扩建甲板' : S.buildSel === 'remove' ? '点击要拆除的设施' : `点击一块空甲板放置：${FAC[S.buildSel].n}`;
}
function tryBuild(gx, gy) {
  const f = S.buildSel, key = tkey(gx, gy), t = S.tiles[key], prep = scene === 'prep';
  if (f === 'remove') {
    if (!t || !t.fac) return;
    Object.entries(FAC[t.fac.t].c).forEach(([k, q]) => addStock(k, Math.floor(q / 2)));
    log(`拆除了${FAC[t.fac.t].n}`); t.fac = null; AUDIO.sfx('build'); renderBuildPanel(); return;
  }
  if (!canAfford(f)) { toast('材料不足', 'bad'); S.buildSel = null; renderBuildPanel(); updateHint(); return; }
  if (f === 'deck') {
    if (t || !isAdjacentEmpty(gx, gy)) return;
    S.tiles[key] = { x: gx, y: gy, hp: 100, fac: null };
  } else {
    if (!t) return;
    if (t.fac) return toast('这格已经有东西了', 'bad');
    t.fac = { t: f, on: true, hp: FAC[f].hp || 0 };
  }
  Object.entries(FAC[f].c).forEach(([k, q]) => takeStock(k, q));
  S.fx.push({ type: 'build', x: gx, y: gy, t: 0 }); AUDIO.sfx('build');
  S.stats.built++;
  walkTo(gx, gy, 'work');
  if (prep) { log(`🔨 组装好了${FAC[f].n}（${buildMins(f)} 分钟）`, 'good'); advancePrep(buildMins(f)); }
  else { if (S.ch.id !== 'docker') S.sta = clamp(S.sta - 4, 0, 100); log(`🔨 建好了${FAC[f].n}`, 'good'); checkAch(); }
  if (scene !== 'prep' && scene !== 'drift') return;
  if (!canAfford(f)) S.buildSel = null;
  renderBuildPanel(); updateHint();
  if (scene === 'drift') updateDriftHUD(); else updatePrepHUD();
}

/* ================= 阶段二：漂流 ================= */
function startDrift() {
  scene = 'drift';
  let water = 0;
  for (const k of Object.keys(S.stock)) if (ITEMS[k].L) { water += ITEMS[k].L * S.stock[k]; delete S.stock[k]; }
  Object.assign(S, {
    water, min: 18 * 60, speed: 0, sat: 80, hyd: 80, sta: 90, mor: clamp(70 + (S.morBonus || 0), 0, 100), life: 100,
    wh: 0, weather: 'cloud', wind: .5, monsters: [], shots: [], crew: [], crewPos: [], revived: false,
    dest: null, land: null, chartToday: 1, wish: null, nextWishAt: 18 * 60 + 600, acc: {}, shelter: -1,
    buildSel: null, hover: null, fx: [], debris: Array.from({ length: 7 }, () => newDebris(true)), lightning: 0, alertWave: false, forceStorm: 0,
    fishT: Array(S.stock.fish || 0).fill(18 * 60 - 120), journal: [], day: { kills: 0, lost: 0, fish: 0 }, shake: 0, flash: 0,
  });
  S.pl = { x: 0, y: 0, tx: 0, ty: 0, col: [70, 80, 96], hood: true };
  if (S.preCrew) addCrew({ n: '林姐', r: '厨师', d: '熟食士气 +5' });
  S.journal.push({ day: 1, text: `<b>第 1 天 · 傍晚。</b>城市沉下去了。我站在木筏上，看着最后一盏路灯被海水吞掉。${S.preCrew ? '林姐坐在箱子上，一句话也没说。' : '四周只剩下我一个人。'}不管怎样——我还活着。` });
  show('#p1', false); show('#p2', true); show('#buildpanel', false);
  $('#looptxt').textContent = `Loop: ${SAVE.loop}`; $('#actions').dataset.sig = '';
  setSpeed(0); renderBuildPanel(); updateDriftHUD(); saveRun();
  log('第一夜。先在木筏上看看——按 ▶ 或空格让时间开始流动。', 'gold');
}
function addCrew(c) {
  S.crew.push(c);
  const f = freeTiles()[0] || Object.values(S.tiles)[0];
  S.crewPos.push({ x: f.x, y: f.y, tx: f.x, ty: f.y, col: pick([[200, 70, 60], [70, 150, 110], [170, 120, 200], [220, 170, 60]]), hair: pick(['#2a1d14', '#5a3a1a', '#111']) });
}
const dayOf = () => Math.floor(S.min / 1440) + 1;
const hod = () => S.min % 1440;
const isNight = () => hod() >= 19 * 60 || hod() < 6 * 60;
function daylight() { const h = hod() / 60; return h < 6 || h > 19 ? 0 : Math.sin((h - 6) / 13 * Math.PI); }
const crewHas = r => S.crew.some(c => c.r === r);

const SPEED_MPS = [0, 4, 12, 40]; // 游戏分钟 / 真实秒
function setSpeed(s) { if (!S) return; S.speed = s; $$('#timectl .btn[data-s]').forEach(b => b.classList.toggle('on', +b.dataset.s === s)); show('#pausehint', scene === 'drift' && s === 0); }
$$('#timectl .btn[data-s]').forEach(b => b.onclick = () => setSpeed(+b.dataset.s));
function autoPause(why) { if (S.speed) { setSpeed(0); toast(`⏸ ${why}——已自动暂停`, 'gold'); } }
$('#skip').onclick = () => {
  if (scene !== 'drift' || S.monsters.length) return;
  let n = 0; while (scene === 'drift' && !modalOpen && hod() !== 6 * 60 && !S.monsters.length && n++ < 800) step();
  updateDriftHUD();
};

/* ----- 天气 ----- */
function rollWeather() {
  const prev = S.weather;
  if (S.forceStorm > S.min) { S.weather = 'storm'; S.wind = 1; }
  else if (S.shelter === dayOf()) { S.weather = 'cloud'; S.wind = .4; }
  else {
    const T2 = { sun: [['sun', 5], ['cloud', 3], ['fog', 1], ['rain', 1]], cloud: [['sun', 3], ['cloud', 3], ['rain', 3], ['fog', 1], ['storm', 1]],
      rain: [['cloud', 3], ['rain', 3], ['storm', 2], ['sun', 1]], storm: [['rain', 4], ['storm', 2], ['cloud', 2]], fog: [['cloud', 3], ['sun', 2], ['fog', 2]] }[S.weather];
    let r = Math.random() * T2.reduce((s, x) => s + x[1], 0);
    for (const [w, p] of T2) if ((r -= p) <= 0) { S.weather = w; break; }
    S.wind = { sun: .4, cloud: .55, rain: .7, storm: 1, fog: .2 }[S.weather] * rand(.8, 1.1);
  }
  if (S.weather !== prev) {
    log(`天气变为：${WEATHER[S.weather]} ${WNAME[S.weather]}`, S.weather === 'storm' ? 'bad' : '');
    if (S.weather === 'storm') autoPause('暴风雨来了');
  }
}

/* ----- 每分钟模拟 ----- */
function step() {
  S.min++;
  if (S.lightning > 0) S.lightning = Math.max(0, S.lightning - .15);
  const h = hod(), night = isNight(), day = dayOf(), dec = DF().decay;
  const acc = (k, v) => { S.acc[k] = (S.acc[k] || 0) + v; const n = Math.floor(S.acc[k]); S.acc[k] -= n; return n; };

  // 身体状态
  S.sat = clamp(S.sat - 0.045 * dec, 0, 100);
  S.hyd = clamp(S.hyd - 0.075 * dec * (has('thirst') ? .8 : 1) * (S.weather === 'sun' && !night ? 1.25 : 1), 0, 100);
  const sleeping = h < 6 * 60 && !S.monsters.length;
  S.sta = clamp(S.sta + (sleeping ? 0.13 * (S.mor < 20 ? .5 : 1) : -0.018 * dec), 0, 100);
  S.mor = clamp(S.mor - 0.011 * dec - (S.weather === 'storm' ? .01 : 0), 0, 100);
  if (S.sat <= 0) S.life -= 0.08;
  if (S.hyd <= 0) S.life -= 0.15;
  if (S.mor <= 0) S.life -= 0.02;
  if (S.sat > 50 && S.hyd > 50) S.life += 0.012;
  S.life = clamp(S.life, 0, 100);
  if (S.hyd < 12 && (S.water >= 1 || S.stock.cola)) drink(true);
  if (S.sat < 12) eatBest(true);

  // 电力
  const dl = daylight();
  const wf = { sun: 1, cloud: .5, rain: .2, storm: .1, fog: .35 }[S.weather];
  let gen = countFac('solar') * 60 * dl * wf + countFac('wind') * 120 * Math.pow(S.wind, 1.5);
  if (crewHas('机械师')) gen *= 1.25;
  const loads = [];
  facs('turret').forEach(t => loads.push({ t, w: night ? 20 : 0 }));
  facs('purifier').forEach(t => loads.push({ t, w: 40 }));
  facs('lamp').forEach(t => loads.push({ t, w: night ? 10 : 0 }));
  let avail = gen + S.wh * 60;
  const demand = loads.reduce((s, l) => s + l.w, 0);
  S.dieselOn = false;
  if (demand > avail && countFac('diesel') && S.stock.diesel) { avail += 150; S.dieselOn = true; if (acc('diesel', 1 / 240)) { takeStock('diesel'); log('⛽ 柴油机烧掉了一桶柴油'); } }
  let used = 0;
  for (const l of loads) { if (l.w === 0) { l.t.fac.on = false; continue; } if (used + l.w <= avail) { used += l.w; l.t.fac.on = true; } else l.t.fac.on = false; }
  S.wh = clamp(S.wh + (gen + (S.dieselOn ? 150 : 0) - used) / 60, 0, battCap());
  S.genW = gen + (S.dieselOn ? 150 : 0); S.useW = used;
  if (night) S.mor = clamp(S.mor + facs('lamp').filter(t => t.fac.on).length * 0.012, 0, 100);

  // 淡水
  if (S.weather === 'rain' || S.weather === 'storm') S.water += countFac('rain') * 0.007 * (S.weather === 'storm' ? 2 : 1) * (has('rainx') ? 2 : 1);
  S.water += countFac('still') * 0.006 * dl * (S.weather === 'sun' ? 1 : S.weather === 'cloud' ? .5 : .1);
  S.water += facs('purifier').filter(t => t.fac.on).length * 0.012;
  facs('planter').forEach(t => {
    if (S.water > 0.003) { S.water -= 0.003; t.fac.g = (t.fac.g || 0) + 1; if (t.fac.g >= 1800) { t.fac.g = 0; addStock('veg', 2); log('🥬 种植箱收获了 2 份蔬菜', 'good'); floatText(t.x, t.y, '+2 🥬', '#8f8'); } }
  });
  const fishMul = (has('fishing') ? 1.5 : 1) * (crewHas('渔夫') ? 1.5 : 1);
  facs('netf').forEach(t => { const c = acc('net' + t.x + ',' + t.y, 0.0014 * fishMul); if (c) { addStock('fish', c); S.day.fish += c; floatText(t.x, t.y, `+${c} 🐟`, '#9df'); } });

  // 船员每天中午吃喝
  if (h === 12 * 60 && S.crew.length) S.crew.forEach(c => {
    const food = ['fish', 'veg', 'biscuit', 'canned', 'cfish'].find(k => S.stock[k]);
    if (food && S.water >= 2) { takeStock(food); S.water -= 2; }
    else { S.mor -= 8; log(`${c.n} 今天没吃上饭，大家情绪低落`, 'bad'); }
  });
  // 鲜鱼放一天就臭
  if (S.fishT.length && S.min - S.fishT[0] > 1440) {
    let n = 0; while (S.fishT.length && S.min - S.fishT[0] > 1440) { S.fishT.shift(); n++; }
    S.stock.fish -= n; if (S.stock.fish <= 0) delete S.stock.fish;
    log(`🤢 ${n} 条生鱼放臭了（记得早点烤掉）`, 'bad');
  }
  if (h === 6 * 60 && S.stock.veg > 2) takeStock('veg', Math.floor(S.stock.veg * .2));

  if (S.min % 180 === 0) rollWeather();
  if (S.min % 60 === 0) hourly();

  // 风暴
  if (S.weather === 'storm') {
    Object.values(S.tiles).filter(isEdge).forEach(t => { if (Math.random() < .025) damageTile(t, rand(1, 3) * (has('storm') ? .6 : 1) * DF().storm); });
    if (Math.random() < .003) { S.lightning = 1; if (S.speed <= 2) AUDIO.sfx('thunder'); }
  }
  const load = weightKg() / buoyancy();
  if (load > 1) Object.values(S.tiles).forEach(t => { if (Math.random() < .25 * (load - .9)) damageTile(t, .5); });

  // 电台 / 黑潮兽
  if (h === 20 * 60 && RADIO[day] && !S['radio' + day]) { S['radio' + day] = 1; log(RADIO[day], 'gold'); AUDIO.sfx('page'); S.journal.push({ day, text: `<b>第 ${day} 天 · 夜。</b>收音机里传来声音：${RADIO[day].replace('📻 ', '')}` }); }
  if (h === 22 * 60) spawnWave();
  if (h === 5 * 60 + 30 && S.monsters.length) { S.monsters = []; S.alertWave = false; log('天快亮了，黑潮兽沉回了深海。', 'good'); }
  monstersStep();

  // 愿望
  if (!S.wish && S.min >= S.nextWishAt) {
    const pool = ['soup', 'cfish', 'peaches', 'cola', 'veg', 'canned', 'biscuit'];
    const items = []; while (items.length < 3) { const p = pick(pool); if (!items.includes(p)) items.push(p); }
    S.wish = { items, until: S.min + 10 * 60 };
  }
  if (S.wish && S.min > S.wish.until) { S.wish = null; S.mor -= 5; S.nextWishAt = S.min + randi(16, 30) * 60; log('愿望落空了……士气 -5', 'bad'); }

  // 清晨：写日记、规划航线；16:00 抵达
  if (S.land && S.dest) S.land.k = clamp((h - 6 * 60) / 600, 0, 1);
  if (h === 6 * 60 && S.chartToday !== day) { S.chartToday = day; writeJournal(); checkAch(); openChart(); }
  if (h === 16 * 60 && S.dest) arrive();

  // 死亡
  if (S.life <= 0) {
    if (S.ch.id === 'diver' && !S.revived) { S.revived = true; S.life = 35; log('你憋住最后一口气……又活了过来。（潜水教练）', 'gold'); }
    else return die(S.hyd <= 0 ? '脱水' : S.sat <= 0 ? '饥饿' : '衰弱');
  }
  if (!Object.keys(S.tiles).length) return die('木筏沉没');
  if (S.min % 60 === 0 && !modalOpen) { checkAch(); saveRun(); }
}
function hourly() {
  const load = weightKg() / buoyancy();
  if ((S.weather === 'storm' || load > .85) && Math.random() < (S.weather === 'storm' ? .6 : .3)) {
    const protectedKg = countFac('storage') * 40;
    let loose = 0; for (const k in S.stock) if (k !== 'float') loose += ITEMS[k].kg * S.stock[k];
    if (loose > protectedKg) {
      const ks = Object.keys(S.stock).filter(k => k !== 'float');
      if (ks.length) { const k = pick(ks), q = Math.max(1, Math.round(S.stock[k] * .15)); takeStock(k, q); log(`🌊 一个浪打上甲板，冲走了 ${q} 个${ITEMS[k].n}（储物箱能保护物资）`, 'bad'); }
    }
  }
  if (S.weather === 'storm') {
    facs('wind').forEach(t => { if (Math.random() < .04) { t.fac = null; log('🌀 风力机被狂风吹断了！', 'bad'); } });
    facs('solar').forEach(t => { if (Math.random() < .03) { t.fac = null; log('🔆 一块太阳能板被浪掀进了海里！', 'bad'); } });
  }
  if (S.debris.length < 8 && Math.random() < .6) S.debris.push(newDebris(false));
}
function damageTile(t, d) {
  if (t.fac && t.fac.t === 'fence') { t.fac.hp -= d; if (t.fac.hp <= 0) { t.fac = null; log('🚧 一段防护栏被撕碎了', 'bad'); AUDIO.sfx('crack'); } return; }
  if (DIRS.some(([dx, dy]) => { const n = S.tiles[tkey(t.x + dx, t.y + dy)]; return n && n.fac && n.fac.t === 'fence'; })) d *= .4;
  t.hp -= d;
  if (t.hp <= 0) {
    delete S.tiles[tkey(t.x, t.y)];
    log(`💥 一格甲板${t.fac ? `连同${FAC[t.fac.t].n}` : ''}沉进了海里！`, 'bad');
    S.fx.push({ type: 'splash', x: t.x, y: t.y, t: 0 });
    S.stats.lost++; S.day.lost++;
    if (SETTINGS.shake) S.shake = 1; S.flash = 1; AUDIO.sfx('crack'); AUDIO.sfx('splash');
  }
}
function writeJournal() {
  const d = dayOf(), y = S.day;
  const parts = [`<b>第 ${d} 天 · 清晨。</b>`];
  if (y.lost) parts.push(`昨夜失去了 ${y.lost} 格甲板，我能听见木头在水下断裂的声音。`);
  else if (y.kills) parts.push(`昨夜击退了 ${y.kills} 只黑潮兽。手上全是被鱼叉磨出的血泡。`);
  else parts.push(pick(['昨夜很平静。', '我梦见了那座城市，街上的人都在排队买早餐。', '海面像一块黑色的玻璃。']));
  if (y.fish) parts.push(`渔网里有 ${y.fish} 条鱼。`);
  if (S.water < 5) parts.push('淡水快见底了，我开始舔帆布上的露水。');
  else if (S.water > 30) parts.push('水桶是满的，这让人安心。');
  const food = Object.entries(S.stock).reduce((s, [k, q]) => s + (ITEMS[k].food > 2 ? q : 0), 0);
  if (food < 3) parts.push('吃的不多了。');
  if (S.mor < 30) parts.push('我开始害怕闭上眼睛。');
  else if (S.mor > 75) parts.push('今天的海很好看。');
  if (S.crew.length) parts.push(`${S.crew.map(c => c.n).join('、')}还在。`);
  S.journal.push({ day: d, text: parts.join('') });
  S.day = { kills: 0, lost: 0, fish: 0 };
  toast('📓 日记已更新（右侧「日志」）');
}

/* ----- 黑潮兽 ----- */
function spawnWave() {
  const d = dayOf();
  if (S.shelter === d) { log('灯塔的光照着海面，今夜很安静。', 'good'); return; }
  const big = TIDE_NIGHTS.includes(d);
  let n = big ? 2 + d : (d > 1 && Math.random() < .45 ? 1 + Math.floor(d / 3) : 0);
  n = Math.round(n * DF().mon); if (big) n = Math.max(2, n);
  if (!n) return;
  for (let i = 0; i < n; i++) S.monsters.push(newMonster(i * rand(4, 12)));
  S.alertWave = true; AUDIO.sfx('monster'); AUDIO.sfx('alarm');
  log(big ? `🌊 大潮夜！黑潮兽群来了（${n} 只）` : `👁️ 水下有东西在靠近……（${n} 只）`, 'bad');
  autoPause(big ? '大潮夜，黑潮兽群来了' : '有东西在靠近');
}
function newMonster(delay = 0) {
  const d = dayOf();
  const pool = Object.entries(MONSTERS).filter(([, m]) => m.from <= d).flatMap(([k]) => Array(k === 'eater' ? 5 : k === 'eel' ? 3 : 2).fill(k));
  const type = pick(pool), M = MONSTERS[type];
  const a = rand(0, Math.PI * 2), r = rand(6, 8), hp = Math.max(1, Math.round((3 + Math.floor(d / 4)) * M.hp * DF().hp));
  return { type, x: Math.cos(a) * r, y: Math.sin(a) * r, hp, max: hp, delay, tgt: null, wob: rand(0, 6), hit: 0 };
}
function killMonster(m) { S.stats.kills++; S.day.kills++; floatText(m.x, m.y, '✦', '#7dffe8'); }
function monstersStep() {
  const tiles = Object.values(S.tiles);
  for (const m of S.monsters) {
    if (m.delay > 0) { m.delay--; continue; }
    const M = MONSTERS[m.type] || MONSTERS.eater;
    let tgt = m.tgt && S.tiles[tkey(m.tgt.x, m.tgt.y)];
    if (!tgt) {
      const edges = tiles.filter(isEdge); if (!edges.length) continue;
      tgt = edges.reduce((b, t) => Math.hypot(t.x - m.x, t.y - m.y) < Math.hypot(b.x - m.x, b.y - m.y) ? t : b);
      m.tgt = { x: tgt.x, y: tgt.y };
    }
    const dx = tgt.x - m.x, dy = tgt.y - m.y, dist = Math.hypot(dx, dy);
    if (dist > .78) { m.x += dx / dist * M.spd; m.y += dy / dist * M.spd; }
    else damageTile(tgt, M.bite);
    if (has('light')) facs('lamp').forEach(t => { if (t.fac.on && Math.hypot(t.x - m.x, t.y - m.y) < 1.8) m.hp -= .02; });
  }
  facs('turret').forEach(t => {
    if (!t.fac.on) return;
    t.fac.cd = (t.fac.cd || 0) - 1; if (t.fac.cd > 0) return;
    const tg = S.monsters.filter(m => m.delay <= 0 && Math.hypot(m.x - t.x, m.y - t.y) < 3.6).sort((a, b) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y))[0];
    if (tg) { tg.hp -= 1; tg.hit = 1; t.fac.cd = 6; S.shots.push({ x0: t.x, y0: t.y, x1: tg.x, y1: tg.y, t: 1 }); if (S.speed <= 1) AUDIO.sfx('harpoon'); }
  });
  const before = S.monsters.length;
  S.monsters = S.monsters.filter(m => { if (m.hp > 0) return true; killMonster(m); return false; });
  if (before && !S.monsters.length && S.alertWave) { S.alertWave = false; S.mor = clamp(S.mor + 10, 0, 100); log('黑潮退去了。你活过了这一夜。士气 +10', 'good'); AUDIO.sfx('good'); }
}

/* ----- 角色走位 ----- */
function walkTo(x, y, pose = 'stand', dir = 1) { if (!S.pl) return; S.pl.tx = x; S.pl.ty = y; S.pl.act = pose; S.pl.dir = dir; S.pl.actUntil = performance.now() + 2600; }
function freeTiles() { return Object.values(S.tiles).filter(t => !t.fac); }
function edgeTileNear(x, y) { const e = Object.values(S.tiles).filter(isEdge); return e.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0]; }
function updatePeople(dt) {
  const p = S.pl; if (!p) return;
  const now = performance.now();
  if (!S.tiles[tkey(Math.round(p.tx), Math.round(p.ty))]) { const f = freeTiles()[0] || Object.values(S.tiles)[0]; if (f) { p.tx = f.x; p.ty = f.y; } }
  if (scene === 'drift' && hod() < 6 * 60 && !S.monsters.length && (!p.actUntil || now > p.actUntil)) p.act = 'sleep';
  else if (p.act === 'sleep') p.act = 'stand';
  if ((!p.actUntil || now > p.actUntil) && p.act !== 'sleep' && Math.random() < dt * .12) { const f = pick(freeTiles()); if (f) { p.tx = f.x + rand(-.2, .2); p.ty = f.y + rand(-.2, .2); p.act = 'stand'; } }
  const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
  if (d > .05) { const v = Math.min(d, dt * 2.2); p.x += dx / d * v; p.y += dy / d * v; p.pose = 'walk'; p.phase = (p.phase || 0) + dt * 12; }
  else p.pose = p.actUntil && now < p.actUntil ? p.act : (p.act === 'sleep' ? 'sleep' : 'stand');
  S.crewPos.forEach(c => {
    if (!c.tx || Math.random() < dt * .08) { const f = pick(freeTiles()) || Object.values(S.tiles)[0]; if (f) { c.tx = f.x + rand(-.25, .25); c.ty = f.y + rand(-.25, .25); } }
    const ex = c.tx - c.x, ey = c.ty - c.y, e = Math.hypot(ex, ey);
    if (e > .05) { const v = Math.min(e, dt * 1.6); c.x += ex / e * v; c.y += ey / e * v; c.pose = 'walk'; c.phase = (c.phase || 0) + dt * 11; }
    else c.pose = scene === 'drift' && hod() < 6 * 60 && !S.monsters.length ? 'sleep' : 'stand';
  });
}

/* ----- 行动 ----- */
function eatBest(auto = false) {
  let order = ['soup', 'cfish', 'veg', 'fish', 'canned', 'biscuit', 'peaches', 'cola'];
  if (S.wish) order = [...S.wish.items.filter(k => S.stock[k]), ...order];
  const k = order.find(k => S.stock[k] && ITEMS[k].food > 2);
  if (!k) { if (!auto) toast('没有吃的了！', 'bad'); return; }
  eat(k, auto);
}
function eat(k, auto = false) {
  if (!takeStock(k)) return;
  const it = ITEMS[k];
  S.sat = clamp(S.sat + it.food, 0, 100);
  let mor = it.mor || 0; if (crewHas('厨师') && ['soup', 'cfish'].includes(k)) mor += 5;
  if (it.drink) S.hyd = clamp(S.hyd + it.drink, 0, 100);
  S.mor = clamp(S.mor + mor, 0, 100);
  let msg = `${auto ? '饿得发慌，' : ''}吃了${it.n}`;
  if (S.wish && S.wish.items.includes(k)) { S.mor = clamp(S.mor + 25, 0, 100); msg += '——正是想吃的！士气 +25'; S.wish = null; S.nextWishAt = S.min + randi(18, 36) * 60; AUDIO.sfx('good'); }
  S.stats.meals++;
  log(msg, mor >= 0 ? 'good' : ''); if (!auto) AUDIO.sfx('eat');
  floatText(S.pl.x, S.pl.y, `${it.i} +${it.food}`, '#ffd977');
}
function drink(auto = false) {
  if (S.water >= 1) { S.water -= 1; S.hyd = clamp(S.hyd + 40, 0, 100); log(auto ? '渴得受不了，喝了 1L 水' : '喝了 1L 淡水'); if (!auto) AUDIO.sfx('drink'); floatText(S.pl.x, S.pl.y, '💧 +40', '#8cf'); }
  else if (S.stock.cola) eat('cola', auto);
  else if (!auto) toast('没有淡水了！', 'bad');
}
function heal(k) {
  if (!takeStock(k)) return;
  S.life = clamp(S.life + ITEMS[k].heal, 0, 100); if (ITEMS[k].mor) S.mor = clamp(S.mor + ITEMS[k].mor, 0, 100); log(`用了${ITEMS[k].n}`, 'good');
}
const ACTIONS = [
  { id: 'eat', n: '🍽️ 吃东西', f: () => { walkTo(S.pl.x, S.pl.y, 'work'); eatBest(); } },
  { id: 'drink', n: '💧 喝水', f: () => drink() },
  { id: 'fish', n: '🎣 钓鱼', sta: 8, mins: 30, f: () => {
      const e = edgeTileNear(S.pl.x, S.pl.y); if (e) walkTo(e.x, e.y, 'fish', S.tiles[tkey(e.x + 1, e.y)] ? -1 : 1);
      const p = .55 * (has('fishing') ? 1.4 : 1) * (crewHas('渔夫') ? 1.2 : 1) * (isNight() ? .7 : 1);
      S.mor = clamp(S.mor + 2, 0, 100);
      if (Math.random() < p) { addStock('fish'); S.day.fish++; log('🎣 钓到一条鱼！', 'good'); AUDIO.sfx('fish'); floatText(S.pl.tx, S.pl.ty, '+1 🐟', '#9df'); }
      else if (Math.random() < .25) { const k = pick(['plank', 'rope', 'nails', 'tarp']); addStock(k); log(`🎣 鱼没上钩，但勾上来一个${ITEMS[k].n}`, 'good'); AUDIO.sfx('fish'); }
      else log('🎣 等了半小时，什么也没钓到……');
    } },
  { id: 'cook', n: '🔥 烹饪', mins: 20, need: () => countFac('stove'), f: () => {
      if (!S.stock.fish) { toast('没有生鱼可以烹饪', 'bad'); return false; }
      const st = facs('stove')[0]; walkTo(st.x, st.y, 'work');
      let s = 0, c = 0;
      while (S.stock.fish) { takeStock('fish'); if (S.stock.veg && takeStock('veg')) { addStock('soup'); s++; } else { addStock('cfish'); c++; } }
      S.stats.soups += s;
      log(`🔥 做了 ${c ? c + ' 份烤鱼 ' : ''}${s ? s + ' 份热鱼汤' : ''}`, 'good'); S.mor = clamp(S.mor + 3, 0, 100); AUDIO.sfx('good');
    } },
  { id: 'pedal', n: '🚲 脚踏发电', sta: 12, mins: 30, need: () => countFac('pedal'), f: () => { const p = facs('pedal')[0]; walkTo(p.x, p.y, 'work'); S.wh = clamp(S.wh + 70, 0, battCap()); log('🚲 蹬了半小时，存下 70Wh 电'); } },
  { id: 'heal', n: '⛑️ 治疗', need: () => S.stock.medkit || S.stock.vitamins, f: () => heal(S.stock.medkit ? 'medkit' : 'vitamins') },
  { id: 'repair', n: '🪵 修补甲板', sta: 6, mins: 20, need: () => Object.values(S.tiles).some(t => t.hp < 100), f: () => {
      const t = Object.values(S.tiles).filter(t => t.hp < 100).sort((a, b) => a.hp - b.hp)[0];
      if (!takeStock('plank')) { toast('需要 1 根原木', 'bad'); return false; }
      walkTo(t.x, t.y, 'work'); t.hp = 100; log('修好了一格甲板'); AUDIO.sfx('build');
    } },
];
function advance(mins) { for (let i = 0; i < mins && scene === 'drift' && !modalOpen; i++) step(); }
function doAction(a) {
  if (scene !== 'drift' || modalOpen) return;
  if (a.sta && S.sta < a.sta) return toast('体力不足，先休息（夜里会睡觉恢复）', 'bad');
  if (a.f() === false) return;
  if (a.sta) S.sta -= a.sta;
  if (a.mins) advance(a.mins);
  updateDriftHUD();
}

/* ----- 按钮 ----- */
$('#bBuild').onclick = () => {
  const p = $('#buildpanel'); p.classList.toggle('hidden');
  if (p.classList.contains('hidden')) { S.buildSel = null; updateHint(); } else renderBuildPanel();
};
function openStock() {
  const groups = { food: '食物（点击食用）', build: '建材', energy: '能源', defense: '防御', med: '医疗（点击使用）' };
  const box = openModal(`<h2>📦 木筏物资</h2><p class="sm" style="margin-bottom:8px">淡水 ${S.water.toFixed(1)} L <button class="btn" id="sDrink" style="padding:2px 10px;font-size:12px" ${S.water >= 1 ? '' : 'disabled'}>💧 喝 1L</button> · 电量 ${S.wh.toFixed(0)}/${battCap()} Wh · 载重 ${weightKg().toFixed(0)}/${buoyancy().toFixed(0)} kg · 储物箱保护 ${countFac('storage') * 40} kg${S.stock.fish ? ` · 最早的生鱼还能放 ${fmtDur(Math.max(0, 1440 - (S.min - S.fishT[0])))}` : ''}</p>` +
    Object.entries(groups).map(([g, gn]) => {
      const it = Object.entries(S.stock).filter(([k]) => ITEMS[k].cat === g);
      const use = g === 'food' || g === 'med';
      return `<div class="ph3" style="margin-top:12px">${gn}</div><div class="${use ? 'uselist' : ''}">${it.length ? it.map(([k, q]) => `<span class="chip" ${use ? `data-use="${k}"` : ''} style="font-size:14px" title="${desc(k)}">${ITEMS[k].i} ${ITEMS[k].n} × ${q}</span>`).join('') : '<span class="sm">无</span>'}</div>`;
    }).join('') + (S.crew.length ? `<div class="ph3" style="margin-top:12px">船员</div>${S.crew.map(c => `<span class="chip">🙋 ${c.n}（${c.r}：${c.d}）</span>`).join('')}` : ''), { width: '680px' });
  box.querySelectorAll('[data-use]').forEach(c => c.onclick = () => { const k = c.dataset.use; if (ITEMS[k].heal) heal(k); else eat(k); updateDriftHUD(); openStock(); });
  box.querySelector('#sDrink').onclick = () => { drink(); updateDriftHUD(); openStock(); };
}
$('#bStock').onclick = openStock;
function openJournal(tab = 'journal') {
  const box = openModal(`<h2>📓 漂流日志</h2><div class="tabs"><button class="btn ${tab === 'journal' ? 'on' : ''}" data-t="journal">日记</button><button class="btn ${tab === 'log' ? 'on' : ''}" data-t="log">事件记录</button></div>` +
    (tab === 'journal' ? `<div class="journal">${S.journal.slice().reverse().map(j => `<p>${j.text}</p>`).join('')}</div>`
      : `<table class="log">${S.log.slice(-120).reverse().map(l => `<tr><td>${l.t}</td><td>${l.msg}</td></tr>`).join('')}</table>`), { width: '680px' });
  box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => openJournal(b.dataset.t));
  AUDIO.sfx('page');
}
$('#bLog').onclick = () => openJournal();
$('#bChart').onclick = () => openChart(true);

/* ----- 海图 ----- */
function genNodes() {
  const n = 2 + (countFac('sail') ? 1 : 0), d = dayOf();
  const pool = ['rooftop', 'rooftop', 'container', 'fishing', 'survivors', 'lighthouse', 'stormfront'];
  const out = [];
  if (d >= 12) out.push('ark');
  while (out.length < n) { const p = pick(pool); if (!out.includes(p) && !(p === 'survivors' && S.crew.length >= 3)) out.push(p); }
  return out;
}
function openChart(viewOnly = false) {
  if (viewOnly) {
    if (S.dest) return openModal(`<h2>🧭 海图</h2><p>正在漂向：<b>${NODES[S.dest].i} ${NODES[S.dest].n}</b>，预计 16:00 抵达。</p>`);
    return openModal(`<h2>🧭 海图</h2><p class="sm" style="font-size:14px;line-height:1.8">每天早上 06:00 根据洋流规划当天航线。${dayOf() < 12 ? '<br>传说中的方舟，会在第 12 天之后出现在海图上。' : ''}</p>`);
  }
  S.nodes = genNodes();
  const fog = S.weather === 'fog';
  AUDIO.sfx('page');
  const box = openModal(`<h2>🧭 第 ${dayOf()} 天 · 规划航线</h2><p class="sm" style="margin-bottom:14px;font-size:13px">洋流把你带到了岔路口。${countFac('sail') ? '船帆让你多了一个选择。' : '造一面船帆可以多 1 个选择。'}${fog ? ' <b style="color:var(--amber)">浓雾中看不清目的地。</b>' : ''} 预计 16:00 抵达。</p>
    <div class="cards">${S.nodes.map(k => { const hide = fog && k !== 'ark'; return `<div class="ccard node" data-n="${k}"><div class="big">${hide ? '❔' : NODES[k].i}</div><h4>${hide ? '雾中的影子' : NODES[k].n}</h4><p>${hide ? '???' : NODES[k].d}</p></div>`; }).join('')}
    <div class="ccard node" data-n="drift"><div class="big">〰️</div><h4>随波逐流</h4><p>不费力气，捞点漂浮物。体力 +10</p></div></div>`, { closable: false, width: '1000px' });
  box.querySelectorAll('[data-n]').forEach(c => c.onclick = () => {
    closeModal();
    if (c.dataset.n === 'drift') { S.dest = null; S.land = null; S.sta = clamp(S.sta + 10, 0, 100); const k = pick(['plank', 'rope', 'canned', 'tarp']); addStock(k); log(`〰️ 你随洋流漂着，捞起一个${ITEMS[k].n}`); }
    else { S.dest = c.dataset.n; S.land = { type: S.dest, k: 0 }; log(`🧭 航向：${NODES[S.dest].n}`, 'gold'); }
    saveRun();
  });
}
function arrive() {
  const k = S.dest; S.dest = null; if (S.land) S.land.k = 1;
  S.stats.nodes++;
  const mul = S.ch.id === 'diver' ? 1.3 : 1;
  const give = (list, n) => { const got = {}; for (let i = 0; i < Math.round(n * mul); i++) { const it = pick(list); addStock(it); got[it] = (got[it] || 0) + 1; } return Object.entries(got).map(([a, q]) => `${ITEMS[a].i}${ITEMS[a].n}×${q}`).join('、'); };
  let txt = '', extra = '';
  if (k === 'ark') return win('ark');
  if (k === 'rooftop') txt = `你攀上半截露出水面的楼顶，翻出：${give(['plank', 'plank', 'nails', 'metal', 'rope', 'canned', 'biscuit', 'tarp', 'glass', 'seeds'], randi(3, 5))}`;
  if (k === 'container') {
    txt = `你撬开锈死的集装箱门：${give(['parts', 'parts', 'battery', 'metal', 'canned', 'canned', 'medkit', 'net'], randi(3, 4))}`;
    if (Math.random() < .25) { addStock('panel'); txt += '，还有一块完好的太阳能组件！'; }
    if (Math.random() < .2) { addStock('harpoon'); txt += '，一把鱼叉！'; }
    for (let i = 0; i < 3; i++) S.monsters.push(newMonster(30 + i * 8)); S.alertWave = true;
    txt += '<br><b style="color:var(--red)">——铁皮的回响惊动了水下的东西。</b>';
  }
  if (k === 'lighthouse') {
    S.shelter = dayOf(); S.weather = 'cloud'; S.mor = clamp(S.mor + 15, 0, 100); addStock('battery');
    txt = '你把木筏系在灯塔下。塔里有半箱电池，光束扫过海面。今夜不会有袭击。士气 +15';
    if (dayOf() >= 8) {
      const can = (S.stock.parts || 0) >= 3 && (S.stock.battery || 0) >= 2 && (S.stock.glass || 0) >= 1;
      txt += `<br><br>塔顶的灯坏了一半。如果修好它，过往的木筏就能看见这里——你也许可以<b>留下来</b>，守着这盏灯。<br><span class="sm">需要：⚙️机械零件×3、🔋蓄电池×2、🪟玻璃板×1（你有 ${S.stock.parts || 0} / ${S.stock.battery || 0} / ${S.stock.glass || 0}）</span>`;
      extra = `<button class="btn" id="keep" ${can ? '' : 'disabled'}>🗼 修好灯塔，留下来</button>`;
    }
  }
  if (k === 'survivors') {
    const c = { n: pick(NAMES.filter(n => !S.crew.some(x => x.n === n))), ...pick(CREW_ROLES) };
    let added = 0;
    for (const t of Object.values(S.tiles)) for (const [dx, dy] of DIRS) { const x = t.x + dx, y = t.y + dy; if (added < 2 && isAdjacentEmpty(x, y)) { S.tiles[tkey(x, y)] = { x, y, hp: 80, fac: null }; added++; } }
    addCrew(c);
    addStock('canned'); S.water += 3; S.mor = clamp(S.mor + 10, 0, 100);
    txt = `你救起了 <b>${c.n}</b>（${c.r}：${c.d}）。TA 的小筏绑在了你的木筏边上（+${added} 格甲板），还带来一点物资。<br>但从今天起，每天中午要多分一份口粮和 2L 水。`;
    S.journal.push({ day: dayOf(), text: `<b>第 ${dayOf()} 天 · 下午。</b>我们救起了${c.n}。TA 抓着我的手不肯放。木筏上又多了一个人的呼吸声。` });
  }
  if (k === 'fishing') { const n = Math.round(randi(5, 8) * mul); addStock('fish', n); S.day.fish += n; txt = `海鸟在头顶盘旋，海面下密密麻麻全是鱼。你捞了 ${n} 条。<b>生鱼放一天就会臭</b>，记得烤掉！`; }
  if (k === 'stormfront') { S.forceStorm = S.min + 360; S.weather = 'storm'; S.water += 8; txt = '天边压下来一堵黑墙。你用所有能装水的东西接住了雨（+8L）——然后风暴到了。'; }
  log(`抵达 ${NODES[k].n}`, 'gold'); AUDIO.sfx('good'); checkAch();
  const box = openModal(`<h2>${NODES[k].i} ${NODES[k].n}</h2><p style="line-height:1.9">${txt}</p><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">${extra}<button class="btn gold" id="ok">${extra ? '只歇一晚' : '好'}</button></div>`, { width: '600px' });
  box.querySelector('#ok').onclick = closeModal;
  const kp = box.querySelector('#keep'); if (kp) kp.onclick = () => { takeStock('parts', 3); takeStock('battery', 2); takeStock('glass', 1); modalOnClose = null; win('keeper'); };
}

/* ----- 结局 ----- */
function statsHTML() {
  const st = S.stats;
  return `<div class="statsgrid"><div><b>${dayOf()}</b><span>漂流天数</span></div><div><b>${st.kills}</b><span>击退黑潮兽</span></div><div><b>${st.fish}</b><span>收获的鱼</span></div><div><b>${st.built}</b><span>建造设施</span></div>
    <div><b>${S.crew.length}</b><span>船员</span></div><div><b>${st.lost}</b><span>失去的甲板</span></div><div><b>${st.nodes}</b><span>到过的地方</span></div><div><b>${DIFFS[S.diff].n}</b><span>难度</span></div></div>`;
}
function die(cause) {
  scene = 'over'; clearRun(); AUDIO.sfx('bad'); AUDIO.setMood('night');
  if (modalOpen) { modalOnClose = null; $('#modal').classList.add('hidden'); modalOpen = false; }
  const days = dayOf();
  SAVE.best = Math.max(SAVE.best, days);
  const pool = Object.keys(BOTTLES).filter(b => !has(b));
  const hint = { '脱水': ['rainx', 'thirst'], '饥饿': ['fishing', 'cash'], '木筏沉没': ['buoy', 'storm', 'oldwood', 'light'], '衰弱': ['cash', 'tide'] }[cause] || [];
  const offer = [];
  hint.filter(h => pool.includes(h)).slice(0, 1).forEach(h => offer.push(h));
  while (offer.length < Math.min(3, pool.length)) { const p = pick(pool); if (!offer.includes(p)) offer.push(p); }
  const box = openModal(`<h2 style="color:#ff7a6a">第 ${SAVE.loop} 次轮回 · 结束</h2>
    <p style="margin-bottom:4px">死因：<b>${cause}</b></p>${statsHTML()}
    <p class="sm" style="margin-bottom:16px;font-size:13px;line-height:1.8">海水再一次灌了进来。在意识消失之前，你在日志最后一页写下一句话，塞进瓶子里——<br>它会漂回十小时之前，冲上你醒来的那片岸。${SAVE.bottles.length >= 5 ? '<b style="color:var(--amber)">（瓶子已满 5 个，最旧的一封会被冲走）</b>' : ''}</p>
    <div class="cards">${offer.map(b => `<div class="ccard" data-b="${b}"><div class="big">🍾</div><h4>「${BOTTLES[b].n}」</h4><p>${BOTTLES[b].d}</p></div>`).join('') || '<p>你已经记住了一切。</p>'}</div>
    ${offer.length ? '' : '<div style="text-align:center;margin-top:12px"><button class="btn gold" id="again">再次醒来</button></div>'}`, { closable: false, width: '920px' });
  const finish = b => { if (b) { SAVE.bottles.push(b); if (SAVE.bottles.length > 5) SAVE.bottles.shift(); } SAVE.loop++; persist(); closeModal(); showTitle(); };
  box.querySelectorAll('[data-b]').forEach(c => c.onclick = () => finish(c.dataset.b));
  const ag = box.querySelector('#again'); if (ag) ag.onclick = () => finish(null);
}
function win(kind) {
  scene = 'over'; clearRun(); SAVE.wins++; SAVE.best = Math.max(SAVE.best, dayOf()); SAVE.loop++; persist(); AUDIO.sfx('ach'); AUDIO.setMood('day');
  if (modalOpen) { modalOnClose = null; $('#modal').classList.add('hidden'); modalOpen = false; }
  if (S.land) S.land.k = 1;
  unlock(kind === 'keeper' ? 'keeper' : 'ark'); if (kind === 'ark' && S.diff === 'hard') unlock('hardark');
  const story = kind === 'keeper'
    ? ['你把最后一块电池接上。', '塔顶的灯亮了，光束像一把刀，把黑潮切成两半。', '那天夜里，远处有三盏小小的灯，朝这边慢慢漂过来。', `<b style="color:var(--gold)">守灯人结局 · 漂流 ${dayOf()} 天</b>`]
    : ['雾散开的时候，你看见了它。', '一艘巨大的、灯火通明的船，甲板上种着树，孩子在奔跑。', '有人朝你挥手，放下了绳梯。', `<b style="color:var(--gold)">方舟结局 · 漂流 ${dayOf()} 天 · 船员 ${S.crew.length} 人</b>`];
  const box = openModal(`<div class="story">${story.map((l, i) => `<p style="animation-delay:${i * .8}s">${l}</p>`).join('')}</div>${statsHTML()}
    <div style="text-align:right;margin-top:10px"><button class="btn gold" id="go">回到标题</button></div>`, { closable: false, width: '760px' });
  box.querySelector('#go').onclick = () => { closeModal(); showTitle(); };
}

/* ----- HUD ----- */
function statRow(ic, nm, v, col) { return `<div class="stat"><div class="nm">${ic} ${nm}</div><div class="bar"><div style="width:${v}%;background:${col}"></div></div><div class="num">${Math.round(v)}/100</div></div>`; }
function updateDriftHUD() {
  if (scene !== 'drift') return;
  const col = v => v < 25 ? 'linear-gradient(90deg,#a3322a,#e05a4c)' : v < 50 ? 'linear-gradient(90deg,#a0782a,#d9a640)' : 'linear-gradient(90deg,#357e43,#5bbf6a)';
  const kg = weightKg(), by = buoyancy(), load = kg / by, tiles = Object.values(S.tiles);
  const hull = tiles.length ? tiles.reduce((s, t) => s + t.hp, 0) / tiles.length : 0;
  $('#stats').innerHTML = statRow('🍖', '饱食', S.sat, col(S.sat)) + statRow('💧', '水分', S.hyd, S.hyd < 25 ? col(0) : 'linear-gradient(90deg,#2a6aa8,#4aa8ff)') +
    statRow('⚡', '体力', S.sta, col(S.sta)) + statRow('🧠', '士气', S.mor, S.mor < 25 ? col(0) : 'linear-gradient(90deg,#7a4a9a,#b07ad0)') + statRow('❤️', '生命', S.life, col(S.life)) +
    `<div class="res"><div class="${S.water < 3 ? 'warn' : ''}">🛢️ 淡水 <b>${S.water.toFixed(1)} L</b></div><div>🔋 电量 <b>${S.wh.toFixed(0)}/${battCap()}Wh</b></div>
     <div class="${load > 1 ? 'warn' : ''}">⚓ 载重 <b>${kg.toFixed(0)}/${by.toFixed(0)}kg</b></div><div>⚡ 发 <b>${(S.genW || 0).toFixed(0)}W</b> / 用 <b>${(S.useW || 0).toFixed(0)}W</b></div>
     <div class="${hull < 50 ? 'warn' : ''}">🪵 船体 <b>${hull.toFixed(0)}%</b> · ${tiles.length} 格</div><div>🙋 船员 <b>${S.crew.length}</b>${S.dest ? ` · 🧭 <b>${NODES[S.dest].n}</b>` : ''}</div></div>`;
  $('#daynum').textContent = `DAY${dayOf()}`;
  $('#clocktxt').textContent = fmtHM(hod());
  $('#weather').textContent = isNight() && S.weather === 'sun' ? '🌙' : WEATHER[S.weather]; $('#weather').title = WNAME[S.weather];
  drawDial();
  const al = $('#alert');
  if (S.monsters.length || load > 1 || S.weather === 'storm') {
    al.classList.remove('hidden');
    al.innerHTML = `<div class="h">${S.monsters.length ? '黑潮来袭！' : S.weather === 'storm' ? '暴风雨！' : '木筏进水！'}</div><div class="row">🪵 船体 <div style="width:130px;height:8px;background:#3a1a18;border-radius:4px;overflow:hidden"><div style="height:100%;width:${hull}%;background:#ff7a6a"></div></div> ${hull.toFixed(0)}%</div>
      ${S.monsters.length ? `<div class="row">👁️ 黑潮兽 × ${S.monsters.length}　<span style="color:#ffe9a0">点击它们用鱼叉刺！</span></div>` : ''}${load > 1 ? '<div class="row">⚓ 超载！扩建甲板、绑浮桶，或少带点东西</div>' : ''}`;
  } else al.classList.add('hidden');
  const avail = ACTIONS.filter(a => !a.need || a.need());
  const sig = avail.map(a => a.id).join();
  if ($('#actions').dataset.sig !== sig) {
    $('#actions').dataset.sig = sig;
    $('#actions').innerHTML = avail.map(a => `<button class="btn" data-a="${a.id}">${a.n}${a.sta || a.mins ? `<span class="c">${a.mins ? a.mins + '分' : ''}${a.sta ? ' -' + a.sta + '⚡' : ''}</span>` : ''}</button>`).join('');
    $$('#actions .btn').forEach(b => b.onclick = () => doAction(ACTIONS.find(a => a.id === b.dataset.a)));
  }
  const w = $('#wish');
  if (S.wish) { w.classList.remove('hidden'); w.innerHTML = `<span class="w">[愿望]</span><span class="pk">三选一</span><span>${S.wish.items.map(k => ITEMS[k].i + ITEMS[k].n).join(' / ')}</span><span style="color:var(--cyan)">${fmtHM(S.wish.until - S.min)}</span>`; }
  else w.classList.add('hidden');
  show('#skip', isNight() && !S.monsters.length && hod() !== 6 * 60);
  updateGoal();
}
function drawDial() {
  const c = $('#dial').getContext('2d'), r = 80;
  c.clearRect(0, 0, 160, 160); c.save(); c.translate(80, 80);
  const g = c.createRadialGradient(0, -20, 10, 0, 0, r); g.addColorStop(0, '#6a4a42'); g.addColorStop(1, '#3a2622');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r - 3, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = 'rgba(60,90,160,.6)'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, r - 12, (19 / 24) * Math.PI * 2 - Math.PI / 2, (30 / 24) * Math.PI * 2 - Math.PI / 2); c.stroke();
  c.fillStyle = '#ddd'; c.font = 'bold 14px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let hh = 0; hh < 24; hh += 2) { const a = hh / 24 * Math.PI * 2 - Math.PI / 2; c.fillText(String(hh), Math.cos(a) * 54, Math.sin(a) * 54); }
  const a = hod() / 1440 * Math.PI * 2 - Math.PI / 2;
  c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); c.stroke();
  c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
  c.restore();
}

/* ----- 悬停信息 ----- */
function hideTip() { $('#tip').classList.add('hidden'); }
function facStatus(t) {
  const f = t.fac.t, on = t.fac.on !== false;
  const P = (ok, txt) => `<span class="${ok ? 'ok' : 'no'}">${txt}</span>`;
  switch (f) {
    case 'rain': return S.weather === 'rain' || S.weather === 'storm' ? P(1, `正在接雨水 · ${(0.007 * 60 * (S.weather === 'storm' ? 2 : 1) * (has('rainx') ? 2 : 1)).toFixed(1)}L/小时`) : P(0, '没下雨');
    case 'still': return daylight() > 0 ? P(1, `蒸馏中 · ${(0.006 * 60 * daylight() * (S.weather === 'sun' ? 1 : S.weather === 'cloud' ? .5 : .1)).toFixed(2)}L/小时`) : P(0, '夜里不工作');
    case 'purifier': return on ? P(1, '运转中 · 0.7L/小时') : P(0, '电力不足，已停机');
    case 'netf': return P(1, '每天约 2 条鱼');
    case 'planter': return P(1, `生长 ${Math.round((t.fac.g || 0) / 18)}%`);
    case 'solar': return P(daylight() > 0, `${(60 * daylight() * ({ sun: 1, cloud: .5, rain: .2, storm: .1, fog: .35 }[S.weather])).toFixed(0)}W`);
    case 'wind': return P(1, `${(120 * Math.pow(S.wind, 1.5)).toFixed(0)}W`);
    case 'batt': return `储电 ${S.wh.toFixed(0)}/${battCap()}Wh`;
    case 'fence': return `耐久 ${Math.round(t.fac.hp)}/80`;
    case 'turret': case 'lamp': return isNight() ? (on ? P(1, '运转中') : P(0, '电力不足')) : '白天待机';
    case 'diesel': return S.dieselOn ? P(1, '正在发电') : `待机 · 柴油 ${S.stock.diesel || 0} 桶`;
    case 'stove': return `生鱼 ${S.stock.fish || 0} 条可烹饪`;
    case 'storage': return `保护 40kg 物资`;
    case 'sail': return '海图多 1 个选择';
    case 'pedal': return '行动栏「脚踏发电」';
  }
  return '';
}
function updateTip(e) {
  const tip = $('#tip');
  if (!S || modalOpen || !(scene === 'drift' || (scene === 'prep' && S.view === 'dock'))) return hideTip();
  let html = '';
  const m = scene === 'drift' && S.monsters.find(m => monsterHit(m, e));
  if (m) { const M = MONSTERS[m.type] || MONSTERS.eater; html = `<h5>${M.n}</h5>${M.d}<br>生命 ${Math.max(0, Math.ceil(m.hp))}/${m.max} · 点击刺击（-3⚡）`; }
  else {
    const t = S.tiles[tkey(...raftHover(e))];
    if (t && (t.fac || t.hp < 100)) html = t.fac ? `<h5>${FAC[t.fac.t].i} ${FAC[t.fac.t].n}</h5>${FAC[t.fac.t].d}<br>${scene === 'drift' ? facStatus(t) + '<br>' : ''}甲板 ${Math.round(t.hp)}%` : `<h5>甲板</h5>耐久 ${Math.round(t.hp)}% · 可以「修补甲板」`;
  }
  if (!html) return hideTip();
  tip.innerHTML = html; tip.classList.remove('hidden');
  tip.style.left = Math.min(W - 280, e.clientX + 18) + 'px'; tip.style.top = Math.min(H - 120, e.clientY + 14) + 'px';
}

/* ================= 主循环 ================= */
let lastT = performance.now(), simAcc = 0, hudAcc = 0, moodAcc = 0;
function frame(now) {
  const dt = Math.min(.1, (now - lastT) / 1000); lastT = now; T += dt;
  try {
    if (S && S.min == null && (scene === 'prep' || scene === 'transition')) {
      if (S.travel && now - S.travel.start >= S.travel.dur) finishTravel();
      if (S.view === 'dock') { S.hourF = 8 + S.t1 / 60; S.load = weightKg() / buoyancy(); S.sinkPx = clamp((S.load - .6) * 14, 0, 10) * ISO.s; S.battCap = battCap(); updatePeople(dt); drawRaftScene(S, dt, { harbor: true, cy: .56 }); }
      else drawCity(S, now, mouse);
    } else if (S && S.min != null) {
      if (scene === 'drift' && !modalOpen) {
        simAcc += dt * SPEED_MPS[S.speed];
        let n = 0; while (simAcc >= 1 && n < 200 && scene === 'drift' && !modalOpen) { simAcc--; step(); n++; }
      }
      S.hourF = hod() / 60; S.load = weightKg() / buoyancy(); S.sinkPx = clamp((S.load - .6) * 14, 0, 10) * ISO.s; S.battCap = battCap(); S.speedMul = S.speed ? 1 + S.speed : .4;
      updatePeople(dt);
      hudAcc += dt; if (hudAcc > .25) { hudAcc = 0; updateDriftHUD(); }
      moodAcc += dt; if (moodAcc > 1) { moodAcc = 0; AUDIO.setMood(S.monsters.length ? 'danger' : isNight() ? 'night' : 'day'); AUDIO.setScene('sea', S.weather); }
      drawRaftScene(S, dt);
    } else drawTitle(dt);
  } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

/* ================= 输入 ================= */
function raftHover(e) { const [gx, gy] = unIso(e.clientX, e.clientY + 4); return [Math.round(gx), Math.round(gy)]; }
function monsterHit(m, e) { if (m.delay > 0) return false; const [x, y] = iso(m.x, m.y); return Math.hypot(e.clientX - x, e.clientY - (y - 12 * ISO.s)) < 30 * ISO.s; }
const raftView = () => scene === 'drift' || (scene === 'prep' && S.view === 'dock');
cv.addEventListener('mousemove', e => {
  mouse = { x: e.clientX, y: e.clientY };
  let cur = 'default';
  if (scene === 'prep' && S.view === 'city' && cityHit(mouse)) cur = 'pointer';
  if (S && raftView()) { S.hover = raftHover(e); if (S.buildSel) cur = 'cell'; else if (scene === 'drift' && S.monsters.some(m => monsterHit(m, e))) cur = 'crosshair'; }
  cv.style.cursor = cur;
  updateTip(e);
});
cv.addEventListener('mouseleave', hideTip);
cv.addEventListener('mousedown', e => {
  if (modalOpen || !S) return;
  if (e.button === 2) { if (raftView()) { S.buildSel = null; renderBuildPanel(); updateHint(); updateGoal(); } return; }
  if (scene === 'prep' && S.view === 'city') { const d = cityHit({ x: e.clientX, y: e.clientY }); if (d) goTo(d.id); return; }
  if (!raftView()) return;
  if (scene === 'drift' && !S.buildSel) {
    const m = S.monsters.find(m => monsterHit(m, e));
    if (m) {
      if (S.sta < 3) return toast('体力不足', 'bad');
      S.sta -= 3; const dmg = S.stock.harpoon ? 2 : 1; m.hp -= dmg; m.hit = 1;
      const e2 = edgeTileNear(m.x, m.y); if (e2) walkTo(e2.x, e2.y, 'work');
      S.shots.push({ x0: S.pl.x, y0: S.pl.y, x1: m.x, y1: m.y, t: 1 });
      floatText(m.x, m.y, `-${dmg}`, '#7dffe8'); AUDIO.sfx('harpoon'); AUDIO.sfx('hit');
      if (m.hp <= 0) toast('刺中了！黑潮兽沉了下去', 'good');
      S.monsters = S.monsters.filter(x => { if (x.hp > 0) return true; killMonster(x); return false; });
      if (!S.monsters.length && S.alertWave) { S.alertWave = false; S.mor = clamp(S.mor + 10, 0, 100); log('黑潮退去了。你活过了这一夜。士气 +10', 'good'); AUDIO.sfx('good'); }
      updateTip(e); return;
    }
  }
  if (S.buildSel) { const [gx, gy] = raftHover(e); tryBuild(gx, gy); }
});
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalOpen) { if ($('#modal .x')) closeModal(); return; }
    if (S && raftView() && S.buildSel) { S.buildSel = null; renderBuildPanel(); updateHint(); updateGoal(); return; }
    openMenu(); return;
  }
  if (scene === 'drift' && !modalOpen) {
    if (e.key === ' ') { setSpeed(S.speed ? 0 : 1); e.preventDefault(); }
    if (['1', '2', '3'].includes(e.key)) setSpeed(+e.key);
    if (e.key === 'b' || e.key === 'B') $('#bBuild').click();
  }
});

showTitle();
requestAnimationFrame(frame);
