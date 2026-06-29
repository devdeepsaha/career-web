import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Brain, Command, FileText, GraduationCap, LayoutDashboard, Library, LifeBuoy, LogOut, Menu, Route, Search, UserRound, Users, X } from 'lucide-react';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage/DashboardPage'));
const CareerPlannerPage = React.lazy(() => import('./pages/CareerPlannerPage/CareerPlannerPage'));
const AITutorPage = React.lazy(() => import('./pages/AITutorPage/AITutorPage'));
const ScholarshipFinderPage = React.lazy(() => import('./pages/ScholarshipFinderPage/ScholarshipFinderPage'));
const ScholarshipDetailPage = React.lazy(() => import('./pages/ScholarshipDetailPage/ScholarshipDetailPage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage/LibraryPage'));
const RoadmapStagePage = React.lazy(() => import('./pages/RoadmapStagePage/RoadmapStagePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage/ProfilePage'));
const TeamProfile = React.lazy(() => import('./components/TeamProfile/TeamProfile'));
const SupportPage = React.lazy(() => import('./pages/extra/Support'));
const PoliciesPage = React.lazy(() => import('./pages/extra/Policies'));
const ThankYouPage = React.lazy(() => import('./pages/extra/ThankYouPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage/LandingPage'));

import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import LogoMark from './components/shared/LogoMark';
import ThemeToggle from './components/shared/ThemeToggle';
import BottomNav from './components/sidebar/BottomNav';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'potho_auth_token';
let analyticsReady = null;
const GOOGLE_FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:opsz,wght@14..32,100..900&display=swap';

const loadDeferredFonts = () => {
    if (document.getElementById('potho-deferred-fonts')) return;
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.gstatic.com';
    preconnect.crossOrigin = '';
    document.head.appendChild(preconnect);
    const stylesheet = document.createElement('link');
    stylesheet.id = 'potho-deferred-fonts';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = GOOGLE_FONT_HREF;
    document.head.appendChild(stylesheet);
};

if (typeof window !== 'undefined' && !window.__pothoFetchPatched) {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (resource, options = {}) => {
        const url = typeof resource === 'string' ? resource : resource?.url;
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const isGuestMode = localStorage.getItem('guest_mode') === 'true';
        if (!url?.startsWith(API_URL)) return nativeFetch(resource, options);
        if (!token) {
            return nativeFetch(resource, options).then((response) => {
                if (response.status === 401 && !isGuestMode) window.dispatchEvent(new CustomEvent('potho-auth-lost'));
                return response;
            });
        }
        const headers = new Headers(options.headers || {});
        if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
        return nativeFetch(resource, { ...options, headers }).then((response) => {
            if (response.status === 401 && !isGuestMode) window.dispatchEvent(new CustomEvent('potho-auth-lost'));
            return response;
        });
    };
    window.__pothoFetchPatched = true;
}

const sendAnalyticsPageview = (page, title) => {
    const loadAnalytics = () => {
        analyticsReady = analyticsReady || import('react-ga4').then((module) => {
            module.default.initialize('G-54RKL82Q5C');
            return module.default;
        });
        analyticsReady.then((ReactGA) => ReactGA.send({ hitType: 'pageview', page, title })).catch(() => {});
    };

    window.setTimeout(() => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadAnalytics, { timeout: 8000 });
        } else {
            loadAnalytics();
        }
    }, 12000);
};
const tabToPath = {
    dashboard: '/dashboard',
    planner: '/planner',
    tutor: '/tutor',
    scholarship: '/scholarships',
    scholarshipDetail: '/scholarship-detail',
    library: '/library',
    stage: '/roadmap-stage',
    profile: '/profile',
    team: '/team',
    support: '/support',
    policies: '/policies',
    thankyou: '/thank-you',
};

