// Ultimate LMS — native chess section. Requires React and platform Firebase compat.
(function(){
const React=window.React;if(!React)throw Error('Подключите React перед модулем шахмат');
const MARKUP="\n<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><defs><linearGradient id=\"gw\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fffef8\"/><stop offset=\".55\" stop-color=\"#efe6cc\"/><stop offset=\"1\" stop-color=\"#c9bd9c\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#5a625a\"/><stop offset=\".55\" stop-color=\"#2b322c\"/><stop offset=\"1\" stop-color=\"#0f1311\"/></linearGradient></defs></svg>\n<div class=\"shell\">\n<header class=\"lms-header\">\n<a class=\"brand\" href=\"#\" aria-label=\"Ultimate LMS Chess\"><span class=\"brand-icon\" aria-hidden=\"true\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m7 18 2-7-4 2-2-3 5-5V2l4 3c7 0 9 8 6 13M6 18h13v4H6z\"/><path d=\"M10 8h.01\"/></svg></span><span class=\"brand-copy\"><span class=\"brand-kicker\">ULTIMATE LMS • ПРАКТИКА</span><strong>Шахматы</strong></span></a>\n<div class=\"head-actions\"><span class=\"badge\" id=\"connection\"><span class=\"badge-dot\"></span>Локальная игра</span><button id=\"sound\" class=\"icon\" title=\"Звук\" aria-label=\"Переключить звук\"></button></div>\n</header>\n<main>\n<section class=\"arena lms-surface\">\n<div class=\"arena-head\"><div><span class=\"eyebrow\">игровой модуль</span><h2>Шахматная партия</h2></div><span class=\"arena-note\">Ходы, часы и история уже встроены</span></div>\n<div class=\"player player-top\"><span class=\"avatar black\">♟</span><div class=\"player-label\"><strong id=\"topName\">Чёрные</strong><small id=\"topStatus\">Готовы к партии</small></div><span class=\"clock\" id=\"topClock\">10:00</span></div>\n<div class=\"board-wrap\"><div class=\"board-stage\"><div id=\"board\" role=\"group\" aria-label=\"Шахматная доска\"></div><div id=\"pieces\" aria-hidden=\"true\"></div></div></div>\n<div class=\"player player-bottom\"><span class=\"avatar\">♙</span><div class=\"player-label\"><strong id=\"bottomName\">Белые</strong><small id=\"bottomStatus\">Ваш следующий ход</small></div><span class=\"clock\" id=\"bottomClock\">10:00</span></div>\n<div class=\"board-tools\"><span id=\"status\"><i></i> Ход белых</span><div class=\"board-action-group\"><button class=\"icon\" id=\"flip\" aria-label=\"Перевернуть доску\" title=\"Перевернуть доску\"></button><button class=\"icon\" id=\"pgn\" aria-label=\"Скачать PGN\" title=\"Скачать партию\"></button></div></div>\n</section>\n<aside class=\"game-sidebar\">\n  <div class=\"sidebar-heading\">\n    <span class=\"eyebrow\">ULTIMATE LMS • ПРАКТИКА</span>\n    <h1>Играй по-своему.</h1>\n    <p>Выбери режим, настрой время и начинай партию.</p>\n  </div>\n\n  <section class=\"panel control-panel\">\n    <div class=\"tabs\" role=\"tablist\">\n      <button class=\"active\" data-tab=\"play\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 5 10 7-10 7z\"/></svg><span>Игра</span></button>\n      <button data-tab=\"history\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 11a9 9 0 1 1 2.6 7M3 4v7h7M12 7v5l3 2\"/></svg><span>Ходы</span><span id=\"moveCount\">0</span></button>\n      <button data-tab=\"analysis\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 19V5m0 14h16M8 14l4-5 4 3 4-7\"/></svg><span>Анализ</span></button>\n    </div>\n\n    <div id=\"playPane\">\n      <div class=\"player-row-card\">\n        <div class=\"field-copy\">\n          <strong class=\"ux-heading\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"3\"/><path d=\"M5 21v-3a7 7 0 0 1 14 0v3\"/></svg>Твой профиль</strong>\n          <small>Это имя увидит соперник</small>\n        </div>\n        <label class=\"sr-only\" for=\"name\">Имя игрока</label>\n        <input id=\"name\" maxlength=\"32\" placeholder=\"Введите имя\" value=\"Игрок\">\n      </div>\n\n      <div class=\"setup-section\">\n        <div class=\"section-heading\">\n          <div><strong class=\"ux-heading\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 7h16M4 17h16\"/><circle cx=\"9\" cy=\"7\" r=\"3\"/><circle cx=\"15\" cy=\"17\" r=\"3\"/></svg>Настройки партии</strong><small>Время и сложность</small></div>\n        </div>\n        <div class=\"setup-grid\">\n          <label class=\"setting-card\">\n            <span class=\"setting-label\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg>Время</span>\n            <select id=\"minutes\"><option value=\"3\">3 минуты</option><option value=\"5\">5 минут</option><option value=\"10\" selected>10 минут</option><option value=\"15\">15 минут</option></select>\n          </label>\n          <label class=\"setting-card\">\n            <span class=\"setting-label\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\"/></svg>Добавление</span>\n            <select id=\"increment\"><option value=\"0\">Без добавления</option><option value=\"2\">+2 секунды</option><option value=\"5\">+5 секунд</option></select>\n          </label>\n          <label class=\"setting-card bot-setting\">\n            <span class=\"setting-label\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 20v-6m7 6V9m7 11V4\"/></svg>Сложность бота</span>\n            <select id=\"botLevel\"><option value=\"1\">Лёгкий</option><option value=\"2\" selected>Средний</option><option value=\"3\">Сильный</option></select>\n          </label>\n        </div>\n      </div>\n\n      <div class=\"mode-section\">\n        <div class=\"section-heading mode-heading\">\n          <div><strong class=\"ux-heading\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 5 10 7-10 7z\"/></svg>Выбери режим</strong><small>Выбери один из трёх режимов</small></div>\n        </div>\n        <div class=\"mode-grid\">\n          <button id=\"create\" class=\"mode-card mode-online\"></button>\n          <div class=\"mode-row\">\n            <button id=\"botGame\" class=\"mode-card mode-bot\"></button>\n            <button id=\"local\" class=\"mode-card mode-local\"></button>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"join-section\">\n        <div class=\"join-heading\">\n          <div><strong class=\"ux-heading\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0\"/></svg>Войти по приглашению</strong><small>Вставь код комнаты друга</small></div>\n        </div>\n        <form id=\"joinForm\" class=\"join\">\n          <input id=\"room\" placeholder=\"КОД КОМНАТЫ\" aria-label=\"Код комнаты\" maxlength=\"12\">\n          <button class=\"icon join-button\" title=\"Войти в комнату\" aria-label=\"Войти в комнату\" id=\"join\"></button>\n        </form>\n        <div id=\"invite\" class=\"invite-card\" hidden>\n          <div class=\"invite-copy\"><span>Комната создана</span><p>Скопируй приглашение и отправь другу.</p></div>\n          <code id=\"roomCode\"></code>\n          <button id=\"copy\" class=\"secondary wide\"></button>\n        </div>\n      </div>\n\n      <div class=\"game-state\">\n        <div class=\"game-state-main\">\n          <span class=\"live-dot\"></span>\n          <div class=\"game-state-copy\">\n            <strong id=\"matchLabel\">За одной доской</strong>\n            <p id=\"matchDescription\">Два игрока на одном устройстве.</p>\n          </div>\n        </div>\n        <div class=\"game-state-actions\">\n          <button id=\"draw\" class=\"state-action\"></button>\n          <button id=\"resign\" class=\"state-action danger\"></button>\n        </div>\n        <button id=\"rematch\" class=\"primary wide\" hidden>Предложить реванш</button>\n      </div>\n    </div>\n\n    <div id=\"analysisPane\" hidden><div class=\"ux-pane-title\"><span class=\"ux-icon-box\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 19V5m0 14h16M8 14l4-5 4 3 4-7\"/></svg></span><div><strong>Разбор позиции</strong><small>Оценка, идеи и ключевые моменты</small></div></div>\n      <div class=\"an-eval\"><div class=\"an-bar\"><i id=\"anFill\"></i></div><b id=\"anScore\">0.0</b></div>\n      <div class=\"an-prog\" id=\"anProg\"><i></i><span>Анализ партии…</span></div>\n      <div class=\"an-card\" id=\"anCard\"></div>\n      <div class=\"an-nav\"><button data-nav=\"s\" aria-label=\"В начало\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M6 5h2v14H6zM20 5v14L9 12z\"/></svg></button><button data-nav=\"-\" aria-label=\"Назад\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M17 5v14L6 12z\"/></svg></button><button data-nav=\"p\" id=\"anPlay\" class=\"an-play\" aria-label=\"Авто\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M7 4v16l13-8z\"/></svg></button><button data-nav=\"+\" aria-label=\"Вперёд\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M7 5v14l11-7z\"/></svg></button><button data-nav=\"e\" aria-label=\"В конец\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M16 5h2v14h-2zM4 5v14l11-7z\"/></svg></button></div>\n      <svg id=\"anGraph\" viewBox=\"0 0 300 70\" preserveAspectRatio=\"none\"></svg>\n      <div class=\"an-sum\" id=\"anSum\"></div>\n      <div class=\"an-list\" id=\"anList\"></div>\n    </div>\n    <div id=\"historyPane\" hidden><div class=\"ux-pane-title\"><span class=\"ux-icon-box\"><svg class=\"ux-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 11a9 9 0 1 1 2.6 7M3 4v7h7M12 7v5l3 2\"/></svg></span><div><strong>История партии</strong><small>Каждый ход — часть твоей стратегии</small></div></div>\n      <div class=\"history-head\"><span>№</span><span>Белые</span><span>Чёрные</span></div>\n      <div id=\"moves\" class=\"moves\"></div>\n    </div>\n  </section>\n\n  <div class=\"hint lms-hint\">\n    <span class=\"hint-icon\">✦</span>\n    <div><strong>Управление</strong><p>Нажми на фигуру и выбери клетку или просто перетащи её.</p></div>\n  </div>\n</aside>\n</main>\n<footer>ULTIMATE LMS <span>•</span> CHESS MODULE</footer>\n</div>\n<div id=\"toast\" role=\"status\"></div><dialog id=\"dialog\"><div id=\"dialogBody\"></div></dialog>", CSS="@layer legacy {500;600;700;800&display=swap');\n.uc-root{color-scheme:dark;--bg:#050816;--bg-2:#0a0f24;--panel:#0d1731cc;--panel-2:#101d3ee3;--panel-3:#0b1227d8;--line:rgba(148,163,184,.16);--line-strong:rgba(148,163,184,.24);--text:#eff3ff;--muted:#95a1bf;--soft:#b7c1dd;--blue:#38bdf8;--indigo:#6366f1;--violet:#8b5cf6;--green:#34d399;--danger:#ff7a96;--danger-soft:#ffb0c1;--field:#0b1430;--field-2:#0e1a38;--light:#dbeafe;--dark:#4460a8;--shadow:0 32px 80px rgba(2,6,23,.42);--board-shadow:0 30px 90px rgba(3,7,18,.55);--radius-xl:28px;--radius-lg:22px;--radius-md:18px;--radius-sm:14px}\n.uc-root.light{color-scheme:light;--bg:#eef4ff;--bg-2:#dde9ff;--panel:rgba(255,255,255,.86);--panel-2:rgba(255,255,255,.96);--panel-3:rgba(244,247,255,.92);--line:rgba(71,85,105,.16);--line-strong:rgba(71,85,105,.24);--text:#10203f;--muted:#667594;--soft:#3e4d6e;--blue:#0ea5e9;--indigo:#4f46e5;--violet:#7c3aed;--green:#10b981;--danger:#e11d48;--danger-soft:#be123c;--field:#f8fbff;--field-2:#eef4ff;--light:#dbeafe;--dark:#7c93db;--shadow:0 24px 60px rgba(65,92,141,.16);--board-shadow:0 20px 60px rgba(65,92,141,.18)}\n*{box-sizing:border-box}\nbutton,input,select{font:inherit}button{cursor:pointer;color:inherit;display:inline-flex;align-items:center;justify-content:center;gap:10px;border:0;transition:background .2s,transform .18s,box-shadow .2s,opacity .2s}button:active:not(:disabled){transform:translateY(1px)}button:disabled{opacity:.48;cursor:not-allowed}button svg{width:19px;height:19px;flex-shrink:0}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--blue);outline-offset:2px}\n.shell{max-width:1380px;margin:0 auto;padding:20px 28px 26px}\nheader{display:flex;align-items:center;justify-content:space-between;padding:14px 0 22px}.brand{display:flex;align-items:center;gap:14px;color:var(--text);text-decoration:none}.brand-icon{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;font-size:26px;color:#fff;background:linear-gradient(135deg,rgba(56,189,248,.28),rgba(99,102,241,.32) 55%,rgba(139,92,246,.3));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 14px 28px rgba(0,0,0,.24)}.brand-copy{display:flex;flex-direction:column;gap:3px}.brand-kicker{font-size:11px;letter-spacing:2.2px;font-weight:800;color:#7dd3fc}.brand-copy strong{font-size:18px;letter-spacing:.2px}.head-actions{display:flex;align-items:center;gap:10px}.badge{display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border-radius:999px;background:var(--panel);border:1px solid var(--line);font-size:12px;color:var(--soft);box-shadow:var(--shadow)}.badge-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(52,211,153,.16)}.icon{width:44px;height:44px;border-radius:16px;background:var(--panel);border:1px solid var(--line);color:var(--soft);box-shadow:var(--shadow)}.icon:hover{background:rgba(255,255,255,.06);color:var(--text)}\nmain{display:grid;grid-template-columns:minmax(0,1.08fr) 410px;gap:26px;align-items:start}.lms-surface,.panel{backdrop-filter:blur(18px);background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02)),var(--panel);border:1px solid var(--line);box-shadow:var(--shadow)}.lms-surface{border-radius:32px;padding:22px}.panel{border-radius:var(--radius-xl);padding:16px}\n.arena-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:16px}.eyebrow{font-size:11px;letter-spacing:2.2px;font-weight:800;color:#7dd3fc;text-transform:uppercase}.arena-head h2{margin:8px 0 0;font-size:28px;line-height:1.1;letter-spacing:-.03em}.arena-note{padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid var(--line);font-size:12px;color:var(--muted)}\n.player{display:flex;align-items:center;gap:12px}.player+.board-wrap,.board-wrap+.player{margin-top:14px}.avatar{display:grid;place-items:center;width:46px;height:46px;border-radius:16px;background:linear-gradient(180deg,#e9f0ff,#d2defd);color:#21409a;font-size:32px;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}.avatar.black{background:linear-gradient(180deg,#263761,#14203e);color:#eff5ff}.player-label{display:flex;flex-direction:column;gap:4px;min-width:0}.player-label strong{font-size:14px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.player-label small{font-size:12px;color:var(--muted)}.clock{margin-left:auto;min-width:108px;text-align:center;padding:12px 14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02)),var(--panel-3);border:1px solid var(--line);font-size:28px;font-weight:800;letter-spacing:.04em;font-variant-numeric:tabular-nums;box-shadow:0 12px 26px rgba(0,0,0,.18)}.clock.active{background:linear-gradient(135deg,rgba(56,189,248,.23),rgba(99,102,241,.3));color:#fff;box-shadow:0 0 0 1px rgba(125,211,252,.18),0 12px 30px rgba(79,70,229,.24)}.clock.low{color:#ff9ab0}.board-wrap{position:relative;width:100%;aspect-ratio:1;border-radius:26px;overflow:hidden;isolation:isolate;box-shadow:var(--board-shadow);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02)),var(--panel-3);padding:12px}.board-wrap:before{content:'';position:absolute;inset:12px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.06);pointer-events:none}.board-stage{position:relative;width:100%;height:100%;border-radius:18px;overflow:hidden}#board{display:grid;grid-template-columns:repeat(8,1fr);height:100%}.square{position:relative;min-width:0;padding:0;background:linear-gradient(180deg,#dce9ff,#d4e3ff);color:#4f5e85;border:0}.square.dark{background:linear-gradient(180deg,#5978d8,#3e56a3);color:#eaf0ff}.square.last{background:#d6e0ff}.square.dark.last{background:#546ecb}.square.selected{background:#f6f9ff;box-shadow:inset 0 0 0 4px rgba(56,189,248,.42)}.square.dark.selected{background:#6e85d8}.square.check{background:radial-gradient(circle at center,#ff7897 0,rgba(255,120,151,.76) 42%,rgba(255,120,151,.24) 72%)}.square.target:after{content:'';width:22%;height:22%;border-radius:50%;background:rgba(15,23,42,.22)}.square.target.capture:after{position:absolute;inset:6%;width:auto;height:auto;border:4px solid rgba(15,23,42,.26);background:none}.coordinate{position:absolute;font-size:clamp(9px,1vw,12px);font-weight:800;pointer-events:none;opacity:.8}.rank{top:6px;left:7px}.file{bottom:5px;right:7px}#pieces{position:absolute;inset:0;pointer-events:none}.piece{width:12.5%;height:12.5%;position:absolute;left:0;top:0;display:grid;place-items:center;transition:filter .16s ease;filter:drop-shadow(0 10px 12px rgba(15,23,42,.18))}.piece svg{width:86%;height:86%;overflow:visible}.piece.lifted,.piece.dragging{filter:drop-shadow(0 16px 16px rgba(15,23,42,.32))}.board-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px}.board-action-group{display:flex;gap:10px}#status{font-size:13px;font-weight:700;display:flex;align-items:center;gap:10px;min-height:24px}#status i,.live-dot{width:8px;height:8px;background:var(--green);border-radius:50%;display:inline-block;box-shadow:0 0 0 5px rgba(52,211,153,.16)}\naside{display:flex;flex-direction:column;gap:14px}.lms-intro{padding:6px 4px 2px;background:none;border:none;box-shadow:none}.lms-intro h1{margin:10px 0 12px;font-size:55px;line-height:.98;letter-spacing:-.04em;font-weight:800}.lms-intro h1 em{font-style:normal;background:linear-gradient(90deg,var(--blue),var(--violet));-webkit-background-clip:text;background-clip:text;color:transparent}.lms-intro p{margin:0;max-width:36ch;color:var(--muted);font-size:15px;line-height:1.65}\n.play-panel{padding:16px 16px 18px;background:linear-gradient(180deg,rgba(15,23,52,.92),rgba(10,18,42,.88));border-radius:28px}.tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:8px;border-radius:22px;background:rgba(255,255,255,.04);border:1px solid var(--line);margin-bottom:16px}.tabs button{min-height:42px;padding:10px 16px;border-radius:16px;background:none;color:var(--muted);font-size:14px;font-weight:800;position:relative}.tabs button.active{background:linear-gradient(180deg,#102147,#0e1a37);border:1px solid rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.05);color:var(--text)}.tabs span{font-size:11px;background:rgba(99,102,241,.22);color:#dbe6ff;padding:2px 7px;border-radius:999px}\n.form-block{padding:12px 2px 16px;border-top:1px solid var(--line)}.form-block:first-child{padding-top:2px;border-top:0}.field-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:10px}.field-heading span{font-size:13px;font-weight:800}.field-heading small{font-size:11px;color:var(--muted)}.field-heading.compact{margin-bottom:8px}.field-label{display:block}.sr-only{position:absolute!important;width:1px!important;height:1px!important;clip:rect(1px,1px,1px,1px)!important;overflow:hidden!important;white-space:nowrap!important}.settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0}.settings label,.bot-field{display:flex;flex-direction:column;gap:8px}.settings label.full{grid-column:1/-1}.settings label>span,.bot-field>span{font-size:11px;font-weight:700;color:var(--soft)}\ninput,select{width:100%;min-width:0;height:44px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.015)),var(--field);border:1px solid var(--line);padding:0 14px;color:var(--text);font-size:14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}input::placeholder{color:#7382a6}select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,#7f91bb 50%),linear-gradient(135deg,#7f91bb 50%,transparent 50%);background-position:calc(100% - 18px) 18px,calc(100% - 12px) 18px;background-size:6px 6px,6px 6px;background-repeat:no-repeat;padding-right:34px}\n.mode-grid{display:grid;grid-template-columns:1fr;gap:10px}.primary,.secondary,.tertiary{width:100%;min-height:46px;border-radius:16px;padding:13px 16px;font-weight:800;font-size:14px}.primary{background:linear-gradient(90deg,var(--blue),var(--violet));color:#fff;box-shadow:0 12px 28px rgba(99,102,241,.28)}.primary:hover{filter:brightness(1.05)}.secondary{background:rgba(255,255,255,.05);border:1px solid var(--line-strong);color:var(--text)}.secondary:hover,.tertiary:hover{background:rgba(255,255,255,.07)}.tertiary{background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.025));border:1px solid var(--line);color:var(--text)}.wide{width:100%}.divider{display:flex;align-items:center;gap:14px;color:var(--muted);font-size:11px;font-weight:700;margin:16px 0 10px}.divider:before,.divider:after{content:'';height:1px;background:var(--line);flex:1}.join-block{padding-top:2px}.join{display:grid;grid-template-columns:minmax(0,1fr) 52px;gap:10px}.join input{text-transform:uppercase;letter-spacing:.06em}.join-button{width:52px;height:44px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));border:1px solid var(--line);box-shadow:none}.invite-card{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin-top:12px;padding:16px;border-radius:20px;background:linear-gradient(180deg,rgba(56,189,248,.08),rgba(139,92,246,.08));border:1px solid rgba(125,211,252,.15)}.invite-copy span{display:block;font-size:13px;font-weight:800;margin-bottom:4px}.invite-copy p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}code{display:inline-flex;align-items:center;justify-content:center;min-width:110px;padding:10px 14px;border-radius:14px;background:rgba(5,10,26,.26);border:1px solid rgba(255,255,255,.1);color:#a5f3fc;letter-spacing:.16em;font-size:13px;font-weight:800}\n.history-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:4px 2px 12px}.history-head span{font-weight:800}.history-head small{font-size:11px;color:var(--muted)}.moves{min-height:220px;max-height:360px;overflow:auto;padding-right:2px}.moves p{margin:0;color:var(--muted);font-size:13px}.move-row{display:grid;grid-template-columns:44px 1fr 1fr;padding:12px 10px;font-size:13px;border-radius:14px;margin-bottom:6px;background:rgba(255,255,255,.03)}.move-row:hover{background:rgba(255,255,255,.05)}.move-row span:first-child{color:var(--muted);font-size:11px;font-weight:700}\n.match-panel{background:linear-gradient(180deg,rgba(15,23,52,.92),rgba(10,18,42,.88));padding:16px 16px 18px}.section-title{display:flex;align-items:flex-start;gap:10px}.section-title strong{display:block;font-size:18px;line-height:1.1}.section-title small{display:block;margin-top:4px;font-size:11px;color:var(--muted)}.match-panel>p{margin:14px 0 18px;color:var(--muted);font-size:13px;line-height:1.65}.match-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.danger{color:var(--danger-soft)}.danger svg{color:var(--danger)}.lms-hint{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:22px;border:1px dashed rgba(125,211,252,.18);background:rgba(8,15,36,.42)}.hint-icon{width:28px;height:28px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(56,189,248,.18),rgba(139,92,246,.22));color:#c4b5fd;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.lms-hint strong{display:block;margin-bottom:4px;font-size:13px}.lms-hint p{margin:0;font-size:12px;color:var(--muted);line-height:1.55}\n#toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);padding:14px 18px;border-radius:18px;border:1px solid var(--line);background:var(--panel-2);color:var(--text);box-shadow:var(--shadow);opacity:0;pointer-events:none;transition:.25s;z-index:40;max-width:min(92vw,560px);font-size:13px}#toast.show{opacity:1;transform:translate(-50%,0)}dialog{border:1px solid rgba(255,255,255,.08);border-radius:34px;background:linear-gradient(180deg,rgba(14,23,36,.96),rgba(18,29,23,.94));color:var(--text);padding:28px;max-width:540px;width:min(92vw,540px);box-shadow:0 40px 120px rgba(0,0,0,.55)}dialog::backdrop{background:rgba(3,6,20,.58);backdrop-filter:blur(12px)}dialog[open]{animation:dialogReveal .25s ease-out}.dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.dialog-head h2,dialog h2{margin:0 0 8px;font-size:28px;line-height:1.08;letter-spacing:-.03em}dialog p{margin:0 0 22px;color:#b4bea8;font-size:14px;line-height:1.55}.dialog-actions{display:flex;gap:10px}.dialog-actions button{flex:1}.promotion{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.promotion button{min-height:52px;padding:8px 10px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.05);position:relative}.promotion button:first-child{box-shadow:0 0 0 2px #a3e635 inset,0 0 0 1px rgba(163,230,53,.22)}.promotion button:hover{background:rgba(255,255,255,.12);transform:translateY(-1px)}.promotion svg{width:28px;height:28px}.promotion-labels{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:8px}.promotion-labels span{text-align:center;font-size:11px;color:var(--muted)}.cap{display:block;min-height:17px;font-size:16px;letter-spacing:-3px;line-height:1;color:var(--muted)}.cap b{font-size:11px;letter-spacing:0;margin-left:10px;color:#93c5fd}footer{padding:20px 4px 0;font-size:11px;color:var(--muted);letter-spacing:1.3px;text-transform:uppercase}footer span{margin:0 8px;color:#7dd3fc}\n@keyframes reveal{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes land{50%{filter:drop-shadow(0 12px 16px rgba(15,23,42,.34))}}@keyframes dialogReveal{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}\n.arena,aside{animation:reveal .55s both}aside{animation-delay:.08s}\n@media(min-width:1380px){main{grid-template-columns:minmax(0,1fr) 430px}}\n@media(max-width:1120px){main{grid-template-columns:minmax(0,1fr) 390px}.lms-intro h1{font-size:48px}.arena-head h2{font-size:24px}}\n@media(max-width:900px){.shell{padding:14px 18px 22px}header{padding-bottom:18px}main{grid-template-columns:1fr;gap:18px}.lms-intro h1{font-size:42px}.lms-surface{padding:18px}.arena-note{display:none}}\n@media(max-width:680px){.shell{padding:12px 12px 18px}.brand-copy strong{font-size:16px}.badge{display:none}.lms-intro h1{font-size:34px}.lms-intro p{font-size:14px}.tabs{padding:6px;gap:8px}.tabs button{font-size:13px}.settings{grid-template-columns:1fr}.match-actions{grid-template-columns:1fr}.clock{font-size:22px;min-width:92px;padding:10px 12px}.player{gap:10px}.player-label strong{font-size:13px}.player-label small{font-size:11px}.board-wrap{padding:9px;border-radius:22px}.board-wrap:before{inset:9px}.icon{width:42px;height:42px}.join{grid-template-columns:minmax(0,1fr) 48px}.dialog-head h2,dialog h2{font-size:24px}.promotion{grid-template-columns:repeat(2,minmax(0,1fr))}.promotion-labels{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:6px}}\n@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}\n/* ===== ULTIMATE LMS SIDEBAR REWORK V3 ===== */\n[hidden]{display:none!important}\n.shell{max-width:1500px;padding:18px 26px 28px}\nmain{grid-template-columns:minmax(720px,1fr) 470px;gap:30px;align-items:start}\n.game-sidebar{display:flex;flex-direction:column;gap:14px;position:static;top:auto;align-self:start}\n.board-wrap{max-width:680px;margin-left:auto;margin-right:auto}\n\n.sidebar-heading{padding:8px 4px 4px}\n.sidebar-heading h1{margin:8px 0 6px;font-size:34px;line-height:1.04;letter-spacing:-.045em;font-weight:800}\n.sidebar-heading p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}\n.control-panel{padding:14px;border-radius:28px;background:linear-gradient(180deg,rgba(17,27,60,.96),rgba(9,16,39,.96));border-color:rgba(125,145,190,.18);overflow:visible}\n.tabs{margin:0 0 14px;padding:6px;border-radius:17px;gap:6px;background:rgba(4,10,27,.42)}\n.tabs button{min-height:42px;border-radius:12px;font-size:13px}\n.tabs button.active{background:linear-gradient(135deg,rgba(56,189,248,.16),rgba(99,102,241,.16));box-shadow:inset 0 0 0 1px rgba(125,211,252,.14),0 7px 18px rgba(2,6,23,.2)}\n.player-row-card{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(0,1.2fr);align-items:center;gap:14px;padding:15px;border-radius:19px;background:rgba(255,255,255,.035);border:1px solid var(--line)}\n.field-copy strong,.section-heading strong,.join-heading strong{display:block;font-size:13px;line-height:1.3}\n.field-copy small,.section-heading small,.join-heading small{display:block;margin-top:4px;color:var(--muted);font-size:10.5px;line-height:1.35}\n.player-row-card input{height:44px;background:rgba(4,10,27,.36)}\n.setup-section,.mode-section,.join-section{padding:17px 2px 0}\n.section-heading,.join-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;padding:0 2px}\n.setup-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}\n.setting-card{display:block;position:relative;padding:11px 11px 10px;border-radius:17px;background:rgba(255,255,255,.035);border:1px solid var(--line);transition:.2s}\n.setting-card:focus-within{border-color:rgba(56,189,248,.35);box-shadow:0 0 0 3px rgba(56,189,248,.07)}\n.setting-label{display:block;margin:0 2px 7px;color:var(--muted);font-size:10px;font-weight:700}\n.setting-card select{height:34px;padding:0 26px 0 0;border:0;background-color:transparent;background-position:calc(100% - 10px) 13px,calc(100% - 5px) 13px;font-size:12px;font-weight:700;box-shadow:none}\n.setting-card select option{background:#0f1730;color:#eff3ff;font-weight:700;padding:10px}\n.uc-root.light .setting-card select option{background:#ffffff;color:#10203f}\n.setting-card.enhanced-select select{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;clip:rect(0 0 0 0)!important;overflow:hidden!important}\n.mode-heading{margin-top:1px}\n.mode-grid{display:grid;gap:9px}\n.mode-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}\n.mode-card{width:100%;border:1px solid var(--line);background:rgba(255,255,255,.035);border-radius:18px;padding:0 15px;min-height:62px;justify-content:flex-start;text-align:left;box-shadow:none}\n.mode-card svg{width:22px;height:22px}\n.mode-card>span{display:flex;flex-direction:column;gap:2px;align-items:flex-start}\n.mode-card strong{font-size:13px;line-height:1.2}.mode-card small{font-size:10px;color:var(--muted);font-weight:600;line-height:1.3}\n.mode-card:hover{transform:translateY(-1px);background:rgba(255,255,255,.055);border-color:rgba(125,145,190,.28)}\n.mode-online{min-height:70px;color:#fff;background:linear-gradient(115deg,rgba(14,165,233,.92),rgba(99,102,241,.94) 58%,rgba(139,92,246,.96));border-color:transparent;box-shadow:0 15px 28px rgba(74,76,220,.2)}\n.mode-online small{color:rgba(255,255,255,.74)}.mode-online:hover{background:linear-gradient(115deg,#1fb6ef,#6265ef 58%,#8b5cf6)}\n.mode-bot svg{color:#c4b5fd}.mode-local svg{color:#7dd3fc}\n.join-section{margin-top:16px;padding:15px;border-radius:19px;background:rgba(255,255,255,.025);border:1px solid var(--line)}\n.join-heading{margin-bottom:10px;padding:0}.join{grid-template-columns:minmax(0,1fr) 48px;gap:8px}.join input{height:46px;border-radius:14px;background:rgba(4,10,27,.38)}.join-button{width:48px;height:46px;border-radius:14px;background:rgba(255,255,255,.06);box-shadow:none}\n.invite-card{margin-top:10px;grid-template-columns:1fr auto;gap:10px;padding:13px 14px;border-radius:16px}.invite-card .wide{grid-column:1/-1;min-height:40px}.invite-card code{min-width:104px}\n.game-state{margin-top:12px;padding:14px;border-radius:19px;background:linear-gradient(180deg,rgba(52,211,153,.055),rgba(255,255,255,.025));border:1px solid rgba(52,211,153,.13)}\n.game-state-main{display:flex;align-items:flex-start;gap:10px}.game-state-main .live-dot{margin-top:5px;flex:0 0 auto}.game-state-copy{min-width:0}.game-state-copy strong{display:block;font-size:13px}.game-state-copy p{margin:4px 0 0;color:var(--muted);font-size:10.5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.game-state-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.state-action{min-height:39px;border-radius:13px;background:rgba(255,255,255,.045);border:1px solid var(--line);font-size:11px;font-weight:800}.state-action:hover{background:rgba(255,255,255,.07)}\n.game-state #rematch{margin-top:9px;min-height:41px;border-radius:13px}\n.lms-hint{padding:12px 14px;border-radius:18px}.lms-hint p{font-size:10.5px}.hint-icon{width:26px;height:26px;border-radius:9px}\n.history-head{padding:8px 4px 14px}.moves{min-height:420px;max-height:620px}\n/* Promotion modal */\ndialog{max-width:500px;padding:24px;border-radius:28px;background:linear-gradient(180deg,#111a34,#0a1229);border:1px solid rgba(148,163,184,.18)}\ndialog p{color:var(--muted)}.promotion{grid-template-columns:repeat(4,1fr);gap:10px}.promotion button{min-height:94px;border-radius:18px;display:flex;flex-direction:column;gap:7px;background:rgba(255,255,255,.045);border:1px solid var(--line);box-shadow:none!important}.promotion button:hover{background:rgba(255,255,255,.075);border-color:rgba(125,211,252,.26)}.promotion button:first-child{background:linear-gradient(180deg,rgba(56,189,248,.13),rgba(99,102,241,.11));border-color:rgba(125,211,252,.32);box-shadow:0 0 0 1px rgba(56,189,248,.08) inset!important}.promotion svg{width:42px;height:42px}.promotion .piece-name{font-size:11px;font-weight:800;color:var(--soft)}.promotion-labels{display:none}\n\n/* Polished custom selects */\n.smart-select{position:relative;z-index:5}\n.smart-select.open{z-index:80}\n.smart-select-trigger{width:100%;height:35px;padding:0 2px;background:transparent;border:0;color:var(--text);justify-content:space-between;font-size:12px;font-weight:800;text-align:left;box-shadow:none}\n.smart-select-trigger:hover{color:#fff}\n.smart-select-trigger .select-chevron{width:16px;height:16px;color:#8fa2cf;transition:transform .18s ease}\n.smart-select.open .select-chevron{transform:rotate(180deg);color:#7dd3fc}\n.smart-select-menu{position:absolute;top:calc(100% + 8px);left:-8px;right:-8px;padding:7px;border-radius:15px;background:rgba(9,16,39,.98);border:1px solid rgba(125,145,190,.22);box-shadow:0 18px 44px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(18px);opacity:0;transform:translateY(-6px) scale(.985);pointer-events:none;transition:opacity .16s ease,transform .16s ease}\n.smart-select.open .smart-select-menu{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}\n.smart-select-option{width:100%;min-height:38px;padding:9px 10px;border-radius:11px;justify-content:space-between;background:transparent;color:#cbd5ec;font-size:12px;font-weight:700;text-align:left}\n.smart-select-option:hover,.smart-select-option.focused{background:rgba(56,189,248,.09);color:#fff}\n.smart-select-option.selected{background:linear-gradient(135deg,rgba(56,189,248,.15),rgba(99,102,241,.16));color:#fff;box-shadow:inset 0 0 0 1px rgba(125,211,252,.14)}\n.smart-select-option .option-check{width:17px;height:17px;border-radius:6px;display:grid;place-items:center;background:rgba(56,189,248,.16);color:#7dd3fc;opacity:0;font-size:11px}\n.smart-select-option.selected .option-check{opacity:1}\n\n/* Full light-theme treatment for the whole control/navigation area */\n.uc-root.light .control-panel{background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(246,249,255,.96));border-color:rgba(71,85,105,.14);box-shadow:0 24px 60px rgba(78,101,148,.14)}\n.uc-root.light .tabs{background:#edf3ff;border-color:rgba(71,85,105,.13)}\n.uc-root.light .tabs button{color:#71809f}\n.uc-root.light .tabs button.active{background:#fff;color:#10203f;border-color:rgba(79,70,229,.14);box-shadow:0 7px 20px rgba(83,103,152,.12),inset 0 0 0 1px rgba(255,255,255,.8)}\n.uc-root.light .tabs span{background:#e2e7ff;color:#4f46e5}\n.uc-root.light .player-row-card,.uc-root.light .setting-card,.uc-root.light .mode-card,.uc-root.light .join-section{background:rgba(255,255,255,.76);border-color:rgba(71,85,105,.13)}\n.uc-root.light .player-row-card input,.uc-root.light .join input{background:#f7f9ff;border-color:rgba(71,85,105,.14);color:#10203f;box-shadow:inset 0 1px 2px rgba(71,85,105,.04)}\n.uc-root.light input::placeholder{color:#8a98b3}\n.uc-root.light .setting-label,.uc-root.light .field-copy small,.uc-root.light .section-heading small,.uc-root.light .join-heading small,.uc-root.light .mode-card small,.uc-root.light .game-state-copy p,.uc-root.light .lms-hint p{color:#7583a0}\n.uc-root.light .smart-select-trigger{color:#17284b}\n.uc-root.light .smart-select-trigger:hover{color:#0f1f3e}\n.uc-root.light .smart-select-menu{background:rgba(255,255,255,.98);border-color:rgba(71,85,105,.14);box-shadow:0 18px 44px rgba(76,95,132,.18),inset 0 1px 0 rgba(255,255,255,.8)}\n.uc-root.light .smart-select-option{color:#405071}\n.uc-root.light .smart-select-option:hover,.uc-root.light .smart-select-option.focused{background:#eef5ff;color:#152546}\n.uc-root.light .smart-select-option.selected{background:linear-gradient(135deg,#e8f7ff,#eeebff);color:#243a70;box-shadow:inset 0 0 0 1px rgba(79,70,229,.11)}\n.uc-root.light .smart-select-option .option-check{background:#e3f5ff;color:#0ea5e9}\n.uc-root.light .mode-card{color:#17284b}\n.uc-root.light .mode-card:hover{background:#f5f8ff;border-color:rgba(79,70,229,.18)}\n.uc-root.light .mode-online{color:#fff;background:linear-gradient(115deg,#0ea5e9,#6366f1 58%,#8b5cf6);border-color:transparent;box-shadow:0 15px 30px rgba(79,70,229,.18)}\n.uc-root.light .mode-online small{color:rgba(255,255,255,.82)}\n.uc-root.light .join-button{background:#eef3ff;border-color:rgba(71,85,105,.12);color:#4b5f86}\n.uc-root.light .game-state{background:linear-gradient(180deg,rgba(16,185,129,.075),rgba(255,255,255,.72));border-color:rgba(16,185,129,.14)}\n.uc-root.light .state-action{background:#f8faff;border-color:rgba(71,85,105,.13);color:#283959}\n.uc-root.light .state-action:hover{background:#eef4ff}\n.uc-root.light .lms-hint{background:rgba(255,255,255,.64);border-color:rgba(79,70,229,.16)}\n.uc-root.light dialog{background:linear-gradient(180deg,#ffffff,#f5f8ff);border-color:rgba(71,85,105,.14);box-shadow:0 30px 90px rgba(54,72,109,.22)}\n.uc-root.light dialog p{color:#6f7e9b}\n.uc-root.light .promotion button{background:#f4f7ff;border-color:rgba(71,85,105,.12)}\n.uc-root.light .promotion button:hover{background:#edf4ff;border-color:rgba(14,165,233,.22)}\n.uc-root.light .promotion button:first-child{background:linear-gradient(180deg,#e8f7ff,#eeebff);border-color:rgba(14,165,233,.22)}\n.uc-root.light .promotion .piece-name{color:#3c4e70}\n.uc-root.light .mode-online:hover{background:linear-gradient(115deg,#1fb6ef,#6265ef 58%,#8b5cf6);color:#fff;border-color:transparent}\n.uc-root.light .mode-online:hover small{color:rgba(255,255,255,.82)}\n.uc-root.light .brand-icon{background:linear-gradient(135deg,#38bdf8,#6366f1 58%,#8b5cf6);color:#fff;border-color:rgba(99,102,241,.18);box-shadow:0 10px 24px rgba(79,70,229,.18),inset 0 1px 0 rgba(255,255,255,.28)}\n\n\n@media(max-width:1180px){main{grid-template-columns:minmax(620px,1fr) 430px;gap:22px}.sidebar-heading h1{font-size:30px}}\n@media(max-width:980px){.game-sidebar{position:static}.shell{padding:14px 16px 22px}main{grid-template-columns:1fr}.sidebar-heading{padding-top:0}.sidebar-heading h1{font-size:32px}.control-panel{max-width:none}.setup-grid{grid-template-columns:repeat(3,1fr)}.board-wrap{max-width:min(680px,100%)}}\n@media(max-width:620px){.setup-grid{grid-template-columns:1fr}.player-row-card{grid-template-columns:1fr}.mode-row{grid-template-columns:1fr}.sidebar-heading h1{font-size:28px}.promotion{grid-template-columns:repeat(2,1fr)}}\n\n/* ===== POLISHED MOTION + MOBILE BOARD ===== */\n.square.selected{animation:ucSelectSquare .18s ease-out}\n.square.target:after{animation:ucTargetIn .16s cubic-bezier(.2,.8,.25,1) both}\n.square.target.capture:after{animation:ucCaptureTargetIn .18s cubic-bezier(.2,.8,.25,1) both}\n.mode-card svg,.icon svg,.tabs button{transition:transform .18s ease,color .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease}\n.mode-card:hover:not(:disabled) svg{transform:translateY(-1px) scale(1.035)}\n.icon:hover:not(:disabled) svg{transform:scale(1.055)}\n.tabs button:active{transform:scale(.992)}\n.capture-pulse{position:absolute;width:12.5%;height:12.5%;pointer-events:none;z-index:4;display:grid;place-items:center}\n.capture-pulse:after{content:'';width:54%;height:54%;border-radius:50%;border:2px solid rgba(125,211,252,.55);box-shadow:0 0 0 5px rgba(99,102,241,.08);animation:ucCapturePulse .3s ease-out forwards}\n@keyframes ucSelectSquare{from{box-shadow:inset 0 0 0 1px rgba(56,189,248,.1)}to{box-shadow:inset 0 0 0 4px rgba(56,189,248,.42)}}\n@keyframes ucTargetIn{from{opacity:0;transform:scale(.35)}to{opacity:1;transform:scale(1)}}\n@keyframes ucCaptureTargetIn{from{opacity:0;transform:scale(.78)}to{opacity:1;transform:scale(1)}}\n@keyframes ucCapturePulse{0%{opacity:.95;transform:scale(.55)}100%{opacity:0;transform:scale(1.45)}}\n\n@media(max-width:680px){\n  .shell{padding-left:6px!important;padding-right:6px!important}\n  .lms-surface{padding:12px 7px 14px!important;border-radius:24px}\n  .arena-head{padding-left:5px;padding-right:5px;margin-bottom:10px}\n  .player{padding-left:4px;padding-right:4px}\n  .board-wrap{width:calc(100% + 4px)!important;max-width:none!important;margin-left:-2px!important;margin-right:-2px!important;padding:6px!important;border-radius:19px!important}\n  .board-wrap:before{inset:6px!important;border-radius:15px!important}\n  .board-stage{border-radius:13px!important}\n  .piece svg{width:92%;height:92%}\n  .coordinate{font-size:10px}\n  .board-tools{padding:0 4px;margin-top:10px}\n}\n@media(max-width:420px){\n  .shell{padding-left:3px!important;padding-right:3px!important}\n  .lms-surface{padding-left:5px!important;padding-right:5px!important}\n  .board-wrap{width:calc(100% + 6px)!important;margin-left:-3px!important;margin-right:-3px!important;padding:5px!important}\n  .board-wrap:before{inset:5px!important}\n  .piece svg{width:93%;height:93%}\n}\n@media(prefers-reduced-motion:reduce){\n  .square.selected,.square.target:after,.square.target.capture:after,.capture-pulse:after{animation:none!important}\n  .mode-card svg,.icon svg,.tabs button{transition:none!important}\n}\n\n/* Refined move feedback: short and restrained */\n.capture-pulse:after{border-color:rgba(125,211,252,.42)!important;box-shadow:0 0 0 4px rgba(99,102,241,.055)!important}\n.square.last{transition:background .18s ease,box-shadow .18s ease}\n\n/* ===== PREMIUM ANIMATIONS (no piece wobble on click) ===== */\n.fx{position:absolute;width:12.5%;height:12.5%;pointer-events:none;z-index:5;display:grid;place-items:center}\n.fx:before,.fx:after{content:'';position:absolute;border-radius:50%;opacity:0}\n/* landing ripple */\n.fx-land:before{width:62%;height:62%;border:2px solid rgba(125,211,252,.6);animation:ucRing .52s cubic-bezier(.15,.7,.2,1) .25s both}\n.fx-land:after{width:84%;height:84%;background:radial-gradient(circle,rgba(255,255,255,.38),rgba(125,211,252,.12) 45%,transparent 68%);animation:ucGlow .5s ease-out .25s both}\n@keyframes ucRing{0%{opacity:0;transform:scale(.45)}18%{opacity:.9}100%{opacity:0;transform:scale(1.55)}}\n@keyframes ucGlow{0%{opacity:0;transform:scale(.6)}25%{opacity:1}100%{opacity:0;transform:scale(1.25)}}\n/* check / mate rings */\n.fx-check:before,.fx-check:after{width:68%;height:68%;border:3px solid rgba(255,92,128,.85)}\n.fx-check:before{animation:ucRing .85s cubic-bezier(.15,.7,.2,1) .3s both}\n.fx-check:after{animation:ucRing .85s cubic-bezier(.15,.7,.2,1) .5s both}\n.fx-mate:before,.fx-mate:after{width:68%;height:68%;border:3px solid rgba(255,92,128,.9)}\n.fx-mate:before{animation:ucRingBig 1.1s cubic-bezier(.15,.7,.2,1) .35s both}\n.fx-mate:after{animation:ucRingBig 1.1s cubic-bezier(.15,.7,.2,1) .6s both}\n@keyframes ucRingBig{0%{opacity:0;transform:scale(.5)}15%{opacity:1}100%{opacity:0;transform:scale(3.1)}}\n/* promotion ring */\n.fx-promo:before{width:70%;height:70%;border:3px solid rgba(250,204,21,.85);animation:ucRing .8s cubic-bezier(.15,.7,.2,1) .3s both}\n.fx-promo:after{width:90%;height:90%;background:radial-gradient(circle,rgba(253,224,71,.55),transparent 66%);animation:ucGlow .8s ease-out .3s both}\n/* capture sparks */\n.fx-burst b{position:absolute;inset:0;transform:rotate(var(--a))}\n.fx-burst b:before{content:'';position:absolute;left:calc(50% - 3px);top:50%;width:6px;height:6px;border-radius:50%;background:#7dd3fc;opacity:0;animation:ucSpark .52s cubic-bezier(.1,.7,.25,1) .2s both}\n.fx-burst b:nth-child(3n+2):before{background:#a5b4fc}\n.fx-burst b:nth-child(3n):before{background:#fff;width:4px;height:4px;left:calc(50% - 2px)}\n@keyframes ucSpark{0%{opacity:0;top:50%;transform:scale(1)}15%{opacity:1}100%{opacity:0;top:-14%;transform:scale(.25)}}\n/* last move: soft fade-in tint (only right after a move) */\n.square.last.fresh{animation:ucLastIn .7s ease-out .22s both}\n@keyframes ucLastIn{from{box-shadow:inset 0 0 0 100px rgba(125,211,252,.4)}to{box-shadow:inset 0 0 0 100px rgba(125,211,252,0)}}\n/* king in check: breathing red glow */\n.square.check{animation:ucCheckGlow 1.8s ease-in-out infinite}\n@keyframes ucCheckGlow{0%,100%{box-shadow:inset 0 0 0 0 rgba(255,80,115,0)}50%{box-shadow:inset 0 0 24px 3px rgba(255,80,115,.55)}}\n/* checkmate: king falls */\n.piece.fallen svg{transform-origin:50% 92%;transform:rotate(84deg) translate(-3%,6%);opacity:.82;transition:transform .7s cubic-bezier(.35,1.25,.45,1) .45s,opacity .6s ease .45s}\n/* pieces: smooth lift while dragging */\n.piece svg{transition:transform .18s cubic-bezier(.2,.8,.2,1)}\n.piece.dragging svg{transform:scale(1.16) translateY(-4%)}\n/* side panel & UI */\n.clock{transition:background .35s ease,box-shadow .35s ease,color .3s ease}\n.clock.low{animation:ucLow 1s ease-in-out infinite}\n@keyframes ucLow{50%{opacity:.7}}\n#status i{animation:ucDotIn .5s cubic-bezier(.2,.8,.2,1)}\n@keyframes ucDotIn{from{transform:scale(.3);box-shadow:0 0 0 0 rgba(52,211,153,.5)}to{transform:scale(1);box-shadow:0 0 0 5px rgba(52,211,153,.16)}}\n.move-row.ux-new{animation:ucRowIn .42s cubic-bezier(.2,.8,.2,1) both}\n@keyframes ucRowIn{from{opacity:0;transform:translateX(-12px);background:rgba(125,211,252,.2)}to{opacity:1;transform:none}}\n.promotion button{animation:ucPop .36s cubic-bezier(.2,.9,.25,1.15) backwards}\n.promotion button:nth-child(2){animation-delay:.05s}.promotion button:nth-child(3){animation-delay:.1s}.promotion button:nth-child(4){animation-delay:.15s}\n@keyframes ucPop{from{opacity:0;transform:translateY(10px) scale(.85)}to{opacity:1;transform:none}}\n@media(prefers-reduced-motion:reduce){.fx,.piece.fallen svg,.move-row.ux-new,.promotion button,#status i,.square.check,.square.last.fresh,.clock.low{animation:none!important;transition:none!important}}\n\n/* ===== ANALYSIS + UI MOTION ===== */\n.tabs{grid-template-columns:repeat(3,1fr)!important}\n#analysisPane{display:flex;flex-direction:column;gap:12px}#analysisPane[hidden]{display:none}\n#analysisPane>*,#playPane:not([hidden])>*{animation:reveal .5s cubic-bezier(.2,.8,.2,1) both}\n#analysisPane>:nth-child(2),#playPane>:nth-child(2){animation-delay:.05s}#analysisPane>:nth-child(3),#playPane>:nth-child(3){animation-delay:.1s}#analysisPane>:nth-child(4),#playPane>:nth-child(4){animation-delay:.15s}#analysisPane>:nth-child(5),#playPane>:nth-child(5){animation-delay:.2s}#analysisPane>:nth-child(6){animation-delay:.25s}#analysisPane>:nth-child(7){animation-delay:.3s}\n.an-eval{display:flex;align-items:center;gap:12px}.an-bar{flex:1;height:14px;border-radius:99px;background:#1a2547;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}.an-bar i{display:block;height:100%;width:50%;border-radius:99px;background:linear-gradient(90deg,#e8eeff,#fff);transition:width .7s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 14px rgba(255,255,255,.35)}.an-eval b{min-width:52px;text-align:right;font-size:15px;font-variant-numeric:tabular-nums}\n.an-prog{position:relative;height:26px;border-radius:13px;background:rgba(255,255,255,.05);overflow:hidden;font-size:12px;color:var(--muted);display:grid;place-items:center}.an-prog i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,rgba(56,189,248,.35),rgba(129,140,248,.45));transition:width .25s}.an-prog span{position:relative}.an-prog.done{display:none}\n.an-card{padding:14px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--line);min-height:74px;transition:border-color .3s,box-shadow .3s}.an-card.pop{animation:ucPop .35s cubic-bezier(.2,.9,.25,1.1)}.an-card .t{display:flex;align-items:center;gap:10px;font-weight:800;font-size:15px}.an-card .g{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;font-size:12px;font-weight:800;color:#06101f}.an-card p{margin:6px 0 0;font-size:13px;color:var(--muted);line-height:1.5}\n.an-nav{display:grid;grid-template-columns:1fr 1fr 1.3fr 1fr 1fr;gap:8px}.an-nav button{height:46px;border-radius:15px;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text)}.an-nav button:hover:not(:disabled){background:rgba(255,255,255,.11);transform:translateY(-2px)}.an-nav .an-play{background:linear-gradient(90deg,var(--blue),#818cf8);border:0}.an-nav .an-play.on{box-shadow:0 0 0 0 rgba(56,189,248,.5);animation:anPulse 1.4s infinite}\n@keyframes anPulse{to{box-shadow:0 0 0 14px rgba(56,189,248,0)}}\n#anGraph{width:100%;height:84px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid var(--line);cursor:pointer;display:block}#anGraph .ln{fill:none;stroke:#7dd3fc;stroke-width:2;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:anDraw 1.1s cubic-bezier(.3,.7,.2,1) .15s forwards}#anGraph .ar{fill:url(#anG);opacity:0;animation:anFade .8s .5s forwards}#anGraph .cur{stroke:#fff;stroke-width:1.5;vector-effect:non-scaling-stroke;transition:transform .3s cubic-bezier(.2,.8,.2,1)}\n@keyframes anDraw{to{stroke-dashoffset:0}}@keyframes anFade{to{opacity:1}}\n.an-sum{display:grid;grid-template-columns:1fr 1fr;gap:10px}.an-sum>div{padding:12px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--line)}.an-sum small{color:var(--muted);font-size:11px}.an-sum strong{display:block;font-size:26px;margin:2px 0 6px;font-variant-numeric:tabular-nums}.an-sum span{display:inline-block;margin:0 6px 0 0;font-size:11px;font-weight:700}\n.an-list{max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:4px}.an-row{display:grid;grid-template-columns:34px 1fr 1fr;align-items:center;font-size:13px;animation:ucRowIn .4s cubic-bezier(.2,.8,.2,1) backwards}.an-row>span{color:var(--muted);font-size:11px;font-weight:700}.an-row button{justify-content:flex-start;gap:7px;padding:9px 10px;border-radius:11px;background:transparent;font-weight:700;font-size:13px}.an-row button:hover{background:rgba(255,255,255,.07)}.an-row button.cur{background:rgba(56,189,248,.18);box-shadow:inset 0 0 0 1px rgba(125,211,252,.4)}.an-row i{width:8px;height:8px;border-radius:50%;flex:none}\n.an-arrow{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:7}.an-arrow .sh{fill:none;stroke:rgba(56,189,248,.82);stroke-width:.17;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:anDraw .45s cubic-bezier(.2,.8,.2,1) forwards}.an-arrow .hd{fill:rgba(56,189,248,.82);opacity:0;animation:anFade .2s .3s forwards}.an-arrow .bd{transform-box:fill-box;transform-origin:center;animation:ucPop .35s cubic-bezier(.2,.9,.25,1.3) both}\n.rpl{position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.35);transform:scale(0);animation:rplA .6s ease-out forwards}@keyframes rplA{to{transform:scale(1);opacity:0}}\n.mode-card:hover:not(:disabled),.state-action:hover:not(:disabled),.secondary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.28)}.primary:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1);box-shadow:0 16px 34px rgba(99,102,241,.4)}.tabs button.active{animation:ucPop .3s cubic-bezier(.2,.9,.25,1.1)}\n/* dropdown fix: no persistent stacking contexts, open menu always on top */\n#analysisPane>*,#playPane:not([hidden])>*{animation-fill-mode:backwards!important}\n#playPane>*{position:relative}\n#playPane .setup-section{z-index:30}\n#playPane .setup-section:has(.smart-select.open){z-index:60}\n.smart-select{position:relative}.smart-select.open{z-index:80}\n.smart-select-menu{z-index:90}\n@media(prefers-reduced-motion:reduce){#analysisPane *,#playPane *,.an-arrow *,.rpl{animation:none!important;transition:none!important}#anGraph .ln{stroke-dashoffset:0}#anGraph .ar{opacity:1}}\n\n/* Added motion is limited to controls, tabs, connection and notifications. */\n@keyframes fbPaneIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}\n@keyframes fbHalo{0%,100%{box-shadow:0 0 0 0 #38bdf800}50%{box-shadow:0 0 0 5px #38bdf812}}\n@keyframes fbSpinner{to{transform:rotate(360deg)}}\n@keyframes fbInviteIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}\n.game-sidebar .primary,.game-sidebar .secondary,.head-actions .icon,.board-action-group .icon{transition:background .2s,box-shadow .2s,filter .2s,transform .18s}\n.game-sidebar .primary:hover:not(:disabled){box-shadow:0 8px 26px #38bdf82b;filter:brightness(1.08)}\n.game-sidebar .secondary:hover:not(:disabled){box-shadow:0 4px 17px #6366f117}\n.tabs button svg,.game-sidebar button svg{transition:transform .22s cubic-bezier(.22,1,.36,1)}\n.game-sidebar button:hover:not(:disabled)>svg{transform:translateY(-1px)}\n.fb-pane-enter{animation:fbPaneIn .28s cubic-bezier(.22,1,.36,1) both}\n#connection.fb-connected{border-color:#34d39955;color:#34d399}\n#connection.fb-connecting{animation:fbHalo 1.6s ease-in-out infinite;color:var(--blue)}\n#invite.fb-room-ready{animation:fbInviteIn .35s ease both}\n#roomCode{border:1px dashed var(--line-strong);border-radius:12px;padding:12px;margin:8px 0 14px;transition:border-color .2s,background .2s}\n#roomCode:hover{border-color:var(--blue);background:#38bdf80a}\nbutton.fb-busy:after{content:'';width:13px;height:13px;flex-shrink:0;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:fbSpinner .75s linear infinite}\n#toast{transition:opacity .25s,transform .3s cubic-bezier(.22,1,.36,1),box-shadow .25s}\n.uc-root.light #connection.fb-connected{color:#047857}\n@media(prefers-reduced-motion:reduce){.fb-pane-enter,#connection.fb-connecting,#invite.fb-room-ready,button.fb-busy:after{animation:none!important}}\n}\n:host{display:block;width:100%;color:var(--text);font-family:inherit}\n.uc-root{--bg:transparent;--bg-2:transparent;--panel:rgba(28,27,46,.88);--panel-2:#252339;--panel-3:#232136;--field:#211f34;--field-2:#302b45;--text:#f1edff;--soft:#d0c9e6;--muted:#aaa1c2;--line:#ffffff14;--line-strong:#a995df40;--blue:#b39aff;--indigo:#8b5cf6;--violet:#a78bfa;--shadow:none;--board-shadow:none;--green:#58c9a6;background:radial-gradient(ellipse at 100% 0%,#9766ef16,transparent 48%),var(--panel);border:1px solid var(--line-strong);border-radius:28px;padding:26px;isolation:isolate;color:var(--text);font:inherit;box-sizing:border-box}\n.uc-root.light{--panel:rgba(248,246,255,.92);--panel-2:#fff;--panel-3:#f3effb;--field:#fff;--field-2:#f1ebfd;--text:#28233b;--soft:#514961;--muted:#787087;--line:#79669520;--line-strong:#8e70be30;--blue:#7c3aed;--indigo:#7c3aed;--violet:#8b5cf6;--green:#209977;--shadow:none;--board-shadow:none;color-scheme:light}\n.shell{padding:0;max-width:none}.lms-header{padding:0 0 22px;margin-bottom:24px;border-bottom:1px solid var(--line);gap:16px}.brand{pointer-events:none;gap:12px}.brand-icon{background:var(--field-2);box-shadow:none;border:1px solid var(--line-strong);color:var(--violet);border-radius:15px}.brand-kicker{color:var(--violet);font-size:10px;letter-spacing:1.5px}.brand-copy strong{font-size:26px;letter-spacing:-.6px}.head-actions{gap:8px}.badge{box-shadow:none;background:var(--field-2);padding:9px 12px;color:var(--soft);font-size:12px}\nmain{grid-template-columns:minmax(0,1fr) minmax(300px,380px);gap:26px;align-items:start}.arena{background:transparent;border:0;box-shadow:none;padding:0;max-width:740px;width:100%;justify-self:center}.arena-head,.sidebar-heading,footer,.lms-hint{display:none}.game-sidebar{min-width:0}.control-panel{background:var(--panel-2);border:1px solid var(--line);box-shadow:none;border-radius:22px;padding:18px}.player{padding:0 2px;gap:10px}.avatar{width:38px;height:38px;border-radius:12px;font-size:27px;box-shadow:none}.player-label strong{font-size:14px}.clock{font-size:23px;min-width:96px;border-radius:12px;padding:9px 12px;box-shadow:none;background:var(--field-2);color:var(--text)}.clock.active{background:var(--field-2);border-color:var(--violet);color:var(--violet);box-shadow:none}.board-wrap{box-shadow:none;border-radius:14px;overflow:hidden}.board-tools{padding:12px 0 0;gap:8px}.icon{box-shadow:none;border-radius:12px;background:var(--field-2);color:var(--soft);width:40px;height:40px}.icon:hover{background:var(--line-strong);color:var(--violet)}\n.tabs{display:grid;grid-template-columns:1.2fr 1fr 1fr;background:var(--panel-3);padding:4px;border:0;border-radius:13px;gap:2px;margin-bottom:20px}.tabs button{font-size:12px;min-height:39px;padding:7px 5px;border-radius:10px;color:var(--muted);background:transparent;white-space:nowrap}.tabs button.active{background:var(--panel-2);color:var(--violet);box-shadow:0 2px 7px #25123f0b;border:1px solid var(--line)}\n.player-row-card{display:block;padding:0 0 18px;background:transparent;border:0;border-radius:0}.field-copy{margin-bottom:9px}.field-copy small,.section-heading small,.mode-heading small,.join-heading small{display:none}.field-copy strong,.section-heading strong,.join-heading strong{font-size:13px;color:var(--soft)}input,.smart-select-trigger{min-height:46px;border-radius:12px!important;background:var(--field)!important;border:1px solid var(--line-strong)!important;color:var(--text)!important;font-size:14px!important;box-shadow:none!important}#name{width:100%;max-width:none}.setup-section,.mode-section,.join-section{padding:0;margin:0 0 18px;border:0}.setup-grid{gap:10px}.setting-card{padding:0;background:none;border:0;border-radius:0}.setting-label{font-size:11px;margin-bottom:7px;color:var(--muted)}.section-heading{margin-bottom:12px}.smart-select-menu{background:var(--panel-2);border-color:var(--line-strong);box-shadow:0 14px 35px #20133320}.smart-select-option{color:var(--text)}.smart-select-option:hover,.smart-select-option.selected{background:var(--field-2);color:var(--violet)}\n.mode-grid{gap:9px}.mode-row{gap:9px}.mode-card{padding:13px!important;min-height:64px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;border-radius:14px!important;background:var(--field-2)!important;border:1px solid var(--line-strong)!important;box-shadow:none!important;color:var(--text)!important;transition:transform .2s,box-shadow .2s,border-color .2s!important}.mode-card:hover:not(:disabled){transform:translateY(-3px)!important;border-color:var(--violet)!important;box-shadow:0 6px 16px #7c3aed14!important}.mode-online{background:linear-gradient(120deg,#8653e7,#6e41ce)!important;color:white!important;border-color:transparent!important}.mode-card svg{width:21px;height:21px;flex-shrink:0}.mode-card strong{font-size:13px}.mode-card small{display:none}.mode-card .mode-icon{width:30px;height:30px;background:transparent;box-shadow:none;border:0}.mode-card .mode-arrow{margin-left:auto}.join-heading{margin-bottom:9px}.join{gap:7px}#room{min-width:0;width:100%;font-size:12px!important;letter-spacing:.8px}.join-button{min-width:46px;height:46px;background:var(--field-2);color:var(--violet)}.game-state{background:var(--panel-3);padding:14px;border:1px solid var(--line);border-radius:14px;margin-top:14px}.game-state-copy strong{font-size:13px}.game-state-copy p{font-size:12px;line-height:1.6;color:var(--muted)}.game-state-actions{gap:8px}.state-action{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;font-size:12px}.primary,.secondary{border-radius:12px;min-height:43px}.primary{background:var(--violet);color:white}.secondary{background:var(--field-2);color:var(--text);border:1px solid var(--line-strong)}.invite-card{background:var(--field-2);border-color:var(--line-strong)}.live-dot{background:var(--violet)}\n#playPane,#historyPane,#analysisPane{animation:ucPane .3s ease both}#toast{background:var(--panel-2);color:var(--text);border:1px solid var(--line-strong);box-shadow:0 12px 35px #22143225;max-width:calc(100vw - 32px);z-index:1900}dialog{background:var(--panel-2);color:var(--text);border:1px solid var(--line-strong);border-radius:22px;max-width:min(440px,calc(100vw - 32px));box-shadow:0 24px 80px #0005}dialog[open]{animation:ucPane .25s ease}dialog::backdrop{background:#100b2455;backdrop-filter:blur(5px)}.dialog-actions{display:flex;gap:10px}.dialog-actions button{flex:1}.moves{max-height:430px}.move-row{border-radius:8px}.move-row:nth-child(odd){background:var(--field-2)}[hidden]{display:none!important}\n@keyframes ucPane{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\n@media(min-width:1150px){.game-sidebar{position:sticky;top:24px}}\n@media(max-width:900px){.uc-root{padding:20px}main{grid-template-columns:minmax(0,1fr) minmax(280px,330px);gap:18px}.brand-copy strong{font-size:23px}.badge{max-width:210px}.clock{font-size:21px}}\n@media(max-width:720px){.uc-root{padding:16px;border-radius:22px}main{grid-template-columns:minmax(0,1fr);gap:22px}.lms-header{padding-bottom:16px;margin-bottom:18px}.brand-copy strong{font-size:23px}.brand-icon{width:42px;height:42px}.brand-kicker{font-size:9px}.head-actions .badge{display:none}.control-panel{padding:16px}.clock{font-size:22px}.board-tools #status{font-size:12px}.game-sidebar{position:static}.mode-row{grid-template-columns:1fr 1fr}.player-label strong{max-width:170px}.shell{padding:0}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\n.tabs button,.mode-card,.setting-card{min-width:0}.setup-grid{display:grid;grid-template-columns:1fr 1fr}.bot-setting{grid-column:1/-1}.mode-grid{display:grid;grid-template-columns:1fr}.mode-row{display:grid;grid-template-columns:1fr 1fr}.mode-card{width:100%}.mode-card span{min-width:0}.mode-card::before,.mode-card::after{display:none}.brand-icon{background:var(--field-2);color:var(--violet)}.control-panel{box-shadow:none}.game-state{background:var(--panel-3)}\n.lms-header{animation:ucPane .45s ease both}.control-panel{animation:ucPane .45s .06s ease both}.mode-card svg{color:currentColor}.mode-online:hover:not(:disabled){box-shadow:0 8px 20px #7c3aed30!important}.tabs button:hover:not(.active){background:var(--line);color:var(--text)}\n/* LMS refinement — structured panels, readable controls, intentional empty states. */\n.uc-root{--ux-accent:#b299ff;--ux-tint:rgba(168,139,250,.085);--ux-inset:rgba(12,13,25,.17);--ux-card:rgba(255,255,255,.025);--muted:#b1a9c5;--panel-2:#242335;background:radial-gradient(ellipse at 94% 0%,#9368e512,transparent 45%),rgba(27,27,43,.94);border-color:#a995df2e}\n.uc-root.light{--ux-accent:#7950d8;--ux-tint:rgba(139,92,246,.055);--ux-inset:#f5f2fa;--ux-card:#fff;--muted:#797186;--panel-2:#fff;background:radial-gradient(ellipse at 94% 0%,#a382ec12,transparent 45%),rgba(248,246,253,.95)}\nmain{grid-template-columns:minmax(0,1fr) minmax(350px,430px);gap:28px}.arena{max-width:690px}.control-panel{padding:20px;background:var(--ux-card);border-radius:24px;border-color:var(--line-strong);position:relative;overflow:visible}.ux-icon{width:19px;height:19px;flex-shrink:0}.ux-heading{display:flex;align-items:center;gap:9px!important;font-size:14px!important;color:var(--text)!important;font-weight:700}.ux-heading .ux-icon{color:var(--ux-accent);width:18px;height:18px}.brand-icon svg{width:25px;height:25px}.tabs{background:var(--ux-inset);padding:5px;gap:4px;margin-bottom:22px;grid-template-columns:1fr 1.05fr 1.1fr;border:1px solid var(--line);border-radius:15px}.tabs button{gap:7px;min-height:43px;padding:8px 6px;font-size:13px;font-weight:700;position:relative;border:1px solid transparent}.tabs button svg{width:17px;height:17px}.tabs button.active{color:var(--ux-accent);background:var(--panel-2);border-color:var(--line-strong);box-shadow:0 3px 10px #1411240b}.tabs button.active::after{content:'';position:absolute;width:20px;height:2px;border-radius:2px;background:var(--ux-accent);bottom:3px;left:calc(50% - 10px);animation:uxTabLine .3s ease both}#moveCount{font-size:10px;background:var(--ux-tint);color:var(--ux-accent);min-width:18px;height:18px;display:grid;place-items:center;padding:0 4px;border-radius:6px}\n.player-row-card{padding:0 0 20px;margin-bottom:0}.field-copy{margin-bottom:11px}.player-row-card #name{padding:13px 15px;min-height:48px}.setup-section{padding:20px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:0 0 20px;position:relative}.setup-section::before{content:'';position:absolute;right:5px;top:12px;width:85px;height:50px;pointer-events:none;opacity:.28;background:repeating-linear-gradient(135deg,transparent 0 9px,var(--line-strong) 9px 10px);mask-image:linear-gradient(to left,#000,transparent)}.setup-grid{gap:13px}.setting-label{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;letter-spacing:0}.setting-label svg{width:14px;height:14px;color:var(--muted)}.section-heading{margin-bottom:17px}.smart-select-trigger{min-height:47px!important;padding:11px 13px!important;font-size:13px!important;font-weight:600!important;transition:border-color .2s,box-shadow .2s!important}.smart-select.open .smart-select-trigger{border-color:var(--ux-accent)!important;box-shadow:0 0 0 3px var(--ux-tint)!important}.smart-select-menu{border-radius:13px;padding:5px;animation:uxDropdown .2s ease-out}.smart-select-option{min-height:40px;font-size:13px;border-radius:8px}.bot-setting{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:12px;padding-top:2px}.bot-setting .setting-label{margin-bottom:0}.mode-section{margin-bottom:20px}.mode-grid,.mode-row{display:flex;flex-direction:column;gap:9px}.mode-card{min-height:68px!important;padding:12px 14px!important;gap:12px!important;background:var(--ux-card)!important;color:var(--text)!important;border:1px solid var(--line-strong)!important;border-radius:15px!important;text-align:left;overflow:hidden;position:relative}.mode-online{background:linear-gradient(105deg,#8151dc,#7243c8)!important;color:#fff!important;border-color:transparent!important}.ux-mode-icon{width:37px;height:37px;border-radius:11px;display:grid;place-items:center;background:var(--ux-tint);color:var(--ux-accent);flex-shrink:0}.mode-online .ux-mode-icon{background:#ffffff18;color:#fff}.ux-mode-copy{flex:1;display:flex;flex-direction:column;gap:4px}.mode-card .ux-mode-copy strong{font-size:14px;line-height:1.3}.mode-card .ux-mode-copy small{display:block;font-size:11px;line-height:1.4;font-weight:400;color:var(--muted)}.mode-online .ux-mode-copy small{color:#ede4ff}.ux-mode-arrow{color:var(--muted);transition:transform .2s}.ux-mode-arrow svg{width:17px}.mode-online .ux-mode-arrow{color:#ede4ff}.mode-card:hover:not(:disabled) .ux-mode-arrow{transform:translateX(3px)}.mode-card:hover:not(:disabled){transform:translateY(-2px)!important}.mode-online::after{display:block!important;content:'';position:absolute;inset:-50% auto -50% -40%;width:26%;background:linear-gradient(90deg,transparent,#ffffff14,transparent);transform:skewX(-20deg);pointer-events:none;animation:uxShine 7s ease-in-out infinite}\n.join-section{padding-top:18px;border-top:1px solid var(--line);margin-bottom:0}.join-heading{margin-bottom:13px}.join{display:flex;padding:4px;border-radius:14px;border:1px solid var(--line-strong);background:var(--field);gap:4px}.join input#room{border:0!important;background:transparent!important;box-shadow:none!important;min-height:40px;padding:10px 11px;letter-spacing:1px}.join:focus-within{border-color:var(--ux-accent);box-shadow:0 0 0 3px var(--ux-tint)}.join-button{height:40px;min-width:40px;width:40px;background:var(--ux-tint);border:0;border-radius:10px}.invite-card{display:grid;grid-template-columns:1fr;gap:11px;background:var(--ux-tint);border:1px solid var(--line-strong);border-radius:16px;padding:15px;margin-top:12px;animation:uxDropdown .28s ease-out}.invite-copy{display:block}.invite-copy span{font-size:13px;color:var(--text)}.invite-copy p{font-size:12px;margin:5px 0 0;color:var(--muted);line-height:1.5}#roomCode{display:block;text-align:center;font-size:15px;letter-spacing:2px;color:var(--ux-accent);background:var(--ux-inset);border:1px dashed var(--line-strong);padding:12px;border-radius:10px;width:100%}#copy,#fbCancelRoom{width:100%;min-height:42px;margin:0;font-size:12px;gap:8px}#fbCancelRoom{background:transparent;border-color:transparent;color:var(--muted);min-height:34px}#fbCancelRoom:hover{color:var(--danger);background:var(--ux-inset)}.game-state{margin-top:18px;padding:13px;background:var(--ux-inset);border-radius:14px;border-color:var(--line)}.game-state-copy strong{font-size:12px}.game-state-copy p{font-size:11px;margin:5px 0 0}.game-state .live-dot{box-shadow:0 0 0 4px var(--ux-tint);animation:uxPulse 2.8s ease-in-out infinite}\n.ux-pane-title{display:flex;gap:12px;align-items:center;margin:4px 0 19px;padding-bottom:18px;border-bottom:1px solid var(--line)}.ux-icon-box{width:40px;height:40px;border-radius:12px;background:var(--ux-tint);color:var(--ux-accent);display:grid;place-items:center;flex-shrink:0}.ux-pane-title strong{font-size:16px;color:var(--text);display:block}.ux-pane-title small{font-size:11px;font-weight:400;color:var(--muted);display:block;margin-top:5px}.history-head,.move-row{display:grid;grid-template-columns:36px 1fr 1fr;gap:8px;padding:10px 12px}.history-head{font-size:11px;color:var(--muted);background:var(--ux-inset);border-radius:10px;margin-bottom:7px}.moves{height:auto;min-height:0;max-height:430px;padding:0;background:transparent;border:0}.move-row{font-size:14px;min-height:43px;align-items:center;border:1px solid transparent}.move-row:hover{border-color:var(--line-strong);background:var(--ux-tint)}.move-row span:first-child{font-size:11px;color:var(--muted)}.ux-no-moves .history-head{display:none}.ux-empty{padding:22px 12px 18px;text-align:center;display:flex;flex-direction:column;align-items:center;position:relative}.ux-empty-art{width:100px;height:92px;position:relative;display:grid;place-items:center;margin-bottom:18px}.ux-empty-icon{width:58px;height:58px;background:var(--ux-tint);border:1px solid var(--line-strong);border-radius:18px;color:var(--ux-accent);display:grid;place-items:center;transform:rotate(-7deg);animation:uxFloat 5s ease-in-out infinite}.ux-empty-icon svg{width:28px;height:28px}.ux-orbit{position:absolute;width:86px;height:86px;border:1px dashed var(--line-strong);border-radius:50%;animation:uxOrbit 35s linear infinite}.ux-empty-art i{position:absolute;width:7px;height:7px;right:9px;top:17px;border-radius:2px;background:var(--ux-accent);opacity:.5}.ux-empty-art i:last-child{width:4px;height:4px;right:auto;top:auto;bottom:12px;left:10px;opacity:.3}.ux-empty strong{font-size:15px;line-height:1.4;color:var(--text)}.ux-empty p{font-size:12px!important;line-height:1.75!important;max-width:265px;margin:9px 0 0!important;color:var(--muted)!important}.ux-empty-line{width:48px;height:3px;background:var(--line-strong);border-radius:3px;margin-top:22px}.ux-no-moves .an-eval,.ux-no-moves .an-nav,.ux-no-moves #anGraph,.ux-no-moves #anSum,.ux-no-moves #anList{display:none}.ux-no-moves #anCard{background:none;border:0;padding:0;margin:0;box-shadow:none}.an-eval{margin:8px 0 14px}.an-bar{background:var(--ux-inset);border-color:var(--line-strong)}.an-nav{gap:7px}.an-nav button{border-radius:11px;background:var(--ux-inset);border:1px solid var(--line-strong);height:42px;color:var(--soft)}.an-nav button.an-play{background:var(--ux-tint);color:var(--ux-accent)}#anCard{border-radius:15px;background:var(--ux-tint);padding:16px}#anCard p{font-size:12px;line-height:1.7;color:var(--muted)}#anGraph{background:var(--ux-inset);border-radius:14px;border-color:var(--line)}.an-sum>div{background:var(--ux-inset);border-color:var(--line);border-radius:13px}.an-row button{border-radius:8px}\n@keyframes uxTabLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes uxDropdown{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}@keyframes uxFloat{0%,100%{transform:translateY(0) rotate(-7deg)}50%{transform:translateY(-5px) rotate(2deg)}}@keyframes uxOrbit{to{transform:rotate(360deg)}}@keyframes uxPulse{50%{box-shadow:0 0 0 7px transparent}}@keyframes uxShine{0%,60%{left:-40%}85%,100%{left:135%}}\n@media(max-width:1050px){main{grid-template-columns:minmax(0,1fr) minmax(320px,380px);gap:22px}.control-panel{padding:17px}}@media(max-width:800px){main{grid-template-columns:1fr;gap:22px}.game-sidebar{position:static}.arena{max-width:620px}.game-sidebar{width:100%;max-width:620px;justify-self:center}}@media(max-width:420px){.uc-root{padding:12px}.control-panel{padding:14px}.tabs button{gap:5px;font-size:12px}.tabs button svg{width:15px}.tabs{gap:2px;padding:4px}.ux-mode-copy strong{font-size:13px!important}.ux-mode-copy small{font-size:10.5px!important}.ux-mode-icon{width:32px;height:32px}.mode-card{gap:10px!important;padding:11px!important}.smart-select-trigger{padding:10px!important;font-size:12px!important}.ux-pane-title strong{font-size:15px}.setting-label{font-size:11px}.ux-heading{font-size:13px!important}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}\n.tabs button>span:not(#moveCount){background:transparent;color:inherit;border-radius:0;padding:0;font-size:inherit;font-weight:inherit;line-height:inherit;min-width:0;height:auto}.join-section{background:transparent;border-radius:0;border-left:0;border-right:0;border-bottom:0;padding-left:0;padding-right:0;box-shadow:none}.smart-select-trigger .smart-select-value{line-height:1.35}.smart-select-trigger{height:auto!important}.ux-no-moves .moves{max-height:none}.mode-card:focus-visible,.tabs button:focus-visible{outline:2px solid var(--ux-accent);outline-offset:3px}\n/* The busy indicator replaces the icon and never takes extra layout space. */\n#join{position:relative;display:grid;place-items:center;flex:0 0 40px;overflow:hidden;opacity:1}\n#join>svg{grid-area:1/1;transition:opacity .15s}\n#join.fb-busy>svg{opacity:0}\n#join.fb-busy::after{content:'';display:block;position:absolute;inset:0;margin:auto;width:18px;height:18px;box-sizing:border-box;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:fbSpinner .75s linear infinite;pointer-events:none}\n#create.fb-busy{opacity:.85}\n#create.fb-busy::after{display:none!important}\n#create.fb-busy .ux-mode-icon{position:relative}\n#create.fb-busy .ux-mode-icon>svg{opacity:0}\n#create.fb-busy .ux-mode-icon::after{content:'';position:absolute;inset:0;margin:auto;width:19px;height:19px;box-sizing:border-box;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:fbSpinner .75s linear infinite}\n@media(prefers-reduced-motion:reduce){#join.fb-busy::after,#create.fb-busy .ux-mode-icon::after{animation:none!important}}\n/* Tight board layout and a lightweight, vector-only board surface. */\nmain{grid-template-columns:minmax(0,1fr) minmax(330px,410px);gap:20px;max-width:1160px;margin-inline:auto}.arena{max-width:none;justify-self:stretch;position:relative;padding:16px;border:1px solid var(--line-strong);border-radius:22px;background:linear-gradient(140deg,var(--ux-tint),transparent 50%),var(--ux-card);overflow:hidden}.arena::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,var(--ux-accent),transparent);opacity:.45;animation:uxFrameGlow 5s ease-in-out infinite;pointer-events:none}.arena::after{content:'';position:absolute;top:0;right:0;width:120px;height:70px;background:repeating-linear-gradient(135deg,transparent 0 14px,var(--line) 14px 15px);mask-image:linear-gradient(230deg,#000,transparent 80%);pointer-events:none}.board-wrap{margin-inline:0;padding:7px;background:var(--ux-inset);border:1px solid var(--line-strong);border-radius:14px;box-shadow:inset 0 1px 0 #ffffff0d}.board-stage{border-radius:9px;overflow:hidden;touch-action:none;isolation:isolate}.piece,.piece svg,.piece.dragging,.piece.dragging svg{filter:none!important;box-shadow:none!important;transition:none!important;backface-visibility:hidden}.piece{will-change:auto!important;overflow:visible;pointer-events:none}.piece svg{width:84%;height:84%;overflow:visible;transform:none;display:block;margin:auto}.piece{display:flex;align-items:center;justify-content:center}.square{background:linear-gradient(140deg,#e2e8f6,#d1dcf0)!important;box-shadow:inset 0 1px 0 #ffffff12;animation:none!important}.square.dark{background:linear-gradient(140deg,#667ab8,#5267a5)!important}.square.selected{box-shadow:inset 0 0 0 3px #b9a0ff!important}.square.last::before{animation:none!important}.square.check{background:linear-gradient(135deg,#b7718b,#a45974)!important}.fx,.capture-pulse{display:none!important}.square:active{transform:none!important}.an-sum>div{padding:13px;min-width:0}.an-sum strong{font-size:27px;margin:8px 0 12px}.an-sum .ux-stat-row{display:flex!important;align-items:center;gap:6px;margin:0;padding:6px 0;color:var(--soft);font-size:11px;border-top:1px solid var(--line)}.ux-stat-row>span{margin:0!important;font-size:inherit!important;color:inherit!important;flex:1}.ux-stat-row>i{width:5px;height:5px;flex-shrink:0;border-radius:50%}.ux-stat-row>b{font-size:12px;color:var(--text);font-variant-numeric:tabular-nums}@keyframes uxFrameGlow{50%{opacity:.15}}\n@media(max-width:1050px){main{grid-template-columns:minmax(0,1fr) minmax(310px,360px);gap:16px}.arena{padding:12px}}@media(max-width:800px){main{grid-template-columns:1fr;gap:18px}.arena{width:100%;max-width:620px;justify-self:center}.game-sidebar{max-width:620px}.arena{padding:10px}.board-wrap{padding:4px}.player-label strong{max-width:160px}}@media(max-width:360px){.an-sum{grid-template-columns:1fr}.player-label strong{max-width:120px}.clock{min-width:78px;font-size:19px;padding:8px}.arena{padding:8px}}\n@media(prefers-reduced-motion:reduce){.arena::before{animation:none}}\n.board-wrap{max-width:none}.board-wrap::before{display:none}.square.last::before{content:'';position:absolute;inset:0;background:#b7a0ff20;pointer-events:none;border:1px solid #b7a0ff35}.square .coordinate{z-index:1}\n/* Animated chess ornaments — confined to the empty margins, never over controls. */\n.uc-root{position:relative;overflow:hidden;container-type:inline-size;--orn-color:#b7a0ef;--orn-opacity:.32}.uc-root.light{--orn-color:#8969c2;--orn-opacity:.35}.shell{position:relative;z-index:1}.uc-ornaments{position:absolute;inset:150px 12px 28px;pointer-events:none;z-index:0;user-select:none;contain:layout paint}.uc-orn-side{position:absolute;top:0;bottom:0;width:calc((100% - 1160px)/2 - 24px);max-width:210px;display:none;color:var(--orn-color);opacity:var(--orn-opacity)}.uc-orn-left{left:8px}.uc-orn-right{right:8px;transform:scaleX(-1)}.uc-orn-rail{position:absolute;inset:0;width:100%;height:100%;min-height:400px;fill:var(--orn-color);overflow:visible}.uc-orn-rail path{fill:none;stroke:currentColor;stroke-width:1;vector-effect:non-scaling-stroke}.uc-rail-base{opacity:.26}.uc-rail-light{stroke-dasharray:22 260;opacity:.75;animation:ucRailFlow 24s linear infinite}.uc-orn-right .uc-rail-light{animation-delay:-11s}.uc-orn-rail circle{opacity:.65}.uc-orn-piece{display:block;position:absolute;width:65px;height:65px;animation:ucOrnFloat 8s ease-in-out infinite;transform-origin:center;will-change:auto}.uc-orn-piece svg{width:100%;height:100%;display:block}.uc-op-one{top:13%;left:calc(50% - 32px);animation-delay:-2s;rotate:-12deg}.uc-op-two{top:45%;left:calc(50% - 22px);width:48px;height:48px;animation-delay:-5s;rotate:10deg}.uc-op-three{top:76%;left:calc(50% - 35px);width:58px;height:58px;animation-delay:-1s;rotate:-5deg}.uc-orn-right .uc-orn-piece{scale:-1 1}.uc-orn-grid{position:absolute;top:32%;left:20%;width:64%;aspect-ratio:1;opacity:.16;background:repeating-linear-gradient(0deg,transparent 0 19px,currentColor 19px 20px),repeating-linear-gradient(90deg,transparent 0 19px,currentColor 19px 20px);transform:rotate(45deg);mask-image:radial-gradient(#000,transparent 70%)}\n.lms-header{position:relative}.brand,.head-actions{position:relative;z-index:2}.uc-header-art{position:absolute;left:50%;top:-8px;transform:translateX(-50%);width:230px;height:76px;pointer-events:none;color:var(--orn-color);opacity:.52;overflow:hidden}.uc-header-trail{position:absolute;left:0;right:0;top:49px;height:1px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.35}.uc-header-art .uc-orn-piece{width:44px;height:44px}.uc-hp-one{left:36px;top:16px;rotate:-13deg;animation-delay:-4s;opacity:.6}.uc-header-art .uc-hp-two{left:94px;top:4px;width:53px;height:53px;rotate:7deg;animation-delay:-1s}.uc-hp-three{left:159px;top:13px;rotate:12deg;animation-delay:-6s;opacity:.65}.uc-header-diamond{position:absolute;left:15px;top:28px;width:4px;height:4px;border:1px solid currentColor;rotate:45deg;opacity:.7}.uc-header-diamond::after{content:'';position:absolute;left:144px;top:-142px;width:3px;height:3px;background:currentColor}\n@container(min-width:1350px){.uc-orn-side{display:block}}\n@container(max-width:860px){.uc-header-art{display:none}}\n@media(max-width:800px){.uc-ornaments{display:none}}\n@keyframes ucOrnFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-9px) rotate(4deg)}}@keyframes ucRailFlow{to{stroke-dashoffset:-564}}\n@media(prefers-reduced-motion:reduce){.uc-orn-piece,.uc-rail-light{animation:none!important}}\n.uc-root:not(.light){--panel-2:#242335;--field-2:#302b45;--panel-3:#232136;color-scheme:dark}\n", ENGINE_SOURCE="const MASK64 = 0xffffffffffffffffn;\nfunction rotl(x, k) {\n    return ((x << k) | (x >> (64n - k))) & 0xffffffffffffffffn;\n}\nfunction wrappingMul(x, y) {\n    return (x * y) & MASK64;\n}\n// xoroshiro128**\nfunction xoroshiro128(state) {\n    return function () {\n        let s0 = BigInt(state & MASK64);\n        let s1 = BigInt((state >> 64n) & MASK64);\n        const result = wrappingMul(rotl(wrappingMul(s0, 5n), 7n), 9n);\n        s1 ^= s0;\n        s0 = (rotl(s0, 24n) ^ s1 ^ (s1 << 16n)) & MASK64;\n        s1 = rotl(s1, 37n);\n        state = (s1 << 64n) | s0;\n        return result;\n    };\n}\nconst rand = xoroshiro128(0xa187eb39cdcaed8f31c4b365b102e01en);\nconst PIECE_KEYS = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 128 }, () => rand())));\nconst EP_KEYS = Array.from({ length: 8 }, () => rand());\nconst CASTLING_KEYS = Array.from({ length: 16 }, () => rand());\nconst SIDE_KEY = rand();\nconst WHITE = 'w';\nconst BLACK = 'b';\nconst PAWN = 'p';\nconst KNIGHT = 'n';\nconst BISHOP = 'b';\nconst ROOK = 'r';\nconst QUEEN = 'q';\nconst KING = 'k';\nconst DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';\nclass Move {\n    color;\n    from;\n    to;\n    piece;\n    captured;\n    promotion;\n    /**\n     * @deprecated This field is deprecated and will be removed in version 2.0.0.\n     * Please use move descriptor functions instead: `isCapture`, `isPromotion`,\n     * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and\n     * `isBigPawn`\n     */\n    flags;\n    san;\n    lan;\n    before;\n    after;\n    constructor(chess, internal) {\n        const { color, piece, from, to, flags, captured, promotion } = internal;\n        const fromAlgebraic = algebraic(from);\n        const toAlgebraic = algebraic(to);\n        this.color = color;\n        this.piece = piece;\n        this.from = fromAlgebraic;\n        this.to = toAlgebraic;\n        /*\n         * HACK: The chess['_method']() calls below invoke private methods in the\n         * Chess class to generate SAN and FEN. It's a bit of a hack, but makes the\n         * code cleaner elsewhere.\n         */\n        this.san = chess['_moveToSan'](internal, chess['_moves']({ legal: true }));\n        this.lan = fromAlgebraic + toAlgebraic;\n        this.before = chess.fen();\n        // Generate the FEN for the 'after' key\n        chess['_makeMove'](internal);\n        this.after = chess.fen();\n        chess['_undoMove']();\n        // Build the text representation of the move flags\n        this.flags = '';\n        for (const flag in BITS) {\n            if (BITS[flag] & flags) {\n                this.flags += FLAGS[flag];\n            }\n        }\n        if (captured) {\n            this.captured = captured;\n        }\n        if (promotion) {\n            this.promotion = promotion;\n            this.lan += promotion;\n        }\n    }\n    isCapture() {\n        return this.flags.indexOf(FLAGS['CAPTURE']) > -1;\n    }\n    isPromotion() {\n        return this.flags.indexOf(FLAGS['PROMOTION']) > -1;\n    }\n    isEnPassant() {\n        return this.flags.indexOf(FLAGS['EP_CAPTURE']) > -1;\n    }\n    isKingsideCastle() {\n        return this.flags.indexOf(FLAGS['KSIDE_CASTLE']) > -1;\n    }\n    isQueensideCastle() {\n        return this.flags.indexOf(FLAGS['QSIDE_CASTLE']) > -1;\n    }\n    isBigPawn() {\n        return this.flags.indexOf(FLAGS['BIG_PAWN']) > -1;\n    }\n}\nconst EMPTY = -1;\nconst FLAGS = {\n    NORMAL: 'n',\n    CAPTURE: 'c',\n    BIG_PAWN: 'b',\n    EP_CAPTURE: 'e',\n    PROMOTION: 'p',\n    KSIDE_CASTLE: 'k',\n    QSIDE_CASTLE: 'q',\n    NULL_MOVE: '-',\n};\n// prettier-ignore\nconst SQUARES = [\n    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',\n    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',\n    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',\n    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',\n    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',\n    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',\n    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',\n    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'\n];\nconst BITS = {\n    NORMAL: 1,\n    CAPTURE: 2,\n    BIG_PAWN: 4,\n    EP_CAPTURE: 8,\n    PROMOTION: 16,\n    KSIDE_CASTLE: 32,\n    QSIDE_CASTLE: 64,\n    NULL_MOVE: 128,\n};\n/* eslint-disable @typescript-eslint/naming-convention */\n// these are required, according to spec\nconst SEVEN_TAG_ROSTER = {\n    Event: '?',\n    Site: '?',\n    Date: '????.??.??',\n    Round: '?',\n    White: '?',\n    Black: '?',\n    Result: '*',\n};\n/**\n * These nulls are placeholders to fix the order of tags (as they appear in PGN spec); null values will be\n * eliminated in getHeaders()\n */\nconst SUPLEMENTAL_TAGS = {\n    WhiteTitle: null,\n    BlackTitle: null,\n    WhiteElo: null,\n    BlackElo: null,\n    WhiteUSCF: null,\n    BlackUSCF: null,\n    WhiteNA: null,\n    BlackNA: null,\n    WhiteType: null,\n    BlackType: null,\n    EventDate: null,\n    EventSponsor: null,\n    Section: null,\n    Stage: null,\n    Board: null,\n    Opening: null,\n    Variation: null,\n    SubVariation: null,\n    ECO: null,\n    NIC: null,\n    Time: null,\n    UTCTime: null,\n    UTCDate: null,\n    TimeControl: null,\n    SetUp: null,\n    FEN: null,\n    Termination: null,\n    Annotator: null,\n    Mode: null,\n    PlyCount: null,\n};\nconst HEADER_TEMPLATE = {\n    ...SEVEN_TAG_ROSTER,\n    ...SUPLEMENTAL_TAGS,\n};\n/* eslint-enable @typescript-eslint/naming-convention */\n/*\n * NOTES ABOUT 0x88 MOVE GENERATION ALGORITHM\n * ----------------------------------------------------------------------------\n * From https://github.com/jhlywa/chess.js/issues/230\n *\n * A lot of people are confused when they first see the internal representation\n * of chess.js. It uses the 0x88 Move Generation Algorithm which internally\n * stores the board as an 8x16 array. This is purely for efficiency but has a\n * couple of interesting benefits:\n *\n * 1. 0x88 offers a very inexpensive \"off the board\" check. Bitwise AND (&) any\n *    square with 0x88, if the result is non-zero then the square is off the\n *    board. For example, assuming a knight square A8 (0 in 0x88 notation),\n *    there are 8 possible directions in which the knight can move. These\n *    directions are relative to the 8x16 board and are stored in the\n *    PIECE_OFFSETS map. One possible move is A8 - 18 (up one square, and two\n *    squares to the left - which is off the board). 0 - 18 = -18 & 0x88 = 0x88\n *    (because of two-complement representation of -18). The non-zero result\n *    means the square is off the board and the move is illegal. Take the\n *    opposite move (from A8 to C7), 0 + 18 = 18 & 0x88 = 0. A result of zero\n *    means the square is on the board.\n *\n * 2. The relative distance (or difference) between two squares on a 8x16 board\n *    is unique and can be used to inexpensively determine if a piece on a\n *    square can attack any other arbitrary square. For example, let's see if a\n *    pawn on E7 can attack E2. The difference between E7 (20) - E2 (100) is\n *    -80. We add 119 to make the ATTACKS array index non-negative (because the\n *    worst case difference is A8 - H1 = -119). The ATTACKS array contains a\n *    bitmask of pieces that can attack from that distance and direction.\n *    ATTACKS[-80 + 119=39] gives us 24 or 0b11000 in binary. Look at the\n *    PIECE_MASKS map to determine the mask for a given piece type. In our pawn\n *    example, we would check to see if 24 & 0x1 is non-zero, which it is\n *    not. So, naturally, a pawn on E7 can't attack a piece on E2. However, a\n *    rook can since 24 & 0x8 is non-zero. The only thing left to check is that\n *    there are no blocking pieces between E7 and E2. That's where the RAYS\n *    array comes in. It provides an offset (in this case 16) to add to E7 (20)\n *    to check for blocking pieces. E7 (20) + 16 = E6 (36) + 16 = E5 (52) etc.\n */\n// prettier-ignore\n// eslint-disable-next-line\nconst Ox88 = {\n    a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,\n    a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,\n    a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,\n    a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,\n    a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,\n    a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,\n    a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,\n    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119\n};\nconst PAWN_OFFSETS = {\n    b: [16, 32, 17, 15],\n    w: [-16, -32, -17, -15],\n};\nconst PIECE_OFFSETS = {\n    n: [-18, -33, -31, -14, 18, 33, 31, 14],\n    b: [-17, -15, 17, 15],\n    r: [-16, 1, 16, -1],\n    q: [-17, -16, -15, 1, 17, 16, 15, -1],\n    k: [-17, -16, -15, 1, 17, 16, 15, -1],\n};\n// prettier-ignore\nconst ATTACKS = [\n    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,\n    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,\n    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,\n    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,\n    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,\n    24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,\n    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,\n    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,\n    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,\n    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,\n    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20\n];\n// prettier-ignore\nconst RAYS = [\n    17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,\n    0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,\n    0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,\n    0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,\n    0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,\n    1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,\n    0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,\n    0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,\n    0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,\n    0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,\n    0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,\n    -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17\n];\nconst PIECE_MASKS = { p: 0x1, n: 0x2, b: 0x4, r: 0x8, q: 0x10, k: 0x20 };\nconst SYMBOLS = 'pnbrqkPNBRQK';\nconst PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN];\nconst RANK_1 = 7;\nconst RANK_2 = 6;\n/*\n * const RANK_3 = 5\n * const RANK_4 = 4\n * const RANK_5 = 3\n * const RANK_6 = 2\n */\nconst RANK_7 = 1;\nconst RANK_8 = 0;\nconst SIDES = {\n    [KING]: BITS.KSIDE_CASTLE,\n    [QUEEN]: BITS.QSIDE_CASTLE,\n};\nconst ROOKS = {\n    w: [\n        { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },\n        { square: Ox88.h1, flag: BITS.KSIDE_CASTLE },\n    ],\n    b: [\n        { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },\n        { square: Ox88.h8, flag: BITS.KSIDE_CASTLE },\n    ],\n};\nconst SECOND_RANK = { b: RANK_7, w: RANK_2 };\nconst SAN_NULLMOVE = '--';\n// Extracts the zero-based rank of an 0x88 square.\nfunction rank(square) {\n    return square >> 4;\n}\n// Extracts the zero-based file of an 0x88 square.\nfunction file(square) {\n    return square & 0xf;\n}\nfunction isDigit(c) {\n    return '0123456789'.indexOf(c) !== -1;\n}\n// Converts a 0x88 square to algebraic notation.\nfunction algebraic(square) {\n    const f = file(square);\n    const r = rank(square);\n    return ('abcdefgh'.substring(f, f + 1) +\n        '87654321'.substring(r, r + 1));\n}\nfunction swapColor(color) {\n    return color === WHITE ? BLACK : WHITE;\n}\nfunction validateFen(fen) {\n    // 1st criterion: 6 space-seperated fields?\n    const tokens = fen.split(/\\s+/);\n    if (tokens.length !== 6) {\n        return {\n            ok: false,\n            error: 'Invalid FEN: must contain six space-delimited fields',\n        };\n    }\n    // 2nd criterion: move number field is a integer value > 0?\n    const moveNumber = parseInt(tokens[5], 10);\n    if (isNaN(moveNumber) || moveNumber <= 0) {\n        return {\n            ok: false,\n            error: 'Invalid FEN: move number must be a positive integer',\n        };\n    }\n    // 3rd criterion: half move counter is an integer >= 0?\n    const halfMoves = parseInt(tokens[4], 10);\n    if (isNaN(halfMoves) || halfMoves < 0) {\n        return {\n            ok: false,\n            error: 'Invalid FEN: half move counter number must be a non-negative integer',\n        };\n    }\n    // 4th criterion: 4th field is a valid e.p.-string?\n    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {\n        return { ok: false, error: 'Invalid FEN: en-passant square is invalid' };\n    }\n    // 5th criterion: 3th field is a valid castle-string?\n    if (/[^kKqQ-]/.test(tokens[2])) {\n        return { ok: false, error: 'Invalid FEN: castling availability is invalid' };\n    }\n    // 6th criterion: 2nd field is \"w\" (white) or \"b\" (black)?\n    if (!/^(w|b)$/.test(tokens[1])) {\n        return { ok: false, error: 'Invalid FEN: side-to-move is invalid' };\n    }\n    // 7th criterion: 1st field contains 8 rows?\n    const rows = tokens[0].split('/');\n    if (rows.length !== 8) {\n        return {\n            ok: false,\n            error: \"Invalid FEN: piece data does not contain 8 '/'-delimited rows\",\n        };\n    }\n    // 8th criterion: every row is valid?\n    for (let i = 0; i < rows.length; i++) {\n        // check for right sum of fields AND not two numbers in succession\n        let sumFields = 0;\n        let previousWasNumber = false;\n        for (let k = 0; k < rows[i].length; k++) {\n            if (isDigit(rows[i][k])) {\n                if (previousWasNumber) {\n                    return {\n                        ok: false,\n                        error: 'Invalid FEN: piece data is invalid (consecutive number)',\n                    };\n                }\n                sumFields += parseInt(rows[i][k], 10);\n                previousWasNumber = true;\n            }\n            else {\n                if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {\n                    return {\n                        ok: false,\n                        error: 'Invalid FEN: piece data is invalid (invalid piece)',\n                    };\n                }\n                sumFields += 1;\n                previousWasNumber = false;\n            }\n        }\n        if (sumFields !== 8) {\n            return {\n                ok: false,\n                error: 'Invalid FEN: piece data is invalid (too many squares in rank)',\n            };\n        }\n    }\n    // 9th criterion: is en-passant square legal?\n    if ((tokens[3][1] == '3' && tokens[1] == 'w') ||\n        (tokens[3][1] == '6' && tokens[1] == 'b')) {\n        return { ok: false, error: 'Invalid FEN: illegal en-passant square' };\n    }\n    // 10th criterion: does chess position contain exact two kings?\n    const kings = [\n        { color: 'white', regex: /K/g },\n        { color: 'black', regex: /k/g },\n    ];\n    for (const { color, regex } of kings) {\n        if (!regex.test(tokens[0])) {\n            return { ok: false, error: `Invalid FEN: missing ${color} king` };\n        }\n        if ((tokens[0].match(regex) || []).length > 1) {\n            return { ok: false, error: `Invalid FEN: too many ${color} kings` };\n        }\n    }\n    // 11th criterion: are any pawns on the first or eighth rows?\n    if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === 'P')) {\n        return {\n            ok: false,\n            error: 'Invalid FEN: some pawns are on the edge rows',\n        };\n    }\n    return { ok: true };\n}\n// this function is used to uniquely identify ambiguous moves\nfunction getDisambiguator(move, moves) {\n    const from = move.from;\n    const to = move.to;\n    const piece = move.piece;\n    let ambiguities = 0;\n    let sameRank = 0;\n    let sameFile = 0;\n    for (let i = 0, len = moves.length; i < len; i++) {\n        const ambigFrom = moves[i].from;\n        const ambigTo = moves[i].to;\n        const ambigPiece = moves[i].piece;\n        /*\n         * if a move of the same piece type ends on the same to square, we'll need\n         * to add a disambiguator to the algebraic notation\n         */\n        if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {\n            ambiguities++;\n            if (rank(from) === rank(ambigFrom)) {\n                sameRank++;\n            }\n            if (file(from) === file(ambigFrom)) {\n                sameFile++;\n            }\n        }\n    }\n    if (ambiguities > 0) {\n        if (sameRank > 0 && sameFile > 0) {\n            /*\n             * if there exists a similar moving piece on the same rank and file as\n             * the move in question, use the square as the disambiguator\n             */\n            return algebraic(from);\n        }\n        else if (sameFile > 0) {\n            /*\n             * if the moving piece rests on the same file, use the rank symbol as the\n             * disambiguator\n             */\n            return algebraic(from).charAt(1);\n        }\n        else {\n            // else use the file symbol\n            return algebraic(from).charAt(0);\n        }\n    }\n    return '';\n}\nfunction addMove(moves, color, from, to, piece, captured = undefined, flags = BITS.NORMAL) {\n    const r = rank(to);\n    if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {\n        for (let i = 0; i < PROMOTIONS.length; i++) {\n            const promotion = PROMOTIONS[i];\n            moves.push({\n                color,\n                from,\n                to,\n                piece,\n                captured,\n                promotion,\n                flags: flags | BITS.PROMOTION,\n            });\n        }\n    }\n    else {\n        moves.push({\n            color,\n            from,\n            to,\n            piece,\n            captured,\n            flags,\n        });\n    }\n}\nfunction inferPieceType(san) {\n    let pieceType = san.charAt(0);\n    if (pieceType >= 'a' && pieceType <= 'h') {\n        const matches = san.match(/[a-h]\\d.*[a-h]\\d/);\n        if (matches) {\n            return undefined;\n        }\n        return PAWN;\n    }\n    pieceType = pieceType.toLowerCase();\n    if (pieceType === 'o') {\n        return KING;\n    }\n    return pieceType;\n}\n// parses all of the decorators out of a SAN string\nfunction strippedSan(move) {\n    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');\n}\nclass Chess {\n    _board = new Array(128);\n    _turn = WHITE;\n    _header = {};\n    _kings = { w: EMPTY, b: EMPTY };\n    _epSquare = -1;\n    _halfMoves = 0;\n    _moveNumber = 0;\n    _history = [];\n    _comments = {};\n    _castling = { w: 0, b: 0 };\n    _hash = 0n;\n    // tracks number of times a position has been seen for repetition checking\n    _positionCount = new Map();\n    constructor(fen = DEFAULT_POSITION, { skipValidation = false } = {}) {\n        this.load(fen, { skipValidation });\n    }\n    clear({ preserveHeaders = false } = {}) {\n        this._board = new Array(128);\n        this._kings = { w: EMPTY, b: EMPTY };\n        this._turn = WHITE;\n        this._castling = { w: 0, b: 0 };\n        this._epSquare = EMPTY;\n        this._halfMoves = 0;\n        this._moveNumber = 1;\n        this._history = [];\n        this._comments = {};\n        this._header = preserveHeaders ? this._header : { ...HEADER_TEMPLATE };\n        this._hash = this._computeHash();\n        this._positionCount = new Map();\n        /*\n         * Delete the SetUp and FEN headers (if preserved), the board is empty and\n         * these headers don't make sense in this state. They'll get added later\n         * via .load() or .put()\n         */\n        this._header['SetUp'] = null;\n        this._header['FEN'] = null;\n    }\n    load(fen, { skipValidation = false, preserveHeaders = false } = {}) {\n        let tokens = fen.split(/\\s+/);\n        // append commonly omitted fen tokens\n        if (tokens.length >= 2 && tokens.length < 6) {\n            const adjustments = ['-', '-', '0', '1'];\n            fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(' ');\n        }\n        tokens = fen.split(/\\s+/);\n        if (!skipValidation) {\n            const { ok, error } = validateFen(fen);\n            if (!ok) {\n                throw new Error(error);\n            }\n        }\n        const position = tokens[0];\n        let square = 0;\n        this.clear({ preserveHeaders });\n        for (let i = 0; i < position.length; i++) {\n            const piece = position.charAt(i);\n            if (piece === '/') {\n                square += 8;\n            }\n            else if (isDigit(piece)) {\n                square += parseInt(piece, 10);\n            }\n            else {\n                const color = piece < 'a' ? WHITE : BLACK;\n                this._put({ type: piece.toLowerCase(), color }, algebraic(square));\n                square++;\n            }\n        }\n        this._turn = tokens[1];\n        if (tokens[2].indexOf('K') > -1) {\n            this._castling.w |= BITS.KSIDE_CASTLE;\n        }\n        if (tokens[2].indexOf('Q') > -1) {\n            this._castling.w |= BITS.QSIDE_CASTLE;\n        }\n        if (tokens[2].indexOf('k') > -1) {\n            this._castling.b |= BITS.KSIDE_CASTLE;\n        }\n        if (tokens[2].indexOf('q') > -1) {\n            this._castling.b |= BITS.QSIDE_CASTLE;\n        }\n        this._epSquare = tokens[3] === '-' ? EMPTY : Ox88[tokens[3]];\n        this._halfMoves = parseInt(tokens[4], 10);\n        this._moveNumber = parseInt(tokens[5], 10);\n        this._hash = this._computeHash();\n        this._updateSetup(fen);\n        this._incPositionCount();\n    }\n    fen({ forceEnpassantSquare = false, } = {}) {\n        let empty = 0;\n        let fen = '';\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            if (this._board[i]) {\n                if (empty > 0) {\n                    fen += empty;\n                    empty = 0;\n                }\n                const { color, type: piece } = this._board[i];\n                fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();\n            }\n            else {\n                empty++;\n            }\n            if ((i + 1) & 0x88) {\n                if (empty > 0) {\n                    fen += empty;\n                }\n                if (i !== Ox88.h1) {\n                    fen += '/';\n                }\n                empty = 0;\n                i += 8;\n            }\n        }\n        let castling = '';\n        if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {\n            castling += 'K';\n        }\n        if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {\n            castling += 'Q';\n        }\n        if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {\n            castling += 'k';\n        }\n        if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {\n            castling += 'q';\n        }\n        // do we have an empty castling flag?\n        castling = castling || '-';\n        let epSquare = '-';\n        /*\n         * only print the ep square if en passant is a valid move (pawn is present\n         * and ep capture is not pinned)\n         */\n        if (this._epSquare !== EMPTY) {\n            if (forceEnpassantSquare) {\n                epSquare = algebraic(this._epSquare);\n            }\n            else {\n                const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);\n                const squares = [bigPawnSquare + 1, bigPawnSquare - 1];\n                for (const square of squares) {\n                    // is the square off the board?\n                    if (square & 0x88) {\n                        continue;\n                    }\n                    const color = this._turn;\n                    // is there a pawn that can capture the epSquare?\n                    if (this._board[square]?.color === color &&\n                        this._board[square]?.type === PAWN) {\n                        // if the pawn makes an ep capture, does it leave its king in check?\n                        this._makeMove({\n                            color,\n                            from: square,\n                            to: this._epSquare,\n                            piece: PAWN,\n                            captured: PAWN,\n                            flags: BITS.EP_CAPTURE,\n                        });\n                        const isLegal = !this._isKingAttacked(color);\n                        this._undoMove();\n                        // if ep is legal, break and set the ep square in the FEN output\n                        if (isLegal) {\n                            epSquare = algebraic(this._epSquare);\n                            break;\n                        }\n                    }\n                }\n            }\n        }\n        return [\n            fen,\n            this._turn,\n            castling,\n            epSquare,\n            this._halfMoves,\n            this._moveNumber,\n        ].join(' ');\n    }\n    _pieceKey(i) {\n        if (!this._board[i]) {\n            return 0n;\n        }\n        const { color, type } = this._board[i];\n        const colorIndex = {\n            w: 0,\n            b: 1,\n        }[color];\n        const typeIndex = {\n            p: 0,\n            n: 1,\n            b: 2,\n            r: 3,\n            q: 4,\n            k: 5,\n        }[type];\n        return PIECE_KEYS[colorIndex][typeIndex][i];\n    }\n    _epKey() {\n        return this._epSquare === EMPTY ? 0n : EP_KEYS[this._epSquare & 7];\n    }\n    _castlingKey() {\n        const index = (this._castling.w >> 5) | (this._castling.b >> 3);\n        return CASTLING_KEYS[index];\n    }\n    _computeHash() {\n        let hash = 0n;\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            // did we run off the end of the board\n            if (i & 0x88) {\n                i += 7;\n                continue;\n            }\n            if (this._board[i]) {\n                hash ^= this._pieceKey(i);\n            }\n        }\n        hash ^= this._epKey();\n        hash ^= this._castlingKey();\n        if (this._turn === 'b') {\n            hash ^= SIDE_KEY;\n        }\n        return hash;\n    }\n    /*\n     * Called when the initial board setup is changed with put() or remove().\n     * modifies the SetUp and FEN properties of the header object. If the FEN\n     * is equal to the default position, the SetUp and FEN are deleted the setup\n     * is only updated if history.length is zero, ie moves haven't been made.\n     */\n    _updateSetup(fen) {\n        if (this._history.length > 0)\n            return;\n        if (fen !== DEFAULT_POSITION) {\n            this._header['SetUp'] = '1';\n            this._header['FEN'] = fen;\n        }\n        else {\n            this._header['SetUp'] = null;\n            this._header['FEN'] = null;\n        }\n    }\n    reset() {\n        this.load(DEFAULT_POSITION);\n    }\n    get(square) {\n        return this._board[Ox88[square]];\n    }\n    findPiece(piece) {\n        const squares = [];\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            // did we run off the end of the board\n            if (i & 0x88) {\n                i += 7;\n                continue;\n            }\n            // if empty square or wrong color\n            if (!this._board[i] || this._board[i]?.color !== piece.color) {\n                continue;\n            }\n            // check if square contains the requested piece\n            if (this._board[i].color === piece.color &&\n                this._board[i].type === piece.type) {\n                squares.push(algebraic(i));\n            }\n        }\n        return squares;\n    }\n    put({ type, color }, square) {\n        if (this._put({ type, color }, square)) {\n            this._updateCastlingRights();\n            this._updateEnPassantSquare();\n            this._updateSetup(this.fen());\n            return true;\n        }\n        return false;\n    }\n    _set(sq, piece) {\n        this._hash ^= this._pieceKey(sq);\n        this._board[sq] = piece;\n        this._hash ^= this._pieceKey(sq);\n    }\n    _put({ type, color }, square) {\n        // check for piece\n        if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {\n            return false;\n        }\n        // check for valid square\n        if (!(square in Ox88)) {\n            return false;\n        }\n        const sq = Ox88[square];\n        // don't let the user place more than one king\n        if (type == KING &&\n            !(this._kings[color] == EMPTY || this._kings[color] == sq)) {\n            return false;\n        }\n        const currentPieceOnSquare = this._board[sq];\n        // if one of the kings will be replaced by the piece from args, set the `_kings` respective entry to `EMPTY`\n        if (currentPieceOnSquare && currentPieceOnSquare.type === KING) {\n            this._kings[currentPieceOnSquare.color] = EMPTY;\n        }\n        this._set(sq, { type: type, color: color });\n        if (type === KING) {\n            this._kings[color] = sq;\n        }\n        return true;\n    }\n    _clear(sq) {\n        this._hash ^= this._pieceKey(sq);\n        delete this._board[sq];\n    }\n    remove(square) {\n        const piece = this.get(square);\n        this._clear(Ox88[square]);\n        if (piece && piece.type === KING) {\n            this._kings[piece.color] = EMPTY;\n        }\n        this._updateCastlingRights();\n        this._updateEnPassantSquare();\n        this._updateSetup(this.fen());\n        return piece;\n    }\n    _updateCastlingRights() {\n        this._hash ^= this._castlingKey();\n        const whiteKingInPlace = this._board[Ox88.e1]?.type === KING &&\n            this._board[Ox88.e1]?.color === WHITE;\n        const blackKingInPlace = this._board[Ox88.e8]?.type === KING &&\n            this._board[Ox88.e8]?.color === BLACK;\n        if (!whiteKingInPlace ||\n            this._board[Ox88.a1]?.type !== ROOK ||\n            this._board[Ox88.a1]?.color !== WHITE) {\n            this._castling.w &= -65;\n        }\n        if (!whiteKingInPlace ||\n            this._board[Ox88.h1]?.type !== ROOK ||\n            this._board[Ox88.h1]?.color !== WHITE) {\n            this._castling.w &= -33;\n        }\n        if (!blackKingInPlace ||\n            this._board[Ox88.a8]?.type !== ROOK ||\n            this._board[Ox88.a8]?.color !== BLACK) {\n            this._castling.b &= -65;\n        }\n        if (!blackKingInPlace ||\n            this._board[Ox88.h8]?.type !== ROOK ||\n            this._board[Ox88.h8]?.color !== BLACK) {\n            this._castling.b &= -33;\n        }\n        this._hash ^= this._castlingKey();\n    }\n    _updateEnPassantSquare() {\n        if (this._epSquare === EMPTY) {\n            return;\n        }\n        const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);\n        const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);\n        const attackers = [currentSquare + 1, currentSquare - 1];\n        if (this._board[startSquare] !== null ||\n            this._board[this._epSquare] !== null ||\n            this._board[currentSquare]?.color !== swapColor(this._turn) ||\n            this._board[currentSquare]?.type !== PAWN) {\n            this._hash ^= this._epKey();\n            this._epSquare = EMPTY;\n            return;\n        }\n        const canCapture = (square) => !(square & 0x88) &&\n            this._board[square]?.color === this._turn &&\n            this._board[square]?.type === PAWN;\n        if (!attackers.some(canCapture)) {\n            this._hash ^= this._epKey();\n            this._epSquare = EMPTY;\n        }\n    }\n    _attacked(color, square, verbose) {\n        const attackers = [];\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            // did we run off the end of the board\n            if (i & 0x88) {\n                i += 7;\n                continue;\n            }\n            // if empty square or wrong color\n            if (this._board[i] === undefined || this._board[i].color !== color) {\n                continue;\n            }\n            const piece = this._board[i];\n            const difference = i - square;\n            // skip - to/from square are the same\n            if (difference === 0) {\n                continue;\n            }\n            const index = difference + 119;\n            if (ATTACKS[index] & PIECE_MASKS[piece.type]) {\n                if (piece.type === PAWN) {\n                    if ((difference > 0 && piece.color === WHITE) ||\n                        (difference <= 0 && piece.color === BLACK)) {\n                        if (!verbose) {\n                            return true;\n                        }\n                        else {\n                            attackers.push(algebraic(i));\n                        }\n                    }\n                    continue;\n                }\n                // if the piece is a knight or a king\n                if (piece.type === 'n' || piece.type === 'k') {\n                    if (!verbose) {\n                        return true;\n                    }\n                    else {\n                        attackers.push(algebraic(i));\n                        continue;\n                    }\n                }\n                const offset = RAYS[index];\n                let j = i + offset;\n                let blocked = false;\n                while (j !== square) {\n                    if (this._board[j] != null) {\n                        blocked = true;\n                        break;\n                    }\n                    j += offset;\n                }\n                if (!blocked) {\n                    if (!verbose) {\n                        return true;\n                    }\n                    else {\n                        attackers.push(algebraic(i));\n                        continue;\n                    }\n                }\n            }\n        }\n        if (verbose) {\n            return attackers;\n        }\n        else {\n            return false;\n        }\n    }\n    attackers(square, attackedBy) {\n        if (!attackedBy) {\n            return this._attacked(this._turn, Ox88[square], true);\n        }\n        else {\n            return this._attacked(attackedBy, Ox88[square], true);\n        }\n    }\n    _isKingAttacked(color) {\n        const square = this._kings[color];\n        return square === -1 ? false : this._attacked(swapColor(color), square);\n    }\n    hash() {\n        return this._hash.toString(16);\n    }\n    isAttacked(square, attackedBy) {\n        return this._attacked(attackedBy, Ox88[square]);\n    }\n    isCheck() {\n        return this._isKingAttacked(this._turn);\n    }\n    inCheck() {\n        return this.isCheck();\n    }\n    isCheckmate() {\n        return this.isCheck() && this._moves().length === 0;\n    }\n    isStalemate() {\n        return !this.isCheck() && this._moves().length === 0;\n    }\n    isInsufficientMaterial() {\n        /*\n         * k.b. vs k.b. (of opposite colors) with mate in 1:\n         * 8/8/8/8/1b6/8/B1k5/K7 b - - 0 1\n         *\n         * k.b. vs k.n. with mate in 1:\n         * 8/8/8/8/1n6/8/B7/K1k5 b - - 2 1\n         */\n        const pieces = {\n            b: 0,\n            n: 0,\n            r: 0,\n            q: 0,\n            k: 0,\n            p: 0,\n        };\n        const bishops = [];\n        let numPieces = 0;\n        let squareColor = 0;\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            squareColor = (squareColor + 1) % 2;\n            if (i & 0x88) {\n                i += 7;\n                continue;\n            }\n            const piece = this._board[i];\n            if (piece) {\n                pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;\n                if (piece.type === BISHOP) {\n                    bishops.push(squareColor);\n                }\n                numPieces++;\n            }\n        }\n        // k vs. k\n        if (numPieces === 2) {\n            return true;\n        }\n        else if (\n        // k vs. kn .... or .... k vs. kb\n        numPieces === 3 &&\n            (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)) {\n            return true;\n        }\n        else if (numPieces === pieces[BISHOP] + 2) {\n            // kb vs. kb where any number of bishops are all on the same color\n            let sum = 0;\n            const len = bishops.length;\n            for (let i = 0; i < len; i++) {\n                sum += bishops[i];\n            }\n            if (sum === 0 || sum === len) {\n                return true;\n            }\n        }\n        return false;\n    }\n    isThreefoldRepetition() {\n        return this._getPositionCount(this._hash) >= 3;\n    }\n    isDrawByFiftyMoves() {\n        return this._halfMoves >= 100; // 50 moves per side = 100 half moves\n    }\n    isDraw() {\n        return (this.isDrawByFiftyMoves() ||\n            this.isStalemate() ||\n            this.isInsufficientMaterial() ||\n            this.isThreefoldRepetition());\n    }\n    isGameOver() {\n        return this.isCheckmate() || this.isDraw();\n    }\n    moves({ verbose = false, square = undefined, piece = undefined, } = {}) {\n        const moves = this._moves({ square, piece });\n        if (verbose) {\n            return moves.map((move) => new Move(this, move));\n        }\n        else {\n            return moves.map((move) => this._moveToSan(move, moves));\n        }\n    }\n    _moves({ legal = true, piece = undefined, square = undefined, } = {}) {\n        const forSquare = square ? square.toLowerCase() : undefined;\n        const forPiece = piece?.toLowerCase();\n        const moves = [];\n        const us = this._turn;\n        const them = swapColor(us);\n        let firstSquare = Ox88.a8;\n        let lastSquare = Ox88.h1;\n        let singleSquare = false;\n        // are we generating moves for a single square?\n        if (forSquare) {\n            // illegal square, return empty moves\n            if (!(forSquare in Ox88)) {\n                return [];\n            }\n            else {\n                firstSquare = lastSquare = Ox88[forSquare];\n                singleSquare = true;\n            }\n        }\n        for (let from = firstSquare; from <= lastSquare; from++) {\n            // did we run off the end of the board\n            if (from & 0x88) {\n                from += 7;\n                continue;\n            }\n            // empty square or opponent, skip\n            if (!this._board[from] || this._board[from].color === them) {\n                continue;\n            }\n            const { type } = this._board[from];\n            let to;\n            if (type === PAWN) {\n                if (forPiece && forPiece !== type)\n                    continue;\n                // single square, non-capturing\n                to = from + PAWN_OFFSETS[us][0];\n                if (!this._board[to]) {\n                    addMove(moves, us, from, to, PAWN);\n                    // double square\n                    to = from + PAWN_OFFSETS[us][1];\n                    if (SECOND_RANK[us] === rank(from) && !this._board[to]) {\n                        addMove(moves, us, from, to, PAWN, undefined, BITS.BIG_PAWN);\n                    }\n                }\n                // pawn captures\n                for (let j = 2; j < 4; j++) {\n                    to = from + PAWN_OFFSETS[us][j];\n                    if (to & 0x88)\n                        continue;\n                    if (this._board[to]?.color === them) {\n                        addMove(moves, us, from, to, PAWN, this._board[to].type, BITS.CAPTURE);\n                    }\n                    else if (to === this._epSquare) {\n                        addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE);\n                    }\n                }\n            }\n            else {\n                if (forPiece && forPiece !== type)\n                    continue;\n                for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {\n                    const offset = PIECE_OFFSETS[type][j];\n                    to = from;\n                    while (true) {\n                        to += offset;\n                        if (to & 0x88)\n                            break;\n                        if (!this._board[to]) {\n                            addMove(moves, us, from, to, type);\n                        }\n                        else {\n                            // own color, stop loop\n                            if (this._board[to].color === us)\n                                break;\n                            addMove(moves, us, from, to, type, this._board[to].type, BITS.CAPTURE);\n                            break;\n                        }\n                        /* break, if knight or king */\n                        if (type === KNIGHT || type === KING)\n                            break;\n                    }\n                }\n            }\n        }\n        /*\n         * check for castling if we're:\n         *   a) generating all moves, or\n         *   b) doing single square move generation on the king's square\n         */\n        if (forPiece === undefined || forPiece === KING) {\n            if (!singleSquare || lastSquare === this._kings[us]) {\n                // king-side castling\n                if (this._castling[us] & BITS.KSIDE_CASTLE) {\n                    const castlingFrom = this._kings[us];\n                    const castlingTo = castlingFrom + 2;\n                    if (!this._board[castlingFrom + 1] &&\n                        !this._board[castlingTo] &&\n                        !this._attacked(them, this._kings[us]) &&\n                        !this._attacked(them, castlingFrom + 1) &&\n                        !this._attacked(them, castlingTo)) {\n                        addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.KSIDE_CASTLE);\n                    }\n                }\n                // queen-side castling\n                if (this._castling[us] & BITS.QSIDE_CASTLE) {\n                    const castlingFrom = this._kings[us];\n                    const castlingTo = castlingFrom - 2;\n                    if (!this._board[castlingFrom - 1] &&\n                        !this._board[castlingFrom - 2] &&\n                        !this._board[castlingFrom - 3] &&\n                        !this._attacked(them, this._kings[us]) &&\n                        !this._attacked(them, castlingFrom - 1) &&\n                        !this._attacked(them, castlingTo)) {\n                        addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.QSIDE_CASTLE);\n                    }\n                }\n            }\n        }\n        /*\n         * return all pseudo-legal moves (this includes moves that allow the king\n         * to be captured)\n         */\n        if (!legal || this._kings[us] === -1) {\n            return moves;\n        }\n        // filter out illegal moves\n        const legalMoves = [];\n        for (let i = 0, len = moves.length; i < len; i++) {\n            this._makeMove(moves[i]);\n            if (!this._isKingAttacked(us)) {\n                legalMoves.push(moves[i]);\n            }\n            this._undoMove();\n        }\n        return legalMoves;\n    }\n    move(move, { strict = false } = {}) {\n        /*\n         * The move function can be called with in the following parameters:\n         *\n         * .move('Nxb7')       <- argument is a case-sensitive SAN string\n         *\n         * .move({ from: 'h7', <- argument is a move object\n         *         to :'h8',\n         *         promotion: 'q' })\n         *\n         *\n         * An optional strict argument may be supplied to tell chess.js to\n         * strictly follow the SAN specification.\n         */\n        let moveObj = null;\n        if (typeof move === 'string') {\n            moveObj = this._moveFromSan(move, strict);\n        }\n        else if (move === null) {\n            moveObj = this._moveFromSan(SAN_NULLMOVE, strict);\n        }\n        else if (typeof move === 'object') {\n            const moves = this._moves();\n            // convert the pretty move object to an ugly move object\n            for (let i = 0, len = moves.length; i < len; i++) {\n                if (move.from === algebraic(moves[i].from) &&\n                    move.to === algebraic(moves[i].to) &&\n                    (!('promotion' in moves[i]) || move.promotion === moves[i].promotion)) {\n                    moveObj = moves[i];\n                    break;\n                }\n            }\n        }\n        // failed to find move\n        if (!moveObj) {\n            if (typeof move === 'string') {\n                throw new Error(`Invalid move: ${move}`);\n            }\n            else {\n                throw new Error(`Invalid move: ${JSON.stringify(move)}`);\n            }\n        }\n        //disallow null moves when in check\n        if (this.isCheck() && moveObj.flags & BITS.NULL_MOVE) {\n            throw new Error('Null move not allowed when in check');\n        }\n        /*\n         * need to make a copy of move because we can't generate SAN after the move\n         * is made\n         */\n        const prettyMove = new Move(this, moveObj);\n        this._makeMove(moveObj);\n        this._incPositionCount();\n        return prettyMove;\n    }\n    _push(move) {\n        this._history.push({\n            move,\n            kings: { b: this._kings.b, w: this._kings.w },\n            turn: this._turn,\n            castling: { b: this._castling.b, w: this._castling.w },\n            epSquare: this._epSquare,\n            halfMoves: this._halfMoves,\n            moveNumber: this._moveNumber,\n        });\n    }\n    _movePiece(from, to) {\n        this._hash ^= this._pieceKey(from);\n        this._board[to] = this._board[from];\n        delete this._board[from];\n        this._hash ^= this._pieceKey(to);\n    }\n    _makeMove(move) {\n        const us = this._turn;\n        const them = swapColor(us);\n        this._push(move);\n        if (move.flags & BITS.NULL_MOVE) {\n            if (us === BLACK) {\n                this._moveNumber++;\n            }\n            this._halfMoves++;\n            this._turn = them;\n            this._epSquare = EMPTY;\n            return;\n        }\n        this._hash ^= this._epKey();\n        this._hash ^= this._castlingKey();\n        if (move.captured) {\n            this._hash ^= this._pieceKey(move.to);\n        }\n        this._movePiece(move.from, move.to);\n        // if ep capture, remove the captured pawn\n        if (move.flags & BITS.EP_CAPTURE) {\n            if (this._turn === BLACK) {\n                this._clear(move.to - 16);\n            }\n            else {\n                this._clear(move.to + 16);\n            }\n        }\n        // if pawn promotion, replace with new piece\n        if (move.promotion) {\n            this._clear(move.to);\n            this._set(move.to, { type: move.promotion, color: us });\n        }\n        // if we moved the king\n        if (this._board[move.to].type === KING) {\n            this._kings[us] = move.to;\n            // if we castled, move the rook next to the king\n            if (move.flags & BITS.KSIDE_CASTLE) {\n                const castlingTo = move.to - 1;\n                const castlingFrom = move.to + 1;\n                this._movePiece(castlingFrom, castlingTo);\n            }\n            else if (move.flags & BITS.QSIDE_CASTLE) {\n                const castlingTo = move.to + 1;\n                const castlingFrom = move.to - 2;\n                this._movePiece(castlingFrom, castlingTo);\n            }\n            // turn off castling\n            this._castling[us] = 0;\n        }\n        // turn off castling if we move a rook\n        if (this._castling[us]) {\n            for (let i = 0, len = ROOKS[us].length; i < len; i++) {\n                if (move.from === ROOKS[us][i].square &&\n                    this._castling[us] & ROOKS[us][i].flag) {\n                    this._castling[us] ^= ROOKS[us][i].flag;\n                    break;\n                }\n            }\n        }\n        // turn off castling if we capture a rook\n        if (this._castling[them]) {\n            for (let i = 0, len = ROOKS[them].length; i < len; i++) {\n                if (move.to === ROOKS[them][i].square &&\n                    this._castling[them] & ROOKS[them][i].flag) {\n                    this._castling[them] ^= ROOKS[them][i].flag;\n                    break;\n                }\n            }\n        }\n        this._hash ^= this._castlingKey();\n        // if big pawn move, update the en passant square\n        if (move.flags & BITS.BIG_PAWN) {\n            let epSquare;\n            if (us === BLACK) {\n                epSquare = move.to - 16;\n            }\n            else {\n                epSquare = move.to + 16;\n            }\n            if ((!((move.to - 1) & 0x88) &&\n                this._board[move.to - 1]?.type === PAWN &&\n                this._board[move.to - 1]?.color === them) ||\n                (!((move.to + 1) & 0x88) &&\n                    this._board[move.to + 1]?.type === PAWN &&\n                    this._board[move.to + 1]?.color === them)) {\n                this._epSquare = epSquare;\n                this._hash ^= this._epKey();\n            }\n            else {\n                this._epSquare = EMPTY;\n            }\n        }\n        else {\n            this._epSquare = EMPTY;\n        }\n        // reset the 50 move counter if a pawn is moved or a piece is captured\n        if (move.piece === PAWN) {\n            this._halfMoves = 0;\n        }\n        else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {\n            this._halfMoves = 0;\n        }\n        else {\n            this._halfMoves++;\n        }\n        if (us === BLACK) {\n            this._moveNumber++;\n        }\n        this._turn = them;\n        this._hash ^= SIDE_KEY;\n    }\n    undo() {\n        const hash = this._hash;\n        const move = this._undoMove();\n        if (move) {\n            const prettyMove = new Move(this, move);\n            this._decPositionCount(hash);\n            return prettyMove;\n        }\n        return null;\n    }\n    _undoMove() {\n        const old = this._history.pop();\n        if (old === undefined) {\n            return null;\n        }\n        this._hash ^= this._epKey();\n        this._hash ^= this._castlingKey();\n        const move = old.move;\n        this._kings = old.kings;\n        this._turn = old.turn;\n        this._castling = old.castling;\n        this._epSquare = old.epSquare;\n        this._halfMoves = old.halfMoves;\n        this._moveNumber = old.moveNumber;\n        this._hash ^= this._epKey();\n        this._hash ^= this._castlingKey();\n        this._hash ^= SIDE_KEY;\n        const us = this._turn;\n        const them = swapColor(us);\n        if (move.flags & BITS.NULL_MOVE) {\n            return move;\n        }\n        this._movePiece(move.to, move.from);\n        // to undo any promotions\n        if (move.piece) {\n            this._clear(move.from);\n            this._set(move.from, { type: move.piece, color: us });\n        }\n        if (move.captured) {\n            if (move.flags & BITS.EP_CAPTURE) {\n                // en passant capture\n                let index;\n                if (us === BLACK) {\n                    index = move.to - 16;\n                }\n                else {\n                    index = move.to + 16;\n                }\n                this._set(index, { type: PAWN, color: them });\n            }\n            else {\n                // regular capture\n                this._set(move.to, { type: move.captured, color: them });\n            }\n        }\n        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {\n            let castlingTo, castlingFrom;\n            if (move.flags & BITS.KSIDE_CASTLE) {\n                castlingTo = move.to + 1;\n                castlingFrom = move.to - 1;\n            }\n            else {\n                castlingTo = move.to - 2;\n                castlingFrom = move.to + 1;\n            }\n            this._movePiece(castlingFrom, castlingTo);\n        }\n        return move;\n    }\n    pgn({ newline = '\\n', maxWidth = 0, } = {}) {\n        /*\n         * using the specification from http://www.chessclub.com/help/PGN-spec\n         * example for html usage: .pgn({ max_width: 72, newline_char: \"<br />\" })\n         */\n        const result = [];\n        let headerExists = false;\n        /* add the PGN header information */\n        for (const i in this._header) {\n            /*\n             * TODO: order of enumerated properties in header object is not\n             * guaranteed, see ECMA-262 spec (section 12.6.4)\n             *\n             * By using HEADER_TEMPLATE, the order of tags should be preserved; we\n             * do have to check for null placeholders, though, and omit them\n             */\n            const headerTag = this._header[i];\n            if (headerTag)\n                result.push(`[${i} \"${this._header[i]}\"]` + newline);\n            headerExists = true;\n        }\n        if (headerExists && this._history.length) {\n            result.push(newline);\n        }\n        const appendComment = (moveString) => {\n            const comment = this._comments[this.fen()];\n            if (typeof comment !== 'undefined') {\n                const delimiter = moveString.length > 0 ? ' ' : '';\n                moveString = `${moveString}${delimiter}{${comment}}`;\n            }\n            return moveString;\n        };\n        // pop all of history onto reversed_history\n        const reversedHistory = [];\n        while (this._history.length > 0) {\n            reversedHistory.push(this._undoMove());\n        }\n        const moves = [];\n        let moveString = '';\n        // special case of a commented starting position with no moves\n        if (reversedHistory.length === 0) {\n            moves.push(appendComment(''));\n        }\n        // build the list of moves.  a move_string looks like: \"3. e3 e6\"\n        while (reversedHistory.length > 0) {\n            moveString = appendComment(moveString);\n            const move = reversedHistory.pop();\n            // make TypeScript stop complaining about move being undefined\n            if (!move) {\n                break;\n            }\n            // if the position started with black to move, start PGN with #. ...\n            if (!this._history.length && move.color === 'b') {\n                const prefix = `${this._moveNumber}. ...`;\n                // is there a comment preceding the first move?\n                moveString = moveString ? `${moveString} ${prefix}` : prefix;\n            }\n            else if (move.color === 'w') {\n                // store the previous generated move_string if we have one\n                if (moveString.length) {\n                    moves.push(moveString);\n                }\n                moveString = this._moveNumber + '.';\n            }\n            moveString =\n                moveString + ' ' + this._moveToSan(move, this._moves({ legal: true }));\n            this._makeMove(move);\n        }\n        // are there any other leftover moves?\n        if (moveString.length) {\n            moves.push(appendComment(moveString));\n        }\n        // is there a result? (there ALWAYS has to be a result according to spec; see Seven Tag Roster)\n        moves.push(this._header.Result || '*');\n        /*\n         * history should be back to what it was before we started generating PGN,\n         * so join together moves\n         */\n        if (maxWidth === 0) {\n            return result.join('') + moves.join(' ');\n        }\n        // TODO (jah): huh?\n        const strip = function () {\n            if (result.length > 0 && result[result.length - 1] === ' ') {\n                result.pop();\n                return true;\n            }\n            return false;\n        };\n        // NB: this does not preserve comment whitespace.\n        const wrapComment = function (width, move) {\n            for (const token of move.split(' ')) {\n                if (!token) {\n                    continue;\n                }\n                if (width + token.length > maxWidth) {\n                    while (strip()) {\n                        width--;\n                    }\n                    result.push(newline);\n                    width = 0;\n                }\n                result.push(token);\n                width += token.length;\n                result.push(' ');\n                width++;\n            }\n            if (strip()) {\n                width--;\n            }\n            return width;\n        };\n        // wrap the PGN output at max_width\n        let currentWidth = 0;\n        for (let i = 0; i < moves.length; i++) {\n            if (currentWidth + moves[i].length > maxWidth) {\n                if (moves[i].includes('{')) {\n                    currentWidth = wrapComment(currentWidth, moves[i]);\n                    continue;\n                }\n            }\n            // if the current move will push past max_width\n            if (currentWidth + moves[i].length > maxWidth && i !== 0) {\n                // don't end the line with whitespace\n                if (result[result.length - 1] === ' ') {\n                    result.pop();\n                }\n                result.push(newline);\n                currentWidth = 0;\n            }\n            else if (i !== 0) {\n                result.push(' ');\n                currentWidth++;\n            }\n            result.push(moves[i]);\n            currentWidth += moves[i].length;\n        }\n        return result.join('');\n    }\n    /**\n     * @deprecated Use `setHeader` and `getHeaders` instead. This method will return null header tags (which is not what you want)\n     */\n    header(...args) {\n        for (let i = 0; i < args.length; i += 2) {\n            if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {\n                this._header[args[i]] = args[i + 1];\n            }\n        }\n        return this._header;\n    }\n    // TODO: value validation per spec\n    setHeader(key, value) {\n        this._header[key] = value ?? SEVEN_TAG_ROSTER[key] ?? null;\n        return this.getHeaders();\n    }\n    removeHeader(key) {\n        if (key in this._header) {\n            this._header[key] = SEVEN_TAG_ROSTER[key] || null;\n            return true;\n        }\n        return false;\n    }\n    // return only non-null headers (omit placemarker nulls)\n    getHeaders() {\n        const nonNullHeaders = {};\n        for (const [key, value] of Object.entries(this._header)) {\n            if (value !== null) {\n                nonNullHeaders[key] = value;\n            }\n        }\n        return nonNullHeaders;\n    }\n    loadPgn(pgn, { strict = false, newlineChar = '\\r?\\n', } = {}) {\n        // If newlineChar is not the default, replace all instances with \\n\n        if (newlineChar !== '\\r?\\n') {\n            pgn = pgn.replace(new RegExp(newlineChar, 'g'), '\\n');\n        }\n        const parsedPgn = peg$parse(pgn);\n        // Put the board in the starting position\n        this.reset();\n        // parse PGN header\n        const headers = parsedPgn.headers;\n        let fen = '';\n        for (const key in headers) {\n            // check to see user is including fen (possibly with wrong tag case)\n            if (key.toLowerCase() === 'fen') {\n                fen = headers[key];\n            }\n            this.header(key, headers[key]);\n        }\n        /*\n         * the permissive parser should attempt to load a fen tag, even if it's the\n         * wrong case and doesn't include a corresponding [SetUp \"1\"] tag\n         */\n        if (!strict) {\n            if (fen) {\n                this.load(fen, { preserveHeaders: true });\n            }\n        }\n        else {\n            /*\n             * strict parser - load the starting position indicated by [Setup '1']\n             * and [FEN position]\n             */\n            if (headers['SetUp'] === '1') {\n                if (!('FEN' in headers)) {\n                    throw new Error('Invalid PGN: FEN tag must be supplied with SetUp tag');\n                }\n                // don't clear the headers when loading\n                this.load(headers['FEN'], { preserveHeaders: true });\n            }\n        }\n        let node = parsedPgn.root;\n        while (node) {\n            if (node.move) {\n                const move = this._moveFromSan(node.move, strict);\n                if (move == null) {\n                    throw new Error(`Invalid move in PGN: ${node.move}`);\n                }\n                else {\n                    this._makeMove(move);\n                    this._incPositionCount();\n                }\n            }\n            if (node.comment !== undefined) {\n                this._comments[this.fen()] = node.comment;\n            }\n            node = node.variations[0];\n        }\n        /*\n         * Per section 8.2.6 of the PGN spec, the Result tag pair must match match\n         * the termination marker. Only do this when headers are present, but the\n         * result tag is missing\n         */\n        const result = parsedPgn.result;\n        if (result &&\n            Object.keys(this._header).length &&\n            this._header['Result'] !== result) {\n            this.setHeader('Result', result);\n        }\n    }\n    /*\n     * Convert a move from 0x88 coordinates to Standard Algebraic Notation\n     * (SAN)\n     *\n     * @param {boolean} strict Use the strict SAN parser. It will throw errors\n     * on overly disambiguated moves (see below):\n     *\n     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4\n     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned\n     * 4. ... Ne7 is technically the valid SAN\n     */\n    _moveToSan(move, moves) {\n        let output = '';\n        if (move.flags & BITS.KSIDE_CASTLE) {\n            output = 'O-O';\n        }\n        else if (move.flags & BITS.QSIDE_CASTLE) {\n            output = 'O-O-O';\n        }\n        else if (move.flags & BITS.NULL_MOVE) {\n            return SAN_NULLMOVE;\n        }\n        else {\n            if (move.piece !== PAWN) {\n                const disambiguator = getDisambiguator(move, moves);\n                output += move.piece.toUpperCase() + disambiguator;\n            }\n            if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {\n                if (move.piece === PAWN) {\n                    output += algebraic(move.from)[0];\n                }\n                output += 'x';\n            }\n            output += algebraic(move.to);\n            if (move.promotion) {\n                output += '=' + move.promotion.toUpperCase();\n            }\n        }\n        this._makeMove(move);\n        if (this.isCheck()) {\n            if (this.isCheckmate()) {\n                output += '#';\n            }\n            else {\n                output += '+';\n            }\n        }\n        this._undoMove();\n        return output;\n    }\n    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates\n    _moveFromSan(move, strict = false) {\n        // strip off any move decorations: e.g Nf3+?! becomes Nf3\n        let cleanMove = strippedSan(move);\n        if (!strict) {\n            if (cleanMove === '0-0') {\n                cleanMove = 'O-O';\n            }\n            else if (cleanMove === '0-0-0') {\n                cleanMove = 'O-O-O';\n            }\n        }\n        //first implementation of null with a dummy move (black king moves from a8 to a8), maybe this can be implemented better\n        if (cleanMove == SAN_NULLMOVE) {\n            const res = {\n                color: this._turn,\n                from: 0,\n                to: 0,\n                piece: 'k',\n                flags: BITS.NULL_MOVE,\n            };\n            return res;\n        }\n        let pieceType = inferPieceType(cleanMove);\n        let moves = this._moves({ legal: true, piece: pieceType });\n        // strict parser\n        for (let i = 0, len = moves.length; i < len; i++) {\n            if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {\n                return moves[i];\n            }\n        }\n        // the strict parser failed\n        if (strict) {\n            return null;\n        }\n        let piece = undefined;\n        let matches = undefined;\n        let from = undefined;\n        let to = undefined;\n        let promotion = undefined;\n        /*\n         * The default permissive (non-strict) parser allows the user to parse\n         * non-standard chess notations. This parser is only run after the strict\n         * Standard Algebraic Notation (SAN) parser has failed.\n         *\n         * When running the permissive parser, we'll run a regex to grab the piece, the\n         * to/from square, and an optional promotion piece. This regex will\n         * parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,\n         * f7f8q, b1c3\n         *\n         * NOTE: Some positions and moves may be ambiguous when using the permissive\n         * parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,\n         * the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated bishop\n         * move). In these cases, the permissive parser will default to the most\n         * basic interpretation (which is b1c3 parsing to Nc3).\n         */\n        let overlyDisambiguated = false;\n        matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);\n        if (matches) {\n            piece = matches[1];\n            from = matches[2];\n            to = matches[3];\n            promotion = matches[4];\n            if (from.length == 1) {\n                overlyDisambiguated = true;\n            }\n        }\n        else {\n            /*\n             * The [a-h]?[1-8]? portion of the regex below handles moves that may be\n             * overly disambiguated (e.g. Nge7 is unnecessary and non-standard when\n             * there is one legal knight move to e7). In this case, the value of\n             * 'from' variable will be a rank or file, not a square.\n             */\n            matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/);\n            if (matches) {\n                piece = matches[1];\n                from = matches[2];\n                to = matches[3];\n                promotion = matches[4];\n                if (from.length == 1) {\n                    overlyDisambiguated = true;\n                }\n            }\n        }\n        pieceType = inferPieceType(cleanMove);\n        moves = this._moves({\n            legal: true,\n            piece: piece ? piece : pieceType,\n        });\n        if (!to) {\n            return null;\n        }\n        for (let i = 0, len = moves.length; i < len; i++) {\n            if (!from) {\n                // if there is no from square, it could be just 'x' missing from a capture\n                if (cleanMove ===\n                    strippedSan(this._moveToSan(moves[i], moves)).replace('x', '')) {\n                    return moves[i];\n                }\n                // hand-compare move properties with the results from our permissive regex\n            }\n            else if ((!piece || piece.toLowerCase() == moves[i].piece) &&\n                Ox88[from] == moves[i].from &&\n                Ox88[to] == moves[i].to &&\n                (!promotion || promotion.toLowerCase() == moves[i].promotion)) {\n                return moves[i];\n            }\n            else if (overlyDisambiguated) {\n                /*\n                 * SPECIAL CASE: we parsed a move string that may have an unneeded\n                 * rank/file disambiguator (e.g. Nge7).  The 'from' variable will\n                 */\n                const square = algebraic(moves[i].from);\n                if ((!piece || piece.toLowerCase() == moves[i].piece) &&\n                    Ox88[to] == moves[i].to &&\n                    (from == square[0] || from == square[1]) &&\n                    (!promotion || promotion.toLowerCase() == moves[i].promotion)) {\n                    return moves[i];\n                }\n            }\n        }\n        return null;\n    }\n    ascii() {\n        let s = '   +------------------------+\\n';\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            // display the rank\n            if (file(i) === 0) {\n                s += ' ' + '87654321'[rank(i)] + ' |';\n            }\n            if (this._board[i]) {\n                const piece = this._board[i].type;\n                const color = this._board[i].color;\n                const symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();\n                s += ' ' + symbol + ' ';\n            }\n            else {\n                s += ' . ';\n            }\n            if ((i + 1) & 0x88) {\n                s += '|\\n';\n                i += 8;\n            }\n        }\n        s += '   +------------------------+\\n';\n        s += '     a  b  c  d  e  f  g  h';\n        return s;\n    }\n    perft(depth) {\n        const moves = this._moves({ legal: false });\n        let nodes = 0;\n        const color = this._turn;\n        for (let i = 0, len = moves.length; i < len; i++) {\n            this._makeMove(moves[i]);\n            if (!this._isKingAttacked(color)) {\n                if (depth - 1 > 0) {\n                    nodes += this.perft(depth - 1);\n                }\n                else {\n                    nodes++;\n                }\n            }\n            this._undoMove();\n        }\n        return nodes;\n    }\n    setTurn(color) {\n        if (this._turn == color) {\n            return false;\n        }\n        this.move('--');\n        return true;\n    }\n    turn() {\n        return this._turn;\n    }\n    board() {\n        const output = [];\n        let row = [];\n        for (let i = Ox88.a8; i <= Ox88.h1; i++) {\n            if (this._board[i] == null) {\n                row.push(null);\n            }\n            else {\n                row.push({\n                    square: algebraic(i),\n                    type: this._board[i].type,\n                    color: this._board[i].color,\n                });\n            }\n            if ((i + 1) & 0x88) {\n                output.push(row);\n                row = [];\n                i += 8;\n            }\n        }\n        return output;\n    }\n    squareColor(square) {\n        if (square in Ox88) {\n            const sq = Ox88[square];\n            return (rank(sq) + file(sq)) % 2 === 0 ? 'light' : 'dark';\n        }\n        return null;\n    }\n    history({ verbose = false } = {}) {\n        const reversedHistory = [];\n        const moveHistory = [];\n        while (this._history.length > 0) {\n            reversedHistory.push(this._undoMove());\n        }\n        while (true) {\n            const move = reversedHistory.pop();\n            if (!move) {\n                break;\n            }\n            if (verbose) {\n                moveHistory.push(new Move(this, move));\n            }\n            else {\n                moveHistory.push(this._moveToSan(move, this._moves()));\n            }\n            this._makeMove(move);\n        }\n        return moveHistory;\n    }\n    /*\n     * Keeps track of position occurrence counts for the purpose of repetition\n     * checking. Old positions are removed from the map if their counts are reduced to 0.\n     */\n    _getPositionCount(hash) {\n        return this._positionCount.get(hash) ?? 0;\n    }\n    _incPositionCount() {\n        this._positionCount.set(this._hash, (this._positionCount.get(this._hash) ?? 0) + 1);\n    }\n    _decPositionCount(hash) {\n        const currentCount = this._positionCount.get(hash) ?? 0;\n        if (currentCount === 1) {\n            this._positionCount.delete(hash);\n        }\n        else {\n            this._positionCount.set(hash, currentCount - 1);\n        }\n    }\n    _pruneComments() {\n        const reversedHistory = [];\n        const currentComments = {};\n        const copyComment = (fen) => {\n            if (fen in this._comments) {\n                currentComments[fen] = this._comments[fen];\n            }\n        };\n        while (this._history.length > 0) {\n            reversedHistory.push(this._undoMove());\n        }\n        copyComment(this.fen());\n        while (true) {\n            const move = reversedHistory.pop();\n            if (!move) {\n                break;\n            }\n            this._makeMove(move);\n            copyComment(this.fen());\n        }\n        this._comments = currentComments;\n    }\n    getComment() {\n        return this._comments[this.fen()];\n    }\n    setComment(comment) {\n        this._comments[this.fen()] = comment.replace('{', '[').replace('}', ']');\n    }\n    /**\n     * @deprecated Renamed to `removeComment` for consistency\n     */\n    deleteComment() {\n        return this.removeComment();\n    }\n    removeComment() {\n        const comment = this._comments[this.fen()];\n        delete this._comments[this.fen()];\n        return comment;\n    }\n    getComments() {\n        this._pruneComments();\n        return Object.keys(this._comments).map((fen) => {\n            return { fen: fen, comment: this._comments[fen] };\n        });\n    }\n    /**\n     * @deprecated Renamed to `removeComments` for consistency\n     */\n    deleteComments() {\n        return this.removeComments();\n    }\n    removeComments() {\n        this._pruneComments();\n        return Object.keys(this._comments).map((fen) => {\n            const comment = this._comments[fen];\n            delete this._comments[fen];\n            return { fen: fen, comment: comment };\n        });\n    }\n    setCastlingRights(color, rights) {\n        for (const side of [KING, QUEEN]) {\n            if (rights[side] !== undefined) {\n                if (rights[side]) {\n                    this._castling[color] |= SIDES[side];\n                }\n                else {\n                    this._castling[color] &= ~SIDES[side];\n                }\n            }\n        }\n        this._updateCastlingRights();\n        const result = this.getCastlingRights(color);\n        return ((rights[KING] === undefined || rights[KING] === result[KING]) &&\n            (rights[QUEEN] === undefined || rights[QUEEN] === result[QUEEN]));\n    }\n    getCastlingRights(color) {\n        return {\n            [KING]: (this._castling[color] & SIDES[KING]) !== 0,\n            [QUEEN]: (this._castling[color] & SIDES[QUEEN]) !== 0,\n        };\n    }\n    moveNumber() {\n        return this._moveNumber;\n    }\n}\n\n\n";
function mount(root, config){
 const hostWindow=globalThis, realDocument=hostWindow.document;
 const container=realDocument.createElement('div');container.className='uc-root';container.innerHTML=MARKUP;
 const style=realDocument.createElement('style');style.textContent=CSS;root.replaceChildren(style,container);
 let disposed=false;const cleanups=[],timers=new Set(),intervals=new Set(),frames=new Set();
 const listen=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);cleanups.push(()=>target.removeEventListener(type,fn,opts));};
 const setTimeout=(fn,ms,...args)=>{const id=hostWindow.setTimeout(()=>{timers.delete(id);if(!disposed)fn(...args)},ms);timers.add(id);return id;};
 const clearTimeout=id=>{timers.delete(id);hostWindow.clearTimeout(id)};
 const setInterval=(fn,ms)=>{const id=hostWindow.setInterval(()=>{if(!disposed)fn()},ms);intervals.add(id);return id};
 const clearInterval=id=>{intervals.delete(id);hostWindow.clearInterval(id)};
 const requestAnimationFrame=fn=>{const id=hostWindow.requestAnimationFrame(t=>{frames.delete(id);if(!disposed)fn(t)});frames.add(id);return id};
 const document={body:container,get hidden(){return realDocument.hidden},getElementById:id=>root.getElementById(id),querySelector:s=>root.querySelector(s),querySelectorAll:s=>root.querySelectorAll(s),createElement:(...a)=>realDocument.createElement(...a),createElementNS:(...a)=>realDocument.createElementNS(...a),elementFromPoint:(x,y)=>root.elementFromPoint(x,y),addEventListener:(t,f,o)=>listen(t==='visibilitychange'?realDocument:root,t,f,o)};
 const window={__UC_CONFIG:config,auth:hostWindow.auth,AudioContext:hostWindow.AudioContext,webkitAudioContext:hostWindow.webkitAudioContext,addEventListener:(t,f,o)=>listen(t==='keydown'?root:hostWindow,t,f,o),removeEventListener:(...a)=>hostWindow.removeEventListener(...a)};
 const parent=hostWindow;
 // @generated by Peggy 4.2.0.
//
// https://peggyjs.org/



  function rootNode(comment) {
  	return comment !== null ? { comment, variations: [] } : { variations: []}
  }

  function node(move, suffix, nag, comment, variations) {
  	const node = { move, variations };

    if (suffix) {
    	node.suffix = suffix;
    }

    if (nag) {
    	node.nag = nag;
    }

    if (comment !== null) {
    	node.comment = comment;
    }

    return node
  }

  function lineToTree(...nodes) {
  	const [root, ...rest] = nodes;

    let parent = root;

    for (const child of rest) {
    	if (child !== null) {
        	parent.variations = [child, ...child.variations];
            child.variations = [];
            parent = child;
        }
    }

  	return root
  }

  function pgn(headers, game) {
  	if (game.marker && game.marker.comment) {
    	let node = game.root;
        while (true) {
        	const next = node.variations[0];
            if (!next) {
            	node.comment = game.marker.comment;
            	break
            }
            node = next;
        }
    }

  	return {
    	headers,
        root: game.root,
        result: (game.marker && game.marker.result) ?? undefined
    }
  }

function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
      ? this.location.source.offset(s)
      : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + offset_s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
      return "end of input";
    },

    other: function(expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== undefined ? options : {};

  var peg$FAILED = {};
  var peg$source = options.grammarSource;

  var peg$startRuleFunctions = { pgn: peg$parsepgn };
  var peg$startRuleFunction = peg$parsepgn;

  var peg$c0 = "[";
  var peg$c1 = "\"";
  var peg$c2 = "]";
  var peg$c3 = ".";
  var peg$c4 = "O-O-O";
  var peg$c5 = "O-O";
  var peg$c6 = "0-0-0";
  var peg$c7 = "0-0";
  var peg$c8 = "$";
  var peg$c9 = "{";
  var peg$c10 = "}";
  var peg$c11 = ";";
  var peg$c12 = "(";
  var peg$c13 = ")";
  var peg$c14 = "1-0";
  var peg$c15 = "0-1";
  var peg$c16 = "1/2-1/2";
  var peg$c17 = "*";

  var peg$r0 = /^[a-zA-Z]/;
  var peg$r1 = /^[^"]/;
  var peg$r2 = /^[0-9]/;
  var peg$r3 = /^[.]/;
  var peg$r4 = /^[a-zA-Z1-8\-=]/;
  var peg$r5 = /^[+#]/;
  var peg$r6 = /^[!?]/;
  var peg$r7 = /^[^}]/;
  var peg$r8 = /^[^\r\n]/;
  var peg$r9 = /^[ \t\r\n]/;

  var peg$e0 = peg$otherExpectation("tag pair");
  var peg$e1 = peg$literalExpectation("[", false);
  var peg$e2 = peg$literalExpectation("\"", false);
  var peg$e3 = peg$literalExpectation("]", false);
  var peg$e4 = peg$otherExpectation("tag name");
  var peg$e5 = peg$classExpectation([["a", "z"], ["A", "Z"]], false, false);
  var peg$e6 = peg$otherExpectation("tag value");
  var peg$e7 = peg$classExpectation(["\""], true, false);
  var peg$e8 = peg$otherExpectation("move number");
  var peg$e9 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e10 = peg$literalExpectation(".", false);
  var peg$e11 = peg$classExpectation(["."], false, false);
  var peg$e12 = peg$otherExpectation("standard algebraic notation");
  var peg$e13 = peg$literalExpectation("O-O-O", false);
  var peg$e14 = peg$literalExpectation("O-O", false);
  var peg$e15 = peg$literalExpectation("0-0-0", false);
  var peg$e16 = peg$literalExpectation("0-0", false);
  var peg$e17 = peg$classExpectation([["a", "z"], ["A", "Z"], ["1", "8"], "-", "="], false, false);
  var peg$e18 = peg$classExpectation(["+", "#"], false, false);
  var peg$e19 = peg$otherExpectation("suffix annotation");
  var peg$e20 = peg$classExpectation(["!", "?"], false, false);
  var peg$e21 = peg$otherExpectation("NAG");
  var peg$e22 = peg$literalExpectation("$", false);
  var peg$e23 = peg$otherExpectation("brace comment");
  var peg$e24 = peg$literalExpectation("{", false);
  var peg$e25 = peg$classExpectation(["}"], true, false);
  var peg$e26 = peg$literalExpectation("}", false);
  var peg$e27 = peg$otherExpectation("rest of line comment");
  var peg$e28 = peg$literalExpectation(";", false);
  var peg$e29 = peg$classExpectation(["\r", "\n"], true, false);
  var peg$e30 = peg$otherExpectation("variation");
  var peg$e31 = peg$literalExpectation("(", false);
  var peg$e32 = peg$literalExpectation(")", false);
  var peg$e33 = peg$otherExpectation("game termination marker");
  var peg$e34 = peg$literalExpectation("1-0", false);
  var peg$e35 = peg$literalExpectation("0-1", false);
  var peg$e36 = peg$literalExpectation("1/2-1/2", false);
  var peg$e37 = peg$literalExpectation("*", false);
  var peg$e38 = peg$otherExpectation("whitespace");
  var peg$e39 = peg$classExpectation([" ", "\t", "\r", "\n"], false, false);

  var peg$f0 = function(headers, game) { return pgn(headers, game) };
  var peg$f1 = function(tagPairs) { return Object.fromEntries(tagPairs) };
  var peg$f2 = function(tagName, tagValue) { return [tagName, tagValue] };
  var peg$f3 = function(root, marker) { return { root, marker} };
  var peg$f4 = function(comment, moves) { return lineToTree(rootNode(comment), ...moves.flat()) };
  var peg$f5 = function(san, suffix, nag, comment, variations) { return node(san, suffix, nag, comment, variations) };
  var peg$f6 = function(nag) { return nag };
  var peg$f7 = function(comment) { return comment.replace(/[\r\n]+/g, " ") };
  var peg$f8 = function(comment) { return comment.trim() };
  var peg$f9 = function(line) { return line };
  var peg$f10 = function(result, comment) { return { result, comment } };
  var peg$currPos = options.peg$currPos | 0;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = peg$currPos;
  var peg$maxFailExpected = options.peg$maxFailExpected || [];
  var peg$silentFails = options.peg$silentFails | 0;

  var peg$result;

  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;

    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {}
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos, endPos, offset) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);

    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    return res;
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parsepgn() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parsetagPairSection();
    s2 = peg$parsemoveTextSection();
    s0 = peg$f0(s1, s2);

    return s0;
  }

  function peg$parsetagPairSection() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsetagPair();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsetagPair();
    }
    s2 = peg$parse_();
    s0 = peg$f1(s1);

    return s0;
  }

  function peg$parsetagPair() {
    var s0, s2, s4, s6, s7, s8, s10;

    peg$silentFails++;
    s0 = peg$currPos;
    peg$parse_();
    if (input.charCodeAt(peg$currPos) === 91) {
      s2 = peg$c0;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e1); }
    }
    if (s2 !== peg$FAILED) {
      peg$parse_();
      s4 = peg$parsetagName();
      if (s4 !== peg$FAILED) {
        peg$parse_();
        if (input.charCodeAt(peg$currPos) === 34) {
          s6 = peg$c1;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e2); }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parsetagValue();
          if (input.charCodeAt(peg$currPos) === 34) {
            s8 = peg$c1;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e2); }
          }
          if (s8 !== peg$FAILED) {
            peg$parse_();
            if (input.charCodeAt(peg$currPos) === 93) {
              s10 = peg$c2;
              peg$currPos++;
            } else {
              s10 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e3); }
            }
            if (s10 !== peg$FAILED) {
              s0 = peg$f2(s4, s7);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      if (peg$silentFails === 0) { peg$fail(peg$e0); }
    }

    return s0;
  }

  function peg$parsetagName() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r0.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e5); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r0.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e5); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e4); }
    }

    return s0;
  }

  function peg$parsetagValue() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r1.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e7); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = input.charAt(peg$currPos);
      if (peg$r1.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e7); }
      }
    }
    s0 = input.substring(s0, peg$currPos);
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e6); }

    return s0;
  }

  function peg$parsemoveTextSection() {
    var s0, s1, s3;

    s0 = peg$currPos;
    s1 = peg$parseline();
    peg$parse_();
    s3 = peg$parsegameTerminationMarker();
    if (s3 === peg$FAILED) {
      s3 = null;
    }
    peg$parse_();
    s0 = peg$f3(s1, s3);

    return s0;
  }

  function peg$parseline() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsecomment();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = [];
    s3 = peg$parsemove();
    while (s3 !== peg$FAILED) {
      s2.push(s3);
      s3 = peg$parsemove();
    }
    s0 = peg$f4(s1, s2);

    return s0;
  }

  function peg$parsemove() {
    var s0, s4, s5, s6, s7, s8, s9, s10;

    s0 = peg$currPos;
    peg$parse_();
    peg$parsemoveNumber();
    peg$parse_();
    s4 = peg$parsesan();
    if (s4 !== peg$FAILED) {
      s5 = peg$parsesuffixAnnotation();
      if (s5 === peg$FAILED) {
        s5 = null;
      }
      s6 = [];
      s7 = peg$parsenag();
      while (s7 !== peg$FAILED) {
        s6.push(s7);
        s7 = peg$parsenag();
      }
      s7 = peg$parse_();
      s8 = peg$parsecomment();
      if (s8 === peg$FAILED) {
        s8 = null;
      }
      s9 = [];
      s10 = peg$parsevariation();
      while (s10 !== peg$FAILED) {
        s9.push(s10);
        s10 = peg$parsevariation();
      }
      s0 = peg$f5(s4, s5, s6, s8, s9);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsemoveNumber() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r2.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e9); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = input.charAt(peg$currPos);
      if (peg$r2.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e9); }
      }
    }
    if (input.charCodeAt(peg$currPos) === 46) {
      s2 = peg$c3;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e10); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse_();
      s4 = [];
      s5 = input.charAt(peg$currPos);
      if (peg$r3.test(s5)) {
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e11); }
      }
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = input.charAt(peg$currPos);
        if (peg$r3.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e11); }
        }
      }
      s1 = [s1, s2, s3, s4];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e8); }
    }

    return s0;
  }

  function peg$parsesan() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c4) {
      s2 = peg$c4;
      peg$currPos += 5;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e13); }
    }
    if (s2 === peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c5) {
        s2 = peg$c5;
        peg$currPos += 3;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e14); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c6) {
          s2 = peg$c6;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e15); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c7) {
            s2 = peg$c7;
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e16); }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            s3 = input.charAt(peg$currPos);
            if (peg$r0.test(s3)) {
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e5); }
            }
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = input.charAt(peg$currPos);
              if (peg$r4.test(s5)) {
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e17); }
              }
              if (s5 !== peg$FAILED) {
                while (s5 !== peg$FAILED) {
                  s4.push(s5);
                  s5 = input.charAt(peg$currPos);
                  if (peg$r4.test(s5)) {
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e17); }
                  }
                }
              } else {
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = input.charAt(peg$currPos);
      if (peg$r5.test(s3)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e18); }
      }
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      s2 = [s2, s3];
      s1 = s2;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e12); }
    }

    return s0;
  }

  function peg$parsesuffixAnnotation() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r6.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e20); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (s1.length >= 2) {
        s2 = peg$FAILED;
      } else {
        s2 = input.charAt(peg$currPos);
        if (peg$r6.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e20); }
        }
      }
    }
    if (s1.length < 1) {
      peg$currPos = s0;
      s0 = peg$FAILED;
    } else {
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e19); }
    }

    return s0;
  }

  function peg$parsenag() {
    var s0, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    peg$parse_();
    if (input.charCodeAt(peg$currPos) === 36) {
      s2 = peg$c8;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e22); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$currPos;
      s4 = [];
      s5 = input.charAt(peg$currPos);
      if (peg$r2.test(s5)) {
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e9); }
      }
      if (s5 !== peg$FAILED) {
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = input.charAt(peg$currPos);
          if (peg$r2.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e9); }
          }
        }
      } else {
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s3 = input.substring(s3, peg$currPos);
      } else {
        s3 = s4;
      }
      if (s3 !== peg$FAILED) {
        s0 = peg$f6(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      if (peg$silentFails === 0) { peg$fail(peg$e21); }
    }

    return s0;
  }

  function peg$parsecomment() {
    var s0;

    s0 = peg$parsebraceComment();
    if (s0 === peg$FAILED) {
      s0 = peg$parserestOfLineComment();
    }

    return s0;
  }

  function peg$parsebraceComment() {
    var s0, s1, s2, s3, s4;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 123) {
      s1 = peg$c9;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e24); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      s4 = input.charAt(peg$currPos);
      if (peg$r7.test(s4)) {
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e25); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = input.charAt(peg$currPos);
        if (peg$r7.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e25); }
        }
      }
      s2 = input.substring(s2, peg$currPos);
      if (input.charCodeAt(peg$currPos) === 125) {
        s3 = peg$c10;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e26); }
      }
      if (s3 !== peg$FAILED) {
        s0 = peg$f7(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e23); }
    }

    return s0;
  }

  function peg$parserestOfLineComment() {
    var s0, s1, s2, s3, s4;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 59) {
      s1 = peg$c11;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e28); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      s4 = input.charAt(peg$currPos);
      if (peg$r8.test(s4)) {
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e29); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = input.charAt(peg$currPos);
        if (peg$r8.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e29); }
        }
      }
      s2 = input.substring(s2, peg$currPos);
      s0 = peg$f8(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e27); }
    }

    return s0;
  }

  function peg$parsevariation() {
    var s0, s2, s3, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    peg$parse_();
    if (input.charCodeAt(peg$currPos) === 40) {
      s2 = peg$c12;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e31); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parseline();
      if (s3 !== peg$FAILED) {
        peg$parse_();
        if (input.charCodeAt(peg$currPos) === 41) {
          s5 = peg$c13;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e32); }
        }
        if (s5 !== peg$FAILED) {
          s0 = peg$f9(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      if (peg$silentFails === 0) { peg$fail(peg$e30); }
    }

    return s0;
  }

  function peg$parsegameTerminationMarker() {
    var s0, s1, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c14) {
      s1 = peg$c14;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e34); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c15) {
        s1 = peg$c15;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e35); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 7) === peg$c16) {
          s1 = peg$c16;
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e36); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 42) {
            s1 = peg$c17;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e37); }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parse_();
      s3 = peg$parsecomment();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      s0 = peg$f10(s1, s3);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e33); }
    }

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    peg$silentFails++;
    s0 = [];
    s1 = input.charAt(peg$currPos);
    if (peg$r9.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e39); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = input.charAt(peg$currPos);
      if (peg$r9.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e39); }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e38); }

    return s0;
  }

  peg$result = peg$startRuleFunction();

  if (options.peg$library) {
    return /** @type {any} */ ({
      peg$result,
      peg$currPos,
      peg$FAILED,
      peg$maxFailExpected,
      peg$maxFailPos
    });
  }
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

