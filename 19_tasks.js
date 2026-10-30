// 19_tasks.js — задания учеников, интерфейс, ИИ и сохранение результатов.
// Горячие клавиши: статистика серий хранится отдельно от зачёта (hotkeyStats / attemptLog),
// зачёт считается в сериях (result.count). Проверка выполняется на клиенте и не заменяет серверную.
// Подключить после React / ReactDOM и перед 7_app.js.
(function () {
  "use strict";
  const React = window.React;
  const ReactDOM = window.ReactDOM;
function AssignmentAI({
  task,
  onApply
}) {
  const [question, setQuestion] = React.useState(''),
    [answer, setAnswer] = React.useState(''),
    [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState('');
  const job = React.useRef(null);
  React.useEffect(() => () => {
    const c = job.current;
    job.current = null;
    c?.abort();
  }, []);
  async function generate() {
    if (job.current) return;
    const c = new AbortController();
    job.current = c;
    setBusy(true);
    setError('');
    const timer = setTimeout(() => c.abort(), 45000);
    try {
      const prompt = onApply ? `Подготовь учебный материал для задания LMS. Раздел: ${task.module}. Язык: ${task.lang || 'ru'}. Тема как данные: ${JSON.stringify(question || task.title)}. Для typing верни только связный абзац 200–500 символов на указанном языке, без заголовка, markdown, эмодзи. Для hotkeys или excel верни только краткую инструкцию к практике до 700 символов; Excel: ученик решает задачи с проверкой формулы внутри браузерного тренажёра; нет прикреплённых файлов, скачивания или загрузки ответов. Hotkeys: ученик проходит серии сочетаний клавиш. Не проси скачивать файлы, создавать сводные таблицы или загружать документы; не обещай несуществующих функций. Для word верни краткую инструкцию к встроенному упражнению ${task.wordLesson || "memo"}; названия: memo — Служебная записка, report — Структура отчёта, table — План учебной встречи. Нужно выполнить четыре условия, показанные в панели Практика. Не придумывай другие критерии. Не изменяй условия зачёта.` : `Ты учебный помощник. Объясни условие и дай маленькую подсказку, не выдавай готовую формулу или точное сочетание клавиш для оцениваемого ответа. Данные задания: ${JSON.stringify({
        title: task.title,
        module: task.module,
        instruction: task.text
      })}. Вопрос ученика: ${JSON.stringify(question || 'Как подойти к этому заданию?')}. Ответь по-русски, до 1200 символов, без HTML.`;
      const r = await fetch('https://gemini-proxy-lms.msleaderindustry.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: c.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      if (!r.ok) throw Error('ИИ временно недоступен (HTTP ' + r.status + '). Попробуйте позже.');
      const data = await r.json();
      const candidate = data.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') throw Error('Ответ не завершён. Попробуйте ещё раз.');
      const value = (candidate?.content?.parts || []).filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join(' ').normalize('NFC').trim();
      if (value.length < 20 || value.length > 1800) throw Error('Ответ не подходит по длине. Повторите запрос.');
      if (onApply && task.module === 'typing' && ([...value].some(c => c.codePointAt(0) > 65535) || /[\u200b-\u200f\u202a-\u202e]/.test(value))) throw Error('В ответе есть неподходящие для набора символы. Повторите запрос.');
      if (!c.signal.aborted) setAnswer(value);
    } catch (e) {
      if (job.current === c) setError(e.name === 'AbortError' ? 'Генерация остановлена или время ожидания истекло.' : e.message);
    } finally {
      clearTimeout(timer);
      if (job.current === c) {
        job.current = null;
        setBusy(false);
      }
    }
  }
  return /*#__PURE__*/React.createElement("details", {
    className: "assignment-ai"
  }, /*#__PURE__*/React.createElement("summary", null, "✦ ", onApply ? 'Подготовить с ИИ' : 'Объяснить с ИИ'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, onApply ? 'Тема материала' : 'Что непонятно?', /*#__PURE__*/React.createElement("textarea", {
    value: question,
    maxLength: 500,
    onChange: e => setQuestion(e.target.value),
    placeholder: onApply ? 'Например: путешествия и открытия' : 'Например: с чего начать?'
  })), /*#__PURE__*/React.createElement("div", {
    className: "assignment-ai-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: busy,
    onClick: generate
  }, busy ? 'Готовим ответ…' : onApply ? 'Создать черновик' : 'Получить подсказку'), busy && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => job.current?.abort()
  }, "Отмена")), error && /*#__PURE__*/React.createElement("p", {
    role: "alert"
  }, error), answer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "assignment-ai-answer"
  }, answer), onApply && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onApply(answer)
  }, "Вставить в задание"), /*#__PURE__*/React.createElement("small", null, "Ответ ИИ может содержать ошибки. ", onApply ? 'Проверьте перед назначением.' : 'Подсказка не засчитывается как выполнение.'))));
}
const LMS_TASK_MODULES = {
  typing: 'Печать',
  hotkeys: 'Горячие клавиши',
  word: 'Word Lab',
  excel: 'Excel'
};
function lmsTaskMetric(profile, module) {
  if(module === 'word') return {count: (profile?.wordProgress?.completedLessons || []).length};
  if (module === 'hotkeys') return {
    count: Math.max(0, Math.floor(Number(profile?.hotkeyProgress?.sessionsPlayed) || 0))
  };
  const lessons = profile?.excelProgress?.completedLessons;
  return Array.isArray(lessons) ? {
    count: lessons.length,
    ids: lessons.map(String)
  } : {
    count: Math.max(0, Math.floor(Number(lessons) || 0))
  };
}
function LmsMyAssignments({
  uid,
  onOpen,
  onBack,
  modules,
  profile
}) {
  const [items, setItems] = React.useState([]),
    [error, setError] = React.useState(''),
    [loading, setLoading] = React.useState(true),
    [filter, setFilter] = React.useState('all');
  React.useEffect(() => {
    setItems([]);
    setLoading(true);
    return window.db.collection('lmsAssignments').where('studentIds', 'array-contains', uid).onSnapshot(s => {
      setItems(s.docs.map(d => ({
        id: d.id,
        ...d.data()
      })).filter(t => t.status === 'assigned').sort((a, b) => (a.dueAt?.toMillis?.() || Infinity) - (b.dueAt?.toMillis?.() || Infinity)));
      setLoading(false);
      setError('');
    }, e => {
      setError(e.message);
      setLoading(false);
    });
  }, [uid]);
  const list = filter === 'all' ? items : items.filter(t => t.module === filter);
  return /*#__PURE__*/React.createElement("section", {
    className: "la-box la-page"
  }, /*#__PURE__*/React.createElement("style", null, LMS_ASSIGN_CSS), /*#__PURE__*/React.createElement("header", {
    className: "la-page-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "la-page-icon",
    "aria-hidden": "true"
  }, "✓"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "УЧЕБНЫЙ ПЛАН"), /*#__PURE__*/React.createElement("h3", null, "Мои задания"), /*#__PURE__*/React.createElement("p", null, "Практика, результаты и связь с преподавателем."))), /*#__PURE__*/React.createElement("div", {
    className: "la-page-toolbar"
  }, /*#__PURE__*/React.createElement("span", null, loading ? 'Загружаем…' : `Всего заданий: ${items.length}`), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", {
    className: "la-sr"
  }, "Раздел заданий"), /*#__PURE__*/React.createElement("select", {
    value: filter,
    onChange: e => setFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Все разделы"), Object.entries(LMS_TASK_MODULES).map(([id, name]) => /*#__PURE__*/React.createElement("option", {
    key: id,
    value: id
  }, name))))), error && /*#__PURE__*/React.createElement("p", {
    role: "alert",
    className: "la-error"
  }, error), loading ? /*#__PURE__*/React.createElement("p", {
    role: "status"
  }, "Загружаем задания…") : /*#__PURE__*/React.createElement(React.Fragment, null, !list.length && /*#__PURE__*/React.createElement("div", {
    className: "la-empty"
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "✓"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, items.length ? 'В этом разделе пусто' : 'Пока заданий нет'), /*#__PURE__*/React.createElement("p", null, items.length ? 'Выберите другой раздел в фильтре.' : 'Задания преподавателя появятся здесь.'))), /*#__PURE__*/React.createElement("div", {
    className: "la-cards la-page-cards"
  }, list.map(task => /*#__PURE__*/React.createElement(LmsAssignmentCard, {
    key: task.id,
    task: task,
    uid: uid,
    profile: profile,
    modules: modules,
    onOpen: onOpen
  })))));
}
function LmsAssignmentCard({
  task,
  uid,
  onOpen,
  modules,
  profile
}) {
  const [p, setP] = React.useState(null),
    [error, setError] = React.useState(''),
    [busy, setBusy] = React.useState(false),
    [now, setNow] = React.useState(Date.now());
  const lock = React.useRef(false),
    alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => alive.current = false;
  }, []);
  React.useEffect(() => window.db.collection('lmsAssignments').doc(task.id).collection('progress').doc(uid).onSnapshot(s => setP(s.data() || {}), e => setError(e.message)), [uid, task.id]);
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const [helpOpen, setHelpOpen] = React.useState(false),
    [question, setQuestion] = React.useState('');
  async function act(help) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const live = await lmsAssignmentWrite(task.id, uid, help ? 'help' : 'start', help ? {
        question
      } : undefined);
      if (alive.current) {
        if (help) {
          setHelpOpen(false);
          setQuestion('');
        } else onOpen(live);
      }
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  const legacy = p?.status === 'completed' && task.module !== 'typing' && p.receiptVersion !== 2,
    done = p?.status === 'completed' && !legacy,
    late = task.dueAt?.toMillis?.() < now,
    canOpen = modules.includes(task.module) && !!LMS_TASK_MODULES[task.module];
  return /*#__PURE__*/React.createElement("article", {
    className: 'la-task-row ' + (done ? 'la-card-done' : ''),
    "data-module": task.module
  }, /*#__PURE__*/React.createElement("div", {
    className: "la-row-main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "la-row-icon",
    "aria-hidden": "true"
  }, task.module === 'word' ? 'W' : task.module === 'excel' ? 'ƒx' : task.module === 'hotkeys' ? '⌘' : 'Aa'), /*#__PURE__*/React.createElement("div", {
    className: "la-row-copy"
  }, /*#__PURE__*/React.createElement("small", null, LMS_TASK_MODULES[task.module] || 'Раздел'), /*#__PURE__*/React.createElement("h4", null, task.title), /*#__PURE__*/React.createElement("div", {
    className: "la-row-meta"
  }, /*#__PURE__*/React.createElement("span", null, task.module === 'typing' ? `${task.lang?.toUpperCase()} · от ${task.minAccuracy}% точности` : `${task.target || 1} ${task.module === 'word' ? 'документ' : task.module === 'excel' ? 'задач' : 'серий'}`), /*#__PURE__*/React.createElement("span", null, "До ", task.dueAt?.toDate?.().toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }) || '—'))), /*#__PURE__*/React.createElement("b", {
    className: 'la-state ' + (done ? 'done' : p?.needsHelp ? 'help' : late ? 'late' : '')
  }, done ? 'Выполнено' : legacy ? 'Перепроверка' : p?.needsHelp ? 'Нужна помощь' : late ? 'Просрочено' : p?.status === 'started' ? 'В процессе' : 'Новое'), !done && /*#__PURE__*/React.createElement("button", {
    className: "la-primary la-row-start",
    disabled: busy || !canOpen || !p,
    onClick: () => act(false)
  }, busy ? 'Подождите…' : legacy ? 'Пройти заново' : p?.status === 'started' ? 'Продолжить' : 'Начать', /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "↗")), done && /*#__PURE__*/React.createElement("span", {
    className: "la-row-finished",
    "aria-hidden": "true"
  }, "✓")), /*#__PURE__*/React.createElement("details", {
    className: "la-row-details"
  }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("span", null, done ? 'Посмотреть результат' : 'Условия и помощь'), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })), p?.helpReply && /*#__PURE__*/React.createElement("em", null, "Ответ преподавателя")), /*#__PURE__*/React.createElement("div", {
    className: "la-row-expanded"
  }, /*#__PURE__*/React.createElement("div", {
    className: "la-row-description"
  }, /*#__PURE__*/React.createElement("small", null, "УСЛОВИЯ ВЫПОЛНЕНИЯ"), /*#__PURE__*/React.createElement("p", null, task.module === 'typing' ? `Наберите весь текст с точностью не ниже ${task.minAccuracy}%.` : task.module === 'word' ? 'Выполните все четыре условия оформления назначенного документа в Word Lab и нажмите «Проверить оформление».' : task.module === 'excel' ? `Самостоятельно решите ${task.target || 1} задач в тренажёре. Просмотр решения не засчитывается.` : `Выполните ${task.target || 1} ${lmsPlural(task.target || 1, 'серию', 'серии', 'серий')}. В серии — минимум 5 разных сочетаний категории «${LMS_HOTKEY_BANKS[task.hotkeyBank || 'any'] || task.hotkeyBank}», каждое нужно найти самостоятельно: без подсказок и пропусков. Ошибки допустимы, если вы сами нашли верное сочетание — они сохраняются в статистике, но серию не отменяют.`), task.module !== 'typing' && task.text && /*#__PURE__*/React.createElement("p", {
    className: "la-instruction"
  }, task.text), legacy && /*#__PURE__*/React.createElement("p", {
    className: "la-notice"
  }, "Нужно пройти задание заново: прежний результат не подтверждён по новым условиям."), p?.result && !legacy && /*#__PURE__*/React.createElement("div", {
    className: "la-card-result"
  }, task.module === 'typing' ? `${p.result.accuracy}% точности · ${p.result.wpm} WPM` : task.module === 'hotkeys' ? lmsHotkeyResultNodes(p, task) : `Выполнено: ${p.result.count || 0} / ${task.target || 1}`), !done && /*#__PURE__*/React.createElement(AssignmentAI, {
    task: task
  })), /*#__PURE__*/React.createElement("div", {
    className: "la-row-help"
  }, /*#__PURE__*/React.createElement("small", null, "СВЯЗЬ С ПРЕПОДАВАТЕЛЕМ"), !done && /*#__PURE__*/React.createElement("button", {
    className: "la-help-toggle",
    disabled: busy || !canOpen || !p,
    onClick: () => setHelpOpen(v => !v)
  }, helpOpen ? 'Закрыть вопрос' : 'Написать вопрос'), helpOpen && /*#__PURE__*/React.createElement("div", {
    className: "la-help-form"
  }, /*#__PURE__*/React.createElement("label", null, "Ваш вопрос", /*#__PURE__*/React.createElement("textarea", {
    value: question,
    maxLength: 1000,
    onChange: e => setQuestion(e.target.value),
    placeholder: "Что не получается? На каком шаге нужна помощь?"
  })), /*#__PURE__*/React.createElement("div", {
    className: "la-help-footer"
  }, /*#__PURE__*/React.createElement("small", null, question.length, " / 1000"), /*#__PURE__*/React.createElement("button", {
    disabled: busy || !question.trim(),
    onClick: () => act(true)
  }, busy ? 'Отправляем…' : 'Отправить'))), p?.helpQuestion ? /*#__PURE__*/React.createElement("div", {
    className: "la-help-history"
  }, /*#__PURE__*/React.createElement("small", null, "Ваш вопрос"), /*#__PURE__*/React.createElement("p", null, p.helpQuestion), p.helpReply ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("small", null, "Ответ преподавателя"), /*#__PURE__*/React.createElement("p", null, p.helpReply)) : /*#__PURE__*/React.createElement("small", null, "Вопрос отправлен. Ответ появится здесь.")) : /*#__PURE__*/React.createElement("p", null, "Вопросы и ответы по этому заданию будут здесь.")))), !canOpen && /*#__PURE__*/React.createElement("p", {
    className: "la-error"
  }, "Доступ к разделу отключён преподавателем."), error && /*#__PURE__*/React.createElement("p", {
    role: "alert",
    className: "la-error"
  }, error));
}
async function lmsAssignmentWrite(id, uid, action, result) {
  const db = window.db,
    ref = db.collection('lmsAssignments').doc(id),
    pr = ref.collection('progress').doc(uid);
  return db.runTransaction(async tx => {
    const [a, p, u] = await Promise.all([tx.get(ref), tx.get(pr), tx.get(db.collection('users').doc(uid))]);
    const task = a.data(),
      old = p.data() || {},
      profile = u.data();
    const allowed = id => profile?.allowedModules == null || Array.isArray(profile.allowedModules) && profile.allowedModules.includes(id);
    if (window.auth?.currentUser?.uid !== uid || !a.exists || !task.studentIds?.includes(uid) || !profile || profile.isBanned || !allowed('assignments') || !allowed(task.module)) throw Error('Нет доступа к этому заданию.');
    if (!LMS_TASK_MODULES[task.module] || task.status !== 'assigned') throw Error('Задание недоступно.');
    const ts = window.firebase.firestore.FieldValue.serverTimestamp;
    const next = {
      ...old,
      updatedAt: ts()
    };
    if (action === 'start') {
      if (old.status === 'completed' && (task.module === 'typing' || old.receiptVersion === 2)) throw Error('Задание уже выполнено.');
      if (task.module !== 'typing' && old.receiptVersion !== 2) {
        next.receiptVersion = 2;
        next.result = {
          count: 0
        };
        next.acceptedAttemptIds = [];
        next.completedAt = null;
      }
      next.status = 'started';
      next.startedAt = old.startedAt || ts();
      if (task.module !== 'typing' && !old.baseline) next.baseline = lmsTaskMetric(profile, task.module);
    }
    if (action === 'help') {
      if (!result?.question?.trim() || result.question.length > 1000) throw Error('Введите вопрос до 1000 символов.');
      next.helpQuestion = result.question.trim();
      next.helpReply = '';
      next.helpRequestedAt = ts();
      next.needsHelp = true;
      next.status = old.status || 'not_started';
    }
    if (action === 'sync') return {
      ...task,
      id
    }; // General profile counters never grant credit.
    if (action === 'finish') {
      if (task.module !== 'typing' || !result || result.text !== task.text || result.lang !== task.lang || result.characters !== task.text.length) throw Error('Задание изменилось. Откройте его заново.');
      if (old.status === 'completed' || old.lastAttemptId === result.attemptId) return {
        ...task,
        id
      };
      const errors = Number(result.errors),
        ms = Number(result.ms);
      if (!Number.isInteger(errors) || errors < 0 || !Number.isFinite(ms) || ms < 1000) throw Error('Некорректный результат.');
      const accuracy = Math.round(result.characters / (result.characters + errors) * 100),
        wpm = Math.round(result.characters / 5 / (ms / 60000));
      next.result = {
        accuracy,
        wpm,
        errors,
        ms
      };
      next.lastAttemptId = result.attemptId;
      next.attempts = (old.attempts || 0) + 1;
      next.status = accuracy >= task.minAccuracy ? 'completed' : 'started';
      if (next.status === 'completed') {
        next.completedAt = ts();
        next.needsHelp = false;
      }
    }
    tx.set(pr, next);
    return {
      ...task,
      id
    };
  });
}
// ---------- Горячие клавиши: серии, статистика и зачёт ----------
// Проверка ниже выполняется в браузере ученика (клиентская транзакция Firestore).
// Она защищает от случайных и повторных записей, но не от намеренной подделки:
// для этого нужны серверная проверка (Cloud Function) и правила Firestore.
const LMS_HOTKEY_BANKS = {
  word: 'Word',
  windows: 'Windows',
  excel: 'Excel',
  any: 'любая'
};
const LMS_HOTKEY_MIN_SERIES = 5;
const lmsActiveAssignments = new Map();
// Контекст открытого задания существует только пока открыта панель задания.
window.lmsGetActiveAssignmentContext = function (module) {
  const uid = window.auth?.currentUser?.uid;
  if (!uid) return null;
  for (const c of lmsActiveAssignments.values()) if (c.uid === uid && (!module || c.module === module)) return {
    ...c
  };
  return null;
};
function lmsPlural(n, one, few, many) {
  const a = Math.abs(Number(n) || 0),
    m10 = a % 10,
    m100 = a % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
}
function lmsPermanent(message) {
  return Object.assign(Error(message), {
    permanent: true
  });
}
// Оценка одной серии. Статистика считается всегда, зачёт — только если reasons пуст.
function lmsEvaluateHotkeySeries(task, ev) {
  const r = ev?.records;
  if (!Array.isArray(r) || !r.length || r.length > 500 || r.length !== Number(ev.total)) return {
    invalid: true
  };
  const stats = {
      total: r.length,
      solved: 0,
      errors: 0,
      corrected: 0,
      hints: 0,
      skipped: 0,
      unsolved: 0
    },
    ids = new Set();
  for (const x of r) {
    if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !x.id || x.id.length > 80 || !['solved', 'failed', 'skipped', 'pending'].includes(x.status) || !Number.isInteger(x.errors) || x.errors < 0 || x.errors > 1000 || typeof x.hint !== 'boolean') return {
      invalid: true
    };
    ids.add(x.id);
    stats.errors += x.errors;
    if (x.hint) stats.hints++;
    if (x.status === 'skipped') stats.skipped++;else if (x.status === 'solved') {
      stats.solved++;
      // ошибки в сочетании, которое затем найдено без подсказки, считаются исправленными
      if (!x.hint) stats.corrected += x.errors;
    } else stats.unsolved++;
  }
  const reasons = [],
    need = task.hotkeyBank || 'any';
  if (r.length < LMS_HOTKEY_MIN_SERIES) reasons.push('short');
  if (stats.skipped) reasons.push('skipped');
  if (stats.unsolved) reasons.push('unsolved');
  if (stats.hints) reasons.push('hint');
  if (need === 'any') {
    if (!['catalog', 'legacy'].includes(ev.source) || ![...ids].every(id => /^(word|windows|excel|legacy)-/.test(id))) reasons.push('source');
  } else if (!LMS_HOTKEY_BANKS[need] || ev.source !== 'catalog' || ev.bank !== need || ![...ids].every(id => id.startsWith(need + '-'))) reasons.push('bank');
  if (ids.size !== r.length) reasons.push('duplicate');
  return {
    invalid: false,
    accepted: reasons.length === 0,
    reasons,
    stats
  };
}
// Понятный текст результата серии (ru / en / uz).
function lmsDescribeHotkeyReceipt(rc, lang) {
  if (!rc) return '';
  const l = lang === 'en' || lang === 'uz' ? lang : 'ru',
    s = rc.stats || {},
    n = x => Number(x) || 0,
    bank = LMS_HOTKEY_BANKS[rc.need] || rc.need || '';
  const T = {
    ru: {
      completed: 'Задание уже выполнено — новая серия не добавлена.',
      ok: `Серия засчитана: ${n(s.total)} ${lmsPlural(n(s.total), 'сочетание', 'сочетания', 'сочетаний')}, ${n(s.errors) ? `${n(s.errors)} ${lmsPlural(n(s.errors), 'ошибка исправлена', 'ошибки исправлены', 'ошибок исправлено')}` : 'без ошибок'}.`,
      no: 'Серия не засчитана: ',
      reasons: {
        short: `в серии меньше ${LMS_HOTKEY_MIN_SERIES} сочетаний (${n(s.total)})`,
        skipped: `есть пропущенные сочетания (${n(s.skipped)})`,
        unsolved: `не все сочетания решены (${n(s.unsolved)})`,
        hint: 'использована подсказка',
        bank: `другая категория, нужна: ${bank}`,
        source: 'нужен готовый набор Word, Windows или Excel',
        duplicate: 'сочетания в серии повторяются',
        invalid: 'данные серии повреждены'
      },
      saved: ' Статистика сохранена.',
      notSaved: ' Статистика не сохранена.',
      done: ' Задание выполнено.',
      count: ` Засчитано серий: ${n(rc.count)} из ${n(rc.target)}.`,
      dup: ' Эта серия уже была сохранена ранее и повторно не учтена.'
    },
    en: {
      completed: 'The assignment is already completed — the series was not added.',
      ok: `Series accepted: ${n(s.total)} ${n(s.total) === 1 ? 'shortcut' : 'shortcuts'}, ${n(s.errors) ? `${n(s.errors)} ${n(s.errors) === 1 ? 'mistake' : 'mistakes'} corrected` : 'no mistakes'}.`,
      no: 'Series not accepted: ',
      reasons: {
        short: `fewer than ${LMS_HOTKEY_MIN_SERIES} shortcuts (${n(s.total)})`,
        skipped: `some shortcuts were skipped (${n(s.skipped)})`,
        unsolved: `not all shortcuts were solved (${n(s.unsolved)})`,
        hint: 'a hint was used',
        bank: `wrong category, required: ${bank}`,
        source: 'a ready-made Word, Windows or Excel set is required',
        duplicate: 'shortcuts repeat within the series',
        invalid: 'the series data is damaged'
      },
      saved: ' Statistics saved.',
      notSaved: ' Statistics not saved.',
      done: ' Assignment completed.',
      count: ` Series accepted: ${n(rc.count)} of ${n(rc.target)}.`,
      dup: ' This series was already saved earlier and was not counted again.'
    },
    uz: {
      completed: 'Топшириқ аллақачон бажарилган — янги серия қўшилмади.',
      ok: `Серия ҳисобга олинди: ${n(s.total)} та комбинация, ${n(s.errors) ? `${n(s.errors)} та хато тузатилди` : 'хатосиз'}.`,
      no: 'Серия ҳисобга олинмади: ',
      reasons: {
        short: `серияда ${LMS_HOTKEY_MIN_SERIES} тадан кам комбинация (${n(s.total)})`,
        skipped: `ўтказиб юборилган комбинациялар бор (${n(s.skipped)})`,
        unsolved: `ҳамма комбинациялар ҳал қилинмаган (${n(s.unsolved)})`,
        hint: 'кўрсатма ишлатилган',
        bank: `бошқа тоифа, керакли: ${bank}`,
        source: 'Word, Windows ёки Excel тайёр тўплами керак',
        duplicate: 'серияда комбинациялар такрорланган',
        invalid: 'серия маълумотлари бузилган'
      },
      saved: ' Статистика сақланди.',
      notSaved: ' Статистика сақланмади.',
      done: ' Топшириқ бажарилди.',
      count: ` Ҳисобга олинган серия: ${n(rc.count)} / ${n(rc.target)}.`,
      dup: ' Бу серия илгари сақланган, қайта ҳисобга олинмади.'
    }
  }[l];
  if (rc.alreadyCompleted) return T.completed;
  let text;
  if (rc.accepted) text = T.ok + (rc.done ? T.done : T.count);else {
    text = T.no + (rc.reasons?.length ? rc.reasons : ['invalid']).map(x => T.reasons[x] || x).join('; ') + '.';
    if (!rc.quiet) text += rc.recorded === false ? T.notSaved : T.saved;
  }
  return rc.duplicate ? text + T.dup : text;
}
window.lmsDescribeHotkeyReceipt = lmsDescribeHotkeyReceipt;
function lmsHotkeyStatsLine(st) {
  const n = x => Number(st?.[x]) || 0;
  return `Попыток: ${n('series')} (засчитано ${n('accepted')}) · верных ответов: ${n('solved')} · ошибок: ${n('errors')} (исправлено ${n('corrected')}) · подсказок: ${n('hints')} · пропусков: ${n('skipped')}`;
}
function lmsHotkeyResultNodes(p, task) {
  const h = React.createElement,
    head = `Серий засчитано: ${p?.result?.count || 0} / ${task.target || 1}`;
  if (!p?.hotkeyStats) return head;
  return h(React.Fragment, null, head, h('br'), h('small', null, lmsHotkeyStatsLine(p.hotkeyStats)));
}
function lmsHotkeyStatsBlock(progress, task) {
  const h = React.createElement,
    st = progress?.hotkeyStats,
    last = progress?.lastAttempt;
  if (!st && !last) return null;
  const rc = last ? {
    accepted: !!last.accepted,
    reasons: last.reasons || [],
    stats: last,
    need: last.need,
    recorded: true,
    quiet: true,
    count: progress?.result?.count || 0,
    target: task.target || 1,
    done: progress?.status === 'completed' && progress?.receiptVersion === 2
  } : null;
  return h('div', {
    className: 'la-condition'
  }, h('small', null, 'Статистика ответов'), st && h('p', null, lmsHotkeyStatsLine(st)), rc && h('p', null, 'Последняя серия: ', lmsDescribeHotkeyReceipt(rc, 'ru')));
}

