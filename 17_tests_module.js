// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray } = window;

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
