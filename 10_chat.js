// =====================================================================
// КОМПОНЕНТ ЧАТА
// Полностью переработанный дизайн: без эмодзи, только векторные иконки,
// статусы прочтения (галочки), непрочитанные метки, всплывающие
// уведомления о новых сообщениях (как в Telegram) и аккуратные анимации.
// =====================================================================

// ---------- Иконки (inline SVG, единый стиль обводки) ----------
const Icon = ({ children, size = 20, style, ...rest }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        style={{ display: 'block', flexShrink: 0, ...style }} {...rest}>
        {children}
    </svg>
);

const IconClose = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
const IconBack = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6" /></Icon>;
const IconSend = (p) => <Icon {...p}><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></Icon>;
const IconMore = (p) => <Icon {...p} strokeWidth="0">
    <circle cx="12" cy="5" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="19" r="1.6" fill="currentColor" />
</Icon>;
const IconTrash = (p) => <Icon {...p}>
    <path d="M4 7h16" /><path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
</Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>;
const IconCheckDouble = (p) => <Icon {...p}><path d="M17.5 6 8 15.5l-4-4" /><path d="M22.5 6 13 15.5" /></Icon>;
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" /></Icon>;
const IconMessages = (p) => <Icon {...p}><path d="M21 11.5a8.5 8.5 0 0 1-9.8 8.4c-.9-.13-1.75-.4-2.53-.78L3 21l1.9-4.32A8.5 8.5 0 1 1 21 11.5Z" /></Icon>;

