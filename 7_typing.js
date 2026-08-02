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

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБРАЩЕНИЯ К PROXY-СЕРВЕРУ
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
            
            // ВЫВОДИМ ОТВЕТ В КОНСОЛЬ. Если текст не генерируется, смотри сюда!
            console.log("📦 СЫРОЙ ОТВЕТ ОТ СЕРВЕРА:", data); 

            // Защита: проверяем, не прислал ли Google явную ошибку
            if (data.error) {
                throw new Error(data.error.message || "Неизвестная ошибка API");
            }

            // Защита: проверяем, есть ли вообще массив candidates
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Google не вернул текст (ответ пуст).");
            }

            // Если всё хорошо, смело читаем текст
            let aiText = data.candidates[0].content.parts[0].text.trim();

            // Дополнительная зачистка текста (на всякий случай)
            aiText = aiText.replace(/[*#_"«»()\[\]\-—0-9]/g, '');
            aiText = aiText.replace(/\s+/g, ' '); // Убираем двойные пробелы

            resetGame(lang, aiText + " ");
            
        } catch (error) {
            // Теперь ошибка не уронит весь сайт, а красиво выведется сюда:
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
                        {/* ИСПРАВЛЕННЫЙ ЗНАЧОК AI POWERED: ярче, контрастнее */}
                        <span style={{
                            fontSize: '11px', 
                            fontWeight: '900', 
                            background: 'linear-gradient(90deg, #a855f7, #6d28d9)', 
                            color: '#ffffff', 
                            padding: '6px 12px', 
                            borderRadius: '12px', 
                            letterSpacing: '1px',
                            boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
                            textTransform: 'uppercase'
                        }}>
                            AI POWERED
                        </span>
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

            {/* ИСПРАВЛЕННАЯ AI ПАНЕЛЬ ГЕНЕРАЦИИ ТЕКСТА */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '15px', 
                alignItems: 'center', 
                background: 'rgba(30, 30, 46, 0.4)', 
                border: '1px solid rgba(139, 92, 246, 0.2)', 
                padding: '12px 16px', 
                borderRadius: '16px' 
            }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                
                {/* Исправленное поле ввода: flex: '1 1 auto' и убран maxWidth */}
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема для текста (напр. Пушкин)"
                    style={{ 
                        flex: '1 1 auto', 
                        minWidth: '200px', 
                        padding: '14px 20px', 
                        borderRadius: '12px', 
                        border: '1px solid #2e303e', 
                        outline: 'none', 
                        background: '#13141c', 
                        color: '#fff', 
                        fontSize: '16px' 
                    }}
                    disabled={isGenerating}
                />
                
                {/* Исправленная кнопка: занимает размер по тексту (whiteSpace: 'nowrap') */}
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
                        boxShadow: '0 4px 15px rgba(109, 40, 217, 0.3)'
                    }}
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
                        <div className="text-display" ref={textContainerRef} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block', lineHeight: '1.6' }}>
                            {text.split('').map((char, index) => {
                                let statusClass = "";
                                if (index < currentIndex) statusClass = "correct";
                                else if (index === currentIndex) statusClass = "current";
                                
                                return <span key={index} className={`char ${statusClass}`} style={{ whiteSpace: 'pre-wrap' }}>{char}</span>;
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

            {/* КЛАВИАТУРА */}
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
