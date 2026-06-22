import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import the hook

const UserInputForm = ({
    skills, setSkills,
    interests, setInterests,
    goals, setGoals,
    status, setStatus,
    targetCompanies, setTargetCompanies,
    education, setEducation,
    syncProfile, setSyncProfile,
    generateRoadmap, isLoading, error
}) => {
    const { t } = useTranslation(); // Initialize the hook

    const fieldClass = "pp-input";
    const labelClass = "pp-label flex items-center gap-2";

    return (
        <div>
            <div className="saas-card xl:sticky xl:top-16">
                <div className="flex items-start gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-950 dark:text-white">{t('userInput_title')}</h2>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{t('userInput_subtitle')}</p>
                    </div>
                </div>
                <form onSubmit={generateRoadmap} className="max-h-none p-4 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="skills" className={labelClass}>{t('userInput_skillsLabel')} <Info className="h-3.5 w-3.5 text-slate-400" /></label>
                            <textarea id="skills" rows="2" value={skills} onChange={(e) => setSkills(e.target.value)} className={fieldClass} placeholder={t('userInput_skillsPlaceholder')}></textarea>
                        </div>
                        <div>
                            <label htmlFor="interests" className={labelClass}>{t('userInput_interestsLabel')}</label>
                            <textarea id="interests" rows="2" value={interests} onChange={(e) => setInterests(e.target.value)} className={fieldClass} placeholder={t('userInput_interestsPlaceholder')}></textarea>
                        </div>
                        <div>
                            <label htmlFor="goals" className={labelClass}>{t('userInput_goalsLabel')}</label>
                            <textarea id="goals" rows="2" value={goals} onChange={(e) => setGoals(e.target.value)} className={fieldClass} placeholder={t('userInput_goalsPlaceholder')}></textarea>
                        </div>
                        
                        <div>
                            <label htmlFor="status" className={labelClass}>{t('userInput_statusLabel')}</label>
                            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
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
                            <label htmlFor="education" className={labelClass}>{t('userInput_educationLabel')}</label>
                            <input
                                type="text"
                                id="education"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                className={fieldClass}
                                placeholder={t('userInput_educationPlaceholder')}
                            />
                        </div>

                        <div>
                            <label htmlFor="target" className={labelClass}>{t('userInput_targetLabel')}</label>
                            <textarea id="target" rows="1" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} className={fieldClass} placeholder={t('userInput_targetPlaceholder')}></textarea>
                        </div>
                        <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={syncProfile}
                                onChange={(e) => setSyncProfile(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            Update my profile from this input
                        </label>
                    </div>
                    {error && <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
                    <button type="submit" disabled={isLoading} className="pp-button mt-4 w-full">
                        {isLoading ? t('userInput_button_generating') : t('userInput_button_generate')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserInputForm;
