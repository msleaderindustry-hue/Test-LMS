const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

/* =========================================================================
   1. ДАННЫЕ (база функций — НЕ ТРОГАЕМ структуру, она уже используется)
   ========================================================================= */
const EXCEL_DATABASE = {
    "Математические": ["СУММ", "СУММЕСЛИ", "СУММЕСЛИМН", "ОКРУГЛ", "ОКРУГЛВВЕРХ", "ОКРУГЛВНИЗ", "ПРОИЗВЕД", "ОСТАТ", "КОРЕНЬ", "СТЕПЕНЬ", "СЛЧИС", "ЦЕЛОЕ", "СУММПРОИЗВ", "АБС"],
    "Статистические": ["СРЗНАЧ", "СРЗНАЧЕСЛИ", "МАКС", "МИН", "СЧЁТ", "СЧЁТЕСЛИ", "СЧЁТЕСЛИМН", "СЧЁТЗ", "МЕДИАНА", "МОДА", "НАИБОЛЬШИЙ", "НАИМЕНЬШИЙ", "СЧИТАТЬПУСТОТЫ"],
    "Логические": ["ЕСЛИ", "И", "ИЛИ", "ЕСЛИОШИБКА", "НЕ", "ИСТИНА", "ЛОЖЬ", "ЕСЛИМН", "ЕПУСТО", "ЕЧИСЛО", "ЕТЕКСТ"],
    "Текстовые": ["СЦЕПИТЬ", "ЛЕВСИМВ", "ПРАВСИМВ", "ПСТР", "ДЛСТР", "НАЙТИ", "ПОИСК", "ЗАМЕНИТЬ", "ПОДСТАВИТЬ", "ПРОПИСН", "СТРОЧН", "СЖПРОБЕЛЫ", "ТЕКСТ"],
    "Дата и время": ["СЕГОДНЯ", "ТДАТА", "ДЕНЬ", "МЕСЯЦ", "ГОД", "ДАТА", "ДЕНЬНЕД", "ЧАС", "МИНУТЫ", "РАБДЕНЬ", "ДОЛЯГОДА", "НОМНЕДЕЛИ"],
    "Поиск и ссылки": ["ВПР", "ГПР", "ИНДЕКС", "ПОИСКПОЗ", "СМЕЩ", "ДВССЫЛ", "СТРОКА", "СТОЛБЕЦ", "ПРОСМОТР", "ВЫБОР", "ТРАНСП"]
};

const CATEGORY_ICONS = {
    "Математические": "Σ", "Статистические": "📊", "Логические": "⚡",
    "Текстовые": "Abc", "Дата и время": "📅", "Поиск и ссылки": "🔎"
};

/* =========================================================================
   2. СЛОВАРЬ ИНТЕРФЕЙСА (расширенный, все новые ключи переведены на 3 языка)
   ========================================================================= */
const UI_DICT = {
    ru: {
        title: "Энциклопедия Excel", subtitle: "Умный тренажер функций с ИИ",
        magic: "Магия ИИ", search: "Поиск функции (напр. ВПР)...",
        headerSearch: "Поиск по функциям...",
        genLoading: "Создаем магию...", genBtn: "Сгенерировать урок",
        aiTitle: "Готовим материалы для", aiSub: "ИИ пишет уникальную задачу и таблицу",
        theory: "Теория", defTitle: "Определение", enVersion: "Английская версия:",
        syntaxTitle: "Примеры синтаксиса", practice: "Практика",
        successMsg: "Формула написана верно!", resultMsg: "Результат вычисления:",
        incorrectMsg: "Пока не верно, попробуйте ещё раз",
        btnAnother: "Другая задача", btnHint: "Подсказка", btnExam: "Экзамен",
        btnCheck: "Проверить", btnNextTask: "Следующая задача", btnNextFn: "Следующая функция",
        btnShowSolution: "Показать решение", btnRetry: "Повторить",
        copy: "Копировать", copied: "Скопировано",
        easy: "Легко", medium: "Средне", hard: "Сложно",
        xp: "XP", level: "Уровень", progress: "Прогресс",
        hintLevel1: "Подсказка", hintLevel2: "Подсказка 2",
        loading: "Загрузка...", error: "Не удалось создать урок",
        errorSub: "Проверьте соединение и попробуйте ещё раз",
        examOn: "Режим экзамена включён", examOff: "Режим экзамена выключен",
        examDesc: "Подсказки отключены, ответы оцениваются строго",
        examScore: "Результат экзамена",
        noResults: "Ничего не найдено", myProgress: "Прогресс",
        toastCopied: "Формула скопирована", toastLessonError: "Не удалось создать урок",
        placeholderFormula: "Введите формулу...", cellSelected: "Ячейка",
        completed: "выполнено"
    },
    en: {
        title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
        magic: "AI Magic", search: "Search function (e.g. VLOOKUP)...",
        headerSearch: "Search functions...",
        genLoading: "Creating magic...", genBtn: "Generate lesson",
        aiTitle: "Preparing materials for", aiSub: "AI is writing a unique task and table",
        theory: "Theory", defTitle: "Definition", enVersion: "English version:",
        syntaxTitle: "Syntax examples", practice: "Practice",
        successMsg: "Formula is correct!", resultMsg: "Calculation result:",
        incorrectMsg: "Not quite right, try again",
        btnAnother: "Another task", btnHint: "Hint", btnExam: "Exam",
        btnCheck: "Check", btnNextTask: "Next task", btnNextFn: "Next function",
        btnShowSolution: "Show solution", btnRetry: "Retry",
        copy: "Copy", copied: "Copied",
        easy: "Easy", medium: "Medium", hard: "Hard",
        xp: "XP", level: "Level", progress: "Progress",
        hintLevel1: "Hint", hintLevel2: "Hint 2",
        loading: "Loading...", error: "Failed to create lesson",
        errorSub: "Check your connection and try again",
        examOn: "Exam mode enabled", examOff: "Exam mode disabled",
        examDesc: "Hints are disabled, answers are graded strictly",
        examScore: "Exam score",
        noResults: "Nothing found", myProgress: "Progress",
        toastCopied: "Formula copied", toastLessonError: "Failed to create lesson",
        placeholderFormula: "Enter formula...", cellSelected: "Cell",
        completed: "done"
    },
    uz: {
        title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
        magic: "ИИ Сеҳри", search: "Функцияни қидириш (мас. ВПР)...",
        headerSearch: "Функциялар бўйича қидирув...",
        genLoading: "Сеҳр яратилмоқда...", genBtn: "Дарсни яратиш",
        aiTitle: "Материаллар тайёрланмоқда:", aiSub: "ИИ ноёб вазифа ва жадвал ёзмоқда",
        theory: "Назария", defTitle: "Таъриф", enVersion: "Инглизча версияси:",
        syntaxTitle: "Синтаксис мисоллари", practice: "Амалиёт",
        successMsg: "Формула тўғри ёзилган!", resultMsg: "Ҳисоблаш натижаси:",
        incorrectMsg: "Ҳали тўғри эмас, яна уриниб кўринг",
        btnAnother: "Бошқа вазифа", btnHint: "Ёрдам", btnExam: "Имтиҳон",
        btnCheck: "Текшириш", btnNextTask: "Кейинги вазифа", btnNextFn: "Кейинги функция",
        btnShowSolution: "Ечимни кўрсатиш", btnRetry: "Такрорлаш",
        copy: "Нусхалаш", copied: "Нусхаланди",
        easy: "Осон", medium: "Ўртача", hard: "Қийин",
        xp: "XP", level: "Даража", progress: "Прогресс",
        hintLevel1: "Ёрдам", hintLevel2: "Ёрдам 2",
        loading: "Юкланмоқда...", error: "Дарс яратиб бўлмади",
        errorSub: "Интернетни текшириб, қайта уриниб кўринг",
        examOn: "Имтиҳон режими ёқилди", examOff: "Имтиҳон режими ўчирилди",
        examDesc: "Ёрдамлар ўчирилган, жавоблар қатъий баҳоланади",
        examScore: "Имтиҳон натижаси",
        noResults: "Ҳеч нарса топилмади", myProgress: "Прогресс",
        toastCopied: "Формула нусхаланди", toastLessonError: "Дарс яратиб бўлмади",
        placeholderFormula: "Формулани киритинг...", cellSelected: "Катак",
        completed: "бажарилди"
    }
};

