const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ОГРОМНЫЙ СПИСОК ФУНКЦИЙ (Только названия)
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

    // Текущий урок (кэширование удалено, теперь всегда новая генерация!)
    const [currentLesson, setCurrentLesson] = useState(null);

    // Состояния практики
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // AI Состояния
    const [customSearch, setCustomSearch] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // При смене функции генерируем новую задачу
    useEffect(() => {
        setInputValue("=");
        setShowSuccess(false);
        generateAIFormula(activeFormulaName);
    }, [activeFormulaName]);

    // Основная функция генерации через ИИ
    const generateAIFormula = async (formulaName) => {
        setIsGenerating(true);
        setCurrentLesson(null);

        // ЖЕСТКИЙ ПРОМПТ БЕЗ СЛОВ-ПОДСКАЗОК В СИНТАКСИСЕ
        const prompt = `Ты профессиональный преподаватель Microsoft Excel. 
        Пользователь выбрал функцию: "${formulaName}".
        Создай НОВУЮ уникальную интерактивную урок-задачу по этой функции.
        Верни ТОЛЬКО чистый валидный JSON (без markdown, без \`\`\`json) строго в таком формате:
        {
          "name": "${formulaName}",
          "enName": "АНГЛИЙСКОЕ_НАЗВАНИЕ",
          "syntax": "=ФУНКЦИЯ(Z1:Z10; \\">50\\"; X1:X10)\\n=ФУНКЦИЯ(Z1; Z2)",
          "def": "Понятное объяснение для ученика, что делает функция.",
          "taskDesc": "Текст практической задачи.",
          "table": [
            ["Заголовок A", "Заголовок B", "Заголовок C"],
            ["Текст", "Число/Дата", "Число/Дата"],
            ["Текст", "Число/Дата", "Число/Дата"],
            ["Текст", "Число/Дата", "Число/Дата"]
          ],
          "expected": ["=ФУНКЦИЯ(B2:B4)", "=ФУНКЦИЯ(B2;B3;B4)"],
          "result": "Ожидаемый ответ вычисления"
        }
        КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
        1. СИНТАКСИС БЕЗ СЛОВ: В поле "syntax" КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать слова "диапазон", "критерий", "условие", "значение_если_истина". Пиши ТОЛЬКО реальные примеры кода с абстрактными ячейками (Z1, X2) и конкретными значениями (">50", "Текст"). Ученик должен видеть, как ставить кавычки и точки с запятой!
        2. ЗАДАЧА: В поле "taskDesc" ЗАПРЕЩЕНО просить "написать формулу в ячейке C5", если её нет в таблице. Просто скажи "Напишите формулу, которая посчитает...".
        3. ВАРИАНТЫ ОТВЕТОВ: В массив "expected" добавь ВСЕ правильные варианты написания формулы для этой задачи.
        4. ЭКРАНИРОВАНИЕ: В массиве "expected" обязательно экранируй внутренние двойные кавычки: "=ЕСЛИ(B4>=100; \\"Да\\"; \\"Нет\\")".
        5. ТИПЫ: Формула в "expected" должна быть на 100% рабочей. Если функция математическая, в ячейках должны лежать ЧИСЛА.`;

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
        
        // Если функция та же самая, форсируем обновление
        if (fName === activeFormulaName) {
            setInputValue("=");
            setShowSuccess(false);
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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#10b981' }}>Энциклопедия Excel</h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: 'linear-gradient(90deg, #10b981, #059669)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px' }}>
                        ВСЕ ФУНКЦИИ + ИИ
                    </span>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* ЛЕВАЯ КОЛОНКА: Навигация по функциям */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '650px', overflowY: 'auto', paddingRight: '10px' }}>
                    
                    {/* Кастомный поиск функции */}
                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '16px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: '10px' }}>✨ Найти свою функцию</div>
                        <input
                            type="text"
                            value={customSearch}
                            onChange={(e) => setCustomSearch(e.target.value)}
                            placeholder="Напр. БЕССЕЛЬ.I"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', marginBottom: '10px', fontSize: '13px', outline: 'none' }}
                        />
                        <Button variant="primary" onClick={handleCustomSearch} disabled={isGenerating} style={{ width: '100%', height: '36px', fontSize: '13px', background: 'linear-gradient(90deg, #a855f7, #6d28d9)' }}>
                            {isGenerating ? "Генерируем..." : "Создать урок"}
                        </Button>
                    </div>

                    {categories.map(category => (
                        <div key={category}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                {category}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {EXCEL_DATABASE[category].map(fName => (
                                    <button
                                        key={fName}
                                        onClick={() => { setActiveCategory(category); setActiveFormulaName(fName); }}
                                        disabled={isGenerating}
                                        style={{
                                            textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                            background: activeFormulaName === fName ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-panel)',
                                            color: activeFormulaName === fName ? '#10b981' : 'var(--text-main)',
                                            fontWeight: activeFormulaName === fName ? 800 : 600,
                                            cursor: isGenerating ? 'wait' : 'pointer', transition: '0.2s', outline: 'none', fontSize: '13px',
                                            opacity: (isGenerating && activeFormulaName !== fName) ? 0.5 : 1
                                        }}
                                    >
                                        {fName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ПРАВАЯ КОЛОНКА: Теория и Тренажер */}
                <div style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {isGenerating || !currentLesson ? (
                        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', background: 'var(--bg-panel)', borderRadius: '22px', border: '1px solid var(--glass-border)' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '45px', marginBottom: '15px' }}>🧠</motion.div>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>ИИ готовит урок для {activeFormulaName}...</div>
                            <div style={{ fontSize: '13px', marginTop: '10px', opacity: 0.6 }}>Генерируем уникальную таблицу и задание</div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            <div style={{ background: 'var(--bg-panel)', padding: '25px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', color: 'var(--text-main)' }}>{currentLesson.name}</h1>
                                <div style={{ color: 'var(--text-sec)', fontSize: '14px', marginBottom: '20px' }}>Английская версия: <b>{currentLesson.enName}</b></div>
                                
                                <div style={{ background: 'var(--bg-body)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #10b981', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-sec)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px' }}>Определение</div>
                                    <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.5 }}>{currentLesson.def}</div>
                                </div>

                                <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px' }}>Синтаксис</div>
                                    <code style={{ fontSize: '16px', color: '#38bdf8', fontFamily: 'monospace', whiteSpace: 'pre-wrap', display: 'block', lineHeight: 1.5 }}>
                                        {currentLesson.syntax}
                                    </code>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-body)', padding: '25px', borderRadius: '20px', border: '2px dashed var(--glass-border)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-sec)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px' }}>Практическое задание</div>
                                <p style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: 600 }}>{currentLesson.taskDesc}</p>
                                
                                <div className="modern-scroll" style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#334155', fontFamily: 'Arial, sans-serif', marginBottom: '20px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                                <th style={{ width: '40px', borderRight: '1px solid #cbd5e1', padding: '8px', color: '#64748b' }}></th>
                                                {currentLesson.table[0].map((_, colIdx) => (
                                                    <th key={colIdx} style={{ borderRight: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold', color: '#475569' }}>
                                                        {getColumnLetter(colIdx)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentLesson.table.map((row, rowIdx) => (
                                                <tr key={rowIdx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ background: '#f8fafc', borderRight: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold', color: '#64748b' }}>
                                                        {rowIdx + 1}
                                                    </td>
                                                    {row.map((cell, colIdx) => (
                                                        <td key={colIdx} style={{ borderRight: '1px solid #e2e8f0', padding: '8px' }}>
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#10b981', fontSize: '18px' }}>fx</div>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => { if(e.target.value === "") setInputValue("="); else setInputValue(e.target.value.toUpperCase()); }}
                                        disabled={showSuccess}
                                        onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                                        style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: `2px solid ${showSuccess ? '#10b981' : 'var(--glass-border)'}`, background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, outline: 'none', fontFamily: 'monospace' }}
                                    />
                                </div>

                                <AnimatePresence>
                                    {showSuccess && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '15px', borderRadius: '12px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#10b981', fontSize: '16px' }}>Формула написана верно! 🎉</h4>
                                                <span style={{ color: 'var(--text-main)', fontSize: '14px' }}>Результат вычисления: <b>{currentLesson.result}</b></span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                    {/* Кнопка сброса и генерации новой задачи */}
                                    <Button variant="muted" onClick={() => generateAIFormula(activeFormulaName)} disabled={isGenerating} style={{ background: 'var(--bg-panel)' }}>
                                        🔄 Другая задача
                                    </Button>
                                    {!showSuccess && <Button variant="green" onClick={checkAnswer} style={{ width: '150px' }}>Проверить</Button>}
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
