import React, { useEffect, useState } from 'react';
import { Check, Save, UserRound } from 'lucide-react';

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

const branchOptions = [
    'Systems / EDP',
    'Mining',
    'Electrical',
    'Mechanical',
    'Civil',
    'Finance',
    'Personnel & HR',
    'Materials Management',
    'Marketing & Sales',
    'Legal',
    'Environment',
    'Geology',
];

const readTag = (text = '', label) => {
    const match = text.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
    return match?.[1]?.trim() || '';
};

const stripTags = (text = '') => (
    text
        .split('\n')
        .filter((line) => !/^(Branch|Preferred subjects|Region|Annual family income):/i.test(line.trim()))
        .join('\n')
        .trim()
);

const normalizeProfile = (data) => ({
    ...emptyProfile,
    ...data,
    target_exams: stripTags(data?.target_exams || ''),
    exam_branch: readTag(data?.target_exams || '', 'Branch'),
    preferred_subjects: readTag(data?.target_exams || '', 'Preferred subjects'),
    region: readTag(data?.target_exams || '', 'Region'),
    annual_income: readTag(data?.target_exams || '', 'Annual family income'),
});

const serializeProfile = (profile) => {
    const tags = [
        profile.exam_branch ? `Branch: ${profile.exam_branch}` : '',
        profile.preferred_subjects ? `Preferred subjects: ${profile.preferred_subjects}` : '',
        profile.region ? `Region: ${profile.region}` : '',
        profile.annual_income ? `Annual family income: ${profile.annual_income}` : '',
    ].filter(Boolean);

    return {
        ...profile,
        target_exams: [stripTags(profile.target_exams || ''), ...tags].filter(Boolean).join('\n'),
    };
};

const ProfilePage = ({ currentUser }) => {
    const [profile, setProfile] = useState(emptyProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveState, setSaveState] = useState('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/student-profile`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (data) setProfile(normalizeProfile(data));
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
        setSaveState('idle');
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setSaveState('saving');
        setMessage('');
        try {
            const response = await fetch(`${API_URL}/student-profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serializeProfile(profile)),
            });
            if (!response.ok) throw new Error('Save failed');
            const data = await response.json();
            setProfile(normalizeProfile(data));
            setSaveState('saved');
            setMessage('Profile saved.');
        } catch (error) {
            console.error(error);
            setSaveState('idle');
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
                            <input value={profile.target_exams || ''} onChange={(event) => updateField('target_exams', event.target.value)} className="pp-input" placeholder="CIL, GATE, JEE, NEET, UPSC..." />
                        </div>
                        <div>
                            <label className="pp-label">Exam branch or department</label>
                            <select value={profile.exam_branch || ''} onChange={(event) => updateField('exam_branch', event.target.value)} className="pp-input">
                                <option value="">Select branch</option>
                                {branchOptions.map((branch) => <option key={branch}>{branch}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="pp-label">Preferred subjects</label>
                            <input value={profile.preferred_subjects || ''} onChange={(event) => updateField('preferred_subjects', event.target.value)} className="pp-input" placeholder="Computer networks, DBMS, aptitude..." />
                        </div>
                        <div>
                            <label className="pp-label">Region</label>
                            <input value={profile.region || ''} onChange={(event) => updateField('region', event.target.value)} className="pp-input" placeholder="West Bengal, India" />
                        </div>
                        <div>
                            <label className="pp-label">Annual family income</label>
                            <input value={profile.annual_income || ''} onChange={(event) => updateField('annual_income', event.target.value)} className="pp-input" placeholder="e.g. 350000" />
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
                        <button disabled={isSaving} className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-[background-color,transform] duration-150 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 ${saveState === 'saved' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'}`}>
                            {saveState === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {isSaving ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save profile'}
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
