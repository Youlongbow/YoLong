import qrcode from './vendor/qrcode.mjs';
export function initSharing({lang,events=[]}){
 const z=lang==='zh',t=(a,b)=>z?a:b;
 const style=document.createElement('style');style.textContent=`.raven-share-launch{position:fixed;right:20px;bottom:24px;z-index:90;background:#b42e36;color:white;border:1px solid #ef7777;border-radius:30px;padding:12px 22px;font:inherit;cursor:pointer}.raven-share-dialog{color:#eee;background:#141719;border:1px solid #555;border-radius:16px;padding:24px;width:min(620px,calc(100vw - 32px));max-height:90dvh;overflow:auto}.raven-share-dialog::backdrop{background:#000b}.raven-share-dialog button,.raven-share-dialog a{display:inline-block;padding:11px 15px;margin:4px;border:1px solid #666;border-radius:8px;background:#222;color:#fff;font:inherit;text-decoration:none;cursor:pointer}.raven-share-dialog textarea{width:100%;min-height:110px;background:#202326;color:white;padding:12px;font:inherit;box-sizing:border-box}.raven-share-dialog canvas{width:100%;height:auto;margin:16px 0}.raven-share-dialog p{line-height:1.6}.event-share{margin-left:18px;background:none;border:1px solid #666;color:inherit;padding:8px 14px;cursor:pointer}`;document.head.append(style);
 const launch=document.createElement('button');launch.className='raven-share-launch';launch.textContent=t('分享','Share');document.body.append(launch);
 const dialog=document.createElement('dialog');dialog.className='raven-share-dialog';dialog.setAttribute('aria-label',t('分享页面','Share page'));document.body.append(dialog);
 let previous;
 function open(record){
 previous=document.activeElement;
 const title=record?.title||document.querySelector('main h1')?.textContent||document.title;
 const summary=String(record?.summary||document.querySelector('meta[name="description"]')?.content||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
 const brief=Array.from(summary).slice(0,z?110:240).join('')+(Array.from(summary).length>(z?110:240)?'…':'');
 const path=record?'/security/'+lang+'/'+encodeURIComponent(record.slug)+'/':location.pathname;
 const url=new URL(path,'https://www.ravenlong.com').href;
 dialog.replaceChildren();
 const heading=document.createElement('h2');heading.textContent=t('分享这条信息','Share this page');dialog.append(heading);
 const close=document.createElement('button');close.textContent=t('关闭','Close');close.onclick=()=>dialog.close();dialog.append(close);
 const area=document.createElement('textarea');area.setAttribute('aria-label',t('分享简介，可编辑','Editable sharing introduction'));area.value=title+'\n\n'+brief;dialog.append(area);
 const actions=document.createElement('div');dialog.append(actions);
 const status=document.createElement('p');status.setAttribute('role','status');
 function button(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{try{await fn()}catch(e){if(e.name!=='AbortError')status.textContent=t('操作未完成，请复制下方链接或保存图片。','Please copy the link below or save the image.')}};actions.append(b);return b;}
 function text(){return area.value+'\n\n'+url}
 button(t('复制简介和链接','Copy text & link'),async()=>{await navigator.clipboard.writeText(text());status.textContent=t('已复制','Copied')});
 for(const [name,make] of [['X / Twitter',()=> 'https://twitter.com/intent/tweet?'+new URLSearchParams({text:Array.from(area.value).slice(0,200).join(''),url})],['Facebook',()=> 'https://www.facebook.com/sharer/sharer.php?'+new URLSearchParams({u:url})],['WhatsApp',()=> 'https://wa.me/?'+new URLSearchParams({text:text()})]])button(name,()=>window.open(make(),'_blank','noopener,noreferrer'));
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;canvas.setAttribute('aria-label',t('带简介和直达二维码的分享图','Share image with introduction and QR code'));
 const ctx=canvas.getContext('2d');
 function wrap(str,y,size,maxLines){ctx.font=`${size}px sans-serif`;let line='',n=0;for(const char of Array.from(str)){if(char==='\n'||ctx.measureText(line+char).width>920){ctx.fillText(line,80,y);y+=size*1.5;line='';if(++n>=maxLines)return y;}if(char!=='\n')line+=char;}if(line){ctx.fillText(line,80,y);y+=size*1.5}return y;}
 function draw(){ctx.fillStyle='#111518';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#e6525c';ctx.fillRect(80,94,80,8);ctx.fillStyle='#fff';ctx.font='bold 48px sans-serif';ctx.fillText('RAVEN',80,175);ctx.fillStyle='#aab0b5';ctx.font='24px sans-serif';ctx.fillText(record?.date||'SECURITY · RISK · OPERATIONS',80,225);ctx.fillStyle='#fff';wrap(area.value,320,38,11);
 const qr=qrcode(0,'M');qr.addData(url);qr.make();const count=qr.getModuleCount(),cell=Math.floor(300/(count+8)),side=(count+8)*cell,x=80,y=990;ctx.fillStyle='#fff';ctx.fillRect(x,y,side,side);ctx.fillStyle='#000';for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))ctx.fillRect(x+(c+4)*cell,y+(r+4)*cell,cell,cell);ctx.fillStyle='#fff';ctx.font='28px sans-serif';ctx.fillText(t('扫码阅读完整内容','Scan to read the full story'),430,1090);ctx.fillStyle='#aab0b5';ctx.font='24px sans-serif';ctx.fillText('www.ravenlong.com',430,1140);}
 draw();area.addEventListener('input',draw);
 function blob(){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Image failed')),'image/png'))}
 button(t('保存二维码分享图','Save QR share image'),async()=>{const href=URL.createObjectURL(await blob());const a=document.createElement('a');a.href=href;a.download='RAVEN-share.png';a.click();setTimeout(()=>URL.revokeObjectURL(href),10000)});
 button(t('手机分享 / IG / 微信','Mobile share / IG / WeChat'),async()=>{const file=new File([await blob()],'RAVEN-share.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title,text:area.value});else if(navigator.share)await navigator.share({title,text:area.value,url});else status.textContent=t('保存分享图后，在 Instagram 或微信中选择图片发布；简介可一键复制。','Save the image and post it in Instagram or WeChat. Copy the introduction above.');});
 const hint=document.createElement('p');hint.textContent=t('Instagram / 微信：保存图片发帖或发朋友圈，扫码即可打开原文。手机分享菜单中的应用取决于设备安装情况。','Instagram / WeChat: save the image to post it. Scan the code for the original page. Available sharing apps depend on your device.');dialog.append(hint,canvas);const link=document.createElement('a');link.href=url;link.textContent=url;link.style.overflowWrap='anywhere';dialog.append(link,status);dialog.showModal();close.focus();
 }
 dialog.addEventListener('close',()=>previous?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 launch.onclick=()=>open(events.find(e=>location.pathname==='/security/'+lang+'/'+e.slug+'/'));
 document.addEventListener('click',e=>{const b=e.target.closest('[data-share-event]');if(b)open(events.find(x=>x.slug===b.dataset.shareEvent));});
}
