// --- КОМПОНЕНТ ЧАТА (TELEGRAM STYLE) ---
(function () {
    const { useState, useEffect, useRef } = React;
    const { motion, AnimatePresence } = window.Motion;

    // --- ВЕКТОРНЫЕ ИКОНКИ (БЕЗ ЭМОДЗИ) ---
    const Icons = {
        close: <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
        back: <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
        send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
        trashMe: <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
        trashAll: <path d="M17.651 7.65a7.131 7.131 0 00-12.68 3.15M4.05 15.05a7.125 7.125 0 0012.825-3.05m-9.525-4.5A4.5 4.5 0 1111.5 16a4.5 4.5 0 01-4.15-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
        chat: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
        check: <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    };

    const SvgIcon = ({ name, size = 24, color = 'currentColor', style = {} }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, ...style }}>
            {Icons[name]}
        </svg>
    );

    // --- УТИЛИТЫ ДЛЯ АВАТАРОК ---
    const AVATAR_COLORS = [
        ['#ef4444', '#b91c1c'], ['#f97316', '#c2410c'], ['#f59e0b', '#b45309'],
        ['#10b981', '#047857'], ['#06b6d4', '#0e7490'], ['#3b82f6', '#1d4ed8'],
        ['#8b5cf6', '#6d28d9'], ['#d946ef', '#a21caf'], ['#f43f5e', '#be123c']
    ];

    const getHash = (str) => {
        let hash = 0;
        for (let i = 0; i < (str || '').length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
        return Math.abs(hash);
    };

    const getAvatarGrad = (id) => {
        const colors = AVATAR_COLORS[getHash(id) % AVATAR_COLORS.length];
        return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(/[\s._-]+/).filter(Boolean);
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
    };

    // --- CSS СТИЛИ ДЛЯ ЧАТА ---
    const CSS = `
    .tg-chat-container {
        position: fixed; top: 0; right: 0; width: 400px; max-width: 100vw; height: 100vh;
        background: #0f172a; z-index: 9999; display: flex; flex-direction: column;
        box-shadow: -10px 0 40px rgba(0,0,0,0.5); overflow: hidden;
    }
    .tg-header {
        height: 64px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px); display: flex; alignItems: center; padding: 0 16px;
        border-bottom: 1px solid rgba(255,255,255,0.08); z-index: 10; flex-shrink: 0;
    }
    .tg-icon-btn {
        width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; background: transparent; border: none; color: #94a3b8;
        cursor: pointer; transition: all 0.2s;
    }
    .tg-icon-btn:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
    
    .tg-contact-item {
        display: flex; align-items: center; padding: 12px 16px; cursor: pointer;
        transition: background 0.2s; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.02);
    }
    .tg-contact-item:hover { background: rgba(255,255,255,0.04); }
    .tg-avatar {
        width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; color: white; font-weight: 800; font-size: 16px; flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    .tg-chat-bg {
        flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 6px;
        background-color: #0b1120;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .tg-chat-bg::-webkit-scrollbar { width: 4px; }
    .tg-chat-bg::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
    
    .tg-bubble-wrap { display: flex; flex-direction: column; max-width: 82%; position: relative; }
    .tg-bubble-wrap.mine { align-self: flex-end; }
    .tg-bubble-wrap.theirs { align-self: flex-start; }
    
    .tg-bubble {
        padding: 10px 14px; font-size: 14.5px; line-height: 1.45; position: relative;
        word-break: break-word; display: flex; flex-direction: column;
    }
    .tg-bubble.mine {
        background: linear-gradient(135deg, #3b82f6, #4f46e5); color: white;
        border-radius: 18px 18px 4px 18px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
    }
    .tg-bubble.theirs {
        background: #1e293b; color: #f1f5f9; border-radius: 18px 18px 18px 4px;
        border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .tg-meta {
        font-size: 10.5px; opacity: 0.7; align-self: flex-end; margin-top: 4px;
        display: flex; align-items: center; gap: 4px; font-weight: 600;
    }
    
    .tg-actions {
        position: absolute; top: 50%; transform: translateY(-50%); display: flex; gap: 4px;
        opacity: 0; transition: opacity 0.2s; background: rgba(15, 23, 42, 0.9); padding: 4px;
        border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px);
    }
    .tg-bubble-wrap:hover .tg-actions { opacity: 1; }
    .tg-bubble-wrap.mine .tg-actions { right: calc(100% + 8px); }
    .tg-bubble-wrap.theirs .tg-actions { left: calc(100% + 8px); }
    
    .tg-action-btn {
        width: 28px; height: 28px; border-radius: 50%; background: transparent; border: none;
        display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; transition: 0.2s;
    }
    .tg-action-btn:hover { background: rgba(255,255,255,0.1); color: #ef4444; }
    
    .tg-input-area {
        padding: 12px 16px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08);
        display: flex; gap: 10px; align-items: flex-end;
    }
    .tg-input {
        flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; padding: 12px 16px; color: white; font-size: 14.5px;
        outline: none; transition: 0.2s; min-height: 44px; font-family: inherit;
    }
    .tg-input:focus { border-color: #3b82f6; background: rgba(255,255,255,0.08); }
    
    .tg-send-btn {
        width: 44px; height: 44px; border-radius: 50%; background: #3b82f6; border: none;
        display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;
        transition: transform 0.2s, background 0.2s; flex-shrink: 0; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }
    .tg-send-btn:hover { background: #2563eb; transform: scale(1.05); }
    .tg-send-btn:active { transform: scale(0.95); }
    .tg-send-btn:disabled { background: #334155; color: #64748b; cursor: not-allowed; box-shadow: none; transform: none; }
    `;

    // Внедрение CSS
    const useInjectStyles = () => {
        useEffect(() => {
            if (!document.getElementById("tg-chat-styles")) {
                const tag = document.createElement("style");
                tag.id = "tg-chat-styles";
                tag.textContent = CSS;
                document.head.appendChild(tag);
            }
        }, []);
    };

    // --- ОСНОВНОЙ КОМПОНЕНТ ---
    const ChatPanel = ({ user, onClose }) => {
        useInjectStyles();
        const [chatUsers, setChatUsers] = useState([]);
        const [activeChat, setActiveChat] = useState(null);
        const [messages, setMessages] = useState([]);
        const [msgText, setMsgText] = useState('');
        const messagesEndRef = useRef(null);

        // Загрузка контактов
        useEffect(() => {
            if(!window.db) return;
            const unsub = window.db.collection('users').onSnapshot(snap => {
                setChatUsers(snap.docs.map(d => ({uid: d.id, ...d.data()})).filter(u => u.uid !== user.uid));
            });
            return () => unsub();
        }, [user]);

        // Загрузка сообщений
        useEffect(() => {
            if(!activeChat || !window.db) return;
            const chatId = [user.uid, activeChat.uid].sort().join('_');
            const unsub = window.db.collection('private_chats').doc(chatId).collection('messages')
                .orderBy('createdAt', 'asc')
                .onSnapshot(snap => {
                    setMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
                });
            return () => unsub();
        }, [activeChat, user]);

        const sendMessage = async () => {
            if(!msgText.trim()) return;
            const text = msgText.trim();
            setMsgText(''); // Очищаем сразу для ощущения отзывчивости
            const chatId = [user.uid, activeChat.uid].sort().join('_');
            await window.db.collection('private_chats').doc(chatId).collection('messages').add({
                text: text,
                senderId: user.uid,
                createdAt: new Date().toISOString(),
                deletedFor: [],
                deletedForEveryone: false
            });
        };

        const delForMe = async (msgId) => {
            const chatId = [user.uid, activeChat.uid].sort().join('_');
            const msgRef = window.db.collection('private_chats').doc(chatId).collection('messages').doc(msgId);
            const doc = await msgRef.get();
            if(doc.exists) {
                const data = doc.data();
                await msgRef.update({ deletedFor: [...(data.deletedFor || []), user.uid] });
            }
        };

        const delForEveryone = async (msgId) => {
            const chatId = [user.uid, activeChat.uid].sort().join('_');
            await window.db.collection('private_chats').doc(chatId).collection('messages').doc(msgId).delete();
        };

        return (
            <motion.div 
                initial={{ x: '100%', opacity: 0.5 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: '100%', opacity: 0.5 }} 
                transition={{ type: 'spring', damping: 30, stiffness: 250 }} 
                className="tg-chat-container"
            >
                {/* ШАПКА */}
                <div className="tg-header">
                    <AnimatePresence mode="wait">
                        {!activeChat ? (
                            <motion.div key="header-contacts" initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} style={{display: 'flex', alignItems: 'center', width: '100%', gap: '12px'}}>
                                <div style={{width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
                                    <SvgIcon name="chat" size={18} />
                                </div>
                                <div style={{flex: 1}}>
                                    <h3 style={{margin: 0, fontSize: '16px', fontWeight: 800, color: '#f1f5f9'}}>Контакты</h3>
                                    <div style={{fontSize: '12px', color: '#10b981', fontWeight: 600}}>В сети</div>
                                </div>
                                <button className="tg-icon-btn" onClick={onClose} title="Закрыть">
                                    <SvgIcon name="close" size={20} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="header-chat" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}} style={{display: 'flex', alignItems: 'center', width: '100%', gap: '12px'}}>
                                <button className="tg-icon-btn" onClick={() => setActiveChat(null)} style={{marginLeft: '-8px'}} title="Назад">
                                    <SvgIcon name="back" size={22} />
                                </button>
                                <div className="tg-avatar" style={{width: 38, height: 38, fontSize: 14, background: getAvatarGrad(activeChat.uid)}}>
                                    {getInitials(activeChat.nickname || activeChat.email)}
                                </div>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <h3 style={{margin: 0, fontSize: '15px', fontWeight: 800, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                        {activeChat.nickname || activeChat.email}
                                    </h3>
                                    <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600}}>
                                        {activeChat.role === 'admin' ? 'Преподаватель' : 'Студент'}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ТЕЛО ЧАТА */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        {!activeChat ? (
                            // СПИСОК КОНТАКТОВ
                            <motion.div key="view-contacts" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.2}} style={{position:'absolute', inset:0, overflowY:'auto'}}>
                                {chatUsers.length === 0 ? (
                                    <div style={{textAlign:'center', color:'#64748b', marginTop: 40, fontSize: 14, fontWeight: 600}}>Нет других пользователей</div>
                                ) : (
                                    <div style={{padding: '8px 0'}}>
                                        {chatUsers.map((u, i) => (
                                            <motion.div key={u.uid} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}} className="tg-contact-item" onClick={() => setActiveChat(u)}>
                                                <div className="tg-avatar" style={{background: getAvatarGrad(u.uid)}}>
                                                    {getInitials(u.nickname || u.email)}
                                                </div>
                                                <div style={{flex: 1, minWidth: 0}}>
                                                    <div style={{fontWeight: 800, color: '#f1f5f9', fontSize: 15, marginBottom: 2}}>{u.nickname || u.email}</div>
                                                    <div style={{fontSize: 13, color: '#64748b', fontWeight: 600}}>Написать сообщение...</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            // АКТИВНЫЙ ЧАТ
                            <motion.div key="view-chat" initial={{opacity:0, x:50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} transition={{type:'spring', stiffness:300, damping:30}} style={{position:'absolute', inset:0, display:'flex', flexDirection:'column'}}>
                                <div className="tg-chat-bg">
                                    {messages.filter(m => !(m.deletedFor || []).includes(user.uid)).map((m, i) => {
                                        const isMine = m.senderId === user.uid;
                                        return (
                                            <motion.div key={m.id} initial={{opacity:0, y:10, scale:0.95}} animate={{opacity:1, y:0, scale:1}} className={`tg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                                                <div className={`tg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                                    <span>{m.text}</span>
                                                    <div className="tg-meta">
                                                        {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        {isMine && <SvgIcon name="check" size={12} style={{marginLeft: 2}} />}
                                                    </div>
                                                </div>
                                                
                                                {/* КНОПКИ УДАЛЕНИЯ (ПОЯВЛЯЮТСЯ ПРИ НАВЕДЕНИИ) */}
                                                <div className="tg-actions">
                                                    <button className="tg-action-btn" onClick={() => delForMe(m.id)} title="Удалить у себя">
                                                        <SvgIcon name="trashMe" size={16} />
                                                    </button>
                                                    {isMine && (
                                                        <button className="tg-action-btn" onClick={() => delForEveryone(m.id)} title="Удалить у всех">
                                                            <SvgIcon name="trashAll" size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} style={{height: 1}} />
                                </div>

                                {/* ИНПУТ */}
                                <div className="tg-input-area">
                                    <input 
                                        className="tg-input" 
                                        value={msgText} 
                                        onChange={e => setMsgText(e.target.value)} 
                                        onKeyDown={e => { if(e.key === 'Enter') sendMessage() }} 
                                        placeholder="Сообщение..." 
                                    />
                                    <button className="tg-send-btn" onClick={sendMessage} disabled={!msgText.trim()}>
                                        <motion.div animate={{ x: msgText.trim() ? 2 : 0, scale: msgText.trim() ? 1.1 : 1 }}>
                                            <SvgIcon name="send" size={20} />
                                        </motion.div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    };

    Object.assign(window, { ChatPanel });
})();
