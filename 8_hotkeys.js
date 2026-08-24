const { useState, useEffect, useCallback, useRef, useMemo } = React;
const { motion, AnimatePresence } = window.Motion;
const { shuffleArray } = window;

/* ============================================================================
 * ДАННЫЕ
 * ==========================================================================*/

const TRANSLATIONS = {
    ru: {
        short: "РУС",
        langName: "Русский",
        aiHint: "русском",
        ui: {
            title: "Хоткеи",
            aiPowered: "AI powered",
            subtitle: "Тренируй стандартную базу из своих конспектов (Word, Система) или собери персональную для любой другой программы",
            customPanelLabel: "Своя база для другой программы",
            inputPlaceholder: "Напр. Word, Excel, Photoshop…",
            generateButton: "Собрать базу",
            generating: "Собираем…",
            loadedSuccess: (topic) => `База «${topic}» загружена`,
            startTraining: "Начать тренировку",
            theoryStep: "Шаг 1 из 2",
            theoryTitle: "Теория",
            theoryDesc: "Изучи комбинации, которые встретятся в тренировке, а затем закрепи их на практике.",
            exit: "Выйти",
            goToPractice: "Перейти к практике",
            doCombination: "Выполните комбинацию",
            finishedTitle: "Отличная работа",
            finishedDesc: (score, total) => `Закреплено ${score} из ${total} горячих клавиш`,
            statAccuracy: "Точность",
            statMistakes: "Ошибок",
            repeat: "Пройти ещё раз",
            backToSetup: "Настроить заново",
            alertNoTopic: "Сначала введите название программы",
            alertFailed: "Не удалось собрать базу. Попробуйте переформулировать запрос",
            alertTimeout: "Сервер долго отвечает. Попробуйте ещё раз",
        },
        hotkeys: {
            alignRight: "Поправить текст по правому краю",
            alignLeft: "Поправить текст по левому краю",
            undo: "Отменить последнее действие",
            cut: "Вырезать текст",
            alignCenter: "Поправить текст по центру",
            selectAll: "Выделить весь текст",
            italic: "Курсив",
            print: "Открыть печать",
            underline: "Линия под текстом",
            save: "Сохранить",
            copy: "Копировать",
            paste: "Вставить",
            openFile: "Открыть файл",
            closeDoc: "Закрыть документ",
            find: "Найти",
            findReplace: "Найти и заменить",
            redo: "Повторить действие",
            hyperlink: "Вставить гиперссылку",
            fontSmaller: "Уменьшить размер шрифта",
            fontBigger: "Увеличить размер шрифта",
            doubleUnderline: "Двойное подчёркивание",
            allCaps: "Все прописные",
            underlineWords: "Подчёркивание только слов",
            newTab: "Открыть новую вкладку",
            newFile: "Создать новый файл или окно",
            bold: "Жирный текст",
        },
    },
    en: {
        short: "ENG",
        langName: "English",
        aiHint: "английском (English)",
        ui: {
            title: "Hotkeys",
            aiPowered: "AI powered",
            subtitle: "Practice the standard set from your notes (Word, System), or build a custom one for any other program",
            customPanelLabel: "Custom set for another program",
            inputPlaceholder: "e.g. Word, Excel, Photoshop…",
            generateButton: "Build set",
            generating: "Building…",
            loadedSuccess: (topic) => `"${topic}" set loaded`,
            startTraining: "Start training",
            theoryStep: "Step 1 of 2",
            theoryTitle: "Theory",
            theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
            exit: "Exit",
            goToPractice: "Go to practice",
            doCombination: "Perform the combination",
            finishedTitle: "Great job",
            finishedDesc: (score, total) => `You locked in ${score} of ${total} hotkeys`,
            statAccuracy: "Accuracy",
            statMistakes: "Mistakes",
            repeat: "Try again",
            backToSetup: "Set up again",
            alertNoTopic: "Enter a program name first",
            alertFailed: "Couldn't build the set. Try rephrasing the topic",
            alertTimeout: "The server is taking too long. Please try again",
        },
        hotkeys: {
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
            bold: "Bold text",
        },
    },
    uz: {
        short: "ЎЗБ",
        langName: "O'zbek (кирилл)",
        aiHint: "узбекском языке кириллицей (o'zbek tilida, kirill alifbosida)",
        ui: {
            title: "Хоткейлар",
            aiPowered: "AI powered",
            subtitle: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг ёки бошқа дастур учун ўзингизникини тузинг",
            customPanelLabel: "Бошқа дастур учун ўз базангиз",
            inputPlaceholder: "Масалан: Word, Excel, Photoshop…",
            generateButton: "База тузиш",
            generating: "Тузяпмиз…",
            loadedSuccess: (topic) => `«${topic}» базаси юкланди`,
            startTraining: "Машқни бошлаш",
            theoryStep: "1-қадам, 2 тадан",
            theoryTitle: "Назария",
            theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
            exit: "Чиқиш",
            goToPractice: "Амалиётга ўтиш",
            doCombination: "Комбинацияни бажаринг",
            finishedTitle: "Ажойиб натижа",
            finishedDesc: (score, total) => `${total} тадан ${score} та хоткей мустаҳкамланди`,
            statAccuracy: "Аниқлик",
            statMistakes: "Хатолар",
            repeat: "Яна бир бор такрорлаш",
            backToSetup: "Қайтадан созлаш",
            alertNoTopic: "Аввал дастур номини киритинг",
            alertFailed: "Базани тузиб бўлмади. Мавзуни бошқача ёзиб кўринг",
            alertTimeout: "Сервер жуда узоқ жавоб бермоқда. Қайта уриниб кўринг",
        },
        hotkeys: {
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
            redo: "Қайта бажариш",
            hyperlink: "Гиперҳавола қўйиш",
            fontSmaller: "Шрифт ўлчамини кичрайтириш",
            fontBigger: "Шрифт ўлчамини катталаштириш",
            doubleUnderline: "Икки қатор тагига чизиш",
            allCaps: "Барча ҳарфларни бош ҳарф қилиш",
            underlineWords: "Фақат сўзларни тагига чизиш",
            newTab: "Янги ойна очиш",
            newFile: "Янги файл ёки ойна яратиш",
            bold: "Қалин (bold) матн",
        },
    },
};

