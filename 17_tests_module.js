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
        const circleRadius = 80;
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
                                <div key={test.id} style={{display:'flex', gap:10, marginBottom:10}}>
                                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'10px 15px', minWidth: 0, height: 'auto', minHeight: '54px', wordBreak: 'break-word', border: '1px solid #00c6ff' }}>
                                        <span style={{marginRight:8}}>☁️</span>
                                        <span style={{wordBreak:'break-word', lineHeight:'1.3', color: '#00c6ff', fontWeight: 700}}>{test.title}</span>
                                    </Button>
                                    <Button variant="red" style={{width:60, padding:0, flexShrink:0}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>🗑</Button>
                                </div>
                            ))}

                            {sets?.map(name => (
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

                {view === 'set_menu' && (
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

                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{scale:0.9}} animate={{scale:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:400, textAlign:'center'}}>
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

                {/* --- НОВЫЙ ДИЗАЙН ЭКРАНА ТЕСТИРОВАНИЯ --- */}
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
                                            
                                            <div style={{display:'flex', flexDirection:'column', gap: '12px'}}>
                                               {question.variants.map((v, i) => {
                                                  const isAnswered = answers[index] !== null; 
                                                  const isSelected = answers[index] === i; 
                                                  
                                                  let bg = 'rgba(128, 128, 128, 0.03)';
                                                  let border = '1px solid rgba(128, 128, 128, 0.15)';
                                                  let radioBorder = 'rgba(128, 128, 128, 0.4)';
                                                  let radioInner = 'transparent';
                                                  let textColor = 'var(--text-main)';

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

                {view === 'result' && (
                    <motion.div key="res" initial={{scale:0.95}} animate={{scale:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
                        <h2 style={{marginBottom:5}}>{testSession.score / testSession.questions.length >= 0.5 ? 'Отлично!' : 'Результат'}</h2>
                        <h1 style={{fontSize:64, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                            {Math.round(testSession.score / testSession.questions.length * 100)}%
                        </h1>
                        <div style={{padding:'10px', background:'rgba(128,128,128,0.1)', borderRadius:'14px', marginBottom:'20px'}}>
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