/**
 * @license
 * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
const MASK64 = 0xffffffffffffffffn;
function rotl(x, k) {
    return ((x << k) | (x >> (64n - k))) & 0xffffffffffffffffn;
}
function wrappingMul(x, y) {
    return (x * y) & MASK64;
}
// xoroshiro128**
function xoroshiro128(state) {
    return function () {
        let s0 = BigInt(state & MASK64);
        let s1 = BigInt((state >> 64n) & MASK64);
        const result = wrappingMul(rotl(wrappingMul(s0, 5n), 7n), 9n);
        s1 ^= s0;
        s0 = (rotl(s0, 24n) ^ s1 ^ (s1 << 16n)) & MASK64;
        s1 = rotl(s1, 37n);
        state = (s1 << 64n) | s0;
        return result;
    };
}
const rand = xoroshiro128(0xa187eb39cdcaed8f31c4b365b102e01en);
const PIECE_KEYS = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 128 }, () => rand())));
const EP_KEYS = Array.from({ length: 8 }, () => rand());
const CASTLING_KEYS = Array.from({ length: 16 }, () => rand());
const SIDE_KEY = rand();
const WHITE = 'w';
const BLACK = 'b';
const PAWN = 'p';
const KNIGHT = 'n';
const BISHOP = 'b';
const ROOK = 'r';
const QUEEN = 'q';
const KING = 'k';
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
class Move {
    color;
    from;
    to;
    piece;
    captured;
    promotion;
    /**
     * @deprecated This field is deprecated and will be removed in version 2.0.0.
     * Please use move descriptor functions instead: `isCapture`, `isPromotion`,
     * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and
     * `isBigPawn`
     */
    flags;
    san;
    lan;
    before;
    after;
    constructor(chess, internal) {
        const { color, piece, from, to, flags, captured, promotion } = internal;
        const fromAlgebraic = algebraic(from);
        const toAlgebraic = algebraic(to);
        this.color = color;
        this.piece = piece;
        this.from = fromAlgebraic;
        this.to = toAlgebraic;
        /*
         * HACK: The chess['_method']() calls below invoke private methods in the
         * Chess class to generate SAN and FEN. It's a bit of a hack, but makes the
         * code cleaner elsewhere.
         */
        this.san = chess['_moveToSan'](internal, chess['_moves']({ legal: true }));
        this.lan = fromAlgebraic + toAlgebraic;
        this.before = chess.fen();
        // Generate the FEN for the 'after' key
        chess['_makeMove'](internal);
        this.after = chess.fen();
        chess['_undoMove']();
        // Build the text representation of the move flags
        this.flags = '';
        for (const flag in BITS) {
            if (BITS[flag] & flags) {
                this.flags += FLAGS[flag];
            }
        }
        if (captured) {
            this.captured = captured;
        }
        if (promotion) {
            this.promotion = promotion;
            this.lan += promotion;
        }
    }
    isCapture() {
        return this.flags.indexOf(FLAGS['CAPTURE']) > -1;
    }
    isPromotion() {
        return this.flags.indexOf(FLAGS['PROMOTION']) > -1;
    }
    isEnPassant() {
        return this.flags.indexOf(FLAGS['EP_CAPTURE']) > -1;
    }
    isKingsideCastle() {
        return this.flags.indexOf(FLAGS['KSIDE_CASTLE']) > -1;
    }
    isQueensideCastle() {
        return this.flags.indexOf(FLAGS['QSIDE_CASTLE']) > -1;
    }
    isBigPawn() {
        return this.flags.indexOf(FLAGS['BIG_PAWN']) > -1;
    }
}
const EMPTY = -1;
const FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q',
    NULL_MOVE: '-',
};
// prettier-ignore
const SQUARES = [
    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
];
const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64,
    NULL_MOVE: 128,
};
/* eslint-disable @typescript-eslint/naming-convention */
// these are required, according to spec
const SEVEN_TAG_ROSTER = {
    Event: '?',
    Site: '?',
    Date: '????.??.??',
    Round: '?',
    White: '?',
    Black: '?',
    Result: '*',
};
/**
 * These nulls are placeholders to fix the order of tags (as they appear in PGN spec); null values will be
 * eliminated in getHeaders()
 */
