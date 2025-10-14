import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleMarkdownRenderer from '../shared/SimpleMarkdownRenderer';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { XIcon } from '../icons/XIcon';
import { Maximize, Minimize, Copy } from 'lucide-react';

const DoubtSolverChatbot = ({ isOpen, setIsOpen, messages, isLoading, handleSend }) => {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null); // track copied message
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close chat when clicking outside in fullscreen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFullscreen && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsFullscreen(false); // restore button when closing fullscreen
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFullscreen, setIsOpen]);

    // Form submit
    const onFormSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleSend(input);
        setInput('');
    };

    // Copy message text
    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    return (
        <>
            {/* Floating Button */}
            {!isFullscreen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-20 md:bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 z-30"
                    aria-label={t('doubtChat_toggleAriaLabel')}
                >
                    {isOpen ? <XIcon /> : <MessageSquareIcon />}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    ref={chatContainerRef}
                    className={`fixed bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 z-20 transition-all duration-300 ease-in-out origin-bottom-right
                    ${isFullscreen
                        ? 'w-[90vw] h-[90vh] bottom-6 right-6'
                        : 'w-80 h-96 bottom-36 md:bottom-24 right-6'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-t-2xl">
                        <h3 className="font-bold text-lg">{t('doubtChat_header')}</h3>

                        {/* Fullscreen Toggle Icon */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1 rounded-md hover:bg-green-700 transition"
                            aria-label="Toggle fullscreen"
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        className={`flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900 min-h-0 chat-scrollbar`}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`relative py-2 px-4 pr-8 rounded-2xl break-words
                                    ${msg.sender === 'user'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'
                                    } ${isFullscreen ? 'max-w-[70vw]' : 'max-w-xs sm:max-w-md'}`}
                                >
                                    {msg.sender === 'ai' ? <SimpleMarkdownRenderer text={msg.text} /> : msg.text}

                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopy(msg.text, index)}
                                        className="absolute top-1 right-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-1 rounded transition"
                                        aria-label="Copy message"
                                    >
                                        <Copy size={16} />
                                    </button>

                                    {/* Copied Tooltip */}
                                    {copiedIndex === index && (
                                        <span className="absolute top-0 right-6 text-xs bg-black text-white dark:bg-white dark:text-black px-1 rounded">
                                            Copied!
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div
                                    className={`py-2 px-4 rounded-2xl bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white ${isFullscreen ? 'max-w-[70vw]' : 'max-w-xs sm:max-w-md'}`}
                                >
                                    {t('doubtChat_thinking')}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Section */}
                    <form onSubmit={onFormSubmit} className="p-2 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800 dark:text-white"
                                placeholder={t('doubtChat_placeholder')}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex-shrink-0"
                                disabled={isLoading}
                            >
                                {t('doubtChat_sendButton')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default DoubtSolverChatbot;
