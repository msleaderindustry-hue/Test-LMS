const { useState, useEffect, useRef, useMemo } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =========================================================
   1. ДАННЫЕ — база функций и словарь интерфейса
   (структура и ключи сохранены, чтобы не сломать совместимость,
   UI_DICT расширен новыми ключами для всех трёх языков)
   ========================================================= */

const EXCEL_DATABASE = {
    "Математические": ["СУММ", "СУММЕСЛИ", "СУММЕСЛИМН", "ОКРУГЛ", "ОКРУГЛВВЕРХ", "ОКРУГЛВНИЗ", "ПРОИЗВЕД", "ОСТАТ", "КОРЕНЬ", "СТЕПЕНЬ", "СЛЧИС", "ЦЕЛОЕ", "СУММПРОИЗВ", "АБС"],
    "Статистические": ["СРЗНАЧ", "СРЗНАЧЕСЛИ", "МАКС", "МИН", "СЧЁТ", "СЧЁТЕСЛИ", "СЧЁТЕСЛИМН", "СЧЁТЗ", "МЕДИАНА", "МОДА", "НАИБОЛЬШИЙ", "НАИМЕНЬШИЙ", "СЧИТАТЬПУСТОТЫ"],
    "Логические": ["ЕСЛИ", "И", "ИЛИ", "ЕСЛИОШИБКА", "НЕ", "ИСТИНА", "ЛОЖЬ", "ЕСЛИМН", "ЕПУСТО", "ЕЧИСЛО", "ЕТЕКСТ"],
    "Текстовые": ["СЦЕПИТЬ", "ЛЕВСИМВ", "ПРАВСИМВ", "ПСТР", "ДЛСТР", "НАЙТИ", "ПОИСК", "ЗАМЕНИТЬ", "ПОДСТАВИТЬ", "ПРОПИСН", "СТРОЧН", "СЖПРОБЕЛЫ", "ТЕКСТ"],
    "Дата и время": ["СЕГОДНЯ", "ТДАТА", "ДЕНЬ", "МЕСЯЦ", "ГОД", "ДАТА", "ДЕНЬНЕД", "ЧАС", "МИНУТЫ", "РАБДЕНЬ", "ДОЛЯГОДА", "НОМНЕДЕЛИ"],
    "Поиск и ссылки": ["ВПР", "ГПР", "ИНДЕКС", "ПОИСКПОЗ", "СМЕЩ", "ДВССЫЛ", "СТРОКА", "СТОЛБЕЦ", "ПРОСМОТР", "ВЫБОР", "ТРАНСП"]
};

// Иконки категорий (декоративные, для сайдбара)
const CATEGORY_ICON = {
    "Математические": "Σ",
    "Статистические": "📈",
    "Логические": "◈",
    "Текстовые": "Aa",
    "Дата и время": "🕒",
    "Поиск и ссылки": "🔎",
    "Поиск ИИ": "✨"
};

