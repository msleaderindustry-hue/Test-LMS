const { useState, useEffect, useRef, memo } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window; 

// --- КОМПОНЕНТЫ ТЕСТА (БЕЗ ИЗМЕНЕНИЙ) ---
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
   СТАТИСТИКА: ПРЕМИУМ ДИЗАЙН (СТЕКЛО И ГРАДИЕНТЫ)
   ========================================================================= */

// Плавные вкладки в стиле Apple
const PremiumTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'tests', label: 'Тесты', icon: '📝', color: '#a855f7' },
        { id: 'excel', label: 'Excel', icon: '📊', color: '#10b981' },
        { id: 'typing', label: 'Печать', icon: '⌨️', color: '#3b82f6' },
        { id: 'hotkeys', label: 'Хоткеи', icon: '⚡', color: '#f59e0b' }
    ];

    return (
        <div style={{ 
            display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '8px', 
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', 
            gap: 8, overflowX: 'auto', marginBottom: 40, boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.15)',
            position: 'relative'
        }}>
            {tabs.map(t => {
                const isActive = activeTab === t.id;
                return (
                    <motion.button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{
                            position: 'relative', flex: 1, minWidth: 140, height: 50, 
                            borderRadius: '16px', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            fontWeight: 800, fontSize: 13.5, textTransform: 'uppercase', letterSpacing: 0.5,
                            background: 'transparent', color: isActive ? '#fff' : 'var(--text-sec)', 
                            transition: 'color 0.3s'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                style={{ 
                                    position: 'absolute', inset: 0, borderRadius: '16px', 
                                    background: `linear-gradient(135deg, ${t.color} 0%, ${t.color}dd 100%)`, 
                                    boxShadow: `0 4px 20px ${t.color}50` 
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span style={{ position: 'relative', zIndex: 1, fontSize: 18 }}>{t.icon}</span>
                        <span style={{ position: 'relative', zIndex: 1 }}>{t.label}</span>
                    </motion.button>
                )
            })}
        </div>
    );
};

// Стеклянная карточка с мягким свечением
const GlassCard = ({ title, value, icon, color, postfix }) => (
    <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
            position: 'relative',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '28px',
            padding: '28px 30px',
            border: '1px solid rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 15px 35px -10px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', minHeight: 160
        }}
    >
        {/* Мягкий цветной блик в углу */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: color, filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 44, height: 44, borderRadius: '14px', background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 4px 15px ${color}20` }}>
                {icon}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sec)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {title}
            </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 8, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 52, fontWeight: 900, background: `linear-gradient(135deg, #ffffff 0%, ${color} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 4px 15px ${color}30)` }}>
                {value}
            </div>
            {postfix && <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-sec)', opacity: 0.7 }}>{postfix}</span>}
        </div>
    </motion.div>
);

const StatsView = ({ history, setHistory, userData }) => {
    const [activeTab, setActiveTab] = useState('tests');
    const sortedHistory = [...history].sort((a,b) => b.percent - a.percent);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Статистика модулей
    const excelStats = userData?.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
    const typingStats = JSON.parse(localStorage.getItem('typing_stats') || '{"maxWpm":0, "maxCombo":0, "testsCompleted":0}');
    const hotkeyStats = JSON.parse(localStorage.getItem('hotkey_stats') || '{"maxScore":0, "sessionsPlayed":0}');

    // Красивый график тестов
    useEffect(() => {
        if (activeTab === 'tests' && chartRef.current && sortedHistory.length > 0) {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = chartRef.current.getContext('2d');
            
            // Градиент для графика
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');

            chartInstance.current = new window.Chart(ctx, {
                type: 'bar',
                data: { 
                    labels: sortedHistory.slice(0,10).map(i => i.student), 
                    datasets: [{ 
                        label: '%', 
                        data: sortedHistory.slice(0,10).map(i => i.percent), 
                        backgroundColor: gradient, 
                        borderRadius: 8,
                        borderSkipped: false,
                        barPercentage: 0.5
                    }] 
                },
                options: { 
                    scales: { 
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { weight: '600' } } }, 
                        x: { grid: { display: false, drawBorder: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { weight: '600' } } } 
                    }, 
                    plugins: { legend: { display: false } }, 
                    responsive: true, maintainAspectRatio: false 
                }
            });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); }
    }, [activeTab, sortedHistory]);

    return (
       <motion.div key="stats" initial={{opacity:0, y: 15}} animate={{opacity:1, y: 0}} className="glass-panel" style={{width:'100%', maxWidth:1000, maxHeight:'88vh', overflowY:'auto', display:'flex', flexDirection:'column', padding: '40px', borderRadius: 32}}>
           
           <div style={{textAlign: 'center', marginBottom: 35}}>
               <h2 style={{margin:0, fontSize: 36, fontWeight: 900, background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                   Мой Прогресс
               </h2>
           </div>

           <PremiumTabs activeTab={activeTab} setActiveTab={setActiveTab} />

           <div style={{ flex: 1 }}>
               <AnimatePresence mode="wait">
                   
                   {/* ==================== ТЕСТЫ ==================== */}
                   {activeTab === 'tests' && (
                       <motion.div key="t-tests" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}}>
                           {sortedHistory.length === 0 ? <p style={{textAlign:'center', color:'var(--text-sec)', padding: '40px 0', fontSize: 16, fontWeight: 600}}>У вас пока нет пройденных тестов</p> : (
                               <>
                                   <div style={{background:'rgba(255,255,255,0.02)', padding:25, borderRadius:28, marginBottom:35, height:280, border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'}}>
                                       <canvas ref={chartRef}></canvas>
                                   </div>
                                   
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                       <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 10, marginBottom: 5 }}>История прохождений</div>
                                       {sortedHistory.map((h, i) => {
                                           const isGood = h.percent >= 50;
                                           const color = isGood ? '#10b981' : '#ef4444';
                                           return (
                                               <motion.div key={h.id} initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: i * 0.05}}
                                                   style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                   <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                                                       <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${color}20, ${color}05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `1px solid ${color}30` }}>
                                                           {isGood ? '🏆' : '💔'}
                                                       </div>
                                                       <div>
                                                           <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{h.topic}</div>
                                                           <div style={{ fontSize: 13, color: 'var(--text-sec)', opacity: 0.8, fontWeight: 600 }}>{h.student} • {h.date}</div>
                                                       </div>
                                                   </div>
                                                   <div style={{ display: 'flex', alignItems: 'center', gap: 25 }}>
                                                       <div style={{ fontSize: 26, fontWeight: 900, color: color, textShadow: `0 2px 10px ${color}40` }}>{h.percent}%</div>
                                                       <button onClick={()=>{if(confirm('Удалить запись?')){const nh=history.filter(item=>item.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}} style={{ background: 'transparent', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', fontSize: 24, transition: '0.2s', padding: 5 }} title="Удалить">✕</button>
                                                   </div>
                                               </motion.div>
                                           )
                                       })}
                                   </div>
                               </>
                           )}
                       </motion.div>
                   )}

                   {/* ==================== EXCEL ==================== */}
                   {activeTab === 'excel' && (
                       <motion.div key="t-excel" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
                           <GlassCard title="Текущий уровень" value={excelStats.level} icon="📈" color="#10b981" />
                           <GlassCard title="Заработано XP" value={excelStats.xp} icon="⚡" color="#3b82f6" />
                           <GlassCard title="Решено формул" value={excelStats.completedLessons} icon="🧠" color="#f59e0b" />
                           <GlassCard title="Серия без ошибок" value={excelStats.streak} icon="🔥" color="#ef4444" />
                       </motion.div>
                   )}

                   {/* ==================== ПЕЧАТЬ ==================== */}
                   {activeTab === 'typing' && (
                       <motion.div key="t-typing" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
                           <GlassCard title="Рекорд скорости" value={typingStats.maxWpm} postfix="WPM" icon="🚀" color="#a855f7" />
                           <GlassCard title="Лучшее комбо" value={typingStats.maxCombo} prefix="x" icon="✨" color="#0ea5e9" />
                           <GlassCard title="Пройдено текстов" value={typingStats.testsCompleted} icon="📚" color="#2dd4bf" />
                       </motion.div>
                   )}

                   {/* ==================== ХОТКЕИ ==================== */}
                   {activeTab === 'hotkeys' && (
                       <motion.div key="t-hotkeys" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
                           <GlassCard title="Рекорд за сессию" value={hotkeyStats.maxScore} icon="⚡" color="#f59e0b" />
                           <GlassCard title="Сыграно сессий" value={hotkeyStats.sessionsPlayed} icon="🎮" color="#22c55e" />
                       </motion.div>
                   )}

               </AnimatePresence>
           </div>
       </motion.div>
    )
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
