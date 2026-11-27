// ===== MORE SPECIES: battle casters, islanders, sea life =====
function addSpecies(k,r){SPR[k]=r;const[n,spr,c1,c2,hp,a,ar,s,f,t,xp,loot]=r;const tags={};t.split(' ').forEach(x=>tags[x]=1);const lo={};(loot||'').split(',').filter(Boolean).forEach(e=>{const[a2,b]=e.split(':');lo[a2]=+(b||1)});SP[k]={k,n,spr,c:c1,c2,hp,a,ar,s,f,t,tags,xp,loot:lo,g:n[0]}}
Object.assign(ITEMS,{egg:{n:'Seabird egg',k:'food',hun:10,v:3,stack:1,raw:1},shell:{n:'Turtle shell',k:'mat',v:18,stack:1},kelp:{n:'Kelp',k:'food',hun:6,thi:4,v:2,stack:1},rum:{n:'Island rum',k:'drink',thi:10,v:12,stack:1,drunk:1}});
// casters for every army and band
addSpecies('warmage',['War wizard','hum','#7a9ae8','#e8e0f0',22,4,1,100,'free','person talks opendoor caster brave',18,'dust:2,coins:15']);
addSpecies('chaplain',['Battle chaplain','hum','#f0e0a0','#a08030',26,5,2,100,'free','person talks opendoor caster brave armored',16,'tonic,coins:10']);
addSpecies('hedgemage',['Hedge mage','hum','#9a7ac0','#3a2a40',16,3,0,105,'bandit','person talks opendoor caster greedy',12,'dust,coins:12']);
addSpecies('stormcaller',['Pirate storm-caller','hum','#4ac0d0','#202020',20,4,0,105,'pirate','person talks opendoor caster swimmer',16,'pearl,coins:20']);
addSpecies('warlock',['Horde warlock','hum','#c03050','#1a0a10',24,5,1,100,'horde','person talks opendoor horde caster',20,'dust:2,fang:2']);
addSpecies('sandseer',['Dune seer','hum','#e0c070','#7a4a20',18,3,0,110,'nomad','person talks opendoor caster',12,'dust']);
addSpecies('runecaster',['Rune-caster','hum','#a0d0f0','#3a4a6a',22,4,1,95,'free','person talks opendoor caster brave',14,'dust:2']);
addSpecies('seawitch',['Sea witch','hum','#3aa090','#e0f0e0',22,3,0,95,'free','person talks opendoor caster trader swimmer',16,'pearl:2,dust:2']);
KITS.warmage={spells:['firebolt','fireball','frost','ward']};KITS.chaplain={spells:['heal','bless','ward','fear']};KITS.hedgemage={spells:['sleep','blink','charm','gust']};KITS.stormcaller={spells:['shock','gust','frost','ward']};KITS.warlock={spells:['fireball','hex','fear','raise']};KITS.sandseer={spells:['gust','blink','sleep','hex']};KITS.runecaster={spells:['frost','ward','shock','bless']};KITS.seawitch={spells:['frost','charm','waterwalk','hex','heal']};
KITS.battlemage.spells=['firebolt','fireball','shock','frost','brainwash'];KITS.hshaman.spells=['fear','heal','raise','bless','hex'];
// islanders and island folk
addSpecies('islander',['Islander','hum','#e0a050','#3a7a5a',14,3,0,105,'free','person talks opendoor swimmer diur trader',3,'']);
addSpecies('castaway',['Castaway','hum','#c0b090','#6a6050',10,2,0,95,'free','person talks opendoor coward',2,'']);
addSpecies('keeper',['Lighthouse keeper','hum','#e0e0e0','#3a4a7a',14,2,0,90,'free','person talks opendoor trader',3,'']);
addSpecies('merfolk',['Merfolk','fish','#40b0b0','#e0d0a0',20,5,1,120,'free','person talks swimmer sea amphib trader',8,'pearl']);
addSpecies('drowned',['Drowned sailor','hum','#5a8a8a','#203030',22,6,1,85,'undead','undead swimmer nightly',10,'coins:6']);
// island and reef wildlife
addSpecies('turtle',['Sea turtle','croc','#5a8a4a','#c0b070',22,1,4,60,'beast','animal prey swimmer sea amphib coast',3,'shell,rawmeat:2']);
addSpecies('gull',['Seagull','bird','#f0f0f0','#909090',4,1,0,140,'beast','animal flier thief coward small coast',1,'']);
addSpecies('coconutcrab',['Coconut crab','crab','#6a3a7a','#e0a0c0',14,5,3,80,'beast','animal territorial coast',4,'crab,chitin']);
addSpecies('komodo',['Dragon lizard','croc','#7a7a50','#c0a070',38,9,2,95,'beast','animal predator bloodscent venomous',14,'rawmeat:3,pelt']);
addSpecies('iguana',['Marine iguana','croc','#3a3a3a','#e04020',8,1,1,80,'beast','animal prey swimmer coward small coast',1,'rawmeat']);
addSpecies('walrus',['Walrus','croc','#8a5a4a','#f0e0c0',40,7,2,70,'beast','animal territorial swimmer coast',8,'ivory,rawmeat:3,pelt']);
addSpecies('penguin',['Penguin','bird','#202020','#f0f0f0',6,1,0,85,'beast','animal prey swimmer coward small coast',1,'rawmeat']);
addSpecies('roc',['Roc','wing','#a07040','#f0d080',90,16,2,140,'beast','animal predator flier huge brave',60,'rawmeat:6,pelt:2']);
addSpecies('jelly',['Jellyfish bloom','blob','#e0a0f0','#ffffff',8,4,0,40,'beast','animal sea swarm venomous',2,'']);
addSpecies('seasnake',['Sea snake','serpent','#e0e040','#202020',10,6,0,120,'beast','animal predator sea venomous',4,'']);
addSpecies('dolphin',['Dolphin','fish','#7aa0c0','#e0f0ff',24,4,0,170,'beast','animal sea coward',4,'']);
addSpecies('whale',['Great whale','serpent','#3a4a6a','#c0d0e0',160,12,3,90,'beast','animal sea huge coward',30,'rawmeat:8']);
addSpecies('manta',['Manta ray','fish','#2a3a4a','#e0e0e0',18,2,0,130,'beast','animal sea coward',3,'']);
// cart and boat drivers use ordinary people; these are the beasts that pull vehicles
addSpecies('ox',['Ox','quad_l','#8a6a4a','#e0d0b0',30,4,1,85,'beast','animal prey herd tamable',4,'rawmeat:4,pelt']);
addSpecies('sleddog',['Sled dog','quad_s','#c0c0c8','#3a3a40',14,4,0,140,'beast','animal pack tamable',3,'']);
// new spells (castable by people and creatures alike)
Object.assign(SPELLS,{fireball:{n:'Fireball',mp:7,int:5,rng:7,d:'Explodes in a ball of flame that sets everything nearby alight.'},ward:{n:'Ward',mp:4,int:3,self:1,d:'A shimmering shield that soaks up blows. Casters put it on allies.'},bless:{n:'Battle Blessing',mp:6,int:4,self:1,d:'Heals and emboldens you and every ally nearby.'},hex:{n:'Hex',mp:4,int:3,rng:6,d:'Curses a target: it hits weakly and sickens for a while.'}});
// sea and island tables
WILD.sea=(WILD.sea||[]).concat([['dolphin',2],['manta',1],['jelly',1],['whale',.4],['turtle',1]]);
WILD.deep=(WILD.deep||[]).concat([['whale',.8],['serpent',.5],['manta',1],['dolphin',1]]);
WILD.reef=(WILD.reef||[]).concat([['seasnake',1.5],['jelly',1.5],['turtle',2],['manta',1],['dolphin',1]]);
WILD.beach=(WILD.beach||[]).concat([['gull',2],['turtle',1],['iguana',.5]]);
const ISLEWILD={tropical:[['monkey',2],['parrot',2],['coconutcrab',2],['python',1],['gull',2],['turtle',1],['iguana',1],['boar',1]],atoll:[['turtle',3],['gull',3],['coconutcrab',2],['giantcrab',1],['iguana',1]],temperate:[['gull',3],['seal',2],['deer',1],['fox',1],['boar',1]],frost:[['penguin',3],['seal',3],['walrus',2],['icebear',.6],['gull',1]],volcanic:[['komodo',1.5],['lizard',2],['salamander',1],['gull',1],['roc',.25]],desert:[['lizard',2],['scorpion',2],['coconutcrab',1],['vulture',1],['iguana',2]],mystic:[['wisp',2],['shroomfolk',2],['harpy',1],['crysgolem',.4],['gull',1]]};
EATS.komodo=['boar','iguana','turtle','deer','monkey','penguin','seal','goat'];EATS.roc=['boar','deer','seal','walrus','turtle','goat','komodo','horse','camel'];EATS.seasnake=['manta'];EATS.walrus=[];
