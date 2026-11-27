import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;if(p.endsWith('/'))p+='index.html';const path=resolve(root,'.'+decodeURIComponent(p));if(!path.startsWith(root+'/'))throw Error();res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(await readFile(path))}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.LAB_LIVE_ORIGIN||'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM_PATH?{executablePath:process.env.LAB_CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const captures=process.env.LAB_CAPTURE_DIR;if(captures)await mkdir(captures,{recursive:true});const errors=[];
try{
 for(const lang of ['zh','en']){
  const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});
  await page.goto(base+'/lab/'+lang+'/',{waitUntil:'domcontentloaded'});await page.locator('[data-add="person"]').waitFor();
  const cmd=k=>page.locator('[data-cmd="'+k+'"]'),field=k=>page.locator('[data-person="'+k+'"]'),canvas=page.locator('#rd-canvas'),object=()=>canvas.locator('[data-object]').last(),selectFirst=()=>page.locator('#rd-objects [data-select]').first().click();
  const save=async()=>{await cmd('save').click();return page.evaluate(()=>JSON.parse(localStorage.getItem('raven-design-scene-v1')))};
  const change=async(k,v)=>{if(await field(k).evaluate(el=>el.tagName==='SELECT'))await field(k).selectOption(v);else{await field(k).fill(String(v));await field(k).dispatchEvent('change')}};
  const importScene=async data=>page.locator('#rd-file').setInputFiles({name:'people.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
  const presets=[['hostile_civilian','none','casual','hostile'],['handgun_person','pistol','casual','civilian'],['rifle_person','rifle','casual','civilian'],['armed_hostile','rifle','fictional','hostile']];
  for(const [type,weapon,clothing,role] of presets){
   console.log('Checking figure',lang,type);
   await cmd('new').click();await page.locator('[data-add="'+type+'"]').click();await cmd('fit-selection').click();
   assert.equal(await field('weapon').inputValue(),weapon);assert.equal(await field('clothing').inputValue(),clothing);assert.equal(await field('role').inputValue(),role);
   assert.equal(await object().locator('[data-person-part="weapon"]').count()>0,weapon!=='none');
   assert.equal(await object().locator('[data-person-part="equipment"]').count()>0,type==='armed_hostile');
   const original=await object().innerHTML(),saved=(await save()).objects[0];
   await change('role','security');await change('marker','label');assert.equal(await object().innerHTML(),original,'role marker preserves appearance');
   assert.equal(await canvas.locator('.rd-role-marker').getAttribute('data-role'),'security');
   assert.deepEqual({...((await save()).objects[0].person),role:saved.person.role,marker:saved.person.marker},saved.person,'independent role properties');
   await change('marker','none');assert.equal(await canvas.locator('.rd-role-marker').count(),0);assert.equal(await object().innerHTML(),original);
   await cmd('reset-person').click();await cmd('fit-selection').click();
   if(captures){await page.locator('.rd-viewport').screenshot({path:captures+'/person-'+type+'-'+lang+'.png'});}
   await cmd('gpu').click();assert.equal(await cmd('gpu').getAttribute('aria-pressed'),'true');assert(Number(await page.locator('#rd-gpu').getAttribute('data-triangles'))>1000);
   assert(await page.locator('#rd-gpu').evaluate(c=>{const g=c.getContext('webgl'),pixels=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,pixels);return pixels.some((v,i)=>i%4===3&&v>0)}),'real GPU output');
   await cmd('gpu').click();
  }
  await cmd('new').click();await page.locator('[data-add="rifle_person"]').click();
  const changed={height:1.93,headScale:1.1,build:'broad',clothing:'jacket',hair:'tied',headwear:'cap',pose:'seated',equipment:'backpack',weapon:'pistol',role:'unknown',marker:'label',shirt:'#a44838',trousers:'#334455',skin:'#997755',hairColor:'#242424',shoes:'#191919'};
  for(const [k,v] of Object.entries(changed))await change(k,v);
  await cmd('fit-selection').click();const edited=await save();assert.equal(edited.version,6);assert.deepEqual(edited.objects[0].person,changed);
  assert(!/NaN|undefined|Infinity/.test(await canvas.innerHTML()));
  await cmd('duplicate').click();await change('shirt','#225599');let saved=await save();assert.equal(saved.objects[0].person.shirt,changed.shirt,'duplicate does not share editable state');assert.equal(saved.objects[1].person.shirt,'#225599');
  await cmd('undo').click();await page.locator('#rd-objects [data-select]').last().click();assert.equal(await field('shirt').inputValue(),changed.shirt);
  await cmd('redo').click();await page.locator('#rd-objects [data-select]').last().click();assert.equal(await field('shirt').inputValue(),'#225599');
  await cmd('new').click();await cmd('load').click();await selectFirst();assert.deepEqual((await save()).objects,saved.objects,'browser save/load round trip');
  await page.reload();await page.locator('[data-add="person"]').waitFor();await cmd('load').click();await selectFirst();assert.deepEqual((await save()).objects,saved.objects,'reload recovery');
  const downloadPromise=page.waitForEvent('download');await cmd('export').click();const download=await downloadPromise;const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.deepEqual(exported.objects,saved.objects);
  await cmd('new').click();await importScene(exported);await selectFirst();assert.deepEqual((await save()).objects,saved.objects,'JSON import preserves all appearance and role fields');
  // Clipboard, group edits and undo retain independent appearance across figures.
  await cmd('copy-objects').click();await cmd('paste-in-place').click();await change('hair','bald');saved=await save();assert.equal(saved.objects[0].person.hair,'tied');assert.equal(saved.objects[2].person.hair,'bald');
  await canvas.focus();await page.keyboard.press('Control+a');await change('role','hostile');saved=await save();assert(saved.objects.every(o=>o.person.role==='hostile'));assert.equal(saved.objects[1].person.shirt,'#225599');assert.equal(saved.objects[2].person.hair,'bald');
  // Existing v5 scenes keep their dimensions and receive deterministic role defaults.
  await importScene({version:5,objects:[{id:1,type:'hostile_role',x:2,z:1,y:0,w:.55,d:.35,h:1.75,r:15}]});await selectFirst();saved=await save();assert.equal(saved.objects[0].w,.55);assert.equal(saved.objects[0].r,15);assert.equal(saved.objects[0].person.role,'hostile');assert.equal(saved.objects[0].person.weapon,'none');
  // Invalid imported appearance cannot inject markup or poison geometry.
  await importScene({objects:[{...saved.objects[0],person:{height:999,headScale:-8,pose:'<img>',weapon:'unknown',shirt:'<svg/onload=alert(1)>',role:'<script>'}}]});await selectFirst();saved=await save();assert.equal(saved.objects[0].person.height,2.1);assert.equal(saved.objects[0].person.headScale,.85);assert.equal(saved.objects[0].person.pose,'standing');assert.equal(saved.objects[0].person.weapon,'none');assert(!/NaN|Infinity/.test(await canvas.innerHTML()));
  // Pose changes modify articulated limbs, with a stable human scale on return.
  await cmd('reset-person').click();const standing=(await save()).objects[0],standingMarkup=await object().innerHTML();
  for(const pose of ['walking','seated','gesturing']){await change('pose',pose);assert.notEqual(await object().innerHTML(),standingMarkup);assert(!/NaN|Infinity/.test(await object().innerHTML()));}
  await change('pose','standing');saved=await save();for(const k of ['w','d','h'])assert(Math.abs(saved.objects[0][k]-standing[k])<1e-8,'pose round trip '+k);
  // All clothing and hair options have visible geometry, including behind the head.
  for(const hair of ['short','bob','long','tied','bald']){await change('hair',hair);assert.equal(await object().locator('[data-person-part="hair"]').count()>0,hair!=='bald')}
  for(const clothing of ['shirt','casual','jacket','uniform','robe','fictional']){await change('clothing',clothing);assert(await object().locator('[data-person-part="clothing"]').count()>0)}
  await cmd('reset-person').click();await change('marker','label');await cmd('render-open').click();
  assert(await page.locator('#rd-render-preview img').evaluate(async img=>{const svg=await (await fetch(img.src)).text();return new DOMParser().parseFromString(svg,'image/svg+xml').querySelector('.rd-role-marker')!==null}),'role marker appears in exported SVG');await cmd('render-close').click();
  // Gallery for visual review: four requested models, plus walking and seated variants.
  const gallery={objects:presets.map(([type],i)=>({type,x:(i-1.5)*1.3,z:0,w:.62,d:.45,h:1.75,r:0})).concat([{type:'civilian_walking',x:-1,z:1.5,w:.56,d:.65,h:1.73,r:0},{type:'civilian_seated',x:1,z:1.5,w:.55,d:.72,h:1.32,r:0}])};
  await importScene(gallery);await cmd('fit-scene').click();if(captures)await canvas.screenshot({path:captures+'/people-gallery-'+lang+'.png'});
  await page.setViewportSize({width:390,height:844});await selectFirst();await change('role','security');await change('weapon','pistol');await change('hair','long');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'mobile has no horizontal overflow');
  if(captures)await page.locator('.rd-person-editor').screenshot({path:captures+'/people-mobile-'+lang+'.png'});
  console.log('PEOPLE ACCEPTANCE PASS',lang,'desktop and mobile',base);await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PEOPLE ACCEPTANCE PASSED');
}finally{await browser.close();await new Promise(r=>server.close(r))}
