// Fictional industry-specific operating decisions and evidence; no site-specific design.
const cases=[
 [
  "炼油厂围界设施检修",
  "Refinery boundary maintenance",
  "更换室外围界构件时，工艺部门提出环境适用性要求。",
  "An outdoor boundary assembly is due for replacement; process engineering raises environmental suitability requirements.",
  "按原采购清单直接替换",
  "Replace from the previous purchase list",
  "先确认环境分类、材料和完整构件的适用性",
  "Review environmental classification, materials and assembly suitability first",
  1,
  "采购型号相同仍需要完成工程适用性确认。",
  "The purchase model alone does not establish engineering suitability.",
  "工艺安全确认 → 设施工程审核 → 安保确认需求 → 联合验收",
  "Process-safety review → facilities review → security requirement → joint acceptance",
  "环境适用性、材料与涂层、工程验收记录",
  "Environmental suitability, materials/coatings and acceptance records"
 ],
 [
  "炼油厂承包商检修到访",
  "Refinery contractor servicing",
  "承包商已完成访客登记，准备开展工艺设备检修。",
  "A contractor has registered and is preparing for process-equipment maintenance.",
  "由业务负责人协调独立的工艺作业许可",
  "Business owner coordinates separate process-work authorization",
  "以访客登记代替作业许可",
  "Treat visitor registration as the work permit",
  0,
  "人员通行授权与工艺作业许可由不同业务环节管理。",
  "Personnel access and process-work authorization are separate business controls.",
  "任务确认 → 到访登记 → 工艺许可 → 工作交接",
  "Assignment → arrival registration → process permit → handover",
  "任务单、培训记录、作业许可、交接记录",
  "Assignment, induction, permit and handover records"
 ],
 [
  "炼油厂轮班住宿",
  "Refinery shift accommodation",
  "检修期间轮班人员临时增加，住宿与餐饮服务需要调整。",
  "Additional shift workers during maintenance require adjusted lodging and meals.",
  "直接按原床位安排",
  "Keep the previous accommodation allocation",
  "按实际入住人数协调住宿、消防及餐饮服务",
  "Coordinate occupancy, fire safety and meals around actual staffing",
  1,
  "轮班安排改变了建筑使用与生活服务负荷。",
  "Shift arrangements change occupancy and welfare demand.",
  "入住需求 → 房间安排 → 设施与消防检查 → 服务交接",
  "Occupancy demand → allocation → facilities/fire review → welfare handover",
  "入住台账、建筑检查、餐饮计划",
  "Occupancy register, building inspection and meal plan"
 ],
 [
  "矿山用地与设施管理",
  "Mine land and facilities",
  "露天采矿范围随开发阶段变化，设施台账需要更新。",
  "The working area changes with mine development and the facility register needs updating.",
  "区分矿权范围、实际作业范围与设施责任",
  "Distinguish tenure, working area and facility ownership",
  "沿用旧项目用地清单",
  "Reuse the old property inventory",
  0,
  "矿权、实际生产范围及设施管理职责是不同的管理对象。",
  "Tenure, active workings and managed facilities are distinct responsibilities.",
  "工程资料 → 用地确认 → 设施登记 → 维护安排",
  "Engineering information → land confirmation → asset register → maintenance",
  "用地记录、工程环境资料、设施责任台账",
  "Land records, engineering conditions and facility ownership"
 ],
 [
  "矿山物资交接",
  "Mine material custody",
  "重型车辆送达一批维修物资，仓储与生产部门均参与接收。",
  "A heavy vehicle delivers maintenance materials for warehouse and production teams.",
  "由运输司机自行确认完成",
  "Let the driver alone confirm delivery",
  "由接收部门核对货物与运输记录并签收",
  "Receiving department checks delivery records and accepts custody",
  1,
  "物资交接需要明确实际接收人和记录责任。",
  "Material handover requires an identified receiving party and custody record.",
  "运输任务 → 货物核对 → 接收签字 → 台账更新",
  "Transport assignment → goods check → receipt → inventory update",
  "运输单、签收记录、库存变动",
  "Transport order, receipt and stock change"
 ],
 [
  "矿山偏远营地",
  "Remote mine camp",
  "生活设施报修，同时后勤收到员工住宿服务需求。",
  "Welfare facilities require repair while logistics receives accommodation requests.",
  "协调设施维修、生活服务与通信供电责任",
  "Coordinate repair, welfare and utility responsibilities",
  "仅记录住宿人数",
  "Record occupancy only",
  0,
  "偏远驻地的生活服务需要明确维修和公共服务交接。",
  "Remote welfare requires coordinated repair and shared-service handover.",
  "需求登记 → 维修分工 → 生活服务协调 → 关闭工单",
  "Request → repair assignment → welfare coordination → close work order",
  "设施工单、住宿台账、服务确认",
  "Maintenance orders, occupancy register and service confirmation"
 ],
 [
  "光伏分散资产运维",
  "Distributed PV asset servicing",
  "不同设备的维修记录来自多个运维班组。",
  "Several O&M teams submit maintenance records for different equipment.",
  "按班组统一合并，忽略设备编号",
  "Merge by team without asset identifiers",
  "按设备标识对应工单、状态和维护责任",
  "Associate work orders, condition and ownership with asset identifiers",
  1,
  "分散资产的状态与工作记录需要能够对应到具体设备。",
  "Distributed equipment records need traceable asset identities.",
  "资产标识 → 工单确认 → 状态登记 → 运维复核",
  "Asset identity → work order → condition record → O&M review",
  "资产编号、工单、设备状态",
  "Asset IDs, work orders and equipment condition"
 ],
 [
  "光伏运维车辆服务",
  "PV maintenance arrivals",
  "运维人员携带备件到场，需要完成设备交接。",
  "Maintenance personnel arrive with spare parts requiring handover.",
  "核对工作任务、备件记录和接收责任",
  "Check work assignment, spare-part record and receiving responsibility",
  "只核对车辆到访信息",
  "Check vehicle arrival only",
  0,
  "到访与备件交接是两项不同的业务记录。",
  "Arrival and parts custody are distinct business records.",
  "运维任务 → 到访确认 → 备件交接 → 工单归档",
  "O&M assignment → arrival → parts handover → archive",
  "工单、备件记录、接收确认",
  "Work order, spare-parts record and receipt"
 ],
 [
  "光伏运维驻点工具管理",
  "PV service-base tool custody",
  "一组工具在白班领出，下一班需要继续使用。",
  "Tools issued to the day shift are needed by the next shift.",
  "只在月底进行盘点",
  "Wait for month-end inventory",
  "登记领用归还、工具状态及交接",
  "Record issue, return, tool condition and handover",
  1,
  "轮班共享工具需要可追溯的保管与状态记录。",
  "Shared tools need traceable custody and condition records.",
  "工单 → 工具领用 → 作业归还 → 状态检查",
  "Work order → tool issue → return → condition check",
  "领用记录、归还记录、维修工单",
  "Issue log, return log and repair order"
 ],
 [
  "发电厂计划检修",
  "Power station outage maintenance",
  "运行部门安排停机检修，设施设备需要同步检查。",
  "Operations schedules an outage and related facility servicing.",
  "协调停机窗口、电气工程要求和设施验收",
  "Coordinate outage window, electrical engineering and acceptance",
  "仅按行政检修日历开展",
  "Follow the administrative calendar only",
  0,
  "设施检修需要与运行及电气专业接口衔接。",
  "Facilities servicing needs operational and electrical engineering coordination.",
  "运行计划 → 电气工程确认 → 设施检查 → 验收",
  "Operations plan → electrical review → facilities inspection → acceptance",
  "停机计划、工程确认、验收记录",
  "Outage plan, engineering confirmation and acceptance"
 ],
 [
  "发电厂轮班与检修人员",
  "Power station workforce arrivals",
  "临时检修人员具备访客授权，需要参加设备检修。",
  "Temporary servicing staff have visitor authorization and are due to work on equipment.",
  "以访客授权作为专业资格",
  "Use visitor authorization as professional qualification",
  "分别核查业务授权与电气作业资格",
  "Review business authorization and electrical-work qualification separately",
  1,
  "正常通行与专业作业资格分别管理。",
  "Routine access and professional work qualification are managed separately.",
  "任务确认 → 到访授权 → 资格核查 → 运行交接",
  "Assignment → arrival authorization → qualification → operations handover",
  "授权记录、资格证明、运行交接",
  "Authorization, qualifications and operational handover"
 ],
 [
  "发电厂值班生活保障",
  "Power station shift welfare",
  "轮班调整后，夜间生活服务需求增加。",
  "Shift changes increase demand for overnight welfare services.",
  "依据值班与入住记录安排生活设施及服务",
  "Arrange welfare and facilities using shift and occupancy records",
  "按白班服务计划继续执行",
  "Keep daytime service arrangements unchanged",
  0,
  "值班时段与实际入住情况决定生活服务需求。",
  "Duty hours and occupancy determine welfare requirements.",
  "值班计划 → 入住确认 → 生活设施检查 → 服务交接",
  "Shift plan → occupancy → welfare checks → handover",
  "值班表、入住记录、设施检查与交接",
  "Shift roster, occupancy, facilities inspection and handover"
 ]
];
export function renderCaseExercise(host,scene,zone,lang){
 const d=cases[scene*3+zone];if(!host||!d)return;const z=lang==='zh',l=z?0:1;
 const make=(tag,txt)=>{const e=document.createElement(tag);if(txt)e.textContent=txt;return e};
 const panel=make('section');panel.className='case-pilot industry-exercise';panel.dataset.caseId=String(scene*3+zone);panel.append(make('label',z?'业务模拟 · 选择处置方式':'Practice · choose an operating response'),make('h4',d[l]),make('p',d[2+l]));
 const buttons=make('div');buttons.style.cssText='display:grid;gap:8px;margin:10px 0';const feedback=make('div');feedback.setAttribute('aria-live','polite');
 const options=[d[4+l],d[6+l]];options.forEach((label,i)=>{const b=make('button',label);b.type='button';b.style.cssText='text-align:left;white-space:normal;padding:10px';b.setAttribute('aria-pressed','false');b.onclick=()=>{buttons.querySelectorAll('button').forEach((x,j)=>x.setAttribute('aria-pressed',String(j===i)));feedback.replaceChildren();const correct=i===d[8];feedback.dataset.result=correct?'correct':'review';feedback.append(make('strong',correct?(z?'符合业务要求':'Meets operating requirements'):(z?'重新考虑':'Review the choice')),make('p',d[9+l]));if(correct){feedback.append(make('label',z?'业务流程':'Workflow'),make('p',d[11+l]),make('label',z?'交付记录':'Deliverable records'),make('p',d[13+l]));}};buttons.append(b)});panel.append(buttons,feedback);host.append(panel);
}


