// ===== CONTINENT SHAPES, OCEAN ISLANDS AND ARCHIPELAGOS =====
CULT.isle={a:['Ka','Mo','Ta','Le','Ana','Ra','Ho','Ma','Ki','Nui','Ari','Tev'],b:['lani','moa','ru','hei','ko','nu','ua','iti','ma','na','oa','pe'],p:['Moa','Rua','Tavi','Kai','Hina','Pele','Vai','Tiki'],s:['nui','iti','motu','roa','hiva','tapu','vai','lua']};
const SHAPES=['round','elongated','twin','crescent','star','ring','shattered','fjord','spine'];
const SHAPEN={round:'a broad landmass',elongated:'a long landmass',twin:'two lobes joined by an isthmus',crescent:'a crescent around a great bay',star:'a land of long peninsulas',ring:'a ring around an inland sea',shattered:'a land shattered into islands',fjord:'a coast of deep fjords',spine:'a narrow spine of mountains'};
const _landRound=landness;
landness=function(c,x,y){const sh=c.shape;if(!sh||sh==='round')return _landRound(c,x,y);const ox=c.x,oy=c.y,a=c.ang||0;const lx=x-ox,ly=y-oy;const u=lx*Math.cos(a)+ly*Math.sin(a),w=-lx*Math.sin(a)+ly*Math.cos(a);let d=Math.hypot(lx/c.rx,ly/c.ry),extra=0;
 if(sh==='elongated')d=Math.hypot(u/(c.rx*1.32),w/(c.ry*.6));
 else if(sh==='spine')d=Math.hypot(u/(c.rx*1.38),w/(c.ry*.45));
 else if(sh==='twin'){const o=c.rx*.5;d=Math.min(Math.hypot((u-o)/(c.rx*.6),w/(c.ry*.66)),Math.hypot((u+o)/(c.rx*.54),w/(c.ry*.6)),Math.hypot(u/(c.rx*.6),w/(c.ry*.12)))}
 else if(sh==='crescent'){const db=Math.hypot((u-c.rx*.55)/(c.rx*.66),w/(c.ry*.62));if(db<1)extra-=(1-db)*1.6}
 else if(sh==='star'){const th=Math.atan2(w,u);d*=1-.3*Math.cos((c.k||4)*th)}
 else if(sh==='ring'){if(d<.56)extra-=(.56-d)*3.2}
 else if(sh==='shattered'){const ch=Math.abs(fbm2(x/(34*Math.sqrt(G.F)),y/(34*Math.sqrt(G.F)),G.ws+c.id*5)-.5);if(ch<.06)extra-=(.06-ch)*11}
 else if(sh==='fjord'){const r2=ridge(x/13,y/13,G.ws+c.id*3);if(d>.6)extra+=(r2-.55)*.9*(d-.5)}
 const n=fbm(x/(44*Math.sqrt(G.F)),y/(44*Math.sqrt(G.F)),G.ws+c.id*7),n2=fbm(x/14,y/14,G.ws+c.id*11+3);let v=1-d+(n-.5)*.85+(n2-.5)*.2-G.opt.sea+extra;const b=Math.min(x-c.cx0,c.cx0+CELL-1-x,y-c.cy0,c.cy0+CELL-1-y);if(b<28)v-=(28-b)*.04;return v};
