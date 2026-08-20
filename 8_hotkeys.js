const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

// Ультимативная база горячих клавиш (ru, en, uz) с теорией (hints)
const HOTKEYS_DB = [
    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---
    { desc_ru: "Поправить текст по правому краю", desc_en: "Align text right", desc_uz: "Matnni o'ngga tekislash", hint_ru: "Смещает весь выделенный текст к правой границе документа.", hint_en: "Moves all selected text to the right margin of the document.", hint_uz: "Tanlangan matnni hujjatning o'ng chetiga suradi.", key: "r", shift: false, visual: "Ctrl + R" },
    { desc_ru: "Поправить текст по левому краю", desc_en: "Align text left", desc_uz: "Matnni chapga tekislash", hint_ru: "Смещает текст к левой границе (стандартное выравнивание).", hint_en: "Moves text to the left margin (default alignment).", hint_uz: "Matnni chap chetga suradi (standart tekislash).", key: "l", shift: false, visual: "Ctrl + L" },
    { desc_ru: "Отменить последнее действие", desc_en: "Undo last action", desc_uz: "Oxirgi harakatni bekor qilish", hint_ru: "Возвращает документ на один шаг назад, отменяя ошибку.", hint_en: "Reverts the document one step back, undoing a mistake.", hint_uz: "Hujjatni bir qadam orqaga qaytaradi, xatoni bekor qiladi.", key: "z", shift: false, visual: "Ctrl + Z" },
    { desc_ru: "Вырезать текст", desc_en: "Cut text", desc_uz: "Matnni qirqib olish", hint_ru: "Удаляет выделенный текст, но сохраняет его в память для вставки.", hint_en: "Removes selected text but saves it to memory for pasting.", hint_uz: "Tanlangan matnni o'chiradi, lekin joylashtirish uchun xotirada saqlaydi.", key: "x", shift: false, visual: "Ctrl + X" },
    { desc_ru: "Поправить текст по центру", desc_en: "Align text center", desc_uz: "Matnni markazga tekislash", hint_ru: "Выравнивает текст ровно посередине страницы.", hint_en: "Aligns the text exactly in the middle of the page.", hint_uz: "Matnni sahifaning qoq o'rtasiga tekislaydi.", key: "e", shift: false, visual: "Ctrl + E" },
    { desc_ru: "Выделить весь текст", desc_en: "Select all text", desc_uz: "Barcha matnni tanlash", hint_ru: "Захватывает абсолютно всё содержимое документа.", hint_en: "Highlights absolutely all content in the document.", hint_uz: "Hujjatdagi barcha narsani birdaniga tanlaydi.", key: "a", shift: false, visual: "Ctrl + A" },
    { desc_ru: "Курсив", desc_en: "Italic", desc_uz: "Kursiv", hint_ru: "Делает текст наклонным для выделения цитат или мыслей.", hint_en: "Makes text slanted to highlight quotes or thoughts.", hint_uz: "Matnni qiya (kursiv) qilib ko'rsatadi.", key: "i", shift: false, visual: "Ctrl + I" },
    { desc_ru: "Открыть принтер", desc_en: "Print", desc_uz: "Chop etish", hint_ru: "Открывает меню настройки печати документа на бумаге.", hint_en: "Opens the print settings menu for the document.", hint_uz: "Hujjatni qog'ozga chop etish sozlamalarini ochadi.", key: "p", shift: false, visual: "Ctrl + P" },
    { desc_ru: "Линия под текстом", desc_en: "Underline", desc_uz: "Matn ostiga chizish", hint_ru: "Проводит сплошную линию под выделенными словами.", hint_en: "Draws a solid line under the selected words.", hint_uz: "Tanlangan so'zlarning tagiga uzluksiz chiziq tortadi.", key: "u", shift: false, visual: "Ctrl + U" },
    { desc_ru: "Сохранить", desc_en: "Save", desc_uz: "Saqlash", hint_ru: "Записывает текущие изменения в файл на диске.", hint_en: "Writes current changes to the file on disk.", hint_uz: "Joriy o'zgarishlarni diskdagi faylga yozadi.", key: "s", shift: false, visual: "Ctrl + S" },
    { desc_ru: "Копия", desc_en: "Copy", desc_uz: "Nusxa olish", hint_ru: "Сохраняет текст в память, не удаляя оригинал.", hint_en: "Saves text to memory without deleting the original.", hint_uz: "Aslini o'chirmasdan matnni xotiraga nusxalaydi.", key: "c", shift: false, visual: "Ctrl + C" },
    { desc_ru: "Вставить", desc_en: "Paste", desc_uz: "Joylashtirish", hint_ru: "Выгружает скопированный или вырезанный текст из памяти.", hint_en: "Outputs copied or cut text from memory.", hint_uz: "Xotiradan nusxalangan yoki qirqilgan matnni tushiradi.", key: "v", shift: false, visual: "Ctrl + V" },
    { desc_ru: "Открыть файл", desc_en: "Open file", desc_uz: "Faylni ochish", hint_ru: "Позволяет выбрать и открыть существующий документ.", hint_en: "Allows you to select and open an existing document.", hint_uz: "Mavjud hujjatni tanlash va ochish imkonini beradi.", key: "o", shift: false, visual: "Ctrl + O" },
    { desc_ru: "Выйти из документа", desc_en: "Close document", desc_uz: "Hujjatdan chiqish", hint_ru: "Закрывает текущую вкладку или файл.", hint_en: "Closes the current tab or file.", hint_uz: "Joriy yorliq yoki faylni yopadi.", key: "w", shift: false, visual: "Ctrl + W" },
    { desc_ru: "Найти", desc_en: "Find", desc_uz: "Izlash", hint_ru: "Открывает строку поиска слов внутри документа.", hint_en: "Opens a search bar for words inside the document.", hint_uz: "Hujjat ichida so'zlarni qidirish qatorini ochadi.", key: "f", shift: false, visual: "Ctrl + F" },
    { desc_ru: "Найти и заменить", desc_en: "Find and replace", desc_uz: "Izlash va almashtirish", hint_ru: "Ищет слово и автоматически меняет его на другое.", hint_en: "Searches for a word and automatically replaces it with another.", hint_uz: "So'zni qidiradi va uni avtomatik ravishda boshqasiga almashtiradi.", key: "h", shift: false, visual: "Ctrl + H" },
    { desc_ru: "Перейти к истории (Redo)", desc_en: "Redo", desc_uz: "Qaytarish (Redo)", hint_ru: "Повторяет отмененное действие (противоположность Ctrl+Z).", hint_en: "Repeats an undone action (opposite of Ctrl+Z).", hint_uz: "Bekor qilingan harakatni qaytaradi (Ctrl+Z ning aksi).", key: "y", shift: false, visual: "Ctrl + Y" },
    { desc_ru: "Вставить гиперссылку", desc_en: "Insert hyperlink", desc_uz: "Giperhavola qo'shish", hint_ru: "Превращает текст в кликабельную ссылку на сайт.", hint_en: "Turns text into a clickable website link.", hint_uz: "Matnni bosiladigan sayt havolasiga aylantiradi.", key: "k", shift: false, visual: "Ctrl + K" },

    // --- ТРОЙНЫЕ КОМБИНАЦИИ С SHIFT ---
    // ИСПРАВЛЕННЫЕ КНОПКИ РАЗМЕРА ШРИФТА: ! (Shift+1) и ( (Shift+9)
    { desc_ru: "Увеличить размер шрифта", desc_en: "Increase font size", desc_uz: "Shrift o'lchamini kattalashtirish", hint_ru: "Делает буквы больше на один шаг размера.", hint_en: "Makes letters larger by one size step.", hint_uz: "Harflarni bir qadam kattalashtiradi.", key: "!", shift: true, visual: "Ctrl + Shift + !" },
    { desc_ru: "Уменьшить размер шрифта", desc_en: "Decrease font size", desc_uz: "Shrift o'lchamini kichiklashtirish", hint_ru: "Делает буквы меньше на один шаг размера.", hint_en: "Makes letters smaller by one size step.", hint_uz: "Harflarni bir qadam kichiklashtiradi.", key: "(", shift: true, visual: "Ctrl + Shift + (" },
    
    { desc_ru: "Двойное подчёркивание", desc_en: "Double underline", desc_uz: "Ikki marta tagiga chizish", hint_ru: "Проводит сразу две линии под текстом для сильного акцента.", hint_en: "Draws two lines under the text for strong emphasis.", hint_uz: "Kuchli urg'u berish uchun matn tagiga ikkita chiziq tortadi.", key: "d", shift: true, visual: "Ctrl + Shift + D" },
    { desc_ru: "Все прописные", desc_en: "All caps", desc_uz: "Barcha harflarni kattalashtirish", hint_ru: "Преобразует все выделенные буквы в ЗАГЛАВНЫЕ.", hint_en: "Converts all selected letters to UPPERCASE.", hint_uz: "Barcha tanlangan harflarni BOSH HARFLARGA aylantiradi.", key: "a", shift: true, visual: "Ctrl + Shift + A" },
    { desc_ru: "Подчёркивание только слов", desc_en: "Underline words only", desc_uz: "Faqat so'zlarning tagiga chizish", hint_ru: "Подчёркивает слова, игнорируя пробелы между ними.", hint_en: "Underlines words, ignoring the spaces between them.", hint_uz: "So'zlar orasidagi bo'shliqlarni inobatga olmagan holda faqat so'zlarning tagiga chizadi.", key: "w", shift: true, visual: "Ctrl + Shift + W" },

    // --- НАВИГАЦИЯ В БРАУЗЕРЕ ---
    { desc_ru: "Открыть новую вкладку", desc_en: "Open new tab", desc_uz: "Yangi yorliq ochish", hint_ru: "Создает пустую вкладку в браузере для нового сайта.", hint_en: "Creates an empty tab in the browser for a new site.", hint_uz: "Brauzerda yangi sayt uchun bo'sh yorliq yaratadi.", key: "t", shift: false, visual: "Ctrl + T" },
    { desc_ru: "Создать новый файл или окно", desc_en: "New file or window", desc_uz: "Yangi fayl yoki oyna yaratish", hint_ru: "Открывает абсолютно чистый документ или новое окно программы.", hint_en: "Opens an absolutely clean document or a new program window.", hint_uz: "Mutlaqo toza hujjat yoki dasturning yangi oynasini ochadi.", key: "n", shift: false, visual: "Ctrl + N" },
    { desc_ru: "Жирный текст", desc_en: "Bold text", desc_uz: "Qalin matn", hint_ru: "Утолщает линии букв, делая текст более заметным.", hint_en: "Thickens letter lines, making text more noticeable.", hint_uz: "Matnni ko'zga tashlanadigan qilib, harf chiziqlarini qalinlashtiradi.", key: "b", shift: false, visual: "Ctrl + B" }
];

