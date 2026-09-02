// --- 16_admin.js ---
const { useState, useEffect, useMemo } = React;
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

const STATUS_FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'Активные' },
    { id: 'banned', label: 'Заблокированы' },
    { id: 'admin', label: 'Админы' }
];

const SORT_OPTIONS = [
    { id: 'name', label: 'Имя' },
    { id: 'tests', label: 'Тесты' },
    { id: 'status', label: 'Статус' }
];

const ACCENT = '#14b8a6';
const ACCENT_SOFT = 'rgba(20,184,166,0.14)';
const DANGER = '#ef4444';
const SUCCESS = '#22c55e';
const WARNING = '#f59e0b';

const computeModules = (user, moduleId, add) => {
    const current = user.allowedModules || AVAILABLE_MODULES.map(m => m.id);
    if (add) return current.includes(moduleId) ? current : [...current, moduleId];
    return current.filter(id => id !== moduleId);
};

const displayName = (u) => u.nickname || u.email || 'Без имени';

// A small round dot-strip showing which modules a user can access at a glance,
// without needing to open their row.
const ModuleStrip = ({ user, hasAccess }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
        {AVAILABLE_MODULES.map(m => {
            const on = hasAccess(user, m.id);
            return (
                <span key={m.id} title={`${m.label}: ${on ? 'доступен' : 'закрыт'}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: on ? m.color : 'var(--glass-border)', opacity: on ? 1 : 0.7, display: 'inline-block' }} />
            );
        })}
    </div>
);

const StatChip = ({ label, value, color }) => (
    <div style={{ padding: '8px 14px', borderRadius: '12px', background: color ? `${color}14` : 'var(--bg-body)', border: `1px solid ${color ? `${color}33` : 'var(--glass-border)'}`, fontSize: '12px', fontWeight: 800, color: color || 'var(--text-main)', whiteSpace: 'nowrap' }}>
        {value} {label}
    </div>
);

const UserRow = ({ u, isOpen, isSelected, currentUserUid, toggleOpen, toggleSelect, toggleAdmin, toggleBan, handleAssignTestFile, toggleExcelHints, toggleModuleAccess, hasAccess, removeTest }) => {
    const [activeTab, setActiveTab] = useState('control');
    const testCount = (u.assignedTests && u.assignedTests.length) || 0;
    const isSelf = u.id === currentUserUid;
    const ringColor = u.isBanned ? DANGER : ACCENT;

    return (
        <motion.div layout style={{ background: 'var(--bg-body)', border: `1px solid ${isSelected ? `${ACCENT}55` : 'var(--glass-border)'}`, borderRadius: '18px', overflow: 'hidden', boxShadow: isOpen ? '0 12px 28px rgba(0,0,0,0.06)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }} onClick={() => toggleOpen(u.id)}>
                <div onClick={(e) => { e.stopPropagation(); toggleSelect(u.id); }} style={{ width: '18px', height: '18px', borderRadius: '6px', border: `1.5px solid ${isSelected ? ACCENT : 'var(--glass-border)'}`, background: isSelected ? ACCENT : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 900 }}>
                    {isSelected ? '✓' : ''}
                </div>

                <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', background: u.isBanned ? 'rgba(239,68,68,0.1)' : `${ACCENT}17`, border: `1.5px solid ${ringColor}55` }}>
                        {u.isBanned ? '🚫' : '👤'}
                    </div>
                    {u.role === 'admin' && (
                        <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '17px', height: '17px', borderRadius: '50%', background: WARNING, border: '2px solid var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>★</div>
                    )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(u)}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-sec)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                </div>

                <div className="modern-scroll" style={{ display: 'none', gap: '4px' }} />

                <span style={{ fontSize: '11px', fontWeight: 800, color: u.isBanned ? DANGER : SUCCESS, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isBanned ? DANGER : SUCCESS, display: 'inline-block' }} />
                    {u.isBanned ? 'Заблокирован' : 'Активен'}
                </span>

                <div style={{ display: 'none' }} className="hide-on-narrow" />

                <ModuleStrip user={u} hasAccess={hasAccess} />

                {testCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '3px 9px', borderRadius: '8px', whiteSpace: 'nowrap' }}>📝 {testCount}</span>
                )}

                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: 'var(--text-sec)', fontSize: '13px', flexShrink: 0 }}>▾</motion.span>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--glass-border)' }}>
                            <div className="modern-scroll" style={{ display: 'flex', gap: '6px', margin: '14px 0', overflowX: 'auto' }}>
                                {TABS.map(tab => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ position: 'relative', cursor: 'pointer', padding: '7px 14px', borderRadius: '11px', fontWeight: 800, fontSize: '12px', whiteSpace: 'nowrap', color: isActive ? tab.color : 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {isActive && <motion.div layoutId={`tab-bg-${u.id}`} transition={{ type: 'spring', stiffness: 500, damping: 35 }} style={{ position: 'absolute', inset: 0, borderRadius: '11px', background: `${tab.color}17`, border: `1px solid ${tab.color}40` }} />}
                                            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>{tab.icon} {tab.label}{tab.id === 'tests' ? ` (${testCount})` : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {activeTab === 'control' && (
                                <div>
                                    {!isSelf ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', width: '100%' }}>
                                            <Button variant={u.role === 'admin' ? "orange" : "muted"} onClick={() => toggleAdmin(u.id, u.role)} style={{ height: '42px', borderRadius: '12px', fontSize: '11px' }}>{u.role === 'admin' ? "Снять админа" : "Дать админа"}</Button>
                                            <label style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ACCENT, color: 'white', borderRadius: '12px', height: '42px', fontSize: '11px', fontWeight: 800 }}>
                                                📁 Назначить тест <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                            </label>
                                            <Button variant={u.isBanned ? "green" : "red"} onClick={() => toggleBan(u.id, u.isBanned)} style={{ height: '42px', borderRadius: '12px', fontSize: '11px' }}>{u.isBanned ? "Разбанить" : "Забанить"}</Button>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '14px', background: `${WARNING}12`, border: `1px dashed ${WARNING}`, borderRadius: '13px', color: '#d97706', fontSize: '12.5px', fontWeight: 600, textAlign: 'center' }}>Нельзя менять права своего собственного аккаунта</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ background: 'var(--bg-panel)', borderRadius: '14px', padding: '14px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-sec)', fontWeight: 700, marginBottom: '10px' }}>Режим Excel</div>
                                        <Button variant={u.excelHintsEnabled !== false ? "green" : "red"} onClick={() => toggleExcelHints(u.id, u)} style={{ height: '42px', borderRadius: '11px', fontSize: '11.5px' }}>
                                            {u.excelHintsEnabled !== false ? "💡 Подсказки включены" : "🔒 Режим экзамена"}
                                        </Button>
                                    </div>
                                    <div style={{ background: 'var(--bg-panel)', borderRadius: '14px', padding: '14px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-sec)', fontWeight: 700, marginBottom: '10px' }}>Доступ к модулям</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {AVAILABLE_MODULES.map(module => {
                                                const access = hasAccess(u, module.id);
                                                return (
                                                    <motion.div key={module.id} whileTap={{ scale: 0.97 }} onClick={() => toggleModuleAccess(u.id, u, module.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 12px', borderRadius: '10px', cursor: 'pointer', background: access ? `${module.color}17` : 'var(--bg-body)', border: `1.5px solid ${access ? `${module.color}55` : 'var(--glass-border)'}`, color: access ? module.color : 'var(--text-sec)', opacity: access ? 1 : 0.6 }}>
                                                        <span style={{ fontSize: '13px', filter: access ? 'none' : 'grayscale(100%)' }}>{module.icon}</span>
                                                        <span style={{ fontSize: '11.5px', fontWeight: 800 }}>{module.label}</span>
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
                                        <div style={{ padding: '22px 16px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '12.5px', fontWeight: 600, background: 'var(--bg-panel)', borderRadius: '13px', border: '1px dashed var(--glass-border)' }}>Персональных тестов пока нет.<br />Назначьте один во вкладке «Управление»</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                                            {u.assignedTests.map(test => (
                                                <div key={test.id} style={{ background: 'var(--bg-panel)', border: '1px dashed #3b82f6', color: '#3b82f6', fontSize: '12.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '7px 10px 7px 13px', borderRadius: '11px' }}>
                                                    <span>☁️ {test.title}</span>
                                                    <div onClick={() => removeTest(u.id, test.id)} style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: DANGER, width: '19px', height: '19px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '10px' }}>✖</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const AdminPanel = ({ onKicked }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [openRowId, setOpenRowId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [bulkModule, setBulkModule] = useState(AVAILABLE_MODULES[0].id);
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        if (!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsub();
    }, []);

    useEffect(() => {
        if (users.length === 0) return;
        const currentUserId = window.auth?.currentUser?.uid;
        if (!currentUserId) return;
        const currentUserData = users.find(u => u.id === currentUserId);
        if (currentUserData && currentUserData.role !== 'admin') {
            alert("Ваши права администратора были отозваны! Вы переведены в режим студента.");
            if (onKicked) onKicked();
        }
    }, [users, onKicked]);

    const toggleBan = async (uid, currentStatus) => { try { await window.db.collection('users').doc(uid).update({ isBanned: !currentStatus }); } catch (e) { alert("Ошибка при изменении статуса"); } };
    const toggleAdmin = async (uid, currentRole) => { try { await window.db.collection('users').doc(uid).update({ role: currentRole === 'admin' ? 'student' : 'admin' }); } catch (e) { alert("Ошибка при изменении роли"); } };

    const toggleModuleAccess = async (uid, user, moduleId) => {
        const currentModules = user.allowedModules || AVAILABLE_MODULES.map(m => m.id);
        const newModules = currentModules.includes(moduleId) ? currentModules.filter(id => id !== moduleId) : [...currentModules, moduleId];
        try { await window.db.collection('users').doc(uid).update({ allowedModules: newModules }); } catch (e) { alert("Ошибка при обновлении доступов."); }
    };

    const toggleExcelHints = async (uid, user) => {
        const currentStatus = user.excelHintsEnabled !== false;
        try { await window.db.collection('users').doc(uid).update({ excelHintsEnabled: !currentStatus }); } catch (e) { alert("Ошибка при обновлении настроек."); }
    };

    const hasAccess = (user, moduleId) => !user.allowedModules || user.allowedModules.includes(moduleId);

    const handleAssignTestFile = (e, uid) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const title = prompt("Введите название теста:", "Тест от преподавателя");
                if (!title) return;
                const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : { text: String(v), img: null }), correctIndex: t.correctIndex }));
                const currentUser = users.find(u => u.id === uid);
                await window.db.collection('users').doc(uid).update({ assignedTests: [...(currentUser.assignedTests || []), { id: Date.now(), title: title.trim(), data: normalized }] });
                alert("✅ Тест успешно загружен!");
            } catch (err) { alert("Ошибка чтения JSON!"); }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const removeTest = async (uid, testId) => {
        if (confirm("Удалить этот тест у студента?")) {
            try {
                const currentUser = users.find(u => u.id === uid);
                await window.db.collection('users').doc(uid).update({ assignedTests: (currentUser.assignedTests || []).filter(t => t.id !== testId) });
            } catch (e) { alert("Ошибка при удалении теста"); }
        }
    };

    const currentUserUid = window.auth?.currentUser?.uid;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const bannedCount = users.filter(u => u.isBanned).length;
    const activeCount = users.length - bannedCount;

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        let list = users.filter(u => {
            if (term && !displayName(u).toLowerCase().includes(term) && !(u.email || '').toLowerCase().includes(term)) return false;
            if (statusFilter === 'active' && u.isBanned) return false;
            if (statusFilter === 'banned' && !u.isBanned) return false;
            if (statusFilter === 'admin' && u.role !== 'admin') return false;
            return true;
        });
        list = [...list].sort((a, b) => {
            if (sortBy === 'tests') return ((b.assignedTests || []).length) - ((a.assignedTests || []).length);
            if (sortBy === 'status') return (a.isBanned === b.isBanned) ? 0 : (a.isBanned ? 1 : -1);
            return displayName(a).localeCompare(displayName(b));
        });
        return list;
    }, [users, search, statusFilter, sortBy]);

    const toggleOpen = (uid) => setOpenRowId(prev => prev === uid ? null : uid);

    const toggleSelect = (uid) => setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(uid)) next.delete(uid); else next.add(uid);
        return next;
    });

    const selectAllVisible = () => setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    const clearSelection = () => setSelectedIds(new Set());

    const bulkGrantModule = async (add) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setBulkLoading(true);
        try {
            await Promise.all(ids.map(uid => {
                const u = users.find(x => x.id === uid);
                if (!u) return Promise.resolve();
                return window.db.collection('users').doc(uid).update({ allowedModules: computeModules(u, bulkModule, add) });
            }));
        } catch (e) { alert("Ошибка при массовом обновлении доступов"); }
        setBulkLoading(false);
    };

    const bulkSetBan = async (banned) => {
        const ids = Array.from(selectedIds).filter(id => id !== currentUserUid);
        if (ids.length === 0) return;
        setBulkLoading(true);
        try {
            await Promise.all(ids.map(uid => window.db.collection('users').doc(uid).update({ isBanned: banned })));
        } catch (e) { alert("Ошибка при массовом изменении статуса"); }
        setBulkLoading(false);
    };

    const bulkSetAdmin = async (isAdmin) => {
        const ids = Array.from(selectedIds).filter(id => id !== currentUserUid);
        if (ids.length === 0) return;
        setBulkLoading(true);
        try {
            await Promise.all(ids.map(uid => window.db.collection('users').doc(uid).update({ role: isAdmin ? 'admin' : 'student' })));
        } catch (e) { alert("Ошибка при массовом изменении роли"); }
        setBulkLoading(false);
    };

    const selectedCount = selectedIds.size;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="glass-panel" style={{ width: '100%', maxWidth: '1040px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', borderRadius: '26px' }}>

            <div style={{ position: 'sticky', top: '-30px', zIndex: 5, background: 'var(--bg-panel, var(--bg-body))', marginTop: '-30px', paddingTop: '30px', marginLeft: '-30px', marginRight: '-30px', paddingLeft: '30px', paddingRight: '30px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 10px 24px -8px rgba(239,68,68,0.5)' }}>🛡️</div>
                        <div style={{ textAlign: 'left' }}><h2 style={{ margin: 0, fontSize: '21px', fontWeight: 900 }}>Панель управления</h2><div style={{ fontSize: '12.5px', color: 'var(--text-sec)', fontWeight: 600 }}>Доступы, роли и тесты студентов</div></div>
                    </div>
                    {users.length > 0 && (
                        <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
                            <StatChip value={users.length} label="всего" />
                            <StatChip value={activeCount} label="активных" color={SUCCESS} />
                            <StatChip value={adminCount} label="админов" color={WARNING} />
                            {bannedCount > 0 && <StatChip value={bannedCount} label="забанено" color={DANGER} />}
                        </div>
                    )}
                </header>

                {users.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Найти по имени или почте"
                            style={{ flex: '1 1 200px', minWidth: '180px', height: '38px', borderRadius: '11px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', padding: '0 14px', fontSize: '13px', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {STATUS_FILTERS.map(f => {
                                const active = statusFilter === f.id;
                                return (
                                    <div key={f.id} onClick={() => setStatusFilter(f.id)} style={{ cursor: 'pointer', padding: '8px 13px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, background: active ? ACCENT_SOFT : 'var(--bg-body)', border: `1px solid ${active ? `${ACCENT}55` : 'var(--glass-border)'}`, color: active ? ACCENT : 'var(--text-sec)', whiteSpace: 'nowrap' }}>
                                        {f.label}
                                    </div>
                                );
                            })}
                        </div>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ height: '38px', borderRadius: '11px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '12.5px', fontWeight: 700, padding: '0 10px' }}>
                            {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>Сорт.: {s.label}</option>)}
                        </select>
                        {filteredUsers.length > 0 && selectedCount === 0 && (
                            <div onClick={selectAllVisible} style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: ACCENT, whiteSpace: 'nowrap' }}>Выбрать все ({filteredUsers.length})</div>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {selectedCount > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', background: ACCENT_SOFT, border: `1px solid ${ACCENT}40`, borderRadius: '14px', padding: '12px 14px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: 800, color: ACCENT, whiteSpace: 'nowrap' }}>Выбрано: {selectedCount}</span>

                                <select value={bulkModule} onChange={(e) => setBulkModule(e.target.value)} disabled={bulkLoading} style={{ height: '34px', borderRadius: '9px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '12px', fontWeight: 700, padding: '0 8px' }}>
                                    {AVAILABLE_MODULES.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
                                </select>
                                <Button variant="muted" disabled={bulkLoading} onClick={() => bulkGrantModule(true)} style={{ height: '34px', borderRadius: '9px', fontSize: '11px', padding: '0 12px' }}>Открыть доступ</Button>
                                <Button variant="muted" disabled={bulkLoading} onClick={() => bulkGrantModule(false)} style={{ height: '34px', borderRadius: '9px', fontSize: '11px', padding: '0 12px' }}>Закрыть доступ</Button>

                                <span style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />

                                <Button variant="red" disabled={bulkLoading} onClick={() => bulkSetBan(true)} style={{ height: '34px', borderRadius: '9px', fontSize: '11px', padding: '0 12px' }}>Забанить</Button>
                                <Button variant="green" disabled={bulkLoading} onClick={() => bulkSetBan(false)} style={{ height: '34px', borderRadius: '9px', fontSize: '11px', padding: '0 12px' }}>Разбанить</Button>
                                <Button variant="orange" disabled={bulkLoading} onClick={() => bulkSetAdmin(true)} style={{ height: '34px', borderRadius: '9px', fontSize: '11px', padding: '0 12px' }}>Дать админа</Button>

                                <div onClick={clearSelection} style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--text-sec)', whiteSpace: 'nowrap' }}>Снять выделение</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.length === 0 && <div style={{ textAlign: 'center', padding: '50px 20px', fontWeight: 600, color: 'var(--text-sec)' }}>Загрузка пользователей…</div>}

                {users.length > 0 && filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '44px 20px', color: 'var(--text-sec)' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '10px' }}>Никого не нашли по такому запросу</div>
                        <div onClick={() => { setSearch(''); setStatusFilter('all'); }} style={{ display: 'inline-block', cursor: 'pointer', fontSize: '12.5px', fontWeight: 800, color: ACCENT }}>Сбросить фильтры</div>
                    </div>
                )}

                {filteredUsers.map(u => (
                    <UserRow
                        key={u.id}
                        u={u}
                        isOpen={openRowId === u.id}
                        isSelected={selectedIds.has(u.id)}
                        currentUserUid={currentUserUid}
                        toggleOpen={toggleOpen}
                        toggleSelect={toggleSelect}
                        toggleAdmin={toggleAdmin}
                        toggleBan={toggleBan}
                        handleAssignTestFile={handleAssignTestFile}
                        toggleExcelHints={toggleExcelHints}
                        toggleModuleAccess={toggleModuleAccess}
                        hasAccess={hasAccess}
                        removeTest={removeTest}
                    />
                ))}
            </div>
        </motion.div>
    );
};

Object.assign(window, { AdminPanel });
