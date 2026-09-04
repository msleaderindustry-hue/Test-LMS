// --- ВАЖНО: ИМПОРТЫ ИЗ ПРЕДЫДУЩИХ ФАЙЛОВ ---
const { 
  useState, useEffect, useRef, motion, AnimatePresence,
  computeFingerprint, 
  GooeyText, Button, Input,
  AdminPanel, ChatPanel,
  StatsView,
  TypingTest, HotkeyTrainer, CodePlayground, FlashcardsLMS, ExcelTrainerLMS, LandingView,
  SidebarMenu, TestsLMS,
  logVisitor
} = window;

// =========================================================================
// 3D LOW-POLY ФОН
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

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [userNickname, setUserNickname] = useState(''); 
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [teacherTests, setTeacherTests] = useState([]); 
  const [userData, setUserData] = useState(null);
  
  // ИСПРАВЛЕНИЕ: Массив изначально пустой. Ничего не показываем, пока не загрузятся права.
  const [allowedModules, setAllowedModules] = useState([]);

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
                          setTeacherTests(data.assignedTests || []);
                          setAllowedModules(data.allowedModules || ['chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'stats']);
                      }
                      
                      // ИСПРАВЛЕНИЕ: Снимаем экран загрузки только ПОСЛЕ получения данных из базы
                      setIsAuthLoading(false);
                  });
              return () => unsubscribeBan();
          } else {
              setUserRole('student');
              // Снимаем экран загрузки для гостей (неавторизованных)
              setIsAuthLoading(false);
          }
      });
      return () => unsubscribeAuth();
  }, []);

  // Запрет F12
  useEffect(() => {
    async function check() {
      document.onkeydown = function(e) { if(e.keyCode == 123) return false; if(e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0))) return false; };
      const f = await computeFingerprint(); setFp(f);
      loadData(); 
      setView('menu');
    }
    check();
  }, []);

  useEffect(() => { 
      if (typeof logVisitor === 'function') logVisitor(); 
  }, []);

  useEffect(() => { document.body.className = theme; localStorage.setItem('theme', theme); }, [theme]);
  
  const loadData = () => {
    const raw = localStorage.getItem('test_sets_list'); 
    setSets(raw ? JSON.parse(raw) : []); 
    if(!raw) localStorage.setItem('test_sets_list', JSON.stringify([]));        
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
      } catch(e) { alert("Ошибка при удалении теста"); }
  };

  const changeNickname = async () => {
      const newNick = prompt("Введите ваш новый никнейм (будет виден в чате):", userNickname || "");
      if (newNick && newNick.trim() !== "") {
          try { await window.db.collection('users').doc(user.uid).update({ nickname: newNick.trim() }); } 
          catch (e) { alert("Ошибка при сохранении никнейма!"); }
      }
  };

  const handleDirectLogin = async () => {
      try {
          const provider = new window.firebase.auth.GoogleAuthProvider();
          const result = await window.auth.signInWithPopup(provider);
          const loggedInUser = result.user;
          const userDoc = await window.db.collection('users').doc(loggedInUser.uid).get();

          if (!userDoc.exists) {
              await window.db.collection('users').doc(loggedInUser.uid).set({
                  email: loggedInUser.email, role: 'student', isBanned: false, registeredAt: new Date().toISOString(),
                  allowedModules: ['chat', 'ai_chat', 'typing', 'hotkeys', 'code', 'flashcards', 'excel', 'stats'],
                  excelHintsEnabled: true
              });
          }
      } catch (err) {
          console.error("Ошибка Firebase Auth:", err);
          const ignoredErrors = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/popup-blocked'];
          if (!ignoredErrors.includes(err.code)) { alert("Произошла ошибка при входе. Попробуйте обновить страницу."); }
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
          isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} theme={theme} setTheme={setTheme} 
          user={user} userNickname={userNickname} changeNickname={changeNickname} 
          allowedModules={allowedModules} isAdmin={isAdmin} view={view} setView={setView} setIsChatOpen={setIsChatOpen} 
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

          {/* === ВЫЗОВ ВНЕШНЕГО МОДУЛЯ ТЕСТИРОВАНИЯ === */}
          {!isAuthLoading && user && ['set_menu', 'timer_setup', 'test', 'result', 'review'].includes(view) && (
              <TestsLMS 
                  view={view} 
                  setView={setView} 
                  currentSet={currentSet} 
                  tests={tests} 
                  setTests={setTests} 
                  user={user} 
                  history={history} 
                  setHistory={setHistory} 
                  fp={fp} 
              />
          )}

          {!isAuthLoading && user && view === 'stats' && allowedModules.includes('stats') && (
             <StatsView history={history} setHistory={setHistory} userData={userData} />
          )}

          {!isAuthLoading && user && view === 'typing' && allowedModules.includes('typing') && (
              <motion.div key="typing_test" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1100px'}}>
                  <TypingTest />
              </motion.div>
          )}

          {!isAuthLoading && user && view === 'hotkeys' && allowedModules.includes('hotkeys') && (
              <motion.div key="hotkey_trainer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '700px'}}>
                  <HotkeyTrainer />
              </motion.div>
          )}

          {!isAuthLoading && user && view === 'code' && allowedModules.includes('code') && (
              <motion.div key="code_playground" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1200px'}}>
                  <CodePlayground />
              </motion.div>
          )}

          {!isAuthLoading && user && view === 'flashcards' && allowedModules.includes('flashcards') && (
              <motion.div key="flashcards_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1000px'}}>
                  <FlashcardsLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

          {!isAuthLoading && user && view === 'excel' && allowedModules.includes('excel') && (
              <motion.div key="excel_view" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{width: '100%', maxWidth: '1000px'}}>
                  <ExcelTrainerLMS onBack={() => setView('menu')} />
              </motion.div>
          )}

        </AnimatePresence>

        {/* ПЛАВАЮЩИЙ ИИ-АССИСТЕНТ */}
        {!isAuthLoading && user && allowedModules.includes('ai_chat') && window.AIChatWidget && (
            <window.AIChatWidget />
        )}

      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
