// Полная замена модуля FlashcardsLMS. Требуется только window.React.
(function () {
  'use strict';

  const {
    useState,
    useRef,
    useEffect
  } = React;
  const icons = {
    cards: <><rect x="7" y="3" width="13" height="17" rx="3" /><path d="M4 7v12a3 3 0 0 0 3 3h9M11 8h5M11 12h3" /></>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    repeat: <><path d="M20 4v6h-6" /><path d="M20 10a8 8 0 1 0-1 8" /></>,
    flip: <><path d="M4 8h12l-3-3M20 16H8l3 3" /><path d="M4 8v5m16 3v-5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />
  };
  const Icon = ({
    name,
    size = 20
  }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
  const fresh = cards => ({
    cards,
    index: 0,
    flipped: false,
    ratings: cards.map(() => null),
    done: false,
    serial: 0,
    direction: 1
  });
  function parseCards(text) {
    const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const data = JSON.parse(clean);
    if (!Array.isArray(data)) throw Error('shape');
    const seen = new Set();
    const cards = [];
    for (const c of data.slice(0, 30)) {
      if (!c || typeof c.q !== 'string' || typeof c.a !== 'string') continue;
      const q = c.q.trim(),
        a = c.a.trim();
      if (!q || !a || q.length > 500 || a.length > 2000 || seen.has(q.toLowerCase())) continue;
      seen.add(q.toLowerCase());
      cards.push({
        q,
        a
      });
    }
    if (cards.length < 3) throw Error('few');
    return cards.slice(0, 20);
  }
  const DEFAULT_CARDS = [{
    q: "Что означает аббревиатура HTML?",
    a: "HyperText Markup Language (Язык гипертекстовой разметки)."
  }, {
    q: "За что отвечает CSS на веб-странице?",
    a: "За внешний вид, цвета, шрифты и расположение элементов (стилизацию)."
  }, {
    q: "Для чего нужен тег <a> в HTML?",
    a: "Он создает гиперссылку для перехода на другую страницу или сайт."
  }, {
    q: "Какая комбинация клавиш отменяет последнее действие?",
    a: "Ctrl + Z"
  }, {
    q: "Что делает свойство 'display: flex' в CSS?",
    a: "Включает гибкую модель (Flexbox), которая позволяет легко выравнивать элементы."
  }];
  const CSS = `.fc2{--f-bg:#12101d;--f-panel:#1d192c;--f-soft:#29223c;--f-text:#f5f1ff;--f-muted:#b1a7c6;--f-line:#cdb6ff1b;--f-accent:#b59aff;--f-tint:#a27bec12;--f-green:#89e3bc;--f-shadow:#00000030;max-width:960px;width:100%;margin:auto;color:var(--f-text);color-scheme:dark;font:16px/1.5 'Segoe UI',Inter,system-ui,sans-serif;isolation:isolate}
:is(html.light,body.light,.theme-light,[data-theme=light]) .fc2,.fc2.fc2-light{--f-bg:#f5f2fb;--f-panel:#fff;--f-soft:#ece5f6;--f-text:#2c233d;--f-muted:#756781;--f-line:#71538e25;--f-accent:#794abd;--f-tint:#9661df10;--f-green:#177a54;--f-shadow:#5e3d8715;color-scheme:light}
.fc2.fc2-dark{--f-bg:#12101d;--f-panel:#1d192c;--f-soft:#29223c;--f-text:#f5f1ff;--f-muted:#b1a7c6;--f-line:#cdb6ff1b;--f-accent:#b59aff;--f-tint:#a27bec12;--f-green:#89e3bc;--f-shadow:#00000030;color-scheme:dark}
.fc2 *,.fc2 *:before,.fc2 *:after{box-sizing:border-box}.fc2 h2,.fc2 h3,.fc2 h4,.fc2 p{margin:0}.fc2 button,.fc2 input{font:inherit;color:inherit}.fc2 button{cursor:pointer;letter-spacing:normal}.fc2 button:disabled{opacity:.45;cursor:default;transform:none}.fc2 svg{display:block;flex-shrink:0}.fc2 button:focus-visible,.fc2 input:focus-visible,.fc2 [tabindex]:focus-visible{outline:3px solid var(--f-accent);outline-offset:4px}.fc2-shell{padding:32px;background:radial-gradient(ellipse at 100% 0,var(--f-tint),transparent 60%),var(--f-bg);border:1px solid var(--f-line);border-radius:28px;box-shadow:0 24px 70px var(--f-shadow);animation:fc2-appear .55s ease both}.fc2-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding-bottom:23px;border-bottom:1px solid var(--f-line)}.fc2-brand{display:flex;align-items:center;gap:13px}.fc2-brand-icon{display:grid;place-items:center;width:48px;height:48px;background:linear-gradient(145deg,#b887f5,#8055db);border-radius:15px;color:white;box-shadow:0 8px 22px #8b54d52b,inset 0 1px 0 #ffffff40}.fc2-brand h2{font-size:23px;font-weight:750;letter-spacing:-.7px}.fc2-brand>div>span{font-size:8px;letter-spacing:1.6px;color:var(--f-muted);font-weight:650}.fc2-pill{display:flex;align-items:center;gap:6px;border:1px solid var(--f-line);border-radius:9px;padding:6px 10px;font-size:10px;letter-spacing:1px;color:var(--f-accent)}.fc2-intro{display:grid;grid-template-columns:1fr 150px;gap:24px;align-items:center;margin:28px 0}.fc2-eyebrow{display:block;color:var(--f-accent);font-size:9px;letter-spacing:1.5px;font-weight:700;margin-bottom:10px}.fc2-intro h3{font-size:clamp(27px,3vw,36px);line-height:1.23;letter-spacing:-1px;font-weight:750}.fc2-intro h3>span{color:var(--f-accent)}.fc2-intro p{font-size:13px;color:var(--f-muted);max-width:500px;margin-top:13px;line-height:1.75}.fc2-art{position:relative;height:145px;perspective:600px}.fc2-art>span{position:absolute;width:92px;height:119px;border-radius:15px;left:15px;top:12px;background:var(--f-soft);border:1px solid var(--f-line);transform:rotate(-19deg);box-shadow:0 8px 25px var(--f-shadow)}.fc2-art>span:nth-child(2){transform:rotate(-4deg);left:31px;background:#7545b6}.fc2-art>span:last-child{display:grid;place-items:center;color:#fff;left:48px;transform:rotate(12deg);background:linear-gradient(145deg,#bc8af1,#8256d6);border-color:#ffffff40;animation:fc2-float 6s ease-in-out infinite}.fc2-generator{padding:19px 20px;border:1px solid var(--f-line);border-radius:18px;background:var(--f-panel)}.fc2-generator label{display:block;font-size:12px;color:var(--f-muted);font-weight:650;margin-bottom:10px}.fc2-generator-row{display:flex;gap:10px}.fc2-generator input{flex:1;min-width:0;width:100%;height:49px;border:1px solid var(--f-line);background:var(--f-bg);border-radius:11px;padding:0 14px;font-size:14px;transition:border-color .2s}.fc2-generator input:focus{border-color:var(--f-accent)}.fc2-generator-note{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:10px;min-height:19px;font-size:10px;color:var(--f-muted)}.fc2 .fc2-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:47px;height:auto;padding:11px 19px;border:1px solid var(--f-line);border-radius:12px;background:var(--f-panel);font-size:13px;font-weight:650;line-height:1.5;transition:transform .18s,box-shadow .2s,border-color .2s;position:relative;overflow:hidden}.fc2 .fc2-btn:hover:not(:disabled){transform:translateY(-2px);border-color:var(--f-accent)}.fc2 .fc2-btn:active:not(:disabled){transform:translateY(1px) scale(.98)}.fc2 .fc2-generate{flex-shrink:0;background:var(--f-tint);color:var(--f-accent);border-color:var(--f-accent)}.fc2 .fc2-primary{color:#fff;background:linear-gradient(115deg,#a168e3,#7954d9);border-color:#b18bec60;box-shadow:0 8px 23px #8152c526,inset 0 1px 0 #ffffff20}.fc2-primary:after{content:'';position:absolute;inset:-70%;background:linear-gradient(110deg,transparent 44%,#ffffff25 50%,transparent 56%);transform:translateX(-65%);transition:transform .65s;pointer-events:none}.fc2-primary:hover:after{transform:translateX(65%)}.fc2 .fc2-text-btn{border:0;background:none;padding:4px;min-height:0;height:auto;font-size:11px;color:var(--f-muted);line-height:1.5}.fc2-text-btn:hover{text-decoration:underline;color:var(--f-accent)}.fc2-error,.fc2-notice{display:flex;align-items:center;gap:9px;padding:10px 13px;margin-top:12px;border-radius:10px;font-size:12px;animation:fc2-appear .25s both}.fc2-error{background:#dd4e7515;color:#ec809f;border:1px solid #dc54762b}.fc2-error button{margin-left:auto;background:transparent;border:0;padding:5px;min-height:0}.fc2-notice{background:#30b17b12;color:var(--f-green)}.fc2-study{margin-top:28px}.fc2-deck-heading{display:flex;align-items:center;justify-content:space-between;gap:20px}.fc2-deck-heading .fc2-eyebrow{font-size:8px;margin-bottom:4px}.fc2-deck-heading h4{font-size:16px;font-weight:650;overflow-wrap:anywhere}.fc2-counter{font-size:24px;white-space:nowrap;font-weight:700;font-variant-numeric:tabular-nums}.fc2-counter small{font-size:13px;color:var(--f-muted);font-weight:500}.fc2-progress{height:4px;border-radius:5px;background:var(--f-soft);overflow:hidden;margin-top:17px}.fc2-progress>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#895bd5,#c49ef6);transition:width .45s cubic-bezier(.2,.8,.2,1)}.fc2-progress-meta{display:flex;justify-content:space-between;gap:12px;margin-top:9px;font-size:10px;color:var(--f-muted)}.fc2-progress-meta>span:last-child{display:flex;gap:6px;align-items:center}.fc2-progress-meta i{display:block;width:5px;height:5px;background:var(--f-green);border-radius:50%}.fc2-progress-meta b{font-weight:400;margin:0 3px}
.fc2-stage{position:relative;margin:26px auto 28px;max-width:740px;perspective:1400px;animation:fc2-slide .35s cubic-bezier(.2,.8,.2,1) both}.fc2-stage:before,.fc2-stage:after{content:'';position:absolute;inset:10px 10px -8px;border:1px solid var(--f-line);background:var(--f-panel);border-radius:23px;z-index:-1;pointer-events:none}.fc2-stage:after{inset:20px 20px -15px;z-index:-2;background:var(--f-soft)}.fc2-card{cursor:pointer;border-radius:23px;-webkit-tap-highlight-color:transparent;outline-offset:7px!important}.fc2-card-inner{display:grid;transform-style:preserve-3d;transition:transform .65s cubic-bezier(.2,.75,.25,1)}.fc2-card-inner.is-flipped{transform:rotateY(180deg)}.fc2-face{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden;min-height:310px;display:flex;flex-direction:column;padding:24px 29px;border-radius:23px;border:1px solid var(--f-line);background:radial-gradient(ellipse at 95% 0,var(--f-tint),transparent 70%),var(--f-panel);box-shadow:0 15px 35px var(--f-shadow);overflow-wrap:anywhere}.fc2-front{transform:translateZ(1px)}.fc2-back{transform:rotateY(180deg) translateZ(1px);background:radial-gradient(ellipse at 100% 0,#c689ff35,transparent 65%),linear-gradient(135deg,#613c9e,#352553);border-color:#b38add65;color:#fff}.fc2-face-top,.fc2-face-foot{display:flex;align-items:center;justify-content:space-between;gap:15px;color:var(--f-muted);font-size:11px}.fc2-face-top{font-size:9px;font-weight:650;letter-spacing:1.6px}.fc2-back .fc2-face-top,.fc2-back .fc2-face-foot{color:#e2d1f7}.fc2-face-content{flex:1;display:grid;place-items:center;text-align:center;padding:35px 8px}.fc2-face-content h3{font-size:clamp(22px,2.8vw,29px);font-weight:650;line-height:1.5;letter-spacing:-.4px;max-width:590px}.fc2-face-content p{font-size:clamp(18px,2.3vw,23px);font-weight:500;line-height:1.65;white-space:pre-wrap;max-width:600px}.fc2-face-foot{font-size:10px}.fc2-navigation{display:flex;align-items:center;justify-content:center;gap:13px}.fc2 .fc2-nav-arrow{display:grid;place-items:center;width:46px;height:46px;min-height:0;padding:0;border:1px solid var(--f-line);border-radius:12px;background:var(--f-panel);color:var(--f-muted);transition:background .2s,transform .18s}.fc2-nav-arrow:hover:not(:disabled){color:var(--f-accent);background:var(--f-soft);transform:translateY(-2px)}.fc2-prev svg{transform:rotate(180deg)}.fc2-reveal{min-width:220px}.fc2-rating-area{min-height:62px;display:grid;place-items:center;margin-top:14px}.fc2-shortcuts{font-size:10px;color:var(--f-muted)}.fc2-shortcuts span{margin:0 8px}.fc2-rating{display:flex;justify-content:center;gap:10px}.fc2-rating .fc2-btn{min-width:140px;min-height:40px;font-size:12px}.fc2 .fc2-known{background:#29b47a12;color:var(--f-green);border-color:#3dbe8738}.fc2 .fc2-again{background:var(--f-tint);color:var(--f-accent)}.fc2-enter{animation:fc2-appear .35s both}.fc2-loading{min-height:450px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:15px;text-align:center}.fc2-loading-art{width:80px;height:80px;display:grid;place-items:center;color:var(--f-accent);background:var(--f-tint);border:1px solid var(--f-line);border-radius:22px;animation:fc2-breathe 2s ease-in-out infinite}.fc2-loading h3{font-size:23px}.fc2-loading p{font-size:13px;color:var(--f-muted)}.fc2-loader-line{height:4px;width:160px;margin-top:9px;background:var(--f-soft);border-radius:5px;overflow:hidden;position:relative}.fc2-loader-line:after{content:'';position:absolute;width:45%;height:100%;background:var(--f-accent);border-radius:inherit;animation:fc2-loading 1.4s ease-in-out infinite}.fc2-spinner{display:block;width:16px;height:16px;border:2px solid var(--f-line);border-top-color:var(--f-accent);border-radius:50%;animation:fc2-spin .8s linear infinite}.fc2-summary{text-align:center;padding:35px 10px 12px;display:flex;flex-direction:column;align-items:center}.fc2-summary-icon{display:grid;place-items:center;width:76px;height:76px;border-radius:24px;color:white;background:linear-gradient(145deg,#b17fed,#7952d3);box-shadow:0 12px 32px #8854ce2a;margin-bottom:23px;animation:fc2-pop .55s cubic-bezier(.2,.9,.2,1.3)}.fc2-summary h3{font-size:30px;letter-spacing:-.8px}.fc2-summary>p{font-size:14px;line-height:1.7;max-width:460px;color:var(--f-muted);margin-top:12px}.fc2-summary-stats{display:grid;grid-template-columns:repeat(3,1fr);width:100%;max-width:560px;gap:12px;margin:27px 0}.fc2-summary-stats>div{padding:19px 12px;border:1px solid var(--f-line);border-radius:15px;background:var(--f-panel)}.fc2-summary-stats strong{display:block;font-size:28px;font-weight:650;color:var(--f-accent)}.fc2-summary-stats span{display:block;font-size:11px;color:var(--f-muted);margin-top:4px}.fc2-summary>.fc2-text-btn{margin-top:14px}
@keyframes fc2-appear{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fc2-slide{from{opacity:0;transform:translateX(var(--fc2-slide,20px))}to{opacity:1;transform:translateX(0)}}@keyframes fc2-float{0%,100%{transform:translateY(0) rotate(12deg)}50%{transform:translateY(-7px) rotate(9deg)}}@keyframes fc2-breathe{50%{transform:translateY(-5px);box-shadow:0 0 30px var(--f-tint)}}@keyframes fc2-loading{from{transform:translateX(-100%)}to{transform:translateX(325%)}}@keyframes fc2-spin{to{transform:rotate(360deg)}}@keyframes fc2-pop{from{opacity:0;transform:scale(.7) rotate(-10deg)}to{opacity:1;transform:scale(1) rotate(0)}}
@media(max-width:600px){.fc2-shell{padding:19px;border-radius:22px}.fc2-brand{gap:10px}.fc2-brand h2{font-size:20px}.fc2-brand-icon{width:41px;height:41px;border-radius:12px}.fc2-brand>div>span{font-size:7px;letter-spacing:1px}.fc2-header{padding-bottom:18px}.fc2-intro{grid-template-columns:1fr;gap:0;margin:24px 0}.fc2-art{display:none}.fc2-intro h3{font-size:30px}.fc2-eyebrow{font-size:8px;letter-spacing:1px}.fc2-generator{padding:16px}.fc2-generator-row{flex-direction:column}.fc2-generator input{flex:auto}.fc2-generator-note{align-items:flex-start;font-size:9px}.fc2-deck-heading h4{font-size:14px}.fc2-progress-meta{font-size:9px}.fc2-face{padding:20px;min-height:320px}.fc2-face-content{padding:26px 0}.fc2-face-content h3{font-size:23px}.fc2-face-content p{font-size:19px}.fc2-face-foot{font-size:9px}.fc2-navigation{gap:8px}.fc2-reveal{min-width:0;flex:1;max-width:230px}.fc2 .fc2-nav-arrow{width:40px;height:44px;flex-shrink:0}.fc2 .fc2-reveal{font-size:12px;padding:11px 10px}.fc2-rating{width:100%}.fc2-rating .fc2-btn{min-width:0;flex:1;max-width:180px}.fc2-shortcuts{font-size:9px}.fc2-summary h3{font-size:27px}.fc2-summary-stats{gap:8px}.fc2-summary-stats>div{padding:14px 8px}.fc2-summary-stats strong{font-size:26px}.fc2-loading{min-height:380px}}
@media(prefers-reduced-motion:reduce){.fc2 *,.fc2 *:before,.fc2 *:after{animation:none!important;transition:none!important}}
/* Perspective belongs to the rotating card's immediate parent. */
.fc2 .fc2-card{perspective:1400px;-webkit-perspective:1400px}
.fc2 .fc2-card-inner{transform:rotateY(0deg);transform-origin:50% 50%;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;transition:transform 850ms cubic-bezier(.45,0,.2,1);will-change:transform}
.fc2 .fc2-card-inner.is-flipped{transform:rotateY(180deg)}
.fc2 .fc2-face{backface-visibility:hidden;-webkit-backface-visibility:hidden}


/* The requested user-triggered flip stays animated in both motion modes. */
.fc2 .fc2-card .fc2-card-inner{transform:rotateY(0deg)!important;transition:transform 850ms cubic-bezier(.45,0,.2,1)!important;transform-style:preserve-3d!important;overflow:visible!important}
.fc2 .fc2-card .fc2-card-inner.is-flipped{transform:rotateY(180deg)!important}
.fc2 .fc2-card .fc2-front{transform:translateZ(1px)!important;visibility:visible!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important}
.fc2 .fc2-card .fc2-back{transform:rotateY(180deg) translateZ(1px)!important;visibility:visible!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important}
`;
  function FlashcardsLMS({
    theme
  } = {}) {
    const [session, setSession] = useState(() => fresh(DEFAULT_CARDS)),
      [topic, setTopic] = useState('Основы веб-разработки'),
      [deckName, setDeckName] = useState('Основы веб-разработки'),
      [busy, setBusy] = useState(false),
      [error, setError] = useState(''),
      [notice, setNotice] = useState('');
    const state = useRef(session),
      request = useRef(null),
      mounted = useRef(true),
      version = useRef(0),
      root = useRef(null),
      fullDeck = useRef(DEFAULT_CARDS),
      restoreFocus = useRef(false);
    const commit = s => {
      state.current = s;
      setSession(s);
    };
    useEffect(() => {
      mounted.current = true;
      let style = document.getElementById('flashcards-lms-v2-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'flashcards-lms-v2-styles';
        document.head.appendChild(style);
      }
      style.textContent = CSS;
      return () => {
        mounted.current = false;
        version.current++;
        request.current?.abort();
      };
    }, []);
    useEffect(() => {
      if (!notice) return;
      const timer = setTimeout(() => setNotice(''), 3000);
      return () => clearTimeout(timer);
    }, [notice]);
    useEffect(() => {
      if (restoreFocus.current) {
        root.current?.querySelector(session.done ? '.fc2-summary-title' : '.fc2-card')?.focus({
          preventScroll: true
        });
        restoreFocus.current = false;
      }
    }, [session.serial, session.done]);
    function flip() {
      if (request.current || state.current.done) return;
      commit({
        ...state.current,
        flipped: !state.current.flipped
      });
    }
    function move(step) {
      const s = state.current;
      if (request.current || s.done) return;
      const index = s.index + step;
      if (index < 0 || index >= s.cards.length) return;
      restoreFocus.current = true;
      commit({
        ...s,
        index,
        flipped: false,
        serial: s.serial + 1,
        direction: step
      });
    }
    function rate(value) {
      const s = state.current;
      if (request.current || s.done || !s.flipped) return;
      const ratings = s.ratings.map((v, i) => i === s.index ? value : v);
      let next = -1;
      for (let n = 1; n <= s.cards.length; n++) {
        const i = (s.index + n) % s.cards.length;
        if (ratings[i] === null) {
          next = i;
          break;
        }
      }
      restoreFocus.current = true;
      commit({
        ...s,
        ratings,
        index: next < 0 ? s.index : next,
        done: next < 0,
        flipped: false,
        serial: s.serial + 1,
        direction: 1
      });
    }
    function restart(difficult = false) {
      const s = state.current;
      const cards = difficult ? s.cards.filter((_, i) => s.ratings[i] === 'again') : fullDeck.current;
      if (!cards.length) return;
      restoreFocus.current = true;
      commit({
        ...fresh(cards),
        serial: s.serial + 1
      });
    }
    function onKeyDown(e) {
      if (e.defaultPrevented || e.repeat || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input,textarea,select,[contenteditable=true]')) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move(1);
      } else if (e.key === ' ' && !e.target.closest('button')) {
        e.preventDefault();
        flip();
      }
    }
    async function generate(e) {
      e?.preventDefault();
      if (request.current) return;
      const name = topic.trim();
      if (!name) {
        setError('Введи тему для новой колоды.');
        return;
      }
      const controller = new AbortController(),
        id = ++version.current;
      request.current = controller;
      setBusy(true);
      setError('');
      setNotice('');
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 30000);
      try {
        const response = await fetch('https://gemini-proxy-lms.msleaderindustry.workers.dev', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Создай 10 учебных карточек на русском языке по теме ${JSON.stringify(name)}. В каждой один понятный вопрос и точный краткий ответ. Не выдумывай факты. Верни только JSON-массив [{"q":"Вопрос","a":"Ответ"}], без markdown.`
              }]
            }]
          })
        });
        if (!response.ok) throw Error('HTTP');
        const data = await response.json();
        if (data.error) throw Error('API');
        const text = (data.candidates?.[0]?.content?.parts || []).map(p => typeof p.text === 'string' ? p.text : '').join('');
        const cards = parseCards(text);
        if (!mounted.current || id !== version.current || controller.signal.aborted) return;
        fullDeck.current = cards;
        commit({
          ...fresh(cards),
          serial: state.current.serial + 1
        });
        setDeckName(name);
        setNotice(`Колода готова · ${cards.length} карточек`);
      } catch (e) {
        if (mounted.current && id === version.current && (!controller.signal.aborted || timedOut)) setError(timedOut ? 'Генерация заняла слишком много времени. Попробуй ещё раз.' : 'Не удалось создать колоду. Попробуй уточнить тему. Текущие карточки остались на месте.');
      } finally {
        clearTimeout(timer);
        if (mounted.current && id === version.current) {
          request.current = null;
          setBusy(false);
        }
      }
    }
    function cancel() {
      version.current++;
      request.current?.abort();
      request.current = null;
      setBusy(false);
    }
    const {
        cards,
        index,
        flipped,
        ratings,
        done
      } = session,
      card = cards[index],
      known = ratings.filter(v => v === 'known').length,
      again = ratings.filter(v => v === 'again').length,
      reviewed = known + again,
      progress = reviewed / cards.length * 100;
    return <section ref={root} className={`fc2 ${theme === 'light' ? 'fc2-light' : theme === 'dark' ? 'fc2-dark' : ''}`} aria-label="Умные карточки" onKeyDown={onKeyDown}><div className="fc2-shell">
 <header className="fc2-header"><div className="fc2-brand"><span className="fc2-brand-icon"><Icon name="cards" size={24} /></span><div><h2>Умные карточки</h2><span>ULTIMATE LMS · ОБУЧЕНИЕ</span></div></div><span className="fc2-pill"><Icon name="spark" size={13} /> AI</span></header>
 <div className="fc2-intro"><div><span className="fc2-eyebrow">ОДНА КАРТОЧКА — ОДИН ШАГ ВПЕРЁД</span><h3>Вспоминай.<br /><span>И запоминай надолго.</span></h3><p>Попробуй ответить сам, переверни карточку и отметь, что стоит повторить.</p></div><div className="fc2-art" aria-hidden="true"><span /><span /><span><Icon name="spark" size={40} /></span></div></div>
 <form className="fc2-generator" onSubmit={generate}><label htmlFor="fc2-topic">Что изучаем сегодня?</label><div className="fc2-generator-row"><input id="fc2-topic" value={topic} onChange={e => setTopic(e.target.value)} maxLength={160} placeholder="Например, Excel или основы биологии" disabled={busy} autoComplete="off" /><button type="submit" className="fc2-btn fc2-generate" disabled={busy || !topic.trim()}>{busy ? <span className="fc2-spinner" /> : <Icon name="spark" size={18} />} {busy ? 'Создаём…' : 'Создать колоду'}</button></div><div className="fc2-generator-note"><span>Карточки ИИ могут содержать ошибки — проверяй важные факты.</span>{busy && <button type="button" className="fc2-text-btn" onClick={cancel}>Отменить</button>}</div></form>
 {error && <div className="fc2-error" role="alert"><span>{error}</span><button type="button" aria-label="Закрыть сообщение" onClick={() => setError('')}><Icon name="close" size={16} /></button></div>}{notice && <div className="fc2-notice" role="status"><Icon name="check" size={16} />{notice}</div>}
 {busy ? <div className="fc2-loading" role="status" aria-live="polite"><div className="fc2-loading-art"><Icon name="cards" size={36} /></div><h3>Собираем твою колоду</h3><p>Подбираем вопросы и короткие объяснения.</p><div className="fc2-loader-line" /></div> : done ? <div className="fc2-summary fc2-enter"><div className="fc2-summary-icon"><Icon name="check" size={34} /></div><span className="fc2-eyebrow">ПОДХОД ЗАВЕРШЁН</span><h3 className="fc2-summary-title" tabIndex={-1}>{again ? 'Закрепим сложное?' : 'Вся колода пройдена'}</h3><p>{again ? 'Вернись к карточкам, которые пока не удалось вспомнить.' : 'Ты отметил все ответы как знакомые. Можно пройти колоду ещё раз.'}</p><div className="fc2-summary-stats"><div><strong>{known}</strong><span>Помню</span></div><div><strong>{again}</strong><span>Повторить</span></div><div><strong>{cards.length}</strong><span>Всего</span></div></div><button type="button" className="fc2-btn fc2-primary" onClick={() => restart(again > 0)}><Icon name="repeat" size={18} />{again ? `Повторить сложные · ${again}` : 'Пройти ещё раз'}</button>{again > 0 && <button type="button" className="fc2-text-btn" onClick={() => restart()}>Повторить всю колоду</button>}</div> : <div className="fc2-study"><div className="fc2-deck-heading"><div><span className="fc2-eyebrow">ТВОЯ КОЛОДА</span><h4>{deckName}</h4></div><span className="fc2-counter" aria-live="polite">{index + 1}<small> / {cards.length}</small></span></div><div className="fc2-progress" role="progressbar" aria-label="Оценено карточек" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={reviewed}><span style={{
              width: `${progress}%`
            }} /></div><div className="fc2-progress-meta"><span>Оценено {reviewed} из {cards.length}</span><span><i />{known} помню <b>·</b> {again} повторить</span></div>
 <div className="fc2-stage" key={session.serial} style={{
            '--fc2-slide': session.direction < 0 ? '-22px' : '22px'
          }}><div className="fc2-card" tabIndex={0} role="button" aria-label={flipped ? 'Ответ. Нажми, чтобы показать вопрос' : 'Вопрос. Нажми, чтобы показать ответ'} aria-pressed={flipped} onClick={flip} onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                flip();
              }
            }}><div className={`fc2-card-inner ${flipped ? 'is-flipped' : ''}`}><div className="fc2-face fc2-front" aria-hidden={flipped}><div className="fc2-face-top"><span>ВОПРОС</span><Icon name="cards" size={21} /></div><div className="fc2-face-content"><h3>{card.q}</h3></div><div className="fc2-face-foot"><span>Сначала попробуй вспомнить</span><Icon name="flip" size={19} /></div></div><div className="fc2-face fc2-back" aria-hidden={!flipped}><div className="fc2-face-top"><span>ОТВЕТ</span><Icon name="spark" size={21} /></div><div className="fc2-face-content"><p>{card.a}</p></div><div className="fc2-face-foot"><span>Получилось вспомнить?</span><Icon name="flip" size={19} /></div></div></div></div></div>
 <div className="fc2-navigation"><button type="button" className="fc2-nav-arrow fc2-prev" aria-label="Предыдущая карточка" onClick={() => move(-1)} disabled={index === 0}><Icon name="arrow" /></button><button type="button" className="fc2-btn fc2-primary fc2-reveal" onClick={flip}><Icon name="flip" size={18} />{flipped ? 'Показать вопрос' : 'Показать ответ'}</button><button type="button" className="fc2-nav-arrow" aria-label="Следующая карточка" onClick={() => move(1)} disabled={index === cards.length - 1}><Icon name="arrow" /></button></div>
 <div className="fc2-rating-area">{flipped ? <div className="fc2-rating fc2-enter"><button type="button" className="fc2-btn fc2-again" onClick={() => rate('again')}><Icon name="repeat" size={17} />Повторить</button><button type="button" className="fc2-btn fc2-known" onClick={() => rate('known')}><Icon name="check" size={18} />Помню</button></div> : <p className="fc2-shortcuts">Пробел — переворот <span>·</span> ← → — смена карточки</p>}</div>
 </div>}
 </div></section>;
  }
  Object.assign(window, {
    FlashcardsLMS
  });
})();
