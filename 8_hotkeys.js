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
            eyebrow: "Карточка тренировки №",
            subtitle: "Тренируй стандартную базу из своих конспектов (Word, Система) или собери персональную для любой другой программы",
            customPanelLabel: "Своя база для другой программы",
            inputPlaceholder: "Напр. Word, Excel, Photoshop…",
            generateButton: "Собрать базу",
            generating: "Собираем…",
            loadedSuccess: (topic) => `База «${topic}» загружена`,
            startTraining: "Начать тренировку",
            theoryStep: "Разворот 1 из 2",
            theoryTitle: "Теория",
            theoryDesc: "Изучи комбинации, которые встретятся в тренировке, а затем закрепи их на практике.",
            exit: "Выйти",
            goToPractice: "Перейти к практике",
            practiceStep: "Разворот 2 из 2",
            doCombination: "Выполните комбинацию",
            finishedTitle: "Зачёт сдан",
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
            eyebrow: "Practice card No.",
            subtitle: "Practice the standard set from your notes (Word, System), or build a custom one for any other program",
            customPanelLabel: "Custom set for another program",
            inputPlaceholder: "e.g. Word, Excel, Photoshop…",
            generateButton: "Build set",
            generating: "Building…",
            loadedSuccess: (topic) => `"${topic}" set loaded`,
            startTraining: "Start training",
            theoryStep: "Spread 1 of 2",
            theoryTitle: "Theory",
            theoryDesc: "Study the combinations you'll be tested on, then lock them in with practice.",
            exit: "Exit",
            goToPractice: "Go to practice",
            practiceStep: "Spread 2 of 2",
            doCombination: "Perform the combination",
            finishedTitle: "Passed",
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
            eyebrow: "Машқ карточкаси №",
            subtitle: "Конспектларингиздаги стандарт базани (Word, Тизим) машқ қилинг ёки бошқа дастур учун ўзингизникини тузинг",
            customPanelLabel: "Бошқа дастур учун ўз базангиз",
            inputPlaceholder: "Масалан: Word, Excel, Photoshop…",
            generateButton: "База тузиш",
            generating: "Тузяпмиз…",
            loadedSuccess: (topic) => `«${topic}» базаси юкланди`,
            startTraining: "Машқни бошлаш",
            theoryStep: "1-варақ, 2 тадан",
            theoryTitle: "Назария",
            theoryDesc: "Ушбу машқда учрайдиган комбинацияларни ўрганинг, сўнг уларни амалиётда мустаҳкамланг.",
            exit: "Чиқиш",
            goToPractice: "Амалиётга ўтиш",
            practiceStep: "2-варақ, 2 тадан",
            doCombination: "Комбинацияни бажаринг",
            finishedTitle: "Зачёт топширилди",
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
// распознавание не зависит от активной раскладки клавиатуры.
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
 * ИКОНКИ
 * ==========================================================================*/

const Icon = {
    pin: (p) => (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M12 2v6M12 22v-6M5 9l7 3 7-3M5 15l7-3 7 3" />
        </svg>
    ),
    arrowLeft: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
    ),
    arrowRight: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    ),
    check: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M4 12l5 5L20 6" />
        </svg>
    ),
    repeat: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M4 10a8 8 0 0113.9-5.3M20 5v5h-5M20 14a8 8 0 01-13.9 5.3M4 19v-5h5" />
        </svg>
    ),
    pencil: (p) => (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    ),
    spinner: (p) => (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" {...p}>
            <path d="M12 3a9 9 0 106.36 2.64" />
        </svg>
    ),
};

/* ============================================================================
 * СТИЛИ — карточно-бумажная тема ("зачётка/картотека"), полностью своя
 * ==========================================================================*/

const IDX_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

.idx-root{
  --paper:#F6F0E3; --paper-alt:#ECE2CB; --card:#FFFCF4;
  --ink:#211F1A; --ink-soft:#6E6858; --ink-faint:#B9AF97;
  --accent:#D2491F; --accent-soft:#F3D9C9;
  --ok:#28684A; --ok-soft:#D9E8DB;
  font-family:'Inter',sans-serif; color:var(--ink); width:100%; position:relative;
}
.idx-stagearea{ position:relative; width:100%; max-width:760px; margin:0 auto; padding:14px 0 26px; }

