// ===== ВИЗУАЛЬНЫЙ АПГРЕЙД: TestQuestionCard / ReviewView / StatsView =====
// Логика, структура пропсов и связи с window — без изменений.
// Изменения: градиенты, свечение, пружинные анимации, иконки вместо текста,
// конфетти при верном ответе, топ-3 медали в рейтинге.

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 12.5L9 17.5L20 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Небольшой конфетти-всплеск, рендерится поверх выбранного правильного варианта
const Confetti = () => {
  const bits = ['#10b981', '#34d399', '#fbbf24', '#60a5fa', '#f472b6'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, x: '50%', y: '50%', scale: 0 }}
          animate={{
            opacity: 0,
            x: `calc(50% + ${(Math.random() - 0.5) * 160}px)`,
            y: `calc(50% + ${(Math.random() - 0.8) * 120}px)`,
            scale: 1,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute', width: 6, height: 6, borderRadius: 2,
            background: bits[i % bits.length]
          }}
        />
      ))}
    </div>
  );
};

const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
     const cardRef = useRef(null); useMathJax(cardRef, [question]); 
     if (!question) return null;

     const isAnswered = answers[index] !== null;
     const selectedIdx = answers[index];
     const gotItRight = isAnswered && selectedIdx === question.correctIndex;

     return (
       <motion.div
          ref={cardRef} key={index}
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel"
          style={{
            width: '100%', display: 'block', position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: gotItRight
              ? '0 12px 40px rgba(16,185,129,0.18)'
              : '0 12px 40px rgba(102,126,234,0.12)'
          }}
       >
         {/* декоративное свечение сверху */}
         <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 260, height: 140, borderRadius: '50%', filter: 'blur(50px)',
            background: gotItRight
              ? 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)'
              : 'radial-gradient(circle, rgba(102,126,234,0.3), transparent 70%)',
            pointerEvents: 'none', transition: 'background 0.4s ease'
         }} />

         <motion.h3
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', marginBottom: 15, fontSize: 13, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'inline-block', width: '100%'
            }}
         >
            Вопрос {index + 1}
         </motion.h3>

         <div style={{fontSize:18, marginBottom:20, fontWeight:600, position:'relative'}} dangerouslySetInnerHTML={{__html: question.question}} />
         {question.questionImg && (
            <motion.img
               initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3 }}
               src={question.questionImg} className="question-image"
               style={{ borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            />
         )}
         
         <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {question.variants.map((v, i) => {
               const isSelected = selectedIdx === i;
               const isCorrect = question.correctIndex === i;
               
               let styleOverride = {};
               let animationProps = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.08, type: 'spring', stiffness: 260, damping: 20 } };

               if(isAnswered) {
                 if(isCorrect) { 
                     styleOverride = {
                        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                        borderColor: '#10b981', color: '#064e3b',
                        boxShadow: '0 6px 18px rgba(16,185,129,0.25)'
                     }; 
                     if(isSelected) animationProps.animate = { opacity: 1, x: 0, scale: [1, 1.06, 1] };
                     animationProps.transition = { duration: 0.45, ease: 'easeOut' };
                 } 
                 else if(isSelected) { 
                     styleOverride = {
                        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        borderColor: '#ef4444', color: '#7f1d1d',
                        boxShadow: '0 6px 18px rgba(239,68,68,0.2)'
                     }; 
                     animationProps.animate = { opacity: 1, x: [-6, 6, -6, 6, 0] };
                     animationProps.transition = { duration: 0.35 };
                 } 
                 else if(question.correctIndex === i) { styleOverride = {borderColor: '#10b981', opacity: 0.65}; } 
               }
               
               return (
                 <motion.div 
                    key={i} 
                    {...animationProps}
                    className="variant-item" 
                    onClick={() => !isAnswered && onAnswer(i)} 
                    style={{
                       pointerEvents: isAnswered ? 'none' : 'auto', ...styleOverride,
                       position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
                       cursor: isAnswered ? 'default' : 'pointer'
                    }} 
                    whileHover={!isAnswered ? { scale: 1.015, boxShadow: '0 6px 18px rgba(102,126,234,0.18)' } : {}}
                    whileTap={!isAnswered ? { scale: 0.99 } : {}}
                 >
                    {isAnswered && isCorrect && (
                       <motion.span
                          initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          style={{ color: '#10b981', display: 'flex', flexShrink: 0 }}
                       ><CheckIcon /></motion.span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                       <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          style={{ color: '#ef4444', display: 'flex', flexShrink: 0 }}
                       ><CrossIcon /></motion.span>
                    )}
                    {v.img && <img src={v.img} style={{display:'block', maxWidth:200, marginBottom:8, borderRadius:8}} />}
                    <span>{v.text}</span>
                    {isSelected && isCorrect && <Confetti />}
                 </motion.div>
               )
            })}
         </div>
       </motion.div>
     );
});

