// --- ВЫНЕСЕННЫЕ КОМПОНЕНТЫ ---
const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ЭКРАН АВТОРИЗАЦИИ
const AuthScreen = React.memo(() => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            const result = await window.auth.signInWithPopup(provider);
            const user = result.user;

            const userDoc = await window.db.collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                await window.db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'student',
                    isBanned: false,
                    registeredAt: new Date().toISOString(),
                    allowedModules: ['chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel'],
                    excelHintsEnabled: true // По умолчанию подсказки включены
                });
            }
        } catch (err) {
            console.error(err);
            let errMsg = "Произошла ошибка при авторизации.";
            if (err.code === 'auth/popup-closed-by-user') {
                errMsg = "Вы закрыли окно авторизации. Попробуйте снова.";
            } else if (err.code === 'auth/network-request-failed') {
                errMsg = "Ошибка сети. Проверьте интернет-соединение.";
            } else if (err.code === 'auth/operation-not-allowed') {
                errMsg = "Вход через Google не включен в настройках Firebase!";
            }
            setError(errMsg);
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            key="auth"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel"
            style={{
                width: '100%', maxWidth: '400px', textAlign: 'center', padding: '44px 32px',
                borderRadius: '28px', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.18)',
                position: 'relative', overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute', top: '-60px', right: '-60px', width: '160px', height: '160px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.16), transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                boxShadow: '0 10px 25px -8px rgba(99,102,241,0.55)'
            }}>
                🔐
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                Вход в систему
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600, lineHeight: 1.5 }}>
                Используйте рабочий аккаунт Google, чтобы продолжить
            </p>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: '16px' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        style={{
                            color: '#ef4444', fontSize: '13px', background: 'rgba(239, 68, 68, 0.08)',
                            padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.25)',
                            fontWeight: '600', textAlign: 'left'
                        }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    width: '100%', height: '54px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                    background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: '800',
                    cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                    opacity: isLoading ? 0.65 : 1, transition: '0.2s'
                }}
            >
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid var(--glass-border)', borderTopColor: '#38bdf8' }}
                    />
                ) : (
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22 }} />
                )}
                {isLoading ? 'Входим…' : 'Продолжить с Google'}
            </motion.button>

            <div style={{ marginTop: '22px', fontSize: '11.5px', color: 'var(--text-sec)', opacity: 0.75, fontWeight: 600, letterSpacing: '0.2px' }}>
                Доступ разрешён только для подтверждённых аккаунтов
            </div>
        </motion.div>
    );
});

// СПИСОК ВСЕХ МОДУЛЕЙ ДЛЯ ВЫДАЧИ ДОСТУПА
const AVAILABLE_MODULES = [
    { id: 'chat', icon: '💬', label: 'Чат', color: '#06b6d4' },
    { id: 'typing', icon: '⌨️', label: 'Печать', color: '#818cf8' },
    { id: 'hotkeys', icon: '⚡', label: 'Хоткеи', color: '#fbbf24' },
    { id: 'code', icon: '💻', label: 'VS School', color: '#2dd4bf' },
    { id: 'flashcards', icon: '🎴', label: 'Карточки', color: '#3b82f6' },
    { id: 'excel', icon: '📊', label: 'Excel', color: '#10b981' },
];

const TABS = [
    { id: 'control', icon: '👤', label: 'Управление', color: '#38bdf8' },
    { id: 'settings', icon: '⚙️', label: 'Настройки', color: '#a855f7' },
    { id: 'tests', icon: '📝', label: 'Тесты', color: '#10b981' }
];

