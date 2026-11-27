// ===== CORE STATE =====
Object.assign(ITEMS,{key_gate:{n:'Keep gate key',k:'tool',g:'-',c:'#fc6',v:0,noburn:1,key:1},coins:{n:'Coins',k:'coin',g:'$',c:'#ec5',v:1,stack:1}});
const RT={vis:new Set(),occ:new Map(),act:[],fxq:[],dirty:1};
function seasonIdx(){return Math.floor(G.turn/SEASON)%4}
function seasonName(){return SEASONS[seasonIdx()]}
function isNight(){const h=G.turn%DAY;return h>=70||h<8}
function dayNum(){return Math.floor(G.turn/DAY)%SEASON_DAYS+1}
function msg(t,c){G.log.push({t,c:c||'',n:G.turn});if(G.log.length>120)G.log.shift()}
function story(t,w){G.story.push({t,w:w||1,turn:G.turn,season:seasonName()})}
function regionAt(x,y){return L.r?L.r[IX(x,y)]:-1}
function outdoors(x,y){return !L.dark&&!tdef(x,y).indoor}
function visible(x,y){return RT.vis.has(IX(x,y))}
function newGame(o){const seed=o.seed||Math.floor(Math.random()*1e9);G={seed,rs:seed|0,cid:0,turn:o.startTurn||12,acc:0,levels:{},log:[],story:[],flags:{},rep:{free:12,bandit:-15,hunter:0,nomad:5,horde:-50,goblin:10,troll:0},wx:{k:'clear',t:40},wind:{dx:1,dy:0},moraleH:100,swarms:[],feuds:[],quests:[],crimes:[],stats:{fires:0,killsP:0,killsA:0,knockouts:0,talks:0,lies:0,thefts:0,brainwash:0,raised:0,crafted:0,spellsMade:0,cured:0,tiles:0},size:o.size||96,lastSeason:-1,over:null,dev:false};
 const lv=genWorld(G.size);G.levels.world=lv;L=lv;G.levels.tomb=genTomb();
 const C=CLASSES[o.cls];const p=G.p={id:'p',name:o.name||'Wanderer',cls:o.cls,x:G.start.x,y:G.start.y,lv:'world',st:Object.assign({},C.st),hp:0,mh:0,mp:0,mmp:0,hunger:88,thirst:88,temp:0,xp:0,lvl:1,pts:0,coins:C.coins||15,inv:[],eq:{w:null,a:null},fx:{},dz:[],sneak:false,spells:(C.spells||[]).slice(),custom:[],lore:[],loaded:true,torch:0,fac:'player',face:0,steps:0,dom:0,speak:C.speak||0,herb:C.herb||0,forge:C.forge||0,threat:C.threat||0};
 C.gear.forEach((k,i)=>{const it=mk(k);p.inv.push(it);const d=ITEMS[k];if(d.k==='wpn')p.eq.w=it;if(d.k==='arm')p.eq.a=it});
 Object.entries(C.items||{}).forEach(([k,q])=>giveItem(mk(k,q),true));
 recalc();p.hp=p.mh;p.mp=p.mmp;G.lastSeason=seasonIdx();applySeason(seasonIdx(),true);rebuild();computeFOV();
 msg(p.name+' sets out at the dawn of Spring. Vorgath waits in the northern mountains.','story');msg('Gather the three amulet shards. Long-press any tile to see what you can do.','hint');return G}
function recalc(){const p=G.p;p.mh=32+eff('str')*3+(p.lvl-1)*4;p.mmp=4+eff('int')*2+(p.lvl-1)*1+((p.eq.a&&idef(p.eq.a).manaP)||0)+((p.eq.w&&idef(p.eq.w).manaP)||0);p.hp=Math.min(p.hp,p.mh);p.mp=Math.min(p.mp,p.mmp)}
function idef(it){if(!it)return ITEMS.fists;const b=ITEMS[it.k]||{};return it.x?Object.assign({},b,it.x):b}
function iname(it){const d=idef(it);if(it.k==='corpse')return (SP[it.sp]?SP[it.sp].n:'Unknown')+' corpse';if(it.k==='scroll')return 'Scroll of '+((SPELLS[it.sp]||{}).n||'Lost Words');let s=d.n;if(it.q>1)s+=' x'+it.q;return s}
function eff(st){const p=G.p;let v=p.st[st]||0;p.dz.forEach(z=>{const d=DISEASE[z.k];if(d[st])v+=d[st]});const f=p.fx;if(f.boost&&f.boost.k===st)v+=f.boost.v;if(st==='str'&&f.might)v+=f.might.v;if(st==='spd'&&f.haste)v+=f.haste.v;if(p.eq.w&&idef(p.eq.w).ench==='haste'&&st==='spd')v+=2;if(p.eq.a&&idef(p.eq.a).ench==='haste'&&st==='spd')v+=2;return Math.max(1,v)}
function giveItem(it,quiet){const p=G.p;const d=idef(it);if(it.k==='coins'){p.coins+=it.q||1;if(!quiet)msg('You pocket '+(it.q||1)+' coins.','good');return true}
 if(d.stack){const e=p.inv.find(o=>o.k===it.k);if(e){e.q=(e.q||1)+(it.q||1);if(!quiet)msg('You take '+iname(it)+'.');afterGain(it);return true}}if(p.inv.length>=30){msg('Your pack is full.','warn');addItem(L,p.x,p.y,it);return false}p.inv.push(it);if(!quiet)msg('You take '+iname(it)+'.');afterGain(it);return true}
function afterGain(it){const d=idef(it);if(d.lore&&!G.p.lore.includes(d.lore))learnLore(d.lore);if(it.k&&it.k.startsWith('piece_')){gainXP(40);story('Recovered the '+d.n+'.',3);msg('A shard hums in your hand. '+G.p.inv.filter(i=>i.k.startsWith('piece_')).length+' of 3.','story');checkSunder()}}
function learnLore(k){if(G.p.lore.includes(k))return;G.p.lore.push(k);msg(LORE[k],'story');gainXP(15);story('Learned part of the king\'s true story.',1)}
function checkSunder(){const p=G.p;if(['piece_grass','piece_jungle','piece_desert'].every(k=>p.inv.some(i=>i.k===k))){p.inv=p.inv.filter(i=>!i.k.startsWith('piece_'));p.inv.push(mk('sunder'));msg('The three shards click together. You hold the Sundering Amulet. Find Vorgath.','story');story('Forged the Sundering Amulet.',4);gainXP(60)}}
function hasItem(k,q){const e=G.p.inv.find(i=>i.k===k);return e&&(e.q||1)>=(q||1)}
function count(k){const e=G.p.inv.find(i=>i.k===k);return e?(e.q||1):0}
function takeItem(k,q){q=q||1;const p=G.p,e=p.inv.find(i=>i.k===k);if(!e)return false;e.q=(e.q||1)-q;if(e.q<=0){if(p.eq.w===e)p.eq.w=null;if(p.eq.a===e)p.eq.a=null;p.inv.splice(p.inv.indexOf(e),1)}return true}
function gainXP(n){const p=G.p;p.xp+=n;while(p.xp>=xpNeed(p.lvl)){p.xp-=xpNeed(p.lvl);p.lvl++;p.pts+=1;recalc();p.hp=Math.min(p.mh,p.hp+8);msg('You feel stronger. Level '+p.lvl+'. Spend a stat point on your character page.','good')}}
function xpNeed(l){return Math.round(25*Math.pow(l,1.4))}
function rebuild(){RT.occ=new Map();L.cr.forEach(c=>{RT.occ.set(c.y*L.w+c.x,c)});RT.act=L.cr.filter(c=>dist(c.x,c.y,G.p.x,G.p.y)<=24)}
function at(x,y){if(G.p.x===x&&G.p.y===y)return G.p;return RT.occ.get(IX(x,y))}
function isP(e){return e===G.p}
function setLevel(id){G.p.lv=id;L=G.levels[id];rebuild()}
function ensureLevel(lk){if(lk.to==='tomb')return G.levels.tomb;if(!G.levels[lk.to]){const save=L;const lv=genCave(lk.to,lk);G.levels[lk.to]=lv;L=save}return G.levels[lk.to]}

// ===== hostility =====
function side(c){if(isP(c))return 'player';if(c.charm>0||c.ally)return 'player';return c.mindfac||c.fac}
function feudOn(a,b){return G.feuds.some(f=>f.u>G.turn&&((f.a===a&&f.b===b)||(f.a===b&&f.b===a)))}
function disguised(c){const p=G.p;const a=p.eq.a&&idef(p.eq.a);return a&&a.disg===c.fac}
function hostilePlayer(c){const d=SP[c.s];if(c.truce>G.turn)return false;if(c.grudge&&c.grudge.p)return true;if(c.dz==='mania')return true;
 if(d.tags.undead||c.fac==='plague'||c.fac==='spider')return !(c.fed>G.turn);
 if(REPF.includes(c.fac)){if(disguised(c)&&!c.sawThrough)return false;return G.rep[c.fac]<-20}
 if(c.fed>G.turn||c.tame)return false;
 const se=seasonIdx(),dd=dist(c.x,c.y,G.p.x,G.p.y);
 if(d.tags.predator){const th=se===3?15:se===2?70:45;return c.hunger>th||dd<=2}
 if(d.tags.protective&&se===0)return dd<=3;if(c.s==='deer'&&se===2)return dd<=2;
 if(d.tags.territorial)return dd<=(d.tags.forager&&se===2?1:2);
 if(d.tags.swarm&&d.tags.feverbite)return true;if(d.tags.mindless)return true;if(d.tags.scavenger)return c.hunger>80&&dd<=1;return false}
function hostile(a,b){if(a===b)return false;if(a.grudge&&a.grudge[b.id])return true;if(a.dz==='mania')return true;if(!isP(a)&&b.dz==='mania'&&dist(a.x,a.y,b.x,b.y)<=4&&!SP[a.s].tags.prey)return true;
 const sa=side(a),sb=side(b);if(sa===sb)return false;if(sb==='player'&&isP(b))return hostilePlayer(a);if(sa==='player'&&isP(a))return hostilePlayer(b);
 if(sb==='player')return hostilePlayer(a)||(a.fac&&b.order===a.id)||!!(FAC[a.fac]&&a.mindOld===undefined&&b.mindOld===a.fac);
 if(sa==='player')return a.order===b.id||hostilePlayer(b);
 if(feudOn(sa,sb))return true;const F=FAC[sa];return !!(F&&F.enemy.includes(sb))}
function preyFor(c,o){const d=SP[c.s];return d.eats&&d.eats.includes(o.s)&&!isP(o)&&c.hunger>35}