const ReviewView = ({ questions, answers, onBack }) => {
      const reviewRef = useRef(null); useMathJax(reviewRef, [questions]); 
      const correctCount = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
      const pct = Math.round((correctCount / questions.length) * 100);

      return (
          <motion.div ref={reviewRef} key="review" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }} className="glass-panel review-container">
             <div className="review-header">
                <h2 style={{textAlign:'center', margin:'0 0 10px 0'}}>Работа над ошибками</h2>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginBottom:6 }}>
                   <div style={{
                      fontSize: 28, fontWeight: 800,
                      background: pct >= 50 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                   }}>{pct}%</div>
                   <span style={{ opacity: 0.6, fontSize: 14 }}>{correctCount} из {questions.length} верно</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 8, background: 'rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 10 }}>
                   <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                      style={{ height: '100%', background: pct >= 50 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f87171)' }}
                   />
                </div>
             </div>
             <div className="review-content">
                 {questions.map((q, i) => {
                     const userAns = answers[i]; const isCorrect = userAns === q.correctIndex;
                     return (
                         <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            style={{
                               background: 'var(--variant-default)', padding:25, borderRadius:20, marginBottom:20,
                               border: isCorrect ? '2px solid #10b981' : '2px solid #ef4444',
                               boxShadow: isCorrect ? '0 6px 20px rgba(16,185,129,0.12)' : '0 6px 20px rgba(239,68,68,0.1)'
                            }}
                         >
                             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
                                <strong>Вопрос {i+1}</strong>
                                <span style={{
                                   display:'flex', alignItems:'center', gap:6,
                                   color: isCorrect ? '#059669' : '#b91c1c', fontWeight:'bold',
                                   background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                   padding: '4px 12px', borderRadius: 999, fontSize: 13
                                }}>
                                   {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                   {isCorrect ? 'ВЕРНО' : 'ОШИБКА'}
                                </span>
                             </div>
                             <div style={{marginBottom:20, fontSize:16}} dangerouslySetInnerHTML={{__html: q.question}}></div>
                             {q.questionImg && <img src={q.questionImg} className="question-image" style={{maxWidth:'100%', maxHeight:200, display:'block', margin:'0 auto 15px auto', borderRadius:10, boxShadow:'0 6px 18px rgba(0,0,0,0.1)'}} />}
                             {q.variants.map((v, vi) => {
                                 let style = {padding:'10px 15px', borderRadius:10, margin:'5px 0', border:'2px solid transparent', background:'var(--glass-bg)', opacity:0.85, color:'var(--text-main)', display:'flex', alignItems:'center', gap:8};
                                 if(vi === q.correctIndex) { style.background = 'linear-gradient(135deg,#d1fae5,#a7f3d0)'; style.borderColor = '#10b981'; style.color = '#064e3b'; style.opacity=1; }
                                 if(vi === userAns && !isCorrect) { style.background = 'linear-gradient(135deg,#fee2e2,#fecaca)'; style.borderColor = '#ef4444'; style.color = '#7f1d1d'; style.opacity=1; }
                                 return (
                                    <div key={vi} style={style}>
                                       {vi === q.correctIndex && <span style={{color:'#10b981', display:'flex'}}><CheckIcon /></span>}
                                       {vi === userAns && !isCorrect && <span style={{color:'#ef4444', display:'flex'}}><CrossIcon /></span>}
                                       <span dangerouslySetInnerHTML={{__html: v.text || 'Image'}}></span>
                                    </div>
                                 )
                             })}
                         </motion.div>
                     )
                 })}
             </div>
             <div className="review-footer"><Button onClick={onBack} style={{boxShadow:'0 8px 20px rgba(102,126,234,0.25)', width:'auto', padding:'0 40px'}}>В меню</Button></div>
          </motion.div>
      );
};

