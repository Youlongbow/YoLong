import { cpSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const site=JSON.parse(readFileSync('content/site.json','utf8'));
const security={zh:JSON.parse(readFileSync('content/security-zh.json','utf8')),en:JSON.parse(readFileSync('content/security-en.json','utf8'))};
const research={zh:JSON.parse(readFileSync('content/research-zh.json','utf8')),en:JSON.parse(readFileSync('content/research-en.json','utf8'))};
const pages={zh:JSON.parse(readFileSync('content/pages-zh.json','utf8')),en:JSON.parse(readFileSync('content/pages-en.json','utf8'))};
const training={zh:JSON.parse(readFileSync('content/training-zh.json','utf8')),en:JSON.parse(readFileSync('content/training-en.json','utf8'))};

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
 if(pages[lang].pages.length !== 4 || training[lang].modules.length !== 11)throw Error('Missing site pages or training modules '+lang);
 if(training[lang].modules.some(m=>m.body.length<1000))throw Error('Incomplete HEAT text '+lang);
}

mkdirSync('dist',{recursive:true});
copyFileSync('index.html','dist/index.html');
cpSync('assets','dist/assets',{recursive:true});
cpSync('content','dist/content',{recursive:true});

const routes=['zh','en','journal/zh','journal/en','security/zh','security/en'];
for(const lang of ['zh','en']){
 for(const event of security[lang].events) routes.push('security/'+lang+'/'+event.slug);
 for(const article of research[lang].articles) routes.push('journal/'+lang+'/'+article.slug);
 for(const page of pages[lang].pages)routes.push(page.slug+'/'+lang);
 for(const module of training[lang].modules)routes.push('training/'+lang+'/'+module.slug);
}
for (const route of routes){
 const dest=join('dist',route);
 mkdirSync(dest,{recursive:true});
 copyFileSync('index.html',join(dest,'index.html'));
}
const id = value => String(value||'').replace(/-/g,'');
const redirects=[
 '/p/2f83102210ef8055896fcecd3254a5a6 /zh/ 301',
 '/p/2f53102210ef8047931acda0fd9bf6dd /en/ 301',
 '/p/2f83102210ef81ba8732eba57dd2aee8 /journal/zh/ 301',
 '/p/2f63102210ef800e9932dcdc7e003942 /journal/en/ 301'
];
for(const lang of ['zh','en']){
 redirects.push('/p/'+id(security[lang].sourcePageId)+' /security/'+lang+'/ 301');
 for(const record of pages[lang].pages){
  redirects.push('/p/'+id(record.sourceId)+' /'+record.slug+'/'+lang+'/ 301');
 }
 for(const article of research[lang].articles){
  redirects.push('/p/'+id(article.originalNotionId)+' /journal/'+lang+'/'+article.slug+'/ 301');
 }
 for(const module of training[lang].modules){
  redirects.push('/p/'+id(module.sourceId)+' /training/'+lang+'/'+module.slug+'/ 301');
 }
}
writeFileSync('dist/_redirects',redirects.join('\n')+'\n');

writeFileSync('dist/robots.txt','User-agent: *\nDisallow: /\n');
console.log(JSON.stringify({status:'preview-built',routes:routes.length,securityRecords:security.zh.events.length,localizedResearchPages:research.zh.articles.length+research.en.articles.length,trainingModules:training.zh.modules.length+training.en.modules.length,legacyRedirects:redirects.length}));
