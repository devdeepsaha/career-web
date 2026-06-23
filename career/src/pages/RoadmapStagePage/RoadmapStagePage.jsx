import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpenCheck, CheckCircle2, ExternalLink, FileText, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const getStepTitle = (step, index) => {
    if (typeof step === 'string') return step;
    return step?.title || step?.step || step?.name || step?.phase || `Stage ${index + 1}`;
};

const getStepDetail = (step) => {
    if (!step || typeof step === 'string') return '';
    return step.description || step.details || step.action || step.summary || '';
};

const getStepResources = (step) => {
    if (!step || typeof step === 'string') return [];
    const raw = step.resources || step.links || step.resource_links || [];
    if (typeof raw === 'string') return [{ title: raw, url: raw.startsWith('http') ? raw : '' }];
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 6).map((resource) => {
        if (typeof resource === 'string') return { title: resource, url: resource.startsWith('http') ? resource : '' };
        return {
            title: resource.title || resource.name || resource.label || resource.url || 'Resource',
            url: resource.url || resource.link || '',
        };
    });
};

const GuideList = ({ title, items = [], icon }) => {
    if (!items?.length) return null;
    const IconComponent = icon;
    return (
        <section className="saas-card p-4">
            <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <IconComponent className="h-4 w-4" />
                </span>
                <h2 className="saas-section-title">{title}</h2>
            </div>
            <div className="grid gap-2">
                {items.map((item, index) => (
                    <div key={`${title}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {item}
                    </div>
                ))}
            </div>
        </section>
    );
};

const RoadmapStagePage = ({ onNavigate }) => {
    const [roadmap, setRoadmap] = useState(null);
    const [guide, setGuide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const roadmapId = params.get('roadmap');
    const stageNumber = Number(params.get('stage') || 1);

    const stage = useMemo(() => {
        const steps = roadmap?.roadmap_json || [];
        return steps[stageNumber - 1];
    }, [roadmap, stageNumber]);

    const title = getStepTitle(stage, stageNumber - 1);
    const detail = getStepDetail(stage);
    const resources = getStepResources(stage);

    useEffect(() => {
        const loadStage = async () => {
            if (!roadmapId) {
                setError('No roadmap stage selected.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_URL}/roadmaps/${roadmapId}`, { credentials: 'include' });
                if (!response.ok) throw new Error('Could not load roadmap');
                const data = await response.json();
                setRoadmap(data);
                const step = data.roadmap_json?.[stageNumber - 1];
                if (step && typeof step === 'object' && step.ai_guide) setGuide(step.ai_guide);
            } catch (err) {
                console.error(err);
                setError('Could not load this roadmap stage.');
            } finally {
                setIsLoading(false);
            }
        };
        loadStage();
    }, [roadmapId, stageNumber]);

    const generateGuide = async (regenerate = false) => {
        if (!roadmapId || !stageNumber) return;
        setIsGenerating(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/roadmaps/${roadmapId}/stages/${stageNumber}/guide`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ regenerate }),
            });
            if (!response.ok) throw new Error('Could not generate guide');
            const data = await response.json();
            setGuide(data.guide);
            setRoadmap(data.roadmap);
        } catch (err) {
            console.error(err);
            setError('Could not generate this stage guide. Try again once.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
                    <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <button onClick={() => onNavigate('dashboard')} className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
            </button>

            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className="space-y-4">
                    <section className="saas-card p-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600 dark:text-blue-400">Stage {stageNumber}</p>
                        <h1 className="text-balance text-3xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-4xl">{title}</h1>
                        {detail && <p className="mt-3 max-w-3xl text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">{detail}</p>}
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <button onClick={() => generateGuide(false)} disabled={isGenerating} className="pp-button flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                {guide ? 'Open saved AI guide' : isGenerating ? 'Generating guide...' : 'Generate AI guide'}
                            </button>
                            {guide && (
                                <button onClick={() => generateGuide(true)} disabled={isGenerating} className="pp-button-secondary">
                                    Regenerate
                                </button>
                            )}
                        </div>
                    </section>

                    {guide ? (
                        <>
                            <section className="saas-card p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                    <h2 className="saas-section-title">{guide.title || 'AI stage document'}</h2>
                                </div>
                                {guide.summary && <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{guide.summary}</p>}
                                {guide.outcome && (
                                    <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-medium leading-6 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                                        Outcome: {guide.outcome}
                                    </div>
                                )}
                            </section>
                            <GuideList title="Action plan" items={guide.steps} icon={CheckCircle2} />
                            <GuideList title="Completion checklist" items={guide.checklist} icon={BookOpenCheck} />
                            {guide.deliverable && (
                                <section className="saas-card p-4">
                                    <h2 className="saas-section-title">Deliverable</h2>
                                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">{guide.deliverable}</p>
                                </section>
                            )}
                        </>
                    ) : (
                        <section className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
                            <Sparkles className="mx-auto h-8 w-8 text-slate-400" />
                            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">Generate a structured guide for this stage</p>
                            <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">The AI guide will be saved back into this roadmap stage so you can return to it from the dashboard or library.</p>
                        </section>
                    )}
                </main>

                <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
                    <section className="saas-card p-4">
                        <h2 className="saas-section-title">Saved roadmap</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{roadmap?.title || 'Career roadmap'}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{roadmap?.step_count || 0} stages, {roadmap?.status || 'active'}</p>
                        <button onClick={() => onNavigate('planner')} className="pp-button-secondary mt-3 w-full">Open planner</button>
                    </section>

                    {resources.length > 0 && (
                        <section className="saas-card p-4">
                            <h2 className="saas-section-title">Stage resources</h2>
                            <div className="mt-3 grid gap-2">
                                {resources.map((resource) => resource.url ? (
                                    <a key={resource.title} href={resource.url} target="_blank" rel="noreferrer" className="flex min-h-10 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                                        <span className="line-clamp-1">{resource.title}</span>
                                        <ExternalLink className="h-4 w-4 shrink-0" />
                                    </a>
                                ) : (
                                    <div key={resource.title} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400">{resource.title}</div>
                                ))}
                            </div>
                        </section>
                    )}

                    {guide?.resources?.length > 0 && (
                        <section className="saas-card p-4">
                            <h2 className="saas-section-title">AI suggested resources</h2>
                            <div className="mt-3 grid gap-2">
                                {guide.resources.map((resource, index) => (
                                    <div key={`${resource.title}-${index}`} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{resource.title}</p>
                                        {resource.reason && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{resource.reason}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {guide?.ai_prompt && (
                        <section className="saas-card p-4">
                            <h2 className="saas-section-title">Ask AI next</h2>
                            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">{guide.ai_prompt}</p>
                            <button onClick={() => onNavigate('tutor')} className="pp-button mt-3 w-full">Open AI tutor</button>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default RoadmapStagePage;
