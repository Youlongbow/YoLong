import {existsSync,mkdtempSync,mkdirSync,copyFileSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const cwd=mkdtempSync(join(tmpdir(),'raven-publisher-'));
const script=resolve('scripts/publish-events.mjs');
const setup=()=>{
 mkdirSync(join(cwd,'content','inbox'),{recursive:true});
 for(const lang of ['zh','en'])copyFileSync('content/security-'+lang+'.json',join(cwd,'content','security-'+lang+'.json'));
};
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const template={
 slug:'2099-01-01-publisher-self-test',
 date:'2099-01-01',
 category:'transport',
 zh:{title:'自动发布流程内部测试（不会进入正式事件库）',summary:'这是在独立临时目录内执行的校验样本。',region:'测试环境',body:'这是用于验证中英文事件结构、来源链接、去重和发布流程的虚构测试样本，仅在系统临时目录执行。详细来源：https://example.org/sample/fictional-test 。请勿发表。'},
 en:{title:'Isolated synthetic event for publication validation',summary:'This is an isolated internal unit-test record.',region:'Test environment',body:'This completely fictional event validates that bilingual records are checked, sorted and written together in an isolated temporary directory. Source: https://example.org/sample/fictional-test . It is never published.'}
};
try{
 setup();
 const before=JSON.parse(readFileSync(join(cwd,'content','security-zh.json'),'utf8')).events.length;
 writeFileSync(join(cwd,'content','inbox','test.json'),JSON.stringify(template));
 const valid=spawnSync(process.execPath,[script],{cwd,encoding:'utf8'});
 assert(valid.status===0,'Valid bilingual event rejected: '+valid.stderr);
 const z=JSON.parse(readFileSync(join(cwd,'content','security-zh.json'),'utf8'));
 const e=JSON.parse(readFileSync(join(cwd,'content','security-en.json'),'utf8'));
 assert(z.events.length===before+1&&e.events.length===before+1,'Bilingual insertion count wrong');
 assert(z.events[0].slug===template.slug&&e.events[0].slug===template.slug,'New event not sorted to first position');
 assert(!existsSync(join(cwd,'content','inbox','test.json')),'Successful publication must clear processed inbox file');
 console.log('PASS valid bilingual event insert');
 setup();
 const invalid=structuredClone(template);invalid.en.body='';
 writeFileSync(join(cwd,'content','inbox','test.json'),JSON.stringify(invalid));
 const bad=spawnSync(process.execPath,[script],{cwd,encoding:'utf8'});
 assert(bad.status!==0,'Malformed event unexpectedly accepted');
 assert(existsSync(join(cwd,'content','inbox','test.json')),'Invalid input must stay available for correction');
 const unchanged=JSON.parse(readFileSync(join(cwd,'content','security-zh.json'),'utf8'));
 assert(unchanged.events.length===before,'Invalid event modified production-archive copy');
 console.log('PASS invalid bilingual event rejection');
}finally{rmSync(cwd,{recursive:true,force:true})}
