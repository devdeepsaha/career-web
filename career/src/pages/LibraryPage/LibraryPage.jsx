import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookMarked, Boxes, CalendarDays, ExternalLink, GraduationCap, Map, MessageSquare, Plus, Trash2, Trophy, X } from 'lucide-react';

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

const LibraryPage = () => {
    const [activeTab, setActiveTab] = useState('roadmaps');
    const [data, setData] = useState({ roadmaps: [], questions: [], mocks: [], scholarships: [], chats: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMock, setSelectedMock] = useState(null);
    const [resources, setResources] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('resource_vault') || '[]');
        } catch {
            return [];
        }
    });
    const [resourceDraft, setResourceDraft] = useState({ title: '', url: '', tag: '' });

    const endpoints = useMemo(() => ({
        roadmaps: '/roadmaps',
        questions: '/saved-questions',
        mocks: '/mock-tests',
        scholarships: '/saved-scholarships',
        chats: '/chat-sessions',
    }), []);

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const entries = await Promise.all(Object.entries(endpoints).map(async ([key, endpoint]) => {
                const response = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' });
                if (!response.ok) return [key, []];
                return [key, await response.json()];
            }));
            setData(Object.fromEntries(entries));
        } catch (err) {
            console.error(err);
            setError('Could not load your library.');
        } finally {
            setIsLoading(false);
        }
    }, [endpoints]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

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
        localStorage.setItem('resource_vault', JSON.stringify(next));
        setResourceDraft({ title: '', url: '', tag: '' });
    };

    const deleteResource = (id) => {
        const next = resources.filter((item) => item.id !== id);
        setResources(next);
        localStorage.setItem('resource_vault', JSON.stringify(next));
    };

    const renderItems = () => {
        if (isLoading) {
            return <div className="grid gap-3">{[...Array(4)].map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />)}</div>;
        }

        if (activeTab === 'roadmaps') {
            if (!data.roadmaps.length) return <Empty label="Generated roadmaps will appear here after you save them." />;
            return data.roadmaps.map((item) => (
                <div key={item.id} className="saas-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.step_count} steps, {item.status}</p>
                        </div>
                        <button onClick={() => archiveRoadmap(item.id)} className="ios-pill w-fit">Archive</button>
                    </div>
                </div>
            ));
        }

        if (activeTab === 'questions') {
            if (!data.questions.length) return <Empty label="Saved practice questions and mistake notebook items will appear here." />;
            return data.questions.map((item) => (
                <div key={item.id} className="saas-card p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold leading-6 text-slate-950 dark:text-white">{item.question_text}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{[item.exam, item.subject, item.topic, item.difficulty].filter(Boolean).join(' | ')}</p>
                            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Answer: {item.correct_answer}</p>
                        </div>
                        <button onClick={() => deleteQuestion(item.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-[background-color,color,transform] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-[0.96] dark:border-slate-800 dark:hover:bg-red-950/30">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ));
        }

        if (activeTab === 'mocks') {
            if (!data.mocks.length) return <Empty label="Completed mock tests will be saved with score and topic context." />;
            return data.mocks.map((item) => (
                <button key={item.id} onClick={() => openMock(item.id)} className="saas-card w-full p-4 text-left transition-[border-color,background-color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.96] dark:hover:border-slate-700 dark:hover:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.exam || 'Mock test'}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{[item.subject, item.topic, item.difficulty].filter(Boolean).join(' | ') || 'General practice'}</p>
                            <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Open full review</p>
                        </div>
                        <p className="text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{item.score || 0}%</p>
                    </div>
                </button>
            ));
        }

        if (activeTab === 'scholarships') {
            if (!data.scholarships.length) return <Empty label="Saved scholarship opportunities will become your application tracker." />;
            return data.scholarships.map((item) => {
                const scholarship = item.scholarship_json || {};
                return (
                    <div key={item.id} className="saas-card p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">{scholarship.name || 'Saved scholarship'}</p>
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
            if (!data.questions.length) return <Empty label="Save practice questions and wrong answers to build daily review cards." />;
            return data.questions.map((item, index) => (
                <div key={item.id} className="saas-card p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                            <BookMarked className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{index < 3 ? 'Due today' : 'Repeat in 2 days'}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950 dark:text-white">{item.question_text}</p>
                            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Correct answer: {item.correct_answer}</p>
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
                    {resources.length === 0 && <Empty label="Save videos, PDFs, links, courses, and project resources here." />}
                    {resources.map((item) => (
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

        if (!data.chats.length) return <Empty label="Career planner and tutor chats are already auto-saved here." />;
        return data.chats.map((item) => (
            <div key={item.id} className="saas-card p-4">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.chat_type} | {item.message_count} messages</p>
            </div>
        ));
    };

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Saved Library</p>
                <h1 className="pp-page-title">Everything you have built</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">Roadmaps, questions, mocks, scholarships, resources, and chats stay organized here.</p>
            </div>

            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <div className="mb-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${activeTab === tab.id ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
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
                                            <p className="text-sm font-semibold leading-6 text-slate-950 dark:text-white">{index + 1}. {item.question}</p>
                                            <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${item.is_correct ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'}`}>{item.is_correct ? 'Correct' : 'Review'}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your answer: {item.user_answer || 'Not answered'}</p>
                                        <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">Correct answer: {item.correct_answer}</p>
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
