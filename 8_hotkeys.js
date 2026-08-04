const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

// Обновленная смешанная база (Word, Система, Браузер) + ТРОЙНЫЕ КОМБИНАЦИИ С SHIFT
const HOTKEYS_DB = [
    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---
    { desc: "Копия", key: "c", shift: false, visual: "Ctrl + C" },
    { desc: "Вставить", key: "v", shift: false, visual: "Ctrl + V" },
    { desc: "Вырезать текст", key: "x", shift: false, visual: "Ctrl + X" },
    { desc: "Отменить последнее действие", key: "z", shift: false, visual: "Ctrl + Z" },
    { desc: "Вернуть действие (Redo) / Перейти к истории", key: "y", shift: false, visual: "Ctrl + Y" },
    { desc: "Выделить весь текст", key: "a", shift: false, visual: "Ctrl + A" },
    { desc: "Сохранить", key: "s", shift: false, visual: "Ctrl + S" },
    { desc: "Открыть принтер", key: "p", shift: false, visual: "Ctrl + P" },
    { desc: "Найти", key: "f", shift: false, visual: "Ctrl + F" },
    { desc: "Открыть файл", key: "o", shift: false, visual: "Ctrl + O" },
    { desc: "Создать новый файл или окно", key: "n", shift: false, visual: "Ctrl + N" },

    // --- ФОРМАТИРОВАНИЕ И РАБОТА В WORD ---
    { desc: "Курсив", key: "i", shift: false, visual: "Ctrl + I" },
    { desc: "Жирный текст", key: "b", shift: false, visual: "Ctrl + B" },
    { desc: "Линия под текстом", key: "u", shift: false, visual: "Ctrl + U" },
    { desc: "Поправить текст по левому краю", key: "l", shift: false, visual: "Ctrl + L" },
    { desc: "Поправить текст по центру", key: "e", shift: false, visual: "Ctrl + E" },
    { desc: "Поправить текст по правому краю", key: "r", shift: false, visual: "Ctrl + R" },
    { desc: "Найти и заменить", key: "h", shift: false, visual: "Ctrl + H" },
    { desc: "Вставить гиперссылку", key: "k", shift: false, visual: "Ctrl + K" },
    { desc: "Выйти из документа", key: "w", shift: false, visual: "Ctrl + W" },

    // --- ТРОЙНЫЕ КОМБИНАЦИИ С SHIFT (ИЗ ТЕТРАДИ) ---
    { desc: "Двойное подчёркивание", key: "d", shift: true, visual: "Ctrl + Shift + D" },
    { desc: "Все прописные (заглавные)", key: "a", shift: true, visual: "Ctrl + Shift + A" },
    { desc: "Подчёркивание только слов", key: "w", shift: true, visual: "Ctrl + Shift + W" },
    { desc: "Увеличить размер шрифта", key: ">", shift: true, visual: "Ctrl + Shift + >" },
    { desc: "Уменьшить размер шрифта", key: "<", shift: true, visual: "Ctrl + Shift + <" },

    // --- НАВИГАЦИЯ В БРАУЗЕРЕ И ДРУГОЕ ---
    { desc: "Открыть новую вкладку", key: "t", shift: false, visual: "Ctrl + T" },
    { desc: "Обновить страницу", key: "r", shift: false, visual: "Ctrl + R" },
    { desc: "Открыть список загрузок", key: "j", shift: false, visual: "Ctrl + J" },
    { desc: "Добавить страницу в закладки", key: "d", shift: false, visual: "Ctrl + D" }
];

