// --- ВАЖНО: ИМПОРТЫ ИЗ ПРЕДЫДУЩИХ ФАЙЛОВ ---
const {
  useState,
  useEffect,
  useRef,
  motion,
  AnimatePresence,
  computeFingerprint,
  GooeyText,
  Button,
  Input,
  AdminPanel,
  ChatPanel,
  StatsView,
  TypingTest,
  HotkeyTrainer,
  CodePlayground,
  FlashcardsLMS,
  ChessLMS,
  LandingView,
  SidebarMenu,
  TestsLMS,
  logVisitor
} = window;

// Экраны, на которых показывается кнопка-бургер
const LAUNCHER_VIEWS = ['menu', 'stats', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'chess', 'admin'];

// Позиция бургера и резерв места под него (48px кнопка + 8px отступ + 8px зазор)
const LAUNCHER_TOP = 'max(8px, env(safe-area-inset-top))';
const CONTENT_TOP_WITH_LAUNCHER = 'calc(max(8px, env(safe-area-inset-top)) + 64px)';

// =========================================================================
// КНОПКА-БУРГЕР
// =========================================================================
const SidebarLauncher = ({
  isOpen,
  onClick,
  theme
}) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
.mobile-burger-fixed{position:fixed!important;top:max(16px,env(safe-area-inset-top))!important;left:max(16px,env(safe-area-inset-left))!important;right:auto!important;bottom:auto!important;transform:none!important;z-index:1900}
.lms-menu-launcher{--lms-ease:cubic-bezier(.34,1.56,.64,1);position:relative;display:grid;place-items:center;width:48px;height:48px;padding:0;border:1px solid #7186aa40;border-radius:15px;background:#1a2538;color:#cbd9f8;box-shadow:0 5px 16px #10213b22;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;transition:background .3s,color .3s,border-radius .5s var(--lms-ease),box-shadow .3s,transform .35s var(--lms-ease)}
.lms-menu-launcher[data-theme=light]{background:#fff;color:#43577e;border-color:#ccd7e9;box-shadow:0 5px 18px #546b9320}
.lms-menu-launcher::before{content:'';position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 50% 50%,#8da2ff55,transparent 70%);opacity:0;transform:scale(.4);transition:opacity .4s,transform .5s var(--lms-ease);pointer-events:none}
.lms-menu-launcher:hover{background:#334a70;color:#fff;box-shadow:0 7px 24px #435b9638;transform:translateY(-2px);border-radius:18px}
.lms-menu-launcher[data-theme=light]:hover{background:#eef2ff;color:#2f4290}
.lms-menu-launcher:hover::before{opacity:1;transform:scale(1)}
.lms-menu-launcher:active{transform:scale(.88)}
.lms-menu-launcher:focus-visible{outline:3px solid #7e99db;outline-offset:4px}
.lms-menu-launcher svg{display:block;overflow:visible}
.lms-menu-launcher line{transform-box:fill-box;transform-origin:center;transition:transform .55s var(--lms-ease),opacity .25s ease}
/* спокойное состояние: средняя линия короче, изредка «дышит» */
.lms-menu-launcher .lms-menu-line-b{transform-origin:left center;transform:scaleX(.62);animation:lms-burger-breathe 5s ease-in-out infinite}
.lms-menu-launcher .lms-menu-line-c{transform-origin:right center;transform:scaleX(.82)}
/* hover: линии выравниваются волной */
.lms-menu-launcher:hover .lms-menu-line-a{transform:translateX(0)}
.lms-menu-launcher:hover .lms-menu-line-b{transform:scaleX(1);animation:none;transition-delay:.05s}
.lms-menu-launcher:hover .lms-menu-line-c{transform:scaleX(1);transition-delay:.1s}
/* открыто: превращается в крестик */
.lms-menu-launcher[aria-expanded=true]{background:#3a55a8;color:#fff;border-radius:50%}
.lms-menu-launcher[aria-expanded=true]::before{opacity:1;transform:scale(1)}
.lms-menu-launcher[aria-expanded=true] .lms-menu-line-a,.lms-menu-launcher[aria-expanded=true]:hover .lms-menu-line-a{transform:translateY(6px) rotate(45deg)}
.lms-menu-launcher[aria-expanded=true] .lms-menu-line-b,.lms-menu-launcher[aria-expanded=true]:hover .lms-menu-line-b{transform:scaleX(0);opacity:0;animation:none}
.lms-menu-launcher[aria-expanded=true] .lms-menu-line-c,.lms-menu-launcher[aria-expanded=true]:hover .lms-menu-line-c{transform:translateY(-6px) rotate(-45deg)}
@keyframes lms-burger-breathe{0%,72%,100%{scale:1}84%{scale:1.45}93%{scale:1.15}}
@media(prefers-reduced-motion:reduce){.lms-menu-launcher .lms-menu-line-b{animation:none}}
`), /*#__PURE__*/React.createElement("button", {
  type: "button",
  className: "lms-menu-launcher",
  "data-theme": theme,
  "aria-label": isOpen ? 'Закрыть меню' : 'Открыть меню',
  "aria-expanded": isOpen,
  onClick: onClick,
  title: "Меню"
}, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("line", {
  className: "lms-menu-line-a",
  x1: "4",
  y1: "6",
  x2: "20",
  y2: "6"
}), /*#__PURE__*/React.createElement("line", {
  className: "lms-menu-line-b",
  x1: "4",
  y1: "12",
  x2: "20",
  y2: "12"
}), /*#__PURE__*/React.createElement("line", {
  className: "lms-menu-line-c",
  x1: "4",
  y1: "18",
  x2: "20",
  y2: "18"
}))));

// Excel загружается только при первом открытии раздела.
let excelModulePromise = null;
function loadExcelModule() {
  if (window.ExcelTrainerLMS) return Promise.resolve(window.ExcelTrainerLMS);
  if (excelModulePromise) return excelModulePromise;
  excelModulePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) {
        script.remove();
        reject(error);
      } else resolve(window.ExcelTrainerLMS);
    };
    const timer = setTimeout(() => finish(new Error('Загрузка Excel заняла слишком много времени.')), 60000);
    script.src = new URL('15_excel_trainer.js?v=selected-181', document.baseURI).href;
    script.async = true;
    script.onload = () => finish(window.ExcelTrainerLMS ? null : new Error('Не удалось запустить Excel.'));
    script.onerror = () => finish(new Error('Не удалось загрузить Excel. Проверь подключение.'));
    document.head.appendChild(script);
  }).catch(error => {
    window.reportLmsError?.(error, {
      "section": "platform",
      "source": "7_app.js",
      "line": 126,
      "operation": "promise-catch",
      "handled": true
    });
    excelModulePromise = null;
    throw error;
  });
  return excelModulePromise;
}
function LazyExcelTrainer(props) {
  const [Component, setComponent] = React.useState(() => window.ExcelTrainerLMS || null);
  const [error, setError] = React.useState('');
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    let active = true;
    setError('');
    loadExcelModule().then(value => {
      if (active) setComponent(() => value);
    }, reason => {
      if (active) setError(reason.message);
    });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (Component) return React.createElement(Component, props);
  return React.createElement(React.Fragment, null, React.createElement('style', null, `
.lms-excel-loading{box-sizing:border-box!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:0!important;width:100%!important;max-width:520px!important;min-width:0!important;margin:24px auto!important;padding:40px 28px!important;border:1px solid #a78bfa38!important;border-radius:26px!important;background:linear-gradient(145deg,#211934,#151322)!important;color:#f4efff!important;text-align:center!important;box-shadow:0 18px 55px #09061730;animation:lms-excel-enter .35s ease-out both}
.lms-excel-loading *{box-sizing:border-box}
.lms-excel-loading .lel-icon{position:relative;display:grid;place-items:center;width:74px;height:74px;margin:0 0 24px;border-radius:23px;background:#a78bfa12;color:#c4b5fd}
.lms-excel-loading .lel-icon:before{content:'';position:absolute;inset:-5px;border:2px solid #a78bfa1c;border-top-color:#b69afa;border-right-color:#8b5cf6;border-radius:50%;animation:lms-excel-spin 1.8s linear infinite}
.lms-excel-loading .lel-icon svg{display:block;width:30px;height:30px}
.lms-excel-loading .lel-label{margin:0 0 10px!important;font:600 10px/1.5 inherit;letter-spacing:2px;font-size:10px;font-weight:600;color:#b9a3eb!important}
.lms-excel-loading h2{display:block!important;width:100%!important;margin:0!important;padding:0!important;font-size:22px!important;font-weight:700!important;line-height:1.4!important;letter-spacing:-.4px!important;text-align:center!important;color:#f4efff!important}
.lms-excel-loading p.lel-copy{display:block!important;width:100%!important;max-width:340px!important;margin:12px 0 24px!important;padding:0!important;font-size:13px!important;line-height:1.7!important;text-align:center!important;color:#b5aec6!important;overflow-wrap:anywhere}
.lms-excel-loading .lel-track{width:150px;height:3px;overflow:hidden;border-radius:10px;background:#a78bfa20;margin:0 0 28px}
.lms-excel-loading .lel-track span{display:block;width:50%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#8b5cf6,#d8b4fe);animation:lms-excel-slide 1.6s ease-in-out infinite alternate}
.lms-excel-loading .lel-actions{display:flex!important;flex-wrap:wrap;justify-content:center;gap:10px;width:100%}
.lms-excel-loading .lel-actions button{appearance:none!important;position:static!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;float:none!important;width:auto!important;min-width:130px!important;max-width:100%!important;height:auto!important;min-height:44px!important;margin:0!important;padding:11px 18px!important;border:1px solid #a78bfa40!important;border-radius:12px!important;background:#a78bfa0c!important;color:#ded3f5!important;font:inherit!important;font-size:13px!important;font-weight:600!important;line-height:1.5!important;letter-spacing:normal!important;text-align:center!important;box-shadow:none!important;cursor:pointer!important;transform:none;transition:background .2s,border-color .2s,transform .2s;animation:none!important}
.lms-excel-loading .lel-actions button:before,.lms-excel-loading .lel-actions button:after{display:none!important}
.lms-excel-loading .lel-actions button:hover{background:#a78bfa20!important;border-color:#c4b5fd80!important;transform:translateY(-1px)}
.lms-excel-loading .lel-actions button:focus-visible{outline:2px solid #c4b5fd!important;outline-offset:4px}
.lms-excel-loading .lel-actions button.lel-retry{background:#7952c8!important;color:white!important}
.lms-excel-loading.is-error .lel-icon:before{animation:none;border-color:#c4b5fd50}
.lms-excel-loading.theme-light{background:linear-gradient(145deg,#ffffff,#f0edf9)!important;color:#29213c!important;border-color:#d8cee9!important;box-shadow:0 18px 55px #45325f18}
.lms-excel-loading.theme-light .lel-icon{background:#8252d910;color:#7751b6}
.lms-excel-loading.theme-light .lel-icon:before{border-color:#8252d922;border-top-color:#8054cb;border-right-color:#9c79d9}
.lms-excel-loading.theme-light .lel-label{color:#7751a5!important}
.lms-excel-loading.theme-light h2{color:#29213c!important}
.lms-excel-loading.theme-light p.lel-copy{color:#665d78!important}
.lms-excel-loading.theme-light .lel-track{background:#8252d920}
.lms-excel-loading.theme-light .lel-actions button{background:#ffffffb8!important;color:#584170!important;border-color:#cfc0e4!important}
.lms-excel-loading.theme-light .lel-actions button:hover{background:#ebe2f8!important;border-color:#ab8bd3!important}
.lms-excel-loading.theme-light .lel-actions button:focus-visible{outline-color:#8054cb!important}
.lms-excel-loading.theme-light .lel-actions button.lel-retry{background:#7952c8!important;color:#fff!important}
@keyframes lms-excel-spin{to{transform:rotate(360deg)}}
@keyframes lms-excel-slide{from{transform:translateX(-60%)}to{transform:translateX(160%)}}
@keyframes lms-excel-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:480px){.lms-excel-loading{margin:16px auto!important;padding:32px 20px!important;border-radius:22px!important}.lms-excel-loading h2{font-size:20px!important}}
@media(prefers-reduced-motion:reduce){.lms-excel-loading,.lms-excel-loading .lel-icon:before,.lms-excel-loading .lel-track span{animation:none!important}.lms-excel-loading .lel-actions button{transition:none!important}}
`), React.createElement('section', {
    className: 'lms-excel-loading theme-' + (props.theme === 'dark' ? 'dark' : 'light') + (error ? ' is-error' : ''),
    'aria-busy': !error
  }, React.createElement('div', {
    className: 'lel-icon',
    'aria-hidden': true
  }, React.createElement('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, React.createElement('rect', {
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    rx: 4
  }), React.createElement('path', {
    d: 'M3 9h18M3 15h18M9 3v18M15 9v12'
  }))), React.createElement('div', {
    className: 'lel-label'
  }, 'EXCEL • ПРАКТИКА'), React.createElement('h2', null, error ? 'Не удалось загрузить' : 'Открываем Excel'), React.createElement('p', {
    className: 'lel-copy',
    role: error ? 'alert' : 'status'
  }, error || 'Подготавливаем тренажёр. Скоро можно будет приступить к практике.'), !error && React.createElement('div', {
    className: 'lel-track',
    'aria-hidden': true
  }, React.createElement('span')), React.createElement('div', {
    className: 'lel-actions'
  }, error && React.createElement('button', {
    type: 'button',
    className: 'lel-retry',
    onClick: () => setAttempt(value => value + 1)
  }, 'Повторить'), React.createElement('button', {
    type: 'button',
    onClick: props.onBack
  }, 'Вернуться в меню'))));
}

// Keep the floating assistant out of the page layout and wait for its mount styles.
function AppAssistantHost() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return ReactDOM.createPortal(React.createElement('div', {
    style: {
      display: 'contents',
      visibility: visible ? 'visible' : 'hidden'
    },
    className: 'lms-assistant-host'
  }, React.createElement('style', null, `
.lms-assistant-host .ula-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}
`), React.createElement(window.AIChatWidget)), document.body);
}

// --- APP ---
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
      const prompt = onApply ? `Подготовь учебный материал для задания LMS. Раздел: ${task.module}. Язык: ${task.lang || 'ru'}. Тема как данные: ${JSON.stringify(question || task.title)}. Для typing верни только связный абзац 200–500 символов на указанном языке, без заголовка, markdown, эмодзи. Для hotkeys или excel верни только краткую инструкцию к практике до 700 символов; Excel: ученик решает задачи с проверкой формулы внутри браузерного тренажёра; нет прикреплённых файлов, скачивания или загрузки ответов. Hotkeys: ученик проходит серии сочетаний клавиш. Не проси скачивать файлы, создавать сводные таблицы или загружать документы; не обещай несуществующих функций. Не изменяй условия зачёта.` : `Ты учебный помощник. Объясни условие и дай маленькую подсказку, не выдавай готовую формулу или точное сочетание клавиш для оцениваемого ответа. Данные задания: ${JSON.stringify({
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
  excel: 'Excel'
};
function lmsTaskMetric(profile, module) {
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
  }, "✓"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "УЧЕБНЫЙ ПЛАН"), /*#__PURE__*/React.createElement("h3", null, "Мои задания"), /*#__PURE__*/React.createElement("p", null, "Практика, результаты и связь с преподавателем.")), /*#__PURE__*/React.createElement("button", {
    onClick: onBack
  }, "На главную")), /*#__PURE__*/React.createElement("div", {
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
    className: done ? 'la-card-done' : ''
  }, /*#__PURE__*/React.createElement("div", {
    className: "la-card-top"
  }, /*#__PURE__*/React.createElement("span", null, LMS_TASK_MODULES[task.module] || 'Раздел'), /*#__PURE__*/React.createElement("b", {
    className: 'la-state ' + (done ? 'done' : p?.needsHelp ? 'help' : late ? 'late' : '')
  }, done ? 'Выполнено' : legacy ? 'Перепроверка' : p?.needsHelp ? 'Нужна помощь' : late ? 'Просрочено' : p?.status === 'started' ? 'В процессе' : 'Новое')), /*#__PURE__*/React.createElement("h4", null, task.title), /*#__PURE__*/React.createElement("p", null, task.module === 'typing' ? `${task.lang?.toUpperCase()} · точность от ${task.minAccuracy}%` : task.module === 'excel' ? `Решить самостоятельно задач: ${task.target || 1}` : `Успешных серий: ${task.target || 1}. От 5 сочетаний, всё верно, без ошибок, подсказок и пропусков.`), task.module !== 'typing' && task.text && /*#__PURE__*/React.createElement("p", {
    className: "la-instruction"
  }, task.text), /*#__PURE__*/React.createElement("small", null, "До ", task.dueAt?.toDate?.().toLocaleString('ru-RU') || '—'), p?.result && !legacy && /*#__PURE__*/React.createElement("div", {
    className: "la-card-result"
  }, task.module === 'typing' ? `${p.result.accuracy}% точности · ${p.result.wpm} WPM` : `Выполнено: ${p.result.count || 0} / ${task.target || 1}`), /*#__PURE__*/React.createElement("div", {
    className: "la-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "la-primary",
    disabled: busy || !canOpen || !p || done,
    onClick: () => act(false)
  }, busy ? 'Подождите…' : done ? 'Готово' : legacy ? 'Пройти проверку' : p?.status === 'started' ? 'Продолжить' : 'Начать', /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, done ? '✓' : '→')), !done && /*#__PURE__*/React.createElement("button", {
    disabled: busy || !canOpen || !p,
    onClick: () => setHelpOpen(v => !v)
  }, helpOpen ? 'Закрыть вопрос' : 'Написать преподавателю')), legacy && /*#__PURE__*/React.createElement("p", {
    className: "la-notice"
  }, "Прежний зачёт основан на счётчике сессий. Выполните задание по новым условиям."), helpOpen && /*#__PURE__*/React.createElement("div", {
    className: "la-help-form"
  }, /*#__PURE__*/React.createElement("label", null, "Вопрос преподавателю", /*#__PURE__*/React.createElement("textarea", {
    value: question,
    maxLength: 1000,
    onChange: e => setQuestion(e.target.value),
    placeholder: "Опишите, что не получается и на каком шаге…"
  })), /*#__PURE__*/React.createElement("div", {
    className: "la-help-footer"
  }, /*#__PURE__*/React.createElement("small", null, question.length, " / 1000"), /*#__PURE__*/React.createElement("button", {
    disabled: busy || !question.trim(),
    onClick: () => act(true)
  }, busy ? 'Отправляем…' : 'Отправить вопрос'))), p?.helpQuestion && /*#__PURE__*/React.createElement("div", {
    className: "la-help-history"
  }, /*#__PURE__*/React.createElement("small", null, "Ваш вопрос"), /*#__PURE__*/React.createElement("p", null, p.helpQuestion), p.helpReply ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("small", null, "Ответ преподавателя"), /*#__PURE__*/React.createElement("p", null, p.helpReply)) : /*#__PURE__*/React.createElement("small", null, "Преподаватель увидит вопрос в результатах задания.")), !done && /*#__PURE__*/React.createElement(AssignmentAI, {
    task: task
  }), /*#__PURE__*/React.createElement("span", {
    className: "la-sr"
  }, task.id), !canOpen && /*#__PURE__*/React.createElement("small", null, "Доступ к этому разделу отключён преподавателем."), error && /*#__PURE__*/React.createElement("p", {
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
// Only called by the actual exercise's successful completion path.
window.lmsSubmitAssignmentResult = async function (context, evidence) {
  if (!context?.id || context.uid !== window.auth?.currentUser?.uid) throw Error('Аккаунт изменился. Откройте задание заново.');
  const db = window.db,
    ref = db.collection('lmsAssignments').doc(context.id),
    pr = ref.collection('progress').doc(context.uid);
  return db.runTransaction(async tx => {
    const [a, p, u] = await Promise.all([tx.get(ref), tx.get(pr), tx.get(db.collection('users').doc(context.uid))]);
    const task = a.data(),
      old = p.data() || {},
      profile = u.data(),
      allowed = id => profile?.allowedModules == null || profile.allowedModules.includes(id);
    if (window.auth?.currentUser?.uid !== context.uid || !a.exists || !task.studentIds?.includes(context.uid) || !profile || profile.isBanned || !allowed('assignments') || !allowed(task.module) || task.status !== 'assigned') throw Error('Нет доступа к заданию.');
    if (old.status === 'completed' && old.receiptVersion === 2) return {
      done: true
    };
    if (old.status !== 'started' || task.module !== evidence.module || !evidence.id) throw Error('Сначала откройте назначенное задание.');
    let accepted = false;
    if (task.module === 'hotkeys') {
      const r = evidence.records;
      accepted = Array.isArray(r) && r.length >= 5 && r.length === evidence.total && r.every(x => x.status === 'solved' && !x.hint && x.errors === 0) && (!task.hotkeyBank || task.hotkeyBank === 'any' || task.hotkeyBank === evidence.bank);
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
      done = count >= Number(task.target || 1),
      ts = window.firebase.firestore.FieldValue.serverTimestamp;
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
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "ПРАКТИКА ПЕЧАТИ · ЗАДАНИЕ ПРЕПОДАВАТЕЛЯ"), /*#__PURE__*/React.createElement("h3", null, task.title)), /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: onClose
  }, "К заданиям")), /*#__PURE__*/React.createElement("div", {
    className: "la-run-metrics"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Нужная точность"), /*#__PURE__*/React.createElement("strong", null, task.minAccuracy, /*#__PURE__*/React.createElement("i", null, "%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ваша точность"), /*#__PURE__*/React.createElement("strong", null, index + errors ? Math.round(index / (index + errors) * 100) : 100, /*#__PURE__*/React.createElement("i", null, "%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Ошибки"), /*#__PURE__*/React.createElement("strong", null, errors)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "Прогресс"), /*#__PURE__*/React.createElement("strong", null, Math.round(index / task.text.length * 100), /*#__PURE__*/React.createElement("i", null, "%")))), /*#__PURE__*/React.createElement("div", {
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
const LMS_ASSIGN_CSS = ".la-box,.la-drawer,.la-launcher{--la-bg:#171d2d;--la-paper:#20273a;--la-line:#a994d62c;--la-text:#edf0fa;--la-muted:#a3acc3;--la-accent:#b49aea;--la-ink:#20162f;font-family:inherit;color-scheme:dark}.la-box{background:var(--la-bg);color:var(--la-text);border:1px solid var(--la-line);border-radius:20px;padding:23px;margin:0 0 20px;min-width:0}.la-box *{box-sizing:border-box}.la-box h3,.la-box h4,.la-box p{margin:0}.la-box header{display:flex;align-items:center;gap:12px;margin-bottom:18px}.la-box header>div{flex:1;min-width:0}.la-box h3{font-size:22px;margin-top:4px}.la-box h4{font-size:15px;overflow-wrap:anywhere;line-height:1.5}.la-box p{font-size:12px;line-height:1.7;color:var(--la-muted);margin:9px 0}.la-box small{font-size:10px;color:var(--la-muted);line-height:1.6}.la-box button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;height:auto;margin:0;padding:10px 13px;border:1px solid var(--la-line);border-radius:11px;background:var(--la-paper);color:var(--la-text);font-family:inherit;font-size:12px;line-height:1.4;font-weight:600;cursor:pointer;box-shadow:none;text-transform:none;transition:background .18s,transform .18s}.la-box button:hover:not(:disabled){border-color:var(--la-accent)}.la-box button:active:not(:disabled){transform:scale(.97)}.la-box button:disabled{opacity:.45;cursor:default}.la-box .la-primary{background:var(--la-accent);color:var(--la-ink);border-color:transparent}.la-box :focus-visible,.la-launcher:focus-visible{outline:2px solid var(--la-accent);outline-offset:3px}.la-cards{display:grid;grid-template-columns:1fr;gap:12px}.la-cards article{background:var(--la-paper);border:1px solid var(--la-line);border-radius:15px;padding:17px;animation:la-card-in .2s ease-out}.la-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:10px;color:var(--la-muted)}.la-state{padding:4px 7px;background:#a68bd614;color:var(--la-accent);border-radius:7px;font-size:9px;white-space:nowrap}.la-state.done{color:#55b699;background:#55b69915}.la-state.help,.la-state.late{color:#e4aa73;background:#e4aa7312}.la-actions{display:flex;gap:8px;margin-top:15px;flex-wrap:wrap}.la-actions button{flex:1}.la-instruction{border-left:2px solid var(--la-line);padding-left:10px;white-space:pre-wrap;overflow-wrap:anywhere}.la-card-result{font-size:11px;color:var(--la-accent);padding-top:10px;margin-top:10px;border-top:1px solid var(--la-line)}.la-error{color:#e889a2!important;font-size:11px!important;overflow-wrap:anywhere}.la-metrics{display:flex;gap:12px;flex-wrap:wrap;padding:13px;background:var(--la-paper);border-radius:12px;font-size:12px}.la-text{max-height:250px;overflow:auto;font:23px/1.8 ui-monospace,monospace;margin:18px 0;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin}.la-text .done{color:var(--la-accent)}.la-text .current{background:var(--la-accent);color:var(--la-ink);border-radius:3px}.la-text .wrong{background:#ee9bb5}.la-input{display:block;width:100%;border:1px solid var(--la-line);background:var(--la-paper);color:inherit;font-family:inherit;font-size:16px;padding:13px;border-radius:11px;margin-top:8px}.la-box label{font-size:12px}\n.la-launcher{position:fixed!important;right:0!important;left:auto!important;top:42%;z-index:1100;display:grid;place-items:center;width:44px;height:50px;min-height:50px;margin:0!important;padding:0;border:1px solid var(--la-line);border-right:0;border-radius:15px 0 0 15px!important;background:var(--la-bg);color:var(--la-accent);cursor:pointer;box-shadow:-4px 5px 20px #0001;transition:width .2s,background .2s;transform:none}.la-launcher:hover{width:50px;background:var(--la-paper)}.la-launcher:active{width:46px}.la-launcher svg{display:block;flex-shrink:0}\n.la-drawer{padding:0;border:1px solid var(--la-line);border-right:0;border-radius:22px 0 0 22px;width:min(430px,calc(100vw - 12px));max-width:none;height:100dvh;max-height:100dvh;margin:0 0 0 auto;inset:0;overflow:hidden;background:var(--la-bg);color:var(--la-text);box-shadow:-20px 0 70px #0003}.la-drawer::backdrop{background:#080c1955;backdrop-filter:blur(4px)}.la-drawer[open]{animation:la-slide .26s cubic-bezier(.2,.8,.2,1)}.la-drawer.la-closing{animation:la-slide-out .19s ease-in forwards}.la-drawer .la-box{height:100%;display:flex;flex-direction:column;border:0;border-radius:0;margin:0;padding:0;background:var(--la-bg)}.la-drawer header{margin:0;padding:24px 21px 20px;border-bottom:1px solid var(--la-line);flex-shrink:0}.la-drawer header small{font-size:9px;letter-spacing:1.2px}.la-header-icon{width:37px;height:37px;display:grid;place-items:center;border-radius:12px;color:var(--la-accent);background:#a68bd614;font-size:19px}.la-drawer .la-close{display:grid;place-items:center;width:33px;height:33px;min-height:33px;padding:0;font-size:22px;border-radius:10px;flex-shrink:0}.la-drawer-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 21px;flex-shrink:0;font-size:11px;color:var(--la-muted)}.la-drawer-toolbar select{font-family:inherit;font-size:11px;border:1px solid var(--la-line);border-radius:9px;background:var(--la-paper);color:var(--la-text);padding:8px;max-width:180px}.la-drawer-toolbar option{background:var(--la-bg);color:var(--la-text)}.la-drawer-scroll{overflow:auto;min-height:0;flex:1;padding:18px 21px;scrollbar-width:thin;scrollbar-color:var(--la-line) transparent;overscroll-behavior:contain}.la-drawer-footer{padding:14px 21px;border-top:1px solid var(--la-line);color:var(--la-muted);font-size:10px;line-height:1.6;flex-shrink:0}.la-empty{display:flex;align-items:center;gap:14px;padding:20px 15px;border:1px dashed var(--la-line);border-radius:14px}.la-empty>span{display:grid;place-items:center;width:38px;height:38px;flex-shrink:0;border-radius:12px;background:#a68bd610;color:var(--la-accent)}.la-empty h4{font-size:13px}.la-empty p{font-size:11px;margin:5px 0 0}.la-sr{position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden}\n:is(html.light,body.light,.theme-light,[data-theme=light]) :is(.la-box,.la-drawer,.la-launcher){--la-bg:#faf9ff;--la-paper:#f0ecf7;--la-line:#7054932c;--la-text:#293047;--la-muted:#6b7288;--la-accent:#7954c0;--la-ink:#fff;color-scheme:light}@keyframes la-slide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}@keyframes la-slide-out{to{opacity:0;transform:translateX(30px)}}@keyframes la-card-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@media(max-width:520px){.la-box{padding:17px}.la-box h3{font-size:19px}.la-text{font-size:20px}.la-drawer header{padding:20px 16px 17px}.la-drawer-scroll{padding:16px}.la-drawer-toolbar{padding:14px 16px}.la-drawer-footer{padding:13px 16px}.la-launcher{width:39px;height:46px;min-height:46px}.la-cards article{padding:15px}}@media(prefers-reduced-motion:reduce){.la-drawer[open],.la-drawer.la-closing,.la-cards article{animation:none}.la-launcher,.la-box button{transition:none}}\n/* Same edge-tab proportions as folded LMS AI assistant */\n.la-launcher{width:32px!important;height:60px!important;min-width:0!important;min-height:60px!important;border-radius:16px 0 0 16px!important;box-shadow:0 4px 16px #0002;border-color:var(--la-line);background:var(--la-bg);transition:background .2s,box-shadow .2s!important}.la-launcher:hover{width:32px!important;background:var(--la-paper);box-shadow:-3px 4px 20px #a68bd62a}.la-launcher:active{width:32px!important}.la-launcher svg{width:19px;height:19px}.la-launcher:focus-visible{outline-offset:-3px}\n@media(prefers-reduced-motion:reduce){.la-launcher{transition:none!important}}\n.la-box button,.la-drawer button{height:auto!important;max-height:none!important;min-height:42px;line-height:1.5;white-space:normal}.la-box .la-close{width:36px;min-height:36px;height:36px!important;flex-shrink:0}.la-drawer{width:min(420px,100vw)!important;max-width:100vw!important;overflow:clip}.la-box{width:100%;min-width:0}.la-cards article{height:auto;min-width:0}.la-drawer-toolbar{gap:10px;flex-wrap:wrap}.la-drawer-toolbar label{min-width:0;flex:1}.la-drawer-toolbar select{width:100%;height:42px;min-width:0;background:var(--la-paper);color:var(--la-text);border:1px solid var(--la-line);border-radius:10px;padding:8px}.la-help-form,.la-help-history{margin-top:12px;padding:12px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-paper);font-size:12px}.la-help-form label{display:grid;gap:6px}.la-help-form textarea{width:100%;min-height:85px;resize:vertical;height:auto;border:1px solid var(--la-line);background:var(--la-bg);color:var(--la-text);border-radius:10px;padding:10px;font:inherit}.la-help-history p{white-space:pre-wrap;overflow-wrap:anywhere}.la-notice{color:var(--la-accent);line-height:1.6}.la-box [hidden]{display:none!important}.la-active{width:100%;max-width:800px;margin:0 auto 16px;padding:16px;border:1px solid var(--la-line,#a994d62c);border-radius:14px;background:var(--input-bg,#20273a);color:var(--text-main,#edf0fa);font:13px/1.6 inherit}.la-active h4{margin:0 0 5px}.la-active p{margin:5px 0}.la-active button{height:auto;min-height:40px;padding:8px 12px;border-radius:9px;background:#a68bd620;color:inherit;border:1px solid #a994d62c}.la-active small{display:block}.la-active strong{color:var(--text-main,inherit)}\n@media(max-width:480px){.la-drawer{border-radius:0!important}.la-actions{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}.la-actions button{width:100%}.la-card-top{flex-wrap:wrap}.la-box>header{padding:16px;gap:10px}.la-box>header h3{font-size:19px}}\n.assignment-ai{margin-top:14px;border:1px solid var(--ax-line,var(--la-line));border-radius:12px;overflow:hidden;font-size:12px;background:var(--ax-input,var(--la-paper));color:var(--ax-text,var(--la-text))}.assignment-ai summary{cursor:pointer;padding:13px;color:var(--ax-accent,var(--la-accent));font-weight:600;min-height:44px}.assignment-ai>div{padding:0 13px 13px}.assignment-ai label{display:grid;gap:6px}.assignment-ai textarea{width:100%;min-height:80px;height:auto;max-height:200px;resize:vertical;border:1px solid var(--ax-line,var(--la-line));border-radius:10px;padding:10px;background:var(--ax-bg,var(--la-bg));color:inherit;font:inherit;margin:7px 0}.assignment-ai button{height:auto!important;min-height:40px;border:1px solid var(--ax-line,var(--la-line));border-radius:9px;background:var(--ax-paper,var(--la-paper));color:inherit;font:inherit;padding:10px;line-height:1.4}.assignment-ai button:disabled{opacity:.5}.assignment-ai-actions{display:flex;gap:8px;flex-wrap:wrap}.assignment-ai .assignment-ai-answer{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;margin:12px 0}.assignment-ai small{display:block;margin-top:8px;font-size:10px;color:var(--ax-muted,var(--la-muted))}\n/* Compose form: field and actions have independent layout boxes. */\n.la-box .la-help-form{padding:14px;background:var(--la-paper);border-radius:15px;display:flex;flex-direction:column;gap:12px;min-width:0}.la-help-form>label{display:flex!important;flex-direction:column;gap:9px;margin:0!important;min-width:0;font-size:12px;font-weight:600}.la-box .la-help-form textarea{box-sizing:border-box!important;display:block;width:100%!important;max-width:100%!important;height:112px!important;min-height:90px;max-height:230px;padding:12px!important;margin:0!important;border-radius:12px;resize:vertical;font-size:14px;line-height:1.6;outline:none}.la-box .la-help-form textarea:focus{border-color:var(--la-accent);box-shadow:0 0 0 3px #a68bd61c;outline:none}.la-help-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--la-line);padding-top:12px}.la-help-footer small{font-size:10px;white-space:nowrap}.la-box .la-help-footer button{margin:0!important;min-height:40px;padding:9px 13px;border-radius:10px;font-size:12px;background:var(--la-accent);color:var(--la-ink);border:0;line-height:1.4}.la-box .la-help-footer button:disabled{opacity:.45}.la-help-history{line-height:1.6}\n/* Assigned typing workspace */\n.la-box.la-run{width:100%;max-width:1040px;margin:0 auto 24px;padding:24px;border-radius:24px;background:radial-gradient(ellipse at top left,#a68bd60c,transparent 65%),var(--la-bg);box-shadow:0 20px 60px #0000000d}.la-run .la-run-head{padding:0;margin:0 0 22px;align-items:flex-start;gap:18px}.la-run-head small{font-size:9px;letter-spacing:1.2px;color:var(--la-accent)}.la-run .la-run-head h3{font-size:24px;letter-spacing:-.6px;line-height:1.35;overflow-wrap:anywhere;margin:7px 0 0}.la-run-head button{flex-shrink:0;min-height:40px;padding:9px 13px;background:var(--la-paper);font-size:12px;border-radius:11px}.la-run-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px}.la-run-metrics>div{min-width:0;border:1px solid var(--la-line);border-radius:14px;padding:13px 15px;background:var(--la-paper)}.la-run-metrics small{font-size:10px;color:var(--la-muted)}.la-run-metrics strong{display:block;margin-top:5px;font-size:26px;line-height:1.2;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.5px}.la-run-metrics>div:nth-child(2) strong{color:var(--la-accent)}.la-run-metrics i{font-size:14px;font-style:normal;margin-left:3px;color:var(--la-muted)}.la-run-paper{border:1px solid var(--la-line);border-radius:16px;padding:18px 20px;background:var(--la-paper);overflow:hidden}.la-run-text-head{display:flex;justify-content:space-between;gap:12px;color:var(--la-muted);font-size:10px;line-height:1.5;margin-bottom:12px}.la-run .la-text{font:21px/1.85 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--la-muted);letter-spacing:0;min-height:100px;max-height:260px;margin:0;padding:2px 1px;white-space:pre-wrap;overflow-wrap:anywhere;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--la-line) transparent}.la-run .la-text .done{color:var(--la-text)}.la-run .la-text .current{color:var(--la-ink);background:var(--la-accent);border-radius:3px;box-shadow:0 0 0 2px #a68bd622}.la-run .la-text .wrong{background:#c65070;color:#fff}.la-run-progress{height:4px;background:var(--la-line);margin-top:16px;border-radius:4px;overflow:hidden}.la-run-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--la-accent),#69bfa8);transition:width .15s ease}.la-run .la-run-capture{display:grid;gap:7px;margin-top:20px;font-size:12px;font-weight:600}.la-run-capture>span{font-size:11px;color:var(--la-muted);font-weight:400}.la-run .la-run-capture input{margin:4px 0 0!important;padding:13px 15px!important;height:50px!important;min-height:50px;width:100%;max-width:100%;border-radius:12px;background:var(--la-paper);border:1px solid var(--la-line);font-size:16px;box-shadow:none;outline:none;transition:border-color .2s,box-shadow .2s}.la-run .la-run-capture input:focus{border-color:var(--la-accent);box-shadow:0 0 0 3px #a68bd61c}.la-run-capture.has-error>span{color:#df7891}.la-run .la-run-capture input[aria-invalid=true]{border-color:#df7891}.la-run .la-run-note{font-size:10px;line-height:1.7;margin:12px 0 0;color:var(--la-muted)}.la-run-status{padding:14px;margin-top:16px;border:1px solid var(--la-line);border-radius:12px;background:var(--la-paper);font-size:12px;line-height:1.6}.la-run-status.passed{border-color:#52b79055;background:#52b79010}.la-run .la-actions{margin-top:12px}.la-run{animation:la-slide .25s ease both}\n@media(max-width:600px){.la-box.la-run{padding:16px;border-radius:18px}.la-run .la-run-head{gap:12px;margin-bottom:16px;flex-wrap:wrap}.la-run .la-run-head>div{flex-basis:100%}.la-run .la-run-head h3{font-size:20px}.la-run-head button{margin-left:auto!important}.la-run-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}.la-run-metrics>div{padding:11px 13px}.la-run-metrics strong{font-size:24px}.la-run-paper{padding:13px}.la-run .la-text{font-size:18px;line-height:1.8;max-height:235px}.la-run-text-head{font-size:9px;flex-wrap:wrap;gap:5px}.la-run .la-run-capture{margin-top:16px}.la-box .la-help-form{padding:12px}.la-help-footer{gap:8px}.la-box .la-help-footer button{font-size:11px;padding:9px 11px}}\n@media(prefers-reduced-motion:reduce){.la-run{animation:none}.la-run-progress i,.la-run .la-run-capture input{transition:none}}\n/* Page in the main menu, plus compact assignment context. */\n.la-box{box-sizing:border-box}\n.la-page{max-width:1100px;margin:0 auto 24px;padding:26px;animation:la-card-in .25s ease both}.la-page-head{align-items:center!important}.la-page-icon,.la-active-emblem{display:grid;place-items:center;width:44px;height:44px;flex-shrink:0;border:1px solid var(--la-line);border-radius:14px;background:#a68bd61a;color:var(--la-accent);font-size:22px}.la-page-head p{font-size:11px;margin:6px 0 0}.la-page-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:20px 0;padding:14px 0;border-block:1px solid var(--la-line);color:var(--la-muted);font-size:12px}.la-page-toolbar select{font:inherit;height:40px;max-width:100%;padding:8px 12px;border:1px solid var(--la-line);border-radius:11px;background:var(--la-paper);color:var(--la-text)}.la-page-cards{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.la-page-cards article{min-width:0}.la-page-head button{flex-shrink:0}.la-box.la-active{max-width:1100px;padding:20px 22px;margin:0 auto 20px;background:linear-gradient(110deg,#a68bd608,transparent),var(--la-bg);border-radius:20px;font-family:inherit;font-size:13px;line-height:1.6;animation:la-card-in .25s ease}.la-active-top{display:flex;align-items:center;gap:12px}.la-active-title{flex:1;min-width:0}.la-active-title small{font-size:9px;letter-spacing:1px;color:var(--la-accent)}.la-active-title h4{font-size:17px;margin-top:4px;line-height:1.4}.la-active-top button{flex-shrink:0;font-size:11px}.la-active-bottom{display:grid;grid-template-columns:minmax(0,1fr) 200px;align-items:center;gap:24px;margin-top:16px;padding-top:14px;border-top:1px solid var(--la-line)}.la-box .la-active-bottom p{font-size:11px;line-height:1.7;margin:0;max-width:660px}.la-active-meter>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:10px;color:var(--la-muted)}.la-active-meter strong{font-size:15px;color:var(--la-text)}.la-active-meter .la-run-progress{margin-top:7px;height:5px}.la-active-details{margin-top:16px;border:1px solid var(--la-line);border-radius:12px;overflow:hidden;background:var(--la-paper)}.la-active-details summary{display:flex;justify-content:space-between;gap:10px;padding:11px 14px;font-size:11px;font-weight:600;cursor:pointer;color:var(--la-accent);list-style:none}.la-active-details summary::-webkit-details-marker{display:none}.la-active-details summary span{transition:transform .2s}.la-active-details[open] summary span{transform:rotate(180deg)}.la-box .la-active-details p{font-size:12px;line-height:1.8;margin:0;padding:0 14px 14px;white-space:pre-wrap;overflow-wrap:anywhere;animation:la-card-in .2s ease}.la-box .la-active-notice{padding:10px 12px;border-radius:10px;background:var(--la-paper);font-size:11px;margin:12px 0 0}\n@media(max-width:700px){.la-page-cards{grid-template-columns:minmax(0,1fr)}.la-page{padding:16px}.la-page .la-page-head{padding:0;flex-wrap:wrap}.la-page-head>div{flex-basis:calc(100% - 65px)!important}.la-page-head button{margin-left:auto}.la-page-toolbar{flex-wrap:wrap;font-size:11px}.la-box.la-active{padding:16px}.la-active-top{flex-wrap:wrap;gap:10px}.la-active-title{flex-basis:calc(100% - 60px)}.la-active-top button{margin-left:auto}.la-active-bottom{grid-template-columns:minmax(0,1fr);gap:14px}.la-active-title h4{font-size:16px}}\n@media(prefers-reduced-motion:reduce){.la-page,.la-box.la-active,.la-active-details p{animation:none}.la-active-details summary span{transition:none}}\n.la-run .la-run-capture input:focus{border-color:var(--la-accent)!important}.la-run .la-run-capture input[aria-invalid=true]{border-color:#df7891!important}\n";
const LMS_ASSIGN_DRAWER_CSS = "";
function AssignmentActive({
  task,
  uid,
  onClose
}) {
  const [progress, setProgress] = React.useState(null),
    [notice, setNotice] = React.useState('');
  React.useEffect(() => window.db.collection('lmsAssignments').doc(task.id).collection('progress').doc(uid).onSnapshot(s => setProgress(s.data()), e => setNotice(e.message)), [task.id, uid]);
  React.useEffect(() => {
    const f = e => {
      if (e.detail?.id === task.id) setNotice(e.detail.message);
    };
    window.addEventListener('lms-assignment-feedback', f);
    return () => window.removeEventListener('lms-assignment-feedback', f);
  }, [task.id]);
  const done = progress?.status === 'completed' && progress?.receiptVersion === 2,
    count = progress?.result?.count || 0,
    total = task.target || 1,
    percent = Math.min(100, Math.round(count / total * 100));
  return /*#__PURE__*/React.createElement("section", {
    className: "la-box la-active"
  }, /*#__PURE__*/React.createElement("style", null, LMS_ASSIGN_CSS), /*#__PURE__*/React.createElement("div", {
    className: "la-active-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "la-active-emblem",
    "aria-hidden": "true"
  }, done ? '✓' : task.module === 'excel' ? 'ƒx' : '⌘'), /*#__PURE__*/React.createElement("div", {
    className: "la-active-title"
  }, /*#__PURE__*/React.createElement("small", null, "ЗАДАНИЕ · ", LMS_TASK_MODULES[task.module]), /*#__PURE__*/React.createElement("h4", null, task.title)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose
  }, "К заданиям ", /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "↗"))), /*#__PURE__*/React.createElement("div", {
    className: "la-active-bottom"
  }, /*#__PURE__*/React.createElement("p", null, task.module === 'hotkeys' ? `Серия от 5 сочетаний: без ошибок, подсказок и пропусков. Категория: ${{
    word: 'Word',
    windows: 'Windows',
    excel: 'Excel',
    any: 'любая'
  }[task.hotkeyBank || 'any']}.` : 'Решайте задачи в тренажёре самостоятельно. Ответы после просмотра решения не засчитываются.'), /*#__PURE__*/React.createElement("div", {
    className: "la-active-meter"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, done ? 'Выполнено' : 'Ваш прогресс'), /*#__PURE__*/React.createElement("strong", null, count, " / ", total)), /*#__PURE__*/React.createElement("div", {
    className: "la-run-progress",
    role: "progressbar",
    "aria-label": "Выполнение задания",
    "aria-valuemin": 0,
    "aria-valuemax": total,
    "aria-valuenow": Math.min(count, total)
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: percent + '%'
    }
  })))), task.text && /*#__PURE__*/React.createElement("details", {
    className: "la-active-details"
  }, /*#__PURE__*/React.createElement("summary", null, "Инструкция преподавателя ", /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "⌄")), /*#__PURE__*/React.createElement("p", null, task.text)), notice && /*#__PURE__*/React.createElement("p", {
    className: "la-active-notice",
    role: "status"
  }, notice));
}
function App() {
  const [assignedTask, setAssignedTask] = useState(null);
  useEffect(() => {
    setAssignedTask(null);
  }, [window.auth?.currentUser?.uid]);
  const DEFAULT_MODULES = ['assignments', 'chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'chess', 'stats'];
  const [view, setView] = useState('loading');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [fp, setFp] = useState('');

  // ВАЖНО:
  // user становится не null только ПОСЛЕ того,
  // как профиль Firestore подтверждён и загружен.
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [userNickname, setUserNickname] = useState('');
  const [userData, setUserData] = useState(null);

  // null = Firebase ещё не подтвердил эти данные.
  const [teacherTests, setTeacherTests] = useState(null);
  const [allowedModules, setAllowedModules] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [profileRetry, setProfileRetry] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isAdmin = userRole === 'admin';
  const appReady = !isAuthLoading && !!user && !!userData && Array.isArray(teacherTests) && Array.isArray(allowedModules);

  // Показывается ли сейчас бургер — от этого зависит верхний отступ контента
  const showLauncher = appReady && LAUNCHER_VIEWS.includes(view);

  // -----------------------------------------------------------------------
  // ЛОКАЛЬНЫЕ ДАННЫЕ
  // -----------------------------------------------------------------------

  const loadData = () => {
    try {
      const raw = localStorage.getItem('test_sets_list');
      setSets(raw ? JSON.parse(raw) : []);
      if (!raw) {
        localStorage.setItem('test_sets_list', JSON.stringify([]));
      }
      setHistory(JSON.parse(localStorage.getItem('test_history_v1') || '[]'));
    } catch (error) {
      window.reportLmsError?.(error, {
        "section": "platform",
        "source": "7_app.js",
        "line": 250,
        "operation": "caught",
        "handled": true
      });
      console.error('[Ultimate LMS Local Data]', error);
      setSets([]);
      setHistory([]);
    }
  };

  // -----------------------------------------------------------------------
  // ПРИМЕНЕНИЕ ПОДТВЕРЖДЁННОГО ПРОФИЛЯ
  // -----------------------------------------------------------------------

  const applyProfile = (currentUser, data) => {
    const modules = data?.allowedModules == null ? DEFAULT_MODULES : Array.isArray(data.allowedModules) ? data.allowedModules : [];
    const assigned = Array.isArray(data?.assignedTests) ? data.assignedTests : [];
    setUserData({
      uid: currentUser.uid,
      ...data
    });
    setUserRole(data?.role || 'student');
    setUserNickname(data?.nickname || '');
    setTeacherTests(assigned);
    setAllowedModules(modules);

    // Только здесь пользователь считается полностью готовым.
    setUser(currentUser);
  };

  // -----------------------------------------------------------------------
  // FIREBASE AUTH + ПРОФИЛЬ FIRESTORE
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!window.auth || !window.db) {
      setAuthError('Firebase не подключён. Проверьте инициализацию Auth и Firestore.');
      setIsAuthLoading(false);
      return;
    }
    let active = true;
    let profileUnsubscribe = null;
    let authSequence = 0;
    let controller = null;
    const publishReady = value => {
      window.__lmsProfileReady = value;
      window.dispatchEvent(new CustomEvent('lms:profile-ready', {
        detail: value
      }));
    };
    const clearProfileListener = () => {
      if (typeof profileUnsubscribe === 'function') {
        profileUnsubscribe();
      }
      profileUnsubscribe = null;
    };
    const resetProfile = () => {
      setUser(null);
      setUserData(null);
      setUserRole('student');
      setUserNickname('');
      setTeacherTests(null);
      setAllowedModules(null);
      setIsSidebarOpen(false);
      setIsChatOpen(false);
    };
    const unsubscribeAuth = window.auth.onAuthStateChanged(async currentUser => {
      const sequence = ++authSequence;
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      publishReady(null);
      clearProfileListener();
      setAuthError('');
      setIsAuthLoading(true);
      resetProfile();
      if (!currentUser) {
        if (!active || sequence !== authSequence) return;
        setView('menu');
        setIsAuthLoading(false);
        return;
      }
      const profileRef = window.db.collection('users').doc(currentUser.uid);
      try {
        if (typeof window.ensureLmsUserProfile !== 'function') {
          throw new Error('Модуль 3_auth_admin.js не загружен');
        }
        let initialData;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            initialData = await window.ensureLmsUserProfile(currentUser, {
              signal
            });
            break;
          } catch (error) {
            window.reportLmsError?.(error, {
              "section": "platform",
              "source": "7_app.js",
              "line": 338,
              "operation": "caught",
              "handled": true
            });
            const code = String(error?.code || '').split('/').pop();
            const temporary = ['unavailable', 'deadline-exceeded', 'aborted', 'network-request-failed'].includes(code);
            if (!temporary || attempt === 2 || signal.aborted) throw error;
            await new Promise(resolve => {
              const finish = () => {
                clearTimeout(timer);
                signal.removeEventListener('abort', finish);
                resolve();
              };
              const timer = setTimeout(finish, 700 * (attempt + 1));
              signal.addEventListener('abort', finish, {
                once: true
              });
              if (signal.aborted) finish();
            });
            if (signal.aborted) throw error;
          }
        }
        if (!active || sequence !== authSequence) return;
        if (initialData?.isBanned === true) {
          const error = new Error('Аккаунт заблокирован');
          error.code = 'lms/account-banned';
          throw error;
        }
        applyProfile(currentUser, initialData);
        setView('menu');
        setIsAuthLoading(false);
        publishReady({
          uid: currentUser.uid
        });
        profileUnsubscribe = profileRef.onSnapshot({
          includeMetadataChanges: true
        }, async snapshot => {
          if (!active || sequence !== authSequence) return;
          if (snapshot.metadata?.fromCache || snapshot.metadata?.hasPendingWrites) return;
          if (!snapshot.exists) {
            publishReady(null);
            resetProfile();
            setAuthError('Профиль отсутствует. Обратитесь к преподавателю.');
            return;
          }
          const data = snapshot.data() || {};
          if (data.isBanned === true) {
            publishReady(null);
            setIsSidebarOpen(false);
            setIsChatOpen(false);
            resetProfile();
            try {
              await window.auth.signOut();
            } catch (signOutError) {
              window.reportLmsError?.(signOutError, {
                "section": "platform",
                "source": "7_app.js",
                "line": 382,
                "operation": "caught",
                "handled": true
              });
              console.error('[Ultimate LMS SignOut]', signOutError);
            }
            alert('Доступ закрыт! Вы были исключены администратором.');
            return;
          }
          applyProfile(currentUser, data);
        }, error => {
          window.reportLmsError?.(error, {
            "section": "platform",
            "source": "7_app.js",
            "line": 389,
            "operation": "snapshot",
            "handled": true
          });
          console.error('[Ultimate LMS Profile Snapshot]', error);
          if (!active || sequence !== authSequence) return;
          publishReady(null);
          resetProfile();
          setAuthError('Не удалось обновить профиль (' + (error.code || 'unknown') + '). Нажмите «Повторить».');
        });
      } catch (error) {
        window.reportLmsError?.(error, {
          "section": "platform",
          "source": "7_app.js",
          "line": 396,
          "operation": "caught",
          "handled": true
        });
        console.error('[Ultimate LMS Profile Bootstrap]', error);
        if (!active || sequence !== authSequence) return;
        publishReady(null);
        resetProfile();
        if (error?.code === 'lms/account-banned') {
          setAuthError('Ваш аккаунт заблокирован. Обратитесь к преподавателю.');
          try {
            await window.auth.signOut();
          } catch (_) {}
        } else if (String(error?.code || '').includes('unavailable') || String(error?.code || '').includes('network')) {
          setAuthError('Не удалось получить актуальные данные с Firebase. Проверьте интернет и повторите.');
        } else if (String(error?.code || '').includes('permission-denied')) {
          setAuthError('Нет доступа к профилю пользователя. Проверьте правила Firestore.');
        } else {
          setAuthError('Не удалось загрузить профиль пользователя. Нажмите «Повторить».');
        }
        setIsAuthLoading(false);
      }
    });
    return () => {
      active = false;
      authSequence++;
      controller?.abort();
      publishReady(null);
      clearProfileListener();
      unsubscribeAuth?.();
    };
  }, [profileRetry]);

  // -----------------------------------------------------------------------
  // ЕСЛИ АДМИН ОТКЛЮЧИЛ МОДУЛЬ, ПОКА УЧЕНИК НАХОДИТСЯ В НЁМ
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!appReady) {
      window.__lmsAssignmentContext = null;
      return;
    }
    if (!assignedTask || view !== assignedTask.module || !allowedModules.includes('assignments') || !allowedModules.includes(assignedTask.module)) {
      window.__lmsAssignmentContext = null;
      if (assignedTask) setAssignedTask(null);
    }
    if (!allowedModules.includes('assignments') && assignedTask) {
      setAssignedTask(null);
    }
    const viewModule = {
      assignments: 'assignments',
      stats: 'stats',
      typing: 'typing',
      hotkeys: 'hotkeys',
      code: 'code',
      flashcards: 'flashcards',
      excel: 'excel',
      chess: 'chess'
    };
    const requiredModule = viewModule[view];
    if (requiredModule && !allowedModules.includes(requiredModule)) {
      setView('menu');
    }
    if (view === 'admin' && !isAdmin) {
      setView('menu');
    }
    if (isChatOpen && !allowedModules.includes('chat')) {
      setIsChatOpen(false);
    }
  }, [appReady, view, allowedModules, isAdmin, isChatOpen]);

  // -----------------------------------------------------------------------
  // УСТРОЙСТВО + ЛОКАЛЬНАЯ ИСТОРИЯ
  // -----------------------------------------------------------------------

  useEffect(() => {
    let alive = true;
    document.onkeydown = function (e) {
      if (e.keyCode === 123) return false;
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 'I'.charCodeAt(0) || e.keyCode === 'C'.charCodeAt(0))) {
        return false;
      }
    };
    loadData();
    async function prepareDevice() {
      try {
        if (typeof computeFingerprint === 'function') {
          const fingerprint = await computeFingerprint();
          if (alive) {
            setFp(fingerprint);
          }
        }
      } catch (error) {
        window.reportLmsError?.(error, {
          "section": "platform",
          "source": "7_app.js",
          "line": 474,
          "operation": "caught",
          "handled": true
        });
        console.warn('[Ultimate LMS Fingerprint]', error);
      }
    }
    prepareDevice();
    return () => {
      alive = false;
      document.onkeydown = null;
    };
  }, []);
  useEffect(() => {
    if (isAuthLoading) return;
    if (typeof logVisitor === 'function') {
      logVisitor().catch?.(error => {
        console.warn('[Ultimate LMS Visitor]', error);
      });
    }
  }, [isAuthLoading, user?.uid]);
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // -----------------------------------------------------------------------
  // ОТСЛЕЖИВАНИЕ АКТИВНОСТИ И ТЕКУЩЕГО ЭКРАНА ДЛЯ ТРЕКЕРА
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!user?.uid || ['loading', 'login', 'auth'].includes(view)) return;
    const sections = {
      menu: 'menu',
      set_menu: 'tests',
      timer_setup: 'tests',
      review: 'tests',
      tests: 'tests',
      test: 'tests',
      quiz: 'tests',
      testing: 'tests',
      test_setup: 'tests',
      test_result: 'tests',
      result: 'tests',
      results: 'tests',
      typing: 'typing',
      hotkeys: 'hotkeys',
      flashcards: 'flashcards',
      code: 'code',
      excel: 'excel',
      chess: 'chess',
      stats: 'stats',
      admin: 'admin'
    };
    const detail = {
      section: isChatOpen ? 'chat' : sections[view] || view || 'platform',
      view: isChatOpen ? 'chat' : view
    };
    // Сохраняем текущий экран даже если трекер подключится чуть позже.
    window.__lmsCurrentSection = detail;
    if (typeof window.trackLmsSection === 'function') {
      window.trackLmsSection(detail.section, detail);
    } else {
      window.dispatchEvent(new CustomEvent('lms:section', {
        detail
      }));
    }
  }, [view, isChatOpen, user?.uid]);

  // -----------------------------------------------------------------------
  // ЛОКАЛЬНЫЕ НАБОРЫ ТЕСТОВ
  // -----------------------------------------------------------------------

  const chessInviteHandled = useRef(false);
  useEffect(() => {
    if (!appReady || chessInviteHandled.current) return;
    const room = new URLSearchParams(location.search).get('chessRoom');
    if (room && /^[a-f0-9]{12}$/i.test(room) && allowedModules.includes('chess')) {
      chessInviteHandled.current = true;
      setView('chess');
    }
  }, [appReady, allowedModules]);
  const addSet = name => {
    if (!name) return;
    if (sets.includes(name)) return alert('Уже есть!');
    const newSets = [...sets, name];
    setSets(newSets);
    localStorage.setItem('test_sets_list', JSON.stringify(newSets));
    localStorage.setItem('tests_' + name, JSON.stringify([]));
  };
  const deleteSet = name => {
    const newSets = sets.filter(s => s !== name);
    setSets(newSets);
    localStorage.setItem('test_sets_list', JSON.stringify(newSets));
    localStorage.removeItem('tests_' + name);
  };
  const openSet = name => {
    setCurrentSet(name);
    setTests(JSON.parse(localStorage.getItem('tests_' + name)) || []);
    setView('set_menu');
  };
  const openTeacherAssignedTest = testInfo => {
    setCurrentSet(testInfo.title);
    setTests(Array.isArray(testInfo.data) ? testInfo.data : []);
    setView('set_menu');
  };
  const removeTeacherTestStudent = async (testId, testTitle) => {
    if (!user?.uid || !Array.isArray(teacherTests)) return;
    try {
      const updatedTests = teacherTests.filter(t => t.id !== testId);
      await window.db.collection('users').doc(user.uid).update({
        assignedTests: updatedTests
      });
    } catch (error) {
      window.reportLmsError?.(error, {
        "section": "platform",
        "source": "7_app.js",
        "line": 585,
        "operation": "caught",
        "handled": true
      });
      console.error('[Ultimate LMS Remove Assigned Test]', error);
      alert('Ошибка при удалении теста');
    }
  };
  const changeNickname = async () => {
    if (!user?.uid) return;
    const newNick = prompt('Введите ваш новый никнейм (будет виден в чате):', userNickname || '');
    if (!newNick || !newNick.trim()) return;
    try {
      await window.db.collection('users').doc(user.uid).update({
        nickname: newNick.trim()
      });
    } catch (error) {
      window.reportLmsError?.(error, {
        "section": "platform",
        "source": "7_app.js",
        "line": 598,
        "operation": "caught",
        "handled": true
      });
      console.error('[Ultimate LMS Nickname]', error);
      alert('Ошибка при сохранении никнейма!');
    }
  };

  // -----------------------------------------------------------------------
  // GOOGLE LOGIN
  // -----------------------------------------------------------------------

  const handleDirectLogin = async () => {
    try {
      setAuthError('');
      if (typeof window.lmsGoogleSignIn === 'function') {
        await window.lmsGoogleSignIn();
        return;
      }
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await window.auth.signInWithPopup(provider);
    } catch (error) {
      window.reportLmsError?.(error, {
        "section": "platform",
        "source": "7_app.js",
        "line": 621,
        "operation": "caught",
        "handled": true
      });
      console.error('[Ultimate LMS Google Auth]', error);
      const ignoredErrors = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
      if (ignoredErrors.includes(error?.code)) {
        return;
      }
      if (error?.code === 'auth/popup-blocked') {
        alert('Браузер заблокировал окно Google. Разрешите всплывающие окна для этого сайта.');
        return;
      }
      if (error?.code === 'auth/network-request-failed') {
        alert('Ошибка сети. Проверьте интернет-соединение.');
        return;
      }
      alert('Произошла ошибка при входе. Попробуйте ещё раз.');
    }
  };

  // -----------------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------------

  return /*#__PURE__*/React.createElement(React.Fragment, null, showLauncher && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "lms-menu-page-launcher",
    style: {
      position: "absolute",
      top: LAUNCHER_TOP,
      left: "max(8px, env(safe-area-inset-left))",
      zIndex: 1900
    }
  }, /*#__PURE__*/React.createElement(SidebarLauncher, {
    isOpen: isSidebarOpen,
    theme: theme,
    onClick: () => setIsSidebarOpen(v => !v)
  })), document.body), appReady && /*#__PURE__*/React.createElement(SidebarMenu, {
    isOpen: isSidebarOpen,
    onClose: () => setIsSidebarOpen(false),
    theme: theme,
    setTheme: setTheme,
    user: user,
    userNickname: userNickname,
    changeNickname: changeNickname,
    allowedModules: allowedModules,
    isAdmin: isAdmin,
    view: view,
    setView: setView,
    setIsChatOpen: setIsChatOpen
  }), /*#__PURE__*/React.createElement(AnimatePresence, null, appReady && isChatOpen && allowedModules.includes('chat') && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(motion.div, {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    onClick: () => setIsChatOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(5px)',
      zIndex: 2000
    }
  }), /*#__PURE__*/React.createElement(ChatPanel, {
    user: user,
    onClose: () => setIsChatOpen(false)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 10px',
      paddingTop: showLauncher ? CONTENT_TOP_WITH_LAUNCHER : '20px'
    }
  }, isAuthLoading && /*#__PURE__*/React.createElement(motion.div, {
    key: "loading",
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      scale: 0.985
    },
    className: "glass-panel",
    style: {
      textAlign: 'center',
      width: '100%',
      maxWidth: '400px',
      padding: '42px 26px',
      borderRadius: '26px'
    }
  }, /*#__PURE__*/React.createElement(motion.div, {
    animate: {
      rotate: 360
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    },
    style: {
      width: 44,
      height: 44,
      margin: '0 auto 20px',
      borderRadius: '50%',
      border: '4px solid rgba(139,92,246,.16)',
      borderTopColor: '#8b5cf6'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 8px',
      color: 'var(--text-main)'
    }
  }, "Ultimate LMS"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-sec)',
      fontSize: '13px',
      lineHeight: 1.6
    }
  }, "Проверяем аккаунт и загружаем актуальные настройки…")), /*#__PURE__*/React.createElement(AnimatePresence, {
    mode: "wait"
  }, !isAuthLoading && authError && /*#__PURE__*/React.createElement(motion.div, {
    key: "auth-error",
    initial: {
      opacity: 0,
      y: 12
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0
    },
    className: "glass-panel",
    style: {
      width: '100%',
      maxWidth: 430,
      padding: '34px 28px',
      textAlign: 'center',
      borderRadius: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 15,
      margin: '0 auto 16px',
      display: 'grid',
      placeItems: 'center',
      background: 'rgba(239,68,68,.1)',
      color: '#ef4444',
      fontSize: 23
    }
  }, "!"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      color: 'var(--text-main)'
    }
  }, "Не удалось открыть профиль"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      color: 'var(--text-sec)',
      fontSize: 13,
      lineHeight: 1.6
    }
  }, authError), /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      setAuthError('');
      setIsAuthLoading(true);
      setProfileRetry(value => value + 1);
    },
    style: {
      minHeight: 48
    }
  }, "Повторить")), !isAuthLoading && !authError && !user && /*#__PURE__*/React.createElement("div", {
    key: "landing-wrapper",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflowY: 'auto',
      zIndex: 5000,
      background: '#050308'
    }
  }, /*#__PURE__*/React.createElement(LandingView, {
    onLogin: handleDirectLogin
  })), appReady && assignedTask && assignedTask.module !== 'typing' && view === assignedTask.module && React.createElement(AssignmentActive, {
    task: assignedTask,
    uid: user.uid,
    onClose: () => {
      window.__lmsAssignmentContext = null;
      setAssignedTask(null);
      setView('assignments');
    }
  }), appReady && view === 'assignments' && !isAdmin && allowedModules.includes('assignments') && React.createElement(LmsMyAssignments, {
    key: user.uid,
    uid: user.uid,
    modules: allowedModules,
    profile: userData,
    onBack: () => setView('menu'),
    onOpen: task => {
      window.__lmsAssignmentContext = {
        id: task.id,
        uid: user.uid,
        module: task.module,
        bank: task.hotkeyBank || 'any'
      };
      setAssignedTask(task);
      setView(task.module);
    }
  }), appReady && view === 'admin' && isAdmin && /*#__PURE__*/React.createElement(AdminPanel, {
    key: "admin-view"
  }), appReady && ['menu', 'set_menu', 'timer_setup', 'test', 'result', 'review'].includes(view) && /*#__PURE__*/React.createElement(TestsLMS, {
    key: "tests-view",
    view: view,
    setView: setView,
    currentSet: currentSet,
    tests: tests,
    setTests: setTests,
    user: user,
    history: history,
    setHistory: setHistory,
    fp: fp,
    sets: sets,
    addSet: addSet,
    deleteSet: deleteSet,
    openSet: openSet,
    teacherTests: teacherTests,
    openTeacherAssignedTest: openTeacherAssignedTest,
    removeTeacherTestStudent: removeTeacherTestStudent
  }), appReady && view === 'stats' && allowedModules.includes('stats') && /*#__PURE__*/React.createElement(StatsView, {
    key: "stats-view",
    history: history,
    setHistory: setHistory,
    userData: userData
  }), appReady && view === 'typing' && allowedModules.includes('typing') && /*#__PURE__*/React.createElement(motion.div, {
    key: "typing_test",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    style: {
      width: '100%',
      maxWidth: '1100px'
    }
  }, /*#__PURE__*/assignedTask?.module === 'typing' && allowedModules.includes('assignments') ? React.createElement(LmsAssignedTyping, {
    key: user.uid + assignedTask.id,
    task: assignedTask,
    uid: user.uid,
    onClose: () => {
      setAssignedTask(null);
      setView('assignments');
    }
  }) : React.createElement(TypingTest, null)), appReady && view === 'hotkeys' && allowedModules.includes('hotkeys') && /*#__PURE__*/React.createElement(motion.div, {
    key: "hotkey_trainer",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    style: {
      width: '100%',
      maxWidth: '700px'
    }
  }, /*#__PURE__*/React.createElement(HotkeyTrainer, {
    key: assignedTask?.id || 'practice'
  })), appReady && view === 'code' && allowedModules.includes('code') && /*#__PURE__*/React.createElement(motion.div, {
    key: "code_playground",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    style: {
      width: '100%',
      maxWidth: '1200px'
    }
  }, /*#__PURE__*/React.createElement(CodePlayground, null)), appReady && view === 'flashcards' && allowedModules.includes('flashcards') && /*#__PURE__*/React.createElement(motion.div, {
    key: "flashcards_view",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    style: {
      width: '100%',
      maxWidth: '1000px'
    }
  }, /*#__PURE__*/React.createElement(FlashcardsLMS, {
    onBack: () => setView('menu')
  })), appReady && view === 'chess' && allowedModules.includes('chess') && React.createElement(motion.div, {
    key: 'chess_view',
    initial: {
      opacity: 0,
      y: 12
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0
    },
    transition: {
      duration: .25
    },
    style: {
      width: '100%',
      maxWidth: '1600px'
    }
  }, React.createElement(ChessLMS, {
    theme,
    user,
    userNickname,
    onThemeChange: setTheme
  })), appReady && view === 'excel' && allowedModules.includes('excel') && /*#__PURE__*/React.createElement(motion.div, {
    key: "excel_view",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    style: {
      width: '100%',
      maxWidth: '1000px'
    }
  }, /*#__PURE__*/React.createElement(LazyExcelTrainer, {
    key: assignedTask?.id || 'practice',
    theme: theme,
    onBack: () => setView('menu')
  }))), appReady && allowedModules.includes('ai_chat') && window.AIChatWidget && /*#__PURE__*/React.createElement(AppAssistantHost, null)));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(window.LmsErrorBoundary || React.Fragment, null, React.createElement(App, null)));
