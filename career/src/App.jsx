import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CareerPlannerPage from './pages/CareerPlannerPage/CareerPlannerPage';
import AITutorPage from './pages/AITutorPage/AITutorPage';
import ScholarshipFinderPage from './pages/ScholarshipFinderPage/ScholarshipFinderPage';
import TeamProfile from './components/TeamProfile/TeamProfile';
import ThemeToggle from './components/shared/ThemeToggle';
import Sidebar from './components/sidebar/Sidebar';
import BottomNav from './components/sidebar/BottomNav'; // Import the BottomNav component

export default function App() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('planner'); 
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const navigateTo = (tabName) => {
        setActiveTab(tabName);
        setSidebarOpen(false);
    };

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
            case 'team':
                return <TeamProfile />;
            case 'planner':
            default:
                return <CareerPlannerPage />;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-slate-300">
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={navigateTo} />
            
            <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex-1 flex items-center">
                        <button onClick={toggleSidebar} className="p-2 mr-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('header_title')}</h1>
                    </div>
                    
                    <nav className="hidden md:flex justify-center space-x-1 md:space-x-4 flex-1">
                        <button
                            onClick={() => navigateTo('planner')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'planner' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            {t('nav_planner')}
                        </button>
                        <button
                            onClick={() => navigateTo('tutor')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'tutor' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            {t('nav_tutor')}
                        </button>
                        <button
                            onClick={() => navigateTo('scholarship')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'scholarship' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            {t('nav_scholarship')}
                        </button>
                        <button
                            onClick={() => navigateTo('team')}
                            className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'team' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                        >
                            {t('nav_team')}
                        </button>
                    </nav>
                    
                    <div className="flex-1 flex justify-end">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                </div>
            </header>

            <main className="pb-16 md:pb-0">
                {renderActiveTab()}
            </main>

            <footer className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm border-t dark:border-slate-700 mt-12">
                <p>Made by Devdeep. All Rights Reserved</p>
            </footer>
            
            <BottomNav activeTab={activeTab} onNavigate={navigateTo} />
        </div>
    );
}