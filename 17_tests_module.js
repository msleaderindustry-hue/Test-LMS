// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray, GooeyText } = window;

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
        const circleRadius = 80;
        const circleCircumference = 2 * Math.PI * circleRadius;
        const circleStrokeDashoffset = circleCircumference - (resultPercent / 100) * circleCircumference;

        return (
            <AnimatePresence mode="wait">
                {/* --- ОБНОВЛЕННОЕ ГЛАВНОЕ МЕНЮ СО СПИСКОМ --- */}
                {view === 'menu' && (
                    <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px'}}>
                        
                        <style>{`
                            .menu-row-hover:hover { background: var(--bg-elevated) !important; border-color: rgba(139, 92, 246, 0.4) !important; }
                            .add-test-container:focus-within { border-color: #8b5cf6 !important; background: rgba(139, 92, 246, 0.05) !important; }
                        `}</style>

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
                        
                        <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 20px 0', paddingRight:5}} className="custom-scroll">
                            
                            {/* --- СПИСОК ТЕСТОВ ПРЕПОДАВАТЕЛЯ --- */}
                            {teacherTests?.map(test => (
                                <div key={test.id} style={{display:'flex', gap:'12px', marginBottom:'12px', background:'rgba(128, 128, 128, 0.06)', border:'1px solid rgba(128, 128, 128, 0.2)', padding:'8px', borderRadius:'18px', alignItems:'center', transition:'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}} className="menu-row-hover">
                                    <div onClick={() => openTeacherAssignedTest(test)} style={{display:'flex', gap:'12px', flex:1, alignItems:'center', cursor:'pointer', minWidth:0}}>
                                        <div style={{width:'54px', height:'54px', borderRadius:'14px', background:'linear-gradient(135deg, #38bdf8, #06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                                        </div>
                                        <div style={{display:'flex', flexDirection:'column', justifyContent:'center', minWidth:0}}>
                                            <span style={{fontSize:'11px', fontWeight:900, color:'#38bdf8', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px'}}>Опубликован</span>
                                            <span style={{fontSize:'16px', fontWeight:700, color:'var(--text-main)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{test.title}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeTeacherTestStudent(test.id, test.title)} style={{width:'46px', height:'46px', borderRadius:'12px', background:'linear-gradient(135deg, #fb7185, #f43f5e)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginRight:'4px', transition:'transform 0.1s'}}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))}

                            {/* --- СПИСОК ПАПОК ПОЛЬЗОВАТЕЛЯ --- */}
                            {sets?.map(name => (
                                <div key={name} style={{display:'flex', gap:'12px', marginBottom:'12px', background:'rgba(128, 128, 128, 0.06)', border:'1px solid rgba(128, 128, 128, 0.2)', padding:'8px', borderRadius:'18px', alignItems:'center', transition:'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}} className="menu-row-hover">
                                    <div onClick={() => openSet(name)} style={{display:'flex', gap:'12px', flex:1, alignItems:'center', cursor:'pointer', minWidth:0}}>
                                        <div style={{width:'54px', height:'54px', borderRadius:'14px', background:'linear-gradient(135deg, #fbbf24, #f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                        </div>
                                        <div style={{display:'flex', flexDirection:'column', justifyContent:'center', minWidth:0}}>
                                            <span style={{fontSize:'16px', fontWeight:700, color:'var(--text-main)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{name}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteSet(name)} style={{width:'46px', height:'46px', borderRadius:'12px', background:'linear-gradient(135deg, #fb7185, #f43f5e)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginRight:'4px', transition:'transform 0.1s'}}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        {/* --- ИНПУТ ДОБАВЛЕНИЯ НОВОГО ТЕСТА --- */}
                        <div className="add-test-container" style={{display:'flex', gap:'12px', alignItems: 'center', padding:'8px', borderRadius:'18px', border:'2px dashed rgba(128, 128, 128, 0.35)', background: 'rgba(128, 128, 128, 0.02)', transition:'all 0.2s', marginTop:'16px'}}>
                            <input id="newSetName" placeholder="Новый тест" style={{margin:0, flex:1, background:'transparent', border:'none', padding:'10px 15px', fontSize:'16px', color:'var(--text-main)', outline:'none', fontWeight: 600}} />
                            <button onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }} style={{width:'46px', height:'46px', borderRadius:'12px', background:'linear-gradient(135deg, #6366f1, #3b82f6)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'transform 0.1s'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
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

                {/* --- ОБНОВЛЕННЫЙ ЭКРАН САМОГО ТЕСТА С НОВЫМ ДИЗАЙНОМ --- */}
                {view === 'test' && (() => {
                    const index = testSession.currentIdx;
                    const question = testSession.questions[index];
                    const answers = testSession.answers;
                    const total = testSession.questions.length;
                    const pct = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
                    const isWarning = timeLeft < 120;

                    return (
                        <motion.div key="test-wrapper" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="test-layout">
                            
                            <div className="question-column">
                                <AnimatePresence mode="wait">
                                    {question && (
                                        <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="glass-panel" style={{width: '100%', display:'block', padding: '35px 30px'}}>
                                            
                                            {/* Градиентный бейдж вопроса и прогресс-бар */}
                                            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
                                                <div style={{background: 'linear-gradient(135deg, #a855f7, #8b5cf6)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0}}>
                                                    Вопрос {index + 1}
                                                </div>
                                                <div style={{flex: 1, height: '4px', background: 'rgba(128,128,128,0.1)', borderRadius: '2px', overflow: 'hidden'}}>
                                                    <div style={{width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #8b5cf6)', transition: 'width 0.3s ease'}}></div>
                                                </div>
                                            </div>

                                            <div style={{fontSize: '22px', marginBottom: '30px', fontWeight: 500, color: 'var(--text-main)', lineHeight: 1.5}} dangerouslySetInnerHTML={{__html: question.question}} />
                                            
                                            {question.questionImg && <img src={question.questionImg} className="question-image" style={{maxWidth: '100%', borderRadius: '12px', marginBottom: '24px'}} />}
                                            
                                            {/* Новые карточки-варианты ответов */}
                                            <div style={{display:'flex', flexDirection:'column', gap: '12px'}}>
                                               {question.variants.map((v, i) => {
                                                  const isAnswered = answers[index] !== null; 
                                                  const isSelected = answers[index] === i; 
                                                  
                                                  let bg = 'rgba(128, 128, 128, 0.03)';
                                                  let border = '1px solid rgba(128, 128, 128, 0.15)';
                                                  let radioBorder = 'rgba(128, 128, 128, 0.4)';
                                                  let radioInner = 'transparent';
                                                  let textColor = 'var(--text-main)';

                                                  // Синее выделение выбранного варианта
                                                  if (isSelected) {
                                                      bg = 'rgba(59, 130, 246, 0.05)';
                                                      border = '1px solid #3b82f6';
                                                      textColor = 'var(--text-main)';
                                                      radioBorder = '#3b82f6';
                                                      radioInner = '#3b82f6';
                                                  }

                                                  return (
                                                    <motion.div key={i} onClick={() => !isAnswered && handleAnswer(i)} 
                                                        style={{ 
                                                            pointerEvents: isAnswered ? 'none' : 'auto', 
                                                            display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: '14px',
                                                            cursor: 'pointer', transition: 'all 0.2s', background: bg, border: border, color: textColor
                                                        }} 
                                                        whileHover={!isAnswered ? { scale: 1.01, background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.3)' } : {}}>
                                                       <div style={{width: '22px', height: '22px', borderRadius: '50%', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${radioBorder}`, background: 'transparent', transition: 'all 0.2s'}}>
                                                           {radioInner !== 'transparent' && <div style={{width: '12px', height: '12px', borderRadius: '50%', background: radioInner}}></div>}
                                                       </div>
                                                       <div>
                                                           {v.img && <img src={v.img} style={{display:'block', maxWidth:200, marginBottom:8, borderRadius:8}} />}
                                                           <span style={{fontSize: '16px', fontWeight: isSelected ? 600 : 400}}>{v.text}</span>
                                                       </div>
                                                    </motion.div>
                                                  )
                                               })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="sidebar-column">
                                <div className="sidebar-content" style={{background: 'var(--bg-panel)', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)'}}>
                                    
                                    {/* Кастомный градиентный таймер */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '24px', transition: 'all 0.3s'
                                    }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                            background: isWarning ? 'linear-gradient(135deg, #fb7185, #f43f5e)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                                            transition: 'background 0.3s'
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="6 2 18 2 18 7 12 13 6 7"></polygon>
                                                <polygon points="6 22 18 22 18 17 12 11 6 17"></polygon>
                                            </svg>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <span style={{fontSize: '24px', fontWeight: 800, color: isWarning ? '#f43f5e' : 'var(--text-main)', lineHeight: '1', fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s'}}>{formatTime(timeLeft)}</span>
                                            <span style={{fontSize: '12px', color: 'var(--text-sec)', fontWeight: 600, marginTop: '4px'}}>осталось времени</span>
                                        </div>
                                    </div>

                                    <div style={{fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600, marginBottom: '16px'}}>
                                        Отвечено: <b style={{color: 'var(--text-main)'}}>{answers.filter(a => a !== null).length}</b> из {total}
                                    </div>

                                    {/* Новая сетка вопросов */}
                                    <div className="nav-grid-wrapper" style={{marginBottom: '24px'}}>
                                        <div className="nav-grid-compact" style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px'}}>
                                            {testSession.questions.map((_, i) => {
                                                const isCurrent = i === testSession.currentIdx;
                                                const isAnswered = testSession.answers[i] !== null;
                                                
                                                let bg = 'var(--bg-elevated)';
                                                let color = 'var(--text-main)';
                                                let border = '1px solid var(--glass-border)';
                                                
                                                if (isCurrent) {
                                                    bg = 'linear-gradient(135deg, #a855f7, #8b5cf6)';
                                                    color = '#fff';
                                                    border = '1px solid transparent';
                                                } else if (isAnswered) {
                                                    bg = 'rgba(168, 85, 247, 0.08)';
                                                    color = '#a855f7';
                                                    border = '1px solid rgba(168, 85, 247, 0.25)';
                                                }
                                                
                                                const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                                return (
                                                    <div key={i} className={itemClass} onClick={() => handleNavClick(i)} 
                                                         style={{
                                                             background: bg, color: color, border: border, borderRadius: '8px', height: '40px', 
                                                             display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, 
                                                             cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
                                                         }}>
                                                        {i+1}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <Button onClick={finishTest} style={{width: '100%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', border: 'none', height: '54px', borderRadius: '14px', fontSize: '16px', fontWeight: 700}}>Завершить</Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}

                {/* --- ОБНОВЛЕННЫЙ ЭКРАН РЕЗУЛЬТАТА С КРУГОВЫМ ПРОГРЕССОМ --- */}
                {view === 'result' && (
                    <motion.div key="res" initial={{scale:0.95}} animate={{scale:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
                        <h2 style={{marginBottom:25}}>{resultPercent >= 50 ? 'Отлично!' : 'Результат'}</h2>
                        
                        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 30px auto' }}>
                            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="100" cy="100" r={circleRadius} fill="none" stroke="var(--glass-border)" strokeWidth="14" />
                                
                                <motion.circle
                                    cx="100"
                                    cy="100"
                                    r={circleRadius}
                                    fill="none"
                                    stroke="#00f2fe"
                                    strokeWidth="14"
                                    strokeLinecap="round"
                                    strokeDasharray={circleCircumference}
                                    initial={{ strokeDashoffset: circleCircumference }}
                                    animate={{ strokeDashoffset: circleStrokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                />
                            </svg>
                            
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <span style={{ fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: '1', color: 'var(--text-main)' }}>{resultPercent}%</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '8px', opacity: 0.8 }}>Правильных ответов</span>
                            </div>
                        </div>

                        <div style={{padding:'15px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'25px'}}>
                            <p style={{fontSize:18, color:'var(--text-main)', margin:0, fontWeight:700}}>Правильно: {testSession.score} из {testSession.questions.length}</p>
                        </div>
                        
                        <div style={{background:'rgba(128,128,128,0.05)', padding:25, borderRadius:20, margin:'25px 0', border:'1px solid var(--glass-border)'}}>
                            {!isResultSaved ? (
                                <>
                                    <Input id="sName" placeholder="Введите ваше имя" style={{textAlign:'center', marginTop:0, marginBottom:15}} />
                                    <Button variant="teal" onClick={() => saveResult(document.getElementById('sName').value)}>💾 Сохранить</Button>
                                </>
                            ) : (
                                <motion.div initial={{scale:0.8}} animate={{scale:1}} style={{color:'#10b981', fontWeight:'bold', fontSize:18, padding:'15px 0'}}>✅ Результат успешно сохранен!</motion.div>
                            )}
                        </div>
                        <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center'}}>
                            <Button variant="orange" onClick={() => setView('review')}>🧐 Ошибки</Button>
                            {testSession.score < testSession.questions.length && (<Button variant="red" onClick={restartMistakes}>🔄 Повторить ошибки</Button>)}
                            <Button onClick={() => setView('menu')}>🏠 Меню</Button>
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
