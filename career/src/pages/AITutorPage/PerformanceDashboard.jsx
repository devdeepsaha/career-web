import React from 'react';
import SimpleMarkdownRenderer from '../../components/shared/SimpleMarkdownRenderer';

const PerformanceDashboard = ({ result, retakeTest }) => (
    <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold dark:text-white">Test Results</h1>
        </div>
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-center">
                <div>
                    <p className="text-lg text-gray-500 dark:text-slate-400">Your Score</p>
                    <p className="text-5xl font-bold text-green-600">{result.score}%</p>
                </div>
                <div>
                    <p className="text-lg text-gray-500 dark:text-slate-400">Accuracy</p>
                    <p className="text-5xl font-bold text-blue-600">{result.accuracy}%</p>
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">AI Analysis & Recommendations</h3>
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <SimpleMarkdownRenderer text={result.analysis} />
                </div>
            </div>
            <div className="text-center mt-8">
                <button onClick={retakeTest} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                    Take Another Test
                </button>
            </div>
        </div>
    </div>
);

export default PerformanceDashboard;