const ISLETHEMES={tropical:'tropical isles',atoll:'coral atolls',temperate:'green isles',frost:'frozen isles',volcanic:'fire isles',desert:'sun-bleached cays',mystic:'mist isles'};
const _setupWorldI=setupWorld;
setupWorld=function(seed,opt){_setupWorldI(seed,opt);withRng(seed*41+11,()=>{G.conts.forEach(c=>{if(!c.real){c.shape='round';return}const pool=c.id===G.startCont?['round','elongated','crescent','star','fjord','twin']:c.id===G.kingCont?['round','crescent','ring','fjord','spine']:SHAPES;c.shape=G.opt.shapes==='round'?'round':pick(pool);c.ang=R()*Math.PI;c.k=ri(3,5);if(!c.cult)c.cult=null});genIsles()})};
function genIsles(){const S=Math.sqrt(G.F);G.archs=[];G.isleGrid=new Map();const amt=G.opt.islands===undefined?1:G.opt.islands;
 const theme=(x,y)=>{const lat=y/G.H;const r=R();if(r<.12)return'volcanic';if(r<.2)return'mystic';if(lat<.28)return'frost';if(lat<.5)return r<.3?'frost':'temperate';if(r<.45)return'atoll';if(r<.58)return'desert';return lat>.75&&r<.9?'tropical':(r<.8?'tropical':'temperate')};
 const oceanOK=(x,y,rad)=>{for(let k=0;k<9;k++){const a=k/9*6.283;const px=Math.round(x+Math.cos(a)*rad*(k?1:0)),py=Math.round(y+Math.sin(a)*rad*(k?1:0));if(px<4||py<4||px>=G.W-4||py>=G.H-4)return false;const c=contAt(px,py);if(c&&landness(c,px,py)>LANDT-.12)return false}return true};
 const make=(x,y,spread,n,th,big)=>{const ar={id:G.archs.length,x:Math.round(x),y:Math.round(y),theme:th,isl:[],big:!!big};for(let i=0;i<n*4&&ar.isl.length<n;i++){const ang=R()*6.283,dd=i===0?0:R()*spread;const ix=Math.round(x+Math.cos(ang)*dd),iy=Math.round(y+Math.sin(ang)*dd);const tiny=R()<.35;const r=Math.round((tiny?ri(3,5):ri(6,big?18:13))*S**.6);const atoll=th==='atoll'&&!tiny&&R()<.7;if(!oceanOK(ix,iy,r+5))continue;if(ar.isl.some(o=>dist(o.x,o.y,ix,iy)<o.r+r+3))continue;ar.isl.push({x:ix,y:iy,r,sq:.65+R()*.6,ang:R()*3.14,atoll,seed:ri(1,9999),ar:ar.id})}if(ar.isl.length<1)return;ar.name=th==='atoll'?placeName('isle')+' Atoll':pick([placeName('isle')+' Isles','the '+placeName('isle')+' Reefs','the '+pick(['Broken','Singing','Drowned','Turtle','Lantern','Whisper','Burning','Pale','Gull','Coral'])+' Isles']);if(th==='frost')ar.name=pick(['the '+pick(['Frost','Seal','Iceteeth','Grey','Walrus'])+' Isles',placeName('north')+' Skerries']);if(th==='volcanic')ar.name=pick(['the Ember Isles','the '+placeName('isle')+' Fires','Smoking '+placeName('isle')]);G.archs.push(ar);ar.isl.forEach(i=>{const m=Math.ceil(i.r*1.7+8);for(let cy=(i.y-m)>>5;cy<=(i.y+m)>>5;cy++)for(let cx=(i.x-m)>>5;cx<=(i.x+m)>>5;cx++){const k=cy*4096+cx;if(!G.isleGrid.has(k))G.isleGrid.set(k,[]);G.isleGrid.get(k).push(i)}})};
 // seams between continents
 for(let row=0;row<G.rows;row++)for(let col=1;col<G.cols;col++){const n=Math.round((R()<.85*amt?1:0)+(R()<.45*amt?1:0));for(let j=0;j<n;j++){const x=col*CELL,y=row*CELL+ri(50,CELL-50);make(x,y,ri(14,30)*S,ri(3,7),theme(x,y))}}
 for(let col=0;col<G.cols;col++){if(R()<.75*amt){const x=col*CELL+ri(50,CELL-50),y=CELL;make(x,y,ri(14,30)*S,ri(3,7),theme(x,y))}}
 // corners where four seas meet
 for(let col=1;col<G.cols;col++)if(R()<.7*amt)make(col*CELL,CELL,ri(18,34)*S,ri(4,9),theme(col*CELL,CELL));
 // outer seas
 for(let col=0;col<G.cols;col++){if(R()<.35*amt)make(col*CELL+ri(60,CELL-60),ri(14,22),ri(10,18)*S,ri(2,4),theme(0,10));if(R()<.35*amt)make(col*CELL+ri(60,CELL-60),G.H-ri(14,22),ri(10,18)*S,ri(2,4),theme(0,G.H-10))}
 // empty ocean cells become great archipelagos
 G.conts.filter(c=>!c.real).forEach(c=>{const th=theme(c.cx0+CELL/2,c.cy0+CELL/2);make(c.cx0+CELL/2,c.cy0+CELL/2,CELL*.36,Math.round(ri(12,20)*Math.min(1.6,amt||1)),th,1);c.cult='isle'})}
