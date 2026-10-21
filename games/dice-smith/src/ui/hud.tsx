import type { ComponentChildren } from 'preact';
import { ARTIFACTS, artifactDesc, type Rarity } from '../core/artifacts';
import { AUGMENTS } from '../core/augments';
import { CONSUMABLES } from '../core/consumables';
import { MARKS, opposite } from '../core/dice';
import { BOSSES, BOUNTIES, OPPONENTS, TAGS } from '../core/opponents';
import { ACTS } from '../core/round';
import { sellPrice } from '../core/run';
import { activeRule } from '../core/score';
import type { ArtifactInst, Consumable, Die, Run } from '../core/types';
import { faceImage } from './dice3d/faceArt';
import { ArtifactIcon } from './icons';
import { layoutRef } from './Stage';
import { store, type Tip } from './store';
import { fmt } from './format';

export const RARITY_NAME: Record<Rarity, string> = { common: '普通', uncommon: '罕见', rare: '稀有' };

// ---------- tooltips ----------

function stageRect() {
  return document.querySelector('.stage')?.getBoundingClientRect();
}

/** Pointer handlers that show a tooltip anchored above the element (long-press on touch). */
export function tip(get: () => Omit<Tip, 'x' | 'y'>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const show = (el: Element) => {
    const sr = stageRect();
    if (!sr) return;
    const r = el.getBoundingClientRect();
    const s = layoutRef.current.scale;
    store.setTip({ ...get(), x: (r.left + r.width / 2 - sr.left) / s, y: (r.top - sr.top) / s });
  };
  return {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') show(e.currentTarget as Element);
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') store.setTip(null);
    },
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        const el = e.currentTarget as Element;
        timer = setTimeout(() => show(el), 380);
      }
    },
    onPointerUp: () => clearTimeout(timer),
    onPointerCancel: () => clearTimeout(timer),
  };
}

export function TipLayer() {
  const t = store.ui.tip;
  if (!t) return null;
  const L = layoutRef.current;
  const below = t.y < 180;
  const left = Math.max(10, Math.min(L.W - 290, t.x - 140));
  return (
    <div class={`tip ${below ? 'is-below' : ''}`} style={{ left: `${left}px`, top: below ? `${t.y + 20}px` : undefined, bottom: below ? undefined : `${L.H - t.y + 10}px` }} onPointerDown={() => store.setTip(null)}>
      <div class="tip-head">
        <span class="tip-title">{t.title}</span>
        {t.tag && <span class="tip-tag">{t.tag}</span>}
      </div>
      <div class="tip-body">{t.body}</div>
    </div>
  );
}

export function Toast() {
  const t = store.ui.toast;
  if (!t) return null;
  return (
    <div class="toast" key={t.key} onAnimationEnd={() => ((store.ui.toast = null), store.emit())}>
      {t.text}
    </div>
  );
}

// ---------- pieces ----------

export function Coin({ size = 18 }: { size?: number }) {
  return <i class="coin" style={{ width: `${size}px`, height: `${size}px` }} />;
}

