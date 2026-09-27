// --- 13_landing.js ---
// Заменить содержимое файла целиком. Стили: landing.css.
// API сохранён: window.LandingView({ onLogin }). Нужен только React.
(function () {
  'use strict';

  const {
    useState,
    useEffect,
    useRef
  } = React;
  const ICONS = {
    cap: <><path d="m2 9 10-5 10 5-10 5-10-5Z" /><path d="M6 11v6c4 3 8 3 12 0v-6M22 9v8" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
    tests: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="m8 9 2 2 5-5M8 15h8M8 18h5" /></>,
    cards: <><rect x="3" y="7" width="14" height="14" rx="3" /><path d="M7 3h11a3 3 0 0 1 3 3v11M7 12h6M7 16h4" /></>,
    excel: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
    typing: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" /></>,
    code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />,
    chat: <path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z" />,
    bolt: <path d="m13 2-9 12h7l-1 8 10-12h-8z" />,
    chart: <><path d="M4 20h17M7 16v-5M12 16V5M17 16V8" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    repeat: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a19 19 0 0 1 0 18 19 19 0 0 1 0-18" /></>
  };
  const Icon = ({
    name,
    size = 22
  }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[name] || ICONS.spark}</svg>;
  const MODULES = [{
    id: 'tests',
    icon: 'tests',
    label: 'Тесты и экзамены',
    tag: 'Проверь знания',
    text: 'Проходи задания и разбирай ошибки.',
    detail: 'Выбирай тему, отвечай на вопросы и возвращайся к сложным моментам в работе над ошибками.'
  }, {
    id: 'flashcards',
    icon: 'cards',
    label: 'Флеш-карты',
    tag: 'Запоминай надолго',
    text: 'Вопрос, ответ и ещё одно повторение.',
    detail: 'Переворачивай карточки, отмечай знакомые ответы и отдельно повторяй то, что пока не запомнилось.'
  }, {
    id: 'excel',
    icon: 'excel',
    label: 'Тренажёр Excel',
    tag: 'От формулы к практике',
    text: 'Разбирай функции на понятных примерах.',
    detail: 'Изучай формулы и сразу проверяй, как они работают в заданиях тренажёра.'
  }, {
    id: 'typing',
    icon: 'typing',
    label: 'Тренажёр печати',
    tag: 'Поймай свой ритм',
    text: 'Развивай скорость и точность набора.',
    detail: 'Тренируй печать, следи за точностью и сравнивай результат со своим личным рекордом.'
  }, {
    id: 'playground',
    icon: 'code',
    label: 'Кодовая песочница',
    tag: 'Попробуй свою идею',
    text: 'Пиши код и экспериментируй.',
    detail: 'Практикуй программирование: пробуй небольшие примеры и разбирай, как устроено решение.'
  }, {
    id: 'hotkeys',
    icon: 'bolt',
    label: 'Горячие клавиши',
    tag: 'Действуй быстрее',
    text: 'Превращай сочетания клавиш в привычку.',
    detail: 'Повторяй сочетания и закрепляй их в тренировках, чтобы увереннее пользоваться привычными программами.'
  }, {
    id: 'chat',
    icon: 'chat',
    label: 'ИИ-помощник',
    tag: 'Разберись в сложном',
    text: 'Задавай вопросы по материалу.',
    detail: 'Попроси объяснить тему или подсказать следующий шаг. Ответы помощника стоит проверять по учебным материалам.'
  }, {
    id: 'account',
    icon: 'chart',
    label: 'Личный прогресс',
    tag: 'Замечай результат',
    text: 'История, рекорды и статистика обучения.',
    detail: 'Смотри результаты тестов, достижения в тренажёрах и свой прогресс в личном кабинете.'
  }];
  function useReducedMotion() {
    const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false);
    useEffect(() => {
      const q = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (!q) return;
      const update = () => setReduced(q.matches);
      q.addEventListener?.('change', update);
      return () => q.removeEventListener?.('change', update);
    }, []);
    return reduced;
  }
  function Reveal({
    children,
    className = ''
  }) {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
      const node = ref.current;
      if (!node) return;
      if (!window.IntersectionObserver) {
        setSeen(true);
        return;
      }
      const observer = new IntersectionObserver(entries => {
        if (entries.some(x => x.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      }, {
        threshold: 0.08
      });
      observer.observe(node);
      return () => observer.disconnect();
    }, []);
    return <div ref={ref} className={`lv-reveal ${seen ? 'lv-seen' : ''} ${className}`}>{children}</div>;
  }
  function Brand() {
    return <span className="lv-brand"><span className="lv-brand-mark"><Icon name="cap" size={25} /></span><span><b>Ultimate LMS</b><small>LEARN. PRACTICE. GROW.</small></span></span>;
  }
  function Demo({
    quiet
  }) {
    const [tab, setTab] = useState('tests');
    const [answer, setAnswer] = useState(null);
    const [flipped, setFlipped] = useState(false);
    const [formula, setFormula] = useState(false);
    const panel = useRef(null),
      frame = useRef(null);
    const tabs = useRef([]);
    const resetTilt = () => {
      cancelAnimationFrame(frame.current);
      panel.current?.style.setProperty('--lv-rx', '0deg');
      panel.current?.style.setProperty('--lv-ry', '0deg');
    };
    useEffect(() => {
      if (quiet) resetTilt();
      return () => cancelAnimationFrame(frame.current);
    }, [quiet]);
    const tilt = e => {
      if (quiet || e.pointerType !== 'mouse') return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5,
        y = (e.clientY - rect.top) / rect.height - .5;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        panel.current?.style.setProperty('--lv-rx', `${-y * 5}deg`);
        panel.current?.style.setProperty('--lv-ry', `${x * 6}deg`);
      });
    };
    const choices = [['tests', 'tests', 'Тест'], ['cards', 'cards', 'Карточки'], ['excel', 'excel', 'Excel']];
    return <div className="lv-demo-stage" onPointerMove={tilt} onPointerLeave={resetTilt}>
      <div className="lv-orbit" aria-hidden="true" /><div className="lv-orbit lv-orbit-two" aria-hidden="true" />
      <div className="lv-demo-panel" ref={panel}>
        <div className="lv-window-bar"><span className="lv-window-dots" aria-hidden="true"><i /><i /><i /></span><span>Твоё пространство обучения</span><Icon name="spark" size={16} /></div>
        <div className="lv-demo-body"><div className="lv-demo-heading"><div><span className="lv-overline">МАЛЕНЬКАЯ ПРАКТИКА</span><h2>Попробуй прямо здесь</h2></div><span className="lv-demo-badge">Демо</span></div>
          <div className="lv-demo-tabs" role="tablist" aria-label="Примеры возможностей">{choices.map(([id, icon, label], index) => <button ref={node => tabs.current[index] = node} key={id} id={`lv-demo-tab-${id}`} type="button" role="tab" aria-selected={tab === id} aria-controls={`lv-demo-${id}`} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={e => {
              let next = index;
              if (e.key === 'ArrowRight') next = (index + 1) % 3;else if (e.key === 'ArrowLeft') next = (index + 2) % 3;else if (e.key === 'Home') next = 0;else if (e.key === 'End') next = 2;else return;
              e.preventDefault();
              setTab(choices[next][0]);
              tabs.current[next]?.focus();
            }}><Icon name={icon} size={17} />{label}</button>)}</div>
          <div key={tab} className="lv-demo-content" role="tabpanel" id={`lv-demo-${tab}`} aria-labelledby={`lv-demo-tab-${tab}`}>
            {tab === 'tests' && <><div className="lv-question-meta"><span>ВОПРОС 01</span><span>Один ответ</span></div><h3>Какое сочетание копирует выделенный текст в Windows?</h3><div className="lv-demo-options">{['Ctrl + V', 'Ctrl + C', 'Ctrl + Z'].map((text, i) => <button type="button" key={text} disabled={answer !== null} className={answer === null ? '' : i === 1 ? 'is-right' : answer === i ? 'is-wrong' : ''} onClick={() => setAnswer(i)}><span>{String.fromCharCode(65 + i)}</span><b>{text}</b>{answer !== null && i === 1 ? <Icon name="check" size={17} /> : answer === i ? <Icon name="close" size={17} /> : null}</button>)}</div><div className="lv-demo-feedback" role="status">{answer === null ? <span>Выбери вариант — и сразу проверь себя.</span> : <><span>{answer === 1 ? 'Верно! Ctrl + C копирует текст.' : 'Запомни: Ctrl + C — копировать.'}</span><button type="button" onClick={() => setAnswer(null)} aria-label="Повторить демо-вопрос"><Icon name="repeat" size={17} /></button></>}</div></>}
            {tab === 'cards' && <><div className="lv-question-meta"><span>ОДНА КАРТОЧКА</span><span>Нажми, чтобы перевернуть</span></div><button type="button" className={`lv-flip ${flipped ? 'is-flipped' : ''}`} aria-label={flipped ? 'Ответ: Ctrl + Z отменяет последнее действие. Показать вопрос' : 'Что делает Ctrl + Z? Показать ответ'} aria-pressed={flipped} onClick={() => setFlipped(v => !v)}><span className="lv-flip-inner"><span className="lv-flip-face" aria-hidden="true"><Icon name="cards" size={30} /><small>ВОПРОС</small><b>Что делает<br />Ctrl + Z?</b><span>Нажми для ответа <Icon name="arrow" size={16} /></span></span><span className="lv-flip-face lv-flip-back" aria-hidden="true"><Icon name="check" size={30} /><small>ОТВЕТ</small><b>Отменяет последнее действие.</b><span>Нажми, чтобы вернуться</span></span></span></button><div className="lv-demo-feedback">Повторяй сложное, пока ответ не станет привычным.</div></>}
            {tab === 'excel' && <><div className="lv-question-meta"><span>ПРАКТИКА EXCEL</span><span>Сумма значений</span></div><div className="lv-sheet"><div className="lv-formula"><span>ƒx</span><code>{formula ? '=СУММ(B2:B4)' : 'Выбери «Посчитать»'}</code></div><table><thead><tr><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody><tr><td>Тетради</td><td>120</td></tr><tr><td>Ручки</td><td>80</td></tr><tr><td>Книги</td><td>300</td></tr><tr className="lv-sheet-total"><th scope="row">Итого</th><td aria-live="polite">{formula ? '500' : '—'}</td></tr></tbody></table></div><button className="lv-calculate" type="button" onClick={() => setFormula(v => !v)}><Icon name={formula ? 'repeat' : 'excel'} size={17} />{formula ? 'Ещё раз' : 'Посчитать сумму'}<Icon name="arrow" size={17} /></button><div className="lv-demo-feedback">СУММ складывает числа в выбранном диапазоне.</div></>}
          </div>
          <div className="lv-demo-foot"><span className="lv-status-dot" />Интерактивный пример · результаты не сохраняются</div>
        </div>
      </div>
      <div className="lv-floating-label" aria-hidden="true"><span><Icon name="bolt" size={21} /></span><div><b>Знания в действии</b><small>Изучай. Пробуй. Повторяй.</small></div></div>
    </div>;
  }
  const LEGAL_TEXTS = {
    privacy: {
      title: "Политика конфиденциальности",
      content: "Ваша конфиденциальность очень важна для нас. Мы собираем минимально необходимое количество данных (email, имя, статистика обучения) исключительно для обеспечения работы платформы Ultimate LMS. Мы не передаем ваши данные третьим лицам. Использование платформы подразумевает ваше согласие на обработку этих данных."
    },
    terms: {
      title: "Условия использования",
      content: "Платформа Ultimate LMS предоставляется «как есть». Администрация оставляет за собой право блокировать пользователей за нарушение правил (читы, передача аккаунта, оскорбления в чате). Копирование материалов платформы без разрешения запрещено. Приятного обучения!"
    }
  };
  function LegalModal({
    type,
    onClose,
    backgroundRef
  }) {
    const ref = useRef(null),
      closeRef = useRef(null);
    const data = LEGAL_TEXTS[type];
    useEffect(() => {
      const opener = document.activeElement,
        bg = backgroundRef.current,
        previousInert = bg?.inert;
      if (bg) bg.inert = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
      const handle = e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        if (e.key === 'Tab') {
          const nodes = Array.from(ref.current?.querySelectorAll('button,[href],[tabindex="0"]') || []);
          if (!nodes.length) return;
          const first = nodes[0],
            last = nodes[nodes.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', handle);
      return () => {
        document.removeEventListener('keydown', handle);
        document.body.style.overflow = previousOverflow;
        if (bg) bg.inert = previousInert;
        if (opener?.isConnected) opener.focus();
      };
    }, [type, onClose, backgroundRef]);
    if (!data) return null;
    return <div className="lv-modal-backdrop" onClick={e => {
      if (e.target === e.currentTarget) onClose();
    }}><section ref={ref} className="lv-modal" role="dialog" aria-modal="true" aria-labelledby="lv-legal-title"><button ref={closeRef} type="button" className="lv-icon-button lv-modal-close" aria-label="Закрыть окно" onClick={onClose}><Icon name="close" /></button><span className="lv-overline">ULTIMATE LMS</span><h2 id="lv-legal-title">{data.title}</h2><p>{data.content}</p><button type="button" className="lv-button lv-primary" onClick={onClose}>Понятно<Icon name="check" size={18} /></button></section></div>;
  }
  const FAQ = [['Нужно ли что-то устанавливать?', 'Нет. Платформа работает в браузере. Для входа и загрузки материалов нужен интернет.'], ['Что можно попробовать без входа?', 'На этой странице доступны три небольших демо: вопрос теста, карточка и пример формулы Excel. Они показывают механику обучения и не сохраняют результат.'], ['Где смотреть свои результаты?', 'После входа используй раздел статистики: там собраны сохранённые результаты тестов и показатели тренажёров.'], ['Если я не понимаю тему?', 'Начни с небольшого примера, повтори материал с карточками или задай вопрос ИИ-помощнику внутри платформы.']];
  const LandingView = ({
    onLogin,
    theme
  }) => {
    const systemReduced = useReducedMotion();
    const [paused, setPaused] = useState(false),
      [menu, setMenu] = useState(false),
      [legal, setLegal] = useState(null),
      [expanded, setExpanded] = useState(null),
      [loginError, setLoginError] = useState(''),
      [loginBusy, setLoginBusy] = useState(false);
    const background = useRef(null),
      menuButton = useRef(null),
      alive = useRef(true),
      loginLock = useRef(false);
    const quiet = systemReduced || paused;
    useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
      };
    }, []);
    const closeLegal = React.useCallback(() => setLegal(null), []);
    const login = async () => {
      if (loginLock.current) return;
      if (typeof onLogin !== 'function') {
        setLoginError('Вход пока не подключён. Попробуй обновить страницу.');
        return;
      }
      loginLock.current = true;
      setLoginBusy(true);
      setLoginError('');
      try {
        await onLogin();
      } catch {
        if (alive.current) setLoginError('Не удалось открыть вход. Попробуй ещё раз.');
      } finally {
        loginLock.current = false;
        if (alive.current) setLoginBusy(false);
      }
    };
    const go = (event, id) => {
      event.preventDefault();
      const target = document.getElementById(id);
      setMenu(false);
      if (target) {
        target.focus({
          preventScroll: true
        });
        target.scrollIntoView({
          behavior: quiet ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    };
    const links = [['lv-features', 'Возможности'], ['lv-about', 'Как это работает'], ['lv-faq', 'Вопросы']];
    return <div className={`landing-v4 ${quiet ? 'lv-quiet' : ''} ${theme === 'light' ? 'lv-light' : theme === 'dark' ? 'lv-dark' : ''}`}>
      <div className="lv-background" aria-hidden="true"><div className="lv-aurora lv-aurora-a" /><div className="lv-aurora lv-aurora-b" /><div className="lv-grid-glow" /></div>
      <div ref={background} aria-hidden={legal ? 'true' : undefined}>
        <a className="lv-skip" href="#lv-main" onClick={e => go(e, 'lv-main')}>Перейти к содержимому</a>
        <header className="lv-header"><div className="lv-container lv-nav"><a className="lv-home" href="#lv-main" aria-label="Ultimate LMS — начало страницы" onClick={e => go(e, 'lv-main')}><Brand /></a><nav className="lv-desktop-nav" aria-label="Основная навигация">{links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={e => go(e, id)}>{label}</a>)}</nav><div className="lv-nav-actions"><button type="button" className="lv-icon-button lv-motion-toggle" disabled={systemReduced} aria-label={systemReduced ? 'Анимации отключены в системе' : paused ? 'Включить анимации' : 'Отключить анимации'} title={systemReduced ? 'Анимации отключены в системе' : paused ? 'Включить анимации' : 'Отключить анимации'} aria-pressed={quiet} onClick={() => setPaused(v => !v)}><Icon name={quiet ? 'play' : 'pause'} size={17} /></button><button type="button" className="lv-button lv-secondary lv-login" onClick={login} disabled={loginBusy}>Войти<Icon name="arrow" size={17} /></button><button ref={menuButton} type="button" className="lv-icon-button lv-menu-toggle" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} aria-controls="lv-mobile-menu" onClick={() => setMenu(v => !v)}><Icon name={menu ? 'close' : 'menu'} /></button></div></div>{menu && <nav id="lv-mobile-menu" className="lv-mobile-nav lv-container" aria-label="Мобильная навигация" onKeyDown={e => {
            if (e.key === 'Escape') {
              setMenu(false);
              menuButton.current?.focus();
            }
          }}>{links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={e => go(e, id)}>{label}<Icon name="arrow" size={18} /></a>)}</nav>}</header>
        <main id="lv-main" tabIndex={-1}>
          <section className="lv-hero lv-container" aria-labelledby="lv-title"><div className="lv-hero-copy"><div className="lv-eyebrow lv-intro" style={{
                '--lv-delay': '40ms'
              }}><span className="lv-status-dot" />Твоё пространство для роста</div><h1 id="lv-title"><span className="lv-title-line"><span>Учись.</span></span><span className="lv-title-line"><span>Пробуй.</span></span><span className="lv-title-line"><span className="lv-gradient">Превосходи себя.</span></span></h1><p className="lv-hero-description lv-intro" style={{
                '--lv-delay': '330ms'
              }}>От первого вопроса до уверенного навыка.<br className="lv-desktop-break" /> Тесты, тренажёры и ИИ-помощник —<br className="lv-desktop-break" /> в одном месте.</p><div className="lv-hero-actions lv-intro" style={{
                '--lv-delay': '430ms'
              }}><button type="button" className="lv-button lv-primary" onClick={login} disabled={loginBusy}>{loginBusy ? 'Открываем…' : 'Начать обучение'}<Icon name="arrow" size={20} /></button><a className="lv-text-link" href="#lv-features" onClick={e => go(e, 'lv-features')}>Изучить возможности<Icon name="chevron" size={18} /></a></div><div className="lv-hero-note lv-intro" style={{
                '--lv-delay': '500ms'
              }}><Icon name="globe" size={16} />Работает в браузере. В твоём темпе.</div>{loginError && <p className="lv-error" role="alert">{loginError}</p>}</div><div className="lv-hero-visual lv-intro" style={{
              '--lv-delay': '230ms'
            }}><Demo quiet={quiet} /></div></section>
          <div className="lv-container"><Reveal><div className="lv-shortcuts"><span>ОТ ЗНАНИЙ К ПРАКТИКЕ</span>{[['tests', 'Проверь себя'], ['typing', 'Прокачай навык'], ['cards', 'Закрепи знания'], ['chart', 'Замечай прогресс']].map(([icon, label]) => <div key={icon}><Icon name={icon} size={20} />{label}</div>)}</div></Reveal></div>
          <section className="lv-section lv-container" id="lv-features" tabIndex={-1} aria-labelledby="lv-features-title"><Reveal><div className="lv-section-heading"><div><span className="lv-overline">ВОЗМОЖНОСТИ ПЛАТФОРМЫ</span><h2 id="lv-features-title">Разные навыки.<br /><span className="lv-muted">Одно пространство.</span></h2></div><p>Выбирай, что хочешь освоить сегодня.<br />Нажми на карточку, чтобы узнать больше.</p></div></Reveal><div className="lv-module-grid">{MODULES.map((item, i) => <Reveal key={item.id} className={`lv-module-reveal lv-module-${item.id}`}><article className={`lv-module ${expanded === item.id ? 'is-expanded' : ''}`} style={{
                  '--lv-card-index': i
                }}><button type="button" className="lv-module-trigger" aria-expanded={expanded === item.id} aria-controls={`lv-module-detail-${item.id}`} onClick={() => setExpanded(v => v === item.id ? null : item.id)}><span className="lv-module-top"><span className={`lv-module-icon lv-color-${i % 4}`}><Icon name={item.icon} size={25} /></span><span className="lv-module-arrow"><Icon name="arrow" size={20} /></span></span><span className="lv-module-tag">{item.tag}</span><span className="lv-module-title">{item.label}</span><span className="lv-module-text">{item.text}</span></button><div className="lv-module-detail" id={`lv-module-detail-${item.id}`} hidden={expanded !== item.id}><p>{item.detail}</p></div></article></Reveal>)}</div></section>
          <section className="lv-section lv-container" id="lv-about" tabIndex={-1} aria-labelledby="lv-about-title"><Reveal><div className="lv-about"><div className="lv-about-copy"><span className="lv-overline">КАК ЭТО РАБОТАЕТ</span><h2 id="lv-about-title">Меньше откладывать.<br /><span className="lv-gradient">Больше пробовать.</span></h2><p>Не нужно разбираться во всём сразу. Выбери одну тему и начни с небольшого задания. Платформа поможет соединить изучение, практику и повторение.</p><a className="lv-text-link" href="#lv-main" onClick={e => go(e, 'lv-main')}>Попробовать демо<Icon name="arrow" size={19} /></a></div><ol className="lv-steps">{[['Выбери направление', 'Тесты, код, Excel или тренировка печати.'], ['Проверь на практике', 'Выполни задание и посмотри на результат.'], ['Разбери сложное', 'Повтори материал или спроси ИИ-помощника.'], ['Вернись чуть увереннее', 'Следи за прогрессом и продолжай в своём темпе.']].map(([title, text], i) => <li key={title}><span className="lv-step-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></Reveal></section>
          <section className="lv-section lv-container lv-faq" id="lv-faq" tabIndex={-1} aria-labelledby="lv-faq-title"><Reveal><div className="lv-section-heading"><div><span className="lv-overline">ПЕРЕД ПЕРВЫМ ШАГОМ</span><h2 id="lv-faq-title">Есть вопросы?</h2></div><p>Несколько вещей, которые полезно знать.</p></div><div className="lv-faq-list">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="chevron" size={21} /></summary><p>{answer}</p></details>)}</div></Reveal></section>
          <div className="lv-container lv-bottom-wrap"><Reveal><section className="lv-bottom-cta"><span className="lv-bottom-orbit" aria-hidden="true" /><span className="lv-overline">ТВОЙ СЛЕДУЮЩИЙ ШАГ</span><h2>Начни с любопытства.<br />Продолжи с уверенностью.</h2><p>Одна тема. Одна попытка. Уже движение вперёд.</p><button type="button" className="lv-button lv-primary" onClick={login} disabled={loginBusy}>{loginBusy ? 'Открываем…' : 'Перейти к обучению'}<Icon name="arrow" size={20} /></button></section></Reveal></div>
        </main>
        <footer className="lv-footer lv-container"><div className="lv-footer-top"><Brand /><div className="lv-footer-links"><button type="button" onClick={() => setLegal('privacy')}>Конфиденциальность</button><button type="button" onClick={() => setLegal('terms')}>Условия использования</button></div></div><div className="lv-footer-bottom"><span>© {new Date().getFullYear()} Ultimate LMS Platform</span><span>Учись. Практикуйся. Развивайся.</span></div></footer>
      </div>
      {legal && <LegalModal type={legal} onClose={closeLegal} backgroundRef={background} />}
    </div>;
  };
  Object.assign(window, {
    LandingView
  });
})();
