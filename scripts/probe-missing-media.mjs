import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1400,height:930}});
const cases=[
 {key:'BLA',url:'https://www.ravenlong.com/p/4113102210ef81e385e2d18872c6961e',needle:'bla-redesign-zh'},
 {key:'Experience',url:'https://www.ravenlong.com/p/2f83102210ef81ddb5a2dd1c5467b816',needle:'AUIB'},
 {key:'HEAT',url:'https://www.ravenlong.com/p/3f93102210ef81b89c88d5eb2b9a3314',needle:'HEAT_Certificate'}
];
try{
 for(const x of cases){
  const records=[];
  const listener=r=>{const u=r.url();if(/\.svg|b2f8990c|b62e7986|5c0b7f28|77d3ad07|bla-redesign-zh|HEAT_Certificate|AUIB|Trophy/i.test(u)) records.push({status:r.status(),type:r.headers()['content-type'],url:u.slice(0,440)})};
  page.on('response',listener);
  const response=await page.goto(x.url,{waitUntil:'domcontentloaded',timeout:40000});
  await page.waitForTimeout(3500);
  const info=await page.evaluate((needle)=>({
   title:document.title,
   allImages:[...document.querySelectorAll('img')].map(i=>({alt:i.alt,src:i.currentSrc.slice(0,230),naturalWidth:i.naturalWidth})).filter(x=>/bla-redesign|AUIB|Trophy|Certificate|redesign|notionusercontent/i.test(JSON.stringify(x))).slice(0,35),
   links:[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim().slice(0,70),href:a.href.slice(0,450)})).filter(x=>/\.svg|bla-redesign|AUIB|Trophy|Certificate/i.test(JSON.stringify(x))).slice(0,35),
   markupCount:(document.documentElement.outerHTML.match(/bla-redesign|AUIB|Trophy|HEAT_Certificate/ig)||[]).length,
   bodyTextFound:document.body.innerText.includes(needle),
   scroll:document.documentElement.scrollHeight
  }),x.needle);
  console.log('MEDIA_PROBE',JSON.stringify({key:x.key,status:response?.status(),info,records:records.slice(0,40)}).slice(0,14000));
  page.off('response',listener);
 }
}finally{await browser.close()}
