import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1400,height:950}});
const logoId='0fe7f42c-4f01-47a5-bef6-4a6b6db77fe3';
try{
 const target=page.waitForResponse(response=>decodeURIComponent(response.url()).includes(logoId)&&response.status()===200,{timeout:50000});
 const home=await page.goto('https://www.ravenlong.com/',{waitUntil:'domcontentloaded',timeout:40000});
 console.log('LEGACY_HOME_HTTP',home?.status());
 const image=await target;
 const payload=Buffer.from(await image.body());
 const type=(image.headers()['content-type']||'').split(';')[0];
 console.log('ORIGINAL_LOGO_RESPONSE',JSON.stringify({type,bytes:payload.length,url:image.url().split('?')[0]}));
 if(type!=='image/png'||payload.length<1000)throw Error('Original logo was not a valid PNG');
 mkdirSync('assets/media/brand',{recursive:true});
 writeFileSync('assets/media/brand/raven-logo-web.png',payload);
 mkdirSync('content',{recursive:true});
 writeFileSync('content/media-map.json',JSON.stringify({schema:1,branding:{logo:'/assets/media/brand/raven-logo-web.png'},images:{}},null,2)+'\n');
}finally{await browser.close()}
