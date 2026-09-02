// --- 13_landing.js ---
const { useState, useEffect, useRef } = React;

// Реальные модули платформы (соответствуют файлам проекта) —
// вместо выдуманных цифр показываем то, что действительно есть.
const CAPABILITIES = [
    {
        id: 'tests',
        label: 'Тесты и экзамены',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        id: 'flashcards',
        label: 'Флеш-карты',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="14" height="10" rx="2" />
                <path d="M7 3h14v10" />
            </svg>
        ),
    },
    {
        id: 'excel',
        label: 'Тренажёр Excel',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
            </svg>
        ),
    },
    {
        id: 'chat',
        label: 'ИИ-чат поддержки',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4A8.9 8.9 0 0 1 3 12a8.4 8.4 0 0 1 8.5-8.5A8.4 8.4 0 0 1 21 11.5z" />
            </svg>
        ),
    },
    {
        id: 'typing',
        label: 'Тренажёр печати',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
        ),
    },
    {
        id: 'playground',
        label: 'Кодовая песочница',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
        ),
    },
    {
        id: 'hotkeys',
        label: 'Горячие клавиши',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M8 14h8" />
            </svg>
        ),
    },
    {
        id: 'account',
        label: 'Личный кабинет',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
        ),
    },
];

const BAR_HEIGHTS = [35, 60, 42, 82, 52, 95, 68];

