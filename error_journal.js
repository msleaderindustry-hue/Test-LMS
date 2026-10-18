(function () {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const LABELS = {
    platform: 'Платформа',
    auth: 'Вход',
    admin: 'Админка',
    chat: 'Переписки',
    typing: 'Печать',
    hotkeys: 'Горячие клавиши',
    code: 'VS School',
    flashcards: 'Карточки',
    excel: 'Excel',
    ai_chat: 'ИИ',
    tests: 'Тесты',
    chess: 'Шахматы',
    activity: 'Активность',
    sidebar: 'Меню',
    stats: 'Статистика',
    landing: 'Главная',
    discord: 'Уведомления'
  };
  const css = `
 .ej{margin:16px 22px;border:1px solid var(--ad-line);border-radius:18px;background:var(--ad-panel);overflow:hidden}
 .adm-root .ej button{height:auto;min-height:40px;padding:9px 13px;margin:0;border:1px solid var(--ad-line);border-radius:11px;background:var(--ad-bg);color:var(--ad-text);font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,transform .2s}
 .adm-root .ej button:hover:not(:disabled){background:var(--ad-soft);transform:translateY(-1px)}
 .adm-root .ej .ej-toggle{width:100%;border:0;border-radius:0;background:transparent;justify-content:space-between;text-align:left;padding:17px 18px;min-height:76px}
 .ej-title{display:flex;align-items:center;gap:12px}.ej-mark{width:40px;height:40px;background:var(--ad-soft);color:var(--ad-accent);border-radius:12px;display:grid;place-items:center}.ej strong{font-size:15px}.ej small{display:block;color:var(--ad-muted);font-size:12px;margin-top:3px}
 .ej-body{padding:0 18px 18px;animation:ej-enter .25s ease}.ej-toolbar{display:flex;flex-wrap:wrap;align-items:end;gap:10px;padding:14px;background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:14px;margin-bottom:12px}.ej-toolbar label{display:grid;gap:5px;font-size:11px;color:var(--ad-muted);flex:1;min-width:125px}
 .adm-root .ej :is(select,input[type=text]){width:100%;height:40px;margin:0;padding:7px 10px;border:1px solid var(--ad-line);border-radius:9px;background:var(--ad-panel);color:var(--ad-text);font-size:13px}
 .ej-meta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:var(--ad-muted);font-size:12px;margin:12px 0}.ej-list{display:grid;gap:8px;max-height:520px;overflow:auto;padding:2px}
 .ej-row{border:1px solid var(--ad-line);border-radius:12px;background:var(--ad-bg);padding:12px;display:grid;grid-template-columns:22px 1fr;gap:8px}.ej-row input{width:16px;height:16px;margin:4px 0;accent-color:var(--ad-accent)}.ej-row summary{cursor:pointer;overflow-wrap:anywhere;font-size:13px}.ej-row summary::marker{color:var(--ad-accent)}.ej-row details p{margin-top:8px;font-size:12px;overflow-wrap:anywhere;color:var(--ad-muted)}.ej-badge{display:inline-flex;padding:2px 7px;border-radius:6px;background:var(--ad-soft);color:var(--ad-accent);font-size:11px;margin-right:7px}.ej-bottom{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:12px}.ej-notice{padding:12px;border:1px solid var(--ad-line);border-radius:10px;margin:10px 0;font-size:12px;overflow-wrap:anywhere}.ej-notice.error{color:var(--ad-red)}.ej-confirm{padding:14px;border:1px solid var(--ad-red);border-radius:12px;margin-top:12px;display:grid;gap:10px}.ej-empty{text-align:center;padding:30px 15px;color:var(--ad-muted);font-size:13px}.ej-chevron{transition:transform .25s}.ej-chevron.open{transform:rotate(180deg)}
 @keyframes ej-enter{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:none}}
 @media(max-width:600px){.ej{margin:12px}.ej-body{padding:0 12px 12px}.ej-toolbar{padding:10px}.ej-title strong{font-size:14px}.ej-title small{max-width:210px}.ej-bottom button{flex:1}}
 @media(prefers-reduced-motion:reduce){.ej *{animation:none!important;transition:none!important}}
 `;
  const Icon = ({
    name
  }) => /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, name === 'chevron' ? /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }) : name === 'refresh' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 7v5h-5M4 17v-5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"
  })) : name === 'trash' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "3",
    width: "16",
    height: "18",
    rx: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v6M12 17h.01"
  })));
  const JOURNAL_NEW_CSS = ".adm-root .ej{margin:0;border-radius:20px;background:var(--ad-panel)}.adm-root .ej .ej-toggle{padding:22px 24px;display:flex;align-items:center}.ej-title strong{font-size:19px}.ej-title small{font-size:12px;margin-top:6px}.ej-mark{width:46px;height:46px;border-radius:15px}.ej-body{padding:0 24px 24px}.ej-searchbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:14px}.ej-searchbar>input{flex:1;min-width:180px}.adm-root .ej .ej-searchbar input{height:44px;background:var(--ad-bg);padding:10px 14px}.adm-root .ej button{min-height:42px;padding:10px 14px;font-weight:600}.ej-toolbar{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-height:0;padding:0 14px;margin:0;overflow:hidden;border:0;opacity:0;transition:max-height .25s,padding .25s,opacity .25s,margin .25s}.ej-toolbar.filters-open{max-height:160px;padding:14px;margin-bottom:14px;border:1px solid var(--ad-line);opacity:1}.ej-toolbar label{min-width:0}.ej-meta{font-size:11px;align-items:center;margin:16px 0}.ej-list{gap:9px;max-height:54dvh}.ej-row{padding:17px 15px;border-radius:13px;grid-template-columns:23px minmax(0,1fr);gap:10px;transition:background .2s,border-color .2s;animation:ej-row-in .25s ease}.ej-row:has(input:checked){border-color:var(--ad-accent);background:var(--ad-soft)}.ej-row summary{font-size:13px;line-height:1.7;list-style:none;position:relative;padding-right:22px}.ej-row summary:after{content:'⌄';position:absolute;right:0;top:0;color:var(--ad-muted);transition:transform .2s}.ej-row summary::-webkit-details-marker{display:none}.ej-row details[open] summary:after{transform:rotate(180deg)}.ej-row details[open] p{animation:ej-row-in .22s ease}.ej-row details p:first-of-type{padding-top:12px;border-top:1px solid var(--ad-line)}.ej-row small{font-size:11px}.ej-badge{padding:3px 8px;margin-right:8px}.ej-row summary b{display:inline-block;border-radius:6px;padding:0 7px;color:var(--ad-accent);background:var(--ad-soft);margin-left:6px}\n.ej-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px;padding:10px 12px;border:1px solid var(--ad-line);border-radius:13px;background:var(--ad-bg)}.ej-actions>span{font-size:12px;color:var(--ad-muted);margin-right:auto}.ej-actions .ej-danger{color:var(--ad-red)!important;border-color:var(--ad-red)!important}.ej-actions.chosen{animation:ej-row-in .25s ease;background:var(--ad-soft)}.ej-more{display:flex;justify-content:center;margin-top:12px}.ej-technical{margin-top:18px;border-top:1px solid var(--ad-line);padding-top:12px;color:var(--ad-muted);font-size:11px}.ej-technical summary{cursor:pointer}.ej-technical p{line-height:1.8;margin-top:8px;overflow-wrap:anywhere}.ej-loading{display:grid;gap:10px;padding:5px 0}.ej-loading i{height:70px;border-radius:13px;background:linear-gradient(100deg,var(--ad-bg),var(--ad-soft),var(--ad-bg));background-size:240% 100%;animation:ej-shimmer 1.5s linear infinite}.ej-empty{padding:50px 16px;background:var(--ad-bg);border:1px dashed var(--ad-line);border-radius:14px}.ej-row.removing{animation:ej-remove .18s ease both;pointer-events:none}\n.ej-modal-root{--ad-bg:#101521;--ad-panel:#1a2031;--ad-text:#edf0fa;--ad-muted:#a0abc3;--ad-line:#343d54;--ad-accent:#b6a2ff;--ad-soft:#27243d;position:fixed;inset:0;z-index:10050;background:rgba(7,10,20,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px;overscroll-behavior:contain;color:var(--ad-text);font:13px/1.6 Montserrat,system-ui,sans-serif}\n.ej-modal-root.ej-light{--ad-bg:#f5f6fb;--ad-panel:#fff;--ad-text:#242b40;--ad-muted:#65718a;--ad-line:#dfe3ef;--ad-accent:#7151c7;--ad-soft:#eee9fb;background:rgba(32,39,62,.3)}\n.ej-modal-card{width:min(100%,460px);max-height:85dvh;overflow:auto;border-radius:22px;background:var(--ad-panel);border:1px solid var(--ad-line);box-shadow:0 24px 80px #0005;opacity:0;transform:translateY(16px) scale(.97);transition:opacity .22s,transform .22s;outline:none}.ej-modal-card.entered{opacity:1;transform:none}.ej-modal-card .ej-confirm{border:0;padding:25px;margin:0;display:grid;gap:14px}.ej-modal-card strong{font-size:19px;line-height:1.4}.ej-modal-card small{font-size:12px;color:var(--ad-muted)}.ej-modal-card label{display:grid;gap:8px;font-size:12px;color:var(--ad-muted)}.ej-modal-card input{box-sizing:border-box;width:100%;height:46px;padding:10px 13px;background:var(--ad-bg);color:var(--ad-text);border:1px solid var(--ad-line);border-radius:11px;font:inherit;letter-spacing:1px}.ej-modal-card input:focus{outline:2px solid var(--ad-accent);outline-offset:2px}.ej-modal-card .ej-bottom{display:flex;justify-content:flex-end;gap:8px;margin-top:5px}.ej-modal-card button{height:auto;min-height:42px;padding:10px 14px;background:var(--ad-bg);color:var(--ad-text);border:1px solid var(--ad-line);border-radius:11px;font:600 12px/1.4 Montserrat,system-ui,sans-serif;cursor:pointer}.ej-modal-card button:last-child{background:#b33f60;color:white;border-color:transparent}.ej-modal-card button:disabled{opacity:.45;cursor:not-allowed}\n@keyframes ej-row-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes ej-shimmer{to{background-position:-240% 0}}@keyframes ej-remove{to{opacity:0;transform:translateX(12px)}}\n@media(max-width:600px){.adm-root .ej .ej-toggle{padding:18px 16px}.ej-body{padding:0 14px 16px}.ej-title strong{font-size:17px}.ej-searchbar>input{flex-basis:100%}.ej-searchbar>button{flex:1}.ej-toolbar{grid-template-columns:1fr 1fr}.ej-meta{align-items:flex-start;flex-direction:column;gap:5px}.ej-actions{padding:10px;gap:7px}.ej-actions>span{flex-basis:100%}.adm-root .ej .ej-actions button{font-size:11px;padding:9px 10px;flex:1}.ej-modal-root{padding:12px;align-items:end}.ej-modal-card{width:100%;border-radius:22px 22px 14px 14px}.ej-modal-card .ej-confirm{padding:22px}.ej-modal-card .ej-bottom button{flex:1}.ej-row{padding:13px 10px;gap:6px}.ej-row summary{font-size:12px}}\n@media(prefers-reduced-motion:reduce){.ej *,.ej-modal-root *{animation:none!important;transition:none!important}}\n";
  function JournalModal({
    show,
    busy,
    onClose,
    children
  }) {
    const h = React.createElement,
      [present, setPresent] = useState(show),
      [entered, setEntered] = useState(false),
      box = useRef(null),
      focus = useRef(null),
      busyRef = useRef(busy),
      close = useRef(onClose);
    busyRef.current = busy;
    close.current = onClose;
    useEffect(() => {
      let frame, timer;
      if (show) {
        focus.current = document.activeElement;
        setPresent(true);
        frame = requestAnimationFrame(() => setEntered(true));
      } else {
        setEntered(false);
        timer = setTimeout(() => setPresent(false), 220);
      }
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }, [show]);
    useEffect(() => {
      if (!present) return;
      const timer = setTimeout(() => box.current?.querySelector('input,button')?.focus(), 35);
      const key = e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
          if (!busyRef.current) close.current();
        }
        if (e.key === 'Tab') {
          const nodes = [...box.current.querySelectorAll('input:not(:disabled),button:not(:disabled)')];
          if (!nodes.length) {
            e.preventDefault();
            box.current.focus();
            return;
          }
          if (e.shiftKey && (document.activeElement === nodes[0] || !box.current.contains(document.activeElement))) {
            e.preventDefault();
            nodes.at(-1).focus();
          } else if (!e.shiftKey && (document.activeElement === nodes.at(-1) || !box.current.contains(document.activeElement))) {
            e.preventDefault();
            nodes[0].focus();
          }
        }
      };
      document.addEventListener('keydown', key, true);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', key, true);
        if (focus.current?.isConnected) focus.current.focus();
      };
    }, [present]);
    if (!present) return null;
    const light = !!document.querySelector('.adm-root')?.closest('html.light,body.light,.theme-light,[data-theme="light"]');
    return ReactDOM.createPortal(h('div', {
      className: 'ej-modal-root ' + (light ? 'ej-light' : ''),
      onMouseDown: e => {
        if (e.target === e.currentTarget && !busyRef.current) close.current();
      }
    }, h('div', {
      className: 'ej-modal-card ' + (entered ? 'entered' : ''),
      ref: box,
      role: 'dialog',
      'aria-modal': true,
      'aria-label': 'Удаление записей',
      tabIndex: -1
    }, children)), document.body);
  }
  function Journal({
    embedded = false
  } = {}) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [removing, setRemoving] = useState([]);
    const [open, setOpen] = useState(embedded),
      [rows, setRows] = useState([]),
      [busy, setBusy] = useState(false),
      [error, setError] = useState(''),
      [note, setNote] = useState('');
    const [section, setSection] = useState(''),
      [severity, setSeverity] = useState(''),
      [search, setSearch] = useState(''),
      [selected, setSelected] = useState([]),
      [confirm, setConfirm] = useState(false),
      [word, setWord] = useState(''),
      [more, setMore] = useState(false),
      [status, setStatus] = useState(null);
    const cursor = useRef(null),
      lock = useRef(false),
      alive = useRef(true),
      generation = useRef(0);
    useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
        generation.current++;
      };
    }, []);
    const explain = e => String(e?.code || '').includes('permission-denied') ? 'Нет доступа к журналу. Опубликуйте правила из комплекта и укажите UID владельца.' : String(e?.code || '').includes('unavailable') ? 'Нет соединения с Firebase. Повторите позже.' : 'Операция не выполнена (' + String(e?.code || 'unknown') + ').';
    async function load(append = false) {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      setError('');
      setNote('');
      setConfirm(false);
      setSelected([]);
      const version = ++generation.current;
      try {
        if (!window.auth?.currentUser) throw {
          code: 'unauthenticated'
        };
        let q = window.db.collection('platformErrors').orderBy('at', 'desc').limit(100);
        if (append && cursor.current) q = q.startAfter(cursor.current);
        const snap = await q.get({
          source: 'server'
        });
        if (!alive.current || version !== generation.current) return;
        const data = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        cursor.current = snap.docs[snap.docs.length - 1] || cursor.current;
        setRows(prev => append ? [...new Map([...prev, ...data].map(x => [x.id, x])).values()] : data);
        setMore(snap.size === 100);
        setStatus(window.LmsErrorTracker?.status() || null);
      } catch (e) {
        if (alive.current) setError(explain(e));
      } finally {
        lock.current = false;
        if (alive.current) setBusy(false);
      }
    }
    const filtered = rows.filter(r => (!section || r.section === section) && (!severity || r.severity === severity) && (!search || [r.code, r.source, r.uid, r.operation].join(' ').toLowerCase().includes(search.toLowerCase())));
    const groups = new Map();
    for (const row of filtered) {
      const key = [row.section, row.source, row.line, row.operation, row.code, row.status, row.severity].join('|');
      if (!groups.has(key)) groups.set(key, {
        ...row,
        ids: [],
        users: new Set(),
        total: 0
      });
      const group = groups.get(key);
      group.ids.push(row.id);
      group.users.add(row.uid);
      group.total += Number(row.count) || 1;
    }
    function toggleGroup(ids) {
      setSelected(prev => ids.every(id => prev.includes(id)) ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
      setConfirm(false);
    }
    async function remove() {
      if (lock.current || word !== 'УДАЛИТЬ' || !selected.length) return;
      const ids = [...selected];
      lock.current = true;
      setBusy(true);
      setError('');
      let deleted = 0;
      try {
        for (let i = 0; i < ids.length; i += 100) {
          if (!alive.current) break;
          const chunk = ids.slice(i, i + 100);
          const batch = window.db.batch();
          chunk.forEach(id => batch.delete(window.db.collection('platformErrors').doc(id)));
          await batch.commit();
setRemoving(chunk);
await new Promise(resolve=>setTimeout(resolve,180));
if(!alive.current)break;
          deleted += chunk.length;
          setRows(prev => prev.filter(r => !chunk.includes(r.id)));
          setSelected(prev => prev.filter(id => !chunk.includes(id)));
        }
        if (alive.current) {
          setNote('Удалено записей: ' + deleted + '. Новые записи сохранены.');
          setConfirm(false);
          setWord('');
        }
      } catch (e) {
        if (alive.current) setError(explain(e) + ' Подтверждено удаление: ' + deleted + '. Обновите список перед повтором.');
      } finally {
        lock.current = false;
        if (alive.current) setBusy(false);
      }
    }
    const h = React.createElement;
    const resetSelection = () => {
      setSelected([]);
      setConfirm(false);
    };
    const searchbar = h('div', {
      className: 'ej-searchbar'
    }, h('input', {
      type: 'text',
      value: search,
      'aria-label': 'Поиск ошибок',
      placeholder: 'Поиск по коду, файлу или UID',
      disabled: busy,
      onChange: e => {
        setSearch(e.target.value);
        resetSelection();
      }
    }), h('button', {
      type: 'button',
      'aria-expanded': filtersOpen,
      onClick: () => setFiltersOpen(!filtersOpen)
    }, h(Icon, {
      name: 'chevron'
    }), 'Фильтры', section || severity ? ' · активны' : ''), h('button', {
      type: 'button',
      disabled: busy,
      onClick: () => load()
    }, h(Icon, {
      name: 'refresh'
    }), busy ? 'Обновляем…' : 'Обновить'));
    const filters = h('div', {
      className: 'ej-toolbar ' + (filtersOpen ? 'filters-open' : ''),
      inert: filtersOpen ? undefined : '',
      'aria-hidden': !filtersOpen
    }, h('label', null, 'Раздел', h('select', {
      value: section,
      disabled: busy,
      onChange: e => {
        setSection(e.target.value);
        resetSelection();
      }
    }, h('option', {
      value: ''
    }, 'Все разделы'), Object.entries(LABELS).map(([k, v]) => h('option', {
      key: k,
      value: k
    }, v)))), h('label', null, 'Тип события', h('select', {
      value: severity,
      disabled: busy,
      onChange: e => {
        setSeverity(e.target.value);
        resetSelection();
      }
    }, h('option', {
      value: ''
    }, 'Все события'), h('option', {
      value: 'error'
    }, 'Ошибки'), h('option', {
      value: 'warning'
    }, 'Обработанные ошибки'))));
    const entries = [...groups.entries()].map(([key, g]) => h('article', {
      key,
      className: 'ej-row ' + (g.ids.every(id => removing.includes(id)) ? 'removing' : '')
    }, h('input', {
      type: 'checkbox',
      'aria-label': 'Выбрать ' + g.message,
      disabled: busy,
      checked: g.ids.every(id => selected.includes(id)),
      onChange: () => toggleGroup(g.ids)
    }), h('details', null, h('summary', null, h('span', {
      className: 'ej-badge'
    }, LABELS[g.section] || g.section), g.message, h('b', null, '×', g.total), h('small', null, g.at?.toDate?.().toLocaleString('ru-RU') || 'Дата не определена', ' · ', g.source || 'Глобальный обработчик', g.line ? ':' + g.line : '')), h('p', null, 'Код: ', g.code, g.status ? ' · HTTP ' + g.status : '', ' · Действие: ', g.operation), h('p', null, 'Пользователей: ', g.users.size, ' · Записей: ', g.ids.length, ' · ', g.severity === 'warning' ? 'Обработано приложением' : 'Ошибка'), h('p', null, 'UID: ', [...g.users].join(', ')))));
    const actions = filtered.length > 0 && h('div', {
      className: 'ej-actions ' + (selected.length ? 'chosen' : '')
    }, h('span', null, selected.length ? 'Выбрано записей: ' + selected.length : 'Выберите записи для действий'), h('button', {
      type: 'button',
      disabled: busy,
      onClick: () => {
        setSelected(selected.length ? [] : filtered.map(r => r.id));
        setConfirm(false);
      }
    }, selected.length ? 'Снять выбор' : 'Выбрать найденные'), selected.length > 0 && h('button', {
      type: 'button',
      className: 'ej-danger',
      disabled: busy,
      onClick: () => {
        setWord('');
        setConfirm(true);
      }
    }, h(Icon, {
      name: 'trash'
    }), 'Удалить'));
    const modal = h(JournalModal, {
      show: confirm,
      busy,
      onClose: () => setConfirm(false)
    }, h('div', {
      className: 'ej-confirm'
    }, h('strong', null, 'Удалить выбранные записи?'), h('small', null, 'Выбрано: ', selected.length, '. Удаление необратимо. Новые записи, активность и переписки сохранятся.'), h('label', null, 'Введите УДАЛИТЬ для подтверждения', h('input', {
      type: 'text',
      value: word,
      disabled: busy,
      autoComplete: 'off',
      spellCheck: false,
      onChange: e => setWord(e.target.value)
    })), error && h('p', {
      role: 'alert'
    }, error), h('div', {
      className: 'ej-bottom'
    }, h('button', {
      type: 'button',
      disabled: busy,
      onClick: () => setConfirm(false)
    }, 'Отмена'), h('button', {
      type: 'button',
      disabled: busy || word !== 'УДАЛИТЬ',
      onClick: remove
    }, busy ? 'Удаляем…' : 'Удалить записи'))));
    useEffect(() => {
      if (embedded) void load();
    }, [embedded]);
    return h('section', {
      className: 'ej ' + (embedded ? 'embedded' : '')
    }, h('style', null, css + JOURNAL_NEW_CSS), h(embedded ? 'div' : 'button', {
      type: embedded ? undefined : 'button',
      className: 'ej-toggle',
      'aria-expanded': embedded ? undefined : open,
      onClick: embedded ? undefined : () => {
        setOpen(!open);
        if (!open && !rows.length) void load();
      }
    }, h('span', {
      className: 'ej-title'
    }, h('span', {
      className: 'ej-mark'
    }, h(Icon)), h('span', null, h('strong', null, 'Журнал ошибок'), h('small', null, 'Состояние платформы · события и диагностика')))), open && h('div', {
      className: 'ej-body'
    }, searchbar, filters, h('div', {
      className: 'ej-meta'
    }, h('span', null, 'Записей: ', rows.length, ' · Групп: ', groups.size), h('span', null, 'Фильтры применяются к загруженным записям')), status?.blocked && h('div', {
      className: 'ej-notice error'
    }, 'Firebase запретил запись. Проверьте правила. ', h('button', {
      type: 'button',
      onClick: () => {
        window.LmsErrorTracker?.retry();
        setStatus(window.LmsErrorTracker?.status());
      }
    }, 'Повторить подключение')), error && h('div', {
      className: 'ej-notice error',
      role: 'alert'
    }, error), note && h('div', {
      className: 'ej-notice',
      role: 'status'
    }, note), busy && !rows.length && h('div', {
      className: 'ej-loading',
      'aria-label': 'Загрузка журнала'
    }, [0, 1, 2].map(i => h('i', {
      key: i
    }))), h('div', {
      className: 'ej-list',
      'aria-busy': busy
    }, entries), !groups.size && !busy && !error && h('div', {
      className: 'ej-empty'
    }, h(Icon), h('p', null, 'Ошибок по выбранным условиям нет')), actions, more && h('div', {
      className: 'ej-more'
    }, h('button', {
      type: 'button',
      disabled: busy,
      onClick: () => load(true)
    }, 'Загрузить ещё 100')), modal, h('details', {
      className: 'ej-technical'
    }, h('summary', null, 'О сборе данных'), h('p', null, 'До 30 отправок в час на вкладку. Журнал фиксирует новые события после установки. Тексты переписок и запросов не сохраняются. Это диагностика клиента, а не защищённый аудит.'), h('p', null, 'UID текущего аккаунта: ', window.auth?.currentUser?.uid || 'не выполнен вход'))));
  }
  class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        failed: false
      };
    }
    static getDerivedStateFromError() {
      return {
        failed: true
      };
    }
    componentDidCatch(error) {
      window.reportLmsError?.(error, {
        operation: 'react-render'
      });
    }
    render() {
      return this.state.failed ? /*#__PURE__*/React.createElement("div", {
        role: "alert",
        style: {
          margin: '32px auto',
          padding: 24,
          maxWidth: 620,
          borderRadius: 18,
          background: 'var(--bg-panel)',
          color: 'var(--text-main)',
          border: '1px solid var(--glass-border)'
        }
      }, /*#__PURE__*/React.createElement("h2", null, "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u044D\u043A\u0440\u0430\u043D"), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443. \u041D\u0435\u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u044B."), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => location.reload()
      }, "\u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C")) : this.props.children;
    }
  }
  window.LmsErrorJournal = Journal;
  window.LmsErrorBoundary = Boundary;
})();