const SUPLEMENTAL_TAGS = {
    WhiteTitle: null,
    BlackTitle: null,
    WhiteElo: null,
    BlackElo: null,
    WhiteUSCF: null,
    BlackUSCF: null,
    WhiteNA: null,
    BlackNA: null,
    WhiteType: null,
    BlackType: null,
    EventDate: null,
    EventSponsor: null,
    Section: null,
    Stage: null,
    Board: null,
    Opening: null,
    Variation: null,
    SubVariation: null,
    ECO: null,
    NIC: null,
    Time: null,
    UTCTime: null,
    UTCDate: null,
    TimeControl: null,
    SetUp: null,
    FEN: null,
    Termination: null,
    Annotator: null,
    Mode: null,
    PlyCount: null,
};
const HEADER_TEMPLATE = {
    ...SEVEN_TAG_ROSTER,
    ...SUPLEMENTAL_TAGS,
};
/* eslint-enable @typescript-eslint/naming-convention */
/*
 * NOTES ABOUT 0x88 MOVE GENERATION ALGORITHM
 * ----------------------------------------------------------------------------
 * From https://github.com/jhlywa/chess.js/issues/230
 *
 * A lot of people are confused when they first see the internal representation
 * of chess.js. It uses the 0x88 Move Generation Algorithm which internally
 * stores the board as an 8x16 array. This is purely for efficiency but has a
 * couple of interesting benefits:
 *
 * 1. 0x88 offers a very inexpensive "off the board" check. Bitwise AND (&) any
 *    square with 0x88, if the result is non-zero then the square is off the
 *    board. For example, assuming a knight square A8 (0 in 0x88 notation),
 *    there are 8 possible directions in which the knight can move. These
 *    directions are relative to the 8x16 board and are stored in the
 *    PIECE_OFFSETS map. One possible move is A8 - 18 (up one square, and two
 *    squares to the left - which is off the board). 0 - 18 = -18 & 0x88 = 0x88
 *    (because of two-complement representation of -18). The non-zero result
 *    means the square is off the board and the move is illegal. Take the
 *    opposite move (from A8 to C7), 0 + 18 = 18 & 0x88 = 0. A result of zero
 *    means the square is on the board.
 *
 * 2. The relative distance (or difference) between two squares on a 8x16 board
 *    is unique and can be used to inexpensively determine if a piece on a
 *    square can attack any other arbitrary square. For example, let's see if a
 *    pawn on E7 can attack E2. The difference between E7 (20) - E2 (100) is
 *    -80. We add 119 to make the ATTACKS array index non-negative (because the
 *    worst case difference is A8 - H1 = -119). The ATTACKS array contains a
 *    bitmask of pieces that can attack from that distance and direction.
 *    ATTACKS[-80 + 119=39] gives us 24 or 0b11000 in binary. Look at the
 *    PIECE_MASKS map to determine the mask for a given piece type. In our pawn
 *    example, we would check to see if 24 & 0x1 is non-zero, which it is
 *    not. So, naturally, a pawn on E7 can't attack a piece on E2. However, a
 *    rook can since 24 & 0x8 is non-zero. The only thing left to check is that
 *    there are no blocking pieces between E7 and E2. That's where the RAYS
 *    array comes in. It provides an offset (in this case 16) to add to E7 (20)
 *    to check for blocking pieces. E7 (20) + 16 = E6 (36) + 16 = E5 (52) etc.
 */
