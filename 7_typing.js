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

    // ФУНКЦИЯ ОБРАЩЕНИЯ К PROXY-СЕРВЕРУ
    const fetchAIText = async () => {
        if (!topic.trim()) return alert("Введите тему!");
        
        setIsGenerating(true);
        resetGame(lang, " "); // Очищаем текст перед загрузкой

        const promptLang = lang === 'ru' ? 'русском' : 'английском';
        const prompt = `Сгенерируй один интересный абзац для тренажера слепой печати на тему: "${topic}". 
        Язык: ${promptLang}. 
        Объем текста: около 30-40 слов. 
        Условия: Используй заглавные буквы, запятые и точки. 
        СТРОГО ЗАПРЕЩЕНО использовать кавычки, дефисы, тире, скобки, цифры, двоеточия, эмодзи и любые другие спецсимволы. Только буквы, пробелы, запятые и точки. 
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
            
            console.log("📦 СЫРОЙ ОТВЕТ ОТ СЕРВЕРА:", data); 

            if (data.error) {
                throw new Error(data.error.message || "Неизвестная ошибка API");
            }

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Google не вернул текст (ответ пуст).");
            }

            let aiText = data.candidates[0].content.parts[0].text.trim();

            // Дополнительная зачистка текста
            aiText = aiText.replace(/[*#_"«»()\[\]\-—0-9]/g, '');
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
                currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isGenerating) return; 
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
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}
            style={{ 
                width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '20px', 
                padding: '40px', background: '#1c1e29', borderRadius: '24px', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', fontFamily: 'sans-serif'
            }}
        >
            {/* ШАПКА */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
                            Pro<span style={{ color: '#3b82f6' }}>Type</span>
                        </h2>
                        <div style={{ width: '80px', height: '20px', borderRadius: '10px', background: 'linear-gradient(90deg, #8b5cf6, #3b0764)' }}></div>
                    </div>
                    
                    <div style={{ display: 'flex', background: '#13141c', borderRadius: '12px', padding: '6px', border: '1px solid #2e303e', width: 'fit-content' }}>
                        <button 
                            onClick={() => setLang('en')}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: lang === 'en' ? '#334155' : 'transparent', color: lang === 'en' ? '#fff' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: '0.2s' }}
                        >English</button>
                        <button 
                            onClick={() => setLang('ru')}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: lang === 'ru' ? '#4b5563' : 'transparent', color: lang === 'ru' ? '#fff' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: '0.2s' }}
                        >Русский</button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#13141c', border: '1px solid #2e303e', borderRadius: '16px', padding: '15px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>Комбо</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>x{combo}</span>
                    </div>
                    <div style={{ background: '#13141c', border: '1px solid #2e303e', borderRadius: '16px', padding: '15px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>Точность</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: stats.accuracy < 90 ? "#f43f5e" : "#10b981" }}>{stats.accuracy}%</span>
                    </div>
                    <div style={{ background: '#13141c', border: '1px solid #2e303e', borderRadius: '16px', padding: '15px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px', marginBottom: '5px' }}>Скорость</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: "#0ea5e9" }}>{stats.wpm} WPM</span>
                    </div>
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ ТЕКСТА */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(109, 40, 217, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '15px 20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема для текста (напр. Пушкин)"
                    style={{ flex: 1, maxWidth: '250px', padding: '14px 20px', borderRadius: '10px', border: '1px solid #2e303e', outline: 'none', background: '#13141c', color: '#e2e8f0', fontSize: '15px' }}
                    disabled={isGenerating}
                />
                <button 
                    onClick={fetchAIText} 
                    disabled={isGenerating}
                    style={{ flex: 1, height: '50px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', cursor: isGenerating ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: isGenerating ? 0.7 : 1 }}
                >
                    {isGenerating ? "Генерация..." : "Сгенерировать текст"}
                </button>
            </div>

            {/* КОНТЕЙНЕР ТЕКСТА */}
            <div style={{ background: '#13141c', border: '1px solid #2e303e', borderRadius: '16px', padding: '40px', position: 'relative', minHeight: '220px' }}>
                {isGenerating ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                    >
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '40px', marginBottom: '15px' }}>⚙️</motion.div>
                        <div style={{ fontSize: '18px' }}>Пишем уникальный текст...</div>
                    </motion.div>
                ) : (
                    <>
                        <div ref={textContainerRef} style={{ fontSize: '26px', lineHeight: '2', fontFamily: "'Courier New', Courier, monospace", letterSpacing: '1.5px', color: '#64748b', fontWeight: '600', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {text.split('').map((char, index) => {
                                let color = '#64748b'; 
                                let borderBottom = '2px solid transparent';
                                
                                if (index < currentIndex) {
                                    color = '#94a3b8'; 
                                } else if (index === currentIndex) {
                                    color = '#0ea5e9'; 
                                    borderBottom = '3px solid #0ea5e9'; 
                                }
                                
                                return <span key={index} className={index === currentIndex ? 'current' : ''} style={{ color, borderBottom, paddingBottom: '2px', whiteSpace: 'pre-wrap' }}>{char}</span>;
                            })}
                        </div>
                    </>
                )}

                <AnimatePresence>
                    {currentIndex === text.length && text.length > 5 && !isGenerating && (
                        <motion.div 
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(19, 20, 28, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}
                        >
                            <h2 style={{ fontSize: '42px', margin: '0 0 10px 0', color: '#fff' }}>Отлично!</h2>
                            <p style={{ fontSize: '20px', color: '#94a3b8', margin: '0 0 30px 0' }}>
                                Скорость: <strong style={{color: "#0ea5e9"}}>{stats.wpm} WPM</strong> | 
                                Комбо: <strong style={{color: "#f59e0b"}}>x{maxCombo}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={() => fetchAIText()} style={{ padding: '12px 25px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Новый AI-текст</button>
                                <button onClick={() => resetGame(lang, generateLocalText(lang))} style={{ padding: '12px 25px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Обычный текст</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* КЛАВИАТУРА */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '20px', opacity: isGenerating ? 0.3 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
                {currentLayout.map((row, rIndex) => (
                    <div key={`${lang}-${rIndex}`} style={{ display: 'flex', gap: '8px' }}>
                        {row.map((key, kIndex) => {
                            const isSpace = key === " ";
                            const isTarget = key === expectedKey;
                            const isActive = key === pressedKey;
                            
                            let bg = '#2e303e';
                            let color = '#cbd5e1';
                            let border = '1px solid transparent';
                            
                            if (isTarget) {
                                border = '1px solid #0ea5e9';
                            }
                            if (isActive) {
                                bg = isErrorKey ? '#e11d48' : '#3b82f6';
                                color = '#fff';
                            }

                            return (
                                <div key={`${lang}-${key}-${kIndex}`} style={{ 
                                    background: bg, color: color, border: border,
                                    borderRadius: '8px', padding: '14px 0', 
                                    minWidth: isSpace ? '450px' : '45px', 
                                    textAlign: 'center', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {isSpace ? "" : key}
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
