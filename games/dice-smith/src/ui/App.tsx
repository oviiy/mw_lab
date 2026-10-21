import { Component, type ComponentChildren } from 'preact';
import { BOSSES, OPPONENTS } from '../core/opponents';
import { removeItem } from './storage';
import type { Run } from '../core/types';
import { DiceTableView } from './dice3d/DiceTableView';
import { ArtifactRail, Coin, ConsumableSlots, Playbill, RuleLine, ScorePanel, TipLayer, Toast, opponentName, tip } from './hud';
import { Puppet } from './puppet/Puppet';
import { ROSTER } from './puppet/roster';
import { NightMarket } from './scene/NightMarket';
import { Theater } from './scene/Theater';
import { AugmentPick, BlindSelect, BossBanner, Cashout, CodexView, DiceBag, HandsTable, Over, PackView, PauseMenu, Picker, RoundButtons, Rules, ShopStall, TitleControls } from './screens';
import { fmt } from './format';
import { useEffect } from 'preact/hooks';
import { Stage, useLayout } from './Stage';
import { Coach } from './coach';
import { store, useStore } from './store';

function stageCast(run: Run | null): { opponent: string; plaque: string; line?: string } {
  if (store.ui.title || !run) return { opponent: 'fate', plaque: '骰 匠' };
  const s = run.screen.t;
  if (s === 'augment') return { opponent: 'zhuge', plaque: '命 格', line: '先生，算一卦？' };
  if (s === 'shop' || s === 'pack') return { opponent: 'clown', plaque: '集 市', line: '走过路过，不要错过！' };
  if ((s === 'round' || s === 'cashout' || s === 'over') && run.round) {
    const r = run.round;
    return { opponent: r.opponent, plaque: '骰宝台', line: r.boss ? `${BOSSES[r.boss].name}：${BOSSES[r.boss].title}` : OPPONENTS[r.opponent]?.line };
  }
  const b = run.blind;
  const opp = b === 2 ? run.bosses[run.act - 1] : run.opponents[b];
  return { opponent: opp, plaque: '骰宝台', line: b === 2 ? `头牌 ${BOSSES[opp].name} 登场` : `下一位：${OPPONENTS[opp].name}` };
}

function ScreenText({ run, line }: { run: Run | null; line?: string }) {
  const ui = store.ui;
  if (ui.title || !run) {
    return (
      <div class="screen-title">
        <span>骰</span>
        <span>匠</span>
      </div>
    );
  }
  return (
    <>
      {ui.product !== null && (
        <div class="screen-product" key={ui.product}>
          {fmt(ui.product)}
        </div>
      )}
      {ui.loseLine && ui.product === null && (
        <div class="screen-line is-lose" key={ui.loseLine}>
          {ui.loseLine}
        </div>
      )}
      {line && ui.product === null && !ui.loseLine && (
        <div class="screen-line" key={line}>
          {line}
        </div>
      )}
    </>
  );
}

function PortTop({ run }: { run: Run }) {
  const r = run.round;
  return (
    <div class="port-top">
      <div class="pt-who" data-coach="goal">
        <b>{r ? opponentName(run) : `第 ${run.act} 幕`}</b>
        {r && (
          <span>
            {fmt(store.ui.score)} / {fmt(r.target)}
          </span>
        )}
      </div>
      <div class="pt-counts">
        {r && (
          <>
            <span data-fx="hands">
              出手 <b>{r.hands}</b>
            </span>
            <span data-fx="rerolls" data-coach="rerolls">
              重掷 <b>{r.rerolls}</b>
            </span>
          </>
        )}
        <span data-fx="money" {...tip(() => ({ title: '金币', body: '每存 5 金，多得 1 金利息（上限 5）。' }))}>
          <Coin size={14} /> <b>{run.money}</b>
        </span>
      </div>
    </div>
  );
}

function PortHand({ run }: { run: Run }) {
  const ui = store.ui;
  return (
    <div class="port-hand" data-coach="plaques">
      <div class="ph-label">{run.round ? ui.handLabel : ''}</div>
      <div class="plaque chips" data-fx="plaque-chips">
        <span class="plaque-v">{run.round ? Math.round(ui.chips) : 0}</span>
      </div>
      <span class="times">×</span>
      <div class="plaque mult" data-fx="plaque-mult">
        <span class="plaque-v">{run.round ? Math.round(ui.mult * 10) / 10 : 0}</span>
      </div>
      {(run.consumables.length > 0 || run.shops > 1) && <ConsumableSlots run={run} />}
      <div class="ph-links">
        {run.stats.hands > 0 && (
          <button data-coach="link-hands" onClick={() => store.setOverlay('hands')}>
            牌型
          </button>
        )}
        {(run.stats.carves > 0 || run.act >= 2) && <button onClick={() => store.setOverlay('bag')}>骰袋</button>}
      </div>
    </div>
  );
}