// Public industry context illustrations. These are independent production exhibits, not facility plans.
const industryContext=[
 {name:['炼油厂 · 连续工艺','Refinery · continuous process'],tags:[['储罐','Storage vessels'],['工艺设备','Process equipment'],['检修与交接','Maintenance and handover']],note:['连续工艺生产需要工艺、设备、检修和人员服务之间的协调。','Continuous-process operations coordinate production, equipment, maintenance and staff services.']},
 {name:['矿山 · 露天采矿与物料','Mine · extraction and materials'],tags:[['采掘','Extraction'],['物料运输','Material transport'],['设备服务','Equipment services']],note:['采掘、运输及维修服务随生产阶段变化；设施管理需要跟进业务需求。','Extraction, haulage and maintenance change with production phases; facilities management follows operational needs.']},
 {name:['光伏 · 分布式发电设备','Solar PV · distributed equipment'],tags:[['光伏组件','PV modules'],['电气设备','Electrical equipment'],['运维服务','O&M services']],note:['分布式发电设备的管理涉及资产登记、工单、备件及电气专业服务。','Distributed generation involves asset records, work orders, spares and specialist electrical services.']},
 {name:['电站 · 发电与设备服务','Power station · generation and services'],tags:[['发电厂房','Generation building'],['冷却设施','Cooling equipment'],['轮班与检修','Shift and maintenance']],note:['发电生产、设备检修与轮班人员服务需要协调管理。','Generation, equipment servicing and shift-worker services require coordinated ownership.']}
];
function industryIllustration(i){
 const rect=(x,y,w,h,col)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="'+col+'"/>';
 const line=(d,col='#aebcba',w=1.2)=>'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"/>';
 const cyl=(x,y,w,h)=>rect(x-w/2,y,w,h,'#9aa9ab')+'<ellipse cx="'+x+'" cy="'+y+'" rx="'+w/2+'" ry="7" fill="#c0c9c7"/>'+line('M'+(x-w/2)+' '+(y+h*.55)+'h'+w,'#75878a');
 const building=(x,y,w,h)=>rect(x,y,w,h,'#9faea9')+'<path d="M'+(x-4)+' '+y+'L'+(x+w/2)+' '+(y-13)+'L'+(x+w+4)+' '+y+'Z" fill="#72858a"/>'+rect(x+9,y+12,w*.23,h*.47,'#45636f');
 const base='<rect width="320" height="130" fill="#263840"/><path d="M8 108H312" stroke="#84928e" stroke-width="1"/>';
 const views=[
 ()=>base+cyl(48,66,43,42)+cyl(101,57,49,51)+cyl(178,27,20,81)+cyl(211,43,18,65)+line('M151 48h86M151 71h86M151 94h86','#9ca9a7',2)+building(251,75,54,33),
 ()=>base+'<path d="M13 40L75 61L94 78H146L159 93H182L194 108H13Z" fill="#b29e83"/>'+line('M13 58H62L82 76H121M13 80H77L100 94H153','#d4bea0',2)+rect(201,80,81,19,'#bda069')+rect(202,65,26,25,'#c6a873')+rect(232,70,50,20,'#a18a64')+['218','271'].map(x=>'<circle cx="'+x+'" cy="101" r="10" fill="#3c4a50" stroke="#829092" stroke-width="2"/>').join(''),
 ()=>{let v=base;for(let row=0;row<2;row++)for(let col=0;col<3;col++){let x=14+col*72+row*14,y=39+row*33;v+='<path d="M'+x+' '+y+'h58l-8 24h-58z" fill="#3e647c" stroke="#a0b1b6"/>'+line('M'+(x+14)+' '+y+'l-8 24m22-24-8 24m22-24-8 24M'+(x-4)+' '+(y+12)+'h58','#8ca6ad',.6);}return v+rect(251,52,48,56,'#aeb9b6')+rect(260,61,30,22,'#5e777c');},
 ()=>base+building(20,63,140,45)+'<path d="M186 108Q208 68 192 28H234Q217 68 242 108Z" fill="#9ba8a5"/><ellipse cx="213" cy="28" rx="21" ry="5" fill="#c1cac5"/><path d="M250 108Q264 75 256 47H287Q277 75 294 108Z" fill="#aab4ae"/><ellipse cx="271.5" cy="47" rx="15.5" ry="4" fill="#c5cec8"/>'
 ];return views[i]?.()||'';
}
export function renderIndustryContext(host,scene,lang){
 const d=industryContext[scene];if(!d||!host)return;const z=lang==='zh',l=z?0:1;
 const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
 const section=el('section');section.className='industry-production-context';section.dataset.industry=String(scene);section.style.cssText='border:1px solid #46555b;border-radius:6px;padding:12px;margin:0 0 16px;min-width:0';
 section.append(el('h4',d.name[l]));
 const fig=el('div');fig.innerHTML='<svg viewBox="0 0 320 130" role="img" aria-label="'+d.name[l]+'" style="display:block;width:100%;height:auto;max-height:220px;border-radius:4px">'+industryIllustration(scene)+'</svg>';section.append(fig);
 const tags=el('div');tags.className='industry-production-tags';tags.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,96px),1fr));gap:6px;margin:8px 0';
 for(const name of d.tags){const tag=el('span',name[l]);tag.style.cssText='font-size:12px;padding:6px;background:#263940;border-radius:3px;text-align:center';tags.append(tag)}
 section.append(tags,el('p',d.note[l]));host.append(section);
}
