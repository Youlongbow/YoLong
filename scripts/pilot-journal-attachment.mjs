import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
const page=await context.newPage();
try {
 const response=await page.goto('https://www.ravenlong.com/p/2f83102210ef81ba8732eba57dd2aee8',{waitUntil:'domcontentloaded',timeout:40000});
 await page.waitForTimeout(2200);
 const blocks=page.locator('.notion-file-block');
 const count=await blocks.count();
 console.log('JOURNAL_FILE_BLOCK_COUNT',count);
 if(!count)throw Error('PDF file blocks not exposed to public page');
 const block=blocks.first();
 console.log('FIRST_FILE_BLOCK',JSON.stringify({text:(await block.innerText()).slice(0,155),buttons:await block.locator('[role="button"]').count()}));
 const button=block.locator('[role="button"]').first();
 const signal={download:null,popup:null};
 const waitDownload=page.waitForEvent('download',{timeout:12000}).then(x=>{signal.download=x}).catch(()=>null);
 const waitPopup=page.waitForEvent('popup',{timeout:12000}).then(x=>{signal.popup=x}).catch(()=>null);
 const responses=[];
 page.on('response',r=>{
  const t=(r.headers()['content-type']||'').toLowerCase();
  if(t.includes('application/pdf')||r.url().includes('.pdf'))
    responses.push({code:r.status(),type:t,host:new URL(r.url()).host});
 });
 await button.click({timeout:9000});
 await Promise.all([waitDownload,waitPopup]);
 const result={fileCount:count,download:!!signal.download,popup:!!signal.popup,
 responses:responses.slice(0,3)};
 if(signal.download) {
  const name=signal.download.suggestedFilename();
  const safeName=name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,120)||'original-research.pdf';
  mkdirSync('assets/media/publications',{recursive:true});
  await signal.download.saveAs('assets/media/publications/'+safeName);
  result.filename=safeName;
  result.bytes=statSync('assets/media/publications/'+safeName).size;
 }
 if(signal.popup){
  await signal.popup.waitForLoadState('domcontentloaded',{timeout:15000}).catch(()=>{});
  result.popupTitle=(await signal.popup.title().catch(()=>'')).slice(0,80);
  result.popupHost=new URL(signal.popup.url()).host;
 }
 console.log('JOURNAL_FILE_CLICK_RESULT',JSON.stringify(result));
}finally{await context.close();await browser.close()}
