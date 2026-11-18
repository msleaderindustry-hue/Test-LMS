import { owner, OWNER_UID, fail, freshId, digest, canonical, requireId, validateTask, enabled, initialPolicy, setAutomatic, DAY } from './domain.mjs';
import { timestamp, millis } from './firestore.mjs';
import { validateCriteria } from './proficiency.mjs';
import { excelNameForSkill } from './generated/excel-checker.mjs';
const clearFields={tests:'testHistory',typing:'typingProgress',hotkeys:'hotkeyProgress',excel:'excelProgress',audit:'adminAudit','teacher-tests':'assignedTests'};
const emptyField={testHistory:[],typingProgress:{maxWpm:0,maxCombo:0,testsCompleted:0},hotkeyProgress:{maxScore:0,totalScore:0,sessionsPlayed:0,history:[]},excelProgress:{level:1,xp:0,completedLessons:0,streak:0},adminAudit:[],assignedTests:[]};
const deletable = path => /^(?:users\/[^/]+\/activity\/[^/]+|platformErrors\/[^/]+|lmsEvents\/[^/]+|lmsAttempts\/[^/]+|lmsAssignments\/[^/]+(?:\/progress\/[^/]+)?|users\/[^/]+\/assignments\/[^/]+|private_chats\/[^/]+\/messages\/[^/]+|chessRooms\/[^/]+|typeDriveRooms\/[^/]+|typeDrivePresence\/[^/]+)$/.test(path);
export class ControlService {
  constructor({store,backups,ownerUid=OWNER_UID,now=()=>Date.now()}){this.store=store;this.backups=backups;this.ownerUid=ownerUid;this.now=now;}
  check(actor){owner(actor,this.ownerUid);}
  async policy(){return (await this.store.get('lmsSettings/control'))?.data||initialPolicy();}
  async proposal(actor,type,payload,summary,{source='assistant',ttl}={}){
    this.check(actor);const id=freshId(),now=this.now();
    const value={id,type,ownerUid:actor.uid,payload,summary,source,status:'pending',createdAt:now,expiresAt:now+(ttl||(type==='assignment'?24*60:30))*60000};
    value.digest=await digest({id,type,ownerUid:actor.uid,payload,expiresAt:value.expiresAt});
    await this.store.commit([{path:'lmsProposals/'+id,version:null,data:value}]);
    return this.publicProposal(value);
  }
  publicProposal(p){const {payload,...result}=p;return {...result,details:p.type==='assignment'?payload:p.type==='cleanup'?{kind:payload.kind,uid:payload.uid,count:payload.count,documents:payload.entries.length,paths:payload.entries.map(e=>e.path+(e.field?' → '+e.field:''))}:p.type==='restore'?{backupId:payload.backupId,count:payload.count}:payload};}
  async proposeAssignment(actor,input,options){
    this.check(actor);const task=validateTask(input,this.now());task.studentNames={};
    if(task.excelSkill&&!excelNameForSkill(task.excelSkill))fail(400,'unknown-excel-skill','Неизвестная функция Excel.');
    const students=await this.store.getMany(task.studentIds.map(uid=>'users/'+uid));
    for(const [i,uid] of task.studentIds.entries()){const u=students[i];if(uid===this.ownerUid||!enabled(u?.data,'assignments')||!enabled(u?.data,task.module))fail(409,'student-access','У ученика закрыт доступ к заданиям или выбранному разделу.');task.studentNames[uid]=String(u.data.nickname||u.data.displayName||uid).slice(0,80);}
    return this.proposal(actor,'assignment',task,`Назначить «${task.title}»: учеников ${task.studentIds.length}. ${task.reason}`,options);
  }
  async proposeCleanup(actor,{kind,uid,assignmentId,recordId,recordIds,before,mode},options={}){
    this.check(actor);if(!['activity','diagnostics','assignments','chat','chess','drive',...Object.keys(clearFields)].includes(kind))fail(400,'cleanup-kind','Выберите категорию очистки.');
    if(before!=null&&(!Number.isFinite(before)||before<=0||before>=this.now()||!['activity','diagnostics','chess','drive'].includes(kind)))fail(400,'cleanup-date','Некорректная дата отбора старых записей.');
    if(uid)requireId(uid);const entries=[],limit=kind==='assignments'?201:180;let count=0;
    const append=(doc,field,after,records=1)=>{if(!doc)return;if(before!=null){const at=millis(doc.data.endedAt??doc.data.at??doc.data.createdAt??doc.data.timestamp);if(!Number.isFinite(at)||at>=before)return;}if(entries.some(x=>x.path===doc.path))return;if(entries.length>=limit){if(before!=null)return;fail(413,'cleanup-limit','Выберите меньше данных: не более '+limit+' документов за операцию.');}entries.push({path:doc.path,version:doc.version,field:field||null,after:field?after:null,before:doc.data});count+=records;};
    if(kind==='diagnostics'){
      if(recordIds){if(!Array.isArray(recordIds)||recordIds.length>180)fail(400,'cleanup-limit','Выберите до 180 записей.');for(const doc of await this.store.getMany([...new Set(recordIds)].map(id=>'platformErrors/'+requireId(id))))append(doc);}
      else for(const d of before!=null?await this.store.query('platformErrors',[['at','LESS_THAN',timestamp(before)]],180,{partial:true}):await this.store.list('platformErrors',{limit:180}))append(d);
    }
    else if(kind==='assignments'){
      requireId(assignmentId);const d=await this.store.get('lmsAssignments/'+assignmentId);if(d){append(d);for(const p of await this.store.list(d.path+'/progress',{limit:100}))append(p);for(const p of await this.store.getMany((d.data.studentIds||[]).map(id=>`users/${requireId(id)}/assignments/${assignmentId}`)))append(p);}
    } else if(kind==='chess'||kind==='drive'){
      const collections=kind==='chess'?['chessRooms']:mode==='drivePresence'?['typeDrivePresence']:mode==='driveFinished'?['typeDriveRooms']:['typeDriveRooms','typeDrivePresence'];
      for(const collection of collections)for(const d of await this.store.list(collection,{limit:180})){
        const terminal=['finished','cancelled'].includes(d.data.status||d.data.stage);
        if(mode==='all'&&before==null|| (collection==='typeDrivePresence'?!d.data.online||this.now()-(millis(d.data.lastSeen)||0)>90000:terminal))append(d);
      }
    } else if(kind==='chat'){
      // Explicit chat identifier, no collection-group scan of unrelated data.
      const chats=assignmentId?[{path:'private_chats/'+requireId(assignmentId)}]:await this.store.list('private_chats',{limit:20});for(const chat of chats)for(const d of await this.store.list(chat.path+'/messages',{limit:180}))append(d);
    } else {
      const users=uid?[await this.store.get('users/'+uid)].filter(Boolean):await this.store.list('users',{limit:500});
      for(const u of users){
        if(kind==='activity')for(const d of before!=null?await this.store.query(u.path+'/activity',[['at','LESS_THAN',timestamp(before)]],180,{partial:true}):await this.store.list(u.path+'/activity',{limit:180}))append(d);
        else {const field=clearFields[kind],old=u.data[field];if(old==null)continue;
          let after=emptyField[field],records=Array.isArray(old)?old.length:1;
          if(recordId!=null){if(!['tests','teacher-tests'].includes(kind)||!uid)fail(400,'invalid-selection','Выбор записи доступен только для тестов конкретного ученика.');after=old.filter(x=>String(x.id)!==String(recordId));records=old.length-after.length;}
          if(records&&canonical(old)!==canonical(after))append(u,field,after,records);
        }
      }
    }
    if(kind==='activity')for(const d of await this.store.query('lmsEvents',[...(uid?[['uid','EQUAL',uid]]:[]),...(before!=null?[['at','LESS_THAN',before]]:[])],180,{partial:before!=null}))append(d);
    if(['tests','typing','hotkeys','excel'].includes(kind))for(const d of await this.store.query('lmsAttempts',[['module','EQUAL',kind],...(uid?[['uid','EQUAL',uid]]:[]),...(recordId?[['id','EQUAL',String(recordId)]]:[])],180))append(d);
    if(!entries.length)fail(409,'nothing-to-clean','По выбранным условиям нет записей для очистки.');
    if(new TextEncoder().encode(JSON.stringify(entries)).length>4_000_000)fail(413,'backup-limit','Слишком большая копия. Выберите меньше данных.');
    // Full before-images are kept outside the Firestore proposal document.
    if(!this.backups)fail(503,'backup-unavailable','Хранилище резервных копий не подключено. Очистка недоступна.');
    const snapshotId=freshId(),archive={version:1,createdAt:this.now(),entries};const checksum=await digest(archive);
    await this.backups.put('snapshots/'+snapshotId+'.json',JSON.stringify(archive));
    const verify=await this.backups.get('snapshots/'+snapshotId+'.json');
    if(!verify||await digest(JSON.parse(await verify.text()))!==checksum)fail(503,'backup-unverified','Не удалось проверить резервную копию. Ничего не удалено.');
    const manifest=entries.map(({before,after,...entry})=>entry);
    const label={diagnostics:'диагностику',activity:'активность',tests:'результаты тестов',typing:'результаты печати',hotkeys:'результаты сочетаний',excel:'результаты Excel',audit:'журнал администратора','teacher-tests':'назначенные тесты',assignments:'задание',chat:'переписку',chess:'шахматные комнаты',drive:'заезды TypeDrive'}[kind];
    return this.proposal(actor,'cleanup',{kind,uid:uid||null,count,snapshotId,checksum,entries:manifest},`Очистить ${label}: ${count} записей в ${entries.length} документах.${before?' Старше '+new Date(before).toLocaleDateString('ru-RU',{timeZone:'Asia/Tashkent'})+'.':''} Резервная копия проверена.`,options);
  }
  // An explicit owner button is the authorization; no assistant approval round trip.
  async manual(actor,type,input,requestId){
    this.check(actor);requireId(requestId);if(!['cleanup','assignment','restore'].includes(type))fail(400,'manual-action','Неизвестное действие.');
    const path='lmsManualActions/'+actor.uid+':'+requestId,hash=await digest({type,input});let receipt=await this.store.get(path);
    if(receipt&&receipt.data.digest!==hash)fail(409,'request-reused','Идентификатор операции уже использован.');
    if(!receipt){const p=type==='cleanup'?await this.proposeCleanup(actor,input,{source:'manual'}):type==='assignment'?await this.proposeAssignment(actor,input,{source:'manual'}):await this.proposeRestore(actor,input.backupId);
      await this.store.atomic(async()=>{receipt=await this.store.get(path);if(!receipt)await this.store.commit([{path,version:null,data:{actorUid:actor.uid,digest:hash,proposalId:p.id,createdAt:this.now()}}]);});receipt=await this.store.get(path);
    }
    if(receipt.data.digest!==hash)fail(409,'request-reused','Идентификатор операции уже использован.');
    const p=await this.store.get('lmsProposals/'+receipt.data.proposalId);return this.approve(actor,p.data.id,p.data.digest);
  }
  async archive(payload){const file=await this.backups?.get('snapshots/'+payload.snapshotId+'.json');if(!file)fail(503,'backup-missing','Резервная копия недоступна. Операция остановлена.');const data=JSON.parse(await file.text());if(await digest(data)!==payload.checksum)fail(503,'backup-corrupt','Проверка резервной копии не пройдена.');return data;}
  async proposeRestore(actor,id){this.check(actor);requireId(id);const p=await this.store.get('lmsProposals/'+id);if(!p||p.data.type!=='cleanup'||p.data.status!=='completed'||p.data.restoredAt)fail(409,'not-restorable','Эта очистка недоступна для восстановления.');await this.archive(p.data.payload);return this.proposal(actor,'restore',{backupId:id,count:p.data.payload.count},`Восстановить ${p.data.payload.count} записей из копии очистки ${id}.`);}
  async proposePolicy(actor,action,value){this.check(actor);if(!['start-pilot','automatic','reports'].includes(action))fail(400,'invalid-policy','Неизвестная настройка.');if(action!=='start-pilot'&&typeof value!=='boolean')fail(400,'invalid-policy','Нужно логическое значение.');return this.proposal(actor,'policy',{action,value:value??null},action==='start-pilot'?'Начать 14-дневный пилот с подтверждением каждого задания.':action==='automatic'?(value?'Включить автоматическую выдачу после пилота.':'Отключить автоматическую выдачу.'):(value?'Включить ежедневные отчёты в 20:00 и недельные по воскресеньям в 20:05 (Ташкент).':'Отключить плановые отчёты.'));}
  async cancel(actor,id){this.check(actor);requireId(id);await this.store.atomic(async()=>{const p=await this.store.get('lmsProposals/'+id);if(!p||p.data.ownerUid!==actor.uid)fail(404,'not-found','Предложение не найдено.');if(p.data.status!=='pending')fail(409,'already-handled','Предложение уже обработано.');await this.store.commit([{path:p.path,version:p.version,data:{...p.data,status:'cancelled',finishedAt:this.now()}}]);});return {status:'cancelled'};}
  async proposeCriteria(actor,value){this.check(actor);return this.proposal(actor,'criteria',validateCriteria(value),'Утвердить критерии «профи». Начнётся оценка новых попыток по указанным направлениям и порогам.');}
  async proposeGroup(actor,{name,studentIds}){this.check(actor);name=typeof name==='string'?name.trim().slice(0,80):'';if(!name||!Array.isArray(studentIds)||!studentIds.length||studentIds.length>100)fail(400,'invalid-group','Нужны название группы и от 1 до 100 учеников.');studentIds=[...new Set(studentIds.map(requireId))];return this.proposal(actor,'group',{name,studentIds},`Группа «${name}»: назначить ${studentIds.length} учеников. Сравнение будет только внутри этой группы.`);}
  async approve(actor,id,expectedDigest,{automatic=false}={}){
    this.check(actor);requireId(id);const result=await this.store.atomic(async()=>{
      const p=await this.store.get('lmsProposals/'+id),now=this.now();
      if(!p||p.data.ownerUid!==actor.uid)fail(404,'not-found','Предложение не найдено.');
      if(expectedDigest!==p.data.digest)fail(409,'proposal-changed','Подтвердите актуальную карточку предложения.');
      if(p.data.status==='completed')return {...p.data.result,replayed:true};
      if(p.data.status!=='pending'||p.data.expiresAt<now)fail(409,'proposal-expired','Подтверждение устарело. Подготовьте новое предложение.');
      const writes=[],affected=new Set();let result={status:'completed',proposalId:id};
      if(p.data.type==='assignment'){
        if(automatic){const policy=await this.store.get('lmsSettings/control');if(!policy?.data.autoAssignments)fail(409,'automatic-disabled','Автовыдача отключена.');setAutomatic(policy.data,actor,true,now,this.ownerUid);writes.push({path:policy.path,version:policy.version,data:policy.data});}
        const task=validateTask(p.data.payload,now);
        const students=await this.store.getMany(task.studentIds.map(uid=>'users/'+uid));
        for(const [i,uid] of task.studentIds.entries()){const u=students[i];if(uid===this.ownerUid||!enabled(u?.data,'assignments')||!enabled(u?.data,task.module))fail(409,'student-access','Доступ ученика изменился. Пересоздайте предложение.');}
        const data={...task,id,createdBy:actor.uid,createdAt:timestamp(now),dueAt:timestamp(task.dueAt),status:'assigned',proposalId:id};
        writes.push({path:'lmsAssignments/'+id,version:null,data});
        for(const uid of task.studentIds){affected.add(uid);writes.push({path:`users/${uid}/assignments/${id}`,version:null,data:{...data,studentIds:[uid],_progress:{status:'not_started',count:0,needsHelp:false}}});}
        result.assignmentId=id;
      } else if(p.data.type==='cleanup'){
        const saved=await this.archive(p.data.payload);
        const currentEntries=new Map((await this.store.getMany(saved.entries.map(e=>e.path))).filter(Boolean).map(d=>[d.path,d]));
        for(const entry of saved.entries){
          const uid=entry.path.startsWith('users/')?entry.path.split('/')[1]:entry.before.uid;if(uid)affected.add(uid);for(const id of entry.before.studentIds||[])affected.add(id);
          const current=currentEntries.get(entry.path);if(!current||current.version!==entry.version)fail(409,'cleanup-stale','Данные изменились после предпросмотра. Ничего не удалено; подготовьте новый перечень.');
          if(entry.field){if(!entry.path.match(/^users\/[^/]+$/)||!Object.hasOwn(emptyField,entry.field))fail(400,'invalid-cleanup','Недопустимая область очистки.');writes.push({path:entry.path,version:entry.version,data:{[entry.field]:entry.after},fields:[entry.field]});}
          else{if(!deletable(entry.path))fail(400,'invalid-cleanup','Недопустимая область очистки.');writes.push({path:entry.path,version:entry.version,delete:true});}
        }
        result={...result,deleted:p.data.payload.count,backupId:id};
      } else if(p.data.type==='restore'){
        const cleanup=await this.store.get('lmsProposals/'+p.data.payload.backupId);
        if(!cleanup||cleanup.data.type!=='cleanup'||cleanup.data.status!=='completed'||cleanup.data.restoredAt)fail(409,'not-restorable','Копия уже восстановлена или недоступна.');
        const saved=await this.archive(cleanup.data.payload);
        const currentEntries=new Map((await this.store.getMany(saved.entries.map(e=>e.path))).filter(Boolean).map(d=>[d.path,d]));
        for(const entry of saved.entries){const current=currentEntries.get(entry.path);
          const uid=entry.path.startsWith('users/')?entry.path.split('/')[1]:entry.before.uid;if(uid)affected.add(uid);for(const id of entry.before.studentIds||[])affected.add(id);
          if(entry.field){if(!current||canonical(current.data[entry.field])!==canonical(entry.after))fail(409,'restore-conflict','После очистки появились новые результаты. Восстановление не перезапишет их.');writes.push({path:entry.path,version:current.version,data:{[entry.field]:entry.before[entry.field]},fields:[entry.field]});}
          else {if(current)fail(409,'restore-conflict','Документ уже существует. Восстановление не перезапишет его.');writes.push({path:entry.path,version:null,data:entry.before});}
        }
        writes.push({path:cleanup.path,version:cleanup.version,data:{...cleanup.data,restoredAt:now}});result.restored=cleanup.data.payload.count;
      } else if(p.data.type==='group'){
        const students=await this.store.getMany(p.data.payload.studentIds.map(uid=>'users/'+uid));
        for(const [i,uid] of p.data.payload.studentIds.entries()){const u=students[i];if(!u||uid===this.ownerUid)fail(409,'student-not-found','Перепроверьте список учеников.');writes.push({path:u.path,version:u.version,data:{groupId:p.data.payload.name},fields:['groupId']});affected.add(uid);}
        result.group=p.data.payload.name;
      } else if(p.data.type==='criteria'){
        const old=await this.store.get('lmsSettings/control'),policy=old?.data||initialPolicy();
        const next={...policy,proficiency:validateCriteria(p.data.payload),proficiencyApprovedAt:now};writes.push({path:'lmsSettings/control',version:old?.version??null,data:next});result.policy=next;
      } else if(p.data.type==='policy'){
        const old=await this.store.get('lmsSettings/control'),policy=old?.data||initialPolicy(),{action,value}=p.data.payload;let next;
        if(action==='automatic')next=setAutomatic(policy,actor,value,now,this.ownerUid);
        else if(action==='start-pilot'){if(policy.pilotStartedAt!=null)fail(409,'pilot-started','Пилот уже начат.');next={...policy,pilotStartedAt:now,autoAssignments:false};}
        else next={...policy,reports:{...policy.reports,enabled:value,...(value?{enabledAt:now}:{})}};
        writes.push({path:'lmsSettings/control',version:old?.version??null,data:next});result.policy=next;
      } else fail(400,'unsupported-proposal','Неизвестное действие.');
      const versions=await this.store.getMany([...affected].map(uid=>'lmsVersions/'+requireId(uid)));
      for(const [i,uid] of [...affected].entries()){const path='lmsVersions/'+uid,v=versions[i];writes.push({path,version:v?.version??null,data:{revision:(v?.data.revision||0)+1,at:now}});}
      if(affected.size)result.affectedUids=[...affected];
      writes.push({path:p.path,version:p.version,data:{...p.data,status:'completed',finishedAt:now,result}});
      writes.push({path:'lmsAudit/'+id,version:null,data:{id,actorUid:actor.uid,automatic,type:p.data.type,at:now,summary:p.data.summary,result}});
      await this.store.commit(writes);return result;
    });return result;
  }
}
