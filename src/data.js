// ===== DATA =====
const DAY=100, SEASON_DAYS=5, SEASON=DAY*SEASON_DAYS;
const SEASONS=['Spring','Summer','Autumn','Winter'];
const REGIONS=['Grassland','Jungle','Desert','Mountain','Sea'];
const RG=0,RJ=1,RD=2,RM=3,RS=4;
const DIRS=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
const STATN={str:'Strength',int:'Intelligence',sth:'Stealth',spd:'Speed',agi:'Agility'};

// tile table: p passable, o opaque, f flammability, fuel burn time, b burns to, m move cost
const TDEF={
 sea:{n:'open sea'},deep:{n:'deep water',water:1,swim:1},shallow:{n:'shallow water',p:1,water:1,m:1.3},
 ice:{n:'river ice',p:1,under:'shallow',icy:1},thinice:{n:'thin ice',p:1,under:'deep',icy:1},
 flood:{n:'floodwater',p:1,water:1,m:1.5},oasis:{n:'oasis pool',p:1,water:1,m:1.3},cracked:{n:'dried pool',p:1},
 sand:{n:'sand',p:1},grass:{n:'grass',p:1,f:.55,fuel:3,b:'ash'},tall:{n:'tall grass',p:1,o:1,f:.8,fuel:3,b:'ash',cover:1},
 flowers:{n:'wildflowers',p:1,f:.5,fuel:3,b:'ash'},tree:{n:'oak',o:1,f:.45,fuel:9,b:'stump',chop:1},pine:{n:'pine',o:1,f:.5,fuel:9,b:'stump',chop:1},
 palm:{n:'jungle tree',o:1,f:.4,fuel:10,b:'stump',chop:1},vines:{n:'tangled vines',p:1,o:1,f:.6,fuel:4,b:'ash',m:1.6,cover:1},
 sapling:{n:'sapling',p:1,f:.5,fuel:2,b:'ash'},bush:{n:'berry bush',p:1,f:.6,fuel:4,b:'ash',m:1.3,cover:1},bushbare:{n:'bare bush',p:1,f:.6,fuel:3,b:'ash',m:1.3},
 cactus:{n:'cactus',f:.1,fuel:4,b:'sand',spiky:1},rock:{n:'rock face',o:1,mine:1},scree:{n:'scree',p:1},drift:{n:'snowdrift',p:1,m:2.5},
 mud:{n:'mud',p:1,m:1.6},bog:{n:'swamp bog',p:1,m:1.8},tar:{n:'tar pit',p:1,f:.9,fuel:14,b:'ash',m:3,sticky:1},ash:{n:'ash',p:1},stump:{n:'charred stump',p:1},
 soil:{n:'tilled soil',p:1},road:{n:'dirt road',p:1},
 woodwall:{n:'wooden wall',o:1,f:.4,fuel:8,b:'ash',wall:1},stonewall:{n:'stone wall',o:1,wall:1,mine:1},door:{n:'door',o:1,f:.5,fuel:6,b:'ash',door:1},dooropen:{n:'open door',p:1,f:.5,fuel:6,b:'ash',door:1},
 locked:{n:'locked door',o:1,f:.3,fuel:8,b:'ash',door:1},gate:{n:'iron gate',o:0,gate:1},grate:{n:'rusted grate',o:0,gate:1},gateopen:{n:'open gate',p:1},
 woodfloor:{n:'wooden floor',p:1,f:.5,fuel:5,b:'ash',indoor:1},stonefloor:{n:'stone floor',p:1,indoor:1},bridge:{n:'wooden bridge',p:1,f:.6,fuel:5,b:'deep'},
 down:{n:'way down',p:1,link:1},up:{n:'way up',p:1,link:1},well:{n:'village well',waterSrc:1},bed:{n:'bed',p:1,f:.7,fuel:4,b:'ash',bed:1},chest:{n:'chest',f:.4,fuel:6,b:'ash',store:1},
 altar:{n:'old altar',p:1,sacred:1},campfire:{n:'campfire',p:1,heat:1,cook:1},forge:{n:'forge',heat:1,cook:1,forge:1},spellforge:{n:'spellforge',arcane:1},
 barrel:{n:'powder barrel',f:1,fuel:1,b:'ash',boom:1},hive:{n:'beehive tree',o:1,f:.5,fuel:8,b:'stump',hive:1},web:{n:'spider web',p:1,f:1,fuel:1,b:'stonefloor',m:3,sticky:1},
 rubble:{n:'rubble',p:1,m:1.5},oil:{n:'oil slick',p:1,f:1,fuel:4,b:'ash',slip:1},cavefloor:{n:'cave floor',p:1,indoor:1},cavewall:{n:'cave wall',o:1,mine:1},ore:{n:'iron vein',o:1,mine:1,ore:1},
 star:{n:'star-iron vein',o:1,mine:1,ore:2},mushrooms:{n:'mushroom patch',p:1,forage:1},herb:{n:'herb patch',p:1,f:.5,fuel:2,b:'ash',forage:1},throne:{n:'bone throne',p:1},statue:{n:'statue',o:1},sarc:{n:'sarcophagus',store:1},
 spring:{n:'hot spring',p:1,water:1,warm:1},pit:{n:'dug pit',p:1,trap:1},spikes:{n:'spike trap',p:1,trap:1},snare:{n:'rope snare',p:1,trap:1,f:.6,fuel:1,b:'ash'},scarecrow:{n:'scarecrow',f:.7,fuel:3,b:'ash'},granary:{n:'Horde granary',f:.8,fuel:12,b:'ash',store:1},tent:{n:'nomad tent',o:1,f:.5,fuel:4,b:'sand'},
};
const TN=Object.keys(TDEF);const TID={};TN.forEach((k,i)=>{TID[k]=i;TDEF[k].k=k});
const td=i=>TDEF[TN[i]];

