const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const pathParts = location.pathname.split('/').filter(Boolean);
const section = ['security','journal','about','experience','contact','training'].includes(pathParts[0]) ? pathParts[0] : 'home';
const lang = section==='home' ? (pathParts[0]==='en'?'en':'zh') : (pathParts[1]==='en'?'en':'zh');
const slug = section==='home' ? '' : (pathParts[2] || '');
const oldHome = {zh:'https://www.ravenlong.com/p/2f83102210ef8055896fcecd3254a5a6',en:'https://www.ravenlong.com/p/2f53102210ef8047931acda0fd9bf6dd'};
const oldPages = {
 zh:{contact:'https://www.ravenlong.com/p/2f83102210ef816c9f52f315d2e6689c',training:'https://www.ravenlong.com/p/3f93102210ef81b89c88d5eb2b9a3314'},
 en:{contact:'https://www.ravenlong.com/p/2f63102210ef8018b01dc5d4d3db0949',training:'https://www.ravenlong.com/p/3f93102210ef8121acc7c75b5fb3b912'}
};
const apps={careers:'https://careers.ravenlong.com/',ops:'https://ops.ravenlong.com/'};
const phrases={
 zh:{
  journal:'研究与观点',security:'安全动态',capabilities:'专业领域',platform:'业务平台',contact:'联系',
  category:{personnel:'人员安全',energy:'能源与油气',maritime:'航运与港口',transport:'交通与物流',regulatory:'监管与社区',security:'地区安全'},
  all:'全部类别',search:'搜索事件、国家、地区、来源或关键词',detail:'阅读完整分析',source:'原始来源',
  noResults:'没有找到符合条件的事件',archive:'已迁移 125 条中英文历史事件，内容来自原 RAVEN 安全动态栏目。最新入库事件日期为 2026 年 11 月 17 日。监测任务尚在向旧站发布，迁移期间请以原站为准。',
  snapshot:'历史档案 / 截至 2026-11-17', count:'事件总数',more:'加载更多',back:'返回事件档案',read:'阅读报告',
  original:'原始 Notion 页面',researchNote:'下列研究报告正文已迁移至新网站。历史 PDF、图表及其他文章仍在核对与迁移。',
  researchOld:'其他研究与文献', researchLang:'中文原文', full:'全文',update:'已迁移档案',
  fullText:'原文与独立分析',missingMedia:'原文中的图片或附件正在迁移，请在原始页面查看。',
  featured:'核心业务',legacy:'原站',download:'原始链接',area:'专业领域',platforms:'资源与工具'
 },
 en:{
  journal:'Journal',security:'Security updates',capabilities:'Expertise',platform:'Platforms',contact:'Contact',
  category:{personnel:'Personnel safety',energy:'Energy & oil and gas',maritime:'Maritime & ports',transport:'Transport & logistics',regulatory:'Regulatory & community',security:'Regional security'},
  all:'All categories',search:'Search incidents, countries, regions and sources',detail:'Read full assessment',source:'Original sources',
  noResults:'No matching events',archive:'125 historical incidents have been migrated in Chinese and English from the original RAVEN monitor. The latest event in this archive is dated 17 November 2026. Monitoring continues on the original site during migration.',
  snapshot:'Historical archive / through 17 Nov 2026',count:'Total events',more:'Load more',back:'Back to event archive',read:'Read research',
  original:'Original Notion page',researchNote:'Full texts of available research pages have been migrated. Historical PDFs, illustrations and additional articles are still being checked and transferred.',
  researchOld:'Other research and publications',researchLang:'Original Chinese edition',full:'Full text',update:'Migrated archive',
  fullText:'Original assessment',missingMedia:'Figures and attachments from the original article are being migrated. See the source page.',
  featured:'Core capabilities',legacy:'Legacy site',download:'Original link',area:'Expertise',platforms:'Resources & tools'
 }
};
let site, securityData, researchData, pagesData, trainingData, mediaMap={branding:{},images:{}};
let currentMatches=[], visible=18;
const txt=phrases[lang];

