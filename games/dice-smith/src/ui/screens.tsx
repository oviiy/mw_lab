import { useEffect, useState } from 'preact/hooks';
import { ARTIFACTS, ARTIFACT_IDS } from '../core/artifacts';
import { AUGMENTS } from '../core/augments';
import { CONSUMABLES } from '../core/consumables';
import { MARKS, MATERIALS } from '../core/dice';
import { HAND_ORDER, HANDS, handChipsMult } from '../core/hands';
import { BOSSES, BOUNTIES, OPPONENTS, TAGS } from '../core/opponents';
import { ACTS, canHold, flipsAvailable, STAKES, targetFor } from '../core/round';
import { canAfford, canSkip, canTake } from '../core/run';
import type { Offer, Run } from '../core/types';
import { isMusicOn, isMuted, setMuted, setMusic, sfx } from './audio';
import { ArtifactCard, Btn, Coin, ConsumableCard, DieNet, RARITY_NAME, tip } from './hud';
import { ArtifactIcon } from './icons';
import { useLayout } from './Stage';
import { loadCodex, loadRecords, store, unlockedStake } from './store';
import { fmt } from './format';

// ---------- title ----------

export function TitleControls() {
  const has = store.hasSave();
  const rec = loadRecords();
  const [m, setM] = useState(isMuted());
  const [mu, setMu] = useState(isMusicOn());
  return (
    <div class="title-controls">
      <p class="title-lede">夜市深处，皮影戏台上的命运之匠在等人掷骰。<br />三颗骰子，六幕戏，一局见分晓。</p>
      <div class="stakes" role="radiogroup" aria-label="难度">
        {STAKES.map((st, i) => {
          const locked = i > unlockedStake(rec);
          return (
            <button
              class={`stake ${store.stakeChoice === i ? 'is-on' : ''} ${locked ? 'is-locked' : ''}`}
              disabled={locked}
              role="radio"
              aria-checked={store.stakeChoice === i}
              onClick={() => store.setStake(i)}
              {...tip(() => ({ title: st.name, tag: locked ? '未解锁' : '难度', body: locked ? `赢下「${STAKES[i - 1].name}」后解锁。\n${st.desc}` : st.desc }))}
            >
              {st.name}
              {rec.stakeWins[i] > 0 && <i class="stake-won">胜</i>}
            </button>
          );
        })}
      </div>
      <div class="title-actions">
        {has && (
          <Btn kind="gold" onClick={() => (sfx.click(), store.continueGame())}>
            继续这一局
          </Btn>
        )}
        <Btn kind={has ? 'plain' : 'gold'} onClick={() => (sfx.roll(3), store.newGame())}>
          {has ? '重新开局' : '开局'}
        </Btn>
      </div>
      <div class="title-toggles">
        <button onClick={() => (setMuted(!m), setM(!m))}>{m ? '声音：关' : '声音：开'}</button>
        <button onClick={() => (setMusic(!mu), setMu(!mu))}>{mu ? '丝竹：开' : '丝竹：关'}</button>
        <button onClick={() => store.setOverlay('rules')}>怎么玩</button>
        <button onClick={() => store.setOverlay('codex')}>图鉴</button>
        <button onClick={() => store.coachReset()}>重看引导</button>
      </div>
      {rec.runs > 0 && (
        <p class="title-records">
          开局 {rec.runs} 次 · 通关 {rec.wins} 次 · 最远第 {rec.bestAct} 幕 · 最高一手 {fmt(rec.bestHand)}
          {rec.bestEndless > 0 ? ` · 加演至第 ${rec.bestEndless} 幕` : ''}
        </p>
      )}
    </div>
  );
}

// ---------- augments (命格) ----------

const TIER_NAME = { silver: '银', gold: '金', prism: '彩' } as const;

