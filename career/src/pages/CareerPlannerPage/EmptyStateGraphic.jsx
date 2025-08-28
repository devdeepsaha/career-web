import React from 'react';

const EmptyStateGraphic = () => (
    <div className="lg:w-2/3 mt-12 lg:mt-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-md h-64">
            <div className="absolute top-0 left-10 w-24 h-24 bg-indigo-200 dark:bg-indigo-900/50 rounded-full animate-blob"></div>
            <div className="absolute top-0 right-10 w-28 h-28 bg-green-200 dark:bg-green-900/50 rounded-full animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-20 w-20 h-20 bg-sky-200 dark:bg-sky-900/50 rounded-full animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-5 right-16 w-16 h-16 bg-yellow-200 dark:bg-yellow-900/50 rounded-full animate-blob animation-delay-1000"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-center text-gray-500 dark:text-slate-400">Your personalized roadmap will appear here...</p>
            </div>
        </div>
    </div>
);

export default EmptyStateGraphic;