const UI_DICT = {
    ru: {
        title: "Энциклопедия Excel", subtitle: "Умный тренажер функций с ИИ",
        magic: "Магия ИИ", magicDesc: "Найди любую функцию или задай вопрос ИИ",
        search: "Поиск функции (напр. ВПР)...", globalSearch: "Поиск по функциям...",
        genLoading: "Создаём урок...", genBtn: "Сгенерировать урок",
        aiTitle: "Готовим материалы для", aiSub: "ИИ пишет уникальную задачу и таблицу",
        theory: "Теория", defTitle: "Определение", enVersion: "Английская версия:",
        syntaxTitle: "Примеры синтаксиса", practice: "Практика",
        successMsg: "Формула написана верно!", resultMsg: "Результат вычисления:",
        btnAnother: "Другая задача", btnHint: "Подсказка", btnExam: "Экзамен", btnCheck: "Проверить",
        btnNextTask: "Следующая задача", btnRepeatTheory: "Повторить теорию", taskDone: "Задание выполнено",
        copy: "Копировать", copied: "Скопировано",
        easy: "Легко", medium: "Средне", hard: "Сложно",
        xp: "XP", level: "Уровень", progressTitle: "Прокачай свои навыки",
        progressDesc: "Открывай новые функции и становись мастером Excel",
        hint: "Подсказка", hintLevel: "Подсказка", showSolution: "Показать решение",
        correct: "Формула правильная", incorrect: "Проверьте формулу",
        tryAgain: "Попробовать снова", loading: "Загрузка...", error: "Не удалось создать урок",
        errorDesc: "Что-то пошло не так при обращении к ИИ. Попробуйте ещё раз.",
        retry: "Повторить", exam: "Экзамен", examOn: "Режим экзамена включён",
        examOff: "Обычный режим", time: "Время", explanation: "Объяснение решения",
        functionNotFound: "Функция не найдена в локальной базе.", createWithAI: "Создать урок с помощью ИИ",
        formulaCopied: "Формула скопирована", lessonCreated: "Урок создан", langChanged: "Язык изменён",
        completedFunctions: "Изучено функций", accuracy: "Точность", streak: "Серия дней",
        selectedCell: "Выбрана ячейка", noResults: "Ничего не найдено", enterToCheck: "Enter — проверить",
        hintStep1: "Подумайте, какую функцию нужно применить и какой диапазон данных использовать.",
        hintStep2: "Начните формулу с",
        placeholderInput: "="
    },
    en: {
        title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
        magic: "AI Magic", magicDesc: "Find any function or ask the AI a question",
        search: "Search function (e.g. VLOOKUP)...", globalSearch: "Search functions...",
        genLoading: "Creating lesson...", genBtn: "Generate lesson",
        aiTitle: "Preparing materials for", aiSub: "AI is writing a unique task and table",
        theory: "Theory", defTitle: "Definition", enVersion: "English version:",
        syntaxTitle: "Syntax examples", practice: "Practice",
        successMsg: "Formula is correct!", resultMsg: "Calculation result:",
        btnAnother: "Another task", btnHint: "Hint", btnExam: "Exam", btnCheck: "Check",
        btnNextTask: "Next task", btnRepeatTheory: "Review theory", taskDone: "Task completed",
        copy: "Copy", copied: "Copied",
        easy: "Easy", medium: "Medium", hard: "Hard",
        xp: "XP", level: "Level", progressTitle: "Level up your skills",
        progressDesc: "Unlock new functions and become an Excel master",
        hint: "Hint", hintLevel: "Hint", showSolution: "Show solution",
        correct: "Formula is correct", incorrect: "Check your formula",
        tryAgain: "Try again", loading: "Loading...", error: "Couldn't create the lesson",
        errorDesc: "Something went wrong while contacting the AI. Please try again.",
        retry: "Retry", exam: "Exam", examOn: "Exam mode is on",
        examOff: "Normal mode", time: "Time", explanation: "Explanation",
        functionNotFound: "This function isn't in the local database.", createWithAI: "Create a lesson with AI",
        formulaCopied: "Formula copied", lessonCreated: "Lesson created", langChanged: "Language changed",
        completedFunctions: "Functions learned", accuracy: "Accuracy", streak: "Day streak",
        selectedCell: "Selected cell", noResults: "No results", enterToCheck: "Enter — check",
        hintStep1: "Think about which function fits and which data range you need.",
        hintStep2: "Start the formula with",
        placeholderInput: "="
    },
    uz: {
        title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
        magic: "ИИ Сеҳри", magicDesc: "Исталган функцияни топинг ёки ИИдан сўранг",
        search: "Функцияни қидириш (мас. ВПР)...", globalSearch: "Функциялар бўйича қидириш...",
        genLoading: "Дарс яратилмоқда...", genBtn: "Дарсни яратиш",
        aiTitle: "Материаллар тайёрланмоқда:", aiSub: "ИИ ноёб вазифа ва жадвал ёзмоқда",
        theory: "Назария", defTitle: "Таъриф", enVersion: "Инглизча версияси:",
        syntaxTitle: "Синтаксис мисоллари", practice: "Амалиёт",
        successMsg: "Формула тўғри ёзилган!", resultMsg: "Ҳисоблаш натижаси:",
        btnAnother: "Бошқа вазифа", btnHint: "Ёрдам", btnExam: "Имтиҳон", btnCheck: "Текшириш",
        btnNextTask: "Кейинги вазифа", btnRepeatTheory: "Назарияни такрорлаш", taskDone: "Вазифа бажарилди",
        copy: "Нусха олиш", copied: "Нусха олинди",
        easy: "Осон", medium: "Ўртача", hard: "Қийин",
        xp: "XP", level: "Даража", progressTitle: "Кўникмаларингизни оширинг",
        progressDesc: "Янги функцияларни очинг ва Excel устасига айланинг",
        hint: "Ёрдам", hintLevel: "Ёрдам", showSolution: "Ечимни кўрсатиш",
        correct: "Формула тўғри", incorrect: "Формулани текширинг",
        tryAgain: "Қайта уриниб кўринг", loading: "Юкланмоқда...", error: "Дарсни яратиб бўлмади",
        errorDesc: "ИИ билан боғланишда хатолик юз берди. Яна уриниб кўринг.",
        retry: "Такрорлаш", exam: "Имтиҳон", examOn: "Имтиҳон режими ёқилди",
        examOff: "Оддий режим", time: "Вақт", explanation: "Ечим изоҳи",
        functionNotFound: "Функция локал базада топилмади.", createWithAI: "ИИ ёрдамида дарс яратиш",
        formulaCopied: "Формула нусха олинди", lessonCreated: "Дарс яратилди", langChanged: "Тил ўзгартирилди",
        completedFunctions: "Ўрганилган функциялар", accuracy: "Аниқлик", streak: "Кунлар сериyаси",
        selectedCell: "Танланган катак", noResults: "Ҳеч нарса топилмади", enterToCheck: "Enter — текшириш",
        hintStep1: "Қайси функция ва қайси диапазон кераклигини ўйлаб кўринг.",
        hintStep2: "Формулани шундан бошланг:",
        placeholderInput: "="
    }
};

