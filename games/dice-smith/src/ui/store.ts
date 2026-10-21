import { getItem, getJSON, removeItem, setItem, setJSON } from './storage';
import { useEffect, useState } from 'preact/hooks';
import { CONSUMABLES } from '../core/consumables';
import { HANDS } from '../core/hands';
import { BOSSES, BOUNTIES, OPPONENTS } from '../core/opponents';
import { randomSeed } from '../core/rng';
import { flip, play, reroll, toggleHold } from '../core/round';
import {
  buy,
  chooseAugment,
  encore,
  collect,
  discardConsumable,
  finishRound,
  leaveShop,
  moveArtifact,
  newRun,
  packBack,
  pickFromPack,
  playBlind,
  rerollShop,
  RUN_VERSION,
  sellArtifact,
  skipBlind,
  useConsumable,
} from '../core/run';
import { preview } from '../core/score';
import type { GEvent, Run, ScoreResult } from '../core/types';
import { sfx, startMusic } from './audio';
import type { DiceTable } from './dice3d/DiceTable';
import { floatAt, floatText, pulse, screenShake, splatter, stamp } from './fx';
import type { PuppetState } from './puppet/Puppet';
import { loadCoach, saveCoach, stepsWaitingFor } from './coach';

const SAVE_KEY = 'diceSmith.run.v2';
const REC_KEY = 'diceSmith.records.v2';

export interface Tip {
  title: string;
  body: string;
  tag?: string;
  x: number;
  y: number;
}

export type Picking = { from: 'slot'; uid: number; id: string } | { from: 'pack'; index: number; id: string };

export interface Records {
  runs: number;
  wins: number;
  bestAct: number;
  bestHand: number;
  /** Wins per stake (寻常, 加注, 豪赌). */
  stakeWins: number[];
  bestEndless: number;
}

export interface Codex {
  arts: string[];
  augs: string[];
  bosses: string[];
}

const CODEX_KEY = 'diceSmith.codex.v1';

export function loadCodex(): Codex {
  return { arts: [], augs: [], bosses: [], ...getJSON<Partial<Codex>>(CODEX_KEY, {}) };
}

/** Highest stake the player may choose: one above the best stake they have won. */
export function unlockedStake(rec = loadRecords()) {
  const best = rec.stakeWins.reduce((b, w, i) => (w > 0 ? i : b), -1);
  return Math.min(2, best + 1);
}

interface UI {
  title: boolean;
  busy: boolean;
  tip: Tip | null;
  overlay: 'hands' | 'bag' | 'rules' | 'codex' | null;
  picking: Picking | null;
  flipMode: boolean;
  selectedArt: number | null;
  toast: { text: string; key: number } | null;
  puppet: PuppetState;
  /** Displayed round score (lags the core during the scoring animation). */
  score: number;
  chips: number;
  mult: number;
  handLabel: string;
  activeArt: number | null;
  /** Final product shown on the screen during scoring. */
  product: number | null;
  /** Big entrance card for a headliner. */
  banner: { title: string; sub: string; key: number } | null;
  /** What the fallen puppet says. */
  loseLine: string | null;
  menu: boolean;
  /** Player tapped to hurry the current animation. */
  ffwd: boolean;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function load(): Run | null {
  try {
    const raw = getItem(SAVE_KEY);
    const r = raw ? (JSON.parse(raw) as Run) : null;
    return r && r.version === RUN_VERSION ? r : null;
  } catch {
    return null;
  }
}

export function loadRecords(): Records {
  const r = { runs: 0, wins: 0, bestAct: 0, bestHand: 0, stakeWins: [0, 0, 0], bestEndless: 0, ...getJSON<Partial<Records>>(REC_KEY, {}) };
  if (!Array.isArray(r.stakeWins)) r.stakeWins = [0, 0, 0];
  return r;
}

class Store {
  run: Run | null = load();
  ui: UI = {
    title: true,
    busy: false,
    tip: null,
    overlay: null,
    picking: null,
    flipMode: false,
    selectedArt: null,
    toast: null,
    puppet: 'idle',
    score: 0,
    chips: 0,
    mult: 0,
    handLabel: '',
    activeArt: null,
    product: null,
    banner: null,
    loseLine: null,
    menu: false,
    ffwd: false,
  };
  /** Animation speed multiplier: 1, 2 or 4. */
  speed = Number(getItem('diceSmith.speed') ?? '1') || 1;
  table: DiceTable | null = null;
  coachSeen: string[] = loadCoach();
  coachOff = getItem('diceSmith.coachOff') === '1';
  private listeners = new Set<() => void>();
  private recorded = false;
  private queue: Promise<void> = Promise.resolve();
  private pendingRoll = false;

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  emit() {
    this.listeners.forEach((f) => f());
  }

