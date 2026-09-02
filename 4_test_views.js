const { useState, useEffect, useRef, memo } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// --- КОМПОНЕНТЫ ТЕСТА (НЕ ТРОГАЕМ, ЧТОБЫ НЕ СЛОМАТЬ ЛОГИКУ) ---
const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
     const cardRef = useRef(null); 
     if (window.useMathJax) window.useMathJax(cardRef, [question]); 
     if (!question) return null;

     return (
       <motion.div ref={cardRef} key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="glass-panel" style={{width: '100%', display:'block'}}>
         <h3 style={{textAlign:'center', marginBottom:15, opacity:0.6, fontSize:14, textTransform:'uppercase'}}>Вопрос {index+1}</h3>
         <div style={{fontSize:18, marginBottom:20, fontWeight:600}} dangerouslySetInnerHTML={{__html: question.question}} />
         {question.questionImg && <img src={question.questionImg} className="question-image" />}
         <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {question.variants.map((v, i) => {
               const isAnswered = answers[index] !== null; const isSelected = answers[index] === i; const isCorrect = question.correctIndex === i;
               let styleOverride = {}; let animationProps = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 } };
               if(isAnswered) {
                 if(isCorrect) { styleOverride = {background: '#d1fae5', borderColor: '#10b981', color: '#064e3b'}; if(isSelected) animationProps.animate = { opacity: 1, x: 0, scale: [1, 1.05, 1] }; } 
                 else if(isSelected) { styleOverride = {background: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d'}; animationProps.animate = { opacity: 1, x: [-5, 5, -5, 5, 0] }; animationProps.transition = { duration: 0.3 }; } 
                 else if(question.correctIndex === i) { styleOverride = {borderColor: '#10b981', opacity: 0.7}; } 
               }
               return (
                 <motion.div key={i} {...animationProps} className="variant-item" onClick={() => !isAnswered && onAnswer(i)} style={{ pointerEvents: isAnswered ? 'none' : 'auto', ...styleOverride }} whileHover={!isAnswered ? { scale: 1.01 } : {}}>
                    {v.img && <img src={v.img} style={{display:'block', maxWidth:200, marginBottom:8, borderRadius:8}} />}
                    {v.text}
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
             <div className="review-header"><h2 style={{textAlign:'center', margin:0}}>Работа над ошибками</h2></div>
             <div className="review-content">
                 {questions.map((q, i) => {
                     const userAns = answers[i]; const isCorrect = userAns === q.correctIndex;
                     return (
                         <div key={i} style={{ background: 'var(--variant-default)', padding:25, borderRadius:20, marginBottom:20, border: isCorrect ? '2px solid #10b981' : '2px solid #ef4444' }}>
                             <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}><strong>Вопрос {i+1}</strong><span style={{color: isCorrect ? '#059669' : '#b91c1c', fontWeight:'bold'}}>{isCorrect ? 'ВЕРНО' : 'ОШИБКА'}</span></div>
                             <div style={{marginBottom:20, fontSize:16}} dangerouslySetInnerHTML={{__html: q.question}}></div>
                             {q.questionImg && <img src={q.questionImg} className="question-image" style={{maxWidth:'100%', maxHeight:200, display:'block', margin:'0 auto 15px auto', borderRadius:10}} />}
                             {q.variants.map((v, vi) => {
                                 let style = {padding:'10px 15px', borderRadius:10, margin:'5px 0', border:'2px solid transparent', background:'var(--glass-bg)', opacity:0.8, color:'var(--text-main)'};
                                 if(vi === q.correctIndex) { style.background = '#d1fae5'; style.borderColor = '#10b981'; style.color = '#064e3b'; style.opacity=1; }
                                 if(vi === userAns && !isCorrect) { style.background = '#fee2e2'; style.borderColor = '#ef4444'; style.color = '#7f1d1d'; style.opacity=1; }
                                 return <div key={vi} style={style} dangerouslySetInnerHTML={{__html: v.text || 'Image'}}></div>
                             })}
                         </div>
                     )
                 })}
             </div>
             <div className="review-footer"><Button onClick={onBack} style={{boxShadow:'0 5px 15px rgba(0,0,0,0.1)', width:'auto', padding:'0 40px'}}>В меню</Button></div>
          </motion.div>
      );
};

/* =========================================================================
   СТАТИСТИКА — НОВЫЙ ДИЗАЙН
   Единый визуальный язык: кольцевой индикатор (radial gauge) как главный
   акцент каждой вкладки + горизонтальная "рейка" второстепенных метрик,
   разделённых тонкими линиями (никаких одинаковых квадратных карточек).
   Для истории тестов — вертикальная таймлайн-лента с ранговыми метками,
   а не список плашек.
   ========================================================================= */

// Кольцевой индикатор — главный визуальный элемент каждой вкладки статистики
const RadialGauge = ({ value, max, size = 176, strokeWidth = 12, color, icon, valueDisplay, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
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
                <span style={{ fontSize: 15, marginBottom: 2 }}>{icon}</span>
                <span style={{ fontSize: size * 0.19, fontWeight: 900, color: '#f4f4f5', lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{valueDisplay}</span>
                <span style={{ fontSize: 11.5, color: '#71717a', fontWeight: 600 }}>{label}</span>
            </div>
        </div>
    );
};

// Горизонтальная рейка второстепенных метрик, разделённых тонкими линиями
const StatRail = ({ items }) => (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden', marginTop: 26 }}>
        {items.map((it, i) => (
            <div key={i} style={{ flex: 1, padding: '18px 10px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: it.color || '#f4f4f5', fontVariantNumeric: 'tabular-nums' }}>{it.value}</div>
                <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 4, fontWeight: 600 }}>{it.label}</div>
            </div>
        ))}
    </div>
);

// Ряд точек-сессий — для метрик без длинной истории (хоткеи)
const PipTrail = ({ total, color, cap = 24 }) => {
    const shown = Math.min(total, cap);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
            {Array.from({ length: shown }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.85 }} />
            ))}
            {total > cap && <span style={{ fontSize: 12, color: '#71717a', fontWeight: 700, marginLeft: 4 }}>+{total - cap}</span>}
        </div>
    );
};

