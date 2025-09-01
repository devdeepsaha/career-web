import React from 'react';
import Lottie from 'lottie-react';

const LottieDisplay = ({ lightAnimation, darkAnimation, text, size = 'sm' }) => {
    // Determine which animation to show
    const isDarkMode = document.documentElement.classList.contains('dark');
    const animationData = isDarkMode ? darkAnimation : lightAnimation;

    // Define size classes
    const sizeClasses = {
        sm: 'max-w-sm', // 384px
        md: 'max-w-md', // 512px
        lg: 'max-w-lg', // 576px
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Lottie 
                animationData={animationData} 
                loop={true} 
                className={`w-full ${sizeClasses[size] || sizeClasses.sm}`} 
            />
            {text && (
                <p className="text-gray-500 dark:text-slate-400 mt-4 text-lg">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LottieDisplay;