import { fail, requireId, enabled, integer, text, freshId, WORD_LESSONS } from './domain.mjs';
import { normalizeAttempt, analyze, activeTime } from './metrics.mjs';
import { timestamp, millis } from './firestore.mjs';
import { checkWord } from './generated/word-checker.mjs';
import { calculateExcel, difficultyForExcel } from './generated/excel-checker.mjs';
import { evaluateProficiency } from './proficiency.mjs';
import { mergeHistory } from './history.mjs';
export function gradeHotkeys(task,evidence){
  if(!Array.isArray(evidence.records)||!evidence.records.length||evidence.records.length>60)fail(400,'invalid-evidence','Некорректная серия сочетаний.');
  const stats={total:evidence.records.length,solved:0,failed:0,skipped:0,pending:0,hints:0,errors:0,corrected:0};const ids=[];
  for(const row of evidence.records){if(!['solved','failed','skipped','pending'].includes(row.status))fail(400,'invalid-evidence','Некорректный ответ серии.');stats[row.status]++;stats.errors+=integer(row.errors,0,20,'ошибки');stats.hints+=row.hint===true?1:0;if(row.status==='solved'&&row.errors>0&&!row.hint)stats.corrected++;ids.push(text(row.taskId,64));}
  const reasons=[];if(evidence.total!==stats.total||ids.some(x=>!x)||new Set(ids).size!==ids.length)reasons.push('invalid');
  if(stats.total<5)reasons.push('too_short');if(stats.skipped)reasons.push('skipped');if(stats.hints)reasons.push('hint');if(stats.failed||stats.pending)reasons.push('unsolved');
  if(task.maxErrors!=null&&stats.errors>task.maxErrors)reasons.push('errors');
  if(evidence.records.some(r=>task.hotkeyBank&&task.hotkeyBank!=='any'?r.program!==task.hotkeyBank:!['word','windows','excel','legacy'].includes(r.program)))reasons.push('category');
  return {accepted:!reasons.length,stats,reasons,bank:task.hotkeyBank||'any'};
}
function boundedDocument(snapshot){
  if(typeof snapshot!=='string'||new TextEncoder().encode(snapshot).length>800000)fail(400,'invalid-document','Некорректный документ.');
  let data;try{data=JSON.parse(snapshot)}catch{fail(400,'invalid-document','Не удалось прочитать документ.');}
  let count=0;const visit=(node,depth)=>{if(++count>15000||depth>60)fail(400,'document-limit','Документ слишком сложный.');if(node&&typeof node==='object')for(const value of Object.values(node)){if(Array.isArray(value))for(const x of value)visit(x,depth+1);else if(value&&typeof value==='object')visit(value,depth+1);}};visit(data,0);return data;
}
export class LearningService {
  constructor({store,now=()=>Date.now(),ownerUid}){this.store=store;this.now=now;this.ownerUid=ownerUid;}
  async record(actor,input){
    if(!enabled(actor.profile,input.module)&&input.module!=='tests')fail(403,'module-disabled','Раздел отключён.');
    const result=normalizeAttempt(input,actor.uid,this.now());
    if(input.module==='typing'&&input.keyMetrics)result.keyMetrics=cleanKeys(input.keyMetrics);
    if(input.module==='tests'&&Array.isArray(input.items)){
      if(!input.items.length||input.items.length!==result.total||input.items.length>500)fail(400,'invalid-answers','Некорректный список ответов.');
      result.items=input.items.map(x=>({skill:text(x.skill,120)||result.skill,correct:x.correct===true?1:0,total:1}));
      result.correct=result.items.reduce((s,x)=>s+x.correct,0);result.score=Math.round(result.correct/result.total*10000)/100;
    }
    return this.save(actor,result,input);
  }
  async save(actor,result,input={}){
    const path=`lmsAttempts/${actor.uid}:${result.id}`;
    // Values received from a browser are observations, never proof of a passed assignment.
    return this.store.atomic(async()=>{const old=await this.store.get(path);if(old)return {...old.data,replayed:true};
      const versionPath='lmsVersions/'+actor.uid,v=await this.store.get(versionPath),u=await this.store.get('users/'+actor.uid);
      if(!u||u.data.isBanned)fail(403,'account-disabled','Доступ закрыт.');
      const patch=projectProgress(u.data,result,input);
      await this.store.commit([{path,version:null,data:result},{path:versionPath,version:v?.version??null,data:{revision:(v?.data.revision||0)+1,at:this.now()}},...(Object.keys(patch).length?[{path:u.path,version:u.version,data:patch,fields:Object.keys(patch)}]:[])]);
      return {...result,progress:patch};});
  }
  async word(actor,input){
    if(!enabled(actor.profile,'word')||!WORD_LESSONS.includes(input.lesson))fail(403,'module-disabled','Упражнение недоступно.');
    const checks=checkWord(boundedDocument(input.snapshot),input.lesson),result=normalizeAttempt({id:input.id,module:'word',skill:input.lesson,correct:checks.filter(Boolean).length,total:checks.length},actor.uid,this.now());
    result.verified=true;result.source='server-scored';result.checks=checks;const saved=await this.save(actor,result);
    if(saved.module==='word'&&saved.skill===input.lesson&&saved.verified&&saved.score===100)await this.store.atomic(async()=>{const path=`users/${actor.uid}/wordResults/${input.lesson}`,old=await this.store.get(path);if(!old)await this.store.commit([{path,version:null,data:{lesson:input.lesson,completed:true,completedAt:timestamp(this.now()),version:1}}]);});
    return {...saved,checks:saved.checks||[]};
  }
  async excel(actor,input){
    if(!enabled(actor.profile,'excel'))fail(403,'module-disabled','Раздел отключён.');requireId(input.materialId);
    const m=await this.store.get('lmsMaterials/'+input.materialId);if(!m||m.data.uid!==actor.uid||m.data.expiresAt<this.now())fail(409,'material-expired','Загрузите упражнение заново.');
    let checked;try{checked=calculateExcel({lesson:m.data.lesson,type:'answer',formula:text(input.formula,2000)})}catch{checked={correct:false};}
    const result=normalizeAttempt({id:input.id,module:'excel',skill:m.data.lesson.enName,correct:checked.correct?1:0,total:1,hints:input.assisted?1:0,difficulty:m.data.lesson.difficulty},actor.uid,this.now());
    result.verified=true;result.source='server-scored';result.materialId=input.materialId;return this.save(actor,result);
  }
  async assignment(actor,id,action,evidence={}){
    requireId(id);const ref='lmsAssignments/'+id,progressPath=ref+'/progress/'+actor.uid;
    return this.store.atomic(async()=>{
      const [a,p,u]=await Promise.all([this.store.get(ref),this.store.get(progressPath),this.store.get('users/'+actor.uid)]),task=a?.data,profile=u?.data,old=p?.data||{},now=this.now();
      if(!task||task.status!=='assigned'||!task.studentIds?.includes(actor.uid)||!enabled(profile,'assignments')||!enabled(profile,task.module))fail(403,'assignment-denied','Задание недоступно.');
      const safeTask={...task,studentIds:[actor.uid],studentNames:undefined};let next={...old,updatedAt:timestamp(now)},response={task:safeTask};const writes=[];
      if(action==='start'){
        if(old.status==='completed')return {task:safeTask,done:true,alreadyDone:true};
        next={...next,status:'started',startedAt:old.startedAt||timestamp(now),receiptVersion:2,result:old.result||{count:0},acceptedAttemptIds:old.acceptedAttemptIds||[]};
      }else if(action==='help'){
        const question=text(evidence.question,1000);if(!question)fail(400,'question-required','Введите вопрос.');
        next={...next,status:old.status||'not_started',helpQuestion:question,helpReply:'',needsHelp:true,helpRequestedAt:timestamp(now)};
      }else if(action==='sync')return {task:safeTask};
      else if(action==='finish'){
        if(old.status!=='started'&&old.status!=='completed')fail(409,'not-started','Сначала начните задание.');
        const attemptId=requireId(evidence.id||evidence.attemptId),receiptPath=`lmsReceipts/${actor.uid}:${id}:${attemptId}`,receipt=await this.store.get(receiptPath);
        if(receipt)return {...receipt.data.result,task:safeTask,replayed:true};
        if(old.status==='completed')return {task:safeTask,done:true,alreadyDone:true,count:old.result?.count||1,target:task.target||1};
        let accepted=false,attempt,stats=null,reasons=[];
        if(task.module==='typing'){
          if(evidence.text!==task.text||evidence.lang!==task.lang||evidence.characters!==task.text.length)fail(409,'task-changed','Откройте актуальное задание заново.');
          attempt=normalizeAttempt({id:attemptId,module:'typing',characters:task.text.length,errors:evidence.errors,durationMs:evidence.ms,language:task.lang,mode:'assignment',skill:'typing'},actor.uid,now);
          if(evidence.ms<1000||millis(old.startedAt)>now-evidence.ms+5000)fail(400,'invalid-duration','Время попытки требует перепроверки.');
          accepted=attempt.score>=task.minAccuracy;next.result={accuracy:attempt.score,wpm:attempt.wpm,errors:attempt.errors,ms:attempt.durationMs};next.attempts=(old.attempts||0)+1;
        }else if(task.module==='hotkeys'){
          const graded=gradeHotkeys(task,evidence);({accepted,stats,reasons}=graded);
          attempt=normalizeAttempt({id:attemptId,module:'hotkeys',correct:stats.solved,total:stats.total,hints:stats.hints,skipped:stats.skipped,durationMs:evidence.durationMs||0,mode:'assignment',skill:task.hotkeyBank||'any'},actor.uid,now);
          const totals=old.hotkeyStats||{};next.hotkeyStats={};for(const key of ['solved','errors','corrected','hints','skipped'])next.hotkeyStats[key]=(totals[key]||0)+stats[key];
          next.hotkeyStats.failed=(totals.failed||0)+stats.failed+stats.pending;next.hotkeyStats.answers=(totals.answers||0)+stats.total;next.hotkeyStats.attempts=(totals.attempts||0)+1;next.hotkeyStats.accepted=(totals.accepted||0)+(accepted?1:0);
          next.hotkeyLog=[...(old.hotkeyLog||[]),{id:attemptId,at:now,ok:accepted,reasons,...stats,failed:stats.failed+stats.pending}].slice(-30);
        }else if(task.module==='word'){
          const snapshot=boundedDocument(evidence.snapshot);const checks=checkWord(snapshot,task.wordLesson);accepted=checks.length===4&&checks.every(Boolean);
          attempt=normalizeAttempt({id:attemptId,module:'word',correct:checks.filter(Boolean).length,total:4,mode:'assignment',skill:task.wordLesson},actor.uid,now);
        }else if(task.module==='excel'){
          requireId(evidence.materialId);const material=await this.store.get('lmsMaterials/'+evidence.materialId);
          if(!material||material.data.uid!==actor.uid||material.data.module!=='excel'||material.data.expiresAt<now)fail(409,'material-expired','Загрузите новое упражнение Excel.');
          if(task.excelSkill&&material.data.lesson.enName!==task.excelSkill)fail(409,'wrong-skill','В этом задании нужна функция '+task.excelSkill+'.');
          let checked;try{checked=calculateExcel({lesson:material.data.lesson,type:'answer',formula:text(evidence.formula,2000)})}catch{checked={correct:false};}
          accepted=checked.correct===true&&evidence.assisted!==true;
          attempt=normalizeAttempt({id:attemptId,module:'excel',correct:checked.correct===true?1:0,total:1,hints:evidence.assisted?1:0,mode:'assignment',skill:material.data.lesson.enName||material.data.lesson.name,difficulty:material.data.lesson.difficulty},actor.uid,now);
          attempt.materialId=evidence.materialId;
        }else fail(400,'unsupported-module','Раздел не поддерживается.');
        const creditId=task.module==='excel'?evidence.materialId:attemptId;
        const acceptedIds=old.acceptedAttemptIds||[];if(accepted&&!acceptedIds.includes(creditId))next.acceptedAttemptIds=[...acceptedIds,creditId];
        const count=next.acceptedAttemptIds?.length||acceptedIds.length,done=accepted&&count>=(task.target||1);
        if(task.module!=='typing')next.result={count};next.status=done?'completed':'started';next.receiptVersion=2;if(done){next.completedAt=timestamp(now);next.needsHelp=false;}
        // Word/Excel are independently checked; browser input timing and key reports
        // remain observations, not evidence of an unmodified student device.
        attempt={...attempt,assignmentId:id,verified:['word','excel'].includes(task.module),source:'server-scored',accepted};
        response={task:safeTask,accepted,done,count,target:task.target||1,stats,reasons,statsSaved:true,message:done?'Задание выполнено.':accepted?'Попытка засчитана.':'Попытка сохранена, условия зачёта пока не выполнены.'};
        const attemptPath=`lmsAttempts/${actor.uid}:${attemptId}`,existingAttempt=await this.store.get(attemptPath);
        if(existingAttempt?.data.assignmentId&&existingAttempt.data.assignmentId!==id)fail(409,'attempt-used','Попытка уже относится к другому заданию.');
        writes.push({path:attemptPath,version:existingAttempt?.version??null,data:attempt},{path:receiptPath,version:null,data:{uid:actor.uid,assignmentId:id,at:now,result:{...response,task:undefined}}});
        if(!existingAttempt){const patch=projectProgress(profile,attempt,evidence);if(Object.keys(patch).length)writes.push({path:u.path,version:u.version,data:patch,fields:Object.keys(patch)});}
        const vPath='lmsVersions/'+actor.uid,v=await this.store.get(vPath);writes.push({path:vPath,version:v?.version??null,data:{revision:(v?.data.revision||0)+1,at:now}});
      }else fail(400,'unsupported-action','Неизвестное действие задания.');
      writes.push({path:progressPath,version:p?.version??null,data:next});
      const projectionPath=`users/${actor.uid}/assignments/${id}`,projection=await this.store.get(projectionPath);
      if(projection)writes.push({path:projectionPath,version:projection.version,data:{_progress:{status:next.status,count:next.result?.count||0,needsHelp:!!next.needsHelp,completedAt:next.completedAt||null}},fields:['_progress']});
      await this.store.commit(writes);return response;
    });
  }
  async registerExcel(actor,lesson){
    let computed;try{computed=calculateExcel({lesson,type:'verify'})}catch{fail(400,'invalid-lesson','Задание Excel не прошло независимый расчёт.');}
    const id=freshId();await this.store.commit([{path:'lmsMaterials/'+id,version:null,data:{id,uid:actor.uid,module:'excel',lesson:{...lesson,...computed,difficulty:difficultyForExcel(lesson)},createdAt:this.now(),expiresAt:this.now()+8*60*60000}}]);return id;
  }
  async game(actor,input){
    const kind=input.kind;if(!['chess','drive'].includes(kind))fail(400,'invalid-game','Неизвестная игра.');requireId(input.roomId);
    if(!enabled(actor.profile,kind==='chess'?'chess':'typing'))fail(403,'module-disabled','Раздел отключён.');
    const room=(await this.store.get((kind==='chess'?'chessRooms/':'typeDriveRooms/')+input.roomId))?.data;
    if(!room)fail(404,'room-not-found','Комната не найдена.');let result;
    if(kind==='chess'){
      if(![room.wUid,room.bUid].includes(actor.uid)||room.status!=='finished'||room.round!==input.round)fail(409,'game-unfinished','Результат партии ещё не подтверждён.');
      result=normalizeAttempt({id:'chess:'+input.roomId+':'+room.round,module:'chess',mode:'online',correct:0,total:0,durationMs:Math.min(8*3600000,Math.max(0,millis(room.endedAt)-millis(room.createdAt)))},actor.uid,this.now());result.outcome=room.result;result.winner=room.resultBy?(room.resultBy==='w'?room.wUid:room.bUid)===actor.uid:null;
    }else{
      const side=room.hostUid===actor.uid?'host':room.guestUid===actor.uid?'guest':null;
      if(!side||room.roundNo!==input.round||!room[side+'FinishAt'])fail(409,'game-unfinished','Финиш ещё не подтверждён.');
      const duration=millis(room[side+'FinishAt'])-millis(room.countdownAt)-4000;
      result=normalizeAttempt({id:'drive:'+input.roomId+':'+room.roundNo,module:'typing',skill:'typing',mode:'drive-online',language:/[а-яё]/i.test(room.text)?'ru':'en',characters:room[side+'Progress'],errors:room[side+'Errors']||0,durationMs:duration},actor.uid,this.now());
    }
    result.source='game-record';return this.save(actor,result);
  }
  async analysis(actor,uid,{start,end,peerIds=[]}={}){
    requireId(uid);if(uid!==actor.uid&&!actor.owner)fail(403,'private-data','Данные другого ученика недоступны.');
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end-start>31*86400000)fail(400,'invalid-period','Выберите период до 31 дня.');
    const policy=(await this.store.get('lmsSettings/control'))?.data,policyAt=policy?.proficiencyApprovedAt||0;
    const version=(await this.store.get('lmsVersions/'+uid))?.data.revision||0,cachePath=`lmsSnapshots/${uid}:${end-start}`,cache=await this.store.get(cachePath);
    if(cache&&cache.data.start===start&&cache.data.end===end&&cache.data.revision===version&&cache.data.policyAt===policyAt&&this.now()-cache.data.generatedAt<60000&&!peerIds.length)return cache.data.result;
    const from=Math.min(start-(end-start),policyAt?end-(policy.proficiency?.windowDays||30)*86400000:start);
    const rows=(await this.store.query('lmsAttempts',[['uid','EQUAL',uid],['at','GREATER_THAN_OR_EQUAL',from],['at','LESS_THAN',end]],4000)).map(x=>x.data);
    if(actor.owner)for(const peer of peerIds.filter(x=>x!==uid).slice(0,100)){requireId(peer);rows.push(...(await this.store.query('lmsAttempts',[['uid','EQUAL',peer],['at','GREATER_THAN_OR_EQUAL',start],['at','LESS_THAN',end]],4000)).map(x=>x.data));}
    const profile=(await this.store.get('users/'+uid))?.data||{},legacy=legacySummary(profile);
    const profiles=[[uid,profile]];if(actor.owner)for(const peer of peerIds.filter(p=>p!==uid).slice(0,100)){const p=await this.store.get('users/'+peer);if(p)profiles.push([peer,p.data]);}
    const all=mergeHistory(rows,profiles,this.now()),activity=(await this.store.query('lmsEvents',[['uid','EQUAL',uid],['at','GREATER_THAN_OR_EQUAL',start],['at','LESS_THAN',end]],5000)).map(x=>x.data),word=(await this.store.list('users/'+uid+'/wordResults',{limit:100})).map(x=>({lesson:x.data.lesson,completed:!!x.data.completed,at:millis(x.data.completedAt)}));
    const assignments=await this.taskSummary(uid,end);
    const result={...analyze(all,{uid,start,end,peers:actor.owner?peerIds:[]}),legacy:{...legacy,word},assignments,activeMs:activeTime(activity,start,end),lastSeenAt:millis(profile.lastSeenAt),generatedAt:this.now(),proficiency:evaluateProficiency(rows.filter(x=>x.uid===uid),policy,end)};
    if(!peerIds.length)try{await this.store.commit([{path:cachePath,version:cache?.version??null,data:{start,end,revision:version,policyAt,generatedAt:this.now(),result}}]);}catch(e){if(e.code!=='conflict')throw e;}
    return result;
  }
  async taskSummary(uid,at=this.now()){
    const rows=(await this.store.list(`users/${uid}/assignments`,{limit:200})).filter(x=>x.data.status==='assigned');
    return {assigned:rows.length,completed:rows.filter(x=>x.data._progress?.status==='completed').length,needsHelp:rows.filter(x=>x.data._progress?.needsHelp).length,overdue:rows.filter(x=>x.data._progress?.status!=='completed'&&millis(x.data.dueAt)<at).length};
  }
}

