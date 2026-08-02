const { useState, useEffect } = React;

const { motion, AnimatePresence } = window.Motion;

const { Button, shuffleArray } = window;



// Ультимативная база горячих клавиш: ОС, Браузер, Word, Excel, PowerPoint

const HOTKEYS_DB = [

    // --- БАЗОВЫЕ И СИСТЕМНЫЕ ---

    { desc: "Скопировать выделенное", key: "c", visual: "Ctrl + C" },

    { desc: "Вставить из буфера", key: "v", visual: "Ctrl + V" },

    { desc: "Вырезать (удалить и скопировать)", key: "x", visual: "Ctrl + X" },

    { desc: "Отменить последнее действие", key: "z", visual: "Ctrl + Z" },

    { desc: "Вернуть отмененное действие (Redo)", key: "y", visual: "Ctrl + Y" },

    { desc: "Выделить всё (текст или объекты)", key: "a", visual: "Ctrl + A" },

    { desc: "Сохранить документ", key: "s", visual: "Ctrl + S" },

    { desc: "Отправить на печать", key: "p", visual: "Ctrl + P" },

    { desc: "Найти слово в тексте/на странице", key: "f", visual: "Ctrl + F" },

    { desc: "Создать новый файл или окно", key: "n", visual: "Ctrl + N" },

    { desc: "Открыть существующий файл", key: "o", visual: "Ctrl + O" },



    // --- ФОРМАТИРОВАНИЕ И РАБОТА С ТЕКСТОМ (Word / Офис) ---

    { desc: "Сделать текст жирным (Bold)", key: "b", visual: "Ctrl + B" },

    { desc: "Сделать текст курсивом (Italic)", key: "i", visual: "Ctrl + I" },

    { desc: "Сделать текст подчеркнутым", key: "u", visual: "Ctrl + U" },

    { desc: "Выравнивание текста по центру", key: "e", visual: "Ctrl + E" },

    { desc: "Выравнивание текста по левому краю", key: "l", visual: "Ctrl + L" },

    { desc: "Выравнивание текста по правому краю", key: "r", visual: "Ctrl + R" },

    { desc: "Выравнивание текста по ширине (Justify)", key: "j", visual: "Ctrl + J" },

    { desc: "Вставить гиперссылку", key: "k", visual: "Ctrl + K" },

    { desc: "Открыть окно замены текста (Replace)", key: "h", visual: "Ctrl + H" },



    // --- POWERPOINT И EXCEL ---

    { desc: "Создать новый слайд (PowerPoint)", key: "m", visual: "Ctrl + M" },

    { desc: "Дублировать выделенный объект/слайд", key: "d", visual: "Ctrl + D" },

    

    // --- НАВИГАЦИЯ В БРАУЗЕРЕ (Chrome, Edge, Safari) ---

    { desc: "Открыть новую вкладку", key: "t", visual: "Ctrl + T" },

    { desc: "Закрыть текущую вкладку", key: "w", visual: "Ctrl + W" },

    { desc: "Обновить страницу", key: "r", visual: "Ctrl + R" },

    { desc: "Открыть историю браузера", key: "h", visual: "Ctrl + H" },

    { desc: "Открыть список загрузок", key: "j", visual: "Ctrl + J" },

    { desc: "Добавить страницу в закладки", key: "d", visual: "Ctrl + D" },

    { desc: "Выделить адресную строку", key: "l", visual: "Ctrl + L" }

];



