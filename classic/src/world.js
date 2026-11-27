// ===== extra content: NPC kits, plagues =====
Object.assign(SP,{
 witch:{n:'Reed witch',g:'@',c:'#b58ae6',hp:18,a:3,s:100,f:'free',t:'person talks opendoor trader caster sage',kit:{spells:['sleep','charm','firebolt','heal']},xp:12},
 battlemage:{n:'Horde war-mage',g:'@',c:'#ff8fb0',hp:22,a:4,s:100,f:'horde',t:'person talks opendoor horde caster',kit:{spells:['firebolt','shock','frost','brainwash']},xp:18},
 necro:{n:'Sand necromancer',g:'@',c:'#a7e0b0',hp:20,a:3,s:95,f:'undead',t:'person talks opendoor caster',kit:{spells:['raise','fear','sleep']},xp:18},
 assassin:{n:'Horde assassin',g:'@',c:'#8a8f9c',hp:18,a:7,s:125,f:'horde',t:'person talks opendoor stalker brave',kit:{stealth:1,bombs:{smokebomb:1}},xp:18},
 sapper:{n:'Horde sapper',g:'@',c:'#d68a3c',hp:18,a:4,s:100,f:'horde',t:'person talks opendoor horde',kit:{bombs:{firebomb:2,powder:1}},xp:12},
 musketeer:{n:'Militia musketeer',g:'@',c:'#a9c6e8',hp:16,a:3,ar:1,s:100,f:'free',t:'person talks opendoor brave',kit:{gun:'musket',ammo:8},xp:6},
 pickpocket:{n:'Cutpurse',g:'@',c:'#b7a68d',hp:12,a:3,s:120,f:'bandit',t:'person talks opendoor thief coward greedy',kit:{stealth:1},xp:5},
 zombie:{n:'Grey walker',g:'Z',c:'#88a07a',hp:16,a:4,s:80,f:'plague',t:'undead mindless zombiebite coldslow swarm2',loot:{bone:1},xp:3},
});
Object.values(SP).forEach(s=>{if(!s.tags){s.tags={};s.t.split(' ').forEach(x=>s.tags[x]=1);s.ar=s.ar||0;s.loot=s.loot||{}}});
FAC.plague={n:'Grey Walkers',enemy:['free','bandit','hunter','nomad','horde','goblin','troll','undead']};
['free','bandit','hunter','nomad','horde','goblin','troll','undead'].forEach(f=>FAC[f].enemy.push('plague'));
Object.assign(ITEMS,{
 madcap:{n:'Madcap mushroom',k:'herb',g:'"',c:'#e05a5a',v:12,stack:1},madvial:{n:'Vial of red mania',k:'med',g:'!',c:'#e05a5a',spike:'mania',v:30,stack:1},bile:{n:'Vial of grey bile',k:'med',g:'!',c:'#88a07a',spike:'zombie',v:30,stack:1},
 scroll:{n:'Scroll',k:'scroll',g:'?',c:'#dcd0a0',v:30},forged:{n:'Forged item',k:'wpn',g:'/',c:'#cde'},
});
RECIPES.push({out:'madvial',q:1,need:{madcap:2,flask:1},g:'Alchemy'},{out:'tonic',q:2,need:{bloodmoss:2,sunleaf:1,dust:1},g:'Alchemy'});
Object.assign(DISEASE,{zombie:{n:'The Grey Walk',d:'Black veins climb your arm. Without a cleansing tonic, you will die and rise.',lethal:1,dur:360},mania:{n:'Red Mania',d:'The world looks like an insult. Intelligence falls; you sometimes lash out.',int:-3,str:2,lash:1,dur:200}});

