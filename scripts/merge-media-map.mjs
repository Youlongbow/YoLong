import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const path='content/media-map.json';
const incoming=JSON.parse(readFileSync(path,'utf8'));
let remote={images:{},branding:{}};
try{
 const source=execFileSync('git',['show','origin/main:'+path],{encoding:'utf8'});
 remote=JSON.parse(source);
}catch(error){console.log('Original media map not yet present on origin/main')}
const merged={
 schema:1,
 branding:{...(remote.branding||{}),...(incoming.branding||{})},
 images:{...(remote.images||{}),...(incoming.images||{})}
};
writeFileSync(path,JSON.stringify(merged,null,2)+'\n');
console.log(JSON.stringify({action:'merge-media-map',existingRefs:Object.keys(remote.images||{}).length,incomingRefs:Object.keys(incoming.images||{}).length,totalRefs:Object.keys(merged.images).length}));
