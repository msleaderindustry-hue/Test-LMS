// Ultimate LMS · статистика v4 (анимации). Только StatsView.
// Полная замена файла статистики; модуль тестирования менять не нужно.
(function () {
  'use strict';

  const {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo
  } = React;
  let nextId = 0;
  const useId = React.useId || function () {
    const ref = useRef(null);
    if (!ref.current) ref.current = `usp-${++nextId}`;
    return ref.current;
  };
  const list = value => Array.isArray(value) ? value : [];
  const str = value => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) && value !== null && value !== '' ? Math.max(0, Number(value)) : fallback;
  const score = value => value !== null && value !== undefined && str(value).trim() !== '' && Number.isFinite(Number(value)) ? Math.min(100, Math.max(0, Number(value))) : null;
  const fmt = value => new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 1
  }).format(value);
  const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const TABS = [{
    id: 'tests',
    label: 'Тесты',
    icon: 'tests'
  }, {
    id: 'excel',
    label: 'Excel',
    icon: 'excel'
  }, {
    id: 'typing',
    label: 'Печать',
    icon: 'typing'
  }, {
    id: 'hotkeys',
    label: 'Хоткеи',
    icon: 'bolt'
  }, {
    id: 'leaderboard',
    label: 'Рейтинг',
    icon: 'cup'
  }];
  const ICONS = {
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
    tests: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    excel: <><path d="M5 20V12M12 20V4M19 20V8" /><path d="M3 20h18" /></>,
    typing: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 15h8" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-12h-8z" />,
    cup: <><path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 13v7M8 21h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="m14 6-6 6 6 6M8 12h12" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2" /></>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>
  };
  const Icon = ({
    name,
    size = 18
  }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[name] || ICONS.spark}</svg>;
  const CSS = `
.usp{--up-bg:#131624;--up-surface:#1b2031;--up-soft:#252b40;--up-text:#f1f2fa;--up-muted:#a6afc8;--up-line:#32394f;--up-accent:#b5a1ff;--up-tint:#9b7aff1a;--up-green:#6ce2b5;--up-green-bg:#153e35;--up-red:#ffa9b7;--up-red-bg:#442834;--up-shadow:0 24px 80px #070b192b;color:var(--up-text);color-scheme:dark;font-family:inherit;font-size:16px;line-height:1.5;width:100%;max-width:1120px;margin:0 auto;min-width:0;isolation:isolate}
:is(html.light,body.light,.theme-light,[data-theme="light"]) .usp,.usp.theme-light{--up-bg:#f4f5fc;--up-surface:#fff;--up-soft:#e9edf8;--up-text:#242941;--up-muted:#5e6881;--up-line:#d8deef;--up-accent:#7048d1;--up-tint:#7953da12;--up-green:#137353;--up-green-bg:#e0f4ea;--up-red:#ac3452;--up-red-bg:#fbe6ec;--up-shadow:0 24px 70px #46598a14;color-scheme:light}
.usp.theme-dark{--up-bg:#131624;--up-surface:#1b2031;--up-soft:#252b40;--up-text:#f1f2fa;--up-muted:#a6afc8;--up-line:#32394f;--up-accent:#b5a1ff;--up-tint:#9b7aff1a;--up-green:#6ce2b5;--up-green-bg:#153e35;--up-red:#ffa9b7;--up-red-bg:#442834;color-scheme:dark}
.usp *,.usp *:before,.usp *:after{box-sizing:border-box}.usp h2,.usp h3,.usp p{margin:0}.usp button,.usp input,.usp select{font:inherit;letter-spacing:inherit;color:inherit}.usp button{cursor:pointer}.usp button:disabled{cursor:default;opacity:.5}.usp svg{flex-shrink:0}.usp button:focus-visible,.usp input:focus-visible,.usp select:focus-visible,.usp [tabindex]:focus-visible{outline:3px solid var(--up-accent);outline-offset:4px}.usp [hidden]{display:none!important}
.usp-shell{padding:36px;border:1px solid var(--up-line);border-radius:32px;background:radial-gradient(ellipse at 90% 0,var(--up-tint),transparent 48%),var(--up-bg);box-shadow:var(--up-shadow)}
.usp-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:30px}.usp-eyebrow{display:flex;gap:8px;align-items:center;font-size:11px;letter-spacing:2px;font-weight:750;text-transform:uppercase;color:var(--up-accent);margin-bottom:10px}.usp h2{font-size:clamp(28px,3.4vw,38px);line-height:1.2;font-weight:800;letter-spacing:-1.2px}.usp-subtitle{font-size:15px;color:var(--up-muted);margin-top:10px!important}.usp-mark{width:64px;height:64px;display:grid;place-items:center;border:1px solid var(--up-line);border-radius:20px;background:var(--up-tint);color:var(--up-accent);transform:rotate(-8deg)}
.usp-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--up-line);background:var(--up-soft);border-radius:19px;margin-bottom:27px;overflow-x:auto;scrollbar-width:thin}.usp-tab{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;flex:1;min-height:50px;padding:12px 16px;border:1px solid transparent;border-radius:13px;white-space:nowrap;color:var(--up-muted)!important;background:transparent;font-size:15px!important;font-weight:650!important;transition:background .2s,color .2s,transform .2s}.usp-tab:hover{background:var(--up-tint);color:var(--up-text)!important}.usp-tab[aria-selected=true]{color:#fff!important;background:linear-gradient(130deg,#8a5ce7,#6d4ad1);border-color:#ac89ef70;box-shadow:0 5px 16px #6336b626;animation:usp-tab-in .25s ease-out}.usp-tab:active{transform:scale(.97)}
.usp-enter{animation:usp-in .4s cubic-bezier(.2,.75,.25,1) both}.usp-metrics{display:grid;grid-template-columns:repeat(var(--up-columns,4),minmax(0,1fr));gap:12px;margin-bottom:22px}.usp-metric{border:1px solid var(--up-line);background:var(--up-surface);border-radius:19px;padding:21px 18px;min-width:0;animation:usp-in .45s both;transition:transform .2s,border-color .2s}.usp-metric:hover{transform:translateY(-3px);border-color:var(--up-accent)}.usp-metric-label{display:flex;align-items:center;gap:7px;color:var(--up-muted);font-size:13px;min-height:39px}.usp-metric-label svg{width:17px;height:17px}.usp-metric-value{display:block;margin:7px 0;font-size:36px;font-weight:780;line-height:1.2;letter-spacing:-1px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.usp-metric-value small{font-size:15px;font-weight:500;margin-left:5px;color:var(--up-muted);letter-spacing:0}.usp-metric-note{font-size:12px;color:var(--up-muted)}.usp-accent{color:var(--up-accent)}
.usp-card{background:var(--up-surface);border:1px solid var(--up-line);padding:25px;border-radius:23px;margin-top:20px;min-width:0}.usp-section-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:22px}.usp h3{font-size:19px;font-weight:730;letter-spacing:-.4px;line-height:1.3}.usp-caption{color:var(--up-muted);font-size:13px;line-height:1.5}.usp-section-head .usp-caption{margin-top:5px}.usp-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:9px;background:var(--up-tint);color:var(--up-accent);font-size:12px;font-weight:650;white-space:nowrap}
.usp-overview{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:20px;margin-bottom:22px}.usp-overview .usp-card{margin:0}.usp-ring-card{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:23px 16px}.usp-ring{position:relative;width:180px;height:180px;flex-shrink:0;margin:14px auto}.usp-ring svg{display:block;width:100%;height:100%;overflow:visible}.usp-ring-track{fill:none;stroke:var(--up-soft);stroke-width:10}.usp-ring-fill{fill:none;stroke:var(--up-accent);stroke-width:10;stroke-linecap:round;transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1);filter:drop-shadow(0 0 7px #9b74ee33)}.usp-ring-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px}.usp-ring-center strong{font-size:36px;letter-spacing:-1px;line-height:1.2;font-variant-numeric:tabular-nums}.usp-ring-center small{font-size:13px;color:var(--up-muted)}
.usp-chart{height:224px;display:flex;gap:12px;padding-top:20px}.usp-scale{display:flex;flex-direction:column;justify-content:space-between;padding-bottom:29px;font-size:11px;color:var(--up-muted);width:26px;flex-shrink:0}.usp-bars{flex:1;display:flex;gap:clamp(5px,1.2vw,14px);align-items:stretch;justify-content:space-around;min-width:0;background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),var(--up-line) calc(25% - 1px),var(--up-line) 25%);background-size:100% calc(100% - 29px);background-repeat:no-repeat}.usp-bar-col{display:flex;flex-direction:column;align-items:center;flex:1;max-width:62px;min-width:0;padding:0;border:0;background:transparent;border-radius:7px}.usp-bar-track{display:flex;align-items:flex-end;flex:1;width:100%;min-height:0;position:relative}.usp-bar{width:100%;min-height:3px;border-radius:8px 8px 4px 4px;background:linear-gradient(0deg,#7250cb,#c2abfc);position:relative;transform-origin:bottom;animation:usp-grow .7s cubic-bezier(.2,.75,.25,1) both;transition:filter .2s}.usp-bar-col[aria-pressed=true] .usp-bar{background:linear-gradient(0deg,#6a3ec4,#cbaeff);box-shadow:0 0 0 2px var(--up-accent),0 6px 16px #7145c433}.usp-bar-col:hover .usp-bar{filter:brightness(1.18)}.usp-bar-tip{position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);font-size:11px;font-weight:650;white-space:nowrap;color:var(--up-muted)}.usp-bar-label{flex:0 0 29px;padding-top:7px;font-size:11px;color:var(--up-muted)}.usp-chart-detail{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 15px;margin-top:13px;background:var(--up-tint);border-radius:12px;min-height:68px}.usp-chart-detail>div{min-width:0}.usp-chart-detail strong{font-size:14px;display:block;overflow-wrap:anywhere}.usp-chart-detail>b{font-size:22px;color:var(--up-accent);white-space:nowrap}.usp-segment{display:flex;padding:3px;gap:3px;background:var(--up-soft);border-radius:11px;flex-shrink:0}.usp-segment button{border:0;background:transparent;padding:8px 11px;border-radius:8px;font-size:12px;color:var(--up-muted);font-weight:650}.usp-segment button[aria-pressed=true]{background:var(--up-surface);color:var(--up-text);box-shadow:0 2px 5px #00000012}
.usp-tools{display:flex;gap:10px;align-items:center}.usp-search{display:flex;align-items:center;gap:10px;flex:1;min-width:0;border:1px solid var(--up-line);background:var(--up-bg);border-radius:13px;padding:0 14px;color:var(--up-muted)}.usp-search input{width:100%;min-width:0;height:48px;border:0;outline:none;background:transparent;font-size:15px}.usp-search input::placeholder{color:var(--up-muted)}.usp-search:focus-within{border-color:var(--up-accent);box-shadow:0 0 0 2px var(--up-tint)}.usp-search input:focus-visible{outline:none}.usp-select{height:50px;max-width:165px;border:1px solid var(--up-line);background:var(--up-bg);border-radius:13px;padding:0 12px;font-size:14px!important}.usp-filters{display:flex;gap:7px;flex-wrap:wrap;margin:13px 0 9px}.usp-chip{border:1px solid var(--up-line);background:transparent;border-radius:9px;padding:7px 13px;font-size:12px!important;color:var(--up-muted)!important;transition:background .2s}.usp-chip[aria-pressed=true]{border-color:var(--up-accent);background:var(--up-tint);color:var(--up-accent)!important}.usp-record{display:grid;grid-template-columns:42px minmax(0,1fr) auto 36px;gap:14px;align-items:center;padding:19px 0;border-bottom:1px solid var(--up-line)}.usp-record:last-child{border-bottom:0}.usp-record-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:var(--up-tint);color:var(--up-accent)}.usp-record-title{font-size:15px;font-weight:650;overflow-wrap:anywhere}.usp-record-meta{font-size:12px;color:var(--up-muted);margin-top:4px;overflow-wrap:anywhere}.usp-record-score{font-size:23px;font-weight:750;letter-spacing:-.5px;white-space:nowrap;font-variant-numeric:tabular-nums}.usp-record-score small{font-size:13px;margin-left:2px}.usp-record-score.positive{color:var(--up-green)}.usp-record-score.negative{color:var(--up-red)}
.usp-icon-btn{display:inline-grid;place-items:center;width:38px;height:40px;border:1px solid transparent;border-radius:11px;background:transparent;color:var(--up-muted)!important;transition:background .2s,transform .2s}.usp-icon-btn:hover:not(:disabled){background:var(--up-soft);transform:translateY(-2px);color:var(--up-accent)!important}.usp-icon-btn.danger:hover{color:var(--up-red)!important;background:var(--up-red-bg)}.usp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:10px 15px;border:1px solid var(--up-line);border-radius:12px;background:var(--up-surface);font-size:13px!important;font-weight:650!important;transition:transform .18s,background .18s,border-color .18s}.usp-btn:hover:not(:disabled){transform:translateY(-2px);border-color:var(--up-accent);background:var(--up-tint)}.usp-btn:active:not(:disabled){transform:scale(.97)}.usp-btn.danger{color:var(--up-red);background:var(--up-red-bg);border-color:var(--up-red)}.usp-pagination{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:18px}.usp-pagination>div{display:flex;gap:7px}
.usp-empty{padding:38px 14px;text-align:center;color:var(--up-muted)}.usp-empty .usp-mark{margin:0 auto 17px;transform:none}.usp-empty h3{color:var(--up-text);margin-bottom:10px}.usp-empty p{max-width:420px;margin:auto;font-size:14px}.usp-empty .usp-btn{margin-top:18px}.usp-confirm{display:flex;align-items:center;gap:15px;flex-wrap:wrap;padding:18px;background:var(--up-soft);border:1px solid var(--up-line);border-radius:15px;margin:15px 0;animation:usp-in .25s both}.usp-confirm-text{flex:1;min-width:170px;font-size:15px}.usp-confirm-actions{display:flex;gap:8px}.usp-error{font-size:14px;color:var(--up-red);flex-basis:100%;margin:12px 0!important}.usp-notice{font-size:14px;padding:12px 15px;border-radius:12px;color:var(--up-green);background:var(--up-green-bg);margin:12px 0}.usp-skeleton{height:78px;border-radius:16px;background:linear-gradient(100deg,var(--up-soft) 30%,var(--up-tint) 50%,var(--up-soft) 70%);background-size:220% 100%;margin:11px 0;animation:usp-shimmer 1.5s infinite}
.usp-training-hero{display:grid;grid-template-columns:minmax(0,1fr) 240px;align-items:center;gap:35px;background:radial-gradient(ellipse at 90% 10%,var(--up-tint),transparent 60%),var(--up-surface);padding:30px;margin-top:0;margin-bottom:22px}.usp-training-copy h3{font-size:29px;letter-spacing:-.8px;margin:17px 0 12px;max-width:450px}.usp-training-copy p{font-size:15px;color:var(--up-muted);max-width:470px}.usp-training-ring{text-align:center}.usp-training-ring .usp-ring{width:195px;height:195px}.usp-activity{background:var(--up-bg);border:1px solid var(--up-line);padding:22px;border-radius:17px}.usp-dots{display:grid;grid-template-columns:repeat(24,minmax(0,1fr));gap:7px;margin:20px 0 13px}.usp-dot{aspect-ratio:1;border-radius:5px;background:var(--up-accent);animation:usp-in .45s both}.usp-dot.off{background:var(--up-soft);border:1px solid var(--up-line)}.usp-hint{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--up-muted);margin-top:19px}.usp-hint svg{margin-top:2px;color:var(--up-accent)}
.usp-lb-top{display:flex;align-items:center;gap:10px;margin-bottom:20px}.usp-lb-top .usp-tabs{margin:0;flex:1;min-width:0}.usp-lb-top .usp-tab{font-size:13px!important;min-height:42px;padding:9px 13px}.usp-lb-row{display:grid;grid-template-columns:30px 46px minmax(0,1fr) auto;gap:15px;padding:17px 13px;border:1px solid transparent;border-bottom-color:var(--up-line);border-radius:15px;align-items:center;transition:background .2s}.usp-lb-row:hover{background:var(--up-tint)}.usp-lb-row.me{background:var(--up-tint);border-color:var(--up-accent)}.usp-rank{text-align:center;color:var(--up-muted);font-size:16px;font-weight:750}.usp-rank.top{background:var(--up-tint);color:var(--up-accent);border-radius:9px;padding:6px 0}.usp-avatar{width:46px;height:46px;border-radius:15px;background:hsl(var(--hue) 46% 45%);color:#fff;display:grid;place-items:center;font-size:15px;font-weight:750}.usp-lb-name{font-size:16px;font-weight:650;overflow-wrap:anywhere}.usp-lb-name .usp-badge{font-size:10px;padding:3px 6px;margin-left:7px}.usp-lb-value{font-size:25px;font-weight:750;text-align:right;line-height:1.2;font-variant-numeric:tabular-nums}.usp-lb-value small{display:block;font-size:11px;color:var(--up-muted);font-weight:500;line-height:1.5;margin-top:4px}
@keyframes usp-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes usp-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes usp-tab-in{from{filter:brightness(1.25)}to{filter:brightness(1)}}@keyframes usp-shimmer{to{background-position:-220% 0}}
@media(max-width:920px){.usp-shell{padding:25px}.usp-overview{grid-template-columns:minmax(0,1fr) 205px;gap:13px}.usp-card{padding:21px}.usp-chart-head{align-items:flex-start;flex-direction:column;gap:12px}.usp-ring{width:160px;height:160px}.usp-metric{padding:18px 14px}.usp-metric-value{font-size:32px}}
@media(max-width:680px){.usp-shell{padding:18px;border-radius:23px}.usp-heading{gap:12px;margin-bottom:24px}.usp-heading .usp-mark{display:none}.usp h2{font-size:29px}.usp-subtitle{font-size:14px}.usp-tabs{margin-bottom:20px}.usp-tab{flex-shrink:0;padding:11px 13px;min-height:46px;font-size:14px!important;gap:7px}.usp-tab svg{width:17px}.usp-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.usp-metric{padding:16px 13px}.usp-metric-value{font-size:31px}.usp-metric-label{font-size:12px;min-height:36px;gap:6px}.usp-metric-note{font-size:11px}.usp-overview{grid-template-columns:1fr}.usp-ring-card{display:grid;grid-template-columns:125px minmax(0,1fr);gap:0 15px;text-align:left}.usp-ring-card h3{grid-column:2;grid-row:1;align-self:end;font-size:17px}.usp-ring-card .usp-ring{grid-column:1;grid-row:1/3;width:125px;height:125px;margin:0}.usp-ring-card .usp-caption{grid-column:2;grid-row:2;align-self:start;margin-top:8px}.usp-ring-center strong{font-size:29px}.usp-ring-center small{font-size:11px}.usp-card{padding:18px;border-radius:18px}.usp h3{font-size:18px}.usp-chart{height:215px;gap:8px}.usp-chart-head{flex-direction:row;flex-wrap:wrap}.usp-bar-tip{font-size:9px}.usp-chart-detail{padding:11px;gap:10px}.usp-chart-detail strong{font-size:13px}.usp-chart-detail .usp-caption{font-size:11px}.usp-search{padding:0 10px}.usp-search input{font-size:14px}.usp-select{max-width:110px;padding:0 8px;font-size:12px!important}.usp-tools{gap:7px}.usp-record{grid-template-columns:minmax(0,1fr) auto 32px;gap:9px;padding:17px 0}.usp-record-icon{display:none}.usp-record-title{font-size:14px}.usp-record-meta{font-size:11px}.usp-record-score{font-size:20px}.usp-icon-btn{width:32px;min-height:40px}.usp-btn{font-size:12px!important;padding:9px 12px}.usp-training-hero{grid-template-columns:1fr;padding:22px;gap:20px}.usp-training-copy h3{font-size:26px}.usp-training-ring .usp-ring{width:180px;height:180px}.usp-dots{grid-template-columns:repeat(12,minmax(0,1fr));gap:6px}.usp-lb-row{grid-template-columns:23px 35px minmax(0,1fr) auto;gap:9px;padding:15px 4px}.usp-avatar{width:35px;height:38px;font-size:12px;border-radius:12px}.usp-lb-name{font-size:14px}.usp-lb-value{font-size:21px}.usp-lb-value small{font-size:10px;max-width:76px}.usp-caption{font-size:12px}.usp-section-head{gap:10px}.usp-pagination{gap:8px}.usp-rank{font-size:13px}}
@media(prefers-reduced-motion:reduce){.usp *,.usp *:before,.usp *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

/* Единая фиксированная область построения; не зависит от глобальной высоты кнопок. */
.usp .usp-chart{--up-plot-height:190px;height:239px;min-height:239px;align-items:flex-start;padding:20px 0 0;}
.usp .usp-scale{position:relative;height:var(--up-plot-height);padding:0;display:block;}
.usp .usp-scale>span{position:absolute;left:0;line-height:1;transform:translateY(-50%);}
.usp .usp-scale>span:nth-child(1){top:0%}.usp .usp-scale>span:nth-child(2){top:25%}.usp .usp-scale>span:nth-child(3){top:50%}.usp .usp-scale>span:nth-child(4){top:75%}.usp .usp-scale>span:nth-child(5){top:100%}
.usp .usp-bars{position:relative;height:calc(var(--up-plot-height) + 29px);background:none;}
.usp .usp-bars:before{content:"";position:absolute;top:0;left:0;right:0;height:var(--up-plot-height);pointer-events:none;border-bottom:1px solid var(--up-line);background:linear-gradient(to bottom,var(--up-line) 1px,transparent 1px);background-size:100% 25%;}
.usp button.usp-bar-col{appearance:none;position:relative;display:block!important;height:calc(var(--up-plot-height) + 29px)!important;min-height:0!important;max-height:none!important;align-self:flex-start;padding:0!important;line-height:normal;overflow:visible;box-shadow:none;transform:none;}
.usp .usp-bar-track{display:block;position:relative;flex:none;height:var(--up-plot-height);width:100%;}
.usp .usp-bar{display:block;position:absolute;bottom:0;left:0;width:100%;min-height:0;}
.usp .usp-bar-label{display:block;height:29px;padding-top:7px;}
.usp .usp-bar.zero{box-shadow:none!important;animation:none;}
.usp .usp-bar.zero:after{content:"";position:absolute;bottom:0;left:0;right:0;border-top:2px solid var(--up-accent);}

/* ================================================================
   АНИМАЦИИ v4
   ================================================================ */

/* 1. Оболочка: «северное сияние» из двух дрейфующих световых пятен */
.usp .usp-shell{position:relative;overflow:hidden}
.usp .usp-shell>*{position:relative;z-index:1}
.usp .usp-shell:before,.usp .usp-shell:after{content:"";position:absolute;z-index:0;border-radius:50%;filter:blur(70px);pointer-events:none;opacity:.55}
.usp .usp-shell:before{width:340px;height:340px;top:-130px;right:-90px;background:#8a5ce766;animation:usp-drift-a 14s ease-in-out infinite alternate}
.usp .usp-shell:after{width:300px;height:300px;bottom:-130px;left:-100px;background:#3fd5b333;animation:usp-drift-b 18s ease-in-out infinite alternate}
.usp.theme-light .usp-shell:before,.usp.theme-light .usp-shell:after{opacity:.3}

/* 2. Заголовок: последовательное появление, переливающийся градиент, плавающий значок */
.usp .usp-enter{animation:usp-in .5s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-eyebrow{animation:usp-in .6s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-eyebrow svg{animation:usp-twinkle 2.6s ease-in-out infinite}
.usp .usp-heading h2{animation:usp-in .7s .08s cubic-bezier(.2,.75,.25,1) backwards,usp-title 7s ease-in-out .9s infinite;background:linear-gradient(100deg,var(--up-text) 35%,var(--up-accent) 50%,var(--up-text) 65%) 100% 0/260% 100% no-repeat;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.usp .usp-subtitle{animation:usp-in .7s .18s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-heading .usp-mark{position:relative;animation:usp-float 5.5s ease-in-out infinite}
.usp .usp-heading .usp-mark:after{content:"";position:absolute;inset:-1px;border-radius:inherit;border:1px solid var(--up-accent);pointer-events:none;animation:usp-pulse-ring 2.8s ease-out infinite}
.usp .usp-empty .usp-mark{animation:usp-bob 3.2s ease-in-out infinite}

/* 3. Вкладки: скользящая «пилюля» с блеском, подпрыгивающие иконки */
.usp .usp-tabs{position:relative}
.usp .usp-tab-pill{position:absolute;top:6px;left:0;height:calc(100% - 12px);border-radius:13px;overflow:hidden;background:linear-gradient(130deg,#8a5ce7,#6d4ad1);border:1px solid #ac89ef70;box-shadow:0 6px 18px #6336b640;pointer-events:none;z-index:0;transition:transform .5s cubic-bezier(.34,1.35,.64,1),width .5s cubic-bezier(.34,1.35,.64,1)}
.usp .usp-tab-pill:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,#ffffff33,transparent);transform:skewX(-20deg);animation:usp-shine 3.8s ease-in-out 1s infinite}
.usp .usp-tab{position:relative;z-index:1;overflow:hidden}
.usp .usp-tabs[data-pill] .usp-tab[aria-selected=true]{background:transparent;border-color:transparent;box-shadow:none;animation:none}
.usp .usp-tab[aria-selected=true] svg{animation:usp-pop .55s cubic-bezier(.2,.75,.25,1)}
.usp .usp-tab:not([aria-selected=true]):hover svg{animation:usp-wiggle .5s}

/* 4. Карточки и метрики: подсветка, следующая за курсором, блик, виляющие иконки */
.usp .usp-card,.usp .usp-metric{position:relative;isolation:isolate}
.usp .usp-card:before,.usp .usp-metric:before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;pointer-events:none;opacity:0;transition:opacity .35s;background:radial-gradient(340px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--up-accent) 16%,transparent),transparent 70%)}
.usp .usp-card:hover:before,.usp .usp-metric:hover:before{opacity:1}
.usp .usp-metric{overflow:hidden;animation:usp-in .55s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-metric:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,#ffffff1f,transparent);transform:skewX(-20deg);pointer-events:none}
.usp .usp-metric:hover:after{animation:usp-shine .9s ease}
.usp .usp-metric:hover .usp-metric-label svg{animation:usp-wiggle .6s}
.usp .usp-metric-value{animation:usp-pop-in .7s .15s cubic-bezier(.2,.75,.25,1) backwards}

/* 5. График: рост столбцов с пружинкой, глянец, подпись, ореол выбранного столбца */
.usp .usp-bar{animation:usp-rise .95s cubic-bezier(.34,1.3,.64,1) both;transition:transform .25s,filter .2s}
.usp .usp-bar:after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,#ffffff4d,transparent 45%);pointer-events:none}
.usp .usp-bar.zero:after{background:none}
.usp .usp-bar-tip{animation:usp-tip .45s .75s ease backwards}
.usp .usp-bar-col:hover .usp-bar{transform:scaleX(1.12)}
.usp .usp-bar-col[aria-pressed=true] .usp-bar-track:before{content:"";position:absolute;left:-20%;width:140%;bottom:0;height:100%;pointer-events:none;background:radial-gradient(ellipse at 50% 100%,color-mix(in srgb,var(--up-accent) 28%,transparent),transparent 70%);animation:usp-breathe 2.2s ease-in-out infinite}
.usp .usp-bar-label{transition:color .25s}
.usp .usp-bar-col[aria-pressed=true] .usp-bar-label{color:var(--up-accent);font-weight:750}
.usp .usp-chart-detail>div{animation:usp-in .4s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-chart-detail>b{animation:usp-pop-in .5s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-chip[aria-pressed=true],.usp .usp-segment button[aria-pressed=true]{animation:usp-pop-soft .35s cubic-bezier(.2,.75,.25,1)}

/* 6. Кольцо: градиентная дуга, дышащее свечение, вращающаяся орбита */
.usp .usp-ring{isolation:isolate}
.usp .usp-ring:before{content:"";position:absolute;inset:16px;border-radius:50%;z-index:-1;background:radial-gradient(circle,color-mix(in srgb,var(--up-accent) 24%,transparent),transparent 68%);animation:usp-breathe 3.6s ease-in-out infinite}
.usp .usp-ring-fill{transition:stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1) .15s}
.usp .usp-ring-orbit{fill:none;stroke:var(--up-accent);stroke-opacity:.38;stroke-width:2;stroke-linecap:round;stroke-dasharray:1 11;transform-origin:center;animation:usp-spin 40s linear infinite}
.usp .usp-ring-center strong{animation:usp-pop-in .8s .3s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-training-ring .usp-ring{animation:usp-bob 6s ease-in-out infinite}

/* 7. История: поочерёдный выезд строк, сдвиг по наведению, подпрыгивающая оценка */
.usp .usp-record{animation:usp-slide .5s cubic-bezier(.2,.75,.25,1) backwards;animation-delay:calc(var(--i,0)*45ms);transition:transform .25s,background .25s}
.usp .usp-record:hover{transform:translateX(5px)}
.usp .usp-record-icon{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.usp .usp-record:hover .usp-record-icon{transform:rotate(-10deg) scale(1.12)}
.usp .usp-record-score{animation:usp-pop-in .55s cubic-bezier(.2,.75,.25,1) backwards;animation-delay:calc(var(--i,0)*45ms + 150ms)}
.usp .usp-confirm{animation:usp-in .35s cubic-bezier(.2,.75,.25,1) backwards}
.usp .usp-error{animation:usp-shake .45s}
.usp .usp-notice{animation:usp-notice 3s ease forwards}

/* 8. Кнопки: волна при нажатии, движение иконок */
.usp .usp-btn,.usp .usp-chip,.usp .usp-segment button{position:relative;overflow:hidden}
.usp .usp-ripple{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:currentColor;opacity:.28;pointer-events:none;animation:usp-ripple .65s ease-out forwards}
.usp .usp-btn:hover:not(:disabled) svg{animation:usp-nudge .6s ease}
.usp .usp-icon-btn:hover:not(:disabled) svg{animation:usp-spin-once .6s ease}
.usp .usp-icon-btn.danger:hover:not(:disabled) svg{animation:usp-wiggle .5s}
.usp .usp-icon-btn[data-loading=true] svg{animation:usp-spin 1s linear infinite}

/* 9. Рейтинг: каскад строк, медали, пульс собственной строки */
.usp .usp-lb-row{animation:usp-lb-in .55s cubic-bezier(.2,.75,.25,1) backwards;animation-delay:calc(var(--i,0)*45ms);transition:background .2s,transform .25s}
.usp .usp-lb-row:hover{transform:translateX(4px)}
.usp .usp-lb-row.me{animation:usp-lb-in .55s cubic-bezier(.2,.75,.25,1) backwards,usp-me 2.6s ease-in-out 1s infinite;animation-delay:calc(var(--i,0)*45ms)}
.usp .usp-avatar{animation:usp-pop-in .5s cubic-bezier(.2,.75,.25,1) backwards;animation-delay:calc(var(--i,0)*45ms + 120ms);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.usp .usp-lb-row:hover .usp-avatar{transform:rotate(-8deg) scale(1.1)}
.usp .usp-rank.top.r1{background:linear-gradient(135deg,#ffd76a,#f0a93a);color:#4a3000;animation:usp-glow-gold 2.4s ease-in-out infinite}
.usp .usp-rank.top.r2{background:linear-gradient(135deg,#e6ebf5,#aab4c8);color:#2c3446}
.usp .usp-rank.top.r3{background:linear-gradient(135deg,#e8ac7e,#b9733f);color:#3b1f08}

/* 10. Тренировки: волна точек, пульс последней, мерцание подсказки */
.usp .usp-dot{animation:usp-dot-in .55s cubic-bezier(.2,.75,.25,1) backwards;transition:transform .2s}
.usp .usp-dot:not(.off):hover{transform:scale(1.3) rotate(8deg)}
.usp .usp-dot.last{animation:usp-dot-in .55s cubic-bezier(.2,.75,.25,1) backwards,usp-dot-pulse 1.9s ease-out infinite}
.usp .usp-hint svg{animation:usp-twinkle 2.8s ease-in-out infinite}
.usp .usp-training-hero{overflow:hidden}
.usp .usp-training-hero:after{content:"";position:absolute;z-index:-1;width:230px;height:230px;right:-60px;top:-80px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#9b7aff40,transparent 70%);animation:usp-drift-a 9s ease-in-out infinite alternate}

/* Ключевые кадры */
@keyframes usp-in{from{opacity:0;transform:translateY(14px) scale(.985);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@keyframes usp-rise{from{height:0}}
@keyframes usp-tip{from{opacity:0;transform:translate(-50%,6px)}}
@keyframes usp-breathe{0%,100%{opacity:.55;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}}
@keyframes usp-drift-a{from{transform:translate(0,0) scale(1)}to{transform:translate(-60px,50px) scale(1.2)}}
@keyframes usp-drift-b{from{transform:translate(0,0) scale(1)}to{transform:translate(70px,-40px) scale(1.15)}}
@keyframes usp-title{0%,100%{background-position:100% 0}50%{background-position:0 0}}
@keyframes usp-twinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.35) rotate(90deg)}}
@keyframes usp-float{0%,100%{transform:rotate(-8deg) translateY(0)}50%{transform:rotate(-3deg) translateY(-8px)}}
@keyframes usp-pulse-ring{from{opacity:.7;transform:scale(1)}to{opacity:0;transform:scale(1.55)}}
@keyframes usp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes usp-pop{0%{transform:scale(.5) rotate(-25deg)}60%{transform:scale(1.25) rotate(8deg)}100%{transform:none}}
@keyframes usp-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}75%{transform:rotate(14deg)}}
@keyframes usp-shine{0%{left:-60%}60%,100%{left:140%}}
@keyframes usp-slide{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:none}}
@keyframes usp-lb-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes usp-pop-in{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
@keyframes usp-pop-soft{0%{transform:scale(.88)}60%{transform:scale(1.07)}100%{transform:scale(1)}}
@keyframes usp-notice{0%{opacity:0;transform:translateY(-10px) scale(.96)}10%{opacity:1;transform:none}88%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-6px)}}
@keyframes usp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes usp-spin{to{transform:rotate(360deg)}}
@keyframes usp-spin-once{to{transform:rotate(360deg)}}
@keyframes usp-nudge{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
@keyframes usp-ripple{to{transform:scale(28);opacity:0}}
@keyframes usp-dot-in{from{opacity:0;transform:scale(0) rotate(-90deg)}60%{opacity:1;transform:scale(1.25) rotate(8deg)}to{opacity:1;transform:none}}
@keyframes usp-dot-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--up-accent) 60%,transparent)}70%,100%{box-shadow:0 0 0 7px transparent}}
@keyframes usp-me{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 18px 2px color-mix(in srgb,var(--up-accent) 28%,transparent)}}
@keyframes usp-glow-gold{0%,100%{box-shadow:0 0 0 0 #ffd76a00}50%{box-shadow:0 0 16px 2px #ffd76a88}}
`;
  function useStyles() {
    useEffect(() => {
      let node = document.getElementById('ultimate-progress-v3-styles');
      if (!node) {
        node = document.createElement('style');
        node.id = 'ultimate-progress-v3-styles';
        document.head.appendChild(node);
      }
      if (node.textContent !== CSS) node.textContent = CSS;
    }, []);
  }
  // Волна при нажатии на кнопки (делегирование с корня компонента).
  function spawnRipple(e) {
    if (e.button > 0 || reducedMotion()) return;
    const btn = e.target.closest?.('.usp-btn,.usp-chip,.usp-tab,.usp-segment button');
    if (!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'usp-ripple';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.left = e.clientX - rect.left + 'px';
    dot.style.top = e.clientY - rect.top + 'px';
    btn.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  }
  // Подсветка карточек, следующая за курсором.
  function trackSpotlight(e) {
    const el = e.target.closest?.('.usp-metric,.usp-card');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - rect.left + 'px');
    el.style.setProperty('--my', e.clientY - rect.top + 'px');
  }
  function Empty({
    title,
    text,
    icon = 'spark',
    children
  }) {
    return <div className="usp-empty"><div className="usp-mark"><Icon name={icon} size={25} /></div><h3>{title}</h3><p>{text}</p>{children}</div>;
  }
  function normalizeHistory(value) {
    return list(value).filter(x => x && typeof x === 'object').map((raw, index) => ({
      raw,
      index,
      value: score(raw.percent)
    }));
  }
  function testSummary(value) {
    const valid = normalizeHistory(value).filter(x => x.value !== null);
    return {
      total: valid.length,
      average: valid.length ? Math.round(valid.reduce((sum, x) => sum + x.value, 0) / valid.length) : 0,
      best: valid.length ? Math.max(...valid.map(x => x.value)) : 0,
      passed: valid.filter(x => x.value >= 50).length
    };
  }
  function useUserId() {
    const [uid, setUid] = useState(() => window.auth?.currentUser?.uid || null);
    useEffect(() => {
      const auth = window.auth;
      if (typeof auth?.onAuthStateChanged === 'function') return auth.onAuthStateChanged(user => setUid(user?.uid || null));
    }, []);
    return uid;
  }
  function AnimatedNumber({
    value
  }) {
    const [display, setDisplay] = useState(0);
    const previous = useRef(0);
    useEffect(() => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        previous.current = value;
        setDisplay(value);
        return;
      }
      const from = previous.current;
      previous.current = value;
      let frame;
      const start = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - start) / 460);
        setDisplay(Math.round((from + (value - from) * (1 - Math.pow(1 - t, 3))) * 10) / 10);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [value]);
    return <span aria-label={fmt(value)}><span aria-hidden="true">{fmt(display)}</span></span>;
  }
  function Metrics({
    items
  }) {
    return <div className="usp-metrics">{items.map(({
        label,
        value,
        unit,
        note,
        icon
      }, i) => <div className="usp-metric" key={label} style={{
        animationDelay: `${i * 65}ms`
      }}><div className="usp-metric-label"><Icon name={icon || 'spark'} size={14} />{label}</div><strong className={`usp-metric-value ${i === 0 ? 'usp-accent' : ''}`}><AnimatedNumber value={value} />{unit && <small>{unit}</small>}</strong><span className="usp-metric-note">{note}</span></div>)}</div>;
  }
  function Tabs({
    value,
    onChange,
    tabs,
    label,
    id
  }) {
    const wrap = useRef(null);
    const [pill, setPill] = useState(null);
    // Скользящая «пилюля» следует за выбранной вкладкой.
    const measure = () => {
      const el = wrap.current?.querySelector('[role="tab"][aria-selected="true"]');
      if (!el) return;
      const x = el.offsetLeft,
        w = el.offsetWidth;
      setPill(prev => prev && prev.x === x && prev.w === w ? prev : {
        x,
        w
      });
    };
    useLayoutEffect(measure, [value, tabs.length]);
    useEffect(() => {
      window.addEventListener('resize', measure);
      const observer = typeof ResizeObserver === 'function' && wrap.current ? new ResizeObserver(measure) : null;
      if (observer) observer.observe(wrap.current);
      return () => {
        window.removeEventListener('resize', measure);
        if (observer) observer.disconnect();
      };
    }, []);
    return <div ref={wrap} className="usp-tabs" role="tablist" aria-label={label} data-pill={pill ? '' : undefined}>{pill && <span className="usp-tab-pill" aria-hidden="true" style={{
        width: pill.w,
        transform: `translateX(${pill.x}px)`
      }} />}{tabs.map((tab, index) => <button type="button" key={tab.id} id={`${id}-${tab.id}`} role="tab" aria-selected={value === tab.id} aria-controls={`${id}-panel-${tab.id}`} tabIndex={value === tab.id ? 0 : -1} className="usp-tab" onClick={() => onChange(tab.id)} onKeyDown={e => {
        let next = index;
        if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;else if (e.key === 'Home') next = 0;else if (e.key === 'End') next = tabs.length - 1;else return;
        e.preventDefault();
        onChange(tabs[next].id);
        document.getElementById(`${id}-${tabs[next].id}`)?.focus();
      }}>{tab.icon && <Icon name={tab.icon} />}<span>{tab.label}</span></button>)}</div>;
  }
  function stamp(row) {
    const d = row?.date;
    if (typeof d?.toMillis === 'function') return d.toMillis();
    if (d && Number.isFinite(d.seconds)) return d.seconds * 1000;
    if (typeof d === 'number' && Number.isFinite(d)) return d;
    if (typeof d === 'string') {
      const ru = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
      if (ru) return new Date(+ru[3], +ru[2] - 1, +ru[1], +(ru[4] || 0), +(ru[5] || 0), +(ru[6] || 0)).getTime();
      if (/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(d)) {
        const t = Date.parse(d);
        if (Number.isFinite(t)) return t;
      }
    }
    const id = Number(row?.id);
    return id > 1e12 && id < 1e14 ? id : null;
  }
  function dateLabel(raw) {
    if (typeof raw.date === 'string') return raw.date;
    const time = stamp(raw);
    return time !== null && Number.isFinite(time) ? new Date(time).toLocaleDateString('ru-RU') : 'Дата не указана';
  }
  // Точный снимок записи: при параллельном изменении не удаляем чужую/новую версию.
  function fingerprint(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (value instanceof Date) return JSON.stringify(value.toISOString());
    if (Array.isArray(value)) return '[' + value.map(fingerprint).join(',') + ']';
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + fingerprint(value[key])).join(',') + '}';
  }
  function removeExact(history, target) {
    const signature = fingerprint(target);
    const matches = list(history).map((x, i) => fingerprint(x) === signature ? i : -1).filter(i => i >= 0);
    if (matches.length > 1) throw new Error('Есть одинаковые записи. Обновите историю перед удалением.');
    if (!matches.length) throw new Error('Запись уже изменена или удалена. Обновите страницу.');
    return history.filter((_, i) => i !== matches[0]);
  }
  function HistoryList({
    rows,
    onRemove,
    canRemove
  }) {
    const historyId = useId();
    const [filter, setFilter] = useState('all');
    const [exportError, setExportError] = useState('');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('recent');
    const [page, setPage] = useState(0);
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    useEffect(() => {
      if (!notice) return;
      const timer = setTimeout(() => setNotice(''), 3000);
      return () => clearTimeout(timer);
    }, [notice]);
    const lock = useRef(false);
    const cancelRef = useRef(null);
    const opener = useRef(null);
    const alive = useRef(true);
    useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
      };
    }, []);
    useEffect(() => {
      if (target) cancelRef.current?.focus();
    }, [target]);
    const found = useMemo(() => {
      const q = query.trim().toLocaleLowerCase('ru');
      return rows.filter(x => filter === 'all' || x.value !== null && (filter === 'passed' ? x.value >= 50 : x.value < 50)).filter(x => `${str(x.raw.topic)} ${str(x.raw.student)} ${dateLabel(x.raw)}`.toLocaleLowerCase('ru').includes(q)).slice().sort((a, b) => sort === 'best' ? (b.value ?? -1) - (a.value ?? -1) || a.index - b.index : (stamp(b.raw) ?? -1) - (stamp(a.raw) ?? -1) || a.index - b.index);
    }, [rows, query, sort, filter]);
    const pages = Math.max(1, Math.ceil(found.length / 8));
    const current = Math.min(page, pages - 1);
    const visible = found.slice(current * 8, current * 8 + 8);
    function close() {
      setTarget(null);
      setError('');
      opener.current?.focus();
    }
    async function confirmDelete() {
      if (lock.current || !target) return;
      lock.current = true;
      setBusy(true);
      setError('');
      try {
        await onRemove(target.raw);
        if (alive.current) {
          setTarget(null);
          setNotice('Запись удалена');
          requestAnimationFrame(() => document.getElementById(historyId)?.focus());
        }
      } catch (e) {
        if (alive.current) setError(e.message || 'Не удалось удалить запись. Попробуйте ещё раз.');
      } finally {
        lock.current = false;
        if (alive.current) setBusy(false);
      }
    }
    return <div className="usp-card"><div className="usp-section-head"><div><h3 id={historyId} tabIndex={-1}>История попыток</h3><p className="usp-caption">{found.length} из {rows.length} записей</p></div><button type="button" className="usp-btn" disabled={!rows.length} onClick={() => {
          try {
            downloadHistory(rows);
            setExportError('');
          } catch {
            setExportError('Не удалось скачать историю. Попробуй ещё раз.');
          }
        }}><Icon name="download" size={17} />Excel</button></div>{rows.length > 0 && <div className="usp-tools"><label className="usp-search"><Icon name="search" size={16} /><input aria-label="Поиск в истории" placeholder="Найти тему или имя…" value={query} onChange={e => {
            setQuery(e.target.value);
            setPage(0);
          }} /></label><select className="usp-select" aria-label="Порядок истории" value={sort} onChange={e => {
          setSort(e.target.value);
          setPage(0);
        }}><option value="recent">По дате</option><option value="best">По баллу</option></select></div>}{rows.length > 0 && <div className="usp-filters" role="group" aria-label="Фильтр истории">{[['all', 'Все'], ['passed', 'От 50%'], ['retry', 'Ниже 50%']].map(([value, label]) => <button type="button" className="usp-chip" key={value} aria-pressed={filter === value} onClick={() => {
          setFilter(value);
          setPage(0);
        }}>{label}</button>)}</div>}{exportError && <p className="usp-error" role="alert">{exportError}</p>}{notice && <div className="usp-notice" role="status">{notice}</div>}{target && <div className="usp-confirm" role="group" aria-label="Подтверждение удаления" onKeyDown={e => {
        if (e.key === 'Escape' && !busy) close();
      }}><div className="usp-confirm-text"><strong>Удалить результат?</strong><div className="usp-caption">{str(target.raw.topic) || 'Тест'} · отменить удаление нельзя.</div></div><div className="usp-confirm-actions"><button ref={cancelRef} type="button" className="usp-btn" disabled={busy} onClick={close}>Отмена</button><button type="button" className="usp-btn danger" disabled={busy} onClick={confirmDelete}>{busy ? 'Удаление…' : 'Удалить'}</button></div>{error && <p className="usp-error" role="alert">{error}</p>}</div>}{visible.length ? visible.map((x, i) => <div className="usp-record" key={x.index} style={{
        '--i': i
      }}><span className="usp-record-icon"><Icon name="tests" size={17} /></span><div><div className="usp-record-title">{str(x.raw.topic) || 'Тест без названия'}</div><div className="usp-record-meta">{dateLabel(x.raw)}{x.raw.student ? ` · ${str(x.raw.student)}` : ''}</div></div><span className={`usp-record-score ${x.value === null ? '' : x.value >= 50 ? 'positive' : 'negative'}`}>{x.value === null ? '—' : fmt(x.value)}{x.value !== null && <small>%</small>}</span>{canRemove ? <button type="button" className="usp-icon-btn danger" title="Удалить результат" aria-label={`Удалить результат: ${str(x.raw.topic) || 'Тест'}`} disabled={busy} onClick={e => {
          opener.current = e.currentTarget;
          setTarget(x);
          setError('');
          setNotice('');
        }}><Icon name="trash" size={15} /></button> : <span />}</div>) : <Empty title={query || filter !== 'all' ? 'Ничего не найдено' : 'Пока нет попыток'} text={query || filter !== 'all' ? 'Измени поиск или фильтр результатов.' : 'Результаты пройденных тестов появятся здесь.'} icon="tests" />}{pages > 1 && <div className="usp-pagination"><span className="usp-caption">{current + 1} / {pages}</span><div><button type="button" className="usp-btn" disabled={current === 0} onClick={() => setPage(current - 1)}>Назад</button><button type="button" className="usp-btn" disabled={current === pages - 1} onClick={() => setPage(current + 1)}>Далее</button></div></div>}</div>;
  }
  function boardMetric(user, type) {
    return type === 'tests' ? testSummary(user.testHistory).average : type === 'excel' ? num(user.excelProgress?.xp) : type === 'typing' ? num(user.typingProgress?.maxWpm) : num(user.hotkeyProgress?.totalScore);
  }
  function userName(user) {
    return str(user.nickname || user.displayName) || str(user.email).split('@')[0] || 'Ученик';
  }
  function initials(user) {
    return userName(user).split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }
  function hue(id) {
    return Array.from(str(id)).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);
  }
  function Leaderboard({
    uid
  }) {
    const [category, setCategory] = useState('excel');
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const id = useId();
    useEffect(() => {
      let active = true;
      setStatus('loading');
      setError('');
      Promise.resolve().then(() => {
        if (!window.db?.collection) throw new Error('База данных пока не подключена.');
        return window.db.collection('users').get();
      }).then(snap => {
        if (active) {
          setUsers(snap.docs.map(d => ({
            ...d.data(),
            id: d.id
          })));
          setStatus('ready');
        }
      }).catch(e => {
        if (!active) return;
        setUsers([]);
        setStatus('error');
        setError(String(e.code || '').includes('permission-denied') ? 'Рейтинг недоступен для этого аккаунта. Доступ определяется настройками платформы.' : 'Не удалось загрузить рейтинг. Проверь подключение и попробуй ещё раз.');
      });
      return () => {
        active = false;
      };
    }, [uid, retry]);
    const ranked = useMemo(() => {
      const sorted = users.map(u => ({
        user: u,
        value: boardMetric(u, category)
      })).filter(x => category === 'tests' ? testSummary(x.user.testHistory).total > 0 : x.value > 0).sort((a, b) => b.value - a.value || str(a.user.id).localeCompare(str(b.user.id)));
      let rank = 0;
      return sorted.map((x, i) => {
        if (i === 0 || x.value !== sorted[i - 1].value) rank = i + 1;
        return {
          ...x,
          rank
        };
      });
    }, [users, category]);
    const mine = ranked.findIndex(x => x.user.id === uid);
    const unit = {
      excel: 'XP',
      typing: 'WPM',
      hotkeys: 'очков',
      tests: '% · средний балл'
    }[category];
    const renderRow = ({
      user,
      value,
      rank
    }, position = 0) => <div className={`usp-lb-row ${user.id === uid ? 'me' : ''}`} key={user.id} style={{
      '--i': Math.min(position, 14)
    }}><span className={`usp-rank ${rank <= 3 ? `top r${rank}` : ''}`}>{rank <= 3 ? <span title={`${rank} место`}>{rank}</span> : rank}</span><span className="usp-avatar" style={{
        '--hue': hue(user.id)
      }}>{initials(user)}</span><div><div className="usp-lb-name">{userName(user)}{user.id === uid && <span className="usp-badge">ВЫ</span>}</div><div className="usp-caption">{user.role === 'admin' ? 'Преподаватель' : 'Ученик'}</div></div><div className="usp-lb-value"><AnimatedNumber value={value} /><small>{unit}</small></div></div>;
    return <div className="usp-card" style={{
      marginTop: 0
    }}><div className="usp-section-head"><div><h3>Вместе двигаться интереснее</h3><p className="usp-caption">Топ-50 · одинаковый результат — одинаковое место</p></div></div><div className="usp-lb-top"><Tabs value={category} onChange={setCategory} tabs={TABS.slice(0, 4).map(({
          id,
          label
        }) => ({
          id,
          label
        }))} label="Категория рейтинга" id={id} /><button type="button" className="usp-icon-btn" title="Обновить рейтинг" aria-label="Обновить рейтинг" data-loading={status === 'loading'} disabled={status === 'loading'} onClick={() => setRetry(x => x + 1)}><Icon name="refresh" size={17} /></button></div><div role="tabpanel" id={`${id}-panel-${category}`} aria-labelledby={`${id}-${category}`} aria-busy={status === 'loading'}>{status === 'loading' ? <div role="status" aria-label="Загрузка рейтинга">{[0, 1, 2, 3].map(i => <div className="usp-skeleton" key={i} />)}</div> : status === 'error' ? <div role="alert"><Empty title="Рейтинг пока недоступен" text={error} icon="cup"><button type="button" className="usp-btn" onClick={() => setRetry(x => x + 1)}><Icon name="refresh" size={15} />Повторить</button></Empty></div> : ranked.length ? <div className="usp-enter" key={category}>{ranked.slice(0, 50).map((item, position) => renderRow(item, position))}{mine >= 50 && <><p className="usp-caption" style={{
              margin: '20px 0 8px'
            }}>Твоё место</p>{renderRow(ranked[mine], 0)}</>}</div> : <Empty title="Первое место ещё свободно" text="В этой категории пока нет сохранённых результатов." icon="cup" />}</div></div>;
  }
  function Ring({
    value,
    max = 100,
    label,
    display,
    unit = ''
  }) {
    const ratio = Math.max(0, Math.min(1, num(value) / Math.max(1, max)));
    const [visible, setVisible] = useState(false);
    const gradientId = 'usp-grad-' + String(useId()).replace(/[^a-zA-Z0-9_-]/g, '');
    useEffect(() => {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }, []);
    const circumference = 2 * Math.PI * 76;
    return <div className="usp-ring" role="img" aria-label={`${label}: ${fmt(display ?? value)} ${unit}`}><svg viewBox="0 0 180 180" aria-hidden="true"><defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" style={{
            stopColor: 'var(--up-accent)'
          }} /><stop offset="100%" style={{
            stopColor: 'var(--up-green)'
          }} /></linearGradient></defs><circle className="usp-ring-orbit" cx="90" cy="90" r="87" /><circle className="usp-ring-track" cx="90" cy="90" r="76" /><circle className="usp-ring-fill" cx="90" cy="90" r="76" style={{
          stroke: `url(#${gradientId})`
        }} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - (visible ? ratio : 0))} /></svg><div className="usp-ring-center" aria-hidden="true"><strong><AnimatedNumber value={display ?? value} />{unit === '%' ? '%' : ''}</strong><small>{unit === '%' ? 'от всех попыток' : unit || label}</small></div></div>;
  }
  function BestChart({
    rows
  }) {
    const [mode, setMode] = useState('recent');
    const [selected, setSelected] = useState(null);
    const points = useMemo(() => {
      const valid = rows.filter(x => x.value !== null);
      if (mode === 'best') return valid.slice().sort((a, b) => b.value - a.value || a.index - b.index).slice(0, 10);
      return valid.filter(x => stamp(x.raw) !== null).sort((a, b) => stamp(b.raw) - stamp(a.raw) || a.index - b.index).slice(0, 10).reverse();
    }, [rows, mode]);
    const current = points.find(x => x.index === selected) || points[points.length - 1];
    return <div className="usp-card"><div className="usp-section-head usp-chart-head"><div><h3>Результаты тестов</h3><p className="usp-caption">{mode === 'recent' ? 'Последние 10 · по дате' : 'Лучшие 10 · по баллу'}</p></div><div className="usp-segment" role="group" aria-label="Режим графика">{[['recent', 'Последние'], ['best', 'Лучшие']].map(([id, label]) => <button type="button" aria-pressed={mode === id} key={id} onClick={() => {
            setMode(id);
            setSelected(null);
          }}>{label}</button>)}</div></div>{points.length ? <><div className="usp-chart"><div className="usp-scale" aria-hidden="true"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="usp-bars" key={mode} role="group" aria-label="Выбрать результат на графике">{points.map((x, i) => <button type="button" className="usp-bar-col" key={x.index} aria-label={`${i + 1}. ${str(x.raw.topic) || 'Тест'}: ${fmt(x.value)}%, ${dateLabel(x.raw)}`} aria-pressed={current?.index === x.index} onClick={() => setSelected(x.index)} onFocus={() => setSelected(x.index)}><span className="usp-bar-track" aria-hidden="true"><span className={`usp-bar ${x.value === 0 ? 'zero' : ''}`} style={{
                  height: `${x.value}%`,
                  animationDelay: `${i * 55}ms`
                }}><span className="usp-bar-tip">{fmt(x.value)}</span></span></span><span className="usp-bar-label" aria-hidden="true">{i + 1}</span></button>)}</div></div><div className="usp-chart-detail" aria-live="polite" aria-atomic="true"><div key={`t${current.index}`}><strong>{str(current.raw.topic) || 'Тест без названия'}</strong><span className="usp-caption">{dateLabel(current.raw)}</span></div><b key={`v${current.index}`}>{fmt(current.value)}%</b></div></> : <Empty title={rows.length ? 'Нет результатов для графика' : 'Твой первый результат впереди'} text={mode === 'recent' && rows.length ? 'Для этого режима нужны результаты с датой. Посмотри вкладку «Лучшие».' : 'После прохождения теста здесь появится график.'} icon="tests" />}</div>;
  }
  // Минимальный OOXML-экспорт: настоящий XLSX, без CDN и дополнительных скриптов.
  function historyWorkbook(rows) {
    const xml = v => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const textCell=(ref,value,style=0)=>`<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(String(value??'').slice(0,32767))}</t></is></c>`;
    const numberCell=(ref,value,style=0)=>`<c r="${ref}" s="${style}"><v>${value}</v></c>`;
    const headings=['№','Тема теста','Ученик','Дата','Результат','Оценка результата'];
    const lines=[`<row r="1" ht="28" customHeight="1">${headings.map((v,i)=>textCell(String.fromCharCode(65+i)+'1',v,1)).join('')}</row>`];
    rows.forEach((x,i)=>{
      const n=i+2, raw=x.raw;
      lines.push(`<row r="${n}" ht="32" customHeight="1">${numberCell('A'+n,i+1)}${textCell('B'+n,str(raw.topic))}${textCell('C'+n,str(raw.student))}${textCell('D'+n,dateLabel(raw))}${x.value===null?textCell('E'+n,'Нет данных'):numberCell('E'+n,x.value/100,2)}${textCell('F'+n,x.value===null?'Нет данных':x.value>=50?'От 50%':'Ниже 50%')}</row>`);
    });
    const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const files={
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Результаты тестов" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':`<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF7048D1"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
      'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="${ns}"><dimension ref="A1:F${rows.length+1}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="7" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="3" width="26" customWidth="1"/><col min="4" max="4" width="24" customWidth="1"/><col min="5" max="5" width="16" customWidth="1"/><col min="6" max="6" width="24" customWidth="1"/></cols><sheetData>${lines.join('')}</sheetData><autoFilter ref="A1:F${rows.length+1}"/></worksheet>`
    };
    const encoder=new TextEncoder(), chunks=[], directory=[];let offset=0;
    const crc32=bytes=>{let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
    for(const [name,content] of Object.entries(files)){
      const filename=encoder.encode(name),data=encoder.encode(content),crc=crc32(data);
      const local=new Uint8Array(30+filename.length),lv=new DataView(local.buffer);
      lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(12,33,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,filename.length,true);local.set(filename,30);
      const central=new Uint8Array(46+filename.length),cv=new DataView(central.buffer);
      cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,filename.length,true);cv.setUint32(42,offset,true);central.set(filename,46);
      chunks.push(local,data);directory.push(central);offset+=local.length+data.length;
    }
    const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,directory.length,true);ev.setUint16(10,directory.length,true);ev.setUint32(12,directory.reduce((sum,x)=>sum+x.length,0),true);ev.setUint32(16,offset,true);
    return new Blob([...chunks,...directory,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function downloadHistory(rows) {
    const url=URL.createObjectURL(historyWorkbook(rows));const link=document.createElement('a');
    link.href=url;link.download='Ultimate_LMS_results.xlsx';document.body.appendChild(link);
    try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }
  function Training({
    type,
    userData
  }) {
    const excel = userData?.excelProgress || {},
      typing = userData?.typingProgress || {},
      hot = userData?.hotkeyProgress || {};
    const content = {
      excel: {
        icon: 'excel',
        title: 'От первой формулы к уверенной работе',
        text: 'Все твои достижения в Excel — в одном месте.',
        count: num(excel.completedLessons),
        countLabel: 'Завершено уроков',
        hint: 'Попробуй применить новую формулу в собственной таблице — так она запомнится лучше.',
        value: num(excel.xp) % 1000,
        max: 1000,
        display: num(excel.level, 1),
        unit: 'уровень',
        ringNote: `До следующей отметки в 1 000 XP: ${fmt(1000 - num(excel.xp) % 1000)} XP.`,
        metrics: [{
          label: 'Уровень',
          value: num(excel.level, 1),
          note: 'Из профиля',
          icon: 'excel'
        }, {
          label: 'Всего опыта',
          value: num(excel.xp),
          unit: 'XP',
          note: 'Накоплено в Excel',
          icon: 'spark'
        }, {
          label: 'Пройдено уроков',
          value: num(excel.completedLessons),
          note: 'Завершённые занятия',
          icon: 'check'
        }, {
          label: 'Серия без ошибок',
          value: num(excel.streak),
          note: 'Сохранённая серия',
          icon: 'bolt'
        }]
      },
      typing: {
        icon: 'typing',
        title: 'Ровный ритм. Уверенная скорость.',
        text: 'Следи за личным рекордом, комбо и количеством тренировок.',
        count: num(typing.testsCompleted),
        countLabel: 'Завершено тренировок',
        hint: 'Точность важнее спешки. Ускоряйся, когда пальцы начинают находить клавиши без подсказок.',
        value: num(typing.maxWpm),
        max: 120,
        display: num(typing.maxWpm),
        unit: 'WPM · рекорд',
        ringNote: 'Шкала до 120 WPM — ориентир для кольца, не ограничение рекорда.',
        metrics: [{
          label: 'Лучшая скорость',
          value: num(typing.maxWpm),
          unit: 'WPM',
          note: 'Личный рекорд',
          icon: 'typing'
        }, {
          label: 'Лучшее комбо',
          value: num(typing.maxCombo),
          note: 'Серия точных нажатий',
          icon: 'bolt'
        }, {
          label: 'Тренировки',
          value: num(typing.testsCompleted),
          note: 'Завершённые тексты',
          icon: 'check'
        }]
      },
      hotkeys: {
        icon: 'bolt',
        title: 'Нужное действие — одним сочетанием',
        text: 'Твой рекорд и регулярная практика горячих клавиш.',
        count: num(hot.sessionsPlayed),
        countLabel: 'Завершено сессий',
        hint: 'Возьми одно новое сочетание и используй его в привычной работе сегодня.',
        value: num(hot.sessionsPlayed),
        max: (Math.floor(num(hot.sessionsPlayed) / 10) + 1) * 10,
        display: num(hot.sessionsPlayed),
        unit: 'сессий',
        ringNote: `Следующая отметка — ${(Math.floor(num(hot.sessionsPlayed) / 10) + 1) * 10} сессий.`,
       metrics: [{
          label: 'Всего очков',
          value: num(hot.totalScore),
          note: 'Сумма за все подходы',
          icon: 'spark'
        }, {
          label: 'Средний за подход',
          value: hot.sessionsPlayed ? Math.round(num(hot.totalScore) / num(hot.sessionsPlayed) * 10) / 10 : 0,
          unit: '/ 10',
          note: 'Очков в среднем',
          icon: 'cup'
        }, {
          label: 'Всего сессий',
          value: num(hot.sessionsPlayed),
          note: 'Завершённые тренировки',
          icon: 'check'
        }]
      }
    }[type];
    const lastDot = Math.min(content.count, 24) - 1;
    return <><div className="usp-card usp-training-hero"><div className="usp-training-copy"><span className="usp-badge"><Icon name={content.icon} size={16} />Личный прогресс</span><h3>{content.title}</h3><p>{content.text}</p></div><div className="usp-training-ring"><Ring value={content.value} max={content.max} display={content.display} unit={content.unit} label="Прогресс" /><p className="usp-caption">{content.ringNote}</p></div></div><div style={{
        '--up-columns': content.metrics.length
      }}><Metrics items={content.metrics} /></div><div className="usp-card"><div className="usp-section-head"><div><h3>{content.countLabel}</h3><p className="usp-caption">Каждое занятие добавляет уверенности</p></div><span className="usp-badge">{fmt(content.count)}</span></div><div className="usp-dots" aria-hidden="true">{Array.from({
            length: 24
          }, (_, i) => <span key={i} className={`usp-dot ${i >= content.count ? 'off' : ''} ${i === lastDot ? 'last' : ''}`} style={{
            animationDelay: `${i * 30}ms`
          }} />)}</div><p className="usp-caption">{content.count > 24 ? `Показаны 24 из ${fmt(content.count)} занятий.` : 'Один заполненный квадрат — одно завершённое занятие.'}</p><div className="usp-hint"><Icon name="spark" size={18} /><span>{content.hint}</span></div></div></>;
  }
  function StatsPanel({
    history,
    setHistory,
    userData,
    uid,
    theme
  }) {
    useStyles();
    const id = useId();
    const [activeTab, setActiveTab] = useState('tests');
    const source = Array.isArray(userData?.testHistory) ? userData.testHistory : list(history);
    const sourceSignature = useMemo(() => fingerprint(source), [source]);
    const [override, setOverride] = useState(null);
    const mounted = useRef(true);
    const writeLock = useRef(false);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);
    const activeHistory = override && override.uid === uid && override.base === sourceSignature ? override.value : source;
    const rows = useMemo(() => normalizeHistory(activeHistory), [activeHistory]);
    const summary = useMemo(() => testSummary(activeHistory), [activeHistory]);
    async function removeEntry(target) {
      if (writeLock.current) throw new Error('Дождитесь завершения удаления.');
      writeLock.current = true;
      const actor = window.auth?.currentUser?.uid || null;
      const assertActor = () => {
        if ((window.auth?.currentUser?.uid || null) !== actor) throw new Error('Аккаунт изменился. Обновите страницу.');
      };
      try {
        if (actor !== uid) throw new Error('Аккаунт изменился. Обновите страницу.');
        let updated;
        if (actor) {
          if (!window.db?.runTransaction) throw new Error('База недоступна. Запись не удалена. Попробуйте позже.');
          const ref = window.db.collection('users').doc(actor);
          updated = await window.db.runTransaction(async transaction => {
            assertActor();
            const snapshot = await transaction.get(ref);
            assertActor();
            if (!snapshot.exists) throw new Error('Профиль не найден. Запись не удалена.');
            const remote = snapshot.data()?.testHistory;
            if (!Array.isArray(remote)) throw new Error('История в профиле недоступна. Обновите страницу.');
            const next = removeExact(remote, target);
            transaction.update(ref, {
              testHistory: next
            });
            return next;
          });
        } else {
          if (typeof setHistory !== 'function') throw new Error('Для изменения истории нужно войти в аккаунт.');
          updated = removeExact(activeHistory, target);
        }
        assertActor();
        if (!mounted.current) return;
        setOverride({
          uid,
          base: sourceSignature,
          value: updated
        });
        if (typeof setHistory === 'function') setHistory(updated);
        // Сохраняем прежний ключ для совместимости с родительским приложением.
        try {
          localStorage.setItem('test_history_v1', JSON.stringify(updated));
        } catch {}
      } finally {
        writeLock.current = false;
      }
    }
    const metrics = [{
      label: 'Средний балл',
      value: summary.average,
      unit: '%',
      note: 'По завершённым тестам',
      icon: 'tests'
    }, {
      label: 'Лучший результат',
      value: summary.best,
      unit: '%',
      note: 'Личный рекорд',
      icon: 'cup'
    }, {
      label: 'Результат ≥ 50%',
      value: summary.total ? Math.round(summary.passed / summary.total * 100) : 0,
      unit: '%',
      note: `${summary.passed} из ${summary.total} попыток`,
      icon: 'check'
    }, {
      label: 'Пройдено тестов',
      value: summary.total,
      note: 'С корректным результатом',
      icon: 'clock'
    }];
    const passRate = summary.total ? Math.round(summary.passed / summary.total * 100) : 0;
    return <section className={`usp ${theme === 'light' ? 'theme-light' : theme === 'dark' ? 'theme-dark' : ''}`} aria-label="Статистика обучения" onPointerMove={trackSpotlight} onPointerDown={spawnRipple}><div className="usp-shell usp-enter"><header className="usp-heading"><div><div className="usp-eyebrow"><Icon name="spark" size={15} />Ultimate LMS · Личный прогресс</div><h2>Маленькие шаги. Большие результаты.</h2><p className="usp-subtitle">Твои достижения, рекорды и следующий повод гордиться собой.</p></div><div className="usp-mark" aria-hidden="true"><Icon name="excel" size={30} /></div></header><Tabs value={activeTab} onChange={setActiveTab} tabs={TABS} label="Раздел статистики" id={id} /><div key={`${uid}:${activeTab}`} className="usp-enter" role="tabpanel" id={`${id}-panel-${activeTab}`} aria-labelledby={`${id}-${activeTab}`}>{activeTab === 'tests' ? <><Metrics items={metrics} /><div className="usp-overview"><BestChart rows={rows} /><div className="usp-card usp-ring-card"><h3>Уверенный результат</h3><Ring value={passRate} unit="%" label="Доля результатов от 50 процентов" /><p className="usp-caption">{summary.total ? `${summary.passed} из ${summary.total} попыток с результатом от 50%.` : 'Пройди первый тест, чтобы начать заполнять кольцо.'}</p></div></div><HistoryList rows={rows} onRemove={removeEntry} canRemove={!!uid || typeof setHistory === 'function'} /></> : activeTab === 'leaderboard' ? <Leaderboard uid={uid} /> : <Training type={activeTab} userData={userData} />}</div></div></section>;
  }
  function StatsView(props) {
    const uid = useUserId();
    return <StatsPanel key={uid || 'guest'} {...props} uid={uid} />;
  }
  Object.assign(window, {
    StatsView
  });
})();
