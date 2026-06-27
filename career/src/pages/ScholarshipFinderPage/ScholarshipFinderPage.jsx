import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Bell, Check, ChevronDown, CircleHelp, Clock3, ExternalLink, FileCheck2, GraduationCap, IndianRupee, Save, Search, ShieldCheck, Sparkles } from 'lucide-react';
import ScholarshipEmptyState from './ScholarshipEmptyState';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

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

const studentTypes = ['Engineering student', 'Medical student', 'School student', 'College student', 'Dropper', 'Diploma student', 'Postgraduate', 'Working aspirant'];
const genderOptions = ['Not specified', 'Female', 'Male', 'Other'];
const casteOptions = ['General', 'SC', 'ST', 'OBC', 'EWS', 'Minority', 'PwD'];

const emptyDocuments = documentOptions.reduce((acc, [key]) => ({ ...acc, [key]: false }), {});
const scholarshipFormStorageKey = 'scholarship_finder_profile_v1';

const readNumber = (value) => {
    const match = String(value || '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
};

const normalizedMarks = (value) => {
    const number = readNumber(value);
    if (number === null) return null;
    return number <= 10 ? number * 10 : number;
};

const readTag = (text = '', label) => {
    const match = text.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
    return match?.[1]?.trim() || '';
};

const buildProfileContext = (profile = {}) => (
    [
        `Status: ${profile.status || 'not set'}`,
        `Education: ${profile.education || 'not set'}`,
        `Student type: ${profile.student_type || 'not set'}`,
        `Course stream: ${profile.course_stream || 'not set'}`,
        `Study level: ${profile.study_level || 'not set'}`,
        `Institution: ${profile.institution_name || 'not set'}`,
        `Region: ${profile.region || readTag(profile.target_exams || '', 'Region') || 'not set'}`,
        `Gender: ${profile.gender || 'not set'}`,
        `Caste/category: ${profile.caste_category || 'not set'}`,
        `Disability: ${profile.disability_status || 'not set'}`,
        `Target exams and branch: ${profile.target_exams || 'not set'}`,
        `Career goals: ${profile.goals || 'not set'}`,
    ].join('\n')
);

const deadlineToneClass = {
    critical: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200',
    urgent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
    soon: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200',
    open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
    closed: 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300',
};

const getReadiness = (scholarship) => {
    const required = scholarship.documents_required || [];
    const missing = scholarship.missing_documents || [];
    if (!required.length) return 100;
    return Math.max(0, Math.round(((required.length - missing.length) / required.length) * 100));
};

const scholarshipStorageKey = (scholarship, index) => `scholarship_detail_${index}_${encodeURIComponent((scholarship?.name || 'scholarship').slice(0, 64))}`;

const storeScholarshipDetail = (scholarship, index = 0) => {
    const key = scholarshipStorageKey(scholarship, index);
    sessionStorage.setItem(key, JSON.stringify(scholarship));
    sessionStorage.setItem('last_scholarship_detail', JSON.stringify(scholarship));
    return key;
};

const answerScholarshipQuestion = (scholarship, question) => {
    const text = question.toLowerCase();
    const answers = scholarship.smart_answers || {};
    if (text.includes('eligible')) return answers.am_i_eligible || scholarship.eligibility || 'Check the matched and missing criteria before applying.';
    if (text.includes('why') || text.includes('not')) return answers.why_not || (scholarship.not_eligible_reasons || []).join(' ') || 'No hard blocker was found from your current profile.';
    if (text.includes('next year')) return answers.next_year || scholarship.next_year_eligibility || 'You may be eligible next cycle if marks, course year, income, and document requirements match.';
    if (text.includes('document')) return answers.documents || `Required documents: ${(scholarship.documents_required || []).join(', ') || 'check official notice'}.`;
    if (text.includes('deadline') || text.includes('date')) return scholarship.deadline_signal?.label || scholarship.deadline || 'Check the official notice for the latest deadline.';
    return answers.am_i_eligible || scholarship.description || 'Use the official link and verify eligibility before submitting.';
};

const ScholarshipFinderPage = ({ currentUser, showAuth, onNavigate }) => {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState({
        marks: '',
        income: '',
        region: 'India',
        destination: 'India',
        religion: '',
        student_type: '',
        course_stream: '',
        institution: '',
        gender: 'Not specified',
        caste: 'General',
        disability: 'No',
        documents: emptyDocuments,
    });
    const [scholarships, setScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [savedScholarshipKeys, setSavedScholarshipKeys] = useState({});
    const [studentProfile, setStudentProfile] = useState(null);
    const [activeScholarship, setActiveScholarship] = useState(null);
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatAnswer, setChatAnswer] = useState('');
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);

    useEffect(() => {
        const loadProfileDefaults = async () => {
            const localDraft = JSON.parse(localStorage.getItem(scholarshipFormStorageKey) || '{}');
            if (Object.keys(localDraft).length) {
                setForm((prev) => ({
                    ...prev,
                    ...localDraft,
                    documents: { ...prev.documents, ...(localDraft.documents || {}) },
                }));
            }
            if (!currentUser) return;
            try {
                const response = await fetch(`${API_URL}/student-profile`, { credentials: 'include' });
                if (!response.ok) return;
                const profile = await response.json();
                if (!profile) return;
                const preferences = profile.scholarship_preferences_json || {};
                setStudentProfile(profile);
                setForm((prev) => ({
                    ...prev,
                    marks: profile.scholarship_marks || preferences.marks || prev.marks,
                    income: profile.annual_family_income || preferences.income || readTag(profile.target_exams || '', 'Annual family income') || prev.income,
                    region: profile.region || readTag(profile.target_exams || '', 'Region') || prev.region,
                    destination: profile.study_destination || prev.destination,
                    religion: profile.religion || preferences.religion || prev.religion,
                    student_type: profile.student_type || prev.student_type,
                    course_stream: profile.course_stream || profile.education || prev.course_stream,
                    institution: profile.institution_name || profile.target_companies || prev.institution,
                    gender: profile.gender || prev.gender,
                    caste: profile.caste_category || prev.caste,
                    disability: profile.disability_status || prev.disability,
                    documents: { ...prev.documents, ...(profile.documents_json || {}) },
                }));
            } catch (err) {
                console.error('Scholarship profile defaults could not load:', err);
            }
        };
        loadProfileDefaults();
    }, [currentUser]);

    const profileContext = useMemo(() => buildProfileContext(studentProfile || {}), [studentProfile]);
    const documentReadyCount = Object.values(form.documents).filter(Boolean).length;

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleDocument = (key) => {
        setForm((prev) => ({
            ...prev,
            documents: { ...prev.documents, [key]: !prev.documents[key] },
        }));
    };

    const persistScholarshipProfile = async () => {
        localStorage.setItem(scholarshipFormStorageKey, JSON.stringify(form));
        if (!currentUser) return;
        await fetch(`${API_URL}/student-profile`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_type: form.student_type,
                course_stream: form.course_stream,
                institution_name: form.institution,
                gender: form.gender,
                caste_category: form.caste,
                disability_status: form.disability,
                scholarship_marks: form.marks,
                religion: form.religion,
                annual_family_income: form.income,
                region: form.region,
                study_destination: form.destination,
                documents_json: form.documents,
                scholarship_preferences_json: {
                    last_search: form,
                },
            }),
        });
    };

    const findScholarships = async (event) => {
        event.preventDefault();
        if (!currentUser) {
            showAuth('login');
            return;
        }

        const markValue = normalizedMarks(form.marks);
        const incomeValue = readNumber(form.income);
        if (form.marks && (markValue === null || markValue < 0 || markValue > 100)) {
            setError('Enter marks as a percentage or CGPA between 0 and 10.');
            return;
        }
        if (form.income && (incomeValue === null || incomeValue < 0)) {
            setError('Enter annual family income as a positive number.');
            return;
        }

        setIsLoading(true);
        setError('');
        setScholarships([]);
        setHasSearched(true);
        setActiveScholarship(null);
        setFiltersCollapsed(false);

        try {
            await persistScholarshipProfile();
            const response = await fetch(`${API_URL}/find-scholarships`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    language: i18n.language,
                    profile_context: profileContext,
                }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setScholarships(data);
            setActiveScholarship(data[0] || null);
            data.slice(0, 2).forEach((scholarship, index) => storeScholarshipDetail(scholarship, index));
            setFiltersCollapsed(true);
        } catch (err) {
            console.error('Failed to fetch scholarships:', err);
            setError(t('scholarship_error_fetchFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const saveScholarship = async (scholarship, index, reminder = false) => {
        try {
            const response = await fetch(`${API_URL}/saved-scholarships`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scholarship_json: scholarship,
                    deadline: scholarship.deadline,
                    status: reminder ? 'shortlisted' : 'saved',
                    reminder_enabled: reminder,
                    reminder_date: scholarship.deadline,
                    official_url: scholarship.direct_url,
                    amount: scholarship.amount,
                    match_score: scholarship.match_score,
                    application_status: scholarship.application_status,
                }),
            });
            if (response.ok) {
                setSavedScholarshipKeys((prev) => ({ ...prev, [`${scholarship.name}-${index}`]: true }));
            }
        } catch (err) {
            console.error('Failed to save scholarship:', err);
        }
    };

    const askScholarshipBot = (event) => {
        event.preventDefault();
        if (!activeScholarship) return;
        setChatAnswer(answerScholarshipQuestion(activeScholarship, chatQuestion || 'Am I eligible?'));
    };

    const openScholarshipDetail = (scholarship, index) => {
        setActiveScholarship(scholarship);
        const key = storeScholarshipDetail(scholarship, index);
        onNavigate?.('scholarshipDetail', { query: `key=${encodeURIComponent(key)}` });
    };

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <title>Scholarship Eligibility Finder | Potho-Prodorshok</title>
            <meta name="description" content="Check scholarship eligibility, document readiness, deadlines, benefit amount, and profile match for Indian students." />

            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Eligibility engine</p>
                <h1 className="pp-page-title">Scholarship match desk</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">See how strongly each scholarship fits you, what amount it may provide, what documents are missing, and when the form closes.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
                <aside className="space-y-4 xl:sticky xl:top-16 xl:self-start">
                    <form onSubmit={findScholarships} className="saas-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="saas-section-title">Student fit profile</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{documentReadyCount}/{documentOptions.length} common documents ready</p>
                            </div>
                        </div>

                        {hasSearched && scholarships.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setFiltersCollapsed((value) => !value)}
                                className="mt-4 flex min-h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300"
                            >
                                {filtersCollapsed ? 'Edit eligibility filters' : 'Hide filters and focus results'}
                                <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${filtersCollapsed ? '' : 'rotate-180'}`} />
                            </button>
                        )}

                        <div className={`${filtersCollapsed ? 'hidden' : 'grid'} mt-4 gap-3`}>
                            <div>
                                <label className="pp-label">Studying as</label>
                                <select value={form.student_type} onChange={(event) => updateForm('student_type', event.target.value)} className="pp-input">
                                    <option value="">Select student type</option>
                                    {studentTypes.map((type) => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">Course / stream</label>
                                <input value={form.course_stream} onChange={(event) => updateForm('course_stream', event.target.value)} className="pp-input" maxLength={160} placeholder="B.Tech CSE, MBBS, Class 12 Science..." />
                            </div>
                            <div>
                                <label className="pp-label">Institute / college</label>
                                <input value={form.institution} onChange={(event) => updateForm('institution', event.target.value)} className="pp-input" maxLength={180} placeholder="School, college, university..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="pp-label">Marks</label>
                                    <input value={form.marks} onChange={(event) => updateForm('marks', event.target.value)} className="pp-input" inputMode="decimal" maxLength={8} placeholder="85% or 7.6 CGPA" />
                                </div>
                                <div>
                                    <label className="pp-label">Income</label>
                                    <input value={form.income} onChange={(event) => updateForm('income', event.target.value)} className="pp-input" inputMode="numeric" maxLength={12} placeholder="350000" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="pp-label">Gender</label>
                                    <select value={form.gender} onChange={(event) => updateForm('gender', event.target.value)} className="pp-input">
                                        {genderOptions.map((item) => <option key={item}>{item}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="pp-label">Category</label>
                                    <select value={form.caste} onChange={(event) => updateForm('caste', event.target.value)} className="pp-input">
                                        {casteOptions.map((item) => <option key={item}>{item}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="pp-label">Region</label>
                                    <input value={form.region} onChange={(event) => updateForm('region', event.target.value)} className="pp-input" maxLength={120} placeholder="West Bengal" />
                                </div>
                                <div>
                                    <label className="pp-label">Destination</label>
                                    <input value={form.destination} onChange={(event) => updateForm('destination', event.target.value)} className="pp-input" maxLength={120} placeholder="India" />
                                </div>
                            </div>
                            <div>
                                <label className="pp-label">Religion / minority status</label>
                                <input value={form.religion} onChange={(event) => updateForm('religion', event.target.value)} className="pp-input" maxLength={120} placeholder="Optional" />
                            </div>
                        </div>

                        <div className={`${filtersCollapsed ? 'hidden' : 'block'} mt-4`}>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="pp-label">Documents ready</label>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{documentReadyCount} ready</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {documentOptions.map(([key, label]) => (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => toggleDocument(key)}
                                        className={`flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-xs font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${form.documents[key] ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400'}`}
                                    >
                                        {label}
                                        {form.documents[key] && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className={`${filtersCollapsed ? 'hidden' : 'flex'} pp-button mt-4 w-full items-center justify-center gap-2`}>
                            <Search className="h-4 w-4" />
                            {isLoading ? 'Checking eligibility...' : 'Find eligible scholarships'}
                        </button>
                    </form>

                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Why this is different</h2>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Match score explains fit instead of only showing links.</p>
                            <p className="flex gap-2"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" /> Missing documents are separated before students apply.</p>
                            <p className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> Deadline urgency is visible on every card.</p>
                        </div>
                    </div>
                </aside>

                <main className="min-w-0">
                    {isLoading && (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {[...Array(4)].map((_, index) => <div key={index} className="h-60 animate-pulse rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />)}
                        </div>
                    )}

                    {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

                    {!isLoading && !error && (!hasSearched || scholarships.length === 0) && <ScholarshipEmptyState />}

                    {!isLoading && scholarships.length > 0 && (
                        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-1">
                                {scholarships.map((scholarship, index) => {
                                    const readiness = getReadiness(scholarship);
                                    const deadlineClass = deadlineToneClass[scholarship.deadline_signal?.tone] || deadlineToneClass.neutral;
                                    return (
                                        <article key={`${scholarship.name}-${index}`} className={`saas-card cursor-pointer p-4 transition-[box-shadow,transform,border-color] duration-150 active:scale-[0.96] ${activeScholarship === scholarship ? 'border-blue-300 shadow-[0_18px_50px_rgba(37,99,235,0.12)] dark:border-blue-700' : ''}`} onClick={() => openScholarshipDetail(scholarship, index)}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{scholarship.match_score || 0}% match</span>
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${deadlineClass}`}>{scholarship.deadline_signal?.label || 'Check deadline'}</span>
                                                    </div>
                                                    <h3 className="mt-3 text-sm font-semibold leading-6 text-slate-950 text-pretty dark:text-white">{scholarship.name}</h3>
                                                </div>
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                    <IndianRupee className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{scholarship.description}</p>
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{scholarship.amount || 'Amount not confirmed'}</p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Docs ready</p>
                                                    <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{readiness}%</p>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Matched reasons</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {(scholarship.matched_reasons || ['Select to review exact matching criteria']).slice(0, 3).map((reason) => (
                                                        <span key={reason} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{reason}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {!!(scholarship.missing_documents || []).length && (
                                                <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                                    Missing: {scholarship.missing_documents.join(', ')}
                                                </p>
                                            )}
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <a href={scholarship.direct_url} target="_blank" rel="noopener noreferrer" className="pp-button-secondary inline-flex items-center gap-2" onClick={(event) => event.stopPropagation()}>Official <ExternalLink className="h-3.5 w-3.5" /></a>
                                                <button onClick={(event) => { event.stopPropagation(); saveScholarship(scholarship, index); }} className="pp-button-secondary inline-flex items-center gap-2">
                                                    {savedScholarshipKeys[`${scholarship.name}-${index}`] ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                                    {savedScholarshipKeys[`${scholarship.name}-${index}`] ? 'Saved' : 'Save'}
                                                </button>
                                                <button onClick={(event) => { event.stopPropagation(); saveScholarship(scholarship, index, true); }} className="pp-button-secondary inline-flex items-center gap-2">
                                                    <Bell className="h-4 w-4" /> Notify
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <aside className="space-y-4">
                                {activeScholarship && (
                                    <div className="saas-card p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600 dark:text-blue-300">Selected scholarship</p>
                                                <h2 className="mt-1 text-sm font-semibold leading-6 text-slate-950 dark:text-white">{activeScholarship.name}</h2>
                                            </div>
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{activeScholarship.match_score || 0}%</span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{activeScholarship.amount || 'Amount not confirmed'}</p>
                                            </div>
                                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Docs ready</p>
                                                <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{getReadiness(activeScholarship)}%</p>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Open the full page for amount basis, document checklist, eligibility blockers, and clickable portal steps.</p>
                                        <button onClick={() => openScholarshipDetail(activeScholarship, scholarships.indexOf(activeScholarship))} className="pp-button mt-3 flex w-full items-center justify-center gap-2">
                                            Open eligibility report <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="saas-card p-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                        <h2 className="saas-section-title">Scholarship smart bot</h2>
                                    </div>
                                    {activeScholarship ? (
                                        <>
                                            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{activeScholarship.name}</p>
                                            <form onSubmit={askScholarshipBot} className="mt-3 space-y-2">
                                                <input value={chatQuestion} onChange={(event) => setChatQuestion(event.target.value)} className="pp-input" maxLength={240} placeholder="Am I eligible? Why not? Deadline?" />
                                                <button className="pp-button flex w-full items-center justify-center gap-2"><CircleHelp className="h-4 w-4" /> Ask</button>
                                            </form>
                                            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                {chatAnswer || activeScholarship.smart_answers?.am_i_eligible || activeScholarship.eligibility}
                                            </div>
                                            <div className="mt-3 grid gap-2">
                                                {['Am I eligible?', 'Why am I not eligible?', 'Will I be eligible next year?', 'What documents do I need?'].map((question) => (
                                                    <button key={question} onClick={() => { setChatQuestion(question); setChatAnswer(answerScholarshipQuestion(activeScholarship, question)); }} className="rounded-lg bg-slate-50 p-2 text-left text-xs font-semibold text-slate-600 transition-[background-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">{question}</button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Select a scholarship to ask eligibility questions.</p>
                                    )}
                                </div>
                            </aside>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ScholarshipFinderPage;