// ===== damage =====
function credit(src){if(!src)return null;if(isP(src))return G.p;if(src.charm>0||src.ally)return G.p;return src}
function hurt(t,dm,src,kind){dm=Math.max(0,Math.round(dm));if(t.aegis){if(visible(t.x,t.y)&&kind!=='env')msg('The Aegis flares and turns the '+(kind||'blow')+' aside.','warn');return false}
 if(isP(t)){const p=t;if(p.fx.absorb){const u=Math.min(p.fx.absorb.v,dm);p.fx.absorb.v-=u;dm-=u;if(p.fx.absorb.v<=0)delete p.fx.absorb}if(p.fx.invis&&dm>0)delete p.fx.invis;p.hp-=dm;RT.hit=1;if(dm>0)p.lastHit=kind||(src&&SP[src.s]?SP[src.s].n:'the world');if(p.hp<=0)playerDie(src,kind);return true}
 const d=SP[t.s];t.hp-=dm;t.sleep=t.ko?t.sleep:0;if(src&&!isP(src)&&!(t.grudge&&t.grudge[src.id]))(t.grudge=t.grudge||{})[src.id]=1;
 if(src&&isP(src)){t.alert=2;(t.grudge=t.grudge||{}).p=1;t.lastSeen={x:G.p.x,y:G.p.y}}
 if(t.hp<=0){if(src&&isP(src)&&kind==='mercy'){t.hp=1;t.sleep=70;t.ko=1;G.stats.knockouts++;msg(d.n+' crumples, alive but unconscious.','good');gainXP(Math.max(1,d.xp>>1));return true}die(t,src,kind)}return true}
function die(c,src,kind){const d=SP[c.s];const i=L.cr.indexOf(c);if(i>=0)L.cr.splice(i,1);RT.occ.delete(c.y*L.w+c.x);RT.act=RT.act.filter(o=>o!==c);
 const v=visible(c.x,c.y);if(v)msg(d.n+(kind==='fire'?' burns to death.':kind==='fall'?' drowns.':' dies.'),'kill');
 c.inv.forEach(it=>addItem(L,c.x,c.y,it));if(c.coins)addItem(L,c.x,c.y,mk('coins',c.coins));Object.entries(d.loot||{}).forEach(([k,q])=>{if(chance(.8))addItem(L,c.x,c.y,mk(k,ri(1,q)))});
 if(!d.tags.undead&&!d.tags.swarm&&c.s!=='flytrap')addItem(L,c.x,c.y,{k:'corpse',sp:c.s,age:G.turn,dz:c.dz||null});
 if(c.dz==='zombie'&&!d.tags.undead&&!d.tags.plant){const z=spawn('zombie',c.x,c.y,{stun:5,swarm:c.swarm},L);RT.occ.set(c.y*L.w+c.x,z);if(v)msg('It twitches, and stands up again.','warn')}
 const k=credit(src);if(k===G.p){if(d.tags.person||d.tags.talks){G.stats.killsP++;if(REPF.includes(c.fac))crime('murder',c)}else G.stats.killsA++;gainXP(d.xp||1);if(kind==='fire'){RT.fireKills=(RT.fireKills||0)+1}if(isP(src)===false&&visible(c.x,c.y))story(`${SP[src.s].n} killed ${d.n} on your behalf.`,2)}
 if(k&&!isP(k)&&k.dz==='mania'&&REPF.includes(k.fac)&&REPF.includes(c.fac)&&k.fac!==c.fac&&!feudOn(k.fac,c.fac)){G.feuds.push({a:k.fac,b:c.fac,u:G.turn+300});msg('Madness sets '+FAC[k.fac].n+' against '+FAC[c.fac].n+'.','story')}
 if(c.fac==='horde'&&k===G.p)G.moraleH=Math.max(0,G.moraleH-1);
 if(c.quest)questProgress('kill',c.s);questProgress('kill',c.s);
 if(c.aegis===0&&c.id===G.kingId)endGame(k===G.p?'conquest':'fallen')}
function playerDie(src,kind){if(G.over)return;G.over={kind:'death',by:G.p.lastHit||kind||'misfortune'};msg('You die. There is no coming back.','bad');story('Died to '+G.over.by+'.',5);deleteSave()}
function endGame(kind){if(G.over)return;G.over={kind};story('The story ended: '+kind,5);deleteSave()}

// ===== crime =====
function crime(kind,victim){const w=[];RT.act.forEach(c=>{if(c===victim||c.sleep>0||!SP[c.s].tags.person)return;if(dist(c.x,c.y,G.p.x,G.p.y)<=9&&los(c.x,c.y,G.p.x,G.p.y))w.push(c)});
 if(!w.length){return}const disg=disguised(w[0])||(G.p.eq.a&&idef(G.p.eq.a).disg);if(disg&&victim.fac!=='horde'){msg('They saw Horde colors. The Horde takes the blame.','hint');G.rep.free+=0;return}
 w.forEach(c=>{c.witness={k:kind,t:G.turn+18,f:victim.fac};if(c.fac===victim.fac)(c.grudge=c.grudge||{}).p=1;});msg(w.length+' saw what you did. Silence them or get ahead of it.','warn')}
function crimeTick(){RT.act.forEach(c=>{if(c.witness&&G.turn>=c.witness.t){const w=c.witness;delete c.witness;const f=w.f;if(REPF.includes(f)){const pen=w.k==='murder'?18:w.k==='necromancy'?14:w.k==='arson'?12:7;G.rep[f]=clamp(G.rep[f]-pen,-100,100);msg('Word of your '+w.k+' spreads among the '+FAC[f].n+'.','warn')}}})}

// ===== FOV & LOS =====
function opaque(x,y){if(!inb(L,x,y))return true;const d=tdef(x,y);if(d.o)return true;const g=L.gas[IX(x,y)];return !!(g&&g.a>=3&&(g.k==='smoke'||g.k==='steam'))}
function los(x0,y0,x1,y1){let dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx-dy,x=x0,y=y0;while(!(x===x1&&y===y1)){const e2=2*e;if(e2>-dy){e-=dy;x+=sx}if(e2<dx){e+=dx;y+=sy}if(x===x1&&y===y1)break;if(opaque(x,y))return false}return true}
function visionR(){const p=G.p;let r=10;if(L.dark)r=2;else if(isNight())r=5;const wx=G.wx.k;if(!L.dark){if(wx==='fog')r=Math.min(r,4);if(wx==='blizzard'||wx==='sandstorm')r=Math.min(r,3);if(wx==='rain'||wx==='snow')r=Math.min(r,8)}if(p.torch>0)r=Math.max(r,L.dark?7:8);return r}
function computeFOV(){const p=G.p,r=visionR();const V=new Set();V.add(IX(p.x,p.y));const steps=Math.round(r*8);for(let a=0;a<steps;a++){const ang=a/steps*6.2832,dx=Math.cos(ang),dy=Math.sin(ang);let x=p.x+.5,y=p.y+.5;for(let i=0;i<r;i++){x+=dx;y+=dy;const ix=Math.floor(x),iy=Math.floor(y);if(!inb(L,ix,iy))break;V.add(IX(ix,iy));if(opaque(ix,iy))break}}
 // lit places are visible from afar in the dark
 RT.vis=V;V.forEach(k=>{L.seen[k]=1});G.sites.forEach(s=>{if(L.id==='world'&&!s.known&&dist(p.x,p.y,s.x,s.y)<=5&&!s.cave){s.known=1;msg('You discover '+s.name+'.','good');gainXP(6)}else if(L.id==='world'&&!s.known&&s.cave&&dist(p.x,p.y,s.x,s.y)<=3){s.known=1;msg('You find a cave mouth.','good');gainXP(3)}})}

// ===== SEASONS =====
const ALMANAC=[
 {t:'Spring',hd:'Rivers run high and the world is hungry to grow.',l:['River ice breaks. Anyone on it falls in.','Riverbanks flood. Mud slows travel.','Burned land begins to regrow; ash turns to grass, stumps to saplings.','Bears wake starving. Does and sows defend their young.','Rain is common. Fires struggle and powder gets wet.','Farmers go to the fields. Plant now.']},
 {t:'Summer',hd:'Water and heat decide who lives.',l:['You thirst faster. Desert days cause heatstroke: travel at night or wear a shroud.','Dry grass burns fast. Dry thunder starts wildfires by itself.','Oases shrink. Nomads, camels, and predators crowd the remaining water.','The Horde sends raiding parties south. Traders are on the road.','Mosquitoes swarm the jungle and carry marsh fever.','Red Mania spreads in the heat.']},
 {t:'Autumn',hd:'Plenty before the cold.',l:['Berries and mushrooms are everywhere. Forage is rich.','Bears and boars gorge and ignore you unless you crowd them.','Stags rut and charge if you get close.','Villagers bring in the harvest. Mid-season festival: prices drop and people are generous.','Thick fog helps anyone sneaking.','Spiders spin more webs.']},
 {t:'Winter',hd:'The cold makes everyone desperate.',l:['You need warmth: fur, fire, walls, or a hot spring. Exposure causes frostbite.','Rivers freeze. You can walk across, and fire can break the ice under an enemy.','Bears hibernate. Snakes, bees, spiders, and mosquitoes go dormant. Ixa can be crept past.','Starving wolves form bold packs and attack villages.','Your tracks show in snow, and trackers follow them.','Villagers stay indoors and will pay dearly for food. Starving Horde soldiers desert for a meal.','Gunshots in the mountains can start avalanches. Vorgath grows melancholy and is easiest to reach. Grey Walkers slow to a crawl.']}];
function applySeason(se,first){const lv=G.levels.world,N=lv.w,T=lv.t;const n=TID;for(let i=0;i<T.length;i++){const k=T[i],r=lv.r[i],x=i%N,y=i/N|0;
  if(se===3){if(k===n.shallow||k===n.flood){if(r===RG||r===RM)T[i]=n.ice}else if(k===n.deep){if(r===RG||r===RM)T[i]=n.thinice}else if(k===n.scree&&r===RM&&hashn(x,y,G.turn%7)<.1)T[i]=n.drift;else if(k===n.bush)T[i]=n.bushbare;}
  else if(se===0){if(k===n.ice)T[i]=n.shallow;else if(k===n.thinice)T[i]=n.deep;else if(k===n.drift)T[i]=n.scree;else if(k===n.ash)T[i]=hashn(x,y,3)<.7?n.grass:n.ash;else if(k===n.stump)T[i]=n.sapling;else if(k===n.cracked)T[i]=n.oasis;else if(k===n.bushbare&&chance(.3))T[i]=n.bush;
   else if(k===n.grass&&!first&&r===RG&&hasNearWater(lv,x,y)&&chance(.35))T[i]=n.flood}
  else if(se===1){if(k===n.flood)T[i]=n.mud;else if(k===n.oasis&&hashn(x,y,G.turn%5)<.45)T[i]=n.cracked;else if(k===n.sapling&&chance(.5))T[i]=r===RM?n.pine:r===RJ?n.palm:n.tree;else if(k===n.bushbare&&chance(.4))T[i]=n.bush}
  else if(se===2){if(k===n.mud)T[i]=n.grass;else if(k===n.bushbare)T[i]=n.bush;else if(k===n.tree&&chance(.03)){const q=y*N+x+1;if(T[q]===n.grass)T[q]=n.mushrooms}else if(k===n.grass&&r===RJ&&chance(.01))T[i]=n.mushrooms}}
 // frozen creatures fall through spring melt
 if(se===0&&L===lv){RT.act.forEach(c=>{if(tdef(c.x,c.y).swim&&!SP[c.s].tags.flier){hurt(c,c.hp+1,null,'fall')}})}
 // crops die in winter
 if(se===3){let lost=0;for(const k in lv.crops){if(chance(.9)){delete lv.crops[k];lost++}}if(lost&&!first)msg('Frost kills the crops still in the ground.','warn')}
 if(!first){ // people react
  lv.cr.forEach(c=>{if(c.job==='raider'&&se===3){c.job='patrol'}})}}
