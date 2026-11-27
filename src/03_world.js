// ===== WORLD SETUP & TERRAIN =====
const ARCH={temperate:{clim:0,wet:0,mtn:1,sp:['blossom','fungal']},boreal:{clim:-.22,wet:.05,mtn:1,sp:['crystal']},arid:{clim:.2,wet:-.22,mtn:.9,sp:['saltflat','badlands']},tropical:{clim:.25,wet:.2,mtn:.8,sp:['fungal','bamboo']},volcanic:{clim:.05,wet:-.05,mtn:1.3,sp:['volcanic']},highland:{clim:-.05,wet:.08,mtn:1.4,sp:['crystal','blossom']},steppe:{clim:.05,wet:-.12,mtn:.7,sp:['badlands']},frozen:{clim:-.38,wet:0,mtn:1,sp:['crystal']},marsh:{clim:.08,wet:.3,mtn:.6,sp:['fungal']}};
const DEFOPT={scale:'standard',conts:8,sea:0,temp:0,moist:0,rivers:1,islands:1,monsters:1,horde:1,nations:2,history:200,ruins:1,wildlife:1,start:'random',kingdist:'far'};
function setupWorld(seed,opt){opt=Object.assign({},DEFOPT,opt||{});CELL=opt.scale==='colossal'?640:opt.scale==='vast'?480:320;G.F=(CELL/320)**2;const n=clamp(opt.conts|0,6,10);const cols=Math.ceil(n/2),rows=2;
 G.opt=opt;G.seed=seed;G.ws=seed%99991;G.cols=cols;G.rows=rows;G.W=cols*CELL;G.H=rows*CELL;G.conts=[];
 withRng(seed*7+1,()=>{const top=shuffle(['frozen','boreal','highland','temperate','steppe','marsh']),bot=shuffle(['arid','tropical','temperate','marsh','steppe','highland']);const archs=[];for(let i=0;i<cols*rows;i++){const cx0=(i%cols)*CELL,cy0=Math.floor(i/cols)*CELL;const exists=i<n||false;const real=i<n;const row=Math.floor(i/cols);let a=row===0?top[(i%cols)%top.length]:bot[(i%cols)%bot.length];
   const c={id:i,cx0,cy0,x:cx0+CELL/2+ri(-22,22),y:cy0+CELL/2+ri(-22,22),rx:Math.round(ri(112,140)*CELL/320),ry:Math.round(ri(108,136)*CELL/320),arch:a,real,name:'',mtn:ARCH[a].mtn,clim:ARCH[a].clim+(R()-.5)*.08,wet:ARCH[a].wet+(R()-.5)*.08,sp:pick(ARCH[a].sp)};G.conts.push(c)}
  const reals=G.conts.filter(c=>c.real);// pick king & start
  const north=reals.filter(c=>c.cy0===0);G.kingCont=(pick(north.length?north:reals)).id;const cands=reals.filter(c=>c.id!==G.kingCont&&c.cy0>0);const kc=G.conts[G.kingCont];let st=pick(cands.length?cands:reals.filter(c=>c.id!==G.kingCont));if(opt.kingdist==='far'){st=cands.sort((a,b)=>dist(b.x,b.y,kc.x,kc.y)-dist(a.x,a.y,kc.x,kc.y))[0]||st}G.startCont=st.id;G.conts[G.kingCont].arch='volcanic';G.conts[G.kingCont].mtn=1.4;
  G.conts.forEach(c=>{c.name=contName(c)})});}
