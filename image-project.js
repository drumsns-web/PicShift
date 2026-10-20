// A project keeps editable objects separate from its flattened preview.
const DB_NAME='drum-staff-image-drafts-v1';

function readData(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
async function bitmapData(bitmap){const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let alpha=false;for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==255){alpha=true;break;}const blob=await new Promise(resolve=>canvas.toBlob(resolve,alpha?'image/png':'image/jpeg',.85));if(!blob)throw Error('編集データを書き出せませんでした。');return readData(blob);}

export async function exportImageProject(session){
 const state=session.state;if(!state||!Array.isArray(state.layers)||!state.layers.length)throw Error('保存する編集内容がありません。');
 const bitmaps=[],lookup=new Map();
 async function index(bitmap){if(!bitmap)return null;if(!lookup.has(bitmap)){lookup.set(bitmap,bitmaps.length);bitmaps.push(await bitmapData(bitmap));}return lookup.get(bitmap);}
 const layers=[];for(const item of state.layers){const layer={...item};if(item.bitmap)layer.bitmap=await index(item.bitmap);layers.push(layer);}
 const project={version:1,state:{...state,resetBase:undefined,layers,inkMode:false,cropping:false},bitmaps,resetBitmap:await index(session.resetBase||state.layers[0].bitmap)};
 const blob=new Blob([JSON.stringify(project)],{type:'application/json'});
 if(blob.size>8000000)throw Error('編集データが8MBを超えました。追加画像を減らしてください。');
 return blob;
}

export async function importImageProject(blob){
 if(blob.size>8000000)throw Error('編集データが大きすぎます。');
 const project=JSON.parse(await blob.text());
 if(project.version!==1||!Array.isArray(project.bitmaps)||!Array.isArray(project.state?.layers)||project.state.layers.length<1||project.state.layers.length>31||project.bitmaps.length>32)throw Error('編集データを読み込めませんでした。');
 const bitmaps=[],files=[];
 try{
  for(const data of project.bitmaps){if(typeof data!=='string'||!/^data:image\/(?:png|jpeg);base64,/.test(data)||data.length>8000000)throw Error('編集データに使えない画像があります。');const [header,encoded]=data.split(',');const binary=atob(encoded),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);const file=new Blob([bytes],{type:header.slice(5,-7)});files.push(file);bitmaps.push(await createImageBitmap(file));}
  const layers=project.state.layers.map(item=>{const index=item.bitmap;if(index!=null&&(!Number.isInteger(index)||!bitmaps[index]))throw Error('編集画像が見つかりません。');return {...item,bitmap:index==null?undefined:bitmaps[index]};});
  if(layers[0].kind!=='image'||!layers[0].bitmap)throw Error('元の写真が見つかりません。');
  const state={...project.state,layers};
  return {base:layers[0].bitmap,resetBase:bitmaps[project.resetBitmap]||layers[0].bitmap,resetBlob:files[project.resetBitmap]||files[0],bitmaps,state,undoStack:[],redoStack:[]};
 }catch(error){for(const bitmap of bitmaps)bitmap.close();throw error;}
}

function openDraftDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>req.result.createObjectStore('drafts');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function draftTransaction(key,mode,operation){const db=await openDraftDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('drafts',mode),store=tx.objectStore('drafts'),request=operation(store,key);let value;request.onsuccess=()=>{value=request.result;};request.onerror=()=>reject(request.error);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export function saveImageDraft(key,project,preview){return draftTransaction(key,'readwrite',(store,id)=>store.put({project,preview,savedAt:Date.now()},id));}
export function loadImageDraft(key){return draftTransaction(key,'readonly',(store,id)=>store.get(id));}
export function deleteImageDraft(key){return draftTransaction(key,'readwrite',(store,id)=>store.delete(id));}
