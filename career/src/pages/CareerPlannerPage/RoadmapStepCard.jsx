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
        <div
            className={`p-6 rounded-xl shadow-lg border-l-4 ${config.borderColor} ${config.bgColor} transform transition-transform hover:scale-[1.02] hover:shadow-xl`}
        >
            <div className="flex items-start sm:items-center space-x-4">
                <div className="flex-shrink-0">{config.icon}</div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{config.title}</p>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1">{step.title}</h3>
                    <p className="text-gray-600 dark:text-slate-300 mt-2">{step.description}</p>

                    {/* 🔹 Single unified button/link logic */}
                    <button
                        onClick={handleLearnMore}
                        className="inline-block mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        {t('roadmapCard_learnMore', { source: step.source })} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoadmapStepCard;
