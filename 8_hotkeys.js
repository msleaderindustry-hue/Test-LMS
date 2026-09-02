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
 * ОБНОВЛЕНИЕ ДИЗАЙНА (2026):
 * Визуальный слой полностью переработан под glassmorphism-систему с полной 
 * поддержкой смены тем (Light/Dark) через CSS-переменные платформы. 
 * Бизнес-логика — AI-генерация, обработка клавиатуры, фазы setup/theory/practice, 
 * переводы, HOTKEYS_DB — НЕ ИЗМЕНЕНА.
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

    // ==========================================================================
    // ДИЗАЙН-ТОКЕНЫ С ПОДДЕРЖКОЙ ТЕМ (LIGHT/DARK)
    // ==========================================================================
    const HK_TOKENS = {
        purple: '#8B5CF6',
        purpleDark: '#6D28D9',
        yellow: '#F6D365',
        orange: '#FDA085',
        blue: '#38BDF8',
        green: '#34D399',
        pink: '#F472B6',
        cyan: '#22D3EE'
    };

    const GRADIENT_WARM = `linear-gradient(135deg, ${HK_TOKENS.yellow} 0%, ${HK_TOKENS.orange} 100%)`;
    const GRADIENT_PURPLE = `linear-gradient(135deg, ${HK_TOKENS.purple} 0%, ${HK_TOKENS.purpleDark} 100%)`;
    const GRADIENT_BLUE = `linear-gradient(135deg, ${HK_TOKENS.purple} 0%, ${HK_TOKENS.blue} 100%)`;

    let hkStylesInjected = false;
    const injectHkStyles = () => {
        if (hkStylesInjected || typeof document === 'undefined') return;
        if (document.getElementById('hk-trainer-styles')) { hkStylesInjected = true; return; }
        const style = document.createElement('style');
        style.id = 'hk-trainer-styles';
        style.textContent = `
            .hk-scroll::-webkit-scrollbar { width: 5px; }
            .hk-scroll::-webkit-scrollbar-track { background: transparent; }
            .hk-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.5); border-radius: 999px; }
            @keyframes hkFloat { 0%, 100% { transform: translateY(0px) rotate(-6deg); } 50% { transform: translateY(-8px) rotate(-3deg); } }
            .hk-visual-float { animation: hkFloat 4.5s ease-in-out infinite; }
            @media (max-width: 900px) {
                .hk-practice-grid { grid-template-columns: 1fr !important; }
                .hk-visual-side { order: 3; margin: 0 auto; }
            }
            @media (max-width: 650px) {
                .hk-theory-grid { grid-template-columns: 1fr !important; }
                .hk-setup-toprow { flex-wrap: wrap; justify-content: center !important; }
                .hk-program-row { flex-direction: column; align-items: stretch !important; }
                .hk-program-row > * { width: 100% !important; }
                
                /* Исправление наложения шапки Practice на мобилках */
                .hk-practice-header {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    justify-content: space-between !important;
                    gap: 12px !important;
                }
                .hk-practice-header h2 {
                    order: 3;
                    width: 100%;
                    margin-top: 4px !important;
                }
                .hk-practice-controls {
                    order: 2;
                }
                .hk-lang-btn {
                    padding: 6px 10px !important;
                    font-size: 11px !important;
                }
                .hk-progress-pill {
                    padding: 7px 12px !important;
                }
            }
        `;
        document.head.appendChild(style);
        hkStylesInjected = true;
    };

    // -------------------------------------------------------------------
    // Иконки — простые инлайн SVG
    // -------------------------------------------------------------------
    const ICON_PATHS = {
        undo: <path d="M4 10h9a5 5 0 1 1 0 10h-3M4 10l4-4M4 10l4 4" />,
        redo: <path d="M20 10h-9a5 5 0 1 0 0 10h3M20 10l-4-4M20 10l-4 4" />,
        scissors: (
            <g>
                <circle cx="6" cy="6" r="2.4" />
                <circle cx="6" cy="18" r="2.4" />
                <path d="M8.5 7.5 20 18M8.5 16.5 20 6" />
            </g>
        ),
        copy: (
            <g>
                <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
                <path d="M5.5 15.5H4.8A1.8 1.8 0 0 1 3 13.7V4.8A1.8 1.8 0 0 1 4.8 3h8.9a1.8 1.8 0 0 1 1.8 1.8v.7" />
            </g>
        ),
        clipboard: (
            <g>
                <rect x="5" y="4.5" width="14" height="16" rx="2" />
                <rect x="8.5" y="3" width="7" height="3" rx="1" />
                <path d="M8.5 12h7M8.5 16h7" />
            </g>
        ),
        printer: (
            <g>
                <rect x="6" y="9" width="12" height="7" rx="1.4" />
                <path d="M7.5 9V4.5h9V9M7.5 20h9v-4.5h-9V20Z" />
            </g>
        ),
        search: (
            <g>
                <circle cx="10.5" cy="10.5" r="6" />
                <path d="M19 19l-4.3-4.3" />
            </g>
        ),
        replace: (
            <g>
                <path d="M6 8h11l-3-3M18 16H7l3 3" />
            </g>
        ),
        select: (
            <g>
                <path d="M12 4v16M8 6.5C8 5 9.5 4 12 4s4 1 4 2.5M8 17.5c0 1.5 1.5 2.5 4 2.5s4-1 4-2.5" />
            </g>
        ),
        bold: (
            <path d="M7 4.5h6a3.3 3.3 0 0 1 0 6.6H7Zm0 6.6h6.8a3.4 3.4 0 0 1 0 6.8H7Z" />
        ),
        italic: <path d="M11 4.5h6M7 19.5h6M14.5 4.5 9.5 19.5" />,
        underline: <path d="M6 4.5v6.5a6 6 0 0 0 12 0V4.5M5 19.5h14" />,
        save: (
            <g>
                <path d="M5 4.5h11l3 3V19a.5.5 0 0 1-.5.5h-13A.5.5 0 0 1 5 19Z" />
                <path d="M8 4.5v5h7v-5M8 14h8v5.5H8Z" />
            </g>
        ),
        folder: <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h4l2 2.2h7A1.5 1.5 0 0 1 20 8.7V17a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17Z" />,
        close: (
            <g>
                <path d="M6 4.5h9l3 3V19a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 19Z" />
                <path d="m10.5 11 4 4m0-4-4 4" />
            </g>
        ),
        link: <path d="M9.5 14.5 14.5 9.5M11 6.5l1.6-1.6a3.4 3.4 0 0 1 4.8 4.8L15.8 11.3M13 17.5l-1.6 1.6a3.4 3.4 0 0 1-4.8-4.8l1.6-1.6" />,
        alignRight: <path d="M20 5H4M20 9.7H10M20 14.3H4M20 19H10" />,
        alignLeft: <path d="M4 5h16M4 9.7h10M4 14.3h16M4 19h10" />,
        alignCenter: <path d="M4 5h16M7 9.7h10M4 14.3h16M7 19h10" />,
        fontSize: (
            <g>
                <path d="m4 16 3.4-9L11 16M5 13h4.8" />
                <path d="M14 12.5a2.5 3 0 1 1 5 0v3.5M19 12.5v3.5" />
            </g>
        ),
        caps: <path d="M4 17 8 6l4 11M5.4 13.5H10.6M15 6h5M17.5 6v11" />,
        tab: (
            <g>
                <rect x="4" y="6" width="16" height="12" rx="2" />
                <path d="M13 9v6M15.5 12h-5" />
            </g>
        ),
        filePlus: (
            <g>
                <path d="M7 3.5h6l4 4V20a.5.5 0 0 1-.5.5h-9.5A.5.5 0 0 1 6.5 20V4A.5.5 0 0 1 7 3.5Z" />
                <path d="M12 12v5M9.5 14.5h5" />
            </g>
        ),
        zap: <path d="M12.8 3 6 13h5l-1 8 7-11h-5Z" />,
        check: <path d="M5 13l5 5L19 7" />
    };

    const HK_ICON_META = {
        undo: { icon: 'undo', color: 'purple' },
        redo: { icon: 'redo', color: 'purple' },
        cut: { icon: 'scissors', color: 'orange' },
        copy: { icon: 'copy', color: 'cyan' },
        paste: { icon: 'clipboard', color: 'blue' },
        print: { icon: 'printer', color: 'purple' },
        find: { icon: 'search', color: 'blue' },
        findReplace: { icon: 'replace', color: 'pink' },
        selectAll: { icon: 'select', color: 'green' },
        bold: { icon: 'bold', color: 'green' },
        italic: { icon: 'italic', color: 'purple' },
        underline: { icon: 'underline', color: 'blue' },
        doubleUnderline: { icon: 'underline', color: 'blue' },
        underlineWords: { icon: 'underline', color: 'blue' },
        save: { icon: 'save', color: 'cyan' },
        openFile: { icon: 'folder', color: 'orange' },
        closeDoc: { icon: 'close', color: 'pink' },
        hyperlink: { icon: 'link', color: 'blue' },
        alignRight: { icon: 'alignRight', color: 'purple' },
        alignLeft: { icon: 'alignLeft', color: 'purple' },
        alignCenter: { icon: 'alignCenter', color: 'purple' },
        fontSmaller: { icon: 'fontSize', color: 'yellow' },
        fontBigger: { icon: 'fontSize', color: 'yellow' },
        allCaps: { icon: 'caps', color: 'green' },
        newTab: { icon: 'tab', color: 'orange' },
        newFile: { icon: 'filePlus', color: 'cyan' }
    };

    const HK_COLOR_CYCLE = ['purple', 'cyan', 'blue', 'orange', 'pink', 'green'];

    const hkColorValue = (name) => HK_TOKENS[name] || HK_TOKENS.purple;

    const getHotkeyVisualMeta = (hk, index) => {
        if (hk.descKey && HK_ICON_META[hk.descKey]) return HK_ICON_META[hk.descKey];
        const color = HK_COLOR_CYCLE[index % HK_COLOR_CYCLE.length];
        return { icon: 'zap', color };
    };

    const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => {
        const body = ICON_PATHS[name] || ICON_PATHS.zap;
        return (
            <svg
                width={size} height={size} viewBox="0 0 24 24" fill="none"
                stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
            >
                {body}
            </svg>
        );
    };

    // -------------------------------------------------------------------
    // AppLogo — [⚡] Хоткеи [AI POWERED]
    // -------------------------------------------------------------------
    const AppLogo = ({ title, badge }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <motion.div
                initial={{ rotate: -8, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '44px', height: '44px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: GRADIENT_WARM, boxShadow: '0 10px 22px -8px rgba(253,160,133,0.55), inset 0 1px 1px rgba(255,255,255,0.4)',
                    flexShrink: 0
                }}
            >
                <Icon name="zap" size={22} color="#1a1206" strokeWidth={2.2} />
            </motion.div>
            <h2 style={{
                margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--text-main)'
            }}>
                {title}
            </h2>
            {badge && (
                <span style={{
                    fontSize: '10px', fontWeight: 900, background: GRADIENT_PURPLE, color: '#fff',
                    padding: '5px 11px', borderRadius: '999px', letterSpacing: '1.2px', textTransform: 'uppercase',
                    boxShadow: '0 6px 16px -6px rgba(109,40,217,0.6)'
                }}>
                    {badge}
                </span>
            )}
        </div>
    );

    // -------------------------------------------------------------------
    // GlassPanel — Обёртка с родным классом "glass-panel"
    // -------------------------------------------------------------------
    const GlassPanel = React.forwardRef(({ children, style, maxWidth = '820px', className = '', ...rest }, ref) => (
        <motion.div
            ref={ref}
            className={`glass-panel hk-scope ${className}`}
            style={{
                width: '100%', maxWidth, margin: '0 auto', position: 'relative', overflow: 'hidden',
                padding: '48px 36px',
                ...style
            }}
            {...rest}
        >
            {children}
        </motion.div>
    ));

    const GradientButton = ({ variant = 'primary', children, onClick, disabled, type = 'button', style, title, muted }) => {
        const background =
            muted ? 'transparent'
                : variant === 'primary' ? GRADIENT_WARM
                    : GRADIENT_BLUE;
        const color = muted ? 'var(--text-sec)' : (variant === 'primary' ? '#1a1206' : '#fff');
        const shadow = muted ? 'none'
            : variant === 'primary'
                ? '0 14px 30px -12px rgba(253,160,133,0.55)'
                : '0 14px 30px -12px rgba(109,40,217,0.55)';
        return (
            <motion.button
                type={type}
                title={title}
                whileHover={disabled ? {} : { y: -2 }}
                whileTap={disabled ? {} : { scale: 0.97 }}
                onClick={onClick}
                disabled={disabled}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                    padding: '0 26px', height: '54px', borderRadius: '16px', border: muted ? `1px solid var(--glass-border)` : 'none',
                    background, color, fontWeight: 800, fontSize: '15px', letterSpacing: '0.2px',
                    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.65 : 1,
                    boxShadow: shadow, whiteSpace: 'nowrap',
                    ...style
                }}
            >
                {children}
            </motion.button>
        );
    };

    const LanguageSwitcher = ({ lang, onChange, style }) => (
        <div style={{ display: 'flex', gap: '6px', ...style }}>
            {LANGS.map((code) => {
                const meta = UI_TRANSLATIONS[code];
                if (!meta) return null;
                const active = lang === code;
                return (
                    <motion.button
                        key={code}
                        type="button"
                        className="hk-lang-btn"
                        whileHover={{ y: active ? 0 : -1 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => onChange(code)}
                        title={meta.langName}
                        aria-pressed={active}
                        style={{
                            padding: '7px 13px',
                            borderRadius: '999px',
                            border: active ? '1px solid transparent' : `1px solid var(--glass-border)`,
                            background: active ? GRADIENT_PURPLE : 'transparent',
                            color: active ? '#fff' : 'var(--text-sec)',
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            boxShadow: active ? '0 8px 20px -8px rgba(139,92,246,0.55)' : 'none'
                        }}
                    >
                        {LANG_LABEL[code]}
                    </motion.button>
                );
            })}
        </div>
    );

    const KeyCap = ({ children, accent, compact, dashed, pulse }) => {
        const accentColor = accent ? hkColorValue(accent) : null;
        const base = {
            padding: compact ? '6px 11px' : '15px 22px',
            background: `linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-body) 100%)`,
            border: dashed ? `2px dashed ${accentColor || HK_TOKENS.blue}` : `1px solid var(--glass-border)`,
            borderBottom: accentColor ? `3px solid ${accentColor}` : `3px solid var(--glass-border)`,
            borderRadius: compact ? '8px' : '12px',
            fontSize: compact ? '12.5px' : '20px',
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace",
            color: accentColor || 'var(--text-main)',
            letterSpacing: '0.3px',
            minWidth: compact ? '20px' : '28px',
            textAlign: 'center',
            display: 'inline-block'
        };
        if (!pulse) return <div style={base}>{children}</div>;
        return (
            <motion.div
                animate={{
                    opacity: [0.65, 1, 0.65],
                    boxShadow: [
                        `inset 0 0 14px ${accentColor || HK_TOKENS.blue}22`,
                        `inset 0 0 24px ${accentColor || HK_TOKENS.blue}55`,
                        `inset 0 0 14px ${accentColor || HK_TOKENS.blue}22`
                    ]
                }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={base}
            >
                {children}
            </motion.div>
        );
    };

    const KeyCombo = ({ visual, compact = true }) => {
        const parts = String(visual || '').split('+').map((p) => p.trim()).filter(Boolean);
        return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? '5px' : '12px', flexWrap: 'wrap' }}>
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <span style={{ color: 'var(--text-sec)', fontWeight: 700, opacity: 0.6, fontSize: compact ? '12px' : '22px' }}>+</span>}
                        <KeyCap compact={compact}>{part}</KeyCap>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const HotkeyIcon = ({ icon, color }) => {
        const c = hkColorValue(color);
        return (
            <div style={{
                width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${c}1F`, border: `1px solid ${c}3D`
            }}>
                <Icon name={icon} size={18} color={c} />
            </div>
        );
    };

    const HotkeyCard = ({ hk, index, desc }) => {
        const meta = getHotkeyVisualMeta(hk, index);
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                whileHover={{ y: -2 }}
                style={{
                    display: 'flex', alignItems: 'flex-start', gap: '13px', padding: '16px',
                    background: 'var(--bg-body)', border: `1px solid var(--glass-border)`, borderRadius: '16px'
                }}
            >
                <HotkeyIcon icon={meta.icon} color={meta.color} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.4' }}>
                        {desc}
                    </div>
                    <KeyCombo visual={hk.visual} compact />
                </div>
            </motion.div>
        );
    };

    const PROGRAM_SUGGESTIONS = [
        { name: 'Microsoft Word', letter: 'W', color: '#2B579A' },
        { name: 'Excel', letter: 'E', color: '#217346' },
        { name: 'PowerPoint', letter: 'P', color: '#D24726' },
        { name: 'Photoshop', letter: 'Ps', color: '#31A8FF' },
        { name: 'Chrome', letter: 'C', color: '#EA4335' },
        { name: 'VS Code', letter: '<>', color: '#007ACC' },
        { name: 'Figma', letter: 'F', color: '#A259FF' },
        { name: 'Telegram', letter: 'T', color: '#26A5E4' }
    ];

    const ProgramSelector = ({ value, onChange, onSubmit, disabled, placeholder, label }) => {
        const [open, setOpen] = useState(false);
        const rootRef = useRef(null);

        useEffect(() => {
            const onDocClick = (e) => {
                if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
            };
            document.addEventListener('mousedown', onDocClick);
            return () => document.removeEventListener('mousedown', onDocClick);
        }, []);

        const match = PROGRAM_SUGGESTIONS.find((p) => p.name.toLowerCase() === value.trim().toLowerCase());
        const iconLetter = match ? match.letter : (value.trim() ? value.trim()[0].toUpperCase() : '?');
        const iconColor = match ? match.color : HK_TOKENS.purple;

        const filtered = PROGRAM_SUGGESTIONS.filter((p) =>
            p.name.toLowerCase().includes(value.trim().toLowerCase())
        );

        return (
            <div ref={rootRef} style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', height: '52px',
                    borderRadius: '14px', border: `1px solid ${open ? HK_TOKENS.purple : 'var(--glass-border)'}`,
                    background: 'var(--bg-body)', transition: 'border-color 0.2s ease'
                }}>
                    <div style={{
                        width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${iconColor}2A`, color: iconColor, fontSize: '11px', fontWeight: 900
                    }}>
                        {iconLetter}
                    </div>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !disabled) { setOpen(false); onSubmit && onSubmit(); }
                            if (e.key === 'Escape') setOpen(false);
                        }}
                        placeholder={placeholder}
                        aria-label={label}
                        disabled={disabled}
                        style={{
                            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                            color: 'var(--text-main)', fontSize: '15px', fontWeight: 600
                        }}
                    />
                    <span
                        onClick={() => !disabled && setOpen((o) => !o)}
                        style={{ color: 'var(--text-sec)', fontSize: '11px', cursor: disabled ? 'default' : 'pointer', userSelect: 'none' }}
                    >
                        ▾
                    </span>
                </div>

                <AnimatePresence>
                    {open && filtered.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div
                                className="hk-scroll"
                                style={{
                                    background: 'var(--bg-panel)',
                                    border: `1px solid var(--glass-border)`,
                                    borderRadius: '14px',
                                    padding: '6px',
                                    maxHeight: '185px',
                                    overflowY: 'auto'
                                }}
                            >
                                {filtered.map((p) => (
                                    <div
                                        key={p.name}
                                        onMouseDown={() => { onChange(p.name); setOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                                            borderRadius: '9px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{
                                            width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', background: `${p.color}2A`, color: p.color, fontSize: '10px', fontWeight: 900
                                        }}>
                                            {p.letter}
                                        </div>
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const HotkeyVisual = () => (
        <div className="hk-visual-side" style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
            <div style={{
                position: 'absolute', inset: '-30px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.28), transparent 70%)', filter: 'blur(4px)'
            }} />
            {[0, 1, 2].map((i) => (
                <span key={i} style={{
                    position: 'absolute', width: '5px', height: '5px', borderRadius: '50%',
                    background: HK_TOKENS.blue, boxShadow: `0 0 8px ${HK_TOKENS.blue}`,
                    top: `${15 + i * 30}%`, left: i % 2 ? '85%' : '5%', opacity: 0.85
                }} />
            ))}
            <div
                className="hk-visual-float"
                style={{
                    position: 'absolute', inset: 0, borderRadius: '26px',
                    background: `linear-gradient(155deg, var(--bg-panel) 0%, var(--bg-body) 100%)`,
                    border: `1px solid var(--glass-border)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 25px 50px -15px rgba(139,92,246,0.55), inset 0 1px 1px rgba(255,255,255,0.08), 8px 14px 0 -4px var(--bg-body)`
                }}
            >
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: GRADIENT_PURPLE, boxShadow: '0 0 30px rgba(139,92,246,0.65)'
                }}>
                    <Icon name="zap" size={28} color="#fff" strokeWidth={2} />
                </div>
            </div>
        </div>
    );

    const ProgressKeys = ({ total, currentIndex }) => (
        <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: total }).map((_, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                    <motion.div
                        key={i}
                        animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={active ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } : { duration: 0.2 }}
                        style={{
                            width: '22px', height: '9px', borderRadius: '3px',
                            background: done ? GRADIENT_WARM : active ? HK_TOKENS.blue : 'var(--glass-border)',
                            boxShadow: done ? '0 0 8px rgba(253,160,133,0.55)' : active ? `0 0 10px ${HK_TOKENS.blue}88` : 'none',
                            transition: 'background 0.25s ease, box-shadow 0.25s ease'
                        }}
                    />
                );
            })}
        </div>
    );

    const ErrorBanner = ({ children }) => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            role="alert"
            style={{
                fontSize: '13px', color: '#f87171', fontWeight: 700, textAlign: 'center',
                background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '11px', padding: '10px 14px', lineHeight: 1.5
            }}
        >
            {children}
        </motion.div>
    );

    const HotkeyTrainer = ({ onBack }) => {
        useEffect(() => { injectHkStyles(); }, []);

        const [tasks, setTasks] = useState([]);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [score, setScore] = useState(0);
        const [shake, setShake] = useState(false);
        const [successPulse, setSuccessPulse] = useState(false);
        const [isFinished, setIsFinished] = useState(false);
        const [phase, setPhase] = useState('setup');

        const [lang, setLang] = useState('ru');
        const t = UI_TRANSLATIONS[lang];

        const [topic, setTopic] = useState("Microsoft Word");
        const [isGenerating, setIsGenerating] = useState(false);
        const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
        const [isCustomBase, setIsCustomBase] = useState(false);
        const [genError, setGenError] = useState(null);

        const abortRef = useRef(null);
        useEffect(() => () => abortRef.current?.abort(), []);

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

        const openTheory = () => {
            setTasks(shuffleArray([...activeHotkeys]).slice(0, Math.min(10, activeHotkeys.length)));
            setCurrentIndex(0);
            setScore(0);
            setIsFinished(false);
            setPhase('theory');
        };

        const startGame = () => setPhase('practice');

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
                        
                        // --- СОХРАНЕНИЕ СТАТИСТИКИ ХОТКЕЕВ ---
                        const existing = JSON.parse(localStorage.getItem('hotkey_stats') || '{"maxScore":0, "sessionsPlayed":0}');
                        localStorage.setItem('hotkey_stats', JSON.stringify({
                            maxScore: Math.max(existing.maxScore, score + 1),
                            sessionsPlayed: existing.sessionsPlayed + 1
                        }));
                    }
                } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 300);
                }
            };

            window.addEventListener("keydown", handleKeyDown, { passive: false });
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [currentIndex, tasks, isFinished, phase]);

        if (phase === 'setup') {
            return (
                <GlassPanel
                    maxWidth="820px"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}
                >
                    <div style={{
                        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '420px', height: '260px',
                        background: 'radial-gradient(ellipse, rgba(139,92,246,0.16), transparent 72%)', pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '-100px', right: '-60px', width: '260px', height: '260px',
                        background: 'radial-gradient(circle, rgba(56,189,248,0.10), transparent 70%)', pointerEvents: 'none'
                    }} />

                    <div className="hk-setup-toprow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2, gap: '14px' }}>
                        <AppLogo title={t.title} badge={t.aiPowered.toUpperCase()} />
                        <LanguageSwitcher lang={lang} onChange={setLang} />
                    </div>

                    <div style={{ textAlign: 'center', maxWidth: '560px', position: 'relative', zIndex: 2 }}>
                        <p style={{
                            fontSize: '15px', color: 'var(--text-sec)', lineHeight: '1.7',
                            fontWeight: 500, margin: 0
                        }}>
                            {t.subtitle}
                        </p>
                    </div>

                    <div style={{
                        width: '100%', maxWidth: '560px', background: 'var(--bg-body)', border: `1px solid var(--glass-border)`,
                        borderRadius: '20px', padding: '22px', position: 'relative', zIndex: 10
                    }}>
                        <div style={{
                            fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase',
                            letterSpacing: '1.4px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: HK_TOKENS.purple, display: 'inline-block' }} />
                            {t.customPanelLabel}
                        </div>
                        <div className="hk-program-row" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <ProgramSelector
                                value={topic}
                                onChange={setTopic}
                                onSubmit={() => !isGenerating && generateAIHotkeys()}
                                disabled={isGenerating}
                                placeholder={t.inputPlaceholder}
                                label={t.customPanelLabel}
                            />
                            <motion.button
                                type="button"
                                whileHover={{ scale: isGenerating ? 1 : 1.02, y: isGenerating ? 0 : -1 }}
                                whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                                onClick={generateAIHotkeys}
                                disabled={isGenerating}
                                style={{
                                    padding: '0 22px', background: GRADIENT_PURPLE, border: 'none', color: '#fff',
                                    borderRadius: '14px', fontWeight: 800, fontSize: '14px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    opacity: isGenerating ? 0.7 : 1, height: '52px', boxShadow: '0 10px 24px -10px rgba(109,40,217,0.65)',
                                    display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0
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
                                        fontSize: '13px', color: HK_TOKENS.green, fontWeight: 700, textAlign: 'center',
                                        background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '11px', padding: '10px'
                                    }}
                                >
                                    ✓ {t.loadedSuccess(topic)}
                                </motion.div>
                            )}
                            {genError && <ErrorBanner key="err">{genError}</ErrorBanner>}
                        </AnimatePresence>
                    </div>

                    <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 2 }}>
                        <GradientButton variant="primary" onClick={openTheory} style={{ width: '100%' }}>
                            <Icon name="zap" size={18} color="#1a1206" /> {t.startTraining}
                        </GradientButton>
                    </div>
                </GlassPanel>
            );
        }

        if (phase === 'theory') {
            return (
                <GlassPanel
                    maxWidth="860px"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
                >
                    <header style={{ borderBottom: `1px solid var(--glass-border)`, paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                            <motion.button
                                type="button"
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={leaveGame}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '7px', background: 'transparent', border: 'none',
                                    cursor: 'pointer', color: 'var(--text-sec)', fontSize: '14px', fontWeight: 700, padding: '4px 0'
                                }}
                            >
                                <span style={{ fontSize: '17px', lineHeight: 1 }}>←</span> {t.exit}
                            </motion.button>
                            <LanguageSwitcher lang={lang} onChange={setLang} />
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-sec)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.6px', marginBottom: '10px' }}>
                            {t.theoryStep}
                        </div>
                        <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'var(--glass-border)', marginBottom: '18px', overflow: 'hidden' }}>
                            <div style={{ width: '50%', height: '100%', background: GRADIENT_WARM, borderRadius: '999px' }} />
                        </div>

                        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                            <span style={{ color: 'var(--text-main)' }}>{t.theoryTitle}</span>
                            {isCustomBase && (
                                <span style={{
                                    background: GRADIENT_BLUE, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>{`: ${topic}`}</span>
                            )}
                        </h2>
                    </header>

                    <p style={{ fontSize: '14px', color: 'var(--text-sec)', fontWeight: 500, margin: 0, lineHeight: '1.6' }}>
                        {t.theoryDesc}
                    </p>

                    <div
                        className="hk-theory-grid hk-scroll"
                        style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px',
                            maxHeight: '420px', overflowY: 'auto', paddingRight: '4px'
                        }}
                    >
                        {tasks.map((hk, i) => (
                            <HotkeyCard key={i} hk={hk} index={i} desc={getDesc(hk)} />
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', width: '100%' }}>
                        <GradientButton variant="primary" onClick={startGame} style={{ width: '100%', maxWidth: '500px' }}>
                            {t.goToPractice} →
                        </GradientButton>
                    </div>
                </GlassPanel>
            );
        }

        if (tasks.length === 0) return null;

        const currentTask = tasks[currentIndex];

        return (
            <GlassPanel
                maxWidth="1040px"
                initial={{ opacity: 0, y: 30 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={shake ? { duration: 0.3 } : { duration: 0.5, ease: "easeOut" }}
                style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}
            >
                <header className="hk-practice-header" style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '18px',
                    borderBottom: `1px solid var(--glass-border)`, paddingBottom: '18px'
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
                        margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px', textAlign: 'center', color: 'var(--text-main)'
                    }}>
                        {isCustomBase ? `${t.title}: ${topic}` : `${t.title} ⚡`}
                    </h2>

                    <div className="hk-practice-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifySelf: 'end' }}>
                        <LanguageSwitcher lang={lang} onChange={setLang} />
                        <div className="hk-progress-pill" style={{
                            display: 'flex', alignItems: 'baseline', gap: '6px',
                            padding: '9px 16px', borderRadius: '999px', background: 'var(--bg-body)',
                            border: `1px solid var(--glass-border)`, fontFamily: "ui-monospace, monospace"
                        }}>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>{Math.min(currentIndex + 1, tasks.length)}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-sec)', opacity: 0.5 }}>/</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-sec)' }}>{tasks.length}</span>
                        </div>
                    </div>
                </header>

                {!isFinished ? (
                    <div className="hk-practice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '32px', padding: '8px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            <div style={{ fontSize: '12.5px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, textAlign: 'center' }}>
                                {t.doCombination}
                            </div>

                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.85, y: 6 }}
                                animate={{ opacity: 1, scale: successPulse ? 1.04 : 1, y: 0 }}
                                transition={{ duration: 0.22 }}
                                style={{
                                    fontSize: '32px', fontWeight: 800, textAlign: 'center',
                                    color: successPulse ? HK_TOKENS.green : 'var(--text-main)',
                                    maxWidth: '90%', letterSpacing: '-0.4px', lineHeight: '1.3', transition: 'color 0.2s ease'
                                }}
                            >
                                «{getDesc(currentTask)}»
                            </motion.div>

                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                <KeyCap>Ctrl</KeyCap>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.5 }}>+</span>

                                {currentTask.shift && (
                                    <>
                                        <KeyCap>Shift</KeyCap>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-sec)', opacity: 0.5 }}>+</span>
                                    </>
                                )}

                                <KeyCap accent="blue" dashed pulse>?</KeyCap>
                            </div>

                            <ProgressKeys total={tasks.length} currentIndex={currentIndex} />
                        </div>

                        <HotkeyVisual />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        style={{ textAlign: 'center', padding: '44px 0', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                            style={{
                                width: '76px', height: '76px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `linear-gradient(135deg, ${HK_TOKENS.green}, #10b981)`,
                                boxShadow: `0 18px 40px -12px ${HK_TOKENS.green}99, inset 0 1px 1px rgba(255,255,255,0.35)`
                            }}
                        >
                            <Icon name="check" size={34} color="#052e1f" strokeWidth={2.6} />
                        </motion.div>
                        <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 900, color: HK_TOKENS.green, letterSpacing: '-0.6px' }}>{t.finishedTitle}</h2>
                        <p style={{ fontSize: '16px', color: 'var(--text-sec)', fontWeight: 600, margin: 0 }}>
                            {t.finishedDesc(score, tasks.length)}
                        </p>
                        <GradientButton variant="primary" onClick={resetGame} style={{ width: '260px', marginTop: '10px' }}>
                            {t.repeat}
                        </GradientButton>
                    </motion.div>
                )}
            </GlassPanel>
        );
    };

    Object.assign(window, { HotkeyTrainer });
})();
