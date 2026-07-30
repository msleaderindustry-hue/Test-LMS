const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// База интересных осмысленных текстов вместо набора случайных слов
const textsData = {
    en: [
        "The universe is constantly expanding, and galaxies are moving further apart every second.",
        "Octopuses have three hearts and blue blood, and their intelligence amazes scientists.",
        "A day on Venus is longer than its year because it rotates so slowly on its axis.",
        "Water can boil and freeze at the same time under specific conditions known as the triple point.",
        "Natural honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs.",
        "The human brain operates on about twenty watts of power, enough to light a dim bulb.",
        "Bananas are curved because they grow towards the sun, a process called negative geotropism.",
        "There are more trees on planet Earth than there are stars in the Milky Way galaxy.",
        "The Eiffel Tower can be fifteen centimeters taller during the summer due to thermal expansion.",
        "A single strand of spider silk is incredibly thin but stronger than a thread of steel."
    ],
    ru: [
        "Космос невероятно огромен и постоянно расширяется, скрывая в себе миллиарды неизученных галактик.",
        "Осьминоги имеют три сердца и голубую кровь, а их интеллект поражает воображение биологов.",
        "День на Венере длится дольше, чем ее год, потому что она вращается вокруг оси невероятно медленно.",
        "Вода может кипеть и замерзать одновременно при определенных условиях, известных как тройная точка.",
        "Натуральный мед никогда не портится. Археологи находили в гробницах мед, которому более трех тысяч лет.",
        "Человеческий мозг генерирует достаточно энергии, чтобы зажечь небольшую светодиодную лампочку.",
        "Бананы имеют изогнутую форму, потому что в процессе роста они тянутся вверх к солнечному свету.",
        "На планете Земля растет больше деревьев, чем существует звезд в нашей галактике Млечный Путь.",
        "Летом Эйфелева башня может становиться на пятнадцать сантиметров выше из-за теплового расширения металла.",
        "Паутина невероятно тонкая, но при этом она прочнее стальной нити такой же толщины."
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

    const textContainerRef = useRef(null);

    // Генерируем текст, объединяя два случайных предложения
    const generateText = useCallback((currentLang) => {
        const list = textsData[currentLang];
        const fact1 = list[Math.floor(Math.random() * list.length)];
        let fact2 = list[Math.floor(Math.random() * list.length)];
        
        // Гарантируем, что второе предложение не будет повторять первое
        while (fact1 === fact2) {
            fact2 = list[Math.floor(Math.random() * list.length)];
        }
        
        return fact1 + " " + fact2;
    }, []);

    useEffect(() => {
        resetGame(lang);
    }, [lang, generateText]);

    const resetGame = (currentLang = lang) => {
        setText(generateText(currentLang));
        setCurrentIndex(0);
        setErrors(0);
        setCombo(0);
        setMaxCombo(0);
        setStartTime(null);
        setEndTime(null);
        setPressedKey(null);
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
    }, [currentIndex, text, startTime, combo, maxCombo]);

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
                    <div className="type-title">Pro<span>Type</span></div>
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

            <div className="text-container">
                <div className="text-display" ref={textContainerRef}>
                    {text.split('').map((char, index) => {
                        let statusClass = "";
                        if (index < currentIndex) statusClass = "correct";
                        else if (index === currentIndex) statusClass = "current";
                        
                        return <span key={index} className={`char ${statusClass}`}>{char}</span>;
                    })}
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress || 0}%` }}></div>
                </div>

                <AnimatePresence>
                    {currentIndex === text.length && text.length > 0 && (
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
                                <Button variant="primary" onClick={() => resetGame()} style={{ width: '250px', margin: '0 auto' }}>Новый раунд</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="keyboard" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
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
