import { HttpError } from '../../server/domain.mjs';
export class MemoryStore {
  constructor(seed={}){this.rows=new Map();this.seq=0;for(const [path,data]of Object.entries(seed))this.rows.set(path,{path,data:structuredClone(data),version:String(++this.seq)});}
  async get(path){return structuredClone(this.rows.get(path)||null);}
  async getMany(paths){return Promise.all(paths.map(path=>this.get(path)));}
  async list(collection,{limit=1000}={}){const result=[...this.rows.values()].filter(x=>x.path.startsWith(collection+'/')&&x.path.split('/').length===collection.split('/').length+1);if(result.length>limit)throw new HttpError(413,'scan-limit','limit');return structuredClone(result);}
  async query(collection,filters=[],limit=1000){const result=[...this.rows.values()].filter(x=>x.path.startsWith(collection+'/')&&x.path.split('/').length===collection.split('/').length+1&&filters.every(([key,op,v])=>op==='EQUAL'?x.data[key]===v:op==='ARRAY_CONTAINS'?x.data[key]?.includes(v):op==='GREATER_THAN_OR_EQUAL'?x.data[key]>=v:op==='LESS_THAN'?x.data[key]<v:false));if(result.length>limit)throw new HttpError(413,'scan-limit','limit');return structuredClone(result);}
  async commit(writes){if(writes.length>400)throw new HttpError(413,'write-limit','limit');for(const w of writes)if((this.rows.get(w.path)?.version??null)!==w.version)throw new HttpError(409,'conflict','conflict');for(const w of writes){if(w.delete)this.rows.delete(w.path);else {const current=this.rows.get(w.path);const data=w.fields?{...current?.data,...w.data}:w.data;this.rows.set(w.path,{path:w.path,data:structuredClone(data),version:String(++this.seq)});}}}
  async atomic(fn){for(let i=0;i<4;i++){try{return await fn(this)}catch(e){if(e.code!=='conflict'||i===3)throw e;}}}
}
export class MemoryBucket {
  constructor(){this.rows=new Map();}
  async put(key,value){this.rows.set(key,String(value));return {key};}
  async get(key){const v=this.rows.get(key);return v==null?null:{text:async()=>v};}
}