function hasNearWater(lv,x,y){for(const[d,e]of DIRS){const k=TN[tget(x+d,y+e,lv)];if(k==='deep'||k==='shallow')return true}return false}
function seasonTick(){const se=seasonIdx();if(se===G.lastSeason)return;G.lastSeason=se;applySeason(se);const a=ALMANAC[se];msg(a.t+' arrives. '+a.hd,'season');RT.seasonBanner=a;G.flags.festival=false;story(a.t+' came to the continent.',0);if(se===3){G.moraleH=Math.max(0,G.moraleH-8);msg('Food runs low in the Horde camps.','hint')}if(se===0)ecoBirths();}
function ecoBirths(){const lv=G.levels.world;let n=0;for(const c of lv.cr.slice()){if((c.s==='rabbit'||c.s==='deer'||c.s==='goat'||c.s==='boar')&&chance(.25)&&n<30){spawn(c.s,c.x,c.y,{young:1},lv);n++}}if(L===lv)rebuild()}
function pickWeather(){const se=seasonIdx(),rg=L.r?L.r[IX(G.p.x,G.p.y)]:0,q=R();if(rg===RD){if(se===1&&q<.2)return'sandstorm';if(se===0&&q<.12)return'rain';if(q<.08)return'sandstorm';if(se===1&&q<.5)return'heat';return'clear'}if(rg===RJ){if(se===3)return q<.1?'rain':'clear';return q<.4?'rain':q<.55?'fog':se===1&&q<.72?'dryth':'clear'}
 if(se===0)return q<.4?'rain':q<.55?'fog':'clear';if(se===1)return q<.2?'dryth':q<.35?'heat':q<.45?'rain':'clear';if(se===2)return q<.25?'fog':q<.5?'rain':'clear';return q<.35?'snow':q<.5?'blizzard':'clear'}
const WXN={clear:'Clear',rain:'Rain',fog:'Fog',snow:'Snow',blizzard:'Blizzard',sandstorm:'Sandstorm',heat:'Heat wave',dryth:'Dry thunder',storm:'Thunderstorm'};
function raining(){return G.wx.k==='rain'||G.wx.k==='storm'}
function weatherTick(){const w=G.wx;w.t--;if(w.t<=0){const k=pickWeather();G.wx={k,t:ri(25,70)};if(k!=='clear')msg(WXN[k]+' moves in.','wx');if(chance(.5))G.wind={dx:ri(-1,1),dy:ri(-1,1)}}
 const k=G.wx.k;if((k==='dryth'||k==='storm')&&chance(.09)&&L.id==='world'){for(let i=0;i<8;i++){const x=G.p.x+ri(-14,14),y=G.p.y+ri(-14,14);const d=tdef(x,y);if(d.f&&d.fuel>=8){if(k==='dryth'||chance(.5))ignite(x,y,0);if(visible(x,y))msg('Lightning splits a tree.','warn');noise(x,y,18);break}}}
 if(raining())for(const k2 in L.fire){if(chance(.04))delete L.fire[k2]}
 if(raining()){G.p.fx.wet={t:5};RT.act.forEach(c=>{if(outdoors(c.x,c.y))c.wet=3})}}

// ===== ENV TICK =====
function envTick(){G.turn++;const p=G.p;seasonTick();weatherTick();needsTick();statusTick();fireTick();gasTick();iceTick();if(G.turn%5===0)cropTick();if(G.turn%20===0)worldTick();crimeTick();if(G.turn%3===0)corpseTick();
 if(RT.fireKills){msg('Your fire killed '+RT.fireKills+(RT.fireKills>1?' creatures.':' creature.'),'warn');story('Your fire claimed '+RT.fireKills+' lives.',RT.fireKills>2?3:1);RT.fireKills=0}
 if(L.id==='world'&&G.turn%2===0){(L.scent=L.scent||{})[IX(p.x,p.y)]=G.turn;if(G.turn%40===0){const lim=G.turn-(seasonIdx()===3?180:60);for(const k in L.scent)if(L.scent[k]<lim)delete L.scent[k]}}
 p.mp=Math.min(p.mmp,p.mp+(G.turn%6===0?1:0));if(p.torch>0){p.torch--;if(p.torch===0)msg('Your torch gutters out.','warn');if(raining()&&outdoors(p.x,p.y)&&chance(.05)){p.torch=0;msg('Rain kills your torch.','warn')}}
 if(p.hunger>45&&p.thirst>40&&G.turn%7===0&&p.hp<p.mh&&!p.dz.some(z=>DISEASE[z.k].lethal))p.hp++}
function needsTick(){const p=G.p;const se=seasonIdx(),rg=L.r?L.r[IX(p.x,p.y)]:-1;let hun=.09,thi=.13;if(se===1)thi*=1.4;if(rg===RD&&!isNight())thi*=1.4;if(p.temp>50)thi*=1.5;if(se===3)hun*=1.3;p.dz.forEach(z=>{const d=DISEASE[z.k];if(d.hunger)hun*=d.hunger;if(d.thirst)thi*=d.thirst});if(tdef(p.x,p.y).water&&!tdef(p.x,p.y).swim&&false)thi=0;p.hunger=clamp(p.hunger-hun,0,100);p.thirst=clamp(p.thirst-thi,0,100);if(p.hunger<=0&&G.turn%4===0)hurt(p,1,null,'starvation');if(p.thirst<=0&&G.turn%3===0)hurt(p,1,null,'thirst');
 // temperature
 let tgt=0;if(!L.dark){if(se===3&&rg!==RD)tgt=rg===RJ?-5:(rg===RM?-70:-45);if(se===3&&rg===RD)tgt=-20;if(se===1&&rg===RD)tgt=isNight()?5:70;if(se===1&&rg!==RD)tgt=rg===RJ?25:10;if(se===2&&rg===RM)tgt=-25;if(rg===RM&&se===0)tgt=-20;if(se===0&&rg===RD)tgt=25;if(isNight())tgt-=15;if(G.wx.k==='blizzard')tgt-=20;if(G.wx.k==='heat')tgt+=20;}else tgt=-5;if(tdef(p.x,p.y).indoor||insideWalls())tgt=tgt<0?tgt*.25:tgt*.5;if(p.fx.wet&&tgt<0)tgt-=20;if(nearHeat(p.x,p.y,2))tgt+=45;if(tdef(p.x,p.y).warm)tgt=Math.max(tgt,20);const a=p.eq.a&&idef(p.eq.a);if(a){if(a.warm&&tgt<0)tgt+=a.warm;if(a.ench==='warmth'&&tgt<0)tgt+=35;if(a.cool&&tgt>0)tgt-=a.cool;if(a.ench==='cool'&&tgt>0)tgt-=35}const w=p.eq.w&&idef(p.eq.w);if(w&&w.ench==='warmth'&&tgt<0)tgt+=25;p.temp+=clamp((tgt-p.temp)*.04,-2,2);if(p.temp<-65&&G.turn%6===0){hurt(p,1,null,'cold');if(chance(.03))infect(p,'frostbite')}if(p.temp>65&&G.turn%6===0){hurt(p,1,null,'heatstroke');if(chance(.03))infect(p,'sun')}
 // diseases
 p.dz=p.dz.filter(z=>{z.t--;const d=DISEASE[z.k];if(d.cough&&chance(.05)){msg('You cough.','warn');noise(p.x,p.y,7);RT.act.forEach(c=>{if(dist(c.x,c.y,p.x,p.y)<=2&&SP[c.s].tags.person&&!c.dz&&chance(.3)){c.dz='cough';c.dzT=300}})}if(d.lash&&chance(.015)){const n=adjacentAny(p);if(n){msg('A red rage takes you. You strike '+SP[n.s].n+'.','bad');meleeHit(p,n)}}if(z.t<=0){if(d.lethal){hurt(p,9999,null,'the Grey Walk');msg('You rise again, and no one is left to mourn it.','bad');return false}msg('You recover from '+d.n+'.','good');return false}if(d.lethal&&z.t%60===0)msg('The black veins climb higher. Find a cleansing tonic. '+z.t+' turns remain.','bad');return true});
 for(const k in p.fx){const f=p.fx[k];if(f.t!==undefined){f.t--;if(f.t<=0){delete p.fx[k];if(k==='poison')msg('The poison fades.','good');recalc()}}}if(p.fx.poison&&G.turn%2===0)hurt(p,1,null,'poison');if(p.burning>0){p.burning--;hurt(p,2,null,'fire');if(tdef(p.x,p.y).water||raining())p.burning=0}if(p.dom>0)p.dom--}
function adjacentAny(c){for(const[dx,dy]of DIRS){const o=RT.occ.get(IX(c.x+dx,c.y+dy));if(o)return o}return null}
function insideWalls(){const p=G.p;let n=0;for(const[dx,dy]of DIRS.slice(0,4)){let x=p.x,y=p.y;for(let i=0;i<8;i++){x+=dx;y+=dy;const d=tdef(x,y);if(d.wall||d.door||d.gate){n++;break}if(!d.indoor)break}}return n>=4}
function nearHeat(x,y,r){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(tdef(x+dx,y+dy).heat)return true;if(L.fire[IX(x+dx,y+dy)])return true}return false}
function infect(p,k){if(p.dz.some(z=>z.k===k))return;const d=DISEASE[k];p.dz.push({k,t:d.dur});msg('You have '+d.n+'. '+d.d,'bad');story('Caught '+d.n+'.',1)}
function statusTick(){for(const c of RT.act.slice()){if(c.sleep>0&&c.sleep<900){c.sleep--;if(c.sleep===0)c.ko=0}['stun','stuck','confused','fear','slow','wet','para','frozenT','calm'].forEach(k=>{if(c[k]>0)c[k]--});
  if(c.charm>0){c.charm--;if(c.charm===0){if(visible(c.x,c.y))msg(SP[c.s].n+' shakes off your hold.','warn');if(c.mindOld!==undefined){delete c.mindfac;delete c.mindOld}if(SP[c.s].tags.person)(c.grudge=c.grudge||{}).p=1}}
  if(c.mindT>0){c.mindT--;if(c.mindT===0){delete c.mindfac;delete c.mindOld}}
  if(c.poison>0){c.poison--;hurt(c,1,c.poisonBy==='p'?G.p:null,'poison')}
  if(c.burning>0){c.burning--;hurt(c,3,c.fireBy?G.p:null,'fire');if(tdef(c.x,c.y).water||raining())c.burning=0;else if(tdef(c.x,c.y).f&&!L.fire[IX(c.x,c.y)]&&chance(.5))ignite(c.x,c.y,c.fireBy?1:0)}
  if(c.life>0){c.life--;if(c.life===0){if(visible(c.x,c.y))msg(SP[c.s].n+' falls apart.','warn');die(c,null);continue}}
  if(c.regen!==0&&SP[c.s].tags.regen&&c.hp<c.mh&&!c.burning)c.hp++;
  const se=seasonIdx();c.hunger=clamp((c.hunger||0)+(se===3?.25:se===2?.05:.12),0,100);
  if(c.dz){diseaseCreature(c)}
  if(c.spells&&c.mp<20&&G.turn%4===0)c.mp++;
  if(c.reload>0)c.reload--;}}
