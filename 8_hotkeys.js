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

// Шрифтовой стек для клавиш — моноширинный, техничный, без внешних загрузок
const KEY_FONT = "'JetBrains Mono','SF Mono',ui-monospace,Menlo,Consolas,monospace";

// === СИГНАТУРНЫЙ ЭЛЕМЕНТ: физическая клавиша-кейкап ===
// Имитирует реальную механическую клавишу: скошенная грань, "высота" через смещённую тень,
// и честное "нажатие" — тень схлопывается, кейкап проседает.
const KeyCap = ({ label, size = "md", tone = "default", pressed = false, dashed = false, pulse = false }) => {
    const sizes = {
        sm: { padX: 12, padY: 9, font: 13 },
        md: { padX: 20, padY: 14, font: 19 },
        lg: { padX: 26, padY: 18, font: 24 }
    };
    const tones = {
        default: { bg: "var(--bg-panel)", top: "rgba(255,255,255,0.10)", text: "var(--text-main)", edge: "rgba(0,0,0,0.18)", ring: "var(--glass-border)" },
        accent: { bg: "linear-gradient(160deg, #fef0d9 0%, #fda085 100%)", top: "rgba(255,255,255,0.55)", text: "#5c2a0e", edge: "rgba(196,90,32,0.55)", ring: "rgba(253,160,133,0.7)" },
        success: { bg: "linear-gradient(160deg, #6ee7b7 0%, #10b981 100%)", top: "rgba(255,255,255,0.45)", text: "#053b2a", edge: "rgba(4,89,60,0.5)", ring: "rgba(16,185,129,0.65)" },
        danger: { bg: "linear-gradient(160deg, #fca5a5 0%, #ef4444 100%)", top: "rgba(255,255,255,0.4)", text: "#4a0b0b", edge: "rgba(120,15,15,0.5)", ring: "rgba(239,68,68,0.65)" }
    };
    const s = sizes[size];
    const t = tones[tone];
    const restShadow = `inset 0 1px 0 ${t.top}, inset 0 -2px 3px rgba(0,0,0,0.08), 0 4px 0 ${t.edge}, 0 10px 18px -8px rgba(0,0,0,0.35)`;
    const pressShadow = `inset 0 1px 0 ${t.top}, inset 0 -1px 2px rgba(0,0,0,0.1), 0 1px 0 ${t.edge}`;

    return (
        <motion.div
            animate={{
                y: pressed ? 3 : 0,
                opacity: dashed && !pressed ? [0.55, 1, 0.55] : 1
            }}
            transition={
                dashed && !pressed
                    ? { opacity: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } }
                    : { duration: 0.15 }
            }
            style={{
                position: "relative",
                minWidth: s.font * 1.7,
                padding: `${s.padY}px ${s.padX}px`,
                borderRadius: 10,
                fontFamily: KEY_FONT,
                fontWeight: 700,
                fontSize: s.font,
                letterSpacing: "0.02em",
                color: t.text,
                background: t.bg,
                border: dashed ? `2px dashed ${t.ring}` : `1px solid ${t.ring}`,
                boxShadow: pressed ? pressShadow : restShadow,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none"
            }}
        >
            {label}
        </motion.div>
    );
};

const KeyPlus = () => (
    <span style={{ fontFamily: KEY_FONT, fontSize: 20, fontWeight: 700, color: "var(--text-sec)", opacity: 0.45, padding: "0 2px" }}>
        +
    </span>
);

