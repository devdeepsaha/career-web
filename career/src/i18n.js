import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- Translation Files ---
import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationBN from './locales/bn/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  },
  bn: {
    translation: translationBN
  }
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

  export default i18n;