const stubs=()=>{};
function run(cls,size,seed,steps){newGame({cls,name:'T',size,seed});let errs=0;const dirs=DIRS;
 for(let i=0;i<steps&&!G.over;i++){const q=R();try{
   G.p.hp=G.p.mh;G.p.hunger=90;G.p.thirst=90;
   if(q<.8){const d=pick(dirs);const r=actMove(d[0],d[1]);if(r&&r.tile){const s=actionSheetFor(r.tile.x,r.tile.y)}if(r&&r.sheet){}}
   else if(q<.9){const x=G.p.x+ri(-4,4),y=G.p.y+ri(-4,4);if(inb(L,x,y)&&L.seen[IX(x,y)]){const s=actionSheetFor(x,y);const os=s.options.filter(o=>!o.disabled&&o.label!=='Close'&&o.label!=='Walk here');if(os.length){let r=pick(os).fn();let g=0;while(r&&r.options&&g++<3){const o2=r.options.filter(o=>!o.disabled&&o.label!=='Leave'&&o.label!=='Close'&&o.label!=='Done');if(!o2.length)break;r=pick(o2).fn()}}}}
   else if(q<.95){const it=pick(G.p.inv);if(it)useItem(it)}else actWait();
 }catch(e){errs++;console.log('ERR',e.stack.split('\n').slice(0,4).join(' | '));if(errs>4)break}}
 return {turn:G.turn,errs,over:G.over&&G.over.kind,by:G.over&&G.over.by,cr:G.levels.world.cr.length,log:G.log.length,size:JSON.stringify(G).length}}
for(const[c,s,sd]of[['mage',96,11],['rogue',48,22],['speaker',96,33],['barbarian',48,44],['sapper',96,55],['herbalist',48,66],['archer',96,77]])console.log(c,s,run(c,s,sd,1500));

