const { useState, useEffect, useRef, memo } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window; 

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
               let styleOverride = {};
               let animationProps = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 } };

               if(isAnswered) {
                 if(isCorrect) { 
                     styleOverride = {background: '#d1fae5', borderColor: '#10b981', color: '#064e3b'}; 
                     if(isSelected) animationProps.animate = { opacity: 1, x: 0, scale: [1, 1.05, 1] };
                 } 
                 else if(isSelected) { 
                     styleOverride = {background: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d'}; 
                     animationProps.animate = { opacity: 1, x: [-5, 5, -5, 5, 0] };
                     animationProps.transition = { duration: 0.3 };
                 } 
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
   СТАТИСТИКА: Вкладки и Карточки
   ========================================================================= */
const TabBtn = ({ active, label, icon, gradient, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                flex: 1, minWidth: 120, height: 46, borderRadius: 14, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
                background: active ? gradient : 'var(--text-main)',
                color: active ? '#fff' : 'var(--bg-panel)',
                boxShadow: active ? `0 8px 16px -4px rgba(0,0,0,0.25)` : '0 4px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
            }}
        >
            <span style={{ fontSize: 16 }}>{icon}</span> {label}
        </motion.button>
    );
};

const StatCard = ({ title, value, icon, color, bgRgba, fullWidth }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{
            background: bgRgba,
            border: `1px solid ${bgRgba.replace('0.05', '0.15').replace('0.04', '0.1')}`,
            borderRadius: 20, padding: '24px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gridColumn: fullWidth ? '1 / -1' : 'auto',
            minHeight: 140
        }}
    >
        <div style={{ fontSize: 11, color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            {title}
        </div>
        <div style={{ fontSize: 46, fontWeight: 900, color: color, display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
            {icon && <span>{icon}</span>}
            {value}
        </div>
    </motion.div>
);

const StatsView = ({ history, setHistory, userData }) => {
    const [activeTab, setActiveTab] = useState('tests');
    const sortedHistory = [...history].sort((a,b) => b.percent - a.percent);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Подгрузка данных
    const excelStats = userData?.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
    const typingStats = JSON.parse(localStorage.getItem('typing_stats') || '{"maxWpm":0, "maxCombo":0, "testsCompleted":0}');
    const hotkeyStats = JSON.parse(localStorage.getItem('hotkey_stats') || '{"maxScore":0, "sessionsPlayed":0}');

    // Отрисовка графика (только для вкладки Тесты)
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
                        borderRadius: 6,
                        barPercentage: 0.6
                    }] 
                },
                options: { 
                    scales: { 
                        y: { 
                            beginAtZero: true, max: 100, 
                            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                            ticks: { color: '#64748b', font: { weight: '600' } } 
                        }, 
                        x: { 
                            grid: { display: false, drawBorder: false },
                            ticks: { color: '#64748b', font: { weight: '600' } } 
                        } 
                    }, 
                    plugins: { legend: { display: false } }, 
                    responsive: true, 
                    maintainAspectRatio: false 
                }
            });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); }
    }, [activeTab, sortedHistory]);

    return (
       <motion.div key="stats" initial={{opacity:0, scale: 0.98}} animate={{opacity:1, scale: 1}} className="glass-panel" style={{width:'100%', maxWidth:850, maxHeight:'85vh', overflowY:'auto', display:'flex', flexDirection:'column', padding: '36px 40px', borderRadius: 28}}>
           
           {/* Шапка (Без кнопки Назад) */}
           <div style={{textAlign: 'center', marginBottom: 28}}>
               <h2 style={{margin:0, fontSize: 26, fontWeight: 900, color: 'var(--text-main)'}}>📊 Мой Прогресс</h2>
           </div>

           {/* Вкладки переключения модулей */}
           <div className="modern-scroll" style={{display:'flex', gap: 12, marginBottom: 28, overflowX:'auto', paddingBottom: 8}}>
               <TabBtn active={activeTab === 'tests'} gradient="linear-gradient(135deg, #a855f7 0%, #c084fc 100%)" icon="📝" label="Тесты" onClick={() => setActiveTab('tests')} />
               <TabBtn active={activeTab === 'excel'} gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)" icon="📊" label="Excel" onClick={() => setActiveTab('excel')} />
               <TabBtn active={activeTab === 'typing'} gradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" icon="⌨️" label="Печать" onClick={() => setActiveTab('typing')} />
               <TabBtn active={activeTab === 'hotkeys'} gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" icon="⚡" label="Хоткеи" onClick={() => setActiveTab('hotkeys')} />
           </div>

           <AnimatePresence mode="wait">
               {/* Вкладка 1: Тесты */}
               {activeTab === 'tests' && (
                   <motion.div key="t-tests" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}}>
                       {sortedHistory.length === 0 ? <p style={{textAlign:'center', color:'var(--text-sec)', padding: '40px 0', fontWeight: 600}}>Вы еще не проходили тесты</p> : (
                           <>
                               <div style={{background:'rgba(255,255,255,0.02)', padding:20, borderRadius:20, marginBottom:25, height:240, border: '1px solid rgba(255,255,255,0.05)'}}>
                                   <canvas ref={chartRef}></canvas>
                               </div>
                               <table style={{width:'100%', borderCollapse:'collapse', marginTop: 10}}>
                                  <thead>
                                      <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)', color:'var(--text-sec)', fontSize: 12, textTransform: 'uppercase'}}>
                                          <th style={{textAlign:'left', padding:'12px 10px'}}>Тест / Дата</th>
                                          <th style={{padding:'12px 10px', textAlign:'right'}}>%</th>
                                          <th style={{padding:'12px 10px', width: 40}}></th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                    {sortedHistory.map(h => (
                                        <tr key={h.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'}}>
                                           <td style={{padding:'16px 10px'}}>
                                               <div style={{fontWeight:800, fontSize: 15, color:'var(--text-main)', marginBottom: 4}}>{h.topic}</div>
                                               <div style={{fontSize:12, color:'var(--text-sec)'}}>{h.student} • {h.date}</div>
                                           </td>
                                           <td style={{textAlign:'right', fontWeight:'900', fontSize: 16, color:h.percent>=50?'#10b981':'#ef4444'}}>{h.percent}%</td>
                                           <td style={{textAlign:'right', paddingRight: 10}}>
                                               <button onClick={()=>{if(confirm('Удалить запись?')){const nh=history.filter(i=>i.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}} style={{border:'none', background:'transparent', color:'var(--text-sec)', fontSize:18, cursor:'pointer', transition: 'color 0.2s'}}>✕</button>
                                           </td>
                                        </tr>
                                    ))}
                                  </tbody>
                               </table>
                           </>
                       )}
                   </motion.div>
               )}

               {/* Вкладка 2: Excel */}
               {activeTab === 'excel' && (
                   <motion.div key="t-excel" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:15}}>
                       <StatCard title="Текущий уровень" value={excelStats.level} color="#10b981" bgRgba="rgba(16, 185, 129, 0.05)" />
                       <StatCard title="Заработано XP" value={excelStats.xp} icon="⚡" color="#3b82f6" bgRgba="rgba(59, 130, 246, 0.05)" />
                       <StatCard title="Решено формул" value={excelStats.completedLessons} color="#f59e0b" bgRgba="rgba(245, 158, 11, 0.05)" />
                       <StatCard title="Серия без ошибок" value={excelStats.streak} icon="🔥" color="#ef4444" bgRgba="rgba(239, 68, 68, 0.05)" />
                   </motion.div>
               )}

               {/* Вкладка 3: Печать */}
               {activeTab === 'typing' && (
                   <motion.div key="t-typing" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:15}}>
                       <StatCard title="Рекорд скорости" value={`${typingStats.maxWpm} WPM`} color="#a855f7" bgRgba="rgba(168, 85, 247, 0.05)" />
                       <StatCard title="Лучшее комбо" value={`x${typingStats.maxCombo}`} color="#0ea5e9" bgRgba="rgba(14, 165, 233, 0.05)" />
                       <StatCard title="Пройдено текстов" value={typingStats.testsCompleted} color="var(--text-main)" bgRgba="var(--nav-item-bg)" fullWidth={true} />
                   </motion.div>
               )}

               {/* Вкладка 4: Хоткеи */}
               {activeTab === 'hotkeys' && (
                   <motion.div key="t-hotkeys" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.2}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:15}}>
                       <StatCard title="Рекорд за сессию" value={hotkeyStats.maxScore} icon="⚡" color="#f59e0b" bgRgba="rgba(245, 158, 11, 0.05)" />
                       <StatCard title="Сыграно сессий" value={hotkeyStats.sessionsPlayed} color="#22c55e" bgRgba="rgba(34, 197, 94, 0.05)" />
                   </motion.div>
               )}
           </AnimatePresence>

       </motion.div>
    )
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
