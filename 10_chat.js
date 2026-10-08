function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Ultimate LMS — private messages. Existing Firestore paths and contact policy are preserved.
(function () {
  const {
    useState,
    useEffect,
    useRef,
    useMemo,
    useLayoutEffect
  } = React;
  const CSS = ".lmc-overlay{position:fixed;inset:0;z-index:9999;font-family:inherit;color:#29253b;--pc-bg:#faf8ff;--pc-card:#fff;--pc-well:#f2eef9;--pc-line:#85719f26;--pc-text:#29253b;--pc-muted:#797185;--pc-accent:#8252d9;--pc-tint:#8855df10;background:#14102133;animation:lmcBackdrop .22s ease both;backdrop-filter:blur(3px)}.lmc-overlay.dark{--pc-bg:#1d1d2c;--pc-card:#272637;--pc-well:#222131;--pc-line:#b49bd224;--pc-text:#f0ebfa;--pc-muted:#aca4bc;--pc-accent:#b699f4;--pc-tint:#af8def14;color:var(--pc-text);background:#06051066;color-scheme:dark}.lmc-overlay *{box-sizing:border-box}.lmc-panel{position:absolute;top:12px;right:12px;bottom:12px;width:min(450px,calc(100vw - 24px));border-radius:26px;border:1px solid var(--pc-line);background:var(--pc-bg);box-shadow:0 24px 80px #09071640;display:flex;flex-direction:column;overflow:hidden;animation:lmcSlide .38s cubic-bezier(.2,.8,.2,1) both}.lmc-overlay.closing{animation:lmcBackdrop .22s ease reverse both}.closing .lmc-panel{animation:lmcSlide .22s ease reverse both}.lmc-panel button,.lmc-panel input,.lmc-panel textarea{font:inherit}.lmc-panel button{cursor:pointer;color:inherit}.lmc-panel button:disabled{opacity:.45;cursor:not-allowed}.lmc-panel button:focus-visible,.lmc-panel input:focus-visible,.lmc-panel textarea:focus-visible{outline:2px solid var(--pc-accent);outline-offset:3px}.lmc-panel svg{width:20px;height:20px;flex-shrink:0}.lmc-header{padding:22px 22px 18px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--pc-line);background:linear-gradient(125deg,var(--pc-tint),transparent);position:relative}.lmc-header::after{content:'';pointer-events:none;position:absolute;right:80px;top:0;width:85px;height:75px;background:repeating-linear-gradient(135deg,transparent 0 12px,var(--pc-line) 12px 13px);mask-image:linear-gradient(90deg,transparent,#000);opacity:.5}.lmc-head-copy{flex:1;min-width:0;z-index:1}.lmc-head-copy h2{font-size:20px;letter-spacing:-.4px;margin:0;color:var(--pc-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lmc-kicker{display:block;color:var(--pc-accent);font-size:9px;font-weight:800;letter-spacing:1.5px;margin-bottom:5px}.lmc-head-copy small{font-size:11px;color:var(--pc-muted);display:block;margin-top:4px}.lmc-icon{border:1px solid var(--pc-line);background:var(--pc-card);border-radius:12px;width:36px;height:36px;display:grid;place-items:center;flex-shrink:0;transition:background .18s,transform .18s;z-index:1}.lmc-icon:hover{background:var(--pc-tint);transform:translateY(-1px)}.lmc-avatar{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;flex-shrink:0;color:white;background:linear-gradient(135deg,hsl(var(--hue,263) 55% 66%),hsl(var(--hue,263) 46% 48%));font-weight:750;font-size:15px;position:relative}.lmc-avatar svg{width:23px;height:23px}.lmc-avatar.small{width:37px;height:37px;border-radius:12px;font-size:12px}.lmc-body{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}.lmc-view{display:flex;flex-direction:column;flex:1;min-height:0;animation:lmcView .25s ease both}.lmc-toolbar{padding:20px 20px 10px}.lmc-search{display:flex;align-items:center;gap:9px;border:1px solid var(--pc-line);border-radius:14px;background:var(--pc-card);padding:0 12px;color:var(--pc-muted)}.lmc-search:focus-within{border-color:var(--pc-accent);box-shadow:0 0 0 3px var(--pc-tint)}.lmc-search input{min-width:0;width:100%;padding:13px 0;border:0;outline:0!important;background:transparent;color:var(--pc-text);font-size:13px}.lmc-tabs{display:flex;gap:7px;margin-top:12px}.lmc-tabs button{border:1px solid transparent;border-radius:10px;padding:8px 11px;background:transparent;font-size:12px;color:var(--pc-muted);transition:.18s}.lmc-tabs button.active{background:var(--pc-tint);border-color:var(--pc-line);color:var(--pc-accent)}.lmc-scroll{overflow-y:auto;min-height:0;scrollbar-width:thin;scrollbar-color:var(--pc-line) transparent;overscroll-behavior:contain;flex:1}.lmc-contacts{padding:6px 12px 18px}.lmc-contact{display:flex;width:100%;align-items:center;gap:12px;padding:13px 11px;margin-bottom:4px;border:1px solid transparent;border-radius:17px;text-align:left;background:transparent;transition:background .2s,border-color .2s,transform .2s;animation:lmcView .3s both}.lmc-contact:hover{background:var(--pc-card);border-color:var(--pc-line);transform:translateX(2px)}.lmc-contact-copy{flex:1;min-width:0}.lmc-contact-copy strong{display:block;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lmc-contact-copy small{display:block;font-size:11px;color:var(--pc-muted);margin-top:5px}.lmc-contact>svg{width:16px;color:var(--pc-muted);opacity:.5}.lmc-badge{min-width:23px;height:23px;padding:0 6px;background:#8754d9;color:#fff;display:grid;place-items:center;border-radius:8px;font-size:10px;font-weight:700}.lmc-footer-note{font-size:10px;color:var(--pc-muted);text-align:center;margin:12px}.lmc-empty{padding:48px 28px;text-align:center;margin:auto;color:var(--pc-muted)}.lmc-empty-art{width:88px;height:88px;border:1px dashed var(--pc-line);border-radius:26px;display:grid;place-items:center;margin:0 auto 22px;position:relative}.lmc-empty-art>svg{width:36px;height:36px;color:var(--pc-accent);animation:lmcFloat 5s ease-in-out infinite}.lmc-empty-art::after{content:'';width:7px;height:7px;background:var(--pc-accent);opacity:.45;position:absolute;right:-4px;top:20px;border-radius:3px;transform:rotate(20deg)}.lmc-empty strong{display:block;color:var(--pc-text);font-size:16px}.lmc-empty p{font-size:12px;line-height:1.7;max-width:275px;margin:10px auto 0}.lmc-messages{padding:18px 20px;display:flex;flex-direction:column;gap:9px;background-image:radial-gradient(var(--pc-line) .7px,transparent .7px);background-size:22px 22px}.lmc-date{align-self:center;border:1px solid var(--pc-line);background:var(--pc-bg);color:var(--pc-muted);border-radius:9px;font-size:10px;padding:5px 11px;margin:12px 0;box-shadow:0 2px 8px #00000003}.lmc-row{display:flex;flex-direction:column;max-width:88%;align-self:flex-start;animation:lmcBubble .23s ease both;position:relative}.lmc-row.mine{align-self:flex-end}.lmc-bubble{background:var(--pc-card);border:1px solid var(--pc-line);border-radius:17px 17px 17px 5px;padding:11px 13px;min-width:82px;box-shadow:0 2px 7px #00000003}.mine .lmc-bubble{background:linear-gradient(120deg,#8959df,#7445c7);border-color:transparent;color:#fff;border-radius:17px 17px 5px 17px}.lmc-text{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.65}.lmc-meta{display:flex;justify-content:flex-end;align-items:center;gap:5px;color:var(--pc-muted);margin-top:5px;font-size:9px}.mine .lmc-meta{color:#e5d7ff}.lmc-meta svg{width:14px;height:14px}.lmc-meta button{width:23px;height:21px;display:grid;place-items:center;padding:0;background:transparent;color:inherit;border:0;border-radius:5px}.lmc-meta button:hover{background:#88888820}.lmc-meta button svg{width:16px}.lmc-deleted{font-style:italic;opacity:.65}.lmc-compose{padding:13px 16px max(13px,env(safe-area-inset-bottom));border-top:1px solid var(--pc-line);background:var(--pc-bg)}.lmc-input-box{display:flex;align-items:flex-end;gap:9px;padding:7px;border:1px solid var(--pc-line);background:var(--pc-card);border-radius:17px;transition:box-shadow .2s,border-color .2s}.lmc-input-box:focus-within{border-color:var(--pc-accent);box-shadow:0 0 0 3px var(--pc-tint)}.lmc-input-box textarea{resize:none;flex:1;min-width:0;min-height:38px;max-height:128px;padding:9px 7px;border:0;outline:0!important;background:transparent;color:var(--pc-text);font-size:13px;line-height:20px}.lmc-send{width:39px;height:39px;border:0;border-radius:12px;background:#8551d8;color:white!important;display:grid;place-items:center;flex-shrink:0;transition:transform .2s,box-shadow .2s}.lmc-send:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 4px 12px #8252d935}.lmc-send:not(:disabled):active{transform:scale(.93)}.lmc-send:disabled{background:var(--pc-well);color:var(--pc-muted)!important;opacity:1}.lmc-compose-hint{display:flex;justify-content:space-between;gap:8px;padding:7px 4px 0;color:var(--pc-muted);font-size:9px}.lmc-jump{position:absolute;right:19px;bottom:110px;border:1px solid var(--pc-line);background:var(--pc-card);border-radius:12px;padding:10px;display:flex;gap:6px;align-items:center;box-shadow:0 4px 14px #0001;font-size:11px;animation:lmcView .2s}.lmc-toast{position:absolute;left:20px;right:20px;bottom:100px;background:var(--pc-card);border:1px solid var(--pc-line);border-radius:13px;padding:13px 15px;font-size:12px;line-height:1.5;box-shadow:0 8px 30px #0002;z-index:6;animation:lmcView .25s}.lmc-toast.error{border-color:#e7787860}.lmc-error{margin:12px 20px;padding:12px;font-size:12px;border:1px solid #df7b7b50;border-radius:12px;line-height:1.5;color:var(--pc-text)}.lmc-skeleton{height:65px;background:linear-gradient(100deg,var(--pc-well) 20%,var(--pc-card) 45%,var(--pc-well) 70%);background-size:250% 100%;animation:lmcShimmer 1.8s infinite;border-radius:15px;margin:9px 20px}.lmc-modal-shade{position:absolute;inset:0;z-index:10;display:grid;place-items:center;padding:25px;background:#0e0b2355;backdrop-filter:blur(3px)}.lmc-modal{width:100%;padding:23px;background:var(--pc-bg);border:1px solid var(--pc-line);border-radius:21px;box-shadow:0 12px 40px #0003;animation:lmcView .2s}.lmc-modal h3{font-size:17px;margin:0 0 10px}.lmc-modal p{font-size:12px;color:var(--pc-muted);line-height:1.7}.lmc-modal button{padding:12px;border:1px solid var(--pc-line);border-radius:11px;background:var(--pc-card);display:flex;width:100%;align-items:center;gap:9px;margin-top:8px;font-size:12px}.lmc-modal .danger{color:#dc6d7e}.lmc-modal button:last-child{justify-content:center;background:transparent}.lmc-spin{animation:lmcSpin .8s linear infinite}@keyframes lmcSpin{to{transform:rotate(360deg)}}@keyframes lmcSlide{from{opacity:.4;transform:translateX(105%)}to{opacity:1;transform:translateX(0)}}@keyframes lmcBackdrop{from{opacity:0}to{opacity:1}}@keyframes lmcView{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes lmcBubble{from{opacity:0;transform:translateY(5px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes lmcFloat{50%{transform:translateY(-5px) rotate(-5deg)}}@keyframes lmcShimmer{to{background-position:-250% 0}}@media(max-width:520px){.lmc-panel{inset:0;width:100%;height:100dvh;border-radius:0}.lmc-header{padding:18px 16px}.lmc-toolbar{padding:17px 16px 10px}.lmc-messages{padding:14px}.lmc-head-copy h2{font-size:18px}.lmc-row{max-width:92%}}@media(prefers-reduced-motion:reduce){.lmc-overlay,.lmc-overlay *,.lmc-overlay *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\n";
  const glyph = {
    chat: 'M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5',
    close: 'm6 6 12 12M6 18 18 6',
    back: 'M19 12H5m7-7-7 7 7 7',
    send: 'm21 3-7 18-4-8-8-4 19-6ZM10 13 21 3',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    arrow: 'm9 5 7 7-7 7',
    down: 'm6 9 6 6 6-6',
    check: 'm5 12 4 4L19 6',
    double: 'm2 12 4 4L16 6m-4 9 2 2L24 7',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
    copy: 'M9 9h12v12H9zM15 5V2H2v13h3',
    clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    loader: 'M21 12a9 9 0 1 1-9-9'
  };
  const Icon = ({
    name,
    spin = false
  }) => /*#__PURE__*/React.createElement("svg", {
    className: spin ? 'lmc-spin' : '',
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: glyph[name] || glyph.chat
  }));
  const nameOf = u => u?.nickname || u?.displayName || u?.email || 'Пользователь';
  const initials = u => nameOf(u).split(/[\s._@-]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const hue = id => [260, 220, 290, 185, 335][[...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % 5];
  const Avatar = ({
    user,
    small = false
  }) => /*#__PURE__*/React.createElement("span", {
    className: 'lmc-avatar' + (small ? ' small' : ''),
    style: {
      '--hue': hue(user?.uid)
    }
  }, initials(user));
  const ms = value => {
    if (value == null) return 0;
    const n = value?.toMillis ? value.toMillis() : value?.toDate ? value.toDate().getTime() : typeof value === 'number' ? value : Date.parse(value);
    return Number.isFinite(n) ? n : 0;
  };
  const dateLabel = t => {
    if (!t) return 'Дата не указана';
    const d = new Date(t),
      now = new Date(),
      y = new Date();
    y.setDate(now.getDate() - 1);
    return d.toDateString() === now.toDateString() ? 'Сегодня' : d.toDateString() === y.toDateString() ? 'Вчера' : d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      ...(d.getFullYear() !== now.getFullYear() ? {
        year: 'numeric'
      } : {})
    });
  };
  const field = () => window.firebase?.firestore?.FieldValue;
  const visible = (m, uid) => !m.deletedForEveryone && !(m.deletedFor || []).includes(uid);
  const Empty = ({
    title,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    className: "lmc-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lmc-empty-art"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chat"
  })), /*#__PURE__*/React.createElement("strong", null, title), /*#__PURE__*/React.createElement("p", null, children));
  function Panel({
    user,
    onClose,
    theme
  }) {
    const uid = user?.uid,
      db = window.db;
    const [dark, setDark] = useState(false),
      [policy, setPolicy] = useState(null),
      [contacts, setContacts] = useState([]),
      [loaded, setLoaded] = useState(false),
      [counts, setCounts] = useState({});
    const [peerId, setPeerId] = useState(null),
      [messages, setMessages] = useState([]),
      [loading, setLoading] = useState(false),
      [error, setError] = useState(''),
      [contactError, setContactError] = useState('');
    const [search, setSearch] = useState(''),
      [filter, setFilter] = useState('all'),
      [draft, setDraft] = useState(''),
      [sending, setSending] = useState(false),
      [toast, setToast] = useState(null),
      [menu, setMenu] = useState(null),
      [deleting, setDeleting] = useState(false),
      [closing, setClosing] = useState(false),
      [atBottom, setAtBottom] = useState(true),
      [pageVisible, setPageVisible] = useState(document.visibilityState === 'visible');
    const panel = useRef(),
      scroller = useRef(),
      input = useRef(),
      searchInput = useRef(),
      drafts = useRef({}),
      alive = useRef(true),
      sendLock = useRef(false),
      closeTimer = useRef(),
      toastTimer = useRef(),
      nearBottom = useRef(true),
      lastTail = useRef(null),
      readBusy = useRef(new Set()),
      activeRef = useRef(null),
      dialog = useRef();
    activeRef.current = peerId;
    const allowed = useMemo(() => !policy ? [] : contacts.filter(u => u.uid !== uid && (policy.mode === 'all' || policy.mode === 'teachers' && u.role === 'admin' || policy.mode === 'selected' && policy.allowed.includes(u.uid))), [contacts, policy, uid]);
    const peer = allowed.find(u => u.uid === peerId),
      peersKey = allowed.map(u => u.uid).sort().join('|');
    const notify = (text, bad = false) => {
      if (!alive.current) return;
      clearTimeout(toastTimer.current);
      setToast({
        text,
        bad
      });
      toastTimer.current = setTimeout(() => {
        if (alive.current) setToast(null);
      }, 3500);
    };
    const close = () => {
      if (closeTimer.current) return;
      setClosing(true);
      closeTimer.current = setTimeout(() => onClose?.(), 220);
    };
    const openPeer = id => {
      if (peerId) drafts.current[peerId] = draft;
      setMenu(null);
      setMessages([]);
      setError('');
      setLoading(true);
      lastTail.current = null;
      nearBottom.current = true;
      setAtBottom(true);
      setPeerId(id);
      setDraft(drafts.current[id] || '');
    };
    const back = () => {
      drafts.current[peerId] = draft;
      setPeerId(null);
      setMessages([]);
      setMenu(null);
    };
    useEffect(() => {
      alive.current = true;
      let tag = document.getElementById('lmc-private-chat-styles');
      if (!tag) {
        tag = document.createElement('style');
        tag.id = 'lmc-private-chat-styles';
        document.head.append(tag);
      }
      tag.textContent = CSS;
      const old = document.activeElement,
        overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = overflow;
        alive.current = false;
        clearTimeout(closeTimer.current);
        clearTimeout(toastTimer.current);
        if (old?.isConnected) old.focus?.();
      };
    }, []);
    useEffect(() => {
      const sync = () => setDark(theme ? theme === 'dark' : document.body.classList.contains('dark') || document.documentElement.classList.contains('dark'));
      sync();
      const o = new MutationObserver(sync);
      o.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
      o.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      return () => o.disconnect();
    }, [theme]);
    useEffect(() => {
      const f = () => setPageVisible(document.visibilityState === 'visible');
      document.addEventListener('visibilitychange', f);
      return () => document.removeEventListener('visibilitychange', f);
    }, []);
    useEffect(() => {
      const timer = setTimeout(() => {
        (peerId ? input.current : searchInput.current)?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, [peerId]);
    useEffect(() => {
      if (menu) dialog.current?.querySelector('button')?.focus();
    }, [menu]);
    useEffect(() => {
      if (!db || !uid) {
        setContactError('Войди в аккаунт, чтобы открыть сообщения.');
        return;
      }
      let dead = false;
      const a = db.collection('users').doc(uid).onSnapshot(s => {
        if (dead) return;
        const d = s.exists ? s.data() : {};
        setPolicy({
          mode: ['all', 'teachers', 'selected'].includes(d.chatContactMode) ? d.chatContactMode : 'all',
          allowed: Array.isArray(d.chatAllowedUsers) ? d.chatAllowedUsers.map(String) : []
        });
      }, () => {
        if (!dead) {
          setPolicy(null);
          setContactError('Не удалось получить настройки доступа к контактам.');
        }
      });
      const b = db.collection('users').onSnapshot(s => {
        if (dead) return;
        setContacts(s.docs.map(d => ({
          ...d.data(),
          uid: d.id
        })));
        setLoaded(true);
      }, () => {
        if (!dead) {
          setContactError('Не удалось загрузить контакты. Проверь подключение и доступ.');
          setLoaded(true);
        }
      });
      return () => {
        dead = true;
        a();
        b();
      };
    }, [db, uid]);
    useEffect(() => {
      if (peerId && loaded && policy && !allowed.some(u => u.uid === peerId)) {
        setPeerId(null);
        setMessages([]);
        setMenu(null);
      }
    }, [peersKey, loaded, policy, peerId]);
    useEffect(() => {
      if (!db || !uid || !policy) return;
      let dead = false;
      const stops = allowed.map(u => {
        const id = [uid, u.uid].sort().join('_');
        return db.collection('private_chats').doc(id).collection('messages').where('senderId', '==', u.uid).where('read', '==', false).onSnapshot(s => {
          if (!dead) setCounts(p => ({
            ...p,
            [u.uid]: s.docs.filter(d => visible(d.data(), uid)).length
          }));
        }, () => {});
      });
      return () => {
        dead = true;
        stops.forEach(f => f());
      };
    }, [db, uid, peersKey, !!policy]);
    useEffect(() => {
      if (!db || !uid || !peerId) return;
      let dead = false;
      setLoading(true);
      const id = [uid, peerId].sort().join('_');
      // Existing history mixes ISO strings and Firestore Timestamp values: normalize before sorting.
      const stop = db.collection('private_chats').doc(id).collection('messages').onSnapshot({
        includeMetadataChanges: true
      }, s => {
        if (dead) return;
        const rows = s.docs.map(d => {
          const data = d.data({
            serverTimestamps: 'estimate'
          });
          return {
            ...data,
            id: d.id,
            ref: d.ref,
            pending: !!d.metadata?.hasPendingWrites,
            time: ms(data.createdAt) || ms(data.clientCreatedAt)
          };
        }).sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
        setMessages(rows);
        setLoading(false);
        setError('');
      }, () => {
        if (!dead) {
          setLoading(false);
          setError('Сообщения не загрузились. Проверь подключение и разрешения.');
        }
      });
      return () => {
        dead = true;
        stop();
      };
    }, [db, uid, peerId]);
    const shown = messages.filter(m => visible(m, uid));
    useLayoutEffect(() => {
      const el = scroller.current;
      if (!el || !peerId) return;
      const tail = shown.at(-1),
        first = lastTail.current === null;
      const newOwn = tail?.id !== lastTail.current && tail?.senderId === uid;
      if (first || nearBottom.current || newOwn) {
        el.scrollTop = el.scrollHeight;
        nearBottom.current = true;
        setAtBottom(true);
      }
      lastTail.current = tail?.id || 'empty';
    }, [messages, peerId]);
    useLayoutEffect(() => {
      if (input.current) {
        input.current.style.height = 'auto';
        input.current.style.height = Math.min(input.current.scrollHeight, 128) + 'px';
      }
    }, [draft, peerId]);
    useEffect(() => {
      if (!db || !peer || !pageVisible || !atBottom || loading) return;
      const docs = shown.filter(m => m.senderId === peerId && m.read === false && !readBusy.current.has(m.id));
      if (!docs.length) return;
      docs.forEach(m => readBusy.current.add(m.id));
      let dead = false;
      (async () => {
        for (let i = 0; i < docs.length; i += 400) {
          if (dead) break;
          const batch = db.batch();
          docs.slice(i, i + 400).forEach(m => batch.update(m.ref, {
            read: true
          }));
          try {
            await batch.commit();
          } catch {} finally {
            docs.slice(i, i + 400).forEach(m => readBusy.current.delete(m.id));
          }
        }
      })();
      return () => {
        dead = true;
        docs.forEach(m => readBusy.current.delete(m.id));
      };
    }, [messages, peerId, pageVisible, atBottom, loading]);
    const send = async () => {
      const text = draft.trim();
      if (!text || sendLock.current || !peer || !db) return;
      if (text.length > 4000) {
        notify('В одном сообщении можно отправить до 4000 символов.', true);
        return;
      }
      if (!field()) {
        notify('Сервис сообщений ещё не подключён. Обнови страницу.', true);
        return;
      }
      const target = peerId;
      const chat = [uid, target].sort().join('_');
      sendLock.current = true;
      setSending(true);
      setDraft('');
      drafts.current[target] = '';
      nearBottom.current = true;
      try {
        await db.collection('private_chats').doc(chat).collection('messages').add({
          text,
          senderId: uid,
          createdAt: field().serverTimestamp(),
          clientCreatedAt: Date.now(),
          deletedFor: [],
          deletedForEveryone: false,
          read: false
        });
      } catch {
        drafts.current[target] = drafts.current[target] ? drafts.current[target] + '\n' + text : text;
        if (alive.current) {
          if (activeRef.current === target) setDraft(current => current ? current + '\n' + text : text);
          notify('Не удалось отправить. Текст сохранён — попробуй ещё раз.', true);
        }
      } finally {
        sendLock.current = false;
        if (alive.current) setSending(false);
      }
    };
    const remove = async all => {
      if (!menu || deleting || !peerId) return;
      const m = messages.find(x => x.id === menu.id);
      if (!m || all && m.senderId !== uid) return;
      setDeleting(true);
      try {
        const ref = db.collection('private_chats').doc([uid, peerId].sort().join('_')).collection('messages').doc(m.id);
        if (all) await ref.update({
          deletedForEveryone: true,
          text: ''
        });else await ref.update({
          deletedFor: field().arrayUnion(uid)
        });
        if (alive.current) {
          setMenu(null);
          notify(all ? 'Сообщение удалено у всех' : 'Сообщение удалено у тебя');
        }
      } catch {
        notify('Не удалось удалить сообщение. Попробуй ещё раз.', true);
      } finally {
        if (alive.current) setDeleting(false);
      }
    };
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(menu.text);
        setMenu(null);
        notify('Текст скопирован');
      } catch {
        notify('Браузер не разрешил копирование.', true);
      }
    };
    const trap = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        menu ? setMenu(null) : close();
        return;
      }
      if (e.key !== 'Tab') return;
      const area = menu ? dialog.current : panel.current;
      const list = [...area.querySelectorAll('button:not(:disabled),input,textarea,[tabindex="0"]')].filter(x => x.getClientRects().length);
      if (!list.length) return;
      const first = list[0],
        last = list.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const list = allowed.filter(u => (filter !== 'unread' || counts[u.uid] > 0) && (filter !== 'teachers' || u.role === 'admin') && nameOf(u).toLowerCase().includes(search.toLowerCase())).sort((a, b) => (counts[b.uid] || 0) - (counts[a.uid] || 0) || nameOf(a).localeCompare(nameOf(b), 'ru'));
    return /*#__PURE__*/React.createElement("div", {
      className: `lmc-overlay ${dark ? 'dark' : ''} ${closing ? 'closing' : ''}`,
      onMouseDown: e => {
        if (e.target === e.currentTarget) close();
      }
    }, /*#__PURE__*/React.createElement("section", {
      className: "lmc-panel",
      ref: panel,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u041B\u0438\u0447\u043D\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F",
      onKeyDown: trap
    }, /*#__PURE__*/React.createElement("header", {
      className: "lmc-header"
    }, peer ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "lmc-icon",
      "aria-label": "\u041A \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0430\u043C",
      onClick: back
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "back"
    })), /*#__PURE__*/React.createElement(Avatar, {
      user: peer,
      small: true
    })) : /*#__PURE__*/React.createElement("span", {
      className: "lmc-avatar"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chat"
    })), /*#__PURE__*/React.createElement("div", {
      className: "lmc-head-copy"
    }, !peer && /*#__PURE__*/React.createElement("span", {
      className: "lmc-kicker"
    }, "ULTIMATE LMS \xB7 \u041E\u0411\u0429\u0415\u041D\u0418\u0415"), /*#__PURE__*/React.createElement("h2", null, peer ? nameOf(peer) : 'Сообщения'), /*#__PURE__*/React.createElement("small", null, peer ? peer.role === 'admin' ? 'Преподаватель' : 'Студент' : 'Учись, спрашивай, обсуждай')), /*#__PURE__*/React.createElement("button", {
      className: "lmc-icon",
      "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0447\u0430\u0442",
      onClick: close
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lmc-body"
    }, !peer ? /*#__PURE__*/React.createElement("div", {
      className: "lmc-view",
      key: "contacts"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lmc-toolbar"
    }, /*#__PURE__*/React.createElement("label", {
      className: "lmc-search"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search"
    }), /*#__PURE__*/React.createElement("input", {
      ref: searchInput,
      "aria-label": "\u041F\u043E\u0438\u0441\u043A \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432",
      value: search,
      onChange: e => setSearch(e.target.value),
      placeholder: "\u041D\u0430\u0439\u0442\u0438 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430\u2026"
    })), /*#__PURE__*/React.createElement("div", {
      className: "lmc-tabs"
    }, [['all', 'Все'], ['unread', 'Непрочитанные'], ['teachers', 'Преподаватели']].map(([v, t]) => /*#__PURE__*/React.createElement("button", {
      key: v,
      className: filter === v ? 'active' : '',
      "aria-pressed": filter === v,
      onClick: () => setFilter(v)
    }, t)))), contactError ? /*#__PURE__*/React.createElement("div", {
      className: "lmc-error",
      role: "alert"
    }, contactError) : !loaded || !policy ? /*#__PURE__*/React.createElement("div", {
      role: "status",
      "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432"
    }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
      className: "lmc-skeleton",
      key: i
    }))) : /*#__PURE__*/React.createElement("div", {
      className: "lmc-scroll lmc-contacts"
    }, list.length ? list.map((u, i) => /*#__PURE__*/React.createElement("button", {
      key: u.uid,
      className: "lmc-contact",
      onClick: () => openPeer(u.uid),
      style: {
        animationDelay: Math.min(i * 25, 150) + 'ms'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      user: u
    }), /*#__PURE__*/React.createElement("span", {
      className: "lmc-contact-copy"
    }, /*#__PURE__*/React.createElement("strong", null, nameOf(u)), /*#__PURE__*/React.createElement("small", null, u.role === 'admin' ? 'Преподаватель' : 'Студент', " \xB7 \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u0438\u0430\u043B\u043E\u0433")), counts[u.uid] > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "lmc-badge",
      "aria-label": `${counts[u.uid]} непрочитанных`
    }, counts[u.uid] > 99 ? '99+' : counts[u.uid]) : /*#__PURE__*/React.createElement(Icon, {
      name: "arrow"
    }))) : /*#__PURE__*/React.createElement(Empty, {
      title: search ? 'Никого не нашли' : filter === 'unread' ? 'Всё прочитано' : 'Пока нет контактов'
    }, search ? 'Попробуй другое имя или адрес почты.' : filter === 'unread' ? 'Новые сообщения появятся здесь.' : 'Доступные собеседники появятся в этом списке.')), /*#__PURE__*/React.createElement("div", {
      className: "lmc-footer-note"
    }, "\u041B\u0438\u0447\u043D\u044B\u0435 \u0434\u0438\u0430\u043B\u043E\u0433\u0438 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435")) : /*#__PURE__*/React.createElement("div", {
      className: "lmc-view",
      key: peerId
    }, error && /*#__PURE__*/React.createElement("div", {
      className: "lmc-error",
      role: "alert"
    }, error), /*#__PURE__*/React.createElement("div", {
      className: "lmc-scroll lmc-messages",
      ref: scroller,
      role: "log",
      "aria-label": "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439",
      "aria-live": "polite",
      "aria-relevant": "additions",
      onScroll: () => {
        const e = scroller.current,
          v = e.scrollHeight - e.scrollTop - e.clientHeight < 70;
        nearBottom.current = v;
        setAtBottom(v);
      }
    }, loading ? /*#__PURE__*/React.createElement("div", {
      role: "status",
      "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439"
    }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      className: "lmc-skeleton",
      key: i
    }))) : !shown.length && !error ? /*#__PURE__*/React.createElement(Empty, {
      title: "\u041D\u0430\u0447\u043D\u0438 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440"
    }, "\u041D\u0430\u043F\u0438\u0448\u0438 \u0432\u043E\u043F\u0440\u043E\u0441, \u043F\u043E\u0434\u0435\u043B\u0438\u0441\u044C \u0438\u0434\u0435\u0435\u0439 \u0438\u043B\u0438 \u043F\u0440\u043E\u0441\u0442\u043E \u043F\u043E\u0437\u0434\u043E\u0440\u043E\u0432\u0430\u0439\u0441\u044F.") : shown.map((m, i) => {
      const mine = m.senderId === uid,
        day = dateLabel(m.time),
        divider = !i || dateLabel(shown[i - 1].time) !== day;
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: m.id
      }, divider && /*#__PURE__*/React.createElement("div", {
        className: "lmc-date"
      }, day), /*#__PURE__*/React.createElement("div", {
        className: 'lmc-row ' + (mine ? 'mine' : 'theirs')
      }, /*#__PURE__*/React.createElement("div", {
        className: "lmc-bubble"
      }, /*#__PURE__*/React.createElement("div", {
        className: "lmc-text"
      }, m.text), /*#__PURE__*/React.createElement("div", {
        className: "lmc-meta"
      }, /*#__PURE__*/React.createElement("time", null, m.time ? new Date(m.time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }) : '—'), mine && /*#__PURE__*/React.createElement("span", {
        title: m.pending ? 'Отправляется' : m.read ? 'Прочитано' : 'Отправлено',
        "aria-label": m.pending ? 'Отправляется' : m.read ? 'Прочитано' : 'Отправлено'
      }, /*#__PURE__*/React.createElement(Icon, {
        name: m.pending ? 'clock' : m.read ? 'double' : 'check'
      })), /*#__PURE__*/React.createElement("button", {
        "aria-label": "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435\u043C",
        onClick: () => setMenu({
          id: m.id,
          text: m.text,
          mine
        })
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "more"
      }))))));
    })), !atBottom && /*#__PURE__*/React.createElement("button", {
      className: "lmc-jump",
      onClick: () => {
        scroller.current.scrollTop = scroller.current.scrollHeight;
        nearBottom.current = true;
        setAtBottom(true);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "down"
    }), "\u0412\u043D\u0438\u0437"), /*#__PURE__*/React.createElement("form", {
      className: "lmc-compose",
      onSubmit: e => {
        e.preventDefault();
        send();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lmc-input-box"
    }, /*#__PURE__*/React.createElement("textarea", {
      ref: input,
      rows: 1,
      maxLength: 4000,
      "aria-label": "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",
      placeholder: "\u041D\u0430\u043F\u0438\u0448\u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435\u2026",
      value: draft,
      onChange: e => {
        setDraft(e.target.value);
        drafts.current[peerId] = e.target.value;
      },
      onKeyDown: e => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          send();
        }
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "lmc-send",
      type: "submit",
      disabled: !draft.trim() || sending || !!error,
      "aria-label": sending ? 'Отправляется' : 'Отправить сообщение'
    }, /*#__PURE__*/React.createElement(Icon, {
      name: sending ? 'loader' : 'send',
      spin: sending
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lmc-compose-hint"
    }, /*#__PURE__*/React.createElement("span", null, "Enter \u2014 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \xB7 Shift + Enter \u2014 \u043D\u043E\u0432\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430"), /*#__PURE__*/React.createElement("span", null, draft.length ? `${draft.length}/4000` : '')))), toast && /*#__PURE__*/React.createElement("div", {
      className: 'lmc-toast ' + (toast.bad ? 'error' : ''),
      role: "status"
    }, toast.text), menu && /*#__PURE__*/React.createElement("div", {
      className: "lmc-modal-shade",
      onClick: e => {
        if (e.target === e.currentTarget && !deleting) setMenu(null);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lmc-modal",
      ref: dialog,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435\u043C"
    }, /*#__PURE__*/React.createElement("h3", null, "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435"), /*#__PURE__*/React.createElement("p", null, "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0443 \u0432\u0441\u0435\u0445 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0442\u0432\u043E\u0438\u0445 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439."), /*#__PURE__*/React.createElement("button", {
      disabled: deleting,
      onClick: copy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "copy"
    }), "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442"), /*#__PURE__*/React.createElement("button", {
      disabled: deleting,
      onClick: () => remove(false)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash"
    }), "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0443 \u043C\u0435\u043D\u044F"), menu.mine && /*#__PURE__*/React.createElement("button", {
      className: "danger",
      disabled: deleting,
      onClick: () => remove(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash"
    }), "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0443 \u0432\u0441\u0435\u0445"), /*#__PURE__*/React.createElement("button", {
      disabled: deleting,
      onClick: () => setMenu(null)
    }, "\u041E\u0442\u043C\u0435\u043D\u0430"))))));
  }
  function ChatPanel(props) {
    return /*#__PURE__*/React.createElement(Panel, _extends({
      key: props.user?.uid || 'guest'
    }, props));
  }
  window.ChatPanel = ChatPanel;
})();