const BlinkCursor = ({ color = "var(--text-sec)" }) => (
    <motion.span
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ repeat: Infinity, duration: 1.1, times: [0, 0.5, 0.5, 1], ease: "linear" }}
        style={{ fontFamily: KEY_FONT, fontWeight: 700, color }}
    >
        _
    </motion.span>
);

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

    // === СТАРТОВЫЙ ЭКРАН ===
    if (!gameStarted) {
        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '26px', padding: '48px 34px', margin: '0 auto', position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '380px', height: '240px',
                    background: 'radial-gradient(ellipse, rgba(253,160,133,0.20), transparent 70%)', pointerEvents: 'none'
                }} />

                {/* Сигнатурный элемент: ряд физических клавиш, "тренирующихся" сами по себе */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                    {["C", "T", "R", "L"].map((ch, i) => (
                        <motion.div
                            key={ch + i}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.18, ease: "easeInOut" }}
                        >
                            <KeyCap label={ch} size="sm" tone="default" />
                        </motion.div>
                    ))}
                    <KeyPlus />
                    <KeyCap label="?" size="sm" tone="accent" dashed />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <h2 style={{
                        margin: 0, fontSize: '34px', fontWeight: 900, letterSpacing: '-0.5px',
                        fontFamily: KEY_FONT, textTransform: 'uppercase',
                        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Хоткеи
                    </h2>
                    <BlinkCursor color="#fda085" />
                    <span style={{
                        fontSize: '10px', fontWeight: '900', fontFamily: KEY_FONT, background: 'linear-gradient(90deg, #a855f7, #6d28d9)',
                        color: '#ffffff', padding: '5px 11px', borderRadius: '6px', letterSpacing: '1.5px', textTransform: 'uppercase',
                        boxShadow: '0 6px 16px -6px rgba(109,40,217,0.6)'
                    }}>
                        [AI]
                    </span>
                </div>

                <p style={{ fontSize: '14.5px', color: 'var(--text-sec)', maxWidth: '460px', lineHeight: '1.6', textAlign: 'center', fontWeight: 500, margin: 0 }}>
                    Тренируй стандартную базу из твоих конспектов (Word, Система) или создай персональную для любой другой программы
                </p>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ — оформлена как консоль */}
                <div style={{
                    width: '100%', maxWidth: '520px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                    borderRadius: '16px', padding: '22px', marginTop: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.04)'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', fontFamily: KEY_FONT
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
                        Своя база для другой программы
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 180px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: 16, color: 'var(--text-sec)', fontFamily: KEY_FONT, fontSize: 15, opacity: 0.5, pointerEvents: 'none' }}>›</span>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="напр. Word, Excel, Photoshop..."
                                style={{
                                    width: '100%', padding: '12px 16px 12px 32px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                    outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600,
                                    fontFamily: KEY_FONT
                                }}
                                disabled={isGenerating}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                            whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                            onClick={generateAIHotkeys}
                            disabled={isGenerating}
                            style={{
                                padding: '0 22px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff',
                                borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                                opacity: isGenerating ? 0.7 : 1, height: '48px', boxShadow: '0 8px 20px -8px rgba(109,40,217,0.6)',
                                display: 'flex', alignItems: 'center', gap: '8px'
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
                                    fontSize: '13px', color: '#10b981', fontWeight: 700, textAlign: 'center', fontFamily: KEY_FONT,
                                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '9px'
                                }}
                            >
                                база «{topic}» загружена ✓
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '10px', width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
                    <Button variant="orange" onClick={startGame} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px' }}>
                        🚀 Начать тренировку
                    </Button>
                    <Button variant="red" onClick={onBack} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px', background: 'transparent', border: '1px solid #ef4444' }}>
                        Назад
                    </Button>
                </div>
            </motion.div>
        );
    }

    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const progress = (currentIndex / tasks.length) * 100;
    const comboTone = successPulse ? "success" : shake ? "danger" : "default";

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '26px', padding: '32px', margin: '0 auto' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '18px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{
                    margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.3px', fontFamily: KEY_FONT, textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    {activeHotkeys !== HOTKEYS_DB ? `Хоткеи: ${topic}` : 'Хоткеи'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        fontSize: '14px', fontWeight: 800, color: 'var(--text-sec)', background: 'var(--bg-body)', fontFamily: KEY_FONT,
                        border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{ padding: '0 16px', height: '38px', minHeight: '38px', fontSize: '13px', borderRadius: '10px' }}>Выйти</Button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '34px', padding: '10px 0' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', textAlign: 'center', fontFamily: KEY_FONT }}>
                        Выполните комбинацию
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                            fontSize: '28px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)',
                            maxWidth: '85%', letterSpacing: '-0.3px'
                        }}
                    >
                        «{currentTask.desc}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <KeyCap label="CTRL" size="lg" tone={comboTone} pressed={successPulse} />
                        <KeyPlus />

                        {currentTask.shift && (
                            <>
                                <KeyCap label="SHIFT" size="lg" tone={comboTone} pressed={successPulse} />
                                <KeyPlus />
                            </>
                        )}

                        <KeyCap
                            label={successPulse ? currentTask.key.toUpperCase() : "?"}
                            size="lg"
                            tone={successPulse ? "success" : "accent"}
                            dashed={!successPulse}
                            pressed={successPulse}
                        />
                    </div>

                    <div style={{ width: '100%', height: '7px', background: 'rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden', marginTop: '6px' }}>
                        <motion.div
                            initial={{ width: `${progress}%` }}
                            animate={{ width: `${(currentIndex / tasks.length) * 100}%` }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #f6d365, #fda085)', borderRadius: '8px' }}
                        />
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    style={{ textAlign: 'center', padding: '46px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
                >
                    <motion.div
                        initial={{ scale: 0.5, y: -10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                    >
                        <KeyCap label="✓" size="lg" tone="success" pressed />
                    </motion.div>
                    <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 900, color: '#10b981', letterSpacing: '-0.5px', fontFamily: KEY_FONT, textTransform: 'uppercase' }}>
                        Отличная работа!
                    </h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                        Вы успешно закрепили {score} горячих клавиш в мышечной памяти
                    </p>
                    <Button variant="orange" onClick={resetGame} style={{ width: '260px', marginTop: '18px', height: '50px', borderRadius: '14px', fontSize: '15px' }}>
                        Пройти ещё раз
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
