import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';

// Import both of your animation files
import lightAnimation from '../../assets/cat.json';
import darkAnimation from '../../assets/cat-dark.json';

const EmptyStateGraphic = () => {
    const { t } = useTranslation();
    const [currentAnimation, setCurrentAnimation] = useState(lightAnimation);

    useEffect(() => {
        // This function will run every time the component loads AND every time the theme changes
        const checkTheme = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setCurrentAnimation(isDarkMode ? darkAnimation : lightAnimation);
        };

        // Run it once on mount
        checkTheme();

        // We can't directly listen for class changes, but we can use an interval as a simple
        // way to check, or better yet, a MutationObserver. Let's use an observer.
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Cleanup the observer when the component unmounts
        return () => observer.disconnect();
    }, []); // The empty dependency array means this effect runs only once on mount and cleans up on unmount

    return (
        <div className="lg:w-2/3 mt-1 lg:mt-0 flex flex-col items-center justify-top p-8">
            <Lottie 
                animationData={currentAnimation} 
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