import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookMarked, CalendarDays, Clock3, Map, MessageSquare, Sparkles, Target, Timer, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const ContinueCard = ({ title, label, detail, action, icon }) => (
    <button onClick={action} className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition-[border-color,background-color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {React.createElement(icon, { className: 'h-4 w-4' })}
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{label || detail}</p>
            </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5" />
    </button>
);

const getPrimaryAction = (summary) => {
    const counts = summary?.counts || {};
    if ((counts.wrong_attempts || 0) > 0) {
        return {
            title: `Review ${counts.wrong_attempts} wrong practice questions`,
            detail: 'Start with mistakes first. That is where the fastest score improvement usually sits.',
            primaryLabel: 'Start review',
            primaryTab: 'library',
            secondaryLabel: 'Practice weak area',
            secondaryTab: 'tutor',
        };
    }
    if (summary?.latest_roadmap) {
        return {
            title: `Continue ${summary.latest_roadmap.title}`,
            detail: 'Pick up the roadmap step you already started instead of creating a new plan.',
            primaryLabel: 'Open roadmap',
            primaryTab: 'planner',
            secondaryLabel: 'Ask AI tutor',
            secondaryTab: 'tutor',
        };
    }
    if (summary?.latest_mock) {
        return {
            title: `Review your ${summary.latest_mock.score}% mock result`,
            detail: 'Use the latest mock to decide what to revise before taking another test.',
            primaryLabel: 'Open mock review',
            primaryTab: 'tutor',
            secondaryLabel: 'Saved library',
            secondaryTab: 'library',
        };
    }
    return {
        title: 'Create your first focused career plan',
        detail: 'Start with one roadmap, then the dashboard can turn your activity into next actions.',
        primaryLabel: 'Create roadmap',
        primaryTab: 'planner',
        secondaryLabel: 'Practice now',
        secondaryTab: 'tutor',
    };
};

const scoreTrend = (summary) => {
    if (!summary?.latest_mock || !summary?.mock_average) return 'Needs data';
    if (summary.latest_mock.score > summary.mock_average) return 'Improving';
    if (summary.latest_mock.score < summary.mock_average) return 'Needs review';
    return 'Stable';
};

const LearningBrief = ({ summary, onNavigate }) => {
    const topics = summary?.topic_insights || [];
    const bestTopic = [...topics].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0];
    const weakTopic = [...topics].sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))[0];
    const actions = summary?.weekly_report?.next_actions?.length
        ? summary.weekly_report.next_actions.slice(0, 3)
        : ['Review due mistakes', 'Take one mock from a weak topic', 'Pin the roadmap you want to execute'];

    return (
        <div className="saas-card p-4">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="saas-section-title">AI report + learning graph</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="saas-meta">Best</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-950 dark:text-white">{bestTopic?.topic || 'Not enough data'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="saas-meta">Weakest</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-950 dark:text-white">{weakTopic?.topic || 'Not enough data'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="saas-meta">Trend</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-950 dark:text-white">{scoreTrend(summary)}</p>
                </div>
            </div>
            {topics.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[bestTopic, weakTopic].filter(Boolean).map((item) => <TopicBar key={`${item.topic}-${item.strength}`} item={item} />)}
                </div>
            )}
            <div className="mt-3 grid gap-2">
                {actions.map((item, index) => (
                    <button key={`${item}-${index}`} onClick={() => onNavigate(index === 0 ? 'library' : 'tutor')} className="group flex min-h-11 items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                        <span className="line-clamp-1">{item}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </button>
                ))}
            </div>
        </div>
    );
};

const InsightCard = ({ title, children, icon }) => (
    <div className="saas-card p-4">
        <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {React.createElement(icon, { className: 'h-4 w-4' })}
            </div>
            <h2 className="saas-section-title">{title}</h2>
        </div>
        {children}
    </div>
);

const TopicBar = ({ item }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.topic}</p>
            <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{item.accuracy}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full ${item.strength === 'strong' ? 'bg-emerald-500' : item.strength === 'improving' ? 'bg-blue-500' : 'bg-rose-500'}`} style={{ width: `${Math.max(8, item.accuracy)}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.attempts} attempts · {item.strength}</p>
    </div>
);

const CompactTimeline = ({ items = [] }) => (
    <div>
        <div className="flex gap-3 overflow-x-auto pb-1">
            {items.slice(0, 5).map((item, index) => (
                <div key={`${item.type}-${index}`} className="min-w-[180px] rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-semibold capitalize text-slate-500 dark:bg-slate-950 dark:text-slate-400">{item.type}</span>
                    </div>
                    <p className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.status || 'active'} {item.date ? `· ${new Date(item.date).toLocaleDateString()}` : ''}</p>
                </div>
            ))}
        </div>
        {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Saved plans, mocks, and applications will form your timeline.</p>}
    </div>
);

