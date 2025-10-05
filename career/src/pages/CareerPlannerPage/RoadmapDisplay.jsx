import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import RoadmapStepCard from './RoadmapStepCard';
import EmptyStateGraphic from './EmptyStateGraphic';

const RoadmapDisplay = ({ isLoading, roadmap }) => {
    const { t } = useTranslation();
    const [visibleCards, setVisibleCards] = useState([]);

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
        }, 500); // Delay between cards

        return () => clearInterval(interval);
    }, [roadmap]);

    return (
        <div className="lg:w-2/3 mt-12 lg:mt-0">
            {/* Titles always render */}
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {t('roadmapDisplay_title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-8">
                {t('roadmapDisplay_subtitle')}
            </p>

            {/* Loading skeleton */}
            {isLoading && (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-pulse"
                        ></div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && (!roadmap || roadmap.length === 0) && (
                <div className="flex justify-center">
                    <EmptyStateGraphic />
                </div>
            )}

            {/* Staggered roadmap cards */}
            {!isLoading && visibleCards.length > 0 && (
                <div className="space-y-8 relative">
                    <div
                        className="absolute left-6 top-0 h-full w-0.5 bg-gray-200 dark:bg-slate-700"
                        aria-hidden="true"
                    ></div>
                    <AnimatePresence>
                        {visibleCards.map((step, index) => (
                            step && (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative flex items-start"
                                >
                                    <div className="flex-shrink-0 w-12 flex flex-col items-center">
                                        <div className="h-4 w-4 rounded-full bg-indigo-500 mt-5 z-10 border-4 border-gray-50 dark:border-slate-900"></div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <RoadmapStepCard step={step} />
                                    </div>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default RoadmapDisplay;
