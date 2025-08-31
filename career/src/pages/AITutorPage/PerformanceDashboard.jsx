import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SimpleMarkdownRenderer from '../../components/shared/SimpleMarkdownRenderer';

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceDashboard = ({ result, retakeTest }) => {
    const { t } = useTranslation();

    const chartData = {
        labels: [t('perfDash_chart_correct'), t('perfDash_chart_incorrect')],
        datasets: [
            {
                data: [result.correct_answers, result.incorrect_answers],
                backgroundColor: ['#10B981', '#EF4444'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: document.body.classList.contains('dark') ? '#cbd5e1' : '#475569',
                    font: { size: 14 }
                }
            },
        },
        cutout: '70%',
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">{t('perfDash_title')}</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-slate-400">{t('perfDash_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border dark:border-slate-700 text-center">
                        <p className="text-lg font-medium text-gray-500 dark:text-slate-400">{t('perfDash_score_title')}</p>
                        <p className={`text-6xl font-bold mt-2 ${result.score >= 70 ? 'text-green-500' : result.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{result.score}%</p>
                        <p className="text-md text-gray-600 dark:text-slate-300 mt-3">
                            {t('perfDash_score_details', { correct: result.correct_answers, total: result.total_questions })}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border dark:border-slate-700">
                        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">{t('perfDash_chart_title')}</h3>
                        <div className="h-64 relative">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border dark:border-slate-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('perfDash_analysis_title')}</h3>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <SimpleMarkdownRenderer text={result.analysis} />
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">{t('perfDash_review_title')}</h2>
                <div className="space-y-6">
                    {result.detailed_results.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-lg text-gray-800 dark:text-white pr-4">
                                    {index + 1}. {item.question}
                                </p>
                                {item.is_correct ? (
                                    <span className="flex-shrink-0 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 py-1 px-3 rounded-full">{t('perfDash_review_correctTag')} ✅</span>
                                ) : (
                                    <span className="flex-shrink-0 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 py-1 px-3 rounded-full">{t('perfDash_review_incorrectTag')} ❌</span>
                                )}
                            </div>
                            <div className="mt-4 space-y-2 text-gray-700 dark:text-slate-300">
                                {item.options.map((option, optIndex) => {
                                    const isCorrectAnswer = option === item.correct_answer;
                                    const isUserAnswer = option === item.user_answer;
                                    
                                    let style = "border-gray-300 dark:border-slate-600";
                                    // Always highlight the correct answer in green
                                    if(isCorrectAnswer) style = "bg-green-100 dark:bg-green-900/30 border-green-500 font-semibold";
                                    // If the user's answer is wrong, override the style to be red
                                    if(isUserAnswer && !item.is_correct) style = "bg-red-100 dark:bg-red-900/30 border-red-500";

                                    return (
                                        <div key={optIndex} className={`p-3 border-l-4 rounded-md transition-colors ${style}`}>
                                            {option}
                                            {isUserAnswer && <span className="text-xs font-bold ml-2 text-gray-500 dark:text-slate-400">{t('perfDash_review_yourAnswer')}</span>}
                                            {/* --- NEW: Add a label for the correct answer if the user was wrong --- */}
                                            {isCorrectAnswer && !isUserAnswer && <span className="text-xs font-bold ml-2 text-green-600 dark:text-green-400">{t('perfDash_review_correctTag')}</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-12">
                <button onClick={retakeTest} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                    {t('perfDash_retakeButton')}
                </button>
            </div>
        </div>
    );
};

export default PerformanceDashboard;