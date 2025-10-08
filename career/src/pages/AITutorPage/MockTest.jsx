import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Latex from '../../components/shared/LatexWrapper'; // 1. Import Latex

const MockTest = ({ questions, userAnswers, setUserAnswers, submitTest, isLoading, handleEndTest }) => {
    const { t } = useTranslation();
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions.length * 90);

    useEffect(() => {
        if (timeLeft <= 0 && questions.length > 0) {
            submitTest();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        
        return () => clearInterval(timer);
    }, [timeLeft, questions.length, submitTest]);

    const handleAnswer = (qIndex, option) => {
        setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    if (!questions || questions.length === 0) {
        return (
            <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-50 flex items-center justify-center">
                <p className="text-xl font-semibold dark:text-white">{t('mockTest_loading')}</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-50 p-4 md:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold dark:text-white">
                    {t('mockTest_title', { current: currentQ + 1, total: questions.length })}
                </h2>
                <div className="flex items-center gap-4">
                    <div className="text-lg md:text-xl font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg">
                        {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
                    </div>
                    <button onClick={handleEndTest} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-semibold">
                        {t('mockTest_endButton')}
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-inner p-6 overflow-y-auto">
                <div className="mb-4">
                    {/* 2. Wrap the question in Latex */}
                    <p className="font-bold text-lg dark:text-white"><Latex>{questions[currentQ]?.question}</Latex></p>
                </div>
                <div className="space-y-3">
                    {questions[currentQ]?.options.map((opt, i) => (
                        <label key={i} className={`flex items-center p-3 rounded-lg border dark:border-slate-700 cursor-pointer transition-colors ${userAnswers[currentQ] === opt ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                            <input type="radio" name={`q${currentQ}`} value={opt} checked={userAnswers[currentQ] === opt} onChange={() => handleAnswer(currentQ, opt)} className="mr-3 form-radio text-indigo-600 focus:ring-indigo-500"/>
                            {/* 3. Wrap the options in Latex */}
                            <span className="dark:text-slate-300"><Latex>{opt}</Latex></span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-slate-700 dark:text-white disabled:opacity-50">
                    {t('mockTest_prevButton')}
                </button>
                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))} className="px-6 py-2 rounded-lg bg-indigo-600 text-white">
                        {t('mockTest_nextButton')}
                    </button>
                ) : (
                    <button onClick={submitTest} disabled={isLoading} className="px-6 py-2 rounded-lg bg-green-600 text-white disabled:bg-green-400">
                        {isLoading ? t('mockTest_submittingButton') : t('mockTest_submitButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MockTest;