const FLAT_FUNCTIONS = Object.entries(EXCEL_DATABASE).flatMap(([cat, list]) =>
    list.map(name => ({ name, category: cat }))
);

/* =========================================================
   2. МЕЛКИЕ ХЕЛПЕРЫ (сохранена вся исходная логика проверки)
   ========================================================= */

const getTranslatedText = (obj, currentLang) => {
    if (!obj) return "";
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.ru || "";
};

const getColumnLetter = (colIndex) => String.fromCharCode(65 + colIndex);

// Нормализация формулы — та же логика, что была в checkAnswer, вынесена отдельно
const normalizeFormula = (f) => {
    let str = String(f).trim().toUpperCase()
        .replace(/\s/g, '')
        .replace(/,/g, ';')
        .replace(/["'«»""]/g, '');

    const ruToEn = {
        'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'К': 'K',
        'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X', 'У': 'Y'
    };
    return str.replace(/[АВСЕНКМОРТХУ]/g, match => ruToEn[match]);
};

const validateFormula = (userInput, expectedList) => {
    if (!expectedList || !expectedList.length) return false;
    const userForm = normalizeFormula(userInput);
    return expectedList.some(exp => normalizeFormula(exp) === userForm);
};

// Проверка структуры урока, который вернул ИИ, до того как он попадёт в state
const validateLesson = (lesson) => {
    if (!lesson || typeof lesson !== 'object') return false;
    if (!lesson.name || !lesson.enName || !lesson.syntax) return false;
    if (!lesson.def || !lesson.taskDesc) return false;
    if (!Array.isArray(lesson.table) || lesson.table.length === 0) return false;
    if (!Array.isArray(lesson.expected) || lesson.expected.length === 0) return false;
    if (lesson.result === undefined || lesson.result === null || lesson.result === "") return false;
    return true;
};

const XP_PER_LEVEL = 500;

/* =========================================================
   3. ПОДКОМПОНЕНТЫ
   ========================================================= */

// ---- Toasts ----
const ToastStack = ({ toasts }) => (
    <div className="el-toast-stack">
        <AnimatePresence>
            {toasts.map(t => (
                <motion.div
                    key={t.id}
                    className={`el-toast ${t.type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                >
                    <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}</span>
                    <span>{t.message}</span>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

// ---- Header ----
const AppHeader = ({ t, lang, setLang, theme, toggleTheme, onSearchSelect, sidebarOpen, setSidebarOpen }) => {
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.trim().toUpperCase();
        return FLAT_FUNCTIONS.filter(f => f.name.includes(q)).slice(0, 8);
    }, [query]);

    return (
        <header className="el-header">
            <div className="el-header-left">
                <button className="el-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰ {t.practice /* используем как короткое слово-заглушку не нужно, заменим ниже */}
                </button>
                <div className="el-logo">📊</div>
                <div style={{ minWidth: 0 }}>
                    <h2 className="el-title display-font">{t.title}</h2>
                    <div className="el-subtitle">{t.subtitle}</div>
                </div>
            </div>

            <div className="el-header-center">
                <div className="el-global-search">
                    <span>🔍</span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 150)}
                        placeholder={t.globalSearch}
                    />
                    <span className="kbd">Ctrl /</span>
                    {focused && query.trim() && (
                        <div className="el-search-dropdown">
                            {results.length === 0 && <div className="el-search-empty">{t.noResults}</div>}
                            {results.map(r => (
                                <div
                                    key={r.name}
                                    className="el-search-item"
                                    onMouseDown={() => { onSearchSelect(r.category, r.name); setQuery(""); }}
                                >
                                    <span>{CATEGORY_ICON[r.category] || "Σ"}</span>
                                    <span>{r.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="el-header-right">
                <div className="el-lang-switch">
                    {[{ id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' }].map(item => (
                        <button
                            key={item.id}
                            className={`el-lang-btn ${lang === item.id ? 'active' : ''}`}
                            onClick={() => setLang(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <button className="el-theme-toggle" onClick={toggleTheme} title="Theme">
                    {theme === 'dark' ? '☾' : '☀'}
                </button>
            </div>
        </header>
    );
};

// ---- AI Magic Card ----
const AIMagicCard = ({ t, customSearch, setCustomSearch, onGenerate, isGenerating }) => (
    <div className="el-card el-ai-card">
        <div className="el-ai-card-head">
            <span className="icon">✨</span>
            <span className="label">{t.magic}</span>
        </div>
        <p className="el-ai-card-desc">{t.magicDesc}</p>
        <input
            type="text"
            className="el-ai-input"
            value={customSearch}
            onChange={(e) => setCustomSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            placeholder={t.search}
        />
        <button className="el-btn el-btn-primary" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (<><span className="el-spin" />{t.genLoading}</>) : (<>✨ {t.genBtn}</>)}
        </button>
    </div>
);

// ---- Category accordion ----
const CategoryAccordion = ({ categories, expanded, toggleCategory, activeFormulaName, isGenerating, onSelect }) => (
    <div className="el-card" style={{ padding: '10px 14px' }}>
        {categories.map(category => {
            const isOpen = !!expanded[category];
            return (
                <div className="el-accordion-item" key={category}>
                    <button className={`el-accordion-head ${isOpen ? 'open' : ''}`} onClick={() => toggleCategory(category)}>
                        <span>{CATEGORY_ICON[category] || "Σ"} &nbsp;{category}</span>
                        <span className="chev">˅</span>
                    </button>
                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                className="el-accordion-body"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                {EXCEL_DATABASE[category].map(fName => {
                                    const isActive = activeFormulaName === fName;
                                    return (
                                        <button
                                            key={fName}
                                            className={`el-fn-btn ${isActive ? 'active' : ''}`}
                                            disabled={isGenerating}
                                            onClick={() => onSelect(category, fName)}
                                        >
                                            {fName}
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        })}
    </div>
);

// ---- Progress card ----
const ProgressCard = ({ t, progress }) => {
    const xpIntoLevel = progress.xp % XP_PER_LEVEL;
    const pct = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
    return (
        <div className="el-card el-progress-card">
            <div className="el-progress-title">💎 {t.progressTitle}</div>
            <p className="el-progress-sub">{t.progressDesc}</p>
            <div className="el-progress-level">{t.level} {progress.level}</div>
            <div className="el-progress-bar-track">
                <div className="el-progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="el-progress-xp">{xpIntoLevel} / {XP_PER_LEVEL} {t.xp}</div>
            <div className="el-stat-row"><span>{t.completedFunctions}</span><b>{progress.completedLessons} / {FLAT_FUNCTIONS.length}</b></div>
            <div className="el-stat-row"><span>{t.streak}</span><b>{progress.streak}</b></div>
        </div>
    );
};

// ---- Difficulty badge helper ----
const difficultyBadge = (difficulty, t) => {
    const map = {
        easy: { cls: 'el-badge-easy', label: t.easy },
        medium: { cls: 'el-badge-medium', label: t.medium },
        hard: { cls: 'el-badge-hard', label: t.hard }
    };
    const d = map[difficulty] || map.easy;
    return <span className={`el-badge ${d.cls}`}>● {d.label}</span>;
};

// ---- Theory card ----
const TheoryCard = ({ t, lang, lesson }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard?.writeText(lesson.syntax || "").catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="el-theory-card">
            <div className="el-theory-head">
                <div>
                    <h1 className="el-fn-name display-font">{lesson.name}</h1>
                    <div className="el-fn-en">{t.enVersion} <b>{lesson.enName}</b></div>
                </div>
                <div className="el-badges">
                    {lesson.difficulty && difficultyBadge(lesson.difficulty, t)}
                    {lesson.xp ? <span className="el-badge el-badge-xp">⭐ {lesson.xp} {t.xp}</span> : null}
                    <span className="el-badge el-badge-theory">📘 {t.theory}</span>
                </div>
            </div>

            <div className="el-def-box">
                <div className="el-block-label">{t.defTitle}</div>
                <div className="el-def-text">{getTranslatedText(lesson.def, lang)}</div>
            </div>

            <div className="el-syntax-box">
                <div className="el-block-label" style={{ color: '#64748b' }}>{t.syntaxTitle}</div>
                <code className="el-syntax-code code-font">{lesson.syntax}</code>
                <button className={`el-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                    {copied ? `✓ ${t.copied}` : `📋 ${t.copy}`}
                </button>
            </div>

            {lesson.explanation && (
                <div className="el-explain-box">
                    <div className="el-block-label">{t.explanation}</div>
                    <div className="el-def-text">{getTranslatedText(lesson.explanation, lang)}</div>
                </div>
            )}
        </div>
    );
};

// ---- Excel-like table with selectable cells (visual only, doesn't affect validation) ----
const ExcelTable = ({ t, table }) => {
    const [selected, setSelected] = useState(null); // {row, col}
    return (
        <>
            <div className="el-cell-tag">{selected ? `${t.selectedCell}: ${getColumnLetter(selected.col)}${selected.row + 1}` : ""}</div>
            <div className="el-table-wrap">
                <table className="el-table">
                    <thead>
                        <tr>
                            <th className="corner"></th>
                            {table[0].map((_, colIdx) => (
                                <th key={colIdx}>{getColumnLetter(colIdx)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="rownum">{rowIdx + 1}</td>
                                {row.map((cell, colIdx) => {
                                    const isSel = selected && selected.row === rowIdx && selected.col === colIdx;
                                    return (
                                        <td
                                            key={colIdx}
                                            className={`cell ${isSel ? 'selected' : ''}`}
                                            onClick={() => setSelected({ row: rowIdx, col: colIdx })}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// ---- Hint system (progressive, never leaks the full formula early) ----
const HintBox = ({ t, lang, lesson, hintLevel }) => {
    if (hintLevel <= 0) return null;

    const aiHints = lesson.hint; // может быть {ru,en,uz} строкой или {ru:[...],en:[...],uz:[...]}
    const aiHintForLang = aiHints ? aiHints[lang] || aiHints.ru : null;
    const aiHintList = Array.isArray(aiHintForLang) ? aiHintForLang : (aiHintForLang ? [aiHintForLang] : []);

    let text;
    if (hintLevel === 1) {
        text = aiHintList[0] || t.hintStep1;
    } else if (hintLevel === 2) {
        const firstFn = (lesson.expected[0] || "").match(/=[^(]+\(/);
        text = aiHintList[1] || `${t.hintStep2} ${firstFn ? firstFn[0] : "=..."}`;
    } else {
        text = lesson.expected[0] || "";
    }

    return (
        <div className="el-hint-box">
            <b>💡 {t.hintLevel} {Math.min(hintLevel, 3)}:</b> {text}
        </div>
    );
};

/* =========================================================
   4. ГЛАВНЫЙ КОМПОНЕНТ
   ========================================================= */

const ExcelTrainerLMS = ({ onBack }) => {
    const categories = Object.keys(EXCEL_DATABASE);

    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
    const [expanded, setExpanded] = useState({ [categories[0]]: true });

    const [currentLesson, setCurrentLesson] = useState(null);
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [answerStatus, setAnswerStatus] = useState('idle'); // idle | correct | incorrect
    const [customSearch, setCustomSearch] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [genError, setGenError] = useState(null);

    const [lang, setLang] = useState('ru');
    const [theme, setTheme] = useState('dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Подсказки / экзамен — раздельные состояния (см. п.32-33 ТЗ)
    const [hintsEnabled, setHintsEnabled] = useState(true); // приходит из Firebase (родительский контроль)
    const [examMode, setExamMode] = useState(false);        // переключается самим пользователем
    const [hintLevel, setHintLevel] = useState(0);
    const [examSeconds, setExamSeconds] = useState(0);

    const [toasts, setToasts] = useState([]);
    const [xpFly, setXpFly] = useState(null);

    const [progress, setProgress] = useState({ level: 1, xp: 0, completedLessons: 0, streak: 0 });

    const t = UI_DICT[lang];

    const pushToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 2600);
    };

    // ---- Firebase: слушаем профиль пользователя (логика сохранена и расширена) ----
    useEffect(() => {
        const uid = window.auth?.currentUser?.uid;
        if (!uid || !window.db) return;

        const unsub = window.db.collection('users').doc(uid).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setHintsEnabled(data.excelHintsEnabled !== false);
                setProgress(prev => ({
                    level: data.excelLevel ?? prev.level,
                    xp: data.excelXP ?? prev.xp,
                    completedLessons: data.excelCompletedLessons ?? prev.completedLessons,
                    streak: data.excelStreak ?? prev.streak,
                }));
            }
        });
        return () => unsub();
    }, []);

    const saveProgress = (nextProgress) => {
        setProgress(nextProgress);
        const uid = window.auth?.currentUser?.uid;
        if (!uid || !window.db) return;
        window.db.collection('users').doc(uid).set({
            excelXP: nextProgress.xp,
            excelLevel: nextProgress.level,
            excelCompletedLessons: nextProgress.completedLessons,
            excelStreak: nextProgress.streak,
        }, { merge: true }).catch(() => {});
    };

    useEffect(() => {
        generateAIFormula(activeFormulaName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFormulaName]);

    // Таймер экзамена
    useEffect(() => {
        if (!examMode) return;
        const id = setInterval(() => setExamSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, [examMode, currentLesson]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    /* ---- Генерация урока ИИ (endpoint, парсинг и структура промпта сохранены,
       добавлены: новые поля JSON, самопроверка, валидация + retry) ---- */
    const generateAIFormula = async (formulaName, attempt = 0) => {
        setInputValue("=");
        setAnswerStatus('idle');
        setHintLevel(0);
        setExamSeconds(0);
        setGenError(null);
        setIsGenerating(true);
        if (attempt === 0) setCurrentLesson(null);

        const themes = [
            "успеваемость и оценки студентов на экзаменах",
            "статистика забитых голов в футбольном турнире",
            "расчет сметы на строительство дома",
            "учет продаж в магазине видеоигр",
            "планирование семейного бюджета на море",
            "учет строительных материалов на складе",
            "результаты соревнований по киберспорту",
            "расходы на доставку и логистику грузов",
            "статистика кассовых сборов кинотеатра",
            "учет абонементов в фитнес-клубе",
            "затраты на корм для животных в зоопарке",
            "расписание и пассажиры авиарейсов",
            "покупка деталей для сборки мощного ПК",
            "сбор урожая яблок и картофеля на ферме",
            "меню и заказы блюд в ресторане",
            "продажи билетов на музыкальный концерт"
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        const prompt = `Ты профессиональный преподаватель Microsoft Excel.
        Пользователь выбрал функцию: "${formulaName}".
        Создай НОВУЮ уникальную интерактивную задачу по этой функции.
        Верни ТОЛЬКО чистый валидный JSON (без markdown) строго в таком формате:
        {
          "name": "${formulaName}",
          "enName": "АНГЛИЙСКОЕ_НАЗВАНИЕ",
          "difficulty": "easy | medium | hard",
          "xp": 100,
          "syntax": "=ФУНКЦИЯ(Z1:Z10)\\n=ФУНКЦИЯ(Z1; \\"Текст\\"; X1:X10)",
          "def": {
             "ru": "Подробное, простое объяснение функции на русском. Обязательно короткий пример из жизни, связанный с темой.",
             "en": "The exact same explanation and life example translated to English.",
             "uz": "Функциянинг ишлаши ҳақида батафсил тушунтириш ва ҳаётдан мисол (Кирилл алифбосида)."
          },
          "taskDesc": {
             "ru": "Напишите формулу, которая посчитает [ЧТО-ТО].",
             "en": "Write a formula that calculates [SOMETHING].",
             "uz": "Формула ёзинг, у [НИМАНИДИР] ҳисоблайди (Кирилл алифбосида)."
          },
          "hint": {
             "ru": ["Наводящий вопрос без названия функции", "Более явная подсказка, можно назвать функцию, но не всю формулу"],
             "en": ["Leading question without naming the function", "More explicit hint, function name allowed, not the full formula"],
             "uz": ["Функция номисиз йўналтирувчи савол (Кирилл алифбосида)", "Функция номи мумкин, лекин тўлиқ формула эмас (Кирилл алифбосида)"]
          },
          "explanation": {
             "ru": "Короткое объяснение, почему именно такая формула является решением.",
             "en": "Short explanation of why this exact formula is the solution.",
             "uz": "Нима учун айнан шу формула ечим эканини қисқача тушунтириш (Кирилл алифбосида)."
          },
          "table": [
            ["Заголовок1", "Заголовок2", "Заголовок3"],
            ["Значение", 100, "Значение"],
            ["Значение", 200, "Значение"]
          ],
          "expected": ["=ФУНКЦИЯ(B2:B3)"],
          "result": "Ожидаемый ответ вычисления"
        }
        КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
        1. СИНТАКСИС БЕЗ СЛОВ: В поле "syntax" пиши ТОЛЬКО примеры формул с абстрактными ячейками (Z1, X2).
        2. ФОРМУЛИРОВКА ЗАДАЧИ: В поле "taskDesc" КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упоминать ячейку для вывода результата.
        3. ЛОГИКА ОЖИДАЕМОГО ОТВЕТА ("expected"): Добавь ВСЕ правильные варианты.
        4. ЭКРАНИРОВАНИЕ: В массиве "expected" экранируй внутренние кавычки.
        5. ЕДИНАЯ ТЕМА (САМОЕ ВАЖНОЕ): Я задаю тебе тему задачи: "${randomTheme}".
           - Поля "def", "table" и "taskDesc" должны быть ИМЕННО на эту тему!
           Категорически запрещено смешивать темы.
        6. ЗАПРЕТ ШАБЛОНОВ: Не используй слова "Иванов", "Петров", "Товар", "Цена", "Категория", если они не подходят к выбранной теме.
        7. Задача должна иметь однозначный ответ.
        8. Все значения таблицы должны математически соответствовать expected и result — перед возвратом JSON самостоятельно проверь вычисление.
        9. Не создавай невозможные или противоречивые данные.
        10. Поле "hint" НЕ ДОЛЖНО содержать готовую формулу целиком — только наводящие подсказки.
        11. "difficulty" должен реально соответствовать сложности функции, а "xp" — соответствовать difficulty (easy: 50-100, medium: 100-200, hard: 200-350).`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("JSON не найден");

            const parsedFormula = JSON.parse(jsonMatch[0]);

            if (!validateLesson(parsedFormula)) {
                throw new Error("Некорректная структура урока от ИИ");
            }

            setCurrentLesson(parsedFormula);
            pushToast(t.lessonCreated, 'success');

        } catch (error) {
            console.error("Ошибка:", error);
            if (attempt < 1) {
                // одна автоматическая повторная попытка перед показом ошибки пользователю
                return generateAIFormula(formulaName, attempt + 1);
            }
            setGenError(formulaName);
            pushToast(t.error, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCustomSearch = () => {
        if (!customSearch.trim()) return;
        const fName = customSearch.trim().toUpperCase();

        if (fName === activeFormulaName) {
            generateAIFormula(fName);
        } else {
            setActiveCategory("Поиск ИИ");
            setActiveFormulaName(fName);
        }
        setCustomSearch("");
    };

    const handleSelectFromSearch = (category, fName) => {
        setSidebarOpen(false);
        if (fName === activeFormulaName) return;
        setActiveCategory(category);
        setActiveFormulaName(fName);
        setExpanded(prev => ({ ...prev, [category]: true }));
    };

    const toggleCategory = (category) => setExpanded(prev => ({ ...prev, [category]: !prev[category] }));

    const checkAnswer = () => {
        if (!currentLesson) return;
        const isCorrect = validateFormula(inputValue, currentLesson.expected);

        if (isCorrect) {
            setAnswerStatus('correct');
            const gained = currentLesson.xp || 100;
            setXpFly(gained);
            setTimeout(() => setXpFly(null), 1100);

            const totalXp = progress.xp + gained;
            const newLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;
            saveProgress({
                ...progress,
                xp: totalXp,
                level: newLevel,
                completedLessons: progress.completedLessons + 1,
            });
        } else {
            setAnswerStatus('incorrect');
            setShake(true);
            setTimeout(() => setShake(false), 400);
            setTimeout(() => setAnswerStatus('idle'), 1600);
        }
    };

    const handleHint = () => {
        if (!hintsEnabled || examMode) return;
        setHintLevel(prev => Math.min(prev + 1, 3));
    };

    const handleAnotherTask = () => generateAIFormula(activeFormulaName);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const isDone = answerStatus === 'correct';

    return (
        <div className={`excel-lms-shell theme-${theme}`}>
            <ToastStack toasts={toasts} />
            {sidebarOpen && <div className="el-sidebar-backdrop open" onClick={() => setSidebarOpen(false)} />}

            <motion.div
                className="el-app"
                initial={{ opacity: 0, y: 20 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={shake ? { duration: 0.3 } : { duration: 0.4 }}
            >
                <AppHeader
                    t={t} lang={lang} setLang={(l) => { setLang(l); pushToast(UI_DICT[l].langChanged, 'info'); }}
                    theme={theme} toggleTheme={toggleTheme}
                    onSearchSelect={handleSelectFromSearch}
                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                />

                <aside className={`el-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <AIMagicCard
                        t={t} customSearch={customSearch} setCustomSearch={setCustomSearch}
                        onGenerate={handleCustomSearch} isGenerating={isGenerating}
                    />
                    <CategoryAccordion
                        categories={categories} expanded={expanded} toggleCategory={toggleCategory}
                        activeFormulaName={activeFormulaName} isGenerating={isGenerating}
                        onSelect={(cat, fName) => { setSidebarOpen(false); setActiveCategory(cat); setActiveFormulaName(fName); }}
                    />
                    <ProgressCard t={t} progress={progress} />
                </aside>

                <main className="el-main">
                    {isGenerating || (!currentLesson && !genError) ? (
                        <div className="el-loading-box">
                            <div className="el-loading-title">✨ {t.aiTitle} {activeFormulaName}</div>
                            <div className="el-skeleton-wrap">
                                <div className="el-skeleton-line" style={{ width: '60%' }} />
                                <div className="el-skeleton-line" style={{ width: '90%' }} />
                                <div className="el-skeleton-line" style={{ width: '75%' }} />
                                <div className="el-skeleton-line" style={{ width: '100%', height: 90, marginTop: 10 }} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.aiSub}</div>
                        </div>
                    ) : genError ? (
                        <div className="el-error-box">
                            <div className="el-error-icon">⚠</div>
                            <div className="el-error-title">{t.error}</div>
                            <div className="el-error-desc">{t.errorDesc}</div>
                            <button className="el-btn el-btn-primary" style={{ width: 'auto', padding: '0 24px' }} onClick={() => generateAIFormula(activeFormulaName)}>
                                ↻ {t.retry}
                            </button>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                            <TheoryCard t={t} lang={lang} lesson={currentLesson} />

                            <div className="el-practice-card">
                                <div className="el-practice-head">
                                    <div className="el-practice-title">🎯 {t.practice}</div>
                                    {examMode && <div className="el-exam-timer">⏱ {formatTime(examSeconds)}</div>}
                                </div>

                                <p className="el-task-desc">{getTranslatedText(currentLesson.taskDesc, lang)}</p>

                                <ExcelTable t={t} table={currentLesson.table} />

                                <div className="el-formula-bar">
                                    <span className="fx">fx</span>
                                    <input
                                        type="text"
                                        className={`el-formula-input code-font ${answerStatus === 'correct' ? 'state-correct' : ''} ${answerStatus === 'incorrect' ? 'state-incorrect' : ''}`}
                                        value={inputValue}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setInputValue(v === "" ? "=" : v.toUpperCase());
                                            if (answerStatus !== 'idle') setAnswerStatus('idle');
                                        }}
                                        disabled={isDone}
                                        onKeyDown={(e) => e.key === 'Enter' && !isDone && checkAnswer()}
                                    />
                                    {answerStatus === 'correct' && <div className="el-formula-status ok">✓ {t.correct}</div>}
                                    {answerStatus === 'incorrect' && <div className="el-formula-status err">⚠ {t.incorrect}</div>}
                                </div>

                                {!isDone && hintLevel > 0 && <HintBox t={t} lang={lang} lesson={currentLesson} hintLevel={hintLevel} />}

                                <AnimatePresence>
                                    {isDone && (
                                        <motion.div
                                            className="el-success-box"
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        >
                                            <div>
                                                <h4>✓ {t.successMsg}</h4>
                                                <span className="res">{t.resultMsg} <b>{currentLesson.result}</b></span>
                                            </div>
                                            <div style={{ fontSize: 36 }}>✅</div>
                                            {xpFly && <div className="el-xp-fly">+{xpFly} XP</div>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="el-action-row">
                                    <button className="el-btn el-btn-ghost el-action-single" onClick={handleAnotherTask} disabled={isGenerating}>
                                        ↻ {t.btnAnother}
                                    </button>

                                    {!isDone ? (
                                        <div className="el-action-group">
                                            <button
                                                className={`el-btn ${examMode ? 'el-btn-locked' : 'el-btn-warn'}`}
                                                style={{ flex: 1 }}
                                                onClick={handleHint}
                                                disabled={!hintsEnabled || examMode}
                                            >
                                                {examMode ? `🔒 ${t.btnExam}` : `💡 ${t.btnHint}`}
                                            </button>
                                            <button className="el-btn el-btn-success" style={{ flex: 1 }} onClick={checkAnswer}>
                                                ✓ {t.btnCheck}
                                            </button>
                                            <button
                                                className="el-btn el-btn-outline"
                                                title={examMode ? t.examOff : t.examOn}
                                                onClick={() => setExamMode(m => !m)}
                                            >
                                                🔒
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="el-action-group">
                                            <button className="el-btn el-btn-primary" style={{ flex: 1, height: 48 }} onClick={handleAnotherTask}>
                                                → {t.btnNextTask}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </main>
            </motion.div>
        </div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
