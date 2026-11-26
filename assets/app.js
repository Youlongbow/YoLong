import { labMarkup, initLab } from './security-lab.js';
import { initSharing } from './share.js';
import { initGoogleAnalytics } from './analytics.js';
import { renderCourseTable } from './course-tables.js';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// Replaced with content fingerprints during the Cloudflare build.
const CONTENT_DATA_REVISIONS={zh:'',en:''};
const pathParts = location.pathname.split('/').filter(Boolean);
const section = ['security','journal','about','experience','contact','training','capabilities','lab'].includes(pathParts[0]) ? pathParts[0] : 'home';
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
let site, securityData, researchData, pagesData, trainingData, pdfData, capabilityData, mediaMap={branding:{},images:{}};
let currentMatches=[], visible=18;
const txt=phrases[lang];

function activeUrl(target){
 if(section==='home') return '/'+target+'/';
 if(section==='lab')return '/lab/'+target+'/'+location.search;
 if(!slug) return '/'+section+'/'+target+'/';
 if(section==='security') return '/security/'+target+'/'+slug+'/';
 if(section==='training') return '/training/'+target+'/'+slug+'/';
 if(section==='capabilities') return '/capabilities/'+target+'/'+slug+'/';
 const translations=researchData?.articles || [];
 if(section==='journal' && target===lang) return '/journal/'+target+'/'+slug+'/';
 if(section==='journal' && target!==lang && slug==='pakistan-drc-mining-comparison') return '/journal/'+target+'/'+slug+'/';
 return '/journal/'+target+'/';
}
function link(label,href,active=false){
 return '<a class="'+(active?'active':'')+'" href="'+esc(href)+'">'+esc(label)+'</a>';
}
function languageSwitch(position='desktop'){
 const label=lang==='zh'?'语言选择':'Choose language';
 const zhCurrent=lang==='zh';
 const enCurrent=lang==='en';
 return '<div class="switch switch-'+position+'" role="group" aria-label="'+label+'">'+
  '<a class="switch-option'+(zhCurrent?' on':'')+'" href="'+activeUrl('zh')+'" lang="zh-CN" hreflang="zh-CN" aria-label="'+(zhCurrent?'当前语言：中文':'切换到中文')+'"'+(zhCurrent?' aria-current="page"':'')+'>中文</a>'+
  '<a class="switch-option'+(enCurrent?' on':'')+'" href="'+activeUrl('en')+'" lang="en" hreflang="en" aria-label="'+(enCurrent?'Current language: English':'Switch to English')+'"'+(enCurrent?' aria-current="page"':'')+'>EN</a>'+
 '</div>';
}
function header(){
 const home=section==='home';
 return '<header class="top shell">'+
  '<a class="logo" href="/'+lang+'/"><span class="logomark'+(mediaMap.branding?.mark?' logo-loaded':'')+'">'+(mediaMap.branding?.mark?'<img src="'+esc(mediaMap.branding.mark)+'" alt="" width="42" height="42">':'R')+'</span><span class="logotxt">RAVEN<small>SECURITY / RESEARCH / OPERATIONS</small></span></a>'+
  '<div class="header-tools">'+languageSwitch('mobile')+
  '<button id="menu" class="mobile" type="button" aria-expanded="false" aria-controls="nav">'+(lang==='zh'?'菜单':'MENU')+' <span aria-hidden="true">☰</span></button></div>'+
  '<nav id="nav" class="nav" aria-label="'+(lang==='zh'?'主导航':'Main navigation')+'">'+
  link(lang==='zh'?'首页':'Home','/'+lang+'/',home)+
  link(txt.security,'/security/'+lang+'/',section==='security')+
  link(txt.journal,'/journal/'+lang+'/',section==='journal')+
  link('HEAT','/training/'+lang+'/',section==='training')+
  link(lang==='zh'?'安防实验室':'Design Lab','/lab/'+lang+'/',section==='lab')+
  link(lang==='zh'?'专业经历':'Experience','/experience/'+lang+'/',section==='experience')+
  link(lang==='zh'?'关于':'About','/about/'+lang+'/',section==='about')+
  '<a class="nav-contact" href="/contact/'+lang+'/">'+(lang==='zh'?'联系':'Contact')+'</a>'+
  languageSwitch('desktop')+
  '</nav></header>';
}
function blockTitle(sectionCopy,title){
 return '<div class="sec-head"><div><div class="over">'+esc(sectionCopy.eyebrow)+'</div><h2 class="'+(lang==='zh'?'zh-h':'')+'">'+esc(title)+'</h2></div></div>';
}
function homeHero(s){
 const z=lang==='zh';
 const statementTitle=z?'独立研究 · 现场实践':'Independent research. Field practice.';
 const heading=z?'安全研究、风险治理与运营实践':'Security Research, Risk Governance & Field Practice';
 const subtitle=z?'以专业研究和现场经验，支持高风险环境下的安全决策与业务运营。':'Research and operational experience supporting security decisions in demanding environments.';
 // These covers are already archived on RAVEN, and illustrate their section.
 // They are not presented as photographs of any reported incident.
 const cards=[
  {kind:'journal',count:'01',name:z?'研究与观点':'Research & analysis',
   category:z?'独立研究 / STRATEGIC INSIGHTS':'RESEARCH / STRATEGIC INSIGHTS',
   description:z?'战略演变、矿业风险与安全治理的深度分析。':'In-depth analysis of strategic change, mining security and risk governance.',
   action:z?'阅读研究报告':'Explore research',
   image:'/assets/media/notion/77d3ad07-abfd-4300-89de-7a82a775c1fe.png',
   alt:z?'BLA战略研究报告中的分析图表':'Diagram from the BLA strategic research report',href:'/journal/'+lang+'/'},
  {kind:'monitor',count:'02',name:z?'全球安全动态':'Security intelligence',
   category:z?'安全情报 / GLOBAL MONITOR':'INTELLIGENCE / GLOBAL MONITOR',
   description:z?'持续追踪全球事件，分析对人员、路线和经营活动的影响。':'Events and assessments of their effects on people, routes and operations.',
   action:z?'查看事件档案':'View incident archive',
   image:'/assets/media/brand/raven-global-monitor.webp',
   alt:z?'RAVEN原创全球态势封面插画（非实时事件位置）':'Original RAVEN global monitoring cover illustration (conceptual; not live event locations)',href:'/security/'+lang+'/'},
  {kind:'training',count:'03',name:z?'HEAT 培训':'HEAT training',
   category:z?'实践培训 / SCENARIO LEARNING':'TRAINING / SCENARIO LEARNING',
   description:z?'真实情境教学、行动准备与突发事件判断训练。':'Practical field scenarios, preparation and emergency decision-making.',
   action:z?'进入培训课程':'Explore HEAT course',
   image:'/assets/media/notion/81e24df2-d3ff-443b-af9f-5074bcfb4655.webp',
   alt:z?'HEAT道路封控情境模拟图':'HEAT simulated road-closure scenario',href:'/training/'+lang+'/'}
 ];
 return '<section class="editorial-hero" aria-labelledby="hero-title"><div class="hero-photo" role="img" aria-label="'+(z?'乌鸦站立在石质建筑上，背后是明暗交错的云层':'A raven perched on stone architecture against a dramatic sky')+'"></div><div class="hero-vignette"></div>'+
  '<div class="hero-inner shell"><div class="hero-copy"><div class="over">RAVEN <span class="over-slash">/</span> SECURITY & RISK</div><div class="hero-wordmark" aria-hidden="true">RAVEN</div><h1 id="hero-title">'+esc(heading)+'</h1><p class="hero-dek">'+esc(subtitle)+'</p>'+
  '<div class="btns"><a class="btn red" href="/security/'+lang+'/">'+(z?'全球安全动态':'Explore intelligence')+' <span aria-hidden="true">↗</span></a><a class="btn" href="/journal/'+lang+'/">'+(z?'研究与观点':'Explore research')+' <span aria-hidden="true">↗</span></a></div></div></div></section>'+
  '<section class="editorial-statement shell" aria-label="'+esc(statementTitle)+'"><div class="statement-light"><span class="statement-rule"></span><strong>'+esc(statementTitle)+'</strong></div><p>'+esc(s.lead)+'</p></section>'+
  '<section class="editorial-gateways shell" aria-label="'+(z?'核心栏目':'Featured sections')+'">'+cards.map(card=>
   '<a class="gateway gateway-'+card.kind+'" href="'+card.href+'"><div class="gateway-media"><img src="'+esc(card.image)+'" alt="'+esc(card.alt)+'" loading="lazy" decoding="async"></div><div class="gateway-body"><div class="gateway-top"><span>'+esc(card.category)+'</span><span class="gateway-index">'+card.count+' / 03</span></div><h2>'+esc(card.name)+'</h2><p>'+esc(card.description)+'</p><div class="gateway-action"><span>'+esc(card.action)+'</span><span class="gateway-arrow" aria-hidden="true">↗</span></div></div></a>').join('')+'</section>';
}
function expertise(s){
 const items=capabilityData?.items||[];
 return '<section class="sec shell expertise-editorial" id="expertise">'+
  '<div class="editorial-section-top"><span class="over">'+(lang==='zh'?'业务能力':'CAPABILITIES')+'</span><span class="section-index">01 / 04</span></div>'+
  '<div class="expertise-title-line"><h2 class="'+(lang==='zh'?'zh-h':'')+'">'+esc(s.capabilitiesTitle)+'</h2><p>'+esc(s.capabilitiesLead)+'</p></div>'+
  '<div class="expertise-list">'+items.map((item,i)=>
   '<a class="expertise-item" href="/capabilities/'+lang+'/'+item.slug+'/"><span class="expertise-number">'+String(i+1).padStart(2,'0')+' / '+esc(item.eyebrow)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.summary)+'</p><span class="expertise-stroke" aria-hidden="true">↗</span></a>').join('')+'</div>'+
  '</section>';
}
function platforms(s){
 const services=[['01',s.training,s.trainingLead,'/training/'+lang+'/'],['02',s.career,s.careerLead,apps.careers],['03',s.ops,s.opsLead,apps.ops],['04',lang==='zh'?'安防设计实验室':'Security Design Lab',lang==='zh'?'交互式三维模型、安防设备、应用场景及设计概念。':'Interactive 3D models, security equipment, application scenarios and design concepts.','/lab/'+lang+'/']];
 return '<section class="sec shell" id="platforms">'+blockTitle(s,txt.platforms)+'<div class="cards3">'+services.map(x=>'<a class="feature" href="'+esc(x[3])+'" target="_blank" rel="noopener"><span class="num">'+x[0]+' / RAVEN</span><h3>'+esc(x[1])+'</h3><p>'+esc(x[2])+'</p><span class="arrow">↗</span></a>').join('')+'</div></section>';
}
function richInline(input){
 let s=esc(input);
 s=s.replace(/&lt;(\/?)b&gt;/gi,(_,end)=>end?'</strong>':'<strong>');
 s=s.replace(/&lt;(\/?)strong&gt;/gi,(_,end)=>end?'</strong>':'<strong>');
 s=s.replace(/&lt;(\/?)i&gt;/gi,(_,end)=>end?'</em>':'<em>');
 s=s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
 s=s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>');
 s=s.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/gi,(_,label,url)=>{
  const href=url.replace(/&amp;/g,'&');
  const external=/^https?:\/\//i.test(href);
  return '<a href="'+esc(href)+'"'+(external?' target="_blank" rel="noopener noreferrer"':'')+'>'+label+'</a>';
 });
 s=s.replace(/&lt;br\s*\/?&gt;/gi,'<br>');
 return s.replace(/\\\|/g,'|');
}
function richBody(markdown,sourceLink){
 const savedTables=[],savedToggles=[];
 let cleaned=String(markdown??'').replace(/<toggle(?:\s+[^>]*)?>([\s\S]*?)<\/toggle>/gi,(_,body)=>{
  const lines=body.trim().split(/\n/);
  const title=lines.shift()?.trim()|| (lang==='zh'?'展开阅读':'Read more');
  const index=savedToggles.push({title,body:lines.join('\n').trim()})-1;
  return '\n\n%%RAVEN_TOGGLE_'+index+'%%\n\n';
 }).replace(/<\/?(?:columns|column|synced-block-reference)(?:\s+[^>]*)?>/gi,'')
  .replace(/<p(?:\s+[^>]*)?>/gi,'').replace(/<\/p>/gi,'');
 cleaned=cleaned.replace(/<table\b[\s\S]*?<\/table>/gi,table=>{
  const index=savedTables.push(table)-1;
  return '\n\n%%RAVEN_TABLE_'+index+'%%\n\n';
 });
 const blocks=cleaned.trim().split(/\n\s*\n/).filter(Boolean);
 return blocks.map(chunk=>{
  const first=chunk.split('\n')[0].trim();
  const toggle=first.match(/^%%RAVEN_TOGGLE_(\d+)%%$/);
  if(toggle){
   const note=savedToggles[Number(toggle[1])];
   return '<details class="article-details"><summary>'+richInline(note.title)+'</summary><div class="article-details-body">'+richBody(note.body,sourceLink)+'</div></details>';
  }
  if(/^(---|___|\*\*\*)$/.test(chunk.trim()))return '<hr class="article-divider">';
  // Migrated GFM pipe tables must preserve their actual row/column structure.
  const markdownTable=renderCourseTable(chunk,richInline,lang);
  if(markdownTable)return markdownTable;
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
      return '<figure class="article-figure '+(/\.svg$/i.test(name)?'article-diagram':'article-photograph')+'"><img src="'+esc(preserved)+'" alt="'+esc(name)+'" loading="lazy" decoding="async">'+(caption?'<figcaption>'+richInline(caption).replace(/\n/g,'<br>')+'</figcaption>':'')+'</figure>';
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
 const title=a.title || a[lang==='zh'?'titleZh':'titleEn'];
 const href=isLegacy?a.url:'/journal/'+lang+'/'+a.slug+'/';
 const slugKey=a.slug||'';
 const covers={
  'pakistan-drc-mining-comparison':{src:'/assets/media/notion/c9f09efa-e0fa-4c2a-90c5-e436d392e74d.webp',kind:'photo',
   zh:'比较巴基斯坦和刚果（金）的矿业威胁结构与现场安保策略。',en:'Comparing mining threats, exposure and protective strategies in Pakistan and the DRC.'},
  'bla-strategy-analysis':{src:'/assets/media/notion/77d3ad07-abfd-4300-89de-7a82a775c1fe.png',kind:'diagram',
   zh:'追踪BLA的组织与战略变化，评估其对矿业投资及经营的影响。',en:'Assessing BLA strategic change and its implications for mining and investment.'},
  'blf-bla-operational-divergence':{src:'/assets/media/notion/4b0b8b2a-6bb1-4fd4-ad2f-319e5671c24e.png',kind:'diagram',
   zh:'分析俾路支武装组织行动分化及其对地区商业活动的影响。',en:'Examining divergent militant activity and the consequences for business operations.'},
  'bla-war-logic':{src:'/assets/media/notion/88c554e3-417c-4143-a9da-f4742bdff43f.png',kind:'diagram',
   zh:'研究资金、领导层与组织利益如何影响武装组织的战略决策。',en:'Exploring funding, leadership and organisational incentives in strategic decision-making.'},
  'bla-leadership-2026-02':{src:'/assets/media/notion/9b27bfe5-9caa-42b3-bbac-d50a805c6552.png',kind:'diagram',
   zh:'评估领导权重组、战略调整与俾路支地区经营风险。',en:'Reviewing leadership reorganisation, strategic shifts and regional operating risk.'}
 };
 const cover=covers[slugKey];
 const excerpt=a[lang==='zh'?'excerptZh':'excerptEn'] || (cover?.[lang]||'');
 const description=excerpt.length>185?excerpt.slice(0,185)+'…':excerpt;
 const label=isLegacy?'RAVEN / ARCHIVE':(lang==='zh'?'独立研究 / RESEARCH':'INDEPENDENT RESEARCH');
 return '<article class="paper'+(cover?' paper-illustrated':'')+'">'+
 (cover?'<a class="paper-media '+(cover.kind==='diagram'?'media-diagram':'media-photo')+'" href="'+esc(href)+'"><img src="'+esc(cover.src)+'" alt="'+esc(lang==='zh'?'研究报告配图':'Illustration from the research report')+'" loading="lazy" decoding="async"></a>':'<div class="paper-media paper-media-plain" aria-hidden="true"><span>R / RESEARCH</span></div>')+
 '<div class="paper-content"><div class="meta">'+esc(label)+(a.date?' / '+esc(a.date):'')+'</div><h3><a class="paper-title-link" href="'+esc(href)+'"'+(isLegacy?' target="_blank" rel="noopener"':'')+'>'+esc(title)+'</a></h3>'+
 (description?'<p>'+esc(description)+'</p>':'')+
 '<a class="paper-read" href="'+esc(href)+'"'+(isLegacy?' target="_blank" rel="noopener"':'')+'>'+(lang==='zh'?'阅读全文':'Read analysis')+' <span aria-hidden="true">↗</span></a></div></article>';
}
function archivedPdfCards(){
 const list=pdfData?.publications||[];
 if(!list.length)return '';
 const label=lang==='zh'?'原始研究文献（PDF）':'Original research publications (PDF)';
 return '<h3 class="archive-subtitle">'+label+' <span class="pdf-count">'+list.length+'</span></h3><div class="paper-grid">'+
 list.map(pub=>'<article class="paper pdf-paper"><div class="meta">RAVEN / PDF ARCHIVE / '+String(pub.order).padStart(2,'0')+'</div><h3>'+esc(pub.title)+'</h3><a href="'+esc(pub.path)+'" target="_blank" rel="noopener">'+(lang==='zh'?'查看原版 PDF':'Open original PDF')+' ↗</a></article>').join('')+
 '</div>';
}
function researchList(s,compact=false){
 const entries=researchData?.articles||[];
 const cards=entries.map(a=>researchCard(a,false));
 const legacy=(site.articles||[]).filter(a=>!entries.some(x=>x.title===a[lang==='zh'?'titleZh':'titleEn']));
 if(compact) return '<section id="journal" class="sec shell">'+blockTitle(s,s.researchTitle)+'<p class="sec-intro">'+esc(s.researchLead)+'</p><div class="paper-grid">'+(cards.length?cards.slice(0,4):legacy.slice(0,4).map(a=>researchCard(a,true))).join('')+'</div><p class="archive-extra"><a class="btn" href="/journal/'+lang+'/">'+txt.journal+' ↗</a></p></section>';
 return '<section id="journal" class="sec shell">'+blockTitle(s,s.researchTitle)+'<p class="sec-intro">'+esc(txt.researchNote)+'</p><div class="paper-grid">'+cards.join('')+'</div>'+
 (legacy.length?'<h3 class="archive-subtitle">'+txt.researchOld+'</h3><div class="paper-grid">'+legacy.map(a=>researchCard(a,true)).join('')+'</div>':'')+archivedPdfCards()+'</section>';
}
function eventHref(e){return '/security/'+lang+'/'+e.slug+'/'}
function eventCard(e){
 const summary=String(e.summary||'').slice(0,350);
 return '<article class="event"><div class="date">'+esc(e.date)+'<div>'+esc(e.region)+'</div></div><div><div class="meta">'+esc(txt.category[e.category]||txt.category.security)+' / RAVEN ARCHIVE</div><h3><a class="detail-link" href="'+eventHref(e)+'">'+esc(e.title)+'</a></h3><p>'+esc(summary)+'</p><a class="source detail-link" href="'+eventHref(e)+'">'+txt.detail+' ↗</a><button class="event-share" data-share-event="'+esc(e.slug)+'">'+(lang==='zh'?'分享':'Share')+'</button></div></article>';
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

function capabilityIndex(s){
 const entries=capabilityData?.items||[];
 return articleHero('RAVEN / CAPABILITIES',lang==='zh'?'专业能力与服务领域':'Security Capabilities','/'+lang+'/',lang==='zh'?'返回首页':'Back to home')+
 '<section class="sec shell capability-directory"><p class="capability-lead">'+esc(lang==='zh'?'从业务风险出发，结合项目现场条件、组织责任和可落实的资源，形成安全体系、执行流程与决策支持。':'Practical security management across high-risk operations, protective planning, security coordination, crisis response and corporate governance.')+'</p>'+
 '<div class="capability-directory-grid">'+entries.map((x,i)=>'<a class="capability-directory-card" href="/capabilities/'+lang+'/'+x.slug+'/"><span>'+String(i+1).padStart(2,'0')+' / '+esc(x.eyebrow)+'</span><h2>'+esc(x.title)+'</h2><p>'+esc(x.summary)+'</p><b aria-hidden="true">↗</b></a>').join('')+'</div></section>';
}
function capabilityDetail(s){
 const item=capabilityData?.items.find(x=>x.slug===slug);
 if(!item)return '<section class="sec shell"><h2>404</h2><a href="/capabilities/'+lang+'/">'+(lang==='zh'?'返回专业领域':'Back to capabilities')+'</a></section>';
 document.title=item.title+' · RAVEN';
 const back=lang==='zh'?'全部专业领域':'All capabilities';
 const title=(en,zh)=>lang==='zh'?zh:en;
 return articleHero('RAVEN / '+item.eyebrow,item.title,'/capabilities/'+lang+'/',back)+
 '<section class="shell capability-detail"><div class="capability-detail-intro"><div class="capability-intro-tag">'+esc(item.eyebrow)+'</div><p class="capability-lead">'+esc(item.lead)+'</p>'+
 item.intro.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+
 '<div class="capability-section"><div class="capability-section-head"><span>01 / '+title('Approach','工作方法')+'</span><h2>'+title('How the work is organised','如何开展工作')+'</h2></div>'+
 '<div class="capability-steps">'+item.approach.map((step,i)=>'<article class="capability-step"><span>'+String(i+1).padStart(2,'0')+'</span><h3>'+esc(step.title)+'</h3><p>'+esc(step.text)+'</p></article>').join('')+'</div></div>'+
 '<div class="capability-bottom"><section><span class="capability-small-label">02 / '+title('Deliverables','成果交付')+'</span><h2>'+title('What this produces','具体交付内容')+'</h2><ul>'+item.deliverables.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>'+
 '<section><span class="capability-small-label">03 / '+title('Application','适用场景')+'</span><h2>'+title('Where it applies','适用业务与场景')+'</h2><ul>'+item.contexts.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section></div>'+
 '<nav class="capability-related" aria-label="'+title('Related pages','相关内容')+'"><span>'+title('Related work','延伸了解')+'</span>'+item.links.map(x=>'<a href="'+x.href+'">'+esc(x.label)+' ↗</a>').join('')+'</nav>'+
 '</section>';
}

/* Dedicated bilingual editorial layouts for About and Experience.
   These pages use structured copy and locally mirrored imagery instead
   of flattening legacy Notion column tags into a narrow article body. */
function professionalContentPage(record){
 const p=record.presentation;
 const refs=[...String(record.body||'').matchAll(/<image\b[^>]*source="([^"]+)"/gi)].map(m=>m[1]);
 const photos=refs.map(ref=>mediaMap.images?.[ref]||'');
 const photo=(index,caption,klass='',override='',mobileOverride='')=>{
  const src=override||photos[index]||'';
  const img='<img src="'+esc(src)+'" alt="'+esc(caption||record.title)+'" loading="lazy" decoding="async">';
  return src
   ?'<figure class="profile-photo '+klass+'">'+
    (mobileOverride?'<picture><source media="(max-width:820px)" srcset="'+esc(mobileOverride)+'">'+img+'</picture>':img)+
    '<figcaption>'+esc(caption||'RAVEN / FIELD WORK')+'</figcaption></figure>'
   :'<div class="profile-photo profile-photo-fallback '+klass+'" aria-hidden="true"><span>R / RAVEN</span></div>';
 };
 const stats=(p.metrics||[]).map(entry=>'<div class="profile-stat"><strong>'+esc(entry.value)+'</strong><span>'+esc(entry.label)+'</span></div>').join('');
 const philosophy=p.philosophy;
 const philosophySection=section==='about' && philosophy?.statement
  ?'<section class="profile-belief shell" aria-labelledby="profile-belief-heading">'+
   '<div class="profile-belief-label"><span class="profile-kicker">'+esc(philosophy.eyebrow||'SECURITY / PHILOSOPHY')+'</span>'+
   '<h2 id="profile-belief-heading">'+esc(philosophy.heading||'How I See Security')+'</h2></div>'+
   '<div class="profile-belief-body"><p class="profile-belief-statement">'+esc(philosophy.statement)+'</p>'+
   '<p>'+esc(philosophy.explanation||'')+'</p>'+
   (philosophy.role?'<p class="profile-belief-role">'+esc(philosophy.role)+'</p>':'')+'</div></section>'
  :'';
 const stories=(p.chapters||[]).map((chapter,i)=>{
  const paragraphs=(chapter.paragraphs||[]).map(x=>'<p>'+esc(x)+'</p>').join('');
  const heading=Array.isArray(chapter.titleParts) && chapter.titleParts.join('')===chapter.title
   ?chapter.titleParts.map(part=>'<span class="profile-story-title-part">'+esc(part)+'</span>').join('')
   :esc(chapter.title);
  const visual=photo(chapter.image,chapter.caption,'profile-story-photo',chapter.artwork||'');
  return '<article class="profile-story">'+
   '<div class="profile-story-copy"><div class="profile-kicker">'+esc(chapter.tag)+'</div><h3>'+heading+'</h3>'+paragraphs+'</div>'+
   '<div class="profile-story-visual">'+visual+'</div>'+
   '</article>';
 }).join('');
 const qualifications=(p.qualifications||[]).map((group,i)=>
  '<section class="profile-credential"><span class="profile-small-index">'+String(i+1).padStart(2,'0')+' / 03</span><h3>'+esc(group.heading)+'</h3>'+
   '<ul>'+group.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>').join('');
 const highlights=(p.highlights||[]).map((item,i)=>
  '<article class="profile-assignment"><span class="profile-small-index">'+String(i+1).padStart(2,'0')+' / '+esc(item.location)+'</span>'+
  '<h3>'+esc(item.title)+'</h3><b>'+esc(item.role)+'</b><p>'+esc(item.summary)+'</p></article>').join('');
 const archives=(p.archives||[]).map((group,i)=>
  '<details class="profile-archive"><summary><span>'+String(i+1).padStart(2,'0')+' / '+esc(group.title)+'</span><b aria-hidden="true">+</b></summary>'+
  '<ul>'+group.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>').join('');
 const archiveSection=p.archives?.length
  ?'<section class="profile-portfolio shell"><div class="profile-section-head"><span class="profile-kicker">'+esc(p.archiveEyebrow||'PROJECT ARCHIVE')+'</span><h2>'+esc(p.archiveTitle||'More Projects')+'</h2></div><div class="profile-archive-list">'+archives+'</div></section>':'';
 const featureSection=p.highlights?.length
  ?'<section class="profile-featured shell"><div class="profile-section-head"><span class="profile-kicker">'+esc(p.qualEyebrow)+'</span><h2>'+esc(p.qualTitle)+'</h2><p>'+esc(p.qualLead||'')+'</p></div><div class="profile-assignments">'+highlights+'</div></section>'
  :'<section class="profile-featured shell"><div class="profile-section-head"><span class="profile-kicker">'+esc(p.qualEyebrow)+'</span><h2>'+esc(p.qualTitle)+'</h2><p>'+esc(p.qualLead||'')+'</p></div><div class="profile-credentials">'+qualifications+'</div></section>';
 // Award display follows the work, before the wider project archive.
 const recognition=p.recognition;
 const recognitionSection=section==='experience' && recognition?.artwork
  ?'<section class="profile-recognition shell" aria-label="'+esc(recognition.title||'Professional recognition')+'">'+
   '<div class="profile-recognition-frame"><div class="profile-recognition-art">'+
   '<img src="'+esc(recognition.artwork)+'" alt="'+esc(recognition.alt||recognition.title)+'" loading="lazy" decoding="async">'+
   '</div><div class="profile-recognition-copy"><span class="profile-kicker">'+esc(recognition.eyebrow||'PROFESSIONAL RECOGNITION')+'</span>'+
   '<h2>'+esc(recognition.title)+'</h2><p class="profile-recognition-years">'+esc(recognition.years||'')+'</p>'+
   '<p class="profile-recognition-desc">'+esc(recognition.description||'')+'</p></div></div></section>'
  :'';
 const shop=p.purchase;
 const shopOptions=Array.isArray(shop?.options)
  ?shop.options.filter(x=>typeof x.url==='string' && /^https:\/\//i.test(x.url))
  :[];
 const purchaseSection=section==='about' && shop && shopOptions.length
  ?'<section class="profile-book shell" aria-labelledby="profile-book-title">'+
   '<div class="profile-book-art" aria-label="'+esc(shop.artLabel||'Beyond Risk, Chinese and English editions')+'">'+
   (shop.artwork?'<img class="profile-book-cover-photo" src="'+esc(shop.artwork)+'" loading="lazy" decoding="async" alt="'+esc(shop.artLabel||'Beyond Risk book covers')+'">'
    :'<span>RAVEN / PUBLISHED WORK</span><strong>R</strong><small>RISK / GOVERNANCE / OPERATIONS</small>')+'</div>'+
   '<div class="profile-book-content"><span class="profile-kicker">'+esc(shop.eyebrow||'PUBLISHED WORK')+'</span>'+
   '<h2 id="profile-book-title">'+esc(shop.title)+'</h2><p class="profile-book-subtitle">'+esc(shop.subtitle||'')+'</p>'+
   '<p class="profile-book-description">'+esc(shop.description||'')+'</p>'+
   '<details class="profile-buy"><summary><span>'+esc(shop.actionLabel||'Buy the book')+'</span><span class="profile-buy-arrow" aria-hidden="true">↗</span></summary>'+
   '<div class="profile-buy-menu"><p>'+esc(shop.chooserLabel||'Choose a store')+'</p>'+
   shopOptions.map(x=>'<a class="profile-buy-option" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(x.label)+'</span><small>'+esc(x.caption||'')+'</small><b aria-hidden="true">↗</b></a>').join('')+
   '<small class="profile-buy-note">'+esc(shop.note||'')+'</small></div></details></div></section>'
  :'';
 document.title=record.title+' · RAVEN';
 return '<main class="profile-design profile-'+esc(section)+'">'+
  '<header class="profile-hero shell"><div class="profile-hero-copy"><span class="profile-kicker">'+esc(p.eyebrow)+'</span>'+
  '<h1>'+esc(p.title)+'</h1><p class="profile-lead">'+esc(p.lead)+'</p><p class="profile-strap">'+esc(p.strap||'')+'</p>'+
  '<div class="profile-hero-actions"><a href="'+esc(p.primaryLink)+'">'+esc(p.primaryLabel)+' <span aria-hidden="true">↗</span></a><a href="'+esc(p.secondaryLink)+'">'+esc(p.secondaryLabel)+' <span aria-hidden="true">↗</span></a></div></div>'+
  '<div class="profile-hero-visual">'+photo(0,section==='about'?'RAVEN / FIELD ORIGINS':'RAVEN / HIGH-RISK OPERATIONS','profile-hero-photo',p.heroArtwork||'',section==='about'?(p.heroMobileArtwork||''):'')+
  '<div class="profile-art-corner" aria-hidden="true">R / '+esc(section.toUpperCase())+'</div></div></header>'+
  '<div class="profile-stats shell">'+stats+'</div>'+philosophySection+
  '<section class="profile-narrative shell"><div class="profile-section-head"><span class="profile-kicker">'+esc(p.sectionEyebrow)+'</span><h2>'+esc(p.sectionTitle)+'</h2><p>'+esc(p.sectionLead||'')+'</p></div><div class="profile-stories">'+stories+'</div></section>'+
  featureSection+recognitionSection+archiveSection+purchaseSection+
  '<section class="profile-closing shell"><span class="profile-kicker">RAVEN / SECURITY & OPERATIONS</span><h2>'+esc(p.closing)+'</h2>'+
  '<p>'+esc(p.book||'')+'</p><div class="profile-hero-actions"><a href="'+esc(p.primaryLink)+'">'+esc(p.primaryLabel)+' ↗</a><a href="'+esc(p.secondaryLink)+'">'+esc(p.secondaryLabel)+' ↗</a></div></section>'+
  '</main>';
}

function staticContentPage(){
 const record=pagesData?.pages.find(x=>x.slug===section);
 if(!record)return '<section class="sec shell"><h2>404</h2></section>';
 if(record.presentation && (section==='about'||section==='experience'))return professionalContentPage(record);
 document.title=record.title+' · RAVEN';
 return articleHero('RAVEN / '+section.toUpperCase(),record.title,'/'+lang+'/','RAVEN')+
 '<article class="article-layout shell"><div class="article-sidebar"><p>RAVEN / '+section.toUpperCase()+'</p><div>'+txt.full+'</div></div><div class="article-content">'+richBody(record.body,record.sourceUrl)+'</div></article>';
}
function trainingList(){
 const record=pagesData?.pages.find(x=>x.slug==='training');
 const introduction=(record?.body||'').replace(/<page url="[^"]+"[^>]*>[\s\S]*?<\/page>/g,'').replace(/^# [^\n]+\n\s*\n/,'');
 const modules=trainingData?.modules||[];
 document.title=(lang==='zh'?'HEAT 敌对环境安全意识培训':'HEAT Hostile Environment Awareness Training')+' · RAVEN';
 const imageFor=module=>{
  const m=String(module.body||'').match(/<image\b[^>]*source="([^"]+)"[^>]*>/i);
  return m?mediaMap.images?.[m[1]]||'':'';
 };
 return articleHero('RAVEN / HEAT',lang==='zh'?'HEAT｜敌对环境安全意识培训':'HEAT | Hostile Environment Awareness Training','/'+lang+'/','RAVEN')+
 '<section class="sec shell course-overview"><div class="course-intro">'+richBody(introduction,record?.sourceUrl)+'</div>'+
 '<div class="course-section-heading"><div class="over">COURSE / '+modules.length+' MODULES</div><h2>'+(lang==='zh'?'课程模块':'Course modules')+'</h2><p>'+(lang==='zh'?'每个单元包含现场场景、判断方法和可执行的应对措施。':'Each module combines practical scenarios, decisions and operational responses.')+'</p></div>'+
 '<div class="course-grid">'+modules.map((m,i)=>{
  const src=imageFor(m);
  return '<a class="course-card" href="/training/'+lang+'/'+m.slug+'/">'+
    (src?'<div class="course-card-media"><img src="'+esc(src)+'" alt="'+esc(lang==='zh'?'课程情境示意':'Training scenario illustration')+'" loading="lazy" decoding="async"></div>':'<div class="course-card-media course-card-plain" aria-hidden="true">HEAT / RAVEN</div>')+
    '<div class="course-card-body"><span>'+m.slug+' / HEAT</span><h3>'+esc(m.title.replace(/^\d{2}\s*[|｜]\s*/,''))+'</h3><div class="course-card-action">'+(lang==='zh'?'进入单元':'Open module')+' <em aria-hidden="true">↗</em></div></div></a>';
 }).join('')+'</div></section>';
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
 return '<footer class="footer shell"><div class="over">'+esc(s.kicker)+'</div><div class="footer-brand">RAVEN</div><div class="footerline"><span>© '+new Date().getFullYear()+' RAVEN · '+esc(s.siteNote)+'</span><span><a href="/contact/'+lang+'/">'+txt.contact+' ↗</a></span></div></footer>';
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
function finishBrandTransition(){
 const overlay=$('#site-transition');
 if(!overlay)return;
 overlay.classList.remove('is-entering');
 overlay.classList.add('is-exiting');
 window.setTimeout(()=>overlay.classList.add('is-hidden'),400);
}
function installBrandNavigation(){
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target.closest('a[href]');
  if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
  const href=new URL(anchor.href,location.href);
  if(href.origin!==location.origin||!['https:','http:'].includes(href.protocol))return;
  if(href.pathname===location.pathname && href.search===location.search && href.hash)return;
  event.preventDefault();
  const overlay=$('#site-transition');
  if(overlay){
   overlay.classList.remove('is-hidden','is-exiting');
   overlay.classList.add('is-entering');
  }
  window.setTimeout(()=>{location.assign(href.href)},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:160);
 },{passive:false});
 window.addEventListener('pageshow',event=>{if(event.persisted)finishBrandTransition()});
}
installBrandNavigation();
try{
 const needed=['/content/site.json'];
 if(section==='security'||section==='home')needed.push('/content/security-'+lang+'.json');
 if(section==='journal'||section==='home')needed.push('/content/research-'+lang+'.json');
 if(section==='journal')needed.push('/content/journal-attachments.json');
 if(['about','experience','contact','training'].includes(section))needed.push('/content/pages-'+lang+(CONTENT_DATA_REVISIONS[lang]?'.'+CONTENT_DATA_REVISIONS[lang]:'')+'.json');
 if(section==='training')needed.push('/content/training-'+lang+'.json');
 if(section==='home'||section==='capabilities')needed.push('/content/capabilities-'+lang+'.json');
 const values=await Promise.all(needed.map(async(url)=>{const res=await fetch(url);if(!res.ok)throw Error(url+' HTTP '+res.status);return res.json()}));
 site=values[0]; let cursor=1;
 mediaMap=await fetch('/content/media-map.json').then(r=>r.ok?r.json():null).catch(()=>null)||{branding:{},images:{}};
 if(section==='security'||section==='home')securityData=values[cursor++];
 if(section==='journal'||section==='home')researchData=values[cursor++];
 if(section==='journal')pdfData=values[cursor++];
 if(['about','experience','contact','training'].includes(section))pagesData=values[cursor++];
 if(section==='training')trainingData=values[cursor++];
 if(section==='home'||section==='capabilities')capabilityData=values[cursor++];
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 const s=site.sections[lang];
 document.title='RAVEN — '+(lang==='zh'?'安全架构与风险治理':'Security Architecture & Risk Governance');
 let content='';
 if(section==='security')content=slug?securityDetail():securityList(s);
 else if(section==='journal')content=slug?researchDetail():researchList(s);
 else if(section==='training')content=slug?trainingDetail():trainingList();
 else if(section==='lab'){content=labMarkup(lang);document.title=(lang==='zh'?'安防设计平台':'Physical Security Design Platform')+' · RAVEN';}
 else if(section==='capabilities')content=slug?capabilityDetail(s):capabilityIndex(s);
 else if(['about','experience','contact'].includes(section))content=staticContentPage();
 else content=homeHero(s)+expertise(s)+securityList(s,true)+researchList(s,true)+platforms(s);
 $('#app').innerHTML=header()+'<main class="'+(section==='home'?'home-layout':'interior-layout')+' section-'+section+'">'+content+'</main>'+footer(s);
 if(mediaMap.branding?.mark){const legacy=$('.hero-art .giant-r');if(legacy){const img=document.createElement('img');img.src=mediaMap.branding.mark;img.alt='';img.className='hero-brand-mark';img.setAttribute('aria-hidden','true');legacy.replaceWith(img)}}
 bind();
 if(section==='lab')initLab(lang);
 initSharing({lang,events:securityData?.events||[]});
 initGoogleAnalytics(site.analytics, {lang, section});
 window.requestAnimationFrame(finishBrandTransition);
}catch(error){
 console.error('RAVEN preview failed:',error);
 $('#app').innerHTML='<main class="shell sec"><h1>RAVEN</h1><p>Content unavailable. Please refresh this preview.</p></main>';
 finishBrandTransition();
}
