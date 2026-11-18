import { DAY, MODULES, fail, number, integer, requireId, text } from './domain.mjs';
export const percent = (correct,total) => total > 0 ? Math.round(correct / total * 10000) / 100 : null;
export const median = values => { if (!values.length) return null; const a=[...values].sort((x,y)=>x-y),i=Math.floor(a.length/2); return a.length%2?a[i]:(a[i-1]+a[i])/2; };
export function normalizeAttempt(input, uid, receivedAt) {
  if (!input || !MODULES.includes(input.module)) fail(400,'invalid-attempt','Неизвестный раздел результата.');
  const durationMs = number(input.durationMs ?? 0,0,8*60*60*1000,'длительность');
  const correct = integer(input.correct ?? 0,0,100000,'правильные ответы');
  const total = integer(input.total ?? 0,0,100000,'все ответы');
  if (correct > total) fail(400,'invalid-attempt','Правильных ответов больше общего количества.');
  const out = { id: requireId(input.id), uid, module: input.module, skill: text(input.skill,120)||input.module, language: text(input.language,12), mode: text(input.mode,30)||'practice', difficulty: text(input.difficulty,30)||'unspecified', at: receivedAt, durationMs, correct, total, hints: integer(input.hints??0,0,10000,'подсказки'), skipped: integer(input.skipped??0,0,10000,'пропуски'), score: percent(correct,total), source: 'client-observation', verified: false };
  if (input.module === 'typing') {
    out.characters = integer(input.characters ?? correct,0,100000,'знаки');
    out.errors = integer(input.errors ?? total-correct,0,100000,'ошибки');
    out.correct = out.characters; out.total = out.characters + out.errors;
    out.score = percent(out.correct,out.total);
    out.cpm = durationMs >= 1000 ? Math.round(out.characters * 60000 / durationMs) : null;
    out.wpm = out.cpm == null ? null : Math.round(out.cpm / 5 * 100) / 100;
    if (out.cpm > 2000) fail(400,'implausible-result','Скорость требует перепроверки.');
  }
  return out;
}
function unique(rows) { return [...new Map(rows.map(r=>[r.uid+':'+r.id,r])).values()]; }
export function aggregate(rows) {
  rows = unique(rows);
  const total=rows.reduce((s,r)=>s+r.total,0),correct=rows.reduce((s,r)=>s+r.correct,0);
  return { attempts: rows.length, total, correct, score: percent(correct,total), hints: rows.reduce((s,r)=>s+r.hints,0), durationMs: rows.reduce((s,r)=>s+r.durationMs,0), medianCpm: median(rows.filter(r=>r.cpm!=null).map(r=>r.cpm)), independentAttempts: rows.filter(r=>r.hints===0).length, verifiedAttempts: rows.filter(r=>r.verified).length };
}
const comparableKey = r => [r.module,r.skill,r.language,r.mode,r.difficulty].join('|');
export function analyze(rows,{uid,start,end,peers=[]}) {
  const mine=unique(rows.filter(r=>r.uid===uid)), current=mine.filter(r=>r.at>=start&&r.at<end), previous=mine.filter(r=>r.at>=start-(end-start)&&r.at<start);
  const bySkill=rows=>rows.flatMap(r=>r.items?.length?r.items.map((x,i)=>({...r,...x,id:r.id+':item:'+i,items:undefined,score:percent(x.correct,x.total),durationMs:0,hints:0})):r);
  const skillCurrent=bySkill(current),skillPrevious=bySkill(previous),skillRows=bySkill(rows);
  const keys=[...new Set(skillCurrent.map(comparableKey))],skills=keys.map(key=>{
    const selected=skillCurrent.filter(r=>comparableKey(r)===key),before=skillPrevious.filter(r=>comparableKey(r)===key),now=aggregate(selected),old=aggregate(before);
    // Three separate sessions, not three questions in a single test.
    now.attempts=new Set(selected.map(r=>r.id.split(':item:')[0])).size;old.attempts=new Set(before.map(r=>r.id.split(':item:')[0])).size;
    const cohort=unique(skillRows.filter(r=>peers.includes(r.uid)&&r.uid!==uid&&r.at>=start&&r.at<end&&comparableKey(r)===key));
    const peerScores=[...new Set(cohort.map(r=>r.uid))].map(id=>aggregate(cohort.filter(r=>r.uid===id)).score).filter(x=>x!=null);
    const evidence=now.attempts>=3&&now.total>=10;
    return { key,module:selected[0].module,skill:selected[0].skill,language:selected[0].language,current:now,previous:old,deltaPoints:evidence&&old.attempts>=3&&old.total>=10?Math.round((now.score-old.score)*100)/100:null,groupMedian:peerScores.length>=3?median(peerScores):null,groupStudents:peerScores.length,confidence:evidence?'sufficient':'insufficient' };
  });
  const recommendations=skills.filter(s=>s.confidence==='sufficient').sort((a,b)=>a.current.score-b.current.score).map(s=>({ module:s.module,skill:s.skill,kind:s.current.score<85?'reinforce':s.current.score>=95?'challenge':'practice',reason:`${s.current.correct} из ${s.current.total} верных ответов (${s.current.score}%) за ${s.current.attempts} попыток`+(s.deltaPoints==null?'':`; изменение ${s.deltaPoints>0?'+':''}${s.deltaPoints} п. п.`),evidence:{key:s.key,start,end,attempts:s.current.attempts,correct:s.current.correct,total:s.current.total} }));
  if (!recommendations.length) recommendations.push({kind:'diagnose',reason:'Недостаточно сопоставимых попыток. Нужна исходная диагностика.',evidence:{start,end,attempts:current.length}});
  const keysWeak={};for(const r of current.filter(x=>x.module==='typing'))for(const [key,m] of Object.entries(r.keyMetrics||{})){const id=r.language+':'+key,p=keysWeak[id]||{language:r.language,char:m.char,attempts:0,errors:0};p.attempts+=m.attempts;p.errors+=m.errors;keysWeak[id]=p;}
  const weakKeys=Object.values(keysWeak).filter(x=>x.attempts>=10&&x.errors>0).map(x=>({...x,errorPercent:percent(x.errors,x.attempts)})).sort((a,b)=>b.errorPercent-a.errorPercent).slice(0,10);
  return { uid,start,end,totals:aggregate(current),byModule:Object.fromEntries([...new Set(current.map(x=>x.module))].map(m=>[m,aggregate(current.filter(x=>x.module===m))])),previous:aggregate(previous),skills,weakKeys,recommendations,proficiency:{status:'not-configured',reason:'Критерии «профи» ещё не утверждены владельцем.'} };
}
// Merge overlapping observed active intervals, including simultaneous browser tabs.
// This is an estimate of activity in the LMS, not proof of attention or study quality.
export function activeTime(events,start,end) {
  const intervals=events.filter(e=>e.kind==='active'&&Number.isFinite(e.at)&&Number.isFinite(e.durationMs)&&e.durationMs>0&&e.durationMs<=90000).map(e=>[Math.max(start,e.at-e.durationMs),Math.min(end,e.at)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
  let sum=0,tail=null;
  for (const [a,b] of intervals) { if (!tail) tail=[a,b]; else if(a<=tail[1])tail[1]=Math.max(tail[1],b);else{sum+=tail[1]-tail[0];tail=[a,b];} }
  return sum+(tail?tail[1]-tail[0]:0);
}
export function reconcileWeek(rows,start,end) {
  if (end-start!==7*DAY) fail(400,'invalid-week','Недельный период должен содержать семь суток.');
  const daily=Array.from({length:7},(_,i)=>({start:start+i*DAY,end:start+(i+1)*DAY,...aggregate(rows.filter(r=>r.at>=start+i*DAY&&r.at<start+(i+1)*DAY))}));
  const week=aggregate(rows.filter(r=>r.at>=start&&r.at<end));
  return { daily,week,consistent:['attempts','correct','total','durationMs'].every(k=>daily.reduce((s,d)=>s+d[k],0)===week[k]) };
}
