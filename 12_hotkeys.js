// HotkeyTrainer v4. Полная замена файла, стили встроены. Экспорт: window.HotkeyTrainer.
(function () {
  'use strict';

  const {
    useState,
    useEffect,
    useRef,
    useMemo
  } = React;
  const SHIFT_SYMBOL_MAP = {
    '1': '!',
    '2': '@',
    '3': '#',
    '4': '$',
    '5': '%',
    '6': '^',
    '7': '&',
    '8': '*',
    '9': '(',
    '0': ')',
    '-': '_',
    '=': '+',
    '[': '{',
    ']': '}',
    '\\': '|',
    ';': ':',
    "'": '"',
    ',': '<',
    '.': '>',
    '/': '?',
    '`': '~'
  };

  // Штатная база горячих клавиш. desc хранится "ключом перевода" (descKey),
  // само отображаемое описание берётся из HOTKEY_DESC_TRANSLATIONS[lang][descKey] —
  // так база остаётся одна для всех языков.
  const HOTKEYS_DB = [{
    descKey: "alignRight",
    key: "r",
    shift: false,
    visual: "Ctrl + R"
  }, {
    descKey: "alignLeft",
    key: "l",
    shift: false,
    visual: "Ctrl + L"
  }, {
    descKey: "undo",
    key: "z",
    shift: false,
    visual: "Ctrl + Z"
  }, {
    descKey: "cut",
    key: "x",
    shift: false,
    visual: "Ctrl + X"
  }, {
    descKey: "alignCenter",
    key: "e",
    shift: false,
    visual: "Ctrl + E"
  }, {
    descKey: "selectAll",
    key: "a",
    shift: false,
    visual: "Ctrl + A"
  }, {
    descKey: "italic",
    key: "i",
    shift: false,
    visual: "Ctrl + I"
  }, {
    descKey: "print",
    key: "p",
    shift: false,
    visual: "Ctrl + P"
  }, {
    descKey: "underline",
    key: "u",
    shift: false,
    visual: "Ctrl + U"
  }, {
    descKey: "save",
    key: "s",
    shift: false,
    visual: "Ctrl + S"
  }, {
    descKey: "copy",
    key: "c",
    shift: false,
    visual: "Ctrl + C"
  }, {
    descKey: "paste",
    key: "v",
    shift: false,
    visual: "Ctrl + V"
  }, {
    descKey: "openFile",
    key: "o",
    shift: false,
    visual: "Ctrl + O"
  }, {
    descKey: "closeDoc",
    key: "w",
    shift: false,
    visual: "Ctrl + W"
  }, {
    descKey: "find",
    key: "f",
    shift: false,
    visual: "Ctrl + F"
  }, {
    descKey: "findReplace",
    key: "h",
    shift: false,
    visual: "Ctrl + H"
  }, {
    descKey: "redo",
    key: "y",
    shift: false,
    visual: "Ctrl + Y"
  }, {
    descKey: "hyperlink",
    key: "k",
    shift: false,
    visual: "Ctrl + K"
  }, {
    descKey: "fontBigger",
    key: ".",
    shift: true,
    visual: "Ctrl + Shift + >"
  }, {
    descKey: "fontSmaller",
    key: ",",
    shift: true,
    visual: "Ctrl + Shift + <"
  }, {
    descKey: "doubleUnderline",
    key: "d",
    shift: true,
    visual: "Ctrl + Shift + D"
  }, {
    descKey: "allCaps",
    key: "a",
    shift: true,
    visual: "Ctrl + Shift + A"
  }, {
    descKey: "underlineWords",
    key: "w",
    shift: true,
    visual: "Ctrl + Shift + W"
  }, {
    descKey: "newTab",
    key: "t",
    shift: false,
    visual: "Ctrl + T"
  }, {
    descKey: "newFile",
    key: "n",
    shift: false,
    visual: "Ctrl + N"
  }, {
    descKey: "bold",
    key: "b",
    shift: false,
    visual: "Ctrl + B"
  }];
  const HOTKEY_DESC_TRANSLATIONS = {
    ru: {
      alignRight: "Выровнять текст по правому краю",
      alignLeft: "Выровнять текст по левому краю",
      undo: "Отменить последнее действие",
      cut: "Вырезать текст",
      alignCenter: "Выровнять текст по центру",
      selectAll: "Выделить весь текст",
      italic: "Курсив",
      print: "Открыть окно печати",
      underline: "Подчеркнуть текст",
      save: "Сохранить",
      copy: "Копировать",
      paste: "Вставить",
      openFile: "Открыть файл",
      closeDoc: "Выйти из документа",
      find: "Найти",
      findReplace: "Найти и заменить",
      redo: "Повторить отменённое действие",
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
      loadedSuccess: topic => `База «${topic}» загружена`,
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
      loadedSuccess: topic => `"${topic}" set loaded`,
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
      loadedSuccess: topic => `«${topic}» базаси юкланди`,
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
  const LANG_LABEL = {
    ru: "РУС",
    en: "ENG",
    uz: "ЎЗБ"
  };
  const CSS = `.hx{--hx-bg:#11101c;--hx-panel:#1b1829;--hx-soft:#262138;--hx-text:#f6f3ff;--hx-muted:#afa6c5;--hx-line:#ffffff14;--hx-purple:#b498ff;--hx-tint:#a17afa17;--hx-green:#75e3b2;--hx-red:#ffa6b9;--hx-shadow:#00000038;--hx-key:#272236;--hx-edge:#100d19;color:var(--hx-text);color-scheme:dark;width:100%;max-width:1060px;margin:auto;font-family:inherit;font-size:16px;line-height:1.5;isolation:isolate}
:is(html.light,body.light,.theme-light,[data-theme="light"]) .hx,.hx.hx-light{--hx-bg:#f5f3fb;--hx-panel:#fff;--hx-soft:#ede8f7;--hx-text:#292238;--hx-muted:#6f647f;--hx-line:#67537d24;--hx-purple:#7349bd;--hx-tint:#8652d410;--hx-green:#177a54;--hx-red:#b23e58;--hx-shadow:#69538816;--hx-key:#fff;--hx-edge:#d9d0e9;color-scheme:light}
.hx.hx-dark{--hx-bg:#11101c;--hx-panel:#1b1829;--hx-soft:#262138;--hx-text:#f6f3ff;--hx-muted:#afa6c5;--hx-line:#ffffff14;--hx-purple:#b498ff;--hx-tint:#a17afa17;--hx-green:#75e3b2;--hx-red:#ffa6b9;--hx-shadow:#00000038;--hx-key:#272236;--hx-edge:#100d19;color-scheme:dark}
.hx *,.hx *:before,.hx *:after{box-sizing:border-box}.hx h2,.hx h3,.hx h4,.hx p{margin:0}.hx button,.hx input{font:inherit;letter-spacing:inherit;color:inherit}.hx button{cursor:pointer}.hx button:disabled{cursor:default;opacity:.5}.hx svg{flex-shrink:0;display:block}.hx button:focus-visible,.hx input:focus-visible,.hx a:focus-visible,.hx [tabindex]:focus-visible{outline:3px solid var(--hx-purple);outline-offset:4px}.hx-shell{background:radial-gradient(ellipse at 95% 0,var(--hx-tint),transparent 60%),var(--hx-bg);border:1px solid var(--hx-line);box-shadow:0 25px 70px var(--hx-shadow);padding:34px;border-radius:30px;overflow:hidden;position:relative}.hx-header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:28px}.hx-brand{display:flex;align-items:center;gap:12px}.hx-brand-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,#c18aff,#8052dd);color:#fff;box-shadow:0 7px 25px #8651db30,inset 0 1px 0 #ffffff40}.hx-brand h2{font-size:22px;letter-spacing:-.7px;font-weight:780;line-height:1.2}.hx-brand>div>span{font-size:8px;letter-spacing:2px;font-weight:650;color:var(--hx-muted)}.hx-languages{display:flex;gap:3px;border:1px solid var(--hx-line);padding:4px;border-radius:12px;background:var(--hx-panel)}.hx-languages button{background:transparent;border:0;border-radius:8px;padding:8px 10px;font-size:10px;font-weight:750;color:var(--hx-muted);transition:background .2s,color .2s}.hx-languages button[aria-pressed=true]{background:var(--hx-soft);color:var(--hx-purple)}.hx-steps{display:flex;align-items:center;gap:25px;border-bottom:1px solid var(--hx-line);padding-bottom:20px;margin-bottom:30px}.hx-steps>span{display:flex;align-items:center;gap:8px;color:var(--hx-muted);font-size:12px;font-weight:600}.hx-steps i{font-style:normal;display:grid;place-items:center;width:23px;height:23px;border:1px solid var(--hx-line);border-radius:7px;font-size:9px}.hx-steps .active{color:var(--hx-purple)}.hx-steps .active i{background:var(--hx-tint);border-color:var(--hx-purple)}.hx-steps .done i{color:var(--hx-green);background:var(--hx-tint)}
.hx-enter{animation:hx-in .5s cubic-bezier(.2,.8,.2,1) both}.hx-hero{display:grid;grid-template-columns:1.4fr 1fr;align-items:center;gap:30px;margin:12px 0 38px}.hx-eyebrow{display:block;font-size:9px;font-weight:750;letter-spacing:1.6px;color:var(--hx-purple);margin-bottom:13px}.hx-hero h3{font-size:clamp(29px,3.6vw,43px);letter-spacing:-1.6px;font-weight:780;line-height:1.2}.hx-hero h3>span{display:block}.hx-gradient{background:linear-gradient(100deg,#a47aed,#c183e0,#919cfa);color:var(--hx-purple);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}.hx-hero p{font-size:14px;color:var(--hx-muted);line-height:1.8;margin-top:16px;max-width:450px}.hx-key-art{height:185px;position:relative;perspective:700px}.hx-art-glow{position:absolute;inset:-25px;background:radial-gradient(ellipse,#a375ef2e,transparent 65%)}.hx-key-art kbd{position:absolute;display:grid;place-items:center;border:1px solid #ffffff2b;border-radius:20px;box-shadow:0 9px 0 #38235a,0 27px 40px #00000030,inset 0 1px 0 #ffffff40;font-family:inherit;font-weight:750;color:white;animation:hx-key-float 5s ease-in-out infinite;transform:rotate(-10deg)}.hx-art-ctrl{width:117px;height:83px;left:12px;top:21px;background:linear-gradient(130deg,#565069,#393447);font-size:25px}.hx-key-art .hx-art-c{width:91px;height:91px;left:142px;top:51px;background:linear-gradient(130deg,#b984f9,#8453d3);font-size:38px;animation-delay:-1.7s}.hx-key-art .hx-art-shift{width:87px;height:58px;left:35px;top:111px;background:linear-gradient(130deg,#373041,#241e30);font-size:17px;animation-delay:-3s;border-radius:15px}.hx-art-note{position:absolute;display:flex;align-items:center;gap:6px;font-size:9px;letter-spacing:.7px;color:var(--hx-muted);bottom:-6px;left:150px}
.hx-setup-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.hx-card{padding:25px;border:1px solid var(--hx-line);border-radius:20px;background:var(--hx-panel);min-width:0}.hx-card-heading{display:flex;align-items:center;gap:12px;margin-bottom:21px}.hx-small-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;color:var(--hx-purple);background:var(--hx-tint)}.hx-card-heading h3{font-size:17px;letter-spacing:-.4px;font-weight:730}.hx-card-heading p{font-size:11px;color:var(--hx-muted);margin-top:3px}.hx-set-options{display:grid;gap:8px}.hx-set{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;background:var(--hx-bg);border:1px solid var(--hx-line);border-radius:13px;padding:14px;transition:background .2s,border-color .2s}.hx-set.selected{border-color:var(--hx-purple);background:var(--hx-tint)}.hx-set strong{display:block;font-size:14px;font-weight:650;overflow-wrap:anywhere}.hx-set small{display:block;font-size:11px;color:var(--hx-muted);margin-top:3px}.hx-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border:1px solid var(--hx-line);background:var(--hx-tint);border-radius:8px;font-size:11px;color:var(--hx-purple);overflow-wrap:anywhere}.hx-field-label{display:block;font-size:12px;color:var(--hx-muted);font-weight:600;margin:19px 0 9px}.hx-segment{display:flex;gap:5px;background:var(--hx-bg);padding:4px;border:1px solid var(--hx-line);border-radius:12px}.hx-segment button{flex:1;min-width:0;padding:10px 7px;border:1px solid transparent;border-radius:8px;font-size:12px;color:var(--hx-muted);background:transparent;font-weight:600;transition:background .2s,transform .2s}.hx-segment button[aria-pressed=true]{color:var(--hx-text);background:var(--hx-soft);border-color:var(--hx-line)}.hx-segment button:active{transform:scale(.97)}.hx-caption{font-size:12px;color:var(--hx-muted);line-height:1.7}.hx-mode-note{min-height:41px;margin-top:13px!important}.hx-ai-card{background:radial-gradient(ellipse at 100% 0,var(--hx-tint),transparent 80%),var(--hx-panel)}.hx-ai-card input{display:block;width:100%;height:49px;border:1px solid var(--hx-line);background:var(--hx-bg);border-radius:12px;padding:0 14px;font-size:14px}.hx-ai-card input:focus{border-color:var(--hx-purple)}.hx-ai-card input::placeholder{color:var(--hx-muted)}.hx-suggestions{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0 20px}.hx-suggestions button{border:1px solid var(--hx-line);border-radius:7px;padding:5px 8px;font-size:10px;background:transparent;color:var(--hx-muted)}.hx-suggestions button:hover{color:var(--hx-purple);border-color:var(--hx-purple)}.hx-ai-card form>.hx-button{width:100%}.hx-ai-note{margin-top:22px!important;font-size:11px}.hx-notice,.hx-error{font-size:12px;border-radius:10px;padding:11px;margin-top:15px;line-height:1.6}.hx-notice{display:flex;gap:8px;align-items:center;background:#26b67b10;color:var(--hx-green)}.hx-error{background:#df436a12;color:var(--hx-red)}
.hx-button{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:45px;padding:12px 17px;border:1px solid var(--hx-line);border-radius:12px;background:var(--hx-panel);font-size:13px!important;font-weight:700;line-height:1.4;transition:transform .18s,box-shadow .2s,border-color .2s;position:relative;overflow:hidden}.hx-button:hover:not(:disabled){transform:translateY(-2px);border-color:var(--hx-purple)}.hx-button:active:not(:disabled){transform:translateY(1px)}.hx-primary{color:#fff!important;border-color:#ad88ed70;background:linear-gradient(115deg,#a063e8,#7954df);box-shadow:0 8px 22px #8050d62b,inset 0 1px 0 #ffffff2b}.hx-primary:after{content:"";position:absolute;inset:-80%;background:linear-gradient(100deg,transparent 45%,#ffffff30 50%,transparent 55%);transform:translateX(-70%);transition:transform .6s;pointer-events:none}.hx-primary:hover:after{transform:translateX(70%)}.hx-secondary{background:var(--hx-tint);border-color:var(--hx-purple);color:var(--hx-purple)!important}.hx-link{display:inline-flex;align-items:center;gap:7px;background:none;border:0;padding:9px 3px;font-size:12px!important;font-weight:650;color:var(--hx-purple)!important}.hx-link:hover:not(:disabled){text-decoration:underline}.hx-setup-footer{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:27px;padding-top:22px;border-top:1px solid var(--hx-line)}.hx-setup-footer .hx-primary{min-width:235px;min-height:52px}.hx-spinner{display:inline-block;width:16px;height:16px;border:2px solid var(--hx-line);border-top-color:var(--hx-purple);border-radius:50%;animation:hx-spin .8s linear infinite}
.hx-title-row{display:flex;justify-content:space-between;align-items:center;gap:25px;margin-bottom:24px}.hx-title-row h3{font-size:29px;letter-spacing:-.8px}.hx-title-row p{font-size:14px;line-height:1.7;color:var(--hx-muted);max-width:640px;margin-top:10px}.hx-theory-tools{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px}.hx-search{display:flex;align-items:center;gap:9px;border:1px solid var(--hx-line);border-radius:11px;background:var(--hx-panel);padding:0 12px;min-width:0;color:var(--hx-muted);max-width:330px}.hx-search input{height:40px;width:100%;min-width:0;border:0;background:transparent;outline:0;font-size:12px}.hx-search:focus-within{border-color:var(--hx-purple)}.hx-theory-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.hx-theory-card{padding:20px;border:1px solid var(--hx-line);background:var(--hx-panel);border-radius:16px;animation:hx-in .45s both;transition:transform .2s,border-color .2s;min-width:0}.hx-theory-card:hover{transform:translateY(-3px);border-color:var(--hx-purple)}.hx-card-index{font-size:10px;color:var(--hx-purple);font-weight:650}.hx-theory-card h4{font-size:14px;line-height:1.5;margin:10px 0 18px;font-weight:600;min-height:42px}.hx-theory-card>small{display:block;font-size:9px;color:var(--hx-muted);margin-top:14px}.hx-combo{display:inline-flex;gap:7px;align-items:center;justify-content:center;flex-wrap:wrap}.hx-combo kbd{font-family:inherit;display:inline-grid;place-items:center;min-width:33px;min-height:34px;padding:5px 9px;background:var(--hx-key);border:1px solid var(--hx-line);border-radius:8px;box-shadow:0 3px 0 var(--hx-edge),inset 0 1px 0 #ffffff12;font-size:13px;font-weight:650;color:var(--hx-text);transition:transform .15s,box-shadow .15s}.hx-combo kbd.hx-key-accent{color:var(--hx-purple);border-color:var(--hx-purple);background:var(--hx-tint)}.hx-plus{color:var(--hx-muted);font-size:12px}.hx-theory-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:24px}.hx-theory-footer a{color:var(--hx-muted);text-decoration:none}.hx-theory-footer .hx-primary{margin-left:auto}
.hx-practice-top{display:flex;align-items:center;gap:16px;justify-content:space-between}.hx-counter{font-size:23px;font-weight:750;white-space:nowrap;font-variant-numeric:tabular-nums}.hx-counter small{font-size:14px;color:var(--hx-muted);font-weight:500}.hx-progress{height:5px;border-radius:5px;background:var(--hx-soft);overflow:hidden;margin:20px 0 26px}.hx-progress>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#895bda,#c99cff);transition:width .45s cubic-bezier(.2,.7,.2,1)}.hx-task{position:relative;isolation:isolate;text-align:center;border:1px solid var(--hx-line);border-radius:23px;padding:35px 24px 18px;background:radial-gradient(ellipse at 50% 100%,var(--hx-tint),transparent 70%),var(--hx-panel);transition:border-color .25s,box-shadow .25s}.hx-task h3{font-size:clamp(24px,3vw,33px);line-height:1.35;letter-spacing:-.7px;max-width:680px;margin:0 auto 27px;font-weight:700}.hx-task .hx-combo{gap:13px}.hx-task .hx-combo kbd{font-size:27px;min-width:74px;min-height:69px;border-radius:14px;padding:10px 18px;box-shadow:0 6px 0 var(--hx-edge),0 10px 18px var(--hx-shadow)}.hx-task .hx-plus{font-size:22px}.hx-task.is-correct{border-color:var(--hx-green);box-shadow:0 0 28px #32b98315}.hx-task.is-correct .hx-key-accent{background:#2bb67d18;color:var(--hx-green);border-color:var(--hx-green);animation:hx-correct .5s cubic-bezier(.2,.8,.2,1)}.hx-feedback{min-height:42px;display:flex;justify-content:center;align-items:center;gap:9px;color:var(--hx-muted);font-size:12px;margin-top:21px}.hx-feedback.correct{color:var(--hx-green)}.hx-feedback.wrong{color:var(--hx-red);animation:hx-shake .28s ease-out}.hx-practice-actions{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:75px;margin:6px 0}.hx-practice-actions>.hx-caption{text-align:center;max-width:480px;font-size:11px}.hx-practice-actions>.hx-link{white-space:nowrap}.hx-keyboard{background:var(--hx-panel);padding:18px 22px 23px;border:1px solid var(--hx-line);border-radius:21px}.hx-key-row{display:flex;justify-content:center;gap:6px;margin-bottom:8px}.hx .hx-screen-key{display:grid;place-items:center;flex:1;min-width:0;max-width:68px;height:45px;min-height:45px;padding:0;border:1px solid var(--hx-line);border-radius:9px;background:var(--hx-key);color:var(--hx-text);font-size:14px;line-height:1;font-weight:650;box-shadow:0 4px 0 var(--hx-edge),inset 0 1px 0 #ffffff16;transition:transform .12s,box-shadow .12s,background .15s,border-color .15s;user-select:none;-webkit-tap-highlight-color:transparent}.hx .hx-screen-key:active:not(:disabled),.hx .hx-screen-key.pressed{transform:translateY(3px);box-shadow:0 1px 0 var(--hx-edge);background:var(--hx-tint)}.hx .hx-screen-key:hover:not(:disabled){border-color:var(--hx-purple)}.hx .hx-screen-key[aria-pressed=true]{background:linear-gradient(145deg,#a16fe5,#7953c5);border-color:#cba1ff;color:white;box-shadow:0 3px 0 #51317f}.hx .hx-screen-key.hinted{border-color:var(--hx-purple);color:var(--hx-purple);box-shadow:0 4px 0 var(--hx-edge),0 0 15px var(--hx-tint)}.hx-modifiers{margin:13px 0 0;justify-content:flex-start;align-items:center}.hx-modifiers .hx-screen-key{flex:0 0 90px;max-width:none;font-size:12px}.hx-modifiers>span{font-size:10px;color:var(--hx-muted);margin-left:auto;text-align:right}.hx-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px}.hx-metrics>div{border:1px solid var(--hx-line);border-radius:14px;background:var(--hx-panel);padding:15px 19px;min-width:0}.hx-metrics span{display:block;font-size:11px;color:var(--hx-muted);margin-bottom:5px}.hx-metrics strong{display:block;font-size:24px;line-height:1.3;font-weight:730;font-variant-numeric:tabular-nums}.hx-metrics>div:first-child strong{color:var(--hx-purple)}
.hx-pause{padding:45px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:20px}.hx-pause h3{font-size:29px;letter-spacing:-.6px}.hx-pause p{font-size:14px;color:var(--hx-muted)}.hx-result-hero{text-align:center;padding:15px 20px 10px}.hx-result-icon{display:grid;place-items:center;width:78px;height:78px;border-radius:25px;background:linear-gradient(140deg,#a271e9,#734ed0);color:white;box-shadow:0 12px 35px #8851d43b;margin:0 auto 22px;animation:hx-result-pop .7s cubic-bezier(.2,.8,.2,1) both;position:relative}.hx-result-hero .hx-result-icon:before,.hx-result-hero .hx-result-icon:after{content:"";position:absolute;border:1px solid var(--hx-purple);border-radius:30px;inset:-10px;opacity:0;animation:hx-ring 1s ease-out .15s}.hx-result-hero .hx-result-icon:after{animation-delay:.35s}.hx-result-hero h3{font-size:35px;letter-spacing:-1px;font-weight:750}.hx-result-hero p{margin:13px auto 0;max-width:530px;font-size:14px;color:var(--hx-muted);line-height:1.8}.hx-result-actions{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin:25px 0}.hx-review{background:var(--hx-panel);border:1px solid var(--hx-line);border-radius:20px;padding:22px;margin-top:28px}.hx-review h4{font-size:17px;margin-bottom:12px}.hx-review-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px solid var(--hx-line)}.hx-review-row:last-child{border:0;padding-bottom:0}.hx-review-row>div{min-width:0}.hx-review-row strong{font-size:13px;font-weight:600;display:block}.hx-review-row small{font-size:11px;display:block;margin-top:4px;color:var(--hx-muted)}.hx-review-row .hx-combo{flex-shrink:0}
@keyframes hx-in{from{opacity:0;transform:translateY(13px)}to{opacity:1;transform:translateY(0)}}@keyframes hx-key-float{0%,100%{transform:translateY(0) rotate(-10deg)}50%{transform:translateY(-8px) rotate(-6deg)}}@keyframes hx-spin{to{transform:rotate(360deg)}}@keyframes hx-correct{0%{transform:translateY(3px) scale(.95)}55%{transform:translateY(-4px) scale(1.06)}100%{transform:translateY(0) scale(1)}}@keyframes hx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}@keyframes hx-result-pop{from{opacity:0;transform:scale(.65) rotate(-12deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes hx-ring{from{opacity:.6;transform:scale(.85)}to{opacity:0;transform:scale(1.55)}}
@media(max-width:800px){.hx-shell{padding:25px}.hx-hero{grid-template-columns:1.3fr 1fr;gap:10px}.hx-hero h3{font-size:32px}.hx-key-art{transform:scale(.85);transform-origin:center}.hx-setup-grid{gap:12px}.hx-card{padding:19px}.hx-theory-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hx-task{padding-top:28px}.hx-keyboard{padding:14px 12px 19px}.hx .hx-screen-key{height:42px;min-height:42px}.hx-practice-actions{gap:10px}.hx-practice-actions>.hx-caption{max-width:300px}}
@media(max-width:580px){.hx-shell{padding:18px;border-radius:23px}.hx-header{gap:10px;margin-bottom:21px}.hx-brand{gap:9px}.hx-brand-icon{width:39px;height:39px;border-radius:12px}.hx-brand h2{font-size:20px}.hx-brand>div>span{font-size:7px;letter-spacing:1.3px}.hx-languages{padding:3px;gap:1px}.hx-languages button{font-size:9px;padding:8px 7px}.hx-steps{gap:13px;margin-bottom:22px;padding-bottom:17px}.hx-steps>span{font-size:10px;gap:5px}.hx-steps i{width:19px;height:19px;font-size:8px}.hx-hero{grid-template-columns:1fr;margin-bottom:25px;gap:3px}.hx-hero h3{font-size:31px;letter-spacing:-1px}.hx-hero p{font-size:13px}.hx-eyebrow{font-size:8px;letter-spacing:1.2px}.hx-key-art{display:none}.hx-setup-grid{grid-template-columns:1fr;gap:15px}.hx-card{padding:21px}.hx-card-heading h3{font-size:17px}.hx-card-heading p{font-size:11px}.hx-mode-note{min-height:0}.hx-setup-footer{flex-direction:column;align-items:stretch;gap:14px;text-align:center}.hx-setup-footer .hx-primary{width:100%;min-width:0}.hx-title-row{gap:15px;align-items:flex-start}.hx-title-row h3{font-size:25px}.hx-title-row p{font-size:12px}.hx-title-row .hx-button{padding:9px 11px;font-size:11px!important;min-height:39px}.hx-theory-tools{flex-direction:column;align-items:stretch;gap:12px}.hx-search{max-width:none}.hx-theory-grid{grid-template-columns:1fr}.hx-theory-card{padding:18px;position:relative}.hx-theory-card h4{min-height:0;margin:8px 0 15px;font-size:15px}.hx-theory-footer{flex-direction:column;align-items:stretch}.hx-theory-footer .hx-primary{margin:0}.hx-practice-top{gap:8px}.hx-practice-top .hx-badge{font-size:9px;max-width:45%;padding:5px 7px}.hx-practice-top .hx-button{padding:9px 10px;min-height:36px;font-size:10px!important;gap:5px}.hx-counter{font-size:19px}.hx-counter small{font-size:11px}.hx-progress{margin:17px 0 20px}.hx-task{padding:26px 13px 15px;border-radius:18px}.hx-task h3{font-size:24px;margin-bottom:25px;line-height:1.4}.hx-task .hx-combo{gap:9px}.hx-task .hx-combo kbd{min-width:55px;min-height:57px;font-size:21px;padding:8px 12px;border-radius:11px}.hx-task .hx-plus{font-size:17px}.hx-feedback{font-size:11px;margin-top:20px}.hx-practice-actions{flex-wrap:wrap;gap:8px;margin:12px 0 16px;min-height:0}.hx-practice-actions>.hx-caption{order:3;max-width:none;flex-basis:100%;text-align:left;font-size:10px}.hx-practice-actions>.hx-button{font-size:11px!important;padding:9px 13px;min-height:39px}.hx-keyboard{padding:11px 7px 16px;border-radius:15px}.hx-key-row{gap:3px;margin-bottom:7px}.hx .hx-screen-key{height:36px;min-height:36px;font-size:11px;border-radius:5px;box-shadow:0 3px 0 var(--hx-edge)}.hx-modifiers{margin-bottom:0;gap:6px}.hx-modifiers .hx-screen-key{flex-basis:57px;font-size:10px}.hx-modifiers>span{font-size:8px;max-width:110px}.hx-metrics{gap:7px;margin-top:17px}.hx-metrics>div{padding:12px 10px;border-radius:12px}.hx-metrics span{font-size:10px;min-height:29px}.hx-metrics strong{font-size:23px}.hx-result-hero{padding:10px 0}.hx-result-hero h3{font-size:28px}.hx-result-hero p{font-size:13px}.hx-result-actions{flex-direction:column;align-items:stretch;margin:22px 0}.hx-result-actions>.hx-link{justify-content:center}.hx-review{padding:16px}.hx-review-row{align-items:flex-start;flex-direction:column;gap:12px}.hx-review-row strong{font-size:14px}.hx-pause{padding:30px 0}.hx-pause h3{font-size:25px}}
@media(prefers-reduced-motion:reduce){.hx *,.hx *:before,.hx *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
  const EXTRA = {
    ru: {
      eyebrow: 'ПРАКТИКА, КОТОРАЯ СТАНЕТ ПРИВЫЧКОЙ',
      hero: 'Меньше кликов.\nБольше уверенности.',
      intro: 'Запоминай сочетания через действие: изучи, попробуй и закрепи сложное.',
      base: 'Базовые сочетания',
      baseNote: 'Word и браузер · Windows',
      custom: 'Набор с ИИ',
      aiNote: 'ИИ может ошибаться. Проверяй сочетания по справке выбранной программы.',
      size: 'Заданий за подход',
      screen: 'На экране',
      physical: 'Клавиатура',
      inputMode: 'Как отвечать',
      screenHelp: 'Нажми Ctrl, при необходимости Shift, затем нужную клавишу.',
      physicalHelp: 'Нажимай сочетания, когда поле тренировки в фокусе. Для команд браузера используй экранные клавиши.',
      configure: 'Настройки',
      practice: 'Практика',
      results: 'Результат',
      cancel: 'Отмена',
      hint: 'Подсказка',
      skip: 'Пропустить',
      next: 'Следующее',
      finish: 'К результатам',
      correct: 'Верно! Сочетание засчитано.',
      wrong: 'Пока не совпало. Попробуй ещё раз.',
      ready: 'Выбери сочетание на клавиатуре ниже.',
      focus: 'Нажми здесь и выполни сочетание',
      pause: 'Пауза',
      resume: 'Продолжить',
      paused: 'Тренировка на паузе',
      pauseHelp: 'Задание и прогресс сохранены в этой сессии.',
      solved: 'Решено',
      first: 'С первого раза',
      mistakes: 'Ошибки',
      remaining: 'Осталось',
      retry: 'Повторить сложные',
      all: 'Новый подход',
      review: 'Разбор сочетаний',
      learned: 'Без подсказки',
      assisted: 'С подсказкой / ошибкой',
      skipped: 'Пропущено',
      saved: 'Результат сохранён в профиле',
      saving: 'Сохраняем результат…',
      saveError: 'Не удалось сохранить результат.',
      saveAgain: 'Повторить сохранение',
      guest: 'Войди в аккаунт, чтобы сохранять результаты.',
      keys: 'сочетаний',
      loaded: 'Набор готов',
      search: 'Найти действие или сочетание',
      nothing: 'Ничего не найдено',
      timedOut: 'Запрос занял слишком много времени. Попробуй ещё раз.',
      control: 'Ctrl',
      newSet: 'Выбрать другой набор',
      doneNote: 'Посмотри, что уже получается, и повтори сложные сочетания.',
      step: 'Шаг',
      windows: 'Учебные сочетания для Windows',
      source: 'Справка Word',
      blocked: 'Это сочетание может перехватить браузер. Введи его экранными клавишами.',
      readySet: 'Готовый набор',
      session: 'ТРЕНИРОВКА',
      accountChanged: 'Аккаунт изменился. Начни новый подход.',
      layout: 'Клавиши QWERTY распознаются по физическому расположению.',
      retryNote: 'В повторение попадут подсказки, ошибки и пропуски.'
    },
    en: {
      eyebrow: 'PRACTICE THAT BECOMES A HABIT',
      hero: 'Fewer clicks.\nMore confidence.',
      intro: 'Learn shortcuts by doing: study, practise and revisit the tricky ones.',
      base: 'Essential shortcuts',
      baseNote: 'Word and browser · Windows',
      custom: 'AI shortcut set',
      aiNote: 'AI can make mistakes. Check shortcuts against the program’s documentation.',
      size: 'Tasks per session',
      screen: 'On screen',
      physical: 'Keyboard',
      inputMode: 'Input mode',
      screenHelp: 'Select Ctrl, Shift if needed, then the letter or symbol.',
      physicalHelp: 'Use shortcuts while the practice area is focused. Use on-screen keys for browser commands.',
      configure: 'Settings',
      practice: 'Practice',
      results: 'Results',
      cancel: 'Cancel',
      hint: 'Hint',
      skip: 'Skip',
      next: 'Next',
      finish: 'See results',
      correct: 'Correct! Shortcut completed.',
      wrong: 'Not quite. Try again.',
      ready: 'Choose the shortcut on the keyboard below.',
      focus: 'Click here and press the shortcut',
      pause: 'Pause',
      resume: 'Resume',
      paused: 'Practice paused',
      pauseHelp: 'Your task and progress remain in this session.',
      solved: 'Solved',
      first: 'First try',
      mistakes: 'Mistakes',
      remaining: 'Remaining',
      retry: 'Repeat tricky ones',
      all: 'New session',
      review: 'Shortcut review',
      learned: 'Unassisted',
      assisted: 'Hint / mistake',
      skipped: 'Skipped',
      saved: 'Result saved to your profile',
      saving: 'Saving result…',
      saveError: 'Could not save the result.',
      saveAgain: 'Retry saving',
      guest: 'Sign in to save your results.',
      keys: 'shortcuts',
      loaded: 'Set ready',
      search: 'Find an action or shortcut',
      nothing: 'No matches',
      timedOut: 'The request took too long. Please try again.',
      control: 'Ctrl',
      newSet: 'Choose another set',
      doneNote: 'See what you have learned, then repeat the tricky shortcuts.',
      step: 'Step',
      windows: 'Practice shortcuts for Windows',
      source: 'Word documentation',
      blocked: 'Your browser may intercept this shortcut. Use the on-screen keys.',
      readySet: 'Ready-made set',
      session: 'PRACTICE',
      accountChanged: 'Account changed. Start a new session.',
      layout: 'QWERTY keys are recognised by their physical position.',
      retryNote: 'Repeat shortcuts with hints, mistakes or skips.'
    },
    uz: {
      eyebrow: 'ОДАТГА АЙЛАНАДИГАН МАШҚ',
      hero: 'Камроқ босиш.\nКўпроқ ишонч.',
      intro: 'Комбинацияларни амал орқали ўрганинг: ўқинг, синаб кўринг ва қийинларини такрорланг.',
      base: 'Асосий комбинациялар',
      baseNote: 'Word ва браузер · Windows',
      custom: 'ИИ билан тўплам',
      aiNote: 'ИИ хато қилиши мумкин. Дастурнинг расмий қўлланмасини текширинг.',
      size: 'Бир машқдаги топшириқлар',
      screen: 'Экранда',
      physical: 'Клавиатура',
      inputMode: 'Киритиш усули',
      screenHelp: 'Ctrl, керак бўлса Shift, сўнг ҳарф ёки белгини босинг.',
      physicalHelp: 'Машқ майдони фокусда бўлганда комбинацияни босинг. Браузер буйруқлари учун экран тугмаларидан фойдаланинг.',
      configure: 'Созламалар',
      practice: 'Амалиёт',
      results: 'Натижа',
      cancel: 'Бекор қилиш',
      hint: 'Ёрдам',
      skip: 'Ўтказиш',
      next: 'Кейингиси',
      finish: 'Натижалар',
      correct: 'Тўғри! Комбинация бажарилди.',
      wrong: 'Мос келмади. Яна уриниб кўринг.',
      ready: 'Қуйидаги клавиатурада комбинацияни танланг.',
      focus: 'Бу ерни босиб, комбинацияни киритинг',
      pause: 'Танаффус',
      resume: 'Давом этиш',
      paused: 'Машқ тўхтатилди',
      pauseHelp: 'Ушбу сессиядаги топшириқ ва натижа сақланди.',
      solved: 'Бажарилди',
      first: 'Биринчи уринишда',
      mistakes: 'Хатолар',
      remaining: 'Қолди',
      retry: 'Қийинларини такрорлаш',
      all: 'Янги машқ',
      review: 'Комбинациялар таҳлили',
      learned: 'Ёрдамсиз',
      assisted: 'Ёрдам / хато',
      skipped: 'Ўтказилди',
      saved: 'Натижа профилга сақланди',
      saving: 'Натижа сақланмоқда…',
      saveError: 'Натижани сақлаб бўлмади.',
      saveAgain: 'Қайта сақлаш',
      guest: 'Натижаларни сақлаш учун аккаунтга киринг.',
      keys: 'комбинация',
      loaded: 'Тўплам тайёр',
      search: 'Амал ёки комбинацияни топиш',
      nothing: 'Ҳеч нарса топилмади',
      timedOut: 'Сўров жуда узоқ давом этди. Яна уриниб кўринг.',
      control: 'Ctrl',
      newSet: 'Бошқа тўпламни танлаш',
      doneNote: 'Нимани ўрганганингизни кўринг ва қийин комбинацияларни такрорланг.',
      step: 'Қадам',
      windows: 'Windows учун ўқув комбинациялари',
      source: 'Word қўлланмаси',
      blocked: 'Браузер бу комбинацияни ушлаб қолиши мумкин. Экран тугмаларидан фойдаланинг.',
      readySet: 'Тайёр тўплам',
      session: 'МАШҚ',
      accountChanged: 'Аккаунт ўзгарди. Янги машқни бошланг.',
      layout: 'QWERTY тугмалари жисмоний жойлашуви бўйича аниқланади.',
      retryNote: 'Ёрдам, хато ва ўтказилган комбинациялар такрорланади.'
    }
  };
  const ICONS = {
    bolt: <path d="m13 2-9 12h7l-1 8 10-12h-8z" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    repeat: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2" /></>,
    keys: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>
  };
  const Icon = ({
    name,
    size = 20
  }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[name] || ICONS.bolt}</svg>;
  const combo = hk => ['Ctrl', ...(hk.shift ? ['Shift'] : []), (hk.shift ? SHIFT_SYMBOL_MAP[hk.key] || hk.key : hk.key).toUpperCase()];
  const desc = (hk, lang) => hk.descKey ? HOTKEY_DESC_TRANSLATIONS[lang]?.[hk.descKey] || hk.descKey : hk.descriptions?.[lang] || hk.desc || '';
  const shuffle = arr => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const token = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const RESERVED = new Set(['w', 't', 'n', 'l', 'r', 'p', 's', 'o', 'h', 'f', 'e']);
  const keyFromEvent = e => /^Key[A-Z]$/.test(e.code) ? e.code.slice(3).toLowerCase() : /^Digit\d$/.test(e.code) ? e.code.slice(5) : {
    Period: '.',
    Comma: ',',
    BracketLeft: '[',
    BracketRight: ']',
    Semicolon: ';',
    Quote: "'",
    Slash: '/',
    Backslash: '\\',
    Minus: '-',
    Equal: '=',
    Backquote: '`'
  }[e.code] || e.key.toLowerCase();
  function validateSet(value) {
    if (!Array.isArray(value)) throw Error('Invalid set');
    const seen = new Set();
    const result = [];
    for (const hk of value.slice(0, 30)) {
      if (!hk || typeof hk.key !== 'string' || !/^[a-z0-9.,;\[\]\\/'`=\-]$/i.test(hk.key) || typeof hk.shift !== 'boolean') continue;
      const descriptions = hk.descriptions;
      if (!descriptions || !LANGS.every(l => typeof descriptions[l] === 'string' && descriptions[l].trim().length > 2 && descriptions[l].length <= 240)) continue;
      const key = hk.key.toLowerCase(),
        id = key + ':' + hk.shift;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({
        key,
        shift: hk.shift,
        descriptions: Object.fromEntries(LANGS.map(l => [l, descriptions[l].trim()]))
      });
    }
    if (result.length < 5) throw Error('Not enough shortcuts');
    return result.slice(0, 20);
  }
  function Combo({
    hk,
    hidden = false
  }) {
    const parts = combo(hk);
    return <span className="hx-combo">{parts.map((key, i) => <React.Fragment key={i}>{i > 0 && <span className="hx-plus">+</span>}<kbd className={i === parts.length - 1 ? 'hx-key-accent' : ''}>{hidden && i === parts.length - 1 ? '?' : key}</kbd></React.Fragment>)}</span>;
  }
  function freshSession(tasks) {
    return {
      id: token(),
      tasks,
      index: 0,
      records: tasks.map(() => ({
        errors: 0,
        hint: false,
        status: 'pending'
      })),
      feedback: '',
      paused: false
    };
  }
  function HotkeyTrainer({
    theme
  }) {
    const [lang, setLang] = useState('ru'),
      [phase, setPhase] = useState('setup'),
      [mode, setMode] = useState('screen'),
      [size, setSize] = useState(10),
      [setKind, setSetKind] = useState('base'),
      [topic, setTopic] = useState('Microsoft Excel'),
      [custom, setCustom] = useState(null),
      [generating, setGenerating] = useState(false),
      [error, setError] = useState(''),
      [session, setSession] = useState(null),
      [mods, setMods] = useState({
        ctrl: false,
        shift: false
      }),
      [query, setQuery] = useState(''),
      [pressed, setPressed] = useState('');
    const sref = useRef(null),
      abort = useRef(null),
      alive = useRef(true),
      focusRef = useRef(null),
      keyTimer = useRef(null),
      requestVersion = useRef(0);
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ru,
      u = EXTRA[lang] || EXTRA.ru;
    const active = setKind === 'custom' && custom ? custom.items : HOTKEYS_DB;
    useEffect(() => {
      let style = document.getElementById('hotkey-trainer-v4-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'hotkey-trainer-v4-styles';
        document.head.appendChild(style);
      }
      style.textContent = CSS;
      alive.current = true;
      return () => {
        alive.current = false;
        abort.current?.abort();
        clearTimeout(keyTimer.current);
      };
    }, []);
    const commit = next => {
      sref.current = next;
      setSession(next);
    };
    useEffect(() => {
      if (phase === 'practice' && !session?.paused) focusRef.current?.focus({
        preventScroll: true
      });
    }, [phase, session?.index, session?.paused, mode]);
    useEffect(() => {
      const pause = () => {
        const s = sref.current;
        if (phase === 'practice' && s && !s.paused) commit({
          ...s,
          paused: true
        });
      };
      const visibility = () => {
        if (document.hidden) pause();
      };
      window.addEventListener('blur', pause);
      document.addEventListener('visibilitychange', visibility);
      return () => {
        window.removeEventListener('blur', pause);
        document.removeEventListener('visibilitychange', visibility);
      };
    }, [phase]);
    function begin(items, study = true) {
      const next = freshSession(items || shuffle(active).slice(0, Math.min(size, active.length)));
      commit(next);
      setMods({
        ctrl: false,
        shift: false
      });
      setQuery('');
      setPhase(study ? 'theory' : 'practice');
    }
    function mark(action) {
      const s = sref.current;
      if (!s || s.paused || phase !== 'practice') return;
      const rec = s.records[s.index];
      if (rec.status !== 'pending') return;
      const records = s.records.map((r, i) => i === s.index ? {
        ...r,
        ...action
      } : r);
      commit({
        ...s,
        records
      });
    }
    function attempt(key, ctrl, shift) {
      const s = sref.current;
      if (!s || s.paused || phase !== 'practice' || s.records[s.index].status !== 'pending') return;
      const hk = s.tasks[s.index];
      const ok = ctrl && shift === hk.shift && key === hk.key;
      const records = s.records.map((r, i) => i === s.index ? {
        ...r,
        status: ok ? 'solved' : 'pending',
        errors: r.errors + (ok ? 0 : 1)
      } : r);
      commit({
        ...s,
        records,
        feedback: ok ? 'correct' : 'wrong'
      });
      setMods({
        ctrl: false,
        shift: false
      });
      setPressed(key);
      clearTimeout(keyTimer.current);
      keyTimer.current = setTimeout(() => {
        if (alive.current) setPressed('');
      }, 250);
    }
    function advance(skip = false) {
      const s = sref.current;
      if (!s || s.paused) return;
      const rec = s.records[s.index];
      if (!skip && rec.status === 'pending') return;
      const records = skip ? s.records.map((r, i) => i === s.index ? {
        ...r,
        status: 'skipped'
      } : r) : s.records;
      const next = {
        ...s,
        records,
        index: s.index + 1,
        feedback: ''
      };
      commit(next);
      setMods({
        ctrl: false,
        shift: false
      });
      if (next.index >= next.tasks.length) {
        setPhase('result');
      }
    }
    function keyboard(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        const s = sref.current;
        if (s) commit({
          ...s,
          paused: !s.paused
        });
        return;
      }
      if (mode !== 'physical' || session?.paused || e.repeat || e.isComposing || e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (['Control', 'Shift', 'Alt', 'Meta', 'Tab', 'Enter', ' '].includes(e.key)) return;
      if (RESERVED.has(sref.current?.tasks[sref.current.index]?.key)) return;
      if (e.ctrlKey || e.metaKey) e.preventDefault();
      if (e.altKey || e.metaKey) return;
      attempt(keyFromEvent(e), e.ctrlKey, e.shiftKey);
    }
    async function generate() {
      if (generating || !topic.trim()) return;
      const name = topic.trim().slice(0, 100),
        version = ++requestVersion.current;
      const controller = new AbortController();
      abort.current?.abort();
      abort.current = controller;
      setGenerating(true);
      setError('');
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 30000);
      try {
        const prompt = `Return 10 genuine Windows Ctrl shortcuts for ${JSON.stringify(name)}. Do not invent shortcuts; return [] if uncertain. Only Ctrl, optionally Shift, and ONE physical US QWERTY letter, digit or punctuation key. No Alt, Meta, function keys or multi-step sequences. Return only a JSON array: [{"key":"c","shift":false,"descriptions":{"ru":"Копировать","en":"Copy","uz":"Нусха олиш"}}]. Descriptions must be accurate in Russian, English and Uzbek Cyrillic. Never repeat combinations. Do not include commands that require extra modifiers.`;
        const response = await fetch('https://gemini-proxy-lms.msleaderindustry.workers.dev', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
          signal: controller.signal
        });
        if (!response.ok) throw Error('HTTP');
        const data = await response.json();
        if (data.error) throw Error('API');
        let text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        const items = validateSet(JSON.parse(text));
        if (!alive.current || controller.signal.aborted || version !== requestVersion.current) return;
        setCustom({
          name,
          items
        });
        setSetKind('custom');
      } catch (e) {
        if (alive.current && version === requestVersion.current && (!controller.signal.aborted || timedOut)) setError(timedOut ? u.timedOut : t.errorFailed);
      } finally {
        clearTimeout(timeout);
        if (alive.current && version === requestVersion.current) {
          setGenerating(false);
          abort.current = null;
        }
      }
    }
    function cancel() {
      ++requestVersion.current;
      abort.current?.abort();
      abort.current = null;
      setGenerating(false);
      setError('');
    }
    const current = session?.tasks[session.index],
      record = session?.records[session.index];
    const solved = session?.records.filter(r => r.status === 'solved').length || 0;
    const first = session?.records.filter(r => r.status === 'solved' && !r.hint && !r.errors).length || 0;
    const mistakes = session?.records.reduce((n, r) => n + r.errors, 0) || 0;
    const difficult = session?.tasks.filter((_, i) => session.records[i].status !== 'solved' || session.records[i].hint || session.records[i].errors) || [];
    const title = setKind === 'custom' && custom ? custom.name : u.baseNote;
    const filtered = session?.tasks.filter(h => `${desc(h, lang)} ${combo(h).join(' ')}`.toLowerCase().includes(query.toLowerCase())) || [];
    const step = phase === 'setup' ? 0 : phase === 'theory' ? 1 : 2;
    const language = <div className="hx-languages" role="group" aria-label="Language">{LANGS.map(code => <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)} title={UI_TRANSLATIONS[code].langName}>{LANG_LABEL[code]}</button>)}</div>;
    const stats = <div className="hx-metrics">{[[u.solved, `${solved}/${session?.tasks.length || 0}`], [u.first, first], [u.mistakes, mistakes]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
    return <section className={`hx ${theme === 'light' ? 'hx-light' : theme === 'dark' ? 'hx-dark' : ''}`} aria-label={t.title}><div className="hx-shell"><header className="hx-header"><div className="hx-brand"><span className="hx-brand-icon"><Icon name="bolt" size={25} /></span><div><h2>{t.title}</h2><span>ULTIMATE LMS</span></div></div>{language}</header><div className="hx-steps" aria-label={u.step}>{[u.configure, t.theoryTitle, u.practice].map((text, i) => <span key={i} className={step === i ? 'active' : step > i ? 'done' : ''}><i>{step > i ? <Icon name="check" size={12} /> : String(i + 1).padStart(2, '0')}</i>{text}</span>)}</div>
 {phase === 'setup' && <div className="hx-enter"><div className="hx-hero"><div><span className="hx-eyebrow">{u.eyebrow}</span><h3>{u.hero.split('\n').map((line, i) => <span key={line} className={i ? 'hx-gradient' : ''}>{line}</span>)}</h3><p>{u.intro}</p></div><div className="hx-key-art" aria-hidden="true"><div className="hx-art-glow" /><kbd className="hx-art-ctrl">Ctrl</kbd><kbd className="hx-art-c">C</kbd><kbd className="hx-art-shift">Shift</kbd><span className="hx-art-note"><Icon name="spark" size={14} /> shortcut / skill</span></div></div>
 <div className="hx-setup-grid"><div className="hx-card"><div className="hx-card-heading"><span className="hx-small-icon"><Icon name="keys" /></span><div><h3>{u.readySet}</h3><p>{u.windows}</p></div></div><div className="hx-set-options"><button type="button" className={`hx-set ${setKind === 'base' ? 'selected' : ''}`} onClick={() => setSetKind('base')}><span><strong>{u.base}</strong><small>{u.baseNote}</small></span><span className="hx-badge">{HOTKEYS_DB.length}</span></button>{custom && <button type="button" className={`hx-set ${setKind === 'custom' ? 'selected' : ''}`} onClick={() => setSetKind('custom')}><span><strong>{custom.name}</strong><small>{u.custom}</small></span><span className="hx-badge">{custom.items.length}</span></button>}</div><div className="hx-field-label">{u.size}</div><div className="hx-segment" role="group" aria-label={u.size}>{[5, 10, 15].map(n => <button key={n} type="button" aria-pressed={size === n} onClick={() => setSize(n)}>{n}</button>)}</div><div className="hx-field-label">{u.inputMode}</div><div className="hx-segment" role="group" aria-label={u.inputMode}>{[['screen', u.screen], ['physical', u.physical]].map(([id, label]) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}</div><p className="hx-caption hx-mode-note">{mode === 'screen' ? u.screenHelp : u.physicalHelp}</p></div>
 <div className="hx-card hx-ai-card"><div className="hx-card-heading"><span className="hx-small-icon"><Icon name="spark" /></span><div><h3>{u.custom}</h3><p>{t.customPanelLabel}</p></div></div><form onSubmit={e => {
                e.preventDefault();
                generate();
              }}><label className="hx-field-label" htmlFor="hx-program">{t.inputPlaceholder}</label><input id="hx-program" maxLength={100} value={topic} onChange={e => setTopic(e.target.value)} disabled={generating} placeholder={t.inputPlaceholder} autoComplete="off" /><div className="hx-suggestions">{['Microsoft Excel', 'VS Code', 'Photoshop'].map(name => <button key={name} type="button" disabled={generating} onClick={() => setTopic(name)}>{name}</button>)}</div><button className="hx-button hx-secondary" disabled={generating || !topic.trim()} type="submit">{generating ? <span className="hx-spinner" /> : <Icon name="spark" size={17} />} {generating ? t.generating : t.generateButton}</button>{generating && <button type="button" className="hx-link" onClick={cancel}>{u.cancel}</button>}</form><p className="hx-caption hx-ai-note">{u.aiNote}</p>{custom && !generating && !error && <div className="hx-notice" role="status"><Icon name="check" size={17} />{u.loaded}: {custom.name}</div>}{error && <div className="hx-error" role="alert">{error}</div>}</div></div>
 <footer className="hx-setup-footer"><span className="hx-caption">{Math.min(size, active.length)} {u.keys} · {setKind === 'base' ? u.base : custom?.name}</span><button type="button" className="hx-button hx-primary" disabled={generating} onClick={() => begin()}>{t.startTraining}<Icon name="arrow" /></button></footer></div>}
 {phase === 'theory' && session && <div className="hx-enter"><div className="hx-title-row"><div><span className="hx-eyebrow">{t.theoryStep}</span><h3>{t.theoryTitle}</h3><p>{t.theoryDesc}</p></div><button className="hx-button" type="button" onClick={() => setPhase('setup')}>{u.configure}</button></div><div className="hx-theory-tools"><span className="hx-badge">{title} · {session.tasks.length}</span><label className="hx-search"><Icon name="search" size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={u.search} aria-label={u.search} /></label></div><div className="hx-theory-grid">{filtered.map((hk, i) => <article className="hx-theory-card" key={hk.key + hk.shift} style={{
              animationDelay: `${i * 35}ms`
            }}><span className="hx-card-index">{String(i + 1).padStart(2, '0')}</span><h4>{desc(hk, lang)}</h4><Combo hk={hk} />{hk.descKey && <small>{['newTab', 'newFile'].includes(hk.descKey) ? 'Windows / Browser' : 'Microsoft Word'}</small>}</article>)}</div>{!filtered.length && <p className="hx-caption">{u.nothing}</p>}<div className="hx-theory-footer">{setKind === 'base' && <a href="https://support.microsoft.com/en-us/accessibility/word/keyboard-shortcuts-in-word" target="_blank" rel="noopener noreferrer" className="hx-caption">{u.source} ↗</a>}<button className="hx-button hx-primary" type="button" onClick={() => setPhase('practice')}>{t.goToPractice}<Icon name="arrow" /></button></div></div>}
 {phase === 'practice' && current && <div className="hx-enter" onKeyDown={keyboard}><div className="hx-practice-top"><span className="hx-badge">{title}</span><span className="hx-counter">{session.index + 1}<small> / {session.tasks.length}</small></span><button className="hx-button" type="button" onClick={() => commit({
              ...sref.current,
              paused: !sref.current.paused
            })}><Icon name="pause" size={16} />{session.paused ? u.resume : u.pause}</button></div><div className="hx-progress" role="progressbar" aria-label={u.practice} aria-valuemin={0} aria-valuemax={session.tasks.length} aria-valuenow={session.index}><span style={{
              width: `${session.index / session.tasks.length * 100}%`
            }} /></div>
 {session.paused ? <div className="hx-pause"><span className="hx-result-icon"><Icon name="pause" size={35} /></span><h3>{u.paused}</h3><p>{u.pauseHelp}</p><button type="button" className="hx-button hx-primary" onClick={() => commit({
              ...sref.current,
              paused: false
            })}>{u.resume}<Icon name="arrow" /></button><button className="hx-link" type="button" onClick={() => setPhase('setup')}>{u.configure}</button></div> : <><div ref={focusRef} tabIndex={0} role="group" aria-label={u.focus} className={`hx-task ${session.feedback === 'correct' ? 'is-correct' : ''}`}><div key={session.index} className="hx-enter"><span className="hx-eyebrow">{u.session} / {String(session.index + 1).padStart(2, '0')}</span><h3>{desc(current, lang)}</h3><Combo hk={current} hidden={!record.hint && record.status === 'pending'} /></div><div key={`${session.index}:${record.errors}:${record.status}`} className={`hx-feedback ${session.feedback}`} role="status">{session.feedback === 'correct' ? <><Icon name="check" size={18} />{u.correct}</> : session.feedback === 'wrong' ? u.wrong : mode === 'screen' ? u.ready : u.focus}</div></div>
 <div className="hx-practice-actions"><button type="button" className="hx-link" disabled={record.status !== 'pending' || record.hint} onClick={() => mark({
                hint: true
              })}><Icon name="spark" size={17} />{u.hint}</button><span className="hx-caption">{mode === 'screen' ? u.screenHelp : RESERVED.has(current.key) ? u.blocked : u.layout}</span>{record.status === 'pending' ? <button type="button" className="hx-link" onClick={() => advance(true)}>{u.skip}<Icon name="arrow" size={16} /></button> : <button type="button" className="hx-button hx-primary" onClick={() => advance()}>{session.index === session.tasks.length - 1 ? u.finish : u.next}<Icon name="arrow" size={18} /></button>}</div>
 <div className="hx-keyboard" role="group" aria-label={u.screen}>{[['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='], ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"], ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']].map((row, ri) => <div className="hx-key-row" key={ri}>{row.map(key => <button type="button" key={key} className={`hx-screen-key ${pressed === key ? 'pressed' : ''} ${record.hint && current.key === key ? 'hinted' : ''}`} disabled={record.status !== 'pending'} onClick={() => attempt(key, mods.ctrl, mods.shift)}>{(mods.shift ? SHIFT_SYMBOL_MAP[key] || key : key).toUpperCase()}</button>)}</div>)}<div className="hx-key-row hx-modifiers"><button type="button" aria-pressed={mods.ctrl} disabled={record.status !== 'pending'} className="hx-screen-key" onClick={() => setMods(m => ({
                  ...m,
                  ctrl: !m.ctrl
                }))}>Ctrl</button><button type="button" aria-pressed={mods.shift} disabled={record.status !== 'pending'} className="hx-screen-key" onClick={() => setMods(m => ({
                  ...m,
                  shift: !m.shift
                }))}>Shift</button><span>{u.windows}</span></div></div>{stats}</>}
 </div>}
 {phase === 'result' && session && <div className="hx-result hx-enter"><div className="hx-result-hero"><span className="hx-result-icon"><Icon name="check" size={37} /></span><span className="hx-eyebrow">{u.results}</span><h3>{t.finishedTitle}</h3><p>{u.doneNote}</p></div>{stats}<div className="hx-result-actions">{difficult.length > 0 && <button className="hx-button hx-primary" type="button" onClick={() => begin(difficult, false)}><Icon name="repeat" size={18} />{u.retry} · {difficult.length}</button>}<button className="hx-button" type="button" onClick={() => begin(undefined, false)}>{u.all}<Icon name="arrow" size={18} /></button><button className="hx-link" type="button" onClick={() => setPhase('setup')}>{u.newSet}</button></div><div className="hx-review"><h4>{u.review}</h4>{session.tasks.map((hk, i) => {
              const r = session.records[i];
              return <div className="hx-review-row" key={i}><div><strong>{desc(hk, lang)}</strong><small>{r.status === 'skipped' ? u.skipped : r.hint || r.errors ? u.assisted : u.learned}</small></div><Combo hk={hk} /></div>;
            })}</div></div>}
 </div></section>;
  }

  Object.assign(window, {
    HotkeyTrainer
  });
})();