function contName(c){const a={temperate:['Hollowmere','Greensward','Ellandor','Marrowfield'],boreal:['Kjelvast','the Pinewild','Nordmark','Frostholt'],arid:['Saharra','the Sunscorch','Qasrimar','Dunemoor'],tropical:['Verdantia','Xochitl Reach','the Emerald Coil','Tlalocan'],volcanic:['the Cinder Throne','Ashenreach','Vorgath\'s Spine','Embermark'],highland:['the Highcrown','Cairnmoor','Tor Albainn','Heathspur'],steppe:['the Grass Sea','Khaganate Plains','Ulanmor','Windmark'],frozen:['the White Waste','Iskaldur','Rimehold','the Shiver'],marsh:['the Drowned Coast','Fenmark','Mirewater','Bogland']}[c.arch];return pick(a)}
function contAt(x,y){if(x<0||y<0||x>=G.W||y>=G.H)return null;const c=G.conts[Math.floor(y/CELL)*G.cols+Math.floor(x/CELL)];return c&&c.real?c:null}
function landness(c,x,y){const dx=(x-c.x)/c.rx,dy=(y-c.y)/c.ry;const d=Math.sqrt(dx*dx+dy*dy);const n=fbm(x/(44*Math.sqrt(G.F)),y/(44*Math.sqrt(G.F)),G.ws+c.id*7),n2=fbm(x/14,y/14,G.ws+c.id*11+3);let v=1-d+(n-.5)*.85+(n2-.5)*.2-G.opt.sea;const b=Math.min(x-c.cx0,c.cx0+CELL-1-x,y-c.cy0,c.cy0+CELL-1-y);if(b<28)v-=(28-b)*.04;return v}
const LANDT=.15;
function climate(c,x,y,v){const lat=y/G.H;let t=.25+lat*.66+c.clim+G.opt.temp*1.8+(fbm(x/95,y/95,G.ws+21)-.5)*.32;let m=fbm(x/78,y/78,G.ws+31)*1.05-.02+c.wet+G.opt.moist+(v<.32?.06:0);const e=(v-LANDT)*1.05+ridge(x/62,y/62,G.ws+11)*.6*c.mtn-.22;t-=Math.max(0,e-.85)*.55;return{t,m,e}}
// returns biome<<8 | tile
function terrainAt(x,y){if(x<0||y<0||x>=G.W||y>=G.H)return(BI.deep<<8)|TID.sea;const c=contAt(x,y);const ws=G.ws;const h=hashn(x,y,ws+3);
 let v=c?landness(c,x,y):-1;
 if(v<LANDT&&c){const iv=fbm(x/11,y/11,ws+99);const th=.82-.05*(G.opt.islands-1);if(iv>th&&v>-.45)v=LANDT+.02+(iv-th)*.9}
 if(!c||v<LANDT){const lat=y/G.H;const warm=lat>.55;if(v>LANDT-.07){if(warm&&fbm(x/9,y/9,ws+77)>.62)return(BI.reef<<8)|TID.reef;return(BI.reef<<8)|TID.shoal}if(v>-.18)return(BI.sea<<8)|TID.ocean;return(BI.deep<<8)|TID.sea}
 const{t,m,e}=climate(c,x,y,v);let b;
 const coastBand=v<LANDT+.06;
 if(coastBand){if(t>.72&&m>.6)b=BI.mangrove;else if(t<.14)b=BI.glacier;else if(t<.28)b=BI.tundra;else b=BI.beach}
 else if(e>1.12)b=(c.arch==='volcanic'&&ridge(x/30,y/30,ws+15)>.7)?BI.volcanic:BI.mountain;
 else if(e>.92&&m>.45&&t<.72&&t>.25)b=BI.highland;
 else{const pk=fbm(x/48,y/48,ws+200+c.id);if(pk>.73&&v>.3)b=BI[c.sp];
  else if(t<.13)b=e>.5?BI.glacier:BI.tundra;else if(t<.27)b=m<.4?BI.tundra:BI.taiga;else if(t<.42)b=m>.58?BI.taiga:(m<.3?BI.steppe:BI.birch);
  else if(t<.62)b=m<.26?BI.steppe:m<.48?BI.grass:m<.64?BI.forest:m<.8?(e>.45?BI.darkwood:BI.forest):BI.swamp;
  else if(t<.78)b=m<.24?BI.badlands:m<.42?BI.savanna:m<.6?BI.grass:m<.76?BI.bamboo:BI.swamp;
  else b=m<.2?(e<.3?BI.saltflat:BI.desert):m<.34?BI.desert:m<.48?BI.savanna:m<.74?BI.jungle:(fbm(x/20,y/20,ws+88)>.55?BI.bamboo:BI.jungle)}
 if(b===undefined)b=BI.grass;
 // water features
 const bk=BIOMES[b][0];
 if(bk!=='glacier'&&bk!=='saltflat'&&bk!=='volcanic'&&!coastBand&&e<1.05){const rv=Math.abs(fbm2(x/54,y/54,ws+41)-.5);let thr=.0105*G.opt.rivers*(bk==='desert'||bk==='badlands'?.45:1);if(rv<thr)return(b<<8)|(rv<thr*.42?TID.deep:TID.shallow);
  const lk=fbm(x/30,y/30,ws+51);if(lk<.17&&v>.3&&e<.95){if(bk==='desert'||bk==='savanna'||bk==='badlands'){if(lk<.11)return(b<<8)|TID.oasis}else return(b<<8)|(lk<.13?TID.deep:TID.shallow)}}
 return(b<<8)|tileFor(bk,x,y,h,e,t,m)}
