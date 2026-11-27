'use strict';
// ===== CORE =====
const VER=2,CHUNK=32;let CELL=320;
const DAY=360,SEASON_DAYS=6,SEASON=DAY*SEASON_DAYS,YEAR=SEASON*4,MOONDAYS=8;
const SEASONS=['Spring','Summer','Autumn','Winter'];
const DIRS=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
const STATN={str:'Strength',int:'Intelligence',sth:'Stealth',spd:'Speed',agi:'Agility'};
let G=null,L=null;
let RND=null;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gameR(){let s=G.rs=(G.rs+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function R(){return RND?RND():gameR()}
function withRng(seed,fn){const old=RND;RND=mulberry(seed|0);try{return fn()}finally{RND=old}}
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));const pick=a=>a[Math.floor(R()*a.length)];const chance=p=>R()<p;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const dist=(a,b,c,d)=>Math.max(Math.abs(a-c),Math.abs(b-d));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function wpick(t){let s=0;for(const e of t)s+=e[1];let q=R()*s;for(const e of t){q-=e[1];if(q<=0)return e[0]}return t[0][0]}
function hashn(x,y,s){let h=Math.imul(x*374761393+y*668265263+s*982451653,1274126177);h=(h^h>>>13)*1274126177;return((h^h>>>16)>>>0)/4294967296}
function hstr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),f=x-xi,g=y-yi,u=f*f*(3-2*f),v=g*g*(3-2*g);const a=hashn(xi,yi,s),b=hashn(xi+1,yi,s),c=hashn(xi,yi+1,s),d=hashn(xi+1,yi+1,s);return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v}
function fbm(x,y,s){return vnoise(x,y,s)*.5+vnoise(x*2.03,y*2.03,s+7)*.28+vnoise(x*4.1,y*4.1,s+13)*.15+vnoise(x*8.3,y*8.3,s+19)*.07}
function fbm2(x,y,s){return vnoise(x,y,s)*.62+vnoise(x*2.1,y*2.1,s+3)*.38}
function ridge(x,y,s){return 1-Math.abs(fbm(x,y,s)*2-1)}
function mk(k,q){return{k,q:q||1}}
function cap(s){return s?s[0].toUpperCase()+s.slice(1):s}

// ===== BIOMES =====
const BIOMES=[
 // id key, name, temp/moist hints for docs, wildlife table key
 ['deep','Deep Ocean'],['sea','Open Sea'],['reef','Coral Shoals'],['beach','Beach'],
 ['grass','Meadowland'],['forest','Oakwood'],['birch','Birchwood'],['darkwood','Old Darkwood'],['jungle','Jungle'],['bamboo','Bamboo Thicket'],['mangrove','Mangrove'],['swamp','Swamp'],
 ['savanna','Savanna'],['steppe','Steppe'],['desert','Desert'],['badlands','Red Badlands'],['saltflat','Salt Flats'],
 ['tundra','Tundra'],['taiga','Taiga'],['glacier','Glacier'],['mountain','Mountains'],['highland','Heather Highlands'],['volcanic','Ashlands'],['fungal','Fungal Forest'],['blossom','Blossom Vale'],['crystal','Crystal Barrens']];
const BI={};BIOMES.forEach((b,i)=>BI[b[0]]=i);
const BIOMEN=BIOMES.map(b=>b[1]);
const isWaterBiome=b=>b<=2;

