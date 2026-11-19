import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const root='https://www.ravenlong.com';
const logo={id:'0fe7f42c-4f01-47a5-bef6-4a6b6db77fe3',name:'raven-logo-web.png',logo:true};
const onlyLogo=process.env.MIRROR_LOGO_ONLY==='1';
const manifest=onlyLogo?{files:[]}:JSON.parse(readFileSync('dist/media-manifest.json','utf8'));
const dest='content/media-map.json';
const map=existsSync(dest)?JSON.parse(readFileSync(dest,'utf8')):{schema:1,images:{},branding:{}};
const jobs=[logo];
const byId=new Map([[logo.id,logo]]);
for(const item of manifest.files){
 const match=item.source.match(/^notion-file-block:\/\/[^/]+\/([0-9a-f-]{36})\?/i);
 if(!match)continue;
 const id=match[1];
 const name=item.name||'image';
 if(!byId.has(id)){
  const job={id,name,refs:[item.source]};
  byId.set(id,job);
  jobs.push(job);
 }else{
  const job=byId.get(id);
  job.refs??=[];
  job.refs.push(item.source);
 }
}
const formats=new Map([
 ['image/png','png'],['image/jpeg','jpg'],['image/webp','webp'],
 ['image/gif','gif'],['image/avif','avif']
]);
const MAX_BYTES=12*1024*1024;
let succeeded=0,skipped=0,failed=0,cursor=0;
const log=(kind,obj)=>console.log(kind,JSON.stringify(obj));
async function mirror(job){
 if(!job.logo && (job.refs||[]).every(ref=>map.images[ref] && existsSync(map.images[ref].replace(/^\/+/,'')))){skipped++;return}
 const publicUrl=root+'/image/attachment%3A'+job.id+'%3A'+encodeURIComponent(job.name);
 for(let attempt=1;attempt<=2;attempt++){
  try{
   const response=await fetch(publicUrl,{signal:AbortSignal.timeout(25000),headers:{'user-agent':'RAVEN archival media preservation/1.0'}});
   if(!response.ok)throw Error('HTTP '+response.status);
   const type=(response.headers.get('content-type')||'').split(';')[0].toLowerCase().trim();
   const ext=formats.get(type);
   if(!ext){log('SKIPPED_UNSUPPORTED',{name:job.name,type});skipped++;return}
   const hintedSize=Number(response.headers.get('content-length')||'0');
   if(hintedSize>MAX_BYTES){log('SKIPPED_OVERSIZE',{name:job.name,size:hintedSize});skipped++;return}
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length>MAX_BYTES)throw Error('File larger than 12 MiB');
   if(bytes.length<100)throw Error('Downloaded file unexpectedly small');
   const path=job.logo?'assets/media/brand/raven-logo-web.'+ext:'assets/media/notion/'+job.id+'.'+ext;
   mkdirSync(dirname(path),{recursive:true});
   writeFileSync(path,bytes);
   if(job.logo)map.branding.logo='/'+path;
   for(const ref of job.refs||[])map.images[ref]='/'+path;
   succeeded++;
   log('MIRRORED',{name:job.name,path,bytes:bytes.length});
   return;
  }catch(error){
   if(attempt===2){failed++;log('FETCH_FAILED',{name:job.name,reason:String(error).slice(0,180)})}
  }
 }
}
const WORKERS=onlyLogo?1:6;
await Promise.all(Array.from({length:WORKERS},async()=>{while(cursor<jobs.length){const job=jobs[cursor++];await mirror(job)}}));
writeFileSync(dest,JSON.stringify(map,null,2)+'\n');
log('MEDIA_MIGRATION',{logo:map.branding.logo||null,requested:jobs.length,mirrored:succeeded,alreadyPresentOrSkipped:skipped,failed,linked:Object.keys(map.images).length});
if(!map.branding.logo)process.exitCode=1;