const pageMeta = {
    dashboard: {
        title: 'Student Career Dashboard | Potho Prodorshok',
        description: 'Track roadmaps, mock tests, weak topics, saved questions, scholarships, and next actions in your AI career workspace.',
    },
    planner: {
        title: 'AI Career Roadmap Planner | Potho Prodorshok',
        description: 'Generate and save personalized career roadmaps from your skills, interests, exam goals, and student profile.',
    },
    tutor: {
        title: 'AI Tutor and Mock Tests | Potho Prodorshok',
        description: 'Practice exam questions, review mistakes, take mock tests, and get AI explanations for competitive exam preparation.',
    },
    scholarship: {
        title: 'Scholarship Eligibility Finder | Potho Prodorshok',
        description: 'Match scholarships by course, income, marks, gender, category, documents, deadlines, and application readiness.',
    },
    library: {
        title: 'Saved Learning Library | Potho Prodorshok',
        description: 'Open saved roadmaps, questions, mock tests, scholarships, chats, mistakes, and study resources in one place.',
    },
    profile: {
        title: 'Student Profile Settings | Potho Prodorshok',
        description: 'Manage the profile context used for AI roadmaps, tutoring, scholarships, recommendations, and saved progress.',
    },
};

const setDocumentMeta = (tabName) => {
    const meta = pageMeta[tabName] || {
        title: 'Potho Prodorshok | AI Career OS for Students',
        description: 'Plan careers, practice exams, find scholarships, save progress, and get AI-guided next actions for students in India.',
    };
    document.title = meta.title;
    const canonicalPath = tabToPath[tabName] || window.location.pathname || '/';
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${canonicalPath}`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    if (ogDescription) ogDescription.setAttribute('content', meta.description);
    if (ogUrl) ogUrl.setAttribute('content', `${window.location.origin}${canonicalPath}`);
};

const pathToTab = Object.fromEntries(Object.entries(tabToPath).map(([tab, path]) => [path, tab]));
const publicTabs = new Set(['team', 'support', 'policies', 'thankyou']);
const guestAllowedTabs = new Set(['dashboard', 'planner', 'tutor', 'scholarship', 'scholarshipDetail', 'team', 'support', 'policies']);
const guestUser = {
    email: 'Guest workspace',
    name: 'Guest workspace',
    is_guest: true,
};

const GuestUpgrade = ({ showAuth, onGuestHome }) => (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_24px_80px_rgba(15,23,42,0.10)] dark:bg-slate-950 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">Guest limit</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">Create an account to save this workspace</h1>
            <p className="mt-3 text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">
                Guest mode is for exploring the product. Saved roadmaps, profile memory, library, mock history, and long-term analytics need a real account.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button onClick={() => showAuth('signup')} className="pp-button">Create free account</button>
                <button onClick={onGuestHome} className="pp-button-secondary">Back to guest dashboard</button>
            </div>
        </div>
    </div>
);

const tabFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    return pathToTab[window.location.pathname] || 'dashboard';
};

export default function App() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState(() => tabFromLocation());
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [currentUser, setCurrentUser] = useState(null);
    const [authView, setAuthView] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('guest_mode') === 'true'));
    const [commandOpen, setCommandOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [commandResults, setCommandResults] = useState([]);
    const languageOptions = [
        { value: 'en', label: 'EN' },
        { value: 'hi', label: 'हिं' },
        { value: 'bn', label: 'বা' },
    ];

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);
    };

    useEffect(() => {
        setDocumentMeta(activeTab);
        sendAnalyticsPageview(`/${activeTab}`, activeTab);
    }, [activeTab]);

    useEffect(() => {
        const load = () => loadDeferredFonts();
        const timer = window.setTimeout(load, 10000);
        window.addEventListener('pointerdown', load, { once: true, passive: true });
        window.addEventListener('keydown', load, { once: true });
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('pointerdown', load);
            window.removeEventListener('keydown', load);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (currentUser) setCommandOpen(true);
            }
            if (event.key === 'Escape') setCommandOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentUser]);

    useEffect(() => {
        const handleAuthLost = () => {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem('guest_mode');
            setCurrentUser(null);
        };
        window.addEventListener('potho-auth-lost', handleAuthLost);
        return () => window.removeEventListener('potho-auth-lost', handleAuthLost);
    }, []);

    useEffect(() => {
        if (currentUser?.is_guest) {
            setCommandResults([]);
            return undefined;
        }
        if (!commandOpen || commandQuery.trim().length < 2) {
            setCommandResults([]);
            return undefined;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const response = await fetch(`${API_URL}/global-search?q=${encodeURIComponent(commandQuery)}`, {
                    credentials: 'include',
                    signal: controller.signal,
                });
                if (response.ok) setCommandResults(await response.json());
            } catch (error) {
                if (error.name !== 'AbortError') console.error('Search failed:', error);
            }
        }, 180);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [commandOpen, commandQuery, currentUser?.is_guest]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && savedLanguage !== i18n.language) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

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
                        if (data.auth_token) localStorage.setItem(AUTH_TOKEN_KEY, data.auth_token);
                        setCurrentUser(data.user);
                        localStorage.removeItem('guest_mode');
                    } else if (localStorage.getItem('guest_mode') === 'true') {
                        setCurrentUser(guestUser);
                    } else {
                        localStorage.removeItem(AUTH_TOKEN_KEY);
                        setCurrentUser(null);
                    }
                } else if (localStorage.getItem('guest_mode') === 'true') {
                    setCurrentUser(guestUser);
                } else {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('Could not check session:', error);
                if (localStorage.getItem('guest_mode') === 'true') {
                    setCurrentUser(guestUser);
                }
            } finally {
                setIsLoadingAuth(false);
            }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const loginParam = urlParams.get('login');
        const tokenParam = urlParams.get('token') || hashParams.get('token');
        const errorParam = urlParams.get('error');
        const hasStoredAuth = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
        const hasGuestMode = localStorage.getItem('guest_mode') === 'true';

        if (loginParam === 'success') {
            if (tokenParam) localStorage.setItem(AUTH_TOKEN_KEY, tokenParam);
            window.history.replaceState({}, '', window.location.pathname);
            checkUserSession();
        } else if (errorParam) {
            console.error('OAuth error:', errorParam);
            window.history.replaceState({}, '', window.location.pathname);
            setIsLoadingAuth(false);
        } else if (!hasStoredAuth && !hasGuestMode) {
            setCurrentUser(null);
            setIsLoadingAuth(false);
        } else if (hasGuestMode && !hasStoredAuth) {
            setCurrentUser(guestUser);
            setIsLoadingAuth(false);
        } else {
            checkUserSession();
        }
    }, []);

    useEffect(() => {
        const syncRoute = () => setActiveTab(tabFromLocation());
        window.addEventListener('popstate', syncRoute);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tab')) {
            const nextTab = tabFromLocation();
            window.history.replaceState({ tab: nextTab }, '', tabToPath[nextTab] || '/dashboard');
            setActiveTab(nextTab);
        }
        return () => window.removeEventListener('popstate', syncRoute);
    }, []);

    const navigateTo = (tabName, options = {}) => {
        if (currentUser?.is_guest && !guestAllowedTabs.has(tabName)) {
            setAuthView('signup');
            return;
        }
        setActiveTab(tabName);
        setCommandOpen(false);
        setMobileMenuOpen(false);
        const basePath = tabToPath[tabName] || '/dashboard';
        const path = `${basePath}${options.query ? `?${options.query}` : ''}`;
        const currentPath = `${window.location.pathname}${window.location.search}`;
        if (!options.replace && currentPath !== path) {
            window.history.pushState({ tab: tabName }, '', path);
        } else if (options.replace) {
            window.history.replaceState({ tab: tabName }, '', path);
        }
    };

    const handleCommandResult = (result) => {
        const routeByType = {
            roadmap: 'library',
            question: 'library',
            mock_test: 'library',
            scholarship: 'library',
            chat: 'library',
        };
        navigateTo(routeByType[result.type] || 'dashboard');
    };

    const handleLoginSuccess = (user, authToken) => {
        if (authToken) localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        setCurrentUser(user);
        localStorage.removeItem('guest_mode');
        setAuthView(null);
    };

    const handleLogout = async () => {
        if (!currentUser?.is_guest) {
            try {
                await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
        localStorage.removeItem('guest_mode');
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setCurrentUser(null);
    };

    const showAuth = (view) => setAuthView(view);

    const continueAsGuest = () => {
        localStorage.setItem('guest_mode', 'true');
        setCurrentUser(guestUser);
        setAuthView(null);
        navigateTo('dashboard', { replace: true });
    };

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
        if (currentUser?.is_guest && !guestAllowedTabs.has(activeTab)) {
            return (
                <GuestUpgrade
                    showAuth={showAuth}
                    onGuestHome={() => navigateTo('dashboard', { replace: true })}
                />
            );
        }
        switch (activeTab) {
            case 'dashboard': return <DashboardPage {...pageProps} onNavigate={navigateTo} />;
            case 'tutor': return <AITutorPage {...pageProps} />;
            case 'scholarship': return <ScholarshipFinderPage {...pageProps} onNavigate={navigateTo} />;
            case 'scholarshipDetail': return <ScholarshipDetailPage {...pageProps} onNavigate={navigateTo} />;
            case 'library': return <LibraryPage {...pageProps} onNavigate={navigateTo} />;
            case 'stage': return <RoadmapStagePage {...pageProps} onNavigate={navigateTo} />;
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

    if (currentUser?.is_guest && authView) {
        return renderAuthScreen();
    }

    if (!currentUser && !publicTabs.has(activeTab)) {
        const authScreen = renderAuthScreen();
        if (authScreen) return authScreen;

        return (
            <Suspense fallback={<div className="min-h-screen bg-[#050506]" />}>
                <LandingPage
                    onLogin={() => showAuth('login')}
                    onSignup={() => showAuth('signup')}
                    onGuest={continueAsGuest}
                    theme={theme}
                    setTheme={setTheme}
                    currentLanguage={i18n.language}
                    onLanguageChange={changeLanguage}
                />
            </Suspense>
        );
    }

    if (!currentUser && publicTabs.has(activeTab)) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                    <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">
                        <button onClick={() => { setActiveTab('dashboard'); window.history.pushState({}, '', '/'); }} className="flex items-center gap-2 text-sm font-semibold" aria-label="Go to landing page">
                            <LogoMark />
                            {t('header_title')}
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => showAuth('login')} className="pp-button-secondary">{t('landing_nav_login')}</button>
                            <button onClick={() => showAuth('signup')} className="pp-button">{t('landing_getStarted')}</button>
                        </div>
                    </div>
                </header>
                <Suspense fallback={<div className="p-12 text-center dark:text-white">Loading...</div>}>
                    {renderActiveTab()}
                </Suspense>
            </div>
        );
    }

    return (
        <div className="saas-shell">
            <header className="saas-topbar">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">
                    <button onClick={() => navigateTo('dashboard')} className="flex min-w-0 items-center gap-2 text-left" aria-label="Open dashboard">
                        <LogoMark />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-4 text-slate-950 dark:text-white">{t('header_title')}</p>
                            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">Career OS</p>
                        </div>
                    </button>

                    <div className="hidden min-w-0 flex-1 justify-center px-4 lg:flex">
                        <button onClick={() => setCommandOpen(true)} className="flex h-9 w-full max-w-xl items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition-[background-color,border-color] duration-150 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700" aria-label="Open command search">
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
                        {currentUser?.is_guest && (
                            <button onClick={() => showAuth('signup')} className="hidden rounded-md bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900 transition-[background-color,transform] duration-150 hover:bg-amber-200 active:scale-[0.96] md:block">
                                Guest mode
                            </button>
                        )}
                        <div className="hidden max-w-[240px] truncate rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 md:block">
                            {currentUser?.email || currentUser?.name || 'Signed in'}
                        </div>
                        <div className="hidden grid-cols-3 rounded-md border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-950 md:grid" aria-label={t('sidebar_language')}>
                            {languageOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => changeLanguage(option.value)}
                                    className={`h-8 min-w-8 rounded px-2 text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                                        i18n.language === option.value
                                            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                            : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                    type="button"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <div className="block">
                            <ThemeToggle theme={theme} setTheme={setTheme} />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-[background-color,border-color,color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white md:flex"
                            title={currentUser?.is_guest ? 'Exit guest mode' : (t('logout_button') || 'Logout')}
                            aria-label={currentUser?.is_guest ? 'Exit guest mode' : (t('logout_button') || 'Logout')}
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen((value) => !value)}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-[background-color,border-color,color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white lg:hidden"
                            title="Open menu"
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            type="button"
                        >
                            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="border-t border-slate-200 bg-white px-3 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950 lg:hidden">
                        <div className="mb-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{currentUser?.email || currentUser?.name || 'Active user'}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{currentUser?.is_guest ? 'Guest preview workspace' : 'Signed in workspace'}</p>
                        </div>
                        <nav className="grid gap-1">
                            {dashboardNavItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigateTo(item.id)}
                                        className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                                            activeTab === item.id
                                                ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                                        }`}
                                        type="button"
                                    >
                                        <IconComponent className="h-4 w-4 shrink-0" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                        <div className="mt-3">
                            <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-950" aria-label={t('sidebar_language')}>
                                {languageOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => changeLanguage(option.value)}
                                        className={`h-9 rounded-md px-2 text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                                            i18n.language === option.value
                                                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                                : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                                        }`}
                                        type="button"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {currentUser?.is_guest && (
                                <button onClick={() => showAuth('signup')} className="pp-button flex items-center justify-center">Save workspace</button>
                            )}
                            <button onClick={handleLogout} className="pp-button-secondary flex items-center justify-center gap-2">
                                <LogOut className="h-4 w-4" />
                                {currentUser?.is_guest ? 'Exit guest mode' : (t('logout_button') || 'Logout')}
                            </button>
                        </div>
                    </div>
                )}
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
                        {currentUser?.is_guest && (
                            <button onClick={() => showAuth('signup')} className="mt-2 w-full rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.96] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                                Save this workspace
                            </button>
                        )}
                    </div>
                </aside>

                <main className="min-w-0 flex-1 pb-20 lg:pb-0">
                    <Suspense fallback={<div className="p-12 text-center dark:text-white">Loading...</div>}>
                        {renderActiveTab()}
                    </Suspense>
                </main>
            </div>


            <BottomNav activeTab={activeTab} onNavigate={navigateTo} />

            {commandOpen && (
                <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/40 p-3 pt-20 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                autoFocus
                                value={commandQuery}
                                onChange={(event) => setCommandQuery(event.target.value)}
                                className="h-9 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                                placeholder="Search roadmaps, saved questions, chats, scholarships..."
                            />
                            <button onClick={() => setCommandOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:hover:bg-slate-900" aria-label="Close command search">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="max-h-[60dvh] overflow-y-auto p-2">
                            {commandQuery.trim().length < 2 && (
                                <div className="p-4 text-sm text-slate-500 dark:text-slate-400">Type at least two characters to search your workspace.</div>
                            )}
                            {commandQuery.trim().length >= 2 && commandResults.length === 0 && (
                                <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No results yet.</div>
                            )}
                            {commandResults.map((result) => (
                                <button key={`${result.type}-${result.id}`} onClick={() => handleCommandResult(result)} className="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:hover:bg-slate-900">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{result.title}</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{result.type} {result.detail ? `| ${result.detail}` : ''}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
