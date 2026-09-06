// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray, GooeyText } = window;

    // --- НАБОР SVG ИКОНОК (ВМЕСТО ЭМОДЗИ) ---
    const Icons = {
        Cloud: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
        Folder: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>,
        Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>,
        Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>,
        Print: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><path d="M6 14h12v8H6z"/></svg>,
        Import: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
        Play: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
        Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
        Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
        List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
        Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
        Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
        Repeat: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
        Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
        Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
        ArrowLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
        CheckCircle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    };

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

        // --- ЛОГИКА ТЕСТА ---
        const importJSON = (e) => {
            const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
            reader.onload = ev => { 
                try { 
                    const data = JSON.parse(ev.target.result); 
                    const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : {text:String(v),img:null}), correctIndex: t.correctIndex })); 
                    setTests(normalized); 
                    localStorage.setItem('tests_' + currentSet, JSON.stringify(normalized)); 
                    alert(`Успешно импортировано вопросов: ${normalized.length}`); 
                } catch { 
                    alert('Ошибка чтения JSON файла.'); 
                } 
            };
            reader.readAsText(file);
        };

        const startTest = () => { if (tests.length === 0) return alert('В этом тесте пока нет вопросов!'); setCustomQCount(tests.length); setView('timer_setup'); };

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
            if (!name.trim()) return alert('Пожалуйста, введите ваше имя.');
            const scoreData = { student: name, percent: Math.round((testSession.score / testSession.questions.length) * 100), score: testSession.score, total: testSession.questions.length, topic: currentSet };
            
            const failedQuestionsRaw = testSession.questions.filter((q, i) => testSession.answers[i] !== q.correctIndex);
            const failedQuestions = failedQuestionsRaw.map(q => {
                const originalIndex = testSession.questions.indexOf(q);
                const userAnsIdx = testSession.answers[originalIndex];
                return {
                    question: q.question.replace(/<[^>]+>/g, ''),
                    userAnsText: userAnsIdx !== null && q.variants[userAnsIdx] ? q.variants[userAnsIdx].text : "Пропущено",
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

        // --- ОБЩИЕ СТИЛИ ДЛЯ ИНТЕРФЕЙСА ---
        const btnIconStyle = { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' };
        
        return (
            <AnimatePresence mode="wait">
                {view === 'menu' && (
                    <motion.div key="menu" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -10}} className="glass-panel" style={{width:'100%', maxWidth:'800px', padding: '35px'}}>
                        <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{margin:'0 0 35px 0', paddingTop: 10}} morphTime={1} cooldownTime={1.5} />
                        
                        <div style={{maxHeight: 350, overflowY:'auto', margin:'0 0 25px 0', paddingRight: '8px'}}>
                            {/* Карточки тестов от учителя */}
                            {teacherTests?.map(test => (
                                <div key={test.id} style={{display:'flex', gap: 12, marginBottom: 12}}>
                                    <Button variant="muted" onClick={() => openTeacherAssignedTest(test)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'12px 20px', minWidth: 0, height: 'auto', minHeight: '58px', borderRadius: '12px', border: '1px solid rgba(0, 198, 255, 0.4)', background: 'rgba(0, 198, 255, 0.05)', transition: 'all 0.2s' }}>
                                        <div style={btnIconStyle}>
                                            <span style={{ color: '#00c6ff' }}><Icons.Cloud /></span>
                                            <span style={{wordBreak:'break-word', lineHeight:'1.4', color: '#00c6ff', fontWeight: 600, fontSize: '15px'}}>{test.title}</span>
                                        </div>
                                    </Button>
                                    <Button variant="red" style={{width: '58px', height: 'auto', padding: 0, flexShrink: 0, borderRadius: '12px'}} onClick={() => removeTeacherTestStudent(test.id, test.title)}>
                                        <Icons.Trash />
                                    </Button>
                                </div>
                            ))}

                            {/* Карточки локальных тестов */}
                            {sets?.map(name => (
                                <div key={name} style={{display:'flex', gap: 12, marginBottom: 12}}>
                                    <Button variant="muted" onClick={() => openSet(name)} style={{ flex:1, justifyContent:'flex-start', textAlign:'left', padding:'12px 20px', minWidth: 0, height: 'auto', minHeight: '58px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <div style={btnIconStyle}>
                                            <span style={{ color: 'var(--text-sec)' }}><Icons.Folder /></span>
                                            <span style={{wordBreak:'break-word', lineHeight:'1.4', fontWeight: 500, fontSize: '15px'}}>{name}</span>
                                        </div>
                                    </Button>
                                    <Button variant="red" style={{width: '58px', height: 'auto', padding: 0, flexShrink: 0, borderRadius: '12px', opacity: 0.8}} onClick={() => deleteSet(name)}>
                                        <Icons.Trash />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{display:'flex', gap: 12, alignItems: 'center', background: 'var(--bg-card)', padding: '8px', borderRadius: '16px', border: '1px solid var(--glass-border)'}}>
                            <Input id="newSetName" placeholder="Название нового теста..." style={{margin:0, flex:1, border: 'none', background: 'transparent', boxShadow: 'none'}} />
                            <Button style={{width: '46px', height: '46px', padding:0, margin:0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => { const el=document.getElementById('newSetName'); addSet(el.value); el.value=''; }}>
                                <Icons.Plus />
                            </Button>
                        </div>
                        <div style={{marginTop: 35, textAlign: 'center', fontSize: 13, color: 'var(--text-sec)', opacity: 0.6, fontWeight: 500, letterSpacing: '0.5px'}}>© 2026 Ultimate LMS Platform.</div>
                    </motion.div>
                )}

                {view === 'set_menu' && (
                    <motion.div key="set" initial={{opacity:0, scale: 0.98}} animate={{opacity:1, scale: 1}} exit={{opacity:0, scale: 0.98}} className="glass-panel" style={{width:'100%', maxWidth:'600px', padding: '40px'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px'}}>
                            <Button variant="muted" style={{width:'auto', padding:'0 20px', height: 44, borderRadius: '12px', fontSize: 14, ...btnIconStyle}} onClick={() => setView('menu')}>
                                <Icons.ArrowLeft /> Назад
                            </Button>
                            <span style={{padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600}}>
                                {tests.length} вопросов
                            </span>
                        </div>
                        
                        <h2 style={{textAlign:'center', margin:'0 0 35px 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px'}}>{currentSet}</h2>
                        
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16, marginBottom: 35, alignItems:'stretch'}}>
                            <Button variant="muted" onClick={handlePrint} style={{borderRadius: '14px', height: '54px', border: '1px solid var(--glass-border)', ...btnIconStyle}}>
                                <Icons.Print /> Печать
                            </Button>
                            <label className="import-label" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'white', borderRadius: '14px', cursor: 'pointer', height: '54px', fontWeight: 600, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)'}}>
                                <Icons.Import /> Импорт <input type="file" style={{display:'none'}} accept=".json" onChange={importJSON} />
                            </label>
                        </div>
                        
                        <Button onClick={startTest} style={{fontSize: 16, fontWeight: 700, height: 65, borderRadius: '16px', width: '100%', ...btnIconStyle}}>
                            <Icons.Play /> НАЧАТЬ ТЕСТ
                        </Button>
                    </motion.div>
                )}

                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{scale:0.9, opacity: 0}} animate={{scale:1, opacity: 1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth: 450, padding: '40px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', justifyContent: 'center'}}>
                            <span style={{color: 'var(--primary)', display: 'flex'}}><Icons.Settings /></span>
                            <h2 style={{margin: 0, fontSize: 22, fontWeight: 700}}>Параметры теста</h2>
                        </div>
                        
                        <div style={{marginBottom: 25}}>
                            <label style={{fontSize: 14, fontWeight: 600, color: 'var(--text-sec)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <Icons.Clock /> Время на прохождение (мин):
                            </label>
                            <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{textAlign:'center', fontSize: 20, fontWeight: 700, height: '56px', borderRadius: '12px'}} />
                        </div>
                        
                        <div style={{marginBottom: 35}}>
                            <label style={{fontSize: 14, fontWeight: 600, color: 'var(--text-sec)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <Icons.List /> Количество вопросов (Макс: {tests.length}):
                            </label>
                            <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{textAlign:'center', fontSize: 20, fontWeight: 700, height: '56px', borderRadius: '12px'}} />
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <Button variant="muted" onClick={() => setView('set_menu')} style={{borderRadius: '12px', height: '50px'}}>Отмена</Button>
                            <Button variant="green" onClick={launchTestWithTimer} style={{borderRadius: '12px', height: '50px', ...btnIconStyle}}>
                                Запуск <Icons.Play />
                            </Button>
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
                            <div className="sidebar-content" style={{borderRadius: '20px', border: '1px solid var(--glass-border)', padding: '25px 20px'}}>
                                <div className="sidebar-timer" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '24px', fontWeight: 800, marginBottom: '25px', color: timeLeft < 60 ? '#f56565' : 'inherit'}}>
                                    <Icons.Clock /> {formatTime(timeLeft)}
                                </div>
                                <div className="nav-grid-wrapper" style={{marginBottom: '20px'}}>
                                    <div className="nav-grid-compact">
                                        {testSession.questions.map((_, i) => {
                                            let c = 'var(--nav-item-bg)'; let txt='var(--nav-item-text)';
                                            if (i === testSession.currentIdx) { c = 'var(--primary)'; txt = 'white'; }
                                            else if (testSession.answers[i] !== null) { c = testSession.answers[i] === testSession.questions[i].correctIndex ? '#10b981' : '#ef4444'; txt = 'white'; }
                                            const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                            return (<div key={i} className={itemClass} style={{background:c, color:txt, borderRadius: '10px', fontWeight: 600}} onClick={() => handleNavClick(i)}>{i+1}</div>)
                                        })}
                                    </div>
                                </div>
                                <Button variant="green" onClick={finishTest} style={{width: '100%', borderRadius: '14px', height: '54px', fontWeight: 600, ...btnIconStyle}}>
                                    <Icons.Check /> Завершить
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'result' && (
                    <motion.div key="res" initial={{scale:0.95, opacity: 0}} animate={{scale:1, opacity: 1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500, padding: '45px 35px'}}>
                        
                        <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: testSession.score / testSession.questions.length >= 0.5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: testSession.score / testSession.questions.length >= 0.5 ? '#10b981' : '#ef4444', marginBottom: '20px'}}>
                             {testSession.score / testSession.questions.length >= 0.5 ? <Icons.CheckCircle /> : <Icons.Settings />}
                        </div>

                        <h2 style={{margin: '0 0 10px 0', fontSize: 24, fontWeight: 700}}>
                            {testSession.score / testSession.questions.length >= 0.5 ? 'Отличный результат!' : 'Тест завершен'}
                        </h2>
                        
                        <h1 style={{fontSize: 72, fontWeight: 800, margin:'10px 0', background:'var(--primary-grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                            {Math.round(testSession.score / testSession.questions.length * 100)}%
                        </h1>
                        
                        <div style={{padding:'16px', background:'var(--bg-card)', borderRadius:'16px', marginBottom:'30px', border: '1px solid var(--glass-border)'}}>
                            <p style={{fontSize: 16, color:'var(--text-main)', margin:0, fontWeight:600}}>
                                Правильно: <span style={{color: '#10b981', fontSize: 18}}>{testSession.score}</span> из {testSession.questions.length}
                            </p>
                        </div>
                        
                        <div style={{background:'rgba(255, 255, 255, 0.03)', padding: '25px', borderRadius: '20px', margin:'0 0 30px 0', border:'1px solid var(--glass-border)'}}>
                            {!isResultSaved ? (
                                <>
                                    <Input id="sName" placeholder="Введите ваше имя для сохранения..." style={{textAlign:'center', marginTop:0, marginBottom:16, height: '50px', borderRadius: '12px'}} />
                                    <Button variant="teal" onClick={() => saveResult(document.getElementById('sName').value)} style={{width: '100%', height: '50px', borderRadius: '12px', ...btnIconStyle}}>
                                        <Icons.Save /> Сохранить результат
                                    </Button>
                                </>
                            ) : (
                                <motion.div initial={{scale:0.9, opacity: 0}} animate={{scale:1, opacity: 1}} style={{color:'#10b981', fontWeight: 600, fontSize: 16, padding:'10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                                    <Icons.CheckCircle /> Результат успешно сохранен!
                                </motion.div>
                            )}
                        </div>
                        
                        <div style={{display:'grid', gap: 12, gridTemplateColumns: testSession.score < testSession.questions.length ? '1fr 1fr' : '1fr', marginBottom: '12px'}}>
                            <Button variant="orange" onClick={() => setView('review')} style={{borderRadius: '14px', height: '50px', ...btnIconStyle}}>
                                <Icons.Eye /> Ошибки
                            </Button>
                            {testSession.score < testSession.questions.length && (
                                <Button variant="red" onClick={restartMistakes} style={{borderRadius: '14px', height: '50px', ...btnIconStyle}}>
                                    <Icons.Repeat /> Повторить
                                </Button>
                            )}
                        </div>
                        <Button variant="muted" onClick={() => setView('menu')} style={{width: '100%', borderRadius: '14px', height: '50px', border: '1px solid var(--glass-border)', ...btnIconStyle}}>
                            <Icons.Home /> На главную
                        </Button>
                    </motion.div>
                )}

                {view === 'review' && (
                    <motion.div key="review" initial={{opacity:0, y: 15}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -15}}>
                        <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={() => setView('result')} />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    Object.assign(window, { TestsLMS });
})();