const StatsView = ({ history, setHistory, onBack }) => {
    const sorted = [...history].sort((a,b) => b.percent - a.percent);
    const chartRef = useRef(null);
    const medals = ['🥇', '🥈', '🥉'];

    useEffect(() => {
        if(!chartRef.current || sorted.length===0) return;
        const ctx = chartRef.current.getContext('2d');
        const top = sorted.slice(0,10);

        const gradients = top.map(item => {
           const g = ctx.createLinearGradient(0, 0, 0, 200);
           if (item.percent >= 50) { g.addColorStop(0, '#34d399'); g.addColorStop(1, '#10b981'); }
           else { g.addColorStop(0, '#f87171'); g.addColorStop(1, '#ef4444'); }
           return g;
        });

        const c = new Chart(ctx, {
            type: 'bar',
            data: { labels: top.map(i=>i.student), datasets: [{ label: '%', data: top.map(i=>i.percent), backgroundColor: gradients, borderRadius:8, borderSkipped:false, maxBarThickness: 42 }] },
            options: {
               scales: {
                  y: { beginAtZero: true, max: 100, ticks:{color:'#718096'}, grid: { color: 'rgba(128,128,128,0.08)' } },
                  x: { ticks:{color:'#718096'}, grid: { display: false } }
               },
               plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', padding: 10, cornerRadius: 8 } },
               animation: { duration: 700, easing: 'easeOutQuart' },
               responsive:true, maintainAspectRatio:false
            }
        });
        return () => c.destroy();
    }, []);

    return (
       <motion.div key="stats" initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} transition={{ duration: 0.35 }} className="glass-panel" style={{width:'100%', maxWidth:800, maxHeight:'90vh', overflowY:'auto', display:'block'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
               <Button variant="muted" style={{width:'auto', padding:'0 25px', height:40, minHeight:40, fontSize:13, margin: 0}} onClick={onBack}>⬅ Назад</Button>
           </div>
           <h2 style={{
              textAlign:'center', margin:'0 0 20px 0',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display:'inline-block', width:'100%'
           }}>Рейтинг</h2>
           <div style={{background:'var(--variant-default)', padding:15, borderRadius:20, marginBottom:25, height:220, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)'}}><canvas ref={chartRef}></canvas></div>
           <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'2px solid rgba(0,0,0,0.1)', color:'var(--text-sec)'}}><th style={{textAlign:'left', padding:10}}>Студент</th><th style={{padding:10}}>%</th><th style={{padding:10}}></th></tr></thead>
              <tbody>
                {sorted.map((h, idx) => (
                    <motion.tr
                       key={h.id}
                       initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.03 }}
                       whileHover={{ background: 'rgba(102,126,234,0.06)' }}
                       style={{borderBottom:'1px solid rgba(128,128,128,0.1)'}}
                    >
                       <td style={{padding:15}}>
                          <div style={{fontWeight:700, display:'flex', alignItems:'center', gap:8}}>
                             {idx < 3 && <span style={{fontSize:18}}>{medals[idx]}</span>}
                             {h.student}
                          </div>
                          <div style={{fontSize:12, opacity:0.6}}>{h.topic} • {h.date}</div>
                       </td>
                       <td style={{textAlign:'center', fontWeight:'800', color:h.percent>=50?'#10b981':'#ef4444'}}>{h.percent}%</td>
                       <td style={{textAlign:'right'}}>
                          <motion.button
                             whileHover={{ scale: 1.15, color: '#ef4444' }}
                             whileTap={{ scale: 0.9 }}
                             onClick={()=>{if(confirm('Удалить?')){const nh=history.filter(i=>i.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}}
                             style={{border:'none', background:'transparent', color:'var(--text-sec)', fontSize:18, cursor:'pointer'}}
                          >✕</motion.button>
                       </td>
                    </motion.tr>
                ))}
              </tbody>
           </table>
       </motion.div>
    )
};

// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
