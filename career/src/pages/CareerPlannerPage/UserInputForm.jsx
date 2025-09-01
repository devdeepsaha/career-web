import React from 'react';
import { useTranslation } from 'react-i18next'; // Import the hook

const UserInputForm = ({
    skills, setSkills,
    interests, setInterests,
    goals, setGoals,
    status, setStatus,
    targetCompanies, setTargetCompanies,
    education, setEducation,
    generateRoadmap, isLoading, error
}) => {
    const { t } = useTranslation(); // Initialize the hook

    return (
        <div className="lg:w-1/3 lg:pr-12">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('userInput_title')}</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-6">{t('userInput_subtitle')}</p>
                <form onSubmit={generateRoadmap}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('userInput_skillsLabel')}</label>
                            <textarea id="skills" rows="3" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder={t('userInput_skillsPlaceholder')}></textarea>
                        </div>
                        <div>
                            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('userInput_interestsLabel')}</label>
                            <textarea id="interests" rows="3" value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder={t('userInput_interestsPlaceholder')}></textarea>
                        </div>
                        <div>
                            <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('userInput_goalsLabel')}</label>
                            <textarea id="goals" rows="2" value={goals} onChange={(e) => setGoals(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder={t('userInput_goalsPlaceholder')}></textarea>
                        </div>
                        
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('userInput_statusLabel')}</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white">
                                <option>{t('userInput_status_12th')}</option>
                                <option>{t('userInput_status_10th')}</option>
                                <option>{t('userInput_status_dropper')}</option>
                                <option>{t('userInput_status_1st2ndYear')}</option>
                                <option>{t('userInput_status_finalYear')}</option>
                                <option>{t('userInput_status_graduate')}</option>
                                <option>{t('userInput_status_professional')}</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('userInput_educationLabel')}</label>
                            <input
                                type="text"
                                id="education"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white"
                                placeholder={t('userInput_educationPlaceholder')}
                            />
                        </div>

                        <div>
                            <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('userInput_targetLabel')}</label>
                            <textarea id="target" rows="1" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder={t('userInput_targetPlaceholder')}></textarea>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {isLoading ? t('userInput_button_generating') : t('userInput_button_generate')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserInputForm;