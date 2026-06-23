import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookMarked, CalendarDays, CheckCircle2, Clock3, FileText, GraduationCap, Library, LineChart, Map, MessageSquare, Sparkles, Target, Timer, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const StatCard = ({ label, value, detail, icon }) => (
    <div className="saas-card p-4">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="saas-meta">{label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{value}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {React.createElement(icon, { className: 'h-4 w-4' })}
            </div>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
);

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

const DashboardPage = ({ currentUser, onNavigate }) => {
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

    const todayAction = useMemo(() => {
        if (!summary) return 'Build your career workspace';
        if ((summary.profile_completeness || 0) < 80) return 'Complete your student profile';
        if (!summary.latest_roadmap) return 'Generate your first roadmap';
        if ((summary.counts?.wrong_attempts || 0) > 0) return 'Review your weak practice questions';
        return 'Take a focused mock test';
    }, [summary]);

    const exportWeeklyReport = () => {
        const report = summary?.weekly_report;
        if (!report) return;
        const html = `
            <html>
                <head><title>Career Weekly Report</title></head>
                <body style="font-family:Inter,Arial,sans-serif;padding:32px;line-height:1.5;color:#0f172a">
                    <h1>Career Weekly Report</h1>
                    <p>${report.summary}</p>
                    <h2>Wins</h2><ul>${(report.wins || []).map((item) => `<li>${item}</li>`).join('')}</ul>
                    <h2>Weak Areas</h2><ul>${(report.weak_areas || []).map((item) => `<li>${item}</li>`).join('')}</ul>
                    <h2>Next Actions</h2><ul>${(report.next_actions || []).map((item) => `<li>${item}</li>`).join('')}</ul>
                </body>
            </html>
        `;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
    };

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

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Command Center</p>
                    <h1 className="pp-page-title">Your career operating system</h1>
                    <p className="pp-page-copy mt-1 max-w-3xl">Everything you generate now becomes reusable progress, history, and next actions.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    {currentUser?.email || 'Signed in'}
                </div>
            </div>

            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-4">
                    <div className="saas-card overflow-hidden">
                        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="p-5">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                        <Sparkles className="h-4 w-4" />
                                    </span>
                                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Today</p>
                                </div>
                                <h2 className="mt-4 max-w-2xl text-balance text-2xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-3xl">{todayAction}</h2>
                                <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">Use the saved data trail to keep improving instead of starting from zero every session.</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button onClick={() => onNavigate('planner')} className="pp-button">Open planner</button>
                                    <button onClick={() => onNavigate('tutor')} className="pp-button-secondary">Practice now</button>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60 lg:border-l lg:border-t-0">
                                <p className="saas-meta">Career readiness</p>
                                <p className="mt-2 text-4xl font-semibold tabular-nums text-slate-950 dark:text-white">{summary?.career_readiness_score || 0}%</p>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${summary?.career_readiness_score || 0}%` }} />
                                </div>
                                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{summary?.profile_completeness || 0}% profile complete</p>
                                <button onClick={() => onNavigate('profile')} className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400">Update profile</button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                        <StatCard label="Roadmaps" value={counts.roadmaps || 0} detail="Saved plans" icon={Map} />
                        <StatCard label="Questions" value={counts.saved_questions || 0} detail="Saved for review" icon={BookMarked} />
                        <StatCard label="Mock average" value={`${summary?.mock_average || 0}%`} detail={`${counts.mock_tests || 0} tests completed`} icon={LineChart} />
                        <StatCard label="Scholarships" value={counts.saved_scholarships || 0} detail="Tracked opportunities" icon={GraduationCap} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <InsightCard title="Personal learning graph" icon={TrendingUp}>
                            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                                {(summary?.topic_insights || []).slice(0, 6).map((item) => <TopicBar key={item.topic} item={item} />)}
                                {(!summary?.topic_insights || summary.topic_insights.length === 0) && <p className="text-sm text-slate-500 dark:text-slate-400">Answer practice questions to build a topic strength graph.</p>}
                            </div>
                        </InsightCard>

                        <InsightCard title="AI weekly report" icon={FileText}>
                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{summary?.weekly_report?.summary}</p>
                            <div className="mt-3 space-y-2">
                                {(summary?.weekly_report?.next_actions || []).slice(0, 3).map((item) => (
                                    <div key={item} className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">{item}</div>
                                ))}
                            </div>
                            <button onClick={exportWeeklyReport} className="pp-button-secondary mt-3 w-full">Export report</button>
                        </InsightCard>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <InsightCard title="Goal timeline" icon={CalendarDays}>
                            <div className="space-y-2">
                                {(summary?.timeline || []).slice(0, 5).map((item, index) => (
                                    <div key={`${item.type}-${index}`} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                                                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-semibold capitalize text-slate-500 dark:bg-slate-950 dark:text-slate-400">{item.type}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.status || 'active'} {item.date ? `· ${new Date(item.date).toLocaleDateString()}` : ''}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!summary?.timeline || summary.timeline.length === 0) && <p className="text-sm text-slate-500 dark:text-slate-400">Saved plans, mocks, and applications will form your timeline.</p>}
                            </div>
                        </InsightCard>

                        <InsightCard title="Revision queue" icon={BookMarked}>
                            <p className="mb-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Due review cards from saved questions and wrong answers.</p>
                            <div className="space-y-2">
                                {(summary?.revision_queue || []).slice(0, 4).map((item, index) => (
                                    <div key={`${item.type}-${index}`} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                        <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.due_state}</p>
                                    </div>
                                ))}
                                {(!summary?.revision_queue || summary.revision_queue.length === 0) && <p className="text-sm text-slate-500 dark:text-slate-400">Wrong answers and saved questions will appear here for daily review.</p>}
                            </div>
                        </InsightCard>

                        <InsightCard title="Study timer" icon={Timer}>
                            <StudyTimer />
                        </InsightCard>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="saas-card p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="saas-section-title">Continue</h2>
                                <button onClick={() => onNavigate('library')} className="text-xs font-semibold text-blue-600 dark:text-blue-400">View library</button>
                            </div>
                            <div className="space-y-2">
                                <ContinueCard title={summary?.latest_roadmap?.title || 'Create your first roadmap'} label={summary?.latest_roadmap ? `${summary.latest_roadmap.step_count} steps` : 'Planner'} action={() => onNavigate('planner')} icon={Map} />
                                <ContinueCard title={summary?.latest_mock?.exam || 'Start a mock test'} label={summary?.latest_mock ? `${summary.latest_mock.score}% latest score` : 'AI Tutor'} action={() => onNavigate('tutor')} icon={Target} />
                                <ContinueCard title={summary?.latest_chat?.title || 'Ask your AI tutor'} label={summary?.latest_chat ? `${summary.latest_chat.message_count} messages` : 'Chat history'} action={() => onNavigate('tutor')} icon={MessageSquare} />
                            </div>
                        </div>

                        <div className="saas-card p-4">
                            <h2 className="saas-section-title">Recent activity</h2>
                            <div className="mt-3 space-y-2">
                                {(summary?.recent_activity || []).length === 0 && (
                                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Generate a roadmap, answer questions, or save scholarships to build your activity trail.</div>
                                )}
                                {(summary?.recent_activity || []).map((item, index) => (
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

                <aside className="space-y-4">
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Smart recommendations</h2>
                        <div className="mt-3 space-y-2">
                            {(summary?.recommendations || []).map((item) => (
                                <div key={item} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    <p className="text-sm leading-5 text-slate-700 dark:text-slate-300">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Opportunity matches</h2>
                        <div className="mt-3 space-y-2">
                            {(summary?.opportunity_matches || []).map((item) => (
                                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{item}</div>
                            ))}
                        </div>
                    </div>
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Notifications</h2>
                        <div className="mt-3 space-y-2">
                            {(summary?.notifications || []).map((item) => (
                                <div key={item} className="flex gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <p className="text-sm leading-5 text-slate-700 dark:text-slate-300">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Quick actions</h2>
                        <div className="mt-3 grid gap-2">
                            <button onClick={() => onNavigate('library')} className="pp-button-secondary flex items-center justify-center gap-2"><Library className="h-4 w-4" /> Saved library</button>
                            <button onClick={() => onNavigate('scholarship')} className="pp-button-secondary flex items-center justify-center gap-2"><GraduationCap className="h-4 w-4" /> Find scholarships</button>
                        </div>
                    </div>
                </aside>
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
            <div className="mt-3 grid grid-cols-[1fr_96px] gap-2">
                <input value={topic} onChange={(event) => setTopic(event.target.value)} className="pp-input" placeholder="Topic or roadmap step" />
                <input type="number" min="5" max="180" value={durationMinutes} onChange={(event) => updateDuration(event.target.value)} className="pp-input tabular-nums" aria-label="Timer minutes" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setRunning((value) => !value)} className="pp-button">{running ? 'Pause' : 'Start'}</button>
                <button onClick={saveSession} className="pp-button-secondary">Save time</button>
                <button onClick={() => { setRunning(false); setSeconds(durationMinutes * 60); localStorage.setItem('study_timer_seconds', String(durationMinutes * 60)); }} className="pp-button-secondary">Reset</button>
            </div>
        </div>
    );
};

export default DashboardPage;