const HotkeyTrainer = ({ onBack }) => {

    const [tasks, setTasks] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const [score, setScore] = useState(0);

    const [shake, setShake] = useState(false);

    const [successPulse, setSuccessPulse] = useState(false);

    const [isFinished, setIsFinished] = useState(false);



    // При старте перемешиваем список клавиш и берем 10 случайных для одной игры

    useEffect(() => {

        resetGame();

    }, []);



    const resetGame = () => {

        setTasks(shuffleArray([...HOTKEYS_DB]).slice(0, 10)); 

        setCurrentIndex(0);

        setScore(0);

        setIsFinished(false);

    };



    useEffect(() => {

        if (isFinished || tasks.length === 0) return;



        const handleKeyDown = (e) => {

            // Игнорируем просто нажатие сервисных клавиш

            if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") return;



            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            const currentTask = tasks[currentIndex];



            if (isCtrlOrCmd) {

                e.preventDefault(); // Блокируем стандартные действия браузера (чтобы Ctrl+S не открывал окно сохранения и т.д.)



                if (e.key.toLowerCase() === currentTask.key) {

                    // Правильный ответ!

                    setSuccessPulse(true);

                    setScore(prev => prev + 1);

                    setTimeout(() => setSuccessPulse(false), 200);



                    if (currentIndex < tasks.length - 1) {

                        setCurrentIndex(prev => prev + 1);

                    } else {

                        setIsFinished(true);

                    }

                } else {

                    // Нажал Ctrl, но не ту букву

                    setShake(true);

                    setTimeout(() => setShake(false), 300);

                }

            } else {

                // Нажал букву без Ctrl

                setShake(true);

                setTimeout(() => setShake(false), 300);

            }

        };



        window.addEventListener("keydown", handleKeyDown, { passive: false });

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [currentIndex, tasks, isFinished]);



    if (tasks.length === 0) return null;



    const currentTask = tasks[currentIndex];

    const progress = (currentIndex / tasks.length) * 100;



    return (

        <motion.div 

            className="glass-panel"

            initial={{ opacity: 0, y: 30 }}

            animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}

            transition={shake ? { duration: 0.3 } : { duration: 0.6, ease: "easeOut" }}

            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px' }}

        >

            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px'}}>

                <h2 style={{margin: 0, fontSize: '28px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>

                    Хоткеи ⚡

                </h2>

                <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--text-sec)'}}>

                    {currentIndex} / {tasks.length}

                </div>

            </header>



            {!isFinished ? (

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '20px 0'}}>

                    <div style={{fontSize: '20px', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>

                        Зажмите Ctrl и нужную клавишу:

                    </div>

                    

                    <motion.div 

                        key={currentIndex}

                        initial={{ opacity: 0, scale: 0.8 }}

                        animate={{ opacity: 1, scale: successPulse ? 1.05 : 1 }}

                        transition={{ duration: 0.2 }}

                        style={{

                            fontSize: '32px', fontWeight: '800', textAlign: 'center', color: successPulse ? '#10b981' : 'var(--text-main)'

                        }}

                    >

                        «{currentTask.desc}»

                    </motion.div>



                    <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>

                        <div style={{padding: '15px 25px', background: 'rgba(0,0,0,0.1)', border: '2px solid var(--glass-border)', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>

                            Ctrl

                        </div>

                        <div style={{fontSize: '30px', fontWeight: 'bold', color: 'var(--text-sec)', display: 'flex', alignItems: 'center'}}>+</div>

                        <div style={{padding: '15px 25px', background: 'rgba(0,0,0,0.1)', border: '2px dashed var(--accent-glow, #0ea5e9)', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-glow, #0ea5e9)', boxShadow: 'inset 0 0 10px rgba(14,165,233,0.2)'}}>

                            ?

                        </div>

                    </div>

                    

                    <div style={{width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', overflow: 'hidden', marginTop: '10px'}}>

                        <motion.div 

                            initial={{ width: `${progress}%` }}

                            animate={{ width: `${(currentIndex / tasks.length) * 100}%` }}

                            style={{ height: '100%', background: 'linear-gradient(90deg, #f6d365, #fda085)' }}

                        />

                    </div>

                </div>

            ) : (

                <motion.div 

                    initial={{ opacity: 0, scale: 0.9 }}

                    animate={{ opacity: 1, scale: 1 }}

                    style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}

                >

                    <h2 style={{ fontSize: '42px', margin: 0, color: '#10b981' }}>Отличная работа!</h2>

                    <p style={{ fontSize: '18px', color: 'var(--text-sec)' }}>Вы успешно закрепили {score} горячих клавиш в мышечной памяти.</p>

                    <Button variant="orange" onClick={resetGame} style={{ width: '250px', marginTop: '20px' }}>Пройти еще раз</Button>

                </motion.div>

            )}

        </motion.div>

    );

};



Object.assign(window, { HotkeyTrainer }); 

