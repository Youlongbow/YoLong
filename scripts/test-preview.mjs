import { chromium } from 'playwright';

const base='https://yolong.bournelong511.workers.dev';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const assert=(ok,message)=>{if(!ok)throw Error(message);console.log('PASS:',message)};
const errors=[];
try {
  const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  desktop.on('pageerror', e=>errors.push('desktop: '+e.message));
  await desktop.goto(base+'/',{waitUntil:'networkidle',timeout:40000});
  assert((await desktop.locator('h1').innerText()).includes('安全体系'),'Chinese homepage headline renders');
  assert(await desktop.locator('.paper').count()===4,'Four research references render');
  console.log('RAVEN_DESKTOP_JPEG_BASE64:'+ (await desktop.screenshot({type:'jpeg',quality:58})).toString('base64'));
  await desktop.locator('[data-lang="en"]').first().click();
  await desktop.waitForURL('**/en/',{timeout:15000});
  assert((await desktop.locator('h1').innerText()).includes('SECURITY BUILT'),'Language switching to English works');
  await desktop.goto(base+'/security/en/',{waitUntil:'networkidle',timeout:40000});
  assert(await desktop.locator('.event').count()===4,'Event archive renders four sample events');
  await desktop.locator('#search').fill('Kalemie');
  assert(await desktop.locator('.event').count()===1,'Event keyword filter works');
  await desktop.locator('#search').fill('');
  await desktop.locator('#type').selectOption('maritime');
  assert(await desktop.locator('.event').count()===1,'Event type filter works');
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(base+'/zh/',{waitUntil:'networkidle',timeout:40000});
  console.log('RAVEN_MOBILE_JPEG_BASE64:'+(await mobile.screenshot({type:'jpeg',quality:56})).toString('base64'));
  assert(await mobile.locator('#menu').isVisible(),'Mobile menu button visible');
  await mobile.locator('#menu').click();
  assert(await mobile.locator('#nav').isVisible(),'Mobile navigation opens');
  const width=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
  assert(width.scroll<=width.inner+1,'No horizontal overflow on mobile');
  assert(errors.length===0,'No unhandled browser JavaScript errors');
  console.log('BROWSER PREVIEW TEST SUCCESS');
} finally {
  await browser.close();
}
