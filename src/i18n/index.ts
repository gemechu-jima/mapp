
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import am from './locales/am/translation.json';
import en from './locales/en/translation.json';
import or from './locales/or/translation.json';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
      am: { translation: am },
      or: { translation: or },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