const ITEMS={
 // weapons: d damage, st governing stat, req stat needs
 fists:{n:'Bare hands',k:'wpn',d:1,st:'str'},
 axe:{n:'Hand axe',k:'wpn',g:'/',d:6,st:'str',req:{str:4},v:22,chop:1},dagger:{n:'Dagger',k:'wpn',g:'/',d:3,st:'sth',v:14,quiet:1},
 blade:{n:'Short blade',k:'wpn',g:'/',d:4,st:'agi',v:18},staff:{n:'Oak staff',k:'wpn',g:'/',d:3,st:'int',v:14},spear:{n:'Spear',k:'wpn',g:'/',d:5,st:'str',req:{str:3},v:20},
 club:{n:'Sap',k:'wpn',g:'/',d:2,st:'sth',v:8,mercy:1},pick:{n:'Pickaxe',k:'wpn',g:'/',d:4,st:'str',v:18,minep:1},
 musket:{n:'Musket',k:'wpn',g:'}',d:12,rng:9,st:'agi',req:{agi:4},gun:1,v:60},pistol:{n:'Flintlock pistol',k:'wpn',g:'}',d:7,rng:5,st:'agi',req:{agi:3},gun:1,v:45},sling:{n:'Sling',k:'wpn',g:'}',d:3,rng:6,st:'agi',v:8,usesStone:1},
 // armor
 hide:{n:'Hide armor',k:'arm',g:'[',ar:1,v:15},leather:{n:'Leather coat',k:'arm',g:'[',ar:2,v:25,req:{str:2}},chain:{n:'Chain shirt',k:'arm',g:'[',ar:4,req:{str:5},v:50,noisy:1},
 robe:{n:'Traveler robe',k:'arm',g:'[',ar:0,v:10,manaP:4},furcoat:{n:'Fur coat',k:'arm',g:'[',ar:1,warm:30,v:30},shroud:{n:'Desert shroud',k:'arm',g:'[',ar:0,cool:30,v:24},
 hordegarb:{n:'Horde war-paint and furs',k:'arm',g:'[',ar:2,warm:15,disg:'horde',v:35},
 // tools and materials
 flint:{n:'Flint and steel',k:'tool',g:'*',v:6,fire:1},torch:{n:'Torch',k:'tool',g:'!',v:3,stack:1,fire:1},rope:{n:'Rope',k:'mat',g:'~',v:5,stack:1},lockpick:{n:'Lockpick',k:'tool',g:'-',v:8,stack:1},shovel:{n:'Shovel',k:'tool',g:'-',v:12,dig:1},
 flask:{n:'Empty flask',k:'mat',g:'!',v:2,stack:1},water:{n:'Flask of water',k:'drink',g:'!',c:'#7cc4ea',thi:45,v:3,stack:1,empty:'flask'},dirtywater:{n:'Flask of murky water',k:'drink',g:'!',c:'#8c9a6a',thi:35,v:0,stack:1,empty:'flask',dirty:1},
 oilflask:{n:'Flask of oil',k:'throw',g:'!',c:'#b89030',v:8,stack:1,effect:'oil'},firebomb:{n:'Fire bomb',k:'throw',g:'o',c:'#e8703a',v:18,stack:1,effect:'fire'},smokebomb:{n:'Smoke bomb',k:'throw',g:'o',c:'#aaa',v:12,stack:1,effect:'smoke'},sleepbomb:{n:'Dreamroot bomb',k:'throw',g:'o',c:'#a58be0',v:24,stack:1,effect:'sleepgas'},poisonbomb:{n:'Ashcap bomb',k:'throw',g:'o',c:'#8ec24a',v:22,stack:1,effect:'poison'},
 powder:{n:'Keg of powder',k:'throw',g:'o',c:'#333',v:30,stack:1,effect:'boom'},stone:{n:'Stone',k:'throw',g:'.',v:0,stack:1,effect:'noise'},
 shot:{n:'Powder and shot',k:'ammo',g:'=',v:2,stack:1},wood:{n:'Wood',k:'mat',g:'=',c:'#a97a44',v:1,stack:1},stoneblock:{n:'Cut stone',k:'mat',g:'=',c:'#999',v:1,stack:1},
 ironore:{n:'Iron ore',k:'mat',g:'*',c:'#a98',v:4,stack:1},iron:{n:'Iron bar',k:'mat',g:'=',c:'#bbc',v:10,stack:1},steel:{n:'Steel bar',k:'mat',g:'=',c:'#dde',v:18,stack:1},starore:{n:'Star-iron ore',k:'mat',g:'*',c:'#9cf',v:25,stack:1},stariron:{n:'Star-iron bar',k:'mat',g:'=',c:'#9cf',v:45,stack:1},
 pelt:{n:'Pelt',k:'mat',g:'%',c:'#a87',v:5,stack:1},bone:{n:'Bone',k:'mat',g:'%',c:'#ddd',v:2,stack:1},fang:{n:'Fang',k:'mat',g:'%',c:'#eee',v:4,stack:1},chitin:{n:'Chitin plate',k:'mat',g:'%',c:'#675',v:7,stack:1},silk:{n:'Spider silk',k:'mat',g:'~',c:'#ddd',v:6,stack:1},wax:{n:'Beeswax',k:'mat',g:'%',c:'#ec6',v:4,stack:1},
 dust:{n:'Arcane dust',k:'mat',g:'*',c:'#b9f',v:15,stack:1},
 // food
 berries:{n:'Berries',k:'food',g:'%',c:'#c44a7a',hun:10,thi:4,v:2,stack:1},rawmeat:{n:'Raw meat',k:'food',g:'%',c:'#c44',hun:22,v:3,stack:1,raw:1,meat:1},cooked:{n:'Roast meat',k:'food',g:'%',c:'#a64',hun:45,v:7,stack:1,meat:1},
 mushroom:{n:'Wild mushroom',k:'food',g:'%',c:'#ca8',hun:10,v:2,stack:1,risky:1},bread:{n:'Bread',k:'food',g:'%',c:'#ca6',hun:30,v:5,stack:1},turnip:{n:'Turnip',k:'food',g:'%',c:'#ddb',hun:16,v:3,stack:1},wheat:{n:'Wheat sheaf',k:'food',g:'%',c:'#db6',hun:6,v:2,stack:1},gourd:{n:'Gourd',k:'food',g:'%',c:'#d90',hun:20,thi:12,v:4,stack:1},
 honey:{n:'Honey',k:'food',g:'%',c:'#ea3',hun:18,hp:4,v:9,stack:1},cactusfruit:{n:'Cactus fruit',k:'food',g:'%',c:'#d55',hun:8,thi:22,v:4,stack:1},stew:{n:'Hearty stew',k:'food',g:'%',c:'#a75',hun:60,thi:20,hp:8,warm:30,v:15,stack:1},jerky:{n:'Spiced jerky',k:'food',g:'%',c:'#853',hun:30,v:8,stack:1},pie:{n:'Berry pie',k:'food',g:'%',c:'#a46',hun:50,hp:6,v:14,stack:1,boost:'spd'},mead:{n:'Honey mead',k:'food',g:'!',c:'#db5',thi:30,hun:6,warm:25,v:14,stack:1,boost:'int'},warbroth:{n:'War broth',k:'food',g:'!',c:'#a33',hun:30,thi:15,v:18,stack:1,boost:'str'},
 baitpoison:{n:'Poisoned meat',k:'bait',g:'%',c:'#8ec24a',v:6,stack:1,bait:'poison'},baitsleep:{n:'Drugged meat',k:'bait',g:'%',c:'#a58be0',v:6,stack:1,bait:'sleep'},
 // herbs and medicine
 dreamroot:{n:'Dreamroot',k:'herb',g:'"',c:'#a58be0',v:6,stack:1},bloodmoss:{n:'Bloodmoss',k:'herb',g:'"',c:'#c55',v:6,stack:1},ashcap:{n:'Ashcap',k:'herb',g:'"',c:'#8ec24a',v:5,stack:1},sunleaf:{n:'Sunleaf',k:'herb',g:'"',c:'#ec5',v:5,stack:1},
 salve:{n:'Healing salve',k:'med',g:'!',c:'#d66',hp:18,v:12,stack:1},tonic:{n:'Cleansing tonic',k:'med',g:'!',c:'#6cb',cure:1,v:16,stack:1},sleepdraught:{n:'Sleep draught',k:'med',g:'!',c:'#a58be0',spike:'sleep',v:14,stack:1},poisonvial:{n:'Ashcap poison',k:'med',g:'!',c:'#8ec24a',spike:'poison',v:14,stack:1},manapot:{n:'Mana tincture',k:'med',g:'!',c:'#68d',mp:15,v:18,stack:1},
 seedwheat:{n:'Wheat seed',k:'seed',g:':',c:'#db6',crop:'wheat',v:2,stack:1},seedturnip:{n:'Turnip seed',k:'seed',g:':',c:'#ddb',crop:'turnip',v:2,stack:1},seedgourd:{n:'Gourd seed',k:'seed',g:':',c:'#d90',crop:'gourd',v:3,stack:1},
 banner:{n:'Horde banner',k:'quest',g:'&',c:'#c33',v:20},
 piece_grass:{n:'Amulet Shard of Earth',k:'quest',g:'&',c:'#7c6',v:0,noburn:1},piece_jungle:{n:'Amulet Shard of Vines',k:'quest',g:'&',c:'#5da',v:0,noburn:1},piece_desert:{n:'Amulet Shard of Sand',k:'quest',g:'&',c:'#ec6',v:0,noburn:1},sunder:{n:'Sundering Amulet',k:'quest',g:'&',c:'#fff',v:0,noburn:1},
 letter:{n:'Sealed letter',k:'quest',g:'?',c:'#ddc',v:0,noburn:1},locket:{n:"Mira's locket",k:'lore',g:'&',c:'#ec8',v:0,noburn:1,lore:'locket'},diary:{n:"A shepherd's diary",k:'lore',g:'?',c:'#ddc',v:0,noburn:1,lore:'diary'},
 corpse:{n:'corpse',k:'corpse',g:'%',c:'#955',v:0},ring:{n:'Silver ring',k:'mat',g:'=',c:'#ddd',v:30,stack:1},
};
// spell scrolls
const SPELLS={
 firebolt:{n:'Firebolt',mp:3,int:2,rng:7,d:'Burns a target and ignites what it lands on.'},frost:{n:'Frost',mp:3,int:3,rng:6,d:'Slows a target, freezes water into ice, and snuffs fire.'},shock:{n:'Shock',mp:4,int:4,rng:6,d:'Arcs through everything wet or standing in connected water.'},
 heal:{n:'Heal',mp:4,int:3,self:1,d:'Restores your health.'},sleep:{n:'Sleep',mp:5,int:4,rng:6,d:'Puts a target to sleep. Loud noises wake it.'},charm:{n:'Charm',mp:5,int:3,rng:5,d:'Makes an animal or weak creature a friend for a while.'},
 fear:{n:'Fear',mp:4,int:3,rng:6,d:'Sends a creature running.'},brainwash:{n:'Brainwash',mp:8,int:6,rng:5,d:'An intelligent creature fights for you, then remembers.'},raise:{n:'Raise Dead',mp:8,int:6,rng:5,d:'Turns a corpse into a servant. People who see it will not forgive you.'},
 blink:{n:'Blink',mp:5,int:4,rng:7,d:'Teleports you to a tile you can see.'},gust:{n:'Gust',mp:3,int:2,rng:5,d:'Blasts creatures backward and scatters gas and flames.'},
};
// Morrowind-style spellmaker effects: cost per magnitude point; v variant scales by area, duration
const EFFECTS={
 fire:{n:'Fire Damage',c:.7,t:'damage',d:'Burns and ignites the tile.'},frost:{n:'Frost Damage',c:.6,t:'damage',d:'Damages, slows, and freezes water.'},shock:{n:'Shock Damage',c:.8,t:'damage',d:'Damages and arcs through water.'},poison:{n:'Poison',c:.5,t:'damage',d:'Poison that ticks over the duration.'},drain:{n:'Absorb Life',c:1.1,t:'damage',d:'Damages the target and heals you.'},
 heal:{n:'Restore Health',c:.6,t:'self',d:'Heals everyone friendly in the area.'},restore:{n:'Restore Body',c:.5,t:'self',d:'Refills hunger, thirst, and cures disease.'},haste:{n:'Fortify Speed',c:.9,t:'self',d:'Adds speed for the duration.'},might:{n:'Fortify Strength',c:.9,t:'self',d:'Adds Strength for the duration.'},invis:{n:'Invisibility',c:1,t:'self',d:'Nothing can see you until you strike.'},aegis:{n:'Lesser Aegis',c:1.4,t:'self',d:'Absorbs a large amount of damage.'},
 sleep:{n:'Sleep',c:.7,t:'mind',d:'Unconscious for the duration. Never kills.'},calm:{n:'Calm',c:.5,t:'mind',d:'Target stops being hostile. Never kills.'},fear:{n:'Demoralize',c:.5,t:'mind',d:'Target runs away.'},charm:{n:'Command Creature',c:.9,t:'mind',d:'Any creature fights for you.'},paralyze:{n:'Paralyze',c:1,t:'mind',d:'Cannot act for the duration.'},confuse:{n:'Confuse',c:.6,t:'mind',d:'Target attacks whoever is near.'},
 quake:{n:'Earthshake',c:1.2,t:'world',d:'Topples walls and trees, and opens pits.'},inferno:{n:'Wildfire',c:.9,t:'world',d:'Ignites everything in the area.'},deepfreeze:{n:'Deep Winter',c:.7,t:'world',d:'Freezes all water and snuffs all flame in the area.'},rain:{n:'Call Storm',c:1,t:'world',d:'Summons a thunderstorm.'},growth:{n:'Overgrowth',c:.5,t:'world',d:'Trees and vines erupt from the ground. Crops ripen.'},teleport:{n:'Recall',c:.6,t:'world',d:'Blink to any seen tile within range.'},timestop:{n:'Stop Time',c:2.6,t:'self',d:'Every other creature freezes for the duration.'},raiseall:{n:'Mass Raise',c:1.5,t:'world',d:'All corpses in the area rise for you.'},
};
const CLASSES={
 barbarian:{n:'Barbarian',st:{str:8,int:2,sth:2,spd:5,agi:4},gear:['axe','hide'],items:{cooked:2,water:2,flint:1},d:'Heavy melee and a thick skin. Threats land harder.',threat:20},
 archer:{n:'Archer',st:{str:3,int:3,sth:4,spd:5,agi:8},gear:['musket','leather'],items:{shot:14,blade:1,cooked:1,water:2,flint:1},d:'A marksman with musket and shot. Wet weather can spoil a shot.'},
 mage:{n:'Mage',st:{str:2,int:8,sth:3,spd:4,agi:3},gear:['staff','robe'],items:{cooked:1,water:2,dust:3},spells:['firebolt','frost','heal','sleep','brainwash','raise'],d:'Spells from fire to mind control and necromancy. Can invent new ones.'},
 rogue:{n:'Rogue',st:{str:3,int:3,sth:8,spd:6,agi:5},gear:['dagger','leather'],items:{lockpick:4,smokebomb:2,club:1,cooked:1,water:2,flint:1},d:'Silent kills, knockouts, pickpocketing, and locks.'},
 speaker:{n:'Speaker',st:{str:3,int:7,sth:4,spd:4,agi:4},gear:['blade','robe'],items:{cooked:1,water:2,flint:1},coins:80,speak:25,d:'A silver tongue. Large bonus to persuade, deceive, and bribe.'},
 herbalist:{n:'Herbalist',st:{str:3,int:6,sth:5,spd:5,agi:4},gear:['staff','hide'],items:{bloodmoss:3,dreamroot:3,ashcap:2,tonic:1,salve:2,water:2,seedwheat:3,seedturnip:3,flint:1},spells:['charm'],d:'Knows every plant. Tames beasts and knocks out enemies without killing.',herb:1},
 sapper:{n:'Sapper',st:{str:5,int:5,sth:3,spd:4,agi:6},gear:['pistol','leather'],items:{shot:8,powder:2,firebomb:2,shovel:1,pick:1,wood:4,flint:1,water:2},d:'Explosives, traps, and tunneling. Best at the forge.',forge:2},
};
// creature table: g glyph, c color, hp, a attack, ar armor, s speed, f faction, tags
const SP={
 rabbit:{n:'Rabbit',g:'r',c:'#c9b38f',hp:3,a:0,s:130,f:'beast',t:'animal prey herb coward',loot:{rawmeat:1},xp:1},
 deer:{n:'Deer',g:'d',c:'#b58a55',hp:9,a:2,s:125,f:'beast',t:'animal prey herb coward protective',loot:{rawmeat:2,pelt:1},xp:2},
 wolf:{n:'Wolf',g:'w',c:'#a7adb5',hp:12,a:3,ar:0,s:110,f:'beast',t:'animal predator pack opportunist',eats:['deer','rabbit','goat','boar','rat','camel'],loot:{rawmeat:1,pelt:1,fang:1},xp:5},
 boar:{n:'Boar',g:'b',c:'#8d6a4f',hp:14,a:3,ar:1,s:100,f:'beast',t:'animal herb territorial protective forager',loot:{rawmeat:2,pelt:1},xp:4},
 bear:{n:'Bear',g:'B',c:'#7a5230',hp:34,a:8,ar:1,s:95,f:'beast',t:'animal predator territorial hibernate forager',eats:['deer','boar','rabbit'],loot:{rawmeat:3,pelt:2,fang:2},xp:14},
 rat:{n:'Giant rat',g:'R',c:'#8f7f75',hp:5,a:2,s:110,f:'beast',t:'animal scavenger carrier',eats:['corpse'],loot:{},xp:1},
 crow:{n:'Crow',g:'c',c:'#50505a',hp:3,a:1,s:150,f:'beast',t:'animal scavenger flier coward',loot:{},xp:1},
 snake:{n:'Viper',g:'s',c:'#5da04f',hp:6,a:3,s:90,f:'beast',t:'animal territorial coldblood venom',loot:{fang:1},xp:3},
 jaguar:{n:'Jaguar',g:'J',c:'#d9a843',hp:20,a:7,s:125,f:'beast',t:'animal predator noct ambush',eats:['monkey','deer','boar'],loot:{rawmeat:2,pelt:2,fang:1},xp:9},
 monkey:{n:'Thieving monkey',g:'m',c:'#a87748',hp:6,a:1,s:130,f:'beast',t:'animal thief coward herb',loot:{},xp:2},
 mosquito:{n:'Mosquito swarm',g:'q',c:'#778',hp:2,a:1,s:130,f:'beast',t:'animal swarm flier feverbite coldblood firefear smokefear',loot:{},xp:1},
 bees:{n:'Bee swarm',g:'e',c:'#e4c23c',hp:4,a:2,s:140,f:'beast',t:'animal swarm flier smokefear coldblood guardian',loot:{},xp:2},
 flytrap:{n:'Snapjaw plant',g:'F',c:'#8ec24a',hp:14,a:5,s:100,f:'beast',t:'plant still mindless flammable',loot:{dreamroot:1},xp:5},
 spider:{n:'Giant spider',g:'x',c:'#6a5a78',hp:12,a:4,s:115,f:'spider',t:'animal predator venom webber coldblood smokefear',eats:['monkey','rabbit','rat'],loot:{chitin:1,silk:1},xp:6},
 scorpion:{n:'Scorpion',g:'S',c:'#b0702e',hp:10,a:4,ar:2,s:100,f:'beast',t:'animal predator venom noct heatrest',eats:['lizard','rat'],loot:{chitin:1},xp:5},
 lizard:{n:'Sand lizard',g:'l',c:'#c5a660',hp:5,a:1,s:120,f:'beast',t:'animal prey coward',loot:{rawmeat:1},xp:1},
 camel:{n:'Camel',g:'C',c:'#c7a06a',hp:16,a:2,s:110,f:'beast',t:'animal prey herb coward thirsty',loot:{rawmeat:3,pelt:1},xp:3},
 vulture:{n:'Vulture',g:'v',c:'#6f5e52',hp:6,a:2,s:125,f:'beast',t:'animal scavenger flier coward',eats:['corpse'],loot:{},xp:2},
 worm:{n:'Sand worm',g:'W',c:'#c98f5a',hp:42,a:11,ar:1,s:115,f:'beast',t:'animal burrow predator tremor deaf-to-sneak',eats:['camel','lizard'],loot:{chitin:3,fang:2},xp:22},
 goat:{n:'Mountain goat',g:'g',c:'#d8d2c0',hp:10,a:3,s:115,f:'beast',t:'animal prey herb territorial',loot:{rawmeat:2,pelt:1},xp:2},
 yeti:{n:'Yeti',g:'Y',c:'#dfeaf2',hp:40,a:10,ar:1,s:105,f:'beast',t:'animal predator winterborn',eats:['goat','wolf'],loot:{pelt:3,fang:2},xp:24},
 hound:{n:'Horde hound',g:'h',c:'#90554a',hp:13,a:5,s:125,f:'horde',t:'animal scenter',loot:{pelt:1,fang:1},xp:5},
 villager:{n:'Villager',g:'@',c:'#d9c9a3',hp:12,a:2,s:100,f:'free',t:'person talks coward opendoor diur',loot:{},xp:2},
 farmer:{n:'Farmer',g:'@',c:'#a8c26a',hp:13,a:2,s:100,f:'free',t:'person talks coward opendoor diur',xp:2},
 guard:{n:'Village guard',g:'@',c:'#8fb0d8',hp:24,a:5,ar:2,s:100,f:'free',t:'person talks opendoor brave',xp:6},
 merchant:{n:'Merchant',g:'@',c:'#e0b84e',hp:13,a:2,s:100,f:'free',t:'person talks coward opendoor diur trader',xp:2},
 smith:{n:'Blacksmith',g:'@',c:'#c67f4b',hp:22,a:5,ar:1,s:100,f:'free',t:'person talks opendoor diur trader',xp:4},
 healer:{n:'Healer',g:'@',c:'#d38bb5',hp:12,a:1,s:100,f:'free',t:'person talks coward opendoor diur trader healer',xp:2},
 elder:{n:'Village elder',g:'@',c:'#f0e6c8',hp:11,a:1,s:90,f:'free',t:'person talks coward opendoor diur leader',xp:2},
 hermit:{n:'Hermit',g:'@',c:'#a6a06f',hp:14,a:2,s:90,f:'free',t:'person talks opendoor trader',xp:2},
 bandit:{n:'Bandit',g:'@',c:'#c47a55',hp:17,a:5,ar:1,s:105,f:'bandit',t:'person talks opendoor greedy',loot:{},xp:7},
 rusk:{n:'Rusk the Bandit Lord',g:'@',c:'#ee8c5c',hp:40,a:8,ar:2,s:105,f:'bandit',t:'person talks opendoor greedy unique sleepnight',xp:30},
 hunter:{n:'Jungle hunter',g:'@',c:'#6fbf73',hp:18,a:5,s:115,f:'hunter',t:'person talks opendoor ranged brave',loot:{},xp:7},
 shaman:{n:'Jungle shaman',g:'@',c:'#9ae0a8',hp:14,a:3,s:100,f:'hunter',t:'person talks opendoor trader healer',xp:5},
 nomad:{n:'Desert nomad',g:'@',c:'#dcb26b',hp:17,a:5,s:110,f:'nomad',t:'person talks opendoor ranged thirsty trader',xp:6},
 nelder:{n:'Nomad matriarch',g:'@',c:'#f0d090',hp:14,a:3,s:90,f:'nomad',t:'person talks opendoor leader thirsty',xp:5},
 goblin:{n:'Goblin peddler',g:'k',c:'#8fae3e',hp:9,a:2,s:115,f:'goblin',t:'person talks coward opendoor trader greedy thief',xp:3},
 horde:{n:'Horde warrior',g:'@',c:'#d9483f',hp:22,a:7,ar:2,s:100,f:'horde',t:'person talks opendoor horde',loot:{},xp:10},
 captain:{n:'Horde captain',g:'@',c:'#f06a5a',hp:36,a:9,ar:3,s:100,f:'horde',t:'person talks opendoor horde brave leader',xp:20},
 hshaman:{n:'Horde bone-shaman',g:'@',c:'#d885b0',hp:20,a:4,s:95,f:'horde',t:'person talks opendoor horde caster',xp:14},
 troll:{n:'Bridge troll',g:'T',c:'#7fa56a',hp:55,a:11,ar:2,s:85,f:'troll',t:'person talks dim firefear regen',loot:{fang:2,bone:2},xp:25},
 ixa:{n:'Ixa, Spider Matriarch',g:'X',c:'#b28ad8',hp:60,a:9,ar:2,s:100,f:'spider',t:'talks unique venom webber coldblood smokefear still-ish',loot:{silk:4,chitin:3},xp:40},
 skeleton:{n:'Skeleton',g:'z',c:'#ddd8c8',hp:14,a:4,s:95,f:'undead',t:'undead mindless',loot:{bone:2},xp:6},
 thirsty:{n:'Thirsting dead',g:'Z',c:'#b9a57d',hp:20,a:6,ar:1,s:90,f:'undead',t:'undead blindsense thirstdead',loot:{bone:2,dust:1},xp:10},
 sephet:{n:'Queen Sephet',g:'Q',c:'#e8d27a',hp:55,a:9,ar:1,s:100,f:'undead',t:'undead talks unique caster',loot:{dust:5},xp:40},
 bat:{n:'Cave bat',g:'t',c:'#6a6470',hp:4,a:2,s:145,f:'beast',t:'animal flier cavedweller erratic',loot:{},xp:1},
 slime:{n:'Cave ooze',g:'o',c:'#6fc29a',hp:14,a:3,s:70,f:'beast',t:'mindless acid cavedweller',loot:{dust:1},xp:5},
 crawler:{n:'Pale crawler',g:'u',c:'#cfc7d8',hp:16,a:5,s:105,f:'beast',t:'animal predator cavedweller blindsense',loot:{chitin:1},xp:8},
 vorgath:{n:'King Vorgath',g:'@',c:'#ffd24a',hp:90,a:13,ar:3,s:105,f:'horde',t:'person talks opendoor unique horde brave king',xp:100},
 undeadthrall:{n:'Risen thrall',g:'z',c:'#9fc7a8',hp:12,a:4,s:90,f:'player',t:'undead mindless',loot:{},xp:0},
};
Object.values(SP).forEach(s=>{s.tags={};s.t.split(' ').forEach(x=>s.tags[x]=1);s.ar=s.ar||0;s.loot=s.loot||{}});
const FAC={free:{n:'Free Folk',enemy:['horde','bandit','undead','spider']},bandit:{n:'Bandits',enemy:['free','nomad','undead']},hunter:{n:'Jungle Hunters',enemy:['horde','spider','undead']},nomad:{n:'Nomads',enemy:['horde','undead','bandit']},horde:{n:'The Horde',enemy:['free','hunter','nomad','undead']},undead:{n:'The Dead',enemy:['free','hunter','nomad','horde','bandit','goblin']},spider:{n:'Spider Brood',enemy:['free','hunter','goblin']},goblin:{n:'Goblins',enemy:[]},troll:{n:'Trolls',enemy:[]},beast:{n:'Wild beasts',enemy:[]}};
const REPF=['free','bandit','hunter','nomad','horde','goblin','troll'];

