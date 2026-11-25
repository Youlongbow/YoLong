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
function frames(){
 const tile=(x,body)=>'<g transform="translate('+x+' 12)"><rect width="92" height="72" rx="3" fill="#34474d" stroke="#82969a"/>'+body+'</g>';
 const p=(x,y)=>'<g transform="translate('+x+' '+y+')" fill="#d7c5a4"><circle cy="-9" r="4"/><path d="M-4-3h8l3 12H-7zM-4 9v10h3V9m2 0v10h3V9"/></g>';
 return tile(9,'<rect x="8" y="8" width="76" height="24" fill="#819899"/><rect x="8" y="47" width="76" height="13" fill="#b0a488"/>'+p(26,37)+p(64,38))+tile(114,'<rect x="10" y="10" width="72" height="21" fill="#7c9095"/><rect x="16" y="45" width="60" height="16" fill="#a3a99c"/>'+p(27,40)+p(65,40))+tile(219,'<path d="M5 66L46 8 87 66" fill="#788d80"/><circle cx="73" cy="14" r="11" fill="#768b6a"/>'+p(28,40)+p(58,43));
}
export function renderSystemStudy(host,system,step,lang,icon){
 if(!host)return;
 const zh=lang==='zh',l=zh?0:1,data=rows[system*4+step];
 host.replaceChildren();if(!data)return;
 const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt)n.textContent=txt;if(cls)n.className=cls;return n};
 const sample=el('div',null,'study-sample'),picture=el('div');
 const scene=system===0&&(step===0||step===2)?frames()+'<g fill="none" stroke="#d4b689" stroke-width="2"><path d="M55 89v20h105v17M160 89v37M265 89v20H160"/><rect x="126" y="126" width="68" height="20" rx="3"/></g>':'<g color="#cdbd9d" transform="translate(72 26) scale(2)">'+(icon||'')+'</g>';
 picture.innerHTML='<svg viewBox="0 0 320 160" aria-hidden="true"><rect width="320" height="160" fill="#18262c"/>'+scene+'</svg>';
 sample.append(el('h4',data[l]),picture,el('p',zh?'业务功能示意':'Illustrative service function'));
 const record=el('div',null,'study-record');record.append(el('h4',zh?'业务与工程记录':'Service and engineering records'),el('strong',data[2+l]),el('p',data[4+l]));host.append(sample,record);
}
