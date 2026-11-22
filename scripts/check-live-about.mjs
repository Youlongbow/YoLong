// Compare what users actually receive, not only what GitHub stores.
const domains=['https://www.ravenlong.com','https://yolong.bournelong511.workers.dev'];
const hero='/assets/media/editorial/about-hero-orange-vest-original-2026.webp';
const order=[
 '/assets/media/notion/723223d1-ceb8-46d1-92c3-729d03b290b4.webp',
 '/assets/media/editorial/about-desert-hilux-original-2026.webp',
 '/assets/media/editorial/about-career-reference-coordination-2026.webp'
];
for(const origin of domains){
 for(const lang of ['zh','en']){
  let passed=false;
  for(let attempt=1;attempt<=14;attempt++){
   try{
    const htmlResponse=await fetch(origin+'/about/'+lang+'/',{cache:'no-store',signal:AbortSignal.timeout(16000)});
    const html=await htmlResponse.text();
    const appPath=html.match(/src="(\/assets\/app\.[a-f0-9]{12}\.js)"/)?.[1];
    if(!appPath)throw Error('Missing fingerprinted app entry in About HTML');
    const jsResponse=await fetch(origin+appPath,{cache:'no-store',signal:AbortSignal.timeout(16000)});
    const js=await jsResponse.text();
    const fingerprint=js.match(/const CONTENT_DATA_REVISIONS=(\{[^;]+\});/)?.[1];
    if(!fingerprint)throw Error('Missing fingerprint map in app module');
    const revision=JSON.parse(fingerprint)[lang];
    const path='/content/pages-'+lang+'.'+revision+'.json';
    const jsonResponse=await fetch(origin+path,{cache:'no-store',signal:AbortSignal.timeout(16000)});
    const obj=await jsonResponse.json();
    const presentation=obj.pages.find(p=>p.slug==='about')?.presentation;
    const actual=presentation?.chapters?.map(p=>p.artwork)||[];
    const matches=presentation?.heroArtwork===hero && actual.length===order.length && actual.every((url,i)=>url===order[i]);
    const htmlCurrent=htmlResponse.ok&&jsResponse.ok&&jsonResponse.ok;
    console.log('ABOUT_LIVE_PHOTOS',JSON.stringify({origin,lang,attempt,htmlCurrent,matches,
      app:appPath,json:path,hero:presentation?.heroArtwork,first:actual[0],second:actual[1],third:actual[2],
      contentCache:jsonResponse.headers.get('cache-control'),
      htmlCache:htmlResponse.headers.get('cache-control')}));
    passed=htmlCurrent&&matches;
    if(passed)break;
   }catch(e){console.log('ABOUT_LIVE_RETRY',origin,lang,attempt,String(e).slice(0,250));}
   await new Promise(resolve=>setTimeout(resolve,2500));
  }
  if(!passed)throw Error('Live About photo order or cache version remains incorrect on '+origin+'/'+lang);
 }
}
