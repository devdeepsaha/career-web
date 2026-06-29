import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, ExternalLink, FileCheck2, GraduationCap, IndianRupee, ShieldCheck, XCircle } from 'lucide-react';

const deadlineToneClass = {
    critical: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200',
    urgent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
    soon: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200',
    open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
    closed: 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300',
};

const normalize = (value = '') => String(value).toLowerCase().trim();

const isMissingDocument = (document, missingDocuments = []) => {
    const normalizedDocument = normalize(document);
    return missingDocuments.some((item) => normalize(item) === normalizedDocument || normalize(item).includes(normalizedDocument) || normalizedDocument.includes(normalize(item)));
};

const getReadiness = (scholarship) => {
    const required = scholarship.documents_required || [];
    const missing = scholarship.missing_documents || [];
    if (!required.length) return 100;
    return Math.max(0, Math.round(((required.length - missing.length) / required.length) * 100));
};

const portalUrl = (scholarship) => scholarship.direct_url || scholarship.search_url || 'https://scholarships.gov.in/All-Scholarships';

const ActionLink = ({ href, children, muted = false }) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 transition-[background-color,transform] duration-150 active:scale-[0.96] ${
            muted
                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
        }`}
    >
        <span>{children}</span>
        <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
);

const ActionButton = ({ children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-left text-sm font-semibold leading-6 text-slate-700 transition-[background-color,transform] duration-150 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300"
    >
        <span>{children}</span>
        <FileCheck2 className="h-4 w-4 shrink-0" />
    </button>
);

const ScholarshipDetailPage = ({ onNavigate }) => {
    const [scholarship, setScholarship] = useState(null);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const storageKey = params.get('key');

    useEffect(() => {
        try {
            const raw = storageKey ? sessionStorage.getItem(storageKey) : sessionStorage.getItem('last_scholarship_detail');
            if (!raw) {
                setError('No scholarship detail is loaded. Open one from the scholarship results.');
                return;
            }
            setScholarship(JSON.parse(raw));
        } catch (err) {
            console.error('Could not load scholarship detail:', err);
            setError('Could not open this scholarship detail.');
        }
    }, [storageKey]);

    if (error) {
        return (
            <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
                <button onClick={() => onNavigate('scholarship')} className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                    <ArrowLeft className="h-4 w-4" />
                    Back to scholarships
                </button>
                <div className="saas-card p-6 text-sm font-medium text-slate-600 dark:text-slate-300">{error}</div>
            </div>
        );
    }

    if (!scholarship) {
        return (
            <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
                    <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
                </div>
            </div>
        );
    }

    const readiness = getReadiness(scholarship);
    const deadlineClass = deadlineToneClass[scholarship.deadline_signal?.tone] || deadlineToneClass.neutral;
    const officialUrl = portalUrl(scholarship);
    const searchUrl = scholarship.search_url || `https://www.google.com/search?q=${encodeURIComponent(`${scholarship.name} official notice scholarship`)}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${scholarship.name} how to apply scholarship`)}`;
    const requiredDocuments = scholarship.documents_required || [];
    const missingDocuments = scholarship.missing_documents || [];
    const steps = scholarship.application_steps?.length
        ? scholarship.application_steps
        : ['Open the official portal', 'Verify scheme notice and eligibility', 'Prepare the listed documents', 'Submit before the deadline'];
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'eligibility', label: 'Eligibility' },
        { id: 'documents', label: 'Docs' },
        { id: 'apply', label: 'Apply' },
    ];
    const stepTarget = (step, index) => {
        const text = normalize(step);
        if (text.includes('document') || text.includes('prepare') || text.includes('certificate')) return 'documents';
        if (text.includes('notice') || text.includes('eligibility') || text.includes('verify')) return searchUrl;
        if (index === 0 || text.includes('portal') || text.includes('register') || text.includes('submit')) return officialUrl;
        return searchUrl;
    };

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <button onClick={() => onNavigate('scholarship')} className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.96] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to scholarships
            </button>

            <div className="sticky top-14 z-20 mb-3 grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950 md:hidden">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`min-h-10 rounded-lg text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${activeSection === tab.id ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className="space-y-4">
                    <section className={`${activeSection === 'overview' ? 'block' : 'hidden'} saas-card p-5 md:block`}>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{scholarship.match_score || 0}% match</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${deadlineClass}`}>{scholarship.deadline_signal?.label || 'Check deadline'}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{scholarship.application_status || 'Check official notice'}</span>
                        </div>
                        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white md:text-4xl">{scholarship.name}</h1>
                        <p className="mt-3 max-w-3xl text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">{scholarship.description}</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                <IndianRupee className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Amount</p>
                                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{scholarship.amount || 'Amount not confirmed'}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                <FileCheck2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Documents ready</p>
                                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">{readiness}%</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Deadline</p>
                                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{scholarship.deadline || 'Verify date'}</p>
                            </div>
                        </div>
                    </section>

                    <section className={`${activeSection === 'eligibility' ? 'block' : 'hidden'} saas-card p-4 md:block`}>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <h2 className="saas-section-title">Eligibility report</h2>
                        </div>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{scholarship.smart_answers?.am_i_eligible || scholarship.eligibility || 'Verify official eligibility before applying.'}</p>
                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                            {(scholarship.matched_reasons || []).map((reason) => (
                                <div key={reason} className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold leading-6 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                                    {reason}
                                </div>
                            ))}
                            {!(scholarship.matched_reasons || []).length && (
                                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">No match breakdown returned. Add more profile details and search again.</div>
                            )}
                        </div>
                    </section>

                    {!!(scholarship.not_eligible_reasons || []).length && (
                        <section className={`${activeSection === 'eligibility' ? 'block' : 'hidden'} saas-card p-4 md:block`}>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200">
                                    <XCircle className="h-4 w-4" />
                                </span>
                                <h2 className="saas-section-title">Current blockers</h2>
                            </div>
                            <div className="grid gap-2">
                                {scholarship.not_eligible_reasons.map((reason) => (
                                    <div key={reason} className="rounded-lg bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700 dark:bg-red-950/40 dark:text-red-200">{reason}</div>
                                ))}
                            </div>
                            {scholarship.next_year_eligibility && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-slate-900 dark:text-slate-300">{scholarship.next_year_eligibility}</p>}
                        </section>
                    )}

                    <section className={`${activeSection === 'documents' ? 'block' : 'hidden'} saas-card p-4 md:block`}>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                <FileCheck2 className="h-4 w-4" />
                            </span>
                            <h2 className="saas-section-title">Documents checklist</h2>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                            {requiredDocuments.map((document) => {
                                const missing = isMissingDocument(document, missingDocuments);
                                return (
                                    <div key={document} className={`rounded-lg p-3 text-sm font-semibold leading-6 ${missing ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'}`}>
                                        {missing ? 'Missing' : 'Ready'}: {document}
                                    </div>
                                );
                            })}
                            {!requiredDocuments.length && <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Document list was not returned. Check the official notice before applying.</div>}
                        </div>
                    </section>
                </main>

                <aside className={`${activeSection === 'apply' ? 'block' : 'hidden'} space-y-4 md:block xl:sticky xl:top-20 xl:self-start`}>
                    <section className="saas-card p-4">
                        <h2 className="saas-section-title">Apply from official portal</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{scholarship.amount_basis || scholarship.source_note || 'Verify amount, deadline, and final eligibility on the official notice before applying.'}</p>
                        <div className="mt-4 grid gap-2">
                            <ActionLink href={officialUrl}>Open official portal</ActionLink>
                            <ActionLink href={searchUrl} muted>Search official notice</ActionLink>
                            <ActionLink href={youtubeUrl} muted>Watch application walkthrough</ActionLink>
                            <button className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 active:scale-[0.96] dark:bg-slate-900 dark:text-slate-300">
                                <span>Notify me before deadline</span>
                                <Bell className="h-4 w-4 shrink-0" />
                            </button>
                        </div>
                    </section>

                    <section className="saas-card p-4">
                        <h2 className="saas-section-title">Application steps</h2>
                        <div className="mt-3 grid gap-2">
                            {steps.map((step, index) => {
                                const target = stepTarget(step, index);
                                return target === 'documents' ? (
                                    <ActionButton key={`${step}-${index}`} onClick={() => setActiveSection('documents')}>
                                        {index + 1}. {step}
                                    </ActionButton>
                                ) : (
                                    <ActionLink href={target} key={`${step}-${index}`} muted>
                                        {index + 1}. {step}
                                    </ActionLink>
                                );
                            })}
                        </div>
                        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{scholarship.source_note || 'AI can help organize the application, but final scheme rules must be checked on the official portal.'}</p>
                    </section>

                    <section className="saas-card p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <h2 className="saas-section-title">Next best move</h2>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Open the official portal, confirm the scheme notice, then prepare only the missing documents shown above. Do not upload institute-specific certificates unless the official scheme asks for them.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default ScholarshipDetailPage;