  save() {
    const r = this.run;
    if (!r) return;
    if (r.screen.t === 'over') {
      this.record();
      removeItem(SAVE_KEY);
      return;
    }
    setItem(SAVE_KEY, JSON.stringify(r));
  }

  private record() {
    if (this.recorded || !this.run || this.run.screen.t !== 'over') return;
    this.recorded = true;
    const r = this.run;
    const rec = loadRecords();
    rec.bestHand = Math.max(rec.bestHand, r.stats.best);
    if (r.endless) {
      // An encore ending: the run was already counted when the final headliner fell.
      rec.bestEndless = Math.max(rec.bestEndless, r.act);
    } else {
      rec.runs++;
      rec.bestAct = Math.max(rec.bestAct, r.act);
      if (r.screen.t === 'over' && r.screen.won) {
        rec.wins++;
        rec.stakeWins[r.stake] = (rec.stakeWins[r.stake] ?? 0) + 1;
      }
    }
    setJSON(REC_KEY, rec);
  }

  /** Remember everything the player has laid eyes on, for the 图鉴. */
  private noteCodex() {
    const r = this.run;
    if (!r) return;
    const c = loadCodex();
    const add = (list: string[], id: string) => !list.includes(id) && list.push(id);
    r.artifacts.forEach((a) => add(c.arts, a.id));
    r.shop?.offers.forEach((o) => o.kind === 'artifact' && add(c.arts, o.id));
    if (r.screen.t === 'pack') r.screen.options.forEach((o) => o.kind === 'artifact' && add(c.arts, o.id));
    if (r.screen.t === 'augment') r.screen.options.forEach((id) => add(c.augs, id));
    r.augments.forEach((id) => add(c.augs, id));
    if (r.round?.boss && r.round.phase === 'won') add(c.bosses, r.round.boss);
    setJSON(CODEX_KEY, c);
  }

  stakeChoice = Math.min(Number(getItem('diceSmith.stake') ?? '0') || 0, unlockedStake());

  setStake(v: number) {
    this.stakeChoice = Math.max(0, Math.min(unlockedStake(), v));
    setItem('diceSmith.stake', String(this.stakeChoice));
    sfx.click();
    this.emit();
  }

  encore() {
    this.recorded = false;
    this.ui.puppet = 'idle';
    this.ui.loseLine = null;
    sfx.curtain();
    this.mutate((r) => encore(r));
    this.toast('加演开锣！目标分每幕翻倍，能走多远走多远。');
  }

  setSpeed(v: number) {
    this.speed = v;
    setItem('diceSmith.speed', String(v));
    if (this.table) this.table.speed = v;
    this.emit();
  }

  /** Wait, scaled by the speed setting and cut short when the player taps to hurry. */
  private pause(ms: number) {
    return wait(this.ui.ffwd ? 0 : ms / this.speed);
  }

  /** Tap during an animation: hurry the rest of it. */
  hurry() {
    if (this.ui.busy) this.ui.ffwd = true;
  }

  openMenu(open = !this.ui.menu) {
    this.ui.menu = open;
    this.ui.tip = null;
    sfx.click();
    this.emit();
  }

  abandon() {
    this.ui.menu = false;
    this.ui.busy = false;
    this.mutate((r) => void (r.screen = { t: 'over', won: false }));
  }

  // ---------- coaching ----------

  coachDone(id: string) {
    if (this.coachSeen.includes(id)) return;
    this.coachSeen = [...this.coachSeen, id];
    saveCoach(this.coachSeen);
    sfx.click();
    this.emit();
  }