const LandingView = ({ onLogin }) => {
    const [heroIn, setHeroIn] = useState(false);
    const [barsIn, setBarsIn] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [aboutVisible, setAboutVisible] = useState(false);
    const laptopWrapRef = useRef(null);
    const aboutRef = useRef(null);

    // Единая последовательность появления хиро-блока при загрузке —
    // осознанный момент, а не разбросанные fade-in на каждом элементе.
    useEffect(() => {
        const t1 = setTimeout(() => setHeroIn(true), 80);
        const t2 = setTimeout(() => setBarsIn(true), 620);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // Плавное появление секции "О платформе" при прокрутке до неё.
    useEffect(() => {
        if (!aboutRef.current || typeof IntersectionObserver === 'undefined') {
            setAboutVisible(true);
            return;
        }
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAboutVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.25 }
        );
        obs.observe(aboutRef.current);
        return () => obs.disconnect();
    }, []);

    // Лёгкий наклон ноутбука вслед за курсором — отвечает на действие пользователя,
    // а не крутится сам по себе.
    const handleMouseMove = (e) => {
        const el = laptopWrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: py * -8, y: px * 10 });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
        <div className="landing-wrapper">
            <div className="glow-field">
                <div className="glow glow-a"></div>
                <div className="glow glow-b"></div>
                <div className="glow glow-c"></div>
                <div className="glow glow-d"></div>
            </div>
            <div className="noise"></div>

            <header>
                <div className="nav">
                    <div className="logo">
                        <div className="logo-mark">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3L2 8l10 5 8-4.2V15h1V8L12 3z" fill="#fff" />
                                <path d="M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5l-6 3.15-6-3.15z" fill="#fff" opacity=".85" />
                            </svg>
                        </div>
                        <div className="logo-text">
                            <b>Ultimate LMS</b>
                            <small>PLATFORM</small>
                        </div>
                    </div>
                    <nav className="nav-links">
                        <a href="#features">Возможности</a>
                        <a href="#about">О платформе</a>
                        <a href="#pricing">Тарифы</a>
                        <a href="#contacts">Контакты</a>
                    </nav>
                    <div className="nav-actions">
                        {/* КНОПКИ В ШАПКЕ */}
                        <button className="btn-lnd btn-ghost" onClick={onLogin}>Войти</button>
                        <button className="btn-lnd btn-grad" onClick={onLogin}>Зарегистрироваться</button>
                    </div>
                </div>
            </header>

            <section className="hero">
                <div className="hero-inner">
                    <div className={`hero-content${heroIn ? ' in' : ''}`}>
                        <span className="eyebrow">новая площадка обучения</span>
                        <h1 className="hero-title">Обучение.<br />Тестирование.<br /><span className="grad">Развитие.</span></h1>
                        <p className="hero-sub">Ultimate LMS Platform — тесты, флеш-карты, тренажёр Excel, тренажёр печати и ИИ-чат в одном месте, чтобы учиться и сразу проверять себя.</p>
                        <div className="hero-cta">
                            {/* ГЛАВНЫЕ КНОПКИ */}
                            <button className="btn-lnd btn-grad" onClick={onLogin}>Зарегистрироваться</button>
                            <button className="btn-lnd btn-outline" onClick={onLogin}>Войти в систему</button>
                        </div>
                        <div className="hero-note"><span className="dot"></span> Ваши данные защищены. Работает прямо в браузере — ничего устанавливать не нужно</div>
                    </div>

                    <div className="hero-visual">
                        <div
                            className="laptop-wrap"
                            ref={laptopWrapRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div
                                className="laptop-tilt"
                                style={{
                                    transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                                    transition: (tilt.x === 0 && tilt.y === 0) ? 'transform .6s ease' : 'transform .12s ease-out',
                                }}
                            >
                                <div className="laptop">
                                    <div className="laptop-screen">
                                        <div className="dash-topbar">
                                            <div className="greet">Добрый вечер 👋<span>Продолжим обучение?</span></div>
                                            <div className="dash-avatar"></div>
                                        </div>
                                        <div className="tile-grid">
                                            <div className="tile t1"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                                            <div className="tile t2"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div>
                                            <div className="tile t3"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
                                            <div className="tile t4"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg></div>
                                        </div>
                                        <div className="dash-row">
                                            <div className="glass-card">
                                                <div className="label">Прогресс за неделю</div>
                                                <div className="bar-row">
                                                    {BAR_HEIGHTS.map((h, i) => (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                height: barsIn ? `${h}%` : '0%',
                                                                transition: 'height .9s cubic-bezier(.16,1,.3,1)',
                                                                transitionDelay: `${i * 0.07}s`,
                                                            }}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="glass-card ring-card">
                                                <div className="ring"></div>
                                                <div className="label" style={{ margin: 0 }}>Курс пройден</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="laptop-base"></div>

                                    <div className="float-badge fb1">
                                        <div className="ic">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <div>Тест пройден<span>Результат: 98%</span></div>
                                    </div>
                                    <div className="float-badge fb2">
                                        <div className="ic">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                        </div>
                                        <div>Прогресс растёт<span>+24% за месяц</span></div>
                                    </div>
                                    <svg className="cap-badge" viewBox="0 0 100 100" fill="none">
                                        <defs>
                                            <linearGradient id="capGradSmall" x1="0" y1="0" x2="100" y2="100">
                                                <stop offset="0%" stopColor="#8a5cff" />
                                                <stop offset="100%" stopColor="#c25bff" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M50 20 10 38l40 18 40-18-40-18z" fill="url(#capGradSmall)" />
                                        <path d="M28 46v16c0 6 10 11 22 11s22-5 22-11V46l-22 10-22-10z" fill="url(#capGradSmall)" opacity=".85" />
                                        <line x1="85" y1="40" x2="85" y2="64" stroke="url(#capGradSmall)" strokeWidth="2.4" />
                                        <circle cx="85" cy="67" r="3.4" fill="url(#capGradSmall)" />
                                    </svg>
                                    <div className="pin-badge">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9b3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tech-strip">
                <div className="tech-head">Собрано на современном стеке</div>
                <div className="tech-inner">
                    <div className="tech-item">
                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.2" fill="#61dafb" /><g stroke="#61dafb" strokeWidth="1.4"><ellipse cx="12" cy="12" rx="10" ry="4.2" /><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" /></g></svg>
                        React
                    </div>
                    <div className="tech-item">
                        <svg viewBox="0 0 24 24"><path d="M12 2 2 5l1.6 15L12 22l8.4-2L22 5 12 2z" fill="#8f5cff" /><path d="M12 2v20l8.4-2L22 5 12 2z" fill="#c15bff" /></svg>
                        Vite
                    </div>
                    <div className="tech-item">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.4.8 2 1.4.9 1 2 2.1 4.5 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.4-.8-2-1.4-.9-1-2-2.1-4.5-2.1zM7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.4.8 2 1.4.9 1 2 2.1 4.5 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.4-.8-2-1.4-.9-1-2-2.1-4.5-2.1z" fill="#38bdf8" /></svg>
                        Tailwind CSS
                    </div>
                    <div className="tech-item">
                        <svg viewBox="0 0 24 24" fill="#e879f9"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" /></svg>
                        Flowbite Motion
                    </div>
                    <div className="tech-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="20" x2="4" y2="12" /><line x1="12" y1="20" x2="12" y2="6" /><line x1="20" y1="20" x2="20" y2="15" /></svg>
                        Chart.js
                    </div>
                </div>
            </section>

            {/* Раньше здесь были придуманные цифры (1000+ пользователей, 5000+ тестов).
                Заменили на список того, что реально работает в платформе. */}
            <section className="capabilities">
                <div className="cap-head">Что уже работает в платформе</div>
                <div className="cap-grid">
                    {CAPABILITIES.map((item) => (
                        <div className="cap-item" key={item.id}>
                            <div className="cap-ic">{item.icon}</div>
                            <div className="cap-label">{item.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="features" id="features">
                <span className="eyebrow2">почему выбирают нас</span>
                <h2>Всё для вашего <span className="grad">успеха</span></h2>
                <div className="feat-grid">
                    <div className="feat-card">
                        <div className="ic ic-1"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                        <h3>Умное обучение</h3>
                        <p>Интерактивные материалы и тесты для максимально эффективного усвоения знаний.</p>
                    </div>
                    <div className="feat-card">
                        <div className="ic ic-2"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
                        <h3>Надёжность и безопасность</h3>
                        <p>Ваши данные под надёжной защитой с современным шифрованием.</p>
                    </div>
                    <div className="feat-card">
                        <div className="ic ic-3"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div>
                        <h3>Быстрый доступ</h3>
                        <p>Работайте с платформой в любое время и с любого устройства.</p>
                    </div>
                    <div className="feat-card">
                        <div className="ic ic-4"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg></div>
                        <h3>Аналитика и прогресс</h3>
                        <p>Отслеживайте результаты и улучшайте свои показатели день за днём.</p>
                    </div>
                </div>
            </section>

            {/* Новая секция — раньше ссылка "О платформе" в шапке никуда не вела. */}
            <section className={`about${aboutVisible ? ' visible' : ''}`} id="about" ref={aboutRef}>
                <div className="about-inner">
                    <div className="about-media">
                        <img
                            src="https://images.unsplash.com/photo-1758270705290-62b6294dd044?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                            alt="Студенты за ноутбуком во время занятия"
                            loading="lazy"
                        />
                    </div>
                    <div className="about-text">
                        <span className="eyebrow2">о платформе</span>
                        <h2>Учиться и сразу <span className="grad">проверять себя</span></h2>
                        <p>Ultimate LMS Platform объединяет то, что обычно разбросано по разным сервисам: тесты и экзамены, флеш-карты для повторения, тренажёр Excel, тренажёр слепой печати и кодовую песочницу для практики.</p>
                        <p>Если что-то непонятно — рядом встроенный ИИ-чат, который отвечает на вопросы по материалу, а личный кабинет хранит весь прогресс на одном месте.</p>
                    </div>
                </div>
            </section>

            <section className="quote-section">
                <div className="quote-inner">
                    <div>
                        <div className="quote-mark">&ldquo;</div>
                        <div className="quote-text">Образование — это ключ к <span className="grad">будущему.</span><br />Начните свой путь уже сегодня.</div>
                    </div>
                    <div className="quote-cap">
                        <svg viewBox="0 0 100 100" fill="none">
                            <defs>
                                <linearGradient id="capGrad" x1="0" y1="0" x2="100" y2="100">
                                    <stop offset="0%" stopColor="#8a5cff" />
                                    <stop offset="100%" stopColor="#c25bff" />
                                </linearGradient>
                            </defs>
                            <path d="M50 20 10 38l40 18 40-18-40-18z" fill="url(#capGrad)" />
                            <path d="M28 46v16c0 6 10 11 22 11s22-5 22-11V46l-22 10-22-10z" fill="url(#capGrad)" opacity=".85" />
                            <line x1="85" y1="40" x2="85" y2="64" stroke="url(#capGrad)" strokeWidth="2.4" />
                            <circle cx="85" cy="67" r="3.4" fill="url(#capGrad)" />
                        </svg>
                    </div>
                </div>
            </section>

            <footer>
                <div className="footer-inner">
                    <div className="logo">
                        <div className="logo-mark" style={{ width: '28px', height: '28px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3L2 8l10 5 8-4.2V15h1V8L12 3z" fill="#fff" />
                                <path d="M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5l-6 3.15-6-3.15z" fill="#fff" opacity=".85" />
                            </svg>
                        </div>
                        <div className="logo-text" style={{ fontSize: '12px' }}>
                            <b>Ultimate LMS</b>
                            <small>PLATFORM</small>
                        </div>
                    </div>
                    <div className="copyright">© 2026 Ultimate LMS Platform. Все права защищены.</div>
                    <div className="footer-links">
                        <a href="#">Политика конфиденциальности</a>
                        <a href="#">Условия использования</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

Object.assign(window, { LandingView });
