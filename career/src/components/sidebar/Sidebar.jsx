import React from 'react';
import { useTranslation } from 'react-i18next'; // <-- Step 1: Import the hook

const Sidebar = ({ isOpen, onClose, onNavigate }) => {
  const { t, i18n } = useTranslation(); // <-- Step 2: Initialize the hook

  // --- Step 3: Create a function to handle language changes ---
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
        <div className="p-4">
          <div className="flex justify-between items-center mb-8">
            {/* --- Step 4: Use the t() function for translations --- */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('sidebar_menu')}</h2>
            <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <button 
              onClick={() => onNavigate('team')} 
              className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-lg font-semibold text-gray-800 dark:text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h-5v-2a3 3 0 00-3-3H7a3 3 0 00-3 3v2H2a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v14a1 1 0 01-1 1zm-4-10a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {t('sidebar_team')}
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('sidebar_language')}</h3>
            <div className="flex flex-col space-y-2">
              {/* --- Step 5: Make the language buttons functional --- */}
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