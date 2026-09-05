// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray } = window;

    // --- ВЕКТОРНЫЕ ИКОНКИ (БЕЗ ЭМОДЗИ) ---
    const SvgIcon = ({ name, size = 20, color = 'currentColor', style = {} }) => {
        const icons = {
            back: <path d="M19 12H5m7 7l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            print: <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            upload: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5v12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            play: <path d="M5 3l14 9-14 9V3z" fill={color} />,
            clock: <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            hash: <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            save: <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            home: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M9 22V12h6v10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            check: <path d="M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            file: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
            stop: <rect x="6" y="6" width="12" height="12" rx="2" fill={color}/>,
            info: <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/><line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth="2"/></>,
            trophy: <path d="M8 21h8m-4-4v4m4-4h1a2 2 0 002-2v-2a2 2 0 00-2-2h-1V7a2 2 0 00-2-2H9a2 2 0 00-2 2v4H6a2 2 0 00-2 2v2a2 2 0 002 2h1v2a2 2 0 002 2h4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        };
        return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>{icons[name]}</svg>;
    };

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

        // --- ЛОГИКА ТЕСТА ---
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

        return (
            <AnimatePresence mode="wait">
                {/* 1. ЭКРАН МЕНЮ ТЕСТА */}
                {view === 'set_menu' && (
                    <motion.div key="set" initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale: 1}} exit={{opacity:0, scale: 0.95}} className="glass-panel" style={{width:'100%', maxWidth:'600px', padding: '40px 30px', borderRadius: 24}}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap', gap: 10 }}>
                            <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', padding: '10px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: '0.2s' }}>
                                <SvgIcon name="back" size={16} /> Назад
                            </button>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '10px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: '0.2s' }}>
                                    <SvgIcon name="print" size={16} /> Печать
                                </button>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '10px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: '0.2s', margin: 0 }}>
                                    <SvgIcon name="upload" size={16} /> Импорт
                                    <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                                </label>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }}>
                                <SvgIcon name="file" size={36} />
                            </div>
                            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>{currentSet}</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                                <SvgIcon name="info" size={14} /> В этом тесте <b style={{color: '#fff', marginLeft: 2}}>{tests.length}</b> вопросов
                            </div>
                        </div>

                        <button onClick={startTest} style={{ width: '100%', height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }}>
                            <SvgIcon name="play" size={20} /> НАЧАТЬ ТЕСТ
                        </button>
                    </motion.div>
                )}

                {/* 2. ЭКРАН НАСТРОЕК ТАЙМЕРА И КОЛИЧЕСТВА */}
                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0, scale:0.95}} className="glass-panel" style={{width:'100%', maxWidth:420, padding: '30px', borderRadius: 24}}>
                        <div style={{ textAlign: 'center', marginBottom: 25 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#38bdf8' }}>
                                <SvgIcon name="settings" size={28} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Параметры теста</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 30 }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: 10, borderRadius: 12 }}>
                                    <SvgIcon name="clock" size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Время (минуты)</div>
                                    <input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 20, fontWeight: 800, outline: 'none', padding: '4px 0 0 0' }} />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: 10, borderRadius: 12 }}>
                                    <SvgIcon name="hash" size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вопросов (Макс: {tests.length})</div>
                                    <input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} placeholder={tests.length.toString()} style={{ width: '100%', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 20, fontWeight: 800, outline: 'none', padding: '4px 0 0 0' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setView('set_menu')} style={{ flex: 1, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                Отмена
                            </button>
                            <button onClick={launchTestWithTimer} style={{ flex: 2, height: 50, borderRadius: 14, background: '#10b981', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
                                Запустить
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 3. ОСНОВНОЙ ЭКРАН ТЕСТА */}
                {view === 'test' && (
                    <motion.div key="test-wrapper" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="test-layout">
                        <div className="question-column">
                            <AnimatePresence mode="wait">
                                <TestQuestionCard key={testSession.currentIdx} question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={handleAnswer} />
                            </AnimatePresence>
                        </div>
                        <div className="sidebar-column">
                            <div className="sidebar-content" style={{ background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                
                                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                    <SvgIcon name="clock" size={24} color={timeLeft < 60 ? '#ef4444' : '#38bdf8'} />
                                    <span style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: timeLeft < 60 ? '#ef4444' : '#fff', textShadow: timeLeft < 60 ? '0 0 15px rgba(239,68,68,0.5)' : 'none' }}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-sec)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Навигация
                                    </div>
                                    <div className="nav-grid-wrapper" style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                                        <div className="nav-grid-compact" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                                            {testSession.questions.map((_, i) => {
                                                let bg = 'rgba(255,255,255,0.05)'; 
                                                let border = '1px solid rgba(255,255,255,0.1)';
                                                let color = 'var(--text-sec)';
                                                
                                                if (i === testSession.currentIdx) { 
                                                    bg = '#a855f7'; border = '1px solid #c084fc'; color = '#fff'; 
                                                } else if (testSession.answers[i] !== null) { 
                                                    const isCorrect = testSession.answers[i] === testSession.questions[i].correctIndex;
                                                    bg = isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'; 
                                                    border = isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)';
                                                    color = isCorrect ? '#10b981' : '#ef4444'; 
                                                }

                                                return (
                                                    <button key={i} onClick={() => handleNavClick(i)} disabled={isAnimating} style={{ aspectRatio: '1/1', background: bg, border: border, color: color, borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: isAnimating ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', padding: 0 }}>
                                                        {i+1}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                <button onClick={finishTest} style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: '0.2s' }}>
                                    <SvgIcon name="stop" size={18} /> Завершить
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 4. РЕЗУЛЬТАТЫ */}
                {view === 'result' && (
                    <motion.div key="res" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="glass-panel" style={{width:'100%', maxWidth:540, padding: '40px 30px', borderRadius: 28}}>
                        
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: testSession.score / testSession.questions.length >= 0.5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: testSession.score / testSession.questions.length >= 0.5 ? '#10b981' : '#f59e0b', marginBottom: 15 }}>
                                <SvgIcon name={testSession.score / testSession.questions.length >= 0.5 ? "trophy" : "info"} size={32} />
                            </div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: 24, color: '#f1f5f9' }}>{testSession.score / testSession.questions.length >= 0.5 ? 'Поздравляем!' : 'Тест завершен'}</h2>
                            
                            <h1 style={{ fontSize: 80, fontWeight: 900, margin: '10px 0', background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                                {Math.round(testSession.score / testSession.questions.length * 100)}%
                            </h1>
                            
                            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: 20, color: '#cbd5e1', fontSize: 16, fontWeight: 700 }}>
                                Правильно: <b style={{color: '#fff'}}>{testSession.score}</b> из <b style={{color: '#fff'}}>{testSession.questions.length}</b>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 25, borderRadius: 20, marginBottom: 30, border: '1px solid rgba(255,255,255,0.05)' }}>
                            {!isResultSaved ? (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input id="sName" placeholder="Ваше имя" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0 16px', borderRadius: 14, fontSize: 15, outline: 'none' }} />
                                    <button onClick={() => saveResult(document.getElementById('sName').value)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <SvgIcon name="save" size={18} /> Сохранить
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: 16 }}>
                                    <SvgIcon name="check" size={20} /> Результат успешно сохранен!
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button onClick={() => setView('review')} style={{ flex: '1 1 calc(50% - 6px)', height: 54, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <SvgIcon name="search" size={18} /> Ошибки
                            </button>
                            {testSession.score < testSession.questions.length && (
                                <button onClick={restartMistakes} style={{ flex: '1 1 calc(50% - 6px)', height: 54, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <SvgIcon name="refresh" size={18} /> Повторить
                                </button>
                            )}
                            <button onClick={() => setView('menu')} style={{ flex: '1 1 100%', height: 54, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <SvgIcon name="home" size={18} /> В меню
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 5. ЭКРАН РАБОТЫ НАД ОШИБКАМИ */}
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
