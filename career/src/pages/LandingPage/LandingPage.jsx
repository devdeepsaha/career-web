import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Brain, CalendarDays, Library, LockKeyhole, Map, MessageCircle, Moon, Route, Search, Sparkles, Sun } from 'lucide-react';
import Hyperspeed from '../../components/effects/Hyperspeed/Hyperspeed';

const quickAskKeys = [
    'landing_ask_quick_1',
    'landing_ask_quick_2',
    'landing_ask_quick_3',
];

const LandingPage = ({ onLogin, onSignup, onGuest, theme, setTheme, currentLanguage = 'en', onLanguageChange }) => {
    const { t } = useTranslation();
    const [heroActive, setHeroActive] = useState(false);
    const [askOpen, setAskOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState('');
    const [askAnswer, setAskAnswer] = useState(t('landing_ask_intro'));

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
            setAskAnswer(t('landing_ask_intro'));
            return;
        }

        setAskQuestion('');
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

    return (
        <div className="landing-page min-h-screen bg-[#f7f7f4] text-[#15120f] antialiased dark:bg-[#07080d] dark:text-white">
            <header className="landing-pill-nav">
                <button className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src="/logo-dark.png" alt="Potho Prodorshok" className="h-9 w-auto dark:hidden" />
                    <img src="/logo-light.png" alt="Potho Prodorshok" className="hidden h-9 w-auto dark:block" />
                    <span>{t('landing_brand')}</span>
                </button>

                <nav className="landing-nav-links" aria-label="Landing navigation">
                    <a href="#platform">{t('landing_nav_platform')}</a>
                    <a href="#how">{t('landing_nav_how')}</a>
                    <a href="#features">{t('landing_nav_features')}</a>
                    <a href="#guest">{t('landing_nav_guest')}</a>
                </nav>

                <div className="landing-nav-actions">
                    <button onClick={onLogin} className="landing-login-link">{t('landing_nav_login')}</button>
                    <button onClick={onSignup} className="landing-start-button">{t('landing_getStarted')}</button>
                    <button onClick={onGuest} className="landing-guest-pill">{t('landing_guest_cta')}</button>
                    <div className="landing-language-switch" aria-label={t('sidebar_language')}>
                        {[
                            ['en', 'EN'],
                            ['hi', 'HI'],
                            ['bn', 'BN'],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => onLanguageChange?.(value)}
                                className={currentLanguage === value ? 'is-active' : ''}
                                type="button"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <button onClick={toggleTheme} className="landing-theme-button" aria-label="Toggle theme">
                        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </button>
                </div>
            </header>

            <main>
                <section id="platform" className="landing-hero-simple">
                    <div className="landing-hero-copy">
                        <p className="landing-hero-kicker">{t('landing_eyebrow')}</p>
                        <button
                            onClick={onSignup}
                            onPointerEnter={() => setHeroActive(true)}
                            onPointerLeave={() => setHeroActive(false)}
                            onFocus={() => setHeroActive(true)}
                            onBlur={() => setHeroActive(false)}
                            className="landing-puzzle-phrase"
                            aria-label={t('landing_hero_cta_phrase')}
                        >
                            <span key={activeHero}>
                                {activeHero.split(' ').map((word, index) => (
                                    <span className="landing-puzzle-word" style={{ '--word-delay': `${index * 42}ms` }} key={`${word}-${index}`}>
                                        {word}
                                    </span>
                                ))}
                            </span>
                            <small>{t('landing_hero_cta_hint')}</small>
                        </button>
                        <p className="landing-hero-subtitle">{t('landing_subtitle')}</p>
                        <div className="landing-hero-actions">
                            <button onClick={onSignup} className="landing-primary-action">{t('landing_primaryCta')}</button>
                            <button onClick={onGuest} className="landing-secondary-action">{t('landing_guest_cta')}</button>
                        </div>
                    </div>

                    <div className="landing-road-stage" aria-label="Career road light visual">
                        <Hyperspeed effectOptions={hyperspeedOptions} />
                        <div className="landing-road-fade" />
                    </div>
                </section>

                <section className="landing-audience-strip" aria-label={t('landing_audience_label')}>
                    <span>{t('landing_audience_label')}</span>
                    {audiences.map((item) => <strong key={item}>{item}</strong>)}
                </section>

                <section id="how" className="landing-workflow-section">
                    <p className="landing-section-kicker">{t('landing_pathway_eyebrow')}</p>
                    <h2>{t('landing_workflow_title')}</h2>
                    <div className="landing-workflow-tabs">
                        {[t('landing_workflow_tab_1'), t('landing_workflow_tab_2'), t('landing_workflow_tab_3'), t('landing_workflow_tab_4')].map((item, index) => (
                            <button className={index === 0 ? 'is-active' : ''} key={item}>{item}</button>
                        ))}
                    </div>
                    <div className="landing-workflow-grid">
                        <article>
                            <Route className="h-5 w-5" />
                            <h3>{t('landing_workflow_card_1_title')}</h3>
                            <p>{t('landing_workflow_card_1_body')}</p>
                        </article>
                        <article>
                            <Sparkles className="h-5 w-5" />
                            <h3>{t('landing_workflow_card_2_title')}</h3>
                            <p>{t('landing_workflow_card_2_body')}</p>
                        </article>
                    </div>
                </section>

                <section id="features" className="landing-scroll-stack">
                    <div className="landing-stack-intro">
                        <p className="landing-section-kicker">{t('landing_features_eyebrow')}</p>
                        <h2>{t('landing_features_title')}</h2>
                    </div>
                    <div className="landing-stack-list">
                        {featureCards.map((card, index) => (
                            <article className="landing-stack-card" style={{ '--stack-index': index }} key={card.title}>
                                <div>
                                    <span>{card.label}</span>
                                    <h3>{card.title}</h3>
                                </div>
                                <p>{card.body}</p>
                                {React.createElement(card.icon, { className: 'h-6 w-6' })}
                            </article>
                        ))}
                    </div>
                </section>

                <section id="guest" className="landing-guest-section">
                    <div>
                        <p className="landing-section-kicker">{t('landing_guest_label')}</p>
                        <h2>{t('landing_guest_title')}</h2>
                        <p>{t('landing_guest_body')}</p>
                    </div>
                    <div className="landing-guest-card">
                        <div className="landing-guest-lock">
                            <LockKeyhole className="h-5 w-5" />
                        </div>
                        <ul>
                            <li>{t('landing_guest_free_1')}</li>
                            <li>{t('landing_guest_free_2')}</li>
                            <li>{t('landing_guest_locked_1')}</li>
                        </ul>
                        <button onClick={onGuest}>{t('landing_guest_cta')}</button>
                    </div>
                </section>
            </main>

            <div className={`landing-qa-ai ${askOpen ? 'is-open' : ''}`}>
                {askOpen && (
                    <div className="landing-qa-panel">
                        <div className="landing-qa-header">
                            <span><MessageCircle className="h-4 w-4" /></span>
                            <div>
                                <strong>{t('landing_ask_title')}</strong>
                                <small>{t('landing_ask_subtitle')}</small>
                            </div>
                            <button onClick={() => setAskOpen(false)} aria-label="Close QA Ai">×</button>
                        </div>
                        <p className="landing-qa-answer">{askAnswer}</p>
                        <div className="landing-qa-chips">
                            {quickAskKeys.map((key) => (
                                <button key={key} onClick={() => ask(t(key))}>{t(key)}</button>
                            ))}
                        </div>
                    </div>
                )}
                <form
                    className="landing-qa-bar"
                    onSubmit={(event) => {
                        event.preventDefault();
                        ask();
                    }}
                >
                    <Search className="h-5 w-5 shrink-0" />
                    <input value={askQuestion} onFocus={() => setAskOpen(true)} onChange={(event) => setAskQuestion(event.target.value)} placeholder={t('landing_ask_placeholder')} />
                    <button type="submit" aria-label={t('landing_ask_submit')}><ArrowUp className="h-5 w-5" /></button>
                </form>
            </div>
        </div>
    );
};

export default LandingPage;
