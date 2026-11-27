// ===== EVENT HOOKS, DATA MODS, AND THE DAILY CALENDAR THAT DRIVES THE NEW SYSTEMS =====
const Aegis={handlers:{},on(ev,fn){(this.handlers[ev]=this.handlers[ev]||[]).push(fn);return fn},off(ev,fn){this.handlers[ev]=(this.handlers[ev]||[]).filter(f=>f!==fn)},emit(ev,data){for(const f of this.handlers[ev]||[]){try{f(data,G)}catch(e){console.error('mod handler',ev,e)}}},mods:[],version:2};
if(typeof window!=='undefined')window.Aegis=Aegis;
// events fired by the game
const _advanceM=advance;advance=function(c){_advanceM(c);if(Aegis.handlers.turn)Aegis.emit('turn',{turn:G.turn})};
const _dieM=die;die=function(c,src,kind){const r=_dieM(c,src,kind);if(Aegis.handlers.death)Aegis.emit('death',{creature:c,by:src,kind});return r};
const _talkSheetM=talkSheet;talkSheet=function(c,...a){const r=_talkSheetM(c,...a);if(Aegis.handlers.talk)Aegis.emit('talk',{npc:c,sheet:r});return r};
const _crimeM=crime;crime=function(k,v){Aegis.emit('crime',{kind:k,victim:v});return _crimeM(k,v)};
const _trainM=train;train=function(k,a){const v0=G.p&&G.p.sk&&G.p.sk[k]?G.p.sk[k].v:0;_trainM(k,a);if(G.p&&G.p.sk&&G.p.sk[k]&&G.p.sk[k].v>v0)Aegis.emit('skillUp',{skill:k,value:G.p.sk[k].v})};
const _logEventM=logEvent;logEvent=function(t,s,w){_logEventM(t,s,w);Aegis.emit('worldEvent',{text:t,site:s,weight:w})};
// one daily and yearly calendar for every new system
function dailyWorld(){advTick();guildDaily();faithDaily();rulersDaily();settlementsDaily();shopsDaily();ranchDaily();const p=G.p;if(p.god==='vel'&&G.stats.lies>(p.liesSeen||0)){piety(-4*(G.stats.lies-(p.liesSeen||0)),'lying');}p.liesSeen=G.stats.lies;Aegis.emit('day',{day:Math.floor(G.turn/DAY)})}
function yearlyWorld(){rulersYearly();Aegis.emit('year',{year:yearNum()})}
const _seasonTickM=seasonTick;seasonTick=function(){const s0=G.lastSeason;_seasonTickM();if(s0!==undefined&&s0!==G.lastSeason){try{settlementsSeasonal(G.lastSeason)}catch(e){console.error(e)}Aegis.emit('season',{season:G.lastSeason})}};
// Kaurn speeds faithful sailors
const _vMoveCostM=vMoveCost;vMoveCost=function(v,dx,dy,m){let c=_vMoveCostM(v,dx,dy,m);if(isWaterV(v)&&G.p.aboard===v.id){if(G.p.god==='kaurn'&&(G.p.piety||0)>=20)c*=.85;c*=1-skv('sailing')/400}else if(G.p.aboard===v.id)c*=1-skv('driving')/400;return c};
// ---- data mods: JSON packs that add species, items, spells, recipes, wildlife, rumors and dialogue
const MODKEY='aegis-mods';
function applyMod(m){if(!m||typeof m!=='object')throw new Error('A mod must be a JSON object.');const out=[];
 if(m.species)Object.entries(m.species).forEach(([k,row])=>{if(!Array.isArray(row)||row.length<10)throw new Error('Species '+k+' needs a full row.');addSpecies(k,row);out.push('species '+k)});
 if(m.items)Object.entries(m.items).forEach(([k,d])=>{if(!d.n||!d.k)throw new Error('Item '+k+' needs n and k.');ITEMS[k]=d;out.push('item '+k)});
 if(m.spells)Object.entries(m.spells).forEach(([k,d])=>{if(!d.n||d.mp===undefined)throw new Error('Spell '+k+' needs n and mp.');SPELLS[k]=d;out.push('spell '+k)});
 if(m.kits)Object.assign(KITS,m.kits);
 if(m.recipes)m.recipes.forEach(r=>{if(!r.out||!r.need||!ITEMS[r.out])throw new Error('Recipe needs out (an item) and need.');RECIPES.push(Object.assign({g:'Camp'},r));out.push('recipe '+r.out)});
 if(m.wild)Object.entries(m.wild).forEach(([bk,list])=>{WILD[bk]=(WILD[bk]||[]).concat(list.filter(e=>SP[e[0]]))});
 if(m.rumors)Object.entries(m.rumors).forEach(([fac,list])=>{RUMORS[fac]=(RUMORS[fac]||[]).concat(list)});
 if(m.events)m.events.forEach(ev=>{if(ev.on==='day'&&ev.chance&&ev.message)Aegis.on('day',()=>{if(Math.random()<ev.chance)msg(ev.message,ev.tone||'story')});if(ev.on==='talk'&&ev.species&&ev.option&&ev.reply)Aegis.on('talk',({npc,sheet})=>{if(npc&&npc.s===ev.species&&sheet&&sheet.options){const i=sheet.options.findIndex(q=>q.label==='Leave');sheet.options.splice(i<0?sheet.options.length:i,0,{label:ev.option,fn:()=>reply(npc,ev.reply)})}})});
 Aegis.mods.push({id:m.id||'mod'+Aegis.mods.length,name:m.name||m.id||'Unnamed mod',version:m.version||'1',added:out.length});return out}
function savedMods(){try{return JSON.parse(localStorage.getItem(MODKEY)||'[]')}catch(e){return[]}}
function saveMods(list){try{localStorage.setItem(MODKEY,JSON.stringify(list))}catch(e){}}
function loadSavedMods(){savedMods().forEach(m=>{try{applyMod(m)}catch(e){console.error('mod failed',m&&m.id,e)}})}
loadSavedMods();
function modsScreen(){const list=savedMods();const box=el('div','forge');const ta=el('textarea');ta.rows=7;ta.placeholder='Paste a mod (JSON) here, or choose a file below.';ta.style.cssText='width:100%;background:#0a0e14;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;font:13px monospace';box.appendChild(ta);const f=el('input');f.type='file';f.accept='.json,application/json';box.appendChild(f);const out=el('p','preview','Mods only add content (creatures, items, spells, recipes, wildlife, rumors, simple events). They never run code. Restart the game after removing one.');box.appendChild(out);const go=el('button','btn pri','Install mod');box.appendChild(go);
 const install=txt=>{try{const m=JSON.parse(txt);const added=applyMod(m);const l=savedMods().filter(q=>q.id!==m.id);l.push(m);saveMods(l);out.textContent='Installed '+(m.name||m.id)+': '+added.length+' additions.';setTimeout(modsScreen,900)}catch(e){out.textContent='Could not install: '+e.message}};
 go.onclick=()=>install(ta.value);f.onchange=()=>{const r=new FileReader();r.onload=()=>install(r.result);if(f.files[0])r.readAsText(f.files[0])};
 showSheet({title:'Mods',text:list.length?'Installed: '+list.map(m=>(m.name||m.id)+' '+(m.version||'')).join(', '):'No mods installed.',html:box,options:list.map(m=>({label:'Remove '+(m.name||m.id),sub:'Takes effect after a restart',cls:'bad',fn:()=>{saveMods(savedMods().filter(q=>q.id!==m.id));modsScreen();return KEEP}}))})}
