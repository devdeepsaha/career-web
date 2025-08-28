import React, { useState } from 'react';
import MockTest from './MockTest';
import PerformanceDashboard from './PerformanceDashboard';
import DoubtSolverChatbot from '../../components/chat/DoubtSolverChatbot';

const AITutorPage = () => {
    const [tutorView, setTutorView] = useState('practice'); // 'practice' or 'test'
    const [exam, setExam] = useState('JEE');
    const [subject, setSubject] = useState('Physics');
    const [topic, setTopic] = useState('Kinematics');
    const [difficulty, setDifficulty] = useState('Medium');
    const [question, setQuestion] = useState(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [questionError, setQuestionError] = useState('');
    const [testState, setTestState] = useState('idle'); // idle, loading, in-progress, completed
    const [testQuestions, setTestQuestions] = useState([]);
    const [testAnswers, setTestAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: 'Have a doubt? Ask me anything about your exam topics!' }]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const fetchQuestion = async () => {
        setIsLoadingQuestion(true);
        setQuestion(null);
        setQuestionError('');
        try {
            const response = await fetch('http://localhost:5001/get-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exam, subject, topic, difficulty })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setQuestion(data);
        } catch (error) {
            console.error("Failed to fetch question:", error);
            setQuestionError("Failed to fetch question. Please make sure your Python backend server is running and includes the AI Tutor endpoints.");
        } finally {
            setIsLoadingQuestion(false);
        }
    };

    const sendToDoubtSolver = async (messageText) => {
        const userMessage = { sender: 'user', text: messageText };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatLoading(true);

        try {
            const response = await fetch('http://localhost:5001/solve-doubt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: messageText, history: [...chatMessages, userMessage] })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setChatMessages(prev => [...prev, { sender: 'ai', text: data.explanation }]);
        } catch (error) {
            console.error("Doubt solver error:", error);
            setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." }]);
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
            const response = await fetch('http://localhost:5001/generate-mock-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exam, subject })
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

    const submitTest = async () => {
        setTestState('loading');
        try {
            const response = await fetch('http://localhost:5001/analyze-performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: testQuestions, userAnswers: testAnswers })
            });
            if (!response.ok) throw new Error('Failed to analyze test');
            const data = await response.json();
            setTestResult(data);
            setTestState('completed');
        } catch (err) {
            console.error(err);
            setTestState('in-progress'); // Go back to test if analysis fails
        }
    };

    if (testState === 'in-progress' || (testState === 'loading' && testQuestions.length > 0)) {
        return <MockTest questions={testQuestions} userAnswers={testAnswers} setUserAnswers={setTestAnswers} submitTest={submitTest} isLoading={testState === 'loading'} />;
    }

    if (testState === 'completed') {
        return <PerformanceDashboard result={testResult} retakeTest={() => { setTestState('idle'); setTutorView('test'); }} />;
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">AI Tutor for Competitive Exams 🇮🇳</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Personalized practice and instant doubt clarification for JEE, NEET, UPSC, and more.</p>
            </div>

            <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex justify-center border-b border-gray-200 dark:border-slate-700 mb-6">
                    <button onClick={() => setTutorView('practice')} className={`px-6 py-2 font-semibold ${tutorView === 'practice' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>
                        Practice Questions
                    </button>
                    <button onClick={() => setTutorView('test')} className={`px-6 py-2 font-semibold ${tutorView === 'test' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>
                        Mock Tests
                    </button>
                </div>

                {tutorView === 'practice' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Smart Question Bank</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Exam</label>
                                <select value={exam} onChange={e => setExam(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white">
                                    <option>JEE</option><option>NEET</option><option>UPSC</option><option>GATE</option><option>CAT</option><option>Banking</option><option>RRB</option><option>SSC</option><option>State PSC</option><option>NDA</option><option>PSC</option><option>UGC NET/CSIR NET</option><option>IES</option><option>ISRO</option><option>DRDO</option><option>PSU</option><option>CLAT (UG/PG)</option><option>GRE</option><option>TOEFL/IELTS/PTE</option><option>TCS NQT</option><option>Infosys InfyTQ</option><option>Wipro Elite NTH</option><option>NTSE</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., Physics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Topic</label>
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., Kinematics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Difficulty</label>
                                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white">
                                    <option>Easy</option><option>Medium</option><option>Hard</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={fetchQuestion} disabled={isLoadingQuestion} className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400">
                            {isLoadingQuestion ? 'Generating...' : 'Generate New Question'}
                        </button>

                        {questionError && <p className="text-red-500 text-sm mt-4 text-center">{questionError}</p>}
                        {isLoadingQuestion && <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-slate-700 animate-pulse h-32"></div>}
                        {question && (
                            <div className="mt-6 p-6 border rounded-lg bg-gray-50 dark:bg-slate-700/50">
                                <p className="font-semibold mb-4 text-gray-800 dark:text-white">{question.question}</p>
                                <div className="space-y-2">
                                    {question.options.map((opt, i) => <div key={i} className="p-2 border dark:border-slate-600 rounded-md text-gray-700 dark:text-slate-300">{opt}</div>)}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <details>
                                        <summary className="cursor-pointer font-semibold text-green-700 dark:text-green-500">Show Answer</summary>
                                        <p className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-md text-green-800 dark:text-green-300">{question.answer}</p>
                                    </details>
                                    <button onClick={() => handleSolveItClick(question.question)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                                        See how to solve it &rarr;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tutorView === 'test' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Start a Mock Test</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Exam</label>
                                <select value={exam} onChange={e => setExam(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white">
                                    <option>JEE</option><option>NEET</option><option>UPSC</option><option>GATE</option><option>CAT</option><option>Banking</option><option>RRB</option><option>SSC</option><option>State PSC</option><option>NDA</option><option>PSC</option><option>UGC NET/CSIR NET</option><option>IES</option><option>ISRO</option><option>DRDO</option><option>PSU</option><option>CLAT (UG/PG)</option><option>GRE</option><option>TOEFL/IELTS/PTE</option><option>TCS NQT</option><option>Infosys InfyTQ</option><option>Wipro Elite NTH</option><option>NTSE</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., Physics" />
                            </div>
                        </div>
                        <button onClick={startTest} disabled={testState === 'loading'} className="w-full mt-4 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                            {testState === 'loading' ? 'Generating Test...' : 'Start Mock Test'}
                        </button>
                    </div>
                )}
            </div>
            <DoubtSolverChatbot
                isOpen={isChatOpen}
                setIsOpen={setIsChatOpen}
                messages={chatMessages}
                isLoading={isChatLoading}
                handleSend={sendToDoubtSolver}
            />
        </div>
    );
};

export default AITutorPage;