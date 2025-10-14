import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';

const Sidebar = ({ 
  isOpen, 
  onClose,
  onOpen,
  onNavigate, 
  currentUser, 
  onLogout, 
  showAuth,
  position = 'left',
  colors = ['#B19EEF', '#5227FF'],
  accentColor = '#5227FF',
  menuButtonColor = '#111',
  showMenuButton = true,
  theme = 'light',
  menuButtonColorDark = '#FFF',
  colorsDark = ['#3730a3', '#111827']
}) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);
  const toggleBtnRef = useRef(null);
  const closeIconRef = useRef(null);
  const busyRef = useRef(false);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const itemEntranceTweenRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    toggleMenu();
  };

  // Sync with external isOpen prop
  useEffect(() => {
    if (typeof isOpen === 'boolean' && isOpen !== open) {
      setOpen(isOpen);
      openRef.current = isOpen;
      if (isOpen) {
        playOpen();
        animateIcon(true);
        animateColor(true);
        animateText(true);
      } else {
        playClose();
        animateIcon(false);
        animateColor(false);
        animateText(false);
      }
    }
  }, [isOpen]);

  // MODIFIED: This effect now ONLY handles the initial positioning.
  // It runs just once when the component mounts (or if `position` changes).
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, [position]);

  // ADDED: A new, separate effect to handle dynamic color changes for the theme.
  // This prevents the positioning logic from being reverted on theme changes.
  useLayoutEffect(() => {
    if (toggleBtnRef.current) {
      const isCurrentlyOpen = openRef.current;
      const openColor = theme === 'dark' ? '#ef4444' : '#991b1b';
      const closedColor = theme === 'dark' ? menuButtonColorDark : menuButtonColor;
      const targetColor = isCurrentlyOpen ? openColor : closedColor;
      gsap.set(toggleBtnRef.current, { color: targetColor });
    }
  }, [theme, menuButtonColor, menuButtonColorDark, open]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sidebar-item-label'));
    const numberEls = Array.from(panel.querySelectorAll('.sidebar-item-number'));

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });
    
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;
    
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );
      
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            opacity: 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sidebar-item-label'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sidebar-item-number'));
        if (numberEls.length) {
          gsap.set(numberEls, { opacity: 0 });
        }
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    const closeIcon = closeIconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      if (closeIcon) {
        gsap.to(closeIcon, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.3);
      }
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
    } else {
      if (closeIcon) {
        gsap.to(closeIcon, { opacity: 0, duration: 0.2, ease: 'power2.in' });
      }
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      const initialColor = theme === 'dark' ? menuButtonColorDark : menuButtonColor;
      const openColor = theme === 'dark' ? '#ef4444' : '#991b1b';
      const targetColor = opening ? openColor : initialColor;

      colorTweenRef.current = gsap.to(btn, {
        color: targetColor,
        delay: 0.18,
        duration: 0.3,
        ease: 'power2.out'
      });
    },
    [menuButtonColor, theme, menuButtonColorDark]
  );

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    // When using the internal toggle, we must also update the external state
    // if `onOpen` or `onClose` are provided, as they likely control the `isOpen` prop.
    if (target && onOpen) onOpen();
    if (!target && onClose) onClose();

    // If the component is uncontrolled, update internal state directly.
    if (typeof isOpen !== 'boolean') {
      openRef.current = target;
      setOpen(target);
    }

    if (target) {
      playOpen();
    } else {
      playClose();
    }
    
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onClose, onOpen, isOpen]);

  const handleNavClick = (page) => {
    if (onNavigate) onNavigate(page);
    toggleMenu();
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    toggleMenu();
  };

  const handleShowAuth = (type) => {
    if (showAuth) showAuth(type);
    toggleMenu();
  };

  const handleOverlayClick = () => {
    toggleMenu();
  };

  const currentColors = theme === 'dark' ? colorsDark : colors;

  return (
    <>
      {showMenuButton && (
        <button
          ref={toggleBtnRef}
          onClick={toggleMenu}
          className="sidebar-toggle-external"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          type="button"
        >
          <span className="sidebar-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sidebar-toggle-textInner">
              {textLines.map((l, i) => (
                <span key={i} className="sidebar-toggle-line">{l}</span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sidebar-icon" aria-hidden="true">
            <span ref={plusHRef} className="sidebar-icon-line" />
            <span ref={plusVRef} className="sidebar-icon-line sidebar-icon-line-v" />
          </span>
        </button>
      )}
      
      <style>{`
        .sidebar-wrapper {
          --sidebar-bg: #ffffff;
          --sidebar-text: #000000;
          --sidebar-login-bg: #111827;
          --sidebar-login-text: #ffffff;
          --sidebar-login-hover-bg: #1f2937;
          --sidebar-logout-bg: #dc2626;
          --sidebar-logout-hover-bg: #b91c1c;
          --sidebar-logout-text: #ffffff;
        }

        .sidebar-wrapper[data-theme='dark'] {
          --sidebar-bg: #111827;
          --sidebar-text: #ffffff;
          --sidebar-login-bg: #f3f4f6;
          --sidebar-login-text: #111827;
          --sidebar-login-hover-bg: #e5e7eb;
          --sidebar-logout-bg: #ef4444;
          --sidebar-logout-hover-bg: #dc2626;
          --sidebar-logout-text: #ffffff;
        }

        .sidebar-toggle-external {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 500;
          line-height: 1;
          pointer-events: auto;
          overflow: visible;
          transition: color 0.3s ease;
          position: relative;
          z-index: 110;
        }

        .sidebar-toggle-external:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
          border-radius: 4px;
        }

        .sidebar-toggle-textWrap {
          position: relative;
          display: inline-block;
          height: 1em;
          overflow: hidden;
          white-space: nowrap;
        }

        .sidebar-toggle-textInner {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .sidebar-toggle-line {
          display: block;
          height: 1em;
          line-height: 1;
        }

        .sidebar-icon {
          position: relative;
          width: 14px;
          height: 14px;
          flex: 0 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        .sidebar-icon-line {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transform: translate(-50%, -50%);
          will-change: transform;
        }

        .sidebar-icon-line-v {
          transform: translate(-50%, -50%) rotate(90deg);
        }

        .sidebar-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 100;
          pointer-events: none;
          overflow: hidden;
        }

        .sidebar-wrapper[data-open] {
          pointer-events: auto;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 5;
        }

        .sidebar-wrapper[data-open] .sidebar-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar-panel {
          position: absolute;
          top: 0;
          left: 0;
          width: clamp(260px, 38vw, 420px);
          height: 100%;
          background: var(--sidebar-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          padding: 6em 2em 2em 2em;
          overflow-y: auto;
          z-index: 10;
        }

        [data-position='right'] .sidebar-panel {
          left: auto;
          right: 0;
        }

        .sm-prelayers {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: clamp(260px, 38vw, 420px);
          pointer-events: none;
          z-index: 5;
        }

        [data-position='right'] .sm-prelayers {
          left: auto;
          right: 0;
        }

        .sm-prelayer {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          transform: translateX(0);
        }

        .sidebar-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .sidebar-item-wrap {
          position: relative;
          overflow: hidden;
          line-height: 1;
          padding: 0.35em 0;
        }

        .sidebar-item {
          position: relative;
          display: block;
          padding: 0.5rem 1rem;
          font-size: 4rem;
          font-weight: 900;
          color: var(--sidebar-text);
          text-decoration: none;
          border-radius: 0;
          transition: all 0.3s ease;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          line-height: 0.95;
        }

        .sidebar-item:hover {
          color: var(--sm-accent, #5227FF);
        }

        .sidebar-item-label {
          display: inline-block;
          will-change: transform;
          transform-origin: 50% 100%;
        }

        .sidebar-item:hover .sidebar-item-label {
          transform: translateX(8px);
        }

        .sidebar-item-number {
          position: absolute;
          top: 0.5rem;
          right: 1rem;
          font-size: 1.25rem;
          font-weight: 400;
          color: var(--sm-accent, #5227FF);
          letter-spacing: 0;
          opacity: 0;
        }

        .sidebar-auth-section {
          margin-top: auto;
          padding-top: 2rem;
        }

        .sidebar-logout-btn {
          width: 100%;
          background: var(--sidebar-logout-bg);
          color: var(--sidebar-logout-text);
          font-weight: 600;
          padding: 0.875rem 1.5rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sidebar-logout-btn:hover {
          background: var(--sidebar-logout-hover-bg);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .sidebar-login-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .sidebar-login-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, #6366f1, #ec4899, #fbbf24);
          border-radius: 0.5rem;
          filter: blur(12px);
          opacity: 0.6;
          transition: opacity 1s;
        }

        .sidebar-login-wrapper:hover .sidebar-login-glow {
          opacity: 1;
          transition: opacity 0.2s;
        }

        .sidebar-login-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 2.75rem;
          padding: 0 2rem;
          background: var(--sidebar-login-bg);
          color: var(--sidebar-login-text);
          font-weight: 600;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-login-btn:hover {
          background: var(--sidebar-login-hover-bg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .sidebar-login-arrow {
          margin-left: 0.5rem;
          margin-top: 0.125rem;
          width: 10px;
          height: 10px;
          stroke: var(--sidebar-login-text);
          stroke-width: 2;
          fill: none;
        }

        .sidebar-login-arrow-path1 {
          opacity: 0;
          transition: opacity 0.3s;
        }

        .sidebar-login-btn:hover .sidebar-login-arrow-path1 {
          opacity: 1;
        }

        .sidebar-login-arrow-path2 {
          transition: transform 0.3s;
        }

        .sidebar-login-btn:hover .sidebar-login-arrow-path2 {
          transform: translateX(3px);
        }

        @media (max-width: 1024px) {
          .sidebar-panel,
          .sm-prelayers {
            width: 100%;
          }
          
          .sidebar-item {
            font-size: 3rem;
          }
        }

        @media (max-width: 640px) {
          .sidebar-item {
            font-size: 2.5rem;
          }
        }
      `}</style>

      <div
        className="sidebar-wrapper"
        style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
        data-position={position}
        data-open={open || undefined}
        data-theme={theme}
      >
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>

        <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
          {(() => {
            const raw = currentColors && currentColors.length ? currentColors.slice(0, 4) : [];
            let arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
          })()}
        </div>

        {open && (
          <button
            className="sidebar-close-btn"
            aria-label="Close menu"
            onClick={toggleMenu}
            type="button"
          >
            <span className="sidebar-close-text">Close</span>
            <span ref={closeIconRef} className="sidebar-close-icon" aria-hidden="true">
              <span className="sidebar-close-icon-h" />
              <span className="sidebar-close-icon-v" />
            </span>
          </button>
        )}

        <aside ref={panelRef} className="sidebar-panel" aria-hidden={!open}>
          <div className="sidebar-inner">
            <div className="sidebar-section">
              <div className="sidebar-item-wrap">
                <button onClick={() => handleNavClick('team')} className="sidebar-item">
                  <span className="sidebar-item-label">{t('nav.team')}</span>
                  <span className="sidebar-item-number">01</span>
                </button>
              </div>
              <div className="sidebar-item-wrap">
                <button onClick={() => handleNavClick('support')} className="sidebar-item">
                  <span className="sidebar-item-label">{t('nav.support')}</span>
                  <span className="sidebar-item-number">02</span>
                </button>
              </div>
              <div className="sidebar-item-wrap">
                <button onClick={() => handleNavClick('policies')} className="sidebar-item">
                  <span className="sidebar-item-label">{t('nav.policies')}</span>
                  <span className="sidebar-item-number">03</span>
                </button>
              </div>
            </div>

            <div className="sidebar-section" style={{ marginTop: '3rem' }}>
              <div className="sidebar-item-wrap">
                <button onClick={() => changeLanguage('en')} className="sidebar-item" style={{ fontSize: '2rem' }}>
                  <span className="sidebar-item-label">English</span>
                  <span className="sidebar-item-number">EN</span>
                </button>
              </div>
              <div className="sidebar-item-wrap">
                <button onClick={() => changeLanguage('hi')} className="sidebar-item" style={{ fontSize: '2rem' }}>
                  <span className="sidebar-item-label">हिन्दी</span>
                  <span className="sidebar-item-number">HI</span>
                </button>
              </div>
              <div className="sidebar-item-wrap">
                <button onClick={() => changeLanguage('bn')} className="sidebar-item" style={{ fontSize: '2rem' }}>
                  <span className="sidebar-item-label">বাংলা</span>
                  <span className="sidebar-item-number">BN</span>
                </button>
              </div>
            </div>

            <div className="sidebar-auth-section">
              {currentUser ? (
                <button onClick={handleLogout} className="sidebar-logout-btn">
                  {t('auth.logout')}
                </button>
              ) : (
                <div className="sidebar-login-wrapper">
                  <div className="sidebar-login-glow"></div>
                  <button onClick={() => handleShowAuth('login')} className="sidebar-login-btn">
                    {t('auth.getStarted')}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 10 10"
                      className="sidebar-login-arrow"
                    >
                      <path d="M0 5h7" className="sidebar-login-arrow-path1"></path>
                      <path d="M1 1l4 4-4 4" className="sidebar-login-arrow-path2"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;