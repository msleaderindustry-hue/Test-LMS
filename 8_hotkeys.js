const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { shuffleArray } = window; // Убрали Button, чтобы не конфликтовало со стилями!

// СЛОВАРЬ ПЕРЕВОДОВ ИНТЕРФЕЙСА (С УЗБЕКСКОЙ КИРИЛЛИЦЕЙ!)
const UI_DICT = {
    ru: {
        title: "Тренажер Хоткеев", subtitle: "Умная практика горячих клавиш",
        magic: "Магия ИИ", searchPlaceholder: "Напр. Word, Chrome...",
        btnGen: "Создать базу", btnLoading: "Ищем...",
        theoryTitle: "Теория: Изучите перед практикой",
        startPractice: "🚀 Начать тренировку",
        task: "Выполните комбинацию", exit: "Назад",
        success: "Отличная работа! 🎉", successSub: "Вы успешно закрепили в мышечной памяти хоткеев:",
        playAgain: "Пройти ещё раз"
    },
    en: {
        title: "Hotkey Trainer", subtitle: "Smart shortcut practice",
        magic: "AI Magic", searchPlaceholder: "E.g. Word, Chrome...",
        btnGen: "Generate", btnLoading: "Searching...",
        theoryTitle: "Theory: Study before practice",
        startPractice: "🚀 Start Practice",
        task: "Execute combination", exit: "Back",
        success: "Great job! 🎉", successSub: "You successfully built muscle memory for hotkeys:",
        playAgain: "Play Again"
    },
    uz: {
        title: "Хоткей Тренажёри", subtitle: "Қайноқ тугмаларни ақлли машқ қилиш",
        magic: "ИИ Сеҳри", searchPlaceholder: "Мас. Word, Chrome...",
        btnGen: "Яратиш", btnLoading: "Қидирилмоқда...",
        theoryTitle: "Назария: Амалиётдан олдин ўрганиб чиқинг",
        startPractice: "🚀 Машқни бошлаш",
        task: "Комбинацияни бажаринг", exit: "Орқага",
        success: "Ажойиб иш! 🎉", successSub: "Сиз мушаклар хотирасида муваффақиятли мустаҳкамлаган хоткейлар:",
        playAgain: "Яна ўйнаш"
    }
};

