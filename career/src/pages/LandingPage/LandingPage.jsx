import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpenCheck, Bot, Brain, GraduationCap, Map, MessageSquare, Moon, Route, Search, Sparkles, Sun, Trophy, X } from 'lucide-react';
import Hyperspeed from '../../components/effects/Hyperspeed/Hyperspeed';

const quickAskKeys = [
    'landing_ask_quick_1',
    'landing_ask_quick_2',
    'landing_ask_quick_3',
];

const LandingPage = ({ onLogin, onSignup, theme, setTheme, currentLanguage = 'en', onLanguageChange }) => {
    const { t } = useTranslation();
    const [ctaActive, setCtaActive] = useState(false);
    const [askOpen, setAskOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState('');
    const [askAnswer, setAskAnswer] = useState(t('landing_ask_intro'));

    const hyperspeedOptions = useMemo(() => ({
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
            sticks: 0xf1eece
        }
    }), []);

    const activeLine = ctaActive ? t('landing_hero_cta_phrase') : t('landing_hero_phrase');
    const stackCards = [
        {
            icon: Map,
            label: t('landing_stack_label_1'),
            title: t('landing_feature_planner_title'),
            body: t('landing_feature_planner_text'),
            stat: t('landing_stat_roadmaps'),
        },
        {
            icon: Brain,
            label: t('landing_stack_label_2'),
            title: t('landing_feature_tutor_title'),
            body: t('landing_feature_tutor_text'),
            stat: t('landing_stat_practice'),
        },
        {
            icon: Trophy,
            label: t('landing_stack_label_3'),
            title: t('landing_stack_title_3'),
            body: t('landing_stack_body_3'),
            stat: t('landing_stat_scholarships'),
        },
        {
            icon: BookOpenCheck,
            label: t('landing_stack_label_4'),
            title: t('landing_stack_title_4'),
            body: t('landing_stack_body_4'),
            stat: t('landing_stack_stat_4'),
        },
    ];

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const ask = (question = askQuestion) => {
        const value = String(question || '').trim();
        if (!value) {
            setAskOpen(true);
            setAskAnswer(t('landing_ask_intro'));
            return;
        }
        setAskOpen(true);
        setAskQuestion('');
        const lower = value.toLowerCase();
        if (lower.includes('scholar')) setAskAnswer(t('landing_ask_answer_scholarship'));
        else if (lower.includes('mock') || lower.includes('exam') || lower.includes('practice')) setAskAnswer(t('landing_ask_answer_practice'));
        else if (lower.includes('road') || lower.includes('career') || lower.includes('plan')) setAskAnswer(t('landing_ask_answer_roadmap'));
        else setAskAnswer(t('landing_ask_answer_default'));
    };

    return (
        <div className="min-h-screen bg-[#f6f7f4] text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
            <section className="relative min-h-[100svh] overflow-hidden bg-black text-white">
                <Hyperspeed effectOptions={hyperspeedOptions} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(125,13,27,0.16),rgba(0,0,0,0.2)_34%,rgba(0,0,0,0.78)_78%)]" />
                <div className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black via-black/60 to-transparent" />

                <header className="relative z-20 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button className="flex min-w-0 items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-light.png" alt="Potho Prodorshok" className="h-9 w-auto shrink-0" />
                        <span className="hidden text-sm font-bold tracking-tight text-white sm:block">{t('landing_brand')}</span>
                    </button>

                    <nav className="hidden items-center gap-6 text-sm font-semibold text-white/72 md:flex">
                        <a href="#platform" className="transition-colors duration-150 hover:text-white">{t('landing_nav_platform')}</a>
                        <a href="#features" className="transition-colors duration-150 hover:text-white">{t('landing_nav_features')}</a>
                        <a href="#pathway" className="transition-colors duration-150 hover:text-white">{t('landing_nav_pathway')}</a>
                        <button onClick={onLogin} className="transition-colors duration-150 hover:text-white">{t('landing_nav_login')}</button>
                    </nav>

                    <div className="flex items-center gap-2">
                        <div className="grid grid-cols-3 rounded-full border border-white/15 bg-white/8 p-0.5 backdrop-blur" aria-label={t('sidebar_language')}>
                            {[
                                ['en', 'EN'],
                                ['hi', 'हिं'],
                                ['bn', 'বা'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => onLanguageChange?.(value)}
                                    className={`h-8 min-w-8 rounded-full px-2 text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                                        currentLanguage === value ? 'bg-white text-slate-950' : 'text-white/70 hover:text-white'
                                    }`}
                                    type="button"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur transition-[background-color,transform] duration-150 hover:bg-white/16 active:scale-[0.96] sm:flex"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </button>
                    </div>
                </header>

                <div id="platform" className="relative z-10 mx-auto flex min-h-[calc(100svh-80px)] w-full max-w-7xl flex-col items-center justify-center px-4 pb-28 pt-10 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f1eece] backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-[#ff102a]" />
                        {t('landing_eyebrow')}
                    </div>

                    <button
                        onClick={onSignup}
                        onPointerEnter={() => setCtaActive(true)}
                        onPointerLeave={() => setCtaActive(false)}
                        onFocus={() => setCtaActive(true)}
                        onBlur={() => setCtaActive(false)}
                        className={`landing-hero-phrase-action ${ctaActive ? 'is-cta' : ''}`}
                        aria-label={t('landing_hero_cta_phrase')}
                    >
                        <span className="landing-hero-phrase-stage" key={activeLine}>
                            <span className="landing-hero-phrase" aria-label={activeLine}>
                                {activeLine.split('').map((char, index) => (
                                    <span
                                        aria-hidden="true"
                                        className="landing-hero-char"
                                        style={{ '--char-delay': `${index * 28}ms` }}
                                        key={`${char}-${index}`}
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </span>
                                ))}
                            </span>
                        </span>
                        <span className="landing-hero-cta-hint">{t('landing_hero_cta_hint')}</span>
                    </button>

                    <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-200 sm:text-lg">
                        {t('landing_subtitle')}
                    </p>

                    <div className="landing-mobile-cta mt-8 flex w-full max-w-sm flex-col gap-3 sm:hidden">
                        <button onClick={onSignup} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f1eece] px-6 text-sm font-black text-slate-950 shadow-xl shadow-red-950/30 transition-[background-color,transform] duration-150 active:scale-[0.96]">
                            {t('landing_primaryCta')}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button onClick={onLogin} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-bold text-white backdrop-blur transition-[background-color,transform] duration-150 active:scale-[0.96]">
                            {t('landing_secondaryCta')}
                        </button>
                    </div>

                    <div className="absolute inset-x-4 bottom-5 grid gap-2 text-left text-xs text-white/78 sm:grid-cols-3 md:inset-x-8">
                        {[
                            [t('landing_stat_roadmaps'), Route],
                            [t('landing_stat_practice'), Sparkles],
                            [t('landing_stat_scholarships'), GraduationCap]
                        ].map(([label, Icon]) => (
                            <div key={label} className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-black/38 px-3 py-2 backdrop-blur-md">
                                {React.createElement(Icon, { className: 'h-4 w-4 shrink-0 text-[#f1eece]' })}
                                <span className="min-w-0 truncate font-semibold">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a90519] dark:text-[#f1eece]">{t('landing_features_eyebrow')}</p>
                            <h2 className="mt-3 max-w-xl text-balance text-3xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-5xl">{t('landing_features_title')}</h2>
                        </div>
                        <p className="max-w-2xl text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">{t('landing_pathway_text')}</p>
                    </div>

                    <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            [t('landing_feature_planner_title'), t('landing_feature_planner_text'), Map],
                            [t('landing_feature_tutor_title'), t('landing_feature_tutor_text'), Brain],
                            [t('landing_feature_scholarship_title'), t('landing_feature_scholarship_text'), GraduationCap],
                            [t('landing_feature_chats_title'), t('landing_feature_chats_text'), MessageSquare]
                        ].map(([title, text, Icon]) => (
                            <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
                                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-[#f1eece] dark:bg-white dark:text-[#a90519]">
                                    {React.createElement(Icon, { className: 'h-5 w-5' })}
                                </div>
                                <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pathway" className="px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a90519] dark:text-[#f1eece]">{t('landing_pathway_eyebrow')}</p>
                        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-5xl">{t('landing_stack_heading')}</h2>
                    </div>
                    <div className="scroll-stack-scroller">
                        <div className="scroll-stack-inner">
                            {stackCards.map((card, index) => (
                                <div className="scroll-stack-card-wrapper" key={card.label}>
                                    <article className="scroll-stack-card" style={{ '--stack-index': index }}>
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[#f1eece] dark:bg-white dark:text-[#a90519]">
                                                {React.createElement(card.icon, { className: 'h-6 w-6' })}
                                            </div>
                                            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-950">{card.label}</span>
                                        </div>
                                        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-end">
                                            <div>
                                                <p className="text-sm font-semibold text-[#a90519] dark:text-[#f1eece]">{card.stat}</p>
                                                <h3 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-5xl">{card.title}</h3>
                                            </div>
                                            <p className="max-w-2xl text-pretty text-base leading-7 text-slate-600 dark:text-slate-400">{card.body}</p>
                                        </div>
                                    </article>
                                </div>
                            ))}
                            <div className="scroll-stack-end" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#f1eece] dark:text-[#a90519]">{t('landing_stack_final_label')}</p>
                        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-[-0.01em]">{t('landing_stack_final_title')}</h2>
                    </div>
                    <button onClick={onSignup} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f1eece] px-6 text-sm font-black text-slate-950 transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.96] dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800">
                        {t('landing_primaryCta')}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>

            <div className={`landing-ask-widget ${askOpen ? 'is-open' : ''}`}>
                {askOpen && (
                    <div className="landing-ask-panel">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-[#f1eece] dark:bg-white dark:text-[#a90519]"><Bot className="h-4 w-4" /></span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{t('landing_ask_title')}</p>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t('landing_ask_subtitle')}</p>
                                </div>
                            </div>
                            <button onClick={() => setAskOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:hover:bg-slate-900" aria-label="Close ask widget">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-3">
                            <div className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">{askAnswer}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {quickAskKeys.map((key) => (
                                    <button key={key} onClick={() => ask(t(key))} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                                        {t(key)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <form
                    className="landing-ask-bar"
                    onSubmit={(event) => {
                        event.preventDefault();
                        ask();
                    }}
                >
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input value={askQuestion} onFocus={() => setAskOpen(true)} onChange={(event) => setAskQuestion(event.target.value)} placeholder={t('landing_ask_placeholder')} />
                    <button type="submit" aria-label={t('landing_ask_submit')}><ArrowRight className="h-4 w-4" /></button>
                </form>
            </div>
        </div>
    );
};

export default LandingPage;