const HotkeyTrainer = ({ onBack }) => {
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    
    // Состояния интерфейса
    const [showTheory, setShowTheory] = useState(false);
    const [lang, setLang] = useState('ru'); // 'ru', 'en', 'uz'

    // AI Состояния
    const [topic, setTopic] = useState("Microsoft Word");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);

    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert("Введите название программы!");
        setIsGenerating(true);

        // Промпт теперь требует генерацию ПОДРОБНОГО ОБЪЯСНЕНИЯ (теории) от ИИ
        const prompt = `Ты — техническая справочная система. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}".

        Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift).

        СТРОГИЕ ПРАВИЛА:
        1. НЕ ПРИДУМЫВАЙ комбинации. Только официальные.
        2. Верни сколько есть (но не меньше 5).
        3. Напиши перевод названия И ПОДРОБНОЕ ОБЪЯСНЕНИЕ (как это работает и зачем нужно) на 3 языка: русский (desc_ru, hint_ru), английский (desc_en, hint_en) и узбекский (desc_uz, hint_uz).
        4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или символ (для Shift+1 используй "!", для Shift+9 используй "(" и т.д.).
        5. Верни ТОЛЬКО чистый валидный JSON-массив объектов.

        Формат строго такой:
        [
          {
            "desc_ru": "Копировать", "desc_en": "Copy", "desc_uz": "Nusxa olish",
            "hint_ru": "Сохраняет выделенный объект в буфер обмена системы для дальнейшего использования.",
            "hint_en": "Saves the selected object to the system clipboard for later use.",
            "hint_uz": "Tanlangan obyektni keyinchalik foydalanish uchun tizim xotirasiga saqlaydi.",
            "key": "c", "shift": false, "visual": "Ctrl + C"
          }
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

    // Универсальный переключатель языков
    const renderLangSwitcher = () => (
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-body)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            {['ru', 'en', 'uz'].map(l => (
                <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                        padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                        background: lang === l ? 'var(--bg-panel)' : 'transparent',
                        color: lang === l ? 'var(--text-main)' : 'var(--text-sec)',
                        boxShadow: lang === l ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        textTransform: 'uppercase'
                    }}
                >
                    {l}
                </button>
            ))}
        </div>
    );

    // === 1. СТАРТОВЫЙ ЭКРАН (ВЫБОР ШАГА) ===
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
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                    {renderLangSwitcher()}
                </div>

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
                    <span style={{ fontSize: '10px', fontWeight: '900', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '5px 11px', borderRadius: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI powered
                    </span>
                </div>

                <p style={{ fontSize: '14.5px', color: 'var(--text-sec)', maxWidth: '460px', lineHeight: '1.6', textAlign: 'center', fontWeight: 500, margin: 0 }}>
                    Тренируй стандартную базу или создай персональную для любой программы
                </p>

                <div style={{
                    width: '100%', maxWidth: '420px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                    borderRadius: '20px', padding: '16px', marginTop: '4px'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Напр. Excel, Photoshop..."
                            style={{
                                flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600
                            }}
                            disabled={isGenerating}
                        />
                        <Button variant="muted" onClick={generateAIHotkeys} disabled={isGenerating} style={{ padding: '0 16px', borderRadius: '10px' }}>
                            {isGenerating ? "⏳" : "Создать"}
                        </Button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', width: '100%', maxWidth: '420px' }}>
                    <Button variant="muted" onClick={() => setShowTheory(true)} style={{ width: '100%', height: '54px', fontSize: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                        1. Изучить теорию 📖
                    </Button>
                    <Button variant="orange" onClick={startPractice} style={{ width: '100%', height: '54px', fontSize: '16px', borderRadius: '14px' }}>
                        2. Начать практику 🚀
                    </Button>
                    <Button variant="red" onClick={onBack} style={{ width: '100%', height: '42px', fontSize: '14px', borderRadius: '14px', background: 'transparent', border: '1px solid #ef4444', marginTop: '8px' }}>
                        Назад
                    </Button>
                </div>
            </motion.div>
        );
    }

    // === 2. ЭКРАН ТЕОРИИ (С ИИ-ПОДСКАЗКАМИ) ===
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
                        📖 Теория: {activeHotkeys !== HOTKEYS_DB ? topic : 'База'}
                    </h2>
                    {renderLangSwitcher()}
                </header>

                <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeHotkeys.map((hk, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 20px', background: 'var(--bg-body)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                                    {hk[`desc_${lang}`] || hk.desc_ru}
                                </span>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-glow, #0ea5e9)', background: 'var(--bg-panel)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.15)' }}>
                                    {hk.visual}
                                </span>
                            </div>
                            {/* Вывод теории (что да и как) от ИИ или из базы */}
                            <div style={{ fontSize: '13.5px', color: 'var(--text-sec)', lineHeight: '1.5', fontWeight: '500', background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: '8px' }}>
                                💡 {hk[`hint_${lang}`] || hk.hint_ru}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                    <Button variant="orange" onClick={startPractice} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px' }}>
                        Перейти к практике 🚀
                    </Button>
                    <Button variant="muted" onClick={() => setShowTheory(false)} style={{ flex: 0.3, height: '52px', fontSize: '16px', borderRadius: '14px' }}>
                        В меню
                    </Button>
                </div>
            </motion.div>
        );
    }

    // === 3. ЭКРАН ПРАКТИКИ ===
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Практика ⚡
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {renderLangSwitcher()}
                    <div style={{
                        fontSize: '15px', fontWeight: 800, color: 'var(--text-sec)', background: 'var(--bg-body)',
                        border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '7px 14px'
                    }}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{ padding: '0 16px', height: '38px', minHeight: '38px', fontSize: '13px', borderRadius: '10px' }}>В меню</Button>
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
                        «{currentTask[`desc_${lang}`] || currentTask.desc_ru}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px', fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>
                            Ctrl
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.6 }}>+</div>

                        {currentTask.shift && (
                            <>
                                <div style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px', fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>
                                    Shift
                                </div>
                                <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.6 }}>+</div>
                            </>
                        )}

                        <motion.div
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                            style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '2px dashed var(--accent-glow, #0ea5e9)', borderRadius: '14px', fontSize: '22px', fontWeight: '800', color: 'var(--accent-glow, #0ea5e9)' }}
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
