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
  const DEFAULT_MODULES = [
    'chat',
    'ai_chat',
    'typing',
    'hotkeys',
    'code',
    'flashcards',
    'excel',
    'stats'
  ];

  const [view, setView] = useState('loading');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [fp, setFp] = useState('');

  // ВАЖНО:
  // user становится не null только ПОСЛЕ того,
  // как профиль Firestore подтверждён и загружен.
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [userNickname, setUserNickname] = useState('');
  const [userData, setUserData] = useState(null);

  // null = Firebase ещё не подтвердил эти данные.
  const [teacherTests, setTeacherTests] = useState(null);
  const [allowedModules, setAllowedModules] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isAdmin = userRole === 'admin';
  const appReady =
    !isAuthLoading &&
    !!user &&
    !!userData &&
    Array.isArray(teacherTests) &&
    Array.isArray(allowedModules);

  // -----------------------------------------------------------------------
  // ЛОКАЛЬНЫЕ ДАННЫЕ
  // -----------------------------------------------------------------------

  const loadData = () => {
    try {
      const raw = localStorage.getItem('test_sets_list');
      setSets(raw ? JSON.parse(raw) : []);

      if (!raw) {
        localStorage.setItem('test_sets_list', JSON.stringify([]));
      }

      setHistory(
        JSON.parse(localStorage.getItem('test_history_v1') || '[]')
      );
    } catch (error) {
      console.error('[Ultimate LMS Local Data]', error);
      setSets([]);
      setHistory([]);
    }
  };

  // -----------------------------------------------------------------------
  // ПРИМЕНЕНИЕ ПОДТВЕРЖДЁННОГО ПРОФИЛЯ
  // -----------------------------------------------------------------------

  const applyProfile = (currentUser, data) => {
    const modules =
      data?.allowedModules == null
        ? DEFAULT_MODULES
        : Array.isArray(data.allowedModules)
          ? data.allowedModules
          : [];

    const assigned =
      Array.isArray(data?.assignedTests)
        ? data.assignedTests
        : [];

    setUserData({
      uid: currentUser.uid,
      ...data
    });

    setUserRole(data?.role || 'student');
    setUserNickname(data?.nickname || '');
    setTeacherTests(assigned);
    setAllowedModules(modules);

    // Только здесь пользователь считается полностью готовым.
    setUser(currentUser);
  };

  // -----------------------------------------------------------------------
  // FIREBASE AUTH + ПРОФИЛЬ FIRESTORE
  //
  // Главное исправление:
  // интерфейс НЕ показывается между onAuthStateChanged и загрузкой профиля.
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!window.auth || !window.db) {
      setAuthError('Firebase не подключён. Проверьте инициализацию Auth и Firestore.');
      setIsAuthLoading(false);
      return;
    }

    let active = true;
    let profileUnsubscribe = null;
    let authSequence = 0;

    const clearProfileListener = () => {
      if (typeof profileUnsubscribe === 'function') {
        profileUnsubscribe();
      }
      profileUnsubscribe = null;
    };

    const resetProfile = () => {
      setUser(null);
      setUserData(null);
      setUserRole('student');
      setUserNickname('');
      setTeacherTests(null);
      setAllowedModules(null);
      setIsSidebarOpen(false);
      setIsChatOpen(false);
    };

    const unsubscribeAuth = window.auth.onAuthStateChanged(async (currentUser) => {
      const sequence = ++authSequence;

      clearProfileListener();
      setAuthError('');
      setIsAuthLoading(true);
      resetProfile();

      // Пользователь не вошёл.
      if (!currentUser) {
        if (!active || sequence !== authSequence) return;

        setView('menu');
        setIsAuthLoading(false);
        return;
      }

      const profileRef = window.db
        .collection('users')
        .doc(currentUser.uid);

      try {
        // Новый 3_auth.js экспортирует ensureLmsUserProfile().
        // Транзакция проверяет профиль на сервере, создаёт его при первом входе,
        // проверяет блокировку и не перезаписывает админские настройки.
        let initialData = null;

        if (typeof window.ensureLmsUserProfile === 'function') {
          initialData = await window.ensureLmsUserProfile(currentUser);
        } else {
          // Запасной путь, если старый auth-файл ещё не заменён.
          const serverSnapshot = await profileRef.get({ source: 'server' });

          if (!serverSnapshot.exists) {
            const serverTimestamp =
              window.firebase.firestore.FieldValue.serverTimestamp();

            const newProfile = {
              email: currentUser.email || '',
              nickname:
                currentUser.displayName ||
                currentUser.email?.split('@')[0] ||
                'Студент',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              role: 'student',
              isBanned: false,
              allowedModules: DEFAULT_MODULES,
              excelHintsEnabled: true,
              chatContactMode: 'all',
              chatAllowedUsers: [],
              registeredAt: serverTimestamp,
              lastLoginAt: serverTimestamp,
              lastSeenAt: serverTimestamp,
              loginCount: 1,
              profileVersion: 2
            };

            await profileRef.set(newProfile);
            initialData = newProfile;
          } else {
            initialData = serverSnapshot.data() || {};
          }
        }

        if (!active || sequence !== authSequence) return;

        if (initialData?.isBanned === true) {
          const error = new Error('Аккаунт заблокирован');
          error.code = 'lms/account-banned';
          throw error;
        }

        // Первый показ LMS происходит только после этой строки.
        applyProfile(currentUser, initialData);
        setView('menu');
        setIsAuthLoading(false);

        // После первичной серверной проверки оставляем realtime-обновления.
        profileUnsubscribe = profileRef.onSnapshot(
          { includeMetadataChanges: true },
          async (snapshot) => {
            if (!active || sequence !== authSequence) return;
            if (!snapshot.exists) return;

            // Не разрешаем старому кешу откатить уже проверенные права.
            if (snapshot.metadata?.fromCache) return;

            const data = snapshot.data() || {};

            if (data.isBanned === true) {
              setIsSidebarOpen(false);
              setIsChatOpen(false);
              resetProfile();

              try {
                await window.auth.signOut();
              } catch (signOutError) {
                console.error('[Ultimate LMS SignOut]', signOutError);
              }

              alert('Доступ закрыт! Вы были исключены администратором.');
              return;
            }

            applyProfile(currentUser, data);
          },
          (error) => {
            console.error('[Ultimate LMS Profile Snapshot]', error);

            // Если первоначальная загрузка уже прошла,
            // не выкидываем ученика из интерфейса из-за временного сбоя listener.
          }
        );
      } catch (error) {
        console.error('[Ultimate LMS Profile Bootstrap]', error);

        if (!active || sequence !== authSequence) return;

        resetProfile();

        if (error?.code === 'lms/account-banned') {
          setAuthError('Ваш аккаунт заблокирован. Обратитесь к преподавателю.');

          try {
            await window.auth.signOut();
          } catch (_) {}
        } else if (
          String(error?.code || '').includes('unavailable') ||
          String(error?.code || '').includes('network')
        ) {
          setAuthError(
            'Не удалось получить актуальные данные с Firebase. Проверьте интернет и повторите.'
          );
        } else if (String(error?.code || '').includes('permission-denied')) {
          setAuthError(
            'Нет доступа к профилю пользователя. Проверьте правила Firestore.'
          );
        } else {
          setAuthError(
            'Не удалось загрузить профиль пользователя. Попробуйте обновить страницу.'
          );
        }

        setIsAuthLoading(false);
      }
    });

    return () => {
      active = false;
      authSequence++;
      clearProfileListener();
      unsubscribeAuth?.();
    };
  }, []);

  // -----------------------------------------------------------------------
  // ЕСЛИ АДМИН ОТКЛЮЧИЛ МОДУЛЬ, ПОКА УЧЕНИК НАХОДИТСЯ В НЁМ
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!appReady) return;

    const viewModule = {
      stats: 'stats',
      typing: 'typing',
      hotkeys: 'hotkeys',
      code: 'code',
      flashcards: 'flashcards',
      excel: 'excel'
    };

    const requiredModule = viewModule[view];

    if (
      requiredModule &&
      !allowedModules.includes(requiredModule)
    ) {
      setView('menu');
    }

    if (view === 'admin' && !isAdmin) {
      setView('menu');
    }

    if (
      isChatOpen &&
      !allowedModules.includes('chat')
    ) {
      setIsChatOpen(false);
    }
  }, [
    appReady,
    view,
    allowedModules,
    isAdmin,
    isChatOpen
  ]);

  // -----------------------------------------------------------------------
  // УСТРОЙСТВО + ЛОКАЛЬНАЯ ИСТОРИЯ
  // Не переключаем view здесь — Firebase управляет моментом показа LMS.
  // -----------------------------------------------------------------------

  useEffect(() => {
    let alive = true;

    document.onkeydown = function (e) {
      if (e.keyCode === 123) return false;

      if (
        e.ctrlKey &&
        e.shiftKey &&
        (
          e.keyCode === 'I'.charCodeAt(0) ||
          e.keyCode === 'C'.charCodeAt(0)
        )
      ) {
        return false;
      }
    };

    loadData();

    async function prepareDevice() {
      try {
        if (typeof computeFingerprint === 'function') {
          const fingerprint = await computeFingerprint();

          if (alive) {
            setFp(fingerprint);
          }
        }
      } catch (error) {
        console.warn('[Ultimate LMS Fingerprint]', error);
      }
    }

    prepareDevice();

    return () => {
      alive = false;
      document.onkeydown = null;
    };
  }, []);

  // Логируем посетителя только после того,
  // как Firebase определил состояние входа.
  // Если пользователь уже был авторизован, Discord получит также email/имя.
  useEffect(() => {
    if (isAuthLoading) return;

    if (typeof logVisitor === 'function') {
      logVisitor().catch?.((error) => {
        console.warn('[Ultimate LMS Visitor]', error);
      });
    }
  }, [isAuthLoading, user?.uid]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // -----------------------------------------------------------------------
  // ЛОКАЛЬНЫЕ НАБОРЫ ТЕСТОВ
  // -----------------------------------------------------------------------

  const addSet = (name) => {
    if (!name) return;
    if (sets.includes(name)) return alert('Уже есть!');

    const newSets = [...sets, name];
    setSets(newSets);

    localStorage.setItem(
      'test_sets_list',
      JSON.stringify(newSets)
    );

    localStorage.setItem(
      'tests_' + name,
      JSON.stringify([])
    );
  };

  const deleteSet = (name) => {
    const newSets = sets.filter(s => s !== name);

    setSets(newSets);

    localStorage.setItem(
      'test_sets_list',
      JSON.stringify(newSets)
    );

    localStorage.removeItem('tests_' + name);
  };

  const openSet = (name) => {
    setCurrentSet(name);

    setTests(
      JSON.parse(
        localStorage.getItem('tests_' + name)
      ) || []
    );

    setView('set_menu');
  };

  const openTeacherAssignedTest = (testInfo) => {
    // Искусственная задержка больше не нужна.
    setCurrentSet(testInfo.title);
    setTests(
      Array.isArray(testInfo.data)
        ? testInfo.data
        : []
    );
    setView('set_menu');
  };

  const removeTeacherTestStudent = async (testId, testTitle) => {
    if (!user?.uid || !Array.isArray(teacherTests)) return;

    try {
      const updatedTests =
        teacherTests.filter(t => t.id !== testId);

      await window.db
        .collection('users')
        .doc(user.uid)
        .update({
          assignedTests: updatedTests
        });

      // Realtime listener сам синхронизирует teacherTests.
    } catch (error) {
      console.error(
        '[Ultimate LMS Remove Assigned Test]',
        error
      );

      alert('Ошибка при удалении теста');
    }
  };

  const changeNickname = async () => {
    if (!user?.uid) return;

    const newNick = prompt(
      'Введите ваш новый никнейм (будет виден в чате):',
      userNickname || ''
    );

    if (!newNick || !newNick.trim()) return;

    try {
      await window.db
        .collection('users')
        .doc(user.uid)
        .update({
          nickname: newNick.trim()
        });

      // Ник обновится через realtime listener.
    } catch (error) {
      console.error('[Ultimate LMS Nickname]', error);
      alert('Ошибка при сохранении никнейма!');
    }
  };

  // -----------------------------------------------------------------------
  // GOOGLE LOGIN
  //
  // Создание/проверка users/{uid} теперь выполняется в общем Firebase gate.
  // Поэтому здесь больше нет второй копии логики регистрации.
  // -----------------------------------------------------------------------

  const handleDirectLogin = async () => {
    try {
      setAuthError('');

      if (typeof window.lmsGoogleSignIn === 'function') {
        await window.lmsGoogleSignIn();
        return;
      }

      // Запасной вариант на случай, если 3_auth.js ещё не обновлён.
      const provider =
        new window.firebase.auth.GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await window.auth.signInWithPopup(provider);
    } catch (error) {
      console.error('[Ultimate LMS Google Auth]', error);

      const ignoredErrors = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request'
      ];

      if (ignoredErrors.includes(error?.code)) {
        return;
      }

      if (error?.code === 'auth/popup-blocked') {
        alert(
          'Браузер заблокировал окно Google. Разрешите всплывающие окна для этого сайта.'
        );
        return;
      }

      if (error?.code === 'auth/network-request-failed') {
        alert(
          'Ошибка сети. Проверьте интернет-соединение.'
        );
        return;
      }

      alert(
        'Произошла ошибка при входе. Попробуйте ещё раз.'
      );
    }
  };

  // -----------------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------------

  return (
    <>
      <LowPolyBackground theme={theme} />

      {appReady && (
        view === 'menu' ||
        view === 'stats' ||
        view === 'typing' ||
        view === 'hotkeys' ||
        view === 'code' ||
        view === 'flashcards' ||
        view === 'excel' ||
        view === 'admin'
      ) && (
        <div className="mobile-burger-fixed">
          <Button
            variant="muted"
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: 54,
              height: 54,
              padding: 0,
              borderRadius: '16px',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            ☰
          </Button>
        </div>
      )}

      {/* Sidebar вообще не создаётся, пока профиль не подтверждён. */}
      {appReady && (
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
      )}

      <AnimatePresence>
        {appReady &&
          isChatOpen &&
          allowedModules.includes('chat') && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsChatOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 2000
                }}
              />

              <ChatPanel
                user={user}
                onClose={() => setIsChatOpen(false)}
              />
            </>
          )}
      </AnimatePresence>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 10px'
        }}
      >
        <AnimatePresence mode="wait">

          {/* -------------------------------------------------- */}
          {/* FIREBASE / ПРОФИЛЬ ЕЩЁ НЕ ГОТОВЫ                    */}
          {/* -------------------------------------------------- */}

          {isAuthLoading && (
            <motion.div
              key="loading"
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.98
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.985
              }}
              className="glass-panel"
              style={{
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px',
                padding: '42px 26px',
                borderRadius: '26px'
              }}
            >
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  width: 44,
                  height: 44,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  border: '4px solid rgba(139,92,246,.16)',
                  borderTopColor: '#8b5cf6'
                }}
              />

              <h2
                style={{
                  margin: '0 0 8px',
                  color: 'var(--text-main)'
                }}
              >
                Ultimate LMS
              </h2>

              <p
                style={{
                  margin: 0,
                  color: 'var(--text-sec)',
                  fontSize: '13px',
                  lineHeight: 1.6
                }}
              >
                Проверяем аккаунт и загружаем актуальные настройки…
              </p>
            </motion.div>
          )}

          {/* -------------------------------------------------- */}
          {/* FIREBASE ОШИБКА                                    */}
          {/* -------------------------------------------------- */}

          {!isAuthLoading && authError && (
            <motion.div
              key="auth-error"
              initial={{
                opacity: 0,
                y: 12
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0
              }}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: 430,
                padding: '34px 28px',
                textAlign: 'center',
                borderRadius: 24
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 15,
                  margin: '0 auto 16px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(239,68,68,.1)',
                  color: '#ef4444',
                  fontSize: 23
                }}
              >
                !
              </div>

              <h3
                style={{
                  margin: '0 0 8px',
                  color: 'var(--text-main)'
                }}
              >
                Не удалось открыть профиль
              </h3>

              <p
                style={{
                  margin: '0 0 20px',
                  color: 'var(--text-sec)',
                  fontSize: 13,
                  lineHeight: 1.6
                }}
              >
                {authError}
              </p>

              <Button
                onClick={() => window.location.reload()}
                style={{
                  minHeight: 48
                }}
              >
                Повторить
              </Button>
            </motion.div>
          )}

          {/* -------------------------------------------------- */}
          {/* НЕ АВТОРИЗОВАН                                     */}
          {/* -------------------------------------------------- */}

          {!isAuthLoading && !authError && !user && (
            <div
              key="landing-wrapper"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflowY: 'auto',
                zIndex: 5000,
                background: '#050308'
              }}
            >
              <LandingView
                onLogin={handleDirectLogin}
              />
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* ADMIN                                              */}
          {/* -------------------------------------------------- */}

          {appReady &&
            view === 'admin' &&
            isAdmin && (
              <AdminPanel />
            )}

          {/* -------------------------------------------------- */}
          {/* TESTS                                              */}
          {/* teacherTests здесь уже гарантированно загружен.    */}
          {/* -------------------------------------------------- */}

          {appReady &&
            [
              'menu',
              'set_menu',
              'timer_setup',
              'test',
              'result',
              'review'
            ].includes(view) && (
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
                sets={sets}
                addSet={addSet}
                deleteSet={deleteSet}
                openSet={openSet}
                teacherTests={teacherTests}
                openTeacherAssignedTest={openTeacherAssignedTest}
                removeTeacherTestStudent={removeTeacherTestStudent}
              />
            )}

          {/* -------------------------------------------------- */}
          {/* MODULES                                            */}
          {/* -------------------------------------------------- */}

          {appReady &&
            view === 'stats' &&
            allowedModules.includes('stats') && (
              <StatsView
                history={history}
                setHistory={setHistory}
                userData={userData}
              />
            )}

          {appReady &&
            view === 'typing' &&
            allowedModules.includes('typing') && (
              <motion.div
                key="typing_test"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '1100px'
                }}
              >
                <TypingTest />
              </motion.div>
            )}

          {appReady &&
            view === 'hotkeys' &&
            allowedModules.includes('hotkeys') && (
              <motion.div
                key="hotkey_trainer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '700px'
                }}
              >
                <HotkeyTrainer />
              </motion.div>
            )}

          {appReady &&
            view === 'code' &&
            allowedModules.includes('code') && (
              <motion.div
                key="code_playground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '1200px'
                }}
              >
                <CodePlayground />
              </motion.div>
            )}

          {appReady &&
            view === 'flashcards' &&
            allowedModules.includes('flashcards') && (
              <motion.div
                key="flashcards_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '1000px'
                }}
              >
                <FlashcardsLMS
                  onBack={() => setView('menu')}
                />
              </motion.div>
            )}

          {appReady &&
            view === 'excel' &&
            allowedModules.includes('excel') && (
              <motion.div
                key="excel_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '1000px'
                }}
              >
                <ExcelTrainerLMS
                  onBack={() => setView('menu')}
                />
              </motion.div>
            )}

        </AnimatePresence>

        {/* ПЛАВАЮЩИЙ ИИ-АССИСТЕНТ */}
        {appReady &&
          allowedModules.includes('ai_chat') &&
          window.AIChatWidget && (
            <window.AIChatWidget />
          )}

      </div>
    </>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(<App />);