// prettier-ignore
// eslint-disable-next-line
const Ox88 = {
    a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
    a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
    a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
    a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
    a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
    a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
    a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
};
const PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15],
};
const PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1],
};
// prettier-ignore
const ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,
    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,
    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20
];
// prettier-ignore
const RAYS = [
    17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
    0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
    0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
    0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
    0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
    0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
    0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
    0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
    0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
    -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
];
const PIECE_MASKS = { p: 0x1, n: 0x2, b: 0x4, r: 0x8, q: 0x10, k: 0x20 };
const SYMBOLS = 'pnbrqkPNBRQK';
const PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN];
const RANK_1 = 7;
const RANK_2 = 6;
/*
 * const RANK_3 = 5
 * const RANK_4 = 4
 * const RANK_5 = 3
 * const RANK_6 = 2
 */
const RANK_7 = 1;
const RANK_8 = 0;
const SIDES = {
    [KING]: BITS.KSIDE_CASTLE,
    [QUEEN]: BITS.QSIDE_CASTLE,
};
const ROOKS = {
    w: [
        { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },
        { square: Ox88.h1, flag: BITS.KSIDE_CASTLE },
    ],
    b: [
        { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },
        { square: Ox88.h8, flag: BITS.KSIDE_CASTLE },
    ],
};
const SECOND_RANK = { b: RANK_7, w: RANK_2 };
const SAN_NULLMOVE = '--';
// Extracts the zero-based rank of an 0x88 square.
function rank(square) {
    return square >> 4;
}
// Extracts the zero-based file of an 0x88 square.
function file(square) {
    return square & 0xf;
}
function isDigit(c) {
    return '0123456789'.indexOf(c) !== -1;
}
// Converts a 0x88 square to algebraic notation.
function algebraic(square) {
    const f = file(square);
    const r = rank(square);
    return ('abcdefgh'.substring(f, f + 1) +
        '87654321'.substring(r, r + 1));
}
function swapColor(color) {
    return color === WHITE ? BLACK : WHITE;
}
function validateFen(fen) {
    // 1st criterion: 6 space-seperated fields?
    const tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
        return {
            ok: false,
            error: 'Invalid FEN: must contain six space-delimited fields',
        };
    }
    // 2nd criterion: move number field is a integer value > 0?
    const moveNumber = parseInt(tokens[5], 10);
    if (isNaN(moveNumber) || moveNumber <= 0) {
        return {
            ok: false,
            error: 'Invalid FEN: move number must be a positive integer',
        };
    }
    // 3rd criterion: half move counter is an integer >= 0?
    const halfMoves = parseInt(tokens[4], 10);
    if (isNaN(halfMoves) || halfMoves < 0) {
        return {
            ok: false,
            error: 'Invalid FEN: half move counter number must be a non-negative integer',
        };
    }
    // 4th criterion: 4th field is a valid e.p.-string?
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
        return { ok: false, error: 'Invalid FEN: en-passant square is invalid' };
    }
    // 5th criterion: 3th field is a valid castle-string?
    if (/[^kKqQ-]/.test(tokens[2])) {
        return { ok: false, error: 'Invalid FEN: castling availability is invalid' };
    }
    // 6th criterion: 2nd field is "w" (white) or "b" (black)?
    if (!/^(w|b)$/.test(tokens[1])) {
        return { ok: false, error: 'Invalid FEN: side-to-move is invalid' };
    }
    // 7th criterion: 1st field contains 8 rows?
    const rows = tokens[0].split('/');
    if (rows.length !== 8) {
        return {
            ok: false,
            error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows",
        };
    }
    // 8th criterion: every row is valid?
    for (let i = 0; i < rows.length; i++) {
        // check for right sum of fields AND not two numbers in succession
        let sumFields = 0;
        let previousWasNumber = false;
        for (let k = 0; k < rows[i].length; k++) {
            if (isDigit(rows[i][k])) {
                if (previousWasNumber) {
                    return {
                        ok: false,
                        error: 'Invalid FEN: piece data is invalid (consecutive number)',
                    };
                }
                sumFields += parseInt(rows[i][k], 10);
                previousWasNumber = true;
            }
            else {
                if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
                    return {
                        ok: false,
                        error: 'Invalid FEN: piece data is invalid (invalid piece)',
                    };
                }
                sumFields += 1;
                previousWasNumber = false;
            }
        }
        if (sumFields !== 8) {
            return {
                ok: false,
                error: 'Invalid FEN: piece data is invalid (too many squares in rank)',
            };
        }
    }
    // 9th criterion: is en-passant square legal?
    if ((tokens[3][1] == '3' && tokens[1] == 'w') ||
        (tokens[3][1] == '6' && tokens[1] == 'b')) {
        return { ok: false, error: 'Invalid FEN: illegal en-passant square' };
    }
    // 10th criterion: does chess position contain exact two kings?
    const kings = [
        { color: 'white', regex: /K/g },
        { color: 'black', regex: /k/g },
    ];
    for (const { color, regex } of kings) {
        if (!regex.test(tokens[0])) {
            return { ok: false, error: `Invalid FEN: missing ${color} king` };
        }
        if ((tokens[0].match(regex) || []).length > 1) {
            return { ok: false, error: `Invalid FEN: too many ${color} kings` };
        }
    }
    // 11th criterion: are any pawns on the first or eighth rows?
    if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === 'P')) {
        return {
            ok: false,
            error: 'Invalid FEN: some pawns are on the edge rows',
        };
    }
    return { ok: true };
}
// this function is used to uniquely identify ambiguous moves
function getDisambiguator(move, moves) {
    const from = move.from;
    const to = move.to;
    const piece = move.piece;
    let ambiguities = 0;
    let sameRank = 0;
    let sameFile = 0;
    for (let i = 0, len = moves.length; i < len; i++) {
        const ambigFrom = moves[i].from;
        const ambigTo = moves[i].to;
        const ambigPiece = moves[i].piece;
        /*
         * if a move of the same piece type ends on the same to square, we'll need
         * to add a disambiguator to the algebraic notation
         */
        if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
            ambiguities++;
            if (rank(from) === rank(ambigFrom)) {
                sameRank++;
            }
            if (file(from) === file(ambigFrom)) {
                sameFile++;
            }
        }
    }
    if (ambiguities > 0) {
        if (sameRank > 0 && sameFile > 0) {
            /*
             * if there exists a similar moving piece on the same rank and file as
             * the move in question, use the square as the disambiguator
             */
            return algebraic(from);
        }
        else if (sameFile > 0) {
            /*
             * if the moving piece rests on the same file, use the rank symbol as the
             * disambiguator
             */
            return algebraic(from).charAt(1);
        }
        else {
            // else use the file symbol
            return algebraic(from).charAt(0);
        }
    }
    return '';
}
function addMove(moves, color, from, to, piece, captured = undefined, flags = BITS.NORMAL) {
    const r = rank(to);
    if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
        for (let i = 0; i < PROMOTIONS.length; i++) {
            const promotion = PROMOTIONS[i];
            moves.push({
                color,
                from,
                to,
                piece,
                captured,
                promotion,
                flags: flags | BITS.PROMOTION,
            });
        }
    }
    else {
        moves.push({
            color,
            from,
            to,
            piece,
            captured,
            flags,
        });
    }
}
function inferPieceType(san) {
    let pieceType = san.charAt(0);
    if (pieceType >= 'a' && pieceType <= 'h') {
        const matches = san.match(/[a-h]\d.*[a-h]\d/);
        if (matches) {
            return undefined;
        }
        return PAWN;
    }
    pieceType = pieceType.toLowerCase();
    if (pieceType === 'o') {
        return KING;
    }
    return pieceType;
}
// parses all of the decorators out of a SAN string
function strippedSan(move) {
    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
}
class Chess {
    _board = new Array(128);
    _turn = WHITE;
    _header = {};
    _kings = { w: EMPTY, b: EMPTY };
    _epSquare = -1;
    _halfMoves = 0;
    _moveNumber = 0;
    _history = [];
    _comments = {};
    _castling = { w: 0, b: 0 };
    _hash = 0n;
    // tracks number of times a position has been seen for repetition checking
    _positionCount = new Map();
    constructor(fen = DEFAULT_POSITION, { skipValidation = false } = {}) {
        this.load(fen, { skipValidation });
    }
    clear({ preserveHeaders = false } = {}) {
        this._board = new Array(128);
        this._kings = { w: EMPTY, b: EMPTY };
        this._turn = WHITE;
        this._castling = { w: 0, b: 0 };
        this._epSquare = EMPTY;
        this._halfMoves = 0;
        this._moveNumber = 1;
        this._history = [];
        this._comments = {};
        this._header = preserveHeaders ? this._header : { ...HEADER_TEMPLATE };
        this._hash = this._computeHash();
        this._positionCount = new Map();
        /*
         * Delete the SetUp and FEN headers (if preserved), the board is empty and
         * these headers don't make sense in this state. They'll get added later
         * via .load() or .put()
         */
        this._header['SetUp'] = null;
        this._header['FEN'] = null;
    }
    load(fen, { skipValidation = false, preserveHeaders = false } = {}) {
        let tokens = fen.split(/\s+/);
        // append commonly omitted fen tokens
        if (tokens.length >= 2 && tokens.length < 6) {
            const adjustments = ['-', '-', '0', '1'];
            fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(' ');
        }
        tokens = fen.split(/\s+/);
        if (!skipValidation) {
            const { ok, error } = validateFen(fen);
            if (!ok) {
                throw new Error(error);
            }
        }
        const position = tokens[0];
        let square = 0;
        this.clear({ preserveHeaders });
        for (let i = 0; i < position.length; i++) {
            const piece = position.charAt(i);
            if (piece === '/') {
                square += 8;
            }
            else if (isDigit(piece)) {
                square += parseInt(piece, 10);
            }
            else {
                const color = piece < 'a' ? WHITE : BLACK;
                this._put({ type: piece.toLowerCase(), color }, algebraic(square));
                square++;
            }
        }
        this._turn = tokens[1];
        if (tokens[2].indexOf('K') > -1) {
            this._castling.w |= BITS.KSIDE_CASTLE;
        }
        if (tokens[2].indexOf('Q') > -1) {
            this._castling.w |= BITS.QSIDE_CASTLE;
        }
        if (tokens[2].indexOf('k') > -1) {
            this._castling.b |= BITS.KSIDE_CASTLE;
        }
        if (tokens[2].indexOf('q') > -1) {
            this._castling.b |= BITS.QSIDE_CASTLE;
        }
        this._epSquare = tokens[3] === '-' ? EMPTY : Ox88[tokens[3]];
        this._halfMoves = parseInt(tokens[4], 10);
        this._moveNumber = parseInt(tokens[5], 10);
        this._hash = this._computeHash();
        this._updateSetup(fen);
        this._incPositionCount();
    }
    fen({ forceEnpassantSquare = false, } = {}) {
        let empty = 0;
        let fen = '';
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (this._board[i]) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                const { color, type: piece } = this._board[i];
                fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
            }
            else {
                empty++;
            }
            if ((i + 1) & 0x88) {
                if (empty > 0) {
                    fen += empty;
                }
                if (i !== Ox88.h1) {
                    fen += '/';
                }
                empty = 0;
                i += 8;
            }
        }
        let castling = '';
        if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {
            castling += 'K';
        }
        if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {
            castling += 'Q';
        }
        if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {
            castling += 'k';
        }
        if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {
            castling += 'q';
        }
        // do we have an empty castling flag?
        castling = castling || '-';
        let epSquare = '-';
        /*
         * only print the ep square if en passant is a valid move (pawn is present
         * and ep capture is not pinned)
         */
        if (this._epSquare !== EMPTY) {
            if (forceEnpassantSquare) {
                epSquare = algebraic(this._epSquare);
            }
            else {
                const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
                const squares = [bigPawnSquare + 1, bigPawnSquare - 1];
                for (const square of squares) {
                    // is the square off the board?
                    if (square & 0x88) {
                        continue;
                    }
                    const color = this._turn;
                    // is there a pawn that can capture the epSquare?
                    if (this._board[square]?.color === color &&
                        this._board[square]?.type === PAWN) {
                        // if the pawn makes an ep capture, does it leave its king in check?
                        this._makeMove({
                            color,
                            from: square,
                            to: this._epSquare,
                            piece: PAWN,
                            captured: PAWN,
                            flags: BITS.EP_CAPTURE,
                        });
                        const isLegal = !this._isKingAttacked(color);
                        this._undoMove();
                        // if ep is legal, break and set the ep square in the FEN output
                        if (isLegal) {
                            epSquare = algebraic(this._epSquare);
                            break;
                        }
                    }
                }
            }
        }
        return [
            fen,
            this._turn,
            castling,
            epSquare,
            this._halfMoves,
            this._moveNumber,
        ].join(' ');
    }
    _pieceKey(i) {
        if (!this._board[i]) {
            return 0n;
        }
        const { color, type } = this._board[i];
        const colorIndex = {
            w: 0,
            b: 1,
        }[color];
        const typeIndex = {
            p: 0,
            n: 1,
            b: 2,
            r: 3,
            q: 4,
            k: 5,
        }[type];
        return PIECE_KEYS[colorIndex][typeIndex][i];
    }
    _epKey() {
        return this._epSquare === EMPTY ? 0n : EP_KEYS[this._epSquare & 7];
    }
    _castlingKey() {
        const index = (this._castling.w >> 5) | (this._castling.b >> 3);
        return CASTLING_KEYS[index];
    }
    _computeHash() {
        let hash = 0n;
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            // did we run off the end of the board
            if (i & 0x88) {
                i += 7;
                continue;
            }
            if (this._board[i]) {
                hash ^= this._pieceKey(i);
            }
        }
        hash ^= this._epKey();
        hash ^= this._castlingKey();
        if (this._turn === 'b') {
            hash ^= SIDE_KEY;
        }
        return hash;
    }
    /*
     * Called when the initial board setup is changed with put() or remove().
     * modifies the SetUp and FEN properties of the header object. If the FEN
     * is equal to the default position, the SetUp and FEN are deleted the setup
     * is only updated if history.length is zero, ie moves haven't been made.
     */
    _updateSetup(fen) {
        if (this._history.length > 0)
            return;
        if (fen !== DEFAULT_POSITION) {
            this._header['SetUp'] = '1';
            this._header['FEN'] = fen;
        }
        else {
            this._header['SetUp'] = null;
            this._header['FEN'] = null;
        }
    }
    reset() {
        this.load(DEFAULT_POSITION);
    }
    get(square) {
        return this._board[Ox88[square]];
    }
    findPiece(piece) {
        const squares = [];
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            // did we run off the end of the board
            if (i & 0x88) {
                i += 7;
                continue;
            }
            // if empty square or wrong color
            if (!this._board[i] || this._board[i]?.color !== piece.color) {
                continue;
            }
            // check if square contains the requested piece
            if (this._board[i].color === piece.color &&
                this._board[i].type === piece.type) {
                squares.push(algebraic(i));
            }
        }
        return squares;
    }
    put({ type, color }, square) {
        if (this._put({ type, color }, square)) {
            this._updateCastlingRights();
            this._updateEnPassantSquare();
            this._updateSetup(this.fen());
            return true;
        }
        return false;
    }
    _set(sq, piece) {
        this._hash ^= this._pieceKey(sq);
        this._board[sq] = piece;
        this._hash ^= this._pieceKey(sq);
    }
    _put({ type, color }, square) {
        // check for piece
        if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {
            return false;
        }
        // check for valid square
        if (!(square in Ox88)) {
            return false;
        }
        const sq = Ox88[square];
        // don't let the user place more than one king
        if (type == KING &&
            !(this._kings[color] == EMPTY || this._kings[color] == sq)) {
            return false;
        }
        const currentPieceOnSquare = this._board[sq];
        // if one of the kings will be replaced by the piece from args, set the `_kings` respective entry to `EMPTY`
        if (currentPieceOnSquare && currentPieceOnSquare.type === KING) {
            this._kings[currentPieceOnSquare.color] = EMPTY;
        }
        this._set(sq, { type: type, color: color });
        if (type === KING) {
            this._kings[color] = sq;
        }
        return true;
    }
    _clear(sq) {
        this._hash ^= this._pieceKey(sq);
        delete this._board[sq];
    }
    remove(square) {
        const piece = this.get(square);
        this._clear(Ox88[square]);
        if (piece && piece.type === KING) {
            this._kings[piece.color] = EMPTY;
        }
        this._updateCastlingRights();
        this._updateEnPassantSquare();
        this._updateSetup(this.fen());
        return piece;
    }
    _updateCastlingRights() {
        this._hash ^= this._castlingKey();
        const whiteKingInPlace = this._board[Ox88.e1]?.type === KING &&
            this._board[Ox88.e1]?.color === WHITE;
        const blackKingInPlace = this._board[Ox88.e8]?.type === KING &&
            this._board[Ox88.e8]?.color === BLACK;
        if (!whiteKingInPlace ||
            this._board[Ox88.a1]?.type !== ROOK ||
            this._board[Ox88.a1]?.color !== WHITE) {
            this._castling.w &= -65;
        }
        if (!whiteKingInPlace ||
            this._board[Ox88.h1]?.type !== ROOK ||
            this._board[Ox88.h1]?.color !== WHITE) {
            this._castling.w &= -33;
        }
        if (!blackKingInPlace ||
            this._board[Ox88.a8]?.type !== ROOK ||
            this._board[Ox88.a8]?.color !== BLACK) {
            this._castling.b &= -65;
        }
        if (!blackKingInPlace ||
            this._board[Ox88.h8]?.type !== ROOK ||
            this._board[Ox88.h8]?.color !== BLACK) {
            this._castling.b &= -33;
        }
        this._hash ^= this._castlingKey();
    }
    _updateEnPassantSquare() {
        if (this._epSquare === EMPTY) {
            return;
        }
        const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);
        const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
        const attackers = [currentSquare + 1, currentSquare - 1];
        if (this._board[startSquare] !== null ||
            this._board[this._epSquare] !== null ||
            this._board[currentSquare]?.color !== swapColor(this._turn) ||
            this._board[currentSquare]?.type !== PAWN) {
            this._hash ^= this._epKey();
            this._epSquare = EMPTY;
            return;
        }
        const canCapture = (square) => !(square & 0x88) &&
            this._board[square]?.color === this._turn &&
            this._board[square]?.type === PAWN;
        if (!attackers.some(canCapture)) {
            this._hash ^= this._epKey();
            this._epSquare = EMPTY;
        }
    }
    _attacked(color, square, verbose) {
        const attackers = [];
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            // did we run off the end of the board
            if (i & 0x88) {
                i += 7;
                continue;
            }
            // if empty square or wrong color
            if (this._board[i] === undefined || this._board[i].color !== color) {
                continue;
            }
            const piece = this._board[i];
            const difference = i - square;
            // skip - to/from square are the same
            if (difference === 0) {
                continue;
            }
            const index = difference + 119;
            if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
                if (piece.type === PAWN) {
                    if ((difference > 0 && piece.color === WHITE) ||
                        (difference <= 0 && piece.color === BLACK)) {
                        if (!verbose) {
                            return true;
                        }
                        else {
                            attackers.push(algebraic(i));
                        }
                    }
                    continue;
                }
                // if the piece is a knight or a king
                if (piece.type === 'n' || piece.type === 'k') {
                    if (!verbose) {
                        return true;
                    }
                    else {
                        attackers.push(algebraic(i));
                        continue;
                    }
                }
                const offset = RAYS[index];
                let j = i + offset;
                let blocked = false;
                while (j !== square) {
                    if (this._board[j] != null) {
                        blocked = true;
                        break;
                    }
                    j += offset;
                }
                if (!blocked) {
                    if (!verbose) {
                        return true;
                    }
                    else {
                        attackers.push(algebraic(i));
                        continue;
                    }
                }
            }
        }
        if (verbose) {
            return attackers;
        }
        else {
            return false;
        }
    }
    attackers(square, attackedBy) {
        if (!attackedBy) {
            return this._attacked(this._turn, Ox88[square], true);
        }
        else {
            return this._attacked(attackedBy, Ox88[square], true);
        }
    }
    _isKingAttacked(color) {
        const square = this._kings[color];
        return square === -1 ? false : this._attacked(swapColor(color), square);
    }
    hash() {
        return this._hash.toString(16);
    }
    isAttacked(square, attackedBy) {
        return this._attacked(attackedBy, Ox88[square]);
    }
    isCheck() {
        return this._isKingAttacked(this._turn);
    }
    inCheck() {
        return this.isCheck();
    }
    isCheckmate() {
        return this.isCheck() && this._moves().length === 0;
    }
    isStalemate() {
        return !this.isCheck() && this._moves().length === 0;
    }
    isInsufficientMaterial() {
        /*
         * k.b. vs k.b. (of opposite colors) with mate in 1:
         * 8/8/8/8/1b6/8/B1k5/K7 b - - 0 1
         *
         * k.b. vs k.n. with mate in 1:
         * 8/8/8/8/1n6/8/B7/K1k5 b - - 2 1
         */
        const pieces = {
            b: 0,
            n: 0,
            r: 0,
            q: 0,
            k: 0,
            p: 0,
        };
        const bishops = [];
        let numPieces = 0;
        let squareColor = 0;
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            squareColor = (squareColor + 1) % 2;
            if (i & 0x88) {
                i += 7;
                continue;
            }
            const piece = this._board[i];
            if (piece) {
                pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
                if (piece.type === BISHOP) {
                    bishops.push(squareColor);
                }
                numPieces++;
            }
        }
        // k vs. k
        if (numPieces === 2) {
            return true;
        }
        else if (
        // k vs. kn .... or .... k vs. kb
        numPieces === 3 &&
            (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)) {
            return true;
        }
        else if (numPieces === pieces[BISHOP] + 2) {
            // kb vs. kb where any number of bishops are all on the same color
            let sum = 0;
            const len = bishops.length;
            for (let i = 0; i < len; i++) {
                sum += bishops[i];
            }
            if (sum === 0 || sum === len) {
                return true;
            }
        }
        return false;
    }
    isThreefoldRepetition() {
        return this._getPositionCount(this._hash) >= 3;
    }
    isDrawByFiftyMoves() {
        return this._halfMoves >= 100; // 50 moves per side = 100 half moves
    }
    isDraw() {
        return (this.isDrawByFiftyMoves() ||
            this.isStalemate() ||
            this.isInsufficientMaterial() ||
            this.isThreefoldRepetition());
    }
    isGameOver() {
        return this.isCheckmate() || this.isDraw();
    }
    moves({ verbose = false, square = undefined, piece = undefined, } = {}) {
        const moves = this._moves({ square, piece });
        if (verbose) {
            return moves.map((move) => new Move(this, move));
        }
        else {
            return moves.map((move) => this._moveToSan(move, moves));
        }
    }
    _moves({ legal = true, piece = undefined, square = undefined, } = {}) {
        const forSquare = square ? square.toLowerCase() : undefined;
        const forPiece = piece?.toLowerCase();
        const moves = [];
        const us = this._turn;
        const them = swapColor(us);
        let firstSquare = Ox88.a8;
        let lastSquare = Ox88.h1;
        let singleSquare = false;
        // are we generating moves for a single square?
        if (forSquare) {
            // illegal square, return empty moves
            if (!(forSquare in Ox88)) {
                return [];
            }
            else {
                firstSquare = lastSquare = Ox88[forSquare];
                singleSquare = true;
            }
        }
        for (let from = firstSquare; from <= lastSquare; from++) {
            // did we run off the end of the board
            if (from & 0x88) {
                from += 7;
                continue;
            }
            // empty square or opponent, skip
            if (!this._board[from] || this._board[from].color === them) {
                continue;
            }
            const { type } = this._board[from];
            let to;
            if (type === PAWN) {
                if (forPiece && forPiece !== type)
                    continue;
                // single square, non-capturing
                to = from + PAWN_OFFSETS[us][0];
                if (!this._board[to]) {
                    addMove(moves, us, from, to, PAWN);
                    // double square
                    to = from + PAWN_OFFSETS[us][1];
                    if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
                        addMove(moves, us, from, to, PAWN, undefined, BITS.BIG_PAWN);
                    }
                }
                // pawn captures
                for (let j = 2; j < 4; j++) {
                    to = from + PAWN_OFFSETS[us][j];
                    if (to & 0x88)
                        continue;
                    if (this._board[to]?.color === them) {
                        addMove(moves, us, from, to, PAWN, this._board[to].type, BITS.CAPTURE);
                    }
                    else if (to === this._epSquare) {
                        addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE);
                    }
                }
            }
            else {
                if (forPiece && forPiece !== type)
                    continue;
                for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
                    const offset = PIECE_OFFSETS[type][j];
                    to = from;
                    while (true) {
                        to += offset;
                        if (to & 0x88)
                            break;
                        if (!this._board[to]) {
                            addMove(moves, us, from, to, type);
                        }
                        else {
                            // own color, stop loop
                            if (this._board[to].color === us)
                                break;
                            addMove(moves, us, from, to, type, this._board[to].type, BITS.CAPTURE);
                            break;
                        }
                        /* break, if knight or king */
                        if (type === KNIGHT || type === KING)
                            break;
                    }
                }
            }
        }
        /*
         * check for castling if we're:
         *   a) generating all moves, or
         *   b) doing single square move generation on the king's square
         */
        if (forPiece === undefined || forPiece === KING) {
            if (!singleSquare || lastSquare === this._kings[us]) {
                // king-side castling
                if (this._castling[us] & BITS.KSIDE_CASTLE) {
                    const castlingFrom = this._kings[us];
                    const castlingTo = castlingFrom + 2;
                    if (!this._board[castlingFrom + 1] &&
                        !this._board[castlingTo] &&
                        !this._attacked(them, this._kings[us]) &&
                        !this._attacked(them, castlingFrom + 1) &&
                        !this._attacked(them, castlingTo)) {
                        addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.KSIDE_CASTLE);
                    }
                }
                // queen-side castling
                if (this._castling[us] & BITS.QSIDE_CASTLE) {
                    const castlingFrom = this._kings[us];
                    const castlingTo = castlingFrom - 2;
                    if (!this._board[castlingFrom - 1] &&
                        !this._board[castlingFrom - 2] &&
                        !this._board[castlingFrom - 3] &&
                        !this._attacked(them, this._kings[us]) &&
                        !this._attacked(them, castlingFrom - 1) &&
                        !this._attacked(them, castlingTo)) {
                        addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.QSIDE_CASTLE);
                    }
                }
            }
        }
        /*
         * return all pseudo-legal moves (this includes moves that allow the king
         * to be captured)
         */
        if (!legal || this._kings[us] === -1) {
            return moves;
        }
        // filter out illegal moves
        const legalMoves = [];
        for (let i = 0, len = moves.length; i < len; i++) {
            this._makeMove(moves[i]);
            if (!this._isKingAttacked(us)) {
                legalMoves.push(moves[i]);
            }
            this._undoMove();
        }
        return legalMoves;
    }
    move(move, { strict = false } = {}) {
        /*
         * The move function can be called with in the following parameters:
         *
         * .move('Nxb7')       <- argument is a case-sensitive SAN string
         *
         * .move({ from: 'h7', <- argument is a move object
         *         to :'h8',
         *         promotion: 'q' })
         *
         *
         * An optional strict argument may be supplied to tell chess.js to
         * strictly follow the SAN specification.
         */
        let moveObj = null;
        if (typeof move === 'string') {
            moveObj = this._moveFromSan(move, strict);
        }
        else if (move === null) {
            moveObj = this._moveFromSan(SAN_NULLMOVE, strict);
        }
        else if (typeof move === 'object') {
            const moves = this._moves();
            // convert the pretty move object to an ugly move object
            for (let i = 0, len = moves.length; i < len; i++) {
                if (move.from === algebraic(moves[i].from) &&
                    move.to === algebraic(moves[i].to) &&
                    (!('promotion' in moves[i]) || move.promotion === moves[i].promotion)) {
                    moveObj = moves[i];
                    break;
                }
            }
        }
        // failed to find move
        if (!moveObj) {
            if (typeof move === 'string') {
                throw new Error(`Invalid move: ${move}`);
            }
            else {
                throw new Error(`Invalid move: ${JSON.stringify(move)}`);
            }
        }
        //disallow null moves when in check
        if (this.isCheck() && moveObj.flags & BITS.NULL_MOVE) {
            throw new Error('Null move not allowed when in check');
        }
        /*
         * need to make a copy of move because we can't generate SAN after the move
         * is made
         */
        const prettyMove = new Move(this, moveObj);
        this._makeMove(moveObj);
        this._incPositionCount();
        return prettyMove;
    }
    _push(move) {
        this._history.push({
            move,
            kings: { b: this._kings.b, w: this._kings.w },
            turn: this._turn,
            castling: { b: this._castling.b, w: this._castling.w },
            epSquare: this._epSquare,
            halfMoves: this._halfMoves,
            moveNumber: this._moveNumber,
        });
    }
    _movePiece(from, to) {
        this._hash ^= this._pieceKey(from);
        this._board[to] = this._board[from];
        delete this._board[from];
        this._hash ^= this._pieceKey(to);
    }
    _makeMove(move) {
        const us = this._turn;
        const them = swapColor(us);
        this._push(move);
        if (move.flags & BITS.NULL_MOVE) {
            if (us === BLACK) {
                this._moveNumber++;
            }
            this._halfMoves++;
            this._turn = them;
            this._epSquare = EMPTY;
            return;
        }
        this._hash ^= this._epKey();
        this._hash ^= this._castlingKey();
        if (move.captured) {
            this._hash ^= this._pieceKey(move.to);
        }
        this._movePiece(move.from, move.to);
        // if ep capture, remove the captured pawn
        if (move.flags & BITS.EP_CAPTURE) {
            if (this._turn === BLACK) {
                this._clear(move.to - 16);
            }
            else {
                this._clear(move.to + 16);
            }
        }
        // if pawn promotion, replace with new piece
        if (move.promotion) {
            this._clear(move.to);
            this._set(move.to, { type: move.promotion, color: us });
        }
        // if we moved the king
        if (this._board[move.to].type === KING) {
            this._kings[us] = move.to;
            // if we castled, move the rook next to the king
            if (move.flags & BITS.KSIDE_CASTLE) {
                const castlingTo = move.to - 1;
                const castlingFrom = move.to + 1;
                this._movePiece(castlingFrom, castlingTo);
            }
            else if (move.flags & BITS.QSIDE_CASTLE) {
                const castlingTo = move.to + 1;
                const castlingFrom = move.to - 2;
                this._movePiece(castlingFrom, castlingTo);
            }
            // turn off castling
            this._castling[us] = 0;
        }
        // turn off castling if we move a rook
        if (this._castling[us]) {
            for (let i = 0, len = ROOKS[us].length; i < len; i++) {
                if (move.from === ROOKS[us][i].square &&
                    this._castling[us] & ROOKS[us][i].flag) {
                    this._castling[us] ^= ROOKS[us][i].flag;
                    break;
                }
            }
        }
        // turn off castling if we capture a rook
        if (this._castling[them]) {
            for (let i = 0, len = ROOKS[them].length; i < len; i++) {
                if (move.to === ROOKS[them][i].square &&
                    this._castling[them] & ROOKS[them][i].flag) {
                    this._castling[them] ^= ROOKS[them][i].flag;
                    break;
                }
            }
        }
        this._hash ^= this._castlingKey();
        // if big pawn move, update the en passant square
        if (move.flags & BITS.BIG_PAWN) {
            let epSquare;
            if (us === BLACK) {
                epSquare = move.to - 16;
            }
            else {
                epSquare = move.to + 16;
            }
            if ((!((move.to - 1) & 0x88) &&
                this._board[move.to - 1]?.type === PAWN &&
                this._board[move.to - 1]?.color === them) ||
                (!((move.to + 1) & 0x88) &&
                    this._board[move.to + 1]?.type === PAWN &&
                    this._board[move.to + 1]?.color === them)) {
                this._epSquare = epSquare;
                this._hash ^= this._epKey();
            }
            else {
                this._epSquare = EMPTY;
            }
        }
        else {
            this._epSquare = EMPTY;
        }
        // reset the 50 move counter if a pawn is moved or a piece is captured
        if (move.piece === PAWN) {
            this._halfMoves = 0;
        }
        else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
            this._halfMoves = 0;
        }
        else {
            this._halfMoves++;
        }
        if (us === BLACK) {
            this._moveNumber++;
        }
        this._turn = them;
        this._hash ^= SIDE_KEY;
    }
    undo() {
        const hash = this._hash;
        const move = this._undoMove();
        if (move) {
            const prettyMove = new Move(this, move);
            this._decPositionCount(hash);
            return prettyMove;
        }
        return null;
    }
    _undoMove() {
        const old = this._history.pop();
        if (old === undefined) {
            return null;
        }
        this._hash ^= this._epKey();
        this._hash ^= this._castlingKey();
        const move = old.move;
        this._kings = old.kings;
        this._turn = old.turn;
        this._castling = old.castling;
        this._epSquare = old.epSquare;
        this._halfMoves = old.halfMoves;
        this._moveNumber = old.moveNumber;
        this._hash ^= this._epKey();
        this._hash ^= this._castlingKey();
        this._hash ^= SIDE_KEY;
        const us = this._turn;
        const them = swapColor(us);
        if (move.flags & BITS.NULL_MOVE) {
            return move;
        }
        this._movePiece(move.to, move.from);
        // to undo any promotions
        if (move.piece) {
            this._clear(move.from);
            this._set(move.from, { type: move.piece, color: us });
        }
        if (move.captured) {
            if (move.flags & BITS.EP_CAPTURE) {
                // en passant capture
                let index;
                if (us === BLACK) {
                    index = move.to - 16;
                }
                else {
                    index = move.to + 16;
                }
                this._set(index, { type: PAWN, color: them });
            }
            else {
                // regular capture
                this._set(move.to, { type: move.captured, color: them });
            }
        }
        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            let castlingTo, castlingFrom;
            if (move.flags & BITS.KSIDE_CASTLE) {
                castlingTo = move.to + 1;
                castlingFrom = move.to - 1;
            }
            else {
                castlingTo = move.to - 2;
                castlingFrom = move.to + 1;
            }
            this._movePiece(castlingFrom, castlingTo);
        }
        return move;
    }
    pgn({ newline = '\n', maxWidth = 0, } = {}) {
        /*
         * using the specification from http://www.chessclub.com/help/PGN-spec
         * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
         */
        const result = [];
        let headerExists = false;
        /* add the PGN header information */
        for (const i in this._header) {
            /*
             * TODO: order of enumerated properties in header object is not
             * guaranteed, see ECMA-262 spec (section 12.6.4)
             *
             * By using HEADER_TEMPLATE, the order of tags should be preserved; we
             * do have to check for null placeholders, though, and omit them
             */
            const headerTag = this._header[i];
            if (headerTag)
                result.push(`[${i} "${this._header[i]}"]` + newline);
            headerExists = true;
        }
        if (headerExists && this._history.length) {
            result.push(newline);
        }
        const appendComment = (moveString) => {
            const comment = this._comments[this.fen()];
            if (typeof comment !== 'undefined') {
                const delimiter = moveString.length > 0 ? ' ' : '';
                moveString = `${moveString}${delimiter}{${comment}}`;
            }
            return moveString;
        };
        // pop all of history onto reversed_history
        const reversedHistory = [];
        while (this._history.length > 0) {
            reversedHistory.push(this._undoMove());
        }
        const moves = [];
        let moveString = '';
        // special case of a commented starting position with no moves
        if (reversedHistory.length === 0) {
            moves.push(appendComment(''));
        }
        // build the list of moves.  a move_string looks like: "3. e3 e6"
        while (reversedHistory.length > 0) {
            moveString = appendComment(moveString);
            const move = reversedHistory.pop();
            // make TypeScript stop complaining about move being undefined
            if (!move) {
                break;
            }
            // if the position started with black to move, start PGN with #. ...
            if (!this._history.length && move.color === 'b') {
                const prefix = `${this._moveNumber}. ...`;
                // is there a comment preceding the first move?
                moveString = moveString ? `${moveString} ${prefix}` : prefix;
            }
            else if (move.color === 'w') {
                // store the previous generated move_string if we have one
                if (moveString.length) {
                    moves.push(moveString);
                }
                moveString = this._moveNumber + '.';
            }
            moveString =
                moveString + ' ' + this._moveToSan(move, this._moves({ legal: true }));
            this._makeMove(move);
        }
        // are there any other leftover moves?
        if (moveString.length) {
            moves.push(appendComment(moveString));
        }
        // is there a result? (there ALWAYS has to be a result according to spec; see Seven Tag Roster)
        moves.push(this._header.Result || '*');
        /*
         * history should be back to what it was before we started generating PGN,
         * so join together moves
         */
        if (maxWidth === 0) {
            return result.join('') + moves.join(' ');
        }
        // TODO (jah): huh?
        const strip = function () {
            if (result.length > 0 && result[result.length - 1] === ' ') {
                result.pop();
                return true;
            }
            return false;
        };
        // NB: this does not preserve comment whitespace.
        const wrapComment = function (width, move) {
            for (const token of move.split(' ')) {
                if (!token) {
                    continue;
                }
                if (width + token.length > maxWidth) {
                    while (strip()) {
                        width--;
                    }
                    result.push(newline);
                    width = 0;
                }
                result.push(token);
                width += token.length;
                result.push(' ');
                width++;
            }
            if (strip()) {
                width--;
            }
            return width;
        };
        // wrap the PGN output at max_width
        let currentWidth = 0;
        for (let i = 0; i < moves.length; i++) {
            if (currentWidth + moves[i].length > maxWidth) {
                if (moves[i].includes('{')) {
                    currentWidth = wrapComment(currentWidth, moves[i]);
                    continue;
                }
            }
            // if the current move will push past max_width
            if (currentWidth + moves[i].length > maxWidth && i !== 0) {
                // don't end the line with whitespace
                if (result[result.length - 1] === ' ') {
                    result.pop();
                }
                result.push(newline);
                currentWidth = 0;
            }
            else if (i !== 0) {
                result.push(' ');
                currentWidth++;
            }
            result.push(moves[i]);
            currentWidth += moves[i].length;
        }
        return result.join('');
    }
    /**
     * @deprecated Use `setHeader` and `getHeaders` instead. This method will return null header tags (which is not what you want)
     */
    header(...args) {
        for (let i = 0; i < args.length; i += 2) {
            if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
                this._header[args[i]] = args[i + 1];
            }
        }
        return this._header;
    }
    // TODO: value validation per spec
    setHeader(key, value) {
        this._header[key] = value ?? SEVEN_TAG_ROSTER[key] ?? null;
        return this.getHeaders();
    }
    removeHeader(key) {
        if (key in this._header) {
            this._header[key] = SEVEN_TAG_ROSTER[key] || null;
            return true;
        }
        return false;
    }
    // return only non-null headers (omit placemarker nulls)
    getHeaders() {
        const nonNullHeaders = {};
        for (const [key, value] of Object.entries(this._header)) {
            if (value !== null) {
                nonNullHeaders[key] = value;
            }
        }
        return nonNullHeaders;
    }
    loadPgn(pgn, { strict = false, newlineChar = '\r?\n', } = {}) {
        // If newlineChar is not the default, replace all instances with \n
        if (newlineChar !== '\r?\n') {
            pgn = pgn.replace(new RegExp(newlineChar, 'g'), '\n');
        }
        const parsedPgn = peg$parse(pgn);
        // Put the board in the starting position
        this.reset();
        // parse PGN header
        const headers = parsedPgn.headers;
        let fen = '';
        for (const key in headers) {
            // check to see user is including fen (possibly with wrong tag case)
            if (key.toLowerCase() === 'fen') {
                fen = headers[key];
            }
            this.header(key, headers[key]);
        }
        /*
         * the permissive parser should attempt to load a fen tag, even if it's the
         * wrong case and doesn't include a corresponding [SetUp "1"] tag
         */
        if (!strict) {
            if (fen) {
                this.load(fen, { preserveHeaders: true });
            }
        }
        else {
            /*
             * strict parser - load the starting position indicated by [Setup '1']
             * and [FEN position]
             */
            if (headers['SetUp'] === '1') {
                if (!('FEN' in headers)) {
                    throw new Error('Invalid PGN: FEN tag must be supplied with SetUp tag');
                }
                // don't clear the headers when loading
                this.load(headers['FEN'], { preserveHeaders: true });
            }
        }
        let node = parsedPgn.root;
        while (node) {
            if (node.move) {
                const move = this._moveFromSan(node.move, strict);
                if (move == null) {
                    throw new Error(`Invalid move in PGN: ${node.move}`);
                }
                else {
                    this._makeMove(move);
                    this._incPositionCount();
                }
            }
            if (node.comment !== undefined) {
                this._comments[this.fen()] = node.comment;
            }
            node = node.variations[0];
        }
        /*
         * Per section 8.2.6 of the PGN spec, the Result tag pair must match match
         * the termination marker. Only do this when headers are present, but the
         * result tag is missing
         */
        const result = parsedPgn.result;
        if (result &&
            Object.keys(this._header).length &&
            this._header['Result'] !== result) {
            this.setHeader('Result', result);
        }
    }
    /*
     * Convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     *
     * @param {boolean} strict Use the strict SAN parser. It will throw errors
     * on overly disambiguated moves (see below):
     *
     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
     * 4. ... Ne7 is technically the valid SAN
     */
    _moveToSan(move, moves) {
        let output = '';
        if (move.flags & BITS.KSIDE_CASTLE) {
            output = 'O-O';
        }
        else if (move.flags & BITS.QSIDE_CASTLE) {
            output = 'O-O-O';
        }
        else if (move.flags & BITS.NULL_MOVE) {
            return SAN_NULLMOVE;
        }
        else {
            if (move.piece !== PAWN) {
                const disambiguator = getDisambiguator(move, moves);
                output += move.piece.toUpperCase() + disambiguator;
            }
            if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
                if (move.piece === PAWN) {
                    output += algebraic(move.from)[0];
                }
                output += 'x';
            }
            output += algebraic(move.to);
            if (move.promotion) {
                output += '=' + move.promotion.toUpperCase();
            }
        }
        this._makeMove(move);
        if (this.isCheck()) {
            if (this.isCheckmate()) {
                output += '#';
            }
            else {
                output += '+';
            }
        }
        this._undoMove();
        return output;
    }
    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
    _moveFromSan(move, strict = false) {
        // strip off any move decorations: e.g Nf3+?! becomes Nf3
        let cleanMove = strippedSan(move);
        if (!strict) {
            if (cleanMove === '0-0') {
                cleanMove = 'O-O';
            }
            else if (cleanMove === '0-0-0') {
                cleanMove = 'O-O-O';
            }
        }
        //first implementation of null with a dummy move (black king moves from a8 to a8), maybe this can be implemented better
        if (cleanMove == SAN_NULLMOVE) {
            const res = {
                color: this._turn,
                from: 0,
                to: 0,
                piece: 'k',
                flags: BITS.NULL_MOVE,
            };
            return res;
        }
        let pieceType = inferPieceType(cleanMove);
        let moves = this._moves({ legal: true, piece: pieceType });
        // strict parser
        for (let i = 0, len = moves.length; i < len; i++) {
            if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {
                return moves[i];
            }
        }
        // the strict parser failed
        if (strict) {
            return null;
        }
        let piece = undefined;
        let matches = undefined;
        let from = undefined;
        let to = undefined;
        let promotion = undefined;
        /*
         * The default permissive (non-strict) parser allows the user to parse
         * non-standard chess notations. This parser is only run after the strict
         * Standard Algebraic Notation (SAN) parser has failed.
         *
         * When running the permissive parser, we'll run a regex to grab the piece, the
         * to/from square, and an optional promotion piece. This regex will
         * parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,
         * f7f8q, b1c3
         *
         * NOTE: Some positions and moves may be ambiguous when using the permissive
         * parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,
         * the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated bishop
         * move). In these cases, the permissive parser will default to the most
         * basic interpretation (which is b1c3 parsing to Nc3).
         */
        let overlyDisambiguated = false;
        matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
        if (matches) {
            piece = matches[1];
            from = matches[2];
            to = matches[3];
            promotion = matches[4];
            if (from.length == 1) {
                overlyDisambiguated = true;
            }
        }
        else {
            /*
             * The [a-h]?[1-8]? portion of the regex below handles moves that may be
             * overly disambiguated (e.g. Nge7 is unnecessary and non-standard when
             * there is one legal knight move to e7). In this case, the value of
             * 'from' variable will be a rank or file, not a square.
             */
            matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/);
            if (matches) {
                piece = matches[1];
                from = matches[2];
                to = matches[3];
                promotion = matches[4];
                if (from.length == 1) {
                    overlyDisambiguated = true;
                }
            }
        }
        pieceType = inferPieceType(cleanMove);
        moves = this._moves({
            legal: true,
            piece: piece ? piece : pieceType,
        });
        if (!to) {
            return null;
        }
        for (let i = 0, len = moves.length; i < len; i++) {
            if (!from) {
                // if there is no from square, it could be just 'x' missing from a capture
                if (cleanMove ===
                    strippedSan(this._moveToSan(moves[i], moves)).replace('x', '')) {
                    return moves[i];
                }
                // hand-compare move properties with the results from our permissive regex
            }
            else if ((!piece || piece.toLowerCase() == moves[i].piece) &&
                Ox88[from] == moves[i].from &&
                Ox88[to] == moves[i].to &&
                (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
                return moves[i];
            }
            else if (overlyDisambiguated) {
                /*
                 * SPECIAL CASE: we parsed a move string that may have an unneeded
                 * rank/file disambiguator (e.g. Nge7).  The 'from' variable will
                 */
                const square = algebraic(moves[i].from);
                if ((!piece || piece.toLowerCase() == moves[i].piece) &&
                    Ox88[to] == moves[i].to &&
                    (from == square[0] || from == square[1]) &&
                    (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
                    return moves[i];
                }
            }
        }
        return null;
    }
    ascii() {
        let s = '   +------------------------+\n';
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            // display the rank
            if (file(i) === 0) {
                s += ' ' + '87654321'[rank(i)] + ' |';
            }
            if (this._board[i]) {
                const piece = this._board[i].type;
                const color = this._board[i].color;
                const symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
                s += ' ' + symbol + ' ';
            }
            else {
                s += ' . ';
            }
            if ((i + 1) & 0x88) {
                s += '|\n';
                i += 8;
            }
        }
        s += '   +------------------------+\n';
        s += '     a  b  c  d  e  f  g  h';
        return s;
    }
    perft(depth) {
        const moves = this._moves({ legal: false });
        let nodes = 0;
        const color = this._turn;
        for (let i = 0, len = moves.length; i < len; i++) {
            this._makeMove(moves[i]);
            if (!this._isKingAttacked(color)) {
                if (depth - 1 > 0) {
                    nodes += this.perft(depth - 1);
                }
                else {
                    nodes++;
                }
            }
            this._undoMove();
        }
        return nodes;
    }
    setTurn(color) {
        if (this._turn == color) {
            return false;
        }
        this.move('--');
        return true;
    }
    turn() {
        return this._turn;
    }
    board() {
        const output = [];
        let row = [];
        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (this._board[i] == null) {
                row.push(null);
            }
            else {
                row.push({
                    square: algebraic(i),
                    type: this._board[i].type,
                    color: this._board[i].color,
                });
            }
            if ((i + 1) & 0x88) {
                output.push(row);
                row = [];
                i += 8;
            }
        }
        return output;
    }
    squareColor(square) {
        if (square in Ox88) {
            const sq = Ox88[square];
            return (rank(sq) + file(sq)) % 2 === 0 ? 'light' : 'dark';
        }
        return null;
    }
    history({ verbose = false } = {}) {
        const reversedHistory = [];
        const moveHistory = [];
        while (this._history.length > 0) {
            reversedHistory.push(this._undoMove());
        }
        while (true) {
            const move = reversedHistory.pop();
            if (!move) {
                break;
            }
            if (verbose) {
                moveHistory.push(new Move(this, move));
            }
            else {
                moveHistory.push(this._moveToSan(move, this._moves()));
            }
            this._makeMove(move);
        }
        return moveHistory;
    }
    /*
     * Keeps track of position occurrence counts for the purpose of repetition
     * checking. Old positions are removed from the map if their counts are reduced to 0.
     */
    _getPositionCount(hash) {
        return this._positionCount.get(hash) ?? 0;
    }
    _incPositionCount() {
        this._positionCount.set(this._hash, (this._positionCount.get(this._hash) ?? 0) + 1);
    }
    _decPositionCount(hash) {
        const currentCount = this._positionCount.get(hash) ?? 0;
        if (currentCount === 1) {
            this._positionCount.delete(hash);
        }
        else {
            this._positionCount.set(hash, currentCount - 1);
        }
    }
    _pruneComments() {
        const reversedHistory = [];
        const currentComments = {};
        const copyComment = (fen) => {
            if (fen in this._comments) {
                currentComments[fen] = this._comments[fen];
            }
        };
        while (this._history.length > 0) {
            reversedHistory.push(this._undoMove());
        }
        copyComment(this.fen());
        while (true) {
            const move = reversedHistory.pop();
            if (!move) {
                break;
            }
            this._makeMove(move);
            copyComment(this.fen());
        }
        this._comments = currentComments;
    }
    getComment() {
        return this._comments[this.fen()];
    }
    setComment(comment) {
        this._comments[this.fen()] = comment.replace('{', '[').replace('}', ']');
    }
    /**
     * @deprecated Renamed to `removeComment` for consistency
     */
    deleteComment() {
        return this.removeComment();
    }
    removeComment() {
        const comment = this._comments[this.fen()];
        delete this._comments[this.fen()];
        return comment;
    }
    getComments() {
        this._pruneComments();
        return Object.keys(this._comments).map((fen) => {
            return { fen: fen, comment: this._comments[fen] };
        });
    }
    /**
     * @deprecated Renamed to `removeComments` for consistency
     */
    deleteComments() {
        return this.removeComments();
    }
    removeComments() {
        this._pruneComments();
        return Object.keys(this._comments).map((fen) => {
            const comment = this._comments[fen];
            delete this._comments[fen];
            return { fen: fen, comment: comment };
        });
    }
    setCastlingRights(color, rights) {
        for (const side of [KING, QUEEN]) {
            if (rights[side] !== undefined) {
                if (rights[side]) {
                    this._castling[color] |= SIDES[side];
                }
                else {
                    this._castling[color] &= ~SIDES[side];
                }
            }
        }
        this._updateCastlingRights();
        const result = this.getCastlingRights(color);
        return ((rights[KING] === undefined || rights[KING] === result[KING]) &&
            (rights[QUEEN] === undefined || rights[QUEEN] === result[QUEEN]));
    }
    getCastlingRights(color) {
        return {
            [KING]: (this._castling[color] & SIDES[KING]) !== 0,
            [QUEEN]: (this._castling[color] & SIDES[QUEEN]) !== 0,
        };
    }
    moveNumber() {
        return this._moveNumber;
    }
}


