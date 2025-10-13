import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ThankYouPage = () => {
    const { t } = useTranslation();
    const [submittedMessage, setSubmittedMessage] = useState('');

    useEffect(() => {
        // Read the message from localStorage when the page loads
        const message = localStorage.getItem('submittedMessage');
        if (message) {
            setSubmittedMessage(message);
            // Clean up localStorage so the message doesn't appear again
            localStorage.removeItem('submittedMessage');
        }
    }, []);

    return (
        <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Thank You!</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">Your message has been sent successfully.</p>
            
            {submittedMessage && (
                <div className="mt-8 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-left">
                    <p className="font-semibold text-gray-700 dark:text-slate-200">You sent:</p>
                    <blockquote className="mt-2 pl-4 border-l-4 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 italic">
                        {submittedMessage}
                    </blockquote>
                </div>
            )}
        </div>
    );
};

export default ThankYouPage;