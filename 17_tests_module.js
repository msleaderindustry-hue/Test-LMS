// --- 11_tests_module.js ---
(function () {
    // ВНИМАНИЕ: Добавлен useRef в деструктуризацию из window
    const { useState, useEffect, useRef, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray } = window;

    // --- НОВЫЙ КОМПОНЕНТ ЗАСТАВКИ СО ЗВЕЗДОЧКОЙ ---
    const AnimatedHeader = () => {
        const stageRef = useRef(null);
        const tagOldRef = useRef(null);
        const tagNewRef = useRef(null);
        const wandRef = useRef(null);

        useEffect(() => {
            const phrases = [
                "Learn without limits",
                "Small steps lead to big changes",
                "Believe. Learn. Achieve."
            ];
            let index = 0;
            let ambientTimer = null;
            let transitionTimeout = null;
            let animationFrameId = null;

            const stage = stageRef.current;
            const tagOld = tagOldRef.current;
            const tagNew = tagNewRef.current;
            const wand = wandRef.current;

            if (!stage || !tagOld || !tagNew || !wand) return;

            function spawnSparkle(x, y, size) {
                const s = document.createElement('div');
                s.className = 'sparkle-anim';
                s.style.left = x + 'px';
                s.style.top = y + 'px';
                const scale = size || (0.7 + Math.random() * 0.7);
                s.style.width = (6 * scale) + 'px';
                s.style.height = (6 * scale) + 'px';
                stage.appendChild(s);
                s.addEventListener('animationend', () => s.remove());
            }

            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function runWandTransition() {
                if (!tagOld || !tagNew || !stage || !wand) return;
                const oldWidth = tagOld.getBoundingClientRect().width;
                const nextIndex = (index + 1) % phrases.length;
                tagNew.textContent = phrases[nextIndex];
                const newWidth = tagNew.getBoundingClientRect().width;

                const stageWidth = Math.max(oldWidth, newWidth);
                stage.style.width = stageWidth + 'px';

                const oldLeft = (stageWidth - oldWidth) / 2;
                const newLeft = (stageWidth - newWidth) / 2;

                const pad = 8;
                const startX = newLeft - pad;
                const endX = newLeft + newWidth + pad;
                const pathLength = endX - startX;
                const midY = stage.getBoundingClientRect().height / 2;

                const duration = 500 + pathLength * 1.0;
                const start = performance.now();
                let lastSparkleTime = 0;

                function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

                function frame(now) {
                    const elapsed = now - start;
                    const t = Math.min(1, elapsed / duration);

                    if (t < 0.1) {
                        wand.style.opacity = String(t * 10);
                    } else {
                        wand.style.opacity = '1';
                    }

                    const eased = easeInOutCubic(t);
                    const x = startX + pathLength * eased;
                    const y = midY + Math.sin(t * Math.PI * 2.4) * 5;

                    wand.style.transform = `translate(${x - 7}px, ${y - 7}px) rotate(${t * 220}deg)`;

                    const newLocalX = clamp(x - newLeft, 0, newWidth);
                    const newClipFromRight = newWidth - newLocalX;
                    tagNew.style.clipPath = `inset(0 ${newClipFromRight}px 0 0)`;

                    const oldLocalX = (oldWidth + pad * 2) * eased - pad;
                    const clampedOldX = clamp(oldLocalX, 0, oldWidth);
                    tagOld.style.clipPath = `inset(0 0 0 ${clampedOldX}px)`;

                    if (now - lastSparkleTime > 28) {
                        spawnSparkle(x + (Math.random() * 6 - 3), y + (Math.random() * 6 - 3));
                        lastSparkleTime = now;
                    }

                    if (t < 1) {
                        animationFrameId = requestAnimationFrame(frame);
                    } else {
                        index = nextIndex;
                        tagOld.textContent = phrases[index];
                        tagOld.style.clipPath = 'inset(0 0 0 0)';
                        fadeOutWand(x, y);
                    }
                }
                animationFrameId = requestAnimationFrame(frame);
            }

            function fadeOutWand(fromX, fromY) {
                spawnSparkle(fromX, fromY, 0.9);
                const duration = 500;
                const start = performance.now();

                function fadeFrame(now) {
                    const elapsed = now - start;
                    const t = Math.min(1, elapsed / duration);
                    const eased = 1 - Math.pow(1 - t, 3);

                    const scale = 1 - eased * 0.3;
                    wand.style.transform = `translate(${fromX - 7}px, ${fromY - 7}px) rotate(${220 + eased * 40}deg) scale(${scale})`;
                    wand.style.opacity = String(1 - t);

                    if (t < 1) {
                        animationFrameId = requestAnimationFrame(fadeFrame);
                    } else {
                        wand.style.opacity = '0';
                        stage.style.width = '';
                        scheduleNext();
                    }
                }
                animationFrameId = requestAnimationFrame(fadeFrame);
            }

            function ambientSparkle() {
                if (!stage) return;
                const rect = stage.getBoundingClientRect();
                const x = Math.random() * rect.width;
                const y = rect.height / 2 + (Math.random() * 10 - 5);
                spawnSparkle(x, y, 0.55 + Math.random() * 0.4);
            }

            function startAmbient() {
                ambientTimer = setInterval(ambientSparkle, 900);
            }
            function stopAmbient() {
                clearInterval(ambientTimer);
            }

            function scheduleNext() {
                startAmbient();
                transitionTimeout = setTimeout(() => {
                    stopAmbient();
                    runWandTransition();
                }, 2800);
            }

            tagOld.textContent = phrases[0];
            tagNew.textContent = phrases[0];
            scheduleNext();

            return () => {
                stopAmbient();
                clearTimeout(transitionTimeout);
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            };
        }, []);

        return (
            <div style={{ textAlign: 'center', marginBottom: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<style dangerouslySetInnerHTML={{__html: `
                    .icon-wrap-anim { width:96px; height:96px; margin:0 auto 16px; position:relative; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0.7); animation: iconInAnim .5s .05s cubic-bezier(.2,.8,.2,1) forwards; }
                    @keyframes iconInAnim { to { opacity:1; transform:scale(1); } }
                    .halo-anim { position:absolute; inset:-20px; border-radius:50%; background: radial-gradient(circle, rgba(122,184,255,0.30), rgba(138,91,255,0.14) 60%, transparent 75%); filter: blur(10px); pointer-events:none; }
                    .icon-float-anim { width:56px; height:56px; position:relative; z-index:2; filter: drop-shadow(0 6px 16px rgba(90,110,255,0.5)); }
                    .icon-float-anim svg { width:100%; height:100%; display:block; }
                    .title-anim { font-size:30px; font-weight:800; letter-spacing:-0.01em; margin:0 0 8px; background: linear-gradient(100deg, #7ab8ff, #8a5bff); -webkit-background-clip:text; background-clip:text; color:transparent; opacity:0; transform:translateY(8px); animation: titleInAnim .5s .18s ease forwards; }
                    @keyframes titleInAnim { to { opacity:1; transform:translateY(0); } }
                    .tagline-wrap-anim { opacity:0; animation: taglineInAnim .5s .4s ease forwards; display:flex; justify-content:center; overflow:visible; width: 100%; }
                    @keyframes taglineInAnim { to { opacity:1; } }
                    .tag-stage-anim { position:relative; height:24px; display:flex; align-items:center; justify-content:center; overflow:visible; transition: width 0.1s ease; margin: 0 auto; }
                    .tag-text-anim { font-size:15px; font-weight:600; letter-spacing:.01em; white-space:nowrap; color:var(--text-sec, #8b87a8); }
                    #tagNewAnim { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); }
                    .wand-anim { position:absolute; top:50%; left:0; width:14px; height:14px; transform:translate(-50%,-50%); opacity:0; pointer-events:none; color:#fff; filter: drop-shadow(0 0 6px rgba(122,184,255,0.9)) drop-shadow(0 0 3px #fff); z-index: 10;}
                    .wand-anim svg { width:100%; height:100%; display:block; }
                    .sparkle-anim { position:absolute; top:0; left:0; background: linear-gradient(45deg, #fff, #7ab8ff); clip-path: polygon(50% 0%, 61% 35%, 100% 50%, 61% 65%, 50% 100%, 39% 65%, 0% 50%, 39% 35%); opacity:0; pointer-events:none; animation: sparklePopAnim 1s ease-out forwards; z-index: 5;}
                    @keyframes sparklePopAnim { 0% { opacity:0; transform: translate(-50%,-50%) scale(0) rotate(0deg); } 18% { opacity:1; transform: translate(-50%,-50%) scale(1) rotate(50deg); } 100% { opacity:0; transform: translate(-50%,-50%) scale(0.35) translateY(-16px) rotate(140deg); } }
                `}} />
 
                <div className="icon-wrap-anim">
                    <div className="halo-anim"></div>
                    <div className="icon-float-anim">
                        <svg viewBox="0 0 64 64" fill="none">
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
                </div>

                <h1 className="title-anim">Ultimate LMS Platform</h1>

                <div className="tagline-wrap-anim">
                    <div className="tag-stage-anim" ref={stageRef}>
                        <span className="tag-text-anim" ref={tagOldRef}>Learn without limits</span>
                        <span className="tag-text-anim" id="tagNewAnim" ref={tagNewRef} style={{clipPath: 'inset(0 100% 0 0)'}}>Learn without limits</span>
                        <div className="wand-anim" ref={wandRef}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0l1.8 6.2L20 8l-6.2 1.8L12 16l-1.8-6.2L4 8l6.2-1.8L12 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                    <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px', paddingTop: '40px'}}>
                        
                        {/* === ВСТАВЛЕННАЯ НОВАЯ АНИМАЦИЯ === */}
                        <AnimatedHeader />
                        
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