// ---------- Очередь повторной отправки (потеря соединения) ----------
const LMS_PENDING_KEY = 'lmsPendingAssignmentResults.v1',
  LMS_PENDING_TTL = 7 * 24 * 3600 * 1000;
function lmsPendingRead() {
  try {
    const v = JSON.parse(localStorage.getItem(LMS_PENDING_KEY) || '[]');
    return Array.isArray(v) ? v.filter(x => x?.evidence?.id && x?.context?.id && Date.now() - x.at < LMS_PENDING_TTL) : [];
  } catch {
    return [];
  }
}
function lmsPendingWrite(list) {
  try {
    if (list.length) localStorage.setItem(LMS_PENDING_KEY, JSON.stringify(list.slice(-20)));else localStorage.removeItem(LMS_PENDING_KEY);
  } catch {}
}
function lmsPendingRemove(id) {
  if (id) lmsPendingWrite(lmsPendingRead().filter(x => x.evidence.id !== id));
}
function lmsPendingAdd(context, evidence) {
  if (evidence?.module !== 'hotkeys' || !evidence.id) return;
  const list = lmsPendingRead().filter(x => x.evidence.id !== evidence.id);
  list.push({
    at: Date.now(),
    context: {
      id: context.id,
      uid: context.uid,
      module: context.module || 'hotkeys'
    },
    evidence
  });
  lmsPendingWrite(list);
}
function lmsIsTransient(e) {
  return !e?.permanent && (!e?.code || ['unavailable', 'deadline-exceeded', 'aborted', 'cancelled', 'resource-exhausted', 'internal', 'unknown'].includes(e.code));
}

