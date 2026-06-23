import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Latex from '../../components/shared/LatexWrapper'; // 1. Import Latex
import { formatMathText } from './mathText';

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{t('mockTest_loading')}</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 p-3 dark:bg-slate-950 sm:p-4 lg:p-5">
            <div className="mb-3 flex flex-col gap-3 border-b border-slate-200 pb-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white md:text-lg">
                    {t('mockTest_title', { current: currentQ + 1, total: questions.length })}
                </h2>
                <div className="flex items-center gap-2">
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                        {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
                    </div>
                    <button onClick={handleEndTest} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-[background-color,border-color] duration-150 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                        {t('mockTest_endButton')}
                    </button>
                </div>
            </div>
            <div className="saas-card mx-auto flex w-full max-w-5xl flex-1 overflow-y-auto p-4">
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    {/* 2. Wrap the question in Latex */}
                    <p className="text-sm font-semibold leading-6 text-slate-950 text-pretty dark:text-white"><Latex>{formatMathText(questions[currentQ]?.question)}</Latex></p>
                </div>
                <div className="space-y-2">
                    {questions[currentQ]?.options.map((opt, i) => (
                        <label key={i} className={`flex cursor-pointer items-center rounded-md border p-3 text-sm transition-[background-color,border-color] duration-150 ${userAnswers[currentQ] === opt ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'}`}>
                            <input type="radio" name={`q${currentQ}`} value={opt} checked={userAnswers[currentQ] === opt} onChange={() => handleAnswer(currentQ, opt)} className="mr-3 form-radio text-slate-950 focus:ring-slate-950 dark:text-cyan-300 dark:focus:ring-cyan-300"/>
                            {/* 3. Wrap the options in Latex */}
                            <span className="text-slate-700 dark:text-slate-300"><Latex>{formatMathText(opt)}</Latex></span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="mx-auto mt-3 flex w-full max-w-5xl justify-between">
                <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="pp-button-secondary disabled:opacity-50">
                    {t('mockTest_prevButton')}
                </button>
                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))} className="pp-button">
                        {t('mockTest_nextButton')}
                    </button>
                ) : (
                    <button onClick={submitTest} disabled={isLoading} className="pp-button">
                        {isLoading ? t('mockTest_submittingButton') : t('mockTest_submitButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MockTest;
