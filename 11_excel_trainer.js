/**
 * ExcelTrainerLMS
 * ---------------------------------------------------------------------------
 * ВАЖНО: Бизнес-логика, структура состояний, Firebase, ИИ-генерация и проверка 
 * ответов СТРОГО СОХРАНЕНЫ. Произведен глубокий редизайн интерфейса 
 * в стиле современной LMS-платформы (Glassmorphism, Navy/Purple/Cyan).
 * ---------------------------------------------------------------------------
 */
(function () {
    const { useState, useEffect } = React;
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
            magic: "Магия ИИ", search: "Поиск функции (напр. ВПР)...",
            genLoading: "Создаем магию...", genBtn: "Сгенерировать урок",
            aiTitle: "Готовим материалы для", aiSub: "ИИ пишет уникальную задачу и таблицу",
            theory: "Теория", defTitle: "Определение", enVersion: "Английская версия:",
            syntaxTitle: "Примеры синтаксиса", practice: "Практика",
            successMsg: "Формула написана верно! 🎉", resultMsg: "Результат вычисления:",
            btnAnother: "🔄 Другая задача", btnHint: "💡 Подсказка", btnExam: "🔒 Экзамен", btnCheck: "✓ Проверить"
        },
        en: {
            title: "Excel Encyclopedia", subtitle: "Smart AI function trainer",
            magic: "AI Magic", search: "Search function (e.g. VLOOKUP)...",
            genLoading: "Creating magic...", genBtn: "Generate lesson",
            aiTitle: "Preparing materials for", aiSub: "AI is writing a unique task and table",
            theory: "Theory", defTitle: "Definition", enVersion: "English version:",
            syntaxTitle: "Syntax examples", practice: "Practice",
            successMsg: "Formula is correct! 🎉", resultMsg: "Calculation result:",
            btnAnother: "🔄 Another task", btnHint: "💡 Hint", btnExam: "🔒 Exam", btnCheck: "✓ Check"
        },
        uz: {
            title: "Excel Энциклопедияси", subtitle: "ИИ ёрдамида ақлли функция тренажёри",
            magic: "ИИ Сеҳри", search: "Функцияни қидириш (мас. ВПР)...",
            genLoading: "Сеҳр яратилмоқда...", genBtn: "Дарсни яратиш",
            aiTitle: "Материаллар тайёрланмоқда:", aiSub: "ИИ ноёб вазифа ва жадвал ёзмоқда",
            theory: "Назария", defTitle: "Таъриф", enVersion: "Инглизча версияси:",
            syntaxTitle: "Синтаксис мисоллари", practice: "Амалиёт",
            successMsg: "Формула тўғри ёзилган! 🎉", resultMsg: "Ҳисоблаш натижаси:",
            btnAnother: "🔄 Бошқа вазифа", btnHint: "💡 Ёрдам", btnExam: "🔒 Имтиҳон", btnCheck: "✓ Текшириш"
        }
    };

    // ТОКЕНЫ ДИЗАЙН-СИСТЕМЫ (Поддержка системной темы + глубокие цвета)
    const EX_TOKENS = {
        bg: 'var(--bg-body, #050816)',
        panel: 'var(--bg-panel, #0D1328)',
        card: 'var(--bg-card, #111936)',
        purple: '#8b5cf6',
        blue: '#3b82f6',
        cyan: '#22d3ee',
        green: '#10b981',
        red: '#ef4444',
        text: 'var(--text-main, #f8fafc)',
        textSec: 'var(--text-sec, #94a3b8)',
        border: 'var(--glass-border, rgba(255,255,255,0.08))'
    };

    const injectStyles = () => {
        if (document.getElementById('excel-lms-styles')) return;
        const style = document.createElement('style');
        style.id = 'excel-lms-styles';
        style.textContent = `
            .ex-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
            .ex-scroll::-webkit-scrollbar-track { background: transparent; }
            .ex-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 10px; }
            .ex-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent); background-size: 200% 100%; animation: exShimmer 1.5s infinite; }
            @keyframes exShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            @media (max-width: 900px) {
                .ex-layout { flex-direction: column !important; }
                .ex-sidebar { width: 100% !important; max-height: none !important; }
            }
        `;
        document.head.appendChild(style);
    };

    const ExcelTrainerLMS = ({ onBack }) => {
        useEffect(() => { injectStyles(); }, []);

        const categories = Object.keys(EXCEL_DATABASE);
        const [activeCategory, setActiveCategory] = useState(categories[0]);
        const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);
        
        // UI Состояние для аккордеона категорий (По умолчанию открыта первая)
        const [openCategories, setOpenCategories] = useState({ [categories[0]]: true });

        const [currentLesson, setCurrentLesson] = useState(null);
        const [inputValue, setInputValue] = useState("=");
        const [shake, setShake] = useState(false);
        const [showSuccess, setShowSuccess] = useState(false);
        const [customSearch, setCustomSearch] = useState("");
        const [isGenerating, setIsGenerating] = useState(false);
        const [genError, setGenError] = useState(null); // Новое состояние для ошибок AI

        // СОСТОЯНИЕ ЯЗЫКА ПЕРЕВОДА
        const [lang, setLang] = useState('ru');

        // СТЕЙТ ДЛЯ РЕЖИМА ЭКЗАМЕНА
        const [hintsEnabled, setHintsEnabled] = useState(true);

        // СЛУШАЕМ БАЗУ ДАННЫХ
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

            // ПРОМПТ С УЛУЧШЕНИЯМИ ОТ CHATGPT (добавлены xp, difficulty и строгие правила)
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
            <div className="glass-panel" style={{ width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', border: `1px solid ${EX_TOKENS.border}` }}>
                {/* HEADER */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: EX_TOKENS.panel, padding: '24px 32px', borderBottom: `1px solid ${EX_TOKENS.border}`, flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '52px', height: '52px', background: `linear-gradient(135deg, ${EX_TOKENS.cyan} 0%, ${EX_TOKENS.blue} 100%)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: `0 8px 24px ${EX_TOKENS.blue}55` }}>📊</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: EX_TOKENS.text, letterSpacing: '-0.5px' }}>{UI_DICT[lang].title}</h2>
                            <div style={{ fontSize: '13px', color: EX_TOKENS.textSec, fontWeight: 600, marginTop: '2px' }}>{UI_DICT[lang].subtitle}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '6px', borderRadius: '16px', border: `1px solid ${EX_TOKENS.border}` }}>
                        {[ { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }, { id: 'uz', label: 'UZ' } ].map(item => {
                            const isActive = lang === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setLang(item.id)}
                                    style={{
                                        padding: '8px 16px', 
                                        borderRadius: '12px',
                                        background: isActive ? `linear-gradient(135deg, ${EX_TOKENS.purple}, ${EX_TOKENS.blue})` : 'transparent',
                                        border: 'none',
                                        color: isActive ? '#ffffff' : EX_TOKENS.textSec,
                                        fontWeight: 800, fontSize: '13px', cursor: 'pointer', outline: 'none',
                                        boxShadow: isActive ? `0 4px 14px ${EX_TOKENS.purple}66` : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </header>

                {/* MAIN LAYOUT */}
                <div className="ex-layout" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    
                    {/* SIDEBAR */}
                    <div className="ex-sidebar ex-scroll" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '24px', borderRight: `1px solid ${EX_TOKENS.border}`, background: EX_TOKENS.panelSecondary, maxHeight: '800px', overflowY: 'auto' }}>
                        
                        {/* МАГИЯ ИИ */}
                        <div style={{ background: EX_TOKENS.card, border: `1px solid ${EX_TOKENS.border}`, padding: '20px', borderRadius: '20px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                                <span style={{ fontSize: '18px' }}>✨</span>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: EX_TOKENS.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{UI_DICT[lang].magic}</span>
                            </div>
                            <input
                                type="text"
                                value={customSearch}
                                onChange={(e) => setCustomSearch(e.target.value)}
                                placeholder={UI_DICT[lang].search}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${EX_TOKENS.border}`, background: 'rgba(0,0,0,0.1)', color: EX_TOKENS.text, marginBottom: '12px', fontSize: '14px', outline: 'none', position: 'relative', zIndex: 2 }}
                            />
                            <button 
                                onClick={handleCustomSearch} 
                                disabled={isGenerating} 
                                style={{ width: '100%', height: '44px', fontSize: '13px', borderRadius: '12px', fontWeight: 800, border: 'none', background: `linear-gradient(135deg, ${EX_TOKENS.cyan}, ${EX_TOKENS.blue})`, color: '#000', cursor: isGenerating ? 'wait' : 'pointer', position: 'relative', zIndex: 2, boxShadow: `0 6px 16px ${EX_TOKENS.blue}44` }}
                            >
                                {isGenerating ? UI_DICT[lang].genLoading : UI_DICT[lang].genBtn}
                            </button>
                        </div>

                        {/* АККОРДЕОН КАТЕГОРИЙ */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categories.map(category => {
                                const isOpen = openCategories[category];
                                return (
                                    <div key={category}>
                                        <div 
                                            onClick={() => toggleCategory(category)}
                                            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, color: EX_TOKENS.textSec, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px', border: `1px solid ${EX_TOKENS.border}` }}
                                        >
                                            <span>{category}</span>
                                            <span>{isOpen ? '▼' : '▶'}</span>
                                        </div>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 4px' }}>
                                                        {EXCEL_DATABASE[category].map(fName => {
                                                            const isActive = activeFormulaName === fName;
                                                            return (
                                                                <button
                                                                    key={fName}
                                                                    onClick={() => { setActiveCategory(category); setActiveFormulaName(fName); }}
                                                                    disabled={isGenerating}
                                                                    style={{
                                                                        padding: '8px 16px', borderRadius: '20px', border: isActive ? 'none' : `1px solid ${EX_TOKENS.border}`,
                                                                        background: isActive ? `linear-gradient(135deg, ${EX_TOKENS.purple}, ${EX_TOKENS.blue})` : 'rgba(255,255,255,0.02)',
                                                                        color: isActive ? '#ffffff' : EX_TOKENS.text, fontWeight: isActive ? 700 : 600,
                                                                        cursor: isGenerating ? 'wait' : 'pointer', outline: 'none', fontSize: '12px',
                                                                        boxShadow: isActive ? `0 4px 12px ${EX_TOKENS.purple}66` : 'none',
                                                                        opacity: (isGenerating && !isActive) ? 0.5 : 1
                                                                    }}
                                                                >
                                                                    <span style={{opacity: 0.6, marginRight: '4px'}}>ƒx</span> {fName}
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

                    {/* CONTENT AREA */}
                    <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
                        {isGenerating || !currentLesson ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%', justifyContent: 'center' }}>
                                <div style={{ fontSize: '20px', color: EX_TOKENS.cyan, display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
                                    <span style={{animation: 'pulse-glow 1.5s infinite'}}>✨</span> {UI_DICT[lang].genLoading}
                                </div>
                                <div className="ex-shimmer" style={{ height: '180px', borderRadius: '20px', border: `1px solid ${EX_TOKENS.border}` }} />
                                <div className="ex-shimmer" style={{ height: '350px', borderRadius: '20px', border: `1px solid ${EX_TOKENS.border}` }} />
                            </div>
                        ) : genError ? (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '40px', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
                                <h3 style={{ color: EX_TOKENS.red, margin: '0 0 10px 0', fontSize: '22px' }}>{genError}</h3>
                                <p style={{ color: EX_TOKENS.textSec, marginBottom: '24px' }}>Произошла ошибка при обращении к ИИ. Пожалуйста, попробуйте снова.</p>
                                <Button variant="orange" onClick={() => generateAIFormula(activeFormulaName)} style={{ height: '50px', padding: '0 30px', borderRadius: '14px', fontWeight: 800 }}>Повторить попытку</Button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                
                                {/* THEORY CARD */}
                                <div style={{ background: EX_TOKENS.card, padding: '32px', borderRadius: '24px', border: `1px solid ${EX_TOKENS.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <h1 style={{ margin: '0 0 8px 0', fontSize: '38px', color: EX_TOKENS.text, fontWeight: 900 }}>{currentLesson.name}</h1>
                                            <div style={{ color: EX_TOKENS.textSec, fontSize: '14px', fontWeight: 600 }}>{UI_DICT[lang].enVersion} <span style={{ color: EX_TOKENS.cyan }}>{currentLesson.enName}</span></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {currentLesson.difficulty && <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${EX_TOKENS.border}`, padding: '8px 16px', borderRadius: '12px', color: EX_TOKENS.text, fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{currentLesson.difficulty}</div>}
                                            {currentLesson.xp && <div style={{ background: 'rgba(246, 211, 101, 0.15)', border: `1px solid rgba(246, 211, 101, 0.3)`, padding: '8px 16px', borderRadius: '12px', color: EX_TOKENS.yellow, fontWeight: 900, fontSize: '12px' }}>⭐ {currentLesson.xp} XP</div>}
                                            <div style={{ background: `linear-gradient(135deg, ${EX_TOKENS.purple}, ${EX_TOKENS.blue})`, padding: '8px 16px', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', boxShadow: `0 4px 15px ${EX_TOKENS.purple}55` }}>📘 {UI_DICT[lang].theory}</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: EX_TOKENS.panelSecondary, padding: '24px', borderRadius: '16px', borderLeft: `4px solid ${EX_TOKENS.cyan}`, marginBottom: '20px' }}>
                                        <div style={{ fontSize: '12px', color: EX_TOKENS.textSec, textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px', letterSpacing: '0.5px' }}>{UI_DICT[lang].defTitle}</div>
                                        <div style={{ fontSize: '16px', color: EX_TOKENS.text, lineHeight: 1.6 }}>{getTranslatedText(currentLesson.def, lang)}</div>
                                    </div>

                                    <div style={{ background: '#050816', padding: '24px', borderRadius: '16px', border: `1px solid ${EX_TOKENS.border}` }}>
                                        <div style={{ fontSize: '12px', color: EX_TOKENS.textSec, textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.5px' }}>{UI_DICT[lang].syntaxTitle}</div>
                                        <code style={{ fontSize: '15px', color: EX_TOKENS.cyan, fontFamily: "'Fira Code', 'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', display: 'block', lineHeight: 1.6 }}>
                                            {currentLesson.syntax}
                                        </code>
                                    </div>
                                </div>

                                {/* PRACTICE CARD */}
                                <div style={{ background: EX_TOKENS.card, padding: '32px', borderRadius: '24px', border: `2px solid ${EX_TOKENS.border}`, position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                        <span style={{ fontSize: '24px' }}>🎯</span>
                                        <span style={{ fontSize: '16px', color: EX_TOKENS.green, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>{UI_DICT[lang].practice}</span>
                                    </div>
                                    
                                    <p style={{ margin: '0 0 25px 0', color: EX_TOKENS.text, fontSize: '17px', fontWeight: 600, lineHeight: 1.5 }}>
                                        {getTranslatedText(currentLesson.taskDesc, lang)}
                                    </p>
                                    
                                    {/* EXCEL TABLE */}
                                    <div className="ex-scroll" style={{ overflowX: 'auto', background: EX_TOKENS.bgAlt, borderRadius: '12px', border: `1px solid ${EX_TOKENS.border}`, boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.2)', marginBottom: '30px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
                                            <thead>
                                                <tr style={{ background: EX_TOKENS.panel }}>
                                                    <th style={{ width: '45px', borderRight: `1px solid ${EX_TOKENS.border}`, borderBottom: `1px solid ${EX_TOKENS.border}`, padding: '12px 8px', background: 'rgba(255,255,255,0.02)' }}></th>
                                                    {currentLesson.table[0].map((_, colIdx) => (
                                                        <th key={colIdx} style={{ borderRight: `1px solid ${EX_TOKENS.border}`, borderBottom: `1px solid ${EX_TOKENS.border}`, padding: '12px 8px', fontWeight: 800, color: EX_TOKENS.textSec, background: 'rgba(255,255,255,0.02)' }}>
                                                            {getColumnLetter(colIdx)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentLesson.table.map((row, rowIdx) => (
                                                    <tr key={rowIdx} style={{ borderBottom: `1px solid ${EX_TOKENS.border}`, transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                                        <td style={{ background: 'rgba(255,255,255,0.02)', borderRight: `1px solid ${EX_TOKENS.border}`, padding: '12px 8px', fontWeight: 800, color: EX_TOKENS.textSec }}>
                                                            {rowIdx + 1}
                                                        </td>
                                                        {row.map((cell, colIdx) => (
                                                            <td key={colIdx} style={{ borderRight: `1px solid ${EX_TOKENS.border}`, padding: '12px 8px', color: EX_TOKENS.text, fontWeight: 500 }}>
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* FORMULA INPUT */}
                                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                                        <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: EX_TOKENS.textSec, fontSize: '18px', fontStyle: 'italic', borderRight: `1px solid ${EX_TOKENS.border}`, background: 'rgba(255,255,255,0.02)', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>fx</div>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => { if(e.target.value === "") setInputValue("="); else setInputValue(e.target.value.toUpperCase()); }}
                                            disabled={showSuccess}
                                            onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                                            style={{ 
                                                width: '100%', padding: '20px 20px 20px 70px', borderRadius: '16px', 
                                                border: `2px solid ${showSuccess ? EX_TOKENS.green : shake ? EX_TOKENS.red : EX_TOKENS.border}`, 
                                                background: EX_TOKENS.bgAlt, color: showSuccess ? EX_TOKENS.green : EX_TOKENS.text, 
                                                fontSize: '18px', fontWeight: 700, outline: 'none', 
                                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                                boxShadow: showSuccess ? `0 0 20px ${EX_TOKENS.green}33` : 'inset 0 4px 10px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => { if(!showSuccess) { e.target.style.borderColor = EX_TOKENS.purple; e.target.style.boxShadow = `0 0 0 4px ${EX_TOKENS.purple}33`; } }}
                                            onBlur={(e) => { if(!showSuccess && !shake) { e.target.style.borderColor = EX_TOKENS.border; e.target.style.boxShadow = 'inset 0 4px 10px rgba(0,0,0,0.2)'; } }}
                                        />
                                    </div>

                                    {/* SUCCESS STATE */}
                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} style={{ background: 'rgba(16, 185, 129, 0.1)', border: `2px solid ${EX_TOKENS.green}`, padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', marginBottom: '24px' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 8px 0', color: EX_TOKENS.green, fontSize: '20px', fontWeight: 900 }}>{UI_DICT[lang].successMsg}</h4>
                                                    <span style={{ color: EX_TOKENS.textSec, fontSize: '15px', fontWeight: 600 }}>{UI_DICT[lang].resultMsg} <b style={{color: EX_TOKENS.text}}>{currentLesson.result}</b></span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <div style={{ fontSize: '42px', lineHeight: 1 }}>✅</div>
                                                    {currentLesson.xp && <motion.div initial={{y: 10, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} style={{ color: EX_TOKENS.yellow, fontWeight: 900, marginTop: '8px' }}>+{currentLesson.xp} XP</motion.div>}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ACTION BUTTONS */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '24px', borderTop: `1px solid ${EX_TOKENS.border}` }}>
                                        <button 
                                            onClick={() => generateAIFormula(activeFormulaName)} 
                                            disabled={isGenerating} 
                                            style={{ flex: '1 1 180px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${EX_TOKENS.border}`, color: EX_TOKENS.textSec, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = EX_TOKENS.text; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = EX_TOKENS.textSec; }}
                                        >
                                            {UI_DICT[lang].btnAnother}
                                        </button>
                                        
                                        {!showSuccess && (
                                            <div style={{ display: 'flex', gap: '16px', flex: '2 1 340px' }}>
                                                <button 
                                                    onClick={() => {
                                                        if (hintsEnabled && currentLesson) {
                                                            setInputValue(currentLesson.expected[0] || currentLesson.expected);
                                                        }
                                                    }} 
                                                    disabled={!hintsEnabled}
                                                    style={{ flex: '1 1 50%', height: '54px', borderRadius: '14px', background: hintsEnabled ? `linear-gradient(135deg, ${EX_TOKENS.orange}, #f59e0b)` : 'rgba(255,255,255,0.05)', border: hintsEnabled ? 'none' : `1px solid ${EX_TOKENS.border}`, color: hintsEnabled ? '#000' : EX_TOKENS.textSec, fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', cursor: hintsEnabled ? 'pointer' : 'not-allowed', opacity: hintsEnabled ? 1 : 0.6, boxShadow: hintsEnabled ? `0 6px 16px ${EX_TOKENS.orange}44` : 'none' }}
                                                >
                                                    {hintsEnabled ? UI_DICT[lang].btnHint : UI_DICT[lang].btnExam}
                                                </button>
                                                
                                                <button 
                                                    onClick={checkAnswer} 
                                                    style={{ flex: '1 1 50%', height: '54px', borderRadius: '14px', background: `linear-gradient(135deg, ${EX_TOKENS.green}, #059669)`, border: 'none', color: '#000', fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 6px 16px ${EX_TOKENS.green}55` }}
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
