import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpenCheck, GraduationCap, SlidersHorizontal, Target } from 'lucide-react';
import MockTest from './MockTest';
import PerformanceDashboard from './PerformanceDashboard';
import DoubtSolverChatbot from '../../components/chat/DoubtSolverChatbot';
import Latex from '../../components/shared/LatexWrapper';
import { formatMathText } from './mathText';
import { addGuestWorkspaceItem, getGuestWorkspace } from '../../utils/guestWorkspace';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
const EXAM_OPTIONS = [
    'Boards(Class 10th)',
    'Boards(Class 12th Science)',
    'Boards(Class 12th Commerce)',
    'Boards(Class 12th Arts)',
    'JEE Advanced',
    'JEE',
    'NEET',
    'UPSC',
    'GATE',
    'CAT',
    'Banking',
    'RRB',
    'SSC',
    'State PSC',
    'NDA',
    'PSC',
    'UGC NET/CSIR NET',
    'IES',
    'ISRO',
    'DRDO',
    'PSU',
    'CIL',
    'CIL Management Trainee',
    'CIL Systems / EDP',
    'CIL Mining',
    'CIL Electrical',
    'CIL Mechanical',
    'CIL Civil',
    'CIL Finance',
    'CIL Personnel & HR',
    'CLAT (UG/PG)',
    'GRE',
    'TOEFL/IELTS/PTE',
    'TCS NQT',
    'Infosys InfyTQ',
    'Wipro Elite NTH',
    'NTSE',
];

const inferExam = (targetExams = '') => {
    const text = targetExams.toLowerCase();
    return EXAM_OPTIONS.find((exam) => text.includes(exam.toLowerCase())) || (text.includes('coal india') ? 'CIL' : 'Boards(Class 10th)');
};

const inferSubject = (profile = {}) => {
    const combined = `${profile.exam_branch || ''} ${profile.education || ''} ${profile.skills || ''} ${profile.goals || ''} ${profile.target_exams || ''}`.toLowerCase();
    if (combined.includes('system') || combined.includes('computer') || combined.includes('cse') || combined.includes('it')) return 'Computer Science';
    if (combined.includes('electrical')) return 'Electrical Engineering';
    if (combined.includes('mechanical')) return 'Mechanical Engineering';
    if (combined.includes('civil')) return 'Civil Engineering';
    if (combined.includes('mining')) return 'Mining Engineering';
    if (combined.includes('finance')) return 'Finance';
    if (combined.includes('hr') || combined.includes('personnel')) return 'Human Resources';
    return 'All';
};

const buildProfileContext = (profile = {}) => (
    [
        `Status: ${profile.status || 'not set'}`,
        `Education: ${profile.education || 'not set'}`,
        `Target exams and branch: ${profile.target_exams || 'not set'}`,
        `Skills: ${profile.skills || 'not set'}`,
        `Interests: ${profile.interests || 'not set'}`,
        `Career goals: ${profile.goals || 'not set'}`,
        `Target companies or institutions: ${profile.target_companies || 'not set'}`,
        `Resume education: ${Array.isArray(profile.education_json) ? profile.education_json.map((item) => [item.program, item.institution, item.score].filter(Boolean).join(' ')).join('; ') : 'not set'}`,
        `Resume projects: ${Array.isArray(profile.projects_json) ? profile.projects_json.map((item) => item.name || item.title).filter(Boolean).join(', ') : 'not set'}`,
        `Resume credentials: ${Array.isArray(profile.credentials_json) ? profile.credentials_json.map((item) => item.name || item.title).filter(Boolean).join(', ') : 'not set'}`,
        `Soft skills: ${profile.soft_skills || 'not set'}`,
    ].join('\n')
);

const hasLetters = (value = '') => /\p{L}/u.test(String(value));
const isControlCharacter = (char) => {
    const code = char.charCodeAt(0);
    return code === 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13);
};
const hasControlCharacters = (value = '') => Array.from(String(value)).some(isControlCharacter);
const hasUnsafeMarkup = (value = '') => /[<>]/.test(String(value));

const cleanInput = (value = '') => Array.from(String(value)).map((char) => (isControlCharacter(char) ? ' ' : char)).join('').replace(/\s+/g, ' ').trim();

