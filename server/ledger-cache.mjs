import {DAY, fail} from './domain.mjs';

const collections=new Set(['lmsAttempts','lmsEvents']);
// Only numeric analytics queries use this cache. Profiles, permissions, cleanup
// previews and document versions ALWAYS come from Firestore.
export class SqlLedgerCache {
  constructor(sql,now=()=>Date.now()){
    this.sql=sql;this.now=now;
    sql.exec('CREATE TABLE IF NOT EXISTS lms_ledger_cache (key TEXT PRIMARY KEY, generation INTEGER NOT NULL DEFAULT 0, pending INTEGER NOT NULL DEFAULT 0, entry TEXT)');
    // A process may have stopped after the remote commit and before cache update.
    sql.exec('UPDATE lms_ledger_cache SET entry=NULL, pending=0, generation=generation+1 WHERE pending>0');
  }
  state(key){return [...this.sql.exec('SELECT generation,pending,entry FROM lms_ledger_cache WHERE key=?',key)][0]||{generation:0,pending:0,entry:null};}
  read(key){const state=this.state(key);return {...state,entry:state.entry?JSON.parse(state.entry):null};}
  write(key,generation,entry){
    const state=this.state(key);if(state.pending||state.generation!==generation)return;
    const payload=JSON.stringify(entry);if(new TextEncoder().encode(payload).length>4_000_000)return;
    this.sql.exec('INSERT INTO lms_ledger_cache(key,generation,pending,entry) VALUES(?,?,0,?) ON CONFLICT(key) DO UPDATE SET entry=excluded.entry',key,generation,payload);
  }
  begin(writes){
    const keys=new Set();
    for(const w of writes){
      const collection=w.path.split('/')[0];if(!collections.has(collection)||w.path.split('/').length!==2)continue;
      if(w.data?.uid)keys.add(collection+'/'+w.data.uid);
      // Deletes/partial updates carry no UID. Find only the affected cache copy.
      if(w.version!==null||!w.data?.uid)for(const row of this.sql.exec("SELECT DISTINCT c.key FROM lms_ledger_cache c,json_each(c.entry,'$.rows') r WHERE json_extract(r.value,'$.path')=?",w.path))keys.add(row.key);
    }
    return [...keys].map(key=>{
      this.sql.exec('INSERT INTO lms_ledger_cache(key,generation,pending) VALUES(?,1,1) ON CONFLICT(key) DO UPDATE SET generation=generation+1,pending=pending+1',key);
      return {key,generation:this.state(key).generation};
    });
  }
  finish(tokens,writes,success){
    for(const {key,generation} of tokens){
      const state=this.read(key);let entry=state.entry;
      if(!success||state.generation!==generation||state.pending!==1)entry=null;
      if(entry){
        const rows=new Map(entry.rows.map(r=>[r.path,r]));
        for(const w of writes){
          if(!w.path.startsWith(key.split('/')[0]+'/'))continue;
          const old=rows.get(w.path);if(w.delete){rows.delete(w.path);continue;}
          const data=w.fields?old&&{...old.data,...w.data}:w.data;
          rows.delete(w.path);
          if(data?.uid===key.slice(key.indexOf('/')+1)&&data.at>=entry.start&&data.at<entry.end)rows.set(w.path,{path:w.path,data,version:null});
        }
        entry={...entry,rows:[...rows.values()]};
        if(new TextEncoder().encode(JSON.stringify(entry)).length>4_000_000)entry=null;
      }
      this.sql.exec('UPDATE lms_ledger_cache SET pending=MAX(0,pending-1),entry=? WHERE key=?',entry?JSON.stringify(entry):null,key);
    }
  }
}

export class LedgerCacheStore {
  constructor(source,cache,now=()=>Date.now()){Object.assign(this,{source,cache,now});}
  get(...args){return this.source.get(...args);}
  getMany(...args){return this.source.getMany(...args);}
  list(...args){return this.source.list(...args);}
  async query(collection,filters=[],limit=1000,options){
    const uid=filters.find(([f,op])=>f==='uid'&&op==='EQUAL')?.[2],start=filters.find(([f,op])=>f==='at'&&op==='GREATER_THAN_OR_EQUAL')?.[2],end=filters.find(([f,op])=>f==='at'&&op==='LESS_THAN')?.[2];
    if(options?.partial||!collections.has(collection)||filters.length!==3||typeof uid!=='string'||!Number.isFinite(start)||!Number.isFinite(end)||start>=end)return this.source.query(collection,filters,limit,options);
    const key=collection+'/'+uid,state=this.cache.read(key),cached=state.entry;
    let rows;
    if(!state.pending&&cached&&cached.start<=start&&cached.end>=end&&this.now()-cached.fetchedAt<DAY)rows=cached.rows;
    else{
      // Cover whole days including tomorrow. Appends update the cache at commit,
      // so moving report windows don't reread weeks of history every minute.
      const from=Math.floor(start/DAY)*DAY,to=(Math.ceil(end/DAY)+1)*DAY;
      try{rows=await this.source.query(collection,[['uid','EQUAL',uid],['at','GREATER_THAN_OR_EQUAL',from],['at','LESS_THAN',to]],limit);}
      catch(e){if(e.code==='scan-limit')return this.source.query(collection,filters,limit);throw e;}
      if(!state.pending)this.cache.write(key,state.generation,{start:from,end:to,fetchedAt:this.now(),rows});
    }
    const result=rows.filter(r=>r.data.at>=start&&r.data.at<end);
    if(result.length>limit)fail(413,'scan-limit','Слишком много данных для одного отчёта.');
    return structuredClone(result);
  }
  async commit(writes){
    const tokens=this.cache.begin(writes);
    try{const result=await this.source.commit(writes);this.cache.finish(tokens,writes,true);return result;}
    catch(e){this.cache.finish(tokens,writes,false);throw e;}
  }
  async atomic(fn){for(let i=0;i<4;i++){try{return await fn(this);}catch(e){if(e.code!=='conflict'||i===3)throw e;}}}
}
