import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- Translation Files ---
import translationEN from './locales/en/translation.json';

const resources = {
  en: {
    translation: translationEN
  }
};

const languageLoaders = {
  hi: () => import('./locales/hi/translation.json'),
  bn: () => import('./locales/bn/translation.json'),
};

export const loadLanguage = async (lng) => {
  const lang = String(lng || 'en').slice(0, 2).toLowerCase();
  if (lang === 'en' || i18n.hasResourceBundle(lang, 'translation')) return lang;
  const loader = languageLoaders[lang];
  if (!loader) return 'en';
  const module = await loader();
  i18n.addResourceBundle(lang, 'translation', module.default || module, true, true);
  return lang;
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en", // use english if detected lng is not available

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

const changeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng, ...args) => {
  const lang = await loadLanguage(lng);
  return changeLanguage(lang, ...args);
};

  export default i18n;
