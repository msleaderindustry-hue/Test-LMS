// --- 16_admin.js ---
const { useState, useEffect, useRef, useMemo } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

const AVAILABLE_MODULES = [
    { id: 'chat', icon: '💬', label: 'Чат', color: '#06b6d4' },
    { id: 'typing', icon: '⌨️', label: 'Печать', color: '#818cf8' },
    { id: 'hotkeys', icon: '⚡', label: 'Хоткеи', color: '#fbbf24' },
    { id: 'code', icon: '💻', label: 'VS School', color: '#2dd4bf' },
    { id: 'flashcards', icon: '🎴', label: 'Карточки', color: '#3b82f6' },
    { id: 'excel', icon: '📊', label: 'Excel', color: '#10b981' }
];

const TABS = [
    { id: 'control', icon: '👤', label: 'Управление', color: '#38bdf8' },
    { id: 'settings', icon: '⚙️', label: 'Настройки', color: '#a855f7' },
    { id: 'tests', icon: '📝', label: 'Тесты', color: '#10b981' }
];

const AVATAR_PALETTE = [
    ['#38bdf8', '#6366f1'], ['#f472b6', '#ec4899'], ['#34d399', '#10b981'],
    ['#fbbf24', '#f59e0b'], ['#a78bfa', '#8b5cf6'], ['#2dd4bf', '#06b6d4'],
    ['#fb7185', '#f43f5e'], ['#60a5fa', '#3b82f6']
];

