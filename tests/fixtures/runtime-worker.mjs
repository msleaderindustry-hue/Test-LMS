// Synthetic local fixture only. Never deploy this test entrypoint.
import gateway from '../../workers/gateway.mjs';
import {LmsRuntime as Runtime} from '../../workers/runtime.mjs';
import {MemoryStore} from '../helpers/memory-store.mjs';
import {LedgerCacheStore,SqlLedgerCache} from '../../server/ledger-cache.mjs';
import {OWNER_UID,fail} from '../../server/domain.mjs';
import {calculateExcel} from '../../server/generated/excel-checker.mjs';
import {FirestoreStore} from '../../server/firestore.mjs';
const now=Date.parse('2026-11-22T15:05Z');
export class LmsRuntime extends Runtime {
  constructor(ctx,env){
    super(ctx,env);
    const seed={};for(const uid of ['student',OWNER_UID])seed['users/'+uid]={nickname:uid,allowedModules:null};
    this.memory=new MemoryStore(seed);
    this.dependencies={store:new LedgerCacheStore(this.memory,new SqlLedgerCache(ctx.storage.sql),()=>now),now:()=>now,discord:async()=>{},authenticate:async request=>{
      const uid=request.headers.get('Authorization')?.replace('Bearer ','');if(!['student',OWNER_UID].includes(uid))fail(401,'unauthenticated','Test login required');
      return {uid,profile:(await this.memory.get('users/'+uid)).data};
    }};
  }
  async inspect(){return {reports:(await this.memory.list('lmsReports')).map(d=>d.data),jobs:(await this.memory.list('lmsJobs')).map(d=>({id:d.data.id,status:d.data.status}))};}
  checker(){const lesson={name:'СУММ',enName:'SUM',table:[['Значения'],[2],[3]],expected:['=SUM(A2:A3)'],result:'5'},verified=calculateExcel({lesson,type:'verify'});return {verified,good:calculateExcel({lesson:{...lesson,...verified},type:'answer',formula:'=SUM(A2:A3)'}),bad:calculateExcel({lesson:{...lesson,...verified},type:'answer',formula:'=SUM(A2:A2)'})};}
}
export default {...gateway,async fetch(request,env){
  const path=new URL(request.url).pathname,stub=env.LMS_RUNTIME.getByName('lms-v1');
  if(path==='/__fixture/inspect')return stub.inspect().then(Response.json);
  if(path==='/__fixture/checker')return stub.checker().then(Response.json);
  if(path==='/__fixture/firestore-transport'){
    const store=new FirestoreStore({FIREBASE_PROJECT_ID:'fixture-lms'});
    store.token=async()=> 'synthetic-token';
    store.base='http://127.0.0.1:'+new URL(request.url).searchParams.get('port');
    return Response.json(await store.get('users/student'));
  }
  if(path==='/__fixture/queue'){
    const body=await request.json();let outcome='none';
    await gateway.queue({messages:[{body,attempts:1,ack(){outcome='ack';},retry(){outcome='retry';}}]},env);
    return Response.json({outcome});
  }
  if(path==='/__fixture/schedule'){
    const pending=[];gateway.scheduled({scheduledTime:now},env,{waitUntil(promise){pending.push(promise);}});await Promise.all(pending);return Response.json({ok:true});
  }
  return gateway.fetch(request,env);
}};
