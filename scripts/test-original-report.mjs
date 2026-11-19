import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='https://yolong.bournelong511.workers.dev';
const assert=(ok,label)=>{if(!ok)throw Error(label);console.log('PASS:',label)};
try{
 const desktop=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];
 desktop.on('pageerror',e=>errors.push(e.message));
 const response=await desktop.goto(base+'/journal/en/in-amenas-report-original-2013/',{waitUntil:'domcontentloaded',timeout:60000});
 assert(response?.ok(),'Original In Amenas report route returns HTTP 200');
 await desktop.locator('.article-figure img').first().waitFor({timeout:60000});
 const figures=desktop.locator('.article-figure img');
 const count=await figures.count();
 console.log('ORIGINAL_REPORT_FIGURES',count);
 assert(count===86,'All 86 original report pages render as image elements');
 for(const index of [0,40,85]){
  const fig=figures.nth(index);
  await fig.scrollIntoViewIfNeeded({timeout:25000});
  await desktop.waitForFunction(i=>{const e=document.querySelectorAll('.article-figure img')[i];return !!e&&e.complete&&e.naturalWidth>0},index,{timeout:20000});
  const v=await fig.evaluate(e=>({width:e.naturalWidth,height:e.naturalHeight,url:e.currentSrc}));
  assert(v.width>100&&v.height>100,'Original report illustration '+(index+1)+' loads successfully');
  console.log('REPORT_FIGURE',index+1,v.width,v.height,v.url.split('/').slice(-1)[0]);
 }
 assert(!errors.length,'Long report has no browser JavaScript errors');
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto(base+'/journal/en/in-amenas-report-original-2013/',{waitUntil:'domcontentloaded',timeout:60000});
 await mobile.locator('.article-figure img').first().waitFor({timeout:30000});
 const widths=await mobile.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 assert(widths.document<=widths.viewport+1,'Mobile report has no horizontal page overflow');
 console.log('REPORT_MEDIA_ACCEPTANCE_SUCCESS');
}finally{await browser.close()}
