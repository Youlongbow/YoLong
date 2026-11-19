import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const source=readFileSync('assets/media/brand/raven-logo-web.webp').toString('base64');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 const encoded=await page.evaluate(async(encoded)=>{
  const img=new Image();
  img.src='data:image/webp;base64,'+encoded;
  await img.decode();
  const scaleX=img.naturalWidth/1254,scaleY=img.naturalHeight/1254;
  const crop={x:310*scaleX,y:105*scaleY,w:630*scaleX,h:900*scaleY};
  const canvas=document.createElement('canvas');
  canvas.width=630;canvas.height=900;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(img,crop.x,crop.y,crop.w,crop.h,0,0,630,900);
  const pixels=ctx.getImageData(0,0,630,900);
  const values=pixels.data;
  for(let i=0;i<values.length;i+=4){
   const r=values[i],g=values[i+1],b=values[i+2];
   const red=r>90 && r>g*1.55 && r>b*1.38 && g<135;
   if(red){values[i]=239;values[i+1]=34;values[i+2]=44;values[i+3]=255}
   else{
    const brightness=(r+g+b)/3;
    const opacity=Math.round(Math.max(0,Math.min(255,(237-brightness)*3.2)));
    values[i]=255;values[i+1]=255;values[i+2]=255;values[i+3]=opacity;
   }
  }
  ctx.putImageData(pixels,0,0);
  return canvas.toDataURL('image/png').split(',')[1];
 },source);
 const path='assets/media/brand/raven-mark-light.png';
 mkdirSync('assets/media/brand',{recursive:true});
 writeFileSync(path,Buffer.from(encoded,'base64'));
 const mapPath='content/media-map.json';
 const map=JSON.parse(readFileSync(mapPath,'utf8'));
 map.branding.mark='/'+path;
 writeFileSync(mapPath,JSON.stringify(map,null,2)+'\n');
 console.log(JSON.stringify({result:'transparent brand mark created',width:630,height:900,bytes:Buffer.from(encoded,'base64').length,source:'original user-approved RAVEN logo'}));
}finally{await browser.close()}
