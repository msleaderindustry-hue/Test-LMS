import test from 'node:test';import assert from 'node:assert/strict';
import {unstable_startWorker} from 'wrangler';import {OWNER_UID} from '../../server/domain.mjs';
import {createServer} from 'node:http';import {once} from 'node:events';
test('Free gateway runs authenticated API, SQLite cache, queue and Excel checker in real workerd',async t=>{
  const worker=await unstable_startWorker({config:'tests/fixtures/wrangler.runtime.toml',dev:{remote:false,persist:false,logLevel:'error'}});t.after(()=>worker.dispose());await worker.ready;
  const database=createServer((req,res)=>{
    assert.equal(req.url,'/users/student');assert.equal(req.headers.authorization,'Bearer synthetic-token');
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({name:'projects/fixture-lms/databases/(default)/documents/users/student',fields:{nickname:{stringValue:'Fixture'}},updateTime:'2026-11-18T00:00:00Z'}));
  });database.listen(0,'127.0.0.1');await once(database,'listening');t.after(()=>new Promise(resolve=>database.close(resolve)));
  const stored=await worker.fetch('https://local.test/__fixture/firestore-transport?port='+database.address().port);
  assert.equal(stored.status,200,await stored.clone().text());assert.equal((await stored.json()).data.nickname,'Fixture');
  const request=(path,body,uid='student')=>worker.fetch('https://local.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:'https://lms.test',Authorization:'Bearer '+uid,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
  assert.equal((await request('/health',undefined,'invalid')).status,401);
  assert.equal((await request('/health')).status,200);
  const response=await request('/attempts',{id:'runtime-attempt',module:'tests',skill:'algebra',total:10,correct:8,durationMs:60000});assert.equal(response.status,200,await response.clone().text());
  const analysis=await (await request('/analysis')).json();assert.equal(analysis.totals.attempts,1);
  assert.equal((await request('/analysis?uid='+OWNER_UID)).status,403);
  assert.equal((await request('/proposals/cleanup',{kind:'activity'})).status,403);
  assert.equal((await request('/runJob',{},OWNER_UID)).status,404);
  const job=await (await request('/reports',{kind:'weekly'},OWNER_UID)).json();assert.ok(job.jobId);
  const delivered=await (await request('/__fixture/queue',{id:job.jobId})).json();assert.equal(delivered.outcome,'ack');
  const inspected=await (await worker.fetch('https://local.test/__fixture/inspect')).json();assert.equal(inspected.reports.length,1);assert.equal(inspected.jobs.find(j=>j.id===job.jobId).status,'completed');
  const checked=await (await worker.fetch('https://local.test/__fixture/checker')).json();assert.equal(checked.good.correct,true);assert.equal(checked.bad.correct,false);
  assert.equal((await request('/__fixture/schedule',{})).status,200);
});
