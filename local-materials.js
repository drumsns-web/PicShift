// Personal material library for the standalone editor. Nothing leaves this browser.
const DB='drum-creative-materials-v1';
function database(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('materials',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function transaction(mode,work){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('materials',mode),store=tx.objectStore('materials');let value;try{work(store,result=>{value=result;});}catch(error){reject(error);return;}tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export const localMaterials={
 ownerId:'local',canManage:false,
 list(){return transaction('readonly',(store,done)=>{const request=store.getAll();request.onsuccess=()=>done(request.result.sort((a,b)=>b.savedAt-a.savedAt));});},
 async load(id){const row=await transaction('readonly',(store,done)=>{const request=store.get(id);request.onsuccess=()=>done(request.result);});if(!row)throw Error('素材が見つかりません。');return row.blob;},
 save(blob,label,scope,category){return transaction('readwrite',(store,done)=>{const id=crypto.randomUUID();store.put({id,label,category:category||'未分類',scope:'personal',owner_id:'local',blob,savedAt:Date.now()});done(id);});},
 remove(id){return transaction('readwrite',(store,done)=>{store.delete(id);done();});}
};
