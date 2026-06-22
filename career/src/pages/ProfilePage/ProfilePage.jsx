import React, { useEffect, useState } from 'react';
import { Save, UserRound } from 'lucide-react';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const emptyProfile = {
    status: '',
    education: '',
    skills: '',
    interests: '',
    goals: '',
    target_companies: '',
    target_exams: '',
    preferred_language: 'en',
};

const ProfilePage = ({ currentUser }) => {
    const [profile, setProfile] = useState(emptyProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/student-profile`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (data) setProfile({ ...emptyProfile, ...data });
                }
            } catch (error) {
                console.error(error);
                setMessage('Profile could not load.');
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const updateField = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            const response = await fetch(`${API_URL}/student-profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (!response.ok) throw new Error('Save failed');
            const data = await response.json();
            setProfile({ ...emptyProfile, ...data });
            setMessage('Profile saved.');
        } catch (error) {
            console.error(error);
            setMessage('Profile could not be saved.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6"><div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" /></div>;
    }

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Profile & Settings</p>
                <h1 className="pp-page-title">Your student context</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">Keep this updated so roadmaps, questions, scholarships, and recommendations become more personal.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <form onSubmit={saveProfile} className="saas-card p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="pp-label">Current status</label>
                            <input value={profile.status || ''} onChange={(event) => updateField('status', event.target.value)} className="pp-input" placeholder="Class 12th student, graduate, dropper..." />
                        </div>
                        <div>
                            <label className="pp-label">Education</label>
                            <input value={profile.education || ''} onChange={(event) => updateField('education', event.target.value)} className="pp-input" placeholder="Science, commerce, B.Tech, BA..." />
                        </div>
                        <div>
                            <label className="pp-label">Preferred language</label>
                            <select value={profile.preferred_language || 'en'} onChange={(event) => updateField('preferred_language', event.target.value)} className="pp-input">
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="bn">Bengali</option>
                            </select>
                        </div>
                        <div>
                            <label className="pp-label">Target exams</label>
                            <input value={profile.target_exams || ''} onChange={(event) => updateField('target_exams', event.target.value)} className="pp-input" placeholder="JEE, NEET, UPSC, CAT..." />
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div>
                            <label className="pp-label">Skills</label>
                            <textarea rows="4" value={profile.skills || ''} onChange={(event) => updateField('skills', event.target.value)} className="pp-input" placeholder="Python, communication, lab research..." />
                        </div>
                        <div>
                            <label className="pp-label">Interests</label>
                            <textarea rows="4" value={profile.interests || ''} onChange={(event) => updateField('interests', event.target.value)} className="pp-input" placeholder="Machine learning, biology, design..." />
                        </div>
                        <div>
                            <label className="pp-label">Career goals</label>
                            <textarea rows="4" value={profile.goals || ''} onChange={(event) => updateField('goals', event.target.value)} className="pp-input" placeholder="Doctor, IAS officer, software engineer..." />
                        </div>
                        <div>
                            <label className="pp-label">Target companies or institutions</label>
                            <textarea rows="4" value={profile.target_companies || ''} onChange={(event) => updateField('target_companies', event.target.value)} className="pp-input" placeholder="IIT, Google, government service..." />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button disabled={isSaving} className="pp-button flex items-center justify-center gap-2">
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save profile'}
                        </button>
                        {message && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>}
                    </div>
                </form>

                <aside className="space-y-4">
                    <div className="saas-card p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <UserRound className="h-5 w-5" />
                        </div>
                        <h2 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Account</h2>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{currentUser?.email || 'Signed in'}</p>
                    </div>
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Personalization</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Planner inputs can sync back into this profile, and future dashboards use it to suggest better next actions.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ProfilePage;
