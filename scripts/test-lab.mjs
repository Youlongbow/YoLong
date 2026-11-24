import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
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
  await page.locator('#lab-modules button').first().waitFor({timeout:30000});
  assert.equal(await page.locator('#lab-modules button').count(),85);
  await page.locator('#studio-scenes button').first().waitFor();
  assert.equal(await page.locator('#studio-scenes button').count(),4);
  const sc=page.locator('#studio-canvas');
  if(requireGPU)await page.waitForFunction(()=>document.querySelector('#studio-engine')?.textContent.includes('WebGL 2'),{},{timeout:30000});
  const gpu=await page.locator('#studio-engine').innerText();
  console.log('STUDIO RENDERER',lang,gpu);

  for(let s=0;s<4;s++){
   await page.locator('#studio-scenes button').nth(s).click();
   assert.equal(await page.locator('#studio-zones button').count(),3);
   for(let i=0;i<3;i++){
    await page.locator('#studio-zones button').nth(i).click();
    assert.equal(await page.locator('#studio-config button').count(),3);
    const configurations=new Set();
    for(let v=0;v<3;v++){
     await page.locator('#studio-config button').nth(v).click();
     assert.equal(await page.locator('#studio-components .studio-device').count(),4);
     configurations.add(await page.locator('#studio-components').innerText());
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
  await page.locator('#studio-components .studio-device button').nth(1).click();
  assert(await page.locator('#lab-info h2').innerText());
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
   assert.equal(await page.locator('#lab-info dd').count(),5);
   assert(await page.locator('#lab-info dd').evaluateAll(nodes=>nodes.every(n=>n.textContent.trim().length>0)));
   const sample=await page.locator('#lab-canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4*97)if(d[i]>65||d[i+1]>75)n++;return n});
   assert(sample>10,'Canvas should display nonempty geometry: '+title);
   await page.locator('[data-act=explode]').click();
   assert.equal(await page.locator('[data-act=explode]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-act=explode]').click();
  }
  assert.equal(titles.size,85);assert.equal(keys.size,85);
  const search=page.locator('#lab-search');await search.fill(lang==='zh'?'枪式摄像机':'Bullet camera');
  assert.equal(await models.count(),1);
  await models.first().click();
  const modelURL=page.url();const modelKey=new URL(modelURL).searchParams.get('model');
  const canvas=page.locator('#lab-canvas');const before=await canvas.evaluate(c=>c.toDataURL());
  await page.locator('[data-act=right]').click();assert.notEqual(await canvas.evaluate(c=>c.toDataURL()),before);
  await page.locator('[data-act=night]').click();assert.equal(await page.locator('[data-act=night]').getAttribute('aria-pressed'),'true');
  await page.locator('#lab-parts button').first().click();assert.equal(await page.locator('#lab-parts button').first().getAttribute('aria-pressed'),'true');
  await page.locator('#lab-flow button').last().click();assert(await page.locator('#lab-flow-copy').textContent());
  await page.locator('#lab-quiz button').first().click();assert(await page.locator('#lab-answer').textContent());
  await page.locator('#lab-play').click();await page.waitForTimeout(1200);assert.equal(await page.locator('#lab-process button').nth(1).getAttribute('aria-pressed'),'true');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#lab-info h2').waitFor();assert.equal(new URL(page.url()).searchParams.get('model'),modelKey);
  await page.locator('.switch-desktop a').filter({hasText:lang==='zh'?'EN':'中文'}).click();await page.waitForURL('**/lab/'+(lang==='zh'?'en':'zh')+'/**');await page.locator('#lab-info h2').waitFor();assert.equal(new URL(page.url()).searchParams.get('model'),modelKey);
  console.log('LAB DESKTOP PASS',lang,'85 models and interactions');await page.close();
 }
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  page.on('pageerror',e=>errors.push('mobile '+width+': '+e.message));
  await page.goto(base+'/lab/zh/',{waitUntil:'domcontentloaded'});await page.locator('#lab-info h2').waitFor();
  assert(await page.locator('#studio-canvas').isVisible());assert(await page.locator('#lab-canvas').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'No mobile horizontal overflow');
  await page.locator('#lab-categories button').last().click();assert.equal(await page.locator('#lab-modules button').count(),10);
  await page.locator('[data-act=base]').click();assert.equal(await page.locator('[data-act=base]').getAttribute('aria-pressed'),'false');
  console.log('LAB MOBILE PASS',width);await page.close();
 }
 assert.deepEqual(errors,[]);console.log('LAB ACCEPTANCE PASSED');
} finally {await browser.close();await new Promise(r=>server.close(r))}
