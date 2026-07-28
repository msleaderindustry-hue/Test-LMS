// --- ВЫНЕСЕННЫЕ КОМПОНЕНТЫ ---

// ЭКРАН АВТОРИЗАЦИИ
const AuthScreen = memo(() => {
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
                    registeredAt: new Date().toISOString()
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
        <motion.div key="auth" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{marginTop:0, marginBottom: 30}}>Вход в систему</h2>
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{opacity: 0, height: 0, overflow: 'hidden'}} 
                        animate={{opacity: 1, height: 'auto', marginBottom: '15px'}} 
                        exit={{opacity: 0, height: 0, marginBottom: 0}} 
                        style={{ color: '#ef4444', fontSize: '0.95rem', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500' }}>
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
                    width: '100%', height: '54px', borderRadius: '14px', border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)', color: 'var(--text-main)', fontSize: '16px', fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', opacity: isLoading ? 0.7 : 1
                }}
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 24, height: 24}} />
                {isLoading ? 'Загрузка...' : 'Продолжить с Google'}
            </motion.button>
            <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-sec)', opacity: 0.7 }}>
                Доступ разрешен только для подтвержденных аккаунтов.
            </div>
        </motion.div>
    );
});

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

    const toggleBan = async (uid, currentStatus) => {
        try {
            await window.db.collection('users').doc(uid).update({ isBanned: !currentStatus });
        } catch (e) {
            alert("Ошибка при изменении статуса");
        }
    };

    const toggleAdmin = async (uid, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'student' : 'admin';
            await window.db.collection('users').doc(uid).update({ role: newRole });
        } catch (e) {
            alert("Ошибка при изменении роли");
        }
    };

    const handleAssignTestFile = (e, uid) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const title = prompt("Введите название теста (например: Промбезопасность Вариант 1):", "Тест от преподавателя");
                if (!title) return;

                const normalized = data.map(t => ({
                    question: t.question || '',
                    questionImg: t.questionImg || null,
                    variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}),
                    correctIndex: t.correctIndex
                }));

                const currentUser = users.find(u => u.id === uid);
                const currentTests = currentUser.assignedTests || [];
                
                const newTest = { 
                    id: Date.now(),
                    title: title.trim(),
                    data: normalized
                };

                await window.db.collection('users').doc(uid).update({ 
                    assignedTests: [...currentTests, newTest] 
                });
                
                alert("✅ Тест успешно загружен и добавлен студенту!");
            } catch (err) {
                console.error(err);
                alert("Ошибка чтения JSON файла! Проверьте, правильный ли это файл теста.");
            }
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
            } catch(e) {
                alert("Ошибка при удалении теста");
            }
        }
    };

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:'800px', maxHeight:'90vh', overflowY:'auto'}}>
            <Button variant="muted" onClick={onBack} style={{marginBottom: 20}}>⬅ В меню</Button>
            <h2 style={{color:'#ef4444', textAlign:'center', marginTop:0}}>Панель Администратора</h2>

            <div style={{background:'rgba(128,128,128,0.05)', padding:20, borderRadius:15, border: '1px solid var(--glass-border)'}}>
                <h3 style={{marginTop: 0}}>👥 Управление студентами</h3>
                {users.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-sec)'}}>Загрузка пользователей...</div>}
                {users.map(u => (
                    <div key={u.id} style={{display:'flex', flexWrap: 'wrap', gap: '15px', justifyContent:'space-between', alignItems: 'center', padding:'15px 0', borderBottom:'1px solid rgba(128,128,128,0.1)'}}>
                        
                        {/* --- Блок с текстом: почта и статус --- */}
                        <div style={{overflow: 'hidden', flex: '1 1 200px'}}>
                            <div style={{fontWeight:'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{u.email}</div>
                            <div style={{fontSize:12, color: u.isBanned ? '#ef4444' : '#10b981', fontWeight: 'bold', marginTop: '5px'}}>
                                {u.isBanned ? ' ЗАБЛОКИРОВАН' : ' АКТИВЕН'}
                                {u.role === 'admin' ? ' | 🛡️ АДМИН' : ''}
                            </div>
                            
                            {u.assignedTests && u.assignedTests.length > 0 && (
                                <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                    {u.assignedTests.map(test => (
                                        <div key={test.id} style={{fontSize:12, color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59, 130, 246, 0.1)', padding: '5px 10px', borderRadius: '8px', marginRight: '10px'}}>
                                            <span>☁️ {test.title}</span>
                                            <span style={{cursor: 'pointer', color: '#ef4444', fontSize: '14px', padding: '0 5px'}} onClick={() => removeTest(u.id, test.id)}>✖</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* --- Блок с кнопками управления --- */}
                        {u.id !== window.auth.currentUser?.uid && (
                            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-start'}}>
                                <Button variant={u.role === 'admin' ? "orange" : "teal"} style={{flex: '1 1 auto', padding:'0 12px', height:36, minHeight:36, fontSize:11, margin:0}} onClick={() => toggleAdmin(u.id, u.role)}>
                                    {u.role === 'admin' ? "Снять админа" : "Дать админа"}
                                </Button>
                                <label style={{cursor: 'pointer', flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '14px', padding: '0 12px', height: '36px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(50,50,93,0.11)', textTransform: 'uppercase', margin: 0}}>
                                    📁 Загрузить
                                    <input type="file" accept=".json" style={{display: 'none'}} onChange={(e) => handleAssignTestFile(e, u.id)} />
                                </label>
                                <Button variant={u.isBanned ? "green" : "red"} style={{flex: '1 1 auto', padding:'0 12px', height:36, minHeight:36, fontSize:11, margin:0}} onClick={() => toggleBan(u.id, u.isBanned)}>
                                    {u.isBanned ? "Разбанить" : "Забанить"}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, { AuthScreen, AdminPanel });