import { useEffect, useRef, useState } from 'preact/hooks';
import { layoutRef } from '../Stage';
import { store } from '../store';
import { DiceTable, webglAvailable } from './DiceTable';
import { FaceImg } from '../hud';
import { makeDie } from '../../core/dice';

/** Hosts the 3D dice tray; falls back to flat dice when WebGL is unavailable. */
export function DiceTableView({ interactive }: { interactive: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [gl] = useState(webglAvailable);

  useEffect(() => {
    if (!gl || !host.current) return;
    const t = new DiceTable(host.current);
    t.pixelScale = layoutRef.current.scale;
    t.resize();
    if (!interactive && !store.run?.round) {
      // Title: three plain dice tumbling now and then.
      const dice = [1, 2, 3].map((i) => makeDie(`demo${i}`));
      t.setDice(dice);
      const roll = () => {
        void t.roll([0, 1, 2], [0, 1, 2].map(() => Math.floor(Math.random() * 6)));
      };
      roll();
      const iv = setInterval(roll, 5200);
      return () => {
        clearInterval(iv);
        t.dispose();
      };
    }
    t.onPick = (i) => store.tapDie(i);
    store.attachTable(t);
    return () => {
      store.attachTable(null);
      t.dispose();
    };
  }, [gl, interactive]);

  const run = store.run;
  const round = run?.round;
  const tags = round && interactive ? <HoldTags /> : null;

  if (!gl && run && round) {
    return (
      <div class="dice-flat">
        {run.dice.map((d, i) => (
          <button class={`flat-die ${round.rolled[i].held ? 'is-held' : ''}`} onClick={() => store.tapDie(i)}>
            <FaceImg face={d.faces[round.rolled[i].face]} material={d.material} size={92} hidden={round.hidden} />
          </button>
        ))}
      </div>
    );
  }
  return (
    <div class={`dice-host ${store.ui.flipMode ? 'is-flipping' : ''}`} ref={host}>
      {tags}
    </div>
  );
}

/** Red "扣" tags over held dice, positioned from the 3D projection. */
function HoldTags() {
  const run = store.run!;
  const round = run.round!;
  const t = store.table;
  const host = document.querySelector('.dice-host')?.getBoundingClientRect();
  if (!t || !host || store.ui.busy) return null;
  const s = layoutRef.current.scale;
  return (
    <>
      {round.rolled.map((r, i) => {
        if (!r.held) return null;
        const p = t.screenPos(i);
        if (!p) return null;
        return (
          <span class="hold-tag" style={{ left: `${(p.x - host.left) / s}px`, top: `${(p.y - host.top) / s - 34}px` }}>
            扣
          </span>
        );
      })}
    </>
  );
}