function hashString(str) {
    let h = 0;
    for (let i = 0; i < (str || '').length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return Math.abs(h);
}

function getInitials(nameOrEmail) {
    if (!nameOrEmail) return '?';
    const clean = nameOrEmail.split('@')[0].trim();
    const parts = clean.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase();
}

function avatarGradient(id) {
    const pair = AVATAR_PALETTE[hashString(id) % AVATAR_PALETTE.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

/* ---------------- Toasts ---------------- */

const ToastStack = ({ toasts }) => (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px' }}>
        <AnimatePresence>
            {toasts.map(t => (
                <motion.div key={t.id} layout initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, color: '#fff', boxShadow: '0 12px 28px -8px rgba(0,0,0,0.35)', background: t.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <span style={{ fontSize: '16px' }}>{t.type === 'error' ? '⚠️' : '✅'}</span>
                    <span style={{ lineHeight: 1.35 }}>{t.message}</span>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

/* ---------------- Confirm dialog ---------------- */

const ConfirmDialog = ({ state, onCancel, onConfirm }) => (
    <AnimatePresence>
        {state && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '22px', padding: '26px', width: '100%', maxWidth: '380px', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.45)' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px', background: state.danger ? 'rgba(239,68,68,0.12)' : 'rgba(56,189,248,0.12)' }}>
                        {state.danger ? '⚠️' : 'ℹ️'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '17px', marginBottom: '8px', color: 'var(--text-main)' }}>{state.title}</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-sec)', lineHeight: 1.5, marginBottom: '22px' }}>{state.message}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="muted" onClick={onCancel} style={{ flex: 1, height: '44px', borderRadius: '13px', fontSize: '12.5px' }}>Отмена</Button>
                        <Button variant={state.danger ? 'red' : 'green'} onClick={onConfirm} style={{ flex: 1, height: '44px', borderRadius: '13px', fontSize: '12.5px' }}>{state.confirmLabel || 'Подтвердить'}</Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

/* ---------------- Access revoked lockout ---------------- */

const AccessRevokedOverlay = ({ reason }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 10002, background: 'rgba(8,10,20,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ background: 'var(--bg-body)', borderRadius: '24px', padding: '34px', textAlign: 'center', maxWidth: '340px', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)' }}>
            <motion.div animate={{ rotate: [0, -8, 8, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.6 }} style={{ fontSize: '46px', marginBottom: '14px' }}>🔒</motion.div>
            <div style={{ fontWeight: 900, fontSize: '17px', marginBottom: '8px', color: 'var(--text-main)' }}>Доступ отозван</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-sec)', lineHeight: 1.5 }}>{reason}</div>
            <div style={{ marginTop: '20px', height: '4px', borderRadius: '2px', background: 'var(--glass-border)', overflow: 'hidden' }}>
                <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.9, ease: 'linear' }} style={{ height: '100%', background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
            </div>
        </motion.div>
    </motion.div>
);

/* ---------------- Skeleton loader ---------------- */

const SkeletonCard = ({ i }) => (
    <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
        style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '22px', padding: '22px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--glass-border)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: '14px', borderRadius: '7px', background: 'var(--glass-border)', marginBottom: '8px' }} />
            <div style={{ width: '65%', height: '10px', borderRadius: '5px', background: 'var(--glass-border)' }} />
        </div>
    </motion.div>
);

/* ---------------- Small spinner for pending actions ---------------- */

const Spinner = () => (
    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'inline-block', width: '13px', height: '13px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />
);

/* ---------------- User card ---------------- */

const UserAdminCard = ({ u, currentUserUid, isSelf, pending, toggleAdmin, toggleBan, handleAssignTestFile, toggleExcelHints, toggleModuleAccess, hasAccess, removeTest }) => {
    const [activeTab, setActiveTab] = useState('control');
    const testCount = (u.assignedTests && u.assignedTests.length) || 0;

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            style={{ background: 'var(--bg-body)', border: isSelf ? '1.5px solid rgba(56,189,248,0.35)' : '1px solid var(--glass-border)', borderRadius: '22px', padding: '22px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', position: 'relative', opacity: pending ? 0.7 : 1, pointerEvents: pending ? 'none' : 'auto', transition: 'opacity 0.2s' }}>

            {pending && (
                <div style={{ position: 'absolute', top: '18px', right: '18px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-sec)' }}>
                    <span style={{ display: 'inline-block', width: '11px', height: '11px', borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: '#38bdf8' }} />
                    Сохранение…
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: u.isBanned ? '20px' : '15px', fontWeight: 900, color: '#fff', background: u.isBanned ? 'rgba(239, 68, 68, 0.85)' : avatarGradient(u.id), border: `1.5px solid ${u.isBanned ? 'rgba(239,68,68,0.4)' : 'transparent'}`, boxShadow: u.isBanned ? 'none' : '0 6px 16px -6px rgba(56,189,248,0.5)' }}>
                    {u.isBanned ? '🚫' : getInitials(u.nickname || u.email)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ fontWeight: 800, fontSize: '15.5px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nickname || u.email}</div>
                        {isSelf && <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '2px 7px', borderRadius: '6px', flexShrink: 0 }}>ВЫ</span>}
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', color: u.isBanned ? '#ef4444' : '#10b981' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isBanned ? '#ef4444' : '#10b981', display: 'inline-block' }} />{u.isBanned ? 'Заблокирован' : 'Активен'}
                        </span>
                        {u.role === 'admin' && <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', padding: '2px 7px', borderRadius: '6px', fontWeight: 800, fontSize: '10px', letterSpacing: '0.3px' }}>АДМИН</span>}
                        <span style={{ color: 'var(--text-sec)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                    </div>
                </div>
            </div>

            <div className="modern-scroll" style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', overflowX: 'auto' }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ position: 'relative', cursor: 'pointer', padding: '8px 15px', borderRadius: '12px', fontWeight: 800, fontSize: '12.5px', transition: 'color 0.2s', whiteSpace: 'nowrap', color: isActive ? tab.color : 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isActive && <motion.div layoutId={`tab-bg-${u.id}`} transition={{ type: 'spring', stiffness: 500, damping: 35 }} style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: `${tab.color}17`, border: `1px solid ${tab.color}40` }} />}
                            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>{tab.icon} {tab.label}{tab.id === 'tests' ? ` (${testCount})` : ''}</span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
                    {activeTab === 'control' && (
                        <div>
                            {!isSelf ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%' }}>
                                    <Button variant={u.role === 'admin' ? "orange" : "muted"} onClick={() => toggleAdmin(u)} style={{ height: '44px', borderRadius: '13px', fontSize: '11px', textTransform: 'uppercase' }}>{u.role === 'admin' ? "Снять админа" : "Дать админа"}</Button>
                                    <label style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '13px', height: '44px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                                        📁 Назначить тест <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                    </label>
                                    <Button variant={u.isBanned ? "green" : "red"} onClick={() => toggleBan(u)} style={{ height: '44px', borderRadius: '13px', fontSize: '11px', textTransform: 'uppercase' }}>{u.isBanned ? "Разбанить" : "Забанить"}</Button>
                                </div>
                            ) : (<div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', borderRadius: '14px', color: '#d97706', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>⚠️ Вы не можете изменять базовые права собственного аккаунта</div>)}
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>⚙️ Настройки режимов</div>
                                <Button variant={u.excelHintsEnabled !== false ? "green" : "red"} onClick={() => toggleExcelHints(u)} style={{ height: '44px', borderRadius: '12px', fontSize: '11.5px', textTransform: 'uppercase' }}>
                                    {u.excelHintsEnabled !== false ? "💡 Подсказки Excel: включены" : "🔒 Подсказки Excel: режим экзамена"}
                                </Button>
                            </div>
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>Доступ к модулям платформы</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {AVAILABLE_MODULES.map(module => {
                                        const access = hasAccess(u, module.id);
                                        return (
                                            <motion.div key={module.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => toggleModuleAccess(u, module.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 13px', borderRadius: '11px', cursor: 'pointer', background: access ? `${module.color}17` : 'var(--bg-body)', border: `1.5px solid ${access ? `${module.color}55` : 'var(--glass-border)'}`, color: access ? module.color : 'var(--text-sec)', opacity: access ? 1 : 0.55 }}>
                                                <span style={{ fontSize: '14px', filter: access ? 'none' : 'grayscale(100%)' }}>{module.icon}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 800 }}>{module.label}</span>
                                                {access && <span style={{ fontSize: '10px' }}>✓</span>}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'tests' && (
                        <div>
                            {testCount === 0 ? (
                                <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '13px', fontWeight: 600, background: 'var(--bg-panel)', borderRadius: '14px', border: '1px dashed var(--glass-border)' }}>📭 Нет назначенных персональных тестов<br />Перейдите во вкладку «Управление», чтобы назначить новый тест</div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {u.assignedTests.map(test => (
                                        <div key={test.id} style={{ background: 'var(--bg-panel)', border: '1px dashed #3b82f6', color: '#3b82f6', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 12px 8px 14px', borderRadius: '12px' }}>
                                            <span>☁️ {test.title}</span>
                                            <div onClick={() => removeTest(u, test.id, test.title)} style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '10px' }}>✖</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

/* ---------------- Main panel ---------------- */

const AdminPanel = ({ onKicked }) => {
    const [users, setUsers] = useState(null); // null = loading, [] = loaded-empty
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const [pendingIds, setPendingIds] = useState(() => new Set());
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | admins | banned
    const [accessRevoked, setAccessRevoked] = useState(null); // null | reason string
    const kickedRef = useRef(false);

    const currentUserUid = window.auth?.currentUser?.uid;

    const pushToast = (message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    const revokeAccess = (reason) => {
        if (kickedRef.current) return;
        setAccessRevoked(reason);
    };

    // Fire onKicked shortly after showing the lockout screen, so the user
    // sees *why* they were removed instead of the panel just vanishing.
    useEffect(() => {
        if (!accessRevoked || kickedRef.current) return;
        kickedRef.current = true;
        const t = setTimeout(() => { if (onKicked) onKicked(); }, 900);
        return () => clearTimeout(t);
    }, [accessRevoked, onKicked]);

    // Primary data source: all users. IMPORTANT — this listener must have an
    // error handler. Firestore rules typically only let admins list the whole
    // collection, so the instant an admin is demoted/banned this listener
    // gets a permission-denied error. Without a handler that error is silent
    // and `users` simply freezes, which is why the panel used to stay open.
    useEffect(() => {
        if (!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(
            snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            () => revokeAccess('Ваши права были изменены, и доступ к списку пользователей больше недоступен.')
        );
        return () => unsub();
    }, []);

    // Defense in depth: listen directly to the current user's own document.
    // This catches ban/demotion even in setups where the collection-wide
    // listener above keeps working (e.g. more permissive rules).
    useEffect(() => {
        if (!window.db || !currentUserUid) return;
        const unsub = window.db.collection('users').doc(currentUserUid).onSnapshot(
            doc => {
                if (!doc.exists) return;
                const data = doc.data();
                if (data.isBanned) revokeAccess('Ваш аккаунт был заблокирован.');
                else if (data.role !== 'admin') revokeAccess('Права администратора были отозваны.');
            },
            () => revokeAccess('Не удалось подтвердить права доступа.')
        );
        return () => unsub();
    }, [currentUserUid]);

    const withPending = async (uid, action, successMsg) => {
        setPendingIds(prev => new Set(prev).add(uid));
        try {
            await action();
            if (successMsg) pushToast(successMsg);
        } catch (e) {
            pushToast('Не удалось выполнить действие. Попробуйте ещё раз.', 'error');
        } finally {
            setPendingIds(prev => { const n = new Set(prev); n.delete(uid); return n; });
        }
    };

    const toggleBan = (u) => {
        const willBan = !u.isBanned;
        setConfirmState({
            title: willBan ? 'Заблокировать пользователя?' : 'Снять блокировку?',
            message: willBan ? `${u.nickname || u.email} потеряет доступ ко всей платформе, включая открытые сейчас разделы.` : `${u.nickname || u.email} снова получит доступ к платформе.`,
            danger: willBan,
            confirmLabel: willBan ? 'Заблокировать' : 'Разблокировать',
            onConfirm: () => {
                setConfirmState(null);
                withPending(u.id, () => window.db.collection('users').doc(u.id).update({ isBanned: willBan }), willBan ? 'Пользователь заблокирован' : 'Блокировка снята');
            }
        });
    };

    const toggleAdmin = (u) => {
        const willBeAdmin = u.role !== 'admin';
        setConfirmState({
            title: willBeAdmin ? 'Выдать права администратора?' : 'Снять права администратора?',
            message: willBeAdmin ? `${u.nickname || u.email} получит полный доступ к панели управления.` : `${u.nickname || u.email} немедленно потеряет доступ к панели управления.`,
            danger: !willBeAdmin,
            confirmLabel: willBeAdmin ? 'Выдать' : 'Снять',
            onConfirm: () => {
                setConfirmState(null);
                withPending(u.id, () => window.db.collection('users').doc(u.id).update({ role: willBeAdmin ? 'admin' : 'student' }), willBeAdmin ? 'Права администратора выданы' : 'Права администратора сняты');
            }
        });
    };

    const toggleModuleAccess = (u, moduleId) => {
        let currentModules = u.allowedModules || AVAILABLE_MODULES.map(m => m.id);
        let newModules = currentModules.includes(moduleId) ? currentModules.filter(id => id !== moduleId) : [...currentModules, moduleId];
        withPending(u.id, () => window.db.collection('users').doc(u.id).update({ allowedModules: newModules }));
    };

    const toggleExcelHints = (u) => {
        const currentStatus = u.excelHintsEnabled !== false;
        withPending(u.id, () => window.db.collection('users').doc(u.id).update({ excelHintsEnabled: !currentStatus }));
    };

    const hasAccess = (user, moduleId) => !user.allowedModules || user.allowedModules.includes(moduleId);

    const handleAssignTestFile = (e, uid) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            let data;
            try { data = JSON.parse(ev.target.result); }
            catch (err) { pushToast('Файл повреждён или не является корректным JSON.', 'error'); return; }
            const title = prompt("Введите название теста:", "Тест от преподавателя");
            if (!title || !title.trim()) return;
            const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : { text: String(v), img: null }), correctIndex: t.correctIndex }));
            withPending(uid, async () => {
                const currentUser = (users || []).find(u => u.id === uid);
                if (!currentUser) throw new Error('user not found');
                await window.db.collection('users').doc(uid).update({ assignedTests: [...(currentUser.assignedTests || []), { id: Date.now(), title: title.trim(), data: normalized }] });
            }, 'Тест успешно назначен');
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const removeTest = (u, testId, testTitle) => {
        setConfirmState({
            title: 'Удалить тест?',
            message: `«${testTitle}» будет удалён у ${u.nickname || u.email}. Это действие нельзя отменить.`,
            danger: true,
            confirmLabel: 'Удалить',
            onConfirm: () => {
                setConfirmState(null);
                withPending(u.id, () => window.db.collection('users').doc(u.id).update({ assignedTests: (u.assignedTests || []).filter(t => t.id !== testId) }), 'Тест удалён');
            }
        });
    };

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        const q = search.trim().toLowerCase();
        return users.filter(u => {
            if (filter === 'admins' && u.role !== 'admin') return false;
            if (filter === 'banned' && !u.isBanned) return false;
            if (!q) return true;
            return (u.nickname || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        });
    }, [users, search, filter]);

    const adminCount = (users || []).filter(u => u.role === 'admin').length;
    const bannedCount = (users || []).filter(u => u.isBanned).length;

    const FILTERS = [
        { id: 'all', label: 'Все', count: (users || []).length },
        { id: 'admins', label: 'Админы', count: adminCount },
        { id: 'banned', label: 'Забанены', count: bannedCount }
    ];

    return (
        <>
            <ToastStack toasts={toasts} />
            <ConfirmDialog state={confirmState} onCancel={() => setConfirmState(null)} onConfirm={() => confirmState && confirmState.onConfirm()} />
            <AnimatePresence>{accessRevoked && <AccessRevokedOverlay reason={accessRevoked} />}</AnimatePresence>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="glass-panel" style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '26px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '22px', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 10px 24px -8px rgba(239,68,68,0.5)' }}>🛡️</div>
                        <div style={{ textAlign: 'left' }}><h2 style={{ margin: 0, fontSize: '23px', fontWeight: 900 }}>Панель управления</h2><div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>Настройка доступов и тестов</div></div>
                    </div>
                    {users && users.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', fontSize: '12px', fontWeight: 800 }}>👥 {users.length} всего</div>
                            <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', fontWeight: 800, color: '#d97706' }}>⭐ {adminCount} админов</div>
                            {bannedCount > 0 && <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>🚫 {bannedCount} забанено</div>}
                        </div>
                    )}
                </header>

                {users && users.length > 0 && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', opacity: 0.6 }}>🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени или email…"
                                style={{ width: '100%', height: '42px', borderRadius: '13px', border: '1px solid var(--glass-border)', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600, padding: '0 14px 0 38px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {FILTERS.map(f => {
                                const active = filter === f.id;
                                return (
                                    <div key={f.id} onClick={() => setFilter(f.id)} style={{ cursor: 'pointer', padding: '9px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap', color: active ? '#fff' : 'var(--text-sec)', background: active ? 'linear-gradient(135deg, #38bdf8, #6366f1)' : 'var(--bg-panel)', border: `1px solid ${active ? 'transparent' : 'var(--glass-border)'}` }}>
                                        {f.label} · {f.count}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {users === null && [0, 1, 2].map(i => <SkeletonCard key={i} i={i} />)}

                    {users !== null && filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-sec)', fontWeight: 600 }}>
                            {users.length === 0 ? 'Пользователи ещё не зарегистрированы' : 'Ничего не найдено по вашему запросу'}
                        </div>
                    )}

                    <AnimatePresence>
                        {filteredUsers.map(u => (
                            <UserAdminCard key={u.id} u={u} currentUserUid={currentUserUid} isSelf={u.id === currentUserUid} pending={pendingIds.has(u.id)}
                                toggleAdmin={toggleAdmin} toggleBan={toggleBan} handleAssignTestFile={handleAssignTestFile}
                                toggleExcelHints={toggleExcelHints} toggleModuleAccess={toggleModuleAccess} hasAccess={hasAccess} removeTest={removeTest} />
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </>
    );
};

Object.assign(window, { AdminPanel });