/* "стопка карточек" под основной карточкой */
.idx-stagearea::before, .idx-stagearea::after{
  content:''; position:absolute; left:16px; right:16px; top:24px; bottom:6px;
  background:var(--paper-alt); border:2px solid var(--ink); border-radius:4px; z-index:0;
}
.idx-stagearea::before{ transform:rotate(-2deg); }
.idx-stagearea::after{ transform:rotate(1.4deg); background:var(--paper); }

.idx-shell{
  position:relative; z-index:1; background:var(--card); border:2px solid var(--ink); border-radius:4px;
  box-shadow:6px 6px 0 var(--ink);
}
.idx-inner{ padding:38px; display:flex; flex-direction:column; gap:24px; }
@media (max-width:640px){ .idx-inner{ padding:24px 18px; } .idx-shell{ box-shadow:4px 4px 0 var(--ink); } }

.idx-display{ font-family:'Fraunces',serif; letter-spacing:-.01em; }
.idx-mono{ font-family:'Space Mono',ui-monospace,monospace; }

.idx-topline{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }

.idx-lang-row{ display:flex; gap:4px; }
.idx-lang-tab{
  font-family:'Space Mono',monospace; font-size:10.5px; font-weight:700; letter-spacing:.04em;
  padding:6px 10px; border:2px solid var(--ink); background:var(--paper); color:var(--ink-soft);
  cursor:pointer; border-radius:3px 3px 0 0; transform:translateY(2px); transition:transform .12s ease, background .12s ease, color .12s ease;
}
.idx-lang-tab:hover{ transform:translateY(0); color:var(--ink); }
.idx-lang-tab.is-active{ background:var(--ink); color:var(--paper); transform:translateY(0); }

.idx-back-link{
  display:inline-flex; align-items:center; gap:5px; background:none; border:none; color:var(--ink-soft);
  font-size:12.5px; font-weight:700; cursor:pointer; padding:6px 0;
}
.idx-back-link:hover{ color:var(--ink); }

.idx-eyebrow{
  font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:.05em;
  color:var(--ink-soft); display:flex; align-items:center; gap:7px;
}
.idx-hero{ display:flex; align-items:center; gap:16px; margin-top:2px; }
.idx-stamp{
  width:56px; height:56px; border-radius:50%; border:2px dashed var(--accent); color:var(--accent);
  display:flex; align-items:center; justify-content:center; transform:rotate(-9deg); flex-shrink:0;
  font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.03em; text-align:center;
}
.idx-title{ font-size:36px; font-weight:700; margin:0; line-height:1; }

.idx-subtitle{ font-size:14.5px; line-height:1.65; color:var(--ink-soft); max-width:520px; margin:0; }

.idx-panel{ background:var(--paper); border:2px solid var(--ink); border-radius:4px; padding:22px; position:relative; }
.idx-panel::before{
  content:''; position:absolute; top:-2px; left:20px; right:20px; height:2px;
  background-image:repeating-linear-gradient(90deg, var(--ink) 0 8px, transparent 8px 16px);
}
.idx-panel-label{
  font-family:'Space Mono',monospace; font-size:10.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
  color:var(--ink-soft); margin-bottom:14px;
}

.idx-field-row{ display:flex; gap:10px; flex-wrap:wrap; }
.idx-input{
  flex:1 1 200px; padding:0 14px; height:46px; border-radius:3px; border:2px solid var(--ink);
  background:var(--card); color:var(--ink); font-size:14.5px; font-weight:500; outline:none;
}
.idx-input::placeholder{ color:var(--ink-faint); }
.idx-input:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

