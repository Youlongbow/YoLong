import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const manifest=JSON.parse(readFileSync('dist/media-manifest.json','utf8'));
const mapPath='content/media-map.json';
const map=existsSync(mapPath)?JSON.parse(readFileSync(mapPath,'utf8')):{schema:1,branding:{},images:{}};
const catalogs={};
for(const locale of ['zh','en'])
 for(const section of ['pages','research','training'])
  catalogs[section+'-'+locale]=JSON.parse(readFileSync('content/'+section+'-'+locale+'.json','utf8'));

const byId=new Map(),pageGroups=new Map();
for(const file of manifest.files){
 const parsed=file.source.match(/^notion-file-block:\/\/[^/]+\/([0-9a-f-]{36})\?/i);
 if(!parsed)continue;
 const id=parsed[1].toLowerCase();
 const catalog=catalogs[file.section+'-'+file.locale];
 const docs=catalog?.pages||catalog?.articles||catalog?.modules||[];
 const doc=docs.find(x=>x.slug===file.slug);
 const pageId=doc?.sourceId || doc?.originalNotionId;
 if(!pageId)continue;
 const url='https://www.ravenlong.com/p/'+pageId.replace(/-/g,'');
 let job=byId.get(id);
 if(!job){job={id,refs:new Set(),pages:new Set(),name:file.name};byId.set(id,job)}
 job.refs.add(file.source);
 job.pages.add(url);
 if(!pageGroups.has(url))pageGroups.set(url,new Set());
 pageGroups.get(url).add(id);
}
let saved=0,failed=0,visited=0,bytesTotal=0;
const maxPages=Number(process.env.MIRROR_MAX_PAGES||0);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const formats={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/avif':'avif'};
const MAX_BYTES=12*1024*1024;
let active=new Set(),pending=new Set();
const print=(tag,data)=>console.log(tag,JSON.stringify(data));
page.on('response',response=>{
 const url=decodeURIComponent(response.url()).toLowerCase();
 for(const id of active){
  if(pending.has(id)||!url.includes(id))continue;
  if(response.status()!==200)continue;
  const type=(response.headers()['content-type']||'').split(';')[0].trim();
  const ext=type==='image/svg+xml'?'svg':formats[type];
  if(!ext)continue;
  pending.add(id);
  const task=(async()=>{
   try{
    let binary=Buffer.from(await response.body());
    if(type==='image/svg+xml'){
     const svg=binary.toString('utf8');
     if(!/<svg\b/i.test(svg)||/<script\b|<foreignObject\b|\bon[a-z]+\s*=|javascript:/i.test(svg))throw Error('SVG source failed safety validation');
    }
    if(binary.length<150||binary.length>MAX_BYTES)throw Error('Invalid size '+binary.length);
    const path='assets/media/notion/'+id+'.'+ext;
    mkdirSync(dirname(path),{recursive:true});
    writeFileSync(path,binary);
    for(const ref of byId.get(id).refs)map.images[ref]='/'+path;
    saved++;bytesTotal+=binary.length;
    print('MEDIA_SAVED',{id,type,bytes:binary.length});
   }catch(e){failed++;print('MEDIA_FAILED',{id,error:String(e).slice(0,150)})}
   finally{active.delete(id);pending.delete(id)}
  })();
  pending.add(id);
  task.finally(()=>pending.delete(id));
  break;
 }
});
try{
 const groups=[...pageGroups.entries()];
 for(const [url,ids] of groups){
  if(maxPages>0 && visited>=maxPages)break;
  const needed=[...ids].filter(id=>![...byId.get(id).refs].every(ref=>map.images[ref]&&existsSync(map.images[ref].slice(1))));
  if(!needed.length)continue;
  visited++;
  active=new Set(needed);
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
   await page.waitForTimeout(1300);
   const scroller=await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('*')].filter(el=>{
     const style=getComputedStyle(el);
     return el.clientHeight>150 && el.scrollHeight-el.clientHeight>250 && /(auto|scroll)/.test(style.overflowY);
    }).sort((a,b)=>(b.scrollHeight-b.clientHeight)-(a.scrollHeight-a.clientHeight));
    const el=nodes[0]||document.scrollingElement;
    window.__ravenMediaScroll=el;
    return {height:el.scrollHeight,viewport:el.clientHeight,description:String(el.className||el.tagName).slice(0,100),candidates:nodes.length};
   });
   const totalSteps=Math.min(260,Math.max(2,Math.ceil(scroller.height/750)+1));
   for(let step=0;step<totalSteps && active.size;step++){
    await page.evaluate(y=>{
     const el=window.__ravenMediaScroll;
     if(el)el.scrollTop=y;
     else scrollTo(0,y);
    },step*750);
    await page.waitForTimeout(210);
   }
   for(const id of [...active]){
    const job=byId.get(id);
    const source=[...job.refs][0];
    const found=source.match(/^notion-file-block:\/\/([^/]+)\/[a-z0-9-]+\?(.+)$/i);
    if(!found){print('MEDIA_FORCED_FAILED',{id,reason:'missing block reference'});continue}
    const originalParams=new URLSearchParams(found[2]);
    const query=new URLSearchParams({
      table:'block',id:found[1],spaceId:originalParams.get('space_id')||'',
      userId:'',cache:'v2',imgBuildSrc:'requestProxiedImageUrl'
    });
    if(!/\.svg$/i.test(job.name))query.set('width','1310');
    const src='https://www.ravenlong.com/image/attachment%3A'+id+'%3A'+encodeURIComponent(job.name)+'?'+query.toString();
    try{
     const result=await page.evaluate(async(src)=>{
      const image=new Image();
      image.style.cssText='position:absolute;width:1px;height:1px;left:-99999px';
      document.body.appendChild(image);image.src=src;
      try{await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),7000))]);return {ok:true,width:image.naturalWidth}}
      finally{image.remove()}
     },src);
     print('MEDIA_FORCED',{id,ok:result.ok});
    }catch(e){print('MEDIA_FORCED_FAILED',{id,name:job.name,error:String(e).slice(0,130)})}
   }
   await page.waitForTimeout(900);
   print('MEDIA_PAGE',{path:new URL(url).pathname,http:response?.status(),needed:needed.length,remaining:active.size,scroller});
  }catch(e){failed++;print('MEDIA_PAGE_FAILED',{path:new URL(url).pathname,error:String(e).slice(0,180)})}
  active.clear();
 }
}finally{
 await page.waitForTimeout(600);
 await browser.close();
}
writeFileSync(mapPath,JSON.stringify(map,null,2)+'\n');
print('MEDIA_SUMMARY',{requested:byId.size,visitedPages:visited,totalPages:pageGroups.size,saved,failures:failed,bytesTotal,linkedReferences:Object.keys(map.images).length,logo:map.branding.logo});
if(saved===0 && Object.keys(map.images).length===0)process.exitCode=1;
