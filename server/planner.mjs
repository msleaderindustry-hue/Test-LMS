import {DAY,OWNER_UID,enabled,WORD_LESSONS} from './domain.mjs';
import {millis} from './firestore.mjs';
import {excelNameForSkill} from './generated/excel-checker.mjs';
const passages={ru:'Чтобы уверенно решать сложные задачи, сначала разберись в условии. Выдели главную мысль, проверь данные и составь короткий план. После каждого шага сравни результат с целью. Точность важнее спешки, а регулярная практика помогает закрепить навык.',en:'To solve a difficult task, first read the instructions carefully. Find the main idea, check the available data and make a short plan. After each step, compare your result with the goal. Accuracy matters more than rushing, and regular practice helps you build a lasting skill.'};
export class PlannerService {
  constructor({store,learning,control,ownerUid=OWNER_UID,now=()=>Date.now()}){Object.assign(this,{store,learning,control,ownerUid,now});}
  async update(uid){
    const u=await this.store.get('users/'+uid),policy=await this.control.policy();if(!u||uid===this.ownerUid||u.data.isBanned)return;
    const now=this.now(),path='lmsPlans/'+uid,old=await this.store.get(path),inputRevision=(await this.store.get('lmsVersions/'+uid))?.data.revision||0;
    const inputPolicy=JSON.stringify([policy.proficiencyApprovedAt,policy.pilotStartedAt,policy.autoAssignments,u.data.allowedModules,u.data.groupId,Math.floor(now/DAY)]);
    if(old?.data.inputRevision===inputRevision&&old.data.inputPolicy===inputPolicy)return old.data;
    const end=Math.floor(now/60000)*60000+60000,actor={uid:this.ownerUid,owner:true},analysis=await this.learning.analysis(actor,uid,{start:end-7*DAY,end});
    const recommendations=analysis.recommendations,steps=recommendations.map((r,i)=>({order:i+1,...r,status:'recommended',instruction:r.kind==='reinforce'?'Повторить тему и выполнить упражнение с разбором ошибок.':r.kind==='challenge'?'Решить более сложное упражнение без подсказок.':r.kind==='diagnose'?'Пройти исходную диагностику доступного навыка.':'Закрепить навык самостоятельной практикой.'}));
    const plan={uid,generatedAt:now,version:1,inputRevision,inputPolicy,steps,proficiency:analysis.proficiency,nextReview:'После новых результатов',assignmentMode:policy.autoAssignments?'automatic':'approval'};
    const savePlan=async(value=plan)=>{await this.store.commit([{path,version:old?.version??null,data:value}]);return value;};
    if(policy.pilotStartedAt==null||!enabled(u.data,'assignments'))return savePlan();
    const active=await this.store.list(`users/${uid}/assignments`,{limit:200});
    for(const a of active){if(a.data.status!=='assigned')continue;const progress=a.data._progress||(await this.store.get(`lmsAssignments/${a.path.split('/').pop()}/progress/${uid}`))?.data;if(progress?.status!=='completed')return savePlan();}
    const drafts=await this.store.query('lmsProposals',[['status','EQUAL','pending']],500);
    if(drafts.some(d=>d.data.type==='assignment'&&d.data.payload.studentIds.includes(uid)&&d.data.expiresAt>now))return savePlan();
    // One recommendation per day, including retries and concurrent jobs.
    const day=Math.floor(now/DAY),slot='lmsPlannerSlots/'+uid+':'+day;
    if(await this.store.get(slot))return savePlan();
    const choice=recommendations.find(r=>['typing','hotkeys','excel','word'].includes(r.module)&&enabled(u.data,r.module));
    const module=choice?.module||['typing','hotkeys','word','excel'].find(m=>enabled(u.data,m));if(!module)return savePlan();
    const lang=analysis.skills.find(x=>x.module==='typing')?.language==='en'?'en':'ru';
    const harder=choice?.kind==='challenge',reason=choice?.reason||'Для выбора нагрузки пока недостаточно сопоставимых результатов. Начинаем с короткого упражнения.';
    const weak=(analysis.weakKeys||[]).filter(x=>x.language===lang&&x.char!==' ').slice(0,5).map(x=>x.char);
    const drill=weak.length?' '+Array(8).fill(weak.join(' ')).join(' '):'';
    const task={module,title:(harder?'Следующий уровень: ':'Практика: ')+({typing:'точная печать',hotkeys:'сочетания клавиш',word:'оформление документа',excel:'формулы Excel'}[module]),studentIds:[uid],dueAt:now+3*DAY,reason,text:module==='typing'?(harder?passages[lang]+' '+passages[lang]:passages[lang]+drill):module==='excel'&&choice?.skill?'Отработайте функцию '+choice.skill+'. '+reason:'',lang,minAccuracy:harder?98:95,target:harder?3:1,hotkeyBank:['word','excel','windows'].includes(choice?.skill)?choice.skill:'any',wordLesson:!harder&&WORD_LESSONS.includes(choice?.skill)?choice.skill:harder?'report':'memo'};
    if(module==='hotkeys'&&harder){task.maxErrors=0;task.text='Решите серию с первого раза: без ошибок, пропусков и подсказок. '+reason;}
    if(module==='excel'){const next={SUM:'SUMIF',COUNT:'COUNTIF',AVERAGE:'AVERAGEIF',SUMIF:'SUMIFS',COUNTIF:'COUNTIFS'};const skill=harder?next[choice?.skill]||choice?.skill:choice?.skill;if(excelNameForSkill(skill)){task.excelSkill=skill;task.text='Решите упражнения на функцию '+skill+' без подсказок. '+reason;}}
    try{await this.store.commit([{path:slot,version:null,data:{uid,at:now,status:'preparing'}}]);}catch(e){if(e.code==='conflict')return savePlan();throw e;}
    try{
      const p=await this.control.proposeAssignment(actor,task),slotDoc=await this.store.get(slot);await this.store.commit([{path:slot,version:slotDoc.version,data:{uid,at:now,proposalId:p.id,status:'proposed'}}]);
      if(policy.autoAssignments)await this.control.approve(actor,p.id,p.digest,{automatic:true});return savePlan({...plan,proposalId:p.id});
    }catch(e){const s=await this.store.get(slot);if(s?.data.status==='preparing')await this.store.commit([{path:slot,version:s.version,delete:true}]);throw e;}
  }
}
