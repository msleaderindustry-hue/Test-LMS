const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

// Ультимативная база горячих клавиш: ОС, Браузер, Word, Excel, PowerPoint
const HOTKEYS_DB = [
    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---
    { desc: "Скопировать выделенное", key: "c", visual: "Ctrl + C" },
    { desc: "Вставить из буфера", key: "v", visual: "Ctrl + V" },
    { desc: "Вырезать (удалить и скопировать)", key: "x", visual: "Ctrl + X" },
    { desc: "Отменить последнее действие", key: "z", visual: "Ctrl + Z" },
    { desc: "Вернуть отмененное действие (Redo)", key: "y", visual: "Ctrl + Y" },
    { desc: "Выделить всё (текст или объекты)", key: "a", visual: "Ctrl + A" },
    { desc: "Сохранить документ", key: "s", visual: "Ctrl + S" },
    { desc: "Отправить на печать", key: "p", visual: "Ctrl + P" },
    { desc: "Найти слово в тексте/на странице", key: "f", visual: "Ctrl + F" },
    { desc: "Создать новый файл или окно", key: "n", visual: "Ctrl + N" },
    { desc: "Открыть существующий файл", key: "o", visual: "Ctrl + O" },

    // --- ФОРМАТИРОВАНИЕ И РАБОТА С ТЕКСТОМ (Word / Офис) ---
    { desc: "Сделать текст жирным (Bold)", key: "b", visual: "Ctrl + B" },
    { desc: "Сделать текст курсивом (Italic)", key: "i", visual: "Ctrl + I" },
    { desc: "Сделать текст подчеркнутым", key: "u", visual: "Ctrl + U" },
    { desc: "Выравнивание текста по центру", key: "e", visual: "Ctrl + E" },
    { desc: "Выравнивание текста по левому краю", key: "l", visual: "Ctrl + L" },
    { desc: "Выравнивание текста по правому краю", key: "r", visual: "Ctrl + R" },
    { desc: "Выравнивание текста по ширине (Justify)", key: "j", visual: "Ctrl + J" },
    { desc: "Вставить гиперссылку", key: "k", visual: "Ctrl + K" },
    { desc: "Открыть окно замены текста (Replace)", key: "h", visual: "Ctrl + H" },

    // --- POWERPOINT И EXCEL ---
    { desc: "Создать новый слайд (PowerPoint)", key: "m", visual: "Ctrl + M" },
    { desc: "Дублировать выделенный объект/слайд", key: "d", visual: "Ctrl + D" },
    
    // --- НАВИГАЦИЯ В БРАУЗЕРЕ (Chrome, Edge, Safari) ---
    { desc: "Открыть новую вкладку", key: "t", visual: "Ctrl + T" },
    { desc: "Закрыть текущую вкладку", key: "w", visual: "Ctrl + W" },
    { desc: "Обновить страницу", key: "r", visual: "Ctrl + R" },
    { desc: "Открыть историю браузера", key: "h", visual: "Ctrl + H" },
    { desc: "Открыть список загрузок", key: "j", visual: "Ctrl + J" },
    { desc: "Добавить страницу в закладки", key: "d", visual: "Ctrl + D" },
    { desc: "Выделить адресную строку", key: "l", visual: "Ctrl + L" }
];

