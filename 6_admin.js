// --- 6_admin.js ---
(function () {
    const { useState, useEffect, useRef, useMemo } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { Button } = window;

    /* ---------------- Icon system (inline SVG, no external deps) ---------------- */

    const ADMIN_ICON_PATHS = {
        chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
        keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" /></>,
        zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
        code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
        layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
        barChart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
        user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
        users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
        fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
        ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
        alertTriangle: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
        checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
        lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
        info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
        folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
        cloud: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
        x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
        star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
        inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></>,
        sparkle: <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
    };

    const AdminIcon = ({ name, size = 16, color = 'currentColor', style = {}, strokeWidth = 2 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0, ...style }}>
            {ADMIN_ICON_PATHS[name] || null}
        </svg>
    );

    const AVAILABLE_MODULES = [
        { id: 'chat', icon: 'chat', label: 'Чат', color: '#06b6d4' },
        { id: 'ai_chat', icon: 'sparkle', label: 'ИИ Ассистент', color: '#a855f7' },
        { id: 'typing', icon: 'keyboard', label: 'Печать', color: '#818cf8' },
        { id: 'hotkeys', icon: 'zap', label: 'Хоткеи', color: '#fbbf24' },
        { id: 'code', icon: 'code', label: 'VS School', color: '#2dd4bf' },
        { id: 'flashcards', icon: 'layers', label: 'Карточки', color: '#3b82f6' },
        { id: 'excel', icon: 'barChart', label: 'Excel', color: '#10b981' },
        { id: 'stats', icon: 'user', label: 'Статистика', color: '#f59e0b' } 
    ];

    // ИСПРАВЛЕНИЕ: Добавлена вкладка "Статистика"
    const TABS = [
        { id: 'control', icon: 'user', label: 'Управление', color: '#38bdf8' },
        { id: 'settings', icon: 'settings', label: 'Настройки', color: '#a855f7' },
        { id: 'stats', icon: 'barChart', label: 'Статистика', color: '#f59e0b' },
        { id: 'tests', icon: 'fileText', label: 'Тесты', color: '#10b981' },
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
                        <AdminIcon name={t.type === 'error' ? 'alertTriangle' : 'checkCircle'} size={17} color="#fff" />
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
                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: state.danger ? 'rgba(239,68,68,0.12)' : 'rgba(56,189,248,0.12)' }}>
                            <AdminIcon name={state.danger ? 'alertTriangle' : 'info'} size={22} color={state.danger ? '#ef4444' : '#38bdf8'} />
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
                <motion.div animate={{ rotate: [0, -8, 8, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.6 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                    <AdminIcon name="lock" size={42} color="#ef4444" strokeWidth={1.8} />
                </motion.div>
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

    const UserAdminCard = ({ u, currentUserUid, isSelf, pending, toggleAdmin, toggleBan, handleAssignTestFile, toggleExcelHints, toggleModuleAccess, hasAccess, removeTest, clearUserStats }) => {
        const [activeTab, setActiveTab] = useState('control');
        const testCount = (u.assignedTests && u.assignedTests.length) || 0;

        // ИЗВЛЕКАЕМ СТАТИСТИКУ ИЗ БАЗЫ ПОЛЬЗОВАТЕЛЯ
        const excelStats = u.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
        const typingStats = u.typingProgress || { maxWpm: 0, maxCombo: 0, testsCompleted: 0 };
        const hotkeyStats = u.hotkeyProgress || { maxScore: 0, sessionsPlayed: 0 };
        const testHistory = u.testHistory || [];
        const totalTestsDone = testHistory.length;
        const avgPercent = totalTestsDone ? Math.round(testHistory.reduce((s, h) => s + h.percent, 0) / totalTestsDone) : 0;

        return (
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                style={{ background: 'var(--bg-body)', border: isSelf ? '1.5px solid rgba(56,189,248,0.35)' : '1px solid var(--glass-border)', borderRadius: '22px', padding: '22px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', position: 'relative', opacity: pending ? 0.7 : 1, pointerEvents: pending ? 'none' : 'auto', transition: 'opacity 0.2s' }}>

                {pending && (
                    <div style={{ position: 'absolute', top: '18px', right: '18px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-sec)' }}>
                        <Spinner />
                        Сохранение…
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', background: u.isBanned ? 'rgba(239, 68, 68, 0.85)' : avatarGradient(u.id), border: `1.5px solid ${u.isBanned ? 'rgba(239,68,68,0.4)' : 'transparent'}`, boxShadow: u.isBanned ? 'none' : '0 6px 16px -6px rgba(56,189,248,0.5)' }}>
                        {u.isBanned ? <AdminIcon name="ban" size={20} color="#fff" /> : <span style={{ fontSize: '15px' }}>{getInitials(u.nickname || u.email)}</span>}
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
                                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AdminIcon name={tab.icon} size={14} color={isActive ? tab.color : 'currentColor'} />
                                    {tab.label}{tab.id === 'tests' ? ` (${testCount})` : ''}
                                </span>
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
                                        <label style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '13px', height: '44px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                                            <AdminIcon name="folder" size={14} color="#fff" /> Назначить тест <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                        </label>
                                        <Button variant={u.isBanned ? "green" : "red"} onClick={() => toggleBan(u)} style={{ height: '44px', borderRadius: '13px', fontSize: '11px', textTransform: 'uppercase' }}>{u.isBanned ? "Разбанить" : "Забанить"}</Button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', borderRadius: '14px', color: '#d97706', fontSize: '13px', fontWeight: 600, textAlign: 'center', justifyContent: 'center' }}>
                                        <AdminIcon name="alertTriangle" size={16} color="#d97706" />
                                        Вы не можете изменять базовые права собственного аккаунта
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'settings' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
                                        <AdminIcon name="settings" size={12} /> Настройки режимов
                                    </div>
                                    <Button variant={u.excelHintsEnabled !== false ? "green" : "red"} onClick={() => toggleExcelHints(u)} style={{ height: '44px', borderRadius: '12px', fontSize: '11.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <AdminIcon name={u.excelHintsEnabled !== false ? 'lightbulb' : 'lock'} size={14} />
                                        {u.excelHintsEnabled !== false ? "Подсказки Excel: включены" : "Подсказки Excel: режим экзамена"}
                                    </Button>
                                </div>
                                <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>Доступ к модулям платформы</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {AVAILABLE_MODULES.map(module => {
                                            const access = hasAccess(u, module.id);
                                            return (
                                                <motion.div key={module.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => toggleModuleAccess(u, module.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 13px', borderRadius: '11px', cursor: 'pointer', background: access ? `${module.color}17` : 'var(--bg-body)', border: `1.5px solid ${access ? `${module.color}55` : 'var(--glass-border)'}`, color: access ? module.color : 'var(--text-sec)', opacity: access ? 1 : 0.55 }}>
                                                    <AdminIcon name={module.icon} size={14} />
                                                    <span style={{ fontSize: '12px', fontWeight: 800 }}>{module.label}</span>
                                                    {access && <AdminIcon name="checkCircle" size={12} />}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ИСПРАВЛЕНИЕ: Вынесли статистику в отдельную вкладку 'stats' */}
                        {activeTab === 'stats' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                    <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AdminIcon name="barChart" size={14}/> EXCEL</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{color: 'var(--text-sec)'}}>Уровень:</span> <b style={{color: 'var(--text-main)'}}>{excelStats.level} ({excelStats.xp} XP)</b></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{color: 'var(--text-sec)'}}>Решено формул:</span> <b style={{color: 'var(--text-main)'}}>{excelStats.completedLessons}</b></div>
                                    </div>

                                    <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AdminIcon name="keyboard" size={14}/> ПЕЧАТЬ</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{color: 'var(--text-sec)'}}>Рекорд:</span> <b style={{color: 'var(--text-main)'}}>{typingStats.maxWpm} WPM</b></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{color: 'var(--text-sec)'}}>Пройдено:</span> <b style={{color: 'var(--text-main)'}}>{typingStats.testsCompleted}</b></div>
                                    </div>

                                    <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AdminIcon name="zap" size={14}/> ХОТКЕИ</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{color: 'var(--text-sec)'}}>Рекорд:</span> <b style={{color: 'var(--text-main)'}}>{hotkeyStats.maxScore}</b></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{color: 'var(--text-sec)'}}>Сессий:</span> <b style={{color: 'var(--text-main)'}}>{hotkeyStats.sessionsPlayed}</b></div>
                                    </div>

                                    <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AdminIcon name="fileText" size={14}/> ТЕСТЫ</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{color: 'var(--text-sec)'}}>Сдано:</span> <b style={{color: 'var(--text-main)'}}>{totalTestsDone}</b></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{color: 'var(--text-sec)'}}>Ср. балл:</span> <b style={{color: 'var(--text-main)'}}>{avgPercent}%</b></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                    <Button variant="red" onClick={() => clearUserStats(u)} style={{ height: '36px', borderRadius: '10px', fontSize: '11px', textTransform: 'uppercase', padding: '0 16px' }}>
                                        🗑 Сбросить статистику
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'tests' && (
                            <div>
                                {testCount === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 18px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '13px', fontWeight: 600, background: 'var(--bg-panel)', borderRadius: '14px', border: '1px dashed var(--glass-border)' }}>
                                        <AdminIcon name="inbox" size={22} />
                                        <span>Нет назначенных персональных тестов<br />Перейдите во вкладку «Управление», чтобы назначить новый тест</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {u.assignedTests.map(test => (
                                            <div key={test.id} style={{ background: 'var(--bg-panel)', border: '1px dashed #3b82f6', color: '#3b82f6', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 12px 8px 14px', borderRadius: '12px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}><AdminIcon name="cloud" size={14} /> {test.title}</span>
                                                <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => removeTest(u, test.id, test.title)} style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                                    <AdminIcon name="x" size={11} strokeWidth={2.5} />
                                                </motion.div>
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

        useEffect(() => {
            if (!accessRevoked || kickedRef.current) return;
            kickedRef.current = true;
            const t = setTimeout(() => { if (onKicked) onKicked(); }, 900);
            return () => clearTimeout(t);
        }, [accessRevoked, onKicked]);

        useEffect(() => {
            if (!window.db) return;
            const unsub = window.db.collection('users').onSnapshot(
                snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
                () => revokeAccess('Ваши права были изменены, и доступ к списку пользователей больше недоступен.')
            );
            return () => unsub();
        }, []);

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

        const clearUserStats = (u) => {
            setConfirmState({
                title: 'Сбросить статистику?',
                message: `Вся статистика (Excel, Печать, Хоткеи, Тесты) для ${u.nickname || u.email} будет обнулена безвозвратно.`,
                danger: true,
                confirmLabel: 'Сбросить',
                onConfirm: () => {
                    setConfirmState(null);
                    withPending(u.id, () => window.db.collection('users').doc(u.id).update({
                        testHistory: [],
                        excelProgress: { level: 1, xp: 0, completedLessons: 0, streak: 0 },
                        typingProgress: { maxWpm: 0, maxCombo: 0, testsCompleted: 0 },
                        hotkeyProgress: { maxScore: 0, sessionsPlayed: 0 }
                    }), 'Статистика успешно сброшена');
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
                            <div style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 10px 24px -8px rgba(239,68,68,0.5)' }}>
                                <AdminIcon name="shield" size={24} color="#fff" strokeWidth={1.8} />
                            </div>
                            <div style={{ textAlign: 'left' }}><h2 style={{ margin: 0, fontSize: '23px', fontWeight: 900 }}>Панель управления</h2><div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>Настройка доступов и тестов</div></div>
                        </div>
                        {users && users.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', fontSize: '12px', fontWeight: 800 }}><AdminIcon name="users" size={13} /> {users.length} всего</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', fontWeight: 800, color: '#d97706' }}><AdminIcon name="star" size={13} color="#d97706" /> {adminCount} админов</div>
                                {bannedCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px', fontWeight: 800, color: '#ef4444' }}><AdminIcon name="ban" size={13} color="#ef4444" /> {bannedCount} забанено</div>}
                            </div>
                        )}
                    </header>

                    {users && users.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
                                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, display: 'flex' }}><AdminIcon name="search" size={15} /></span>
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
                                    toggleExcelHints={toggleExcelHints} toggleModuleAccess={toggleModuleAccess} hasAccess={hasAccess} removeTest={removeTest} clearUserStats={clearUserStats} />
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </>
        );
    };

    Object.assign(window, { AdminPanel });
})();