const HotkeyTrainer = ({ onBack }) => {
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    
    // Состояния игры и ИИ
    const [gameStarted, setGameStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const [topic, setTopic] = useState("Microsoft Word");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
            } else {
                setIsFullscreen(true);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Обновленный промпт: ИИ теперь знает про Shift
    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert("Введите название программы!");
        setIsGenerating(true);

        const prompt = `Сгенерируй 10 самых полезных горячих клавиш (комбинаций с Ctrl или Cmd) для программы: "${topic}". 
        Некоторые из них могут (и должны, если это популярно) включать клавишу Shift.
        Верни ТОЛЬКО чистый валидный JSON массив объектов, без форматирования markdown, без пояснений. 
        Формат строго такой:
        [
          {"desc": "Скопировать", "key": "c", "shift": false, "visual": "Ctrl + C"},
          {"desc": "Сохранить как", "key": "s", "shift": true, "visual": "Ctrl + Shift + S"}
        ]
        ВАЖНО: поле 'key' должно содержать только один символ (ту клавишу, которую надо нажать вместе с Ctrl и/или Shift). Учитывай регистр для символов.`;

        try {
            console.log("🚀 Запрашиваем хоткеи у ИИ...");
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "Ошибка API");
            if (!data.candidates || data.candidates.length === 0) throw new Error("Пустой ответ от ИИ");

            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("ИИ не вернул JSON массив");

            const parsedHotkeys = JSON.parse(jsonMatch[0]);
            
            if (Array.isArray(parsedHotkeys) && parsedHotkeys.length > 0) {
                setActiveHotkeys(parsedHotkeys);
            } else {
                throw new Error("Неверный формат данных");
            }
        } catch (error) {
            console.error("❌ Ошибка:", error);
            alert("Не удалось сгенерировать. Попробуй переформулировать запрос.");
            setActiveHotkeys(HOTKEYS_DB);
        } finally {
            setIsGenerating(false);
        }
    };

    const startFullscreenGame = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            if (navigator.keyboard && navigator.keyboard.lock) {
                await navigator.keyboard.lock(["ControlLeft", "ControlRight", "KeyT", "KeyW", "KeyN", "KeyR", "KeyS", "KeyP"]);
            }
        } catch (e) {
            console.warn("Fullscreen API warning:", e);
        }
        startGame();
    };

    const startGame = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10)); 
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setGameStarted(true);
    };

    const leaveGame = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        setGameStarted(false);
        setActiveHotkeys(HOTKEYS_DB);
    };

    useEffect(() => {
        if (!gameStarted || isFinished || tasks.length === 0) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const currentTask = tasks[currentIndex];

            if (isCtrlOrCmd) {
                e.preventDefault(); 

                // Проверяем: нужен ли Shift по заданию и зажат ли он по факту
                const requiresShift = !!currentTask.shift;
                const isShiftPressed = e.shiftKey;

                if (isShiftPressed === requiresShift && e.key.toLowerCase() === currentTask.key.toLowerCase()) {
                    setSuccessPulse(true);
                    setScore(prev => prev + 1);
                    setTimeout(() => setSuccessPulse(false), 200);

                    if (currentIndex < tasks.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                    } else {
                        setIsFinished(true);
                    }
                } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 300);
                }
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 300);
            }
        };

        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, tasks, isFinished, gameStarted]);

    // Общие стили для кнопок, чтобы код был чище
    const keyBoxStyle = {
        padding: '15px 25px', background: 'var(--bg-body)', border: '2px solid var(--glass-border)', 
        borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center'
    };

    const targetBoxStyle = {
        padding: '15px 25px', background: 'var(--bg-body)', border: '2px dashed var(--accent-glow, #0ea5e9)', 
        borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-glow, #0ea5e9)', 
        boxShadow: 'inset 0 0 10px rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center'
    };

    const plusStyle = {
        fontSize: '30px', fontWeight: 'bold', color: 'var(--text-sec)', display: 'flex', alignItems: 'center'
    };

    if (!gameStarted) {
        return (
            <motion.div 
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 30px', margin: '0 auto' }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{fontSize: '50px'}}>⚡</div>
                    <h2 style={{margin: 0, fontSize: '36px', color: 'var(--text-main)'}}>Хоткеи</h2>
                    <span style={{ fontSize: '11px', fontWeight: '900', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '6px 12px', borderRadius: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI POWERED
                    </span>
                </div>
                
                <p style={{fontSize: '16px', color: 'var(--text-sec)', maxWidth: '500px', lineHeight: '1.5', textAlign: 'center'}}>
                    Сгенерируй комбинации клавиш (с Ctrl и Shift) для любой программы с помощью ИИ или играй в базовом режиме.
                </p>

                <div style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '20px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '20px' }}>✨</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '15px' }}>Изучить новую программу</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Word, Photoshop, Figma..."
                            style={{ flex: '1 1 200px', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '15px' }}
                            disabled={isGenerating}
                        />
                        <button 
                            onClick={generateAIHotkeys} 
                            disabled={isGenerating} 
                            style={{ flex: '0 0 auto', padding: '0 25px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
                        >
                            {isGenerating ? "⏳..." : "Создать"}
                        </button>
                    </div>
                    {activeHotkeys !== HOTKEYS_DB && !isGenerating && (
                        <div style={{marginTop: '15px', fontSize: '13px', color: '#10b981', fontWeight: 'bold', textAlign: 'center'}}>
                            ✅ Успешно! База «{topic}» загружена.
                        </div>
                    )}
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', width: '100%', maxWidth: '320px'}}>
                    <Button variant="orange" onClick={startFullscreenGame} style={{height: '54px', fontSize: '16px'}}>
                        🚀 Начать в полном экране
                    </Button>
                    <Button variant="muted" onClick={startGame} style={{height: '54px', fontSize: '16px'}}>
                        Обычный режим
                    </Button>
                    <Button variant="red" onClick={onBack} style={{height: '54px', fontSize: '16px', marginTop: '10px', background: 'transparent', border: '1px solid #ef4444'}}>
                        Назад в меню
                    </Button>
                </div>
            </motion.div>
        );
    }

    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const progress = (currentIndex / tasks.length) * 100;

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px', margin: '0 auto', position: 'relative' }}
        >
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <h2 style={{margin: 0, fontSize: '28px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {activeHotkeys !== HOTKEYS_DB ? `Хоткеи: ${topic}` : 'Хоткеи ⚡'}
                    </h2>
                    {isFullscreen && <span style={{fontSize: '11px', background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold'}}>🔒 КЛАВИАТУРА ЗАХВАЧЕНА</span>}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--text-sec)'}}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{padding: '0 15px', height: '36px', minHeight: '36px', fontSize: '14px'}}>Выйти</Button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '20px 0'}}>
                    <div style={{fontSize: '20px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', textAlign: 'center'}}>
                        Зажмите правильную комбинацию:
                    </div>
                    
                    <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.05 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            fontSize: '32px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)', maxWidth: '80%'
                        }}
                    >
                        «{currentTask.desc}»
                    </motion.div>

                    <div style={{display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <div style={keyBoxStyle}>Ctrl</div>
                        <div style={plusStyle}>+</div>
                        
                        {/* Динамическое отображение Shift */}
                        {currentTask.shift && (
                            <>
                                <div style={keyBoxStyle}>Shift</div>
                                <div style={plusStyle}>+</div>
                            </>
                        )}
                        
                        <div style={targetBoxStyle}>?</div>
                    </div>
                    
                    <div style={{width: '100%', height: '6px', background: 'var(--bg-body)', borderRadius: '6px', overflow: 'hidden', marginTop: '10px'}}>
                        <motion.div 
                            initial={{ width: `${progress}%` }}
                            animate={{ width: `${(currentIndex / tasks.length) * 100}%` }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #f6d365, #fda085)' }}
                        />
                    </div>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
                >
                    <h2 style={{ fontSize: '42px', margin: 0, color: '#10b981' }}>Отличная работа!</h2>
                    <p style={{ fontSize: '18px', color: 'var(--text-sec)' }}>Вы успешно закрепили горячие клавиши в мышечной памяти.</p>
                    <div style={{display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <Button variant="orange" onClick={startGame} style={{ width: '200px' }}>Пройти еще раз</Button>
                        <Button variant="muted" onClick={leaveGame} style={{ width: '200px' }}>Другая тема</Button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
