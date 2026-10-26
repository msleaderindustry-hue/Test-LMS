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
function LmsMyAssignments({
  uid,
  onOpen,
  canType
}) {
  const [items, setItems] = React.useState([]),
    [error, setError] = React.useState(''),
    [loading, setLoading] = React.useState(true),
    [open, setOpen] = React.useState(false);
  const dialog = React.useRef(null),
    trigger = React.useRef(null);
  React.useEffect(() => {
    setItems([]);
    setLoading(true);
    return window.db.collection('lmsAssignments').where('studentIds', 'array-contains', uid).onSnapshot(s => {
      setItems(s.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setLoading(false);
    }, e => {
      setError(e.message);
      setLoading(false);
    });
  }, [uid]);
  React.useEffect(() => {
    const d = dialog.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  function close() {
    setOpen(false);
    trigger.current?.focus({
      preventScroll: true
    });
  }
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, LMS_ASSIGN_CSS + LMS_ASSIGN_DRAWER_CSS), /*#__PURE__*/React.createElement("button", {
    ref: trigger,
    className: "la-launcher",
    title: "Мои задания",
    "aria-label": "Открыть мои задания",
    "aria-expanded": open,
    onClick: () => setOpen(true)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "4",
    width: "14",
    height: "17",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 4V2h6v2M9 10h6M9 14h6M9 18h3"
  })), null), /*#__PURE__*/React.createElement("dialog", {
    ref: dialog,
    className: "la-drawer",
    onCancel: e => {
      e.preventDefault();
      close();
    },
    onClick: e => {
      if (e.target === e.currentTarget) {
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
      }
    }
  }, /*#__PURE__*/React.createElement("section", {
    className: "la-box"
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "ТВОЙ УЧЕБНЫЙ ПЛАН"), /*#__PURE__*/React.createElement("h3", null, "Мои задания")), /*#__PURE__*/React.createElement("button", {
    className: "la-close",
    "aria-label": "Закрыть задания",
    onClick: close
  }, "×")), /*#__PURE__*/React.createElement("div", {
    className: "la-drawer-scroll"
  }, error && /*#__PURE__*/React.createElement("p", {
    role: "alert"
  }, error), loading ? /*#__PURE__*/React.createElement("p", null, "Загружаем задания…") : !items.length ? /*#__PURE__*/React.createElement("div", {
    className: "la-empty"
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "✓"), /*#__PURE__*/React.createElement("h4", null, "Пока заданий нет"), /*#__PURE__*/React.createElement("p", null, "Когда преподаватель назначит задание, оно появится здесь."), /*#__PURE__*/React.createElement("button", {
    onClick: close
  }, "Продолжить обучение")) : /*#__PURE__*/React.createElement("div", {
    className: "la-cards"
  }, items.map(task => /*#__PURE__*/React.createElement(LmsAssignmentCard, {
    key: task.id,
    task: task,
    uid: uid,
    onOpen: t => {
      setOpen(false);
      onOpen(t);
    },
    canType: canType
  }))))))), document.body);
}
const LMS_ASSIGN_DRAWER_CSS = `
.la-launcher{position:fixed;right:0;top:42%;z-index:1100;display:flex;align-items:center;gap:9px;padding:13px 15px;border:1px solid #a58ade55;border-right:0;border-radius:16px 0 0 16px;background:#1b2033;color:#c4afff;font-family:inherit;font-size:12px;font-weight:650;box-shadow:0 6px 30px #15102622;cursor:pointer;transition:padding .22s,background .22s;min-height:48px}.la-launcher:hover{padding-right:23px;background:#29233e}.la-launcher b{display:grid;place-items:center;min-width:20px;height:20px;border-radius:7px;background:#a689e629;font-size:10px}
.la-drawer{padding:0;border:1px solid #a58ade33;border-radius:24px 0 0 24px;width:min(440px,calc(100vw - 14px));max-width:none;height:100dvh;max-height:100dvh;margin:0 0 0 auto;inset:0;overflow:hidden;background:#191e2e;color:#eff0fa;box-shadow:-20px 0 80px #0003}.la-drawer::backdrop{background:#090b1955;backdrop-filter:blur(4px)}.la-drawer[open]{animation:la-slide .28s cubic-bezier(.2,.8,.2,1)}.la-drawer .la-box{display:flex;flex-direction:column;height:100%;margin:0;border:0;border-radius:0;padding:24px;background:inherit;color:inherit}.la-drawer header{flex-shrink:0;margin:0 0 18px}.la-drawer .la-close{width:36px;min-height:36px;height:36px;padding:0;font:24px/1 inherit;display:grid;place-items:center;border-radius:11px}.la-drawer-intro{display:flex;align-items:center;gap:14px;padding:17px;border:1px solid #a58ade33;border-radius:16px;background:linear-gradient(130deg,#a58ade18,transparent);margin-bottom:16px;flex-shrink:0}.la-drawer-intro b{font-size:13px}.la-drawer-intro p{font-size:11px;margin:5px 0 0}.la-orbit{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#a58ade20;color:#b79aea;flex-shrink:0;animation:la-glow 4s ease-in-out infinite}.la-drawer-scroll{min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;flex:1}.la-drawer .la-cards{grid-template-columns:1fr}.la-empty{text-align:center;padding:42px 14px}.la-empty>span{display:grid;place-items:center;margin:0 auto 18px;border:1px solid #a58ade44;border-radius:20px;width:64px;height:64px;color:#a58ade;font-size:25px;background:#a58ade0c}.la-empty p{max-width:260px;margin:12px auto 20px}.la-drawer button:focus-visible,.la-launcher:focus-visible{outline:2px solid #a58ade;outline-offset:3px}
:is(html.light,body.light,.theme-light,[data-theme=light]) .la-drawer{background:#faf9ff;color:#293047}:is(html.light,body.light,.theme-light,[data-theme=light]) .la-launcher{background:#faf9ff;color:#7752b6}
@keyframes la-slide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}@keyframes la-glow{50%{box-shadow:0 0 20px #a58ade22;transform:translateY(-2px)}}@media(max-width:600px){.la-launcher{padding:12px 10px}.la-launcher>span{display:none}.la-drawer .la-box{padding:20px 16px}}@media(prefers-reduced-motion:reduce){.la-drawer[open],.la-orbit{animation:none}.la-launcher{transition:none}}

.la-launcher{right:0!important;width:34px!important;height:60px!important;min-height:60px;padding:0!important;display:grid!important;place-items:center;border-radius:18px 0 0 18px!important;transform-origin:right center;box-shadow:0 8px 28px #0002;transition:transform .22s,background .22s,box-shadow .22s}.la-launcher:hover{transform:none;box-shadow:0 12px 30px #a58ade26}.la-launcher:active{transform:scale(.96)}.la-drawer{width:min(420px,calc(100vw - 24px));height:auto;max-height:calc(100dvh - 32px);margin:auto 16px auto auto;border-radius:24px}.la-drawer .la-box{padding:24px;min-height:0;height:auto;max-height:calc(100dvh - 34px);gap:0}.la-drawer header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:20px;margin:0 0 20px;border-bottom:1px solid #a58ade30;flex-shrink:0}.la-drawer header h3{margin:4px 0 0;font-size:21px}.la-drawer .la-close{width:36px;height:36px;min-height:36px;padding:0;margin:0;flex-shrink:0;display:grid;place-items:center;border-radius:11px}.la-drawer-scroll{flex:0 1 auto;min-height:0}.la-empty{display:flex;flex-direction:column;align-items:center;padding:24px 8px 12px;text-align:center}.la-empty>span{margin:0 0 18px}.la-empty h4{margin:0;font-size:17px}.la-empty p{font-size:13px;line-height:1.7;margin:12px auto 24px}.la-empty>button{align-self:stretch;margin:0;min-height:46px;text-align:center;justify-content:center}.la-drawer button{transition:background .2s,transform .2s}.la-drawer button:active{transform:scale(.98)}.la-cards{gap:14px}.la-cards>*{min-width:0}.la-drawer[open]{animation:la-slide .3s cubic-bezier(.2,.8,.2,1)}
@media(max-width:600px){.la-launcher{right:0!important}.la-drawer{margin:auto 12px;width:calc(100vw - 24px)}.la-drawer .la-box{padding:22px 20px}}
@media(prefers-reduced-motion:reduce){.la-drawer[open],.la-launcher,.la-drawer button{animation:none;transition:none}}
`;
function LmsAssignmentCard({
  task,
  uid,
  onOpen,
  canType
}) {
  const [p, setP] = React.useState(null),
    [error, setError] = React.useState(''),
    [busy, setBusy] = React.useState(false);
  React.useEffect(() => window.db.collection('lmsAssignments').doc(task.id).collection('progress').doc(uid).onSnapshot(s => setP(s.data() || {}), e => setError(e.message)), [uid, task.id]);
  async function act(help) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const live = await lmsAssignmentWrite(task.id, uid, help ? 'help' : 'start');
      if (!help) onOpen(live);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const done = p?.status === 'completed',
    late = task.dueAt?.toMillis?.() < Date.now();
  return /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("h4", null, task.title), /*#__PURE__*/React.createElement("p", null, task.lang?.toUpperCase(), " · точность от ", task.minAccuracy, "%"), /*#__PURE__*/React.createElement("small", null, "До ", task.dueAt?.toDate?.().toLocaleString('ru-RU') || '—'), /*#__PURE__*/React.createElement("b", {
    className: "la-status"
  }, done ? 'Выполнено' : p?.needsHelp ? 'Запрошена помощь' : late ? 'Просрочено' : p?.status === 'started' ? 'В процессе' : 'Не начато'), p?.result && /*#__PURE__*/React.createElement("p", null, "Последний результат: ", p.result.accuracy, "% · ", p.result.wpm, " WPM"), /*#__PURE__*/React.createElement("div", {
    className: "la-actions"
  }, /*#__PURE__*/React.createElement("button", {
    disabled: busy || !canType || !p || done,
    onClick: () => act(false)
  }, busy ? 'Подождите…' : done ? 'Выполнено' : p?.status === 'started' ? 'Продолжить' : 'Начать'), /*#__PURE__*/React.createElement("button", {
    disabled: busy || !p || done || p.needsHelp,
    onClick: () => act(true)
  }, p?.needsHelp ? 'Помощь запрошена' : 'Нужна помощь')), !canType && /*#__PURE__*/React.createElement("small", null, "Доступ к тренажёру отключён преподавателем."), error && /*#__PURE__*/React.createElement("p", {
    role: "alert"
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
    if (window.auth?.currentUser?.uid !== uid || !a.exists || !task.studentIds?.includes(uid) || !profile || profile.isBanned || profile.assignmentsEnabled === false || Array.isArray(profile.allowedModules) && !profile.allowedModules.includes('typing')) throw Error('Нет доступа к этому заданию.');
    if (task.module !== 'typing' || task.status !== 'assigned') throw Error('Задание недоступно.');
    const ts = window.firebase.firestore.FieldValue.serverTimestamp;
    const next = {
      ...old,
      updatedAt: ts()
    };
    if (action === 'start') {
      if (old.status === 'completed') throw Error('Задание уже выполнено.');
      next.status = 'started';
      next.startedAt = old.startedAt || ts();
    }
    if (action === 'help') {
      next.needsHelp = true;
      next.status = old.status || 'not_started';
    }
    if (action === 'finish') {
      if (!result || result.text !== task.text || result.lang !== task.lang || result.characters !== task.text.length) throw Error('Задание изменилось. Откройте его заново.');
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
    capture.current?.focus({
      preventScroll: true
    });
  }
  return /*#__PURE__*/React.createElement("section", {
    className: "la-box"
  }, /*#__PURE__*/React.createElement("style", null, LMS_ASSIGN_CSS), /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "ЗАДАНИЕ ПРЕПОДАВАТЕЛЯ"), /*#__PURE__*/React.createElement("h3", null, task.title)), /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: onClose
  }, "К заданиям")), /*#__PURE__*/React.createElement("div", {
    className: "la-metrics"
  }, /*#__PURE__*/React.createElement("span", null, "Цель: ", task.minAccuracy, "%"), /*#__PURE__*/React.createElement("span", null, "Точность: ", index + errors ? Math.round(index / (index + errors) * 100) : 100, "%"), /*#__PURE__*/React.createElement("span", null, "Ошибки: ", errors), /*#__PURE__*/React.createElement("span", null, index, " / ", task.text.length)), /*#__PURE__*/React.createElement("div", {
    className: "la-text",
    ref: container,
    onClick: () => capture.current?.focus({
      preventScroll: true
    })
  }, task.text.split('').map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: i < index ? 'done' : i === index ? wrong ? 'current wrong' : 'current' : ''
  }, c))), !finished && /*#__PURE__*/React.createElement("label", null, "Нажми здесь и печатай", /*#__PURE__*/React.createElement("input", {
    ref: capture,
    className: "la-input",
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
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
  })), /*#__PURE__*/React.createElement("p", null, "Ошибка не пропускает букву. Результат сохраняется после полного текста."), /*#__PURE__*/React.createElement("p", {
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
const LMS_ASSIGN_CSS = `.la-box{background:var(--card-bg,var(--bg-card,#1a2030));color:var(--text-main,#eff0fa);border:1px solid #a68bd633;border-radius:22px;padding:24px;margin:0 0 22px;font-family:inherit;min-width:0}.la-box *{box-sizing:border-box}.la-box header{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:18px}.la-box h3{margin:5px 0;font-size:21px}.la-box h4{margin:0;font-size:15px}.la-box small{font-size:11px;opacity:.7}.la-box p{font-size:13px;line-height:1.65;opacity:.8}.la-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:12px}.la-cards article{border:1px solid #a68bd633;border-radius:15px;padding:17px;background:#a68bd608}.la-box button{border:1px solid #a68bd655;background:#a68bd618;color:inherit;font:600 12px inherit;border-radius:11px;padding:11px 15px;cursor:pointer;min-height:40px;transition:background .2s}.la-box button:hover{background:#a68bd633}.la-box button:disabled{opacity:.5;cursor:default}.la-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:15px}.la-status{display:block;color:#a78ae5;margin:12px 0;font-size:12px}.la-metrics{display:flex;gap:12px;flex-wrap:wrap;padding:14px;background:#a68bd610;border-radius:12px;font-size:13px}.la-text{max-height:250px;overflow:auto;font:23px/1.8 ui-monospace,monospace;margin:20px 0;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin}.la-text .done{color:#9b85ce}.la-text .current{background:#a68bd6;color:#171320;border-radius:3px}.la-text .wrong{background:#f097ad}.la-input{display:block;width:100%;border:1px solid #a68bd666;background:#a68bd60d;color:inherit;font:16px inherit;padding:13px;border-radius:12px;margin-top:8px}.la-box label{font-size:12px}.la-box :focus-visible{outline:2px solid #a68bd6;outline-offset:3px}:is(html.light,body.light,.theme-light,[data-theme=light]) .la-box{background:var(--card-bg,#faf9ff);color:var(--text-main,#283049)}@media(max-width:520px){.la-box{padding:17px}.la-box header{align-items:flex-start}.la-box h3{font-size:18px}.la-text{font-size:20px}.la-metrics{font-size:11px}}`;
function App() {
  const [assignedTask, setAssignedTask] = useState(null);
  useEffect(() => {
    setAssignedTask(null);
  }, [window.auth?.currentUser?.uid]);
  const DEFAULT_MODULES = ['chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'chess', 'stats'];
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
    if (!appReady) return;
    const viewModule = {
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
  })), appReady && userData.assignmentsEnabled !== false && view === 'menu' && React.createElement(LmsMyAssignments, {
    key: user.uid,
    uid: user.uid,
    canType: allowedModules.includes('typing'),
    onOpen: task => {
      setAssignedTask(task);
      setView('typing');
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
  }, /*#__PURE__*/assignedTask ? React.createElement(LmsAssignedTyping, {
    key: user.uid + assignedTask.id,
    task: assignedTask,
    uid: user.uid,
    onClose: () => {
      setAssignedTask(null);
      setView('menu');
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
  }, /*#__PURE__*/React.createElement(HotkeyTrainer, null)), appReady && view === 'code' && allowedModules.includes('code') && /*#__PURE__*/React.createElement(motion.div, {
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
    theme: theme,
    onBack: () => setView('menu')
  }))), appReady && allowedModules.includes('ai_chat') && window.AIChatWidget && /*#__PURE__*/React.createElement(AppAssistantHost, null)));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(window.LmsErrorBoundary || React.Fragment, null, React.createElement(App, null)));
