import {DurableObject} from 'cloudflare:workers';
import {handle,services} from './api.mjs';
import {FirestoreStore} from '../server/firestore.mjs';
import {LedgerCacheStore,SqlLedgerCache} from '../server/ledger-cache.mjs';
import {requireId} from '../server/domain.mjs';

// SQLite-backed Durable Objects have a 30s default CPU allowance on Free.
// One private object owns the cache; authority is still checked on every call.
export class LmsRuntime extends DurableObject {
  constructor(ctx,env){
    super(ctx,env);
    this.dependencies={store:new LedgerCacheStore(new FirestoreStore(env),new SqlLedgerCache(ctx.storage.sql))};
  }
  fetch(request){return handle(request,this.env,this.dependencies);}
  async schedule(at){await services(this.env,this.dependencies).jobs.schedule(at);}
  async runJob(id){
    try{await services(this.env,this.dependencies).jobs.run(requireId(id));return {ok:true};}
    catch(error){return {ok:false,permanent:!!error.permanent,retryAfter:Number(error.retryAfter)||0};}
  }
}
