// Synthetic CPU/data-volume check only. No production network, secrets or Discord.
import {performance} from 'node:perf_hooks';
import {MemoryStore} from '../tests/helpers/memory-store.mjs';
import {JobService} from '../server/jobs.mjs';
import {EventService} from '../server/events.mjs';
import {LearningService} from '../server/learning.mjs';
import {DAY,OWNER_UID} from '../server/domain.mjs';
import {draftCriteria} from '../server/proficiency.mjs';
const end=Date.parse('2026-11-22T15:00:00Z'),start=end-7*DAY;
const output=[];
for(const size of [10,30,60]){
  const seed={'lmsSettings/control':{proficiency:draftCriteria(),proficiencyApprovedAt:end-30*DAY}},ids=Array.from({length:size},(_,i)=>'load-'+i);
  for(const uid of ids){
    seed['users/'+uid]={nickname:uid,groupId:'load-group-'+Math.floor(Number(uid.slice(5))/10),allowedModules:null};
    for(let day=0;day<30;day++)for(let i=0;i<20;i++){
      const id=day+':'+i;seed['lmsAttempts/'+uid+':'+id]={id,uid,module:'tests',skill:'topic-'+i%3,language:'ru',mode:'practice',difficulty:'easy',at:end-day*DAY-3600000-i*60000,correct:8,total:10,score:80,hints:0,durationMs:60000,verified:false};
    }
    for(let day=0;day<7;day++)for(let i=0;i<240;i++){
      const id=day+':'+i;seed['lmsEvents/'+uid+':'+id]={id,uid,sessionId:'s-'+day,kind:'active',section:'typing',at:end-day*DAY-3600000-i*30000,receivedAt:end-day*DAY-3600000-i*30000,durationMs:30000};
    }
  }
  const store=new MemoryStore(seed),learning=new LearningService({store,ownerUid:OWNER_UID,now:()=>end}),jobs=new JobService({store,learning,now:()=>end}),events=new EventService({store,now:()=>end});
  const burstStart=performance.now();await Promise.all(ids.map(uid=>events.ingest({uid},{events:Array.from({length:30},(_,i)=>({id:'burst-'+i,sessionId:'burst',kind:'navigation',section:'tests',at:end-1}))})));
  const result={students:size,attemptsIn30Days:size*600,eventsInWeek:size*1680,simultaneousBatches:size,burstMs:Math.round(performance.now()-burstStart),type:'synthetic-local-no-network'};
  const began=performance.now();
  try{
    const {report}=await jobs.buildReport({kind:'weekly',start,end,uid:null},'load-'+size);
    const students=await store.list('lmsReports/load-'+size+'/students',{limit:500});
    if(report.studentCount!==size||report.totals.attempts!==size*140||!report.reconciliation.consistent||students.some(s=>s.data.activeMs!==14*3600000))throw Error('Incorrect totals under load');
    Object.assign(result,{reportMs:Math.round(performance.now()-began),status:'passed',weeklyAttempts:report.totals.attempts,activeHoursPerStudent:14});
  }catch(e){Object.assign(result,{reportMs:Math.round(performance.now()-began),status:'failed',error:e.code||e.message});}
  output.push(result);console.log(JSON.stringify(result));
}
if(output.some(r=>r.status!=='passed'))process.exitCode=1;
