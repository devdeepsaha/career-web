import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScholarshipEmptyState from './ScholarshipEmptyState';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const ScholarshipFinderPage = ({ currentUser, showAuth }) => {
    const { t, i18n } = useTranslation();
    const [marks, setMarks] = useState('');
    const [income, setIncome] = useState('');
    const [region, setRegion] = useState('India');
    const [destination, setDestination] = useState('India');
    const [religion, setReligion] = useState('');
    const [scholarships, setScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [savedScholarshipKeys, setSavedScholarshipKeys] = useState({});

    const findScholarships = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            // Not logged in → show login modal
            showAuth('login');
            return;
        }

        setIsLoading(true);
        setError('');
        setScholarships([]);
        setHasSearched(true);

        try {
            const response = await fetch(`${API_URL}/find-scholarships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marks,
                    income,
                    region,
                    destination,
                    religion,
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setScholarships(data);
        } catch (err) {
            console.error("Failed to fetch scholarships:", err);
            setError(t('scholarship_error_fetchFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const saveScholarship = async (scholarship, index) => {
        try {
            const response = await fetch(`${API_URL}/saved-scholarships`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scholarship_json: scholarship,
                    deadline: scholarship.deadline,
                    status: 'saved',
                }),
            });
            if (response.ok) {
                setSavedScholarshipKeys((prev) => ({ ...prev, [`${scholarship.name}-${index}`]: true }));
            }
        } catch (err) {
            console.error('Failed to save scholarship:', err);
        }
    };

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <title>Find Scholarships | Potho-Prodorshok</title>
            <meta
                name="description"
                content="Discover scholarships that match your profile. Use our Scholarship Finder to explore opportunities based on your marks, income, region, and more."
            />

            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Funding Finder</p>
                <h1 className="pp-page-title">{t('scholarship_title')}</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">{t('scholarship_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
                {/* Form */}
                <div>
                    <div className="saas-card p-4 xl:sticky xl:top-16">
                        <h2 className="mb-4 saas-section-title">{t('scholarship_form_title')}</h2>
                        <form onSubmit={findScholarships} className="space-y-3">
                            <div>
                                <label className="pp-label">{t('scholarship_form_marksLabel')}</label>
                                <input
                                    type="text"
                                    value={marks}
                                    onChange={e => setMarks(e.target.value)}
                                    className="pp-input"
                                    placeholder={t('scholarship_form_marksPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="pp-label">{t('scholarship_form_incomeLabel')}</label>
                                <input
                                    type="text"
                                    value={income}
                                    onChange={e => setIncome(e.target.value)}
                                    className="pp-input"
                                    placeholder={t('scholarship_form_incomePlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="pp-label">{t('scholarship_form_regionLabel')}</label>
                                <input
                                    type="text"
                                    value={region}
                                    onChange={e => setRegion(e.target.value)}
                                    className="pp-input"
                                    placeholder={t('scholarship_form_regionPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="pp-label">{t('scholarship_form_religionLabel')}</label>
                                <input
                                    type="text"
                                    value={religion}
                                    onChange={e => setReligion(e.target.value)}
                                    className="pp-input"
                                    placeholder={t('scholarship_form_religionPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="pp-label">{t('scholarship_form_destinationLabel')}</label>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                    className="pp-input"
                                    placeholder={t('scholarship_form_destinationPlaceholder')}
                                />
                            </div>

                            {/* Find Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="pp-button mt-4 w-full"
                            >
                                {isLoading ? t('scholarship_button_searching') : t('scholarship_button_find')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div>
                    {isLoading && (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"></div>
                            ))}
                        </div>
                    )}
                    {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

                    {!isLoading && !error && (!hasSearched || scholarships.length === 0) && <ScholarshipEmptyState />}

                    {!isLoading && scholarships.length > 0 && (
                        <div className="space-y-3">
                            {scholarships.map((s, i) => (
                                <div key={i} className="saas-card p-4 transition-[border-color] duration-150 hover:border-slate-300 dark:hover:border-slate-700">
                                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{s.name}</h3>
                                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{s.description}</p>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400"><strong>{t('scholarship_results_eligibility')}:</strong> {s.eligibility}</p>
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <a href={s.direct_url} target="_blank" rel="noopener noreferrer" className="pp-button inline-block">
                                            {t('scholarship_results_officialLink')}
                                        </a>
                                        <a href={s.search_url} target="_blank" rel="noopener noreferrer" className="pp-button-secondary inline-block">
                                            {t('scholarship_results_searchGoogle')}
                                        </a>
                                        <button onClick={() => saveScholarship(s, i)} className="pp-button-secondary">
                                            {savedScholarshipKeys[`${s.name}-${i}`] ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScholarshipFinderPage;