  /** The player did something a hint was waiting for. */
  coachAction(action: string) {
    const ids = stepsWaitingFor(action).filter((id) => !this.coachSeen.includes(id));
    if (!ids.length) return;
    this.coachSeen = [...this.coachSeen, ...ids];
    saveCoach(this.coachSeen);
  }

  coachSkipAll() {
    this.coachOff = true;
    setItem('diceSmith.coachOff', '1');
    this.emit();
  }

  coachReset() {
    this.coachSeen = [];
    this.coachOff = false;
    saveCoach([]);
    removeItem('diceSmith.coachOff');
    this.toast('班主会重新提点你。下一局从头教起。');
  }

  /** New players get the scripted teaching round. */
  get wantsTutorial() {
    return !this.coachOff && !this.coachSeen.includes('play');
  }

  hasSave() {
    return !!load();
  }

  toast(text: string) {
    this.ui.toast = { text, key: Date.now() };
    this.emit();
  }

  setTip(t: Tip | null) {
    const cur = this.ui.tip;
    if (cur === t || (t && cur && cur.title === t.title && cur.x === t.x && cur.y === t.y)) return;
    this.ui.tip = t;
    this.emit();
  }

  /** Mutate the run, persist, re-render; returns events. */
  private mutate(fn: (r: Run) => GEvent[] | void): GEvent[] {
    if (!this.run) return [];
    const before = this.run.screen.t;
    const ev = fn(this.run) ?? [];
    this.noteCodex();
    if (this.run.screen.t !== before) {
      this.ui.tip = null;
      this.ui.selectedArt = null;
    }
    this.save();
    this.syncLive();
    this.emit();
    return ev;
  }

  /** Enqueue an async animation so actions play in order. */
  private enqueue(task: () => Promise<void>) {
    this.queue = this.queue.then(task).catch((e) => console.error(e));
    return this.queue;
  }

  /** Live hand preview (type and base numbers) when not mid-animation. */
  syncLive() {
    const r = this.run;
    if (!r?.round || this.ui.busy || r.screen.t !== 'round') return;
    const p = preview(r, r.round);
    this.ui.handLabel = `${HANDS[p.type].name}${r.levels[p.type] > 1 ? ` · ${r.levels[p.type]} 级` : ''}`;
    this.ui.chips = p.chips;
    this.ui.mult = p.mult;
    this.ui.score = r.round.score;
    this.table?.setPreview(r.round.phase === 'rolling' ? p.scoring : []);
  }

  // ---------- run lifecycle ----------

  newGame(seed = randomSeed()) {
    this.run = newRun(seed, { tutorial: this.wantsTutorial, stake: this.stakeChoice });
    this.recorded = false;
    this.ui = { ...this.ui, title: false, busy: false, overlay: null, picking: null, puppet: 'idle', score: 0, product: null };
    this.save();
    this.emit();
    startMusic();
  }

  continueGame() {
    this.run = load();
    this.recorded = false;
    this.ui.title = false;
    this.ui.busy = false;
    this.ui.puppet = 'idle';
    this.syncLive();
    this.emit();
    startMusic();
    if (this.run?.round && this.run.screen.t === 'round' && this.run.round.phase !== 'rolling') this.enqueue(() => this.endRound());
  }

  toTitle() {
    this.ui.title = true;
    this.ui.overlay = null;
    this.emit();
  }

  // ---------- table ----------

  attachTable(t: DiceTable | null) {
    this.table = t;
    const r = this.run;
    if (!t || !r) return;
    t.speed = this.speed;
    const round = r.round;
    t.setDice(r.dice, !!round?.hidden);
    if (round) {
      if (this.pendingRoll) {
        this.pendingRoll = false;
        void t.roll(r.dice.map((_, i) => i), round.rolled.map((x) => x.face));
      } else t.show(round.rolled.map((x) => x.face), round.rolled.map((x) => x.held));
    }
  }

  private refreshDice() {
    const r = this.run;
    if (r && this.table) this.table.setDice(r.dice, !!r.round?.hidden);
  }

  // ---------- screens ----------

  pickAugment(i: number) {
    sfx.gong(3);
    this.mutate((r) => chooseAugment(r, i));
  }

