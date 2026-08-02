const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Резервная база на случай, если API недоступно или нет интернета
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
        ["q","w","e","r","t","y","u","i","o","p", "[", "]"],
        ["a","s","d","f","g","h","j","k","l", ";", "'"],
        ["z","x","c","v","b","n","m", ",", ".", "/"],
        [" "]
    ],
    ru: [
        ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
        ["ф","ы","в","а","п","р","о","л","д","ж","э"],
        ["я","ч","с","м","и","т","ь","б","ю", "."],
        [" "]
    ]
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
    const [pressedKey, setPressedKey] = useState(null);
    const [isErrorKey, setIsErrorKey] = useState(false);
    const [shake, setShake] = useState(false);

    // AI Состояния
    const [topic, setTopic] = useState("Искусственный интеллект");
    const [isGenerating, setIsGenerating] = useState(false);

    const textContainerRef = useRef(null);

    const generateLocalText = useCallback((currentLang) => {
        const list = fallbackTextsData[currentLang];
        return list[Math.floor(Math.random() * list.length)] + " ";
    }, []);

    // При первой загрузке или смене языка грузим локальный текст
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
        setPressedKey(null);
    };

    // ФУНКЦИЯ ОБРАЩЕНИЯ К ТВОЕМУ PROXY-SERVER (CLOUDFLARE WORKER)
    const fetchAIText = async () => {
        if (!topic.trim()) return alert("Введите тему!");
        
        setIsGenerating(true);
        resetGame(lang, " "); // Очищаем текст перед загрузкой

        // Специальный промпт для Gemini, исключающий спецсимволы
        const promptLang = lang === 'ru' ? 'русском' : 'английском';
        const prompt = `Сгенерируй один интересный абзац для тренажера слепой печати на тему: "${topic}". 
        Язык: ${promptLang}. 
        Объем текста: около 30-40 слов. 
        Условия: Используй заглавные буквы, запятые и точки. 
        СТРОГО ЗАПРЕЩЕНО использовать кавычки, дефисы, тире, скобки, цифры, двоеточия, эмодзи и любые другие спецсимволы. Только буквы, пробелы, запятые и точки. 
        Сразу выведи только текст, без приветствий и пояснений.`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) throw new Error("Ошибка сервера прокси");

            const data = await response.json();
            let aiText = data.candidates[0].content.parts[0].text.trim();

            // Дополнительная зачистка текста (на всякий случай, если ИИ проигнорирует запрет)
            aiText = aiText.replace(/[*#_"«»()\[\]\-—0-9]/g, '');
            aiText = aiText.replace(/\s+/g, ' '); // Убираем двойные пробелы

            resetGame(lang, aiText + " ");
        } catch (error) {
            console.error("Gemini API Error:", error);
            alert("Не удалось сгенерировать текст (возможно, прокси спит). Загружен резервный текст.");
            resetGame(lang, generateLocalText(lang));
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (textContainerRef.current) {
            const currentElement = textContainerRef.current.querySelector('.current');
            if (currentElement) {
                currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isGenerating) return; // Блокируем ввод во время загрузки
            if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "Backspace" || e.key === "CapsLock") return;
            if (e.key === " ") e.preventDefault();
            if (currentIndex >= text.length) return;

            const actualKey = e.key; 
            const visualKey = e.key.toLowerCase(); 
            
            setPressedKey(visualKey);
            
            if (!startTime) setStartTime(Date.now());

            const expectedChar = text[currentIndex];

            if (actualKey === expectedChar) {
                setIsErrorKey(false);
                const newCombo = combo + 1;
                setCombo(newCombo);
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                if (nextIndex === text.length) setEndTime(Date.now());
            } else {
                setIsErrorKey(true);
                setErrors(prev => prev + 1);
                setCombo(0); 
                setShake(true);
                setTimeout(() => setShake(false), 300);
            }
            
            setTimeout(() => { setPressedKey(null); setIsErrorKey(false); }, 150);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
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
    const expectedKey = text[currentIndex]?.toLowerCase(); 
    const currentLayout = layouts[lang];
    const progress = (currentIndex / text.length) * 100;

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px' }}
        >
            <header className="type-header">
                <div className="title-group">
                    <div className="type-title" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        Pro<span>Type</span>
                        <span style={{fontSize: '12px', background: 'linear-gradient(90deg, #8e2de2, #4a00e0)', color: 'white', padding: '4px 8px', borderRadius: '8px', letterSpacing: '1px'}}>AI POWERED</span>
                    </div>
                    <div className="lang-switch">
                        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>English</button>
                        <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>Русский</button>
                    </div>
                </div>
                
                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">Комбо</span>
                        <span className={`stat-value ${combo > 10 ? 'combo-glow' : ''}`}>x{combo}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Точность</span>
                        <span className="stat-value" style={{color: stats.accuracy < 90 ? "#f43f5e" : "#10b981"}}>{stats.accuracy}%</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Скорость</span>
                        <span className="stat-value" style={{color: "#0ea5e9"}}>{stats.wpm} WPM</span>
                    </div>
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ ТЕКСТА */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(142, 45, 226, 0.05)', border: '1px solid rgba(142, 45, 226, 0.2)', padding: '15px 20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="На какую тему сгенерировать текст? (Например: Космос)"
                    style={{ flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '16px' }}
                    disabled={isGenerating}
                />
                <Button 
                    onClick={fetchAIText} 
                    disabled={isGenerating}
                    style={{ minWidth: '180px', height: '46px', background: 'linear-gradient(90deg, #8e2de2, #4a00e0)', color: 'white', border: 'none' }}
                >
                    {isGenerating ? "⏳ Нейросеть думает..." : "Сгенерировать текст"}
                </Button>
            </div>

            <div className="text-container">
                {isGenerating ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)' }}
                    >
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '40px', marginBottom: '15px' }}>
                            ⚙️
                        </motion.div>
                        <div style={{ fontSize: '18px' }}>Пишем уникальный текст...</div>
                    </motion.div>
                ) : (
                    <>
                        <div className="text-display" ref={textContainerRef}>
                            {text.split('').map((char, index) => {
                                let statusClass = "";
                                if (index < currentIndex) statusClass = "correct";
                                else if (index === currentIndex) statusClass = "current";
                                
                                return <span key={index} className={`char ${statusClass}`}>{char}</span>;
                            })}
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress || 0}%`, background: 'linear-gradient(90deg, #8e2de2, #4a00e0)' }}></div>
                        </div>
                    </>
                )}

                <AnimatePresence>
                    {currentIndex === text.length && text.length > 5 && !isGenerating && (
                        <motion.div 
                            className="overlay"
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                                <h2 style={{ fontSize: '48px', marginBottom: '10px', color: '#fff' }}>Отличный результат!</h2>
                                <p style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '30px' }}>
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
                </AnimatePresence>
            </div>

            <div className="keyboard" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', flexShrink: 0, opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
                {currentLayout.map((row, rIndex) => (
                    <div key={`${lang}-${rIndex}`} className="key-row">
                        {row.map((key, kIndex) => {
                            const isSpace = key === " ";
                            const isTarget = key === expectedKey;
                            const isActive = key === pressedKey;
                            
                            let classNames = "key";
                            if (isSpace) classNames += " space";
                            if (isTarget) classNames += " target";
                            if (isActive) classNames += isErrorKey ? " error-active" : " active";

                            return (
                                <div key={`${lang}-${key}-${kIndex}`} className={classNames}>
                                    {isSpace ? "SPACE" : key}
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