// ===== TILES =====
// p passable, o opaque, f flammability, fuel, b burns to, m move cost, swim, water
const TDEF={
 sea:{n:'deep ocean',water:1,swim:1,ocean:1},ocean:{n:'open sea',water:1,swim:1,ocean:1},shoal:{n:'shoals',p:1,water:1,m:1.4,ocean:1},reef:{n:'coral reef',p:1,water:1,m:1.8,ocean:1,spiky:1},
 deep:{n:'deep water',water:1,swim:1},shallow:{n:'shallow water',p:1,water:1,m:1.3},ice:{n:'ice',p:1,under:'shallow',icy:1},thinice:{n:'thin ice',p:1,under:'deep',icy:1},seaice:{n:'pack ice',p:1,under:'ocean',icy:1},
 flood:{n:'floodwater',p:1,water:1,m:1.5},oasis:{n:'oasis pool',p:1,water:1,m:1.3},cracked:{n:'dried pool',p:1},lava:{n:'lava',lava:1,heat:1},spring:{n:'hot spring',p:1,water:1,warm:1},
 sand:{n:'sand',p:1},dune:{n:'dune',p:1,m:1.3},redrock:{n:'red rock',o:1,mine:1},mesa:{n:'mesa sand',p:1},salt:{n:'salt crust',p:1},
 grass:{n:'grass',p:1,f:.55,fuel:3,b:'ash'},tall:{n:'tall grass',p:1,o:1,f:.8,fuel:3,b:'ash',cover:1},flowers:{n:'wildflowers',p:1,f:.5,fuel:3,b:'ash'},savgrass:{n:'dry grass',p:1,f:.85,fuel:2,b:'ash'},steppegrass:{n:'steppe grass',p:1,f:.7,fuel:2,b:'ash'},heather:{n:'heather',p:1,f:.6,fuel:3,b:'ash'},moss:{n:'tundra moss',p:1},snow:{n:'snow',p:1,m:1.25},drift:{n:'snowdrift',p:1,m:2.2},glacier:{n:'glacial ice',p:1,icy:1,m:1.2},
 tree:{n:'oak',o:1,f:.45,fuel:9,b:'stump',chop:1},birch:{n:'birch',o:1,f:.5,fuel:8,b:'stump',chop:1},darktree:{n:'ancient yew',o:1,f:.35,fuel:12,b:'stump',chop:1},pine:{n:'pine',o:1,f:.5,fuel:9,b:'stump',chop:1},palm:{n:'jungle tree',o:1,f:.4,fuel:10,b:'stump',chop:1},
 acacia:{n:'acacia',o:1,f:.55,fuel:7,b:'stump',chop:1},bamboo:{n:'bamboo',o:1,f:.7,fuel:4,b:'ash',chop:1},mangrove:{n:'mangrove roots',p:1,o:1,m:2,water:1,cover:1,f:.2,fuel:6,b:'shallow'},blossom:{n:'blossom tree',o:1,f:.45,fuel:8,b:'stump',chop:1},shroom:{n:'giant mushroom',o:1,f:.2,fuel:6,b:'mud',chop:1},
 vines:{n:'tangled vines',p:1,o:1,f:.6,fuel:4,b:'ash',m:1.6,cover:1},reeds:{n:'reeds',p:1,o:1,f:.7,fuel:2,b:'mud',cover:1,m:1.3},sapling:{n:'sapling',p:1,f:.5,fuel:2,b:'ash'},bush:{n:'berry bush',p:1,f:.6,fuel:4,b:'ash',m:1.3,cover:1},bushbare:{n:'bare bush',p:1,f:.6,fuel:3,b:'ash',m:1.3},
 cactus:{n:'cactus',f:.1,fuel:4,b:'sand',spiky:1},crystal:{n:'crystal spire',o:1,mine:1,crys:1},shard:{n:'crystal shards',p:1,m:1.3,spiky:1},
 rock:{n:'rock face',o:1,mine:1},scree:{n:'scree',p:1},basalt:{n:'basalt',p:1},ashground:{n:'ash flats',p:1},obsidian:{n:'obsidian',o:1,mine:1},vent:{n:'steam vent',p:1,vent:1},
 mud:{n:'mud',p:1,m:1.6},bog:{n:'swamp bog',p:1,m:1.8},tar:{n:'tar pit',p:1,f:.9,fuel:14,b:'ash',m:3,sticky:1},ash:{n:'ash',p:1},stump:{n:'stump',p:1},bones:{n:'old bones',p:1},
 soil:{n:'tilled soil',p:1},road:{n:'dirt road',p:1,m:.8},cobble:{n:'cobbled street',p:1,m:.8},
 woodwall:{n:'wooden wall',o:1,f:.4,fuel:8,b:'ash',wall:1},logwall:{n:'log wall',o:1,f:.35,fuel:10,b:'ash',wall:1},palisade:{n:'palisade',o:1,f:.5,fuel:9,b:'ash',wall:1},stonewall:{n:'stone wall',o:1,wall:1,mine:1},adobe:{n:'mud-brick wall',o:1,wall:1,mine:1},hidewall:{n:'hide tent wall',o:1,f:.6,fuel:3,b:'ash',wall:1},
 door:{n:'door',o:1,f:.5,fuel:6,b:'ash',door:1},dooropen:{n:'open door',p:1,f:.5,fuel:6,b:'ash',door:1},locked:{n:'locked door',o:1,f:.3,fuel:8,b:'ash',door:1},gate:{n:'iron gate',gate:1},grate:{n:'rusted grate',gate:1},gateopen:{n:'open gate',p:1},sealgate:{n:'Sealed Gate of the Keep',seal:1},
 woodfloor:{n:'wooden floor',p:1,f:.5,fuel:5,b:'ash',indoor:1},stonefloor:{n:'stone floor',p:1,indoor:1},carpet:{n:'red carpet',p:1,f:.6,fuel:3,b:'stonefloor',indoor:1},bridge:{n:'bridge',p:1,f:.6,fuel:5,b:'deep'},pier:{n:'pier',p:1,f:.5,fuel:5,b:'ocean',pier:1},
 down:{n:'way down',p:1,link:1},up:{n:'way up',p:1,link:1},well:{n:'well',waterSrc:1},fountain:{n:'fountain',waterSrc:1,fountain:1},bed:{n:'bed',p:1,f:.7,fuel:4,b:'ash',bed:1,indoor:1},chest:{n:'chest',f:.4,fuel:6,b:'ash',store:1},
 altar:{n:'altar',p:1,sacred:1},campfire:{n:'campfire',p:1,heat:1,cook:1},forge:{n:'forge',heat:1,cook:1,forge:1},spellforge:{n:'spellforge',arcane:1},stall:{n:'market stall',f:.6,fuel:4,b:'ash'},anvil:{n:'anvil'},
 barrel:{n:'powder barrel',f:1,fuel:1,b:'ash',boom:1},crate:{n:'crate',f:.6,fuel:4,b:'ash',store:1},hay:{n:'hay bale',p:1,f:1,fuel:3,b:'ash'},fence:{n:'fence',f:.6,fuel:4,b:'ash'},
 hive:{n:'beehive tree',o:1,f:.5,fuel:8,b:'stump',hive:1},web:{n:'spider web',p:1,f:1,fuel:1,b:'stonefloor',m:3,sticky:1},rubble:{n:'rubble',p:1,m:1.5},oil:{n:'oil slick',p:1,f:1,fuel:4,b:'ash',slip:1},
 cavefloor:{n:'cave floor',p:1,indoor:1},cavewall:{n:'cave wall',o:1,mine:1},ore:{n:'iron vein',o:1,mine:1,ore:1},star:{n:'star-iron vein',o:1,mine:1,ore:2},
 mushrooms:{n:'mushroom patch',p:1,forage:1},herb:{n:'herb patch',p:1,f:.5,fuel:2,b:'ash',forage:1},throne:{n:'throne',p:1,indoor:1},statue:{n:'statue',o:1},sarc:{n:'sarcophagus',store:1},
 pit:{n:'dug pit',p:1,trap:1},spikes:{n:'spike trap',p:1,trap:1},snare:{n:'rope snare',p:1,trap:1,f:.6,fuel:1,b:'ash'},scarecrow:{n:'scarecrow',f:.7,fuel:3,b:'ash'},granary:{n:'granary',f:.8,fuel:12,b:'ash',store:1},tent:{n:'tent',o:1,f:.5,fuel:4,b:'sand'},
 sigil:{n:'warding sigil',p:1,sigil:1},cannonmount:{n:'cannon emplacement',cannon:1},wreck:{n:'shipwreck',store:1},banner:{n:'banner pole'},
};
const TN=Object.keys(TDEF);const TID={};TN.forEach((k,i)=>{TID[k]=i;TDEF[k].k=k});
const td=i=>TDEF[TN[i]];
