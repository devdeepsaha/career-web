import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SimpleMarkdownRenderer from '../../components/shared/SimpleMarkdownRenderer';
import Latex from '../../components/shared/LatexWrapper';
import { formatMathText } from './mathText';

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

    const colorByScore = (score) => {
        if (score >= 70) return 'text-green-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const missedItems = result.detailed_results?.filter((item) => !item.is_correct) || [];
    const correctItems = result.detailed_results?.filter((item) => item.is_correct) || [];
    const strengths = result.strengths?.length
        ? result.strengths
        : correctItems.slice(0, 3).map((item) => item.question);
    const weaknesses = result.weaknesses?.length
        ? result.weaknesses
        : missedItems.slice(0, 3).map((item) => item.question);
    const recommendations = result.recommendations?.length
        ? result.recommendations
        : missedItems.length
            ? missedItems.slice(0, 3).map((item) => `${t('perfDash_recommendation_review')} ${formatMathText(item.question)}`)
            : [t('perfDash_recommendation_maintain')];

    const InsightCard = ({ title, tone, items }) => {
        const toneClass = {
            good: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
            risk: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200',
            action: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200',
        }[tone];

        return (
            <section className={`rounded-xl border p-4 ${toneClass}`}>
                <h4 className="text-sm font-semibold">{title}</h4>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                    {items.slice(0, 4).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                            <div className="max-h-24 overflow-hidden"><SimpleMarkdownRenderer text={formatMathText(item)} /></div>
                        </li>
                    ))}
                </ul>
            </section>
        );
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
                    <div className="grid gap-3 xl:grid-cols-3">
                        <InsightCard title={t('perfDash_strengths_title')} tone="good" items={strengths.length ? strengths : [t('perfDash_no_strengths')]} />
                        <InsightCard title={t('perfDash_weaknesses_title')} tone="risk" items={weaknesses.length ? weaknesses : [t('perfDash_no_weaknesses')]} />
                        <InsightCard title={t('perfDash_nextActions_title')} tone="action" items={recommendations} />
                    </div>

                    {result.analysis && (
                        <details className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                            <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">{t('perfDash_fullAnalysis')}</summary>
                            <div className="prose prose-sm mt-3 max-w-none dark:prose-invert">
                                <SimpleMarkdownRenderer text={result.analysis} />
                            </div>
                        </details>
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
                                    {index + 1}. <Latex>{formatMathText(item.question)}</Latex>
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
                                            <Latex>{formatMathText(option)}</Latex>
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
