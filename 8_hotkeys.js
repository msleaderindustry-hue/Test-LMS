const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button, shuffleArray } = window;

// Соответствие "цифра/символ" -> тот символ, который реально приходит в e.key,
// когда клавиша нажата вместе с Shift (US-раскладка). Нужно, чтобы можно было
// хранить key как обычную цифру ("9"), а не гадать, что пришлёт браузер.
const SHIFT_SYMBOL_MAP = {
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
    ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
};

// Ультимативная база горячих клавиш: перенесено из твоих рукописных конспектов!
// desc хранится "ключом перевода" (descKey), а само отображаемое описание берётся
// из HOTKEY_DESC_TRANSLATIONS[lang][descKey] — так база остаётся одна для всех языков.
const HOTKEYS_DB = [
    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---
    { descKey: "alignRight", key: "r", shift: false, visual: "Ctrl + R" },
    { descKey: "alignLeft", key: "l", shift: false, visual: "Ctrl + L" },
    { descKey: "undo", key: "z", shift: false, visual: "Ctrl + Z" },
    { descKey: "cut", key: "x", shift: false, visual: "Ctrl + X" },
    { descKey: "alignCenter", key: "e", shift: false, visual: "Ctrl + E" },
    { descKey: "selectAll", key: "a", shift: false, visual: "Ctrl + A" },
    { descKey: "italic", key: "i", shift: false, visual: "Ctrl + I" },
    { descKey: "print", key: "p", shift: false, visual: "Ctrl + P" },
    { descKey: "underline", key: "u", shift: false, visual: "Ctrl + U" },
    { descKey: "save", key: "s", shift: false, visual: "Ctrl + S" },
    { descKey: "copy", key: "c", shift: false, visual: "Ctrl + C" },
    { descKey: "paste", key: "v", shift: false, visual: "Ctrl + V" },
    { descKey: "openFile", key: "o", shift: false, visual: "Ctrl + O" },
    { descKey: "closeDoc", key: "w", shift: false, visual: "Ctrl + W" },
    { descKey: "find", key: "f", shift: false, visual: "Ctrl + F" },
    { descKey: "findReplace", key: "h", shift: false, visual: "Ctrl + H" },
    { descKey: "redo", key: "y", shift: false, visual: "Ctrl + Y" },
    { descKey: "hyperlink", key: "k", shift: false, visual: "Ctrl + K" },

    // --- ТРОЙНЫЕ КОМБИНАЦИИ С SHIFT (ИЗ КОНСПЕКТА) ---
    // key хранит обычную цифру — сопоставление с "!" / "(" и т.д. делает SHIFT_SYMBOL_MAP в handleKeyDown
    { descKey: "fontSmaller", key: "1", shift: true, visual: "Ctrl + Shift + 1" },
    { descKey: "fontBigger", key: "9", shift: true, visual: "Ctrl + Shift + 9" },
    { descKey: "doubleUnderline", key: "d", shift: true, visual: "Ctrl + Shift + D" },
    { descKey: "allCaps", key: "a", shift: true, visual: "Ctrl + Shift + A" },
    { descKey: "underlineWords", key: "w", shift: true, visual: "Ctrl + Shift + W" },

    // --- НАВИГАЦИЯ В БРАУЗЕРЕ ---
    { descKey: "newTab", key: "t", shift: false, visual: "Ctrl + T" },
    { descKey: "newFile", key: "n", shift: false, visual: "Ctrl + N" },
    { descKey: "bold", key: "b", shift: false, visual: "Ctrl + B" }
];

