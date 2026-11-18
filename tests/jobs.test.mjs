import test from 'node:test';import assert from 'node:assert/strict';import {JobService,splitNotification} from '../server/jobs.mjs';import {MemoryStore} from './helpers/memory-store.mjs';import {initialPolicy,DAY} from '../server/domain.mjs';import {analyze,aggregate} from '../server/metrics.mjs';
import {LearningService} from '../server/learning.mjs';
test('enabling reports before 20:00 waits for the first agreed delivery time',async()=>{
  let now=Date.parse('2026-11-18T08:00Z');const store=new MemoryStore({'lmsSettings/control':{...initialPolicy(),reports:{enabled:true,enabledAt:now}}}),jobs=new JobService({store,now:()=>now});
  await jobs.schedule(now);assert.equal((await store.query('lmsJobs',[['kind','EQUAL','report']])).length,0);
  now=Date.parse('2026-11-18T15:00Z');await jobs.schedule(now);assert.equal((await store.query('lmsJobs',[['kind','EQUAL','report']])).length,1);
});
test('quiet five-minute intervals create no activity jobs; real events survive until a digest is queued',async()=>{
  let now=Date.parse('2026-11-18T15:00Z');const store=new MemoryStore({'lmsSettings/control':{...initialPolicy(),reports:{enabled:true}}}),jobs=new JobService({store,now:()=>now});
  await jobs.schedule(now);const initial=await store.get('lmsSettings/eventCursor');
  now+=5*60000;await jobs.schedule(now);assert.equal((await store.get('lmsSettings/eventCursor')).version,initial.version);assert.equal((await store.query('lmsJobs',[['kind','EQUAL','events']])).length,0);
  await store.commit([{path:'lmsEvents/s:e',version:null,data:{uid:'s',kind:'navigation',section:'word',receivedAt:now-1,at:now-1}}]);
  now+=5*60000;await jobs.schedule(now);const events=await store.query('lmsJobs',[['kind','EQUAL','events']]);assert.equal(events.length,1);assert.ok(events[0].data.payload.start<now-5*60000&&events[0].data.payload.end>now-5*60000);
});
test('cold weekly report for ten students stays under the Free external-subrequest budget',async()=>{
  const now=Date.parse('2026-11-22T15:05Z'),seed={};for(let i=0;i<10;i++)seed['users/s'+i]={nickname:'Student '+i};
  const source=new MemoryStore(seed);let calls=0;
  const store={atomic:fn=>source.atomic(fn)};for(const method of ['get','getMany','list','query','commit'])store[method]=async(...args)=>{if(method!=='commit'||args[0].length)calls++;return source[method](...args);};
  const learning=new LearningService({store,now:()=>now}),jobs=new JobService({store,learning,now:()=>now,discord:async()=>{calls++;}});
  const job=await jobs.enqueue('report',{kind:'weekly',start:now-5*60000-7*DAY,end:now-5*60000},'free');calls=0;
  await jobs.run(job.jobId);assert.ok(calls<=45,`Expected room for token refresh below 50 subrequests; got ${calls}`);
});
test('reports schedule both kinds and never send weekly before Sunday 20:05 Tashkent',async()=>{let now=Date.parse('2026-11-22T15:00:00Z');const store=new MemoryStore({'lmsSettings/control':{...initialPolicy(),reports:{enabled:true}}}),queued=[],jobs=new JobService({store,queue:{send:async x=>queued.push(x)},now:()=>now});await jobs.schedule(now);let rows=(await store.list('lmsJobs')).filter(x=>x.data.kind==='report');assert.deepEqual(rows.map(x=>x.data.payload.kind),['daily']);now+=5*60000;await jobs.schedule(now);rows=(await store.list('lmsJobs')).filter(x=>x.data.kind==='report');assert.equal(rows.length,2);assert.ok(rows.some(x=>x.data.payload.kind==='weekly'));await jobs.schedule(now);assert.equal((await store.list('lmsJobs')).filter(x=>x.data.kind==='report').length,2);});
test('429 delivery keeps the job and resumes after retry_after without duplicating confirmed parts',async()=>{let now=100000,sends=0;const store=new MemoryStore(),sent=[],jobs=new JobService({store,now:()=>now,discord:async content=>{sends++;if(sends===2){const e=Error('429');e.retryAfter=60;throw e;}sent.push(content);}});const job=await jobs.enqueue('notification',{content:'A'.repeat(1800)+'\n'+'B'.repeat(1800)},'test');await assert.rejects(()=>jobs.run(job.jobId));const state=await store.get('lmsJobs/'+job.jobId);assert.equal(state.data.status,'pending');assert.equal(state.data.sentParts,1);await assert.rejects(()=>jobs.run(job.jobId));now+=61000;await jobs.run(job.jobId);assert.equal(sent.length,2);assert.equal((await store.get('lmsJobs/'+job.jobId)).data.status,'completed');await jobs.run(job.jobId);assert.equal(sent.length,2);});
test('long notifications split without losing students or exceeding Discord limit',()=>{const text=Array.from({length:100},(_,i)=>`Ученик ${i}: вошёл; завершил упражнение; вернулся во вкладку`).join('\n'),parts=splitNotification(text);assert.ok(parts.every(x=>x.length<=1850));assert.equal(parts.join('\n'),text);});
test('weekly report has seven raw partitions and flags missing saved daily snapshots',async()=>{const end=Date.parse('2026-11-22T15:00:00Z'),store=new MemoryStore({'users/a':{nickname:'Ученик',allowedModules:null},'lmsAttempts/a':{id:'a',uid:'a',at:end-1000,module:'tests',skill:'test',language:'ru',mode:'practice',difficulty:'easy',total:10,correct:8,score:80,hints:0,durationMs:60000,verified:false}});const jobs=new JobService({store,now:()=>end}),{report}=await jobs.buildReport({kind:'weekly',start:end-7*DAY,end,uid:null},'week');assert.equal(report.reconciliation.consistent,true);assert.equal(report.reconciliation.savedDaily.length,7);assert.ok(report.reconciliation.savedDaily.every(x=>x.status==='missing'));assert.equal(report.students,undefined);assert.equal((await store.list('lmsReports/week/students')).length,1);});

