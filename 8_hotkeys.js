const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, Input, shuffleArray } = window; // Убедись, что Input импортируется!

// СЛОВАРЬ ПЕРЕВОДОВ ИНТЕРФЕЙСА
const UI_DICT = {
    ru: {
        title: "Тренажер Хоткеев", subtitle: "Умная практика горячих клавиш",
        magic: "Создать свою базу (ИИ)", searchPlaceholder: "Напр. VS Code, Photoshop...",
        btnGen: "Создать", btnLoading: "Ищем...",
        theoryTitle: "Теория: Изучите перед практикой",
        startPractice: "🚀 Начать тренировку",
        task: "Выполните комбинацию", exit: "Выйти",
        success: "Отличная работа! 🎉", successSub: "Вы успешно закрепили в мышечной памяти хоткеев:",
        playAgain: "Пройти ещё раз"
    },
    en: {
        title: "Hotkey Trainer", subtitle: "Smart shortcut practice",
        magic: "Create custom base (AI)", searchPlaceholder: "E.g. VS Code, Photoshop...",
        btnGen: "Generate", btnLoading: "Searching...",
        theoryTitle: "Theory: Study before practice",
        startPractice: "🚀 Start Practice",
        task: "Execute combination", exit: "Exit",
        success: "Great job! 🎉", successSub: "You successfully built muscle memory for hotkeys:",
        playAgain: "Play Again"
    },
    uz: {
        title: "Хоткей Тренажёри", subtitle: "Қайноқ тугмаларни ақлли машқ қилиш",
        magic: "Ўз базангизни яратинг (AI)", searchPlaceholder: "Мас. VS Code, Photoshop...",
        btnGen: "Яратиш", btnLoading: "Қидирилмоқда...",
        theoryTitle: "Назария: Амалиётдан олдин ўрганиб чиқинг",
        startPractice: "🚀 Машқни бошлаш",
        task: "Комбинацияни бажаринг", exit: "Чиқиш",
        success: "Ажойиб иш! 🎉", successSub: "Сиз мушаклар хотирасида муваффақиятли мустаҳкамлаган хоткейлар:",
        playAgain: "Яна ўйнаш"
    }
};