.idx-btn{
  height:46px; padding:0 20px; border-radius:3px; border:2px solid var(--ink); cursor:pointer; font-size:13.5px; font-weight:700;
  display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:transform .1s ease, opacity .1s ease;
  font-family:'Inter',sans-serif; background:var(--card); color:var(--ink); box-shadow:3px 3px 0 var(--ink);
}
.idx-btn:hover{ transform:translate(-1px,-1px); box-shadow:4px 4px 0 var(--ink); }
.idx-btn:active{ transform:translate(1px,1px); box-shadow:1px 1px 0 var(--ink); }
.idx-btn:disabled{ cursor:not-allowed; opacity:.55; transform:none; box-shadow:3px 3px 0 var(--ink); }
.idx-btn--accent{ background:var(--accent); color:#fff; }
.idx-btn--ink{ background:var(--ink); color:var(--paper); }
.idx-btn--ghost{ background:var(--paper); }
.idx-btn--full{ width:100%; height:54px; font-size:15px; }

.idx-banner{ margin-top:14px; font-size:13px; font-weight:600; text-align:center; border-radius:3px; padding:10px 14px; border:2px solid; }
.idx-banner--ok{ color:var(--ok); background:var(--ok-soft); border-color:var(--ok); }
.idx-banner--err{ color:var(--accent); background:var(--accent-soft); border-color:var(--accent); }

.idx-header{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:14px; padding-bottom:16px; border-bottom:2px solid var(--ink); }
.idx-exit{ display:inline-flex; align-items:center; gap:5px; background:none; border:none; color:var(--ink-soft); font-size:13px; font-weight:700; cursor:pointer; justify-self:start; }
.idx-exit:hover{ color:var(--ink); }
.idx-header-title{ font-size:19px; font-weight:700; text-align:center; margin:0; }
.idx-counter{ justify-self:end; font-family:'Space Mono',monospace; font-size:12.5px; font-weight:700; border:2px solid var(--ink); border-radius:999px; padding:5px 12px; }

.idx-theory-title{ font-size:26px; font-weight:700; margin:2px 0 0; }
.idx-theory-desc{ font-size:13.5px; color:var(--ink-soft); line-height:1.6; margin:0; }

.idx-combo-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; max-height:400px; overflow-y:auto; padding:4px 4px 4px 0; }
.idx-combo-card{
  display:flex; flex-direction:column; gap:12px; padding:15px; background:var(--paper); border:2px solid var(--ink); border-radius:4px;
  border-top-style:dashed;
}
.idx-combo-desc{ font-size:13.5px; font-weight:600; line-height:1.4; }
.idx-combo-keys{ display:flex; gap:6px; align-items:center; flex-wrap:wrap; }

.idx-tag{
  font-family:'Space Mono',monospace; font-weight:700; font-size:11px; padding:5px 9px; border-radius:3px;
  border:2px solid var(--ink); background:var(--card); color:var(--ink);
}
.idx-plus{ font-size:13px; font-weight:700; color:var(--ink-faint); }

