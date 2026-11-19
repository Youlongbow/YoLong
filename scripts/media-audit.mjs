import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const paths=[
 'pages-zh','pages-en','research-zh','research-en',
 'training-zh','training-en','security-zh','security-en'
];
const files=[];
for (const name of paths) {
 const data=JSON.parse(readFileSync('content/'+name+'.json','utf8'));
 const [section,locale]=name.split('-');
 const docs=data.pages||data.articles||data.modules||data.events||[];
 for(const doc of docs) {
  let index=0;
  for (const match of String(doc.body||'').matchAll(/<(image|file|video|audio)\b[^>]*source="([^"]+)"[^>]*>/g)) {
   const url=match[2], rawName=decodeURIComponent((url.match(/[?&]name=([^&]+)/)||[])[1]||'attachment');
   const safeName=basename(rawName).replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,90)||'attachment';
   const target=['media',section,locale,doc.slug,String(++index).padStart(2,'0')+'-'+safeName].join('/');
   files.push({locale,section,slug:doc.slug,title:doc.title,kind:match[1],name:rawName,source:url,target});
  }
 }
}
if(!files.length)throw Error('Media references missing: unexpected content loss');
const summaries=Object.entries(Object.groupBy(files,f=>f.section+'-'+f.locale)).map(([section,records])=>({section,count:records.length}));
const out={schema:1,updated:'2026-11-20',total:files.length,files,summaries};
mkdirSync('dist',{recursive:true});
writeFileSync(join('dist','media-manifest.json'),JSON.stringify(out));
console.log(JSON.stringify({mediaReferences:files.length,summaries,siteLocalTargets:files.filter(f=>false).length}));
