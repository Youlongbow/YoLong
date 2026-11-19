#!/usr/bin/env node
// RAVEN bilingual security event ingest. Intended to run in GitHub Actions.
import { existsSync, readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const inbox='content/inbox';
const paths={zh:'content/security-zh.json',en:'content/security-en.json'};
const archives=Object.fromEntries(Object.entries(paths).map(([lang,path])=>[lang,JSON.parse(readFileSync(path,'utf8'))]));
const oldCounts=Object.fromEntries(Object.entries(archives).map(([lang,archive])=>[lang,archive.events.length]));
const filenames=existsSync(inbox)?readdirSync(inbox).filter(x=>/\.json$/i.test(x)).sort():[];
const seen=new Set();
let changed=0;
const bad=(message)=>{throw new Error(message)};
const allowedCategories=new Set(['personnel','energy','maritime','transport','regulatory','security']);
const dateOK=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'));
const clean=v=>String(v??'').trim();
const sourcePattern=/https?:\/\/[^\s\])>]+/g;

for(const filename of filenames){
 const event=JSON.parse(readFileSync(join(inbox,filename),'utf8'));
 const id=clean(event.slug);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))bad(filename+': slug must be lowercase URL-safe');
 if(seen.has(id))bad('Duplicate incoming slug: '+id);
 seen.add(id);
 if(!dateOK(event.date))bad(id+': publication date must be YYYY-MM-DD');
 if(!allowedCategories.has(event.category))bad(id+': category invalid');
 if(!event.zh||!event.en)bad(id+': bilingual content required');
 for(const lang of ['zh','en']){
  const payload=event[lang];
  for(const key of ['title','summary','body','region']){
   if(!clean(payload[key]))bad(id+': '+lang+'.'+key+' required');
  }
  if(clean(payload.title).length<12||clean(payload.body).length<90)bad(id+': '+lang+' content too short');
  const urls=[...(clean(payload.body).match(sourcePattern)||[]),...(payload.sourceUrls||[])];
  if(!urls.some(u=>/^https:\/\/[^/]+\./.test(u)))bad(id+': '+lang+' at least one HTTPS source required');
  if(payload.eventDate && !dateOK(payload.eventDate))bad(id+': '+lang+' invalid eventDate');
  const body={slug:id,date:event.date,region:clean(payload.region),category:event.category,title:clean(payload.title),summary:clean(payload.summary),body:clean(payload.body)};
  if(payload.eventDate)body.eventDate=payload.eventDate;
  if(payload.sourceUrls)body.sourceUrls=payload.sourceUrls.filter(x=>/^https:\/\//.test(x));
  const list=archives[lang].events;
  const index=list.findIndex(e=>e.slug===id);
  if(index>=0)list[index]={...list[index],...body};
  else list.push(body);
 }
 changed++;
}
if(!filenames.length){console.log('No incoming event files. No archive changes.');process.exit(0)}
for(const lang of ['zh','en']){
 const a=archives[lang];
 a.events.sort((x,y)=>y.date.localeCompare(x.date)||x.slug.localeCompare(y.slug));
 a.total=a.events.length;
 a.snapshotDate=new Date().toISOString().slice(0,10);
 const bySlug=new Map();
 for(const record of a.events){
  if(bySlug.has(record.slug))bad('Duplicate '+lang+' archive slug '+record.slug);
  bySlug.set(record.slug,record);
 }
}
const zh=archives.zh.events,en=archives.en.events;
if(zh.length!==en.length)bad('Bilingual archive size mismatch');
for(let i=0;i<zh.length;i++)if(zh[i].slug!==en[i].slug||zh[i].date!==en[i].date)bad('Bilingual order/date mismatch '+i);
if(zh.length<oldCounts.zh||en.length<oldCounts.en)bad('Archive would lose records');
for(const [lang,path] of Object.entries(paths))writeFileSync(path,JSON.stringify(archives[lang],null,2)+'\n');
for(const filename of filenames)unlinkSync(join(inbox,filename));
console.log(JSON.stringify({processedFiles:filenames.length,bilingualEventRecords:zh.length,originalCount:oldCounts.zh,updated:changed}));
