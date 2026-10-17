# Scene authoring guide (read fully before writing a scene)

Each location = two files that you own and nobody else touches:

* `src/scenes/<id>.js`   – procedural 3D geometry (default export `{ build(ctx) }`)
* `src/content/<id>.js`  – bilingual text, tour order, per-landmark source notes

The **reference implementation is `src/scenes/winterfell.js` + `src/content/winterfell.js`** — read both first. Quality bar is
that scene *or better*. Every city must read as a different place from far away (silhouette, palette, street logic, materials, water, lighting).

## Preview / test loop
```
cd /Users/michael.wang/MW/Personal/up/westeros-atlas
unset NODE_OPTIONS                      # required, otherwise node refuses to start
node tools/preview.mjs --port=5201 <id> [<id2>...]     # run in background; bundles ONLY your ids; rebuilds on save
node tools/shot.mjs <id> out.png --port=5201 [--lm=<landmarkId>] [--atmos=dawn|day|dusk|night] [--weather=snow|rain|ash|clear] [--cut=<cutawayId>] [--q=low|medium|high] [--w=390 --h=844] [--lang=zh]
```
Then look at the PNG with the Read tool. Software GL is slow (~3 fps): the shot tool waits; use `--wait=4000` for busy scenes. Always check the
hero view, 2-3 landmark close-ups, night, and (if provided) cutaways. Fix console errors the tool prints. Use a distinct `--port` (the one you were given).
Do not edit files outside your own two files per location (kit/host are shared — if you find a kit bug, work around it in your scene and report it in your final message).

## Scene module contract
```js
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;
export default {
  build(ctx) {            // ctx: { root (THREE.Group to add to), q (quality), onUpdate(fn(dt,t)), registerWater(mesh), reduced }
    ...
    return {
      radius: 250, center: [0,0,0],        // used for camera limits (maxDistance = 3.2*radius), shadow bounds, overhead view
      minDistance: 15,                      // optional
      hero:  { pos:[x,y,z], target:[x,y,z] },   // cinematic default view: make it beautiful, 3/4 aerial, shows the silhouette
      climate: { atmos:'day'|'dawn'|'dusk'|'night', weather:'clear'|'snow'|'rain'|'ash'|'fog', snow:0..1, tint:{ day:{top,horizon,fog,fogD,sunI,sunC,hemiI,...} } },
      landmarks: { '<landmark-id>': { pos:[x,y,z], r: 10, cam?:{pos:[..],target:[..]} }, ... },   // 6-14 per scene; ids must match content file
      cutaways: [ { id, name:{en,zh}, build(ctx2) -> { center, hero:{pos,target}, minDistance, maxDistance } } ],  // optional interiors (only if the books support them)
    };
  },
};
```
* Units: 1 unit ≈ 1 m *visually* (a person is 1.7). Y up, ground ~0, water level 0 unless you choose otherwise. Scenes are 200–400 units across.
* Landmark `pos` is where the pin floats (give it a y near the top of the feature); `r` is its click/focus radius. Omit `cam` normally; the host
  frames it automatically. Give `cam` when the default framing would be inside geometry.
* `ctx.q.dens(n)` scales counts by quality (use for trees/houses/people), `ctx.q.seg(n)` for grid resolution. `ctx.q.low` is a boolean.
* Everything animated goes through `ctx.onUpdate((dt,t)=>...)`. Register every `K.water` / `K.waterPatch` mesh with `ctx.registerWater(mesh)` (it tints with the time of day).
* Add real **life**: ships/boats, gulls (`K.birds`), smoke (`K.smoke`), fires (`K.fires`), banners, `K.walkers`, `K.clouds`, steam, etc.
* Budget: ≤ ~250k triangles total, ≤ ~150 draw calls. Merge static geometry with `Batch`; use `Inst`/`K.forest`/`K.town` for repeats. No per-frame allocations.
* NO external assets, textures or network access. Everything procedural.

## Kit cheat-sheet (`src/kit/*`)
* `K.rng(seed)` → fn() in [0,1) with `.range(a,b) .int(a,b) .pick(arr) .sign()`; `K.noise2, K.fbm, K.clamp, K.lerp, K.smoothstep, K.smoothPath(pts,perSeg,closed), K.pointInPoly, K.distToPolyline`.
* Materials (triplanar, world-space textured, tinted by `color`, ALSO tinted per vertex/instance colour; snow-cover aware):
  `tri(kind, {color, scale, rough, metal, snow:true})`, kinds: `stone rock plaster wood tile thatch grass sand snow brick marble slate cobble`.
  `flat(color, {rough, metal, transparent, opacity})` untextured; `glow(color)` window/lantern material that brightens at night. `M.basic`.
  Set `snow:false` on materials that must never get snow (interiors, wood, desert).
* `new Batch()` — `box(mat,x,y,z,w,h,d,ry,color)` (y = BASE), `cyl(mat,x,y,z,r,h,{top,seg,color})`, `cone`, `sphere`, `dome(mat,x,y,z,r,{sy,seg})`, `pyramid`, `prism` (gable roof, ridge along local X), `wedge` (ramp), `extrude(mat, [[x,z],...], y, h)`, `ribbon(mat, pts, width, heightAt, lift)` (roads/canal banks that follow terrain), `addGeometry(mat, geom, matrix4)`; `b.build()` → Group (add to ctx.root). Colour arg multiplies material tint.
* `Inst(geom,mat)` + `G.box/cone/cyl/sphere/dome/prism/pyramid()`; `.add(x,y,z,sx,sy,sz,ry,color)`; `.build()`.
* `K.terrain({size|w,d, seg, heightAt(x,z), colorAt(x,z,h,slope)->Color|hex, kind, scale})` ; `K.water({w,d,seg,level,heightAt,deep,shallow,opacity,speed,choppy,center})` (shore foam from heightAt) ; `K.waterPatch({w,d,level,center,depth,...})` for moats/canals/lakes. Water must be sized to the scene (w,d) with `seg` ≈ 1 cell / 2-3 units.
  **Make the terrain big enough that its edge is hidden by fog/hills**, or add distant hills/sea so no hard horizon edge shows.
