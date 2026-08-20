const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, Input, shuffleArray } = window; // Добавили Input из window

// СЛОВАРЬ ИНТЕРФЕЙСА (RU, EN, UZ-Кириллица)
const UI_DICT = {
    ru: {
        title: "Хоткеи", aiBadge: "AI powered",
        subtitle: "Тренируй стандартную базу (Word, Система) или создай персональную",
        magic: "Своя база для другой программы", searchPlaceholder: "Напр. Word, Excel, Photoshop...",
        btnGen: "Создать базу", btnLoading: "Ищем...",
        theoryTitle: "Теория: изучите перед практикой",
        startPractice: "🚀 Начать тренировку",
        task: "Выполните комбинацию", exit: "Назад",
        success: "Отличная работа!", successSub: "Вы успешно закрепили в мышечной памяти хоткеев:",
        playAgain: "Пройти ещё раз"
    },
    en: {
        title: "Hotkeys", aiBadge: "AI powered",
        subtitle: "Train standard base (Word, System) or create a custom one",
        magic: "Custom base for another program", searchPlaceholder: "E.g. Word, Excel, Photoshop...",
        btnGen: "Generate", btnLoading: "Searching...",
        theoryTitle: "Theory: study before practice",
        startPractice: "🚀 Start Training",
        task: "Execute combination", exit: "Back",
        success: "Great job!", successSub: "You've successfully built muscle memory for hotkeys:",
        playAgain: "Play Again"
    },
    uz: {
        title: "Хоткейлар", aiBadge: "AI powered",
        subtitle: "Стандарт базани машқ қилинг ёки ўзингиз учун янгисини яратинг",
        magic: "Бошқа дастур учун база яратиш", searchPlaceholder: "Мас. Word, Excel, Photoshop...",
        btnGen: "База яратиш", btnLoading: "Қидирилмоқда...",
        theoryTitle: "Назария: амалиётдан олдин ўрганиб чиқинг",
        startPractice: "🚀 Машқни бошлаш",
        task: "Комбинацияни бажаринг", exit: "Орқага",
        success: "Ажойиб иш!", successSub: "Сиз мушаклар хотирасида муваффақиятли мустаҳкамлаган хоткейлар:",
        playAgain: "Яна ўйнаш"
    }
};

