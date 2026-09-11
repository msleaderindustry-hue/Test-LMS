// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray, GooeyText } = window;

    // ИСПРАВЛЕНО: Добавлены пропсы для работы главного меню
    const TestsLMS = ({ view, setView, currentSet, tests, setTests, user, history, setHistory, fp, sets, addSet, deleteSet, openSet, teacherTests, openTeacherAssignedTest, removeTeacherTestStudent }) => {
        // --- ЛОКАЛЬНЫЕ СОСТОЯНИЯ ТЕСТА ---
        const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
        const [isResultSaved, setIsResultSaved] = useState(false);
        const [timeLeft, setTimeLeft] = useState(1200);
        const [customTime, setCustomTime] = useState('20');
        const [customQCount, setCustomQCount] = useState('');
        const [isAnimating, setIsAnimating] = useState(false);
        
        // --- НОВЫЕ СОСТОЯНИЯ ДЛЯ ЭКРАНА НАСТРОЕК ТЕСТА ---
        const [shakeTime, setShakeTime] = useState(false);
        const [shakeQ, setShakeQ] = useState(false);
        const [isStarting, setIsStarting] = useState(false);

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

        const startTest = () => { 
            if (tests.length === 0) return alert('Нет вопросов!'); 
            setCustomQCount(Math.min(25, tests.length).toString()); 
            setCustomTime('20');
            setView('timer_setup'); 
        };

        const updateTime = (delta) => {
            let val = parseInt(customTime) || 20;
            val += delta;
            if (val < 5 || val > 180) {
                setShakeTime(true); setTimeout(() => setShakeTime(false), 400);
                return;
            }
            setCustomTime(val.toString());
        };

        const updateQCount = (delta) => {
            let val = parseInt(customQCount) || tests.length;
            val += delta;
            const maxQ = Math.min(25, tests.length);
            if (val < 1 || val > maxQ) {
                setShakeQ(true); setTimeout(() => setShakeQ(false), 400);
                return;
            }
            setCustomQCount(val.toString());
        };

        const handleCancelSetup = () => {
            setCustomTime('20');
            setCustomQCount(Math.min(25, tests.length).toString());
            setView('set_menu');
        };

        const launchTestWithTimer = async () => {
            setIsStarting(true);
            const mins = parseInt(customTime) || 20;
            let qCount = parseInt(customQCount);
            const maxQ = Math.min(25, tests.length);
            if (!qCount || qCount < 1) qCount = 1;
            if (qCount > maxQ) qCount = maxQ;

            setTimeout(() => {
                let fullList = shuffleArray(tests);
                let selectedQuestions = fullList.slice(0, qCount);
                let finalQuestions = selectedQuestions.map(t => {
                    let varsWithFlag = t.variants.map((v, i) => ({ ...v, _isCorrectOriginal: i === t.correctIndex }));
                    varsWithFlag = shuffleArray(varsWithFlag);
                    return { ...t, variants: varsWithFlag, correctIndex: varsWithFlag.findIndex(v => v._isCorrectOriginal) };
                });
                setIsResultSaved(false); setTimeLeft(mins * 60); 
                setTestSession({ questions: finalQuestions, currentIdx: 0, answers: new Array(finalQuestions.length).fill(null), score: 0 }); 
                
                if (window.showToast) window.showToast(`⏱ ${mins} мин. • 📝 ${qCount} вопр.`);
                
                setIsStarting(false);
                setView('test');
            }, 1000);
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

        // --- ВЫЧИСЛЕНИЯ ДЛЯ КРУГОВОГО ПРОГРЕСС-БАРА ---
        const resultPercent = testSession.questions.length > 0 ? Math.round((testSession.score / testSession.questions.length) * 100) : 0;
        const circleRadius = 65;
        const circleCircumference = 2 * Math.PI * circleRadius;
        const circleStrokeDashoffset = circleCircumference - (resultPercent / 100) * circleCircumference;

        return (
            <AnimatePresence mode="wait">
                {view === 'menu' && (
                    <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
                        <div style={{width:64, height:64, margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', filter:'drop-shadow(0 6px 18px rgba(90,110,255,0.55))'}}>
                            <svg viewBox="0 0 64 64" fill="none" style={{width:'100%', height:'100%'}}>
                                <defs>
                                    <linearGradient id="capGrad" x1="0" y1="0" x2="64" y2="64">
                                        <stop offset="0%" stopColor="#7ab8ff"/>
                                        <stop offset="100%" stopColor="#8a5bff"/>
                                    </linearGradient>
                                </defs>
                                <path d="M32 10L58 22L32 34L6 22L32 10Z" fill="url(#capGrad)"/>
                                <path d="M18 27V40C18 40 24 46 32 46C40 46 46 40 46 40V27L32 34L18 27Z" fill="#3a4bcf"/>
                                <path d="M56 24V38" stroke="#1c2a99" strokeWidth="2.5" strokeLinecap="round"/>
                                <circle cx="56" cy="40" r="2.6" fill="#1c2a99"/>
                            </svg>
                        </div>
                        <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 25px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />
                        
                        <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5}}>
                            {teacherTests?.map(test => (
                                <div key={test.id} style={{display:'flex', gap:10, marginBottom:10, alignItems: 'center'}}>
                                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ flex:1, display: 'flex', alignItems: 'center', justifyContent:'flex-start', textAlign:'left', padding:'8px 15px', minWidth: 0, height: 'auto', minHeight: '64px', wordBreak: 'break-word', border: '1px solid transparent' }}>
                                        <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '15px'}}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <span style={{fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px'}}>Опубликован</span>
                                            <span style={{wordBreak:'break-word', lineHeight:'1.3', color: 'var(--text-main)', fontWeight: 600}}>{test.title}</span>
                                        </div>
                                    </Button>
                                    <Button style={{width: '44px', height: '44px', padding: 0, flexShrink: 0, background: '#ef4444', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer'}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </Button>
                                </div>
                            ))}

                            {sets?.map(name => (
                                <div key={name} style={{display:'flex', gap:10, marginBottom:10, alignItems: 'center'}}>
                                    <Button variant="muted" onClick={() => openSet(name)} style={{ flex:1, display: 'flex', alignItems: 'center', justifyContent:'flex-start', textAlign:'left', padding:'8px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word', border: '1px solid transparent' }}>
                                        <div style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '15px'}}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                                        </div>
                                        <span style={{wordBreak:'break-word', lineHeight:'1.3', color: 'var(--text-main)', fontWeight: 600}}>{name}</span>
                                    </Button>
                                    <Button style={{width: '44px', height: '44px', padding: 0, flexShrink: 0, background: '#ef4444', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer'}} onClick={() => deleteSet(name)}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div style={{display:'flex', gap:10, alignItems: 'center'}}>
                            <Input id="newSetName" placeholder="Новый тест" style={{margin:0, flex:1}} />
                            <Button style={{width: '44px', height: '44px', padding: 0, margin: 0, flexShrink: 0, background: '#a855f7', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer'}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </Button>
                        </div>
                        <div style={{marginTop: 30, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2026 Ultimate LMS Platform. All Rights Reserved.</div>
                    </motion.div>
                )}

                {view === 'set_menu' && (
                    <motion.div key="set" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px', position: 'relative', paddingTop: '40px'}}>
                        
                        <button onClick={() => setView('menu')} style={{
                            position: 'absolute', top: '24px', left: '24px', 
                            width: '44px', height: '44px', borderRadius: '50%', 
                            border: '1px solid var(--glass-border)', background: 'var(--bg-panel)',
                            color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10, padding: 0
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
                            <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 800 }}>{currentSet}</h2>
                            <div style={{ height: '4px', width: '48px', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', margin: '0 auto', borderRadius: '2px' }}></div>
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginBottom:25, alignItems:'stretch'}}>
                            <Button onClick={handlePrint} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7, #9333ea)', color: '#fff', border: 'none', padding: '16px'}}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                Печать
                            </Button>
                            
                            <label style={{
                                background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)', color:'white', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                cursor: 'pointer', borderRadius: '16px', padding: '16px', margin: 0, 
                                fontWeight: 600, fontSize: '15px', textAlign: 'center', transition: 'transform 0.1s',
                                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                Импорт
                                <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                            </label>
                        </div>
                        
                        <Button onClick={startTest} style={{fontSize:18, height:60, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Начать тест
                        </Button>
                        <p style={{textAlign:'center', color:'var(--text-sec)', marginTop:15}}>Вопросов: <b>{tests.length}</b></p>
                    </motion.div>
                )}

                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0, scale:0.9}} className="glass-panel" style={{width:'100%', maxWidth:420, padding: '30px 25px'}}>
                        
                        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'30px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg, #a855f7, #d946ef)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 15px rgba(168, 85, 247, 0.4)'}}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </div>
                            <h2 style={{margin:0, fontSize:'24px', fontWeight:800, color:'var(--text-main)'}}>Параметры теста</h2>
                        </div>

                        <div style={{marginBottom:'24px', textAlign:'left'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                                <div style={{width:'24px', height:'24px', borderRadius:'6px', background:'#a855f7', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <span style={{fontSize:'14px', fontWeight:700, color:'var(--text-sec)'}}>Время (минуты)</span>
                            </div>
                            <motion.div animate={shakeTime ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{duration: 0.3}} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(168, 85, 247, 0.05)', border: shakeTime ? '1px solid #ef4444' : '1px solid rgba(168, 85, 247, 0.2)', borderRadius:'14px', padding:'6px 14px'}}>
                                <button onClick={() => updateTime(-5)} style={{background:'none', border:'none', fontSize:'24px', color:'var(--text-main)', cursor:'pointer', padding:'0 10px'}}>−</button>
                                <input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} onBlur={() => { let v = parseInt(customTime)||20; if(v<5)v=5; if(v>180)v=180; setCustomTime(v.toString()); }} style={{background:'transparent', border:'none', textAlign:'center', fontSize:'22px', fontWeight:800, color:'var(--text-main)', width:'60px', outline:'none', appearance:'textfield'}} />
                                <button onClick={() => updateTime(5)} style={{background:'none', border:'none', fontSize:'24px', color:'var(--text-main)', cursor:'pointer', padding:'0 10px'}}>+</button>
                            </motion.div>
                        </div>

                        <div style={{marginBottom:'30px', textAlign:'left'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                                <div style={{width:'24px', height:'24px', borderRadius:'6px', background:'#06b6d4', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                </div>
                                <span style={{fontSize:'14px', fontWeight:700, color:'var(--text-sec)'}}>Количество вопросов <span style={{opacity:0.6, fontWeight:500}}>(макс. {Math.min(25, tests.length)})</span></span>
                            </div>
                            <motion.div animate={shakeQ ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{duration: 0.3}} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(168, 85, 247, 0.05)', border: shakeQ ? '1px solid #ef4444' : '1px solid rgba(168, 85, 247, 0.2)', borderRadius:'14px', padding:'6px 14px'}}>
                                <button onClick={() => updateQCount(-1)} style={{background:'none', border:'none', fontSize:'24px', color:'var(--text-main)', cursor:'pointer', padding:'0 10px'}}>−</button>
                                <input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} onBlur={() => { let v = parseInt(customQCount)||tests.length; let maxQ = Math.min(25, tests.length); if(v<1)v=1; if(v>maxQ)v=maxQ; setCustomQCount(v.toString()); }} style={{background:'transparent', border:'none', textAlign:'center', fontSize:'22px', fontWeight:800, color:'var(--text-main)', width:'60px', outline:'none', appearance:'textfield'}} />
                                <button onClick={() => updateQCount(1)} style={{background:'none', border:'none', fontSize:'24px', color:'var(--text-main)', cursor:'pointer', padding:'0 10px'}}>+</button>
                            </motion.div>
                        </div>

                        <Button onClick={launchTestWithTimer} disabled={isStarting} style={{width:'100%', marginBottom:'12px', background:'linear-gradient(135deg, #8b5cf6, #d946ef)', color:'#fff', border:'none', height:'54px', fontSize:'16px'}}>
                            {isStarting ? (
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} style={{display:'flex', gap:'6px', justifyContent:'center'}}>
                                    <span style={{width:'6px',height:'6px',background:'#fff',borderRadius:'50%'}}></span>
                                    <span style={{width:'6px',height:'6px',background:'#fff',borderRadius:'50%'}}></span>
                                    <span style={{width:'6px',height:'6px',background:'#fff',borderRadius:'50%'}}></span>
                                </motion.div>
                            ) : "Начать"}
                        </Button>
                        <Button variant="muted" onClick={handleCancelSetup} disabled={isStarting} style={{width:'100%', background:'transparent', border:'1px solid var(--glass-border)', color:'var(--text-sec)', height:'54px', fontSize:'16px'}}>Отмена</Button>
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
                                <div className="sidebar-timer">⏳ {formatTime(timeLeft)}</div>
                                <div className="nav-grid-wrapper">
                                    <div className="nav-grid-compact">
                                        {testSession.questions.map((_, i) => {
                                            let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                                            if (i === testSession.currentIdx) { c = '#764ba2'; txt = 'white'; }
                                            else if (testSession.answers[i] !== null) { c = testSession.answers[i] === testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt = 'white'; }
                                            const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                            return (<div key={i} className={itemClass} style={{background:c, color:txt}} onClick={() => handleNavClick(i)}>{i+1}</div>)
                                        })}
                                    </div>
                                </div>
                                <Button variant="green" onClick={finishTest} style={{marginTop:10}}>Завершить</Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- ОБНОВЛЕННЫЙ ЭКРАН РЕЗУЛЬТАТА --- */}
                {view === 'result' && (
                    <motion.div key="res" initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0}} style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '400px',
                        background: '#181725',
                        borderRadius: '26px',
                        boxShadow: '0 40px 70px -24px rgba(0,0,0,0.7)',
                        padding: '38px 30px 28px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.06)',
                        margin: '0 auto',
                        overflow: 'hidden'
                    }}>
                        {/* Декоративная линия сверху */}
                        <div style={{ position: 'absolute', top: 0, left: '16%', right: '16%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,111,242,0.6), rgba(63,208,240,0.6), transparent)' }}></div>
            
                        <h2 style={{
                            fontFamily: "'Newsreader', serif",
                            fontWeight: 600,
                            fontSize: '24px',
                            letterSpacing: '.01em',
                            margin: '0 0 30px',
                            color: '#f3f2fa'
                        }}>Результат</h2>
            
                        <div style={{ width: '150px', height: '150px', margin: '0 auto 8px', position: 'relative' }}>
                            <svg viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                <defs>
                                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7c6ff2"/>
                                        <stop offset="100%" stopColor="#3fd0f0"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="75" cy="75" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                                <motion.circle
                                    cx="75"
                                    cy="75"
                                    r={circleRadius}
                                    fill="none"
                                    stroke="url(#ringGradient)"
                                    strokeWidth="9"
                                    strokeLinecap="round"
                                    strokeDasharray={circleCircumference}
                                    initial={{ strokeDashoffset: circleCircumference }}
                                    animate={{ strokeDashoffset: circleStrokeDashoffset }}
                                    transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
                                    style={{ filter: 'drop-shadow(0 0 10px rgba(124,111,242,0.45))' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontFamily: "'Newsreader', serif", fontSize: '36px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{resultPercent}%</div>
                                <div style={{ fontSize: '11.5px', color: '#726e93', marginTop: '5px', letterSpacing: '.02em' }}>правильных ответов</div>
                            </div>
                        </div>
            
                        <div style={{
                            display: 'inline-block',
                            margin: '22px 0 28px',
                            padding: '9px 18px',
                            borderRadius: '999px',
                            background: '#1f1d30',
                            border: '1px solid rgba(255,255,255,0.07)',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#b6b2d1'
                        }}>
                            Правильно: <b style={{ color: '#fff', fontWeight: 700 }}>{testSession.score} из {testSession.questions.length}</b>
                        </div>
            
                        {/* АДАПТИРОВАННЫЙ БЛОК СОХРАНЕНИЯ В ТЁМНОЙ ТЕМЕ */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(124, 111, 242, 0.15)',
                            borderRadius: '20px',
                            padding: '16px',
                            marginBottom: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}>
                            {!isResultSaved ? (
                                <>
                                    <input
                                        id="sName"
                                        placeholder="Введите ваше имя"
                                        style={{
                                            width: '100%',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '0 16px',
                                            height: '48px',
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '14px',
                                            color: '#f3f2fa',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            marginBottom: '12px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(124,111,242,0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                                    />
                                    <button
                                        onClick={() => saveResult(document.getElementById('sName').value)}
                                        style={{
                                            width: '100%',
                                            height: '48px',
                                            fontFamily: "'Inter', sans-serif",
                                            fontWeight: 600,
                                            fontSize: '14.5px',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '9px',
                                            background: 'linear-gradient(120deg, #7c6ff2, #3fd0f0)',
                                            color: '#0e0d18',
                                            boxShadow: '0 10px 20px -8px rgba(124,111,242,0.5)'
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', flex: 'none' }}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
                                        Сохранить
                                    </button>
                                </>
                            ) : (
                                <motion.div initial={{scale:0.8}} animate={{scale:1}} style={{color:'#34d399', fontWeight:'bold', fontSize:'14.5px', padding:'15px 0', textAlign: 'center'}}>✅ Результат успешно сохранен!</motion.div>
                            )}
                        </div>
            
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <button
                                onClick={() => setView('review')}
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 600,
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '9px',
                                    background: 'transparent',
                                    color: '#f0ab5a',
                                    fontSize: '13.5px',
                                    padding: '13px 8px'
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', flex: 'none' }}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>
                                Ошибки
                            </button>
            
                            {testSession.score < testSession.questions.length && (
                                <button
                                    onClick={restartMistakes}
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 600,
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '9px',
                                        background: 'transparent',
                                        color: '#4bb8ff',
                                        fontSize: '13.5px',
                                        padding: '13px 8px'
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', flex: 'none' }}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0114.85-3.36L23 10M1 14l4.65 4.36A9 9 0 0020.5 15"/></svg>
                                    Повторить
                                </button>
                            )}
                        </div>
            
                        <button
                            onClick={() => setView('menu')}
                            style={{
                                width: '100%',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                fontSize: '14.5px',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '9px',
                                background: 'transparent',
                                color: '#726e93',
                                marginTop: '2px'
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', flex: 'none' }}><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
                            В меню
                        </button>
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