// ===== RNG / helpers =====
let G=null,L=null;
function R(){let s=G.rs=(G.rs+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));const pick=a=>a[Math.floor(R()*a.length)];const chance=p=>R()<p;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const dist=(a,b,c,d)=>Math.max(Math.abs(a-c),Math.abs(b-d));
const inb=(lv,x,y)=>x>=0&&y>=0&&x<lv.w&&y<lv.h;const IX=(x,y)=>y*L.w+x;
const tget=(x,y,lv=L)=>inb(lv,x,y)?lv.t[y*lv.w+x]:TID.sea;const tdef=(x,y,lv=L)=>td(tget(x,y,lv));const tset=(x,y,k,lv=L)=>{if(inb(lv,x,y))lv.t[y*lv.w+x]=TID[k]};
function newLevel(id,w,h,fill,dark){return{id,w,h,t:new Array(w*h).fill(TID[fill]),seen:new Array(w*h).fill(0),fire:{},gas:{},items:{},crops:{},stores:{},frozen:{},links:{},cr:[],dark:!!dark,r:null}}
function hashn(x,y,s){let h=Math.imul(x*374761393+y*668265263+s*982451653,1274126177);h=(h^h>>>13)*1274126177;return((h^h>>>16)>>>0)/4294967296}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),f=x-xi,g=y-yi,u=f*f*(3-2*f),v=g*g*(3-2*g);const a=hashn(xi,yi,s),b=hashn(xi+1,yi,s),c=hashn(xi,yi+1,s),d=hashn(xi+1,yi+1,s);return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v}
function fbm(x,y,s){return vnoise(x,y,s)*.55+vnoise(x*2.1,y*2.1,s+7)*.3+vnoise(x*4.3,y*4.3,s+13)*.15}
function addItem(lv,x,y,it){const k=y*lv.w+x;(lv.items[k]=lv.items[k]||[]).push(it)}
function mk(k,q){return{k,q:q||1}}
function spawn(s,x,y,props,lv){lv=lv||L;const d=SP[s];const c=Object.assign({id:++G.cid,s,x,y,hp:d.hp,mh:d.hp,en:ri(0,99),fac:d.f,hunger:ri(5,35),home:{x,y},alert:0,face:ri(0,3),inv:[]},props||{});
 if(d.kit){const K=d.kit;if(K.gun){c.gun=K.gun;c.ammo=K.ammo}if(K.spells){c.spells=K.spells.slice();c.mp=20}if(K.stealth)c.hidden=1;if(K.bombs)Object.entries(K.bombs).forEach(([k,q])=>c.inv.push(mk(k,q)))}
 if(s==='guard'&&chance(.45)){c.gun='musket';c.ammo=ri(3,7)} if(s==='villager'&&chance(.12)){c.gun='pistol';c.ammo=ri(1,4)} if(s==='farmer'&&chance(.15)){c.gun='musket';c.ammo=ri(1,3)}
 if(s==='nomad'&&chance(.5)){c.gun='musket';c.ammo=ri(3,6)} if(s==='bandit'&&chance(.3)){c.gun='pistol';c.ammo=ri(2,5)} if(s==='bandit'&&chance(.25))c.inv.push(mk('firebomb',1)); if(s==='horde'&&chance(.25))c.inv.push(mk('firebomb',1));
 if(s==='hunter'){c.bow=1} if(s==='healer'||s==='shaman'){c.spells=['heal'];c.mp=15} if(SP[s].tags.person&&chance(.2))c.inv.push(mk('salve',1));
 if(SP[s].tags.person)c.coins=ri(1,14)+(SP[s].tags.greedy?ri(5,30):0);
 lv.cr.push(c);return c}