// Переводы описаний горячих клавиш по ключу (descKey)
const HOTKEY_DESC_TRANSLATIONS = {
    ru: {
        alignRight: "Поправить текст по правому краю",
        alignLeft: "Поправить текст по левому краю",
        undo: "Отменить последнее действие",
        cut: "Вырезать текст",
        alignCenter: "Поправить текст по центру",
        selectAll: "Выделить весь текст",
        italic: "Курсив",
        print: "Открыть принтер",
        underline: "Линия под текстом",
        save: "Сохранить",
        copy: "Копия",
        paste: "Вставить",
        openFile: "Открыть файл",
        closeDoc: "Выйти из документа",
        find: "Найти",
        findReplace: "Найти и заменить",
        redo: "Перейти к истории (Redo)",
        hyperlink: "Вставить гиперссылку",
        fontSmaller: "Уменьшить размер шрифта",
        fontBigger: "Увеличить размер шрифта",
        doubleUnderline: "Двойное подчёркивание",
        allCaps: "Все прописные",
        underlineWords: "Подчёркивание только слов",
        newTab: "Открыть новую вкладку",
        newFile: "Создать новый файл или окно",
        bold: "Жирный текст"
    },
    en: {
        alignRight: "Align text to the right",
        alignLeft: "Align text to the left",
        undo: "Undo the last action",
        cut: "Cut text",
        alignCenter: "Center-align text",
        selectAll: "Select all text",
        italic: "Italic",
        print: "Open print dialog",
        underline: "Underline text",
        save: "Save",
        copy: "Copy",
        paste: "Paste",
        openFile: "Open file",
        closeDoc: "Close the document",
        find: "Find",
        findReplace: "Find and replace",
        redo: "Redo",
        hyperlink: "Insert a hyperlink",
        fontSmaller: "Decrease font size",
        fontBigger: "Increase font size",
        doubleUnderline: "Double underline",
        allCaps: "All caps",
        underlineWords: "Underline words only",
        newTab: "Open a new tab",
        newFile: "Create a new file or window",
        bold: "Bold text"
    },
    uz: {
        alignRight: "Матнни ўнг томонга текислаш",
        alignLeft: "Матнни чап томонга текислаш",
        undo: "Охирги амални бекор қилиш",
        cut: "Матнни кесиб олиш",
        alignCenter: "Матнни марказга текислаш",
        selectAll: "Барча матнни танлаш",
        italic: "Қия ёзув (курсив)",
        print: "Босиб чиқаришни очиш",
        underline: "Матн остига чизиқ тортиш",
        save: "Сақлаш",
        copy: "Нусха олиш",
        paste: "Қўйиш",
        openFile: "Файлни очиш",
        closeDoc: "Ҳужжатни ёпиш",
        find: "Қидириш",
        findReplace: "Қидириш ва алмаштириш",
        redo: "Қайта бажариш (Redo)",
        hyperlink: "Гиперҳавола қўйиш",
        fontSmaller: "Шрифт ўлчамини кичрайтириш",
        fontBigger: "Шрифт ўлчамини катталаштириш",
        doubleUnderline: "Икки қатор тагига чизиш",
        allCaps: "Барча ҳарфларни бош ҳарф қилиш",
        underlineWords: "Фақат сўзларни тагига чизиш",
        newTab: "Янги ойна (вкладка) очиш",
        newFile: "Янги файл ёки ойна яратиш",
        bold: "Қалин (bold) матн"
    }
};

// Переводы всего интерфейса
const UI_TRANSLATIONS = {
    ru: {
        langName: "Русский",
        title: "Хоткеи",
        aiPowered: "AI powered",
        subtitle: "Тренируй стандартную базу из твоих конспектов (Word, Система) или создай персональную для любой другой программы",
        customPanelLabel: "Своя база для другой программы",
        inputPlaceholder: "Напр. Word, Excel, Photoshop...",
        generateButton: "Создать базу",
        generating: "Ищем…",
        loadedSuccess: (topic) => `✅ База «${topic}» успешно загружена`,
        startTraining: "🚀 Начать тренировку",
        theoryStep: "Шаг 1 из 2",
        theoryTitle: "Теория",
        theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
        exit: "Выйти",
        goToPractice: "Перейти к практике →",
        doCombination: "Выполните комбинацию",
        finishedTitle: "Отличная работа!",
        finishedDesc: (score) => `Вы успешно закрепили ${score} горячих клавиш в мышечной памяти`,
        repeat: "Пройти ещё раз",
        alertNoTopic: "Введите название программы!",
        alertFailed: "Не удалось сгенерировать. Попробуй переформулировать запрос.",
        defaultBaseName: null // при дефолтной базе название программы в заголовках не показывается
    },
    en: {
        langName: "English",
        title: "Hotkeys",
        aiPowered: "AI powered",
        subtitle: "Practice the standard set from your notes (Word, System), or create a custom one for any other program",
        customPanelLabel: "Custom set for another program",
        inputPlaceholder: "e.g. Word, Excel, Photoshop...",
        generateButton: "Generate set",
        generating: "Generating…",
        loadedSuccess: (topic) => `✅ "${topic}" set loaded successfully`,
        startTraining: "🚀 Start training",
        theoryStep: "Step 1 of 2",
        theoryTitle: "Theory",
        theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
        exit: "Exit",
        goToPractice: "Go to practice →",
        doCombination: "Perform the combination",
        finishedTitle: "Great job!",
        finishedDesc: (score) => `You've successfully memorized ${score} hotkeys`,
        repeat: "Try again",
        alertNoTopic: "Enter the name of a program!",
        alertFailed: "Couldn't generate a set. Try rephrasing the topic.",
        defaultBaseName: null
    },
    uz: {
        langName: "O'zbek (кирилл)",
        title: "Хоткейлар",
        aiPowered: "AI powered",
        subtitle: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг ёки бошқа дастур учун ўзингизникини яратинг",
        customPanelLabel: "Бошқа дастур учун ўз базангиз",
        inputPlaceholder: "Масалан: Word, Excel, Photoshop...",
        generateButton: "База яратиш",
        generating: "Излаяпмиз…",
        loadedSuccess: (topic) => `✅ «${topic}» базаси муваффақиятли юкланди`,
        startTraining: "🚀 Машқни бошлаш",
        theoryStep: "1-қадам, 2 тадан",
        theoryTitle: "Назария",
        theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
        exit: "Чиқиш",
        goToPractice: "Амалиётга ўтиш →",
        doCombination: "Комбинацияни бажаринг",
        finishedTitle: "Ажойиб натижа!",
        finishedDesc: (score) => `Сиз ${score} та хоткейни муваффақиятли мустаҳкамладингиз`,
        repeat: "Яна бир бор такрорлаш",
        alertNoTopic: "Дастур номини киритинг!",
        alertFailed: "Яратиб бўлмади. Мавзуни бошқача ёзиб кўринг.",
        defaultBaseName: null
    }
};

