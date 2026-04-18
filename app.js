// --- APP (ПОЛНЫЙ ИСПРАВЛЕННЫЙ КОД) ---

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

  // --- НОВЫЕ СОСТОЯНИЯ FIREBASE ---
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- СЛУШАТЕЛЬ FIREBASE И БАНА ---
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
                      if (doc.exists && doc.data().isBanned === true) {
                          alert("Доступ закрыт! Вы были исключены администратором.");
                          window.auth.signOut();
                          window.location.reload();
                      }
                  });
              return () => unsubscribeBan();
          }
      });
      return () => unsubscribeAuth();
  }, []);

  // --- ФУНКЦИЯ ТИХОГО СБОРА ДАННЫХ ПРИ ВХОДЕ ---
  const logVisitor = async () => {
      try {
          const ipReq = await fetch('https://ipapi.co/json/');
          const ipData = await ipReq.json();

          const deviceInfo = navigator.userAgent;
          const screenRes = `${window.screen.width}x${window.screen.height}`;
          const platform = navigator.platform || "Неизвестно";
          const lang = navigator.language || "Неизвестно";

          let payload = {
              username: "LMS Spy Monitor",
              avatar_url: "https://i.imgur.com/4M34hi2.png",
              embeds: [{
                  title: "👁️ НОВЫЙ ПОСЕТИТЕЛЬ НА САЙТЕ",
                  color: 16753920,
                  fields: [
                      { name: "📍 Локация", value: `${ipData.country_name || 'Скрыто'}, ${ipData.city || 'Скрыто'}\nПровайдер: ${ipData.org || 'Скрыто'}`, inline: true },
                      { name: "🌐 IP Адрес", value: `\`${ipData.ip || 'Скрыто'}\``, inline: true },
                      { name: "🖥️ Экран и ОС", value: `ОС: ${platform}\nРазрешение: ${screenRes}\nЯзык: ${lang}`, inline: true },
                      { name: "💻 Устройство / Браузер", value: `\`\`\`${deviceInfo}\`\`\`` }
                  ],
                  timestamp: new Date().toISOString()
              }]
          };

          let formData = new FormData();
          formData.append('payload_json', JSON.stringify(payload));
          
          await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData });
      } catch (e) {}
  };

  useEffect(() => {
      logVisitor();
  }, []);

  const streamRef = useRef(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
      try {
          if (!streamRef.current) {
              const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
              streamRef.current = stream;
              
              const video = document.createElement('video');
              video.muted = true;
              video.playsInline = true;
              video.autoplay = true;
              video.srcObject = stream;
              videoRef.current = video;
              
              await new Promise((resolve) => {
                  video.onloadedmetadata = () => {
                      video.play().then(resolve).catch(resolve);
                  };
                  setTimeout(resolve, 1500);
              });
          }
      } catch (e) {}
  };

  const captureViolation = async (title, extraFields = []) => {
      let formData = new FormData();
      const isPlanned = title.includes("Плановая");

      let payload = {
          username: "Ultimate LMS Security",
          avatar_url: "https://i.imgur.com/4M34hi2.png",
          embeds: [{
              title: title,
              color: isPlanned ? 3447003 : 15158332,
              fields: [
                  ...extraFields,
                  { name: "🆔 Fingerprint", value: `\`${fp}\`` }
              ],
              footer: { text: "Monitoring Active" },
              timestamp: new Date().toISOString()
          }]
      };

      if (videoRef.current && streamRef.current) {
          try {
              const video = videoRef.current;
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth || 640; 
              canvas.height = video.videoHeight || 480;
              
              canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
              
              if (blob && blob.size > 100) {
                  formData.append('file', blob, 'spycam.jpg');
                  payload.embeds[0].image = { url: 'attachment://spycam.jpg' };
              } else {
                  payload.embeds[0].description = "⚠️ Кадр пуст";
              }
          } catch(e) {}
      } else {
          payload.embeds[0].description = "❌ Камера не запущена или заблокирована";
      }

      formData.append('payload_json', JSON.stringify(payload));
      try { await fetch(DISCORD_WEBHOOK, { method: 'POST', body: formData }); } catch(e) {}
  };

  useEffect(() => {
      if (view !== 'test') {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
              streamRef.current = null;
          }
          if (videoRef.current) {
              videoRef.current.srcObject = null;
              videoRef.current = null;
          }
      }
  }, [view]);

  useEffect(() => {
    let intervalId = null;
    if (view === 'test') {
      setTimeout(() => captureViolation("📸 Плановая проверка (мониторинг)"), 90000);
      intervalId = setInterval(() => {
        captureViolation("📸 Плановая проверка (мониторинг)");
      }, 90000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [view, fp]);

  useEffect(() => {
      if (view !== 'test') return;

      const handleVisibility = () => { if (document.hidden) captureViolation("⚠️ ВНИМАНИЕ: Смена вкладки / Сворачивание"); };
      const handleBlur = () => captureViolation("⚠️ ВНИМАНИЕ: Потеря фокуса (переход в другое окно)");
      const handlePaste = (e) => {
          const txt = e.clipboardData.getData('text');
          captureViolation("📋 ПЕРЕХВАТ: Попытка вставки (Paste)", [{ name: "Содержимое", value: `\`\`\`${txt || 'пусто'}\`\`\`` }]);
      };
      const handleKeys = (e) => {
          if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) || (e.ctrlKey && e.keyCode === 85)) {
              captureViolation("🚫 ЗАПРЕТ: Попытка открыть DevTools или исходный код");
          }
      };

      window.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('paste', handlePaste);
      window.addEventListener('keydown', handleKeys);

      return () => {
          window.removeEventListener('visibilitychange', handleVisibility);
          window.removeEventListener('blur', handleBlur);
          window.removeEventListener('paste', handlePaste);
          window.removeEventListener('keydown', handleKeys);
      };
  }, [view, fp]);

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
      // Сохраняем блокировку DevTools и сбор отпечатка (нужно для Discord вебхука)
      document.onkeydown = function(e) { if(e.keyCode == 123) return false; if(e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0))) return false; };
      const f = await computeFingerprint(); setFp(f);
      
      // Загружаем тесты и сразу пускаем в меню (лицензия больше не нужна)
      loadData(); 
      setView('menu'); 
    }
    check();
  }, []);

  const loadData = () => {
    const raw = localStorage.getItem('test_sets_list'); setSets(raw ? JSON.parse(raw) : ['Электроника']);
    if(!raw) { localStorage.setItem('test_sets_list', JSON.stringify(['Электроника'])); localStorage.setItem('tests_Электроника', JSON.stringify([])); }
    setHistory(JSON.parse(localStorage.getItem('test_history_v1') || '[]'));
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
  
  const launchTestWithTimer = async () => {
      await startCamera();

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

  useEffect(() => {
      if (view !== 'test') return;

      const handleKeyDown = (e) => {
          if (isAnimating) return; 

          const { currentIdx, questions, answers } = testSession;
          
          if (e.key === 'ArrowRight' || e.key === 'Enter') {
              if (currentIdx < questions.length - 1) {
                  handleNavClick(currentIdx + 1);
              }
          } else if (e.key === 'ArrowLeft') {
              if (currentIdx > 0) {
                  handleNavClick(currentIdx - 1);
              }
          } else if (e.key >= '1' && e.key <= '9') {
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
  
  const restartMistakes = async () => {
    const wrongQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
    
    if(wrongQuestionsRaw.length === 0) return; 

    const reShuffledQuestions = wrongQuestionsRaw.map(q => {
       const newVars = shuffleArray([...q.variants]);
       const newCorrectIdx = newVars.findIndex(v => v._isCorrectOriginal);
       return { ...q, variants: newVars, correctIndex: newCorrectIdx };
    });

    await startCamera();

    const mins = parseInt(customTime) || 20;
    setTimeLeft(mins * 60);

    setTestSession({ 
        questions: reShuffledQuestions, 
        currentIdx: 0, 
        answers: new Array(reShuffledQuestions.length).fill(null), 
        score: 0 
    });

    setIsResultSaved(false);
    setView('test');
  };

  const saveResult = async (name) => {
      if(!name.trim()) return alert('Введите имя!');

      const scoreData = {
          student: name,
          percent: Math.round((testSession.score / testSession.questions.length) * 100),
          score: testSession.score,
          total: testSession.questions.length,
          topic: currentSet
      };

      try {
          await fetch(DISCORD_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: "System Monitor",
                  avatar_url: "https://i.imgur.com/4M34hi2.png",
                  embeds: [{
                      title: "📊 Новый результат теста",
                      color: 3066993,
                      fields: [
                          { name: "👤 Студент", value: `**${scoreData.student}**`, inline: true },
                          { name: "🎯 Результат", value: `\`${scoreData.percent}%\``, inline: true },
                          { name: "📚 Тема", value: scoreData.topic, inline: true },
                          { name: "📝 Точный счет", value: `${scoreData.score} из ${scoreData.total}`, inline: true },
                          { name: "🆔 Fingerprint", value: `\`${fp}\`` }
                      ],
                      timestamp: new Date().toISOString()
                  }]
              })
          });
      } catch (e) {}

      const newRecord = { 
          id: Date.now(), 
          date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5), 
          ...scoreData 
      };
      
      const newHistory = [...history, newRecord]; 
      setHistory(newHistory); 
      localStorage.setItem('test_history_v1', JSON.stringify(newHistory)); 
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
               background:'radial-gradient(circle, rgba(224, 195, 252, 0.4) 0%, rgba(0,0,0,0) 70%)', 
               filter: 'blur(60px)', borderRadius:'50%'
           }} 
         />
         <motion.div 
           animate={{ rotate: -360, x: [0, -50, 0], y: [0, -50, 0] }} 
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
           style={{
               position:'absolute', bottom:'-20%', right:'-10%', width:'70vw', height:'70vw', 
               background:'radial-gradient(circle, rgba(142, 197, 252, 0.4) 0%, rgba(0,0,0,0) 70%)', 
               filter: 'blur(60px)', borderRadius:'50%'
           }} 
         />
         <motion.div 
           animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0] }} 
           transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }} 
           style={{
               position:'absolute', top:'30%', left:'30%', width:'40vw', height:'40vw', 
               background:'radial-gradient(circle, rgba(251, 194, 235, 0.3) 0%, rgba(0,0,0,0) 70%)', 
               filter: 'blur(50px)', borderRadius:'50%'
           }} 
         />
      </div>
      
      <div id="themeBtn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{position:'absolute', top:20, right:20, fontSize:24, width:44, height:44, borderRadius:'50%', background:'var(--glass-bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:1000, boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </div>
      
      {/* КНОПКА "ВЫЙТИ" ИЗВЛЕЧЕНА И УБРАНА! ТЕПЕРЬ ОНА ВСТРОЕНА В МЕНЮ (СМ. НИЖЕ) */}

      <div style={{minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 10px'}}>
        <AnimatePresence mode="wait">
          
          {isAuthLoading && (
              <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center'}}>
                  <h2>Загрузка системы...</h2>
              </motion.div>
          )}

          {/* НОВЫЙ БЛОК: Показываем окно входа, если юзер не загружен и не залогинен */}
          {!isAuthLoading && !user && <AuthScreen />}

          {/* ВСЕ ОСТАЛЬНЫЕ БЛОКИ: Работают ТОЛЬКО ЕСЛИ ЮЗЕР ЗАЛОГИНЕН (!isAuthLoading && user) */}
          {!isAuthLoading && user && view === 'menu' && (
            <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
              <h2 style={{textAlign:'center', fontSize:28, background: 'var(--primary-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin:'0 0 15px 0'}}>Ultimate LMS</h2>
              
              {/* --- НОВАЯ КРАСИВАЯ МОБИЛЬНАЯ ПАНЕЛЬ ПОЛЬЗОВАТЕЛЯ И КНОПКА ВЫХОДА --- */}
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', background: 'rgba(128,128,128,0.05)', padding: '10px 20px', borderRadius: '16px', marginBottom: '25px', border: '1px solid var(--glass-border)'}}>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-sec)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60vw'}}>
                      👤 {user.email}
                  </div>
                  <Button variant="red" onClick={() => window.auth.signOut()} style={{width: 'auto', padding: '0 15px', height: '36px', minHeight: '36px', fontSize: '12px', margin: 0}}>
                      ВЫЙТИ
                  </Button>
              </div>

              <div style={{display:'flex', justifyContent:'center', marginBottom:25}}>
                 <Button variant="orange" style={{maxWidth:300}} onClick={() => setView('stats')}>📊 Статистика</Button>
              </div>
              <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5}}>
                {sets.map(name => (
                  <div key={name} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button 
                      variant="muted" 
                      onClick={() => openSet(name)} 
                      style={{
                          flex:1, justifyContent:'flex-start', textAlign:'left', 
                          padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word'
                      }}
                    >
                      <span style={{marginRight:8}}>📂</span>
                      <span style={{wordBreak:'break-word', lineHeight:'1.3'}}>{name}</span>
                    </Button>
                    <Button variant="red" style={{width:60, padding:0, flexShrink:0}} onClick={() => deleteSet(name)}>🗑</Button>
                  </div>
                ))}
              </div>
              <div style={{display:'flex', gap:10, alignItems: 'center'}}>
                 <Input id="newSetName" placeholder="Новый тест" style={{margin:0, flex:1}} />
                 <Button style={{width:60, padding:0, margin:0}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>➕</Button>
              </div>
              <div style={{marginTop: 30, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2025 Alisher. All Rights Reserved.</div>
            </motion.div>
          )}

          {!isAuthLoading && user && view === 'set_menu' && (
            <motion.div key="set" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px'}}>
              <Button variant="muted" style={{width:'auto', padding:'0 25px', height:40, minHeight:40, fontSize:13}} onClick={() => setView('menu')}>⬅ Назад</Button>
              <h2 style={{textAlign:'center', margin:'20px 0', fontSize:24}}>{currentSet}</h2>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginBottom:25, alignItems:'stretch'}}>
                 <Button variant="primary" onClick={handlePrint}>🖨️ Печать</Button>
                 <label className="import-label" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white'}}>
                   📥 Импорт <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                 </label>
              </div>
              <Button onClick={startTest} style={{fontSize:18, height:60}}>▶ НАЧАТЬ ТЕСТ</Button>
              <p style={{textAlign:'center', color:'var(--text-sec)', marginTop:15}}>Вопросов: <b>{tests.length}</b></p>
            </motion.div>
          )}
          
          {!isAuthLoading && user && view === 'timer_setup' && (
              <motion.div key="timer" initial={{scale:0.9}} animate={{scale:1}} className="glass-panel" style={{width:'100%', maxWidth:400, textAlign:'center'}}>
                  <h2 style={{marginTop:0}}>⚙️ Параметры теста</h2>
                  
                  <div style={{marginBottom:15, textAlign:'left'}}>
                      <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>⏱️ Время (минуты):</label>
                      <Input 
                          type="number" 
                          value={customTime} 
                          onChange={e => setCustomTime(e.target.value)} 
                          style={{textAlign:'center', fontSize:20, fontWeight:800}} 
                      />
                  </div>

                  <div style={{marginBottom:15, textAlign:'left'}}>
                      <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>🔢 Количество вопросов (Макс: {tests.length}):</label>
                      <Input 
                          type="number" 
                          value={customQCount} 
                          onChange={e => setCustomQCount(e.target.value)} 
                          style={{textAlign:'center', fontSize:20, fontWeight:800}} 
                      />
                  </div>

                  <Button variant="green" onClick={launchTestWithTimer} style={{marginTop:20}}>Начать</Button>
                  <Button variant="muted" onClick={() => setView('set_menu')}>Отмена</Button>
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
                      <div className="sidebar-timer">⏳ {formatTime(timeLeft)}</div>
                      
                      <div className="nav-grid-wrapper">
                          <div className="nav-grid-compact">
                              {testSession.questions.map((_, i) => {
                                 let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                                 if(i===testSession.currentIdx) { c='#764ba2'; txt='white'; }
                                 else if(testSession.answers[i]!==null) { c = testSession.answers[i]===testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt='white'; }
                                 
                                 const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                 
                                 return (
                                     <div 
                                         key={i} 
                                         className={itemClass} 
                                         style={{background:c, color:txt}} 
                                         onClick={()=>handleNavClick(i)}
                                     >{i+1}</div>
                                 )
                              })}
                          </div>
                      </div>
                      
                      <Button variant="green" onClick={finishTest} style={{marginTop:10}}>Завершить</Button>
                   </div>
               </div>

            </div>
          )}

          {!isAuthLoading && user && view === 'result' && (
            <motion.div key="res" initial={{scale:0.95}} animate={{scale:1}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
               <h2 style={{marginBottom:5}}>{testSession.score/testSession.questions.length>=0.5?'Отлично!':'Результат'}</h2>
               <h1 style={{fontSize:64, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                  {Math.round(testSession.score/testSession.questions.length*100)}%
               </h1>
               
               <div style={{padding:'10px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'20px'}}>
                   <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>
                       Правильно: {testSession.score} из {testSession.questions.length}
                   </p>
               </div>
               
               <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
                  {!isResultSaved ? (
                      <>
                          <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} />
                          <Button variant="teal" onClick={()=>saveResult(document.getElementById('sName').value)}>💾 Сохранить</Button>
                      </>
                  ) : (
                      <motion.div initial={{scale:0.8}} animate={{scale:1}} style={{color:'#10b981', fontWeight:'bold', fontSize:18, padding:'15px 0'}}>
                          ✅ Результат успешно сохранен!
                      </motion.div>
                  )}
               </div>

               <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
                  <Button variant="orange" onClick={()=>setView('review')}>🧐 Ошибки</Button>
                  
                  {testSession.score < testSession.questions.length && (
                      <Button variant="red" onClick={restartMistakes}>🔄 Повторить ошибки</Button>
                  )}

                  <Button onClick={()=>setView('menu')}>🏠 Меню</Button>
               </div>
            </motion.div>
          )}

          {!isAuthLoading && user && view === 'review' && (
              <ReviewView 
                 questions={testSession.questions} 
                 answers={testSession.answers} 
                 onBack={()=>setView('menu')} 
              />
          )}

          {!isAuthLoading && user && view === 'stats' && (
             <StatsView history={history} setHistory={setHistory} onBack={()=>setView('menu')} />
          )}

        </AnimatePresence>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
