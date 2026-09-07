// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray, GooeyText } = window;

    // ==================== ИКОНКИ (вместо эмодзи) ====================
    const Icon = ({ children, size = 18, style, ...props }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ display: 'block', flexShrink: 0, ...style }} {...props}>
            {children}
        </svg>
    );
    const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
    const IconMinus = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
    const IconArrowLeft = (p) => <Icon {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
    const IconChevronRight = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6" /></Icon>;
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

    // ==================== МЕЛКИЕ UI-БЛОКИ ====================
    const IconBadge = ({ children, color = '#764ba2', size = 42, style }) => (
        <div style={{ width: size, height: size, minWidth: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}1f`, color, ...style }}>
            {children}
        </div>
    );

    const StatPill = ({ icon, text, color = 'var(--text-sec)' }) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(128,128,128,0.1)', color, fontSize: 13, fontWeight: 600 }}>
            {icon}{text}
        </div>
    );

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

        // --- Мелкие удобства (не меняют бизнес-логику) ---
        const handleAddSetKeyDown = (e) => {
            if (e.key === 'Enter') { const el = document.getElementById('newSetName'); addSet(el.value); el.value = ''; }
        };
        const handleSaveNameKeyDown = (e) => {
            if (e.key === 'Enter') saveResult(document.getElementById('sName').value);
        };
        const adjustTime = (delta) => setCustomTime(prev => String(Math.max(5, (parseInt(prev) || 20) + delta)));
        const adjustQCount = (delta) => setCustomQCount(prev => {
            const cur = parseInt(prev) || tests.length;
            let v = cur + delta;
            if (v < 1) v = 1;
            if (v > tests.length) v = tests.length;
            return String(v);
        });

        const timerUrgent = timeLeft <= 30;
        const timerWarn = timeLeft > 30 && timeLeft <= 120;
        const timerColor = timerUrgent ? '#f56565' : timerWarn ? '#f6ad55' : 'inherit';
        const answeredCount = testSession.answers.filter(a => a !== null).length;
        const totalQ = testSession.questions.length || 1;

        const scoreRatio = testSession.questions.length ? testSession.score / testSession.questions.length : 0;
        const scorePercent = Math.round(scoreRatio * 100);
        const ringColor = scoreRatio >= 0.5 ? '#48bb78' : '#f56565';
        const RING_SIZE = 168, STROKE = 12, RADIUS = (RING_SIZE - STROKE) / 2, CIRC = 2 * Math.PI * RADIUS;

        return (
            <AnimatePresence mode="wait">
                {/* ==================== ГЛАВНОЕ МЕНЮ ==================== */}
                {view === 'menu' && (
                    <motion.div key="menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '800px' }}>
                        <GooeyText texts={["Learn Without Limits", "Build Your Future", "Ultimate LMS Platform"]} style={{ margin: '0 0 14px 0', paddingTop: 10 }} morphTime={1} cooldownTime={1.5} />

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
                            <StatPill icon={<IconCloud size={14} />} text={`${teacherTests?.length || 0} от учителя`} color="#00c6ff" />
                            <StatPill icon={<IconFolder size={14} />} text={`${sets?.length || 0} своих наборов`} />
                        </div>

                        <div style={{ maxHeight: 320, overflowY: 'auto', margin: '0 0 20px 0', paddingRight: 5, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <AnimatePresence initial={false}>
                                {teacherTests?.map((test, i) => (
                                    <motion.div key={test.id} layout
                                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16, scale: 0.9 }}
                                        transition={{ duration: 0.25, delay: i * 0.03 }}
                                        whileHover={{ y: -2 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, background: 'rgba(0,198,255,0.06)', border: '1px solid rgba(0,198,255,0.35)', cursor: 'pointer' }}
                                        onClick={() => openTeacherAssignedTest(test)}>
                                        <IconBadge color="#00c6ff"><IconCloud size={18} /></IconBadge>
                                        <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', lineHeight: 1.3, color: '#00c6ff', fontWeight: 700 }}>{test.title}</span>
                                        <IconChevronRight size={16} style={{ color: '#00c6ff', opacity: 0.6 }} />
                                        <motion.button whileHover={{ scale: 1.12, background: 'rgba(245,101,101,0.18)' }} whileTap={{ scale: 0.9 }}
                                            onClick={(e) => { e.stopPropagation(); removeTeacherTestStudent(test.id, test.title); }}
                                            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', color: '#f56565', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <IconTrash size={16} />
                                        </motion.button>
                                    </motion.div>
                                ))}

                                {sets?.map((name, i) => (
                                    <motion.div key={name} layout
                                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16, scale: 0.9 }}
                                        transition={{ duration: 0.25, delay: i * 0.03 }}
                                        whileHover={{ y: -2 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, background: 'rgba(128,128,128,0.06)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                        onClick={() => openSet(name)}>
                                        <IconBadge><IconFolder size={18} /></IconBadge>
                                        <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', lineHeight: 1.3, fontWeight: 600 }}>{name}</span>
                                        <IconChevronRight size={16} style={{ opacity: 0.4 }} />
                                        <motion.button whileHover={{ scale: 1.12, background: 'rgba(245,101,101,0.18)' }} whileTap={{ scale: 0.9 }}
                                            onClick={(e) => { e.stopPropagation(); deleteSet(name); }}
                                            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', color: '#f56565', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <IconTrash size={16} />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Input id="newSetName" placeholder="Новый тест" style={{ margin: 0, flex: 1 }} onKeyDown={handleAddSetKeyDown} />
                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                onClick={() => { const el = document.getElementById('newSetName'); addSet(el.value); el.value = ''; }}
                                style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 6px 18px rgba(118,75,162,0.4)', cursor: 'pointer' }}>
                                <IconPlus size={20} />
                            </motion.button>
                        </div>
                        <div style={{ marginTop: 26, textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7 }}>© 2026 Ultimate LMS Platform. All Rights Reserved.</div>
                    </motion.div>
                )}

                {/* ==================== МЕНЮ НАБОРА ==================== */}
                {view === 'set_menu' && (
                    <motion.div key="set" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <motion.button whileHover={{ x: -3, background: 'rgba(128,128,128,0.15)' }} whileTap={{ scale: 0.94 }} onClick={() => setView('menu')}
                                style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <IconArrowLeft size={17} />
                            </motion.button>
                            <StatPill icon={<IconHash size={13} />} text={`${tests.length} вопросов`} />
                        </div>

                        <h2 style={{ textAlign: 'center', margin: '0 0 26px 0', fontSize: 24, fontWeight: 800, wordBreak: 'break-word' }}>{currentSet}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                            <motion.button whileHover={{ y: -3, boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.97 }} onClick={handlePrint}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 10px', borderRadius: 18, border: '1px solid var(--glass-border)', background: 'rgba(128,128,128,0.05)', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <IconBadge size={44} color="#667eea"><IconPrinter size={20} /></IconBadge>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>Печать</span>
                            </motion.button>

                            <motion.label whileHover={{ y: -3, boxShadow: '0 10px 24px rgba(0,198,255,0.28)' }} whileTap={{ scale: 0.97 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 10px', borderRadius: 18, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', cursor: 'pointer' }}>
                                <IconBadge size={44} color="rgba(255,255,255,0.95)" style={{ background: 'rgba(255,255,255,0.2)' }}><IconUpload size={20} /></IconBadge>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>Импорт</span>
                                <input type="file" style={{ display: 'none' }} accept=".json" onChange={importJSON} />
                            </motion.label>
                        </div>

                        <motion.button whileHover={{ scale: 1.02, boxShadow: '0 14px 34px rgba(102,126,234,0.45)' }} whileTap={{ scale: 0.98 }} onClick={startTest}
                            style={{ width: '100%', height: 62, borderRadius: 18, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 17, fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 22px rgba(102,126,234,0.35)', cursor: 'pointer' }}>
                            <IconPlay size={20} /> НАЧАТЬ ТЕСТ <IconChevronRight size={18} />
                        </motion.button>
                    </motion.div>
                )}

                {/* ==================== НАСТРОЙКА ТАЙМЕРА ==================== */}
                {view === 'timer_setup' && (
                    <motion.div key="timer" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                        className="glass-panel" style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                            <IconBadge size={36} color="#764ba2"><IconSliders size={17} /></IconBadge>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Параметры теста</h2>
                        </div>

                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                <IconClock size={14} /> Время (минуты)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => adjustTime(-5)}
                                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(128,128,128,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}><IconMinus size={16} /></motion.button>
                                <Input type="number" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, margin: 0, flex: 1 }} />
                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => adjustTime(5)}
                                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(128,128,128,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}><IconPlus size={16} /></motion.button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                <IconHash size={14} /> Вопросов (макс. {tests.length})
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => adjustQCount(-1)}
                                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(128,128,128,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}><IconMinus size={16} /></motion.button>
                                <Input type="number" value={customQCount} onChange={e => setCustomQCount(e.target.value)} style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, margin: 0, flex: 1 }} />
                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => adjustQCount(1)}
                                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(128,128,128,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}><IconPlus size={16} /></motion.button>
                            </div>
                        </div>

                        <motion.button whileHover={{ scale: 1.02, boxShadow: '0 12px 28px rgba(72,187,120,0.4)' }} whileTap={{ scale: 0.97 }} onClick={launchTestWithTimer}
                            style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', cursor: 'pointer', marginBottom: 10 }}>
                            <IconPlay size={18} /> Начать
                        </motion.button>
                        <motion.button whileHover={{ background: 'rgba(128,128,128,0.15)' }} whileTap={{ scale: 0.97 }} onClick={() => setView('set_menu')}
                            style={{ width: '100%', height: 46, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-sec)', fontWeight: 600, cursor: 'pointer' }}>
                            Отмена
                        </motion.button>
                    </motion.div>
                )}

                {/* ==================== ПРОХОЖДЕНИЕ ТЕСТА ==================== */}
                {view === 'test' && (
                    <motion.div key="test-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%' }}>
                        <div style={{ maxWidth: 900, margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', whiteSpace: 'nowrap' }}>
                                Вопрос {testSession.currentIdx + 1} / {testSession.questions.length}
                            </span>
                            <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(128,128,128,0.15)', overflow: 'hidden' }}>
                                <motion.div animate={{ width: `${(answeredCount / totalQ) * 100}%` }} transition={{ duration: 0.35, ease: 'easeOut' }}
                                    style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #667eea, #764ba2)' }} />
                            </div>
                        </div>

                        <div className="test-layout">
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
                                        style={{ color: timerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <IconClock size={18} /> {formatTime(timeLeft)}
                                    </motion.div>
                                    <div className="nav-grid-wrapper">
                                        <div className="nav-grid-compact">
                                            {testSession.questions.map((_, i) => {
                                                let c = 'var(--nav-item-bg)'; let txt = 'var(--nav-item-text)';
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
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={finishTest}
                                        style={{ marginTop: 10, width: '100%', height: 46, borderRadius: 14, border: 'none', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', cursor: 'pointer' }}>
                                        Завершить
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== РЕЗУЛЬТАТ ==================== */}
                {view === 'result' && (
                    <motion.div key="res" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel" style={{ textAlign: 'center', width: '100%', maxWidth: 500 }}>
                        <h2 style={{ marginBottom: 5, fontWeight: 800 }}>{scoreRatio >= 0.5 ? 'Отлично!' : 'Результат'}</h2>

                        <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, margin: '12px auto' }}>
                            <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke="rgba(128,128,128,0.15)" strokeWidth={STROKE} fill="none" />
                                <motion.circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke={ringColor} strokeWidth={STROKE} fill="none" strokeLinecap="round"
                                    strokeDasharray={CIRC} initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: CIRC - scoreRatio * CIRC }} transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                    style={{ fontSize: 40, fontWeight: 800, background: 'var(--primary-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {scorePercent}%
                                </motion.span>
                                <span style={{ fontSize: 13, color: 'var(--text-sec)', fontWeight: 700 }}>{testSession.score} из {testSession.questions.length}</span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(128,128,128,0.05)', padding: 24, borderRadius: 20, margin: '20px 0', border: '1px solid var(--glass-border)' }}>
                            {!isResultSaved ? (
                                <>
                                    <Input id="sName" placeholder="Введите ваше имя" style={{ textAlign: 'center', marginTop: 0, marginBottom: 15 }} onKeyDown={handleSaveNameKeyDown} />
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => saveResult(document.getElementById('sName').value)}
                                        style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)', cursor: 'pointer' }}>
                                        <IconSave size={17} /> Сохранить
                                    </motion.button>
                                </>
                            ) : (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                                    style={{ color: '#10b981', fontWeight: 'bold', fontSize: 17, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <IconCheckCircle size={22} /> Результат успешно сохранен!
                                </motion.div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setView('review')}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 14, border: 'none', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', cursor: 'pointer' }}>
                                <IconAlertTriangle size={16} /> Ошибки
                            </motion.button>
                            {testSession.score < testSession.questions.length && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restartMistakes}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 14, border: 'none', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)', cursor: 'pointer' }}>
                                    <IconRotateCcw size={16} /> Повторить ошибки
                                </motion.button>
                            )}
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setView('menu')}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 14, border: 'none', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', cursor: 'pointer' }}>
                                <IconHome size={16} /> Меню
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {view === 'review' && (
                    <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ReviewView questions={testSession.questions} answers={testSession.answers} onBack={() => setView('menu')} />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    Object.assign(window, { TestsLMS });
})();
