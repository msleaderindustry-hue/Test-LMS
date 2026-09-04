// --- ВАЖНО: ИМПОРТЫ ИЗ ПРЕДЫДУЩИХ ФАЙЛОВ ---
const { 
  useState, useEffect, useRef, motion, AnimatePresence,
  computeFingerprint, shuffleArray, 
  GooeyText, Button, Input,
  AuthScreen, AdminPanel, ChatPanel,
  TestQuestionCard, ReviewView, StatsView,
  TypingTest, HotkeyTrainer, CodePlayground, FlashcardsLMS, ExcelTrainerLMS, LandingView,
  SidebarMenu, 
  logVisitor, captureViolation, sendTestResultToDiscord 
} = window;

// =========================================================================
// 3D LOW-POLY ФОН (Строгий темный цвет)
// =========================================================================
const LowPolyBackground = ({ theme }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const config = {
            gridSize: 150,
            xyWander: 40,
            zDepth: 70,
            speed: 0.0005
        };

        const lightVector = { x: -0.4, y: -0.6, z: 0.6 };

        const themes = {
            light: { base: [224, 195, 252], light: [255, 241, 235] },
            dark: { base: [8, 12, 18], light: [38, 48, 65] } 
        };

        let width, height;
        let points = [], triangles = [];
        
        const initialTheme = canvas.dataset.theme || 'light';
        let currentColor = { 
            base: [...themes[initialTheme].base], 
            light: [...themes[initialTheme].light] 
        };

        let animationId;

        const initMesh = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            points = [];
            triangles = [];

            const cols = Math.ceil(width / config.gridSize) + 4;
            const rows = Math.ceil(height / config.gridSize) + 4;
            const startX = -config.gridSize * 2;
            const startY = -config.gridSize * 2;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    points.push({
                        bx: startX + j * config.gridSize,
                        by: startY + i * config.gridSize,
                        x: 0, y: 0, z: 0,
                        phaseX: Math.random() * Math.PI * 2,
                        phaseY: Math.random() * Math.PI * 2,
                        phaseZ: Math.random() * Math.PI * 2,
                        speed: 0.3 + Math.random() * 0.7
                    });
                }
            }

            for (let i = 0; i < rows - 1; i++) {
                for (let j = 0; j < cols - 1; j++) {
                    const p1 = i * cols + j, p2 = p1 + 1, p3 = (i + 1) * cols + j, p4 = p3 + 1;
                    if (Math.random() > 0.5) {
                        triangles.push([points[p1], points[p2], points[p3]]);
                        triangles.push([points[p4], points[p3], points[p2]]);
                    } else {
                        triangles.push([points[p1], points[p4], points[p3]]);
                        triangles.push([points[p1], points[p2], points[p4]]);
                    }
                }
            }
        };

        const lerp = (a, b, t) => a + (b - a) * t;

        const animateMesh = (time) => {
            const targetThemeMode = canvas.dataset.theme || 'light';
            const target = themes[targetThemeMode];
            
            for (let i = 0; i < 3; i++) {
                currentColor.base[i] = lerp(currentColor.base[i], target.base[i], 0.05);
                currentColor.light[i] = lerp(currentColor.light[i], target.light[i], 0.05);
            }

            points.forEach(p => {
                const t = time * config.speed * p.speed;
                p.x = p.bx + Math.sin(t + p.phaseX) * config.xyWander;
                p.y = p.by + Math.cos(t + p.phaseY) * config.xyWander;
                p.z = Math.sin(t + p.phaseZ) * config.zDepth;
            });

            ctx.clearRect(0, 0, width, height);

            triangles.forEach(t => {
                const p1 = t[0], p2 = t[1], p3 = t[2];
                const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dz1 = p2.z - p1.z;
                const dx2 = p3.x - p1.x, dy2 = p3.y - p1.y, dz2 = p3.z - p1.z;

                let nx = dy1 * dz2 - dz1 * dy2;
                let ny = dz1 * dx2 - dx1 * dz2;
                let nz = dx1 * dy2 - dy1 * dx2;

                if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }

                const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
                let light = 0;
                if (len > 0) {
                    const dot = (nx * lightVector.x + ny * lightVector.y + nz * lightVector.z) / len;
                    light = (dot + 1) / 2;
                }

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.closePath();

                const l = Math.pow(light, 1.2);
                const r = Math.floor(currentColor.base[0] + (currentColor.light[0] - currentColor.base[0]) * l);
                const g = Math.floor(currentColor.base[1] + (currentColor.light[1] - currentColor.base[1]) * l);
                const b = Math.floor(currentColor.base[2] + (currentColor.light[2] - currentColor.base[2]) * l);
                const color = `rgb(${r}, ${g}, ${b})`;

                ctx.fillStyle = color;
                ctx.strokeStyle = color; 
                ctx.lineWidth = 1;
                
                ctx.fill();
                ctx.stroke();
            });

            animationId = requestAnimationFrame(animateMesh);
        };

        initMesh();
        animationId = requestAnimationFrame(animateMesh);

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initMesh, 200);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            data-theme={theme} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }} 
        />
    );
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
  const [userData, setUserData] = useState(null);
  
  // ДОБАВЛЕН 'ai_chat' В СПИСОК ПО УМОЛЧАНИЮ
  const [allowedModules, setAllowedModules] = useState(['chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'stats']);

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
                          setUserData(data);
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
                          
                          // ДОБАВЛЕН 'ai_chat' В СПИСОК ВОССТАНОВЛЕНИЯ
                          setAllowedModules(data.allowedModules || ['chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'stats']);
                      }
                  });
              return () => unsubscribeBan();
          } else {
              setUserRole('student');
          }
      });
      return () => unsubscribeAuth();
  }, []);

  // Логирование посетителя
  useEffect(() => { 
      if (typeof logVisitor === 'function') logVisitor(); 
  }, []);

  // Перехват нарушений
  useEffect(() => {
      if (view !== 'test') return;
      const handleVisibility = () => { if (document.hidden && typeof captureViolation === 'function') captureViolation("⚠️ ВНИМАНИЕ: Смена вкладки / Сворачивание", fp); };
      const handleBlur = () => { if (typeof captureViolation === 'function') captureViolation("⚠️ ВНИМАНИЕ: Потеря фокуса (переход в другое окно)", fp); };
      const handlePaste = (e) => { if (typeof captureViolation === 'function') captureViolation("📋 ПЕРЕХВАТ: Попытка вставки (Paste)", fp, [{ name: "Содержимое", value: `\`\`\`${e.clipboardData.getData('text') || 'пусто'}\`\`\`` }]); };
      const handleKeys = (e) => { 
          if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) || (e.ctrlKey && e.keyCode === 85)) {
              if (typeof captureViolation === 'function') captureViolation("🚫 ЗАПРЕТ: Попытка открыть DevTools", fp); 
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

  // --- ОБНОВЛЕННОЕ СОХРАНЕНИЕ РЕЗУЛЬТАТОВ (ОТПРАВКА В FIREBASE) ---
  const saveResult = async (name) => {
      if(!name.trim()) return alert('Введите имя!');
      const scoreData = { student: name, percent: Math.round((testSession.score / testSession.questions.length) * 100), score: testSession.score, total: testSession.questions.length, topic: currentSet };
      
      const failedQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
      const failedQuestions = failedQuestionsRaw.map(q => {
          const originalIndex = testSession.questions.indexOf(q);
          const userAnsIdx = testSession.answers[originalIndex];
          return {
              question: q.question.replace(/<[^>]+>/g, ''),
              userAnsText: userAnsIdx !== null && q.variants[userAnsIdx] ? q.variants[userAnsIdx].text : "Пропустил",
              correctAnsText: q.variants[q.correctIndex].text
          };
      });

      if (typeof sendTestResultToDiscord === 'function') {
          sendTestResultToDiscord(scoreData, failedQuestions, user ? user.email : "Неизвестно", fp);
      }
      
      const newRecord = { id: Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5), ...scoreData };
      
      try {
          if (user && window.db) {
              const userDoc = await window.db.collection('users').doc(user.uid).get();
              const currentHistory = userDoc.exists ? (userDoc.data().testHistory || []) : [];
              const updatedHistory = [...currentHistory, newRecord];
              await window.db.collection('users').doc(user.uid).set({ testHistory: updatedHistory }, { merge: true });
          }
      } catch (e) {
          console.error("Ошибка сохранения в Firebase", e);
      }
      
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

  const handleDirectLogin = async () => {
      try {
          const provider = new window.firebase.auth.GoogleAuthProvider();
          const result = await window.auth.signInWithPopup(provider);
          const loggedInUser = result.user;

          const userDoc = await window.db.collection('users').doc(loggedInUser.uid).get();

          if (!userDoc.exists) {
              await window.db.collection('users').doc(loggedInUser.uid).set({
                  email: loggedInUser.email,
                  role: 'student',
                  isBanned: false,
                  registeredAt: new Date().toISOString(),
                  // ДОБАВЛЕН 'ai_chat' ПРИ РЕГИСТРАЦИИ НОВОГО ПОЛЬЗОВАТЕЛЯ
                  allowedModules: ['chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'stats'],
                  excelHintsEnabled: true
              });
          }
      } catch (err) {
          console.error("Ошибка Firebase Auth:", err);
          const ignoredErrors = [
              'auth/popup-closed-by-user',
              'auth/cancelled-popup-request',
              'auth/popup-blocked'
          ];
          if (!ignoredErrors.includes(err.code)) {
              alert("Произошла ошибка при входе. Попробуйте обновить страницу.");
          }
      }
  };

  return (
    <>
      <LowPolyBackground theme={theme} />

      {!isAuthLoading && user && (view === 'menu' || view === 'stats' || view === 'typing' || view === 'hotkeys' || view === 'code' || view === 'flashcards' || view === 'excel' || view === 'admin') && (
          <div className="mobile-burger-fixed">
              <Button variant="muted" onClick={() => setIsSidebarOpen(true)} style={{width: 54, height: 54, padding: 0, borderRadius: '16px', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>☰</Button>
          </div>
      )}

      <SidebarMenu 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          theme={theme} 
          setTheme={setTheme} 
          user={user} 
          userNickname={userNickname} 
          changeNickname={changeNickname} 
          allowedModules={allowedModules} 
          isAdmin={isAdmin} 
          view={view} 
          setView={setView} 
          setIsChatOpen={setIsChatOpen} 
      />

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
          
          {isAuthLoading && (
              <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width: '100%', maxWidth: '400px', padding: '40px 20px'}}>
                  <h2 style={{marginBottom: 20}}>Загрузка системы</h2>
                  <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: 'var(--text-sec)', height: '20px', width: '80%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
                  <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} style={{ background: 'var(--text-sec)', height: '20px', width: '60%', margin: '0 auto 15px auto', borderRadius: '10px' }} />
                  <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} style={{ background: 'var(--text-sec)', height: '45px', width: '100%', margin: '0 auto', borderRadius: '14px' }} />
              </motion.div>
          )}

          {!isAuthLoading && !user && (
              <div key="landing-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflowY: 'auto', zIndex: 5000, background: '#050308' }}>
                  <LandingView onLogin={handleDirectLogin} />
              </div>
          )}

          {!isAuthLoading && user && view === 'admin' && isAdmin && (
              <AdminPanel />
          )}

          {!isAuthLoading && user && view === 'menu' && (
            <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
              
              <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 25px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />
              
              <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5}}>
                
                {teacherTests.map(test => (
                  <div key={test.id} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word', border: '1px solid #00c6ff' }}>
                      <span style={{marginRight:8}}>☁️</span>
                      <span style={{wordBreak:'break-word', lineHeight:'1.3', color: '#00c6ff', fontWeight: 700}}>{test.title}</span>
                    </Button>
                    <Button variant="red" style={{width:60, padding:0, flexShrink:0}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>🗑</Button>
                  </div>
                ))}

                {sets.map(name => (
                  <div key={name} style={{display:'flex', gap:10, marginBottom:10}}>
                    <Button variant="muted" onClick={() => openSet(name)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word' }}>
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
              <div style={{marginTop: 30, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2026 Ultimate LMS Platform. All Rights Reserved.</div>
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
                      <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                  </div>
                  <div style={{marginBottom:15, textAlign:'left'}}>
                      <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'block'}}>🔢 Количество вопросов (Макс: {tests.length}):</label>
                      <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
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
                                 return ( <div key={i} className={itemClass} style={{background:c, color:txt}} onClick={()=>handleNavClick(i)}>{i+1}</div> )
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
                   <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
               </div>
               <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
                  {!isResultSaved ? (
                      <>
                          <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} />
                          <Button variant="teal" onClick={()=>saveResult(document.getElementById('sName').value)}>💾 Сохранить</Button>
                      </>
                  ) : (
                      <motion.div initial={{scale:0.8}} animate={{scale:1}} style={{color:'#10b981', fontWeight:'bold', fontSize:18, padding:'15px 0'}}>✅ Результат успешно сохранен!</motion.div>
                  )}
               </div>
               <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
                  <Button variant="orange" onClick={()=>setView('review')}>🧐 Ошибки</Button>
                  {testSession.score < testSession.questions.length && ( <Button variant="red" onClick={restartMistakes}>🔄 Повторить ошибки</Button> )}
                  <Button onClick={()=>setView('menu')}>🏠 Меню</Button>
               </div>
            </motion.div>
          )}

          {!isAuthLoading && user && view === 'review' && (
              <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={()=>setView('menu')} />
          )}

          {/* Защищенный роут Статистики */}
          {!isAuthLoading && user && view === 'stats' && allowedModules.includes('stats') && (
             <StatsView history={history} setHistory={setHistory} userData={userData} />
          )}

          {/* Экран тренажера печати */}
          {!isAuthLoading && user && view === 'typing' && allowedModules.includes('typing') && (
              <motion.div key="typing_test" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1100px'}}>
                  <TypingTest />
              </motion.div>
          )}

          {/* Экран хоткеев */}
          {!isAuthLoading && user && view === 'hotkeys' && allowedModules.includes('hotkeys') && (
              <motion.div key="hotkey_trainer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '700px'}}>
                  <HotkeyTrainer />
              </motion.div>
          )}

          {/* ЭКРАН ШКОЛЫ КОДА */}
          {!isAuthLoading && user && view === 'code' && allowedModules.includes('code') && (
              <motion.div key="code_playground" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1200px'}}>
                  <CodePlayground />
              </motion.div>
          )}

          {/* ЭКРАН УМНЫХ КАРТОЧЕК */}
          {!isAuthLoading && user && view === 'flashcards' && allowedModules.includes('flashcards') && (
              <motion.div key="flashcards_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1000px'}}>
                  <FlashcardsLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

          {/* ЭКРАН ТРЕНАЖЕРА EXCEL */}
          {!isAuthLoading && user && view === 'excel' && allowedModules.includes('excel') && (
              <motion.div key="excel_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1000px'}}>
                  <ExcelTrainerLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

        </AnimatePresence>

        {/* ПЛАВАЮЩИЙ ИИ-АССИСТЕНТ (Теперь зависит от ai_chat) */}
        {!isAuthLoading && user && allowedModules.includes('ai_chat') && window.AIChatWidget && (
            <window.AIChatWidget />
        )}

      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
