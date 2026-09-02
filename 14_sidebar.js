const { motion, AnimatePresence } = window.Motion;
const { Button } = window;

const SidebarMenu = ({ 
    isOpen, onClose, theme, setTheme, user, userNickname, changeNickname, 
    allowedModules, isAdmin, view, setView, setIsChatOpen 
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Затемнение фона */}
                    <motion.div 
                        initial={{opacity:0}} 
                        animate={{opacity:1}} 
                        exit={{opacity:0}} 
                        onClick={onClose} 
                        style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(5px)', zIndex:2000}} 
                    />
                    
                    {/* Само меню */}
                    <motion.div 
                        initial={{x:'-100%'}} 
                        animate={{x:0}} 
                        exit={{x:'-100%'}} 
                        transition={{type:'spring', damping:25, stiffness:200}} 
                        className="glass-sidebar" 
                        style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}
                    >
                        
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom: 10, borderBottom: '1px solid var(--glass-border)', flexShrink: 0}}>
                            <h2 style={{margin:0, fontSize: 22}}>Меню</h2>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <Button 
                                    variant="muted" 
                                    onClick={() => {
                                        const nextTheme = theme === 'dark' ? 'light' : 'dark';
                                        if (document.startViewTransition) {
                                            document.startViewTransition(() => setTheme(nextTheme));
                                        } else {
                                            setTheme(nextTheme);
                                        }
                                    }} 
                                    style={{width:44, height:44, padding:0, borderRadius:'50%', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} 
                                    title="Сменить тему"
                                >
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </Button>
                                <Button variant="muted" onClick={onClose} style={{width:44, height:44, padding:0, borderRadius:'50%', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✖</Button>
                            </div>
                        </div>
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--glass-border)', flexShrink: 0}}>
                            <span style={{ fontSize: '30px' }}>👤</span>
                            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Аккаунт</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {userNickname || user?.email}
                                    </span>
                                    <span onClick={changeNickname} style={{cursor: 'pointer', fontSize: 14, opacity: 0.8, flexShrink: 0}} title="Изменить никнейм">
                                        ✏️
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 15, flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
                            
                            {allowedModules.includes('chat') && (
                                <Button variant="teal" onClick={() => { setIsChatOpen(true); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}>
                                    <span style={{marginRight: 10}}>💬</span> Открыть чат
                                </Button>
                            )}
                            
                            {allowedModules.includes('typing') && (
                                view === 'typing' ? (
                                    <Button variant="primary" onClick={() => { setView('menu'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                    </Button>
                                ) : (
                                    <Button variant="primary" onClick={() => { setView('typing'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}>
                                        <span style={{marginRight: 10}}>⌨️</span> Тренажер печати
                                    </Button>
                                )
                            )}

                            {allowedModules.includes('hotkeys') && (
                                view === 'hotkeys' ? (
                                    <Button variant="orange" onClick={() => { setView('menu'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                    </Button>
                                ) : (
                                    <Button variant="orange" onClick={() => { setView('hotkeys'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}>
                                        <span style={{marginRight: 10}}>⚡</span> Горячие клавиши
                                    </Button>
                                )
                            )}

                            {allowedModules.includes('code') && (
                                view === 'code' ? (
                                    <Button onClick={() => { setView('menu'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                    </Button>
                                ) : (
                                    <Button onClick={() => { setView('code'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>💻</span> VS School
                                    </Button>
                                )
                            )}

                            {allowedModules.includes('flashcards') && (
                                view === 'flashcards' ? (
                                    <Button onClick={() => { setView('menu'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                    </Button>
                                ) : (
                                    <Button onClick={() => { setView('flashcards'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>🎴</span> Умные карточки
                                    </Button>
                                )
                            )}

                            {allowedModules.includes('excel') && (
                                view === 'excel' ? (
                                    <Button onClick={() => { setView('menu'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                    </Button>
                                ) : (
                                    <Button onClick={() => { setView('excel'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        <span style={{marginRight: 10}}>📊</span> Тренажер Excel
                                    </Button>
                                )
                            )}

                            {isAdmin && (
                                view === 'admin' ? (
                                    <Button variant="red" onClick={() => { setView('menu'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}>
                                        <span style={{marginRight: 10}}>⬅</span> В МЕНЮ
                                    </Button>
                                ) : (
                                    <Button variant="red" onClick={() => { setView('admin'); onClose(); }} style={{justifyContent: 'flex-start', padding: '0 20px', height: 54, minHeight: 54}}>
                                        <span style={{marginRight: 10}}>🛡️</span> АДМИНКА
                                    </Button>
                                )
                            )}
                        </div>

                        <div style={{paddingTop: '15px', paddingBottom: '10px', flexShrink: 0}}>
                            <Button variant="muted" onClick={() => { window.auth.signOut(); onClose(); }} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', height: 54}}>
                                ВЫЙТИ
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

Object.assign(window, { SidebarMenu });