// --- КОМПОНЕНТ: КАРТОЧКА ПОЛЬЗОВАТЕЛЯ С ВКЛАДКАМИ ---
const UserAdminCard = ({ u, currentUserUid, toggleAdmin, toggleBan, handleAssignTestFile, toggleExcelHints, toggleModuleAccess, hasAccess, removeTest }) => {
    // Состояние для управления активной вкладкой
    const [activeTab, setActiveTab] = useState('control'); // 'control', 'settings', 'tests'
    const testCount = (u.assignedTests && u.assignedTests.length) || 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '22px',
                padding: '22px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }}
        >
            {/* ИНФО О ПОЛЬЗОВАТЕЛЕ (Шапка карточки) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '16px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    background: u.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(99,102,241,0.18))',
                    border: `1.5px solid ${u.isBanned ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}`
                }}>
                    {u.isBanned ? '🚫' : '👤'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontWeight: 800, fontSize: '15.5px', color: 'var(--text-main)', marginBottom: '5px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                        {u.nickname || u.email}
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', color: u.isBanned ? '#ef4444' : '#10b981' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isBanned ? '#ef4444' : '#10b981', display: 'inline-block' }} />
                            {u.isBanned ? 'Заблокирован' : 'Активен'}
                        </span>
                        {u.role === 'admin' && (
                            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', padding: '2px 7px', borderRadius: '6px', fontWeight: 800, fontSize: '10px', letterSpacing: '0.3px' }}>
                                АДМИН
                            </span>
                        )}
                        <span style={{ color: 'var(--text-sec)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                    </div>
                </div>
            </div>

            {/* НАВИГАЦИЯ ПО ВКЛАДКАМ */}
            <div className="modern-scroll" style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', overflowX: 'auto' }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                position: 'relative', cursor: 'pointer', padding: '8px 15px', borderRadius: '12px',
                                fontWeight: 800, fontSize: '12.5px', transition: 'color 0.2s', whiteSpace: 'nowrap',
                                color: isActive ? tab.color : 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId={`tab-bg-${u.id}`}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    style={{
                                        position: 'absolute', inset: 0, borderRadius: '12px',
                                        background: `${tab.color}17`, border: `1px solid ${tab.color}40`
                                    }}
                                />
                            )}
                            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {tab.icon} {tab.label}{tab.id === 'tests' ? ` (${testCount})` : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* КОНТЕНТ ВКЛАДОК */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                >
                    {/* 1. ВКЛАДКА "УПРАВЛЕНИЕ" */}
                    {activeTab === 'control' && (
                        <div>
                            {u.id !== currentUserUid ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%' }}>
                                    <div style={{ display: 'flex' }}>
                                        <Button
                                            variant={u.role === 'admin' ? "orange" : "muted"}
                                            style={{ width: '100%', whiteSpace: 'nowrap', height: '44px', padding: '0 15px', borderRadius: '13px', fontSize: '11px', fontWeight: 800, margin: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                            onClick={() => toggleAdmin(u.id, u.role)}
                                        >
                                            {u.role === 'admin' ? "Снять админа" : "Дать админа"}
                                        </Button>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <label style={{
                                            width: '100%', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '13px', padding: '0 15px', height: '44px',
                                            fontSize: '11px', fontWeight: 800, transition: '0.2s', boxShadow: '0 6px 16px rgba(0, 242, 254, 0.25)', margin: 0, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.3px'
                                        }}>
                                            📁 Назначить тест
                                            <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <Button
                                            variant={u.isBanned ? "green" : "red"}
                                            style={{ width: '100%', whiteSpace: 'nowrap', height: '44px', padding: '0 15px', borderRadius: '13px', fontSize: '11px', fontWeight: 800, margin: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                            onClick={() => toggleBan(u.id, u.isBanned)}
                                        >
                                            {u.isBanned ? "Разбанить" : "Забанить"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b',
                                    borderRadius: '14px', color: '#d97706', fontSize: '13px', fontWeight: 600, textAlign: 'center'
                                }}>
                                    ⚠️ Вы не можете изменять базовые права собственного аккаунта
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. ВКЛАДКА "НАСТРОЙКИ" */}
                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* НАСТРОЙКИ ЭКЗАМЕНОВ И ТРЕНАЖЕРОВ */}
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                    ⚙️ Настройки режимов
                                </div>
                                <Button
                                    variant={u.excelHintsEnabled !== false ? "green" : "red"}
                                    onClick={() => toggleExcelHints(u.id, u)}
                                    style={{ width: '100%', maxWidth: '360px', height: '44px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                >
                                    {u.excelHintsEnabled !== false ? "💡 Подсказки Excel: включены" : "🔒 Подсказки Excel: режим экзамена"}
                                </Button>
                            </div>

                            {/* НАСТРОЙКА ДОСТУПОВ К МОДУЛЯМ */}
                            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                    Доступ к модулям платформы
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {AVAILABLE_MODULES.map(module => {
                                        const access = hasAccess(u, module.id);
                                        return (
                                            <motion.div
                                                key={module.id}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => toggleModuleAccess(u.id, u, module.id)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                                    padding: '7px 13px', borderRadius: '11px',
                                                    cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                                                    background: access ? `${module.color}17` : 'var(--bg-body)',
                                                    border: `1.5px solid ${access ? `${module.color}55` : 'var(--glass-border)'}`,
                                                    color: access ? module.color : 'var(--text-sec)',
                                                    opacity: access ? 1 : 0.55,
                                                    width: 'auto'
                                                }}
                                            >
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

                    {/* 3. ВКЛАДКА "ТЕСТЫ" */}
                    {activeTab === 'tests' && (
                        <div>
                            {testCount === 0 ? (
                                <div style={{
                                    padding: '24px 18px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '13px', fontWeight: 600,
                                    background: 'var(--bg-panel)', borderRadius: '14px', border: '1px dashed var(--glass-border)', lineHeight: 1.6
                                }}>
                                    📭 Нет назначенных персональных тестов<br />
                                    Перейдите во вкладку «Управление», чтобы назначить новый тест
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {u.assignedTests.map(test => (
                                        <div key={test.id} style={{
                                            background: 'var(--bg-panel)', border: '1px dashed #3b82f6', color: '#3b82f6', fontSize: '13px', fontWeight: 700,
                                            display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 12px 8px 14px', borderRadius: '12px', width: 'auto'
                                        }}>
                                            <span>☁️ {test.title}</span>
                                            <div
                                                onClick={() => removeTest(u.id, test.id)}
                                                style={{
                                                    cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '20px', height: '20px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '10px', transition: '0.2s'
                                                }}
                                            >
                                                ✖
                                            </div>
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

// --- АДМИН-ПАНЕЛЬ ---
const AdminPanel = ({ onKicked }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    // Выкидываем из админки, если права отозвали в реальном времени!
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

    const toggleBan = async (uid, currentStatus) => {
        try { await window.db.collection('users').doc(uid).update({ isBanned: !currentStatus }); } catch (e) { alert("Ошибка при изменении статуса"); }
    };

    const toggleAdmin = async (uid, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'student' : 'admin';
            await window.db.collection('users').doc(uid).update({ role: newRole });
        } catch (e) { alert("Ошибка при изменении роли"); }
    };

    const toggleModuleAccess = async (uid, user, moduleId) => {
        let currentModules = user.allowedModules;
        if (!currentModules) currentModules = AVAILABLE_MODULES.map(m => m.id);

        let newModules;
        if (currentModules.includes(moduleId)) {
            newModules = currentModules.filter(id => id !== moduleId);
        } else {
            newModules = [...currentModules, moduleId];
        }

        try { await window.db.collection('users').doc(uid).update({ allowedModules: newModules }); }
        catch (e) { alert("Ошибка при обновлении доступов."); }
    };

    // Управление подсказками (режим экзамена)
    const toggleExcelHints = async (uid, user) => {
        // Если поля нет, считаем что подсказки включены (true)
        const currentStatus = user.excelHintsEnabled !== false;
        try {
            await window.db.collection('users').doc(uid).update({ excelHintsEnabled: !currentStatus });
        } catch (e) {
            alert("Ошибка при обновлении настроек тренажера.");
        }
    };

    const hasAccess = (user, moduleId) => {
        if (!user.allowedModules) return true;
        return user.allowedModules.includes(moduleId);
    };

    const handleAssignTestFile = (e, uid) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const title = prompt("Введите название теста:", "Тест от преподавателя");
                if (!title) return;

                const normalized = data.map(t => ({
                    question: t.question || '', questionImg: t.questionImg || null,
                    variants: (t.variants || []).map(v => typeof v === 'object' ? v : { text: String(v), img: null }),
                    correctIndex: t.correctIndex
                }));

                const currentUser = users.find(u => u.id === uid);
                const currentTests = currentUser.assignedTests || [];
                const newTest = { id: Date.now(), title: title.trim(), data: normalized };

                await window.db.collection('users').doc(uid).update({ assignedTests: [...currentTests, newTest] });
                alert("✅ Тест успешно загружен и добавлен студенту!");
            } catch (err) { alert("Ошибка чтения JSON файла!"); }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const removeTest = async (uid, testId) => {
        if (confirm("Удалить этот тест у студента?")) {
            try {
                const currentUser = users.find(u => u.id === uid);
                const updatedTests = (currentUser.assignedTests || []).filter(t => t.id !== testId);
                await window.db.collection('users').doc(uid).update({ assignedTests: updatedTests });
            } catch (e) { alert("Ошибка при удалении теста"); }
        }
    };

    const currentUserUid = window.auth?.currentUser?.uid;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const bannedCount = users.filter(u => u.isBanned).length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '26px' }}
        >
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                borderBottom: '1px solid var(--glass-border)', paddingBottom: '22px', marginBottom: '28px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 10px 24px -8px rgba(239,68,68,0.5)'
                    }}>
                        🛡️
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ margin: 0, fontSize: '23px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Панель управления</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>Настройка доступов и тестов</div>
                    </div>
                </div>

                {users.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)' }}>
                            👥 {users.length} всего
                        </div>
                        <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '12px', fontWeight: 800, color: '#d97706' }}>
                            ⭐ {adminCount} админ{adminCount === 1 ? '' : adminCount >= 2 && adminCount <= 4 ? 'а' : 'ов'}
                        </div>
                        {bannedCount > 0 && (
                            <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px', fontWeight: 800, color: '#ef4444' }}>
                                🚫 {bannedCount} забанен{bannedCount === 1 ? '' : 'о'}
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {users.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-sec)', padding: '50px 20px', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: '#ef4444' }}
                        />
                        Загрузка пользователей базы данных…
                    </div>
                )}

                {users.map(u => (
                    <UserAdminCard
                        key={u.id}
                        u={u}
                        currentUserUid={currentUserUid}
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

Object.assign(window, { AuthScreen, AdminPanel });
