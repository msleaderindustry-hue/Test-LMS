(function(){
  const h=React.createElement,{useEffect,useState}=React;
  const labels={typing:'Печать',tests:'Тесты',hotkeys:'Сочетания клавиш',word:'Word',excel:'Excel',code:'Код',flashcards:'Карточки',chess:'Шахматы'};
  const date=n=>new Date(n).toLocaleString('ru-RU',{timeZone:'Asia/Tashkent'});
  function Criteria({value:d}){const c=d;return h('div',null,h('p',null,'Окно оценки: '+(d.windowDays||30)+' суток. Учитываются новые результаты после подтверждения.'),h('ul',null,
    d.requiredModules.includes('typing')&&h('li',null,`Печать: ${c.typing.cpm} зн/мин, точность ${c.typing.accuracy}%, ${c.typing.attempts} попытки от ${c.typing.minDurationMs/60000} мин в разные три дня.`),
    d.requiredModules.includes('tests')&&h('li',null,`Тесты: ${c.tests.score}%; по каждой проверенной теме ${c.tests.topicScore}% и от 10 ответов; минимум ${c.tests.attempts} прохождения.`),
    d.requiredModules.includes('hotkeys')&&h('li',null,`Сочетания: ${c.hotkeys.score}% решённых вопросов без подсказок, минимум ${c.hotkeys.attempts} серии.`),
    d.requiredModules.includes('word')&&h('li',null,'Word: серверная проверка четырёх условий каждого упражнения: '+c.word.lessons.join(', ')+'.'),
    d.requiredModules.includes('excel')&&h('li',null,`Excel: ${c.excel.score}%, минимум ${c.excel.attempts} проверенных попыток без подсказок по ${c.excel.distinctSkills} разным функциям.`)));}
  function Analysis({value}){return h('section',{className:'lms-control-analysis'},
    h('p',null,date(value.start)+' — '+date(value.end)),value.generatedAt&&h('p',null,'Данные рассчитаны: '+date(value.generatedAt)),
    h('p',null,`Попыток: ${value.totals.attempts}. Проверено сервером: ${value.totals.verifiedAttempts}.`),
    value.activeMs!=null&&h('p',null,`Наблюдаемая активность: ${Math.round(value.activeMs/60000)} мин.`),
    value.assignments&&h('p',null,`Заданий выполнено: ${value.assignments.completed}/${value.assignments.assigned}; просрочено: ${value.assignments.overdue}; нужна помощь: ${value.assignments.needsHelp}.`),
    value.skills?.length?h('div',{style:{overflowX:'auto'}},h('table',null,h('thead',null,h('tr',null,...['Навык','Результат','Динамика','Медиана группы'].map(x=>h('th',{key:x},x)))),h('tbody',null,value.skills.map(s=>h('tr',{key:s.key},h('td',null,(labels[s.module]||s.module)+' · '+s.skill),h('td',null,s.current.score==null?'Нет данных':s.current.score+'%'),h('td',null,s.deltaPoints==null?'Мало данных':`${s.deltaPoints>0?'+':''}${s.deltaPoints} п. п.`),h('td',null,s.groupMedian==null?'Недостаточно данных':s.groupMedian+'%')))))):h('p',null,'Сопоставимых результатов пока нет.'),
    h('ol',null,value.recommendations?.map((r,i)=>h('li',{key:i},h('strong',null,({reinforce:'Повторить слабую тему',challenge:'Перейти к более сложной практике',practice:'Закрепить навык',diagnose:'Пройти исходную диагностику'}[r.kind]||'Практика')+(r.module?' · '+labels[r.module]:'')),h('p',null,r.reason)))),
    value.weakKeys?.length>0&&h('p',null,'Клавиши для тренировки: '+value.weakKeys.map(x=>`${x.char===' '?'пробел':x.char} — ${x.errorPercent}% ошибок`).join('; ')),
    value.proficiency?.checks&&h('ul',null,value.proficiency.checks.map(c=>h('li',{key:c.module},(c.passed?'Достигнуто: ':'Следующий рубеж: ')+labels[c.module]+'. '+c.reason))),
    h('p',null,value.proficiency?.reason),value.legacy&&h('details',null,h('summary',null,'Ранее накопленные результаты'),h('p',null,value.legacy.note),h('p',null,`Тесты: ${value.legacy.tests}; печать: ${value.legacy.typingSessions}; сочетания: ${value.legacy.hotkeySessions}; Excel: ${value.legacy.excelCompleted}.`)));
  }
  function ControlCard({value}){
    const [state,setState]=useState(value),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(value.proposal?.status==='completed'?value.proposal.result:null);
    useEffect(()=>{let dead=false,timer;if(!state.jobId)return;const poll=async()=>{try{const job=await LmsApi.request('/jobs/'+state.jobId);if(dead)return;if(['completed','failed'].includes(job.status)){let report;try{report=await LmsApi.request('/reports/'+state.jobId);}catch(e){if(job.status==='completed')throw e;}if(!dead){setState(report?{report}:{});if(job.status==='failed')setError(report?'Отчёт сохранён в LMS. Доставка в Discord не завершена; её можно повторить в журнале задач.':'Расчёт не завершён. Откройте журнал задач, чтобы увидеть ошибку и повторить.');}return;}}catch(e){if(!dead)setError(e.message);}if(!dead)timer=setTimeout(poll,5000);};timer=setTimeout(poll,2000);return()=>{dead=true;clearTimeout(timer);};},[state.jobId]);
    async function action(kind){if(busy)return;setBusy(true);setError('');try{const result=await LmsApi.request('/proposals/'+state.proposal.id+'/'+kind,{digest:state.proposal.digest});setDone(kind==='cancel'?{status:'cancelled'}:result);}catch(e){setError(e.message);}finally{setBusy(false);}}
    const p=state.proposal,d=p?.details,report=state.report;
    return h('section',{className:'lms-control-card','aria-label':'Действие LMS'},
      p&&h(React.Fragment,null,h('strong',null,p.summary),
        p.type==='assignment'&&h('dl',null,...[['Раздел',labels[d.module]],['Ученики',d.studentIds.map(uid=>d.studentNames?.[uid]?d.studentNames[uid]+' ('+uid+')':uid).join(', ')],['Срок',date(d.dueAt)],['Количество',d.target],['Точность',d.module==='typing'?d.minAccuracy+'%':'—'],['Упражнение',d.wordLesson||d.hotkeyBank],['Почему',d.reason]].flatMap(([k,v])=>[h('dt',{key:k},k),h('dd',{key:k+'v'},v)])),
        d?.excelSkill&&h('p',null,'Функция для зачёта: '+d.excelSkill),d?.maxErrors!=null&&h('p',null,'Допустимо ошибок в серии: '+d.maxErrors),
        p.type==='criteria'&&h(Criteria,{value:d}),
        p.type==='group'&&h('p',null,'Ученики: '+d.studentIds.join(', ')),
        d?.text&&h('blockquote',null,d.text),d?.paths&&h('details',null,h('summary',null,`Затронуто документов: ${d.documents}`),h('ul',null,d.paths.map(x=>h('li',{key:x},x)))),
        !done&&h('p',null,'Подтверждение действует до '+date(p.expiresAt)),
        !done&&h('div',{className:'lms-control-actions'},h('button',{type:'button',disabled:busy,onClick:()=>action('approve')},busy?'Выполняется…':'Подтвердить'),h('button',{type:'button',disabled:busy,onClick:()=>action('cancel')},'Отменить'))),
      done&&h('p',{role:'status'},done.status==='cancelled'?'Предложение отменено.':done.deleted!=null?`Удалено записей: ${done.deleted}. Копия: ${done.backupId}.`:done.restored!=null?`Восстановлено записей: ${done.restored}.`:'Действие выполнено.'),
      done?.backupId&&!p?.restoredAt&&h('button',{type:'button',disabled:busy,onClick:async()=>{setBusy(true);try{await LmsApi.propose('restore',{backupId:done.backupId});}catch(e){setError(e.message);}finally{setBusy(false);}}},'Подготовить восстановление'),
      state.analysis&&h(Analysis,{value:state.analysis}),state.jobId&&h('p',{role:'status'},'Отчёт готовится в фоне…'),
      report&&h(React.Fragment,null,h('h3',null,report.onDemand?'Отчёт на текущий момент':report.kind==='weekly'?'Недельный отчёт':'Ежедневный отчёт'),h('p',null,date(report.start)+' — '+date(report.end)),h('p',null,`Ученики: ${report.studentCount}. Попытки: ${report.totals.attempts}.`),report.reconciliation&&h('p',null,`Сверка: ${report.reconciliation.consistent?'суммы семи суток совпадают':'обнаружено расхождение'}. `+(report.onDemand?'Границы скользящего окна отличаются от плановых сводок.':`Сохранённые сводки: ${report.reconciliation.savedDaily.filter(x=>x.status==='matches').length}/7 совпадают.`)),report.students?.map(s=>h('details',{key:s.uid},h('summary',null,s.name),h(Analysis,{value:s})))),
      state.reports?.map(r=>h('button',{type:'button',key:r.id,onClick:async()=>{try{setState({report:await LmsApi.request('/reports/'+r.id)});}catch(e){setError(e.message);}}},(r.kind==='weekly'?'Неделя: ':'День: ')+date(r.end))),
      state.proposals?.map(p=>h(ControlCard,{key:p.id,value:{proposal:p}})),
      state.cleanups?.map(p=>h(ControlCard,{key:p.id,value:{proposal:p}})),
      state.jobs?.map(job=>h('p',{key:job.id},date(job.createdAt)+' · '+job.kind+' · '+job.lastError,h('button',{type:'button',disabled:busy,onClick:async()=>{setBusy(true);try{await LmsApi.request('/jobs/'+job.id+'/retry',{});setState(s=>({...s,jobs:s.jobs.filter(x=>x.id!==job.id)}));}catch(e){setError(e.message);}finally{setBusy(false);}}},'Повторить'))),
      (state.proposals?.length===0||state.cleanups?.length===0||state.jobs?.length===0||state.reports?.length===0)&&h('p',null,'Записей пока нет.'),
      error&&h('p',{role:'alert',className:'lms-control-error'},error));
  }
  window.LmsControlCard=ControlCard;
  const style=document.createElement('style');style.textContent='.lms-control-card{margin:8px 0;padding:14px;border:1px solid #64748b55;border-radius:12px;font-size:14px;line-height:1.5;overflow-wrap:anywhere}.lms-control-card button{padding:8px 12px;margin:5px;border:1px solid #64748b77;border-radius:8px;background:#6941c6;color:#fff;cursor:pointer}.lms-control-card button:disabled{opacity:.6;cursor:wait}.lms-control-actions{display:flex;flex-wrap:wrap}.lms-control-card dl{display:grid;grid-template-columns:100px 1fr;gap:4px}.lms-control-card dd{margin:0}.lms-control-card th,.lms-control-card td{padding:6px;border-bottom:1px solid #64748b44;text-align:left}.lms-control-error{color:#ef4444}.lms-control-card details{margin:8px 0}';document.head.appendChild(style);
})();
