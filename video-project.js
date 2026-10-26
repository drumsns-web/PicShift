const DB_NAME='picshift-video-project-v1';
function openDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('project');db.createObjectStore('assets');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function transact(store,mode,operation){const db=await openDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(store,mode),request=operation(tx.objectStore(store));let value;request.onsuccess=()=>value=request.result;request.onerror=()=>reject(request.error);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
export const videoFileKey=file=>[file.name,file.size,file.lastModified||0].join(':');
export const readVideoProject=()=>transact('project','readonly',store=>store.get('current'));
export const writeVideoProject=project=>transact('project','readwrite',store=>store.put(project,'current'));
export const deleteVideoProject=()=>transact('project','readwrite',store=>store.delete('current'));
export async function saveVideoAsset(blob){const id=crypto.randomUUID?.()||'asset-'+Date.now()+'-'+Math.random().toString(36).slice(2);await transact('assets','readwrite',store=>store.put(blob,id));return id;}
export const readVideoAsset=id=>transact('assets','readonly',store=>store.get(id));

