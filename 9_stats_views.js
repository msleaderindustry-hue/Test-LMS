const { useState, useEffect, useRef, memo, useMemo, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

const EMPTY_ARR = [];

// =============================================================================
// ИКОНКИ — лёгкий набор линейных SVG-иконок вместо эмодзи
// =============================================================================
const ICON_PATHS = {
    test: <><path d="M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M9 7h6M9 11h6M9 15h3" /></>,
    excel: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
    keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" /></>,
    zap: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M17 5h3a2 2 0 0 1-2 4M7 5H4a2 2 0 0 0 2 4" /></>,
    rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 19 2c0 2.52-.63 6.63-4 9a22.35 22.35 0 0 1-4 2z" /></>,
    medal: <><circle cx="12" cy="15" r="6" /><path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11" /></>,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    refresh: <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />,
    inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    gauge: <><path d="M12 15l3.5-5" /><path d="M5 19a9 9 0 1 1 14 0" /></>,
};

const Icon = memo(({ name, size = 18, color = 'currentColor', strokeWidth = 2, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
        {ICON_PATHS[name]}
    </svg>
));

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ АВАТАРОК ---
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

// =============================================================================
// КОМПОНЕНТЫ ТЕСТА (логика не тронута — только визуальные уточнения)
// =============================================================================
const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
    const cardRef = useRef(null);
    if (window.useMathJax) window.useMathJax(cardRef, [question]);
    if (!question) return null;

    return (
        <motion.div ref={cardRef} key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="glass-panel" style={{ width: '100%', display: 'block' }}>
            <h3 style={{ textAlign: 'center', marginBottom: 15, opacity: 0.6, fontSize: 14, textTransform: 'uppercase' }}>Вопрос {index + 1}</h3>
            <div style={{ fontSize: 18, marginBottom: 20, fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: question.question }} />
            {question.questionImg && <img src={question.questionImg} className="question-image" />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {question.variants.map((v, i) => {
                    const isAnswered = answers[index] !== null; const isSelected = answers[index] === i; const isCorrect = question.correctIndex === i;
                    let styleOverride = {}; let animationProps = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 } };
                    if (isAnswered) {
                        if (isCorrect) { styleOverride = { background: '#d1fae5', borderColor: '#10b981', color: '#064e3b' }; if (isSelected) animationProps.animate = { opacity: 1, x: 0, scale: [1, 1.05, 1] }; }
                        else if (isSelected) { styleOverride = { background: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d' }; animationProps.animate = { opacity: 1, x: [-5, 5, -5, 5, 0] }; animationProps.transition = { duration: 0.3 }; }
                        else if (question.correctIndex === i) { styleOverride = { borderColor: '#10b981', opacity: 0.7 }; }
                    }
                    return (
                        <motion.div key={i} {...animationProps} className="variant-item" onClick={() => !isAnswered && onAnswer(i)} style={{ pointerEvents: isAnswered ? 'none' : 'auto', display: 'flex', alignItems: 'center', gap: 10, ...styleOverride }} whileHover={!isAnswered ? { scale: 1.01 } : {}}>
                            {isAnswered && isCorrect && <Icon name="check" size={16} color="#059669" />}
                            {isAnswered && isSelected && !isCorrect && <Icon name="x" size={16} color="#b91c1c" />}
                            {v.img && <img src={v.img} style={{ display: 'block', maxWidth: 200, marginBottom: 8, borderRadius: 8 }} />}
                            <span>{v.text}</span>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    );
});

const ReviewView = ({ questions, answers, onBack }) => {
    const reviewRef = useRef(null);
    if (window.useMathJax) window.useMathJax(reviewRef, [questions]);
    return (
        <motion.div ref={reviewRef} key="review" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel review-container">
            <div className="review-header"><h2 style={{ textAlign: 'center', margin: 0 }}>Работа над ошибками</h2></div>
            <div className="review-content">
                {questions.map((q, i) => {
                    const userAns = answers[i]; const isCorrect = userAns === q.correctIndex;
                    return (
                        <div key={i} style={{ background: 'var(--variant-default)', padding: 25, borderRadius: 20, marginBottom: 20, border: isCorrect ? '2px solid #10b981' : '2px solid #ef4444' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                <strong>Вопрос {i + 1}</strong>
                                <span style={{ color: isCorrect ? '#059669' : '#b91c1c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Icon name={isCorrect ? 'check' : 'x'} size={15} color={isCorrect ? '#059669' : '#b91c1c'} />
                                    {isCorrect ? 'ВЕРНО' : 'ОШИБКА'}
                                </span>
                            </div>
                            <div style={{ marginBottom: 20, fontSize: 16 }} dangerouslySetInnerHTML={{ __html: q.question }}></div>
                            {q.questionImg && <img src={q.questionImg} className="question-image" style={{ maxWidth: '100%', maxHeight: 200, display: 'block', margin: '0 auto 15px auto', borderRadius: 10 }} />}
                            {q.variants.map((v, vi) => {
                                let style = { padding: '10px 15px', borderRadius: 10, margin: '5px 0', border: '2px solid transparent', background: 'var(--glass-bg)', opacity: 0.8, color: 'var(--text-main)' };
                                if (vi === q.correctIndex) { style.background = '#d1fae5'; style.borderColor = '#10b981'; style.color = '#064e3b'; style.opacity = 1; }
                                if (vi === userAns && !isCorrect) { style.background = '#fee2e2'; style.borderColor = '#ef4444'; style.color = '#7f1d1d'; style.opacity = 1; }
                                return <div key={vi} style={style} dangerouslySetInnerHTML={{ __html: v.text || 'Image' }}></div>
                            })}
                        </div>
                    )
                })}
            </div>
            <div className="review-footer"><Button onClick={onBack} style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.1)', width: 'auto', padding: '0 40px' }}>В меню</Button></div>
        </motion.div>
    );
};

/* =========================================================================
   СТАТИСТИКА — обновлённый дизайн, иконки вместо эмодзи, доп. анимации
   ========================================================================= */

// Кольцевой индикатор
const RadialGauge = ({ value, max, size = 176, strokeWidth = 12, color, icon, valueDisplay, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--glass-border)" strokeWidth={strokeWidth} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - pct * circumference }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 18 }} style={{ marginBottom: 2, color }}>
                    {icon}
                </motion.div>
                <span style={{ fontSize: size * 0.19, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{valueDisplay}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-sec)', fontWeight: 600 }}>{label}</span>
            </div>
        </div>
    );
};

// Горизонтальная рейка
const StatRail = ({ items }) => (
    <div style={{ display: 'flex', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: 18, overflow: 'hidden', marginTop: 26, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        {items.map((it, i) => (
            <motion.div key={i} whileHover={{ y: -2, backgroundColor: 'var(--glass-bg)' }} transition={{ duration: 0.15 }}
                style={{ flex: 1, padding: '18px 10px', textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--glass-border)' : 'none', cursor: 'default' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: it.color || 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>{it.value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-sec)', marginTop: 4, fontWeight: 600 }}>{it.label}</div>
            </motion.div>
        ))}
    </div>
);

// Ряд точек-сессий
const PipTrail = ({ total, color, cap = 24 }) => {
    const shown = Math.min(total, cap);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
            {Array.from({ length: shown }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.85 }} />
            ))}
            {total > cap && <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 700, marginLeft: 4 }}>+{total - cap}</span>}
        </div>
    );
};

// Пустое состояние — иконка + подпись вместо голого текста
const EmptyState = ({ text }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-sec)' }}>
        <Icon name="inbox" size={30} color="var(--text-sec)" style={{ opacity: 0.5, marginBottom: 10 }} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{text}</p>
    </motion.div>
);

// Значок места в рейтинге — медаль для топ-3, число для остальных
const RankBadge = ({ rank }) => {
    const medalColors = ['#fbbf24', '#94a3b8', '#d97706'];
    if (rank < 3) {
        return (
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                <Icon name="medal" size={24} color={medalColors[rank]} strokeWidth={2.2} />
            </motion.div>
        );
    }
    return <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-sec)' }}>{rank + 1}</span>;
};

const StatsView = ({ history, setHistory, userData }) => {
    const [activeTab, setActiveTab] = useState('tests');

    // БЕРЕМ ДАННЫЕ ИЗ БАЗЫ FIREBASE (userData)
    const historyToUse = userData?.testHistory || history || EMPTY_ARR;

    // Мемоизация сортировки — раньше пересчитывалась на каждый рендер и
    // пересоздавала график даже без реальных изменений данных (лишние лаги)
    const sortedHistory = useMemo(
        () => [...historyToUse].sort((a, b) => b.percent - a.percent),
        [historyToUse]
    );

    const excelStats = userData?.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
    const typingStats = userData?.typingProgress || { maxWpm: 0, maxCombo: 0, testsCompleted: 0 };
    const hotkeyStats = userData?.hotkeyProgress || { maxScore: 0, sessionsPlayed: 0 };

    // Производные показатели по тестам
    const totalTests = historyToUse.length;
    const avgPercent = totalTests ? Math.round(historyToUse.reduce((s, h) => s + h.percent, 0) / totalTests) : 0;
    const bestPercent = totalTests ? Math.max(...historyToUse.map(h => h.percent)) : 0;
    const passRate = totalTests ? Math.round((historyToUse.filter(h => h.percent >= 50).length / totalTests) * 100) : 0;

    // --- СОСТОЯНИЯ ДЛЯ РЕЙТИНГА ---
    const [lbCategory, setLbCategory] = useState('excel');
    const [lbUsers, setLbUsers] = useState(null);
    const [loadingLb, setLoadingLb] = useState(false);
    const [lbError, setLbError] = useState(null);

    const fetchLeaderboard = useCallback(() => {
        setLbError(null);
        setLoadingLb(true);
        try {
            if (window.db) {
                window.db.collection('users').get().then(snap => {
                    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setLbUsers(data);
                    setLoadingLb(false);
                }).catch(e => {
                    console.error(e);
                    setLbError('Нет доступа к базе (возможно, вы не админ).');
                    setLoadingLb(false);
                });
            } else {
                setLbError('База данных не подключена.');
                setLoadingLb(false);
            }
        } catch (e) {
            setLbError('Ошибка загрузки рейтинга.');
            setLoadingLb(false);
        }
    }, []);

    // Загрузка глобального рейтинга из Firebase
    useEffect(() => {
        if (activeTab === 'leaderboard' && !lbUsers && !loadingLb && !lbError) {
            fetchLeaderboard();
        }
    }, [activeTab, lbUsers, loadingLb, lbError, fetchLeaderboard]);

    // Сортировка и фильтрация рейтинга
    const sortedLb = useMemo(() => {
        if (!lbUsers) return [];
        let list = [...lbUsers];
        if (lbCategory === 'excel') {
            list = list.sort((a, b) => (b.excelProgress?.xp || 0) - (a.excelProgress?.xp || 0));
        } else if (lbCategory === 'typing') {
            list = list.sort((a, b) => (b.typingProgress?.maxWpm || 0) - (a.typingProgress?.maxWpm || 0));
        } else if (lbCategory === 'hotkeys') {
            list = list.sort((a, b) => (b.hotkeyProgress?.maxScore || 0) - (a.hotkeyProgress?.maxScore || 0));
        } else if (lbCategory === 'tests') {
            list = list.sort((a, b) => {
                const aTests = a.testHistory?.length || 0;
                const bTests = b.testHistory?.length || 0;
                return bTests - aTests;
            });
        }

        return list.filter(u => {
            if (lbCategory === 'excel') return (u.excelProgress?.xp || 0) > 0;
            if (lbCategory === 'typing') return (u.typingProgress?.maxWpm || 0) > 0;
            if (lbCategory === 'hotkeys') return (u.hotkeyProgress?.maxScore || 0) > 0;
            if (lbCategory === 'tests') return (u.testHistory?.length || 0) > 0;
            return false;
        }).slice(0, 50); // Берем ТОП-50
    }, [lbUsers, lbCategory]);


    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (activeTab === 'tests' && chartRef.current && sortedHistory.length > 0) {
            if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
            const ctx = chartRef.current.getContext('2d');

            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');

            chartInstance.current = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedHistory.slice(0, 10).map(i => i.student),
                    datasets: [{
                        label: '%',
                        data: sortedHistory.slice(0, 10).map(i => i.percent),
                        backgroundColor: gradient,
                        borderRadius: 8,
                        borderSkipped: false,
                        barPercentage: 0.5
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(128,128,128,0.1)', drawBorder: false }, ticks: { color: 'rgba(128,128,128,0.7)', font: { weight: '600' } } },
                        x: { grid: { display: false, drawBorder: false }, ticks: { color: 'rgba(128,128,128,0.7)', font: { weight: '600' } } }
                    },
                    plugins: { legend: { display: false } },
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 600, easing: 'easeOutQuart' }
                }
            });
        }
        return () => {
            if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
        };
    }, [activeTab, sortedHistory]);

    // --- Удаление записи с подтверждением через повторный клик
    // (вместо блокирующего window.confirm, который обрывал анимации) ---
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        if (!confirmDeleteId) return;
        const t = setTimeout(() => setConfirmDeleteId(null), 2500);
        return () => clearTimeout(t);
    }, [confirmDeleteId]);

    const removeEntry = async (id) => {
        const nh = historyToUse.filter(item => item.id !== id);

        // Локально обновляем экран
        setHistory(nh);
        localStorage.setItem('test_history_v1', JSON.stringify(nh));

        // Удаляем из базы Firebase
        try {
            const uid = window.auth?.currentUser?.uid;
            if (uid && window.db) {
                await window.db.collection('users').doc(uid).set({ testHistory: nh }, { merge: true });
            }
        } catch (e) {
            console.error("Ошибка при удалении теста из Firebase", e);
        }
    };

    const handleDeleteClick = (id) => {
        if (confirmDeleteId === id) {
            setConfirmDeleteId(null);
            removeEntry(id);
        } else {
            setConfirmDeleteId(id);
        }
    };

    const TABS = [
        { id: 'tests', label: 'Тесты', icon: 'test', color: '#a855f7' },
        { id: 'excel', label: 'Excel', icon: 'excel', color: '#22c55e' },
        { id: 'typing', label: 'Печать', icon: 'keyboard', color: '#38bdf8' },
        { id: 'hotkeys', label: 'Хоткеи', icon: 'zap', color: '#f59e0b' },
        { id: 'leaderboard', label: 'Рейтинг', icon: 'trophy', color: '#fbbf24' }
    ];

    const LB_CATEGORIES = [
        { id: 'excel', label: 'Excel XP', icon: 'excel' },
        { id: 'typing', label: 'Печать WPM', icon: 'keyboard' },
        { id: 'hotkeys', label: 'Хоткеи', icon: 'zap' },
        { id: 'tests', label: 'Тесты', icon: 'test' }
    ];

    return (
        <motion.div key="stats" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: 900, maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '40px', borderRadius: '32px' }}>

            <div style={{ textAlign: 'center', marginBottom: 30, flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, var(--text-main), #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                    Мой прогресс
                </h2>
            </div>

            <div className="modern-scroll" role="tablist" aria-label="Разделы прогресса" style={{ flexShrink: 0, display: 'flex', background: 'var(--bg-panel)', padding: '6px', borderRadius: '20px', gap: '4px', margin: '0 auto 35px', width: 'fit-content', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--glass-border)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                {TABS.map(t => {
                    const isActive = activeTab === t.id;
                    return (
                        <button key={t.id} type="button" role="tab" aria-selected={isActive} onClick={() => setActiveTab(t.id)}
                            style={{ position: 'relative', padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1, flexShrink: 0, border: 'none', background: 'transparent', font: 'inherit', outline: 'none' }}>
                            {isActive && (
                                <motion.div layoutId="tab-bg" transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    style={{ position: 'absolute', inset: 0, background: t.color, borderRadius: '14px', zIndex: -1, boxShadow: `0 4px 15px ${t.color}50` }}
                                />
                            )}
                            <Icon name={t.icon} size={16} color={isActive ? '#fff' : 'var(--text-sec)'} style={{ opacity: isActive ? 1 : 0.75, transition: 'opacity 0.2s' }} />
                            <span style={{ fontSize: '13.5px', fontWeight: 700, color: isActive ? '#fff' : 'var(--text-sec)', transition: 'color 0.2s' }}>{t.label}</span>
                        </button>
                    );
                })}
            </div>

            <div style={{ flex: 1 }}>
                <AnimatePresence mode="wait">

                    {/* ==================== ТЕСТЫ ==================== */}
                    {activeTab === 'tests' && (
                        <motion.div key="t-tests" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            {totalTests === 0 ? (
                                <EmptyState text="Вы еще не проходили тесты" />
                            ) : (
                                <>
                                    {/* ГРАФИК */}
                                    <div style={{
                                        position: 'relative', height: '280px', minHeight: '280px', width: '100%',
                                        background: 'var(--bg-panel)',
                                        padding: '24px', borderRadius: '20px', marginBottom: '24px',
                                        border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                    }}>
                                        <canvas ref={chartRef}></canvas>
                                    </div>

                                    <StatRail items={[
                                        { label: 'Средний балл', value: `${avgPercent}%`, color: '#a855f7' },
                                        { label: 'Лучший результат', value: `${bestPercent}%`, color: '#fbbf24' },
                                        { label: 'Успешных попыток', value: `${passRate}%`, color: '#34d399' },
                                        { label: 'Всего тестов', value: totalTests, color: 'var(--text-main)' },
                                    ]} />

                                    <div style={{ fontSize: '12px', color: 'var(--text-sec)', fontWeight: 700, marginTop: '32px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        История прохождений
                                    </div>

                                    <div>
                                        <AnimatePresence initial={false}>
                                            {sortedHistory.map((h, i) => {
                                                const rankColor = (idx) => (idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#c2854b' : '#3f3f46');
                                                const confirming = confirmDeleteId === h.id;
                                                return (
                                                    <motion.div key={h.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                                                        transition={{ delay: i * 0.03 }}
                                                        style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, paddingTop: 6 }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: rankColor(i), boxShadow: i < 3 ? `0 0 10px ${rankColor(i)}` : 'none', flexShrink: 0 }} />
                                                            {i < sortedHistory.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 34, background: 'var(--glass-border)', marginTop: 4 }} />}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0, paddingBottom: 22 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                                                                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.topic}</span>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                                    <span style={{ fontWeight: 900, fontSize: 15, color: h.percent >= 50 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>{h.percent}%</span>
                                                                    <button type="button" onClick={() => handleDeleteClick(h.id)}
                                                                        title={confirming ? 'Нажмите еще раз для удаления' : 'Удалить запись'}
                                                                        style={{ background: confirming ? '#fee2e2' : 'none', border: 'none', borderRadius: 8, color: confirming ? '#ef4444' : 'var(--text-sec)', cursor: 'pointer', padding: 5, display: 'flex', transition: 'background 0.15s' }}>
                                                                        <Icon name={confirming ? 'trash' : 'x'} size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600, marginTop: 2 }}>{h.student} · {h.date}</div>
                                                            <div style={{ height: 4, borderRadius: 2, background: 'var(--glass-border)', marginTop: 9, overflow: 'hidden' }}>
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${h.percent}%` }} transition={{ duration: 0.7, delay: i * 0.03 }}
                                                                    style={{ height: '100%', borderRadius: 2, background: h.percent >= 50 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#f87171,#ef4444)' }} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== EXCEL ==================== */}
                    {activeTab === 'excel' && (
                        <motion.div key="t-excel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            <RadialGauge
                                value={excelStats.xp % 1000}
                                max={1000}
                                color="#22c55e"
                                icon={<Icon name="excel" size={18} color="#22c55e" />}
                                valueDisplay={excelStats.level}
                                label="уровень"
                            />
                            <StatRail items={[
                                { label: 'Решено формул', value: excelStats.completedLessons, color: '#f59e0b' },
                                { label: 'Серия без ошибок', value: excelStats.streak, color: '#ef4444' },
                                { label: 'Всего XP', value: excelStats.xp, color: '#3b82f6' },
                            ]} />
                        </motion.div>
                    )}

                    {/* ==================== ПЕЧАТЬ ==================== */}
                    {activeTab === 'typing' && (
                        <motion.div key="t-typing" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            <RadialGauge
                                value={typingStats.maxWpm}
                                max={120}
                                color="#38bdf8"
                                icon={<Icon name="rocket" size={18} color="#38bdf8" />}
                                valueDisplay={typingStats.maxWpm}
                                label="WPM рекорд"
                            />
                            <StatRail items={[
                                { label: 'Лучшее комбо', value: `x${typingStats.maxCombo}`, color: '#a855f7' },
                                { label: 'Пройдено текстов', value: typingStats.testsCompleted, color: 'var(--text-main)' },
                            ]} />
                        </motion.div>
                    )}

                    {/* ==================== ХОТКЕИ ==================== */}
                    {activeTab === 'hotkeys' && (
                        <motion.div key="t-hotkeys" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            <RadialGauge
                                value={hotkeyStats.maxScore}
                                max={Math.max(hotkeyStats.maxScore * 1.25, 100)}
                                color="#f59e0b"
                                icon={<Icon name="zap" size={18} color="#f59e0b" />}
                                valueDisplay={hotkeyStats.maxScore}
                                label="рекорд за сессию"
                            />
                            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-main)', fontWeight: 700, marginTop: 28 }}>
                                Сыграно сессий: {hotkeyStats.sessionsPlayed}
                            </div>
                            <PipTrail total={hotkeyStats.sessionsPlayed} color="#22c55e" />
                        </motion.div>
                    )}

                    {/* ==================== ГЛОБАЛЬНЫЙ РЕЙТИНГ ==================== */}
                    {activeTab === 'leaderboard' && (
                        <motion.div key="t-leaderboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', justifyContent: 'center' }}>
                                {LB_CATEGORIES.map(cat => (
                                    <button key={cat.id} type="button" onClick={() => setLbCategory(cat.id)} style={{
                                        padding: '8px 16px', borderRadius: '12px',
                                        border: lbCategory === cat.id ? 'none' : '1px solid var(--glass-border)',
                                        background: lbCategory === cat.id ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'var(--bg-panel)',
                                        color: lbCategory === cat.id ? '#fff' : 'var(--text-sec)',
                                        fontWeight: 800, fontSize: '12.5px', cursor: 'pointer',
                                        boxShadow: lbCategory === cat.id ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7
                                    }}>
                                        <Icon name={cat.icon} size={14} color={lbCategory === cat.id ? '#fff' : 'var(--text-sec)'} />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {loadingLb ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[0, 1, 2].map(i => (
                                        <motion.div key={i} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.15 }}
                                            style={{ height: 66, borderRadius: 18, background: 'var(--bg-panel)', border: '1px solid var(--glass-border)' }} />
                                    ))}
                                </div>
                            ) : lbError ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: 16 }}>{lbError}</p>
                                    <button type="button" onClick={fetchLeaderboard} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--bg-panel)', color: 'var(--text-main)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                        <Icon name="refresh" size={14} /> Повторить
                                    </button>
                                </div>
                            ) : sortedLb.length === 0 ? (
                                <EmptyState text="Пока нет результатов в этой категории" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {sortedLb.map((u, i) => {
                                        const isMe = window.auth?.currentUser?.uid === u.id;
                                        let val = 0;
                                        if (lbCategory === 'excel') val = u.excelProgress?.xp || 0;
                                        else if (lbCategory === 'typing') val = u.typingProgress?.maxWpm || 0;
                                        else if (lbCategory === 'hotkeys') val = u.hotkeyProgress?.maxScore || 0;
                                        else if (lbCategory === 'tests') val = u.testHistory?.length || 0;

                                        return (
                                            <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }}
                                                whileHover={{ y: -2 }} style={{
                                                    display: 'flex', alignItems: 'center', padding: '14px 18px',
                                                    background: isMe ? 'var(--bg-elevated)' : 'var(--bg-panel)',
                                                    border: isMe ? '2px solid #38bdf8' : '1px solid var(--glass-border)',
                                                    borderRadius: '18px', gap: '15px',
                                                    boxShadow: isMe ? '0 4px 20px rgba(56, 189, 248, 0.15)' : 'none'
                                                }}>
                                                <div style={{ width: '36px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                                    <RankBadge rank={i} />
                                                </div>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: avatarGradient(u.id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0, fontSize: '15px' }}>
                                                    {getInitials(u.nickname || u.email)}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {u.nickname || u.email || 'Аноним'}
                                                        {isMe && <span style={{ fontSize: '10px', background: '#38bdf8', color: '#fff', padding: '3px 7px', borderRadius: '6px' }}>ВЫ</span>}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '2px', fontWeight: 600 }}>{u.role === 'admin' ? 'Преподаватель' : 'Ученик'}</div>
                                                </div>
                                                <div style={{ fontWeight: 900, fontSize: '22px', color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
                                                    {val} <span style={{ fontSize: '12px', color: 'var(--text-sec)' }}>
                                                        {lbCategory === 'excel' ? 'XP' : lbCategory === 'typing' ? 'WPM' : ''}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </motion.div>
    )
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