// БАЗА ДАННЫХ ХОТКЕЕВ (ПЕРЕВЕДЕНА И ДОПОЛНЕНА ТЕОРИЕЙ)
const HOTKEYS_DB = [
    { key: "c", shift: false, visual: "Ctrl + C", desc: { ru: "Копировать", en: "Copy", uz: "Нусха олиш" }, theory: { ru: "Копирует выделенный элемент в буфер обмена.", en: "Copies the selected item to the clipboard.", uz: "Танланган элементни вақтинчалик хотирага нусхалайди." } },
    { key: "v", shift: false, visual: "Ctrl + V", desc: { ru: "Вставить", en: "Paste", uz: "Жойлаш" }, theory: { ru: "Вставляет скопированный элемент из буфера обмена.", en: "Pastes the copied item from the clipboard.", uz: "Нусхаланган элементни хотирадан жойлайди." } },
    { key: "x", shift: false, visual: "Ctrl + X", desc: { ru: "Вырезать", en: "Cut", uz: "Кесиб олиш" }, theory: { ru: "Удаляет выделенный элемент и помещает его в буфер обмена.", en: "Removes the item and places it on the clipboard.", uz: "Элементни ўчириб, хотирага сақлайди." } },
    { key: "z", shift: false, visual: "Ctrl + Z", desc: { ru: "Отменить действие", en: "Undo", uz: "Амални бекор қилиш" }, theory: { ru: "Отменяет последнее выполненное действие.", en: "Undoes the last action performed.", uz: "Охирги қилинган амални бекор қилади." } },
    { key: "y", shift: false, visual: "Ctrl + Y", desc: { ru: "Повторить действие", en: "Redo", uz: "Амални қайтариш" }, theory: { ru: "Повторяет отмененное действие.", en: "Redoes an undone action.", uz: "Бекор қилинган амални қайта бажаради." } },
    { key: "a", shift: false, visual: "Ctrl + A", desc: { ru: "Выделить всё", en: "Select All", uz: "Барчасини танлаш" }, theory: { ru: "Выделяет весь текст или все элементы в окне.", en: "Selects all text or items in the window.", uz: "Ойнадаги барча матн ёки элементларни танлайди." } },
    { key: "s", shift: false, visual: "Ctrl + S", desc: { ru: "Сохранить", en: "Save", uz: "Сақлаш" }, theory: { ru: "Сохраняет текущий документ или файл.", en: "Saves the current document or file.", uz: "Жорий ҳужжат ёки файлни сақлайди." } },
    { key: "p", shift: false, visual: "Ctrl + P", desc: { ru: "Печать", en: "Print", uz: "Чоп этиш" }, theory: { ru: "Открывает окно настройки печати документа.", en: "Opens the print dialog for the document.", uz: "Ҳужжатни чоп этиш ойнасини очади." } },
    { key: "f", shift: false, visual: "Ctrl + F", desc: { ru: "Найти", en: "Find", uz: "Қидириш" }, theory: { ru: "Открывает панель поиска по тексту.", en: "Opens the find/search panel.", uz: "Матн бўйлаб қидириш панелини очади." } },
    { key: "h", shift: false, visual: "Ctrl + H", desc: { ru: "Найти и заменить", en: "Find & Replace", uz: "Қидириш ва алмаштириш" }, theory: { ru: "Открывает окно замены найденного текста на другой.", en: "Opens the find and replace dialog.", uz: "Топилган матнни бошқасига алмаштириш ойнасини очади." } },
    { key: "b", shift: false, visual: "Ctrl + B", desc: { ru: "Жирный текст", en: "Bold", uz: "Қалин матн" }, theory: { ru: "Делает выделенный шрифт жирным.", en: "Makes the selected text bold.", uz: "Танланган матнни қалин қилади." } },
    { key: "i", shift: false, visual: "Ctrl + I", desc: { ru: "Курсив", en: "Italic", uz: "Курсив" }, theory: { ru: "Делает шрифт наклонным (курсивом).", en: "Italicizes the selected text.", uz: "Матнни ётиқ (курсив) қилади." } },
    { key: "u", shift: false, visual: "Ctrl + U", desc: { ru: "Подчеркнутый", en: "Underline", uz: "Ости чизилган" }, theory: { ru: "Добавляет линию под выделенным текстом.", en: "Adds a line under the text.", uz: "Матн тагига чизиқ тортади." } },
    { key: "l", shift: false, visual: "Ctrl + L", desc: { ru: "По левому краю", en: "Align Left", uz: "Чапга текислаш" }, theory: { ru: "Выравнивает абзац по левой стороне.", en: "Aligns paragraph to the left.", uz: "Матнни чап томонга текислайди." } },
    { key: "r", shift: false, visual: "Ctrl + R", desc: { ru: "По правому краю", en: "Align Right", uz: "Ўнгга текислаш" }, theory: { ru: "Выравнивает абзац по правой стороне.", en: "Aligns paragraph to the right.", uz: "Матнни ўнг томонга текислайди." } },
    { key: "e", shift: false, visual: "Ctrl + E", desc: { ru: "По центру", en: "Align Center", uz: "Марказга текислаш" }, theory: { ru: "Центрирует текст на странице.", en: "Centers the text.", uz: "Матнни саҳифа марказига жойлаштиради." } },
    { key: "k", shift: false, visual: "Ctrl + K", desc: { ru: "Гиперссылка", en: "Hyperlink", uz: "Ҳавола қўшиш" }, theory: { ru: "Вставляет кликабельную ссылку в текст.", en: "Inserts a clickable link.", uz: "Матнга босиладиган ҳавола қўшади." } },
    { key: "t", shift: false, visual: "Ctrl + T", desc: { ru: "Новая вкладка", en: "New Tab", uz: "Янги ойна" }, theory: { ru: "Открывает новую вкладку в браузере.", en: "Opens a new browser tab.", uz: "Браузерда янги саҳифа очади." } },
    { key: "n", shift: false, visual: "Ctrl + N", desc: { ru: "Новый файл", en: "New File", uz: "Янги файл" }, theory: { ru: "Создает новый пустой документ.", en: "Creates a new blank document.", uz: "Янги бўш ҳужжат яратади." } },
    { key: "w", shift: false, visual: "Ctrl + W", desc: { ru: "Закрыть окно", en: "Close Window", uz: "Ойнани ёпиш" }, theory: { ru: "Закрывает активную вкладку или документ.", en: "Closes active tab or document.", uz: "Фаол ойна ёки ҳужжатни ёпади." } },
    { key: ">", shift: true, visual: "Ctrl + Shift + >", desc: { ru: "Увеличить шрифт", en: "Increase Font", uz: "Шрифтни катталаштириш" }, theory: { ru: "Увеличивает размер выделенного текста.", en: "Increases the font size.", uz: "Танланган матн ҳажмини катталаштиради." } },
    { key: "<", shift: true, visual: "Ctrl + Shift + <", desc: { ru: "Уменьшить шрифт", en: "Decrease Font", uz: "Шрифтни кичрайтириш" }, theory: { ru: "Уменьшает размер выделенного текста.", en: "Decreases the font size.", uz: "Танланган матн ҳажмини кичрайтиради." } }
];

