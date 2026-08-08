const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// ГРОМАДНАЯ встроенная энциклопедия функций
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
            name: "СУММЕСЛИ",
            enName: "SUMIF",
            syntax: "=СУММЕСЛИ(диапазон; критерий; [диапазон_суммирования])",
            def: "Суммирует ячейки, которые соответствуют определенному условию.",
            taskDesc: "Посчитай сумму продаж только для 'Яблоки' (Ищем 'Яблоки' в A2:A4, суммируем из B2:B4).",
            table: [
                ["Товар", "Продажи"],
                ["Яблоки", "100"],
                ["Груши", "200"],
                ["Яблоки", "150"]
            ],
            expected: ["=СУММЕСЛИ(A2:A4;\"ЯБЛОКИ\";B2:B4)", "=SUMIF(A2:A4;\"ЯБЛОКИ\";B2:B4)", "=СУММЕСЛИ(A2:A4;'ЯБЛОКИ';B2:B4)"],
            result: "250"
        },
        {
            name: "ПРОИЗВЕД",
            enName: "PRODUCT",
            syntax: "=ПРОИЗВЕД(число1; [число2]; ...)",
            def: "Перемножает все числа, заданные в качестве аргументов.",
            taskDesc: "Умножь цену (A2) на количество (B2) для первого товара.",
            table: [
                ["Цена", "Кол-во"],
                ["50", "4"],
                ["100", "2"]
            ],
            expected: ["=ПРОИЗВЕД(A2:B2)", "=PRODUCT(A2:B2)", "=A2*B2"],
            result: "200"
        },
        {
            name: "ОКРУГЛ",
            enName: "ROUND",
            syntax: "=ОКРУГЛ(число; число_разрядов)",
            def: "Округляет число до указанного количества десятичных разрядов.",
            taskDesc: "Округли число из ячейки A2 до 2 знаков после запятой.",
            table: [
                ["Число"],
                ["3.14159"]
            ],
            expected: ["=ОКРУГЛ(A2;2)", "=ROUND(A2;2)"],
            result: "3.14"
        },
        {
            name: "ОСТАТ",
            enName: "MOD",
            syntax: "=ОСТАТ(число; делитель)",
            def: "Возвращает остаток от деления одного числа на другое.",
            taskDesc: "Найди остаток от деления числа 10 (ячейка A2) на 3 (ячейка B2).",
            table: [
                ["Число", "Делитель"],
                ["10", "3"]
            ],
            expected: ["=ОСТАТ(A2;B2)", "=MOD(A2;B2)"],
            result: "1"
        }
    ],
    "Статистические": [
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
            name: "МАКС",
            enName: "MAX",
            syntax: "=МАКС(число1; ...)",
            def: "Находит самое БОЛЬШОЕ число в выделенном списке.",
            taskDesc: "Найди самую высокую температуру за неделю в столбце B.",
            table: [
                ["День", "Темп (°C)"],
                ["Пн", "22"],
                ["Вт", "28"],
                ["Ср", "25"]
            ],
            expected: ["=МАКС(B2:B4)", "=MAX(B2:B4)"],
            result: "28"
        },
        {
            name: "МИН",
            enName: "MIN",
            syntax: "=МИН(число1; ...)",
            def: "Находит самое МАЛЕНЬКОЕ число в выделенном списке.",
            taskDesc: "Найди самую низкую температуру в столбце B.",
            table: [
                ["День", "Темп (°C)"],
                ["Пн", "22"],
                ["Вт", "28"],
                ["Ср", "15"]
            ],
            expected: ["=МИН(B2:B4)", "=MIN(B2:B4)"],
            result: "15"
        },
        {
            name: "СЧЁТ",
            enName: "COUNT",
            syntax: "=СЧЁТ(значение1; ...)",
            def: "Подсчитывает количество ячеек, в которых находятся ТОЛЬКО ЧИСЛА.",
            taskDesc: "Посчитай, сколько числовых значений (цен) указано в столбце B.",
            table: [
                ["Товар", "Цена"],
                ["Яблоко", "100"],
                ["Банан", "Нет в наличии"],
                ["Груша", "150"]
            ],
            expected: ["=СЧЁТ(B2:B4)", "=COUNT(B2:B4)"],
            result: "2"
        },
        {
            name: "СЧЁТЕСЛИ",
            enName: "COUNTIF",
            syntax: "=СЧЁТЕСЛИ(диапазон; критерий)",
            def: "Подсчитывает количество ячеек, удовлетворяющих заданному условию.",
            taskDesc: "Посчитай, сколько раз слово 'Яблоко' встречается в столбце A.",
            table: [
                ["Товар", "Склад"],
                ["Яблоко", "10"],
                ["Банан", "15"],
                ["Яблоко", "12"]
            ],
            expected: ["=СЧЁТЕСЛИ(A2:A4;\"ЯБЛОКО\")", "=COUNTIF(A2:A4;\"ЯБЛОКО\")", "=СЧЁТЕСЛИ(A2:A4;'ЯБЛОКО')"],
            result: "2"
        }
    ],
    "Логические": [
        {
            name: "ЕСЛИ",
            enName: "IF",
            syntax: "=ЕСЛИ(лог_выражение; значение_истина; значение_ложь)",
            def: "Проверяет условие. Если оно верно, функция выдает один результат, если нет — другой.",
            taskDesc: "Если балл (B2) больше 3, выведи 'СДАЛ', иначе 'НЕТ'.",
            table: [
                ["Ученик", "Балл"],
                ["Иван", "4"],
                ["Анна", "2"]
            ],
            expected: ["=ЕСЛИ(B2>3;\"СДАЛ\";\"НЕТ\")", "=IF(B2>3;\"СДАЛ\";\"НЕТ\")", "=ЕСЛИ(B2>3;'СДАЛ';'НЕТ')"],
            result: "СДАЛ"
        },
        {
            name: "И",
            enName: "AND",
            syntax: "=И(логическое_значение1; ...)",
            def: "Возвращает ИСТИНА, если ВСЕ аргументы правдивы. Если хоть один ложь — возвращает ЛОЖЬ.",
            taskDesc: "Проверь ячейки второй строки: больше ли балл 4 (A2) И посещаемость 90 (B2).",
            table: [
                ["Балл", "Посещаемость"],
                ["5", "95"]
            ],
            expected: ["=И(A2>4;B2>90)", "=AND(A2>4;B2>90)"],
            result: "ИСТИНА"
        },
        {
            name: "ЕСЛИОШИБКА",
            enName: "IFERROR",
            syntax: "=ЕСЛИОШИБКА(значение; значение_при_ошибке)",
            def: "Прячет страшные ошибки (типа #ДЕЛ/0!). Если формула выдает ошибку, показывает твой текст.",
            taskDesc: "Раздели 10 (A2) на 0 (B2). Если будет ошибка, выведи слово 'Ошибка'.",
            table: [
                ["Число 1", "Число 2"],
                ["10", "0"]
            ],
            expected: ["=ЕСЛИОШИБКА(A2/B2;\"ОШИБКА\")", "=IFERROR(A2/B2;\"ОШИБКА\")", "=ЕСЛИОШИБКА(A2/B2;'ОШИБКА')"],
            result: "Ошибка"
        }
    ],
    "Текстовые": [
        {
            name: "СЦЕПИТЬ",
            enName: "CONCAT",
            syntax: "=СЦЕПИТЬ(текст1; текст2; ...)",
            def: "Склеивает (объединяет) несколько кусочков текста в один.",
            taskDesc: "Объедини имя 'Иван' (A2) и фамилию 'Иванов' (B2) в одно слово.",
            table: [
                ["Имя", "Фамилия"],
                ["Иван", "Иванов"]
            ],
            expected: ["=СЦЕПИТЬ(A2;B2)", "=CONCAT(A2;B2)", "=СЦЕП(A2;B2)"],
            result: "ИванИванов"
        },
        {
            name: "ЛЕВСИМВ",
            enName: "LEFT",
            syntax: "=ЛЕВСИМВ(текст; [кол_во_знаков])",
            def: "Отрезает и показывает указанное количество символов с НАЧАЛА (слева) текста.",
            taskDesc: "Извлеки первые 3 буквы из слова 'Яблоко' в ячейке A2.",
            table: [
                ["Слово"],
                ["Яблоко"]
            ],
            expected: ["=ЛЕВСИМВ(A2;3)", "=LEFT(A2;3)"],
            result: "Ябл"
        },
        {
            name: "ДЛСТР",
            enName: "LEN",
            syntax: "=ДЛСТР(текст)",
            def: "Просто считает, сколько всего букв и пробелов находится в ячейке.",
            taskDesc: "Посчитай количество символов в слове 'Привет' (ячейка A2).",
            table: [
                ["Текст"],
                ["Привет"]
            ],
            expected: ["=ДЛСТР(A2)", "=LEN(A2)"],
            result: "6"
        },
        {
            name: "ПРОПИСН",
            enName: "UPPER",
            syntax: "=ПРОПИСН(текст)",
            def: "Делает все буквы в выбранном тексте ЗАГЛАВНЫМИ.",
            taskDesc: "Преврати слово 'excel' (ячейка A2) в большие буквы.",
            table: [
                ["Текст"],
                ["excel"]
            ],
            expected: ["=ПРОПИСН(A2)", "=UPPER(A2)"],
            result: "EXCEL"
        }
    ],
    "Дата и время": [
        {
            name: "СЕГОДНЯ",
            enName: "TODAY",
            syntax: "=СЕГОДНЯ()",
            def: "Возвращает текущую дату компьютера. Пустые скобки обязательны!",
            taskDesc: "Выведи сегодняшнюю дату с помощью функции.",
            table: [
                ["Текущая дата"],
                ["?"]
            ],
            expected: ["=СЕГОДНЯ()", "=TODAY()"],
            result: "25.10.2023"
        },
        {
            name: "ГОД",
            enName: "YEAR",
            syntax: "=ГОД(дата)",
            def: "Вытаскивает только год из указанной даты.",
            taskDesc: "Извлеки год из даты трудоустройства в ячейке B2.",
            table: [
                ["Сотрудник", "Дата"],
                ["Иванов И.И.", "15.06.2021"],
                ["Петров П.П.", "20.11.2019"]
            ],
            expected: ["=ГОД(B2)", "=YEAR(B2)"],
            result: "2021"
        },
        {
            name: "ДЕНЬНЕД",
            enName: "WEEKDAY",
            syntax: "=ДЕНЬНЕД(дата; [тип])",
            def: "Показывает день недели в виде цифры (например, Понедельник = 1).",
            taskDesc: "Узнай номер дня недели для даты в ячейке A2.",
            table: [
                ["Дата"],
                ["20.11.2023"]
            ],
            expected: ["=ДЕНЬНЕД(A2)", "=WEEKDAY(A2)"],
            result: "1"
        }
    ],
    "Поиск и ссылки": [
        {
            name: "ВПР",
            enName: "VLOOKUP",
            syntax: "=ВПР(искомое_значение; таблица; номер_столбца; [интервал])",
            def: "Самая известная функция! Ищет значение вертикально в крайнем левом столбце таблицы и возвращает результат из соседнего столбца.",
            taskDesc: "Найди цену для 'Банан' (слово ищем в таблице A2:B3, цена лежит во 2-м столбце, 0 - точный поиск).",
            table: [
                ["Товар", "Цена"],
                ["Яблоко", "100"],
                ["Банан", "150"]
            ],
            expected: ["=ВПР(\"БАНАН\";A2:B3;2;0)", "=VLOOKUP(\"БАНАН\";A2:B3;2;0)", "=ВПР(\"БАНАН\";A2:B3;2;ЛОЖЬ)"],
            result: "150"
        },
        {
            name: "ИНДЕКС",
            enName: "INDEX",
            syntax: "=ИНДЕКС(массив; номер_строки; [номер_столбца])",
            def: "Возвращает значение из таблицы по пересечению указанного номера строки и столбца.",
            taskDesc: "Верни значение из 1-й строки и 1-го столбца диапазона A2:B3.",
            table: [
                ["Имя", "Возраст"],
                ["Анна", "20"],
                ["Иван", "25"]
            ],
            expected: ["=ИНДЕКС(A2:B3;1;1)", "=INDEX(A2:B3;1;1)"],
            result: "Анна"
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
        if (!topic.trim()) return alert("Введите название функции (например: ДВССЫЛ)!");
        setIsGenerating(true);

        const prompt = `Создай обучающую карточку для функции Excel: "${topic}".
        Верни ТОЛЬКО чистый валидный JSON (без markdown) строго в таком формате:
        {
          "name": "ИМЯ_ФУНКЦИИ",
          "enName": "ENGLISH_NAME",
          "syntax": "=ФУНКЦИЯ(арг1; арг2)",
          "def": "Понятное объяснение для ученика, что делает функция.",
          "taskDesc": "Текст практической задачи (например: 'Извлеки год из ячейки C3' или 'Найди сумму в диапазоне B2:B4').",
          "table": [
            ["Заголовок A", "Заголовок B", "Заголовок C"],
            ["Текст", "Число/Дата", "Число/Дата"],
            ["Текст", "Число/Дата", "Число/Дата"],
            ["Текст", "Число/Дата", "Число/Дата"]
          ],
          "expected": ["=ФУНКЦИЯ(ПРАВИЛЬНЫЙ_АДРЕС_ИЛИ_ДИАПАЗОН)"],
          "result": "Ожидаемый ответ"
        }
        КРИТИЧЕСКИ ВАЖНО:
        1. РАЗНООБРАЗИЕ: Запрещаю всегда ссылаться на B2! Генерируй разные сценарии. Загадывай ячейки C3, B4, A3, или диапазоны.
        2. ЛОГИКА: Формула в "expected" должна быть на 100% рабочей. Ссылайся строго на те ячейки, где лежит подходящий тип данных.
        3. Таблица должна быть реалистичной (минимум 3 строки и 2-3 столбца).`;

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
            style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', padding: '30px', margin: '0 auto', borderRadius: '24px' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#10b981' }}>Энциклопедия Excel</h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: 'linear-gradient(90deg, #10b981, #059669)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px' }}>
                        БОЛЬШАЯ БАЗА
                    </span>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* ЛЕВАЯ КОЛОНКА: Навигация по функциям */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                    {categories.map(category => (
                        <div key={category}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                {category}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {EXCEL_DATABASE[category].map(formula => (
                                    <button
                                        key={formula.name}
                                        onClick={() => { setActiveCategory(category); setActiveFormula(formula); }}
                                        style={{
                                            textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                            background: activeFormula.name === formula.name ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-panel)',
                                            color: activeFormula.name === formula.name ? '#10b981' : 'var(--text-main)',
                                            fontWeight: activeFormula.name === formula.name ? 800 : 600,
                                            cursor: 'pointer', transition: '0.2s', outline: 'none', fontSize: '13px'
                                        }}
                                    >
                                        {formula.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Поиск редкой функции через ИИ */}
                    <div style={{ marginTop: '10px', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', marginBottom: '10px' }}>✨ ИИ Справочник</div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Название функции (напр. СУММЕСЛИ)"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-body)', color: 'var(--text-main)', marginBottom: '10px', fontSize: '13px', outline: 'none' }}
                        />
                        <Button variant="primary" onClick={generateAIFormula} disabled={isGenerating} style={{ width: '100%', height: '36px', fontSize: '13px', background: 'linear-gradient(90deg, #a855f7, #6d28d9)' }}>
                            {isGenerating ? "Ищем..." : "Создать урок"}
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
                                    {activeFormula.table.map((row, rowIdx) => {
                                        if (rowIdx === 0) return null; // Пропускаем строку с заголовками, т.к. она в thead
                                        return (
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
                                        );
                                    })}
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
