import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const LottieDisplay = ({ lightAnimation, darkAnimation, text }) => {
    // State to hold the currently active animation data
    const [currentAnimation, setCurrentAnimation] = useState(lightAnimation);

    useEffect(() => {
        // Function to set the animation based on the current theme
        const updateAnimation = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setCurrentAnimation(isDarkMode ? darkAnimation : lightAnimation);
        };

        // 1. Set the initial animation when the component mounts
        updateAnimation();

        // 2. Set up a MutationObserver to react to theme changes
        // This watches the <html> tag for changes in its 'class' attribute
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateAnimation();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // 3. Clean up the observer when the component unmounts
        return () => observer.disconnect();
    }, [lightAnimation, darkAnimation]); // Dependency array: re-run if provided animations change

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Lottie 
                animationData={currentAnimation} // Use the state variable
                loop={true}
                className='w-full' 
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