import React from 'react';
import { useTranslation } from 'react-i18next'; // Import the hook
import RoadmapStepCard from './RoadmapStepCard';

const RoadmapDisplay = ({ isLoading, roadmap }) => {
    const { t } = useTranslation(); // Initialize the hook

    return (
        <div className="lg:w-2/3 mt-12 lg:mt-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('roadmapDisplay_title')}</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-8">{t('roadmapDisplay_subtitle')}</p>
            {isLoading && (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-pulse">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full mr-4"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!isLoading && roadmap.length > 0 && (
                <div className="relative">
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true"></div>
                    <div className="space-y-8">
                        {roadmap.map((step, index) => (
                            <div key={index} className="relative flex items-start">
                                <div className="flex-shrink-0 w-12 flex flex-col items-center">
                                    <div className="h-4 w-4 rounded-full bg-indigo-500 mt-5 z-10 border-4 border-gray-50 dark:border-slate-900"></div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <RoadmapStepCard step={step} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoadmapDisplay;