const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ---------------------------------------------------------------------------
// Иконки. Простые линейные SVG вместо эмодзи — единый вес линии, единый размер,
// цвет наследуется через currentColor, поэтому иконки всегда совпадают с текстом.
// ---------------------------------------------------------------------------
const Icon = ({ name, size = 20 }) => {
    const common = {
        width: size, height: size, viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: 2,
        strokeLinecap: 'round', strokeLinejoin: 'round',
    };
    switch (name) {
        case 'sun':
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8" />
                </svg>
            );
        case 'moon':
            return (
                <svg {...common}>
                    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
                </svg>
            );
        case 'close':
            return (
                <svg {...common}>
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            );
        case 'edit':
            return (
                <svg {...common}>
                    <path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5Z" />
                </svg>
            );
        case 'chat':
            return (
                <svg {...common}>
                    <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4Z" />
                    <path d="M8 10h8M8 13h5" />
                </svg>
            );
        case 'keyboard':
            return (
                <svg {...common}>
                    <rect x="3" y="6.5" width="18" height="11" rx="2" />
                    <path d="M6.5 10h.01M9.5 10h.01M12.5 10h.01M15.5 10h.01M17.5 10h.01M6.5 13.5h11" />
                </svg>
            );
        case 'zap':
            return (
                <svg {...common}>
                    <path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13L12.5 3Z" />
                </svg>
            );
        case 'code':
            return (
                <svg {...common}>
                    <path d="M9 8 4.5 12 9 16M15 8l4.5 4-4.5 4" />
                </svg>
            );
        case 'cards':
            return (
                <svg {...common}>
                    <rect x="3.5" y="7.5" width="12" height="9" rx="1.6" transform="rotate(-8 9.5 12)" />
                    <rect x="8.5" y="7.5" width="12" height="9" rx="1.6" />
                </svg>
            );
        case 'chart':
            return (
                <svg {...common}>
                    <path d="M5 20V10M12 20V4M19 20v-7" />
                    <path d="M3 20h18" />
                </svg>
            );
        case 'shield':
            return (
                <svg {...common}>
                    <path d="M12 3.5 5 6v6c0 4.2 2.9 7 7 8.5 4.1-1.5 7-4.3 7-8.5V6l-7-2.5Z" />
                    <path d="m9.3 12 1.9 1.9L15 10" />
                </svg>
            );
        case 'logout':
            return (
                <svg {...common}>
                    <path d="M13 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H13" />
                    <path d="M16.5 8.5 21 12l-4.5 3.5M21 12H10" />
                </svg>
            );
        case 'back':
            return (
                <svg {...common}>
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
            );
        default:
            return null;
    }
};

// Единая конфигурация модулей — цвета, иконки и подписи в одном месте,
// чтобы дизайн был согласованным и его было легко менять.
const MODULE_CONFIG = {
    typing:     { icon: 'keyboard', label: 'Тренажер печати',   gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
    hotkeys:    { icon: 'zap',      label: 'Горячие клавиши',    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    code:       { icon: 'code',     label: 'VS School',          gradient: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)' },
    flashcards: { icon: 'cards',    label: 'Умные карточки',     gradient: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)' },
    excel:      { icon: 'chart',    label: 'Тренажер Excel',     gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
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

const NavButton = ({ isActive, gradient, icon, label, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
        <Button
            onClick={onClick}
            style={isActive ? backButtonStyle(gradient) : navButtonBaseStyle(gradient)}
        >
            <span style={{ marginRight: 12, display: 'flex' }}>
                <Icon name={isActive ? 'back' : icon} />
            </span>
            {isActive ? 'В меню' : label}
        </Button>
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
                                <motion.div whileTap={{ scale: 0.9, rotate: 15 }}>
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
                                            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        title="Сменить тему"
                                    >
                                        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
                                    </Button>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="muted"
                                        onClick={onClose}
                                        style={{
                                            width: 42, height: 42, padding: 0, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Icon name="close" size={18} />
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
                                    <span
                                        onClick={changeNickname}
                                        style={{ cursor: 'pointer', opacity: 0.7, flexShrink: 0, display: 'flex' }}
                                        title="Изменить никнейм"
                                    >
                                        <Icon name="edit" size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Навигация */}
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: 10,
                            marginTop: 16, flex: 1, overflowY: 'auto', paddingRight: 4,
                        }}>
                            {allowedModules.includes('chat') && (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        variant="teal"
                                        onClick={() => { setIsChatOpen(true); onClose(); }}
                                        style={{ justifyContent: 'flex-start', padding: '0 18px', height: 56, minHeight: 56, borderRadius: 16 }}
                                    >
                                        <span style={{ marginRight: 12, display: 'flex' }}><Icon name="chat" /></span> Открыть чат
                                    </Button>
                                </motion.div>
                            )}

                            {Object.entries(MODULE_CONFIG).map(([key, cfg]) => (
                                allowedModules.includes(key) && (
                                    <NavButton
                                        key={key}
                                        isActive={view === key}
                                        gradient={cfg.gradient}
                                        icon={cfg.icon}
                                        label={cfg.label}
                                        onClick={goTo(key)}
                                    />
                                )
                            ))}

                            {isAdmin && (
                                <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px dashed var(--glass-border)' }}>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                        <Button
                                            variant="red"
                                            onClick={goTo('admin')}
                                            style={{
                                                justifyContent: 'flex-start', padding: '0 18px',
                                                height: 56, minHeight: 56, borderRadius: 16, fontWeight: 700,
                                            }}
                                        >
                                            <span style={{ marginRight: 12, display: 'flex' }}>
                                                <Icon name={view === 'admin' ? 'back' : 'shield'} />
                                            </span>
                                            {view === 'admin' ? 'В меню' : 'Админка'}
                                        </Button>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Выход */}
                        <div style={{ paddingTop: 16, flexShrink: 0 }}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
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
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    }}
                                >
                                    <Icon name="logout" size={17} /> ВЫЙТИ
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

Object.assign(window, { SidebarMenu });
