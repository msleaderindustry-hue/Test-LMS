// --- 11_tests_module.js ---
(function () {
    const { 
        useState, 
        useEffect, 
        useRef,
        motion, 
        AnimatePresence, 
        Button, 
        Input, 
        TestQuestionCard, 
        ReviewView, 
        captureViolation, 
        sendTestResultToDiscord, 
        shuffleArray, 
        GooeyText 
    } = window;

    // --- ЛЕГКОВЕСНЫЕ SVG-ИКОНКИ БЕЗ ЗАВИСИМОСТЕЙ ---
    const Icon = ({ path, size = 18, className = "", color = "currentColor", style = {} }) => (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
            className={className}
        >
            {path}
        </svg>
    );

    const Icons = {
        Cloud: (props) => <Icon {...props} path={<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>} />,
        Folder: (props) => <Icon {...props} path={<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>} />,
        Trash: (props) => <Icon {...props} path={<><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></>} />,
        Plus: (props) => <Icon {...props} path={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />,
        ArrowLeft: (props) => <Icon {...props} path={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />,
        Printer: (props) => <Icon {...props} path={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>} />,
        Upload: (props) => <Icon {...props} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>} />,
        Play: (props) => <Icon {...props} path={<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>} />,
        Clock: (props) => <Icon {...props} path={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
        CheckCircle: (props) => <Icon {...props} path={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />,
        RotateCcw: (props) => <Icon {...props} path={<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>} />,
        Eye: (props) => <Icon {...props} path={<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>} />,
        Home: (props) => <Icon {...props} path={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />,
        Save: (props) => <Icon {...props} path={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>} />,
        Settings: (props) => <Icon {...props} path={<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>} />,
        ListNumbers: (props) => <Icon {...props} path={<><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></>} />,
        Flag: (props) => <Icon {...props} path={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>} />
    };

    const TestsLMS = ({ 
        view, setView, currentSet, tests, setTests, user, 
        history, setHistory, fp, sets, addSet, deleteSet, openSet, 
        teacherTests, openTeacherAssignedTest, removeTeacherTestStudent 
    }) => {
        // --- ЛОКАЛЬНЫЕ СОСТОЯНИЯ ---
        const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
        const [isResultSaved, setIsResultSaved] = useState(false);
        const [timeLeft, setTimeLeft] = useState(1200);
        const [customTime, setCustomTime] = useState('20');
        const [customQCount, setCustomQCount] = useState('');
        const [isAnimating, setIsAnimating] = useState(false);
        const [newSetName, setNewSetName] = useState('');
        const [studentName, setStudentName] = useState(user?.displayName || user?.name || '');

        // --- АНТИЧИТ ---
        useEffect(() => {
            if (view !== 'test') return;
            const handleVisibility = () => { 
                if (document.hidden && typeof captureViolation === 'function') {
                    captureViolation("ВНИМАНИЕ: Смена вкладки / Сворачивание", fp);
                }
            };
            const handleBlur = () => { 
                if (typeof captureViolation === 'function') {
                    captureViolation("ВНИМАНИЕ: Потеря фокуса (переход в другое окно)", fp);
                }
            };
            const handlePaste = (e) => { 
                if (typeof captureViolation === 'function') {
                    captureViolation("ПЕРЕХВАТ: Попытка вставки (Paste)", fp, [{ 
                        name: "Содержимое", 
                        value: `\`\`\`${e.clipboardData?.getData('text') || 'пусто'}\`\`\`` 
                    }]); 
                }
            };
            
            window.addEventListener('visibilitychange', handleVisibility);
            window.addEventListener('blur', handleBlur);
            window.addEventListener('paste', handlePaste);
            
            return () => {
                window.removeEventListener('visibilitychange', handleVisibility);
                window.removeEventListener('blur', handleBlur);
                window.removeEventListener('paste', handlePaste);
            };
        }, [view, fp]);

        // --- ТАЙМЕР ТЕСТА ---
        useEffect(() => {
            if (view !== 'test') return;
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }, [view]);

        useEffect(() => { 
            if (timeLeft === 0 && view === 'test') finishTest(); 
        }, [timeLeft, view]);

        const formatTime = (s) => {
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return `${m}:${sec < 10 ? '0' + sec : sec}`;
        };

        // --- ЛОГИКА ИМПОРТА И СТАРТА ---
        const importJSON = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    const normalized = data.map(t => ({
                        question: t.question || '',
                        questionImg: t.questionImg || null,
                        variants: (t.variants || []).map(v => typeof v === 'object' ? v : { text: String(v), img: null }),
                        correctIndex: t.correctIndex
                    }));
                    setTests(normalized);
                    localStorage.setItem('tests_' + currentSet, JSON.stringify(normalized));
                    alert(`Успешно импортировано вопросов: ${normalized.length}`);
                } catch (err) {
                    alert('Ошибка парсинга файла JSON. Проверьте формат.');
                }
            };
            reader.readAsText(file);
        };

        const startTest = () => {
            if (!tests || tests.length === 0) return alert('В выбранном тесте нет вопросов!');
            setCustomQCount(String(tests.length));
            setView('timer_setup');
        };

        const launchTestWithTimer = () => {
            const mins = Math.max(1, parseInt(customTime, 10) || 20);
            let qCount = parseInt(customQCount, 10);
            if (!qCount || qCount <= 0 || qCount > tests.length) {
                qCount = tests.length;
            }

            const fullList = shuffleArray([...tests]);
            const selectedQuestions = fullList.slice(0, qCount);
            const finalQuestions = selectedQuestions.map(t => {
                let varsWithFlag = t.variants.map((v, i) => ({ ...v, _isCorrectOriginal: i === t.correctIndex }));
                varsWithFlag = shuffleArray(varsWithFlag);
                return { 
                    ...t, 
                    variants: varsWithFlag, 
                    correctIndex: varsWithFlag.findIndex(v => v._isCorrectOriginal) 
                };
            });

            setIsResultSaved(false);
            setTimeLeft(mins * 60);
            setTestSession({
                questions: finalQuestions,
                currentIdx: 0,
                answers: new Array(finalQuestions.length).fill(null),
                score: 0
            });
            setView('test');
        };

        const handleAnswer = (variantIdx) => {
            if (testSession.answers[testSession.currentIdx] !== null) return;
            const newAnswers = [...testSession.answers];
            newAnswers[testSession.currentIdx] = variantIdx;
            
            setTestSession(prev => ({ ...prev, answers: newAnswers }));
            setIsAnimating(true);
            
            setTimeout(() => {
                if (testSession.currentIdx < testSession.questions.length - 1) {
                    setTestSession(prev => ({ ...prev, currentIdx: prev.currentIdx + 1 }));
                }
                setIsAnimating(false);
            }, 600);
        };

        const handleNavClick = (i) => {
            if (isAnimating || i === testSession.currentIdx) return;
            setIsAnimating(true);
            setTestSession(p => ({ ...p, currentIdx: i }));
            setTimeout(() => setIsAnimating(false), 250);
        };

        const finishTest = () => {
            let correct = 0;
            testSession.questions.forEach((q, i) => {
                if (testSession.answers[i] === q.correctIndex) correct++;
            });
            setTestSession(prev => ({ ...prev, score: correct }));
            
            if (testSession.questions.length > 0 && (correct / testSession.questions.length >= 0.5) && window.confetti) {
                window.confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
            }
            setView('result');
        };

        // --- УПРАВЛЕНИЕ С КЛАВИАТУРЫ ---
        useEffect(() => {
            if (view !== 'test') return;
            const handleKeyDown = (e) => {
                if (isAnimating) return;
                const { currentIdx, questions, answers } = testSession;
                
                if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    if (currentIdx < questions.length - 1) handleNavClick(currentIdx + 1);
                } else if (e.key === 'ArrowLeft') {
                    if (currentIdx > 0) handleNavClick(currentIdx - 1);
                } else if (e.key >= '1' && e.key <= '9') {
                    const variantIndex = parseInt(e.key, 10) - 1;
                    if (questions[currentIdx] && variantIndex < questions[currentIdx].variants.length) {
                        if (answers[currentIdx] === null) handleAnswer(variantIndex);
                    }
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, [view, testSession, isAnimating]);

        const restartMistakes = () => {
            const wrongQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
            if (wrongQuestionsRaw.length === 0) return;

            const reShuffledQuestions = wrongQuestionsRaw.map(q => {
                const newVars = shuffleArray([...q.variants]);
                const newCorrectIdx = newVars.findIndex(v => v._isCorrectOriginal);
                return { ...q, variants: newVars, correctIndex: newCorrectIdx };
            });

            const mins = Math.max(1, parseInt(customTime, 10) || 20);
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

        const saveResult = async (rawName) => {
            const name = (rawName || studentName || '').trim();
            if (!name) return alert('Пожалуйста, укажите имя!');

            const total = testSession.questions.length;
            const percent = total > 0 ? Math.round((testSession.score / total) * 100) : 0;
            const scoreData = {
                student: name,
                percent,
                score: testSession.score,
                total,
                topic: currentSet
            };

            const failedQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
            const failedQuestions = failedQuestionsRaw.map(q => {
                const originalIndex = testSession.questions.indexOf(q);
                const userAnsIdx = testSession.answers[originalIndex];
                return {
                    question: q.question.replace(/<[^>]+>/g, ''),
                    userAnsText: userAnsIdx !== null && q.variants[userAnsIdx] ? q.variants[userAnsIdx].text : "Пропустил",
                    correctAnsText: q.variants[q.correctIndex]?.text || "—"
                };
            });

            if (typeof sendTestResultToDiscord === 'function') {
                sendTestResultToDiscord(scoreData, failedQuestions, user ? user.email : "Неизвестно", fp);
            }

            const newRecord = {
                id: Date.now(),
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5),
                ...scoreData
            };

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

        const handlePrint = () => {
            const area = document.getElementById('printArea');
            if (!area) return;
            let html = `
                <div class="print-header">
                    <h1>ТЕСТ: ${currentSet}</h1>
                    <div style="display:flex;justify-content:space-between;margin-top:15px;font-size:14px;">
                        <div>ФИО: <span class="print-input" style="display:inline-block;border-bottom:1px solid #000;width:250px;"></span></div>
                        <div>Оценка: <span class="print-input" style="display:inline-block;border-bottom:1px solid #000;width:80px;"></span></div>
                    </div>
                </div>
            `;
            const printTests = tests.map(t => ({ ...t, variants: shuffleArray([...t.variants]) }));
            printTests.forEach((t, i) => {
                html += `<div class="print-q" style="margin-top:20px;"><h4>${i + 1}. ${t.question}</h4>`;
                if (t.questionImg) html += `<img src="${t.questionImg}" style="max-width:220px;display:block;margin:10px 0;">`;
                t.variants.forEach((v, vIdx) => {
                    const char = String.fromCharCode(65 + vIdx);
                    html += `<div class="print-var" style="padding-left:15px;margin:4px 0;">${char}) ${v.text} ${v.img ? '(см. рис)' : ''}</div>`;
                });
                html += `</div>`;
            });
            area.innerHTML = html;
            if (window.MathJax) {
                MathJax.typesetPromise([area]).then(() => {
                    setTimeout(() => { window.print(); }, 600);
                });
            } else {
                window.print();
            }
        };

        // Расчёт метрик текущего теста
        const answeredCount = testSession.answers.filter(a => a !== null).length;
        const totalQuestions = testSession.questions.length;
        const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
        const isTimeCrit = timeLeft <= 60 && timeLeft > 0;

        return (
            <AnimatePresence mode="wait">
                {/* 1. ГЛАВНОЕ МЕНЮ С ТЕСТАМИ */}
                {view === 'menu' && (
                    <motion.div 
                        key="menu" 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -15 }} 
                        transition={{ duration: 0.25 }}
                        className="glass-panel" 
                        style={{ width: '100%', maxWidth: '820px', padding: '30px' }}
                    >
                        <GooeyText 
                            texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} 
                            style={{ margin: '0 0 25px 0', paddingTop: 5 }} 
                            morphTime={1} 
                            cooldownTime={1.5} 
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-sec)' }}>
                                Доступные модули тестирования
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-sec)', opacity: 0.8 }}>
                                Всего: {(teacherTests?.length || 0) + (sets?.length || 0)}
                            </span>
                        </div>

                        <div style={{ maxHeight: 340, overflowY: 'auto', marginBottom: 20, paddingRight: 6 }}>
                            {/* Назначенные преподавателем */}
                            {teacherTests?.map(test => (
                                <div key={test.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                    <Button 
                                        variant="muted" 
                                        onClick={() => openTeacherAssignedTest(test)} 
                                        style={{ 
                                            flex: 1, 
                                            justifyContent: 'flex-start', 
                                            textAlign: 'left', 
                                            padding: '12px 18px', 
                                            minWidth: 0, 
                                            minHeight: '56px',
                                            borderRadius: '14px',
                                            border: '1px solid rgba(0, 198, 255, 0.4)',
                                            background: 'rgba(0, 198, 255, 0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12
                                        }}
                                    >
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10, 
                                            background: 'rgba(0, 198, 255, 0.15)', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Icons.Cloud size={19} color="#00c6ff" />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ wordBreak: 'break-word', color: '#00c6ff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
                                                {test.title}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>От преподавателя</div>
                                        </div>
                                    </Button>
                                    <Button 
                                        variant="red" 
                                        style={{ width: 48, height: 56, padding: 0, flexShrink: 0, borderRadius: '14px' }} 
                                        onClick={() => removeTeacherTestStudent(test.id, test.title)}
                                        title="Удалить тест"
                                    >
                                        <Icons.Trash size={18} />
                                    </Button>
                                </div>
                            ))}

                            {/* Пользовательские наборы */}
                            {sets?.map(name => (
                                <div key={name} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                    <Button 
                                        variant="muted" 
                                        onClick={() => openSet(name)} 
                                        style={{ 
                                            flex: 1, 
                                            justifyContent: 'flex-start', 
                                            textAlign: 'left', 
                                            padding: '12px 18px', 
                                            minWidth: 0, 
                                            minHeight: '56px',
                                            borderRadius: '14px',
                                            border: '1px solid var(--glass-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12
                                        }}
                                    >
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10, 
                                            background: 'rgba(255, 255, 255, 0.08)', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Icons.Folder size={18} color="var(--primary-color, #764ba2)" />
                                        </div>
                                        <span style={{ wordBreak: 'break-word', lineHeight: '1.3', fontSize: 15, fontWeight: 600 }}>
                                            {name}
                                        </span>
                                    </Button>
                                    <Button 
                                        variant="red" 
                                        style={{ width: 48, height: 56, padding: 0, flexShrink: 0, borderRadius: '14px' }} 
                                        onClick={() => deleteSet(name)}
                                        title="Удалить набор"
                                    >
                                        <Icons.Trash size={18} />
                                    </Button>
                                </div>
                            ))}

                            {(!sets || sets.length === 0) && (!teacherTests || teacherTests.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-sec)' }}>
                                    <Icons.Folder size={38} style={{ opacity: 0.35, marginBottom: 10 }} />
                                    <p style={{ margin: 0, fontSize: 15 }}>Список тестов пуст. Создайте свой первый тест ниже!</p>
                                </div>
                            )}
                        </div>

                        {/* Форма добавления нового набора */}
                        <div style={{
                            display: 'flex', 
                            gap: 10, 
                            alignItems: 'center',
                            background: 'rgba(128, 128, 128, 0.06)',
                            padding: 8,
                            borderRadius: 16,
                            border: '1px solid var(--glass-border)'
                        }}>
                            <Input 
                                id="newSetName" 
                                placeholder="Введите название новой темы..." 
                                value={newSetName}
                                onChange={(e) => setNewSetName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newSetName.trim()) {
                                        addSet(newSetName.trim());
                                        setNewSetName('');
                                    }
                                }}
                                style={{ margin: 0, flex: 1, border: 'none', background: 'transparent' }} 
                            />
                            <Button 
                                style={{ width: 50, height: 44, padding: 0, margin: 0, borderRadius: 12 }} 
                                onClick={() => { 
                                    if (!newSetName.trim()) return;
                                    addSet(newSetName.trim());
                                    setNewSetName('');
                                }}
                                title="Создать тест"
                            >
                                <Icons.Plus size={20} />
                            </Button>
                        </div>

                        <div style={{ marginTop: 25, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.6 }}>
                            © 2026 Ultimate LMS Platform. All Rights Reserved.
                        </div>
                    </motion.div>
                )}

                {/* 2. МЕНЮ ВЫБРАННОГО ТЕСТА (SET MENU) */}
                {view === 'set_menu' && (
                    <motion.div 
                        key="set" 
                        initial={{ opacity: 0, scale: 0.96 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.96 }} 
                        transition={{ duration: 0.2 }}
                        className="glass-panel" 
                        style={{ width: '100%', maxWidth: '600px', padding: '30px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button 
                                variant="muted" 
                                style={{ width: 'auto', padding: '0 18px', height: 40, minHeight: 40, fontSize: 13, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }} 
                                onClick={() => setView('menu')}
                            >
                                <Icons.ArrowLeft size={16} /> Назад
                            </Button>
                            <span style={{ 
                                fontSize: 12, 
                                fontWeight: 700, 
                                padding: '6px 14px', 
                                background: 'rgba(255,255,255,0.08)', 
                                borderRadius: 20, 
                                color: 'var(--text-sec)'
                            }}>
                                Вопросов: <b style={{ color: 'var(--text-main)' }}>{tests.length}</b>
                            </span>
                        </div>

                        <h2 style={{ textAlign: 'center', margin: '25px 0 10px', fontSize: 26, wordBreak: 'break-word', fontWeight: 800 }}>
                            {currentSet}
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-sec)', fontSize: 14, margin: '0 0 25px 0' }}>
                            Выберите действие для управления или прохождения тестирования
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                            <Button 
                                variant="muted" 
                                onClick={handlePrint}
                                style={{ height: 48, borderRadius: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}
                            >
                                <Icons.Printer size={18} /> Печать
                            </Button>
                            <label 
                                className="import-label" 
                                style={{ 
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                                    color: 'white', 
                                    height: 48, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    borderRadius: 12, 
                                    cursor: 'pointer', 
                                    gap: 8,
                                    fontWeight: 600,
                                    boxShadow: '0 4px 15px rgba(0, 242, 254, 0.25)'
                                }}
                            >
                                <Icons.Upload size={18} /> Импорт JSON
                                <input type="file" style={{ display: 'none' }} accept=".json" onChange={importJSON} />
                            </label>
                        </div>

                        <Button 
                            variant="primary"
                            onClick={startTest} 
                            style={{ 
                                width: '100%',
                                fontSize: 18, 
                                height: 60, 
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                boxShadow: '0 8px 25px rgba(118, 75, 162, 0.35)'
                            }}
                        >
                            <Icons.Play size={22} /> НАЧАТЬ ТЕСТ
                        </Button>
                    </motion.div>
                )}

                {/* 3. НАСТРОЙКА ТАЙМЕРА И ПАРАМЕТРОВ */}
                {view === 'timer_setup' && (
                    <motion.div 
                        key="timer" 
                        initial={{ scale: 0.92, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.92, opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                        className="glass-panel" 
                        style={{ width: '100%', maxWidth: 440, padding: '32px', textAlign: 'center' }}
                    >
                        <div style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: 'rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Icons.Settings size={26} color="var(--primary-color, #764ba2)" />
                        </div>

                        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Параметры тестирования</h2>
                        <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-sec)' }}>Настройте лимит времени и число вопросов</p>

                        <div style={{ marginBottom: 18, textAlign: 'left' }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icons.Clock size={16} /> Время на прохождение (в минутах):
                            </label>
                            <Input 
                                type="number" 
                                min="1"
                                max="180"
                                value={customTime} 
                                onChange={e => setCustomTime(e.target.value)} 
                                style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, borderRadius: 14, height: 52 }} 
                            />
                        </div>

                        <div style={{ marginBottom: 26, textAlign: 'left' }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icons.ListNumbers size={16} /> Вопросов для теста (Всего доступно: {tests.length}):
                            </label>
                            <Input 
                                type="number" 
                                min="1"
                                max={tests.length}
                                value={customQCount} 
                                onChange={e => setCustomQCount(e.target.value)} 
                                style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, borderRadius: 14, height: 52 }} 
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Button 
                                variant="green" 
                                onClick={launchTestWithTimer} 
                                style={{ 
                                    height: 52, 
                                    fontSize: 16, 
                                    fontWeight: 700, 
                                    borderRadius: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8 
                                }}
                            >
                                <Icons.Play size={18} /> Запустить тест
                            </Button>
                            <Button 
                                variant="muted" 
                                onClick={() => setView('set_menu')}
                                style={{ height: 44, borderRadius: 12, fontSize: 14 }}
                            >
                                Отмена
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* 4. ПРОХОЖДЕНИЕ ТЕСТА */}
                {view === 'test' && (
                    <motion.div 
                        key="test-wrapper" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="test-layout"
                        style={{ width: '100%', maxWidth: '1100px', display: 'flex', gap: 20, alignItems: 'flex-start' }}
                    >
                        {/* Левая колонка: Вопрос и варианты */}
                        <div className="question-column" style={{ flex: 1, minWidth: 0 }}>
                            {/* Индикатор прогресса сверху карточки */}
                            <div style={{ 
                                height: 6, 
                                width: '100%', 
                                background: 'rgba(128,128,128,0.15)', 
                                borderRadius: 10, 
                                overflow: 'hidden', 
                                marginBottom: 15 
                            }}>
                                <motion.div 
                                    style={{ 
                                        height: '100%', 
                                        background: 'linear-gradient(90deg, #4facfe, #00f2fe)', 
                                        borderRadius: 10 
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <TestQuestionCard 
                                    key={testSession.currentIdx} 
                                    question={testSession.questions[testSession.currentIdx]} 
                                    index={testSession.currentIdx} 
                                    answers={testSession.answers} 
                                    onAnswer={handleAnswer} 
                                />
                            </AnimatePresence>

                            {/* Подсказка управления */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginTop: 12, 
                                fontSize: 12, 
                                color: 'var(--text-sec)',
                                opacity: 0.8
                            }}>
                                <span>Навигация: <b>←</b> / <b>→</b> (или Enter)</span>
                                <span>Ответ клавишами: <b>1 - 9</b></span>
                            </div>
                        </div>

                        {/* Правая колонка: Таймер, навигация по сетке и завершение */}
                        <div className="sidebar-column" style={{ width: 300, flexShrink: 0 }}>
                            <div className="sidebar-content glass-panel" style={{ padding: 20, borderRadius: 20 }}>
                                {/* Таймер с анимацией при < 60 сек */}
                                <div 
                                    className="sidebar-timer" 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: 8,
                                        fontSize: 22, 
                                        fontWeight: 800,
                                        padding: '12px',
                                        borderRadius: 14,
                                        background: isTimeCrit ? 'rgba(245, 101, 101, 0.15)' : 'rgba(128, 128, 128, 0.08)',
                                        color: isTimeCrit ? '#f56565' : 'var(--text-main)',
                                        border: isTimeCrit ? '1px solid #f56565' : '1px solid var(--glass-border)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Icons.Clock size={20} color={isTimeCrit ? '#f56565' : 'currentColor'} />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    fontSize: 12, 
                                    color: 'var(--text-sec)', 
                                    margin: '15px 0 10px',
                                    fontWeight: 600
                                }}>
                                    <span>Вопросы</span>
                                    <span>Отвечено: {answeredCount} из {totalQuestions}</span>
                                </div>

                                {/* Компактная сетка навигации */}
                                <div className="nav-grid-wrapper" style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 15 }}>
                                    <div className="nav-grid-compact">
                                        {testSession.questions.map((_, i) => {
                                            const isCurrent = i === testSession.currentIdx;
                                            const isAnswered = testSession.answers[i] !== null;
                                            const isCorrect = isAnswered && testSession.answers[i] === testSession.questions[i].correctIndex;
                                            
                                            let bg = 'var(--nav-item-bg, rgba(255,255,255,0.06))';
                                            let txt = 'var(--nav-item-text, var(--text-main))';
                                            let border = '1px solid transparent';

                                            if (isCurrent) {
                                                bg = '#764ba2';
                                                txt = 'white';
                                                border = '1px solid #a479e2';
                                            } else if (isAnswered) {
                                                bg = isCorrect ? '#48bb78' : '#f56565';
                                                txt = 'white';
                                            }

                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`nav-item ${isAnimating ? 'disabled' : ''}`} 
                                                    style={{ 
                                                        background: bg, 
                                                        color: txt, 
                                                        border,
                                                        borderRadius: 8,
                                                        cursor: isAnimating ? 'default' : 'pointer',
                                                        transition: 'transform 0.15s ease'
                                                    }} 
                                                    onClick={() => handleNavClick(i)}
                                                >
                                                    {i + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button 
                                    variant="green" 
                                    onClick={finishTest} 
                                    style={{ 
                                        width: '100%', 
                                        height: 48, 
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        fontWeight: 700
                                    }}
                                >
                                    <Icons.Flag size={18} /> Завершить тест
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 5. ЭКРАН РЕЗУЛЬТАТОВ */}
                {view === 'result' && (
                    <motion.div 
                        key="res" 
                        initial={{ scale: 0.94, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.94, opacity: 0 }} 
                        transition={{ duration: 0.25 }}
                        className="glass-panel" 
                        style={{ textAlign: 'center', width: '100%', maxWidth: 520, padding: '36px 30px' }}
                    >
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: (testSession.score / testSession.questions.length >= 0.5) 
                                ? 'rgba(72, 187, 120, 0.15)' 
                                : 'rgba(245, 101, 101, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            {(testSession.score / testSession.questions.length >= 0.5) 
                                ? <Icons.CheckCircle size={36} color="#48bb78" /> 
                                : <Icons.RotateCcw size={36} color="#f56565" />}
                        </div>

                        <h2 style={{ margin: '0 0 5px', fontSize: 24, fontWeight: 800 }}>
                            {testSession.questions.length > 0 && (testSession.score / testSession.questions.length >= 0.8) 
                                ? 'Великолепный результат!' 
                                : (testSession.score / testSession.questions.length >= 0.5) 
                                ? 'Хорошая работа!' 
                                : 'Тест не пройден'}
                        </h2>

                        <h1 style={{ 
                            fontSize: 70, 
                            margin: '8px 0', 
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            background: 'var(--primary-grad, linear-gradient(135deg, #667eea 0%, #764ba2 100%))', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent' 
                        }}>
                            {testSession.questions.length > 0 ? Math.round(testSession.score / testSession.questions.length * 100) : 0}%
                        </h1>

                        <div style={{ 
                            padding: '12px 18px', 
                            background: 'rgba(128,128,128,0.08)', 
                            borderRadius: '16px', 
                            marginBottom: '22px',
                            display: 'inline-flex',
                            gap: 15,
                            fontSize: 15,
                            fontWeight: 700
                        }}>
                            <span>Правильно: <b style={{ color: '#48bb78' }}>{testSession.score}</b></span>
                            <span style={{ color: 'var(--text-sec)' }}>/</span>
                            <span>Всего: <b>{testSession.questions.length}</b></span>
                        </div>

                        {/* Блок сохранения результатов */}
                        <div style={{ 
                            background: 'rgba(128,128,128,0.04)', 
                            padding: 20, 
                            borderRadius: 18, 
                            marginBottom: 25, 
                            border: '1px solid var(--glass-border)' 
                        }}>
                            {!isResultSaved ? (
                                <>
                                    <Input 
                                        id="sName" 
                                        placeholder="Введите ваше имя для сохранения..." 
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        style={{ textAlign: 'center', marginTop: 0, marginBottom: 12, height: 46, borderRadius: 12, fontSize: 15 }} 
                                    />
                                    <Button 
                                        variant="teal" 
                                        onClick={() => saveResult(document.getElementById('sName')?.value || studentName)}
                                        style={{ 
                                            width: '100%', 
                                            height: 46, 
                                            borderRadius: 12, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: 8,
                                            fontWeight: 700 
                                        }}
                                    >
                                        <Icons.Save size={18} /> Зафиксировать результат
                                    </Button>
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }} 
                                    style={{ color: '#10b981', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '6px 0' }}
                                >
                                    <Icons.CheckCircle size={20} color="#10b981" /> Результат успешно сохранён в историю!
                                </motion.div>
                            )}
                        </div>

                        {/* Навигационные кнопки */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                            <Button 
                                variant="orange" 
                                onClick={() => setView('review')}
                                style={{ height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}
                            >
                                <Icons.Eye size={17} /> Ошибки
                            </Button>

                            {testSession.score < testSession.questions.length && (
                                <Button 
                                    variant="red" 
                                    onClick={restartMistakes}
                                    style={{ height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}
                                >
                                    <Icons.RotateCcw size={17} /> Повторить
                                </Button>
                            )}

                            <Button 
                                variant="muted"
                                onClick={() => setView('menu')}
                                style={{ height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}
                            >
                                <Icons.Home size={17} /> Меню
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* 6. РЕЖИМ РАЗБОРА ОШИБОК */}
                {view === 'review' && (
                    <motion.div 
                        key="review" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        style={{ width: '100%', maxWidth: '900px' }}
                    >
                        <ReviewView 
                            questions={testSession.questions} 
                            answers={testSession.answers} 
                            onBack={() => setView('menu')} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    Object.assign(window, { TestsLMS });
})();
