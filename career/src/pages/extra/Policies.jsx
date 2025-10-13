import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../components/shared/ThemeToggle'; // Adjust path if needed

const Policies = () => {
    const { t } = useTranslation();
    
    // Local state to manage the theme on this page, syncing with the global theme
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
        setTheme(currentTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        const root = window.document.documentElement;
        root.classList.remove(theme);
        root.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    };

    return (
        <>
            {/* SEO Tags for this page */}
            <title>{t('policies_seo_title')}</title>
            <meta name="description" content={t('policies_seo_desc')} />

            <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-title font-extrabold text-gray-800 dark:text-white">{t('policies_main_title')}</h1>
                    
                </div>

                {/* Privacy Policy Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-title font-bold text-gray-800 dark:text-white mb-4">{t('policies_privacy_title')}</h2>
                    <div className="space-y-4 text-gray-600 dark:text-slate-300">
                        <p>{t('policies_privacy_p1')}</p>
                        
                        <h3 className="text-xl font-semibold pt-4 text-gray-700 dark:text-slate-200">{t('policies_privacy_data_title')}</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>{t('policies_privacy_data_email_title')}:</strong> {t('policies_privacy_data_email_desc')}</li>
                            <li><strong>{t('policies_privacy_data_userInput_title')}:</strong> {t('policies_privacy_data_userInput_desc')}</li>
                            <li><strong>{t('policies_privacy_data_analytics_title')}:</strong> {t('policies_privacy_data_analytics_desc')}</li>
                        </ul>

                        <h3 className="text-xl font-semibold pt-4 text-gray-700 dark:text-slate-200">{t('policies_privacy_usage_title')}</h3>
                        <p>{t('policies_privacy_usage_desc')}</p>

                        <h3 className="text-xl font-semibold pt-4 text-gray-700 dark:text-slate-200">{t('policies_privacy_storage_title')}</h3>
                        <p>{t('policies_privacy_storage_desc')}</p>
                    </div>
                </section>

                {/* Terms of Service Section */}
                <section>
                    <h2 className="text-3xl font-title font-bold text-gray-800 dark:text-white mb-4">{t('policies_terms_title')}</h2>
                    <div className="space-y-4 text-gray-600 dark:text-slate-300">
                        <p>{t('policies_terms_p1')}</p>
                        <p><strong>{t('policies_terms_use_title')}:</strong> {t('policies_terms_use_desc')}</p>
                        <p><strong>{t('policies_terms_disclaimer_title')}:</strong> {t('policies_terms_disclaimer_desc')}</p>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Policies;