import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MockTest from './MockTest';
import PerformanceDashboard from './PerformanceDashboard';
import DoubtSolverChatbot from '../../components/chat/DoubtSolverChatbot';
import Latex from '../../components/shared/LatexWrapper';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const cleanLatex = (str) => 
    str ? str.replace(/ext|\\t|\\n/g, '').replace(/\s+/g, ' ').trim() : '';


const AITutorPage = () => {
    const { t, i18n } = useTranslation();
    const [tutorView, setTutorView] = useState('practice');

    // State for Practice Questions
    const [practiceExam, setPracticeExam] = useState('Boards(Class 10th)');
    const [practiceSubject, setPracticeSubject] = useState('All');
    const [practiceTopic, setPracticeTopic] = useState('All');
    const [practiceDifficulty, setPracticeDifficulty] = useState('Medium');

    // State for Mock Tests
    const [mockExam, setMockExam] = useState('Boards(Class 10th)');
    const [mockSubject, setMockSubject] = useState('English');
    const [mockTopic, setMockTopic] = useState('All');
    const [mockDifficulty, setMockDifficulty] = useState('All');

    // General component state
    const [question, setQuestion] = useState(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [questionError, setQuestionError] = useState('');
    const [testState, setTestState] = useState('idle');
    const [testQuestions, setTestQuestions] = useState([]);
    const [testAnswers, setTestAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: t('aiTutor_chatbot_initialMessage') }]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);

    const fetchQuestion = async () => {
        setIsLoadingQuestion(true);
        setQuestion(null);
        setQuestionError('');
        try {
            const response = await fetch(`${API_URL}/get-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam: practiceExam,
                    subject: practiceSubject,
                    topic: practiceTopic,
                    difficulty: practiceDifficulty,
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setQuestion(data);
        } catch (error) {
            console.error("Failed to fetch question:", error);
            setQuestionError(t('aiTutor_error_fetchQuestion'));
        } finally {
            setIsLoadingQuestion(false);
        }
    };

    const sendToDoubtSolver = async (messageText) => {
        const userMessage = { sender: 'user', text: messageText };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatLoading(true);
        try {
            const response = await fetch(`${API_URL}/solve-doubt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: messageText,
                    history: [...chatMessages, userMessage],
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setChatMessages(prev => [...prev, { sender: 'ai', text: data.explanation }]);
        } catch (error) {
            console.error("Doubt solver error:", error);
            setChatMessages(prev => [...prev, { sender: 'ai', text: t('aiTutor_error_chatbotConnect') }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSolveItClick = (questionText) => {
        setIsChatOpen(true);
        sendToDoubtSolver(questionText);
    };

    const startTest = async () => {
        setTestState('loading');
        try {
            const response = await fetch(`${API_URL}/generate-mock-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam: mockExam,
                    subject: mockSubject,
                    topic: mockTopic,
                    difficulty: mockDifficulty,
                    num_questions: numQuestions,
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Failed to generate test');
            const data = await response.json();
            setTestQuestions(data);
            setTestAnswers({});
            setTestResult(null);
            setTestState('in-progress');
        } catch (err) {
            console.error(err);
            setTestState('idle');
        }
    };

    const submitTest = useCallback(async () => {
        setTestState('loading');
        try {
            const response = await fetch(`${API_URL}/analyze-performance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questions: testQuestions,
                    userAnswers: testAnswers,
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Failed to analyze test');
            const data = await response.json();
            setTestResult(data);
            setTestState('completed');
        } catch (err) {
            console.error(err);
            setTestState('in-progress');
        }
    }, [testQuestions, testAnswers, i18n.language]);

    const handleEndTest = useCallback(() => {
        setTestState('idle');
        setTestQuestions([]);
    }, []);

    if (testState === 'in-progress' || (testState === 'loading' && testQuestions.length > 0)) {
        return <MockTest questions={testQuestions} userAnswers={testAnswers} setUserAnswers={setTestAnswers} submitTest={submitTest} isLoading={testState === 'loading'} handleEndTest={handleEndTest} />;
    }

    if (testState === 'completed') {
        return <PerformanceDashboard result={testResult} retakeTest={() => { setTestState('idle'); setTutorView('test'); }} />;
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">

                <title>Free MCQs practice for JEE, NEET & UPSC | Potho-Prodorshok</title>
                <meta 
                    name="description" 
                    content="Practice for competitive exams with our free AI Tutor. Get unlimited questions, mock tests, and instant doubt-solving for JEE, NEET, UPSC, and more." 
                />
            
             <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">{t('aiTutor_title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">{t('aiTutor_subtitle')}</p>
            </div>
            
            <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex justify-center border-b border-gray-200 dark:border-slate-700 mb-6">
                    <button onClick={() => setTutorView('practice')} className={`px-6 py-2 font-semibold ${tutorView === 'practice' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>{t('aiTutor_tab_practice')}</button>
                    <button onClick={() => setTutorView('test')} className={`px-6 py-2 font-semibold ${tutorView === 'test' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>{t('aiTutor_tab_mockTests')}</button>
                </div>

                {tutorView === 'practice' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{t('aiTutor_practice_title')}</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_exam')}</label>
                                <select value={practiceExam} onChange={e => setPracticeExam(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white">
                                    <option>Boards(Class 10th)</option>
                                    <option>Boards(Class 12th Science)</option>
                                    <option>Boards(Class 12th Commerce)</option>
                                    <option>Boards(Class 12th Arts)</option>
                                    <option>JEE Advanced</option>
                                    <option>JEE</option>
                                    <option>NEET</option>
                                    <option>UPSC</option>
                                    <option>GATE</option>
                                    <option>CAT</option>
                                    <option>Banking</option>
                                    <option>RRB</option>
                                    <option>SSC</option>
                                    <option>State PSC</option>
                                    <option>NDA</option>
                                    <option>PSC</option>
                                    <option>UGC NET/CSIR NET</option>
                                    <option>IES</option>
                                    <option>ISRO</option>
                                    <option>DRDO</option>
                                    <option>PSU</option>
                                    <option>CLAT (UG/PG)</option>
                                    <option>GRE</option>
                                    <option>TOEFL/IELTS/PTE</option>
                                    <option>TCS NQT</option>
                                    <option>Infosys InfyTQ</option>
                                    <option>Wipro Elite NTH</option>
                                    <option>NTSE</option>
                                    </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_subject')}</label>
                                <input type="text" value={practiceSubject} onChange={e => setPracticeSubject(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('aiTutor_form_subject_placeholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_topic')}</label>
                                <input type="text" value={practiceTopic} onChange={e => setPracticeTopic(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder={t('aiTutor_form_topic_placeholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_difficulty')}</label>
                                <select value={practiceDifficulty} onChange={e => setPracticeDifficulty(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white">
                                    <option>{t('aiTutor_difficulty_easy')}</option>
                                    <option>{t('aiTutor_difficulty_medium')}</option>
                                    <option>{t('aiTutor_difficulty_hard')}</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={fetchQuestion} disabled={isLoadingQuestion} className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400">
                            {isLoadingQuestion ? t('aiTutor_button_generating') : t('aiTutor_button_generateQuestion')}
                        </button>
                        {questionError && <p className="text-red-500 text-sm mt-4 text-center">{questionError}</p>}
                        {question && (
                            <div className="mt-6 p-6 border rounded-lg bg-gray-50 dark:bg-slate-700/50">
                                <p className="font-semibold mb-4 text-gray-800 dark:text-white"><Latex>{cleanLatex(question.question)}</Latex></p>
                                <div className="space-y-2">
                                    {question.options.map((opt, i) => <div key={i} className="p-2 border dark:border-slate-600 rounded-md text-gray-700 dark:text-slate-300"><Latex>{cleanLatex(opt)}</Latex></div>)}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <details>
                                        <summary className="cursor-pointer font-semibold text-green-700 dark:text-green-500">{t('aiTutor_showAnswer')}</summary>
                                        <p className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-md text-green-800 dark:text-green-300"><Latex>{cleanLatex(question.answer)}</Latex></p>
                                    </details>
                                    <button onClick={() => handleSolveItClick(question.question)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                                        {t('aiTutor_solveItLink')} &rarr;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tutorView === 'test' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{t('aiTutor_mockTest_title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_exam')}</label>
                                <select value={mockExam} onChange={e => setMockExam(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg">
                                    <option>Boards(Class 10th)</option>
                                    <option>Boards(Class 12th Science)</option>
                                    <option>Boards(Class 12th Commerce)</option>
                                    <option>Boards(Class 12th Arts)</option>
                                    <option>JEE Advanced</option>
                                    <option>JEE</option>
                                    <option>NEET</option>
                                    <option>UPSC</option>
                                    <option>GATE</option>
                                    <option>CAT</option>
                                    <option>Banking</option>
                                    <option>RRB</option>
                                    <option>SSC</option>
                                    <option>State PSC</option>
                                    <option>NDA</option>
                                    <option>PSC</option>
                                    <option>UGC NET/CSIR NET</option>
                                    <option>IES</option>
                                    <option>ISRO</option>
                                    <option>DRDO</option>
                                    <option>PSU</option>
                                    <option>CLAT (UG/PG)</option>
                                    <option>GRE</option>
                                    <option>TOEFL/IELTS/PTE</option>
                                    <option>TCS NQT</option>
                                    <option>Infosys InfyTQ</option>
                                    <option>Wipro Elite NTH</option>
                                    <option>NTSE</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_subject')}</label>
                                <input type="text" value={mockSubject} onChange={e => setMockSubject(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg" placeholder={t('aiTutor_form_subject_placeholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_topic')}</label>
                                <input type="text" value={mockTopic} onChange={e => setMockTopic(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg" placeholder={t('aiTutor_form_topic_placeholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_form_difficulty')}</label>
                                <select value={mockDifficulty} onChange={e => setMockDifficulty(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg">
                                    <option>{t('aiTutor_difficulty_all')}</option>
                                    <option>{t('aiTutor_difficulty_easy')}</option>
                                    <option>{t('aiTutor_difficulty_medium')}</option>
                                    <option>{t('aiTutor_difficulty_hard')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('aiTutor_mockTest_numQuestions')}</label>
                            <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg">
                                <option value={5}>{t('aiTutor_mockTest_numQuestions_5')}</option>
                                <option value={10}>{t('aiTutor_mockTest_numQuestions_10')}</option>
                                <option value={15}>{t('aiTutor_mockTest_numQuestions_15')}</option>
                                <option value={20}>{t('aiTutor_mockTest_numQuestions_20')}</option>
                            </select>
                        </div>
                        <button onClick={startTest} disabled={testState === 'loading'} className="w-full mt-8 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                            {testState === 'loading' ? t('aiTutor_button_generatingTest') : t('aiTutor_button_startTest')}
                        </button>
                    </div>
                )}
            </div>
            <DoubtSolverChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} messages={chatMessages} isLoading={isChatLoading} handleSend={sendToDoubtSolver} />
        </div>
    );
};

export default AITutorPage;