export function AugmentPick({ run }: { run: Run }) {
  if (run.screen.t !== 'augment') return null;
  const { tier, options } = run.screen;
  return (
    <div class="overlay">
      <div class="overlay-panel aug-panel">
        <h2 class="ov-title">命格 · {TIER_NAME[tier]}</h2>
        <p class="ov-sub">{tier === 'silver' ? '开局之前，先定命格。三选一，伴你整局。' : '一幕又一幕过去，命格再添一笔。'}</p>
        <div class="aug-cards" data-coach="aug">
          {options.map((id, i) => (
            <button class={`aug-card t-${tier}`} onClick={() => store.pickAugment(i)}>
              <span class="aug-medal">
                <span>{AUGMENTS[id].name[0]}</span>
              </span>
              <span class="aug-name">{AUGMENTS[id].name}</span>
              <span class="aug-desc">{AUGMENTS[id].desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- blind select ----------

export function BlindSelect({ run }: { run: Run }) {
  const L = useLayout();
  const kinds = ['小场', '大场', '头牌'];
  const rewards = [3, 4, 5];
  return (
    <div class={`blinds ${L.port ? 'is-port' : ''}`}>
      {[0, 1, 2].map((b) => {
        const now = b === run.blind;
        const done = b < run.blind;
        const boss = b === 2 ? BOSSES[run.bosses[run.act - 1]] : null;
        const opp = boss ? boss.name : OPPONENTS[run.opponents[b]].name;
        return (
          <div class={`blind-card ${now ? 'is-now' : ''} ${done ? 'is-done' : ''} ${boss ? 'is-boss' : ''}`} data-coach={now ? 'blind-now' : undefined}>
            <div class="bc-kind">{kinds[b]}</div>
            <div class="bc-name">{opp}</div>
            <div class="bc-target">
              <span>目标</span>
              <b>{fmt(targetFor(run, b))}</b>
            </div>
            <div class="bc-reward">
              奖赏 {Array.from({ length: rewards[b] }, () => <Coin size={12} />)}
            </div>
            {boss ? (
              <div class="bc-rule" {...tip(() => ({ title: `${boss.name} · ${boss.title}`, tag: '戒律', body: boss.desc }))}>
                <span class="rule-seal">戒</span>
                {boss.title}：{boss.desc}
              </div>
            ) : run.act >= 2 ? (
              <div class="bc-rule is-bounty">
                <span class="rule-seal">赏</span>
                {BOUNTIES[run.bounties[b]].desc}（{BOUNTIES[run.bounties[b]].reward}）
              </div>
            ) : null}
            {now && (
              <div class="bc-actions">
                <Btn kind="red" onClick={() => store.playBlind()}>
                  开演
                </Btn>
                {!boss && canSkip(run) && (
                  <span data-coach="btn-skip">
                  <Btn kind="ghost" onClick={() => store.skipBlind()}>
                    <span {...tip(() => ({ title: `跳过得${TAGS[run.skipTags[b]].name}`, tag: '签', body: TAGS[run.skipTags[b]].desc }))}>
                      跳过 · 得{TAGS[run.skipTags[b]].name}
                    </span>
                  </Btn>
                  </span>
                )}
              </div>
            )}
            {done && <div class="bc-seal">{run.blind > b ? '过' : ''}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ---------- round controls ----------

export function RoundButtons({ run }: { run: Run }) {
  const r = run.round!;
  const busy = store.ui.busy || r.phase !== 'rolling';
  const held = r.rolled.filter((x) => x.held).length;
  const flips = flipsAvailable(run, r);
  const firstLesson = run.tutorial && run.act === 1 && run.blind === 0 && r.handsPlayed === 0;
  return (
    <>
      <div class={`ctl ctl-reroll ${firstLesson ? 'is-hidden' : ''}`} data-coach="btn-reroll">
        <Btn kind="plain" fx="btn-reroll" disabled={busy || r.rerolls <= 0 || held === run.dice.length} onClick={() => store.reroll()} class="big-btn">
          <span class="bb-main">重掷</span>
          <span class="bb-sub">{!canHold(r) ? '这一场不能扣骰' : held ? `扣住 ${held} 颗` : '点骰子可扣住'}</span>
        </Btn>
        {flips > 0 && (
          <span data-coach="btn-flip">
          <Btn kind={store.ui.flipMode ? 'gold' : 'ghost'} disabled={busy} onClick={() => store.toggleFlipMode()} class="flip-btn">
            {store.ui.flipMode ? '点一颗骰子翻面' : `翻面 ×${flips}`}
          </Btn>
          </span>
        )}
      </div>
      <div class="ctl ctl-play" data-coach="btn-play">
        <Btn kind="red" disabled={busy} onClick={() => store.playHand()} class="big-btn">
          <span class="bb-main">出手</span>
          <span class="bb-sub">{store.ui.handLabel}</span>
        </Btn>
      </div>
    </>
  );
}

// ---------- cash out ----------

/** Render only while run.screen is 'cashout' (hooks below must always run). */
export function Cashout({ run }: { run: Run }) {
  const lines = run.screen.t === 'cashout' ? run.screen.lines : [];
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => {
      setShown(shown + 1);
      sfx.coin();
    }, 260);
    return () => clearTimeout(t);
  }, [shown]);
  return (
    <div class="overlay is-soft">
      <div class="overlay-panel cash-panel" data-coach="cash">
        <h2 class="ov-title">结账</h2>
        <ul class="cash-lines">
          {lines.slice(0, shown).map((l) => (
            <li>
              <span>{l.label}</span>
              <span class="cash-amt">
                +{l.amount} <Coin size={14} />
              </span>
            </li>
          ))}
        </ul>
        <div class="cash-total">
          合计 <b>{total}</b> <Coin size={18} />
        </div>
        <Btn kind="gold" disabled={shown < lines.length} onClick={() => store.collect()}>
          收下，逛集市
        </Btn>
      </div>
    </div>
  );
}

// ---------- shop ----------

const PACK_NAME = { carve: '刻刀包', star: '星图包', artifact: '法器包', talisman: '符箓包' } as const;
const PACK_DESC = {
  carve: '三把刻刀，挑一把立刻用',
  star: '三颗星，挑一颗',
  artifact: '两件法器，挑一件',
  talisman: '两张符，挑一张立刻用',
} as const;

function PackCard({ o, onClick }: { o: Extract<Offer, { kind: 'pack' }>; onClick: () => void }) {
  return (
    <button class={`pack-card p-${o.pack}`} onClick={onClick} {...tip(() => ({ title: PACK_NAME[o.pack], tag: '礼包', body: PACK_DESC[o.pack] }))}>
      <span class="pack-knot" />
      <span class="pack-name">{PACK_NAME[o.pack]}</span>
      <span class="price">
        <Coin size={14} />
        {o.price}
      </span>
    </button>
  );
}

export function ShopStall({ run }: { run: Run }) {
  const s = run.shop;
  if (!s) return null;
  return (
    <div class="stall">
      <div class="stall-awning" />
      <div class="stall-goods" data-coach="stall-goods">
        {s.offers.map((o, i) => {
          const off = o.sold || !canAfford(run, o) || !canTake(run, o);
          const why = o.sold ? '' : !canAfford(run, o) ? '钱不够' : !canTake(run, o) ? '栏位满了' : '';
          return (
            <div class={`good ${o.sold ? 'is-sold' : ''} ${off ? 'is-off' : ''}`}>
              {o.kind === 'artifact' && <ArtifactCard a={{ id: o.id, n: ARTIFACTS[o.id].n0 ?? 0, uid: -1 }} price={o.price} onClick={() => !o.sold && store.buy(i)} />}
              {o.kind === 'consumable' && <ConsumableCard id={o.id} price={o.price} onClick={() => !o.sold && store.buy(i)} />}
              {o.kind === 'pack' && <PackCard o={o} onClick={() => !o.sold && store.buy(i)} />}
              {o.sold ? <span class="sold-seal">售</span> : why && <span class="why">{why}</span>}
            </div>
          );
        })}
      </div>
      <div class="stall-actions">
        <Btn kind="plain" disabled={run.money < s.rerollCost} onClick={() => store.rerollShop()}>
          换一批 · {s.rerollCost} <Coin size={13} />
        </Btn>
        <span data-coach="btn-next">
          <Btn kind="red" onClick={() => store.leaveShop()}>
            下一场
          </Btn>
        </span>
      </div>
    </div>
  );
}

// ---------- packs ----------

export function PackView({ run }: { run: Run }) {
  if (run.screen.t !== 'pack') return null;
  const { pack, options, picks } = run.screen;
  return (
    <div class="overlay">
      <div class="overlay-panel pack-panel">
        <h2 class="ov-title">{PACK_NAME[pack]}</h2>
        <p class="ov-sub">还可以挑 {picks} 样{pack === 'carve' || pack === 'talisman' ? '（挑中即用）' : ''}</p>
        <div class="pack-options" data-coach="pack">
          {options.map((o, i) => (
            <div class={`good ${o.sold ? 'is-sold' : ''}`}>
              {o.kind === 'artifact' ? (
                <ArtifactCard a={{ id: o.id, n: ARTIFACTS[o.id].n0 ?? 0, uid: -1 }} onClick={() => !o.sold && store.pickPack(i)} dim={run.artifacts.length >= run.artifactSlots} />
              ) : o.kind === 'consumable' ? (
                <ConsumableCard id={o.id} onClick={() => !o.sold && store.pickPack(i)} />
              ) : null}
              {o.kind === 'consumable' && <span class="good-desc">{CONSUMABLES[o.id].desc}</span>}
              {o.kind === 'artifact' && <span class="good-desc">{ARTIFACTS[o.id].desc.replace('{n}', '0').replace('{x}', '1.0')}</span>}
            </div>
          ))}
        </div>
        <Btn kind="ghost" onClick={() => store.skipPack()}>
          不要了
        </Btn>
      </div>
    </div>
  );
}

// ---------- picker (carving target) ----------

export function Picker({ run }: { run: Run }) {
  const p = store.ui.picking;
  const L = useLayout();
  if (!p) return null;
  const d = CONSUMABLES[p.id];
  const dieOnly = d.target === 'die';
  return (
    <div class="overlay">
      <div class="overlay-panel picker-panel">
        <h2 class="ov-title">{d.name}</h2>
        <p class="ov-sub">{d.desc}</p>
        <p class="ov-hint">{dieOnly ? '选一颗骰子。' : '选一面下刀。每颗骰子展开成十字，上下、左右隔一格的两面互为对面。'}</p>
        <div class="nets" data-coach="picker">
          {run.dice.map((die, di) => (
            <div class="net-wrap">
              <div class="net-label">
                第 {di + 1} 颗 · {MATERIALS[die.material].name}
              </div>
              {dieOnly ? (
                <button class="net-btn" disabled={d.valid ? !d.valid(run, di, -1) : false} onClick={() => void store.applyPick(di, -1, `pick-${di}-2`)}>
                  <DieNet die={die} size={L.port ? 30 : 40} fxPrefix={`pick-${di}`} />
                </button>
              ) : (
                <DieNet die={die} size={L.port ? 32 : 44} fxPrefix={`pick-${di}`} valid={(fi) => !d.valid || d.valid(run, di, fi)} onPick={(fi) => void store.applyPick(di, fi, `pick-${di}-${fi}`)} />
              )}
            </div>
          ))}
        </div>
        <Btn kind="ghost" onClick={() => store.cancelPick()}>
          先不用
        </Btn>
      </div>
    </div>
  );
}

// ---------- reference overlays ----------

export function HandsTable({ run }: { run: Run }) {
  return (
    <div class="overlay" onClick={() => store.setOverlay(null)}>
      <div class="overlay-panel hands-panel" onClick={(e) => e.stopPropagation()}>
        <h2 class="ov-title">北斗七星 · 牌型</h2>
        <table class="hands-table">
          <thead>
            <tr>
              <th>星</th>
              <th>牌型</th>
              <th>级</th>
              <th>筹 × 倍</th>
              <th>出过</th>
            </tr>
          </thead>
          <tbody>
            {HAND_ORDER.map((h) => {
              const { chips, mult } = handChipsMult(h, run.levels[h]);
              const locked = HANDS[h].need > run.dice.length;
              return (
                <tr class={locked ? 'is-locked' : ''}>
                  <td class="star">{HANDS[h].star}</td>
                  <td>
                    <b>{HANDS[h].name}</b>
                    <span class="hdesc">{HANDS[h].desc}</span>
                  </td>
                  <td>{run.levels[h]}</td>
                  <td>
                    {chips} × {mult}
                  </td>
                  <td>{run.stats.played[h] ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p class="ov-hint">两对、长顺、四喜需要第四颗骰子。只有构成牌型的骰子计分。</p>
        <Btn kind="gold" onClick={() => store.setOverlay(null)}>
          合上
        </Btn>
      </div>
    </div>
  );
}

export function DiceBag({ run }: { run: Run }) {
  const L = useLayout();
  return (
    <div class="overlay" onClick={() => store.setOverlay(null)}>
      <div class="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <h2 class="ov-title">骰袋</h2>
        <div class="nets">
          {run.dice.map((die, i) => (
            <div class="net-wrap">
              <div class="net-label">
                第 {i + 1} 颗 · {MATERIALS[die.material].name}
              </div>
              <DieNet die={die} size={L.port ? 32 : 46} />
            </div>
          ))}
        </div>
        <div class="mark-legend">
          {Object.entries(MARKS).map(([, m]) => (
            <span>
              <i class="seal-chip">{m.glyph}</i>
              {m.desc}
            </span>
          ))}
        </div>
        <Btn kind="gold" onClick={() => store.setOverlay(null)}>
          合上
        </Btn>
      </div>
    </div>
  );
}

export function Rules() {
  return (
    <div class="overlay" onClick={() => store.setOverlay(null)}>
      <div class="overlay-panel rules-panel" onClick={(e) => e.stopPropagation()}>
        <h2 class="ov-title">怎么玩</h2>
        <ol class="rules">
          <li>
            每一场有<b>目标分</b>、<b>出手</b>次数和<b>重掷</b>次数（整场共用）。
          </li>
          <li>点骰子把它<b>扣住</b>，按「重掷」重掷其余的；满意了就<b>出手</b>。</li>
          <li>
            出手按牌型计分：<b>（点数 + 底筹）× 倍</b>。散、对子、顺子、豹子……只有构成牌型的骰子计分。
          </li>
          <li>
            <b>法器</b>从左到右依次加筹、加倍、乘倍，顺序有讲究，可以在法器栏里调换。
          </li>
          <li>
            <b>刻刀</b>改骰面：加点、刻印、复制到对面……骰子的对面之和为 7（1↔6、2↔5、3↔4）。
          </li>
          <li>
            <b>星</b>让牌型升级；<b>命格</b>改规则；<b>头牌</b>带着戒律。
          </li>
          <li>六幕十八场，赢下最后的命运之匠。</li>
        </ol>
        <Btn kind="gold" onClick={() => store.setOverlay(null)}>
          明白了
        </Btn>
      </div>
    </div>
  );
}

// ---------- over ----------

export function Over({ run }: { run: Run }) {
  if (run.screen.t !== 'over') return null;
  const won = run.screen.won;
  const s = run.stats;
  const fav = (Object.entries(s.played) as [keyof typeof HANDS, number][]).sort((a, b) => b[1] - a[1])[0];
  return (
    <div class="overlay">
      <div class={`overlay-panel over-panel ${won ? 'is-won' : ''}`}>
        <div class="over-seal">{won ? '满堂彩' : '散场'}</div>
        <h2 class="ov-title">{won ? '命运之匠倒在了幕后' : run.endless ? `加演到第 ${run.act} 幕` : `第 ${run.act} 幕落下了帷幕`}</h2>
        <p class="ov-sub">
          {won ? `锣鼓收声，夜市的灯一盏盏亮到天明。（${STAKES[run.stake].name}）` : run.endless ? '加演散场。这一夜，台下的掌声比哪晚都久。' : '骰子停了，戏还没完。明晚再来。'}
        </p>
        <dl class="over-stats">
          <div>
            <dt>最高一手</dt>
            <dd>{fmt(s.best)}</dd>
          </div>
          <div>
            <dt>出手</dt>
            <dd>{s.hands}</dd>
          </div>
          <div>
            <dt>赢下</dt>
            <dd>{s.rounds} 场</dd>
          </div>
          <div>
            <dt>刻刀</dt>
            <dd>{s.carves}</dd>
          </div>
          <div>
            <dt>最爱</dt>
            <dd>{fav ? HANDS[fav[0]].name : '—'}</dd>
          </div>
        </dl>
        <div class="over-arts">
          {run.artifacts.map((a) => (
            <span {...tip(() => ({ title: ARTIFACTS[a.id].name, body: RARITY_NAME[ARTIFACTS[a.id].rarity] }))}>
              <ArtifactIcon id={a.id} size={40} />
            </span>
          ))}
        </div>
        <p class="muted">种子 {run.seed}</p>
        {won && !run.endless && (
          <Btn kind="red" onClick={() => store.encore()}>
            加演 · 继续往下打
          </Btn>
        )}
        {won && run.stake < 2 && unlockedStake() > run.stake && <p class="unlock-note">解锁新难度：{STAKES[run.stake + 1].name}</p>}
        <div class="row-actions">
          <Btn kind="ghost" onClick={() => store.newGame(run.seed)}>
            同一种子再来
          </Btn>
          <Btn kind="gold" onClick={() => (sfx.roll(3), store.newGame())}>
            再开一局
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ---------- pause menu ----------

export function PauseMenu() {
  const [m, setM] = useState(isMuted());
  const [mu, setMu] = useState(isMusicOn());
  const [confirm, setConfirm] = useState(false);
  const run = store.run;
  return (
    <div class="overlay" onClick={() => store.openMenu(false)}>
      <div class="overlay-panel menu-panel" onClick={(e) => e.stopPropagation()}>
        <h2 class="ov-title">歇一歇</h2>
        <div class="menu-rows">
          <div class="menu-row">
            <span>声音</span>
            <button class={`toggle ${m ? '' : 'on'}`} onClick={() => (setMuted(!m), setM(!m))}>
              {m ? '关' : '开'}
            </button>
          </div>
          <div class="menu-row">
            <span>丝竹</span>
            <button class={`toggle ${mu ? 'on' : ''}`} onClick={() => (setMusic(!mu), setMu(!mu))}>
              {mu ? '开' : '关'}
            </button>
          </div>
          <div class="menu-row">
            <span>动画</span>
            <div class="seg">
              {[
                [1, '标准'],
                [2, '快'],
                [4, '极快'],
              ].map(([v, l]) => (
                <button class={store.speed === v ? 'on' : ''} onClick={() => store.setSpeed(v as number)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p class="menu-hint">计分时点一下屏幕，可以跳过动画。桌面快捷键：1–4 扣骰，空格重掷，回车出手，F 翻面，Esc 菜单。</p>
        </div>
        <div class="menu-actions">
          <Btn kind="gold" onClick={() => store.openMenu(false)}>
            接着玩
          </Btn>
          <Btn kind="plain" onClick={() => (store.openMenu(false), store.setOverlay('rules'))}>
            规则
          </Btn>
          <Btn kind="plain" onClick={() => (store.openMenu(false), store.coachReset())}>
            重看引导
          </Btn>
          <Btn kind="plain" onClick={() => (store.openMenu(false), store.toTitle())}>
            回到开场
          </Btn>
          {run && run.screen.t !== 'over' && (
            <Btn kind="ghost" onClick={() => (confirm ? store.abandon() : setConfirm(true))}>
              {confirm ? '确定放弃这一局？再点一次' : '放弃这一局'}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

export function BossBanner() {
  const b = store.ui.banner;
  if (!b) return null;
  return (
    <div class="boss-banner" key={b.key} onClick={() => ((store.ui.banner = null), store.emit())}>
      <div class="bb-label">头牌登场</div>
      <div class="bb-name">{b.title}</div>
      <div class="bb-rule">{b.sub}</div>
    </div>
  );
}

// ---------- 图鉴 ----------

export function CodexView() {
  const [tab, setTab] = useState<'arts' | 'augs' | 'bosses' | 'life'>('arts');
  const c = loadCodex();
  const rec = loadRecords();
  const bossIds = Object.keys(BOSSES);
  const augIds = Object.keys(AUGMENTS);
  return (
    <div class="overlay" onClick={() => store.setOverlay(null)}>
      <div class="overlay-panel codex-panel" onClick={(e) => e.stopPropagation()}>
        <h2 class="ov-title">图鉴</h2>
        <div class="seg codex-tabs">
          {(
            [
              ['arts', `法器 ${c.arts.length}/${ARTIFACT_IDS.length}`],
              ['augs', `命格 ${c.augs.length}/${augIds.length}`],
              ['bosses', `头牌 ${c.bosses.length}/${bossIds.length}`],
              ['life', '生涯'],
            ] as const
          ).map(([k, l]) => (
            <button class={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'arts' && (
          <div class="codex-grid">
            {ARTIFACT_IDS.map((id) => {
              const seen = c.arts.includes(id);
              const d = ARTIFACTS[id];
              return (
                <div class={`codex-item r-${d.rarity} ${seen ? '' : 'is-unknown'}`} {...tip(() => (seen ? { title: d.name, tag: RARITY_NAME[d.rarity], body: d.desc.replace('{n}', '0').replace('{x}', '1.0') } : { title: '？？？', body: '还没在集市里见过。' }))}>
                  <ArtifactIcon id={id} size={44} />
                  <span>{seen ? d.name : '？？'}</span>
                </div>
              );
            })}
          </div>
        )}
        {tab === 'augs' && (
          <div class="codex-list">
            {augIds.map((id) => {
              const a = AUGMENTS[id];
              const seen = c.augs.includes(id);
              return (
                <div class={`codex-row ${seen ? '' : 'is-unknown'}`}>
                  <span class={`aug-chip t-${a.tier}`}>{seen ? a.name : '？？'}</span>
                  <span>{seen ? a.desc : '还没遇到过。'}</span>
                </div>
              );
            })}
          </div>
        )}
        {tab === 'bosses' && (
          <div class="codex-list">
            {bossIds.map((id) => {
              const b = BOSSES[id];
              const beat = c.bosses.includes(id);
              return (
                <div class={`codex-row ${beat ? '' : 'is-unknown'}`}>
                  <span class="codex-boss">{beat ? b.name : '？？'}</span>
                  <span>{beat ? `${b.title}：${b.desc}` : '还没击败过。'}</span>
                </div>
              );
            })}
          </div>
        )}
        {tab === 'life' && (
          <dl class="over-stats life">
            <div>
              <dt>开局</dt>
              <dd>{rec.runs}</dd>
            </div>
            {STAKES.map((st, i) => (
              <div>
                <dt>{st.name}通关</dt>
                <dd>{rec.stakeWins[i] ?? 0}</dd>
              </div>
            ))}
            <div>
              <dt>最远</dt>
              <dd>第 {Math.min(rec.bestAct, ACTS)} 幕</dd>
            </div>
            <div>
              <dt>加演最远</dt>
              <dd>{rec.bestEndless ? `第 ${rec.bestEndless} 幕` : '—'}</dd>
            </div>
            <div>
              <dt>最高一手</dt>
              <dd>{fmt(rec.bestHand)}</dd>
            </div>
          </dl>
        )}
        <Btn kind="gold" onClick={() => store.setOverlay(null)}>
          合上
        </Btn>
      </div>
    </div>
  );
}
