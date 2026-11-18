(function () {
  'use strict';
  let opening;
  const maxAge=23*3600000,maxEvents=300;
  function database(){
    if(!opening)opening=new Promise((resolve,reject)=>{
      const request=indexedDB.open('lms-event-outbox',1);
      request.onupgradeneeded=()=>{const store=request.result.createObjectStore('events',{keyPath:'key'});store.createIndex('uidAt',['uid','at']);};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>{opening=null;reject(request.error);};
      request.onblocked=()=>{opening=null;reject(Error('Хранилище событий занято.'));};
    });
    return opening;
  }
  const range=uid=>IDBKeyRange.bound([uid,0],[uid,Number.MAX_SAFE_INTEGER]);
  async function put(uid,event){
    const db=await database();return new Promise((resolve,reject)=>{
      const tx=db.transaction('events','readwrite'),store=tx.objectStore('events');let dropped=0;
      store.put({key:uid+':'+event.id,uid,at:event.at,event});
      const all=store.index('uidAt').getAll(range(uid));
      all.onsuccess=()=>{const rows=all.result,excess=Math.max(0,rows.length-maxEvents),cutoff=Date.now()-maxAge;rows.forEach((r,i)=>{if(i<excess||r.at<cutoff){store.delete(r.key);if(r.at>=cutoff)dropped++;}});};
      tx.oncomplete=()=>resolve({dropped});tx.onerror=tx.onabort=()=>reject(tx.error||Error('Не удалось сохранить события.'));
    });
  }
  async function list(uid){
    const db=await database();return new Promise((resolve,reject)=>{
      const tx=db.transaction('events','readonly'),request=tx.objectStore('events').index('uidAt').getAll(range(uid),maxEvents);
      request.onsuccess=()=>resolve(request.result.filter(r=>r.at>=Date.now()-maxAge).map(r=>r.event));request.onerror=()=>reject(request.error);
    });
  }
  async function remove(uid,ids){
    const db=await database();return new Promise((resolve,reject)=>{
      const tx=db.transaction('events','readwrite'),store=tx.objectStore('events');for(const id of ids)store.delete(uid+':'+id);
      tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||Error('Не удалось обновить очередь.'));
    });
  }
  window.LmsEventOutbox={put,list,remove};
})();