const rankColor = (i) => (i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#c2854b' : '#3f3f46');

const StatsView = ({ history, setHistory, userData }) => {
    const [activeTab, setActiveTab] = useState('tests');
    const sortedHistory = [...history].sort((a, b) => b.percent - a.percent);

    const excelStats = userData?.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
    const typingStats = JSON.parse(localStorage.getItem('typing_stats') || '{"maxWpm":0, "maxCombo":0, "testsCompleted":0}');
    const hotkeyStats = JSON.parse(localStorage.getItem('hotkey_stats') || '{"maxScore":0, "sessionsPlayed":0}');

    // Производные показатели по тестам — считаются из истории, а не берутся напрямую
    const totalTests = history.length;
    const avgPercent = totalTests ? Math.round(history.reduce((s, h) => s + h.percent, 0) / totalTests) : 0;
    const bestPercent = totalTests ? Math.max(...history.map(h => h.percent)) : 0;
    const passRate = totalTests ? Math.round((history.filter(h => h.percent >= 50).length / totalTests) * 100) : 0;

    const removeEntry = (id) => {
        if (!confirm('Удалить запись?')) return;
        const nh = history.filter(item => item.id !== id);
        setHistory(nh);
        localStorage.setItem('test_history_v1', JSON.stringify(nh));
    };

    const TABS = [
        { id: 'tests', label: 'Тесты', icon: '📝', color: '#a855f7' },
        { id: 'excel', label: 'Excel', icon: '📊', color: '#22c55e' },
        { id: 'typing', label: 'Печать', icon: '⌨️', color: '#38bdf8' },
        { id: 'hotkeys', label: 'Хоткеи', icon: '⚡', color: '#f59e0b' }
    ];

    return (
        <motion.div key="stats" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: 900, maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '40px', borderRadius: '32px' }}>

            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, #ffffff, #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                    Мой прогресс
                </h2>
            </div>

            <div style={{ display: 'flex', background: 'rgba(20, 22, 28, 0.6)', padding: '6px', borderRadius: '20px', gap: '4px', margin: '0 auto 35px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.03)', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)' }}>
                {TABS.map(t => {
                    const isActive = activeTab === t.id;
                    return (
                        <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ position: 'relative', padding: '12px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                            {isActive && (
                                <motion.div layoutId="tab-bg" transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    style={{ position: 'absolute', inset: 0, background: t.color, borderRadius: '14px', zIndex: -1, boxShadow: `0 4px 15px ${t.color}50` }}
                                />
                            )}
                            <span style={{ fontSize: '16px', filter: isActive ? 'none' : 'grayscale(1)', opacity: isActive ? 1 : 0.6 }}>{t.icon}</span>
                            <span style={{ fontSize: '13.5px', fontWeight: 700, color: isActive ? '#fff' : '#64748b', transition: 'color 0.2s' }}>{t.label}</span>
                        </div>
                    );
                })}
            </div>

            <div style={{ flex: 1 }}>
                <AnimatePresence mode="wait">

                    {/* ==================== ТЕСТЫ ==================== */}
                    {activeTab === 'tests' && (
                        <motion.div key="t-tests" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            {totalTests === 0 ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0', fontSize: '16px', fontWeight: 600 }}>Вы еще не проходили тесты</p>
                            ) : (
                                <>
                                    <StatRail items={[
                                        { label: 'Средний балл', value: `${avgPercent}%`, color: '#a855f7' },
                                        { label: 'Лучший результат', value: `${bestPercent}%`, color: '#fbbf24' },
                                        { label: 'Успешных попыток', value: `${passRate}%`, color: '#34d399' },
                                        { label: 'Всего тестов', value: totalTests, color: '#f4f4f5' },
                                    ]} />

                                    <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 700, marginTop: '32px', marginBottom: '14px' }}>
                                        История прохождений
                                    </div>

                                    <div>
                                        {sortedHistory.map((h, i) => (
                                            <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, paddingTop: 6 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: rankColor(i), boxShadow: i < 3 ? `0 0 10px ${rankColor(i)}` : 'none', flexShrink: 0 }} />
                                                    {i < sortedHistory.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 34, background: 'rgba(255,255,255,0.08)', marginTop: 4 }} />}
                                                </div>
                                                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} style={{ flex: 1, minWidth: 0, paddingBottom: 22 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                                                        <span style={{ fontWeight: 800, fontSize: 14.5, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.topic}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                            <span style={{ fontWeight: 900, fontSize: 15, color: h.percent >= 50 ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>{h.percent}%</span>
                                                            <button onClick={() => removeEntry(h.id)} style={{ background: 'none', border: 'none', color: '#52525b', fontSize: 15, cursor: 'pointer', padding: 2 }} title="Удалить">✕</button>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600, marginTop: 2 }}>{h.student} · {h.date}</div>
                                                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 9, overflow: 'hidden' }}>
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${h.percent}%` }} transition={{ duration: 0.7, delay: i * 0.03 }}
                                                            style={{ height: '100%', borderRadius: 2, background: h.percent >= 50 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#f87171,#ef4444)' }} />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== EXCEL ==================== */}
                    {activeTab === 'excel' && (
                        <motion.div key="t-excel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            {/* Заполнение кольца — прогресс XP до следующего уровня. Формула xp-за-уровень (1000)
                                условная — подставьте свою, если у вас другая кривая левелинга. */}
                            <RadialGauge
                                value={excelStats.xp % 1000}
                                max={1000}
                                color="#22c55e"
                                icon="📊"
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
                            {/* Максимум шкалы (120 WPM) — ориентир для быстрой печати, скорректируйте под свою аудиторию. */}
                            <RadialGauge
                                value={typingStats.maxWpm}
                                max={120}
                                color="#38bdf8"
                                icon="🚀"
                                valueDisplay={typingStats.maxWpm}
                                label="WPM рекорд"
                            />
                            <StatRail items={[
                                { label: 'Лучшее комбо', value: `x${typingStats.maxCombo}`, color: '#a855f7' },
                                { label: 'Пройдено текстов', value: typingStats.testsCompleted, color: '#2dd4bf' },
                            ]} />
                        </motion.div>
                    )}

                    {/* ==================== ХОТКЕИ ==================== */}
                    {activeTab === 'hotkeys' && (
                        <motion.div key="t-hotkeys" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                            {/* Потолок шкалы считается от личного рекорда, чтобы кольцо всегда было информативным. */}
                            <RadialGauge
                                value={hotkeyStats.maxScore}
                                max={Math.max(hotkeyStats.maxScore * 1.25, 100)}
                                color="#f59e0b"
                                icon="⚡"
                                valueDisplay={hotkeyStats.maxScore}
                                label="рекорд за сессию"
                            />
                            <div style={{ textAlign: 'center', fontSize: 12, color: '#71717a', fontWeight: 700, marginTop: 28 }}>
                                Сыграно сессий: {hotkeyStats.sessionsPlayed}
                            </div>
                            <PipTrail total={hotkeyStats.sessionsPlayed} color="#22c55e" />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </motion.div>
    )
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
