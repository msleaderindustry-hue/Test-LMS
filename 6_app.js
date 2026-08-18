// --- 6_app.js ---
// --- ВАЖНО: ИМПОРТЫ ИЗ ПРЕДЫДУЩИХ ФАЙЛОВ ---
const { 
  useState, useEffect, motion, AnimatePresence,
  computeFingerprint, DISCORD_WEBHOOK, shuffleArray,
  GooeyText, Button, Input,
  AuthScreen, AdminPanel, ChatPanel,
  TestQuestionCard, ReviewView, StatsView,
  TypingTest, HotkeyTrainer, CodePlayground, FlashcardsLMS, ExcelTrainerLMS, WebBuilderLMS,
  // --- ИМПОРТ НАШИХ ВЫДЕЛЕННЫХ КОМПОНЕНТОВ ---
  LandingView, LoadingView, MainMenu, SetMenu, TimerSetup, ActiveTestView, TestResultView
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
  
  // ФИКС ДОСТУПОВ
  const [allowedModules, setAllowedModules] = useState(['chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'algo']);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- НОВЫЙ СТЕЙТ: показывать форму входа поверх лендинга ---
  const [showAuth, setShowAuth] = useState(false);

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

  // --- ЛОГИКА АНТИЧИТА (осталась на своем месте) ---
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

  // --- ТАЙМЕР (остался на своем месте) ---
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
      const f = await computeFingerprint(); 
      setFp(f);
      loadData(); 
      
      // Искусственная задержка в 1.5 секунды (1500 мс), чтобы экран загрузки точно был виден
      setTimeout(() => {
          setView('menu');
      }, 1500);
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

  // --- УПРАВЛЕНИЕ КЛАВИАТУРОЙ ВО ВРЕМЯ ТЕСТА (осталось на своем месте) ---
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
      <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:-1, overflow:'hidden', pointerEvents:'none'}}>
         <motion.div animate={{ rotate: 360, x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ position:'absolute', top:'-20%', left:'-10%', width:'70vw', height:'70vw', background:'radial-gradient(circle, rgba(224, 195, 252, 0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', borderRadius:'50%' }} />
         <motion.div animate={{ rotate: -360, x: [0, -50, 0], y: [0, -50, 0] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'70vw', height:'70vw', background:'radial-gradient(circle, rgba(142, 197, 252, 0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', borderRadius:'50%' }} />
         <motion.div animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }} transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }} style={{ position:'absolute', top:'30%', left:'30%', width:'40vw', height:'40vw', background:'radial-gradient(circle, rgba(251, 194, 235, 0.3) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', borderRadius:'50%' }} />
      </div>

      {!isAuthLoading && user && (view === 'menu' || view === 'typing' || view === 'hotkeys' || view === 'code' || view === 'flashcards' || view === 'excel' || view === 'algo' || view === 'admin') && (
          <div className="mobile-burger-fixed">
              <Button variant="muted" onClick={() => setIsSidebarOpen(true)} style={{width: 54, height: 54, padding: 0, borderRadius: '16px', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>☰</Button>
          </div>
      )}

      <AnimatePresence>
          {isSidebarOpen && (
              <>
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsSidebarOpen(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(5px)', zIndex:2000}} />
                  <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'spring', damping:25, stiffness:200}} className="glass-sidebar" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                      
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom: 10, borderBottom: '1px solid var(--glass-border)', flexShrink: 0}}>
                          <h2 style={{margin:0, fontSize: 22}}>Меню</h2>
                          <div style={{display: 'flex', gap: '8px'}}>
                              <Button variant="muted" onClick={(e) => { const nextTheme = theme === 'dark' ? 'light' : 'dark'; if (document.startViewTransition) { document.startViewTransition(() => { setTheme(nextTheme); }); } else { setTheme(nextTheme); } }} style={{width:44, height:44, padding:0, borderRadius:'50%', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} title="Сменить тему">
                                  {theme === 'dark' ? '☀️' : '🌙'}
                              </Button>
                              <Button variant="muted" onClick={() => setIsSidebarOpen(false)} style={{width:44, height:44, padding:0, borderRadius:'50%', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✖</Button>
                          </div>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--glass-border)', flexShrink: 0}}>
                          <span style={{ fontSize: '30px' }}>👤</span>
                          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Аккаунт</div>
                              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{userNickname || user?.email}</span>
                                  <span onClick={changeNickname} style={{cursor: 'pointer', fontSize: 14, opacity: 0.8, flexShrink: 0}} title="Изменить никнейм">✏️</span>
                              </div>
                          </div>
                      </div>

                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 15, flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
                          {allowedModules.includes('chat') && (
                              <Button variant="teal" onClick={() => { setIsChatOpen(true); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}>
                                  <span style={{marginRight: 10}}>💬</span> Открыть чат
                              </Button>
                          )}
                          
                          {allowedModules.includes('typing') && (
                              view === 'typing' ? (
                                  <Button variant="primary" onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button variant="primary" onClick={() => { setView('typing'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}><span style={{marginRight: 10}}>⌨️</span> Тренажер печати</Button>
                              )
                          )}

                          {allowedModules.includes('hotkeys') && (
                              view === 'hotkeys' ? (
                                  <Button variant="orange" onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button variant="orange" onClick={() => { setView('hotkeys'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}><span style={{marginRight: 10}}>⚡</span> Горячие клавиши</Button>
                              )
                          )}

                          {allowedModules.includes('code') && (
                              view === 'code' ? (
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button onClick={() => { setView('code'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>💻</span> VS School</Button>
                              )
                          )}

                          {allowedModules.includes('flashcards') && (
                              view === 'flashcards' ? (
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button onClick={() => { setView('flashcards'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>🎴</span> Умные карточки</Button>
                              )
                          )}

                          {allowedModules.includes('excel') && (
                              view === 'excel' ? (
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button onClick={() => { setView('excel'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>📊</span> Тренажер Excel</Button>
                              )
                          )}

                          {allowedModules.includes('algo') && (
                              view === 'algo' ? (
                                  <Button onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button onClick={() => { setView('algo'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}><span style={{marginRight: 10}}>🧩</span> Конструктор сайтов</Button>
                              )
                          )}

                          {isAdmin && (
                              view === 'admin' ? (
                                  <Button variant="red" onClick={() => { setView('menu'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}><span style={{marginRight: 10}}>⬅</span> В МЕНЮ</Button>
                              ) : (
                                  <Button variant="red" onClick={() => { setView('admin'); setIsSidebarOpen(false); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}><span style={{marginRight: 10}}>🛡️</span> АДМИНКА</Button>
                              )
                          )}
                      </div>

                      <div style={{paddingTop: '15px', paddingBottom: '10px', flexShrink: 0}}>
                          <Button variant="muted" onClick={() => { window.auth.signOut(); setIsSidebarOpen(false); }} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', height: 54}}>ВЫЙТИ</Button>
                      </div>
                  </motion.div>
              </>
          )}
      </AnimatePresence>

      <AnimatePresence>
          {isChatOpen && (
              <>
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsChatOpen(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(5px)', zIndex:2000}} />
                  <ChatPanel user={user} onClose={() => setIsChatOpen(false)} />
              </>
          )}
      </AnimatePresence>

      <div style={{minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 10px'}}>
        <AnimatePresence mode="wait">
          
          {/* --- ИСПОЛЬЗУЕМ НАШИ ВЫДЕЛЕННЫЕ КОМПОНЕНТЫ СО ВСЕМИ ПРОПСАМИ ИЗ ОРИГИНАЛА --- */}
          {isAuthLoading && <LoadingView key="loading" />}

          {/* Лендинг: показывается неавторизованным до нажатия "Вход / Регистрация" */}
          {!isAuthLoading && !user && !showAuth && (
              <LandingView key="landing" onLogin={() => setShowAuth(true)} />
          )}

          {/* Форма входа: открывается только после клика на лендинге, с кнопкой "Назад" */}
          {!isAuthLoading && !user && showAuth && (
              <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 15 }}
              >
                  <Button
                      variant="muted"
                      onClick={() => setShowAuth(false)}
                      style={{ width: 'auto', alignSelf: 'flex-start', padding: '0 25px', height: 40, minHeight: 40, fontSize: 13 }}
                  >
                      ⬅ Назад
                  </Button>
                  <AuthScreen />
              </motion.div>
          )}

          {!isAuthLoading && user && view === 'admin' && <AdminPanel key="admin" />}

          {!isAuthLoading && user && view === 'menu' && (
              <MainMenu 
                  key="menu"
                  setView={setView} 
                  teacherTests={teacherTests} 
                  openTeacherAssignedTest={openTeacherAssignedTest} 
                  removeTeacherTestStudent={removeTeacherTestStudent} 
                  sets={sets} 
                  openSet={openSet} 
                  deleteSet={deleteSet} 
                  addSet={addSet} 
              />
          )}

          {!isAuthLoading && user && view === 'set_menu' && (
              <SetMenu 
                  key="set_menu"
                  setView={setView} 
                  currentSet={currentSet} 
                  handlePrint={handlePrint} 
                  importJSON={importJSON} 
                  startTest={startTest} 
                  testsLength={tests.length} 
              />
          )}
          
          {!isAuthLoading && user && view === 'timer_setup' && (
              <TimerSetup 
                  key="timer_setup"
                  customTime={customTime} 
                  setCustomTime={setCustomTime} 
                  customQCount={customQCount} 
                  setCustomQCount={setCustomQCount} 
                  testsLength={tests.length} 
                  launchTestWithTimer={launchTestWithTimer} 
                  setView={setView} 
              />
          )}

          {!isAuthLoading && user && view === 'test' && (
              <ActiveTestView 
                  key="test"
                  testSession={testSession} 
                  handleAnswer={handleAnswer} 
                  formatTime={formatTime} 
                  timeLeft={timeLeft} 
                  isAnimating={isAnimating} 
                  handleNavClick={handleNavClick} 
                  finishTest={finishTest} 
              />
          )}

          {!isAuthLoading && user && view === 'result' && (
              <TestResultView 
                  key="result"
                  testSession={testSession} 
                  isResultSaved={isResultSaved} 
                  saveResult={saveResult} 
                  setView={setView} 
                  restartMistakes={restartMistakes} 
              />
          )}

          {!isAuthLoading && user && view === 'review' && (
              <ReviewView key="review" questions={testSession.questions} answers={testSession.answers} onBack={()=>setView('menu')} />
          )}

          {!isAuthLoading && user && view === 'stats' && (
             <StatsView key="stats" history={history} setHistory={setHistory} onBack={()=>setView('menu')} />
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