  playBlind() {
    this.coachAction('playBlind');
    sfx.curtain();
    this.ui.puppet = 'idle';
    this.ui.score = 0;
    this.ui.product = null;
    this.ui.loseLine = null;
    const ev = this.mutate((r) => playBlind(r));
    const boss = this.run?.round?.boss;
    if (boss) {
      const b = BOSSES[boss];
      this.ui.banner = { title: b.name, sub: `${b.title} · ${b.desc}`, key: Date.now() };
      sfx.gong(6);
      setTimeout(() => {
        this.ui.banner = null;
        this.emit();
      }, 2800);
    }
    this.pendingRoll = !this.table;
    void this.enqueue(() => this.playEvents(ev));
  }

  skipBlind() {
    sfx.click();
    this.mutate((r) => skipBlind(r));
  }

  collect() {
    sfx.coin();
    this.mutate((r) => collect(r));
  }

  // ---------- round actions ----------

  tapDie(i: number) {
    const r = this.run;
    const round = r?.round;
    if (!r || !round || this.ui.busy || round.phase !== 'rolling') return;
    if (this.ui.flipMode) {
      this.ui.flipMode = false;
      const ev = this.mutate((run) => flip(run, round, i));
      void this.enqueue(() => this.playEvents(ev));
      return;
    }
    if (!toggleHold(round, i)) return sfx.deny();
    sfx.hold();
    this.table?.setHeld(round.rolled.map((x) => x.held));
    this.mutate(() => undefined);
  }

  toggleFlipMode() {
    this.ui.flipMode = !this.ui.flipMode;
    sfx.click();
    this.emit();
  }

  reroll() {
    const round = this.run?.round;
    if (!round || this.ui.busy || round.rerolls <= 0) return sfx.deny();
    const ev = this.mutate((r) => reroll(r, round));
    if (!ev.length) return sfx.deny();
    this.coachAction('reroll');
    void this.enqueue(() => this.playEvents(ev));
  }

  playHand() {
    const round = this.run?.round;
    if (!round || this.ui.busy || round.phase !== 'rolling') return;
    this.ui.busy = true;
    this.ui.ffwd = false;
    this.ui.flipMode = false;
    this.coachAction('play');
    this.emit();
    const ev = this.mutate((r) => play(r, round));
    void this.enqueue(async () => {
      await this.playEvents(ev);
      this.ui.busy = false;
      this.ui.ffwd = false;
      this.syncLive();
      this.emit();
    });
  }

  private async endRound() {
    const r = this.run;
    if (!r?.round) return;
    const won = r.round.phase === 'won';
    if (won) {
      this.ui.puppet = 'down';
      const rd = r.round;
      this.ui.loseLine = rd.boss ? BOSSES[rd.boss].lose ?? null : OPPONENTS[rd.opponent]?.lose ?? null;
      sfx.win();
      this.emit();
      stamp('screen', '胜', 110);
      await this.pause(1700);
    } else {
      sfx.lose();
      await this.pause(1200);
    }
    this.ui.busy = false;
    this.ui.ffwd = false;
    this.mutate((run) => finishRound(run));
  }

  // ---------- feedback ----------

  private async playEvents(ev: GEvent[]) {
    const r = this.run!;
    for (const e of ev) {
      switch (e.t) {
        case 'roll': {
          if (!r.round) break;
          this.refreshDice();
          sfx.roll(e.dice.length);
          await this.table?.roll(e.dice, r.round.rolled.map((x) => x.face));
          this.table?.show(r.round.rolled.map((x) => x.face), r.round.rolled.map((x) => x.held));
          break;
        }
        case 'flip':
          sfx.flip();
          await this.table?.flip(e.die, r.round!.rolled[e.die].face);
          break;
        case 'change':
          sfx.flip();
          floatAt(this.table?.screenPos(e.die) ?? null, '七十二变', 'fx-rule');
          await this.table?.roll([e.die], r.round!.rolled.map((x) => x.face));
          break;
        case 'reroll+':
          floatText('btn-reroll', `+${e.amount} 重掷`, 'fx-chips');
          break;
        case 'score':
          await this.animateScore(e.result);
          break;
        case 'money':
          floatText('money', `${e.amount > 0 ? '+' : ''}${e.amount}`, e.amount > 0 ? 'fx-money' : 'fx-bad');
          sfx.coin();
          break;
        case 'shatter':
          sfx.shatter();
          splatter(this.table?.screenPos(e.die) ?? null, '#9FD4F0', 26);
          this.refreshDice();
          await wait(250);
          break;
        case 'bounty':
          this.toast(`悬赏达成：${BOUNTIES[e.id].desc}（${BOUNTIES[e.id].reward}）`);
          sfx.gong(8);
          break;
        case 'won':
        case 'lost':
          this.ui.busy = true;
          this.emit();
          await this.endRound();
          return;
      }
    }
  }