function tileFor(bk,x,y,h,e,t,m){const ws=G.ws;const dn=fbm(x/7,y/7,ws+61);const T=TID;
 switch(bk){
 case 'beach':return h<.01?T.bones:h<.03&&t>.6?T.palm:T.sand;
 case 'grass':if(dn>.67)return h<.85?T.tree:T.grass;if(dn>.6&&h<.5)return T.tall;if(fbm(x/5,y/5,ws+71)>.76)return T.rock;return h<.012?T.bush:h<.026?T.flowers:h<.032?T.herb:h<.036?T.tree:T.grass;
 case 'forest':if(dn>.44)return h<.88?(h<.12?T.birch:T.tree):T.grass;return h<.03?T.bush:h<.05?T.herb:h<.065?T.mushrooms:h<.1?T.tall:T.grass;
 case 'birch':if(dn>.46)return h<.85?T.birch:T.grass;return h<.04?T.flowers:h<.06?T.herb:h<.09?T.tall:T.grass;
 case 'darkwood':if(dn>.36)return h<.9?(h<.25?T.tree:T.darktree):T.mushrooms;return h<.06?T.mushrooms:h<.09?T.herb:h<.12?T.bones:T.grass;
 case 'jungle':if(dn>.46)return h<.62?T.palm:h<.85?T.vines:T.grass;if(h<.25)return T.vines;if(h<.42)return T.palm;if(h<.46)return T.herb;if(h>.994)return T.hive;if(h<.48)return T.bush;return T.grass;
 case 'bamboo':return dn>.4?(h<.8?T.bamboo:T.grass):(h<.06?T.herb:h<.15?T.tall:T.grass);
 case 'mangrove':return dn>.5?T.mangrove:h<.4?T.shallow:h<.6?T.mud:T.reeds;
 case 'swamp':{const bg=fbm(x/5,y/5,ws+81);if(bg>.62)return T.shallow;if(bg<.3&&h<.3)return T.tar;return h<.3?T.bog:h<.5?T.reeds:h<.58?T.mud:h<.62?T.stump:h<.64?T.herb:T.grass}
 case 'savanna':if(dn>.72)return h<.6?T.acacia:T.tall;return h<.015?T.acacia:h<.12?T.tall:h<.13?T.rock:T.savgrass;
 case 'steppe':return h<.06?T.tall:h<.065?T.rock:h<.07?T.herb:T.steppegrass;
 case 'desert':{if(fbm(x/5,y/5,ws+91)>.75)return T.rock;return h<.018?T.cactus:fbm(x/9,y/9,ws+92)>.62?T.dune:h<.022?T.bones:T.sand}
 case 'badlands':{const r=fbm(x/6,y/6,ws+93);return r>.64?T.redrock:h<.01?T.cactus:h<.015?T.bones:T.mesa}
 case 'saltflat':return h<.005?T.bones:fbm(x/4,y/4,ws+94)>.7?T.cracked:T.salt;
 case 'tundra':return h<.02?T.rock:h<.035?T.pine:h<.05?T.herb:h<.5?T.moss:T.snow;
 case 'taiga':return dn>.42?(h<.88?T.pine:T.snow):h<.04?T.bush:h<.06?T.herb:h<.5?T.moss:T.snow;
 case 'glacier':return fbm(x/6,y/6,ws+95)>.7?T.rock:h<.4?T.glacier:T.snow;
 case 'mountain':{const rk=fbm(x/5,y/5,ws+81);if(rk>.52)return T.rock;if(t<.32&&h<.5)return T.snow;return dn>.6&&h<.6?T.pine:h<.015?T.herb:T.scree}
 case 'highland':return fbm(x/5,y/5,ws+96)>.7?T.rock:h<.4?T.heather:h<.42?T.herb:h<.47?T.scree:T.grass;
 case 'volcanic':{const r=ridge(x/18,y/18,ws+97);if(r>.94)return T.lava;if(r>.86)return T.obsidian;return h<.01?T.vent:h<.4?T.basalt:T.ashground}
 case 'fungal':return dn>.45?(h<.75?T.shroom:T.mushrooms):h<.2?T.mushrooms:h<.3?T.moss:T.mud;
 case 'blossom':return dn>.55?(h<.8?T.blossom:T.flowers):h<.2?T.flowers:h<.23?T.herb:h<.24?T.hive:T.grass;
 case 'crystal':return fbm(x/6,y/6,ws+98)>.66?T.crystal:h<.1?T.shard:h<.12?T.rock:T.salt;
 }return T.grass}
