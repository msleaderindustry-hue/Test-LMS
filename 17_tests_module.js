// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray } = window;

    // ============================================================
    // ИКОНКИ (легкие inline SVG, наследуют цвет через currentColor —
    // не тянут внешних зависимостей и не ломаются при отсутствии сети)
    // ============================================================
    const Icon = ({ children, size = 18, style }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ flexShrink: 0, display: 'block', ...style }}>
            {children}
        </svg>
    );
    const IconPlay = (p) => <Icon {...p}><polygon points="6 3 20 12 6 21 6 3" /></Icon>;
    const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.37.4.68.72.9.32.22.7.34 1.1.34H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
    const IconPrinter = (p) => <Icon {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Icon>;
    const IconUpload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
    const IconArrowLeft = (p) => <Icon {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
    const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
    const IconHash = (p) => <Icon {...p}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></Icon>;
    const IconCheck = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>;
    const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
    const IconSave = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon>;
    const IconHome = (p) => <Icon {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>;
    const IconRepeat = (p) => <Icon {...p}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></Icon>;
    const IconAlertTriangle = (p) => <Icon {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
    const IconTrophy = (p) => <Icon {...p}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" /><path d="M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" /></Icon>;

    const TestsLMS = ({ view, setView, currentSet, tests, setTests, user, history, setHistory, fp }) => {
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
                    alert(`Импортировано вопросов: ${normalized.length}`);
                } catch {
                    alert('Ошибка чтения JSON-файла');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
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

        // Общий стиль-обёртка для лёгкой, ненавязчивой hover/tap-реакции кнопок
        const TapWrap = ({ children, style, disabled }) => (
            <motion.div
                style={{ width: '100%', ...style }}
                whileHover={disabled ? {} : { scale: 1.015 }}
                whileTap={disabled ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {children}
            </motion.div>
        );

        const isPass = testSession.questions.length > 0 && (testSession.score / testSession.questions.length) >= 0.5;

        return (
            <AnimatePresence mode="wait">
                {view === 'set_menu' && (
                    <motion.div key="set" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0}} transition={{duration:0.25}} className="glass-panel" style={{width:'100%', maxWidth:'600px'}}>
                        <TapWrap style={{width:'auto'}}>
                            <Button variant="muted" style={{width:'auto', padding:'0 22px', height:40, minHeight:40, fontSize:13, display:'flex', alignItems:'center', gap:8}} onClick={() => setView('menu')}>
                                <IconArrowLeft size={16} /> Назад
                            </Button>
                        </TapWrap>

                        <h2 style={{textAlign:'center', margin:'22px 0 4px', fontSize:24, fontWeight:800}}>{currentSet}</h2>
                        <p style={{textAlign:'center', color:'var(--text-sec)', margin:'0 0 24px', fontSize:14}}>
                            Вопросов в базе: <b style={{color:'var(--text-main)'}}>{tests.length}</b>
                        </p>

                        <TapWrap disabled={tests.length === 0}>
                            <Button onClick={startTest} disabled={tests.length === 0}
                                style={{fontSize:17, height:58, display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontWeight:700}}>
                                <IconPlay size={20} /> Начать тест
                            </Button>
                        </TapWrap>

                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16}}>
                            <TapWrap>
                                <Button variant="muted" onClick={handlePrint}
                                    style={{height:48, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:14}}>
                                    <IconPrinter size={17} /> Печать
                                </Button>
                            </TapWrap>
                            <TapWrap>
                                <label className="import-label" style={{
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white',
                                    height:48, borderRadius: 14, display:'flex', alignItems:'center', justifyContent:'center',
                                    gap:8, fontSize:14, fontWeight:600, cursor:'pointer', width:'100%'
                                }}>
                                    <IconUpload size={17} /> Импорт
                                    <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                                </label>
                            </TapWrap>
                        </div>
                    </motion.div>
                )}

                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{opacity:0, scale:0.94}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.96}} transition={{duration:0.2}} className="glass-panel" style={{width:'100%', maxWidth:400}}>
                        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:20}}>
                            <IconSettings size={22} style={{color:'var(--text-sec)'}} />
                            <h2 style={{margin:0, fontSize:20, fontWeight:800}}>Параметры теста</h2>
                        </div>

                        <div style={{marginBottom:16, textAlign:'left'}}>
                            <label style={{fontSize:13, fontWeight:600, color:'var(--text-sec)', marginBottom:6, display:'flex', alignItems:'center', gap:6}}>
                                <IconClock size={14} /> Время (минуты)
                            </label>
                            <Input type="number" min="1" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                        </div>

                        <div style={{marginBottom:8, textAlign:'left'}}>
                            <label style={{fontSize:13, fontWeight:600, color:'var(--text-sec)', marginBottom:6, display:'flex', alignItems:'center', gap:6}}>
                                <IconHash size={14} /> Количество вопросов (макс. {tests.length})
                            </label>
                            <Input type="number" min="1" max={tests.length} value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize:20, fontWeight:800}} />
                        </div>

                        <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:22}}>
                            <TapWrap>
                                <Button variant="green" onClick={launchTestWithTimer}
                                    style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                    <IconPlay size={18} /> Начать
                                </Button>
                            </TapWrap>
                            <TapWrap>
                                <Button variant="muted" onClick={() => setView('set_menu')}>Отмена</Button>
                            </TapWrap>
                        </div>
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
                                <div className="sidebar-timer" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                    <IconClock size={18} /> {formatTime(timeLeft)}
                                </div>
                                <div className="nav-grid-wrapper">
                                    <motion.div className="nav-grid-compact"
                                        initial="hidden" animate="visible"
                                        variants={{ visible: { transition: { staggerChildren: 0.015 } } }}>
                                        {testSession.questions.map((_, i) => {
                                            let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                                            const isCurrent = i === testSession.currentIdx;
                                            const isAnswered = testSession.answers[i] !== null;
                                            if (isCurrent) { c = '#764ba2'; txt = 'white'; }
                                            else if (isAnswered) { c = testSession.answers[i] === testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt = 'white'; }
                                            const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                            return (
                                                <motion.div key={i} className={itemClass}
                                                    variants={{ hidden: { opacity: 0, scale: 0.6 }, visible: { opacity: 1, scale: 1 } }}
                                                    animate={isCurrent ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{background:c, color:txt}} onClick={() => handleNavClick(i)}>
                                                    {i+1}
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </div>
                                <TapWrap style={{marginTop:10}}>
                                    <Button variant="green" onClick={finishTest}
                                        style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                        <IconCheck size={18} /> Завершить
                                    </Button>
                                </TapWrap>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'result' && (
                    <motion.div key="res" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} transition={{duration:0.25}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
                        <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.1, type:'spring', stiffness:260, damping:18}}
                            style={{display:'flex', justifyContent:'center', marginBottom:6, color: isPass ? '#48bb78' : '#f6ad55'}}>
                            {isPass ? <IconTrophy size={40} /> : <IconAlertTriangle size={40} />}
                        </motion.div>
                        <h2 style={{margin:'4px 0'}}>{isPass ? 'Отлично!' : 'Результат'}</h2>
                        <h1 style={{fontSize:64, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                            {testSession.questions.length > 0 ? Math.round(testSession.score / testSession.questions.length * 100) : 0}%
                        </h1>
                        <div style={{padding:'10px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'20px'}}>
                            <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
                        </div>

                        <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
                            {!isResultSaved ? (
                                <>
                                    <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}}
                                        onKeyDown={(e) => { if (e.key === 'Enter') saveResult(e.target.value); }} />
                                    <TapWrap>
                                        <Button variant="teal" onClick={() => saveResult(document.getElementById('sName').value)}
                                            style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                            <IconSave size={18} /> Сохранить результат
                                        </Button>
                                    </TapWrap>
                                </>
                            ) : (
                                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}}
                                    style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#10b981', fontWeight:'bold', fontSize:17, padding:'12px 0'}}>
                                    <IconCheckCircle size={20} /> Результат успешно сохранён
                                </motion.div>
                            )}
                        </div>

                        <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
                            <TapWrap style={{width:'auto', flex:'1 1 130px'}}>
                                <Button variant="muted" onClick={() => setView('menu')}
                                    style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                    <IconHome size={16} /> Меню
                                </Button>
                            </TapWrap>
                            <TapWrap style={{width:'auto', flex:'1 1 130px'}}>
                                <Button variant="orange" onClick={() => setView('review')}
                                    style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                    <IconAlertTriangle size={16} /> Ошибки
                                </Button>
                            </TapWrap>
                            {testSession.score < testSession.questions.length && (
                                <TapWrap style={{width:'auto', flex:'1 1 180px'}}>
                                    <Button variant="red" onClick={restartMistakes}
                                        style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                        <IconRepeat size={16} /> Повторить ошибки
                                    </Button>
                                </TapWrap>
                            )}
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
