import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4';
import { Brain, Command, FileText, GraduationCap, LayoutDashboard, Library, LifeBuoy, LogOut, Route, Search, UserRound, Users } from 'lucide-react';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage/DashboardPage'));
const CareerPlannerPage = React.lazy(() => import('./pages/CareerPlannerPage/CareerPlannerPage'));
const AITutorPage = React.lazy(() => import('./pages/AITutorPage/AITutorPage'));
const ScholarshipFinderPage = React.lazy(() => import('./pages/ScholarshipFinderPage/ScholarshipFinderPage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage/LibraryPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage/ProfilePage'));
const TeamProfile = React.lazy(() => import('./components/TeamProfile/TeamProfile'));
const SupportPage = React.lazy(() => import('./pages/extra/Support'));
const PoliciesPage = React.lazy(() => import('./pages/extra/Policies'));
const ThankYouPage = React.lazy(() => import('./pages/extra/ThankYouPage'));

import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ThemeToggle from './components/shared/ThemeToggle';
import BottomNav from './components/sidebar/BottomNav';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

export default function App() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [currentUser, setCurrentUser] = useState(null);
    const [authView, setAuthView] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: `/${activeTab}`, title: activeTab });
    }, [activeTab]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const response = await fetch(`${API_URL}/check_session`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.is_logged_in) {
                        setCurrentUser(data.user);
                    }
                }
            } catch (error) {
                console.error('Could not check session:', error);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const loginParam = urlParams.get('login');
        const errorParam = urlParams.get('error');

        if (loginParam === 'success') {
            window.history.replaceState({}, '', window.location.pathname);
            setTimeout(() => checkUserSession(), 500);
        } else if (errorParam) {
            console.error('OAuth error:', errorParam);
            window.history.replaceState({}, '', window.location.pathname);
            setIsLoadingAuth(false);
        } else {
            checkUserSession();
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const navigateTo = (tabName) => {
        setActiveTab(tabName);
    };

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setAuthView(null);
    };

    const handleLogout = async () => {
        await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
        setCurrentUser(null);
    };

    const showAuth = (view) => setAuthView(view);

    const renderAuthScreen = () => {
        if (authView === 'login') {
            return (
                <LoginPage
                    onLoginSuccess={handleLoginSuccess}
                    showSignup={() => setAuthView('signup')}
                    onClose={() => setAuthView(null)}
                />
            );
        }

        if (authView === 'signup') {
            return (
                <SignupPage
                    onLoginSuccess={handleLoginSuccess}
                    showLogin={() => setAuthView('login')}
                    onClose={() => setAuthView(null)}
                />
            );
        }

        return null;
    };

    const renderActiveTab = () => {
        const pageProps = { currentUser, showAuth };
        switch (activeTab) {
            case 'dashboard': return <DashboardPage {...pageProps} onNavigate={navigateTo} />;
            case 'tutor': return <AITutorPage {...pageProps} />;
            case 'scholarship': return <ScholarshipFinderPage {...pageProps} />;
            case 'library': return <LibraryPage {...pageProps} />;
            case 'profile': return <ProfilePage {...pageProps} />;
            case 'team': return <TeamProfile {...pageProps} />;
            case 'support': return <SupportPage {...pageProps} />;
            case 'policies': return <PoliciesPage {...pageProps} />;
            case 'thankyou': return <ThankYouPage {...pageProps} />;
            case 'planner':
            default: return <CareerPlannerPage {...pageProps} />;
        }
    };

    const dashboardNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'planner', label: t('nav_planner'), icon: Route },
        { id: 'tutor', label: t('nav_tutor'), icon: Brain },
        { id: 'scholarship', label: t('nav_scholarship'), icon: GraduationCap },
        { id: 'library', label: 'Library', icon: Library },
        { id: 'profile', label: 'Profile', icon: UserRound },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'support', label: 'Support', icon: LifeBuoy },
        { id: 'policies', label: 'Policies', icon: FileText },
    ];

    if (isLoadingAuth) {
        return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-white">Loading...</div>;
    }

    if (!currentUser) {
        const authScreen = renderAuthScreen();
        if (authScreen) return authScreen;

        return (
            <LandingPage
                onLogin={() => showAuth('login')}
                onSignup={() => showAuth('signup')}
                theme={theme}
                setTheme={setTheme}
            />
        );
    }

    return (
        <div className="saas-shell">
            <header className="saas-topbar">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">
                    <button onClick={() => navigateTo('dashboard')} className="flex min-w-0 items-center gap-2 text-left">
                        <img src="/logo-dark.png" alt="Logo" className="block h-8 w-auto dark:hidden" />
                        <img src="/logo-light.png" alt="Logo" className="hidden h-8 w-auto dark:block" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-4 text-slate-950 dark:text-white">{t('header_title')}</p>
                            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">Career OS</p>
                        </div>
                    </button>

                    <div className="hidden min-w-0 flex-1 justify-center px-4 lg:flex">
                        <button className="flex h-9 w-full max-w-xl items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition-[background-color,border-color] duration-150 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700">
                            <span className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search roadmaps, topics, scholarships...
                            </span>
                            <span className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                                <Command className="h-3 w-3" />K
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden max-w-[240px] truncate rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 md:block">
                            {currentUser?.email || currentUser?.name || 'Signed in'}
                        </div>
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <button
                            onClick={handleLogout}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-[background-color,border-color,color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
                            title={t('logout_button') || 'Logout'}
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-screen-2xl">
                <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Workspace</p>
                        <h2 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">Command Center</h2>
                    </div>

                    <nav className="space-y-0.5 p-2">
                        {dashboardNavItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                            <button
                                key={item.id}
                                onClick={() => navigateTo(item.id)}
                                className={`flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm font-medium transition-[background-color,color] duration-150 ${
                                    activeTab === item.id
                                        ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <IconComponent className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto border-t border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Session</p>
                        <p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">{currentUser?.email || currentUser?.name || 'Active user'}</p>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 pb-20 lg:pb-0">
                    <Suspense fallback={<div className="p-12 text-center dark:text-white">Loading...</div>}>
                        {renderActiveTab()}
                    </Suspense>
                </main>
            </div>


            <BottomNav activeTab={activeTab} onNavigate={navigateTo} />
        </div>
    );
}
