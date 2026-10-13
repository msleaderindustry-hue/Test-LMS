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
      if (error) { script.remove(); reject(error); }
      else resolve(window.ExcelTrainerLMS);
    };
    const timer = setTimeout(() => finish(new Error('Загрузка Excel заняла слишком много времени.')), 60000);
    script.src = new URL('15_excel_trainer.js?v=selected-181', document.baseURI).href;
    script.async = true;
    script.onload = () => finish(window.ExcelTrainerLMS ? null : new Error('Не удалось запустить Excel.'));
    script.onerror = () => finish(new Error('Не удалось загрузить Excel. Проверь подключение.'));
    document.head.appendChild(script);
  }).catch(error => { excelModulePromise = null; throw error; });
  return excelModulePromise;
}
function LazyExcelTrainer(props) {
  const [Component, setComponent] = React.useState(() => window.ExcelTrainerLMS || null);
  const [error, setError] = React.useState('');
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    let active = true;
    setError('');
    loadExcelModule().then(value => { if (active) setComponent(() => value); }, reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [attempt]);
  if (Component) return React.createElement(Component, props);
  return React.createElement(React.Fragment, null,
    React.createElement('style', null, `
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
@keyframes lms-excel-spin{to{transform:rotate(360deg)}}
@keyframes lms-excel-slide{from{transform:translateX(-60%)}to{transform:translateX(160%)}}
@keyframes lms-excel-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:480px){.lms-excel-loading{margin:16px auto!important;padding:32px 20px!important;border-radius:22px!important}.lms-excel-loading h2{font-size:20px!important}}
@media(prefers-reduced-motion:reduce){.lms-excel-loading,.lms-excel-loading .lel-icon:before,.lms-excel-loading .lel-track span{animation:none!important}.lms-excel-loading .lel-actions button{transition:none!important}}
`),
    React.createElement('section', {className:'lms-excel-loading'+(error?' is-error':''),'aria-busy':!error},
      React.createElement('div', {className:'lel-icon','aria-hidden':true},
        React.createElement('svg', {viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'},
          React.createElement('rect',{x:3,y:3,width:18,height:18,rx:4}),
          React.createElement('path',{d:'M3 9h18M3 15h18M9 3v18M15 9v12'}))),
      React.createElement('div',{className:'lel-label'},'EXCEL • ПРАКТИКА'),
      React.createElement('h2',null,error?'Не удалось загрузить':'Открываем Excel'),
      React.createElement('p',{className:'lel-copy',role:error?'alert':'status'},error || 'Подготавливаем тренажёр. Скоро можно будет приступить к практике.'),
      !error && React.createElement('div',{className:'lel-track','aria-hidden':true},React.createElement('span')),
      React.createElement('div',{className:'lel-actions'},
        error && React.createElement('button',{type:'button',className:'lel-retry',onClick:()=>setAttempt(value=>value+1)},'Повторить'),
        React.createElement('button',{type:'button',onClick:props.onBack},'Вернуться в меню'))));
}

// Keep the floating assistant out of the page layout and wait for its mount styles.
function AppAssistantHost() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return ReactDOM.createPortal(React.createElement('div', {
    style: {display:'contents',visibility:visible?'visible':'hidden'},
    className:'lms-assistant-host'
  }, React.createElement('style', null, `
.lms-assistant-host .ula-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}
`), React.createElement(window.AIChatWidget)), document.body);
}

// --- APP ---
function App() {
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
      window.dispatchEvent(new CustomEvent('lms:profile-ready', { detail: value }));
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
            initialData = await window.ensureLmsUserProfile(currentUser, { signal });
            break;
          } catch (error) {
            const code = String(error?.code || '').split('/').pop();
            const temporary = ['unavailable', 'deadline-exceeded', 'aborted', 'network-request-failed'].includes(code);
            if (!temporary || attempt === 2 || signal.aborted) throw error;
            await new Promise(resolve => {
              const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', finish); resolve(); };
              const timer = setTimeout(finish, 700 * (attempt + 1));
              signal.addEventListener('abort', finish, { once: true });
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
        publishReady({ uid: currentUser.uid });

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
              console.error('[Ultimate LMS SignOut]', signOutError);
            }
            alert('Доступ закрыт! Вы были исключены администратором.');
            return;
          }
          applyProfile(currentUser, data);
        }, error => {
          console.error('[Ultimate LMS Profile Snapshot]', error);
          if (!active || sequence !== authSequence) return;
          publishReady(null);
          resetProfile();
          setAuthError('Не удалось обновить профиль (' + (error.code || 'unknown') + '). Нажмите «Повторить».');
        });
      } catch (error) {
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
      section: isChatOpen ? 'chat' : (sections[view] || view || 'platform'),
      view: isChatOpen ? 'chat' : view
    };
    // Сохраняем текущий экран даже если трекер подключится чуть позже.
    window.__lmsCurrentSection = detail;
    if (typeof window.trackLmsSection === 'function') {
      window.trackLmsSection(detail.section, detail);
    } else {
      window.dispatchEvent(new CustomEvent('lms:section', { detail }));
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
    onClick: () => { setAuthError(''); setIsAuthLoading(true); setProfileRetry(value => value + 1); },
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
  })), appReady && view === 'admin' && isAdmin && /*#__PURE__*/React.createElement(AdminPanel, {key:"admin-view"}), appReady && ['menu', 'set_menu', 'timer_setup', 'test', 'result', 'review'].includes(view) && /*#__PURE__*/React.createElement(TestsLMS, {
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
  }, /*#__PURE__*/React.createElement(TypingTest, null)), appReady && view === 'hotkeys' && allowedModules.includes('hotkeys') && /*#__PURE__*/React.createElement(motion.div, {
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
    key: 'chess_view',initial:{opacity:0,y:12},animate:{opacity:1,y:0},exit:{opacity:0},transition:{duration:.25},
    style:{width:'100%',maxWidth:'1600px'}
  }, React.createElement(ChessLMS,{theme,user,userNickname,onThemeChange:setTheme})), appReady && view === 'excel' && allowedModules.includes('excel') && /*#__PURE__*/React.createElement(motion.div, {
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
    onBack: () => setView('menu')
  }))), appReady && allowedModules.includes('ai_chat') && window.AIChatWidget && /*#__PURE__*/React.createElement(AppAssistantHost, null)));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
