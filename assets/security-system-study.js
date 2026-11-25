// Independent visual learning module for the representative civilian campus.
const rows=[
["图像任务","Image tasks","图像任务清单","Image task register","接待、办公、公共活动是不同的业务图像示例。","Reception, office and shared activity are distinct image-task examples."],
["信息传输","Information service","接口验收","Interface acceptance","核查服务兼容性与可用性。","Review service compatibility and availability."],
["视频管理","Video management","记录交接","Recording handover","明确合法访问、记录用途及保管责任。","Define lawful access, recording purpose and custody."],
["人员评估","Human assessment","服务记录","Service record","明确业务责任及后续服务。","Define accountability and follow-up service."],
["预约接待","Appointment service","预约信息","Appointment information","确认业务联系人与访问目的。","Confirm business contact and purpose."],
["凭证管理","Credential service","授权记录","Authorization record","记录必要信息及凭证管理责任。","Record necessary information and credential ownership."],
["通行设施","Access assemblies","使用验收","Usability review","协调正常使用、可达性与生命安全。","Coordinate use, accessibility and life safety."],
["服务交接","Service handover","完成记录","Completion record","记录服务结果及信息保管责任。","Record outcome and data custody."],
["业务资产","Assets","资产台账","Asset register","明确用途及责任。","Identify use and ownership."],
["完整构件","Complete assembly","工程证据","Engineering evidence","按完整产品核查适用性。","Review suitability as an assembly."],
["建筑使用","Building use","建筑接口","Building interface","协调用途及生命安全。","Coordinate use and life safety."],
["工程维护","Maintenance","维护工单","Work order","记录状态及责任。","Record condition and ownership."],
["公共活动","Shared activity","视觉任务","Visual task","按正常活动定义使用需求。","Define user needs from ordinary activity."],
["灯具系统","Luminaire system","功能验收","Functional acceptance","检查实际服务及维护要求。","Review service and upkeep needs."],
["公共信息","Public information","服务记录","Service record","明确服务责任与可达性。","Define service duties and accessibility."],
["服务维护","Service upkeep","维护记录","Maintenance record","确认功能检查及责任交接。","Confirm functional checks and handover."]];
// Four fictional, independent image samples, not simulated camera coverage.
function videoSample(i){
 const person=(x,y,k='#bfa68e')=>'<g transform="translate('+x+' '+y+')"><circle cy="-12" r="5" fill="#d5b9a1"/><path d="M-6-5H6L9 12H-9Z" fill="'+k+'"/><path d="M-5 12V26H-1V12M1 12V26H5V12" fill="#35444c"/></g>';
 const samples=[
 '<rect width="160" height="100" fill="#abb5b2"/><path d="M0 68H160V100H0Z" fill="#8c9491"/><rect x="10" y="10" width="54" height="45" fill="#577681"/><path d="M37 10V55M10 32H64" stroke="#9daba9" stroke-width="2"/><rect x="88" y="15" width="59" height="27" fill="#354c55"/><rect x="70" y="59" width="77" height="27" rx="2" fill="#b7a58e"/><rect x="67" y="55" width="83" height="6" fill="#d5c7ad"/>'+person(117,43,'#66858d')+person(43,66,'#6d7d79'),
 '<rect width="160" height="100" fill="#a9b7bc"/><path d="M0 60H160V100H0Z" fill="#8b989a"/><rect x="8" y="10" width="144" height="34" fill="#7294a2"/><path d="M48 10V44M95 10V44" stroke="#bdc9c7" stroke-width="2"/><rect x="12" y="64" width="61" height="18" fill="#b7b6a7"/><rect x="87" y="64" width="61" height="18" fill="#b7b6a7"/><rect x="30" y="45" width="27" height="19" rx="2" fill="#3d555f"/><rect x="108" y="45" width="27" height="19" rx="2" fill="#3d555f"/>'+person(77,67,'#829b8e'),
 '<rect width="160" height="100" fill="#91a68d"/><path d="M0 100L54 40H106L160 100" fill="#b3b8aa"/><rect x="6" y="5" width="148" height="32" fill="#bcc7c5"/><rect x="16" y="11" width="25" height="22" fill="#66818b"/><rect x="52" y="11" width="25" height="22" fill="#66818b"/><rect x="90" y="11" width="25" height="22" fill="#66818b"/><circle cx="19" cy="47" r="13" fill="#6c896d"/><circle cx="143" cy="47" r="14" fill="#67836b"/>'+person(62,65,'#738591')+person(101,56,'#c1a67f'),
 '<rect width="160" height="100" fill="#bdc4bc"/><path d="M0 100L0 62L160 42V100Z" fill="#8e9b99"/><rect x="14" y="13" width="49" height="56" fill="#72929b"/><path d="M38 13V69" stroke="#c9d2cf" stroke-width="2"/><rect x="110" y="15" width="31" height="31" fill="#536d77"/><path d="M74 91H151M74 84H151" stroke="#c7c4b3" stroke-width="2"/>'+person(90,56,'#859b91')+person(125,63,'#a59073')
 ];return samples[i]||'';
}
function frames(){
 return [0,1,2,3].map((i)=>'<g transform="translate('+(9+i*76)+' 15)"><rect width="73" height="49" rx="2" fill="#34474d" stroke="#82969a"/><g transform="translate(1 1) scale(.444)">'+videoSample(i)+'</g><text x="36.5" y="62" text-anchor="middle" fill="#dce5e5" font-size="9">CAM 0'+(i+1)+'</text></g>').join('');
}
function videoWall(current,zh){
 const tiles=[0,1,2,3].map(i=>'<g transform="translate('+(8+i*78)+' 8)"><rect width="72" height="49" rx="2" fill="#263940" stroke="'+(i===current?'#e1ba81':'#637b83')+'" stroke-width="'+(i===current?2:1)+'"/><g transform="translate(2 2) scale(.425)">'+videoSample(i)+'</g><text x="36" y="61" text-anchor="middle" font-size="9" fill="#e1e9e8">CAM 0'+(i+1)+'</text></g>').join('');
 return tiles+'<g transform="translate(80 84)">'+videoSample(current)+'</g><rect x="80" y="84" width="160" height="100" fill="none" stroke="#e1ba81"/><text x="160" y="199" text-anchor="middle" fill="#d8e2e1" font-size="10">'+(zh?'当前示例图像':'Selected sample image')+' · CAM 0'+(current+1)+'</text>';
}
function videoFlow(zh){
 const names=zh?['图像采集','传输服务','视频管理','人员评估']:['Capture','Transport','Management','Review'];
 const blocks=names.map((n,i)=>'<g transform="translate('+(7+i*79)+' 30)"><rect width="68" height="45" rx="4" fill="#40565c" stroke="#91a3a4"/><text x="34" y="19" text-anchor="middle" fill="#d7c4a2" font-size="9">0'+(i+1)+'</text><text x="34" y="34" text-anchor="middle" fill="#e9eeee" font-size="10">'+n+'</text></g>').join('');
 return blocks+'<path d="M75 52h11m-4-4 4 4-4 4 M154 52h11m-4-4 4 4-4 4 M233 52h11m-4-4 4 4-4 4 M199 75v23" stroke="#d8be94" stroke-width="2" fill="none"/><rect x="164" y="98" width="71" height="34" rx="4" fill="#40565c" stroke="#91a3a4"/><text x="200" y="119" text-anchor="middle" fill="#e9eeee" font-size="10">'+(zh?'记录与检索':'Records')+'</text>';
}
// Stage-specific service illustrations. Each is independent of the component icon.
function stageScene(system,step,zh){
 const ink='#d7c5a4', muted='#82999e', paper='#30464e', green='#76988a';
 const rect=(x,y,w,h,fill=paper,rx=3)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+muted+'"/>';
 const line=(d)=>'<path d="'+d+'" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
 const label=(x,y,a,b)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="#e1e7e6" font-size="10" font-family="system-ui,sans-serif">'+(zh?a:b)+'</text>';
 const person=(x,y)=>'<g transform="translate('+x+' '+y+')" fill="'+ink+'"><circle cy="-11" r="5"/><path d="M-6-4H6L9 13H-9ZM-5 13V27H-1V13M1 13V27H5V13"/></g>';
 const doc=(x,y)=>rect(x,y,47,55,'#40585f')+line('M'+(x+9)+' '+(y+13)+'h29m-29 10h29m-29 10h19');
 const check=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="12" fill="'+green+'"/>'+line('M'+(x-5)+' '+y+'l4 4 7-8');
 const arrow=(x,y)=>line('M'+x+' '+y+'h24m-6-5 6 5-6 5');
 const monitor=(x,y)=>rect(x,y,74,48)+rect(x+5,y+5,64,33,'#637c80')+line('M'+(x+37)+' '+(y+48)+'v9m-13 0h26');
 const lamp=(x,y)=>line('M'+x+' '+y+'v-52h22')+'<path d="M'+(x+14)+' '+(y-52)+'h20l-3 7h-14z" fill="'+ink+'"/>';
 const stages=[
 ()=>frames()+label(160,105,'四个独立业务图像示例','Four independent image examples'),
 ()=>videoFlow(zh),
 ()=>monitor(20,34)+monitor(102,34)+rect(214,29,67,66)+line('M224 44h47m-47 14h47m-47 14h47')+label(96,119,'视频记录','Video records')+label(247,119,'保管责任','Custody'),
 ()=>monitor(31,35)+person(137,64)+doc(209,35)+check(265,86)+label(68,121,'图像','Image')+label(137,121,'人员','Staff')+label(233,121,'记录','Record'),
 ()=>person(37,55)+rect(73,45,73,37)+person(168,55)+doc(233,30)+label(105,119,'接待服务','Reception')+label(257,119,'预约信息','Appointment'),
 ()=>rect(29,37,95,58)+rect(39,48,23,26,muted)+line('M70 55h43m-43 10h33m-33 10h24')+arrow(139,66)+doc(197,34)+check(263,71)+label(76,119,'凭证','Credential')+label(230,119,'授权记录','Authorization'),
 ()=>rect(27,23,113,95)+rect(52,33,63,85,'#587278')+line('M103 75h6')+person(169,63)+rect(220,35,67,58)+line('M229 62h49m-24-15v30')+label(84,140,'通行构件','Assembly')+label(254,119,'使用验收','Use review'),
 ()=>person(42,58)+doc(90,35)+arrow(151,62)+doc(196,35)+check(268,75)+label(116,120,'交接','Handover')+label(220,120,'完成记录','Completion'),
 ()=>rect(20,31,101,64)+rect(34,45,32,36,muted)+rect(74,45,32,36)+doc(145,35)+doc(212,35)+label(70,120,'设施资产','Assets')+label(202,120,'资产台账','Register'),
 ()=>rect(25,27,106,78)+line('M36 40h84v52H36zM52 40v52M75 40v52M98 40v52')+doc(181,35)+check(258,70)+label(78,126,'完整构件','Assembly')+label(212,126,'工程证据','Evidence'),
 ()=>rect(25,25,120,88)+rect(67,53,38,60,'#5d757a')+person(169,66)+doc(230,34)+label(85,136,'建筑使用','Building use')+label(252,115,'接口记录','Interface'),
 ()=>rect(25,32,95,65)+line('M39 46h67m-67 17h67m-67 17h67')+person(157,63)+doc(220,34)+check(281,78)+label(74,119,'构件状态','Condition')+label(245,119,'维护工单','Work order'),
 ()=>rect(18,76,284,28,'#526d66')+person(57,62)+person(139,62)+person(239,62)+label(160,127,'公共活动与视觉需求','Shared activity and visual needs'),
 ()=>lamp(70,100)+lamp(160,100)+lamp(250,100)+line('M25 102h270')+label(160,127,'灯具及使用功能','Luminaires and service'),
 ()=>rect(26,30,107,62)+line('M38 46h83m-83 14h62m-62 14h70')+person(164,60)+doc(230,34)+label(80,120,'公共信息','Public information')+label(252,120,'服务记录','Record'),
 ()=>lamp(62,102)+person(123,62)+doc(206,32)+check(273,72)+label(89,128,'功能检查','Service check')+label(230,128,'维护记录','Upkeep record')
 ];
 return stages[system*4+step]?.()||'';
}