function diseaseCreature(c){c.dzT--;const d=SP[c.s];if(c.dz==='zombie'&&chance(.04))RT.act.forEach(o=>{if(!o.dz&&!o.aegis&&SP[o.s].tags.person&&dist(o.x,o.y,c.x,c.y)<=2&&chance(.5)){o.dz='zombie';o.dzT=ri(50,100)}});if(c.dz==='cough'&&G.turn%25===0&&chance(.2))hurt(c,1,null,'disease');if(c.dz==='cough'&&chance(.04))RT.act.forEach(o=>{if(!o.dz&&SP[o.s].tags.person&&dist(o.x,o.y,c.x,c.y)<=2&&chance(.4)){o.dz='cough';o.dzT=280}});if(c.dzT<=0){if(c.dz==='zombie'){if(visible(c.x,c.y))msg(d.n+' falls, grey and still.','warn');die(c,null,'plague');return}if(c.dz==='mania'&&seasonIdx()!==1&&chance(.6)){delete c.dz;delete c.dzT;return}if(c.dz==='cough'){delete c.dz;return}c.dzT=100}if(c.dz==='mania'&&seasonIdx()===1&&chance(.002)&&visible(c.x,c.y))bark(c,'They look at me. They ALL look at me!')}
function bark(c,t){if(visible(c.x,c.y))msg(SP[c.s].n+': "'+t+'"','say')}

// ===== FIRE / GAS / ICE =====
function ignite(x,y,own){if(!inb(L,x,y))return false;const k=IX(x,y),d=tdef(x,y);if(d.boom){tset(x,y,'rubble');explode(x,y,3,own?G.p:null);return true}const g=L.gas[k];if(g&&g.k==='methane'&&g.a>=1){delete L.gas[k];explode(x,y,1,own?G.p:null);}if(tget(x,y)===TID.campfire)return false;if(!d.f)return false;if(L.fire[k])return false;L.fire[k]={t:d.fuel||3,o:own?1:0};if(own)G.stats.fires++;return true}
function explode(x,y,r,src){noise(x,y,20);if(visible(x,y)||dist(x,y,G.p.x,G.p.y)<12)msg('An explosion tears the air.','bad');RT.fxq.push({type:'boom',x,y,r});if(L.id==='world'&&regionAt(x,y)===RM&&seasonIdx()===3)avalanche(x,y);
 for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const nx=x+dx,ny=y+dy;if(!inb(L,nx,ny)||Math.hypot(dx,dy)>r+.5)continue;const d=tdef(nx,ny);const e=at(nx,ny);if(e)hurt(e,Math.round(16/(1+Math.hypot(dx,dy)*.6)),src,'blast');if(d.wall||d.door||d.gate||d.k==='gateopen'){tset(nx,ny,'rubble');if(d.gate)msg('The gate is blown off its hinges.','warn')}else if(d.boom){setTimeout0(()=>{tset(nx,ny,'rubble');explode(nx,ny,3,src)})}else if(d.chop){tset(nx,ny,'stump')}else if(d.f)ignite(nx,ny,src?1:0);else if(TN[tget(nx,ny)]==='ice'||TN[tget(nx,ny)]==='thinice')meltTile(nx,ny)}}
function setTimeout0(f){(RT.later=RT.later||[]).push(f)}
function avalanche(x,y){if(G.flags.avaT&&G.turn-G.flags.avaT<60)return;G.flags.avaT=G.turn;let killed=0;msg('A rumble rolls down the peak. Avalanche!','bad');story('A sound started an avalanche in the mountains.',3);for(let i=0;i<70;i++){const nx=x+ri(-7,7),ny=y+ri(-9,1);const d=tdef(nx,ny);if(d.p&&!d.indoor){tset(nx,ny,'drift');const e=at(nx,ny);if(e){hurt(e,18,G.flags.lastLoud==='p'?G.p:null,'avalanche');killed++}}}}
function fireTick(){const se=seasonIdx(),rainF=raining()?.35:1,dry=[.7,1.5,1.1,.5][se];const keys=Object.keys(L.fire);if(!keys.length)return;for(const k of keys){const f=L.fire[k];if(!f)continue;const i=+k,x=i%L.w,y=i/L.w|0;f.t--;const e=at(x,y);if(e){if(isP(e)){if(!e.burning&&chance(.7)){e.burning=3;msg('You catch fire! Find water or keep moving.','bad')}hurt(e,3,null,'fire')}else if(!SP[e.s].tags.fireproof){e.burning=Math.max(e.burning||0,3);e.fireBy=f.o?1:e.fireBy;hurt(e,4,f.o?G.p:null,'fire')}}
  const its=L.items[i];if(its){L.items[i]=its.filter(it=>{const d=idef(it);if(it.k==='rawmeat'){it.k='cooked';return true}if(d.noburn)return true;if(it.k==='corpse')return chance(.6);if(it.k==='powder'){setTimeout0(()=>explode(x,y,3,f.o?G.p:null));return false}if(it.k==='scroll'||it.k==='wood'||it.k==='rope'||d.k==='herb')return false;return true});if(!L.items[i].length)delete L.items[i]}
  if(L.crops[i])delete L.crops[i];
  for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy;if(!inb(L,nx,ny))continue;const d=tdef(nx,ny);const g=L.gas[IX(nx,ny)];if(g&&g.k==='methane'&&g.a>=1){ignite(nx,ny,f.o);continue}if(TN[tget(nx,ny)]==='ice'||TN[tget(nx,ny)]==='thinice'){if(chance(.2))meltTile(nx,ny);continue}if(!d.f)continue;let pr=d.f*.38*rainF*dry;if(regionAt(nx,ny)===RJ&&se===3)pr*=1.6;if(regionAt(nx,ny)===RJ&&se!==3)pr*=.8;const wd=dx*G.wind.dx+dy*G.wind.dy;pr*=1+wd*.5;if(chance(pr))ignite(nx,ny,f.o)}
  if(chance(.3))addGas(x,y,'smoke',4);
  if(f.t<=0){delete L.fire[k];const d=tdef(x,y);if(d.b){tset(x,y,d.b);if(d.k==='woodwall'&&L.id==='world'&&!G.flags.ash&&f.o)G.flags.ash=1}if(f.o&&(d.wall||d.door||d.indoor)&&!RT.arsonT){RT.arsonT=1;crime('arson',{fac:'free'})}}}
 if(RT.later){const l=RT.later;RT.later=null;l.forEach(fn=>fn())}}
function addGas(x,y,k,a){if(!inb(L,x,y)||tdef(x,y).wall)return;const i=IX(x,y),g=L.gas[i];if(g&&g.k===k)g.a=Math.min(12,g.a+a);else if(!g||a>g.a)L.gas[i]={k,a}}
function gasTick(){const keys=Object.keys(L.gas);for(const k of keys){const g=L.gas[k];if(!g)continue;const i=+k,x=i%L.w,y=i/L.w|0;const decay=g.k==='methane'?.02:.25;if(chance(decay))g.a--;if(g.a<=0){delete L.gas[k];continue}
  if(g.a>=2&&chance(.5)){let d=pick(DIRS);if(chance(.5)&&(G.wind.dx||G.wind.dy))d=[G.wind.dx,G.wind.dy];const nx=x+d[0],ny=y+d[1];if(inb(L,nx,ny)&&!opaqueSolid(nx,ny)){const a=g.a>>1;g.a-=a;addGas(nx,ny,g.k,a)}}
  const e=at(x,y);if(e&&g.a>=1){if(g.k==='poison')poisonEnt(e,2,g.o);else if(g.k==='sleepgas'){if(isP(e)){if(!e.fx.gasGuard&&chance(.2)){msg('The sweet smoke drags at your eyes. You sleep for a moment.','bad');e.fx.slept={t:1};RT.forceWait=3}}else if(!SP[e.s].tags.undead&&!SP[e.s].tags.plant){e.sleep=Math.max(e.sleep||0,18);e.ko=1}}else if(g.k==='steam'){hurt(e,1,null,'steam')}else if(g.k==='mania'&&!isP(e)&&SP[e.s].tags.person&&!e.dz){e.dz='mania';e.dzT=200}}
  if(g.k==='smoke'){const hv=TN[tget(x,y)];if(e&&!isP(e)&&SP[e.s].tags.smokefear){e.fear=Math.max(e.fear||0,6)}}
  if(g.k==='methane'&&L.fire[i]){ignite(x,y,L.fire[i].o)}}
 // swamps breathe methane
 if(L.id==='world'&&G.turn%6===0){for(let i=0;i<4;i++){const x=G.p.x+ri(-14,14),y=G.p.y+ri(-14,14);if(TN[tget(x,y)]==='bog'&&chance(seasonIdx()===1?.8:.4))addGas(x,y,'methane',3)}}}