function biomeAt(x,y){return terrainAt(x,y)>>8}
function oceanAt(x,y){const t=TN[terrainAt(x,y)&255];return TDEF[t].ocean||TDEF[t].swim}
// ===== NAMES =====
const CULT={
 north:{a:['Hal','Sig','Thor','Eir','Brin','Ulf','Ragn','Sol','Kjel','Ast','Bjor','Frey','Gunn','Ing'],b:['vard','rid','mund','a','dis','gar','hild','borg','ny','ulf','ar','e','grim'],p:['Kjel','Ulf','Frost','Rav','Hrim','Bjarn','Skog','Nor'],s:['heim','vik','stad','borg','fjord','by','holt','ness']},
 west:{a:['Al','Bran','Cor','Ed','Gal','Hal','Mar','Ros','Tam','Wil','Ced','Ela','Gwen','Mor'],b:['ric','win','a','wyn','eth','ard','en','ly','mund','a','ys'],p:['Ash','Oak','Wren','Marrow','Thorn','Hart','Low','Brook','Stone','Elm'],s:['ford','ton','wick','ham','field','brook','dale','mere','bury','hollow']},
 south:{a:['Ash','Far','Kas','Nas','Qad','Ra','Sa','Tar','Zay','Am','Lay','Yus','Mir','Hak'],b:['ir','im','a','id','ra','an','ah','el','in','ul'],p:['Qasr','Wadi','Ain','Bir','Dar','Ras','Tell','Jab'],s:['ar','im','an','ah','ul','ira','esh','at']},
 jungle:{a:['Itz','Xo','Tla','Ca','Mic','Yax','Che','Ko','Ix','Tzi'],b:['tli','pan','co','la','mi','ka','hual','tzin','na','xo'],p:['Tla','Xo','Itz','Yax','Che','Cuauh'],s:['pan','tlan','co','huac','tepec','kal']},
 steppe:{a:['Ba','Te','Ar','Ku','Ög','To','Bat','Jo','Su','Al'],b:['tu','gai','dar','ran','mur','khan','sar','tai','gul','lan'],p:['Kara','Ak','Kök','Altan','Sar','Bor'],s:['kent','khan','or','balyk','tash','yurt']},
 east:{a:['Ren','Kai','Shi','Hana','Mei','Tao','Lin','Jun','Sora','Yu'],b:['ko','ri','na','shi','ji','ming','ro','to','e','ka'],p:['Hana','Kumo','Yama','Tsuki','Kiri','Mizu'],s:['mura','zaki','jima','saka','oka','dera']},
 horde:{a:['Gor','Kral','Vrak','Durg','Skar','Morg','Thrag','Ulg','Brak','Zhar'],b:['ash','uk','oth','gar','ak','rul','dun','ax','og'],p:['Skull','Bone','Black','Red','Ash','Iron','Blood','Grim'],s:['hold','camp','pit','spire','fang','maw','stake','rock']}};
function cultFor(c){return{temperate:'west',boreal:'north',frozen:'north',arid:'south',tropical:'jungle',volcanic:'horde',highland:'west',steppe:'steppe',marsh:'west'}[c.arch]||'west'}
function personName(cu){const C=CULT[cu]||CULT.west;return pick(C.a)+pick(C.b)}
function placeName(cu){const C=CULT[cu]||CULT.west;return pick(C.p)+pick(C.s)}
const NTRAITS={horse:{n:'Horse Lords',d:'Cavalry everywhere; horses are cheap.'},elephant:{n:'Elephant Kings',d:'Their armies ride war elephants.'},sea:{n:'Seafarers',d:'Fine longships and many ports.'},merchant:{n:'Mercantile',d:'Better prices and many caravans.'},militarist:{n:'Militarist',d:'Large standing armies of soldiers and knights.'},pious:{n:'Pious',d:'Temples and healers; they hate necromancy.'},scholar:{n:'Scholarly',d:'Libraries, mages, and scrolls for sale.'},isolation:{n:'Isolationist',d:'Wary of outsiders until you prove yourself.'},hospitable:{n:'Hospitable',d:'Free beds and warm welcomes.'},hunters:{n:'Hunters',d:'Bowmen, trappers, and pelts.'},gunpowder:{n:'Gunpowder',d:'Muskets and cannon are common.'},herbal:{n:'Herbalists',d:'Every hut has a remedy.'}};
const NFORMS=[['Kingdom','King','Queen'],['Duchy','Duke','Duchess'],['Republic','Consul','Consul'],['Khaganate','Khan','Khatun'],['Sultanate','Sultan','Sultana'],['Theocracy','High Priest','High Priestess'],['League','Speaker','Speaker'],['Jarldom','Jarl','Jarl']];
const SUBTRAITS={proud:{n:'Proud',hint:'He accepts any formal duel and keeps his word if beaten, even without killing.'},greedy:{n:'Greedy',hint:'Everything he owns has a price, the shard included. Bring a fortune.'},paranoid:{n:'Paranoid',hint:'He trusts no one. Forged orders could convince him his own captains plot against him.'},devout:{n:'Devout',hint:'He prays to old gods. A holy relic from a shrine would move him.'},starving:{n:'Besieged by hunger',hint:'His citadel is starving. Whoever feeds them could name their price.'},coward:{n:'Cowardly',hint:'He fears strength. Arrive with an army or a fearsome reputation.'},scholar:{n:'Riddle-mad',hint:'He loves riddles. Beat three in a row and he pays any wager.'},drunkard:{n:'Drunkard',hint:'He is drunk most nights. A sleeping draught in his mead would do the rest.'},sick:{n:'Wasting sick',hint:'A sickness eats at him. A cleansing tonic could earn his gratitude.'},rebel:{n:'Secret rebel',hint:'He hates Vorgath. If a nation besieged him, he might yield rather than fight.'}};
// ===== WORLDGEN =====
function genWorld(){const t0=Date.now();G.sites=[];G.nations=[];G.subkings={};G.history=[];G.roadSet=new Set();G.roadChunk=new Map();G.edges=[];G.wonders=[];
 withRng(G.seed*13+5,()=>{G.conts.filter(c=>c.real).forEach(c=>genContinent(c));genHistory();G.sites.forEach((s,i)=>s.id=i);});
 withRng(G.seed*17+9,()=>{G.conts.filter(c=>c.real).forEach(c=>genRoads(c))});
 G.genMs=Date.now()-t0}
