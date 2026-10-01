const { useState, useEffect, useRef, useCallback } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Необходимое количество решенных задач для перехода к следующей функции
const REQUIRED_MASTERY_STREAK = 2;

/* =========================================================================
   1. ПОЛНАЯ БАЗА ДАННЫХ ФУНКЦИЙ EXCEL
   ========================================================================= */
const EXCEL_DATABASE = {
    "Математические": [
        "СУММ", "СУММЕСЛИ", "СУММЕСЛИМН", "ОКРУГЛ", "ОКРУГЛВВЕРХ", "ОКРУГЛВНИЗ", "ОКРУГЛТ", 
        "ПРОИЗВЕД", "ОСТАТ", "КОРЕНЬ", "СТЕПЕНЬ", "СЛЧИС", "СЛМЕЖДУ", "ЦЕЛОЕ", "ОТБР", "ЧАСТНОЕ", 
        "СУММПРОИЗВ", "АБС", "ЗНАК", "ЧЁТН", "НЕЧЁТ", "ФАКТР", "ПИ", "РИМСКОЕ", "АРАБСКОЕ"
    ],
    "Динамические массивы": [
        "ПРОСМОТРX", "ФИЛЬТР", "УНИК", "СОРТ", "СОРТПО", "ПОСЛЕДОВ", "СЛМАССИВ", 
        "ТЕКСТДО", "ТЕКСТПОСЛЕ", "ТЕКСТРАЗДЕЛ", "ВСТРОКУ", "ВСТОЛБЕЦ", "ВЫБОРСТОЛБЦОВ", "ВЫБОРСТРОК"
    ],
    "Поиск и ссылки": [
        "ВПР", "ГПР", "ИНДЕКС", "ПОИСКПОЗ", "ПОИСКПОЗX", "СМЕЩ", "ДВССЫЛ", 
        "СТРОКА", "СТРОКИ", "СТОЛБЕЦ", "СТОЛБЦЫ", "ПРОСМОТР", "ВЫБОР", "ТРАНСП", "АДРЕС", "ГИПЕРССЫЛКА", "ФОРМУЛАТЕКСТ"
    ],
    "Логические": [
        "ЕСЛИ", "И", "ИЛИ", "ЕСЛИОШИБКА", "ЕСНД", "НЕ", "ИСТИНА", "ЛОЖЬ", "ЕСЛИМН", "ПЕРЕКЛЮЧ", "ИСКЛИЛИ"
    ],
    "Текстовые": [
        "СЦЕПИТЬ", "СЦЕП", "ОБЪЕДИНИТЬ", "ЛЕВСИМВ", "ПРАВСИМВ", "ПСТР", "ДЛСТР", 
        "НАЙТИ", "ПОИСК", "ЗАМЕНИТЬ", "ПОДСТАВИТЬ", "ПРОПИСН", "СТРОЧН", "ПРОПНАЧ", 
        "СЖПРОБЕЛЫ", "ТЕКСТ", "ЗНАЧЕН", "СОВПАД", "ПОВТОР", "СИМВОЛ", "КОДСИМВ", "ПЕЧСИМВ"
    ],
    "Дата и время": [
        "СЕГОДНЯ", "ТДАТА", "ДЕНЬ", "МЕСЯЦ", "ГОД", "ДАТА", "ДЕНЬНЕД", "ЧАС", "МИНУТЫ", "СЕКУНДЫ", "ВРЕМЯ", 
        "РАБДЕНЬ", "РАБДЕНЬ.МЕЖД", "ЧИСТРАБДНИ", "ЧИСТРАБДНИ.МЕЖД", "ДОЛЯГОДА", "НОМНЕДЕЛИ", "НОМНЕДЕЛИ.ISO", 
        "ДАТАМЕС", "КОНМЕСЯЦ", "РАЗНДАТ", "ДАТАЗНАЧ", "ВРЕМЗНАЧ"
    ],
    "Статистические": [
        "СРЗНАЧ", "СРЗНАЧЕСЛИ", "СРЗНАЧЕСЛИМН", "МАКС", "МИН", "МАКСЕСЛИ", "МИНЕСЛИ", 
        "СЧЁТ", "СЧЁТЕСЛИ", "СЧЁТЕСЛИМН", "СЧЁТЗ", "СЧИТАТЬПУСТОТЫ", "МЕДИАНА", "МОДА", "МОДА.ОДН", 
        "НАИБОЛЬШИЙ", "НАИМЕНЬШИЙ", "РАНГ", "РАНГ.РВ", "СРГЕОМ", "СРГАРМ", "ДИСП", "СТАНДОТКЛОН", "КВАРТИЛЬ", "ПЕРСЕНТИЛЬ", "КОРРЕЛ"
    ],
    "Финансовые": [
        "ПЛТ", "БС", "КПЕР", "СТАВКА", "ПРПЛТ", "ОСПЛТ", "ЧПС", "ВНДОХ", "ЭФФЕКТ", "НОМИНАЛ", "АМОРТИЗ"
    ],
    "Базы данных": [
        "БДСУММ", "БДСРЗНАЧ", "БДМАКС", "БДМИН", "БДСЧЁТ", "БДСЧЁТА", "БДПРОИЗВЕД", "БДИЗВЛЕЧЬ"
    ],
    "Информационные": [
        "ЕПУСТО", "ЕЧИСЛО", "ЕТЕКСТ", "ЕНЕТЕКСТ", "ЕЛОГИЧ", "ЕОШИБКА", "ЕОШ", "ЕНД", 
        "ТИП", "ТИП.ОШИБКИ", "ЯЧЕЙКА", "ЛИСТ", "ЛИСТЫ", "Ч"
    ],
    "Инженерные": [
        "ДЕС.В.ДВ", "ДЕС.В.ШЕСТН", "ДЕС.В.ВОСЬМ", "ДВ.В.ДЕС", "ДВ.В.ШЕСТН", 
        "ШЕСТН.В.ДЕС", "ШЕСТН.В.ДВ", "ПРЕОБР", "ДЕЛЬТА", "ПОРОГ"
    ]
};

const CATEGORY_ICONS_SVG = {
    "Математические":       { iconName: "Bolt",     color: "#f59e0b" },
    "Динамические массивы": { iconName: "Layers",   color: "#22d3ee" },
    "Поиск и ссылки":       { iconName: "Search",   color: "#3b82f6" },
    "Логические":           { iconName: "Toggle",   color: "#10b981" },
    "Текстовые":            { iconName: null,       color: "#ec4899" },
    "Дата и время":         { iconName: "Clock",    color: "#14b8a6" },
    "Статистические":       { iconName: "Chart",    color: "#6366f1" },
    "Финансовые":           { iconName: "Coin",     color: "#eab308" },
    "Базы данных":          { iconName: "Database", color: "#64748b" },
    "Информационные":       { iconName: "Info",     color: "#0ea5e9" },
    "Инженерные":           { iconName: "Wrench",   color: "#f97316" },
};

