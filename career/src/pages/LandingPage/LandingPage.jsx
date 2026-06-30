import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../../components/shared/BrandLogo';
import { throttle } from '../../utils/timing';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
const Hyperspeed = React.lazy(() => import('../../components/effects/Hyperspeed/Hyperspeed'));

const quickAskKeys = [
    'landing_ask_quick_1',
    'landing_ask_quick_2',
    'landing_ask_quick_3',
];

const iconPaths = {
    arrowUp: ['M12 19V5', 'M5 12l7-7 7 7'],
    brain: ['M9.5 2a3.5 3.5 0 0 0-3.4 2.7A3.8 3.8 0 0 0 3 8.5c0 1 .4 1.9 1 2.6A4 4 0 0 0 8 18h1', 'M14.5 2a3.5 3.5 0 0 1 3.4 2.7A3.8 3.8 0 0 1 21 8.5c0 1-.4 1.9-1 2.6A4 4 0 0 1 16 18h-1', 'M12 2v20', 'M8 8h3', 'M13 8h3', 'M8 13h3', 'M13 13h3'],
    calendar: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01'],
    library: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z', 'M8 6h8', 'M8 10h8'],
    lock: ['M7 11V8a5 5 0 0 1 10 0v3', 'M5 11h14v10H5z', 'M12 15v2'],
    map: ['M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z', 'M9 3v15', 'M15 6v15'],
    menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
    message: ['M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z'],
    moon: ['M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z'],
    route: ['M4 5a3 3 0 1 0 0 6c2.5 0 4-2 8-2s5.5 2 8 2a3 3 0 1 0 0-6c-2.5 0-4 2-8 2S6.5 5 4 5z', 'M4 11v8', 'M20 11v8'],
    search: ['M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z', 'M21 21l-4.35-4.35'],
    sparkles: ['M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z', 'M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z', 'M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z'],
    sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M4.93 19.07l1.41-1.41', 'M17.66 6.34l1.41-1.41'],
    x: ['M18 6L6 18', 'M6 6l12 12'],
};

const LandingIcon = ({ name, className = 'h-5 w-5', strokeWidth = 2 }) => (
    <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {(iconPaths[name] || iconPaths.sparkles).map((path) => (
            <path key={path} d={path} />
        ))}
    </svg>
);

const HeroPhrase = ({ text }) => (
    <span className="landing-hero-title font-['Yu_Gothic_UI_Light','Yu_Gothic_UI',Arial,sans-serif] text-[clamp(2.6rem,4.2vw,5.2rem)] font-light tracking-[-0.055em] text-white text-balance motion-reduce:animate-none">
        {text}
    </span>
);

