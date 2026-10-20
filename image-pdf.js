// Local, image-based A4 PDF export. No photo or PDF bytes are sent to the server.
const encoder=new TextEncoder();
const PAGE_LIMIT=40;
const LAYOUTS={single:{cols:1,rows:1},twoVertical:{cols:1,rows:2},twoHorizontal:{cols:2,rows:1,landscape:true},four:{cols:2,rows:2},six:{cols:2,rows:3}};

export async function buildImagePdf(pages,layout='single'){
 if(!pages.length||pages.length>PAGE_LIMIT)throw Error('PDFは1～40ページで作成してください。');
 const grid=LAYOUTS[layout];if(!grid)throw Error('A4レイアウトを選んでください。');
 const parts=[],offsets=[0];let length=0;
 const push=value=>{const bytes=typeof value==='string'?encoder.encode(value):value;parts.push(bytes);length+=bytes.byteLength;};
 const object=(id,body)=>{offsets[id]=length;push(`${id} 0 obj\n`);for(const item of body)push(item);push('endobj\n');};
 push('%PDF-1.4\n');push(new Uint8Array([37,226,227,207,211,10]));
 object(1,['<< /Type /Catalog /Pages 2 0 R >>\n']);
 const sheets=[];let nextId=3,perSheet=grid.cols*grid.rows;
 for(let first=0;first<pages.length;first+=perSheet){const group=pages.slice(first,first+perSheet),pageId=nextId++,contentId=nextId++,imageIds=group.map(()=>nextId++);sheets.push({group,pageId,contentId,imageIds});}
 object(2,[`<< /Type /Pages /Count ${sheets.length} /Kids [${sheets.map(sheet=>`${sheet.pageId} 0 R`).join(' ')}] >>\n`]);
 for(const sheet of sheets){
  const landscape=grid.landscape||layout==='single'&&sheet.group[0].width>sheet.group[0].height,pw=landscape?841.89:595.28,ph=landscape?595.28:841.89,margin=24,gap=8;
  const cellW=(pw-2*margin-gap*(grid.cols-1))/grid.cols,cellH=(ph-2*margin-gap*(grid.rows-1))/grid.rows,commands=[];
  for(const [index,page] of sheet.group.entries()){
   const {width,height,jpeg}=page;if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1||jpeg?.type!=='image/jpeg')throw Error('PDFに使えない画像が含まれています。');
   const col=index%grid.cols,row=Math.floor(index/grid.cols),scale=Math.min(cellW/width,cellH/height),drawWidth=+(width*scale).toFixed(3),drawHeight=+(height*scale).toFixed(3),x=+(margin+col*(cellW+gap)+(cellW-drawWidth)/2).toFixed(3),y=+(ph-margin-(row+1)*cellH-row*gap+(cellH-drawHeight)/2).toFixed(3);
   commands.push(`q\n${drawWidth} 0 0 ${drawHeight} ${x} ${y} cm\n/Im${index} Do\nQ\n`);
  }
  const content=encoder.encode(commands.join('')),resources=sheet.imageIds.map((id,index)=>`/Im${index} ${id} 0 R`).join(' ');
  object(sheet.pageId,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << ${resources} >> >> /Contents ${sheet.contentId} 0 R >>\n`]);
  object(sheet.contentId,[`<< /Length ${content.byteLength} >>\nstream\n`,content,'endstream\n']);
  for(const [index,page] of sheet.group.entries()){const bytes=new Uint8Array(await page.jpeg.arrayBuffer());object(sheet.imageIds[index],[`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.byteLength} >>\nstream\n`,bytes,'\nendstream\n']);}
 }
 const startXref=length;push(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);for(let id=1;id<offsets.length;id++)push(`${String(offsets[id]).padStart(10,'0')} 00000 n \n`);push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);
 return new Blob(parts,{type:'application/pdf'});
}

async function canvasPage(source,label){
 const ratio=Math.min(1,2400/Math.max(source.width,source.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(source.width*ratio));canvas.height=Math.max(1,Math.round(source.height*ratio));const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0,canvas.width,canvas.height);
 const jpeg=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!jpeg)throw Error('画像をPDF用に変換できませんでした。');return {label,width:canvas.width,height:canvas.height,jpeg,url:URL.createObjectURL(jpeg)};
}

export function createImagePdfBook(){
 const pages=[];let dialog=null,busy=false;
 const release=page=>URL.revokeObjectURL(page.url);
 const destroy=()=>{if(dialog){dialog.close();dialog.remove();dialog=null;}for(const page of pages)release(page);pages.length=0;};
 async function open(getCurrent){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.className='art-pdf-book';dialog.innerHTML='<div class="art-pdf-head"><div><small>EXPORT / PDF</small><h2>PDF冊子を作る</h2></div><button type="button" class="btn" data-pdf="close">閉じる</button></div><p class="art-pdf-note">A4の1面・2分割・4分割・6分割を選べます。写真は端末内で処理し、順番を変えて1つのPDFに保存できます。</p><div class="art-pdf-actions"><button type="button" class="btn" data-pdf="current">編集中の画像を追加</button><button type="button" class="btn" data-pdf="files">端末の画像を追加</button><input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden></div><label class="art-pdf-layout">A4の配置<select id="art-pdf-layout"><option value="single">1面（画像1枚／ページ）</option><option value="twoVertical">2分割（上下）</option><option value="twoHorizontal">2分割（左右・横向きA4）</option><option value="four">4分割（2×2）</option><option value="six">6分割（2×3）</option></select></label><ol class="art-pdf-pages"></ol><label class="art-pdf-name">PDFの名前<input type="text" maxlength="80" value="DRUM-Creative-画像冊子" autocomplete="off"></label><p class="art-pdf-status" role="status"></p><div class="art-pdf-footer"><span class="art-pdf-count"></span><button type="button" class="btn primary" data-pdf="save">PDFを保存</button></div>';
  document.body.append(dialog);const list=dialog.querySelector('.art-pdf-pages'),status=dialog.querySelector('.art-pdf-status'),fileInput=dialog.querySelector('input[type=file]'),count=dialog.querySelector('.art-pdf-count');
  const render=()=>{list.replaceChildren();const layout=LAYOUTS[dialog.querySelector('#art-pdf-layout').value];count.textContent=`${pages.length}枚・A4 ${Math.ceil(pages.length/(layout.cols*layout.rows))}ページ`;for(const [index,page] of pages.entries()){const item=document.createElement('li'),thumb=document.createElement('img'),detail=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('small'),actions=document.createElement('div');thumb.src=page.url;thumb.alt='';detail.className='art-pdf-page-detail';title.textContent=`${index+1}. ${page.label}`;meta.textContent=`${page.width} × ${page.height}px`;detail.append(title,meta);actions.className='art-pdf-page-actions';for(const [action,label,disabled] of [['up','↑',index===0],['down','↓',index===pages.length-1],['remove','削除',false]]){const button=document.createElement('button');button.type='button';button.className='btn';button.dataset.pdf=action;button.dataset.index=String(index);button.textContent=label;button.disabled=disabled;button.setAttribute('aria-label',`${index+1}ページ目を${action==='up'?'前へ':action==='down'?'後へ':'削除'}`);actions.append(button);}item.append(thumb,detail,actions);list.append(item);}dialog.querySelector('[data-pdf=save]').disabled=!pages.length||busy;};
  const setBusy=value=>{busy=value;for(const button of dialog.querySelectorAll('button'))button.disabled=value;fileInput.disabled=value;if(!value)render();};
  const addCurrent=async()=>{if(pages.length>=PAGE_LIMIT)throw Error('PDFは40ページまでです。');const source=await getCurrent();pages.push(await canvasPage(source,'編集中の画像'));render();status.textContent='編集中の画像を追加しました。';};
  dialog.onclick=async event=>{const button=event.target.closest('[data-pdf]');if(!button||busy)return;const action=button.dataset.pdf,index=Number(button.dataset.index);if(action==='close'){dialog.close();dialog.remove();dialog=null;return;}if(action==='files'){fileInput.click();return;}if(action==='up'||action==='down'){const next=index+(action==='up'?-1:1);if(next<0||next>=pages.length)return;[pages[index],pages[next]]=[pages[next],pages[index]];render();return;}if(action==='remove'){const [removed]=pages.splice(index,1);if(removed)release(removed);render();return;}setBusy(true);try{if(action==='current')await addCurrent();if(action==='save'){const pdf=await buildImagePdf(pages,dialog.querySelector('#art-pdf-layout').value),raw=dialog.querySelector('.art-pdf-name input').value.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').replace(/\.pdf$/i,'').slice(0,70),name=(raw||'DRUM-Creative-画像冊子')+'.pdf',file=new File([pdf],name,{type:'application/pdf'});let shared=false;if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:name});shared=true;}catch(error){if(error.name==='AbortError')throw error;}}if(!shared){const url=URL.createObjectURL(pdf),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}status.textContent=`${name}（${pages.length}ページ）を作成しました。`;}}catch(error){status.textContent=error?.name==='AbortError'?'保存を取り消しました。':error?.message||'PDFを作成できませんでした。';}finally{setBusy(false);}};
  fileInput.onchange=async()=>{const files=[...fileInput.files];fileInput.value='';if(!files.length)return;setBusy(true);let added=0;try{for(const file of files){if(pages.length>=PAGE_LIMIT)throw Error('PDFは40ページまでです。');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20000000)throw Error('20MB以下のJPEG・PNG・WebPを選んでください。');const bitmap=await createImageBitmap(file);try{pages.push(await canvasPage(bitmap,file.name));added++;}finally{bitmap.close();}}status.textContent=`${added}枚の画像を追加しました。`; }catch(error){status.textContent=(added?`${added}枚追加しました。`:'')+(error.message||'画像を追加できませんでした。');}finally{setBusy(false);}};
  dialog.querySelector('#art-pdf-layout').onchange=render;
  dialog.oncancel=event=>{event.preventDefault();if(busy)return;dialog.close();dialog.remove();dialog=null;};dialog.showModal();render();if(!pages.length){setBusy(true);try{await addCurrent();}catch(error){status.textContent=error.message||'編集中の画像を追加できませんでした。';}finally{setBusy(false);}}
 }
 return {open,destroy};
}

