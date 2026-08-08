const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// База базовых задач для старта
const DEFAULT_EXCEL_TASKS = [
    {
        title: "Сумма значений",
        desc: "Функция складывает все числа в указанном диапазоне. Найди общую сумму продаж в столбце B.",
        table: [
            ["Товар", "Продажи"],
            ["Яблоки", "150"],
            ["Груши", "200"],
            ["Бананы", "50"]
        ],
        expectedFormula: "=СУММ(B1:B3)",
        altFormula: "=SUM(B1:B3)",
        result: "400"
    },
    {
        title: "Среднее значение",
        desc: "Возвращает среднее арифметическое аргументов. Найди средний балл в столбце B.",
        table: [
            ["Ученик", "Оценка"],
            ["Иван", "5"],
            ["Анна", "4"],
            ["Олег", "3"]
        ],
        expectedFormula: "=СРЗНАЧ(B1:B3)",
        altFormula: "=AVERAGE(B1:B3)",
        result: "4"
    },
    {
        title: "Максимальное значение",
        desc: "Выбирает самое большое число из набора. Найди самую высокую температуру за 3 дня (столбец B).",
        table: [
            ["День", "Темп (°C)"],
            ["Пн", "22"],
            ["Вт", "28"],
            ["Ср", "25"]
        ],
        expectedFormula: "=МАКС(B1:B3)",
        altFormula: "=MAX(B1:B3)",
        result: "28"
    }
];

const ExcelTrainerLMS = ({ onBack }) => {
    const [tasks, setTasks] = useState(DEFAULT_EXCEL_TASKS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState("=");
    const [shake, setShake] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // AI Состояния
    const [topic, setTopic] = useState("Логические функции (ЕСЛИ, И)");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAITasks = async () => {
        if (!topic.trim()) return alert("Введите тему!");
        setIsGenerating(true);

        const prompt = `Сгенерируй 3 задачи для тренажера Excel на тему: "${topic}".
        Верни ТОЛЬКО чистый валидный JSON массив объектов. Без markdown.
        Формат строго такой:
        [
          {
            "title": "Название функции",
            "desc": "Объяснение что делает функция и сама задача (например, 'Найди сумму в столбце B').",
            "table": [
              ["Заголовок 1", "Заголовок 2"],
              ["Данные A1", "Данные B1"],
              ["Данные A2", "Данные B2"],
              ["Данные A3", "Данные B3"]
            ],
            "expectedFormula": "=СУММ(B1:B3)",
            "altFormula": "=SUM(B1:B3)",
            "result": "Ответ"
          }
        ]`;

        try {
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("JSON не найден");

            const parsed = JSON.parse(jsonMatch[0]);
            setTasks(parsed);
            setCurrentIndex(0);
            setInputValue("=");
            setShowSuccess(false);
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Ошибка генерации. Попробуй другую тему.");
        } finally {
            setIsGenerating(false);
        }
    };

    const checkAnswer = () => {
        const currentTask = tasks[currentIndex];
        const userForm = inputValue.trim().toUpperCase().replace(/\s/g, '');
        const expected1 = currentTask.expectedFormula.toUpperCase().replace(/\s/g, '');
        const expected2 = currentTask.altFormula.toUpperCase().replace(/\s/g, '');

        if (userForm === expected1 || userForm === expected2) {
            setShowSuccess(true);
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    const nextTask = () => {
        setShowSuccess(false);
        setInputValue("=");
        setCurrentIndex(prev => (prev + 1) % tasks.length);
    };

    const currentTask = tasks[currentIndex];

    // Функция для получения буквы столбца (A, B, C...)
    const getColumnLetter = (colIndex) => String.fromCharCode(65 + colIndex);

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shake ? { duration: 0.3 } : { duration: 0.5 }}
            style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', margin: '0 auto', borderRadius: '24px' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
                    Тренажер Excel 📊
                </h2>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-sec)', background: 'var(--bg-body)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    Задача {currentIndex + 1} / {tasks.length}
                </div>
            </header>

            {/* AI ПАНЕЛЬ */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '10px 15px', borderRadius: '16px' }}>
                <span style={{ fontSize: '18px' }}>✨</span>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Например: Текстовые функции (СЦЕПИТЬ, ЛЕВСИМВ)"
                    style={{ flex: '1 1 220px', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '14px' }}
                    disabled={isGenerating}
                />
                <Button variant="green" onClick={generateAITasks} disabled={isGenerating} style={{ height: '40px', padding: '0 20px', fontSize: '13px' }}>
                    {isGenerating ? "Создаём..." : "Сгенерировать"}
                </Button>
            </div>

            {/* ТЕЛО ЗАДАЧИ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-body)', padding: '25px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                
                <div>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{currentTask.title}</h3>
                    <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: '15px', lineHeight: 1.5 }}>
                        {currentTask.desc}
                    </p>
                </div>

                {/* ИМИТАЦИЯ ТАБЛИЦЫ EXCEL */}
                <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', fontFamily: 'Arial, sans-serif' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                <th style={{ width: '40px', borderRight: '1px solid #cbd5e1', padding: '8px', color: '#64748b' }}></th>
                                {currentTask.table[0].map((_, colIdx) => (
                                    <th key={colIdx} style={{ borderRight: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold', color: '#475569' }}>
                                        {getColumnLetter(colIdx)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentTask.table.map((row, rowIdx) => (
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

                {/* СТРОКА ФОРМУЛ */}
                <div style={{ position: 'relative', marginTop: '10px' }}>
                    <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#10b981', fontSize: '18px' }}>
                        fx
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            // Не даем удалить знак "="
                            if(e.target.value === "") setInputValue("=");
                            else setInputValue(e.target.value.toUpperCase());
                        }}
                        placeholder="=СУММ(A1:B1)"
                        disabled={showSuccess}
                        onKeyDown={(e) => e.key === 'Enter' && !showSuccess && checkAnswer()}
                        style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: `2px solid ${showSuccess ? '#10b981' : 'var(--glass-border)'}`, background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, outline: 'none', fontFamily: 'monospace' }}
                    />
                </div>

                <AnimatePresence>
                    {showSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#10b981', fontSize: '16px' }}>Абсолютно верно! 🎉</h4>
                                <span style={{ color: 'var(--text-main)', fontSize: '14px' }}>Результат вычисления: <b>{currentTask.result}</b></span>
                            </div>
                            <Button variant="green" onClick={nextTask}>Дальше ➔</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {!showSuccess && <Button variant="primary" onClick={checkAnswer} style={{ width: '200px' }}>Проверить</Button>}
            </div>
        </motion.div>
    );
};

Object.assign(window, { ExcelTrainerLMS });
