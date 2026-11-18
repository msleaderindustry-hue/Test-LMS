import {fail} from './domain.mjs';
const encoder=new TextEncoder(),decoder=new TextDecoder(),CHUNK=256*1024,MAX_BYTES=4_100_000;
function base64(bytes){let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(text);}
function bytes(value){try{return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}catch{fail(503,'backup-corrupt','Не удалось прочитать резервную копию.');}}
function identifier(key){const match=/^snapshots\/([a-zA-Z0-9_-]{1,128})\.json$/.exec(key);if(!match)fail(400,'backup-key','Некорректный идентификатор копии.');return match[1];}

// Immutable, authenticated ciphertext. Browser rules deny the entire collection.
// The encryption key belongs only to the Worker and is kept across deployments.
export class FirestoreBackupStore {
  constructor(store,secret,now=()=>Date.now()){this.store=store;this.secret=secret;this.now=now;}
  async cryptoKey(){
    if(!this.imported){if(typeof this.secret!=='string'||! /^[A-Za-z0-9+/]{43}=$/.test(this.secret))fail(503,'backup-key-missing','Серверный ключ резервных копий не настроен.');this.imported=crypto.subtle.importKey('raw',bytes(this.secret),'AES-GCM',false,['encrypt','decrypt']);}
    return this.imported;
  }
  async put(key,value){
    const id=identifier(key),plain=encoder.encode(String(value));if(plain.length>MAX_BYTES)fail(413,'backup-limit','Копия слишком большая. Выберите меньше данных.');
    const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(key)},await this.cryptoKey(),plain));
    const count=Math.ceil(cipher.length/CHUNK),root='lmsBackups/'+id,writes=[{path:root,version:null,data:{version:1,algorithm:'AES-256-GCM',iv:base64(iv),chunks:count,bytes:cipher.length,createdAt:this.now()}}];
    for(let index=0;index<count;index++)writes.push({path:root+'/chunks/'+index,version:null,data:{version:1,index,data:base64(cipher.subarray(index*CHUNK,(index+1)*CHUNK))}});
    await this.store.commit(writes);return {key};
  }
  async get(key){
    const id=identifier(key),root='lmsBackups/'+id,record=await this.store.get(root);if(!record)return null;
    const meta=record.data;if(meta.version!==1||meta.algorithm!=='AES-256-GCM'||!Number.isInteger(meta.bytes)||meta.bytes<16||meta.bytes>MAX_BYTES+16||meta.chunks!==Math.ceil(meta.bytes/CHUNK))fail(503,'backup-corrupt','Повреждены сведения о резервной копии.');
    const cipher=new Uint8Array(meta.bytes);
    for(let offset=0;offset<meta.chunks;offset+=16){
      const batch=await this.store.getMany(Array.from({length:Math.min(16,meta.chunks-offset)},(_,n)=>root+'/chunks/'+(offset+n)));
      for(let n=0;n<batch.length;n++){
        const row=batch[n]?.data,index=offset+n;if(!row||row.version!==1||row.index!==index||typeof row.data!=='string')fail(503,'backup-corrupt','Часть резервной копии недоступна.');
        const part=bytes(row.data);if(part.length!==Math.min(CHUNK,meta.bytes-index*CHUNK))fail(503,'backup-corrupt','Часть резервной копии повреждена.');cipher.set(part,index*CHUNK);
      }
    }
    const cryptoKey=await this.cryptoKey();let plain;
    try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(meta.iv),additionalData:encoder.encode(key)},cryptoKey,cipher);}catch{fail(503,'backup-unreadable','Не удалось проверить и расшифровать копию. Очистка остановлена.');}
    const result=decoder.decode(plain);return {text:async()=>result};
  }
}
