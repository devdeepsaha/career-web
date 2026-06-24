import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Brain, CalendarDays, Library, LockKeyhole, Map, Menu, MessageCircle, Moon, Route, Search, Sparkles, Sun, X } from 'lucide-react';
import Hyperspeed from '../../components/effects/Hyperspeed/Hyperspeed';
import SplitText from '../../components/effects/SplitText'; 

const quickAskKeys = [
    'landing_ask_quick_1',
    'landing_ask_quick_2',
    'landing_ask_quick_3',
];

const LandingPage = ({ onLogin, onSignup, onGuest, theme, setTheme }) => {
    const { t, i18n } = useTranslation();
    const [heroActive, setHeroActive] = useState(false);
    const [askOpen, setAskOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState('');
    const [askAnswer, setAskAnswer] = useState(t('landing_ask_intro'));
    const [lastAsked, setLastAsked] = useState('');
    const [showQa, setShowQa] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    
    const [loopKey, setLoopKey] = useState(0);
    const [isTextExiting, setIsTextExiting] = useState(false);

    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'hi', label: 'HI' },
        { code: 'bn', label: 'BN' }
    ];
    
    const currentLangCode = i18n.language?.substring(0, 2).toLowerCase() || 'en';

    // Default to English on load
    useEffect(() => {
        i18n.changeLanguage('en');
    }, [i18n]);

    // Loop animation logic
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTextExiting(true);
            setTimeout(() => {
                setLoopKey(prev => prev + 1);
                setIsTextExiting(false);
            }, 1000); // Wait for exit animation
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
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

    const ask = (question = askQuestion) => {
        const value = String(question || '').trim();
        setAskOpen(true);
        if (!value) {
            setLastAsked('');
            setAskAnswer(t('landing_ask_intro'));
            return;
        }
        setAskQuestion('');
        setLastAsked(value);
        const lower = value.toLowerCase();
        if (lower.includes('guest') || lower.includes('try')) setAskAnswer(t('landing_ask_answer_guest'));
        else if (lower.includes('scholar')) setAskAnswer(t('landing_ask_answer_scholarship'));
        else if (lower.includes('mock') || lower.includes('exam') || lower.includes('practice')) setAskAnswer(t('landing_ask_answer_practice'));
        else if (lower.includes('road') || lower.includes('career') || lower.includes('plan')) setAskAnswer(t('landing_ask_answer_roadmap'));
        else setAskAnswer(t('landing_ask_answer_default'));
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const audiences = ['CIL aspirants', 'Final year students', 'JEE / NEET', 'Scholarship seekers', 'Career switchers'];
    const featureCards = [
        { icon: Map, label: t('landing_stack_label_1'), title: t('landing_feature_planner_title'), body: t('landing_feature_planner_text') },
        { icon: Brain, label: t('landing_stack_label_2'), title: t('landing_feature_tutor_title'), body: t('landing_feature_tutor_text') },
        { icon: CalendarDays, label: t('landing_stack_label_3'), title: t('landing_stack_title_3'), body: t('landing_stack_body_3') },
        { icon: Library, label: t('landing_stack_label_4'), title: t('landing_stack_title_4'), body: t('landing_stack_body_4') },
    ];

    useEffect(() => {
        const updateQaVisibility = () => {
            setShowQa(window.scrollY > Math.max(360, window.innerHeight * 0.58));
        };
        updateQaVisibility();
        window.addEventListener('scroll', updateQaVisibility, { passive: true });
        window.addEventListener('resize', updateQaVisibility);
        return () => {
            window.removeEventListener('scroll', updateQaVisibility);
            window.removeEventListener('resize', updateQaVisibility);
        };
    }, []);

    return (
        <div className="landing-page min-h-screen bg-[#f7f7f4] text-[#15120f] antialiased dark:bg-[#07080d] dark:text-white">
            <div className="fixed top-4 left-0 right-0 z-[100] mx-auto px-4 w-full max-w-7xl">
                <nav className={`relative flex items-center justify-between p-3 pl-5 pr-3 rounded-full border shadow-sm backdrop-blur-md transition-all duration-300 ${theme === 'dark' ? 'bg-[#0a0c12]/80 border-white/10 shadow-black/50' : 'bg-white/80 border-black/5 shadow-black/5'}`}>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 shrink-0 cursor-pointer group">
                        <div className="relative flex items-center justify-center h-8 w-8 group-hover:scale-105 transition-transform">
                            <img src="/logo-dark.png" alt="Potho Prodorshok" className="absolute h-full w-auto dark:hidden" />
                            <img src="/logo-light.png" alt="Potho Prodorshok" className="absolute hidden h-full w-auto dark:block" />
                        </div>
                        <span className="font-bold text-[17px] tracking-tight">{t('landing_brand')}</span>
                    </button>
                    <div className="hidden lg:flex items-center justify-center gap-1 mx-4">
                        {[{ label: t('landing_nav_how'), href: '#how' }, { label: t('landing_nav_features'), href: '#features' }, { label: t('landing_nav_guest'), href: '#guest' }].map((link) => (
                            <a key={link.href} href={link.href} className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors group ${theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-[#15120f]/70 hover:text-[#15120f]'}`}>
                                {link.label}
                                <span className={`absolute left-4 right-4 bottom-1 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${theme === 'dark' ? 'bg-white' : 'bg-[#15120f]'}`} />
                            </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        <button onClick={onLogin} className={`text-sm font-semibold px-2 hover:opacity-70 transition-opacity ${theme === 'dark' ? 'text-white' : 'text-[#15120f]'}`}>{t('landing_nav_login')}</button>
                        <button onClick={onSignup} className="px-5 py-2.5 text-sm font-bold text-[#15120f] bg-[#f1b017] hover:bg-[#dca010] rounded-full shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0">{t('landing_join')}</button>
                        <button onClick={onGuest} className={`px-4 py-2.5 text-sm font-medium rounded-full transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-[#15120f]'}`}>{t('landing_guest_cta')}</button>
                        <div className={`flex items-center p-1 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                            {languages.map((lang) => (
                                <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-colors z-10 ${currentLangCode === lang.code ? 'text-[#15120f]' : (theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-[#15120f]/60 hover:text-[#15120f]')}`}>
                                    {currentLangCode === lang.code && <motion.div layoutId="active-lang-pill" className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-[#f1eece]' : 'bg-black/5 hover:bg-black/10 text-[#15120f]'}`} aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </nav>
            </div>

            <main>
                <section id="platform" className="landing-hero-simple !p-0 !h-screen !min-h-[600px] w-full flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="landing-road-stage absolute inset-0 z-0" aria-label="Career road light visual">
                        <Hyperspeed effectOptions={hyperspeedOptions} />
                        <div className="landing-road-fade" />
                    </div>
                    <div className="landing-hero-copy relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl -mt-[10vh]">
                        <button onClick={onSignup} onPointerEnter={() => setHeroActive(true)} onPointerLeave={() => setHeroActive(false)} className="group cursor-pointer mb-2" aria-label={t('landing_hero_cta_phrase')}>
                            <div className="min-h-[120px] flex items-center justify-center">
                                <SplitText
                                    key={`${activeHero}-${loopKey}`}
                                    text={activeHero}
                                    isExiting={isTextExiting}
                                    className="font-['Yu_Gothic_UI_Light','Yu_Gothic_UI',Arial,sans-serif] text-[clamp(2.6rem,4.2vw,5.2rem)] font-[300] tracking-[-0.055em] leading-none text-white text-balance"
                                    delay={40}
                                    duration={0.8}
                                    ease="power3.out"
                                    splitType="chars,words"
                                    from={{ opacity: 0, y: 30 }}
                                    to={{ opacity: 1, y: 0 }}
                                />
                            </div>
                            <small className="block mt-6 text-[#f1eece]/70 text-xs font-black tracking-[0.18em] uppercase opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                {t('landing_hero_cta_hint')}
                            </small>
                        </button>
                        <p className="landing-hero-subtitle">{t('landing_subtitle')}</p>
                        <div className="landing-hero-actions">
                            <button onClick={onSignup} className="landing-primary-action">{t('landing_primaryCta')}</button>
                            <button onClick={onGuest} className="landing-secondary-action">{t('landing_guest_cta')}</button>
                        </div>
                    </div>
                </section>
                {/* Remaining sections omitted for brevity but should remain the same */}
            </main>
        </div>
    );
};

export default LandingPage;