import React, { useState, useEffect } from 'react';

const MockTest = ({ questions, userAnswers, setUserAnswers, submitTest, isLoading }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 minute per question

    useEffect(() => {
        if (timeLeft === 0) {
            submitTest();
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, submitTest]);

    const handleAnswer = (qIndex, option) => {
        setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-50 p-4 md:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold dark:text-white">Mock Test: Question {currentQ + 1} of {questions.length}</h2>
                <div className="text-lg md:text-xl font-bold bg-red-500 text-white px-4 py-2 rounded-lg">
                    {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-inner p-6 overflow-y-auto">
                <div className="mb-4">
                    <p className="font-bold text-lg dark:text-white">{questions[currentQ]?.question}</p>
                </div>
                <div className="space-y-3">
                    {questions[currentQ]?.options.map((opt, i) => (
                        <label key={i} className={`flex items-center p-3 rounded-lg border dark:border-slate-700 cursor-pointer transition-colors ${userAnswers[currentQ] === opt ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                            <input
                                type="radio"
                                name={`q${currentQ}`}
                                value={opt}
                                checked={userAnswers[currentQ] === opt}
                                onChange={() => handleAnswer(currentQ, opt)}
                                className="mr-3 form-radio text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="dark:text-slate-300">{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-slate-700 dark:text-white disabled:opacity-50">Previous</button>
                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))} className="px-6 py-2 rounded-lg bg-indigo-600 text-white">Next</button>
                ) : (
                    <button onClick={submitTest} disabled={isLoading} className="px-6 py-2 rounded-lg bg-green-600 text-white disabled:bg-green-400">
                        {isLoading ? 'Submitting...' : 'Submit Test'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MockTest;