// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray, GooeyText } = window;

    // ==================== ИКОНКИ (заменяют эмодзи) ====================
    const Icon = ({ children, size = 18, style, ...props }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }} {...props}>
            {children}
        </svg>
    );
    const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
    const IconArrowLeft = (p) => <Icon {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
    const IconTrash = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Icon>;
    const IconHome = (p) => <Icon {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>;
    const IconPlay = (p) => <Icon {...p}><polygon points="5 3 19 12 5 21 5 3" /></Icon>;
    const IconSave = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon>;
    const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
    const IconRotateCcw = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" /></Icon>;
    const IconAlertTriangle = (p) => <Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
    const IconPrinter = (p) => <Icon {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Icon>;
    const IconUpload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
    const IconFolder = (p) => <Icon {...p}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></Icon>;
    const IconCloud = (p) => <Icon {...p}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></Icon>;
    const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
    const IconHash = (p) => <Icon {...p}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></Icon>;
    const IconSliders = (p) => <Icon {...p}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></Icon>;

    // ИСПРАВЛЕНО: Добавлены пропсы для работы главного меню
    const TestsLMS = ({ view, setView, currentSet, tests, setTests, user, history, setHistory, fp, sets, addSet, deleteSet, openSet, teacherTests, openTeacherAssignedTest, removeTeacherTestStudent }) => {
        // --- ЛОКАЛЬНЫЕ СОСТОЯНИЯ ТЕСТА ---
        const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
        const [isResultSaved, setIsResultSaved] = useState(false);
        const [timeLeft, setTimeLeft] = useState(1200);
        const [customTime, setCustomTime] = useState('20');
        const [customQCount, setCustomQCount] = useState('');
        const [isAnimating, setIsAnimating] = useState(false);

        // --- АНТИЧИТ ---
        useEffect(() => {
            if (view !== 'test') return;
            const handleVisibility = () => { if (document.hidden && typeof captureViolation === 'function') captureViolation("⚠️ ВНИМАНИЕ: Смена вкладки / Сворачивание", fp); };
            const handleBlur = () => { if (typeof captureViolation === 'function') captureViolation("⚠️ ВНИМАНИЕ: Потеря фокуса (переход в другое окно)", fp); };
            const handlePaste = (e) => { if (typeof captureViolation === 'function') captureViolation("📋 ПЕРЕХВАТ: Попытка вставки (Paste)", fp, [{ name: "Содержимое", value: `\`\`\`${e.clipboardData.getData('text') || 'пусто'}\`\`\`` }]); };

            window.addEventListener('visibilitychange', handleVisibility);
            window.addEventListener('blur', handleBlur);
            window.addEventListener('paste', handlePaste);

            return () => {
                window.removeEventListener('visibilitychange', handleVisibility);
                window.removeEventListener('blur', handleBlur);
                window.removeEventListener('paste', handlePaste);
            };
        }, [view, fp]);

        // --- ТАЙМЕР ---
        useEffect(() => {
            if (view !== 'test') return;
            const timer = setInterval(() => {
                setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
            }, 1000);
            return () => clearInterval(timer);
        }, [view]);

        useEffect(() => { if (timeLeft === 0 && view === 'test') finishTest(); }, [timeLeft]);

        const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec < 10 ? '0' + sec : sec}`; };

        // --- ЛОГИКА ТЕСТА (без изменений) ---
        const importJSON = (e) => {
            const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}), correctIndex: t.correctIndex }));
                    setTests(normalized);
                    localStorage.setItem('tests_' + currentSet, JSON.stringify(normalized));
                    alert(`✅ Импортировано: ${normalized.length}`);
                } catch {
                    alert('Ошибка JSON');
                }
            };
            reader.readAsText(file);
        };

        const startTest = () => { if (tests.length === 0) return alert('Нет вопросов!'); setCustomQCount(tests.length); setView('timer_setup'); };

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
            if (testSession.answers[testSession.currentIdx] !== null) return;
            const newAnswers = [...testSession.answers]; newAnswers[testSession.currentIdx] = variantIdx;
            setTestSession(prev => ({ ...prev, answers: newAnswers }));
            setIsAnimating(true);
            setTimeout(() => {
                if (testSession.currentIdx < testSession.questions.length - 1) { setTestSession(prev => ({ ...prev, currentIdx: prev.currentIdx + 1 })); }
                setIsAnimating(false);
            }, 700);
        };

        const handleNavClick = (i) => {
            if (isAnimating) return;
            if (i === testSession.currentIdx) return;
            setIsAnimating(true); setTestSession(p => ({ ...p, currentIdx: i }));
            setTimeout(() => setIsAnimating(false), 350);
        };

        const finishTest = () => {
            let correct = 0; testSession.questions.forEach((q, i) => { if (testSession.answers[i] === q.correctIndex) correct++; });
            setTestSession(prev => ({ ...prev, score: correct }));
            if (correct / testSession.questions.length >= 0.5 && window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setView('result');
        };

        // НАВИГАЦИЯ С КЛАВИАТУРЫ
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
            if (wrongQuestionsRaw.length === 0) return;
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
            if (!name.trim()) return alert('Введите имя!');
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

        const handlePrint = () => {
            const area = document.getElementById('printArea');
            let html = `<div class="print-header"><h1>ТЕСТ: ${currentSet}</h1><div style="display:flex;justify-content:space-between"><div>ФИО: <div class="print-input"></div></div><div>Оценка: <div class="print-input"></div></div></div></div>`;
            const printTests = tests.map(t => ({ ...t, variants: shuffleArray([...t.variants]) }));
            printTests.forEach((t, i) => {
              html += `<div class="print-q"><h4>${i+1}. ${t.question}</h4>`; if (t.questionImg) html += `<img src="${t.questionImg}" style="max-width:200px;display:block;">`;
              t.variants.forEach(v => { html += `<div class="print-var">${v.text} ${v.img ? '(см. рис)' : ''}</div>`; }); html += `</div>`;
            });
            area.innerHTML = html;
            if (window.MathJax) { MathJax.typesetPromise([area]).then(() => { setTimeout(() => { window.print(); }, 800); }); } else { window.print(); }
        };

        // --- Вспомогательные хэндлеры для удобства (Enter для отправки) ---
        const handleAddSetKeyDown = (e) => {
            if (e.key === 'Enter') { const el = document.getElementById('newSetName'); addSet(el.value); el.value = ''; }
        };
        const handleSaveNameKeyDown = (e) => {
            if (e.key === 'Enter') saveResult(document.getElementById('sName').value);
        };

        // Цвет/пульс таймера в зависимости от оставшегося времени
        const timerUrgent = timeLeft <= 30;
        const timerWarn = timeLeft > 30 && timeLeft <= 120;
        const timerColor = timerUrgent ? '#f56565' : timerWarn ? '#f6ad55' : 'inherit';

        return (
            <AnimatePresence mode="wait">
                {/* ИСПРАВЛЕНО: Интегрирован блок главного меню */}
                {view === 'menu' && (
                    <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
                        <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 25px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />

                        <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5}}>
                            <AnimatePresence initial={false}>
                                {teacherTests?.map((test, i) => (
                                    <motion.div key={test.id} layout
                                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16, scale: 0.9 }}
                                        transition={{ duration: 0.25, delay: i * 0.03 }}
                                        style={{display:'flex', gap:10, marginBottom:10}}>
                                        <motion.div style={{flex:1}} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                                            <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word', border: '1px solid #00c6ff' }}>
                                                <IconCloud size={17} style={{marginRight:10, color:'#00c6ff', flexShrink:0}} />
                                                <span style={{wordBreak:'break-word', lineHeight:'1.3', color: '#00c6ff', fontWeight: 700}}>{test.title}</span>
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}>
                                            <Button variant="red" aria-label="Удалить" style={{width:52, height:'100%', minHeight:54, padding:0, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>
                                                <IconTrash size={17} />
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                ))}

                                {sets?.map((name, i) => (
                                    <motion.div key={name} layout
                                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16, scale: 0.9 }}
                                        transition={{ duration: 0.25, delay: i * 0.03 }}
                                        style={{display:'flex', gap:10, marginBottom:10}}>
                                        <motion.div style={{flex:1}} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                                            <Button variant="muted" onClick={() => openSet(name)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word' }}>
                                                <IconFolder size={17} style={{marginRight:10, flexShrink:0, opacity:0.85}} />
                                                <span style={{wordBreak:'break-word', lineHeight:'1.3'}}>{name}</span>
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}>
                                            <Button variant="red" aria-label="Удалить" style={{width:52, height:'100%', minHeight:54, padding:0, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => deleteSet(name)}>
                                                <IconTrash size={17} />
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div style={{display:'flex', gap:10, alignItems: 'center'}}>
                            <Input id="newSetName" placeholder="Новый тест" style={{margin:0, flex:1}} onKeyDown={handleAddSetKeyDown} />
                            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}>
                                <Button style={{width:52, height:'100%', padding:0, margin:0, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>
                                    <IconPlus size={19} />
                                </Button>
                            </motion.div>
                        </div>
                        <div style={{marginTop: 30, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2026 Ultimate LMS Platform. All Rights Reserved.</div>
                    </motion.div>
                )}

                {view === 'set_menu' && (
                    <motion.div key="set" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px'}}>
                        <motion.div whileHover={{ x: -3 }} style={{display:'inline-block'}}>
                            <Button variant="muted" style={{width:'auto', padding:'0 20px', height:40, minHeight:40, fontSize:13, display:'flex', alignItems:'center', gap:6}} onClick={() => setView('menu')}>
                                <IconArrowLeft size={15} /> Назад
                            </Button>
                        </motion.div>
                        <h2 style={{textAlign:'center', margin:'20px 0', fontSize:24}}>{currentSet}</h2>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginBottom:25, alignItems:'stretch'}}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="primary" style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8}} onClick={handlePrint}>
                                    <IconPrinter size={17} /> Печать
                                </Button>
                            </motion.div>
                            <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="import-label"
                                style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer'}}>
                                <IconUpload size={17} /> Импорт
                                <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                            </motion.label>
                        </div>
                        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                            <Button onClick={startTest} style={{fontSize:18, height:60, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                                <IconPlay size={22} /> НАЧАТЬ ТЕСТ
                            </Button>
                        </motion.div>
                        <p style={{textAlign:'center', color:'var(--text-sec)', marginTop:15}}>Вопросов: <b>{tests.length}</b></p>
                    </motion.div>
                )}

                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0, scale:0.95}} transition={{ type:'spring', stiffness:220, damping:20 }} className="glass-panel" style={{width:'100%', maxWidth:400, textAlign:'center'}}>
                        <h2 style={{marginTop:0, display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                            <IconSliders size={20} /> Параметры теста
                        </h2>
                        <div style={{marginBottom:15, textAlign:'left'}}>
                            <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'flex', alignItems:'center', gap:6}}>
                                <IconClock size={15} /> Время (минуты):
                            </label>
                            <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                        </div>
                        <div style={{marginBottom:15, textAlign:'left'}}>
                            <label style={{fontSize:14, fontWeight:600, color:'var(--text-sec)', marginBottom:5, display:'flex', alignItems:'center', gap:6}}>
                                <IconHash size={15} /> Количество вопросов (Макс: {tests.length}):
                            </label>
                            <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="green" onClick={launchTestWithTimer} style={{marginTop:20, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                <IconPlay size={18} /> Начать
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="muted" onClick={() => setView('set_menu')} style={{width:'100%'}}>Отмена</Button>
                        </motion.div>
                    </motion.div>
                )}

                {view === 'test' && (
                    <motion.div key="test-wrapper" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="test-layout">
                        <div className="question-column">
                            <AnimatePresence mode="wait">
                                <TestQuestionCard key={testSession.currentIdx} question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={handleAnswer} />
                            </AnimatePresence>
                        </div>
                        <div className="sidebar-column">
                            <div className="sidebar-content">
                                <motion.div className="sidebar-timer"
                                    animate={timerUrgent ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                                    transition={timerUrgent ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                                    style={{ color: timerColor, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                    <IconClock size={18} /> {formatTime(timeLeft)}
                                </motion.div>
                                <div className="nav-grid-wrapper">
                                    <div className="nav-grid-compact">
                                        {testSession.questions.map((_, i) => {
                                            let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                                            if (i === testSession.currentIdx) { c = '#764ba2'; txt = 'white'; }
                                            else if (testSession.answers[i] !== null) { c = testSession.answers[i] === testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt = 'white'; }
                                            const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                            return (
                                                <motion.div key={i} className={itemClass}
                                                    animate={{ backgroundColor: c, color: txt, scale: i === testSession.currentIdx ? 1.08 : 1 }}
                                                    whileHover={!isAnimating ? { scale: 1.15 } : {}}
                                                    whileTap={!isAnimating ? { scale: 0.92 } : {}}
                                                    transition={{ duration: 0.22 }}
                                                    onClick={() => handleNavClick(i)}>
                                                    {i + 1}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button variant="green" onClick={finishTest} style={{marginTop:10, width:'100%'}}>Завершить</Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'result' && (
                    <motion.div key="res" initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
                        <h2 style={{marginBottom:5}}>{testSession.score / testSession.questions.length >= 0.5 ? 'Отлично!' : 'Результат'}</h2>
                        <motion.h1 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                            style={{fontSize:64, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                            {Math.round(testSession.score / testSession.questions.length * 100)}%
                        </motion.h1>
                        <div style={{padding:'10px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'20px'}}>
                            <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
                        </div>
                        <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
                            {!isResultSaved ? (
                                <>
                                    <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} onKeyDown={handleSaveNameKeyDown} />
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="teal" onClick={() => saveResult(document.getElementById('sName').value)} style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                            <IconSave size={17} /> Сохранить
                                        </Button>
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{ type:'spring', stiffness:260, damping:16 }}
                                    style={{color:'#10b981', fontWeight:'bold', fontSize:18, padding:'15px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                    <IconCheckCircle size={22} /> Результат успешно сохранен!
                                </motion.div>
                            )}
                        </div>
                        <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                <Button variant="orange" onClick={() => setView('review')} style={{display:'flex', alignItems:'center', gap:6}}>
                                    <IconAlertTriangle size={16} /> Ошибки
                                </Button>
                            </motion.div>
                            {testSession.score < testSession.questions.length && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Button variant="red" onClick={restartMistakes} style={{display:'flex', alignItems:'center', gap:6}}>
                                        <IconRotateCcw size={16} /> Повторить ошибки
                                    </Button>
                                </motion.div>
                            )}
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                <Button onClick={() => setView('menu')} style={{display:'flex', alignItems:'center', gap:6}}>
                                    <IconHome size={16} /> Меню
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {view === 'review' && (
                    <motion.div key="review" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={() => setView('menu')} />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    Object.assign(window, { TestsLMS });
})();