* Structures: `wall(b, pts, {h,t,mat,capMat,heightAt,closed})`, `tower(b,x,z,{r,h,y,mat,roofMat,roof:'cone'|'dome'|'flat'|'spire'|'none',roofH,seg})`, `squareTower`, `keep`, `gatehouse`, `house(b,x,y,z,{w,d,h,ry,style:'gable'|'hip'|'flat'|'tall'|'dome',wallMat,roofMat,wall,roof,glowMat})`,
  `town(b,{count,bounds,poly,minDist,size,height,heightAt,avoid,accept,style|styles,palette:[{wall,roof}],wallMat,roofMat,glowMat,orient})`→ placed list, `scatter(...)`, `bridge(b,[x,y,z],[x,y,z],{w,rise,mat,pillars})`, `ship(type,{len,hull,sail})` + `animateShip(ship,t,phase)`, `forest({count,bounds,poly,heightAt,species:'pine'|'oak'|'birch'|'palm'|'weirwood'|'cypress',snow,avoid,tint})`, `pier`, `columns`, `steppedPyramid`.
* Life: `K.smoke(emitters[[x,y,z]],opts)`, `K.fires(positions,{size,light,intensity})` (+ `fire.userData.update(t)` each frame if you use lights), `K.birds({center,radius,count,color})` (`mesh.userData.update(t)`), `K.walkers({paths,heightAt,count})` (`.userData.update(t)`), `K.banners([{x,y,z,w,h,color,ry}])`, `K.clouds(...)`, `K.weather` is host-managed (don't add).
* `K.shared.uSnow` (host-controlled snow cover) — don't set it. Atmosphere (dawn/day/dusk/night) is host-controlled; you may provide `climate.tint` to bend the palette for your region.

## Design rules
* **Accuracy first, honesty always.** Use the five novels as primary, then official maps / *The World of Ice & Fire* (TWOIAF); never the HBO series (no show designs, no show colours/sigils). If you cannot recall the books establishing something, say so in `unknown` and mark `interpretation`. Prefer fewer well-founded landmarks to many invented ones. Sparse places (barely described in the books) get a *beautiful but restrained* scene and a note saying so; do not invent canon.
* You can look things up with the **WebSearch** tool (it works). **WebFetch fails** in this environment (TLS error), so don't claim you fetched a page. Mark what you verified in `sources[].checked`:  `'memory'` (recalled from the novels, not re-read), `'search-snippet'` (confirmed via a web-search summary), `'not-accessed'`. Never write `checked:'book'` — nobody had the text in front of them.
* Don't copy passages (write original paraphrases ≤ 2 sentences), don't reproduce the show's designs.
* Each location needs: a distinct silhouette & palette, 6–14 landmarks that are individually clickable, a hero camera, life/animation, and a sensible default `climate` (north = cold/snowy, Dorne = hot/dry, Braavos = foggy/blue, etc.).
* Sparse places: 6–8 landmarks max, mark most `confidence:'low'`, keep the geometry atmospheric and restrained.
* Deep places (named `depth:'deep'` in `src/data/locations.js`) must have: 10–14 landmarks, at least one **cutaway** if a real interior is described in the books (e.g. Red Keep throne room, Great Sept, Hall of the House of Black and White is secret → no), animated water/ships where relevant, and visibly richer geometry.

## Content module schema (`src/content/<id>.js`) — see winterfell
```js
export default {
  id: '<id>',
  intro:  { en, zh },                 // 2-3 sentences orienting the visitor (no spoilers beyond the first book's scale unless unavoidable)
  notes:  { en, zh },                 // "what's from the books / what's invented" summary for the whole scene
  tour:   ['landmark-id', ...],       // guided-tour order (5-10 stops), every id must exist in landmarks
  sources:[ { ref:'agot'|'acok'|'asos'|'affc'|'adwd'|'twoiaf'|'maps'|'awoiaf'|'author', checked:'memory'|'search-snippet'|'not-accessed', note:{en,zh} } ],
  landmarks: {
    '<landmark-id>': {
      name:{en,zh}, desc:{en,zh},          // desc: 1-2 sentences, original wording
      tour:{en,zh},                        // short narration (≤ 25 words / ≤ 45 汉字)
      spoiler?:{en,zh},                    // OPTIONAL: later-book details, only shown when the visitor enables spoilers
      source:{ confidence:'high'|'medium'|'low', refs:['agot',...],
               book:{en,zh},               // what the sources actually establish
               unknown:{en,zh},            // what remains unknown
               interpretation:{en,zh} },   // what this scene invents/assumes
    }, ...
  },
};
```
Every `{en,zh}` pair must be filled. Chinese must read naturally (not literal MT): use `docs/GLOSSARY.md`; if you need a new proper noun, add it in your own final message (don't edit the glossary).
Landmark `name` is what appears on the 3D pin, so keep it ≤ 4 English words / ≤ 8 汉字. Landmark ids are kebab-case and must match the scene's `landmarks` keys exactly (tests enforce this).
Cutaway names live in the scene file (`cutaways[].name`).

## Final message
Report: what you built per location (landmarks, cutaways), anything you could not verify, kit bugs found, and any new glossary terms. Keep it under 250 words.
