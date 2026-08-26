/**
 * ExcelTrainerLMS
 * ---------------------------------------------------------------------------
 * ВАЖНО: Весь код обернут в IIFE для защиты от глобальных конфликтов.
 * Скопируй код от первой строки (function () {) до самой последней (})();
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef, useCallback } = React;
    const { motion, AnimatePresence } = window.Motion;

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
        "Математические": "Σ", "Статистические": "📈", "Логические": "◆",
        "Текстовые": "Aa", "Дата и время": "🕐", "Поиск и ссылки": "🔎"
    };

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
       2. СЛОВАРЬ ИНТЕРФЕЙСА
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
            successMsg: "Формула написана верно! 🎉", resultMsg: "Результат вычисления:",
            incorrectMsg: "Пока не верно, попробуйте ещё раз",
            btnAnother: "Другая задача", btnHint: "Подсказка", btnExam: "Экзамен",
            btnCheck: "Проверить", btnNextTask: "Следующая задача", btnNextFn: "Следующая функция",
            btnShowSolution: "Показать решение", btnRetry: "Повторить",
            copy: "Копировать", copied: "Скопировано",
            easy: "Легко", medium: "Средне", hard: "Сложно",
            xp: "XP", level: "Уровень", progress: "Прогресс",
            progressTitle: "Уровень", progressSub: "Открывай новые функции и становись мастером Excel",
            loadingTitle: "ИИ создаёт урок", errorTitle: "Не удалось создать урок", errorSub: "Проверьте связь и попробуйте снова",
            examOnLabel: "🔒 Экзамен", examOffLabel: "🔓 Обычный режим",
            formulaOk: "Формула правильная", formulaBad: "Проверьте формулу",
            toastLessonReady: "Урок создан", toastCopied: "Формула скопирована"
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
            progressTitle: "Level", progressSub: "Unlock new functions and become an Excel master",
            loadingTitle: "AI is building the lesson", errorTitle: "Couldn't generate the lesson", errorSub: "Check your connection and try again",
            examOnLabel: "🔒 Exam", examOffLabel: "🔓 Normal mode",
            formulaOk: "Formula looks correct", formulaBad: "Check your formula",
            toastLessonReady: "Lesson ready", toastCopied: "Formula copied"
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
            progressTitle: "Даража", progressSub: "Янги функцияларни очинг ва Excel устаси бўлинг",
            loadingTitle: "ИИ дарсни яратмоқда", errorTitle: "Дарсни яратиб бўлмади", errorSub: "Интернетни текшириб, қайта уриниб кўринг",
            examOnLabel: "🔒 Имтиҳон", examOffLabel: "🔓 Оддий режим",
            formulaOk: "Формула тўғри", formulaBad: "Формулани текширинг",
            toastLessonReady: "Дарс тайёр", toastCopied: "Формула нусха олинди"
        }
    };

    /* =========================================================================
       3. CSS (Используем системные переменные var(--bg-panel) для поддержки тем)
       ========================================================================= */
    const ET_STYLES = `
    .et-shell {
      width: 100%; max-width: 1240px; margin: 0 auto;
      background: transparent; color: var(--text-main); font-family: inherit;
    }
    .et-shell * { box-sizing: border-box; }
    
    .et-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid var(--glass-border); }
    .et-header-left { display: flex; align-items: center; gap: 14px; }
    .et-logo { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; background: linear-gradient(135deg, #22d3ee 0%, #10b981 100%); box-shadow: 0 4px 12px rgba(16,185,129,.3); }
    .et-title { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.3px; color: var(--text-main); }
    .et-subtitle { font-size: 12px; color: var(--text-sec); font-weight: 600; margin-top: 2px; }
    
    .et-header-center { flex: 1 1 260px; max-width: 360px; position: relative; }
    .et-header-center input { width: 100%; padding: 10px 14px 10px 36px; border-radius: 10px; border: 1px solid var(--glass-border); background: var(--bg-panel); color: var(--text-main); font-size: 13px; outline: none; transition: 0.2s; }
    .et-header-center input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.15); }
    .et-header-center .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; opacity: 0.5; pointer-events: none; }
    .et-gsearch-drop { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: 10px; overflow: hidden; z-index: 20; box-shadow: 0 10px 25px rgba(0,0,0,.3); max-height: 220px; overflow-y: auto; }
    .et-gsearch-item { padding: 8px 14px; font-size: 12.5px; font-weight: 600; color: var(--text-main); cursor: pointer; }
    .et-gsearch-item:hover { background: rgba(139,92,246,.15); }
    
    .et-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .et-exam-toggle { display: flex; align-items: center; gap: 8px; background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 11.5px; font-weight: 800; color: var(--text-sec); user-select: none; transition: 0.2s; }
    .et-exam-toggle.on { border-color: #f59e0b; color: #f59e0b; box-shadow: 0 0 0 2px rgba(245,158,11,.15); }
    
    .et-langswitch { display: flex; gap: 4px; background: var(--bg-panel); padding: 4px; border-radius: 12px; border: 1px solid var(--glass-border); }
    .et-lang-btn { padding: 6px 12px; border-radius: 8px; border: none; background: transparent; color: var(--text-sec); font-weight: 800; font-size: 11.5px; cursor: pointer; transition: 0.2s; outline: none; }
    .et-lang-btn.active { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; box-shadow: 0 4px 10px rgba(139,92,246,.3); }

    .et-layout { display: flex; gap: 24px; align-items: flex-start; }
    .et-sidebar { flex: 0 0 280px; display: flex; flex-direction: column; gap: 16px; }
    
    .et-ai-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 18px; border-radius: 18px; position: relative; overflow: hidden; }
    .et-ai-card::after { content: "💎"; position: absolute; right: -20px; top: -20px; font-size: 80px; opacity: 0.05; pointer-events: none; }
    .et-ai-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .et-ai-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: var(--bg-body); color: var(--text-main); margin-bottom: 12px; font-size: 12.5px; outline: none; position: relative; z-index: 2; }
    .et-ai-input:focus { border-color: #38bdf8; }
    .et-generate-btn { width: 100%; height: 40px; border-radius: 10px; border: none; font-weight: 800; font-size: 12px; cursor: pointer; color: #fff; background: linear-gradient(135deg, #38bdf8, #3b82f6); transition: 0.2s; position: relative; z-index: 2; }
    .et-generate-btn:disabled { opacity: 0.6; cursor: wait; }

    .et-category { border: 1px solid var(--glass-border); border-radius: 14px; overflow: hidden; background: var(--bg-panel); }
    .et-category-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; user-select: none; transition: background 0.2s; }
    .et-category-header:hover { background: rgba(255,255,255,0.03); }
    .et-cat-label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-main); }
    .et-cat-icon { font-size: 14px; color: #10b981; width: 18px; text-align: center; }
    .et-cat-arrow { transition: transform 0.2s; color: var(--text-sec); font-size: 10px; }
    .et-cat-arrow.open { transform: rotate(180deg); }
    .et-category-body { padding: 0 10px 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    
    .et-fn-btn { padding: 6px 12px; border-radius: 14px; font-size: 11.5px; font-weight: 700; cursor: pointer; transition: 0.15s; outline: none; border: 1px solid var(--glass-border); background: var(--bg-body); color: var(--text-main); display: flex; align-items: center; gap: 6px; }
    .et-fn-btn:hover { border-color: #38bdf8; }
    .et-fn-btn.active { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; border: none; box-shadow: 0 4px 12px rgba(59,130,246,.35); }
    .et-fn-btn:disabled { opacity: 0.5; cursor: wait; }
    .et-fn-dot { width: 5px; height: 5px; border-radius: 50%; flex: none; }
    .et-fn-dot.easy { background: #10b981; } .et-fn-dot.medium { background: #f59e0b; } .et-fn-dot.hard { background: #ef4444; }

    .et-progress-card { background: linear-gradient(145deg, rgba(34,211,238,.08), rgba(16,185,129,.05)); border: 1px solid rgba(34,211,238,.2); padding: 16px; border-radius: 16px; }
    .et-progress-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .et-level-badge { font-size: 12px; font-weight: 900; color: var(--text-main); display: flex; align-items: center; gap: 6px; }
    .et-xp-text { font-size: 10.5px; color: var(--text-sec); font-weight: 700; }
    .et-progress-bar { height: 6px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
    .et-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #22d3ee, #10b981); transition: width 0.5s ease; }

    .et-main { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
    
    .et-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 24px; border-radius: 20px; }
    .et-theory-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
    .et-fn-name { margin: 0 0 4px 0; font-size: 28px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
    .et-fn-en { color: var(--text-sec); font-size: 13px; font-weight: 600; }
    .et-fn-en b { color: #10b981; font-weight: 800; }
    .et-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .et-badge { padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; border: 1px solid var(--glass-border); }
    .et-badge-theory { background: rgba(34,211,238,.1); color: #22d3ee; }
    .et-badge-diff-easy { background: rgba(16,185,129,.1); color: #10b981; }
    .et-badge-diff-medium { background: rgba(245,158,11,.1); color: #f59e0b; }
    .et-badge-diff-hard { background: rgba(239,68,68,.1); color: #ef4444; }
    .et-badge-xp { background: rgba(139,92,246,.1); color: #c4b5fd; }
    
    .et-def-box { background: var(--bg-body); padding: 16px; border-radius: 12px; border-left: 3px solid #10b981; margin-bottom: 16px; }
    .et-box-label { font-size: 10px; color: var(--text-sec); text-transform: uppercase; font-weight: 800; margin-bottom: 6px; letter-spacing: 0.5px; }
    .et-def-text { font-size: 14px; color: var(--text-main); line-height: 1.5; }
    
    .et-syntax-box { background: var(--bg-body); padding: 16px; border-radius: 12px; border: 1px solid var(--glass-border); position: relative; }
    .et-syntax-code { font-size: 13px; color: #38bdf8; font-family: 'Fira Code', monospace; white-space: pre-wrap; display: block; line-height: 1.5; }
    .et-copy-btn { position: absolute; top: 12px; right: 12px; background: var(--glass-border); border: none; color: var(--text-main); padding: 5px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .et-copy-btn:hover { background: #38bdf8; color: #000; }

    .et-practice-head { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; color: #10b981; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }
    .et-task-desc { margin: 0 0 20px 0; color: var(--text-main); font-size: 15px; font-weight: 600; line-height: 1.5; }
    
    .et-table-wrap { overflow-x: auto; background: var(--bg-body); border-radius: 10px; border: 1px solid var(--glass-border); margin-bottom: 20px; }
    .et-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 13px; font-family: sans-serif; }
    .et-table thead tr { border-bottom: 2px solid #10b981; }
    .et-table th { border-right: 1px solid var(--glass-border); padding: 10px 8px; font-weight: 700; color: var(--text-sec); }
    .et-table th.et-corner { width: 36px; background: var(--glass-border); color: var(--text-sec); }
    .et-table td { border-right: 1px solid var(--glass-border); padding: 8px; color: var(--text-main); }
    .et-table td.et-rownum { background: var(--glass-border); font-weight: 700; color: var(--text-sec); }
    .et-table tr { border-bottom: 1px solid var(--glass-border); }

    .et-formula-wrap { position: relative; margin-bottom: 16px; }
    .et-formula-wrap .fx { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-weight: 900; color: #10b981; font-size: 16px; font-style: italic; pointer-events: none; }
    .et-formula-input { width: 100%; padding: 16px 16px 16px 44px; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-body); color: var(--text-main); font-size: 16px; font-weight: 700; outline: none; font-family: 'Fira Code', monospace; transition: 0.2s; }
    .et-formula-input:focus { border-color: #38bdf8; }
    .et-formula-wrap.correct input { border-color: #10b981; }
    .et-formula-wrap.wrong input { border-color: #ef4444; }

    .et-success-card { background: rgba(16,185,129,.1); border: 1px solid #10b981; padding: 16px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
    .et-success-title { margin: 0 0 4px; color: #10b981; font-size: 16px; font-weight: 800; }
    .et-success-sub { color: var(--text-sec); font-size: 13px; font-weight: 600; }
    .et-success-xp { font-weight: 900; color: #c4b5fd; font-size: 14px; }

    .et-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .et-btn { flex: 1 1 140px; height: 44px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: uppercase; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.15s; outline: none; }
    .et-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .et-btn-secondary { background: var(--bg-body); border: 1px solid var(--glass-border); color: var(--text-main); }
    .et-btn-secondary:hover:not(:disabled) { border-color: #38bdf8; color: #38bdf8; }
    .et-btn-primary { background: linear-gradient(135deg, #10b981, #059669); color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,.25); }
    .et-btn-primary:hover:not(:disabled) { transform: translateY(-1px); }

    .et-skeleton { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: var(--bg-panel); border-radius: 20px; border: 1px solid var(--glass-border); }
    .et-toast-wrap { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 8px; z-index: 9999; }
    .et-toast { background: var(--bg-panel); border: 1px solid var(--glass-border); color: var(--text-main); padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; box-shadow: 0 8px 20px rgba(0,0,0,.3); display: flex; align-items: center; gap: 8px; }

    @media (max-width: 900px) {
      .et-layout { flex-direction: column; }
      .et-sidebar { flex: none; width: 100%; max-width: 100%; max-height: none; }
    }
    `;

    function useInjectStyles() {
        useEffect(() => {
            if (!document.getElementById("et-styles-v3")) {
                const tag = document.createElement("style");
                tag.id = "et-styles-v3";
                tag.textContent = ET_STYLES;
                document.head.appendChild(tag);
            }
        }, []);
    }

    /* =========================================================================
       4. ХЕЛПЕРЫ
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
            .replace(/["'«»""]/g, "")
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
       5. ГЛАВНЫЙ КОМПОНЕНТ
       ========================================================================= */
    const ExcelTrainerLMS = ({ onBack }) => {
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
        const [headerSearch, setHeaderSearch] = useState("");
        const [isGenerating, setIsGenerating] = useState(false);

        const [lang, setLang] = useState("ru");
        const [hintsEnabled, setHintsEnabled] = useState(true);

        const [error, setError] = useState(false);
        const [examMode, setExamMode] = useState(false);
        const [attempts, setAttempts] = useState(0);
        const [answerStatus, setAnswerStatus] = useState("idle");
        const [copyState, setCopyState] = useState(false);
        const [toasts, setToasts] = useState([]);
        const [progress, setProgress] = useState({ level: 1, xp: 0, completedLessons: 0, streak: 0 });

        const retryCountRef = useRef(0);
        const abortRef = useRef(null);

        const t = UI_DICT[lang];

        const pushToast = useCallback((text, type = 'ok') => {
            const id = Date.now() + Math.random();
            setToasts((prev) => [...prev, { id, text, type }]);
            setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600);
        }, []);

        // Firebase Sync
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
            setOpenCats((prev) => new Set(prev).add(activeCategory));
            setAttempts(0);
            setAnswerStatus("idle");
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [activeFormulaName]);

        const toggleCat = (cat) => {
            setOpenCats((prev) => {
                const next = new Set(prev);
                next.has(cat) ? next.delete(cat) : next.add(cat);
                return next;
            });
        };

        const generateAIFormula = async (formulaName, isRetry = false) => {
            setInputValue("=");
            setShowSuccess(false);
            setIsGenerating(true);
            setCurrentLesson(null);
            setError(false);
            setAnswerStatus("idle");

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
              "table": [
                ["Заголовок1", "Заголовок2", "Заголовок3"],
                ["Значение", 100, "Значение"],
                ["Значение", 200, "Значение"]
              ],
              "expected": ["=ФУНКЦИЯ(B2:B3)"],
              "result": "Ожидаемый ответ вычисления"
            }
            КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
            1. В "syntax" пиши ТОЛЬКО примеры формул с абстрактными ячейками (Z1, X2).
            2. В "taskDesc" КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упоминать ячейку для вывода результата.
            3. "expected" должен содержать ВСЕ логически допустимые варианты.
            4. Экранируй внутренние кавычки в JSON.
            5. Тема задачи: "${randomTheme}". Поля "def", "table" и "taskDesc" должны быть ИМЕННО на эту тему!
            6. Значения в "table" должны математически давать "result".`;

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
                    if (!isRetry) {
                        return generateAIFormula(formulaName, true);
                    }
                    throw new Error("Некорректный урок от ИИ");
                }

                setCurrentLesson(parsedFormula);
                pushToast(t.toastLessonReady);
            } catch (err) {
                if (err.name === 'AbortError') return;
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

        const checkAnswer = () => {
            if (!currentLesson) return;

            const userForm = normalizeFormula(inputValue);
            const isCorrect = currentLesson.expected.some((exp) => normalizeFormula(exp) === userForm);

            if (isCorrect) {
                setShowSuccess(true);
                setAnswerStatus("idle");
                const diff = getDifficulty(activeFormulaName, currentLesson);
                let earned = getXp(currentLesson, diff);
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
                pushToast(t.toastCopied);
                setTimeout(() => setCopyState(false), 1500);
            }).catch(() => {});
        };

        const difficulty = currentLesson ? getDifficulty(activeFormulaName, currentLesson) : "medium";
        const xpForLesson = currentLesson ? getXp(currentLesson, difficulty) : XP_BY_DIFFICULTY[difficulty];

        // Глобальный поиск функций сверху
        const allFns = Object.entries(EXCEL_DATABASE).flatMap(([cat, fns]) => fns.map((f) => ({ f, cat })));
        const searchMatches = headerSearch.trim()
            ? allFns.filter((x) => x.f.toUpperCase().includes(headerSearch.trim().toUpperCase())).slice(0, 6)
            : [];

        return (
            <motion.div className="et-shell"
                initial={{ opacity: 0, y: 30 }}
                animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={shake ? { duration: 0.3 } : { duration: 0.5 }}>
                
                <div className="et-toast-wrap">
                    <AnimatePresence>
                        {toasts.map(toast => (
                            <motion.div key={toast.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="et-toast">
                                <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>{toast.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <header className="et-header">
                    <div className="et-header-left">
                        <div className="et-logo">📊</div>
                        <div>
                            <h2 className="et-title">{t.title}</h2>
                            <div className="et-subtitle">{t.subtitle}</div>
                        </div>
                    </div>

                    <div className="et-header-center">
                        <span className="icon">🔍</span>
                        <input value={headerSearch} onChange={e => setHeaderSearch(e.target.value)} placeholder={t.headerSearch} />
                        {searchMatches.length > 0 && (
                            <div className="et-gsearch-drop">
                                {searchMatches.map((m) => (
                                    <div key={m.f} className="et-gsearch-item" onMouseDown={() => { setActiveCategory(m.cat); setActiveFormulaName(m.f); setHeaderSearch(""); }}>
                                        {m.f} <span style={{ opacity: .5, fontWeight: 500 }}>· {m.cat}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="et-header-right">
                        <div className="et-langswitch">
                            {[{ id: "ru", label: "RU" }, { id: "en", label: "EN" }, { id: "uz", label: "UZ" }].map((item) => (
                                <button key={item.id} className={`et-lang-btn ${lang === item.id ? "active" : ""}`} onClick={() => setLang(item.id)}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="et-body">
                    {/* SIDEBAR */}
                    <div className="et-sidebar custom-scrollbar">
                        <div className="et-ai-card">
                            <div className="et-ai-title">✨ {t.magic}</div>
                            <input className="et-ai-input" type="text" value={customSearch} onChange={(e) => setCustomSearch(e.target.value)} placeholder={t.search} onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()} />
                            <button className="et-btn et-btn-primary" style={{ width: '100%' }} onClick={handleCustomSearch} disabled={isGenerating}>
                                {isGenerating ? t.genLoading : t.genBtn}
                            </button>
                        </div>

                        {categories.map((category) => {
                            const isOpen = openCats.has(category);
                            return (
                                <div className="et-cat" key={category}>
                                    <div className="et-cat-head" onClick={() => toggleCat(category)}>
                                        <div className="et-cat-head-left">
                                            <span className="et-cat-icon">{CATEGORY_ICONS[category] || "•"}</span>
                                            {category}
                                        </div>
                                        <span className={`et-cat-chevron ${isOpen ? "open" : ""}`}>▼</span>
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div className="et-cat-body">
                                                    {EXCEL_DATABASE[category].map((fName) => {
                                                        const isActive = activeFormulaName === fName;
                                                        const diff = DIFFICULTY_MAP[fName] || "medium";
                                                        return (
                                                            <button key={fName} disabled={isGenerating} className={`et-fn-btn ${isActive ? "active" : ""}`} onClick={() => { setActiveCategory(category); setActiveFormulaName(fName); }}>
                                                                {!isActive && <span className={`et-fn-dot ${diff}`} />}
                                                                {fName}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        <div className="et-progress-card">
                            <div className="et-progress-title">💎 {t.progressTitle}</div>
                            <div className="et-progress-row"><span>{t.level} {levelFromXp(progress.xp)}</span><span>{progress.xp % 500} / 500 {t.xp}</span></div>
                            <div className="et-progress-bar-track"><div className="et-progress-bar-fill" style={{ width: `${Math.min(100, Math.round(((progress.xp % 500) / 500) * 100))}%` }} /></div>
                        </div>
                    </div>

                    {/* MAIN */}
                    <div className="et-main">
                        {error ? (
                            <div className="et-error-card">
                                <div className="et-error-icon">⚠️</div>
                                <div className="et-error-title">{t.errorTitle}</div>
                                <div className="et-error-sub">{t.errorSub}</div>
                                <button className="et-retry-btn" onClick={() => generateAIFormula(activeFormulaName)}>{t.retry}</button>
                            </div>
                        ) : isGenerating || !currentLesson ? (
                            <div className="et-skeleton">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} style={{ fontSize: 40, marginBottom: 15 }}>✨</motion.div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>{t.loadingTitle} — {activeFormulaName}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{t.aiSub}</div>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                                
                                <div className="et-theory-card" style={{ marginBottom: '20px' }}>
                                    <div className="et-theory-top">
                                        <div>
                                            <h1 className="et-fn-name">{currentLesson.name}</h1>
                                            <div className="et-fn-en">{t.enVersion} <b>{currentLesson.enName}</b></div>
                                        </div>
                                        <div className="et-badges">
                                            <span className={`et-badge et-badge-diff-${difficulty}`}>★ {t[difficulty] || t.medium}</span>
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

                                <div className="et-practice-card">
                                    <div className="et-practice-head">🎯 {t.practice}</div>
                                    <p className="et-task-desc">{getTranslatedText(currentLesson.taskDesc, lang)}</p>

                                    <div className="et-table-wrap custom-scrollbar">
                                        <table className="et-table">
                                            <thead>
                                                <tr>
                                                    <th className="et-corner"></th>
                                                    {currentLesson.table[0].map((_, i) => <th key={i}>{getColumnLetter(i)}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentLesson.table.map((row, rIdx) => (
                                                    <tr key={rIdx}>
                                                        <td className="et-rownum">{rIdx + 1}</td>
                                                        {row.map((cell, cIdx) => (
                                                            <td key={cIdx}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className={`et-formula-bar ${answerStatus === "wrong" ? "wrong" : ""} ${showSuccess ? "correct" : ""}`}>
                                        <div className="fx">fx</div>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => { const v = e.target.value; setInputValue(v === "" ? "=" : v.toUpperCase()); if (answerStatus !== 'idle') setAnswerStatus('idle'); }}
                                            disabled={showSuccess}
                                            onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                                        />
                                    </div>

                                    {answerStatus === "wrong" && !showSuccess && <div className="et-formula-status bad">⚠ {t.formulaBad}</div>}

                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="et-success-card">
                                                <div>
                                                    <h4 className="et-success-title">✓ {t.successMsg}</h4>
                                                    <span className="et-success-sub">{t.resultMsg} <b>{currentLesson.result}</b></span>
                                                </div>
                                                <div className="et-success-xp">+{xpForLesson} XP ✨</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="et-actions">
                                        {!showSuccess ? (
                                            <>
                                                <button className="et-btn et-action-secondary" onClick={() => generateAIFormula(activeFormulaName)} disabled={isGenerating}>
                                                    ↻ {t.btnAnother}
                                                </button>
                                                <button className="et-btn et-action-primary" onClick={checkAnswer}>
                                                    ✓ {t.btnCheck}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="et-btn et-action-secondary" onClick={() => generateAIFormula(activeFormulaName)}>
                                                    ↻ {t.btnAnother}
                                                </button>
                                                <button className="et-btn et-action-primary" onClick={() => {
                                                    const list = EXCEL_DATABASE[activeCategory] || Object.values(EXCEL_DATABASE)[0];
                                                    const nextName = list[(list.indexOf(activeFormulaName) + 1) % list.length];
                                                    setActiveFormulaName(nextName);
                                                }}>
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
})();
