// ===== WILDLIFE POPULATIONS: births, deaths, hunting pressure, dens, migration, hibernation =====
const HIBERNATE=['bear'],TORPID=['python','cobra','snake','lizard','croc','iguana','komodo','scorpion','salamander'];
function regionKey(x,y){return((y>>6)<<10)|(x>>6)}
const _dieW=die;die=function(c,src,kind){if(c&&!isP(c)&&c.wild&&src&&isP(src)&&!SP[c.s].tags.person){G.hunt=G.hunt||{};const k=regionKey(c.x,c.y);G.hunt[k]=(G.hunt[k]||0)+1;if(G.hunt[k]===8)msg('Game is getting scarce around here.','hint')}return _dieW(c,src,kind)};
const _realizeWildW=realizeWild;realizeWild=function(ck){const before=G.wild[ck]?G.wild[ck].length:undefined;const cr0=new Set(L.cr);const r=_realizeWildW(ck);const list=G.wild[ck];const cx=(ck%4096)*32+16,cy=Math.floor(ck/4096)*32+16;
 if(list&&before!==undefined&&list.length>before){const pr=(G.hunt||{})[regionKey(cx,cy)]||0;const f=Math.max(.15,1-pr/10);const keep=before+Math.ceil((list.length-before)*f);list.length=keep}
 if(list&&!list.den&&list.some(q=>SP[q.s]&&(SP[q.s].tags.predator||SP[q.s].tags.pack))){const q=list.find(q=>SP[q.s].tags.predator||SP[q.s].tags.pack);list.den={x:q.x,y:q.y,s:q.s}}
 const se=seasonIdx();const bk=biomeKey(cx,cy);const tropical=['jungle','bamboo','mangrove','savanna','desert','badlands','saltflat','swamp','beach'].includes(bk);
 for(const c of L.cr){if(cr0.has(c)||!c.wild)continue;if(list&&list.den&&(SP[c.s].tags.predator||SP[c.s].tags.pack)&&dist(c.x,c.y,list.den.x,list.den.y)<30)c.home={x:list.den.x,y:list.den.y};if(se===3&&(HIBERNATE.includes(c.s)||TORPID.includes(c.s)&&!tropical)){c.sleep=1e6;c.hib=1}}
 return r};
// sleeping hibernators wake when hurt; everyone wakes in spring
const _hurtW=hurt;hurt=function(t,dm,src,kind){if(t&&t.hib){t.hib=0;t.sleep=0;t.alert=2;if(visible(t.x,t.y))msg(cname(t)+' wakes from its winter sleep, furious.','bad')}return _hurtW(t,dm,src,kind)};
function springBreeding(){let born=0;for(const ck in G.wild){const list=G.wild[ck];if(!Array.isArray(list)||!list.length)continue;const by={};list.forEach(q=>{by[q.s]=(by[q.s]||0)+1});const cx=(ck%4096)*32+16,cy=Math.floor(ck/4096)*32+16;const pr=(G.hunt||{})[regionKey(cx,cy)]||0;Object.entries(by).forEach(([s,n])=>{const S=SP[s];if(!S||n<2||S.tags.person||S.tags.undead)return;const rate=S.tags.prey||S.tags.herd?.45:S.tags.predator?.2:.3;const kids=Math.floor(n*rate*Math.max(.2,1-pr/12));const parent=list.find(q=>q.s===s);for(let i=0;i<kids&&list.length<12;i++){list.push({s,x:clamp(parent.x+ri(-2,2),0,G.W-1),y:clamp(parent.y+ri(-2,2),0,G.H-1),young:1});born++}})}
 for(const k in G.hunt||{}){G.hunt[k]=Math.floor(G.hunt[k]/2);if(!G.hunt[k])delete G.hunt[k]}return born}
function winterCull(){for(const ck in G.wild){const list=G.wild[ck];if(!Array.isArray(list))continue;for(let i=list.length-1;i>=0;i--){const S=SP[list[i].s];if(S&&!S.tags.person&&chance(list[i].young?.3:.12))list.splice(i,1)}}}
// live animals wake in spring
const _seasonTickW=seasonTick;seasonTick=function(){const se0=G.lastSeason;_seasonTickW();const se=G.lastSeason;if(se0===undefined||se0===se)return;
 if(se===0){springBreeding();L.cr.forEach(c=>{if(c.hib){c.hib=0;c.sleep=0}});if(L.world)msg('Young animals are everywhere; the herds are heading north again.','hint')}
 if(se===3)winterCull();
 if(se===0||se===2){const herds=G.bands.filter(b=>!b.dead&&b.kind==='herd');herds.forEach(b=>{b.goal=null;b.path=null;b.migrate=G.turn});const near=herds.find(b=>dist(b.x,b.y,G.p.x,G.p.y)<120);if(near)logEvent('A great herd of '+(SP[(near.members[0]||{}).s]||{n:'beasts'}).n.toLowerCase()+' is on the move '+(se===2?'toward the warm lands.':'back to the summer pastures.'),null,0)}};
// herds keep summer and winter ranges
const _idleBandW=idleBand;idleBand=function(b){if(b.kind!=='herd')return _idleBandW(b);if(!b.sumR){const s=b.home!=null?G.sites[b.home]:null;const hx=s?s.x:b.x,hy=s?s.y:b.y;const eq=G.H/2;const towardPole=hy<eq?-1:1;const span=Math.round(55*Math.sqrt(G.F));b.sumR={x:hx,y:clamp(hy+towardPole*span,8,G.H-8)};b.winR={x:hx,y:clamp(hy-towardPole*span,8,G.H-8)}}
 const se=seasonIdx();const R0=se===2||se===3?b.winR:b.sumR;for(let i=0;i<8;i++){const x=clamp(Math.round(R0.x+ri(-30,30)),5,G.W-5),y=clamp(Math.round(R0.y+ri(-30,30)),5,G.H-5);if(!oceanAt(x,y)){const c=contAt(x,y);if(c&&c.id===b.cont){b.goal={x,y};return}}}return _idleBandW(b)};
