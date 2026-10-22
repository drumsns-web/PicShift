import {chooseBlankCanvas} from './image-canvas.js';
import {editMemoImage} from './memo-image-editor.js';
import {exportImageProject,importImageProject,loadImageDraft} from './image-project.js';
import {buildImagePdf} from './image-pdf.js';
import {openFlipbook} from './image-flipbook.js';
import {openVideoEditor} from './image-video-editor.js';
import {localMaterials} from './local-materials.js';
import {saveLocalProject,loadLocalProject} from './local-project.js';

const frames=[];
const deletedFrames=[];
let selected=-1,busy=false;
const status=document.querySelector('#creative-status'),imageInput=document.querySelector('#creative-image-file'),videoInput=document.querySelector('#creative-video-file');
const current=()=>frames[selected];
function message(value){status.textContent=value;}
let saveQueue=Promise.resolve();
function persist(){saveQueue=saveQueue.catch(()=>{}).then(async()=>{const rows=[];for(const frame of frames){let project=null;try{if(frame.session.state)project=await exportImageProject(frame.session);}catch{}rows.push({id:frame.id,blob:frame.blob,project,motion:frame.motion,motionAssets:frame.session.motionAssets||null});}await saveLocalProject(rows);}).catch(error=>message(error.message||'端末内に作品を保存できませんでした。'));return saveQueue;}
async function restore(){try{const rows=await loadLocalProject();for(const row of rows){let session={};try{if(row.project)session=await importImageProject(row.project);}catch{}if(row.motionAssets)session.motionAssets=row.motionAssets;frames.push({id:row.id||crypto.randomUUID(),blob:row.blob,session,preview:URL.createObjectURL(row.blob),motion:row.motion||{duration:.125,parts:{}}});}if(frames.length){selected=0;message(`${frames.length}コマをこの端末から読み込みました。`);}render();}catch(error){message(error.message||'端末内の作品を読み込めませんでした。');}}
const ready=restore();
function addFrame(blob,session={},previewBlob=blob){const frame={id:crypto.randomUUID(),blob,session,preview:URL.createObjectURL(previewBlob),motion:{duration:.125,parts:{}}};frames.push(frame);selected=frames.length-1;render();persist();return frame;}
function removeFrame(index){
 if(busy||!frames[index])return;
 const active=current(),[frame]=frames.splice(index,1);
 deletedFrames.push({frame,index});
 selected=active===frame?Math.min(index,frames.length-1):frames.indexOf(active);
 render();persist();message('作品を削除しました。「削除を戻す」で元に戻せます。');
}
function undoFrameRemoval(){
 if(busy||!deletedFrames.length)return;
 const {frame,index}=deletedFrames.pop(),at=Math.min(index,frames.length);
 frames.splice(at,0,frame);selected=at;render();persist();message('削除した作品を戻しました。');
}
const undoRemoval=document.createElement('button');undoRemoval.type='button';undoRemoval.className='creative-undo-remove';undoRemoval.textContent='↶ 削除を戻す';undoRemoval.hidden=true;undoRemoval.onclick=undoFrameRemoval;
document.querySelector('#frame-list').before(undoRemoval);
function render(){undoRemoval.hidden=!deletedFrames.length;const list=document.querySelector('#frame-list');list.replaceChildren();frames.forEach((frame,index)=>{const button=document.createElement('button');button.type='button';button.className='creative-frame';button.dataset.frame=String(index);button.setAttribute('aria-selected',String(index===selected));const image=document.createElement('img');image.src=frame.preview;image.alt=`${index+1}コマ目`;const caption=document.createElement('span');caption.textContent=`${index+1}コマ目`;button.append(image,caption);const card=document.createElement('div');card.className='creative-frame-card';const remove=document.createElement('button');remove.type='button';remove.className='creative-frame-remove';remove.dataset.removeFrame=String(index);remove.textContent='削除';remove.setAttribute('aria-label',`${index+1}コマ目を削除`);card.append(button,remove);list.append(card);});document.querySelector('#frame-count').textContent=`${frames.length}コマ`;for(const button of document.querySelectorAll('.creative-frame-actions button'))button.disabled=!frames.length;}
async function editFrame(frame){if(!frame||busy)return;busy=true;message('編集画面を開いています…');try{const frameIndex=frames.indexOf(frame),previous=frameIndex>0?frames[frameIndex-1]:null;const result=await editMemoImage(frame.blob,{session:frame.session,resetBlob:frame.session.resetBlob||frame.blob,draftKey:'drum-creative-local',materialLibrary:localMaterials,animationAssets:true,applyLabel:'このコマに反映',onionSkin:previous?.preview});if(result){frame.blob=result.original||result.blob;URL.revokeObjectURL(frame.preview);frame.preview=URL.createObjectURL(frame.blob);render();await persist();message('コマに編集を反映しました。');}else message('編集画面に戻りました。');}catch(error){message(error.message||'画像を編集できませんでした。');}finally{busy=false;}}
async function addImage(file){if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))return;const frame=addFrame(file);message('画像を追加しました。');await editFrame(frame);}
async function duplicate(){const source=current();if(!source)return;let session={};if(source.session.state)session=await importImageProject(await exportImageProject(source.session));if(source.session.motionAssets)session.motionAssets=structuredClone(source.session.motionAssets);const frame={id:crypto.randomUUID(),blob:source.blob,session,preview:URL.createObjectURL(source.blob),motion:structuredClone(source.motion||{duration:.125,parts:{}})};frames.splice(selected+1,0,frame);selected++;render();await persist();message(`${selected+1}コマ目をパーツも編集できる状態で複製しました。`);}
async function save(blob,name){const file=new File([blob],name,{type:blob.type});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:name});return;}catch(error){if(error.name==='AbortError')return;}}const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportPdf(){if(!frames.length)return;const layout=document.querySelector('#creative-pdf-layout').value;message('A4 PDFを作成しています…');const pages=[];try{for(const frame of frames){const bitmap=await createImageBitmap(frame.blob);try{const ratio=Math.min(1,2400/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const jpeg=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!jpeg)throw Error('PDF用の画像を作れませんでした。');pages.push({width:canvas.width,height:canvas.height,jpeg});}finally{bitmap.close();}}const pdf=await buildImagePdf(pages,layout);await save(pdf,`picshift-${Date.now()}.pdf`);message(`${frames.length}コマをA4 PDFに保存しました。`);}catch(error){message(error.message||'PDFを作成できませんでした。');}}
document.querySelector('#frame-list').onclick=event=>{const remove=event.target.closest('[data-remove-frame]');if(remove){removeFrame(Number(remove.dataset.removeFrame));return;}const card=event.target.closest('[data-frame]');if(!card)return;selected=Number(card.dataset.frame);render();};
document.addEventListener('click',async event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(!action||busy)return;if(action==='image'||action==='video'){const input=action==='image'?imageInput:videoInput;input.value='';input.click();return;}await ready;try{if(action==='update-app'){await updateApplication();}else if(action==='remove-frame'){removeFrame(selected);}else if(action==='canvas'){const canvas=await chooseBlankCanvas();if(!canvas)return;const frame=addFrame(canvas.blob);await editFrame(frame);}else if(action==='image')imageInput.click();else if(action==='video')videoInput.click();else if(action==='draft'){const row=await loadImageDraft('drum-creative-local');if(!row){message('この端末に下書きはありません。');return;}const session=await importImageProject(row.project),frame=addFrame(row.preview,session,row.preview);await editFrame(frame);}else if(action==='duplicate')await duplicate();else if(action==='edit')await editFrame(current());else if(action==='play'){await openFlipbook(frames);await persist();}else if(action==='pdf')await exportPdf();else if(action==='save-image'){const frame=current();if(frame){await save(frame.blob,`picshift-${Date.now()}.${frame.blob.type==='image/png'?'png':'jpg'}`);message('画像を端末に保存しました。');}}}catch(error){message(error.message||'操作できませんでした。');}});
imageInput.onchange=async()=>{const file=imageInput.files?.[0];imageInput.value='';if(file){await ready;await addImage(file);}};
videoInput.onchange=async()=>{const file=videoInput.files?.[0];videoInput.value='';if(!file)return;await ready;try{await openVideoEditor(file,{materialLibrary:localMaterials});}catch(error){message(error.message||'動画を開けませんでした。');}};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();