function opaqueSolid(x,y){const d=tdef(x,y);return d.wall||d.k==='rock'||d.k==='cavewall'||d.k==='door'||d.k==='locked'||d.k==='ore'||d.k==='star'}
function poisonEnt(e,n,o){if(SP[e.s]&&(SP[e.s].tags.undead||SP[e.s].tags.plant))return;if(isP(e)){e.fx.poison={t:Math.max((e.fx.poison&&e.fx.poison.t)||0,n+6)}}else{e.poison=Math.max(e.poison||0,n+4);if(o)e.poisonBy='p'}}
function meltTile(x,y){const k=TN[tget(x,y)];const u=TDEF[k].under;if(!u)return;tset(x,y,u);delete L.frozen[IX(x,y)];addGas(x,y,'steam',3);const e=at(x,y);if(e&&u==='deep'){if(isP(e))msg('The ice gives way beneath you!','bad');else if(!SP[e.s].tags.flier){if(visible(x,y))msg(SP[e.s].n+' plunges through the ice.','good');hurt(e,e.hp+1,G.p,'fall')}}else if(e)e.wet=8}
function freezeTile(x,y,t){const k=TN[tget(x,y)];if(k==='shallow'||k==='flood'||k==='oasis'){tset(x,y,'ice');L.frozen[IX(x,y)]={t,was:k}}else if(k==='deep'){tset(x,y,'thinice');L.frozen[IX(x,y)]={t,was:k}}delete L.fire[IX(x,y)]}
function iceTick(){for(const k in L.frozen){const f=L.frozen[k];f.t--;const hot=seasonIdx()===1?2:1;f.t-=hot-1;if(f.t<=0&&seasonIdx()!==3){const i=+k,x=i%L.w,y=i/L.w|0;tset(x,y,f.was);delete L.frozen[k];const e=at(x,y);if(e&&f.was==='deep'&&!isP(e)&&!SP[e.s].tags.flier)hurt(e,e.hp+1,G.p,'fall')}else if(f.t<=0&&f.was)delete L.frozen[k]}}
function cropTick(){const lv=G.levels.world;const se=seasonIdx();for(const k in lv.crops){const c=lv.crops[k];if(se===3)continue;let g=1;if(se===0)g=1.3;if(se===1)g=c.w>G.turn||raining()?1.5:.5;if(se===2)g=1;c.a+=g*5}}
function corpseTick(){for(const k in L.items){const a=L.items[k];for(let j=a.length-1;j>=0;j--){const it=a[j];if(it.k==='corpse'&&G.turn-it.age>(seasonIdx()===3?400:seasonIdx()===1?90:180)){a.splice(j,1);if(!a.length)delete L.items[k]}else if(it.k==='corpse'&&G.turn-it.age>60&&chance(.02)&&seasonIdx()!==3){const x=+k%L.w,y=+k/L.w|0;if(dist(x,y,G.p.x,G.p.y)<=1&&chance(.25)&&!G.p.dz.some(z=>z.k==='rot')){infect(G.p,'rot')}}}}}

// ===== noise =====
function noise(x,y,r,src){if(isNaN(r))return;RT.act.forEach(c=>{const d=dist(c.x,c.y,x,y);if(d>r)return;if(c.sleep>0&&!c.ko&&c.sleep<999&&chance(.6)){c.sleep=0}if(c.sleep>=999&&d<=4&&chance(.5))c.sleep=0;if(c.sleep>0)return;if(!(c.alert>=2)&&!SP[c.s].tags.mindless){c.invest={x,y,t:G.turn+15};if(SP[c.s].tags.tremor&&d<=r)c.alert=2}});if(src==='p')G.flags.lastLoud='p';else G.flags.lastLoud=null}

// ===== WORLD EVENTS: raids, plagues, swarms, assassins =====
function worldTick(){const lv=G.levels.world;if(!lv)return;const se=seasonIdx(),p=G.p;const onSurface=L===lv;
 // festival
 if(se===2&&(G.turn%SEASON)===Math.floor(SEASON/2)-((G.turn%SEASON)%20)&&!G.flags.festival){G.flags.festival=true;msg('Harvest festival: the villages gather at their wells.','season')}
 // raids
 if(onSurface&&se===1&&chance(.09)){const vil=G.sites.filter(s=>s.village&&dist(s.x,s.y,p.x,p.y)<28);if(vil.length){const v=pick(vil);const dir=[-12,12];let n=ri(3,5);for(let i=0;i<n;i++){const x=clamp(v.x+pick(dir)+ri(-2,2),2,lv.w-3),y=clamp(v.y-13+ri(-2,2),2,lv.h-3);if(td(lv.t[y*lv.w+x]).p&&!at(x,y)){const c=spawn(i===0?'sapper':(i===1&&chance(.4)?'battlemage':'horde'),x,y,{job:'raider',goal:{x:v.x,y:v.y}},lv);RT.occ.set(IX(x,y),c)}}msg('Horde horns sound near '+v.name+'.','warn')}}
 // winter wolves & deserters
 if(onSurface&&se===3&&chance(.08)){const x=clamp(p.x+pick([-16,16])+ri(-3,3),2,lv.w-3),y=clamp(p.y+pick([-16,16])+ri(-3,3),2,lv.h-3);const rg=lv.r[y*lv.w+x];if(td(lv.t[y*lv.w+x]).p&&(rg===RG||rg===RM)){if(chance(.55))for(let i=0;i<ri(3,6);i++){const c=spawn('wolf',clamp(x+ri(-2,2),2,lv.w-3),clamp(y+ri(-2,2),2,lv.h-3),{hunger:85},lv)}else if(chance(.5)){spawn('horde',x,y,{job:'deserter',hunger:95,home:{x,y}},lv)}else if(rg===RM)spawn('yeti',x,y,{hunger:70},lv)}}
 // spring/summer pests near player
 if(onSurface&&se===1&&lv.r[IX(p.x,p.y)]===RJ&&chance(.3)){const x=clamp(p.x+ri(-9,9),1,lv.w-2),y=clamp(p.y+ri(-9,9),1,lv.h-2);if(td(lv.t[y*lv.w+x]).p&&!at(x,y))spawn('mosquito',x,y,{},lv)}
 // assassins hunt the notorious
 const noto=G.stats.killsP*2+(100-G.moraleH)/4;if(onSurface&&!G.flags.assassinT&&noto>=12&&chance(.15)||onSurface&&G.flags.assassinT&&G.turn>G.flags.assassinT&&noto>=12&&chance(.05)){G.flags.assassinT=G.turn+400;const x=clamp(p.x+ri(10,14)*pick([-1,1]),2,lv.w-3),y=clamp(p.y+ri(10,14)*pick([-1,1]),2,lv.h-3);if(td(lv.t[y*lv.w+x]).p)spawn('assassin',x,y,{job:'hunt',alert:2},lv)}
 // outbreaks
 if(G.turn>SEASON*.9&&se===1&&!G.flags.mania&&chance(.05)){startOutbreak('mania')}
 if((G.turn>SEASON*2.5||G.flags.tombOpen)&&!G.flags.grey&&chance(.05))startOutbreak('zombie');
 if(G.flags.grey&&chance(.005)&&G.swarms.length<2&&G.turn>G.flags.grey+SEASON*4)startOutbreak('zombie');
 progressOutbreak(lv);swarmTick(lv);if(onSurface)rebuild()}
function startOutbreak(k){const lv=G.levels.world,p=G.p;const sites=G.sites.filter(s=>(s.village||s.camp||s.name==='Hunter camp'||s.name==='Nomad camp'||s.name==='Fort Hollow')&&dist(s.x,s.y,p.x,p.y)>15);if(!sites.length)return;const s=pick(sites);if(k==='zombie')G.flags.grey=G.turn;else G.flags.mania=G.turn;const pop=lv.cr.filter(c=>SP[c.s].tags.person&&dist(c.x,c.y,s.x,s.y)<=s.r+1);for(let i=0;i<Math.min(k==='zombie'?5:3,pop.length);i++){const c=pick(pop);c.dz=k;c.dzT=k==='zombie'?ri(50,110):240}G.outbreak=G.outbreak||[];G.outbreak.push({k,s:s.name,t:G.turn});msg(k==='zombie'?'Travellers whisper that the dead have stood up at '+s.name+'.':'Word comes of murderous madness at '+s.name+'.','story');story((k==='zombie'?'The Grey Walk':'Red Mania')+' broke out at '+s.name+'.',3)}
function progressOutbreak(lv){const p=G.p,se=seasonIdx();const inactive=lv.cr.filter(c=>L!==lv||dist(c.x,c.y,p.x,p.y)>26);const people=inactive.filter(c=>SP[c.s].tags.person&&!c.aegis);for(const c of inactive){if(c.s==='zombie'){const tgts=people.filter(o=>!o.dz&&dist(o.x,o.y,c.x,c.y)<=(se===3?3:14));if(tgts.length&&(se!==3||chance(.25))){const v=tgts.sort((a,b)=>dist(a.x,a.y,c.x,c.y)-dist(b.x,b.y,c.x,c.y))[0];if(dist(v.x,v.y,c.x,c.y)<=2){if(chance(.6)){v.dz='zombie';v.dzT=ri(20,50)}}else{c.x+=Math.sign(v.x-c.x)*2;c.y+=Math.sign(v.y-c.y)*2;c.x=clamp(c.x,1,lv.w-2);c.y=clamp(c.y,1,lv.h-2)}}continue}if(!c.dz)continue;c.dzT-=20;const nb=people.filter(o=>o!==c&&!o.dz&&dist(o.x,o.y,c.x,c.y)<=4);if(c.dz==='mania'){if(nb.length){const v=pick(nb);if(chance(.35)){v.hp-=ri(3,9);if(v.hp<=0){v.dead=1}else if(chance(.5)){v.dz='mania';v.dzT=200}}}if(c.dzT<=0)delete c.dz;if(se===1&&chance(.05))c.hp-=2;if(c.hp<=0)c.dead=1}else if(c.dz==='zombie'){if(nb.length&&chance(.45)){const v=pick(nb);v.dz='zombie';v.dzT=ri(30,70)}if(c.dzT<=0){c.dead=1;if(!SP[c.s].tags.unique)c.turn=1}}else if(c.dz==='cough'){if(nb.length&&chance(.2)){const v=pick(nb);v.dz='cough';v.dzT=240}if(c.dzT<=0)delete c.dz}}
 const out=[];lv.cr=lv.cr.filter(c=>{if(c.dead){(c.inv||[]).forEach(it=>addItem(lv,c.x,c.y,it));if(c.turn)out.push({x:c.x,y:c.y});return false}return true});out.forEach(o=>spawn('zombie',o.x,o.y,{},lv));
 // gather zombies into swarms
 const zs=lv.cr.filter(c=>c.s==='zombie'&&(L!==lv||dist(c.x,c.y,p.x,p.y)>26));if(zs.length>=8&&G.swarms.length<2){const c=zs[0];const near=zs.filter(z=>dist(z.x,z.y,c.x,c.y)<=14);if(near.length>=5){G.swarms.push({id:++G.cid,x:c.x,y:c.y,n:near.length});lv.cr=lv.cr.filter(z=>!near.includes(z));msg('Refugees speak of a grey horde on the march.','story');story('A plague swarm of '+near.length+' began to march.',3)}}}