/* =========================================================================
   3. ХЕЛПЕРЫ
   ========================================================================= */
const getTranslatedText = (obj, currentLang) => {
    if (!obj) return "";
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.ru || "";
};

const normalizeFormula = (f) => {
    let str = String(f || "").trim().toUpperCase()
        .replace(/\s/g, '')
        .replace(/,/g, ';')
        .replace(/["'«»""]/g, '');
    const ruToEn = { 'А':'A','В':'B','С':'C','Е':'E','Н':'H','К':'K','М':'M','О':'O','Р':'P','Т':'T','Х':'X','У':'Y' };
    return str.replace(/[АВСЕНКМОРТХУ]/g, m => ruToEn[m]);
};

const validateLesson = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    if (!obj.name || !obj.enName || !obj.syntax) return false;
    if (!obj.def || !obj.taskDesc) return false;
    if (!Array.isArray(obj.table) || obj.table.length < 2) return false;
    if (!Array.isArray(obj.expected) || obj.expected.length === 0) return false;
    if (obj.result === undefined || obj.result === null || obj.result === "") return false;
    return true;
};

const DIFFICULTY_XP = { easy: 50, medium: 100, hard: 150 };
const levelFromXp = (xp) => Math.floor(xp / 500) + 1;

const ACCENTS = { purple: '#8b5cf6', blue: '#3b82f6', cyan: '#22d3ee', green: '#10b981', red: '#ef4444', amber: '#f59e0b' };

/* =========================================================================
   4. ГЛОБАЛЬНЫЕ СТИЛИ КОМПОНЕНТА
   ========================================================================= */
const XM_STYLES = `
.xm-shell { 
  --xm-radius-sm: 12px; 
  --xm-radius-md: 18px; 
  --xm-radius-lg: 24px; 
  --xm-bg: var(--bg-body, #050816);
  --xm-panel: var(--bg-panel, #0D1328);
  --xm-card: var(--bg-panel, #111936);
  --xm-text: var(--text-main, #f8fafc);
  --xm-sub: var(--text-sec, #94a3b8);
  --xm-border: var(--glass-border, rgba(255,255,255,.08));
  --xm-tableBg: var(--bg-body, #0f172a);
  --xm-tableText: var(--text-main, #e2e8f0);
  --xm-tableBorder: var(--glass-border, rgba(255,255,255,.08));
  --xm-tableHead: var(--bg-panel, #111936);
  
  width: 100%; 
  max-width: 1240px; 
  margin: 0 auto;
  background: var(--xm-bg); 
  border-radius: var(--xm-radius-lg); 
  padding: 24px; 
  box-sizing: border-box; 
  font-family: inherit; 
  color: var(--xm-text); 
}
.xm-shell * { box-sizing:border-box; }
.xm-header { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding-bottom:18px; margin-bottom:20px; border-bottom:1px solid var(--xm-border); }
.xm-brand { display:flex; align-items:center; gap:14px; }
.xm-logo { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px; background: linear-gradient(135deg, ${ACCENTS.green} 0%, #059669 100%); box-shadow: 0 6px 16px rgba(16,185,129,.35); flex-shrink:0; }
.xm-title { margin:0; font-size:24px; font-weight:900; letter-spacing:-.3px; color: var(--xm-text); }
.xm-subtitle { font-size:12.5px; color: var(--xm-sub); font-weight:600; margin-top:2px; }
.xm-header-search { flex:1 1 260px; max-width:380px; position:relative; }
.xm-header-search input { width:100%; padding:11px 14px 11px 38px; border-radius:12px; border:1px solid var(--xm-border); background: var(--xm-card); color: var(--xm-text); font-size:13.5px; outline:none; transition:.2s; }
.xm-header-search input:focus { border-color:${ACCENTS.cyan}; box-shadow:0 0 0 3px rgba(34,211,238,.15); }
.xm-header-search .xm-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); opacity:.5; font-size:13px; pointer-events:none; }
.xm-header-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.xm-lang-switch { display:flex; gap:5px; background: rgba(0,0,0,.15); padding:5px; border-radius:14px; border:1px solid var(--xm-border); }
.xm-lang-btn { padding:7px 14px; border-radius:10px; border:none; font-weight:800; font-size:12px; cursor:pointer; transition:.2s; outline:none; background:transparent; color: var(--xm-sub); }
.xm-lang-btn.active { background:${ACCENTS.green}; color:#fff; box-shadow:0 3px 10px rgba(16,185,129,.4); }
.xm-menu-btn { width:38px; height:38px; border-radius:10px; border:1px solid var(--xm-border); background: var(--xm-card); color: var(--xm-text); cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; }
.xm-menu-btn { display:none; }
.xm-exam-toggle { display:flex; align-items:center; gap:8px; background: var(--xm-card); border:1px solid var(--xm-border); padding:7px 12px; border-radius:12px; cursor:pointer; font-size:12px; font-weight:800; color: var(--xm-sub); user-select:none; }
.xm-exam-toggle.on { border-color:${ACCENTS.purple}; color:${ACCENTS.purple}; box-shadow:0 0 0 3px rgba(139,92,246,.12); }
.xm-exam-dot { width:8px; height:8px; border-radius:50%; background:#475569; }
.xm-exam-toggle.on .xm-exam-dot { background:${ACCENTS.purple}; box-shadow:0 0 6px ${ACCENTS.purple}; }

.xm-layout { display:flex; gap:24px; align-items:flex-start; position:relative; }
.xm-sidebar { flex:0 0 300px; display:flex; flex-direction:column; gap:16px; max-height:720px; overflow-y:auto; padding-right:6px; }
.xm-sidebar::-webkit-scrollbar { width:6px; } .xm-sidebar::-webkit-scrollbar-thumb { background: var(--xm-border); border-radius:6px; }
.xm-overlay { display:none; }

.xm-ai-card { background: linear-gradient(145deg, rgba(139,92,246,.10), rgba(34,211,238,.06)); border:1px solid rgba(139,92,246,.25); padding:18px; border-radius: var(--xm-radius-md); position:relative; overflow:hidden; }
.xm-ai-card::after { content:'💎'; position:absolute; right:-10px; top:-10px; font-size:70px; opacity:.08; }
.xm-ai-head { display:flex; align-items:center; gap:8px; margin-bottom:12px; font-size:12.5px; font-weight:800; color: var(--xm-text); text-transform:uppercase; letter-spacing:.5px; }
.xm-ai-card input { width:100%; padding:11px 14px; border-radius:11px; border:1px solid var(--xm-border); background: var(--xm-panel); color: var(--xm-text); margin-bottom:12px; font-size:13.5px; outline:none; }
.xm-ai-card input:focus { border-color:${ACCENTS.purple}; }
.xm-generate-btn { width:100%; height:42px; border-radius:11px; border:none; font-weight:800; font-size:13px; cursor:pointer; color:#fff; background: linear-gradient(135deg, ${ACCENTS.purple}, ${ACCENTS.blue}); box-shadow:0 6px 16px rgba(139,92,246,.35); transition:.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
.xm-generate-btn:disabled { opacity:.6; cursor:wait; }
.xm-spin { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; animation: xm-spin .7s linear infinite; }
@keyframes xm-spin { to{ transform: rotate(360deg); } }

.xm-category { border:1px solid var(--xm-border); border-radius:14px; overflow:hidden; background: var(--xm-panel); }
.xm-category-header { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; cursor:pointer; user-select:none; }
.xm-category-header:hover { background: rgba(255,255,255,.02); }
.xm-cat-label { display:flex; align-items:center; gap:9px; font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color: var(--xm-text); }
.xm-cat-icon { font-size:14px; color:${ACCENTS.green}; width:18px; text-align:center; }
.xm-cat-arrow { transition: transform .2s; color: var(--xm-sub); font-size:11px; }
.xm-cat-arrow.open { transform: rotate(180deg); }
.xm-category-body { padding:0 12px 12px; display:flex; flex-wrap:wrap; gap:7px; }
.xm-fn-btn { padding:7px 13px; border-radius:18px; font-size:12.5px; font-weight:700; cursor:pointer; transition:.15s; outline:none; border:1px solid var(--xm-border); background: var(--xm-card); color: var(--xm-text); }
.xm-fn-btn:hover { border-color:${ACCENTS.green}; transform: translateY(-1px); }
.xm-fn-btn.active { background:${ACCENTS.green}; border-color:${ACCENTS.green}; color:#fff; box-shadow:0 4px 12px rgba(16,185,129,.4); }
.xm-fn-btn:disabled { opacity:.5; cursor:wait; }
.xm-no-results { padding:16px; text-align:center; color: var(--xm-sub); font-size:13px; }

.xm-progress-card { background: linear-gradient(145deg, rgba(16,185,129,.10), rgba(59,130,246,.06)); border:1px solid rgba(16,185,129,.25); padding:18px; border-radius: var(--xm-radius-md); }
.xm-progress-top { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; }
.xm-level-badge { font-size:13px; font-weight:900; color: var(--xm-text); }
.xm-xp-text { font-size:12px; color: var(--xm-sub); font-weight:700; }
.xm-progress-bar { height:9px; border-radius:6px; background: rgba(255,255,255,.08); overflow:hidden; }
.xm-progress-fill { height:100%; border-radius:6px; background: linear-gradient(90deg, ${ACCENTS.green}, ${ACCENTS.cyan}); transition: width .5s ease; }
.xm-exam-stats { margin-top:10px; font-size:11.5px; color: var(--xm-sub); font-weight:700; }

.xm-main { flex:1 1 0; min-width:0; }
.xm-skeleton-box { height:560px; border-radius: var(--xm-radius-lg); border:1px dashed var(--xm-border); background: var(--xm-panel); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:20px; }
.xm-skel-line { height:14px; border-radius:7px; background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.14) 37%, rgba(255,255,255,.06) 63%); background-size:400% 100%; animation: xm-shimmer 1.4s ease infinite; }
@keyframes xm-shimmer { 0%{ background-position:100% 50%; } 100%{ background-position:0 50%; } }

.xm-theory-card { background: var(--xm-panel); padding:26px; border-radius: var(--xm-radius-lg); border:1px solid var(--xm-border); margin-bottom:20px; }
.xm-theory-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
.xm-fn-name { margin:0 0 4px 0; font-size:32px; font-weight:900; color: var(--xm-text); letter-spacing:-.5px; }
.xm-fn-en { color: var(--xm-sub); font-size:13.5px; font-weight:600; }
.xm-badges { display:flex; gap:8px; flex-wrap:wrap; }
.xm-badge { padding:7px 13px; border-radius:10px; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; }
.xm-badge-theory { background: rgba(16,185,129,.12); color:${ACCENTS.green}; }
.xm-badge-easy { background: rgba(16,185,129,.12); color:${ACCENTS.green}; }
.xm-badge-medium { background: rgba(245,158,11,.14); color:${ACCENTS.amber}; }
.xm-badge-hard { background: rgba(239,68,68,.14); color:${ACCENTS.red}; }
.xm-badge-xp { background: rgba(139,92,246,.14); color:${ACCENTS.purple}; }
.xm-def-box { background: var(--xm-card); padding:18px; border-radius:14px; border-left:4px solid ${ACCENTS.green}; margin-bottom:16px; }
.xm-box-label { font-size:11px; color: var(--xm-sub); text-transform:uppercase; font-weight:800; margin-bottom:7px; letter-spacing:.5px; }
.xm-def-text { font-size:15px; color: var(--xm-text); line-height:1.6; }
.xm-syntax-box { background: var(--xm-tableBg); padding:18px; border-radius:14px; border:1px solid var(--xm-tableBorder); position:relative; }
.xm-syntax-code { font-size:14.5px; color:#38bdf8; font-family:'Fira Code', monospace; white-space:pre-wrap; line-height:1.6; display:block; padding-right:80px; }
.xm-copy-btn { position:absolute; top:14px; right:14px; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:#94a3b8; padding:6px 11px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; transition:.2s; }
.xm-copy-btn:hover { color:#fff; border-color:${ACCENTS.cyan}; }

.xm-practice-card { background: var(--xm-card); padding:26px; border-radius: var(--xm-radius-lg); border:2px dashed var(--xm-border); }
.xm-practice-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
.xm-practice-title { font-size:14px; color:${ACCENTS.green}; text-transform:uppercase; font-weight:900; letter-spacing:1px; display:flex; align-items:center; gap:8px; }
.xm-task-desc { margin:0 0 22px 0; color: var(--xm-text); font-size:16.5px; font-weight:600; line-height:1.55; }
.xm-table-wrap { overflow-x:auto; background: var(--xm-tableBg); border-radius:12px; border:1px solid var(--xm-tableBorder); margin-bottom:22px; }
.xm-table { width:100%; border-collapse:collapse; text-align:center; font-size:14.5px; }
.xm-table thead tr { background: var(--xm-tableHead); border-bottom:3px solid ${ACCENTS.green}; }
.xm-table th, .xm-table td { border-right:1px solid var(--xm-tableBorder); padding:10px 8px; color: var(--xm-tableText); }
.xm-table th { font-weight:800; }
.xm-row-head { background: var(--xm-tableHead); font-weight:800; color: var(--xm-sub); width:42px; }
.xm-table tbody tr { border-bottom:1px solid var(--xm-tableBorder); transition: background .15s; }
.xm-table tbody tr:hover { background: rgba(16,185,129,.06); }
.xm-table td.xm-cell-selected { background: rgba(34,211,238,.15); outline:2px solid ${ACCENTS.cyan}; outline-offset:-2px; cursor:pointer; }
.xm-table td { cursor:pointer; }

.xm-formula-wrap { position:relative; margin-bottom:14px; }
.xm-fx { position:absolute; left:18px; top:50%; transform:translateY(-50%); font-weight:900; color:${ACCENTS.green}; font-size:18px; font-style:italic; pointer-events:none; }
.xm-formula-input { width:100%; padding:18px 18px 18px 52px; border-radius:15px; border:2px solid var(--xm-border); background: var(--xm-panel); color: var(--xm-text); font-size:19px; font-weight:700; outline:none; font-family:'Fira Code', monospace; transition:.2s; }
.xm-formula-input.status-correct { border-color:${ACCENTS.green}; box-shadow:0 0 0 4px rgba(16,185,129,.12); }
.xm-formula-input.status-incorrect { border-color:${ACCENTS.red}; box-shadow:0 0 0 4px rgba(239,68,68,.12); }
.xm-formula-input:focus { border-color:${ACCENTS.cyan}; box-shadow:0 0 0 4px rgba(34,211,238,.12); }
.xm-status-msg { font-size:12.5px; font-weight:700; margin: -4px 0 12px 4px; display:flex; align-items:center; gap:6px; }
.xm-status-msg.ok { color:${ACCENTS.green}; } .xm-status-msg.bad { color:${ACCENTS.red}; }

.xm-hint-box { background: rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.3); border-radius:14px; padding:15px 18px; margin-bottom:16px; font-size:14px; color: var(--xm-text); line-height:1.5; }
.xm-hint-label { font-size:11px; font-weight:900; color:${ACCENTS.amber}; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }

.xm-success-card { background: rgba(16,185,129,.10); border:2px solid ${ACCENTS.green}; padding:18px 20px; border-radius:16px; display:flex; justify-content:space-between; align-items:center; gap:14px; margin-bottom:16px; flex-wrap:wrap; overflow:hidden; }
.xm-success-title { margin:0 0 4px 0; color:${ACCENTS.green}; font-size:17px; font-weight:900; }
.xm-success-sub { color: var(--xm-sub); font-size:14px; font-weight:600; }
.xm-xp-fly { font-weight:900; color:${ACCENTS.purple}; font-size:15px; }

.xm-error-card { background: rgba(239,68,68,.08); border:2px solid ${ACCENTS.red}; padding:22px; border-radius:16px; text-align:center; margin-bottom:16px; }
.xm-error-title { color:${ACCENTS.red}; font-weight:900; font-size:16px; margin-bottom:6px; }
.xm-error-sub { color: var(--xm-sub); font-size:13px; margin-bottom:14px; }
.xm-retry-btn { background:${ACCENTS.red}; color:#fff; border:none; padding:10px 22px; border-radius:10px; font-weight:800; cursor:pointer; font-size:13px; }

.xm-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:20px; padding-top:18px; border-top:1px solid var(--xm-border); }
.xm-btn { height:48px; border-radius:12px; font-weight:800; font-size:12.5px; text-transform:uppercase; letter-spacing:.3px; cursor:pointer; border:none; transition:.15s; display:flex; align-items:center; justify-content:center; gap:6px; }
.xm-btn:disabled { opacity:.45; cursor:not-allowed; }
.xm-btn-secondary { flex:1 1 160px; background: rgba(56,189,248,.14); border:1px solid rgba(56,189,248,.4); color:#38bdf8; }
.xm-btn-group { display:flex; gap:12px; flex:2 1 320px; }
.xm-btn-hint { flex:1 1 50%; background: rgba(245,158,11,.14); border:1px solid rgba(245,158,11,.4); color:${ACCENTS.amber}; }
.xm-btn-exam-locked { flex:1 1 50%; background: rgba(139,92,246,.10); border:1px solid rgba(139,92,246,.3); color:${ACCENTS.purple}; }
.xm-btn-primary { flex:1 1 50%; background: linear-gradient(135deg, ${ACCENTS.green}, #059669); color:#fff; box-shadow:0 6px 16px rgba(16,185,129,.35); }
.xm-btn-solution { flex:1 1 100%; background: transparent; border:1px dashed var(--xm-border); color: var(--xm-sub); height:38px; margin-top:-2px; }

.xm-toast-wrap { position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
.xm-toast { background: var(--xm-panel); color:var(--xm-text); padding:12px 18px; border-radius:12px; font-size:13px; font-weight:700; box-shadow:0 10px 30px rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; gap:8px; }
.xm-toast.ok { border-color: rgba(16,185,129,.4); } .xm-toast.err { border-color: rgba(239,68,68,.4); }

@media (max-width: 900px){
  .xm-layout { flex-direction:column; }
  .xm-sidebar { position:fixed; top:0; left:-320px; height:100vh; width:290px; background: var(--xm-panel); z-index:1000; padding:16px; max-height:100vh; transition: left .25s ease; box-shadow: 10px 0 30px rgba(0,0,0,.3); }
  .xm-sidebar.open { left:0; }
  .xm-menu-btn { display:flex; }
  .xm-overlay.open { display:block; position:fixed; inset:0; background: rgba(0,0,0,.5); z-index:999; }
  .xm-header-search { order:3; max-width:100%; flex:1 1 100%; }
  .xm-fn-name { font-size:26px; }
}
`;

function useInjectStyles() {
    useEffect(() => {
        if (!document.getElementById("et-styles")) {
            const tag = document.createElement("style");
            tag.id = "et-styles";
            tag.textContent = XM_STYLES;
            document.head.appendChild(tag);
        }
    }, []);
}

/* =========================================================================
   5. МЕЛКИЕ КОМПОНЕНТЫ
   ========================================================================= */
const Toasts = ({ toasts }) => (
    <div className="xm-toast-wrap">
        <AnimatePresence>
            {toasts.map(t => (
                <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                    className={`xm-toast ${t.type === 'error' ? 'err' : 'ok'}`}>
                    <span>{t.type === 'error' ? '⚠️' : '✅'}</span>{t.msg}
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

const LangSwitcher = ({ lang, setLang }) => (
    <div className="xm-lang-switch">
        {[{ id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' }].map(item => (
            <button key={item.id} className={`xm-lang-btn ${lang === item.id ? 'active' : ''}`} onClick={() => setLang(item.id)}>
                {item.label}
            </button>
        ))}
    </div>
);

const GlobalSearch = ({ t, onPick }) => {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const allFns = Object.entries(EXCEL_DATABASE).flatMap(([cat, fns]) => fns.map((f) => ({ f, cat })));
    const matches = q.trim()
        ? allFns.filter((x) => x.f.toUpperCase().includes(q.trim().toUpperCase())).slice(0, 8)
        : [];

    return (
        <div className="xm-header-search">
            <span className="xm-search-icon">🔍</span>
            <input
                value={q}
                placeholder={t.headerSearch}
                onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            {open && matches.length > 0 && (
                <div className="et-gsearch-drop" style={{position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--xm-card)', border: '1px solid var(--xm-border)', borderRadius: '12px', zIndex: 20, boxShadow: '0 12px 30px rgba(0,0,0,.35)', overflow: 'hidden'}}>
                    {matches.map((m) => (
                        <div key={m.f} style={{padding: '9px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--xm-text)'}} onMouseDown={() => { onPick(m.cat, m.f); setQ(""); setOpen(false); }}>
                            {m.f} <span style={{ opacity: .5, fontWeight: 500 }}>· {m.cat}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryAccordion = ({ categories, openMap, toggleCategory, activeFormulaName, onSelect, isGenerating, filterTerm, T }) => {
    const term = filterTerm.trim().toUpperCase();
    if (term) {
        const matches = [];
        categories.forEach(cat => EXCEL_DATABASE[cat].forEach(fn => { if (fn.includes(term)) matches.push({ cat, fn }); }));
        if (matches.length === 0) return <div className="xm-no-results">{T.noResults}</div>;
        return (
            <div className="xm-category">
                <div className="xm-category-body" style={{ paddingTop: 12 }}>
                    {matches.map(({ fn, cat }) => (
                        <button key={cat + fn} disabled={isGenerating}
                            className={`xm-fn-btn ${activeFormulaName === fn ? 'active' : ''}`}
                            onClick={() => onSelect(cat, fn)}>{fn}</button>
                    ))}
                </div>
            </div>
        );
    }
    return categories.map(category => {
        const open = !!openMap[category];
        return (
            <div key={category} className="xm-category">
                <div className="xm-category-header" onClick={() => toggleCategory(category)}>
                    <div className="xm-cat-label"><span className="xm-cat-icon">{CATEGORY_ICONS[category] || '•'}</span>{category}</div>
                    <span className={`xm-cat-arrow ${open ? 'open' : ''}`}>▼</span>
                </div>
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                            <div className="xm-category-body">
                                {EXCEL_DATABASE[category].map(fName => (
                                    <button key={fName} disabled={isGenerating}
                                        className={`xm-fn-btn ${activeFormulaName === fName ? 'active' : ''}`}
                                        onClick={() => onSelect(category, fName)}>{fName}</button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    });
};

const ProgressCard = ({ userProgress, examMode, examStats, T }) => {
    const level = levelFromXp(userProgress.xp);
    const currentLevelBase = (level - 1) * 500;
    const withinLevel = userProgress.xp - currentLevelBase;
    const pct = Math.min(100, Math.round((withinLevel / 500) * 100));
    return (
        <div className="xm-progress-card">
            <div className="xm-progress-top">
                <span className="xm-level-badge">💎 {T.level} {level}</span>
                <span className="xm-xp-text">{withinLevel} / 500 {T.xp}</span>
            </div>
            <div className="xm-progress-bar"><div className="xm-progress-fill" style={{ width: pct + '%' }} /></div>
            {examMode && (
                <div className="xm-exam-stats">🔒 {T.examScore}: {examStats.correct}/{examStats.total}</div>
            )}
        </div>
    );
};

/* =========================================================================
   6. ГЛАВНЫЙ КОМПОНЕНТ
   ========================================================================= */
const ExcelTrainerLMS = ({ onBack }) => {
    useInjectStyles();

    const categories = Object.keys(EXCEL_DATABASE);
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
    const [openMap, setOpenMap] = useState({ [categories[0]]: true });

    const [currentLesson, setCurrentLesson] = useState(null);
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [customSearch, setCustomSearch] = useState("");
    const [headerSearch, setHeaderSearch] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [lang, setLang] = useState("ru");
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

    const retryCountRef = useRef(0);
    const T = UI_DICT[lang];

    const pushToast = useCallback((text, type = 'ok') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, text, type }]);
    }, []);

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

    const saveProgress = (newXp) => {
        setProgress((prev) => ({ ...prev, xp: newXp }));
        const uid = window.auth?.currentUser?.uid;
        if (uid && window.db) {
            window.db.collection('users').doc(uid).set({ excelProgress: { xp: newXp } }, { merge: true }).catch(() => {});
        }
    };

    useEffect(() => {
        generateAIFormula(activeFormulaName);
        setOpenMap((prev) => ({ ...prev, [activeCategory]: true }));
        setHintLevel(0);
        setAttempts(0);
        setAnswerStatus("idle");
        setSelectedCell(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFormulaName]);

    const toggleCat = (cat) => {
        setOpenMap((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };

    const generateAIFormula = async (formulaName, isRetry = false) => {
        setInputValue("=");
        setShowSuccess(false);
        setIsGenerating(true);
        setError(false);
        setAnswerStatus("idle");
        if (!isRetry) { setCurrentLesson(null); retryCountRef.current = 0; }

        const themes = [
            "успеваемость и оценки студентов на экзаменах", "статистика забитых голов в футбольном турнире",
            "расчет сметы на строительство дома", "учет продаж в магазине видеоигр",
            "планирование семейного бюджета на море", "учет строительных материалов на складе",
            "результаты соревнований по киберспорту", "расходы на доставку и логистику грузов",
            "статистика кассовых сборов кинотеатра", "учет абонементов в фитнес-клубе"
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
          "def": { "ru": "...", "en": "...", "uz": "..." },
          "taskDesc": { "ru": "Напишите формулу, которая посчитает [ЧТО-ТО].", "en": "...", "uz": "..." },
          "hint": { "ru": ["...", "..."], "en": ["...", "..."], "uz": ["...", "..."] },
          "table": [["Заголовок1","Заголовок2","Заголовок3"],["Значение",100,"Значение"],["Значение",200,"Значение"]],
          "expected": ["=ФУНКЦИЯ(B2:B3)"],
          "result": "Ожидаемый ответ вычисления"
        }
        КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
        1. В "syntax" — ТОЛЬКО примеры формул с абстрактными ячейками (Z1, X2).
        2. В "taskDesc" ЗАПРЕЩЕНО упоминать ячейку для вывода результата.
        3. "expected" должен содержать ВСЕ логически допустимые варианты формулы.
        4. Экранируй внутренние кавычки в JSON.
        5. Тема задачи: "${randomTheme}". Поля "def", "table" и "taskDesc" должны быть ИМЕННО на эту тему.
        6. "difficulty" должна реально отражать сложность функции, "xp" от 50 до 200.`;

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
                if (retryCountRef.current < 2) {
                    retryCountRef.current += 1;
                    return generateAIFormula(formulaName, true);
                }
                throw new Error("Невалидный урок от ИИ");
            }

            if (!parsedFormula.difficulty) parsedFormula.difficulty = 'medium';
            if (!parsedFormula.xp) parsedFormula.xp = DIFFICULTY_XP[parsedFormula.difficulty] || 100;
            if (!parsedFormula.hint) {
                parsedFormula.hint = {
                    ru: [`Подумайте, какая функция и какой диапазон ячеек нужны.`, `Формула начинается с =${formulaName}(`],
                    en: [`Think about which function and cell range you need.`, `The formula starts with =${parsedFormula.enName || formulaName}(`],
                    uz: [`Қайси функция ва катаклар диапазони кераклигини ўйланг.`, `Формула =${formulaName}( билан бошланади`]
                };
            }

            setCurrentLesson(parsedFormula);
            pushToast(T.toastLessonReady, 'ok');
            retryCountRef.current = 0;
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
        setSidebarOpen(false);
    };

    const checkAnswer = () => {
        if (!currentLesson) return;
        const userForm = normalizeFormula(inputValue);
        const isCorrect = currentLesson.expected.some((exp) => normalizeFormula(exp) === userForm);

        if (examMode) setExamStats(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

        if (isCorrect) {
            setShowSuccess(true);
            setAnswerStatus("idle");
            let earned = currentLesson.xp || DIFFICULTY_XP[currentLesson.difficulty] || 100;
            if (hintLevel >= 3) earned = Math.round(earned * 0.5);
            else if (hintLevel > 0) earned = Math.round(earned * 0.8);
            if (examMode) earned = Math.round(earned * 1.5);
            saveProgress(progress.xp + earned);
            pushToast(`+${earned} XP`, 'ok');
        } else {
            setAnswerStatus("wrong");
            setShake(true);
            setAttempts((prev) => prev + 1);
            setTimeout(() => setShake(false), 400);
        }
    };

    const handleCopySyntax = () => {
        if (!currentLesson?.syntax) return;
        navigator.clipboard?.writeText(currentLesson.syntax).then(() => {
            setCopyState(true);
            pushToast(T.toastCopied, 'ok');
            setTimeout(() => setCopyState(false), 1500);
        }).catch(() => {});
    };

    const handleHintClick = () => {
        if (!hintsEnabled || examMode) return;
        setHintLevel((prev) => Math.min(3, prev + 1));
    };

    const revealSolution = () => {
        if (!currentLesson) return;
        setInputValue(Array.isArray(currentLesson.expected) ? currentLesson.expected[0] : currentLesson.expected);
        setHintLevel(3);
    };

    const nextTask = () => generateAIFormula(activeFormulaName);

    const handleNextFunction = () => {
        const list = EXCEL_DATABASE[activeCategory] || Object.values(EXCEL_DATABASE)[0];
        const idx = list.indexOf(activeFormulaName);
        const nextName = list[(idx + 1) % list.length];
        setActiveFormulaName(nextName);
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const difficulty = currentLesson?.difficulty || DIFFICULTY_MAP[activeFormulaName] || "medium";
    const xpForLesson = currentLesson?.xp || XP_BY_DIFFICULTY[difficulty];
    
    const rawExpected = String(currentLesson?.expected?.[0] || "").trim().toUpperCase();
    const firstFnLetter = rawExpected.match(/^=\s*([A-ZА-ЯЁ]+)\s*\(/i);
    const hintStep3 = firstFnLetter ? `=${firstFnLetter[1]}(` : "=";
    const hintTexts = currentLesson?.hint ? (currentLesson.hint[lang] || currentLesson.hint.ru || []) : [];

    return (
        <motion.div className="xm-shell"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5 }}>
            
            <header className="xm-header">
                <div className="xm-brand">
                    <button className="xm-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                    <div className="xm-logo">📊</div>
                    <div>
                        <h2 className="xm-title">{T.title}</h2>
                        <div className="xm-subtitle">{T.subtitle}</div>
                    </div>
                </div>

                <GlobalSearch t={T} onPick={pickFromSidebarOrSearch} />

                <div className="xm-header-right">
                    <div className={`xm-exam-toggle ${examMode ? 'on' : ''}`} onClick={() => { setExamMode(m => !m); setHintLevel(0); }} title={examMode ? T.examOn : T.examOff}>
                        <span className="xm-exam-dot" />🔒 {T.btnExam}
                    </div>
                    <LangSwitch lang={lang} setLang={setLang} />
                </div>
            </header>

            <div className="xm-layout">
                <div className={`xm-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

                <div className={`xm-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="xm-ai-card">
                        <div className="xm-ai-head">✨ {T.magic}</div>
                        <input value={customSearch} onChange={e => setCustomSearch(e.target.value)} placeholder={T.search} onKeyDown={e => e.key === 'Enter' && handleCustomSearch()} />
                        <button className="xm-generate-btn" onClick={handleCustomSearch} disabled={isGenerating}>
                            {isGenerating && <span className="xm-spin" />}
                            {isGenerating ? T.genLoading : `✨ ${T.genBtn}`}
                        </button>
                    </div>

                    <CategoryAccordion categories={categories} openMap={openMap} toggleCategory={toggleCat} activeFormulaName={activeFormulaName} onSelect={pickFromSidebarOrSearch} isGenerating={isGenerating} filterTerm="" T={T} />

                    <ProgressCard userProgress={progress} examMode={examMode} examStats={examStats} T={T} />
                </div>

                <div className="xm-main">
                    {error ? (
                        <ErrorCard t={T} onRetry={() => generateAIFormula(activeFormulaName)} />
                    ) : isGenerating || !currentLesson ? (
                        <LoadingSkeleton t={T} name={activeFormulaName} />
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                            
                            <div className="xm-theory-card">
                                <div className="xm-theory-top">
                                    <div>
                                        <h1 className="xm-fn-name">{currentLesson.name}</h1>
                                        <div className="xm-fn-en">{T.enVersion} <span style={{ color: ACCENTS.cyan }}>{currentLesson.enName}</span></div>
                                    </div>
                                    <div className="xm-badges">
                                        <span className={`xm-badge xm-badge-${difficulty}`}>★ {T[difficulty] || T.medium}</span>
                                        <span className="xm-badge xm-badge-xp">⚡ {xpForLesson} {T.xp}</span>
                                        <span className="xm-badge xm-badge-theory">📘 {T.theory}</span>
                                    </div>
                                </div>

                                <div className="xm-def-box">
                                    <div className="xm-box-label">{T.defTitle}</div>
                                    <div className="xm-def-text">{getTranslatedText(currentLesson.def, lang)}</div>
                                </div>

                                <div className="xm-syntax-box">
                                    <div className="xm-box-label" style={{ color: '#64748b' }}>{T.syntaxTitle}</div>
                                    <code className="xm-syntax-code">{currentLesson.syntax}</code>
                                    <button className="xm-copy-btn" onClick={handleCopySyntax}>{copyState ? `✓ ${T.copied}` : `📋 ${T.copy}`}</button>
                                </div>
                            </div>

                            <div className="xm-practice-card">
                                <div className="xm-practice-head">
                                    <span className="xm-practice-title">🎯 {T.practice}</span>
                                </div>

                                <p className="xm-task-desc">{getTranslatedText(currentLesson.taskDesc, lang)}</p>

                                <div className="xm-table-wrap">
                                    <table className="xm-table">
                                        <thead>
                                            <tr>
                                                <th className="xm-row-head"></th>
                                                {currentLesson.table[0].map((_, i) => <th key={i}>{getColumnLetter(i)}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentLesson.table.map((row, r) => (
                                                <tr key={r}>
                                                    <td className="xm-row-head">{r + 1}</td>
                                                    {row.map((cell, c) => {
                                                        const cellId = `${getColumnLetter(c)}${r + 1}`;
                                                        return (
                                                            <td key={c} className={selectedCell === cellId ? 'xm-cell-selected' : ''} onClick={() => setSelectedCell(cellId)}>{cell}</td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {selectedCell && <div style={{ fontSize: 12, color: 'var(--xm-sub)', marginTop: -14, marginBottom: 16 }}>{T.cellSelected}: <b>{selectedCell}</b></div>}

                                {hintLevel > 0 && answerStatus !== 'correct' && !examMode && (
                                    <div className="xm-hint-box">
                                        <div className="xm-hint-label">💡 {hintLevel === 1 ? T.hintLevel1 : T.hintLevel2}</div>
                                        {hintTexts[Math.min(hintLevel, 2) - 1] || hintTexts[0]}
                                    </div>
                                )}

                                <div className="xm-formula-wrap">
                                    <span className="xm-fx">fx</span>
                                    <input className={`xm-formula-input ${answerStatus === 'correct' ? 'status-correct' : ''} ${answerStatus === 'wrong' ? 'status-incorrect' : ''}`}
                                        type="text" value={inputValue} placeholder={T.placeholderFormula}
                                        onChange={e => { const v = e.target.value; setInputValue(v === "" ? "=" : v.toUpperCase()); if (answerStatus !== 'idle') setAnswerStatus('idle'); }}
                                        disabled={answerStatus === 'correct'}
                                        onKeyDown={e => e.key === 'Enter' && answerStatus !== 'correct' && checkAnswer()} />
                                </div>

                                {answerStatus === 'wrong' && <div className="xm-status-msg bad">⚠ {T.incorrectMsg}</div>}

                                <AnimatePresence>
                                    {answerStatus === 'correct' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="xm-success-card">
                                            <div>
                                                <h4 className="xm-success-title">✓ {T.successMsg}</h4>
                                                <span className="xm-success-sub">{T.resultMsg} <b>{currentLesson.result}</b></span>
                                            </div>
                                            <div className="xm-xp-fly">✨ +{currentLesson.xp} XP</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="xm-actions">
                                    <button className="xm-btn xm-btn-secondary" disabled={isGenerating} onClick={nextTask}>
                                        {answerStatus === 'correct' ? `→ ${T.nextTask}` : `↻ ${T.btnAnother}`}
                                    </button>

                                    {answerStatus !== 'correct' && (
                                        <div className="xm-btn-group">
                                            {examMode ? (
                                                <button className="xm-btn xm-btn-exam-locked" disabled>🔒 {T.btnExam}</button>
                                            ) : (
                                                <button className="xm-btn xm-btn-hint" disabled={!hintsEnabled || hintLevel >= 2} onClick={handleHintClick}>
                                                    💡 {hintLevel === 0 ? T.hintLevel1 : T.hintLevel2}
                                                </button>
                                            )}
                                            <button className="xm-btn xm-btn-primary" onClick={checkAnswer}>✓ {T.btnCheck}</button>
                                        </div>
                                    )}
                                </div>

                                {!examMode && hintsEnabled && hintLevel >= 2 && answerStatus !== 'correct' && (
                                    <button className="xm-btn xm-btn-solution" onClick={revealSolution}>👁 {T.btnShowSolution}</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
})();
