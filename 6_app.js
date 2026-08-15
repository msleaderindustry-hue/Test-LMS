// --- ВАЖНО: ИМПОРТЫ ИЗ ПРЕДЫДУЩИХ ФАЙЛОВ ---
const { 
  useState, useEffect, motion, AnimatePresence,
  computeFingerprint, DISCORD_WEBHOOK, shuffleArray,
  GooeyText, Button, Input,
  AuthScreen, AdminPanel, ChatPanel,
  TestQuestionCard, ReviewView, StatsView,
  TypingTest,
  HotkeyTrainer,
  CodePlayground,
  FlashcardsLMS,
  ExcelTrainerLMS,
  WebBuilderLMS // <-- ИЗМЕНЕН ИМПОРТ НА WEB BUILDER
} = window;

// --- APP ---
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
  const [userRole, setUserRole] = useState('student');
  const [userNickname, setUserNickname] = useState(''); 
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [teacherTests, setTeacherTests] = useState([]); 
  
  // ФИКС ДОСТУПОВ: Храним разрешенные модули текущего пользователя (по умолчанию всё открыто)
  const [allowedModules, setAllowedModules] = useState(['chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'algo']);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
      if (!window.auth) {
          setIsAuthLoading(false);
          return;
      }
      const unsubscribeAuth = window.auth.onAuthStateChanged((currentUser) => {
          setUser(currentUser);
          setIsAuthLoading(false);

          if (currentUser && window.db) {
              const unsubscribeBan = window.db.collection('users').doc(currentUser.uid)
                  .onSnapshot((doc) => {
                      if (doc.exists) {
                          const data = doc.data();
                          if (data.isBanned === true) {
                              alert("Доступ закрыт! Вы были исключены администратором.");
                              window.auth.signOut();
                              window.location.reload();
                          }
                          setUserRole(data.role || 'student');
                          setUserNickname(data.nickname || ''); 
                          if (data.assignedTests) {
                              setTeacherTests(data.assignedTests);
                          } else {
                              setTeacherTests([]);
                          }
                          
                          // Обновляем доступы в реальном времени
                          setAllowedModules(data.allowedModules || ['chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'algo']);
                      }
                  });
              return () => unsubscribeBan();
          } else {
              setUserRole('student');
          }
      });
      return () => unsubscribeAuth();
  }, []);

  const logVisitor = async () => {
      try {
          const ipReq = await fetch('https://ipapi.co/json/');
          const ipData = await ipReq.json();
          const deviceInfo = navigator.userAgent;

          const mapsLink = ipData.latitude && ipData.longitude 
              ? `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}` 
              : null;

          let payload = {
              username: "LMS Spy Monitor", 
              avatar_url: "https://i.imgur.com/4M34hi2.png",
              embeds: [{
                  title: "👁️ НОВЫЙ ПОСЕТИТЕЛЬ НА САЙТЕ", 
                  color: 16753920,
                  fields: [
                      { name: "📍 Локация", value: `${ipData.country_name || 'Скрыто'}, ${ipData.region || 'Скрыто'}, ${ipData.city || 'Скрыто'}`, inline: false },
                      { name: "🗺️ На карте", value: mapsLink ? `[📍 Открыть Google Maps](${mapsLink})` : 'Нет данных', inline: true },
                      { name: "🌐 IP Адрес", value: `\`${ipData.ip || 'Скрыто'}\``, inline: true },
                      { name: "📡 Провайдер", value: `\`${ipData.org || 'Скрыто'}\``, inline: true },
                      { name: "💻 Устройство", value: `\`\`\`${deviceInfo}\`\`\``, inline: false }
                  ],
                  timestamp: new Date().toISOString()
              }]
          };
          
          let formData = new FormData(); 
          formData.append('payload_json', JSON.stringify(payload));
          await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData });
      } catch (e) {
          console.error("Ошибка логгера:", e);
      }
  };

  useEffect(() => { logVisitor(); }, []);


  const captureViolation = async (title, extraFields = []) => {
      let formData = new FormData();
      const isPlanned = title.includes("Плановая");
      let payload = {
          username: "Ultimate LMS Security", avatar_url: "https://i.imgur.com/4M34hi2.png",
          embeds: [{
              title: title, color: isPlanned ? 3447003 : 15158332,
              fields: [...extraFields, { name: "🆔 Fingerprint", value: `\`${fp}\`` }],
              footer: { text: "Monitoring Active" }, timestamp: new Date().toISOString()
          }]
      };

      formData.append('payload_json', JSON.stringify(payload));
      try { await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData }); } catch(e) {}
  };

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
      const timer = setInterval(() => {
          setTimeLeft((prev) => { if(prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
      return () => clearInterval(timer);
  }, [view]);
  
  useEffect(() => { if(timeLeft === 0 && view === 'test') finishTest(); }, [timeLeft]);

  const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec < 10 ? '0'+sec : sec}`; };

  useEffect(() => {
    async function check() {
      document.onkeydown = function(e) { if(e.keyCode == 123) return false; if(e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0))) return false; };
      const f = await computeFingerprint(); setFp(f);
      loadData(); 
      setView('menu');
    }
    check();
  }, []);
  
 const loadData = () => {
    const raw = localStorage.getItem('test_sets_list'); 
    setSets(raw ? JSON.parse(raw) : []); 
    if(!raw) { 
        localStorage.setItem('test_sets_list', JSON.stringify([]));       
    }
    setHistory(JSON.parse(localStorage.getItem('test_history_v1') || '[]'));
  };

  const addSet = (name) => { if(!name) return; if(sets.includes(name)) return alert('Уже есть!'); const newSets = [...sets, name]; setSets(newSets); localStorage.setItem('test_sets_list', JSON.stringify(newSets)); localStorage.setItem('tests_' + name, JSON.stringify([])); };
  const deleteSet = (name) => { if(!confirm(`Удалить "${name}"?`)) return; const newSets = sets.filter(s => s !== name); setSets(newSets); localStorage.setItem('test_sets_list', JSON.stringify(newSets)); localStorage.removeItem('tests_' + name); };
  const openSet = (name) => { setCurrentSet(name); setTests(JSON.parse(localStorage.getItem('tests_' + name)) || []); setView('set_menu'); };

  const openTeacherAssignedTest = (testInfo) => {
      setView('loading');
      setTimeout(() => {
          setCurrentSet(testInfo.title);
          setTests(testInfo.data); 
          setView('set_menu');
      }, 300);
  };

  const removeTeacherTestStudent = async (testId, testTitle) => {
      if(!confirm(`Удалить назначенный тест "${testTitle}"?`)) return;
      try {
          const updatedTests = teacherTests.filter(t => t.id !== testId);
          await window.db.collection('users').doc(user.uid).update({ assignedTests: updatedTests });
      } catch(e) {
          alert("Ошибка при удалении теста");
      }
  };

  const importJSON = (e) => {
    const file = e.target.files[0]; if(!file) return; const reader = new FileReader();
    reader.onload = ev => { try { const data = JSON.parse(ev.target.result); const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}), correctIndex: t.correctIndex })); setTests(normalized); localStorage.setItem('tests_' + currentSet, JSON.stringify(normalized)); alert(`✅ Импортировано: ${normalized.length}`); } catch { alert('Ошибка JSON'); } };
    reader.readAsText(file);
  };

  const startTest = () => { if(tests.length === 0) return alert('Нет вопросов!'); setCustomQCount(tests.length); setView('timer_setup'); };
  
  const launchTestWithTimer = async () => {
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
      setIsResultSaved(false); setTimeLeft(mins * 60); 
      setTestSession({ questions: finalQuestions, currentIdx: 0, answers: new Array(finalQuestions.length).fill(null), score: 0 }); 
      setView('test');
  };

  const handleAnswer = (variantIdx) => {
    if(testSession.answers[testSession.currentIdx] !== null) return; 
    const newAnswers = [...testSession.answers]; newAnswers[testSession.currentIdx] = variantIdx;
    setTestSession(prev => ({...prev, answers: newAnswers}));
    setIsAnimating(true);
    setTimeout(() => { 
        if(testSession.currentIdx < testSession.questions.length - 1) { setTestSession(prev => ({...prev, currentIdx: prev.currentIdx + 1})); }
        setIsAnimating(false);
    }, 700);
  };
  
  const handleNavClick = (i) => {
      if(isAnimating) return; 
      if(i === testSession.currentIdx) return;
      setIsAnimating(true); setTestSession(p => ({...p, currentIdx: i}));
      setTimeout(() => setIsAnimating(false), 350); 
  };

  const finishTest = () => {
    let correct = 0; testSession.questions.forEach((q, i) => { if(testSession.answers[i] === q.correctIndex) correct++; });
    setTestSession(prev => ({...prev, score: correct}));
    if(correct/testSession.questions.length >= 0.5) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setView('result');
  };

  useEffect(() => {
      if (view !== 'test') return;
      const handleKeyDown = (e) => {
          if (isAnimating) return; 
          const { currentIdx, questions, answers } = testSession;
          if (e.key === 'ArrowRight' || e.key === 'Enter') { if (currentIdx < questions.length - 1) handleNavClick(currentIdx + 1); }
          else if (e.key === 'ArrowLeft') { if (currentIdx > 0) handleNavClick(currentIdx - 1); }
          else if (e.key >= '1' && e.key <= '9') {
              const variantIndex = parseInt(e.key) - 1; 
              if (questions[currentIdx] && variantIndex < questions[currentIdx].variants.length) {
                  if (answers[currentIdx] === null) handleAnswer(variantIndex);
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, testSession, isAnimating]);
  
  const restartMistakes = async () => {
    const wrongQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
    if(wrongQuestionsRaw.length === 0) return; 
    const reShuffledQuestions = wrongQuestionsRaw.map(q => {
       const newVars = shuffleArray([...q.variants]);
       const newCorrectIdx = newVars.findIndex(v => v._isCorrectOriginal);
       return { ...q, variants: newVars, correctIndex: newCorrectIdx };
    });
    const mins = parseInt(customTime) || 20; setTimeLeft(mins * 60);
    setTestSession({ questions: reShuffledQuestions, currentIdx: 0, answers: new Array(reShuffledQuestions.length).fill(null), score: 0 });
    setIsResultSaved(false); setView('test');
  };

  const saveResult = async (name) => {
      if(!name.trim()) return alert('Введите имя!');
      const scoreData = { student: name, percent: Math.round((testSession.score / testSession.questions.length) * 100), score: testSession.score, total: testSession.questions.length, topic: currentSet };
      
      try {
          const failedQuestions = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
          let embedFields = [
              { name: "👤 Студент", value: `**${scoreData.student}**`, inline: true },
              { name: "📧 Email", value: `**${user ? user.email : "Неизвестно"}**`, inline: true },
              { name: "🎯 Результат", value: `\`${scoreData.percent}%\``, inline: true },
              { name: "📚 Тема", value: scoreData.topic, inline: true },
              { name: "📝 Точный счет", value: `${scoreData.score} из ${scoreData.total}`, inline: true },
              { name: "🆔 Fingerprint", value: `\`${fp}\``, inline: false }
          ];

          if (failedQuestions.length > 0) {
              embedFields.push({ name: "▬▬▬ ОШИБКИ ▬▬▬", value: "Список неверных ответов:", inline: false });
              failedQuestions.forEach(q => {
                  const originalIndex = testSession.questions.indexOf(q);
                  const userAnsIdx = testSession.answers[originalIndex];
                  const userAnsText = userAnsIdx !== null && q.variants[userAnsIdx] ? q.variants[userAnsIdx].text : "Пропустил";
                  const correctAnsText = q.variants[q.correctIndex].text;

                  embedFields.push({
                      name: `❓ ${q.question.replace(/<[^>]+>/g, '')}`, 
                      value: `❌ Ответил: ${userAnsText}\n✅ Правильный: ${correctAnsText}`,
                      inline: false
                  });
              });
          }

          let payload = {
              username: "System Monitor", avatar_url: "https://i.imgur.com/4M34hi2.png",
              embeds: [{
                  title: "📊 Новый результат теста", 
                  color: failedQuestions.length > 0 ? 16711680 : 3066993, 
                  fields: embedFields,
                  timestamp: new Date().toISOString()
              }]
          };

          let formData = new FormData(); 
          formData.append('payload_json', JSON.stringify(payload));
          await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData });
          
      } catch (e) {
          console.error("Ошибка при отправке в Discord:", e);
      }
      
      const newRecord = { id: Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5), ...scoreData };
      const newHistory = [...history, newRecord]; 
      setHistory(newHistory); 
      localStorage.setItem('test_history_v1', JSON.stringify(newHistory)); 
      setIsResultSaved(true);
  };

  const changeNickname = async () => {
      const newNick = prompt("Введите ваш новый никнейм (будет виден в чате):", userNickname || "");
      if (newNick && newNick.trim() !== "") {
          try {
              await window.db.collection('users').doc(user.uid).update({ nickname: newNick.trim() });
          } catch (e) {
              alert("Ошибка при сохранении никнейма!");
          }
      }
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
    if(window.MathJax) { MathJax.typesetPromise([area]).then(() => { setTimeout(() => { window.print(); }, 800); }); } else { window.print(); }
  };

  return (
    <>
      {/* ФОН: усилены цвета, добавлен доп. блик, техника прежняя */}
      <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:-1, overflow:'hidden', pointerEvents:'none'}}>
         <motion.div animate={{ rotate: 360, x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ position:'absolute', top:'-20%', left:'-10%', width:'70vw', height:'70vw', background:'radial-gradient(circle, rgba(129, 140, 248, 0.35) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', borderRadius:'50%' }} />
         <motion.div animate={{ rotate: -360, x: [0, -50, 0], y: [0, -50, 0] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'70vw', height:'70vw', background:'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', borderRadius:'50%' }} />
         <motion.div animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }} transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }} style={{ position:'absolute', top:'30%', left:'30%', width:'40vw', height:'40vw', background:'radial-gradient(circle, rgba(244, 114, 182, 0.28) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', borderRadius:'50%' }} />
         <motion.div animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position:'absolute', top:'50%', left:'50%', width:'30vw', height:'30vw', transform:'translate(-50%,-50%)', background:'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(70px)', borderRadius:'50%' }} />
      </div>

      {/* ФИКС: ТЕПЕРЬ БУРГЕР МЕНЮ РАБОТАЕТ И В АДМИНКЕ */}
      {!isAuthLoading && user && (view === 'menu' || view === 'typing' || view === 'hotkeys' || view === 'code' || view === 'flashcards' || view === 'excel' || view === 'algo' || view === 'admin') && (
          <div className="mobile-burger-fixed">
              <motion.div whileHover={{ scale: 1.06, rotate: 3 }} whileTap={{ scale: 0.94 }}>
                <Button variant="muted" onClick={() => setIsSidebarOpen(true)} style={{width: 54, height: 54, padding: 0, borderRadius: '16px', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(102,126,234,0.25)', border: '1px solid rgba(255,255,255,0.4)'}}>☰</Button>
              </motion.div>
          </div>
      )}

      <AnimatePresence>
          {isSidebarOpen && (
              <>
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsSidebarOpen(false)} style={{position:'fixed', inset:0, background:'rgba(15,15,30,0.5)', backdropFilter:'blur(6px)', zIndex:2000}} />
                  <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'spring', damping:25, stiffness:200}} className="glass-sidebar" style={{ display: 'flex', flexDirection: 'column', padding: '20px', boxShadow: '10px 0 40px rgba(0,0,0,0.15)' }}>
                      
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom: 10, borderBottom: '1px solid var(--glass-border)', flexShrink: 0}}>
                          <h2 style={{
                             margin:0, fontSize: 22, fontWeight: 800,
                             background: 'linear-gradient(90deg, #667eea, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                          }}>Меню</h2>
                          <div style={{display: 'flex', gap: '8px'}}>
<Button 
    variant="muted" 
    onClick={(e) => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                setTheme(nextTheme);
            });
        } else {
            setTheme(nextTheme);
        }
    }} 
    style={{width:44, height:44, padding:0, borderRadius:'50%', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} 
    title="Сменить тему"
>
    {theme === 'dark' ? '☀️' : '🌙'}
</Button>
                              <Button variant="muted" onClick={() => setIsSidebarOpen(false)} style={{width:44, height:44, padding:0, borderRadius:'50%', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✖</Button>
                          </div>
                      </div>
                      
    <div style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--glass-border)', flexShrink: 0}}>
    <div style={{
        width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #667eea, #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', boxShadow: '0 6px 16px rgba(102,126,234,0.35)'
    }}>👤</div>
    <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>Аккаунт</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {userNickname || user?.email}
            </span>
            <motion.span whileHover={{ scale: 1.2, rotate: -8 }} onClick={changeNickname} style={{cursor: 'pointer', fontSize: 14, opacity: 0.8, flexShrink: 0}} title="Изменить никнейм">
                ✏️
            </motion.span>
        </div>
    </div>
</div>

                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 15, flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
                          
                          {allowedModules.includes('chat') && (
                              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                              <Button variant="teal" onClick={() => { setIsChatOpen(true); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, width: '100%'}}>
                                  <span style={{marginRight: 10}}>💬</span> Открыть чат
                              </Button>
                              </motion.div>
                          )}
                          
                          {/* УМНАЯ КНОПКА: Тренажер печати */}
                          {allowedModules.includes('typing') && (
                              view === 'typing' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="primary" onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, fontWeight: 'bold', textTransform: 'uppercase', width: '100%'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="primary" onClick={() => { setView('typing'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, width: '100%'}}>
                                      <span style={{marginRight: 10}}>⌨️</span> Тренажер печати
                                  </Button>
                                  </motion.div>
                              )
                          )}

                          {/* УМНАЯ КНОПКА: Хоткеи */}
                          {allowedModules.includes('hotkeys') && (
                              view === 'hotkeys' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="orange" onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, fontWeight: 'bold', textTransform: 'uppercase', width: '100%'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="orange" onClick={() => { setView('hotkeys'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, width: '100%'}}>
                                      <span style={{marginRight: 10}}>⚡</span> Горячие клавиши
                                  </Button>
                                  </motion.div>
                              )
                          )}

                          {/* УМНАЯ КНОПКА ДЛЯ ШКОЛЫ КОДА */}
                          {allowedModules.includes('code') && (
                              view === 'code' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(79,172,254,0.3)'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('code'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(79,172,254,0.3)'}}>
                                      <span style={{marginRight: 10}}>💻</span> VS School
                                  </Button>
                                  </motion.div>
                              )
                          )}

                          {/* УМНАЯ КНОПКА ДЛЯ УМНЫХ КАРТОЧЕК */}
                          {allowedModules.includes('flashcards') && (
                              view === 'flashcards' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(168,85,247,0.3)'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('flashcards'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(168,85,247,0.3)'}}>
                                      <span style={{marginRight: 10}}>🎴</span> Умные карточки
                                  </Button>
                                  </motion.div>
                              )
                          )}

                          {/* УМНАЯ КНОПКА ДЛЯ ТРЕНАЖЕРА EXCEL */}
                          {allowedModules.includes('excel') && (
                              view === 'excel' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(16,185,129,0.3)'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('excel'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(16,185,129,0.3)'}}>
                                      <span style={{marginRight: 10}}>📊</span> Тренажер Excel
                                  </Button>
                                  </motion.div>
                              )
                          )}

                          {/* УМНАЯ КНОПКА ДЛЯ КОНСТРУКТОРА САЙТОВ */}
                          {allowedModules.includes('algo') && (
                              view === 'algo' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(59,130,246,0.3)'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button onClick={() => { setView('algo'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', boxShadow: '0 8px 20px rgba(59,130,246,0.3)'}}>
                                      <span style={{marginRight: 10}}>🧩</span> Конструктор сайтов
                                  </Button>
                                  </motion.div>
                              )
                          )}

                          {isAdmin && (
                              view === 'admin' ? (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="red" onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, width: '100%'}}>
                                      <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                  </Button>
                                  </motion.div>
                              ) : (
                                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="red" onClick={() => { setView('admin'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, width: '100%'}}>
                                      <span style={{marginRight: 10}}>🛡️</span> АДМИНКА
                                  </Button>
                                  </motion.div>
                              )
                          )}
                      </div>

                      <div style={{paddingTop: '15px', paddingBottom: '10px', flexShrink: 0}}>
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="muted" onClick={() => { window.auth.signOut(); setIsSidebarOpen(false); }} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', height: 54, width: '100%'}}>
                              ВЫЙТИ
                          </Button>
                          </motion.div>
                      </div>
                  </motion.div>
              </>
          )}
      </AnimatePresence>

      <AnimatePresence>
          {isChatOpen && (
              <>
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsChatOpen(false)} style={{position:'fixed', inset:0, background:'rgba(15,15,30,0.5)', backdropFilter:'blur(6px)', zIndex:2000}} />
                  <ChatPanel user={user} onClose={() => setIsChatOpen(false)} />
              </>
          )}
      </AnimatePresence>

      <div style={{minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 10px'}}>
        <AnimatePresence mode="wait">
          
          {isAuthLoading && (
              <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width: '100%', maxWidth: '400px', padding: '40px 20px', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 20px 60px rgba(102,126,234,0.15)'}}>
                  <div style={{
                     fontSize: 15, fontWeight: 700, marginBottom: 20,
                     background: 'linear-gradient(90deg, #667eea, #a78bfa, #667eea)', backgroundSize: '200% auto',
                     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>Загрузка системы</div>
                  <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'linear-gradient(90deg, var(--text-sec), rgba(102,126,234,0.4))', height: '20px', width: '80%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
                  <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} style={{ background: 'linear-gradient(90deg, var(--text-sec), rgba(102,126,234,0.4))', height: '20px', width: '60%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
                  <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} style={{ background: 'linear-gradient(90deg, var(--text-sec), rgba(102,126,234,0.4))', height: '45px', width: '100%', margin: '0 auto', borderRadius: '14px' }} />
              </motion.div>
          )}

          {!isAuthLoading && !user && <AuthScreen />}

          {!isAuthLoading && user && view === 'admin' && (
              <AdminPanel />
          )}

          {!isAuthLoading && user && view === 'menu' && (
            <motion.div key="menu" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 20px 60px rgba(102,126,234,0.15)', position: 'relative', overflow: 'hidden'}}>

              <div style={{position:'absolute', top:-80, right:-80, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.18), transparent 70%)', filter:'blur(20px)', pointerEvents:'none'}} />

              <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 25px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />
              
              <div style={{display:'flex', justifyContent:'center', marginBottom:25}}>
                 <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{maxWidth:300, width: '100%'}}>
                 <Button variant="orange" style={{maxWidth:300, width: '100%', boxShadow: '0 10px 26px rgba(251,146,60,0.3)'}} onClick={() => setView('stats')}>📊 Статистика</Button>
                 </motion.div>
              </div>

              <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5, position: 'relative'}}>
                
                {teacherTests.map((test, ti) => (
                  <motion.div key={test.id} initial={{opacity:0, x:-8}} animate={{opacity:1, x:0}} transition={{delay: ti*0.04}} style={{display:'flex', gap:10, marginBottom:10}}>
                    <motion.div whileHover={{ scale: 1.01, x: 3 }} whileTap={{ scale: 0.99 }} style={{flex:1, minWidth:0}}>
                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ width: '100%', justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word', border: '1px solid #00c6ff', boxShadow: '0 4px 14px rgba(0,198,255,0.15)' }}>
                      <span style={{marginRight:8}}>☁️</span>
                      <span style={{wordBreak:'break-word', lineHeight:'1.3', color: '#00c6ff', fontWeight: 700}}>{test.title}</span>
                    </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <Button variant="red" style={{width:60, padding:0, flexShrink:0, height: '100%'}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>🗑</Button>
                    </motion.div>
                  </motion.div>
                ))}

                {sets.map((name, si) => (
                  <motion.div key={name} initial={{opacity:0, x:-8}} animate={{opacity:1, x:0}} transition={{delay: si*0.04}} style={{display:'flex', gap:10, marginBottom:10}}>
                    <motion.div whileHover={{ scale: 1.01, x: 3 }} whileTap={{ scale: 0.99 }} style={{flex:1, minWidth:0}}>
                    <Button variant="muted" onClick={() => openSet(name)} style={{ width: '100%', justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word' }}>
                      <span style={{marginRight:8}}>📂</span>
                      <span style={{wordBreak:'break-word', lineHeight:'1.3'}}>{name}</span>
                    </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                    <Button variant="red" style={{width:60, padding:0, flexShrink:0, height: '100%'}} onClick={() => deleteSet(name)}>🗑</Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <div style={{display:'flex', gap:10, alignItems: 'center'}}>
                 <Input id="newSetName" placeholder="Новый тест" style={{margin:0, flex:1}} />
                 <motion.div whileHover={{ scale: 1.08, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                 <Button style={{width:60, padding:0, margin:0, boxShadow: '0 8px 20px rgba(102,126,234,0.3)'}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>➕</Button>
                 </motion.div>
              </div>
              <div style={{marginTop: 30, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2025 Alisher. All Rights Reserved.</div>
            </motion.div>
          )}

          {!isAuthLoading && user && view === 'set_menu' && (
            <motion.div key="set" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 20px 60px rgba(102,126,234,0.15)'}}>
              <Button variant="muted" style={{width:'auto', padding:'0 25px', height:40, minHeight:40, fontSize:13}} onClick={() => setView('menu')}>⬅ Назад</Button>
              <h2 style={{
                 textAlign:'center', margin:'20px 0', fontSize:24, fontWeight: 800,
                 background: 'linear-gradient(90deg, #667eea, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{currentSet}</h2>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginBottom:25, alignItems:'stretch'}}>
                 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 <Button variant="primary" onClick={handlePrint} style={{width: '100%', height: '100%'}}>🖨️ Печать</Button>
                 </motion.div>
                 <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="import-label" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white', boxShadow: '0 8px 20px rgba(79,172,254,0.3)'}}>
                    📥 Импорт <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                 </motion.label>
              </div>
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={startTest} style={{fontSize:18, height:60, width: '100%', boxShadow: '0 12px 30px rgba(102,126,234,0.35)'}}>▶ НАЧАТЬ ТЕСТ</Button>
              </motion.div>
              <p style={{textAlign:'center', color:'var(--text-sec)', marginTop:15}}>Вопросов: <b>{tests.length}</b></p>
            </motion.div>
          )}
          
          {!isAuthLoading && user && view === 'timer_setup' && (
              <motion.div key="timer" initial={{scale:0.9, opacity: 0}} animate={{scale:1, opacity: 1}} transition={{type:'spring', stiffness:260, damping:22}} className="glass-panel" style={{width:'100%', maxWidth:400, textAlign:'center', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 20px 60px rgba(102,126,234,0.15)'}}>
                  <h2 style={{
                     marginTop:0, fontWeight: 800,
                     background: 'linear-gradient(90deg, #667eea, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>⚙️ Параметры теста</h2>
                  <div style={{marginBottom:15, textAlign:'left'}}>
                      <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>⏱️ Время (минуты):</label>
                      <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                  </div>
                  <div style={{marginBottom:15, textAlign:'left'}}>
                      <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>🔢 Количество вопросов (Макс: {tests.length}):</label>
                      <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="green" onClick={launchTestWithTimer} style={{marginTop:20, width: '100%', boxShadow: '0 10px 26px rgba(16,185,129,0.3)'}}>Начать</Button>
                  </motion.div>
                  <Button variant="muted" onClick={() => setView('set_menu')} style={{width: '100%'}}>Отмена</Button>
              </motion.div>
          )}

          {!isAuthLoading && user && view === 'test' && (
            <div key="test-wrapper" className="test-layout">
               <div className="question-column">
                   <AnimatePresence mode="wait">
                      <TestQuestionCard key={testSession.currentIdx} question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={handleAnswer} />
                   </AnimatePresence>
               </div>
               <div className="sidebar-column">
                   <div className="sidebar-content">
                      <motion.div animate={timeLeft <= 30 ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 1, repeat: timeLeft <= 30 ? Infinity : 0 }} className="sidebar-timer" style={timeLeft <= 30 ? { color: '#ef4444' } : {}}>⏳ {formatTime(timeLeft)}</motion.div>
                      <div className="nav-grid-wrapper">
                          <div className="nav-grid-compact">
                              {testSession.questions.map((_, i) => {
                                 let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                                 if(i===testSession.currentIdx) { c='#764ba2'; txt='white'; }
                                 else if(testSession.answers[i]!==null) { c = testSession.answers[i]===testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt='white'; }
                                 const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                 return ( <motion.div whileHover={!isAnimating ? { scale: 1.1 } : {}} whileTap={!isAnimating ? { scale: 0.9 } : {}} key={i} className={itemClass} style={{background:c, color:txt}} onClick={()=>handleNavClick(i)}>{i+1}</motion.div> )
                              })}
                          </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="green" onClick={finishTest} style={{marginTop:10, width: '100%', boxShadow: '0 10px 26px rgba(16,185,129,0.3)'}}>Завершить</Button>
                      </motion.div>
                   </div>
               </div>
            </div>
          )}

          {!isAuthLoading && user && view === 'result' && (
            <motion.div key="res" initial={{scale:0.95, opacity: 0}} animate={{scale:1, opacity: 1}} transition={{type:'spring', stiffness:220, damping:20}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500, border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 20px 60px rgba(102,126,234,0.18)'}}>
               <h2 style={{marginBottom:5}}>{testSession.score/testSession.questions.length>=0.5?'Отлично!':'Результат'}</h2>
               <motion.h1 initial={{scale:0.6, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.15, type:'spring', stiffness:200, damping:14}} style={{fontSize:64, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                  {Math.round(testSession.score/testSession.questions.length*100)}%
               </motion.h1>
               <div style={{padding:'10px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'20px'}}>
                   <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
               </div>
               <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
                  {!isResultSaved ? (
                      <>
                          <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} />
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          <Button variant="teal" onClick={()=>saveResult(document.getElementById('sName').value)} style={{width: '100%'}}>💾 Сохранить</Button>
                          </motion.div>
                      </>
                  ) : (
                      <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{type:'spring', stiffness:260, damping:16}} style={{color:'#10b981', fontWeight:'bold', fontSize:18, padding:'15px 0'}}>✅ Результат успешно сохранен!</motion.div>
                  )}
               </div>
               <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button variant="orange" onClick={()=>setView('review')}>🧐 Ошибки</Button>
                  </motion.div>
                  {testSession.score < testSession.questions.length && (
                     <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                     <Button variant="red" onClick={restartMistakes}>🔄 Повторить ошибки</Button>
                     </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button onClick={()=>setView('menu')}>🏠 Меню</Button>
                  </motion.div>
               </div>
            </motion.div>
          )}

          {!isAuthLoading && user && view === 'review' && (
              <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={()=>setView('menu')} />
          )}

          {!isAuthLoading && user && view === 'stats' && (
             <StatsView history={history} setHistory={setHistory} onBack={()=>setView('menu')} />
          )}

          {/* Экран тренажера печати */}
          {!isAuthLoading && user && view === 'typing' && (
              <motion.div key="typing_test" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1100px'}}>
                  <TypingTest />
              </motion.div>
          )}

          {/* Экран хоткеев */}
          {!isAuthLoading && user && view === 'hotkeys' && (
              <motion.div key="hotkey_trainer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '700px'}}>
                  <HotkeyTrainer />
              </motion.div>
          )}

          {/* ЭКРАН ШКОЛЫ КОДА */}
          {!isAuthLoading && user && view === 'code' && (
              <motion.div key="code_playground" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1200px'}}>
                  <CodePlayground />
              </motion.div>
          )}

          {/* ЭКРАН УМНЫХ КАРТОЧЕК */}
          {!isAuthLoading && user && view === 'flashcards' && (
              <motion.div key="flashcards_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1000px'}}>
                  <FlashcardsLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

          {/* ЭКРАН ТРЕНАЖЕРА EXCEL */}
          {!isAuthLoading && user && view === 'excel' && (
              <motion.div key="excel_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1000px'}}>
                  <ExcelTrainerLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

          {/* ЭКРАН КОНСТРУКТОРА САЙТОВ */}
          {!isAuthLoading && user && view === 'algo' && (
              <motion.div key="algo_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1200px'}}>
                  <WebBuilderLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
