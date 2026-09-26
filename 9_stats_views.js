// Ultimate LMS · вопросы, разбор и статистика
// Полная замена исходного блока. Нужен React; Firebase используется как в исходнике.
// Экспорты и props сохранены: TestQuestionCard, ReviewView, StatsView.
(function () {
    'use strict';
    const { useState, useEffect, useRef, useMemo, memo } = React;
    let nextId = 0;
    const useId = React.useId || function () { const ref = useRef(null); if (!ref.current) ref.current = `ulx-${++nextId}`; return ref.current; };
    const list = value => Array.isArray(value) ? value : [];
    const str = value => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    const num = (value, fallback = 0) => Number.isFinite(Number(value)) && value !== null && value !== '' ? Math.max(0, Number(value)) : fallback;
    const score = value => value !== null && value !== undefined && str(value).trim() !== '' && Number.isFinite(Number(value)) ? Math.min(100, Math.max(0, Number(value))) : null;
    const fmt = value => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);
    const variant = value => typeof value === 'string' ? { text: value } : value || {};
    const selectedIndex = (question, answer) => Number.isInteger(answer) && answer >= 0 && answer < list(question?.variants).length ? answer : null;
    const answerState = (question, answer) => selectedIndex(question, answer) === null ? 'skipped' : answer === question.correctIndex ? 'correct' : 'wrong';
    const STATUS = { correct: 'Верно', wrong: 'Ошибка', skipped: 'Без ответа' };
    const TABS = [
        { id: 'tests', label: 'Тесты', icon: 'tests' },
        { id: 'excel', label: 'Excel', icon: 'excel' },
        { id: 'typing', label: 'Печать', icon: 'typing' },
        { id: 'hotkeys', label: 'Хоткеи', icon: 'bolt' },
        { id: 'leaderboard', label: 'Рейтинг', icon: 'cup' }
    ];
    const ICONS = {
        tests: <><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
        excel: <><path d="M5 20V12M12 20V4M19 20V8"/><path d="M3 20h18"/></>,
        typing: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 15h8"/></>,
        bolt: <path d="m13 2-9 12h7l-1 8 10-12h-8z"/>,
        cup: <><path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 13v7M8 21h8"/></>,
        check: <path d="m5 12 4 4L19 6"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
        arrow: <path d="m14 6-6 6 6 6M8 12h12"/>,
        search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
        trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
        refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2"/></>,
        spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>,
        chevron: <path d="m9 5 7 7-7 7"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>
    };
    const Icon = ({ name, size = 18 }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[name] || ICONS.spark}</svg>;

    const CSS = `
    .ulx{--ux-bg:#141727;--ux-surface:#1b1f33;--ux-soft:#22273f;--ux-text:#f1f2fb;--ux-muted:#a5abc4;--ux-line:rgba(170,180,224,.16);--ux-accent:#b2a0ff;--ux-tint:rgba(159,130,255,.13);--ux-green:#6cddb0;--ux-green-bg:rgba(61,194,140,.12);--ux-red:#ffa4b2;--ux-red-bg:rgba(247,97,127,.12);--ux-shadow:0 22px 70px rgba(5,8,25,.2);color-scheme:dark;color:var(--ux-text);font-family:inherit;font-size:14px;line-height:1.55;text-align:left;width:100%;min-width:0;box-sizing:border-box}
    :is(html.light,body.light,.theme-light,[data-theme="light"]) .ulx,.ulx.theme-light{--ux-bg:#f8f9ff;--ux-surface:#fff;--ux-soft:#eff1fa;--ux-text:#252a44;--ux-muted:#646c87;--ux-line:rgba(91,106,154,.18);--ux-accent:#7351d9;--ux-tint:rgba(123,89,226,.085);--ux-green:#137b57;--ux-green-bg:#e8f7ef;--ux-red:#be3e59;--ux-red-bg:#fff0f3;--ux-shadow:0 18px 55px rgba(55,66,116,.08);color-scheme:light}
    .ulx *,.ulx *:before,.ulx *:after{box-sizing:border-box}.ulx h2,.ulx h3,.ulx p{margin:0}.ulx button,.ulx input,.ulx select{font:inherit;letter-spacing:inherit}.ulx button{cursor:pointer}.ulx button:disabled{cursor:default}.ulx button,.ulx input,.ulx select{color:inherit}.ulx button:focus-visible,.ulx input:focus-visible,.ulx select:focus-visible,.ulx summary:focus-visible{outline:3px solid var(--ux-accent);outline-offset:4px}.ulx svg{flex-shrink:0}.ulx [hidden]{display:none!important}
    .ulx-shell{border:1px solid var(--ux-line);background:radial-gradient(ellipse at 94% 0%,var(--ux-tint),transparent 45%),var(--ux-bg);border-radius:28px;padding:30px;box-shadow:var(--ux-shadow);overflow:hidden}
    .ulx-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:26px}.ulx-eyebrow{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:1.8px;font-weight:800;text-transform:uppercase;color:var(--ux-accent);margin-bottom:8px}.ulx h2{font-size:clamp(24px,3vw,32px);letter-spacing:-1.1px;line-height:1.2;font-weight:750}.ulx-subtitle{color:var(--ux-muted);margin-top:8px!important;font-size:13px}.ulx-mark{display:grid;place-items:center;width:58px;height:58px;background:var(--ux-tint);color:var(--ux-accent);border-radius:19px;transform:rotate(-7deg);border:1px solid var(--ux-line)}
    .ulx-tabs{display:flex;gap:5px;padding:5px;background:var(--ux-soft);border:1px solid var(--ux-line);border-radius:16px;margin-bottom:26px;overflow:auto;scrollbar-width:none}.ulx-tab{display:flex;align-items:center;justify-content:center;gap:8px;flex:1;white-space:nowrap;min-height:43px;border:1px solid transparent;background:transparent;color:var(--ux-muted)!important;border-radius:11px;padding:9px 15px;font-size:13px!important;font-weight:650!important;transition:background .2s,color .2s,box-shadow .2s}.ulx-tab[aria-selected=true],.ulx-tab[aria-pressed=true]{background:var(--ux-surface);border-color:var(--ux-line);color:var(--ux-accent)!important;box-shadow:0 3px 9px rgba(23,32,64,.05)}.ulx-tab:hover{color:var(--ux-text)!important}
    .ulx-enter{animation:ulx-in .32s cubic-bezier(.2,.7,.2,1) both}.ulx-metrics{display:grid;grid-template-columns:repeat(var(--ux-columns,4),minmax(0,1fr));gap:12px;margin-bottom:22px}.ulx-metric{padding:19px 20px;background:var(--ux-surface);border:1px solid var(--ux-line);border-radius:18px;min-width:0;position:relative}.ulx-metric-label{color:var(--ux-muted);display:flex;align-items:center;gap:7px;font-size:12px}.ulx-metric-value{display:block;font-size:32px;line-height:1.25;letter-spacing:-1px;font-weight:750;font-variant-numeric:tabular-nums;margin:9px 0 3px;overflow-wrap:anywhere}.ulx-metric-value small{font-size:16px;letter-spacing:0;margin-left:4px;color:var(--ux-muted);font-weight:550}.ulx-metric-note{font-size:11px;color:var(--ux-muted)}.ulx-accent{color:var(--ux-accent)}
    .ulx-card{border:1px solid var(--ux-line);background:var(--ux-surface);border-radius:20px;padding:23px;margin-top:18px}.ulx-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.ulx h3{font-size:15px;font-weight:700;letter-spacing:-.25px}.ulx-caption{font-size:11px;color:var(--ux-muted)}.ulx-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:650;border-radius:8px;padding:4px 8px;background:var(--ux-tint);color:var(--ux-accent);white-space:nowrap}.ulx-badge.correct{color:var(--ux-green);background:var(--ux-green-bg)}.ulx-badge.wrong{color:var(--ux-red);background:var(--ux-red-bg)}.ulx-badge.skipped{background:var(--ux-soft);color:var(--ux-muted)}
    .ulx-chart{height:186px;display:flex;gap:12px;position:relative;padding:8px 0 0}.ulx-scale{display:flex;flex-direction:column;justify-content:space-between;padding-bottom:28px;font-size:10px;color:var(--ux-muted);width:27px;flex-shrink:0}.ulx-bars{flex:1;display:flex;align-items:stretch;justify-content:space-around;gap:clamp(6px,2vw,22px);min-width:0;background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),var(--ux-line) calc(25% - 1px),var(--ux-line) 25%);background-size:100% calc(100% - 28px);background-repeat:no-repeat}.ulx-bar-col{flex:1;max-width:76px;display:flex;flex-direction:column;align-items:center;min-width:0}.ulx-bar-track{flex:1;min-height:0;width:100%;display:flex;align-items:flex-end;position:relative}.ulx-bar{width:100%;min-height:2px;position:relative;background:linear-gradient(0deg,#8b6cde,#b2a0fa);border-radius:7px 7px 3px 3px;transform-origin:bottom;animation:ulx-grow .65s cubic-bezier(.2,.7,.2,1) both}.ulx-bar-col:first-child .ulx-bar{background:linear-gradient(0deg,#7655d3,#a084f4)}.ulx-bar-label{flex:0 0 28px;padding-top:6px;font-size:11px;color:var(--ux-muted);font-variant-numeric:tabular-nums}.ulx-bar-tip{position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);background:var(--ux-text);color:var(--ux-bg);font-size:10px;padding:2px 6px;border-radius:5px;white-space:nowrap}
    .ulx-tools{display:flex;gap:10px;align-items:center;margin-bottom:8px}.ulx-search{display:flex;align-items:center;gap:8px;flex:1;min-width:0;border:1px solid var(--ux-line);background:var(--ux-bg);border-radius:11px;padding:0 12px;color:var(--ux-muted)}.ulx-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--ux-text);height:42px;font-size:13px}.ulx-search:focus-within{box-shadow:0 0 0 2px var(--ux-accent)}.ulx-search input:focus-visible{outline:none}.ulx-search input::placeholder{color:var(--ux-muted)}.ulx-select{max-width:180px;height:44px;border:1px solid var(--ux-line);background:var(--ux-bg);border-radius:11px;padding:0 10px;font-size:12px!important}.ulx-record{display:grid;grid-template-columns:40px minmax(0,1fr) auto 32px;gap:13px;align-items:center;padding:16px 0;border-bottom:1px solid var(--ux-line)}.ulx-record:last-child{border:0}.ulx-record-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:var(--ux-tint);color:var(--ux-accent)}.ulx-record-title{font-weight:650;font-size:13px;overflow-wrap:anywhere}.ulx-record-meta{font-size:11px;color:var(--ux-muted);margin-top:3px;overflow-wrap:anywhere}.ulx-record-score{font-size:19px;font-variant-numeric:tabular-nums;letter-spacing:-.5px;font-weight:750;white-space:nowrap}.ulx-record-score small{font-size:11px;margin-left:2px;color:var(--ux-muted)}
    .ulx-icon-btn{border:0;background:transparent;color:var(--ux-muted)!important;display:inline-grid;place-items:center;width:32px;height:34px;border-radius:9px;transition:background .2s,color .2s}.ulx-icon-btn:hover{background:var(--ux-soft);color:var(--ux-accent)!important}.ulx-icon-btn.danger:hover{background:var(--ux-red-bg);color:var(--ux-red)!important}.ulx-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:9px 15px;border-radius:11px;border:1px solid var(--ux-line);background:var(--ux-surface);font-size:12px!important;font-weight:650!important;transition:transform .18s,background .18s}.ulx-btn:hover:not(:disabled){background:var(--ux-soft);transform:translateY(-1px)}.ulx-btn.primary{background:#7959d8;border-color:#7959d8;color:#fff}.ulx-btn.danger{background:var(--ux-red-bg);border-color:var(--ux-red);color:var(--ux-red)}.ulx-btn:disabled{opacity:.5}.ulx-pagination{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px}.ulx-pagination>div{display:flex;gap:6px}.ulx-empty{text-align:center;padding:42px 20px;color:var(--ux-muted)}.ulx-empty .ulx-mark{margin:0 auto 16px;transform:none}.ulx-empty h3{color:var(--ux-text);margin-bottom:7px}.ulx-empty p{font-size:13px;max-width:390px;margin:auto}.ulx-empty .ulx-btn{margin-top:18px}
    .ulx-confirm{background:var(--ux-soft);border:1px solid var(--ux-line);border-radius:14px;padding:17px;margin:8px 0;display:flex;align-items:center;flex-wrap:wrap;gap:12px}.ulx-confirm-text{flex:1;min-width:170px;font-size:13px}.ulx-confirm-actions{display:flex;gap:7px}.ulx-error{color:var(--ux-red);font-size:12px;flex-basis:100%}.ulx-notice{background:var(--ux-green-bg);color:var(--ux-green);padding:10px 14px;border-radius:12px;font-size:12px;margin-bottom:12px}.ulx-skeleton{height:66px;border-radius:14px;background:var(--ux-soft);margin:10px 0;animation:ulx-pulse 1.4s infinite alternate}
    .ulx-training{display:grid;grid-template-columns:1.1fr 1fr;gap:24px;align-items:center;min-height:190px}.ulx-training-copy h3{font-size:23px;letter-spacing:-.7px;line-height:1.3;margin:12px 0}.ulx-training-copy p{font-size:13px;color:var(--ux-muted);max-width:400px}.ulx-activity{background:var(--ux-bg);border:1px solid var(--ux-line);padding:22px;border-radius:17px}.ulx-dots{display:flex;gap:6px;flex-wrap:wrap;margin-top:15px}.ulx-dot{width:10px;height:10px;border-radius:3px;background:var(--ux-accent);animation:ulx-in .4s both}.ulx-dot.off{background:var(--ux-soft)}.ulx-hint{display:flex;align-items:flex-start;gap:10px;color:var(--ux-muted);font-size:12px;margin-top:20px}.ulx-hint svg{color:var(--ux-accent);margin-top:2px}
    .ulx-lb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.ulx-lb-top .ulx-tabs{margin:0;max-width:100%;padding:4px}.ulx-lb-top .ulx-tab{font-size:12px!important;padding:7px 12px;min-height:36px}.ulx-lb-row{display:grid;grid-template-columns:32px 42px minmax(0,1fr) auto;gap:13px;align-items:center;padding:15px 12px;border-radius:13px;border:1px solid transparent;border-bottom-color:var(--ux-line)}.ulx-lb-row.me{background:var(--ux-tint);border-color:var(--ux-accent)}.ulx-rank{text-align:center;font-size:13px;font-weight:700;color:var(--ux-muted)}.ulx-rank.top{color:var(--ux-accent)}.ulx-avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:hsl(var(--hue) 48% 52%);color:#fff;font-weight:750;font-size:13px}.ulx-lb-value{text-align:right;font-size:22px;font-weight:750;font-variant-numeric:tabular-nums;line-height:1.1}.ulx-lb-value small{display:block;color:var(--ux-muted);font-size:10px;font-weight:500;line-height:1.6;margin-top:3px}.ulx-lb-name{font-weight:650;overflow-wrap:anywhere}.ulx-lb-name .ulx-badge{margin-left:7px;font-size:9px}
    .ulx-question{padding:28px}.ulx-question-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:23px}.ulx-question-head .ulx-eyebrow{margin:0}.ulx-question-title{font-size:19px;line-height:1.6;font-weight:600;margin-bottom:22px}.ulx-rich{overflow-wrap:anywhere;min-width:0}.ulx-rich p+p{margin-top:.7em}.ulx-rich pre{overflow:auto;padding:12px;border-radius:10px;background:var(--ux-soft);font-size:13px;white-space:pre-wrap}.ulx-rich code{font-family:ui-monospace,monospace}.ulx-rich a{color:var(--ux-accent)}.ulx-rich img{max-width:100%;height:auto}.ulx-rich table{border-collapse:collapse;display:block;max-width:100%;overflow:auto}.ulx-rich td,.ulx-rich th{border:1px solid var(--ux-line);padding:6px 10px}.ulx-rich ul,.ulx-rich ol{padding-left:24px}.ulx-image{display:block;width:auto;max-width:100%;max-height:280px;object-fit:contain;border-radius:12px;margin:12px 0 18px}.ulx-image-error{display:block;color:var(--ux-muted);font-size:12px;padding:14px;background:var(--ux-soft);border-radius:10px;margin:8px 0}
    .ulx-options{display:grid;gap:10px}.ulx-option{width:100%;text-align:left;display:flex;align-items:flex-start;gap:13px;padding:16px 18px;background:var(--ux-surface);border:1px solid var(--ux-line);border-radius:15px;font-size:14px!important;line-height:1.6;transition:border-color .18s,background .18s,transform .18s;color:var(--ux-text)!important}.ulx-option:hover:not(:disabled){background:var(--ux-tint);border-color:var(--ux-accent);transform:translateX(3px)}.ulx-option-letter{width:29px;height:29px;border:1px solid var(--ux-line);border-radius:9px;display:grid;place-items:center;color:var(--ux-muted);background:var(--ux-bg);font-size:12px;flex-shrink:0;font-weight:650}.ulx-option-body{flex:1;min-width:0;padding-top:2px}.ulx-option .ulx-image{max-height:180px;margin:8px 0}.ulx-option.correct{background:var(--ux-green-bg);border-color:var(--ux-green)}.ulx-option.wrong{background:var(--ux-red-bg);border-color:var(--ux-red)}.ulx-option.correct .ulx-option-letter{color:var(--ux-green);border-color:var(--ux-green);background:transparent}.ulx-option.wrong .ulx-option-letter{color:var(--ux-red);border-color:var(--ux-red);background:transparent}.ulx-option.dim{color:var(--ux-muted)!important}.ulx-option-tag{font-size:10px;display:block;margin-top:5px;font-weight:650;color:var(--ux-muted)}.ulx-option.correct .ulx-option-tag{color:var(--ux-green)}.ulx-option.wrong .ulx-option-tag{color:var(--ux-red)}.ulx-feedback{margin-top:17px;padding:12px 15px;border-radius:12px;font-size:13px;display:flex;gap:9px;align-items:center;animation:ulx-in .25s both}.ulx-feedback.correct{color:var(--ux-green);background:var(--ux-green-bg)}.ulx-feedback.wrong{color:var(--ux-red);background:var(--ux-red-bg)}
    .ulx-review-summary{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}.ulx-filter{display:flex;gap:7px;flex-wrap:wrap;margin:20px 0}.ulx-chip{display:flex;align-items:center;gap:7px;border:1px solid var(--ux-line);border-radius:10px;background:transparent;padding:8px 12px;color:var(--ux-muted)!important;font-size:12px!important}.ulx-chip[aria-pressed=true]{background:var(--ux-tint);border-color:var(--ux-accent);color:var(--ux-accent)!important}.ulx-chip span{font-variant-numeric:tabular-nums;opacity:.8}.ulx-review-card{border:1px solid var(--ux-line);border-radius:17px;margin:12px 0;background:var(--ux-surface);overflow:hidden}.ulx-review-card summary{cursor:pointer;display:flex;align-items:center;gap:12px;list-style:none;padding:18px}.ulx-review-card summary::-webkit-details-marker{display:none}.ulx-review-card summary>.ulx-rich{flex:1;font-size:13px;max-height:43px;overflow:hidden}.ulx-review-number{color:var(--ux-muted);font-size:12px;white-space:nowrap}.ulx-review-chevron{display:flex;color:var(--ux-muted);transition:transform .2s}.ulx-review-card[open] .ulx-review-chevron{transform:rotate(90deg)}.ulx-review-body{padding:0 20px 22px;animation:ulx-in .25s both}.ulx-review-body>.ulx-rich{font-size:16px;margin-bottom:17px}.ulx-review-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:24px;padding-top:18px;border-top:1px solid var(--ux-line)}
    @keyframes ulx-in{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}@keyframes ulx-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes ulx-pulse{from{opacity:.4}to{opacity:1}}
    @media(max-width:680px){.ulx-shell{padding:20px;border-radius:22px}.ulx-heading{margin-bottom:20px}.ulx-mark{width:46px;height:46px;border-radius:15px}.ulx-tabs{margin-bottom:20px}.ulx-tab{padding:9px 11px;font-size:12px!important;gap:6px}.ulx-tab svg{width:16px;height:16px}.ulx-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ulx-metric{padding:15px}.ulx-metric-value{font-size:30px}.ulx-metric-label{min-height:34px;align-items:flex-start;line-height:1.4}.ulx-metric-label svg{margin-top:2px}.ulx-card{padding:17px}.ulx-training{grid-template-columns:1fr;gap:20px}.ulx-training-copy h3{font-size:21px}.ulx-record{gap:9px;grid-template-columns:32px minmax(0,1fr) auto 30px}.ulx-record-icon{width:30px;height:34px;border-radius:9px}.ulx-record-score{font-size:18px}.ulx-lb-top{align-items:flex-start}.ulx-lb-top .ulx-tabs{max-width:calc(100% - 43px)}.ulx-lb-row{padding:14px 7px;grid-template-columns:21px 35px minmax(0,1fr) auto;gap:9px}.ulx-avatar{width:34px;height:34px;border-radius:11px}.ulx-lb-value{font-size:20px}.ulx-question-title{font-size:17px}.ulx-question{padding:21px}.ulx-option{padding:13px;gap:10px}.ulx-review-card summary{gap:8px;padding:14px}.ulx-review-body{padding:0 14px 17px}.ulx-review-card summary>.ulx-rich{display:none}.ulx-review-number{flex:1}.ulx-select{max-width:125px}.ulx-tools{gap:7px}.ulx-chart{gap:6px;height:171px}.ulx-bar-tip{font-size:8px;padding:0;background:transparent;color:var(--ux-muted);bottom:calc(100% + 5px)}.ulx-bar-tip .ulx-chart-percent{display:none}}
    @media(prefers-reduced-motion:reduce){.ulx *,.ulx *:before,.ulx *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
    `;
    function useStyles() {
        useEffect(() => {
            let node = document.getElementById('ultimate-insights-styles');
            if (!node) { node = document.createElement('style'); node.id = 'ultimate-insights-styles'; document.head.appendChild(node); }
            if (node.textContent !== CSS) node.textContent = CSS;
        }, []);
    }
    function safeURL(value, image = false) {
        const raw = str(value).trim();
        if (!raw) return '';
        if (image && /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(raw)) return raw;
        try { const parsed = new URL(raw, document.baseURI); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; }
    }
    // Разрешаем форматирование заданий, но не обработчики событий, iframe и скрипты.
    function sanitize(value) {
        const doc = new DOMParser().parseFromString(str(value), 'text/html');
        const allowed = new Set('p br b strong i em u s del sub sup span div code pre ul ol li blockquote h3 h4 h5 table thead tbody tr th td a img hr'.split(' '));
        const blocked = new Set('script style iframe object embed svg math form input textarea button select template link meta'.split(' '));
        function walk(parent) {
            for (const el of Array.from(parent.children)) {
                const tag = el.tagName.toLowerCase();
                if (blocked.has(tag)) { el.remove(); continue; }
                walk(el);
                if (!allowed.has(tag)) { el.replaceWith(...el.childNodes); continue; }
                for (const attr of Array.from(el.attributes)) {
                    const n = attr.name.toLowerCase();
                    const keep = (tag === 'a' && n === 'href') || (tag === 'img' && ['src', 'alt'].includes(n)) || (['td', 'th'].includes(tag) && ['colspan', 'rowspan'].includes(n)) || (tag === 'span' && n === 'class' && attr.value === 'math-tex');
                    if (!keep) el.removeAttribute(attr.name);
                }
                if (tag === 'a') { const url = safeURL(el.getAttribute('href')); if (url) { el.setAttribute('href', url); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); } else el.removeAttribute('href'); }
                if (tag === 'img') { const url = safeURL(el.getAttribute('src'), true); if (!url) el.remove(); else { el.setAttribute('src', url); el.setAttribute('loading', 'lazy'); el.setAttribute('alt', el.getAttribute('alt') || 'Иллюстрация задания'); } }
            }
        }
        walk(doc.body); return doc.body.innerHTML;
    }
    // Используем существующий hook, если он уже подключён до этого файла.
    const useMath = typeof window.useMathJax === 'function' ? window.useMathJax : function (ref, dependencies) {
        useEffect(() => {
            let active = true;
            const node = ref.current;
            const ready = window.MathJax?.startup?.promise || Promise.resolve();
            Promise.resolve(ready).then(() => {
                if (active && node?.isConnected && window.MathJax?.typesetPromise) return window.MathJax.typesetPromise([node]);
            }).catch(() => {});
            return () => { active = false; if (node && window.MathJax?.typesetClear) { try { window.MathJax.typesetClear([node]); } catch {} } };
        }, dependencies);
    };
    const Rich = memo(function Rich({ value, className = '' }) {
        const ref = useRef(null); const html = useMemo(() => sanitize(value), [value]);
        useMath(ref, [html]);
        return <div ref={ref} className={`ulx-rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
    });
    function Picture({ src, alt }) {
        const [failed, setFailed] = useState(false); const url = safeURL(src, true);
        useEffect(() => setFailed(false), [src]);
        if (!src) return null;
        return failed || !url ? <span className="ulx-image-error">Изображение недоступно</span> : <img className="ulx-image" src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
    }
    function OptionContent({ item, index, state, chosen }) {
        const v = variant(item);
        return <><span className="ulx-option-letter">{state === 'correct' ? <Icon name="check" size={16}/> : state === 'wrong' ? <Icon name="close" size={16}/> : String.fromCharCode(65 + index)}</span><div className="ulx-option-body"><Rich value={v.text}/><Picture src={v.img} alt={`Изображение варианта ${index + 1}`}/>{state === 'correct' && <span className="ulx-option-tag">{chosen ? 'Ваш ответ · верно' : 'Правильный ответ'}</span>}{state === 'wrong' && <span className="ulx-option-tag">Ваш ответ</span>}</div></>;
    }
    // Локальная блокировка защищает от двойного клика до обновления answers родителем.
    function QuestionBody({ question, index, answers, onAnswer }) {
        const external = selectedIndex(question, answers?.[index]);
        const [local, setLocal] = useState(null); const lock = useRef(false); const previousAnswer = useRef(external);
        useEffect(() => { if (previousAnswer.current !== null && external === null) { setLocal(null); lock.current = false; } previousAnswer.current = external; }, [external]);
        const chosen = external !== null ? external : local;
        const answered = chosen !== null;
        const pick = i => {
            if (answered || lock.current || typeof onAnswer !== 'function') return;
            lock.current = true; setLocal(i);
            try { onAnswer(i); } catch (error) { lock.current = false; setLocal(null); throw error; }
        };
        return <article className="ulx-shell ulx-question ulx-enter"><div className="ulx-question-head"><span className="ulx-eyebrow"><Icon name="tests" size={15}/>Вопрос {index + 1}</span><span className="ulx-caption">{answered ? 'Ответ принят' : 'Выберите один ответ'}</span></div><Rich className="ulx-question-title" value={question.question}/><Picture src={question.questionImg} alt={`Иллюстрация к вопросу ${index + 1}`}/><div className="ulx-options">{list(question.variants).map((v, i) => {
            const state = answered ? i === question.correctIndex ? 'correct' : i === chosen ? 'wrong' : 'dim' : '';
            return <button type="button" key={i} className={`ulx-option ${state}`} disabled={answered || typeof onAnswer !== 'function'} onClick={() => pick(i)}><OptionContent item={v} index={i} state={state} chosen={chosen === i}/></button>;
        })}</div>{answered && <div role="status" className={`ulx-feedback ${chosen === question.correctIndex ? 'correct' : 'wrong'}`}><Icon name={chosen === question.correctIndex ? 'check' : 'spark'}/>{chosen === question.correctIndex ? 'Отлично, это правильный ответ.' : 'Пока не получилось. Правильный вариант выделен выше.'}</div>}</article>;
    }
    const TestQuestionCard = memo(function TestQuestionCard({ question, index = 0, answers = [], onAnswer }) {
        useStyles();
        if (!question) return null;
        // Сброс локального ответа при переходе или при замене содержимого вопроса.
        const key = `${index}:${JSON.stringify(question)}`;
        return <div className="ulx"><QuestionBody key={key} {...{ question, index, answers, onAnswer }}/></div>;
    });
    function Empty({ title, text, icon = 'spark', children }) {
        return <div className="ulx-empty"><div className="ulx-mark"><Icon name={icon} size={25}/></div><h3>{title}</h3><p>{text}</p>{children}</div>;
    }
    function ReviewItem({ question, index, answer }) {
        const state = answerState(question, answer);
        return <details className="ulx-review-card" open={state !== 'correct'}><summary><span className="ulx-review-number">Вопрос {index + 1}</span><Rich value={question.question}/><span className={`ulx-badge ${state}`}>{STATUS[state]}</span><span className="ulx-review-chevron"><Icon name="chevron" size={16}/></span></summary><div className="ulx-review-body"><Rich value={question.question}/><Picture src={question.questionImg} alt={`Иллюстрация к вопросу ${index + 1}`}/><div className="ulx-options">{list(question.variants).map((v, i) => {
            const kind = i === question.correctIndex ? 'correct' : i === answer ? 'wrong' : 'dim';
            return <div key={i} className={`ulx-option ${kind}`}><OptionContent item={v} index={i} state={kind} chosen={answer === i}/></div>;
        })}</div></div></details>;
    }
    function ReviewView({ questions = [], answers = [], onBack }) {
        useStyles(); const [filter, setFilter] = useState('all');
        const rows = list(questions).map((q, i) => ({ q, i, state: answerState(q, answers?.[i]) })).filter(x => x.q);
        const counts = { all: rows.length, correct: 0, wrong: 0, skipped: 0 };
        rows.forEach(x => counts[x.state]++);
        const shown = rows.filter(x => filter === 'all' || x.state === filter);
        return <section className="ulx"><div className="ulx-shell ulx-enter"><header className="ulx-heading"><div><div className="ulx-eyebrow"><Icon name="spark" size={14}/>Разбор теста</div><h2>Разберёмся в ответах</h2><p className="ulx-subtitle">Посмотри, что уже получается и что стоит повторить.</p><div className="ulx-review-summary"><span className="ulx-badge correct">{counts.correct} верно</span><span className="ulx-badge wrong">{counts.wrong} с ошибкой</span><span className="ulx-badge skipped">{counts.skipped} без ответа</span></div></div><div className="ulx-mark"><Icon name="tests" size={28}/></div></header><div className="ulx-filter" role="group" aria-label="Фильтр ответов">{[['all','Все вопросы'],['wrong','Ошибки'],['skipped','Без ответа'],['correct','Верные']].map(([id,label]) => <button type="button" key={id} className="ulx-chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}<span>{counts[id]}</span></button>)}</div><div key={filter} className="ulx-enter">{shown.length ? shown.map(({ q, i }) => <ReviewItem key={i} question={q} index={i} answer={answers?.[i]}/>) : <Empty title={filter === 'wrong' ? 'Ошибок нет' : 'Здесь пока пусто'} text={filter === 'wrong' && rows.length ? 'Все отвеченные вопросы решены верно.' : 'В этой группе нет вопросов.'} icon="check"/>}</div><footer className="ulx-review-footer"><span className="ulx-caption">{shown.length} из {rows.length} вопросов</span><button type="button" className="ulx-btn primary" onClick={onBack}><Icon name="arrow" size={16}/>В меню</button></footer></div></section>;
    }

    function normalizeHistory(value) {
        return list(value).filter(x => x && typeof x === 'object').map((raw, index) => ({ raw, index, value: score(raw.percent) }));
    }
    function testSummary(value) {
        const valid = normalizeHistory(value).filter(x => x.value !== null);
        return { total: valid.length, average: valid.length ? Math.round(valid.reduce((sum, x) => sum + x.value, 0) / valid.length) : 0, best: valid.length ? Math.max(...valid.map(x => x.value)) : 0, passed: valid.filter(x => x.value >= 50).length };
    }
    function useUserId() {
        const [uid, setUid] = useState(() => window.auth?.currentUser?.uid || null);
        useEffect(() => {
            const auth = window.auth;
            if (typeof auth?.onAuthStateChanged === 'function') return auth.onAuthStateChanged(user => setUid(user?.uid || null));
        }, []);
        return uid;
    }
    function AnimatedNumber({ value }) {
        const [display, setDisplay] = useState(value); const previous = useRef(value);
        useEffect(() => {
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { previous.current = value; setDisplay(value); return; }
            const from = previous.current; previous.current = value; let frame; const start = performance.now();
            const tick = now => { const t = Math.min(1, (now - start) / 460); setDisplay(Math.round((from + (value - from) * (1 - Math.pow(1 - t, 3))) * 10) / 10); if (t < 1) frame = requestAnimationFrame(tick); };
            frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
        }, [value]);
        return <span aria-label={fmt(value)}><span aria-hidden="true">{fmt(display)}</span></span>;
    }
    function Metrics({ items }) {
        return <div className="ulx-metrics">{items.map(({ label, value, unit, note, icon }, i) => <div className="ulx-metric" key={label}><div className="ulx-metric-label"><Icon name={icon || 'spark'} size={14}/>{label}</div><strong className={`ulx-metric-value ${i === 0 ? 'ulx-accent' : ''}`}><AnimatedNumber value={value}/>{unit && <small>{unit}</small>}</strong><span className="ulx-metric-note">{note}</span></div>)}</div>;
    }
    function Tabs({ value, onChange, tabs, label, id }) {
        return <div className="ulx-tabs" role="tablist" aria-label={label}>{tabs.map((tab, index) => <button type="button" key={tab.id} id={`${id}-${tab.id}`} role="tab" aria-selected={value === tab.id} aria-controls={`${id}-panel-${tab.id}`} tabIndex={value === tab.id ? 0 : -1} className="ulx-tab" onClick={() => onChange(tab.id)} onKeyDown={e => {
            let next = index;
            if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') next = 0; else if (e.key === 'End') next = tabs.length - 1; else return;
            e.preventDefault(); onChange(tabs[next].id); document.getElementById(`${id}-${tabs[next].id}`)?.focus();
        }}>{tab.icon && <Icon name={tab.icon}/>}<span>{tab.label}</span></button>)}</div>;
    }
    function BestChart({ rows }) {
        const best = useMemo(() => rows.filter(x => x.value !== null).slice().sort((a,b) => b.value - a.value).slice(0,10), [rows]);
        return <div className="ulx-card"><div className="ulx-section-head"><div><h3>Лучшие результаты</h3><p className="ulx-caption">До 10 попыток · по убыванию балла</p></div><span className="ulx-badge"><Icon name="cup" size={13}/>Личный топ</span></div>{best.length ? <div className="ulx-chart" role="img" aria-label={best.map((x,i) => `${i+1}. ${str(x.raw.topic) || 'Тест'}: ${fmt(x.value)}%`).join('; ')}><div className="ulx-scale" aria-hidden="true"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="ulx-bars" aria-hidden="true">{best.map((x,i) => <div className="ulx-bar-col" key={x.index} title={`${str(x.raw.topic) || 'Тест'} · ${fmt(x.value)}%`}><div className="ulx-bar-track"><div className="ulx-bar" style={{ height: `${x.value}%`, animationDelay: `${i * 35}ms` }}><span className="ulx-bar-tip">{fmt(x.value)}<span className="ulx-chart-percent">%</span></span></div></div><span className="ulx-bar-label">{i+1}</span></div>)}</div></div> : <Empty title="Первый результат впереди" text="Пройди тест — здесь появятся твои лучшие попытки." icon="tests"/>}</div>;
    }
    function stamp(row) {
        const d = row?.date;
        if (typeof d?.toMillis === 'function') return d.toMillis();
        if (d && Number.isFinite(d.seconds)) return d.seconds * 1000;
        if (typeof d === 'number' && Number.isFinite(d)) return d;
        if (typeof d === 'string') {
            const ru = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
            if (ru) return new Date(+ru[3], +ru[2]-1, +ru[1], +(ru[4]||0), +(ru[5]||0), +(ru[6]||0)).getTime();
            if (/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(d)) { const t = Date.parse(d); if (Number.isFinite(t)) return t; }
        }
        const id = Number(row?.id); return id > 1e12 && id < 1e14 ? id : null;
    }
    function dateLabel(raw) {
        if (typeof raw.date === 'string') return raw.date;
        const time = stamp(raw); return time !== null && Number.isFinite(time) ? new Date(time).toLocaleDateString('ru-RU') : 'Дата не указана';
    }
    // Точный снимок записи: при параллельном изменении не удаляем чужую/новую версию.
    function fingerprint(value) {
        if (value === null || typeof value !== 'object') return JSON.stringify(value);
        if (value instanceof Date) return JSON.stringify(value.toISOString());
        if (Array.isArray(value)) return '[' + value.map(fingerprint).join(',') + ']';
        return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + fingerprint(value[key])).join(',') + '}';
    }
    function removeExact(history, target) {
        const signature = fingerprint(target); const matches = list(history).map((x,i) => fingerprint(x) === signature ? i : -1).filter(i => i >= 0);
        if (matches.length > 1) throw new Error('Есть одинаковые записи. Обновите историю перед удалением.');
        if (!matches.length) throw new Error('Запись уже изменена или удалена. Обновите страницу.');
        return history.filter((_,i) => i !== matches[0]);
    }
    function HistoryList({ rows, onRemove, canRemove }) {
        const [query,setQuery] = useState(''); const [sort,setSort] = useState('recent'); const [page,setPage] = useState(0);
        const [target,setTarget] = useState(null); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [notice,setNotice] = useState('');
        const lock = useRef(false); const cancelRef = useRef(null); const opener = useRef(null); const alive = useRef(true);
        useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
        useEffect(() => { if (target) cancelRef.current?.focus(); }, [target]);
        const found = useMemo(() => {
            const q = query.trim().toLocaleLowerCase('ru');
            return rows.filter(x => `${str(x.raw.topic)} ${str(x.raw.student)} ${dateLabel(x.raw)}`.toLocaleLowerCase('ru').includes(q)).slice().sort((a,b) => sort === 'best' ? (b.value ?? -1) - (a.value ?? -1) || a.index-b.index : (stamp(b.raw) ?? -1) - (stamp(a.raw) ?? -1) || a.index-b.index);
        }, [rows, query, sort]);
        const pages = Math.max(1, Math.ceil(found.length / 8)); const current = Math.min(page,pages-1); const visible = found.slice(current*8,current*8+8);
        function close() { setTarget(null); setError(''); opener.current?.focus(); }
        async function confirmDelete() {
            if (lock.current || !target) return;
            lock.current = true; setBusy(true); setError('');
            try { await onRemove(target.raw); if (alive.current) { setTarget(null); setNotice('Запись удалена'); } }
            catch (e) { if (alive.current) setError(e.message || 'Не удалось удалить запись. Попробуйте ещё раз.'); }
            finally { lock.current = false; if (alive.current) setBusy(false); }
        }
        return <div className="ulx-card"><div className="ulx-section-head"><h3>История попыток</h3><span className="ulx-caption">{rows.length} записей</span></div>{rows.length > 0 && <div className="ulx-tools"><label className="ulx-search"><Icon name="search" size={16}/><input aria-label="Поиск в истории" placeholder="Найти тему или имя…" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/></label><select className="ulx-select" aria-label="Порядок истории" value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}><option value="recent">По дате</option><option value="best">По баллу</option></select></div>}{notice && <div className="ulx-notice" role="status">{notice}</div>}{target && <div className="ulx-confirm" role="group" aria-label="Подтверждение удаления" onKeyDown={e => { if (e.key === 'Escape' && !busy) close(); }}><div className="ulx-confirm-text"><strong>Удалить результат?</strong><div className="ulx-caption">{str(target.raw.topic) || 'Тест'} · отменить удаление нельзя.</div></div><div className="ulx-confirm-actions"><button ref={cancelRef} type="button" className="ulx-btn" disabled={busy} onClick={close}>Отмена</button><button type="button" className="ulx-btn danger" disabled={busy} onClick={confirmDelete}>{busy ? 'Удаление…' : 'Удалить'}</button></div>{error && <p className="ulx-error" role="alert">{error}</p>}</div>}{visible.length ? visible.map(x => <div className="ulx-record" key={x.index}><span className="ulx-record-icon"><Icon name="tests" size={17}/></span><div><div className="ulx-record-title">{str(x.raw.topic) || 'Тест без названия'}</div><div className="ulx-record-meta">{dateLabel(x.raw)}{x.raw.student ? ` · ${str(x.raw.student)}` : ''}</div></div><span className="ulx-record-score">{x.value === null ? '—' : fmt(x.value)}{x.value !== null && <small>%</small>}</span>{canRemove ? <button type="button" className="ulx-icon-btn danger" title="Удалить результат" aria-label={`Удалить результат: ${str(x.raw.topic) || 'Тест'}`} disabled={busy} onClick={e => { opener.current=e.currentTarget; setTarget(x); setError(''); setNotice(''); }}><Icon name="trash" size={15}/></button> : <span/>}</div>) : <Empty title={query ? 'Ничего не найдено' : 'Пока нет попыток'} text={query ? 'Попробуй другое название темы.' : 'Результаты пройденных тестов появятся здесь.'} icon="tests"/>}{pages>1 && <div className="ulx-pagination"><span className="ulx-caption">{current+1} / {pages}</span><div><button type="button" className="ulx-btn" disabled={current===0} onClick={() => setPage(current-1)}>Назад</button><button type="button" className="ulx-btn" disabled={current===pages-1} onClick={() => setPage(current+1)}>Далее</button></div></div>}</div>;
    }
    function Training({ type, userData }) {
        const excel = userData?.excelProgress || {}; const typing = userData?.typingProgress || {}; const hot = userData?.hotkeyProgress || {};
        const content = {
            excel: { icon:'excel', title:'Увереннее в каждой таблице', text:'Уровень, опыт и завершённые уроки из твоего профиля.', count:num(excel.completedLessons), countLabel:'Завершено уроков', hint:'Чередуй новые уроки с повторением формул, которые пока даются сложнее.', metrics:[{label:'Уровень',value:num(excel.level,1),note:'Текущий уровень',icon:'excel'},{label:'Опыт',value:num(excel.xp),unit:'XP',note:'Накоплено в Excel',icon:'spark'},{label:'Уроки',value:num(excel.completedLessons),note:'Завершено',icon:'check'},{label:'Серия',value:num(excel.streak),unit:'дн.',note:'Сохранённая серия',icon:'bolt'}] },
            typing: { icon:'typing',title:'Точность превращается в скорость',text:'Твои личные рекорды и количество завершённых тренировок.',count:num(typing.testsCompleted),countLabel:'Завершено тренировок',hint:'Сначала держи ровный темп без ошибок, затем постепенно ускоряйся.',metrics:[{label:'Лучшая скорость',value:num(typing.maxWpm),unit:'WPM',note:'Личный рекорд',icon:'typing'},{label:'Максимальное комбо',value:num(typing.maxCombo),note:'Лучшая серия',icon:'bolt'},{label:'Тренировки',value:num(typing.testsCompleted),note:'Завершено',icon:'check'}] },
            hotkeys: {icon:'bolt',title:'Меньше движений. Больше навыка.',text:'Результаты тренировок сочетаний клавиш.',count:num(hot.sessionsPlayed),countLabel:'Завершено сессий',hint:'Повторяй сочетания небольшими группами и используй их в ежедневной работе.',metrics:[{label:'Лучший результат',value:num(hot.maxScore),note:'Очков за сессию',icon:'cup'},{label:'Сессии',value:num(hot.sessionsPlayed),note:'Всего сыграно',icon:'check'}] }
        }[type];
        return <><div style={{ '--ux-columns': content.metrics.length }}><Metrics items={content.metrics}/></div><div className="ulx-card"><div className="ulx-training"><div className="ulx-training-copy"><span className="ulx-badge"><Icon name={content.icon} size={14}/>Твой навык</span><h3>{content.title}</h3><p>{content.text}</p></div><div className="ulx-activity"><div className="ulx-section-head"><h3>{content.countLabel}</h3><span className="ulx-badge">{fmt(content.count)}</span></div><div className="ulx-dots" aria-hidden="true">{Array.from({length:24},(_,i) => <span key={i} className={`ulx-dot ${i >= content.count ? 'off' : ''}`} style={{animationDelay:`${i*18}ms`}}/>)}</div><p className="ulx-caption" style={{marginTop:12}}>{content.count ? content.count>24 ? `Показаны 24 из ${fmt(content.count)} завершённых занятий.` : 'Один цветной квадрат — одно завершённое занятие.' : 'Первая тренировка — начало твоего прогресса.'}</p></div></div><div className="ulx-hint"><Icon name="spark" size={17}/><span>{content.hint}</span></div></div></>;
    }
    function boardMetric(user, type) {
        return type === 'tests' ? testSummary(user.testHistory).average : type === 'excel' ? num(user.excelProgress?.xp) : type === 'typing' ? num(user.typingProgress?.maxWpm) : num(user.hotkeyProgress?.maxScore);
    }
    function userName(user) { return str(user.nickname || user.displayName) || str(user.email).split('@')[0] || 'Ученик'; }
    function initials(user) { return userName(user).split(/[\s._-]+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase(); }
    function hue(id) { return Array.from(str(id)).reduce((h,c) => (h*31+c.charCodeAt(0))%360,0); }
    function Leaderboard({ uid }) {
        const [category,setCategory] = useState('excel'); const [users,setUsers] = useState([]); const [status,setStatus] = useState('loading'); const [error,setError] = useState(''); const [retry,setRetry] = useState(0); const id = useId();
        useEffect(() => {
            let active=true; setStatus('loading'); setError('');
            Promise.resolve().then(() => {
                if (!window.db?.collection) throw new Error('База данных пока не подключена.');
                return window.db.collection('users').get();
            }).then(snap => { if (active) { setUsers(snap.docs.map(d => ({ ...d.data(), id:d.id }))); setStatus('ready'); } }).catch(e => {
                if (!active) return;
                setUsers([]); setStatus('error'); setError(String(e.code||'').includes('permission-denied') ? 'Рейтинг недоступен для этого аккаунта. Доступ определяется настройками платформы.' : 'Не удалось загрузить рейтинг. Проверь подключение и попробуй ещё раз.');
            });
            return () => { active=false; };
        }, [uid,retry]);
        const ranked=useMemo(() => {
            const sorted=users.map(u => ({user:u,value:boardMetric(u,category)})).filter(x => category==='tests' ? testSummary(x.user.testHistory).total>0 : x.value>0).sort((a,b) => b.value-a.value || str(a.user.id).localeCompare(str(b.user.id)));
            let rank=0; return sorted.map((x,i) => { if (i===0 || x.value!==sorted[i-1].value) rank=i+1; return {...x,rank}; });
        },[users,category]);
        const mine=ranked.findIndex(x => x.user.id===uid); const unit={excel:'XP',typing:'WPM',hotkeys:'очков',tests:'% · средний балл'}[category];
        const renderRow=({user,value,rank}) => <div className={`ulx-lb-row ${user.id===uid?'me':''}`} key={user.id}><span className={`ulx-rank ${rank<=3?'top':''}`}>{rank<=3 ? <span title={`${rank} место`}>{rank}</span> : rank}</span><span className="ulx-avatar" style={{'--hue':hue(user.id)}}>{initials(user)}</span><div><div className="ulx-lb-name">{userName(user)}{user.id===uid && <span className="ulx-badge">ВЫ</span>}</div><div className="ulx-caption">{user.role==='admin'?'Преподаватель':'Ученик'}</div></div><div className="ulx-lb-value">{fmt(value)}<small>{unit}</small></div></div>;
        return <div className="ulx-card" style={{marginTop:0}}><div className="ulx-section-head"><div><h3>Вместе двигаться интереснее</h3><p className="ulx-caption">Топ-50 · одинаковый результат — одинаковое место</p></div></div><div className="ulx-lb-top"><Tabs value={category} onChange={setCategory} tabs={TABS.slice(0,4).map(({id,label}) => ({id,label}))} label="Категория рейтинга" id={id}/><button type="button" className="ulx-icon-btn" title="Обновить рейтинг" aria-label="Обновить рейтинг" disabled={status==='loading'} onClick={() => setRetry(x=>x+1)}><Icon name="refresh" size={17}/></button></div><div role="tabpanel" id={`${id}-panel-${category}`} aria-labelledby={`${id}-${category}`} aria-busy={status==='loading'}>{status==='loading' ? <div role="status" aria-label="Загрузка рейтинга">{[0,1,2,3].map(i=><div className="ulx-skeleton" key={i}/>)}</div> : status==='error' ? <div role="alert"><Empty title="Рейтинг пока недоступен" text={error} icon="cup"><button type="button" className="ulx-btn" onClick={()=>setRetry(x=>x+1)}><Icon name="refresh" size={15}/>Повторить</button></Empty></div> : ranked.length ? <div className="ulx-enter" key={category}>{ranked.slice(0,50).map(renderRow)}{mine>=50 && <><p className="ulx-caption" style={{margin:'20px 0 8px'}}>Твоё место</p>{renderRow(ranked[mine])}</>}</div> : <Empty title="Первое место ещё свободно" text="В этой категории пока нет сохранённых результатов." icon="cup"/>}</div></div>;
    }
    function StatsView({ history, setHistory, userData }) {
        useStyles(); const uid=useUserId(); const id=useId(); const [activeTab,setActiveTab]=useState('tests');
        const source=Array.isArray(userData?.testHistory) ? userData.testHistory : list(history);
        const sourceSignature=useMemo(()=>fingerprint(source),[source]);
        const [override,setOverride]=useState(null); const mounted=useRef(true); const writeLock=useRef(false);
        useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
        const activeHistory=override && override.uid===uid && override.base===sourceSignature ? override.value : source;
        const rows=useMemo(()=>normalizeHistory(activeHistory),[activeHistory]); const summary=useMemo(()=>testSummary(activeHistory),[activeHistory]);
        async function removeEntry(target) {
            if(writeLock.current) throw new Error('Дождитесь завершения удаления.');
            writeLock.current=true;
            const actor=window.auth?.currentUser?.uid || null;
            const assertActor=()=>{if((window.auth?.currentUser?.uid||null)!==actor)throw new Error('Аккаунт изменился. Обновите страницу.');};
            try {
                if(actor!==uid)throw new Error('Аккаунт изменился. Обновите страницу.');
                let updated;
                if(actor){
                    if(!window.db?.runTransaction)throw new Error('База недоступна. Запись не удалена. Попробуйте позже.');
                    const ref=window.db.collection('users').doc(actor);
                    updated=await window.db.runTransaction(async transaction=>{
                        assertActor(); const snapshot=await transaction.get(ref); assertActor();
                        if(!snapshot.exists)throw new Error('Профиль не найден. Запись не удалена.');
                        const remote=snapshot.data()?.testHistory;
                        if(!Array.isArray(remote))throw new Error('История в профиле недоступна. Обновите страницу.');
                        const next=removeExact(remote,target); transaction.update(ref,{testHistory:next}); return next;
                    });
                }else{
                    if(typeof setHistory!=='function')throw new Error('Для изменения истории нужно войти в аккаунт.');
                    updated=removeExact(activeHistory,target);
                }
                assertActor();
                if(!mounted.current)return;
                setOverride({uid,base:sourceSignature,value:updated});
                if(typeof setHistory==='function')setHistory(updated);
                // Сохраняем прежний ключ для совместимости с родительским приложением.
                try{localStorage.setItem('test_history_v1',JSON.stringify(updated));}catch{}
            } finally {writeLock.current=false;}
        }
        const metrics=[
            {label:'Средний балл',value:summary.average,unit:'%',note:'По завершённым тестам',icon:'tests'},
            {label:'Лучший результат',value:summary.best,unit:'%',note:'Личный рекорд',icon:'cup'},
            {label:'Результат ≥ 50%',value:summary.total?Math.round(summary.passed/summary.total*100):0,unit:'%',note:`${summary.passed} из ${summary.total} попыток`,icon:'check'},
            {label:'Пройдено тестов',value:summary.total,note:'С корректным результатом',icon:'clock'}
        ];
        return <section className="ulx"><div className="ulx-shell ulx-enter"><header className="ulx-heading"><div><div className="ulx-eyebrow"><Icon name="spark" size={14}/>Ultimate LMS · Статистика</div><h2>Твой прогресс</h2><p className="ulx-subtitle">Каждая попытка — шаг к уверенному навыку.</p></div><div className="ulx-mark"><Icon name="excel" size={28}/></div></header><Tabs value={activeTab} onChange={setActiveTab} tabs={TABS} label="Раздел статистики" id={id}/><div key={`${uid}:${activeTab}`} className="ulx-enter" role="tabpanel" id={`${id}-panel-${activeTab}`} aria-labelledby={`${id}-${activeTab}`}>{activeTab==='tests'?<><Metrics items={metrics}/><BestChart rows={rows}/><HistoryList rows={rows} onRemove={removeEntry} canRemove={!!uid || typeof setHistory==='function'}/></>:activeTab==='leaderboard'?<Leaderboard uid={uid}/>:<Training type={activeTab} userData={userData}/>}</div></div></section>;
    }
    Object.assign(window,{TestQuestionCard,ReviewView,StatsView});
})();