function swarmTick(lv){const p=G.p,se=seasonIdx();G.swarms.forEach(s=>{const sites=G.sites.filter(q=>(q.village||q.camp||q.fac==='hunter'||q.fac==='nomad'||q.fac==='bandit')&&!q.overrun);let tgt=null,b=1e9;sites.forEach(q=>{const d=dist(q.x,q.y,s.x,s.y);if(d<b){b=d;tgt=q}});
  const cold=se===3?(chance(.25)?1:0):1;if(tgt&&cold){const stepN=s.n>=20?2:1;for(let i=0;i<stepN;i++){s.x+=Math.sign(tgt.x-s.x);s.y+=Math.sign(tgt.y-s.y)}}
  if(tgt&&dist(tgt.x,tgt.y,s.x,s.y)<=3){const pop=lv.cr.filter(c=>SP[c.s].tags.person&&!SP[c.s].tags.unique&&dist(c.x,c.y,tgt.x,tgt.y)<=tgt.r+2&&(L!==lv||dist(c.x,c.y,p.x,p.y)>24));pop.slice(0,2).forEach(c=>{(c.inv||[]).forEach(it=>addItem(lv,c.x,c.y,it));lv.cr.splice(lv.cr.indexOf(c),1);s.n++});if(!pop.length){tgt.overrun=1;msg(tgt.name+' has fallen to the Grey Walk.','story');story(tgt.name+' was overrun by the plague swarm, now '+s.n+' strong.',4);if(tgt.camp||tgt.fac==='horde')G.moraleH=Math.max(0,G.moraleH-10)}}
  // materialize near the player
  if(L===lv&&dist(s.x,s.y,p.x,p.y)<20){const n=Math.min(24,s.n);let placed=0;for(let i=0;i<n*5&&placed<n;i++){const x=clamp(s.x+ri(-5,5),1,lv.w-2),y=clamp(s.y+ri(-5,5),1,lv.h-2);if(td(lv.t[y*lv.w+x]).p&&!at(x,y)&&!(x===p.x&&y===p.y)){spawn('zombie',x,y,{swarm:s.id},lv);RT.occ.set(IX(x,y),lv.cr[lv.cr.length-1]);placed++}}s.n-=placed;msg('A grey mass shuffles over the horizon: '+placed+' walkers and more behind.','bad');if(s.n<=0)s.gone=1}});G.swarms=G.swarms.filter(s=>!s.gone&&s.n>0);
  // regroup: far walkers re-form as a swarm
}

// ===== AI =====
function passC(c,x,y){if(!inb(L,x,y))return false;const d=tdef(x,y),sp=SP[c.s];if(at(x,y))return false;if(L.fire[IX(x,y)]&&!sp.tags.undead&&!c.burning)return false;if(sp.tags.flier)return !d.wall&&!d.o&&d.k!=='sea'&&!d.gate||d.p;if(sp.tags.burrow)return d.k==='sand'||d.k==='cracked';if(d.door&&sp.tags.opendoor&&d.k!=='locked')return true;if(d.k==='locked'&&c.job==='gate')return true;if(!d.p)return false;if(d.k==='gateopen')return true;if(sp.tags.person&&(d.k==='pit'||d.k==='spikes'||d.k==='snare')&&chance(.7))return false;if(d.water&&sp.tags.herb&&chance(.5))return false;return true}
function moveC(c,x,y){const k0=IX(c.x,c.y);if(RT.occ.get(k0)===c)RT.occ.delete(k0);const dx=x-c.x,dy=y-c.y;if(dx||dy){for(let i=0;i<8;i++)if(DIRS[i][0]===Math.sign(dx)&&DIRS[i][1]===Math.sign(dy)){c.face=i;break}}c.x=x;c.y=y;RT.occ.set(IX(x,y),c);const d=tdef(x,y);if(d.k==='door')tset(x,y,'dooropen');if(d.trap){trap(c,x,y)}if(d.sticky&&!SP[c.s].tags.webber)c.stuck=Math.max(c.stuck||0,d.k==='tar'?3:2);if(d.water)c.wet=6;if(d.k==='thinice'&&chance(.02)&&!SP[c.s].tags.flier)meltTile(x,y);if(d.spiky)hurt(c,1,null,'cactus')}
function trap(c,x,y){const k=TN[tget(x,y)];if(SP[c.s].tags.flier)return;if(k==='pit'){c.stuck=6;hurt(c,4,G.p,'pit');if(visible(x,y))msg(SP[c.s].n+' falls in a pit.','good')}else if(k==='spikes'){hurt(c,11,G.p,'spikes');tset(x,y,'grass');if(visible(x,y))msg(SP[c.s].n+' is impaled on spikes.','good')}else if(k==='snare'){c.stuck=10;tset(x,y,'grass');if(visible(x,y))msg(SP[c.s].n+' is caught in a snare.','good')}}
function stepTo(c,tx,ty,away){const dirs=DIRS.slice().sort((a,b)=>{const da=Math.hypot(c.x+a[0]-tx,c.y+a[1]-ty),db=Math.hypot(c.x+b[0]-tx,c.y+b[1]-ty);return away?db-da:da-db});const cur=Math.hypot(c.x-tx,c.y-ty);for(let i=0;i<(away?5:4);i++){const d=dirs[i];const nx=c.x+d[0],ny=c.y+d[1];if(passC(c,nx,ny)&&(away||Math.hypot(nx-tx,ny-ty)<=cur+1)){moveC(c,nx,ny);return true}}
 if(!away){const st=bfsNext(c,tx,ty,180);if(st){moveC(c,st.x,st.y);return true}}return false}
function bfsNext(c,tx,ty,lim){const q=[[c.x,c.y,null]];const seen=new Set([IX(c.x,c.y)]);let h=0;while(h<q.length&&h<lim){const [x,y,f]=q[h++];if(dist(x,y,tx,ty)<=1&&f)return f;for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy;if(!inb(L,nx,ny))continue;const k=IX(nx,ny);if(seen.has(k))continue;seen.add(k);const d=tdef(nx,ny);if(!(d.p||(d.door&&SP[c.s].tags.opendoor)))continue;if(!f&&at(nx,ny))continue;q.push([nx,ny,f||{x:nx,y:ny}])}}return null}
function wander(c,r){const h=c.home||c;if(dist(c.x,c.y,h.x,h.y)>(r||7)){stepTo(c,h.x,h.y);return}if(chance(.45)){const d=pick(DIRS);if(passC(c,c.x+d[0],c.y+d[1]))moveC(c,c.x+d[0],c.y+d[1])}}
function shouldSleep(c){const d=SP[c.s],se=seasonIdx(),rg=regionAt(c.x,c.y),n=isNight();if(c.alert>=2)return false;if(d.tags.hibernate&&se===3)return true;if(d.tags.coldblood&&se===3&&rg!==RD)return true;if(d.tags.noct&&!n)return true;if(d.tags.diur&&n)return true;if(d.tags.sleepnight&&n)return true;if(d.tags.heatrest&&se===1&&!n&&rg===RD&&G.turn%DAY>35&&G.turn%DAY<65)return true;if(d.tags.winterborn&&se!==3)return true;return false}
function aiAct(c){const d=SP[c.s],p=G.p,t=d.tags;if(c.dead)return;
 if(c.sleep>0){const se=shouldSleep(c);return}if(c.para>0||c.stun>0)return;if(c.tstop)return;if(c.stuck>0&&chance(.7))return;if(t.still&&c.job!=='post'&&!t.mindless)return;
 if(c.fear>0){const th=nearestThreat(c);if(th)stepTo(c,th.x,th.y,true);else wander(c,12);return}
 if(c.confused>0){const a=adjacentAny(c);if(a&&a!==c&&chance(.45)){meleeHit(c,a);(a.grudge=a.grudge||{})[c.id]=1;if(visible(c.x,c.y))story(d.n+', confused, struck its own ally.',1);return}const dd=pick(DIRS);if(passC(c,c.x+dd[0],c.y+dd[1]))moveC(c,c.x+dd[0],c.y+dd[1]);return}
 if(c.burning>0){const w=findTile(c,6,v=>v.water);if(w)stepTo(c,w.x,w.y);else{const dd=pick(DIRS);if(passC(c,c.x+dd[0],c.y+dd[1]))moveC(c,c.x+dd[0],c.y+dd[1])}return}
 if(!t.mindless){const g=L.gas[IX(c.x,c.y)];const danger=(g&&(g.k==='poison'||g.k==='steam'||(g.k==='smoke'&&t.smokefear)))||adjFire(c)&&!t.undead;if(danger){const fl=adjFireTile(c);if(fl)stepTo(c,fl.x,fl.y,true);else wander(c,12);return}}
 if(t.firefear){const fr=nearHeat(c.x,c.y,2);if(fr&&chance(.7)){const q=adjFireTile(c,3);if(q){stepTo(c,q.x,q.y,true);return}}}
 if(shouldSleep(c)&&!t.undead){if(c.job==='town'||c.job==='farm'){const h=c.homeb||c.home;if(h&&dist(c.x,c.y,h.x,h.y)>1){stepTo(c,h.x,h.y);return}}c.sleep=ri(25,60);return}
 const tg=pickTarget(c);
 const lowHP=c.hp<c.mh*.3;
 if((t.coward||t.prey)&&tg&&dist(c.x,c.y,tg.x,tg.y)<=7&&!(c.dz==='mania')){if(t.thief&&isP(tg)&&dist(c.x,c.y,tg.x,tg.y)<=1&&!c.stole){stealFromPlayer(c);return}if(t.thief&&isP(tg)&&!c.stole){stepTo(c,tg.x,tg.y);return}if(c.gun&&c.ammo>0&&powers(c,tg))return;stepTo(c,tg.x,tg.y,true);if(chance(.05)&&t.person)bark(c,'Help! Someone help!');return}
 if(lowHP&&t.person&&!t.brave&&!t.unique&&tg&&c.dz!=='mania'){const salve=c.inv.find(i=>i.k==='salve');if(salve){c.inv.splice(c.inv.indexOf(salve),1);c.hp=Math.min(c.mh,c.hp+15);if(visible(c.x,c.y))msg(d.n+' drinks a salve.','warn');return}c.beg=1;stepTo(c,tg.x,tg.y,true);return}
 if(c.charm>0||c.ally){if(allyAct(c,tg))return}
 if(tg){const dd=dist(c.x,c.y,tg.x,tg.y);c.lastSeen={x:tg.x,y:tg.y};if(powers(c,tg))return;if(dd<=1){meleeHit(c,tg);return}if(t.still)return;if(t.burrow){if(tdef(tg.x,tg.y).k!=='sand'&&tdef(tg.x,tg.y).k!=='cracked'&&dd>1){wander(c,10);return}}stepTo(c,tg.x,tg.y);return}
 if(t.still)return;
 if(t.scenter||c.job==='hunt'||t.predator&&seasonIdx()===3){if(trackScent(c))return}
 if(c.lastSeen&&c.alert>=1){if(dist(c.x,c.y,c.lastSeen.x,c.lastSeen.y)>0){stepTo(c,c.lastSeen.x,c.lastSeen.y);if(dist(c.x,c.y,c.lastSeen.x,c.lastSeen.y)<=1){c.lastSeen=null;c.alert=0}return}c.lastSeen=null;c.alert=0}
 if(c.invest&&c.invest.t>G.turn){if(dist(c.x,c.y,c.invest.x,c.invest.y)>1){stepTo(c,c.invest.x,c.invest.y);return}c.invest=null}
 if(eatAct(c))return;if(drinkAct(c))return;if(firefight(c))return;
 jobAct(c)}
