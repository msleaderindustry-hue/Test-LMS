const { useState } = React;
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

// Единая палитра — не зависим от внешних CSS-переменных,
// чтобы дизайн не "ломался", если их нет в родительском приложении
const THEME = {
    accentFrom: "#a855f7",
    accentTo: "#6d28d9",
    panelBg: "#ffffff",
    pageBg: "#f4f2fb",
    border: "rgba(109, 40, 217, 0.14)",
    textMain: "#1e1b3a",
    textSec: "#6b6480",
    textOnAccent: "#ffffff",
};

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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '22px',
                padding: '32px', margin: '0 auto', borderRadius: '28px',
                background: THEME.pageBg,
                border: `1px solid ${THEME.border}`,
                boxShadow: '0 24px 60px rgba(76, 29, 149, 0.12)',
                fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif"
            }}
        >
            {/* ШАПКА */}
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '14px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${THEME.accentFrom}, ${THEME.accentTo})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(109, 40, 217, 0.35)'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="5" width="14" height="10" rx="2.5" fill="white" opacity="0.35" transform="rotate(-6 10 10)" />
                            <rect x="6" y="7" width="14" height="10" rx="2.5" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={{
                            margin: 0, fontSize: '24px', fontWeight: 800, color: THEME.textMain,
                            letterSpacing: '-0.02em'
                        }}>
                            Умные Карточки
                        </h2>
                        <span style={{
                            display: 'inline-block', marginTop: '4px', fontSize: '10px', fontWeight: 800,
                            background: `linear-gradient(90deg, ${THEME.accentFrom}, ${THEME.accentTo})`,
                            color: THEME.textOnAccent, padding: '3px 9px', borderRadius: '8px',
                            letterSpacing: '0.06em', textTransform: 'uppercase'
                        }}>
                            AI powered
                        </span>
                    </div>
                </div>
                <div style={{
                    fontSize: '15px', fontWeight: 700, color: THEME.textSec,
                    background: THEME.panelBg, border: `1px solid ${THEME.border}`,
                    padding: '8px 16px', borderRadius: '999px'
                }}>
                    {currentIndex + 1} / {cards.length}
                </div>
            </header>

            {/* AI ПАНЕЛЬ ГЕНЕРАЦИИ КОЛОДЫ */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
                background: THEME.panelBg, border: `1px solid ${THEME.border}`,
                padding: '14px', borderRadius: '18px',
                boxShadow: '0 2px 10px rgba(76, 29, 149, 0.05)'
            }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>✨</span>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Тема колоды (напр. Биология, Excel, Английский)"
                    style={{
                        flex: '1 1 220px', padding: '12px 16px', borderRadius: '12px',
                        border: `1px solid ${THEME.border}`, outline: 'none',
                        background: THEME.pageBg, color: THEME.textMain, fontSize: '15px',
                        fontFamily: 'inherit'
                    }}
                    disabled={isGenerating}
                />
                <button
                    onClick={generateAICards}
                    disabled={isGenerating}
                    style={{
                        whiteSpace: 'nowrap', padding: '0 24px', height: '46px',
                        background: `linear-gradient(90deg, ${THEME.accentFrom}, ${THEME.accentTo})`,
                        color: THEME.textOnAccent, border: 'none', borderRadius: '12px',
                        fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        opacity: isGenerating ? 0.7 : 1,
                        boxShadow: '0 8px 20px rgba(109, 40, 217, 0.3)',
                        transition: 'transform 0.15s ease'
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    {isGenerating ? "Создаём…" : "Сгенерировать колоду"}
                </button>
            </div>

            {/* ПРОГРЕСС-БАР */}
            <div style={{ width: '100%', height: '6px', background: THEME.border, borderRadius: '6px', overflow: 'hidden' }}>
                <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${THEME.accentFrom}, ${THEME.accentTo})`, borderRadius: '6px' }}
                />
            </div>

            {/* КАРТОЧКА */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', perspective: '1400px' }}>
                {isGenerating ? (
                    <div style={{
                        height: '320px', width: '100%', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: THEME.textSec,
                        background: THEME.panelBg, borderRadius: '22px', border: `1px solid ${THEME.border}`
                    }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            style={{
                                width: '38px', height: '38px', marginBottom: '16px', borderRadius: '50%',
                                border: `3px solid ${THEME.border}`, borderTopColor: THEME.accentTo
                            }}
                        />
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>ИИ собирает лучшие вопросы…</div>
                    </div>
                ) : (
                    <motion.div
                        onClick={() => setIsFlipped(!isFlipped)}
                        whileHover={{ y: -6 }}
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.55, type: "spring", stiffness: 260, damping: 22 }}
                        style={{
                            width: '100%', maxWidth: '600px', height: '320px', position: 'relative',
                            transformStyle: 'preserve-3d', cursor: 'pointer', borderRadius: '22px'
                        }}
                    >
                        {/* ВОПРОС */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: THEME.panelBg, border: `1.5px solid ${THEME.border}`, borderRadius: '22px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            padding: '40px', boxSizing: 'border-box', textAlign: 'center',
                            boxShadow: '0 18px 40px rgba(76, 29, 149, 0.12)'
                        }}>
                            <span style={{
                                padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px',
                                background: THEME.pageBg, color: THEME.textSec, border: `1px solid ${THEME.border}`
                            }}>
                                Вопрос
                            </span>
                            <h3 style={{ fontSize: '25px', margin: 0, lineHeight: 1.45, color: THEME.textMain, fontWeight: 700 }}>
                                {currentCard?.q}
                            </h3>
                            <div style={{
                                position: 'absolute', bottom: '20px', color: THEME.textSec, fontSize: '13px',
                                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500
                            }}>
                                Нажми, чтобы перевернуть
                            </div>
                        </div>

                        {/* ОТВЕТ */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            background: `linear-gradient(150deg, ${THEME.accentTo} 0%, #4c1d95 100%)`,
                            border: `1.5px solid ${THEME.accentTo}`, borderRadius: '22px',
                            transform: 'rotateY(180deg)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            padding: '40px', boxSizing: 'border-box', textAlign: 'center',
                            boxShadow: '0 18px 40px rgba(76, 29, 149, 0.3)'
                        }}>
                            <span style={{
                                padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px',
                                background: 'rgba(255,255,255,0.18)', color: '#ffffff'
                            }}>
                                Ответ
                            </span>
                            <h3 style={{ fontSize: '22px', margin: 0, lineHeight: 1.5, color: '#ffffff', fontWeight: 600 }}>
                                {currentCard?.a}
                            </h3>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* НАВИГАЦИЯ */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => changeCard(-1)}
                    disabled={isGenerating}
                    style={navBtnStyle(THEME, false)}
                >
                    ← Назад
                </button>
                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    disabled={isGenerating}
                    style={navBtnStyle(THEME, true)}
                >
                    {isFlipped ? "Скрыть ответ" : "Показать ответ"}
                </button>
                <button
                    onClick={() => changeCard(1)}
                    disabled={isGenerating}
                    style={navBtnStyle(THEME, false)}
                >
                    Вперед →
                </button>
            </div>
        </motion.div>
    );
};

function navBtnStyle(theme, primary) {
    return {
        minWidth: primary ? '200px' : '140px',
        padding: '13px 20px',
        borderRadius: '12px',
        border: primary ? 'none' : `1px solid ${theme.border}`,
        background: primary
            ? `linear-gradient(90deg, ${theme.accentFrom}, ${theme.accentTo})`
            : theme.panelBg,
        color: primary ? theme.textOnAccent : theme.textMain,
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: primary ? '0 8px 20px rgba(109, 40, 217, 0.3)' : '0 2px 8px rgba(76, 29, 149, 0.06)',
        transition: 'transform 0.15s ease'
    };
}

Object.assign(window, { FlashcardsLMS });
