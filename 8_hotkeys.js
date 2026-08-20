const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

// Ультимативная база горячих клавиш: добавлена мультиязычность (ru, en, uz)
const HOTKEYS_DB = [
    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---
    { desc_ru: "Поправить текст по правому краю", desc_en: "Align text right", desc_uz: "Matnni o'ngga tekislash", key: "r", shift: false, visual: "Ctrl + R" },
    { desc_ru: "Поправить текст по левому краю", desc_en: "Align text left", desc_uz: "Matnni chapga tekislash", key: "l", shift: false, visual: "Ctrl + L" },
    { desc_ru: "Отменить последнее действие", desc_en: "Undo last action", desc_uz: "Oxirgi harakatni bekor qilish", key: "z", shift: false, visual: "Ctrl + Z" },
    { desc_ru: "Вырезать текст", desc_en: "Cut text", desc_uz: "Matnni qirqib olish", key: "x", shift: false, visual: "Ctrl + X" },
    { desc_ru: "Поправить текст по центру", desc_en: "Align text center", desc_uz: "Matnni markazga tekislash", key: "e", shift: false, visual: "Ctrl + E" },
    { desc_ru: "Выделить весь текст", desc_en: "Select all text", desc_uz: "Barcha matnni tanlash", key: "a", shift: false, visual: "Ctrl + A" },
    { desc_ru: "Курсив", desc_en: "Italic", desc_uz: "Kursiv", key: "i", shift: false, visual: "Ctrl + I" },
    { desc_ru: "Открыть принтер", desc_en: "Print", desc_uz: "Chop etishni ochish", key: "p", shift: false, visual: "Ctrl + P" },
    { desc_ru: "Линия под текстом", desc_en: "Underline", desc_uz: "Matn ostiga chizish", key: "u", shift: false, visual: "Ctrl + U" },
    { desc_ru: "Сохранить", desc_en: "Save", desc_uz: "Saqlash", key: "s", shift: false, visual: "Ctrl + S" },
    { desc_ru: "Копия", desc_en: "Copy", desc_uz: "Nusxa olish", key: "c", shift: false, visual: "Ctrl + C" },
    { desc_ru: "Вставить", desc_en: "Paste", desc_uz: "Joylashtirish", key: "v", shift: false, visual: "Ctrl + V" },
    { desc_ru: "Открыть файл", desc_en: "Open file", desc_uz: "Faylni ochish", key: "o", shift: false, visual: "Ctrl + O" },
    { desc_ru: "Выйти из документа", desc_en: "Close document", desc_uz: "Hujjatdan chiqish", key: "w", shift: false, visual: "Ctrl + W" },
    { desc_ru: "Найти", desc_en: "Find", desc_uz: "Izlash", key: "f", shift: false, visual: "Ctrl + F" },
    { desc_ru: "Найти и заменить", desc_en: "Find and replace", desc_uz: "Izlash va almashtirish", key: "h", shift: false, visual: "Ctrl + H" },
    { desc_ru: "Перейти к истории (Redo)", desc_en: "Redo", desc_uz: "Qaytarish (Redo)", key: "y", shift: false, visual: "Ctrl + Y" },
    { desc_ru: "Вставить гиперссылку", desc_en: "Insert hyperlink", desc_uz: "Giperhavola qo'shish", key: "k", shift: false, visual: "Ctrl + K" },

    // --- ТРОЙНЫЕ КОМБИНАЦИИ С SHIFT (ИЗ КОНСПЕКТА) ---
    { desc_ru: "Увеличить размер шрифта", desc_en: "Increase font size", desc_uz: "Shrift o'lchamini kattalashtirish", key: ">", shift: true, visual: "Ctrl + Shift + >" },
    { desc_ru: "Уменьшить размер шрифта", desc_en: "Decrease font size", desc_uz: "Shrift o'lchamini kichiklashtirish", key: "<", shift: true, visual: "Ctrl + Shift + <" },
    { desc_ru: "Двойное подчёркивание", desc_en: "Double underline", desc_uz: "Ikki marta tagiga chizish", key: "d", shift: true, visual: "Ctrl + Shift + D" },
    { desc_ru: "Все прописные", desc_en: "All caps", desc_uz: "Barcha harflarni kattalashtirish", key: "a", shift: true, visual: "Ctrl + Shift + A" },
    { desc_ru: "Подчёркивание только слов", desc_en: "Underline words only", desc_uz: "Faqat so'zlarning tagiga chizish", key: "w", shift: true, visual: "Ctrl + Shift + W" },

    // --- НАВИГАЦИЯ В БРАУЗЕРЕ ---
    { desc_ru: "Открыть новую вкладку", desc_en: "Open new tab", desc_uz: "Yangi yorliq ochish", key: "t", shift: false, visual: "Ctrl + T" },
    { desc_ru: "Создать новый файл или окно", desc_en: "New file or window", desc_uz: "Yangi fayl yoki oyna yaratish", key: "n", shift: false, visual: "Ctrl + N" },
    { desc_ru: "Жирный текст", desc_en: "Bold text", desc_uz: "Qalin matn", key: "b", shift: false, visual: "Ctrl + B" }
];

