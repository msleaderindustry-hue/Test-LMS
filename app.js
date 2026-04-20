const { useState, useEffect, useRef, useLayoutEffect, memo } = React;
const { motion, AnimatePresence } = window.Motion;

// --- ЛОГИКА ---
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1481534100194983958/L107VBFTCX5FYQFfAyiJu7PsTOhbsrNX9yOmRLExoj-B-a9okiGuyweAPmYzPcU09rEj';

async function sha256hex(str){const buf = new TextEncoder().encode(str);const hashBuf = await crypto.subtle.digest('SHA-256', buf);return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');}
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

// ЭКРАН АВТОРИЗАЦИИ
const AuthScreen = memo(() => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            const result = await window.auth.signInWithPopup(provider);
            const user = result.user;

            const userDoc = await window.db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                await window.db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'student',
                    isBanned: false,
                    registeredAt: new Date().toISOString()
                });
            }
        } catch (err) {
            console.error(err);
            let errMsg = "Произошла ошибка при авторизации.";
            if (err.code === 'auth/popup-closed-by-user') {
                errMsg = "Вы закрыли окно авторизации. Попробуйте снова.";
            } else if (err.code === 'auth/network-request-failed') {
                errMsg = "Ошибка сети. Проверьте интернет-соединение.";
            }
            setError(errMsg);
            setIsLoading(false);
        }
    };

    return (
        <motion.div key="auth" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{marginTop:0, marginBottom: 30}}>Вход в систему</h2>
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{opacity: 0, height: 0, overflow: 'hidden'}} 
                        animate={{opacity: 1, height: 'auto', marginBottom: '15px'}} 
                        exit={{opacity: 0, height: 0, marginBottom: 0}} 
                        style={{ color: '#ef4444', fontSize: '0.95rem', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500' }}>
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    width: '100%', height: '54px', borderRadius: '14px', border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)', color: 'var(--text-main)', fontSize: '16px', fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', opacity: isLoading ? 0.7 : 1
                }}
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 24, height: 24}} />
                {isLoading ? 'Загрузка...' : 'Продолжить с Google'}
            </motion.button>
        </motion.div>
    );
});

