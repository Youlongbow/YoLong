import { cpSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const site=JSON.parse(readFileSync('content/site.json','utf8'));
const security={zh:JSON.parse(readFileSync('content/security-zh.json','utf8')),en:JSON.parse(readFileSync('content/security-en.json','utf8'))};
const research={zh:JSON.parse(readFileSync('content/research-zh.json','utf8')),en:JSON.parse(readFileSync('content/research-en.json','utf8'))};

if (!site.sections?.zh || !site.sections?.en) throw Error('Missing localized site copy');
if (security.zh.events.length !== security.en.events.length || security.zh.events.length < 125) throw Error('Security archive count differs by language');
for(let i=0;i<security.zh.events.length;i++){
  const zh=security.zh.events[i],en=security.en.events[i];
  if(zh.slug!==en.slug || zh.date!==en.date || !zh.body || !en.body)throw Error('Incomplete bilingual security record '+i);
}
for(const lang of ['zh','en']){
 const ids=research[lang].articles.map(a=>a.slug);
 if(new Set(ids).size!==ids.length)throw Error('Duplicate research slug '+lang);
 if(research[lang].articles.some(a=>!a.body || !a.title))throw Error('Incomplete research article '+lang);
}

mkdirSync('dist',{recursive:true});
copyFileSync('index.html','dist/index.html');
cpSync('assets','dist/assets',{recursive:true});
cpSync('content','dist/content',{recursive:true});

const routes=['zh','en','journal/zh','journal/en','security/zh','security/en'];
for(const lang of ['zh','en']){
 for(const event of security[lang].events) routes.push('security/'+lang+'/'+event.slug);
 for(const article of research[lang].articles) routes.push('journal/'+lang+'/'+article.slug);
}
for (const route of routes){
 const dest=join('dist',route);
 mkdirSync(dest,{recursive:true});
 copyFileSync('index.html',join(dest,'index.html'));
}
writeFileSync('dist/robots.txt','User-agent: *\nDisallow: /\n');
console.log(JSON.stringify({status:'preview-built',routes:routes.length,securityRecords:security.zh.events.length,localizedResearchPages:research.zh.articles.length+research.en.articles.length}));
