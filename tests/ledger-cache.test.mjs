import test from 'node:test';import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {LedgerCacheStore,SqlLedgerCache} from '../server/ledger-cache.mjs';
import {MemoryStore} from './helpers/memory-store.mjs';import {DAY} from '../server/domain.mjs';
const end=Date.parse('2026-11-18T15:00Z'),query=uid=>[['uid','EQUAL',uid],['at','GREATER_THAN_OR_EQUAL',end-7*DAY],['at','LESS_THAN',end]];
function setup(t){
  const db=new DatabaseSync(':memory:');t.after(()=>db.close());
  const sql={exec(statement,...bindings){const s=db.prepare(statement);return s.columns().length?s.all(...bindings):(s.run(...bindings),[]);}};
  const source=new MemoryStore({'lmsAttempts/s:old':{uid:'s',id:'old',at:end-60000,correct:1,total:2},'lmsAttempts/other:x':{uid:'other',id:'x',at:end-60000},'users/s':{isBanned:false}});
  let reads=0;const original=source.query.bind(source);source.query=async(...args)=>{reads++;return original(...args);};
  const cache=new SqlLedgerCache(sql,()=>end),store=new LedgerCacheStore(source,cache,()=>end);
  return {source,cache,store,sql,reads:()=>reads};
}
test('moving analytics windows reuse private cache and appends stay visible without full history reads',async t=>{
  const {store,reads}=setup(t);await store.query('lmsAttempts',query('s'));assert.equal(reads(),1);
  const q=query('s');q[2][2]+=60000;
  await store.commit([{path:'lmsAttempts/s:new',version:null,data:{uid:'s',id:'new',at:end,correct:1,total:1}}]);
  const rows=await store.query('lmsAttempts',q);assert.deepEqual(rows.map(r=>r.data.id),['old','new']);assert.equal(reads(),1);
  assert.equal((await store.query('lmsAttempts',query('other'))).length,1);assert.equal(reads(),2);
});
test('cleanup and restore update only cache copies; authoritative profiles and versions never use cache',async t=>{
  const {store,source,reads}=setup(t);await store.query('lmsAttempts',query('s'));
  const old=await store.get('lmsAttempts/s:old');await store.commit([{path:old.path,version:old.version,delete:true}]);
  assert.equal((await store.query('lmsAttempts',query('s'))).length,0);
  await store.commit([{path:old.path,version:null,data:old.data}]);assert.equal((await store.query('lmsAttempts',query('s'))).length,1);assert.equal(reads(),1);
  const u=await source.get('users/s');await source.commit([{path:u.path,version:u.version,data:{isBanned:true}}]);assert.equal((await store.get('users/s')).data.isBanned,true);
  assert.equal((await store.query('lmsAttempts',[['uid','EQUAL','s']]))[0].version,(await source.get(old.path)).version);
});
test('a crash after remote commit invalidates pending cache on restart',async t=>{
  const {store,source,cache,sql}=setup(t);await store.query('lmsAttempts',query('s'));
  const writes=[{path:'lmsAttempts/s:after',version:null,data:{uid:'s',id:'after',at:end-1}}];cache.begin(writes);await source.commit(writes);
  const resumed=new LedgerCacheStore(source,new SqlLedgerCache(sql),()=>end);
  assert.deepEqual((await resumed.query('lmsAttempts',query('s'))).map(r=>r.data.id),['old','after']);
});
test('concurrent commits and uncertain failures discard stale cached versions',async t=>{
  const {store,source,cache}=setup(t);await store.query('lmsAttempts',query('s'));
  const one=[{path:'lmsAttempts/s:one',version:null,data:{uid:'s',id:'one',at:end-2}}],two=[{path:'lmsAttempts/s:two',version:null,data:{uid:'s',id:'two',at:end-1}}];
  const a=cache.begin(one),b=cache.begin(two);await source.commit(one);await source.commit(two);cache.finish(b,two,true);cache.finish(a,one,true);
  assert.equal((await store.query('lmsAttempts',query('s'))).length,3);
  await assert.rejects(()=>store.commit(one),{code:'conflict'});assert.equal((await store.query('lmsAttempts',query('s'))).length,3);
});
test('a query racing a commit cannot persist an older snapshot',async t=>{
  const {store,source}=setup(t);let release,queried;
  const ready=new Promise(resolve=>queried=resolve),wait=new Promise(resolve=>release=resolve),original=source.query.bind(source);
  source.query=async(...args)=>{const rows=await original(...args);queried();await wait;return rows;};
  const pending=store.query('lmsAttempts',query('s'));await ready;
  await store.commit([{path:'lmsAttempts/s:racing',version:null,data:{uid:'s',id:'racing',at:end-1}}]);release();await pending;
  source.query=original;assert.equal((await store.query('lmsAttempts',query('s'))).length,2);
});