function adjFire(c){for(const[dx,dy]of DIRS)if(L.fire[IX(c.x+dx,c.y+dy)])return true;return !!L.fire[IX(c.x,c.y)]}
function adjFireTile(c,r){r=r||1;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(L.fire[IX(c.x+dx,c.y+dy)]||tdef(c.x+dx,c.y+dy).heat)return{x:c.x+dx,y:c.y+dy}}return null}
function nearestThreat(c){let b=null,bd=99;const consider=o=>{if(o===c)return;const d=dist(c.x,c.y,o.x,o.y);if(d<bd&&(hostile(o,c)||isP(o)&&(c.grudge||{}).p)){bd=d;b=o}};consider(G.p);RT.act.forEach(consider);return b}
function findTile(c,r,fn){let b=null,bd=99;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=c.x+dx,y=c.y+dy;if(!inb(L,x,y))continue;const d=tdef(x,y);if(fn(d,x,y)){const q=Math.max(Math.abs(dx),Math.abs(dy));if(q<bd){bd=q;b={x,y}}}}return b}
function sightR(c){const d=SP[c.s];let r=8;if(isNight()&&!d.tags.noct&&!d.tags.undead)r=5;const w=G.wx.k;if(w==='fog')r=Math.min(r,4);if(w==='blizzard'||w==='sandstorm')r=Math.min(r,3);if(w==='rain'||w==='snow')r-=1;if(L.dark&&!d.tags.cavedweller&&!d.tags.undead)r=Math.min(r,4);return r}
function seesPlayer(c){const p=G.p,d=SP[c.s];if(p.fx.invis)return dist(c.x,c.y,p.x,p.y)<=1&&chance(.2);let r=sightR(c);if(p.torch>0)r+=3;const dd=dist(c.x,c.y,p.x,p.y);if(p.sneak)r=Math.max(1,Math.round(r*(1-eff('sth')*.07)));if(tdef(p.x,p.y).cover&&p.sneak)r=Math.max(1,r-2);if(d.tags.blindsense)return dd<=2&&!p.sneak||dd<=1;if(dd>r)return false;if(!los(c.x,c.y,p.x,p.y))return false;if(c.alert>=2)return true;const f=DIRS[c.face||0];const inFront=(p.x-c.x)*f[0]+(p.y-c.y)*f[1]>=0;if(!inFront&&dd>2)return chance(.1);let ch=.5-(eff('sth')*.035)+(dd<=2?.25:0);if(!p.sneak)ch+=.35;return chance(ch)}
function pickTarget(c){const d=SP[c.s],p=G.p;let best=null,bs=-1;const see=(o,dd)=>{const score=20-dd+(isP(o)&&c.grudge&&c.grudge.p?4:0);if(score>bs){bs=score;best=o}};
 const r=sightR(c)+1;if(hostile(c,p)){const dd=dist(c.x,c.y,p.x,p.y);if(seesPlayer(c)){if(c.alert<2&&visible(c.x,c.y)&&c.alert===1)msg(d.n+' spots you!','warn');c.alert=Math.min(2,(c.alert||0)+1);if(c.alert>=2)see(p,dd);else c.lastSeen={x:p.x,y:p.y}}else if(c.alert>=2&&dd>r+3){c.alert=1}else if(c.alert>=2&&dd<=r)see(p,dd)}
 for(const o of RT.act){if(o===c||o.dead)continue;const dd=dist(c.x,c.y,o.x,o.y);if(dd>r)continue;if(o.hidden&&dd>1)continue;if((hostile(c,o)||preyFor(c,o))&&los(c.x,c.y,o.x,o.y))see(o,dd)}
 if(d.tags.prey||d.tags.coward){for(const o of RT.act){if(o===c)continue;const dd=dist(c.x,c.y,o.x,o.y);if(dd>7)continue;if(SP[o.s].eats&&SP[o.s].eats.includes(c.s))see(o,dd)}if(dist(c.x,c.y,p.x,p.y)<=(p.sneak?2:5)&&d.tags.prey)see(p,dist(c.x,c.y,p.x,p.y))}
 if(c.order){const o=RT.act.find(q=>q.id===c.order);if(o)return o;c.order=null}
 return best}
function trackScent(c){if(!L.scent)return false;let bx=null,bt=0;for(const[dx,dy]of DIRS){const k=IX(c.x+dx,c.y+dy);const t=L.scent[k];if(t&&t>bt&&passC(c,c.x+dx,c.y+dy)){bt=t;bx=[dx,dy]}}if(bx&&(seasonIdx()===3||SP[c.s].tags.scenter||c.job==='hunt')&&bt>(L.scent[IX(c.x,c.y)]||0)){moveC(c,c.x+bx[0],c.y+bx[1]);return true}if(c.job==='hunt'){stepTo(c,G.p.x,G.p.y);return true}return false}
function allyAct(c,tg){const p=G.p;if(tg&&!isP(tg)){if(dist(c.x,c.y,tg.x,tg.y)<=1){meleeHit(c,tg);return true}if(powers(c,tg))return true;stepTo(c,tg.x,tg.y);return true}if(c.stay)return true;if(dist(c.x,c.y,p.x,p.y)>2){stepTo(c,p.x,p.y);return true}if(chance(.3)){const d=pick(DIRS);if(passC(c,c.x+d[0],c.y+d[1]))moveC(c,c.x+d[0],c.y+d[1])}return true}
function eatAct(c){const d=SP[c.s];if(c.hunger<45||d.tags.undead||d.tags.plant)return false;const se=seasonIdx();const items=(x,y)=>L.items[IX(x,y)];
 if(d.tags.scavenger||d.tags.predator||d.tags.forager||(d.tags.person&&c.hunger>75)){const f=findTile(c,6,(dd,x,y)=>{const its=items(x,y);return its&&its.some(i=>i.k==='corpse'&&!d.tags.person||idef(i).bait||(i.k==='rawmeat'||(d.tags.person&&idef(i).k==='food')))});if(f){if(dist(c.x,c.y,f.x,f.y)>0){stepTo(c,f.x,f.y);if(dist(c.x,c.y,f.x,f.y)>0)return true}const its=items(c.x,c.y);if(its){const it=its.find(i=>i.k==='corpse'||idef(i).bait||i.k==='rawmeat'||idef(i).k==='food');if(it){its.splice(its.indexOf(it),1);if(!its.length)delete L.items[IX(c.x,c.y)];c.hunger=0;if(it.bait||idef(it).bait)baitEffect(c,idef(it).bait);if(it.k==='corpse'&&it.dz==='zombie'){c.dz='zombie';c.dzT=60}if(it.k==='corpse'&&c.s==='rat'&&chance(.1)){c.dz='cough';c.dzT=250}if(visible(c.x,c.y))msg(d.n+' eats.','');return true}}}}
 if(d.tags.herb||d.tags.forager){const f=findTile(c,5,(dd,x,y)=>{return dd.k==='bush'||L.crops[IX(x,y)]||(dd.k==='mushrooms')});if(f){if(hasScarecrow(f.x,f.y))return false;if(dist(c.x,c.y,f.x,f.y)>0){stepTo(c,f.x,f.y);return true}const k=IX(f.x,f.y);if(L.crops[k])delete L.crops[k];else if(tdef(f.x,f.y).k==='bush')tset(f.x,f.y,'bushbare');c.hunger=0;return true}}
 return false}
function baitEffect(c,k){const d=SP[c.s];if(k==='sleep'){c.sleep=60;c.ko=1;if(visible(c.x,c.y))msg(d.n+' takes the drugged bait and drops asleep.','good')}else{c.poison=20;c.poisonBy='p';if(visible(c.x,c.y))msg(d.n+' takes the poisoned meat.','good')}}
function hasScarecrow(x,y){for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(tdef(x+dx,y+dy).k==='scarecrow')return true;return false}
function drinkAct(c){const d=SP[c.s];if(!d.tags.thirsty)return false;const se=seasonIdx();if(!(se===1||G.turn%60<15))return false;const w=findTile(c,12,dd=>dd.water);if(w&&dist(c.x,c.y,w.x,w.y)>1){stepTo(c,w.x,w.y);return true}return false}
function firefight(c){const d=SP[c.s];if(!d.tags.person||c.job!=='town'&&c.job!=='farm'&&c.job!=='patrol')return false;const f=findTile(c,8,(dd,x,y)=>!!L.fire[IX(x,y)]);if(!f)return false;if(dist(c.x,c.y,f.x,f.y)<=1){delete L.fire[IX(f.x,f.y)];DIRS.forEach(([a,b])=>{if(chance(.4))delete L.fire[IX(f.x+a,f.y+b)]});if(visible(c.x,c.y))bark(c,pick(['Water! More water!','Beat it out!','Save the barn!']));return true}stepTo(c,f.x,f.y);return true}
function jobAct(c){const d=SP[c.s],se=seasonIdx(),n=isNight();const j=c.job;
 if(j==='raider'&&c.goal){if(se===3){c.job='patrol';return}if(dist(c.x,c.y,c.goal.x,c.goal.y)>3){stepTo(c,c.goal.x,c.goal.y);return}if(chance(.05)){const f=findTile(c,2,dd=>dd.f&&dd.fuel>=4);if(f){ignite(f.x,f.y,0);bark(c,'Burn it! For the King!')}}wander(c,6);return}
 if(j==='deserter'){if(chance(.3))bark(c,pick(['Please... any food at all.','I can\'t feel my hands.','He\'d kill me for leaving. I don\'t care.']));wander(c,5);return}
 if(j==='town'||j==='farm'){const h=c.homeb||c.home;if(se===3&&chance(.7)&&h){if(dist(c.x,c.y,h.x,h.y)>1)stepTo(c,h.x,h.y);return}if(G.flags.festival&&c.site){const s=G.sites.find(q=>q.name===c.site);if(s&&dist(c.x,c.y,s.x,s.y)>3){stepTo(c,s.x,s.y);return}if(s&&chance(.02))bark(c,'Good harvest! Eat, friend!');wander(c,3);return}
  if(j==='farm'&&(se===0||se===1||se===2)){const f=findTile(c,14,(dd,x,y)=>!!L.crops[IX(x,y)]||dd.k==='soil');if(f){if(dist(c.x,c.y,f.x,f.y)>0){stepTo(c,f.x,f.y);return}const k=IX(f.x,f.y);if(se===2&&L.crops[k]&&L.crops[k].a>=60&&!L.crops[k].o){delete L.crops[k];bark(c,'Good yield this year.')}else if(se===0&&!L.crops[k]&&chance(.1))L.crops[k]={c:pick(['wheat','turnip']),a:0,o:0}}}
  wander(c,6);return}
 if(j==='patrol'||j==='guardpost'){wander(c,6);return}
 if(j==='gate'||j==='post'){if(c.goal){if(dist(c.x,c.y,c.goal.x,c.goal.y)>1)stepTo(c,c.goal.x,c.goal.y);else c.goal=null;return}if(dist(c.x,c.y,c.home.x,c.home.y)>0){stepTo(c,c.home.x,c.home.y);return}if(d.tags.webber&&chance(.04)){const q=pick(DIRS);if(TN[tget(c.x+q[0],c.y+q[1])]==='stonefloor')tset(c.x+q[0],c.y+q[1],'web')}if(c.aegis&&seasonIdx()===3&&chance(.01))bark(c,'...Mira? No. Nobody comes in the snow.');return}
 if(d.tags.webber&&seasonIdx()===2&&chance(.05)){const q=pick(DIRS);if(tdef(c.x+q[0],c.y+q[1]).p&&!tdef(c.x+q[0],c.y+q[1]).water)tset(c.x+q[0],c.y+q[1],'web')}
 if(d.tags.erratic){const q=pick(DIRS);if(passC(c,c.x+q[0],c.y+q[1]))moveC(c,c.x+q[0],c.y+q[1]);return}
 wander(c,9)}
