import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserInputForm from './UserInputForm';
import RoadmapDisplay from './RoadmapDisplay';
import EmptyStateGraphic from './EmptyStateGraphic';
import CareerPlannerChatbot from '../../components/chat/CareerPlannerChatbot';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const hasLetters = (value = '') => /\p{L}/u.test(String(value));
const isControlCharacter = (char) => {
    const code = char.charCodeAt(0);
    return code === 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13);
};
const hasControlCharacters = (value = '') => Array.from(String(value)).some(isControlCharacter);
const hasUnsafeMarkup = (value = '') => /[<>]/.test(String(value));
const cleanInput = (value = '') => Array.from(String(value)).map((char) => (isControlCharacter(char) ? ' ' : char)).join('').replace(/\s+/g, ' ').trim();

const roadmapInputWarning = (value, label) => {
    const text = cleanInput(value);
    if (!text) return '';
    if (hasControlCharacters(value)) return `Remove hidden characters from ${label.toLowerCase()}.`;
    if (hasUnsafeMarkup(text)) return `Remove < or > from ${label.toLowerCase()}.`;
    if (!hasLetters(text)) return `${label} should include words, not only numbers or symbols.`;
    return '';
};

const CareerPlannerPage = ({ currentUser, showAuth }) => {
    const { t, i18n } = useTranslation();

    // Form State
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');
    const [goals, setGoals] = useState('');
    const [roadmap, setRoadmap] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);
    const [targetCompanies, setTargetCompanies] = useState('');
    const [status, setStatus] = useState('Class 12th Student');
    const [education, setEducation] = useState('');
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const [savedRoadmapMeta, setSavedRoadmapMeta] = useState(null);
    const [syncProfile, setSyncProfile] = useState(true);
    const [inputsCollapsed, setInputsCollapsed] = useState(false);
    const inputWarnings = {
        skills: roadmapInputWarning(skills, 'Skills'),
        interests: roadmapInputWarning(interests, 'Interests'),
        goals: roadmapInputWarning(goals, 'Career goal'),
        education: roadmapInputWarning(education, 'Education'),
        targetCompanies: roadmapInputWarning(targetCompanies, 'Target companies or institutions'),
    };

    const loadSavedRoadmaps = useCallback(async () => {
        if (!currentUser || currentUser?.is_guest) return;
        try {
            const response = await fetch(`${API_URL}/roadmaps`, { credentials: 'include' });
            if (response.ok) setSavedRoadmaps(await response.json());
        } catch (err) {
            console.error('Failed to load roadmaps:', err);
        }
    }, [currentUser]);

    useEffect(() => {
        const loadProfile = async () => {
            if (!currentUser || currentUser?.is_guest) return;
            try {
                const response = await fetch(`${API_URL}/student-profile`, { credentials: 'include' });
                if (!response.ok) return;
                const profile = await response.json();
                if (!profile) return;
                setSkills(profile.skills || '');
                setInterests(profile.interests || '');
                setGoals(profile.goals || '');
                setStatus(profile.status || 'Class 12th Student');
                setEducation(profile.education || '');
                setTargetCompanies(profile.target_companies || '');
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        };

        loadProfile();
        loadSavedRoadmaps();
    }, [currentUser, loadSavedRoadmaps]);

    const openSavedRoadmap = async (id) => {
        try {
            const response = await fetch(`${API_URL}/roadmaps/${id}`, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to open roadmap');
            const data = await response.json();
            setRoadmap(data.roadmap_json || []);
            setSavedRoadmapMeta(data);
            setIsRoadmapVisible(true);
            setInputsCollapsed(true);
        } catch (err) {
            console.error('Failed to open roadmap:', err);
        }
    };

    const archiveRoadmap = async (id) => {
        try {
            await fetch(`${API_URL}/roadmaps/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' }),
            });
            loadSavedRoadmaps();
        } catch (err) {
            console.error('Failed to archive roadmap:', err);
        }
    };

    const generateRoadmap = async (e) => {
        e.preventDefault();

        // Show App-level login modal if not logged in
        if (!currentUser) {
            showAuth('login');
            return;
        }

        const blockingWarning = inputWarnings.skills || inputWarnings.interests || inputWarnings.goals || inputWarnings.education || inputWarnings.targetCompanies;
        if (blockingWarning) {
            setError(blockingWarning || t('careerPlanner_error_fillFields'));
            return;
        }

        if (!cleanInput(skills) || !cleanInput(interests) || !cleanInput(goals)) {
            setError(t('careerPlanner_error_fillFields'));
            return;
        }

        setError('');
        setIsLoading(true);
        setRoadmap([]);
        setIsRoadmapVisible(true);

        try {
            const response = await fetch(`${API_URL}/generate-roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills: cleanInput(skills),
                    interests: cleanInput(interests),
                    goals: cleanInput(goals),
                    status,
                    targetCompanies: cleanInput(targetCompanies),
                    education: cleanInput(education),
                    language: i18n.language,
                    save: !currentUser?.is_guest,
                    update_profile: !currentUser?.is_guest && syncProfile,
                    title: goals || 'Career roadmap',
                }),
                credentials: currentUser?.is_guest ? 'same-origin' : 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const payload = await response.json();
            const generatedSteps = Array.isArray(payload) ? payload : payload.roadmap;
            setRoadmap(generatedSteps);
            setSavedRoadmapMeta(Array.isArray(payload) ? null : payload.saved_roadmap);
            setInputsCollapsed(true);
            if (!currentUser?.is_guest) loadSavedRoadmaps();
        } catch (err) {
            console.error('Failed to fetch roadmap:', err);
            setError(currentUser?.is_guest ? 'Guest roadmaps are previews only. Create an account if this endpoint requires saved workspace access.' : t('careerPlanner_error_generateFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            {/* SEO Tags */}
            <title>Plan your career today! | Potho-Prodorshok</title>
            <meta
                name="description"
                content="Use our AI-powered Career Planner to create a personalized roadmap based on your skills, interests, and goals. Start planning your future today!"
            />

            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 xl:flex-row xl:items-end xl:justify-between">
                <div>
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">AI Career Advisor</p>
                <h1 className="pp-page-title max-w-3xl">
                    {t('careerPlanner_title')}
                </h1>
                <p className="pp-page-copy mt-1 max-w-3xl">
                    {t('careerPlanner_subtitle')}
                </p>
                </div>
                {currentUser?.is_guest && (
                    <button onClick={() => showAuth('signup')} className="rounded-md bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900 transition-[background-color,transform] duration-150 hover:bg-amber-200 active:scale-[0.96] dark:bg-amber-950/40 dark:text-amber-200">
                        Sign up to save generated plans
                    </button>
                )}
                <div className="grid w-full grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-950 xl:w-auto">
                    {['Profile', 'Roadmap', 'Action'].map((item, index) => (
                        <div key={item} className="min-w-28 border-r border-slate-200 px-3 py-2 last:border-r-0 dark:border-slate-800">
                            <p className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">0{index + 1}</p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)_320px]">
                <UserInputForm
                    skills={skills}
                    setSkills={setSkills}
                    interests={interests}
                    setInterests={setInterests}
                    goals={goals}
                    setGoals={setGoals}
                    status={status}
                    setStatus={setStatus}
                    targetCompanies={targetCompanies}
                    setTargetCompanies={setTargetCompanies}
                    education={education}
                    setEducation={setEducation}
                    syncProfile={syncProfile}
                    setSyncProfile={setSyncProfile}
                    generateRoadmap={generateRoadmap}
                    isLoading={isLoading}
                    error={error}
                    inputWarnings={inputWarnings}
                    isCollapsed={inputsCollapsed}
                    onToggleCollapsed={() => setInputsCollapsed((value) => !value)}
                    hasOutput={isRoadmapVisible && roadmap.length > 0}
                />
                <div className="space-y-4">
                {!isRoadmapVisible ? (
                    <div>
                        <div className="saas-card min-h-[540px] p-4">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <div>
                                    <p className="saas-meta">Roadmap Canvas</p>
                                    <h2 className="saas-section-title mt-1">{t('roadmapDisplay_title')}</h2>
                                </div>
                                <span className="ios-pill hidden sm:inline-flex">Awaiting Input</span>
                            </div>
                            <EmptyStateGraphic />
                        </div>
                    </div>
                ) : (
                    <RoadmapDisplay isLoading={isLoading} roadmap={roadmap} savedRoadmapMeta={savedRoadmapMeta} currentUser={currentUser} />
                )}
                    {savedRoadmaps.length > 0 && (
                        <div className="saas-card p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="saas-section-title">Saved roadmaps</h3>
                                <span className="saas-meta tabular-nums">{savedRoadmaps.length} total</span>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                                {savedRoadmaps.slice(0, 4).map((item) => (
                                    <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.step_count} steps · {item.status}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => openSavedRoadmap(item.id)} className="ios-pill">Open</button>
                                            <button onClick={() => archiveRoadmap(item.id)} className="ios-pill">Archive</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <aside className="hidden 2xl:block">
                    <div className="saas-card p-4">
                        <h3 className="saas-section-title">Plan intelligence</h3>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                <p className="saas-meta">Profile completeness</p>
                                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{skills && interests && goals ? 'Ready' : 'Needs input'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                <p className="saas-meta">Generated steps</p>
                                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">{roadmap.length}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                <p className="saas-meta">Next action</p>
                                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">Complete the profile and generate your first roadmap.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <CareerPlannerChatbot />
        </div>
    );
};

export default CareerPlannerPage;
