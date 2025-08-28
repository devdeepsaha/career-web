import React, { useState, useEffect } from 'react';
import CareerPlannerPage from './pages/CareerPlannerPage/CareerPlannerPage';
import AITutorPage from './pages/AITutorPage/AITutorPage';
import ScholarshipFinderPage from './pages/ScholarshipFinderPage/ScholarshipFinderPage';
import ThemeToggle from './components/shared/ThemeToggle';

export default function App() {
    const [activeTab, setActiveTab] = useState('planner');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'tutor':
                return <AITutorPage />;
            case 'scholarship':
                return <ScholarshipFinderPage />;
            case 'planner':
            default:
                return <CareerPlannerPage />;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-slate-300">
            <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex-1"></div> {/* Spacer */}
                    <nav className="flex justify-center space-x-2 md:space-x-6 flex-1">
                        <button
                            onClick={() => setActiveTab('planner')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'planner' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            Career Planner
                        </button>
                        <button
                            onClick={() => setActiveTab('tutor')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'tutor' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            AI Tutor
                        </button>
                        <button
                            onClick={() => setActiveTab('scholarship')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'scholarship' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            Scholarship Finder
                        </button>
                    </nav>
                    <div className="flex-1 flex justify-end">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                </div>
            </header>

            <main>
                {renderActiveTab()}
            </main>

            <footer className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm border-t dark:border-slate-700 mt-12">
                <p>Made by Devdeep. All Rights Reserved</p>
            </footer>
        </div>
    );
}