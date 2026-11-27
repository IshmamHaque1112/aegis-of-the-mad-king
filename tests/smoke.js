// Browser fuzz test: plays thousands of random actions, walks every dialogue branch, and checks save/load.
// Usage: node tests/smoke.js seedA,seedB   (needs playwright)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join(' | ')));
await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(800);
const seeds=process.argv[2]?process.argv[2].split(','):['a1'];
for(const sd of seeds){
const r=await pg.evaluate(async(sd)=>{const out={dead:{},errs:[],talks:0,opts:0};const T0=performance.now();
 const cls=['barbarian','archer','mage','rogue','speaker','herbalist','sapper','mariner','knight'];
 newGame({cls:cls[sd.length%9],name:'Fz',seed:sd.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)%99999+1,opt:{conts:8}});applyBackground('sailor');
 const tryOpts=(sh,depth)=>{if(!sh||depth>3)return;const o=(sh.options||[]).filter(x=>!x.disabled&&!['Leave','Close'].includes(x.label));for(const x of o.slice(0,6)){out.opts++;if(/Attack|on fire|Kill|Steal|Pickpocket|Knock|Feed|Poison|Spike|Insult|Threaten|Rob/.test(x.label))continue;const before=G.log[G.log.length-1];let r;try{r=x.fn()}catch(e){out.errs.push('opt '+x.label+': '+e.message+' '+(e.stack||'').split('\n')[1]);continue}if(r===KEEP)continue;if(!r&&G.log[G.log.length-1]===before&&!UI.target){out.dead[(sh.title||'')+' > '+x.label]=1}
   if(r&&r.options)tryOpts(r,depth+1);if(r&&r.sheet)tryOpts(r.sheet,depth+1);if(G.over)return}};
 for(let i=0;i<1500&&!G.over;i++){const p=G.p;p.hp=p.mh;p.hunger=90;p.thirst=90;p.temp=0;try{const q=Math.random();
  if(q<.7){const d=DIRS[Math.floor(Math.random()*8)];const r=actMove(d[0],d[1]);if(r&&r.sheet)tryOpts(r.sheet,0);else if(r&&r.options)tryOpts(r,0)}
  else if(q<.85){const near=RT.act.filter(c=>dist(c.x,c.y,p.x,p.y)<=1);if(near.length){const c=near[0];const sh=actionSheetFor(c.x,c.y);out.talks++;tryOpts(sh,0)}else{const c=RT.act.find(c=>SP[c.s].tags.person&&dist(c.x,c.y,p.x,p.y)<12);if(c){const s=passableSpot(c.x,c.y,2);if(s&&!at(s.x,s.y)){p.x=s.x;p.y=s.y;computeFOV()}}}}
  else if(q<.9){tryOpts(actionSheetFor(p.x,p.y),1)}
  else if(q<.93){const s=G.sites[Math.floor(Math.random()*G.sites.length)];abstractAll();if(!L.world){L=G.levels.world;p.lv='world'}const sp=passableSpot(s.x,s.y,s.r+3);if(sp){p.x=sp.x;p.y=sp.y;p.aboard=null;p.mount=null;realizeTick(true);computeFOV()}}
  else actWait();
  if(i%50===0){refresh()}}catch(e){out.errs.push('loop '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join('|'))}}
 out.ms=Math.round(performance.now()-T0);out.turn=G.turn;out.over=G.over&&(G.over.kind+':'+G.over.by+' | '+G.log.slice(-6).map(m=>m.t).join(' / '));out.act=RT.act.length;out.bands=G.bands.length;out.events=G.events.length;let s;try{s=serial();deserial(s);out.save=s.length}catch(e){out.errs.push('save '+e.message)}return out},sd);
console.log(sd,JSON.stringify({ms:r.ms,turn:r.turn,over:r.over,act:r.act,bands:r.bands,ev:r.events,save:r.save,talks:r.talks,opts:r.opts}));console.log(' dead:',Object.keys(r.dead).slice(0,30).join(' || '));const ue=[...new Set(r.errs)];console.log(' errs',ue.length);ue.slice(0,15).forEach(e=>console.log('  ',e))}
console.log('page errs',errs.length);[...new Set(errs)].slice(0,10).forEach(e=>console.log(' ',e));await b.close()})();
