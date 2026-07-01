import React, { useEffect, useState } from 'react';
import { BookOpen, BriefcaseBusiness, Check, FileText, GraduationCap, IdCard, Plus, Save, Target, Trash2, Trophy, Upload } from 'lucide-react';

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
    full_name: '',
    phone: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    languages_json: [],
    education_json: [],
    projects_json: [],
    credentials_json: [],
    achievements_json: [],
    soft_skills: '',
    hobbies: '',
    resume_text: '',
    resume_summary_json: {},
    resume_uploaded_at: '',
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

const profileSections = [
    { id: 'identity', label: 'Identity', detail: 'Name, contacts, links', icon: IdCard },
    { id: 'career', label: 'Career', detail: 'Goals, skills, targets', icon: Target },
    { id: 'scholarship', label: 'Scholarships', detail: 'Eligibility and documents', icon: GraduationCap },
    { id: 'projects', label: 'Projects', detail: 'Portfolio evidence', icon: BriefcaseBusiness },
    { id: 'education', label: 'Education', detail: 'Academic records', icon: BookOpen },
    { id: 'credentials', label: 'Credentials', detail: 'Certificates and wins', icon: Trophy },
];

const listTemplates = {
    education_json: { institution: '', program: '', score: '', year: '', notes: '' },
    projects_json: { name: '', description: '', tech: '', impact: '' },
    credentials_json: { name: '', issuer: '', date: '', notes: '' },
    achievements_json: { title: '', year: '', notes: '' },
};

const listFields = {
    education_json: [
        ['institution', 'Institution', 'College, school, university'],
        ['program', 'Program', 'B.Tech CSE, Class 12 Science...'],
        ['score', 'Score', 'CGPA 7.46, 84%, rank...'],
        ['year', 'Year', '2022-2026'],
        ['notes', 'Notes', 'Relevant coursework, branch, board...', 'textarea'],
    ],
    projects_json: [
        ['name', 'Project name', 'BCCL CMS, Portfolio Website...'],
        ['tech', 'Tech stack', 'React, Flask, Supabase...'],
        ['description', 'Description', 'What this project does...', 'textarea'],
        ['impact', 'Impact', 'Metrics, users, outcome...', 'textarea'],
    ],
    credentials_json: [
        ['name', 'Credential', 'Internship, course, certificate...'],
        ['issuer', 'Issuer', 'BCCL, Google, college...'],
        ['date', 'Date', '2025'],
        ['notes', 'Notes', 'What it proves...', 'textarea'],
    ],
    achievements_json: [
        ['title', 'Achievement', 'General Secretary, Editor...'],
        ['year', 'Year', '2025'],
        ['notes', 'Notes', 'Context, outcome, responsibility...', 'textarea'],
    ],
};

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
        languages_json: Array.isArray(data?.languages_json) ? data.languages_json : [],
        education_json: Array.isArray(data?.education_json) ? data.education_json : [],
        projects_json: Array.isArray(data?.projects_json) ? data.projects_json : [],
        credentials_json: Array.isArray(data?.credentials_json) ? data.credentials_json : [],
        achievements_json: Array.isArray(data?.achievements_json) ? data.achievements_json : [],
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
        languages_json: profile.languages_json || [],
        education_json: profile.education_json || [],
        projects_json: profile.projects_json || [],
        credentials_json: profile.credentials_json || [],
        achievements_json: profile.achievements_json || [],
        resume_summary_json: profile.resume_summary_json || {},
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

const ResumeUploadAction = ({ onUpload, resumeState, label = 'Import PDF', tone = 'secondary' }) => (
    <label className={`${tone === 'primary' ? 'pp-button' : 'pp-button-secondary'} inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap`}>
        <Upload className="h-4 w-4" />
        {resumeState === 'uploading' ? 'Reading...' : label}
        <input type="file" accept="application/pdf,.pdf" onChange={onUpload} className="sr-only" disabled={resumeState === 'uploading'} />
    </label>
);

