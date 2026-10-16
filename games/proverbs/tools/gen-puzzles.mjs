// Generates the four puzzles for Proverbs and writes ../puzzles.js
// Run: node tools/gen-puzzles.mjs
//
// Rules: the board is cut into regions. A number counts the filled cells in its 3×3 block that lie
// in the SAME region as the number — regions never affect each other, so each one is its own puzzle.
//
// For each map: regions (random, interlocking, some long strips), then a hidden fill pattern (mask),
// then clues are removed one by one (blank 0s and full 9s first) while a local logic check still
// settles the cells around the removed clue. A global solve then proves the whole board is solvable
// by pure logic (single-clue rules + two-clue overlap rules), adding clues back where it gets stuck.
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

export const MAPS=[
  {id:1,W:192,H:128,seed:1101,keep:.3,tex:[4.6,2.3,.24]},
  {id:2,W:208,H:136,seed:2207,keep:.15,tex:[4,2,.29]},
  {id:3,W:224,H:144,seed:3313,keep:.06,tex:[3.5,1.8,.33]},
  {id:4,W:240,H:160,seed:4421,keep:0,tex:[3.2,1.7,.35]},
];

function makeRegions(W,H,rnd,octave){
  const N=W*H,region=new Int32Array(N).fill(-1),D4=[[1,0],[-1,0],[0,1],[0,-1]];let NR=0;const sizes=[];
  const nStrips=Math.round(N/1400);
  for(let s=0;s<nStrips;s++){
    let x=rnd()*W,y=rnd()*H;if(region[(y|0)*W+(x|0)]>=0)continue;
    let ang=rnd()*Math.PI*2;const len=40+(rnd()*80|0),wd=rnd()<.55?2:3,cells=[];
    for(let k=0;k<len;k++){
      for(let a=0;a<wd;a++)for(let b=0;b<wd;b++){const X=Math.round(x)+a,Y=Math.round(y)+b;if(X<0||Y<0||X>=W||Y>=H)continue;const i=Y*W+X;if(region[i]===-1){region[i]=NR;cells.push(i)}}
      ang+=(rnd()-.5)*.8;x+=Math.cos(ang);y+=Math.sin(ang);
      if(x<0||y<0||x>=W-1||y>=H-1)break;const ni=Math.round(y)*W+Math.round(x);if(region[ni]>=0&&region[ni]!==NR)break;
    }
    if(cells.length<45){cells.forEach(i=>region[i]=-1);continue}
    sizes[NR++]=cells.length;
  }
  const heap=[];const hpush=(c,i,r)=>{heap.push([c,i,r]);let k=heap.length-1;while(k){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const hpop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return top};
  let free=0;for(let i=0;i<N;i++)if(region[i]<0)free++;
  const nSeeds=Math.round(free/220),ang=[],asp=[],cap=[],stripCount=NR;
  for(let s=0;s<nSeeds;s++){let i,tries=0;do{i=(rnd()*N)|0}while(region[i]>=0&&++tries<200);if(region[i]>=0)continue;
    region[i]=NR;sizes[NR]=1;ang[NR]=rnd()*Math.PI;asp[NR]=1+rnd()*2.6;cap[NR]=90+rnd()*320;
    for(const[dx,dy]of D4){const X=i%W+dx,Y=((i/W)|0)+dy;if(X>=0&&Y>=0&&X<W&&Y<H)hpush(1,Y*W+X,NR)}NR++}
  const fields=[octave(5),octave(5),octave(5)];
  const step=(r,dx,dy,X,Y)=>{const c=Math.cos(ang[r]),s=Math.sin(ang[r]),n=fields[r%3](X,Y);return(Math.abs(dx*c+dy*s)+Math.abs(-dx*s+dy*c)*asp[r])*(.12+n*n*n*7)*(.5+rnd())};
  const grow=capped=>{while(heap.length){const[c,i,r]=hpop();if(region[i]>=0)continue;if(capped&&sizes[r]>=cap[r])continue;
    region[i]=r;sizes[r]++;const x=i%W,y=(i/W)|0;
    for(const[dx,dy]of D4){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H&&region[Y*W+X]<0)hpush(c+(r<stripCount?1:step(r,dx,dy,X,Y)),Y*W+X,r)}}};
  grow(true);
  for(let i=0;i<N;i++)if(region[i]>=stripCount){const x=i%W,y=(i/W)|0;for(const[dx,dy]of D4){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H&&region[Y*W+X]<0)hpush(rnd(),Y*W+X,region[i])}}
  grow(false);
  for(let pass=0;pass<80;pass++){let left=0;for(let i=0;i<N;i++)if(region[i]<0){left++;const x=i%W,y=(i/W)|0;for(const[dx,dy]of D4){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H&&region[Y*W+X]>=0){region[i]=region[Y*W+X];break}}}if(!left)break}
  const absorb=(cells,r)=>{const cnt=new Map(),set=new Set(cells);
    for(const k of cells){const x=k%W,y=(k/W)|0;for(const[dx,dy]of D4){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(set.has(j))continue;const q=region[j];if(q!==r)cnt.set(q,(cnt.get(q)||0)+1)}}
    let best=-1,bc=-1;for(const[q,c]of cnt)if(c>bc){bc=c;best=q}if(best>=0)for(const k of cells)region[k]=best};
  const fix=()=>{const seen=new Uint8Array(N),comps=new Map();
    for(let i=0;i<N;i++){if(seen[i])continue;const r=region[i],stk=[i],cells=[];seen[i]=1;
      while(stk.length){const k=stk.pop();cells.push(k);const x=k%W,y=(k/W)|0;for(const[dx,dy]of D4){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(!seen[j]&&region[j]===r){seen[j]=1;stk.push(j)}}}
      if(!comps.has(r))comps.set(r,[]);comps.get(r).push(cells)}
    for(const[r,list]of comps){list.sort((a,b)=>b.length-a.length);for(let k=1;k<list.length;k++)absorb(list[k],r)}
    const sz=new Map();for(let i=0;i<N;i++)sz.set(region[i],(sz.get(region[i])||0)+1);
    for(const[r,list]of comps){const cells=list[0];if(cells.length<30&&sz.get(r)===cells.length)absorb(cells,r)}};
  fix();fix();fix();
  const remap=new Map();for(let i=0;i<N;i++){if(!remap.has(region[i]))remap.set(region[i],remap.size);region[i]=remap.get(region[i])}
  return region;
}

