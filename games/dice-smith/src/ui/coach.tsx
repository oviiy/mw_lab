// 班主提点: one spotlighted hint at a time, each shown once, in the order the player meets things.
// Hints that ask for an action complete themselves when the action happens.
import { getItem, setItem } from './storage';
import { useEffect, useState } from 'preact/hooks';
import { flipsAvailable } from '../core/round';
import type { Run } from '../core/types';
import { layoutRef } from './Stage';
import { store } from './store';

const KEY = 'diceSmith.coach.v1';

export function loadCoach(): string[] {
  try {
    return JSON.parse(getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveCoach(seen: string[]) {
  setItem(KEY, JSON.stringify(seen));
}

interface Step {
  id: string;
  /** data-coach key of the element to spotlight. */
  target: string;
  text: (run: Run) => string;
  when: (run: Run) => boolean;
  /** Completes when the store reports this action instead of a button press. */
  wait?: string;
}

const tut = (run: Run) => run.tutorial && run.act === 1 && run.blind === 0;
const idle = () => !store.ui.busy && !store.ui.picking && !store.ui.overlay;
const inRound = (run: Run) => run.screen.t === 'round' && !!run.round && run.round.phase === 'rolling' && idle();

export const STEPS: Step[] = [
  {
    id: 'start',
    target: 'blind-now',
    text: () => '好戏开锣。今晚要连赢六幕，每幕三场。\n先从第一场开始——点「开演」。',
    when: (r) => r.screen.t === 'select' && r.act === 1 && r.blind === 0,
    wait: 'playBlind',
  },
  {
    id: 'goal',
    target: 'goal',
    text: () => '每一场都有个「目标分」。\n在出手次数用完之前，把得分凑到目标，就算赢。',
    when: (r) => inRound(r) && r.round!.handsPlayed === 0,
  },
  {
    id: 'play',
    target: 'btn-play',
    text: (r) => (tut(r) ? '台下这三颗就是你的骰子——一对五。\n先什么都别管，直接「出手」看看。' : '三颗骰子掷好了。点「出手」，按牌型计分。'),
    when: (r) => inRound(r) && r.round!.handsPlayed === 0,
    wait: 'play',
  },
  {
    id: 'formula',
    target: 'plaques',
    text: (r) =>
      tut(r)
        ? '得分 = 筹 × 倍。\n对子的底筹 10，加上两颗 5 的点数得 20 筹；再乘对子的底倍 2，就是 40 分。\n牌型越好，筹和倍都越高。'
        : '得分 = 筹 × 倍。牌型越好，筹和倍都越高。',
    when: (r) => inRound(r) && r.round!.handsPlayed >= 1,
  },
  {
    id: 'hold',
    target: 'dice',
    text: (r) => (tut(r) ? '这手是 3 · 4 · 1。\n点 3 和 4 把它们「扣住」，再按「重掷」——只差一颗就是顺子。' : '不满意？点骰子把它「扣住」，再按「重掷」，只会重掷没扣住的。'),
    when: (r) => inRound(r) && r.round!.handsPlayed >= 1 && r.round!.rerolls > 0,
    wait: 'reroll',
  },
  {
    id: 'budget',
    target: 'rerolls',
    text: (r) => (tut(r) && r.round!.handsPlayed === 1 ? '顺子！三颗连续，比对子值钱得多。\n注意：重掷次数整场共用，不是每手都有。现在「出手」吧。' : '重掷次数整场共用，不是每手都有，用完就没了。'),
    when: (r) => inRound(r) && r.round!.anyReroll,
  },
  {
    id: 'cashout',
    target: 'cash',
    text: () => '赢了就结账。\n过关有赏，剩下的出手也换成钱；每存 5 金，还多给 1 金利息。',
    when: (r) => r.screen.t === 'cashout',
  },
  {
    id: 'shop',
    target: 'stall-goods',
    text: () => '这是集市。\n「法器」买下后挂在台下，每次出手都会替你加分。挑一件买下吧。',
    when: (r) => r.screen.t === 'shop' && idle(),
    wait: 'buyArtifact',
  },
  {
    id: 'rail',
    target: 'rail',
    text: () => '法器挂在这根绳上，计分时从左往右依次生效。\n点一下法器，可以挪位置或者卖掉。',
    when: (r) => r.artifacts.length > 0 && (r.screen.t === 'shop' || r.screen.t === 'select') && idle(),
  },
  {
    id: 'consumable',
    target: 'cons',
    text: () => '这是消耗品，用一次就没了。\n「星」给一种牌型升级，「刻刀」改骰子的面。点它就能用。',
    when: (r) => r.consumables.length > 0 && r.screen.t !== 'pack' && idle(),
  },
  {
    id: 'next',
    target: 'btn-next',
    text: () => '逛完了，就去下一场。',
    when: (r) => r.screen.t === 'shop' && idle(),
    wait: 'leaveShop',
  },
  {
    id: 'types',
    target: 'link-hands',
    text: () => '一共七种牌型：散、对子、顺子、豹子……\n记不住没关系，随时点「牌型」查看。',
    when: (r) => r.stats.rounds >= 1 && (r.screen.t === 'select' || inRound(r)),
  },
  {
    id: 'boss',
    target: 'blind-now',
    text: () => '每一幕的最后一场是「头牌」。\n头牌带着一条「戒律」，会改掉一条规则——看清楚再开演。',
    when: (r) => r.screen.t === 'select' && r.blind === 2,
  },
  {
    id: 'augment',
    target: 'aug',
    text: () => '一幕打完，可以选一个「命格」。\n命格整局都生效，会改写规则。挑一个合你打法的。',
    when: (r) => r.screen.t === 'augment',
  },
  {
    id: 'skip',
    target: 'btn-skip',
    text: () => '从第二幕起，小场和大场可以「跳过」——\n不拿过关的钱，换一支「签」。',
    when: (r) => r.screen.t === 'select' && r.act >= 2 && r.blind < 2,
  },
  {
    id: 'bounty',
    target: 'rule',
    text: () => '「悬赏」：这一场额外的小目标。\n做到了，结账时有赏。',
    when: (r) => inRound(r) && !!r.round!.bounty,
  },
  {
    id: 'pack',
    target: 'pack',
    text: () => '礼包里挑一样带走。\n刻刀和符挑中就立刻使用。',
    when: (r) => r.screen.t === 'pack' && !store.ui.picking,
  },
  {
    id: 'carve',
    target: 'picker',
    text: () => '每颗骰子展开成十字。挑一面下刀——\n刻过的面会永远留在骰子上。',
    when: () => !!store.ui.picking,
  },
  {
    id: 'flip',
    target: 'btn-flip',
    text: () => '「翻面」能把一颗骰子翻到对面。\n骰子相对两面之和总是 7：1↔6、2↔5、3↔4。',
    when: (r) => inRound(r) && flipsAvailable(r, r.round!) > 0,
  },
];

/** The first unseen step whose moment has come and whose target is on screen. */
function current(run: Run | null): Step | null {
  if (!run || store.ui.title || store.coachOff) return null;
  for (const s of STEPS) {
    if (store.coachSeen.includes(s.id)) continue;
    if (s.when(run) && document.querySelector(`[data-coach="${s.target}"]`)) return s;
  }
  return null;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function measure(target: string): Box | null {
  const el = document.querySelector(`[data-coach="${target}"]`);
  const st = document.querySelector('.stage');
  if (!el || !st) return null;
  const r = el.getBoundingClientRect();
  const s = st.getBoundingClientRect();
  const k = layoutRef.current.scale;
  return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
}

export function Coach() {
  const run = store.run;
  const step = current(run);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!step) return setBox(null);
    const upd = () => setBox(measure(step.target));
    upd();
    // Targets can still be animating in; keep tracking for a moment.
    const iv = setInterval(upd, 120);
    const stop = setTimeout(() => clearInterval(iv), 1500);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, [step?.id, run?.screen.t]);

  if (!step || !box || !run) return null;
  const L = layoutRef.current;
  const pad = 8;
  const hole = { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 };
  const bw = Math.min(360, L.W - 24);
  const below = hole.y + hole.h + 190 < L.H || hole.y < 200;
  const bx = Math.max(12, Math.min(L.W - bw - 12, hole.x + hole.w / 2 - bw / 2));
  const by = below ? Math.min(L.H - 180, hole.y + hole.h + 14) : undefined;
  const bottom = below ? undefined : L.H - hole.y + 14;
  const arrowX = Math.max(24, Math.min(bw - 24, hole.x + hole.w / 2 - bx));
  return (
    <div class="coach" aria-live="polite">
      <div class="coach-hole" style={{ left: `${hole.x}px`, top: `${hole.y}px`, width: `${hole.w}px`, height: `${hole.h}px` }} />
      <div class={`coach-bubble ${below ? 'is-below' : 'is-above'}`} style={{ left: `${bx}px`, top: by !== undefined ? `${by}px` : undefined, bottom: bottom !== undefined ? `${bottom}px` : undefined, width: `${bw}px` }} key={step.id}>
        <span class="coach-arrow" style={{ left: `${arrowX}px` }} />
        <span class="coach-seal">班主</span>
        <p class="coach-text">{step.text(run)}</p>
        <div class="coach-actions">
          <button class="coach-skip" onClick={() => store.coachSkipAll()}>
            不用提点了
          </button>
          {step.wait ? <span class="coach-wait">照着做就行</span> : <button class="coach-ok" onClick={() => store.coachDone(step.id)}>知道了</button>}
        </div>
      </div>
    </div>
  );
}

/** Ids of steps that complete on a given action. */
export function stepsWaitingFor(action: string): string[] {
  return STEPS.filter((s) => s.wait === action).map((s) => s.id);
}
