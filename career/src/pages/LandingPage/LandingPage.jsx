import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, GraduationCap, Map, Moon, Route, Sparkles, Sun, Trophy } from 'lucide-react';
import Hyperspeed from '../../components/effects/Hyperspeed/Hyperspeed';

const LandingPage = ({ onLogin, onSignup, theme, setTheme, currentLanguage = 'en', onLanguageChange }) => {
    const { t } = useTranslation();
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

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-[#f7f9fb] text-slate-950 dark:bg-slate-950 dark:text-white">
            <section className="relative min-h-[92vh] overflow-hidden bg-black text-white">
                <Hyperspeed effectOptions={hyperspeedOptions} />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 " />

                <header className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
                    <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-light.png" alt="Potho Prodorshok" className="h-9 w-auto" />
                        <span className="text-lg font-bold tracking-tight sm:text-xl">{t('landing_brand')}</span>
                    </button>

                    <nav className="hidden items-center gap-7 text-sm font-semibold text-white/78 md:flex">
                        <a href="#features" className="transition hover:text-white">{t('landing_nav_features')}</a>
                        <a href="#pathway" className="transition hover:text-white">{t('landing_nav_pathway')}</a>
                        <button onClick={onLogin} className="transition hover:text-white">{t('landing_nav_login')}</button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="grid grid-cols-3 rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur" aria-label={t('sidebar_language')}>
                            {[
                                ['en', 'EN'],
                                ['hi', 'हिं'],
                                ['bn', 'বা'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => onLanguageChange?.(value)}
                                    className={`h-9 min-w-9 rounded-full px-2 text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                                        currentLanguage === value
                                            ? 'bg-white text-slate-950'
                                            : 'text-white/75 hover:text-white'
                                    }`}
                                    type="button"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:flex"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={onSignup}
                            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-cyan-100"
                        >
                            {t('landing_getStarted')}
                        </button>
                    </div>
                </header>

                <div className="relative z-10 mx-auto flex min-h-[calc(92vh-80px)] w-full max-w-7xl flex-col justify-center px-5 pb-24 pt-10 md:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-cyan-300" />
                            {t('landing_eyebrow')}
                        </div>

                        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-normal sm:text-6xl lg:text-7xl">
                            {t('landing_headline_1')}
                            <span className="block text-[#f1eece]">{t('landing_headline_2')}</span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                            {t('landing_subtitle')}
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={onSignup}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-white"
                            >
                                {t('landing_primaryCta')}
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onLogin}
                                className="inline-flex items-center justify-center rounded-full border border-white/24 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18"
                            >
                                {t('landing_secondaryCta')}
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 grid max-w-7xl grid-cols-1 gap-3 text-sm text-white/84 sm:absolute sm:bottom-5 sm:left-5 sm:right-5 sm:mx-auto sm:mt-0 sm:grid-cols-3 md:left-8 md:right-8">
                        {[
                            [t('landing_stat_roadmaps'), Route],
                            [t('landing_stat_practice'), BookOpen],
                            [t('landing_stat_scholarships'), Trophy]
                        ].map(([label, Icon]) => (
                            <div key={label} className="flex items-center gap-3 rounded-lg border border-white/12 bg-black/30 px-4 py-3 backdrop-blur">
                                {React.createElement(Icon, { className: 'h-5 w-5 text-cyan-200' })}
                                <span className="font-semibold">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="features" className="bg-[#f7f9fb] px-5 py-16 dark:bg-slate-950 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 max-w-2xl">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">{t('landing_features_eyebrow')}</p>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">{t('landing_features_title')}</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            [t('landing_feature_planner_title'), t('landing_feature_planner_text'), Map],
                            [t('landing_feature_tutor_title'), t('landing_feature_tutor_text'), Sparkles],
                            [t('landing_feature_scholarship_title'), t('landing_feature_scholarship_text'), GraduationCap],
                            [t('landing_feature_chats_title'), t('landing_feature_chats_text'), BookOpen]
                        ].map(([title, text, Icon]) => (
                            <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-cyan-200 dark:bg-cyan-300 dark:text-slate-950">
                                    {React.createElement(Icon, { className: 'h-5 w-5' })}
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pathway" className="bg-white px-5 py-16 dark:bg-slate-900 md:px-8">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">{t('landing_pathway_eyebrow')}</p>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">{t('landing_pathway_title')}</h2>
                        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                            {t('landing_pathway_text')}
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-[#f7f9fb] p-5 dark:border-slate-800 dark:bg-slate-950">
                        {[t('landing_step_1'), t('landing_step_2'), t('landing_step_3')].map((step, index) => (
                            <div key={step} className="flex gap-4 border-b border-slate-200 py-5 last:border-0 dark:border-slate-800">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white dark:bg-cyan-300 dark:text-slate-950">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-950 dark:text-white">{step}</h3>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('landing_step_caption')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
