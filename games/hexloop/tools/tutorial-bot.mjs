// Every lesson must be beatable by following the guidance (gold ghost ring or suggestion). node tools/tutorial-bot.mjs
import * as G from '../src/game.js';
import { K, P } from '../src/hex.js';
import { TUTORIAL } from '../src/levels.js';
const S = G.S; let fails = 0;
for (let i = 0; i < TUTORIAL.length; i++) {
  for (let trial = 0; trial < 20; trial++) {
    S.meta = G.defMeta(); G.startRun('tutorial'); while (S.run.tut < i) G.nextTutorial();
    let prev = null, n = 0;
    while (S.run.phase === 'play' && n++ < 200) {
      const r = S.run; let k;
      if (r.goal === 'collect') { const t = Object.keys(r.pickups)[0]; k = G.routeTo(t)[0]; }
      else if (r.ghost) { k = r.ghost.find((g) => !r.tail.includes(g) && K(...r.player) !== g && S.grid.nb[K(...r.player)].includes(g)); }
      else { const sg = G.suggest(prev); prev = sg && sg.loop ? { ...sg, path: sg.path.slice(1) } : null; k = sg && sg.path[0]; }
      const m = k && G.moves().find((x) => K(x.q, x.r) === k);
      G.doMove(m || { q: r.player[0], r: r.player[1] }); G.takeEvents();
    }
    if (S.run.phase !== 'tutwin') { fails++; console.log(`lesson ${i + 1} trial ${trial}: ${S.run.phase} hp=${S.run.hp}`); break; }
  }
  console.log(`lesson ${i + 1} (${TUTORIAL[i].title}): ok`);
}
console.log(fails ? `${fails} lesson(s) failed` : 'all lessons pass by following guidance');
