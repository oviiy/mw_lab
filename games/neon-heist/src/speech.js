import * as THREE from 'three';
import { G } from './state.js';
import { pick, dist } from './util.js';

// What people in the city say, by situation.
export const LINES = {
  greet: ['Morning!', 'Nice day, huh?', 'Hey there.', "How's it going?", 'Lovely weather today.', 'Hi!', 'Watch your step, friend.', 'Excuse me, pardon.'],
  chat: ["Can you believe the traffic today?", 'I swear that bus is always late.', 'Did you see the game last night?', 'Need coffee. Badly.', 'Rent in this city is insane...', "I'm so late for work!", 'Nice dog!', 'Is it just me or is it getting loud around here?', 'Sirens again...'],
  nice: ['Nice car!', 'Sweet ride!', "Wow, that's fast!", 'Is that a sports car?!'],
  night: ["It's late...", 'Creepy out here tonight.', 'I should be home by now.', 'Stay out of the alleys, pal.'],
  hurt: ["Hey, you're bleeding! You okay?", 'You look terrible, man.', 'Need a doctor?'],
  armed: ['Whoa, easy there, pal!', 'Is that a gun?!', 'Please, I have a family!', 'Somebody help!', 'Put that away!'],
  hands: ["Don't shoot! Don't shoot!", 'Take whatever you want!', 'Please, no!', "I've got kids!", "I don't want any trouble!"],
  mug: ["Here, take it! Just go!", "That's all I've got!", 'Please don\'t hurt me!', 'Take it, take it!'],
  scared: ['Help!', 'Run!', 'Aaaah!', "He's got a gun!", 'Call the police!', 'Oh my god!'],
  witness: ['He killed him!', 'Murderer!', 'Somebody call the cops!', 'Oh my god, oh my god!', 'I saw everything!'],
  near: ['Hey! Watch it!', 'Are you crazy?!', 'Slow down, maniac!', 'Learn to drive!', "Watch where you're going!"],
  hit: ['Ow! My leg!', 'What the hell?!', "You'll pay for this!", 'Ahh! Why?!'],
  talk: ['Do I know you?', "Sorry, I'm in a hurry.", 'Nice to meet you.', 'I hear there is a gun shop downtown.', 'Be careful, cops are everywhere.', 'The park is lovely at sunset.', 'Got any spare change?', 'Courier jobs pay well, I hear.', 'Try the burgers on Main — best in town.', "There's a Pay'n'Spray if you need to lose a tail."],
  copFreeze: ['Freeze! Police!', 'Hands where I can see them!', 'Stop right there!'],
  copDrop: ['Drop the weapon!', 'Put it down, now!', 'Last warning!'],
  copArrest: ["You're under arrest!", 'Get on the ground!', 'Nowhere to run!'],
  copShots: ['Shots fired!', 'Suspect is armed!', 'Requesting backup!', 'He is armed and dangerous!'],
  shopHi: ['Welcome in!', 'Take a look around.', 'What can I get you?'],
  shopBye: ['Come again!', 'Take care out there.', 'Stay safe.'],
  broke: ["Sorry, you can't afford that.", 'Come back with more cash.'],
  me: ['Nice.', 'Let me think...', 'Hmm.'],
};
export const line = (cat) => pick(LINES[cat] || LINES.chat);

// Floating speech bubbles anchored to entities and projected to screen space.
export class Speech {
  constructor() { this.root = document.getElementById('speech'); this.items = []; this.v = new THREE.Vector3(); }

  say(ent, text, { secs = 2.8, cls = '', h = 2.15, range = 40 } = {}) {
    if (!text) return;
    const p = G.player;
    if (ent !== p && dist(ent.x, ent.z, p.x, p.z) > range) return;
    let it = this.items.find((i) => i.ent === ent);
    if (!it) {
      if (this.items.length >= 5) { const o = this.items.shift(); o.el.remove(); }
      const el = document.createElement('div'); this.root.appendChild(el); it = { ent, el }; this.items.push(it);
    }
    it.el.className = 'bubble ' + cls; it.el.textContent = text; it.t = 0; it.max = secs; it.h = h;
  }

  update(dt) {
    const cam = G.camRig.camera, W = innerWidth, H = innerHeight;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i]; it.t += dt;
      const e = it.ent;
      if (it.t > it.max || (e.state === 'dead') || (e.dead)) { it.el.remove(); this.items.splice(i, 1); continue; }
      this.v.set(e.x, it.h + (e.y || 0), e.z).project(cam);
      if (this.v.z > 1 || this.v.z < -1) { it.el.style.opacity = 0; continue; }
      const d = dist(e.x, e.z, G.player.x, G.player.z);
      it.el.style.opacity = Math.min(1, (it.max - it.t) * 3, 1.6 - d / 28);
      it.el.style.transform = `translate(${((this.v.x * 0.5 + 0.5) * W) | 0}px,${((-this.v.y * 0.5 + 0.5) * H) | 0}px) translate(-50%,-125%)`;
    }
  }
  clear() { for (const it of this.items) it.el.remove(); this.items.length = 0; }
}
