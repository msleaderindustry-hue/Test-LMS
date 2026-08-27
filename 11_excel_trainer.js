const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =========================================================================
   1. ДАННЫЕ — база функций
   ========================================================================= */
const EXCEL_DATABASE = {
    "Математические": ["СУММ", "СУММЕСЛИ", "СУММЕСЛИМН", "ОКРУГЛ", "ОКРУГЛВВЕРХ", "ОКРУГЛВНИЗ", "ПРОИЗВЕД", "ОСТАТ", "КОРЕНЬ", "СТЕПЕНЬ", "СЛЧИС", "ЦЕЛОЕ", "СУММПРОИЗВ", "АБС"],
    "Статистические": ["СРЗНАЧ", "СРЗНАЧЕСЛИ", "МАКС", "МИН", "СЧЁТ", "СЧЁТЕСЛИ", "СЧЁТЕСЛИМН", "СЧЁТЗ", "МЕДИАНА", "МОДА", "НАИБОЛЬШИЙ", "НАИМЕНЬШИЙ", "СЧИТАТЬПУСТОТЫ"],
    "Логические": ["ЕСЛИ", "И", "ИЛИ", "ЕСЛИОШИБКА", "НЕ", "ИСТИНА", "ЛОЖЬ", "ЕСЛИМН", "ЕПУСТО", "ЕЧИСЛО", "ЕТЕКСТ"],
    "Текстовые": ["СЦЕПИТЬ", "ЛЕВСИМВ", "ПРАВСИМВ", "ПСТР", "ДЛСТР", "НАЙТИ", "ПОИСК", "ЗАМЕНИТЬ", "ПОДСТАВИТЬ", "ПРОПИСН", "СТРОЧН", "СЖПРОБЕЛЫ", "ТЕКСТ"],
    "Дата и время": ["СЕГОДНЯ", "ТДАТА", "ДЕНЬ", "МЕСЯЦ", "ГОД", "ДАТА", "ДЕНЬНЕД", "ЧАС", "МИНУТЫ", "РАБДЕНЬ", "ДОЛЯГОДА", "НОМНЕДЕЛИ"],
    "Поиск и ссылки": ["ВПР", "ГПР", "ИНДЕКС", "ПОИСКПОЗ", "СМЕЩ", "ДВССЫЛ", "СТРОКА", "СТОЛБЕЦ", "ПРОСМОТР", "ВЫБОР", "ТРАНСП"]
};

// Иконки категорий для сайдбара
const CATEGORY_ICONS = {
    "Математические": "Σ",
    "Статистические": "📈",
    "Логические": "◆",
    "Текстовые": "Aa",
    "Дата и время": "🕐",
    "Поиск и ссылки": "🔎"
};

// Сложность функций
const DIFFICULTY_MAP = {
    СУММ:"easy", СУММЕСЛИ:"medium", СУММЕСЛИМН:"hard", ОКРУГЛ:"easy", ОКРУГЛВВЕРХ:"easy", ОКРУГЛВНИЗ:"easy",
    ПРОИЗВЕД:"easy", ОСТАТ:"easy", КОРЕНЬ:"easy", СТЕПЕНЬ:"easy", СЛЧИС:"easy", ЦЕЛОЕ:"easy", СУММПРОИЗВ:"hard", АБС:"easy",
    СРЗНАЧ:"easy", СРЗНАЧЕСЛИ:"medium", МАКС:"easy", МИН:"easy", СЧЁТ:"easy", СЧЁТЕСЛИ:"medium", СЧЁТЕСЛИМН:"hard",
    СЧЁТЗ:"easy", МЕДИАНА:"medium", МОДА:"medium", НАИБОЛЬШИЙ:"medium", НАИМЕНЬШИЙ:"medium", СЧИТАТЬПУСТОТЫ:"easy",
    ЕСЛИ:"easy", И:"easy", ИЛИ:"easy", ЕСЛИОШИБКА:"medium", НЕ:"easy", ИСТИНА:"easy", ЛОЖЬ:"easy", ЕСЛИМН:"medium",
    ЕПУСТО:"easy", ЕЧИСЛО:"easy", ЕТЕКСТ:"easy",
    СЦЕПИТЬ:"easy", ЛЕВСИМВ:"easy", ПРАВСИМВ:"easy", ПСТР:"medium", ДЛСТР:"easy", НАЙТИ:"medium", ПОИСК:"medium",
    ЗАМЕНИТЬ:"medium", ПОДСТАВИТЬ:"medium", ПРОПИСН:"easy", СТРОЧН:"easy", СЖПРОБЕЛЫ:"easy", ТЕКСТ:"medium",
    СЕГОДНЯ:"easy", ТДАТА:"easy", ДЕНЬ:"easy", МЕСЯЦ:"easy", ГОД:"easy", ДАТА:"easy", ДЕНЬНЕД:"medium", ЧАС:"easy",
    МИНУТЫ:"easy", РАБДЕНЬ:"medium", ДОЛЯГОДА:"hard", НОМНЕДЕЛИ:"medium",
    ВПР:"medium", ГПР:"medium", ИНДЕКС:"hard", ПОИСКПОЗ:"hard", СМЕЩ:"hard", ДВССЫЛ:"hard", СТРОКА:"easy",
    СТОЛБЕЦ:"easy", ПРОСМОТР:"hard", ВЫБОР:"medium", ТРАНСП:"medium"
};

const XP_BY_DIFFICULTY = { easy: 60, medium: 100, hard: 160 };

/* =========================================================================
   2. СЛОВАРЬ ПЕРЕВОДОВ ИНТЕРФЕЙСА
   ========================================================================= */