const HotkeyTrainer = ({ onBack }) => {
    const [lang, setLang] = useState('ru'); 
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);

    const t = (obj) => {
        if (!obj) return "";
        if (typeof obj === 'string') return obj;
        return obj[lang] || obj.ru || "";
    };

    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert("Введите название программы!");
        setIsGenerating(true);

        const prompt = `Ты — техническая справочная система. Верни 10 реальных горячих клавиш для программы "${topic}".
        Верни ТОЛЬКО валидный JSON-массив строго в таком формате:
        [
          {
            "key": "c",
            "shift": false,
            "visual": "Ctrl + C",
            "desc": {
              "ru": "Копировать", "en": "Copy", "uz": "Нусха олиш"
            },
            "theory": {
              "ru": "Копирует выделенный элемент.", "en": "Copies item.", "uz": "Элементни нусхалайди."
            }
          }
        ]
        ПРАВИЛА:
        1. Только реальные хоткеи (с Ctrl или Cmd, иногда с Shift).
        2. "key" — ОДНА строчная буква или символ.
        3. Все переводы должны быть точными. Узбекский писать на КИРИЛЛИЦЕ.`;

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

            const parsedHotkeys = JSON.parse(jsonMatch[0]).map(hk => ({ ...hk, key: hk.key.toLowerCase() }));
            setActiveHotkeys(parsedHotkeys);
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Не удалось сгенерировать. Оставляем базовую версию.");
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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '22px', padding: '34px', margin: '0 auto', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '24px' }}
            >
                {/* ШАПКА И ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКОВ */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', boxShadow: '0 4px 10px rgba(253, 160, 133, 0.3)' }}>⚡</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>{UI_DICT[lang].title}</h2>
                            <div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600 }}>{UI_DICT[lang].subtitle}</div>
                        </div>
                    </div>

                    {/* СТИЛЬНЫЙ СЕГМЕНТНЫЙ ПЕРЕКЛЮЧАТЕЛЬ КАК НА СКРИНШОТЕ */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-body)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        {[ { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' } ].map(item => {
                            const isActive = lang === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setLang(item.id)}
                                    style={{
                                        padding: '6px 14px', 
                                        borderRadius: '8px', 
                                        background: isActive ? '#10b981' : 'transparent', 
                                        color: isActive ? '#ffffff' : 'var(--text-sec)', 
                                        fontWeight: 800, 
                                        fontSize: '12px', 
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                                    }}
                                >
                                    {item.label}
                                </div>
                            );
                        })}
                    </div>
                </header>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ ИИ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-body)', padding: '20px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ flexShrink: 0, fontSize: '24px' }}>🤖</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '8px' }}>{UI_DICT[lang].magic}</div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Input
                                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                                placeholder={UI_DICT[lang].searchPlaceholder}
                                style={{ flex: '1 1 200px', margin: 0 }}
                                disabled={isGenerating}
                            />
                            <Button variant="orange" onClick={generateAIHotkeys} disabled={isGenerating} style={{ padding: '0 25px', height: '46px', margin: 0 }}>
                                {isGenerating ? UI_DICT[lang].btnLoading : UI_DICT[lang].btnGen}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* БЛОК ТЕОРИИ */}
                <div>
                    <h3 style={{ margin: '10px 0 15px 0', fontSize: '18px', color: 'var(--text-main)', fontWeight: 700 }}>📚 {UI_DICT[lang].theoryTitle} {activeHotkeys !== HOTKEYS_DB ? `(${topic})` : ''}</h3>
                    <div className="modern-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                        {activeHotkeys.map((hk, idx) => (
                            <div key={idx} style={{ background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>{t(hk.desc)}</span>
                                    <span style={{ background: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, fontFamily: 'monospace' }}>
                                        {hk.visual}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                                    {t(hk.theory)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* КНОПКА СТАРТА */}
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '15px', borderTop: '1px solid var(--glass-border)', paddingTop: '25px' }}>
                    <Button variant="green" onClick={startGame} style={{ width: '280px', height: '54px', fontSize: '16px', borderRadius: '14px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {UI_DICT[lang].startPractice}
                    </Button>
                    <Button variant="muted" onClick={onBack} style={{ height: '54px', borderRadius: '14px', margin: 0 }}>
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
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '26px', padding: '32px', margin: '0 auto', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '24px' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '18px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {activeHotkeys !== HOTKEYS_DB ? `${UI_DICT[lang].title}: ${topic}` : `⚡ ${UI_DICT[lang].title}`}
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '20px 0' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', textAlign: 'center' }}>
                        {UI_DICT[lang].task}
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)', maxWidth: '85%' }}
                    >
                        «{t(currentTask.desc)}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                        <div style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 6px 16px rgba(0,0,0,0.05)' }}>
                            Ctrl
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-sec)' }}>+</div>

                        {currentTask.shift && (
                            <>
                                <div style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '1.5px solid var(--glass-border)', borderRadius: '14px', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 6px 16px rgba(0,0,0,0.05)' }}>
                                    Shift
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-sec)' }}>+</div>
                            </>
                        )}

                        <motion.div
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                            style={{ padding: '16px 26px', background: 'var(--bg-body)', border: '2px dashed #10b981', borderRadius: '14px', fontSize: '24px', fontWeight: '800', color: '#10b981', boxShadow: 'inset 0 0 14px rgba(16,185,129,0.1)' }}
                        >
                            ?
                        </motion.div>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-body)', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
                        <motion.div
                            initial={{ width: `${progress}%` }} animate={{ width: `${(currentIndex / tasks.length) * 100}%` }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #f6d365, #fda085)', borderRadius: '8px' }}
                        />
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}
                    style={{ textAlign: 'center', padding: '50px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 12px 30px -10px rgba(16,185,129,0.6)' }}>
                        🎉
                    </div>
                    <h2 style={{ fontSize: '40px', margin: 0, fontWeight: 900, color: '#10b981' }}>{UI_DICT[lang].success}</h2>
                    <p style={{ fontSize: '18px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                        {UI_DICT[lang].successSub} <strong style={{color: 'var(--text-main)'}}>{score}</strong>
                    </p>
                    <Button variant="orange" onClick={startGame} style={{ width: '280px', marginTop: '20px', height: '56px', borderRadius: '14px', fontSize: '16px', margin: '0 auto' }}>
                        {UI_DICT[lang].playAgain}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