function rect(lv,x0,y0,w,h,wall,floor){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const e=x===x0||y===y0||x===x0+w-1||y===y0+h-1;tset(x,y,e?wall:floor,lv)}}
function clear(lv,cx,cy,r,k){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(inb(lv,x,y)&&x>0&&y>0&&x<lv.w-1&&y<lv.h-1&&(x-cx)**2+(y-cy)**2<=r*r+1)tset(x,y,k,lv)}
function findSpot(lv,fx,fy,reg){let bx=lv.w*fx|0,by=lv.h*fy|0;for(let rad=0;rad<lv.w;rad++){for(let i=0;i<40;i++){const a=i/40*6.283,x=Math.round(bx+Math.cos(a)*rad),y=Math.round(by+Math.sin(a)*rad);if(x>7&&y>7&&x<lv.w-8&&y<lv.h-8&&lv.r[y*lv.w+x]===reg)return{x,y}}}return{x:clamp(bx,8,lv.w-9),y:clamp(by,8,lv.h-9)}}
function carve(lv,a,b){// Dijkstra-lite for roads
 const N=lv.w*lv.h,cost=new Float32Array(N).fill(1e9),prev=new Int32Array(N).fill(-1),s=a.y*lv.w+a.x,g=b.y*lv.w+b.x;cost[s]=0;const open=[s];let guard=0;
 const c=i=>{const k=TN[lv.t[i]];const d=TDEF[k];if(k==='sea')return 90;if(d.wall||d.gate||k==='statue'||k==='altar'||d.store||k==='well'||k==='forge'||k==='spellforge')return 500;if(k==='rock'||k==='cavewall')return 12;if(d.water)return 8;if(k==='road'||k==='bridge')return .4;return d.p?1.2:3};
 while(open.length&&guard++<40000){let bi=0;for(let j=1;j<open.length;j++)if(cost[open[j]]<cost[open[bi]])bi=j;const u=open.splice(bi,1)[0];if(u===g)break;const ux=u%lv.w,uy=u/lv.w|0;for(let d=0;d<4;d++){const nx=ux+DIRS[d][0],ny=uy+DIRS[d][1];if(!inb(lv,nx,ny))continue;const v=ny*lv.w+nx,nc=cost[u]+c(v);if(nc<cost[v]){cost[v]=nc;prev[v]=u;if(!open.includes(v))open.push(v)}}}
 let u=g;while(u!==-1&&u!==s){const k=TN[lv.t[u]];const D=TDEF[k];if(D.water||k==='sea')lv.t[u]=TID.bridge;else if(!(D.door||D.link||k==='road'||k==='bridge'||D.indoor||k==='gate'||k==='gateopen'))lv.t[u]=TID.road;u=prev[u]}}
function house(lv,x,y,w,h,opts){opts=opts||{};rect(lv,x,y,w,h,opts.wall||'woodwall',opts.floor||'woodfloor');tset(x+(w>>1),y+h-1,opts.door||'door',lv);return{door:{x:x+(w>>1),y:y+h},cx:x+(w>>1),cy:y+(h>>1)}}
function store(lv,x,y,items,kind){tset(x,y,kind||'chest',lv);lv.stores[y*lv.w+x]=items}

