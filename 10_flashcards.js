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

    const [topic, setTopic] = useState("Основы веб-разработки");
    const [isGenerating, setIsGenerating] = useState(false);

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
            const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
            console.error("Ошибка:", error);
            alert("Не удалось сгенерировать. Попробуй переформулировать запрос.");
        } finally {
            setIsGenerating(false);
        }
    };

    const changeCard = (step) => {
        if (isFlipped) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + step + cards.length) % cards.length);
            }, 300);
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
            style={{
                width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '22px',
                padding: '32px', margin: '0 auto',
                fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif"
            }}
        >
            {/* ШАПКА */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--text-main)' }}>
                        Умные <span style={{ color: '#a855f7' }}>Карточки</span>
                    </h2>
                    <span style={{ fontSize: '10px', fontWeight: 900, background: 'linear-gradient(90deg, #a855f7, #6d28d9)', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI POWERED
                    </span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-sec)', background: 'var(--bg-body)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    {currentIndex + 1} / {cards.length}
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ КОЛОДЫ */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', padding: '14px 20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '20px' }}>✨</span>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема колоды (напр. Биология, Excel)"
                    style={{ flex: '1 1 220px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '15px' }}
                    disabled={isGenerating}
                />
                <Button 
                    variant="primary"
                    onClick={generateAICards}
                    disabled={isGenerating}
                    style={{ height: '46px', padding: '0 25px' }}
                >
                    {isGenerating ? "⏳ Создаём..." : "Сгенерировать"}
                </Button>
            </div>

            {/* ПРОГРЕСС-БАР */}
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-body)', borderRadius: '6px', overflow: 'hidden' }}>
                <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #a855f7, #6d28d9)', borderRadius: '6px' }}
                />
            </div>

            {/* КАРТОЧКА */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0', perspective: '1400px' }}>
                {isGenerating ? (
                    <div style={{ height: '340px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', background: 'var(--bg-panel)', borderRadius: '22px', border: '1px solid var(--glass-border)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ fontSize: '45px', marginBottom: '15px' }}>⚙️</motion.div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>ИИ собирает лучшие вопросы…</div>
                    </div>
                ) : (
                    <motion.div
                        onClick={() => setIsFlipped(!isFlipped)}
                        whileHover={{ y: -6 }}
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.55, type: "spring", stiffness: 260, damping: 22 }}
                        style={{ width: '100%', maxWidth: '650px', height: '340px', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
                    >
                        {/* ВОПРОС (Адаптируется под тему) */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: 'var(--bg-panel)', border: '2px solid var(--glass-border)', borderRadius: '22px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            padding: '40px', boxSizing: 'border-box', textAlign: 'center',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                        }}>
                            <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', background: 'var(--bg-body)', color: 'var(--text-sec)', border: '1px solid var(--glass-border)' }}>
                                Вопрос
                            </span>
                            <h3 style={{ fontSize: '26px', margin: 0, lineHeight: 1.4, color: 'var(--text-main)', fontWeight: 800, textWrap: 'balance' }}>
                                {currentCard?.q}
                            </h3>
                            <div style={{ position: 'absolute', bottom: '25px', color: 'var(--text-sec)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                                <span style={{fontSize: '18px'}}>👆</span> Нажми, чтобы перевернуть
                            </div>
                        </div>

                        {/* ОТВЕТ (Всегда стильный фиолетовый) */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: 'linear-gradient(150deg, #6d28d9 0%, #4c1d95 100%)',
                            border: '2px solid #a855f7', borderRadius: '22px',
                            transform: 'rotateY(180deg)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            padding: '40px', boxSizing: 'border-box', textAlign: 'center',
                            boxShadow: '0 15px 35px rgba(109, 40, 217, 0.2)'
                        }}>
                            <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
                                Ответ
                            </span>
                            <h3 style={{ fontSize: '24px', margin: 0, lineHeight: 1.5, color: '#ffffff', fontWeight: 600, textWrap: 'balance' }}>
                                {currentCard?.a}
                            </h3>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* НАВИГАЦИЯ (Используем стандартные кнопки LMS) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                <Button variant="muted" onClick={() => changeCard(-1)} disabled={isGenerating} style={{ width: '140px', height: '50px' }}>
                    ← Назад
                </Button>
                <Button variant="primary" onClick={() => setIsFlipped(!isFlipped)} disabled={isGenerating} style={{ width: '200px', height: '50px' }}>
                    {isFlipped ? "Скрыть ответ" : "Показать ответ"}
                </Button>
                <Button variant="muted" onClick={() => changeCard(1)} disabled={isGenerating} style={{ width: '140px', height: '50px' }}>
                    Вперед →
                </Button>
            </div>
        </motion.div>
    );
};

Object.assign(window, { FlashcardsLMS });