// --- АДМИН-ПАНЕЛЬ ---
const AdminPanel = ({ onBack }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if(!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    const toggleBan = async (uid, currentStatus) => {
        try {
            await window.db.collection('users').doc(uid).update({ isBanned: !currentStatus });
        } catch (e) {
            alert("Ошибка при изменении статуса");
        }
    };

    const handleAssignTestFile = (e, uid) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const title = prompt("Введите название теста:", "Тест от преподавателя");
                if (!title) return;

                const normalized = data.map(t => ({
                    question: t.question || '',
                    questionImg: t.questionImg || null,
                    variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}),
                    correctIndex: t.correctIndex
                }));

                const currentUser = users.find(u => u.id === uid);
                const currentTests = currentUser.assignedTests || [];
                
                const newTest = { id: Date.now(), title: title.trim(), data: normalized };

                await window.db.collection('users').doc(uid).update({ assignedTests: [...currentTests, newTest] });
                alert("✅ Тест успешно загружен!");
            } catch (err) {
                alert("Ошибка чтения JSON файла!");
            }
        };
        reader.readAsText(file);
        e.target.value = null; 
    };

    const removeTest = async (uid, testId) => {
        if(confirm("Удалить этот тест у студента?")) {
            try {
                const currentUser = users.find(u => u.id === uid);
                const updatedTests = (currentUser.assignedTests || []).filter(t => t.id !== testId);
                await window.db.collection('users').doc(uid).update({ assignedTests: updatedTests });
            } catch(e) {
                alert("Ошибка при удалении теста");
            }
        }
    };

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:'800px', maxHeight:'90vh', overflowY:'auto'}}>
            <Button variant="muted" onClick={onBack} style={{marginBottom: 20}}>⬅ В меню</Button>
            <h2 style={{color:'#ef4444', textAlign:'center', marginTop:0}}>Панель Администратора</h2>

            <div style={{background:'rgba(128,128,128,0.05)', padding:20, borderRadius:15, border: '1px solid var(--glass-border)'}}>
                <h3 style={{marginTop: 0}}>👥 Управление студентами</h3>
                {users.map(u => (
                    <div key={u.id} style={{display:'flex', justifyContent:'space-between', alignItems: 'center', padding:'10px 0', borderBottom:'1px solid rgba(128,128,128,0.1)'}}>
                        <div style={{overflow: 'hidden', paddingRight: '10px', flex: 1}}>
                            <div style={{fontWeight:'bold'}}>{u.email}</div>
                            <div style={{fontSize:12, color: u.isBanned ? '#ef4444' : '#10b981'}}>{u.isBanned ? ' ЗАБЛОКИРОВАН' : ' АКТИВЕН'}</div>
                            {u.assignedTests && u.assignedTests.length > 0 && (
                                <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                    {u.assignedTests.map(test => (
                                        <div key={test.id} style={{fontSize:12, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '5px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between'}}>
                                            <span>☁️ {test.title}</span>
                                            <span style={{cursor: 'pointer', color: '#ef4444'}} onClick={() => removeTest(u.id, test.id)}>✖</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{display: 'flex', gap: '5px'}}>
                            <label style={{cursor: 'pointer', background: 'var(--teal-grad)', color: 'white', borderRadius: '14px', padding: '0 15px', height: '35px', display:'flex', alignItems:'center', fontSize:'12px'}}>
                                📁 Загрузить
                                <input type="file" accept=".json" style={{display: 'none'}} onChange={(e) => handleAssignTestFile(e, u.id)} />
                            </label>
                            <Button variant={u.isBanned ? "green" : "red"} style={{width:'auto', padding:'0 15px', height:35, fontSize:12, margin:0}} onClick={() => toggleBan(u.id, u.isBanned)}>
                                {u.isBanned ? "Разбанить" : "Забанить"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const TestQuestionCard = memo(({ question, index, answers, onAnswer }) => {
     const cardRef = useRef(null); useMathJax(cardRef, [question]); 
     if (!question) return null;
     return (
       <motion.div ref={cardRef} key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="glass-panel" style={{width: '100%', display:'block'}}>
         <h3 style={{textAlign:'center', marginBottom:15, opacity:0.6, fontSize:14}}>Вопрос {index+1}</h3>
         <div style={{fontSize:18, marginBottom:20, fontWeight:600}} dangerouslySetInnerHTML={{__html: question.question}} />
         {question.questionImg && <img src={question.questionImg} className="question-image" />}
         <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {question.variants.map((v, i) => {
               const isAnswered = answers[index] !== null; const isSelected = answers[index] === i; const isCorrect = question.correctIndex === i;
               let styleOverride = {};
               if(isAnswered) {
                 if(isCorrect) styleOverride = {background: '#d1fae5', borderColor: '#10b981', color: '#064e3b'};
                 else if(isSelected) styleOverride = {background: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d'};
                 else if(question.correctIndex === i) styleOverride = {borderColor: '#10b981', opacity: 0.7};
               }
               return (
                 <motion.div key={i} className="variant-item" onClick={() => !isAnswered && onAnswer(i)} style={{ pointerEvents: isAnswered ? 'none' : 'auto', ...styleOverride }}>
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
      const reviewRef = useRef(null); useMathJax(reviewRef, [questions]); 
      return (
          <motion.div ref={reviewRef} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel review-container">
             <div className="review-header"><h2 style={{textAlign:'center'}}>Работа над ошибками</h2></div>
             <div className="review-content">
                 {questions.map((q, i) => {
                     const userAns = answers[i]; const isCorrect = userAns === q.correctIndex;
                     return (
                         <div key={i} style={{ background: 'var(--variant-default)', padding:25, borderRadius:20, marginBottom:20, border: isCorrect ? '2px solid #10b981' : '2px solid #ef4444' }}>
                             <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}><strong>Вопрос {i+1}</strong><span style={{color: isCorrect ? '#059669' : '#b91c1c'}}>{isCorrect ? 'ВЕРНО' : 'ОШИБКА'}</span></div>
                             <div style={{marginBottom:20}} dangerouslySetInnerHTML={{__html: q.question}}></div>
                             {q.variants.map((v, vi) => {
                                 let style = {padding:'10px', borderRadius:10, margin:'5px 0', border:'2px solid transparent', background:'var(--glass-bg)', opacity:0.8};
                                 if(vi === q.correctIndex) { style.background = '#d1fae5'; style.borderColor = '#10b981'; style.color = '#064e3b'; style.opacity=1; }
                                 if(vi === userAns && !isCorrect) { style.background = '#fee2e2'; style.borderColor = '#ef4444'; style.color = '#7f1d1d'; style.opacity=1; }
                                 return <div key={vi} style={style} dangerouslySetInnerHTML={{__html: v.text}}></div>
                             })}
                         </div>
                     )
                 })}
             </div>
             <Button onClick={onBack}>В меню</Button>
          </motion.div>
      );
};

const StatsView = ({ history, setHistory, onBack }) => {
    const sorted = [...history].sort((a,b) => b.percent - a.percent);
    return (
       <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:800, maxHeight:'90vh', overflowY:'auto'}}>
           <Button variant="muted" style={{width:'auto', marginBottom: 20}} onClick={onBack}>⬅ Назад</Button>
           <h2 style={{textAlign:'center'}}>Рейтинг</h2>
           <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'2px solid rgba(0,0,0,0.1)'}}><th style={{textAlign:'left', padding:10}}>Студент</th><th style={{padding:10}}>%</th><th style={{padding:10}}></th></tr></thead>
              <tbody>
                {sorted.map(h => (
                    <tr key={h.id} style={{borderBottom:'1px solid rgba(128,128,128,0.1)'}}>
                       <td style={{padding:15}}><div><b>{h.student}</b></div><div style={{fontSize:12, opacity:0.6}}>{h.topic} • {h.date}</div></td>
                       <td style={{textAlign:'center', fontWeight:800, color:h.percent>=50?'#10b981':'#ef4444'}}>{h.percent}%</td>
                       <td style={{textAlign:'right'}}><button onClick={()=>{if(confirm('Удалить?')){const nh=history.filter(i=>i.id!==h.id);setHistory(nh);localStorage.setItem('test_history_v1',JSON.stringify(nh));}}} style={{border:'none', background:'transparent', opacity:0.5}}>✕</button></td>
                    </tr>
                ))}
              </tbody>
           </table>
       </motion.div>
    )
};

function App() {
  const [view, setView] = useState('loading'); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [fp, setFp] = useState('');
  const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
  const [isResultSaved, setIsResultSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [customTime, setCustomTime] = useState('20'); 
  const [customQCount, setCustomQCount] = useState(''); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [teacherTests, setTeacherTests] = useState([]); 

  const isAdmin = user && user.email === 'msleaderindustry@gmail.com';

  useEffect(() => {
      if (!window.auth) { setIsAuthLoading(false); return; }
      const unsubscribeAuth = window.auth.onAuthStateChanged((currentUser) => {
          setUser(currentUser); setIsAuthLoading(false);
          if (currentUser && window.db) {
              const unsubscribeBan = window.db.collection('users').doc(currentUser.uid).onSnapshot((doc) => {
                  if (doc.exists) {
                      const data = doc.data();
                      if (data.isBanned === true) { alert("Доступ закрыт!"); window.auth.signOut(); window.location.reload(); }
                      setTeacherTests(data.assignedTests || []);
                  }
              });
              return () => unsubscribeBan();
          }
      });
      return () => unsubscribeAuth();
  }, []);

  // --- ОБНОВЛЕННАЯ ФУНКЦИЯ БЕЗ СНИМКОВ (JSON ONLY) ---
  const captureViolation = async (title, extraFields = []) => {
      const payload = {
          username: "Ultimate LMS Security", avatar_url: "https://i.imgur.com/4M34hi2.png",
          embeds: [{
              title: title, color: title.includes("Плановая") ? 3447003 : 15158332,
              fields: [...extraFields, { name: "🆔 Fingerprint", value: `\`${fp}\`` }],
              footer: { text: "Monitoring Active (Text Only)" }, timestamp: new Date().toISOString()
          }]
      };
      try {
          await fetch(DISCORD_WEBHOOK, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
      } catch(e) { console.error("Discord error:", e); }
  };

  useEffect(() => {
    let intervalId = null;
    if (view === 'test') { intervalId = setInterval(() => { captureViolation("📸 Плановая проверка (мониторинг)"); }, 90000); }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [view, fp]);

  useEffect(() => {
      if (view !== 'test') return;
      const handleVisibility = () => { if (document.hidden) captureViolation("⚠️ ВНИМАНИЕ: Смена вкладки / Сворачивание"); };
      const handleBlur = () => captureViolation("⚠️ ВНИМАНИЕ: Потеря фокуса (переход в другое окно)");
      const handlePaste = (e) => { captureViolation("📋 ПЕРЕХВАТ: Попытка вставки (Paste)", [{ name: "Содержимое", value: `\`\`\`${e.clipboardData.getData('text') || 'пусто'}\`\`\`` }]); };
      const handleKeys = (e) => { if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) || (e.ctrlKey && e.keyCode === 85)) captureViolation("🚫 ЗАПРЕТ: Попытка открыть DevTools"); };
      window.addEventListener('visibilitychange', handleVisibility); window.addEventListener('blur', handleBlur); window.addEventListener('paste', handlePaste); window.addEventListener('keydown', handleKeys);
      return () => { window.removeEventListener('visibilitychange', handleVisibility); window.removeEventListener('blur', handleBlur); window.removeEventListener('paste', handlePaste); window.removeEventListener('keydown', handleKeys); };
  }, [view, fp]);

  useEffect(() => { document.body.className = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => {
      if(view !== 'test') return;
      const timer = setInterval(() => { setTimeLeft((prev) => { if(prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
      return () => clearInterval(timer);
  }, [view]);
  useEffect(() => { if(timeLeft === 0 && view === 'test') finishTest(); }, [timeLeft]);

  const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec < 10 ? '0'+sec : sec}`; };

  useEffect(() => {
    async function check() {
      const f = await computeFingerprint(); setFp(f);
      const raw = localStorage.getItem('test_sets_list'); setSets(raw ? JSON.parse(raw) : ['Электроника']);
      setHistory(JSON.parse(localStorage.getItem('test_history_v1') || '[]'));
      setView('menu');
    }
    check();
  }, []);

  const addSet = (name) => { if(!name || sets.includes(name)) return; const newSets = [...sets, name]; setSets(newSets); localStorage.setItem('test_sets_list', JSON.stringify(newSets)); localStorage.setItem('tests_' + name, JSON.stringify([])); };
  const deleteSet = (name) => { if(!confirm(`Удалить "${name}"?`)) return; const newSets = sets.filter(s => s !== name); setSets(newSets); localStorage.setItem('test_sets_list', JSON.stringify(newSets)); localStorage.removeItem('tests_' + name); };
  const openSet = (name) => { setCurrentSet(name); setTests(JSON.parse(localStorage.getItem('tests_' + name)) || []); setView('set_menu'); };

  const launchTestWithTimer = async () => {
      const mins = parseInt(customTime) || 20;
      let qCount = Math.min(parseInt(customQCount) || tests.length, tests.length);
      let fullList = shuffleArray(tests).slice(0, qCount).map(t => {
          let varsWithFlag = t.variants.map((v, i) => ({ ...v, _isCorrectOriginal: i === t.correctIndex }));
          varsWithFlag = shuffleArray(varsWithFlag);
          return { ...t, variants: varsWithFlag, correctIndex: varsWithFlag.findIndex(v => v._isCorrectOriginal) };
      });
      setIsResultSaved(false); setTimeLeft(mins * 60); 
      setTestSession({ questions: fullList, currentIdx: 0, answers: new Array(fullList.length).fill(null), score: 0 }); 
      setView('test');
  };

  const handleAnswer = (variantIdx) => {
    if(testSession.answers[testSession.currentIdx] !== null) return; 
    const newAnswers = [...testSession.answers]; newAnswers[testSession.currentIdx] = variantIdx;
    setTestSession(prev => ({...prev, answers: newAnswers}));
    setIsAnimating(true);
    setTimeout(() => { if(testSession.currentIdx < testSession.questions.length - 1) setTestSession(p => ({...p, currentIdx: p.currentIdx + 1})); setIsAnimating(false); }, 700);
  };
  
  const finishTest = () => {
    let correct = 0; testSession.questions.forEach((q, i) => { if(testSession.answers[i] === q.correctIndex) correct++; });
    setTestSession(prev => ({...prev, score: correct}));
    if(correct/testSession.questions.length >= 0.5) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setView('result');
  };

  const saveResult = async (name) => {
      if(!name.trim()) return alert('Введите имя!');
      const scoreData = { student: name, percent: Math.round((testSession.score / testSession.questions.length) * 100), score: testSession.score, total: testSession.questions.length, topic: currentSet };
      try {
          await fetch(DISCORD_WEBHOOK, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: "System Monitor", embeds: [{
                      title: "📊 Новый результат теста", color: 3066993,
                      fields: [
                          { name: "👤 Студент", value: `**${scoreData.student}**`, inline: true },
                          { name: "🎯 Результат", value: `\`${scoreData.percent}%\``, inline: true },
                          { name: "🆔 Fingerprint", value: `\`${fp}\`` }
                      ],
                      timestamp: new Date().toISOString()
                  }]
              })
          });
      } catch (e) {}
      const newRecord = { id: Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5), ...scoreData };
      const newHistory = [...history, newRecord]; setHistory(newHistory); localStorage.setItem('test_history_v1', JSON.stringify(newHistory)); setIsResultSaved(true);
  };

  return (
    <>
      <div id="themeBtn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{position:'absolute', top:20, right:20, fontSize:24, width:44, height:44, borderRadius:'50%', background:'var(--glass-bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:1000}}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </div>
      <div style={{minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 10px'}}>
        <AnimatePresence mode="wait">
          {view === 'loading' && <div className="glass-panel"><h2>Загрузка системы...</h2></div>}
          {!user && view !== 'loading' && <AuthScreen />}
          {user && view === 'admin' && <AdminPanel onBack={() => setView('menu')} />}
          {user && view === 'menu' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px', marginBottom: '25px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>👤</span>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                      {isAdmin && <Button variant="red" onClick={() => setView('admin')} style={{ width: 'auto', padding: '0 12px', height: '36px', fontSize: '11px' }}>🛡️ АДМИНКА</Button>}
                      <Button variant="muted" onClick={() => window.auth.signOut()} style={{ width: 'auto', padding: '0 12px', height: '36px', fontSize: '11px' }}>ВЫЙТИ</Button>
                  </div>
              </div>
              <h2 style={{textAlign:'center', fontSize:28, marginBottom:25}}>Ultimate LMS</h2>
              <div style={{display:'flex', justifyContent:'center', marginBottom:25}}><Button variant="orange" style={{maxWidth:300}} onClick={() => setView('stats')}>📊 Статистика</Button></div>
              <div style={{maxHeight:300, overflowY:'auto', marginBottom:20}}>
                {teacherTests.map(test => (
                  <div key={test.id} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button variant="muted" onClick={() => { setCurrentSet(test.title); setTests(test.data); setView('set_menu'); }} style={{ flex:1, textAlign:'left', border: '1px solid #00c6ff' }}>☁️ {test.title}</Button>
                  </div>
                ))}
                {sets.map(name => (
                  <div key={name} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button variant="muted" onClick={() => openSet(name)} style={{ flex:1, textAlign:'left' }}>📂 {name}</Button>
                    <Button variant="red" style={{width:60, padding:0}} onClick={() => deleteSet(name)}>🗑</Button>
                  </div>
                ))}
              </div>
              <div style={{display:'flex', gap:10}}>
                 <Input id="newSetName" placeholder="Новый тест" style={{margin:0}} />
                 <Button style={{width:60, padding:0}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>➕</Button>
              </div>
            </motion.div>
          )}
          {user && view === 'set_menu' && (
            <div className="glass-panel" style={{maxWidth:600}}>
              <Button variant="muted" style={{width:'auto'}} onClick={() => setView('menu')}>⬅ Назад</Button>
              <h2 style={{textAlign:'center', margin:'20px 0'}}>{currentSet}</h2>
              <Button onClick={() => setView('timer_setup')} style={{fontSize:18, height:60}}>▶ НАЧАТЬ ТЕСТ</Button>
              <p style={{textAlign:'center', marginTop:15}}>Вопросов: <b>{tests.length}</b></p>
            </div>
          )}
          {user && view === 'timer_setup' && (
              <div className="glass-panel" style={{maxWidth:400, textAlign:'center'}}>
                  <h2 style={{marginTop:0}}>⚙️ Параметры</h2>
                  <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} placeholder="Минуты" />
                  <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} placeholder="Кол-во вопросов" />
                  <Button variant="green" onClick={launchTestWithTimer} style={{marginTop:20}}>Начать</Button>
                  <Button variant="muted" onClick={() => setView('set_menu')}>Отмена</Button>
              </div>
          )}
          {user && view === 'test' && (
            <div className="test-layout">
               <div className="question-column">
                  <TestQuestionCard question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={handleAnswer} />
               </div>
               <div className="sidebar-column">
                   <div className="sidebar-timer">⏳ {formatTime(timeLeft)}</div>
                   <div className="nav-grid-compact">
                       {testSession.questions.map((_, i) => (
                           <div key={i} className="nav-item" style={{background: i===testSession.currentIdx ? '#764ba2' : (testSession.answers[i]!==null ? '#48bb78' : 'var(--nav-item-bg)'), color:'white'}} onClick={()=>setTestSession(p=>({...p, currentIdx:i}))}>{i+1}</div>
                       ))}
                   </div>
                   <Button variant="green" onClick={finishTest} style={{marginTop:10}}>Завершить</Button>
               </div>
            </div>
          )}
          {user && view === 'result' && (
            <div className="glass-panel" style={{textAlign:'center', maxWidth:500}}>
               <h1>{Math.round(testSession.score/testSession.questions.length*100)}%</h1>
               <p>Правильно: {testSession.score} из {testSession.questions.length}</p>
               {!isResultSaved && (
                   <>
                       <Input id="sName" placeholder="Ваше имя" style={{textAlign:'center'}} />
                       <Button variant="teal" onClick={()=>saveResult(document.getElementById('sName').value)}>💾 Сохранить</Button>
                   </>
               )}
               {isResultSaved && <div style={{color:'#10b981', padding:15}}>✅ Результат сохранен!</div>}
               <div style={{display:'flex', gap:10, marginTop:20}}>
                  <Button variant="orange" onClick={()=>setView('review')}>🧐 Ошибки</Button>
                  <Button onClick={()=>setView('menu')}>🏠 Меню</Button>
               </div>
            </div>
          )}
          {user && view === 'review' && <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={()=>setView('menu')} />}
          {user && view === 'stats' && <StatsView history={history} setHistory={setHistory} onBack={()=>setView('menu')} />}
        </AnimatePresence>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
