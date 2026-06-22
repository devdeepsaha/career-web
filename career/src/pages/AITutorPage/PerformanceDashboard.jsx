import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SimpleMarkdownRenderer from '../../components/shared/SimpleMarkdownRenderer';
import Latex from '../../components/shared/LatexWrapper';

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
                    font: { size: 12 },
                },
            },
        },
        cutout: '70%',
    };

    const cleanLatex = (str) =>
        str ? str.replace(/ext|\\t|\\n/g, '').replace(/\s+/g, ' ').trim() : '';

    const colorByScore = (score) => {
        if (score >= 70) return 'text-green-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Test Analytics</p>
                <h1 className="pp-page-title">{t('perfDash_title')}</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">{t('perfDash_subtitle')}</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-4">
                    <div className="saas-card p-4 text-center">
                        <p className="saas-meta">{t('perfDash_score_title')}</p>
                        <p className={`mt-1 text-4xl font-semibold tabular-nums ${colorByScore(result.score)}`}>{result.score}%</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('perfDash_score_details', { correct: result.correct_answers, total: result.total_questions })}
                        </p>
                    </div>

                    <div className="saas-card p-4">
                        <h3 className="saas-section-title mb-3 text-center">{t('perfDash_chart_title')}</h3>
                        <div className="relative h-56">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className="saas-card space-y-4 p-4">
                    <h3 className="saas-section-title">{t('perfDash_analysis_title')}</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <SimpleMarkdownRenderer text={result.analysis} />
                    </div>

                    {result.strengths?.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">Strengths</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                {result.strengths.map((item, idx) => (
                                    <li key={idx}><SimpleMarkdownRenderer text={item} /></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.weaknesses?.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">Weaknesses</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                {result.weaknesses.map((item, idx) => (
                                    <li key={idx}><SimpleMarkdownRenderer text={item} /></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.recommendations?.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">Recommendations</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                {result.recommendations.map((item, idx) => (
                                    <li key={idx}><SimpleMarkdownRenderer text={item} /></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h2 className="saas-section-title mb-3">{t('perfDash_review_title')}</h2>
                <div className="space-y-3">
                    {result.detailed_results.map((item, index) => (
                        <div key={index} className="saas-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <p className="pr-4 text-sm font-semibold leading-6 text-slate-800 dark:text-white">
                                    {index + 1}. <Latex>{cleanLatex(item.question)}</Latex>
                                </p>
                                {item.is_correct ? (
                                    <span className="flex-shrink-0 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                                        {t('perfDash_review_correctTag')}
                                    </span>
                                ) : (
                                    <span className="flex-shrink-0 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-400">
                                        {t('perfDash_review_incorrectTag')}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                {item.options.map((option, optIndex) => {
                                    const isCorrectAnswer = option === item.correct_answer;
                                    const isUserAnswer = option === item.user_answer;

                                    let style = 'border-slate-200 dark:border-slate-700';
                                    if (isCorrectAnswer) style = 'border-green-500 bg-green-50 font-semibold dark:bg-green-900/30';
                                    if (isUserAnswer && !item.is_correct) style = 'border-red-500 bg-red-50 dark:bg-red-900/30';

                                    return (
                                        <div key={optIndex} className={`rounded-md border-l-4 p-3 transition-colors ${style}`}>
                                            <Latex>{cleanLatex(option)}</Latex>
                                            {isUserAnswer && <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">{t('perfDash_review_yourAnswer')}</span>}
                                            {isCorrectAnswer && !isUserAnswer && <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">{t('perfDash_review_correctTag')}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 text-center">
                <button onClick={retakeTest} className="pp-button">
                    {t('perfDash_retakeButton')}
                </button>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