function genWorld(N){const lv=newLevel('world',N,N,'sea');L=lv;const s=G.seed%99991,sc=N/96;lv.r=new Array(N*N).fill(RS);
 const cs=[[.5,.62,RG,1.12],[.82,.6,RJ,1],[.18,.6,RD,1],[.5,.16,RM,1.05]];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fx=x/N,fy=y/N,dx=fx-.5,dy=fy-.5,d=Math.sqrt(dx*dx+dy*dy);const e=fbm(x/(14*sc),y/(14*sc),s);if(d>.40+(e-.5)*.34)continue;
  const wx=fx+(fbm(x/(9*sc),y/(9*sc),s+21)-.5)*.2,wy=fy+(fbm(x/(9*sc),y/(9*sc),s+29)-.5)*.2;let b=0,bd=9;cs.forEach(c=>{const q=Math.hypot(wx-c[0],wy-c[1])/c[3];if(q<bd){bd=q;b=c[2]}});lv.r[y*N+x]=b;
  const m=fbm(x/(6*sc),y/(6*sc),s+40),q=hashn(x,y,s+3);let k='grass';
  if(b===RG){k=m>.63?(q<.8?'tree':'grass'):m>.56&&q<.3?'tall':q<.012?'bush':q<.025?'flowers':q<.03?'tree':q<.034?'herb':'grass';if(fbm(x/(4*sc),y/(4*sc),s+51)>.74)k='rock'}
  else if(b===RJ){k=m>.46?(q<.62?'palm':q<.85?'vines':'grass'):q<.25?'vines':q<.42?'palm':q<.46?'herb':'grass';const bg=fbm(x/(5*sc),y/(5*sc),s+61);if(bg>.7)k=q<.15?'palm':'bog';if(bg<.25&&q<.25)k='tar';if(q>.994)k='hive';if(k==='grass'&&q<.48&&q>.46)k='bush'}
  else if(b===RD){k=q<.018?'cactus':'sand';if(fbm(x/(4*sc),y/(4*sc),s+71)>.74)k='rock'}
  else{const rk=fbm(x/(5*sc),y/(5*sc),s+81);k=rk>.56?'rock':m>.62&&q<.6?'pine':q<.015?'herb':'scree'}
  lv.t[y*N+x]=TID[k]}
 // rivers
 for(let i=0;i<(N>60?4:2);i++){let x=N*(.3+.4*(i/3))|0,y=N*.26|0;let a=hashn(i,3,s)*6.28;const tgt=[[.1,.95],[.9,.95],[.5,1],[.25,1]][i];for(let st=0;st<N*2;st++){const k=y*N+x;if(!inb(lv,x,y)||TN[lv.t[k]]==='sea')break;lv.t[k]=TID.deep;DIRS.slice(0,4).forEach(([dx,dy])=>{const u=y+dy,v=x+dx;if(inb(lv,v,u)&&TN[lv.t[u*N+v]]!=='deep'&&TN[lv.t[u*N+v]]!=='sea'&&hashn(v,u,s+9)<.55)lv.t[u*N+v]=TID.shallow});a+=(hashn(st,i,s+5)-.5)*1.4;const gx=tgt[0]*N-x,gy=tgt[1]*N-y,ga=Math.atan2(gy,gx);x+=Math.round(Math.cos((a+ga*3)/4));y+=Math.round(Math.sin((a+ga*3)/4))||(st%2?1:0)}}
 G.sites=[];const site=(name,x,y,r,fac,extra)=>{const o=Object.assign({name,x,y,r,fac,known:0},extra||{});G.sites.push(o);return o};
 const dbl=(x,y,w,h,opts)=>house(lv,x,y,w,h,opts);
 // starting village
 const vnames=['Ashford','Wrenhollow','Marrowbrook','Tamsin\'s Rest','Oakhearth','Low Fennel'];const vn=vnames[ri(0,5)];let vn2=vnames[ri(0,5)];if(vn2===vn)vn2='Harrowgate';
 const mkVillage=(c,name,cap)=>{const R0=Math.min(9,cap?9:7);clear(lv,c.x,c.y,R0,'grass');tset(c.x,c.y,'well',lv);const homes=[];const offs=[[-7,-6],[1,-7],[-8,1],[3,1],[-2,4]];offs.forEach((o,i)=>{const h=dbl(c.x+o[0],c.y+o[1],5,4);homes.push(h);tset(h.cx-1,h.cy,'bed',lv);if(i%2===0)store(lv,h.cx+1,h.cy,[mk(pick(['wheat','bread','cooked','wood','flask','torch','pelt']),ri(1,3))])});
  const S=site(name,c.x,c.y,9,'free',{village:1});
  homes.forEach((h,i)=>{spawn(i===0?'elder':(i===1?'merchant':(i===2?'smith':(i===3?'healer':'villager'))),h.cx,h.cy,{homeb:{x:h.cx,y:h.cy},job:'town',site:name});spawn(i%2?'farmer':'villager',h.door.x,h.door.y,{homeb:{x:h.cx,y:h.cy},job:'farm',site:name})});
  tset(homes[2].cx+1,homes[2].cy,'forge',lv);
  for(let i=0;i<(cap?3:2);i++)spawn(i===0?'musketeer':'guard',c.x+ri(-3,3),c.y+ri(-1,2),{job:'patrol',site:name});
  for(let y=c.y+8;y<c.y+11;y++)for(let x=c.x-5;x<=c.x+5;x++){if(inb(lv,x,y)&&td(lv.t[y*N+x]).p&&!td(lv.t[y*N+x]).water){lv.t[y*N+x]=TID.soil;if(hashn(x,y,s)<.7)lv.crops[y*N+x]={c:pick(['wheat','turnip']),a:ri(10,40),o:0}}}
  return{c,homes}};
 const a=findSpot(lv,.5,.62,RG),b=findSpot(lv,.38+.24*(s%2),.8,RG);
 mkVillage(a,vn,1);mkVillage(b,vn2,0);
 // bandit fort
 const f=findSpot(lv,.32,.42,RG);clear(lv,f.x,f.y,8,'grass');rect(lv,f.x-6,f.y-5,13,11,'stonewall','stonefloor');tset(f.x,f.y+5,'door',lv);const inner=dbl(f.x-3,f.y-4,7,4,{wall:'woodwall'});tset(inner.cx,inner.cy,'bed',lv);tset(f.x+4,f.y+3,'barrel',lv);tset(f.x-5,f.y+4,'barrel',lv);store(lv,f.x-4,f.y+1,[mk('shot',8),mk('cooked',2),mk('rope',2)]);
 spawn('rusk',inner.cx,inner.cy-1,{job:'post',inv:[mk('piece_grass')],coins:40,site:'Fort Hollow',named:1});for(let i=0;i<5;i++)spawn(i===0?'pickpocket':'bandit',f.x+ri(-4,4),f.y+ri(1,3),{job:'patrol',site:'Fort Hollow'});site('Fort Hollow',f.x,f.y,6,'bandit',{quest:'grass'});
 // jungle
 const hc=findSpot(lv,.72,.5,RJ);clear(lv,hc.x,hc.y,6,'grass');tset(hc.x,hc.y,'campfire',lv);[[-4,-4],[1,-4],[-5,1]].forEach(o=>dbl(hc.x+o[0],hc.y+o[1],4,3));spawn('shaman',hc.x+2,hc.y+1,{job:'post',site:'Hunter camp'});for(let i=0;i<4;i++)spawn('hunter',hc.x+ri(-3,3),hc.y+ri(0,3),{job:'patrol',site:'Hunter camp'});site('Hunter camp',hc.x,hc.y,6,'hunter');
 const tp=findSpot(lv,.86,.68,RJ);clear(lv,tp.x,tp.y,8,'vines');rect(lv,tp.x-6,tp.y-5,13,11,'stonewall','stonefloor');tset(tp.x,tp.y+5,'door',lv);tset(tp.x,tp.y-3,'altar',lv);addItem(lv,tp.x,tp.y-3,mk('piece_jungle'));for(let i=0;i<14;i++){const ax=tp.x+ri(-5,5),ay=tp.y+ri(-4,4);if(TN[tget(ax,ay,lv)]==='stonefloor'&&!(ax===tp.x))tset(ax,ay,'web',lv)}spawn('ixa',tp.x,tp.y-2,{job:'post',named:1});for(let i=0;i<3;i++)spawn('spider',tp.x+ri(-4,4),tp.y+ri(0,3),{job:'guardpost'});site('Overgrown Temple',tp.x,tp.y,6,'spider',{quest:'jungle'});
 // desert
 const nc=findSpot(lv,.24,.5,RD);clear(lv,nc.x,nc.y,6,'sand');clear(lv,nc.x,nc.y,2,'oasis');[[-5,-4],[3,-4],[-5,3],[4,3]].forEach(o=>tset(nc.x+o[0],nc.y+o[1],'tent',lv));spawn('nelder',nc.x+3,nc.y+1,{job:'post',site:'Nomad camp'});for(let i=0;i<4;i++)spawn('nomad',nc.x+ri(-4,4),nc.y+ri(3,4),{job:'patrol',site:'Nomad camp'});spawn('camel',nc.x-3,nc.y+3);site('Nomad camp',nc.x,nc.y,6,'nomad');
 for(let i=0;i<4;i++){const o=findSpot(lv,.08+hashn(i,1,s)*.3,.42+hashn(i,2,s)*.4,RD);clear(lv,o.x,o.y,2,'oasis');clear(lv,o.x,o.y,0,'oasis');for(let j=0;j<3;j++)tset(o.x+ri(-3,3),o.y+ri(-3,3),'palm',lv)}
 const tb=findSpot(lv,.13,.7,RD);clear(lv,tb.x,tb.y,3,'sand');tset(tb.x-2,tb.y-1,'statue',lv);tset(tb.x+2,tb.y-1,'statue',lv);tset(tb.x,tb.y,'down',lv);lv.links[tb.y*N+tb.x]={to:'tomb',x:0,y:0};site('Tomb of Sephet',tb.x,tb.y,3,'undead',{quest:'desert'});
 const nr=findSpot(lv,.28,.8,RD);clear(lv,nr.x,nr.y,3,'sand');rect(lv,nr.x-3,nr.y-2,7,5,'stonewall','stonefloor');tset(nr.x,nr.y+2,'door',lv);spawn('necro',nr.x,nr.y,{job:'post',inv:[mk('dust',2),mk('scroll')]});lv.cr[lv.cr.length-1].inv[1].sp='raise';for(let i=0;i<2;i++)spawn('skeleton',nr.x+ri(-1,1),nr.y+1);site('Sunken chapel',nr.x,nr.y,3,'undead');
 // witch and hermit
 const wh=findSpot(lv,.66,.42,RG);clear(lv,wh.x,wh.y,4,'grass');const wt=dbl(wh.x-2,wh.y-2,5,4);tset(wt.cx+1,wt.cy,'spellforge',lv);spawn('witch',wt.cx-1,wt.cy,{job:'post',site:"Witch's hut"});site("Witch's hut",wh.x,wh.y,3,'free');
 const hm=findSpot(lv,.42,.32,RG);clear(lv,hm.x,hm.y,3,'grass');const ht=dbl(hm.x-2,hm.y-1,5,3);spawn('hermit',ht.cx,ht.cy,{job:'post',named:1,site:"Hermit's shack"});site("Hermit's shack",hm.x,hm.y,3,'free');
 // mountain
 const c1=findSpot(lv,.4,.3,RM),c2=findSpot(lv,.62,.26,RM);const hcamp=(c,name,gr)=>{clear(lv,c.x,c.y,5,'scree');tset(c.x,c.y,'campfire',lv);tset(c.x-3,c.y-2,'barrel',lv);if(gr){tset(c.x+3,c.y-2,'granary',lv);lv.stores[(c.y-2)*N+c.x+3]=[mk('cooked',4),mk('wheat',6)]}for(let i=0;i<3;i++)spawn('horde',c.x+ri(-3,3),c.y+ri(-3,3),{job:'patrol',site:name});spawn(gr?'captain':'sapper',c.x+1,c.y+1,{job:'post',site:name});spawn('hound',c.x-1,c.y+2,{job:'patrol',site:name});if(gr)spawn('hshaman',c.x-2,c.y+1,{job:'post',site:name});site(name,c.x,c.y,5,'horde',{camp:1})};hcamp(c1,'Bone Camp',1);hcamp(c2,'Ice Camp',0);
 const kp=findSpot(lv,.5,.12,RM);const K={x:clamp(kp.x,10,N-11),y:clamp(kp.y,8,N-9)};clear(lv,K.x,K.y,10,'scree');rect(lv,K.x-8,K.y-6,17,13,'stonewall','stonefloor');tset(K.x,K.y+6,'gate',lv);tset(K.x+8,K.y-3,'grate',lv);tset(K.x,K.y-3,'throne',lv);[[-5,-4],[5,-4],[-5,2],[5,2]].forEach(o=>tset(K.x+o[0],K.y+o[1],'statue',lv));store(lv,K.x+6,K.y-5,[mk('diary'),mk('steel',2),mk('dust',3)]);tset(K.x-6,K.y+4,'barrel',lv);tset(K.x+6,K.y+4,'barrel',lv);
 const king=spawn('vorgath',K.x,K.y-3,{job:'post',named:1,aegis:1,site:'The King\'s Keep'});G.kingId=king.id;for(let i=0;i<4;i++)spawn('horde',K.x+ri(-5,5),K.y+ri(-1,4),{job:'patrol',site:"The King's Keep"});spawn('captain',K.x-1,K.y+7,{job:'gate',inv:[mk('key_gate')],site:"The King's Keep"});spawn('horde',K.x+1,K.y+7,{job:'gate',site:"The King's Keep"});spawn('battlemage',K.x+2,K.y-2,{job:'post',site:"The King's Keep"});site("The King's Keep",K.x,K.y,8,'horde',{quest:'king'});
 // troll bridge on the road to the keep
 const tbx=findSpot(lv,.5,.24,RM);clear(lv,tbx.x,tbx.y,2,'scree');spawn('troll',tbx.x,tbx.y,{job:'gate',named:1,site:'Troll Pass'});site('Troll Pass',tbx.x,tbx.y,2,'troll');
 // caves
 G.caves=0;for(let i=0;i<(N>60?9:5);i++){const reg=[RG,RJ,RD,RM][i%4];const p=findSpot(lv,.15+hashn(i,5,s)*.7,.15+hashn(i,6,s)*.7,reg);tset(p.x,p.y,'down',lv);DIRS.forEach(([dx,dy])=>{if(!td(tget(p.x+dx,p.y+dy,lv)).p)tset(p.x+dx,p.y+dy,TN[lv.t[p.y*N+p.x]]==='down'?'scree':'scree',lv)});tset(p.x,p.y,'down',lv);lv.links[p.y*N+p.x]={to:'cave'+i,x:0,y:0,reg};G.caves++;site('Cave '+(i+1),p.x,p.y,1,'beast',{cave:1})}
 // roads guarantee everything is reachable
 const door=(c,dy)=>({x:c.x,y:c.y+dy});carve(lv,a,b);carve(lv,a,door(f,6));carve(lv,a,door(hc,0));carve(lv,hc,door(tp,6));carve(lv,a,door(nc,4));carve(lv,nc,door(tb,1));carve(lv,nc,door(nr,3));carve(lv,a,door(wh,2));carve(lv,a,door(hm,2));carve(lv,a,door(c1,0));carve(lv,c1,door(c2,0));carve(lv,c1,tbx);carve(lv,c1,door(K,7));carve(lv,c2,door(K,7));
 G.sites.filter(q=>q.cave).forEach(q=>carve(lv,a,{x:q.x,y:q.y}));
 // doors of village homes get roads too (simple connect)
 tset(a.x,a.y,'well',lv);tset(b.x,b.y,'well',lv);
 G.start=null;for(let r=1;r<8&&!G.start;r++)for(let dy=-r;dy<=r&&!G.start;dy++)for(let dx=-r;dx<=r;dx++){const sx=a.x+dx,sy=a.y+dy,d=td(lv.t[sy*N+sx]);if(d.p&&!d.indoor&&!d.door&&!lv.cr.some(c=>c.x===sx&&c.y===sy)){G.start={x:sx,y:sy};break}}if(!G.start)G.start={x:a.x+1,y:a.y};
 // wildlife
 const table={[RG]:[['rabbit',5],['deer',4],['wolf',2],['boar',2],['rat',1],['crow',2],['bear',1],['goblin',.5],['pickpocket',.5]],[RJ]:[['jaguar',2],['snake',3],['spider',2],['monkey',4],['mosquito',3],['flytrap',3],['boar',1],['hunter',.5]],[RD]:[['scorpion',3],['camel',2],['vulture',2],['worm',.6],['lizard',3],['skeleton',1],['goblin',.3]],[RM]:[['goat',4],['bear',1],['horde',1.2],['hound',1],['wolf',2],['sapper',.3]]};G.table=table;
 const count=Math.round(N*N/36);for(let i=0;i<count;i++){const x=ri(1,N-2),y=ri(1,N-2),r=lv.r[y*N+x];if(r===RS||!td(lv.t[y*N+x]).p||td(lv.t[y*N+x]).water||td(lv.t[y*N+x]).indoor)continue;if(Math.hypot(x-a.x,y-a.y)<14)continue;const sp=wpick(table[r]);if(sp==='wolf'){for(let j=0;j<ri(2,4);j++)spawn('wolf',clamp(x+ri(-1,1),1,N-2),clamp(y+ri(-1,1),1,N-2),{},lv)}else spawn(sp,x,y,{},lv)}
 lv.cr=lv.cr.filter(c=>td(lv.t[c.y*N+c.x]).p||td(lv.t[c.y*N+c.x]).door||TN[lv.t[c.y*N+c.x]]==='well');
 for(let i=0;i<N;i++){const x=ri(1,N-2),y=ri(1,N-2);if(TN[lv.t[y*N+x]]==='grass'&&lv.r[y*N+x]===RG&&chance(.2))addItem(lv,x,y,mk('stone',ri(1,2)))}
 // herbs are placed through forage; barrels near start none
 // hint items near start
 addItem(lv,G.start.x,G.start.y,mk('torch',2));
 // an old hive near a village tree for early discovery
 const ho=findSpot(lv,.5,.5,RG);if(TN[lv.t[ho.y*N+ho.x]]==='tree')tset(ho.x,ho.y,'hive',lv);
 return lv}