const LANGS = Object.keys(TRANSLATIONS);

const HOTKEYS_DB = [
    { descKey: "alignRight", key: "r", shift: false },
    { descKey: "alignLeft", key: "l", shift: false },
    { descKey: "undo", key: "z", shift: false },
    { descKey: "cut", key: "x", shift: false },
    { descKey: "alignCenter", key: "e", shift: false },
    { descKey: "selectAll", key: "a", shift: false },
    { descKey: "italic", key: "i", shift: false },
    { descKey: "print", key: "p", shift: false },
    { descKey: "underline", key: "u", shift: false },
    { descKey: "save", key: "s", shift: false },
    { descKey: "copy", key: "c", shift: false },
    { descKey: "paste", key: "v", shift: false },
    { descKey: "openFile", key: "o", shift: false },
    { descKey: "closeDoc", key: "w", shift: false },
    { descKey: "find", key: "f", shift: false },
    { descKey: "findReplace", key: "h", shift: false },
    { descKey: "redo", key: "y", shift: false },
    { descKey: "hyperlink", key: "k", shift: false },
    { descKey: "fontSmaller", key: "1", shift: true },
    { descKey: "fontBigger", key: "9", shift: true },
    { descKey: "doubleUnderline", key: "d", shift: true },
    { descKey: "allCaps", key: "a", shift: true },
    { descKey: "underlineWords", key: "w", shift: true },
    { descKey: "newTab", key: "t", shift: false },
    { descKey: "newFile", key: "n", shift: false },
    { descKey: "bold", key: "b", shift: false },
];

const AI_ENDPOINT = "https://gemini-proxy-lms.msleaderindustry.workers.dev";

/* ============================================================================
 * УТИЛИТЫ
 * ==========================================================================*/

// Физический код клавиши по символу — сверяемся с e.code, а не e.key, поэтому
// распознавание не зависит от активной раскладки клавиатуры (раньше для этого
// была отдельная таблица SHIFT_SYMBOL_MAP на все Shift-символы — она не нужна).
const PUNCT_CODES = {
    "-": "Minus", "=": "Equal", "[": "BracketLeft", "]": "BracketRight",
    "\\": "Backslash", ";": "Semicolon", "'": "Quote", ",": "Comma",
    ".": "Period", "/": "Slash", "`": "Backquote",
};
function codeForKey(key) {
    if (/^[a-z]$/i.test(key)) return "Key" + key.toUpperCase();
    if (/^[0-9]$/.test(key)) return "Digit" + key;
    return PUNCT_CODES[key] || null;
}

function buildVisual(key, shift) {
    const parts = ["Ctrl"];
    if (shift) parts.push("Shift");
    parts.push(key.length === 1 ? key.toUpperCase() : key);
    return parts.join(" + ");
}

