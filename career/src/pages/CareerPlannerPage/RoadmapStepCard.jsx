import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Lightbulb, UsersRound, Wrench } from 'lucide-react';
import { stepTypeConfig } from './stepTypeConfig.jsx';

const iconByType = {
    course: BookOpen,
    project: Wrench,
    skill: Lightbulb,
    mentor: UsersRound,
};

const RoadmapStepCard = ({ step, openChatWithQuery, currentUser, roadmapId, stageNumber, onOpenStage }) => {
    const { t } = useTranslation();
    const storageOwner = currentUser?.id || currentUser?.email || currentUser?.name || 'guest';

    const progressKey = useMemo(() => `roadmap_step_progress_${storageOwner}_${step?.title || step?.source || step?.description || 'step'}`, [step, storageOwner]);
    const [progress, setProgress] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(progressKey) || '{"status":"not started","note":""}');
        } catch {
            return { status: 'not started', note: '' };
        }
    });

    useEffect(() => {
        localStorage.setItem(progressKey, JSON.stringify(progress));
    }, [progress, progressKey]);

    if (!step || !step.type) return null;

    const config = stepTypeConfig[step.type] || {};
    const Icon = iconByType[step.type] || BriefcaseBusiness;

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleLearnMore = () => {
        if (step.url && isValidUrl(step.url)) {
            window.open(step.url, '_blank');
            return;
        }

        const query = step.title || step.source || 'Career related question';
        if (openChatWithQuery) {
            openChatWithQuery(query);
        } else if (window.openCareerChatbot) {
            window.openCareerChatbot(query);
        }
    };

    const openStage = () => {
        if (roadmapId && stageNumber && onOpenStage) onOpenStage(roadmapId, stageNumber);
    };

    const stopCardNavigation = (event) => {
        event.stopPropagation();
    };

    return (
        <article
            role={roadmapId ? 'button' : undefined}
            tabIndex={roadmapId ? 0 : undefined}
            onClick={openStage}
            onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && roadmapId) {
                    event.preventDefault();
                    openStage();
                }
            }}
            className={`rounded-lg border border-slate-200 bg-white p-4 transition-[border-color,background-color,transform] duration-150 hover:border-slate-300 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 ${roadmapId ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${config.borderColor || ''}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{config.title || step.type}</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>

                    <div className="mt-3 grid gap-2 md:grid-cols-[160px_minmax(0,1fr)]">
                        <select
                            value={progress.status}
                            onClick={stopCardNavigation}
                            onChange={(event) => setProgress((prev) => ({ ...prev, status: event.target.value }))}
                            className="pp-input py-2 text-xs"
                        >
                            <option value="not started">Not started</option>
                            <option value="in progress">In progress</option>
                            <option value="done">Done</option>
                        </select>
                        <input
                            value={progress.note}
                            onClick={stopCardNavigation}
                            onChange={(event) => setProgress((prev) => ({ ...prev, note: event.target.value }))}
                            className="pp-input py-2 text-xs"
                            maxLength={240}
                            placeholder="Add a note, link, or next action"
                        />
                    </div>

                    <button onClick={(event) => { stopCardNavigation(event); handleLearnMore(); }} className="ios-pill mt-3 inline-flex items-center gap-2">
                        {t('roadmapCard_learnMore', { source: step.source })}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default RoadmapStepCard;