//# sourceMappingURL=chess.js.map


const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={sound:'<path d="m11 5-6 4H2v6h3l6 4z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',mute:'<path d="m11 5-6 4H2v6h3l6 4zM16 9l5 6m0-6-5 6"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',flip:'<path d="M4 8h15l-4-4m5 12H5l4 4M4 8v5m16 3v-5"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 5a5 5 0 0 1 2 4v2"/>',bot:'<path d="M12 3v3m-6 7a6 6 0 1 1 12 0v4H6z"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M9 18h6M4 12H2m20 0h-2"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',link:'<path d="m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"/>',flag:'<path d="M5 22V3c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',draw:'<path d="M4 8h16M4 16h16"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]||''}</svg>`;
for(const [id,n,t] of [['sound','sound',''],['flip','flip',''],['pgn','download',''],['join','arrow',''],['copy','link','Скопировать приглашение'],['draw','draw','Ничья'],['resign','flag','Сдаться']])$(id).innerHTML=icon(n)+t;

function enhanceSelect(select){
  if(!select||select.dataset.enhanced==='1')return;
  select.dataset.enhanced='1';
  select.closest('.setting-card')?.classList.add('enhanced-select');
  const root=document.createElement('div');root.className='smart-select';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='smart-select-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
  const value=document.createElement('span');value.className='smart-select-value';
  const chev=document.createElementNS('http://www.w3.org/2000/svg','svg');chev.setAttribute('viewBox','0 0 24 24');chev.setAttribute('fill','none');chev.setAttribute('stroke','currentColor');chev.setAttribute('stroke-width','1.8');chev.setAttribute('stroke-linecap','round');chev.setAttribute('stroke-linejoin','round');chev.classList.add('select-chevron');chev.innerHTML='<path d="m7 10 5 5 5-5"/>';
  trigger.append(value,chev);
  const menu=document.createElement('div');menu.className='smart-select-menu';menu.setAttribute('role','listbox');
  let focused=0;
  const sync=()=>{
    const opts=[...menu.querySelectorAll('.smart-select-option')];
    const selected=select.options[select.selectedIndex];
    value.textContent=selected?.textContent||'';
    opts.forEach((b,i)=>{const on=b.dataset.value===select.value;b.classList.toggle('selected',on);b.setAttribute('aria-selected',on?'true':'false');if(on)focused=i;});
  };
  [...select.options].forEach(opt=>{
    const b=document.createElement('button');b.type='button';b.className='smart-select-option';b.dataset.value=opt.value;b.setAttribute('role','option');
    const txt=document.createElement('span');txt.textContent=opt.textContent;
    const check=document.createElement('span');check.className='option-check';check.textContent='✓';
    b.append(txt,check);
    b.onclick=e=>{e.preventDefault();select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));root.classList.remove('open');trigger.setAttribute('aria-expanded','false');sync();trigger.focus();};
    menu.append(b);
  });
  const close=()=>{root.classList.remove('open');trigger.setAttribute('aria-expanded','false');menu.querySelectorAll('.smart-select-option').forEach(x=>x.classList.remove('focused'));};
  const open=()=>{document.querySelectorAll('.smart-select.open').forEach(x=>{if(x!==root)x.classList.remove('open')});root.classList.add('open');trigger.setAttribute('aria-expanded','true');requestAnimationFrame(()=>menu.querySelectorAll('.smart-select-option')[focused]?.classList.add('focused'));};
  trigger.onclick=e=>{e.preventDefault();root.classList.contains('open')?close():open();};
  trigger.onkeydown=e=>{
    const opts=[...menu.querySelectorAll('.smart-select-option')];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!root.classList.contains('open'))open();opts[focused]?.classList.remove('focused');focused=(focused+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length;opts[focused]?.classList.add('focused');}
    else if(e.key==='Enter'&&root.classList.contains('open')){e.preventDefault();opts[focused]?.click();}
    else if(e.key==='Escape'){close();}
  };
  select.addEventListener('change',sync);
  root.append(trigger,menu);select.insertAdjacentElement('afterend',root);sync();
}
['minutes','increment','botLevel'].forEach(id=>enhanceSelect($(id)));
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.smart-select'))document.querySelectorAll('.smart-select.open').forEach(x=>{x.classList.remove('open');x.querySelector('.smart-select-trigger')?.setAttribute('aria-expanded','false')})});