function buildPrompt(topic, lang) {
    return `Ты — техническая справочная система, а не творческий помощник. Твоя единственная задача — точно воспроизвести ОФИЦИАЛЬНО ЗАДОКУМЕНТИРОВАННЫЕ горячие клавиши программы "${topic}", без фантазий и "правдоподобных" догадок.

Верни 10 горячих клавиш (с Ctrl, некоторые дополнительно могут включать Shift) для программы "${topic}".

СТРОГИЕ ПРАВИЛА:
1. Не придумывай комбинации — только реально задокументированные в официальной справке "${topic}".
2. Если 10 официальных комбинаций с Ctrl не существует — верни столько, сколько есть (не меньше 5), не выдумывая недостающие.
3. Поле "desc" — точное нейтральное описание действия на ${TRANSLATIONS[lang].aiHint}, без отсебятины.
4. Поле "key" — ровно один символ: строчная латинская буква или цифра физической клавиши (без "!" или "(", для цифр пиши саму цифру).
5. Не повторяй одну и ту же комбинацию дважды.
6. Верни ТОЛЬКО чистый валидный JSON-массив объектов, без markdown и пояснений.

Формат:
[{"desc": "Описание действия", "key": "c", "shift": false, "visual": "Ctrl + C"}]`;
}

/* ============================================================================
 * ИКОНКИ (лёгкие инлайн SVG вместо эмодзи — под фирменный градиент сайта)
 * ==========================================================================*/

const Icon = {
    bolt: (p) => (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...p}>
            <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
    ),
    spark: (p) => (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" {...p}>
            <path d="M12 2l1.8 5.9L20 10l-6.2 2.1L12 18l-1.8-5.9L4 10l6.2-2.1L12 2z" />
        </svg>
    ),
    arrowLeft: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
    ),
    arrowRight: (p) => (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    ),
    play: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...p}>
            <path d="M7 5l12 7-12 7z" />
        </svg>
    ),
    check: (p) => (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M5 13l4.5 4.5L19 7" />
        </svg>
    ),
    repeat: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M4 10a8 8 0 0113.9-5.3M20 5v5h-5M20 14a8 8 0 01-13.9 5.3M4 19v-5h5" />
        </svg>
    ),
    spinner: (p) => (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" {...p}>
            <path d="M12 3a9 9 0 106.36 2.64" />
        </svg>
    ),
};

/* ============================================================================
 * СТИЛИ
 * Используются те же токены, что и на остальном сайте (--bg-panel, --bg-body,
 * --text-main, --text-sec, --glass-border, --accent-glow, класс .glass-panel).
 * Фолбэки в :root на случай, если компонент открыт отдельно от общей темы.
 * ==========================================================================*/