// Название языка для промпта, отправляемого ИИ (чтобы описания приходили на нужном языке)
const AI_LANG_HINT = {
    ru: "русском",
    en: "английском (English)",
    uz: "узбекском языке кириллицей (o'zbek tilida, kirill alifbosida)"
};

// ИСПРАВЛЕНИЕ ОШИБКИ: Заменили название, чтобы не конфликтовало с CodePlayground
const HK_LANGS = ["ru", "en", "uz"];
const HK_LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

// Быстрый выбор темы — реальные, узнаваемые программы, без привязки к языку интерфейса
const PRESET_TOPICS = ["Microsoft Word", "Excel", "PowerPoint", "Photoshop", "Figma", "VS Code"];

// Комбинации для «ленивой» демонстрации на стартовом экране
const AMBIENT_COMBOS = [
    { key: "c", shift: false, descKey: "copy" },
    { key: "v", shift: false, descKey: "paste" },
    { key: "z", shift: false, descKey: "undo" },
    { key: "s", shift: false, descKey: "save" },
    { key: "f", shift: false, descKey: "find" }
];

/* ============================================================================
   ДИЗАЙН-СИСТЕМА: цифровая клавиатура как материал интерфейса.
   Всё — от логотипа до фидбека — сделано настоящими "клавишами" (Keycap),
   собранными в MiniKeyboard. Это единственный акцент; всё остальное — тихое.
   ============================================================================ */

const FONTS = {
    display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace"
};

const INK = {
    amberTop: "#f3b65c", amber: "#e8a33d", amberEdge: "#9c661f", amberInk: "#2a1707",
    tealTop: "#63d8c7", teal: "#49c6b4", tealEdge: "#1f7c6f", tealInk: "#062824",
    coralTop: "#f5837a", coral: "#f0645a", coralEdge: "#9c2c26",
    keyTop: "#3d3d47", keyTopHi: "#48485373", keyEdge: "rgba(0,0,0,0.55)", keyInk: "#e9e5da",
    dimTop: "#222228", dimEdge: "rgba(0,0,0,0.5)", dimInk: "#84818c"
};

const KB_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
];

const KEY_SIZES = {
    xs: { pad: "6px 8px", fs: 10.5, radius: 6, bb: 2, min: 24 },
    sm: { pad: "9px 13px", fs: 12.5, radius: 8, bb: 3, min: 32 },
    md: { pad: "13px 18px", fs: 15, radius: 10, bb: 3, min: 40 },
    lg: { pad: "16px 22px", fs: 18, radius: 12, bb: 4, min: 48 }
};

const KEY_TONES = {
    neutral: { top: INK.keyTop, hi: "#48484f", ink: INK.keyInk, edge: INK.keyEdge },
    amber: { top: INK.amber, hi: INK.amberTop, ink: INK.amberInk, edge: INK.amberEdge },
    teal: { top: INK.teal, hi: INK.tealTop, ink: INK.tealInk, edge: INK.tealEdge },
    coral: { top: INK.coral, hi: INK.coralTop, ink: "#2a0a08", edge: INK.coralEdge },
    dim: { top: INK.dimTop, hi: "#27272d", ink: INK.dimInk, edge: INK.dimEdge }
};