// crafting: q out count, need materials, near: requires heat|forge
const RECIPES=[
 {out:'torch',q:2,need:{wood:1},g:'Camp'},{out:'rope',q:1,need:{silk:1},g:'Camp'},{out:'rope',q:1,need:{pelt:1},g:'Camp'},{out:'lockpick',q:2,need:{iron:1},g:'Camp'},{out:'flask',q:2,need:{wax:1},g:'Camp'},{out:'shot',q:6,need:{iron:1,ashcap:1},g:'Camp'},{out:'stoneblock',q:2,need:{stone:2},g:'Camp'},
 {out:'smokebomb',q:1,need:{flask:1,wood:1},g:'Alchemy'},{out:'firebomb',q:1,need:{oilflask:1,wood:1},g:'Alchemy'},{out:'oilflask',q:2,need:{flask:2,wax:1},g:'Alchemy'},{out:'sleepbomb',q:1,need:{flask:1,dreamroot:2},g:'Alchemy'},{out:'poisonbomb',q:1,need:{flask:1,ashcap:2},g:'Alchemy'},{out:'powder',q:1,need:{ashcap:2,wood:2,iron:1},g:'Alchemy'},
 {out:'salve',q:1,need:{bloodmoss:1,wax:1},g:'Alchemy',alt:{bloodmoss:2}},{out:'tonic',q:1,need:{bloodmoss:1,sunleaf:1},g:'Alchemy'},{out:'sleepdraught',q:1,need:{dreamroot:1,flask:1},g:'Alchemy'},{out:'poisonvial',q:1,need:{ashcap:1,flask:1},g:'Alchemy'},{out:'manapot',q:1,need:{dust:1,flask:1},g:'Alchemy'},{out:'baitsleep',q:1,need:{rawmeat:1,dreamroot:1},g:'Alchemy'},{out:'baitpoison',q:1,need:{rawmeat:1,ashcap:1},g:'Alchemy'},
 {out:'cooked',q:1,need:{rawmeat:1},near:'cook',g:'Kitchen'},{out:'bread',q:2,need:{wheat:2},near:'cook',g:'Kitchen'},{out:'stew',q:1,need:{cooked:1,turnip:1,water:1},near:'cook',g:'Kitchen'},{out:'stew',q:1,need:{rawmeat:1,mushroom:1,water:1},near:'cook',g:'Kitchen'},{out:'jerky',q:2,need:{rawmeat:2,sunleaf:1},near:'cook',g:'Kitchen'},{out:'pie',q:1,need:{berries:2,bread:1},near:'cook',g:'Kitchen'},{out:'mead',q:1,need:{honey:1,water:1},near:'cook',g:'Kitchen'},{out:'warbroth',q:1,need:{cooked:1,bloodmoss:1,water:1},near:'cook',g:'Kitchen'},
 {out:'hide',q:1,need:{pelt:2},g:'Clothier'},{out:'furcoat',q:1,need:{pelt:3,rope:1},g:'Clothier'},{out:'shroud',q:1,need:{silk:1,pelt:1},g:'Clothier'},{out:'hordegarb',q:1,need:{pelt:2,bone:2,banner:1},g:'Clothier'},
 {out:'iron',q:1,need:{ironore:2},near:'forge',g:'Smelter'},{out:'steel',q:1,need:{iron:2,wood:1},near:'forge',g:'Smelter'},{out:'stariron',q:1,need:{starore:2,wood:2},near:'forge',g:'Smelter'},
];
// forge: base + material + enchant
const FBASE={sword:{n:'Sword',kind:'wpn',d:6,st:'str',cost:2,req:{str:4}},greataxe:{n:'Greataxe',kind:'wpn',d:10,st:'str',cost:4,req:{str:7},chop:1},rapier:{n:'Rapier',kind:'wpn',d:5,st:'agi',cost:2,req:{agi:4}},shiv:{n:'Shiv',kind:'wpn',d:3,st:'sth',cost:1,quiet:1},maul:{n:'Padded maul',kind:'wpn',d:4,st:'str',cost:2,mercy:1},focus:{n:'Mage focus',kind:'wpn',d:3,st:'int',cost:2,manaP:6},
 musket:{n:'Forged musket',kind:'wpn',d:12,st:'agi',cost:3,rng:9,gun:1,req:{agi:4}},repeater:{n:'Repeating carbine',kind:'wpn',d:9,st:'agi',cost:5,rng:7,gun:1,norld:1,req:{agi:7}},cuirass:{n:'Cuirass',kind:'arm',ar:5,cost:4,req:{str:5},noisy:1},brigandine:{n:'Brigandine',kind:'arm',ar:3,cost:2,req:{str:3}},cloak:{n:'Ranger cloak',kind:'arm',ar:1,cost:1,warm:20}};