.idx-coin{
  width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-family:'Space Mono',monospace; font-weight:700; font-size:15px; border:2px solid var(--ink); background:var(--card); color:var(--ink);
  transition:transform .1s ease, background .12s ease, color .12s ease, border-color .12s ease;
}
.idx-coin--sm{ width:32px; height:32px; font-size:12px; }
.idx-coin--lg{ width:58px; height:58px; font-size:22px; }
.idx-coin--mystery{ border-style:dashed; border-color:var(--accent); color:var(--accent); background:var(--paper); }
.idx-coin--success{ background:var(--ok); color:#fff; border-color:var(--ok); transform:scale(0.9); animation:idx-stampdown .28s ease; }
.idx-coin--error{ background:var(--accent); color:#fff; border-color:var(--accent); animation:idx-shake .32s ease; }

.idx-stage{ display:flex; flex-direction:column; align-items:center; gap:28px; padding:12px 0 4px; }
.idx-stage-eyebrow{ font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); }
.idx-stage-quote{ font-family:'Fraunces',serif; font-size:29px; font-weight:600; text-align:center; max-width:88%; line-height:1.28; }
.idx-stage-quote.is-success{ color:var(--ok); }

.idx-tally{ display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
.idx-tally-mark{ width:9px; height:22px; background:var(--paper-alt); border:2px solid var(--ink); border-radius:1px; transition:background .18s ease, transform .18s ease; }
.idx-tally-mark.is-done{ background:var(--ok); }
.idx-tally-mark.is-active{ background:var(--accent); transform:scaleY(1.15); }

.idx-done{ display:flex; flex-direction:column; align-items:center; gap:14px; padding:36px 0 6px; text-align:center; }
.idx-approve{
  width:118px; height:78px; border:3px solid var(--ok); border-radius:10px; color:var(--ok); transform:rotate(-6deg);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
  font-family:'Space Mono',monospace; font-weight:700;
}
.idx-approve-title{ font-size:15px; letter-spacing:.04em; }
.idx-approve-sub{ font-size:9px; letter-spacing:.12em; }
.idx-done-title{ font-size:27px; font-weight:700; margin:6px 0 0; }
.idx-done-desc{ font-size:14px; color:var(--ink-soft); margin:0; }
.idx-stat-row{ display:flex; gap:10px; margin-top:2px; }
.idx-stat{ background:var(--paper); border:2px solid var(--ink); border-radius:4px; padding:11px 20px; min-width:100px; }
.idx-stat-value{ font-family:'Space Mono',monospace; font-size:19px; font-weight:700; }
.idx-stat-label{ font-size:10px; color:var(--ink-soft); text-transform:uppercase; letter-spacing:.06em; margin-top:2px; }
.idx-done-actions{ display:flex; gap:10px; margin-top:12px; }

@keyframes idx-shake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }
@keyframes idx-stampdown{ 0%{transform:scale(1.25)} 60%{transform:scale(0.85)} 100%{transform:scale(0.9)} }

.idx-root button:focus-visible, .idx-root input:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

@media (prefers-reduced-motion: reduce){
  .idx-root *{ animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; }
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
    <div className="idx-lang-row">
        {LANGS.map((code) => (
            <button
                key={code}
                type="button"
                className={"idx-lang-tab" + (lang === code ? " is-active" : "")}
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
    <div className="idx-combo-keys">
        <span className="idx-tag">Ctrl</span>
        {task.shift && (
            <>
                <span className="idx-plus">+</span>
                <span className="idx-tag">Shift</span>
            </>
        )}
        <span className="idx-plus">+</span>
        <span
            className={
                `idx-coin idx-coin--${size}` +
                (mode === "mystery" ? " idx-coin--mystery" : "") +
                (mode === "success" ? " idx-coin--success" : "") +
                (mode === "error" ? " idx-coin--error" : "")
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
            <div className="idx-root">
                <style>{IDX_CSS}</style>
                <div className="idx-stagearea">
                    <motion.div className="idx-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <div className="idx-inner">
                            <div className="idx-topline">
                                {typeof onBack === "function" ? (
                                    <button type="button" className="idx-back-link" onClick={onBack}>
                                        <Icon.arrowLeft /> {t.exit}
                                    </button>
                                ) : <span />}
                                <LangSwitch lang={lang} onChange={setLang} />
                            </div>

                            <div>
                                <div className="idx-eyebrow"><Icon.pin /> {t.eyebrow}01</div>
                                <div className="idx-hero">
                                    <h2 className="idx-title idx-display">{t.title}</h2>
                                    <div className="idx-stamp">AI<br/>SET</div>
                                </div>
                            </div>

                            <p className="idx-subtitle">{t.subtitle}</p>

                            <div className="idx-panel">
                                <div className="idx-panel-label">{t.customPanelLabel}</div>
                                <div className="idx-field-row">
                                    <input
                                        className="idx-input"
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder={t.inputPlaceholder}
                                        disabled={status === "loading"}
                                    />
                                    <button className="idx-btn idx-btn--ink" onClick={generate} disabled={status === "loading"}>
                                        {status === "loading" ? <Icon.spinner /> : <Icon.pencil />}
                                        {status === "loading" ? t.generating : t.generateButton}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {status === "success" && isCustomBase && (
                                        <motion.div className="idx-banner idx-banner--ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                            {t.loadedSuccess(topic)}
                                        </motion.div>
                                    )}
                                    {status === "error" && message && (
                                        <motion.div className="idx-banner idx-banner--err" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                            {message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button className="idx-btn idx-btn--accent idx-btn--full" onClick={openTheory}>
                                {t.startTraining} <Icon.arrowRight />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ----------------------------- ЭКРАН: ТЕОРИЯ ------------------------------ */
    if (phase === "theory") {
        return (
            <div className="idx-root">
                <style>{IDX_CSS}</style>
                <div className="idx-stagearea">
                    <motion.div className="idx-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="idx-inner">
                            <div className="idx-topline">
                                <span className="idx-eyebrow idx-mono">{t.theoryStep}</span>
                                <LangSwitch lang={lang} onChange={setLang} />
                            </div>

                            <div>
                                <h2 className="idx-theory-title idx-display">{t.theoryTitle}{isCustomBase ? `: ${topic}` : ""}</h2>
                                <p className="idx-theory-desc" style={{ marginTop: 8 }}>{t.theoryDesc}</p>
                            </div>

                            <div className="idx-combo-grid">
                                {tasks.map((hk, i) => (
                                    <motion.div key={i} className="idx-combo-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.3) }}>
                                        <div className="idx-combo-desc">{getDesc(hk)}</div>
                                        <ComboKeys task={hk} size="sm" mode="reveal" />
                                    </motion.div>
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="idx-btn idx-btn--ghost" style={{ flex: "0 0 140px" }} onClick={exitToSetup}>{t.exit}</button>
                                <button className="idx-btn idx-btn--accent" style={{ flex: 1 }} onClick={startPractice}>
                                    {t.goToPractice} <Icon.arrowRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ---------------------------- ЭКРАН: РЕЗУЛЬТАТ ---------------------------- */
    if (phase === "done") {
        return (
            <div className="idx-root">
                <style>{IDX_CSS}</style>
                <div className="idx-stagearea">
                    <motion.div className="idx-shell" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                        <div className="idx-inner">
                            <div className="idx-topline"><span /><LangSwitch lang={lang} onChange={setLang} /></div>

                            <div className="idx-done">
                                <div className="idx-approve">
                                    <span className="idx-approve-title">ЗАЧЁТ</span>
                                    <span className="idx-approve-sub">CERTIFIED</span>
                                </div>
                                <h2 className="idx-done-title idx-display">{t.finishedTitle}</h2>
                                <p className="idx-done-desc">{t.finishedDesc(score, tasks.length)}</p>

                                <div className="idx-stat-row">
                                    <div className="idx-stat">
                                        <div className="idx-stat-value idx-mono" style={{ color: "var(--accent)" }}>{accuracy}%</div>
                                        <div className="idx-stat-label">{t.statAccuracy}</div>
                                    </div>
                                    <div className="idx-stat">
                                        <div className="idx-stat-value idx-mono">{mistakes}</div>
                                        <div className="idx-stat-label">{t.statMistakes}</div>
                                    </div>
                                </div>

                                <div className="idx-done-actions">
                                    <button className="idx-btn idx-btn--ghost" onClick={exitToSetup}>{t.backToSetup}</button>
                                    <button className="idx-btn idx-btn--accent" onClick={restart}><Icon.repeat /> {t.repeat}</button>
                                </div>
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
        <div className="idx-root">
            <style>{IDX_CSS}</style>
            <div className="idx-stagearea">
                <motion.div className="idx-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="idx-inner">
                        <div className="idx-header">
                            <button type="button" className="idx-exit" onClick={exitToSetup}><Icon.arrowLeft /> {t.exit}</button>
                            <h2 className="idx-header-title idx-display">{isCustomBase ? `${t.title}: ${topic}` : t.title}</h2>
                            <span className="idx-counter idx-mono">{index + 1} / {tasks.length}</span>
                        </div>

                        <div className="idx-tally">
                            {tasks.map((_, i) => (
                                <span key={i} className={"idx-tally-mark" + (i < index ? " is-done" : "") + (i === index ? " is-active" : "")} />
                            ))}
                        </div>

                        <div className="idx-stage">
                            <div className="idx-stage-eyebrow">{t.doCombination}</div>

                            <motion.div
                                key={index}
                                className={"idx-stage-quote" + (feedback === "success" ? " is-success" : "")}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                            >
                                «{getDesc(currentTask)}»
                            </motion.div>

                            <ComboKeys task={currentTask} size="lg" mode={feedback || "mystery"} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

Object.assign(window, { HotkeyTrainer });