$('create').innerHTML=icon('globe')+'<span><strong>Играть онлайн</strong><small>Создать комнату и пригласить друга</small></span>';
$('botGame').innerHTML=icon('bot')+'<span><strong>Сыграть с ботом</strong><small>Тренировка против ИИ</small></span>';
$('local').innerHTML=icon('users')+'<span><strong>Локальная игра</strong><small>Два игрока на одном устройстве</small></span>';
// Original SVG pieces. No assets or sounds copied from Chess.com.
const paths={p:'<circle cx="32" cy="17" r="8"/><path d="M26 25h12l-3 10 7 13H22l7-13z"/><path d="M20 48h24v6H20z"/>',r:'<path d="M17 10h8v7h5v-7h5v7h5v-7h8v16l-7 5v14H24V31l-7-5zM21 45h24v9H21z"/>',n:'<path d="m22 45 4-13-9 4-5-8 11-13 2-9 8 6c18 0 20 22 12 33zM19 45h28v9H19z"/><circle cx="29" cy="22" r="1.8" fill="currentColor"/>',b:'<path d="M32 6c-3 7-12 11-12 20 0 6 6 10 12 10s12-4 12-10C44 17 35 13 32 6zM29 36h6l7 11H22zM19 47h26v7H19z"/><path d="m32 16-6 12" fill="none"/>',q:'<path d="m17 19 7 9 8-15 8 15 7-9-6 27H23zM20 46h24v8H20z"/><circle cx="16" cy="16" r="4"/><circle cx="32" cy="10" r="4"/><circle cx="48" cy="16" r="4"/><path d="M24 36h16"/>',k:'<path d="M32 5v13m-6-8h12" fill="none" stroke-width="4"/><path d="M25 20c-10-8-19 6-9 15l8 9h16l8-9c10-9 1-23-9-15-3-8-11-8-14 0zM22 44h20v10H22z"/><path d="M24 35h16"/>'};
let pieceGradientId=0;
function pieceSvg(p){const id='uc-piece-'+(++pieceGradientId),white=p.color==='w';return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="url(#${id})" stroke="${white?'#65553d':'#11171a'}" style="color:${white?'#65553d':'#83908c'}" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="${white?'#fffdf2':'#66716c'}"/><stop offset=".36" stop-color="${white?'#f6e9ca':'#3d4843'}"/><stop offset=".73" stop-color="${white?'#e7d6af':'#242e2a'}"/><stop offset="1" stop-color="${white?'#c9b78f':'#17201c'}"/></linearGradient></defs>${paths[p.type]}</svg>`;}

let chess=new Chess(),mode='local',color='w',flipped=false,selected=null,last=null,clock={w:600000,b:600000},since=Date.now(),increment=0,status='ready',result='',players={w:{name:'Белые'},b:{name:'Чёрные'}},ws=null,seat=null,connected=false,offer=null,rematch=null,pending=false,audio=null,sound=true,toastTimer,serverOffset=0,previousNodes=new Map(),pendingPromotion=null,botSide='b',botThinking=false;
try{sound=localStorage.getItem('uc.sound')!=='off';$('name').value=localStorage.getItem('uc.name')||'Игрок';}catch{}
function notify(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function playSound(kind='move'){
  if(!sound)return;
  try{
    audio??=new(window.AudioContext||window.webkitAudioContext)();
    audio.resume();
    const base=audio.currentTime+.018;

    // Короткий физически-похожий импульс дерева: шум удара проходит
    // через несколько резонансов доски. Без электронных «пищалок».
    const woodImpact=(at=0,{strength=.8,pitch=1,bright=1,body=1}={})=>{
      const t=base+at,sr=audio.sampleRate,len=Math.floor(sr*.12);
      const buf=audio.createBuffer(1,len,sr),d=buf.getChannelData(0);
      for(let i=0;i<len;i++){
        const sec=i/sr;
        const attack=Math.min(1,sec/.0018);
        const decay=Math.exp(-sec*38);
        // Смесь мелкого контакта и чуть более тяжёлого удара по дереву.
        d[i]=(Math.random()*2-1)*attack*decay*(.82+.18*Math.cos(i*.13));
      }
      const src=audio.createBufferSource();src.buffer=buf;
      const hp=audio.createBiquadFilter();hp.type='highpass';hp.frequency.value=75;
      const lp=audio.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3600*bright;
      const direct=audio.createGain();
      direct.gain.setValueAtTime(.0001,t);
      direct.gain.linearRampToValueAtTime(.18*strength,t+.0018);
      direct.gain.exponentialRampToValueAtTime(.001,t+.105);
      src.connect(hp).connect(lp).connect(direct).connect(audio.destination);

      // Резонансы деревянной доски — всё тоже возбуждается шумовым импульсом,
      // поэтому звук не превращается в синтезаторный тон.
      const modes=[
        [185,.080,.72],[365,.050,.92],[690,.032,1.06],[1180,.020,1.18]
      ];
      for(const [f,g,q] of modes){
        const bp=audio.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*pitch;bp.Q.value=q;
        const mg=audio.createGain();
        mg.gain.setValueAtTime(.0001,t);
        mg.gain.linearRampToValueAtTime(g*strength*body,t+.002);
        mg.gain.exponentialRampToValueAtTime(.001,t+.115);
        src.connect(bp).connect(mg).connect(audio.destination);
      }
      src.start(t);src.stop(t+.125);
    };

    const softThump=(at=0,strength=.18,pitch=1)=>{
      const t=base+at,o=audio.createOscillator(),g=audio.createGain();
      o.type='sine';o.frequency.setValueAtTime(118*pitch,t);o.frequency.exponentialRampToValueAtTime(82*pitch,t+.08);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(strength,t+.003);g.gain.exponentialRampToValueAtTime(.001,t+.095);
      o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.105);
    };

    if(kind==='capture'){
      // Сначала сняли чужую фигуру, затем поставили свою.
      woodImpact(0,{strength:.43,pitch:1.14,bright:1.12,body:.72});
      woodImpact(.072,{strength:.95,pitch:.94,bright:.94,body:1.1});
      softThump(.076,.055,.96);
    }else if(kind==='check'){
      // Ход + короткий чёткий акцент: заметно, но не как уведомление телефона.
      woodImpact(0,{strength:.82,pitch:.98,bright:1,body:1});
      woodImpact(.086,{strength:.36,pitch:1.32,bright:1.22,body:.62});
    }else if(kind==='mate'){
      // Более тяжёлая финальная постановка и два глубоких отклика доски.
      woodImpact(0,{strength:1.05,pitch:.90,bright:.88,body:1.22});
      softThump(.012,.095,.88);
      woodImpact(.105,{strength:.58,pitch:.78,bright:.78,body:1.30});
      softThump(.118,.075,.72);
    }else if(kind==='castle'){
      woodImpact(0,{strength:.72,pitch:1.02,bright:1,body:.9});
      woodImpact(.092,{strength:.82,pitch:.94,bright:.94,body:1.02});
    }else{
      // Обычная постановка фигуры на деревянную доску.
      woodImpact(0,{strength:.82,pitch:1,bright:1,body:1});
      softThump(.008,.038,1);
    }
  }catch{}
}
function soundKindForMove(move){
  if(chess.isCheckmate())return 'mate';
  if(chess.isCheck())return 'check';
  if(move?.captured)return 'capture';
  if(/[kq]/.test(move?.flags||''))return 'castle';
  return 'move';
}
function indexOf(sq){const f=sq.charCodeAt(0)-97,r=8-Number(sq[1]);return flipped?63-(r*8+f):r*8+f;}
var A={open:false,moves:[],ply:0,ev:null,v:null,lv:null,token:0};const V=()=>A.open?A.v:chess,LV=()=>A.open?A.lv:last;
function allowed(){return !A.open&&!pending&&(status==='playing'||status==='ready')&&(mode==='local'||(mode==='bot'&&chess.turn()!==botSide)||(mode==='online'&&connected&&chess.turn()===color));}
function drawBoard(){
 const game=V(),fen=game.fen(),key=fen+'|'+flipped+'|'+selected+'|'+A.open;
 if(drawBoard.key===key)return;drawBoard.key=key;
 const targets=selected?game.moves({square:selected,verbose:true}):[],all=game.board().flat().filter(Boolean),checkSquare=game.isCheck()?all.find(p=>p.type==='k'&&p.color===game.turn())?.square:null;
 const board=$('board');
 if(board.children.length!==64){board.innerHTML=Array.from({length:64},()=>'<button type="button" class="square"></button>').join('');}
 for(let i=0;i<64;i++){const j=flipped?63-i:i,sq=String.fromCharCode(97+j%8)+(8-Math.floor(j/8)),p=game.get(sq),target=targets.some(m=>m.to===sq),cell=board.children[i];
 cell.className=`square ${(j%8+Math.floor(j/8))%2?'dark':''} ${LV()&&(LV().from===sq||LV().to===sq)?'last':''} ${selected===sq?'selected':''} ${target?'target':''} ${target&&p?'capture':''} ${checkSquare===sq?'check':''}`;
 cell.dataset.square=sq;cell.setAttribute('aria-label',sq+(p?' '+({p:'пешка',r:'ладья',n:'конь',b:'слон',q:'ферзь',k:'король'}[p.type])+' '+(p.color==='w'?'белая':'чёрная'):''));
 const labels=(i%8===0?`<span class="coordinate rank">${sq[1]}</span>`:'')+(i>=56?`<span class="coordinate file">${sq[0]}</span>`:'');if(cell.innerHTML!==labels)cell.innerHTML=labels;
 }
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,prev=previousNodes,next=new Map(),used=new Set(),kind=p=>p.color+p.type,tr=i=>`translate(${i%8*100}%,${Math.floor(i/8)*100}%)`,changed=drawBoard.f!==fen;
 drawBoard.f=fen;
 for(const p of all){const n=prev.get(p.square);if(n&&n.dataset.kind===kind(p)){next.set(p.square,n);used.add(n);}}
 const mover=LV()&&!next.has(LV().to)?prev.get(LV().from):null,castle=!!LV()&&/[kq]/.test(LV().flags||'');
 for(const p of all){if(next.has(p.square))continue;let n=null;if(mover&&!used.has(mover)&&LV().to===p.square)n=mover;else if(castle&&p.type==='r')for(const x of prev.values())if(!used.has(x)&&x.dataset.kind===kind(p)){n=x;break;}
 if(n)used.add(n);else{n=document.createElement('div');n.className='piece';n._new=true;$('pieces').append(n);}next.set(p.square,n);}
 for(const [sq,n] of next){const p=game.get(sq),i=indexOf(sq),to=tr(i),from=n._new?null:n.style.transform,isMover=n===mover||(castle&&p.type==='r'&&n._i!==i);
 if(n._new||n.dataset.kind!==kind(p))n.innerHTML=pieceSvg(p);n.dataset.kind=kind(p);n.classList.remove('fallen','lifted');
 if(from!==to){n.getAnimations().forEach(a=>a.cancel());n.style.transform=to;
 if(!reduce&&changed&&from&&isMover){const frames=p.type==='n'&&n._i!=null?[{transform:from},{transform:`translate(${(n._i%8+i%8)*50}%,${(Math.floor(n._i/8)+Math.floor(i/8))*50-12}%)`,offset:.5},{transform:to}]:[{transform:from},{transform:to}];n.style.zIndex='6';const a=n.animate(frames,{duration:240,easing:'cubic-bezier(.22,.7,.24,1)'});a.onfinish=a.oncancel=()=>{n.style.zIndex='';};}}
 n._new=false;n._i=i;
 }
 for(const n of prev.values())if(!used.has(n)){n.getAnimations().forEach(a=>a.cancel());n.remove();}
 previousNodes=next;
}

function clockValue(side){return Math.max(0,clock[side]-(status==='playing'&&chess.turn()===side?Date.now()+serverOffset-since:0));}
function format(ms){const sec=Math.ceil(ms/1000);return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function clocks(){const top=flipped?'w':'b',bottom=flipped?'b':'w';for(const [id,side]of [['topClock',top],['bottomClock',bottom]]){$(id).textContent=format(clockValue(side));$(id).classList.toggle('active',status==='playing'&&chess.turn()===side);$(id).classList.toggle('low',clockValue(side)<20000);}if(mode==='local'&&status==='playing'&&clockValue(chess.turn())===0){clock[chess.turn()]=0;status='finished';result=chess.isInsufficientMaterial()?'Ничья':(chess.turn()==='w'?'Чёрные':'Белые')+' выиграли по времени';render();showResult();}}
function render(){drawBoard();const top=flipped?'w':'b',bottom=flipped?'b':'w';document.querySelector('.player .avatar').innerHTML=top==='w'?'♙':'♟';document.querySelector('.player .avatar').classList.toggle('black',top==='b');document.querySelectorAll('.player .avatar')[1].innerHTML=bottom==='w'?'♙':'♟';document.querySelectorAll('.player .avatar')[1].classList.toggle('black',bottom==='b');$('topName').textContent=players[top]?.name||'Ожидаем соперника';$('bottomName').textContent=players[bottom]?.name||'Ожидаем соперника';for(const [id,side]of [['topStatus',top],['bottomStatus',bottom]])$(id).textContent=(side==='w'?'Белые':'Чёрные')+((mode==='online'&&side===color)||(mode==='bot'&&side!=='b')?' • Ты':'');$('status').innerHTML='<i></i>'+esc(status==='finished'?result:status==='waiting'?'Ждём второго игрока':pending&&mode==='online'?'Отправляем ход…':pending&&mode==='bot'&&chess.turn()===botSide?'Бот думает…':(chess.isCheck()?'Шах! ':'')+(chess.turn()==='w'?'Ход белых':'Ход чёрных'));$('connection').textContent=mode==='local'?'Локальная игра':mode==='bot'?'Партия с ботом':connected?'Онлайн • подключено':'Соединяемся…';$('matchLabel').textContent=mode==='local'?'За одной доской':mode==='bot'?'Против бота':status==='waiting'?'Приглашение готово':'Онлайн-партия';$('matchDescription').textContent=mode==='local'?'Два игрока на одном устройстве. Ходы и правила проверяются автоматически.':mode==='bot'?'Тренировочная партия против Ultimate Bot. Сложность: '+({'1':'лёгкая','2':'средняя','3':'сильная'}[$('botLevel')?.value||'2'])+'.':offer&&offer!==color?'Соперник предлагает ничью. Нажми «Принять ничью» или сделай ход.':rematch&&rematch!==color?'Соперник предлагает реванш. Подтверди, чтобы начать снова.':status==='waiting'?'Отправь ссылку другу. Часы запустятся, когда он войдёт.':'Ты играешь '+(color==='w'?'белыми.':'чёрными.')+' Время синхронизируется с сервером.';document.querySelector('.game-state-actions').hidden=status!=='playing';$('draw').innerHTML=icon('draw')+(offer&&offer!==color?'Принять ничью':offer?'Предложено':'Ничья');$('draw').disabled=status!=='playing'||mode==='bot'||(mode==='online'&&(!connected||offer===color));$('resign').disabled=status!=='playing'||(mode==='online'&&!connected);$('rematch').hidden=status!=='finished';$('rematch').textContent=mode==='online'?(rematch===color?'Ожидаем согласия':rematch?'Принять реванш':'Предложить реванш'):'Сыграть ещё';$('rematch').disabled=mode==='online'&&(!connected||rematch===color);$('invite').hidden=mode!=='online';$('roomCode').textContent=seat?.room||'';$('create').disabled=pending||mode==='online'&&status==='playing';$('botGame').disabled=pending||mode==='online'&&status==='playing';$('local').disabled=mode==='online'&&status==='playing';$('join').disabled=pending||mode==='online'&&status==='playing';$('name').disabled=mode==='online'&&status==='playing';$('sound').innerHTML=icon(sound?'sound':'mute');const history=chess.history();$('moveCount').textContent=history.length;$('moves').innerHTML=history.length?Array.from({length:Math.ceil(history.length/2)},(_,i)=>`<div class="move-row"><span>${i+1}.</span><span>${esc(history[i*2])}</span><span>${esc(history[i*2+1]||'')}</span></div>`).join(''):'<p>Здесь появится история партии после первого хода.</p>';clocks();}
function modal(title,text,yes,action){$('dialogBody').innerHTML=`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button id="cancelDialog" class="secondary">Отмена</button><button id="confirmDialog" class="primary">${esc(yes)}</button></div>`;$('dialog').showModal();$('cancelDialog').onclick=()=>$('dialog').close();$('confirmDialog').onclick=()=>{$('dialog').close();action();};}
function showResult(){modal('Партия завершена',result,'Хорошо',()=>{});$('cancelDialog').hidden=true;}
function newLocal(){if(ws){ws.onclose=null;ws.close();ws=null;}mode='local';connected=false;pending=false;seat=null;offer=null;rematch=null;botThinking=false;try{localStorage.removeItem(window.__UC_CONFIG.seatKey);}catch{}chess=new Chess();clock={w:Number($('minutes').value)*60000,b:Number($('minutes').value)*60000};increment=Number($('increment').value);serverOffset=0;since=Date.now();status='ready';result='';selected=null;last=null;players={w:{name:'Белые'},b:{name:'Чёрные'}};render();}
function newBot(){if(ws){ws.onclose=null;ws.close();ws=null;}mode='bot';connected=false;pending=false;seat=null;offer=null;rematch=null;botThinking=false;try{localStorage.removeItem(window.__UC_CONFIG.seatKey);}catch{}chess=new Chess();clock={w:Number($('minutes').value)*60000,b:Number($('minutes').value)*60000};increment=Number($('increment').value);serverOffset=0;since=Date.now();status='ready';result='';selected=null;last=null;color='w';flipped=false;players={w:{name:$('name').value.trim()||'Игрок'},b:{name:'Ultimate Bot'}};render();if(chess.turn()===botSide)maybeBotMove();}
function gameResultText(side){return chess.isCheckmate()?(side==='w'?'Белые':'Чёрные')+' победили. Мат.':'Ничья';}
const BOT_VALUES={p:100,n:320,b:330,r:500,q:900,k:0};
function evaluateBoard(instance){if(instance.isCheckmate())return instance.turn()==='w'?-99999:99999;if(instance.isStalemate()||instance.isDraw())return 0;let score=0;for(const p of instance.board().flat().filter(Boolean))score+=(p.color==='w'?1:-1)*(BOT_VALUES[p.type]||0);score+=instance.moves().length*(instance.turn()==='w'?1:-1)*2;return score;}
function orderedMoves(instance){return instance.moves({verbose:true}).sort((a,b)=>(Number(!!b.captured)-Number(!!a.captured))||(Number((b.flags||'').includes('p'))-Number((a.flags||'').includes('p')))||(Number(b.san?.includes('+'))-Number(a.san?.includes('+'))));}
function minimax(instance,depth,alpha,beta,maximizing){if(depth===0||instance.isGameOver())return evaluateBoard(instance);const moves=orderedMoves(instance);if(maximizing){let best=-Infinity;for(const move of moves){const next=new Chess(instance.fen());next.move({from:move.from,to:move.to,promotion:move.promotion||'q'});best=Math.max(best,minimax(next,depth-1,alpha,beta,false));alpha=Math.max(alpha,best);if(beta<=alpha)break;}return best;}let best=Infinity;for(const move of moves){const next=new Chess(instance.fen());next.move({from:move.from,to:move.to,promotion:move.promotion||'q'});best=Math.min(best,minimax(next,depth-1,alpha,beta,true));beta=Math.min(beta,best);if(beta<=alpha)break;}return best;}
function chooseBotMove(){const moves=orderedMoves(chess);if(!moves.length)return null;const depth=Math.max(1,Math.min(3,Number($('botLevel')?.value||2)));const maximizing=botSide==='w';let best=maximizing?-Infinity:Infinity,bestMove=moves[0];for(const move of moves){const next=new Chess(chess.fen());next.move({from:move.from,to:move.to,promotion:move.promotion||'q'});const score=minimax(next,depth-1,-Infinity,Infinity,!maximizing);if((maximizing&&score>best)||(!maximizing&&score<best)){best=score;bestMove=move;}}return bestMove;}
function maybeBotMove(){if(mode!=='bot'||status==='finished'||chess.turn()!==botSide||pending)return;pending=true;botThinking=true;render();setTimeout(()=>{if(mode!=='bot'||status==='finished'){pending=false;botThinking=false;render();return;}if(status==='playing'){clock[chess.turn()]=clockValue(chess.turn());if(!clock[chess.turn()]){pending=false;botThinking=false;clocks();return;}}const choice=chooseBotMove();if(!choice){pending=false;botThinking=false;render();return;}const side=chess.turn();try{last=chess.move({from:choice.from,to:choice.to,promotion:choice.promotion||'q'});}catch{pending=false;botThinking=false;render();return;}clock[side]+=increment*1000;since=Date.now();status='playing';pending=false;botThinking=false;const botSound=soundKindForMove(last);playSound(botSound);if(chess.isGameOver()){status='finished';result=gameResultText(side);}render();if(status==='finished')showResult();},420);}
let optimisticMove=null;
function rollbackOnlineMove(){if(!optimisticMove)return;const old=optimisticMove;optimisticMove=null;chess=old.chess;last=old.last;clock=old.clock;since=old.since;status=old.status;selected=null;}
function makeMove(from,to,promotion){if(!allowed())return;const moves=chess.moves({square:from,verbose:true}).filter(m=>m.to===to);if(!moves.length)return;if(moves.some(m=>m.promotion)&&!promotion){pendingPromotion={from,to};$('dialogBody').innerHTML='<div class="dialog-head"><div><h2>Превращение пешки</h2><p>Выбери фигуру, в которую превратится пешка.</p></div></div><div class="promotion">'+['q','r','b','n'].map(t=>`<button data-promote="${t}" aria-label="${{q:'Ферзь',r:'Ладья',b:'Слон',n:'Конь'}[t]}">${pieceSvg({type:t,color:chess.turn()})}<span class="piece-name">${{q:'Ферзь',r:'Ладья',b:'Слон',n:'Конь'}[t]}</span></button>`).join('')+'</div>';$('dialog').showModal();return;}selected=null;if(mode==='online'){
 const baseFen=chess.fen(),preview=new Chess();preview.loadPgn(chess.pgn());let mv;try{mv=preview.move({from,to,promotion:promotion||'q'});}catch{return;}
 optimisticMove={chess,last,clock:{...clock},since,status};const side=chess.turn();clock={...clock,[side]:clockValue(side)+increment*1000};since=Date.now();chess=preview;last=mv;pending=true;playSound(soundKindForMove(mv));render();
 if(!send({type:'move',from,to,promotion:promotion||'q',fen:baseFen})){rollbackOnlineMove();render();}return;}if(status==='playing'){clock[chess.turn()]=clockValue(chess.turn());if(!clock[chess.turn()]){clocks();return;}}const side=chess.turn();try{last=chess.move({from,to,promotion:promotion||'q'});}catch{return;}clock[side]+=increment*1000;since=Date.now();status='playing';const moveSound=soundKindForMove(last);playSound(moveSound);if(chess.isGameOver()){status='finished';result=gameResultText(side);}render();if(status==='finished')showResult();else if(mode==='bot')maybeBotMove();}
$('dialogBody').onclick=e=>{const b=e.target.closest('[data-promote]');if(b&&pendingPromotion){const {from,to}=pendingPromotion;pendingPromotion=null;$('dialog').close();makeMove(from,to,b.dataset.promote);}};
function squareClick(sq){if(!allowed())return;if(selected&&selected!==sq&&chess.moves({square:selected,verbose:true}).some(m=>m.to===sq)){makeMove(selected,sq);return;}const p=chess.get(sq);selected=p&&p.color===chess.turn()?(selected===sq?null:sq):null;drawBoard();}
let drag=null,suppressClick=false;$('board').addEventListener('pointerdown',e=>{const sq=e.target.closest('[data-square]')?.dataset.square,p=sq&&chess.get(sq);if(!allowed()||!p||p.color!==chess.turn())return;drag={sq,x:e.clientX,y:e.clientY,moved:false,node:previousNodes.get(sq)};});window.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;if(!drag.moved)return;e.preventDefault();const rect=$('pieces').getBoundingClientRect();drag.node.style.transition='none';drag.node.style.zIndex=3;drag.node.classList.add('dragging');drag.node.dataset.dragged=1;drag.node.style.transform=`translate(${e.clientX-rect.left-rect.width/16}px,${e.clientY-rect.top-rect.height/16}px)`;},{passive:false});window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;d.node.style.transition='';d.node.style.zIndex='';d.node.classList.remove('dragging');if(d.moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);const sq=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-square]')?.dataset.square;if(sq)makeMove(d.sq,sq);drawBoard.key=null;drawBoard();}delete d.node.dataset.dragged;});window.addEventListener('pointercancel',()=>{if(drag){drag.node.style.transition='';drag.node.style.zIndex='';drag.node.classList.remove('dragging');delete drag.node.dataset.dragged;drag=null;drawBoard.key=null;drawBoard();}});$('board').onclick=e=>{if(suppressClick)return;const sq=e.target.closest('[data-square]')?.dataset.square;if(sq)squareClick(sq);};
function send(m){if(!ws||!connected){pending=false;uiConnectAction='';notify('Нет связи с Firebase. Дождись подключения.');render();return false;}ws.send(m);return true;}
let retries=0,authToken='',expectedOrigin='';
window.addEventListener('message',e=>{if(e.source!==window.parent||!e.data||e.data.type!=='ultimate-chess-auth')return;const origins=new URLSearchParams(location.search).get('parent');if(!origins||e.origin!==origins)return;authToken=String(e.data.idToken||'');expectedOrigin=e.origin;if(e.data.name)$('name').value=String(e.data.name).slice(0,32);});
/* Firestore compat adapter. No external server; all timestamps are committed by Firestore. */
function createFirebaseChessTransport({db,auth,stamp,Chess,onState,onConnection,onError,onSeat,hostObject=Object,hostArray=Array}) {
  function native(v){if(Array.isArray(v)){const a=new hostArray();for(const x of v)a.push(native(x));return a;}if(v&&Object.getPrototypeOf(v)===Object.prototype){const o=new hostObject();for(const [k,x] of Object.entries(v))o[k]=native(x);return o;}return v;}
  let stop=null,roomId=null,disposed=false,busy=false,lastData=null,uid=null;
  const INITIAL=new Chess().fen();
  const millis=x=>Math.floor(x?.toMillis?.()??(x instanceof Date?x.getTime():0));
  const bank=d=>{const debt=d.debtSide?Math.max(0,millis(d.turnAt)-millis(d.debtSince)):0;return {w:d.wMs-(d.debtSide==='w'?debt:0),b:d.bMs-(d.debtSide==='b'?debt:0)};};
  const user=()=>{const u=auth?.currentUser;if(!u)throw Error('Войди в аккаунт платформы, чтобы играть онлайн.');if(uid&&u.uid!==uid)throw Error('Аккаунт изменился. Открой раздел заново.');return u;};
  const playerSide=d=>d.wUid===uid?'w':d.bUid===uid?'b':null;
  const engine=d=>{const g=new Chess();if(!Array.isArray(d.moves)||d.moves.length>1200)throw Error('Повреждена история комнаты.');for(const san of d.moves)g.move(san);if(g.fen()!==d.fen||g.turn()!==d.turn)throw Error('Позиция комнаты не прошла проверку.');return g;};
  function resultText(d){const winner=d.resultBy==='w'?'Белые':'Чёрные';return ({mate:winner+' победили. Мат.',draw:'Ничья',agreement:'Ничья по соглашению',resign:winner+' победили: соперник сдался',timeout:winner+' выиграли по времени',cancelled:'Комната закрыта'})[d.result]||'';}
  function state(d){const g=engine(d),clocks=bank(d);const end=millis(d.endedAt);if(d.status==='finished'&&end)clocks[d.turn]=Math.max(0,clocks[d.turn]-(end-millis(d.turnAt)));return {game:g,id:roomId,fen:d.fen,pgn:"",moves:d.moves,last:g.history({verbose:true}).at(-1)||null,players:{w:{name:d.wName},b:d.bUid?{name:d.bName}:null},clocks:{w:Math.max(0,clocks.w),b:Math.max(0,clocks.b)},since:millis(d.turnAt)||Date.now(),serverNow:Date.now(),status:d.status==='cancelled'?'finished':d.status,result:resultText(d),offer:d.offer||null,rematch:d.rematch||null,round:d.round,revision:d.revision,increment:d.incrementMs/1000};}
  function report(e){if(disposed)return;const msg=({ 'permission-denied':'Нет доступа к шахматной комнате. Проверь Firestore Rules и разрешение chess.',unavailable:'Нет связи с Firebase. Дождись подключения.', 'failed-precondition':'Firebase отклонил запись. Проверь настройки и правила комнаты.', 'resource-exhausted':'Лимит Firebase исчерпан. Попробуй позже.'})[e.code]||e.message||'Не удалось выполнить действие';onError(new Error(msg));}
  function watch(id){if(disposed)return;stop?.();roomId=id;stop=db.collection('chessRooms').doc(id).onSnapshot({includeMetadataChanges:true},snap=>{if(disposed)return;const cached=!!snap.metadata.fromCache;onConnection(!cached&&navigator.onLine!==false);if(snap.metadata.hasPendingWrites)return;if(!snap.exists){report(Error('Комната не найдена.'));return;}try{const d=snap.data(),side=playerSide(d);if(!side)throw Error('Комната уже занята другими игроками.');if(!d.createdAt||d.status==='playing'&&!d.turnAt)return;if(lastData&&lastData.revision===d.revision&&lastData.round===d.round)return;lastData=d;onSeat({room:id},side);onState(state(d),side,cached);}catch(e){onConnection(false);report(e);}},e=>{onConnection(false);report(e);});}
  async function open(first){if(!db?.runTransaction||!db?.collection||!stamp)throw Error('Не найден Firebase платформы: нужны window.db, window.auth и Firebase compat.');uid=user().uid;const name=String(first.name||user().displayName||'Игрок').trim().slice(0,32)||'Игрок';
    if(first.type==='create'){const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);const id=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join(''),ref=db.collection('chessRooms').doc(id);const initialMs=([3,5,10,15].includes(first.minutes)?first.minutes:10)*60000,incrementMs=([0,2,5].includes(first.increment)?first.increment:0)*1000;await db.runTransaction(async tx=>{const exists=await tx.get(ref);if(exists.exists)throw Error('Код комнаты занят. Создай комнату ещё раз.');tx.set(ref,native({version:1,wUid:uid,wName:name,bUid:'',bName:'',initialMs,incrementMs,wMs:initialMs,bMs:initialMs,turn:'w',turnAt:null,debtSide:'',debtSince:null,status:'waiting',fen:INITIAL,moves:[],ply:0,round:0,revision:0,offer:'',rematch:'',result:'',resultBy:'',createdAt:stamp(),updatedAt:stamp(),endedAt:null}));});watch(id);return;}
    const id=String(first.room||'').toLowerCase();if(!/^[a-f0-9]{12}$/.test(id))throw Error('Неверный код комнаты.');const ref=db.collection('chessRooms').doc(id);
    if(first.type==='join'){await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)throw Error('Комната не найдена.');const d=snap.data();if(playerSide(d))return;if(d.status!=='waiting'||d.bUid)throw Error('Комната уже занята или закрыта.');tx.update(ref,native({bUid:uid,bName:name,status:'playing',turnAt:stamp(),revision:d.revision+1,updatedAt:stamp()}));});}else{const snap=await ref.get({source:'server'});if(!snap.exists)throw Error('Комната не найдена.');if(!playerSide(snap.data()))throw Error('Эта партия принадлежит другому аккаунту.');}watch(id);
  }
  async function action(m){if(disposed)return;if(busy)throw Error('Дождись завершения предыдущего действия.');if(!roomId)throw Error('Сначала войди в комнату.');user();if(navigator.onLine===false)throw Error('Нет подключения к интернету.');if(m.type==='sync'){await db.collection('chessRooms').doc(roomId).get({source:'server'});return;}
    busy=true;try{await db.runTransaction(async tx=>{const ref=db.collection('chessRooms').doc(roomId),snap=await tx.get(ref);if(!snap.exists)throw Error('Комната удалена.');const d=snap.data(),side=playerSide(d);if(!side)throw Error('Ты не участник этой партии.');const g=engine(d),base={revision:d.revision+1,updatedAt:stamp()};let patch;
      if(m.type==='move'){if(d.status!=='playing'||d.turn!==side)throw Error('Сейчас не твой ход.');if(m.fen!==d.fen)throw Error('Позиция обновилась. Повтори ход.');if(d.moves.length>=1200)throw Error('Достигнут предел истории партии.');let move;try{move=g.move({from:m.from,to:m.to,promotion:m.promotion||'q'});}catch{throw Error('Недопустимый ход.');}const balances=bank(d);patch={...base,fen:g.fen(),moves:[...d.moves,move.san],ply:d.ply+1,turn:g.turn(),wMs:balances.w+(side==='w'?d.incrementMs:0),bMs:balances.b+(side==='b'?d.incrementMs:0),debtSide:side,debtSince:d.turnAt,turnAt:stamp(),offer:''};if(g.isGameOver())Object.assign(patch,{status:'finished',result:g.isCheckmate()?'mate':'draw',resultBy:g.isCheckmate()?side:'',endedAt:stamp()});}
      else if(m.type==='resign'){if(d.status!=='playing')throw Error('Партия уже завершена.');patch={...base,status:'finished',result:'resign',resultBy:side==='w'?'b':'w',endedAt:stamp(),offer:''};}
      else if(m.type==='timeout'){if(d.status!=='playing')return;const balances=bank(d);if(Date.now()-millis(d.turnAt)<balances[d.turn])return;patch={...base,status:'finished',result:g.isInsufficientMaterial()?'draw':'timeout',resultBy:g.isInsufficientMaterial()?'':d.turn==='w'?'b':'w',endedAt:stamp(),offer:''};}
      else if(m.type==='draw'){if(d.status!=='playing')throw Error('Партия уже завершена.');patch=d.offer&&d.offer!==side?{...base,status:'finished',result:'agreement',resultBy:'',endedAt:stamp(),offer:''}:{...base,offer:side};}
      else if(m.type==='decline'){patch={...base,offer:''};}
      else if(m.type==='cancel'){if(d.status!=='waiting'||side!=='w')throw Error('Комната уже началась.');patch={...base,status:'cancelled',result:'cancelled',resultBy:'',endedAt:stamp()};}
      else if(m.type==='rematch'){if(d.status!=='finished')throw Error('Сначала заверши партию.');patch=d.rematch&&d.rematch!==side?{...base,fen:INITIAL,moves:[],ply:0,turn:'w',wMs:d.initialMs,bMs:d.initialMs,debtSide:'',debtSince:null,turnAt:stamp(),status:'playing',result:'',resultBy:'',endedAt:null,offer:'',rematch:'',round:d.round+1}:{...base,rematch:side};}
      else throw Error('Неизвестное действие.');if(patch)tx.update(ref,native(patch));
    });}finally{busy=false;}
  }
  const handleOnline=()=>{if(!disposed&&roomId)db.collection('chessRooms').doc(roomId).get({source:'server'}).catch(report);};
  const handleOffline=()=>onConnection(false);
  window.addEventListener('online',handleOnline);window.addEventListener('offline',handleOffline);
  return {readyState:1,open,send(raw){let m;try{m=typeof raw==='string'?JSON.parse(raw):raw;}catch{return;}return action(m).catch(report);},
    close(){disposed=true;this.readyState=3;stop?.();stop=null;window.removeEventListener('online',handleOnline);window.removeEventListener('offline',handleOffline);},get data(){return lastData;}};
}

function endpoint(){return 'firebase';}
let uiConnectAction='';
async function connect(first){
  uiConnectAction=first.type;
  const previousMode=mode;
  if(ws){ws.onclose=null;ws.close();ws=null;}
  let fb,db,auth;
  try{fb=parent.firebase;db=parent.db;auth=parent.auth;}catch{}
  if(!db||!auth?.currentUser||!fb?.firestore?.FieldValue?.serverTimestamp){pending=false;uiConnectAction='';notify('Для онлайна нужны вход в аккаунт и подключённый Firebase платформы.');render();return;}
  mode='online';pending=true;connected=false;render();let received=false;
  const transport=createFirebaseChessTransport({db,auth,stamp:()=>fb.firestore.FieldValue.serverTimestamp(),Chess,hostObject:parent.Object,hostArray:parent.Array,
    onConnection(ok){if(ws!==transport||connected===ok)return;connected=ok;render();},
    onSeat(value,side){if(ws!==transport)return;const firstSeat=!received||seat?.room!==value.room;seat=value;color=side;if(firstSeat)flipped=color==='b';try{localStorage.setItem(window.__UC_CONFIG.seatKey,JSON.stringify(seat));}catch{}},
    onError(e){if(ws!==transport)return;rollbackOnlineMove();pending=false;uiConnectAction='';notify(e.message);render();},
    onState(s,side,cached){if(ws!==transport)return;received=true;const oldFen=chess.fen(),was=status,previousRound=window.__ucRound;
      optimisticMove=null;pending=false;uiConnectAction='';color=side;serverOffset=0;chess=s.game;last=s.last;clock=s.clocks;since=s.since;status=s.status;result=s.result;players=s.players;offer=s.offer;rematch=s.rematch;increment=s.increment;
      window.__ucRound=s.round;
      if(chess.fen()!==oldFen){selected=null;if(A?.open)closeA();if(last)playSound(soundKindForMove(last));}
      if(previousRound!=null&&previousRound!==s.round&&$('dialog').open)$('dialog').close();
      render();if(status==='finished'&&was!=='finished')showResult();
    }
  });ws=transport;
  try{await transport.open({...first,name:$('name').value});}catch(e){if(ws!==transport)return;transport.close();ws=null;pending=false;uiConnectAction='';connected=false;mode=previousMode==='online'?'local':previousMode;if(first.type==='resume'){seat=null;try{localStorage.removeItem(window.__UC_CONFIG.seatKey);}catch{}}notify(e.code==='permission-denied'?'Firebase не разрешил доступ. Добавь правила шахмат и разрешение chess для аккаунта.':e.message||'Не удалось открыть комнату');render();}
}

$('create').onclick=()=>{const start=()=>{seat=null;connect({type:'create',minutes:Number($('minutes').value),increment:Number($('increment').value)});};if(mode==='local'&&status==='playing')modal('Начать онлайн-партию?','Текущая локальная партия будет закрыта.','Начать',start);else start();};
$('joinForm').onsubmit=e=>{e.preventDefault();const room=$('room').value.trim().toLowerCase();if(!/^[a-f0-9]{12}$/.test(room)){notify('Введи код комнаты из 12 символов.');return;}const start=()=>{seat=null;connect({type:'join',room});};if(mode==='local'&&status==='playing')modal('Войти в комнату?','Локальная партия будет закрыта.','Войти',start);else start();};
$('local').onclick=()=>{if(status==='playing')modal('Новая партия?','Текущая локальная партия будет закрыта.','Начать',newLocal);else newLocal();};$('botGame').onclick=()=>{const start=()=>newBot();if(status==='playing')modal('Начать партию с ботом?','Текущая партия будет закрыта.','Начать',start);else start();};$('flip').onclick=()=>{flipped=!flipped;render();};$('sound').onclick=()=>{sound=!sound;try{localStorage.setItem('uc.sound',sound?'on':'off');}catch{}if(sound)playSound('move');render();};$('name').onchange=()=>{try{localStorage.setItem('uc.name',$('name').value);}catch{}if(mode==='bot'){players.w.name=$('name').value||'Игрок';render();}};$('botLevel').onchange=()=>{if(mode==='bot')render();};
$('copy').onclick=async()=>{if(!seat)return;const url=new URL(window.__UC_CONFIG.pageURL);url.searchParams.set('chessRoom',seat.room);try{await navigator.clipboard.writeText(url.href);notify('Приглашение скопировано');}catch{notify('Код комнаты: '+seat.room);}};
$('resign').onclick=()=>modal('Сдаться?','Победа будет засчитана сопернику.','Сдаться',()=>{if(mode==='online')send({type:'resign'});else{status='finished';result=(chess.turn()==='w'?'Чёрные':'Белые')+' победили: соперник сдался';render();showResult();}});
$('draw').onclick=()=>{if(mode==='online')send({type:'draw'});else if(mode==='bot')notify('С ботом ничья по соглашению недоступна.');else modal('Ничья по соглашению?','Оба игрока должны согласиться завершить партию.','Согласны',()=>{status='finished';result='Ничья по соглашению';render();showResult();});};$('rematch').onclick=()=>mode==='online'?send({type:'rematch'}):(mode==='bot'?newBot():newLocal());$('pgn').onclick=()=>{if(!chess.history().length){notify('Сначала сделай ход.');return;}const url=URL.createObjectURL(new Blob([chess.pgn()],{type:'application/x-chess-pgn'})),a=document.createElement('a');a.href=url;a.download='ultimate-chess.pgn';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('playPane').hidden=b.dataset.tab!=='play';$('historyPane').hidden=b.dataset.tab!=='history';$('analysisPane').hidden=b.dataset.tab!=='analysis';b.dataset.tab==='analysis'?openA():closeA();};
const GL={w:{q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}},VAL={p:1,n:3,b:3,r:5,q:9},START={p:8,n:2,b:2,r:2,q:1};
document.querySelectorAll('.player-label').forEach(l=>{const s=document.createElement('span');s.className='cap';l.append(s);});
const __render=render;render=function(){__render();const cnt={w:{},b:{}};for(const p of chess.board().flat().filter(Boolean))cnt[p.color][p.type]=(cnt[p.color][p.type]||0)+1;const lost=c=>Object.keys(START).map(t=>[t,Math.max(0,START[t]-(cnt[c][t]||0))]),score=c=>lost(c).reduce((s,[t,n])=>s+VAL[t]*n,0),glyphs=c=>lost(c).map(([t,n])=>GL[c][t].repeat(n)).join('');const top=flipped?'w':'b',bot=flipped?'b':'w',caps=document.querySelectorAll('.cap'),fill=(el,side)=>{const foe=side==='w'?'b':'w',adv=score(foe)-score(side);el.innerHTML=glyphs(foe)+(adv>0?'<b>+'+adv+'</b>':'');};fill(caps[0],top);fill(caps[1],bot);$('moves').scrollTop=1e9;};
const __sr=showResult;showResult=function(){const mate=chess.isCheckmate();setTimeout(()=>{if(sound&&audio)[523,659,784,1047].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.13;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.12,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.75);});__sr();},mate?1700:400);};
render();
setInterval(clocks,150);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='online'&&connected)send({type:'sync'});});render();const room=window.__UC_CONFIG.room;if(room){$('room').value=room;notify('Введи имя и нажми стрелку, чтобы войти в комнату.');}try{const stored=JSON.parse(localStorage.getItem(window.__UC_CONFIG.seatKey));if(stored&&(!room||room===stored.room)){seat=stored;setTimeout(()=>connect({type:'resume',...seat}),0);}}catch{}

/* ===== GAME ANALYSIS ===== */
const MATE=30000,PV={p:100,n:320,b:330,r:500,q:900,k:0},PST={p:[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],n:[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],b:[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],r:[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],q:[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],k:[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]};
const CLS={best:['Лучший ход','★','#34d399'],exc:['Отличный ход','!','#6ee7b7'],good:['Хороший ход','✓','#94a3b8'],inac:['Неточность','?!','#fbbf24'],mist:['Ошибка','?','#fb923c'],blun:['Грубая ошибка','??','#f43f5e']};
const wpc=cp=>50+50*(2/(1+Math.exp(-0.00368208*Math.max(-1500,Math.min(1500,cp))))-1);
function ev(ch){let s=0;const bd=ch._board;for(let i=0;i<120;i++){if(i&136)continue;const p=bd[i];if(!p)continue;const v=PV[p.type]+PST[p.type][p.color==='w'?(i>>4)*8+(i&7):(7-(i>>4))*8+(i&7)];s+=p.color==='w'?v:-v;}return ch.turn()==='w'?s:-s;}
function ord(ms){return ms.map(m=>[m,(m.captured?1000+10*PV[m.captured]-PV[m.piece]:0)+(m.promotion?800:0)]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);}
function nm(ch,d,a,b,ply,cx){if(cx.n++>cx.max){cx.ab=1;return 0;}const ms=ch._moves();if(!ms.length)return ch.isCheck()?-MATE+ply:0;let list=ms,best=-Infinity;if(d<=0){const st=ev(ch);if(st>=b||d<-4)return st;if(st>a)a=st;best=st;list=ms.filter(m=>m.captured||m.promotion);if(!list.length)return st;}for(const m of ord(list)){ch._makeMove(m);const s=-nm(ch,d-1,-b,-a,ply+1,cx);ch._undoMove();if(cx.ab)return 0;if(s>best)best=s;if(s>a)a=s;if(a>=b)break;}return best;}
function think(ch){const ms=ch._moves();if(!ms.length)return{s:ch.isCheck()?(ch.turn()==='w'?-MATE:MATE):0,m:null};if(ch.isDraw())return{s:0,m:null};let res=null;for(let d=1;d<=3;d++){const cx={n:0,max:[0,1500,6000,16000][d],ab:0},o=ord(ms);if(res){o.splice(o.indexOf(res.m),1);o.unshift(res.m);}let best=-Infinity,bm=null,a=-MATE*2;for(const m of o){ch._makeMove(m);const s=-nm(ch,d-1,-MATE*2,-a,1,cx);ch._undoMove();if(cx.ab)break;if(s>best){best=s;bm=m;}if(s>a)a=s;}if(cx.ab||!bm)break;res={s:best,m:bm};}if(!res)res={s:ev(ch),m:ord(ms)[0]};const m=res.m;return{s:ch.turn()==='w'?res.s:-res.s,m:{from:algebraic(m.from),to:algebraic(m.to),san:ch._moveToSan(m,ms)}};}
const o0=0;
const sc=s=>Math.abs(s)>MATE-200?(s>0?'M':'-M')+Math.ceil((MATE-Math.abs(s))/2):(s>0?'+':'')+(s/100).toFixed(1);
async function runAnalysisMain(tok){const h=A.moves,g=new Chess(),out=[],bar=$('anProg');bar.classList.remove('done');for(let k=0;k<=h.length;k++){if(A.token!==tok)return;out.push(think(g));bar.firstElementChild.style.width=((k+1)/(h.length+1)*100)+'%';if(k<h.length)g.move({from:h[k].from,to:h[k].to,promotion:h[k].promotion});await new Promise(r=>setTimeout(r,0));}
 finishAn(out);}
function finishAn(out){const h=A.moves,bar=$('anProg'); A.ev=out;A.cl=[];A.acc={w:[],b:[]};A.cnt={w:{},b:{}};for(let k=1;k<=h.length;k++){const w=k%2?'w':'b',f=s=>w==='w'?wpc(s):100-wpc(s),drop=Math.max(0,f(out[k-1].s)-f(out[k].s)),best=out[k-1].m&&out[k-1].m.san===h[k-1].san,c=best||drop<1?'best':drop<=3?'exc':drop<=7?'good':drop<=13?'inac':drop<=27?'mist':'blun';A.cl[k]=c;A.acc[w].push(Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*drop)-3.1669)));A.cnt[w][c]=(A.cnt[w][c]||0)+1;}
 bar.classList.add('done');drawAn();}

function runAnalysis(tok){A.ws?.forEach(w=>w.terminate());A.ws=[];let fb=0;const fallback=()=>{if(fb++)return;A.ws.forEach(w=>w.terminate());runAnalysisMain(tok);};try{
 const src=ENGINE_SOURCE,i=0,j=src.length;
 const code=src.slice(i,j)+`\nconst MATE=${MATE},PV=${JSON.stringify(PV)},PST=${JSON.stringify(PST)};\n${ev}\n${ord}\n${nm}\n${think}\nonmessage=e=>{for(const k of e.data.ks){const g=new Chess();for(let q=0;q<k;q++)g.move(e.data.moves[q]);postMessage({k,r:think(g)});}postMessage({done:1});};`;
 const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'})),n=A.moves.length+1,N=Math.max(1,Math.min(4,(navigator.hardwareConcurrency||4)-1,n)),out=new Array(n),bar=$('anProg'),mv=A.moves.map(m=>({from:m.from,to:m.to,promotion:m.promotion}));let got=0,fin=0;bar.classList.remove('done');
 for(let w=0;w<N;w++){const ks=[];for(let k=w;k<n;k+=N)ks.push(k);const W=new Worker(url);A.ws.push(W);W.onerror=fallback;W.onmessage=e=>{if(A.token!==tok)return;const d=e.data;if(d.done){if(++fin===N){URL.revokeObjectURL(url);A.ws.forEach(x=>x.terminate());finishAn(out);}}else{out[d.k]=d.r;bar.firstElementChild.style.width=(++got/n*100)+'%';}};W.postMessage({ks,moves:mv});}
 }catch(e){fallback();}}
function go(p){p=Math.max(0,Math.min(A.moves.length,p));const o=A.ply;A.ply=p;A.v=new Chess();for(let i=0;i<p;i++){const m=A.moves[i];A.v.move({from:m.from,to:m.to,promotion:m.promotion});}const m=p?A.moves[p-1]:null;A.lv=p===o-1?{from:A.moves[o-1].to,to:A.moves[o-1].from,flags:A.moves[o-1].flags}:m;selected=null;if(p===o+1)try{playSound(soundKindForMove(m));}catch{}drawBoard();updAn();}
function openA(){A.open=true;A.token++;A.moves=chess.history({verbose:true});A.ev=null;A.ply=A.moves.length;A.v=chess;A.lv=last;A.v=new Chess();for(const m of A.moves)A.v.move({from:m.from,to:m.to,promotion:m.promotion});A.lv=last;selected=null;A.ply=A.moves.length;$('anList').innerHTML='';$('anSum').innerHTML='';$('anGraph').innerHTML='';$('anProg').classList.toggle('done',!A.moves.length);$('anProg').firstElementChild.style.width='0';drawBoard();updAn();if(A.moves.length)runAnalysis(A.token);else $('anCard').innerHTML='<div class="t">Партия ещё не началась</div><p>Сделай несколько ходов — и здесь появится разбор каждого хода.</p>';}
function closeA(){if(!A.open)return;A.open=false;A.token++;clearInterval(A.t);A.ws?.forEach(w=>w.terminate());A.t=0;$('anPlay')?.classList.remove('on');document.querySelector('.an-arrow')?.remove();const sl=last;last=null;A.lv=null;drawBoard();last=sl;drawBoard();}
function drawAn(){const h=A.moves,n=h.length,e=A.ev;const pts=e.map((x,i)=>[i/Math.max(1,n)*300,70-wpc(x.s)*.7]);const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');$('anGraph').innerHTML=`<defs><linearGradient id="anG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc" stop-opacity=".35"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/></linearGradient></defs><line x1="0" x2="300" y1="35" y2="35" stroke="rgba(255,255,255,.14)" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/><path class="ar" d="${d}L300 70L0 70Z"/><path class="ln" pathLength="1" d="${d}"/><line class="cur" id="anCur" x1="0" x2="0" y1="0" y2="70"/>`;
 const sm=w=>{const a=A.acc[w],v=a.length?a.reduce((x,y)=>x+y,0)/a.length:0,c=A.cnt[w];return`<div><small>${w==='w'?'Белые':'Чёрные'}</small><strong data-n="${v.toFixed(1)}">0</strong>${['best','exc','good','inac','mist','blun'].map(k=>`<span class="ux-stat-row"><i style="background:${CLS[k][2]}"></i><span>${({best:'Лучшие',exc:'Отличные',good:'Хорошие',inac:'Неточности',mist:'Ошибки',blun:'Грубые ошибки'})[k]}</span><b>${c[k]||0}</b></span>`).join('')}</div>`;};$('anSum').innerHTML=sm('w')+sm('b');
 document.querySelectorAll('#anSum strong').forEach(el=>{const t=+el.dataset.n,t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/900);el.textContent=(t*(1-Math.pow(1-k,3))).toFixed(1)+'%';if(k<1)requestAnimationFrame(f);})(t0);});
 let rows='';for(let i=0;i<n;i+=2){const cell=k=>k<=n?`<button data-ply="${k}"><i style="background:${CLS[A.cl[k]][2]}"></i>${esc(h[k-1].san)}</button>`:'<span></span>';rows+=`<div class="an-row" style="animation-delay:${Math.min(i*12,500)}ms"><span>${i/2+1}.</span>${cell(i+1)}${cell(i+2)}</div>`;}$('anList').innerHTML=rows;updAn();}
function updAn(){const p=A.ply,n=A.moves.length,e=A.ev;document.querySelectorAll('.an-nav button').forEach(b=>{const k=b.dataset.nav;b.disabled=!n||(k==='s'||k==='-')&&p===0||(k==='e'||k==='+')&&p===n;});document.querySelectorAll('.an-row button').forEach(b=>{const on=+b.dataset.ply===p;b.classList.toggle('cur',on);if(on&&$('anList').scrollHeight>$('anList').clientHeight)b.scrollIntoView({block:'nearest',behavior:'smooth'});});document.querySelector('.an-arrow')?.remove();if(!e)return;const x=e[p],wp=wpc(x.s);$('anFill').style.width=wp+'%';$('anScore').textContent=sc(x.s);const cur=$('anCur');if(cur)cur.style.transform=`translateX(${p/Math.max(1,n)*300}px)`;
 const c=p?A.cl[p]:null,prev=p?e[p-1].m:null,card=$('anCard');let h='';if(c){const k=CLS[c];h=`<div class="t"><span class="g" style="background:${k[2]}">${k[1]}</span><span>${Math.ceil(p/2)}${p%2?'.':'…'} ${esc(A.moves[p-1].san)} — <span style="color:${k[2]}">${k[0]}</span></span></div><p>${c==='best'||c==='exc'?'Сильное решение, оценка позиции почти не изменилась.':'Лучше было '+(prev?'<b>'+esc(prev.san)+'</b>':'другое продолжение')+'.'}${x.m?' Идея в этой позиции: <b>'+esc(x.m.san)+'</b>.':''}</p>`;card.style.borderColor=k[2]+'88';}else{h='<div class="t">Начальная позиция</div><p>'+(x.m?'Сильнейшее продолжение: <b>'+esc(x.m.san)+'</b>.':'')+'</p>';card.style.borderColor='';}card.innerHTML=h;card.classList.remove('pop');void card.offsetWidth;card.classList.add('pop');
 const sq=s=>{const i=indexOf(s);return[i%8+.5,Math.floor(i/8)+.5];};let svg='';if(x.m){const[a,b]=[sq(x.m.from),sq(x.m.to)],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,t=[b[0]-ux*.36,b[1]-uy*.36];svg+=`<path class="sh" pathLength="1" d="M${a[0]} ${a[1]}L${t[0]} ${t[1]}"/><path class="hd" d="M${b[0]-ux*.05} ${b[1]-uy*.05}L${t[0]-uy*.2} ${t[1]+ux*.2}L${t[0]+uy*.2} ${t[1]-ux*.2}Z"/>`;}
 if(c&&p){const q=sq(A.moves[p-1].to),k=CLS[c];svg+=`<g class="bd"><circle cx="${q[0]+.32}" cy="${q[1]-.32}" r=".21" fill="${k[2]}" stroke="#0b1227" stroke-width=".03"/><text x="${q[0]+.32}" y="${q[1]-.32+.07}" text-anchor="middle" font-size=".2" font-weight="800" fill="#06101f">${k[1]}</text></g>`;}
 const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','an-arrow');s.setAttribute('viewBox','0 0 8 8');s.setAttribute('preserveAspectRatio','none');s.innerHTML=svg;document.querySelector('.board-stage').append(s);}
$('analysisPane').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.ply)return go(+b.dataset.ply);const k=b?.dataset.nav;if(!k)return;if(k==='p'){if(A.t){clearInterval(A.t);A.t=0;b.classList.remove('on');}else{if(A.ply>=A.moves.length)go(0);b.classList.add('on');A.t=setInterval(()=>{if(A.ply>=A.moves.length){clearInterval(A.t);A.t=0;b.classList.remove('on');}else go(A.ply+1);},950);}return;}go(k==='s'?0:k==='e'?A.moves.length:A.ply+(k==='+'?1:-1));});
$('anGraph').addEventListener('click',e=>{if(!A.ev)return;const r=e.currentTarget.getBoundingClientRect();go(Math.round((e.clientX-r.left)/r.width*A.moves.length));});
window.addEventListener('keydown',e=>{if(!A.open||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const m={ArrowLeft:A.ply-1,ArrowRight:A.ply+1,Home:0,End:A.moves.length}[e.key];if(m!=null){e.preventDefault();go(m);}});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button:not(.square):not(.smart-select-trigger):not(.smart-select-option)');if(!b||b.disabled)return;if(getComputedStyle(b).position==='static')b.style.position='relative';b.style.overflow='hidden';const r=b.getBoundingClientRect(),z=Math.max(r.width,r.height)*2,s=document.createElement('span');s.className='rpl';s.style.cssText=`width:${z}px;height:${z}px;left:${e.clientX-r.left-z/2}px;top:${e.clientY-r.top-z/2}px`;b.append(s);setTimeout(()=>s.remove(),620);},true);

(()=>{const orig=render;let n=0;render=function(){const r=orig.apply(this,arguments);try{const rows=document.querySelectorAll('#moves .move-row'),c=chess.history().length;if(c>n&&rows.length){rows[rows.length-1].classList.add('ux-new');const m=$('moves');if(m.scrollHeight>m.clientHeight)m.scrollTo({top:m.scrollHeight,behavior:'smooth'});}n=c;}catch{}return r;};})();

// UI-only animation hooks. Existing piece and board animation code stays unchanged.
const fbRenderOriginal=render;
render=function(){const value=fbRenderOriginal.apply(this,arguments);
  const badge=$('connection');badge.classList.toggle('fb-connected',mode==='online'&&connected);badge.classList.toggle('fb-connecting',mode==='online'&&!connected);
  if(mode==='online')badge.textContent=connected?'Firebase • подключено':'Firebase • восстанавливаем связь';
  for(const id of ['create','join']){const busy=mode==='online'&&pending&&uiConnectAction===id;$(id).classList.toggle('fb-busy',busy);$(id).setAttribute('aria-busy',String(busy));}
  $('invite').classList.toggle('fb-room-ready',mode==='online'&&status==='waiting');
  if(mode==='online'&&ws?.data?.status==='cancelled'){$('rematch').hidden=true;$('invite').hidden=true;try{localStorage.removeItem(window.__UC_CONFIG.seatKey);}catch{}}
  const cancel=$('fbCancelRoom');if(cancel)cancel.hidden=!(mode==='online'&&status==='waiting'&&color==='w');
  return value;
};
const cancelRoom=document.createElement('button');cancelRoom.id='fbCancelRoom';cancelRoom.className='secondary wide';cancelRoom.hidden=true;cancelRoom.textContent='Закрыть комнату';$('invite').append(cancelRoom);
cancelRoom.onclick=()=>modal('Закрыть комнату?','По этой ссылке больше нельзя будет начать партию.','Закрыть',()=>send({type:'cancel'}));
for(const button of document.querySelectorAll('[data-tab]'))button.addEventListener('click',()=>{const pane=$(button.dataset.tab==='play'?'playPane':button.dataset.tab==='history'?'historyPane':'analysisPane');pane.classList.remove('fb-pane-enter');void pane.offsetWidth;pane.classList.add('fb-pane-enter');});
let fbTimeoutAttempt=0;
setInterval(()=>{if(mode==='online'&&status==='playing'&&connected&&!pending&&clockValue(chess.turn())<=0&&Date.now()-fbTimeoutAttempt>4000){fbTimeoutAttempt=Date.now();send({type:'timeout'});}},500);
render();

window.__ultimateChessBridge={
 sync(config){
   document.body.classList.toggle('light',config.theme==='light');
   window.auth=config.auth||null;
   if(mode!=='online'&&config.name&&$('name').value!==config.name){$('name').value=config.name;if(mode==='bot'){players.w.name=config.name;render();}}
 },
 dispose(){mode='local';seat=null;try{closeA();}catch{}if(ws){ws.onclose=null;ws.close();ws=null;}if(audio)audio.close().catch(()=>{});}
};

// Presentation layer only: keep the game's rules and Firebase transport intact.
const uxGlyph=n=>({clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',history:'<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',analysis:'<path d="M4 19V5m0 14h16M8 14l4-5 4 3 4-7"/>'}[n]||'');
const uxSvg=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${uxGlyph(n)}</svg>`;
const uxEmpty=(type,title,text)=>`<div class="ux-empty"><div class="ux-empty-art"><span class="ux-orbit"></span><span class="ux-empty-icon">${uxSvg(type)}</span><i></i><i></i></div><strong>${title}</strong><p>${text}</p><span class="ux-empty-line"></span></div>`;
for(const [id,n,title,desc]of [['create','globe','Играть онлайн','Создай комнату и пригласи друга'],['botGame','bot','Тренировка с ботом','Отработай идеи в своём темпе'],['local','users','За одной доской','Два игрока на одном устройстве']]){
 $(id).innerHTML=`<span class="ux-mode-icon">${icon(n)}</span><span class="ux-mode-copy"><strong>${title}</strong><small>${desc}</small></span><span class="ux-mode-arrow">${icon('arrow')}</span>`;
}
$('copy').innerHTML=icon('link')+'<span>Скопировать ссылку</span>';
$('fbCancelRoom').innerHTML=icon('flag')+'<span>Закрыть комнату</span>';
const uxRenderBase=render;
render=function(){const v=uxRenderBase.apply(this,arguments),hasMoves=chess.history().length>0;
 if(!hasMoves)$('moves').innerHTML=uxEmpty('history','Здесь начнётся твоя партия','Сделай первый ход — мы запишем его и все следующие.');
 $('historyPane').classList.toggle('ux-no-moves',!hasMoves);
 for(const b of document.querySelectorAll('[data-tab]')){b.setAttribute('role','tab');b.setAttribute('aria-selected',String(b.classList.contains('active')));b.setAttribute('aria-controls',b.dataset.tab==='play'?'playPane':b.dataset.tab==='history'?'historyPane':'analysisPane');}
 return v;
};
const uxOpenBase=openA;
openA=function(){const count=chess.history().length;
 $('analysisPane').classList.toggle('ux-no-moves',!count);
 $('anFill').style.width='50%';$('anScore').textContent='—';$('anCard').style.borderColor='';
 const v=uxOpenBase.apply(this,arguments);
 if(!count)$('anCard').innerHTML=uxEmpty('analysis','У каждой партии есть своя история','Сделай несколько ходов, затем возвращайся за разбором позиции.');
 return v;
};
render();
// Non-interactive ornament: only occupies the header and wide-screen side gutters.
const ornamentPiece=(type,cls)=>`<span class="uc-orn-piece ${cls}"><svg viewBox="0 0 64 64" fill="currentColor" fill-opacity=".075" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${paths[type]}</svg></span>`;
const ornament=document.createElement('div');ornament.className='uc-ornaments';ornament.setAttribute('aria-hidden','true');
const rail=`<svg class="uc-orn-rail" viewBox="0 0 140 700" preserveAspectRatio="none"><path class="uc-rail-base" d="M24 0V100Q24 120 44 120H94Q114 120 114 140V285Q114 305 94 305H44Q24 305 24 325V480Q24 500 44 500H94Q114 500 114 520V700"/><path class="uc-rail-light" d="M24 0V100Q24 120 44 120H94Q114 120 114 140V285Q114 305 94 305H44Q24 305 24 325V480Q24 500 44 500H94Q114 500 114 520V700"/><circle cx="24" cy="72" r="3"/><circle cx="114" cy="250" r="3"/><circle cx="24" cy="430" r="3"/></svg>`;
ornament.innerHTML=`<div class="uc-orn-side uc-orn-left">${rail}${ornamentPiece('n','uc-op-one')}${ornamentPiece('p','uc-op-two')}${ornamentPiece('r','uc-op-three')}<span class="uc-orn-grid"></span></div><div class="uc-orn-side uc-orn-right">${rail}${ornamentPiece('b','uc-op-one')}${ornamentPiece('q','uc-op-two')}${ornamentPiece('p','uc-op-three')}<span class="uc-orn-grid"></span></div>`;
document.body.append(ornament);
const headerArt=document.createElement('div');headerArt.className='uc-header-art';headerArt.setAttribute('aria-hidden','true');headerArt.innerHTML=`<span class="uc-header-trail"></span>${ornamentPiece('p','uc-hp-one')}${ornamentPiece('n','uc-hp-two')}${ornamentPiece('q','uc-hp-three')}<span class="uc-header-diamond"></span>`;document.querySelector('.lms-header').append(headerArt);

 window.__ultimateChessBridge.sync({...config,auth:hostWindow.auth});
 return {sync:window.__ultimateChessBridge.sync,dispose(){disposed=true;window.__ultimateChessBridge.dispose();cleanups.forEach(f=>f());timers.forEach(hostWindow.clearTimeout);intervals.forEach(hostWindow.clearInterval);frames.forEach(hostWindow.cancelAnimationFrame);root.replaceChildren();}};
}
function ChessLMS({theme='dark',user=null,userNickname=''}={}){
 const ref=React.useRef(null),api=React.useRef(null),latest=React.useRef(null),[error,setError]=React.useState('');
 const uid=user?.uid||window.auth?.currentUser?.uid||'guest';
 latest.current={theme,name:userNickname||user?.displayName||user?.email||'Игрок',pageURL:location.href,room:new URLSearchParams(location.search).get('chessRoom'),seatKey:'uc.firebase.room.'+uid,auth:window.auth};
 React.useEffect(()=>{const root=ref.current.shadowRoot||ref.current.attachShadow({mode:'open'});try{api.current=mount(root,latest.current);setError('')}catch(e){console.error('[ChessLMS]',e);setError('Не удалось открыть шахматы. '+e.message)}return()=>{api.current?.dispose();api.current=null}},[uid]);
 React.useEffect(()=>{api.current?.sync(latest.current)},[theme,userNickname,user?.displayName,user?.email]);
 return React.createElement('section',{'aria-label':'Шахматы',style:{width:'100%',minWidth:0}},error&&React.createElement('p',{role:'alert'},error),React.createElement('div',{ref,style:{width:'100%'}}));
}
Object.assign(window,{ChessLMS,ChessModule:ChessLMS});
})();
