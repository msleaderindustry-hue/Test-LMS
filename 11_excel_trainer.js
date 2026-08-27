/* =====================================================================
   ExcelTrainerLMS — redesigned
   -----------------------------------------------------------------------
   Что сохранено без изменений в поведении (по требованию ТЗ):
     - EXCEL_DATABASE (список функций по категориям)
     - fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", ...)
       и разбор data.candidates[0].content.parts[0].text -> JSON.parse
     - формат промпта для ИИ (структура JSON урока, правило "единая тема")
     - getTranslatedText(obj, lang) с fallback на ru
     - checkAnswer(): нормализация формулы (uppercase, пробелы, ; вместо ,
       кавычки, кириллица -> латиница) + сравнение с expected
     - Firebase-подписка на excelHintsEnabled через window.db/window.auth
     - activeFormulaName, currentLesson, inputValue, showSuccess,
       customSearch, isGenerating — те же по смыслу состояния

   Что изменено/добавлено (по пунктам ТЗ):
     - Компонент разбит на AppHeader / Sidebar / LessonContent и их
       под-компоненты вместо одного JSX-блока на 500 строк (п.5, п.71)
     - CSS design system через переменные, инжектится один раз (п.9,42,43)
     - Header: логотип, глобальный поиск функций, RU/EN/UZ, ThemeToggle (п.6-9)
     - Sidebar: AI Magic Card, категории-аккордеон, ProgressCard с XP/уровнем
       (п.10-17)
     - Theory/Syntax карточки, кнопка "Копировать" (п.19-21)
     - Excel-таблица с буквами колонок/номерами строк, hover, выбор ячейки
       (п.24-25, уже частично было — расширено)
     - Formula bar в стиле Excel с fx, подсветкой состояния (п.26-27)
     - ЧЕСТНАЯ система подсказок: 3 уровня подсказок + отдельная кнопка
       "Показать решение", вместо мгновенной вставки готового ответа (п.30-31)
     - НАСТОЯЩИЙ режим экзамена: отключает все подсказки, считает
       попытки/правильные ответы, таймер сессии (п.32-33)
     - XP/level/progress state, сохраняется в Firebase если доступно (п.16-17,58-59)
     - Toast-система вместо alert(), карточка ошибки с "Повторить" (п.40-41,69)
     - Валидация JSON от ИИ перед применением + повторный запрос при невалидном
       ответе (п.67-68)
     - Расширенный UI_DICT на 3 языках без дефолта на русский "заглушку" (п.64-65)
     - Keyboard shortcuts: Ctrl/Cmd+K — поиск, Esc — закрыть поиск/подсказку,
       Enter — проверить (п.48-49)
     - Адаптивность: sidebar превращается в drawer на мобильном (п.61-62)
   ===================================================================== */

const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ---------------------------------------------------------------------
// 1. ДАННЫЕ (не менять состав функций — только используется как есть)
// ---------------------------------------------------------------------
const EXCEL_DATABASE = {
    "Математические": ["СУММ", "СУММЕСЛИ", "СУММЕСЛИМН", "ОКРУГЛ", "ОКРУГЛВВЕРХ", "ОКРУГЛВНИЗ", "ПРОИЗВЕД", "ОСТАТ", "КОРЕНЬ", "СТЕПЕНЬ", "СЛЧИС", "ЦЕЛОЕ", "СУММПРОИЗВ", "АБС"],
    "Статистические": ["СРЗНАЧ", "СРЗНАЧЕСЛИ", "МАКС", "МИН", "СЧЁТ", "СЧЁТЕСЛИ", "СЧЁТЕСЛИМН", "СЧЁТЗ", "МЕДИАНА", "МОДА", "НАИБОЛЬШИЙ", "НАИМЕНЬШИЙ", "СЧИТАТЬПУСТОТЫ"],
    "Логические": ["ЕСЛИ", "И", "ИЛИ", "ЕСЛИОШИБКА", "НЕ", "ИСТИНА", "ЛОЖЬ", "ЕСЛИМН", "ЕПУСТО", "ЕЧИСЛО", "ЕТЕКСТ"],
    "Текстовые": ["СЦЕПИТЬ", "ЛЕВСИМВ", "ПРАВСИМВ", "ПСТР", "ДЛСТР", "НАЙТИ", "ПОИСК", "ЗАМЕНИТЬ", "ПОДСТАВИТЬ", "ПРОПИСН", "СТРОЧН", "СЖПРОБЕЛЫ", "ТЕКСТ"],
    "Дата и время": ["СЕГОДНЯ", "ТДАТА", "ДЕНЬ", "МЕСЯЦ", "ГОД", "ДАТА", "ДЕНЬНЕД", "ЧАС", "МИНУТЫ", "РАБДЕНЬ", "ДОЛЯГОДА", "НОМНЕДЕЛИ"],
    "Поиск и ссылки": ["ВПР", "ГПР", "ИНДЕКС", "ПОИСКПОЗ", "СМЕЩ", "ДВССЫЛ", "СТРОКА", "СТОЛБЕЦ", "ПРОСМОТР", "ВЫБОР", "ТРАНСП"]
};

const CATEGORY_ICON = {
    "Математические": "Σ",
    "Статистические": "📈",
    "Логические": "◆",
    "Текстовые": "Aa",
    "Дата и время": "🕒",
    "Поиск и ссылки": "🔎"
};

