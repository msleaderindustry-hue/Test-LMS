// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray } = window;

    // ============================================================
    // ИКОНКИ (инлайн SVG, без внешних зависимостей — иконки вместо эмодзи)
    // ============================================================
    const Icon = ({ children, size = 18, ...rest }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
            {children}
        </svg>
    );
    const IconChevronLeft = (p) => <Icon {...p}><polyline points="15 18 9 12 15 6" /></Icon>;
    const IconPlay = (p) => <Icon {...p}><polygon points="6 3 20 12 6 21 6 3" /></Icon>;
    const IconPrinter = (p) => <Icon {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Icon>;
    const IconUpload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
    const IconHash = (p) => <Icon {...p}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></Icon>;
    const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
    const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
    const IconFlag = (p) => <Icon {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></Icon>;
    const IconTrophy = (p) => <Icon {...p}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3a2 2 0 0 1-2 4h-1" /><path d="M7 5H4a2 2 0 0 0 2 4h1" /></Icon>;
    const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon>;
    const IconSave = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon>;
    const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
    const IconAlertTriangle = (p) => <Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
    const IconRotateCcw = (p) => <Icon {...p}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></Icon>;
    const IconHome = (p) => <Icon {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>;

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
                    if (!Array.isArray(data)) throw new Error('not-array');
                    const normalized = data.map(t => ({ question: t.question || '', questionImg: t.questionImg || null, variants: (t.variants || []).map(v => typeof v === 'object' ? v : { text: String(v), img: null }), correctIndex: t.correctIndex }));
                    setTests(normalized);
                    localStorage.setItem('tests_' + currentSet, JSON.stringify(normalized));
                    alert(`✅ Импортировано: ${normalized.length}`);
                } catch {
                    alert('Ошибка JSON');
                } finally {
                    // сбрасываем value, чтобы повторный импорт того же файла тоже сработал
                    if (e.target) e.target.value = '';
                }
            };
            reader.readAsText(file);
        };

        const startTest = () => { if (tests.length === 0) return alert('Нет вопросов!'); setCustomQCount(String(tests.length)); setView('timer_setup'); };

        const launchTestWithTimer = async () => {
            let mins = parseInt(customTime) || 20;
            if (mins < 1) mins = 1;
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
                setTestSession(prev => {
                    if (prev.currentIdx < prev.questions.length - 1) return { ...prev, currentIdx: prev.currentIdx + 1 };
                    return prev;
                });
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
            if (testSession.questions.length === 0) { setView('result'); return; }
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
            let mins = parseInt(customTime) || 20; if (mins < 1) mins = 1;
            setTimeLeft(mins * 60);
            setTestSession({ questions: reShuffledQuestions, currentIdx: 0, answers: new Array(reShuffledQuestions.length).fill(null), score: 0 });
            setIsResultSaved(false); setView('test');
        };

        const saveResult = async (name) => {
            if (!name || !name.trim()) return alert('Введите имя!');
            if (testSession.questions.length === 0) return;
            const scoreData = { student: name.trim(), percent: Math.round((testSession.score / testSession.questions.length) * 100), score: testSession.score, total: testSession.questions.length, topic: currentSet };

            const failedQuestions = testSession.questions
                .map((q, i) => ({ q, i }))
                .filter(({ q, i }) => testSession.answers[i] !== q.correctIndex)
                .map(({ q, i }) => {
                    const userAnsIdx = testSession.answers[i];
                    return {
                        question: q.question.replace(/<[^>]+>/g, ''),
                        userAnsText: userAnsIdx !== null && q.variants[userAnsIdx] ? q.variants[userAnsIdx].text : "Пропустил",
                        correctAnsText: q.variants[q.correctIndex].text
                    };
                });

            if (typeof sendTestResultToDiscord === 'function') {
                sendTestResultToDiscord(scoreData, failedQuestions, user ? user.email : "Неизвестно", fp);
            }

            const newRecord = { id: Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5), ...scoreData };

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
            let html = `<div class="print-header"><h1>ТЕСТ: ${currentSet}</h1><div style="display:flex;justify-content:space-between"><div>ФИО: <div class="print-input"></div></div><div>Оценка: <div class="print-input"></div></div></div></div>`;
            const printTests = tests.map(t => ({ ...t, variants: shuffleArray([...t.variants]) }));
            printTests.forEach((t, i) => {
                html += `<div class="print-q"><h4>${i + 1}. ${t.question}</h4>`; if (t.questionImg) html += `<img src="${t.questionImg}" style="max-width:200px;display:block;">`;
                t.variants.forEach(v => { html += `<div class="print-var">${v.text} ${v.img ? '(см. рис)' : ''}</div>`; }); html += `</div>`;
            });
            area.innerHTML = html;
            if (window.MathJax) { MathJax.typesetPromise([area]).then(() => { setTimeout(() => { window.print(); }, 800); }); } else { window.print(); }
        };

        const totalQ = testSession.questions.length;
        const answeredCount = testSession.answers.filter(a => a !== null).length;
        const percent = totalQ > 0 ? Math.round((testSession.score / totalQ) * 100) : 0;
        const passed = totalQ > 0 && testSession.score / totalQ >= 0.5;
        const timeCritical = timeLeft <= 30 && view === 'test';

        return (
            <>
                <style>{`
                    .tlms-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;}
                    .tlms-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid var(--glass-border);background:transparent;color:var(--text-main);cursor:pointer;transition:background .15s ease,transform .1s ease;}
                    .tlms-icon-btn:hover{background:rgba(128,128,128,0.12);}
                    .tlms-icon-btn:active{transform:scale(0.94);}
                    .tlms-title{margin:0;font-size:22px;font-weight:700;text-align:center;flex:1;}
                    .tlms-stat-row{display:flex;justify-content:center;margin-bottom:22px;}
                    .tlms-stat{display:flex;align-items:center;gap:12px;padding:14px 22px;border-radius:16px;background:rgba(128,128,128,0.08);border:1px solid var(--glass-border);}
                    .tlms-stat-value{font-size:22px;font-weight:800;line-height:1;}
                    .tlms-stat-label{font-size:12px;color:var(--text-sec);margin-top:2px;}
                    .tlms-btn-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;}
                    .tlms-btn-content{display:flex;align-items:center;justify-content:center;gap:8px;}
                    .tlms-field-label{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--text-sec);margin-bottom:6px;}
                    .tlms-sidebar-head{display:flex;align-items:center;justify-content:center;gap:8px;font-size:26px;font-weight:800;padding:12px 0;border-radius:14px;background:rgba(128,128,128,0.08);transition:color .2s ease;}
                    .tlms-sidebar-head.critical{color:#f56565;animation:tlms-pulse 1s ease-in-out infinite;}
                    @keyframes tlms-pulse{0%,100%{opacity:1;}50%{opacity:.45;}}
                    .tlms-progress-track{width:100%;height:6px;border-radius:999px;background:rgba(128,128,128,0.18);overflow:hidden;margin:12px 0 4px;}
                    .tlms-progress-fill{height:100%;border-radius:999px;background:var(--primary-grad);}
                    .tlms-progress-label{font-size:12px;color:var(--text-sec);text-align:center;margin-bottom:10px;}
                    .tlms-result-icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;margin:0 auto 8px;background:rgba(128,128,128,0.1);}
                    .tlms-result-icon.pass{color:#48bb78;}
                    .tlms-result-icon.fail{color:#f56565;}
                    .tlms-action-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
                `}</style>

                <AnimatePresence mode="wait">
                    {view === 'set_menu' && (
                        <motion.div key="set" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
                            <div className="tlms-topbar">
                                <button className="tlms-icon-btn" onClick={() => setView('menu')} aria-label="Назад">
                                    <IconChevronLeft size={20} />
                                </button>
                                <h2 className="tlms-title">{currentSet}</h2>
                                <div style={{ width: 40 }} />
                            </div>

                            <div className="tlms-stat-row">
                                <div className="tlms-stat">
                                    <IconHash size={22} />
                                    <div>
                                        <div className="tlms-stat-value">{tests.length}</div>
                                        <div className="tlms-stat-label">вопросов в базе</div>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={startTest} disabled={tests.length === 0} style={{ fontSize: 18, height: 60 }}>
                                <span className="tlms-btn-content"><IconPlay size={20} /> Начать тест</span>
                            </Button>

                            <div className="tlms-btn-row">
                                <Button variant="muted" onClick={handlePrint}>
                                    <span className="tlms-btn-content"><IconPrinter size={17} /> Печать</span>
                                </Button>
                                <label className="import-label" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                                    <IconUpload size={17} /> Импорт
                                    <input type="file" style={{ display: 'none' }} accept=".json" onChange={importJSON} />
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {view === 'timer_setup' && (
                        <motion.div key="timer" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="glass-panel" style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                            <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <IconSettings size={20} /> Параметры теста
                            </h2>
                            <div style={{ marginBottom: 15, textAlign: 'left' }}>
                                <label className="tlms-field-label"><IconClock size={15} /> Время (минуты)</label>
                                <Input type="number" min="1" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ textAlign: 'center', fontSize: 20, fontWeight: 800 }} />
                            </div>
                            <div style={{ marginBottom: 15, textAlign: 'left' }}>
                                <label className="tlms-field-label"><IconHash size={15} /> Количество вопросов (макс. {tests.length})</label>
                                <Input type="number" min="1" max={tests.length} value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{ textAlign: 'center', fontSize: 20, fontWeight: 800 }} />
                            </div>
                            <Button variant="green" onClick={launchTestWithTimer} style={{ marginTop: 20 }}>
                                <span className="tlms-btn-content"><IconPlay size={18} /> Начать</span>
                            </Button>
                            <Button variant="muted" onClick={() => setView('set_menu')}>Отмена</Button>
                        </motion.div>
                    )}

                    {view === 'test' && (
                        <motion.div key="test-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="test-layout">
                            <div className="question-column">
                                <AnimatePresence mode="wait">
                                    <TestQuestionCard key={testSession.currentIdx} question={testSession.questions[testSession.currentIdx]} index={testSession.currentIdx} answers={testSession.answers} onAnswer={handleAnswer} />
                                </AnimatePresence>
                            </div>
                            <div className="sidebar-column">
                                <div className="sidebar-content">
                                    <div className={`tlms-sidebar-head ${timeCritical ? 'critical' : ''}`}>
                                        <IconClock size={20} /> {formatTime(timeLeft)}
                                    </div>

                                    <div className="tlms-progress-track">
                                        <motion.div className="tlms-progress-fill" animate={{ width: `${totalQ > 0 ? (answeredCount / totalQ) * 100 : 0}%` }} transition={{ duration: 0.3 }} />
                                    </div>
                                    <div className="tlms-progress-label">{answeredCount} из {totalQ} отвечено</div>

                                    <div className="nav-grid-wrapper">
                                        <div className="nav-grid-compact">
                                            {testSession.questions.map((_, i) => {
                                                let c = 'var(--nav-item-bg)'; let txt = 'var(--nav-item-text)';
                                                if (i === testSession.currentIdx) { c = '#764ba2'; txt = 'white'; }
                                                else if (testSession.answers[i] !== null) { c = testSession.answers[i] === testSession.questions[i].correctIndex ? '#48bb78' : '#f56565'; txt = 'white'; }
                                                const itemClass = `nav-item ${isAnimating ? 'disabled' : ''}`;
                                                return (<div key={i} className={itemClass} style={{ background: c, color: txt }} onClick={() => handleNavClick(i)}>{i + 1}</div>)
                                            })}
                                        </div>
                                    </div>
                                    <Button variant="green" onClick={finishTest} style={{ marginTop: 10 }}>
                                        <span className="tlms-btn-content"><IconFlag size={17} /> Завершить</span>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {view === 'result' && (
                        <motion.div key="res" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="glass-panel" style={{ textAlign: 'center', width: '100%', maxWidth: 500 }}>
                            <div className={`tlms-result-icon ${passed ? 'pass' : 'fail'}`}>
                                {passed ? <IconTrophy size={30} /> : <IconTarget size={30} />}
                            </div>
                            <h2 style={{ marginBottom: 5 }}>{passed ? 'Отлично!' : 'Результат'}</h2>
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                style={{ fontSize: 64, margin: '10px 0', background: 'var(--primary-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {percent}%
                            </motion.h1>
                            <div style={{ padding: '10px', background: 'rgba(128,128,128,0.1)', borderRadius: '14px', marginBottom: '20px' }}>
                                <p style={{ fontSize: 18, color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>Правильно: {testSession.score} из {totalQ}</p>
                            </div>
                            <div style={{ background: 'rgba(128,128,128,0.05)', padding: 25, borderRadius: 20, margin: '25px 0', border: '1px solid var(--glass-border)' }}>
                                {!isResultSaved ? (
                                    <>
                                        <Input id="sName" placeholder="Введите ваше имя" style={{ textAlign: 'center', marginTop: 0, marginBottom: 15 }} />
                                        <Button variant="teal" onClick={() => saveResult(document.getElementById('sName').value)}>
                                            <span className="tlms-btn-content"><IconSave size={17} /> Сохранить</span>
                                        </Button>
                                    </>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: '#10b981', fontWeight: 'bold', fontSize: 17, padding: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <IconCheckCircle size={20} /> Результат успешно сохранен!
                                    </motion.div>
                                )}
                            </div>
                            <div className="tlms-action-row">
                                <Button variant="orange" onClick={() => setView('review')}>
                                    <span className="tlms-btn-content"><IconAlertTriangle size={16} /> Ошибки</span>
                                </Button>
                                {testSession.score < totalQ && (
                                    <Button variant="red" onClick={restartMistakes}>
                                        <span className="tlms-btn-content"><IconRotateCcw size={16} /> Повторить ошибки</span>
                                    </Button>
                                )}
                                <Button onClick={() => setView('menu')}>
                                    <span className="tlms-btn-content"><IconHome size={16} /> Меню</span>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {view === 'review' && (
                        <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={() => setView('menu')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    };

    Object.assign(window, { TestsLMS });
})();