const HK_CSS = `
.hk-root{
  --hk-title-a:#f6d365; --hk-title-b:#fda085;
  --hk-ai-a:#a855f7; --hk-ai-b:#6d28d9;
  --hk-ok:#10b981; --hk-err:#fb7185;
  --bg-body: var(--bg-body, #12141a);
  --bg-panel: var(--bg-panel, #1a1d25);
  --text-main: var(--text-main, #f1f3f8);
  --text-sec: var(--text-sec, #9399aa);
  --glass-border: var(--glass-border, rgba(255,255,255,.09));
  --accent-glow: var(--accent-glow, #0ea5e9);
  color: var(--text-main); width:100%; position:relative;
}
.hk-wrap{ width:100%; max-width:820px; margin:0 auto; }
.hk-inner{ padding:40px; display:flex; flex-direction:column; gap:24px; position:relative; overflow:hidden; border-radius:24px; }
@media (max-width:640px){ .hk-inner{ padding:24px 18px; gap:20px; } }

.hk-glow-a{ position:absolute; top:-110px; left:50%; transform:translateX(-50%); width:380px; height:240px;
  background:radial-gradient(ellipse, rgba(253,160,133,.16), transparent 72%); pointer-events:none; filter:blur(2px); }
.hk-glow-b{ position:absolute; bottom:-120px; right:-70px; width:280px; height:280px;
  background:radial-gradient(circle, rgba(139,92,246,.10), transparent 70%); pointer-events:none; }

.hk-topline{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; position:relative; z-index:1; }

.hk-lang-row{ display:flex; gap:6px; }
.hk-lang-chip{
  font-size:11px; font-weight:800; letter-spacing:.05em; padding:7px 12px; border-radius:999px;
  border:1px solid var(--glass-border); background:var(--bg-body); color:var(--text-sec); cursor:pointer;
  transition:border-color .15s ease, color .15s ease, background .15s ease, transform .1s ease;
}
.hk-lang-chip:hover{ color:var(--text-main); }
.hk-lang-chip.is-active{ background:linear-gradient(120deg, var(--hk-ai-a), var(--hk-ai-b)); border-color:transparent; color:#fff; box-shadow:0 6px 16px -6px rgba(109,40,217,.6); }

.hk-back-link{ display:inline-flex; align-items:center; gap:6px; background:none; border:none; color:var(--text-sec); font-size:13px; font-weight:700; cursor:pointer; padding:6px 0; }
.hk-back-link:hover{ color:var(--text-main); }

.hk-hero{ display:flex; align-items:center; gap:14px; position:relative; z-index:1; }
.hk-mark{
  width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
  color:#241a04; background:linear-gradient(135deg, var(--hk-title-a) 0%, var(--hk-title-b) 100%);
  box-shadow:0 12px 24px -10px rgba(253,160,133,.55), inset 0 1px 1px rgba(255,255,255,.5);
}
.hk-title{
  margin:0; font-size:30px; font-weight:900; letter-spacing:-.02em;
  background:linear-gradient(135deg, var(--hk-title-a) 0%, var(--hk-title-b) 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.hk-badge{
  display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:800; letter-spacing:.09em; text-transform:uppercase;
  color:#fff; background:linear-gradient(120deg, var(--hk-ai-a), var(--hk-ai-b)); padding:6px 11px; border-radius:999px;
  box-shadow:0 6px 16px -6px rgba(109,40,217,.6);
}

.hk-subtitle{ font-size:14.5px; line-height:1.7; color:var(--text-sec); max-width:480px; margin:0; position:relative; z-index:1; }

.hk-panel{ background:var(--bg-body); border:1px solid var(--glass-border); border-radius:18px; padding:22px; position:relative; z-index:1; }
.hk-panel-label{ font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; color:var(--text-sec); display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.hk-dot{ width:6px; height:6px; border-radius:50%; background:var(--hk-ai-a); flex-shrink:0; }

.hk-field-row{ display:flex; gap:10px; flex-wrap:wrap; }
.hk-input{
  flex:1 1 200px; padding:0 16px; height:48px; border-radius:12px; border:1px solid var(--glass-border);
  background:var(--bg-panel); color:var(--text-main); font-size:14.5px; font-weight:600; outline:none;
  transition:border-color .15s ease;
}
.hk-input::placeholder{ color:var(--text-sec); opacity:.7; }
.hk-input:focus-visible{ border-color:var(--hk-ai-a); }

.hk-btn{
  height:48px; padding:0 20px; border-radius:12px; border:none; cursor:pointer; font-size:14px; font-weight:800;
  display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:transform .12s ease, opacity .12s ease, box-shadow .15s ease;
  font-family:inherit;
}
.hk-btn:hover{ transform:translateY(-1px); }
.hk-btn:active{ transform:translateY(0); }
.hk-btn:disabled{ cursor:not-allowed; opacity:.65; transform:none; }
.hk-btn--ai{ background:linear-gradient(120deg, var(--hk-ai-a), var(--hk-ai-b)); color:#fff; box-shadow:0 10px 22px -10px rgba(109,40,217,.65); }
.hk-btn--warm{ background:linear-gradient(135deg, var(--hk-title-a) 0%, var(--hk-title-b) 100%); color:#241a04; box-shadow:0 12px 24px -10px rgba(253,160,133,.6); }
.hk-btn--ghost{ background:var(--bg-body); color:var(--text-sec); border:1px solid var(--glass-border); }
.hk-btn--ghost:hover{ color:var(--text-main); }
.hk-btn--full{ width:100%; height:56px; font-size:15.5px; border-radius:14px; }

.hk-banner{ margin-top:14px; font-size:13px; font-weight:700; text-align:center; border-radius:11px; padding:10px 14px; }
.hk-banner--ok{ color:var(--hk-ok); background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.25); }
.hk-banner--err{ color:var(--hk-err); background:rgba(251,113,133,.08); border:1px solid rgba(251,113,133,.25); }

.hk-header{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:16px; padding-bottom:18px; border-bottom:1px solid var(--glass-border); position:relative; z-index:1; }
.hk-exit{ display:inline-flex; align-items:center; gap:6px; background:none; border:none; color:var(--text-sec); font-size:13.5px; font-weight:700; cursor:pointer; padding:6px 2px; justify-self:start; }
.hk-exit:hover{ color:var(--text-main); }
.hk-header-title{ font-size:20px; font-weight:900; text-align:center; margin:0;
  background:linear-gradient(135deg, var(--hk-title-a) 0%, var(--hk-title-b) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.hk-counter{ justify-self:end; font-size:13px; font-weight:800; color:var(--text-sec); background:var(--bg-body); border:1px solid var(--glass-border); border-radius:999px; padding:7px 14px; }
.hk-counter b{ color:var(--text-main); }

.hk-eyebrow-step{ font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--text-sec); }
.hk-theory-title{ font-size:24px; font-weight:900; margin:4px 0 0; }
.hk-theory-desc{ font-size:13.5px; color:var(--text-sec); line-height:1.6; margin:0; }

.hk-combo-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:10px; max-height:400px; overflow-y:auto; padding-right:4px; position:relative; z-index:1; }
.hk-combo-card{ display:flex; flex-direction:column; gap:12px; padding:16px; background:var(--bg-body); border:1px solid var(--glass-border); border-radius:14px; }
.hk-combo-desc{ font-size:13.5px; font-weight:700; line-height:1.4; }
.hk-combo-keys{ display:flex; gap:6px; align-items:center; flex-wrap:wrap; }

.hk-key{
  font-family:'SF Mono','JetBrains Mono',ui-monospace,monospace; font-weight:800; text-align:center; user-select:none;
  border-radius:9px; border:1px solid var(--glass-border); background:linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-body) 100%);
  box-shadow:0 3px 8px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.06); color:var(--text-main);
  transition:transform .1s ease, box-shadow .1s ease, border-color .1s ease, color .1s ease;
}
.hk-key--sm{ font-size:11.5px; padding:6px 10px; }
.hk-key--lg{ font-size:19px; min-width:54px; height:54px; display:flex; align-items:center; justify-content:center; padding:0 14px; }
.hk-key--mystery{ border:2px dashed var(--accent-glow); color:var(--accent-glow); background:var(--bg-body); animation:hk-blink 1.8s ease-in-out infinite; }
.hk-key--success{ transform:translateY(2px); border-color:var(--hk-ok); color:var(--hk-ok); box-shadow:0 0 0 rgba(0,0,0,0), inset 0 1px 0 rgba(255,255,255,.06); }
.hk-key--error{ animation:hk-shake .32s ease; border-color:var(--hk-err); color:var(--hk-err); }
.hk-plus{ font-size:15px; font-weight:800; color:var(--text-sec); opacity:.55; }

.hk-stage{ display:flex; flex-direction:column; align-items:center; gap:30px; padding:14px 0 4px; position:relative; z-index:1; }
.hk-stage-eyebrow{ font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--text-sec); }
.hk-stage-quote{ font-size:29px; font-weight:800; text-align:center; max-width:88%; line-height:1.3; letter-spacing:-.01em; color:var(--text-main); transition:color .15s ease; }
.hk-stage-quote.is-success{ color:var(--hk-ok); }

.hk-pips{ display:flex; gap:7px; flex-wrap:wrap; justify-content:center; position:relative; z-index:1; }
.hk-pip{ width:9px; height:9px; border-radius:50%; background:var(--bg-body); border:1px solid var(--glass-border); transition:background .2s ease, transform .2s ease, border-color .2s ease; }
.hk-pip.is-done{ background:linear-gradient(120deg, var(--hk-title-a), var(--hk-title-b)); border-color:transparent; }
.hk-pip.is-active{ background:var(--accent-glow); border-color:transparent; transform:scale(1.35); }

.hk-done{ display:flex; flex-direction:column; align-items:center; gap:16px; padding:44px 0 10px; text-align:center; position:relative; z-index:1; }
.hk-done-icon{ width:68px; height:68px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#06251c;
  background:linear-gradient(135deg, var(--hk-ok), #22a869); box-shadow:0 16px 30px -12px rgba(16,185,129,.55); }
.hk-done-title{ font-size:28px; font-weight:900; margin:0;
  background:linear-gradient(135deg, var(--hk-title-a) 0%, var(--hk-title-b) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.hk-done-desc{ font-size:14.5px; color:var(--text-sec); margin:0; font-weight:600; }
.hk-stat-row{ display:flex; gap:10px; margin-top:4px; }
.hk-stat{ background:var(--bg-body); border:1px solid var(--glass-border); border-radius:12px; padding:12px 22px; min-width:104px; }
.hk-stat-value{ font-family:'SF Mono','JetBrains Mono',ui-monospace,monospace; font-size:20px; font-weight:800; }
.hk-stat-label{ font-size:10.5px; color:var(--text-sec); text-transform:uppercase; letter-spacing:.08em; margin-top:2px; font-weight:700; }
.hk-done-actions{ display:flex; gap:10px; margin-top:16px; }

@keyframes hk-shake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(3px)} }
@keyframes hk-blink{ 0%,100%{opacity:1} 50%{opacity:.45} }

.hk-root button:focus-visible, .hk-root input:focus-visible{ outline:2px solid var(--accent-glow); outline-offset:2px; }

@media (prefers-reduced-motion: reduce){
  .hk-root *{ animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; }
}
`;