// ТВОЯ УЛЬТИМАТИВНАЯ БАЗА (Переведена на 3 языка + добавлена теория)
const HOTKEYS_DB = [
    { key: "r", shift: false, visual: "Ctrl + R", desc: { ru: "По правому краю", en: "Align Right", uz: "Ўнгга текислаш" }, theory: { ru: "Выравнивает выделенный абзац по правой стороне документа.", en: "Aligns the selected paragraph to the right.", uz: "Танланган абзацни ҳужжатнинг ўнг томонига текислайди." } },
    { key: "l", shift: false, visual: "Ctrl + L", desc: { ru: "По левому краю", en: "Align Left", uz: "Чапга текислаш" }, theory: { ru: "Выравнивает выделенный абзац по левой стороне документа.", en: "Aligns the selected paragraph to the left.", uz: "Танланган абзацни ҳужжатнинг чап томонига текислайди." } },
    { key: "z", shift: false, visual: "Ctrl + Z", desc: { ru: "Отменить действие", en: "Undo", uz: "Амални бекор қилиш" }, theory: { ru: "Отменяет последнее выполненное действие или удаленный текст.", en: "Undoes the last action performed.", uz: "Охирги қилинган амални ёки ўчирилган матнни бекор қилади." } },
    { key: "x", shift: false, visual: "Ctrl + X", desc: { ru: "Вырезать", en: "Cut", uz: "Кесиб олиш" }, theory: { ru: "Удаляет выделенный элемент и помещает его в буфер обмена.", en: "Removes the item and places it on the clipboard.", uz: "Элементни ўчириб, хотирага сақлайди." } },
    { key: "e", shift: false, visual: "Ctrl + E", desc: { ru: "По центру", en: "Align Center", uz: "Марказга текислаш" }, theory: { ru: "Центрирует текст по ширине страницы.", en: "Centers the text horizontally.", uz: "Матнни саҳифа марказига жойлаштиради." } },
    { key: "a", shift: false, visual: "Ctrl + A", desc: { ru: "Выделить всё", en: "Select All", uz: "Барчасини танлаш" }, theory: { ru: "Выделяет весь текст или все элементы в активном окне.", en: "Selects all text or items in the window.", uz: "Ойнадаги барча матн ёки элементларни танлайди." } },
    { key: "i", shift: false, visual: "Ctrl + I", desc: { ru: "Курсив", en: "Italic", uz: "Курсив матн" }, theory: { ru: "Применяет или снимает курсивное начертание для выделенного текста.", en: "Applies or removes italic formatting.", uz: "Танланган матнни ётиқ (курсив) қилади." } },
    { key: "p", shift: false, visual: "Ctrl + P", desc: { ru: "Печать", en: "Print", uz: "Чоп этиш" }, theory: { ru: "Открывает диалоговое окно настройки печати документа.", en: "Opens the print dialog for the document.", uz: "Ҳужжатни чоп этиш ойнасини очади." } },
    { key: "u", shift: false, visual: "Ctrl + U", desc: { ru: "Подчеркнутый", en: "Underline", uz: "Ости чизилган" }, theory: { ru: "Добавляет сплошную линию под выделенным текстом.", en: "Adds a solid line under the text.", uz: "Матн тагига чизиқ тортади." } },
    { key: "s", shift: false, visual: "Ctrl + S", desc: { ru: "Сохранить", en: "Save", uz: "Сақлаш" }, theory: { ru: "Сохраняет текущий прогресс в открытом документе или файле.", en: "Saves the current document or file.", uz: "Жорий ҳужжат ёки файлни сақлайди." } },
    { key: "c", shift: false, visual: "Ctrl + C", desc: { ru: "Копировать", en: "Copy", uz: "Нусха олиш" }, theory: { ru: "Копирует выделенный элемент в буфер обмена без удаления.", en: "Copies the selected item to the clipboard.", uz: "Танланган элементни ўчирмасдан вақтинчалик хотирага нусхалайди." } },
    { key: "v", shift: false, visual: "Ctrl + V", desc: { ru: "Вставить", en: "Paste", uz: "Жойлаш" }, theory: { ru: "Вставляет последний скопированный или вырезанный элемент.", en: "Pastes the copied item from the clipboard.", uz: "Нусхаланган ёки кесилган элементни жойлайди." } },
    { key: "o", shift: false, visual: "Ctrl + O", desc: { ru: "Открыть файл", en: "Open file", uz: "Файлни очиш" }, theory: { ru: "Открывает окно для выбора и открытия существующего файла.", en: "Opens a dialog to select and open a file.", uz: "Мавжуд файлни танлаш ва очиш учун ойнани очади." } },
    { key: "w", shift: false, visual: "Ctrl + W", desc: { ru: "Закрыть документ", en: "Close document", uz: "Ҳужжатни ёпиш" }, theory: { ru: "Закрывает активный документ или вкладку в браузере.", en: "Closes the active document or tab.", uz: "Фаол ҳужжат ёки ойнани ёпади." } },
    { key: "f", shift: false, visual: "Ctrl + F", desc: { ru: "Найти", en: "Find", uz: "Қидириш" }, theory: { ru: "Открывает панель для быстрого поиска слов в тексте.", en: "Opens the find/search panel.", uz: "Матн бўйлаб сўзларни қидириш панелини очади." } },
    { key: "h", shift: false, visual: "Ctrl + H", desc: { ru: "Найти и заменить", en: "Find & Replace", uz: "Қидириш ва алмаштириш" }, theory: { ru: "Открывает окно, позволяющее найти текст и заменить его на другой.", en: "Opens the find and replace dialog.", uz: "Топилган матнни бошқасига алмаштириш ойнасини очади." } },
    { key: "y", shift: false, visual: "Ctrl + Y", desc: { ru: "Повторить (Redo)", en: "Redo", uz: "Қайтариш (Redo)" }, theory: { ru: "Повторяет отмененное ранее действие (возвращает шаг вперед).", en: "Redoes an undone action.", uz: "Олдин бекор қилинган амални қайта бажаради." } },
    { key: "k", shift: false, visual: "Ctrl + K", desc: { ru: "Гиперссылка", en: "Hyperlink", uz: "Ҳавола қўшиш" }, theory: { ru: "Вставляет кликабельную ссылку (URL) в выделенный текст.", en: "Inserts a clickable link.", uz: "Танланган матнга босиладиган ҳавола қўшади." } },
    { key: ">", shift: true, visual: "Ctrl + Shift + >", desc: { ru: "Увеличить шрифт", en: "Increase font", uz: "Шрифтни катталаштириш" }, theory: { ru: "Увеличивает размер выделенного текста на один шаг.", en: "Increases the font size by one step.", uz: "Танланган матн ҳажмини бир қадамга катталаштиради." } },
    { key: "<", shift: true, visual: "Ctrl + Shift + <", desc: { ru: "Уменьшить шрифт", en: "Decrease font", uz: "Шрифтни кичрайтириш" }, theory: { ru: "Уменьшает размер выделенного текста на один шаг.", en: "Decreases the font size by one step.", uz: "Танланган матн ҳажмини бир қадамга кичрайтиради." } },
    { key: "d", shift: true, visual: "Ctrl + Shift + D", desc: { ru: "Двойное подчеркивание", en: "Double underline", uz: "Иккиталик ости чизиқ" }, theory: { ru: "Добавляет двойную сплошную линию под выделенным текстом.", en: "Adds a double solid line under the text.", uz: "Танланган матн остига иккиталик чизиқ тортади." } },
    { key: "a", shift: true, visual: "Ctrl + Shift + A", desc: { ru: "Все прописные", en: "All caps", uz: "Барчасини бош ҳарфда" }, theory: { ru: "Преобразует все выделенные строчные буквы в ЗАГЛАВНЫЕ.", en: "Converts all selected lowercase letters to UPPERCASE.", uz: "Барча кичик ҳарфларни БОШ ҳарфларга айлантиради." } },
    { key: "w", shift: true, visual: "Ctrl + Shift + W", desc: { ru: "Подчеркивание только слов", en: "Underline words", uz: "Сўзларни остини чизиш" }, theory: { ru: "Подчеркивает слова, но не подчеркивает пробелы между ними.", en: "Underlines words, but not the spaces between them.", uz: "Фақат сўзларнинг остига чизиқ тортади, бўш жойларни эмас." } },
    { key: "t", shift: false, visual: "Ctrl + T", desc: { ru: "Новая вкладка", en: "New tab", uz: "Янги ойна" }, theory: { ru: "Открывает новую вкладку в интернет-браузере.", en: "Opens a new tab in the web browser.", uz: "Браузерда янги саҳифа очади." } },
    { key: "n", shift: false, visual: "Ctrl + N", desc: { ru: "Новый файл/окно", en: "New file", uz: "Янги файл" }, theory: { ru: "Создает новый пустой документ или открывает новое окно программы.", en: "Creates a new blank document or opens a new window.", uz: "Янги бўш ҳужжат яратади ёки янги дастур ойнасини очади." } },
    { key: "b", shift: false, visual: "Ctrl + B", desc: { ru: "Жирный текст", en: "Bold", uz: "Қалин матн" }, theory: { ru: "Применяет или снимает жирное начертание для выделенного текста.", en: "Applies or removes bold formatting.", uz: "Танланган матнни қалин қилади ёки оддий ҳолатга қайтаради." } }
];

