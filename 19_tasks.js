// 19_tasks.js — задания учеников, интерфейс, ИИ и сохранение результатов.
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
    canOpen = modules.includes(task.module) && !!LMS_TASK_MODULES[task.module],
    tracker = task.module !== 'typing' ? /*#__PURE__*/React.createElement(LmsSegments, {
      count: Math.max(0, Math.floor(Number(p?.result?.count) || 0)) * (legacy ? 0 : 1),
      total: Math.max(1, Math.floor(Number(task.target) || 1)),
      done: done
    }) : null;
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
  }) || '—')), tracker), /*#__PURE__*/React.createElement("b", {
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
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m5 12.5 4.5 4.5L19 7.5"
  })))), /*#__PURE__*/React.createElement("details", {
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
  }, /*#__PURE__*/React.createElement("small", null, "УСЛОВИЯ ВЫПОЛНЕНИЯ"), /*#__PURE__*/React.createElement("p", null, task.module === 'typing' ? `Наберите весь текст с точностью не ниже ${task.minAccuracy}%.` : task.module === 'word' ? 'Выполните все четыре условия оформления назначенного документа в Word Lab и нажмите «Проверить оформление».' : task.module === 'excel' ? `Самостоятельно решите ${task.target || 1} задач в тренажёре. Просмотр решения не засчитывается.` : lmsHotkeyRule(task)), task.module !== 'typing' && task.text && /*#__PURE__*/React.createElement("p", {
    className: "la-instruction"
  }, task.text), legacy && /*#__PURE__*/React.createElement("p", {
    className: "la-notice"
  }, "Нужно пройти задание заново: прежний результат не подтверждён по новым условиям."), p?.result && !legacy && /*#__PURE__*/React.createElement("div", {
    className: "la-card-result"
  }, task.module === 'typing' ? `${p.result.accuracy}% точности · ${p.result.wpm} WPM` : task.module === 'hotkeys' ? /*#__PURE__*/React.createElement(LmsHotkeyResult, {
    p: p,
    target: task.target || 1
  }) : `Выполнено: ${p.result.count || 0} / ${task.target || 1}`), !done && /*#__PURE__*/React.createElement(AssignmentAI, {
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
// ───────────────────────────────────────────────────────────────────────────
// Горячие клавиши: зачёт серий и статистика ответов.
// Статистика (ответы, ошибки, подсказки, пропуски) пишется при КАЖДОЙ завершённой
// серии, зачёт серии — отдельное решение. Счётчик задания = число засчитанных серий.
//
// ВАЖНО: это клиентская проверка. Транзакция сверяет аккаунт, доступ, актуальность
// задания и защищается от повторной отправки, но не может доказать, что клиент не
// подделан: записи ответов присылает браузер ученика. Настоящая защита от подделки
// возможна только на сервере (Cloud Function или строгие правила Firestore).
// ───────────────────────────────────────────────────────────────────────────
const LMS_HK = {
  MIN: 5,
  MAX_RECORDS: 60,
  MAX_ERRORS_PER_ITEM: 20,
  LOG_LIMIT: 30
};
const LMS_HK_STATUSES = ['solved', 'failed', 'skipped', 'pending'];
const LMS_HK_BANKS = {
  word: 'Word',
  windows: 'Windows',
  excel: 'Excel'
};
function lmsPlural(n, one, few, many) {
  const a = Math.abs(Math.floor(Number(n) || 0)) % 100,
    b = a % 10;
  return a > 10 && a < 20 ? many : b > 1 && b < 5 ? few : b === 1 ? one : many;
}
function lmsErr(message, code, retryable) {
  const e = Error(message);
  e.code = code;
  e.retryable = !!retryable;
  return e;
}
// Сетевые сбои можно повторить без повторного прохождения серии, остальное — нет.
function lmsClassifyError(e) {
  const err = e instanceof Error ? e : Error(String(e || 'Ошибка сохранения'));
  if (typeof err.retryable === 'boolean') return err;
  const code = String(err.code || '');
  const net = ['unavailable', 'deadline-exceeded', 'aborted', 'cancelled', 'resource-exhausted', 'internal', 'unknown'].includes(code) || /network|offline|timeout|failed to fetch/i.test(err.message || '');
  err.retryable = net;
  if (net) err.userMessage = 'Нет соединения с базой данных. Серия не потеряна — нажмите «Повторить сохранение».';else if (code === 'permission-denied') err.userMessage = 'База данных отклонила запись: недостаточно прав. Сообщите преподавателю.';
  return err;
}
function lmsHotkeyRecords(evidence) {
  const r = evidence && evidence.records;
  if (!Array.isArray(r) || !r.length || r.length > LMS_HK.MAX_RECORDS) return null;
  const out = [];
  for (const x of r) {
    if (!x || !LMS_HK_STATUSES.includes(x.status)) return null;
    const errors = Number(x.errors);
    if (!Number.isInteger(errors) || errors < 0 || errors > LMS_HK.MAX_ERRORS_PER_ITEM) return null;
    out.push({
      status: x.status,
      errors,
      hint: x.hint === true,
      program: typeof x.program === 'string' ? x.program.slice(0, 24) : '',
      id: typeof x.taskId === 'string' ? x.taskId.slice(0, 64) : ''
    });
  }
  return out;
}
// Чистая функция: решает, засчитана ли серия, и считает статистику.
function lmsHotkeyEvaluate(task, evidence, rec) {
  const st = {
    total: rec.length,
    solved: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    hints: 0,
    errors: 0,
    corrected: 0
  };
  for (const x of rec) {
    st[x.status]++;
    if (x.hint) st.hints++;
    st.errors += x.errors;
    if (x.status === 'solved' && x.errors > 0 && !x.hint) st.corrected++;
  }
  const bank = LMS_HK_BANKS[task.hotkeyBank] ? task.hotkeyBank : null,
    reasons = [],
    ids = rec.map(x => x.id);
  if (Number(evidence.total) !== rec.length || ids.every(Boolean) && new Set(ids).size !== ids.length) reasons.push('invalid');
  if (!rec.every(x => bank ? x.program === bank : !!LMS_HK_BANKS[x.program] || x.program === 'legacy')) reasons.push('category');
  if (rec.length < LMS_HK.MIN) reasons.push('too_short');
  if (st.skipped === rec.length) reasons.push('all_skipped');else if (st.skipped) reasons.push('skipped');
  if (st.hints) reasons.push('hint');
  if (st.failed || st.pending) reasons.push('unsolved');
  return {
    accepted: !reasons.length,
    reasons,
    stats: st,
    bank
  };
}
function lmsHotkeyReasonText(code, st, bank) {
  st = st || {};
  switch (code) {
    case 'invalid':
      return 'результат серии не прошёл проверку';
    case 'category':
      return bank ? 'другая категория, в задании нужна ' + LMS_HK_BANKS[bank] : 'категория не подходит для задания';
    case 'too_short':
      return `в серии ${st.total || 0} ${lmsPlural(st.total, 'сочетание', 'сочетания', 'сочетаний')}, нужно минимум ${LMS_HK.MIN}`;
    case 'all_skipped':
      return 'вся серия пропущена';
    case 'skipped':
      return `пропущено ${st.skipped || 0} ${lmsPlural(st.skipped, 'сочетание', 'сочетания', 'сочетаний')}`;
    case 'hint':
      return 'использована подсказка';
    case 'unsolved':
      return 'не все сочетания найдены самостоятельно';
    default:
      return 'условия не выполнены';
  }
}
function lmsHotkeyMessage(ev, count, target, done) {
  const st = ev.stats;
  if (ev.accepted) {
    const fixed = st.errors ? `, ${st.errors} ${lmsPlural(st.errors, 'ошибка', 'ошибки', 'ошибок')} ${lmsPlural(st.errors, 'исправлена', 'исправлены', 'исправлено')}` : ' без ошибок';
    return `Серия засчитана: ${st.total} ${lmsPlural(st.total, 'сочетание', 'сочетания', 'сочетаний')}${fixed}. ` + (done ? 'Задание выполнено.' : `Засчитано серий: ${count} из ${target}.`);
  }
  return 'Серия не засчитана: ' + ev.reasons.map(c => lmsHotkeyReasonText(c, st, ev.bank)).join('; ') + '. Статистика ответов сохранена.';
}
function lmsHotkeyTotals(old, st, accepted) {
  const t = old && typeof old === 'object' ? old : {},
    n = k => Math.max(0, Math.floor(Number(t[k]) || 0));
  return {
    attempts: n('attempts') + 1,
    accepted: n('accepted') + (accepted ? 1 : 0),
    answers: n('answers') + st.total,
    solved: n('solved') + st.solved,
    errors: n('errors') + st.errors,
    corrected: n('corrected') + st.corrected,
    hints: n('hints') + st.hints,
    skipped: n('skipped') + st.skipped,
    failed: n('failed') + st.failed + st.pending
  };
}
function lmsSubmitTx(context, evidence, minimal) {
  const db = window.db,
    ref = db.collection('lmsAssignments').doc(context.id),
    pr = ref.collection('progress').doc(context.uid);
  return db.runTransaction(async tx => {
    const [a, p, u] = await Promise.all([tx.get(ref), tx.get(pr), tx.get(db.collection('users').doc(context.uid))]);
    const task = a.exists ? a.data() : null,
      old = p.data() || {},
      profile = u.data(),
      allowed = id => profile?.allowedModules == null || Array.isArray(profile.allowedModules) && profile.allowedModules.includes(id);
    if (window.auth?.currentUser?.uid !== context.uid) throw lmsErr('Аккаунт изменился. Откройте задание заново.', 'lms/account', false);
    if (!task || task.status !== 'assigned') throw lmsErr('Задание удалено или снято преподавателем.', 'lms/stale', false);
    if (!task.studentIds?.includes(context.uid) || !profile || profile.isBanned || !allowed('assignments') || !allowed(task.module)) throw lmsErr('Нет доступа к заданию.', 'lms/access', false);
    if (old.status === 'completed' && old.receiptVersion === 2) return {
      done: true,
      alreadyDone: true,
      count: Math.max(0, Math.floor(Number(old.result?.count) || 0)),
      target: Math.max(1, Math.floor(Number(task.target) || 1))
    };
    if (old.status !== 'started' || task.module !== evidence.module || !evidence.id) throw lmsErr('Сначала откройте назначенное задание.', 'lms/not-started', false);
    const ts = window.firebase.firestore.FieldValue.serverTimestamp;
    if (task.module === 'hotkeys') {
      const rec = lmsHotkeyRecords(evidence);
      if (!rec) throw lmsErr('Результат серии повреждён. Пройдите серию заново.', 'lms/evidence', false);
      const attemptId = String(evidence.id).slice(0, 80),
        target = Math.max(1, Math.floor(Number(task.target) || 1)),
        ids = Array.isArray(old.acceptedAttemptIds) ? old.acceptedAttemptIds : [],
        log = Array.isArray(old.hotkeyLog) ? old.hotkeyLog : [],
        prior = log.find(e => e && e.id === attemptId);
      // Повторная отправка той же попытки: ничего не пишем и ничего не добавляем.
      if (ids.includes(attemptId) || prior) {
        const ok = ids.includes(attemptId) || prior?.ok === true;
        return {
          duplicate: true,
          accepted: ok,
          done: old.status === 'completed',
          count: ids.length,
          target,
          reasons: Array.isArray(prior?.reasons) ? prior.reasons : [],
          message: `Эта серия уже сохранена${ok ? ' и засчитана' : ', в зачёт она не пошла'}. Повторная отправка ничего не меняет.`,
          statsSaved: true
        };
      }
      const ev = lmsHotkeyEvaluate(task, evidence, rec),
        count = ids.length + (ev.accepted ? 1 : 0),
        done = ev.accepted && count >= target,
        totals = lmsHotkeyTotals(old.hotkeyStats, ev.stats, ev.accepted),
        next = {
          ...old,
          receiptVersion: 2,
          updatedAt: ts()
        };
      if (!minimal) {
        next.hotkeyStats = totals;
        next.hotkeyLog = [...log, {
          id: attemptId,
          at: Date.now(),
          ok: ev.accepted,
          reasons: ev.reasons,
          total: ev.stats.total,
          solved: ev.stats.solved,
          errors: ev.stats.errors,
          corrected: ev.stats.corrected,
          hints: ev.stats.hints,
          skipped: ev.stats.skipped,
          failed: ev.stats.failed + ev.stats.pending
        }].slice(-LMS_HK.LOG_LIMIT);
      }
      if (ev.accepted) {
        next.acceptedAttemptIds = [...ids, attemptId];
        next.result = {
          count
        };
        next.status = done ? 'completed' : 'started';
        if (done) {
          next.completedAt = ts();
          next.needsHelp = false;
        }
      }
      // В «минимальном» режиме (правила базы не приняли новые поля) пишем только зачёт.
      if (ev.accepted || !minimal) tx.set(pr, next);
      return {
        done,
        accepted: ev.accepted,
        duplicate: false,
        count,
        target,
        reasons: ev.reasons,
        stats: ev.stats,
        totals: minimal ? null : totals,
        bank: ev.bank,
        statsSaved: !minimal,
        message: lmsHotkeyMessage(ev, count, target, done)
      };
    }
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

// Вызывается только из пути завершения настоящего упражнения.
// Бросает ошибку только при сбое сохранения/доступа; «серия не засчитана» — обычный результат
// (accepted: false), статистика при этом всё равно записывается.
window.lmsSubmitAssignmentResult = async function (context, evidence) {
  if (!context?.id || context.uid !== window.auth?.currentUser?.uid) throw lmsErr('Аккаунт изменился. Откройте задание заново.', 'lms/account', false);
  if (!evidence) throw lmsErr('Нет данных результата. Откройте задание заново.', 'lms/evidence', false);
  try {
    return await lmsSubmitTx(context, evidence, false);
  } catch (e) {
    // Если правила Firestore не принимают новые поля статистики, зачёт всё равно сохраняем
    // в прежнем формате. Правила при этом не трогаем и не ослабляем.
    if (evidence.module === 'hotkeys' && e?.code === 'permission-denied') {
      try {
        const r = await lmsSubmitTx(context, evidence, true);
        r.statsSaved = false;
        return r;
      } catch (e2) {
        throw lmsClassifyError(e2);
      }
    }
    throw lmsClassifyError(e);
  }
};
window.lmsEvaluateHotkeySeries = function (task, evidence) {
  const rec = lmsHotkeyRecords(evidence);
  return rec ? lmsHotkeyEvaluate(task || {}, evidence, rec) : null;
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
// Дополнение v3: статистика серий, полоска прогресса, уведомления и анимации откликов.
// Движение здесь только отвечает на действие ученика: засчитанная серия, выполненное задание.
const LMS_ASSIGN_CSS_V3 = `
/* dock: счётчик серий, полоска, отклик на зачёт */
.la-box.la-dock{padding-bottom:16px;transition:border-color .4s,box-shadow .4s}
.la-box.la-dock.is-done{border-color:#55b69988;box-shadow:0 12px 45px #0003,0 0 0 1px #55b69933}
.la-dock-num{font-weight:inherit;display:inline-block;animation:la-num-pop .55s cubic-bezier(.2,.9,.25,1.4)}
.la-dock .la-dock-name small.la-dock-stats{font-size:10px;letter-spacing:0;color:var(--la-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.la-dock-track{position:absolute;left:20px;right:20px;bottom:6px;height:3px;border-radius:3px;background:var(--la-line);overflow:hidden;pointer-events:none}
.la-dock-track i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--la-accent),#69bfa8);transition:width .7s cubic-bezier(.2,.8,.2,1);position:relative}
.la-dock-track i::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,#ffffff66,transparent);transform:translateX(-100%);animation:la-sheen 2.8s ease-in-out infinite}
.la-dock-pulse{position:absolute;inset:-1px;border-radius:20px;pointer-events:none;animation:la-dock-pulse 1.05s ease-out forwards}
.la-burst{position:absolute;left:50%;top:0;width:0;height:0;pointer-events:none;z-index:3}
.la-burst i{position:absolute;left:0;top:0;width:6px;height:11px;margin:-5px 0 0 -3px;border-radius:2px;background:var(--c);opacity:0;animation:la-burst-fly 1.3s cubic-bezier(.15,.7,.3,1) var(--d) forwards}
/* всплывающее сообщение о результате серии */
.la-box.la-toast{position:fixed;z-index:1401;left:50%;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 82px);transform:translateX(-50%);display:flex;align-items:flex-start;gap:11px;width:max-content;max-width:min(560px,calc(100vw - 24px));margin:0;padding:12px 15px;border-radius:15px;background:var(--la-paper);border:1px solid var(--la-line);box-shadow:0 16px 44px #0004;font-size:12px;line-height:1.55;cursor:pointer;animation:la-toast-in .4s cubic-bezier(.2,.9,.25,1.12) both}
.la-toast-icon{flex-shrink:0;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;background:#a68bd620;color:var(--la-accent)}
.la-toast-ok{border-color:#55b69966}.la-toast-ok .la-toast-icon{background:#55b69922;color:#55b699}
.la-toast-warn{border-color:#e4aa7366}.la-toast-warn .la-toast-icon{background:#e4aa7322;color:#e4aa73}
.la-toast-error{border-color:#e889a266}.la-toast-error .la-toast-icon{background:#e889a222;color:#e889a2}
.la-box p.la-notice-ok{color:#55b699}.la-box p.la-notice-warn{color:#e4aa73}.la-box p.la-notice-error{color:#e889a2}
/* прогресс серий в списке заданий */
.la-seg-row{display:flex;align-items:center;gap:10px;margin-top:9px}
.la-seg{display:flex;gap:4px;min-width:0}
.la-seg i{display:block;width:22px;height:5px;border-radius:3px;background:var(--la-line);position:relative;overflow:hidden}
.la-seg i.on::before{content:'';position:absolute;inset:0;border-radius:3px;background:linear-gradient(90deg,var(--la-accent),#69bfa8);transform-origin:left;animation:la-seg-fill .5s cubic-bezier(.2,.8,.2,1) calc(var(--i) * 70ms) both}
.la-seg.is-done i.on::before{background:#46b99c}
.la-seg-bar{display:block;width:140px;height:5px;border-radius:3px;background:var(--la-line);overflow:hidden}
.la-seg-bar i{display:block;width:0;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--la-accent),#69bfa8);transition:width .6s ease}
.la-seg-label{font-size:10px;color:var(--la-muted);font-variant-numeric:tabular-nums}
.la-row-finished svg{display:block}
.la-row-finished svg path{stroke-dasharray:24;stroke-dashoffset:24;animation:la-check-draw .55s .15s ease-out forwards}
.la-page .la-row-start{position:relative;overflow:hidden}
.la-page .la-row-start::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,#ffffff2e 50%,transparent 65%);transform:translateX(-120%);pointer-events:none}
.la-page .la-row-start:hover:not(:disabled)::after{transform:translateX(120%);transition:transform .7s ease}
/* статистика ответов */
.la-hk-block{margin-top:20px}
.la-hk-block>small{color:var(--la-accent);font-size:10px}
.la-hk-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:10px 0 4px}
.la-hk-stat{min-width:0;padding:10px 8px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-bg);text-align:center;transition:border-color .25s}
.la-hk-stat strong{display:block;font-size:19px;line-height:1.25;font-weight:650;font-variant-numeric:tabular-nums}
.la-hk-stat small{display:block;font-size:9px;margin-top:2px;white-space:nowrap}
.la-hk-stat.warn{border-color:#e4aa7355}.la-hk-stat.warn strong{color:#e4aa73}
.la-card-result .la-hk-stats{margin-top:12px}
.la-card-result .la-hk-stat{background:var(--la-bg)}
.la-hk-empty{font-size:11px!important;margin:8px 0 0!important}
.la-hk-log{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px}
.la-hk-log li{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:10px;background:var(--la-bg);font-size:11px;line-height:1.5;color:var(--la-text)}
.la-hk-log li small{display:block;color:var(--la-muted);font-size:10px}
.la-hk-dot{flex-shrink:0;display:grid;place-items:center;width:18px;height:18px;border-radius:50%;font-size:10px;background:#e4aa7322;color:#e4aa73}
.la-hk-log li.ok .la-hk-dot{background:#55b69922;color:#55b699}
@keyframes la-num-pop{0%{transform:scale(.6);opacity:.2}60%{transform:scale(1.25);opacity:1}100%{transform:scale(1)}}
@keyframes la-sheen{0%,55%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes la-dock-pulse{0%{box-shadow:0 0 0 0 #55b69988;border:1px solid #55b699aa}100%{box-shadow:0 0 0 16px #55b69900;border:1px solid #55b69900}}
@keyframes la-burst-fly{0%{opacity:1;transform:translate(0,0) rotate(0) scale(.7)}55%{opacity:1;transform:translate(var(--x),var(--y)) rotate(var(--r)) scale(1)}100%{opacity:0;transform:translate(var(--x),calc(var(--y) + 56px)) rotate(calc(var(--r) * 2)) scale(.8)}}
@keyframes la-toast-in{from{opacity:0;transform:translate(-50%,14px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
@keyframes la-seg-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes la-check-draw{to{stroke-dashoffset:0}}
@media(max-width:680px){.la-hk-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.la-seg i{width:16px}.la-seg-bar{width:100px}.la-box.la-toast{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 74px)}.la-dock-track{left:14px;right:14px}}
@media(prefers-reduced-motion:reduce){.la-dock-num,.la-dock-pulse,.la-burst i,.la-box.la-toast,.la-seg i.on::before,.la-row-finished svg path,.la-dock-track i::after{animation:none!important}.la-row-finished svg path{stroke-dashoffset:0}.la-dock-track i,.la-seg-bar i,.la-hk-stat{transition:none}.la-page .la-row-start:hover:not(:disabled)::after{transition:none}}
`;
const LMS_ASSIGN_CSS = ".la-box,.la-drawer,.la-launcher{--la-bg:#171d2d;--la-paper:#20273a;--la-line:#a994d62c;--la-text:#edf0fa;--la-muted:#a3acc3;--la-accent:#b49aea;--la-ink:#20162f;font-family:inherit;color-scheme:dark}.la-box{background:var(--la-bg);color:var(--la-text);border:1px solid var(--la-line);border-radius:20px;padding:23px;margin:0 0 20px;min-width:0}.la-box *{box-sizing:border-box}.la-box h3,.la-box h4,.la-box p{margin:0}.la-box header{display:flex;align-items:center;gap:12px;margin-bottom:18px}.la-box header>div{flex:1;min-width:0}.la-box h3{font-size:22px;margin-top:4px}.la-box h4{font-size:15px;overflow-wrap:anywhere;line-height:1.5}.la-box p{font-size:12px;line-height:1.7;color:var(--la-muted);margin:9px 0}.la-box small{font-size:10px;color:var(--la-muted);line-height:1.6}.la-box button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;height:auto;margin:0;padding:10px 13px;border:1px solid var(--la-line);border-radius:11px;background:var(--la-paper);color:var(--la-text);font-family:inherit;font-size:12px;line-height:1.4;font-weight:600;cursor:pointer;box-shadow:none;text-transform:none;transition:background .18s,transform .18s}.la-box button:hover:not(:disabled){border-color:var(--la-accent)}.la-box button:active:not(:disabled){transform:scale(.97)}.la-box button:disabled{opacity:.45;cursor:default}.la-box .la-primary{background:var(--la-accent);color:var(--la-ink);border-color:transparent}.la-box :focus-visible,.la-launcher:focus-visible{outline:2px solid var(--la-accent);outline-offset:3px}.la-cards{display:grid;grid-template-columns:1fr;gap:12px}.la-cards article{background:var(--la-paper);border:1px solid var(--la-line);border-radius:15px;padding:17px;animation:la-card-in .2s ease-out}.la-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:10px;color:var(--la-muted)}.la-state{padding:4px 7px;background:#a68bd614;color:var(--la-accent);border-radius:7px;font-size:9px;white-space:nowrap}.la-state.done{color:#55b699;background:#55b69915}.la-state.help,.la-state.late{color:#e4aa73;background:#e4aa7312}.la-actions{display:flex;gap:8px;margin-top:15px;flex-wrap:wrap}.la-actions button{flex:1}.la-instruction{border-left:2px solid var(--la-line);padding-left:10px;white-space:pre-wrap;overflow-wrap:anywhere}.la-card-result{font-size:11px;color:var(--la-accent);padding-top:10px;margin-top:10px;border-top:1px solid var(--la-line)}.la-error{color:#e889a2!important;font-size:11px!important;overflow-wrap:anywhere}.la-metrics{display:flex;gap:12px;flex-wrap:wrap;padding:13px;background:var(--la-paper);border-radius:12px;font-size:12px}.la-text{max-height:250px;overflow:auto;font:23px/1.8 ui-monospace,monospace;margin:18px 0;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin}.la-text .done{color:var(--la-accent)}.la-text .current{background:var(--la-accent);color:var(--la-ink);border-radius:3px}.la-text .wrong{background:#ee9bb5}.la-input{display:block;width:100%;border:1px solid var(--la-line);background:var(--la-paper);color:inherit;font-family:inherit;font-size:16px;padding:13px;border-radius:11px;margin-top:8px}.la-box label{font-size:12px}\n.la-launcher{position:fixed!important;right:0!important;left:auto!important;top:42%;z-index:1100;display:grid;place-items:center;width:44px;height:50px;min-height:50px;margin:0!important;padding:0;border:1px solid var(--la-line);border-right:0;border-radius:15px 0 0 15px!important;background:var(--la-bg);color:var(--la-accent);cursor:pointer;box-shadow:-4px 5px 20px #0001;transition:width .2s,background .2s;transform:none}.la-launcher:hover{width:50px;background:var(--la-paper)}.la-launcher:active{width:46px}.la-launcher svg{display:block;flex-shrink:0}\n.la-drawer{padding:0;border:1px solid var(--la-line);border-right:0;border-radius:22px 0 0 22px;width:min(430px,calc(100vw - 12px));max-width:none;height:100dvh;max-height:100dvh;margin:0 0 0 auto;inset:0;overflow:hidden;background:var(--la-bg);color:var(--la-text);box-shadow:-20px 0 70px #0003}.la-drawer::backdrop{background:#080c1955;backdrop-filter:blur(4px)}.la-drawer[open]{animation:la-slide .26s cubic-bezier(.2,.8,.2,1)}.la-drawer.la-closing{animation:la-slide-out .19s ease-in forwards}.la-drawer .la-box{height:100%;display:flex;flex-direction:column;border:0;border-radius:0;margin:0;padding:0;background:var(--la-bg)}.la-drawer header{margin:0;padding:24px 21px 20px;border-bottom:1px solid var(--la-line);flex-shrink:0}.la-drawer header small{font-size:9px;letter-spacing:1.2px}.la-header-icon{width:37px;height:37px;display:grid;place-items:center;border-radius:12px;color:var(--la-accent);background:#a68bd614;font-size:19px}.la-drawer .la-close{display:grid;place-items:center;width:33px;height:33px;min-height:33px;padding:0;font-size:22px;border-radius:10px;flex-shrink:0}.la-drawer-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 21px;flex-shrink:0;font-size:11px;color:var(--la-muted)}.la-drawer-toolbar select{font-family:inherit;font-size:11px;border:1px solid var(--la-line);border-radius:9px;background:var(--la-paper);color:var(--la-text);padding:8px;max-width:180px}.la-drawer-toolbar option{background:var(--la-bg);color:var(--la-text)}.la-drawer-scroll{overflow:auto;min-height:0;flex:1;padding:18px 21px;scrollbar-width:thin;scrollbar-color:var(--la-line) transparent;overscroll-behavior:contain}.la-drawer-footer{padding:14px 21px;border-top:1px solid var(--la-line);color:var(--la-muted);font-size:10px;line-height:1.6;flex-shrink:0}.la-empty{display:flex;align-items:center;gap:14px;padding:20px 15px;border:1px dashed var(--la-line);border-radius:14px}.la-empty>span{display:grid;place-items:center;width:38px;height:38px;flex-shrink:0;border-radius:12px;background:#a68bd610;color:var(--la-accent)}.la-empty h4{font-size:13px}.la-empty p{font-size:11px;margin:5px 0 0}.la-sr{position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden}\n:is(html.light,body.light,.theme-light,[data-theme=light]) :is(.la-box,.la-drawer,.la-launcher){--la-bg:#faf9ff;--la-paper:#f0ecf7;--la-line:#7054932c;--la-text:#293047;--la-muted:#6b7288;--la-accent:#7954c0;--la-ink:#fff;color-scheme:light}@keyframes la-slide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}@keyframes la-slide-out{to{opacity:0;transform:translateX(30px)}}@keyframes la-card-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@media(max-width:520px){.la-box{padding:17px}.la-box h3{font-size:19px}.la-text{font-size:20px}.la-drawer header{padding:20px 16px 17px}.la-drawer-scroll{padding:16px}.la-drawer-toolbar{padding:14px 16px}.la-drawer-footer{padding:13px 16px}.la-launcher{width:39px;height:46px;min-height:46px}.la-cards article{padding:15px}}@media(prefers-reduced-motion:reduce){.la-drawer[open],.la-drawer.la-closing,.la-cards article{animation:none}.la-launcher,.la-box button{transition:none}}\n/* Same edge-tab proportions as folded LMS AI assistant */\n.la-launcher{width:32px!important;height:60px!important;min-width:0!important;min-height:60px!important;border-radius:16px 0 0 16px!important;box-shadow:0 4px 16px #0002;border-color:var(--la-line);background:var(--la-bg);transition:background .2s,box-shadow .2s!important}.la-launcher:hover{width:32px!important;background:var(--la-paper);box-shadow:-3px 4px 20px #a68bd62a}.la-launcher:active{width:32px!important}.la-launcher svg{width:19px;height:19px}.la-launcher:focus-visible{outline-offset:-3px}\n@media(prefers-reduced-motion:reduce){.la-launcher{transition:none!important}}\n.la-box button,.la-drawer button{height:auto!important;max-height:none!important;min-height:42px;line-height:1.5;white-space:normal}.la-box .la-close{width:36px;min-height:36px;height:36px!important;flex-shrink:0}.la-drawer{width:min(420px,100vw)!important;max-width:100vw!important;overflow:clip}.la-box{width:100%;min-width:0}.la-cards article{height:auto;min-width:0}.la-drawer-toolbar{gap:10px;flex-wrap:wrap}.la-drawer-toolbar label{min-width:0;flex:1}.la-drawer-toolbar select{width:100%;height:42px;min-width:0;background:var(--la-paper);color:var(--la-text);border:1px solid var(--la-line);border-radius:10px;padding:8px}.la-help-form,.la-help-history{margin-top:12px;padding:12px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-paper);font-size:12px}.la-help-form label{display:grid;gap:6px}.la-help-form textarea{width:100%;min-height:85px;resize:vertical;height:auto;border:1px solid var(--la-line);background:var(--la-bg);color:var(--la-text);border-radius:10px;padding:10px;font:inherit}.la-help-history p{white-space:pre-wrap;overflow-wrap:anywhere}.la-notice{color:var(--la-accent);line-height:1.6}.la-box [hidden]{display:none!important}.la-active{width:100%;max-width:800px;margin:0 auto 16px;padding:16px;border:1px solid var(--la-line,#a994d62c);border-radius:14px;background:var(--input-bg,#20273a);color:var(--text-main,#edf0fa);font:13px/1.6 inherit}.la-active h4{margin:0 0 5px}.la-active p{margin:5px 0}.la-active button{height:auto;min-height:40px;padding:8px 12px;border-radius:9px;background:#a68bd620;color:inherit;border:1px solid #a994d62c}.la-active small{display:block}.la-active strong{color:var(--text-main,inherit)}\n@media(max-width:480px){.la-drawer{border-radius:0!important}.la-actions{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}.la-actions button{width:100%}.la-card-top{flex-wrap:wrap}.la-box>header{padding:16px;gap:10px}.la-box>header h3{font-size:19px}}\n.assignment-ai{margin-top:14px;border:1px solid var(--ax-line,var(--la-line));border-radius:12px;overflow:hidden;font-size:12px;background:var(--ax-input,var(--la-paper));color:var(--ax-text,var(--la-text))}.assignment-ai summary{cursor:pointer;padding:13px;color:var(--ax-accent,var(--la-accent));font-weight:600;min-height:44px}.assignment-ai>div{padding:0 13px 13px}.assignment-ai label{display:grid;gap:6px}.assignment-ai textarea{width:100%;min-height:80px;height:auto;max-height:200px;resize:vertical;border:1px solid var(--ax-line,var(--la-line));border-radius:10px;padding:10px;background:var(--ax-bg,var(--la-bg));color:inherit;font:inherit;margin:7px 0}.assignment-ai button{height:auto!important;min-height:40px;border:1px solid var(--ax-line,var(--la-line));border-radius:9px;background:var(--ax-paper,var(--la-paper));color:inherit;font:inherit;padding:10px;line-height:1.4}.assignment-ai button:disabled{opacity:.5}.assignment-ai-actions{display:flex;gap:8px;flex-wrap:wrap}.assignment-ai .assignment-ai-answer{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;margin:12px 0}.assignment-ai small{display:block;margin-top:8px;font-size:10px;color:var(--ax-muted,var(--la-muted))}\n/* Compose form: field and actions have independent layout boxes. */\n.la-box .la-help-form{padding:14px;background:var(--la-paper);border-radius:15px;display:flex;flex-direction:column;gap:12px;min-width:0}.la-help-form>label{display:flex!important;flex-direction:column;gap:9px;margin:0!important;min-width:0;font-size:12px;font-weight:600}.la-box .la-help-form textarea{box-sizing:border-box!important;display:block;width:100%!important;max-width:100%!important;height:112px!important;min-height:90px;max-height:230px;padding:12px!important;margin:0!important;border-radius:12px;resize:vertical;font-size:14px;line-height:1.6;outline:none}.la-box .la-help-form textarea:focus{border-color:var(--la-accent);box-shadow:0 0 0 3px #a68bd61c;outline:none}.la-help-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--la-line);padding-top:12px}.la-help-footer small{font-size:10px;white-space:nowrap}.la-box .la-help-footer button{margin:0!important;min-height:40px;padding:9px 13px;border-radius:10px;font-size:12px;background:var(--la-accent);color:var(--la-ink);border:0;line-height:1.4}.la-box .la-help-footer button:disabled{opacity:.45}.la-help-history{line-height:1.6}\n/* Assigned typing workspace */\n.la-box.la-run{width:100%;max-width:1040px;margin:0 auto 24px;padding:24px;border-radius:24px;background:radial-gradient(ellipse at top left,#a68bd60c,transparent 65%),var(--la-bg);box-shadow:0 20px 60px #0000000d}.la-run .la-run-head{padding:0;margin:0 0 22px;align-items:flex-start;gap:18px}.la-run-head small{font-size:9px;letter-spacing:1.2px;color:var(--la-accent)}.la-run .la-run-head h3{font-size:24px;letter-spacing:-.6px;line-height:1.35;overflow-wrap:anywhere;margin:7px 0 0}.la-run-head button{flex-shrink:0;min-height:40px;padding:9px 13px;background:var(--la-paper);font-size:12px;border-radius:11px}.la-run-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px}.la-run-metrics>div{min-width:0;border:1px solid var(--la-line);border-radius:14px;padding:13px 15px;background:var(--la-paper)}.la-run-metrics small{font-size:10px;color:var(--la-muted)}.la-run-metrics strong{display:block;margin-top:5px;font-size:26px;line-height:1.2;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.5px}.la-run-metrics>div:nth-child(2) strong{color:var(--la-accent)}.la-run-metrics i{font-size:14px;font-style:normal;margin-left:3px;color:var(--la-muted)}.la-run-paper{border:1px solid var(--la-line);border-radius:16px;padding:18px 20px;background:var(--la-paper);overflow:hidden}.la-run-text-head{display:flex;justify-content:space-between;gap:12px;color:var(--la-muted);font-size:10px;line-height:1.5;margin-bottom:12px}.la-run .la-text{font:21px/1.85 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--la-muted);letter-spacing:0;min-height:100px;max-height:260px;margin:0;padding:2px 1px;white-space:pre-wrap;overflow-wrap:anywhere;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--la-line) transparent}.la-run .la-text .done{color:var(--la-text)}.la-run .la-text .current{color:var(--la-ink);background:var(--la-accent);border-radius:3px;box-shadow:0 0 0 2px #a68bd622}.la-run .la-text .wrong{background:#c65070;color:#fff}.la-run-progress{height:4px;background:var(--la-line);margin-top:16px;border-radius:4px;overflow:hidden}.la-run-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--la-accent),#69bfa8);transition:width .15s ease}.la-run .la-run-capture{display:grid;gap:7px;margin-top:20px;font-size:12px;font-weight:600}.la-run-capture>span{font-size:11px;color:var(--la-muted);font-weight:400}.la-run .la-run-capture input{margin:4px 0 0!important;padding:13px 15px!important;height:50px!important;min-height:50px;width:100%;max-width:100%;border-radius:12px;background:var(--la-paper);border:1px solid var(--la-line);font-size:16px;box-shadow:none;outline:none;transition:border-color .2s,box-shadow .2s}.la-run .la-run-capture input:focus{border-color:var(--la-accent);box-shadow:0 0 0 3px #a68bd61c}.la-run-capture.has-error>span{color:#df7891}.la-run .la-run-capture input[aria-invalid=true]{border-color:#df7891}.la-run .la-run-note{font-size:10px;line-height:1.7;margin:12px 0 0;color:var(--la-muted)}.la-run-status{padding:14px;margin-top:16px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-paper);font-size:12px;line-height:1.6}.la-run-status.passed{border-color:#52b79055;background:#52b79010}.la-run .la-actions{margin-top:12px}.la-run{animation:la-slide .25s ease both}\n@media(max-width:600px){.la-box.la-run{padding:16px;border-radius:18px}.la-run .la-run-head{gap:12px;margin-bottom:16px;flex-wrap:wrap}.la-run .la-run-head>div{flex-basis:100%}.la-run .la-run-head h3{font-size:20px}.la-run-head button{margin-left:auto!important}.la-run-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}.la-run-metrics>div{padding:11px 13px}.la-run-metrics strong{font-size:24px}.la-run-paper{padding:13px}.la-run .la-text{font-size:18px;line-height:1.8;max-height:235px}.la-run-text-head{font-size:9px;flex-wrap:wrap;gap:5px}.la-run .la-run-capture{margin-top:16px}.la-box .la-help-form{padding:12px}.la-help-footer{gap:8px}.la-box .la-help-footer button{font-size:11px;padding:9px 11px}}\n@media(prefers-reduced-motion:reduce){.la-run{animation:none}.la-run-progress i,.la-run .la-run-capture input{transition:none}}\n/* Page in the main menu, plus compact assignment context. */\n.la-box{box-sizing:border-box}\n.la-page{max-width:1100px;margin:0 auto 24px;padding:26px;animation:la-card-in .25s ease both}.la-page-head{align-items:center!important}.la-page-icon,.la-active-emblem{display:grid;place-items:center;width:44px;height:44px;flex-shrink:0;border:1px solid var(--la-line);border-radius:14px;background:#a68bd61a;color:var(--la-accent);font-size:22px}.la-page-head p{font-size:11px;margin:6px 0 0}.la-page-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:20px 0;padding:14px 0;border-block:1px solid var(--la-line);color:var(--la-muted);font-size:12px}.la-page-toolbar select{font:inherit;height:40px;max-width:100%;padding:8px 12px;border:1px solid var(--la-line);border-radius:11px;background:var(--la-paper);color:var(--la-text)}.la-page-cards{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.la-page-cards article{min-width:0}.la-page-head button{flex-shrink:0}.la-box.la-active{max-width:1100px;padding:20px 22px;margin:0 auto 20px;background:linear-gradient(110deg,#a68bd608,transparent),var(--la-bg);border-radius:20px;font-family:inherit;font-size:13px;line-height:1.6;animation:la-card-in .25s ease}.la-active-top{display:flex;align-items:center;gap:12px}.la-active-title{flex:1;min-width:0}.la-active-title small{font-size:9px;letter-spacing:1px;color:var(--la-accent)}.la-active-title h4{font-size:17px;margin-top:4px;line-height:1.4}.la-active-top button{flex-shrink:0;font-size:11px}.la-active-bottom{display:grid;grid-template-columns:minmax(0,1fr) 200px;align-items:center;gap:24px;margin-top:16px;padding-top:14px;border-top:1px solid var(--la-line)}.la-box .la-active-bottom p{font-size:11px;line-height:1.7;margin:0;max-width:660px}.la-active-meter>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:10px;color:var(--la-muted)}.la-active-meter strong{font-size:15px;color:var(--la-text)}.la-active-meter .la-run-progress{margin-top:7px;height:5px}.la-active-details{margin-top:16px;border:1px solid var(--la-line);border-radius:12px;overflow:hidden;background:var(--la-paper)}.la-active-details summary{display:flex;justify-content:space-between;gap:10px;padding:11px 14px;font-size:11px;font-weight:600;cursor:pointer;color:var(--la-accent);list-style:none}.la-active-details summary::-webkit-details-marker{display:none}.la-active-details summary span{transition:transform .2s}.la-active-details[open] summary span{transform:rotate(180deg)}.la-box .la-active-details p{font-size:12px;line-height:1.8;margin:0;padding:0 14px 14px;white-space:pre-wrap;overflow-wrap:anywhere;animation:la-card-in .2s ease}.la-box .la-active-notice{padding:10px 12px;border-radius:10px;background:var(--la-paper);font-size:11px;margin:12px 0 0}\n@media(max-width:700px){.la-page-cards{grid-template-columns:minmax(0,1fr)}.la-page{padding:16px}.la-page .la-page-head{padding:0;flex-wrap:wrap}.la-page-head>div{flex-basis:calc(100% - 65px)!important}.la-page-head button{margin-left:auto}.la-page-toolbar{flex-wrap:wrap;font-size:11px}.la-box.la-active{padding:16px}.la-active-top{flex-wrap:wrap;gap:10px}.la-active-title{flex-basis:calc(100% - 60px)}.la-active-top button{margin-left:auto}.la-active-bottom{grid-template-columns:minmax(0,1fr);gap:14px}.la-active-title h4{font-size:16px}}\n@media(prefers-reduced-motion:reduce){.la-page,.la-box.la-active,.la-active-details p{animation:none}.la-active-details summary span{transition:none}}\n.la-run .la-run-capture input:focus{border-color:var(--la-accent)!important}.la-run .la-run-capture input[aria-invalid=true]{border-color:#df7891!important}\n/* Assignment workspace v8: quiet rows, compact controls, no upper exercise panel. */\n.la-box.la-page{max-width:1100px;background:transparent;border:0;box-shadow:none;padding:18px 0 36px;border-radius:0}.la-page .la-page-head{padding:0 4px!important;margin:0 0 26px!important;gap:14px}.la-page .la-page-head h3{font-size:30px;letter-spacing:-1px}.la-page .la-page-head p{font-size:12px}.la-page .la-page-icon{display:none}.la-page-head small{color:var(--la-accent);letter-spacing:1.8px;font-size:9px}.la-page-head button{border-radius:50px!important;background:var(--la-paper);min-height:38px!important;font-size:11px;padding:9px 16px!important}.la-page .la-page-toolbar{border:0;margin:0 0 18px;padding:0 4px;font-size:11px}.la-page-toolbar select{height:40px;border-radius:12px;font-size:12px;cursor:pointer}.la-page .la-page-cards{display:flex;flex-direction:column;gap:12px}.la-page .la-task-row{width:100%;padding:0;border-radius:20px;background:linear-gradient(115deg,#b898ee08,transparent 50%),var(--la-bg);border:1px solid var(--la-line);box-shadow:0 5px 25px #00000008;overflow:hidden;transition:border-color .2s}.la-task-row:hover{border-color:#a994d662}.la-row-main{display:grid;grid-template-columns:46px minmax(0,1fr) auto 140px;align-items:center;gap:18px;padding:22px 24px 17px}.la-row-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:15px;color:#b49aea;background:#b49aea12;border:1px solid #b49aea25;font:500 21px ui-monospace,monospace}.la-task-row[data-module=excel] .la-row-icon{color:#46b99c;background:#46b99c12;border-color:#46b99c30}.la-task-row[data-module=typing] .la-row-icon{color:#6aa9dc;background:#6aa9dc12;border-color:#6aa9dc30}.la-row-copy{min-width:0}.la-row-copy>small{font-size:10px;color:var(--la-muted)}.la-page .la-row-copy h4{font-size:16px;font-weight:650;line-height:1.5;margin:4px 0 7px;letter-spacing:-.2px}.la-row-meta{display:flex;flex-wrap:wrap;gap:6px 16px;color:var(--la-muted);font-size:10px;line-height:1.6}.la-row-meta>span+span{opacity:.8}.la-page .la-state{font-size:10px;padding:6px 9px;border-radius:8px;font-weight:500}.la-box .la-row-start{flex:none;width:140px;min-height:40px!important;height:40px!important;padding:8px 14px;border-radius:12px;background:linear-gradient(125deg,#9974df,#7857c2);color:white;font-size:12px;font-weight:600;border:0}.la-row-start span{margin-left:auto}.la-row-finished{justify-self:end;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#46b99c12;color:#46b99c;margin-right:4px}.la-row-details>summary{display:flex;align-items:center;gap:8px;cursor:pointer;padding:0 24px 16px 88px;color:var(--la-muted);font-size:10px;list-style:none}.la-row-details>summary::-webkit-details-marker{display:none}.la-row-details>summary:hover{color:var(--la-accent)}.la-row-details>summary svg{transition:transform .2s}.la-row-details[open]>summary svg{transform:rotate(180deg)}.la-row-details>summary em{font-size:9px;font-style:normal;color:var(--la-accent);margin-left:12px}.la-row-expanded{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:28px;padding:22px 24px;border-top:1px solid var(--la-line);background:var(--la-paper);animation:la-card-in .2s ease}.la-row-expanded>div{min-width:0}.la-row-expanded small{font-size:9px;letter-spacing:.5px}.la-row-expanded p{font-size:12px;line-height:1.8}.la-row-help{border-left:1px solid var(--la-line);padding-left:24px}.la-row-help>small{display:block;margin-bottom:12px}.la-box .la-help-toggle{font-size:11px;min-height:36px;background:var(--la-bg)}.la-row-expanded .assignment-ai{background:var(--la-bg);border-radius:12px}.la-row-expanded .assignment-ai summary{font-size:11px}.la-row-expanded .la-help-form{background:var(--la-bg)}.la-row-expanded .la-help-form textarea{background:var(--la-paper);font-size:14px}.la-row-expanded .la-help-history{background:var(--la-bg);margin-top:12px}.la-task-row>.la-error{padding:0 24px 12px}\n.la-box.la-dock{position:fixed;z-index:1400;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;align-items:center;gap:16px;width:min(620px,calc(100vw - 24px));max-width:620px;margin:0;padding:12px 14px 12px 20px;border:1px solid var(--la-line);border-radius:20px;background:var(--la-bg);box-shadow:0 12px 45px #0003;animation:la-card-in .25s ease}.la-dock-name{min-width:0;flex:1}.la-dock-name small{display:block;font-size:8px;letter-spacing:1px;color:var(--la-accent)}.la-dock-name strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;margin-top:3px;line-height:1.5}.la-dock-count{font-size:21px;font-weight:650;white-space:nowrap;color:var(--la-text)}.la-dock-count i{font-style:normal;font-size:12px;font-weight:400;color:var(--la-muted);margin-left:3px}.la-dock button{height:38px!important;min-height:38px!important;font-size:11px;border-radius:12px;padding:8px 12px}.la-dock .la-dock-back{width:38px;padding:0;flex-shrink:0;background:var(--la-accent);color:var(--la-ink);border:0}.la-dock-dot{height:5px;width:5px;background:var(--la-accent);border-radius:50%}.la-box.la-task-dialog{position:fixed;box-sizing:border-box;inset:0;margin:auto;padding:0;width:min(560px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(100dvh - 32px);border-radius:22px;background:var(--la-bg);box-shadow:0 30px 100px #0004}.la-task-dialog[open]{display:flex;flex-direction:column;animation:la-card-in .2s ease}.la-task-dialog::backdrop{background:#0b102b80;backdrop-filter:blur(6px)}.la-task-dialog>header{padding:22px;margin:0;border-bottom:1px solid var(--la-line);flex-shrink:0}.la-task-dialog header h3{font-size:20px;line-height:1.4;overflow-wrap:anywhere}.la-task-dialog header button{width:34px;height:34px!important;min-height:34px;padding:0;flex-shrink:0;font-size:20px}.la-dialog-scroll{padding:22px;overflow:auto;min-height:0;overscroll-behavior:contain;scrollbar-width:thin}.la-condition+.la-condition{margin-top:18px;border-top:1px solid var(--la-line);padding-top:18px}.la-condition small{color:var(--la-accent);font-size:10px}.la-condition p{font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.la-dialog-result{display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding:14px;border-radius:12px;background:var(--la-paper);font-size:11px}.la-dialog-result strong{font-size:20px}.la-task-dialog>footer{display:flex;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid var(--la-line);flex-shrink:0}.la-task-dialog footer button{font-size:11px}.la-task-dialog .assignment-ai textarea{box-sizing:border-box}\n@media(max-width:680px){.la-box.la-page{padding:8px 2px 24px}.la-page .la-page-head{margin-bottom:20px!important;gap:10px}.la-page .la-page-head h3{font-size:26px}.la-page-head>div{flex-basis:60%!important}.la-page .la-page-head p{display:none}.la-page .la-page-toolbar{font-size:10px}.la-page-toolbar select{font-size:11px;max-width:170px}.la-row-main{grid-template-columns:38px minmax(0,1fr) auto;gap:11px;padding:17px 16px 12px}.la-row-icon{width:38px;height:38px;border-radius:12px;font-size:18px}.la-row-copy{grid-column:2/-1}.la-page .la-row-copy h4{font-size:14px}.la-row-meta{font-size:9px;gap:4px 12px}.la-page .la-state{grid-column:2;grid-row:2;justify-self:start;font-size:9px}.la-row-start,.la-row-finished{grid-column:3;grid-row:2}.la-box .la-row-start{width:auto;min-width:110px;height:36px!important;min-height:36px!important;font-size:10px;padding:8px 11px}.la-row-details>summary{padding:0 16px 14px 65px;font-size:10px}.la-row-expanded{grid-template-columns:minmax(0,1fr);padding:17px;gap:18px}.la-row-help{padding:18px 0 0;border-left:0;border-top:1px solid var(--la-line)}.la-box.la-dock{padding:10px 11px;gap:9px;border-radius:16px}.la-dock-name strong{font-size:11px}.la-dock-name small{font-size:7px}.la-dock-count{font-size:18px}.la-dock button{font-size:10px;padding:8px 10px}.la-dock .la-dock-back{width:34px}.la-task-dialog>header{padding:18px}.la-dialog-scroll{padding:18px}.la-task-dialog>footer{padding:14px;gap:8px}.la-task-dialog footer button{flex:1;padding:10px 8px}}\n@media(prefers-reduced-motion:reduce){.la-box.la-dock,.la-task-dialog[open],.la-row-expanded{animation:none}.la-row-details>summary svg,.la-task-row{transition:none}}\n@keyframes la-dock-appear{from{opacity:0}to{opacity:1}}.la-box.la-dock{animation:la-dock-appear .25s ease}@media(prefers-reduced-motion:reduce){.la-box.la-dock{animation:none}}\n" + "/* Framed assignment section; isolated from the rest of the platform. */\n.la-box.la-page{position:relative;isolation:isolate;box-sizing:border-box;overflow:hidden;max-width:1120px;margin:0 auto 28px;padding:30px;border:1px solid var(--la-line);border-radius:28px;background:var(--la-bg);box-shadow:0 22px 70px #060c1c24,inset 0 1px 0 #ffffff0b;animation:tasks-section-enter .45s ease both}\n.la-box.la-page::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,var(--la-line) 1px,transparent 1px),linear-gradient(var(--la-line) 1px,transparent 1px),radial-gradient(ellipse at 90% 0%,#aa82ed22,transparent 60%);background-size:52px 52px,52px 52px,100% 100%;opacity:.32;mask-image:linear-gradient(#000,transparent 360px);-webkit-mask-image:linear-gradient(#000,transparent 360px)}\n.la-box.la-page::after{content:'';position:absolute;z-index:0;top:0;left:0;width:32%;height:2px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--la-accent),transparent);animation:tasks-border-light 9s ease-in-out infinite;opacity:.65}\n.la-page>header,.la-page>.la-page-toolbar,.la-page>.la-cards,.la-page>.la-empty,.la-page>p{position:relative;z-index:1}\n.la-page .la-page-head{padding:0 0 24px!important;margin:0 0 20px!important;border-bottom:1px solid var(--la-line)}\n.la-page .la-page-icon{display:grid;width:46px;height:46px;place-items:center;border-radius:15px;border:1px solid var(--la-line);background:var(--la-paper);color:var(--la-accent);font-size:23px;box-shadow:0 6px 20px #0000000a;animation:tasks-mark-glow 5s ease-in-out infinite}\n.la-page .la-page-head h3{font-size:28px}.la-page .la-page-head p{line-height:1.7}.la-page .la-page-toolbar{padding:0;margin-bottom:18px}\n.la-page .la-task-row{background:var(--la-paper);border-color:var(--la-line);box-shadow:0 4px 15px #00000008;transition:border-color .2s,box-shadow .2s;animation:tasks-row-enter .35s ease both}\n.la-page .la-task-row:nth-child(2){animation-delay:.04s}.la-page .la-task-row:nth-child(3){animation-delay:.08s}.la-page .la-task-row:nth-child(4){animation-delay:.12s}\n.la-page .la-task-row:hover{border-color:var(--la-accent);box-shadow:0 7px 22px #00000013}.la-page .la-row-expanded{background:var(--la-bg)}\n.la-page .la-row-icon{transition:transform .2s}.la-page .la-task-row:hover .la-row-icon{transform:translateY(-2px)}\n.la-page .la-row-start{box-shadow:0 5px 14px #8a62c825;transition:filter .2s,transform .15s,box-shadow .2s}.la-page .la-row-start:hover:not(:disabled){filter:brightness(1.09);box-shadow:0 7px 20px #8a62c838}.la-page .la-row-start:active:not(:disabled){transform:scale(.97)}\n.la-page .la-page-toolbar select{transition:border-color .2s,box-shadow .2s}.la-page .la-page-toolbar select:focus{outline:0;border-color:var(--la-accent);box-shadow:0 0 0 3px #aa82ed18}\n@keyframes tasks-section-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}\n@keyframes tasks-row-enter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}\n@keyframes tasks-border-light{0%,100%{transform:translateX(5%);opacity:.25}50%{transform:translateX(205%);opacity:.9}}\n@keyframes tasks-mark-glow{0%,100%{box-shadow:0 0 0 0 #aa82ed00}50%{box-shadow:0 0 20px #aa82ed18}}\n@media(max-width:680px){.la-box.la-page{padding:18px 14px;border-radius:22px;margin-bottom:20px}.la-page .la-page-head{padding:0 0 17px!important;margin-bottom:15px!important;gap:11px}.la-page .la-page-icon{width:38px;height:38px;border-radius:12px;font-size:20px}.la-page .la-page-head>div{flex-basis:calc(100% - 54px)!important}.la-page .la-page-head h3{font-size:24px;letter-spacing:-.8px}.la-page .la-page-head button{margin-left:auto;min-height:34px!important;padding:7px 12px!important;font-size:10px}.la-page .la-page-toolbar{gap:10px;flex-wrap:wrap}.la-page .la-page-toolbar select{max-width:158px;font-size:10px}.la-page .la-row-main{padding:15px 13px 12px;gap:9px;grid-template-columns:32px minmax(0,1fr) auto}.la-page .la-row-icon{width:32px;height:36px;font-size:17px;border-radius:10px}.la-page .la-row-copy h4{font-size:13px}.la-page .la-row-start{min-width:100px;font-size:10px;padding:8px 10px}.la-page .la-row-details>summary{padding-left:54px;padding-right:13px}.la-page .la-row-expanded{padding:14px}.la-page .la-row-meta{font-size:9px;gap:3px 8px}}\n@media(prefers-reduced-motion:reduce){.la-box.la-page,.la-box.la-page::after,.la-page .la-task-row,.la-page .la-page-icon{animation:none!important}.la-page .la-task-row,.la-page .la-row-icon,.la-page .la-row-start{transition:none}.la-page .la-task-row:hover .la-row-icon{transform:none}}\n" + "\n/* Assignment practice — compact framed workspace, October 2026. */\n.la-box.la-run{position:relative;isolation:isolate;overflow:hidden;box-sizing:border-box;width:100%;max-width:1040px;margin:0 auto 24px;padding:28px;border-radius:28px;background:var(--la-bg);box-shadow:0 20px 65px #080d201a;animation:tasks-section-enter .45s ease both}\n.la-box.la-run::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,var(--la-line) 1px,transparent 1px),linear-gradient(var(--la-line) 1px,transparent 1px),radial-gradient(ellipse at 100% 0%,#b08aef20,transparent 65%);background-size:44px 44px,44px 44px,100% 100%;mask-image:linear-gradient(#000,transparent 250px);opacity:.45}\n.la-box.la-run::after{content:'';position:absolute;top:0;left:0;width:32%;height:2px;background:linear-gradient(90deg,transparent,var(--la-accent),transparent);pointer-events:none;animation:tasks-border-light 8s ease-in-out infinite}\n.la-run .la-run-head{display:flex;align-items:center;gap:13px;margin:0;padding-bottom:22px;border-bottom:1px solid var(--la-line);flex-wrap:nowrap}\n.la-run .la-practice-icon{display:grid;place-items:center;width:46px;height:46px;flex-shrink:0;background:var(--la-paper);border:1px solid var(--la-line);border-radius:15px;color:var(--la-accent);font-size:24px}\n.la-run .la-run-head small{font-size:9px;letter-spacing:1.6px;color:var(--la-accent)}\n.la-run .la-run-head h3{font-size:23px;line-height:1.35;letter-spacing:-.6px;overflow-wrap:anywhere;margin:4px 0 0}\n.la-run .la-run-goal{flex-shrink:0;padding:8px 12px;border:1px solid var(--la-line);border-radius:30px;background:var(--la-paper);color:var(--la-accent);font-size:11px;line-height:1.5}\n.la-run .la-run-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin:22px 0;padding:0;background:none;border:0}\n.la-run .la-run-metrics>div{display:flex;flex-direction:column;align-items:center;gap:5px;padding:0 12px;border:0;border-right:1px solid var(--la-line);border-radius:0;background:none;box-shadow:none;min-width:0}\n.la-run .la-run-metrics>div:last-child{border:0}.la-run .la-run-metrics small{font-size:11px}.la-run .la-run-metrics strong{font-size:29px;line-height:1.2;font-weight:600;letter-spacing:-1px;font-variant-numeric:tabular-nums;color:var(--la-text)}.la-run .la-run-metrics i{font-size:16px;margin-left:3px;font-style:normal;color:var(--la-muted)}\n.la-run .la-run-paper{position:relative;background:var(--la-paper);border:1px solid var(--la-line);border-radius:19px 19px 0 0;padding:20px 22px 0;overflow:hidden;box-shadow:none}\n.la-run .la-run-text-head{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding-bottom:14px;border-bottom:1px solid var(--la-line);font-size:10px;letter-spacing:.3px;color:var(--la-muted)}\n.la-run .la-text{margin:18px 0;max-height:245px;min-height:90px;padding:0 3px;font:21px/1.85 ui-monospace,Consolas,monospace;color:var(--la-muted);scrollbar-width:thin;scrollbar-color:var(--la-line) transparent;overscroll-behavior:contain;overflow-wrap:anywhere}\n.la-run .la-text .current{padding:2px 0;border-radius:4px;box-shadow:0 0 0 3px #aa82ed12;animation:la-caret-glow 1.8s ease-in-out infinite}.la-run .la-text .current.wrong{background:#f3a3b7;color:#511629;animation:none}.la-run .la-text .done{color:var(--la-accent)}\n.la-run .la-run-progress{height:3px;margin:0 -22px;background:var(--la-line);overflow:hidden;border-radius:0}.la-run .la-run-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--la-accent),#75c8bc);transition:width .2s ease}\n.la-run .la-run-capture{display:block;margin:0;padding:18px 22px 20px;border:1px solid var(--la-line);border-top:0;border-radius:0 0 19px 19px;background:var(--la-paper);font-size:12px;font-weight:600;color:var(--la-text);transition:box-shadow .2s}\n.la-run .la-run-capture>span{display:block;margin:5px 0 12px;color:var(--la-muted);font-size:11px;font-weight:400;line-height:1.5}\n.la-run .la-run-capture .la-input{width:100%;min-width:0;height:50px!important;min-height:50px!important;max-height:none;margin:0!important;padding:12px 15px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-bg);color:var(--la-text);box-shadow:none;font:16px/1.5 inherit;transition:border-color .2s,box-shadow .2s}\n.la-run .la-run-capture .la-input:focus{border-color:var(--la-accent)!important;box-shadow:0 0 0 3px #aa82ed18;outline:none}.la-run .la-input::placeholder{color:var(--la-muted);opacity:.8}.la-run .la-run-capture.has-error>span{color:#d36687}.la-run .la-run-capture.has-error .la-input{border-color:#d36687!important}\n.la-run .la-run-note{font-size:10px;line-height:1.7;margin:15px 2px 0;padding-left:12px;border-left:2px solid var(--la-line)}\n.la-run .la-run-status{margin-top:16px;animation:tasks-row-enter .25s ease}.la-run .la-actions{margin-top:15px}\n.la-box.la-page::before{opacity:.5;background-size:44px 44px,44px 44px,100% 100%;mask-image:linear-gradient(#000,transparent 480px);-webkit-mask-image:linear-gradient(#000,transparent 480px)}\n.la-page .la-page-head{position:relative}.la-page .la-page-head::after{content:'';position:absolute;left:0;bottom:-1px;width:90px;height:1px;background:linear-gradient(90deg,var(--la-accent),transparent);pointer-events:none}\n@keyframes la-caret-glow{50%{box-shadow:0 0 0 3px #aa82ed22}}\n@media(max-width:600px){.la-box.la-run{padding:18px 14px;border-radius:22px}.la-run .la-run-head{display:grid;grid-template-columns:39px minmax(0,1fr);gap:11px;padding-bottom:17px}.la-run .la-practice-icon{width:39px;height:39px;border-radius:12px;font-size:21px}.la-run .la-run-head>div{flex:1;min-width:0}.la-run .la-run-head h3{font-size:19px}.la-run .la-run-head small{font-size:8px;letter-spacing:1.1px}.la-run .la-run-goal{grid-column:2;justify-self:start;margin-left:0;font-size:10px;padding:6px 10px}.la-run .la-run-metrics{margin:19px 0}.la-run .la-run-metrics>div{padding:0 6px}.la-run .la-run-metrics small{font-size:9px}.la-run .la-run-metrics strong{font-size:25px}.la-run .la-run-paper{padding:16px 14px 0}.la-run .la-text{font-size:18px;line-height:1.8;max-height:230px;margin:15px 0}.la-run .la-run-text-head{font-size:9px;padding-bottom:12px}.la-run .la-run-progress{margin:0 -14px}.la-run .la-run-capture{padding:16px 14px}.la-run .la-run-capture>span{font-size:10px}.la-run .la-run-note{font-size:9px}}\n@media(prefers-reduced-motion:reduce){.la-box.la-run,.la-box.la-run::after,.la-run .la-text .current,.la-run .la-run-status{animation:none!important}.la-run .la-run-progress i,.la-run .la-run-capture,.la-run .la-run-capture .la-input{transition:none!important}}\n" + LMS_ASSIGN_CSS_V3;
const LMS_ASSIGN_DRAWER_CSS = "";
const lmsH = React.createElement;
function lmsHotkeyBankText(bank) {
  return LMS_HK_BANKS[bank] || 'любая категория';
}
// Одно описание условий для списка заданий и для окна «Условия».
function lmsHotkeyRule(task) {
  const n = Math.max(1, Math.floor(Number(task?.target) || 1));
  return `Засчитайте ${n} ${lmsPlural(n, 'серию', 'серии', 'серий')} из ${LMS_HK.MIN} и более сочетаний. Категория: ${lmsHotkeyBankText(task?.hotkeyBank)}. ` + 'Сочетания нужно найти самостоятельно: ошибки можно исправить, они попадут в статистику и не отменяют серию. Подсказка и пропуск серию не засчитывают.';
}

// Активное задание: 12_hotkeys.js берёт контекст отсюда, а не из «залипшей» глобальной переменной.
let lmsActiveAssignment = null;
function lmsSetActiveAssignment(ctx) {
  lmsActiveAssignment = ctx;
  try {
    window.dispatchEvent(new CustomEvent('lms-assignment-context'));
  } catch {}
}
window.lmsGetActiveAssignment = function (module) {
  const a = lmsActiveAssignment;
  if (!a || module && a.module !== module || a.uid !== window.auth?.currentUser?.uid) return null;
  return {
    ...a
  };
};

// Число плавно «докатывается» до нового значения.
function LmsCountUp({
  value
}) {
  const n = Math.max(0, Math.round(Number(value) || 0));
  const [shown, setShown] = React.useState(n),
    cur = React.useRef(n);
  React.useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || cur.current === n || typeof requestAnimationFrame !== 'function') {
      cur.current = n;
      setShown(n);
      return;
    }
    const from = cur.current,
      t0 = performance.now();
    let raf = 0;
    const step = t => {
      const k = Math.min(1, (t - t0) / 650);
      cur.current = Math.round(from + (n - from) * (1 - Math.pow(1 - k, 3)));
      setShown(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n]);
  return shown;
}

// Полоска серий под названием задания: каждая засчитанная серия «загорается».
function LmsSegments({
  count,
  total,
  done
}) {
  const c = Math.min(Math.max(0, count), total),
    label = lmsH("span", {
      className: "la-seg-label"
    }, c, " / ", total);
  const track = total > 12 ? lmsH("span", {
    className: "la-seg la-seg-bar",
    role: "img",
    "aria-label": `Засчитано ${c} из ${total}`
  }, lmsH("i", {
    style: {
      width: c / total * 100 + '%'
    }
  })) : lmsH("span", {
    className: 'la-seg' + (done ? ' is-done' : ''),
    role: "img",
    "aria-label": `Засчитано ${c} из ${total}`
  }, Array.from({
    length: total
  }, (_, i) => lmsH("i", {
    key: i,
    className: i < c ? 'on' : '',
    style: {
      '--i': i
    }
  })));
  return lmsH("div", {
    className: "la-seg-row"
  }, track, label);
}
function LmsHotkeyStats({
  stats
}) {
  if (!stats || !stats.attempts) return lmsH("p", {
    className: "la-hk-empty"
  }, "Статистика появится после первой завершённой серии.");
  const items = [['Сочетаний', stats.answers], ['Верных', stats.solved], ['Ошибок', stats.errors], ['Подсказок', stats.hints], ['Пропусков', stats.skipped]];
  return lmsH("div", {
    className: "la-hk-stats"
  }, items.map(([label, v], i) => lmsH("div", {
    key: label,
    className: 'la-hk-stat' + (label === 'Ошибок' && v ? ' warn' : ''),
    style: {
      '--i': i
    }
  }, lmsH("strong", null, lmsH(LmsCountUp, {
    value: v
  })), lmsH("small", null, label))));
}
function LmsHotkeyLog({
  log
}) {
  const rows = (Array.isArray(log) ? log : []).slice(-4).reverse();
  if (!rows.length) return null;
  return lmsH("ul", {
    className: "la-hk-log"
  }, rows.map((e, i) => lmsH("li", {
    key: e.id || i,
    className: e.ok ? 'ok' : 'no',
    style: {
      '--i': i
    }
  }, lmsH("span", {
    className: "la-hk-dot",
    "aria-hidden": "true"
  }, e.ok ? '✓' : '–'), lmsH("span", null, e.ok ? 'Серия засчитана' : 'Не засчитана: ' + (e.reasons || []).map(c => lmsHotkeyReasonText(c, {
    total: e.total,
    skipped: e.skipped
  }, null)).join('; '), lmsH("small", null, e.total, " ", lmsPlural(e.total, 'сочетание', 'сочетания', 'сочетаний'), " · ошибок ", e.errors || 0, e.hints ? ' · подсказок ' + e.hints : '', e.at ? ' · ' + new Date(e.at).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '')))));
}
function LmsHotkeyResult({
  p,
  target
}) {
  return lmsH(React.Fragment, null, lmsH("span", null, "Засчитано серий: ", p.result?.count || 0, " / ", target), lmsH(LmsHotkeyStats, {
    stats: p.hotkeyStats
  }), lmsH(LmsHotkeyLog, {
    log: p.hotkeyLog
  }));
}
// Праздничный всплеск при выполнении задания; один раз и без звука.
function LmsBurst() {
  const [on, setOn] = React.useState(!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const t = setTimeout(() => setOn(false), 1800);
    return () => clearTimeout(t);
  }, []);
  if (!on) return null;
  const colors = ['#b49aea', '#69bfa8', '#e4aa73', '#8fb8f0', '#e889a2'];
  return lmsH("span", {
    className: "la-burst",
    "aria-hidden": "true"
  }, Array.from({
    length: 24
  }, (_, i) => {
    const a = i / 24 * Math.PI * 2 + (i % 2 ? .15 : -.1),
      d = 55 + i * 37 % 75;
    return lmsH("i", {
      key: i,
      style: {
        '--x': Math.round(Math.cos(a) * d) + 'px',
        '--y': Math.round(Math.sin(a) * d * .8 - 34) + 'px',
        '--c': colors[i % 5],
        '--r': i * 47 % 360 + 'deg',
        '--d': i % 6 * 28 + 'ms'
      }
    });
  }));
}
function AssignmentActive({
  task: initialTask,
  uid,
  onClose
}) {
  const [live, setLive] = React.useState(null),
    [progress, setProgress] = React.useState(null),
    [notice, setNotice] = React.useState(null),
    [toast, setToast] = React.useState(null),
    [pulse, setPulse] = React.useState(0),
    [burst, setBurst] = React.useState(0),
    [open, setOpen] = React.useState(false);
  const modal = React.useRef(null),
    trigger = React.useRef(null),
    prev = React.useRef({
      count: null,
      done: false
    });
  const task = live || initialTask,
    stale = !!live && live.status !== 'assigned';
  // Актуальная версия задания: преподаватель мог изменить цель или категорию.
  React.useEffect(() => window.db.collection('lmsAssignments').doc(initialTask.id).onSnapshot(s => setLive(s.exists ? {
    ...s.data(),
    id: s.id
  } : {
    ...initialTask,
    status: 'removed'
  }), () => {}), [initialTask.id]);
  React.useEffect(() => window.db.collection('lmsAssignments').doc(initialTask.id).collection('progress').doc(uid).onSnapshot(s => setProgress(s.data() || {}), e => setNotice({
    text: e.message,
    kind: 'error'
  })), [initialTask.id, uid]);
  React.useEffect(() => {
    if (stale) return;
    const ctx = {
      id: task.id,
      uid,
      module: task.module,
      bank: task.hotkeyBank || 'any',
      target: Number(task.target) || 1
    };
    lmsSetActiveAssignment(ctx);
    return () => {
      if (lmsActiveAssignment === ctx) lmsSetActiveAssignment(null);
    };
  }, [task.id, uid, task.module, task.hotkeyBank, task.target, stale]);
  React.useEffect(() => {
    const f = e => {
      if (e.detail?.id !== task.id) return;
      const n = {
        text: e.detail.message,
        kind: e.detail.kind || 'info',
        id: Date.now()
      };
      setNotice(n);
      setToast(n);
    };
    window.addEventListener('lms-assignment-feedback', f);
    return () => window.removeEventListener('lms-assignment-feedback', f);
  }, [task.id]);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 9000);
    return () => clearTimeout(t);
  }, [toast]);
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
    total = Math.max(1, Math.floor(Number(task.target) || 1)),
    stats = task.module === 'hotkeys' ? progress?.hotkeyStats : null;
  React.useEffect(() => {
    if (progress == null) return;
    const before = prev.current;
    prev.current = {
      count,
      done
    };
    if (before.count == null) return; // первая загрузка — без анимации
    if (done && !before.done) setBurst(b => b + 1);else if (count > before.count) setPulse(p => p + 1);
  }, [progress, count, done]);
  const condition = task.module === 'word' ? 'Оформите назначенный документ. Зачёт даётся за четыре выполненных условия в панели «Практика» Word Lab. ИИ объясняет действия, но не применяет готовые ответы.' : task.module === 'hotkeys' ? lmsHotkeyRule(task) : 'Самостоятельно решайте задачи внутри Excel Lab. Ответ после просмотра готового решения не засчитывается.';
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({
      preventScroll: true
    }));
  }
  const unit = task.module === 'hotkeys' ? 'серий' : 'упражнений';
  return ReactDOM.createPortal(lmsH(React.Fragment, null, lmsH("style", null, LMS_ASSIGN_CSS), toast && lmsH("div", {
    key: toast.id,
    className: 'la-box la-toast la-toast-' + toast.kind,
    role: "status",
    onClick: () => setToast(null)
  }, lmsH("span", {
    className: "la-toast-icon",
    "aria-hidden": "true"
  }, toast.kind === 'ok' ? '✓' : toast.kind === 'warn' ? '!' : toast.kind === 'error' ? '×' : 'i'), lmsH("span", null, toast.text)), lmsH("aside", {
    className: 'la-box la-dock' + (done ? ' is-done' : ''),
    "aria-label": "Текущее задание"
  }, pulse > 0 && lmsH("span", {
    key: 'p' + pulse,
    className: "la-dock-pulse",
    "aria-hidden": "true"
  }), burst > 0 && lmsH(LmsBurst, {
    key: 'b' + burst
  }), lmsH("div", {
    className: "la-dock-name"
  }, lmsH("small", null, done ? 'ВЫПОЛНЕНО' : 'ЗАДАНИЕ', " · ", LMS_TASK_MODULES[task.module]), lmsH("strong", {
    title: task.title
  }, task.title), stats?.attempts ? lmsH("small", {
    className: "la-dock-stats"
  }, "Сочетаний ", stats.answers, " · ошибок ", stats.errors, " · подсказок ", stats.hints) : null), lmsH("span", {
    className: "la-dock-count",
    "aria-label": `Выполнено ${count} из ${total}`
  }, lmsH("b", {
    key: count,
    className: "la-dock-num"
  }, count), lmsH("i", null, "/", total)), lmsH("button", {
    ref: trigger,
    onClick: () => setOpen(true),
    "aria-haspopup": "dialog"
  }, "Условия", notice && lmsH("i", {
    className: "la-dock-dot"
  })), lmsH("button", {
    className: "la-dock-back",
    onClick: onClose,
    title: "Вернуться к списку заданий",
    "aria-label": "К заданиям"
  }, lmsH("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, lmsH("path", {
    d: "m10 6-6 6 6 6M4 12h16"
  }))), lmsH("div", {
    className: "la-dock-track",
    "aria-hidden": "true"
  }, lmsH("i", {
    style: {
      width: Math.min(100, count / total * 100) + '%'
    }
  }))), open && lmsH("dialog", {
    ref: modal,
    className: "la-box la-task-dialog",
    "aria-labelledby": "la-task-title",
    onCancel: e => {
      e.preventDefault();
      close();
    }
  }, lmsH("header", null, lmsH("div", null, lmsH("small", null, "УСЛОВИЯ ЗАДАНИЯ"), lmsH("h3", {
    id: "la-task-title"
  }, task.title)), lmsH("button", {
    onClick: close,
    "aria-label": "Закрыть условия"
  }, "×")), lmsH("div", {
    className: "la-dialog-scroll"
  }, stale && lmsH("p", {
    role: "alert",
    className: "la-error"
  }, "Задание снято или удалено преподавателем. Новые результаты не сохраняются."), lmsH("div", {
    className: "la-condition"
  }, lmsH("small", null, "Как получить зачёт"), lmsH("p", null, condition)), task.text && lmsH("div", {
    className: "la-condition"
  }, lmsH("small", null, "От преподавателя"), lmsH("p", null, task.text)), lmsH("div", {
    className: "la-dialog-result"
  }, lmsH("span", null, done ? 'Задание выполнено' : 'Засчитано ' + unit), lmsH("strong", null, count, " / ", total)), task.module === 'hotkeys' && lmsH("div", {
    className: "la-hk-block"
  }, lmsH("small", null, "Статистика ответов"), lmsH(LmsHotkeyStats, {
    stats: progress?.hotkeyStats
  }), lmsH(LmsHotkeyLog, {
    log: progress?.hotkeyLog
  })), notice && lmsH("p", {
    role: "status",
    className: 'la-notice la-notice-' + notice.kind
  }, notice.text), lmsH(AssignmentAI, {
    task: task
  })), lmsH("footer", null, lmsH("button", {
    onClick: onClose
  }, "К заданиям"), lmsH("button", {
    className: "la-primary",
    onClick: close
  }, "Продолжить практику")))), document.body);
}

  Object.assign(window, { LmsMyAssignments, LmsAssignedTyping, AssignmentActive });
})();