/* ============================================================================
 * ХУК: языковая база + генерация кастомной темы через ИИ
 * ==========================================================================*/

function useHotkeySet(lang) {
    const strings = TRANSLATIONS[lang].ui;
    const [topic, setTopic] = useState("Microsoft Word");
    const [activeHotkeys, setActiveHotkeys] = useState(HOTKEYS_DB);
    const [isCustomBase, setIsCustomBase] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [message, setMessage] = useState("");
    const abortRef = useRef(null);

    useEffect(() => () => abortRef.current?.abort(), []);

    const generate = useCallback(async () => {
        const cleanTopic = topic.trim();
        if (!cleanTopic) {
            setStatus("error");
            setMessage(strings.alertNoTopic);
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        setStatus("loading");
        setMessage("");

        try {
            const response = await fetch(AI_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(cleanTopic, lang) }] }] }),
                signal: controller.signal,
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "api error");

            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!rawText) throw new Error("empty response");

            const match = rawText.match(/\[[\s\S]*\]/);
            if (!match) throw new Error("no json array in response");

            const parsed = JSON.parse(match[0]);
            const cleaned = parsed
                .filter((hk) => hk && typeof hk.key === "string" && hk.key.trim().length === 1 && typeof hk.desc === "string" && hk.desc.trim())
                .map((hk) => {
                    const key = hk.key.trim().toLowerCase();
                    const shift = !!hk.shift;
                    return {
                        desc: hk.desc.trim(),
                        key,
                        shift,
                        visual: typeof hk.visual === "string" && hk.visual.trim() ? hk.visual.trim() : buildVisual(key, shift),
                    };
                });

            if (cleaned.length < 3) throw new Error("too few valid hotkeys returned");

            setActiveHotkeys(cleaned);
            setIsCustomBase(true);
            setStatus("success");
        } catch (err) {
            setStatus("error");
            setMessage(err && err.name === "AbortError" ? strings.alertTimeout : strings.alertFailed);
            setActiveHotkeys(HOTKEYS_DB);
            setIsCustomBase(false);
        } finally {
            clearTimeout(timeoutId);
        }
    }, [topic, lang, strings]);

    const resetToDefault = useCallback(() => {
        setActiveHotkeys(HOTKEYS_DB);
        setIsCustomBase(false);
        setStatus("idle");
        setMessage("");
    }, []);

    return { topic, setTopic, activeHotkeys, isCustomBase, status, message, generate, resetToDefault };
}