const academicInputWarning = (value, label, { allowAll = false } = {}) => {
    const text = cleanInput(value);
    if (allowAll && text.toLowerCase() === 'all') return '';
    if (!text) return `${label} is required.`;
    if (hasControlCharacters(value)) return `Remove hidden characters from ${label.toLowerCase()}.`;
    if (hasUnsafeMarkup(text)) return `Remove < or > from ${label.toLowerCase()}.`;
    if (!hasLetters(text)) return `${label} should include a topic or subject name, not only numbers or symbols.`;
    return '';
};

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
    const [weakQueue, setWeakQueue] = useState([]);
    const [studentProfile, setStudentProfile] = useState(null);
    const practiceSubjectWarning = academicInputWarning(practiceSubject, 'Subject', { allowAll: true });
    const practiceTopicWarning = academicInputWarning(practiceTopic, 'Topic', { allowAll: true });
    const mockSubjectWarning = academicInputWarning(mockSubject, 'Subject', { allowAll: true });
    const mockTopicWarning = academicInputWarning(mockTopic, 'Topic', { allowAll: true });

    React.useEffect(() => {
        const loadProfileDefaults = async () => {
            if (!currentUser || currentUser?.is_guest) return;
            try {
                const response = await fetch(`${API_URL}/student-profile`, { credentials: 'include' });
                if (!response.ok) return;
                const profile = await response.json();
                if (!profile) return;
                setStudentProfile(profile);
                const exam = inferExam(profile.target_exams || profile.goals || profile.education || '');
                const subject = inferSubject(profile);
                setPracticeExam(exam);
                setMockExam(exam);
                setPracticeSubject(subject);
                setMockSubject(subject === 'All' ? 'English' : subject);
                setPracticeTopic((current) => (profile.goals && current === 'All' ? profile.goals : current));
                setMockTopic((current) => (profile.goals && current === 'All' ? profile.goals : current));
            } catch (err) {
                console.error('Profile defaults could not load:', err);
            }
        };
        loadProfileDefaults();
    }, [currentUser]);

    React.useEffect(() => {
        const loadWeakQueue = async () => {
            if (!currentUser) return;
            if (currentUser?.is_guest) {
                const workspace = getGuestWorkspace();
                setWeakQueue((workspace.questionAttempts || []).filter((item) => item?.is_correct === false));
                return;
            }
            try {
                const [attemptResponse, savedResponse] = await Promise.all([
                    fetch(`${API_URL}/question-attempts?wrong_only=true`, { credentials: 'include' }),
                    fetch(`${API_URL}/saved-questions`, { credentials: 'include' }),
                ]);
                const attempts = attemptResponse.ok ? await attemptResponse.json() : [];
                const savedQuestions = savedResponse.ok ? await savedResponse.json() : [];
                const mistakeQuestions = (Array.isArray(savedQuestions) ? savedQuestions : [])
                    .filter((item) => item?.source === 'mistake')
                    .map((item) => ({
                        ...item,
                        saved_question_id: item.id,
                        source: 'mistake',
                    }));
                const queueMap = new globalThis.Map();
                [...(Array.isArray(attempts) ? attempts : []), ...mistakeQuestions].forEach((item) => {
                    const key = String(item.question_text || item.question || '').trim().toLowerCase();
                    if (!key || queueMap.has(key)) return;
                    queueMap.set(key, item);
                });
                setWeakQueue(Array.from(queueMap.values()));
            } catch (err) {
                console.error('Failed to load weak queue:', err);
            }
        };
        loadWeakQueue();
    }, [currentUser]);

    const fetchQuestion = async (overrides = {}) => {
        if (!currentUser) {
            showAuth('login');
            return;
        }

        const safeOverrides = overrides && Object.getPrototypeOf(overrides) === Object.prototype ? overrides : {};
        const requestedSubject = safeOverrides.subject || practiceSubject;
        const requestedTopic = safeOverrides.topic || practiceTopic;
        const subjectWarning = academicInputWarning(requestedSubject, 'Subject', { allowAll: true });
        const topicWarning = academicInputWarning(requestedTopic, 'Topic', { allowAll: true });
        if (subjectWarning || topicWarning) {
            setQuestionError(subjectWarning || topicWarning);
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
                    exam: safeOverrides.exam || practiceExam,
                    subject: cleanInput(requestedSubject),
                    topic: cleanInput(requestedTopic),
                    difficulty: safeOverrides.difficulty || practiceDifficulty,
                    language: i18n.language,
                    profile_context: buildProfileContext(studentProfile || {}),
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

    const fetchAdaptiveQuestion = async () => {
        const weakItem = weakQueue[0];
        if (weakItem) {
            setPracticeExam(weakItem.exam || practiceExam);
            setPracticeSubject(weakItem.subject || practiceSubject);
            setPracticeTopic(weakItem.topic || practiceTopic);
            setPracticeDifficulty(weakItem.difficulty || practiceDifficulty);
        }
        await fetchQuestion({
            exam: weakItem?.exam || practiceExam,
            subject: weakItem?.subject || practiceSubject,
            topic: weakItem?.topic || practiceTopic,
            difficulty: weakItem?.difficulty || practiceDifficulty,
        });
    };

    const answerPracticeQuestion = async (option) => {
        if (!question || selectedPracticeAnswer) return;
        setSelectedPracticeAnswer(option);
        const isCorrect = option === question.answer;
        if (currentUser?.is_guest) {
            const attempt = {
                question_text: question.question,
                selected_answer: option,
                correct_answer: question.answer,
                is_correct: isCorrect,
                time_taken_seconds: questionStartedAt ? Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000)) : null,
                exam: practiceExam,
                subject: cleanInput(practiceSubject),
                topic: cleanInput(practiceTopic),
                difficulty: practiceDifficulty,
            };
            addGuestWorkspaceItem('questionAttempts', attempt);
            if (!isCorrect) {
                const saved = addGuestWorkspaceItem('savedQuestions', {
                    question_text: question.question,
                    options_json: question.options,
                    correct_answer: question.answer,
                    explanation: question.explanation,
                    exam: practiceExam,
                    subject: practiceSubject,
                    topic: practiceTopic,
                    difficulty: practiceDifficulty,
                    source: 'mistake',
                }, 'question_text');
                setWeakQueue((items) => [{ ...attempt, ...saved, created_at: new Date().toISOString() }, ...items]);
                setIsQuestionSaved(true);
            }
            return;
        }
        try {
            await fetch(`${API_URL}/question-attempts`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_text: question.question,
                    selected_answer: option,
                    correct_answer: question.answer,
                    is_correct: isCorrect,
                    time_taken_seconds: questionStartedAt ? Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000)) : null,
                    exam: practiceExam,
                    subject: cleanInput(practiceSubject),
                    topic: cleanInput(practiceTopic),
                    difficulty: practiceDifficulty,
                }),
            });
            if (!isCorrect) {
                const saveResponse = await fetch(`${API_URL}/saved-questions`, {
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
                        source: 'mistake',
                    }),
                });
                if (saveResponse.ok) setIsQuestionSaved(true);
                setWeakQueue((items) => [{
                    question_text: question.question,
                    correct_answer: question.answer,
                    selected_answer: option,
                    is_correct: false,
                    exam: practiceExam,
                    subject: practiceSubject,
                    topic: practiceTopic,
                    difficulty: practiceDifficulty,
                    created_at: new Date().toISOString(),
                }, ...items]);
            }
        } catch (err) {
            console.error('Failed to save attempt:', err);
        }
    };

    const savePracticeQuestion = async () => {
        if (!question) return;
        if (currentUser?.is_guest) {
            addGuestWorkspaceItem('savedQuestions', {
                question_text: question.question,
                options_json: question.options,
                correct_answer: question.answer,
                explanation: question.explanation,
                exam: practiceExam,
                subject: practiceSubject,
                topic: practiceTopic,
                difficulty: practiceDifficulty,
                source: 'practice',
            }, 'question_text');
            setIsQuestionSaved(true);
            return;
        }
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
        if (mockSubjectWarning || mockTopicWarning) {
            setQuestionError(mockSubjectWarning || mockTopicWarning);
            return;
        }

        setTestState('loading');
        setQuestionError('');
        try {
            const response = await fetch(`${API_URL}/generate-mock-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam: mockExam,
                    subject: cleanInput(mockSubject),
                    topic: cleanInput(mockTopic),
                    difficulty: mockDifficulty,
                    num_questions: numQuestions,
                    language: i18n.language,
                    profile_context: buildProfileContext(studentProfile || {}),
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
                    save: !currentUser?.is_guest,
                    exam: mockExam,
                    subject: mockSubject,
                    topic: mockTopic,
                    difficulty: mockDifficulty,
                }),
                credentials: currentUser?.is_guest ? 'same-origin' : 'include',
            });
            if (!response.ok) throw new Error('Failed to analyze test');
            const data = await response.json();
            setTestResult(data);
            if (currentUser?.is_guest) {
                addGuestWorkspaceItem('mockTests', {
                    exam: mockExam,
                    subject: mockSubject,
                    topic: mockTopic,
                    difficulty: mockDifficulty,
                    total_questions: testQuestions.length,
                    correct_answers: data?.score_summary?.correct ?? data?.correct_answers,
                    incorrect_answers: data?.score_summary?.incorrect ?? data?.incorrect_answers,
                    score: data?.score ?? data?.score_percentage,
                    questions_json: testQuestions,
                    answers_json: testAnswers,
                    analysis_json: data,
                });
            }
            setTestState('completed');
        } catch (err) {
            console.error(err);
            setTestState('in-progress');
        }
    }, [testQuestions, testAnswers, i18n.language, mockExam, mockSubject, mockTopic, mockDifficulty, currentUser?.is_guest]);

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
            <title>{t('aiTutor_seo_title')}</title>
            <meta 
                name="description" 
                content={t('aiTutor_seo_desc')}
            />
            
            <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="saas-card p-4">
                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">{t('aiTutor_eyebrow')}</p>
                    <h1 className="pp-page-title">{t('aiTutor_title')}</h1>
                    <p className="pp-page-copy mt-1 max-w-3xl">{t('aiTutor_subtitle')}</p>
                    {currentUser?.is_guest && (
                        <button onClick={() => showAuth('signup')} className="mt-3 rounded-md bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900 transition-[background-color,transform] duration-150 hover:bg-amber-200 active:scale-[0.96] dark:bg-amber-950/40 dark:text-amber-200">
                            Sign up to save attempts and mock history
                        </button>
                    )}
                </div>
                <div className="saas-card grid grid-cols-2 gap-2 p-3">
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="saas-meta">{t('aiTutor_panel_mode')}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{tutorView === 'practice' ? t('aiTutor_tab_practice') : t('aiTutor_tab_mockTests')}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="saas-meta">{t('aiTutor_panel_weakQueue')}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{weakQueue.length}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="saas-card h-fit p-4 xl:sticky xl:top-20">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <SlidersHorizontal className="h-4 w-4" />
                        </div>
                        <h2 className="saas-section-title">{t('aiTutor_sessionSetup')}</h2>
                    </div>
                    <div className="mb-4 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                        <button onClick={() => setTutorView('practice')} className={`min-h-10 rounded-md px-3 py-2 text-sm font-semibold transition-[color,background-color,transform] duration-150 active:scale-[0.96] ${tutorView === 'practice' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>{t('aiTutor_tab_practice')}</button>
                        <button onClick={() => setTutorView('test')} className={`min-h-10 rounded-md px-3 py-2 text-sm font-semibold transition-[color,background-color,transform] duration-150 active:scale-[0.96] ${tutorView === 'test' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>{t('aiTutor_tab_mockTests')}</button>
                    </div>
                    {questionError && <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{questionError}</p>}

                    {tutorView === 'practice' ? (
                        <div className="grid gap-3">
                            <div>
                                <label className="pp-label">{t('aiTutor_form_exam')}</label>
                                <select value={practiceExam} onChange={e => setPracticeExam(e.target.value)} className="pp-input">
                                    {EXAM_OPTIONS.map((exam) => <option key={exam}>{exam}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_subject')}</label>
                                {practiceSubjectWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{practiceSubjectWarning}</p>}
                                <input type="text" value={practiceSubject} onChange={e => { setPracticeSubject(e.target.value); setQuestionError(''); }} className="pp-input" maxLength={120} placeholder={t('aiTutor_form_subject_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_topic')}</label>
                                {practiceTopicWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{practiceTopicWarning}</p>}
                                <input type="text" value={practiceTopic} onChange={e => { setPracticeTopic(e.target.value); setQuestionError(''); }} className="pp-input" maxLength={160} placeholder={t('aiTutor_form_topic_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_difficulty')}</label>
                                <select value={practiceDifficulty} onChange={e => setPracticeDifficulty(e.target.value)} className="pp-input">
                                    <option>{t('aiTutor_difficulty_easy')}</option>
                                    <option>{t('aiTutor_difficulty_medium')}</option>
                                    <option>{t('aiTutor_difficulty_hard')}</option>
                                </select>
                            </div>
                            <button onClick={() => fetchQuestion()} disabled={isLoadingQuestion} className="pp-button w-full">
                                {isLoadingQuestion ? t('aiTutor_button_generating') : t('aiTutor_button_generateQuestion')}
                            </button>
                            <button onClick={fetchAdaptiveQuestion} disabled={isLoadingQuestion || weakQueue.length === 0} className="pp-button-secondary flex w-full items-center justify-center gap-2">
                                <Target className="h-4 w-4" />
                                {t('aiTutor_button_adaptiveQuestion')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            <div>
                                <label className="pp-label">{t('aiTutor_form_exam')}</label>
                                <select value={mockExam} onChange={e => setMockExam(e.target.value)} className="pp-input">
                                    {EXAM_OPTIONS.map((exam) => <option key={exam}>{exam}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_subject')}</label>
                                {mockSubjectWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{mockSubjectWarning}</p>}
                                <input type="text" value={mockSubject} onChange={e => { setMockSubject(e.target.value); setQuestionError(''); }} className="pp-input" maxLength={120} placeholder={t('aiTutor_form_subject_placeholder')} />
                            </div>
                            <div>
                                <label className="pp-label">{t('aiTutor_form_topic')}</label>
                                {mockTopicWarning && <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-300">{mockTopicWarning}</p>}
                                <input type="text" value={mockTopic} onChange={e => { setMockTopic(e.target.value); setQuestionError(''); }} className="pp-input" maxLength={160} placeholder={t('aiTutor_form_topic_placeholder')} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="pp-label">{t('aiTutor_form_difficulty')}</label>
                                    <select value={mockDifficulty} onChange={e => setMockDifficulty(e.target.value)} className="pp-input">
                                        <option>{t('aiTutor_difficulty_all')}</option>
                                        <option>{t('aiTutor_difficulty_easy')}</option>
                                        <option>{t('aiTutor_difficulty_medium')}</option>
                                        <option>{t('aiTutor_difficulty_hard')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="pp-label">{t('aiTutor_mockTest_numQuestions')}</label>
                                    <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="pp-input">
                                        <option value={5}>{t('aiTutor_mockTest_numQuestions_5')}</option>
                                        <option value={10}>{t('aiTutor_mockTest_numQuestions_10')}</option>
                                        <option value={15}>{t('aiTutor_mockTest_numQuestions_15')}</option>
                                        <option value={20}>{t('aiTutor_mockTest_numQuestions_20')}</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={startTest} disabled={testState === 'loading'} className="pp-button w-full">
                                {testState === 'loading' ? t('aiTutor_button_generatingTest') : t('aiTutor_button_startTest')}
                            </button>
                        </div>
                    )}
                </aside>

                <main className="saas-card min-h-[480px] p-4">
                    {tutorView === 'practice' && (
                        <div>
                        <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <h2 className="saas-section-title">{t('aiTutor_practice_title')}</h2>
                                </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{[practiceExam, practiceSubject, practiceTopic, practiceDifficulty].filter(Boolean).join(' / ')}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">{question ? t('aiTutor_status_questionReady') : t('aiTutor_status_awaitingGeneration')}</span>
                        </div>
                        {question && (
                            <div className="pp-subpanel mt-4 p-4">
                                <p className="mb-3 text-sm font-semibold leading-6 text-slate-950 text-pretty dark:text-white"><Latex>{formatMathText(question.question)}</Latex></p>
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
                                                <Latex>{formatMathText(opt)}</Latex>
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedPracticeAnswer && (
                                    <div className={`mt-3 rounded-md border p-3 text-sm ${selectedPracticeAnswer === question.answer ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'}`}>
                                        {selectedPracticeAnswer === question.answer ? t('aiTutor_answer_correct') : t('aiTutor_answer_incorrect')} {t('aiTutor_answer_correctAnswer')}: <span className="font-semibold"><Latex>{formatMathText(question.answer)}</Latex></span>
                                    </div>
                                )}
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <button onClick={savePracticeQuestion} className="ios-pill text-sm">
                                        {isQuestionSaved ? t('aiTutor_savedQuestion') : t('aiTutor_saveQuestion')}
                                    </button>
                                    <button onClick={() => handleSolveItClick(question.question)} className="ios-pill text-sm">{t('aiTutor_solveItLink')}</button>
                                </div>
                            </div>
                        )}
                        {!question && !questionError && (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
                                <BookOpenCheck className="h-8 w-8 text-slate-400" />
                                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{t('aiTutor_empty_title')}</p>
                                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{t('aiTutor_empty_text')}</p>
                            </div>
                        )}
                        </div>
                    )}

                    {tutorView === 'test' && (
                        <div>
                            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <h2 className="saas-section-title">{t('aiTutor_mockTest_title')}</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{[mockExam, mockSubject, mockTopic, mockDifficulty, t('aiTutor_mock_questionCount', { count: numQuestions })].filter(Boolean).join(' / ')}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">{t('aiTutor_status_mockSetup')}</span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="saas-meta">{t('aiTutor_form_exam')}</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{mockExam}</p>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="saas-meta">{t('aiTutor_form_topic')}</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{mockTopic}</p>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="saas-meta">{t('aiTutor_mock_length')}</p>
                                    <p className="mt-2 text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{t('aiTutor_mock_questionCount', { count: numQuestions })}</p>
                                </div>
                            </div>
                            <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                {t('aiTutor_mock_empty_text')}
                            </div>
                        </div>
                    )}
                </main>
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
