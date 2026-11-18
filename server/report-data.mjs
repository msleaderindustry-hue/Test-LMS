import {analyze,activeTime,median} from './metrics.mjs';
import {mergeHistory} from './history.mjs';
import {evaluateProficiency} from './proficiency.mjs';
import {fail} from './domain.mjs';

// Keep detailed keys/question arrays only for the student being calculated.
// The report retains compact counters for exact group totals and reconciliation.
export async function loadReportData({store,learning,now},profiles,policy,{start,end}){
  const span=end-start,from=Math.min(start-span,policy?.proficiencyApprovedAt?end-(policy.proficiency?.windowDays||30)*86400000:start);
  const students=[],periodRows=[];
  async function one(profile){
    const uid=profile.path.split('/')[1];
    const ledger=(await store.query('lmsAttempts',[['uid','EQUAL',uid],['at','GREATER_THAN_OR_EQUAL',from],['at','LESS_THAN',end]],4000)).map(x=>x.data);
    const rows=mergeHistory(ledger,[[uid,profile.data]],now());
    const result={name:profile.data.nickname||profile.data.displayName||'Ученик',...analyze(rows,{uid,start,end}),proficiency:evaluateProficiency(ledger,policy,end)};
    const events=(await store.query('lmsEvents',[['uid','EQUAL',uid],['at','GREATER_THAN_OR_EQUAL',start],['at','LESS_THAN',end]],5000)).map(x=>x.data);
    result.activeMs=activeTime(events,start,end);
    if(learning)result.assignments=await learning.taskSummary(uid,end);
    const compact=rows.filter(r=>r.at>=start&&r.at<end).map(r=>({uid:r.uid,id:r.id,module:r.module,at:r.at,total:r.total,correct:r.correct,hints:r.hints,durationMs:r.durationMs,cpm:r.cpm??null,verified:r.verified}));
    return {result,compact};
  }
  // Two students at a time bounds database fan-out and retained detailed payloads.
  for(let offset=0;offset<profiles.length;offset+=2){
    for(const {result,compact} of await Promise.all(profiles.slice(offset,offset+2).map(one))){
      if(periodRows.length+compact.length>100000)fail(413,'report-limit','За период больше 100 000 попыток. Выберите меньший период или отдельного ученика.');
      students.push(result);periodRows.push(...compact);
    }
  }
  // The median is taken over each peer's weighted skill score, not over questions
  // or over a mean of percentages; this matches individual analysis semantics.
  const groups=new Map(profiles.map(p=>[p.path.split('/')[1],p.data.groupId]));
  for(const student of students){
    const group=groups.get(student.uid);if(!group)continue;
    const peers=students.filter(p=>p.uid!==student.uid&&groups.get(p.uid)===group);
    for(const skill of student.skills){
      const scores=peers.map(p=>p.skills.find(s=>s.key===skill.key)?.current.score).filter(x=>x!=null);
      skill.groupStudents=scores.length;skill.groupMedian=scores.length>=3?median(scores):null;
    }
  }
  return {students,periodRows};
}
