function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(function () {
  const {
    motion,
    AnimatePresence
  } = window.Motion;
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const iconWrap = {
    rest: {},
    hover: {}
  };

  // Солнце/Луна
  const ThemeIcon = ({
    isDark
  }) => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: {
      rest: {
        rotate: 0
      },
      hover: {
        rotate: 90
      }
    },
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 12
    }
  }, isDark ? /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.2",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }), /*#__PURE__*/React.createElement("g", {
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.4 5.6l-1.55 1.55M7.15 16.85 5.6 18.4M18.4 18.4l-1.55-1.55M7.15 7.15 5.6 5.6"
  }))));
  const CloseIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: {
      rest: {
        rotate: 0
      },
      hover: {
        rotate: 90
      }
    },
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 16
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 5l14 14M19 5 5 19",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }));
  const PencilIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: {
      rest: {
        rotate: 0,
        x: 0,
        y: 0
      },
      hover: {
        rotate: [0, -12, 8, -6, 0],
        x: [0, -1, 1, -0.5, 0],
        y: [0, 1, -1, 0.5, 0]
      }
    },
    transition: {
      duration: 0.6,
      ease: 'easeInOut'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 20l1-4.2L15.6 5.2a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 6.8l3.2 3.2",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }));
  const ChatIcon = () => {
    const dot = delay => ({
      rest: {
        opacity: 0.5,
        y: 0
      },
      hover: {
        opacity: [0.5, 1, 0.5],
        y: [0, -2, 0],
        transition: {
          duration: 0.9,
          repeat: Infinity,
          delay
        }
      }
    });
    return /*#__PURE__*/React.createElement(motion.svg, {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      variants: iconWrap
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 4V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement(motion.circle, {
      cx: "9",
      cy: "11",
      r: "1.2",
      fill: "currentColor",
      variants: dot(0)
    }), /*#__PURE__*/React.createElement(motion.circle, {
      cx: "13",
      cy: "11",
      r: "1.2",
      fill: "currentColor",
      variants: dot(0.15)
    }), /*#__PURE__*/React.createElement(motion.circle, {
      cx: "17",
      cy: "11",
      r: "1.2",
      fill: "currentColor",
      variants: dot(0.3)
    }));
  };
  const KeyboardIcon = () => {
    const key = delay => ({
      rest: {
        y: 0
      },
      hover: {
        y: [0, 1.6, 0],
        transition: {
          duration: 0.5,
          delay
        }
      }
    });
    return /*#__PURE__*/React.createElement(motion.svg, {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      variants: iconWrap
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2.5",
      y: "6",
      width: "19",
      height: "12",
      rx: "2",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }), [5, 8.3, 11.6, 14.9, 18.2].map((x, i) => /*#__PURE__*/React.createElement(motion.rect, {
      key: x,
      x: x,
      y: "9.5",
      width: "2",
      height: "2",
      rx: "0.4",
      fill: "currentColor",
      variants: key(i * 0.06)
    })), /*#__PURE__*/React.createElement(motion.rect, {
      x: "6",
      y: "13.5",
      width: "12",
      height: "2",
      rx: "0.6",
      fill: "currentColor",
      variants: key(0.3)
    }));
  };
  const BoltIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: {
      rest: {
        scale: 1,
        filter: 'drop-shadow(0 0 0px currentColor)'
      },
      hover: {
        scale: [1, 1.12, 1],
        filter: ['drop-shadow(0 0 0px currentColor)', 'drop-shadow(0 0 4px currentColor)', 'drop-shadow(0 0 0px currentColor)'],
        transition: {
          duration: 0.7,
          repeat: Infinity
        }
      }
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
    fill: "currentColor",
    stroke: "currentColor",
    strokeWidth: "0.6",
    strokeLinejoin: "round"
  }));
  const CodeIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: iconWrap
  }, /*#__PURE__*/React.createElement(motion.path, {
    d: "M9 6 3 12l6 6",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    variants: {
      rest: {
        x: 0
      },
      hover: {
        x: -2
      }
    },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18
    }
  }), /*#__PURE__*/React.createElement(motion.path, {
    d: "M15 6l6 6-6 6",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    variants: {
      rest: {
        x: 0
      },
      hover: {
        x: 2
      }
    },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18
    }
  }));
  const CardsIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: iconWrap
  }, /*#__PURE__*/React.createElement(motion.rect, {
    x: "4",
    y: "5",
    width: "12",
    height: "15",
    rx: "2",
    stroke: "currentColor",
    strokeWidth: "1.6",
    variants: {
      rest: {
        rotate: -6,
        x: 0
      },
      hover: {
        rotate: -16,
        x: -2
      }
    },
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 16
    },
    style: {
      transformOrigin: '10px 20px'
    }
  }), /*#__PURE__*/React.createElement(motion.rect, {
    x: "8",
    y: "4",
    width: "12",
    height: "15",
    rx: "2",
    fill: "var(--sidebar-bg,#1c1c22)",
    stroke: "currentColor",
    strokeWidth: "1.6",
    variants: {
      rest: {
        rotate: 6,
        x: 0
      },
      hover: {
        rotate: 16,
        x: 2
      }
    },
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 16
    },
    style: {
      transformOrigin: '14px 19px'
    }
  }));
  const ChartIcon = () => {
    const bar = (h, delay) => ({
      rest: {
        scaleY: 0.55
      },
      hover: {
        scaleY: h,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 14,
          delay
        }
      }
    });
    return /*#__PURE__*/React.createElement(motion.svg, {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      variants: iconWrap
    }, /*#__PURE__*/React.createElement(motion.rect, {
      x: "4",
      y: "10",
      width: "3.6",
      height: "10",
      rx: "1",
      fill: "currentColor",
      style: {
        transformOrigin: '5.8px 20px'
      },
      variants: bar(0.7, 0)
    }), /*#__PURE__*/React.createElement(motion.rect, {
      x: "10.2",
      y: "6",
      width: "3.6",
      height: "14",
      rx: "1",
      fill: "currentColor",
      style: {
        transformOrigin: '12px 20px'
      },
      variants: bar(1, 0.06)
    }), /*#__PURE__*/React.createElement(motion.rect, {
      x: "16.4",
      y: "12",
      width: "3.6",
      height: "8",
      rx: "1",
      fill: "currentColor",
      style: {
        transformOrigin: '18.2px 20px'
      },
      variants: bar(0.85, 0.12)
    }));
  };
  const StatsIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: iconWrap
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v18h18",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement(motion.path, {
    d: "M19 9l-5 5-4-4-5 5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    variants: {
      rest: {
        pathLength: 1
      },
      hover: {
        pathLength: [0, 1]
      }
    },
    transition: {
      duration: 0.6
    }
  }));
  const ShieldIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: iconWrap
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement(motion.path, {
    d: "M8.5 12.2l2.4 2.4 4.6-5",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    initial: false,
    variants: {
      rest: {
        pathLength: 0.55,
        opacity: 0.6
      },
      hover: {
        pathLength: 1,
        opacity: 1
      }
    },
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }));
  const LogoutIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: iconWrap
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 4H5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5 20h4",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement(motion.g, {
    variants: {
      rest: {
        x: 0
      },
      hover: {
        x: [0, 3, 1.5, 3],
        transition: {
          duration: 0.5
        }
      }
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 8l4.5 4L13 16",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 12H20",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  })));
  const BackIcon = () => /*#__PURE__*/React.createElement(motion.svg, {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    variants: {
      rest: {
        x: 0
      },
      hover: {
        x: -3
      }
    },
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 20
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 5 8 12l7 7",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 12H19.5",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }));
  const MENU_ITEMS = [{
    id: 'typing',
    label: 'Тренажёр печати',
    hint: 'Скорость и точность',
    Icon: KeyboardIcon,
    color: '#818cf8'
  }, {
    id: 'hotkeys',
    label: 'Горячие клавиши',
    hint: 'Работай быстрее',
    Icon: BoltIcon,
    color: '#fbbf24'
  }, {
    id: 'code',
    label: 'VS School',
    hint: 'Практика программирования',
    Icon: CodeIcon,
    color: '#38bdf8'
  }, {
    id: 'flashcards',
    label: 'Умные карточки',
    hint: 'Запоминай надолго',
    Icon: CardsIcon,
    color: '#c084fc'
  }, {
    id: 'excel',
    label: 'Тренажёр Excel',
    hint: 'От формулы к решению',
    Icon: ChartIcon,
    color: '#34d399'
  }];
  const MENU_CSS = `
.ulms-menu,.ulms-menu *{box-sizing:border-box}
.ulms-menu{--sm-bg:#141c2b;--sm-card:#1c2739;--sm-text:#eef3fc;--sm-muted:#a5b2c8;--sm-border:#ffffff12;--sm-hover:#ffffff07;--sm-accent:#8da2ff;--sm-ease:cubic-bezier(.22,1,.36,1);--sidebar-bg:var(--sm-card);position:fixed;inset:0 auto 0 0;width:360px;max-width:calc(100vw - 16px);height:100dvh;z-index:2001;background:var(--sm-bg);color:var(--sm-text);font-family:inherit;display:flex;flex-direction:column;border-right:1px solid var(--sm-border);box-shadow:18px 0 70px #02061745;isolation:isolate;overflow:hidden;transition:background-color .45s ease,color .45s ease,border-color .45s ease}
.ulms-menu[data-theme=light]{--sm-bg:#f6f8fc;--sm-card:#fff;--sm-text:#19283e;--sm-muted:#627189;--sm-border:#253e6016;--sm-hover:#253e6007;--sm-accent:#435bd0}
.ulms-menu::before{content:'';position:absolute;inset:0 0 auto;height:250px;background:radial-gradient(ellipse at 8% 0,#818cf81c,transparent 70%);z-index:-1;pointer-events:none}
.ulms-menu button{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;color:inherit}
.ulms-menu button:focus-visible{outline:2px solid var(--sm-accent);outline-offset:3px}
.ulms-menu button:disabled{cursor:wait;opacity:.6}

.ulms-menu-backdrop{will-change:opacity,backdrop-filter}

.ulms-menu-header{display:flex;align-items:center;justify-content:space-between;padding:24px 23px 18px;gap:12px;flex-shrink:0;border-bottom:1px solid transparent;transition:border-color .25s,box-shadow .25s;animation:sm-fade .45s ease .05s backwards}
.ulms-menu-header[data-scrolled=true]{border-bottom-color:var(--sm-border);box-shadow:0 12px 24px -20px #000c}
.ulms-menu-brand{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:800;letter-spacing:1.5px}
.ulms-menu-logo{width:32px;height:32px;border:1px solid #818cf848;border-radius:11px;display:grid;place-items:center;color:var(--sm-accent);background:#818cf811}
.ulms-menu-logo path{animation:sm-draw 1s var(--sm-ease) .22s backwards}
.ulms-menu-tools{display:flex;gap:6px}
.ulms-menu-tool{display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--sm-border);border-radius:12px;background:var(--sm-card);transition:background-color .2s,border-color .45s,transform .25s var(--sm-ease)}
.ulms-menu-tool:hover{background:var(--sm-hover);transform:translateY(-2px)}
.ulms-menu-tool:active{transform:translateY(0) scale(.92)}

.ulms-menu-body{position:relative;overflow:auto;overscroll-behavior:contain;flex:1;min-height:0;padding:2px 16px 18px;scrollbar-width:thin;scrollbar-color:#8a9bbb40 transparent}

/* Плавающая подсветка: одна на все пункты, переезжает за курсором */
.ulms-menu-glow{position:absolute;left:0;top:0;width:0;height:0;z-index:0;pointer-events:none;border-radius:15px;opacity:0;border:1px solid color-mix(in srgb,var(--gc,#8da2ff) 26%,var(--sm-border));background:color-mix(in srgb,var(--gc,#8da2ff) 9%,transparent);box-shadow:0 10px 24px -14px color-mix(in srgb,var(--gc,#8da2ff) 60%,transparent);transition:transform .45s var(--sm-ease),width .45s var(--sm-ease),height .45s var(--sm-ease),opacity .25s ease,background-color .3s,border-color .3s,box-shadow .3s}
.ulms-menu-glow[data-on=true]{opacity:1}

.ulms-menu-profile{--i:-1;position:relative;border:1px solid var(--sm-border);border-radius:20px;padding:17px 14px;background:var(--sm-card);display:flex;align-items:center;gap:12px;overflow:hidden;margin:0 4px 22px;transition:background-color .45s,border-color .45s;animation:sm-rise .55s var(--sm-ease) calc(110ms + var(--i)*46ms) backwards}
.ulms-menu-profile::before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 20%,#818cf80d 48%,transparent 75%);transform:translateX(-120%);animation:sm-shine 9s ease-in-out infinite;pointer-events:none}
.ulms-menu-avatar{width:46px;height:46px;flex-shrink:0;border-radius:15px;background:linear-gradient(145deg,#7c87e8,#4d60b4);box-shadow:0 5px 14px #4f46e52a;color:white;display:grid;place-items:center;font-size:20px;font-weight:700;animation:sm-pop .7s cubic-bezier(.34,1.56,.64,1) .2s backwards}
.ulms-menu-person{min-width:0;flex:1}.ulms-menu-person small{display:block;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--sm-muted);margin-bottom:5px}.ulms-menu-person strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;font-weight:650}.ulms-menu-person p{font-size:11px;color:var(--sm-muted);margin:4px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ulms-menu-edit{border:0;background:var(--sm-hover);border-radius:10px;display:grid;place-items:center;width:32px;height:32px;flex-shrink:0;color:var(--sm-muted)!important;transition:background-color .2s,color .2s,transform .3s var(--sm-ease)}
.ulms-menu-edit:hover{background:var(--sm-border);color:var(--sm-text)!important;transform:scale(1.08)}
.ulms-menu-edit:active{transform:scale(.94)}

.ulms-menu-caption{display:flex;align-items:center;gap:10px;margin:20px 13px 10px;color:var(--sm-muted);font-size:10px;letter-spacing:1.4px;text-transform:uppercase;font-weight:750;animation:sm-fade .5s ease calc(110ms + var(--i,0)*46ms) backwards}
.ulms-menu-caption::after{content:'';height:1px;flex:1;background:var(--sm-border);transform-origin:left;animation:sm-grow .8s var(--sm-ease) calc(150ms + var(--i,0)*46ms) backwards}
.ulms-menu-list{display:grid;gap:5px}

.ulms-menu-row{position:relative;z-index:1;display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;text-align:left;border:1px solid transparent;border-radius:15px;background:transparent;min-height:66px;transition:background-color .2s,border-color .45s;overflow:hidden;animation:sm-slide .55s var(--sm-ease) calc(110ms + var(--i,0)*46ms) backwards}
.ulms-menu-row:active{background:var(--sm-hover)}
.ulms-menu-row[data-active=true]{background:var(--sm-card);border-color:var(--sm-border);box-shadow:0 5px 14px #00000008}
.ulms-menu-row[data-active=true]::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 3px 3px 0;background:var(--item-color);animation:sm-bar .6s var(--sm-ease) .35s backwards}
.ulms-menu-badge{height:40px;width:40px;flex-shrink:0;border-radius:13px;display:grid;place-items:center;color:var(--item-color);background:color-mix(in srgb,var(--item-color) 12%,transparent);border:1px solid color-mix(in srgb,var(--item-color) 20%,transparent);transition:transform .45s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
.ulms-menu[data-theme=light] .ulms-menu-badge{color:color-mix(in srgb,var(--item-color) 65%,#12233e)}
.ulms-menu-row:hover .ulms-menu-badge,.ulms-menu-row:focus-visible .ulms-menu-badge{transform:rotate(-5deg) scale(1.08);box-shadow:0 6px 16px color-mix(in srgb,var(--item-color) 22%,transparent)}
.ulms-menu-row:active .ulms-menu-badge{transform:scale(.92)}
.ulms-menu-row-copy{flex:1;min-width:0;transition:transform .4s var(--sm-ease)}.ulms-menu-row-copy strong{display:block;font-size:14px;font-weight:650;line-height:1.3}.ulms-menu-row-copy small{display:block;font-size:11px;line-height:1.4;color:var(--sm-muted);margin-top:3px}
.ulms-menu-row:hover .ulms-menu-row-copy,.ulms-menu-row:focus-visible .ulms-menu-row-copy{transform:translateX(2px)}
.ulms-menu-arrow{color:var(--sm-muted);opacity:0;transform:translateX(-8px);transition:opacity .2s,transform .4s var(--sm-ease);flex-shrink:0}.ulms-menu-row:hover .ulms-menu-arrow,.ulms-menu-row:focus-visible .ulms-menu-arrow{opacity:1;transform:translateX(0)}
.ulms-menu-current{width:6px;height:6px;border-radius:50%;background:var(--item-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--item-color) 12%,transparent);margin:0 5px;animation:sm-pulse 3s ease-in-out infinite;flex-shrink:0}

.ulms-menu-footer{flex-shrink:0;border-top:1px solid var(--sm-border);padding:14px 23px max(18px,env(safe-area-inset-bottom));background:var(--sm-bg);transition:background-color .45s,border-color .45s;animation:sm-rise .5s var(--sm-ease) .42s backwards}
.ulms-menu-logout{position:relative;overflow:hidden;width:100%;display:flex;align-items:center;justify-content:center;gap:10px;min-height:44px;border:1px solid var(--sm-border);border-radius:13px;background:var(--sm-card);font-size:13px!important;font-weight:650!important;transition:background-color .2s,color .2s,border-color .3s,transform .25s var(--sm-ease)}
.ulms-menu-logout:hover{background:#ef444410;border-color:#ef444435;color:#e0525f}
.ulms-menu-logout:active{transform:scale(.98)}
.ulms-menu-logout[data-busy=true]::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,#ef444422,transparent);animation:sm-sweep 1.1s ease-in-out infinite;pointer-events:none}
.ulms-menu-error{font-size:12px;line-height:1.5;color:#e0525f;margin:0 0 10px;animation:sm-fade .3s ease backwards,sm-shake .45s ease .05s}
.ulms-menu-empty{font-size:13px;color:var(--sm-muted);line-height:1.6;padding:10px 12px}

/* Переключение темы без дёрганья переходов внутри меню */
.ulms-menu[data-vt],.ulms-menu[data-vt] *{transition:none!important}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
::view-transition-old(root){z-index:1}
::view-transition-new(root){z-index:2}

@keyframes sm-fade{from{opacity:0}}
@keyframes sm-rise{from{opacity:0;transform:translateY(12px)}}
@keyframes sm-slide{from{opacity:0;transform:translateX(-16px)}}
@keyframes sm-pop{from{opacity:0;transform:scale(.55) rotate(-10deg)}}
@keyframes sm-grow{from{transform:scaleX(0)}}
@keyframes sm-bar{from{transform:scaleY(0)}}
@keyframes sm-blur{from{backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0)}}
@keyframes sm-draw{from{stroke-dasharray:1;stroke-dashoffset:1}to{stroke-dasharray:1;stroke-dashoffset:0}}
@keyframes sm-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes sm-sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes sm-shine{0%,50%{transform:translateX(-120%)}80%,100%{transform:translateX(120%)}}
@keyframes sm-pulse{50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--item-color) 5%,transparent)}}
@media(max-width:400px){.ulms-menu{width:330px}.ulms-menu-header{padding:18px 18px 14px}.ulms-menu-body{padding:2px 12px 16px}.ulms-menu-row{padding:9px 10px;min-height:62px}.ulms-menu-footer{padding:12px 18px max(14px,env(safe-area-inset-bottom))}}
@media(prefers-reduced-motion:reduce){.ulms-menu,.ulms-menu *,.ulms-menu *::before,.ulms-menu *::after,.ulms-menu::before,.ulms-menu-backdrop{animation:none!important;transition:none!important}}

/* Открытие/закрытие панели анимируется через Web Animations API (см. SidebarMenu) */
`;
  function injectMenuStyles() {
    document.getElementById('ulms-sidebar-motion-v3')?.remove();
    let el = document.getElementById('ulms-sidebar-native-v4');
    if (!el) {
      el = document.createElement('style');
      el.id = 'ulms-sidebar-native-v4';
      document.head.appendChild(el);
    }
    if (el.textContent !== MENU_CSS) el.textContent = MENU_CSS;
  }
  injectMenuStyles();
  function useMenuStyles() {
    if (!document.getElementById('ulms-sidebar-native-v4')) injectMenuStyles();
  }
  function useReducedMotion() {
    const [value, setValue] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
      const m = window.matchMedia('(prefers-reduced-motion: reduce)');
      const change = () => setValue(m.matches);
      m.addEventListener('change', change);
      return () => m.removeEventListener('change', change);
    }, []);
    return value;
  }
  const MenuRow = ({
    id,
    label,
    hint,
    Icon,
    color,
    active,
    onClick,
    index,
    reduced,
    onHover
  }) => /*#__PURE__*/React.createElement(motion.button, {
    type: "button",
    className: "ulms-menu-row",
    "data-active": active,
    "aria-label": active ? `${label}: вернуться в меню` : label,
    onClick: onClick,
    onPointerEnter: e => {
      if (e.pointerType === 'mouse') onHover?.(e.currentTarget);
    },
    onFocus: e => {
      if (e.currentTarget.matches(':focus-visible')) onHover?.(e.currentTarget);
    },
    style: {
      '--item-color': color,
      '--i': index
    },
    initial: "rest",
    animate: "rest",
    whileHover: reduced ? 'rest' : 'hover',
    whileTap: reduced ? undefined : {
      scale: .975
    },
    transition: {
      type: 'spring',
      stiffness: 520,
      damping: 32
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ulms-menu-badge"
  }, active ? /*#__PURE__*/React.createElement(BackIcon, null) : /*#__PURE__*/React.createElement(Icon, null)), /*#__PURE__*/React.createElement("span", {
    className: "ulms-menu-row-copy"
  }, /*#__PURE__*/React.createElement("strong", null, label), /*#__PURE__*/React.createElement("small", null, active ? 'Открыт · нажми, чтобы вернуться в меню' : hint)), active ? /*#__PURE__*/React.createElement("span", {
    className: "ulms-menu-current"
  }) : /*#__PURE__*/React.createElement("svg", {
    className: "ulms-menu-arrow",
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m9 5 7 7-7 7"
  })));
  const SidebarMenu = ({
    isOpen,
    onClose,
    theme,
    setTheme,
    user,
    userNickname,
    changeNickname,
    allowedModules = [],
    isAdmin,
    view,
    setView,
    setIsChatOpen
  }) => {
    useMenuStyles();
    const reduced = useReducedMotion();
    const panel = useRef(null),
      closeRef = useRef(onClose),
      busy = useRef(false);
    closeRef.current = onClose;
    const [present, setPresent] = useState(isOpen);
    const show = isOpen || present;
    const backdropRef = useRef(null);
    const running = useRef([]);
    const shown = useRef(false);
    const returnFocus = useRef(null);
    useEffect(() => {
      if (isOpen) {
        returnFocus.current = document.activeElement;
        setPresent(true);
      }
    }, [isOpen]);

    // Плавное открытие/закрытие: WAAPI не зависит от CSS-правил страницы и prefers-reduced-motion
    React.useLayoutEffect(() => {
      const p = panel.current,
        b = backdropRef.current;
      if (!p || !b || typeof p.animate !== 'function') {
        if (!isOpen) {
          setPresent(false);
          unlockScroll();
        }
        return;
      }
      const OFF = 'translate3d(calc(-100% - 60px),0,0)';
      const fromP = shown.current ? getComputedStyle(p).transform : OFF;
      const fromB = shown.current ? parseFloat(getComputedStyle(b).opacity) : 0;
      shown.current = true;
      const dur = reduced ? 320 : isOpen ? 720 : 460;
      const opts = {
        duration: dur,
        easing: isOpen ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,.2,1)',
        fill: 'both'
      };
      const prev = running.current;
      const ap = p.animate([{
        transform: fromP
      }, {
        transform: isOpen ? 'none' : OFF
      }], opts);
      const ab = b.animate([{
        opacity: fromB
      }, {
        opacity: isOpen ? 1 : 0
      }], {
        ...opts,
        easing: 'ease'
      });
      running.current = [ap, ab];
      prev.forEach(a => a.cancel());
      ap.onfinish = () => {
        if (isOpen) {
          ap.cancel();
          ab.cancel();
          running.current = [];
        } else {
          shown.current = false;
          running.current = [];
          setPresent(false);
          unlockScroll();
          if (returnFocus.current?.isConnected) returnFocus.current.focus({
            preventScroll: true
          });
        }
      };
    }, [isOpen, reduced]);
    const scrollLock = useRef(null);
    const lockScroll = () => {
      if (scrollLock.current) return;
      const b = document.body,
        sw = window.innerWidth - document.documentElement.clientWidth;
      scrollLock.current = {
        overflow: b.style.overflow,
        paddingRight: b.style.paddingRight
      };
      if (sw > 0) b.style.paddingRight = `${(parseFloat(getComputedStyle(b).paddingRight) || 0) + sw}px`;
      b.style.overflow = 'hidden';
    };
    const unlockScroll = () => {
      const s = scrollLock.current;
      if (!s) return;
      scrollLock.current = null;
      document.body.style.overflow = s.overflow;
      document.body.style.paddingRight = s.paddingRight;
    };
    useEffect(() => unlockScroll, []);
    const [signingOut, setSigningOut] = useState(false),
      [error, setError] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const bodyRef = useRef(null),
      glowRef = useRef(null);

    // Одна подсветка на все пункты: плавно переезжает к пункту под курсором/фокусом
    const moveGlow = el => {
      const g = glowRef.current,
        b = bodyRef.current;
      if (!g || !b) return;
      if (!el) {
        g.dataset.on = 'false';
        return;
      }
      let x, y;
      if (el.offsetParent === b) {
        x = el.offsetLeft;
        y = el.offsetTop;
      } else {
        const r = el.getBoundingClientRect(),
          br = b.getBoundingClientRect();
        x = r.left - br.left + b.scrollLeft;
        y = r.top - br.top + b.scrollTop;
      }
      const first = g.dataset.on !== 'true';
      if (first) g.style.transition = 'none'; // первый показ — без «полёта» из угла
      g.style.width = el.offsetWidth + 'px';
      g.style.height = el.offsetHeight + 'px';
      g.style.transform = `translate(${x}px, ${y}px)`;
      g.style.setProperty('--gc', getComputedStyle(el).getPropertyValue('--item-color').trim() || '#8da2ff');
      if (first) {
        void g.offsetWidth;
        g.style.transition = '';
        g.dataset.on = 'true';
      }
    };

    // Смена темы круговой волной от кнопки (View Transitions), с запасным вариантом без неё
    const switchTheme = e => {
      const next = theme === 'dark' ? 'light' : 'dark';
      if (reduced || typeof document.startViewTransition !== 'function') {
        setTheme(next);
        return;
      }
      const r = e.currentTarget.getBoundingClientRect(),
        x = r.left + r.width / 2,
        y = r.top + r.height / 2,
        end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      panel.current?.setAttribute('data-vt', '');
      const t = document.startViewTransition(() => new Promise(done => {
        const flush = window.ReactDOM?.flushSync;
        if (flush) flush(() => setTheme(next));else setTheme(next);
        requestAnimationFrame(() => requestAnimationFrame(done));
      }));
      t.ready.then(() => document.documentElement.animate({
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`]
      }, {
        duration: 650,
        easing: 'cubic-bezier(.22,1,.36,1)',
        pseudoElement: '::view-transition-new(root)'
      })).catch(() => {});
      t.finished.finally(() => panel.current?.removeAttribute('data-vt'));
    };
    const name = String(userNickname || user?.displayName || user?.email || 'Гость').trim() || 'Гость';
    const allowed = Array.isArray(allowedModules) ? allowedModules : [];
    const modules = MENU_ITEMS.filter(item => allowed.includes(item.id));
    useEffect(() => {
      if (!show) return;
      setError('');
      setScrolled(false);
      const previous = document.activeElement;
      lockScroll();
      const frame = requestAnimationFrame(() => panel.current?.querySelector('[data-close]')?.focus({ preventScroll: true }));
      const onKey = e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeRef.current();
          return;
        }
        if (e.key !== 'Tab') return;
        const nodes = [...(panel.current?.querySelectorAll('button:not(:disabled),[href],input,[tabindex="0"]') || [])].filter(n => n.getClientRects().length);
        if (!nodes.length) {
          e.preventDefault();
          panel.current?.focus();
          return;
        }
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener('keydown', onKey);

      };
    }, [show]);
    const go = id => {
      setView(view === id ? 'menu' : id);
      onClose();
    };
    const logout = async () => {
      if (busy.current) return;
      busy.current = true;
      setSigningOut(true);
      setError('');
      try {
        if (!window.auth?.signOut) throw Error('auth unavailable');
        await window.auth.signOut();
        onClose();
      } catch {
        setError('Не удалось выйти. Попробуй ещё раз.');
      } finally {
        busy.current = false;
        setSigningOut(false);
      }
    };
    const row = (item, index) => /*#__PURE__*/React.createElement(MenuRow, _extends({
      key: item.id
    }, item, {
      index: index,
      reduced: reduced,
      onHover: moveGlow,
      active: view === item.id,
      onClick: () => go(item.id)
    }));
    return ReactDOM.createPortal(React.createElement(React.Fragment, null, show && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      key: "menu-backdrop",
      className: "ulms-menu-backdrop",
      ref: backdropRef,
      "aria-hidden": "true",
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        background: '#03091680',
        backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
        willChange: 'opacity',
        zIndex: 2000
      }
    }), /*#__PURE__*/React.createElement("aside", {
      key: "menu-panel",
      ref: panel,
      className: "ulms-menu",
      "data-theme": theme === 'light' ? 'light' : 'dark',
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u041C\u0435\u043D\u044E Ultimate LMS",
      tabIndex: -1,
      style: {
        willChange: 'transform'
      }
    }, /*#__PURE__*/React.createElement("header", {
      className: "ulms-menu-header",
      "data-scrolled": scrolled
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-brand"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulms-menu-logo"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
      pathLength: 1,
      strokeLinejoin: "round"
    }))), "ULTIMATE LMS"), /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-tools"
    }, /*#__PURE__*/React.createElement(motion.button, {
      type: "button",
      className: "ulms-menu-tool",
      "aria-label": theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему',
      title: "\u0421\u043C\u0435\u043D\u0438\u0442\u044C \u0442\u0435\u043C\u0443",
      onClick: switchTheme,
      initial: "rest",
      whileHover: reduced ? 'rest' : 'hover'
    }, /*#__PURE__*/React.createElement(AnimatePresence, {
      mode: "wait",
      initial: false
    }, /*#__PURE__*/React.createElement(motion.span, {
      key: theme,
      style: {
        display: 'flex'
      },
      initial: {
        opacity: 0,
        rotate: reduced ? 0 : -60,
        scale: reduced ? 1 : .7
      },
      animate: {
        opacity: 1,
        rotate: 0,
        scale: 1
      },
      exit: {
        opacity: 0,
        rotate: reduced ? 0 : 60,
        scale: reduced ? 1 : .7
      },
      transition: {
        duration: reduced ? 0 : .18
      }
    }, /*#__PURE__*/React.createElement(ThemeIcon, {
      isDark: theme === 'dark'
    })))), /*#__PURE__*/React.createElement(motion.button, {
      type: "button",
      "data-close": true,
      className: "ulms-menu-tool",
      "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E",
      onClick: onClose,
      initial: "rest",
      whileHover: reduced ? 'rest' : 'hover'
    }, /*#__PURE__*/React.createElement(CloseIcon, null)))), /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-body",
      ref: bodyRef,
      onScroll: e => setScrolled(e.currentTarget.scrollTop > 4),
      onPointerLeave: () => moveGlow(null),
      onBlur: e => {
        if (!e.currentTarget.contains(e.relatedTarget)) moveGlow(null);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "ulms-menu-glow",
      ref: glowRef,
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("section", {
      className: "ulms-menu-profile",
      "aria-label": "\u0410\u043A\u043A\u0430\u0443\u043D\u0442"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-avatar",
      "aria-hidden": "true"
    }, Array.from(name)[0].toUpperCase()), /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-person"
    }, /*#__PURE__*/React.createElement("small", null, isAdmin ? 'Администратор' : 'Учебный профиль'), /*#__PURE__*/React.createElement("strong", {
      title: name
    }, name), user?.email && name !== user.email && /*#__PURE__*/React.createElement("p", {
      title: user.email
    }, user.email)), changeNickname && /*#__PURE__*/React.createElement(motion.button, {
      type: "button",
      className: "ulms-menu-edit",
      "aria-label": "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043D\u0438\u043A\u043D\u0435\u0439\u043C",
      title: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043D\u0438\u043A\u043D\u0435\u0439\u043C",
      onClick: changeNickname,
      initial: "rest",
      whileHover: reduced ? 'rest' : 'hover'
    }, /*#__PURE__*/React.createElement(PencilIcon, null))), modules.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-caption",
      style: {
        '--i': 0
      }
    }, "\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435"), /*#__PURE__*/React.createElement("nav", {
      className: "ulms-menu-list",
      "aria-label": "\u0423\u0447\u0435\u0431\u043D\u044B\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B"
    }, modules.map(row))), (allowed.includes('stats') || allowed.includes('chat')) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-caption",
      style: {
        '--i': 4.5
      }
    }, "\u041C\u043E\u0451 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E"), /*#__PURE__*/React.createElement("nav", {
      className: "ulms-menu-list",
      "aria-label": "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0438 \u043E\u0431\u0449\u0435\u043D\u0438\u0435"
    }, allowed.includes('stats') && row({
      id: 'stats',
      label: 'Статистика',
      hint: 'Результаты и достижения',
      Icon: StatsIcon,
      color: '#fb923c'
    }, 5), allowed.includes('chat') && /*#__PURE__*/React.createElement(MenuRow, {
      id: "chat",
      label: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F",
      hint: "\u041E\u0431\u0449\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435",
      Icon: ChatIcon,
      color: "#2dd4bf",
      index: 6,
      reduced: reduced,
      onHover: moveGlow,
      onClick: () => {
        setIsChatOpen(true);
        onClose();
      }
    }))), isAdmin && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "ulms-menu-caption",
      style: {
        '--i': 6.5
      }
    }, "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435"), row({
      id: 'admin',
      label: 'Панель администратора',
      hint: 'Пользователи и доступы',
      Icon: ShieldIcon,
      color: '#fb7185'
    }, 7)), !modules.length && !allowed.includes('stats') && !allowed.includes('chat') && !isAdmin && /*#__PURE__*/React.createElement("p", {
      className: "ulms-menu-empty"
    }, "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C, \u043A\u043E\u0433\u0434\u0430 \u043F\u0440\u0435\u043F\u043E\u0434\u0430\u0432\u0430\u0442\u0435\u043B\u044C \u043E\u0442\u043A\u0440\u043E\u0435\u0442 \u043A \u043D\u0438\u043C \u0434\u043E\u0441\u0442\u0443\u043F.")), /*#__PURE__*/React.createElement("footer", {
      className: "ulms-menu-footer"
    }, error && /*#__PURE__*/React.createElement("p", {
      className: "ulms-menu-error",
      role: "alert"
    }, error), /*#__PURE__*/React.createElement(motion.button, {
      type: "button",
      className: "ulms-menu-logout",
      onClick: logout,
      disabled: signingOut,
      "data-busy": signingOut,
      initial: "rest",
      whileHover: reduced ? 'rest' : 'hover'
    }, /*#__PURE__*/React.createElement(LogoutIcon, null), signingOut ? 'Выходим…' : 'Выйти из аккаунта'))))), document.body);
  };
  Object.assign(window, {
    SidebarMenu
  });
})();
