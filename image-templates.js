// Templates are local to this browser and separated by the signed-in user.
function database(){return new Promise((resolve,reject)=>{const request=indexedDB.open('drum-staff-image-templates-v1',1);request.onupgradeneeded=()=>{const store=request.result.createObjectStore('templates',{keyPath:'id'});store.createIndex('owner','owner');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function transact(owner,mode,operation){
 if(typeof owner!=='string'||!owner)throw Error('保存先を選んでください。');
 const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('templates',mode);let result;operation(tx.objectStore('templates'),value=>{result=value;},tx);tx.oncomplete=()=>resolve(result);tx.onabort=tx.onerror=()=>reject(tx.error||Error('テンプレートを保存できませんでした。'));});}finally{db.close();}
}
export function listImageTemplates(owner){return transact(owner,'readonly',(store,done)=>{const rows=[],request=store.index('owner').openCursor(IDBKeyRange.only(owner));request.onsuccess=()=>{const cursor=request.result;if(!cursor){done(rows.sort((a,b)=>b.savedAt-a.savedAt));return;}const {id,name,savedAt}=cursor.value;rows.push({id,name,savedAt});cursor.continue();};});}
export async function saveImageTemplate(owner,name,project,preview=null){
 name=String(name||'').trim().slice(0,50);if(!name)throw Error('テンプレート名を入力してください。');
 if(!(project instanceof Blob)||project.size>8000000)throw Error('編集データは8MB以下にしてください。');
 if((await listImageTemplates(owner)).length>=20)throw Error('テンプレートは20件までです。不要なものを削除してください。');
 const row={id:crypto.randomUUID(),owner,name,project,preview,savedAt:Date.now()};
 return transact(owner,'readwrite',(store,done,tx)=>{const count=store.index('owner').count(IDBKeyRange.only(owner));count.onsuccess=()=>{if(count.result>=20){tx.abort();return;}store.add(row);done(row.id);};});
}
export function loadImageTemplate(owner,id){return transact(owner,'readonly',(store,done)=>{const request=store.get(id);request.onsuccess=()=>done(request.result?.owner===owner?request.result:null);});}
export function deleteImageTemplate(owner,id){return transact(owner,'readwrite',(store,done)=>{const request=store.get(id);request.onsuccess=()=>{if(request.result?.owner===owner)store.delete(id);done();};});}

