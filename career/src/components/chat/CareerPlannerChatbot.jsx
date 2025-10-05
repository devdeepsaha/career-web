import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleMarkdownRenderer from '../shared/SimpleMarkdownRenderer';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { XIcon } from '../icons/XIcon';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const CareerPlannerChatbot = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'ai', text: t('chatbot_initialMessage') }]);
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
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: [...messages, userMessage], language: i18n.language })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: t('chatbot_errorMessage') }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                // --- FIX: Button is now higher on mobile screens ---
                className="fixed bottom-20 md:bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
                aria-label={t('chatbot_toggleAriaLabel')}
            >
                {isOpen ? <XIcon /> : <MessageSquareIcon />}
            </button>

            {isOpen && (
                // --- FIX: Window position is also adjusted to match the button ---
                <div className="fixed bottom-36 md:bottom-24 right-6 w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 z-40">
                    <div className="p-4 bg-indigo-600 text-white rounded-t-2xl">
                        <h3 className="font-bold text-lg">{t('chatbot_header')}</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900 min-h-0">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`py-2 px-4 rounded-2xl max-w-xs break-words ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'}`}>
                                    {msg.sender === 'ai' ? <SimpleMarkdownRenderer text={msg.text} /> : msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="py-2 px-4 rounded-2xl bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white">{t('chatbot_typing')}</div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-2 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 dark:text-white"
                                placeholder={t('chatbot_placeholder')}
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex-shrink-0" 
                                disabled={isLoading}
                            >
                                {t('chatbot_sendButton')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default CareerPlannerChatbot;