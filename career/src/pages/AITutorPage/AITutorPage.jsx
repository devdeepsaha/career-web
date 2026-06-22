import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MockTest from './MockTest';
import PerformanceDashboard from './PerformanceDashboard';
import DoubtSolverChatbot from '../../components/chat/DoubtSolverChatbot';
import Latex from '../../components/shared/LatexWrapper';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const cleanLatex = (str) => 
    str ? str.replace(/ext|\\t|\\n/g, '').replace(/\s+/g, ' ').trim() : '';

const AITutorPage = ({ currentUser, showAuth }) => {
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
    const [selectedPracticeAnswer, setSelectedPracticeAnswer] = useState(null);
    const [questionStartedAt, setQuestionStartedAt] = useState(null);
    const [isQuestionSaved, setIsQuestionSaved] = useState(false);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [questionError, setQuestionError] = useState('');
    const [testState, setTestState] = useState('idle');
    const [testQuestions, setTestQuestions] = useState([]);
    const [testAnswers, setTestAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);

    const fetchQuestion = async () => {
        if (!currentUser) {
            showAuth('login');
            return;
        }

        setIsLoadingQuestion(true);
        setQuestion(null);
        setSelectedPracticeAnswer(null);
        setIsQuestionSaved(false);
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
            setQuestionStartedAt(Date.now());
        } catch (error) {
            console.error("Failed to fetch question:", error);
            setQuestionError(t('aiTutor_error_fetchQuestion'));
        } finally {
            setIsLoadingQuestion(false);
        }
    };

    const answerPracticeQuestion = async (option) => {
        if (!question || selectedPracticeAnswer) return;
        setSelectedPracticeAnswer(option);
        try {
            await fetch(`${API_URL}/question-attempts`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_text: question.question,
                    selected_answer: option,
                    correct_answer: question.answer,
                    is_correct: option === question.answer,
                    time_taken_seconds: questionStartedAt ? Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000)) : null,
                    exam: practiceExam,
                    subject: practiceSubject,
                    topic: practiceTopic,
                    difficulty: practiceDifficulty,
                }),
            });
        } catch (err) {
            console.error('Failed to save attempt:', err);
        }
    };

    const savePracticeQuestion = async () => {
        if (!question) return;
        try {
            const response = await fetch(`${API_URL}/saved-questions`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_text: question.question,
                    options_json: question.options,
                    correct_answer: question.answer,
                    explanation: question.explanation,
                    exam: practiceExam,
                    subject: practiceSubject,
                    topic: practiceTopic,
                    difficulty: practiceDifficulty,
                    source: 'practice',
                }),
            });
            if (response.ok) setIsQuestionSaved(true);
        } catch (err) {
            console.error('Failed to save question:', err);
        }
    };

    // Open chatbot with a question - let the chatbot handle everything
    const handleSolveItClick = (questionText) => {
        setIsChatOpen(true);
        // The DoubtSolverChatbot will handle creating session and saving messages
        // We just need to trigger it to open with this question
        setTimeout(() => {
            // Trigger the chatbot's send function by simulating user input
            const inputEvent = new CustomEvent('doubt-solver-send', { detail: questionText });
            window.dispatchEvent(inputEvent);
        }, 100);
    };

    const startTest = async () => {
        if (!currentUser) {
            showAuth('login');
            return;
        }

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
                    language: i18n.language,
                    save: true,
                    exam: mockExam,
                    subject: mockSubject,
                    topic: mockTopic,
                    difficulty: mockDifficulty,
                }),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to analyze test');
            const data = await response.json();
            setTestResult(data);
            setTestState('completed');
        } catch (err) {
            console.error(err);
            setTestState('in-progress');
        }
    }, [testQuestions, testAnswers, i18n.language, mockExam, mockSubject, mockTopic, mockDifficulty]);

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
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <title>Free MCQs practice for JEE, NEET & UPSC | Potho-Prodorshok</title>
            <meta 
                name="description" 
                content="Practice for competitive exams with our free AI Tutor. Get unlimited questions, mock tests, and instant doubt-solving for JEE, NEET, UPSC, and more." 
            />
            
            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">AI Exam Studio</p>
                <h1 className="pp-page-title">{t('aiTutor_title')}</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">{t('aiTutor_subtitle')}</p>
            </div>
            
            <div className="saas-card p-4">
                <div className="mb-4 flex w-full rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 sm:w-fit">
                    <button onClick={() => setTutorView('practice')} className={`rounded-md px-4 py-2 text-sm font-medium transition-[color,background-color] duration-150 ${tutorView === 'practice' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>{t('aiTutor_tab_practice')}</button>
                    <button onClick={() => setTutorView('test')} className={`rounded-md px-4 py-2 text-sm font-medium transition-[color,background-color] duration-150 ${tutorView === 'test' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>{t('aiTutor_tab_mockTests')}</button>
                </div>

                {tutorView === 'practice' && (
                    <div>
                        <h2 className="mb-4 saas-section-title">{t('aiTutor_practice_title')}</h2>
                        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="pp-label">{t('aiTutor_form_exam')}</label>
                                <select value={practiceExam} onChange={e => setPracticeExam(e.target.value)} className="pp-input">
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
                                <label className="pp-label">{t('aiTutor_form_subject')}</label>
                                <input type="text" value={practiceSubject} onChange={e => setPracticeSubject(e.target.value)} className="pp-input" placeholder={t('aiTutor_form_subject_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_topic')}</label>
                                <input type="text" value={practiceTopic} onChange={e => setPracticeTopic(e.target.value)} className="pp-input" placeholder={t('aiTutor_form_topic_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_difficulty')}</label>
                                <select value={practiceDifficulty} onChange={e => setPracticeDifficulty(e.target.value)} className="pp-input">
                                    <option>{t('aiTutor_difficulty_easy')}</option>
                                    <option>{t('aiTutor_difficulty_medium')}</option>
                                    <option>{t('aiTutor_difficulty_hard')}</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={fetchQuestion} disabled={isLoadingQuestion} className="pp-button mt-2 w-full sm:w-auto">
                            {isLoadingQuestion ? t('aiTutor_button_generating') : t('aiTutor_button_generateQuestion')}
                        </button>
                        {questionError && <p className="text-red-500 text-sm mt-4 text-center">{questionError}</p>}
                        {question && (
                            <div className="pp-subpanel mt-4 p-4">
                                <p className="mb-3 text-sm font-semibold text-slate-950 dark:text-white"><Latex>{cleanLatex(question.question)}</Latex></p>
                                <div className="space-y-2">
                                    {question.options.map((opt, i) => {
                                        const hasAnswered = Boolean(selectedPracticeAnswer);
                                        const isSelected = selectedPracticeAnswer === opt;
                                        const isCorrect = question.answer === opt;
                                        const stateClass = hasAnswered && isCorrect
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200'
                                            : hasAnswered && isSelected
                                                ? 'border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900';
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => answerPracticeQuestion(opt)}
                                                className={`flex min-h-10 w-full items-center rounded-md border p-3 text-left text-sm transition-[background-color,border-color,transform] duration-150 active:scale-[0.96] ${stateClass}`}
                                            >
                                                <Latex>{cleanLatex(opt)}</Latex>
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedPracticeAnswer && (
                                    <div className={`mt-3 rounded-md border p-3 text-sm ${selectedPracticeAnswer === question.answer ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'}`}>
                                        {selectedPracticeAnswer === question.answer ? 'Correct.' : 'Not quite.'} Correct answer: <span className="font-semibold"><Latex>{cleanLatex(question.answer)}</Latex></span>
                                    </div>
                                )}
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <button onClick={savePracticeQuestion} className="ios-pill text-sm">
                                        {isQuestionSaved ? 'Saved' : 'Save question'}
                                    </button>
                                    <button onClick={() => handleSolveItClick(question.question)} className="ios-pill text-sm">{t('aiTutor_solveItLink')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tutorView === 'test' && (
                    <div>
                        <h2 className="mb-4 saas-section-title">{t('aiTutor_mockTest_title')}</h2>
                        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="pp-label">{t('aiTutor_form_exam')}</label>
                                <select value={mockExam} onChange={e => setMockExam(e.target.value)} className="pp-input">
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
                                <label className="pp-label">{t('aiTutor_form_subject')}</label>
                                <input type="text" value={mockSubject} onChange={e => setMockSubject(e.target.value)} className="pp-input" placeholder={t('aiTutor_form_subject_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_topic')}</label>
                                <input type="text" value={mockTopic} onChange={e => setMockTopic(e.target.value)} className="pp-input" placeholder={t('aiTutor_form_topic_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_difficulty')}</label>
                                <select value={mockDifficulty} onChange={e => setMockDifficulty(e.target.value)} className="pp-input">
                                    <option>{t('aiTutor_difficulty_all')}</option>
                                    <option>{t('aiTutor_difficulty_easy')}</option>
                                    <option>{t('aiTutor_difficulty_medium')}</option>
                                    <option>{t('aiTutor_difficulty_hard')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="pp-label">{t('aiTutor_mockTest_numQuestions')}</label>
                            <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="pp-input">
                                <option value={5}>{t('aiTutor_mockTest_numQuestions_5')}</option>
                                <option value={10}>{t('aiTutor_mockTest_numQuestions_10')}</option>
                                <option value={15}>{t('aiTutor_mockTest_numQuestions_15')}</option>
                                <option value={20}>{t('aiTutor_mockTest_numQuestions_20')}</option>
                            </select>
                        </div>
                        <button onClick={startTest} disabled={testState === 'loading'} className="pp-button mt-4 w-full sm:w-auto">
                            {testState === 'loading' ? t('aiTutor_button_generatingTest') : t('aiTutor_button_startTest')}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Pass isOpen and setIsOpen as props - chatbot will handle its own state */}
            <DoubtSolverChatbot 
                isOpen={isChatOpen} 
                setIsOpen={setIsChatOpen}
            />
        </div>
    );
};

export default AITutorPage;