  private async animateScore(res: ScoreResult) {
    const fast = reduced();
    const ui = this.ui;
    ui.handLabel = HANDS[res.type].name;
    ui.product = null;
    res.scoring.forEach((i) => this.table?.setGlow(i, true));
    let delay = fast ? 60 : 300;
    let tick = 0;
    for (const st of res.steps) {
      if (st.k === 'base') {
        ui.chips = st.chips;
        ui.mult = st.mult;
        this.emit();
        pulse('plaque-chips');
        pulse('plaque-mult');
        sfx.gong(0);
        await this.pause(delay + 120);
        continue;
      }
      ui.chips = st.chips;
      ui.mult = Math.round(st.mult * 100) / 100;
      if (st.k === 'die') {
        this.table?.pulse(st.i);
        floatAt(this.table?.screenPos(st.i) ?? null, st.label, st.fx.xmult ? 'fx-xmult' : st.fx.mult ? 'fx-mult' : st.fx.money ? 'fx-money' : 'fx-chips');
      } else if (st.k === 'art') {
        ui.activeArt = st.a;
        pulse(`art-${st.a}`);
        floatText(`art-${st.a}`, st.label, st.fx.xmult ? 'fx-xmult' : st.fx.mult ? 'fx-mult' : st.fx.money ? 'fx-money' : 'fx-chips');
      } else {
        floatText('screen', st.label, 'fx-rule');
      }
      if (st.k !== 'rule') {
        if (st.fx.xmult) sfx.cymbal();
        else if (st.fx.mult) sfx.gong(++tick);
        else if (st.fx.money) sfx.coin();
        else sfx.tick(++tick);
      }
      pulse(st.k === 'die' || (st.k === 'art' && st.fx.chips) ? 'plaque-chips' : 'plaque-mult');
      this.emit();
      await this.pause(delay);
      delay = Math.max(fast ? 40 : 85, delay * 0.88);
    }
    ui.activeArt = null;
    res.scoring.forEach((i) => this.table?.setGlow(i, false));
    // The product lands on the screen.
    ui.product = res.total;
    this.emit();
    await this.pause(fast ? 100 : 380);
    const round = this.run!.round;
    const fullHouse = round && res.total >= round.target;
    sfx.bigGong(Math.min(1.6, 0.6 + Math.log10(Math.max(10, res.total)) / 4));
    this.ui.puppet = 'hit';
    screenShake(Math.min(2.4, 0.4 + Math.log10(Math.max(10, res.total)) / 2.5));
    splatter('puppet', '#FFD27A', Math.min(60, 10 + Math.log10(Math.max(10, res.total)) * 10), 'spark');
    if (fullHouse) {
      // One hand cleared the whole target: the crowd goes up.
      floatText('screen', '满堂彩', 'fx-big fx-xmult');
      splatter('screen', '#FFD27A', 70, 'spark');
      sfx.cymbal();
    }
    const from = ui.score;
    const to = this.run!.round?.score ?? from + res.total;
    const t0 = performance.now();
    const dur = (fast ? 100 : 600) / this.speed;
    while (!this.ui.ffwd && performance.now() - t0 < dur) {
      ui.score = Math.round(from + (to - from) * Math.min(1, (performance.now() - t0) / dur));
      this.emit();
      await wait(30);
    }
    ui.score = to;
    ui.product = null;
    this.ui.puppet = 'idle';
    this.emit();
    await this.pause(fast ? 50 : 260);
  }

