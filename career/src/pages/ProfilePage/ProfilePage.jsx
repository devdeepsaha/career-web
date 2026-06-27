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
    student_type: '',
    course_stream: '',
    institution_name: '',
    study_level: '',
    gender: 'Not specified',
    caste_category: 'General',
    disability_status: 'No',
    region: '',
    study_destination: 'India',
    annual_family_income: '',
    scholarship_marks_mode: 'percent',
    scholarship_marks: '',
    scholarship_religion: '',
    documents_json: {},
};

const documentOptions = [
    ['aadhaar', 'Aadhaar'],
    ['pan', 'PAN'],
    ['bank', 'Bank account'],
    ['marksheet', 'Marksheet'],
    ['income_certificate', 'Income certificate'],
    ['caste_certificate', 'Caste certificate'],
    ['domicile_certificate', 'Domicile'],
    ['bonafide', 'Bonafide'],
    ['admission_receipt', 'Fee receipt'],
    ['photo', 'Photo'],
];

const emptyDocuments = documentOptions.reduce((acc, [key]) => ({ ...acc, [key]: false }), {});
const marksModeOptions = [
    ['percent', 'Percentage'],
    ['cgpa', 'CGPA'],
];
const studentTypes = ['Engineering student', 'Medical student', 'School student', 'College student', 'Dropper', 'Diploma student', 'Postgraduate', 'Working aspirant'];
const genderOptions = ['Not specified', 'Female', 'Male', 'Other'];
const casteOptions = ['General', 'SC', 'ST', 'OBC', 'EWS', 'Minority', 'PwD'];

const readNumber = (value) => {
    const match = String(value || '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
};

const normalizedMarks = (value, mode = 'percent') => {
    const number = readNumber(value);
    if (number === null) return null;
    if (mode === 'cgpa') return number <= 10 ? number * 10 : null;
    return number <= 100 ? number : null;
};

const marksInputWarning = (value, mode) => {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/[/%]|cgpa|percent|percentage|out of/i.test(text)) {
        return mode === 'cgpa' ? 'Enter only the CGPA number, for example 7.6.' : 'Enter only the percentage number, for example 85.';
    }
    if (/[^0-9.\s]/.test(text)) return 'Only numbers and one decimal point are allowed here.';
    if ((text.match(/\./g) || []).length > 1) return 'Use only one decimal point.';
    const number = readNumber(text);
    if (number === null) return 'Enter a number here.';
    if (mode === 'cgpa' && number > 10) return 'CGPA must be between 0 and 10.';
    if (mode === 'percent' && number > 100) return 'Percentage must be between 0 and 100.';
    return '';
};

const incomeInputWarning = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/[^0-9,.\s]/.test(text)) return 'Use digits only. Do not add currency symbols or words.';
    if ((text.match(/\./g) || []).length > 1) return 'Use only one decimal point.';
    return '';
};

