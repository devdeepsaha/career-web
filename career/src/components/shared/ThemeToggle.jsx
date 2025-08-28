import React from 'react';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';

const ThemeToggle = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center p-1 transition-colors duration-300"
            aria-label="Toggle theme"
        >
            <div className={`absolute w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}></div>
            <div className="flex justify-between w-full">
                <SunIcon />
                <MoonIcon />
            </div>
        </button>
    );
};

export default ThemeToggle;