// БАЗА ДАННЫХ ХОТКЕЕВ (С ТЕОРИЕЙ И ПЕРЕВОДАМИ)
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
    { key: "i", shift: false, visual: "Ctrl + I", desc: { ru: "Курсив", en: "Italic", uz: "Курсив матн" }, theory: { ru: "Делает шрифт наклонным (курсивом).", en: "Italicizes the selected text.", uz: "Матнни ётиқ (курсив) қилади." } },
    { key: "u", shift: false, visual: "Ctrl + U", desc: { ru: "Подчеркнутый", en: "Underline", uz: "Ости чизилган" }, theory: { ru: "Добавляет линию под выделенным текстом.", en: "Adds a line under the text.", uz: "Матн тагига чизиқ тортади." } }
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
        2. "key" — ОДНА строчная буква.
        3. Все переводы должны быть точными. Узбекский язык писать СТРОГО НА КИРИЛЛИЦЕ.`;

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
                style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '22px', padding: '34px', margin: '0 auto', background: 'var(--bg-panel)' }}
            >
                {/* ШАПКА И СТИЛЬНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКОВ */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', boxShadow: '0 4px 15px rgba(253, 160, 133, 0.25)' }}>
                            ⚡
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#fff' }}>{UI_DICT[lang].title}</h2>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginTop: '2px' }}>{UI_DICT[lang].subtitle}</div>
                        </div>
                    </div>

                    {/* КРАСИВЫЙ ПЕРЕКЛЮЧАТЕЛЬ БЕЗ ЯДОВИТЫХ ЦВЕТОВ */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {[ { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' } ].map(item => {
                            const isActive = lang === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setLang(item.id)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '10px', 
                                        background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent', 
                                        border: 'none',
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.4)', 
                                        fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                                        transition: 'all 0.2s ease', outline: 'none',
                                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </header>

                {/* ПАНЕЛЬ ГЕНЕРАЦИИ ИИ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ flexShrink: 0, fontSize: '24px' }}>🤖</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                            {UI_DICT[lang].magic}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <input
                                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                                placeholder={UI_DICT[lang].searchPlaceholder}
                                style={{ flex: '1 1 200px', padding: '0 16px', height: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '14px', outline: 'none' }}
                                disabled={isGenerating}
                            />
                            {/* ЗАЩИЩЕННАЯ КНОПКА ГЕНЕРАЦИИ */}
                            <button 
                                onClick={generateAIHotkeys} 
                                disabled={isGenerating} 
                                style={{ padding: '0 24px', height: '48px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: '#1c1206', fontSize: '14px', fontWeight: 800, cursor: isGenerating ? 'wait' : 'pointer', opacity: isGenerating ? 0.7 : 1, transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {isGenerating ? UI_DICT[lang].btnLoading : UI_DICT[lang].btnGen}
                            </button>
                        </div>
                    </div>
                </div>

                {/* БЛОК ТЕОРИИ */}
                <div style={{ marginTop: '10px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#fff', fontWeight: 700 }}>
                        📚 {UI_DICT[lang].theoryTitle} {activeHotkeys !== HOTKEYS_DB ? `(${topic})` : ''}
                    </h3>
                    <div className="modern-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '10px' }}>
                        {activeHotkeys.map((hk, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '15px' }}>{t(hk.desc)}</span>
                                    <span style={{ background: 'rgba(253, 160, 133, 0.12)', color: '#fda085', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                                        {hk.visual}
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                    {t(hk.theory)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* КНОПКИ СТАРТА - ЗАЩИЩЕНЫ ОТ ГЛОБАЛЬНЫХ СТИЛЕЙ */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '30px' }}>
                    <button 
                        onClick={startGame} 
                        style={{ width: '100%', maxWidth: '300px', height: '56px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(16,185,129,0.4)', transition: 'transform 0.1s' }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {UI_DICT[lang].startPractice}
                    </button>
                    <button 
                        onClick={onBack} 
                        style={{ width: '140px', height: '56px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {UI_DICT[lang].exit}
                    </button>
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
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '26px', padding: '32px', margin: '0 auto', background: 'var(--bg-panel)' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '18px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {activeHotkeys !== HOTKEYS_DB ? `${UI_DICT[lang].title}: ${topic}` : `⚡ ${UI_DICT[lang].title}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '7px 14px' }}>
                        {currentIndex} / {tasks.length}
                    </div>
                    <button onClick={leaveGame} style={{ padding: '0 16px', height: '38px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '13px', fontWeight: 700, borderRadius: '10px', cursor: 'pointer' }}>
                        {UI_DICT[lang].exit}
                    </button>
                </div>
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '20px 0' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', textAlign: 'center' }}>
                        {UI_DICT[lang].task}
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : '#fff', maxWidth: '85%' }}
                    >
                        «{t(currentTask.desc)}»
                    </motion.div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                        <div style={{ padding: '18px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '24px', fontWeight: '800', color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
                            Ctrl
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' }}>+</div>

                        {currentTask.shift && (
                            <>
                                <div style={{ padding: '18px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '24px', fontWeight: '800', color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
                                    Shift
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' }}>+</div>
                            </>
                        )}

                        <motion.div
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                            style={{ padding: '18px 28px', background: 'rgba(14,165,233,0.05)', border: '2px dashed #0ea5e9', borderRadius: '16px', fontSize: '24px', fontWeight: '800', color: '#0ea5e9', boxShadow: 'inset 0 0 14px rgba(14,165,233,0.15)' }}
                        >
                            ?
                        </motion.div>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
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
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, margin: 0 }}>
                        {UI_DICT[lang].successSub} <strong style={{color: '#fff'}}>{score}</strong>
                    </p>
                    <button 
                        onClick={startGame} 
                        style={{ width: '280px', marginTop: '20px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', border: 'none', color: '#1c1206', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(253,160,133,0.5)' }}
                    >
                        {UI_DICT[lang].playAgain}
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
