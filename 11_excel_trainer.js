/**
 * ExcelTrainerLMS
 * ---------------------------------------------------------------------------
 * Логика строго сохранена. Визуальная структура и стили переписаны
 * для точного соответствия предоставленному эталонному макету (Dark Navy).
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;
    const { Button } = window;

    // ОГРОМНЫЙ СПИСОК ФУНКЦИЙ
    const EXCEL_DATABASE = {
        "Математические": ["СУММ", "СУММЕСЛИ", "СУММЕСЛИМН", "ОКРУГЛ", "ОКРУГЛВВЕРХ", "ОКРУГЛВНИЗ", "ПРОИЗВЕД", "ОСТАТ", "КОРЕНЬ", "СТЕПЕНЬ", "СЛЧИС", "ЦЕЛОЕ", "СУММПРОИЗВ", "АБС"],
        "Статистические": ["СРЗНАЧ", "СРЗНАЧЕСЛИ", "МАКС", "МИН", "СЧЁТ", "СЧЁТЕСЛИ", "СЧЁТЕСЛИМН", "СЧЁТЗ", "МЕДИАНА", "МОДА", "НАИБОЛЬШИЙ", "НАИМЕНЬШИЙ", "СЧИТАТЬПУСТОТЫ"],
        "Логические": ["ЕСЛИ", "И", "ИЛИ", "ЕСЛИОШИБКА", "НЕ", "ИСТИНА", "ЛОЖЬ", "ЕСЛИМН", "ЕПУСТО", "ЕЧИСЛО", "ЕТЕКСТ"],
        "Текстовые": ["СЦЕПИТЬ", "ЛЕВСИМВ", "ПРАВСИМВ", "ПСТР", "ДЛСТР", "НАЙТИ", "ПОИСК", "ЗАМЕНИТЬ", "ПОДСТАВИТЬ", "ПРОПИСН", "СТРОЧН", "СЖПРОБЕЛЫ", "ТЕКСТ"],
        "Дата и время": ["СЕГОДНЯ", "ТДАТА", "ДЕНЬ", "МЕСЯЦ", "ГОД", "ДАТА", "ДЕНЬНЕД", "ЧАС", "МИНУТЫ", "РАБДЕНЬ", "ДОЛЯГОДА", "НОМНЕДЕЛИ"],
        "Поиск и ссылки": ["ВПР", "ГПР", "ИНДЕКС", "ПОИСКПОЗ", "СМЕЩ", "ДВССЫЛ", "СТРОКА", "СТОЛБЕЦ", "ПРОСМОТР", "ВЫБОР", "ТРАНСП"]
    };

    // СЛОВАРЬ ПЕРЕВОДОВ ИНТЕРФЕЙСА
    const UI_DICT = {
        ru: {
            title: "Энциклопедия Excel", subtitle: "Умный тренажер функций с ИИ",
            magic: "МАГИЯ ИИ", search: "Поиск функции (напр. ВПР)...",
            genLoading: "Создаем магию...", genBtn: "Сгенерировать урок",
            aiTitle: "Готовим материалы для", aiSub: "ИИ пишет уникальную задачу и таблицу",
            theory: "ТЕОРИЯ", defTitle: "ОПРЕДЕЛЕНИЕ", enVersion: "Английская версия:",
            syntaxTitle: "ПРИМЕРЫ СИНТАКСИСА", practice: "ПРАКТИКА",
            successMsg: "Формула написана верно! 🎉", resultMsg: "Результат вычисления:",
            btnAnother: "🔄 ДРУГАЯ ЗАДАЧА", btnHint: "💡 ПОДСКАЗКА", btnExam: "🔒 ЭКЗАМЕН", btnCheck: "✓ ПРОВЕРИТЬ"
        },
        en: {
            title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
            magic: "AI MAGIC", search: "Search function (e.g. VLOOKUP)...",
            genLoading: "Creating magic...", genBtn: "Generate lesson",
            aiTitle: "Preparing materials for", aiSub: "AI is writing a unique task and table",
            theory: "THEORY", defTitle: "DEFINITION", enVersion: "English version:",
            syntaxTitle: "SYNTAX EXAMPLES", practice: "PRACTICE",
            successMsg: "Formula is correct! 🎉", resultMsg: "Calculation result:",
            btnAnother: "🔄 ANOTHER TASK", btnHint: "💡 HINT", btnExam: "🔒 EXAM", btnCheck: "✓ CHECK"
        },
        uz: {
            title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
            magic: "ИИ СЕҲРИ", search: "Функцияни қидириш (мас. ВПР)...",
            genLoading: "Сеҳр яратилмоқда...", genBtn: "Дарсни яратиш",
            aiTitle: "Материаллар тайёрланмоқда:", aiSub: "ИИ ноёб вазифа ва жадвал ёзмоқда",
            theory: "НАЗАРИЯ", defTitle: "ТАЪРИФ", enVersion: "Инглизча версияси:",
            syntaxTitle: "СИНТАКСИС МИСОЛЛАРИ", practice: "АМАЛИЁТ",
            successMsg: "Формула тўғри ёзилган! 🎉", resultMsg: "Ҳисоблаш натижаси:",
            btnAnother: "🔄 БОШҚА ВАЗИФА", btnHint: "💡 ЁРДАМ", btnExam: "🔒 ИМТИҲОН", btnCheck: "✓ ТЕКШИРИШ"
        }
    };

    // Цветовая палитра под новый дизайн
    const COLORS = {
        bgApp: '#141827',
        bgPanel: '#0F1524',
        bgCard: '#151C30',
        bgElement: '#1B233A',
        bgInput: '#0E1322',
        border: 'rgba(255,255,255,0.08)',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        cyan: '#38BDF8',
        blue: '#3B82F6',
        green: '#10B981',
        purple: '#8B5CF6'
    };

    const injectStyles = () => {
        if (document.getElementById('excel-lms-styles')) return;
        const style = document.createElement('style');
        style.id = 'excel-lms-styles';
        style.textContent = `
            .ex-app-wrapper * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
            .ex-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
            .ex-scroll::-webkit-scrollbar-track { background: transparent; }
            .ex-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            .ex-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.06), rgba(255,255,255,0.02)); background-size: 200% 100%; animation: exShimmer 1.5s infinite; }
            @keyframes exShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            .ex-sidebar-item { transition: all 0.2s; }
            .ex-sidebar-item:hover { background: rgba(255,255,255,0.05) !important; }
            @media (max-width: 900px) {
                .ex-main-layout { flex-direction: column !important; }
                .ex-sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid ${COLORS.border}; }
            }
        `;
        document.head.appendChild(style);
    };

    const ExcelTrainerLMS = ({ onBack }) => {
        useEffect(() => { injectStyles(); }, []);

        const categories = Object.keys(EXCEL_DATABASE);
        const [activeCategory, setActiveCategory] = useState(categories[0]);
        const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
        const [openCategories, setOpenCategories] = useState({ [categories[0]]: true });

        const [currentLesson, setCurrentLesson] = useState(null);
        const [inputValue, setInputValue] = useState("=");
        const [shake, setShake] = useState(false);
        const [showSuccess, setShowSuccess] = useState(false);
        const [customSearch, setCustomSearch] = useState("");
        const [isGenerating, setIsGenerating] = useState(false);
        const [genError, setGenError] = useState(null);

        const [lang, setLang] = useState('ru');
        const [hintsEnabled, setHintsEnabled] = useState(true);

        useEffect(() => {
            const uid = window.auth?.currentUser?.uid;
            if (!uid || !window.db) return;

            const unsub = window.db.collection('users').doc(uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setHintsEnabled(data.excelHintsEnabled !== false); 
                }
            });
            return () => unsub();
        }, []);

        useEffect(() => {
            generateAIFormula(activeFormulaName);
        }, [activeFormulaName]);

        const toggleCategory = (cat) => {
            setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
        };

        const generateAIFormula = async (formulaName) => {
            setInputValue("=");
            setShowSuccess(false);
            setIsGenerating(true);
            setCurrentLesson(null);
            setGenError(null);

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
              "difficulty": "Средне",
              "xp": 100,
              "syntax": "=ФУНКЦИЯ(Z1:Z10)\\n=ФУНКЦИЯ(Z1; \\"Текст\\"; X1:X10)",
              "def": {
                 "ru": "Подробное объяснение функции на русском. Пример из жизни.",
                 "en": "Explanation translated to English.",
                 "uz": "Функциянинг тушунтириши (Кирилл алифбосида)."
              },
              "taskDesc": {
                 "ru": "Напишите формулу, которая посчитает [ЧТО-ТО].",
                 "en": "Write a formula that calculates [SOMETHING].",
                 "uz": "Формула ёзинг (Кирилл алифбосида)."
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
            3. ЛОГИКА ОТВЕТА: Добавь ВСЕ правильные варианты в expected. Задача должна иметь однозначный ответ. Все значения таблицы должны математически соответствовать expected и result.
            4. ЭКРАНИРОВАНИЕ: В массиве "expected" экранируй внутренние кавычки.
            5. ЕДИНАЯ ТЕМА: Я задаю тебе тему: "${randomTheme}". Поля "def", "table" и "taskDesc" должны быть ИМЕННО на эту тему!
            6. ЗАПРЕТ ШАБЛОНОВ: Не используй слова "Иванов", "Петров", "Товар", если они не подходят.`;

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
                if (!parsedFormula.table || !parsedFormula.expected) throw new Error("Некорректный формат ИИ");
                
                setCurrentLesson(parsedFormula);
            } catch (error) {
                console.error("Ошибка:", error);
                setGenError(`Не удалось сгенерировать урок для ${formulaName}.`);
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
                setOpenCategories(prev => ({ ...prev, ["Поиск ИИ"]: true }));
            }
        };

        const checkAnswer = () => {
            if (!currentLesson) return;
            
            const formatFormula = (f) => {
                let str = String(f).trim().toUpperCase()
                    .replace(/\s/g, '') 
                    .replace(/,/g, ';') 
                    .replace(/["'«»“”]/g, ''); 
                    
                const ruToEn = {
                    'А':'A','В':'B','С':'C','Е':'E','Н':'H','К':'K',
                    'М':'M','О':'O','Р':'P','Т':'T','Х':'X','У':'Y'
                };
                return str.replace(/[АВСЕНКМОРТХУ]/g, match => ruToEn[match]);
            };
            
            const userForm = formatFormula(inputValue);
            const isCorrect = currentLesson.expected.some(exp => formatFormula(exp) === userForm);

            if (isCorrect) {
                setShowSuccess(true);
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 400);
            }
        };

        const getColumnLetter = (colIndex) => String.fromCharCode(65 + colIndex);

        const getTranslatedText = (obj, currentLang) => {
            if (!obj) return "";
            if (typeof obj === 'string') return obj;
            return obj[currentLang] || obj.ru || "";
        };

        return (
            <div className="ex-app-wrapper" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', background: COLORS.bgPanel, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${COLORS.border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                
                {/* HEADER */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '42px', height: '42px', background: `linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: `0 4px 15px rgba(56, 189, 248, 0.4)` }}>📊</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: COLORS.text, letterSpacing: '-0.5px' }}>{UI_DICT[lang].title}</h2>
                            <div style={{ fontSize: '12px', color: COLORS.textMuted, fontWeight: 500, marginTop: '2px' }}>{UI_DICT[lang].subtitle}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                        {[ { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' } ].map(item => {
                            const isActive = lang === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setLang(item.id)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '8px',
                                        background: isActive ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.blue})` : 'transparent',
                                        border: 'none', color: isActive ? '#fff' : COLORS.textMuted,
                                        fontWeight: 800, fontSize: '11px', cursor: 'pointer', outline: 'none',
                                        transition: 'all 0.2s', boxShadow: isActive ? `0 4px 10px rgba(139, 92, 246, 0.4)` : 'none'
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </header>

                {/* MAIN LAYOUT */}
                <div className="ex-main-layout" style={{ display: 'flex', alignItems: 'stretch' }}>
                    
                    {/* СИДБАР (ЛЕВАЯ КОЛОНКА) */}
                    <div className="ex-sidebar ex-scroll" style={{ width: '340px', padding: '24px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '800px', overflowY: 'auto' }}>
                        
                        {/* Магия ИИ */}
                        <div style={{ background: COLORS.bgElement, border: `1px solid ${COLORS.border}`, padding: '16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '14px' }}>✨</span>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: COLORS.text, letterSpacing: '0.5px' }}>{UI_DICT[lang].magic}</span>
                            </div>
                            <input
                                type="text"
                                value={customSearch}
                                onChange={(e) => setCustomSearch(e.target.value)}
                                placeholder={UI_DICT[lang].search}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: COLORS.bgInput, color: COLORS.text, marginBottom: '12px', fontSize: '13px', outline: 'none' }}
                            />
                            <button 
                                onClick={handleCustomSearch} 
                                disabled={isGenerating} 
                                style={{ width: '100%', height: '38px', borderRadius: '8px', background: COLORS.cyan, border: 'none', color: '#000', fontWeight: 800, fontSize: '12px', cursor: isGenerating ? 'wait' : 'pointer' }}
                            >
                                {isGenerating ? UI_DICT[lang].genLoading : UI_DICT[lang].genBtn}
                            </button>
                        </div>

                        {/* Аккордеон категорий */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categories.map(category => {
                                const isOpen = openCategories[category];
                                return (
                                    <div key={category}>
                                        <div 
                                            className="ex-sidebar-item"
                                            onClick={() => toggleCategory(category)}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: COLORS.bgElement, borderRadius: '8px', cursor: 'pointer', border: `1px solid ${COLORS.border}` }}
                                        >
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{category}</span>
                                            <span style={{ fontSize: '10px', color: COLORS.textMuted }}>{isOpen ? '▼' : '▶'}</span>
                                        </div>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0' }}>
                                                        {EXCEL_DATABASE[category].map(fName => {
                                                            const isActive = activeFormulaName === fName;
                                                            return (
                                                                <button
                                                                    key={fName}
                                                                    onClick={() => { setActiveCategory(category); setActiveFormulaName(fName); }}
                                                                    disabled={isGenerating}
                                                                    style={{
                                                                        textAlign: 'left', padding: '10px 16px', borderRadius: '6px',
                                                                        background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                                        border: 'none', color: isActive ? COLORS.cyan : COLORS.text,
                                                                        fontWeight: isActive ? 700 : 500, fontSize: '13px', cursor: isGenerating ? 'wait' : 'pointer',
                                                                        borderLeft: isActive ? `3px solid ${COLORS.cyan}` : '3px solid transparent',
                                                                        transition: 'all 0.2s', outline: 'none'
                                                                    }}
                                                                >
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
                        </div>
                    </div>

                    {/* КОНТЕНТ (ПРАВАЯ КОЛОНКА) */}
                    <div className="ex-scroll" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '800px', overflowY: 'auto' }}>
                        
                        {isGenerating || !currentLesson ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                                <div className="ex-shimmer" style={{ height: '220px', borderRadius: '16px', border: `1px solid ${COLORS.border}` }} />
                                <div className="ex-shimmer" style={{ height: '400px', borderRadius: '16px', border: `1px solid ${COLORS.border}` }} />
                            </div>
                        ) : genError ? (
                            <div style={{ background: 'rgba(239,68,68,0.05)', border: `1px solid ${COLORS.red}`, padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚠️</div>
                                <h3 style={{ color: COLORS.red, margin: '0 0 10px 0', fontSize: '20px' }}>{genError}</h3>
                                <Button onClick={() => generateAIFormula(activeFormulaName)} style={{ marginTop: '15px', background: COLORS.red, color: '#fff', border: 'none' }}>Повторить попытку</Button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                {/* КАРТОЧКА ТЕОРИИ */}
                                <div style={{ background: COLORS.bgCard, padding: '24px', borderRadius: '16px', border: `1px solid ${COLORS.border}` }}>
                                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: COLORS.text, fontWeight: 900 }}>{currentLesson.name}</h1>
                                    <div style={{ color: COLORS.textMuted, fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                                        {UI_DICT[lang].enVersion} <span style={{ color: COLORS.cyan }}>{currentLesson.enName}</span>
                                    </div>

                                    {/* Бэйджи */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                                        {currentLesson.difficulty && <div style={{ border: `1px solid ${COLORS.border}`, padding: '6px 12px', borderRadius: '20px', color: COLORS.text, fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>{currentLesson.difficulty}</div>}
                                        {currentLesson.xp && <div style={{ border: `1px solid rgba(246, 211, 101, 0.4)`, padding: '6px 12px', borderRadius: '20px', color: '#F6D365', fontWeight: 800, fontSize: '10px' }}>⭐ {currentLesson.xp} XP</div>}
                                        <div style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.blue})`, padding: '6px 12px', borderRadius: '20px', color: '#fff', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}>📘 {UI_DICT[lang].theory}</div>
                                    </div>
                                    
                                    {/* Определение */}
                                    <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: `2px solid ${COLORS.cyan}`, marginBottom: '24px' }}>
                                        <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>{UI_DICT[lang].defTitle}</div>
                                        <div style={{ fontSize: '14px', color: COLORS.text, lineHeight: 1.6 }}>{getTranslatedText(currentLesson.def, lang)}</div>
                                    </div>

                                    {/* Синтаксис */}
                                    <div style={{ background: '#0A0E17', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>{UI_DICT[lang].syntaxTitle}</div>
                                        <code style={{ fontSize: '13px', color: COLORS.cyan, fontFamily: "'Fira Code', 'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', display: 'block', lineHeight: 1.6 }}>
                                            {currentLesson.syntax}
                                        </code>
                                    </div>
                                </div>

                                {/* КАРТОЧКА ПРАКТИКИ */}
                                <div style={{ background: COLORS.bgCard, padding: '24px', borderRadius: '16px', border: `1px solid ${COLORS.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '18px' }}>🎯</span>
                                        <span style={{ fontSize: '14px', color: COLORS.green, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>{UI_DICT[lang].practice}</span>
                                    </div>
                                    
                                    <p style={{ margin: '0 0 20px 0', color: COLORS.text, fontSize: '15px', fontWeight: 600, lineHeight: 1.5 }}>
                                        {getTranslatedText(currentLesson.taskDesc, lang)}
                                    </p>
                                    
                                    {/* EXCEL ТАБЛИЦА (Dark Mode) */}
                                    <div className="ex-scroll" style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${COLORS.border}`, marginBottom: '24px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px', borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: '10px', background: COLORS.bgElement }}></th>
                                                    {currentLesson.table[0].map((_, colIdx) => (
                                                        <th key={colIdx} style={{ borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: '10px', fontWeight: 800, color: COLORS.text, background: COLORS.bgElement }}>
                                                            {getColumnLetter(colIdx)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentLesson.table.map((row, rowIdx) => (
                                                    <tr key={rowIdx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                                        <td style={{ background: COLORS.bgElement, borderRight: `1px solid ${COLORS.border}`, padding: '10px', fontWeight: 800, color: COLORS.text }}>
                                                            {rowIdx + 1}
                                                        </td>
                                                        {row.map((cell, colIdx) => (
                                                            <td key={colIdx} style={{ borderRight: `1px solid ${COLORS.border}`, padding: '10px', color: COLORS.text, fontWeight: 500, background: COLORS.bgPanel }}>
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* ПОЛЕ ВВОДА (White/Light as in screenshot) */}
                                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                                        <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#94A3B8', fontSize: '14px', fontStyle: 'italic', borderRight: '1px solid #E2E8F0' }}>fx</div>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => { if(e.target.value === "") setInputValue("="); else setInputValue(e.target.value.toUpperCase()); }}
                                            disabled={showSuccess}
                                            onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                                            style={{ 
                                                width: '100%', padding: '14px 14px 14px 58px', borderRadius: '8px', 
                                                border: `2px solid ${showSuccess ? COLORS.green : shake ? COLORS.red : 'transparent'}`, 
                                                background: '#FFFFFF', color: '#0F172A', 
                                                fontSize: '15px', fontWeight: 700, outline: 'none', 
                                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                    </div>

                                    {/* УСПЕХ */}
                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} style={{ background: 'rgba(16, 185, 129, 0.1)', border: `1px solid ${COLORS.green}`, padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', marginBottom: '20px' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px 0', color: COLORS.green, fontSize: '15px', fontWeight: 800 }}>{UI_DICT[lang].successMsg}</h4>
                                                    <span style={{ color: COLORS.textSec, fontSize: '13px' }}>{UI_DICT[lang].resultMsg} <b style={{color: COLORS.text}}>{currentLesson.result}</b></span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* КНОПКИ ПРАКТИКИ */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button 
                                            onClick={() => generateAIFormula(activeFormulaName)} 
                                            disabled={isGenerating} 
                                            style={{ width: '100%', height: '46px', borderRadius: '8px', background: COLORS.bgElement, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = COLORS.bgElement}
                                        >
                                            {UI_DICT[lang].btnAnother}
                                        </button>
                                        
                                        {!showSuccess && (
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button 
                                                    onClick={() => {
                                                        if (hintsEnabled && currentLesson) {
                                                            setInputValue(currentLesson.expected[0] || currentLesson.expected);
                                                        }
                                                    }} 
                                                    disabled={!hintsEnabled}
                                                    style={{ flex: 1, height: '46px', borderRadius: '8px', background: COLORS.bgElement, border: `1px solid ${COLORS.border}`, color: hintsEnabled ? COLORS.textMuted : 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 700, cursor: hintsEnabled ? 'pointer' : 'not-allowed' }}
                                                >
                                                    {hintsEnabled ? UI_DICT[lang].btnHint : UI_DICT[lang].btnExam}
                                                </button>
                                                
                                                <button 
                                                    onClick={checkAnswer} 
                                                    style={{ flex: 1, height: '46px', borderRadius: '8px', background: COLORS.green, border: 'none', color: '#000', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    {UI_DICT[lang].btnCheck}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    Object.assign(window, { ExcelTrainerLMS });
})();