/* ============================================================================
 * ВИЗУАЛЬНЫЕ АТОМЫ
 * ==========================================================================*/

const LangSwitch = ({ lang, onChange }) => (
    <div className="hk-lang-row">
        {LANGS.map((code) => (
            <button
                key={code}
                type="button"
                className={"hk-lang-chip" + (lang === code ? " is-active" : "")}
                title={TRANSLATIONS[code].langName}
                onClick={() => onChange(code)}
            >
                {TRANSLATIONS[code].short}
            </button>
        ))}
    </div>
);

// mode: 'mystery' | 'reveal' | 'success' | 'error'
const ComboKeys = ({ task, size = "sm", mode = "reveal" }) => (
    <div className="hk-combo-keys">
        <span className={`hk-key hk-key--${size}`}>Ctrl</span>
        {task.shift && (
            <>
                <span className="hk-plus">+</span>
                <span className={`hk-key hk-key--${size}`}>Shift</span>
            </>
        )}
        <span className="hk-plus">+</span>
        <span
            className={
                `hk-key hk-key--${size}` +
                (mode === "mystery" ? " hk-key--mystery" : "") +
                (mode === "success" ? " hk-key--success" : "") +
                (mode === "error" ? " hk-key--error" : "")
            }
        >
            {mode === "mystery" ? "?" : task.key.toUpperCase()}
        </span>
    </div>
);

/* ============================================================================
 * ОСНОВНОЙ КОМПОНЕНТ
 * ==========================================================================*/

