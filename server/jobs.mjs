import {digest,fail,reportWindow,initialPolicy,OWNER_UID,freshId} from './domain.mjs';
import {aggregate,reconcileWeek} from './metrics.mjs';
import {summarizeEvents} from './events.mjs';
import {loadReportData} from './report-data.mjs';
export function splitNotification(content,limit=1850){
  const chunks=[];let part='';for(const line of content.split('\n')){for(let offset=0;offset<line.length||offset===0;offset+=limit){const piece=line.slice(offset,offset+limit);if(part.length+piece.length+1>limit){chunks.push(part);part='';}part+=(part?'\n':'')+piece;}}if(part)chunks.push(part);return chunks;
}
export class JobService {
  constructor({store,queue,discord,planner,learning,now=()=>Date.now(),ownerUid=OWNER_UID}){Object.assign(this,{store,queue,discord,planner,learning,now,ownerUid});}
  async enqueue(kind,payload,key){
    const id=(await digest({kind,key})).slice(0,48),path='lmsJobs/'+id,old=await this.store.get(path);
    if(!old){try{await this.store.commit([{path,version:null,data:{id,kind,payload,status:'pending',createdAt:this.now(),tries:0,nextAt:0,sentParts:0}}]);}catch(e){if(e.code!=='conflict')throw e;}}
    if(!['completed','failed'].includes(old?.data.status)&&this.queue)await this.queue.send({id});return {jobId:id,status:old?.data.status||'pending'};
  }
  async schedule(now){
    const policy=(await this.store.get('lmsSettings/control'))?.data||initialPolicy();
    if(policy.reports.enabled){
      const enabledAt=policy.reports.enabledAt||0,daily=reportWindow('daily',now);
      if(daily.end>=enabledAt)await this.enqueue('report',{...daily,uid:null},'daily:'+daily.end);
      const weekly=reportWindow('weekly',now-5*60000);
      if(weekly.end+5*60000>=enabledAt&&now-weekly.end<24*60*60000)await this.enqueue('report',{...weekly,uid:null},'weekly:'+weekly.end);
      const end=Math.floor((now-60000)/60000)*60000,cursor=await this.store.get('lmsSettings/eventCursor'),start=cursor?.data.end??end-5*60000;
      if(end>start){
        const rows=await this.store.query('lmsEvents',[['receivedAt','GREATER_THAN_OR_EQUAL',start],['receivedAt','LESS_THAN',end]],5000);
        // No queued work and no new Firestore job for an empty minute. Persist
        // the empty cursor hourly so long quiet periods remain cheap to scan.
        if(rows.some(x=>x.data.kind!=='active'))await this.enqueue('events',{start,end},'events:'+start+':'+end);
        if(rows.length||!cursor||end-start>=3600000)await this.store.commit([{path:'lmsSettings/eventCursor',version:cursor?.version??null,data:{end}}]);
      }
    }
    if(policy.pilotStartedAt!=null&&new Date(now).getUTCMinutes()===10)for(const u of await this.store.list('users',{limit:500}))if(!u.data.isBanned&&u.path!=='users/'+this.ownerUid)await this.enqueue('learning',{uid:u.path.split('/')[1]},u.path+':'+Math.floor(now/3600000));
    const pending=await this.store.query('lmsJobs',[['status','EQUAL','pending']],1000),abandoned=(await this.store.query('lmsJobs',[['status','EQUAL','running']],1000)).filter(x=>x.data.leaseUntil<=now);
    if(this.queue)for(const job of [...pending,...abandoned].filter(x=>!x.data.nextAt||x.data.nextAt<=now).slice(0,50))await this.queue.send({id:job.data.id});
  }
  async buildReport(payload,id){
    const saved=await this.store.get('lmsReports/'+id);if(saved)return {report:saved.data,notification:saved.data.notification};
    const {start,end,uid}=payload;
    const profiles=(await this.store.list('users',{limit:500})).filter(x=>x.path.split('/')[1]!==this.ownerUid&&!x.data.isBanned&&(!uid||x.path==='users/'+uid));
    if(uid&&!profiles.length)fail(404,'student-not-found','Ученик не найден.');
    const policy=(await this.store.get('lmsSettings/control'))?.data;
    const {students,periodRows}=await loadReportData(this,profiles,policy,payload);
    const report={id,version:1,kind:payload.kind,onDemand:!!payload.onDemand,start,end,timezone:'Asia/Tashkent',generatedAt:this.now(),scope:uid?'student':'all-students',uid:uid||null,studentCount:students.length,totals:aggregate(periodRows),byModule:Object.fromEntries([...new Set(periodRows.map(r=>r.module))].map(m=>[m,aggregate(periodRows.filter(r=>r.module===m))])),...(payload.kind==='weekly'?{reconciliation:reconcileWeek(periodRows,start,end)}:{})};
    if(payload.kind==='weekly'){
      const dailyPaths=payload.onDemand?[]:await Promise.all(report.reconciliation.daily.map(async d=>'lmsReports/'+(await digest({kind:'report',key:'daily:'+d.end})).slice(0,48)));
      const daily=(await this.store.getMany(dailyPaths)).map(d=>d?.data);
      report.reconciliation.savedDaily=payload.onDemand?[]:report.reconciliation.daily.map((d,i)=>{const saved=daily[i];return {start:d.start,end:d.end,status:!saved?'missing':['attempts','correct','total'].every(k=>saved.totals[k]===d[k])?'matches':'changed-after-daily-report'};});
      report.reconciliation.savedComparison=payload.onDemand?'different-boundaries':'calendar-days';
    }
    const label=payload.onDemand?'Текущий':payload.kind==='weekly'?'Недельный':'Ежедневный',safe=s=>String(s).replace(/[\r\n@*_`~<>]/g,' ').slice(0,60);
    const lines=students.slice(0,10).map(s=>`${safe(s.name)}: ${s.totals.attempts} попыток; ${Math.round(s.activeMs/60000)} мин активности; ${s.skills.some(k=>k.deltaPoints<0)?'есть снижение по навыку':s.skills.some(k=>k.deltaPoints>0)?'есть рост по навыку':'динамика пока не определена'}`);
    report.notification=`${label} отчёт LMS.\n${lines.join('\n')}\nУченики: ${students.length}. Попытки: ${report.totals.attempts}.`+(report.reconciliation?`\nСверка 7 суток: ${report.reconciliation.consistent?'суммы совпадают':'расхождение'}.`+(!payload.onDemand?` Сохранённые сводки: ${report.reconciliation.savedDaily.filter(x=>x.status==='matches').length}/7 совпали.`:''):'')+`\nПолный отчёт: ${id}`;
    for(let i=0;i<students.length;i+=100){const batch=students.slice(i,i+100),paths=batch.map(student=>`lmsReports/${id}/students/${student.uid}`),old=await this.store.getMany(paths);await this.store.commit(batch.flatMap((student,j)=>old[j]?[]:[{path:paths[j],version:null,data:student}]));}
    try{await this.store.commit([{path:'lmsReports/'+id,version:null,data:report}]);}catch(e){if(e.code!=='conflict')throw e;}
    return {report,notification:report.notification};
  }
  async run(id){
    const path='lmsJobs/'+id,now=this.now(),claim=freshId();let claimed;
    await this.store.atomic(async()=>{const d=await this.store.get(path);if(!d||['completed','failed'].includes(d.data.status)){claimed=null;return;}if(d.data.nextAt>now){const e=new Error('Отложено');e.retryAfter=Math.ceil((d.data.nextAt-now)/1000);throw e;}
      if(d.data.status==='running'&&d.data.leaseUntil>now){claimed=null;return;}
      claimed={...d.data,status:'running',claim,leaseUntil:now+10*60000,tries:d.data.tries+1};await this.store.commit([{path,version:d.version,data:claimed}]);});
    if(!claimed)return;
    const update=async patch=>this.store.atomic(async()=>{const d=await this.store.get(path);if(d?.data.claim!==claim)fail(409,'lease-lost','Задача передана другому обработчику.');await this.store.commit([{path,version:d.version,data:{...d.data,...patch}}]);});
    try{
      let content='';
      if(claimed.kind==='report')content=(await this.buildReport(claimed.payload,id)).notification;
      else if(claimed.kind==='events'){
        const events=(await this.store.query('lmsEvents',[['receivedAt','GREATER_THAN_OR_EQUAL',claimed.payload.start],['receivedAt','LESS_THAN',claimed.payload.end]],5000)).map(x=>x.data),names={};
        for(const uid of [...new Set(events.map(e=>e.uid))])names[uid]=(await this.store.get('users/'+uid))?.data.nickname||'Ученик';content=summarizeEvents(events,names);
      }else if(claimed.kind==='notification')content=claimed.payload.content;
      else if(claimed.kind==='learning'){if(this.planner)await this.planner.update(claimed.payload.uid);}
      else fail(400,'unknown-job','Неизвестная фоновая задача.');
      const parts=splitNotification(content);
      for(let i=claimed.sentParts||0;i<parts.length;i++){
        if(!this.discord)fail(503,'discord-unconfigured','Discord не подключён.');
        await this.discord(parts[i]);await update({sentParts:i+1,leaseUntil:this.now()+10*60000});
      }
      await update({status:'completed',finishedAt:this.now(),leaseUntil:null,nextAt:0});
    }catch(e){const terminal=e.permanent||claimed.tries>=5;await update({status:terminal?'failed':'pending',lastError:e.code||'delivery-failed',leaseUntil:null,nextAt:this.now()+Math.max(10,Number(e.retryAfter)||2**claimed.tries*10)*1000});if(terminal)e.permanent=true;throw e;}
  }
}