const HotkeyTrainer = ({ onBack }) => {
    const [lang, setLang] = useState('ru'); // СОСТОЯНИЕ ЯЗЫКА
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const [topic, setTopic] = useState(""); // Убрали "Microsoft Word" из начального значения, чтобы placeholder работал
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);

    // Вспомогательная функция для безопасного доставания перевода
    const t = (obj) => {
        if (!obj) return "";
        if (typeof obj === 'string') return obj;
        return obj[lang] || obj.ru || "";
    };

    // ФУНКЦИЯ ГЕНЕРАЦИИ БАЗЫ ЧЕРЕЗ ИИ (С ТЕОРИЕЙ И МУЛЬТИЯЗЫЧНОСТЬЮ)
    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert("Введите название программы!");
        setIsGenerating(true);

        const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций.

        Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${topic}".

        СТРОГИЕ ПРАВИЛА (нарушение недопустимо):
        1. НЕ ПРИДУМЫВАЙ комбинации. Используй только официальные.
        2. Никакой отсебятины в описаниях: поле "desc" должно точно описывать действие на 3 языках (ru, en, uz). Узбекский писать СТРОГО НА КИРИЛЛИЦЕ.
        3. Добавь поле "theory": короткое и понятное объяснение, зачем нужен этот хоткей. На 3 языках (ru, en, uz кириллицей).
        4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или символ (без плюсов, без Ctrl).
        5. Не повторяй одну и ту же комбинацию дважды.
        6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Без markdown.

        Формат строго такой:
        [
          {
            "key": "c",
            "shift": false,
            "visual": "Ctrl + C",
            "desc": { "ru": "Копировать", "en": "Copy", "uz": "Нусха олиш" },
            "theory": { "ru": "Копирует выделенный элемент.", "en": "Copies the selected item.", "uz": "Танланган элементни нусхалайди." }
          }
        ]`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("JSON не найден");

            const parsedHotkeys = JSON.parse(jsonMatch[0]);
            const validatedHotkeys = parsedHotkeys.map(hk => ({ ...hk, key: hk.key.toLowerCase() }));
            
            if (Array.isArray(validatedHotkeys) && validatedHotkeys.length > 0) {
                setActiveHotkeys(validatedHotkeys);
            } else {
                throw new Error("Неверный формат данных");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Не удалось сгенерировать. Попробуй переформулировать запрос.");
            setActiveHotkeys(HOTKEYS_DB);
        } finally {
            setIsGenerating(false);
        }
    };

    const startGame = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setCurrentIndex(0); setScore(0); setIsFinished(false); setGameStarted(true);
    };

    const leaveGame = () => {
        setGameStarted(false); setActiveHotkeys(HOTKEYS_DB);
    };

    useEffect(() => {
        if (!gameStarted || isFinished || tasks.length === 0) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (["Control", "Meta", "Shift", "Alt"].includes(e.key)) return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const currentTask = tasks[currentIndex];

            if (isCtrlOrCmd) {
                e.preventDefault();
                const requiresShift = !!currentTask.shift;
                if (e.shiftKey === requiresShift && e.key.toLowerCase() === currentTask.key.toLowerCase()) {
                    setSuccessPulse(true); setScore(p => p + 1);
                    setTimeout(() => setSuccessPulse(false), 200);
                    if (currentIndex < tasks.length - 1) setCurrentIndex(p => p + 1);
                    else setIsFinished(true);
                } else {
                    setShake(true); setTimeout(() => setShake(false), 300);
                }
            } else {
                setShake(true); setTimeout(() => setShake(false), 300);
            }
        };

        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, tasks, isFinished, gameStarted]);

    // === ЭКРАН 1: ТЕОРИЯ И ВЫБОР ===
    if (!gameStarted) {
        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '22px', padding: '34px', margin: '0 auto', position: 'relative' }}
            >
                {/* ШАПКА И СТИЛЬНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКОВ (КАК ТЫ ПРОСИЛ) */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', boxShadow: '0 10px 24px -8px rgba(253,160,133,0.6)' }}>⚡</div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: 'var(--text-main)' }}>{UI_DICT[lang].title}</h2>
                                <span style={{ fontSize: '10px', fontWeight: '900', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>{UI_DICT[lang].aiBadge}</span>
                            </div>
                            <div style={{ fontSize: '13.5px', color: 'var(--text-sec)', fontWeight: 600, marginTop: '2px' }}>{UI_DICT[lang].subtitle}</div>
                        </div>
                    </div>

                    {/* Идеальный переключатель (RU EN UZ) */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-body)', padding: '4px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                        {[ { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' } ].map(item => {
                            const isActive = lang === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setLang(item.id)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '10px', 
                                        background: isActive ? '#10b981' : 'transparent', 
                                        border: 'none', color: isActive ? '#ffffff' : 'var(--text-sec)', 
                                        fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                                        transition: 'all 0.2s', outline: 'none'
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </header>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ ИИ */}
                <div style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '22px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ flexShrink: 0, fontSize: '26px' }}>🤖</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                {UI_DICT[lang].magic}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <Input
                                    type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                                    placeholder={UI_DICT[lang].searchPlaceholder}
                                    style={{ flex: '1 1 180px', margin: 0 }}
                                    disabled={isGenerating}
                                />
                                <Button onClick={generateAIHotkeys} disabled={isGenerating} style={{ padding: '0 22px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', height: '46px', margin: 0 }}>
                                    {isGenerating ? UI_DICT[lang].btnLoading : UI_DICT[lang].btnGen}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* БЛОК ТЕОРИИ С КАРТОЧКАМИ */}
                <div style={{ marginTop: '5px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '17px', color: 'var(--text-main)', fontWeight: 800 }}>📚 {UI_DICT[lang].theoryTitle} {activeHotkeys !== HOTKEYS_DB && topic ? `(${topic})` : ''}</h3>
                    
                    <div className="modern-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', maxHeight: '420px', overflowY: 'auto', paddingRight: '10px' }}>
                        {activeHotkeys.map((hk, idx) => (
                            <div key={idx} style={{ background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>{t(hk.desc)}</span>
                                    <span style={{ background: 'var(--bg-body)', color: '#fda085', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, fontFamily: 'monospace' }}>
                                        {hk.visual}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13.5px', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                                    {t(hk.theory)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* КНОПКИ УПРАВЛЕНИЯ (СТРОГО РОДНОЙ КОМПОНЕНТ BUTTON) */}
                <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '420px', justifyContent: 'center', margin: '0 auto', marginTop: '10px' }}>
                    <Button variant="orange" onClick={startGame} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px', margin: 0 }}>
                        {UI_DICT[lang].startPractice}
                    </Button>
                    <Button variant="red" onClick={onBack} style={{ flex: 1, height: '52px', fontSize: '16px', borderRadius: '14px', margin: 0 }}>
                        {UI_DICT[lang].exit}
                    </Button>
                </div>
            </motion.div>
        );
    }

    // === ЭКРАН 2: ПРАКТИКА (ИГРА) ===
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
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {activeHotkeys !== HOTKEYS_DB ? `Хоткеи: ${topic}` : `⚡ ${UI_DICT[lang].title}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-sec)', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '7px 14px' }}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <Button variant="muted" onClick={leaveGame} style={{ padding: '0 16px', height: '38px', minHeight: '38px', fontSize: '13px', borderRadius: '10px', margin: 0 }}>
                        {UI_DICT[lang].exit}
                    </Button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '10px 0' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', textAlign: 'center' }}>
                        {UI_DICT[lang].task}
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)', maxWidth: '85%', letterSpacing: '-0.3px' }}
                    >
                        «{t(currentTask.desc)}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px', fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
                            Ctrl
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.6 }}>+</div>

                        {currentTask.shift && (
                            <>
                                <div style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px', fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
                                    Shift
                                </div>
                                <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.6 }}>+</div>
                            </>
                        )}

                        <motion.div
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                            style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '2px dashed var(--accent-glow, #0ea5e9)', borderRadius: '14px', fontSize: '22px', fontWeight: '800', color: 'var(--accent-glow, #0ea5e9)', boxShadow: 'inset 0 0 14px rgba(14,165,233,0.15)' }}
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
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 12px 30px -10px rgba(16,185,129,0.6)' }}>
                        🎉
                    </div>
                    <h2 style={{ fontSize: '38px', margin: 0, fontWeight: 900, color: '#10b981', letterSpacing: '-0.5px' }}>{UI_DICT[lang].success}</h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                        {UI_DICT[lang].successSub} <strong style={{color: 'var(--text-main)'}}>{score}</strong>
                    </p>
                    <Button variant="orange" onClick={resetGame} style={{ width: '260px', marginTop: '18px', height: '50px', borderRadius: '14px', fontSize: '15px', margin: '0 auto' }}>
                        {UI_DICT[lang].playAgain}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
