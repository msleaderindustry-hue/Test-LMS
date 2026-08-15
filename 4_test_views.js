const { useState, useEffect, useRef, useMemo, memo } = React;
const { motion, AnimatePresence } = window.Motion || { motion: { div: 'div', button: 'button' }, AnimatePresence: React.Fragment };
const { Button } = window;

// --- 1. КАРТОЧКА ВОПРОСА С ЭФФЕКТАМИ, СТРИКОМ И SKELETON ---
const TestQuestionCard = memo(({ question, index, totalQuestions, answers, onAnswer, streak = 0, isLoading = false }) => {
    const cardRef = useRef(null);
    if (window.useMathJax) {
        window.useMathJax(cardRef, [question]);
    }

    const [imgLoaded, setImgLoaded] = useState(false);
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isLoading || !question) {
        return (
            <div className="glass-panel" style={{ width: '100%', padding: '30px 24px', borderRadius: '24px' }}>
                <div style={{ width: '80px', height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', margin: '0 auto 20px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '90%', height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', margin: '0 auto 25px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} style={{ height: '52px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </div>
        );
    }

    const isAnswered = answers && answers[index] !== null && answers[index] !== undefined;
    const selectedAns = isAnswered ? answers[index] : null;
    const isSelectedCorrect = isAnswered && selectedAns === question.correctIndex;
    const isSelectedWrong = isAnswered && selectedAns !== question.correctIndex;

    // Скример-бордер (glow pulse) при правильном и shake при неверном
    let cardGlowStyle = {
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        border: '1px solid var(--glass-border)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
    };
    let cardAnimate = { opacity: 1, x: 0, scale: 1 };

    if (isAnswered) {
        if (isSelectedCorrect) {
            cardGlowStyle.boxShadow = '0 0 35px rgba(16, 185, 129, 0.45), inset 0 0 15px rgba(16, 185, 129, 0.15)';
            cardGlowStyle.borderColor = '#10b981';
            if (!prefersReducedMotion) {
                cardAnimate.scale = [1, 1.015, 1];
            }
        } else if (isSelectedWrong) {
            cardGlowStyle.boxShadow = '0 0 35px rgba(239, 68, 68, 0.45), inset 0 0 15px rgba(239, 68, 68, 0.15)';
            cardGlowStyle.borderColor = '#ef4444';
            if (!prefersReducedMotion) {
                cardAnimate.x = [-8, 8, -6, 6, -3, 3, 0];
            }
        }
    }

    return (
        <motion.div
            ref={cardRef}
            key={index}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={cardAnimate}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="glass-panel"
            style={{ width: '100%', display: 'block', position: 'relative', overflow: 'hidden', padding: '30px 24px', borderRadius: '24px', ...cardGlowStyle }}
        >
            {/* Верхняя панель: Номер вопроса + Streak Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ opacity: 0.6, fontSize: 13, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                    Вопрос {index + 1} {totalQuestions ? `из ${totalQuestions}` : ''}
                </span>

                {streak >= 3 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2))',
                            border: '1px solid rgba(249, 115, 22, 0.5)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#f97316'
                        }}
                    >
                        <span>🔥</span>
                        <span>Серия: {streak}</span>
                    </motion.div>
                )}
            </div>

            {/* Текст вопроса */}
            <div style={{ fontSize: 19, marginBottom: 22, fontWeight: 700, lineHeight: 1.5, color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: question.question }} />

            {/* Изображение к вопросу со Skeleton фолбэком */}
            {question.questionImg && (
                <div style={{ position: 'relative', minHeight: imgLoaded ? 'auto' : '150px', marginBottom: 20 }}>
                    {!imgLoaded && (
                        <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
                    )}
                    <img
                        src={question.questionImg}
                        className="question-image"
                        alt="Question Media"
                        onLoad={() => setImgLoaded(true)}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 250,
                            display: imgLoaded ? 'block' : 'none',
                            margin: '0 auto',
                            borderRadius: 14,
                            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                        }}
                    />
                </div>
            )}

            {/* Варианты ответов */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {question.variants.map((v, i) => {
                    const isSelected = selectedAns === i;
                    const isCorrect = question.correctIndex === i;

                    let styleOverride = {
                        background: 'var(--bg-panel)',
                        border: '1.5px solid var(--glass-border)',
                        color: 'var(--text-main)'
                    };
                    let animationProps = {
                        initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -15 },
                        animate: { opacity: 1, x: 0 },
                        transition: { delay: i * 0.06 }
                    };

                    if (isAnswered) {
                        if (isCorrect) {
                            styleOverride = {
                                background: '#10b9811f',
                                borderColor: '#10b981',
                                color: '#10b981',
                                fontWeight: 700
                            };
                            if (isSelected && !prefersReducedMotion) {
                                animationProps.animate = { opacity: 1, x: 0, scale: [1, 1.03, 1] };
                            }
                        } else if (isSelected) {
                            styleOverride = {
                                background: '#ef44441f',
                                borderColor: '#ef4444',
                                color: '#ef4444',
                                fontWeight: 700
                            };
                            if (!prefersReducedMotion) {
                                animationProps.animate = { opacity: 1, x: [-6, 6, -4, 4, 0] };
                                animationProps.transition = { duration: 0.3 };
                            }
                        } else if (question.correctIndex === i) {
                            styleOverride = { borderColor: '#10b981', opacity: 0.75, color: '#10b981' };
                        }
                    }

                    return (
                        <motion.div
                            key={i}
                            {...animationProps}
                            className="variant-item"
                            onClick={() => !isAnswered && onAnswer(i)}
                            style={{
                                pointerEvents: isAnswered ? 'none' : 'auto',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                cursor: isAnswered ? 'default' : 'pointer',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                ...styleOverride
                            }}
                            whileHover={!isAnswered && !prefersReducedMotion ? { scale: 1.015, borderColor: '#38bdf8' } : {}}
                            whileTap={!isAnswered && !prefersReducedMotion ? { scale: 0.985 } : {}}
                        >
                            <span style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                                flexShrink: 0
                            }}>
                                {String.fromCharCode(65 + i)}
                            </span>
                            <div style={{ flex: 1 }}>
                                {v.img && <img src={v.img} alt="Variant" style={{ display: 'block', maxWidth: 200, marginBottom: 8, borderRadius: 8 }} />}
                                <span dangerouslySetInnerHTML={{ __html: v.text || '' }} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
});

// --- 2. REVIEW: РАБОТА НАД ОШИБКАМИ + КОНФЕТТИ + ФИЛЬТРЫ + SHARE ---
const ReviewView = ({ questions = [], answers = [], lastAttemptPercent = null, onBack }) => {
    const reviewRef = useRef(null);
    if (window.useMathJax) {
        window.useMathJax(reviewRef, [questions]);
    }

    const [filterOnlyErrors, setFilterOnlyErrors] = useState(false);
    const [expandedExplanations, setExpandedExplanations] = useState({});
    const [copied, setCopied] = useState(false);

    // Расчет результатов
    const total = questions.length;
    const correctCount = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const errorCount = total - correctCount;

    // Конфетти при 100% результате
    useEffect(() => {
        if (percent === 100 && window.confetti) {
            window.confetti({
                particleCount: 120,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#10b981', '#38bdf8', '#fbbf24', '#a855f7']
            });
            const timeout = setTimeout(() => {
                window.confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
                window.confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
            }, 350);
            return () => clearTimeout(timeout);
        }
    }, [percent]);

    const toggleExplanation = (idx) => {
        setExpandedExplanations(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Генерация текста/карточки для "Поделиться"
    const handleShare = () => {
        const text = `🏆 Мой результат в тесте: ${percent}% (${correctCount}/${total})\n🔥 Ошибок: ${errorCount}\nПлатформа: Ultimate LMS`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            alert(text);
        }
    };

    const filteredQuestions = questions.map((q, i) => ({ q, i })).filter(({ q, i }) => {
        if (!filterOnlyErrors) return true;
        return answers[i] !== q.correctIndex;
    });

    return (
        <motion.div
            ref={reviewRef}
            key="review"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel review-container"
            style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '30px 24px', borderRadius: '24px' }}
        >
            {/* Шапка результата */}
            <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '1px solid var(--glass-border)', paddingBottom: 25 }}>
                <h2 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: 900 }}>Результаты тестирования</h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: 15 }}>
                    <div style={{
                        fontSize: '44px',
                        fontWeight: 900,
                        color: percent >= 80 ? '#10b981' : percent >= 50 ? '#fbbf24' : '#ef4444'
                    }}>
                        {percent}%
                    </div>

                    {/* Сравнение с прошлой попыткой */}
                    {lastAttemptPercent !== null && lastAttemptPercent !== undefined && (
                        <div style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 800,
                            background: percent >= lastAttemptPercent ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: percent >= lastAttemptPercent ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span>{percent >= lastAttemptPercent ? '▲' : '▼'}</span>
                            <span>{Math.abs(percent - lastAttemptPercent)}% к прошлому</span>
                        </div>
                    )}
                </div>
                
                <div style={{ color: 'var(--text-sec)', fontSize: '14px', marginTop: 6, fontWeight: 600 }}>
                    Правильно: {correctCount} из {total} вопросов
                </div>

                {/* Кнопки управления и фильтров */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: 20, flexWrap: 'wrap' }}>
                    <Button
                        variant={filterOnlyErrors ? "red" : "muted"}
                        onClick={() => setFilterOnlyErrors(!filterOnlyErrors)}
                        style={{ height: 38, fontSize: 13, borderRadius: 10, padding: '0 16px' }}
                    >
                        {filterOnlyErrors ? "Показать все вопросы" : `Показать только ошибки (${errorCount})`}
                    </Button>
                    <Button
                        variant="muted"
                        onClick={handleShare}
                        style={{ height: 38, fontSize: 13, borderRadius: 10, padding: '0 16px', background: copied ? '#10b981' : 'var(--bg-panel)', color: copied ? '#fff' : 'var(--text-main)' }}
                    >
                        {copied ? "✓ Скопировано!" : "📤 Поделиться"}
                    </Button>
                </div>
            </div>

            {/* Список вопросов */}
            <div className="review-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {filteredQuestions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#10b981', fontWeight: 800, fontSize: 18 }}>
                        🎉 Отличная работа! В этом тесте нет ни одной ошибки.
                    </div>
                )}

                {filteredQuestions.map(({ q, i }) => {
                    const userAns = answers[i];
                    const isCorrect = userAns === q.correctIndex;
                    const isExpanded = !!expandedExplanations[i];

                    return (
                        <div
                            key={i}
                            style={{
                                background: 'var(--bg-panel)',
                                padding: 22,
                                borderRadius: 20,
                                border: `1.5px solid ${isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <strong style={{ fontSize: 15 }}>Вопрос {i + 1}</strong>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 900,
                                    padding: '4px 10px',
                                    borderRadius: 8,
                                    background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: isCorrect ? '#10b981' : '#ef4444',
                                    textTransform: 'uppercase'
                                }}>
                                    {isCorrect ? '✓ Верно' : '✕ Ошибка'}
                                </span>
                            </div>

                            <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: q.question }} />

                            {q.questionImg && (
                                <img
                                    src={q.questionImg}
                                    className="question-image"
                                    alt="Review Question"
                                    style={{ maxWidth: '100%', maxHeight: 200, display: 'block', margin: '0 auto 15px auto', borderRadius: 12 }}
                                />
                            )}

                            {/* Варианты */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {q.variants.map((v, vi) => {
                                    let style = {
                                        padding: '10px 14px',
                                        borderRadius: 12,
                                        border: '1px solid transparent',
                                        background: 'var(--bg-body)',
                                        opacity: 0.65,
                                        fontSize: 14,
                                        color: 'var(--text-main)'
                                    };

                                    if (vi === q.correctIndex) {
                                        style.background = '#10b9811f';
                                        style.borderColor = '#10b981';
                                        style.color = '#10b981';
                                        style.fontWeight = 700;
                                        style.opacity = 1;
                                    }
                                    if (vi === userAns && !isCorrect) {
                                        style.background = '#ef44441f';
                                        style.borderColor = '#ef4444';
                                        style.color = '#ef4444';
                                        style.fontWeight = 700;
                                        style.opacity = 1;
                                    }

                                    return (
                                        <div key={vi} style={style}>
                                            <span dangerouslySetInnerHTML={{ __html: v.text || 'Вариант' }} />
                                            {vi === q.correctIndex && <span style={{ float: 'right', fontWeight: 800 }}>✓ Правильный ответ</span>}
                                            {vi === userAns && !isCorrect && <span style={{ float: 'right', fontWeight: 800 }}>✕ Ваш выбор</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Раскрывающееся объяснение (Explanation) */}
                            {q.explanation && (
                                <div style={{ marginTop: 15 }}>
                                    <button
                                        onClick={() => toggleExplanation(i)}
                                        style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                    >
                                        {isExpanded ? '▲ Скрыть объяснение' : '💡 Почему так? Показать разбор'}
                                    </button>
                                    {isExpanded && (
                                        <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-main)' }}>
                                            {q.explanation}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="review-footer" style={{ textAlign: 'center', marginTop: 30 }}>
                <Button variant="green" onClick={onBack} style={{ height: 48, borderRadius: 14, fontWeight: 800, minWidth: 200 }}>
                    В главное меню
                </Button>
            </div>
        </motion.div>
    );
};

// --- 3. РЕЙТИНГ, СТАТИСТИКА, МОДАЛКА УЧЕНИКА И ЭКСПОРТ CSV ---
const StatsView = ({ history = [], setHistory, onBack }) => {
    const chartRef = useRef(null);
    const [selectedTopic, setSelectedTopic] = useState('ALL');
    const [searchStudent, setSearchStudent] = useState('');
    const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);

    // Сбор уникальных тем
    const topics = useMemo(() => {
        const set = new Set(history.map(h => h.topic).filter(Boolean));
        return ['ALL', ...Array.from(set)];
    }, [history]);

    // Фильтрация истории
    const filtered = useMemo(() => {
        return history.filter(h => {
            const matchTopic = selectedTopic === 'ALL' || h.topic === selectedTopic;
            const matchName = !searchStudent || (h.student && h.student.toLowerCase().includes(searchStudent.toLowerCase()));
            return matchTopic && matchName;
        });
    }, [history, selectedTopic, searchStudent]);

    const sorted = useMemo(() => [...filtered].sort((a, b) => b.percent - a.percent), [filtered]);

    // Средний процент и лучшая статистика
    const avgPercent = useMemo(() => {
        if (filtered.length === 0) return 0;
        const sum = filtered.reduce((acc, h) => acc + (Number(h.percent) || 0), 0);
        return Math.round(sum / filtered.length);
    }, [filtered]);

    const bestScore = useMemo(() => {
        if (filtered.length === 0) return 0;
        return Math.max(...filtered.map(h => Number(h.percent) || 0));
    }, [filtered]);

    // График Chart.js
    useEffect(() => {
        if (!chartRef.current || sorted.length === 0 || !window.Chart) return;
        const ctx = chartRef.current.getContext('2d');
        const c = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.slice(0, 10).map(i => i.student),
                datasets: [{
                    label: '%',
                    data: sorted.slice(0, 10).map(i => i.percent),
                    backgroundColor: '#38bdf8',
                    borderRadius: 8
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                },
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return () => c.destroy();
    }, [sorted]);

    // Экспорт в CSV
    const exportToCSV = () => {
        if (sorted.length === 0) return;
        const headers = ["Студент", "Тема", "Результат (%)", "Дата"];
        const rows = sorted.map(h => [
            `"${h.student || ''}"`,
            `"${h.topic || ''}"`,
            `"${h.percent || 0}"`,
            `"${h.date || ''}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Статистика_LMS_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Открытие персональной модалки ученика
    const openStudentModal = (studentName) => {
        const studentAttempts = history.filter(h => h.student === studentName);
        setSelectedStudentHistory({ name: studentName, attempts: studentAttempts });
    };

    return (
        <motion.div
            key="stats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: 960, maxHeight: '90vh', overflowY: 'auto', padding: '30px 24px', borderRadius: '24px' }}
        >
            {/* Верхнее меню */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <Button variant="muted" style={{ height: 40, padding: '0 20px', fontSize: 13, borderRadius: 12 }} onClick={onBack}>
                    ⬅ Назад
                </Button>
                <Button variant="muted" onClick={exportToCSV} style={{ height: 40, padding: '0 20px', fontSize: 13, borderRadius: 12, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    📊 Экспорт CSV
                </Button>
            </div>

            <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '26px', fontWeight: 900 }}>Рейтинг и статистика</h2>

            {/* Карточки метрик группы */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 15, marginBottom: 25 }}>
                <div style={{ background: 'var(--bg-panel)', padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase' }}>Средний результат</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: '#38bdf8' }}>{avgPercent}%</div>
                </div>
                <div style={{ background: 'var(--bg-panel)', padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase' }}>Лучший результат</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: '#10b981' }}>{bestScore}%</div>
                </div>
                <div style={{ background: 'var(--bg-panel)', padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase' }}>Всего попыток</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: '#a855f7' }}>{filtered.length}</div>
                </div>
            </div>

            {/* Фильтры: Выбор темы и Поиск */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={{ flex: '1 1 200px', height: 42, padding: '0 14px', borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: 13, outline: 'none' }}
                >
                    {topics.map(t => <option key={t} value={t}>{t === 'ALL' ? 'Все темы' : t}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Поиск по имени студента..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    style={{ flex: '2 1 250px', height: 42, padding: '0 16px', borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: 13, outline: 'none' }}
                />
            </div>

            {/* График */}
            <div style={{ background: 'var(--bg-panel)', padding: 20, borderRadius: 20, marginBottom: 25, height: 220, border: '1px solid var(--glass-border)' }}>
                <canvas ref={chartRef}></canvas>
            </div>

            {/* Таблица результатов */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-sec)', fontSize: 12, textTransform: 'uppercase' }}>
                        <th style={{ textAlign: 'left', padding: '12px 10px' }}>Студент</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>%</th>
                        <th style={{ padding: '12px 10px', width: 40 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(h => (
                        <tr
                            key={h.id}
                            onClick={() => openStudentModal(h.student)}
                            style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={{ padding: 14 }}>
                                <div style={{ fontWeight: 800, fontSize: 15 }}>{h.student}</div>
                                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{h.topic} • {h.date}</div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, color: h.percent >= 50 ? '#10b981' : '#ef4444' }}>
                                {h.percent}%
                            </td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        if (confirm('Удалить эту запись?')) {
                                            const nh = history.filter(i => i.id !== h.id);
                                            setHistory(nh);
                                            localStorage.setItem('test_history_v1', JSON.stringify(nh));
                                        }
                                    }}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--text-sec)', fontSize: 16, cursor: 'pointer', opacity: 0.6 }}
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Модальное окно персональной истории ученика */}
            <AnimatePresence>
                {selectedStudentHistory && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel"
                            style={{ width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto', padding: 25, borderRadius: 24 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 12 }}>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Карточка: {selectedStudentHistory.name}</h3>
                                <button onClick={() => setSelectedStudentHistory(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {selectedStudentHistory.attempts.map((att, idx) => (
                                    <div key={idx} style={{ background: 'var(--bg-panel)', padding: 14, borderRadius: 14, border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{att.topic}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>{att.date}</div>
                                        </div>
                                        <div style={{ fontWeight: 900, fontSize: 16, color: att.percent >= 50 ? '#10b981' : '#ef4444' }}>
                                            {att.percent}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