function sampleCont(c,step){const out=[];for(let y=c.cy0+18;y<c.cy0+CELL-18;y+=step)for(let x=c.cx0+18;x<c.cx0+CELL-18;x+=step){const tb=terrainAt(x,y),t=TN[tb&255],b=tb>>8;const v=landness(c,x,y);if(v<LANDT)continue;const d=TDEF[t];out.push({x,y,b,v,w:d.water||d.lava,coast:v<LANDT+.09})}return out}
function genContinent(c){const cu=cultFor(c);c.cult=cu;const C=sampleCont(c,Math.round(5*Math.sqrt(G.F)));const F=G.F,big=CELL>320;const used=[];const king=c.id===G.kingCont;
 const ok=(p,md)=>!p.w&&!used.some(s=>dist(s.x,s.y,p.x,p.y)<md);
 const place=(type,filt,md,extra)=>{const cand=shuffle(C.filter(p=>ok(p,md)&&(!filt||filt(p))));if(!cand.length)return null;const p=cand[0];const s=Object.assign({type,x:p.x,y:p.y,cont:c.id,b:p.b,known:0,fac:'free',name:'',r:10},extra||{});used.push(s);G.sites.push(s);return s};
 const interior=p=>p.v>.3&&!['mountain','glacier','volcanic'].includes(BIOMES[p.b][0]);const coastal=p=>p.coast&&nearOcean(p.x,p.y,6);
 const far=(cands,from)=>cands.sort((a,b)=>Math.min(...from.map(f=>dist(b.x,b.y,f.x,f.y)))-Math.min(...from.map(f=>dist(a.x,a.y,f.x,f.y))))[0];
 if(king){const k=place('keep',p=>p.v>.35,30,{fac:'horde',name:"The King's Keep",r:14});if(k)k.quest='king';
  for(let i=0;i<4;i++)place('hvillage',interior,26,{fac:'horde',name:placeName('horde'),r:11});for(let i=0;i<3;i++)place('hfort',null,28,{fac:'horde',name:placeName('horde'),r:10});for(let i=0;i<2;i++)place('hport',coastal,30,{fac:'horde',name:placeName('horde')+' Haven',r:10});place('rebels',interior,22,{fac:'free',name:'The Last Candle',r:7});
  place('troll',p=>BIOMES[p.b][0]==='mountain'||p.v>.4,20,{fac:'troll',name:'Troll Pass',r:3});}
 else{const nN=clamp(Math.round((G.opt.nations+(R()-.4))*(big?1.5:1)),1,big?5:3);const nats=[];for(let i=0;i<nN;i++){const cap=place('town',interior,40);if(!cap)break;const form=pick(NFORMS);const tr=shuffle(Object.keys(NTRAITS)).slice(0,2);if(['steppe'].includes(c.arch)&&!tr.includes('horse'))tr[0]='horse';if(c.arch==='tropical'&&i===0&&!tr.includes('elephant'))tr[1]='elephant';const nm=placeName(cu);const n={id:G.nations.length,name:form[0]+' of '+nm,short:nm,form:form[0],cont:c.id,traits:tr,cult:cu,color:pick(['#4a7ac0','#3a9a5a','#c08a2a','#8a4ac0','#2a9aa0','#c04a6a','#6a8a2a','#a05a2a']),capital:null,leader:null,rel:chance(.25)?'vassal':'war',strength:ri(70,130),morale:100};const gender=chance(.5);n.leader={name:personName(cu),title:gender?form[1]:form[2]};n.capitalName=nm;cap.name=nm;cap.nation=n.id;cap.capital=1;cap.r=big&&i===0?34:big?26:20;if(cap.r>=34)cap.mega=1;n.capital=G.sites.length-1;G.nations.push(n);nats.push(n)}
  nats.forEach(n=>{const cap=G.sites[n.capital];const near=p=>dist(p.x,p.y,cap.x,cap.y)<120*Math.sqrt(F);for(let i=0;i<Math.round(ri(3,5)*F*.8);i++){const v=place('village',p=>interior(p)&&near(p),22,{nation:n.id,r:12});if(v)v.name=placeName(cu)}for(let i=0;i<Math.round(ri(1,2)*Math.sqrt(F));i++){const f=place('fort',p=>near(p)&&!p.w,28,{nation:n.id,r:10});if(f)f.name='Fort '+placeName(cu)}const pt=place('port',p=>coastal(p)&&near(p),26,{nation:n.id,r:12});if(pt)pt.name=placeName(cu)+(n.traits.includes('sea')?' Harbor':'')});
  if(!G.sites.some(s=>s.cont===c.id&&s.type==='port')){const pt=place('port',coastal,20,{r:12});if(pt)pt.name=placeName(cu)}
  // Horde presence
  const capsHere=nats.map(n=>G.sites[n.capital]);const citC=C.filter(p=>ok(p,40)&&p.v>.3&&!p.w);const cp=capsHere.length?far(citC,capsHere):citC[0];if(cp){const s={type:'citadel',x:cp.x,y:cp.y,cont:c.id,b:cp.b,known:0,fac:'horde',name:placeName('horde'),r:18};used.push(s);G.sites.push(s);const tr=pickSubTrait();G.subkings[c.id]={name:personName('horde'),title:pick(['Warlord','Iron Jarl','Bone Prince','Blood Khan','Ash Satrap']),trait:tr,site:G.sites.length-1,alive:1,shard:1};s.subking=c.id}
  const hn=Math.round(ri(2,3)*G.opt.horde*Math.sqrt(F));for(let i=0;i<hn;i++)place('hvillage',interior,24,{fac:'horde',name:placeName('horde'),r:11});for(let i=0;i<Math.round(ri(1,2)*G.opt.horde);i++)place('hfort',null,26,{fac:'horde',name:placeName('horde'),r:10});if(chance(.8))place('hport',coastal,24,{fac:'horde',name:placeName('horde')+' Haven',r:10});
  for(let i=0;i<ri(1,2);i++)place('bandits',interior,20,{fac:'bandit',name:pick(['Cutthroat Camp','Red Hand Camp','The Rat\'s Nest','Gallows Camp']),r:7});
  place('witch',interior,20,{name:'Witch\'s hut',r:4});place('hermit',null,18,{name:'Hermit\'s shack',r:3});place('goblins',null,20,{fac:'goblin',name:'Goblin Market',r:7});
  for(let i=0;i<2;i++)place('shrine',null,18,{name:'Shrine of '+pick(['the Dawn','Still Water','the Hunter','the Mother','Old Bones','the Tide','Embers']),r:4});
  if(C.some(p=>['desert','savanna','badlands','saltflat'].includes(BIOMES[p.b][0])))place('nomads',p=>['desert','savanna','badlands','saltflat'].includes(BIOMES[p.b][0]),22,{fac:'nomad',name:'Nomad camp',r:8});
  if(C.some(p=>['jungle','bamboo','mangrove'].includes(BIOMES[p.b][0])))place('hunters',p=>['jungle','bamboo','mangrove'].includes(BIOMES[p.b][0]),22,{fac:'hunter',name:'Hunter camp',r:7});
  for(let i=0;i<Math.round(ri(1,2)*G.opt.ruins);i++)place('ruin',null,16,{name:'Ruins of '+placeName(cu),r:6});
  place('tomb',p=>p.v>.3,18,{name:'Tomb of '+personName(pick(['south','west','north'])),r:4,fac:'undead'});}
 for(let i=0;i<Math.round(ri(2,3)*G.opt.monsters*Math.sqrt(F));i++){const s=place('lair',null,18,{r:4,fac:'beast'});if(s){const rl=ROAMERS[BIOMES[s.b][0]]||['ogre'];s.monster=pick(rl);s.name=cap(SP[s.monster].n)+' lair'}}
 for(let i=0;i<Math.round(ri(6,8)*F);i++)place('cave',null,14,{name:'Cave',r:1});
 if(c.arch==='frozen'||c.arch==='volcanic'||c.arch==='boreal')place('springs',null,14,{name:'Hot springs',r:3});
 if(chance(.75)||c.id===G.startCont)place('vault',p=>p.v>.28,20,{name:'Precursor Vault',r:5});
 if(chance(.4))place('vlair',p=>p.v>.3,24,{name:'Castle '+placeName(cu),r:9,fac:'undead'});
 if(!G.dragonDone&&(c.arch==='volcanic'&&!king||c.arch==='highland')){const s=place('lair',p=>['mountain','volcanic','highland'].includes(BIOMES[p.b][0]),20,{r:5,fac:'beast',monster:'dragon',name:'The Wyrm\'s Roost'});if(s)G.dragonDone=1}
 if(!king&&c.id===G.startCont){/* ensure hermit lore exists; start village */}
 c.sitesDone=1}