function activeUrl(target){
 if(section==='home') return '/'+target+'/';
 if(!slug) return '/'+section+'/'+target+'/';
 if(section==='security') return '/security/'+target+'/'+slug+'/';
 if(section==='training') return '/training/'+target+'/'+slug+'/';
 const translations=researchData?.articles || [];
 if(section==='journal' && target===lang) return '/journal/'+target+'/'+slug+'/';
 if(section==='journal' && target!==lang && slug==='pakistan-drc-mining-comparison') return '/journal/'+target+'/'+slug+'/';
 return '/journal/'+target+'/';
}
function link(label,href,active=false){
 return '<a class="'+(active?'active':'')+'" href="'+esc(href)+'">'+esc(label)+'</a>';
}
function header(){
 return '<div class="grain"></div><header class="top shell">'+
  '<a class="logo" href="/'+lang+'/"><span class="logomark'+(mediaMap.branding?.mark?' logo-loaded':'')+'">'+(mediaMap.branding?.mark?'<img src="'+esc(mediaMap.branding.mark)+'" alt="RAVEN" width="40" height="40">':'R')+'</span><span class="logotxt">RAVEN<small>SECURITY ARCHITECTURE</small></span></a>'+
  '<button id="menu" class="mobile" aria-expanded="false" aria-controls="nav">MENU +</button>'+
  '<nav id="nav" class="nav">'+link('RAVEN','/'+lang+'/',section==='home')+
  link(txt.journal,'/journal/'+lang+'/',section==='journal')+link(txt.security,'/security/'+lang+'/',section==='security')+
  link(lang==='zh'?'经历':'Experience','/experience/'+lang+'/',section==='experience')+
  link(lang==='zh'?'关于':'About','/about/'+lang+'/',section==='about')+
  link('HEAT','/training/'+lang+'/',section==='training')+
  link(txt.contact,'/contact/'+lang+'/',section==='contact')+
  '<div class="switch"><a class="'+(lang==='zh'?'on':'')+'" href="'+activeUrl('zh')+'">中文</a><a class="'+(lang==='en'?'on':'')+'" href="'+activeUrl('en')+'">EN</a></div>'+
  '</nav></header>'+
  '<div class="ticker shell"><span><i class="live-dot"></i> RAVEN / INDEPENDENT SECURITY RESEARCH</span><div class="right-meta"><span>GLOBAL OPERATIONS</span><span>FIELD PRACTICE</span><span class="preview-tag">MIGRATION PREVIEW</span></div></div>';
}
function blockTitle(sectionCopy,title){
 return '<div class="sec-head"><div><div class="over">'+esc(sectionCopy.eyebrow)+'</div><h2 class="'+(lang==='zh'?'zh-h':'')+'">'+esc(title)+'</h2></div></div>';
}
function homeHero(s){
 return '<section class="hero shell '+(lang==='zh'?'hero-zh':'')+'"><div class="hero-copy"><div class="over">'+esc(s.eyebrow)+'</div><h1>'+esc(s.headline)+'</h1><div class="lead">'+esc(s.lead)+'</div><p class="support">'+esc(s.supporting)+'</p><div class="btns"><a class="btn red" href="/contact/'+lang+'/">'+esc(s.contact)+' ↗</a><a class="btn" href="/journal/'+lang+'/">'+esc(s.explore)+' ↗</a></div></div><div class="hero-art"><div class="giant-r">R</div><div class="target"></div><div class="serial">RAVEN / FIELD-TESTED SECURITY<br>STRATEGY — SYSTEMS — EXECUTION</div></div></section>'+
 '<div class="metrics shell"><div class="metric"><strong>15+</strong><span>YEARS / FIELD EXPERIENCE</span></div><div class="metric"><strong>GLOBAL</strong><span>SECURITY & OPERATIONS</span></div><div class="metric"><strong>HEAT</strong><span>TRAINING & PREPAREDNESS</span></div><div class="metric"><strong>'+(securityData?.events?.length||0)+'</strong><span>HISTORICAL SECURITY RECORDS</span></div></div>';
}
function expertise(s){
 const list=site.profile[lang==='zh'?'expertiseZh':'expertiseEn'];
 return '<section class="sec shell" id="expertise">'+blockTitle(s,s.capabilitiesTitle)+'<p class="sec-intro">'+esc(s.capabilitiesLead)+'</p><div class="cards3">'+[0,1,2].map(i=>'<article class="feature"><span class="num">0'+(i+1)+' / '+txt.featured+'</span><h3>'+esc(list[i])+'</h3><span class="arrow">↗</span></article>').join('')+'</div></section>';
}
function platforms(s){
 const services=[['01',s.training,s.trainingLead,'/training/'+lang+'/'],['02',s.career,s.careerLead,apps.careers],['03',s.ops,s.opsLead,apps.ops]];
 return '<section class="sec shell" id="platforms">'+blockTitle(s,txt.platforms)+'<div class="cards3">'+services.map(x=>'<a class="feature" href="'+esc(x[3])+'" target="_blank" rel="noopener"><span class="num">'+x[0]+' / RAVEN</span><h3>'+esc(x[1])+'</h3><p>'+esc(x[2])+'</p><span class="arrow">↗</span></a>').join('')+'</div></section>';
}
function richInline(input){
 let s=esc(input);
 s=s.replace(/&lt;(\/?)b&gt;/gi,(_,end)=>end?'</strong>':'<strong>');
 s=s.replace(/&lt;(\/?)strong&gt;/gi,(_,end)=>end?'</strong>':'<strong>');
 s=s.replace(/&lt;(\/?)i&gt;/gi,(_,end)=>end?'</em>':'<em>');
 s=s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
 s=s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>');
 s=s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,(_,label,url)=>'<a href="'+url.replace(/&amp;/g,'&amp;')+'" target="_blank" rel="noopener noreferrer">'+label+'</a>');
 s=s.replace(/&lt;br\s*\/?&gt;/gi,'<br>');
 return s.replace(/\\\|/g,'|');
}
function richBody(markdown,sourceLink){
 const savedTables=[];
 let cleaned=String(markdown??'')
  .replace(/<\/?(?:columns|column|toggle|synced-block-reference)(?:\s+[^>]*)?>/gi,'')
  .replace(/<p(?:\s+[^>]*)?>/gi,'').replace(/<\/p>/gi,'');
 cleaned=cleaned.replace(/<table\b[\s\S]*?<\/table>/gi,table=>{
  const index=savedTables.push(table)-1;
  return '\n\n%%RAVEN_TABLE_'+index+'%%\n\n';
 });
 const blocks=cleaned.trim().split(/\n\s*\n/).filter(Boolean);
 return blocks.map(chunk=>{
  const first=chunk.split('\n')[0].trim();
  const marker=first.match(/^%%RAVEN_TABLE_(\d+)%%$/);
  if(marker){
   let html=richInline(savedTables[Number(marker[1])]||'');
   html=html.replace(/&lt;(\/?)(table|thead|tbody|tr|td|th|caption)(?:\s+[^&]*?)?&gt;/gi,(_,end,tag)=>'<'+end+tag.toLowerCase()+'>');
   return '<div class="article-table">'+html+'</div>';
  }
  if(/^<callout\b/i.test(first)){
   const inner=chunk.replace(/^<callout[^>]*>\n?/i,'').replace(/\n?<\/callout>\s*$/i,'');
   return '<aside class="course-callout">'+richInline(inner).replace(/\n/g,'<br>')+'</aside>';
  }
  if(/^<image\b|^<file\b|^<video\b|^<audio\b/.test(first)){
    const match=chunk.match(/^<(image|file|video|audio)\b[^>]*source="([^"]+)"[^>]*\/?>/i);
    const fileUrl=match?.[2]||'';
    const preserved=mediaMap.images?.[fileUrl];
    const caption=match?chunk.slice(match[0].length).replace(/<\/(?:image|file|video|audio)>/gi,'').trim():'';
    if(match?.[1]==='image' && preserved){
      const name=decodeURIComponent((fileUrl.match(/[?&]name=([^&]+)/)||[])[1]||'RAVEN image');
      return '<figure class="article-figure"><img src="'+esc(preserved)+'" alt="'+esc(name)+'" loading="lazy" decoding="async">'+(caption?'<figcaption>'+richInline(caption).replace(/\n/g,'<br>')+'</figcaption>':'')+'</figure>';
    }
    return '<aside class="media-placeholder">'+esc(txt.missingMedia)+' <a href="'+esc(sourceLink||oldHome[lang])+'" target="_blank" rel="noopener">'+txt.original+' ↗</a></aside>';
  }
  if(/^<table\b/i.test(first)){
    let h=esc(chunk);
    h=h.replace(/&lt;(\/?)(table|tr|td|th)(?:\s[^&]*?)?&gt;/gi,(_,end,tag)=>'<'+end+tag.toLowerCase()+'>');
    return '<div class="article-table">'+h+'</div>';
  }
  if(/^#{1,4}\s+/.test(first)){
    const n=Math.min(4,first.match(/^#+/)[0].length+1);
    const heading=first.replace(/^#{1,4}\s+/,'');
    const rest=chunk.split('\n').slice(1).join('\n').trim();
    return '<h'+n+'>'+richInline(heading)+'</h'+n+'>'+(rest?'<p>'+richInline(rest).replace(/\n/g,'<br>')+'</p>':'');
  }
  const lines=chunk.split('\n').map(x=>x.trim());
  if(lines.length && lines.every(x=>/^[-*]\s/.test(x)||/^\d+\.\s/.test(x))){
   return '<ul>'+lines.map(x=>'<li>'+richInline(x.replace(/^([-*]|\d+\.)\s+/,''))+'</li>').join('')+'</ul>';
  }
  if(first==='<p />' || first==='<p>')return '';
  return '<p>'+richInline(chunk).replace(/\n/g,'<br>')+'</p>';
 }).join('');
}
function researchCard(a,isLegacy){
 const title = a.title || a[lang==='zh'?'titleZh':'titleEn'];
 const summary = a[lang==='zh'?'excerptZh':'excerptEn'] || '';
 const href = isLegacy?a.url:'/journal/'+lang+'/'+a.slug+'/';
 const badge = isLegacy?'RAVEN / ARCHIVE':'RAVEN / '+txt.full;
 return '<article class="paper"><div class="meta">'+badge+(a.date?' / '+esc(a.date):'')+'</div><h3>'+esc(title)+'</h3>'+(summary?'<p>'+esc(summary)+'</p>':'')+'<a href="'+esc(href)+'"'+(isLegacy?' target="_blank" rel="noopener"':'')+'>'+txt.read+' ↗</a></article>';
}
function researchList(s,compact=false){
 const entries=researchData?.articles||[];
 const cards=entries.map(a=>researchCard(a,false));
 const legacy=(site.articles||[]).filter(a=>!entries.some(x=>x.title===a[lang==='zh'?'titleZh':'titleEn']));
 if(compact) return '<section id="journal" class="sec shell">'+blockTitle(s,s.researchTitle)+'<p class="sec-intro">'+esc(s.researchLead)+'</p><div class="paper-grid">'+(cards.length?cards.slice(0,4):legacy.slice(0,4).map(a=>researchCard(a,true))).join('')+'</div><p class="archive-extra"><a class="btn" href="/journal/'+lang+'/">'+txt.journal+' ↗</a></p></section>';
 return '<section id="journal" class="sec shell">'+blockTitle(s,s.researchTitle)+'<p class="sec-intro">'+esc(txt.researchNote)+'</p><div class="paper-grid">'+cards.join('')+'</div>'+
 (legacy.length?'<h3 class="archive-subtitle">'+txt.researchOld+'</h3><div class="paper-grid">'+legacy.map(a=>researchCard(a,true)).join('')+'</div>':'')+'</section>';
}
function eventHref(e){return '/security/'+lang+'/'+e.slug+'/'}
function eventCard(e){
 const summary=String(e.summary||'').slice(0,350);
 return '<article class="event"><div class="date">'+esc(e.date)+'<div>'+esc(e.region)+'</div></div><div><div class="meta">'+esc(txt.category[e.category]||txt.category.security)+' / RAVEN ARCHIVE</div><h3><a class="detail-link" href="'+eventHref(e)+'">'+esc(e.title)+'</a></h3><p>'+esc(summary)+'</p><a class="source detail-link" href="'+eventHref(e)+'">'+txt.detail+' ↗</a></div></article>';
}
function securityList(s,compact=false){
 const records=securityData?.events || [];
 const shown=compact?records.slice(0,4):records.slice(0,18);
 const extra=compact?'<p class="archive-extra"><a class="btn" href="/security/'+lang+'/">'+esc(s.monitorLink)+' ↗</a></p>':
 '<div class="filters"><input id="search" type="search" placeholder="'+esc(txt.search)+'" aria-label="'+esc(txt.search)+'">'+
 '<select id="type" aria-label="Event category"><option value="">'+txt.all+'</option>'+Object.entries(txt.category).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v)+'</option>').join('')+'</select></div><div class="result-total" id="match-count">'+txt.count+': '+records.length+'</div>';
 const latest=records.reduce((date,e)=>e.date>date?e.date:date,'');
 const archiveDescription=lang==='zh'
  ?'本栏目现收录 '+records.length+' 条中英文安全事件记录，最新记录日期为 '+latest+'。'+(site.preview?' 网站仍处于迁移预览阶段，日常监测发布以原网站为准。':'')
  :'This archive contains '+records.length+' security event records in both languages. Latest record date: '+latest+'.'+(site.preview?' This is a migration preview; the original site remains the monitoring publication channel.':'');
 const stamp=(lang==='zh'?'事件归档 / 最新记录 ':'EVENT ARCHIVE / LATEST RECORD ')+latest;
 return '<section class="sec shell" id="monitor">'+blockTitle(s,s.monitoringTitle)+'<p class="sec-intro">'+esc(compact?s.monitoringLead:archiveDescription)+'</p>'+
 '<div class="archive-label">'+esc(stamp)+'</div>'+extra+
 '<div class="events" id="events">'+shown.map(eventCard).join('')+'</div>'+
 (!compact&&records.length>18?'<div class="archive-extra"><button id="load-more" class="btn">'+txt.more+' ↓</button></div>':'')+
 '</section>';
}
function articleHero(label,title,backUrl,backLabel){
 return '<div class="article-hero shell"><div class="over">'+esc(label)+'</div><h1>'+esc(title)+'</h1><a class="back" href="'+esc(backUrl)+'">← '+esc(backLabel)+'</a></div>';
}
function securityDetail(){
 const record=securityData?.events.find(e=>e.slug===slug);
 if(!record)return '<section class="sec shell"><h2>404</h2><a href="/security/'+lang+'/">'+txt.back+'</a></section>';
 document.title=record.title+' · RAVEN';
 return articleHero(record.date+' / '+(txt.category[record.category]||txt.category.security),record.title,'/security/'+lang+'/',txt.back)+
 '<article class="article-layout shell"><div class="article-sidebar"><p>RAVEN / SECURITY INTELLIGENCE</p><div>'+esc(record.date)+'</div><div>'+esc(record.region)+'</div><div>'+txt.update+'</div></div>'+
 '<div class="article-content"><div class="article-intro">'+esc(txt.fullText)+'</div>'+richBody(record.body,oldHome[lang])+
 '<div class="article-end"><a href="/security/'+lang+'/">'+txt.back+' ←</a></div></div></article>';
}
function researchDetail(){
 const record=researchData?.articles.find(a=>a.slug===slug);
 if(!record)return '<section class="sec shell"><h2>404</h2><a href="/journal/'+lang+'/">'+txt.journal+'</a></section>';
 document.title=record.title+' · RAVEN';
 return articleHero('RAVEN / JOURNAL',record.title,'/journal/'+lang+'/',txt.journal)+
 '<article class="article-layout shell"><div class="article-sidebar"><p>RAVEN / INDEPENDENT RESEARCH</p><div>'+txt.full+'</div><div><a href="'+esc(record.originalUrl)+'" target="_blank" rel="noopener">'+txt.original+' ↗</a></div></div>'+
 '<div class="article-content">'+richBody(record.body,record.originalUrl)+
 '<div class="article-end"><a href="/journal/'+lang+'/">'+txt.journal+' ←</a></div></div></article>';
}

