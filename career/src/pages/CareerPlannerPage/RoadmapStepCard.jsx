import React from 'react';
import { useTranslation } from 'react-i18next';
import { stepTypeConfig } from './stepTypeConfig.jsx';

const RoadmapStepCard = ({ step, openChatWithQuery }) => {
    const { t } = useTranslation();

    if (!step || !step.type) return null;

    const config = stepTypeConfig[step.type] || {};

    // --- Helper: Check if URL looks valid ---
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // --- Handle Learn More click ---
    const handleLearnMore = () => {
        if (step.url && isValidUrl(step.url)) {
            // open valid external link
            window.open(step.url, "_blank");
        } else {
            // fallback: open chatbot if no valid URL
            if (openChatWithQuery) {
                openChatWithQuery(step.title || step.source || 'Career related question');
            } else if (window.openCareerChatbot) {
                window.openCareerChatbot(step.title || 'Career related question');
            } else {
                console.warn("⚠️ Chatbot function not available in props or global scope");
            }
        }
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 transition-[border-color,background-color] duration-150 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
            <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 ${config.borderColor}`}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{config.title}</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>

                    {/* 🔹 Single unified button/link logic */}
                    <button
                        onClick={handleLearnMore}
                        className="ios-pill mt-3 inline-flex"
                    >
                        {t('roadmapCard_learnMore', { source: step.source })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoadmapStepCard;
