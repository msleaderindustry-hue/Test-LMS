import {fail,integer,DAY,WORD_LESSONS} from './domain.mjs';
import {aggregate} from './metrics.mjs';
export const draftCriteria=()=>({version:1,windowDays:30,requiredModules:['typing','tests','hotkeys','word','excel'],typing:{cpm:250,accuracy:98,attempts:3,minDurationMs:180000},tests:{score:90,topicScore:85,attempts:3},hotkeys:{score:95,attempts:3},word:{lessons:['memo','report','table']},excel:{score:90,distinctSkills:5,attempts:10}});
export function validateCriteria(value){
  if(!value||value.version!==1||!Array.isArray(value.requiredModules)||!value.requiredModules.length||value.requiredModules.some(x=>!['typing','tests','hotkeys','word','excel'].includes(x))||new Set(value.requiredModules).size!==value.requiredModules.length)fail(400,'invalid-criteria','Выберите обязательные направления.');
  const out={version:1,windowDays:integer(value.windowDays??30,7,30,'окно оценки'),requiredModules:value.requiredModules};
  for(const module of out.requiredModules){const v=value[module]||{};
    if(module==='typing')out.typing={cpm:integer(v.cpm,50,1500,'знаки/мин'),accuracy:integer(v.accuracy,80,100,'точность'),attempts:integer(v.attempts,3,20,'попытки'),minDurationMs:integer(v.minDurationMs,60000,600000,'длительность')};
    if(module==='tests')out.tests={score:integer(v.score,50,100,'тесты'),topicScore:integer(v.topicScore,50,100,'темы'),attempts:integer(v.attempts,3,20,'попытки')};
    if(module==='hotkeys')out.hotkeys={score:integer(v.score,50,100,'сочетания'),attempts:integer(v.attempts,3,20,'попытки')};
    if(module==='excel')out.excel={score:integer(v.score,50,100,'Excel'),distinctSkills:integer(v.distinctSkills,1,30,'функции'),attempts:integer(v.attempts,3,50,'попытки')};
    if(module==='word'){if(!Array.isArray(v.lessons)||!v.lessons.length||v.lessons.some(x=>!WORD_LESSONS.includes(x))||new Set(v.lessons).size!==v.lessons.length)fail(400,'invalid-criteria','Выберите упражнения Word.');out.word={lessons:v.lessons};}
  }return out;
}
export function evaluateProficiency(rows,policy,now=Date.now()){
  if(!policy?.proficiencyApprovedAt||!policy?.proficiency)return {status:'not-configured',reason:'Критерии «профи» ещё не утверждены владельцем.'};
  const c=policy.proficiency,checks=[];rows=rows.filter(x=>x.at>=Math.max(policy.proficiencyApprovedAt,now-(c.windowDays||30)*DAY)&&x.at<now);
  for(const m of c.requiredModules){const r=rows.filter(x=>x.module===m&&x.at>=policy.proficiencyApprovedAt),independent=r.filter(x=>!x.hints),rule=c[m];let passed=false,reason;
    if(m==='typing'){const qualifying=independent.filter(x=>x.cpm>=rule.cpm&&x.score>=rule.accuracy&&x.durationMs>=rule.minDurationMs);const days=new Set(qualifying.map(x=>Math.floor((x.at+5*3600000)/86400000))).size;passed=qualifying.length>=rule.attempts&&days>=3;reason=`Подходящих попыток: ${qualifying.length}/${rule.attempts}; разных дней: ${days}/3. Требуется ${rule.cpm} зн/мин, ${rule.accuracy}%, от ${rule.minDurationMs/60000} мин.`;}
    if(m==='tests'){const total=aggregate(independent),topics=[...new Set(independent.flatMap(x=>x.items?.map(i=>i.skill)||[x.skill]))];const scores=topics.map(t=>{const items=independent.flatMap(x=>x.items||[{skill:x.skill,correct:x.correct,total:x.total}]).filter(x=>x.skill===t);return {n:items.reduce((s,x)=>s+x.total,0),score:items.reduce((s,x)=>s+x.correct,0)/Math.max(1,items.reduce((s,x)=>s+x.total,0))*100};});passed=total.attempts>=rule.attempts&&total.score>=rule.score&&scores.length>0&&scores.every(x=>x.n>=10&&x.score>=rule.topicScore);reason=`Попыток ${total.attempts}/${rule.attempts}; результат ${total.score??'нет'}%; по каждой проверенной теме нужно от 10 ответов и ${rule.topicScore}%.`;}
    if(m==='hotkeys'){const total=aggregate(independent);passed=total.attempts>=rule.attempts&&total.score>=rule.score;reason=`Без подсказок: ${total.attempts}/${rule.attempts} серий; результат ${total.score??'нет'}% при пороге ${rule.score}%.`;}
    if(m==='word'){const done=new Set(independent.filter(x=>x.verified&&x.score===100).map(x=>x.skill));const n=rule.lessons.filter(x=>done.has(x)).length;passed=n===rule.lessons.length;reason=`Проверено документов: ${n}/${rule.lessons.length}.`;}
    if(m==='excel'){const verified=independent.filter(x=>x.verified),total=aggregate(verified),skills=new Set(verified.filter(x=>x.score===100).map(x=>x.skill)).size;passed=total.attempts>=rule.attempts&&total.score>=rule.score&&skills>=rule.distinctSkills;reason=`Проверено попыток ${total.attempts}/${rule.attempts}; разных функций ${skills}/${rule.distinctSkills}; результат ${total.score??'нет'}%.`;}
    checks.push({module:m,passed,reason});
  }
  const met=checks.filter(x=>x.passed).length;return {status:met===checks.length?'criteria-met':'in-progress',reason:met===checks.length?'Утверждённые показатели достигнуты по наблюдаемым результатам.':'Выполнено направлений: '+met+' из '+checks.length+'.',checks,completedModules:met,totalModules:checks.length,percent:Math.round(met/checks.length*100)};
}
