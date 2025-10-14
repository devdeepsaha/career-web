import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4';

// Dynamically import pages for code splitting
const CareerPlannerPage = React.lazy(() => import('./pages/CareerPlannerPage/CareerPlannerPage'));
const AITutorPage = React.lazy(() => import('./pages/AITutorPage/AITutorPage'));
const ScholarshipFinderPage = React.lazy(() => import('./pages/ScholarshipFinderPage/ScholarshipFinderPage'));
const TeamProfile = React.lazy(() => import('./components/TeamProfile/TeamProfile'));
const SupportPage = React.lazy(() => import('./pages/extra/Support'));
const PoliciesPage = React.lazy(() => import('./pages/extra/Policies'));
const ThankYouPage = React.lazy(() => import('./pages/extra/ThankYouPage'));


// Import auth and layout components
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ThemeToggle from './components/shared/ThemeToggle';
import Sidebar from './components/sidebar/Sidebar';
import BottomNav from './components/sidebar/BottomNav';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

export default function App() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('planner'); 
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // Authentication State
    const [currentUser, setCurrentUser] = useState(null);
    const [authView, setAuthView] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Google Analytics Page View Tracking
    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: `/${activeTab}`, title: activeTab });
    }, [activeTab]);

    // Theme Management
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Check for active session on initial app load
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const response = await fetch(`${API_URL}/check_session`, {credentials: 'include'});
                if (response.ok) {
                    const data = await response.json();
                    if (data.is_logged_in) {
                        setCurrentUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Could not check session:", error);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkUserSession();
    }, []);

    // Handle URL parameters for navigation (e.g., ?tab=thankyou)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
            // Clean up URL after navigation
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const navigateTo = (tabName) => {
        setActiveTab(tabName);
        setSidebarOpen(false);
    };

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setAuthView(null);
        setSidebarOpen(false);
    };

    const handleLogout = async () => {
        await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
        setCurrentUser(null);
        setSidebarOpen(false);
    };
    
    const showAuth = (view) => setAuthView(view);

    const renderActiveTab = () => {
        const pageProps = { currentUser, showAuth };
        switch (activeTab) {
            case 'tutor': return <AITutorPage {...pageProps} />;
            case 'scholarship': return <ScholarshipFinderPage {...pageProps} />;
            case 'team': return <TeamProfile {...pageProps} />;
            case 'support': return <SupportPage {...pageProps} />;
            case 'policies': return <PoliciesPage {...pageProps} />;
            case 'thankyou': return <ThankYouPage {...pageProps} />;
            case 'planner':
            default: return <CareerPlannerPage {...pageProps} />;
        }
    };
    
    if (isLoadingAuth) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 text-white">Loading...</div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-slate-300">
            
            {/* --- Auth Modal --- */}
            {authView && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    {authView === 'login' && (
                        <LoginPage
                            onLoginSuccess={handleLoginSuccess}
                            showSignup={() => setAuthView('signup')}
                            onClose={() => setAuthView(null)}
                        />
                    )}
                    {authView === 'signup' && (
                        <SignupPage
                            onLoginSuccess={handleLoginSuccess}
                            showLogin={() => setAuthView('login')}
                            onClose={() => setAuthView(null)}
                        />
                    )}
                </div>
            )}

            {/* --- Header with Sidebar Menu Button --- */}
            <header className="bg-white w-full dark:bg-slate-800 shadow-md sticky top-0 z-20">
                <div className="px-3 md:px-3 lg:px-3 w-full mx-auto relative h-16 flex items-center justify-between">

                    {/* Left: Animated Menu Button + Logo + Title */}
                    <div className="flex items-center gap-3">
                        {/* ✨ NEW: Sidebar with integrated menu button */}
                        <Sidebar 
                            isOpen={isSidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                            onOpen={() => setSidebarOpen(true)}
                            onNavigate={navigateTo}
                            currentUser={currentUser}
                            onLogout={handleLogout}
                            showAuth={showAuth}
                            menuButtonColor={theme === 'dark' ? '#e5e7eb' : '#374151'}
                            colors={['#B19EEF', '#5227FF']}
                            accentColor="#5227FF"
                            theme={theme}
                        />

                        <div className="flex items-center gap-3 ml-2">
                            <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto block dark:hidden" />
                            <img src="/logo-light.png" alt="Logo" className="h-8 w-auto hidden dark:block" />
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('header_title')}</h1>
                        </div>
                    </div>

                    {/* Center: Navigation tabs */}
                    <nav className="hidden xl:flex justify-center flex-1 space-x-2">
                        {['planner', 'tutor', 'scholarship'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => navigateTo(tab)}
                                className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${
                                    activeTab === tab
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {t(`nav_${tab}`)}
                            </button>
                        ))}
                    </nav>

                    {/* Right: Theme toggle + Auth buttons */}
                    <div className="flex items-center gap-5 ml-auto">
                        <ThemeToggle theme={theme} setTheme={setTheme} />

                        {currentUser ? (
                            <button
                                onClick={handleLogout}
                                className="hidden sm:block px-4 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 text-sm md:text-base"
                            >
                                {t('logout_button') || 'Logout'}
                            </button>
                        ) : (
                            <div
                                className="hidden sm:block relative inline-flex items-center justify-center group"
                                onClick={() => showAuth('login')}
                            >
                                <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-lg blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
                                <button
                                    className="relative inline-flex items-center justify-center text-sm md:text-base rounded-lg bg-gray-900 h-10 px-8 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
                                    title="login"
                                >
                                    {t('login_button') || 'Login'}
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 10 10"
                                        height="10"
                                        width="10"
                                        fill="none"
                                        className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
                                    >
                                        <path d="M0 5h7" className="transition opacity-0 group-hover:opacity-100"></path>
                                        <path d="M1 1l4 4-4 4" className="transition group-hover:translate-x-[3px]"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="pb-16 xl:pb-0">
                <Suspense fallback={<div className="text-center p-12 dark:text-white">Loading...</div>}>
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