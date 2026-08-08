const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Глобальная база формул, разбитая по категориям (Справочник + Тренажер)
const EXCEL_DATABASE = {
    "Математические": [
        {
            name: "СУММ",
            enName: "SUM",
            syntax: "=СУММ(число1; [число2]; ...)",
            def: "Складывает все числа в указанном диапазоне ячеек. Самая частая и полезная функция в Excel.",
            taskDesc: "Найди общую сумму выручки за три дня в столбце B.",
            table: [
                ["День", "Выручка (₽)"],
                ["Пн", "150"],
                ["Вт", "200"],
                ["Ср", "50"]
            ],
            expected: ["=СУММ(B2:B4)", "=SUM(B2:B4)"],
            result: "400"
        },
        {
            name: "СРЗНАЧ",
            enName: "AVERAGE",
            syntax: "=СРЗНАЧ(число1; [число2]; ...)",
            def: "Вычисляет среднее арифметическое (суммирует все числа и делит на их количество).",
            taskDesc: "Вычисли средний балл ученика по трем предметам (столбец B).",
            table: [
                ["Предмет", "Балл"],
                ["Математика", "5"],
                ["Физика", "4"],
                ["Информатика", "3"]
            ],
            expected: ["=СРЗНАЧ(B2:B4)", "=AVERAGE(B2:B4)"],
            result: "4"
        },
        {
            name: "МАКС / МИН",
            enName: "MAX / MIN",
            syntax: "=МАКС(число1; ...) или =МИН(число1; ...)",
            def: "Находит самое большое (МАКС) или самое маленькое (МИН) число в списке.",
            taskDesc: "Найди самую высокую температуру за неделю в столбце B.",
            table: [
                ["День", "Темп (°C)"],
                ["Пн", "22"],
                ["Вт", "28"],
                ["Ср", "25"]
            ],
            expected: ["=МАКС(B2:B4)", "=MAX(B2:B4)"],
            result: "28"
        }
    ],
    "Логические": [
        {
            name: "ЕСЛИ",
            enName: "IF",
            syntax: "=ЕСЛИ(логическое_выражение; значение_если_истина; значение_если_ложь)",
            def: "Проверяет условие. Если оно верно, функция выдает один результат, если нет — другой.",
            taskDesc: "Для ячейки C2: Если балл (B2) больше 3, выведи слово СДАЛ, иначе НЕТ.",
            table: [
                ["Ученик", "Балл", "Статус"],
                ["Иван", "4", "?"]
            ],
            expected: ["=ЕСЛИ(B2>3;\"СДАЛ\";\"НЕТ\")", "=IF(B2>3;\"СДАЛ\";\"НЕТ\")", "=ЕСЛИ(B2>3;'СДАЛ';'НЕТ')"],
            result: "СДАЛ"
        }
    ],
    "Поиск и ссылки": [
        {
            name: "ВПР",
            enName: "VLOOKUP",
            syntax: "=ВПР(искомое_значение; таблица; номер_столбца; [интервальный_просмотр])",
            def: "Ищет значение в крайнем левом столбце таблицы и возвращает значение из той же строки другого столбца. (0 - точное совпадение).",
            taskDesc: "Найди цену для товара 'Банан' (ищем слово 'Банан' в таблице A2:B3, цена во 2-м столбце).",
            table: [
                ["Товар", "Цена"],
                ["Яблоко", "100"],
                ["Банан", "150"]
            ],
            expected: ["=ВПР(\"БАНАН\";A2:B3;2;0)", "=VLOOKUP(\"БАНАН\";A2:B3;2;0)", "=ВПР(\"БАНАН\";A2:B3;2;ЛОЖЬ)"],
            result: "150"
        }
    ]
};

const ExcelTrainerLMS = ({ onBack }) => {
    // Состояния для навигации
    const categories = Object.keys(EXCEL_DATABASE);
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeFormula, setActiveFormula] = useState(EXCEL_DATABASE[categories[0]][0]);

    // Состояния практики
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // AI Состояния
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Сброс поля при смене формулы
    useEffect(() => {
        setInputValue("=");
        setShowSuccess(false);
    }, [activeFormula]);

    // Генерация НОВОЙ формулы через ИИ
