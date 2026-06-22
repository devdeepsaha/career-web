import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoadmapStepCard from './RoadmapStepCard';
import EmptyStateGraphic from './EmptyStateGraphic';

const RoadmapDisplay = ({ isLoading, roadmap, savedRoadmapMeta, setChatVisible, sendMessageToChatbot }) => {
    const { t } = useTranslation();
    const [visibleCards, setVisibleCards] = useState([]);

    const handleChatTrigger = (query) => {
        if (setChatVisible && sendMessageToChatbot) {
            setChatVisible(true);
            setTimeout(() => {
                sendMessageToChatbot(query);
            }, 300);
        } else {
            console.warn("Chatbot functions not provided in props");
        }
    };

    // --- Animated card loading ---
    useEffect(() => {
        setVisibleCards([]);
        if (!roadmap || roadmap.length === 0) return;

        let index = 0;
        const interval = setInterval(() => {
            if (index < roadmap.length) {
                setVisibleCards(prev => [...prev, roadmap[index]]);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [roadmap]);

    return (
        <div className="saas-card min-h-[540px] p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800 md:flex-row md:items-center">
                <div>
                    <p className="saas-meta">Roadmap Canvas</p>
                    <h2 className="saas-section-title mt-1">
                        {t('roadmapDisplay_title')}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('roadmapDisplay_subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {savedRoadmapMeta && <span className="ios-pill w-fit">Saved · {savedRoadmapMeta.status}</span>}
                    <span className="ios-pill w-fit tabular-nums">
                        {visibleCards.length} active steps
                    </span>
                </div>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
                    ))}
                </div>
            )}

            {!isLoading && (!roadmap || roadmap.length === 0) && (
                <div className="flex justify-center">
                    <EmptyStateGraphic />
                </div>
            )}

            {!isLoading && visibleCards.length > 0 && (
                <div className="relative space-y-3">
                    <div
                        className="absolute left-4 top-0 h-full w-px bg-slate-200 dark:bg-slate-800"
                        aria-hidden="true"
                    />
                    <>
                        {visibleCards.map((step, index) => (
                            step && (
                                <div key={index} className="relative flex items-start">
                                    <div className="flex w-8 flex-shrink-0 flex-col items-center">
                                        <div className="z-10 mt-5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 dark:border-slate-950"></div>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <RoadmapStepCard
                                            step={step}
                                            openChatWithQuery={handleChatTrigger}
                                        />
                                    </div>
                                </div>
                            )
                        ))}
                    </>
                </div>
            )}
        </div>
    );
};

export default RoadmapDisplay;