const UI_DICT = {
    ru: {
        title: "Энциклопедия Excel", subtitle: "Умный тренажер функций с ИИ",
        magic: "Магия ИИ", search: "Поиск функции (напр. ВПР)...",
        genLoading: "Создаем магию...", genBtn: "Сгенерировать урок",
        aiTitle: "Готовим материалы для", aiSub: "ИИ пишет уникальную задачу и таблицу",
        theory: "Теория", defTitle: "Определение", enVersion: "Английская версия:",
        syntaxTitle: "Примеры синтаксиса", practice: "Практика",
        successMsg: "Формула написана верно! 🎉", resultMsg: "Результат вычисления:",
        btnAnother: "🔄 Другая задача", btnHint: "👀 Подсказка", btnExam: "🔒 Экзамен", btnCheck: "Проверить",
        globalSearchPlaceholder: "Поиск по функциям...",
        copy: "Копировать", copied: "Скопировано",
        easy: "Легко", medium: "Средне", hard: "Сложно",
        xp: "XP", level: "Уровень",
        progressTitle: "Прокачай свои навыки", progressSub: "Открывай новые функции и становись мастером Excel",
        hintLevel1: "Что нужно найти?", hintLevel2: "Какую функцию использовать?", hintLevel3: "Начните формулу так:",
        showSolution: "Показать решение", hintOf: "Подсказка",
        nextTask: "Следующая задача", nextFunction: "Следующая функция", repeatTheory: "Повторить теорию",
        taskDone: "Задание выполнено", incorrectMsg: "Пока не верно, попробуйте ещё раз",
        loadingTitle: "ИИ создаёт урок", errorTitle: "Не удалось создать урок", errorSub: "Проверьте связь и попробуйте снова",
        retry: "Повторить", examOnLabel: "🔒 Экзамен", examOffLabel: "🔓 Обычный режим",
        attempts: "Попыток", formulaOk: "Формула правильная", formulaBad: "Проверьте формулу",
        notFoundInDb: "Функции нет в локальной базе.", createWithAI: "✨ Создать урок с помощью ИИ",
        toastLessonReady: "Урок создан", toastCopied: "Формула скопирована"
    },
    en: {
        title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
        magic: "AI Magic", search: "Search function (e.g. VLOOKUP)...",
        genLoading: "Creating magic...", genBtn: "Generate lesson",
        aiTitle: "Preparing materials for", aiSub: "AI is writing a unique task and table",
        theory: "Theory", defTitle: "Definition", enVersion: "English version:",
        syntaxTitle: "Syntax examples", practice: "Practice",
        successMsg: "Formula is correct! 🎉", resultMsg: "Calculation result:",
        btnAnother: "🔄 Another task", btnHint: "👀 Hint", btnExam: "🔒 Exam", btnCheck: "Check",
        globalSearchPlaceholder: "Search functions...",
        copy: "Copy", copied: "Copied",
        easy: "Easy", medium: "Medium", hard: "Hard",
        xp: "XP", level: "Level",
        progressTitle: "Level up your skills", progressSub: "Unlock new functions and become an Excel master",
        hintLevel1: "What do you need to find?", hintLevel2: "Which function should you use?", hintLevel3: "Start the formula like this:",
        showSolution: "Show solution", hintOf: "Hint",
        nextTask: "Next task", nextFunction: "Next function", repeatTheory: "Review theory",
        taskDone: "Task completed", incorrectMsg: "Not quite, try again",
        loadingTitle: "AI is building the lesson", errorTitle: "Couldn't generate the lesson", errorSub: "Check your connection and try again",
        retry: "Retry", examOnLabel: "🔒 Exam", examOffLabel: "🔓 Normal mode",
        attempts: "Attempts", formulaOk: "Formula looks correct", formulaBad: "Check your formula",
        notFoundInDb: "This function isn't in the local database.", createWithAI: "✨ Generate lesson with AI",
        toastLessonReady: "Lesson ready", toastCopied: "Formula copied"
    },
    uz: {
        title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
        magic: "ИИ Сеҳри", search: "Функцияни қидириш (мас. ВПР)...",
        genLoading: "Сеҳр яратилмоқда...", genBtn: "Дарсни яратиш",
        aiTitle: "Материаллар тайёрланмоқда:", aiSub: "ИИ ноёб вазифа ва жадвал ёзмоқда",
        theory: "Назария", defTitle: "Таъриф", enVersion: "Инглизча версияси:",
        syntaxTitle: "Синтаксис мисоллари", practice: "Амалиёт",
        successMsg: "Формула тўғри ёзилган! 🎉", resultMsg: "Ҳисоблаш натижаси:",
        btnAnother: "🔄 Бошқа вазифа", btnHint: "👀 Ёрдам", btnExam: "🔒 Имтиҳон", btnCheck: "Текшириш",
        globalSearchPlaceholder: "Функцияларни қидириш...",
        copy: "Нусха олиш", copied: "Нусха олинди",
        easy: "Осон", medium: "Ўртача", hard: "Мураккаб",
        xp: "XP", level: "Даража",
        progressTitle: "Кўникмаларингизни оширинг", progressSub: "Янги функцияларни очинг ва Excel устаси бўлинг",
        hintLevel1: "Нимани топиш керак?", hintLevel2: "Қайси функцияни ишлатиш керак?", hintLevel3: "Формулани шундай бошланг:",
        showSolution: "Ечимни кўрсатиш", hintOf: "Ёрдам",
        nextTask: "Кейинги вазифа", nextFunction: "Кейинги функция", repeatTheory: "Назарияни такрорлаш",
        taskDone: "Вазифа бажарилди", incorrectMsg: "Ҳали тўғри эмас, яна уриниб кўринг",
        loadingTitle: "ИИ дарсни яратмоқда", errorTitle: "Дарсни яратиб бўлмади", errorSub: "Алоқани текшириб, яна уриниб кўринг",
        retry: "Такрорлаш", examOnLabel: "🔒 Имтиҳон", examOffLabel: "🔓 Оддий режим",
        attempts: "Уринишлар", formulaOk: "Формула тўғри", formulaBad: "Формулани текширинг",
        notFoundInDb: "Функция локал базада йўқ.", createWithAI: "✨ ИИ билан дарс яратиш",
        toastLessonReady: "Дарс тайёр", toastCopied: "Формула нусха олинди"
    }
};

/* =========================================================================
   3. CSS — стили с поддержкой темной и светлой темы
   ========================================================================= */
