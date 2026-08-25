/**
 * HotkeyTrainer
 * ---------------------------------------------------------------------------
 * ВАЖНО ПРО БАГ "Cannot read properties of undefined (reading 'langName')":
 * Раньше LANGS / UI_TRANSLATIONS / HOTKEYS_DB и т.д. объявлялись как `const`
 * прямо в глобальной области видимости файла. Если в приложении несколько
 * тренажёров грузятся отдельными <script type="text/babel">, они выполняются
 * в ОБЩЕМ глобальном контексте — и одноимённая переменная из другого файла
 * (например, без ключа "uz") могла подменить эту. Отсюда и обращение к
 * несуществующему полю.
 *
 * Фикс: весь файл обёрнут в IIFE. Наружу выходит ровно один символ —
 * window.HotkeyTrainer. Больше никакие имена никуда не "утекают" и ни с чем
 * не конфликтуют, из какого бы ещё тренажёра он ни грузился на той же странице.
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { Button, shuffleArray } = window;

    // Соответствие "цифра/символ" -> символ, который реально приходит в e.key,
    // когда клавиша нажата вместе с Shift (US-раскладка). Нужно, чтобы можно
    // было хранить key как обычную цифру ("9"), а не гадать, что пришлёт браузер.
    const SHIFT_SYMBOL_MAP = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
        ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
    };

    // Штатная база горячих клавиш. desc хранится "ключом перевода" (descKey),
    // само отображаемое описание берётся из HOTKEY_DESC_TRANSLATIONS[lang][descKey] —
    // так база остаётся одна для всех языков.
    const HOTKEYS_DB = [
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
        { descKey: "fontSmaller", key: "1", shift: true, visual: "Ctrl + Shift + 1" },
        { descKey: "fontBigger", key: "9", shift: true, visual: "Ctrl + Shift + 9" },
        { descKey: "doubleUnderline", key: "d", shift: true, visual: "Ctrl + Shift + D" },
        { descKey: "allCaps", key: "a", shift: true, visual: "Ctrl + Shift + A" },
        { descKey: "underlineWords", key: "w", shift: true, visual: "Ctrl + Shift + W" },
        { descKey: "newTab", key: "t", shift: false, visual: "Ctrl + T" },
        { descKey: "newFile", key: "n", shift: false, visual: "Ctrl + N" },
        { descKey: "bold", key: "b", shift: false, visual: "Ctrl + B" }
    ];

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
            loadedSuccess: (topic) => `База «${topic}» загружена`,
            startTraining: "Начать тренировку",
            theoryStep: "Шаг 1 из 2",
            theoryTitle: "Теория",
            theoryDesc: "Изучи комбинации, которые встретятся в этой тренировке, а затем закрепи их на практике.",
            exit: "Выйти",
            goToPractice: "Перейти к практике",
            doCombination: "Выполните комбинацию",
            escToExit: "Esc — выйти",
            finishedTitle: "Отличная работа!",
            finishedDesc: (score, total) => `Закреплено ${score} из ${total} горячих клавиш`,
            repeat: "Пройти ещё раз",
            errorNoTopic: "Сначала введи название программы",
            errorFailed: "Не удалось получить список клавиш. Попробуй переформулировать запрос или повтори позже",
            defaultBaseName: null
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
            loadedSuccess: (topic) => `"${topic}" set loaded`,
            startTraining: "Start training",
            theoryStep: "Step 1 of 2",
            theoryTitle: "Theory",
            theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
            exit: "Exit",
            goToPractice: "Go to practice",
            doCombination: "Perform the combination",
            escToExit: "Esc to exit",
            finishedTitle: "Great job!",
            finishedDesc: (score, total) => `You locked in ${score} of ${total} hotkeys`,
            repeat: "Try again",
            errorNoTopic: "Enter a program name first",
            errorFailed: "Couldn't fetch the hotkey set. Try rephrasing the topic or retry later",
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
            loadedSuccess: (topic) => `«${topic}» базаси юкланди`,
            startTraining: "Машқни бошлаш",
            theoryStep: "1-қадам, 2 тадан",
            theoryTitle: "Назария",
            theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
            exit: "Чиқиш",
            goToPractice: "Амалиётга ўтиш",
            doCombination: "Комбинацияни бажаринг",
            escToExit: "Esc — чиқиш",
            finishedTitle: "Ажойиб натижа!",
            finishedDesc: (score, total) => `${total} тадан ${score} та хоткей мустаҳкамланди`,
            repeat: "Яна бир бор такрорлаш",
            errorNoTopic: "Аввал дастур номини киритинг",
            errorFailed: "Хоткейлар рўйхатини олиб бўлмади. Мавзуни бошқача ёзиб кўринг ёки кейинроқ қайта уриниб кўринг",
            defaultBaseName: null
        }
    };

    // Название языка для промпта, отправляемого ИИ (чтобы описания приходили на нужном языке)
    const AI_LANG_HINT = {
        ru: "русском",
        en: "английском (English)",
        uz: "узбекском языке кириллицей (o'zbek tilida, kirill alifbosida)"
    };

    const LANGS = ["ru", "en", "uz"];
    const LANG_LABEL = { ru: "РУС", en: "ENG", uz: "ЎЗБ" };

    // === Иконки карточек теории ===
    // Каждому descKey сопоставлена короткая пиктограмма (эмодзи или буква).
    // Для кастомных ИИ-баз (без descKey) используется первая буква "key".
    const HOTKEY_ICONS = {
        alignRight: "➡️",
        alignLeft: "⬅️",
        undo: "↩️",
        cut: "✂️",
        alignCenter: "↔️",
        selectAll: "A",
        italic: "I",
        print: "🖨️",
        underline: "U",
        save: "💾",
        copy: "📄",
        paste: "📋",
        openFile: "📂",
        closeDoc: "✖️",
        find: "🔍",
        findReplace: "🔁",
        redo: "↪️",
        hyperlink: "🔗",
        fontSmaller: "A−",
        fontBigger: "A+",
        doubleUnderline: "U",
        allCaps: "AA",
        underlineWords: "W",
        newTab: "🗂️",
        newFile: "📄",
        bold: "B"
    };

    // Палитра цветов для иконок — циклически применяется по индексу карточки,
    // чтобы список выглядел живо и разнообразно, как на макете.
    const ICON_PALETTE = [
        { bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },  // фиолетовый
        { bg: 'rgba(20,184,166,0.16)', fg: '#2dd4bf' },  // бирюзовый
        { bg: 'rgba(16,185,129,0.16)', fg: '#34d399' },  // изумрудный
        { bg: 'rgba(244,63,94,0.15)',  fg: '#fb7185' },  // розовый
        { bg: 'rgba(249,115,22,0.16)', fg: '#fb923c' },  // оранжевый
        { bg: 'rgba(34,197,94,0.16)',  fg: '#4ade80' },  // зелёный
        { bg: 'rgba(14,165,233,0.16)', fg: '#38bdf8' },  // голубой
        { bg: 'rgba(168,85,247,0.16)', fg: '#c084fc' }   // сиреневый
    ];

    // Возвращает {icon, bg, fg, isLetter} для карточки теории по её позиции в списке.
    // Чистая функция без замыканий — вынесена за пределы компонента.
    const getHotkeyIconMeta = (hk, index) => {
        const palette = ICON_PALETTE[index % ICON_PALETTE.length];
        const rawIcon = hk.descKey ? (HOTKEY_ICONS[hk.descKey] ?? hk.key.toUpperCase()) : hk.key.toUpperCase();
        const isLetter = /^[A-Za-zА-Яа-я+\-]{1,3}$/.test(rawIcon);
        return { icon: rawIcon, bg: palette.bg, fg: palette.fg, isLetter };
    };

    // Общий стиль "физической" клавиши — вынесен за пределы компонента:
    // это чистая функция без замыканий, пересоздавать её на каждый рендер незачем.
    const keycapStyle = (accent, muted) => ({
        padding: '15px 24px',
        background: muted
            ? 'var(--bg-body)'
            : 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-body) 100%)',
        border: '1px solid var(--glass-border)',
        borderBottom: accent ? `3px solid ${accent}` : '3px solid var(--glass-border)',
        borderRadius: '11px',
        fontSize: '20px',
        fontWeight: '800',
        fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace",
        color: accent || 'var(--text-main)',
        letterSpacing: '0.3px',
        boxShadow: muted
            ? 'none'
            : '0 4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
        minWidth: '26px',
        textAlign: 'center',
        opacity: muted ? 0.45 : 1
    });

    // Переключатель языка интерфейса — вынесен в отдельный компонент верхнего
    // уровня (а не пересоздаётся заново на каждый рендер родителя, как было
    // раньше), это даёт framer-motion стабильную идентичность узлов.
    const LanguageSwitcher = ({ lang, onChange, style }) => (
        <div style={{ display: 'flex', gap: '6px', ...style }}>
            {LANGS.map((code) => {
                const meta = UI_TRANSLATIONS[code];
                if (!meta) return null; // защита: не падать, даже если языка нет в словаре
                const active = lang === code;
                return (
                    <motion.button
                        key={code}
                        type="button"
                        whileHover={{ y: active ? 0 : -1 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => onChange(code)}
                        title={meta.langName}
                        aria-pressed={active}
                        style={{
                            padding: '7px 12px',
                            borderRadius: '999px',
                            border: active ? '1px solid transparent' : '1px solid var(--glass-border)',
                            background: active
                                ? 'linear-gradient(120deg, #8b5cf6, #6d28d9)'
                                : 'var(--bg-body)',
                            color: active ? '#fff' : 'var(--text-sec)',
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            boxShadow: active ? '0 6px 16px -6px rgba(109,40,217,0.6)' : 'none'
                        }}
                    >
                        {LANG_LABEL[code]}
                    </motion.button>
                );
            })}
        </div>
    );

    // Сигнатурный элемент: ряд "подсвеченных клавиш" вместо обычной полоски
    // прогресса. Каждая клавиша ряда — одно задание: пройденные горят тёплым,
    // текущая мягко пульсирует, будущие — притушены. Раз тема — клавиатура,
    // прогресс тоже показан клавиатурой, а не абстрактным баром.
    const KeyRow = ({ total, currentIndex }) => (
        <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: total }).map((_, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                    <motion.div
                        key={i}
                        animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                        transition={active ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } : { duration: 0.2 }}
                        style={{
                            width: '22px',
                            height: '9px',
                            borderRadius: '3px',
                            background: done
                                ? 'linear-gradient(90deg, #f6d365, #fda085)'
                                : active
                                    ? 'var(--accent-glow, #0ea5e9)'
                                    : 'var(--glass-border)',
                            boxShadow: done
                                ? '0 0 8px rgba(253,160,133,0.55)'
                                : active
                                    ? '0 0 10px rgba(14,165,233,0.55)'
                                    : 'none',
                            transition: 'background 0.25s ease, box-shadow 0.25s ease'
                        }}
                    />
                );
            })}
        </div>
    );

    // Инлайн-баннер ошибки — вместо блокирующего window.alert(), который рвёт
    // атмосферу тренажёра и не вписывается в дизайн-систему приложения.
    const ErrorBanner = ({ children }) => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            role="alert"
            style={{
                fontSize: '13px', color: '#ef4444', fontWeight: 700, textAlign: 'center',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '11px', padding: '10px 14px', lineHeight: 1.5
            }}
        >
            {children}
        </motion.div>
    );

    const HotkeyTrainer = ({ onBack }) => {
        const [tasks, setTasks] = useState([]);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [score, setScore] = useState(0);
        const [shake, setShake] = useState(false);
        const [successPulse, setSuccessPulse] = useState(false);
        const [isFinished, setIsFinished] = useState(false);
        // 'setup' — экран настройки, 'theory' — раздел теории, 'practice' — тренировка
        const [phase, setPhase] = useState('setup');

        const [lang, setLang] = useState('ru');
        const t = UI_TRANSLATIONS[lang];

        const [topic, setTopic] = useState("Microsoft Word");
        const [isGenerating, setIsGenerating] = useState(false);
        const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
        const [isCustomBase, setIsCustomBase] = useState(false);
        const [genError, setGenError] = useState(null);

        // Отменяем "зависший" запрос к ИИ, если компонент размонтировали
        // посреди генерации (например, юзер вышел из тренажёра).
        const abortRef = useRef(null);
        useEffect(() => () => abortRef.current?.abort(), []);

        // Достаёт локализованное описание хоткея независимо от того,
        // штатная это база (descKey) или сгенерированная ИИ (desc уже готовой строкой)
        const getDesc = (hk) => {
            if (hk.descKey) {
                return HOTKEY_DESC_TRANSLATIONS[lang]?.[hk.descKey]
                    ?? HOTKEY_DESC_TRANSLATIONS.ru[hk.descKey]
                    ?? hk.descKey;
            }
            return hk.desc ?? '—';
        };

        const generateAIHotkeys = async () => {
            const cleanTopic = topic.trim();
            if (!cleanTopic) {
                setGenError(t.errorNoTopic);
                return;
            }

            setGenError(null);
            setIsGenerating(true);
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            const prompt = `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${cleanTopic}", без каких-либо фантазий, догадок или "правдоподобных" комбинаций.

Верни 10 горячих клавиш (с Ctrl или Cmd, некоторые могут дополнительно включать Shift) для программы "${cleanTopic}".

СТРОГИЕ ПРАВИЛА (нарушение недопустимо):
1. НЕ ПРИДУМЫВАЙ комбинации. Используй только те горячие клавиши, которые реально существуют и задокументированы в официальной справке/документации программы "${cleanTopic}". Если не уверен, что комбинация существует именно в этой программе — не включай её.
2. Если для "${cleanTopic}" в принципе не существует 10 разных официальных комбинаций с Ctrl/Cmd — верни столько, сколько действительно существует (не меньше 5, не выдумывая недостающие).
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
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                if (data.error) throw new Error(data.error.message || "API error");
                if (!data.candidates?.length) throw new Error("Empty AI response");

                const aiText = (data.candidates[0]?.content?.parts?.[0]?.text ?? '').trim();
                const jsonMatch = aiText.match(/\[[\s\S]*\]/);
                if (!jsonMatch) throw new Error("No JSON array in AI response");

                const parsed = JSON.parse(jsonMatch[0]);
                if (!Array.isArray(parsed)) throw new Error("Not an array");

                // Валидируем и отбрасываем битые записи, а не роняем весь тренажёр
                // из-за одного кривого объекта в ответе ИИ.
                const validated = parsed
                    .filter(hk => hk && typeof hk.key === 'string' && hk.key.trim().length > 0 && typeof hk.desc === 'string')
                    .map(hk => ({
                        desc: hk.desc.trim(),
                        key: hk.key.trim().toLowerCase().slice(0, 1),
                        shift: !!hk.shift,
                        visual: typeof hk.visual === 'string' && hk.visual.trim() ? hk.visual : `Ctrl${hk.shift ? ' + Shift' : ''} + ${hk.key.trim().toUpperCase()}`
                    }));

                if (validated.length === 0) throw new Error("No valid hotkeys after validation");

                setActiveHotkeys(validated);
                setIsCustomBase(true);
            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error("HotkeyTrainer: generation failed —", error);
                setGenError(t.errorFailed);
                setActiveHotkeys(HOTKEYS_DB);
                setIsCustomBase(false);
            } finally {
                setIsGenerating(false);
            }
        };

        // Формирует набор заданий и переходит в раздел теории (перед практикой)
        const openTheory = () => {
            setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length)));
            setCurrentIndex(0);
            setScore(0);
            setIsFinished(false);
            setPhase('theory');
        };

        const startGame = () => setPhase('practice');

        // Повтор: новый набор заданий, сразу в практику, без теории
        const resetGame = () => {
            setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length)));
            setCurrentIndex(0);
            setScore(0);
            setIsFinished(false);
            setPhase('practice');
        };

        const leaveGame = () => {
            setPhase('setup');
            setActiveHotkeys(HOTKEYS_DB);
            setIsCustomBase(false);
            setGenError(null);
        };

        useEffect(() => {
            if (phase !== 'practice' || isFinished || tasks.length === 0) return;

            const handleKeyDown = (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                if (e.key === 'Escape') {
                    e.preventDefault();
                    leaveGame();
                    return;
                }
                if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;

                const isCtrlOrCmd = e.ctrlKey || e.metaKey;
                const currentTask = tasks[currentIndex];
                if (!currentTask) return;

                if (!isCtrlOrCmd) {
                    setShake(true);
                    setTimeout(() => setShake(false), 300);
                    return;
                }

                e.preventDefault();

                const requiresShift = !!currentTask.shift;
                const isShiftPressed = e.shiftKey;
                const pressedKey = e.key.toLowerCase();
                const expectedKey = currentTask.key.toLowerCase();
                // При зажатом Shift браузер может прислать не саму цифру/символ, а её
                // "сдвинутую" версию (например "!" вместо "1") — проверяем обе формы.
                const expectedShiftedKey = SHIFT_SYMBOL_MAP[expectedKey] || expectedKey;
                const keyMatches = pressedKey === expectedKey || pressedKey === expectedShiftedKey;

                if (isShiftPressed === requiresShift && keyMatches) {
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
            };

            window.addEventListener("keydown", handleKeyDown, { passive: false });
            return () => window.removeEventListener("keydown", handleKeyDown);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentIndex, tasks, isFinished, phase]);

        // === СТАРТОВЫЙ ЭКРАН ===
        if (phase === 'setup') {
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', position: 'relative', zIndex: 2 }}>
                        <LanguageSwitcher lang={lang} onChange={setLang} />
                    </div>

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
                            {t.title}
                        </h2>
                        <span style={{
                            fontSize: '10px', fontWeight: '900', background: 'linear-gradient(120deg, #a855f7, #6d28d9)', color: '#ffffff',
                            padding: '6px 12px', borderRadius: '999px', letterSpacing: '1.2px', textTransform: 'uppercase',
                            boxShadow: '0 6px 18px -6px rgba(109,40,217,0.6)', alignSelf: 'center'
                        }}>
                            {t.aiPowered}
                        </span>
                    </div>

                    <p style={{
                        fontSize: '15px', color: 'var(--text-sec)', maxWidth: '460px', lineHeight: '1.7',
                        textAlign: 'center', fontWeight: 500, margin: 0
                    }}>
                        {t.subtitle}
                    </p>

                    <div style={{
                        width: '100%', maxWidth: '520px', background: 'var(--bg-body)', border: '1px solid var(--glass-border)',
                        borderRadius: '20px', padding: '24px', marginTop: '6px', boxShadow: '0 10px 28px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase',
                            letterSpacing: '1.4px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                            {t.customPanelLabel}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) generateAIHotkeys(); }}
                                placeholder={t.inputPlaceholder}
                                aria-label={t.customPanelLabel}
                                style={{
                                    flex: '1 1 180px', padding: '13px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                    outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600,
                                    transition: 'border-color 0.2s ease'
                                }}
                                disabled={isGenerating}
                            />
                            <motion.button
                                type="button"
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
                                {isGenerating ? t.generating : t.generateButton}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {isCustomBase && !isGenerating && !genError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    style={{
                                        fontSize: '13px', color: '#10b981', fontWeight: 700, textAlign: 'center',
                                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '11px', padding: '10px'
                                    }}
                                >
                                    ✓ {t.loadedSuccess(topic)}
                                </motion.div>
                            )}
                            {genError && <ErrorBanner key="err">{genError}</ErrorBanner>}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '10px', width: '100%', maxWidth: '420px', justifyContent: 'center' }}>
                        <Button variant="orange" onClick={openTheory} style={{ flex: 1, height: '53px', fontSize: '16px', borderRadius: '14px', fontWeight: 800 }}>
                            🚀 {t.startTraining}
                        </Button>
                    </div>
                </motion.div>
            );
        }

        // === РАЗДЕЛ ТЕОРИИ ===
        if (phase === 'theory') {
            return (
                <motion.div
                    className="glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '34px', margin: '0 auto' }}
                >
                    <header style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                            <LanguageSwitcher lang={lang} onChange={setLang} />
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            gap: '16px', marginBottom: '6px', flexWrap: 'wrap'
                        }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.6px' }}>
                                {t.theoryStep}
                            </div>
                            {/* Шаговый индикатор: теория -> практика, вместо простого текста */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '34px', height: '6px', borderRadius: '3px', background: 'linear-gradient(120deg, #8b5cf6, #6d28d9)', boxShadow: '0 0 8px rgba(139,92,246,0.5)' }} />
                                <div style={{ width: '34px', height: '6px', borderRadius: '3px', background: 'var(--glass-border)' }} />
                            </div>
                        </div>
                        <h2 style={{
                            margin: 0, fontSize: '27px', fontWeight: 900, letterSpacing: '-0.5px',
                            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            {t.theoryTitle}{isCustomBase ? `: ${topic}` : ''}
                        </h2>
                    </header>

                    <p style={{ fontSize: '14px', color: 'var(--text-sec)', fontWeight: 500, margin: 0, lineHeight: '1.6' }}>
                        {t.theoryDesc}
                    </p>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px',
                        maxHeight: '420px', overflowY: 'auto', paddingRight: '4px'
                    }}>
                        {tasks.map((hk, i) => {
                            const iconMeta = getHotkeyIconMeta(hk, i);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                                    style={{
                                        display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '14px', padding: '16px',
                                        background: 'var(--bg-body)', border: '1px solid var(--glass-border)', borderRadius: '14px'
                                    }}
                                >
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: iconMeta.bg, color: iconMeta.fg,
                                        fontSize: iconMeta.isLetter ? '17px' : '19px', fontWeight: 800,
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {iconMeta.icon}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.4' }}>
                                            {getDesc(hk)}
                                        </div>
                                        <div style={{
                                            alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '8px',
                                            background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-body) 100%)',
                                            border: '1px solid var(--glass-border)', borderBottom: '2px solid var(--glass-border)',
                                            fontSize: '13px', fontWeight: '800', fontFamily: "ui-monospace, monospace",
                                            color: 'var(--accent-glow, #0ea5e9)', letterSpacing: '0.2px'
                                        }}>
                                            {hk.visual}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
                        <Button variant="muted" onClick={leaveGame} style={{ flex: '0 0 150px', height: '53px', fontSize: '15px', borderRadius: '14px', fontWeight: 800 }}>
                            {t.exit}
                        </Button>
                        <Button variant="orange" onClick={startGame} style={{ flex: 1, height: '53px', fontSize: '16px', borderRadius: '14px', fontWeight: 800 }}>
                            {t.goToPractice} →
                        </Button>
                    </div>
                </motion.div>
            );
        }

        if (tasks.length === 0) return null;

        const currentTask = tasks[currentIndex];

        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={shake ? { duration: 0.3 } : { duration: 0.5, ease: "easeOut" }}
                style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '28px', padding: '34px', margin: '0 auto' }}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <LanguageSwitcher lang={lang} onChange={setLang} />
                </div>

                <header style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '18px',
                    borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px'
                }}>
                    <motion.button
                        type="button"
                        whileHover={{ x: -2, opacity: 1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={leaveGame}
                        title={t.escToExit}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px', background: 'transparent', border: 'none',
                            cursor: 'pointer', color: 'var(--text-sec)', fontSize: '14px', fontWeight: 700,
                            padding: '8px 6px', opacity: 0.85, justifySelf: 'start'
                        }}
                    >
                        <span style={{ fontSize: '17px', lineHeight: 1 }}>←</span> {t.exit}
                    </motion.button>

                    <h2 style={{
                        margin: 0, fontSize: '25px', fontWeight: 900, letterSpacing: '-0.5px', textAlign: 'center',
                        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        {isCustomBase ? `${t.title}: ${topic}` : `${t.title} ⚡`}
                    </h2>

                    <div style={{
                        display: 'flex', alignItems: 'baseline', gap: '6px', justifySelf: 'end',
                        padding: '9px 18px', borderRadius: '999px', background: 'var(--bg-body)',
                        border: '1px solid var(--glass-border)', fontFamily: "ui-monospace, monospace"
                    }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>{Math.min(currentIndex + 1, tasks.length)}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-sec)', opacity: 0.5 }}>/</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-sec)' }}>{tasks.length}</span>
                    </div>
                </header>

                {!isFinished ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '34px', padding: '12px 0' }}>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', textAlign: 'center' }}>
                            {t.doCombination}
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
                            «{getDesc(currentTask)}»
                        </motion.div>

                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={keycapStyle(null)}>Ctrl</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.5 }}>+</div>

                            {currentTask.shift && (
                                <>
                                    <div style={keycapStyle(null)}>Shift</div>
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

                        <div style={{ marginTop: '8px' }}>
                            <KeyRow total={tasks.length} currentIndex={currentIndex} />
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
                        <h2 style={{ fontSize: '38px', margin: 0, fontWeight: 900, color: '#10b981', letterSpacing: '-0.6px' }}>{t.finishedTitle}</h2>
                        <p style={{ fontSize: '16px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                            {t.finishedDesc(score, tasks.length)}
                        </p>
                        <Button variant="orange" onClick={resetGame} style={{ width: '260px', marginTop: '20px', height: '51px', borderRadius: '14px', fontSize: '15px', fontWeight: 800 }}>
                            {t.repeat}
                        </Button>
                    </motion.div>
                )}
            </motion.div>
        );
    };

    Object.assign(window, { HotkeyTrainer });
})();
