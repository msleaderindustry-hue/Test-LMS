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
                    allowedModules: ['chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'algo']
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
        <motion.div key="auth" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 20px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
            <h2 style={{marginTop:0, marginBottom: '30px', fontSize: '24px', fontWeight: 900, color: 'var(--text-main)'}}>Вход в систему</h2>
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{opacity: 0, height: 0, overflow: 'hidden'}} 
                        animate={{opacity: 1, height: 'auto', marginBottom: '15px'}} 
                        exit={{opacity: 0, height: 0, marginBottom: 0}} 
                        style={{ color: '#ef4444', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600' }}>
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    width: '100%', height: '54px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                    background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '16px', fontWeight: '800',
                    cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', opacity: isLoading ? 0.7 : 1, transition: '0.2s'
                }}
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 24, height: 24}} />
                {isLoading ? 'Загрузка...' : 'Продолжить с Google'}
            </motion.button>
            <div style={{ marginTop: '25px', fontSize: '12px', color: 'var(--text-sec)', opacity: 0.8, fontWeight: 600 }}>
                Доступ разрешен только для подтвержденных аккаунтов.
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
    { id: 'algo', icon: '🧩', label: 'Конструктор', color: '#0ea5e9' }
];

// --- АДМИН-ПАНЕЛЬ ---
const AdminPanel = ({ onBack }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if(!window.db) return;
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
            onBack();
        }
    }, [users, onBack]);

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
                    variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}),
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
        if(confirm("Удалить этот тест у студента?")) {
            try {
                const currentUser = users.find(u => u.id === uid);
                const updatedTests = (currentUser.assignedTests || []).filter(t => t.id !== testId);
                await window.db.collection('users').doc(uid).update({ assignedTests: updatedTests });
            } catch(e) { alert("Ошибка при удалении теста"); }
        }
    };

    return (
        <motion.div initial={{opacity:0, scale: 0.98}} animate={{opacity:1, scale: 1}} className="glass-panel" style={{width:'100%', maxWidth:'1000px', maxHeight:'90vh', overflowY:'auto', padding: '30px', borderRadius: '24px'}}>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '32px' }}>🛡️</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#ef4444', letterSpacing: '-0.5px' }}>Панель Управления</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>Настройка доступов и тестов</div>
                    </div>
                </div>
                {/* Вернули нормальную кнопку "В МЕНЮ" */}
                <Button variant="muted" onClick={onBack} style={{ borderRadius: '12px', fontWeight: 'bold', height: '40px', padding: '0 15px', width: 'auto' }}>⬅ В меню</Button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {users.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-sec)', padding: '40px', fontWeight: 600}}>Загрузка пользователей базы данных...</div>}
                
                {users.map(u => (
                    <div key={u.id} style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                        
                        <div style={{ display:'flex', flexWrap: 'wrap', gap: '15px', justifyContent:'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            {/* БЛОК ИНФОРМАЦИИ */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: 0, flex: '1 1 250px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: u.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-panel)', border: `2px solid ${u.isBanned ? '#ef4444' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                    {u.isBanned ? '🚫' : '👤'}
                                </div>
                                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {u.nickname || u.email}
                                    </div>
                                    <div style={{ fontSize: '11px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ color: u.isBanned ? '#ef4444' : '#10b981', fontWeight: 900, textTransform: 'uppercase' }}>
                                            {u.isBanned ? 'Заблокирован' : 'Активен'}
                                        </span>
                                        {u.role === 'admin' && <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '10px' }}>АДМИН</span>}
                                        <span style={{ color: 'var(--text-sec)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* КНОПКИ УПРАВЛЕНИЯ (Теперь не растягиваются на мобилке!) */}
                            {u.id !== window.auth.currentUser?.uid && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '0 0 auto' }}>
                                    <Button variant={u.role === 'admin' ? "orange" : "muted"} style={{ width: 'auto', height: '34px', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, margin: 0 }} onClick={() => toggleAdmin(u.id, u.role)}>
                                        {u.role === 'admin' ? "Снять админа" : "Дать админа"}
                                    </Button>
                                    <label style={{ width: 'auto', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '8px', padding: '0 12px', height: '34px', fontSize: '12px', fontWeight: 800, transition: '0.2s', boxShadow: '0 4px 10px rgba(0, 242, 254, 0.2)', margin: 0 }}>
                                        📁 Тест
                                        <input type="file" accept=".json" style={{display: 'none'}} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                    </label>
                                    <Button variant={u.isBanned ? "green" : "red"} style={{ width: 'auto', height: '34px', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, margin: 0 }} onClick={() => toggleBan(u.id, u.isBanned)}>
                                        {u.isBanned ? "Разбанить" : "Забанить"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* НАСТРОЙКА ДОСТУПОВ */}
                        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '15px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Доступ к модулям платформы:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {AVAILABLE_MODULES.map(module => {
                                    const access = hasAccess(u, module.id);
                                    return (
                                        <div 
                                            key={module.id} 
                                            onClick={() => toggleModuleAccess(u.id, u, module.id)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                                padding: '6px 12px', borderRadius: '10px', 
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                background: access ? `${module.color}15` : 'transparent',
                                                border: `1px solid ${access ? module.color : 'var(--glass-border)'}`,
                                                color: access ? module.color : 'var(--text-sec)',
                                                opacity: access ? 1 : 0.5,
                                                width: 'auto'
                                            }}
                                        >
                                            <span style={{ fontSize: '14px', filter: access ? 'none' : 'grayscale(100%)' }}>{module.icon}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 800 }}>{module.label}</span>
                                            {access && <span style={{ fontSize: '10px' }}>✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* НАЗНАЧЕННЫЕ ТЕСТЫ */}
                        {u.assignedTests && u.assignedTests.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '5px' }}>Назначенные персональные тесты:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {u.assignedTests.map(test => (
                                        <div key={test.id} style={{ background: 'var(--bg-panel)', border: '1px dashed #3b82f6', color: '#3b82f6', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '10px', width: 'auto' }}>
                                            <span>☁️ {test.title}</span>
                                            <div style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '10px' }} onClick={() => removeTest(u.id, test.id)}>✖</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </motion.div>
    );
};

Object.assign(window, { AuthScreen, AdminPanel });