const FMAT={iron:{n:'Iron',mult:1,it:'iron'},steel:{n:'Steel',mult:1.4,it:'steel'},chitin:{n:'Chitin',mult:1.15,it:'chitin',light:1},bone:{n:'Bone',mult:.9,it:'bone',eerie:1},stariron:{n:'Star-iron',mult:2,it:'stariron',arcane:1}};
const FENCH={none:{n:'No enchant',dust:0},flame:{n:'Flame',dust:2,d:'Hits ignite the target.'},frost:{n:'Frostbite',dust:2,d:'Hits slow the target.'},thunder:{n:'Thunder',dust:3,d:'Hits arc through water.'},venom:{n:'Venom',dust:2,d:'Hits poison the target.'},mercy:{n:'Mercy',dust:2,d:'Never kills. Beaten foes fall unconscious.'},leech:{n:'Leeching',dust:4,d:'Each hit heals you.'},silence:{n:'Silence',dust:2,d:'Strikes and shots make no noise.'},warmth:{n:'Warmth',dust:1,d:'You stay warm in winter.'},cool:{n:'Coolness',dust:1,d:'You stay cool in heat.'},dread:{n:'Dread',dust:3,d:'Foes you hit may flee in terror.'},haste:{n:'Haste',dust:4,d:'Adds 2 Speed while equipped.'}};
const BUILD={woodwall:{n:'Wooden wall',need:{wood:2}},stonewall:{n:'Stone wall',need:{stoneblock:2}},door:{n:'Door',need:{wood:2}},woodfloor:{n:'Wooden floor',need:{wood:1}},bed:{n:'Bed',need:{wood:2,pelt:1}},chest:{n:'Chest',need:{wood:3}},campfire:{n:'Campfire',need:{wood:2}},forge:{n:'Forge',need:{stoneblock:4,iron:1}},spellforge:{n:'Spellforge',need:{stoneblock:3,dust:3}},bridge:{n:'Bridge plank',need:{wood:2}},soil:{n:'Tilled soil',need:{}},pit:{n:'Pit trap',need:{},tool:'shovel'},spikes:{n:'Spike trap',need:{wood:2}},snare:{n:'Rope snare',need:{rope:1}},scarecrow:{n:'Scarecrow',need:{wood:2}},barrel:{n:'Powder barrel',need:{powder:1}}};
const CROPS={wheat:{n:'wheat',grow:60,item:'wheat',q:3},turnip:{n:'turnips',grow:45,item:'turnip',q:2},gourd:{n:'gourds',grow:90,item:'gourd',q:2}};
const DISEASE={marsh:{n:'Marsh fever',d:'Weak and shivering. Strength and Speed fall.',str:-2,spd:-1,dur:300},rot:{n:'Bloodrot',d:'Stomach sickness. You hunger much faster.',hunger:2,dur:250},cough:{n:'Grey cough',d:'Coughing gives you away. Intelligence falls. Spreads to others.',int:-2,cough:1,dur:300},frostbite:{n:'Frostbite',d:'Numb limbs. Agility and Speed fall.',agi:-2,spd:-2,dur:220},mummy:{n:'Tomb rot',d:'Your flesh dries. You thirst much faster.',thirst:2,dur:300},sun:{n:'Sunsickness',d:'Dizzy from the heat. Intelligence and Agility fall.',int:-1,agi:-1,dur:150}};
const RIDDLES=[{q:'I drink and never swallow. I walk the desert with no feet. Kings and beggars lose me equally. What am I?',a:['Time','The wind','The river'],c:0},{q:'The more you take from me, the larger I become.',a:['A debt','A hole','A kingdom'],c:1},{q:'I am always hungry and must be fed. The finger I touch will soon turn red.',a:['Fire','A wolf','A blade'],c:0},{q:'I have cities with no houses, rivers with no water, and forests with no trees.',a:['A dream','A map','A grave'],c:1},{q:'What is broken the moment you speak its name?',a:['An oath','Silence','A spell'],c:1},{q:'Two bodies have I, though both joined in one. The stiller I stand, the faster I run.',a:['An hourglass','A river','A ghost'],c:0}];
const LORE={diary:'Vorgath was born Aldric, a shepherd of the high pastures. His diary ends the winter his daughter was lost.',hermit:'The hermit knew him: "Aldric gave up his flock to search the snows for his girl Mira. He found the amulet instead."',shaman:'The bone-shaman admits the Aegis whispers in his voice. It keeps the king alive and takes a memory each winter.',nomad:'The matriarch says: "The Aegis needs a grief to feed on. Break it, and the grief is all that is left of him."',locket:"Mira's locket holds a child's drawing of a shepherd and sheep. She lived. She grew old in the desert and never knew who hunted for her."};