// ---------------------------------------------------------------------
// 2. UI_DICT — расширен, у всех трёх языков реальные переводы (п.64-65)
// ---------------------------------------------------------------------
const UI_DICT = {
    ru: {
        title: "Энциклопедия Excel", subtitle: "Умный тренажёр функций с ИИ",
        magic: "Магия ИИ", magicHint: "Найди любую функцию или задай вопрос ИИ",
        search: "Поиск функции (напр. ВПР)...", globalSearch: "Поиск по функциям...",
        genLoading: "Создаём урок...", genBtn: "Сгенерировать урок",
        aiTitle: "ИИ создаёт урок для", aiSub: "Готовим уникальную задачу и таблицу",
        theory: "Теория", defTitle: "Определение", enVersion: "Английская версия:",
        syntaxTitle: "Примеры синтаксиса", practice: "Практика",
        successMsg: "Формула написана верно!", resultMsg: "Результат вычисления:",
        btnAnother: "Другая задача", btnHint: "Подсказка", btnExam: "Экзамен",
        btnCheck: "Проверить", btnExamOff: "Завершить экзамен",
        copy: "Копировать", copied: "Скопировано",
        easy: "Легко", medium: "Средне", hard: "Сложно",
        xp: "XP", level: "Уровень", progress: "Прогресс",
        hint: "Подсказка", hintLevel: "Подсказка", showSolution: "Показать решение",
        nextTask: "Следующая задача", nextFunction: "Следующая функция",
        correct: "Верно", incorrect: "Проверьте формулу ещё раз",
        tryAgain: "Повторить", loading: "Загрузка...",
        error: "Не удалось создать урок", retry: "Повторить",
        exam: "Экзамен", examActive: "Режим экзамена",
        examScore: "Правильно", examAttempts: "Попыток", examLocked: "В режиме экзамена подсказки отключены",
        time: "Время", question: "Вопрос", of: "из",
        cellSelected: "Выбрана ячейка", searchNoResults: "Ничего не найдено",
        searchAiCreate: "Функция не найдена в базе — создать урок с помощью ИИ",
        completed: "Задание выполнено", repeatTheory: "Повторить теорию",
        yourStats: "Мой прогресс", learned: "Изучено функций", accuracy: "Правильных ответов",
        streak: "Серия дней"
    },
    en: {
        title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
        magic: "AI Magic", magicHint: "Find any function or ask the AI",
        search: "Search function (e.g. VLOOKUP)...", globalSearch: "Search functions...",
        genLoading: "Creating lesson...", genBtn: "Generate lesson",
        aiTitle: "AI is creating a lesson for", aiSub: "Preparing a unique task and table",
        theory: "Theory", defTitle: "Definition", enVersion: "English version:",
        syntaxTitle: "Syntax examples", practice: "Practice",
        successMsg: "Formula is correct!", resultMsg: "Calculation result:",
        btnAnother: "Another task", btnHint: "Hint", btnExam: "Exam",
        btnCheck: "Check", btnExamOff: "End exam",
        copy: "Copy", copied: "Copied",
        easy: "Easy", medium: "Medium", hard: "Hard",
        xp: "XP", level: "Level", progress: "Progress",
        hint: "Hint", hintLevel: "Hint", showSolution: "Show solution",
        nextTask: "Next task", nextFunction: "Next function",
        correct: "Correct", incorrect: "Check your formula again",
        tryAgain: "Try again", loading: "Loading...",
        error: "Couldn't create the lesson", retry: "Retry",
        exam: "Exam", examActive: "Exam mode",
        examScore: "Correct", examAttempts: "Attempts", examLocked: "Hints are disabled in exam mode",
        time: "Time", question: "Question", of: "of",
        cellSelected: "Selected cell", searchNoResults: "No results",
        searchAiCreate: "Function not in the database — create a lesson with AI",
        completed: "Task completed", repeatTheory: "Review theory",
        yourStats: "My progress", learned: "Functions learned", accuracy: "Accuracy",
        streak: "Day streak"
    },
    uz: {
        title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
        magic: "ИИ Сеҳри", magicHint: "Исталган функцияни топинг ёки ИИдан сўранг",
        search: "Функцияни қидириш (мас. ВПР)...", globalSearch: "Функциялар бўйича қидириш...",
        genLoading: "Дарс яратилмоқда...", genBtn: "Дарсни яратиш",
        aiTitle: "ИИ дарс яратмоқда:", aiSub: "Ноёб вазифа ва жадвал тайёрланмоқда",
        theory: "Назария", defTitle: "Таъриф", enVersion: "Инглизча версияси:",
        syntaxTitle: "Синтаксис мисоллари", practice: "Амалиёт",
        successMsg: "Формула тўғри ёзилган!", resultMsg: "Ҳисоблаш натижаси:",
        btnAnother: "Бошқа вазифа", btnHint: "Ёрдам", btnExam: "Имтиҳон",
        btnCheck: "Текшириш", btnExamOff: "Имтиҳонни тугатиш",
        copy: "Нусха олиш", copied: "Нусха олинди",
        easy: "Осон", medium: "Ўртача", hard: "Қийин",
        xp: "XP", level: "Даража", progress: "Жараён",
        hint: "Ёрдам", hintLevel: "Ёрдам", showSolution: "Ечимни кўрсатиш",
        nextTask: "Кейинги вазифа", nextFunction: "Кейинги функция",
        correct: "Тўғри", incorrect: "Формулани қайта текширинг",
        tryAgain: "Қайта уриниш", loading: "Юкланмоқда...",
        error: "Дарсни яратиб бўлмади", retry: "Қайта уриниш",
        exam: "Имтиҳон", examActive: "Имтиҳон режими",
        examScore: "Тўғри", examAttempts: "Уринишлар", examLocked: "Имтиҳон режимида ёрдам ўчирилган",
        time: "Вақт", question: "Савол", of: "дан",
        cellSelected: "Танланган катак", searchNoResults: "Ҳеч нарса топилмади",
        searchAiCreate: "Функция базада йўқ — ИИ ёрдамида дарс яратинг",
        completed: "Вазифа бажарилди", repeatTheory: "Назарияни такрорлаш",
        yourStats: "Менинг жараёним", learned: "Ўрганилган функциялар", accuracy: "Тўғри жавоблар",
        streak: "Кетма-кет кунлар"
    }
};

const DIFFICULTY_XP = { easy: 100, medium: 150, hard: 220 };

