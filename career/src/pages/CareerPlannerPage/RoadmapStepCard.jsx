import React from 'react';
import { stepTypeConfig } from './stepTypeConfig.jsx';

const RoadmapStepCard = ({ step }) => {
    const config = stepTypeConfig[step.type] || {};
    return (
        <div className={`p-6 rounded-xl shadow-lg border-l-4 ${config.borderColor} ${config.bgColor} transform transition-transform hover:scale-[1.02] hover:shadow-xl`}>
            <div className="flex items-start sm:items-center space-x-4">
                <div className="flex-shrink-0">{config.icon}</div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{config.title}</p>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1">{step.title}</h3>
                    <p className="text-gray-600 dark:text-slate-300 mt-2">{step.description}</p>
                    <a href={step.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                        Learn More from {step.source} &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RoadmapStepCard;