function wpick(t){let s=0;t.forEach(e=>s+=e[1]);let q=R()*s;for(const e of t){q-=e[1];if(q<=0)return e[0]}return t[0][0]}

function genTomb(){const w=34,h=26;const lv=newLevel('tomb',w,h,'stonewall',1);const rooms=[];for(let i=0;i<12;i++){const rw=ri(4,8),rh=ri(3,6),x=ri(1,w-rw-2),y=ri(1,h-rh-2);if(rooms.some(r=>x<r.x+r.w+1&&x+rw+1>r.x&&y<r.y+r.h+1&&y+rh+1>r.y))continue;rooms.push({x,y,w:rw,h:rh});for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)tset(xx,yy,'stonefloor',lv)}
 for(let i=1;i<rooms.length;i++){const p=rooms[i-1],q=rooms[i];let cx=p.x+(p.w>>1),cy=p.y+(p.h>>1),tx=q.x+(q.w>>1),ty=q.y+(q.h>>1);while(cx!==tx){tset(cx,cy,'stonefloor',lv);cx+=Math.sign(tx-cx)}while(cy!==ty){tset(cx,cy,'stonefloor',lv);cy+=Math.sign(ty-cy)}}
 const st=rooms[0],en=rooms[rooms.length-1];const sx=st.x+1,sy=st.y+1;tset(sx,sy,'up',lv);lv.exitAt={x:sx,y:sy};const ax=en.x+(en.w>>1),ay=en.y+(en.h>>1);tset(ax,ay,'altar',lv);addItem(lv,ax,ay,mk('piece_desert'));spawn('sephet',ax,ay-1>=en.y?ay-1:ay+1,{job:'post',named:1},lv);if(en.w>4)store(lv,en.x,en.y,[mk('locket'),mk('dust',2),mk('ring',2)],'sarc');
 rooms.slice(1,-1).forEach((r,i)=>{const n=ri(1,2);for(let j=0;j<n;j++)spawn(i%2?'thirsty':'skeleton',r.x+ri(0,r.w-1),r.y+ri(0,r.h-1),{job:'guardpost',sleep:chance(.4)?999:0},lv);if(chance(.5))store(lv,r.x+r.w-1,r.y,[mk(pick(['dust','ring','bone','salve','manapot']),ri(1,2))],'sarc')});
 const c=rooms[(rooms.length/2)|0];lv.cr.push(Object.assign(spawn('necro',c.x+1,c.y+1,{job:'post'},lv),{}));lv.cr.pop();return lv}
