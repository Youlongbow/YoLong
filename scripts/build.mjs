import { cpSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const content=JSON.parse(readFileSync('content/site.json','utf8'));
if (!content.sections?.zh || !content.sections?.en || !Array.isArray(content.events)) throw new Error('Invalid site content');
mkdirSync('dist',{recursive:true});
copyFileSync('index.html','dist/index.html');
cpSync('assets','dist/assets',{recursive:true});
cpSync('content','dist/content',{recursive:true});
for (const route of ['zh','en','journal/zh','journal/en','security/zh','security/en']) {
  const destination=join('dist',route);
  mkdirSync(destination,{recursive:true});
  copyFileSync('index.html',join(destination,'index.html'));
}
console.log('RAVEN preview built: '+content.events.length+' event records; '+content.articles.length+' research references; 6 physical localized routes');