// ---------- Транзакция сохранения результата ----------
async function lmsSubmitCore(context, evidence) {
  if (!context?.id || !evidence || typeof evidence.id !== 'string' || !evidence.id || evidence.id.length > 100) throw lmsPermanent('Некорректные данные результата.');
  if (!window.auth?.currentUser || context.uid !== window.auth.currentUser.uid) throw lmsPermanent('Аккаунт изменился. Откройте задание заново.');
  const db = window.db,
    ref = db.collection('lmsAssignments').doc(context.id),
    pr = ref.collection('progress').doc(context.uid);
  return db.runTransaction(async tx => {
    const [a, p, u] = await Promise.all([tx.get(ref), tx.get(pr), tx.get(db.collection('users').doc(context.uid))]);
    const task = a.data(),
      old = p.data() || {},
      profile = u.data(),
      allowed = id => profile?.allowedModules == null || Array.isArray(profile.allowedModules) && profile.allowedModules.includes(id),
      ts = window.firebase.firestore.FieldValue.serverTimestamp;
    if (window.auth?.currentUser?.uid !== context.uid || !a.exists || !task.studentIds?.includes(context.uid) || !profile || profile.isBanned || !allowed('assignments') || !allowed(task.module) || task.status !== 'assigned') throw lmsPermanent('Нет доступа к заданию.');
    if (task.module !== evidence.module) throw lmsPermanent('Сначала откройте назначенное задание.');
    if (task.module === 'hotkeys') {
      const log = Array.isArray(old.attemptLog) ? old.attemptLog : [],
        ids = Array.isArray(old.acceptedAttemptIds) ? old.acceptedAttemptIds : [],
        target = Math.max(1, Number(task.target) || 1),
        finished = old.status === 'completed' && old.receiptVersion === 2;
      // Повторная отправка той же попытки: ничего не меняем, возвращаем прежний итог.
      const prev = log.find(x => x?.id === evidence.id);
      if (prev) return {
        done: finished,
        accepted: !!prev.accepted,
        reasons: prev.reasons || [],
        stats: prev,
        need: prev.need,
        count: ids.length,
        target,
        recorded: true,
        duplicate: true
      };
      if (ids.includes(evidence.id)) return {
        done: finished,
        accepted: true,
        reasons: [],
        stats: null,
        count: ids.length,
        target,
        recorded: true,
        duplicate: true
      };
      if (finished) return {
        done: true,
        accepted: null,
        alreadyCompleted: true,
        reasons: [],
        count: ids.length,
        target,
        recorded: false
      };
      if (old.status !== 'started') throw lmsPermanent('Сначала откройте назначенное задание.');
      const v = lmsEvaluateHotkeySeries(task, evidence);
      if (v.invalid) return {
        done: false,
        accepted: false,
        reasons: ['invalid'],
        stats: null,
        count: ids.length,
        target,
        recorded: false
      };
      const need = task.hotkeyBank || 'any',
        entry = {
          id: evidence.id,
          at: Date.now(),
          accepted: v.accepted,
          reasons: v.reasons,
          need,
          bank: String(evidence.bank || '').slice(0, 20),
          ...v.stats
        },
        hs = old.hotkeyStats || {},
        add = k => (Number(hs[k]) || 0) + (v.stats[k] || 0),
        hotkeyStats = {
          series: (Number(hs.series) || 0) + 1,
          accepted: (Number(hs.accepted) || 0) + (v.accepted ? 1 : 0),
          rejected: (Number(hs.rejected) || 0) + (v.accepted ? 0 : 1),
          total: add('total'),
          solved: add('solved'),
          errors: add('errors'),
          corrected: add('corrected'),
          hints: add('hints'),
          skipped: add('skipped'),
          unsolved: add('unsolved')
        },
        acceptedAttemptIds = v.accepted ? [...ids, evidence.id] : ids,
        count = acceptedAttemptIds.length,
        done = v.accepted && count >= target;
      tx.set(pr, {
        ...old,
        status: done ? 'completed' : 'started',
        receiptVersion: 2,
        acceptedAttemptIds,
        result: {
          count
        },
        hotkeyStats,
        lastAttempt: entry,
        attemptLog: [...log, entry].slice(-30),
        updatedAt: ts(),
        ...(done ? {
          completedAt: ts(),
          needsHelp: false
        } : {})
      });
      return {
        done,
        accepted: v.accepted,
        reasons: v.reasons,
        stats: v.stats,
        need,
        count,
        target,
        recorded: true,
        duplicate: false
      };
    }
    if (old.status === 'completed' && old.receiptVersion === 2) return {
      done: true
    };
    if (old.status !== 'started') throw lmsPermanent('Сначала откройте назначенное задание.');
    let accepted = false;
    if (task.module === 'word') {
      const snapshot = typeof evidence.snapshot === 'string' && evidence.snapshot.length < 800000 ? JSON.parse(evidence.snapshot) : null;
      const checks = window.lmsWordCheck?.(snapshot, task.wordLesson);
      accepted = evidence.verified === true && evidence.assisted === false && snapshot?.lesson === task.wordLesson && Array.isArray(checks) && checks.length === 4 && checks.every(Boolean);
    }
    if (task.module === 'excel') accepted = evidence.verified === true && evidence.correct === true && evidence.assisted === false;
    if (!accepted) return {
      done: false,
      accepted: false
    };
    const ids = Array.isArray(old.acceptedAttemptIds) ? old.acceptedAttemptIds : [];
    if (ids.includes(evidence.id)) return {
      done: old.status === 'completed',
      accepted: true
    };
    const acceptedAttemptIds = [...ids, evidence.id],
      count = acceptedAttemptIds.length,
      done = count >= Number(task.target || 1);
    tx.set(pr, {
      ...old,
      status: done ? 'completed' : 'started',
      receiptVersion: 2,
      acceptedAttemptIds,
      result: {
        count
      },
      updatedAt: ts(),
      ...(done ? {
        completedAt: ts(),
        needsHelp: false
      } : {})
    });
    return {
      done,
      accepted: true
    };
  });
}
// Единая точка входа для упражнений (Hotkeys, Word, Excel).
window.lmsSubmitAssignmentResult = async function (context, evidence) {
  try {
    const receipt = await lmsSubmitCore(context, evidence);
    lmsPendingRemove(evidence?.id);
    return receipt;
  } catch (e) {
    if (lmsIsTransient(e)) lmsPendingAdd(context, evidence);else lmsPendingRemove(evidence?.id);
    throw e;
  }
};
// Повторная отправка серий, не сохранённых из-за сбоя сети (без повторного прохождения).
let lmsFlushing = false;
window.lmsRetryPendingAssignmentResults = async function (assignmentId) {
  const uid = window.auth?.currentUser?.uid;
  lmsPendingWrite(lmsPendingRead());
  if (!uid || lmsFlushing) return [];
  const mine = lmsPendingRead().filter(x => x.context.uid === uid && (!assignmentId || x.context.id === assignmentId)),
    out = [];
  lmsFlushing = true;
  try {
    for (const item of mine) {
      try {
        const rc = await lmsSubmitCore(item.context, item.evidence);
        lmsPendingRemove(item.evidence.id);
        out.push(rc);
        window.dispatchEvent(new CustomEvent('lms-assignment-feedback', {
          detail: {
            id: item.context.id,
            message: 'Отправлена серия, не сохранённая ранее. ' + lmsDescribeHotkeyReceipt(rc, 'ru')
          }
        }));
      } catch (e) {
        if (!lmsIsTransient(e)) lmsPendingRemove(item.evidence.id);
      }
    }
  } finally {
    lmsFlushing = false;
  }
  return out;
};
function LmsAssignedTyping({
  task,
  uid,
  onClose
}) {
  const [index, setIndex] = React.useState(0),
    [errors, setErrors] = React.useState(0),
    [wrong, setWrong] = React.useState(false),
    [status, setStatus] = React.useState(''),
    [busy, setBusy] = React.useState(false),
    [finished, setFinished] = React.useState(false),
    [passed, setPassed] = React.useState(false);
  const capture = React.useRef(null),
    container = React.useRef(null),
    data = React.useRef({
      index: 0,
      errors: 0,
      start: 0,
      final: null
    }),
    lock = React.useRef(false),
    composing = React.useRef(false);
  React.useEffect(() => {
    const c = container.current,
      x = c?.querySelector('.current');
    if (c && x) {
      const a = c.getBoundingClientRect(),
        b = x.getBoundingClientRect();
      if (b.bottom > a.bottom) c.scrollTop += b.bottom - a.bottom + 20;
    }
  }, [index]);
  function accept(value) {
    if (data.current.final || busy || window.auth?.currentUser?.uid !== uid) return;
    const d = data.current;
    if (!d.start) d.start = performance.now();
    for (const c of value.normalize('NFC')) {
      if (c !== task.text[d.index]) {
        d.errors++;
        setWrong(true);
        break;
      }
      d.index++;
      setWrong(false);
      if (d.index === task.text.length) {
        d.final = {
          text: task.text,
          lang: task.lang,
          characters: d.index,
          errors: d.errors,
          ms: Math.max(1000, performance.now() - d.start),
          attemptId: window.crypto?.randomUUID?.() || String(Date.now()) + Math.random()
        };
        setFinished(true);
        void save();
        break;
      }
    }
    setIndex(d.index);
    setErrors(d.errors);
  }
  async function save() {
    if (lock.current || !data.current.final) return;
    lock.current = true;
    setBusy(true);
    setStatus('Сохраняем результат…');
    try {
      const live = await lmsAssignmentWrite(task.id, uid, 'finish', data.current.final);
      const ok = Math.round(data.current.index / (data.current.index + data.current.errors) * 100) >= live.minAccuracy;
      setPassed(ok);
      setStatus(ok ? 'Задание выполнено. Преподаватель увидит результат.' : 'Результат сохранён. Нужно повысить точность — попробуй ещё раз.');
    } catch (e) {
      setStatus('Не удалось сохранить: ' + e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function restart() {
    data.current = {
      index: 0,
      errors: 0,
      start: 0,
      final: null
    };
    setIndex(0);
    setErrors(0);
    setFinished(false);
    setWrong(false);
    setStatus('');
    setPassed(false);
    requestAnimationFrame(() => capture.current?.focus({
      preventScroll: true
    }));
  }
  return /*#__PURE__*/React.createElement("section", {
    className: "la-box la-run"
  }, /*#__PURE__*/React.createElement("style", null, LMS_ASSIGN_CSS), /*#__PURE__*/React.createElement("header", {
    className: "la-run-head"
  }, React.createElement("span", {className:"la-practice-icon", "aria-hidden":true}, "⌨"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "ПРАКТИКА · ПЕЧАТЬ"), /*#__PURE__*/React.createElement("h3", null, task.title)), React.createElement("span", {className:"la-run-goal"}, "Цель · ", task.minAccuracy, "% точности")), /*#__PURE__*/React.createElement("div", {
    className: "la-run-metrics"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ваша точность"), /*#__PURE__*/React.createElement("strong", null, index + errors ? Math.round(index / (index + errors) * 100) : 100, /*#__PURE__*/React.createElement("i", null, "%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ошибки"), /*#__PURE__*/React.createElement("strong", null, errors)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Прогресс"), /*#__PURE__*/React.createElement("strong", null, Math.round(index / task.text.length * 100), /*#__PURE__*/React.createElement("i", null, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "la-run-paper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "la-run-text-head"
  }, /*#__PURE__*/React.createElement("span", null, task.lang === 'en' ? 'EN · Английский' : 'RU · Русский'), /*#__PURE__*/React.createElement("span", null, index, " / ", task.text.length, " символов")), /*#__PURE__*/React.createElement("div", {
    className: "la-text",
    ref: container,
    onClick: () => capture.current?.focus({
      preventScroll: true
    })
  }, task.text.split('').map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: i < index ? 'done' : i === index ? wrong ? 'current wrong' : 'current' : ''
  }, c))), /*#__PURE__*/React.createElement("div", {
    className: "la-run-progress",
    role: "progressbar",
    "aria-label": "Прогресс печати",
    "aria-valuemin": 0,
    "aria-valuemax": task.text.length,
    "aria-valuenow": index
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: index / task.text.length * 100 + '%'
    }
  }))), !finished && /*#__PURE__*/React.createElement("label", {
    className: "la-run-capture" + (wrong ? ' has-error' : '')
  }, "Поле для печати", /*#__PURE__*/React.createElement("span", null, wrong ? 'Нужен символ: ' + (task.text[index] === ' ' ? 'пробел' : task.text[index]) : index ? 'Продолжайте в своём темпе' : 'Нажмите на поле и начните набирать текст выше'), /*#__PURE__*/React.createElement("input", {
    ref: capture,
    className: "la-input",
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    placeholder: "Печатайте здесь…",
    "aria-invalid": wrong,
    "aria-label": "Ввод назначенного текста",
    onPaste: e => e.preventDefault(),
    onDrop: e => e.preventDefault(),
    onCompositionStart: () => composing.current = true,
    onCompositionEnd: e => {
      composing.current = false;
      accept(e.currentTarget.value);
      e.currentTarget.value = '';
    },
    onChange: e => {
      if (composing.current || e.nativeEvent.isComposing) return;
      const t = e.nativeEvent.inputType;
      if (!['insertFromPaste', 'insertFromDrop', 'insertReplacementText'].includes(t)) accept(e.target.value);
      e.target.value = '';
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "la-run-note"
  }, "Ошибка оставляет курсор на месте. Для зачёта наберите весь текст с нужной точностью."), status && /*#__PURE__*/React.createElement("div", {
    className: "la-run-status" + (passed ? ' passed' : ''),
    role: "status"
  }, status), finished && /*#__PURE__*/React.createElement("div", {
    className: "la-actions"
  }, status.startsWith('Не удалось') && /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: save
  }, "Повторить сохранение"), !passed && /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: restart
  }, "Повторить текст")));
}
const LMS_ASSIGN_CSS = ".la-box,.la-drawer,.la-launcher{--la-bg:#171d2d;--la-paper:#20273a;--la-line:#a994d62c;--la-text:#edf0fa;--la-muted:#a3acc3;--la-accent:#b49aea;--la-ink:#20162f;font-family:inherit;color-scheme:dark}.la-box{background:var(--la-bg);color:var(--la-text);border:1px solid var(--la-line);border-radius:20px;padding:23px;margin:0 0 20px;min-width:0}.la-box *{box-sizing:border-box}.la-box h3,.la-box h4,.la-box p{margin:0}.la-box header{display:flex;align-items:center;gap:12px;margin-bottom:18px}.la-box header>div{flex:1;min-width:0}.la-box h3{font-size:22px;margin-top:4px}.la-box h4{font-size:15px;overflow-wrap:anywhere;line-height:1.5}.la-box p{font-size:12px;line-height:1.7;color:var(--la-muted);margin:9px 0}.la-box small{font-size:10px;color:var(--la-muted);line-height:1.6}.la-box button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;height:auto;margin:0;padding:10px 13px;border:1px solid var(--la-line);border-radius:11px;background:var(--la-paper);color:var(--la-text);font-family:inherit;font-size:12px;line-height:1.4;font-weight:600;cursor:pointer;box-shadow:none;text-transform:none;transition:background .18s,transform .18s}.la-box button:hover:not(:disabled){border-color:var(--la-accent)}.la-box button:active:not(:disabled){transform:scale(.97)}.la-box button:disabled{opacity:.45;cursor:default}.la-box .la-primary{background:var(--la-accent);color:var(--la-ink);border-color:transparent}.la-box :focus-visible,.la-launcher:focus-visible{outline:2px solid var(--la-accent);outline-offset:3px}.la-cards{display:grid;grid-template-columns:1fr;gap:12px}.la-cards article{background:var(--la-paper);border:1px solid var(--la-line);border-radius:15px;padding:17px;animation:la-card-in .2s ease-out}.la-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:10px;color:var(--la-muted)}.la-state{padding:4px 7px;background:#a68bd614;color:var(--la-accent);border-radius:7px;font-size:9px;white-space:nowrap}.la-state.done{color:#55b699;background:#55b69915}.la-state.help,.la-state.late{color:#e4aa73;background:#e4aa7312}.la-actions{display:flex;gap:8px;margin-top:15px;flex-wrap:wrap}.la-actions button{flex:1}.la-instruction{border-left:2px solid var(--la-line);padding-left:10px;white-space:pre-wrap;overflow-wrap:anywhere}.la-card-result{font-size:11px;color:var(--la-accent);padding-top:10px;margin-top:10px;border-top:1px solid var(--la-line)}.la-error{color:#e889a2!important;font-size:11px!important;overflow-wrap:anywhere}.la-metrics{display:flex;gap:12px;flex-wrap:wrap;padding:13px;background:var(--la-paper);border-radius:12px;font-size:12px}.la-text{max-height:250px;overflow:auto;font:23px/1.8 ui-monospace,monospace;margin:18px 0;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin}.la-text .done{color:var(--la-accent)}.la-text .current{background:var(--la-accent);color:var(--la-ink);border-radius:3px}.la-text .wrong{background:#ee9bb5}.la-input{display:block;width:100%;border:1px solid var(--la-line);background:var(--la-paper);color:inherit;font-family:inherit;font-size:16px;padding:13px;border-radius:11px;margin-top:8px}.la-box label{font-size:12px}\n.la-launcher{position:fixed!important;right:0!important;left:auto!important;top:42%;z-index:1100;display:grid;place-items:center;width:44px;height:50px;min-height:50px;margin:0!important;padding:0;border:1px solid var(--la-line);border-right:0;border-radius:15px 0 0 15px!important;background:var(--la-bg);color:var(--la-accent);cursor:pointer;box-shadow:-4px 5px 20px #0001;transition:width .2s,background .2s;transform:none}.la-launcher:hover{width:50px;background:var(--la-paper)}.la-launcher:active{width:46px}.la-launcher svg{display:block;flex-shrink:0}\n.la-drawer{padding:0;border:1px solid var(--la-line);border-right:0;border-radius:22px 0 0 22px;width:min(430px,calc(100vw - 12px));max-width:none;height:100dvh;max-height:100dvh;margin:0 0 0 auto;inset:0;overflow:hidden;background:var(--la-bg);color:var(--la-text);box-shadow:-20px 0 70px #0003}.la-drawer::backdrop{background:#080c1955;backdrop-filter:blur(4px)}.la-drawer[open]{animation:la-slide .26s cubic-bezier(.2,.8,.2,1)}.la-drawer.la-closing{animation:la-slide-out .19s ease-in forwards}.la-drawer .la-box{height:100%;display:flex;flex-direction:column;border:0;border-radius:0;margin:0;padding:0;background:var(--la-bg)}.la-drawer header{margin:0;padding:24px 21px 20px;border-bottom:1px solid var(--la-line);flex-shrink:0}.la-drawer header small{font-size:9px;letter-spacing:1.2px}.la-header-icon{width:37px;height:37px;display:grid;place-items:center;border-radius:12px;color:var(--la-accent);background:#a68bd614;font-size:19px}.la-drawer .la-close{display:grid;place-items:center;width:33px;height:33px;min-height:33px;padding:0;font-size:22px;border-radius:10px;flex-shrink:0}.la-drawer-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 21px;flex-shrink:0;font-size:11px;color:var(--la-muted)}.la-drawer-toolbar select{font-family:inherit;font-size:11px;border:1px solid var(--la-line);border-radius:9px;background:var(--la-paper);color:var(--la-text);padding:8px;max-width:180px}.la-drawer-toolbar option{background:var(--la-bg);color:var(--la-text)}.la-drawer-scroll{overflow:auto;min-height:0;flex:1;padding:18px 21px;scrollbar-width:thin;scrollbar-color:var(--la-line) transparent;overscroll-behavior:contain}.la-drawer-footer{padding:14px 21px;border-top:1px solid var(--la-line);color:var(--la-muted);font-size:10px;line-height:1.6;flex-shrink:0}.la-empty{display:flex;align-items:center;gap:14px;padding:20px 15px;border:1px dashed var(--la-line);border-radius:14px}.la-empty>span{display:grid;place-items:center;width:38px;height:38px;flex-shrink:0;border-radius:12px;background:#a68bd610;color:var(--la-accent)}.la-empty h4{font-size:13px}.la-empty p{font-size:11px;margin:5px 0 0}.la-sr{position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden}\n:is(html.light,body.light,.theme-light,[data-theme=light]) :is(.la-box,.la-drawer,.la-launcher){--la-bg:#faf9ff;--la-paper:#f0ecf7;--la-line:#7054932c;--la-text:#293047;--la-muted:#6b7288;--la-accent:#7954c0;--la-ink:#fff;color-scheme:light}@keyframes la-slide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}@keyframes la-slide-out{to{opacity:0;transform:translateX(30px)}}@keyframes la-card-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@media(max-width:520px){.la-box{padding:17px}.la-box h3{font-size:19px}.la-text{font-size:20px}.la-drawer header{padding:20px 16px 17px}.la-drawer-scroll{padding:16px}.la-drawer-toolbar{padding:14px 16px}.la-drawer-footer{padding:13px 16px}.la-launcher{width:39px;height:46px;min-height:46px}.la-cards article{padding:15px}}@media(prefers-reduced-motion:reduce){.la-drawer[open],.la-drawer.la-closing,.la-cards article{animation:none}.la-launcher,.la-box button{transition:none}}\n/* Same edge-tab proportions as folded LMS AI assistant */\n.la-launcher{width:32px!important;height:60px!important;min-width:0!important;min-height:60px!important;border-radius:16px 0 0 16px!important;box-shadow:0 4px 16px #0002;border-color:var(--la-line);background:var(--la-bg);transition:background .2s,box-shadow .2s!important}.la-launcher:hover{width:32px!important;background:var(--la-paper);box-shadow:-3px 4px 20px #a68bd62a}.la-launcher:active{width:32px!important}.la-launcher svg{width:19px;height:19px}.la-launcher:focus-visible{outline-offset:-3px}\n@media(prefers-reduced-motion:reduce){.la-launcher{transition:none!important}}\n.la-box button,.la-drawer button{height:auto!important;max-height:none!important;min-height:42px;line-height:1.5;white-space:normal}.la-box .la-close{width:36px;min-height:36px;height:36px!important;flex-shrink:0}.la-drawer{width:min(420px,100vw)!important;max-width:100vw!important;overflow:clip}.la-box{width:100%;min-width:0}.la-cards article{height:auto;min-width:0}.la-drawer-toolbar{gap:10px;flex-wrap:wrap}.la-drawer-toolbar label{min-width:0;flex:1}.la-drawer-toolbar select{width:100%;height:42px;min-width:0;background:var(--la-paper);color:var(--la-text);border:1px solid var(--la-line);border-radius:10px;padding:8px}.la-help-form,.la-help-history{margin-top:12px;padding:12px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-paper);font-size:12px}.la-help-form label{display:grid;gap:6px}.la-help-form textarea{width:100%;min-height:85px;resize:vertical;height:auto;border:1px solid var(--la-line);background:var(--la-bg);color:var(--la-text);border-radius:10px;padding:10px;font:inherit}.la-help-history p{white-space:pre-wrap;overflow-wrap:anywhere}.la-notice{color:var(--la-accent);line-height:1.6}.la-box [hidden]{display:none!important}.la-active{width:100%;max-width:800px;margin:0 auto 16px;padding:16px;border:1px solid var(--la-line,#a994d62c);border-radius:14px;background:var(--input-bg,#20273a);color:var(--text-main,#edf0fa);font:13px/1.6 inherit}.la-active h4{margin:0 0 5px}.la-active p{margin:5px 0}.la-active button{height:auto;min-height:40px;padding:8px 12px;border-radius:9px;background:#a68bd620;color:inherit;border:1px solid #a994d62c}.la-active small{display:block}.la-active strong{color:var(--text-main,inherit)}\n@media(max-width:480px){.la-drawer{border-radius:0!important}.la-actions{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}.la-actions button{width:100%}.la-card-top{flex-wrap:wrap}.la-box>header{padding:16px;gap:10px}.la-box>header h3{font-size:19px}}\n.assignment-ai{margin-top:14px;border:1px solid var(--ax-line,var(--la-line));border-radius:12px;overflow:hidden;font-size:12px;background:var(--ax-input,var(--la-paper));color:var(--ax-text,var(--la-text))}.assignment-ai summary{cursor:pointer;padding:13px;color:var(--ax-accent,var(--la-accent));font-weight:600;min-height:44px}.assignment-ai>div{padding:0 13px 13px}.assignment-ai label{display:grid;gap:6px}.assignment-ai textarea{width:100%;min-height:80px;height:auto;max-height:200px;resize:vertical;border:1px solid var(--ax-line,var(--la-line));border-radius:10px;padding:10px;background:var(--ax-bg,var(--la-bg));color:inherit;font:inherit;margin:7px 0}.assignment-ai button{height:auto!important;min-height:40px;border:1px solid var(--ax-line,var(--la-line));border-radius:9px;background:var(--ax-paper,var(--la-paper));color:inherit;font:inherit;padding:10px;line-height:1.4}.assignment-ai button:disabled{opacity:.5}.assignment-ai-actions{display:flex;gap:8px;flex-wrap:wrap}.assignment-ai .assignment-ai-answer{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;margin:12px 0}.assignment-ai small{display:block;margin-top:8px;font-size:10px;color:var(--ax-muted,var(--la-muted))}\n/* Compose form: field and actions have independent layout boxes. */\n.la-box .la-help-form{padding:14px;background:var(--la-paper);border-radius:15px;display:flex;flex-direction:column;gap:12px;min-width:0}.la-help-form>label{display:flex!important;flex-direction:column;gap:9px;margin:0!important;min-width:0;font-size:12px;font-weight:600}.la-box .la-help-form textarea{box-sizing:border-box!important;display:block;width:100%!important;max-width:100%!important;height:112px!important;min-height:90px;max-height:230px;padding:12px!important;margin:0!important;border-radius:12px;resize:vertical;font-size:14px;line-height:1.6;outline:none}.la-box .la-help-form textarea:focus{border-color:var(--la-accent);box-shadow:0 0 0 3px #a68bd61c;outline:none}.la-help-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--la-line);padding-top:12px}.la-help-footer small{font-size:10px;white-space:nowrap}.la-box .la-help-footer button{margin:0!important;min-height:40px;padding:9px 13px;border-radius:10px;font-size:12px;background:var(--la-accent);color:var(--la-ink);border:0;line-height:1.4}.la-box .la-help-footer button:disabled{opacity:.45}.la-help-history{line-height:1.6}\n/* Assigned typing workspace */\n.la-box.la-run{width:100%;max-width:1040px;margin:0 auto 24px;padding:24px;border-radius:24px;background:radial-gradient(ellipse at top left,#a68bd60c,transparent 65%),var(--la-bg);box-shadow:0 20px 60px #0000000d}.la-run .la-run-head{padding:0;margin:0 0 22px;align-items:flex-start;gap:18px}.la-run-head small{font-size:9px;letter-spacing:1.2px;color:var(--la-accent)}.la-run .la-run-head h3{font-size:24px;letter-spacing:-.6px;line-height:1.35;overflow-wrap:anywhere;margin:7px 0 0}.la-run-head button{flex-shrink:0;min-height:40px;padding:9px 13px;background:var(--la-paper);font-size:12px;border-radius:11px}.la-run-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px}.la-run-metrics>div{min-width:0;border:1px solid var(--la-line);border-radius:14px;padding:13px 15px;background:var(--la-paper)}.la-run-metrics small{font-size:10px;color:var(--la-muted)}.la-run-metrics strong{display:block;margin-top:5px;font-size:26px;line-height:1.2;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.5px}.la-run-metrics>div:nth-child(2) strong{color:var(--la-accent)}.la-run-metrics i{font-size:14px;font-style:normal;margin-left:3px;color:var(--la-muted)}.la-run-paper{border:1px solid var(--la-line);border-radius:16px;padding:18px 20px;background:var(--la-paper);overflow:hidden}.la-run-text-head{display:flex;justify-content:space-between;gap:12px;color:var(--la-muted);font-size:10px;line-height:1.5;margin-bottom:12px}.la-run .la-text{font:21px/1.85 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--la-muted);letter-spacing:0;min-height:100px;max-height:260px;margin:0;padding:2px 1px;white-space:pre-wrap;overflow-wrap:anywhere;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--la-line) transparent}.la-run .la-text .done{color:var(--la-text)}.la-run .la-text .current{color:var(--la-ink);background:var(--la-accent);border-radius:3px;box-shadow:0 0 0 2px #a68bd622}.la-run .la-text .wrong{background:#c65070;color:#fff}.la-run-progress{height:4px;background:var(--la-line);margin-top:16px;border-radius:4px;overflow:hidden}.la-run-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--la-accent),#69bfa8);transition:width .15s ease}.la-run .la-run-capture{display:grid;gap:7px;margin-top:20px;font-size:12px;font-weight:600}.la-run-capture>span{font-size:11px;color:var(--la-muted);font-weight:400}.la-run .la-run-capture input{margin:4px 0 0!important;padding:13px 15px!important;height:50px!important;min-height:50px;width:100%;max-width:100%;border-radius:12px;background:var(--la-paper);border:1px solid var(--la-line);font-size:16px;box-shadow:none;outline:none;transition:border-color .2s,box-shadow .2s}.la-run .la-run-capture input:focus{border-color:var(--la-accent);box-shadow:0 0 0 3px #a68bd61c}.la-run-capture.has-error>span{color:#df7891}.la-run .la-run-capture input[aria-invalid=true]{border-color:#df7891}.la-run .la-run-note{font-size:10px;line-height:1.7;margin:12px 0 0;color:var(--la-muted)}.la-run-status{padding:14px;margin-top:16px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-paper);font-size:12px;line-height:1.6}.la-run-status.passed{border-color:#52b79055;background:#52b79010}.la-run .la-actions{margin-top:12px}.la-run{animation:la-slide .25s ease both}\n@media(max-width:600px){.la-box.la-run{padding:16px;border-radius:18px}.la-run .la-run-head{gap:12px;margin-bottom:16px;flex-wrap:wrap}.la-run .la-run-head>div{flex-basis:100%}.la-run .la-run-head h3{font-size:20px}.la-run-head button{margin-left:auto!important}.la-run-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}.la-run-metrics>div{padding:11px 13px}.la-run-metrics strong{font-size:24px}.la-run-paper{padding:13px}.la-run .la-text{font-size:18px;line-height:1.8;max-height:235px}.la-run-text-head{font-size:9px;flex-wrap:wrap;gap:5px}.la-run .la-run-capture{margin-top:16px}.la-box .la-help-form{padding:12px}.la-help-footer{gap:8px}.la-box .la-help-footer button{font-size:11px;padding:9px 11px}}\n@media(prefers-reduced-motion:reduce){.la-run{animation:none}.la-run-progress i,.la-run .la-run-capture input{transition:none}}\n/* Page in the main menu, plus compact assignment context. */\n.la-box{box-sizing:border-box}\n.la-page{max-width:1100px;margin:0 auto 24px;padding:26px;animation:la-card-in .25s ease both}.la-page-head{align-items:center!important}.la-page-icon,.la-active-emblem{display:grid;place-items:center;width:44px;height:44px;flex-shrink:0;border:1px solid var(--la-line);border-radius:14px;background:#a68bd61a;color:var(--la-accent);font-size:22px}.la-page-head p{font-size:11px;margin:6px 0 0}.la-page-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:20px 0;padding:14px 0;border-block:1px solid var(--la-line);color:var(--la-muted);font-size:12px}.la-page-toolbar select{font:inherit;height:40px;max-width:100%;padding:8px 12px;border:1px solid var(--la-line);border-radius:11px;background:var(--la-paper);color:var(--la-text)}.la-page-cards{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.la-page-cards article{min-width:0}.la-page-head button{flex-shrink:0}.la-box.la-active{max-width:1100px;padding:20px 22px;margin:0 auto 20px;background:linear-gradient(110deg,#a68bd608,transparent),var(--la-bg);border-radius:20px;font-family:inherit;font-size:13px;line-height:1.6;animation:la-card-in .25s ease}.la-active-top{display:flex;align-items:center;gap:12px}.la-active-title{flex:1;min-width:0}.la-active-title small{font-size:9px;letter-spacing:1px;color:var(--la-accent)}.la-active-title h4{font-size:17px;margin-top:4px;line-height:1.4}.la-active-top button{flex-shrink:0;font-size:11px}.la-active-bottom{display:grid;grid-template-columns:minmax(0,1fr) 200px;align-items:center;gap:24px;margin-top:16px;padding-top:14px;border-top:1px solid var(--la-line)}.la-box .la-active-bottom p{font-size:11px;line-height:1.7;margin:0;max-width:660px}.la-active-meter>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:10px;color:var(--la-muted)}.la-active-meter strong{font-size:15px;color:var(--la-text)}.la-active-meter .la-run-progress{margin-top:7px;height:5px}.la-active-details{margin-top:16px;border:1px solid var(--la-line);border-radius:12px;overflow:hidden;background:var(--la-paper)}.la-active-details summary{display:flex;justify-content:space-between;gap:10px;padding:11px 14px;font-size:11px;font-weight:600;cursor:pointer;color:var(--la-accent);list-style:none}.la-active-details summary::-webkit-details-marker{display:none}.la-active-details summary span{transition:transform .2s}.la-active-details[open] summary span{transform:rotate(180deg)}.la-box .la-active-details p{font-size:12px;line-height:1.8;margin:0;padding:0 14px 14px;white-space:pre-wrap;overflow-wrap:anywhere;animation:la-card-in .2s ease}.la-box .la-active-notice{padding:10px 12px;border-radius:10px;background:var(--la-paper);font-size:11px;margin:12px 0 0}\n@media(max-width:700px){.la-page-cards{grid-template-columns:minmax(0,1fr)}.la-page{padding:16px}.la-page .la-page-head{padding:0;flex-wrap:wrap}.la-page-head>div{flex-basis:calc(100% - 65px)!important}.la-page-head button{margin-left:auto}.la-page-toolbar{flex-wrap:wrap;font-size:11px}.la-box.la-active{padding:16px}.la-active-top{flex-wrap:wrap;gap:10px}.la-active-title{flex-basis:calc(100% - 60px)}.la-active-top button{margin-left:auto}.la-active-bottom{grid-template-columns:minmax(0,1fr);gap:14px}.la-active-title h4{font-size:16px}}\n@media(prefers-reduced-motion:reduce){.la-page,.la-box.la-active,.la-active-details p{animation:none}.la-active-details summary span{transition:none}}\n.la-run .la-run-capture input:focus{border-color:var(--la-accent)!important}.la-run .la-run-capture input[aria-invalid=true]{border-color:#df7891!important}\n/* Assignment workspace v8: quiet rows, compact controls, no upper exercise panel. */\n.la-box.la-page{max-width:1100px;background:transparent;border:0;box-shadow:none;padding:18px 0 36px;border-radius:0}.la-page .la-page-head{padding:0 4px!important;margin:0 0 26px!important;gap:14px}.la-page .la-page-head h3{font-size:30px;letter-spacing:-1px}.la-page .la-page-head p{font-size:12px}.la-page .la-page-icon{display:none}.la-page-head small{color:var(--la-accent);letter-spacing:1.8px;font-size:9px}.la-page-head button{border-radius:50px!important;background:var(--la-paper);min-height:38px!important;font-size:11px;padding:9px 16px!important}.la-page .la-page-toolbar{border:0;margin:0 0 18px;padding:0 4px;font-size:11px}.la-page-toolbar select{height:40px;border-radius:12px;font-size:12px;cursor:pointer}.la-page .la-page-cards{display:flex;flex-direction:column;gap:12px}.la-page .la-task-row{width:100%;padding:0;border-radius:20px;background:linear-gradient(115deg,#b898ee08,transparent 50%),var(--la-bg);border:1px solid var(--la-line);box-shadow:0 5px 25px #00000008;overflow:hidden;transition:border-color .2s}.la-task-row:hover{border-color:#a994d662}.la-row-main{display:grid;grid-template-columns:46px minmax(0,1fr) auto 140px;align-items:center;gap:18px;padding:22px 24px 17px}.la-row-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:15px;color:#b49aea;background:#b49aea12;border:1px solid #b49aea25;font:500 21px ui-monospace,monospace}.la-task-row[data-module=excel] .la-row-icon{color:#46b99c;background:#46b99c12;border-color:#46b99c30}.la-task-row[data-module=typing] .la-row-icon{color:#6aa9dc;background:#6aa9dc12;border-color:#6aa9dc30}.la-row-copy{min-width:0}.la-row-copy>small{font-size:10px;color:var(--la-muted)}.la-page .la-row-copy h4{font-size:16px;font-weight:650;line-height:1.5;margin:4px 0 7px;letter-spacing:-.2px}.la-row-meta{display:flex;flex-wrap:wrap;gap:6px 16px;color:var(--la-muted);font-size:10px;line-height:1.6}.la-row-meta>span+span{opacity:.8}.la-page .la-state{font-size:10px;padding:6px 9px;border-radius:8px;font-weight:500}.la-box .la-row-start{flex:none;width:140px;min-height:40px!important;height:40px!important;padding:8px 14px;border-radius:12px;background:linear-gradient(125deg,#9974df,#7857c2);color:white;font-size:12px;font-weight:600;border:0}.la-row-start span{margin-left:auto}.la-row-finished{justify-self:end;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#46b99c12;color:#46b99c;margin-right:4px}.la-row-details>summary{display:flex;align-items:center;gap:8px;cursor:pointer;padding:0 24px 16px 88px;color:var(--la-muted);font-size:10px;list-style:none}.la-row-details>summary::-webkit-details-marker{display:none}.la-row-details>summary:hover{color:var(--la-accent)}.la-row-details>summary svg{transition:transform .2s}.la-row-details[open]>summary svg{transform:rotate(180deg)}.la-row-details>summary em{font-size:9px;font-style:normal;color:var(--la-accent);margin-left:12px}.la-row-expanded{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:28px;padding:22px 24px;border-top:1px solid var(--la-line);background:var(--la-paper);animation:la-card-in .2s ease}.la-row-expanded>div{min-width:0}.la-row-expanded small{font-size:9px;letter-spacing:.5px}.la-row-expanded p{font-size:12px;line-height:1.8}.la-row-help{border-left:1px solid var(--la-line);padding-left:24px}.la-row-help>small{display:block;margin-bottom:12px}.la-box .la-help-toggle{font-size:11px;min-height:36px;background:var(--la-bg)}.la-row-expanded .assignment-ai{background:var(--la-bg);border-radius:12px}.la-row-expanded .assignment-ai summary{font-size:11px}.la-row-expanded .la-help-form{background:var(--la-bg)}.la-row-expanded .la-help-form textarea{background:var(--la-paper);font-size:14px}.la-row-expanded .la-help-history{background:var(--la-bg);margin-top:12px}.la-task-row>.la-error{padding:0 24px 12px}\n.la-box.la-dock{position:fixed;z-index:1400;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;align-items:center;gap:16px;width:min(620px,calc(100vw - 24px));max-width:620px;margin:0;padding:12px 14px 12px 20px;border:1px solid var(--la-line);border-radius:20px;background:var(--la-bg);box-shadow:0 12px 45px #0003;animation:la-card-in .25s ease}.la-dock-name{min-width:0;flex:1}.la-dock-name small{display:block;font-size:8px;letter-spacing:1px;color:var(--la-accent)}.la-dock-name strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;margin-top:3px;line-height:1.5}.la-dock-count{font-size:21px;font-weight:650;white-space:nowrap;color:var(--la-text)}.la-dock-count i{font-style:normal;font-size:12px;font-weight:400;color:var(--la-muted);margin-left:3px}.la-dock button{height:38px!important;min-height:38px!important;font-size:11px;border-radius:12px;padding:8px 12px}.la-dock .la-dock-back{width:38px;padding:0;flex-shrink:0;background:var(--la-accent);color:var(--la-ink);border:0}.la-dock-dot{height:5px;width:5px;background:var(--la-accent);border-radius:50%}.la-box.la-task-dialog{position:fixed;box-sizing:border-box;inset:0;margin:auto;padding:0;width:min(560px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(100dvh - 32px);border-radius:22px;background:var(--la-bg);box-shadow:0 30px 100px #0004}.la-task-dialog[open]{display:flex;flex-direction:column;animation:la-card-in .2s ease}.la-task-dialog::backdrop{background:#0b102b80;backdrop-filter:blur(6px)}.la-task-dialog>header{padding:22px;margin:0;border-bottom:1px solid var(--la-line);flex-shrink:0}.la-task-dialog header h3{font-size:20px;line-height:1.4;overflow-wrap:anywhere}.la-task-dialog header button{width:34px;height:34px!important;min-height:34px;padding:0;flex-shrink:0;font-size:20px}.la-dialog-scroll{padding:22px;overflow:auto;min-height:0;overscroll-behavior:contain;scrollbar-width:thin}.la-condition+.la-condition{margin-top:18px;border-top:1px solid var(--la-line);padding-top:18px}.la-condition small{color:var(--la-accent);font-size:10px}.la-condition p{font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.la-dialog-result{display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding:14px;border-radius:12px;background:var(--la-paper);font-size:11px}.la-dialog-result strong{font-size:20px}.la-task-dialog>footer{display:flex;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid var(--la-line);flex-shrink:0}.la-task-dialog footer button{font-size:11px}.la-task-dialog .assignment-ai textarea{box-sizing:border-box}\n@media(max-width:680px){.la-box.la-page{padding:8px 2px 24px}.la-page .la-page-head{margin-bottom:20px!important;gap:10px}.la-page .la-page-head h3{font-size:26px}.la-page-head>div{flex-basis:60%!important}.la-page .la-page-head p{display:none}.la-page .la-page-toolbar{font-size:10px}.la-page-toolbar select{font-size:11px;max-width:170px}.la-row-main{grid-template-columns:38px minmax(0,1fr) auto;gap:11px;padding:17px 16px 12px}.la-row-icon{width:38px;height:38px;border-radius:12px;font-size:18px}.la-row-copy{grid-column:2/-1}.la-page .la-row-copy h4{font-size:14px}.la-row-meta{font-size:9px;gap:4px 12px}.la-page .la-state{grid-column:2;grid-row:2;justify-self:start;font-size:9px}.la-row-start,.la-row-finished{grid-column:3;grid-row:2}.la-box .la-row-start{width:auto;min-width:110px;height:36px!important;min-height:36px!important;font-size:10px;padding:8px 11px}.la-row-details>summary{padding:0 16px 14px 65px;font-size:10px}.la-row-expanded{grid-template-columns:minmax(0,1fr);padding:17px;gap:18px}.la-row-help{padding:18px 0 0;border-left:0;border-top:1px solid var(--la-line)}.la-box.la-dock{padding:10px 11px;gap:9px;border-radius:16px}.la-dock-name strong{font-size:11px}.la-dock-name small{font-size:7px}.la-dock-count{font-size:18px}.la-dock button{font-size:10px;padding:8px 10px}.la-dock .la-dock-back{width:34px}.la-task-dialog>header{padding:18px}.la-dialog-scroll{padding:18px}.la-task-dialog>footer{padding:14px;gap:8px}.la-task-dialog footer button{flex:1;padding:10px 8px}}\n@media(prefers-reduced-motion:reduce){.la-box.la-dock,.la-task-dialog[open],.la-row-expanded{animation:none}.la-row-details>summary svg,.la-task-row{transition:none}}\n@keyframes la-dock-appear{from{opacity:0}to{opacity:1}}.la-box.la-dock{animation:la-dock-appear .25s ease}@media(prefers-reduced-motion:reduce){.la-box.la-dock{animation:none}}\n" + "/* Framed assignment section; isolated from the rest of the platform. */\n.la-box.la-page{position:relative;isolation:isolate;box-sizing:border-box;overflow:hidden;max-width:1120px;margin:0 auto 28px;padding:30px;border:1px solid var(--la-line);border-radius:28px;background:var(--la-bg);box-shadow:0 22px 70px #060c1c24,inset 0 1px 0 #ffffff0b;animation:tasks-section-enter .45s ease both}\n.la-box.la-page::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,var(--la-line) 1px,transparent 1px),linear-gradient(var(--la-line) 1px,transparent 1px),radial-gradient(ellipse at 90% 0%,#aa82ed22,transparent 60%);background-size:52px 52px,52px 52px,100% 100%;opacity:.32;mask-image:linear-gradient(#000,transparent 360px);-webkit-mask-image:linear-gradient(#000,transparent 360px)}\n.la-box.la-page::after{content:'';position:absolute;z-index:0;top:0;left:0;width:32%;height:2px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--la-accent),transparent);animation:tasks-border-light 9s ease-in-out infinite;opacity:.65}\n.la-page>header,.la-page>.la-page-toolbar,.la-page>.la-cards,.la-page>.la-empty,.la-page>p{position:relative;z-index:1}\n.la-page .la-page-head{padding:0 0 24px!important;margin:0 0 20px!important;border-bottom:1px solid var(--la-line)}\n.la-page .la-page-icon{display:grid;width:46px;height:46px;place-items:center;border-radius:15px;border:1px solid var(--la-line);background:var(--la-paper);color:var(--la-accent);font-size:23px;box-shadow:0 6px 20px #0000000a;animation:tasks-mark-glow 5s ease-in-out infinite}\n.la-page .la-page-head h3{font-size:28px}.la-page .la-page-head p{line-height:1.7}.la-page .la-page-toolbar{padding:0;margin-bottom:18px}\n.la-page .la-task-row{background:var(--la-paper);border-color:var(--la-line);box-shadow:0 4px 15px #00000008;transition:border-color .2s,box-shadow .2s;animation:tasks-row-enter .35s ease both}\n.la-page .la-task-row:nth-child(2){animation-delay:.04s}.la-page .la-task-row:nth-child(3){animation-delay:.08s}.la-page .la-task-row:nth-child(4){animation-delay:.12s}\n.la-page .la-task-row:hover{border-color:var(--la-accent);box-shadow:0 7px 22px #00000013}.la-page .la-row-expanded{background:var(--la-bg)}\n.la-page .la-row-icon{transition:transform .2s}.la-page .la-task-row:hover .la-row-icon{transform:translateY(-2px)}\n.la-page .la-row-start{box-shadow:0 5px 14px #8a62c825;transition:filter .2s,transform .15s,box-shadow .2s}.la-page .la-row-start:hover:not(:disabled){filter:brightness(1.09);box-shadow:0 7px 20px #8a62c838}.la-page .la-row-start:active:not(:disabled){transform:scale(.97)}\n.la-page .la-page-toolbar select{transition:border-color .2s,box-shadow .2s}.la-page .la-page-toolbar select:focus{outline:0;border-color:var(--la-accent);box-shadow:0 0 0 3px #aa82ed18}\n@keyframes tasks-section-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}\n@keyframes tasks-row-enter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}\n@keyframes tasks-border-light{0%,100%{transform:translateX(5%);opacity:.25}50%{transform:translateX(205%);opacity:.9}}\n@keyframes tasks-mark-glow{0%,100%{box-shadow:0 0 0 0 #aa82ed00}50%{box-shadow:0 0 20px #aa82ed18}}\n@media(max-width:680px){.la-box.la-page{padding:18px 14px;border-radius:22px;margin-bottom:20px}.la-page .la-page-head{padding:0 0 17px!important;margin-bottom:15px!important;gap:11px}.la-page .la-page-icon{width:38px;height:38px;border-radius:12px;font-size:20px}.la-page .la-page-head>div{flex-basis:calc(100% - 54px)!important}.la-page .la-page-head h3{font-size:24px;letter-spacing:-.8px}.la-page .la-page-head button{margin-left:auto;min-height:34px!important;padding:7px 12px!important;font-size:10px}.la-page .la-page-toolbar{gap:10px;flex-wrap:wrap}.la-page .la-page-toolbar select{max-width:158px;font-size:10px}.la-page .la-row-main{padding:15px 13px 12px;gap:9px;grid-template-columns:32px minmax(0,1fr) auto}.la-page .la-row-icon{width:32px;height:36px;font-size:17px;border-radius:10px}.la-page .la-row-copy h4{font-size:13px}.la-page .la-row-start{min-width:100px;font-size:10px;padding:8px 10px}.la-page .la-row-details>summary{padding-left:54px;padding-right:13px}.la-page .la-row-expanded{padding:14px}.la-page .la-row-meta{font-size:9px;gap:3px 8px}}\n@media(prefers-reduced-motion:reduce){.la-box.la-page,.la-box.la-page::after,.la-page .la-task-row,.la-page .la-page-icon{animation:none!important}.la-page .la-task-row,.la-page .la-row-icon,.la-page .la-row-start{transition:none}.la-page .la-task-row:hover .la-row-icon{transform:none}}\n" + "\n/* Assignment practice — compact framed workspace, October 2026. */\n.la-box.la-run{position:relative;isolation:isolate;overflow:hidden;box-sizing:border-box;width:100%;max-width:1040px;margin:0 auto 24px;padding:28px;border-radius:28px;background:var(--la-bg);box-shadow:0 20px 65px #080d201a;animation:tasks-section-enter .45s ease both}\n.la-box.la-run::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,var(--la-line) 1px,transparent 1px),linear-gradient(var(--la-line) 1px,transparent 1px),radial-gradient(ellipse at 100% 0%,#b08aef20,transparent 65%);background-size:44px 44px,44px 44px,100% 100%;mask-image:linear-gradient(#000,transparent 250px);opacity:.45}\n.la-box.la-run::after{content:'';position:absolute;top:0;left:0;width:32%;height:2px;background:linear-gradient(90deg,transparent,var(--la-accent),transparent);pointer-events:none;animation:tasks-border-light 8s ease-in-out infinite}\n.la-run .la-run-head{display:flex;align-items:center;gap:13px;margin:0;padding-bottom:22px;border-bottom:1px solid var(--la-line);flex-wrap:nowrap}\n.la-run .la-practice-icon{display:grid;place-items:center;width:46px;height:46px;flex-shrink:0;background:var(--la-paper);border:1px solid var(--la-line);border-radius:15px;color:var(--la-accent);font-size:24px}\n.la-run .la-run-head small{font-size:9px;letter-spacing:1.6px;color:var(--la-accent)}\n.la-run .la-run-head h3{font-size:23px;line-height:1.35;letter-spacing:-.6px;overflow-wrap:anywhere;margin:4px 0 0}\n.la-run .la-run-goal{flex-shrink:0;padding:8px 12px;border:1px solid var(--la-line);border-radius:30px;background:var(--la-paper);color:var(--la-accent);font-size:11px;line-height:1.5}\n.la-run .la-run-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin:22px 0;padding:0;background:none;border:0}\n.la-run .la-run-metrics>div{display:flex;flex-direction:column;align-items:center;gap:5px;padding:0 12px;border:0;border-right:1px solid var(--la-line);border-radius:0;background:none;box-shadow:none;min-width:0}\n.la-run .la-run-metrics>div:last-child{border:0}.la-run .la-run-metrics small{font-size:11px}.la-run .la-run-metrics strong{font-size:29px;line-height:1.2;font-weight:600;letter-spacing:-1px;font-variant-numeric:tabular-nums;color:var(--la-text)}.la-run .la-run-metrics i{font-size:16px;margin-left:3px;font-style:normal;color:var(--la-muted)}\n.la-run .la-run-paper{position:relative;background:var(--la-paper);border:1px solid var(--la-line);border-radius:19px 19px 0 0;padding:20px 22px 0;overflow:hidden;box-shadow:none}\n.la-run .la-run-text-head{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding-bottom:14px;border-bottom:1px solid var(--la-line);font-size:10px;letter-spacing:.3px;color:var(--la-muted)}\n.la-run .la-text{margin:18px 0;max-height:245px;min-height:90px;padding:0 3px;font:21px/1.85 ui-monospace,Consolas,monospace;color:var(--la-muted);scrollbar-width:thin;scrollbar-color:var(--la-line) transparent;overscroll-behavior:contain;overflow-wrap:anywhere}\n.la-run .la-text .current{padding:2px 0;border-radius:4px;box-shadow:0 0 0 3px #aa82ed12;animation:la-caret-glow 1.8s ease-in-out infinite}.la-run .la-text .current.wrong{background:#f3a3b7;color:#511629;animation:none}.la-run .la-text .done{color:var(--la-accent)}\n.la-run .la-run-progress{height:3px;margin:0 -22px;background:var(--la-line);overflow:hidden;border-radius:0}.la-run .la-run-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--la-accent),#75c8bc);transition:width .2s ease}\n.la-run .la-run-capture{display:block;margin:0;padding:18px 22px 20px;border:1px solid var(--la-line);border-top:0;border-radius:0 0 19px 19px;background:var(--la-paper);font-size:12px;font-weight:600;color:var(--la-text);transition:box-shadow .2s}\n.la-run .la-run-capture>span{display:block;margin:5px 0 12px;color:var(--la-muted);font-size:11px;font-weight:400;line-height:1.5}\n.la-run .la-run-capture .la-input{width:100%;min-width:0;height:50px!important;min-height:50px!important;max-height:none;margin:0!important;padding:12px 15px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-bg);color:var(--la-text);box-shadow:none;font:16px/1.5 inherit;transition:border-color .2s,box-shadow .2s}\n.la-run .la-run-capture .la-input:focus{border-color:var(--la-accent)!important;box-shadow:0 0 0 3px #aa82ed18;outline:none}.la-run .la-input::placeholder{color:var(--la-muted);opacity:.8}.la-run .la-run-capture.has-error>span{color:#d36687}.la-run .la-run-capture.has-error .la-input{border-color:#d36687!important}\n.la-run .la-run-note{font-size:10px;line-height:1.7;margin:15px 2px 0;padding-left:12px;border-left:2px solid var(--la-line)}\n.la-run .la-run-status{margin-top:16px;animation:tasks-row-enter .25s ease}.la-run .la-actions{margin-top:15px}\n.la-box.la-page::before{opacity:.5;background-size:44px 44px,44px 44px,100% 100%;mask-image:linear-gradient(#000,transparent 480px);-webkit-mask-image:linear-gradient(#000,transparent 480px)}\n.la-page .la-page-head{position:relative}.la-page .la-page-head::after{content:'';position:absolute;left:0;bottom:-1px;width:90px;height:1px;background:linear-gradient(90deg,var(--la-accent),transparent);pointer-events:none}\n@keyframes la-caret-glow{50%{box-shadow:0 0 0 3px #aa82ed22}}\n@media(max-width:600px){.la-box.la-run{padding:18px 14px;border-radius:22px}.la-run .la-run-head{display:grid;grid-template-columns:39px minmax(0,1fr);gap:11px;padding-bottom:17px}.la-run .la-practice-icon{width:39px;height:39px;border-radius:12px;font-size:21px}.la-run .la-run-head>div{flex:1;min-width:0}.la-run .la-run-head h3{font-size:19px}.la-run .la-run-head small{font-size:8px;letter-spacing:1.1px}.la-run .la-run-goal{grid-column:2;justify-self:start;margin-left:0;font-size:10px;padding:6px 10px}.la-run .la-run-metrics{margin:19px 0}.la-run .la-run-metrics>div{padding:0 6px}.la-run .la-run-metrics small{font-size:9px}.la-run .la-run-metrics strong{font-size:25px}.la-run .la-run-paper{padding:16px 14px 0}.la-run .la-text{font-size:18px;line-height:1.8;max-height:230px;margin:15px 0}.la-run .la-run-text-head{font-size:9px;padding-bottom:12px}.la-run .la-run-progress{margin:0 -14px}.la-run .la-run-capture{padding:16px 14px}.la-run .la-run-capture>span{font-size:10px}.la-run .la-run-note{font-size:9px}}\n@media(prefers-reduced-motion:reduce){.la-box.la-run,.la-box.la-run::after,.la-run .la-text .current,.la-run .la-run-status{animation:none!important}.la-run .la-run-progress i,.la-run .la-run-capture,.la-run .la-run-capture .la-input{transition:none!important}}\n";
const LMS_ASSIGN_DRAWER_CSS = "";
function AssignmentActive({
  task,
  uid,
  onClose
}) {
  const [progress, setProgress] = React.useState(null),
    [notice, setNotice] = React.useState(''),
    [open, setOpen] = React.useState(false);
  const modal = React.useRef(null),
    trigger = React.useRef(null);
  React.useEffect(() => window.db.collection('lmsAssignments').doc(task.id).collection('progress').doc(uid).onSnapshot(s => setProgress(s.data()), e => setNotice(e.message)), [task.id, uid]);
  // The open assignment is registered here so that a trainer can attach a series to it
  // only while the assignment is really open (no stale global context).
  React.useEffect(() => {
    const key = task.id + ':' + uid;
    lmsActiveAssignments.set(key, {
      id: task.id,
      uid,
      module: task.module,
      bank: task.hotkeyBank || 'any',
      title: task.title,
      target: task.target || 1
    });
    return () => {
      lmsActiveAssignments.delete(key);
    };
  }, [task.id, task.module, task.hotkeyBank, task.title, task.target, uid]);
  // Series whose saving failed on a network error are sent again without replaying the exercise.
  React.useEffect(() => {
    const run = () => {
      window.lmsRetryPendingAssignmentResults?.(task.id).catch(() => {});
    };
    run();
    window.addEventListener('online', run);
    return () => window.removeEventListener('online', run);
  }, [task.id, uid]);
  React.useEffect(() => {
    const f = e => {
      if (e.detail?.id === task.id) setNotice(e.detail.message);
    };
    window.addEventListener('lms-assignment-feedback', f);
    return () => window.removeEventListener('lms-assignment-feedback', f);
  }, [task.id]);
  React.useEffect(() => {
    if (open) {
      modal.current?.showModal();
      const release = window.lmsAcquireScrollLock?.();
      return () => {
        modal.current?.close();
        release?.();
      };
    }
  }, [open]);
  const done = progress?.status === 'completed' && progress?.receiptVersion === 2,
    count = progress?.result?.count || 0,
    total = task.target || 1;
  const condition = task.module === 'word' ? 'Оформите назначенный документ. Зачёт даётся за четыре выполненных условия в панели «Практика» Word Lab. ИИ объясняет действия, но не применяет готовые ответы.' : task.module === 'hotkeys' ? `Серия — это минимум 5 разных сочетаний категории «${LMS_HOTKEY_BANKS[task.hotkeyBank || 'any'] || task.hotkeyBank}». Каждое сочетание нужно найти самостоятельно: подсказка или пропуск не дают зачёта серии. Если вы ошиблись и сами нашли верный вариант, ошибка сохранится в статистике, но серию не отменит. Цель задания — ${total} ${lmsPlural(total, 'серия', 'серии', 'серий')}; счётчик показывает засчитанные серии, а не нажатия.` : 'Самостоятельно решайте задачи внутри Excel Lab. Ответ после просмотра готового решения не засчитывается.';
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({
      preventScroll: true
    }));
  }
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, LMS_ASSIGN_CSS), /*#__PURE__*/React.createElement("aside", {
    className: "la-box la-dock",
    "aria-label": "Текущее задание"
  }, /*#__PURE__*/React.createElement("div", {
    className: "la-dock-name"
  }, /*#__PURE__*/React.createElement("small", null, done ? 'ВЫПОЛНЕНО' : 'ЗАДАНИЕ', " · ", LMS_TASK_MODULES[task.module]), /*#__PURE__*/React.createElement("strong", {
    title: task.title
  }, task.title)), /*#__PURE__*/React.createElement("span", {
    className: "la-dock-count",
    "aria-label": task.module === 'hotkeys' ? `Засчитано серий: ${count} из ${total}` : `Выполнено ${count} из ${total}`,
    title: task.module === 'hotkeys' ? 'Засчитанные серии' : undefined
  }, count, /*#__PURE__*/React.createElement("i", null, "/", total)), /*#__PURE__*/React.createElement("button", {
    ref: trigger,
    onClick: () => setOpen(true),
    "aria-haspopup": "dialog"
  }, "Условия", notice && /*#__PURE__*/React.createElement("i", {
    className: "la-dock-dot"
  })), /*#__PURE__*/React.createElement("button", {
    className: "la-dock-back",
    onClick: onClose,
    title: "Вернуться к списку заданий",
    "aria-label": "К заданиям"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m10 6-6 6 6 6M4 12h16"
  })))), open && /*#__PURE__*/React.createElement("dialog", {
    ref: modal,
    className: "la-box la-task-dialog",
    "aria-labelledby": "la-task-title",
    onCancel: e => {
      e.preventDefault();
      close();
    }
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "УСЛОВИЯ ЗАДАНИЯ"), /*#__PURE__*/React.createElement("h3", {
    id: "la-task-title"
  }, task.title)), /*#__PURE__*/React.createElement("button", {
    onClick: close,
    "aria-label": "Закрыть условия"
  }, "×")), /*#__PURE__*/React.createElement("div", {
    className: "la-dialog-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "la-condition"
  }, /*#__PURE__*/React.createElement("small", null, "Как получить зачёт"), /*#__PURE__*/React.createElement("p", null, condition)), task.text && /*#__PURE__*/React.createElement("div", {
    className: "la-condition"
  }, /*#__PURE__*/React.createElement("small", null, "От преподавателя"), /*#__PURE__*/React.createElement("p", null, task.text)), /*#__PURE__*/React.createElement("div", {
    className: "la-dialog-result"
  }, /*#__PURE__*/React.createElement("span", null, done ? 'Задание выполнено' : task.module === 'hotkeys' ? 'Засчитано серий' : 'Выполнено упражнений'), /*#__PURE__*/React.createElement("strong", null, count, " / ", total)), task.module === 'hotkeys' && lmsHotkeyStatsBlock(progress, task), notice && /*#__PURE__*/React.createElement("p", {
    role: "status",
    className: "la-notice"
  }, notice), /*#__PURE__*/React.createElement(AssignmentAI, {
    task: task
  })), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
    onClick: onClose
  }, "К заданиям"), /*#__PURE__*/React.createElement("button", {
    className: "la-primary",
    onClick: close
  }, "Продолжить практику")))), document.body);
}

  Object.assign(window, { LmsMyAssignments, LmsAssignedTyping, AssignmentActive });
})();