  // ---------- shop & packs ----------

  buy(i: number) {
    const before = this.run?.screen.t;
    let ok = false;
    this.mutate((r) => void (ok = buy(r, i)));
    if (!ok) return sfx.deny();
    sfx.buy();
    if (this.run && this.run.artifacts.length) this.coachAction('buyArtifact');
    if (before === 'shop' && (this.run?.screen.t as string) === 'pack') sfx.gong(2);
  }

  rerollShop() {
    let ok = false;
    this.mutate((r) => void (ok = rerollShop(r)));
    if (ok) sfx.roll(2);
    else sfx.deny();
  }

  leaveShop() {
    this.coachAction('leaveShop');
    sfx.click();
    this.mutate((r) => leaveShop(r));
  }

  sell(i: number) {
    this.ui.selectedArt = null;
    this.mutate((r) => void sellArtifact(r, i));
    sfx.coin();
  }

  move(i: number, dir: -1 | 1) {
    this.mutate((r) => moveArtifact(r, i, i + dir));
    if (this.ui.selectedArt !== null) this.ui.selectedArt = Math.max(0, Math.min((this.run?.artifacts.length ?? 1) - 1, i + dir));
    sfx.click();
    this.emit();
  }

  selectArt(i: number | null) {
    this.ui.selectedArt = this.ui.selectedArt === i ? null : i;
    sfx.click();
    this.emit();
  }

  pickPack(index: number) {
    const r = this.run;
    if (!r || r.screen.t !== 'pack') return;
    const o = r.screen.options[index];
    if (!o || o.sold) return;
    if (o.kind === 'consumable' && CONSUMABLES[o.id].target !== 'none') {
      this.ui.picking = { from: 'pack', index, id: o.id };
      this.emit();
      return;
    }
    let msg: string | null = null;
    this.mutate((run) => void (msg = pickFromPack(run, index)));
    if (msg) {
      sfx.gong(4);
      this.toast(msg);
    } else sfx.deny();
  }

  skipPack() {
    this.mutate((r) => packBack(r));
  }

  // ---------- consumables ----------

  useSlot(uid: number) {
    const r = this.run;
    const c = r?.consumables.find((x) => x.uid === uid);
    if (!r || !c || this.ui.busy) return;
    const d = CONSUMABLES[c.id];
    if (d.target !== 'none') {
      this.ui.picking = { from: 'slot', uid, id: c.id };
      this.ui.tip = null;
      this.emit();
      return;
    }
    let msg: string | null = null;
    this.mutate((run) => void (msg = useConsumable(run, uid)));
    if (msg) {
      sfx.gong(5);
      this.toast(msg);
      this.refreshDice();
    } else sfx.deny();
  }

  discard(uid: number) {
    this.mutate((r) => discardConsumable(r, uid));
    sfx.click();
  }

  cancelPick() {
    this.ui.picking = null;
    this.emit();
  }

  /** Apply the pending consumable to a face (or die). */
  async applyPick(die: number, face: number, fxKey: string) {
    const p = this.ui.picking;
    if (!p) return;
    const kind = CONSUMABLES[p.id].kind;
    sfx.carve();
    splatter(fxKey, '#D9B98A', 24, 'chip');
    stamp(fxKey, kind === 'talisman' ? '符' : '刻', 54);
    await wait(520);
    let msg: string | null = null;
    this.mutate((r) => void (msg = p.from === 'slot' ? useConsumable(r, p.uid, die, face) : pickFromPack(r, p.index, die, face)));
    this.ui.picking = null;
    if (msg) this.toast(msg);
    else sfx.deny();
    this.refreshDice();
    const round = this.run?.round;
    if (round && this.table) this.table.show(round.rolled.map((x) => x.face), round.rolled.map((x) => x.held));
    this.emit();
  }

  setOverlay(o: UI['overlay']) {
    this.ui.overlay = this.ui.overlay === o ? null : o;
    sfx.click();
    this.emit();
  }
}

export const store = new Store();

export function useStore() {
  const [, force] = useState(0);
  useEffect(() => store.subscribe(() => force((v) => v + 1)), []);
  return store;
}

if (import.meta.env.DEV) (window as any).__store = store;