const DIFFICULTY_MAP = {
    СУММ:"easy", СУММЕСЛИ:"medium", СУММЕСЛИМН:"hard", ОКРУГЛ:"easy", ОКРУГЛВВЕРХ:"easy", ОКРУГЛВНИЗ:"easy", ОКРУГЛТ:"medium",
    ПРОИЗВЕД:"easy", ОСТАТ:"easy", КОРЕНЬ:"easy", СТЕПЕНЬ:"easy", СЛЧИС:"easy", СЛМЕЖДУ:"easy", ЦЕЛОЕ:"easy", ОТБР:"easy", ЧАСТНОЕ:"easy",
    СУММПРОИЗВ:"hard", АБС:"easy", ЗНАК:"easy", ЧЁТН:"easy", НЕЧЁТ:"easy", ФАКТР:"medium", ПИ:"easy", РИМСКОЕ:"medium", АРАБСКОЕ:"medium",
    ПРОСМОТРX:"medium", ФИЛЬТР:"medium", УНИК:"medium", СОРТ:"medium", СОРТПО:"hard", ПОСЛЕДОВ:"medium", СЛМАССИВ:"hard",
    ТЕКСТДО:"easy", ТЕКСТПОСЛЕ:"easy", ТЕКСТРАЗДЕЛ:"medium", ВСТРОКУ:"hard", ВСТОЛБЕЦ:"hard", ВЫБОРСТОЛБЦОВ:"hard", ВЫБОРСТРОК:"hard",
    ВПР:"medium", ГПР:"medium", ИНДЕКС:"hard", ПОИСКПОЗ:"hard", ПОИСКПОЗX:"hard", СМЕЩ:"hard", ДВССЫЛ:"hard",
    СТРОКА:"easy", СТРОКИ:"easy", СТОЛБЕЦ:"easy", СТОЛБЦЫ:"easy", ПРОСМОТР:"hard", ВЫБОР:"medium", ТРАНСП:"medium", АДРЕС:"hard", ГИПЕРССЫЛКА:"easy", ФОРМУЛАТЕКСТ:"easy",
    ЕСЛИ:"easy", И:"easy", ИЛИ:"easy", ЕСЛИОШИБКА:"medium", ЕСНД:"medium", НЕ:"easy", ИСТИНА:"easy", ЛОЖЬ:"easy", ЕСЛИМН:"medium", ПЕРЕКЛЮЧ:"medium", ИСКЛИЛИ:"medium",
    СЦЕПИТЬ:"easy", СЦЕП:"easy", ОБЪЕДИНИТЬ:"medium", ЛЕВСИМВ:"easy", ПРАВСИМВ:"easy", ПСТР:"medium", ДЛСТР:"easy",
    НАЙТИ:"medium", ПОИСК:"medium", ЗАМЕНИТЬ:"medium", ПОДСТАВИТЬ:"medium", ПРОПИСН:"easy", СТРОЧН:"easy", ПРОПНАЧ:"easy",
    СЖПРОБЕЛЫ:"easy", ТЕКСТ:"medium", ЗНАЧЕН:"easy", СОВПАД:"medium", ПОВТОР:"easy", СИМВОЛ:"medium", КОДСИМВ:"medium", ПЕЧСИМВ:"hard",
    СЕГОДНЯ:"easy", ТДАТА:"easy", ДЕНЬ:"easy", МЕСЯЦ:"easy", ГОД:"easy", ДАТА:"easy", ДЕНЬНЕД:"medium", ЧАС:"easy", МИНУТЫ:"easy", СЕКУНДЫ:"easy", ВРЕМЯ:"easy",
    РАБДЕНЬ:"medium", "РАБДЕНЬ.МЕЖД":"hard", ЧИСТРАБДНИ:"medium", "ЧИСТРАБДНИ.МЕЖД":"hard", ДОЛЯГОДА:"hard", НОМНЕДЕЛИ:"medium", "НОМНЕДЕЛИ.ISO":"medium",
    ДАТАМЕС:"medium", КОНМЕСЯЦ:"medium", РАЗНДАТ:"medium", ДАТАЗНАЧ:"medium", ВРЕМЗНАЧ:"medium",
    СРЗНАЧ:"easy", СРЗНАЧЕСЛИ:"medium", СРЗНАЧЕСЛИМН:"hard", МАКС:"easy", МИН:"easy", МАКСЕСЛИ:"medium", МИНЕСЛИ:"medium",
    СЧЁТ:"easy", СЧЁТЕСЛИ:"medium", СЧЁТЕСЛИМН:"hard", СЧЁТЗ:"easy", СЧИТАТЬПУСТОТЫ:"easy", МЕДИАНА:"medium", МОДА:"medium", "МОДА.ОДН":"medium",
    НАИБОЛЬШИЙ:"medium", НАИМЕНЬШИЙ:"medium", РАНГ:"medium", "РАНГ.РВ":"medium", СРГЕОМ:"hard", СРГАРМ:"hard", ДИСП:"hard", СТАНДОТКЛОН:"hard", КВАРТИЛЬ:"hard", ПЕРСЕНТИЛЬ:"hard", КОРРЕЛ:"hard",
    ПЛТ:"hard", БС:"hard", КПЕР:"hard", СТАВКА:"hard", ПРПЛТ:"hard", ОСПЛТ:"hard", ЧПС:"hard", ВНДОХ:"hard", ЭФФЕКТ:"medium", НОМИНАЛ:"medium", АМОРТИЗ:"hard",
    БДСУММ:"hard", БДСРЗНАЧ:"hard", БДМАКС:"hard", БДМИН:"hard", БДСЧЁТ:"hard", БДСЧЁТА:"hard", БДПРОИЗВЕД:"hard", БДИЗВЛЕЧЬ:"hard",
    ЕПУСТО:"easy", ЕЧИСЛО:"easy", ЕТЕКСТ:"easy", ЕНЕТЕКСТ:"easy", ЕЛОГИЧ:"easy", ЕОШИБКА:"medium", ЕОШ:"medium", ЕНД:"medium",
    ТИП:"medium", "ТИП.ОШИБКИ":"medium", ЯЧЕЙКА:"hard", ЛИСТ:"easy", ЛИСТЫ:"easy", Ч:"easy",
    "ДЕС.В.ДВ":"medium", "ДЕС.В.ШЕСТН":"medium", "ДЕС.В.ВОСЬМ":"medium", "ДВ.В.ДЕС":"medium", "ДВ.В.ШЕСТН":"medium",
    "ШЕСТН.В.ДЕС":"medium", "ШЕСТН.В.ДВ":"medium", ПРЕОБР:"hard", ДЕЛЬТА:"medium", ПОРОГ:"medium"
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
        successMsg: "Формула написана верно! ", resultMsg: "Результат вычисления:",
        btnAnother: "Другая задача", btnHint: "Подсказка", btnExam: "Экзамен", btnCheck: "Проверить",
        globalSearchPlaceholder: "Поиск по всем функциям...",
        copy: "Копировать", copied: "Скопировано",
        easy: "Легко", medium: "Средне", hard: "Сложно",
        xp: "XP", level: "Уровень",
        progressTitle: "Прокачай свои навыки", progressSub: "Открывай новые функции и становись мастером Excel",
        hintLevel1: "Что нужно найти?", hintLevel2: "Какую функцию использовать?", hintLevel3: "Начните формулу так:",
        showSolution: "Показать решение", hintOf: "Подсказка",
        nextTask: "Следующая задача", nextFunction: "Следующая функция", repeatTheory: "Повторить теорию",
        taskDone: "Задание выполнено", incorrectMsg: "Пока не верно, попробуйте ещё раз",
        loadingTitle: "ИИ создаёт урок", errorTitle: "Не удалось создать урок", errorSub: "Проверьте связь и попробуйте снова",
        retry: "Повторить", attempts: "Попыток", formulaOk: "Формула правильная", formulaBad: "Проверьте формулу",
        notFoundInDb: "Функции нет в локальной базе.", createWithAI: "Создать урок с помощью ИИ",
        toastLessonReady: "Урок создан", toastCopied: "Формула скопирована",
        masteryTitle: "Функция успешно освоена!",
        btnReinforce: "Закрепить навык",
        streakStatus: "Прогресс освоения:",
        student: "Ученик",
        totalXp: "Всего XP",
        solvedTasks: "Решено",
        streak: "Серия",
        rankNovice: "Новичок",
        rankAnalyst: "Аналитик",
        rankMaster: "Мастер Excel",
        nextLvlGoal: "До след. уровня"
    },
    en: {
        title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
        magic: "AI Magic", search: "Search function (e.g. VLOOKUP)...",
        genLoading: "Creating magic...", genBtn: "Generate lesson",
        aiTitle: "Preparing materials for", aiSub: "AI is writing a unique task and table",
        theory: "Theory", defTitle: "Definition", enVersion: "English version:",
        syntaxTitle: "Syntax examples", practice: "Practice",
        successMsg: "Formula is correct! ", resultMsg: "Calculation result:",
        btnAnother: "Another task", btnHint: "Hint", btnExam: "Exam", btnCheck: "Check",
        globalSearchPlaceholder: "Search all functions...",
        copy: "Copy", copied: "Copied",
        easy: "Easy", medium: "Medium", hard: "Hard",
        xp: "XP", level: "Level",
        progressTitle: "Level up your skills", progressSub: "Unlock new functions and become an Excel master",
        hintLevel1: "What do you need to find?", hintLevel2: "Which function should you use?", hintLevel3: "Start the formula like this:",
        showSolution: "Show solution", hintOf: "Hint",
        nextTask: "Next task", nextFunction: "Next function", repeatTheory: "Review theory",
        taskDone: "Task completed", incorrectMsg: "Not quite, try again",
        loadingTitle: "AI is building the lesson", errorTitle: "Couldn't generate the lesson", errorSub: "Check your connection and try again",
        retry: "Retry", attempts: "Attempts", formulaOk: "Formula looks correct", formulaBad: "Check your formula",
        notFoundInDb: "This function isn't in the local database.", createWithAI: "Generate lesson with AI",
        toastLessonReady: "Lesson ready", toastCopied: "Formula copied",
        masteryTitle: "Function mastered!",
        btnReinforce: "Practice again",
        streakStatus: "Mastery progress:",
        student: "Student",
        totalXp: "Total XP",
        solvedTasks: "Solved",
        streak: "Streak",
        rankNovice: "Novice",
        rankAnalyst: "Analyst",
        rankMaster: "Excel Master",
        nextLvlGoal: "To next level"
    },
    uz: {
        title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
        magic: "ИИ Сеҳри", search: "Функцияни қидириш (мас. ВПР)...",
        genLoading: "Сеҳр яратилмоқда...", genBtn: "Дарсни яратиш",
        aiTitle: "Материаллар тайёрланмоқда:", aiSub: "ИИ ноёб вазифа ва жадвал ёзмоқда",
        theory: "Назария", defTitle: "Таъриф", enVersion: "Инглизча версияси:",
        syntaxTitle: "Синтаксис мисоллари", practice: "Амалиёт",
        successMsg: "Формула тўғри ёзилган! ", resultMsg: "Ҳисоблаш натижаси:",
        btnAnother: "Бошқа вазифа", btnHint: "Ёрдам", btnExam: "Имтиҳон", btnCheck: "Текшириш",
        globalSearchPlaceholder: "Барча функцияларни қидириш...",
        copy: "Нусха олиш", copied: "Нусха олинди",
        easy: "Осон", medium: "Ўртача", hard: "Мураккаб",
        xp: "XP", level: "Даража",
        progressTitle: "Кўникмаларингизни оширинг", progressSub: "Янги функцияларни очинг ва Excel устаси бўлинг",
        hintLevel1: "Нимани топиш керак?", hintLevel2: "Қайси функцияни ишлатиш керак?", hintLevel3: "Формулани шундай бошланг:",
        showSolution: "Ечимни кўрсатиш", hintOf: "Ёрдам",
        nextTask: "Кейинги вазифа", nextFunction: "Кейинги функция", repeatTheory: "Назарияни такрорлаш",
        taskDone: "Вазифа бажарилди", incorrectMsg: "Ҳали тўғри эмас, яна уриниб кўринг",
        loadingTitle: "ИИ дарсни яратмоқда", errorTitle: "Дарсни яратиб бўлмади", errorSub: "Алоқани текшириб, яна уриниб кўринг",
        retry: "Такрорлаш", attempts: "Уринишлар", formulaOk: "Формула тўғри", formulaBad: "Формулани текширинг",
        notFoundInDb: "Функция локал базада йўқ.", createWithAI: "ИИ билан дарс яратиш",
        toastLessonReady: "Дарс тайёр", toastCopied: "Формула нусха олинди",
        masteryTitle: "Функция муваффақиятли ўзлаштирилди!",
        btnReinforce: "Малакани мустаҳкамлаш",
        streakStatus: "Ўзлаштириш жараёни:",
        student: "Ўқувчи",
        totalXp: "Жами XP",
        solvedTasks: "Бажарилди",
        streak: "Серия",
        rankNovice: "Бошловчи",
        rankAnalyst: "Таҳлилчи",
        rankMaster: "Excel Устаси",
        nextLvlGoal: "Кейинги даражагача"
    }
};

