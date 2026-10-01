// --- 3_auth.js ---
// Ultimate LMS — улучшенная авторизация через Google
// Требует: React, Framer Motion (window.Motion), Firebase compat,
// window.auth и window.db должны быть инициализированы ДО этого файла.

(function () {
    const { useState, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;

    const AuthIcon = ({ name, size = 22 }) => {
        const icons = {
            lock: (
                <>
                    <rect x="4" y="10" width="16" height="11" rx="3" />
                    <path d="M8 10V7a4 4 0 018 0v3" />
                </>
            ),
            alert: (
                <>
                    <path d="M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                </>
            ),
            shield: (
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            )
        };

        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {icons[name] || null}
            </svg>
        );
    };

    const getAuthErrorMessage = (error) => {
        const code = error?.code || '';

        switch (code) {
            case 'auth/popup-closed-by-user':
                return 'Окно входа было закрыто. Попробуйте ещё раз.';
            case 'auth/popup-blocked':
                return 'Браузер заблокировал окно Google. Разрешите всплывающие окна для этого сайта.';
            case 'auth/cancelled-popup-request':
                return 'Предыдущий запрос входа был отменён. Попробуйте ещё раз.';
            case 'auth/network-request-failed':
                return 'Не удалось связаться с сервером. Проверьте интернет-соединение.';
            case 'auth/operation-not-allowed':
                return 'Вход через Google не включён в настройках Firebase.';
            case 'auth/unauthorized-domain':
                return 'Этот домен не разрешён для авторизации Firebase.';
            case 'auth/account-exists-with-different-credential':
                return 'Для этого email уже существует аккаунт с другим способом входа.';
            case 'permission-denied':
            case 'firestore/permission-denied':
                return 'Нет доступа к профилю пользователя. Проверьте правила Firestore.';
            case 'unavailable':
            case 'firestore/unavailable':
                return 'База данных временно недоступна. Попробуйте немного позже.';
            case 'lms/account-banned':
                return 'Ваш аккаунт заблокирован. Обратитесь к преподавателю.';
            default:
                return 'Не удалось выполнить вход. Попробуйте ещё раз.';
        }
    };

    const prepareUserProfile = async (authUser) => {
        if (!window.firebase) {
            const error = new Error('Firebase не подключён.');
            error.code = 'lms/firebase-missing';
            throw error;
        }

        if (!window.db?.runTransaction) {
            const error = new Error('Firestore не подключён.');
            error.code = 'firestore/unavailable';
            throw error;
        }

        const db = window.db;
        const userRef = db.collection('users').doc(authUser.uid);
        const serverTimestamp = window.firebase.firestore.FieldValue.serverTimestamp();

        return db.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(userRef);

            if (!snapshot.exists) {
                const newProfile = {
                    email: authUser.email || '',
                    nickname:
                        authUser.displayName ||
                        authUser.email?.split('@')[0] ||
                        'Студент',
                    displayName: authUser.displayName || '',
                    photoURL: authUser.photoURL || '',
                    role: 'student',
                    isBanned: false,
                    allowedModules: [
                        'chat',
                        'typing',
                        'hotkeys',
                        'code',
                        'flashcards',
                        'excel'
                    ],
                    excelHintsEnabled: true,
                    chatContactMode: 'all',
                    chatAllowedUsers: [],
                    registeredAt: serverTimestamp,
                    lastLoginAt: serverTimestamp,
                    lastSeenAt: serverTimestamp,
                    loginCount: 1,
                    profileVersion: 2
                };

                transaction.set(userRef, newProfile);

                return {
                    uid: authUser.uid,
                    ...newProfile,
                    isNewUser: true
                };
            }

            const current = snapshot.data() || {};

            if (current.isBanned === true) {
                const error = new Error('Аккаунт заблокирован.');
                error.code = 'lms/account-banned';
                throw error;
            }

            const patch = {
                email: authUser.email || current.email || '',
                displayName: authUser.displayName || current.displayName || '',
                photoURL: authUser.photoURL || current.photoURL || '',
                lastLoginAt: serverTimestamp,
                lastSeenAt: serverTimestamp,
                loginCount: (Number(current.loginCount) || 0) + 1,
                profileVersion: 2
            };

            if (!current.nickname) {
                patch.nickname =
                    authUser.displayName ||
                    authUser.email?.split('@')[0] ||
                    'Студент';
            }

            if (!current.chatContactMode) {
                patch.chatContactMode = 'all';
            }

            if (!Array.isArray(current.chatAllowedUsers)) {
                patch.chatAllowedUsers = [];
            }

            transaction.update(userRef, patch);

            return {
                uid: authUser.uid,
                ...current,
                ...patch,
                isNewUser: false
            };
        });
    };

    const AuthScreen = React.memo(() => {
        const [error, setError] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const signingRef = useRef(false);

        const handleGoogleSignIn = async () => {
            if (signingRef.current) return;

            signingRef.current = true;
            setError('');
            setIsLoading(true);

            try {
                if (!window.firebase) {
                    const e = new Error('Firebase не подключён.');
                    e.code = 'lms/firebase-missing';
                    throw e;
                }

                if (!window.auth) {
                    const e = new Error('Firebase Auth не подключён.');
                    e.code = 'lms/auth-missing';
                    throw e;
                }

                if (!window.db) {
                    const e = new Error('Firestore не подключён.');
                    e.code = 'firestore/unavailable';
                    throw e;
                }

                const provider = new window.firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({
                    prompt: 'select_account'
                });

                const result = await window.auth.signInWithPopup(provider);
                const authUser = result?.user;

                if (!authUser?.uid) {
                    const e = new Error('Firebase не вернул пользователя.');
                    e.code = 'lms/user-missing';
                    throw e;
                }

                const profile = await prepareUserProfile(authUser);

                window.currentLmsUser = {
                    ...profile,
                    uid: authUser.uid
                };

                if (typeof window.trackLmsActivity === 'function') {
                    try {
                        await window.trackLmsActivity(
                            'auth',
                            'platform',
                            {
                                action: 'login',
                                label: 'Вход в систему',
                                details: {
                                    provider: 'google',
                                    newUser: profile.isNewUser === true
                                }
                            }
                        );
                    } catch (trackerError) {
                        console.warn('[Ultimate LMS Tracker]', trackerError);
                    }
                }
            } catch (err) {
                console.error('[Ultimate LMS Auth]', err);

                try {
                    if (window.auth?.currentUser) {
                        await window.auth.signOut();
                    }
                } catch (signOutError) {
                    console.warn(
                        '[Ultimate LMS Auth] Не удалось очистить сессию:',
                        signOutError
                    );
                }

                if (
                    err?.code === 'lms/firebase-missing' ||
                    err?.code === 'lms/auth-missing' ||
                    err?.code === 'lms/user-missing'
                ) {
                    setError('Система авторизации временно недоступна. Перезагрузите страницу.');
                } else {
                    setError(getAuthErrorMessage(err));
                }
            } finally {
                signingRef.current = false;
                setIsLoading(false);
            }
        };

        return (
            <motion.div
                key="auth"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.985 }}
                transition={{
                    duration: 0.42,
                    ease: [0.16, 1, 0.3, 1]
                }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '410px',
                    textAlign: 'center',
                    padding: '42px 32px 32px',
                    borderRadius: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 24px 70px -24px rgba(0,0,0,.28)'
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        width: 210,
                        height: 210,
                        right: -75,
                        top: -90,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(139,92,246,.18), rgba(56,189,248,.08) 45%, transparent 72%)',
                        pointerEvents: 'none'
                    }}
                />

                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        width: 160,
                        height: 160,
                        left: -90,
                        bottom: -100,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(56,189,248,.12), transparent 70%)',
                        pointerEvents: 'none'
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                        delay: 0.08,
                        type: 'spring',
                        stiffness: 230,
                        damping: 18
                    }}
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 19,
                        margin: '0 auto 22px',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        background:
                            'linear-gradient(135deg,#38bdf8 0%,#6366f1 52%,#8b5cf6 100%)',
                        boxShadow:
                            '0 12px 30px -9px rgba(99,102,241,.55)'
                    }}
                >
                    <AuthIcon name="lock" size={29} />
                </motion.div>

                <h2
                    style={{
                        margin: '0 0 8px',
                        fontSize: '23px',
                        fontWeight: 850,
                        letterSpacing: '-.5px',
                        color: 'var(--text-main)'
                    }}
                >
                    Вход в систему
                </h2>

                <p
                    style={{
                        maxWidth: 300,
                        margin: '0 auto 26px',
                        fontSize: '13px',
                        lineHeight: 1.65,
                        color: 'var(--text-sec)',
                        fontWeight: 550
                    }}
                >
                    Используйте Google-аккаунт, чтобы войти в Ultimate LMS
                </p>

                <AnimatePresence initial={false}>
                    {error && (
                        <motion.div
                            role="alert"
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{
                                opacity: 1,
                                height: 'auto',
                                y: 0,
                                marginBottom: 16
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                y: -5,
                                marginBottom: 0
                            }}
                            transition={{ duration: 0.22 }}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 9,
                                padding: '11px 13px',
                                borderRadius: 13,
                                textAlign: 'left',
                                color: '#ef6b78',
                                background: 'rgba(239,68,68,.075)',
                                border: '1px solid rgba(239,68,68,.20)',
                                fontSize: 12,
                                lineHeight: 1.55,
                                fontWeight: 600
                            }}
                        >
                            <AuthIcon name="alert" size={17} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    type="button"
                    whileHover={!isLoading ? { y: -2, scale: 1.008 } : {}}
                    whileTap={!isLoading ? { scale: 0.985 } : {}}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    aria-busy={isLoading}
                    style={{
                        width: '100%',
                        minHeight: 54,
                        borderRadius: 15,
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 11,
                        padding: '0 18px',
                        fontSize: 14,
                        fontWeight: 750,
                        cursor: isLoading ? 'wait' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        boxShadow: '0 7px 22px rgba(0,0,0,.06)'
                    }}
                >
                    {isLoading ? (
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 0.75,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: '2px solid var(--glass-border)',
                                borderTopColor: '#818cf8'
                            }}
                        />
                    ) : (
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt=""
                            width="21"
                            height="21"
                        />
                    )}

                    <span>
                        {isLoading ? 'Проверяем аккаунт…' : 'Продолжить с Google'}
                    </span>
                </motion.button>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: 17,
                        color: 'var(--text-sec)',
                        opacity: 0.72,
                        fontSize: 10.5,
                        fontWeight: 550
                    }}
                >
                    <AuthIcon name="shield" size={13} />
                    Защищённый вход через Google
                </div>
            </motion.div>
        );
    });

    Object.assign(window, { AuthScreen });
})();