// Keycap — базовый атом дизайна: настоящая "клавиша" с объёмом и подсветкой
const Keycap = ({ children, size = "md", tone = "neutral", glow = false, wide = false }) => {
    const d = KEY_SIZES[size];
    const c = KEY_TONES[tone];
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: d.pad, minWidth: wide ? undefined : d.min,
            width: wide ? "100%" : undefined,
            borderRadius: d.radius, fontFamily: FONTS.mono, fontWeight: 700,
            fontSize: d.fs, letterSpacing: "0.2px", color: c.ink,
            background: `linear-gradient(180deg, ${c.hi} 0%, ${c.top} 100%)`,
            borderBottom: `${d.bb}px solid ${c.edge}`,
            boxShadow: glow
                ? `0 0 0 1px ${c.edge}, 0 6px 16px -6px ${c.top}, 0 0 22px -2px ${c.top}99`
                : `0 0 0 1px ${c.edge}, 0 2px 6px rgba(0,0,0,0.35)`,
            transition: "box-shadow 0.2s ease, background 0.2s ease",
            userSelect: "none", whiteSpace: "nowrap", lineHeight: 1
        }}>
            {children}
        </div>
    );
};

// MiniKeyboard — функциональная (не декоративная) визуализация: подсвечивает
// именно те клавиши, которые нужно нажать. Используется и на практике, и в демо.
const MiniKeyboard = ({ targetKey, needsShift, pulse, scale = 1 }) => {
    const isMatch = (k) => targetKey && k === targetKey.toLowerCase();
    return (
        <div style={{
            display: "inline-flex", flexDirection: "column", gap: 6, padding: 16,
            background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(0,0,0,0.28))",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20,
            boxShadow: "0 30px 60px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            transform: `scale(${scale})`
        }}>
            {KB_ROWS.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 6, justifyContent: "center", paddingLeft: ri * 9 }}>
                    {row.map((k) => {
                        const match = isMatch(k);
                        const cell = (
                            <Keycap size="xs" tone={match ? "amber" : "dim"} glow={match && pulse !== "error"}>
                                {k.toUpperCase()}
                            </Keycap>
                        );
                        if (!match) return <div key={k}>{cell}</div>;
                        return (
                            <motion.div
                                key={k}
                                animate={
                                    pulse === "success" ? { y: [0, 3, 0] }
                                        : pulse === "error" ? { x: [-3, 3, -3, 3, 0] }
                                        : {}
                                }
                                transition={{ duration: 0.28 }}
                            >
                                {cell}
                            </motion.div>
                        );
                    })}
                </div>
            ))}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 2 }}>
                <div style={{ flex: "0 0 76px" }}>
                    <Keycap size="xs" tone={needsShift ? "amber" : "dim"} glow={needsShift && pulse !== "error"} wide>Shift</Keycap>
                </div>
                <div style={{ flex: "0 0 60px" }}>
                    <Keycap size="xs" tone="amber" glow={pulse !== "error"} wide>Ctrl</Keycap>
                </div>
                <div style={{ flex: "1 1 auto", maxWidth: 140 }}>
                    <Keycap size="xs" tone="dim" wide>Space</Keycap>
                </div>
            </div>
        </div>
    );
};

// Хлебные крошки шагов: реальная, а не декоративная последовательность (Теория -> Практика)
const StepTrail = ({ step, labels }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[1, 2].map((n) => (
            <React.Fragment key={n}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{
                        width: 20, height: 20, borderRadius: "50%", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800,
                        fontFamily: FONTS.mono,
                        background: n < step ? INK.teal : n === step ? INK.amber : "rgba(255,255,255,0.09)",
                        color: n <= step ? "#181818" : "var(--text-sec)"
                    }}>
                        {n < step ? "✓" : n}
                    </div>
                    <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
                        color: n === step ? "var(--text-main)" : "var(--text-sec)", opacity: n === step ? 1 : 0.6
                    }}>
                        {labels[n - 1]}
                    </span>
                </div>
                {n === 1 && <div style={{ width: 22, height: 1, background: "rgba(255,255,255,0.14)" }} />}
            </React.Fragment>
        ))}
    </div>
);

// Прогресс практики — как индикаторные LED на клавиатуре, а не абстрактный бар
const ProgressDots = ({ total, current }) => (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
                width: i === current ? 20 : 6, height: 6, borderRadius: 4,
                background: i < current ? INK.teal : i === current ? INK.amber : "rgba(255,255,255,0.14)",
                boxShadow: i === current ? `0 0 10px -1px ${INK.amber}` : "none",
                transition: "all 0.25s ease"
            }} />
        ))}
    </div>
);

