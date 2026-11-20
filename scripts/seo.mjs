import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const site=JSON.parse(readFileSync('content/site.json','utf8'));
const records={};
for(const lang of ['zh','en']){
 records[lang]={
  pages:JSON.parse(readFileSync('content/pages-'+lang+'.json','utf8')).pages,
  security:JSON.parse(readFileSync('content/security-'+lang+'.json','utf8')).events,
  research:JSON.parse(readFileSync('content/research-'+lang+'.json','utf8')).articles,
  capabilities:JSON.parse(readFileSync('content/capabilities-'+lang+'.json','utf8')).items,
  training:JSON.parse(readFileSync('content/training-'+lang+'.json','utf8')).modules
 };
}
const origin='https://www.ravenlong.com';
const xml=v=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const attr=v=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
const plain=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[*#_]/g,' ').replace(/\s+/g,' ').trim();
const short=(v,n=170)=>Array.from(plain(v)).slice(0,n).join('');
const routeUrl=r=>origin+'/'+r+'/';
const alt=(r,l)=>r.replace(/\/(zh|en)(?=\/|$)/,'/'+l);
function metadata(route){
 const parts=route.split('/');
 const lang=parts.includes('en')?'en':'zh';
 const data=records[lang];
 let title=lang==='zh'?site.sections.zh.headline:site.sections.en.headline;
 let desc=site.sections[lang].lead;
 let article=false;
 let date='';
 const cat=parts[0];
 if(['about','experience','contact','training'].includes(cat)){
  const page=data.pages.find(x=>x.slug===cat);
  if(page){title=page.title;desc=page.presentation?.lead||short(page.body,175);}
  if(cat==='training'&&parts[2]){
   const lesson=data.training.find(x=>x.slug===parts[2]);
   if(lesson){title=lesson.title||title;desc=lesson.summary||short(lesson.body,175);}
  }
 }else if(cat==='journal'){
  title=lang==='zh'?'研究与观点':'Research & Perspectives';
  desc=site.sections[lang].researchLead;
  if(parts[2]){
   const item=data.research.find(x=>x.slug===parts[2]);
   if(item){title=item.title;desc=item.excerpt||item.summary||short(item.body,175);date=item.date||'';article=true;}
  }
 }else if(cat==='security'){
  title=lang==='zh'?'全球安全与运营动态':'Global Security & Operational Intelligence';
  desc=site.sections[lang].monitoringLead;
  if(parts[2]){
   const item=data.security.find(x=>x.slug===parts[2]);
   if(item){title=item.title;desc=item.summary||short(item.body,175);date=item.date||'';article=true;}
  }
 }else if(cat==='capabilities'){
  title=lang==='zh'?'专业领域':'Security Capabilities';
  desc=site.sections[lang].capabilitiesLead;
  if(parts[2]){
   const item=data.capabilities.find(x=>x.slug===parts[2]);
   if(item){title=item.title;desc=item.summary||desc;}
  }
 }
 return {lang,title:short(title,120)+' | RAVEN',desc:short(desc,175),date,article};
}
const routes=['zh','en','journal/zh','journal/en','security/zh','security/en'];
for(const lang of ['zh','en']){
 const d=records[lang];
 for(const x of d.security)routes.push('security/'+lang+'/'+x.slug);
 for(const x of d.research)routes.push('journal/'+lang+'/'+x.slug);
 for(const x of d.pages)routes.push(x.slug+'/'+lang);
 for(const x of d.training)routes.push('training/'+lang+'/'+x.slug);
 routes.push('capabilities/'+lang);
 for(const x of d.capabilities)routes.push('capabilities/'+lang+'/'+x.slug);
}
const sourceHtml=readFileSync('dist/index.html','utf8');
function asHtml(route){
 const m=metadata(route);
 const target=routeUrl(route);
 const zh=routeUrl(alt(route,'zh'));
 const en=routeUrl(alt(route,'en'));
 const heroImage=origin+'/assets/media/brand/raven-original-4x-3240.webp';
 const ld={'@context':'https://schema.org','@type':m.article?'Article':'WebPage',headline:m.title,description:m.desc,url:target,inLanguage:m.lang==='zh'?'zh-CN':'en',publisher:{'@type':'Organization',name:'RAVEN',url:origin+'/'}};
 if(m.article){ld.author={'@type':'Person',name:'Raven Long'};if(/^\d{4}-\d{2}-\d{2}$/.test(m.date))ld.datePublished=m.date;}
 const extra='<link rel="canonical" href="'+attr(target)+'">'+
 '<link rel="alternate" hreflang="zh-CN" href="'+attr(zh)+'">'+
 '<link rel="alternate" hreflang="en" href="'+attr(en)+'">'+
 '<link rel="alternate" hreflang="x-default" href="'+attr(zh)+'">'+
 '<meta property="og:type" content="'+(m.article?'article':'website')+'">'+
 '<meta property="og:site_name" content="RAVEN">'+
 '<meta property="og:title" content="'+attr(m.title)+'">'+
 '<meta property="og:description" content="'+attr(m.desc)+'">'+
 '<meta property="og:url" content="'+attr(target)+'">'+
 '<meta property="og:image" content="'+attr(heroImage)+'">'+
 '<meta name="twitter:card" content="summary_large_image">'+
 '<script type="application/ld+json">'+JSON.stringify(ld).replace(/</g,'\\u003c')+'</script>';
 const nav='<nav aria-label="RAVEN"><a href="/'+m.lang+'/">'+(m.lang==='zh'?'首页':'Home')+'</a> · '+
 '<a href="/about/'+m.lang+'/">'+(m.lang==='zh'?'关于我':'About')+'</a> · '+
 '<a href="/experience/'+m.lang+'/">'+(m.lang==='zh'?'经历':'Experience')+'</a> · '+
 '<a href="/journal/'+m.lang+'/">'+(m.lang==='zh'?'研究与观点':'Journal')+'</a> · '+
 '<a href="/security/'+m.lang+'/">'+(m.lang==='zh'?'安全动态':'Security Intelligence')+'</a></nav>';
 const initial='<main class="seo-first-paint" style="padding:9vh 7vw;max-width:1150px"><h1 style="font-size:clamp(28px,4vw,52px);line-height:1.3;font-weight:600">'+attr(m.title)+'</h1><p style="font-size:16px;line-height:1.8;color:#bbb">'+attr(m.desc)+'</p>'+nav+'</main>';
 return sourceHtml.replace('<html lang="zh">','<html lang="'+m.lang+'">')
  .replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+attr(m.desc)+'">')
  .replace(/<title>[^<]*<\/title>/,'<title>'+attr(m.title)+'</title>')
  .replace('</head>',extra+'</head>')
  .replace('<div id="app"></div>','<div id="app">'+initial+'</div>');
}
for(const route of routes)writeFileSync(join('dist',route,'index.html'),asHtml(route));
writeFileSync('dist/index.html',asHtml('zh'));
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n'+
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+
 routes.map(r=>'<url><loc>'+xml(routeUrl(r))+'</loc><xhtml:link rel="alternate" hreflang="zh-CN" href="'+xml(routeUrl(alt(r,'zh')))+'"/><xhtml:link rel="alternate" hreflang="en" href="'+xml(routeUrl(alt(r,'en')))+'"/></url>').join('\n')+'\n</urlset>\n';
writeFileSync('dist/sitemap.xml',sitemap);
writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
console.log('SEO_READY',{routes:routes.length,sitemap:origin+'/sitemap.xml',canonicalHost:origin});
