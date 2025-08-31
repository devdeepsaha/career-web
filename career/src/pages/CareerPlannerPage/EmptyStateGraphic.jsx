import React from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';

// Import both of your animation files
import lightAnimation from '../../assets/cat-dark.json';
import darkAnimation from '../../assets/cat.json';

const EmptyStateGraphic = () => {
    const { t } = useTranslation();

    // Check if the dark class is on the html element to detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="lg:w-2/3 mt-1 lg:mt-0 flex flex-col items-center justify-top p-8">
            <Lottie 
                // Conditionally choose which animation to play based on the theme
                animationData={isDarkMode ? darkAnimation : lightAnimation} 
                loop={true} 
                className="w-full max-w-lg" 
            />
            <p className="text-center text-gray-500 dark:text-slate-400 mt-4 text-lg">
                {t('emptyState_roadmapText')}
            </p>
        </div>
    );
};

export default EmptyStateGraphic;