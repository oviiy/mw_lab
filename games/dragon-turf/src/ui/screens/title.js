import { Screen } from '../screens.js';
import { Save } from '../../core/save.js';

const TIPS = [
  'Cops only chase crimes they actually see. Witnesses with phones count.',
  'Press E on a locked car, then tap the arrows in order. Fail, and the whole street hears the alarm.',
  'Rival crews raid your turf. Defend it, or lose the income.',
  'Dealers work the alleys of every district after dark. Buy cheap in one district, sell in another.',
  'Unclaimed turf (grey on the map) is free: walk up to its ⚑ hideout and press E.',
  'Failed a mission? Press R straight away to retry without the cutscenes.',
  'Drive any taxi and press N to pick up fares.',
  'A Pay \'n\' Spray wipes your wanted level, if nobody is looking.',
  'Press Space to roll. Rolling dodges bullets for a heartbeat.',
  'Oil barrels explode. Cars explode more. Stand somewhere else.',
];

export class TitleScreen extends Screen {
  open() {
    this.noEsc = true; this.el.classList.add('title');
    const has = Save.has();
    this.html(`<div class="title-wrap">
      <div class="logo">DRAGON TURF<small>CHINATOWN GANG WAR</small></div>
      <div class="logo-cn">龍 門 之 爭</div>
      <div class="menu">
        <button class="btn primary" data-a="new"><span>New Game</span></button>
        <button class="btn" data-a="cont" ${has ? '' : 'disabled'}><span>Continue</span></button>
        <button class="btn" data-a="how"><span>How to Play</span></button>
        <button class="btn ghost" data-a="set"><span>Settings</span></button>
      </div>
      <div class="tagline" id="tip">${TIPS[(Math.random() * TIPS.length) | 0]}</div>
    </div><div class="ver">v1.0 · A procedural love letter to old-school top-down crime</div>`);
    this.$$('.btn').forEach((b) => b.addEventListener('click', () => this.act(b.dataset.a)));
    this.tipT = 0;
  }
  act(a) {
    const g = this.game; g.audio.init(); g.audio.ui('ok');
    if (a === 'new') { if (Save.has() && !confirm('Start a new game? Your current save will be overwritten when you next save.')) return; this.close(); g.beginGame(false); }
    else if (a === 'cont') { this.close(); g.beginGame(true); }
    else if (a === 'how') g.screens.open('howto');
    else if (a === 'set') g.screens.open('settings');
  }
  update(dt) { this.tipT += dt; if (this.tipT > 6) { this.tipT = 0; this.$('#tip').textContent = TIPS[(Math.random() * TIPS.length) | 0]; } }
  onKey(e) { if (e.code === 'Enter') { this.act('new'); return true; } return e.code === 'Escape'; }
}

export class HowToScreen extends Screen {
  open() {
    this.html(`<div class="panel" style="width:min(900px,95vw)"><h2>HOW TO PLAY</h2><div class="sub">You are Kai Lin, back on Dragon Street. Take it back, block by block.</div>
    <div class="grid2 howto"><div>
      <h3 class="sh">ON FOOT</h3>
      <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> roll (dodges bullets)</p>
      <p><kbd>Mouse</kbd> aim · <kbd>LMB</kbd> shoot / punch · <kbd>RMB</kbd> or <kbd>V</kbd> melee · <kbd>G</kbd> throw</p>
      <p><kbd>1</kbd>–<kbd>6</kbd>, <kbd>Q</kbd> or wheel: switch weapon</p>
      <h3 class="sh">IN A VEHICLE</h3>
      <p><kbd>W</kbd> gas · <kbd>S</kbd> brake / reverse · <kbd>A</kbd><kbd>D</kbd> steer · <kbd>Space</kbd> handbrake</p>
      <p><kbd>LMB</kbd> drive-by · <kbd>H</kbd> horn · <kbd>T</kbd> radio · <kbd>N</kbd> taxi fares (in a taxi)</p>
      <h3 class="sh">EVERYWHERE</h3>
      <p><kbd>E</kbd> / <kbd>F</kbd> enter, carjack, hotwire, talk, shop · <kbd>Tab</kbd> PDA · <kbd>C</kbd> camera · <kbd>Z</kbd> zoom · <kbd>Esc</kbd> pause · <kbd>R</kbd> retry a failed mission</p>
    </div><div>
      <h3 class="sh">GETTING STARTED</h3>
      <p class="hint">The city is yours to roam: steal a car, explore, make money however you like. When you want the story, find <b style="color:#ffd23a">Uncle Wei's teahouse (☯)</b> on the map (<kbd>Tab</kbd>) and talk to him. Madam Lin (☎) has work later.</p>
      <p class="hint"><b style="color:#37e6ff">Big toys:</b> Fort Jade Airbase (✈) has a stunt plane and a helicopter, its tank yard (★) has a tank, and the marina (⚓) has boats. Stealing military hardware brings the heat. In aircraft, <kbd>LMB</kbd>/<kbd>RMB</kbd> fire the mounted weapons and <kbd>E</kbd> bails out by parachute.</p>
      <p class="hint"><b style="color:#7dff6a">Always something to do:</b> 30 hidden Jade Dragons, 12 stunt ramps, 12 rampage skulls (☠ on the radar), taxi and vigilante jobs (<kbd>N</kbd> in a taxi or cop car), and a gang rank that unlocks perks. Wreck cop cars to shake off stars. PDA → PROGRESS shows your city completion.</p>
      <h3 class="sh">WAYS TO EARN</h3>
      <p class="hint">• <b>Turf</b>: raid a ⚑ hideout (3 waves) or claim an unclaimed one for free. Every turf you own pays each hour. Collect it at your safehouse (⌂), which is also where you save.<br>• <b>Dealers</b>: at night, buy contraband cheap in one district and sell it in another.<br>• <b>Chop shop</b> (⚙): sell any car you steal.<br>• <b>Taxi</b> fares, and break up muggings for rewards.</p>
      <h3 class="sh">HEAT</h3>
      <p class="hint">Cops only react to crimes they see, or that a witness phones in. At 1★ they try to arrest you, and from 2★ they shoot. Break line of sight to cool off, or use a respray (✎).</p>
    </div></div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-a="ok"><span>Got it</span></button></div></div>`);
    this.$('[data-a=ok]').addEventListener('click', () => this.close());
  }
}