function Scene() {
  const L = useLayout();
  const run = store.run;
  const ui = store.ui;
  const title = ui.title || !run;
  const cast = stageCast(run);
  const t = run?.screen.t;
  const inRound = !title && run && (t === 'round' || t === 'cashout' || (t === 'over' && run.round));
  const port = L.port;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') return store.ui.overlay ? store.setOverlay(null) : store.openMenu();
      const r = store.run;
      if (!r || store.ui.title || store.ui.menu || store.ui.overlay || store.ui.picking) return;
      if (r.screen.t === 'round') {
        if (store.ui.busy) return store.hurry();
        if (/^[1-4]$/.test(e.key)) store.tapDie(Number(e.key) - 1);
        else if (e.key === ' ' || e.key === 'r' || e.key === 'R') store.reroll();
        else if (e.key === 'Enter') store.playHand();
        else if (e.key === 'f' || e.key === 'F') store.toggleFlipMode();
        else return;
        e.preventDefault();
      } else if (r.screen.t === 'select' && e.key === 'Enter') store.playBlind();
      else if (r.screen.t === 'cashout' && e.key === 'Enter') store.collect();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  return (
    <div class={`scene ${port ? 'port' : 'land'} ${title ? 'is-title' : ''} scr-${title ? 'title' : t}`} onPointerDownCapture={() => store.hurry()}>
      <NightMarket w={L.W} h={L.H} />
      <div class="slot-theater">
        <Theater w={port ? 450 : 700} h={port ? (title ? 380 : 250) : title ? 440 : 362} compact={port} opponent={cast.opponent} plaque={cast.plaque} state={inRound ? ui.puppet : 'idle'} enterKey={`${cast.opponent}-${run?.act}-${run?.blind}`}>
          <ScreenText run={run} line={cast.line} />
        </Theater>
      </div>

      {title ? (
        <div class="lower lower-title">
          <DiceTableView interactive={false} />
          <TitleControls />
        </div>
      ) : (
        run && (
          <>
            {port ? <PortTop run={run} /> : <Playbill run={run} />}
            {!port && <ScorePanel run={run} />}
            {(run.artifacts.length > 0 || run.shops > 0) && <ArtifactRail run={run} shop={t === 'shop'} />}
            {port && <PortHand run={run} />}
            {port && run.round && t === 'round' && (
              <div class="port-rule">
                <RuleLine run={run} />
              </div>
            )}
            <div class={`lower lower-${t}`} data-coach={t === 'round' ? 'dice' : undefined}>
              {inRound && <DiceTableView interactive={t === 'round'} />}
              {t === 'select' && <BlindSelect run={run} />}
              {(t === 'shop' || t === 'pack') && <ShopStall run={run} />}
            </div>
            {t === 'round' && run.round && <RoundButtons run={run} />}
            <AugmentPick run={run} />
            {t === 'cashout' && <Cashout run={run} />}
            <PackView run={run} />
            <Over run={run} />
            <Picker run={run} />
          </>
        )
      )}
      {ui.overlay === 'hands' && run && <HandsTable run={run} />}
      {ui.overlay === 'bag' && run && <DiceBag run={run} />}
      {ui.overlay === 'rules' && <Rules />}
      {ui.overlay === 'codex' && <CodexView />}
      {!title && run && (
        <button class="menu-btn" onClick={() => store.openMenu()} aria-label="菜单">
          歇
        </button>
      )}
      <BossBanner />
      {ui.menu && <PauseMenu />}
      <Coach />
      <Toast />
      <TipLayer />
    </div>
  );
}

function Gallery() {
  return (
    <div class="gallery">
      {Object.entries(ROSTER).map(([id, s]) => (
        <figure>
          <Puppet spec={s} size={190} />
          <figcaption>{id}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** If a render ever throws, offer a way back instead of a blank page. */
class Guard extends Component<{ children: ComponentChildren }, { err: string | null }> {
  state = { err: null as string | null };
  componentDidCatch(e: unknown) {
    console.error(e);
    this.setState({ err: e instanceof Error ? e.message : String(e) });
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div class="crash">
        <div class="crash-panel">
          <div class="crash-seal">断弦</div>
          <h2>戏台出了点岔子</h2>
          <p>这一局的进度已经自动存好。可以回到开场再试一次；如果还不行，就清掉存档重新开始。</p>
          <code>{this.state.err}</code>
          <div class="crash-actions">
            <button onClick={() => location.reload()}>回到开场</button>
            <button
              onClick={() => {
                removeItem('diceSmith.run.v2');
                location.reload();
              }}
            >
              清掉存档
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export function App() {
  useStore();
  if (import.meta.env.DEV && location.hash === '#puppets') return <Gallery />;
  return (
    <Guard>
      <Stage>
        <Scene />
      </Stage>
    </Guard>
  );
}