/* =========================================================================
   3. CSS — СТИЛИ ИНТЕРФЕЙСА (МЯГКИЙ ТЕМНЫЙ СТИЛЬ - SOFT DARK SLATE)
   ========================================================================= */
const ET_STYLES = `
.et-shell{--et-bg:#0b1220;--et-panel:#111a2b;--et-panel2:#162238;--et-card:#121d30;--et-elev:#1a2941;--et-text:#f3f6fb;--et-muted:#8fa0ba;--et-line:rgba(255,255,255,.085);--et-purple:#8b5cf6;--et-blue:#3b82f6;--et-cyan:#22d3ee;--et-green:#22c983;--et-yellow:#f6b93b;--et-red:#ef6472;--et-shadow:0 26px 80px rgba(0,0,0,.34);width:min(1480px,calc(100vw - 28px));margin:14px auto;padding:0;border:1px solid var(--et-line);border-radius:28px;background:linear-gradient(145deg,rgba(17,26,43,.98),rgba(8,14,26,.985));color:var(--et-text);box-shadow:var(--et-shadow);overflow:hidden;position:relative;font-family:inherit}
.et-shell.theme-light,html.light .et-shell,body.light .et-shell,[data-theme='light'] .et-shell,.light .et-shell{--et-bg:#f4f6fb;--et-panel:#fff;--et-panel2:#f6f8fc;--et-card:#fbfcff;--et-elev:#eef2f8;--et-text:#172033;--et-muted:#6d7a91;--et-line:rgba(20,32,53,.095);--et-shadow:0 24px 70px rgba(47,55,78,.12);background:linear-gradient(145deg,#fff,#f4f6fb)}
.et-shell *{box-sizing:border-box}.et-shell button,.et-shell input{font:inherit}.et-shell button{cursor:pointer}.et-shell button:disabled{opacity:.48;cursor:not-allowed}.et-shell :is(button,input):focus-visible{outline:2px solid var(--et-cyan);outline-offset:2px}

.et-header{min-height:82px;padding:16px 20px;display:grid;grid-template-columns:minmax(230px,auto) minmax(260px,1fr) auto;align-items:center;gap:18px;border-bottom:1px solid var(--et-line);background:rgba(255,255,255,.018);position:relative;z-index:120}
.et-header-left{display:flex;align-items:center;gap:12px;min-width:0}.et-back-btn,.et-nav-toggle{width:40px;height:40px;border:1px solid var(--et-line);border-radius:12px;background:var(--et-card);color:var(--et-muted);display:grid;place-items:center;transition:.18s}.et-back-btn:hover,.et-nav-toggle:hover{color:var(--et-text);background:var(--et-elev);transform:translateY(-1px)}
.et-logo{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(135deg,var(--et-green),#0ea5e9 60%,var(--et-purple));box-shadow:0 9px 24px rgba(34,201,131,.23)}
.et-title{margin:0;color:var(--et-text);font-size:19px;font-weight:850;letter-spacing:-.35px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.et-subtitle{margin-top:2px;color:var(--et-muted);font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.et-header-center{min-width:0}.et-header-right{display:flex;align-items:center;gap:9px}.et-nav-toggle{display:none}
.et-gsearch{position:relative;width:100%;z-index:130}.et-gsearch input{width:100%;height:44px;padding:0 42px 0 40px;border-radius:13px;border:1px solid var(--et-line);background:var(--et-card);color:var(--et-text);font-size:13px;outline:none;transition:.18s}.et-gsearch input:focus{border-color:rgba(34,211,238,.55);box-shadow:0 0 0 3px rgba(34,211,238,.1);background:var(--et-panel)}.et-gsearch-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--et-muted);display:flex;pointer-events:none}
.et-gsearch-drop{position:absolute;top:calc(100% + 8px);left:0;right:0;max-height:330px;overflow:auto;padding:7px;border:1px solid var(--et-line);border-radius:15px;background:var(--et-panel);box-shadow:0 22px 55px rgba(0,0,0,.35);z-index:999}.et-gsearch-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 11px;border-radius:10px;color:var(--et-text);font-size:12.5px;font-weight:750;cursor:pointer;transition:.15s}.et-gsearch-item:hover{background:rgba(34,211,238,.085);color:var(--et-cyan)}.et-gsearch-cat{padding:3px 7px;border-radius:6px;background:var(--et-elev);color:var(--et-muted);font-size:9.5px;font-weight:700}
.et-langswitch{display:flex;gap:3px;padding:4px;border:1px solid var(--et-line);border-radius:12px;background:var(--et-card)}.et-lang-btn{height:32px;min-width:38px;padding:0 9px;border:0;border-radius:8px;background:transparent;color:var(--et-muted);font-size:10.5px;font-weight:850;transition:.15s}.et-lang-btn.active{background:linear-gradient(135deg,var(--et-purple),var(--et-blue));color:#fff;box-shadow:0 5px 14px rgba(99,102,241,.24)}

.et-body{display:grid;grid-template-columns:286px minmax(0,1fr);min-height:700px}.et-sidebar{border-right:1px solid var(--et-line);padding:16px;background:rgba(255,255,255,.012);display:flex;flex-direction:column;gap:13px;min-width:0;position:relative;z-index:80}
.et-ai-card{padding:15px;border:1px solid var(--et-line);border-radius:17px;background:linear-gradient(145deg,rgba(139,92,246,.09),rgba(34,211,238,.035));position:relative;overflow:hidden}.et-ai-card:before{content:"";position:absolute;width:130px;height:130px;right:-55px;top:-65px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.25),transparent 68%);pointer-events:none}.et-ai-title{display:flex;align-items:center;gap:7px;margin-bottom:10px;color:var(--et-text);font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.65px;position:relative}.et-ai-input{width:100%;height:42px;padding:0 12px;border:1px solid var(--et-line);border-radius:11px;background:var(--et-bg);color:var(--et-text);outline:none;font-size:12.5px;position:relative}.et-ai-input:focus{border-color:rgba(139,92,246,.55);box-shadow:0 0 0 3px rgba(139,92,246,.09)}.et-generate-btn{width:100%;height:42px;margin-top:9px;border:0;border-radius:11px;color:#07150f;background:linear-gradient(135deg,#4ade80,#22d3ee);font-size:12px;font-weight:900;box-shadow:0 7px 18px rgba(34,201,131,.16);transition:.18s}.et-generate-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 24px rgba(34,201,131,.24)}
.et-cat-list{flex:1;min-height:180px;max-height:470px;overflow:auto;padding-right:3px;scrollbar-width:thin}.et-cat-list::-webkit-scrollbar,.et-gsearch-drop::-webkit-scrollbar{width:5px}.et-cat-list::-webkit-scrollbar-thumb,.et-gsearch-drop::-webkit-scrollbar-thumb{background:var(--et-line);border-radius:8px}
.et-cat{margin-bottom:7px;border:1px solid transparent;border-radius:13px;background:transparent;overflow:hidden;transition:.15s}.et-cat:hover{border-color:var(--et-line);background:rgba(255,255,255,.018)}.et-cat-head{min-height:43px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;user-select:none}.et-cat-head-left{display:flex;align-items:center;gap:9px;color:var(--et-muted);font-size:10.2px;font-weight:820;text-transform:uppercase;letter-spacing:.45px;min-width:0}.et-cat-icon{width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:var(--et-card);flex:none}.et-cat-letters{font-size:10px;font-weight:900}.et-cat-chevron{color:var(--et-muted);font-size:11px;transition:.18s}.et-cat-chevron.open{transform:rotate(180deg)}
.et-cat-body{padding:0 8px 9px;display:flex;flex-wrap:wrap;gap:6px}.et-fn-btn{min-height:30px;padding:5px 9px;border:1px solid var(--et-line);border-radius:9px;background:var(--et-card);color:var(--et-text);display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:750;transition:.15s}.et-fn-btn:hover:not(:disabled){border-color:rgba(34,211,238,.42);transform:translateY(-1px)}.et-fn-btn.active{border-color:transparent;color:#fff;background:linear-gradient(135deg,var(--et-purple),var(--et-blue));box-shadow:0 6px 15px rgba(99,102,241,.2)}.et-fn-dot{width:5px;height:5px;border-radius:50%;flex:none}.et-fn-dot.easy{background:var(--et-green)}.et-fn-dot.medium{background:var(--et-yellow)}.et-fn-dot.hard{background:var(--et-red)}

.et-progress-card{padding:13px;border:1px solid var(--et-line);border-radius:16px;background:var(--et-card);position:relative;overflow:hidden}.et-progress-card:after{content:"";position:absolute;width:100px;height:100px;right:-55px;bottom:-60px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.14),transparent 70%);pointer-events:none}.et-user-profile{display:flex;align-items:center;gap:10px;margin-bottom:11px;position:relative}.et-user-avatar{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;background:linear-gradient(135deg,var(--et-purple),var(--et-cyan));color:#fff;font-size:14px;font-weight:900;box-shadow:0 6px 16px rgba(139,92,246,.22)}.et-user-meta{min-width:0;flex:1}.et-user-email{color:var(--et-text);font-size:11.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.et-user-rank{margin-top:2px;display:flex;align-items:center;gap:4px;color:var(--et-cyan);font-size:9.5px;font-weight:750}.et-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}.et-stat-chip{padding:7px 4px;border:1px solid var(--et-line);border-radius:9px;background:rgba(255,255,255,.018);text-align:center}.et-stat-val{color:var(--et-text);font-size:11px;font-weight:900}.et-stat-lbl{margin-top:1px;color:var(--et-muted);font-size:8.5px;font-weight:650}.et-progress-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;color:var(--et-muted);font-size:9.5px;font-weight:700}.et-progress-bar-track{height:6px;border-radius:8px;background:var(--et-elev);overflow:hidden}.et-progress-bar-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,var(--et-purple),var(--et-cyan));position:relative}.et-progress-bar-fill:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);animation:et-shimmer-bar 2.3s linear infinite}

.et-main{min-width:0;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.012),transparent 35%)}.et-lesson-stack{display:flex;flex-direction:column;gap:15px}.et-lesson-hero{padding:20px 21px;border:1px solid var(--et-line);border-radius:20px;background:linear-gradient(120deg,rgba(139,92,246,.095),rgba(34,211,238,.035) 50%,rgba(34,201,131,.035));display:flex;align-items:flex-start;justify-content:space-between;gap:20px;position:relative;overflow:hidden}.et-lesson-hero:after{content:"";position:absolute;width:240px;height:240px;right:-110px;top:-135px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.18),transparent 70%);pointer-events:none}.et-hero-main{min-width:0;position:relative}.et-hero-kicker{display:flex;align-items:center;gap:7px;margin-bottom:6px;color:var(--et-cyan);font-size:9.5px;font-weight:850;text-transform:uppercase;letter-spacing:.8px}.et-fn-name{margin:0;color:var(--et-text);font-size:clamp(30px,3.6vw,47px);font-weight:900;letter-spacing:-1.7px;line-height:1}.et-fn-en{margin-top:7px;color:var(--et-muted);font-size:12px;font-weight:650}.et-fn-en b{color:var(--et-green);font-weight:850}.et-badges{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.et-badge{min-height:27px;padding:5px 9px;border-radius:8px;display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}.et-badge-diff-easy,.et-badge-theory{background:rgba(34,201,131,.1);color:#4ade9a}.et-badge-diff-medium{background:rgba(246,185,59,.12);color:#f6c65d}.et-badge-diff-hard{background:rgba(239,100,114,.12);color:#fb8591}.et-badge-xp{background:rgba(139,92,246,.13);color:#c8b7ff}.et-hero-metrics{display:grid;grid-template-columns:repeat(2,minmax(90px,1fr));gap:8px;min-width:220px;position:relative}.et-hero-metric{padding:10px;border:1px solid var(--et-line);border-radius:12px;background:rgba(8,14,26,.22)}.theme-light .et-hero-metric{background:rgba(255,255,255,.62)}.et-hero-metric span{display:block;color:var(--et-muted);font-size:8.5px;font-weight:750;text-transform:uppercase;letter-spacing:.45px}.et-hero-metric strong{display:block;margin-top:3px;color:var(--et-text);font-size:14px;font-weight:900}

.et-workspace-grid{display:grid;grid-template-columns:minmax(340px,.78fr) minmax(520px,1.22fr);gap:15px;align-items:start}.et-theory-card,.et-practice-card,.et-skeleton-card,.et-error-card{border:1px solid var(--et-line);border-radius:20px;background:var(--et-panel);box-shadow:0 10px 32px rgba(0,0,0,.07)}.et-theory-card{padding:20px;position:sticky;top:14px}.et-practice-card{padding:20px}.et-section-head,.et-practice-top,.et-theory-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.et-section-title,.et-practice-title{display:flex;align-items:center;gap:8px;color:var(--et-text);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.65px}.et-theory-top{display:none}
.et-def-box{padding:15px;border:1px solid var(--et-line);border-radius:14px;background:var(--et-card);margin-bottom:13px}.et-box-label{display:flex;align-items:center;gap:6px;color:var(--et-muted);font-size:9.5px;font-weight:850;text-transform:uppercase;letter-spacing:.55px}.et-def-text{margin-top:8px;color:var(--et-text);font-size:13px;line-height:1.68;font-weight:520;white-space:pre-line}
.et-syntax-box{border:1px solid rgba(34,211,238,.13);border-radius:14px;background:#08111e;overflow:hidden}.et-syntax-header{min-height:42px;padding:8px 11px;border-bottom:1px solid rgba(255,255,255,.065);background:rgba(255,255,255,.025);display:flex;align-items:center;justify-content:space-between;gap:9px}.et-syntax-header-left,.et-syntax-title-wrap,.et-terminal-dots{display:flex;align-items:center}.et-syntax-header-left{gap:9px}.et-syntax-title-wrap{gap:6px}.et-terminal-dots{gap:5px}.et-terminal-dot{width:7px;height:7px;border-radius:50%}.et-dot-red{background:#ef6472}.et-dot-yellow{background:#f6b93b}.et-dot-green{background:#22c983}.et-syntax-badge{padding:2px 5px;border-radius:5px;background:rgba(34,211,238,.1);color:#38cfee;font-size:7.5px;font-weight:850;text-transform:uppercase}.et-copy-btn{height:29px;padding:0 8px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.04);color:#8fa0ba;display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:800}.et-copy-btn:hover{color:#fff;background:rgba(34,211,238,.1)}.et-copy-btn.copied{color:#4ade9a;border-color:rgba(34,201,131,.25)}.et-syntax-content{padding:11px 12px;display:flex;flex-direction:column;gap:5px;overflow-x:auto}.et-syntax-line{display:flex;align-items:flex-start;gap:10px;font-family:'Fira Code','Cascadia Code',Consolas,monospace;font-size:11.5px;line-height:1.6}.et-line-num{width:18px;flex:none;text-align:right;color:#40516c;font-size:9.5px}.et-line-code{color:#dbe6f5;white-space:pre-wrap;word-break:break-word}.tok-fn{color:#38cfee;font-weight:750}.tok-range{color:#f6c65d;font-weight:650}.tok-str{color:#4ade9a}.tok-op{color:#90a0b8}.tok-paren{color:#c3a7ff;font-weight:700}.tok-num{color:#f48ac0}

.et-task-text{margin:0 0 14px;padding:13px 14px;border-left:3px solid var(--et-green);border-radius:0 11px 11px 0;background:rgba(34,201,131,.055);color:var(--et-text);font-size:13px;font-weight:610;line-height:1.6}.et-table-wrap{margin-bottom:14px;overflow:auto;border:1px solid var(--et-line);border-radius:13px;background:var(--et-card)}.et-table{width:100%;border-collapse:separate;border-spacing:0;text-align:center;color:var(--et-text);font-size:11.5px}.et-table th,.et-table td{min-width:72px;padding:9px 8px;border-right:1px solid var(--et-line);border-bottom:1px solid var(--et-line)}.et-table th{background:var(--et-elev);color:var(--et-muted);font-weight:800}.et-table td{background:var(--et-card);transition:.12s}.et-table td:not(.et-rownum):hover{background:rgba(59,130,246,.07)}.et-table .et-corner,.et-table td.et-rownum{min-width:36px;width:36px;background:var(--et-elev);color:var(--et-muted);font-weight:800}.et-table td.et-selected{background:rgba(59,130,246,.17)!important;box-shadow:inset 0 0 0 2px var(--et-blue)}
.et-formula-bar{position:relative;margin-top:4px}.et-formula-bar .fx{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--et-green);font-size:15px;font-weight:950;font-style:italic;pointer-events:none}.et-formula-bar input{width:100%;height:52px;padding:0 15px 0 46px;border:1px solid var(--et-line);border-radius:13px;background:var(--et-bg);color:var(--et-text);font:700 14px/1 'Fira Code',Consolas,monospace;outline:none;transition:.18s}.et-formula-bar input:focus{border-color:rgba(34,211,238,.55);box-shadow:0 0 0 3px rgba(34,211,238,.09)}.et-formula-bar.wrong input{border-color:rgba(239,100,114,.75);box-shadow:0 0 0 3px rgba(239,100,114,.08)}.et-formula-bar.correct input{border-color:rgba(34,201,131,.75);box-shadow:0 0 0 3px rgba(34,201,131,.08)}.et-formula-status{margin:7px 2px 0;display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:800}.et-formula-status.ok{color:#4ade9a}.et-formula-status.bad{color:#fb8591}
.et-hint-box{margin-top:11px;padding:13px 14px;border:1px solid rgba(246,185,59,.24);border-radius:12px;background:rgba(246,185,59,.07);color:#f5cf76;font-size:11.5px;line-height:1.6}.et-hint-box code{padding:2px 6px;border-radius:5px;background:rgba(0,0,0,.2);color:#f6c65d;font-family:'Fira Code',monospace;font-weight:750}.et-hint-actions{display:flex;gap:8px;margin-top:9px;flex-wrap:wrap}.et-hint-link{padding:5px 8px;border:0;border-radius:7px;background:rgba(246,185,59,.1);color:#f6c65d;font-size:10px;font-weight:850}
.et-success-card{margin-top:11px;padding:13px 14px;border:1px solid rgba(34,201,131,.25);border-radius:13px;background:linear-gradient(135deg,rgba(34,201,131,.09),rgba(34,211,238,.04));display:flex;align-items:center;gap:10px;flex-wrap:wrap}.et-success-title{margin:0;color:#4ade9a;font-size:12px;font-weight:900}.et-success-sub{color:var(--et-muted);font-size:10.5px}.et-success-sub b{color:var(--et-text)}.et-success-xp{margin-left:auto;padding:6px 9px;border-radius:8px;background:rgba(139,92,246,.11);color:#c8b7ff;font-size:10.5px;font-weight:900}.et-mastery-banner{margin-top:2px;padding:8px 10px;border:1px solid rgba(34,201,131,.22);border-radius:9px;display:flex;justify-content:space-between;gap:10px;color:#4ade9a;font-size:9.5px;font-weight:800}
.et-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}.et-action-btn{min-height:42px;padding:8px 10px;border-radius:11px;border:1px solid var(--et-line);display:flex;align-items:center;justify-content:center;gap:7px;font-size:10.5px;font-weight:850;transition:.16s}.et-action-btn:hover:not(:disabled){transform:translateY(-1px)}.et-action-secondary{background:var(--et-card);color:var(--et-text)}.et-action-warning{background:rgba(246,185,59,.08);color:#f6c65d;border-color:rgba(246,185,59,.2)}.et-action-primary{border-color:transparent;background:linear-gradient(135deg,var(--et-green),#0ea5e9);color:#04120c;box-shadow:0 7px 18px rgba(34,201,131,.15)}

.et-skeleton-card{padding:24px;min-height:500px}.et-skel-title{display:flex;align-items:center;gap:8px;margin-bottom:18px;color:var(--et-cyan);font-size:11px;font-weight:850;text-transform:uppercase}.et-skel-line{height:13px;margin-bottom:10px;border-radius:7px;background:linear-gradient(90deg,var(--et-card) 25%,var(--et-elev) 38%,var(--et-card) 62%);background-size:400% 100%;animation:et-shimmer 1.35s ease infinite}.et-error-card{min-height:380px;padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:9px}.et-error-title{color:var(--et-text);font-size:16px;font-weight:900}.et-error-sub{color:var(--et-muted);font-size:11.5px}.et-retry-btn{margin-top:7px;padding:9px 15px;border:0;border-radius:10px;background:linear-gradient(135deg,var(--et-purple),var(--et-blue));color:#fff;font-size:11px;font-weight:850}
.et-toast-wrap{position:fixed;top:18px;right:18px;z-index:100000;display:flex;flex-direction:column;gap:7px}.et-toast{max-width:330px;padding:10px 12px;border:1px solid var(--et-line);border-radius:11px;background:var(--et-panel);color:var(--et-text);box-shadow:0 16px 40px rgba(0,0,0,.25);font-size:11px;font-weight:750}

.theme-light .et-syntax-box,html.light .et-shell .et-syntax-box,body.light .et-shell .et-syntax-box{background:#f7f9fc;border-color:#dce3ed}.theme-light .et-syntax-header,html.light .et-shell .et-syntax-header,body.light .et-shell .et-syntax-header{background:#eef2f7;border-color:#dce3ed}.theme-light .et-line-code,html.light .et-shell .et-line-code,body.light .et-shell .et-line-code{color:#263248}.theme-light .et-copy-btn,html.light .et-shell .et-copy-btn,body.light .et-shell .et-copy-btn{border-color:#dce3ed;background:#fff;color:#64748b}
.et-nav-overlay{display:none}
.et-icon-spin{animation:et-icon-spin 1.4s linear infinite}.et-icon-pulse{animation:et-icon-pulse 1.6s ease-in-out infinite}.et-icon-bounce{transition:transform .2s cubic-bezier(.34,1.56,.64,1)}button:hover .et-icon-bounce{transform:translateY(-2px) rotate(-8deg)}.et-icon-rotate-hover{transition:transform .35s ease}button:hover .et-icon-rotate-hover{transform:rotate(180deg)}
@keyframes et-icon-spin{to{transform:rotate(360deg)}}@keyframes et-icon-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}@keyframes et-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}@keyframes et-shimmer-bar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

@media(max-width:1180px){.et-workspace-grid{grid-template-columns:1fr}.et-theory-card{position:relative;top:auto}.et-hero-metrics{min-width:200px}}
@media(max-width:900px){.et-shell{width:calc(100vw - 16px);margin:8px auto;border-radius:20px}.et-header{grid-template-columns:1fr auto;padding:12px}.et-header-center{grid-column:1/-1;grid-row:2}.et-title{font-size:16px}.et-subtitle{font-size:10.5px}.et-nav-toggle{display:grid}.et-body{display:block;min-height:650px}.et-sidebar{position:fixed;left:8px;top:8px;bottom:8px;width:min(330px,calc(100vw - 46px));transform:translateX(calc(-100% - 24px));transition:transform .22s ease;border:1px solid var(--et-line);border-radius:18px;background:var(--et-panel);box-shadow:0 24px 70px rgba(0,0,0,.38);z-index:10020;overflow:auto}.et-sidebar.open{transform:none}.et-nav-overlay{display:block;position:fixed;inset:0;background:rgba(3,8,18,.58);backdrop-filter:blur(3px);z-index:10010}.et-cat-list{max-height:none}.et-main{padding:12px}.et-lesson-hero{padding:17px}.et-hero-metrics{min-width:180px}.et-workspace-grid{grid-template-columns:1fr}}
@media(max-width:620px){.et-header{gap:10px}.et-header-left{gap:8px}.et-back-btn,.et-nav-toggle{width:36px;height:36px}.et-logo{width:38px;height:38px;border-radius:11px}.et-header-right{gap:6px}.et-lang-btn{min-width:32px;padding:0 6px}.et-lesson-hero{display:block}.et-hero-metrics{margin-top:14px;grid-template-columns:repeat(4,1fr);min-width:0}.et-hero-metric{padding:8px 6px}.et-hero-metric strong{font-size:12px}.et-fn-name{font-size:32px}.et-theory-card,.et-practice-card{padding:15px;border-radius:16px}.et-actions{grid-template-columns:1fr}.et-table th,.et-table td{min-width:66px;padding:8px 7px}.et-toast-wrap{left:10px;right:10px;top:10px}.et-toast{max-width:none}}
@media(max-width:420px){.et-subtitle{display:none}.et-header{padding:10px}.et-hero-metrics{grid-template-columns:repeat(2,1fr)}.et-progress-card{display:none}}
@media(prefers-reduced-motion:reduce){.et-shell *{animation:none!important;transition:none!important}}
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

function getFormulaStart(lesson, defaultName) {
    const fnName = lesson?.name || defaultName || "";
    if (fnName) {
        return `=${fnName.trim().toUpperCase()}(`;
    }
    const rawExpected = String(lesson?.expected?.[0] || "").trim();
    const match = rawExpected.match(/^=\s*([A-ZА-ЯЁ0-9_.]+)\s*\(/i);
    if (match && match) {
        return `=${match.toUpperCase()}(`;
    }
    return "=";
}

/* =========================================================================
   ИКОНКИ (заменяют эмодзи)
   ========================================================================= */
const Icon = {
    Sparkle: (p) => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/>
        </svg>
    ),
    Search: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="14" height="14" {...p}>
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Bolt: (p) => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...p}>
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>
        </svg>
    ),
    Target: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" {...p}>
            <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>
        </svg>
    ),
    Flame: (p) => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...p}>
            <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-3 2 1 3 4 3 6a6 6 0 1 1-12 0c0-4 2-7 4-10z"/>
        </svg>
    ),
    Star: (p) => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...p}>
            <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3 1.2-6.9-5-4.9 6.9-1L12 2z"/>
        </svg>
    ),
    Warning: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    ),
    Book: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...p}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
    ),
    Check: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    Copy: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
    ),
    Lock: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...p}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),
    Bulb: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...p}>
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.5.4.9 1.1 1 1.8v.5h6v-.5c.1-.7.5-1.4 1-1.8A7 7 0 0 0 12 2z"/>
        </svg>
    ),
    Trophy: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...p}>
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/>
            <path d="M17 5h3a3 3 0 0 1-3 5M7 5H4a3 3 0 0 0 3 5"/>
        </svg>
    ),
    Refresh: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...p}>
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
    ),
    Eye: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...p}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    Grid: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...p}>
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
    ),
    Clock: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
        </svg>
    ),
    Chart: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/>
        </svg>
    ),
    Coin: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <circle cx="12" cy="12" r="9"/><path d="M9.5 15a2.5 2.5 0 0 0 5 0M9.5 9a2.5 2.5 0 0 1 5 0"/><line x1="12" y1="6" x2="12" y2="18"/>
        </svg>
    ),
    Database: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>
        </svg>
    ),
    Info: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="11"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
    ),
        Gear: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.63.77 1.05 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    ),
    Layers: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
        </svg>
    ),
    Toggle: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <rect x="1" y="7" width="22" height="10" rx="5"/>
            <circle cx="16" cy="12" r="3" fill="currentColor" stroke="none"/>
        </svg>
    ),
    Wrench: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...p}>
            <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L2 19l3 3 7.1-7.1a4 4 0 0 0 5.6-5.6l-2.5 2.5-2-2 2.5-2.5z"/>
        </svg>
    ),
};

function renderHighlightedFormula(lineText) {
    if (!lineText) return null;
    
    const tokenRegex = /(".*?"|'[^']*'|[A-ZА-ЯЁ0-9_.]+(?=\()|[A-ZА-ЯЁ]+\d+(?::[A-ZА-ЯЁ]+\d+)?|\b\d+(?:\.\d+)?\b|[=;+\-*/^&><%*]|\(|\)|[^\s\(\)=;+\-*/^&><%*]+|\s+)/g;
    const tokens = lineText.match(tokenRegex) || [lineText];

    return tokens.map((tok, idx) => {
        if (/^(".*"|'.*')$/.test(tok)) {
            return <span key={idx} className="tok-str">{tok}</span>;
        }
        if (/^[A-ZА-ЯЁ0-9_.]+$/.test(tok) && idx + 1 < tokens.length && tokens[idx + 1] === '(') {
            return <span key={idx} className="tok-fn">{tok}</span>;
        }
        if (/^[A-ZА-ЯЁ]+\d+(?::[A-ZА-ЯЁ]+\d+)?$/i.test(tok)) {
            return <span key={idx} className="tok-range">{tok}</span>;
        }
        if (/^\d+(\.\d+)?$/.test(tok)) {
            return <span key={idx} className="tok-num">{tok}</span>;
        }
        if (tok === '(' || tok === ')') {
            return <span key={idx} className="tok-paren">{tok}</span>;
        }
        if (/^[=;+\-*/^&><%*]$/.test(tok)) {
            return <span key={idx} className="tok-op">{tok}</span>;
        }
        return <span key={idx}>{tok}</span>;
    });
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
        ? allFns.filter((x) => x.f.toUpperCase().includes(q.trim().toUpperCase())).slice(0, 10)
        : [];

    return (
        <div className="et-gsearch">
            <span className="et-gsearch-icon"><Icon.Search /></span>
            <input
                value={q}
                placeholder={t.globalSearchPlaceholder}
                onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
            />
            {open && matches.length > 0 && (
                <div className="et-gsearch-drop">
                    {matches.map((m) => {
                        const diff = DIFFICULTY_MAP[m.f] || "medium";
                        return (
                            <div 
                                key={m.f} 
                                className="et-gsearch-item" 
                                onMouseDown={() => { onPick(m.cat, m.f); setQ(""); setOpen(false); }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className={`et-fn-dot ${diff}`} />
                                    <span>{m.f}</span>
                                </div>
                                <span className="et-gsearch-cat">{m.cat}</span>
                            </div>
                        );
                    })}
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
                            <span className="et-cat-icon" style={{ color: CATEGORY_ICONS_SVG[category]?.color }}>
                                  {CATEGORY_ICONS_SVG[category]?.iconName
                                      ? React.createElement(Icon[CATEGORY_ICONS_SVG[category].iconName])
                                      : <span className="et-cat-letters">Aa</span>}
                              </span>
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

/* =========================================================================
   ОБНОВЛЕННЫЙ КОМПОНЕНТ КАРТОЧКИ СТАТИСТИКИ И ПРОФИЛЯ С АНИМАЦИЯМИ
   ========================================================================= */
function ProgressCard({ t, progress, userInfo }) {
    const xpIntoLevel = progress.xp % 500, pct = Math.min(100, Math.round((xpIntoLevel / 500) * 100));
    const userInitial = (userInfo.displayName || userInfo.email || "U").charAt(0).toUpperCase();
    const rankTitle = progress.level >= 5 ? t.rankMaster : progress.level >= 3 ? t.rankAnalyst : t.rankNovice;

    return (
        <motion.div className="et-progress-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="et-user-profile">
                <div className="et-user-avatar">{userInitial}</div>
                <div className="et-user-meta">
                    <div className="et-user-email" title={userInfo.email || userInfo.displayName}>{userInfo.displayName || userInfo.email || t.student}</div>
                    <div className="et-user-rank"><Icon.Star style={{color:'#f6b93b'}}/><span>{t.level} {progress.level} · {rankTitle}</span></div>
                </div>
            </div>
            <div className="et-stats-grid">
                <div className="et-stat-chip"><div className="et-stat-val">{progress.xp}</div><div className="et-stat-lbl">{t.totalXp}</div></div>
                <div className="et-stat-chip"><div className="et-stat-val">{progress.completedLessons}</div><div className="et-stat-lbl">{t.solvedTasks}</div></div>
                <div className="et-stat-chip"><div className="et-stat-val">{progress.streak || 0}</div><div className="et-stat-lbl">{t.streak}</div></div>
            </div>
            <div className="et-progress-row"><span>{t.nextLvlGoal}</span><span>{xpIntoLevel}/500</span></div>
            <div className="et-progress-bar-track"><motion.div className="et-progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .7 }}/></div>
        </motion.div>
    );
}

function LoadingSkeleton({ t, name }) {
    return (
        <div className="et-skeleton-card">
            <div className="et-skel-title">
                <span style={{display:'flex', color:'var(--accent-cyan)'}}><Icon.Sparkle className="et-icon-spin" /></span>
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
            <div className="et-error-icon" style={{color:'#ef4444', display:'flex', justifyContent:'center'}}><Icon.Warning width="34" height="34" /></div>
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
                    <motion.div
                        key={tItem.id}
                        className="et-toast"
                        initial={{ opacity: 0, x: 60, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
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

function SyntaxBlock({ syntax, t, onCopy, copied }) {
    const lines = (syntax || "").split("\n").filter(l => l.trim() !== "");

    return (
        <div className="et-syntax-box">
            <div className="et-syntax-header">
                <div className="et-syntax-header-left">
                    <div className="et-terminal-dots">
                        <span className="et-terminal-dot et-dot-red" />
                        <span className="et-terminal-dot et-dot-yellow" />
                        <span className="et-terminal-dot et-dot-green" />
                    </div>
                    <div className="et-syntax-title-wrap">
                        <span className="et-box-label"><Icon.Bolt style={{color:'#f59e0b'}}/> {t.syntaxTitle}</span>
                        <span className="et-syntax-badge">Formula</span>
                    </div>
                </div>
                <button
                    className={`et-copy-btn ${copied ? "copied" : ""}`}
                    onClick={onCopy}
                    title={t.copy}
                >
                    <span style={{display:'flex'}}>{copied ? <Icon.Check style={{color:'var(--accent-green)'}}/> : <Icon.Copy/>}</span>
                    <span>{copied ? t.copied : t.copy}</span>
                </button>
            </div>
            <div className="et-syntax-content">
                {lines.map((line, idx) => (
                    <div className="et-syntax-line" key={idx}>
                        <span className="et-line-num">{String(idx + 1).padStart(2, "0")}</span>
                        <div className="et-line-code">
                            {renderHighlightedFormula(line)}
                        </div>
                    </div>
                ))}
            </div>
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

    // Счетчик закрепления текущей функции
    const [masteryCount, setMasteryCount] = useState(0);

    const [lang, setLang] = useState("ru");

    // Данные пользователя
    const [userInfo, setUserInfo] = useState({
        email: window.auth?.currentUser?.email || "",
        displayName: window.auth?.currentUser?.displayName || ""
    });

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
        const updateTheme = () => setTheme(detectTheme());
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

    const [hintsEnabled, setHintsEnabled] = useState(true);
    const [error, setError] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [answerStatus, setAnswerStatus] = useState("idle");
    const [selectedCell, setSelectedCell] = useState(null);
    const [copyState, setCopyState] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [progress, setProgress] = useState({ level: 1, xp: 0, completedLessons: 0, streak: 0 });
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const t = UI_DICT[lang];

    const pushToast = useCallback((text) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, text }]);
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600);
    }, []);

    useEffect(() => {
        const user = window.auth?.currentUser;
        if (user) {
            setUserInfo({
                email: user.email || "",
                displayName: user.displayName || (user.email ? user.email.split('@')[0] : "")
            });
        }
        const uid = user?.uid;
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
        setMasteryCount(0);
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
            "продажи билетов на музыкальный концерт",
            "инвестиционный портфель и расчет процентов",
            "анализ складских запасов и логистики"
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

       const prompt = `Ты опытный и понятный преподаватель Microsoft Excel для школьников и студентов.
Пользователь изучает функцию: "${formulaName}".
Создай интерактивную практическую задачу по этой функции.

Верни ТОЛЬКО чистый валидный JSON (без markdown и без кавычек \`\`\`) строго по схеме:
{
  "name": "${formulaName}",
  "enName": "АНГЛИЙСКОЕ_НАЗВАНИЕ",
  "difficulty": "easy | medium | hard",
  "xp": число от 50 до 200,
  "syntax": "=${formulaName}(A2; 2)\\n=${formulaName}(B5:B10; \\">10\\")",
  "def": {
     "ru": "Развернутое объяснение функции (3-5 предложений): назначение, пример из жизни и практический совет.",
     "en": "Detailed explanation of the function in English.",
     "uz": "Функция ҳақида кенгроқ маълумот (Кирилл алифбосида)."
  },
  "taskDesc": {
     "ru": "Простая, ясная инструкция для ученика (2-3 предложения). Сформулируй по схеме: 1) Назови точные названия столбцов таблицы, данные из которых нужны. 2) Скажи понятным языком, что именно с ними нужно сделать.",
     "en": "Clear student task mentioning exact table column headers and the exact action required.",
     "uz": "Ўқувчи учун тушунарли топшириқ: жадвалдаги устунлар номини аниқ кўрсатиб, нима қилиш кераклигини тушунтиринг."
  },
  "steps": {
     "ru": [
       "Посмотри на колонку с [Точное название столбца]",
       "Примени функцию ${formulaName} к нужным строкам",
       "Введи результат в строку формулы fx ниже"
     ],
     "en": [
       "Look at the column [Column Name]",
       "Apply ${formulaName} to the target range",
       "Type the formula into the fx bar below"
     ],
     "uz": [
       "[Устун номи] устунига қаранг",
       "Керакли қаторларга ${formulaName} функциясини қўлланг",
       "Формулани пастдаги fx қаторига киритинг"
     ]
  },
  "hint": {
     "ru": "Короткая наводка на логику аргументов без готовой формулы.",
     "en": "A short hint without the full formula.",
     "uz": "Тайёр формуласиз қисқа йўналтирувчи маслаҳат."
  },
  "table": [
    ["Название", "Показатель 1", "Показатель 2"],
    ["Элемент 1", 100.45, 20],
    ["Элемент 2", 200.78, 40]
  ],
  "expected": ["=${formulaName}(B2:B3)"],
  "result": "Ожидаемый ответ вычисления"
}

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. ПОНЯТНОСТЬ: Не используй сухой канцелярит.
2. ЗАГОЛОВКИ: ОБЯЗАТЕЛЬНО ссылайся на точные заголовки колонок из массива "table" в тексте задачи.
3. БЕЗ СПОЙЛЕРОВ В ТЕКСТЕ: Не пиши саму формулу и адреса ячеек (A1) в тексте задания (taskDesc, steps).
4. ШАГИ: В поле "steps" верни ровно 3 коротких шага.
5. ТЕМА ЗАДАЧИ: "${randomTheme}".
6. ТОЧНОСТЬ: Вычисления в "expected" и "result" должны быть абсолютно точными.
7. ЖЕСТКОЕ ПРАВИЛО ДЛЯ ПОЛЯ "syntax" (ПРИМЕРЫ СИНТАКСИСА):
   - ЗАПРЕЩЕНО писать текстовые пояснения аргументов (никаких слов "диапазон", "критерий", "range", "число" и т.д.).
   - ПИШИ ТОЛЬКО реальные адреса ячеек и конкретные цифры (ПРИМЕР ПРАВИЛЬНОГО ОТВЕТА: =${formulaName}(A1:A10) или =${formulaName}(B2; "Яблоки")).
   - ЗАПРЕТ НА СПОЙЛЕРЫ К ЗАДАЧЕ: Примеры синтаксиса ДОЛЖНЫ БЫТЬ АБСТРАКТНЫМИ и вообще НЕ ОТНОСИТЬСЯ к текущей таблице! Не используй слова и значения из сгенерированного массива "table" в поле "syntax".
   - ЯЗЫК: Имя функции в поле "syntax" всегда должно быть строго на том же языке, на котором оно было передано: ${formulaName}.`;
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

            if (Array.isArray(parsedFormula.table)) {
                parsedFormula.table = parsedFormula.table.map(row => 
                    row.map(cell => {
                        if (typeof cell === 'string' && cell.trim().startsWith('=')) {
                            return "";
                        }
                        return cell;
                    })
                );
            }

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
        if (fName === activeFormulaName) { setInputValue("="); setShowSuccess(false); generateAIFormula(fName); }
        else { setActiveCategory("Поиск ИИ"); setActiveFormulaName(fName); }
        setCustomSearch(""); setMobileNavOpen(false);
    };

    const pickFromSidebarOrSearch = (category, fName) => {
        setActiveCategory(category); setActiveFormulaName(fName); setMobileNavOpen(false);
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

            setMasteryCount((prev) => prev + 1);

            setProgress((prev) => {
                const nextXp = prev.xp + xpGain;
                const nextLevel = 1 + Math.floor(nextXp / 500);
                
                // Увеличиваем серию (streak)
                const next = { 
                    level: nextLevel, 
                    xp: nextXp, 
                    completedLessons: prev.completedLessons + 1, 
                    streak: (prev.streak || 0) + 1 
                };
                
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
            
            // Сбрасываем серию (streak) в ноль
            setProgress((prev) => {
                const next = { ...prev, streak: 0 };
                try {
                    const uid = window.auth?.currentUser?.uid;
                    if (uid && window.db) {
                        window.db.collection('users').doc(uid).set({ excelProgress: next }, { merge: true });
                    }
                } catch (e) {}
                return next;
            });

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
        if (!hintsEnabled) return;
        setHintLevel((prev) => Math.min(3, prev + 1));
    };

    const handleNextTask = () => generateAIFormula(activeFormulaName);

    const handleNextFunction = () => {
        const list = EXCEL_DATABASE[activeCategory] || Object.values(EXCEL_DATABASE)[0];
        const idx = list.indexOf(activeFormulaName);
        const nextName = list[(idx + 1) % list.length];
        setActiveFormulaName(nextName);
    };

    const difficulty = currentLesson ? getDifficulty(activeFormulaName, currentLesson) : "medium";
    const xpForLesson = currentLesson ? getXp(currentLesson, difficulty) : XP_BY_DIFFICULTY[difficulty];
    const hintStep3 = getFormulaStart(currentLesson, activeFormulaName);

    const isMastered = masteryCount >= REQUIRED_MASTERY_STREAK;

    return (
        <motion.div className={`et-shell theme-${theme}`} initial={{ opacity: 0, y: 20 }} animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }} transition={shake ? { duration: .28 } : { duration: .4 }}>
            <ToastStack toasts={toasts} />

            <header className="et-header">
                <div className="et-header-left">
                    <button className="et-back-btn" onClick={onBack} title="Назад" aria-label="Назад">←</button>
                    <div className="et-logo"><Icon.Grid /></div>
                    <div style={{minWidth:0}}><h2 className="et-title">{t.title}</h2><div className="et-subtitle">{t.subtitle}</div></div>
                </div>
                <div className="et-header-center"><GlobalSearch t={t} onPick={pickFromSidebarOrSearch} /></div>
                <div className="et-header-right"><LangSwitch lang={lang} setLang={setLang}/><button className="et-nav-toggle" onClick={() => setMobileNavOpen(true)} aria-label="Каталог функций"><Icon.Grid /></button></div>
            </header>

            <AnimatePresence>{mobileNavOpen && <motion.div className="et-nav-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMobileNavOpen(false)} />}</AnimatePresence>

            <div className="et-body">
                <aside className={`et-sidebar ${mobileNavOpen ? "open" : ""}`}>
                    <div className="et-ai-card">
                        <div className="et-ai-title"><Icon.Sparkle className="et-icon-pulse" style={{color:'var(--et-purple)'}}/>{t.magic}</div>
                        <input className="et-ai-input" value={customSearch} onChange={(e) => setCustomSearch(e.target.value)} placeholder={t.search} onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()}/>
                        <button className="et-generate-btn" onClick={handleCustomSearch} disabled={isGenerating}>{isGenerating ? t.genLoading : t.genBtn}</button>
                    </div>

                    <div className="et-cat-list">
                        <CategoryAccordion categories={categories} openCats={openCats} toggleCat={toggleCat} activeFormulaName={activeFormulaName} isGenerating={isGenerating} onPick={pickFromSidebarOrSearch}/>
                    </div>

                    <ProgressCard t={t} progress={progress} userInfo={userInfo}/>
                </aside>

                <main className="et-main">
                    {error ? <ErrorCard t={t} onRetry={() => generateAIFormula(activeFormulaName)}/> :
                    isGenerating || !currentLesson ? <LoadingSkeleton t={t} name={activeFormulaName}/> : (
                        <motion.div className="et-lesson-stack" key={activeFormulaName} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.28}}>
                            <section className="et-lesson-hero">
                                <div className="et-hero-main">
                                    <div className="et-hero-kicker"><Icon.Layers/>{activeCategory}</div>
                                    <h1 className="et-fn-name">{currentLesson.name}</h1>
                                    <div className="et-fn-en">{t.enVersion} <b>{currentLesson.enName}</b></div>
                                    <div className="et-badges"><DifficultyBadge difficulty={difficulty} t={t}/><span className="et-badge et-badge-xp"><Icon.Bolt/> {xpForLesson} {t.xp}</span>{!hintsEnabled && <span className="et-badge et-badge-diff-hard"><Icon.Lock/> {t.btnExam}</span>}</div>
                                </div>
                                <div className="et-hero-metrics">
                                    <div className="et-hero-metric"><span>{t.level}</span><strong>{progress.level}</strong></div>
                                    <div className="et-hero-metric"><span>{t.totalXp}</span><strong>{progress.xp}</strong></div>
                                    <div className="et-hero-metric"><span>{t.streak}</span><strong>{progress.streak || 0}</strong></div>
                                    <div className="et-hero-metric"><span>{t.streakStatus}</span><strong>{masteryCount}/{REQUIRED_MASTERY_STREAK}</strong></div>
                                </div>
                            </section>

                            <div className="et-workspace-grid">
                                <section className="et-theory-card">
                                    <div className="et-section-head"><div className="et-section-title"><Icon.Book style={{color:'var(--et-green)'}}/>{t.theory}</div><span className="et-badge et-badge-theory">{t.defTitle}</span></div>
                                    <div className="et-def-box"><div className="et-box-label"><Icon.Info/>{t.defTitle}</div><div className="et-def-text">{getTranslatedText(currentLesson.def, lang)}</div></div>
                                    <SyntaxBlock syntax={currentLesson.syntax} t={t} onCopy={handleCopySyntax} copied={copyState}/>
                                </section>

                                <section className="et-practice-card">
                                    <div className="et-practice-top"><div className="et-practice-title"><Icon.Target style={{color:'var(--et-green)'}}/>{t.practice}</div><span className="et-badge et-badge-xp">{t.attempts}: {attempts}</span></div>
                                    <p className="et-task-text">{getTranslatedText(currentLesson.taskDesc, lang)}</p>
                                    <ExcelTable table={currentLesson.table} selected={selectedCell} onSelectCell={setSelectedCell}/>

                                    <div className={`et-formula-bar ${answerStatus === "wrong" ? "wrong" : ""} ${showSuccess ? "correct" : ""}`}>
                                        <div className="fx">fx</div>
                                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value === "" ? "=" : e.target.value.toUpperCase())} disabled={showSuccess} onKeyDown={(e) => e.key === "Enter" && !showSuccess && checkAnswer()}/>
                                    </div>

                                    {answerStatus === "wrong" && !showSuccess && <div className="et-formula-status bad"><Icon.Warning/>{t.formulaBad}</div>}
                                    {showSuccess && <div className="et-formula-status ok"><Icon.Check/>{t.formulaOk}</div>}

                                    {!showSuccess && hintsEnabled && hintLevel > 0 && (
                                        <div className="et-hint-box">
                                            {hintLevel >= 1 && <div style={{display:'flex',alignItems:'center',gap:7}}><Icon.Bulb/>{t.hintLevel1}</div>}
                                            {hintLevel >= 2 && <div style={{marginTop:5,display:'flex',alignItems:'center',gap:7}}><Icon.Bulb/>{t.hintLevel2}{currentLesson.hint ? ` — ${getTranslatedText(currentLesson.hint, lang)}` : ""}</div>}
                                            {hintLevel >= 3 && <div style={{marginTop:5,display:'flex',alignItems:'center',gap:7}}><Icon.Bulb/>{t.hintLevel3} <code>{hintStep3}</code></div>}
                                            <div className="et-hint-actions">{hintLevel < 3 ? <button className="et-hint-link" onClick={handleHintClick}>{t.hintOf} {hintLevel + 1}/3</button> : <button className="et-hint-link" onClick={() => setInputValue(currentLesson.expected[0])}>{t.showSolution}</button>}</div>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div className="et-success-card" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                                                <div style={{flex:'1 1 220px'}}><h4 className="et-success-title"><Icon.Star/>{t.successMsg}</h4><span className="et-success-sub">{t.resultMsg} <b>{currentLesson.result}</b></span></div>
                                                <div className="et-success-xp">+{xpForLesson} XP</div>
                                                <div className="et-mastery-banner" style={!isMastered ? {borderColor:'rgba(246,185,59,.28)',color:'#f6c65d'} : undefined}>
                                                    <span style={{display:'flex',alignItems:'center',gap:5}}>{isMastered ? <Icon.Trophy/> : <Icon.Target/>}{isMastered ? t.masteryTitle : t.streakStatus}</span>
                                                    <span>{masteryCount}/{REQUIRED_MASTERY_STREAK}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="et-actions">
                                        {!showSuccess ? (
                                            <>
                                                <button className="et-action-btn et-action-secondary" onClick={() => generateAIFormula(activeFormulaName)} disabled={isGenerating}><Icon.Refresh className="et-icon-rotate-hover"/>{t.btnAnother}</button>
                                                {hintsEnabled && <button className="et-action-btn et-action-warning" onClick={handleHintClick} disabled={hintLevel >= 3}><Icon.Eye className="et-icon-bounce"/>{t.btnHint}{hintLevel > 0 && ` (${hintLevel}/3)`}</button>}
                                                <button className="et-action-btn et-action-primary" onClick={checkAnswer}>{t.btnCheck}</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="et-action-btn et-action-secondary" onClick={handleNextTask}><Icon.Refresh/>{isMastered ? t.btnAnother : `${t.btnReinforce} (${masteryCount}/${REQUIRED_MASTERY_STREAK})`}</button>
                                                {isMastered && <motion.button initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} className="et-action-btn et-action-primary" onClick={handleNextFunction}>{t.nextFunction} →</motion.button>}
                                            </>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </motion.div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