const LandingPage = ({ onLogin, onSignup, onGuest, theme, setTheme }) => {
    const { t, i18n } = useTranslation();
    
    // UI State
    const [heroActive, setHeroActive] = useState(false);
    const [askOpen, setAskOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState('');
    const [showQa, setShowQa] = useState(false);
    const [showRoad, setShowRoad] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [activeWorkflowTab, setActiveWorkflowTab] = useState(0);
    
    // Chat State
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', text: t('landing_ask_intro') }
    ]);
    const [isAskThinking, setIsAskThinking] = useState(false);
    const chatEndRef = useRef(null);

    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'hi', label: 'HI' },
        { code: 'bn', label: 'BN' }
    ];

    const currentLangCode = i18n.language?.substring(0, 2).toLowerCase() || 'en';

    // CHANGED: Smart Language Persistence using localStorage
    useEffect(() => {
        // Check if the user has a saved language from a previous visit
        const savedLang = localStorage.getItem('potho_preferred_lang');
        
        if (savedLang) {
            // If they have a saved language, respect it (don't force English)
            if (i18n.language !== savedLang) {
                i18n.changeLanguage(savedLang);
            }
        } else {
            // If it's their very first time here, default to English
            i18n.changeLanguage('en');
            localStorage.setItem('potho_preferred_lang', 'en');
        }
    }, [i18n]);

    useEffect(() => {
        const motionRoadQuery = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
        let idleId;
        let timer;

        const show = () => {
            if (motionRoadQuery.matches) setShowRoad(true);
        };

        const schedule = () => {
            setShowRoad(false);
            window.clearTimeout(timer);
            if (idleId) window.cancelIdleCallback?.(idleId);
            if (!motionRoadQuery.matches) return;

            timer = window.setTimeout(() => {
                if ('requestIdleCallback' in window) {
                    idleId = window.requestIdleCallback(show, { timeout: 3500 });
                } else {
                    show();
                }
            }, 3500);
        };

        schedule();
        motionRoadQuery.addEventListener('change', schedule);

        return () => {
            window.clearTimeout(timer);
            if (idleId) window.cancelIdleCallback?.(idleId);
            motionRoadQuery.removeEventListener('change', schedule);
        };
    }, []);

    // Auto-scroll AI chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, askOpen]);

    // Handle Scrolling for QA AI bubble visibility
    useEffect(() => {
        const updateQaVisibility = () => {
            setShowQa(window.scrollY > Math.max(360, window.innerHeight * 0.58));
        };
        const throttledVisibility = throttle(updateQaVisibility, 100);
        updateQaVisibility();
        window.addEventListener('scroll', throttledVisibility, { passive: true });
        window.addEventListener('resize', throttledVisibility);
        return () => {
            window.removeEventListener('scroll', throttledVisibility);
            window.removeEventListener('resize', throttledVisibility);
        };
    }, []);

    // CHANGED: Update i18n AND save the choice to localStorage so it survives a refresh
    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem('potho_preferred_lang', langCode);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const activeHero = heroActive ? t('landing_hero_cta_phrase') : t('landing_hero_phrase');
    
    const hyperspeedOptions = {
        distortion: 'xyDistortion',
        length: 400,
        roadWidth: 9,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 90,
        fovSpeedUp: 150,
        speedUp: 3,
        carLightsFade: 0.4,
        totalSideLightSticks: 50,
        lightPairsPerRoadWay: 30,
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,
        lightStickWidth: [0.02, 0.05],
        lightStickHeight: [0.3, 0.7],
        movingAwaySpeed: [20, 50],
        movingCloserSpeed: [-150, -230],
        carLightsLength: [400 * 0.05, 400 * 0.2],
        carLightsRadius: [0.03, 0.08],
        carWidthPercentage: [0.1, 0.5],
        carShiftX: [-0.5, 0.5],
        carFloorSeparation: [0, 0.1],
        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
            leftCars: [0x7d0d1b, 0xa90519, 0xff102a],
            rightCars: [0xf1eece, 0xe6e2b1, 0xdfd98a],
            sticks: 0xf1eece,
        },
    };

    const localLandingAnswer = (value) => {
        const lower = value.toLowerCase();
        if (lower.includes('guest') || lower.includes('try')) return t('landing_ask_answer_guest');
        if (lower.includes('scholar')) return t('landing_ask_answer_scholarship');
        if (lower.includes('mock') || lower.includes('exam') || lower.includes('practice')) return t('landing_ask_answer_practice');
        if (lower.includes('road') || lower.includes('career') || lower.includes('plan')) return t('landing_ask_answer_roadmap');
        return t('landing_ask_answer_default');
    };

    const ask = async (question = askQuestion) => {
        const value = String(question || '').trim();
        setAskOpen(true);
        if (!value || isAskThinking) return;

        setAskQuestion('');
        setChatHistory(prev => [
            ...prev,
            { role: 'user', text: value },
        ]);
        setIsAskThinking(true);

        try {
            const response = await fetch(`${API_URL}/landing-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: value,
                    language: i18n.language,
                }),
            });
            if (!response.ok) throw new Error('Landing AI failed');
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'bot', text: data.answer || localLandingAnswer(value) }]);
        } catch (error) {
            console.error('Landing AI fallback:', error);
            setChatHistory(prev => [...prev, { role: 'bot', text: localLandingAnswer(value) }]);
        } finally {
            setIsAskThinking(false);
        }
    };

    const audiences = ['CIL aspirants', 'Final year students', 'JEE / NEET', 'Scholarship seekers', 'Career switchers'];
    
    const workflowSteps = [
        { id: 'roadmap', title: t('landing_workflow_card_1_title'), body: t('landing_workflow_card_1_body'), icon: 'route' },
        { id: 'practice', title: t('landing_workflow_card_2_title'), body: t('landing_workflow_card_2_body'), icon: 'sparkles' },
        { id: 'measure', title: t('landing_stack_title_3'), body: t('landing_stack_body_3'), icon: 'brain' },
        { id: 'library', title: t('landing_stack_title_4'), body: t('landing_stack_body_4'), icon: 'library' },
    ];

    const featureCards = [
        { icon: 'map', label: t('landing_stack_label_1'), title: t('landing_feature_planner_title'), body: t('landing_feature_planner_text') },
        { icon: 'brain', label: t('landing_stack_label_2'), title: t('landing_feature_tutor_title'), body: t('landing_feature_tutor_text') },
        { icon: 'calendar', label: t('landing_stack_label_3'), title: t('landing_stack_title_3'), body: t('landing_stack_body_3') },
        { icon: 'library', label: t('landing_stack_label_4'), title: t('landing_stack_title_4'), body: t('landing_stack_body_4') },
    ];

    return (
        <div className="landing-page min-h-screen bg-[#f7f7f4] text-[#15120f] antialiased dark:bg-[#07080d] dark:text-white">
            
            {/* Nav Header */}
            <div className="fixed top-4 left-0 right-0 z-[100] mx-auto px-4 w-full max-w-7xl">
                <nav className={`flex items-center justify-between p-3 pl-5 pr-3 rounded-full border shadow-sm backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${theme === 'dark' ? 'bg-[#0a0c12]/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3" aria-label="Back to top">
                        <BrandLogo />
                        <span className="font-bold text-[17px] tracking-tight">{t('landing_brand')}</span>
                    </button>

                    <div className="hidden lg:flex items-center gap-1">
                        {[{ label: t('landing_nav_how'), href: '#how' }, { label: t('landing_nav_features'), href: '#features' }, { label: t('landing_nav_guest'), href: '#guest' }].map((link) => (
                            <a key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium rounded-full opacity-70 hover:opacity-100 transition-opacity">{link.label}</a>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        <button onClick={onLogin} className="text-sm font-semibold px-3">{t('landing_nav_login')}</button>
                        <button onClick={onSignup} className="px-5 py-2.5 text-sm font-bold bg-[#f1b017] text-[#15120f] rounded-full min-w-[140px] h-[45px]">
                            {t('landing_join')}
                        </button>
                        <button onClick={onGuest} className="px-4 py-2.5 text-sm font-medium bg-black/5 dark:bg-white/10 rounded-full min-w-[140px] h-[45px]">
                            {t('landing_guest_cta')}
                        </button>
                        
                        <div className={`flex items-center p-1 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                            {languages.map((lang) => (
                                <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-colors z-10 ${currentLangCode === lang.code ? 'text-[#15120f]' : (theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-[#15120f]/60 hover:text-[#15120f]')}`}>
                                    {currentLangCode === lang.code && <span className="absolute inset-0 rounded-full bg-white shadow-sm -z-10" />}
                                    {lang.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={toggleTheme} className="p-3 rounded-full bg-black/5 dark:bg-white/10" aria-label="Toggle theme">{theme === 'dark' ? <LandingIcon name="sun" className="h-4 w-4" /> : <LandingIcon name="moon" className="h-4 w-4" />}</button>
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            onClick={toggleTheme}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 transition-[background-color,transform] duration-150 active:scale-[0.96] dark:bg-white/10"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            type="button"
                        >
                            {theme === 'dark' ? <LandingIcon name="sun" className="h-4 w-4" /> : <LandingIcon name="moon" className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 transition-[background-color,transform] duration-150 active:scale-[0.96] dark:bg-white/10"
                            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                            type="button"
                        >
                            {mobileNavOpen ? <LandingIcon name="x" className="h-5 w-5" /> : <LandingIcon name="menu" className="h-5 w-5" />}
                        </button>
                    </div>
                </nav>

                {mobileNavOpen && (
                        <div className="absolute top-20 left-4 right-4 z-50 mt-2 rounded-3xl border border-black/5 bg-white p-4 shadow-xl transition-[opacity,transform] duration-200 dark:border-white/10 dark:bg-[#0c101c] lg:hidden">
                            <div className="flex flex-col gap-2">
                                {[{ label: t('landing_nav_how'), href: '#how' }, { label: t('landing_nav_features'), href: '#features' }, { label: t('landing_nav_guest'), href: '#guest' }].map((link) => (
                                    <a key={link.href} href={link.href} onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base font-medium rounded-xl opacity-80 hover:bg-black/5 dark:hover:bg-white/10">
                                        {link.label}
                                    </a>
                                ))}
                                
                                <div className="h-px w-full my-2 bg-black/5 dark:bg-white/10" />
                                
                                <div className="flex justify-between items-center px-4 py-2">
                                    <span className="text-sm font-medium opacity-60">Language</span>
                                    <div className="flex gap-2 p-1 rounded-full bg-black/5 dark:bg-white/10">
                                        {languages.map(lang => (
                                            <button key={`mob-${lang.code}`} onClick={() => handleLanguageChange(lang.code)} className={`px-3 py-1 text-xs font-bold rounded-full ${currentLangCode === lang.code ? 'bg-white text-black shadow-sm' : 'opacity-60'}`}>
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px w-full my-2 bg-black/5 dark:bg-white/10" />

                                <button onClick={onLogin} className="w-full py-3 font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded-xl">{t('landing_nav_login')}</button>
                                <button onClick={onSignup} className="w-full py-3 font-bold bg-[#f1b017] text-black rounded-xl">{t('landing_join')}</button>
                                <button onClick={onGuest} className="w-full py-3 font-medium bg-black/5 dark:bg-white/10 rounded-xl">{t('landing_guest_cta')}</button>
                            </div>
                        </div>
                    )}
            </div>

            <main>
                {/* Hero Section */}
                <section id="platform" className="landing-hero-simple !p-0 !h-[100svh] !min-h-[600px] w-full flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="landing-road-stage absolute inset-0 z-0">
                        <div className="landing-mobile-road" aria-hidden="true" />
                        {showRoad && (
                            <React.Suspense fallback={null}>
                                <Hyperspeed effectOptions={hyperspeedOptions} />
                            </React.Suspense>
                        )}
                        <div className="landing-road-fade" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl -mt-[10vh] w-full">
                        <button onClick={onSignup} onPointerEnter={() => setHeroActive(true)} onPointerLeave={() => setHeroActive(false)} className="group cursor-pointer mb-6" aria-label={t('landing_hero_cta_phrase')}>
                            <div className="min-h-[120px] flex items-center justify-center">
                                <HeroPhrase key={activeHero} text={activeHero} />
                            </div>
                            <small className="block mt-6 text-[#f1eece]/70 text-xs font-black tracking-[0.18em] uppercase opacity-0 translate-y-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                {t('landing_hero_cta_hint')}
                            </small>
                        </button>
                        
                        <p className="max-w-2xl text-[clamp(1rem,1.45vw,1.35rem)] text-white/70 mb-8 px-4 text-balance">{t('landing_subtitle')}</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-6">
                            <button onClick={onSignup} className="landing-primary-action w-full sm:w-auto flex items-center justify-center min-w-[200px] !min-h-[56px] m-0 !transform-none">
                                {t('landing_primaryCta')}
                            </button>
                            <button onClick={onGuest} className="landing-secondary-action w-full sm:w-auto flex items-center justify-center min-w-[200px] !min-h-[56px] m-0 !transform-none bg-white/10 text-white dark:bg-white/10 dark:text-white border border-white/10">
                                {t('landing_guest_cta')}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="flex overflow-x-auto gap-8 md:gap-16 px-6 py-8 border-y border-black/5 dark:border-white/10 whitespace-nowrap scrollbar-hide items-center justify-start md:justify-center">
                    <span className="text-[#15120f]/60 dark:text-white/60 font-medium">{t('landing_audience_label')}</span>
                    {audiences.map((item) => <strong key={item} className="text-xl md:text-2xl font-bold">{item}</strong>)}
                </section>

                {/* Workflow Section */}
                <section id="how" className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
                    <p className="text-[#8a4e00] dark:text-[#f1eece] text-xs font-black tracking-widest uppercase mb-4">{t('landing_pathway_eyebrow')}</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance mb-12">{t('landing_workflow_title')}</h2>

                    <div className="hidden md:flex flex-col items-center">
                        <div className="flex bg-[#15120f] dark:bg-white p-2 rounded-2xl w-full max-w-3xl mb-6">
                            {workflowSteps.map((step, idx) => (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveWorkflowTab(idx)}
                                    className={`flex-1 py-4 px-6 text-sm font-bold rounded-xl transition-colors ${activeWorkflowTab === idx ? 'bg-white text-black dark:bg-[#07080d] dark:text-white' : 'text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black'}`}
                                >
                                    {t(`landing_workflow_tab_${idx + 1}`)}
                                </button>
                            ))}
                        </div>
                        <div
                            key={activeWorkflowTab}
                            className="w-full max-w-3xl rounded-3xl border border-black/5 bg-white/90 p-8 text-left shadow-xl transition-[opacity,transform] duration-200 dark:border-white/10 dark:bg-white/5"
                        >
                            <LandingIcon name={workflowSteps[activeWorkflowTab].icon} className="mb-4 h-8 w-8" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">{workflowSteps[activeWorkflowTab].title}</h3>
                            <p className="text-black/60 dark:text-white/60 leading-relaxed">{workflowSteps[activeWorkflowTab].body}</p>
                        </div>
                    </div>

                    <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
                        {workflowSteps.map((step) => (
                            <div key={step.id} className="min-w-[85vw] snap-center bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 text-left shadow-lg flex flex-col justify-start">
                                <LandingIcon name={step.icon} className="mb-4 h-8 w-8" />
                                <h3 className="text-xl font-black tracking-tight mb-2">{step.title}</h3>
                                <p className="text-black/60 dark:text-white/60 leading-relaxed text-sm">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full max-w-6xl mx-auto px-4 py-20 pb-32">
                    <div className="text-center mb-16">
                        <p className="text-[#8a4e00] dark:text-[#f1eece] text-xs font-black tracking-widest uppercase mb-4">{t('landing_features_eyebrow')}</p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance">{t('landing_features_title')}</h2>
                    </div>
                    <div className="flex flex-col gap-6">
                        {featureCards.map((card, index) => (
                            <article className="sticky flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-end min-h-[auto] md:min-h-[260px] p-6 md:p-12 bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl shadow-xl backdrop-blur-md" style={{ top: `calc(112px + ${index * 12}px)` }} key={card.title}>
                                <div className="flex-1">
                                    <span className="text-[#8a4e00] dark:text-[#f1eece] text-xs font-black tracking-widest uppercase mb-2 block">{card.label}</span>
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">{card.title}</h3>
                                </div>
                                <p className="flex-1 text-black/60 dark:text-white/60 leading-relaxed text-sm md:text-base">{card.body}</p>
                                <div className="hidden md:block">
                                    <LandingIcon name={card.icon} className="h-8 w-8" />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Guest Section */}
                <section id="guest" className="w-full max-w-6xl mx-auto px-4 pb-32 flex flex-col md:flex-row gap-12 items-center md:items-end">
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-[#8a4e00] dark:text-[#f1eece] text-xs font-black tracking-widest uppercase mb-4">{t('landing_guest_label')}</p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance mb-6">{t('landing_guest_title')}</h2>
                        <p className="text-black/60 dark:text-white/60 leading-relaxed max-w-xl mx-auto md:mx-0">{t('landing_guest_body')}</p>
                    </div>
                    <div className="w-full md:w-[400px] bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-xl">
                        <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                            <LandingIcon name="lock" className="h-6 w-6" />
                        </div>
                        <ul className="flex flex-col gap-4 mb-8 text-black/60 dark:text-white/60">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-current"></span>{t('landing_guest_free_1')}</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-current"></span>{t('landing_guest_free_2')}</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-current"></span>{t('landing_guest_locked_1')}</li>
                        </ul>
                        <button onClick={onGuest} className="w-full py-4 font-bold bg-[#15120f] text-white dark:bg-white dark:text-[#15120f] rounded-full transition-transform hover:scale-[0.98]">
                            {t('landing_guest_cta')}
                        </button>
                    </div>
                </section>
            </main>

            {/* QA AI Container */}
            <div className={`fixed left-1/2 bottom-4 z-50 w-[calc(100vw-24px)] md:w-full max-w-3xl -translate-x-1/2 transition-[opacity,transform,visibility] duration-300 ${askOpen ? 'translate-y-0 opacity-100 visible' : showQa ? 'translate-y-0 opacity-100 visible' : 'translate-y-8 opacity-0 invisible'} pointer-events-auto`}>
                {askOpen && (
                    <div className="mb-4 bg-white/95 dark:bg-[#0f111a]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center gap-4 p-4 md:p-5 border-b border-black/5 dark:border-white/10">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-200 to-amber-400 text-black shadow-inner">
                                <LandingIcon name="message" className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <strong className="block text-base">{t('landing_ask_title')}</strong>
                                <small className="block text-xs opacity-60">{t('landing_ask_subtitle')}</small>
                            </div>
                            <button onClick={() => setAskOpen(false)} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors" aria-label="Close QA AI">
                                <LandingIcon name="x" className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4 p-4 md:p-5 max-h-[40vh] md:max-h-[300px] overflow-y-auto scrollbar-hide">
                            {chatHistory.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed
                                        ${msg.role === 'bot' 
                                            ? 'bg-black/5 dark:bg-white/10 self-start rounded-bl-sm' 
                                            : 'bg-[#3f3f48] text-white self-end rounded-br-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isAskThinking && (
                                <div className="max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed bg-black/5 dark:bg-white/10 self-start rounded-bl-sm">
                                    QA AI is thinking...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="flex gap-2 overflow-x-auto p-4 md:px-5 pb-5 scrollbar-hide">
                            {quickAskKeys.map((key) => (
                                <button key={key} disabled={isAskThinking} onClick={() => ask(t(key))} className="whitespace-nowrap px-4 py-2 text-sm font-bold bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full shadow-sm hover:shadow-md transition-[box-shadow,opacity,transform] disabled:opacity-50">
                                    {t(key)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form className="flex items-center gap-3 p-2 pl-6 bg-white/95 dark:bg-[#0c101c]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-2xl" onSubmit={(e) => { e.preventDefault(); ask(); }}>
                    <LandingIcon name="search" className="h-5 w-5 shrink-0 opacity-50" />
                    <input 
                        value={askQuestion} 
                        onFocus={() => setAskOpen(true)} 
                        onChange={(e) => setAskQuestion(e.target.value)} 
                        placeholder={t('landing_ask_placeholder')} 
                        className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder-black/40 dark:placeholder-white/40"
                    />
                    <button type="submit" disabled={isAskThinking} aria-label={t('landing_ask_submit')} className="w-12 h-12 shrink-0 bg-black/5 dark:bg-white/10 hover:bg-[#f1b017] hover:text-black dark:hover:bg-[#f1b017] dark:hover:text-black rounded-full flex items-center justify-center transition-colors disabled:opacity-50">
                        <LandingIcon name="arrowUp" className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LandingPage;