const wordInputWarning = (value, label) => {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/\d/.test(text)) return `${label} should use letters, not numbers.`;
    if (/[!@#$%^*_=+{}[\]|\\<>?~`]/.test(text)) return `Remove special symbols from ${label.toLowerCase()}.`;
    return '';
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

const normalizeProfile = (data) => {
    const preferences = data?.scholarship_preferences_json || {};
    const lastSearch = preferences.last_search || {};
    return {
        ...emptyProfile,
        ...data,
        annual_income: data?.annual_family_income || lastSearch.income || readTag(data?.target_exams || '', 'Annual family income'),
        scholarship_marks_mode: preferences.marks_mode || lastSearch.marks_mode || 'percent',
        scholarship_marks: data?.scholarship_marks || preferences.marks || lastSearch.marks || '',
        religion: data?.religion || preferences.religion || lastSearch.religion || '',
        documents_json: { ...emptyDocuments, ...(data?.documents_json || lastSearch.documents || {}) },
        target_exams: stripTags(data?.target_exams || ''),
        exam_branch: readTag(data?.target_exams || '', 'Branch'),
        preferred_subjects: readTag(data?.target_exams || '', 'Preferred subjects'),
        region: data?.region || lastSearch.region || readTag(data?.target_exams || '', 'Region'),
    };
};

const serializeProfile = (profile) => {
    const tags = [
        profile.exam_branch ? `Branch: ${profile.exam_branch}` : '',
        profile.preferred_subjects ? `Preferred subjects: ${profile.preferred_subjects}` : '',
        profile.region ? `Region: ${profile.region}` : '',
        profile.annual_income ? `Annual family income: ${profile.annual_income}` : '',
    ].filter(Boolean);

    return {
        ...profile,
        annual_family_income: profile.annual_income || profile.annual_family_income || null,
        documents_json: profile.documents_json || {},
        scholarship_preferences_json: {
            marks_mode: profile.scholarship_marks_mode || 'percent',
            last_search: {
                marks: profile.scholarship_marks || '',
                marks_mode: profile.scholarship_marks_mode || 'percent',
                income: profile.annual_income || profile.annual_family_income || '',
                region: profile.region || '',
                destination: profile.study_destination || 'India',
                religion: profile.religion || '',
                student_type: profile.student_type || '',
                course_stream: profile.course_stream || profile.education || '',
                institution: profile.institution_name || profile.target_companies || '',
                gender: profile.gender || 'Not specified',
                caste: profile.caste_category || 'General',
                disability: profile.disability_status || 'No',
                documents: profile.documents_json || {},
            },
        },
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

    const toggleDocument = (key) => {
        setProfile((prev) => ({
            ...prev,
            documents_json: {
                ...emptyDocuments,
                ...(prev.documents_json || {}),
                [key]: !prev.documents_json?.[key],
            },
        }));
        setSaveState('idle');
    };

    const documentReadyCount = Object.values(profile.documents_json || {}).filter(Boolean).length;
    const marksWarning = marksInputWarning(profile.scholarship_marks, profile.scholarship_marks_mode);
    const incomeWarning = incomeInputWarning(profile.annual_income);
    const regionWarning = wordInputWarning(profile.region, 'Region');
    const destinationWarning = wordInputWarning(profile.study_destination, 'Study destination');
    const religionWarning = wordInputWarning(profile.religion, 'Religion');

    const saveProfile = async (event) => {
        event.preventDefault();
        const markValue = normalizedMarks(profile.scholarship_marks, profile.scholarship_marks_mode);
        const incomeValue = readNumber(profile.annual_income);
        if (marksWarning || (profile.scholarship_marks && markValue === null)) {
            setMessage(marksWarning || 'Check the selected marks type and enter a valid number.');
            return;
        }
        if (incomeWarning || (profile.annual_income && (incomeValue === null || incomeValue < 0))) {
            setMessage(incomeWarning || 'Enter annual family income as a positive number.');
            return;
        }
        if (regionWarning || destinationWarning || religionWarning) {
            setMessage(regionWarning || destinationWarning || religionWarning);
            return;
        }
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
                            <input value={profile.status || ''} onChange={(event) => updateField('status', event.target.value)} className="pp-input" maxLength={100} placeholder="Class 12th student, graduate, dropper..." />
                        </div>
                        <div>
                            <label className="pp-label">Education</label>
                            <input value={profile.education || ''} onChange={(event) => updateField('education', event.target.value)} className="pp-input" maxLength={200} placeholder="Science, commerce, B.Tech, BA..." />
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
                            <input value={profile.target_exams || ''} onChange={(event) => updateField('target_exams', event.target.value)} className="pp-input" maxLength={240} placeholder="CIL, GATE, JEE, NEET, UPSC..." />
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
                            <input value={profile.preferred_subjects || ''} onChange={(event) => updateField('preferred_subjects', event.target.value)} className="pp-input" maxLength={240} placeholder="Computer networks, DBMS, aptitude..." />
                        </div>
                        <div>
                            <label className="pp-label">Region</label>
                            {regionWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{regionWarning}</p>}
                            <input value={profile.region || ''} onChange={(event) => updateField('region', event.target.value)} className="pp-input" maxLength={120} placeholder="West Bengal, India" />
                        </div>
                        <div>
                            <label className="pp-label">Annual family income</label>
                            {incomeWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{incomeWarning}</p>}
                            <input value={profile.annual_income || ''} onChange={(event) => updateField('annual_income', event.target.value)} className="pp-input" inputMode="numeric" maxLength={12} placeholder="e.g. 350000" />
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="saas-section-title">Scholarship eligibility profile</h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Used by the scholarship match desk so students do not re-enter the same details.</p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-950 dark:text-slate-300">{documentReadyCount}/{documentOptions.length} docs</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="pp-label">Studying as</label>
                                <select value={profile.student_type || ''} onChange={(event) => updateField('student_type', event.target.value)} className="pp-input">
                                    <option value="">Select student type</option>
                                    {studentTypes.map((type) => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">Course / stream</label>
                                <input value={profile.course_stream || ''} onChange={(event) => updateField('course_stream', event.target.value)} className="pp-input" maxLength={160} placeholder="B.Tech CSE, MBBS, Class 12 Science..." />
                            </div>
                            <div>
                                <label className="pp-label">Institution / college</label>
                                <input value={profile.institution_name || ''} onChange={(event) => updateField('institution_name', event.target.value)} className="pp-input" maxLength={180} placeholder="College, school, university..." />
                            </div>
                            <div>
                                <label className="pp-label">Study destination</label>
                                {destinationWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{destinationWarning}</p>}
                                <input value={profile.study_destination || ''} onChange={(event) => updateField('study_destination', event.target.value)} className="pp-input" maxLength={120} placeholder="India" />
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="pp-label">Marks</label>
                                    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-xs font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                        {marksModeOptions.map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    updateField('scholarship_marks_mode', value);
                                                    updateField('scholarship_marks', '');
                                                }}
                                                className={`min-h-9 rounded-md px-3 transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${profile.scholarship_marks_mode === value ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : ''}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {marksWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{marksWarning}</p>}
                                <input value={profile.scholarship_marks || ''} onChange={(event) => updateField('scholarship_marks', event.target.value)} className="pp-input" inputMode="decimal" maxLength={8} placeholder={profile.scholarship_marks_mode === 'cgpa' ? '7.6' : '85'} />
                                {!marksWarning && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Do not type %, /10, or words. Choose the mode above.</p>}
                            </div>
                            <div>
                                <label className="pp-label">Religion / minority status</label>
                                {religionWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{religionWarning}</p>}
                                <input value={profile.religion || ''} onChange={(event) => updateField('religion', event.target.value)} className="pp-input" maxLength={120} placeholder="Optional" />
                            </div>
                            <div>
                                <label className="pp-label">Gender</label>
                                <select value={profile.gender || 'Not specified'} onChange={(event) => updateField('gender', event.target.value)} className="pp-input">
                                    {genderOptions.map((item) => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">Category</label>
                                <select value={profile.caste_category || 'General'} onChange={(event) => updateField('caste_category', event.target.value)} className="pp-input">
                                    {casteOptions.map((item) => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">Disability status</label>
                                <select value={profile.disability_status || 'No'} onChange={(event) => updateField('disability_status', event.target.value)} className="pp-input">
                                    <option>No</option>
                                    <option>Yes</option>
                                    <option>Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">Study level</label>
                                <input value={profile.study_level || ''} onChange={(event) => updateField('study_level', event.target.value)} className="pp-input" maxLength={120} placeholder="1st year, final year, postgraduate..." />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="pp-label">Documents ready</label>
                            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                                {documentOptions.map(([key, label]) => (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => toggleDocument(key)}
                                        className={`flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-xs font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${profile.documents_json?.[key] ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-400'}`}
                                    >
                                        {label}
                                        {profile.documents_json?.[key] && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div>
                            <label className="pp-label">Skills</label>
                            <textarea rows="4" value={profile.skills || ''} onChange={(event) => updateField('skills', event.target.value)} className="pp-input" maxLength={1200} placeholder="Python, communication, lab research..." />
                        </div>
                        <div>
                            <label className="pp-label">Interests</label>
                            <textarea rows="4" value={profile.interests || ''} onChange={(event) => updateField('interests', event.target.value)} className="pp-input" maxLength={1200} placeholder="Machine learning, biology, design..." />
                        </div>
                        <div>
                            <label className="pp-label">Career goals</label>
                            <textarea rows="4" value={profile.goals || ''} onChange={(event) => updateField('goals', event.target.value)} className="pp-input" maxLength={1200} placeholder="Doctor, IAS officer, software engineer..." />
                        </div>
                        <div>
                            <label className="pp-label">Target companies or institutions</label>
                            <textarea rows="4" value={profile.target_companies || ''} onChange={(event) => updateField('target_companies', event.target.value)} className="pp-input" maxLength={1200} placeholder="IIT, Google, government service..." />
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
