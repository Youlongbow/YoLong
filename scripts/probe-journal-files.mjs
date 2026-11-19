import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1000}});
 const response=await page.goto('https://www.ravenlong.com/p/2f83102210ef81ba8732eba57dd2aee8',{waitUntil:'domcontentloaded',timeout:40000});
 await page.waitForTimeout(2600);
 const links=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>({text:(a.textContent||'').trim().slice(0,80),url:a.href})).filter(a=>/\.pdf|\.mp4|download|attachment/i.test(a.url+' '+a.text)).map(a=>{const u=new URL(a.url);return {text:a.text,host:u.hostname,path:u.pathname.slice(0,250)}}).slice(0,80));
 const buttons=await page.evaluate(()=>[...document.querySelectorAll('button')].filter(a=>/download|下载/i.test(a.textContent||'')).slice(0,12).map(a=>({text:a.textContent.slice(0,80),html:a.outerHTML.slice(0,200)})));
 console.log('LEGACY_JOURNAL_ATTACHMENTS',JSON.stringify({status:response.status(),title:await page.title(),links,buttons}).slice(0,12500));

 const pdfBlocks=await page.evaluate(()=>{
  const el=[...document.querySelectorAll('div,span,button')].filter(x=>x.childElementCount<=2 && /\.pdf|\.mp4/i.test(x.textContent||''));
  return el.slice(0,22).map(x=>{
   const parent=x.closest('[data-block-id]')||x.parentElement?.parentElement;
   const attrs=parent?[...parent.attributes].map(a=>a.name):[];
   return {tag:x.tagName,role:x.getAttribute('role'),className:String(x.className).slice(0,120),text:x.textContent.slice(0,105),parentTag:parent?.tagName,parentAttrs:attrs.slice(0,12),parentRole:parent?.getAttribute('role'),parentText:parent?.textContent.slice(0,140)};
  });
 });
 console.log('LEGACY_PDF_BLOCKS',JSON.stringify(pdfBlocks).slice(0,8000));

}finally{await browser.close()}
