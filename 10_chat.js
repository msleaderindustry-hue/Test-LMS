// --- КОМПОНЕНТ ЧАТА ---
const ChatPanel = ({ user, onClose }) => {
    const [chatUsers, setChatUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgText, setMsgText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if(!window.db) return;
        const unsub = window.db.collection('users').onSnapshot(snap => {
            setChatUsers(snap.docs.map(d => ({uid: d.id, ...d.data()})).filter(u => u.uid !== user.uid));
        });
        return () => unsub();
    }, [user]);

    useEffect(() => {
        if(!activeChat || !window.db) return;
        const chatId = [user.uid, activeChat.uid].sort().join('_');
        const unsub = window.db.collection('private_chats').doc(chatId).collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot(snap => {
                setMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            });
        return () => unsub();
    }, [activeChat, user]);

    const sendMessage = async () => {
        if(!msgText.trim()) return;
        const chatId = [user.uid, activeChat.uid].sort().join('_');
        await window.db.collection('private_chats').doc(chatId).collection('messages').add({
            text: msgText.trim(),
            senderId: user.uid,
            createdAt: new Date().toISOString(),
            deletedFor: [],
            deletedForEveryone: false
        });
        setMsgText('');
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
        <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', damping:25, stiffness:200}} className="glass-chat-panel">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px', borderBottom:'1px solid var(--glass-border)', flexShrink: 0}}>
                <h3 style={{margin:0, fontSize:18, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px'}}>
                    {activeChat ? `💬 ${activeChat.nickname || activeChat.email}` : '💬 Контакты'}
                </h3>
                <Button variant="muted" onClick={() => activeChat ? setActiveChat(null) : onClose()} style={{width:44, height:44, minWidth: 44, padding:0, borderRadius:'50%', flexShrink: 0}}>✖</Button>
            </div>

            <div style={{flex:1, overflowY:'auto', padding:'20px', scrollbarWidth:'thin'}}>
                {!activeChat ? (
                    <div style={{display:'flex', flexDirection:'column', gap:10}}>
                        {chatUsers.length === 0 && <div style={{textAlign:'center', color:'var(--text-sec)', marginTop: 20}}>Нет других пользователей</div>}
                        {chatUsers.map(u => (
                            <div key={u.uid} onClick={()=>setActiveChat(u)} className="chat-user-card" style={{padding:15, borderRadius:14, background:'var(--variant-default)', cursor:'pointer', border:'1px solid var(--glass-border)'}}>
                                👤 <b style={{fontSize: 14}}>{u.nickname || u.email}</b>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:15}}>
                        {messages.filter(m => !(m.deletedFor || []).includes(user.uid)).map(m => {
                            const isMine = m.senderId === user.uid;
                            return (
                                <div key={m.id} className="chat-bubble" style={{alignSelf: isMine?'flex-end':'flex-start', maxWidth:'80%', background: isMine?'var(--primary-grad)':'var(--glass-bg)', color: isMine?'white':'var(--text-main)', padding:'12px 16px', borderRadius:'16px', border:'1px solid var(--glass-border)', position:'relative', wordBreak:'break-word', borderBottomRightRadius: isMine ? '4px' : '16px', borderBottomLeftRadius: !isMine ? '4px' : '16px'}}>
                                    <div style={{marginBottom:6, fontSize: 14}}>{m.text}</div>
                                    <div style={{display:'flex', gap:12, fontSize:10, justifyContent:'flex-end', opacity:0.8}}>
                                        <span>{new Date(m.createdAt).toLocaleTimeString().slice(0,5)}</span>
                                        <span style={{cursor:'pointer', fontWeight: 600}} onClick={()=>delForMe(m.id)}>🗑️ У себя</span>
                                        {isMine && <span style={{cursor:'pointer', fontWeight: 600}} onClick={()=>delForEveryone(m.id)}>🔥 У всех</span>}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {activeChat && (
                <div style={{padding:'20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', borderTop:'1px solid var(--glass-border)', display:'flex', gap:10, flexShrink: 0}}>
                    <Input value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendMessage()}} placeholder="Сообщение..." style={{margin:0, flex:1, borderRadius: '24px'}} />
                    <Button variant="primary" onClick={sendMessage} style={{width:54, height:54, minWidth:54, padding:0, borderRadius:'50%', flexShrink: 0}}>➤</Button>
                </div>
            )}
        </motion.div>
    );
}

// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, { ChatPanel });