const HotkeyTrainer = ({ onBack }) => {
    const [lang, setLang] = useState("ru");
    const t = TRANSLATIONS[lang].ui;
    const hotkeyText = TRANSLATIONS[lang].hotkeys;

    const getDesc = useCallback(
        (hk) => (hk.descKey ? hotkeyText[hk.descKey] || TRANSLATIONS.ru.hotkeys[hk.descKey] : hk.desc),
        [hotkeyText]
    );

    const { topic, setTopic, activeHotkeys, isCustomBase, status, message, generate, resetToDefault } = useHotkeySet(lang);

    // phase: setup -> theory -> practice -> done
    const [phase, setPhase] = useState("setup");
    const [tasks, setTasks] = useState([]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState(null); // null | 'success' | 'error'

    const openTheory = useCallback(() => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setIndex(0);
        setScore(0);
        setMistakes(0);
        setFeedback(null);
        setPhase("theory");
    }, [activeHotkeys]);

    const startPractice = useCallback(() => setPhase("practice"), []);

    const restart = useCallback(() => {
        setTasks(shuffleArray([...activeHotkeys]).slice(0, 10));
        setIndex(0);
        setScore(0);
        setMistakes(0);
        setFeedback(null);
        setPhase("practice");
    }, [activeHotkeys]);

    const exitToSetup = useCallback(() => {
        setPhase("setup");
        resetToDefault();
    }, [resetToDefault]);

    // Обработка нажатий: сверяем e.code (физическую клавишу), а не e.key —
    // так распознавание не зависит от активной раскладки клавиатуры.
    useEffect(() => {
        if (phase !== "practice" || tasks.length === 0) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
            if (["Control", "Meta", "Shift", "Alt"].includes(e.key)) return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const current = tasks[index];
            if (!current) return;

            if (!isCtrlOrCmd) {
                triggerFeedback("error");
                return;
            }
            e.preventDefault();

            const expectedCode = codeForKey(current.key);
            const keyMatches = expectedCode ? e.code === expectedCode : e.key.toLowerCase() === current.key.toLowerCase();
            const shiftMatches = e.shiftKey === !!current.shift;

            if (keyMatches && shiftMatches) {
                triggerFeedback("success");
                setScore((s) => s + 1);
                setTimeout(() => {
                    setFeedback(null);
                    setIndex((i) => {
                        const next = i + 1;
                        if (next >= tasks.length) {
                            setPhase("done");
                            return i;
                        }
                        return next;
                    });
                }, 260);
            } else {
                triggerFeedback("error");
            }
        };

        function triggerFeedback(kind) {
            setFeedback(kind);
            if (kind === "error") {
                setMistakes((m) => m + 1);
                setTimeout(() => setFeedback(null), 320);
            }
        }

        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [phase, tasks, index]);

    const currentTask = tasks[index];
    const accuracy = useMemo(() => {
        const attempts = score + mistakes;
        return attempts === 0 ? 100 : Math.round((score / attempts) * 100);
    }, [score, mistakes]);

    /* ---------------------------- ЭКРАН: НАСТРОЙКА ---------------------------- */
    if (phase === "setup") {
        return (
            <div className="hk-root">
                <style>{HK_CSS}</style>
                <div className="hk-wrap">
                    <motion.div className="glass-panel hk-inner" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="hk-glow-a" />
                        <div className="hk-glow-b" />

                        <div className="hk-topline">
                            {typeof onBack === "function" ? (
                                <button type="button" className="hk-back-link" onClick={onBack}>
                                    <Icon.arrowLeft /> {t.exit}
                                </button>
                            ) : <span />}
                            <LangSwitch lang={lang} onChange={setLang} />
                        </div>

                        <div className="hk-hero">
                            <div className="hk-mark"><Icon.bolt /></div>
                            <h2 className="hk-title">{t.title}</h2>
                            <span className="hk-badge"><Icon.spark />{t.aiPowered}</span>
                        </div>

                        <p className="hk-subtitle">{t.subtitle}</p>

                        <div className="hk-panel">
                            <div className="hk-panel-label"><span className="hk-dot" />{t.customPanelLabel}</div>
                            <div className="hk-field-row">
                                <input
                                    className="hk-input"
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={t.inputPlaceholder}
                                    disabled={status === "loading"}
                                />
                                <button className="hk-btn hk-btn--ai" onClick={generate} disabled={status === "loading"}>
                                    {status === "loading" ? <Icon.spinner /> : <Icon.spark />}
                                    {status === "loading" ? t.generating : t.generateButton}
                                </button>
                            </div>

                            <AnimatePresence>
                                {status === "success" && isCustomBase && (
                                    <motion.div className="hk-banner hk-banner--ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                        {t.loadedSuccess(topic)}
                                    </motion.div>
                                )}
                                {status === "error" && message && (
                                    <motion.div className="hk-banner hk-banner--err" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button className="hk-btn hk-btn--warm hk-btn--full" onClick={openTheory}>
                            <Icon.play /> {t.startTraining}
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ----------------------------- ЭКРАН: ТЕОРИЯ ------------------------------ */
    if (phase === "theory") {
        return (
            <div className="hk-root">
                <style>{HK_CSS}</style>
                <div className="hk-wrap">
                    <motion.div className="glass-panel hk-inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="hk-topline">
                            <span className="hk-eyebrow-step">{t.theoryStep}</span>
                            <LangSwitch lang={lang} onChange={setLang} />
                        </div>

                        <div>
                            <h2 className="hk-theory-title">{t.theoryTitle}{isCustomBase ? `: ${topic}` : ""}</h2>
                            <p className="hk-theory-desc" style={{ marginTop: 8 }}>{t.theoryDesc}</p>
                        </div>

                        <div className="hk-combo-grid">
                            {tasks.map((hk, i) => (
                                <motion.div key={i} className="hk-combo-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}>
                                    <div className="hk-combo-desc">{getDesc(hk)}</div>
                                    <ComboKeys task={hk} size="sm" mode="reveal" />
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            <button className="hk-btn hk-btn--ghost" style={{ flex: "0 0 140px" }} onClick={exitToSetup}>{t.exit}</button>
                            <button className="hk-btn hk-btn--warm" style={{ flex: 1 }} onClick={startPractice}>
                                {t.goToPractice} <Icon.arrowRight />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ---------------------------- ЭКРАН: РЕЗУЛЬТАТ ---------------------------- */
    if (phase === "done") {
        return (
            <div className="hk-root">
                <style>{HK_CSS}</style>
                <div className="hk-wrap">
                    <motion.div className="glass-panel hk-inner" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
                        <div className="hk-topline"><span /><LangSwitch lang={lang} onChange={setLang} /></div>

                        <div className="hk-done">
                            <motion.div className="hk-done-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}>
                                <Icon.check />
                            </motion.div>
                            <h2 className="hk-done-title">{t.finishedTitle}</h2>
                            <p className="hk-done-desc">{t.finishedDesc(score, tasks.length)}</p>

                            <div className="hk-stat-row">
                                <div className="hk-stat">
                                    <div className="hk-stat-value" style={{ color: "var(--accent-glow)" }}>{accuracy}%</div>
                                    <div className="hk-stat-label">{t.statAccuracy}</div>
                                </div>
                                <div className="hk-stat">
                                    <div className="hk-stat-value" style={{ color: mistakes ? "var(--hk-err)" : "var(--text-sec)" }}>{mistakes}</div>
                                    <div className="hk-stat-label">{t.statMistakes}</div>
                                </div>
                            </div>

                            <div className="hk-done-actions">
                                <button className="hk-btn hk-btn--ghost" onClick={exitToSetup}>{t.backToSetup}</button>
                                <button className="hk-btn hk-btn--warm" onClick={restart}><Icon.repeat /> {t.repeat}</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ---------------------------- ЭКРАН: ПРАКТИКА ----------------------------- */
    if (!currentTask) return null;

    return (
        <div className="hk-root">
            <style>{HK_CSS}</style>
            <div className="hk-wrap">
                <motion.div className="glass-panel hk-inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="hk-header">
                        <button type="button" className="hk-exit" onClick={exitToSetup}><Icon.arrowLeft /> {t.exit}</button>
                        <h2 className="hk-header-title">{isCustomBase ? `${t.title}: ${topic}` : t.title}</h2>
                        <span className="hk-counter"><b>{index + 1}</b> / {tasks.length}</span>
                    </div>

                    <div className="hk-pips">
                        {tasks.map((_, i) => (
                            <span key={i} className={"hk-pip" + (i < index ? " is-done" : "") + (i === index ? " is-active" : "")} />
                        ))}
                    </div>

                    <div className="hk-stage">
                        <div className="hk-stage-eyebrow">{t.doCombination}</div>

                        <motion.div
                            key={index}
                            className={"hk-stage-quote" + (feedback === "success" ? " is-success" : "")}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            «{getDesc(currentTask)}»
                        </motion.div>

                        <ComboKeys task={currentTask} size="lg" mode={feedback || "mystery"} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

Object.assign(window, { HotkeyTrainer });