function pickSubTrait(){const used=Object.values(G.subkings).map(s=>s.trait);const pool=Object.keys(SUBTRAITS).filter(t=>!used.includes(t));return pick(pool.length?pool:Object.keys(SUBTRAITS))}
function nearOcean(x,y,r){for(let dy=-r;dy<=r;dy+=2)for(let dx=-r;dx<=r;dx+=2){const t=TN[terrainAt(x+dx,y+dy)&255];if(TDEF[t].ocean)return true}return false}
function seaAnchor(s){if(s._anchor!==undefined)return s._anchor;let best=null,bd=1e9;for(let r=1;r<20&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const t=TN[terrainAt(s.x+dx,s.y+dy)&255];if(TDEF[t].ocean&&TDEF[t].swim){const d=dx*dx+dy*dy;if(d<bd){bd=d;best={x:s.x+dx,y:s.y+dy}}}}s._anchor=best;return best}
// ===== ROADS =====
function genRoads(c){const S=G.sites.filter(s=>s.cont===c.id&&!['cave','lair','springs','troll','vlair'].includes(s.type));if(S.length<2)return;const g=4;const gx0=c.cx0,gy0=c.cy0,GW=CELL/g;const cost=new Float32Array(GW*GW);for(let j=0;j<GW;j++)for(let i=0;i<GW;i++){const x=gx0+i*g+2,y=gy0+j*g+2;const tb=terrainAt(x,y),t=TN[tb&255],b=BIOMES[tb>>8][0];const d=TDEF[t];let k=1;if(d.ocean)k=200;else if(d.lava)k=300;else if(d.water)k=d.swim?9:5;else if(b==='mountain'||b==='glacier')k=t==='rock'?14:7;else if(['jungle','swamp','mangrove','darkwood','bamboo'].includes(b))k=2.2;else if(d.o)k=1.8;cost[j*GW+i]=k}
 const cell=s=>({i:clamp(Math.floor((s.x-gx0)/g),0,GW-1),j:clamp(Math.floor((s.y-gy0)/g),0,GW-1)});
 const astar=(a,b)=>{const N=GW*GW,dd=new Float32Array(N).fill(1e9),pv=new Int32Array(N).fill(-1);const st=a.j*GW+a.i,go=b.j*GW+b.i;dd[st]=0;const heap=[[0,st]];const push=(p,n)=>{heap.push([p,n]);let i=heap.length-1;while(i>0){const q=(i-1)>>1;if(heap[q][0]<=heap[i][0])break;[heap[q],heap[i]]=[heap[i],heap[q]];i=q}};const pop=()=>{const r=heap[0],l=heap.pop();if(heap.length){heap[0]=l;let i=0;for(;;){const a2=2*i+1,b2=a2+1;let m=i;if(a2<heap.length&&heap[a2][0]<heap[m][0])m=a2;if(b2<heap.length&&heap[b2][0]<heap[m][0])m=b2;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return r};const cl=new Uint8Array(N);let it=0;while(heap.length&&it++<80000){const[p,u]=pop();if(u===go)break;if(cl[u])continue;cl[u]=1;const ux=u%GW,uy=(u/GW)|0;for(let k=0;k<8;k++){const nx=ux+DIRS[k][0],ny=uy+DIRS[k][1];if(nx<0||ny<0||nx>=GW||ny>=GW)continue;const v=ny*GW+nx;const nc=dd[u]+cost[v]*(k>3?1.41:1)+(G.roadCoarse&&G.roadCoarse.has(c.id*1e6+v)?-0.6:0);if(nc<dd[v]){dd[v]=Math.max(0,nc);pv[v]=u;push(dd[v]+Math.hypot(nx-b.i,ny-b.j),v)}}}if(pv[go]<0&&go!==st)return null;const out=[];let u=go;while(u!==-1){out.push(u);u=pv[u]}return out.reverse()};
 // edges: MST + nearest extra
 const n=S.length,inT=[0],edges=[];const dm=(a,b)=>Math.hypot(S[a].x-S[b].x,S[a].y-S[b].y);while(inT.length<n){let best=null;for(const a of inT)for(let b=0;b<n;b++){if(inT.includes(b))continue;const d=dm(a,b);if(!best||d<best[2])best=[a,b,d]}inT.push(best[1]);edges.push(best)}for(let a=0;a<n;a++){const near=[...Array(n).keys()].filter(b=>b!==a).sort((p,q)=>dm(a,p)-dm(a,q))[1];if(near!==undefined&&!edges.some(e=>(e[0]===a&&e[1]===near)||(e[1]===a&&e[0]===near))&&chance(.5))edges.push([a,near,dm(a,near)])}
 G.roadCoarse=G.roadCoarse||new Set();
 for(const[a,b]of edges){const sa=S[a],sb=S[b];const p=astar(cell(sa),cell(sb));if(!p){G._fail=(G._fail||0)+1;continue}p.forEach(v=>G.roadCoarse.add(c.id*1e6+v));const pts=p.map(v=>({x:gx0+(v%GW)*g+2,y:gy0+((v/GW)|0)*g+2}));pts[0]={x:sa.x,y:sa.y};pts[pts.length-1]={x:sb.x,y:sb.y};const tiles=[];for(let i=1;i<pts.length;i++)line(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y,(x,y)=>{tiles.push(x,y);addRoad(x,y)});G.edges.push({a:sa.id,b:sb.id,len:p.length*g,pts})}}
function addRoad(x,y){const k=y*G.W+x;if(G.roadSet.has(k))return;G.roadSet.add(k);const ck=chunkKey(x>>5,y>>5);let a=G.roadChunk.get(ck);if(!a){a=[];G.roadChunk.set(ck,a)}a.push((y&31)*32+(x&31))}
function line(x0,y0,x1,y1,f){let dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx-dy;for(;;){f(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>-dy){e-=dy;x0+=sx}if(e2<dx){e+=dx;y0+=sy}}}
function chunkKey(cx,cy){return cy*4096+cx}
// route between sites over the road graph
function route(fromId,toId){if(fromId===toId)return[];const adj={};G.edges.forEach(e=>{(adj[e.a]=adj[e.a]||[]).push(e);(adj[e.b]=adj[e.b]||[]).push(e)});const d={},pv={};d[fromId]=0;const q=[fromId];while(q.length){q.sort((a,b)=>d[a]-d[b]);const u=q.shift();if(u===toId)break;for(const e of adj[u]||[]){const v=e.a===u?e.b:e.a;const nd=d[u]+e.len;if(d[v]===undefined||nd<d[v]){d[v]=nd;pv[v]=[u,e];q.push(v)}}}if(d[toId]===undefined)return null;const segs=[];let u=toId;while(u!==fromId){const[p,e]=pv[u];segs.unshift(e.a===p?e.pts:e.pts.slice().reverse());u=p}const out=[];segs.forEach(s=>s.forEach(pt=>out.push([pt.x,pt.y])));return out}
// ===== HISTORY (legends) =====
function genHistory(){const H=[];const Y=G.opt.history|0;const add=(y,t,c,s)=>H.push({y,t,c,s});const nats=G.nations;
 nats.forEach(n=>{const fy=ri(1,Math.max(2,Y-80));n.founded=fy;add(fy,`${n.leader&&personName(n.cult)} founded the ${n.name}, raising ${n.capitalName} as its seat.`,n.cont,n.capital)});
 const sites=G.sites.filter(s=>['village','town','port','fort'].includes(s.type));sites.forEach(s=>{if(chance(.4))add(ri(1,Y-10),`Settlers led by ${personName(G.conts[s.cont].cult)} founded ${s.name}.`,s.cont,G.sites.indexOf(s))});
 for(let i=0;i<Math.max(4,nats.length*2);i++){if(nats.length<2)break;const a=pick(nats),b=pick(nats.filter(x=>x!==a));const y=ri(10,Y-20);add(y,`War broke out between the ${a.name} and the ${b.name}${a.cont!==b.cont?' across the sea':''}. ${pick(['It lasted a generation.','It ended in a marriage.','It ended at the Battle of '+placeName(a.cult)+'.','Neither side remembers why.'])}`,a.cont)}
 const mons=['dragon','kraken','leviathan','manticore','giant','wyvern'];for(let i=0;i<6;i++){const s=pick(G.sites);add(ri(5,Y-5),`A ${SP[pick(mons)].n.toLowerCase()} ${pick(['burned','drowned','devoured','terrorized'])} ${s.name||'a village'}${chance(.5)?', until the hero '+personName(G.conts[s.cont].cult)+' drove it off':''}.`,s.cont,G.sites.indexOf(s))}
 add(ri(20,Y-30),`The Grey Walk swept the ${G.conts[G.startCont].name}. Whole villages rose from their graves.`,G.startCont);add(ri(30,Y-40),'Red Mania set the tribes of '+G.conts[pick(G.conts.filter(c=>c.real)).id].name+' against each other for a summer.',null);
 const hy=Y-ri(10,16);add(hy,'A shepherd named Aldric climbed into the northern snows searching for his lost daughter. He came down wearing the Aegis and called himself Vorgath.',G.kingCont);
 Object.entries(G.subkings).forEach(([cid,sk])=>{add(ri(hy+1,Y-1),`Vorgath crowned ${sk.title} ${sk.name} over the ${G.conts[cid].name} and gave him a shard of the seal.`,+cid,sk.site)});
 nats.filter(n=>n.rel==='vassal').forEach(n=>add(ri(hy+2,Y),`The ${n.name} bent the knee to Vorgath and pays him tribute in grain.`,n.cont,n.capital));
 H.sort((a,b)=>a.y-b.y);G.history=H;G.year=Y}