function meleeHit(a,t){const dA=isP(a)?null:SP[a.s];const hit=hitChance(a,t);RT.fxq.push({type:'slash',x:t.x,y:t.y});if(!chance(hit/100)){if(isP(t)||visible(a.x,a.y))msg((isP(a)?'You miss ':dA.n+' misses ')+(isP(t)?'you':SP[t.s].n)+'.');return false}
 let dm;if(isP(a)){const w=idef(a.eq.w);const stv=eff(w.st||'str');dm=(w.d||1)+ri(0,Math.floor(stv/2))-(SP[t.s].ar||0);}else{dm=dA.a+ri(-1,2);if(isP(t)){const ar=G.p.eq.a?idef(G.p.eq.a).ar||0:0;dm-=ar}else dm-=SP[t.s].ar||0;if(a.hidden&&isP(t)){dm*=3;a.hidden=0;msg(dA.n+' strikes from nowhere!','bad')}}
 dm=Math.max(1,dm);if(isP(a)){const w=idef(a.eq.w);if(w.mercy||w.ench==='mercy'){hurt(t,dm,a,'mercy');msg('You batter '+SP[t.s].n+' ('+dm+').');applyEnch(w,t);return true}}
 if(isP(a))msg('You hit '+SP[t.s].n+' for '+dm+'.','');else if(isP(t))msg(dA.n+' hits you for '+dm+'.','bad');else if(visible(a.x,a.y))msg(dA.n+' hits '+SP[t.s].n+'.');
 if(!isP(a)&&(dA.tags.venom)){poisonEnt(t,5)}
 if(!isP(a)&&dA.tags.feverbite&&isP(t)&&chance(.15))infect(t,'marsh');
 if(!isP(a)&&dA.tags.zombiebite){if(isP(t)&&chance(.2)){infect(t,'zombie')}else if(!isP(t)&&!SP[t.s].tags.undead&&!t.aegis&&!t.dz&&chance(.45)){t.dz='zombie';t.dzT=ri(20,40)}}
 if(!isP(a)&&a.dz==='mania'){if(isP(t)&&chance(.08))infect(t,'mania');else if(!isP(t)&&SP[t.s].tags.person&&!t.aegis&&!t.dz&&chance(.25)){t.dz='mania';t.dzT=200}}
 if(!isP(a)&&a.dz==='cough'&&isP(t)&&chance(.05))infect(t,'cough');
 if(!isP(a)&&dA.tags.carrier&&isP(t)&&chance(.06))infect(t,'cough');if(!isP(a)&&SP[a.s].tags.undead&&isP(t)&&a.s==='thirsty'&&chance(.1))infect(t,'mummy');
 if(isP(a)){const w=idef(a.eq.w);applyEnch(w,t);if(w.ench==='leech'){a.hp=Math.min(a.mh,a.hp+Math.ceil(dm/2))}if(!w.quiet&&w.ench!=='silence')noise(a.x,a.y,6,'p')}else noise(a.x,a.y,4);hurt(t,dm,a,'blow');return true}
function applyEnch(w,t){if(isP(t)||t.dead)return;const e=w.ench;if(e==='flame'){t.burning=3;t.fireBy=1}else if(e==='frost'){t.slow=6}else if(e==='venom'){t.poison=6;t.poisonBy='p'}else if(e==='thunder'){shockFrom(t.x,t.y,5,G.p,t)}else if(e==='dread'&&chance(.35)){t.fear=6}}
function hitChance(a,t){let v;if(isP(a)){const w=idef(a.eq.w);const dv=Math.floor(SP[t.s].s/20)-5;v=74+(eff(w.st||'str')-5)*4-dv*2}else{const dg=isP(t)?(eff('agi')-4)*5:0;v=70+(SP[a.s].a-4)*2-dg}if(t.sleep>0||t.stuck>0||t.para>0)v+=40;return clamp(v,10,98)}
function stealFromPlayer(c){const p=G.p;const lootable=p.inv.filter(i=>i!==p.eq.w&&i!==p.eq.a&&!idef(i).noburn&&idef(i).k!=='quest');const ch=.55-eff('sth')*.03;if(!lootable.length||!chance(ch)){if(visible(c.x,c.y))msg(SP[c.s].n+' grabs at your pack and misses.','warn');c.stole=1;return}const it=pick(lootable);if(it.q>1)it.q--;else p.inv.splice(p.inv.indexOf(it),1);c.inv.push(mk(it.k,1));c.stole=1;c.fear=18;msg(SP[c.s].n+' snatches your '+idef(it).n+' and runs!','bad');story(SP[c.s].n+' stole your '+idef(it).n+'.',1)}
function powers(c,t){const d=SP[c.s],dd=dist(c.x,c.y,t.x,t.y);
 // stalkers keep hidden and close in
 if(c.hidden&&isP(t)&&dd>1){const seen=dd<=1||(dd<=3&&chance(eff('int')*.02+.03));if(seen){c.hidden=0;msg('You glimpse a shape in the corner of your eye!','warn')}else{stepTo(c,t.x,t.y);return true}}
 // spells
 if(c.spells&&c.mp>0&&dd<=7&&los(c.x,c.y,t.x,t.y)){if(c.hp<c.mh*.4&&c.spells.includes('heal')&&c.mp>=4){c.mp-=4;c.hp=Math.min(c.mh,c.hp+12);if(visible(c.x,c.y))msg(d.n+' mends their wounds with a word.','warn');return true}
  const opts=c.spells.filter(s=>SPELLS[s]&&c.mp>=SPELLS[s].mp&&s!=='heal');const corpseNear=c.spells.includes('raise')?findTile(c,5,(dd2,x,y)=>L.items[IX(x,y)]&&L.items[IX(x,y)].some(i=>i.k==='corpse')):null;if(corpseNear&&c.mp>=8&&chance(.5)){c.mp-=8;raiseAt(corpseNear.x,corpseNear.y,c);return true}
  const use=opts.filter(s=>s!=='raise');if(use.length&&chance(.55)&&(dd>1||chance(.5))){const s=pick(use);c.mp-=SPELLS[s].mp;castSpell(s,c,t.x,t.y);return true}}
 // guns
 if(c.gun&&c.ammo>0&&!c.reload&&dd>=2&&dd<=(c.gun==='musket'?9:5)&&los(c.x,c.y,t.x,t.y)){c.ammo--;c.reload=2;const wet=(raining()&&outdoors(c.x,c.y));if(wet&&chance(.3)){if(visible(c.x,c.y))msg(d.n+"'s powder is damp. The gun fizzles.",'good');return true}noise(c.x,c.y,14);RT.fxq.push({type:'shot',x:c.x,y:c.y,x2:t.x,y2:t.y});if(L.id==='world'&&regionAt(c.x,c.y)===RM&&seasonIdx()===3&&chance(.25))avalanche(c.x,c.y);const hit=isP(t)?clamp(55-(eff('agi')-4)*5,15,85):60;if(chance(hit/100)){const dm=(c.gun==='musket'?10:6)+ri(-2,2)-(isP(t)&&G.p.eq.a?(idef(G.p.eq.a).ar||0):0);if(visible(c.x,c.y)||isP(t))msg(d.n+' fires a '+c.gun+(isP(t)?' and hits you for '+dm+'.':' and hits '+SP[t.s].n+'.'),isP(t)?'bad':'');hurt(t,Math.max(1,dm),c,'gunshot')}else if(visible(c.x,c.y))msg(d.n+' fires a '+c.gun+' and misses.','warn');return true}
 if(c.bow&&dd>=2&&dd<=6&&los(c.x,c.y,t.x,t.y)&&chance(.65)){RT.fxq.push({type:'shot',x:c.x,y:c.y,x2:t.x,y2:t.y});if(chance(.6)){if(visible(c.x,c.y)||isP(t))msg(d.n+"'s dart"+(isP(t)?' hits you.':' hits '+SP[t.s].n+'.'),isP(t)?'bad':'');hurt(t,3+ri(0,2),c,'dart');if(chance(.3))poisonEnt(t,3)}return true}
 // bombs
 const bomb=c.inv.find(i=>idef(i).effect&&idef(i).effect!=='noise'&&idef(i).k==='throw');if(bomb&&dd>=2&&dd<=5&&chance(.4)&&los(c.x,c.y,t.x,t.y)){const e=idef(bomb).effect;bomb.q=(bomb.q||1)-1;if(bomb.q<=0)c.inv.splice(c.inv.indexOf(bomb),1);if(visible(c.x,c.y)||isP(t))msg(d.n+' hurls a '+idef(bomb).n.toLowerCase()+'!','warn');throwEffect(e,t.x,t.y,c);return true}
 if(c.hidden===0&&SP[c.s].kit&&SP[c.s].kit.stealth&&c.hp<c.mh*.5){const sm=c.inv.find(i=>i.k==='smokebomb');if(sm){c.inv.splice(c.inv.indexOf(sm),1);throwEffect('smoke',c.x,c.y,c);c.hidden=1;c.fear=6;if(visible(c.x,c.y))msg(d.n+' vanishes in smoke.','warn');return true}}
 return false}
function throwEffect(e,x,y,src){const owner=src&&isP(src)?G.p:null;RT.fxq.push({type:'burst',x,y,e});if(e==='noise'){noise(x,y,9);if(visible(x,y))msg('The stone clatters.','');return}if(e==='fire'){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(!ignite(nx,ny,owner?1:0)&&tdef(nx,ny).p&&!tdef(nx,ny).water&&!L.fire[IX(nx,ny)]){L.fire[IX(nx,ny)]={t:3,o:owner?1:0}}const c=at(nx,ny);if(c&&!isP(c)){c.burning=3;c.fireBy=owner?1:0}}noise(x,y,8);return}if(e==='oil'){for(const[dx,dy]of[[0,0]].concat(DIRS)){const nx=x+dx,ny=y+dy;const d=tdef(nx,ny);if(d.p&&!d.water)tset(nx,ny,'oil')}return}if(e==='smoke'){for(let i=0;i<9;i++)addGas(x+ri(-1,1),y+ri(-1,1),'smoke',6);noise(x,y,4);return}if(e==='sleepgas'){for(let i=0;i<9;i++)addGas(x+ri(-1,1),y+ri(-1,1),'sleepgas',5);return}if(e==='poison'){for(let i=0;i<9;i++){addGas(x+ri(-1,1),y+ri(-1,1),'poison',5)}return}if(e==='boom'){explode(x,y,3,owner);return}}
