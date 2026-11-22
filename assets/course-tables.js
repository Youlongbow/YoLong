// Portable Markdown/GFM table support for migrated HEAT course content.
// Keep source cells intact; reject malformed grids instead of silently shifting data.
export function parseCourseTable(source) {
  const lines=String(source??'').trim().split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  if(lines.length<3) return null;
  const splitRow=line=>{
    if(!line.startsWith('|') || !line.endsWith('|')) return null;
    const cells=[];
    let cell='';
    for(let i=1;i<line.length-1;i++){
      const char=line[i];
      if(char==='\\' && line[i+1]==='|'){
        cell+='\\|';
        i++;
      } else if(char==='|'){
        cells.push(cell.trim());
        cell='';
      } else {
        cell+=char;
      }
    }
    cells.push(cell.trim());
    return cells;
  };
  const headers=splitRow(lines[0]);
  const separators=splitRow(lines[1]);
  if(!headers || !separators || headers.length<2 || separators.length!==headers.length ||
      !separators.every(cell=>/^:?-{3,}:?$/.test(cell))) return null;
  const rows=lines.slice(2).map(splitRow);
  if(rows.some(row=>!row || row.length!==headers.length)) return null;
  const align=separators.map(cell=>cell.startsWith(':')&&cell.endsWith(':')?'center':cell.endsWith(':')?'right':'left');
  return {headers,rows,align,columnCount:headers.length};
}

const escapeAttribute=value=>String(value).replace(/[&"<>'"]/g,c=>({
  '&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;',"'":'&#39;'
}[c]));

export function renderCourseTable(source,inline,lang='zh'){
  const table=parseCourseTable(source);
  if(!table) return null;
  const {headers,rows,align,columnCount}=table;
  const label=(lang==='zh'?'课程资料表格：':'Course reference table: ')+headers.join(' / ');
  const ths=headers.map((cell,i)=>'<th scope="col" dir="auto" class="align-'+align[i]+'">'+inline(cell)+'</th>').join('');
  const trs=rows.map(row=>'<tr>'+row.map((cell,i)=>
    '<td dir="auto" class="align-'+align[i]+'">'+inline(cell)+'</td>').join('')+'</tr>').join('');
  return '<div class="article-table course-table" role="region" tabindex="0" aria-label="'+escapeAttribute(label)+'">'+
    '<table class="course-data-table" data-cols="'+columnCount+'"><thead><tr>'+ths+'</tr></thead>'+
    '<tbody>'+trs+'</tbody></table></div>';
}
