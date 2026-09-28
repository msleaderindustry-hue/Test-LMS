const { useState, useEffect, useRef, useCallback } = React;
const { motion } = window.Motion; // Убрали AnimatePresence за ненадобностью
const { Button } = window;

// Резервная база 
const fallbackTextsData = {
    en: [
        "The universe is an unimaginably vast place, constantly expanding at an accelerating rate. Scientists believe that galaxies are moving further apart every second, driven by a mysterious force known as dark energy. Even with our most advanced telescopes, we have only mapped a tiny fraction of the observable cosmos.",
        "Artificial intelligence has rapidly evolved from simple rule-based algorithms to complex neural networks capable of learning. Today, machine learning models can recognize images, translate languages in real time, and even generate creative artwork, fundamentally changing the way we interact with modern technology."
    ],
    ru: [
        "Космос представляет собой невероятно огромное и таинственное пространство, которое постоянно расширяется с ускорением. Ученые предполагают, что галактики отдаляются друг от друга каждую секунду под воздействием загадочной темной энергии. Даже с помощью самых мощных телескопов мы смогли изучить лишь ничтожно малую часть наблюдаемой Вселенной.",
        "Искусственный интеллект прошел долгий путь развития от простых алгоритмов до сложнейших нейронных сетей, способных к глубокому обучению. Сегодня современные модели могут распознавать изображения, переводить тексты в реальном времени и даже создавать произведения искусства, меняя наш привычный мир."
    ]
};

