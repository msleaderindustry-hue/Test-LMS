const { useState, useEffect, useRef, useLayoutEffect, memo } = React;
const { motion, AnimatePresence } = window.Motion;

// --- ЛОГИКА ---
const SECRET_KEY = "MySuperSecretKey_2025_v1";
async function sha256hex(str){const buf = new TextEncoder().encode(str);const hashBuf = await crypto.subtle.digest('SHA-256', buf);return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function hmacSign(secret, message){const enc = new TextEncoder();const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");}
function canvasFingerprint(){try{const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=200;c.height=50;ctx.textBaseline='top';ctx.font="16px Arial";ctx.fillStyle='#f60';ctx.fillRect(125,1,62,20);ctx.fillStyle='#069';ctx.fillText('test-λ',2,2);ctx.fillStyle='rgba(102,204,0,0.7)';ctx.fillText('test-λ',4,24);return c.toDataURL();}catch(e){return '';}}
async function computeFingerprint(){const parts=[navigator.userAgent||'',navigator.platform||'',screen.width+'x'+screen.height,navigator.language||'',String(navigator.hardwareConcurrency||''),await sha256hex(canvasFingerprint())];return await sha256hex(parts.join('|'));}
function shuffleArray(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function useMathJax(contentRef, dependencies = []) {
  useLayoutEffect(() => {
    if (window.MathJax && contentRef.current) {
      window.MathJax.typesetPromise([contentRef.current]).catch(err => console.log(err));
    }
  }, dependencies);
}

// --- UI COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', style, className }) => {
  const vars = {
    primary: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
    green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    teal: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    red: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    orange: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    muted: 'rgba(0,0,0,0.05)'
  };
  
  let color = 'white';
  if(variant === 'muted') { color = 'var(--text-main)'; vars.muted = 'rgba(128,128,128,0.15)'; }
  if(variant === 'red') color = '#9f1239';
  if(variant === 'orange') color = '#9a3412';
  if(variant === 'green') color = '#064e3b';

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: vars[variant] || vars.primary,
        color: color,
        borderRadius: '14px', 
        padding: '0 20px', 
        fontWeight: 700, fontSize: '15px', width: '100%',
        boxShadow: '0 4px 6px rgba(50,50,93,0.11)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginTop: '0', marginBottom: '0',
        ...style
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const Input = (props) => (
  <input 
    {...props}
    style={{
      width: '100%', padding: '0 18px', borderRadius: '14px',
      border: '2px solid transparent', 
      background: 'var(--input-bg)', 
      color: 'var(--text-main)', 
      fontSize: '16px', fontWeight: 500, marginBottom: '12px', marginTop: '8px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
      transition: 'all 0.3s', 
      ...props.style
    }}
  />
);

// --- ВЫНЕСЕННЫЕ КОМПОНЕНТЫ ---

const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
     const cardRef = useRef(null); useMathJax(cardRef, [question]); 
     if (!question) return null;

     return (
       <motion.div 
         ref={cardRef} 
         key={index} 
         initial={{ opacity: 0, x: 20 }} 
         animate={{ opacity: 1, x: 0 }} 
         exit={{ opacity: 0, x: -20 }} 
         transition={{ duration: 0.3 }}
         className="glass-panel" style={{width: '100%', display:'block'}}
       >
          <h3 style={{textAlign:'center', marginBottom:15, opacity:0.6, fontSize:14, textTransform:'uppercase'}}>Вопрос {index+1}</h3>
          <div style={{fontSize:18, marginBottom:20, fontWeight:600}} dangerouslySetInnerHTML={{__html: question.question}} />
          {question.questionImg && <img src={question.questionImg} className="question-image" />}
          
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {question.variants.map((v, i) => {
               const isAnswered = answers[index] !== null; const isSelected = answers[index] === i; const isCorrect = question.correctIndex === i;
               
               let styleOverride = {};
               if(isAnswered) {
                 if(isCorrect) { styleOverride = {background: '#d1fae5', borderColor: '#10b981', color: '#064e3b'}; } 
                 else if(isSelected) { styleOverride = {background: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d'}; } 
                 else if(question.correctIndex === i) { styleOverride = {borderColor: '#10b981', opacity: 0.7}; } 
               }
               
               return (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="variant-item" 
                   onClick={() => !isAnswered && onAnswer(i)}
                   style={{
                     pointerEvents: isAnswered ? 'none' : 'auto',
                     ...styleOverride
                   }}
                   whileHover={!isAnswered ? { scale: 1.01 } : {}}
                 >
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
      useMathJax(reviewRef, [questions]); 

      return (
          <motion.div 
             ref={reviewRef}
             key="review" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
             className="glass-panel review-container" 
          >
             <div className="review-header">
                 <h2 style={{textAlign:'center', margin:0}}>Работа над ошибками</h2>
             </div>
             
             <div className="review-content">
                 {questions.map((q, i) => {
                     const userAns = answers[i];
                     const isCorrect = userAns === q.correctIndex;
                     return (
                         <div key={i} style={{
                             background: 'var(--variant-default)', padding:25, borderRadius:20, marginBottom:20, border: isCorrect ? '2px solid #10b981' : '2px solid #ef4444'
                         }}>
                             <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                                 <strong>Вопрос {i+1}</strong> 
                                 <span style={{color: isCorrect ? '#059669' : '#b91c1c', fontWeight:'bold'}}>{isCorrect ? 'ВЕРНО' : 'ОШИБКА'}</span>
                             </div>
                             <div style={{marginBottom:20, fontSize:16}} dangerouslySetInnerHTML={{__html: q.question}}></div>
                             {/* ДОБАВЛЕН ВЫВОД КАРТИНКИ В РЕЖИМЕ РАБОТЫ НАД ОШИБКАМИ */}
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
             
             <div className="review-footer">
               <Button onClick={onBack} style={{boxShadow:'0 5px 15px rgba(0,0,0,0.1)', width:'auto', padding:'0 40px'}}>В меню</Button>
             </div>
          </motion.div>
      );
};

const StatsView = ({ history, setHistory, onBack }) => {
    const sorted = [...history].sort((a,b) => b.percent - a.percent);
    const chartRef = useRef(null);
    useEffect(() => {
        if(!chartRef.current || sorted.length===0) return;
        const ctx = chartRef.current.getContext('2d');
        const c = new Chart(ctx, {
            type: 'bar',
            data: { labels: sorted.slice(0,10).map(i=>i.student), datasets: [{ label: '%', data: sorted.slice(0,10).map(i=>i.percent), backgroundColor:'#667eea', borderRadius:4 }] },
            options: { scales: { y: { beginAtZero: true, max: 100, ticks:{color:'#718096'} }, x:{ ticks:{color:'#718096'} } }, plugins: { legend: { display: false } }, responsive:true, maintainAspectRatio:false }
        });
        return () => c.destroy();
    }, []);
    return (
       <motion.div key="stats" initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:800, maxHeight:'90vh', overflowY:'auto', display:'block'}}>
           <Button variant="muted" style={{width:'auto', padding:'0 25px', height:40, minHeight:40, fontSize:13}} onClick={onBack}>⬅ Назад</Button>
           <h2 style={{textAlign:'center', margin:'10px 0 20px 0'}}>Рейтинг</h2>
           <div style={{background:'var(--variant-default)', padding:15, borderRadius:20, marginBottom:25, height:220}}><canvas ref={chartRef}></canvas></div>
           <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'2px solid rgba(0,0,0,0.1)', color:'var(--text-sec)'}}><th style={{textAlign:'left', padding:10}}>Студент</th><th style={{padding:10}}>%</th><th style={{padding:10}}></th></tr></thead>
              <tbody>
                {sorted.map(h => (
                    <tr key={h.id} style={{borderBottom:'1px solid rgba(128,128,128,0.1)'}}>
                       <td style={{padding:15}}>
                           <div style={{fontWeight:700}}>{h.student}</div>
                           <div style={{fontSize:12, opacity:0.6}}>{h.topic} • {h.date}</div>
                       </td>
                       <td style={{textAlign:'center', fontWeight:'800', color:h.percent>=50?'#10b981':'#ef4444'}}>{h.percent}%</td>
                       <td style={{textAlign:'right'}}><button onClick={()=>{if(confirm('Удалить?')){const nh=history.filter(i=>i.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}} style={{border:'none', background:'transparent', color:'var(--text-sec)', fontSize:18}}>✕</button></td>
                    </tr>
                ))}
              </tbody>
           </table>
       </motion.div>
    )
};

// --- APP ---

function App() {
  const [view, setView] = useState('loading'); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [fp, setFp] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [licMsg, setLicMsg] = useState('');

  const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
  const [isResultSaved, setIsResultSaved] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(1200);
  const [customTime, setCustomTime] = useState('20'); 
  const [customQCount, setCustomQCount] = useState(''); 
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => { document.body.className = theme; localStorage.setItem('theme', theme); }, [theme]);

  useEffect(() => {
      if(view !== 'test') return;
      const timer = setInterval(() => {
          setTimeLeft((prev) => {
              if(prev <= 1) {
                  clearInterval(timer);
                  return 0; 
              }
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(timer);
  }, [view]);
  
  useEffect(() => {
      if(timeLeft === 0 && view === 'test') {
          finishTest();
      }
  }, [timeLeft]);

  const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0'+sec : sec}`;
  };

  useEffect(() => {
    async function check() {
      document.onkeydown = function(e) { if(e.keyCode == 123) return false; if(e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0))) return false; };
      const f = await computeFingerprint(); setFp(f);
      const saved = localStorage.getItem('license_for_app_v1');
      let valid = false;
      if(saved) { try { const obj = JSON.parse(saved); if(obj.fingerprint === f) { const expected = await hmacSign(SECRET_KEY, f); if(obj.license === expected) valid = true; } } catch(e){} }
      if(valid) { loadData(); setView('menu'); } else { setView('license'); }
    }
    check();
  }, []);

  const loadData = () => {
    const raw = localStorage.getItem('test_sets_list'); setSets(raw ? JSON.parse(raw) : ['Электроника']);
    if(!raw) { localStorage.setItem('test_sets_list', JSON.stringify(['Электроника'])); localStorage.setItem('tests_Электроника', JSON.stringify([])); }
    setHistory(JSON.parse(localStorage.getItem('test_history_v1') || '[]'));
  };

  const handleLicenseCheck = async () => {
    if(!/^[0-9a-f]{64}$/i.test(licenseInput.trim())){ setLicMsg('Неверный формат'); return; }
    const expected = await hmacSign(SECRET_KEY, fp);
    if(licenseInput.trim() !== expected) { setLicMsg('❌ Ключ не подходит'); return; }
    localStorage.setItem('license_for_app_v1', JSON.stringify({fingerprint: fp, license: licenseInput.trim()}));
    loadData(); setView('menu');
  };

  const addSet = (name) => {
    if(!name) return; if(sets.includes(name)) return alert('Уже есть!');
    const newSets = [...sets, name]; setSets(newSets); localStorage.setItem('test_sets_list', JSON.stringify(newSets)); localStorage.setItem('tests_' + name, JSON.stringify([]));
  };
  const deleteSet = (name) => {
    if(!confirm(`Удалить "${name}"?`)) return; const newSets = sets.filter(s => s !== name);
    setSets(newSets); localStorage.setItem('test_sets_list', JSON.stringify(newSets)); localStorage.removeItem('tests_' + name);
  };
  const openSet = (name) => { setCurrentSet(name); setTests(JSON.parse(localStorage.getItem('tests_' + name)) || []); setView('set_menu'); };

  const importJSON = (e) => {
    const file = e.target.files[0]; if(!file) return; const reader = new FileReader();
    reader.onload = ev => { try { const data = JSON.parse(ev.target.result); const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}), correctIndex: t.correctIndex })); setTests(normalized); localStorage.setItem('tests_' + currentSet, JSON.stringify(normalized)); alert(`✅ Импортировано: ${normalized.length}`); } catch { alert('Ошибка JSON'); } };
    reader.readAsText(file);
  };

  const startTest = () => {
    if(tests.length === 0) return alert('Нет вопросов!');
    setCustomQCount(tests.length); 
    setView('timer_setup');
  };
  
  const launchTestWithTimer = () => {
      const mins = parseInt(customTime) || 20;
      let qCount = parseInt(customQCount);
      
      if (!qCount || qCount <= 0) qCount = tests.length;
      if (qCount > tests.length) qCount = tests.length;

      let fullList = shuffleArray(tests);
      let selectedQuestions = fullList.slice(0, qCount);
      
      let finalQuestions = selectedQuestions.map(t => {
          let varsWithFlag = t.variants.map((v, i) => ({ ...v, _isCorrectOriginal: i === t.correctIndex }));
          varsWithFlag = shuffleArray(varsWithFlag);
          return { ...t, variants: varsWithFlag, correctIndex: varsWithFlag.findIndex(v => v._isCorrectOriginal) };
      });

      setIsResultSaved(false);
      setTimeLeft(mins * 60); 
      setTestSession({ questions: finalQuestions, currentIdx: 0, answers: new Array(finalQuestions.length).fill(null), score: 0 }); 
      setView('test');
  };

  const handleAnswer = (variantIdx) => {
    if(testSession.answers[testSession.currentIdx] !== null) return; 
    const newAnswers = [...testSession.answers]; newAnswers[testSession.currentIdx] = variantIdx;
    setTestSession(prev => ({...prev, answers: newAnswers}));
    
    setIsAnimating(true);
    setTimeout(() => { 
        if(testSession.currentIdx < testSession.questions.length - 1) { 
            setTestSession(prev => ({...prev, currentIdx: prev.currentIdx + 1})); 
        }
        setIsAnimating(false);
    }, 700);
  };
  
  const handleNavClick = (i) => {
      if(isAnimating) return; 
      if(i === testSession.currentIdx) return;
      setIsAnimating(true);
      setTestSession(p => ({...p, currentIdx: i}));
      setTimeout(() => setIsAnimating(false), 350); 
  };

  const finishTest = () => {
    let correct = 0; testSession.questions.forEach((q, i) => { if(testSession.answers[i] === q.correctIndex) correct++; });
    setTestSession(prev => ({...prev, score: correct}));
    if(correct/testSession.questions.length >= 0.5) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setView('result');
  };

  // --- KEYBOARD SUPPORT ADDITION ---
  useEffect(() => {
      if (view !== 'test') return;

      const handleKeyDown = (e) => {
          if (isAnimating) return; 

          const { currentIdx, questions, answers } = testSession;
          
          // Navigation
          if (e.key === 'ArrowRight' || e.key === 'Enter') {
              if (currentIdx < questions.length - 1) {
                  handleNavClick(currentIdx + 1);
              }
          } else if (e.key === 'ArrowLeft') {
              if (currentIdx > 0) {
                  handleNavClick(currentIdx - 1);
              }
          } 
          // Answers 1-9
          else if (e.key >= '1' && e.key <= '9') {
              const variantIndex = parseInt(e.key) - 1; 
              if (questions[currentIdx] && variantIndex < questions[currentIdx].variants.length) {
                  if (answers[currentIdx] === null) {
                      handleAnswer(variantIndex);
                  }
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, testSession, isAnimating]);
  // ---------------------------------
  
  // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ДЛЯ ПОВТОРЕНИЯ ОШИБОК ---
  const restartMistakes = () => {
    // 1. Фильтруем вопросы, где была ошибка
    const wrongQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
    
    if(wrongQuestionsRaw.length === 0) return; 

    // 2. ПЕРЕМЕШИВАЕМ ВАРИАНТЫ ОТВЕТОВ ЗАНОВО
    // Так как у нас уже есть флаг _isCorrectOriginal внутри объектов вариантов, мы можем спокойно мешать
    const reShuffledQuestions = wrongQuestionsRaw.map(q => {
       const newVars = shuffleArray([...q.variants]);
       const newCorrectIdx = newVars.findIndex(v => v._isCorrectOriginal);
       return { ...q, variants: newVars, correctIndex: newCorrectIdx };
    });

    // Сбрасываем таймер
    const mins = parseInt(customTime) || 20;
    setTimeLeft(mins * 60);

    // Запускаем тест с новыми перемешанными вопросами
    setTestSession({ 
        questions: reShuffledQuestions, 
        currentIdx: 0, 
        answers: new Array(reShuffledQuestions.length).fill(null), 
        score: 0 
    });

    setIsResultSaved(false);
    setView('test');
  };
  // -------------------------------------------

  const saveResult = (name) => {
    if(!name.trim()) return alert('Введите имя!');
    const newRecord = { id: Date.now(), student: name, date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5), score: testSession.score, total: testSession.questions.length, percent: Math.round((testSession.score / testSession.questions.length) * 100), topic: currentSet };
    const newHistory = [...history, newRecord]; setHistory(newHistory); localStorage.setItem('test_history_v1', JSON.stringify(newHistory)); 
    setIsResultSaved(true);
  };

  const handlePrint = () => {
    const area = document.getElementById('printArea');
    let html = `<div class="print-header"><h1>ТЕСТ: ${currentSet}</h1><div style="display:flex;justify-content:space-between"><div>ФИО: <div class="print-input"></div></div><div>Оценка: <div class="print-input"></div></div></div></div>`;
    const printTests = tests.map(t => ({ ...t, variants: shuffleArray([...t.variants]) }));
    printTests.forEach((t, i) => {
      html += `<div class="print-q"><h4>${i+1}. ${t.question}</h4>`; if(t.questionImg) html += `<img src="${t.questionImg}" style="max-width:200px;display:block;">`;
      t.variants.forEach(v => { html += `<div class="print-var">${v.text} ${v.img ? '(см. рис)' : ''}</div>`; }); html += `</div>`;
    });
    
    area.innerHTML = html; 
    
    if(window.MathJax) {
        MathJax.typesetPromise([area]).then(() => {
            setTimeout(() => { window.print(); }, 800);
        });
    } else {
        window.print();
    }
  };

  return (
    <>
      <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:-1, overflow:'hidden', pointerEvents:'none'}}>
         <motion.div 
           animate={{ rotate: 360, x: [0, 50, 0], y: [0, 30, 0] }} 
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }} 
           style={{
               position:'absolute', top:'-20%', left:'-10%', width:'70vw', height:'70vw', 
               /* Сделал цвета мягче (пастельными) */
               background:'radial-gradient(circle, rgba(224, 195,