function generate(m){
  const {W,H}=m,N=W*H;let seed=m.seed;
  const rnd=()=>(seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff)/0x7fffffff;
  const octave=scale=>{const gw=Math.ceil(W/scale)+2,gh=Math.ceil(H/scale)+2,g=new Float32Array(gw*gh);for(let k=0;k<g.length;k++)g[k]=rnd();
    return(x,y)=>{const fx=x/scale,fy=y/scale,ix=fx|0,iy=fy|0;let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);
      const a=g[iy*gw+ix],b=g[iy*gw+ix+1],c=g[(iy+1)*gw+ix],d=g[(iy+1)*gw+ix+1],t=a+(b-a)*tx,u=c+(d-c)*tx;return t+(u-t)*ty}};
  const region=makeRegions(W,H,rnd,octave);
  // hidden fill pattern: fine-grained texture, so clue values spread out instead of piling up at 0 and 9.
  // Each region gets its own fill ratio (35–65%) so regions feel different.
  const mask=new Uint8Array(N);
  {const[s1,s2,nz]=m.tex,o1=octave(s1),o2=octave(s2),a=1-nz;const NRr=Math.max(...region)+1,bias=[];for(let r=0;r<NRr;r++)bias.push((rnd()-.5)*.3);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;mask[i]=(a*.58*o1(x,y)+a*.42*o2(x,y)+nz*rnd()+bias[region[i]]*.5)>.5?1:0}}
  // a clue's scope = its 3×3 block ∩ its own region
  const NB=[];for(let i=0;i<N;i++){const x=i%W,y=(i/W)|0,r=region[i],a=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H&&region[Y*W+X]===r)a.push(Y*W+X)}NB.push(Int32Array.from(a))}
  const NB2=[];for(let i=0;i<N;i++){const x=i%W,y=(i/W)|0,r=region[i],a=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(!dx&&!dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H&&region[Y*W+X]===r)a.push(Y*W+X)}NB2.push(Int32Array.from(a))}
  const cv=new Uint8Array(N);for(let i=0;i<N;i++){let c=0;for(const j of NB[i])c+=mask[j];cv[i]=c}
  const has=new Uint8Array(N).fill(1),given=new Uint8Array(N);
  const kn=new Int8Array(N);
  const q1=[],q2=[],in1=new Uint8Array(N),in2=new Uint8Array(N);
  const push=c=>{if(!has[c])return;if(!in1[c]){in1[c]=1;q1.push(c)}if(!in2[c]){in2[c]=1;q2.push(c)}};
  const setK=(j,v)=>{kn[j]=v;for(const c of NB[j])push(c)};
  const stA=new Int32Array(N),stB=new Int32Array(N);let tok=0;
  function single(c){let f=0,u=0;for(const j of NB[c]){if(kn[j]<0)u++;else f+=kn[j]}if(!u)return false;
    if(f===cv[c]){for(const j of NB[c])if(kn[j]<0)setK(j,0);return true}
    if(f+u===cv[c]){for(const j of NB[c])if(kn[j]<0)setK(j,1);return true}return false}
  const oA=[],oB=[],sh=[];
  function pair(a,b){
    tok++;for(const j of NB[a])stA[j]=tok;for(const j of NB[b])stB[j]=tok;
    let rA=cv[a],rB=cv[b];oA.length=0;oB.length=0;sh.length=0;
    for(const j of NB[a]){if(kn[j]>=0)rA-=kn[j];else if(stB[j]===tok)sh.push(j);else oA.push(j)}
    for(const j of NB[b]){if(kn[j]>=0)rB-=kn[j];else if(stA[j]!==tok)oB.push(j)}
    if(!sh.length)return false;
    const lo=Math.max(0,rA-oA.length,rB-oB.length),hi=Math.min(sh.length,rA,rB);let ch=false;
    const fill=(arr,v)=>{for(const j of arr)if(kn[j]<0){setK(j,v);ch=true}};
    if(oA.length){if(rA-lo<=0)fill(oA,0);else if(rA-hi>=oA.length)fill(oA,1)}
    if(oB.length){if(rB-lo<=0)fill(oB,0);else if(rB-hi>=oB.length)fill(oB,1)}
    if(lo===sh.length)fill(sh,1);else if(hi===0)fill(sh,0);
    return ch;
  }
  function run(){
    for(;;){
      while(q1.length){const c=q1.pop();in1[c]=0;if(has[c])single(c)}
      if(!q2.length)return;
      const a=q2.pop();in2[a]=0;if(!has[a])continue;
      let u=0;for(const j of NB[a])if(kn[j]<0)u++;if(!u)continue;
      for(const b of NB2[a]){if(has[b]&&pair(a,b))break}
    }
  }
  // ---- 1. local removal: blank/full clues first, then the rest ----
  kn.set(mask);
  const order=[...Array(N).keys()];for(let k=N-1;k>0;k--){const j=(rnd()*(k+1))|0;[order[k],order[j]]=[order[j],order[k]]}
  const extreme=c=>cv[c]===0||cv[c]===NB[c].length;
  order.sort((a,b)=>extreme(b)-extreme(a));
  const R_UNK=4,R_REQ=2;const t0=Date.now();
  for(const c of order){
    has[c]=0;const cx=c%W,cy=(c/W)|0,unk=[];
    for(let y=Math.max(0,cy-R_UNK);y<=Math.min(H-1,cy+R_UNK);y++)for(let x=Math.max(0,cx-R_UNK);x<=Math.min(W-1,cx+R_UNK);x++){const i=y*W+x;kn[i]=-1;unk.push(i)}
    for(let y=Math.max(0,cy-R_UNK-1);y<=Math.min(H-1,cy+R_UNK+1);y++)for(let x=Math.max(0,cx-R_UNK-1);x<=Math.min(W-1,cx+R_UNK+1);x++)push(y*W+x);
    run();
    let ok=true;for(let y=Math.max(0,cy-R_REQ);y<=Math.min(H-1,cy+R_REQ)&&ok;y++)for(let x=Math.max(0,cx-R_REQ);x<=Math.min(W-1,cx+R_REQ);x++)if(kn[y*W+x]<0){ok=false;break}
    for(const i of unk)kn[i]=mask[i];
    if(!ok)has[c]=1;
  }
  for(let i=0;i<N;i++)if(!has[i]&&!extreme(i)&&rnd()<m.keep)has[i]=1;
  const tLocal=Date.now()-t0;
  // ---- 2. global proof + repair (prefer adding back mid-range clues) ----
  kn.fill(-1);let added=0,givens=0;
  for(let i=0;i<N;i++)push(i);
  for(let it=0;it<8000;it++){
    run();const unk=[];for(let i=0;i<N;i++)if(kn[i]<0)unk.push(i);if(!unk.length)break;
    let cand=unk.filter(i=>!has[i]&&!extreme(i));if(!cand.length)cand=unk.filter(i=>!has[i]);
    if(cand.length){const n=Math.max(1,Math.ceil(cand.length*.15));for(let k=0;k<n;k++){const i=cand[(rnd()*cand.length)|0];if(!has[i]){has[i]=1;added++;push(i)}}}
    else{const i=unk[(rnd()*unk.length)|0];given[i]=1;givens++;setK(i,mask[i])}
  }
  let wrong=0;for(let i=0;i<N;i++)if(kn[i]!==mask[i])wrong++;
  // ---- 3. difficulty + clue value spread ----
  kn.fill(-1);for(let i=0;i<N;i++)if(given[i])kn[i]=mask[i];
  {let ch=true;while(ch){ch=false;for(let c=0;c<N;c++)if(has[c]&&single(c))ch=true}}
  let l1only=0;for(let i=0;i<N;i++)if(kn[i]>=0)l1only++;
  q1.length=q2.length=0;in1.fill(0);in2.fill(0);
  let nClues=0;const hist=new Array(10).fill(0);let ext=0;for(let i=0;i<N;i++)if(has[i]){nClues++;hist[cv[i]]++;if(extreme(i))ext++}
  const stats={W,H,regions:Math.max(...region)+1,clueDensity:+(nClues/N).toFixed(3),addedBack:added,givens,
    singleRuleSolves:+(l1only/N).toFixed(3),extremeShare:+(ext/nClues).toFixed(3),hist:hist.map(v=>+(v/nClues*100).toFixed(1)),wrong,ms:tLocal};
  return {mask,has,given,region,stats};
}

const b64=bits=>{const n=bits.length,b=Buffer.alloc(Math.ceil(n/8));for(let i=0;i<n;i++)if(bits[i])b[i>>3]|=1<<(i&7);return b.toString('base64')};
// regions as run-length pairs (id, length) of 16-bit values
const rle=reg=>{const out=[];let i=0;while(i<reg.length){let j=i;while(j<reg.length&&reg[j]===reg[i]&&j-i<65535)j++;out.push(reg[i],j-i);i=j}
  return Buffer.from(Uint16Array.from(out).buffer).toString('base64')};

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const out={};
  for(const m of MAPS){const g=generate(m);console.log('map',m.id,JSON.stringify(g.stats));
    if(g.stats.wrong)throw new Error('solver disagrees with mask on map '+m.id);
    out[m.id]={W:m.W,H:m.H,mask:b64(g.mask),clue:b64(g.has),given:b64(g.given),region:rle(g.region)}}
  const file=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','puzzles.js');
  fs.writeFileSync(file,'// generated by tools/gen-puzzles.mjs — do not edit by hand\nwindow.PROVERB_PUZZLES='+JSON.stringify(out)+';\n');
  console.log('wrote',file,fs.statSync(file).size,'bytes');
}