test('per-student report batches preserve exact totals, trends and group medians',async()=>{
  const end=Date.parse('2026-11-22T15:00:00Z'),start=end-7*DAY,seed={},rows=[];
  for(let person=0;person<5;person++){
    const uid='student-'+person;seed['users/'+uid]={nickname:uid,groupId:person<4?'group-a':'group-b'};
    for(let period=0;period<2;period++)for(let attempt=0;attempt<3;attempt++){
      const correct=Math.max(0,10-2*person-period),id=period+':'+attempt;
      const row={uid,id,module:'tests',skill:'exam',language:'ru',mode:'practice',difficulty:'easy',at:end-period*7*DAY-1000-attempt*60000,total:10,correct,score:correct*10,hints:0,durationMs:60000,verified:false,items:Array.from({length:10},(_,i)=>({skill:'algebra',total:1,correct:i<correct?1:0}))};
      rows.push(row);seed['lmsAttempts/'+uid+':'+id]=row;
    }
  }
  const store=new MemoryStore(seed),jobs=new JobService({store,now:()=>end}),{report}=await jobs.buildReport({kind:'weekly',start,end},'batched');
  assert.deepEqual(report.totals,aggregate(rows.filter(r=>r.at>=start&&r.at<end)));
  for(let person=0;person<5;person++){
    const uid='student-'+person,actual=(await store.get('lmsReports/batched/students/'+uid)).data;
    const expected=analyze(rows,{uid,start,end,peers:person<4?['student-0','student-1','student-2','student-3']:[]});
    assert.deepEqual(actual.skills,expected.skills);assert.deepEqual(actual.recommendations,expected.recommendations);
  }
  assert.equal((await store.get('lmsReports/batched/students/student-0')).data.skills[0].groupMedian,60);
});
