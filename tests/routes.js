// scripted route tests: every ending and nonviolent shard route
function fresh(c,s,sd){newGame({cls:c,size:s||96,seed:sd||123});return G}
const site=n=>G.sites.find(s=>s.name===n);function toNear(c){const dirs=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];for(const[d,e]of dirs){const x=c.x+d,y=c.y+e;if(tdef(x,y).p&&!at(x,y)){G.p.x=x;G.p.y=y;rebuild();computeFOV();return}}throw 'no adj'}
const findC=s=>G.levels.world.cr.find(c=>c.s===s);
const opt=(sh,txt)=>{const o=sh.options.find(x=>x.label.includes(txt));if(!o)throw 'no option '+txt+' in '+sh.options.map(x=>x.label).join('|');return o};
let res={};
// Rusk: buy
fresh('speaker');G.p.coins=100;let r=findC('rusk');toNear(r);opt(talkSheet(r),'Buy the shard').fn();res.ruskBuy=hasItem('piece_grass');
// Rusk: pickpocket until success
fresh('rogue');r=findC('rusk');toNear(r);r.sleep=50;let tries=0;while(!hasItem('piece_grass')&&tries++<30){G.p.hp=G.p.mh;r.sleep=50;r.alert=0;doPickpocket(r)}res.ruskSteal=hasItem('piece_grass');
// Rusk: winter food
fresh('speaker');G.turn=SEASON*3;seasonTick();giveItem(mk('cooked',8),true);r=findC('rusk');toNear(r);opt(talkSheet(r),'Feed his starving').fn();res.ruskFeed=hasItem('piece_grass');
// Ixa: meat then take
fresh('herbalist');giveItem(mk('rawmeat',4),true);r=findC('ixa');toNear(r);opt(talkSheet(r),'Offer the brood').fn();res.ixaFed=r.truce>G.turn&&!hostile(r,G.p);
const tp=site('Overgrown Temple');const k=tp.y*G.size+tp.x;
// Ixa: winter dormant
fresh('rogue');G.turn=SEASON*3;seasonTick();r=findC('ixa');rebuild();toNear(r);G.p.sneak=true;for(let i=0;i<3;i++)actWait();res.ixaWinterAsleep=r.sleep>0;const tp2=site('Overgrown Temple');pickupAll(tp2.x,tp2.y-3);res.ixaWinterTake=hasItem('piece_jungle');
// Sephet: water
fresh('mage');const tomb=site('Tomb of Sephet');G.p.x=tomb.x;G.p.y=tomb.y;rebuild();goLink(tomb.x,tomb.y);res.inTomb=L.id==='tomb';let sp=L.cr.find(c=>c.s==='sephet');toNear(sp);giveItem(mk('water',4),true);opt(talkSheet(sp),'Pour out').fn();for(let i=0;i<5;i++)actWait();res.sephetWater=G.flags.sephetDone===1&&!hostile(sp,G.p);const al=Object.keys(L.items).find(k=>L.items[k].some(i=>i.k==='piece_desert'));const ax=+al%L.w,ay=Math.floor(+al/L.w);G.p.x=ax;G.p.y=ay;rebuild();pickupAll(ax,ay);res.sephetTake=hasItem('piece_desert');goLink;
// Riddle
fresh('mage');G.p.x=tomb.x;G.p.y=tomb.y;const t2=site('Tomb of Sephet');G.p.x=t2.x;G.p.y=t2.y;rebuild();goLink(t2.x,t2.y);sp=L.cr.find(c=>c.s==='sephet');toNear(sp);const rd=opt(talkSheet(sp),'Answer her riddle').fn();const q=RIDDLES.find(x=>'"'+x.q+'"'===rd.text);rd.options[q.c].fn();res.riddle=G.flags.sephetDone===1;
// Sunder + endings
function kingSetup(c){fresh(c);giveItem(mk('piece_grass'),true);afterGain(mk('piece_grass'));giveItem(mk('piece_jungle'),true);giveItem(mk('piece_desert'),true);checkSunder();const king=G.levels.world.cr.find(x=>x.id===G.kingId);toNear(king);return king}
let K=kingSetup('speaker');res.hasSunder=hasItem('sunder');hurt(K,50,G.p,'blow');res.aegisBlocks=K.hp===K.mh;const sh=actionSheetFor(K.x,K.y);opt(sh,'Sunder').fn();res.sundered=K.aegis===0;
G.p.lore=['diary','hermit','shaman','nomad','locket'];G.p.hp=9999;let n=0;while(!G.over&&n++<30){G.p.hp=G.p.mh;opt(talkSheet(K),'Aldric').fn()}res.redemption=G.over&&G.over.kind;
K=kingSetup('rogue');opt(actionSheetFor(K.x,K.y),'Sunder').fn();G.moraleH=20;G.p.hp=G.p.mh;opt(talkSheet(K),'depose').fn();res.mutiny=G.over&&G.over.kind;
K=kingSetup('rogue');opt(actionSheetFor(K.x,K.y),'Sunder').fn();giveItem(mk('rope'),true);K.sleep=30;opt(actionSheetFor(K.x,K.y),'Bind').fn();res.captive=G.over&&G.over.kind;
K=kingSetup('barbarian');opt(actionSheetFor(K.x,K.y),'Sunder').fn();n=0;while(!G.over&&n++<80){G.p.hp=G.p.mh;K.hp=Math.min(K.hp,5);meleeHit(G.p,K)}res.conquest=G.over&&G.over.kind;
K=kingSetup('mage');opt(actionSheetFor(K.x,K.y),'Sunder').fn();n=0;while(!G.over&&n++<60){G.p.hp=G.p.mh;G.p.mp=30;castSpell('brainwash',G.p,K.x,K.y)}res.puppet=G.over&&G.over.kind;
// Gate lie, gate key, grate
fresh('speaker');const gk=G.levels.world.cr.find(c=>c.job==='gate'&&c.s==='captain');toNear(gk);n=0;const ks=site("The King's Keep");while(TN[tget(ks.x,ks.y+6)]!=='gateopen'&&n++<60){gk.annoy=0;delete gk.grudge;G.p.hp=G.p.mh;const o=talkSheet(gk).options.find(x=>x.label.includes('Courier'));if(o)o.fn()}res.gateLie=TN[tget(ks.x,ks.y+6)];
// seasons change AI
fresh('mage');const bear=spawn('bear',G.p.x+4,G.p.y,{});rebuild();G.turn=SEASON*3;seasonTick();RT.act=[bear];for(let i=0;i<4;i++)aiAct(bear);res.bearHibernates=bear.sleep>0;
const lv=G.levels.world;res.winterIce=lv.t.filter(x=>TN[x]==='thinice'||TN[x]==='ice').length>0;G.turn=SEASON*4;seasonTick();res.springFlood=lv.t.filter(x=>TN[x]==='flood').length>0;res.iceGone=lv.t.filter(x=>TN[x]==='thinice').length===0;G.turn=SEASON*5;seasonTick();res.oasisCrack=lv.t.filter(x=>TN[x]==='cracked').length>0;
// fire spreads; season scale
function fireTest(seT){fresh('mage',96,7);G.turn=seT*SEASON;G.lastSeason=-1;seasonTick();G.wx={k:'clear',t:999};const c=lv2=>{let bx=-1;return 0};L=G.levels.world;let tx,ty;for(let i=0;i<L.t.length;i++){if(TN[L.t[i]]==='tree'){tx=i%L.w;ty=i/L.w|0;break}}ignite(tx,ty,1);let burned=0;for(let i=0;i<60;i++){envTick();}const ash=L.t.filter(x=>TN[x]==='ash'||TN[x]==='stump').length;return ash}
res.fireSummer=fireTest(1);res.fireWinter=fireTest(3);
// npc powers: musket fires, witch casts, brainwash npc vs npc, assassin hidden
fresh('mage');G.p.x=G.p.x;let m=spawn('musketeer',G.p.x+3,G.p.y,{grudge:{p:1},alert:2});rebuild();computeFOV();let hp0=G.p.hp;let shots=m.ammo;for(let i=0;i<4;i++){aiAct(m)}res.npcGun=m.ammo<shots;
fresh('mage');let w=spawn('witch',G.p.x+3,G.p.y,{grudge:{p:1},alert:2});rebuild();computeFOV();let mp0=w.mp;for(let i=0;i<12;i++){G.p.hp=G.p.mh;aiAct(w)}res.npcCasts=w.mp<mp0;
fresh('mage');let bm=spawn('battlemage',G.p.x+3,G.p.y,{});let vic=spawn('villager',G.p.x+5,G.p.y,{});rebuild();computeFOV();for(let i=0;i<30&&!vic.mindfac;i++){bm.mp=20;G.p.hp=G.p.mh;castSpell('brainwash',bm,vic.x,vic.y)}res.npcBrainwash=vic.mindfac==='horde';
// plagues
fresh('mage',48,5);let hrs=G.levels.world.cr.filter(c=>SP[c.s].tags.person);G.flags.grey=1;startOutbreak('zombie');const before=G.levels.world.cr.filter(c=>c.s==='zombie').length;for(let i=0;i<500;i++){G.p.hp=G.p.mh;G.p.hunger=90;G.p.thirst=90;G.turn++;if(i%20===0){progressOutbreak(G.levels.world);swarmTick(G.levels.world)}}res.zombies=G.levels.world.cr.filter(c=>c.s==='zombie').length+G.swarms.reduce((a,s)=>a+s.n,0);res.overrun=G.sites.filter(s=>s.overrun).length;
fresh('mage',48,6);const pp=spawn('nomad',G.p.x+2,G.p.y,{dz:'mania',dzT:200,alert:0});const pp2=spawn('nomad',G.p.x+3,G.p.y,{});const pp3=spawn('hunter',G.p.x+2,G.p.y+1,{});rebuild();computeFOV();for(let i=0;i<20;i++){G.p.hp=G.p.mh;advance(100);G.p.hp=G.p.mh;if(!pp.hp)break}res.maniaHits=pp2.hp<pp2.mh||pp3.hp<pp3.mh||pp2.dz==='mania'||pp3.dz==='mania'||L.cr.indexOf(pp2)<0;
// crafting + forge + spellmaker
fresh('mage');G.p.x=G.p.x;[['iron',5],['steel',4],['stariron',4],['dust',30],['wood',6]].forEach(([k,q])=>giveItem(mk(k,q),true));const wt=site("Witch's hut");const lv3=G.levels.world;let fgp=null;for(let i=0;i<lv3.t.length;i++)if(TN[lv3.t[i]]==='forge'){fgp={x:i%lv3.w,y:i/lv3.w|0};break}toNear(fgp);const fit=doForge('greataxe','stariron','leech');res.forged=fit&&fit.x.n;let gs=null;for(let i=0;i<lv3.t.length;i++)if(TN[lv3.t[i]]==='spellforge'){gs={x:i%lv3.w,y:i/lv3.w|0};break}toNear(gs);G.p.lvl=6;const s1=makeSpell('Sky Hammer',[{e:'fire',mag:40,area:3,dur:0},{e:'quake',mag:30,area:2,dur:0}]);res.spellMade=s1&&s1.name;res.spellCost=s1&&customCost(s1);const zz=spawn('horde',G.p.x+3,G.p.y,{});rebuild();computeFOV();G.p.hp=G.p.mh=300;G.p.mp=G.p.mmp=300;castCustom(s1,zz.x,zz.y);res.spellHits=L.cr.indexOf(zz)<0||zz.hp<zz.mh;
// save / load
fresh('rogue',48,9);giveItem(mk('cooked'),true);const st=serial();loadFrom(st);res.saveRound=G.p.cls==='rogue'&&L===G.levels[G.p.lv]&&G.p.eq.w;
console.log(res);
