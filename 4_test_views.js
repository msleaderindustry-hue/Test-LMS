const { useState, useEffect, useRef, memo } = React;
const { motion } = window.Motion;
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

const StatsView = ({ history, setHistory, onBack, userData }) => {
    const [activeTab, setActiveTab] = useState('tests');
    const sortedHistory = [...history].sort((a,b) => b.percent - a.percent);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const excelStats = userData?.excelProgress || { level: 1, xp: 0, completedLessons: 0, streak: 0 };
    const typingStats = JSON.parse(localStorage.getItem('typing_stats') || '{"maxWpm":0, "maxCombo":0, "testsCompleted":0}');
    const hotkeyStats = JSON.parse(localStorage.getItem('hotkey_stats') || '{"maxScore":0, "sessionsPlayed":0}');

    useEffect(() => {
        if (activeTab === 'tests' && chartRef.current && sortedHistory.length > 0) {
            if (chartInstance.current) chartInstance.current.destroy();
            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new window.Chart(ctx, {
                type: 'bar',
                data: { labels: sortedHistory.slice(0,10).map(i=>i.student), datasets: [{ label: '%', data: sortedHistory.slice(0,10).map(i=>i.percent), backgroundColor:'#667eea', borderRadius:4 }] },
                options: { scales: { y: { beginAtZero: true, max: 100, ticks:{color:'#718096'} }, x:{ ticks:{color:'#718096'} } }, plugins: { legend: { display: false } }, responsive:true, maintainAspectRatio:false }
            });
        }
        return () => { if (chartInstance.current) chartInstance.current.destroy(); }
    }, [activeTab, sortedHistory]);

    return (
       <motion.div key="stats" initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:800, maxHeight:'90vh', overflowY:'auto', display:'flex', flexDirection:'column'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
               <Button variant="muted" style={{width:'auto', padding:'0 25px', height:40, minHeight:40, fontSize:13, margin: 0}} onClick={onBack}>⬅ Назад</Button>
               <h2 style={{margin:0}}>📊 Мой Прогресс</h2>
               <div style={{width: 80}}></div>
           </div>

           <div className="modern-scroll" style={{display:'flex', gap:10, marginBottom:20, overflowX:'auto', paddingBottom:5}}>
               <Button variant={activeTab === 'tests' ? 'primary' : 'muted'} onClick={() => setActiveTab('tests')} style={{flex:1, minWidth:120, height:40, margin:0}}>📝 Тесты</Button>
               <Button variant={activeTab === 'excel' ? 'primary' : 'muted'} onClick={() => setActiveTab('excel')} style={{flex:1, minWidth:120, height:40, margin:0, background: activeTab === 'excel' ? '#10b981' : '', color: activeTab === 'excel' ? '#fff' : ''}}>📊 Excel</Button>
               <Button variant={activeTab === 'typing' ? 'primary' : 'muted'} onClick={() => setActiveTab('typing')} style={{flex:1, minWidth:120, height:40, margin:0, background: activeTab === 'typing' ? '#8b5cf6' : '', color: activeTab === 'typing' ? '#fff' : ''}}>⌨️ Печать</Button>
               <Button variant={activeTab === 'hotkeys' ? 'primary' : 'muted'} onClick={() => setActiveTab('hotkeys')} style={{flex:1, minWidth:120, height:40, margin:0, background: activeTab === 'hotkeys' ? '#f59e0b' : '', color: activeTab === 'hotkeys' ? '#fff' : ''}}>⚡ Хоткеи</Button>
           </div>

           {activeTab === 'tests' && (
               <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                   {sortedHistory.length === 0 ? <p style={{textAlign:'center', color:'var(--text-sec)', padding: '40px 0'}}>Вы еще не проходили тесты</p> : (
                       <>
                           <div style={{background:'var(--variant-default)', padding:15, borderRadius:20, marginBottom:25, height:220}}><canvas ref={chartRef}></canvas></div>
                           <table style={{width:'100%', borderCollapse:'collapse'}}>
                              <thead><tr style={{borderBottom:'2px solid var(--glass-border)', color:'var(--text-sec)'}}><th style={{textAlign:'left', padding:10}}>Тест / Дата</th><th style={{padding:10}}>%</th><th style={{padding:10}}></th></tr></thead>
                              <tbody>
                                {sortedHistory.map(h => (
                                    <tr key={h.id} style={{borderBottom:'1px solid rgba(128,128,128,0.1)'}}>
                                       <td style={{padding:15}}><div style={{fontWeight:700}}>{h.topic}</div><div style={{fontSize:12, opacity:0.6}}>{h.student} • {h.date}</div></td>
                                       <td style={{textAlign:'center', fontWeight:'800', color:h.percent>=50?'#10b981':'#ef4444'}}>{h.percent}%</td>
                                       <td style={{textAlign:'right'}}><button onClick={()=>{if(confirm('Удалить запись?')){const nh=history.filter(i=>i.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}} style={{border:'none', background:'transparent', color:'var(--text-sec)', fontSize:18, cursor:'pointer'}}>✕</button></td>
                                    </tr>
                                ))}
                              </tbody>
                           </table>
                       </>
                   )}
               </motion.div>
           )}

           {activeTab === 'excel' && (
               <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:15, marginTop: 10}}>
                   <div style={{background:'rgba(16, 185, 129, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(16, 185, 129, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Текущий уровень</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#10b981', margin: '5px 0'}}>{excelStats.level}</div>
                   </div>
                   <div style={{background:'rgba(59, 130, 246, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(59, 130, 246, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Заработано XP</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#3b82f6', margin: '5px 0'}}>⚡ {excelStats.xp}</div>
                   </div>
                   <div style={{background:'rgba(245, 158, 11, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(245, 158, 11, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Решено формул</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#f59e0b', margin: '5px 0'}}>{excelStats.completedLessons}</div>
                   </div>
                   <div style={{background:'rgba(239, 68, 68, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(239, 68, 68, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Серия без ошибок</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#ef4444', margin: '5px 0'}}>🔥 {excelStats.streak}</div>
                   </div>
               </motion.div>
           )}

           {activeTab === 'typing' && (
               <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:15, marginTop: 10}}>
                   <div style={{background:'rgba(139, 92, 246, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(139, 92, 246, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Рекорд скорости</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#8b5cf6', margin: '5px 0'}}>{typingStats.maxWpm} <span style={{fontSize: 16}}>WPM</span></div>
                   </div>
                   <div style={{background:'rgba(14, 165, 233, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(14, 165, 233, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Лучшее комбо</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#0ea5e9', margin: '5px 0'}}>x{typingStats.maxCombo}</div>
                   </div>
                   <div style={{gridColumn: '1 / -1', background:'var(--variant-default)', padding:25, borderRadius:16, border:'1px solid var(--glass-border)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Пройдено текстов</div>
                       <div style={{fontSize:42, fontWeight:900, color:'var(--text-main)', margin: '5px 0'}}>{typingStats.testsCompleted}</div>
                   </div>
               </motion.div>
           )}

           {activeTab === 'hotkeys' && (
               <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:15, marginTop: 10}}>
                   <div style={{background:'rgba(245, 158, 11, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(245, 158, 11, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Рекорд за сессию</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#f59e0b', margin: '5px 0'}}>⚡ {hotkeyStats.maxScore}</div>
                   </div>
                   <div style={{background:'rgba(34, 197, 94, 0.08)', padding:25, borderRadius:16, border:'1px solid rgba(34, 197, 94, 0.2)', textAlign:'center'}}>
                       <div style={{fontSize:12, color:'var(--text-sec)', textTransform:'uppercase', fontWeight:800}}>Сыграно сессий</div>
                       <div style={{fontSize:42, fontWeight:900, color:'#22c55e', margin: '5px 0'}}>{hotkeyStats.sessionsPlayed}</div>
                   </div>
               </motion.div>
           )}

       </motion.div>
    )
};

Object.assign(window, { TestQuestionCard, ReviewView, StatsView });
