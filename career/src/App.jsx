import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4'; // 1. Import Google Analytics

// Dynamically import pages for code splitting
const CareerPlannerPage = React.lazy(() => import('./pages/CareerPlannerPage/CareerPlannerPage'));
const AITutorPage = React.lazy(() => import('./pages/AITutorPage/AITutorPage'));
const ScholarshipFinderPage = React.lazy(() => import('./pages/ScholarshipFinderPage/ScholarshipFinderPage'));
const TeamProfile = React.lazy(() => import('./components/TeamProfile/TeamProfile'));

import ThemeToggle from './components/shared/ThemeToggle';
import Sidebar from './components/sidebar/Sidebar';
import BottomNav from './components/sidebar/BottomNav';

export default function App() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('planner'); 
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // --- 2. Add this useEffect to track page views ---
    useEffect(() => {
        // This sends a pageview event to Google Analytics every time the activeTab changes.
        ReactGA.send({ hitType: "pageview", page: `/${activeTab}`, title: activeTab });
    }, [activeTab]);

    // Theme Management useEffect
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const navigateTo = (tabName) => {
        setActiveTab(tabName);
        setSidebarOpen(false);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'tutor': return <AITutorPage />;
            case 'scholarship': return <ScholarshipFinderPage />;
            case 'team': return <TeamProfile />;
            case 'planner':
            default: return <CareerPlannerPage />;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-slate-300">
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={navigateTo} />
            
            <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
                <div className="container mx-auto px-4 relative h-16 flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                        <button onClick={toggleSidebar} className="p-2 mr-2 text-gray-600 dark:text-gray-300 hover:text-[#06402b] dark:hover:text-[#80ef80]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center">
                            <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto mr-3 block dark:hidden" />
                            <img src="/logo-light.png" alt="Logo" className="h-8 w-auto mr-3 hidden dark:block" />
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('header_title')}</h1>
                        </div>
                    </div>
                    
                    <nav className="hidden xl:flex justify-center w-full space-x-2">
                        <button onClick={() => navigateTo('planner')} className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'planner' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}>
                            {t('nav_planner')}
                        </button>
                        <button onClick={() => navigateTo('tutor')} className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'tutor' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}>
                            {t('nav_tutor')}
                        </button>
                        <button onClick={() => navigateTo('scholarship')} className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'scholarship' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}>
                            {t('nav_scholarship')}
                        </button>
                        <button onClick={() => navigateTo('team')} className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'team' ? 'bg-[#80ef80] text-[#06402b]' : 'text-gray-600 dark:text-slate-300 hover:bg-[#80ef80]/10 dark:hover:bg-[#80ef80]/20 hover:text-[#06402b]'}`}>
                            {t('nav_team')}
                        </button>
                    </nav>
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                </div>
            </header>

            <main className="pb-16 xl:pb-0">
                <Suspense fallback={<div className="text-center p-12">Loading...</div>}>
                    {renderActiveTab()}
                </Suspense>
            </main>

            <footer className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm border-t dark:border-slate-700 mt-12">
                <p>Made by Devdeep. All Rights Reserved</p>
            </footer>
            
            <BottomNav activeTab={activeTab} onNavigate={navigateTo} />
        </div>
    );
}