const LanguageSwitcher = ({ lang, setLang, style }) => (
    <div style={{ display: "flex", gap: 6, ...style }}>
        {HK_LANGS.map((code) => ( // ИСПРАВЛЕНО
            <motion.button
                key={code}
                className="hkx-focusable"
                whileHover={{ y: lang === code ? 0 : -1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setLang(code)}
                title={UI_TRANSLATIONS[code].langName}
                style={{
                    padding: "7px 12px", borderRadius: 999,
                    border: lang === code ? `1px solid ${INK.amberEdge}` : "1px solid var(--glass-border)",
                    background: lang === code ? `linear-gradient(180deg, ${INK.amberTop}, ${INK.amber})` : "var(--bg-body)",
                    color: lang === code ? INK.amberInk : "var(--text-sec)",
                    fontFamily: FONTS.mono, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.5px",
                    cursor: "pointer", boxShadow: lang === code ? `0 6px 16px -7px ${INK.amber}` : "none"
                }}
            >
                {HK_LANG_LABEL[code]} {/* ИСПРАВЛЕНО */}
            </motion.button>
        ))}
    </div>
);

/* ============================================================================
   ОСНОВНОЙ КОМПОНЕНТ
   ============================================================================ */

const HotkeyTrainer = ({ onBack }) => {
    const [tasks, setTasks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [successPulse, setSuccessPulse] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [phase, setPhase] = useState('setup'); // 'setup' | 'theory' | 'practice'

    const [lang, setLang] = useState('ru');
    const t = UI_TRANSLATIONS[lang];

    const [topic, setTopic] = useState("Microsoft Word");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
    const [isCustomBase, setIsCustomBase] = useState(false);

    const [reducedMotion, setReducedMotion] = useState(false);
    const [ambientIndex, setAmbientIndex] = useState(0);

    // Подключаем шрифты один раз (не дублируем, если уже загружены родительским приложением)
    useEffect(() => {
        if (document.getElementById('hkx-fonts')) return;
        const link = document.createElement('link');
        link.id = 'hkx-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap';
        document.head.appendChild(link);
    }, []);

    // Уважаем prefers-reduced-motion — гасим фоновую демо-анимацию клавиатуры
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e) => setReducedMotion(e.matches);
        if (mq.addEventListener) mq.addEventListener('change', handler); else mq.addListener(handler);
        return () => { if (mq.removeEventListener) mq.removeEventListener('change', handler); else mq.removeListener(handler); };
    }, []);

    // Фоновая демонстрация на стартовом экране: клавиатура сама "показывает" пару комбинаций
    useEffect(() => {
        if (phase !== 'setup' || reducedMotion) return;
        const id = setInterval(() => setAmbientIndex((i) => (i + 1) % AMBIENT_COMBOS.length), 1900);
        return () => clearInterval(id);
    }, [phase, reducedMotion]);

    const getDesc = (hk) => {
        if (hk.descKey) return HOTKEY_DESC_TRANSLATIONS[lang][hk.descKey] || HOTKEY_DESC_TRANSLATIONS.ru[hk.descKey];
        return hk.desc;
    };

    const generateAIHotkeys = async () => {
        if (!topic.trim()) return alert(t.alertNoTopic);
        setIsGenerating(true);

        const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций.

        Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${topic}".

        СТРОГИЕ ПРАВИЛА (нарушение недопустимо):
        1. НЕ ПРИДУМЫВАЙ комбинации. Используй только те горячие клавиши, которые реально существуют и задокументированы в официальной справке/документации программы "${topic}". Если не уверен, что комбинация существует именно в этой программе — не включай её.
        2. Если для "${topic}" в принципе не существует 10 разных официальных комбинаций с Ctrl/Cmd — верни столько, сколько действительно существует (не меньше 5, не выдумывая недостающие).
        3. Никакой отсебятины в описаниях: поле "desc" должно точно и нейтрально описывать действие, без выдуманных деталей. Напиши поле "desc" на ${AI_LANG_HINT[lang]}.
        4. Поле "key" — ТОЛЬКО ОДНА строчная английская буква или цифра (физическая клавиша, которая нажимается вместе с Ctrl, без символов вроде "!" или "(" — если нужна цифра, пиши саму цифру).
        5. Не повторяй одну и ту же комбинацию дважды.
        6. Верни ТОЛЬКО чистый валидный JSON-массив объектов. Без markdown, без пояснений, без текста до или после массива.

        Формат строго такой:
        [
          {"desc": "Описание действия", "key": "c", "shift": false, "visual": "Ctrl + C"},
          {"desc": "Сохранить как", "key": "s", "shift": true, "visual": "Ctrl + Shift + S"}
        ]`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "Ошибка API");
            if (!data.candidates || data.candidates.length === 0) throw new Error("Пустой ответ от ИИ");

            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("ИИ не вернул JSON массив");

            const parsedHotkeys = JSON.parse(jsonMatch[0]);

            // Валидация + дедупликация: одна буква/цифра в key, без повторов по key+shift
            const seen = new Set();
            const validatedHotkeys = parsedHotkeys
                .filter((hk) => hk && typeof hk.key === "string" && hk.key.trim().length > 0)
                .map((hk) => ({ ...hk, key: hk.key.trim().toLowerCase().slice(0, 1), shift: !!hk.shift }))
                .filter((hk) => {
                    const sig = hk.key + (hk.shift ? "!" : "");
                    if (seen.has(sig)) return false;
                    seen.add(sig);
                    return true;
                })
                .slice(0, 10);

            if (validatedHotkeys.length > 0) {
                setActiveHotkeys(validatedHotkeys);
                setIsCustomBase(true);
            } else {
                throw new Error("Неверный формат данных");
            }
        } catch (error) {
            console.error("❌ Ошибка:", error);
            alert(t.alertFailed);
            setActiveHotkeys(HOTKEYS_DB);
            setIsCustomBase(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const openTheory = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setPhase('theory');
    };

    const startGame = () => setPhase('practice');

    const resetGame = () => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setPhase('practice');
    };

    const leaveGame = () => {
        setPhase('setup');
        setActiveHotkeys(HOTKEYS_DB);
        setIsCustomBase(false);
    };

    useEffect(() => {
        if (phase !== 'practice' || isFinished || tasks.length === 0) return;

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
                // При зажатом Shift браузер может прислать не саму цифру/символ, а её "сдвинутую"
                // версию (например "!" вместо "1") — проверяем совпадение в обеих формах.
                const expectedShiftedKey = SHIFT_SYMBOL_MAP[expectedKey] || expectedKey;
                const keyMatches = pressedKey === expectedKey || pressedKey === expectedShiftedKey;

                if (isShiftPressed === requiresShift && keyMatches) {
                    setSuccessPulse(true);
                    setScore((prev) => prev + 1);
                    setTimeout(() => setSuccessPulse(false), 220);

                    if (currentIndex < tasks.length - 1) {
                        setTimeout(() => setCurrentIndex((prev) => prev + 1), 160);
                    } else {
                        setTimeout(() => setIsFinished(true), 160);
                    }
                } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 320);
                }
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 320);
            }
        };

        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, tasks, isFinished, phase]);

    const wrap = (children) => (
        <>
            <style>{`
                .hkx-focusable:focus-visible {
                    outline: 2px solid ${INK.amber};
                    outline-offset: 2px;
                }
                .hkx-input:focus {
                    border-color: ${INK.amberEdge} !important;
                    box-shadow: 0 0 0 3px rgba(232,163,61,0.16) !important;
                }
                .hkx-grid { grid-template-columns: 1.05fr 0.95fr; }
                .hkx-theory-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
                @media (max-width: 760px) {
                    .hkx-grid { grid-template-columns: 1fr !important; }
                    .hkx-kb-wrap { transform: scale(0.82); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .hkx-scope * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
                }
            `}</style>
            <div className="hkx-scope">{children}</div>
        </>
    );

    /* ---------------------------- SETUP ---------------------------- */
    if (phase === 'setup') {
        const ambient = AMBIENT_COMBOS[ambientIndex];
        return wrap(
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '100%', maxWidth: '980px', margin: '0 auto', padding: '40px',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
                    <LanguageSwitcher lang={lang} setLang={setLang} />
                </div>

                <div className="hkx-grid" style={{ display: 'grid', gap: 40, alignItems: 'center' }}>
                    {/* ЛЕВАЯ КОЛОНКА */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <Keycap size="lg" tone="amber" glow>Ctrl</Keycap>
                            <div>
                                <h2 style={{
                                    margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 800,
                                    letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: 1.05
                                }}>
                                    {t.title}
                                </h2>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
                                    fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.4px',
                                    textTransform: 'uppercase', color: INK.teal
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: INK.teal, boxShadow: `0 0 8px ${INK.teal}` }} />
                                    {t.aiPowered}
                                </span>
                            </div>
                        </div>

                        <p style={{
                            fontFamily: FONTS.body, fontSize: 15, color: 'var(--text-sec)', lineHeight: 1.65,
                            margin: 0, maxWidth: 440, fontWeight: 500
                        }}>
                            {t.subtitle}
                        </p>

                        {/* Быстрый выбор темы */}
                        <div>
                            <div style={{
                                fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.2px',
                                textTransform: 'uppercase', color: 'var(--text-sec)', opacity: 0.7, marginBottom: 10
                            }}>
                                {t.presetsLabel}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {PRESET_TOPICS.map((name) => (
                                    <button
                                        key={name}
                                        className="hkx-focusable"
                                        onClick={() => setTopic(name)}
                                        disabled={isGenerating}
                                        style={{
                                            padding: '8px 14px', borderRadius: 10, cursor: isGenerating ? 'default' : 'pointer',
                                            fontFamily: FONTS.body, fontSize: 13, fontWeight: 700,
                                            background: topic === name ? 'rgba(232,163,61,0.14)' : 'var(--bg-body)',
                                            border: topic === name ? `1px solid ${INK.amberEdge}` : '1px solid var(--glass-border)',
                                            color: topic === name ? INK.amber : 'var(--text-sec)'
                                        }}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Панель генерации */}
                        <div style={{
                            background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                            borderRadius: 16, padding: 18
                        }}>
                            <div style={{
                                fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: '1.2px',
                                textTransform: 'uppercase', color: 'var(--text-sec)', opacity: 0.7, marginBottom: 12
                            }}>
                                {t.customPanelLabel}
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <div style={{
                                    flex: '1 1 180px', display: 'flex', alignItems: 'center',
                                    background: 'var(--bg-panel)', border: '1px solid var(--glass-border)',
                                    borderRadius: 12, padding: '0 4px 0 14px'
                                }}>
                                    <span style={{ fontFamily: FONTS.mono, color: INK.amber, fontWeight: 800, marginRight: 6 }}>›</span>
                                    <input
                                        type="text"
                                        className="hkx-focusable hkx-input"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder={t.inputPlaceholder}
                                        disabled={isGenerating}
                                        style={{
                                            flex: 1, padding: '13px 6px', border: 'none', outline: 'none',
                                            background: 'transparent', color: 'var(--text-main)',
                                            fontFamily: FONTS.body, fontSize: 15, fontWeight: 600
                                        }}
                                    />
                                </div>
                                <motion.button
                                    className="hkx-focusable"
                                    whileHover={{ y: isGenerating ? 0 : -1 }}
                                    whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                                    onClick={generateAIHotkeys}
                                    disabled={isGenerating}
                                    style={{
                                        padding: '0 22px', height: 48, border: 'none', borderRadius: 12,
                                        background: `linear-gradient(180deg, ${INK.amberTop}, ${INK.amber})`,
                                        color: INK.amberInk, fontFamily: FONTS.body, fontWeight: 800, fontSize: 14,
                                        cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.75 : 1,
                                        display: 'flex', alignItems: 'center', gap: 9,
                                        boxShadow: `0 12px 24px -12px ${INK.amber}`
                                    }}
                                >
                                    {isGenerating && (
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                            style={{
                                                width: 13, height: 13, borderRadius: '50%',
                                                border: `2px solid ${INK.amberInk}55`, borderTopColor: INK.amberInk,
                                                display: 'inline-block'
                                            }}
                                        />
                                    )}
                                    {isGenerating ? t.generating : t.generateButton}
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {isCustomBase && !isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        style={{
                                            fontFamily: FONTS.body, fontSize: 13, color: INK.teal, fontWeight: 700,
                                            background: 'rgba(73,198,180,0.09)', border: `1px solid ${INK.tealEdge}55`,
                                            borderRadius: 10, padding: '9px 12px'
                                        }}
                                    >
                                        {t.loadedSuccess(topic)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button variant="orange" onClick={openTheory} style={{ height: 52, fontSize: 15.5, borderRadius: 13, fontWeight: 800 }}>
                            {t.startTraining}
                        </Button>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА — живая клавиатура */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div className="hkx-kb-wrap">
                            <MiniKeyboard targetKey={ambient.key} needsShift={ambient.shift} pulse={null} scale={1.15} />
                        </div>
                        <div style={{
                            fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: 'var(--text-sec)',
                            textAlign: 'center', minHeight: 18
                        }}>
                            {HOTKEY_DESC_TRANSLATIONS[lang][ambient.descKey]}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    /* ---------------------------- THEORY ---------------------------- */
    if (phase === 'theory') {
        return wrap(
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '34px', display: 'flex', flexDirection: 'column', gap: 22 }}
            >
                <header style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <StepTrail step={1} labels={[t.stepTheoryLabel, t.stepPracticeLabel]} />
                        <LanguageSwitcher lang={lang} setLang={setLang} />
                    </div>
                    <h2 style={{
                        margin: 0, fontFamily: FONTS.display, fontSize: 26, fontWeight: 800,
                        letterSpacing: '-0.4px', color: 'var(--text-main)'
                    }}>
                        {t.theoryTitle}{isCustomBase ? `: ${topic}` : ''}
                    </h2>
                    <p style={{ fontFamily: FONTS.body, fontSize: 14, color: 'var(--text-sec)', fontWeight: 500, margin: '8px 0 0', lineHeight: 1.6 }}>
                        {t.theoryDesc}
                    </p>
                </header>

                <div className="hkx-theory-grid" style={{
                    display: 'grid', gap: 12, maxHeight: 420, overflowY: 'auto', paddingRight: 4
                }}>
                    {tasks.map((hk, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.28) }}
                            style={{
                                display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
                                background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: 14
                            }}
                        >
                            <div style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                                {getDesc(hk)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Keycap size="sm" tone="neutral">Ctrl</Keycap>
                                {hk.shift && (
                                    <>
                                        <span style={{ color: 'var(--text-sec)', opacity: 0.5, fontWeight: 700, fontFamily: FONTS.mono }}>+</span>
                                        <Keycap size="sm" tone="neutral">Shift</Keycap>
                                    </>
                                )}
                                <span style={{ color: 'var(--text-sec)', opacity: 0.5, fontWeight: 700, fontFamily: FONTS.mono }}>+</span>
                                <Keycap size="sm" tone="amber">{hk.key.toUpperCase()}</Keycap>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="muted" onClick={leaveGame} style={{ flex: '0 0 140px', height: 50, fontSize: 14.5, borderRadius: 13, fontWeight: 800 }}>
                        {t.exit}
                    </Button>
                    <Button variant="orange" onClick={startGame} style={{ flex: 1, height: 50, fontSize: 15, borderRadius: 13, fontWeight: 800 }}>
                        {t.goToPractice}
                    </Button>
                </div>
            </motion.div>
        );
    }

    /* ---------------------------- PRACTICE / FINISHED ---------------------------- */
    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    const comboText = `Ctrl${currentTask.shift ? ' + Shift' : ''} + ${currentTask.key.toUpperCase()}`;
    const pulse = shake ? 'error' : successPulse ? 'success' : null;

    return wrap(
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 26 }}
            animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.32 } : { duration: 0.45, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: '760px', margin: '0 auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 18 }}>
                <motion.button
                    className="hkx-focusable"
                    whileHover={{ x: -2, opacity: 1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={leaveGame}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'var(--text-sec)', fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 700, opacity: 0.85, justifySelf: 'start'
                    }}
                >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> {t.exit}
                </motion.button>
                {!isFinished && <StepTrail step={2} labels={[t.stepTheoryLabel, t.stepPracticeLabel]} />}
                <LanguageSwitcher lang={lang} setLang={setLang} />
            </header>

            {!isFinished ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '4px 0' }}>
                    <div style={{
                        fontFamily: FONTS.mono, fontSize: 11.5, color: 'var(--text-sec)', textTransform: 'uppercase',
                        letterSpacing: '2px', fontWeight: 800, opacity: 0.75
                    }}>
                        {t.doCombination}
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                            fontFamily: FONTS.display, fontSize: 26, fontWeight: 700, textAlign: 'center',
                            color: successPulse ? INK.teal : 'var(--text-main)', maxWidth: '85%', lineHeight: 1.35,
                            transition: 'color 0.2s ease'
                        }}
                    >
                        {getDesc(currentTask)}
                    </motion.div>

                    <div className="hkx-kb-wrap">
                        <MiniKeyboard targetKey={currentTask.key} needsShift={currentTask.shift} pulse={pulse} />
                    </div>

                    <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: 'var(--text-sec)', opacity: 0.7 }}>
                        {comboText}
                    </div>

                    <ProgressDots total={tasks.length} current={currentIndex} />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.32 }}
                    style={{ textAlign: 'center', padding: '36px 0', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}
                >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}>
                        <Keycap size="lg" tone="teal" glow>✓</Keycap>
                    </motion.div>
                    <h2 style={{ fontFamily: FONTS.display, fontSize: 30, margin: 0, fontWeight: 800, color: INK.teal, letterSpacing: '-0.4px' }}>
                        {t.finishedTitle}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: FONTS.mono }}>
                        <span style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-main)' }}>{score}</span>
                        <span style={{ fontSize: 16, color: 'var(--text-sec)', opacity: 0.6 }}>/ {tasks.length}</span>
                    </div>
                    <p style={{ fontFamily: FONTS.body, fontSize: 14.5, color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                        {t.finishedDesc(score)}
                    </p>
                    <Button variant="orange" onClick={resetGame} style={{ width: 240, marginTop: 12, height: 50, borderRadius: 13, fontSize: 14.5, fontWeight: 800 }}>
                        {t.repeat}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

Object.assign(window, { HotkeyTrainer });