const generateAIFormula = async () => {
        if (!topic.trim()) return alert("Введите название функции (например: СУММЕСЛИ)!");
        setIsGenerating(true);

        // ОБНОВЛЕННЫЙ, БОЛЕЕ СТРОГИЙ ПРОМПТ ДЛЯ ИИ
        const prompt = `Создай обучающую карточку для функции Excel: "${topic}".
        Верни ТОЛЬКО чистый валидный JSON (без markdown) строго в таком формате:
        {
          "name": "ИМЯ_ФУНКЦИИ",
          "enName": "ENGLISH_NAME",
          "syntax": "=ФУНКЦИЯ(арг1; арг2)",
          "def": "Понятное объяснение для ученика, что делает функция.",
          "taskDesc": "Текст практической задачи.",
          "table": [
            ["Столбец А", "Столбец B"],
            ["Текст А2", "Данные B2"],
            ["Текст А3", "Данные B3"]
          ],
          "expected": ["=ФУНКЦИЯ(B2)"],
          "result": "Ожидаемый ответ"
        }
        КРИТИЧЕСКИ ВАЖНО: В массиве "expected" формула должна быть на 100% рабочей в реальном Excel. Ссылайся СТРОГО на те ячейки, где лежат правильные типы данных (даты или числа, а не текст с именами). Будь максимально логичен!`;

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
            setActiveCategory("Сгенерировано ИИ");
            setActiveFormula(parsedFormula);
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Ошибка генерации. Проверьте правильность названия функции.");
        } finally {
            setIsGenerating(false);
        }
    };

    const checkAnswer = () => {
        // Убираем пробелы, делаем заглавными и меняем запятые на точки с запятой (частая ошибка учеников)
        const formatFormula = (f) => f.trim().toUpperCase().replace(/\s/g, '').replace(/,/g, ';');
        
        const userForm = formatFormula(inputValue);
        const isCorrect = activeFormula.expected.some(exp => formatFormula(exp) === userForm);

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
            style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', padding: '30px', margin: '0 auto', borderRadius: '24px' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#10b981' }}>Энциклопедия Excel</h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: 'linear-gradient(90deg, #10b981, #059669)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px' }}>
                        ТЕОРИЯ + ПРАКТИКА
                    </span>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                
                {/* ЛЕВАЯ КОЛОНКА: Навигация по функциям */}
                <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {categories.map(category => (
                        <div key={category}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                {category}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {EXCEL_DATABASE[category].map(formula => (
                                    <button
                                        key={formula.name}
                                        onClick={() => { setActiveCategory(category); setActiveFormula(formula); }}
                                        style={{
                                            textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                            background: activeFormula.name === formula.name ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-panel)',
                                            color: activeFormula.name === formula.name ? '#10b981' : 'var(--text-main)',
                                            fontWeight: activeFormula.name === formula.name ? 800 : 600,
                                            cursor: 'pointer', transition: '0.2s', outline: 'none'
                                        }}
                                    >
                                        {formula.name} <span style={{ opacity: 0.5, fontSize: '12px', marginLeft: '5px' }}>({formula.enName})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Поиск редкой функции через ИИ */}
                    <div style={{ marginTop: 'auto', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: '10px' }}>✨ ИИ Справочник</div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Название функции (напр. СУММЕСЛИ)"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', marginBottom: '10px', fontSize: '13px' }}
                        />
                        <Button variant="primary" onClick={generateAIFormula} disabled={isGenerating} style={{ width: '100%', height: '36px', fontSize: '13px', background: 'linear-gradient(90deg, #a855f7, #6d28d9)' }}>
                            {isGenerating ? "Ищем..." : "Сгенерировать урок"}
                        </Button>
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА: Теория и Тренажер */}
                <div style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* БЛОК ТЕОРИИ */}
                    <div style={{ background: 'var(--bg-panel)', padding: '25px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', color: 'var(--text-main)' }}>{activeFormula.name}</h1>
                        <div style={{ color: 'var(--text-sec)', fontSize: '14px', marginBottom: '20px' }}>Английская версия: <b>{activeFormula.enName}</b></div>
                        
                        <div style={{ background: 'var(--bg-body)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #10b981', marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-sec)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px' }}>Определение</div>
                            <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.5 }}>{activeFormula.def}</div>
                        </div>

                        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px' }}>Синтаксис (Правило написания)</div>
                            <code style={{ fontSize: '16px', color: '#38bdf8', fontFamily: 'monospace' }}>{activeFormula.syntax}</code>
                        </div>
                    </div>

                    {/* БЛОК ПРАКТИКИ */}
                    <div style={{ background: 'var(--bg-body)', padding: '25px', borderRadius: '20px', border: '2px dashed var(--glass-border)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-sec)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px' }}>Практическое задание</div>
                        <p style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: 600 }}>{activeFormula.taskDesc}</p>
                        
                        {/* Таблица */}
                        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#334155', fontFamily: 'Arial, sans-serif', marginBottom: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                        <th style={{ width: '40px', borderRight: '1px solid #cbd5e1', padding: '8px', color: '#64748b' }}></th>
                                        {activeFormula.table[0].map((_, colIdx) => (
                                            <th key={colIdx} style={{ borderRight: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold', color: '#475569' }}>
                                                {getColumnLetter(colIdx)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeFormula.table.map((row, rowIdx) => (
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

                        {/* Ввод формулы */}
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

                        {/* Результат */}
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '15px', borderRadius: '12px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#10b981', fontSize: '16px' }}>Формула написана верно! 🎉</h4>
                                        <span style={{ color: 'var(--text-main)', fontSize: '14px' }}>Результат вычисления: <b>{activeFormula.result}</b></span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            {!showSuccess && <Button variant="green" onClick={checkAnswer} style={{ width: '150px' }}>Проверить</Button>}
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