const ProfileListEditor = ({ title, description, items = [], fields, onAdd, onChange, onRemove, emptyLabel, onUploadResume, resumeState }) => (
    <section className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="saas-section-title">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {onUploadResume && <ResumeUploadAction onUpload={onUploadResume} resumeState={resumeState} />}
                <button type="button" onClick={onAdd} className="pp-button-secondary inline-flex min-h-10 items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>
        </div>
        <div className="mt-4 space-y-3">
            {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    {emptyLabel}
                </div>
            )}
            {items.map((item, index) => (
                <div key={index} className="rounded-lg bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:bg-slate-950">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Entry {index + 1}</p>
                        <button type="button" onClick={() => onRemove(index)} className="flex min-h-10 items-center gap-2 rounded-md px-2.5 text-xs font-semibold text-red-600 transition-[background-color,transform] duration-150 hover:bg-red-50 active:scale-[0.96] dark:text-red-300 dark:hover:bg-red-950/30">
                            <Trash2 className="h-4 w-4" />
                            Remove
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {fields.map(([key, label, placeholder, type]) => (
                            <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                                <label className="pp-label">{label}</label>
                                {type === 'textarea' ? (
                                    <textarea rows="3" value={item?.[key] || ''} onChange={(event) => onChange(index, key, event.target.value)} className="pp-input" maxLength={1200} placeholder={placeholder} />
                                ) : (
                                    <input value={item?.[key] || ''} onChange={(event) => onChange(index, key, event.target.value)} className="pp-input" maxLength={240} placeholder={placeholder} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </section>
);

const ProfilePage = ({ currentUser }) => {
    const [profile, setProfile] = useState(emptyProfile);
    const [activeSection, setActiveSection] = useState('identity');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveState, setSaveState] = useState('idle');
    const [message, setMessage] = useState('');
    const [resumeState, setResumeState] = useState('idle');
    const [resumeMessage, setResumeMessage] = useState('');

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

    const addListItem = (field) => {
        setProfile((prev) => ({
            ...prev,
            [field]: [...(prev[field] || []), { ...(listTemplates[field] || {}) }],
        }));
        setSaveState('idle');
    };

    const updateListItem = (field, index, key, value) => {
        setProfile((prev) => {
            const nextItems = [...(prev[field] || [])];
            nextItems[index] = { ...(nextItems[index] || {}), [key]: value };
            return { ...prev, [field]: nextItems };
        });
        setSaveState('idle');
    };

    const removeListItem = (field, index) => {
        setProfile((prev) => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, itemIndex) => itemIndex !== index),
        }));
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

    const uploadResume = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setResumeMessage('Upload a PDF resume only.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setResumeMessage('Resume must be 5 MB or smaller.');
            return;
        }

        const body = new FormData();
        body.append('resume', file);
        setResumeState('uploading');
        setResumeMessage('Reading your resume...');
        try {
            const response = await fetch(`${API_URL}/student-profile/resume`, {
                method: 'POST',
                credentials: 'include',
                body,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Resume upload failed');
            setProfile(normalizeProfile(data.profile || data));
            setResumeState('done');
            setSaveState('saved');
            setResumeMessage('Resume extracted and saved into your profile.');
        } catch (error) {
            console.error(error);
            setResumeState('idle');
            setResumeMessage(error.message || 'Resume could not be read.');
        }
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
        <div className="py-3 pl-3 pr-3 sm:pr-4 lg:pr-5 xl:h-[calc(100dvh-3.5rem)] xl:overflow-hidden xl:pl-0 2xl:pr-6">
            <div className="h-full overflow-hidden border-y border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/40 xl:h-full xl:self-stretch xl:overflow-hidden xl:border-b-0 xl:border-r">
                    <div className="flex gap-1 overflow-x-auto pb-1 xl:block xl:space-y-1 xl:overflow-visible xl:pb-0">
                        {profileSections.map((section) => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex min-h-11 min-w-[180px] items-center gap-3 rounded-lg px-3 text-left transition-[background-color,color,transform] duration-150 active:scale-[0.96] xl:w-full xl:min-w-0 ${
                                        active
                                            ? 'bg-slate-100 text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold">{section.label}</span>
                                        <span className={`hidden truncate text-xs xl:block ${active ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400'}`}>{section.detail}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </aside>
                <form onSubmit={saveProfile} className="min-w-0 p-4 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain">

                    {activeSection === 'identity' && (
                    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Import from resume</h2>
                                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                        {profile.resume_uploaded_at ? `Last extracted: ${new Date(profile.resume_uploaded_at).toLocaleString()}` : 'PDF only, up to 5 MB. Details fill the sections below.'}
                                    </p>
                                </div>
                        </div>
                        <ResumeUploadAction onUpload={uploadResume} resumeState={resumeState} label="Upload PDF" tone="primary" />
                        {resumeMessage && <p className="text-sm font-medium text-slate-600 dark:text-slate-300 sm:basis-full">{resumeMessage}</p>}
                    </div>
                    )}

                    {activeSection === 'identity' && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="pp-label">Full name</label>
                            <input value={profile.full_name || ''} onChange={(event) => updateField('full_name', event.target.value)} className="pp-input" maxLength={160} placeholder="Your full name" />
                        </div>
                        <div>
                            <label className="pp-label">Phone</label>
                            <input value={profile.phone || ''} onChange={(event) => updateField('phone', event.target.value)} className="pp-input" inputMode="tel" maxLength={40} placeholder="Phone number" />
                        </div>
                        <div>
                            <label className="pp-label">Location</label>
                            <input value={profile.location || ''} onChange={(event) => updateField('location', event.target.value)} className="pp-input" maxLength={160} placeholder="City, country" />
                        </div>
                        <div>
                            <label className="pp-label">Portfolio</label>
                            <input value={profile.portfolio_url || ''} onChange={(event) => updateField('portfolio_url', event.target.value)} className="pp-input" maxLength={260} placeholder="https://..." />
                        </div>
                        <div>
                            <label className="pp-label">GitHub</label>
                            <input value={profile.github_url || ''} onChange={(event) => updateField('github_url', event.target.value)} className="pp-input" maxLength={260} placeholder="https://github.com/..." />
                        </div>
                        <div>
                            <label className="pp-label">LinkedIn</label>
                            <input value={profile.linkedin_url || ''} onChange={(event) => updateField('linkedin_url', event.target.value)} className="pp-input" maxLength={260} placeholder="https://linkedin.com/in/..." />
                        </div>
                    </div>
                    )}

                    {activeSection === 'career' && (
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
                        <div>
                            <label className="pp-label">Skills</label>
                            <textarea rows="4" value={profile.skills || ''} onChange={(event) => updateField('skills', event.target.value)} className="pp-input" maxLength={1200} placeholder="React, Python, AI integration..." />
                        </div>
                        <div>
                            <label className="pp-label">Interests</label>
                            <textarea rows="4" value={profile.interests || ''} onChange={(event) => updateField('interests', event.target.value)} className="pp-input" maxLength={1200} placeholder="SaaS, machine learning, public sector tech..." />
                        </div>
                        <div>
                            <label className="pp-label">Career goals</label>
                            <textarea rows="4" value={profile.goals || ''} onChange={(event) => updateField('goals', event.target.value)} className="pp-input" maxLength={1200} placeholder="Web developer, CIL Systems/EDP..." />
                        </div>
                        <div>
                            <label className="pp-label">Target companies or institutions</label>
                            <textarea rows="4" value={profile.target_companies || ''} onChange={(event) => updateField('target_companies', event.target.value)} className="pp-input" maxLength={1200} placeholder="BCCL, Coal India, startups..." />
                        </div>
                        <div>
                            <label className="pp-label">Soft skills</label>
                            <textarea rows="3" value={profile.soft_skills || ''} onChange={(event) => updateField('soft_skills', event.target.value)} className="pp-input" maxLength={1000} placeholder="Communication, leadership, product thinking..." />
                        </div>
                        <div>
                            <label className="pp-label">Hobbies</label>
                            <textarea rows="3" value={profile.hobbies || ''} onChange={(event) => updateField('hobbies', event.target.value)} className="pp-input" maxLength={1000} placeholder="Writing, photography, music..." />
                        </div>
                    </div>
                    )}

                    {activeSection === 'scholarship' && (
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
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

                    )}

                    {activeSection === 'resume' && (profile.education_json?.length > 0 || profile.projects_json?.length > 0 || profile.credentials_json?.length > 0 || profile.achievements_json?.length > 0) && (
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            {[
                                ['Education', profile.education_json],
                                ['Projects', profile.projects_json],
                                ['Credentials', profile.credentials_json],
                                ['Achievements', profile.achievements_json],
                            ].map(([title, items]) => (
                                Array.isArray(items) && items.length > 0 ? (
                                    <section key={title} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                                        <h3 className="saas-section-title">{title}</h3>
                                        <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                                            {items.slice(0, 6).map((item, index) => (
                                                <div key={`${title}-${index}`} className="rounded-lg bg-white p-3 text-sm dark:bg-slate-950">
                                                    <p className="font-semibold text-slate-950 dark:text-white">{item.name || item.title || item.institution || item.program || 'Resume item'}</p>
                                                    <p className="mt-1 leading-5 text-slate-600 dark:text-slate-400">
                                                        {[item.description, item.tech, item.score, item.year, item.issuer, item.notes, item.impact].filter(Boolean).join(' · ')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ) : null
                            ))}
                        </div>
                    )}

                    {activeSection === 'projects' && (
                        <ProfileListEditor
                            title="Projects"
                            description="Add SaaS projects, internships, portfolio work, or college builds directly. These become AI evidence for plans and applications."
                            items={profile.projects_json || []}
                            fields={listFields.projects_json}
                            onAdd={() => addListItem('projects_json')}
                            onChange={(index, key, value) => updateListItem('projects_json', index, key, value)}
                            onRemove={(index) => removeListItem('projects_json', index)}
                            onUploadResume={uploadResume}
                            resumeState={resumeState}
                            emptyLabel="No projects yet. Add at least one project so the AI can recommend stronger roadmap steps."
                        />
                    )}

                    {activeSection === 'education' && (
                        <ProfileListEditor
                            title="Education"
                            description="Store college, school, CGPA, percentages, boards, and year details without needing a resume upload."
                            items={profile.education_json || []}
                            fields={listFields.education_json}
                            onAdd={() => addListItem('education_json')}
                            onChange={(index, key, value) => updateListItem('education_json', index, key, value)}
                            onRemove={(index) => removeListItem('education_json', index)}
                            onUploadResume={uploadResume}
                            resumeState={resumeState}
                            emptyLabel="No education entries yet. Add your latest academic record first."
                        />
                    )}

                    {activeSection === 'credentials' && (
                        <div className="space-y-4">
                            <ProfileListEditor
                                title="Credentials"
                                description="Add certificates, internships, courses, and verifiable proof that should influence recommendations."
                                items={profile.credentials_json || []}
                                fields={listFields.credentials_json}
                                onAdd={() => addListItem('credentials_json')}
                                onChange={(index, key, value) => updateListItem('credentials_json', index, key, value)}
                                onRemove={(index) => removeListItem('credentials_json', index)}
                                onUploadResume={uploadResume}
                                resumeState={resumeState}
                                emptyLabel="No credentials yet. Add internships, certificates, or courses here."
                            />
                            <ProfileListEditor
                                title="Achievements"
                                description="Add leadership roles, competitions, awards, editorial work, events, and other signals."
                                items={profile.achievements_json || []}
                                fields={listFields.achievements_json}
                                onAdd={() => addListItem('achievements_json')}
                                onChange={(index, key, value) => updateListItem('achievements_json', index, key, value)}
                                onRemove={(index) => removeListItem('achievements_json', index)}
                                emptyLabel="No achievements yet. Add leadership, event, or competition wins here."
                            />
                        </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button disabled={isSaving} className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-[background-color,transform] duration-150 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 ${saveState === 'saved' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'}`}>
                            {saveState === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {isSaving ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save profile'}
                        </button>
                        {message && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>}
                    </div>
                </form>

            </div>
            </div>
        </div>
    );
};

export default ProfilePage;