export function Btn({ onClick, children, kind = 'plain', disabled, fx, class: cls, label }: { onClick: () => void; children: ComponentChildren; kind?: 'plain' | 'gold' | 'red' | 'ghost'; disabled?: boolean; fx?: string; class?: string; label?: string }) {
  return (
    <button class={`btn btn-${kind} ${cls ?? ''}`} disabled={disabled} data-fx={fx} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

export function FaceImg({ face, material, size, hidden }: { face: Die['faces'][number]; material: Die['material']; size: number; hidden?: boolean }) {
  return <img class="face-img" src={faceImage(face, material, hidden)} width={size} height={size} alt={`${face.v}${face.mark ? MARKS[face.mark].glyph : ''}`} draggable={false} />;
}

// Cross net: the top/bottom of the column and the outer pair of the row are opposite faces.
const NET: [number, number, number][] = [
  [5, 0, 1],
  [1, 1, 0],
  [2, 1, 1],
  [4, 1, 2],
  [3, 1, 3],
  [0, 2, 1],
];

export function DieNet({ die, size = 40, valid, onPick, picked, fxPrefix }: { die: Die; size?: number; valid?: (f: number) => boolean; onPick?: (f: number) => void; picked?: number | null; fxPrefix?: string }) {
  return (
    <div class="die-net" style={{ width: `${size * 4 + 6}px`, height: `${size * 3 + 4}px` }}>
      {NET.map(([fi, r, c]) => {
        const f = die.faces[fi];
        const ok = !valid || valid(fi);
        return (
          <button
            class={`net-face ${onPick && ok ? 'is-pickable' : ''} ${onPick && !ok ? 'is-locked' : ''} ${picked === fi ? 'is-picked' : ''}`}
            style={{ left: `${c * (size + 2)}px`, top: `${r * (size + 2)}px`, width: `${size}px`, height: `${size}px` }}
            disabled={!onPick || !ok}
            data-fx={fxPrefix ? `${fxPrefix}-${fi}` : undefined}
            onClick={() => onPick?.(fi)}
            {...tip(() => ({ title: `${f.v} 点${f.mark ? ' · ' + MARKS[f.mark].name : ''}`, body: `${f.mark ? MARKS[f.mark].desc + '\n' : ''}对面是 ${die.faces[opposite(fi)].v} 点` }))}
          >
            <FaceImg face={f} material={die.material} size={size} />
          </button>
        );
      })}
    </div>
  );
}

// ---------- artifacts ----------

export function artifactTip(a: ArtifactInst | { id: string; n: number; uid: number }) {
  const d = ARTIFACTS[a.id];
  return { title: d.name, tag: RARITY_NAME[d.rarity], body: artifactDesc(a as ArtifactInst) };
}

export function ArtifactCard({ a, index, active, selected, onClick, price, dim }: { a: { id: string; n: number; uid: number }; index?: number; active?: boolean; selected?: boolean; onClick?: () => void; price?: number; dim?: boolean }) {
  const d = ARTIFACTS[a.id];
  return (
    <button
      class={`art-card r-${d.rarity} ${active ? 'is-active' : ''} ${selected ? 'is-selected' : ''} ${dim ? 'is-dim' : ''}`}
      data-fx={index !== undefined ? `art-${index}` : undefined}
      onClick={onClick}
      {...tip(() => artifactTip(a))}
    >
      <span class="art-cord" />
      <span class="art-icon">
        <ArtifactIcon id={a.id} size={52} />
      </span>
      <span class="art-name">{d.name}</span>
      {d.n0 !== undefined || a.n > 0 ? <span class="art-counter">{a.id === 'idol' ? `×${(1 + a.n * 0.5).toFixed(1)}` : a.n}</span> : null}
      {price !== undefined && (
        <span class="price">
          <Coin size={14} />
          {price}
        </span>
      )}
    </button>
  );
}

export function ArtifactRail({ run, shop }: { run: Run; shop?: boolean }) {
  const ui = store.ui;
  const slots = Array.from({ length: run.artifactSlots }, (_, i) => run.artifacts[i] ?? null);
  const sel = ui.selectedArt;
  const disabled = run.round?.disabled ?? null;
  return (
    <div class="art-rail" data-coach="rail">
      <div class="rail-rope" />
      {slots.map((a, i) =>
        a ? (
          <div class="art-slot">
            <ArtifactCard a={a} index={i} active={ui.activeArt === i} selected={sel === i} dim={disabled === i} onClick={() => store.selectArt(i)} />
            {sel === i && (
              <div class="art-actions">
                <button disabled={i === 0} onClick={() => store.move(i, -1)} aria-label="左移">◀</button>
                {(shop || run.screen.t !== 'round') && (
                  <button class="sell" onClick={() => store.sell(i)}>
                    卖 +{sellPrice(a.id)}
                  </button>
                )}
                <button disabled={i === run.artifacts.length - 1} onClick={() => store.move(i, 1)} aria-label="右移">▶</button>
              </div>
            )}
          </div>
        ) : (
          <div class="art-slot is-empty">
            <span class="art-cord" />
            <span class="empty-tablet">空</span>
          </div>
        ),
      )}
      <div class="rail-count">
        {run.artifacts.length}/{run.artifactSlots}
      </div>
    </div>
  );
}

// ---------- consumables ----------

export function consumableTip(id: string) {
  const d = CONSUMABLES[id];
  const kind = d.kind === 'carve' ? '刻刀' : d.kind === 'star' ? '星' : '符';
  return { title: d.name, tag: kind, body: d.desc };
}

export function ConsumableCard({ id, onClick, price, small }: { id: string; onClick?: () => void; price?: number; small?: boolean }) {
  const d = CONSUMABLES[id];
  return (
    <button class={`cons-card k-${d.kind} ${small ? 'is-small' : ''}`} onClick={onClick} {...tip(() => consumableTip(id))}>
      <span class="cons-glyph">{d.glyph}</span>
      {!small && <span class="cons-name">{d.name}</span>}
      {price !== undefined && (
        <span class="price">
          <Coin size={14} />
          {price}
        </span>
      )}
    </button>
  );
}

export function ConsumableSlots({ run }: { run: Run }) {
  const slots = Array.from({ length: run.consumableSlots }, (_, i) => run.consumables[i] ?? null);
  return (
    <div class="cons-slots" data-coach="cons">
      {slots.map((c: Consumable | null) =>
        c ? (
          <div class="cons-slot">
            <ConsumableCard id={c.id} small onClick={() => store.useSlot(c.uid)} />
            <button class="cons-x" onClick={() => store.discard(c.uid)} aria-label="丢弃">
              ×
            </button>
          </div>
        ) : (
          <div class="cons-slot is-empty" />
        ),
      )}
    </div>
  );
}

// ---------- playbill (left) and score (right) ----------

export function opponentName(run: Run) {
  const r = run.round;
  if (r?.boss) return BOSSES[r.boss].name;
  if (r) return OPPONENTS[r.opponent].name;
  return '';
}

export function RuleLine({ run }: { run: Run }) {
  const r = run.round;
  if (!r) return null;
  if (r.boss) {
    const b = BOSSES[r.boss];
    const rule = activeRule(r);
    const now = r.boss === 'fate' && rule ? `${BOSSES[rule].title}：${BOSSES[rule].desc}` : `${b.title}：${b.desc}`;
    return (
      <div class="rule-line" data-coach="rule" {...tip(() => ({ title: `${b.name} · ${b.title}`, tag: '戒律', body: b.desc }))}>
        <span class="rule-seal">戒</span>
        <span>{now}</span>
      </div>
    );
  }
  if (r.bounty) {
    const b = BOUNTIES[r.bounty.id];
    return (
      <div class={`rule-line is-bounty ${r.bounty.done ? 'is-done' : ''}`} data-coach="rule" {...tip(() => ({ title: '悬赏', body: `${b.desc}\n奖励：${b.reward}` }))}>
        <span class="rule-seal">赏</span>
        <span>
          {b.desc} · {b.reward}
        </span>
      </div>
    );
  }
  return null;
}

export function Playbill({ run }: { run: Run }) {
  const r = run.round;
  const ui = store.ui;
  const pct = r ? Math.min(100, (ui.score / r.target) * 100) : 0;
  return (
    <aside class="playbill">
      <div class="pb-title">戏单</div>
      {r ? (
        <div class="pb-who">
          <div class="pb-name">{opponentName(run)}</div>
          <div class="pb-role">{r.boss ? '头牌' : r.kind === 'big' ? '大场' : '小场'}</div>
        </div>
      ) : (
        <div class="pb-idle">
          <b>{run.screen.t === 'shop' || run.screen.t === 'pack' ? '逛集市' : '候场'}</b>
          <span>{run.screen.t === 'shop' || run.screen.t === 'pack' ? '买法器、刻刀、星和符。点自己的法器可以调顺序或卖掉。' : '选好这一场：开演，或者跳过换一支签。'}</span>
        </div>
      )}
      {r && (
        <>
          <div class="pb-goal" data-coach="goal">
            <div class="pb-target">
              <span class="pb-label">目标</span>
              <span class="pb-num">{fmt(r.target)}</span>
            </div>
            <div class="pb-score" data-fx="score">
              <span class="pb-label">得分</span>
              <span class="pb-num big">{fmt(ui.score)}</span>
            </div>
            <div class="incense" {...tip(() => ({ title: '进度', body: `${ui.score} / ${r.target}` }))}>
              <div class="incense-fill" style={{ width: `${pct}%` }} />
              <div class="incense-ember" style={{ left: `${pct}%` }} />
            </div>
          </div>
          <RuleLine run={run} />
        </>
      )}
      {r && (
        <div class="pb-counters">
          <div class="counter" data-fx="hands" {...tip(() => ({ title: '出手', body: '本场还能出手的次数。用完前没到目标就输了。' }))}>
            <span class="counter-label">出手</span>
            <span class="counter-num">{r?.hands ?? '-'}</span>
          </div>
          <div class="counter" data-fx="rerolls" data-coach="rerolls" {...tip(() => ({ title: '重掷', body: '整场共用。点骰子扣住，其余的重掷。' }))}>
            <span class="counter-label">重掷</span>
            <span class="counter-num">{r?.rerolls ?? '-'}</span>
          </div>
        </div>
      )}
      <div class="pb-money" data-fx="money" {...tip(() => ({ title: '金币', body: '过关后结算。每存 5 金，多得 1 金利息（上限 5）。' }))}>
        <Coin size={22} />
        <span>{run.money}</span>
      </div>
      <div class="pb-act">
        第 {run.act} 幕 <span class="pb-of">/ {ACTS}</span>
        <span class="pb-blinds">
          {[0, 1, 2].map((b) => (
            <i class={b < run.blind ? 'done' : b === run.blind ? 'now' : ''} />
          ))}
        </span>
      </div>
    </aside>
  );
}

export function ScorePanel({ run }: { run: Run }) {
  const ui = store.ui;
  return (
    <aside class="scorepanel">
      {run.round ? (
        <>
        <div class="hand-label">{ui.handLabel}</div>
        <div class="plaques" data-coach="plaques">
          <div class="plaque chips" data-fx="plaque-chips">
            <span class="plaque-k">筹</span>
            <span class="plaque-v">{run.round ? fmt(ui.chips) : 0}</span>
          </div>
          <span class="times">×</span>
          <div class="plaque mult" data-fx="plaque-mult">
            <span class="plaque-k">倍</span>
            <span class="plaque-v">{run.round ? (ui.mult >= 1e5 ? fmt(ui.mult) : (Math.round(ui.mult * 10) / 10).toLocaleString()) : 0}</span>
          </div>
        </div>
        </>
      ) : (
        run.screen.t !== 'over' && <div class="sp-idle">{run.screen.t === 'shop' || run.screen.t === 'pack' ? '集市' : '候场'}</div>
      )}
      {(run.consumables.length > 0 || run.shops > 1) && (
        <>
          <div class="sp-section">消耗品</div>
          <ConsumableSlots run={run} />
        </>
      )}
      {run.augments.length > 0 && (
        <>
          <div class="sp-section">命格</div>
          <div class="aug-list">
            {run.augments.map((id) => (
              <span class={`aug-chip t-${AUGMENTS[id].tier}`} {...tip(() => ({ title: AUGMENTS[id].name, tag: '命格', body: AUGMENTS[id].desc }))}>
                {AUGMENTS[id].name}
              </span>
            ))}
          </div>
        </>
      )}
      {run.tags.length > 0 && (
        <div class="aug-list">
          {run.tags.map((t) => (
            <span class="tag-chip" {...tip(() => ({ title: TAGS[t].name, tag: '签', body: TAGS[t].desc }))}>
              {TAGS[t].glyph}
            </span>
          ))}
        </div>
      )}
      <div class="sp-links">
        {run.stats.hands > 0 && (
          <button data-coach="link-hands" onClick={() => store.setOverlay('hands')}>
            牌型
          </button>
        )}
        {(run.stats.carves > 0 || run.act >= 2) && <button onClick={() => store.setOverlay('bag')}>骰袋</button>}
        <button onClick={() => store.setOverlay('rules')}>规则</button>
      </div>
    </aside>
  );
}
