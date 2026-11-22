import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCourseTable,renderCourseTable} from '../assets/course-tables.js';

const expectations={
  zh:{'01':[4],'02':[4,15,5],'05':[5,4,4],'06':[4],'10':[6]},
  en:{'01':[4],'02':[4,15,5],'05':[5],'06':[4],'10':[6]}
};
const expectedTotals={zh:9,en:7};
let total=0;
const inline=text=>text
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/\\\|/g,'|');
for(const lang of ['zh','en']){
  const course=JSON.parse(readFileSync(new URL('../content/training-'+lang+'.json',import.meta.url),'utf8'));
  assert.equal(course.modules.length,11,'Review every HEAT module, including modules with no tables');
  let count=0;
  for(const module of course.modules){
    const chunks=module.body.trim().split(/\n\s*\n/);
    const tableChunks=chunks.filter(c=>/^\s*\|/.test(c));
    const wanted=expectations[lang][module.slug]||[];
    assert.equal(tableChunks.length,wanted.length,'Unexpected table count in '+lang+'/'+module.slug);
    for(let i=0;i<tableChunks.length;i++){
      const grid=parseCourseTable(tableChunks[i]);
      assert.ok(grid,'Unparseable table '+lang+'/'+module.slug+'/'+i);
      assert.ok(grid.columnCount>=2 && grid.columnCount<=3);
      assert.equal(grid.rows.length,wanted[i],lang+'/'+module.slug+'/'+i+' row count');
      assert.ok(grid.headers.every(Boolean));
      assert.ok(grid.rows.every(row=>row.length===grid.headers.length),'No shifted data columns');
      const html=renderCourseTable(tableChunks[i],inline,lang);
      assert.equal((html.match(/<thead>/g)||[]).length,1);
      assert.equal((html.match(/<tbody>/g)||[]).length,1);
      assert.equal((html.match(/<th\b/g)||[]).length,grid.columnCount);
      assert.equal((html.match(/<td\b/g)||[]).length,grid.rows.length*grid.columnCount);
      assert.equal((html.match(/<tr>/g)||[]).length,grid.rows.length+1);
      assert.ok(html.includes('tabindex="0"') && html.includes('role="region"'));
      assert.ok(html.includes('course-table-hint'),'Every wide grid provides mobile swipe guidance');
      assert.ok(html.includes('dir="auto"'),'Mixed Chinese, English and Arabic must preserve direction');
      for(const cell of [...grid.headers,...grid.rows.flat()]){
        assert.ok(html.includes(inline(cell)),'Cell missing from generated HTML: '+cell.slice(0,100));
      }
      count++;
      total++;
      console.log('HEAT_TABLE_OK',lang,module.slug,'table',i+1,'columns',grid.columnCount,'dataRows',grid.rows.length);
    }
  }
  assert.equal(count,expectedTotals[lang]);
}
// The parser rejects malformed data rather than silently inventing shifted rows.
assert.equal(parseCourseTable('| One | Two |\n| --- | --- |\n| Only one cell |'),null);
assert.equal(renderCourseTable('| A | B |\n| bad | bad |\n| x | y |',inline),null);
const pipe=parseCourseTable('| A \\| B | C |\n| --- | --- |\n| x \\| y | z |');
assert.deepEqual(pipe?.headers,['A \\| B','C']);
assert.deepEqual(pipe?.rows,[['x \\| y','z']]);
const css=readFileSync(new URL('../assets/editorial.css',import.meta.url),'utf8');
assert.ok(css.includes('.section-training .article-content .course-table'));
assert.ok(css.includes('overflow-x:auto;'));
console.log('HEAT course table audit passed:',total,'tables, all 22 bilingual modules checked.');
