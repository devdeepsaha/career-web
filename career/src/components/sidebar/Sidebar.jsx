import React from 'react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, onClose, onNavigate }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    onClose(); // Close the sidebar after selection
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('sidebar_menu')}</h2>
            <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* --- NEW: Main Navigation Links --- */}
          <nav className="flex-grow">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase px-2 mb-2">Navigation</h3>
            <ul className="space-y-1">
              <li>
                <button onClick={() => onNavigate('team')} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white flex items-center">
                  <span className="mr-3">👥</span> {t('sidebar_team')}
                </button>
              </li>
            </ul>
          </nav>

          {/* Language Switcher Section */}
          <div className="mt-auto">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase px-2 mb-2">{t('sidebar_language')}</h3>
            <div className="flex flex-col space-y-1">
              <button onClick={() => changeLanguage('en')} className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white">English</button>
              <button onClick={() => changeLanguage('hi')} className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white">हिन्दी (Hindi)</button>
              <button onClick={() => changeLanguage('bn')} className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white">বাংলা (Bengali)</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;