const HotkeyTrainer = ({ onBack }) => {
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // AI Состояния
    const [topic, setTopic] = useState("Microsoft Word");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);

    // Функция генерации базы горячих клавиш через ИИ
    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert("Введите название программы!");
        setIsGenerating(true);

        const prompt = `Сгенерируй 10 самых полезных горячих клавиш (комбинаций с Ctrl или Cmd) для программы: "${topic}". 
        Верни ТОЛЬКО чистый валидный JSON массив объектов, без форматирования markdown, без пояснений. 
        Формат строго такой:
        [
          {"desc": "Описание действия на русском", "key": "c", "visual": "Ctrl + C"}
        ]
        ВАЖНО: поле 'key' должно содержать только одну строчную английскую букву (ту, которую надо нажать вместе с Ctrl).`;

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
            
            // Вытаскиваем массив с помощью регулярки
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

    const startGame = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10)); 
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setGameStarted(true);
    };

    const resetGame = () => {
        startGame();
    };

    const leaveGame = () => {
        setGameStarted(false);
        setActiveHotkeys(HOTKEYS_DB);
    };

    useEffect(() => {
        if (!gameStarted || isFinished || tasks.length === 0) return;

        const handleKeyDown = (e) => {
            // Игнорируем нажатия, если пользователь в инпуте
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const currentTask = tasks[currentIndex];

            if (isCtrlOrCmd) {
                e.preventDefault(); // Блокируем стандартные действия браузера

                if (e.key.toLowerCase() === currentTask.key) {
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

    // === СТАРТОВЫЙ ЭКРАН С НАСТРОЙКОЙ ИИ ===
    if (!gameStarted) {
        return (
            <motion.div 
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 30px', margin: '0 auto' }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <h2 style={{margin: 0, fontSize: '32px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        Хоткеи ⚡
                    </h2>
                    <span style={{ fontSize: '10px', fontWeight: '900', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI POWERED
                    </span>
                </div>

                <p style={{fontSize: '15px', color: 'var(--text-sec)', maxWidth: '450px', lineHeight: '1.5', textAlign: 'center'}}>
                    Тренируй стандартную базу или введи название любой программы, и ИИ создаст для нее персональный набор горячих клавиш!
                </p>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ */}
                <div style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '20px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Напр. Word, Excel, Photoshop..."
                            style={{ flex: '1 1 180px', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px' }}
                            disabled={isGenerating}
                        />
                        <button 
                            onClick={generateAIHotkeys} 
                            disabled={isGenerating} 
                            style={{ padding: '0 20px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1, height: '46px' }}
                        >
                            {isGenerating ? "⏳ Ищем..." : "Создать базу"}
                        </button>
                    </div>
                    {activeHotkeys !== HOTKEYS_DB && !isGenerating && (
                        <div style={{marginTop: '12px', fontSize: '13px', color: '#10b981', fontWeight: 'bold', textAlign: 'center'}}>
                            ✅ База «{topic}» успешно загружена!
                        </div>
                    )}
                </div>

                <div style={{display: 'flex', gap: '15px', marginTop: '15px', width: '100%', maxWidth: '400px', justifyContent: 'center'}}>
                    <Button variant="orange" onClick={startGame} style={{flex: 1, height: '50px', fontSize: '16px'}}>
                        🚀 Начать тренировку
                    </Button>
                    <Button variant="red" onClick={onBack} style={{flex: 1, height: '50px', fontSize: '16px', background: 'transparent', border: '1px solid #ef4444'}}>
                        Назад
                    </Button>
                </div>
            </motion.div>
        );
    }

    // === ИГРОВОЙ ЭКРАН ===
    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const progress = (currentIndex / tasks.length) * 100;

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px', margin: '0 auto' }}
        >
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px'}}>
                <h2 style={{margin: 0, fontSize: '28px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    {activeHotkeys !== HOTKEYS_DB ? `Хоткеи: ${topic}` : 'Хоткеи ⚡'}
                </h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--text-sec)'}}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{padding: '0 15px', height: '36px', minHeight: '36px', fontSize: '14px'}}>Выйти</Button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '20px 0'}}>
                    <div style={{fontSize: '20px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>
                        Зажмите Ctrl и нужную клавишу:
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

                    <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                        <div style={{padding: '15px 25px', background: 'var(--bg-body)', border: '2px solid var(--glass-border)', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                            Ctrl
                        </div>
                        <div style={{fontSize: '30px', fontWeight: 'bold', color: 'var(--text-sec)', display: 'flex', alignItems: 'center'}}>+</div>
                        <div style={{padding: '15px 25px', background: 'var(--bg-body)', border: '2px dashed var(--accent-glow, #0ea5e9)', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-glow, #0ea5e9)', boxShadow: 'inset 0 0 10px rgba(14,165,233,0.2)'}}>
                            ?
                        </div>
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
                    <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                        <Button variant="orange" onClick={resetGame} style={{ width: '200px' }}>Пройти еще раз</Button>
                        <Button variant="muted" onClick={leaveGame} style={{ width: '200px' }}>Другая тема</Button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
