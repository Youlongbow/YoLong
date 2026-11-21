import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const base='https://yolong.bournelong511.workers.dev';
const cssRevision=createHash('sha256').update(readFileSync('assets/editorial.css')).digest('hex').slice(0,12);
const expectedCSS='/assets/editorial.'+cssRevision+'.css';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const assert=(ok,message)=>{if(!ok)throw Error(message);console.log('PASS:',message)};
const errors=[];
try{
 const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 desktop.on('pageerror',error=>errors.push('desktop: '+error.message));
 await desktop.goto(base+'/zh/',{waitUntil:'networkidle',timeout:60000});
 for(let attempt=0;attempt<30;attempt++){
  const linked=await desktop.locator('link[rel="stylesheet"][href="'+expectedCSS+'"]').count();
  const current=await desktop.locator('.hero-photo').evaluate(el=>getComputedStyle(el).backgroundImage).catch(()=>'');
  if(linked && current.includes('raven-original-4x-3240.webp'))break;
  await desktop.waitForTimeout(1500);
  await desktop.reload({waitUntil:'networkidle',timeout:60000});
 }
 assert(await desktop.locator('link[rel="stylesheet"][href="'+expectedCSS+'"]').count()===1,'Versioned editorial stylesheet prevents stale hero caching');
 const slot=await desktop.locator('.hero-photo').evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {left:r.left,width:r.width,viewport:innerWidth,backgroundSize:getComputedStyle(el).backgroundSize};
 });
 assert(slot.left>slot.viewport*.25,'Desktop photo is positioned in the right-side art slot');
 assert(slot.backgroundSize==='contain','Desktop photo preserves the full original frame without cropping');
 assert((await desktop.locator('h1').innerText()).includes('安全研究'),'Chinese editorial headline is rendered');
 const wrap=await desktop.locator('.editorial-hero h1').evaluate(el=>getComputedStyle(el).textWrap);
 assert(wrap.includes('balance'),'Headings use balanced line breaks');
 const languageDesktop=desktop.locator('.nav .switch-desktop');
 assert(await languageDesktop.isVisible(),'Desktop language selector is visible in the header');
 const selectorDesktop=await languageDesktop.evaluate(el=>{
  const links=[...el.querySelectorAll('a')];
  const selected=el.querySelector('a.on');
  return {labels:links.map(a=>a.innerText),background:getComputedStyle(selected).backgroundColor,
   height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width,
   accessible:links.every(a=>a.hasAttribute('aria-label'))};
 });
 assert(selectorDesktop.labels.join('|')==='中文|EN' && selectorDesktop.height>=39 && selectorDesktop.accessible,
   'Desktop language selector has readable two-way controls and accessible labels');
 assert(selectorDesktop.background!=='rgba(0, 0, 0, 0)',
   'Selected language has a prominent filled state');
 assert(await desktop.locator('.editorial-hero').isVisible(),'Editorial homepage hero is visible');
 assert(await desktop.locator('.gateway').count()===3,'Three contrasting editorial section cards render');
 const gatewayPictures=await desktop.locator('.gateway-media img').evaluateAll(imgs=>imgs.map(img=>{
  const r=img.parentElement.getBoundingClientRect();
  return {loaded:img.complete&&img.naturalWidth>0,aspect:r.width/r.height};
 }));
 assert(gatewayPictures.length===3&&gatewayPictures.every(x=>x.loaded),'All three editorial gateways show real archived media');
 assert(gatewayPictures.every(x=>Math.abs(x.aspect-16/9)<.06),'All section images keep a consistent 16:9 cover ratio');
 assert(await desktop.locator('.gateway-action').count()===3,'Each editorial gateway has a clear action');
 const monitorCover=await desktop.locator('.gateway-monitor img').getAttribute('src');
 assert(monitorCover==='/assets/media/brand/raven-global-monitor.webp','Global monitoring section has no borrowed third-party risk map branding');
 const originalCover=await desktop.request.get(base+monitorCover);
 assert(originalCover.ok() && (originalCover.headers()['content-type']||'').includes('image/webp'),'Original RAVEN monitoring artwork is served as a self-hosted WebP');


 assert(await desktop.locator('.expertise-item[href^="/capabilities/zh/"]').count()===5,'Five homepage expertise cards are real links');
 assert(await desktop.locator('.expertise-item p').count()===5,'Each expertise card has a meaningful summary');
 const transitionLayout=await desktop.evaluate(()=>{
  const overlay=document.querySelector('#site-transition');
  overlay.classList.remove('is-hidden','is-exiting');
  overlay.classList.add('is-entering');
  const mark=document.querySelector('.transition-mark');
  const word=document.querySelector('.transition-wordmark');
  const rule=document.querySelector('.transition-rule');
  const slogan=document.querySelector('.transition-slogan');
  const a=mark.getBoundingClientRect(),b=word.getBoundingClientRect(),c=rule.getBoundingClientRect(),d=slogan.getBoundingClientRect();
  const loaded=mark.complete&&mark.naturalWidth>0;
  overlay.classList.remove('is-entering');
  overlay.classList.add('is-hidden');
  return {loaded,logoRight:a.right,wordLeft:b.left,wordRight:b.right,lineLeft:c.left,wordTop:b.top,lineTop:c.top,logoHeight:a.height,logoWidth:a.width,wordFont:parseFloat(getComputedStyle(word).fontSize),slogan:slogan.textContent.trim(),sloganTop:d.top,sloganRight:d.right,ruleBottom:c.bottom,viewport:innerWidth};
 });
 assert(transitionLayout.loaded,'Actual official RAVEN mark loads in transition');
 assert(transitionLayout.logoRight<transitionLayout.wordLeft-5,'Transition logo is LEFT of RAVEN wordmark');
 assert(transitionLayout.lineLeft>=transitionLayout.wordLeft-1&&transitionLayout.lineTop>transitionLayout.wordTop,'Red line is BELOW the wordmark');
 assert(transitionLayout.logoWidth>=230&&transitionLayout.wordFont>=185,'Original RAVEN mark and wordmark have tripled in size');
 assert(transitionLayout.wordRight<transitionLayout.viewport-10,'Triple-size desktop brand remains within viewport');
 assert(transitionLayout.slogan==='PREPARED FOR THE UNPREDICTABLE' &&
  transitionLayout.sloganTop>transitionLayout.ruleBottom &&
  transitionLayout.sloganRight<transitionLayout.viewport-8,
  'Approved English slogan appears beneath RAVEN without clipping');
 const visualAsset=await desktop.request.get(base+'/assets/media/brand/raven-original-4x-3240.webp');
 assert(visualAsset.ok(),'New original high-resolution raven artwork is served locally');
 assert((visualAsset.headers()['content-type']||'').includes('image/webp'),'Hero is a standalone WebP image');
 const heroImageSize=await desktop.evaluate(async()=>{
  const img=new Image();
  img.src='/assets/media/brand/raven-original-4x-3240.webp';
  await img.decode();
  return {width:img.naturalWidth,height:img.naturalHeight};
 });
 assert(heroImageSize.width===3240&&heroImageSize.height===1412,'Hero contains original-composition 3240×1412 image detail');
 const background=await desktop.locator('.hero-photo').evaluate(el=>getComputedStyle(el).backgroundImage);
 assert(background.includes('raven-original-4x-3240.webp'),'Hero background uses actual high-resolution image, not old thumbnail');
 const stylesheet=await desktop.request.get(base+'/assets/editorial.css');
 assert(stylesheet.ok(),'Editorial CSS design system is deployed');
 assert(await desktop.locator('.paper').count()>=4,'Migrated research cards render');
 assert(await desktop.locator('#journal .paper-media img').count()>=4,'Research cards show linked research cover images');
 assert(await desktop.locator('#journal .paper-read').count()>=4,'Research cards include explicit read links');

 console.log('RAVEN_DESKTOP_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:56})).toString('base64'));
 await desktop.locator('.editorial-gateways').scrollIntoViewIfNeeded();
 console.log('RAVEN_CARDS_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:52})).toString('base64'));
 await desktop.locator('.switch-desktop a[href="/en/"]').click();
 await desktop.waitForURL('**/en/',{timeout:15000});
 // Initial static SEO markup is intentionally replaced by the hydrated app.
 await desktop.locator('.editorial-hero h1').waitFor({state:'visible',timeout:30000});
 assert((await desktop.locator('.editorial-hero h1').innerText()).includes('Security Research'),'English homepage language switch works');
 await desktop.goto(base+'/capabilities/zh/security-architecture/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('h1').innerText()).includes('高风险环境'),'Chinese capability detail loads');
 assert(await desktop.locator('.capability-step').count()===4,'Capability detail includes four concrete methods');
 assert(await desktop.locator('.capability-bottom li').count()>=6,'Deliverables and operating contexts are populated');
 await desktop.goto(base+'/capabilities/en/security-governance/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('h1').innerText()).includes('Corporate Security Governance'),'English governance capability detail loads');
 await desktop.goto(base+'/capabilities/zh/',{waitUntil:'networkidle',timeout:60000});
 assert(await desktop.locator('.capability-directory-card').count()===5,'All capability entries appear on the bilingual index');
 await desktop.goto(base+'/security/en/',{waitUntil:'networkidle',timeout:60000});
 const liveArchiveCount=Number((await desktop.locator('#match-count').innerText()).match(/\d+/)?.[0]||0);
 assert(liveArchiveCount>=125,'Original event archive retained and new records supported');
 assert(await desktop.locator('.event').count()===18,'Archive uses 18-item initial pagination');
 await desktop.locator('#search').fill('Gas Husky');
 const searchCount=await desktop.locator('.event').count();
 assert(searchCount>=1&&searchCount<18,'Event keyword filter narrows results');
 await desktop.locator('#search').fill('');
 await desktop.locator('#type').selectOption('maritime');
 const maritime=await desktop.locator('.event').count();
 assert(maritime>=1&&maritime<=18,'Maritime category filter returns records');
 await desktop.goto(base+'/security/zh/2026-11-17-001/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.article-content').innerText()).includes('事实摘要'),'Full Chinese event analysis renders');
 assert((await desktop.locator('.article-content a[href^="https://"]').count())>=1,'Incident sources remain clickable');

 await desktop.goto(base+'/journal/zh/',{waitUntil:'networkidle',timeout:60000});
 assert(await desktop.locator('#journal .paper-media img').count()>=5,'Full research directory has thematic cover artwork');
 const researchMeasure=await desktop.locator('#journal .paper-media').first().evaluate(el=>{
  const r=el.getBoundingClientRect();return r.width/r.height;
 });
 assert(Math.abs(researchMeasure-16/9)<.08,'Research cover images consistently use 16:9 frames');
 console.log('RAVEN_RESEARCH_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:48})).toString('base64'));
 await desktop.goto(base+'/journal/zh/bla-strategy-analysis/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.article-content').innerText()).length>6000,'Long research report migrated in full');
 assert(await desktop.locator('.article-figure img').count()>=10,'All ten BLA vector figures render as local image elements');
 const firstFigure=desktop.locator('.article-figure img').first();
 assert(await firstFigure.evaluate(img=>img.complete&&img.naturalWidth>0),'BLA original vector figure loads from Cloudflare local media');
 const figureLayout=await desktop.locator('.article-diagram img').first().evaluate(img=>{
  const r=img.getBoundingClientRect();return {width:r.width,height:r.height,native:img.naturalWidth/img.naturalHeight};
 });
 assert(Math.abs(figureLayout.width/figureLayout.height-figureLayout.native)<.08,'Original research diagrams retain intrinsic aspect ratio');


 await desktop.goto(base+'/journal/en/pakistan-drc-mining-comparison/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.article-content').innerText()).length>6000,'English research report renders');
 await desktop.goto(base+'/about/zh/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.profile-design.profile-about').innerText()).length>850,'Chinese About uses the dedicated editorial profile layout');
 assert(await desktop.locator('.profile-story').count()===3,'About page presents three editorial career chapters');
 assert(await desktop.locator('.profile-photo img').count()===4,'About photo assets render in hero plus all three chapter slots');
 assert(await desktop.locator('.profile-photo img').first().evaluate(img=>img.complete&&img.naturalWidth>0),'Local About-page hero photograph is loaded');
 assert(await desktop.locator('.profile-story').first().locator('img[src$="/field-origins.avif"]').count()===1,'Field-origins photograph replaces empty 01 panel');
 assert(await desktop.locator('.profile-story').nth(1).locator('img[src$="/security-architecture.avif"]').count()===1,'Security architecture chapter uses the new artwork');
 assert(await desktop.locator('.profile-story').nth(2).locator('img[src$="/security-continuity.avif"]').count()===1,'Continuity chapter uses the approved guard-post artwork');
 assert(await desktop.locator('.profile-book-cover-photo[src$="/book-editions-official.avif"]').count()===1,'Published-work section shows both supplied official book covers');
 const editorialImgs=await desktop.locator('.profile-story img,.profile-book-cover-photo').evaluateAll(imgs=>imgs.map(x=>({src:x.currentSrc,loaded:x.complete&&x.naturalWidth>=900&&x.naturalHeight>600})));
 assert(editorialImgs.length===4&&editorialImgs.every(x=>x.loaded),'All four editorial AVIF images load at high resolution');

 const aboutColumns=await desktop.locator('.profile-hero').evaluate(el=>{
  const copy=el.querySelector('.profile-hero-copy').getBoundingClientRect();
  const image=el.querySelector('.profile-hero-visual').getBoundingClientRect();
  return {copyRight:copy.right,imageLeft:image.left,copyWidth:copy.width,imageWidth:image.width};
 });
 assert(aboutColumns.copyRight<aboutColumns.imageLeft && aboutColumns.copyWidth>350 && aboutColumns.imageWidth>350,'Desktop About uses genuinely separate readable copy and image columns');
 console.log('RAVEN_ABOUT_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:46})).toString('base64'));
 await desktop.locator('.profile-story').nth(1).scrollIntoViewIfNeeded();
 const aboutChapterImage=desktop.locator('.profile-story').nth(1).locator('img');
 await aboutChapterImage.evaluate(img=>img.decode());
 assert(await aboutChapterImage.evaluate(img=>img.naturalWidth>0),'Second About chapter image decodes correctly');
 console.log('RAVEN_ABOUT_STORY_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:46})).toString('base64'));
 await desktop.goto(base+'/experience/en/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.profile-design.profile-experience').innerText()).length>1800,'English experience page renders redesigned copy and projects');
 assert(await desktop.locator('.profile-story').count()===4,'Experience page presents four project categories');
 assert(await desktop.locator('.profile-assignment').count()===4,'Selected project roles are presented as four legible cards');
 assert(await desktop.locator('.profile-archive').count()===3,'Additional project archive remains accessible');
 assert(await desktop.locator('.profile-photo img').count()===4,'Project photography uses local assets in structured slots');
 console.log('RAVEN_EXPERIENCE_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:46})).toString('base64'));
 await desktop.locator('.profile-story').nth(1).scrollIntoViewIfNeeded();
 const experienceChapterImage=desktop.locator('.profile-story').nth(1).locator('img');
 await experienceChapterImage.evaluate(img=>img.decode());
 assert(await experienceChapterImage.evaluate(img=>img.naturalWidth>0),'Second Experience chapter image decodes correctly');
 console.log('RAVEN_EXPERIENCE_STORY_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:46})).toString('base64'));
 await desktop.goto(base+'/contact/zh/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.article-content').innerText()).length>200,'Contact page migrated');
 await desktop.goto(base+'/training/zh/',{waitUntil:'networkidle',timeout:60000});
 assert(await desktop.locator('.course-card').count()===11,'Full HEAT curriculum displays ten modules plus review');
 assert(await desktop.locator('.course-card-media img').count()>=10,'HEAT course cards use module-specific scenario images');
 const courseRatios=await desktop.locator('.course-card-media').evaluateAll(cards=>cards.map(el=>{
  const r=el.getBoundingClientRect();return r.width/r.height;
 }));
 assert(courseRatios.every(r=>Math.abs(r-1.6)<.07),'HEAT card image proportions remain 16:10');
 console.log('RAVEN_TRAINING_JPEG_BASE64:'+(await desktop.screenshot({type:'jpeg',quality:48})).toString('base64'));

 assert(await desktop.locator('.course-intro img').count()>=1,'HEAT introduction displays locally preserved certificate or illustration');
 assert(await desktop.locator('.course-intro .article-details summary').count()>=1,'HEAT introduction renders author note as an accessible disclosure');
 await desktop.locator('.course-intro .article-details summary').first().click();
 assert(await desktop.locator('.course-intro .article-details[open]').count()>=1,'HEAT author note can be expanded without losing source text');


 await desktop.goto(base+'/training/en/01/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.article-content').innerText()).length>4500,'English HEAT module retains full text');
 await desktop.goto(base+'/training/zh/11/',{waitUntil:'networkidle',timeout:60000});
 assert((await desktop.locator('.article-content').innerText()).length>1400,'Chinese comprehensive review retains full text');
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 mobile.on('pageerror',error=>errors.push('mobile: '+error.message));
 await mobile.goto(base+'/zh/',{waitUntil:'networkidle',timeout:60000});
 const languageMobile=mobile.locator('.header-tools .switch-mobile');
 assert(await languageMobile.isVisible(),'Mobile language switch is always visible without opening the menu');
 const headerFit=await mobile.evaluate(()=>{
  const brand=document.querySelector('.top .logo').getBoundingClientRect();
  const selector=document.querySelector('.switch-mobile').getBoundingClientRect();
  const menu=document.querySelector('#menu').getBoundingClientRect();
  return {brandRight:brand.right,selectorLeft:selector.left,selectorRight:selector.right,
   menuLeft:menu.left,menuRight:menu.right,viewport:innerWidth,scroll:document.documentElement.scrollWidth};
 });
 assert(headerFit.brandRight+2<=headerFit.selectorLeft && headerFit.selectorRight+2<=headerFit.menuLeft
  && headerFit.menuRight<headerFit.viewport && headerFit.scroll<=headerFit.viewport+1,
  'Mobile header fits the logo, bilingual switch and menu without overlap or horizontal scrolling');
 await mobile.locator('.switch-mobile a[href="/en/"]').click();
 await mobile.waitForURL('**/en/',{timeout:15000});
 await mobile.locator('.editorial-hero h1').waitFor({state:'visible',timeout:15000});
 assert(await mobile.locator('.switch-mobile a[aria-current="page"]').innerText()==='EN',
   'Mobile English switch updates current language state');
 await mobile.locator('.switch-mobile a[href="/zh/"]').click();
 await mobile.waitForURL('**/zh/',{timeout:15000});
 await mobile.locator('.editorial-hero h1').waitFor({state:'visible',timeout:15000});
 assert(await mobile.locator('.switch-mobile a[aria-current="page"]').innerText()==='中文',
   'Mobile Chinese switch restores language correctly');
 console.log('RAVEN_MOBILE_JPEG_BASE64:'+(await mobile.screenshot({type:'jpeg',quality:58})).toString('base64'));

 for(const img of await mobile.locator('.gateway-media img').all()){
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(el=>el.decode().catch(()=>{}));
 }
 const phoneGateways=await mobile.locator('.editorial-gateways').evaluate(container=>{
   const c=container.getBoundingClientRect();
   const cards=[...container.querySelectorAll('.gateway')].map(el=>{
     const b=el.getBoundingClientRect();
     const t=el.querySelector('h2').getBoundingClientRect();
     const img=el.querySelector('img');
     return {left:b.left,right:b.right,width:b.width,height:b.height,titleHeight:t.height,
       imgLoaded:img.complete&&img.naturalWidth>0,imgSrc:img.getAttribute('src')};
   });
   return {width:c.width,columns:getComputedStyle(container).gridTemplateColumns.split(' ').length,cards};
 });
 assert(phoneGateways.columns===1,'Mobile homepage renders ONE full-width editorial gateway column');
 assert(phoneGateways.cards.length===3&&phoneGateways.cards.every(x=>x.width>=310),'Mobile gateway cards use readable widths, not three narrow columns');
 assert(phoneGateways.cards.every(x=>x.imgLoaded&&x.titleHeight<85),'Mobile gateway images load and headings avoid vertical word stacking');
 assert(phoneGateways.cards[1].imgSrc==='/assets/media/brand/raven-global-monitor.webp','Security intelligence uses original unbranded RAVEN artwork');
 await mobile.locator('.editorial-gateways').scrollIntoViewIfNeeded();
 console.log('RAVEN_MOBILE_CARDS_JPEG_BASE64:'+(await mobile.screenshot({type:'jpeg',quality:62})).toString('base64'));
 await mobile.locator('.gateway-monitor').click();
 await mobile.waitForURL('**/security/zh/',{timeout:15000});
 assert((await mobile.locator('#monitor h2').first().innerText()).includes('全球安全'),'Mobile monitoring card opens the actual intelligence archive');
 await mobile.goto(base+'/zh/',{waitUntil:'networkidle',timeout:60000});
 assert(await mobile.locator('.expertise-item[href^="/capabilities/zh/"]').count()===5,'All five clickable specialties are available on mobile');
 await mobile.goto(base+'/about/zh/',{waitUntil:'networkidle',timeout:60000});
 const aboutMobile=await mobile.locator('.profile-hero').evaluate(el=>{
  const c=el.querySelector('.profile-hero-copy').getBoundingClientRect();
  const im=el.querySelector('.profile-hero-visual').getBoundingClientRect();
  return {copyBottom:c.bottom,imageTop:im.top,docWidth:document.documentElement.scrollWidth,viewport:innerWidth};
 });
 assert(aboutMobile.copyBottom<=aboutMobile.imageTop+2,'Mobile About stacks the hero photograph below the copy');
 assert(aboutMobile.docWidth<=aboutMobile.viewport+2,'Mobile About has no horizontal overflow');
 await mobile.goto(base+'/experience/zh/',{waitUntil:'networkidle',timeout:60000});
 const experienceMobile=await mobile.evaluate(()=>({docWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
 assert(experienceMobile.docWidth<=experienceMobile.viewport+2,'Mobile Experience has no horizontal overflow');
 assert(await mobile.locator('.profile-assignment').count()===4,'Mobile Experience retains all selected projects');
 await mobile.goto(base+'/zh/',{waitUntil:'networkidle',timeout:60000});
 const mobileLockup=await mobile.evaluate(()=>{
  const overlay=document.querySelector('#site-transition');
  overlay.classList.remove('is-hidden','is-exiting');
  overlay.classList.add('is-entering');
  const mark=document.querySelector('.transition-mark').getBoundingClientRect();
  const word=document.querySelector('.transition-wordmark').getBoundingClientRect();
  const slogan=document.querySelector('.transition-slogan'), sr=slogan.getBoundingClientRect();
  const result={logoRight:mark.right,wordLeft:word.left,wordRight:word.right,viewport:innerWidth,logoWidth:mark.width,wordFont:parseFloat(getComputedStyle(document.querySelector('.transition-wordmark')).fontSize),slogan:slogan.textContent.trim(),sloganLeft:sr.left,sloganRight:sr.right,sloganTop:sr.top,wordBottom:word.bottom};
  overlay.classList.remove('is-entering');
  overlay.classList.add('is-hidden');
  return result;
 });
 assert(mobileLockup.logoRight<mobileLockup.wordLeft && mobileLockup.wordRight<=mobileLockup.viewport,'Mobile transition remains horizontal without overflow');
 assert(mobileLockup.logoWidth>=80&&mobileLockup.wordFont>=50,'Mobile loading identity is visibly enlarged');
 assert(mobileLockup.slogan==='PREPARED FOR THE UNPREDICTABLE' &&
  mobileLockup.sloganLeft>=0 && mobileLockup.sloganRight<=mobileLockup.viewport &&
  mobileLockup.sloganTop>mobileLockup.wordBottom,
  'Mobile loader shows approved slogan as one readable line below the original identity');
 assert(await mobile.locator('#menu').isVisible(),'Mobile navigation control is visible');
 await mobile.locator('#menu').click();
 assert(await mobile.locator('#nav').isVisible(),'Mobile navigation opens');
 const width=await mobile.evaluate(()=>{
  const inner=window.innerWidth,scroll=document.documentElement.scrollWidth;
  const offenders=[...document.querySelectorAll('body *')].map(el=>{
   const r=el.getBoundingClientRect();
   return {tag:el.tagName,cls:String(el.className||'').slice(0,90),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};
  }).filter(o=>o.right>inner+2||o.left < -5).filter(o=>o.width<3000).slice(0,14);
  return {scroll,inner,offenders};
 });
 console.log('RAVEN_MOBILE_OVERFLOW_DIAGNOSTIC:'+JSON.stringify(width));
 assert(width.scroll<=width.inner+1,'No horizontal overflow on mobile');
 await mobile.setViewportSize({width:320,height:800});
 await mobile.goto(base+'/zh/',{waitUntil:'networkidle',timeout:60000});
 const narrow=await mobile.evaluate(()=>{
  const brand=document.querySelector('.top .logo').getBoundingClientRect();
  const choice=document.querySelector('.switch-mobile').getBoundingClientRect();
  const menu=document.querySelector('#menu').getBoundingClientRect();
  return {brandRight:brand.right,choiceLeft:choice.left,choiceRight:choice.right,
   menuLeft:menu.left,menuRight:menu.right,viewport:innerWidth,scroll:document.documentElement.scrollWidth};
 });
 assert(narrow.brandRight<=narrow.choiceLeft+1 && narrow.choiceRight<=narrow.menuLeft+1
  && narrow.menuRight<=narrow.viewport && narrow.scroll<=narrow.viewport+1,
  'Small 320px phone keeps language switch visible without overlap');

 assert(errors.length===0,'No unhandled JavaScript errors: '+errors.join('; '));
 console.log('BROWSER PREVIEW TEST SUCCESS');
}finally{await browser.close()}