// ---------- Вспомогательные функции ----------
const pad = (n) => String(n).padStart(2, '0');
const timeHM = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatListTime(iso) {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    if (isSameDay(d, now)) return timeHM(d);
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (isSameDay(d, yesterday)) return 'вчера';
    if ((now - d) / 86400000 < 7) return WEEKDAYS[d.getDay()];
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatDividerLabel(iso) {
    const d = new Date(iso), now = new Date();
    if (isSameDay(d, now)) return 'Сегодня';
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (isSameDay(d, yesterday)) return 'Вчера';
    return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? ' ' + d.getFullYear() : ''}`;
}

function getInitials(u) {
    const src = (u?.nickname || u?.email || '?').trim();
    const parts = src.split(/[\s._@]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
}

// Presence используется только для анимации выхода; если библиотека
// не подключена глобально — компонент просто рендерит детей как есть.
const Presence = typeof AnimatePresence !== 'undefined' ? AnimatePresence : (({ children }) => children ?? null);

// ---------- Аватар ----------
const Avatar = ({ person, size = 44 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', background: 'var(--primary-grad)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 700, letterSpacing: 0.3, flexShrink: 0, userSelect: 'none'
    }}>
        {getInitials(person)}
    </div>
);

// ---------- Пункт меню сообщения ----------
const MenuItem = ({ icon, label, danger, onClick }) => (
    <div
        onClick={onClick}
        className="chat-menu-item"
        style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
            fontSize: 13.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
            color: danger ? 'var(--danger, #ff5c5c)' : 'var(--text-main)'
        }}
    >
        {icon}{label}
    </div>
);

// ---------- Разделитель дат в переписке ----------
const DateDivider = ({ label }) => (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 4px' }}>
        <span style={{
            fontSize: 11.5, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-sec)'
        }}>{label}</span>
    </div>
);

// ---------- Основной компонент ----------
const ChatPanel = ({ user, onClose }) => {
    const [chatUsers, setChatUsers] = useState([]);
    const [chatMeta, setChatMeta] = useState({});      // { [uid]: { last, unread } }
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [peerRead, setPeerRead] = useState(null);     // ISO-время последнего прочтения собеседником
    const [msgText, setMsgText] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [notification, setNotification] = useState(null);

    const messagesEndRef = useRef(null);
    const activeChatRef = useRef(null);
    const initializedRef = useRef({});
    const lastSeenIdsRef = useRef({});
    const notifTimerRef = useRef(null);

    useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

    // Список пользователей
    useEffect(() => {
        if (!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(snap => {
            setChatUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.uid !== user.uid));
        });
        return () => unsub();
    }, [user]);

    // Метаданные по каждому контакту: последнее сообщение, счётчик непрочитанных,
    // плюс уведомление о новом входящем сообщении (если чат с этим контактом не открыт).
    useEffect(() => {
        if (!window.db || chatUsers.length === 0) { setChatMeta({}); return; }

        const unsubs = chatUsers.map(u => {
            const chatId = [user.uid, u.uid].sort().join('_');
            const chatDocRef = window.db.collection('private_chats').doc(chatId);
            let myRead = null;
            let docs = [];

            const recompute = () => {
                const last = docs[0] || null;
                const unread = docs.filter(m => m.senderId === u.uid && (!myRead || m.createdAt > myRead)).length;
                setChatMeta(prev => ({ ...prev, [u.uid]: { last, unread } }));
            };

            const unsubDoc = chatDocRef.onSnapshot(docSnap => {
                const data = docSnap.data() || {};
                myRead = (data.read && data.read[user.uid]) || null;
                recompute();
            });

            const unsubMsgs = chatDocRef.collection('messages').orderBy('createdAt', 'desc').limit(50)
                .onSnapshot(snap => {
                    docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                        .filter(m => !(m.deletedFor || []).includes(user.uid));
                    recompute();

                    const last = docs[0];
                    if (!initializedRef.current[u.uid]) {
                        // Не показываем уведомление за историю при первой загрузке
                        initializedRef.current[u.uid] = true;
                        lastSeenIdsRef.current[u.uid] = last?.id;
                        return;
                    }
                    if (last && last.senderId === u.uid && last.id !== lastSeenIdsRef.current[u.uid]) {
                        lastSeenIdsRef.current[u.uid] = last.id;
                        if (activeChatRef.current?.uid !== u.uid) {
                            setNotification({ person: u, text: last.text });
                        }
                    }
                });

            return () => { unsubDoc(); unsubMsgs(); };
        });

        return () => unsubs.forEach(fn => fn());
    }, [chatUsers, user]);

    // Автоскрытие уведомления
    useEffect(() => {
        clearTimeout(notifTimerRef.current);
        if (notification) notifTimerRef.current = setTimeout(() => setNotification(null), 4500);
        return () => clearTimeout(notifTimerRef.current);
    }, [notification]);

    // Переписка активного чата + статус прочтения собеседником + отметка "прочитано"
    useEffect(() => {
        if (!activeChat || !window.db) { setPeerRead(null); return; }
        const chatId = [user.uid, activeChat.uid].sort().join('_');
        const chatDocRef = window.db.collection('private_chats').doc(chatId);

        const unsubMsgs = chatDocRef.collection('messages').orderBy('createdAt', 'asc')
            .onSnapshot(snap => {
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setMessages(list);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

                const lastMsg = list[list.length - 1];
                if (lastMsg && lastMsg.senderId !== user.uid) {
                    chatDocRef.set({ [`read.${user.uid}`]: new Date().toISOString() }, { merge: true }).catch(() => {});
                }
            });

        const unsubRead = chatDocRef.onSnapshot(docSnap => {
            const data = docSnap.data() || {};
            setPeerRead((data.read && data.read[activeChat.uid]) || null);
        });

        // Помечаем чат прочитанным сразу при открытии
        chatDocRef.set({ [`read.${user.uid}`]: new Date().toISOString() }, { merge: true }).catch(() => {});

        return () => { unsubMsgs(); unsubRead(); };
    }, [activeChat, user]);

    // Закрытие контекстного меню сообщения по клику вовне
    useEffect(() => {
        if (!openMenuId) return;
        const close = () => setOpenMenuId(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openMenuId]);

    const sendMessage = async () => {
        if (!msgText.trim() || !activeChat) return;
        const chatId = [user.uid, activeChat.uid].sort().join('_');
        const text = msgText.trim();
        setMsgText('');
        await window.db.collection('private_chats').doc(chatId).collection('messages').add({
            text, senderId: user.uid, createdAt: new Date().toISOString(),
            deletedFor: [], deletedForEveryone: false
        });
    };

    const delForMe = async (msgId) => {
        const chatId = [user.uid, activeChat.uid].sort().join('_');
        const msgRef = window.db.collection('private_chats').doc(chatId).collection('messages').doc(msgId);
        const doc = await msgRef.get();
        if (doc.exists) {
            const data = doc.data();
            await msgRef.update({ deletedFor: [...(data.deletedFor || []), user.uid] });
        }
    };

    const delForEveryone = async (msgId) => {
        const chatId = [user.uid, activeChat.uid].sort().join('_');
        await window.db.collection('private_chats').doc(chatId).collection('messages').doc(msgId).delete();
    };

    const openFromNotification = (person) => {
        setNotification(null);
        setActiveChat(person);
    };

    const visibleMessages = messages.filter(m => !(m.deletedFor || []).includes(user.uid));

    return (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass-chat-panel" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* Встроенные стили: анимации и состояния, не зависящие от внешнего CSS */}
            <style>{`
                @keyframes chatBadgePop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .chat-user-card { transition: background 0.15s ease, transform 0.15s ease; }
                .chat-user-card:hover { background: var(--glass-bg) !important; }
                .chat-user-card:active { transform: scale(0.98); }
                .chat-badge { animation: chatBadgePop 0.25s ease; }
                .chat-more-btn { opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
                .chat-bubble:hover .chat-more-btn, .chat-more-btn.is-open { opacity: 0.65; }
                .chat-more-btn:hover { opacity: 1 !important; background: rgba(127,127,127,0.18); }
                .chat-menu-item:hover { background: rgba(127,127,127,0.14); }
                .chat-send-btn:disabled { opacity: 0.4; cursor: default; }
            `}</style>

            {/* Уведомление о новом сообщении */}
            <Presence>
                {notification && (
                    <motion.div key="notif"
                        initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -70, opacity: 0 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                        onClick={() => openFromNotification(notification.person)}
                        style={{
                            position: 'absolute', top: 14, left: 14, right: 14, zIndex: 60,
                            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                            borderRadius: 16, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            backdropFilter: 'blur(20px)', boxShadow: '0 10px 28px rgba(0,0,0,0.28)', cursor: 'pointer'
                        }}>
                        <Avatar person={notification.person} size={38} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                                {notification.person.nickname || notification.person.email}
                            </div>
                            <div style={{ fontSize: 12.5, color: 'var(--text-sec)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {notification.text}
                            </div>
                        </div>
                        <Button variant="muted" onClick={(e) => { e.stopPropagation(); setNotification(null); }}
                            style={{ width: 28, height: 28, minWidth: 28, padding: 0, borderRadius: '50%', flexShrink: 0 }}>
                            <IconClose size={13} />
                        </Button>
                    </motion.div>
                )}
            </Presence>

            {/* Заголовок */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
                {activeChat && (
                    <Button variant="muted" onClick={() => setActiveChat(null)}
                        style={{ width: 40, height: 40, minWidth: 40, padding: 0, borderRadius: '50%', flexShrink: 0 }}>
                        <IconBack size={19} />
                    </Button>
                )}
                {activeChat && <Avatar person={activeChat} size={38} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeChat ? (activeChat.nickname || activeChat.email) : 'Контакты'}
                    </h3>
                </div>
                <Button variant="muted" onClick={onClose}
                    style={{ width: 40, height: 40, minWidth: 40, padding: 0, borderRadius: '50%', flexShrink: 0 }}>
                    <IconClose size={18} />
                </Button>
            </div>

            {/* Тело */}
            <div style={{ flex: 1, overflowY: 'auto', padding: activeChat ? '18px 16px' : '14px', scrollbarWidth: 'thin' }}>
                {!activeChat ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {chatUsers.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-sec)', marginTop: 60 }}>
                                <IconMessages size={34} style={{ opacity: 0.5 }} />
                                <span style={{ fontSize: 13.5 }}>Нет других пользователей</span>
                            </div>
                        )}
                        {chatUsers.map(u => {
                            const meta = chatMeta[u.uid];
                            const hasUnread = (meta?.unread || 0) > 0;
                            return (
                                <motion.div layout key={u.uid} onClick={() => setActiveChat(u)} className="chat-user-card"
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 16, cursor: 'pointer', border: '1px solid transparent' }}>
                                    <Avatar person={u} size={46} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14.5, fontWeight: hasUnread ? 700 : 600, marginBottom: 3 }}>
                                            {u.nickname || u.email}
                                        </div>
                                        <div style={{
                                            fontSize: 12.5, color: hasUnread ? 'var(--text-main)' : 'var(--text-sec)',
                                            opacity: hasUnread ? 0.9 : 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>
                                            {meta?.last
                                                ? `${meta.last.senderId === user.uid ? 'Вы: ' : ''}${meta.last.text}`
                                                : 'Нет сообщений'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                        {meta?.last && (
                                            <span style={{ fontSize: 11, color: hasUnread ? 'var(--accent, var(--text-main))' : 'var(--text-sec)', fontWeight: hasUnread ? 700 : 400 }}>
                                                {formatListTime(meta.last.createdAt)}
                                            </span>
                                        )}
                                        {hasUnread && (
                                            <span className="chat-badge" style={{
                                                minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10,
                                                background: 'var(--primary-grad)', color: '#fff', fontSize: 11, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {meta.unread > 99 ? '99+' : meta.unread}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {visibleMessages.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-sec)', marginTop: 60 }}>
                                <IconUser size={30} style={{ opacity: 0.5 }} />
                                <span style={{ fontSize: 13.5 }}>Сообщений пока нет — напишите первым</span>
                            </div>
                        )}
                        {visibleMessages.map((m, i) => {
                            const isMine = m.senderId === user.uid;
                            const prev = visibleMessages[i - 1];
                            const showDivider = !prev || !isSameDay(new Date(prev.createdAt), new Date(m.createdAt));
                            const isRead = isMine && peerRead && m.createdAt <= peerRead;

                            return (
                                <React.Fragment key={m.id}>
                                    {showDivider && <DateDivider label={formatDividerLabel(m.createdAt)} />}
                                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="chat-bubble"
                                        style={{
                                            alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '78%', position: 'relative',
                                            background: isMine ? 'var(--primary-grad)' : 'var(--glass-bg)',
                                            color: isMine ? '#fff' : 'var(--text-main)',
                                            padding: '10px 14px', borderRadius: 16, border: '1px solid var(--glass-border)',
                                            wordBreak: 'break-word',
                                            borderBottomRightRadius: isMine ? 4 : 16,
                                            borderBottomLeftRadius: !isMine ? 4 : 16
                                        }}>
                                        <div style={{ marginBottom: 4, fontSize: 14, lineHeight: 1.45, paddingRight: 6 }}>{m.text}</div>
                                        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', alignItems: 'center', opacity: 0.8 }}>
                                            <span style={{ fontSize: 10.5 }}>{timeHM(new Date(m.createdAt))}</span>
                                            {isMine && (isRead
                                                ? <IconCheckDouble size={13} />
                                                : <IconCheck size={13} style={{ opacity: 0.75 }} />)}
                                        </div>

                                        <button
                                            className={`chat-more-btn${openMenuId === m.id ? ' is-open' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === m.id ? null : m.id); }}
                                            style={{
                                                position: 'absolute', top: 4, right: 4, width: 22, height: 22, border: 'none',
                                                borderRadius: '50%', background: 'transparent', color: 'inherit', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                            <IconMore size={14} />
                                        </button>

                                        <Presence>
                                            {openMenuId === m.id && (
                                                <motion.div key="menu" onClick={(e) => e.stopPropagation()}
                                                    initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                                    transition={{ duration: 0.14 }}
                                                    style={{
                                                        position: 'absolute', top: 28, [isMine ? 'right' : 'left']: 0, zIndex: 30,
                                                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12,
                                                        padding: 5, minWidth: 180, boxShadow: '0 10px 24px rgba(0,0,0,0.3)', backdropFilter: 'blur(18px)'
                                                    }}>
                                                    <MenuItem icon={<IconTrash size={15} />} label="Удалить у меня"
                                                        onClick={() => { delForMe(m.id); setOpenMenuId(null); }} />
                                                    {isMine && (
                                                        <MenuItem icon={<IconTrash size={15} />} danger label="Удалить у всех"
                                                            onClick={() => { delForEveryone(m.id); setOpenMenuId(null); }} />
                                                    )}
                                                </motion.div>
                                            )}
                                        </Presence>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Поле ввода */}
            {activeChat && (
                <div style={{
                    padding: '14px 16px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
                    borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0
                }}>
                    <Input value={msgText} onChange={e => setMsgText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                        placeholder="Сообщение" style={{ margin: 0, flex: 1, borderRadius: 24 }} />
                    <Button variant="primary" onClick={sendMessage} disabled={!msgText.trim()} className="chat-send-btn"
                        style={{ width: 46, height: 46, minWidth: 46, padding: 0, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconSend size={18} style={{ marginLeft: -1, marginBottom: -1 }} />
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, { ChatPanel });
