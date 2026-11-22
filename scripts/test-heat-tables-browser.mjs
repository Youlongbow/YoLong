import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.HEAT_URL||'https://www.ravenlong.com';
const expected={
 zh:{'01':[4],'02':[4,15,5],'05':[5,4,4],'06':[4],'10':[6]},
 en:{'01':[4],'02':[4,15,5],'05':[5],'06':[4],'10':[6]}
};
let ready=false;
for(let i=1;i<=16;i++){
 try{
  const res=await fetch(base+'/assets/app.js',{cache:'no-store',signal:AbortSignal.timeout(15000)});
  ready=res.ok&&(await res.text()).includes("renderCourseTable(chunk,richInline,lang)");
  console.log('HEAT_APP_DEPLOY_CHECK',i,ready);
  if(ready)break;
 }catch(e){console.log('HEAT_APP_DEPLOY_RETRY',i,String(e).slice(0,100));}
 await new Promise(resolve=>setTimeout(resolve,2500));
}
assert.ok(ready,'HEAT course table renderer is not yet deployed');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 for(const lang of ['zh','en']){
  for(const [slug,expectedRows] of Object.entries(expected[lang])){
   await desktop.goto(base+'/training/'+lang+'/'+slug+'/',{waitUntil:'domcontentloaded',timeout:60000});
   await desktop.waitForFunction(n=>document.querySelectorAll('.article-content .course-data-table').length===n,
    expectedRows.length,{timeout:25000});
   const grids=await desktop.locator('.article-content .course-data-table').evaluateAll(tables=>tables.map(table=>({
    headers:table.querySelectorAll('thead tr th').length,
    rows:[...table.querySelectorAll('tbody tr')].map(tr=>tr.children.length),
    meaningfulRows:table.querySelectorAll('tbody tr').length,
    headerText:[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim()),
    cellText:[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent.trim())),
    tableInsideRegion:table.parentElement.classList.contains('course-table'),
    overflow:getComputedStyle(table.parentElement).overflowX
   })));
   assert.deepEqual(grids.map(t=>t.meaningfulRows),expectedRows,lang+'/'+slug+' row totals');
   for(const table of grids){
    assert.ok(table.headers>=2 && table.headers<=3,'Expected 2-3 named columns');
    assert.ok(table.rows.every(n=>n===table.headers),'No shifted/missing columns');
    assert.ok(table.headerText.every(Boolean),'Header labels retained');
    assert.ok(table.cellText.every(row=>row.every(Boolean)),'Source content retained');
    assert.ok(table.tableInsideRegion&&table.overflow==='auto','Accessible horizontal table region');
   }
   const body=await desktop.locator('.article-content').innerText();
   assert.ok(!/\|\s*---\s*\|/.test(body),'Raw Markdown table delimiters must disappear');
   console.log('HEAT_RENDERED_TABLES_OK',lang,slug,grids.map(t=>t.headers+'c/'+t.meaningfulRows+'r').join(','));
  }
 }
 const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 for(const lang of ['zh','en']){
  for(const slug of ['02','05']){
   await phone.goto(base+'/training/'+lang+'/'+slug+'/',{waitUntil:'domcontentloaded',timeout:60000});
   await phone.waitForFunction(n=>document.querySelectorAll('.course-data-table').length===n,
    expected[lang][slug].length,{timeout:25000});
   const measures=await phone.locator('.course-table').evaluateAll(containers=>containers.map(el=>({
    width:el.clientWidth,scrollWidth:el.scrollWidth,overflow:getComputedStyle(el).overflowX,
    tableWidth:el.querySelector('table').getBoundingClientRect().width
   })));
   const hints=await phone.locator('.course-table-hint').evaluateAll(nodes=>nodes.map(el=>({text:el.textContent.trim(),visible:getComputedStyle(el).display!=='none'})));
   assert.equal(hints.length,expected[lang][slug].length);
   assert.ok(hints.every(h=>h.visible&&(lang==='zh'?h.text.includes('左右滑动'):h.text.includes('Swipe'))),'Mobile viewers can discover hidden table columns');
   const bodyOverflow=await phone.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(measures.every(m=>m.overflow==='auto'&&m.scrollWidth>m.width&&m.tableWidth>m.width),
    'Mobile HEAT tables must scroll inside their own regions');
   assert.ok(bodyOverflow<=2,'No whole-page horizontal overflow '+lang+'/'+slug);
   console.log('HEAT_MOBILE_TABLES_OK',lang,slug,JSON.stringify({measures,bodyOverflow}));
   if(lang==='zh'&&slug==='02'){
    await phone.locator('#site-transition.is-hidden').waitFor({state:'attached',timeout:12000});
    await phone.locator('.course-table').first().scrollIntoViewIfNeeded();
    console.log('HEAT_MOBILE_TABLE_PREVIEW_JPEG_BASE64:'+
      (await phone.screenshot({type:'jpeg',quality:43})).toString('base64'));
   }
  }
 }
 await desktop.goto(base+'/training/zh/02/',{waitUntil:'domcontentloaded',timeout:60000});
 await desktop.waitForFunction(()=>document.querySelectorAll('.course-data-table').length===3);
 await desktop.locator('#site-transition.is-hidden').waitFor({state:'attached',timeout:12000});
 await desktop.locator('.course-table').first().scrollIntoViewIfNeeded();
 console.log('HEAT_DESKTOP_TABLE_PREVIEW_JPEG_BASE64:'+
   (await desktop.screenshot({type:'jpeg',quality:43})).toString('base64'));
 console.log('HEAT_TABLE_BROWSER_AUDIT_PASS');
}finally{
 await browser.close();
}
