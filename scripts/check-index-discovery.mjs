const base='https://www.ravenlong.com';
const key='856c1a00e9bf46aaa0049b19d18aac90';
const checks=[
  {path:'/robots.txt',must:['Allow: /','Sitemap: https://www.ravenlong.com/sitemap.xml']},
  {path:'/sitemap.xml',must:['<urlset','https://www.ravenlong.com/zh/','https://www.ravenlong.com/en/']},
  {path:'/zh/',must:['rel="canonical"','/zh/','name="description"']},
  {path:'/about/zh/',must:['rel="canonical"','/about/zh/']},
  {path:'/'+key+'.txt',must:[key]}
];
let failed=0;
for(const check of checks){
 try{
  const response=await fetch(base+check.path,{headers:{'User-Agent':'Googlebot'},signal:AbortSignal.timeout(15000)});
  const body=await response.text();
  const missing=check.must.filter(term=>!body.includes(term));
  const blocked=/noindex/i.test((response.headers.get('x-robots-tag')||'')+' '+(check.path.endsWith('/')?(body.match(/<meta[^>]+name=["']robots["'][^>]*>/ig)||[]).join(''):''));
  const success=response.ok&&!missing.length&&!blocked;
  if(!success)failed++;
  console.log('SEARCH_VISIBILITY_CHECK',JSON.stringify({path:check.path,status:response.status,ok:success,missing,blocked,contentType:response.headers.get('content-type'),cfRay:response.headers.get('cf-ray')}));
 }catch(error){failed++;console.log('SEARCH_VISIBILITY_ERROR',check.path,String(error));}
}
if(failed){console.error('Search discovery readiness errors:',failed);process.exitCode=1;}
else console.log('Search discovery readiness passed, which does not guarantee indexing by Google.');
