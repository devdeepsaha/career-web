import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleMarkdownRenderer from '../shared/SimpleMarkdownRenderer';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { XIcon } from '../icons/XIcon';
import { Maximize, Minimize, Copy, Plus, Trash2, Clock, Menu } from 'lucide-react';
import { throttle } from '../../utils/timing';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const CareerPlannerChatbot = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'ai', text: t('chatbot_initialMessage') }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showSessionList, setShowSessionList] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Check login status
    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        if (localStorage.getItem('guest_mode') === 'true') {
            setIsLoggedIn(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/check_session`, {
                credentials: 'include'
            });
            const data = await response.json();
            setIsLoggedIn(data.is_logged_in);
            
            if (data.is_logged_in) {
                loadSessions();
            }
        } catch (error) {
            console.error("Login check error:", error);
        }
    };

    // Load chat sessions
    const loadSessions = async () => {
        try {
            const response = await fetch(`${API_URL}/chat-sessions?chat_type=career_planner`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Load sessions error:", error);
        }
    };

    // Create new session
    const createNewSession = async () => {
        if (!isLoggedIn) {
            setMessages([{ sender: 'ai', text: t('chatbot_initialMessage') }]);
            setCurrentSessionId(null);
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/chat-sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ chat_type: 'career_planner' })
            });
            
            if (response.ok) {
                const session = await response.json();
                setCurrentSessionId(session.id);
                setMessages([{ sender: 'ai', text: t('chatbot_initialMessage') }]);
                await loadSessions();
                setShowSessionList(false);
                return session.id;
            }
        } catch (error) {
            console.error("Create session error:", error);
            return null;
        }
    };

    // Load a specific session
    const loadSession = async (sessionId) => {
        try {
            const response = await fetch(`${API_URL}/chat-sessions/${sessionId}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const session = await response.json();
                setCurrentSessionId(sessionId);
                setMessages(session.messages.map(m => ({ sender: m.sender, text: m.text })));
                setShowSessionList(false);
            }
        } catch (error) {
            console.error("Load session error:", error);
        }
    };

    // Delete a session
    const deleteSession = async (sessionId, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this chat?')) return;

        try {
            const response = await fetch(`${API_URL}/chat-sessions/${sessionId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                // Remove from local sessions list immediately
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                
                // If deleted session is current, create new one
                if (currentSessionId === sessionId) {
                    setCurrentSessionId(null);
                    setMessages([{ sender: 'ai', text: t('chatbot_initialMessage') }]);
                }
            }
        } catch (error) {
            console.error("Delete session error:", error);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFullscreen && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsFullscreen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFullscreen]);

    // Handle mobile viewport changes when keyboard appears
    useEffect(() => {
        if (!isOpen) return;

        const handleResize = throttle(() => {
            // Scroll input into view when keyboard appears on mobile
            if (inputRef.current && window.innerWidth < 768) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        }, 150);

        // Handle focus event to ensure input is visible
        const handleFocus = () => {
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        };

        const inputElement = inputRef.current?.querySelector('input');
        if (inputElement) {
            inputElement.addEventListener('focus', handleFocus);
        }

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (inputElement) {
                inputElement.removeEventListener('focus', handleFocus);
            }
        };
    }, [isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const inputElement = e.target.querySelector('input');
        await sendMessage(input);
        setInput('');
        
        // Keep keyboard open on mobile by refocusing
        if (inputElement && window.innerWidth < 768) {
            setTimeout(() => {
                inputElement.focus();
            }, 100);
        }
    };

    const sendMessage = async (query) => {
        // Auto-create session if logged in but no session exists
        let sessionId = currentSessionId;
        if (isLoggedIn && !sessionId) {
            const newSessionId = await createNewSession();
            sessionId = newSessionId;
        }

        const userMessage = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    history: [...messages, userMessage], 
                    language: i18n.language,
                    session_id: sessionId
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
            
            // AI response is saved by backend, just refresh sessions
            if (isLoggedIn) loadSessions();
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: t('chatbot_errorMessage') }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.openCareerChatbot = (query) => {
            setIsOpen(true);
            if (query) setTimeout(() => sendMessage(query), 300);
        };
    }, [messages, isLoggedIn, currentSessionId]);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    return (
        <>
            {!isFullscreen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-md bg-slate-950 text-white shadow-lg transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 md:bottom-6 md:right-6"
                    aria-label={t('chatbot_toggleAriaLabel')}
                >
                    {isOpen ? <XIcon /> : <MessageSquareIcon />}
                </button>
            )}

            {isOpen && (
                <div
                    ref={chatContainerRef}
                    className={`fixed z-50 flex rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 transition-[width,height,top,bottom,left,right] duration-200 ease-out
                    ${isFullscreen
                        ? 'left-2 right-2 top-16 bottom-20 md:left-auto md:right-6 md:top-20 md:bottom-6 md:h-[calc(100dvh-6.5rem)] md:w-[min(980px,90vw)]'
                        : 'bottom-20 right-3 h-[min(560px,calc(100dvh-8rem))] w-[calc(100vw-1.5rem)] md:bottom-24 md:right-6 md:w-96'
                    }`}
                >
                    {/* Session Sidebar - Side panel in desktop fullscreen, overlay otherwise */}
                    {isLoggedIn && showSessionList && (
                        <>
                            {/* Desktop Fullscreen: Side Panel */}
                            {isFullscreen && (
                                <div className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50 dark:bg-slate-900 rounded-l-2xl overflow-hidden">
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                                        <button
                                            onClick={createNewSession}
                                            className="w-full flex items-center justify-center gap-2 pp-button px-3 py-2 text-sm"
                                        >
                                            <Plus size={16} /> New Chat
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        {sessions.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4 px-2">No history</p>
                                        ) : (
                                            sessions.map(session => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => loadSession(session.id)}
                                                    className={`p-2 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-[background-color] duration-150 group ${currentSessionId === session.id ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate text-gray-800 dark:text-white">
                                                                {session.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <Clock size={10} />
                                                                {new Date(session.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => deleteSession(session.id, e)}
                                                            className="opacity-0 group-hover:opacity-100 text-red-500 transition-[color] duration-150 hover:text-red-700"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mobile OR Desktop Non-Fullscreen: Overlay */}
                            {!isFullscreen && (
                                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-20 rounded-lg flex flex-col overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white flex-shrink-0">
                                        <h3 className="font-semibold">Chat History</h3>
                                        <button
                                            onClick={() => setShowSessionList(false)}
                                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900"
                                        >
                                            <XIcon />
                                        </button>
                                    </div>
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                                        <button
                                            onClick={createNewSession}
                                            className="w-full flex items-center justify-center gap-2 pp-button px-3 py-2 text-sm"
                                        >
                                            <Plus size={16} /> New Chat
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                                        {sessions.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">No chat history yet</p>
                                        ) : (
                                            sessions.map(session => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => loadSession(session.id)}
                                                    className={`p-3 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-[background-color] duration-150 group ${currentSessionId === session.id ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800'} shadow-sm`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate text-gray-800 dark:text-white">
                                                                {session.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <Clock size={12} />
                                                                {new Date(session.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => deleteSession(session.id, e)}
                                                            className="text-red-500 transition-[color] duration-150 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mobile Fullscreen: Also Overlay */}
                            {isFullscreen && (
                                <div className="md:hidden absolute inset-0 bg-slate-50 dark:bg-slate-900 z-20 rounded-lg flex flex-col overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white flex-shrink-0">
                                        <h3 className="font-semibold">Chat History</h3>
                                        <button
                                            onClick={() => setShowSessionList(false)}
                                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900"
                                        >
                                            <XIcon />
                                        </button>
                                    </div>
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                                        <button
                                            onClick={createNewSession}
                                            className="w-full flex items-center justify-center gap-2 pp-button px-3 py-2 text-sm"
                                        >
                                            <Plus size={16} /> New Chat
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                                        {sessions.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">No chat history yet</p>
                                        ) : (
                                            sessions.map(session => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => loadSession(session.id)}
                                                    className={`p-3 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-[background-color] duration-150 group ${currentSessionId === session.id ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800'} shadow-sm`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate text-gray-800 dark:text-white">
                                                                {session.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <Clock size={12} />
                                                                {new Date(session.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => deleteSession(session.id, e)}
                                                            className="text-red-500 transition-[color] duration-150 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white flex-shrink-0">
                            <div className="flex items-center gap-2">
                                {isLoggedIn && (
                                    <button
                                        onClick={() => setShowSessionList(!showSessionList)}
                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                                        title="Chat History"
                                    >
                                        <Menu size={20} />
                                    </button>
                                )}
                                <h3 className="font-bold text-base">{t('chatbot_header')}</h3>
                            </div>
                            <div className="flex gap-2">
                                {isLoggedIn && (
                                    <button
                                        onClick={createNewSession}
                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition hidden md:block"
                                        title="New Chat"
                                    >
                                        <Plus size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                                    aria-label={isFullscreen ? 'Exit fullscreen chat' : 'Open fullscreen chat'}
                                >
                                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsFullscreen(false);
                                    }}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                                    aria-label="Close AI chat"
                                >
                                    <XIcon className="h-[18px] w-[18px]" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-3 overflow-y-auto min-h-0 chat-scrollbarr bg-slate-50 dark:bg-slate-900">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative py-2 px-3 pr-8 rounded-lg break-words max-w-[85%]
                                        ${msg.sender === 'user'
                                            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                            : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                                        }`}
                                    >
                                        <div className="text-sm">
                                            {msg.sender === 'ai' ? <SimpleMarkdownRenderer text={msg.text} /> : msg.text}
                                        </div>
                                        <button
                                            onClick={() => handleCopy(msg.text, index)}
                                            className="absolute top-1 right-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-1 rounded transition"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        {copiedIndex === index && (
                                            <span className="absolute -top-6 right-1 text-xs bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded whitespace-nowrap">
                                                Copied!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 text-sm">
                                        {t('chatbot_typing')}
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-2 border-t border-slate-200 dark:border-slate-800 flex-shrink-0" ref={inputRef}>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1 p-2 text-sm bg-white dark:bg-slate-700 border pp-input"
                                    placeholder={t('chatbot_placeholder')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    className="pp-button flex-shrink-0 px-3 py-2 text-sm"
                                    disabled={isLoading}
                                >
                                    {t('chatbot_sendButton')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CareerPlannerChatbot;