function isleV(i,x,y){const lx=x-i.x,ly=y-i.y;const u=(lx*Math.cos(i.ang)+ly*Math.sin(i.ang))/i.r,w=(-lx*Math.sin(i.ang)+ly*Math.cos(i.ang))/(i.r*i.sq);const d=Math.hypot(u,w);if(d>1.9)return{v:-1,d};const n=fbm(x/7,y/7,G.ws+i.seed)-.5;if(i.atoll)return{v:.5-Math.abs(d-.78)*3.3+n*.55,d,lag:d<.66};return{v:1-d+n*.6,d}}
function isleAt(x,y){const l=G.isleGrid&&G.isleGrid.get((y>>5)*4096+(x>>5));if(!l)return null;let best=null;for(const i of l){const r=isleV(i,x,y);if(!best||r.v>best.v)best=Object.assign(r,{i})}return best}
const _terrainAtI=terrainAt;
terrainAt=function(x,y){const r=_terrainAtI(x,y);if(!G.isleGrid)return r;const t=r&255;if(t!==TID.sea&&t!==TID.ocean&&t!==TID.shoal&&t!==TID.reef)return r;const hit=isleAt(x,y);if(!hit||hit.v<-.2)return r;const i=hit.i,ar=G.archs[i.ar],th=ar.theme,v=hit.v;const ws=G.ws;
 if(v<.12){const warm=['tropical','atoll','desert','volcanic'].includes(th);if(hit.lag)return(BI.reef<<8)|(warm&&fbm(x/5,y/5,ws+7)>.62?TID.reef:TID.shoal);if(v>-.1)return(BI.reef<<8)|(warm&&fbm(x/6,y/6,ws+9)>.6?TID.reef:TID.shoal);if(v>-.2&&t===TID.sea)return(BI.sea<<8)|TID.ocean;return r}
 const f=fbm(x/12,y/12,ws+i.seed+40);const coast=v<.28;let bk,tt=.6,mm=.6;
 if(th==='tropical'){bk=coast?(f>.62?'mangrove':'beach'):f>.6?'bamboo':v>.55||f>.4?'jungle':'savanna';tt=.86;mm=.75}
 else if(th==='atoll'){bk=coast||v<.42?'beach':'jungle';tt=.88;mm=.7}
 else if(th==='temperate'){bk=coast?'beach':f>.58?'forest':f>.42?'grass':f>.3?'birch':'highland';tt=.5;mm=.55}
 else if(th==='frost'){bk=coast?'tundra':v>.75?'glacier':f>.5?'taiga':'tundra';tt=.12;mm=.5}
 else if(th==='volcanic'){bk=v>.62?'volcanic':coast?'beach':y/G.H>.5?'jungle':'highland';tt=.75;mm=.5}
 else if(th==='desert'){bk=coast?'beach':f>.6?'badlands':f>.45?'saltflat':'desert';tt=.9;mm=.15}
 else{bk=coast?'beach':f>.6?'crystal':f>.42?'blossom':'fungal';tt=.55;mm=.7}
 const b=BI[bk]===undefined?BI.beach:BI[bk];return(b<<8)|tileFor(bk,x,y,hashn(x,y,ws+3),Math.min(1.2,v*.9),tt,mm)};
