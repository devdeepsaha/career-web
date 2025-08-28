import React, { useState, useEffect, useRef } from 'react';

// --- SVG Icons ---
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);
const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-500">
    <path d="M15.05 14.81A6.5 6.5 0 0 1 8.54 8.35A6.5 6.5 0 0 1 17.45 9.5a1 1 0 0 1 .55 1.72l-2.43 4.21a1 1 0 0 1-1.52 .28z"></path>
    <path d="M20.59 10.41l-1.42-1.42"></path><path d="M3.41 10.41l1.42-1.42"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M18.36 18.36l-1.42-1.42"></path><path d="M5.64 18.36l1.42-1.42"></path><path d="M12 18a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"></path>
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sky-500">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const MessageSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-500">
        <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);


const stepTypeConfig = {
  course: { icon: <BookOpenIcon />, title: "Recommended Course", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", borderColor: "border-indigo-500" },
  project: { icon: <WrenchIcon />, title: "Hands-on Project", bgColor: "bg-green-50 dark:bg-green-900/20", borderColor: "border-green-500" },
  skill: { icon: <LightbulbIcon />, title: "Skill to Acquire", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", borderColor: "border-yellow-500" },
  mentor: { icon: <UsersIcon />, title: "Networking & Mentorship", bgColor: "bg-sky-50 dark:bg-sky-900/20", borderColor: "border-sky-500" },
};

// --- Simple Markdown Renderer ---
const SimpleMarkdownRenderer = ({ text }) => {
    const lines = text.split('\n');
    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                if (line.startsWith('* ')) {
                    const lineContent = line.substring(2);
                    const parts = lineContent.split('**');
                    return (
                        <div key={i} className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <p>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>
                        </div>
                    );
                }
                const parts = line.split('**');
                return <p key={i}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
            })}
        </div>
    );
};

