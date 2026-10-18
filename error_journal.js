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
  const extraCss = '\n .adm-root .ej-modal-layer{margin:0!important;border:0!important;background:transparent!important;overflow:visible!important}.ej .adm-dialog label{margin:0}.adm-redesign .ej{margin:24px;background:var(--ad-panel);border-radius:18px}.adm-redesign .ej-toggle{cursor:default}.adm-redesign .ej-body{padding:0 20px 20px}\n .ej-toolbar{align-items:center}.ej-toolbar label:nth-of-type(3){order:-2;flex:1 1 300px}.adm-root .ej .ej-filter-toggle{order:-1}.ej-toolbar label:nth-of-type(1),.ej-toolbar label:nth-of-type(2){display:none}.ej-toolbar.ej-filters-open label{display:grid}\n .ej-toolbar label:nth-of-type(3) input{min-height:44px}.ej-row{padding:16px 14px;transition:background .2s,border-color .2s,box-shadow .2s}.ej-row.ej-selected{background:var(--ad-soft);border-color:var(--ad-accent);box-shadow:inset 3px 0 var(--ad-accent)}.ej-row summary{line-height:1.7}.ej-row details[open] p{animation:ej-enter .2s ease}.ej-row b{float:right;padding:0 7px;background:var(--ad-soft);border-radius:6px;color:var(--ad-accent)}\n .ej-bottom{justify-content:flex-start;align-items:center}.ej-selection{padding:12px;background:var(--ad-bg);border:1px solid var(--ad-line);border-radius:12px}.ej-selected-count{font-size:12px;color:var(--ad-accent);font-weight:700}.ej-selection button:last-child:not(:disabled){color:var(--ad-red);border-color:var(--ad-red)}\n .ej .adm-dialog{max-width:440px;display:grid;gap:16px}.ej .adm-dialog>svg{color:var(--ad-red)}.ej .adm-dialog label{display:grid;gap:8px;font-size:12px;color:var(--ad-muted)}.ej .adm-dialog .ej-bottom{justify-content:flex-end;margin:0}.adm-root .ej .adm-dialog .ej-bottom button:last-child{background:var(--ad-red);color:white;border-color:var(--ad-red)}.ej .adm-dialog .ej-bottom button:disabled{opacity:.45;cursor:not-allowed}.ej .adm-dialog>strong{font-size:15px;line-height:1.5}\n @media(max-width:620px){.adm-redesign .ej{margin:16px}.adm-redesign .ej-body{padding:0 12px 12px}.ej-toolbar label:nth-of-type(3){flex-basis:100%}.ej-toolbar label{min-width:100%;}.ej-selection{gap:8px}.ej-selected-count{width:100%}.ej-bottom button{flex:initial}.ej-meta{line-height:1.6}.ej-row{padding:12px}.ej .adm-dialog{max-width:none}}\n';
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
  function ModalLayer({children}) {
    const host = document.querySelector('.adm-root');
    return host && window.ReactDOM?.createPortal ? ReactDOM.createPortal(React.createElement('div',{className:'ej ej-modal-layer'},children),host) : children;
  }
  function Journal({standalone = false, active = true}) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [open, setOpen] = useState(standalone),
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
    useEffect(() => { if (standalone) void load(); }, []);
    useEffect(() => { if (!active) { setConfirm(false); setWord(''); } }, [active]);
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
    const filtered = rows.filter(r => (!section || r.section === section) && (!severity || r.severity === severity) && (!search || [r.message, LABELS[r.section], r.code, r.source, r.uid, r.operation].join(' ').toLowerCase().includes(search.toLowerCase())));
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
    return /*#__PURE__*/React.createElement("section", {
      className: "ej"
    }, /*#__PURE__*/React.createElement("style", null, css + extraCss), /*#__PURE__*/React.createElement(standalone ? "div" : "button", {
      type: standalone ? undefined : "button",
      className: "ej-toggle",
      "aria-expanded": standalone ? undefined : open,
      onClick: standalone ? undefined : () => {
        setOpen(!open);
        if (!open && !rows.length) void load();
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "ej-title"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ej-mark"
    }, /*#__PURE__*/React.createElement(Icon, null)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "\u0416\u0443\u0440\u043D\u0430\u043B \u043E\u0448\u0438\u0431\u043E\u043A"), /*#__PURE__*/React.createElement("small", null, "\u0421\u0431\u043E\u0438 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0435\u0441\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B"))), /*#__PURE__*/React.createElement("span", {
      className: 'ej-chevron ' + (open ? 'open' : ''), hidden:standalone
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron"
    }))), open && /*#__PURE__*/React.createElement("div", {
      className: "ej-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: `ej-toolbar ${filtersOpen ? "ej-filters-open" : ""}`
    }, React.createElement("button", {type:"button",className:"ej-filter-toggle","aria-expanded":filtersOpen,onClick:()=>setFiltersOpen(v=>!v)}, "Фильтры", (section || severity) ? " · активны" : ""), /*#__PURE__*/React.createElement("label", null, "\u0420\u0430\u0437\u0434\u0435\u043B", /*#__PURE__*/React.createElement("select", {
      disabled: busy,
      value: section,
      onChange: e => {
        setSection(e.target.value);
        setSelected([]);
        setConfirm(false);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u0412\u0441\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B"), Object.entries(LABELS).map(([k, v]) => /*#__PURE__*/React.createElement("option", {
      key: k,
      value: k
    }, v)))), /*#__PURE__*/React.createElement("label", null, "\u0422\u0438\u043F", /*#__PURE__*/React.createElement("select", {
      disabled: busy,
      value: severity,
      onChange: e => {
        setSeverity(e.target.value);
        setSelected([]);
        setConfirm(false);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u0412\u0441\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F"), /*#__PURE__*/React.createElement("option", {
      value: "error"
    }, "\u041E\u0448\u0438\u0431\u043A\u0438"), /*#__PURE__*/React.createElement("option", {
      value: "warning"
    }, "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0435 \u043E\u0448\u0438\u0431\u043A\u0438"))), /*#__PURE__*/React.createElement("label", null, "\u041F\u043E\u0438\u0441\u043A", /*#__PURE__*/React.createElement("input", {
      type: "text",
      disabled: busy,
      placeholder: "\u041A\u043E\u0434, \u0444\u0430\u0439\u043B \u0438\u043B\u0438 UID",
      value: search,
      onChange: e => {
        setSearch(e.target.value);
        setSelected([]);
        setConfirm(false);
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      onClick: () => load()
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "refresh"
    }), busy ? 'Загрузка…' : 'Обновить')), /*#__PURE__*/React.createElement("div", {
      className: "ej-meta"
    }, /*#__PURE__*/React.createElement("span", null, "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E ", rows.length, " \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \xB7 \u0413\u0440\u0443\u043F\u043F: ", groups.size), /*#__PURE__*/React.createElement("span", null, "\u0424\u0438\u043B\u044C\u0442\u0440\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u043A \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u043C \u0437\u0430\u043F\u0438\u0441\u044F\u043C")), status?.blocked && /*#__PURE__*/React.createElement("div", {
      className: "ej-notice error"
    }, "Firebase \u0437\u0430\u043F\u0440\u0435\u0442\u0438\u043B \u0437\u0430\u043F\u0438\u0441\u044C \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0438. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430, \u0437\u0430\u0442\u0435\u043C ", /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        window.LmsErrorTracker?.retry();
        setStatus(window.LmsErrorTracker?.status());
      }
    }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435")), error && /*#__PURE__*/React.createElement("div", {
      className: "ej-notice error",
      role: "alert"
    }, error), note && /*#__PURE__*/React.createElement("div", {
      className: "ej-notice",
      role: "status"
    }, note), /*#__PURE__*/React.createElement("div", {
      className: "ej-list",
      "aria-busy": busy
    }, busy && !rows.length && React.createElement("div", {role:"status","aria-label":"Загрузка журнала"}, [0,1,2].map(i=>React.createElement("div",{key:i,className:"adm-skeleton"}))), [...groups.entries()].map(([key, g]) => /*#__PURE__*/React.createElement("article", {
      className: `ej-row ${g.ids.every(id => selected.includes(id)) ? "ej-selected" : ""}`,
      key: key
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      "aria-label": 'Выбрать ' + g.message,
      disabled: busy,
      checked: g.ids.every(id => selected.includes(id)),
      onChange: () => toggleGroup(g.ids)
    }), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("span", {
      className: "ej-badge"
    }, LABELS[g.section] || g.section), g.message, " ", /*#__PURE__*/React.createElement("b", null, "\xD7", g.total), /*#__PURE__*/React.createElement("small", null, g.at?.toDate?.().toLocaleString('ru-RU') || 'Дата не определена', " \xB7 ", g.source || 'Глобальный обработчик', g.line ? ':' + g.line : '')), /*#__PURE__*/React.createElement("p", null, "\u041A\u043E\u0434: ", g.code, g.status ? ' · HTTP ' + g.status : '', " \xB7 \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435: ", g.operation), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439: ", g.users.size, " \xB7 \u0417\u0430\u043F\u0438\u0441\u0435\u0439: ", g.ids.length, " \xB7 ", g.severity === 'warning' ? 'Перехвачено приложением' : 'Ошибка'), /*#__PURE__*/React.createElement("p", null, "UID: ", [...g.users].join(', ')), /*#__PURE__*/React.createElement("p", null, "\u041F\u043E\u0432\u0442\u043E\u0440\u044B \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u0435\u043D\u044B \u0441\u0440\u0435\u0434\u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439. \u0422\u0435\u043A\u0441\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0438 \u043B\u0438\u0447\u043D\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043D\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F."))))), !groups.size && !busy && !error && /*#__PURE__*/React.createElement("div", {
      className: "ej-empty"
    }, "\u041E\u0448\u0438\u0431\u043E\u043A \u043F\u043E \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u043C \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u043C \u043D\u0435\u0442."), /*#__PURE__*/React.createElement("div", {
      className: "ej-bottom ej-selection"
    }, selected.length > 0 && React.createElement("span", {className:"ej-selected-count",role:"status"}, "Выбрано: ", selected.length), selected.length > 0 && React.createElement("button",{type:"button",disabled:busy,onClick:()=>{setSelected([]);setConfirm(false);}},"Снять выбор"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy || !filtered.length,
      onClick: () => {
        setSelected(filtered.map(r => r.id));
        setConfirm(false);
      }
    }, "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0435 (", filtered.length, ")"), more && /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      onClick: () => load(true)
    }, "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0435\u0449\u0451 100"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy || !selected.length,
      onClick: () => {
        setConfirm(!confirm);
        setWord('');
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash"
    }), "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 (", selected.length, ")")), React.createElement(ModalLayer,null, React.createElement(window.LmsAdminPresence || React.Fragment, window.LmsAdminPresence ? {show:confirm} : null, confirm && /*#__PURE__*/React.createElement(window.LmsAdminDialog || "div", {
      title: "Удаление записей", busy, onClose:()=>setConfirm(false)
    }, error && React.createElement("p",{role:"alert",className:"adm-error"},error), /*#__PURE__*/React.createElement("strong", null, "Удалить выбранные записи (", selected.length, ")?"), /*#__PURE__*/React.createElement("small", null, "\u0423\u0434\u0430\u043B\u044F\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u0437\u0430\u043F\u0438\u0441\u0438. \u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0438 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438 \u043D\u0435 \u0437\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u044E\u0442\u0441\u044F."), /*#__PURE__*/React.createElement("label", null, "\u0414\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0423\u0414\u0410\u041B\u0418\u0422\u042C", /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: word,
      disabled: busy,
      autoComplete: "off",
      className: "adm-input",
      onChange: e => setWord(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "ej-bottom"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy,
      onClick: () => setConfirm(false)
    }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy || word !== 'УДАЛИТЬ',
      onClick: remove
    }, busy ? 'Удаляем…' : 'Подтвердить удаление'))))), /*#__PURE__*/React.createElement("small", {
      style: {
        marginTop: 14
      }
    }, "UID \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430: ", window.auth?.currentUser?.uid || 'не выполнен вход'), /*#__PURE__*/React.createElement("small", {
      style: {
        marginTop: 8
      }
    }, "\u0414\u043E 30 \u043E\u0442\u043F\u0440\u0430\u0432\u043E\u043A \u0432 \u0447\u0430\u0441 \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0443. \u0416\u0443\u0440\u043D\u0430\u043B \u0444\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u0442 \u043D\u043E\u0432\u044B\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F \u043F\u043E\u0441\u043B\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438; \u044D\u0442\u043E \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430, \u0430 \u043D\u0435 \u0437\u0430\u0449\u0438\u0449\u0451\u043D\u043D\u044B\u0439 \u0430\u0443\u0434\u0438\u0442.")));
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
