const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =========================================================================
   ЖИВЫЕ ИКОНКИ
   Каждая иконка — motion.svg с variants "rest" / "hover".
   Родительская кнопка задаёт whileHover="hover" initial="rest" —
   Framer Motion сам "прокидывает" состояние вниз по дереву на все
   дочерние motion-элементы с такими же именами вариантов,
   поэтому отдельно триггерить анимацию в каждой иконке не нужно.
   ========================================================================= */

const iconWrap = {
    rest: {},
    hover: {},
};

// Солнце/Луна — плавный поворот при наведении
const ThemeIcon = ({ isDark }) => (
    <motion.svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        variants={{ rest: { rotate: 0 }, hover: { rotate: 90 } }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
    >
        {isDark ? (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
            <>
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5" />
                    <path d="M18.4 5.6l-1.55 1.55M7.15 16.85 5.6 18.4M18.4 18.4l-1.55-1.55M7.15 7.15 5.6 5.6" />
                </g>
            </>
        )}
    </motion.svg>
);

// Крестик — лёгкий поворот в X
const CloseIcon = () => (
    <motion.svg
        width="15" height="15" viewBox="0 0 24 24" fill="none"
        variants={{ rest: { rotate: 0 }, hover: { rotate: 90 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
    >
        <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
);

// Карандаш — покачивается, будто пишет
const PencilIcon = () => (
    <motion.svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        variants={{
            rest: { rotate: 0, x: 0, y: 0 },
            hover: { rotate: [0, -12, 8, -6, 0], x: [0, -1, 1, -0.5, 0], y: [0, 1, -1, 0.5, 0] },
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
        <path d="M4 20l1-4.2L15.6 5.2a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 6.8l3.2 3.2" stroke="currentColor" strokeWidth="1.6" />
    </motion.svg>
);

// Чат — три точки пульсируют по очереди ("печатает")
const ChatIcon = () => {
    const dot = (delay) => ({
        rest: { opacity: 0.5, y: 0 },
        hover: { opacity: [0.5, 1, 0.5], y: [0, -2, 0], transition: { duration: 0.9, repeat: Infinity, delay } },
    });
    return (
        <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
            <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 4V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <motion.circle cx="9" cy="11" r="1.2" fill="currentColor" variants={dot(0)} />
            <motion.circle cx="13" cy="11" r="1.2" fill="currentColor" variants={dot(0.15)} />
            <motion.circle cx="17" cy="11" r="1.2" fill="currentColor" variants={dot(0.3)} />
        </motion.svg>
    );
};

// Клавиатура — клавиши "нажимаются" волной
const KeyboardIcon = () => {
    const key = (delay) => ({
        rest: { y: 0 },
        hover: { y: [0, 1.6, 0], transition: { duration: 0.5, delay } },
    });
    return (
        <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
            <rect x="2.5" y="6" width="19" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
            {[5, 8.3, 11.6, 14.9, 18.2].map((x, i) => (
                <motion.rect key={x} x={x} y="9.5" width="2" height="2" rx="0.4"
                    fill="currentColor" variants={key(i * 0.06)} />
            ))}
            <motion.rect x="6" y="13.5" width="12" height="2" rx="0.6"
                fill="currentColor" variants={key(0.3)} />
        </motion.svg>
    );
};

// Молния — лёгкая пульсация свечения
const BoltIcon = () => (
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        variants={{
            rest: { scale: 1, filter: 'drop-shadow(0 0 0px currentColor)' },
            hover: {
                scale: [1, 1.12, 1],
                filter: ['drop-shadow(0 0 0px currentColor)', 'drop-shadow(0 0 4px currentColor)', 'drop-shadow(0 0 0px currentColor)'],
                transition: { duration: 0.7, repeat: Infinity },
            },
        }}
    >
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
    </motion.svg>
);

// Код "<>" — скобки раздвигаются
const CodeIcon = () => (
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
        <motion.path d="M9 6 3 12l6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
            variants={{ rest: { x: 0 }, hover: { x: -2 } }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} />
        <motion.path d="M15 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
            variants={{ rest: { x: 0 }, hover: { x: 2 } }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} />
    </motion.svg>
);

// Карточки — веерятся
const CardsIcon = () => (
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
        <motion.rect x="4" y="5" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"
            variants={{ rest: { rotate: -6, x: 0 }, hover: { rotate: -16, x: -2 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }} style={{ transformOrigin: '10px 20px' }} />
        <motion.rect x="8" y="4" width="12" height="15" rx="2" fill="var(--sidebar-bg,#1c1c22)" stroke="currentColor" strokeWidth="1.6"
            variants={{ rest: { rotate: 6, x: 0 }, hover: { rotate: 16, x: 2 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }} style={{ transformOrigin: '14px 19px' }} />
    </motion.svg>
);

// График — столбики "вырастают"
const ChartIcon = () => {
    const bar = (h, delay) => ({
        rest: { scaleY: 0.55 },
        hover: { scaleY: h, transition: { type: 'spring', stiffness: 300, damping: 14, delay } },
    });
    return (
        <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
            <motion.rect x="4" y="10" width="3.6" height="10" rx="1" fill="currentColor" style={{ transformOrigin: '5.8px 20px' }} variants={bar(0.7, 0)} />
            <motion.rect x="10.2" y="6" width="3.6" height="14" rx="1" fill="currentColor" style={{ transformOrigin: '12px 20px' }} variants={bar(1, 0.06)} />
            <motion.rect x="16.4" y="12" width="3.6" height="8" rx="1" fill="currentColor" style={{ transformOrigin: '18.2px 20px' }} variants={bar(0.85, 0.12)} />
        </motion.svg>
    );
};

// Щит — галочка "прорисовывается"
const ShieldIcon = () => (
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
        <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <motion.path d="M8.5 12.2l2.4 2.4 4.6-5"
            stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
            initial={false}
            variants={{ rest: { pathLength: 0.55, opacity: 0.6 }, hover: { pathLength: 1, opacity: 1 } }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
    </motion.svg>
);

// Выход — стрелка выезжает и подпрыгивает
const LogoutIcon = () => (
    <motion.svg width="17" height="17" viewBox="0 0 24 24" fill="none" variants={iconWrap}>
        <path d="M9 4H5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5 20h4"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <motion.g variants={{ rest: { x: 0 }, hover: { x: [0, 3, 1.5, 3], transition: { duration: 0.5 } } }}>
            <path d="M13 8l4.5 4L13 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.5 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </motion.g>
    </motion.svg>
);

// Назад — стрелка скользит влево
const BackIcon = () => (
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        variants={{ rest: { x: 0 }, hover: { x: -3 } }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
    >
        <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 12H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
);

// Бейдж-подложка под иконку — даёт глубину и отделяет иконку от текста,
// вместо того чтобы она "плавала" прямо на градиенте.
const IconBadge = ({ children, size = 34 }) => (
    <motion.span
        variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
        style={{
            width: size, height: size, minWidth: size, borderRadius: '30%',
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35), 0 2px 6px -2px rgba(0,0,0,0.35)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}
    >
        {children}
    </motion.span>
);

/* =========================================================================
   КОНФИГ МОДУЛЕЙ
   ========================================================================= */

const MODULE_CONFIG = {
    typing:     { Icon: KeyboardIcon, label: 'Тренажер печати',  gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
    hotkeys:    { Icon: BoltIcon,     label: 'Горячие клавиши',   gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    code:       { Icon: CodeIcon,     label: 'VS School',         gradient: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)' },
    flashcards: { Icon: CardsIcon,    label: 'Умные карточки',    gradient: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)' },
    excel:      { Icon: ChartIcon,    label: 'Тренажер Excel',    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
};

const navButtonBaseStyle = (gradient) => ({
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '0 18px',
    height: 56,
    minHeight: 56,
    borderRadius: 16,
    border: 'none',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: 0.2,
    background: gradient,
    boxShadow: '0 6px 16px -6px rgba(0,0,0,0.35)',
    display: 'flex',
});

const backButtonStyle = (gradient) => ({
    ...navButtonBaseStyle(gradient),
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: 13,
    filter: 'grayscale(0.15) brightness(0.92)',
});

const NavButton = ({ isActive, gradient, Icon, label, onClick }) => (
    <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        whileTap={{ scale: 0.97 }}
        style={{ ['--sidebar-bg']: 'transparent' }}
    >
        <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.02 } }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <Button
                onClick={onClick}
                style={isActive ? backButtonStyle(gradient) : navButtonBaseStyle(gradient)}
            >
                <span style={{ marginRight: 13, display: 'inline-flex' }}>
                    <IconBadge>{isActive ? <BackIcon /> : <Icon />}</IconBadge>
                </span>
                {isActive ? 'В меню' : label}
            </Button>
        </motion.div>
    </motion.div>
);

const SidebarMenu = ({
    isOpen, onClose, theme, setTheme, user, userNickname, changeNickname,
    allowedModules, isAdmin, view, setView, setIsChatOpen
}) => {
    const initial = (userNickname || user?.email || '?').trim().charAt(0).toUpperCase();

    const goTo = (target) => () => {
        setView(view === target ? 'menu' : target);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Затемнение фона */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.45)',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                            zIndex: 2000,
                        }}
                    />

                    {/* Само меню */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        className="glass-sidebar"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '22px 18px',
                            zIndex: 2001,
                        }}
                    >
                        {/* Шапка */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            paddingBottom: 16, marginBottom: 4,
                            borderBottom: '1px solid var(--glass-border)', flexShrink: 0,
                        }}>
                            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: -0.3 }}>Меню</h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <motion.div initial="rest" whileHover="hover" whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="muted"
                                        onClick={() => {
                                            const nextTheme = theme === 'dark' ? 'light' : 'dark';
                                            if (document.startViewTransition) {
                                                document.startViewTransition(() => setTheme(nextTheme));
                                            } else {
                                                setTheme(nextTheme);
                                            }
                                        }}
                                        style={{
                                            width: 42, height: 42, padding: 0, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        title="Сменить тему"
                                    >
                                        <ThemeIcon isDark={theme === 'dark'} />
                                    </Button>
                                </motion.div>
                                <motion.div initial="rest" whileHover="hover" whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="muted"
                                        onClick={onClose}
                                        style={{
                                            width: 42, height: 42, padding: 0, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <CloseIcon />
                                    </Button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Профиль */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 2px 18px', borderBottom: '1px solid var(--glass-border)',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: 18,
                                boxShadow: '0 4px 12px -4px rgba(79,70,229,0.6)',
                            }}>
                                {initial}
                            </div>
                            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, opacity: 0.55, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>
                                    Аккаунт
                                </div>
                                <div style={{
                                    fontSize: 15, fontWeight: 600, color: 'var(--text-main)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {userNickname || user?.email}
                                    </span>
                                    <motion.span
                                        onClick={changeNickname}
                                        initial="rest"
                                        whileHover="hover"
                                        style={{ cursor: 'pointer', opacity: 0.75, flexShrink: 0, display: 'inline-flex' }}
                                        title="Изменить никнейм"
                                    >
                                        <PencilIcon />
                                    </motion.span>
                                </div>
                            </div>
                        </div>

                        {/* Навигация */}
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: 10,
                            marginTop: 16, flex: 1, overflowY: 'auto', paddingRight: 4,
                        }}>
                            {allowedModules.includes('chat') && (
                                <motion.div initial="rest" whileHover="hover" whileTap={{ scale: 0.97 }}>
                                    <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.02 } }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                        <Button
                                            variant="teal"
                                            onClick={() => { setIsChatOpen(true); onClose(); }}
                                            style={{ justifyContent: 'flex-start', padding: '0 18px', height: 56, minHeight: 56, borderRadius: 16 }}
                                        >
                                            <span style={{ marginRight: 13, display: 'inline-flex' }}>
                                                <IconBadge><ChatIcon /></IconBadge>
                                            </span>
                                            Открыть чат
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}

                            {Object.entries(MODULE_CONFIG).map(([key, cfg]) => (
                                allowedModules.includes(key) && (
                                    <NavButton
                                        key={key}
                                        isActive={view === key}
                                        gradient={cfg.gradient}
                                        Icon={cfg.Icon}
                                        label={cfg.label}
                                        onClick={goTo(key)}
                                    />
                                )
                            ))}

                            {isAdmin && (
                                <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px dashed var(--glass-border)' }}>
                                    <motion.div initial="rest" whileHover="hover" whileTap={{ scale: 0.97 }}>
                                        <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.02 } }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                            <Button
                                                variant="red"
                                                onClick={goTo('admin')}
                                                style={{
                                                    justifyContent: 'flex-start', padding: '0 18px',
                                                    height: 56, minHeight: 56, borderRadius: 16, fontWeight: 700,
                                                }}
                                            >
                                                <span style={{ marginRight: 13, display: 'inline-flex' }}>
                                                    <IconBadge>{view === 'admin' ? <BackIcon /> : <ShieldIcon />}</IconBadge>
                                                </span>
                                                {view === 'admin' ? 'В меню' : 'Админка'}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Выход */}
                        <div style={{ paddingTop: 16, flexShrink: 0 }}>
                            <motion.div initial="rest" whileHover="hover" whileTap={{ scale: 0.97 }}>
                                <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.02 } }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                    <Button
                                        variant="muted"
                                        onClick={() => { window.auth.signOut(); onClose(); }}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.12)',
                                            color: '#ef4444',
                                            height: 52,
                                            borderRadius: 14,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        }}
                                    >
                                        <LogoutIcon />
                                        ВЫЙТИ
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

Object.assign(window, { SidebarMenu });
