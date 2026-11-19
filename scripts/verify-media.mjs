import {existsSync,readFileSync,statSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('dist/media-manifest.json','utf8'));
const map=JSON.parse(readFileSync('content/media-map.json','utf8'));
const entries=manifest.files;
const missing=[];
const files=new Map();
for(const item of entries){
 const path=map.images[item.source];
 if(!path){missing.push({section:item.section,locale:item.locale,slug:item.slug,name:item.name,reference:item.source});continue}
 if(!path.startsWith('/assets/media/'))throw Error('Media outside local storage '+path);
 const file=path.slice(1);
 if(!existsSync(file))throw Error('Mapped local media asset does not exist: '+file);
 const bytes=statSync(file).size;
 if(bytes<150)throw Error('Suspiciously small media file: '+file);
 files.set(file,bytes);
}
const logo=map.branding?.logo;
if(!logo||!logo.startsWith('/assets/media/')||!existsSync(logo.slice(1)))throw Error('Permanent local brand logo missing');
const summary={totalReferences:entries.length,localReferences:entries.length-missing.length,missingCount:missing.length,uniqueMediaFiles:files.size,bytes:[...files.values()].reduce((a,b)=>a+b,0),logo,unmigrated:missing.map(x=>({section:x.section,locale:x.locale,slug:x.slug,name:x.name}))};
console.log('MEDIA_AUDIT '+JSON.stringify(summary));
// New reports may legitimately introduce additional figures before import. Preserve existing coverage.
const baseline=Number(process.env.MIN_PRESERVED_MEDIA||108);
const preserved=entries.length-missing.length;
if(preserved<baseline)throw Error('Previously archived media references regressed ('+preserved+' < '+baseline+')');
if(process.env.REQUIRE_ALL_MEDIA==='1' && missing.length)throw Error('Strict media audit failed: '+missing.length+' unarchived references');
