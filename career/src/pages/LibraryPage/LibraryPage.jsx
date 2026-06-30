import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookMarked, Boxes, CalendarDays, ExternalLink, GraduationCap, Map, MessageSquare, Plus, Search, Trash2, Trophy, X } from 'lucide-react';
import Latex from '../../components/shared/LatexWrapper';
import { formatMathText } from '../AITutorPage/mathText';
import { useDebouncedValue } from '../../utils/timing';
import { getGuestWorkspace } from '../../utils/guestWorkspace';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const tabs = [
    { id: 'roadmaps', label: 'Roadmaps', icon: Map },
    { id: 'questions', label: 'Questions', icon: BookMarked },
    { id: 'mocks', label: 'Mock tests', icon: Trophy },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { id: 'revision', label: 'Revision', icon: CalendarDays },
    { id: 'resources', label: 'Resources', icon: Boxes },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
];

const Empty = ({ label }) => (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">Nothing saved yet</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
);

const QuickAccessCard = ({ icon, title, detail, onClick }) => {
    const IconComponent = icon;
    return (
        <button onClick={onClick} className="group saas-card min-w-0 p-3 text-left transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:hover:bg-slate-900 sm:p-4">
            <div className="flex items-center justify-between gap-3">
                <IconComponent className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 sm:block" />
            </div>
            <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-950 dark:text-white sm:min-h-0 sm:line-clamp-1">{title}</p>
            <p className="mt-1 hidden text-xs leading-5 text-slate-500 dark:text-slate-400 sm:block">{detail}</p>
        </button>
    );
};

const getInitialView = () => {
    const view = new URLSearchParams(window.location.search).get('view');
    return tabs.some((tab) => tab.id === view) ? view : 'roadmaps';
};

