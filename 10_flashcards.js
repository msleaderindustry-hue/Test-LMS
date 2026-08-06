const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

// Резервная база карточек
const DEFAULT_CARDS = [
    { q: "Что означает аббревиатура HTML?", a: "HyperText Markup Language (Язык гипертекстовой разметки)." },
    { q: "За что отвечает CSS на веб-странице?", a: "За внешний вид, цвета, шрифты и расположение элементов (стилизацию)." },
    { q: "Для чего нужен тег <a> в HTML?", a: "Он создает гиперссылку для перехода на другую страницу или сайт." },
    { q: "Какая комбинация клавиш отменяет последнее действие?", a: "Ctrl + Z" },
    { q: "Что делает свойство 'display: flex' в CSS?", a: "Включает гибкую модель (Flexbox), которая позволяет легко выравнивать элементы." }
];

const FlashcardsLMS = ({ onBack }) => {
    const [cards, setCards] = useState(DEFAULT_CARDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Состояния ИИ
    const [topic, setTopic] = useState("Основы веб-разработки");
    const [isGenerating, setIsGenerating] = useState(false);

    // Функция генерации базы через ИИ
    const generateAICards = async () => {
        if (!topic.trim()) return alert("Введите тему для карточек!");
        setIsGenerating(true);

        const prompt = `Сгенерируй 10 умных карточек (вопрос-ответ) для обучения на тему: "${topic}". 
        Верни ТОЛЬКО чистый валидный JSON массив объектов, без форматирования markdown, без пояснений. 
        Формат строго такой:
        [
          {"q": "Сам вопрос?", "a": "Короткий, но емкий ответ."}
        ]`;

        try {
            console.log("🚀 Запрашиваем карточки у ИИ...");
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "Ошибка API");
            if (!data.candidates || data.candidates.length === 0) throw new Error("Пустой ответ от ИИ");

            let aiText = data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("ИИ не вернул JSON массив");

            const parsedCards = JSON.parse(jsonMatch[0]);
            
            if (Array.isArray(parsedCards) && parsedCards.length > 0) {
                setCards(parsedCards);
                setCurrentIndex(0);
                setIsFlipped(false);
            } else {
                throw new Error("Неверный формат данных");
            }
        } catch (error) {
            console.error("❌ Ошибка:", error);
            alert("Не удалось сгенерировать. Попробуй переформулировать запрос.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Переключение карточек с умной задержкой (если карточка перевернута)
    const changeCard = (step) => {
        if (isFlipped) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + step + cards.length) % cards.length);
            }, 300); // Ждем завершения анимации переворота
        } else {
            setCurrentIndex(prev => (prev + step + cards.length) % cards.length);
        }
    };

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px', margin: '0 auto' }}
        >
            {/* ШАПКА */}
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <h2 style={{margin: 0, fontSize: '28px', background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        Умные Карточки 🎴
                    </h2>
                    <span style={{fontSize: '11px', fontWeight: '900', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px', textTransform: 'uppercase'}}>
                        AI POWERED
                    </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--text-sec)'}}>
                        {currentIndex + 1} / {cards.length}
                    </div>
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ КОЛОДЫ */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: 'var(--bg-body)', border: '1px solid var(--glass-border)', padding: '15px 20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '20px' }}>✨</span>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема колоды (напр. Биология, Excel, Английский)"
                    style={{ flex: '1 1 auto', minWidth: '200px', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontSize: '15px' }}
                    disabled={isGenerating}
                />
                <button 
                    onClick={generateAICards} 
                    disabled={isGenerating}
                    style={{ whiteSpace: 'nowrap', padding: '0 25px', height: '46px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1, boxShadow: '0 4px 15px rgba(109, 40, 217, 0.3)' }}
                >
                    {isGenerating ? "Создаем..." : "Сгенерировать колоду"}
                </button>
            </div>

            {/* ПРОГРЕСС-БАР */}
            <div style={{width: '100%', height: '6px', background: 'var(--bg-body)', borderRadius: '6px', overflow: 'hidden'}}>
                <motion.div 
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #a855f7, #6d28d9)' }}
                />
            </div>

            {/* 3D СЦЕНА С КАРТОЧКОЙ */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', perspective: '1200px' }}>
                {isGenerating ? (
                    <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '40px', marginBottom: '15px' }}>⚙️</motion.div>
                        <div style={{ fontSize: '18px' }}>ИИ собирает лучшие вопросы...</div>
                    </div>
                ) : (
                    <motion.div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{
                            width: '100%', maxWidth: '650px', height: '350px', position: 'relative', 
                            transformStyle: 'preserve-3d', cursor: 'pointer', borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        {/* ЛИЦЕВАЯ СТОРОНА (Вопрос) */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: 'var(--bg-panel)', border: '2px solid var(--glass-border)', borderRadius: '24px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            padding: '40px', boxSizing: 'border-box', textAlign: 'center'
                        }}>
                            <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', background: 'var(--bg-body)', color: 'var(--text-sec)' }}>
                                Вопрос
                            </div>
                            <h3 style={{ fontSize: '28px', margin: 0, lineHeight: '1.4', color: 'var(--text-main)', fontWeight: '700' }}>
                                {currentCard?.q}
                            </h3>
                            <div style={{ position: 'absolute', bottom: '20px', color: 'var(--text-sec)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{fontSize: '16px'}}>👆</span> Нажми, чтобы перевернуть
                            </div>
                        </div>

                        {/* ОБРАТНАЯ СТОРОНА (Ответ) */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.15) 0%, var(--bg-panel) 100%)',
                            border: '2px solid #8b5cf6', borderRadius: '24px', transform: 'rotateY(180deg)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            padding: '40px', boxSizing: 'border-box', textAlign: 'center',
                            boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.1)'
                        }}>
                            <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', background: '#8b5cf6', color: '#fff' }}>
                                Ответ
                            </div>
                            <h3 style={{ fontSize: '24px', margin: 0, lineHeight: '1.5', color: '#e2e8f0', fontWeight: '500' }}>
                                {currentCard?.a}
                            </h3>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* КОНТРОЛЛЕРЫ НАВИГАЦИИ */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <Button variant="muted" onClick={() => changeCard(-1)} style={{ width: '150px' }} disabled={isGenerating}>
                    ← Назад
                </Button>
                <Button variant="primary" onClick={() => setIsFlipped(!isFlipped)} style={{ width: '200px' }} disabled={isGenerating}>
                    {isFlipped ? "Скрыть ответ" : "Показать ответ"}
                </Button>
                <Button variant="muted" onClick={() => changeCard(1)} style={{ width: '150px' }} disabled={isGenerating}>
                    Вперед →
                </Button>
            </div>
        </motion.div>
    );
};

Object.assign(window, { FlashcardsLMS });
