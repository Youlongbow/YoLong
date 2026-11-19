import {chromium} from 'playwright';
import {readFileSync,mkdirSync,writeFileSync,existsSync,statSync} from 'node:fs';
import {dirname} from 'node:path';

const manifest=JSON.parse(readFileSync('content/journal-attachments.json','utf8'));
if(manifest.publications?.length!==9)throw Error('Expected nine original research publications');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
const page=await context.newPage();
const source='https://www.ravenlong.com/p/'+manifest.sourcePage;
let preserved=0,existing=0;
try {
 for (const pub of manifest.publications) {
  const target=pub.path.slice(1);
  if(existsSync(target)&&statSync(target).size>1000){existing++;continue}
  const initial=await page.goto(source,{waitUntil:'domcontentloaded',timeout:45000});
  if(!initial?.ok())throw Error('Legacy journal unavailable: '+initial?.status());
  const blocks=page.locator('.notion-file-block');
  await blocks.first().waitFor({timeout:25000});
  const id=pub.originalRef.match(/^notion-file-block:\/\/([^/]+)\//)?.[1];
  const precise=id?page.locator('.notion-file-block[data-block-id="'+id+'"]'):null;
  const button=((precise&&await precise.count()===1)?precise:blocks.nth(pub.order-1)).locator('[role="button"]').first();
  if(!await button.count())throw Error('Original file block missing: '+pub.id);
  const signal=page.waitForResponse(r=>{
   const type=(r.headers()['content-type']||'').toLowerCase();
   return r.status()===200&&type.includes('application/pdf');
  },{timeout:30000});
  await button.click({timeout:12000});
  const response=await signal;
  const bytes=Buffer.from(await response.body());
  if(bytes.length<1024||bytes.length>45*1024*1024||bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Original file failed PDF validation: '+pub.id);
  mkdirSync(dirname(target),{recursive:true});
  writeFileSync(target,bytes);
  preserved++;
  console.log('ORIGINAL_PDF_ARCHIVED',JSON.stringify({id:pub.id,order:pub.order,bytes:bytes.length,filename:pub.originalFilename.slice(0,105)}));
 }
 console.log('ORIGINAL_PDF_SUMMARY',JSON.stringify({total:manifest.publications.length,preserved,existing}));
}finally{await context.close();await browser.close()}