// ---------------------------------------------------------------------
// 3. Дизайн-система (п.9, 42-45) — инжектится один раз в <head>
// ---------------------------------------------------------------------
const DESIGN_SYSTEM_CSS = `
:root[data-elms-theme="dark"]{
  --elms-bg-main:#050816;
  --elms-bg-panel:#0d1328;
  --elms-bg-card:#111936;
  --elms-bg-input:#0a0f22;
  --elms-accent-purple:#8b5cf6;
  --elms-accent-blue:#3b82f6;
  --elms-accent-cyan:#22d3ee;
  --elms-accent-green:#22e68a;
  --elms-accent-red:#ef4444;
  --elms-text-main:#f8fafc;
  --elms-text-sec:#94a3b8;
  --elms-border:rgba(255,255,255,.08);
  --elms-shadow:0 8px 30px rgba(0,0,0,.35);
}
:root[data-elms-theme="light"]{
  --elms-bg-main:#f4f6fb;
  --elms-bg-panel:#ffffff;
  --elms-bg-card:#f8fafc;
  --elms-bg-input:#ffffff;
  --elms-accent-purple:#7c3aed;
  --elms-accent-blue:#2563eb;
  --elms-accent-cyan:#0891b2;
  --elms-accent-green:#059669;
  --elms-accent-red:#dc2626;
  --elms-text-main:#0f172a;
  --elms-text-sec:#64748b;
  --elms-border:rgba(15,23,42,.08);
  --elms-shadow:0 8px 30px rgba(15,23,42,.08);
}
.elms-shell{background:var(--elms-bg-main);border-radius:24px;padding:24px;width:100%;max-width:1280px;margin:0 auto;font-family:'Inter',system-ui,sans-serif;color:var(--elms-text-main);}
.elms-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--elms-border);padding-bottom:18px;margin-bottom:20px;}
.elms-logo-wrap{display:flex;align-items:center;gap:14px;}
.elms-logo{width:50px;height:50px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:24px;background:linear-gradient(135deg,var(--elms-accent-purple),var(--elms-accent-cyan));box-shadow:0 4px 18px rgba(139,92,246,.35);}
.elms-title{margin:0;font-size:24px;font-weight:900;letter-spacing:-.4px;}
.elms-subtitle{font-size:12.5px;color:var(--elms-text-sec);font-weight:600;margin-top:2px;}
.elms-global-search{flex:1 1 260px;max-width:420px;position:relative;}
.elms-global-search input{width:100%;padding:11px 44px 11px 40px;border-radius:12px;border:1px solid var(--elms-border);background:var(--elms-bg-input);color:var(--elms-text-main);font-size:13.5px;outline:none;transition:border-color .2s,box-shadow .2s;}
.elms-global-search input:focus{border-color:var(--elms-accent-cyan);box-shadow:0 0 0 3px rgba(34,211,238,.15);}
.elms-global-search .icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);opacity:.6;font-size:14px;}
.elms-global-search .kbd{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:10.5px;color:var(--elms-text-sec);border:1px solid var(--elms-border);padding:2px 6px;border-radius:6px;}
.elms-global-search-results{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--elms-bg-panel);border:1px solid var(--elms-border);border-radius:14px;box-shadow:var(--elms-shadow);z-index:40;max-height:280px;overflow-y:auto;padding:6px;}
.elms-global-search-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;}
.elms-global-search-item:hover{background:var(--elms-bg-card);}
.elms-lang-switch{display:flex;gap:4px;background:rgba(0,0,0,.15);padding:5px;border-radius:14px;border:1px solid var(--elms-border);}
.elms-lang-btn{padding:7px 14px;border-radius:10px;border:none;background:transparent;color:var(--elms-text-sec);font-weight:800;font-size:12.5px;cursor:pointer;transition:all .2s;}
.elms-lang-btn.active{background:linear-gradient(135deg,var(--elms-accent-purple),var(--elms-accent-blue));color:#fff;box-shadow:0 4px 14px rgba(139,92,246,.4);}
.elms-theme-toggle{width:38px;height:38px;border-radius:12px;border:1px solid var(--elms-border);background:var(--elms-bg-card);color:var(--elms-text-main);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;}
.elms-layout{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;}
.elms-sidebar{flex:1 1 300px;max-width:340px;display:flex;flex-direction:column;gap:16px;max-height:760px;overflow-y:auto;padding-right:6px;}
.elms-main{flex:3 1 520px;display:flex;flex-direction:column;gap:18px;min-width:0;}
.elms-card{background:var(--elms-bg-panel);border:1px solid var(--elms-border);border-radius:20px;padding:20px;box-shadow:var(--elms-shadow);}
.elms-ai-card{background:linear-gradient(160deg,rgba(139,92,246,.14),rgba(34,211,238,.08));border:1px solid rgba(139,92,246,.3);border-radius:20px;padding:20px;position:relative;overflow:hidden;}
.elms-ai-card .glow{position:absolute;right:-30px;top:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(139,92,246,.35),transparent 70%);}
.elms-eyebrow{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--elms-text-main);margin-bottom:6px;}
.elms-eyebrow-sub{font-size:12px;color:var(--elms-text-sec);margin-bottom:14px;}
.elms-input{width:100%;padding:11px 14px;border-radius:12px;border:1px solid var(--elms-border);background:var(--elms-bg-input);color:var(--elms-text-main);font-size:13.5px;outline:none;margin-bottom:12px;transition:border-color .2s;}
.elms-input:focus{border-color:var(--elms-accent-cyan);}
.elms-gen-btn{width:100%;height:44px;border-radius:12px;border:none;font-weight:800;font-size:13px;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--elms-accent-purple),var(--elms-accent-blue));box-shadow:0 6px 18px rgba(139,92,246,.35);display:flex;align-items:center;justify-content:center;gap:8px;}
.elms-gen-btn:disabled{opacity:.6;cursor:wait;}
.elms-accordion-head{display:flex;align-items:center;justify-content:space-between;padding:10px 4px;cursor:pointer;user-select:none;}
.elms-accordion-title{font-size:11.5px;font-weight:800;color:var(--elms-text-sec);text-transform:uppercase;letter-spacing:.8px;display:flex;align-items:center;gap:8px;}
.elms-accordion-chevron{transition:transform .2s;color:var(--elms-text-sec);}
.elms-accordion-chevron.open{transform:rotate(180deg);}
.elms-fn-grid{display:flex;flex-wrap:wrap;gap:8px;padding:4px 4px 10px;}
.elms-fn-btn{padding:8px 14px;border-radius:20px;border:1px solid var(--elms-border);background:var(--elms-bg-card);color:var(--elms-text-main);font-weight:600;font-size:12.5px;cursor:pointer;transition:transform .15s,border-color .15s;}
.elms-fn-btn:hover{transform:translateY(-2px);border-color:var(--elms-accent-cyan);}
.elms-fn-btn.active{background:linear-gradient(135deg,var(--elms-accent-purple),var(--elms-accent-blue));border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(139,92,246,.4);}
.elms-fn-btn:disabled{opacity:.5;cursor:wait;}
.elms-progress-card{background:linear-gradient(160deg,rgba(34,230,138,.14),rgba(59,130,246,.08));border:1px solid rgba(34,230,138,.3);border-radius:20px;padding:20px;}
.elms-progress-bar-track{width:100%;height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:10px;}
.elms-progress-bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,var(--elms-accent-green),var(--elms-accent-cyan));}
.elms-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;}
.elms-badge-easy{background:rgba(34,230,138,.14);color:var(--elms-accent-green);}
.elms-badge-medium{background:rgba(251,191,36,.14);color:#fbbf24;}
.elms-badge-hard{background:rgba(239,68,68,.14);color:var(--elms-accent-red);}
.elms-badge-theory{background:rgba(139,92,246,.14);color:var(--elms-accent-purple);}
.elms-badge-xp{background:rgba(34,211,238,.14);color:var(--elms-accent-cyan);}
.elms-def-box{background:var(--elms-bg-card);padding:16px;border-radius:14px;border-left:3px solid var(--elms-accent-purple);margin-bottom:14px;line-height:1.6;font-size:14.5px;}
.elms-code-box{background:#0a0f22;padding:16px;border-radius:14px;border:1px solid var(--elms-border);position:relative;}
.elms-code-box code{color:var(--elms-accent-cyan);font-family:'Fira Code',monospace;font-size:14px;white-space:pre-wrap;display:block;line-height:1.7;}
.elms-copy-btn{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.06);border:1px solid var(--elms-border);color:var(--elms-text-sec);border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;}
.elms-table-wrap{overflow-x:auto;border-radius:14px;border:1px solid var(--elms-border);background:#fff;}
.elms-table{width:100%;border-collapse:collapse;text-align:center;font-size:14px;}
.elms-table th,.elms-table td{border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:9px 10px;color:#1e293b;}
.elms-table thead th{background:#f1f5f9;color:#334155;font-weight:800;border-bottom:2px solid var(--elms-accent-green);}
.elms-table .row-head{background:#f1f5f9;font-weight:800;color:#64748b;}
.elms-table td.selected{background:rgba(34,211,238,.18)!important;outline:2px solid var(--elms-accent-cyan);outline-offset:-2px;}
.elms-table tbody tr:hover td{background:#f8fafc;}
.elms-formula-bar{position:relative;margin-bottom:16px;}
.elms-formula-bar .fx{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-weight:900;font-style:italic;font-size:17px;color:var(--elms-accent-green);}
.elms-formula-bar input{width:100%;padding:16px 16px 16px 48px;border-radius:14px;border:2px solid var(--elms-border);background:var(--elms-bg-input);color:var(--elms-text-main);font-size:17px;font-weight:700;font-family:'Fira Code',monospace;outline:none;transition:border-color .2s,box-shadow .2s;}
.elms-formula-bar input.state-focus{border-color:var(--elms-accent-cyan);box-shadow:0 0 0 3px rgba(34,211,238,.15);}
.elms-formula-bar input.state-correct{border-color:var(--elms-accent-green);}
.elms-formula-bar input.state-error{border-color:var(--elms-accent-red);}
.elms-hint-status{font-size:12.5px;font-weight:700;margin-top:8px;display:flex;align-items:center;gap:6px;}
.elms-hint-status.err{color:var(--elms-accent-red);}
.elms-hint-status.ok{color:var(--elms-accent-green);}
.elms-hint-panel{background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.3);border-radius:14px;padding:14px 16px;margin-bottom:14px;font-size:13.5px;line-height:1.5;}
.elms-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px;padding-top:18px;border-top:1px solid var(--elms-border);}
.elms-btn{flex:1 1 140px;height:46px;border-radius:12px;font-weight:800;font-size:12.5px;text-transform:uppercase;letter-spacing:.3px;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:6px;}
.elms-btn:disabled{opacity:.5;cursor:not-allowed;}
.elms-btn-outline{background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.35);color:var(--elms-accent-cyan);}
.elms-btn-muted{background:var(--elms-bg-card);border:1px solid var(--elms-border);color:var(--elms-text-main);}
.elms-btn-primary{background:linear-gradient(135deg,var(--elms-accent-green),#16a34a);color:#fff;box-shadow:0 6px 16px rgba(34,230,138,.3);}
.elms-btn-exam{background:rgba(139,92,246,.14);border:1px solid rgba(139,92,246,.4);color:var(--elms-accent-purple);}
.elms-btn-exam.active{background:linear-gradient(135deg,var(--elms-accent-purple),#6d28d9);color:#fff;}
.elms-success-card{background:rgba(34,230,138,.1);border:2px solid var(--elms-accent-green);padding:18px 20px;border-radius:16px;display:flex;justify-content:space-between;align-items:center;gap:14px;}
.elms-error-card{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.35);border-radius:18px;padding:22px;text-align:center;}
.elms-skeleton{height:14px;border-radius:8px;background:linear-gradient(90deg,var(--elms-bg-card) 25%,var(--elms-border) 50%,var(--elms-bg-card) 75%);background-size:200% 100%;animation:elms-shimmer 1.4s infinite;}
@keyframes elms-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.elms-toast-wrap{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;z-index:200;}
.elms-toast{background:var(--elms-bg-panel);border:1px solid var(--elms-border);color:var(--elms-text-main);padding:12px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:var(--elms-shadow);}
.elms-toast.ok{border-color:rgba(34,230,138,.4);}
.elms-toast.err{border-color:rgba(239,68,68,.4);}
.elms-exam-strip{display:flex;gap:14px;align-items:center;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);border-radius:12px;padding:10px 16px;margin-bottom:16px;font-size:12.5px;font-weight:700;flex-wrap:wrap;}
.elms-drawer-toggle{display:none;}
@media (max-width: 900px){
  .elms-layout{flex-direction:column;}
  .elms-sidebar{max-width:100%;max-height:none;}
  .elms-drawer-toggle{display:flex;align-items:center;gap:8px;background:var(--elms-bg-card);border:1px solid var(--elms-border);color:var(--elms-text-main);padding:10px 14px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;margin-bottom:6px;}
  .elms-sidebar.collapsed{display:none;}
}
`;

