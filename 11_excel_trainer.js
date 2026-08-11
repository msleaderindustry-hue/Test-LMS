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

const ExcelTrainerLMS = ({ onBack }) => {
    const categories = Object.keys(EXCEL_DATABASE);
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeFormulaName, setActiveFormulaName] = useState(EXCEL_DATABASE[categories[0]][0]);

    const [currentLesson, setCurrentLesson] = useState(null);
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [customSearch, setCustomSearch] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generateAIFormula(activeFormulaName);
    }, [activeFormulaName]);

    const generateAIFormula = async (formulaName) => {
        setInputValue("=");
        setShowSuccess(false);
        setIsGenerating(true);
        setCurrentLesson(null);

        const prompt = `Ты профессиональный преподаватель Microsoft Excel. 
        Пользователь выбрал функцию: "${formulaName}".
        Создай НОВУЮ уникальную интерактивную задачу по этой функции.
        Верни ТОЛЬКО чистый валидный JSON (без markdown) строго в таком формате:
        {
          "name": "${formulaName}",
          "enName": "АНГЛИЙСКОЕ_НАЗВАНИЕ",
          "syntax": "=ФУНКЦИЯ(Z1:Z10)\\n=ФУНКЦИЯ(Z1; Z2)",
          "def": "Понятное объяснение для ученика, что делает функция.",
          "taskDesc": "Текст практической задачи (ясно укажи, для какой ячейки пишем формулу, например C2).",
          "table": [
            ["Сотрудник", "Продажи", "Статус"],
            ["Иванов", 450, ""],
            ["Петрова", 520, ""]
          ],
          "expected": ["=ФУНКЦИЯ(B2:B3)"],
          "result": "Ожидаемый ответ вычисления"
        }
        КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
        1. СИНТАКСИС БЕЗ СЛОВ: В поле "syntax" пиши ТОЛЬКО примеры формул с абстрактными ячейками (Z1, X2). Никаких вступительных слов или подсказок к задаче.
        2. ЛОГИКА ОЖИДАЕМОГО ОТВЕТА ("expected"): В массив expected добавь ВСЕ возможные правильные варианты написания формулы, которая решает задачу. Обязательно убедись, что адреса ячеек в формуле СТРОГО СОВПАДАЮТ с таблицей! Если в задаче нужно проверить строку 2, то в формуле должно быть B2 (а не какой-то случайный диапазон).
        3. ЭКРАНИРОВАНИЕ: В массиве "expected" экранируй внутренние кавычки (например: "=ЕСЛИ(B2>=500; \\"Премия\\"; \\"Оклад\\")").
        4. РАЗНООБРАЗИЕ: Делай разные таблицы, не только про продажи (например, оценки учеников, учет товаров на складе и т.д.).`;

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
            setCurrentLesson(parsedFormula);
            
        } catch (error) {
            console.error("Ошибка:", error);
            alert(`Не удалось сгенерировать урок для ${formulaName}. Попробуйте еще раз.`);
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

    const checkAnswer = () => {
        if (!currentLesson) return;
        
        const formatFormula = (f) => String(f).trim().toUpperCase().replace(/\s/g, '').replace(/,/g, ';');
        
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

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5 }}
            style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', padding: '30px', margin: '0 auto', borderRadius: '24px' }}
        >
            {/* ШАПКА */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>📊</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Энциклопедия Excel</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 600, marginTop: '2px' }}>Умный тренажер функций с ИИ</div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* ЛЕВАЯ КОЛОНКА: Навигация */}
                <div className="modern-scroll" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '700px', overflowY: 'auto', paddingRight: '10px' }}>
                    
                    {/* ПОИСК */}
                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '18px' }}>✨</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Магия ИИ</span>
                        </div>
                        <input
                            type="text"
                            value={customSearch}
                            onChange={(e) => setCustomSearch(e.target.value)}
                            placeholder="Поиск функции (напр. ВПР)..."
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', marginBottom: '15px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        />
                        <Button variant="green" onClick={handleCustomSearch} disabled={isGenerating} style={{ width: '100%', height: '44px', fontSize: '14px', borderRadius: '12px', fontWeight: 'bold' }}>
                            {isGenerating ? "Создаем магию..." : "Сгенерировать урок"}
                        </Button>
                    </div>

                    {/* СПИСКИ КАТЕГОРИЙ */}
                    {categories.map(category => (
                        <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '5px' }}>
                                {category}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {EXCEL_DATABASE[category].map(fName => {
                                    const isActive = activeFormulaName === fName;
                                    return (
                                        <button
                                            key={fName}
                                            onClick={() => { setActiveCategory(category); setActiveFormulaName(fName); }}
                                            disabled={isGenerating}
                                            style={{
                                                padding: '8px 16px', 
                                                borderRadius: '20px', 
                                                border: isActive ? 'none' : '1px solid var(--glass-border)',
                                                background: isActive ? '#10b981' : 'var(--bg-body)',
                                                color: isActive ? '#ffffff' : 'var(--text-main)',
                                                fontWeight: isActive ? 700 : 600,
                                                cursor: isGenerating ? 'wait' : 'pointer', 
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                outline: 'none', 
                                                fontSize: '13px',
                                                boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                                                opacity: (isGenerating && !isActive) ? 0.5 : 1
                                            }}
                                            onMouseEnter={(e) => { if (!isActive && !isGenerating) e.target.style.borderColor = '#10b981'; }}
                                            onMouseLeave={(e) => { if (!isActive && !isGenerating) e.target.style.borderColor = 'var(--glass-border)'; }}
                                        >
                                            {fName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ПРАВАЯ КОЛОНКА: Контент */}
                <div style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {isGenerating || !currentLesson ? (
                        <div style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: '50px', marginBottom: '20px' }}>🤖</motion.div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>Готовим материалы для {activeFormulaName}...</div>
                            <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>ИИ пишет уникальную задачу и таблицу</div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            
                            {/* БЛОК ТЕОРИИ */}
                            <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <h1 style={{ margin: '0 0 5px 0', fontSize: '36px', color: 'var(--text-main)', fontWeight: 900 }}>{currentLesson.name}</h1>
                                        <div style={{ color: 'var(--text-sec)', fontSize: '15px', fontWeight: 600 }}>Английская версия: <span style={{ color: '#10b981' }}>{currentLesson.enName}</span></div>
                                    </div>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '12px', color: '#10b981', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>Теория</div>
                                </div>
                                
                                <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #10b981', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-sec)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Определение</div>
                                    <div style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: 1.6 }}>{currentLesson.def}</div>
                                </div>

                                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px', letterSpacing: '0.5px' }}>Примеры синтаксиса</div>
                                    <code style={{ fontSize: '15px', color: '#38bdf8', fontFamily: "'Fira Code', monospace", whiteSpace: 'pre-wrap', display: 'block', lineHeight: 1.6 }}>
                                        {currentLesson.syntax}
                                    </code>
                                </div>
                            </div>

                            {/* БЛОК ПРАКТИКИ */}
                            <div style={{ background: 'var(--bg-body)', padding: '30px', borderRadius: '24px', border: '2px dashed var(--glass-border)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-14px', left: '30px', background: 'var(--bg-body)', padding: '0 15px', fontSize: '13px', color: '#10b981', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>Практика</div>
                                
                                <p style={{ margin: '10px 0 25px 0', color: 'var(--text-main)', fontSize: '17px', fontWeight: 600, lineHeight: 1.5 }}>
                                    {currentLesson.taskDesc}
                                </p>
                                
                                {/* ТАБЛИЦА */}
                                <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '15px', fontFamily: 'sans-serif' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '3px solid #10b981' }}>
                                                <th style={{ width: '45px', borderRight: '1px solid #e2e8f0', padding: '12px 8px', color: '#94a3b8', background: '#f1f5f9' }}></th>
                                                {currentLesson.table[0].map((_, colIdx) => (
                                                    <th key={colIdx} style={{ borderRight: '1px solid #e2e8f0', padding: '12px 8px', fontWeight: 'bold', color: '#334155' }}>
                                                        {getColumnLetter(colIdx)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentLesson.table.map((row, rowIdx) => (
                                                <tr key={rowIdx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                                    <td style={{ background: '#f1f5f9', borderRight: '1px solid #e2e8f0', padding: '10px 8px', fontWeight: 'bold', color: '#64748b' }}>
                                                        {rowIdx + 1}
                                                    </td>
                                                    {row.map((cell, colIdx) => (
                                                        <td key={colIdx} style={{ borderRight: '1px solid #e2e8f0', padding: '10px 8px', color: '#1e293b' }}>
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ПОЛЕ ВВОДА */}
                                <div style={{ position: 'relative', marginBottom: '20px' }}>
                                    <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#10b981', fontSize: '20px', fontStyle: 'italic' }}>fx</div>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => { if(e.target.value === "") setInputValue("="); else setInputValue(e.target.value.toUpperCase()); }}
                                        disabled={showSuccess}
                                        onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                                        style={{ 
                                            width: '100%', 
                                            padding: '20px 20px 20px 55px', 
                                            borderRadius: '16px', 
                                            border: `2px solid ${showSuccess ? '#10b981' : 'var(--glass-border)'}`, 
                                            background: 'var(--bg-panel)', 
                                            color: 'var(--text-main)', 
                                            fontSize: '20px', 
                                            fontWeight: 700, 
                                            outline: 'none', 
                                            fontFamily: "'Fira Code', monospace",
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => { if(!showSuccess) e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'; }}
                                        onBlur={(e) => { if(!showSuccess) e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                    />
                                </div>

                                {/* ПЛАШКА УСПЕХА */}
                                <AnimatePresence>
                                    {showSuccess && (
                                        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 15 }} style={{ background: '#ecfdf5', border: '2px solid #10b981', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#059669', fontSize: '18px', fontWeight: 800 }}>Формула написана верно! 🎉</h4>
                                                <span style={{ color: '#0f766e', fontSize: '15px', fontWeight: 600 }}>Результат вычисления: <b style={{color: '#047857'}}>{currentLesson.result}</b></span>
                                            </div>
                                            <div style={{ fontSize: '40px' }}>✅</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* КНОПКИ ДЕЙСТВИЙ */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                                    <Button variant="muted" onClick={() => generateAIFormula(activeFormulaName)} disabled={isGenerating} style={{ background: 'var(--bg-panel)', height: '48px', borderRadius: '12px', fontWeight: 700, padding: '0 20px' }}>
                                        🔄 Другая задача
                                    </Button>
                                    {!showSuccess && (
                                        <Button variant="green" onClick={checkAnswer} style={{ width: '160px', height: '48px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                                            Проверить
                                        </Button>
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
