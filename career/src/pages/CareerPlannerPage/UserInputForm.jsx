import React from 'react';

const UserInputForm = ({
    skills, setSkills,
    interests, setInterests,
    goals, setGoals,
    status, setStatus,
    targetCompanies, setTargetCompanies,
    education, setEducation,
    generateRoadmap, isLoading, error
}) => (
    <div className="lg:w-1/3 lg:pr-12">
        <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Create Your Path</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">Tell us about yourself for a hyper-detailed, actionable career plan.</p>
            <form onSubmit={generateRoadmap}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Current Skills</label>
                        <textarea id="skills" rows="3" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Python, Communication, Lab Research"></textarea>
                    </div>
                    <div>
                        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Interests</label>
                        <textarea id="interests" rows="3" value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Machine Learning, Human Biology, Ancient History"></textarea>
                    </div>
                    <div>
                        <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Career Goal</label>
                        <textarea id="goals" rows="2" value={goals} onChange={(e) => setGoals(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Become a Doctor, IAS Officer, Software Engineer"></textarea>
                    </div>
                    
                    {/* --- UPDATED: Current Status Dropdown with new options --- */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Current Status</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white">
                            <option>Class 12th Student</option>
                            <option>Class 10th Student</option>
                            <option>1st/2nd Year Student</option>
                            <option>Final Year Student</option>
                            <option>Recent Graduate</option>
                            <option>Working Professional</option>
                        </select>
                    </div>
                    
                    {/* --- UPDATED: Highest Qualification changed to an optional text input --- */}
                    <div>
                        <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Highest Qualification (Optional)</label>
                        <input
                            type="text"
                            id="education"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white"
                            placeholder="e.g., B.Tech in CS, MBBS, B.A. in History"
                        />
                    </div>

                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Target Companies/Institutes (Optional)</label>
                        <textarea id="target" rows="1" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Samsung, AIIMS Delhi, Civil Services"></textarea>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Generating...' : '✨ Generate My Detailed Plan'}
                </button>
            </form>
        </div>
    </div>
);

export default UserInputForm;