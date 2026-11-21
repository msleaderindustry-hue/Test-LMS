// --- UI COMPONENTS ---

const GooeyText = ({ texts, morphTime = 1, cooldownTime = 0.5, style }) => {
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  useEffect(() => {
    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    const setMorph = (fraction) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        fraction = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex % texts.length];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [texts, morphTime, cooldownTime]);

  return (
    <div style={{ position: 'relative', height: '60px', ...style }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: "url(#threshold)", display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <span
          ref={text1Ref}
          style={{
            position: 'absolute', display: 'inline-block', userSelect: 'none', textAlign: 'center',
            fontSize: '32px', fontWeight: 'bold', background: 'var(--primary-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}
        />
        <span
          ref={text2Ref}
          style={{
            position: 'absolute', display: 'inline-block', userSelect: 'none', textAlign: 'center',
            fontSize: '32px', fontWeight: 'bold', background: 'var(--primary-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}
        />
      </div>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', style, className }) => {
  const vars = {
    primary: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
    green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    teal: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    red: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    orange: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    muted: 'rgba(0,0,0,0.05)'
  };
  
  let color = 'white';
  if(variant === 'muted') { color = 'var(--text-main)'; vars.muted = 'rgba(128,128,128,0.15)'; }
  if(variant === 'red') color = '#9f1239';
  if(variant === 'orange') color = '#9a3412';
  if(variant === 'green') color = '#064e3b';

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: vars[variant] || vars.primary,
        color: color,
        borderRadius: '14px', 
        padding: '0 20px', 
        fontWeight: 700, fontSize: '15px', width: '100%',
        boxShadow: '0 4px 6px rgba(50,50,93,0.11)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginTop: '0', marginBottom: '0',
        ...style
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const Input = (props) => (
  <input 
    {...props}
    style={{
      width: '100%', padding: '0 18px', borderRadius: '14px',
      border: '2px solid transparent', 
      background: 'var(--input-bg)', 
      color: 'var(--text-main)', 
      fontSize: '16px', fontWeight: 500, marginBottom: '12px', marginTop: '8px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
      transition: 'all 0.3s', 
      ...props.style
    }}
  />
);

// --- СВЯЗЬ ФАЙЛОВ ---
Object.assign(window, { GooeyText, Button, Input });