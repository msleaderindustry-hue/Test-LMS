import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAttempt, aggregate, analyze, activeTime, reconcileWeek } from '../server/metrics.mjs';
import { initialPolicy, setAutomatic, OWNER_UID, DAY, reportWindow, scheduledKinds } from '../server/domain.mjs';
const row=(id,at,correct,total,extra={})=>normalizeAttempt({id,module:'tests',skill:'fractions',correct,total,durationMs:60000,...extra},'student-a',at);
test('weighted percentages; duplicate deliveries do not inflate results',()=>{
  const a=row('a',1,1,1),b=row('b',2,0,9);
  assert.deepEqual(aggregate([a,a,b]),{attempts:2,total:10,correct:1,score:10,hints:0,durationMs:120000,medianCpm:null,independentAttempts:2,verifiedAttempts:0});
});
test('typing uses one canonical unit and code-computed accuracy',()=>{
  const a=row('typing',1,0,0,{module:'typing',characters:250,errors:5,durationMs:60000,score:100,verified:true});
  assert.equal(a.cpm,250);assert.equal(a.wpm,50);assert.equal(a.score,98.04);assert.equal(a.verified,false);
  assert.throws(()=>row('bad',1,3,2)); assert.throws(()=>row('bad',1,NaN,2));
});
test('absence of evidence is not a zero score or invented trend',()=>{
  const result=analyze([],{uid:'student-a',start:100,end:200});
  assert.equal(result.totals.score,null);assert.equal(result.recommendations[0].kind,'diagnose');assert.equal(result.proficiency.status,'not-configured');
});
test('comparison excludes a different skill, language or level',()=>{
  const data=[1,2,3].map(i=>row('a'+i,120,8,10));
  data.push({...row('wrong',120,0,10,{language:'en'}),uid:'student-b'});
  const r=analyze(data,{uid:'student-a',start:100,end:200,peers:['student-b']});
  assert.equal(r.skills[0].groupMedian,null);assert.equal(r.skills[0].deltaPoints,null);assert.match(r.recommendations[0].reason,/24 из 30/);
});
test('active time merges concurrent tabs and ignores idle, future and unbounded intervals',()=>{
  assert.equal(activeTime([{kind:'active',at:60000,durationMs:60000},{kind:'active',at:90000,durationMs:60000},{kind:'idle',at:120000,durationMs:30000},{kind:'active',at:1e9,durationMs:60000},{kind:'active',at:90000,durationMs:90001}],0,120000),90000);
});
test('daily 20:00 and weekly Sunday 20:05 use the same exact end boundary',()=>{
  const now=Date.parse('2026-11-22T15:05:00Z'),w=reportWindow('weekly',now),d=reportWindow('daily',now);
  assert.equal(w.end,d.end);assert.equal(w.end-w.start,7*DAY);assert.deepEqual(scheduledKinds(now),['weekly']);
  assert.deepEqual(scheduledKinds(now-5*60000),['daily']);
  assert.equal(reportWindow('daily',Date.parse('2026-11-22T14:59:00Z')).end,Date.parse('2026-11-21T15:00:00Z'));
});
test('weekly totals reconcile raw counts rather than daily percentage averages',()=>{
  const r=reconcileWeek([row('a',1,1,1),row('b',DAY+1,0,9),row('outside',7*DAY,1,1)],0,7*DAY);
  assert.equal(r.week.score,10);assert.equal(r.consistent,true);assert.equal(r.week.attempts,2);
});
test('fourteen days do not automatically enable assignments; only owner can enable',()=>{
  const policy={...initialPolicy(),pilotStartedAt:100};
  assert.equal(policy.autoAssignments,false);
  assert.throws(()=>setAutomatic(policy,{uid:'student'},true,100+15*DAY));
  assert.throws(()=>setAutomatic(policy,{uid:OWNER_UID},true,100+14*DAY-1));
  assert.equal(setAutomatic(policy,{uid:OWNER_UID},true,100+14*DAY).autoAssignments,true);
  assert.equal(initialPolicy().proficiency,null);
});