const HotkeyTrainer = ({ onBack }) => {
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    
    // Новые состояния для Теории и Языка
    const [showTheory, setShowTheory] = useState(false);
    const [lang, setLang] = useState('ru'); // 'ru', 'en', 'uz'

    // AI Состояния
    const [topic, setTopic] = useState("Microsoft Word");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);

    // Функция генерации базы горячих клавиш через ИИ
    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert("Введите название программы!");
        setIsGenerating(true);

        const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}".

        Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${topic}".

        СТРОГИЕ ПРАВИЛА:
        1. НЕ ПРИДУМЫВАЙ комбинации. Используй только официальные.
        2. Если не существует 10, верни сколько есть (но не меньше 5).
        3. Напиши перевод описания на 3 языка: русский (desc_ru), английский (desc_en) и узбекский (desc_uz).
        4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или символ.
        5. Не повторяй одну и ту же комбинацию дважды.
        6. Верни ТОЛЬКО чистый валидный JSON-массив объектов.

        Формат строго такой:
        [
          {"desc_ru": "Копировать", "desc_en": "Copy", "desc_uz": "Nusxa olish", "key": "c", "shift": false, "visual": "Ctrl + C"},
          {"desc_ru": "Сохранить как", "desc_en": "Save as", "desc_uz": "Boshqa nom bilan saqlash", "key": "s", "shift": true, "visual": "Ctrl + Shift + S"}
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

    // Переход к экрану Теории
    const openTheory = () => {
        setShowTheory(true);
    };

    // Запуск самой игры/практики из Теории
    const startPractice = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setShowTheory(false);
        setGameStarted(true);
    };

    const resetGame = () => {
        startPractice();
    };

    const leaveGame = () => {
        setGameStarted(false);
        setShowTheory(false);
        setActiveHotkeys(HOTKEYS_DB);
    };

    useEffect(() => {
        if (!gameStarted || isFinished || tasks.length === 0 || showTheory) return;

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
    }, [currentIndex, tasks, isFinished, gameStarted, showTheory]);

    // === СТАРТОВЫЙ ЭКРАН ===
    if (!gameStarted && !showTheory) {
        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '22px', padding: '46px 34px', margin: '0 auto', position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '320px', height: '220px',
                    background: 'radial-gradient(ellipse, rgba(253,160,133,0.18), transparent 70%)', pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                    <div style={{
                        width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', boxShadow: '0 10px 24px -8px rgba(253,160,133,0.6)'
                    }}>
                        ⚡
                    </div>
                    <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Хоткеи
                    </h2>
                    <span style={{ fontSize: '10px', fontWeight: '900', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '5px 11px', borderRadius: '10px', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 6px 16px -6px rgba(109,40,217,0.6)' }}>
                        AI powered
                    </span>
                </div>

                <p style={{ fontSize: '14.5px', color: 'var(--text-sec)', maxWidth: '460px', lineHeight: '1.6', textAlign: 'center', fontWeight: 500, margin: 0 }}>
                    Тренируй стандартную базу из твоих конспектов (Word, Система) или создай персональную для любой другой программы
                </p>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ */}
                <div style={{
                    width: '100%', maxWidth: '520px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                    borderRadius: '20px', padding: '22px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        Своя база для другой программы
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Напр. Word, Excel, Photoshop..."
                            style={{
                                flex: '1 1 180px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600
                            }}
                            disabled={isGenerating}
                        />
                        <motion.button
                            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                            whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                            onClick={generateAIHotkeys}
                            disabled={isGenerating}
                            style={{
                                padding: '0 22px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff',
                                borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: isGenerating ? 'not-allowed' : 'pointer',
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
                                    fontSize: '13px', color: '#10b981', fontWeight: 700, textAlign: 'center',
                                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '9px'
                                }}
                            >
                                ✅ База «{topic}» успешно загружена
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '10px', width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
                    <Button variant="orange" onClick={openTheory} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px' }}>
                        📖 Начать изучение
                    </Button>
                    <Button variant="red" onClick={onBack} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px', background: 'transparent', border: '1px solid #ef4444' }}>
                        Назад
                    </Button>
                </div>
            </motion.div>
        );
    }

    // === ЭКРАН ТЕОРИИ ===
    if (showTheory) {
        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', maxWidth: '820px', padding: '32px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>
                        📖 Теория: {activeHotkeys !== HOTKEYS_DB ? topic : 'Базовые клавиши'}
                    </h2>
                    
                    {/* Переключатель языков */}
                    <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-body)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        {['ru', 'en', 'uz'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                style={{
                                    padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                                    background: lang === l ? 'var(--bg-panel)' : 'transparent',
                                    color: lang === l ? 'var(--text-main)' : 'var(--text-sec)',
                                    boxShadow: lang === l ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </header>

                <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeHotkeys.map((hk, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                                {hk[`desc_${lang}`] || hk.desc_ru}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-glow, #0ea5e9)', background: 'var(--bg-panel)', padding: '6px 12px', borderRadius: '8px' }}>
                                {hk.visual}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                    <Button variant="orange" onClick={startPractice} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px' }}>
                        🚀 Перейти к практике
                    </Button>
                    <Button variant="muted" onClick={() => setShowTheory(false)} style={{ flex: 0.3, height: '52px', fontSize: '16px', borderRadius: '14px' }}>
                        Назад
                    </Button>
                </div>
            </motion.div>
        );
    }

    // === ЭКРАН ПРАКТИКИ (ИГРА) ===
    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const progress = (currentIndex / tasks.length) * 100;

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '26px', padding: '32px', margin: '0 auto' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '18px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, letterSpacing: '-0.4px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {activeHotkeys !== HOTKEYS_DB ? `Практика: ${topic}` : 'Практика ⚡'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        fontSize: '15px', fontWeight: 800, color: 'var(--text-sec)', background: 'var(--bg-body)',
                        border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '7px 14px'
                    }}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{ padding: '0 16px', height: '38px', minHeight: '38px', fontSize: '13px', borderRadius: '10px' }}>Выйти</Button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '10px 0' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', textAlign: 'center' }}>
                        Выполните комбинацию
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                            fontSize: '30px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)',
                            maxWidth: '85%', letterSpacing: '-0.3px'
                        }}
                    >
                        {/* Динамический вывод на выбранном языке */}
                        «{currentTask[`desc_${lang}`] || currentTask.desc_ru}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{
                            padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px',
                            fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                        }}>
                            Ctrl
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.6 }}>+</div>

                        {currentTask.shift && (
                            <>
                                <div style={{
                                    padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px',
                                    fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                                }}>
                                    Shift
                                </div>
                                <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.6 }}>+</div>
                            </>
                        )}

                        <motion.div
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                            style={{
                                padding: '16px 26px', background: 'var(--bg-body)', border: '2px dashed var(--accent-glow, #0ea5e9)', borderRadius: '14px',
                                fontSize: '22px', fontWeight: '800', color: 'var(--accent-glow, #0ea5e9)', boxShadow: 'inset 0 0 14px rgba(14,165,233,0.15)'
                            }}
                        >
                            ?
                        </motion.div>
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
                    style={{ textAlign: 'center', padding: '46px 0', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}
                >
                    <div style={{
                        width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 12px 30px -10px rgba(16,185,129,0.6)'
                    }}>
                        🎉
                    </div>
                    <h2 style={{ fontSize: '38px', margin: 0, fontWeight: 900, color: '#10b981', letterSpacing: '-0.5px' }}>Отличная работа!</h2>
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
