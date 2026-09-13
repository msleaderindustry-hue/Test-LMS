// --- 11_tests_module.js ---
(function () {
    const { useState, useEffect, useRef, motion, AnimatePresence, Button, Input, TestQuestionCard, ReviewView, captureViolation, sendTestResultToDiscord, shuffleArray } = window;

    // --- КОМПОНЕНТ ЗАСТАВКИ ---
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

    // --- КОМПОНЕНТ SWIPE-TO-DELETE ---
    const SwipeableRow = ({ children, rowKey, registerClose, onArm, onDismiss, onClick }) => {
        const itemRef = useRef(null);
        const hintRef = useRef(null);
        const stateRef = useRef({ dragging:false, axis:null, startX:0, startY:0, baseX:0, armed:false, overDismiss:false, suppressNextClick:false });
        const OPEN = 84, DISMISS = 190;

        const vibrate = (ms) => { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch(e){} } };

        const setX = (x) => {
            const item = itemRef.current, hint = hintRef.current;
            if (!item || !hint) return;
            item.style.transform = `translateX(${x}px)`;
            item.dataset.x = x;
            const absX = Math.abs(x);
            hint.style.opacity = Math.min(1, absX / OPEN);
            const openP = Math.min(1, absX / OPEN);
            const dismissP = Math.max(0, Math.min(1, (absX - OPEN) / (DISMISS - OPEN)));
            hint.style.setProperty('--icon-scale', (0.8 + openP * 0.2 + dismissP * 0.25).toFixed(3));
            hint.style.filter = `brightness(${1 + dismissP * 0.18})`;
            const s = stateRef.current;
            const nowArmed = absX >= OPEN * 0.5;
            if (nowArmed && !s.armed) vibrate(9);
            s.armed = nowArmed;
            const nowOver = absX >= DISMISS;
            if (nowOver && !s.overDismiss) vibrate(16);
            s.overDismiss = nowOver;
        };

        const close = () => setX(0);

        const animateOutAndDismiss = () => {
            const item = itemRef.current;
            if (!item) return;
            item.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease';
            item.style.transform = 'translateX(-120%) scale(0.95)';
            item.style.opacity = '0';
            setTimeout(() => {
                onDismiss && onDismiss();
            }, 280);
        };

        useEffect(() => {
            if (registerClose) registerClose(rowKey, close);
            const el = itemRef.current;
            const guard = (e) => {
                if (stateRef.current.suppressNextClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    stateRef.current.suppressNextClick = false;
                }
            };
            el.addEventListener('click', guard, true);
            return () => el.removeEventListener('click', guard, true);
        }, []);

        const onDown = (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const s = stateRef.current;
            s.dragging = true; s.axis = null;
            s.startX = e.clientX; s.startY = e.clientY;
            s.baseX = parseFloat(itemRef.current.dataset.x) || 0;
            itemRef.current.style.transition = 'none';
            itemRef.current.setPointerCapture(e.pointerId);
        };
        const onMove = (e) => {
            const s = stateRef.current;
            if (!s.dragging) return;
            const dx = e.clientX - s.startX, dy = e.clientY - s.startY;
            if (s.axis === null) {
                if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
                s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
                if (s.axis === 'y') { s.dragging = false; return; }
                if (onArm) onArm();
            }
            if (s.axis !== 'x') return;
            let x = s.baseX + dx;
            if (x > 0) x *= 0.25;
            setX(x);
        };
        const onUp = (e) => {
            const s = stateRef.current;
            if (!s.dragging) return;
            s.dragging = false;
            const item = itemRef.current;
            item.style.transition = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';
            if (item.hasPointerCapture(e.pointerId)) item.releasePointerCapture(e.pointerId);

            if (s.axis === 'x') {
                const x = parseFloat(item.dataset.x) || 0;
                if (Math.abs(x) > 4) s.suppressNextClick = true;
                
                if (x < -DISMISS) {
                    vibrate(20);
                    animateOutAndDismiss();
                } else if (x < -OPEN * 0.5) {
                    setX(-OPEN);
                    if (hintRef.current) {
                        hintRef.current.classList.add('armed-pop');
                        setTimeout(() => hintRef.current && hintRef.current.classList.remove('armed-pop'), 320);
                    }
                } else {
                    close();
                    if (Math.abs(x) < 5 && onClick) onClick(); 
                }
            } else {
                if (onClick) onClick(); 
            }
            s.axis = null;
        };

        const handleHintClick = (e) => {
            e.stopPropagation();
            const x = parseFloat(itemRef.current.dataset.x) || 0;
            if (Math.abs(x) < OPEN * 0.6) return;
            vibrate(20);
            animateOutAndDismiss();
        };

        return (
            <div className="tlms-swrow-track">
                <div className="tlms-swrow-hint" ref={hintRef} onClick={handleHintClick}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    <span>Удалить</span>
                </div>
                <div className="tlms-swrow-item" ref={itemRef} data-x="0"
                    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                    {children}
                </div>
            </div>
        );
    };

    const TestsLMS = ({ view, setView, currentSet, tests, setTests, user, history, setHistory, fp, sets, addSet, deleteSet, openSet, teacherTests, openTeacherAssignedTest, removeTeacherTestStudent }) => {
        // --- ЛОКАЛЬНЫЕ СОСТОЯНИЯ ТЕСТА ---
        const [testSession, setTestSession] = useState({ questions: [], currentIdx: 0, answers: [], score: 0 });
        const [isResultSaved, setIsResultSaved] = useState(false);
        const [timeLeft, setTimeLeft] = useState(1200);
        const [customTime, setCustomTime] = useState('20');
        const [customQCount, setCustomQCount] = useState('');
        const [isAnimating, setIsAnimating] = useState(false);
        
        // --- СОСТОЯНИЯ ДЛЯ ЭКРАНА НАСТРОЕК ТЕСТА ---
        const [shakeTime, setShakeTime] = useState(false);
        const [shakeQ, setShakeQ] = useState(false);
        const [isStarting, setIsStarting] = useState(false);

        // --- СОСТОЯНИЯ ДЛЯ СВАЙПА, ДОБАВЛЕНИЯ И ОТМЕНЫ (UNDO) ---
        const [hiddenSetKeys, setHiddenSetKeys] = useState(() => new Set());
        const [pendingDelete, setPendingDelete] = useState(null);
        
        // --- Состояния для поля добавления ---
        const [addFocused, setAddFocused] = useState(false);
        const [addVal, setAddVal] = useState('');
        const [addShake, setAddShake] = useState(false);
        const [addDone, setAddDone] = useState(false);

        const closeRegistryRef = useRef({});

        const registerClose = (key, fn) => { closeRegistryRef.current[key] = fn; };
        const closeOthers = (exceptKey) => {
            Object.entries(closeRegistryRef.current).forEach(([k, fn]) => { if (k !== String(exceptKey) && fn) fn(); });
        };

        useEffect(() => {
            const handler = (e) => {
                if (!e.target.closest('.tlms-swrow-track')) {
                    Object.values(closeRegistryRef.current).forEach(fn => fn && fn());
                }
            };
            document.addEventListener('pointerdown', handler);
            return () => document.removeEventListener('pointerdown', handler);
        }, []);

        const requestDelete = (key, label, commitFn) => {
            if (pendingDelete) { 
                clearTimeout(pendingDelete.timer); 
                pendingDelete.commitFn(); 
                // Очищаем предыдущий удаленный из hidden ключей
                setHiddenSetKeys(prev => { const n = new Set(prev); n.delete(pendingDelete.key); return n; });
            }
            setHiddenSetKeys(prev => { const n = new Set(prev); n.add(key); return n; });
            const timer = setTimeout(() => { 
                commitFn(); 
                setPendingDelete(null); 
                // ИСПРАВЛЕНИЕ: Очищаем скрытый ключ после реального удаления
                setHiddenSetKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
            }, 4000);
            setPendingDelete({ key, label, commitFn, timer });
        };

        const undoDelete = () => {
            if (!pendingDelete) return;
            clearTimeout(pendingDelete.timer);
            setHiddenSetKeys(prev => { const n = new Set(prev); n.delete(pendingDelete.key); return n; });
            setPendingDelete(null);
        };

        const handleAddNewSet = () => {
            const val = addVal.trim();
            if (!val) {
                setAddShake(true);
                setTimeout(() => setAddShake(false), 380);
                return;
            }
            
            // ИСПРАВЛЕНИЕ: Убираем новое имя из скрытых, вдруг оно там застряло
            setHiddenSetKeys(prev => { const n = new Set(prev); n.delete(val); return n; });

            setAddDone(true);
            setTimeout(() => setAddDone(false), 550);
            addSet(val);
            setAddVal('');
        };

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

        const resultPercent = testSession.questions.length > 0 ? Math.round((testSession.score / testSession.questions.length) * 100) : 0;
        const circleRadius = 80;
        const circleCircumference = 2 * Math.PI * circleRadius;
        const circleStrokeDashoffset = circleCircumference - (resultPercent / 100) * circleCircumference;

        return (
            <AnimatePresence mode="wait">
                {view === 'menu' && (
                    <motion.div key="menu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'800px', paddingTop: '40px'}}>
                        
                        <AnimatedHeader />
                        
                        <style dangerouslySetInnerHTML={{__html: `
                            .tlms-swrow-track{ position:relative; border-radius:18px; overflow:hidden; }
                            .tlms-swrow-hint{
                              position:absolute; inset:0; border-radius:18px;
                              background: linear-gradient(135deg,#f36767,#dc2626);
                              display:flex; align-items:center; justify-content:flex-end;
                              padding-right:20px; gap:8px; opacity:0; cursor:pointer;
                            }
                            .tlms-swrow-hint svg{ width:18px; height:18px; transform:scale(var(--icon-scale,1)); transition:transform .12s ease; }
                            .tlms-swrow-hint span{ color:#fff; font-size:13px; font-weight:700; white-space:nowrap; }
                            .tlms-swrow-hint.armed-pop{ animation: tlmsArmedPop .32s cubic-bezier(.34,1.56,.64,1); }
                            @keyframes tlmsArmedPop{ 0%{transform:scale(1);} 40%{transform:scale(1.05);} 100%{transform:scale(1);} }
                            .tlms-swrow-item{ position:relative; touch-action:pan-y; transform:translateX(0);
                              transition:transform .32s cubic-bezier(.32,.72,0,1); will-change:transform; cursor: pointer; }
                            .tlms-swrow-item.dragging{ transition:none; cursor: grabbing; }

                            /* Точно как в HTML прототипе для поля карточек и добавления */
                            .tlms-item {
                                display:flex; align-items:center; gap:16px;
                                background: #1c1f2c; /* var(--row-bg-solid) */
                                border:1px solid rgba(255,255,255,.06); /* var(--border) */
                                border-radius:18px;
                                padding:15px 15px 15px 16px;
                                transition: background 0.1s ease;
                            }
                            .tlms-item:active {
                                background: rgba(28, 31, 44, 0.7);
                            }
                            .tlms-icon-box {
                                width:44px; height:44px; min-width:44px; border-radius:13px;
                                display:flex; align-items:center; justify-content:center;
                                box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 4px 10px rgba(0,0,0,.3);
                            }
                            .tlms-item-label {
                                flex:1; font-size:16px; font-weight:700; color:#f3f4f8; word-break: break-word;
                            }

                            .tlms-add-row {
                              display:flex; align-items:center; gap:10px;
                              background: #1c1f2c;
                              border:1px solid rgba(255,255,255,.06);
                              border-radius:18px;
                              padding:6px 6px 6px 18px;
                              transition: box-shadow .2s ease, border-color .2s ease;
                              margin-bottom: 20px;
                            }
                            .tlms-add-row.focused { border-color: rgba(139,92,246,.55); box-shadow: 0 0 0 3px rgba(139,92,246,.16); }
                            .tlms-add-row.shake { animation: tlmsShakeX .38s ease; }
                            @keyframes tlmsShakeX { 0%,100%{ transform: translateX(0); } 25%{ transform: translateX(-6px); } 75%{ transform: translateX(6px); } }
                            .tlms-add-input {
                              flex:1; min-width:0; background:none; border:none; outline:none;
                              color:#f3f4f8; font-size:15.5px; font-family:inherit;
                            }
                            .tlms-add-input::placeholder { color: #8b90a6; }
                            .tlms-add-btn {
                              width:44px; height:44px; min-width:44px; border:none; border-radius:13px;
                              background: linear-gradient(150deg,#8b5cf6,#7c3aed);
                              color:#fff; display:flex; align-items:center; justify-content:center;
                              cursor:pointer; position:relative;
                              transition: opacity .2s ease, transform .32s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
                              opacity:0; transform: scale(.3) rotate(-25deg); pointer-events:none; box-shadow:none;
                            }
                            .tlms-add-btn.visible { opacity:1; transform: scale(1) rotate(0); pointer-events:auto; box-shadow: 0 6px 16px rgba(124,58,237,.35); }
                            .tlms-add-btn.visible:active { transform: scale(.88); }
                            .tlms-add-btn svg { width:19px; height:19px; position:absolute; transition: opacity .18s ease, transform .3s cubic-bezier(.34,1.56,.64,1); }
                            .tlms-add-btn .ic-plus { opacity:1; transform: rotate(0) scale(1); }
                            .tlms-add-btn .ic-check { opacity:0; transform: rotate(-45deg) scale(.5); }
                            .tlms-add-btn.done .ic-plus { opacity:0; transform: rotate(45deg) scale(.5); }
                            .tlms-add-btn.done .ic-check { opacity:1; transform: rotate(0) scale(1); }

                            .tlms-snackbar-zone{ position:fixed; left:0; right:0; bottom:0; z-index:9999; display:flex; justify-content:center;
                              padding:0 16px calc(18px + env(safe-area-inset-bottom)); pointer-events:none; }
                            .tlms-snackbar{ pointer-events:auto; width:100%; max-width:420px; background:#1c1f2c;
                              border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:13px 8px 13px 18px;
                              display:flex; align-items:center; gap:14px; box-shadow:0 20px 50px rgba(0,0,0,.5); position:relative; overflow:hidden; }
                            .tlms-snackbar-text{ flex:1; font-size:14px; font-weight:600; color:#f3f4f8; }
                            .tlms-snackbar-undo{ background:none; border:none; color:#8b5cf6; font-weight:700; font-size:14px;
                              padding:9px 14px; border-radius:10px; cursor:pointer; transition:background .15s ease, transform .15s ease; }
                            .tlms-snackbar-undo:active{ transform:scale(.92); background:rgba(139,92,246,.14); }
                            .tlms-snackbar-bar{ position:absolute; left:0; bottom:0; height:2.5px;
                              background:linear-gradient(90deg,#8b5cf6,#6ea8fe); width:100%; transform-origin:left;
                              animation: tlmsShrinkBar 4s linear forwards; }
                            @keyframes tlmsShrinkBar{ from{transform:scaleX(1);} to{transform:scaleX(0);} }
                        `}} />

                        <div style={{maxHeight:300, overflowY:'auto', margin:'0 0 10px 0', paddingRight:5}}>
                            <AnimatePresence initial={false}>
                                {teacherTests?.filter(test => !hiddenSetKeys.has(test.id)).map(test => (
                                    <motion.div
                                        key={test.id}
                                        layout
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, scale: 0.97 }}
                                        transition={{ duration: 0.3, ease: [0.32,0.72,0,1] }}
                                        style={{ overflow: 'hidden', marginBottom: 10 }}
                                    >
                                        <SwipeableRow 
                                            rowKey={test.id} 
                                            registerClose={registerClose} 
                                            onArm={() => closeOthers(test.id)} 
                                            onDismiss={() => requestDelete(test.id, test.title, () => removeTeacherTestStudent(test.id, test.title))}
                                            onClick={() => openTeacherAssignedTest(test)}
                                        >
                                            <div className="tlms-item">
                                                <div className="tlms-icon-box" style={{ background: 'linear-gradient(150deg, #38bdf8, #0ea5e9)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'column', flex:1}}>
                                                    <span style={{fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px'}}>Опубликован</span>
                                                    <div className="tlms-item-label">{test.title}</div>
                                                </div>
                                            </div>
                                        </SwipeableRow>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <AnimatePresence initial={false}>
                                {sets?.filter(name => !hiddenSetKeys.has(name)).map(name => (
                                    <motion.div
                                        key={name}
                                        layout
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, scale: 0.97 }}
                                        transition={{ duration: 0.3, ease: [0.32,0.72,0,1] }}
                                        style={{ overflow: 'hidden', marginBottom: 10 }}
                                    >
                                        <SwipeableRow 
                                            rowKey={name} 
                                            registerClose={registerClose} 
                                            onArm={() => closeOthers(name)} 
                                            onDismiss={() => requestDelete(name, name, () => deleteSet(name))}
                                            onClick={() => openSet(name)}
                                        >
                                            <div className="tlms-item">
                                                <div className="tlms-icon-box" style={{ background: 'linear-gradient(150deg, #a78bfa, #7c3aed)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                                                </div>
                                                <div className="tlms-item-label">{name}</div>
                                            </div>
                                        </SwipeableRow>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className={`tlms-add-row ${addFocused ? 'focused' : ''} ${addShake ? 'shake' : ''}`}>
                            <input 
                                className="tlms-add-input" 
                                placeholder="Новый тест" 
                                value={addVal}
                                onChange={e => setAddVal(e.target.value)}
                                onFocus={() => setAddFocused(true)}
                                onBlur={() => setAddFocused(false)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddNewSet(); }}
                                maxLength={48}
                                autoComplete="off"
                            />
                            <button 
                                className={`tlms-add-btn ${addVal.trim().length > 0 ? 'visible' : ''} ${addDone ? 'done' : ''}`}
                                onClick={handleAddNewSet}
                            >
                                <svg className="ic-plus" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/></svg>
                                <svg className="ic-check" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                        </div>
                        
                        <div style={{textAlign: 'center', fontSize: 12, color: 'var(--text-sec)', opacity: 0.7}}>© 2026 Ultimate LMS Platform. All Rights Reserved.</div>
                        
                        <AnimatePresence>
                          {pendingDelete && (
                            <motion.div className="tlms-snackbar-zone" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                              <motion.div className="tlms-snackbar" initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }} transition={{ duration:0.28, ease:[0.32,0.72,0,1] }}>
                                <div className="tlms-snackbar-text">«{pendingDelete.label}» удалено</div>
                                <button className="tlms-snackbar-undo" onClick={undoDelete}>Отменить</button>
                                <div className="tlms-snackbar-bar" key={pendingDelete.key}></div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {view === 'set_menu' && (
                    <motion.div key="set" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-panel" style={{width:'100%', maxWidth:'600px', position: 'relative', paddingTop: '40px'}}>
                        <button onClick={() => setView('menu')} style={{ position: 'absolute', top: '24px', left: '24px', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--bg-panel)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, padding: 0 }}>
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
                            <label style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)', color:'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '16px', padding: '16px', margin: 0, fontWeight: 600, fontSize: '15px', textAlign: 'center', transition: 'transform 0.1s', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)' }}>
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

                {view === 'result' && (
                    <motion.div key="res" initial={{scale:0.95}} animate={{scale:1}} exit={{opacity:0}} className="glass-panel" style={{textAlign:'center', width:'100%', maxWidth:500}}>
                        <h2 style={{marginBottom:25}}>{resultPercent >= 50 ? 'Отлично!' : 'Результат'}</h2>
                        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 30px auto' }}>
                            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="100" cy="100" r={circleRadius} fill="none" stroke="var(--glass-border)" strokeWidth="14" />
                                <motion.circle cx="100" cy="100" r={circleRadius} fill="none" stroke="#00f2fe" strokeWidth="14" strokeLinecap="round" strokeDasharray={circleCircumference} initial={{ strokeDashoffset: circleCircumference }} animate={{ strokeDashoffset: circleStrokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} />
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
