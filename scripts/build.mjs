import { cpSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const site=JSON.parse(readFileSync('content/site.json','utf8'));
const security={zh:JSON.parse(readFileSync('content/security-zh.json','utf8')),en:JSON.parse(readFileSync('content/security-en.json','utf8'))};
const research={zh:JSON.parse(readFileSync('content/research-zh.json','utf8')),en:JSON.parse(readFileSync('content/research-en.json','utf8'))};
const pages={zh:JSON.parse(readFileSync('content/pages-zh.json','utf8')),en:JSON.parse(readFileSync('content/pages-en.json','utf8'))};
const training={zh:JSON.parse(readFileSync('content/training-zh.json','utf8')),en:JSON.parse(readFileSync('content/training-en.json','utf8'))};
const capabilities={zh:JSON.parse(readFileSync('content/capabilities-zh.json','utf8')),en:JSON.parse(readFileSync('content/capabilities-en.json','utf8'))};

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
 if(capabilities[lang].items.length!==5||capabilities[lang].items.some(m=>!m.title||!m.summary||m.approach.length<3))throw Error('Incomplete capability profiles '+lang);
}

mkdirSync('dist',{recursive:true});
cpSync('assets','dist/assets',{recursive:true});
cpSync('content','dist/content',{recursive:true});
// IndexNow requires a public verification key at the domain root.
copyFileSync('856c1a00e9bf46aaa0049b19d18aac90.txt','dist/856c1a00e9bf46aaa0049b19d18aac90.txt');

// Content-addressed JSON and app script keep every bilingual release coherent,
// even when a visitor's browser or Cloudflare has an earlier pages-zh/en.json cached.
const revisions={};
for(const lang of ['zh','en']){
 const bytes=readFileSync('content/pages-'+lang+'.json');
 const revision=createHash('sha256').update(bytes).digest('hex').slice(0,12);
 revisions[lang]=revision;
 writeFileSync(join('dist','content','pages-'+lang+'.'+revision+'.json'),bytes);
}
const appSource=readFileSync('assets/app.js','utf8');
const marker="const CONTENT_DATA_REVISIONS={zh:'',en:''};";
if(!appSource.includes(marker))throw Error('Missing versioned page data marker');
const labSource=readFileSync('assets/security-lab.js');
const labRevision=createHash('sha256').update(labSource).digest('hex').slice(0,12);
const labFile='security-lab.'+labRevision+'.js';
writeFileSync(join('dist','assets',labFile),labSource);
const appContent=appSource.replace(marker,'const CONTENT_DATA_REVISIONS='+JSON.stringify(revisions)+';').replace('./security-lab.js','./'+labFile);
const appRevision=createHash('sha256').update(appContent)
 .update(readFileSync('content/site.json'))
 .update(readFileSync('content/research-zh.json'))
 .update(readFileSync('content/research-en.json'))
 .update(readFileSync('content/security-zh.json'))
 .update(readFileSync('content/security-en.json'))
 .digest('hex').slice(0,12);
const versionedApp='app.'+appRevision+'.js';
writeFileSync(join('dist','assets',versionedApp),appContent);
writeFileSync(join('dist','assets','app.js'),appContent);

// Content-addressed stylesheet URLs keep CDN and browser caches from serving an old hero.
const cssContent=readFileSync('assets/editorial.css');
const cssHash=createHash('sha256').update(cssContent).digest('hex').slice(0,12);
const versionedCss='editorial.'+cssHash+'.css';
writeFileSync(join('dist','assets',versionedCss),cssContent);
// Loading identity uses content-addressed CSS to avoid stale transition artwork.
const transitionCss=readFileSync('assets/transition.css');
const transitionHash=createHash('sha256').update(transitionCss).digest('hex').slice(0,12);
const transitionFile='transition.'+transitionHash+'.css';
writeFileSync(join('dist','assets',transitionFile),transitionCss);
const html=readFileSync('index.html','utf8')
 .replace('/assets/editorial.css','/assets/'+versionedCss)
 .replace('/assets/transition.css','/assets/'+transitionFile)
 .replace('/assets/app.js','/assets/'+versionedApp);
writeFileSync('dist/index.html',html);

// Content always changes together with the displayed bilingual HTML.
writeFileSync('dist/_headers',[
  '# RAVEN editorial content should never remain stale after a release.',
  '/',
  '  Cache-Control: no-cache, must-revalidate',
  '/security/*',
  '  Cache-Control: no-cache, must-revalidate',
  '/content/*',
  '  Cache-Control: no-store, max-age=0',
  '/assets/app.js',
  '  Cache-Control: no-cache, must-revalidate',
  '/lab/*',
  '  Cache-Control: no-cache, must-revalidate',
  '/about/*',
  '  Cache-Control: no-cache, must-revalidate',
  '/experience/*',
  '  Cache-Control: no-cache, must-revalidate',
  '/zh/',
  '  Cache-Control: no-cache, must-revalidate',
  '/en/',
  '  Cache-Control: no-cache, must-revalidate'
].join('\n')+'\n');


const routes=['zh','en','journal/zh','journal/en','security/zh','security/en'];
for(const lang of ['zh','en']){
 for(const event of security[lang].events) routes.push('security/'+lang+'/'+event.slug);
 for(const article of research[lang].articles) routes.push('journal/'+lang+'/'+article.slug);
 for(const page of pages[lang].pages)routes.push(page.slug+'/'+lang);
 for(const module of training[lang].modules)routes.push('training/'+lang+'/'+module.slug);
 routes.push('capabilities/'+lang,'lab/'+lang);
 for(const item of capabilities[lang].items)routes.push('capabilities/'+lang+'/'+item.slug);
}
for (const route of routes){
 const dest=join('dist',route);
 mkdirSync(dest,{recursive:true});
 writeFileSync(join(dest,'index.html'),html);
}
const id = value => String(value||'').replace(/-/g,'');
const redirects=[
 '/lab /lab/zh/ 302',
 '/security /security/zh/ 302',
 '/security/ /security/zh/ 302',
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
// Produce crawlable per-route HTML, canonical URLs, structured data and sitemap.
execFileSync(process.execPath,['scripts/seo.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/media-audit.mjs'],{stdio:'inherit'});
console.log(JSON.stringify({status:'preview-built',routes:routes.length,securityRecords:security.zh.events.length,localizedResearchPages:research.zh.articles.length+research.en.articles.length,trainingModules:training.zh.modules.length+training.en.modules.length,legacyRedirects:redirects.length,styleRevision:cssHash}));
