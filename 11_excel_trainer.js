/**
 * ExcelTrainerLMS
 * ---------------------------------------------------------------------------
 * Визуальный слой и логика полностью базируются на архитектуре Claude.
 * Оборванные части кода восстановлены, CSS доведён до идеала по макету.
 * Бизнес-логика, AI-генерация и проверка строго сохранены.
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;

    /* =========================================================================
       1. ДАННЫЕ (база функций — НЕ ТРОГАЕМ структуру)
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
       2. СЛОВАРЬ ИНТЕРФЕЙСА (переведено на 3 языка)
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
    const xpForLevel = (level) => level * 500;
    const levelFromXp = (xp) => Math.floor(xp / 500) + 1;

    const PALETTES = {
        dark:  { bg:'transparent', panel:'transparent', card:'rgba(255,255,255,0.03)', text:'#ffffff', sub:'#94a3b8', border:'rgba(255,255,255,0.08)', tableBg:'rgba(0,0,0,0.2)', tableText:'#e2e8f0', tableBorder:'rgba(255,255,255,0.1)', tableHead:'rgba(255,255,255,0.05)' },
        light: { bg:'#f1f5f9', panel:'#ffffff', card:'#f8fafc', text:'#0f172a', sub:'#64748b', border:'#e2e8f0', tableBg:'#ffffff', tableText:'#1e293b', tableBorder:'#e2e8f0', tableHead:'#f8fafc' }
    };

    const ACCENTS = { purple: '#8b5cf6', blue: '#3b82f6', cyan: '#22d3ee', green: '#10b981', red: '#ef4444', amber: '#f59e0b' };

    /* =========================================================================
       4. ГЛОБАЛЬНЫЕ СТИЛИ КОМПОНЕНТА (доработаны под макет)
       ========================================================================= */
    const XM_STYLES = `
    .xm-shell {
      --xm-radius-sm: 12px; --xm-radius-md: 18px; --xm-radius-lg: 24px;
      width: 100%; max-width: 1240px; margin: 0 auto;
      background: var(--xm-bg); border-radius: var(--xm-radius-lg);
      padding: 24px 0; box-sizing: border-box; font-family: 'Inter', sans-serif; color: var(--xm-text);
    }
    .xm-shell * { box-sizing: border-box; }
    
    .xm-header { display: flex; flex-direction: column; gap: 16px; padding-bottom: 24px; margin-bottom: 20px; border-bottom: 1px solid var(--xm-border); padding-left: 24px; padding-right: 24px; }
    .xm-header-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; width: 100%; }
    .xm-header-bottom { display: flex; justify-content: flex-start; width: 100%; }

    .xm-brand { display: flex; align-items: center; gap: 14px; }
    .xm-logo { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; background: linear-gradient(135deg, ${ACCENTS.green} 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,.35); flex-shrink: 0; }
    .xm-title { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -.3px; color: var(--xm-text); }
    .xm-subtitle { font-size: 12px; color: var(--xm-sub); font-weight: 600; margin-top: 2px; }
    
    .xm-header-search { flex: 1 1 260px; max-width: 380px; position: relative; }
    .xm-header-search input { width: 100%; padding: 11px 14px 11px 38px; border-radius: 12px; border: 1px solid var(--xm-border); background: var(--xm-card); color: var(--xm-text); font-size: 13.5px; outline: none; transition: .2s; }
    .xm-header-search input:focus { border-color: ${ACCENTS.cyan}; box-shadow: 0 0 0 3px rgba(34,211,238,.15); }
    .xm-header-search .xm-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); opacity: .5; font-size: 13px; pointer-events: none; }
    
    .xm-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 16px; border: 1px solid var(--xm-border); }
    .xm-exam-toggle { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.2); border: 1px solid var(--xm-border); padding: 7px 14px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 800; color: var(--xm-text); user-select: none; transition: .2s; }
    .xm-exam-toggle.on { border-color: ${ACCENTS.amber}; color: ${ACCENTS.amber}; box-shadow: 0 0 0 2px rgba(245,158,11,.15); }
    .xm-exam-dot { width: 8px; height: 8px; border-radius: 50%; background: #475569; }
    .xm-exam-toggle.on .xm-exam-dot { background: ${ACCENTS.amber}; box-shadow: 0 0 6px ${ACCENTS.amber}; }
    .xm-theme-btn, .xm-menu-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--xm-border); background: rgba(0,0,0,0.2); color: var(--xm-text); cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; }
    .xm-menu-btn { display: none; }
    
    .xm-lang-switch { display: flex; gap: 4px; }
    .xm-lang-btn { padding: 6px 14px; border-radius: 8px; border: none; font-weight: 800; font-size: 12px; cursor: pointer; transition: .2s; outline: none; background: transparent; color: var(--xm-sub); }
    .xm-lang-btn.active { background: ${ACCENTS.green}; color: #fff; box-shadow: 0 3px 10px rgba(16,185,129,.4); }

    .xm-layout { display: flex; gap: 24px; align-items: flex-start; position: relative; padding: 0 24px; }
    .xm-sidebar { flex: 0 0 280px; display: flex; flex-direction: column; gap: 16px; max-height: 720px; overflow-y: auto; padding-right: 6px; }
    .xm-sidebar::-webkit-scrollbar { width: 4px; } .xm-sidebar::-webkit-scrollbar-thumb { background: var(--xm-border); border-radius: 6px; }
    .xm-overlay { display: none; }

    .xm-ai-card { background: linear-gradient(145deg, rgba(139,92,246,.08), rgba(34,211,238,.04)); border: 1px solid rgba(139,92,246,.25); padding: 18px; border-radius: var(--xm-radius-md); position: relative; overflow: hidden; }
    .xm-ai-card::after { content: '💎'; position: absolute; right: -15px; top: -15px; font-size: 80px; opacity: .05; pointer-events: none; }
    .xm-ai-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 11px; font-weight: 900; color: var(--xm-text); text-transform: uppercase; letter-spacing: .5px; }
    .xm-ai-card input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--xm-border); background: rgba(0,0,0,0.2); color: var(--xm-text); margin-bottom: 12px; font-size: 13px; outline: none; position: relative; z-index: 2; }
    .xm-ai-card input:focus { border-color: ${ACCENTS.cyan}; }
    .xm-generate-btn { width: 100%; height: 42px; border-radius: 10px; border: none; font-weight: 800; font-size: 12.5px; cursor: pointer; color: #fff; background: linear-gradient(135deg, ${ACCENTS.cyan}, ${ACCENTS.blue}); box-shadow: 0 4px 12px rgba(59,130,246,.3); transition: .2s; display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 2; }
    .xm-generate-btn:disabled { opacity: .6; cursor: wait; }
    .xm-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; animation: xm-spin .7s linear infinite; }
    @keyframes xm-spin { to { transform: rotate(360deg); } }

    .xm-category { border: 1px solid var(--xm-border); border-radius: 12px; overflow: hidden; background: transparent; }
    .xm-category-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; user-select: none; transition: background 0.2s; }
    .xm-category-header:hover { background: rgba(255,255,255,.02); }
    .xm-cat-label { display: flex; align-items: center; gap: 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: var(--xm-text); }
    .xm-cat-icon { font-size: 13px; color: ${ACCENTS.green}; width: 18px; text-align: center; }
    .xm-cat-arrow { transition: transform .2s; color: var(--xm-sub); font-size: 10px; }
    .xm-cat-arrow.open { transform: rotate(180deg); }
    .xm-category-body { padding: 0 10px 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .xm-fn-btn { padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: .15s; outline: none; border: none; background: rgba(255,255,255,0.05); color: var(--xm-text); flex: 1 1 auto; text-align: center; }
    .xm-fn-btn:hover { background: rgba(255,255,255,0.1); }
    .xm-fn-btn.active { background: ${ACCENTS.green}; color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,.3); }
    .xm-fn-btn:disabled { opacity: .5; cursor: wait; }
    .xm-no-results { padding: 16px; text-align: center; color: var(--xm-sub); font-size: 13px; }

    .xm-progress-card { background: linear-gradient(145deg, rgba(16,185,129,.05), rgba(59,130,246,.03)); border: 1px solid rgba(16,185,129,.15); padding: 16px; border-radius: var(--xm-radius-md); }
    .xm-progress-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
    .xm-level-badge { font-size: 12px; font-weight: 900; color: var(--xm-text); }
    .xm-xp-text { font-size: 11px; color: var(--xm-sub); font-weight: 700; }
    .xm-progress-bar { height: 6px; border-radius: 4px; background: rgba(255,255,255,.05); overflow: hidden; }
    .xm-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, ${ACCENTS.green}, ${ACCENTS.cyan}); transition: width .5s ease; }
    .xm-exam-stats { margin-top: 10px; font-size: 11px; color: var(--xm-sub); font-weight: 700; }

    .xm-main { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
    .xm-skeleton-box { height: 560px; border-radius: var(--xm-radius-lg); border: 1px dashed var(--xm-border); background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 20px; }
    .xm-skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.08) 37%, rgba(255,255,255,.03) 63%); background-size: 400% 100%; animation: xm-shimmer 1.4s ease infinite; }
    @keyframes xm-shimmer { 0%{ background-position: 100% 50%; } 100%{ background-position: 0 50%; } }

    .xm-theory-card { background: transparent; padding: 0; border: none; }
    .xm-theory-top { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
    .xm-fn-name { margin: 0; font-size: 36px; font-weight: 900; color: var(--xm-text); letter-spacing: -1px; }
    .xm-fn-en { color: var(--xm-sub); font-size: 13px; font-weight: 600; margin-bottom: 12px; }
    .xm-badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .xm-badge { padding: 6px 12px; border-radius: 10px; font-weight: 800; font-size: 10.5px; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; border: 1px solid var(--xm-border); }
    .xm-badge-theory { background: rgba(139,92,246,.15); color: ${ACCENTS.purple}; border-color: rgba(139,92,246,.3); }
    .xm-badge-easy { background: rgba(16,185,129,.1); color: ${ACCENTS.green}; }
    .xm-badge-medium { background: rgba(245,158,11,.1); color: ${ACCENTS.amber}; }
    .xm-badge-hard { background: rgba(239,68,68,.1); color: ${ACCENTS.red}; }
    .xm-badge-xp { background: rgba(234,179,8,.1); color: #FCD34D; border-color: rgba(234,179,8,.3); }
    
    .xm-def-box { background: rgba(255,255,255,0.02); padding: 18px; border-radius: 16px; border: 1px solid var(--xm-border); border-left: 3px solid ${ACCENTS.cyan}; margin-bottom: 16px; }
    .xm-box-label { font-size: 10px; color: var(--xm-sub); text-transform: uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: .5px; }
    .xm-def-text { font-size: 14px; color: var(--xm-text); line-height: 1.6; font-weight: 500; }
    .xm-syntax-box { background: rgba(0,0,0,0.2); padding: 18px; border-radius: 16px; border: 1px solid var(--xm-border); position: relative; }
    .xm-syntax-code { font-size: 13.5px; color: ${ACCENTS.cyan}; font-family: 'Fira Code', monospace; white-space: pre-wrap; line-height: 1.6; display: block; padding-right: 80px; }
    .xm-copy-btn { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: var(--xm-sub); padding: 6px 11px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: .2s; }
    .xm-copy-btn:hover { color: #fff; border-color: ${ACCENTS.cyan}; }

    .xm-practice-card { background: transparent; padding: 0; border: none; }
    .xm-practice-head { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .xm-practice-title { font-size: 13px; color: ${ACCENTS.green}; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
    .xm-task-desc { margin: 0 0 20px 0; color: var(--xm-text); font-size: 15px; font-weight: 600; line-height: 1.5; }
    
    .xm-table-wrap { overflow-x: auto; background: var(--xm-tableBg); border-radius: 12px; border: 1px solid var(--xm-border); margin-bottom: 20px; }
    .xm-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 13px; }
    .xm-table thead tr { background: var(--xm-tableHead); border-bottom: 1px solid var(--xm-border); }
    .xm-table th, .xm-table td { border-right: 1px solid var(--xm-border); padding: 12px 8px; color: var(--xm-tableText); }
    .xm-table th { font-weight: 700; font-size: 12px; color: var(--xm-sub); }
    .xm-row-head { background: var(--xm-tableHead); font-weight: 700; color: var(--xm-sub); width: 40px; font-size: 12px; }
    .xm-table tbody tr { border-bottom: 1px solid var(--xm-tableBorder); transition: background .15s; }
    .xm-table tbody tr:last-child { border-bottom: none; }
    .xm-table tbody tr:hover { background: rgba(255,255,255,.02); }
    .xm-table td.xm-cell-selected { background: rgba(34,211,238,.1); outline: 1px solid ${ACCENTS.cyan}; outline-offset: -1px; cursor: pointer; }
    .xm-table td { cursor: pointer; }

    .xm-formula-wrap { position: relative; margin-bottom: 16px; }
    .xm-fx { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 800; color: var(--xm-sub); font-size: 14px; font-style: italic; pointer-events: none; }
    .xm-formula-input { width: 100%; padding: 16px 16px 16px 48px; border-radius: 12px; border: 2px solid transparent; background: #fff; color: #0f172a; font-size: 16px; font-weight: 700; outline: none; font-family: 'Fira Code', monospace; transition: .2s; }
    .xm-formula-input.status-correct { border-color: ${ACCENTS.green}; box-shadow: 0 0 0 4px rgba(16,185,129,.12); }
    .xm-formula-input.status-incorrect { border-color: ${ACCENTS.red}; box-shadow: 0 0 0 4px rgba(239,68,68,.12); }
    .xm-formula-input:focus { border-color: ${ACCENTS.cyan}; box-shadow: 0 0 0 4px rgba(34,211,238,.15); }
    .xm-status-msg { font-size: 12px; font-weight: 700; margin: -6px 0 12px 4px; display: flex; align-items: center; gap: 6px; }
    .xm-status-msg.ok { color: ${ACCENTS.green}; } .xm-status-msg.bad { color: ${ACCENTS.red}; }

    .xm-hint-box { background: rgba(245,158,11,.05); border: 1px solid rgba(245,158,11,.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; font-size: 13px; color: var(--xm-text); line-height: 1.5; }
    .xm-hint-label { font-size: 10px; font-weight: 900; color: ${ACCENTS.amber}; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }

    .xm-success-card { background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.3); padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; overflow: hidden; }
    .xm-success-title { margin: 0 0 4px 0; color: ${ACCENTS.green}; font-size: 15px; font-weight: 800; }
    .xm-success-sub { color: var(--xm-sub); font-size: 13px; font-weight: 500; }
    .xm-xp-fly { font-weight: 900; color: #FBBF24; font-size: 14px; }

    .xm-error-card { background: rgba(239,68,68,.05); border: 1px solid rgba(239,68,68,.2); padding: 22px; border-radius: 16px; text-align: center; margin-bottom: 16px; }
    .xm-error-title { color: ${ACCENTS.red}; font-weight: 800; font-size: 15px; margin-bottom: 6px; }
    .xm-error-sub { color: var(--xm-sub); font-size: 12.5px; margin-bottom: 14px; }
    .xm-retry-btn { background: ${ACCENTS.red}; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 12.5px; }

    .xm-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
    .xm-btn { height: 44px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .3px; cursor: pointer; border: none; transition: .15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .xm-btn:disabled { opacity: .45; cursor: not-allowed; }
    .xm-btn-secondary { flex: 1 1 160px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--xm-sub); }
    .xm-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: #fff; }
    .xm-btn-group { display: flex; gap: 12px; flex: 2 1 320px; }
    .xm-btn-hint { flex: 1 1 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--xm-text); }
    .xm-btn-exam-locked { flex: 1 1 50%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); color: var(--xm-sub); }
    .xm-btn-primary { flex: 1 1 50%; background: ${ACCENTS.green}; color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,.2); }
    .xm-btn-solution { flex: 1 1 100%; background: transparent; border: 1px dashed var(--xm-border); color: var(--xm-sub); height: 38px; margin-top: -2px; }

    .xm-toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
    .xm-toast { background: var(--xm-panel); color: var(--xm-text); padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.1); display: flex; align-items: center; gap: 8px; }
    .xm-toast.ok { border-color: rgba(16,185,129,.4); } .xm-toast.err { border-color: rgba(239,68,68,.4); }

    @media (max-width: 900px) {
      .xm-layout { flex-direction: column; padding: 0; }
      .xm-sidebar { position: fixed; top: 0; left: -320px; height: 100vh; width: 290px; background: var(--xm-panel); z-index: 1000; padding: 16px; max-height: 100vh; transition: left .25s ease; box-shadow: 10px 0 30px rgba(0,0,0,.3); }
      .xm-sidebar.open { left: 0; }
      .xm-menu-btn { display: flex; }
      .xm-overlay.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 999; }
      .xm-header-search { display: none; }
      .xm-fn-name { font-size: 26px; }
      .xm-header-bottom { justify-content: center; }
    }
    `;

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
        const categories = Object.keys(EXCEL_DATABASE);

        const [activeCategory, setActiveCategory] = useState(categories[0]);
        const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
        const [currentLesson, setCurrentLesson] = useState(null);
        const [inputValue, setInputValue] = useState("=");
        const [shake, setShake] = useState(false);
        const [customSearch, setCustomSearch] = useState("");
        const [headerSearch, setHeaderSearch] = useState("");
        const [isGenerating, setIsGenerating] = useState(false);
        const [lang, setLang] = useState('ru');
        const [theme, setTheme] = useState('dark');
        const [hintsEnabled, setHintsEnabled] = useState(true);

        const [answerStatus, setAnswerStatus] = useState('idle'); // idle | correct | incorrect
        const [hintLevel, setHintLevel] = useState(0);
        const [examMode, setExamMode] = useState(false);
        const [examStats, setExamStats] = useState({ correct: 0, total: 0 });
        const [selectedCell, setSelectedCell] = useState(null);
        const [genError, setGenError] = useState(false);
        const [openMap, setOpenMap] = useState({ [categories[0]]: true });
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const [userProgress, setUserProgress] = useState({ xp: 0 });
        const [toasts, setToasts] = useState([]);

        const retryCountRef = useRef(0);

        const T = UI_DICT[lang];
        // Подстраиваем цвета как на скриншоте (заливка не зависит от темы браузера, фиксирована под макет)
        const palette = {
            bg: 'transparent', panel: 'transparent', card: 'rgba(255,255,255,0.03)',
            text: '#ffffff', sub: '#94a3b8', border: 'rgba(255,255,255,0.08)',
            tableBg: 'rgba(0,0,0,0.2)', tableText: '#e2e8f0', tableBorder: 'rgba(255,255,255,0.1)', tableHead: 'rgba(255,255,255,0.05)'
        };

        const pushToast = (msg, type = 'ok') => {
            const id = Date.now() + Math.random();
            setToasts(prev => [...prev, { id, msg, type }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2600);
        };

        /* ---- Firebase: подсказки + прогресс ---- */
        useEffect(() => {
            injectStyles();
            const uid = window.auth?.currentUser?.uid;
            if (!uid || !window.db) return;
            const unsub = window.db.collection('users').doc(uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setHintsEnabled(data.excelHintsEnabled !== false);
                    if (typeof data.excelXp === 'number') setUserProgress({ xp: data.excelXp });
                }
            });
            return () => unsub();
        }, []);

        const saveProgress = (newXp) => {
            setUserProgress({ xp: newXp });
            const uid = window.auth?.currentUser?.uid;
            if (uid && window.db) {
                window.db.collection('users').doc(uid).set({ excelXp: newXp }, { merge: true }).catch(() => {});
            }
        };

        useEffect(() => {
            generateAIFormula(activeFormulaName);
            setHintLevel(0);
            setSelectedCell(null);
            // eslint-disable-next-line
        }, [activeFormulaName]);

        /* ---- Генерация урока — backend flow ---- */
        const generateAIFormula = async (formulaName, isRetry = false) => {
            setInputValue("=");
            setAnswerStatus('idle');
            setHintLevel(0);
            setGenError(false);
            setIsGenerating(true);
            if (!isRetry) { setCurrentLesson(null); retryCountRef.current = 0; }

            const themes = [
                "успеваемость и оценки студентов на экзаменах", "статистика забитых голов в футбольном турнире",
                "расчет сметы на строительство дома", "учет продаж в магазине видеоигр",
                "планирование семейного бюджета на море", "учет строительных материалов на складе",
                "результаты соревнований по киберспорту", "расходы на доставку и логистику грузов",
                "статистика кассовых сборов кинотеатра", "учет абонементов в фитнес-клубе",
                "затраты на корм для животных в зоопарке", "расписание и пассажиры авиарейсов",
                "покупка деталей для сборки мощного ПК", "сбор урожая яблок и картофеля на ферме",
                "меню и заказы блюд в ресторане", "продажи билетов на музыкальный концерт"
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
              "xp": 50,
              "syntax": "=ФУНКЦИЯ(Z1:Z10)\\n=ФУНКЦИЯ(Z1; \\"Текст\\"; X1:X10)",
              "def": { "ru": "...", "en": "...", "uz": "..." },
              "taskDesc": { "ru": "Напишите формулу, которая посчитает [ЧТО-ТО].", "en": "...", "uz": "..." },
              "hint": {
                 "ru": ["Общая подсказка без готовой формулы (какую функцию и данные использовать)", "Более конкретная подсказка (с чего начать формулу, например =СУММ()"],
                 "en": ["General hint without the ready formula", "More specific hint, e.g. start with =SUM("],
                 "uz": ["Тайёр формуласиз умумий кўрсатма", "Аниқроқ кўрсатма"]
              },
              "table": [["Заголовок1","Заголовок2","Заголовок3"],["Значение",100,"Значение"],["Значение",200,"Значение"]],
              "expected": ["=ФУНКЦИЯ(B2:B3)"],
              "result": "Ожидаемый ответ вычисления"
            }
            КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
            1. В "syntax" — ТОЛЬКО примеры формул с абстрактными ячейками (Z1, X2).
            2. В "taskDesc" ЗАПРЕЩЕНО упоминать ячейку для вывода результата.
            3. "expected" должен содержать ВСЕ логически допустимые варианты формулы.
            4. В "hint" НИКОГДА не пиши готовую формулу целиком в первом элементе массива — только направление мысли. Второй элемент может показать НАЧАЛО формулы, но не полный ответ.
            5. Экранируй внутренние кавычки в JSON.
            6. Тема задачи: "${randomTheme}". Поля "def", "table" и "taskDesc" должны быть ИМЕННО на эту тему, без шаблонных слов вроде "Иванов", "Товар", "Цена", если они не подходят теме.
            7. "difficulty" должна реально отражать сложность функции "${formulaName}", а "xp" соответствовать сложности (easy=50, medium=100, hard=150).
            8. Перед выводом JSON мысленно проверь, что значения таблицы математически дают именно "result" при вычислении по "expected". Не создавай противоречивых данных.`;

            try {
                if (abortRef.current) abortRef.current.abort();
                abortRef.current = new AbortController();

                const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                    signal: abortRef.current.signal
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
                        ru: [`Подумайте, какая функция и какой диапазон ячеек нужны для "${formulaName}".`, `Формула начинается с =${formulaName}(`],
                        en: [`Think about which function and cell range you need.`, `The formula starts with =${parsedFormula.enName || formulaName}(`],
                        uz: [`Қайси функция ва катаклар диапазони кераклигини ўйланг.`, `Формула =${formulaName}( билан бошланади`]
                    };
                }

                setCurrentLesson(parsedFormula);
                retryCountRef.current = 0;
            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error("Ошибка генерации:", error);
                setGenError(true);
                pushToast(T.toastLessonError, 'error');
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
        };

        const toggleCategory = (cat) => setOpenMap(prev => ({ ...prev, [cat]: !prev[cat] }));
        const selectFunction = (cat, fn) => {
            setActiveCategory(cat);
            setActiveFormulaName(fn);
            setSidebarOpen(false);
        };

        const checkAnswer = () => {
            if (!currentLesson) return;
            const userForm = normalizeFormula(inputValue);
            const isCorrect = currentLesson.expected.some(exp => normalizeFormula(exp) === userForm);

            if (examMode) setExamStats(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

            if (isCorrect) {
                setAnswerStatus('correct');
                let earned = currentLesson.xp || DIFFICULTY_XP[currentLesson.difficulty] || 100;
                if (hintLevel >= 3) earned = Math.round(earned * 0.5); 
                else if (hintLevel > 0) earned = Math.round(earned * 0.8);
                if (examMode) earned = Math.round(earned * 1.5);
                saveProgress(userProgress.xp + earned);
                pushToast(`+${earned} XP`, 'ok');
            } else {
                setAnswerStatus('incorrect');
                setShake(true);
                setTimeout(() => setShake(false), 400);
            }
        };

        const handleHint = () => {
            if (!hintsEnabled || examMode || !currentLesson) return;
            setHintLevel(prev => Math.min(prev + 1, 3));
        };

        const revealSolution = () => {
            if (!currentLesson) return;
            setInputValue(Array.isArray(currentLesson.expected) ? currentLesson.expected[0] : currentLesson.expected);
            setHintLevel(3);
        };

        const nextTask = () => generateAIFormula(activeFormulaName);

        const copySyntax = () => {
            if (!currentLesson?.syntax) return;
            navigator.clipboard?.writeText(currentLesson.syntax).then(() => pushToast(T.toastCopied, 'ok')).catch(() => {});
        };

        const getColumnLetter = (i) => String.fromCharCode(65 + i);
        const hintTexts = currentLesson?.hint ? (currentLesson.hint[lang] || currentLesson.hint.ru || []) : [];

        const shellVars = {
            '--xm-bg': palette.bg, '--xm-panel': palette.panel, '--xm-card': palette.card,
            '--xm-text': palette.text, '--xm-sub': palette.sub, '--xm-border': palette.border,
            '--xm-tableBg': palette.tableBg, '--xm-tableText': palette.tableText,
            '--xm-tableBorder': palette.tableBorder, '--xm-tableHead': palette.tableHead
        };

        return (
            <motion.div className="xm-shell" style={shellVars}
                initial={{ opacity: 0, y: 30 }}
                animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={shake ? { duration: 0.3 } : { duration: 0.5 }}>
                <style>{XM_STYLES}</style>
                <Toasts toasts={toasts} />

                {/* HEADER (Два ряда как на скриншоте) */}
                <header className="xm-header">
                    <div className="xm-header-top">
                        <div className="xm-brand">
                            <button className="xm-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                            <div className="xm-logo">📊</div>
                            <div>
                                <h2 className="xm-title">{T.title}</h2>
                                <div className="xm-subtitle">{T.subtitle}</div>
                            </div>
                        </div>

                        <div className="xm-header-search">
                            <span className="xm-search-icon">🔍</span>
                            <input value={headerSearch} onChange={e => setHeaderSearch(e.target.value)} placeholder={T.headerSearch} />
                        </div>
                    </div>
                    
                    <div className="xm-header-bottom">
                        <div className="xm-header-right">
                            <div className={`xm-exam-toggle ${examMode ? 'on' : ''}`}
                                onClick={() => { setExamMode(m => !m); setExamStats({ correct: 0, total: 0 }); setHintLevel(0); }}
                                title={examMode ? T.examOn : T.examOff}>
                                <span className="xm-exam-dot" />🔒 {T.btnExam}
                            </div>
                            <button className="xm-theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? '☾' : '☀'}
                            </button>
                            <LangSwitcher lang={lang} setLang={setLang} />
                        </div>
                    </div>
                </header>

                <div className="xm-layout">
                    <div className={`xm-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

                    {/* SIDEBAR */}
                    <div className={`xm-sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <div className="xm-ai-card">
                            <div className="xm-ai-head">✨ {T.magic}</div>
                            <input value={customSearch} onChange={e => setCustomSearch(e.target.value)} placeholder={T.search}
                                onKeyDown={e => e.key === 'Enter' && handleCustomSearch()} />
                            <button className="xm-generate-btn" onClick={handleCustomSearch} disabled={isGenerating}>
                                {isGenerating && <span className="xm-spin" />}
                                {isGenerating ? T.genLoading : `✨ ${T.genBtn}`}
                            </button>
                        </div>

                        <CategoryAccordion categories={categories} openMap={openMap} toggleCategory={toggleCategory}
                            activeFormulaName={activeFormulaName} onSelect={selectFunction} isGenerating={isGenerating}
                            filterTerm={headerSearch} T={T} />

                        <ProgressCard userProgress={userProgress} examMode={examMode} examStats={examStats} T={T} />
                    </div>

                    {/* MAIN */}
                    <div className="xm-main">
                        {(isGenerating || !currentLesson) && !genError && (
                            <div className="xm-skeleton-box">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ fontSize: 46 }}>🤖</motion.div>
                                <div style={{ fontSize: 18, fontWeight: 800 }}>{T.aiTitle} {activeFormulaName}...</div>
                                <div style={{ fontSize: 13, opacity: .7, marginBottom: 10 }}>{T.aiSub}</div>
                                <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                                    <div className="xm-skel-line" style={{ width: '80%' }} />
                                    <div className="xm-skel-line" style={{ width: '60%' }} />
                                    <div className="xm-skel-line" style={{ width: '90%' }} />
                                </div>
                            </div>
                        )}

                        {genError && (
                            <div className="xm-error-card">
                                <div className="xm-error-title">⚠ {T.error}</div>
                                <div className="xm-error-sub">{T.errorSub}</div>
                                <button className="xm-retry-btn" onClick={() => generateAIFormula(activeFormulaName)}>{T.btnRetry}</button>
                            </div>
                        )}

                        {!isGenerating && currentLesson && !genError && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

                                {/* THEORY */}
                                <div className="xm-theory-card">
                                    <div className="xm-theory-top">
                                        <div>
                                            <h1 className="xm-fn-name">{currentLesson.name}</h1>
                                            <div className="xm-fn-en">{T.enVersion} <span style={{ color: ACCENTS.cyan }}>{currentLesson.enName}</span></div>
                                        </div>
                                        <div className="xm-badges">
                                            <span className={`xm-badge xm-badge-${currentLesson.difficulty || 'medium'}`}>{T[currentLesson.difficulty] || T.medium}</span>
                                            <span className="xm-badge xm-badge-xp">⭐ {currentLesson.xp} XP</span>
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
                                        <button className="xm-copy-btn" onClick={copySyntax}>📋 {T.copy}</button>
                                    </div>
                                </div>

                                {/* PRACTICE */}
                                <div className="xm-practice-card">
                                    <div className="xm-practice-head">
                                        <span className="xm-practice-title">🎯 {T.practice}</span>
                                    </div>

                                    <p className="xm-task-desc">{getTranslatedText(currentLesson.taskDesc, lang)}</p>

                                    <div className="xm-table-wrap custom-scrollbar">
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
                                                                <td key={c} className={selectedCell === cellId ? 'xm-cell-selected' : ''}
                                                                    onClick={() => setSelectedCell(cellId)}>{cell}</td>
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
                                        <input className={`xm-formula-input ${answerStatus === 'correct' ? 'status-correct' : ''} ${answerStatus === 'incorrect' ? 'status-incorrect' : ''}`}
                                            type="text" value={inputValue}
                                            placeholder={T.placeholderFormula}
                                            onChange={e => { const v = e.target.value; setInputValue(v === "" ? "=" : v.toUpperCase()); if (answerStatus !== 'idle') setAnswerStatus('idle'); }}
                                            disabled={answerStatus === 'correct'}
                                            onKeyDown={e => e.key === 'Enter' && answerStatus !== 'correct' && checkAnswer()} />
                                    </div>

                                    {answerStatus === 'incorrect' && <div className="xm-status-msg bad">⚠ {T.incorrectMsg}</div>}

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
                                            {answerStatus === 'correct' ? `→ ${T.btnNextTask}` : `↻ ${T.btnAnother}`}
                                        </button>

                                        {answerStatus !== 'correct' && (
                                            <div className="xm-btn-group">
                                                {examMode ? (
                                                    <button className="xm-btn xm-btn-exam-locked" disabled>🔒 {T.btnExam}</button>
                                                ) : (
                                                    <button className="xm-btn xm-btn-hint" disabled={!hintsEnabled || hintLevel >= 2} onClick={handleHint}>
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