const RevisionSummary = ({ items = [], counts = {}, onNavigate }) => {
    const dueToday = items.filter((item) => String(item.due_state || '').toLowerCase().includes('today')).length;
    const overdue = items.filter((item) => String(item.due_state || '').toLowerCase().includes('overdue')).length;

    return (
        <div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{dueToday}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">due today</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{overdue}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">overdue</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{counts.wrong_attempts || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">wrong</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{counts.mastered_questions || 0}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">mastered</p>
                </div>
            </div>
            <div className="mt-3 space-y-2">
                {items.slice(0, 2).map((item, index) => (
                    <div key={`${item.type}-${index}`} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.due_state}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => onNavigate('library')} className="pp-button-secondary mt-3 w-full">Start review</button>
        </div>
    );
};

const MockSnapshot = ({ summary, counts, weakTopic, onNavigate }) => (
    <div className="saas-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Target className="h-4 w-4" />
                </div>
                <h2 className="saas-section-title">Mock snapshot</h2>
            </div>
            <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{counts.mock_tests || 0} tests</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <p className="saas-meta">Average</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{summary?.mock_average || 0}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <p className="saas-meta">Latest</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{summary?.latest_mock?.score ?? 0}%</p>
            </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{weakTopic ? `Weak area: ${weakTopic.topic}` : summary?.latest_mock?.exam || 'Start one focused mock to unlock weakness analysis.'}</p>
        <button onClick={() => onNavigate('tutor')} className="pp-button mt-3 w-full">Open full analysis</button>
    </div>
);

const DashboardPage = ({ onNavigate }) => {
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSummary = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_URL}/dashboard-summary`, { credentials: 'include' });
                if (!response.ok) throw new Error('Unable to load dashboard');
                setSummary(await response.json());
            } catch (err) {
                console.error(err);
                setError('Dashboard could not load. Try refreshing once.');
            } finally {
                setIsLoading(false);
            }
        };
        loadSummary();
    }, []);

    const primaryAction = useMemo(() => getPrimaryAction(summary), [summary]);

    if (isLoading) {
        return (
            <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
                <div className="grid gap-4 lg:grid-cols-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
                    ))}
                </div>
            </div>
        );
    }

    const counts = summary?.counts || {};
    const weakTopic = [...(summary?.topic_insights || [])].sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))[0];

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                    <div className="saas-card p-5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">Today's next action</p>
                        </div>
                        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-4xl">{primaryAction.title}</h1>
                        <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">{primaryAction.detail}</p>
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <button onClick={() => onNavigate(primaryAction.primaryTab)} className="pp-button">{primaryAction.primaryLabel}</button>
                            <button onClick={() => onNavigate(primaryAction.secondaryTab)} className="pp-button-secondary">{primaryAction.secondaryLabel}</button>
                        </div>
                    </div>

                    <LearningBrief summary={summary} onNavigate={onNavigate} />
                </div>

                <div className="saas-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="saas-section-title">Continue</h2>
                        <button onClick={() => onNavigate('library')} className="text-xs font-semibold text-blue-600 dark:text-blue-400">Saved library</button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <ContinueCard title={summary?.latest_roadmap?.title || 'Create your first roadmap'} label={summary?.latest_roadmap ? `${summary.latest_roadmap.step_count} steps` : 'Continue latest roadmap'} action={() => onNavigate('planner')} icon={Map} />
                        <ContinueCard title={summary?.latest_mock?.exam || 'Start a mock test'} label={summary?.latest_mock ? `${summary.latest_mock.score}% latest score` : 'Resume latest mock review'} action={() => onNavigate('tutor')} icon={Target} />
                        <ContinueCard title={counts.wrong_attempts ? `${counts.wrong_attempts} wrong questions` : 'No mistake queue yet'} label="Revisit saved wrong questions" action={() => onNavigate('library')} icon={BookMarked} />
                        <ContinueCard title={summary?.latest_chat?.title || 'Ask your AI tutor'} label={summary?.latest_chat ? `${summary.latest_chat.message_count} messages` : 'Continue last AI chat'} action={() => onNavigate('tutor')} icon={MessageSquare} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
                    <InsightCard title="Practice / revision queue" icon={BookMarked}>
                        <RevisionSummary items={summary?.revision_queue || []} counts={counts} onNavigate={onNavigate} />
                    </InsightCard>

                    <MockSnapshot summary={summary} counts={counts} weakTopic={weakTopic} onNavigate={onNavigate} />
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <InsightCard title="Goal timeline" icon={CalendarDays}>
                        <CompactTimeline items={summary?.timeline || []} />
                    </InsightCard>

                    <InsightCard title="Study timer" icon={Timer}>
                        <StudyTimer />
                    </InsightCard>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Scholarship and deadline signals</h2>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {(summary?.opportunity_matches || []).slice(0, 3).map((item) => (
                                <button key={item} onClick={() => onNavigate('scholarship')} className="rounded-lg bg-slate-50 p-3 text-left text-sm font-medium text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">{item}</button>
                            ))}
                            {(!summary?.opportunity_matches || summary.opportunity_matches.length === 0) && (
                                <button onClick={() => onNavigate('scholarship')} className="rounded-lg bg-slate-50 p-3 text-left text-sm font-medium text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">Find scholarships based on your profile</button>
                            )}
                        </div>
                    </div>

                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">AI tutor and chat</h2>
                        <div className="mt-3 grid gap-2">
                            <button onClick={() => onNavigate('tutor')} className="pp-button-secondary flex items-center justify-center gap-2"><MessageSquare className="h-4 w-4" /> Open AI tutor</button>
                            <button onClick={() => onNavigate('library')} className="pp-button-secondary flex items-center justify-center gap-2"><BookMarked className="h-4 w-4" /> Saved questions</button>
                        </div>
                    </div>
                </div>

                <div className="saas-card p-4">
                    <h2 className="saas-section-title">Recent activity</h2>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {(summary?.recent_activity || []).length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Generate a roadmap, answer questions, or save scholarships to build your activity trail.</div>
                        )}
                        {(summary?.recent_activity || []).slice(0, 4).map((item, index) => (
                            <div key={`${item.type}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudyTimer = () => {
    const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('study_timer_seconds') || 25 * 60));
    const [durationMinutes, setDurationMinutes] = useState(() => Number(localStorage.getItem('study_timer_duration') || 25));
    const [topic, setTopic] = useState(() => localStorage.getItem('study_timer_topic') || '');
    const [sessions, setSessions] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('study_sessions') || '[]');
        } catch {
            return [];
        }
    });
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return undefined;
        const id = window.setInterval(() => {
            setSeconds((prev) => {
                const next = Math.max(0, prev - 1);
                localStorage.setItem('study_timer_seconds', String(next));
                return next;
            });
        }, 1000);
        return () => window.clearInterval(id);
    }, [running]);

    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, '0');
    const today = new Date().toDateString();
    const studiedToday = sessions
        .filter((session) => new Date(session.createdAt).toDateString() === today)
        .reduce((sum, session) => sum + Number(session.minutes || 0), 0);

    const updateDuration = (value) => {
        const next = Math.max(5, Math.min(180, Number(value) || 25));
        setDurationMinutes(next);
        setSeconds(next * 60);
        localStorage.setItem('study_timer_duration', String(next));
        localStorage.setItem('study_timer_seconds', String(next * 60));
    };

    const saveSession = () => {
        const studied = Math.max(1, Math.round((durationMinutes * 60 - seconds) / 60));
        const nextSessions = [{ topic: topic || 'General study', minutes: studied, createdAt: new Date().toISOString() }, ...sessions].slice(0, 60);
        setSessions(nextSessions);
        localStorage.setItem('study_sessions', JSON.stringify(nextSessions));
        localStorage.setItem('study_timer_topic', topic || '');
        setRunning(false);
        setSeconds(durationMinutes * 60);
        localStorage.setItem('study_timer_seconds', String(durationMinutes * 60));
    };

    return (
        <div>
            <p className="text-4xl font-semibold tabular-nums text-slate-950 dark:text-white">{minutes}:{rest}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Today studied: <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{studiedToday} min</span></p>
            <div className="mt-3 grid grid-cols-1 gap-2">
                <input value={topic} onChange={(event) => setTopic(event.target.value)} className="pp-input" placeholder="Topic or roadmap step" />
                <input type="number" min="5" max="180" value={durationMinutes} onChange={(event) => updateDuration(event.target.value)} className="pp-input tabular-nums" aria-label="Timer minutes" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
                <button onClick={() => setRunning((value) => !value)} className="pp-button">{running ? 'Pause' : 'Start'}</button>
                <button onClick={saveSession} className="pp-button-secondary">Save time</button>
                <button onClick={() => { setRunning(false); setSeconds(durationMinutes * 60); localStorage.setItem('study_timer_seconds', String(durationMinutes * 60)); }} className="pp-button-secondary">Reset</button>
            </div>
        </div>
    );
};

export default DashboardPage;
