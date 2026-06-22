import React, { useMemo } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Map, Moon, Route, Sparkles, Sun, Trophy } from 'lucide-react';
import Hyperspeed from '../../components/effects/Hyperspeed/Hyperspeed';

const LandingPage = ({ onLogin, onSignup, theme, setTheme }) => {
    const hyperspeedOptions = useMemo(() => ({
        distortion: 'turbulentDistortion',
        length: 420,
        roadWidth: 9,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 88,
        fovSpeedUp: 140,
        speedUp: 2.3,
        carLightsFade: 0.45,
        totalSideLightSticks: 34,
        lightPairsPerRoadWay: 34,
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.08,
        brokenLinesLengthPercentage: 0.55,
        lightStickWidth: [0.08, 0.24],
        lightStickHeight: [0.8, 1.5],
        movingAwaySpeed: [45, 70],
        movingCloserSpeed: [-110, -170],
        carLightsLength: [14, 80],
        carLightsRadius: [0.04, 0.1],
        carWidthPercentage: [0.25, 0.45],
        carShiftX: [-0.45, 0.45],
        carFloorSeparation: [0, 1.5],
        colors: {
            roadColor: 0x06070b,
            islandColor: 0x10131a,
            background: 0x02040a,
            shoulderLines: 0xe8eefc,
            brokenLines: 0x8fb7ff,
            leftCars: [0xf43f5e, 0xfb7185, 0xf59e0b],
            rightCars: [0x22d3ee, 0x38bdf8, 0x6366f1],
            sticks: 0x22d3ee
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
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3),rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.84))]" />

                <header className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
                    <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-light.png" alt="Potho Prodorshok" className="h-9 w-auto" />
                        <span className="text-lg font-bold tracking-tight sm:text-xl">Potho Prodorshok</span>
                    </button>

                    <nav className="hidden items-center gap-7 text-sm font-semibold text-white/78 md:flex">
                        <a href="#features" className="transition hover:text-white">Features</a>
                        <a href="#pathway" className="transition hover:text-white">Pathway</a>
                        <button onClick={onLogin} className="transition hover:text-white">Log in</button>
                    </nav>

                    <div className="flex items-center gap-3">
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
                            Get Started
                        </button>
                    </div>
                </header>

                <div className="relative z-10 mx-auto flex min-h-[calc(92vh-80px)] w-full max-w-7xl flex-col justify-center px-5 pb-24 pt-10 md:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-cyan-300" />
                            AI-Powered Career Intelligence
                        </div>

                        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-normal sm:text-6xl lg:text-7xl">
                            You dream.
                            <span className="block text-cyan-200">We plan the road.</span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                            Turn skills, interests, exams, and ambition into a clear AI-guided career journey with roadmaps, tutoring, mock tests, and scholarship discovery.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={onSignup}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-white"
                            >
                                Start Your Journey
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onLogin}
                                className="inline-flex items-center justify-center rounded-full border border-white/24 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18"
                            >
                                I Already Have an Account
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 grid max-w-7xl grid-cols-1 gap-3 text-sm text-white/84 sm:absolute sm:bottom-5 sm:left-5 sm:right-5 sm:mx-auto sm:mt-0 sm:grid-cols-3 md:left-8 md:right-8">
                        {[
                            ['Personalized roadmaps', Route],
                            ['AI exam practice', BookOpen],
                            ['Scholarship matches', Trophy]
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
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Precision tools</p>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">Everything students need after the first step.</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Career Planner', 'Generate step-by-step roadmaps from your skills, interests, status, and goals.', Map],
                            ['AI Tutor', 'Practice questions, mock tests, explanations, and performance feedback.', Sparkles],
                            ['Scholarship Finder', 'Discover aid opportunities based on marks, income, region, and destination.', GraduationCap],
                            ['Saved Chats', 'Keep career and doubt-solving conversations organized after login.', BookOpen]
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
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">From dream to dashboard</p>
                        <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">Login once, then enter the full planning workspace.</h2>
                        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                            The landing page introduces the journey. Registration unlocks the current dashboard with the planner, AI tutor, and scholarship finder exactly where your backend already supports them.
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-[#f7f9fb] p-5 dark:border-slate-800 dark:bg-slate-950">
                        {['Create or log into your account', 'Generate your career roadmap', 'Practice, ask doubts, and find scholarships'].map((step, index) => (
                            <div key={step} className="flex gap-4 border-b border-slate-200 py-5 last:border-0 dark:border-slate-800">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white dark:bg-cyan-300 dark:text-slate-950">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-950 dark:text-white">{step}</h3>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">A focused step in the Potho Prodorshok journey.</p>
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