const ET_STYLES = `
.et-shell{
  --bg-main: var(--bg-body, #050816);
  --bg-panel: var(--bg-panel, #0D1328);
  --bg-card: var(--bg-card, #111936);
  --bg-elevated: var(--bg-elevated, #151d3d);
  --accent-purple: #8b5cf6;
  --accent-blue: #3b82f6;
  --accent-cyan: #22d3ee;
  --accent-green: #22e68a;
  --accent-red: #ef4444;
  --text-main: var(--text-main, #f8fafc);
  --text-sec: var(--text-sec, #94a3b8);
  --border: var(--glass-border, rgba(255,255,255,.08));
  --radius-lg: 22px;
  --radius-md: 14px;
  --radius-sm: 10px;
  background: var(--bg-main);
  color: var(--text-main);
  border-radius: 24px;
  padding: 28px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  font-family: inherit;
  position: relative;
}

/* Светлая тема */
.et-shell.theme-light,
html.light .et-shell,
body.light .et-shell,
[data-theme='light'] .et-shell,
.light .et-shell {
  --bg-main: var(--bg-body, #f4f6fb);
  --bg-panel: var(--bg-panel, #ffffff);
  --bg-card: var(--bg-card, #f8fafc);
  --bg-elevated: var(--bg-elevated, #eef1fb);
  --text-main: var(--text-main, #0f172a);
  --text-sec: var(--text-sec, #64748b);
  --border: var(--glass-border, rgba(15,23,42,.08));
}

.et-header{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:18px;margin-bottom:22px;}
.et-header-left{display:flex;align-items:center;gap:14px;min-width:0;}
.et-logo{width:50px;height:50px;flex:none;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:24px;
  background:linear-gradient(135deg,var(--accent-cyan) 0%,var(--accent-green) 100%);box-shadow:0 6px 18px rgba(34,211,238,.25);}
.et-title{margin:0;font-size:22px;font-weight:900;letter-spacing:-.3px;color:var(--text-main);}
.et-subtitle{font-size:12.5px;color:var(--text-sec);font-weight:600;margin-top:2px;}
.et-header-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}

.et-gsearch{position:relative;width:240px;max-width:40vw;}
.et-gsearch input{width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-main);font-size:13px;outline:none;}
.et-gsearch input:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 3px rgba(34,211,238,.15);}
.et-gsearch-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--bg-elevated);border:1px solid var(--border);
  border-radius:12px;overflow:hidden;z-index:20;box-shadow:0 12px 30px rgba(0,0,0,.35);max-height:220px;overflow-y:auto;}
.et-gsearch-item{padding:9px 14px;font-size:13px;font-weight:600;color:var(--text-main);cursor:pointer;}
.et-gsearch-item:hover{background:rgba(139,92,246,.15);}

.et-langswitch{display:flex;gap:4px;background:rgba(0,0,0,.15);padding:5px;border-radius:14px;border:1px solid var(--border);}
.et-shell.theme-light .et-langswitch,
html.light .et-shell .et-langswitch,
body.light .et-shell .et-langswitch,
[data-theme='light'] .et-shell .et-langswitch {
  background:rgba(15,23,42,.05);
}
.et-lang-btn{padding:7px 13px;border-radius:10px;border:none;background:transparent;color:var(--text-sec);font-weight:800;font-size:12px;cursor:pointer;transition:.2s;}
.et-lang-btn.active{background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));color:#fff;box-shadow:0 4px 12px rgba(139,92,246,.4);}

.et-body{display:flex;gap:26px;align-items:flex-start;flex-wrap:wrap;}
.et-sidebar{flex:1 1 290px;max-width:320px;display:flex;flex-direction:column;gap:16px;max-height:720px;overflow-y:auto;padding-right:6px;}

.et-ai-card{background:var(--bg-panel);border:1px solid var(--border);padding:18px;border-radius:var(--radius-lg);position:relative;overflow:hidden;}
.et-ai-card::after{content:"";position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;
  background:radial-gradient(circle,rgba(139,92,246,.35),transparent 70%);pointer-events:none;}
.et-ai-title{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:13px;color:var(--text-main);}
.et-ai-input{width:100%;padding:11px 14px;border-radius:12px;border:1px solid var(--border);background:var(--bg-main);color:var(--text-main);margin-bottom:12px;font-size:13.5px;outline:none;}
.et-ai-input:focus{border-color:var(--accent-cyan);}

.et-cat{display:flex;flex-direction:column;gap:8px;background:var(--bg-panel);border:1px solid var(--border);border-radius:var(--radius-md);padding:6px;}
.et-cat-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;user-select:none;}
.et-cat-head-left{display:flex;align-items:center;gap:9px;font-size:11.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--text-sec);}
.et-cat-icon{font-size:13px;color:var(--accent-cyan);}
.et-cat-chevron{transition:transform .2s;color:var(--text-sec);font-size:11px;}
.et-cat-chevron.open{transform:rotate(180deg);}
.et-cat-body{display:flex;flex-wrap:wrap;gap:7px;padding:2px 10px 10px;}

.et-fn-btn{padding:7px 13px;border-radius:18px;border:1px solid var(--border);background:var(--bg-main);color:var(--text-main);
  font-weight:700;font-size:12.5px;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:6px;}
.et-fn-btn:hover{border-color:var(--accent-cyan);transform:translateY(-1px);}
.et-fn-btn.active{background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));color:#fff;border:none;box-shadow:0 4px 14px rgba(59,130,246,.4);}
.et-fn-dot{width:6px;height:6px;border-radius:50%;flex:none;}
.et-fn-dot.easy{background:var(--accent-green);}
.et-fn-dot.medium{background:#fbbf24;}
.et-fn-dot.hard{background:var(--accent-red);}
.et-fn-btn:disabled{opacity:.45;cursor:wait;}

.et-progress-card{background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(34,211,238,.10));border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;}
.et-progress-title{font-size:13px;font-weight:800;color:var(--text-main);margin-bottom:4px;display:flex;align-items:center;gap:7px;}
.et-progress-sub{font-size:11.5px;color:var(--text-sec);margin-bottom:14px;line-height:1.4;}
.et-progress-row{display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--text-sec);margin-bottom:6px;}
.et-progress-bar-track{height:8px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;}
.et-shell.theme-light .et-progress-bar-track,
html.light .et-shell .et-progress-bar-track,
body.light .et-shell .et-progress-bar-track,
[data-theme='light'] .et-shell .et-progress-bar-track {
  background:rgba(15,23,42,.08);
}
.et-progress-bar-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,var(--accent-purple),var(--accent-cyan));transition:width .4s ease;}

.et-main{flex:3 1 520px;display:flex;flex-direction:column;gap:18px;min-width:0;}

.et-skeleton-card{background:var(--bg-panel);border:1px solid var(--border);border-radius:var(--radius-lg);padding:26px;min-height:480px;}
.et-skel-line{height:16px;border-radius:8px;margin-bottom:12px;background:linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 37%,var(--bg-card) 63%);
  background-size:400% 100%;animation:et-shimmer 1.4s ease infinite;}
@keyframes et-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}
.et-skel-title{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:800;color:var(--accent-cyan);text-transform:uppercase;letter-spacing:.5px;margin-bottom:20px;}

.et-error-card{background:var(--bg-panel);border:1px solid rgba(239,68,68,.35);border-radius:var(--radius-lg);padding:28px;text-align:center;min-height:300px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;}
.et-error-icon{font-size:34px;}
.et-error-title{font-size:17px;font-weight:800;color:var(--text-main);}
.et-error-sub{font-size:13px;color:var(--text-sec);}
.et-retry-btn{margin-top:8px;padding:10px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));
  color:#fff;font-weight:800;font-size:13px;cursor:pointer;}

.et-theory-card{background:var(--bg-panel);padding:28px;border-radius:var(--radius-lg);border:1px solid var(--border);}
.et-theory-top{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:18px;flex-wrap:wrap;}
.et-fn-name{margin:0 0 4px;font-size:32px;font-weight:900;color:var(--text-main);letter-spacing:-.5px;}
.et-fn-en{color:var(--text-sec);font-size:14px;font-weight:600;}
.et-fn-en b{color:var(--accent-green);font-weight:800;}
.et-badges{display:flex;gap:8px;flex-wrap:wrap;}
.et-badge{padding:7px 14px;border-radius:11px;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;}
.et-badge-theory{background:rgba(34,230,138,.12);color:var(--accent-green);}
.et-badge-diff-easy{background:rgba(34,230,138,.12);color:var(--accent-green);}
.et-badge-diff-medium{background:rgba(251,191,36,.14);color:#fbbf24;}
.et-badge-diff-hard{background:rgba(239,68,68,.14);color:#f87171;}
.et-badge-xp{background:rgba(139,92,246,.16);color:#c4b5fd;}

.et-def-box{background:var(--bg-card);padding:18px;border-radius:14px;border-left:4px solid var(--accent-green);margin-bottom:16px;}
.et-box-label{font-size:11px;color:var(--text-sec);text-transform:uppercase;font-weight:800;margin-bottom:7px;letter-spacing:.5px;}
.et-def-text{font-size:15px;color:var(--text-main);line-height:1.6;}

.et-syntax-box{background:#0a0f24;padding:18px;border-radius:14px;border:1px solid var(--border);position:relative;}
.et-shell.theme-light .et-syntax-box,
html.light .et-shell .et-syntax-box,
body.light .et-shell .et-syntax-box,
[data-theme='light'] .et-shell .et-syntax-box {
  background:#0f172a;
}
.et-syntax-code{font-size:14px;color:#38bdf8;font-family:'Fira Code',monospace;white-space:pre-wrap;display:block;line-height:1.6;padding-right:90px;}
.et-copy-btn{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#e2e8f0;
  padding:6px 11px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;}
.et-copy-btn:hover{border-color:var(--accent-cyan);}

.et-practice-card{background:var(--bg-card);padding:28px;border-radius:var(--radius-lg);border:2px dashed var(--border);}
.et-practice-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.et-practice-title{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--accent-green);text-transform:uppercase;font-weight:900;letter-spacing:1px;}
.et-task-text{margin:0 0 22px;color:var(--text-main);font-size:16.5px;font-weight:600;line-height:1.55;}

.et-table-wrap{overflow-x:auto;background:#fff;border-radius:12px;border:1px solid #cbd5e1;box-shadow:0 4px 6px rgba(0,0,0,.04);margin-bottom:26px;}
.et-table{width:100%;border-collapse:collapse;text-align:center;font-size:14.5px;font-family:sans-serif;}
.et-table thead tr{background:#f8fafc;border-bottom:3px solid var(--accent-green,#10b981);}
.et-table th{border-right:1px solid #e2e8f0;padding:11px 8px;font-weight:700;color:#334155;}
.et-table th.et-corner{width:42px;background:#f1f5f9;color:#94a3b8;}
.et-table td{border-right:1px solid #e2e8f0;padding:9px 8px;color:#1e293b;cursor:default;transition:background .12s;}
.et-table td.et-rownum{background:#f1f5f9;font-weight:700;color:#64748b;cursor:default;}
.et-table tr{border-bottom:1px solid #e2e8f0;}
.et-table td:not(.et-rownum):hover{background:#eef2ff;}
.et-table td.et-selected{background:#dbeafe !important;outline:2px solid #3b82f6;outline-offset:-2px;}

.et-formula-bar{position:relative;margin-bottom:8px;}
.et-formula-bar .fx{position:absolute;left:18px;top:50%;transform:translateY(-50%);font-weight:900;color:var(--accent-green);font-size:18px;font-style:italic;pointer-events:none;}
.et-formula-bar input{width:100%;padding:18px 18px 18px 52px;border-radius:15px;border:2px solid var(--border);background:var(--bg-panel);
  color:var(--text-main);font-size:18px;font-weight:700;outline:none;font-family:'Fira Code',monospace;transition:.2s;}
.et-formula-bar input:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 4px rgba(34,211,238,.12);}
.et-formula-bar.correct input{border-color:var(--accent-green);}
.et-formula-bar.wrong input{border-color:var(--accent-red);}
.et-formula-status{font-size:12.5px;font-weight:700;margin:8px 2px 4px;display:flex;align-items:center;gap:6px;}
.et-formula-status.ok{color:var(--accent-green);}
.et-formula-status.bad{color:#f87171;}

/* СТИЛИ ПОДСКАЗОК (ТЕМНАЯ И СВЕТЛАЯ ТЕМЫ) */
.et-hint-box{
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 14px;
  padding: 16px 18px;
  margin: 10px 0 20px;
  font-size: 14px;
  color: #fde68a;
  line-height: 1.6;
}
.et-hint-box code{
  background: rgba(0, 0, 0, 0.35);
  color: #fbbf24;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-weight: 700;
}
.et-hint-actions{display:flex;gap:12px;margin-top:10px;flex-wrap:wrap;}
.et-hint-link{
  background:none;border:none;color:#fbbf24;font-weight:800;font-size:13px;
  cursor:pointer;text-decoration:underline;padding:0;transition:opacity .15s;
}
.et-hint-link:hover{opacity:0.8;}

/* Подсказки в светлой теме — четкие, контрастные и легко читаемые */
.et-shell.theme-light .et-hint-box,
html.light .et-shell .et-hint-box,
body.light .et-shell .et-hint-box,
[data-theme='light'] .et-shell .et-hint-box,
.light .et-shell .et-hint-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.08);
}
.et-shell.theme-light .et-hint-box code,
html.light .et-shell .et-hint-box code,
body.light .et-shell .et-hint-box code,
[data-theme='light'] .et-shell .et-hint-box code,
.light .et-shell .et-hint-box code {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}
.et-shell.theme-light .et-hint-link,
html.light .et-shell .et-hint-link,
body.light .et-shell .et-hint-link,
[data-theme='light'] .et-shell .et-hint-link,
.light .et-shell .et-hint-link {
  color: #d97706;
}
.et-shell.theme-light .et-hint-link:hover,
html.light .et-shell .et-hint-link:hover,
body.light .et-shell .et-hint-link:hover,
[data-theme='light'] .et-shell .et-hint-link:hover,
.light .et-shell .et-hint-link:hover {
  color: #b45309;
}

.et-success-card{background:rgba(34,230,138,.08);border:2px solid var(--accent-green);padding:20px;border-radius:16px;display:flex;justify-content:space-between;align-items:center;gap:14px;overflow:hidden;flex-wrap:wrap;margin-bottom:8px;}
.et-success-title{margin:0 0 5px;color:var(--accent-green);font-size:18px;font-weight:800;}
.et-success-sub{color:#6ee7b7;font-size:14.5px;font-weight:600;}
.et-success-xp{font-weight:900;color:#c4b5fd;font-size:15px;}

.et-actions{display:flex;flex-wrap:wrap;gap:13px;margin-top:22px;padding-top:18px;border-top:1px solid var(--border);}
.et-action-btn{flex:1 1 150px;height:48px;border-radius:12px;border:1px solid transparent;font-weight:800;font-size:12.5px;
  text-transform:uppercase;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:center;gap:6px;}
.et-action-btn:disabled{opacity:.45;cursor:not-allowed;}
.et-action-secondary{background:rgba(56,189,248,.14);border-color:rgba(56,189,248,.35);color:#38bdf8;}
.et-action-warning{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.3);color:#fbbf24;}
.et-action-exam{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3);color:#f87171;}
.et-action-exam.on{background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;border-color:transparent;}
.et-action-primary{background:linear-gradient(135deg,var(--accent-green),#059669);color:#fff;box-shadow:0 4px 15px rgba(16,185,129,.3);}

.et-attempts{font-size:12px;color:var(--text-sec);font-weight:700;align-self:center;padding:0 6px;}

.et-toast-wrap{position:absolute;top:14px;right:14px;display:flex;flex-direction:column;gap:8px;z-index:50;pointer-events:none;}
.et-toast{background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-main);padding:10px 16px;border-radius:11px;
  font-size:13px;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,.3);}

@media (max-width:760px){
  .et-gsearch{display:none;}
  .et-sidebar{max-width:100%;max-height:none;}
}
`;

