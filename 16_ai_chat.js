// --- 10_ai_chat.js ---
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;

    // ВСТАВЬ СЮДА СВОЙ ВЕБХУК DISCORD ДЛЯ УВЕДОМЛЕНИЙ
    const DISCORD_WEBHOOK_URL = "https://discordwebhook.msleaderindustry.workers.dev";

    /* =========================================================================
       SVG ИКОНКИ (БЕЗ ЭМОДЗИ)
       ========================================================================= */
    const AIChatIcons = {
        bubble: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
        close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
        bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
        sparkle: <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>,
        user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
        check: <polyline points="20 6 9 17 4 12" />
    };

    const ChatSvg = ({ name, size = 20, color = 'currentColor', strokeWidth = 2, style = {} }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
            {AIChatIcons[name]}
        </svg>
    );

    /* =========================================================================
       CSS СТИЛИ ВИДЖЕТА
       ========================================================================= */
    const STYLES = `
    .ai-widget-wrapper {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    .ai-fab-btn {
        width: 60px;
        height: 60px;
        border-radius: 20px;
        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        border: none;
        outline: none;
        position: relative;
    }

    .ai-chat-panel {
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 110px);
        max-width: calc(100vw - 32px);
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .ai-chat-header {
        padding: 18px 20px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .ai-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .ai-avatar {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2));
        border: 1px solid rgba(168, 85, 247, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a855f7;
    }

    .ai-title-text {
        font-size: 16px;
        font-weight: 800;
        color: #f1f5f9;
        margin: 0 0 2px 0;
        letter-spacing: 0.3px;
    }

    .ai-status-text {
        font-size: 11.5px;
        color: #10b981;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .ai-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
    }

    .ai-header-actions {
        display: flex;
        gap: 8px;
    }

    .ai-icon-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .ai-icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
    }

    .ai-icon-btn.btn-call {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.2);
    }
    .ai-icon-btn.btn-call:hover {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(245, 158, 11, 0.4);
    }

    .ai-messages-area {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .ai-messages-area::-webkit-scrollbar { width: 4px; }
    .ai-messages-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }

    .ai-msg-group {
        display: flex;
        flex-direction: column;
        max-width: 85%;
    }

    .ai-msg-group.user {
        align-self: flex-end;
    }

    .ai-msg-group.ai {
        align-self: flex-start;
    }

    .ai-msg-bubble {
        padding: 14px 18px;
        font-size: 14.5px;
        line-height: 1.5;
        border-radius: 18px;
        color: #f1f5f9;
        word-wrap: break-word;
        white-space: pre-wrap;
    }

    .ai-msg-group.user .ai-msg-bubble {
        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
        border-bottom-right-radius: 4px;
        box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2);
    }

    .ai-msg-group.ai .ai-msg-bubble {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom-left-radius: 4px;
    }

    .ai-input-wrapper {
        padding: 16px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        gap: 10px;
    }

    .ai-text-input {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 12px 16px;
        color: #f1f5f9;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
    }

    .ai-text-input:focus {
        border-color: #a855f7;
        background: rgba(255, 255, 255, 0.08);
    }

    .ai-send-btn {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        background: #a855f7;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: transform 0.15s;
    }

    .ai-send-btn:hover {
        transform: scale(1.05);
    }

    .ai-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .ai-typing-indicator {
        display: flex;
        gap: 5px;
        padding: 4px 0;
    }

    .ai-typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #a855f7;
    }
    
    .ai-system-notice {
        align-self: center;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px 0;
    }
    `;

    function useInjectAIStyles() {
        useEffect(() => {
            if (!document.getElementById("ai-chat-styles")) {
                const tag = document.createElement("style");
                tag.id = "ai-chat-styles";
                tag.textContent = STYLES;
                document.head.appendChild(tag);
            }
        }, []);
    }

    /* =========================================================================
       ОСНОВНОЙ КОМПОНЕНТ
       ========================================================================= */
    const AIChatWidget = () => {
        useInjectAIStyles();

        const [isOpen, setIsOpen] = useState(false);
        const [input, setInput] = useState("");
        const [messages, setMessages] = useState([
            { id: 1, role: "ai", text: "Привет! Я ИИ-ассистент платформы Ultimate LMS. Задай мне любой вопрос по Word или Excel." }
        ]);
        const [isTyping, setIsTyping] = useState(false);
        const [callStatus, setCallStatus] = useState(null); // 'calling', 'success', null
        
        const scrollRef = useRef(null);
        
        // Получаем имя текущего пользователя из Firebase Auth
        const user = window.auth?.currentUser;
        const userName = user?.displayName || user?.email || "Студент";

        // Прокрутка вниз при новом сообщении
        useEffect(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, [messages, isTyping, callStatus, isOpen]);

        const handleSendMessage = async () => {
            if (!input.trim() || isTyping) return;
            
            const userText = input.trim();
            setInput("");
            setMessages(prev => [...prev, { id: Date.now(), role: "user", text: userText }]);
            setIsTyping(true);

            // Промпт: Запрет на эмодзи и длинные тексты
            const prompt = `Ты полезный ИИ-ассистент образовательной платформы Ultimate LMS.
Ученик спрашивает: "${userText}"

ИНСТРУКЦИИ:
1. Отвечай кратко, доброжелательно и только по делу.
2. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать эмодзи в ответе.
3. Форматируй шаги списками (1. 2. 3. или дефисами).
4. Помогай разобраться с функциями Excel и Word, но не делай за ученика целые задания.`;

            try {
                const response = await fetch("https://gemini-proxy-lms.msleaderindustry.workers.dev", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error.message);

                const aiResponse = data.candidates[0].content.parts[0].text;
                setMessages(prev => [...prev, { id: Date.now() + 1, role: "ai", text: aiResponse }]);
            } catch (err) {
                setMessages(prev => [...prev, { id: Date.now() + 1, role: "ai", text: "К сожалению, произошла ошибка подключения. Попробуйте еще раз чуть позже." }]);
            } finally {
                setIsTyping(false);
            }
        };

        const handleCallTeacher = async () => {
            if (callStatus === "calling" || callStatus === "success") return;
            setCallStatus("calling");

            try {
                await fetch(DISCORD_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        content: `🚨 **Запрос помощи на платформе!**\nСтудент **${userName}** вызывает преподавателя.`
                    })
                });
                setCallStatus("success");
                setTimeout(() => setCallStatus(null), 5000);
            } catch (err) {
                setCallStatus(null);
                alert("Не удалось отправить вызов преподавателю.");
            }
        };

        return (
            <div className="ai-widget-wrapper">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="ai-chat-panel"
                        >
                            {/* Шапка */}
                            <div className="ai-chat-header">
                                <div className="ai-header-left">
                                    <div className="ai-avatar">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                                            <ChatSvg name="sparkle" size={22} color="#a855f7" />
                                        </motion.div>
                                    </div>
                                    <div>
                                        <h3 className="ai-title-text">ИИ Ассистент</h3>
                                        <div className="ai-status-text">
                                            <span className="ai-status-dot"></span> Готов помочь
                                        </div>
                                    </div>
                                </div>
                                <div className="ai-header-actions">
                                    <button 
                                        className="ai-icon-btn btn-call" 
                                        onClick={handleCallTeacher} 
                                        title="Позвать преподавателя"
                                    >
                                        <ChatSvg name="bell" size={18} />
                                    </button>
                                    <button className="ai-icon-btn" onClick={() => setIsOpen(false)} title="Закрыть">
                                        <ChatSvg name="close" size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Сообщения */}
                            <div className="ai-messages-area">
                                {messages.map((msg) => (
                                    <motion.div 
                                        key={msg.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`ai-msg-group ${msg.role}`}
                                    >
                                        <div className="ai-msg-bubble">{msg.text}</div>
                                    </motion.div>
                                ))}
                                
                                {isTyping && (
                                    <div className="ai-msg-group ai">
                                        <div className="ai-msg-bubble" style={{ padding: '16px 20px' }}>
                                            <div className="ai-typing-indicator">
                                                <motion.span className="ai-typing-dot" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                                <motion.span className="ai-typing-dot" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                                <motion.span className="ai-typing-dot" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {callStatus === "success" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="ai-system-notice">
                                        <ChatSvg name="check" size={14} /> Запрос отправлен наставнику
                                    </motion.div>
                                )}
                                <div ref={scrollRef} />
                            </div>

                            {/* Поле ввода */}
                            <div className="ai-input-wrapper">
                                <input
                                    type="text"
                                    className="ai-text-input"
                                    placeholder="Спроси меня о чем угодно..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    disabled={isTyping}
                                />
                                <button className="ai-send-btn" onClick={handleSendMessage} disabled={!input.trim() || isTyping}>
                                    <ChatSvg name="send" size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Плавающая кнопка (FAB) */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="ai-fab-btn"
                            onClick={() => setIsOpen(true)}
                        >
                            <ChatSvg name="sparkle" size={28} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    Object.assign(window, { AIChatWidget });
})();
