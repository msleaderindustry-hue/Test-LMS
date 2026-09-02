// --- 16_admin.js ---
const { useState, useEffect } = React;
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

const UserAdminCard = ({ u, currentUserUid, toggleAdmin, toggleBan, handleAssignTestFile, toggleExcelHints, toggleModuleAccess, hasAccess, removeTest }) => {
    const [activeTab, setActiveTab] = useState('control');
    const testCount = (u.assignedTests && u.assignedTests.length) || 0;

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '22px', padding: '22px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: u.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(99,102,241,0.18))', border: `1.5px solid ${u.isBanned ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}` }}>
                    {u.isBanned ? '🚫' : '👤'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '15.5px', color: 'var(--text-main)', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nickname || u.email}</div>
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
                            {u.id !== currentUserUid ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%' }}>
                                    <Button variant={u.role === 'admin' ? "orange" : "muted"} onClick={() => toggleAdmin(u.id, u.role)} style={{ height: '44px', borderRadius: '13px', fontSize: '11px', textTransform: 'uppercase' }}>{u.role === 'admin' ? "Снять админа" : "Дать админа"}</Button>
                                    <label style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '13px', height: '44px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                                        📁 Назначить тест <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                    </label>
                                    <Button variant={u.isBanned ? "green" : "red"} onClick={() => toggleBan(u.id, u.isBanned)} style={{ height: '44px', borderRadius: '13px', fontSize: '11px', textTransform: 'uppercase' }}>{u.isBanned ? "Разбанить" : "Забанить"}</Button>
                                </div>
                            ) : (<div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', borderRadius: '14px', color: '#d97706', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>⚠️ Вы не можете изменять базовые права собственного аккаунта</div>)}
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>⚙️ Настройки режимов</div>
                                <Button variant={u.excelHintsEnabled !== false ? "green" : "red"} onClick={() => toggleExcelHints(u.id, u)} style={{ height: '44px', borderRadius: '12px', fontSize: '11.5px', textTransform: 'uppercase' }}>
                                    {u.excelHintsEnabled !== false ? "💡 Подсказки Excel: включены" : "🔒 Подсказки Excel: режим экзамена"}
                                </Button>
                            </div>
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>Доступ к модулям платформы</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {AVAILABLE_MODULES.map(module => {
                                        const access = hasAccess(u, module.id);
                                        return (
                                            <motion.div key={module.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => toggleModuleAccess(u.id, u, module.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 13px', borderRadius: '11px', cursor: 'pointer', background: access ? `${module.color}17` : 'var(--bg-body)', border: `1.5px solid ${access ? `${module.color}55` : 'var(--glass-border)'}`, color: access ? module.color : 'var(--text-sec)', opacity: access ? 1 : 0.55 }}>
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
                                            <div onClick={() => removeTest(u.id, test.id)} style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '10px' }}>✖</div>
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

const AdminPanel = ({ onKicked }) => {
    const [users, setUsers] = useState([]);

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
        let currentModules = user.allowedModules || AVAILABLE_MODULES.map(m => m.id);
        let newModules = currentModules.includes(moduleId) ? currentModules.filter(id => id !== moduleId) : [...currentModules, moduleId];
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

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="glass-panel" style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '26px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '22px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 10px 24px -8px rgba(239,68,68,0.5)' }}>🛡️</div>
                    <div style={{ textAlign: 'left' }}><h2 style={{ margin: 0, fontSize: '23px', fontWeight: 900 }}>Панель управления</h2><div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>Настройка доступов и тестов</div></div>
                </div>
                {users.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', fontSize: '12px', fontWeight: 800 }}>👥 {users.length} всего</div>
                        <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', fontWeight: 800, color: '#d97706' }}>⭐ {adminCount} админов</div>
                        {bannedCount > 0 && <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>🚫 {bannedCount} забанено</div>}
                    </div>
                )}
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {users.length === 0 && <div style={{ textAlign: 'center', padding: '50px 20px', fontWeight: 600 }}>Загрузка пользователей…</div>}
                {users.map(u => <UserAdminCard key={u.id} u={u} currentUserUid={currentUserUid} toggleAdmin={toggleAdmin} toggleBan={toggleBan} handleAssignTestFile={handleAssignTestFile} toggleExcelHints={toggleExcelHints} toggleModuleAccess={toggleModuleAccess} hasAccess={hasAccess} removeTest={removeTest} />)}
            </div>
        </motion.div>
    );
};

Object.assign(window, { AdminPanel });
