// Autoplay bot: plays each seed for thousands of turns through the in-game autoplay() and reports errors and stuck states.
// Usage: node tests/bot.js [turns] [seed,seed,...] [scale]   (needs playwright)
const {chromium}=require('playwright');
(async()=>{const turns=+(process.argv[2]||4000);const seeds=(process.argv[3]||'11,22,33').split(',').map(Number);const scale=process.argv[4]||'vast';
const b=await chromium.launch();let bad=0;
for(const seed of seeds){const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(600);
const r=await pg.evaluate(({seed,turns,scale})=>{const cls=Object.keys(CLASSES);newGame({cls:cls[seed%cls.length],name:'Bot',seed,opt:{scale}});closeSheet();const r=autoplay(turns);let save=0;try{const s=serial();deserial(s);save=s.length}catch(e){r.errors.push('save/load: '+e.message)}r.save=save;return r},{seed,turns,scale});
r.pageErrors=errs.slice(0,5);const fail=r.errorCount||errs.length||!r.save;if(fail)bad++;console.log((fail?'FAIL ':'OK   ')+'seed '+seed+' '+JSON.stringify(r));await pg.close()}
await b.close();process.exit(bad?1:0)})();
