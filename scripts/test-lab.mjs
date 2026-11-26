import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
// Verify oriented open-surface meshes before launching the browser.
const source=await readFile('assets/security-lab.js','utf8');
const meshStart=source.indexOf('function mesh(part){'),meshEnd=source.indexOf('\nfunction t(a)',meshStart);
assert(meshStart>=0&&meshEnd>meshStart,'Mesh factory is available');
const mesh=new Function(source.slice(meshStart,meshEnd)+'\nreturn mesh;')();
for(const shape of ['annulus','pitRing','terrain','coolingTower']){
 const m=mesh([0,0,0,3,1,3,'#999999',shape,.8,.3,.03]);
 assert(m.oriented,shape+' uses explicit face orientation');
 for(const [i,f] of m.polys.entries()){
  const [a,b,c]=f.slice(0,3).map(j=>m.vertices[j]),u=b.map((v,k)=>v-a[k]),v=c.map((q,k)=>q-a[k]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const mid=f.map(j=>m.vertices[j]).reduce((sum,p)=>sum.map((x,k)=>x+p[k]),[0,0,0]);
  const radial=n[0]*mid[0]+n[2]*mid[2];
  assert(shape==='annulus'?[n[1]<0,n[1]>0,radial>0,radial<0][i%4]:shape==='coolingTower'?radial>0:n[1]>0,shape+' face '+i+' orientation');
 }
}
const root=resolve('dist');
const type={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;if(p.endsWith('/'))p+='index.html';let path=resolve(root,'.'+decodeURIComponent(p));if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return}const data=await readFile(path);res.writeHead(200,{'Content-Type':type[extname(path)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.LAB_LIVE_ORIGIN||'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const requireGPU=process.env.LAB_REQUIRE_WEBGL==='1';
const captures=process.env.LAB_CAPTURE_DIR;if(captures)await mkdir(captures,{recursive:true});
const errors=[];
try {
 for(const lang of ['zh','en']){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>errors.push(lang+': '+e.message));
  const response=await page.goto(base+'/lab/'+lang+'/',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200);
  await page.locator('#overview-quick-components button').first().waitFor({timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#overview-engine')?.textContent.length>0);
  assert(await page.locator('#lab-overview').isVisible());
  assert(await page.locator('#lab-studio').isHidden());
  assert.equal(await page.locator('#overview-hotspots button').count(),0);
  const quick=page.locator('#overview-quick-components button');
  assert.equal(await quick.count(),4);
  assert(await page.evaluate(()=>{const model=document.querySelector('.overview-exhibit-layout .overview-view').getBoundingClientRect(),chooser=document.querySelector('.quick-explorer').getBoundingClientRect(),detail=document.querySelector('#overview-detail').getBoundingClientRect();return chooser.left>=model.right-1&&detail.top>=chooser.bottom-1}),'Desktop exhibit has canvas beside component selection and detail');

  assert.equal(await quick.locator('[aria-pressed=true]').count(),0);
  assert.equal(await page.locator('#overview-quick-components button[aria-pressed=true]').count(),0);
  assert.equal(await page.locator('#overview-views button').first().getAttribute('aria-pressed'),'true');
  assert(await page.locator('#overview-views button').nth(1).isDisabled());
  const initialImage=await page.evaluate(()=>{const gl=document.querySelector('#overview-gl');return(getComputedStyle(gl).visibility==='visible'?gl:document.querySelector('#overview-canvas')).toDataURL()});
  assert(await page.locator('#overview-advanced').evaluate(n=>!n.open));
  for(let k=0;k<4;k++){
   await quick.nth(k).click();
   assert.equal(await quick.nth(k).getAttribute('aria-pressed'),'true');
   assert(await page.locator('#overview-detail .quick-purpose').innerText());
   const thumbnail=quick.nth(k).locator('svg');
   const preview=page.locator('#overview-detail .quick-product-preview svg');
   assert(await thumbnail.locator('polygon').count()>10);
   assert.equal(await preview.innerHTML(),await thumbnail.innerHTML());
   assert(await preview.locator('polygon').evaluateAll(nodes=>nodes.every(n=>n.getAttribute('points').split(/[ ,]+/).every(v=>Number.isFinite(Number(v))))));

   assert(await page.locator('#overview-detail .quick-model-link').first().isVisible());
   await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===1);
  }
  await quick.first().click();
  const viewControls=page.locator('#overview-views button');
  await viewControls.nth(2).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===16);
  await viewControls.nth(0).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===0);
  const campusImage=()=>page.evaluate(()=>{const gl=document.querySelector('#overview-gl');return(getComputedStyle(gl).visibility==='visible'?gl:document.querySelector('#overview-canvas')).toDataURL()});
  const naturalImage=await campusImage();
  assert.equal(naturalImage,initialImage,'Initial render is identical to restored full-color scene');
  assert.equal(await page.locator('#overview-quick-components button[aria-pressed=true]').count(),0);
  const sampleCampus=await page.evaluate(()=>{const gl=document.querySelector('#overview-gl'),canvas=getComputedStyle(gl).visibility==='visible'?gl:document.querySelector('#overview-canvas');const mini=document.createElement('canvas');mini.width=128;mini.height=128;const x=mini.getContext('2d');x.drawImage(canvas,0,0,128,128);const pixels=x.getImageData(0,0,128,128).data;let n=0;const colors=new Set();for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>100){n++;colors.add([pixels[i]>>4,pixels[i+1]>>4,pixels[i+2]>>4].join(','))}return {n,colors:colors.size}});
  assert(sampleCampus.n>100&&sampleCampus.colors>12,'Campus has visible geometry and surface variation');
  if(captures&&lang==='zh')await page.locator('.overview-stack').screenshot({path:captures+'/campus-natural.png'});

  await viewControls.nth(1).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===16);
  assert.notEqual(await campusImage(),naturalImage,'Selection changes rendered campus');
  const focusedImage=await campusImage();
  await viewControls.nth(0).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===0);
  assert.equal(await campusImage(),naturalImage,'Natural view restores original colors');
  await viewControls.nth(1).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===16);
  assert.equal(await campusImage(),focusedImage,'Focus view is reproducible');

  if(captures&&lang==='zh')await page.locator('.overview-stack').screenshot({path:captures+'/campus-system-focus.png'});

  await viewControls.nth(2).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===1);
  await viewControls.nth(2).click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===16);
  await viewControls.nth(4).click();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  if(captures&&lang==='zh')await page.locator('.overview-stack').screenshot({path:captures+'/campus-top.png'});
  await viewControls.nth(3).click();
  assert(await page.locator('#overview-hotspots button').evaluateAll(nodes=>nodes.every(n=>Number.isFinite(parseFloat(n.style.left))&&Number.isFinite(parseFloat(n.style.top)))));

  await page.locator('#overview-advanced > summary').click();
  assert.equal(await page.locator('#overview-layers button').count(),6);
  await page.locator('#overview-advanced .overview-filter details').first().locator('summary').click();
  assert.equal(await page.locator('#overview-study-tabs button').count(),4);
  const studyScenes=new Set();
  for(let i=0;i<4;i++){
   await page.locator('#overview-study-tabs button').nth(i).click();
   assert.equal(await page.locator('#overview-study-flow button').count(),4);
   for(let j=0;j<4;j++){
    await page.locator('#overview-study-flow button').nth(j).click();
    assert(await page.locator('#overview-study-detail h4').innerText());
    assert.equal(await page.locator('#overview-study-visual .study-sample svg').count(),1);
    const sceneMarkup=await page.locator('#overview-study-visual .study-sample svg').innerHTML();
    assert(!studyScenes.has(sceneMarkup),`Repeated study illustration: system ${i}, step ${j}`);
    studyScenes.add(sceneMarkup);
    assert(await page.locator('#overview-study-visual .study-record strong').innerText());
    const practice=page.locator('#overview-study-visual .system-practice');
    assert.equal(await practice.count(),1);
    const accessReview=page.locator('.access-engineering-review');
    assert.equal(await accessReview.count(),i===1?1:0);
    if(i===1){
     assert.equal(await accessReview.locator('dd').count(),2);
     assert.equal(await practice.locator('.visitor-journey').count(),1);
     const exhibit=practice.locator('.practice-figure svg');
     assert.equal(await exhibit.getAttribute('viewBox'),'0 0 320 220');
     assert(await exhibit.locator('polygon').count()>20);
     assert(await exhibit.locator('polygon').evaluateAll(nodes=>nodes.every(n=>n.getAttribute('points').split(/[ ,]+/).every(v=>Number.isFinite(Number(v))))));

     assert((await accessReview.locator('a').getAttribute('href')).includes('eis0002'));
    }
    const boundaryReview=page.locator('.boundary-engineering-review');
    assert.equal(await boundaryReview.count(),i===2?1:0);
    if(i===2){
     assert.equal(await boundaryReview.locator('dd').count(),2);
     assert.equal(await practice.locator('.practice-figure svg').getAttribute('viewBox'),'0 0 320 210');
     assert.equal(await practice.locator('.boundary-gallery').count(),1);
     assert(await practice.locator('.practice-figure svg polygon').count()>20);
     assert(await practice.locator('.boundary-material').innerText());
    }
    const lightingReview=page.locator('.lighting-engineering-review');
    assert.equal(await lightingReview.count(),i===3?1:0);
    if(i===3){
     assert.equal(await lightingReview.locator('dd').count(),2);
     assert.equal(await practice.locator('.lighting-gallery').count(),1);
     assert.equal(await practice.locator('.practice-figure svg').getAttribute('viewBox'),'0 0 320 200');
     assert(await practice.locator('.lighting-appearance-note').innerText());
    }
    const review=page.locator('.video-engineering-review');
    assert.equal(await review.count(),i===0?1:0);
    if(i===0){
     assert.equal(await review.locator('dt').count(),3);
     assert.equal(await review.locator('dd').count(),3);
     assert(await review.locator('dd').evaluateAll(nodes=>nodes.every(n=>n.textContent.trim().length>20)));
     assert((await review.locator('a').getAttribute('href')).startsWith('https://www.npsa.gov.uk/'));
    }
    if(j===0){
     const tabs=practice.locator('button');
     const channels=i===0?4:3;
     if(i===0){assert.equal(await practice.locator('.video-channel svg').count(),4);assert.equal(await practice.locator('.video-wall-layout').count(),1);}
     assert.equal(await tabs.count(),channels+3);
     const images=new Set();
     for(let k=0;k<channels;k++){
      await tabs.nth(k).click();
      const visual=await practice.locator('.practice-figure svg').evaluate(node=>node.getAttribute('viewBox')+node.innerHTML+node.style.background);
      images.add(visual);
      if(i===0)assert.equal(await practice.locator('.practice-figure').getAttribute('data-channel'),String(k));
      assert.equal(await practice.locator('[data-recorded]').getAttribute('data-recorded'),'false');
      await tabs.nth(channels).click();
      assert.equal(await practice.locator('[data-recorded]').getAttribute('data-recorded'),'true');
      assert(await tabs.nth(channels).isDisabled());
     }
     assert.equal(images.size,channels);
     assert.equal(await practice.locator('[data-completed]').getAttribute('data-completed'),String(channels));
     await practice.locator('[data-locate]').click();
     const focus=[15,3,9,5][i];
     assert.equal(await page.locator('#overview-list button').nth(focus).getAttribute('aria-pressed'),'true');
     if(i===0){
      const cameraPanel=page.locator('.overview-camera-selector');
      assert.equal(await cameraPanel.getAttribute('data-camera-focus'),'3');
      const cameraButtons=cameraPanel.locator('button');
      assert.equal(await cameraButtons.count(),5);
      const assemblyImages=new Set();
      for(let channel=0;channel<4;channel++){
       await cameraButtons.nth(channel+1).click();
       assert.equal(await cameraPanel.getAttribute('data-camera-focus'),String(channel));
       assert.equal(await tabs.nth(channel).getAttribute('aria-pressed'),'true');
       await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
       assemblyImages.add(await campusImage());
      }
      assert.equal(assemblyImages.size,4,'Four distinct assembly highlights in integrated scene');
      await tabs.nth(1).click();
      assert.equal(await cameraPanel.getAttribute('data-camera-focus'),'1');
      await cameraButtons.first().click();
      assert.equal(await cameraPanel.getAttribute('data-camera-focus'),'-1');
      await tabs.nth(3).click();
     }
     if(i===3){
      await tabs.nth(1).click();
      await practice.locator('[data-locate]').click();
      assert.equal(await page.locator('#overview-day-night').getAttribute('aria-pressed'),'true');
      await tabs.nth(2).click();
      await practice.locator('[data-locate]').click();
      assert.equal(await page.locator('#overview-day-night').getAttribute('aria-pressed'),'false');
     }
     await page.locator('#overview-study-flow button').nth(1).click();
     assert.equal(await practice.locator('[data-completed]').getAttribute('data-completed'),String(channels));
     assert.equal(await practice.locator('[data-recorded]').getAttribute('data-recorded'),'true');
     await page.locator('#overview-study-flow button').nth(0).click();
     await tabs.nth(channels+1).click();
     assert.equal(await practice.locator('[data-recorded]').getAttribute('data-recorded'),'false');
    }
    assert((await page.locator('#overview-study-detail .overview-links button').count())>0);
   }
  }
  assert.equal(studyScenes.size,16);
  await page.locator('#overview-layers button').first().click();
  await page.locator('#overview-list button').nth(2).click();
  if(captures&&lang==='zh')await page.locator('#overview-system-study').screenshot({path:captures+'/system-study.png'});

  assert.equal(await page.locator('#overview-functions button').count(),6);
  const assetTabs=page.locator('#overview-assets button');
  assert.equal(await assetTabs.count(),5);
  for(const [i,point] of [3,12,11,14].entries()){
   await assetTabs.nth(i).click();
   assert.equal(await assetTabs.nth(i).getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#overview-list button').nth(point).getAttribute('aria-pressed'),'true');
   assert(await page.locator('#overview-asset-detail h4').count()===3);
   assert(await page.locator('#overview-asset-detail button').count()>=3);
  }
  await assetTabs.nth(4).click();
  const dayNight=page.locator('#overview-day-night');
  await page.locator('#overview-views button').first().click();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  if(await dayNight.getAttribute('aria-pressed')==='true')await dayNight.click();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const dayImage=await campusImage();
  await dayNight.click();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert.equal(await dayNight.getAttribute('aria-pressed'),'true');
  assert.notEqual(await campusImage(),dayImage,'Integrated campus day and evening appearances differ');
  await dayNight.click();
  await page.locator('#overview-views button').nth(1).click();
  assert.equal(await page.locator('#overview-framework .concept-definition').count(),7);
  if(requireGPU)await page.waitForFunction(()=>document.querySelector('#overview-engine')?.textContent.includes('WEBGL 2'),{},{timeout:30000});
  for(let l=0;l<6;l++){
   await page.locator('#overview-layers button').first().click();
   if(l)await page.locator('#overview-layers button').nth(l).click();
   for(let f=0;f<6;f++){
    await page.locator('#overview-functions button').first().click();
    if(f)await page.locator('#overview-functions button').nth(f).click();
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    assert.equal(await page.locator('#overview-hotspots button').count(),await page.locator('#overview-list button').count());
    assert(await page.locator('#overview-detail h3').innerText());
   }
  }
  await page.locator('#overview-layers button').first().click();
  await page.locator('#overview-functions button').first().click();
  await page.locator('#overview-list button').nth(2).click();
  assert(await page.locator('#overview-detail h3').innerText());
  assert.equal(await page.locator('#overview-list button').nth(2).getAttribute('aria-pressed'),'true');
  await page.locator('#overview-list button').first().click();
  await page.locator('#overview-detail .quick-disclosure > summary').click();
  await page.locator('#overview-detail .overview-links button').first().click();
  assert(await page.locator('#lab-library-panel').isVisible());
  await page.locator('#lab-back-scene').click();
  assert(await page.locator('#lab-overview').isVisible());
  assert.equal(await page.locator('#overview-events button').count(),3);
  for(let e=0;e<3;e++){
   await page.locator('#overview-events button').nth(e).click();
   assert.equal(await page.locator('#overview-event-steps button').count(),4);
   for(let p=0;p<4;p++){
    await page.locator('#overview-event-steps button').nth(p).click();
    await page.locator('#overview-event-detail button').click();
    assert(await page.locator('#overview-detail h3').innerText());
   }
  }
  if(captures&&lang==='zh')await page.locator('.overview-stack').screenshot({path:captures+'/integrated-campus.png'});
  await page.locator('#overview-next button').nth(1).click();
  assert.equal(await page.locator('#studio-scenes button').nth(1).getAttribute('aria-pressed'),'true');
  await page.locator('#studio-scenes button').first().waitFor({timeout:30000});
  assert(await page.locator('#lab-library-panel').isHidden());
  assert.equal(await page.locator('#lab-mode-scene').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#lab-modules button').count(),85);
  await page.locator('#studio-scenes button').first().waitFor();
  assert.equal(await page.locator('#studio-scenes button').count(),4);
  const sc=page.locator('#studio-canvas');
  await page.locator('#studio-review-details > summary').click();
  await page.locator('#studio-roles-details > summary').click();
  await page.locator('#studio-explore-advanced > summary').click();
  await page.locator('#studio-operating-advanced > summary').click();
  if(requireGPU)await page.waitForFunction(()=>document.querySelector('#studio-engine')?.textContent.includes('WebGL 2'),{},{timeout:30000});
  const gpu=await page.locator('#studio-engine').innerText();
  console.log('STUDIO RENDERER',lang,gpu);

  for(let s=0;s<4;s++){
   await page.locator('#studio-scenes button').nth(s).click();
   assert.equal(await page.locator('#studio-layers button').count(),5);
   assert.equal(await page.locator('#studio-functions button').count(),3);
   assert.equal(await page.locator('#studio-framework .concept-definition').count(),7);
   for(let j=0;j<5;j++){
    await page.locator('#studio-layers button').nth(j).click();
    assert(await page.locator('#studio-layer-copy').innerText());
    if(j<3){await page.locator('#studio-functions button').nth(j).click();
    assert(await page.locator('#studio-function-copy').innerText());}
   }
   assert.equal(await page.locator('#studio-zones button').count(),3);
   for(let i=0;i<3;i++){
    await page.locator('#studio-zones button').nth(i).click();
    assert.equal(await page.locator('#studio-system-interfaces .case-system-card').count(),3);
    const production=page.locator('#studio-zone-detail .industry-production-context');
    assert.equal(await production.getAttribute('data-industry'),String(s));
    assert.equal(await production.locator('svg').getAttribute('viewBox'),'0 0 320 130');
    assert.equal(await production.locator('.industry-production-tags span').count(),3);
    await page.locator('#studio-case-advanced > summary').click();
    const exercise=page.locator('#studio-zone-detail .industry-exercise');
    assert.equal(await exercise.getAttribute('data-case-id'),String(s*3+i));
    assert.equal(await exercise.locator('button').count(),2);
    await exercise.locator('button').nth((s*3+i)%2).click();
    assert.equal(await exercise.locator('[data-result]').getAttribute('data-result'),'review');
    await exercise.locator('button').nth(1-(s*3+i)%2).click();
    assert.equal(await exercise.locator('[data-result]').getAttribute('data-result'),'correct');
    assert.equal(await exercise.locator('[data-result] label').count(),2);

    if(i===1||i===2){
     const cutaway=page.locator('#studio-views button').last();
     const previous=await cutaway.getAttribute('aria-pressed');
     await cutaway.click();
     assert.notEqual(await cutaway.getAttribute('aria-pressed'),previous);
     await cutaway.click();
     assert.equal(await cutaway.getAttribute('aria-pressed'),previous);
    }
    assert.equal(await page.locator('#studio-config button').count(),3);
    const configurations=new Set();
    let fixedInventory=null;
    for(let v=0;v<3;v++){
     await page.locator('#studio-config button').nth(v).click();
     const assemblyKeys=await page.locator('#studio-components [data-scene-assembly="true"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.model).sort());
     const signature=JSON.stringify(assemblyKeys);
     if(fixedInventory===null)fixedInventory=signature;else assert.equal(signature,fixedInventory,'Fixed scene inventory stays stable across topics');
     assert(assemblyKeys.length>0,'Scene has identifiable assemblies');
     assert.equal(await page.locator('#studio-components [data-scene-assembly="true"]').count()+await page.locator('#studio-components [data-scene-assembly="false"]').count(),await page.locator('#studio-components .studio-device').count());
     assert.equal(await page.locator('#studio-review .studio-review-item').count(),6);
     assert.equal(await page.locator('#studio-review .studio-review-item input:checked').count(),0);
     const reviewCheck=page.locator('#studio-review .studio-review-item input').first();
     await reviewCheck.check();
     assert.equal(await page.locator('#studio-review .studio-review-item input:checked').count(),1);
     await reviewCheck.uncheck();

     configurations.add(await page.locator('#studio-components').innerText());
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     const visibleCount=await page.locator('#studio-components .studio-device-context').evaluateAll(nodes=>nodes.filter(n=>/Visible scene assembly|场景中可见构件/.test(n.textContent)).length);
     assert.equal(await page.locator('#studio-hotspots button').count(),visibleCount);
     if(visibleCount){await page.locator('#studio-hotspots button').first().click();await page.waitForFunction(()=>document.querySelector('#studio-hotspots button')?.getAttribute('aria-pressed')==='true');const restore=page.locator('#studio-views button').filter({hasText:lang==='zh'?'恢复原色':'Restore colors'});await restore.click();assert.equal(await restore.getAttribute('aria-pressed'),'true');}
     await page.locator('#studio-components .studio-device button').first().click();
     await page.locator('#studio-roles select').selectOption('2');
     assert(await page.locator('#studio-roles p').innerText());
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     assert((await sc.evaluate(c=>c.toDataURL())).length>1000,'Industry area rendered');
     const activeGPU=await page.locator('#studio-engine').innerText();
     if(requireGPU)assert(activeGPU.includes('WebGL 2'),'WebGL should remain active across all profiles');
     if(activeGPU.includes('WebGL 2')){
      const pixels=await page.locator('#studio-gl').evaluate(c=>{const out=document.createElement('canvas');out.width=64;out.height=64;const context=out.getContext('2d');context.drawImage(c,0,0,64,64);const data=context.getImageData(0,0,64,64).data;let visible=0,colors=new Set();for(let k=0;k<data.length;k+=4){if(data[k+3]>100){visible++;colors.add((data[k]>>4)*256+(data[k+1]>>4)*16+(data[k+2]>>4))}}return{visible,colors:colors.size}});
      assert(pixels.visible>150&&pixels.colors>12,'Nonempty WebGL scene with distinct material colors: '+JSON.stringify(pixels));
     }
     if(captures&&lang==='zh'&&v===0)await page.locator('.studio-canvas-stack').screenshot({path:captures+'/industry-'+(s+1)+'-area-'+(i+1)+'.png'});

    }
    assert.equal(configurations.size,3);
   }
  }
  const priorPath=await page.locator('#studio-path').innerText();
  await page.locator('#studio-components .studio-device button').nth(1).click();
  assert(await page.locator('#lab-library-panel').isVisible());
  assert(await page.locator('#lab-studio').isHidden());
  assert(await page.locator('#lab-device-origin').isVisible());
  assert(await page.locator('#lab-info h2').innerText());
  await page.locator('#lab-back-scene').click();
  assert(await page.locator('#lab-studio').isVisible());
  assert.equal(await page.locator('#studio-path').innerText(),priorPath);
  await page.locator('#lab-mode-library').click();
  console.log('STUDIO PASS',lang,'4 industries, 12 areas, 36 configurations');
  const categories=await page.locator('#lab-categories button').allTextContents();
  assert.equal(categories.length,5);
  for(const count of [30,30,15,10])assert(categories.some(x=>x.endsWith('· '+count)));
  const models=page.locator('#lab-modules button');
  const keys=new Set(),titles=new Set();
  for(let i=0;i<85;i++){
   await models.nth(i).click();
   const title=await page.locator('#lab-info h2').textContent();
   assert(title?.trim());
   titles.add(title);
   keys.add(new URL(page.url()).searchParams.get('model'));
   assert.equal(await page.locator('#lab-info dd').count(),6);
   assert.equal(await page.locator('#lab-engineering h4').count(),3);
   assert(await page.locator('#lab-engineering p').evaluateAll(nodes=>nodes.length===3&&nodes.every(n=>n.textContent.trim().length>0)));

   assert(await page.locator('#lab-info dd').evaluateAll(nodes=>nodes.every(n=>n.textContent.trim().length>0)));
   const sample=await page.evaluate(()=>{const gpu=document.querySelector('#lab-gl'),fallback=document.querySelector('#lab-canvas');const active=getComputedStyle(gpu).visibility==='visible'?gpu:fallback;const mini=document.createElement('canvas');mini.width=96;mini.height=96;const ctx=mini.getContext('2d');ctx.drawImage(active,0,0,96,96);const d=ctx.getImageData(0,0,96,96).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>80&&(d[i]>45||d[i+1]>50))n++;return{n,gpu:active===gpu}});
   if(requireGPU)assert(sample.gpu,'Component WebGL is active: '+title);
   assert(sample.n>10,'Canvas should display nonempty geometry: '+title);
   await page.locator('[data-act=explode]').click();
   assert.equal(await page.locator('[data-act=explode]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-act=explode]').click();
  }
  assert.equal(titles.size,85);assert.equal(keys.size,85);
  const revisedAssemblies=[
   ['安防照明','Security lighting',4],
   ['实体防护墙','Solid boundary wall',3],
   ['安全玻璃','Security glazing',2],
   ['安全储物柜','Secure storage cabinet',4],
   ['门磁状态传感器','Door contact',3],
   ['凭证读取器','Credential reader',4],
   ['访客自助终端','Visitor kiosk',5],
   ['访客服务柜台','Visitor service counter',4],
   ['紧急求助终端','Emergency assistance station',4],
   ['访客凭证打印机','Visitor badge printer',4],
   ['事件管理工作站','Incident management workstation',4],
   ['便携对讲机','Portable radio',5],
   ['应急照明灯','Emergency luminaire',5]
  ];
  for(const [zh,en,count] of revisedAssemblies){
   await page.locator('#lab-search').fill(lang==='zh'?zh:en);
   const match=page.locator('#lab-modules button').filter({hasText:lang==='zh'?zh:en});
   await match.first().click();
   const parts=page.locator('#lab-parts button');
   assert.equal(await parts.count(),count,en+' assembly groups');
   for(let i=0;i<count;i++){
    await parts.nth(i).click();
    assert.equal(await parts.nth(i).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#lab-part-preview svg').count(),1);
    assert(await page.locator('#lab-part-preview svg polygon').count()>0);
    assert.equal(await page.locator('#lab-part-preview strong').innerText(),await parts.nth(i).innerText());
    await parts.nth(i).click();
    assert.equal(await parts.nth(i).getAttribute('aria-pressed'),'false');
    assert.equal(await page.locator('#lab-part-preview svg').count(),0);
   }
   if(captures&&lang==='zh')await page.locator('.lab-canvas-stack').screenshot({path:captures+'/assembly-'+en.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.png'});
  }
  for(const [zh,en] of [['安防照明','Security lighting'],['应急照明灯','Emergency luminaire'],['访客凭证打印机','Visitor badge printer'],['设备状态显示屏','Equipment status display']]){
   await page.locator('#lab-search').fill(en);
   const matches=page.locator('#lab-modules button');assert.equal(await matches.count(),1,en);
   await matches.first().click();
   const demo=page.locator('#lab-demo input[type=range]');assert(await demo.isVisible());
   const image=()=>page.evaluate(()=>{const gpu=document.querySelector('#lab-gl');return(getComputedStyle(gpu).visibility==='visible'?gpu:document.querySelector('#lab-canvas')).toDataURL()});
   await demo.fill('0');const before=await image();
   await demo.fill('100');assert.notEqual(await image(),before,en+' demonstration must change rendered geometry or color');
   await demo.fill('0');assert.equal(await image(),before,en+' demonstration returns to initial state');
  }
  await page.locator('#lab-search').fill('');

  const search=page.locator('#lab-search');await search.fill(lang==='zh'?'枪式摄像机':'Bullet camera');
  assert.equal(await models.count(),1);
  await models.first().click();
  const modelURL=page.url();const modelKey=new URL(modelURL).searchParams.get('model');
  const modelImage=()=>page.evaluate(()=>{const gpu=document.querySelector('#lab-gl');return(getComputedStyle(gpu).visibility==='visible'?gpu:document.querySelector('#lab-canvas')).toDataURL()});
  const productView=page.locator('[data-act=product]');
  assert(await productView.isVisible());
  const fullCamera=await modelImage();await productView.click();
  assert.equal(await productView.getAttribute('aria-pressed'),'true');
  assert.notEqual(await modelImage(),fullCamera);
  if(captures&&lang==='zh')await page.locator('.lab-canvas-stack').screenshot({path:captures+'/camera-product-close-up.png'});
  await productView.click();assert.equal(await productView.getAttribute('aria-pressed'),'false');
  const before=await modelImage();
  await page.locator('[data-act=right]').click();assert.notEqual(await modelImage(),before);
  await page.locator('[data-act=night]').click();assert.equal(await page.locator('[data-act=night]').getAttribute('aria-pressed'),'true');
  await page.locator('#lab-parts button').first().click();assert.equal(await page.locator('#lab-parts button').first().getAttribute('aria-pressed'),'true');
  await page.locator('#lab-flow button').last().click();assert(await page.locator('#lab-flow-copy').textContent());if(captures&&lang==='zh')await page.locator('.lab-canvas-stack').screenshot({path:captures+'/component-example.png'});
  await page.locator('#lab-quiz button').first().click();assert(await page.locator('#lab-answer').textContent());
  await page.locator('#lab-play').click();await page.waitForTimeout(1200);assert.equal(await page.locator('#lab-process button').nth(1).getAttribute('aria-pressed'),'true');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#lab-info h2').waitFor();assert.equal(new URL(page.url()).searchParams.get('model'),modelKey);
  await page.locator('.switch-desktop a').filter({hasText:lang==='zh'?'EN':'中文'}).click();await page.waitForURL('**/lab/'+(lang==='zh'?'en':'zh')+'/**');await page.locator('#lab-info h2').waitFor();assert.equal(new URL(page.url()).searchParams.get('model'),modelKey);
  console.log('LAB DESKTOP PASS',lang,'85 models and interactions');await page.close();
 }
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  page.on('pageerror',e=>errors.push('mobile '+width+': '+e.message));
  await page.goto(base+'/lab/zh/',{waitUntil:'domcontentloaded'});await page.locator('#overview-quick-components button').first().waitFor();
  assert.equal(await page.locator('#overview-quick-components button[aria-pressed=true]').count(),0);
  assert(await page.locator('#overview-canvas').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Overview no mobile horizontal overflow');
  assert(await page.evaluate(()=>{const model=document.querySelector('.overview-exhibit-layout .overview-view').getBoundingClientRect(),chooser=document.querySelector('.quick-explorer').getBoundingClientRect();return chooser.bottom<=model.top+1}),'Mobile selector remains above model');
  const mobileQuick=page.locator('#overview-quick-components button');
  await mobileQuick.nth(2).click();
  assert.equal(await mobileQuick.nth(2).getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===1);
  assert(await page.locator('#overview-detail .quick-product-preview').isVisible());
  await page.locator('#overview-views button').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('#overview-hotspots button').length===0);
  assert.equal(await page.locator('#overview-quick-components button[aria-pressed=true]').count(),0);
  await page.locator('#lab-mode-scene').click();await page.locator('#studio-scenes button').first().waitFor();
  assert(await page.locator('#studio-canvas').isVisible());assert(await page.locator('#lab-canvas').isHidden());
  await page.locator('#lab-mode-library').click();await page.locator('#lab-info h2').waitFor();assert(await page.locator('#lab-canvas').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'No mobile horizontal overflow');
  await page.locator('#lab-categories button').last().click();assert.equal(await page.locator('#lab-modules button').count(),10);
  await page.locator('[data-act=base]').click();assert.equal(await page.locator('[data-act=base]').getAttribute('aria-pressed'),'false');
  console.log('LAB MOBILE PASS',width);await page.close();
 }
 assert.deepEqual(errors,[]);console.log('LAB ACCEPTANCE PASSED');
} finally {await browser.close();await new Promise(r=>server.close(r))}