const layouts = {
    en: [
        ["1","2","3","4","5","6","7","8","9","0","-","="],
        ["Tab", "q","w","e","r","t","y","u","i","o","p", "[", "]"],
        ["Caps", "a","s","d","f","g","h","j","k","l", ";", "'", "Enter"],
        ["ShiftLeft", "z","x","c","v","b","n","m", ",", ".", "/", "ShiftRight"],
        [" "]
    ],
    ru: [
        ["1","2","3","4","5","6","7","8","9","0","-","="],
        ["Tab", "й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
        ["Caps", "ф","ы","в","а","п","р","о","л","д","ж","э", "Enter"],
        ["ShiftLeft", "я","ч","с","м","и","т","ь","б","ю", ".", "ShiftRight"],
        [" "]
    ]
};

const shiftMap = {
    en: { '1':'!', '2':'@', '3':'#', '4':'$', '5':'%', '6':'^', '7':'&', '8':'*', '9':'(', '0':')', '-':'_', '=':'+', '[':'{', ']':'}', ';':':', '\'':'"', ',':'<', '.':'>', '/':'?' },
    ru: { '1':'!', '2':'"', '3':'№', '4':';', '5':'%', '6':':', '7':'?', '8':'*', '9':'(', '0':')', '-':'_', '=':'+', '.':',' }
};

const TypingTest = ({ onBack }) => {
    const [lang, setLang] = useState('en');
    const [text, setText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    
    const [pressedKeys, setPressedKeys] = useState({});
    const [isErrorKey, setIsErrorKey] = useState(false);
    const [shake, setShake] = useState(false);

    const [topic, setTopic] = useState("Искусственный интеллект");
    const [isGenerating, setIsGenerating] = useState(false);

    const textContainerRef = useRef(null);

    const generateLocalText = useCallback((currentLang) => {
        const list = fallbackTextsData[currentLang];
        return list[Math.floor(Math.random() * list.length)] + " ";
    }, []);

    useEffect(() => {
        resetGame(lang, generateLocalText(lang));
    }, [lang, generateLocalText]);

    const resetGame = (currentLang = lang, newText = null) => {
        if (newText) setText(newText);
        setCurrentIndex(0);
        setErrors(0);
        setCombo(0);
        setMaxCombo(0);
        setStartTime(null);
        setEndTime(null);
        setPressedKeys({});
    };

    const fetchAIText = async () => {
        if (!topic.trim()) return alert("Введите тему!");

        setIsGenerating(true);
        resetGame(lang, " "); 

        const promptLang = lang === 'ru' ? 'русском' : 'английском';
        const prompt = `Сгенерируй один интересный абзац для тренажера слепой печати на тему: "${topic}". 
        Язык: ${promptLang}. 
        Объем текста: около 70-80 слов. 
        Условия: Используй базовую пунктуацию: запятые, точки, вопросительные и восклицательные знаки, двоеточия. 
        СТРОГО ЗАПРЕЩЕНО использовать длинные тире, кавычки-елочки, квадратные скобки, цифры, эмодзи и нечитаемые спецсимволы. 
        Сразу выведи только текст, без приветствий и пояснений.`;

        try {
            console.log("🚀 Отправляем запрос на Cloudflare...");
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "Неизвестная ошибка API");
            if (!data.candidates || data.candidates.length === 0) throw new Error("Google не вернул текст (ответ пуст).");

            let aiText = data.candidates[0].content.parts[0].text.trim();
            aiText = aiText.replace(/[*#_«»\[\]—0-9]/g, ''); 
            aiText = aiText.replace(/\s+/g, ' '); 

            resetGame(lang, aiText + " ");
        } catch (error) {
            console.error("❌ ПРИЧИНА ОШИБКИ:", error.message);
            alert("Ошибка генерации: " + error.message);
            resetGame(lang, generateLocalText(lang));
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (textContainerRef.current) {
            const currentElement = textContainerRef.current.querySelector('.current');
            if (currentElement) {
                currentElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const keyCode = e.code;
            const visualKey = e.key.toLowerCase();
            setPressedKeys(prev => ({ ...prev, [keyCode]: true, [visualKey]: true }));

            if (isGenerating) return; 
            if (["Shift", "Control", "Alt", "Meta", "Backspace", "CapsLock", "Tab", "Enter"].includes(e.key)) return;
            if (e.key === " ") e.preventDefault();
            if (currentIndex >= text.length) return;

            if (!startTime) setStartTime(Date.now());

            const actualKey = e.key; 
            const expectedChar = text[currentIndex];

            if (actualKey === expectedChar) {
                setIsErrorKey(false);
                const newCombo = combo + 1;
                setCombo(newCombo);
                if (newCombo > maxCombo) setMaxCombo(newCombo);

                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                if (nextIndex === text.length) {
                    setEndTime(Date.now());
                    
                    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
                    const wordsTyped = text.length / 5;
                    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
                    
                    try {
                        const uid = window.auth?.currentUser?.uid;
                        if (uid && window.db) {
                            window.db.collection('users').doc(uid).get().then(doc => {
                                const data = doc.data() || {};
                                const existing = data.typingProgress || { maxWpm: 0, maxCombo: 0, testsCompleted: 0 };
                                window.db.collection('users').doc(uid).set({
                                    typingProgress: {
                                        maxWpm: Math.max(existing.maxWpm, wpm),
                                        maxCombo: Math.max(existing.maxCombo, newCombo > maxCombo ? newCombo : maxCombo),
                                        testsCompleted: existing.testsCompleted + 1
                                    }
                                }, { merge: true });
                            });
                        }
                    } catch(e) { console.error(e); }
                }
            } else {
                setIsErrorKey(true);
                setErrors(prev => prev + 1);
                setCombo(0); 
                setShake(true);
                setTimeout(() => setShake(false), 300);
            }

            setTimeout(() => { setIsErrorKey(false); }, 150);
        };

        const handleKeyUp = (e) => {
            const keyCode = e.code;
            const visualKey = e.key.toLowerCase();
            setPressedKeys(prev => {
                const next = { ...prev };
                delete next[keyCode];
                delete next[visualKey];
                return next;
            });
        };

        // Защита от залипания клавиш при потере фокуса окна
        const handleBlur = () => setPressedKeys({});

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, [currentIndex, text, startTime, combo, maxCombo, isGenerating]);

    const calculateStats = () => {
        if (currentIndex === 0) return { wpm: 0, accuracy: 100 };
        const timeElapsed = endTime ? (endTime - startTime) / 1000 / 60 : (Date.now() - startTime) / 1000 / 60;
        const wordsTyped = currentIndex / 5;
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const totalAttempts = currentIndex + errors;
        const accuracy = totalAttempts > 0 ? Math.round((currentIndex / totalAttempts) * 100) : 100;
        return { wpm, accuracy };
    };

    const stats = calculateStats();
    const currentLayout = layouts[lang];
    const progress = (currentIndex / text.length) * 100;
    const isShiftActive = pressedKeys["ShiftLeft"] || pressedKeys["ShiftRight"];

    const expectedChar = text[currentIndex];
    let expectedKeyLower = expectedChar?.toLowerCase();
    
    let isShiftSymbol = false;
    if (shiftMap[lang]) {
        for (const [base, shifted] of Object.entries(shiftMap[lang])) {
            if (shifted === expectedChar) {
                expectedKeyLower = base;
                isShiftSymbol = true;
                break;
            }
        }
    }

    const isUpperCase = expectedChar && expectedChar !== expectedChar.toLowerCase() && /[a-zа-я]/i.test(expectedChar);
    
    let targetShift = null;
    if (isUpperCase || isShiftSymbol) {
        targetShift = "ShiftLeft";
    }

    return (
        <motion.div 
            className="glass-panel" 
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px' }}
        >
            {/* ШАПКА */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                            Pro<span style={{ color: '#3b82f6' }}>Type</span>
                        </h2>
                        <span style={{
                            fontSize: '11px', 
                            fontWeight: '900', 
                            background: 'linear-gradient(90deg, #a855f7, #6d28d9)', 
                            color: '#ffffff', 
                            padding: '6px 12px', 
                            borderRadius: '12px', 
                            letterSpacing: '1px',
                            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                            textTransform: 'uppercase'
                        }}>
                            AI POWERED
                        </span>
                    </div>

                    <div style={{ display: 'flex', background: 'var(--bg-body)', borderRadius: '12px', padding: '6px', border: '1px solid var(--glass-border)', width: 'fit-content' }}>
                        <button 
                            onClick={() => setLang('en')}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: lang === 'en' ? 'var(--bg-panel)' : 'transparent', color: lang === 'en' ? 'var(--text-main)' : 'var(--text-sec)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: '0.2s', boxShadow: lang === 'en' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}
                        >English</button>
                        <button 
                            onClick={() => setLang('ru')}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: lang === 'ru' ? 'var(--bg-panel)' : 'transparent', color: lang === 'ru' ? 'var(--text-main)' : 'var(--text-sec)', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: '0.2s', boxShadow: lang === 'ru' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}
                        >Русский</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '15px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px', flex: 1 }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sec)', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>Комбо</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>x{combo}</span>
                    </div>
                    <div style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '15px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px', flex: 1 }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sec)', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>Точность</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: stats.accuracy < 90 ? "#f43f5e" : "#10b981" }}>{stats.accuracy}%</span>
                    </div>
                    <div style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '15px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px', flex: 1 }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sec)', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>Скорость</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: "#0ea5e9" }}>{stats.wpm} WPM</span>
                    </div>
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ ТЕКСТА */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '15px', 
                alignItems: 'center', 
                background: 'rgba(139, 92, 246, 0.05)', 
                border: '1px solid rgba(139, 92, 246, 0.3)', 
                padding: '12px 16px', 
                borderRadius: '16px' 
            }}>
                <motion.svg 
                    width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ flexShrink: 0 }}
                >
                    <defs>
                        <linearGradient id="magic-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#a855f7" />
                            <stop offset="1" stopColor="#6366f1" />
                        </linearGradient>
                    </defs>
                    <path d="M10.828 2.068c.28-.758 1.353-.758 1.633 0l1.921 5.204c.15.405.474.729.88.88l5.204 1.921c.758.28.758 1.353 0 1.633l-5.204 1.921a1.99 1.99 0 00-.88.88l-1.921 5.204c-.28.758-1.353.758-1.633 0l-1.921-5.204a1.99 1.99 0 00-.88-.88l-5.204-1.921c-.758-.28-.758-1.353 0-1.633l5.204-1.921a1.99 1.99 0 00.88-.88l1.921-5.204z" fill="url(#magic-gradient)"/>
                    <path d="M20 20l-1.5-1.5m1.5 0l-1.5 1.5m1.5-1.5h-2.5m2.5 0v2.5" stroke="url(#magic-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
                </motion.svg>

                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема для текста"
                    style={{ 
                        flex: '1 1 auto', 
                        minWidth: '200px', 
                        padding: '14px 20px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--glass-border)', 
                        outline: 'none', 
                        background: 'var(--bg-body)', 
                        color: 'var(--text-main)', 
                        fontSize: '16px' 
                    }}
                    disabled={isGenerating}
                />

                <button 
                    onClick={fetchAIText} 
                    disabled={isGenerating}
                    style={{ 
                        whiteSpace: 'nowrap',
                        padding: '0 30px', 
                        height: '50px', 
                        background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontWeight: '800', 
                        fontSize: '14px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px', 
                        cursor: isGenerating ? 'not-allowed' : 'pointer', 
                        transition: 'opacity 0.2s', 
                        opacity: isGenerating ? 0.7 : 1,
                        boxShadow: '0 4px 15px rgba(109, 40, 217, 0.3)',
                        flexGrow: window.innerWidth < 600 ? 1 : 0
                    }}
                >
                    {isGenerating ? "Генерация..." : "Сгенерировать текст"}
                </button>
            </div>

            {/* КОНТЕЙНЕР ТЕКСТА */}
            <div style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '40px', position: 'relative', minHeight: '220px' }}>
                {isGenerating ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)' }}
                    >
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '40px', marginBottom: '15px' }}>⚙️</motion.div>
                        <div style={{ fontSize: '18px' }}>Пишем уникальный текст...</div>
                    </motion.div>
                ) : (
                    <>
                        <div className="text-display" ref={textContainerRef} style={{ 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word', 
                            display: 'block', 
                            lineHeight: '1.6',
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            paddingRight: '10px'
                        }}>
                            {text.split('').map((char, index) => {
                                let statusClass = "";
                                if (index < currentIndex) statusClass = "correct";
                                else if (index === currentIndex) statusClass = "current";

                                return <span key={index} className={`char ${statusClass}`} style={{ whiteSpace: 'pre-wrap' }}>{char}</span>;
                            })}
                        </div>
                        <div className="progress-bar-container" style={{marginTop: '20px'}}>
                            <div className="progress-bar" style={{ width: `${progress || 0}%`, background: 'linear-gradient(90deg, #8e2de2, #4a00e0)' }}></div>
                        </div>
                    </>
                )}

                {currentIndex === text.length && text.length > 5 && !isGenerating && (
                    <motion.div 
                        className="overlay"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', zIndex: 10 }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                            <h2 style={{ fontSize: '48px', marginBottom: '10px', color: 'var(--text-main)' }}>Отличный результат!</h2>
                            <p style={{ fontSize: '20px', color: 'var(--text-sec)', marginBottom: '30px' }}>
                                Скорость: <strong style={{color: "#0ea5e9"}}>{stats.wpm} WPM</strong> | 
                                Макс. комбо: <strong style={{color: "#f59e0b"}}>x{maxCombo}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <Button variant="primary" onClick={() => fetchAIText()} style={{ width: '200px' }}>Новый AI-текст</Button>
                                <Button variant="muted" onClick={() => resetGame(lang, generateLocalText(lang))} style={{ width: '200px' }}>Обычный текст</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* КЛАВИАТУРА */}
            <div className="keyboard" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', flexShrink: 0, opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
                {currentLayout.map((row, rIndex) => (
                    <div key={`${lang}-${rIndex}`} className="key-row">
                        {row.map((keyId, kIndex) => {
                            const isSpace = keyId === " ";
                            const isTab = keyId === "Tab";
                            const isCaps = keyId === "Caps";
                            const isEnter = keyId === "Enter";
                            const isShiftLeft = keyId === "ShiftLeft";
                            const isShiftRight = keyId === "ShiftRight";
                            const isSpecial = isTab || isCaps || isEnter || isShiftLeft || isShiftRight;

                            // ЛОГИКА СИМВОЛОВ И РЕГИСТРА
                            let displayKey = keyId;
                            if (isSpace) displayKey = "SPACE";
                            else if (isShiftLeft || isShiftRight) displayKey = "Shift";
                            else if (isTab) displayKey = "TAB";
                            else if (isCaps) displayKey = "CAPS";
                            else if (isEnter) displayKey = "ENTER";
                            else {
                                if (isShiftActive) {
                                    if (shiftMap[lang] && shiftMap[lang][keyId]) {
                                        displayKey = shiftMap[lang][keyId];
                                    } else if (/[a-zа-я]/i.test(keyId)) {
                                        displayKey = keyId.toUpperCase();
                                    } else {
                                        displayKey = keyId;
                                    }
                                } else {
                                    displayKey = keyId.toLowerCase();
                                }
                            }

                            let isTarget = false;
                            if (!isSpecial && keyId === expectedKeyLower) isTarget = true;
                            if (isShiftLeft && targetShift === "ShiftLeft") isTarget = true;
                            if (isShiftRight && targetShift === "ShiftRight") isTarget = true;

                            let isActive = false;
                            if (isSpecial) {
                                if (keyId === "ShiftLeft" && pressedKeys["ShiftLeft"]) isActive = true;
                                if (keyId === "ShiftRight" && pressedKeys["ShiftRight"]) isActive = true;
                                if (keyId === "Tab" && pressedKeys["Tab"]) isActive = true;
                                if (keyId === "Enter" && pressedKeys["Enter"]) isActive = true;
                                if (keyId === "Caps" && pressedKeys["CapsLock"]) isActive = true;
                            } else {
                                if (pressedKeys[keyId]) isActive = true;
                                const shiftedChar = shiftMap[lang] && shiftMap[lang][keyId];
                                if (shiftedChar && pressedKeys[shiftedChar.toLowerCase()]) isActive = true;
                            }

                            let classNames = "key";
                            if (isSpace) classNames += " space";
                            if (isSpecial) classNames += " special";
                            if (isTarget) classNames += " target";
                            if (isActive) {
                                if (!isSpecial && !isTarget && pressedKeys[keyId] && isErrorKey) {
                                    classNames += " error-active";
                                } else {
                                    classNames += " active";
                                }
                            }

                            return (
                                <div 
                                    key={`${lang}-${keyId}-${kIndex}`} 
                                    className={classNames}
                                    style={{
                                        minWidth: isSpace ? '400px' : (isSpecial ? '75px' : '45px'),
                                        flexGrow: isSpecial ? 1 : 0,
                                        textTransform: 'none', // Убрали принудительный uppercase!
                                        padding: isSpecial ? '0 15px' : '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {/* БЕЗОПАСНАЯ АНИМАЦИЯ: просто пружинит при изменении символа */}
                                    <motion.span
                                        key={displayKey}
                                        initial={{ opacity: 0.5, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        {displayKey}
                                    </motion.span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

Object.assign(window, { TypingTest });