function staticContentPage(){
 const record=pagesData?.pages.find(x=>x.slug===section);
 if(!record)return '<section class="sec shell"><h2>404</h2></section>';
 document.title=record.title+' · RAVEN';
 return articleHero('RAVEN / '+section.toUpperCase(),record.title,'/'+lang+'/','RAVEN')+
 '<article class="article-layout shell"><div class="article-sidebar"><p>RAVEN / '+section.toUpperCase()+'</p><div>'+txt.full+'</div></div><div class="article-content">'+richBody(record.body,record.sourceUrl)+'</div></article>';
}
function trainingList(){
 const record=pagesData?.pages.find(x=>x.slug==='training');
 const introduction=record?.body.replace(/<page url="[^"]+"[^>]*>[\s\S]*?<\/page>/g,'')||'';
 const modules=trainingData?.modules||[];
 document.title=(lang==='zh'?'HEAT 敌对环境安全意识培训':'HEAT Hostile Environment Awareness Training')+' · RAVEN';
 return articleHero('RAVEN / HEAT',record?.title||'HEAT','/'+lang+'/','RAVEN')+
 '<section class="sec shell course-overview"><div class="course-intro">'+richBody(introduction,record?.sourceUrl)+'</div>'+
 '<div class="over">COURSE / '+modules.length+' MODULES</div>'+
 '<div class="course-grid">'+modules.map((m,i)=>'<a class="course-card" href="/training/'+lang+'/'+m.slug+'/"><span>'+m.slug+' / HEAT</span><h3>'+esc(m.title.replace(/^\d{2}\s*[|｜]\s*/,''))+'</h3><em>↗</em></a>').join('')+'</div></section>';
}
function trainingDetail(){
 const modules=trainingData?.modules||[];
 const idx=modules.findIndex(m=>m.slug===slug);
 if(idx<0)return '<section class="sec shell"><h2>404</h2><a href="/training/'+lang+'/">HEAT</a></section>';
 const m=modules[idx];
 document.title=m.title+' · RAVEN HEAT';
 const previous=idx?'/training/'+lang+'/'+modules[idx-1].slug+'/':'/training/'+lang+'/';
 const following=idx<modules.length-1?'/training/'+lang+'/'+modules[idx+1].slug+'/':'/training/'+lang+'/';
 const backLabel=lang==='zh'?'课程目录':'Course directory';
 return articleHero('HEAT / MODULE '+m.slug,m.title,'/training/'+lang+'/',backLabel)+
 '<article class="article-layout shell"><div class="article-sidebar"><p>RAVEN / HEAT</p><div>MODULE '+m.slug+' / '+String(modules.length).padStart(2,'0')+'</div><div><a href="/training/'+lang+'/">'+backLabel+' ↗</a></div></div>'+
 '<div class="article-content">'+richBody(m.body,m.sourceUrl)+
 '<nav class="course-next"><a href="'+previous+'">← '+(lang==='zh'?'上一单元':'Previous')+'</a><a href="'+following+'">'+(lang==='zh'?'下一单元':'Next')+' →</a></nav></div></article>';
}