// Public workplace visitor-service illustrations. Not a floor plan or a live access-control system.
// Isometric public reception exhibit: ordinary furniture, people and service functions.
function visitorScene(i,zh){
 const p=(x,y,z=0)=>[160+(x-y)*.83,116+(x+y)*.40-z];
 const polygon=(pts,fill,stroke='none')=>'<polygon points="'+pts.map(v=>v.map(n=>n.toFixed(1)).join(',')).join(' ')+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width=".55"/>';
 const cuboid=(x,y,w,d,h,color,z=0,selected=false)=>{
  const a=p(x,y,z),b=p(x+w,y,z),c=p(x+w,y+d,z),e=p(x,y+d,z);
  const A=p(x,y,z+h),B=p(x+w,y,z+h),C=p(x+w,y+d,z+h),E=p(x,y+d,z+h);
  const shades=color.map(k=>selected?k.replace(/^#.*$/, '#c6a77a'):k);
  return polygon([e,c,C,E],shades[1])+polygon([b,c,C,B],shades[2])+polygon([A,B,C,E],shades[0],selected?'#f3d9ab':'#76858a');
 };
 const person=(x,y,coat,seated=false)=>{
  const [px,py]=p(x,y);
  return '<g transform="translate('+px+' '+py+')"><ellipse cy="1" rx="9" ry="3" fill="#26343b" opacity=".4"/><path d="M-5 -18L-6 -1H-2L0-15L3-1H7L5-18Z" fill="#46575d"/><path d="M-8 -34Q0 -39 8 -34L10 -17H-10Z" fill="'+coat+'"/><circle cy="-43" r="7" fill="#c7ac95"/>'+(seated?'<path d="M-10 -3A12 12 0 1 1 12 -3" fill="none" stroke="#71868c" stroke-width="2"/>':'')+'</g>';
 };
 const tile=(x,y,w,d,fill)=>polygon([p(x,y),p(x+w,y),p(x+w,y+d),p(x,y+d)],fill);
 let v='<rect width="320" height="220" fill="#202e35"/>';
 v+=tile(-88,-83,176,166,'#a6aaa1');
 // Decorative tile joints provide depth without implying a building plan.
 for(let x=-88;x<=88;x+=22){const [ax,ay]=p(x,-83),[bx,by]=p(x,83);v+='<path d="M'+ax+' '+ay+'L'+bx+' '+by+'" stroke="#818e88" stroke-width=".5"/>'}
 for(let y=-83;y<=83;y+=22){const [ax,ay]=p(-88,y),[bx,by]=p(88,y);v+='<path d="M'+ax+' '+ay+'L'+bx+' '+by+'" stroke="#818e88" stroke-width=".5"/>'}
 // Furniture exhibit: a normal-height worktop and a lower public-service surface.
 v+=person(-34,-51,'#537785');
 v+=cuboid(-51,-38,75,25,38,['#d2c9b9','#968879','#aa9d89'],0,i===0);
 v+=cuboid(-51,-40,77,29,4,['#e4ddcf','#b0a69a','#c3b9a8'],38,i===0);
 v+=cuboid(24,-38,35,25,27,['#c8bcaa','#8e8274','#ac9e8d'],0,i===2);
 v+=cuboid(24,-40,37,29,4,['#e4ddcf','#aea79a','#beb5a7'],27,i===2);
 v+=cuboid(-23,-35,24,5,17,['#7f969e','#3a4c53','#51656d'],42,i===1);
 v+=cuboid(-10,-29,15,9,2,['#74868b','#485b62','#52646b'],42);
 v+=cuboid(-67,31,34,18,13,['#77908b','#536d69','#64807a']);
 v+=cuboid(-67,30,34,4,15,['#8ca19a','#536d69','#64807a'],13);
 v+=cuboid(-67,52,34,18,13,['#77908b','#536d69','#64807a']);
 v+=cuboid(-67,51,34,4,15,['#8ca19a','#536d69','#64807a'],13);
 v+=person(-6,6,'#a29582');
 v+=person(43,7,'#7a968e',true);
 v+=person(-41,54,'#9ca4a1');
 const captions=zh?['接待沟通与服务需求','凭证及信息管理界面','无障碍使用与服务交接']:['Reception and service needs','Credential and information service','Accessible service and handover'];
 v+='<rect x="8" y="188" width="304" height="24" rx="3" fill="#32444c"/><text x="160" y="204" text-anchor="middle" fill="#e4ebeb" font-size="10" font-family="system-ui,sans-serif">'+captions[i]+'</text>';
 return v;
}
// Independent practice consoles; all records and illustrations are fictional.
function systemPractice(host,system,zh,options={}){
 const e=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
 const tr=(a,b)=>zh?a:b;
 const specs=[
 {title:['视频监控工作站','Video review workstation'],names:[['接待区','Reception'],['办公区','Office'],['公共活动区','Shared activity'],['公共通行空间','Shared circulation']],messages:[['访客正在接待柜台办理业务。','A visitor is being served at the reception counter.'],['员工正在办公区域开展日常工作。','Staff are conducting routine office work.'],['人员正在公共区域活动。','People are using a shared space.'],['人员正在建筑公共通行空间正常活动。','People are using ordinary shared circulation space.']],fields:[['图像来源','Image source'],['图像复核','Image review']],action:['登记图像复核','Record image review'],result:['已登记：图像来源、正常业务活动、复核责任。','Recorded: image source, ordinary activity and review ownership.']},
 {title:['访客接待服务台','Visitor reception console'],names:[['预约信息','Appointment'],['凭证信息','Credential'],['访问结束','Visit completion']],messages:[['已安排的业务访问：确认业务联系人及预约信息。','Scheduled visit: confirm host and appointment information.'],['查看虚构的访客凭证及登记用途。','Review the sample visitor credential and registration purpose.'],['访问结束后登记服务完成与凭证交接。','Record service completion and credential handover.']],fields:[['当前业务环节','Service stage'],['接待记录','Reception record']],action:['登记当前环节','Record this stage'],result:['当前服务环节已记录。','This service stage has been recorded.']},
 {title:['围界设施工程台账','Boundary assembly register'],names:[['围界资产','Boundary assets'],['构件交付','Assembly handover'],['维护记录','Maintenance record']],messages:[['核对资产名称与设施管理责任。','Review asset identity and facility ownership.'],['查看完整构件的工程验收记录。','Review assembly-level engineering acceptance evidence.'],['登记日常检查及维护工单。','Record routine inspection and upkeep orders.']],fields:[['工程记录','Engineering record'],['复核状态','Review status']],action:['登记复核','Record review'],result:['已登记本项工程资料复核。','Engineering-record review has been recorded.']},
 {title:['公共照明服务面板','Public lighting service panel'],names:[['日间公共活动','Daytime activity'],['夜间公共活动','Evening activity'],['维护交接','Maintenance handover']],messages:[['观察日间公共活动的视觉需求。','Observe the visual needs of daytime shared activity.'],['观察夜间照明服务的概念状态。','Observe a conceptual evening lighting service state.'],['确认设施维护及功能检查记录。','Confirm upkeep and functional inspection records.']],fields:[['服务状态','Service state'],['功能记录','Function record']],action:['记录功能检查','Record service check'],result:['已登记功能检查及维护交接。','Service check and maintenance handover recorded.']}
 ];
 const s=specs[system];if(!s)return;
 const panel=e('section');panel.className='system-practice';if(system===0)panel.className+=' video-console';if(system===1)panel.className+=' access-console';panel.style.cssText='grid-column:1/-1;border:1px solid #46555b;border-radius:6px;padding:14px;margin-top:12px;min-width:0';
 panel.append(e('h4',tr(...s.title)),e('p',system===0?tr('四个独立绘制的虚构业务图像。编号用于对应三维示意设备，图像不属于实际摄像机画面。','Four independently drawn fictional business images. IDs link to illustrative assemblies; these are not actual camera feeds.'):tr('互动演示 · 虚构业务样本','Interactive demonstration · fictional service sample')));
 const tabs=e('div');tabs.style.cssText=system===0?'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0;min-width:0':'display:flex;gap:6px;flex-wrap:wrap;margin:8px 0';
 const figure=e('div');figure.className='practice-figure';figure.style.cssText='background:#18262c;border:1px solid #46555b;border-radius:5px;overflow:hidden';
 const detail=e('p'),state=e('p');state.setAttribute('aria-live','polite');const action=e('button',tr(...s.action));action.type='button';
 const memory=options.memory||{current:0,recorded:new Set()};let current=memory.current;const recorded=memory.recorded;
 const render=()=>{
  tabs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
  const view=system===0?['0 0 160 100',videoSample(current)]:[system===1?'0 0 320 220':'0 0 320 160',system===1?visitorScene(current,zh):stageScene(system,system===3?(current===2?3:current):current,zh)];
  figure.innerHTML='<svg viewBox="'+view[0]+'" role="img" aria-label="'+tr(...s.names[current])+'" style="display:block;width:100%;max-height:'+(system===0?'460':system===1?'340':'200')+'px;background:'+(system===3&&current===1?'#101722':'#253940')+'">'+view[1]+'</svg>';
  if(system===0){figure.dataset.channel=String(current);const title=e('div','CAM 0'+(current+1)+' / '+tr(...s.names[current]));title.style.cssText='padding:9px 12px;font-weight:650;color:#e5eaea;border-top:1px solid #46555b;font-size:13px';figure.append(title)}
  detail.textContent=tr(...s.fields[0])+'：'+tr(...s.names[current])+' · '+tr(...s.messages[current]);
  state.textContent=tr(...s.fields[1])+'：'+(recorded.has(current)?tr(...s.result):tr('待登记','Not recorded'));
  memory.current=current;state.dataset.recorded=String(recorded.has(current));action.disabled=recorded.has(current);progress.textContent=tr('本系统已完成记录：','System records completed: ')+recorded.size+' / '+s.names.length;progress.dataset.completed=String(recorded.size);
 };
 s.names.forEach((name,i)=>{const b=e('button',system===0?undefined:tr(...name));b.type='button';
  if(system===0){b.className='video-channel';b.style.cssText='display:block;text-align:left;padding:3px;min-width:0;border-radius:4px;overflow:hidden;';b.setAttribute('aria-label','CAM 0'+(i+1)+' / '+tr(...name));
   const thumb=e('div');thumb.innerHTML='<svg viewBox="0 0 160 100" aria-hidden="true" style="display:block;width:100%;height:auto;border-radius:2px">'+videoSample(i)+'</svg>';
   const caption=e('span','CAM 0'+(i+1)+' / '+tr(...name));caption.style.cssText='display:block;padding:5px 3px;font-size:11px;line-height:1.3;overflow-wrap:anywhere';b.append(thumb,caption);}
  b.onclick=()=>{current=i;render();options.onSelect?.(i)};tabs.append(b)});
 action.onclick=()=>{recorded.add(current);render()};const reset=e('button',tr('重置演示','Reset demonstration'));reset.type='button';reset.onclick=()=>{recorded.clear();current=0;render();options.onSelect?.(0)};
 const controls=e('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:8px';controls.append(action,reset);
 const progress=e('p');progress.className='system-practice-progress';
 if(options.locate){const locate=e('button',tr('在综合场景中查看','View in integrated scene'));locate.type='button';locate.dataset.locate='true';locate.onclick=()=>options.locate(current);controls.append(locate);}
 if(system===0){
  const wall=e('div');wall.className='video-wall-layout';wall.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:start;gap:12px;min-width:0;margin:12px 0';
  const grid=e('div');grid.style.minWidth='0';const gridTitle=e('h5',tr('全部图像样本','All image samples'));gridTitle.style.cssText='margin:0 0 8px;font-size:13px';grid.append(gridTitle,tabs);
  const main=e('div');main.style.minWidth='0';const mainTitle=e('h5',tr('当前选中图像','Selected image'));mainTitle.style.cssText='margin:0 0 8px;font-size:13px';main.append(mainTitle,figure);
  wall.append(grid,main);panel.append(wall,detail,state,controls,progress);
 }else if(system===1){
  const journey=e('div');journey.className='visitor-journey';journey.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px;align-items:start';
  tabs.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:7px;margin:0 0 10px';tabs.style.gridColumn='1/-1';const copy=e('div');copy.append(detail,state,controls,progress);journey.append(tabs,figure,copy);panel.append(journey);
 }else panel.append(tabs,figure,detail,state,controls,progress);host.append(panel);render();
}

// Professional notes for the civilian workplace example. Requirements are agreed with the service owner.
const videoReviewNotes=[
 {title:['从业务需求定义图像用途','Define the purpose of images'],rows:[
 [['需求','Requirement'],['明确使用图像要完成的业务任务、责任方及使用理由。','Define the business task, accountable owner and legitimate reason for using images.']],
 [['设计评审','Design review'],['比较固定式、球型与可转动设备的基本使用特点，并结合环境、维护与个人隐私审查适用性。','Compare general characteristics of fixed, dome and movable devices; review suitability against environment, upkeep and privacy.']],
 [['验收依据','Acceptance evidence'],['经批准的业务需求、图像使用政策及样本图像复核记录。','Approved business requirements, image-use policy and sample-image review.']]]},
 {title:['理解信息服务与系统接口','Understand information services and interfaces'],rows:[
 [['需求','Requirement'],['图像信息应在经授权的业务终端得到正确处理与呈现。','Image information should be correctly processed and presented at authorized service terminals.']],
 [['设计评审','Design review'],['明确设备与应用兼容性、信息保密及系统维护责任，协调设施和信息技术部门。','Define device/application compatibility, information confidentiality and maintenance ownership with facilities and IT.']],
 [['验收依据','Acceptance evidence'],['接口清单、功能测试记录、信息管理责任与服务交接文件。','Interface register, functional test records, information ownership and service handover documents.']]]},
 {title:['区分视频管理与记录服务','Distinguish video management from record services'],rows:[
 [['需求','Requirement'],['授权用户能够按业务目的查看及检索所需记录。','Authorized users can view and retrieve records required for their legitimate tasks.']],
 [['设计评审','Design review'],['视频管理平台承担查看与管理功能，记录服务承担保存与检索。按业务目的及适用规则定义保留期限、使用权限和交接。','The video platform provides viewing and management; recording services support storage and retrieval. Define retention, access rights and handover according to purpose and applicable rules.']],
 [['验收依据','Acceptance evidence'],['使用权限清单、检索功能测试、记录保留及删除政策。','Authorized-use register, retrieval tests, retention and deletion policy.']]]},
 {title:['将图像信息转化为负责的业务行动','Translate image information into accountable action'],rows:[
 [['需求','Requirement'],['图像由具备相应职责的人员复核，依据事实记录并协调后续业务。','Responsible staff review images, record facts and coordinate follow-up.']],
 [['设计评审','Design review'],['重视显示界面可读性、人员培训、信息交接、隐私及审计责任。','Review display readability, staff training, information handover, privacy and audit ownership.']],
 [['验收依据','Acceptance evidence'],['操作培训记录、经批准的程序、服务演练记录及管理复核。','Training records, approved procedures, service exercises and management review.']]]}
];
function addVideoReview(host,step,zh){
 const d=videoReviewNotes[step];if(!d)return;const l=zh?0:1;
 const el=(tag,txt)=>{const n=document.createElement(tag);n.textContent=txt;return n};
 const panel=document.createElement('section');panel.className='video-engineering-review';panel.style.cssText='grid-column:1/-1;border-top:1px solid #52626a;padding:14px 0 4px;min-width:0';
 panel.append(el('h4',d.title[l]));
 const dl=document.createElement('dl');dl.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);gap:5px;margin:8px 0';
 for(const [key,copy] of d.rows){const dt=el('dt',key[l]),dd=el('dd',copy[l]);dt.style.cssText='font-weight:650;color:#d7bb93';dd.style.cssText='margin:0 0 9px;line-height:1.65';dl.append(dt,dd)}
 panel.append(dl);const ref=el('a',zh?'NPSA：工作场所 CCTV 指导（英文 PDF）':'NPSA: CCTV in the Workplace (PDF)');ref.href='https://www.npsa.gov.uk/system/files/documents/a7/eb/20200203%20CCTV%20in%20the%20Workplace.pdf';ref.target='_blank';ref.rel='noopener noreferrer';panel.append(ref);host.append(panel);
}

const accessReviewNotes=[
 ['业务需求与接待方式','Business needs and reception','区分员工、访客及服务人员的正常使用需求；考虑无障碍、服务能力及个人信息保护。','Consider ordinary needs of employees, visitors and service staff, accessibility, service capacity and privacy.','经批准的业务需求与用户体验评审。','Approved requirements and user experience review.'],
 ['凭证与信息管理','Credentials and information','区分凭证载体、读取设备、信息服务和管理职责；依据业务目的确定资料使用规则。','Distinguish credential media, readers, information services and ownership; define data-use rules from business purposes.','凭证管理政策、授权责任及信息处理记录。','Credential policy, accountable ownership and information handling records.'],
 ['通行构件与建筑接口','Access assemblies and building interfaces','门体、建筑五金、电子设备与人员使用需求共同接受评审；确保适用的消防、无障碍及产品要求得到落实。','Review doors, architectural hardware, electronics and user needs together; address applicable fire, accessibility and product requirements.','完整构件资料、制造商文件及使用验收记录。','Assembly documents, manufacturer information and usability acceptance records.'],
 ['运行与维护交接','Operation and maintenance handover','明确培训、服务责任、例行维护及变更管理；将设施与信息技术部门的交付职责协调一致。','Define training, service ownership, routine upkeep and change management; coordinate facilities and IT handover.','培训、维护记录及交付验收资料。','Training, maintenance and handover acceptance evidence.']
];
function addAccessReview(host,step,zh){
 const d=accessReviewNotes[step];if(!d)return;const l=zh?0:1;
 const el=(tag,txt)=>{const n=document.createElement(tag);n.textContent=txt;return n};
 const panel=document.createElement('section');panel.className='access-engineering-review';panel.style.cssText='grid-column:1/-1;border-top:1px solid #52626a;padding:14px 0;min-width:0';
 panel.append(el('h4',d[l]));const dl=document.createElement('dl');
 for(const [k,v] of [[zh?'设计评审':'Design review',d[2+l]],[zh?'验收依据':'Acceptance evidence',d[4+l]]]){dl.append(el('dt',k),el('dd',v))}
 panel.append(dl);const ref=el('a',zh?'NPSA 自动出入口控制系统用户指南 EIS0002':'NPSA User Guide on Automatic Access Control Systems EIS0002');ref.href='https://www.npsa.gov.uk/system/files/documents/eis0002-user-guide-on-automatic-access-control-systems.pdf';ref.target='_blank';ref.rel='noopener noreferrer';panel.append(ref);host.append(panel);
}

export function renderSystemStudy(host,system,step,lang,icon,options={}){
 if(!host)return;
 const zh=lang==='zh',l=zh?0:1,data=rows[system*4+step];
 host.replaceChildren();if(!data)return;
 const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt)n.textContent=txt;if(cls)n.className=cls;return n};
 const sample=el('div',null,'study-sample'),picture=el('div');
 const scene=stageScene(system,step,zh);
 picture.innerHTML='<svg viewBox="0 0 320 160" aria-hidden="true"><rect width="320" height="160" fill="#18262c"/>'+scene+'</svg>';
 sample.append(el('h4',data[l]),picture,el('p',zh?'业务功能示意':'Illustrative service function'));
 const record=el('div',null,'study-record');record.append(el('h4',zh?'业务与工程记录':'Service and engineering records'),el('strong',data[2+l]),el('p',data[4+l]));host.append(sample,record);if(system===0)addVideoReview(host,step,zh);if(system===1)addAccessReview(host,step,zh);systemPractice(host,system,zh,options);
}
