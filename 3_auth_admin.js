// --- 3_auth.js ---
const { useState } = React;
const { motion, AnimatePresence } = window.Motion;

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
                    excelHintsEnabled: true 
                });
            }
        } catch (err) {
            console.error(err);
            let errMsg = "Произошла ошибка при авторизации.";
            if (err.code === 'auth/popup-closed-by-user') errMsg = "Вы закрыли окно авторизации. Попробуйте снова.";
            else if (err.code === 'auth/network-request-failed') errMsg = "Ошибка сети. Проверьте интернет-соединение.";
            else if (err.code === 'auth/operation-not-allowed') errMsg = "Вход через Google не включен в настройках Firebase!";
            setError(errMsg);
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            key="auth"
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '44px 32px', borderRadius: '28px', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.18)', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.16), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', boxShadow: '0 10px 25px -8px rgba(99,102,241,0.55)' }}>
                🔐
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Вход в систему</h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600, lineHeight: 1.5 }}>Используйте рабочий аккаунт Google, чтобы продолжить</p>

            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: '16px' }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239, 68, 68, 0.08)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: '600', textAlign: 'left' }}>
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.015, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleGoogleSignIn} disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', height: '54px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: '800', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', opacity: isLoading ? 0.65 : 1, transition: '0.2s' }}
            >
                {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid var(--glass-border)', borderTopColor: '#38bdf8' }} /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22 }} />}
                {isLoading ? 'Входим…' : 'Продолжить с Google'}
            </motion.button>
        </motion.div>
    );
});

Object.assign(window, { AuthScreen });
