/* VS School — редактор кода.
   Все стили, компоненты и логика находятся в одном файле.
   Работает с React и существующим Babel-подключением платформы.
*/

(() => {
  const { useState, useEffect, useRef, useMemo } = React;

  /* ========================= СТИЛИ ========================= */

  const STYLES = `
    .cq-studio {
      --cq-bg: #f8f7fc;
      --cq-panel: #fff;
      --cq-soft: #f0edf8;
      --cq-line: #e7e2f0;
      --cq-text: #29243e;
      --cq-muted: #777086;
      --cq-accent: #7652ce;
      --cq-shadow: 0 16px 48px #3822660b;

      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      max-width: 1280px;
      margin: 0 auto;
      padding: 28px;
      background: var(--cq-bg);
      border: 1px solid var(--cq-line);
      border-radius: 26px;
      color: var(--cq-text);
      font-family: Inter, "Segoe UI", sans-serif;
      line-height: 1.5;
      text-align: left;
      isolation: isolate;
      animation: cq-enter .5s ease both;
      color-scheme: light;
    }

    body.dark .cq-studio {
      --cq-bg: #171622;
      --cq-panel: #201e2e;
      --cq-soft: #2a263d;
      --cq-line: #363148;
      --cq-text: #f0edf8;
      --cq-muted: #b0a7c2;
      --cq-accent: #b49aef;
      --cq-shadow: 0 16px 48px #0002;
      color-scheme: dark;
    }

    .cq-studio * {
      box-sizing: border-box;
    }

    .cq-studio [hidden] {
      display: none !important;
    }

    .cq-studio :where(h1, h2, p) {
      margin: 0;
      color: inherit;
    }

    .cq-studio button,
    .cq-studio input,
    .cq-studio textarea {
      font-family: inherit;
      letter-spacing: normal;
    }

    .cq-studio button {
      height: auto;
      min-height: 0;
      margin: 0;
      text-transform: none;
      cursor: pointer;
      line-height: 1.4;
      transition:
        background .18s,
        color .18s,
        transform .18s,
        box-shadow .18s,
        border-color .18s;
    }

    .cq-studio button:disabled {
      cursor: wait;
      opacity: .6;
    }

    .cq-studio button:not(:disabled):active {
      transform: scale(.97);
    }

    .cq-studio button:focus-visible,
    .cq-studio input:focus-visible {
      outline: 3px solid #9d7ee8;
      outline-offset: 3px;
    }

    .cq-studio svg {
      flex-shrink: 0;
    }

    .cq-studio .cq-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 11px 17px;
      min-height: 42px;
      border-radius: 11px;
      border: 1px solid transparent;
      font-size: 12px;
      font-weight: 650;
      white-space: nowrap;
    }

    .cq-studio .cq-primary {
      background: linear-gradient(120deg, #8964e2, #7047c4);
      color: #fff;
      box-shadow: 0 5px 12px #7652ce26;
    }

    .cq-studio .cq-primary:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px #7652ce40;
    }

    .cq-studio .cq-secondary {
      background: var(--cq-panel);
      border-color: var(--cq-line);
      color: var(--cq-text);
    }

    .cq-studio .cq-secondary:hover,
    .cq-studio .cq-selected {
      background: var(--cq-soft);
      border-color: #a48ac8;
    }

    .cq-studio .cq-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      min-width: 32px;
      min-height: 32px;
      border: 0;
      background: transparent;
      color: var(--cq-muted);
      border-radius: 7px;
    }

    .cq-studio .cq-icon-btn:hover {
      background: var(--cq-soft);
      color: var(--cq-accent);
    }

    .cq-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 23px;
      border-bottom: 1px solid var(--cq-line);
    }

    .cq-brand {
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .cq-brand strong {
      font-size: 21px;
      letter-spacing: -.7px;
      font-weight: 800;
    }

    .cq-brand small {
      display: block;
      font-size: 8px;
      letter-spacing: 2.1px;
      color: var(--cq-muted);
      font-weight: 650;
      margin-top: 1px;
    }

    .cq-brand-dot {
      color: var(--cq-accent);
    }

    .cq-brand-icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, #9974e9, #6a47bd);
      color: #fff;
      box-shadow: 0 5px 15px #7652ce26;
    }

    .cq-save {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 10px;
      color: var(--cq-muted);
      margin-left: auto;
    }

    .cq-status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #47b88e;
      flex-shrink: 0;
    }

    .cq-warning {
      background: #d39a3e;
    }

    .cq-intro {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 32px 0 29px;
      overflow: hidden;
    }

    .cq-eyebrow {
      display: block;
      font-size: 9px;
      letter-spacing: 2px;
      font-weight: 700;
      color: var(--cq-accent);
      margin-bottom: 10px;
    }

    .cq-intro h1 {
      font-family: Manrope, Inter, "Segoe UI", sans-serif;
      font-size: clamp(23px, 2.55vw, 32px);
      font-weight: 800;
      letter-spacing: -1.1px;
      line-height: 1.3;
    }

    .cq-intro h1 span {
      color: var(--cq-accent);
    }

    .cq-intro p {
      font-size: 12px;
      color: var(--cq-muted);
      margin-top: 10px;
    }

    .cq-mobile-break {
      display: none;
    }

    .cq-intro-art {
      position: relative;
      flex-shrink: 0;
      font-family: monospace;
      font-size: 64px;
      color: #ab8bd963;
      margin-right: 28px;
      letter-spacing: -10px;
      transform: rotate(-9deg);
      user-select: none;
    }

    .cq-intro-art i {
      position: absolute;
      right: -30px;
      top: 3px;
      font-size: 25px;
      color: #b99be2;
      animation: cq-spark 5s ease-in-out infinite;
    }

    .cq-project-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
      padding: 17px 19px;
      background: var(--cq-panel);
      border: 1px solid var(--cq-line);
      border-radius: 16px;
      box-shadow: var(--cq-shadow);
    }

    .cq-project-name {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;
    }

    .cq-project-icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      background: var(--cq-soft);
      border-radius: 11px;
      color: var(--cq-accent);
      flex-shrink: 0;
    }

    .cq-project-name > span:last-child {
      min-width: 0;
    }

    .cq-project-name small {
      display: block;
      font-size: 8px;
      font-weight: 650;
      letter-spacing: 1.3px;
      color: var(--cq-muted);
      margin-bottom: 2px;
    }

    .cq-studio .cq-project-name input {
      display: block;
      background: transparent;
      color: var(--cq-text);
      font-size: 13px;
      font-weight: 650;
      line-height: 1.5;
      width: 100%;
      max-width: 300px;
      min-width: 0;
      height: auto;
      border: 1px solid transparent;
      border-radius: 4px;
      margin: 0;
      padding: 2px 0;
      box-shadow: none;
    }

    .cq-studio .cq-project-name input:hover {
      border-bottom-color: var(--cq-line);
    }

    .cq-project-actions {
      display: flex;
      gap: 9px;
    }

    .cq-workspace-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      padding: 22px 0 13px;
    }

    .cq-view-switch {
      display: flex;
      gap: 4px;
      padding: 4px;
      background: var(--cq-soft);
      border: 1px solid var(--cq-line);
      border-radius: 11px;
    }

    .cq-view-switch button {
      padding: 8px 13px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--cq-muted);
      font-size: 11px;
      font-weight: 650;
    }

    .cq-view-switch button[aria-pressed="true"] {
      background: var(--cq-panel);
      color: var(--cq-accent);
      box-shadow: 0 2px 5px #33225512;
    }

    .cq-studio .cq-auto {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 0;
      color: var(--cq-muted);
      font-size: 11px;
      padding: 6px 0;
    }

    .cq-toggle {
      display: block;
      width: 28px;
      height: 16px;
      padding: 3px;
      border-radius: 12px;
      background: var(--cq-line);
      transition: background .22s;
    }

    .cq-toggle i {
      display: block;
      width: 10px;
      height: 10px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px #0003;
      transition: transform .22s;
    }

    .cq-auto[aria-checked="true"] .cq-toggle {
      background: #8a66d3;
    }

    .cq-auto[aria-checked="true"] .cq-toggle i {
      transform: translateX(12px);
    }

    .cq-workspace {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 14px;
      min-height: 480px;
      height: 58vh;
      max-height: 760px;
    }

    .cq-mode-code,
    .cq-mode-preview {
      grid-template-columns: minmax(0, 1fr);
    }

    .cq-code-panel,
    .cq-preview-panel {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      border: 1px solid var(--cq-line);
      border-radius: 14px;
      background: var(--cq-panel);
      box-shadow: var(--cq-shadow);
      overflow: hidden;
      position: relative;
      animation: cq-enter .25s ease both;
    }

    .cq-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      height: 48px;
      min-height: 48px;
      padding: 0 10px;
      border-bottom: 1px solid var(--cq-line);
    }

    .cq-tabs {
      display: flex;
      align-self: stretch;
      min-width: 0;
      gap: 3px;
    }

    .cq-tabs button {
      display: flex;
      align-items: center;
      gap: 6px;
      border: 0;
      border-bottom: 2px solid transparent;
      border-radius: 0;
      background: transparent;
      color: var(--cq-muted);
      padding: 0 9px;
      font-size: 10px;
      white-space: nowrap;
    }

    .cq-tabs button > span {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
    }

    .cq-tabs button[aria-selected="true"] {
      color: var(--cq-text);
      border-bottom-color: var(--cq-accent);
      background: var(--cq-soft);
    }

    .cq-tabs button:hover {
      background: var(--cq-soft);
    }

    .cq-code-area {
      position: relative;
      flex: 1;
      min-height: 0;
      background: #fcfbff;
    }

    body.dark .cq-code-area {
      background: #1b1928;
    }

    .cq-editor-pane {
      position: absolute;
      inset: 0;
      display: flex;
    }

    .cq-gutter {
      width: 43px;
      flex-shrink: 0;
      padding: 19px 9px 100px 0;
      text-align: right;
      overflow: hidden;
      color: #9d93ad;
      user-select: none;
      border-right: 1px solid var(--cq-line);
    }

    .cq-editor-input {
      position: relative;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .cq-gutter,
    .cq-studio .cq-editor-input pre,
    .cq-studio .cq-editor-input textarea {
      font: 13px/23px "Cascadia Code", Consolas, "Liberation Mono", monospace;
      tab-size: 2;
      letter-spacing: 0;
      font-variant-ligatures: none;
    }

    .cq-studio .cq-editor-input pre,
    .cq-studio .cq-editor-input textarea {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 19px 17px 100px;
      white-space: pre;
      overflow: auto;
      border: 0;
      border-radius: 0;
      background: transparent;
      text-align: left;
      resize: none;
    }

    .cq-studio .cq-editor-input pre {
      color: var(--cq-text);
      pointer-events: none;
    }

    .cq-studio .cq-editor-input textarea {
      color: transparent;
      caret-color: var(--cq-text);
      outline: none;
      box-shadow: none;
      -webkit-text-fill-color: transparent;
    }

    .cq-studio .cq-editor-input textarea:focus-visible {
      box-shadow: inset 0 0 0 2px #a98ddd66;
    }

    .cq-editor-input textarea::selection {
      background: #9573df44;
    }

    .cq-editor-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 13px;
      border-top: 1px solid var(--cq-line);
      font-size: 9px;
      color: var(--cq-muted);
      min-height: 32px;
    }

    .cq-editor-footer > span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cq-encoding {
      margin-left: 12px;
    }

    .cq-preview-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 650;
      padding-left: 4px;
    }

    .cq-device-switch {
      display: flex;
      gap: 2px;
      margin-left: auto;
      background: var(--cq-soft);
      border-radius: 7px;
      padding: 2px;
    }

    .cq-device-switch .cq-icon-btn {
      min-width: 27px;
      min-height: 25px;
      padding: 4px;
    }

    .cq-device-switch button[aria-pressed="true"] {
      background: var(--cq-panel);
      color: var(--cq-accent);
      box-shadow: 0 1px 3px #0001;
    }

    .cq-address {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 9px;
      color: var(--cq-muted);
      background: var(--cq-bg);
      padding: 9px 13px;
      border-bottom: 1px solid var(--cq-line);
    }

    .cq-address > span:last-child {
      margin-left: auto;
      font-size: 8px;
    }

    .cq-preview-stage {
      flex: 1;
      min-height: 0;
      display: flex;
      justify-content: center;
      background: var(--cq-soft);
      overflow: hidden;
    }

    .cq-preview-stage iframe {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
      border: 0;
      background: #fff;
      color-scheme: light;
      transition: width .3s ease, box-shadow .3s ease;
    }

    .cq-device-mobile {
      padding: 12px 0;
    }

    .cq-device-mobile iframe {
      width: 375px;
      max-width: 100%;
      border-radius: 12px;
      box-shadow: 0 0 0 1px var(--cq-line), 0 8px 25px #0002;
    }

    .cq-error {
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 12px;
      display: flex;
      align-items: flex-start;
      gap: 9px;
      background: #fff0f2;
      color: #982943;
      border: 1px solid #e9b0bc;
      border-radius: 11px;
      padding: 13px;
      font-size: 11px;
      box-shadow: 0 5px 20px #98294315;
      animation: cq-enter .2s ease;
    }

    .cq-error > div {
      flex: 1;
      min-width: 0;
    }

    .cq-error p {
      margin-top: 5px;
      overflow-wrap: anywhere;
      font-family: monospace;
      max-height: 90px;
      overflow: auto;
    }

    .cq-error .cq-icon-btn {
      color: inherit;
      padding: 0;
      min-width: 20px;
      min-height: 20px;
    }

    .cq-bottom-bar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      color: var(--cq-muted);
      font-size: 9px;
      margin-top: 14px;
    }

    .cq-bottom-bar > span {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .cq-bottom-bar svg {
      color: var(--cq-accent);
    }

    .cq-bottom-bar kbd {
      font-family: inherit;
      font-size: 9px;
      padding: 2px 4px;
      border: 1px solid var(--cq-line);
      border-radius: 4px;
      background: var(--cq-panel);
    }

    .cq-bottom-bar i {
      font-style: normal;
      margin: 0 2px;
    }

    .cq-mentor {
      margin-top: 23px;
      padding: 20px;
      border: 1px solid var(--cq-line);
      border-radius: 16px;
      background: var(--cq-panel);
      animation: cq-enter .3s ease;
    }

    .cq-mentor-heading {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cq-mentor-heading > .cq-icon-btn {
      margin-left: auto;
    }

    .cq-mentor-icon {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      background: var(--cq-soft);
      border-radius: 13px;
      color: var(--cq-accent);
      flex-shrink: 0;
    }

    .cq-mentor h2,
    .cq-dialog h2 {
      font-size: 15px;
      font-weight: 700;
    }

    .cq-mentor-heading p {
      font-size: 11px;
      color: var(--cq-muted);
      margin-top: 4px;
    }

    .cq-mentor-body {
      padding: 18px 0;
      font-size: 13px;
      line-height: 1.8;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .cq-mentor-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .cq-mentor-footer small {
      font-size: 10px;
      color: var(--cq-muted);
    }

    .cq-thinking {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--cq-accent);
    }

    .cq-thinking span {
      width: 5px;
      height: 5px;
      background: currentColor;
      border-radius: 50%;
      animation: cq-dot 1s infinite;
    }

    .cq-thinking span:nth-child(2) {
      animation-delay: .15s;
    }

    .cq-thinking span:nth-child(3) {
      animation-delay: .3s;
      margin-right: 8px;
    }

    .cq-ai-error {
      color: #bb405d;
    }

    .cq-studio .cq-dialog {
      width: min(430px, calc(100vw - 32px));
      padding: 26px;
      border: 1px solid var(--cq-line);
      border-radius: 20px;
      background: var(--cq-panel);
      color: var(--cq-text);
      box-shadow: 0 30px 100px #0004;
    }

    .cq-dialog[open] {
      animation: cq-enter .2s ease;
    }

    .cq-dialog::backdrop {
      background: #19122e88;
      backdrop-filter: blur(4px);
    }

    .cq-dialog h2 {
      margin: 16px 0 9px;
      font-size: 20px;
    }

    .cq-dialog p {
      font-size: 13px;
      color: var(--cq-muted);
      line-height: 1.7;
    }

    .cq-dialog form > div {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 22px;
    }

    .cq-studio .cq-danger {
      background: #a83150;
      color: #fff;
    }

    .cq-toast {
      position: fixed;
      bottom: 26px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 9px;
      max-width: calc(100vw - 32px);
      padding: 13px 20px;
      border: 1px solid var(--cq-line);
      border-radius: 12px;
      box-shadow: 0 8px 32px #0002;
      background: var(--cq-panel);
      color: var(--cq-text);
      font-size: 12px;
    }

    .cq-toast svg {
      color: #38a17a;
    }

    .cq-tok-comment {
      color: #857a96;
      font-style: italic;
    }

    .cq-tok-string,
    .cq-tok-entity {
      color: #9d6a17;
    }

    .cq-tok-tag {
      color: #426bb0;
    }

    .cq-tok-attr,
    .cq-tok-property {
      color: #258167;
    }

    .cq-tok-punct,
    .cq-tok-operator {
      color: #81788e;
    }

    .cq-tok-selector {
      color: #b6538c;
    }

    .cq-tok-number {
      color: #32826e;
    }

    .cq-tok-keyword {
      color: #8b50b8;
    }

    .cq-tok-func {
      color: #a27021;
    }

    .cq-tok-identifier {
      color: #4e455e;
    }

    body.dark .cq-tok-comment {
      color: #91869f;
    }

    body.dark .cq-tok-string,
    body.dark .cq-tok-entity {
      color: #e8c583;
    }

    body.dark .cq-tok-tag {
      color: #8eb4ee;
    }

    body.dark .cq-tok-attr,
    body.dark .cq-tok-property,
    body.dark .cq-tok-number {
      color: #8acbb3;
    }

    body.dark .cq-tok-punct,
    body.dark .cq-tok-operator {
      color: #b8aec9;
    }

    body.dark .cq-tok-selector {
      color: #e39acb;
    }

    body.dark .cq-tok-keyword {
      color: #c79ae9;
    }

    body.dark .cq-tok-func {
      color: #e4c38b;
    }

    body.dark .cq-tok-identifier {
      color: #ddd4ec;
    }

    @keyframes cq-enter {
      from {
        opacity: 0;
        translate: 0 8px;
      }
      to {
        opacity: 1;
        translate: 0 0;
      }
    }

    @keyframes cq-dot {
      0%, 80%, 100% {
        opacity: .35;
        transform: translateY(0);
      }
      40% {
        opacity: 1;
        transform: translateY(-3px);
      }
    }

    @keyframes cq-spark {
      0%, 100% {
        transform: rotate(-10deg) scale(.9);
      }
      50% {
        transform: rotate(15deg) scale(1.1);
      }
    }

    @media (min-width: 1450px) {
      .cq-workspace {
        min-height: 540px;
      }

      .cq-tabs button {
        font-size: 11px;
        padding-inline: 13px;
      }
    }

    @media (max-width: 900px) {
      .cq-studio {
        padding: 20px;
      }

      .cq-header {
        gap: 12px;
      }

      .cq-save {
        font-size: 9px;
      }

      .cq-workspace.cq-mode-split {
        grid-template-columns: 1fr;
        height: auto;
        max-height: none;
        gap: 15px;
      }

      .cq-mode-split .cq-code-panel,
      .cq-mode-split .cq-preview-panel {
        height: 430px;
      }

      .cq-intro-art {
        font-size: 48px;
      }

      .cq-bottom-bar {
        font-size: 10px;
      }

      .cq-tabs button {
        font-size: 11px;
      }
    }

    @media (max-width: 560px) {
      .cq-studio {
        padding: 15px;
        border-radius: 18px;
      }

      .cq-header {
        flex-wrap: wrap;
        padding-bottom: 17px;
        gap: 14px;
      }

      .cq-brand strong {
        font-size: 19px;
      }

      .cq-brand-icon {
        width: 36px;
        height: 36px;
        border-radius: 11px;
      }

      .cq-header > .cq-btn {
        margin-left: auto;
        padding: 9px 11px;
        font-size: 10px;
        min-height: 37px;
      }

      .cq-save {
        order: 3;
        width: 100%;
        margin-left: 0;
      }

      .cq-intro {
        padding: 24px 0;
      }

      .cq-intro h1 {
        font-size: 25px;
        letter-spacing: -.9px;
      }

      .cq-intro p {
        font-size: 11px;
        max-width: 270px;
      }

      .cq-intro-art {
        display: none;
      }

      .cq-mobile-break {
        display: block;
      }

      .cq-project-bar {
        padding: 13px;
        flex-wrap: wrap;
        gap: 13px;
      }

      .cq-project-name {
        flex-basis: 100%;
      }

      .cq-project-actions {
        width: 100%;
      }

      .cq-project-actions .cq-btn {
        flex: 1;
        padding: 10px;
        font-size: 11px;
      }

      .cq-workspace-toolbar {
        flex-wrap: wrap;
        padding-top: 16px;
        gap: 10px;
      }

      .cq-view-switch {
        flex: 1;
        justify-content: space-between;
      }

      .cq-view-switch button {
        padding: 8px 9px;
        font-size: 10px;
      }

      .cq-studio .cq-auto {
        font-size: 10px;
      }

      .cq-panel-head {
        padding: 0 6px;
      }

      .cq-tabs {
        gap: 0;
        flex: 1;
      }

      .cq-tabs button {
        font-size: 9px;
        padding: 0 6px;
        gap: 4px;
        flex: 1;
        justify-content: center;
      }

      .cq-panel-head > .cq-icon-btn {
        min-width: 27px;
        padding: 5px;
      }

      .cq-address > span:last-child,
      .cq-encoding {
        display: none;
      }

      .cq-mentor {
        padding: 15px;
      }

      .cq-mentor-heading {
        align-items: flex-start;
        gap: 9px;
      }

      .cq-mentor-heading h2 {
        font-size: 13px;
      }

      .cq-mentor-heading p {
        font-size: 10px;
      }

      .cq-mentor-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
      }

      .cq-mentor-footer {
        flex-wrap: wrap;
      }

      .cq-mentor-footer .cq-btn {
        width: 100%;
      }

      .cq-dialog form > div {
        flex-wrap: wrap;
      }

      .cq-bottom-bar > span:last-child {
        line-height: 2;
      }

      .cq-studio .cq-project-name input {
        font-size: 16px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cq-studio,
      .cq-studio *,
      .cq-studio *::before,
      .cq-studio *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    }
  `;

  /* ========================= ПОДСВЕТКА ========================= */

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const HIGHLIGHT_RULES = {
    html: [
      ["comment", /^<!--[\s\S]*?-->/],
      ["tag", /^<\/?[a-zA-Z][a-zA-Z0-9-]*/],
      ["entity", /^&[a-zA-Z#0-9]+;/],
      ["string", /^"[^"]*"|^'[^']*'/],
      ["attr", /^[a-zA-Z-]+(?=\s*=)/],
      ["punct", /^[<>\/=]/],
    ],
    css: [
      ["comment", /^\/\*[\s\S]*?\*\//],
      ["string", /^"[^"]*"|^'[^']*'/],
      ["number", /^-?\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?/],
      ["property", /^[a-zA-Z-]+(?=\s*:)/],
      ["selector", /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*/],
      ["punct", /^[{}:;,()]/],
    ],
    js: [
      ["comment", /^\/\/.*|^\/\*[\s\S]*?\*\//],
      ["string", /^`[^`]*`|^"[^"]*"|^'[^']*'/],
      [
        "keyword",
        /^(function|const|let|var|if|else|for|while|return|new|this|true|false|null|undefined|typeof|class|extends|import|export|from|of|in|try|catch|finally|throw|async|await|break|continue|switch|case|default)\b/,
      ],
      ["number", /^-?\d+\.?\d*/],
      ["func", /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/],
      ["punct", /^[{}()\[\];,.]/],
      ["operator", /^[=+\-*/%<>!&|?:]+/],
      ["identifier", /^[a-zA-Z_$][a-zA-Z0-9_$]*/],
    ],
  };

  function tokenizeCode(code, lang) {
    const rules = HIGHLIGHT_RULES[lang] || [];
    let i = 0;
    let out = "";

    while (i < code.length) {
      let matched = false;

      for (const [type, re] of rules) {
        const match = re.exec(code.slice(i));

        if (match && match.index === 0 && match[0].length > 0) {
          out += `<span class="cq-tok-${type}">${escapeHtml(match[0])}</span>`;
          i += match[0].length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        out += escapeHtml(code[i]);
        i++;
      }
    }

    return out;
  }

  /* ========================= СТАРТОВЫЙ ПРОЕКТ ========================= */

  const DEFAULT_CODE = {
    html:
      '<h1>Привет, я юный программист! 🚀</h1>\n' +
      "<p>Это мой первый настоящий сайт.</p>\n" +
      '<button onclick="sayHello()">Нажми меня!</button>',

    css: `body {
  font-family: Arial, sans-serif;
  background: #f0fdf4;
  text-align: center;
  padding: 20px;
}

h1 {
  color: #0ea5e9;
}

button {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

button:hover {
  background: #059669;
  transform: scale(1.05);
}`,

    js: `function sayHello() {
  alert("Ура! Ты написал свой первый скрипт! 🎉");
}`,
  };

  const LANGS = ["html", "css", "js"];

  const LANG_META = {
    html: {
      file: "index.html",
      short: "HTML",
      accent: "#fb923c",
      icon: "</>",
    },
    css: {
      file: "style.css",
      short: "CSS",
      accent: "#38bdf8",
      icon: "#",
    },
    js: {
      file: "script.js",
      short: "JS",
      accent: "#fbbf24",
      icon: "JS",
    },
  };

  const PAIR_MAP = {
    "(": ")",
    "{": "}",
    "[": "]",
    '"': '"',
    "'": "'",
  };

  const CLOSERS = [")", "}", "]", '"', "'"];

  const STORAGE_KEY = "vs-school.project.v1";
  const AI_ENDPOINT =
    "https://gemini-proxy-lms.msleaderindustry.workers.dev";

  /* ========================= ИКОНКИ ========================= */

  const CQIcon = ({
    size = 18,
    strokeWidth = 2,
    children,
    style,
    ...props
  }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );

  const CQIconRocket = (props) => (
    <CQIcon {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </CQIcon>
  );

  const CQIconSparkles = (props) => (
    <CQIcon {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.288 1.287L3 12l5.8 1.9a2 2 0 0 1 1.287 1.288L12 21l1.9-5.8a2 2 0 0 1 1.288-1.287L21 12l-5.8-1.9a2 2 0 0 1-1.287-1.288Z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </CQIcon>
  );

  const CQIconFolder = (props) => (
    <CQIcon {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </CQIcon>
  );

  const CQIconPlay = (props) => (
    <CQIcon {...props}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </CQIcon>
  );

  const CQIconRotateCcw = (props) => (
    <CQIcon {...props}>
      <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
      <path d="M3 3v5h5" />
    </CQIcon>
  );

  const CQIconDownload = (props) => (
    <CQIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </CQIcon>
  );

  const CQIconRefreshCw = (props) => (
    <CQIcon {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21v-5h5" />
    </CQIcon>
  );

  const CQIconLock = (props) => (
    <CQIcon {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </CQIcon>
  );

  const CQIconAlertTriangle = (props) => (
    <CQIcon {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </CQIcon>
  );

  const CQIconLightbulb = (props) => (
    <CQIcon {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </CQIcon>
  );

  const CQIconX = (props) => (
    <CQIcon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </CQIcon>
  );

  const CQIconArrowLeft = (props) => (
    <CQIcon {...props}>
      <path d="m12 19-7-7 7-7M19 12H5" />
    </CQIcon>
  );

  const CQIconCheck = (props) => (
    <CQIcon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </CQIcon>
  );

  /* ========================= ХРАНЕНИЕ И HTML ========================= */

  function loadProject() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (
        saved?.version === 1 &&
        LANGS.every((lang) => typeof saved.code?.[lang] === "string")
      ) {
        return {
          code: saved.code,
          name:
            typeof saved.name === "string"
              ? saved.name.slice(0, 60)
              : "Мой первый сайт",
        };
      }
    } catch (_) {
      // Повреждённый или недоступный черновик не мешает запуску.
    }

    return {
      code: { ...DEFAULT_CODE },
      name: "Мой первый сайт",
    };
  }

  function buildDoc(code, preview = false) {
    // Экранируем символ "<", чтобы строки с закрывающими тегами
    // внутри JavaScript или CSS не разрывали документ.
    const encode = (value) =>
      JSON.stringify(value).replace(/</g, "\\u003c");

    const errorCatcher = preview
      ? `<script>
          addEventListener('error', function(e) {
            parent.postMessage({
              __cqError: true,
              message: e.message
            }, '*');
          });

          addEventListener('unhandledrejection', function(e) {
            parent.postMessage({
              __cqError: true,
              message: String(e.reason?.message || e.reason)
            }, '*');
          });
        <\/script>`
      : "";

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Мой сайт</title>
  ${errorCatcher}
  <script>
    const style = document.createElement('style');
    style.textContent = ${encode(code.css)};
    document.head.append(style);
  <\/script>
</head>
<body>
  ${code.html}
  <script>
    const script = document.createElement('script');
    script.textContent = ${encode(code.js)};
    document.body.append(script);
  <\/script>
</body>
</html>`;
  }

  /* ========================= ПАНЕЛЬ РЕДАКТОРА ========================= */

  const EditorPane = ({
    lang,
    value,
    active,
    onChange,
    onKeyDown,
    onCursor,
    inputRef,
  }) => {
    const preRef = useRef(null);
    const gutterRef = useRef(null);

    const highlighted = useMemo(
      () => tokenizeCode(value, lang) + "\n",
      [value, lang],
    );

    return (
      <div className="cq-editor-pane" hidden={!active}>
        <div className="cq-gutter" ref={gutterRef} aria-hidden="true">
          {value.split("\n").map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>

        <div className="cq-editor-input">
          <pre
            ref={preRef}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />

          <textarea
            ref={inputRef}
            value={value}
            aria-label={`Код ${LANG_META[lang].short}`}
            spellCheck={false}
            wrap="off"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onChange={(event) => {
              onChange(event.target.value);
              onCursor(event.target);
            }}
            onKeyDown={onKeyDown}
            onSelect={(event) => onCursor(event.target)}
            onScroll={(event) => {
              const textarea = event.target;

              preRef.current.scrollTop = textarea.scrollTop;
              preRef.current.scrollLeft = textarea.scrollLeft;
              gutterRef.current.scrollTop = textarea.scrollTop;
            }}
          />
        </div>
      </div>
    );
  };

  /* ========================= ОСНОВНОЙ КОМПОНЕНТ ========================= */

  const CodePlayground = ({ onBack }) => {
    const [initial] = useState(loadProject);

    const [code, setCode] = useState(initial.code);
    const [name, setName] = useState(initial.name);

    const [activeTab, setActiveTab] = useState("html");
    const [mode, setMode] = useState("split");
    const [device, setDevice] = useState("desktop");
    const [autoRun, setAutoRun] = useState(true);

    const [preview, setPreview] = useState(() => ({
      doc: buildDoc(initial.code, true),
      id: 0,
    }));

    const [runtimeError, setRuntimeError] = useState(null);
    const [saveStatus, setSaveStatus] = useState("Сохранение…");
    const [cursor, setCursor] = useState({ line: 1, col: 1 });

    const [aiOpen, setAiOpen] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [aiError, setAiError] = useState(false);
    const [isAsking, setIsAsking] = useState(false);

    const [notice, setNotice] = useState("");
    const [resetLang, setResetLang] = useState("html");

    const iframeRef = useRef(null);
    const inputRefs = useRef({});
    const requestRef = useRef(null);
    const resetDialogRef = useRef(null);

    const publish = () => {
      setRuntimeError(null);

      setPreview((previous) => ({
        doc: buildDoc(code, true),
        id: previous.id + 1,
      }));
    };

    /* Настоящее локальное сохранение */

    useEffect(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: 1,
            name,
            code,
          }),
        );

        setSaveStatus("Сохранено на устройстве");
      } catch (_) {
        setSaveStatus("Не удалось сохранить — скачайте сайт");
      }
    }, [code, name]);

    /* Автоматическое обновление предпросмотра */

    useEffect(() => {
      if (!autoRun) return;

      const timer = setTimeout(publish, 650);
      return () => clearTimeout(timer);
    }, [code, autoRun]);

    /* Принимаем ошибки только от собственного iframe */

    useEffect(() => {
      const onMessage = (event) => {
        if (
          event.source === iframeRef.current?.contentWindow &&
          event.data?.__cqError === true &&
          typeof event.data.message === "string"
        ) {
          setRuntimeError(event.data.message.slice(0, 1200));
        }
      };

      window.addEventListener("message", onMessage);

      return () => {
        window.removeEventListener("message", onMessage);
        requestRef.current?.abort();
      };
    }, []);

    useEffect(() => {
      if (!notice) return;

      const timer = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(timer);
    }, [notice]);

    useEffect(() => {
      const textarea = inputRefs.current[activeTab];

      if (textarea) {
        updateCursor(textarea);
      }
    }, [activeTab]);

    const updateCursor = (textarea) => {
      const lines = textarea.value
        .slice(0, textarea.selectionStart)
        .split("\n");

      setCursor({
        line: lines.length,
        col: lines[lines.length - 1].length + 1,
      });
    };

    const updateCode = (lang, value) => {
      setCode((previous) => ({
        ...previous,
        [lang]: value,
      }));
    };

    /* ========================= КЛАВИАТУРА ========================= */

    const handleKeyDown = (event, lang) => {
      if (event.isComposing || event.nativeEvent?.isComposing) {
        return;
      }

      const textarea = event.target;
      const value = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        publish();
        setNotice("Сайт перезапущен");
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Esc, затем Tab — выход из редактора с клавиатуры.
      if (event.key === "Escape") {
        textarea.dataset.releaseTab = "true";
        return;
      }

      if (
        event.key === "Tab" &&
        textarea.dataset.releaseTab === "true"
      ) {
        delete textarea.dataset.releaseTab;
        return;
      }

      delete textarea.dataset.releaseTab;

      const insert = (
        text,
        from = start,
        to = end,
        selectionStart = from + text.length,
        selectionEnd = selectionStart,
      ) => {
        event.preventDefault();

        updateCode(
          lang,
          value.slice(0, from) + text + value.slice(to),
        );

        requestAnimationFrame(() => {
          textarea.setSelectionRange(selectionStart, selectionEnd);
          updateCursor(textarea);
        });
      };

      if (event.key === "Tab") {
        if (event.shiftKey || start !== end) {
          const from = value.lastIndexOf("\n", start - 1) + 1;
          const to =
            end > start && value[end - 1] === "\n"
              ? end - 1
              : end;

          const lines = value.slice(from, to).split("\n");

          const firstRemoved = Math.min(
            2,
            (lines[0].match(/^ */) || [""])[0].length,
          );

          const changed = lines
            .map((line) =>
              event.shiftKey
                ? line.replace(/^ {1,2}/, "")
                : "  " + line,
            )
            .join("\n");

          const delta = changed.length - (to - from);

          insert(
            changed,
            from,
            to,
            Math.max(
              from,
              start + (event.shiftKey ? -firstRemoved : 2),
            ),
            Math.max(from, end + delta),
          );
        } else {
          insert("  ");
        }

        return;
      }

      if (event.key === "Enter") {
        const line = value.slice(
          value.lastIndexOf("\n", start - 1) + 1,
          start,
        );

        const indent =
          (line.match(/^[ \t]*/) || [""])[0] +
          (/[{[]\s*$/.test(line) ? "  " : "");

        insert("\n" + indent);
        return;
      }

      if (
        CLOSERS.includes(event.key) &&
        start === end &&
        value[start] === event.key
      ) {
        event.preventDefault();
        textarea.setSelectionRange(start + 1, start + 1);
        updateCursor(textarea);
        return;
      }

      if (PAIR_MAP[event.key]) {
        // Не добавляем вторую кавычку внутри обычного слова
        // или сразу после экранирующего обратного слеша.
        if (
          (event.key === "'" || event.key === '"') &&
          /[\w\\]/.test(value[start - 1] || "")
        ) {
          return;
        }

        insert(
          event.key + value.slice(start, end) + PAIR_MAP[event.key],
          start,
          end,
          start + 1,
          end + 1,
        );

        return;
      }

      if (
        event.key === "Backspace" &&
        start === end &&
        start > 0 &&
        PAIR_MAP[value[start - 1]] === value[start]
      ) {
        insert("", start - 1, start + 1);
      }
    };

    /* ========================= СКАЧИВАНИЕ ========================= */

    const downloadSite = () => {
      const documentContent = buildDoc(code);

      const blob = new Blob([documentContent], {
        type: "text/html;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      const filename =
        name
          .trim()
          .replace(/[^\p{L}\p{N}_ -]/gu, "")
          .slice(0, 60) || "moy-sayt";

      anchor.href = url;
      anchor.download = filename + ".html";

      document.body.append(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("HTML-файл подготовлен для скачивания");
    };

    /* ========================= ИИ-НАСТАВНИК ========================= */

    const askAI = async () => {
      if (requestRef.current) return;

      const controller = new AbortController();
      requestRef.current = controller;

      setIsAsking(true);
      setAiError(false);
      setAiResponse("");

      const timer = setTimeout(() => controller.abort(), 30000);

      const prompt = `Ты — доброжелательный наставник начинающего программиста.
Найди ошибку или предложи одно улучшение.
Дай понятную подсказку на русском в 3–4 предложениях, без готового решения.

Код ученика:

HTML:
${code.html}

CSS:
${code.css}

JavaScript:
${code.js}`;

      try {
        const response = await fetch(AI_ENDPOINT, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        const answer = data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("\n");

        if (!answer?.trim()) {
          throw new Error("Empty answer");
        }

        setAiResponse(answer);
      } catch (_) {
        setAiError(true);

        setAiResponse(
          "Наставник сейчас недоступен. Проверьте соединение и попробуйте ещё раз. " +
          "Ваш код сохранён, если вверху отображается подтверждение сохранения.",
        );
      } finally {
        clearTimeout(timer);
        requestRef.current = null;
        setIsAsking(false);
      }
    };

    /* ========================= ИНТЕРФЕЙС ========================= */

    return (
      <section
        className="cq-studio"
        aria-label="VS School — студия кода"
      >
        <style>{STYLES}</style>

        <header className="cq-header">
          <div className="cq-brand">
            {onBack && (
              <button
                className="cq-icon-btn"
                onClick={onBack}
                aria-label="Назад"
              >
                <CQIconArrowLeft />
              </button>
            )}

            <span className="cq-brand-icon">
              <CQIconRocket size={23} />
            </span>

            <div>
              <strong>
                VS School<span className="cq-brand-dot">.</span>
              </strong>
              <small>СТУДИЯ КОДА</small>
            </div>
          </div>

          <span className="cq-save" role="status">
            <span
              className={
                saveStatus.startsWith("Не")
                  ? "cq-status-dot cq-warning"
                  : "cq-status-dot"
              }
            />
            {saveStatus}
          </span>

          <button
            className="cq-btn cq-secondary"
            onClick={downloadSite}
          >
            <CQIconDownload size={16} />
            Скачать сайт
          </button>
        </header>

        <div className="cq-intro">
          <div>
            <span className="cq-eyebrow">ЛАБОРАТОРИЯ ИДЕЙ</span>

            <h1>
              От первой строки —
              <br className="cq-mobile-break" /> к своему сайту
              <span>.</span>
            </h1>

            <p>
              Пишите код, пробуйте новое и сразу смотрите,
              что получилось.
            </p>
          </div>

          <span className="cq-intro-art" aria-hidden="true">
            {"{ }"}
            <i>✦</i>
          </span>
        </div>

        <div className="cq-project-bar">
          <label className="cq-project-name">
            <span className="cq-project-icon">
              <CQIconFolder size={19} />
            </span>

            <span>
              <small>ВАШ ПРОЕКТ</small>

              <input
                aria-label="Название проекта"
                maxLength={60}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Название проекта"
              />
            </span>
          </label>

          <div className="cq-project-actions">
            <button
              className={
                "cq-btn cq-secondary" +
                (aiOpen ? " cq-selected" : "")
              }
              aria-expanded={aiOpen}
              aria-controls="cq-mentor"
              onClick={() => setAiOpen(!aiOpen)}
            >
              <CQIconSparkles size={16} />
              ИИ-наставник
            </button>

            <button
              className="cq-btn cq-primary"
              title="Ctrl / ⌘ + Enter"
              onClick={() => {
                publish();

                if (mode === "code") {
                  setMode("preview");
                }

                setNotice("Сайт перезапущен");
              }}
            >
              <CQIconPlay size={15} />
              Запустить
            </button>
          </div>
        </div>

        <div className="cq-workspace-toolbar">
          <div
            className="cq-view-switch"
            aria-label="Режим рабочей области"
          >
            {[
              ["code", "Код"],
              ["split", "Код + результат"],
              ["preview", "Результат"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            className="cq-auto"
            role="switch"
            aria-checked={autoRun}
            onClick={() => setAutoRun(!autoRun)}
          >
            <span className="cq-toggle">
              <i />
            </span>
            Автозапуск
          </button>
        </div>

        <div className={`cq-workspace cq-mode-${mode}`}>
          <section
            className="cq-code-panel"
            aria-label="Редактор кода"
            hidden={mode === "preview"}
          >
            <div className="cq-panel-head">
              <div
                className="cq-tabs"
                role="tablist"
                aria-label="Файлы проекта"
              >
                {LANGS.map((lang, index) => (
                  <button
                    key={lang}
                    role="tab"
                    id={`cq-tab-${lang}`}
                    aria-controls="cq-code-area"
                    aria-selected={activeTab === lang}
                    tabIndex={activeTab === lang ? 0 : -1}
                    onClick={() => setActiveTab(lang)}
                    onKeyDown={(event) => {
                      if (
                        ![
                          "ArrowRight",
                          "ArrowLeft",
                          "Home",
                          "End",
                        ].includes(event.key)
                      ) {
                        return;
                      }

                      event.preventDefault();

                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? LANGS.length - 1
                            : (
                                index +
                                (
                                  event.key === "ArrowRight"
                                    ? 1
                                    : LANGS.length - 1
                                )
                              ) % LANGS.length;

                      setActiveTab(LANGS[next]);

                      document
                        .getElementById(`cq-tab-${LANGS[next]}`)
                        ?.focus();
                    }}
                  >
                    <span
                      style={{
                        color: LANG_META[lang].accent,
                      }}
                    >
                      {LANG_META[lang].icon}
                    </span>

                    {LANG_META[lang].file}
                  </button>
                ))}
              </div>

              <button
                className="cq-icon-btn"
                aria-label="Сбросить текущий файл"
                title="Сбросить текущий файл"
                onClick={() => {
                  setResetLang(activeTab);
                  resetDialogRef.current.showModal();
                }}
              >
                <CQIconRotateCcw size={16} />
              </button>
            </div>

            <div
              className="cq-code-area"
              id="cq-code-area"
              role="tabpanel"
              aria-labelledby={`cq-tab-${activeTab}`}
            >
              {LANGS.map((lang) => (
                <EditorPane
                  key={lang}
                  lang={lang}
                  value={code[lang]}
                  active={activeTab === lang}
                  onChange={(value) => updateCode(lang, value)}
                  onKeyDown={(event) => handleKeyDown(event, lang)}
                  onCursor={updateCursor}
                  inputRef={(element) => {
                    inputRefs.current[lang] = element;
                  }}
                />
              ))}
            </div>

            <footer className="cq-editor-footer">
              <span>
                <span className="cq-status-dot" />
                {LANG_META[activeTab].short}
              </span>

              <span>
                Строка {cursor.line}, столбец {cursor.col}
                <span className="cq-encoding">UTF-8</span>
              </span>
            </footer>
          </section>

          <section
            className="cq-preview-panel"
            aria-label="Предпросмотр сайта"
            hidden={mode === "code"}
          >
            <div className="cq-panel-head">
              <span className="cq-preview-title">
                <span className="cq-status-dot" />
                Результат
              </span>

              <div
                className="cq-device-switch"
                aria-label="Ширина предпросмотра"
              >
                {[
                  ["desktop", "На весь экран"],
                  ["mobile", "Телефон · 375 px"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className="cq-icon-btn"
                    aria-label={label}
                    title={label}
                    aria-pressed={device === id}
                    onClick={() => setDevice(id)}
                  >
                    <CQIcon size={16}>
                      {id === "desktop" ? (
                        <>
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="12"
                            rx="2"
                          />
                          <path d="M8 21h8m-4-5v5" />
                        </>
                      ) : (
                        <>
                          <rect
                            x="6"
                            y="2"
                            width="12"
                            height="20"
                            rx="3"
                          />
                          <path d="M11 18h2" />
                        </>
                      )}
                    </CQIcon>
                  </button>
                ))}
              </div>

              <button
                className="cq-icon-btn"
                onClick={publish}
                aria-label="Обновить результат"
                title="Обновить результат"
              >
                <CQIconRefreshCw size={16} />
              </button>
            </div>

            <div className="cq-address">
              <CQIconLock size={12} />
              <span>Предпросмотр вашего сайта</span>
              <span>HTML · CSS · JS</span>
            </div>

            <div
              className={`cq-preview-stage cq-device-${device}`}
            >
              <iframe
                key={preview.id}
                ref={iframeRef}
                srcDoc={preview.doc}
                title="Результат выполнения кода"
                sandbox="allow-scripts allow-modals"
              />
            </div>

            {runtimeError && (
              <div className="cq-error" role="alert">
                <CQIconAlertTriangle size={17} />

                <div>
                  <strong>Давайте поправим JavaScript</strong>
                  <p>{runtimeError}</p>
                </div>

                <button
                  className="cq-icon-btn"
                  aria-label="Закрыть ошибку"
                  onClick={() => setRuntimeError(null)}
                >
                  <CQIconX size={16} />
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="cq-bottom-bar">
          <span>
            <CQIconLightbulb size={15} />
            Маленькие изменения — большие открытия.
          </span>

          <span>
            <kbd>Tab</kbd> отступ
            <i>·</i>
            <kbd>Ctrl / ⌘ ↵</kbd> запуск
            <i>·</i>
            <kbd>Esc → Tab</kbd> выход из редактора
          </span>
        </div>

        {aiOpen && (
          <aside className="cq-mentor" id="cq-mentor">
            <div className="cq-mentor-heading">
              <span className="cq-mentor-icon">
                <CQIconSparkles size={22} />
              </span>

              <div>
                <h2>Немного помощи, много открытий</h2>
                <p>
                  Наставник подскажет следующий шаг,
                  а решение останется за вами.
                </p>
              </div>

              <button
                className="cq-icon-btn"
                aria-label="Закрыть наставника"
                onClick={() => setAiOpen(false)}
              >
                <CQIconX />
              </button>
            </div>

            <div
              className="cq-mentor-body"
              aria-live="polite"
              aria-busy={isAsking}
            >
              {isAsking ? (
                <span className="cq-thinking">
                  <span />
                  <span />
                  <span />
                  Изучаю ваш код…
                </span>
              ) : aiResponse ? (
                <p className={aiError ? "cq-ai-error" : ""}>
                  {aiResponse}
                </p>
              ) : (
                <p>
                  Нужен свежий взгляд? Получите подсказку
                  по HTML, CSS и JavaScript.
                </p>
              )}
            </div>

            <div className="cq-mentor-footer">
              <small>
                При запросе код проекта отправляется ИИ-наставнику.
              </small>

              <button
                className="cq-btn cq-primary"
                onClick={askAI}
                disabled={isAsking}
              >
                <CQIconSparkles size={15} />

                {isAsking
                  ? "Думаю…"
                  : aiResponse
                    ? "Спросить ещё раз"
                    : "Получить подсказку"}
              </button>
            </div>
          </aside>
        )}

        <dialog className="cq-dialog" ref={resetDialogRef}>
          <form method="dialog">
            <span className="cq-mentor-icon">
              <CQIconRotateCcw size={22} />
            </span>

            <h2>Начать файл заново?</h2>

            <p>
              Изменения в{" "}
              <strong>{LANG_META[resetLang].file}</strong>{" "}
              будут заменены стартовым кодом.
              Другие файлы останутся на месте.
            </p>

            <div>
              <button
                className="cq-btn cq-secondary"
                autoFocus
              >
                Оставить код
              </button>

              <button
                className="cq-btn cq-danger"
                onClick={() => {
                  updateCode(resetLang, DEFAULT_CODE[resetLang]);
                  setNotice("Файл восстановлен");
                }}
              >
                Сбросить файл
              </button>
            </div>
          </form>
        </dialog>

        {notice && (
          <div className="cq-toast" role="status">
            <CQIconCheck size={17} />
            {notice}
          </div>
        )}
      </section>
    );
  };

  Object.assign(window, { CodePlayground });
})();