const LibraryPage = ({ currentUser }) => {
    const { t } = useTranslation();
    const storageOwner = currentUser?.id || currentUser?.email || currentUser?.name || 'guest';
    const resourceStorageKey = `resource_vault_${storageOwner}`;
    const [activeTab, setActiveTab] = useState(getInitialView);
    const [data, setData] = useState({ roadmaps: [], questions: [], questionAttempts: [], mocks: [], scholarships: [], chats: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMock, setSelectedMock] = useState(null);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query, 200);
    const [resources, setResources] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(resourceStorageKey) || '[]');
        } catch {
            return [];
        }
    });
    const [resourceDraft, setResourceDraft] = useState({ title: '', url: '', tag: '' });

    const endpoints = useMemo(() => ({
        roadmaps: '/roadmaps',
        questions: '/saved-questions',
        questionAttempts: '/question-attempts?wrong_only=true',
        mocks: '/mock-tests',
        scholarships: '/saved-scholarships',
        chats: '/chat-sessions',
    }), []);

    const counts = useMemo(() => ({
        roadmaps: data.roadmaps.length,
        questions: data.questions.length,
        mocks: data.mocks.length,
        scholarships: data.scholarships.length,
        revision: data.questions.length,
        resources: resources.length,
        chats: data.chats.length,
    }), [data, resources]);

    const activeMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];
    const tabLabel = useCallback((tab) => t(`library_tab_${tab.id}`, tab.label), [t]);
    const activeCount = counts[activeTab] || 0;
    const searchable = useMemo(() => ({
        roadmaps: data.roadmaps,
        questions: data.questions,
        mocks: data.mocks,
        scholarships: data.scholarships,
        revision: data.questions,
        resources,
        chats: data.chats,
    }), [data, resources]);

    const filtered = useMemo(() => {
        const needle = debouncedQuery.trim().toLowerCase();
        const source = searchable[activeTab] || [];
        if (!needle) return source;
        return source.filter((item) => JSON.stringify(item).toLowerCase().includes(needle));
    }, [activeTab, debouncedQuery, searchable]);

    const normalizeList = (payload, key) => {
        if (Array.isArray(payload)) return payload;
        if (!payload || typeof payload !== 'object') return [];
        const aliases = {
            roadmaps: ['roadmaps', 'items', 'data'],
            questions: ['questions', 'saved_questions', 'savedQuestions', 'items', 'data'],
            questionAttempts: ['question_attempts', 'questionAttempts', 'attempts', 'items', 'data'],
            mocks: ['mocks', 'mock_tests', 'mockTests', 'items', 'data'],
            scholarships: ['scholarships', 'saved_scholarships', 'savedScholarships', 'items', 'data'],
            chats: ['chats', 'chat_sessions', 'chatSessions', 'items', 'data'],
        }[key] || [key, 'items', 'data'];
        for (const alias of aliases) {
            if (Array.isArray(payload[alias])) return payload[alias];
        }
        return [];
    };

    const getGuestLibraryData = () => {
        const workspace = getGuestWorkspace();
        const savedQuestions = Array.isArray(workspace.savedQuestions) ? workspace.savedQuestions : [];
        const wrongAttempts = (workspace.questionAttempts || [])
            .filter((item) => item && item.is_correct === false)
            .map((item) => ({
                ...item,
                id: item.id || item.guest_id,
                source: item.source || 'mistake',
                correct_answer: item.correct_answer || item.answer,
            }));
        return {
            roadmaps: (workspace.roadmaps || []).map((item) => ({
                ...item,
                id: item.id || item.guest_id,
                step_count: item.step_count ?? item.roadmap_json?.length ?? item.roadmap?.length ?? 0,
            })),
            questions: [...savedQuestions, ...wrongAttempts].map((item) => ({
                ...item,
                id: item.id || item.guest_id,
                question_text: item.question_text || item.question,
                correct_answer: item.correct_answer || item.answer,
            })),
            questionAttempts: wrongAttempts,
            mocks: (workspace.mockTests || []).map((item) => ({ ...item, id: item.id || item.guest_id })),
            scholarships: (workspace.savedScholarships || []).map((item) => ({ ...item, id: item.id || item.guest_id })),
            chats: [],
        };
    };

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        setError('');
        if (currentUser?.is_guest) {
            setData(getGuestLibraryData());
            setIsLoading(false);
            return;
        }
        try {
            const entries = await Promise.all(Object.entries(endpoints).map(async ([key, endpoint]) => {
                const response = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' });
                if (response.status === 401) throw new Error('Your session could not load library data. Please refresh or log in again.');
                if (!response.ok) return [key, []];
                return [key, normalizeList(await response.json(), key)];
            }));
            const nextData = Object.fromEntries(entries);
            const savedQuestions = Array.isArray(nextData.questions) ? nextData.questions : [];
            const wrongAttempts = (Array.isArray(nextData.questionAttempts) ? nextData.questionAttempts : []).map((item) => ({
                ...item,
                id: `attempt-${item.id}`,
                attempt_id: item.id,
                source: item.source || 'mistake',
                question_text: item.question_text || item.question,
                correct_answer: item.correct_answer || item.answer,
                is_attempt_only: true,
            }));
            const questionMap = new Map();
            [...savedQuestions, ...wrongAttempts].forEach((item) => {
                const key = String(item.question_text || '').trim().toLowerCase();
                if (!key) return;
                if (!questionMap.has(key)) questionMap.set(key, item);
            });
            setData({
                roadmaps: nextData.roadmaps || [],
                questions: Array.from(questionMap.values()),
                questionAttempts: nextData.questionAttempts || [],
                mocks: nextData.mocks || [],
                scholarships: nextData.scholarships || [],
                chats: nextData.chats || [],
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Could not load your library.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.is_guest, endpoints]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    useEffect(() => {
        if (!currentUser?.is_guest) return undefined;
        const syncGuestLibrary = () => setData(getGuestLibraryData());
        window.addEventListener('potho-guest-workspace-updated', syncGuestLibrary);
        return () => window.removeEventListener('potho-guest-workspace-updated', syncGuestLibrary);
    }, [currentUser?.is_guest]);

    useEffect(() => {
        try {
            setResources(JSON.parse(localStorage.getItem(resourceStorageKey) || '[]'));
        } catch {
            setResources([]);
        }
    }, [resourceStorageKey]);

    useEffect(() => {
        const syncView = () => setActiveTab(getInitialView());
        window.addEventListener('popstate', syncView);
        return () => window.removeEventListener('popstate', syncView);
    }, []);

    const switchTab = (tabId) => {
        setActiveTab(tabId);
        setQuery('');
        const nextPath = tabId === 'roadmaps' ? '/library' : `/library?view=${tabId}`;
        window.history.replaceState({ tab: 'library' }, '', nextPath);
    };

    const archiveRoadmap = async (id) => {
        await fetch(`${API_URL}/roadmaps/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' }),
        });
        loadAll();
    };

    const deleteQuestion = async (id) => {
        await fetch(`${API_URL}/saved-questions/${id}`, { method: 'DELETE', credentials: 'include' });
        loadAll();
    };

    const updateScholarshipStatus = async (id, status) => {
        await fetch(`${API_URL}/saved-scholarships/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        loadAll();
    };

    const openMock = async (id) => {
        const response = await fetch(`${API_URL}/mock-tests/${id}`, { credentials: 'include' });
        if (response.ok) setSelectedMock(await response.json());
    };

    const addResource = (event) => {
        event.preventDefault();
        if (!resourceDraft.title.trim()) return;
        const next = [{ ...resourceDraft, id: crypto.randomUUID?.() || String(Date.now()), created_at: new Date().toISOString() }, ...resources];
        setResources(next);
        localStorage.setItem(resourceStorageKey, JSON.stringify(next));
        setResourceDraft({ title: '', url: '', tag: '' });
    };

    const deleteResource = (id) => {
        const next = resources.filter((item) => item.id !== id);
        setResources(next);
        localStorage.setItem(resourceStorageKey, JSON.stringify(next));
    };

    const renderItems = () => {
        if (isLoading) {
            return <div className="grid gap-3">{[...Array(4)].map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />)}</div>;
        }

        if (activeTab === 'roadmaps') {
            if (!filtered.length) return <Empty label={query ? "No roadmaps match this search." : "Generated roadmaps will appear here after you save them."} />;
            return filtered.map((item) => (
                <div key={item.id} className="saas-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.step_count} steps, {item.status}</p>
                        </div>
                        <button onClick={() => archiveRoadmap(item.id)} className="ios-pill w-fit">Archive</button>
                    </div>
                </div>
            ));
        }

        if (activeTab === 'questions') {
            if (!filtered.length) return <Empty label={query ? "No saved questions match this search." : "Saved practice questions and mistake notebook items will appear here."} />;
            return filtered.map((item) => (
                <div key={item.id} className="saas-card p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-semibold leading-6 text-slate-950 dark:text-white">{item.question_text}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{[item.exam, item.subject, item.topic, item.difficulty].filter(Boolean).join(' | ')}</p>
                            <p className="mt-2 break-words text-sm text-emerald-700 dark:text-emerald-300">Answer: {item.correct_answer}</p>
                        </div>
                        {!item.is_attempt_only && (
                            <button onClick={() => deleteQuestion(item.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-[background-color,color,transform] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-[0.96] dark:border-slate-800 dark:hover:bg-red-950/30" aria-label="Delete saved question">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            ));
        }

        if (activeTab === 'mocks') {
            if (!filtered.length) return <Empty label={query ? "No mock tests match this search." : "Completed mock tests will be saved with score and topic context."} />;
            return filtered.map((item) => (
                <button key={item.id} onClick={() => openMock(item.id)} className="saas-card w-full p-4 text-left transition-[border-color,background-color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.96] dark:hover:border-slate-700 dark:hover:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.exam || 'Mock test'}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{[item.subject, item.topic, item.difficulty].filter(Boolean).join(' | ') || 'General practice'}</p>
                            <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Open full review</p>
                        </div>
                        <p className="text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{item.score || 0}%</p>
                    </div>
                </button>
            ));
        }

        if (activeTab === 'scholarships') {
            if (!filtered.length) return <Empty label={query ? "No scholarships match this search." : "Saved scholarship opportunities will become your application tracker."} />;
            return filtered.map((item) => {
                const scholarship = item.scholarship_json || {};
                return (
                    <div key={item.id} className="saas-card p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{scholarship.name || 'Saved scholarship'}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{scholarship.description}</p>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Status: {item.status}</p>
                            </div>
                            <select value={item.status} onChange={(event) => updateScholarshipStatus(item.id, event.target.value)} className="pp-input max-w-44">
                                <option value="saved">saved</option>
                                <option value="shortlisted">shortlisted</option>
                                <option value="applying">applying</option>
                                <option value="applied">applied</option>
                                <option value="closed">closed</option>
                            </select>
                        </div>
                    </div>
                );
            });
        }

        if (activeTab === 'revision') {
            if (!filtered.length) return <Empty label={query ? "No revision cards match this search." : "Save practice questions and wrong answers to build daily review cards."} />;
            return filtered.map((item, index) => (
                <div key={item.id} className="saas-card p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                            <BookMarked className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{index < 3 ? 'Due today' : 'Repeat in 2 days'}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950 text-pretty dark:text-white"><Latex>{formatMathText(item.question_text)}</Latex></p>
                            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Correct answer: <Latex>{formatMathText(item.correct_answer)}</Latex></p>
                        </div>
                    </div>
                </div>
            ));
        }

        if (activeTab === 'resources') {
            return (
                <div className="space-y-3">
                    <form onSubmit={addResource} className="saas-card grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto]">
                        <input value={resourceDraft.title} onChange={(event) => setResourceDraft((prev) => ({ ...prev, title: event.target.value }))} className="pp-input" placeholder="Resource title" />
                        <input value={resourceDraft.url} onChange={(event) => setResourceDraft((prev) => ({ ...prev, url: event.target.value }))} className="pp-input" placeholder="Link, PDF, video, article" />
                        <input value={resourceDraft.tag} onChange={(event) => setResourceDraft((prev) => ({ ...prev, tag: event.target.value }))} className="pp-input" placeholder="Topic tag" />
                        <button className="pp-button flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Save</button>
                    </form>
                    {filtered.length === 0 && <Empty label={query ? "No resources match this search." : "Save videos, PDFs, links, courses, and project resources here."} />}
                    {filtered.map((item) => (
                        <div key={item.id} className="saas-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.tag || 'General resource'}</p>
                                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">Open resource <ExternalLink className="h-3.5 w-3.5" /></a>}
                                </div>
                                <button onClick={() => deleteResource(item.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-[background-color,color,transform] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-[0.96] dark:border-slate-800 dark:hover:bg-red-950/30">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (!filtered.length) return <Empty label={query ? "No chats match this search." : "Career planner and tutor chats are already auto-saved here."} />;
        return filtered.map((item) => (
            <div key={item.id} className="saas-card p-4">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.chat_type} | {item.message_count} messages</p>
            </div>
        ));
    };

    const latestRoadmap = data.roadmaps[0];
    const latestMock = data.mocks[0];
    const latestScholarship = data.scholarships[0];
    const mistakeCount = data.questions.filter((item) => item.source === 'mistake').length;

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="saas-card p-4">
                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">{t('library_eyebrow', 'Saved Library')}</p>
                    <h1 className="pp-page-title">{t('library_title', 'Everything you have built')}</h1>
                    <p className="pp-page-copy mt-1 hidden max-w-3xl sm:block">{t('library_subtitle', 'Roadmaps, questions, mocks, scholarships, resources, and chats stay organized as searchable workspace objects.')}</p>
                </div>
                <div className="saas-card grid grid-cols-3 gap-2 p-3">
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="saas-meta">{t('library_stat_plans', 'Plans')}</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{counts.roadmaps}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="saas-meta">{t('library_stat_practice', 'Practice')}</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{counts.questions}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="saas-meta">{t('library_stat_mocks', 'Mocks')}</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{counts.mocks}</p>
                    </div>
                </div>
            </div>

            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                <QuickAccessCard icon={BookMarked} title={t('library_review_cards', '{{count}} review cards', { count: mistakeCount || counts.questions })} detail={t('library_review_detail', 'Jump straight into mistakes and saved questions.')} onClick={() => switchTab('revision')} />
                <QuickAccessCard icon={Map} title={latestRoadmap?.title || t('library_no_roadmap', 'No roadmap saved yet')} detail={t('library_roadmap_detail', 'Latest career plan and saved stages.')} onClick={() => switchTab('roadmaps')} />
                <QuickAccessCard icon={Trophy} title={latestMock ? t('library_latest_mock', '{{score}}% latest mock', { score: latestMock.score || 0 }) : t('library_no_mock', 'No mock yet')} detail={t('library_mock_detail', 'Open full score review without hunting.')} onClick={() => switchTab('mocks')} />
                <QuickAccessCard icon={GraduationCap} title={latestScholarship?.scholarship_json?.name || t('library_no_scholarship', 'No scholarship saved yet')} detail={t('library_scholarship_detail', 'Applications and opportunity tracking.')} onClick={() => switchTab('scholarships')} />
            </div>

            <div className="mb-3 saas-card p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="saas-meta">{t('library_current_view', 'Current view')}</p>
                        <div className="mt-1 flex items-center gap-2">
                            {React.createElement(activeMeta.icon, { className: 'h-4 w-4 text-slate-500 dark:text-slate-400' })}
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{tabLabel(activeMeta)}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-500 dark:bg-slate-900 dark:text-slate-400">{activeCount}</span>
                        </div>
                    </div>
                    <label className="relative block w-full xl:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={query} onChange={(event) => setQuery(event.target.value)} className="pp-input pl-9" placeholder={t('library_search_placeholder', 'Search {{label}}...', { label: tabLabel(activeMeta).toLowerCase() })} />
                    </label>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => switchTab(tab.id)} className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>
                                <Icon className="h-4 w-4" />
                                {tabLabel(tab)}
                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[0.68rem] tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">{counts[tab.id] || 0}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">{renderItems()}</div>

            {selectedMock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
                    <div className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                            <div>
                                <p className="saas-meta">Mock test review</p>
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{selectedMock.exam || 'Mock test'} | {selectedMock.score || 0}%</h2>
                            </div>
                            <button onClick={() => setSelectedMock(null)} className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:border-slate-800 dark:hover:bg-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4">
                            <div className="mb-4 grid gap-3 md:grid-cols-3">
                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><p className="saas-meta">Correct</p><p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-600">{selectedMock.correct_answers || 0}</p></div>
                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><p className="saas-meta">Incorrect</p><p className="mt-1 text-2xl font-semibold tabular-nums text-rose-600">{selectedMock.incorrect_answers || 0}</p></div>
                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><p className="saas-meta">Questions</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{selectedMock.total_questions || 0}</p></div>
                            </div>
                            {selectedMock.analysis_json?.analysis && <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{selectedMock.analysis_json.analysis}</div>}
                            <div className="space-y-3">
                                {(selectedMock.analysis_json?.detailed_results || []).map((item, index) => (
                                    <div key={index} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold leading-6 text-slate-950 text-pretty dark:text-white">{index + 1}. <Latex>{formatMathText(item.question)}</Latex></p>
                                            <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${item.is_correct ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'}`}>{item.is_correct ? 'Correct' : 'Review'}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your answer: <Latex>{formatMathText(item.user_answer || 'Not answered')}</Latex></p>
                                        <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">Correct answer: <Latex>{formatMathText(item.correct_answer)}</Latex></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryPage;
