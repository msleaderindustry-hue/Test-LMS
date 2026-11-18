import { fail, requireId, freshId, text, integer, digest, MODULES } from './domain.mjs';
const kinds=['session','navigation','typing','hidden','visible','blur','focus','idle','active','completed','help'];
const sections=[...MODULES,'platform','menu','chat','ai_chat','stats','admin','assignments'];
export class EventService {
  constructor({store,now=()=>Date.now()}){this.store=store;this.now=now;}
  async ingest(actor,input){
    if(!Array.isArray(input.events)||!input.events.length||input.events.length>30)fail(400,'event-limit','Ожидается от 1 до 30 событий.');
    const now=this.now(),events=input.events.map(e=>{
      if(!kinds.includes(e.kind)||!sections.includes(e.section))fail(400,'invalid-event','Неизвестное событие.');
      const durationMs=e.kind==='active'?integer(e.durationMs,1,90000,'активное время'):0;
      const clientAt=typeof e.at==='number'&&Number.isFinite(e.at)?e.at:now;
      if(clientAt>now+60000||clientAt<now-86400000)fail(400,'event-time','Событие слишком старое или имеет неверное время.');
      return {id:requireId(e.id),uid:actor.uid,sessionId:requireId(e.sessionId),kind:e.kind,section:e.section,at:Math.min(clientAt,now),receivedAt:now,durationMs};
    });
    let added=0;
    await this.store.atomic(async()=>{const writes=[];added=0;for(const e of events){const path=`lmsEvents/${actor.uid}:${e.id}`;if(writes.some(w=>w.path===path)||await this.store.get(path))continue;writes.push({path,version:null,data:e});added++;}
      if(writes.length)await this.store.commit(writes);
    });return {accepted:added};
  }
  async result(actor,attempt){
    if(!attempt||attempt.uid!==actor.uid)return;
    const path=`lmsEvents/${actor.uid}:result:${attempt.id}`;
    await this.store.atomic(async()=>{if(await this.store.get(path))return;await this.store.commit([{path,version:null,data:{id:'result:'+attempt.id,uid:actor.uid,sessionId:'server',kind:'result',section:attempt.module,at:this.now(),receivedAt:this.now(),durationMs:0,score:attempt.score,cpm:attempt.cpm??null,verified:attempt.verified}}]);});
  }
}
const labels={session:'вошёл в LMS',navigation:'переходы',typing:'печатает',hidden:'вкладка скрыта',visible:'вернулся во вкладку',blur:'LMS потеряла фокус',focus:'вернулся в LMS',idle:'бездействует',completed:'завершил работу',help:'просит помощи'};
export function summarizeEvents(events,names={}){
  const groups=new Map();
  for(const e of events){if(e.kind==='active'||e.kind==='session')continue;const key=e.uid;if(!groups.has(key))groups.set(key,new Map());const counts=groups.get(key),label=e.kind==='result'?`результат ${e.section}: ${e.score==null?'практика сохранена':e.score+'%'}${e.cpm==null?'':', '+e.cpm+' зн/мин'}`:(labels[e.kind]||e.kind)+(e.kind==='navigation'?' → '+e.section:'');counts.set(label,(counts.get(label)||0)+1);}
  const safe=v=>String(v).replace(/[\r\n@*_`~<>]/g,' ').slice(0,100);
  return [...groups].map(([uid,counts])=>`${safe(names[uid]||'Ученик')}: ${[...counts].map(([label,n])=>label+(n>1?' ×'+n:'')).join('; ')}`).join('\n');
}