let elmsStyleInjected = false;
function DesignSystemStyles() {
    useEffect(() => {
        if (elmsStyleInjected) return;
        const tag = document.createElement("style");
        tag.setAttribute("data-elms-design-system", "true");
        tag.innerHTML = DESIGN_SYSTEM_CSS;
        document.head.appendChild(tag);
        elmsStyleInjected = true;
    }, []);
    return null;
}

// ---------------------------------------------------------------------
// 4. Утилиты (сохранена логика checkAnswer, вынесена в чистые функции)
// ---------------------------------------------------------------------
function normalizeFormula(f) {
    let str = String(f).trim().toUpperCase()
        .replace(/\s/g, "")
        .replace(/,/g, ";")
        .replace(/["'«»""]/g, "");
    const ruToEn = { 'А':'A','В':'B','С':'C','Е':'E','Н':'H','К':'K','М':'M','О':'O','Р':'P','Т':'T','Х':'X','У':'Y' };
    return str.replace(/[АВСЕНКМОРТХУ]/g, m => ruToEn[m]);
}

function isFormulaCorrect(userInput, expectedList) {
    if (!expectedList || !expectedList.length) return false;
    const userForm = normalizeFormula(userInput);
    return expectedList.some(exp => normalizeFormula(exp) === userForm);
}

function getTranslatedText(obj, currentLang) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[currentLang] || obj.ru || "";
}

function getColumnLetter(colIndex) { return String.fromCharCode(65 + colIndex); }

function validateLesson(lesson) {
    if (!lesson || typeof lesson !== "object") return false;
    if (!lesson.name || !lesson.enName || !lesson.syntax) return false;
    if (!lesson.def || !lesson.taskDesc) return false;
    if (!Array.isArray(lesson.table) || lesson.table.length < 2) return false;
    if (!Array.isArray(lesson.expected) || lesson.expected.length === 0) return false;
    if (lesson.result === undefined || lesson.result === null || lesson.result === "") return false;
    return true;
}

function difficultyLabel(diff, t) {
    if (diff === "hard") return t.hard;
    if (diff === "medium") return t.medium;
    return t.easy;
}

// ---------------------------------------------------------------------
// 5. Toast система (п.41) — заменяет alert()
// ---------------------------------------------------------------------
function useToasts() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((message, kind = "ok") => {
        const id = Math.random().toString(36).slice(2);
        setToasts(t => [...t, { id, message, kind }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
    }, []);
    return { toasts, push };
}

function ToastStack({ toasts }) {
    return (
        <div className="elms-toast-wrap">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        className={`elms-toast ${t.kind === "err" ? "err" : "ok"}`}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                    >
                        {t.kind === "err" ? "⚠ " : "✓ "}{t.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------
// 6. Header
// ---------------------------------------------------------------------
function GlobalSearch({ t, onPick, searchRef }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const allFunctions = Object.entries(EXCEL_DATABASE).flatMap(([cat, fns]) =>
        fns.map(f => ({ name: f, category: cat }))
    );
    const matches = query.trim()
        ? allFunctions.filter(f => f.name.toUpperCase().includes(query.trim().toUpperCase())).slice(0, 8)
        : [];

    return (
        <div className="elms-global-search" onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); e.target.blur(); } }}>
            <span className="icon">🔍</span>
            <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder={t.globalSearch}
            />
            <span className="kbd">Ctrl K</span>
            {open && query.trim() && (
                <div className="elms-global-search-results">
                    {matches.length === 0 && (
                        <div style={{ padding: "10px", fontSize: "13px", color: "var(--elms-text-sec)" }}>
                            {t.searchNoResults}
                        </div>
                    )}
                    {matches.map(m => (
                        <div key={m.name} className="elms-global-search-item"
                             onMouseDown={() => { onPick(m.name); setQuery(""); setOpen(false); }}>
                            <span>{CATEGORY_ICON[m.category] || "•"}</span>
                            <span>{m.name}</span>
                            <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--elms-text-sec)", fontWeight: 500 }}>{m.category}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function LanguageSwitcher({ lang, setLang }) {
    return (
        <div className="elms-lang-switch">
            {["ru", "en", "uz"].map(code => (
                <button key={code}
                        className={`elms-lang-btn ${lang === code ? "active" : ""}`}
                        onClick={() => setLang(code)}>
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function ThemeToggle({ theme, setTheme }) {
    return (
        <button className="elms-theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Theme">
            {theme === "dark" ? "☾" : "☀"}
        </button>
    );
}

function AppHeader({ t, lang, setLang, theme, setTheme, onSearchPick, searchRef }) {
    return (
        <header className="elms-header">
            <div className="elms-logo-wrap">
                <div className="elms-logo">📊</div>
                <div>
                    <h2 className="elms-title">{t.title}</h2>
                    <div className="elms-subtitle">{t.subtitle}</div>
                </div>
            </div>
            <GlobalSearch t={t} onPick={onSearchPick} searchRef={searchRef} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <LanguageSwitcher lang={lang} setLang={setLang} />
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
        </header>
    );
}

// ---------------------------------------------------------------------
// 7. Sidebar
// ---------------------------------------------------------------------
function AIMagicCard({ t, customSearch, setCustomSearch, onGenerate, isGenerating }) {
    return (
        <div className="elms-ai-card">
            <div className="glow" />
            <div className="elms-eyebrow">✨ {t.magic}</div>
            <div className="elms-eyebrow-sub">{t.magicHint}</div>
            <input
                className="elms-input"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onGenerate()}
                placeholder={t.search}
            />
            <button className="elms-gen-btn" onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? "◌" : "✨"} {isGenerating ? t.genLoading : t.genBtn}
            </button>
        </div>
    );
}

function CategoryAccordion({ category, isOpen, onToggle, activeFormulaName, isGenerating, onPick }) {
    return (
        <div>
            <div className="elms-accordion-head" onClick={onToggle}>
                <span className="elms-accordion-title">
                    <span>{CATEGORY_ICON[category] || "•"}</span>{category}
                </span>
                <span className={`elms-accordion-chevron ${isOpen ? "open" : ""}`}>˅</span>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="elms-fn-grid">
                            {EXCEL_DATABASE[category].map(fName => (
                                <button
                                    key={fName}
                                    className={`elms-fn-btn ${activeFormulaName === fName ? "active" : ""}`}
                                    disabled={isGenerating}
                                    onClick={() => onPick(category, fName)}
                                >
                                    {fName}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProgressCard({ t, progress }) {
    const xpForNextLevel = progress.level * 200;
    const pct = Math.min(100, Math.round((progress.xp % 200) / 2));
    return (
        <div className="elms-progress-card">
            <div className="elms-eyebrow">💎 {t.yourStats}</div>
            <div style={{ fontSize: "13px", color: "var(--elms-text-sec)", marginBottom: "14px" }}>
                {t.learned}: {progress.completedFunctions.length} · {t.streak}: {progress.streak}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 800 }}>
                <span>{t.level} {progress.level}</span>
                <span>{progress.xp % 200} / 200 {t.xp}</span>
            </div>
            <div className="elms-progress-bar-track">
                <div className="elms-progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function Sidebar({
    t, categories, openCategories, toggleCategory,
    activeCategory, activeFormulaName, isGenerating,
    onPick, customSearch, setCustomSearch, onGenerate, progress
}) {
    return (
        <div className="elms-sidebar">
            <AIMagicCard t={t} customSearch={customSearch} setCustomSearch={setCustomSearch}
                         onGenerate={onGenerate} isGenerating={isGenerating} />
            {categories.map(category => (
                <CategoryAccordion
                    key={category}
                    category={category}
                    isOpen={openCategories.includes(category)}
                    onToggle={() => toggleCategory(category)}
                    activeFormulaName={activeFormulaName}
                    isGenerating={isGenerating}
                    onPick={onPick}
                />
            ))}
            <ProgressCard t={t} progress={progress} />
        </div>
    );
}

// ---------------------------------------------------------------------
// 8. Loading / Error states
// ---------------------------------------------------------------------
function LoadingSkeleton({ t, activeFormulaName }) {
    return (
        <div className="elms-card" style={{ minHeight: "480px" }}>
            <div className="elms-eyebrow">✨ {t.aiTitle} {activeFormulaName}…</div>
            <div style={{ fontSize: "12.5px", color: "var(--elms-text-sec)", marginBottom: "20px" }}>{t.aiSub}</div>
            <div className="elms-skeleton" style={{ width: "40%", marginBottom: "14px" }} />
            <div className="elms-skeleton" style={{ width: "70%", marginBottom: "24px" }} />
            <div className="elms-skeleton" style={{ width: "100%", height: "70px", marginBottom: "18px" }} />
            <div className="elms-skeleton" style={{ width: "100%", height: "160px" }} />
        </div>
    );
}

function ErrorCard({ t, onRetry }) {
    return (
        <div className="elms-error-card">
            <div style={{ fontSize: "26px", marginBottom: "8px" }}>⚠</div>
            <div style={{ fontWeight: 800, marginBottom: "6px" }}>{t.error}</div>
            <div style={{ fontSize: "13px", color: "var(--elms-text-sec)", marginBottom: "16px" }}>{t.tryAgain}</div>
            <button className="elms-btn elms-btn-primary" style={{ flex: "0 0 auto", padding: "0 24px" }} onClick={onRetry}>
                {t.retry}
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------
// 9. Theory / Syntax
// ---------------------------------------------------------------------
function TheoryCard({ t, lesson, lang }) {
    const diff = lesson.difficulty || "easy";
    const xp = lesson.xp || DIFFICULTY_XP[diff] || 100;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard?.writeText(lesson.syntax || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <div className="elms-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                <div>
                    <h1 style={{ margin: "0 0 4px 0", fontSize: "32px", fontWeight: 900 }}>{lesson.name}</h1>
                    <div style={{ color: "var(--elms-text-sec)", fontSize: "14px", fontWeight: 600 }}>
                        {t.enVersion} <span style={{ color: "var(--elms-accent-cyan)" }}>{lesson.enName}</span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className={`elms-badge elms-badge-${diff}`}>{difficultyLabel(diff, t)}</span>
                    <span className="elms-badge elms-badge-xp">★ {xp} {t.xp}</span>
                    <span className="elms-badge elms-badge-theory">📘 {t.theory}</span>
                </div>
            </div>

            <div className="elms-def-box">
                <div style={{ fontSize: "11px", color: "var(--elms-text-sec)", textTransform: "uppercase", fontWeight: 800, marginBottom: "6px" }}>
                    {t.defTitle}
                </div>
                {getTranslatedText(lesson.def, lang)}
            </div>

            <div className="elms-code-box">
                <div style={{ fontSize: "11px", color: "var(--elms-text-sec)", textTransform: "uppercase", fontWeight: 800, marginBottom: "10px" }}>
                    {t.syntaxTitle}
                </div>
                <button className="elms-copy-btn" onClick={handleCopy}>
                    {copied ? `✓ ${t.copied}` : `📋 ${t.copy}`}
                </button>
                <code>{lesson.syntax}</code>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------
// 10. Excel-таблица (интерактивные ячейки, п.24-25)
// ---------------------------------------------------------------------
function ExcelTable({ table, t }) {
    const [selected, setSelected] = useState(null);
    return (
        <div>
            <div className="elms-table-wrap">
                <table className="elms-table">
                    <thead>
                        <tr>
                            <th style={{ width: "40px" }}></th>
                            {table[0].map((_, colIdx) => (
                                <th key={colIdx}>{getColumnLetter(colIdx)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="row-head">{rowIdx + 1}</td>
                                {row.map((cell, colIdx) => {
                                    const id = `${getColumnLetter(colIdx)}${rowIdx + 1}`;
                                    return (
                                        <td key={colIdx}
                                            className={selected === id ? "selected" : ""}
                                            onClick={() => setSelected(id)}
                                            style={{ cursor: "pointer" }}>
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selected && (
                <div style={{ fontSize: "11.5px", color: "var(--elms-text-sec)", marginTop: "6px" }}>
                    {t.cellSelected}: <b>{selected}</b>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------
// 11. Formula bar
// ---------------------------------------------------------------------
function FormulaBar({ t, inputValue, setInputValue, disabled, status, onEnter }) {
    const [focused, setFocused] = useState(false);
    const stateClass = status === "correct" ? "state-correct" : status === "error" ? "state-error" : (focused ? "state-focus" : "");
    return (
        <div className="elms-formula-bar">
            <span className="fx">fx</span>
            <input
                type="text"
                value={inputValue}
                disabled={disabled}
                className={stateClass}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setInputValue(e.target.value === "" ? "=" : e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && !disabled && onEnter()}
            />
            {status === "error" && <div className="elms-hint-status err">⚠ {t.incorrect}</div>}
            {status === "correct" && <div className="elms-hint-status ok">✓ {t.correct}</div>}
        </div>
    );
}

// ---------------------------------------------------------------------
// 12. Честная система подсказок (п.30-31)
//     hintLevel: 0 = скрыто, 1..3 = уровни, 4 = показать решение
// ---------------------------------------------------------------------
function HintPanel({ t, lesson, hintLevel, lang }) {
    if (hintLevel === 0) return null;
    const hints = lesson.hint;
    let text = "";
    if (hintLevel === 1) {
        text = (hints && getTranslatedText(hints.level1 || hints, lang)) ||
            (lang === "en" ? "Think about which function fits this task." :
             lang === "uz" ? "Бу вазифага қайси функция мос келишини ўйланг." :
             "Подумайте, какая функция подходит для этой задачи.");
    } else if (hintLevel === 2) {
        text = (hints && getTranslatedText(hints.level2, lang)) ||
            `${lang === "en" ? "Function to use:" : lang === "uz" ? "Қайси функциядан фойдаланинг:" : "Используйте функцию:"} ${lesson.name} (${lesson.enName})`;
    } else if (hintLevel === 3) {
        const firstExpected = lesson.expected && lesson.expected[0];
        const startsWith = firstExpected ? String(firstExpected).slice(0, Math.max(3, Math.ceil(String(firstExpected).length * 0.35))) : "=" + lesson.name + "(";
        text = (hints && getTranslatedText(hints.level3, lang)) ||
            `${lang === "en" ? "Start of the formula:" : lang === "uz" ? "Формула бошланиши:" : "Начало формулы:"} ${startsWith}…`;
    } else if (hintLevel >= 4) {
        const solution = lesson.expected && lesson.expected[0];
        text = `${t.showSolution}: ${solution}`;
    }
    return (
        <div className="elms-hint-panel">
            💡 {t.hintLevel} {Math.min(hintLevel, 4)}/3{hintLevel >= 4 ? "+" : ""} — {text}
        </div>
    );
}

// ---------------------------------------------------------------------
// 13. Success card
// ---------------------------------------------------------------------
function SuccessCard({ t, lesson, xpAwarded }) {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="elms-success-card"
            style={{ overflow: "hidden", marginBottom: "16px" }}
        >
            <div>
                <h4 style={{ margin: "0 0 4px 0", color: "var(--elms-accent-green)", fontSize: "17px", fontWeight: 800 }}>
                    ✓ {t.successMsg}
                </h4>
                <span style={{ fontSize: "14px" }}>{t.resultMsg} <b>{lesson.result}</b></span>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="elms-badge elms-badge-xp"
                style={{ fontSize: "13px" }}
            >
                +{xpAwarded} XP ✨
            </motion.div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------
// 14. Exam status strip (п.32-33 — настоящий режим экзамена)
// ---------------------------------------------------------------------
function ExamStrip({ t, exam }) {
    if (!exam.active) return null;
    const mm = String(Math.floor(exam.elapsed / 60)).padStart(2, "0");
    const ss = String(exam.elapsed % 60).padStart(2, "0");
    return (
        <div className="elms-exam-strip">
            <span>🔒 {t.examActive}</span>
            <span>{t.examScore}: {exam.correctCount}</span>
            <span>{t.examAttempts}: {exam.attempts}</span>
            <span>⏱ {mm}:{ss}</span>
        </div>
    );
}

// ---------------------------------------------------------------------
// 15. Practice card (собирает таблицу, formula bar, hints, actions)
// ---------------------------------------------------------------------
function PracticeCard({
    t, lang, lesson, inputValue, setInputValue,
    showSuccess, formulaStatus, onCheck,
    hintLevel, onHintClick, onShowSolution,
    examMode, onToggleExam, exam,
    onAnother, onNextFunction, xpAwarded
}) {
    return (
        <div className="elms-card" style={{ border: "2px dashed var(--elms-border)" }}>
            <div className="elms-eyebrow" style={{ color: "var(--elms-accent-green)" }}>
                🎯 {t.practice}
            </div>

            <ExamStrip t={t} exam={exam} />

            <p style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 600, lineHeight: 1.5 }}>
                {getTranslatedText(lesson.taskDesc, lang)}
            </p>

            <div style={{ marginBottom: "22px" }}>
                <ExcelTable table={lesson.table} t={t} />
            </div>

            <FormulaBar
                t={t}
                inputValue={inputValue}
                setInputValue={setInputValue}
                disabled={showSuccess}
                status={formulaStatus}
                onEnter={onCheck}
            />

            {!examMode && <HintPanel t={t} lesson={lesson} hintLevel={hintLevel} lang={lang} />}

            <AnimatePresence>
                {showSuccess && <SuccessCard t={t} lesson={lesson} xpAwarded={xpAwarded} />}
            </AnimatePresence>

            <div className="elms-actions">
                {!showSuccess ? (
                    <>
                        <button className="elms-btn elms-btn-outline" onClick={onAnother}>
                            🔄 {t.btnAnother}
                        </button>
                        {!examMode && (
                            <button className="elms-btn elms-btn-muted" onClick={onHintClick}>
                                💡 {t.btnHint}{hintLevel > 0 ? ` ${Math.min(hintLevel, 3)}/3` : ""}
                            </button>
                        )}
                        {!examMode && hintLevel >= 3 && (
                            <button className="elms-btn elms-btn-muted" onClick={onShowSolution}>
                                🗝 {t.showSolution}
                            </button>
                        )}
                        <button className={`elms-btn elms-btn-exam ${examMode ? "active" : ""}`} onClick={onToggleExam}>
                            🔒 {examMode ? t.btnExamOff : t.btnExam}
                        </button>
                        <button className="elms-btn elms-btn-primary" onClick={onCheck}>
                            ✓ {t.btnCheck}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="elms-btn elms-btn-muted" style={{ cursor: "default", flex: "1 1 100%", opacity: 1 }}>
                            ✓ {t.completed}
                        </div>
                        <button className="elms-btn elms-btn-outline" onClick={onAnother}>
                            {t.nextTask}
                        </button>
                        <button className="elms-btn elms-btn-primary" onClick={onNextFunction}>
                            {t.nextFunction}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------
// 16. Главный компонент
// ---------------------------------------------------------------------
const ExcelTrainerLMS = ({ onBack }) => {
    const categories = Object.keys(EXCEL_DATABASE);

    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
    const [openCategories, setOpenCategories] = useState([categories[0]]);

    const [currentLesson, setCurrentLesson] = useState(null);
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formulaStatus, setFormulaStatus] = useState("idle"); // idle | error | correct
    const [customSearch, setCustomSearch] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [genError, setGenError] = useState(false);

    const [lang, setLang] = useState("ru");
    const [theme, setTheme] = useState("dark");
    const [hintsEnabled, setHintsEnabled] = useState(true); // из Firebase — как и раньше
    const [hintLevel, setHintLevel] = useState(0);
    const [examMode, setExamMode] = useState(false);
    const [exam, setExam] = useState({ active: false, attempts: 0, correctCount: 0, elapsed: 0 });

    const [userProgress, setUserProgress] = useState({
        xp: 0, level: 1, completedFunctions: [], streak: 0
    });

    const t = UI_DICT[lang];
    const searchRef = useRef(null);
    const { toasts, push: pushToast } = useToasts();

    useEffect(() => {
        document.documentElement.setAttribute("data-elms-theme", theme);
    }, [theme]);

    // --- Firebase: excelHintsEnabled + прогресс (логика подписки сохранена) ---
    useEffect(() => {
        const uid = window.auth?.currentUser?.uid;
        if (!uid || !window.db) return;

        const unsub = window.db.collection("users").doc(uid).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setHintsEnabled(data.excelHintsEnabled !== false);
                if (typeof data.excelXp === "number") {
                    setUserProgress(p => ({
                        ...p,
                        xp: data.excelXp,
                        level: Math.floor(data.excelXp / 200) + 1,
                        completedFunctions: data.excelCompletedFunctions || p.completedFunctions,
                        streak: data.excelStreak || p.streak
                    }));
                }
            }
        });
        return () => unsub();
    }, []);

    // --- exam timer ---
    useEffect(() => {
        if (!exam.active) return;
        const id = setInterval(() => setExam(e => ({ ...e, elapsed: e.elapsed + 1 })), 1000);
        return () => clearInterval(id);
    }, [exam.active]);

    // --- keyboard shortcuts (п.48-49) ---
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    useEffect(() => {
        generateAIFormula(activeFormulaName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFormulaName]);

    const toggleCategory = (category) => {
        setOpenCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    // -------------------------------------------------------------
    // Генерация урока ИИ — тот же backend-flow, что и раньше,
    // + расширенный JSON-контракт и повторный запрос при невалидном
    // ответе (п.3-4, 66-69)
    // -------------------------------------------------------------
    const generateAIFormula = async (formulaName, attempt = 0) => {
        setInputValue("=");
        setShowSuccess(false);
        setFormulaStatus("idle");
        setHintLevel(0);
        setIsGenerating(true);
        setGenError(false);
        setCurrentLesson(null);

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
          "xp": число (100 для easy, 150 для medium, 220 для hard),
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
             "level1": { "ru": "Мягкая подсказка без названия функции.", "en": "...", "uz": "..." },
             "level2": { "ru": "Подсказка с названием функции, но без диапазона.", "en": "...", "uz": "..." },
             "level3": { "ru": "Начало формулы, без полного решения.", "en": "...", "uz": "..." }
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
           - Поля "def", "table", "taskDesc" и "hint" должны быть ИМЕННО на эту тему!
           Категорически запрещено смешивать темы.
        6. ЗАПРЕТ ШАБЛОНОВ: Не используй слова "Иванов", "Петров", "Товар", "Цена", "Категория", если они не подходят к выбранной теме.
        7. Задача должна иметь однозначный ответ.
        8. Все значения таблицы должны математически соответствовать expected и result — перед возвратом JSON самостоятельно проверь вычисление.
        9. Не создавай невозможные или противоречивые данные.
        10. Поле "hint" НЕ должно содержать полную готовую формулу — только направляющие подсказки.
        11. "difficulty" должен соответствовать реальной сложности функции, "xp" должен соответствовать "difficulty".`;

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
                throw new Error("invalid-lesson-schema");
            }

            setCurrentLesson(parsedFormula);
        } catch (error) {
            console.error("Ошибка генерации урока:", error);
            if (attempt < 1) {
                // одна автоматическая попытка повторить при невалидном/сбойном ответе
                return generateAIFormula(formulaName, attempt + 1);
            }
            setGenError(true);
            pushToast(`${t.error}: ${formulaName}`, "err");
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

    const handleSidebarPick = (category, fName) => {
        setActiveCategory(category);
        setActiveFormulaName(fName);
    };

    const handleGlobalSearchPick = (fName) => {
        const category = categories.find(c => EXCEL_DATABASE[c].includes(fName));
        if (category && !openCategories.includes(category)) {
            setOpenCategories(prev => [...prev, category]);
        }
        setActiveCategory(category || "Поиск ИИ");
        setActiveFormulaName(fName);
    };

    // --- XP / прогресс, синхронизация с Firebase (best-effort) ---
    const awardXp = (amount, fnName) => {
        setUserProgress(prev => {
            const nextXp = prev.xp + amount;
            const nextLevel = Math.floor(nextXp / 200) + 1;
            const nextCompleted = prev.completedFunctions.includes(fnName)
                ? prev.completedFunctions
                : [...prev.completedFunctions, fnName];
            const next = { ...prev, xp: nextXp, level: nextLevel, completedFunctions: nextCompleted };

            const uid = window.auth?.currentUser?.uid;
            if (uid && window.db) {
                window.db.collection("users").doc(uid).set({
                    excelXp: nextXp,
                    excelCompletedFunctions: nextCompleted
                }, { merge: true }).catch(() => {});
            }
            return next;
        });
    };

    const checkAnswer = () => {
        if (!currentLesson) return;
        const isCorrect = isFormulaCorrect(inputValue, currentLesson.expected);

        setExam(e => e.active ? { ...e, attempts: e.attempts + 1, correctCount: e.correctCount + (isCorrect ? 1 : 0) } : e);

        if (isCorrect) {
            setShowSuccess(true);
            setFormulaStatus("correct");
            const xp = currentLesson.xp || DIFFICULTY_XP[currentLesson.difficulty] || 100;
            awardXp(xp, activeFormulaName);
            pushToast(t.correct, "ok");
        } else {
            setFormulaStatus("error");
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    // --- честные подсказки: каждый клик открывает следующий уровень ---
    const handleHintClick = () => {
        if (!hintsEnabled) {
            pushToast(t.examLocked, "err");
            return;
        }
        setHintLevel(l => Math.min(l + 1, 3));
    };
    const handleShowSolution = () => setHintLevel(4);

    // --- настоящий экзамен: блокирует подсказки, считает попытки ---
    const toggleExamMode = () => {
        if (!examMode) {
            setExamMode(true);
            setExam({ active: true, attempts: 0, correctCount: 0, elapsed: 0 });
            setHintLevel(0);
        } else {
            setExamMode(false);
            setExam(e => ({ ...e, active: false }));
        }
    };

    const handleAnotherTask = () => generateAIFormula(activeFormulaName);

    const handleNextFunction = () => {
        const idx = EXCEL_DATABASE[activeCategory]?.indexOf(activeFormulaName);
        const list = EXCEL_DATABASE[activeCategory] || [];
        if (idx > -1 && idx < list.length - 1) {
            setActiveFormulaName(list[idx + 1]);
        } else {
            handleAnotherTask();
        }
    };

    const xpAwarded = currentLesson ? (currentLesson.xp || DIFFICULTY_XP[currentLesson.difficulty] || 100) : 0;

    return (
        <motion.div
            className="elms-shell glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5 }}
        >
            <DesignSystemStyles />
            <ToastStack toasts={toasts} />

            <AppHeader
                t={t} lang={lang} setLang={setLang}
                theme={theme} setTheme={setTheme}
                onSearchPick={handleGlobalSearchPick}
                searchRef={searchRef}
            />

            <div className="elms-layout">
                <Sidebar
                    t={t}
                    categories={categories}
                    openCategories={openCategories}
                    toggleCategory={toggleCategory}
                    activeCategory={activeCategory}
                    activeFormulaName={activeFormulaName}
                    isGenerating={isGenerating}
                    onPick={handleSidebarPick}
                    customSearch={customSearch}
                    setCustomSearch={setCustomSearch}
                    onGenerate={handleCustomSearch}
                    progress={userProgress}
                />

                <div className="elms-main">
                    {isGenerating || !currentLesson ? (
                        genError
                            ? <ErrorCard t={t} onRetry={() => generateAIFormula(activeFormulaName)} />
                            : <LoadingSkeleton t={t} activeFormulaName={activeFormulaName} />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
                        >
                            <TheoryCard t={t} lesson={currentLesson} lang={lang} />
                            <PracticeCard
                                t={t} lang={lang} lesson={currentLesson}
                                inputValue={inputValue} setInputValue={setInputValue}
                                showSuccess={showSuccess} formulaStatus={formulaStatus}
                                onCheck={checkAnswer}
                                hintLevel={hintLevel} onHintClick={handleHintClick} onShowSolution={handleShowSolution}
                                examMode={examMode} onToggleExam={toggleExamMode} exam={exam}
                                onAnother={handleAnotherTask} onNextFunction={handleNextFunction}
                                xpAwarded={xpAwarded}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