function genCave(id,link){const w=38,h=30;const lv=newLevel(id,w,h,'cavewall',1);const sd=hashn(parseInt(id.slice(4))||0,9,G.seed%99991);let g=[];for(let i=0;i<w*h;i++)g[i]=R()<.44?1:0;for(let it=0;it<4;it++){const n=g.slice();for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)c+=g[(y+dy)*w+x+dx];n[y*w+x]=c>=5?1:0}g=n}
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(!g[y*w+x])tset(x,y,'cavefloor',lv);
 // connect with central cross
 for(let x=2;x<w-2;x++)tset(x,h>>1,'cavefloor',lv);for(let y=2;y<h-2;y++)tset(w>>1,y,'cavefloor',lv);
 const fl=[];for(let i=0;i<w*h;i++)if(lv.t[i]===TID.cavefloor)fl.push(i);const P=()=>{const i=pick(fl);return{x:i%w,y:i/w|0}};
 tset(2,h>>1,'up',lv);lv.exitAt={x:2,y:h>>1};
 for(let i=0;i<10;i++){const a=ri(2,w-3),b=ri(2,h-3);if(lv.t[b*w+a]===TID.cavewall)tset(a,b,chance(.12)?'star':'ore',lv)}
 for(let i=0;i<20;i++){const a=ri(1,w-2),b=ri(1,h-2);if(lv.t[b*w+a]===TID.cavewall&&(lv.t[b*w+a-1]===TID.cavefloor||lv.t[b*w+a+1]===TID.cavefloor))tset(a,b,chance(.1)?'star':'ore',lv)}
 for(let i=0;i<6;i++){const p=P();tset(p.x,p.y,'mushrooms',lv)}
 for(let i=0;i<3;i++){const p=P();if(chance(.5))lv.gas[p.y*w+p.x]={k:'methane',a:8}}
 const pop=[['bat',4],['slime',2],['crawler',3],['rat',3],['bear',1],['goblin',.6],['spider',1]];const n=ri(7,11);for(let i=0;i<n;i++){const p=P();const s=wpick(pop);spawn(s,p.x,p.y,{job:s==='bear'?'den':undefined},lv)}
 store(lv,w-3,h>>1,[mk(pick(['dust','stariron','steel','ring']),ri(1,2)),mk('scroll'),mk(pick(['manapot','salve','tonic']),2)]);const sc=lv.stores[(h>>1)*w+w-3][1];sc.sp=pick(['shock','fear','blink','gust','charm','sleep']);tset(w-4,h>>1,'cavefloor',lv);
 if(id==='cave0'){const p=P();addItem(lv,p.x,p.y,mk('pick'))}
 return lv}
