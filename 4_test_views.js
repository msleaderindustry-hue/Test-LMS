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
   СТАТИСТИКА: ПРЕМИУМ ДИЗАЙН ПО СКРИНШОТАМ
   ========================================================================= */

// Дизайн карточек: строго по фото (Иконка и текст вверху, Цифра внизу)
const StatCard = ({ title, value, icon, color, postfix, fullWidth }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.015 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
            background: 'linear-gradient(145deg, #1f232b 0%, #15181e 100%)',
            border: `1px solid rgba(255,255,255,0.03)`,
            borderRadius: '20px', 
            padding: '24px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            gridColumn: fullWidth ? '1 / -1' : 'auto',
            minHeight: '160px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            position: 'relative', overflow: 'hidden'
        }}
    >
        {/* Еле заметное свечение под цвет модуля в углу */}
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 150, height: 150, background: color, filter: 'blur(70px)', opacity: 0.1, pointerEvents: 'none' }} />
        
        {/* Шапка карточки: Иконка + Заголовок */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                {icon}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {title}
            </div>
        </div>

        {/* Значение: Большие цифры внизу */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '24px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '52px', fontWeight: 900, color: color, lineHeight: 1, letterSpacing: '-1px' }}>
                {value}
            </span>
            {postfix && <span style={{ fontSize: '18px', fontWeight: 800, color: '#64748b' }}>{postfix}</span>}
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

    // Красивый график
    useEffect(() => {
        if (activeTab === 'tests' && chartRef.current && sortedHistory.length > 0) {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new window.Chart(ctx, {
                type: 'bar',
                data: { 
                    labels: sortedHistory.slice(0,10).map(i => i.student), 
                    datasets: [{ 
                        label: '%', 
                        data: sortedHistory.slice(0,10).map(i => i.percent), 
                        backgroundColor: '#6366f1', 
                        borderRadius: 4,
                        barPercentage: 0.6
                    }] 
                },
                options: { 
                    scales: { 
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#64748b', font: { weight: '600' } } }, 
                        x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b', font: { weight: '600' } } } 
                    }, 
                    plugins: { legend: { display: false } }, 
                    responsive: true, maintainAspectRatio: false 
                }
            });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); }
    }, [activeTab, sortedHistory]);

    const TABS = [
        { id: 'tests', label: 'ТЕСТЫ', icon: '📝', color: '#a855f7' },
        { id: 'excel', label: 'EXCEL', icon: '📊', color: '#10b981' },
        { id: 'typing', label: 'ПЕЧАТЬ', icon: '⌨️', color: '#3b82f6' },
        { id: 'hotkeys', label: 'ХОТКЕИ', icon: '⚡', color: '#f59e0b' }
    ];

    return (
       <motion.div key="stats" initial={{opacity:0, scale: 0.98}} animate={{opacity:1, scale: 1}} className="glass-panel" style={{width:'100%', maxWidth:900, maxHeight:'88vh', overflowY:'auto', display:'flex', flexDirection:'column', padding: '40px', borderRadius: '32px'}}>
           
           {/* Заголовок */}
           <div style={{textAlign: 'center', marginBottom: 30}}>
               <h2 style={{margin:0, fontSize: '32px', fontWeight: 900, background: 'linear-gradient(90deg, #ffffff, #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                   Мой Прогресс
               </h2>
           </div>

           {/* Секция вкладок в стиле Segmented Control */}
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
                           <span style={{ fontSize: '13px', fontWeight: 800, color: isActive ? '#fff' : '#64748b', transition: 'color 0.2s' }}>{t.label}</span>
                       </div>
                   );
               })}
           </div>

           <div style={{ flex: 1 }}>
               <AnimatePresence mode="wait">
                   
                   {/* ==================== ТЕСТЫ ==================== */}
                   {activeTab === 'tests' && (
                       <motion.div key="t-tests" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}}>
                           {sortedHistory.length === 0 ? <p style={{textAlign:'center', color:'#64748b', padding: '40px 0', fontSize: '16px', fontWeight: 600}}>Вы еще не проходили тесты</p> : (
                               <>
                                   {/* График */}
                                   <div style={{background:'linear-gradient(145deg, #1f232b 0%, #15181e 100%)', padding:'24px', borderRadius:'20px', marginBottom:'30px', height:'240px', border: '1px solid rgba(255,255,255,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'}}>
                                       <canvas ref={chartRef}></canvas>
                                   </div>
                                   
                                   {/* Список */}
                                   <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                       История прохождений
                                   </div>
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                       {sortedHistory.map((h, i) => {
                                           const isGood = h.percent >= 50;
                                           const color = isGood ? '#10b981' : '#ef4444';
                                           return (
                                               <motion.div key={h.id} initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: i * 0.05}}
                                                   style={{ background: 'rgba(30, 33, 40, 0.6)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                       <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                                           {isGood ? '🏆' : '💔'}
                                                       </div>
                                                       <div>
                                                           <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>{h.topic}</div>
                                                           <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{h.student} • {h.date}</div>
                                                       </div>
                                                   </div>
                                                   <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                       <span style={{ fontWeight: 900, fontSize: '20px', color: color }}>{h.percent}%</span>
                                                       <button onClick={()=>{if(confirm('Удалить запись?')){const nh=history.filter(item=>item.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', padding: '5px' }} title="Удалить">✕</button>
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
                       <motion.div key="t-excel" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'20px'}}>
                           <StatCard title="Текущий уровень" value={excelStats.level} icon="📈" color="#10b981" />
                           <StatCard title="Заработано XP" value={excelStats.xp} icon="⚡" color="#3b82f6" />
                           <StatCard title="Решено формул" value={excelStats.completedLessons} icon="🧠" color="#f59e0b" />
                           <StatCard title="Серия без ошибок" value={excelStats.streak} icon="🔥" color="#ef4444" />
                       </motion.div>
                   )}

                   {/* ==================== ПЕЧАТЬ ==================== */}
                   {activeTab === 'typing' && (
                       <motion.div key="t-typing" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px'}}>
                           <StatCard title="Рекорд скорости" value={typingStats.maxWpm} postfix="WPM" icon="🚀" color="#a855f7" />
                           <StatCard title="Лучшее комбо" value={typingStats.maxCombo} prefix="x" icon="✨" color="#0ea5e9" />
                           <StatCard title="Пройдено текстов" value={typingStats.testsCompleted} icon="📚" color="#2dd4bf" fullWidth={true} />
                       </motion.div>
                   )}

                   {/* ==================== ХОТКЕИ ==================== */}
                   {activeTab === 'hotkeys' && (
                       <motion.div key="t-hotkeys" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px'}}>
                           <StatCard title="Рекорд за сессию" value={hotkeyStats.maxScore} icon="⚡" color="#f59e0b" />
                           <StatCard title="Сыграно сессий" value={hotkeyStats.sessionsPlayed} icon="🎮" color="#22c55e" />
                       </motion.div>
                   )}

               </AnimatePresence>
           </div>
       </motion.div>
    )
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
