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
 const panel=e('section');panel.className='system-practice';panel.style.cssText='grid-column:1/-1;border:1px solid #46555b;border-radius:6px;padding:14px;margin-top:12px;min-width:0';
 panel.append(e('h4',tr(...s.title)),e('p',system===0?tr('四个独立的虚构图像示例，可选择查看并登记复核。','Four independent fictional image examples; select and review a sample.'):tr('互动演示 · 虚构业务样本','Interactive demonstration · fictional service sample')));
 const tabs=e('div');tabs.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin:8px 0';
 const figure=e('div');figure.style.cssText='background:#18262c;border:1px solid #46555b;border-radius:5px;overflow:hidden';
 const detail=e('p'),state=e('p');state.setAttribute('aria-live','polite');const action=e('button',tr(...s.action));action.type='button';
 const memory=options.memory||{current:0,recorded:new Set()};let current=memory.current;const recorded=memory.recorded;
 const render=()=>{
  tabs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
  const view=system===0?['0 0 320 208',videoWall(current,zh)]:['0 0 320 160',stageScene(system,system===3?(current===2?3:current):current,zh)];
  figure.innerHTML='<svg viewBox="'+view[0]+'" role="img" aria-label="'+tr(...s.names[current])+'" style="display:block;width:100%;max-height:'+(system===0?'360':'200')+'px;background:'+(system===3&&current===1?'#101722':'#253940')+'">'+view[1]+'</svg>';
  detail.textContent=tr(...s.fields[0])+'：'+tr(...s.names[current])+' · '+tr(...s.messages[current]);
  state.textContent=tr(...s.fields[1])+'：'+(recorded.has(current)?tr(...s.result):tr('待登记','Not recorded'));
  memory.current=current;state.dataset.recorded=String(recorded.has(current));action.disabled=recorded.has(current);progress.textContent=tr('本系统已完成记录：','System records completed: ')+recorded.size+' / '+s.names.length;progress.dataset.completed=String(recorded.size);
 };
 s.names.forEach((name,i)=>{const b=e('button',tr(...name));b.type='button';b.onclick=()=>{current=i;render()};tabs.append(b)});
 action.onclick=()=>{recorded.add(current);render()};const reset=e('button',tr('重置演示','Reset demonstration'));reset.type='button';reset.onclick=()=>{recorded.clear();current=0;render()};
 const controls=e('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:8px';controls.append(action,reset);
 const progress=e('p');progress.className='system-practice-progress';
 if(options.locate){const locate=e('button',tr('在综合场景中查看','View in integrated scene'));locate.type='button';locate.dataset.locate='true';locate.onclick=()=>options.locate(current);controls.append(locate);}
 panel.append(tabs,figure,detail,state,controls,progress);host.append(panel);render();
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
 const record=el('div',null,'study-record');record.append(el('h4',zh?'业务与工程记录':'Service and engineering records'),el('strong',data[2+l]),el('p',data[4+l]));host.append(sample,record);systemPractice(host,system,zh,options);
}
