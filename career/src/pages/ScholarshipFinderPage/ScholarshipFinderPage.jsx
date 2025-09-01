import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScholarshipEmptyState from './ScholarshipEmptyState';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5001';

const ScholarshipFinderPage = () => {
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

    const findScholarships = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setScholarships([]);
        setHasSearched(true);
        try {
            const response = await fetch(`${API_URL}/find-scholarships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    marks, income, region, destination, religion,
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

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">{t('scholarship_title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">{t('scholarship_subtitle')}</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('scholarship_form_title')}</h2>
                        <form onSubmit={findScholarships}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('scholarship_form_marksLabel')}</label>
                                    <input type="text" value={marks} onChange={e => setMarks(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('scholarship_form_marksPlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('scholarship_form_incomeLabel')}</label>
                                    <input type="text" value={income} onChange={e => setIncome(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('scholarship_form_incomePlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('scholarship_form_regionLabel')}</label>
                                    <input type="text" value={region} onChange={e => setRegion(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('scholarship_form_regionPlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('scholarship_form_religionLabel')}</label>
                                    <input type="text" value={religion} onChange={e => setReligion(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('scholarship_form_religionPlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('scholarship_form_destinationLabel')}</label>
                                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('scholarship_form_destinationPlaceholder')} />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                                {isLoading ? t('scholarship_button_searching') : t('scholarship_button_find')}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="lg:w-2/3">
                    {isLoading && <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md animate-pulse h-32"></div>)}</div>}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    
                    {!isLoading && !error && !hasSearched && (
                        <ScholarshipEmptyState />
                    )}
                    {!isLoading && !error && hasSearched && scholarships.length === 0 && (
                        <ScholarshipEmptyState />
                    )}

                    {!isLoading && scholarships.length > 0 && (
                        <div className="space-y-4">
                            {scholarships.map((s, i) => (
                                <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                                    <h3 className="font-bold text-xl text-blue-800 dark:text-blue-400">{s.name}</h3>
                                    <p className="text-gray-600 dark:text-slate-300 mt-2">{s.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2"><strong>{t('scholarship_results_eligibility')}:</strong> {s.eligibility}</p>
                                    <div className="mt-4 flex items-center gap-4">
                                        <a href={s.direct_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
                                            {t('scholarship_results_officialLink')} &rarr;
                                        </a>
                                        <a href={s.search_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-sm">
                                            {t('scholarship_results_searchGoogle')}
                                        </a>
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