function footer(s){
 return '<footer class="footer shell"><div class="over">'+esc(s.kicker)+'</div><div class="footer-brand">RAVEN</div><div class="footerline"><span>© '+new Date().getFullYear()+' RAVEN · '+esc(s.siteNote)+'</span><span><a href="'+oldHome[lang]+'" target="_blank" rel="noopener">'+txt.legacy+' ↗</a> / <a href="/contact/'+lang+'/">'+txt.contact+' ↗</a></span></div></footer>';
}
function bind(){
 const menu=$('#menu');
 menu?.addEventListener('click',()=>{
  const nav=$('#nav');const open=nav.classList.toggle('open');
  menu.setAttribute('aria-expanded',String(open)); menu.textContent=open?'CLOSE −':'MENU +';
 });
 const search=$('#search'),type=$('#type'),list=$('#events');
 if(!list||!search||!type)return;
 let matches=[...(securityData?.events||[])];
 const render=()=>{
  matches=(securityData?.events||[]).filter(e=>{
   const q=search.value.toLocaleLowerCase().trim();
   return (!type.value||e.category===type.value)&&(!q||[e.title,e.summary,e.region,e.date,e.body].join(' ').toLocaleLowerCase().includes(q));
  });
  list.innerHTML=matches.length?matches.slice(0,visible).map(eventCard).join(''):'<div class="empty">'+txt.noResults+'</div>';
  const counter=$('#match-count');if(counter)counter.textContent=txt.count+': '+matches.length+' / '+securityData.events.length;
  const more=$('#load-more');if(more)more.hidden=visible>=matches.length;
 };
 search.addEventListener('input',()=>{visible=18;render()});
 type.addEventListener('change',()=>{visible=18;render()});
 $('#load-more')?.addEventListener('click',()=>{visible+=18;render()});
}
try{
 const needed=['/content/site.json'];
 if(section==='security'||section==='home')needed.push('/content/security-'+lang+'.json');
 if(section==='journal'||section==='home')needed.push('/content/research-'+lang+'.json');
 if(['about','experience','contact','training'].includes(section))needed.push('/content/pages-'+lang+'.json');
 if(section==='training')needed.push('/content/training-'+lang+'.json');
 const values=await Promise.all(needed.map(async(url)=>{const res=await fetch(url);if(!res.ok)throw Error(url+' HTTP '+res.status);return res.json()}));
 site=values[0]; let cursor=1;
 mediaMap=await fetch('/content/media-map.json').then(r=>r.ok?r.json():null).catch(()=>null)||{branding:{},images:{}};
 if(section==='security'||section==='home')securityData=values[cursor++];
 if(section==='journal'||section==='home')researchData=values[cursor++];
 if(['about','experience','contact','training'].includes(section))pagesData=values[cursor++];
 if(section==='training')trainingData=values[cursor++];
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 const s=site.sections[lang];
 document.title='RAVEN — '+(lang==='zh'?'安全架构与风险治理':'Security Architecture & Risk Governance');
 let content='';
 if(section==='security')content=slug?securityDetail():securityList(s);
 else if(section==='journal')content=slug?researchDetail():researchList(s);
 else if(section==='training')content=slug?trainingDetail():trainingList();
 else if(['about','experience','contact'].includes(section))content=staticContentPage();
 else content=homeHero(s)+expertise(s)+researchList(s,true)+securityList(s,true)+platforms(s);
 $('#app').innerHTML=header()+'<main>'+content+'</main>'+footer(s);
 if(mediaMap.branding?.mark){const legacy=$('.hero-art .giant-r');if(legacy){const img=document.createElement('img');img.src=mediaMap.branding.mark;img.alt='';img.className='hero-brand-mark';img.setAttribute('aria-hidden','true');legacy.replaceWith(img)}}
 bind();
}catch(error){
 console.error('RAVEN preview failed:',error);
 $('#app').innerHTML='<main class="shell sec"><h1>RAVEN</h1><p>Content unavailable. Please refresh this preview.</p></main>';
}
