const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

// Ультимативная база горячих клавиш: перенесено из твоих рукописных конспектов!
const HOTKEYS_DB = [
    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---
    { desc: "Поправить текст по правому краю", key: "r", shift: false, visual: "Ctrl + R" },
    { desc: "Поправить текст по левому краю", key: "l", shift: false, visual: "Ctrl + L" },
    { desc: "Отменить последнее действие", key: "z", shift: false, visual: "Ctrl + Z" },
    { desc: "Вырезать текст", key: "x", shift: false, visual: "Ctrl + X" },
    { desc: "Поправить текст по центру", key: "e", shift: false, visual: "Ctrl + E" },
    { desc: "Выделить весь текст", key: "a", shift: false, visual: "Ctrl + A" },
    { desc: "Курсив", key: "i", shift: false, visual: "Ctrl + I" },
    { desc: "Открыть принтер", key: "p", shift: false, visual: "Ctrl + P" },
    { desc: "Линия под текстом", key: "u", shift: false, visual: "Ctrl + U" },
    { desc: "Сохранить", key: "s", shift: false, visual: "Ctrl + S" },
    { desc: "Копия", key: "c", shift: false, visual: "Ctrl + C" },
    { desc: "Вставить", key: "v", shift: false, visual: "Ctrl + V" },
    { desc: "Открыть файл", key: "o", shift: false, visual: "Ctrl + O" },
    { desc: "Выйти из документа", key: "w", shift: false, visual: "Ctrl + W" },
    { desc: "Найти", key: "f", shift: false, visual: "Ctrl + F" },
    { desc: "Найти и заменить", key: "h", shift: false, visual: "Ctrl + H" },
    { desc: "Перейти к истории (Redo)", key: "y", shift: false, visual: "Ctrl + Y" },
    { desc: "Вставить гиперссылку", key: "k", shift: false, visual: "Ctrl + K" },

    // --- ТРОЙНЫЕ КОМБИНАЦИИ С SHIFT (ИЗ КОНСПЕКТА) ---
    { desc: "Увеличить размер шрифта", key: ">", shift: true, visual: "Ctrl + Shift + >" },
    { desc: "Уменьшить размер шрифта", key: "<", shift: true, visual: "Ctrl + Shift + <" },
    { desc: "Двойное подчёркивание", key: "d", shift: true, visual: "Ctrl + Shift + D" },
    { desc: "Все прописные", key: "a", shift: true, visual: "Ctrl + Shift + A" },
    { desc: "Подчёркивание только слов", key: "w", shift: true, visual: "Ctrl + Shift + W" },

    // --- НАВИГАЦИЯ В БРАУЗЕРЕ ---
    { desc: "Открыть новую вкладку", key: "t", shift: false, visual: "Ctrl + T" },
    { desc: "Создать новый файл или окно", key: "n", shift: false, visual: "Ctrl + N" },
    { desc: "Жирный текст", key: "b", shift: false, visual: "Ctrl + B" }
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

        // ЖЁСТКИЙ ПРОМПТ ПРОТИВ ВЫДУМОК: минимум творчества, максимум проверяемых фактов
        const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций.

        Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${topic}".

        СТРОГИЕ ПРАВИЛА (нарушение недопустимо):
        1. НЕ ПРИДУМЫВАЙ комбинации. Используй только те горячие клавиши, которые реально существуют и задокументированы в официальной справке/документации программы "${topic}". Если не уверен, что комбинация существует именно в этой программе — не включай её.
        2. Если для "${topic}" в принципе не существует 10 разных официальных комбинаций с Ctrl/Cmd — верни столько, сколько действительно существует (не меньше 5, не выдумывая недостающие).
        3. Никакой отсебятины в описаниях: поле "desc" должно точно и нейтрально описывать действие, без выдуманных деталей.
        4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или символ (физическая клавиша, которая нажимается вместе с Ctrl).
        5. Не повторяй одну и ту же комбинацию дважды.
        6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Без markdown, без пояснений, без текста до или после массива.

        Формат строго такой:
        [
          {"desc": "Описание действия на русском", "key": "c", "shift": false, "visual": "Ctrl + C"},
          {"desc": "Сохранить как", "key": "s", "shift": true, "visual": "Ctrl + Shift + S"}
        ]`;

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

            const validatedHotkeys = parsedHotkeys.map(hk => ({
                ...hk,
                key: hk.key.toLowerCase()
            }));

            if (Array.isArray(validatedHotkeys) && validatedHotkeys.length > 0) {
                setActiveHotkeys(validatedHotkeys);
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
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const currentTask = tasks[currentIndex];

            if (isCtrlOrCmd) {
                e.preventDefault();

                const requiresShift = !!currentTask.shift;
                const isShiftPressed = e.shiftKey;
                const pressedKey = e.key.toLowerCase();
                const expectedKey = currentTask.key.toLowerCase();

                if (isShiftPressed === requiresShift && pressedKey === expectedKey) {
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

    // Общий стиль "физической" клавиши — переиспользуется на обоих экранах
    const keycapStyle = (accent) => ({
        padding: '15px 24px',
        background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-body) 100%)',
        border: '1px solid var(--glass-border)',
        borderBottom: accent ? `3px solid ${accent}` : '3px solid var(--glass-border)',
        borderRadius: '11px',
        fontSize: '20px',
        fontWeight: '800',
        fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace",
        color: accent || 'var(--text-main)',
        letterSpacing: '0.3px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
        minWidth: '26px',
        textAlign: 'center'
    });

    // === СТАРТОВЫЙ ЭКРАН ===
    if (!gameStarted) {
        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '26px', padding: '48px 36px', margin: '0 auto', position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute', top: '-90px', left: '50%', transform: 'translateX(-50%)', width: '360px', height: '240px',
                    background: 'radial-gradient(ellipse, rgba(253,160,133,0.20), transparent 72%)', pointerEvents: 'none', filter: 'blur(2px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-100px', right: '-60px', width: '260px', height: '260px',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)', pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                    <motion.div
                        initial={{ rotate: -8, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            width: '56px', height: '56px', borderRadius: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '25px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                            boxShadow: '0 12px 26px -10px rgba(253,160,133,0.65), inset 0 1px 1px rgba(255,255,255,0.5)'
                        }}
                    >
                        ⚡
                    </motion.div>
                    <h2 style={{
                        margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-0.6px',
                        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Хоткеи
                    </h2>
                    <span style={{
                        fontSize: '10px', fontWeight: '900', background: 'linear-gradient(120deg, #a855f7, #6d28d9)', color: '#ffffff',
                        padding: '6px 12px', borderRadius: '999px', letterSpacing: '1.2px', textTransform: 'uppercase',
                        boxShadow: '0 6px 18px -6px rgba(109,40,217,0.6)', alignSelf: 'center'
                    }}>
                        AI powered
                    </span>
                </div>

                <p style={{
                    fontSize: '15px', color: 'var(--text-sec)', maxWidth: '460px', lineHeight: '1.7',
                    textAlign: 'center', fontWeight: 500, margin: 0
                }}>
                    Тренируй стандартную базу из твоих конспектов (Word, Система) или создай персональную для любой другой программы
                </p>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ */}
                <div style={{
                    width: '100%', maxWidth: '520px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                    borderRadius: '20px', padding: '24px', marginTop: '6px', boxShadow: '0 10px 28px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '1.4px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                        Своя база для другой программы
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Напр. Word, Excel, Photoshop..."
                            style={{
                                flex: '1 1 180px', padding: '13px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600,
                                transition: 'border-color 0.2s ease'
                            }}
                            disabled={isGenerating}
                        />
                        <motion.button
                            whileHover={{ scale: isGenerating ? 1 : 1.02, y: isGenerating ? 0 : -1 }}
                            whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                            onClick={generateAIHotkeys}
                            disabled={isGenerating}
                            style={{
                                padding: '0 24px', background: 'linear-gradient(120deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff',
                                borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                                opacity: isGenerating ? 0.7 : 1, height: '49px', boxShadow: '0 10px 22px -10px rgba(109,40,217,0.65)',
                                display: 'flex', alignItems: 'center', gap: '9px'
                            }}
                        >
                            {isGenerating && (
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                    style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', display: 'inline-block' }}
                                />
                            )}
                            {isGenerating ? "Ищем…" : "Создать базу"}
                        </motion.button>
                    </div>
                    <AnimatePresence>
                        {activeHotkeys !== HOTKEYS_DB && !isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                style={{
                                    fontSize: '13px', color: '#10b981', fontWeight: 700, textAlign: 'center',
                                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '11px', padding: '10px'
                                }}
                            >
                                ✅ База «{topic}» успешно загружена
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '10px', width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
                    <Button variant="orange" onClick={startGame} style={{ flex: 1, height: '53px', fontSize: '16px', borderRadius: '14px', fontWeight: 800 }}>
                        🚀 Начать тренировку
                    </Button>
                    <Button variant="red" onClick={onBack} style={{ flex: 1, height: '53px', fontSize: '16px', borderRadius: '14px', background: 'transparent', border: '1.5px solid #ef4444', fontWeight: 700 }}>
                        Назад
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
            transition={shake ? { duration: 0.3 } : { duration: 0.5, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '28px', padding: '34px', margin: '0 auto' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{
                    margin: 0, fontSize: '27px', fontWeight: 900, letterSpacing: '-0.5px',
                    background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    {activeHotkeys !== HOTKEYS_DB ? `Хоткеи: ${topic}` : 'Хоткеи ⚡'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        fontSize: '15px', fontWeight: 800, color: 'var(--text-sec)', background: 'var(--bg-body)',
                        border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 15px',
                        fontFamily: "ui-monospace, monospace"
                    }}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{ padding: '0 16px', height: '38px', minHeight: '38px', fontSize: '13px', borderRadius: '10px', fontWeight: 700 }}>Выйти</Button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '34px', padding: '12px 0' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', textAlign: 'center' }}>
                        Выполните комбинацию
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                            fontSize: '31px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)',
                            maxWidth: '85%', letterSpacing: '-0.4px', lineHeight: '1.3', transition: 'color 0.2s ease'
                        }}
                    >
                        «{currentTask.desc}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={keycapStyle(null)}>
                            Ctrl
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.5 }}>+</div>

                        {/* Динамически показываем карточку Shift, если нужно */}
                        {currentTask.shift && (
                            <>
                                <div style={keycapStyle(null)}>
                                    Shift
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.5 }}>+</div>
                            </>
                        )}

                        <motion.div
                            animate={{
                                opacity: [0.6, 1, 0.6],
                                boxShadow: [
                                    'inset 0 0 14px rgba(14,165,233,0.10)',
                                    'inset 0 0 22px rgba(14,165,233,0.25)',
                                    'inset 0 0 14px rgba(14,165,233,0.10)'
                                ]
                            }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                            style={{
                                ...keycapStyle('var(--accent-glow, #0ea5e9)'),
                                border: '2px dashed var(--accent-glow, #0ea5e9)',
                                borderBottom: '2px dashed var(--accent-glow, #0ea5e9)',
                                background: 'var(--bg-body)'
                            }}
                        >
                            ?
                        </motion.div>
                    </div>

                    <div style={{ width: '100%', height: '7px', background: 'rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden', marginTop: '8px' }}>
                        <motion.div
                            initial={{ width: `${progress}%` }}
                            animate={{ width: `${(currentIndex / tasks.length) * 100}%` }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{
                                height: '100%', background: 'linear-gradient(90deg, #f6d365, #fda085)', borderRadius: '8px',
                                boxShadow: '0 0 10px rgba(253,160,133,0.5)'
                            }}
                        />
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                        style={{
                            width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '33px', background: 'linear-gradient(135deg, #34d399, #10b981)',
                            boxShadow: '0 14px 32px -10px rgba(16,185,129,0.6), inset 0 1px 1px rgba(255,255,255,0.4)'
                        }}
                    >
                        🎉
                    </motion.div>
                    <h2 style={{ fontSize: '38px', margin: 0, fontWeight: 900, color: '#10b981', letterSpacing: '-0.6px' }}>Отличная работа!</h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                        Вы успешно закрепили {score} горячих клавиш в мышечной памяти
                    </p>
                    <Button variant="orange" onClick={resetGame} style={{ width: '260px', marginTop: '20px', height: '51px', borderRadius: '14px', fontSize: '15px', fontWeight: 800 }}>
                        Пройти ещё раз
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
