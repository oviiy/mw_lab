import { Screen } from '../screens.js';
import { Save } from '../../core/save.js';

export class PauseScreen extends Screen {
  open() {
    this.html(`<div class="panel" style="width:min(400px,90vw);text-align:center"><h2>PAUSED</h2><div class="sub">Dragon Street waits for no one</div>
      <div class="menu" style="margin:0 auto">
        <button class="btn primary" data-a="resume"><span>Resume</span></button>
        <button class="btn" data-a="pda"><span>PDA</span></button>
        <button class="btn" data-a="save"><span>Save Game</span></button>
        <button class="btn" data-a="set"><span>Settings</span></button>
        <button class="btn" data-a="cheat"><span>Cheats · F1</span></button>
        <button class="btn ghost" data-a="quit"><span>Quit to Title</span></button>
      </div></div>`);
    this.$$('.btn').forEach((b) => b.addEventListener('click', () => this.act(b.dataset.a)));
  }
  act(a) {
    const g = this.game; g.audio.ui('tick');
    if (a === 'resume') this.close();
    else if (a === 'pda') { this.close(); setTimeout(() => g.screens.open('pda'), 240); }
    else if (a === 'save') { if (g.saveGame()) g.hud.toast('Game saved', 2200, 'good'); else g.hud.toast('Could not save', 2200, 'bad'); }
    else if (a === 'set') g.screens.open('settings');
    else if (a === 'cheat') { this.close(); setTimeout(() => g.screens.open('cheats'), 240); }
    else if (a === 'quit') { this.close(); g.quitToTitle(); }
  }
  onKey(e) { if (e.code === 'KeyP') { this.close(); return true; } return false; }
}
void Save;

export class SettingsScreen extends Screen {
  open() {
    const g = this.game, a = g.audio;
    this.html(`<div class="panel" style="width:min(520px,92vw)"><h2>SETTINGS</h2><div class="sub">Sound, music and feel</div>
      <div class="list">
        <div class="item"><span class="ico">🔊</span><div><div class="t">Master volume</div></div><input type="range" min="0" max="100" value="${Math.round(a.volume * 100)}" data-k="vol"></div>
        <div class="item"><span class="ico">🎵</span><div><div class="t">Music volume</div></div><input type="range" min="0" max="100" value="${Math.round((a.musicBus ? a.musicBus.gain.value : 0.5) * 100)}" data-k="mus"></div>
        <div class="item"><span class="ico">📻</span><div><div class="t">Radio station</div><div class="d" id="st">${g.music.name}</div></div><button class="btn small" data-k="radio"><span>Next</span></button></div>
        <div class="item"><span class="ico">🔇</span><div><div class="t">Mute all</div></div><button class="btn small" data-k="mute"><span>${a.muted ? 'Unmute' : 'Mute'}</span></button></div>
        <div class="item"><span class="ico">📳</span><div><div class="t">Screen shake</div></div><button class="btn small" data-k="shake"><span>${g.settings.shake ? 'On' : 'Off'}</span></button></div>
        <div class="item"><span class="ico">🌧</span><div><div class="t">Weather</div></div><button class="btn small" data-k="weather"><span>${g.settings.weather ? 'On' : 'Off'}</span></button></div>
      </div><div class="row" style="justify-content:center;margin-top:16px"><button class="btn primary" data-k="ok"><span>Done</span></button></div></div>`);
    this.$('[data-k=vol]').addEventListener('input', (e) => a.setVolume(e.target.value / 100));
    this.$('[data-k=mus]').addEventListener('input', (e) => { if (a.musicBus) a.musicBus.gain.value = e.target.value / 100; });
    this.$('[data-k=radio]').addEventListener('click', () => { g.music.next(); this.$('#st').textContent = g.music.name; });
    this.$('[data-k=mute]').addEventListener('click', (e) => { a.setMuted(!a.muted); e.currentTarget.firstChild.textContent = a.muted ? 'Unmute' : 'Mute'; });
    this.$('[data-k=shake]').addEventListener('click', (e) => { g.settings.shake = !g.settings.shake; e.currentTarget.firstChild.textContent = g.settings.shake ? 'On' : 'Off'; });
    this.$('[data-k=weather]').addEventListener('click', (e) => { g.settings.weather = !g.settings.weather; e.currentTarget.firstChild.textContent = g.settings.weather ? 'On' : 'Off'; });
    this.$('[data-k=ok]').addEventListener('click', () => this.close());
  }
}
