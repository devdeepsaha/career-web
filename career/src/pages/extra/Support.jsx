import React from 'react';
import { useTranslation } from 'react-i18next';

// A small, reusable component for the FAQ items
const FaqItem = ({ question, answer }) => {
    return (
        <details className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border dark:border-slate-600 cursor-pointer">
            <summary className="font-semibold text-gray-800 dark:text-white">{question}</summary>
            <p className="mt-2 text-gray-600 dark:text-slate-300">{answer}</p>
        </details>
    );
};

const Support = () => {
    const { t } = useTranslation();

    // Determine the correct redirect URL based on the environment
    const isDevelopment = import.meta.env.DEV;
    const redirectUrl = isDevelopment 
        ? "http://localhost:5173/?tab=thankyou" 
        : "https://pothoprodorshok.onrender.com/?tab=thankyou";

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
            
            {/* SEO Tags for React 19 */}
            <title>{t('support_seo_title')}</title>
            <meta name="description" content={t('support_seo_desc')} />

            {/* About Us Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-title font-extrabold text-gray-800 dark:text-white">{t('support_about_title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">{t('support_about_subtitle')}</p>
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-title font-bold text-center text-gray-800 dark:text-white mb-8">{t('support_faq_title')}</h2>
                <div className="space-y-4 max-w-2xl mx-auto">
                    <FaqItem question={t('support_faq_q1')} answer={t('support_faq_a1')} />
                    <FaqItem question={t('support_faq_q2')} answer={t('support_faq_a2')} />
                    <FaqItem question={t('support_faq_q3')} answer={t('support_faq_a3')} />
                </div>
            </div>

            {/* Contact Form Section */}
            <div>
                <h2 className="text-3xl font-title font-bold text-center text-gray-800 dark:text-white mb-8">{t('support_contact_title')}</h2>
                <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border dark:border-slate-700">
                    <form action="https://formsubmit.co/devdeep120205@gmail.com" method="POST">
                        {/* FormSubmit specific hidden inputs */}
                        <input type="hidden" name="_subject" value="New Potho-Prodorshok Support Message!" />
                        <input type="hidden" name="_next" value={redirectUrl} /> 
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">{t('support_form_name')}</label>
                                <input type="text" name="name" required className="w-full mt-1 p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">{t('support_form_email')}</label>
                                <input type="email" name="email" required className="w-full mt-1 p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">{t('support_form_message')}</label>
                                <textarea name="message" rows="5" required className="w-full mt-1 p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                                {t('support_form_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Support;