async function updateApplication(){
 const button=document.querySelector('[data-action="update-app"]');if(button.disabled)return;
 button.disabled=true;message('最新版を確認しています…');
 try{
  await saveQueue;
  const url=new URL('./index.html',location.href);url.searchParams.set('update',Date.now());
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('公開中のページを取得できませんでした。');
  const html=await response.text();if(!html.includes('standalone-app.js'))throw Error('更新用のページを確認できませんでした。');
  const registration=await navigator.serviceWorker?.getRegistration();
  if(registration){
   await registration.update();const worker=registration.installing||registration.waiting;
   if(worker&&worker.state!=='activated')await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(Error('更新の準備に時間がかかっています。少し待ってからもう一度お試しください。'));},30000);
    function changed(){if(worker.state==='activated'||worker.state==='redundant'){clearTimeout(timer);worker.removeEventListener('statechange',changed);worker.state==='activated'?resolve():reject(Error('更新ファイルを取得できませんでした。'));}}
    worker.addEventListener('statechange',changed);changed();
   });
  }
  // Clear only this app's shell cache. IndexedDB projects and materials remain intact.
  if('caches' in window)for(const key of await caches.keys())if(key.startsWith('picshift-shell-'))await caches.delete(key);
  location.replace(url.href);
 }catch(error){message('更新できませんでした。'+(error.message||'通信状態を確認して再度お試しください。'));button.disabled=false;}
}

// Suppress browser zoom without stopping the editor's pointer-based gestures.
for(const type of ['gesturestart','gesturechange'])document.addEventListener(type,event=>event.preventDefault(),{passive:false});
document.addEventListener('touchmove',event=>{if(event.touches.length>1)event.preventDefault();},{passive:false});
