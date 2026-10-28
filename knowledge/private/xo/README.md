# 京龟大闹潘家园儿

A little arena survivor in the style of Brotato: hold out for ten waves in a Beijing courtyard while the cast closes in, and pick a 海克斯 augment after each wave.

- **Play:** move with WASD / arrow keys, or put a finger down anywhere and drag (a floating joystick, so phones work upright or sideways). The turtle fires at the nearest enemy by herself, and leans toward bosses and elites.
- **超级蜘蛛:** kills charge the spider. Press Space or tap the button: a web spreads over the yard and everything nearby is wrapped up and slowly squeezed.
- **Waves:** 10 waves (28–56 s for regular waves), afternoon to lantern-lit night, each new enemy type turning up early in its wave. When the timer ends, new enemies stop arriving and the player clears the remaining enemies before choosing an augment. Enemies get tougher and faster wave by wave. Wave 5 brings 大毛（超大号）, wave 10 brings 沉毅羊（法官）. Waves 7–9 add 潮汐监狱 tides that sweep across the yard.
- **精英怪:** from wave 3, elites arrive with an affix (狂暴 / 坚韧 / 分裂 / 爆炸), a coloured aura and five times the health. Each drops a 大红宝箱 (a meteor storm, a white-ox herd, a full heal with shields, or a full spider).
- **Pickups:** things appear on the floor every ten seconds or so: 马背上的民族 (ride a horse and trample, shouting it), 北京骑行夫妇 (a tandem bike with 蔡博 pedalling behind), 白牛冲锋 (a stampede), 米拉娜的流星风暴, 女酋长的祝福 (invulnerable and stronger for 8 s), 蜘蛛之力, 豆汁儿, 糖葫芦磁铁.
- **海克斯:** one pick after each wave: three cards of one tier (白银, 黄金, 棱彩), with rerolls. Level-ups give a small bonus straight away instead. The augments are named after her catchphrases: 声音没我甜, 他应该不会下包的, 叫队友 (teammate 蔡博), 喜欢我的白牛吗, 马背上的民族, 米拉娜的流星风暴, 女酋长的祝福, 潮汐监狱越狱, 你的龟昨天晚上风好大, 你的龟决定关窗户睡觉了, and more.
- **Feedback:** combo counter and 甜度 score with a combo multiplier, Dota-style streak calls (大杀特杀 … 超神), a rating for each wave (S for no damage earns an extra reroll), a best score kept in the browser.
- **Cast:** 小榴莲, 橘子 (bounces around), 姜饼人 (zig-zags), 丁丁 (hops in for a hug, 顶级顶级), 往昔蚝 (old-timey oyster, spits pearls), 徐山羊 (charges, then shouts 腊肠攻击 and throws a sausage; the turtle asks 你们是不是生活不如意啊), Caesar (throws a pilum), 陈伟 (counter-terrorist: aims, bursts, flashbangs), 甲方 (谁问你了) / 乙方, 果哥 (a 开心果 that drops ? marks from the sky), 吴浩然 (a bear warrior who steals candy and throws 彩礼38.8W red envelopes), 大毛 (splits into 小毛球), 沉毅羊（法官）. Names and lines live in `src/config.js`.

## Stack

Same as `skerry`: Three.js + esbuild, bundled into `dist/index.html` and `dist/app.js` with no external images, fonts or audio. Everything is generated in code. Deploy both files together.

| Module | Role |
| --- | --- |
| `game.js` | Pure simulation at 60 steps/s: movement, waves, enemy behaviour, augments, damage. Reports through an event list. |
| `config.js` | Title, cast, lines and augment definitions |
| `models.js` | Procedural cel-shaded characters with inked outlines; each is baked into a few merged meshes and cloned per spawn |
| `world.js` | Courtyard, hall, walls, lanterns, tree, well, Beijing beyond the wall, sky shader, day-to-night per wave, bloom |
| `fx.js` | Pooled particle clouds, rings, the 超级蜘蛛 web and spider |
| `audio.js` | Web Audio: pentatonic guzheng-style loop, babble voices, sound effects |
| `ui.js` / `main.js` / `index.html` | HUD, labels, augment picker, screens, input, camera, render sync, adaptive quality |

## Build & test

```bash
npm install
node build.mjs        # -> dist/index.html + dist/app.js (deploy both files)
npm test              # simulation unit tests (node:test)
```