// --- Career Planner Components ---
const UserInputForm = ({ skills, setSkills, interests, setInterests, goals, setGoals, generateRoadmap, isLoading, error }) => (
  <div className="lg:w-1/3 lg:pr-12">
    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Create Your Path</h2>
      <p className="text-gray-500 dark:text-slate-400 mb-6">Tell us about yourself, and our AI will craft a personalized career roadmap for you.</p>
      <form onSubmit={generateRoadmap}>
        <div className="space-y-6">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Current Skills</label>
            <textarea id="skills" rows="3" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Python, Data Analysis, Project Management"></textarea>
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Interests</label>
            <textarea id="interests" rows="3" value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Machine Learning, Sustainable Energy, Mobile App Development"></textarea>
          </div>
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Career Goal</label>
            <textarea id="goals" rows="2" value={goals} onChange={(e) => setGoals(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-800 dark:text-white" placeholder="e.g., Become a Product Manager at a SaaS company"></textarea>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {isLoading ? 'Generating...' : '✨ Generate My Roadmap'}
        </button>
      </form>
    </div>
  </div>
);
const RoadmapStepCard = ({ step }) => {
  const config = stepTypeConfig[step.type] || {};
  return (
    <div className={`p-6 rounded-xl shadow-lg border-l-4 ${config.borderColor} ${config.bgColor} transform transition-transform hover:scale-[1.02] hover:shadow-xl`}>
      <div className="flex items-start sm:items-center space-x-4">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{config.title}</p>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1">{step.title}</h3>
          <p className="text-gray-600 dark:text-slate-300 mt-2">{step.description}</p>
          <a href={step.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
            Learn More from {step.source} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
const RoadmapDisplay = ({ isLoading, roadmap }) => (
  <div className="lg:w-2/3 mt-12 lg:mt-0">
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Personalized Roadmap</h2>
    <p className="text-gray-500 dark:text-slate-400 mb-8">Follow these steps to achieve your career goals. Each step is a building block for your future.</p>
    {isLoading && (
      <div className="space-y-6">{[...Array(3)].map((_, i) => (<div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-pulse"><div className="flex items-center"><div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full mr-4"></div><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div></div></div></div>))}</div>
    )}
    {!isLoading && roadmap.length > 0 && (
      <div className="relative">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true"></div>
        <div className="space-y-8">{roadmap.map((step, index) => (<div key={index} className="relative flex items-start"><div className="flex-shrink-0 w-12 flex flex-col items-center"><div className="h-4 w-4 rounded-full bg-indigo-500 mt-5 z-10 border-4 border-gray-50 dark:border-slate-900"></div></div><div className="ml-4 flex-1"><RoadmapStepCard step={step} /></div></div>))}</div>
      </div>
    )}
  </div>
);
const CareerPlannerChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hi! How can I help you with your career path today?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: [...messages, userMessage] })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
                aria-label="Toggle Chat"
            >
                {isOpen ? <XIcon /> : <MessageSquareIcon />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 z-40">
                    <div className="p-4 bg-indigo-600 text-white rounded-t-2xl">
                        <h3 className="font-bold text-lg">Career Coach AI</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900 min-h-0">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`py-2 px-4 rounded-2xl max-w-xs break-words ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'}`}>
                                    {msg.sender === 'ai' ? <SimpleMarkdownRenderer text={msg.text} /> : msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="py-2 px-4 rounded-2xl bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white">Typing...</div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 dark:text-white"
                                placeholder="Ask a question..."
                                disabled={isLoading}
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 disabled:bg-indigo-400" disabled={isLoading}>
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};
const EmptyStateGraphic = () => (
    <div className="lg:w-2/3 mt-12 lg:mt-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-md h-64">
            <div className="absolute top-0 left-10 w-24 h-24 bg-indigo-200 dark:bg-indigo-900/50 rounded-full animate-blob"></div>
            <div className="absolute top-0 right-10 w-28 h-28 bg-green-200 dark:bg-green-900/50 rounded-full animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-20 w-20 h-20 bg-sky-200 dark:bg-sky-900/50 rounded-full animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-5 right-16 w-16 h-16 bg-yellow-200 dark:bg-yellow-900/50 rounded-full animate-blob animation-delay-1000"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-center text-gray-500 dark:text-slate-400">Your personalized roadmap will appear here...</p>
            </div>
        </div>
        <style>{`
            .animate-blob {
                animation: blob 7s infinite;
            }
            .animation-delay-2000 {
                animation-delay: 2s;
            }
            .animation-delay-4000 {
                animation-delay: 4s;
            }
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
        `}</style>
    </div>
);
const CareerPlannerPage = () => {
    const [skills, setSkills] = useState('React, JavaScript, HTML, CSS');
    const [interests, setInterests] = useState('Frontend Development, UI/UX Design, Data Visualization');
    const [goals, setGoals] = useState('Become a Senior Frontend Engineer at a tech company');
    const [roadmap, setRoadmap] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);

    const generateRoadmap = async (e) => {
        e.preventDefault();
        if (!skills || !interests || !goals) {
          setError('Please fill out all fields.'); return;
        }
        setError(''); setIsLoading(true); setRoadmap([]); setIsRoadmapVisible(true);
        try {
          const response = await fetch('http://localhost:5001/generate-roadmap', {
            method: 'POST', headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ skills, interests, goals }),
          });
          if (!response.ok) throw new Error('Network response was not ok');
          const generatedSteps = await response.json();
          setRoadmap(generatedSteps);
        } catch (error) {
          console.error("Failed to fetch roadmap:", error);
          setError("Sorry, we couldn't generate your roadmap. Please ensure the backend server is running correctly.");
        } finally {
          setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">AI-Powered Career Planner <span role="img" aria-label="map">🗺️</span></h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Your personal guide to navigating the complexities of your professional journey.</p>
            </div>
            <div className="flex flex-col lg:flex-row">
                <UserInputForm 
                    skills={skills} setSkills={setSkills}
                    interests={interests} setInterests={setInterests}
                    goals={goals} setGoals={setGoals}
                    generateRoadmap={generateRoadmap}
                    isLoading={isLoading} error={error}
                />
                {!isRoadmapVisible ? <EmptyStateGraphic /> : <RoadmapDisplay isLoading={isLoading} roadmap={roadmap} />}
            </div>
            <CareerPlannerChatbot />
        </div>
    );
};

// --- AI Tutor Components ---
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

const MockTest = ({ questions, userAnswers, setUserAnswers, submitTest, isLoading }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 minute per question

    useEffect(() => {
        if (timeLeft === 0) {
            submitTest();
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, submitTest]);

    const handleAnswer = (qIndex, option) => {
        setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-50 p-4 md:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Mock Test: Question {currentQ + 1} of {questions.length}</h2>
                <div className="text-lg md:text-xl font-bold bg-red-500 text-white px-4 py-2 rounded-lg">
                    {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-inner p-6 overflow-y-auto">
                <div className="mb-4">
                    <p className="font-bold text-lg">{questions[currentQ]?.question}</p>
                </div>
                <div className="space-y-3">
                    {questions[currentQ]?.options.map((opt, i) => (
                        <label key={i} className={`flex items-center p-3 rounded-lg border dark:border-slate-700 cursor-pointer transition-colors ${userAnswers[currentQ] === opt ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                            <input 
                                type="radio" 
                                name={`q${currentQ}`} 
                                value={opt}
                                checked={userAnswers[currentQ] === opt}
                                onChange={() => handleAnswer(currentQ, opt)}
                                className="mr-3 form-radio text-indigo-600"
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-slate-700 disabled:opacity-50">Previous</button>
                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))} className="px-6 py-2 rounded-lg bg-indigo-600 text-white">Next</button>
                ) : (
                    <button onClick={submitTest} disabled={isLoading} className="px-6 py-2 rounded-lg bg-green-600 text-white disabled:bg-green-400">
                        {isLoading ? 'Submitting...' : 'Submit Test'}
                    </button>
                )}
            </div>
        </div>
    );
};

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

const ScholarshipFinderPage = () => {
    const [marks, setMarks] = useState('');
    const [income, setIncome] = useState('');
    const [region, setRegion] = useState('India');
    const [destination, setDestination] = useState('India');
    const [religion, setReligion] = useState('');
    const [scholarships, setScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const findScholarships = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setScholarships([]);
        try {
            const response = await fetch('http://localhost:5001/find-scholarships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marks, income, region, destination, religion })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setScholarships(data);
        } catch (err) {
            console.error("Failed to fetch scholarships:", err);
            setError("Could not find scholarships. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">Smart Scholarship Finder 🎓</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Find scholarships that match your profile, for studies in India and abroad.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Profile</h2>
                        <form onSubmit={findScholarships}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Marks (Percentage/GPA)</label>
                                    <input type="text" value={marks} onChange={e => setMarks(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., 85% or 3.8 GPA" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Annual Family Income (INR)</label>
                                    <input type="text" value={income} onChange={e => setIncome(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., 500000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Region (State/Country)</label>
                                    <input type="text" value={region} onChange={e => setRegion(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., Maharashtra or India" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Religion (Optional)</label>
                                    <input type="text" value={religion} onChange={e => setReligion(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., Hindu, Muslim, Christian" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Study Destination (Country)</label>
                                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white" placeholder="e.g., USA, UK, or India" />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                                {isLoading ? 'Searching...' : 'Find Scholarships'}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="lg:w-2/3">
                    {isLoading && <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md animate-pulse h-24"></div>)}</div>}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <div className="space-y-4">
                        {scholarships.map((s, i) => (
                            <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                                <h3 className="font-bold text-xl text-blue-800 dark:text-blue-400">{s.name}</h3>
                                <p className="text-gray-600 dark:text-slate-300 mt-2">{s.description}</p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2"><strong>Eligibility:</strong> {s.eligibility}</p>
                                <div className="mt-4">
                                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                                        Apply Now &rarr;
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const DoubtSolverChatbot = ({ isOpen, setIsOpen, messages, isLoading, handleSend }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onFormSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleSend(input);
        setInput('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 z-50"
                aria-label="Toggle Doubt Solver Chat"
            >
                {isOpen ? <XIcon /> : <MessageSquareIcon />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 z-40">
                    <div className="p-4 bg-green-600 text-white rounded-t-2xl">
                        <h3 className="font-bold text-lg">Instant Doubt Solver</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900 min-h-0">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`py-2 px-4 rounded-2xl max-w-xs break-words ${msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'}`}>
                                    {msg.sender === 'ai' ? <SimpleMarkdownRenderer text={msg.text} /> : msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="py-2 px-4 rounded-2xl bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white">Thinking...</div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={onFormSubmit} className="p-4 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800 dark:text-white"
                                placeholder="Ask a doubt..."
                                disabled={isLoading}
                            />
                            <button type="submit" className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 disabled:bg-green-400" disabled={isLoading}>
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

const ThemeToggle = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <button 
            onClick={toggleTheme} 
            className="relative w-14 h-7 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center p-1 transition-colors duration-300"
        >
            <div className={`absolute w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}></div>
            <div className="flex justify-between w-full">
                <SunIcon />
                <MoonIcon />
            </div>
        </button>
    );
};


// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans text-gray-900 dark:text-slate-300">
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex-1"></div>
                <nav className="flex justify-center space-x-2 md:space-x-6 flex-1">
                    <button 
                        onClick={() => setActiveTab('planner')}
                        className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'planner' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                    >
                        Career Planner
                    </button>
                    <button 
                        onClick={() => setActiveTab('tutor')}
                        className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'tutor' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                    >
                        AI Tutor
                    </button>
                    <button 
                        onClick={() => setActiveTab('scholarship')}
                        className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTab === 'scholarship' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                    >
                        Scholarship Finder
                    </button>
                </nav>
                <div className="flex-1 flex justify-end">
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
            </div>
        </header>

      <main>
        {activeTab === 'planner' && <CareerPlannerPage />}
        {activeTab === 'tutor' && <AITutorPage />}
        {activeTab === 'scholarship' && <ScholarshipFinderPage />}
      </main>
      
      <footer className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm border-t dark:border-slate-700 mt-12">
        <p>Powered by AI & your ambition. Created as a demo application.</p>
      </footer>
    </div>
  );
}
