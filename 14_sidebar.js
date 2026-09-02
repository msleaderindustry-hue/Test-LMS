const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Единая конфигурация модулей — цвета, иконки и подписи в одном месте,
// чтобы дизайн был согласованным и его было легко менять.
const MODULE_CONFIG = {
    typing:     { icon: '⌨️', label: 'Тренажер печати',   gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
    hotkeys:    { icon: '⚡', label: 'Горячие клавиши',    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    code:       { icon: '💻', label: 'VS School',          gradient: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)' },
    flashcards: { icon: '🎴', label: 'Умные карточки',     gradient: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)' },
    excel:      { icon: '📊', label: 'Тренажер Excel',     gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
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
            <span style={{ marginRight: 12, fontSize: 18 }}>{isActive ? '⬅' : icon}</span>
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
                                        {theme === 'dark' ? '☀️' : '🌙'}
                                    </Button>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="muted"
                                        onClick={onClose}
                                        style={{
                                            width: 42, height: 42, padding: 0, borderRadius: '50%',
                                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        ✖
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
                                        style={{ cursor: 'pointer', fontSize: 14, opacity: 0.7, flexShrink: 0 }}
                                        title="Изменить никнейм"
                                    >
                                        ✏️
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
                                        <span style={{ marginRight: 12, fontSize: 18 }}>💬</span> Открыть чат
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
                                            <span style={{ marginRight: 12, fontSize: 18 }}>{view === 'admin' ? '⬅' : '🛡️'}</span>
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
                                    }}
                                >
                                    ВЫЙТИ
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