function cleanKeys(value){
  if(!value||typeof value!=='object'||Object.keys(value).length>150)fail(400,'key-limit','Слишком много показателей клавиш.');
  const out={};for(const [key,r] of Object.entries(value)){
    if(!/^u[0-9a-f]{1,6}$/.test(key)||typeof r.char!=='string'||[...r.char].length!==1)fail(400,'invalid-key','Неверный показатель клавиши.');
    const attempts=integer(r.attempts,0,100000,'нажатия'),errors=integer(r.errors,0,attempts,'ошибки'),timeCount=integer(r.timeCount||0,0,attempts,'интервалы');
    const pairs={};for(const [k,n] of Object.entries(r.pairs||{}).slice(0,5)){if(!/^u[0-9a-f]{1,6}$/.test(k))continue;pairs[k]=integer(n,0,errors,'замены');}
    out[key]={char:r.char,attempts,errors,timeCount,timeTotal:integer(Math.round(r.timeTotal||0),0,timeCount*3000,'время'),pairs};
  }return out;
}
function mergeKeys(old={},next={}){const out={...old};for(const [key,r] of Object.entries(next)){const p=out[key]||{},pairs={...p.pairs};for(const [k,n] of Object.entries(r.pairs))pairs[k]=(pairs[k]||0)+n;out[key]={...r,attempts:(p.attempts||0)+r.attempts,errors:(p.errors||0)+r.errors,timeCount:(p.timeCount||0)+r.timeCount,timeTotal:(p.timeTotal||0)+r.timeTotal,pairs:Object.fromEntries(Object.entries(pairs).sort((a,b)=>b[1]-a[1]).slice(0,5))};}return out;}
function projectProgress(profile,r,input){
  if(r.module==='typing'){
    const p=profile.typingProgress||{},weak=p.weakKeys||{},lang=r.language==='en'?'en':'ru',before=weak[lang]||{};
    const history=[...(before.history||[]),{id:r.id,at:new Date(r.at).toISOString(),source:r.mode,accuracy:r.score,attempts:r.total,errors:r.errors,metrics:r.keyMetrics||{},wpm:r.wpm,focus:[]}].slice(-16);
    return {typingProgress:{...p,maxWpm:Math.max(p.maxWpm||0,r.wpm||0),maxCombo:Math.max(p.maxCombo||0,Math.min(Number(input.maxCombo)||0,r.characters)),testsCompleted:(p.testsCompleted||0)+1,weakKeys:{...weak,version:2,[lang]:{keys:mergeKeys(before.keys,r.keyMetrics||{}),history}}}};
  }
  if(r.module==='hotkeys'){const p=profile.hotkeyProgress||{};return {hotkeyProgress:{...p,totalScore:(p.totalScore||0)+r.correct,maxScore:Math.max(p.maxScore||0,r.correct),sessionsPlayed:(p.sessionsPlayed||0)+1,history:[...(p.history||[]),{id:r.id,date:r.at,score:r.correct,total:r.total,topic:r.skill}].slice(-100)}};}
  if(r.module==='tests'){const row={id:r.id,date:new Date(r.at).toLocaleString('ru-RU',{timeZone:'Asia/Tashkent'}),student:text(profile.nickname||profile.displayName,80),percent:Math.round(r.score||0),score:r.correct,total:r.total,topic:r.skill};return {testHistory:[...(profile.testHistory||[]),row]};}
  if(r.module==='excel'&&r.verified){const p=profile.excelProgress||{xp:0,level:1,completedLessons:0,streak:0},pass=r.correct===1&&r.hints===0;
    const recent=p.recentMaterials||[],first=pass&&!recent.includes(r.materialId),xp=(p.xp||0)+(first?({easy:60,medium:100,hard:160}[r.difficulty]||100):0);return {excelProgress:{...p,xp,level:1+Math.floor(xp/500),completedLessons:(p.completedLessons||0)+(first?1:0),streak:pass?(p.streak||0)+(first?1:0):0,recentMaterials:first?[...recent,r.materialId].slice(-300):recent}};}
  return {};
}
export function legacySummary(profile){return {source:'legacy-summary',note:'Итоги, сохранённые до нового журнала. Не смешиваются с динамикой попыток без дат.',tests:profile.testHistory?.length||0,typingSessions:profile.typingProgress?.testsCompleted||0,typingMaxWpm:profile.typingProgress?.maxWpm||0,hotkeySessions:profile.hotkeyProgress?.sessionsPlayed||0,excelCompleted:profile.excelProgress?.completedLessons||0};}