function useInjectStyles() {
    useEffect(() => {
        if (!document.getElementById("et-styles")) {
            const tag = document.createElement("style");
            tag.id = "et-styles";
            tag.textContent = ET_STYLES;
            document.head.appendChild(tag);
        }
    }, []);
}

/* =========================================================================
   4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ========================================================================= */
const getColumnLetter = (colIndex) => String.fromCharCode(65 + colIndex);

const getTranslatedText = (obj, currentLang) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[currentLang] || obj.ru || "";
};

function normalizeFormula(f) {
    let str = String(f).trim().toUpperCase()
        .replace(/\s+/g, "")
        .replace(/,/g, ";")
        .replace(/["'«»“”]/g, "")
        .replace(/;+$/g, "");

    const ruToEn = { 'А':'A','В':'B','С':'C','Е':'E','Н':'H','К':'K','М':'M','О':'O','Р':'P','Т':'T','Х':'X','У':'Y' };
    return str.replace(/[АВСЕНКМОРТХУ]/g, (m) => ruToEn[m]);
}

function validateLesson(lesson) {
    if (!lesson) return false;
    if (!lesson.name || !lesson.enName || !lesson.syntax) return false;
    if (!lesson.def || !lesson.taskDesc) return false;
    if (!Array.isArray(lesson.table) || lesson.table.length < 2) return false;
    if (!Array.isArray(lesson.expected) || lesson.expected.length === 0) return false;
    if (lesson.result === undefined || lesson.result === null || lesson.result === "") return false;
    return true;
}

function getDifficulty(fnName, lesson) {
    return (lesson && lesson.difficulty) || DIFFICULTY_MAP[fnName] || "medium";
}
function getXp(lesson, difficulty) {
    return (lesson && lesson.xp) || XP_BY_DIFFICULTY[difficulty] || 100;
}

/* =========================================================================
   5. КОМПОНЕНТЫ ИНТЕРФЕЙСА
   ========================================================================= */

function LangSwitch({ lang, setLang }) {
    return (
        <div className="et-langswitch">
            {[{ id: "ru", label: "RU" }, { id: "en", label: "EN" }, { id: "uz", label: "UZ" }].map((item) => (
                <button key={item.id} className={`et-lang-btn ${lang === item.id ? "active" : ""}`} onClick={() => setLang(item.id)}>
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function GlobalSearch({ t, onPick }) {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const allFns = Object.entries(EXCEL_DATABASE).flatMap(([cat, fns]) => fns.map((f) => ({ f, cat })));
    const matches = q.trim()
        ? allFns.filter((x) => x.f.toUpperCase().includes(q.trim().toUpperCase())).slice(0, 8)
        : [];

    return (
        <div className="et-gsearch">
            <input
                value={q}
                placeholder={t.globalSearchPlaceholder}
                onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            {open && matches.length > 0 && (
                <div className="et-gsearch-drop">
                    {matches.map((m) => (
                        <div key={m.f} className="et-gsearch-item" onMouseDown={() => { onPick(m.cat, m.f); setQ(""); setOpen(false); }}>
                            {m.f} <span style={{ opacity: .5, fontWeight: 500 }}>· {m.cat}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DifficultyBadge({ difficulty, t }) {
    const label = t[difficulty] || difficulty;
    return <span className={`et-badge et-badge-diff-${difficulty}`}>★ {label}</span>;
}

function CategoryAccordion({ categories, openCats, toggleCat, activeFormulaName, isGenerating, onPick }) {
    return (
        <>
            {categories.map((category) => {
                const isOpen = openCats.has(category);
                return (
                    <div className="et-cat" key={category}>
                        <div className="et-cat-head" onClick={() => toggleCat(category)}>
                            <div className="et-cat-head-left">
                                <span className="et-cat-icon">{CATEGORY_ICONS[category] || "•"}</span>
                                {category}
                            </div>
                            <span className={`et-cat-chevron ${isOpen ? "open" : ""}`}>▾</span>
                        </div>
                        {isOpen && (
                            <div className="et-cat-body">
                                {EXCEL_DATABASE[category].map((fName) => {
                                    const isActive = activeFormulaName === fName;
                                    const diff = DIFFICULTY_MAP[fName] || "medium";
                                    return (
                                        <button
                                            key={fName}
                                            disabled={isGenerating}
                                            className={`et-fn-btn ${isActive ? "active" : ""}`}
                                            onClick={() => onPick(category, fName)}
                                        >
                                            {!isActive && <span className={`et-fn-dot ${diff}`} />}
                                            {fName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}

function ProgressCard({ t, progress }) {
    const xpIntoLevel = progress.xp % 500;
    const pct = Math.min(100, Math.round((xpIntoLevel / 500) * 100));
    return (
        <div className="et-progress-card">
            <div className="et-progress-title">💎 {t.progressTitle}</div>
            <div className="et-progress-sub">{t.progressSub}</div>
            <div className="et-progress-row"><span>{t.level} {progress.level}</span><span>{xpIntoLevel} / 500 {t.xp}</span></div>
            <div className="et-progress-bar-track"><div className="et-progress-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
    );
}

function LoadingSkeleton({ t, name }) {
    return (
        <div className="et-skeleton-card">
            <div className="et-skel-title">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}>✨</motion.span>
                {t.loadingTitle}{name ? ` — ${name}` : ""}
            </div>
            <div className="et-skel-line" style={{ width: "45%", height: 26 }} />
            <div className="et-skel-line" style={{ width: "25%" }} />
            <div className="et-skel-line" style={{ width: "90%", marginTop: 20 }} />
            <div className="et-skel-line" style={{ width: "75%" }} />
            <div className="et-skel-line" style={{ width: "95%", marginTop: 20, height: 120 }} />
        </div>
    );
}

function ErrorCard({ t, onRetry }) {
    return (
        <div className="et-error-card">
            <div className="et-error-icon">⚠️</div>
            <div className="et-error-title">{t.errorTitle}</div>
            <div className="et-error-sub">{t.errorSub}</div>
            <button className="et-retry-btn" onClick={onRetry}>{t.retry}</button>
        </div>
    );
}

function ToastStack({ toasts }) {
    return (
        <div className="et-toast-wrap">
            <AnimatePresence>
                {toasts.map((tItem) => (
                    <motion.div key={tItem.id} className="et-toast" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                        {tItem.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function ExcelTable({ table, selected, onSelectCell }) {
    return (
        <div className="et-table-wrap">
            <table className="et-table">
                <thead>
                    <tr>
                        <th className="et-corner"></th>
                        {table[0].map((_, colIdx) => <th key={colIdx}>{getColumnLetter(colIdx)}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {table.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            <td className="et-rownum">{rowIdx + 1}</td>
                            {row.map((cell, colIdx) => {
                                const cellId = `${getColumnLetter(colIdx)}${rowIdx + 1}`;
                                return (
                                    <td
                                        key={colIdx}
                                        className={selected === cellId ? "et-selected" : ""}
                                        onClick={() => onSelectCell(cellId)}
                                        title={cellId}
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
    );
}

/* =========================================================================
   6. ГЛАВНЫЙ КОМПОНЕНТ
   ========================================================================= */
const ExcelTrainerLMS = ({ onBack, theme: propTheme }) => {
    useInjectStyles();

    const categories = Object.keys(EXCEL_DATABASE);
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
    const [openCats, setOpenCats] = useState(new Set([categories[0]]));

    const [currentLesson, setCurrentLesson] = useState(null);
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [customSearch, setCustomSearch] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [lang, setLang] = useState("ru");

    // Определение и авто-синхронизация темы
    const detectTheme = () => {
        if (typeof propTheme !== 'undefined') return propTheme;
        if (typeof document === 'undefined') return 'dark';
        const docEl = document.documentElement;
        const body = document.body;
        const isLight = docEl.classList.contains('light') || 
                        body.classList.contains('light') || 
                        docEl.getAttribute('data-theme') === 'light' || 
                        body.getAttribute('data-theme') === 'light';
        return isLight ? 'light' : 'dark';
    };

    const [theme, setTheme] = useState(detectTheme);

    useEffect(() => {
        if (typeof propTheme !== 'undefined') {
            setTheme(propTheme);
            return;
        }
        const updateTheme = () => {
            setTheme(detectTheme());
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        if (document.documentElement) {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        }
        if (document.body) {
            observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        }
        return () => observer.disconnect();
    }, [propTheme]);

    // Подсказки, разрешённые настройками (Firebase)
    const [hintsEnabled, setHintsEnabled] = useState(true);

    const [error, setError] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [examMode, setExamMode] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [answerStatus, setAnswerStatus] = useState("idle");
    const [selectedCell, setSelectedCell] = useState(null);
    const [copyState, setCopyState] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [progress, setProgress] = useState({ level: 1, xp: 0, completedLessons: 0, streak: 0 });

    const t = UI_DICT[lang];

    const pushToast = useCallback((text) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, text }]);
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600);
    }, []);

    // Подписка на Firebase
    useEffect(() => {
        const uid = window.auth?.currentUser?.uid;
        if (!uid || !window.db) return;

        const unsub = window.db.collection('users').doc(uid).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setHintsEnabled(data.excelHintsEnabled !== false);
                if (data.excelProgress) {
                    setProgress((prev) => ({ ...prev, ...data.excelProgress }));
                }
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        generateAIFormula(activeFormulaName);
        setOpenCats((prev) => new Set(prev).add(activeCategory));
        setHintLevel(0);
        setAttempts(0);
        setAnswerStatus("idle");
        setSelectedCell(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFormulaName]);

    const toggleCat = (cat) => {
        setOpenCats((prev) => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    };

    const generateAIFormula = async (formulaName, isRetry) => {
        setInputValue("=");
        setShowSuccess(false);
        setIsGenerating(true);
        setCurrentLesson(null);
        setError(false);
        setAnswerStatus("idle");

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
          "xp": число от 50 до 200 в зависимости от сложности,
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
             "ru": "Короткая подсказка на русском без готового ответа.",
             "en": "A short hint in English without the full answer.",
             "uz": "Тайёр жавобсиз қисқа маслаҳат (Кирилл алифбосида)."
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
        7. "hint" НЕ должен содержать готовую формулу или прямой ответ — только направление мысли.
        8. Все значения в "table" должны математически соответствовать "expected" и "result". Перед тем как вернуть JSON, самостоятельно пересчитай результат.
        9. "difficulty" и "xp" должны реально соответствовать сложности выбранной функции.`;

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
                if (!isRetry) {
                    return generateAIFormula(formulaName, true);
                }
                throw new Error("Некорректный урок от ИИ");
            }

            setCurrentLesson(parsedFormula);
            pushToast(t.toastLessonReady);
        } catch (err) {
            console.error("Ошибка:", err);
            setError(true);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCustomSearch = () => {
        if (!customSearch.trim()) return;
        const fName = customSearch.trim().toUpperCase();

        if (fName === activeFormulaName) {
            setInputValue("=");
            setShowSuccess(false);
            generateAIFormula(fName);
        } else {
            setActiveCategory("Поиск ИИ");
            setActiveFormulaName(fName);
        }
        setCustomSearch("");
    };

    const pickFromSidebarOrSearch = (category, fName) => {
        setActiveCategory(category);
        setActiveFormulaName(fName);
    };

    const checkAnswer = () => {
        if (!currentLesson) return;

        const userForm = normalizeFormula(inputValue);
        const isCorrect = currentLesson.expected.some((exp) => normalizeFormula(exp) === userForm);

        if (isCorrect) {
            setShowSuccess(true);
            setAnswerStatus("idle");
            const diff = getDifficulty(activeFormulaName, currentLesson);
            const xpGain = getXp(currentLesson, diff);

            setProgress((prev) => {
                const nextXp = prev.xp + xpGain;
                const nextLevel = 1 + Math.floor(nextXp / 500);
                const next = { level: nextLevel, xp: nextXp, completedLessons: prev.completedLessons + 1, streak: prev.streak };
                try {
                    const uid = window.auth?.currentUser?.uid;
                    if (uid && window.db) {
                        window.db.collection('users').doc(uid).set({ excelProgress: next }, { merge: true });
                    }
                } catch (e) {}
                return next;
            });
        } else {
            setShake(true);
            setAnswerStatus("wrong");
            setAttempts((prev) => prev + 1);
            setTimeout(() => setShake(false), 400);
        }
    };

    const handleCopySyntax = () => {
        if (!currentLesson) return;
        navigator.clipboard?.writeText(currentLesson.syntax || "");
        setCopyState(true);
        pushToast(t.toastCopied);
        setTimeout(() => setCopyState(false), 1500);
    };

    const handleHintClick = () => {
        if (!hintsEnabled || examMode) return;
        setHintLevel((prev) => Math.min(3, prev + 1));
    };

    const handleNextTask = () => generateAIFormula(activeFormulaName);

    const handleNextFunction = () => {
        const list = EXCEL_DATABASE[activeCategory];
        const idx = list.indexOf(activeFormulaName);
        const nextName = list[(idx + 1) % list.length];
        setActiveFormulaName(nextName);
    };

    const difficulty = currentLesson ? getDifficulty(activeFormulaName, currentLesson) : "medium";
    const xpForLesson = currentLesson ? getXp(currentLesson, difficulty) : XP_BY_DIFFICULTY[difficulty];

    // КОРРЕКТНОЕ ИЗВЛЕЧЕНИЕ НАЧАЛА ФОРМУЛЫ ДЛЯ 3-Й ПОДСКАЗКИ
    const rawExpected = String(currentLesson?.expected?.[0] || "").trim().toUpperCase();
    const fnMatch = rawExpected.match(/^=\s*([A-ZА-ЯЁ0-9_.]+)\s*\(/i);
    const hintStep3 = fnMatch ? `=${fnMatch}(` : (activeFormulaName ? `=${activeFormulaName}(` : "=");

    return (
        <motion.div
            className={`et-shell glass-panel theme-${theme}`}
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5 }}
        >
            <ToastStack toasts={toasts} />

            {/* ШАПКА */}
            <header className="et-header">
                <div className="et-header-left">
                    <div className="et-logo">📊</div>
                    <div style={{ minWidth: 0 }}>
                        <h2 className="et-title">{t.title}</h2>
                        <div className="et-subtitle">{t.subtitle}</div>
                    </div>
                </div>
                <div className="et-header-right">
                    <GlobalSearch t={t} onPick={pickFromSidebarOrSearch} />
                    <LangSwitch lang={lang} setLang={setLang} />
                </div>
            </header>

            <div className="et-body">
                {/* САЙДБАР */}
                <div className="et-sidebar modern-scroll">
                    <div className="et-ai-card">
                        <div className="et-ai-title">✨ {t.magic}</div>
                        <input
                            className="et-ai-input"
                            type="text"
                            value={customSearch}
                            onChange={(e) => setCustomSearch(e.target.value)}
                            placeholder={t.search}
                            onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()}
                        />
                        <Button variant="green" onClick={handleCustomSearch} disabled={isGenerating} style={{ width: '100%', height: '44px', fontSize: '14px', borderRadius: '12px', fontWeight: 'bold' }}>
                            {isGenerating ? t.genLoading : t.genBtn}
                        </Button>
                    </div>

                    <CategoryAccordion
                        categories={categories}
                        openCats={openCats}
                        toggleCat={toggleCat}
                        activeFormulaName={activeFormulaName}
                        isGenerating={isGenerating}
                        onPick={pickFromSidebarOrSearch}
                    />

                    <ProgressCard t={t} progress={progress} />
                </div>

                {/* ОСНОВНОЙ КОНТЕНТ */}
                <div className="et-main">
                    {error ? (
                        <ErrorCard t={t} onRetry={() => generateAIFormula(activeFormulaName)} />
                    ) : isGenerating || !currentLesson ? (
                        <LoadingSkeleton t={t} name={activeFormulaName} />
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* ТЕОРИЯ */}
                            <div className="et-theory-card">
                                <div className="et-theory-top">
                                    <div>
                                        <h1 className="et-fn-name">{currentLesson.name}</h1>
                                        <div className="et-fn-en">{t.enVersion} <b>{currentLesson.enName}</b></div>
                                    </div>
                                    <div className="et-badges">
                                        <DifficultyBadge difficulty={difficulty} t={t} />
                                        <span className="et-badge et-badge-xp">⚡ {xpForLesson} {t.xp}</span>
                                        <span className="et-badge et-badge-theory">📘 {t.theory}</span>
                                    </div>
                                </div>

                                <div className="et-def-box">
                                    <div className="et-box-label">{t.defTitle}</div>
                                    <div className="et-def-text">{getTranslatedText(currentLesson.def, lang)}</div>
                                </div>

                                <div className="et-syntax-box">
                                    <div className="et-box-label">{t.syntaxTitle}</div>
                                    <code className="et-syntax-code">{currentLesson.syntax}</code>
                                    <button className="et-copy-btn" onClick={handleCopySyntax}>
                                        {copyState ? `✓ ${t.copied}` : `📋 ${t.copy}`}
                                    </button>
                                </div>
                            </div>

                            {/* ПРАКТИКА */}
                            <div className="et-practice-card">
                                <div className="et-practice-top">
                                    <div className="et-practice-title">🎯 {t.practice}</div>
                                    {examMode && <span className="et-attempts">🔒 {t.attempts}: {attempts}</span>}
                                </div>

                                <p className="et-task-text">{getTranslatedText(currentLesson.taskDesc, lang)}</p>

                                <ExcelTable table={currentLesson.table} selected={selectedCell} onSelectCell={setSelectedCell} />

                                <div className={`et-formula-bar ${answerStatus === "wrong" ? "wrong" : ""} ${showSuccess ? "correct" : ""}`}>
                                    <div className="fx">fx</div>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => { if (e.target.value === "") setInputValue("="); else setInputValue(e.target.value.toUpperCase()); }}
                                        disabled={showSuccess}
                                        onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                                    />
                                </div>
                                {answerStatus === "wrong" && !showSuccess && (
                                    <div className="et-formula-status bad">⚠ {t.formulaBad}</div>
                                )}
                                {showSuccess && (
                                    <div className="et-formula-status ok">✓ {t.formulaOk}</div>
                                )}

                                {/* ПОДСКАЗКИ */}
                                {!showSuccess && !examMode && hintsEnabled && hintLevel > 0 && (
                                    <div className="et-hint-box">
                                        {hintLevel >= 1 && <div>💡 {t.hintLevel1}</div>}
                                        {hintLevel >= 2 && <div style={{ marginTop: 6 }}>💡 {t.hintLevel2}{currentLesson.hint ? ` — ${getTranslatedText(currentLesson.hint, lang)}` : ""}</div>}
                                        {hintLevel >= 3 && <div style={{ marginTop: 6 }}>💡 {t.hintLevel3} <code>{hintStep3}</code></div>}
                                        <div className="et-hint-actions">
                                            {hintLevel < 3 && <button className="et-hint-link" onClick={handleHintClick}>{t.hintOf} {hintLevel + 1}/3</button>}
                                            {hintLevel === 3 && (
                                                <button className="et-hint-link" onClick={() => setInputValue(currentLesson.expected[0])}>
                                                    {t.showSolution}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* УСПЕХ */}
                                <AnimatePresence>
                                    {showSuccess && (
                                        <motion.div className="et-success-card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <div>
                                                <h4 className="et-success-title">{t.successMsg}</h4>
                                                <span className="et-success-sub">{t.resultMsg} <b>{currentLesson.result}</b></span>
                                            </div>
                                            <div className="et-success-xp">+{xpForLesson} XP ✨</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* КНОПКИ */}
                                <div className="et-actions">
                                    {!showSuccess ? (
                                        <>
                                            <button className="et-action-btn et-action-secondary" onClick={() => generateAIFormula(activeFormulaName)} disabled={isGenerating}>
                                                {t.btnAnother}
                                            </button>
                                            {hintsEnabled && (
                                                <button
                                                    className={`et-action-btn et-action-exam ${examMode ? "on" : ""}`}
                                                    onClick={() => setExamMode((v) => !v)}
                                                >
                                                    {examMode ? t.examOnLabel : t.examOffLabel}
                                                </button>
                                            )}
                                            {hintsEnabled && !examMode && (
                                                <button className="et-action-btn et-action-warning" onClick={handleHintClick} disabled={hintLevel >= 3}>
                                                    {t.btnHint}
                                                </button>
                                            )}
                                            <button className="et-action-btn et-action-primary" onClick={checkAnswer}>
                                                {t.btnCheck}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="et-action-btn et-action-secondary" onClick={handleNextTask}>
                                                🔄 {t.nextTask}
                                            </button>
                                            <button className="et-action-btn et-action-primary" onClick={handleNextFunction}>
                                                {t.nextFunction} →
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
