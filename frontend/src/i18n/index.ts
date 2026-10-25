import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import ml from '../locales/ml.json';
import kn from '../locales/kn.json';
import bn from '../locales/bn.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import pa from '../locales/pa.json';
import or from '../locales/or.json';
import as from '../locales/as.json';
import ur from '../locales/ur.json';
import sa from '../locales/sa.json';
import ne from '../locales/ne.json';
import kok from '../locales/kok.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  ml: { translation: ml },
  kn: { translation: kn },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
  sa: { translation: sa },
  ne: { translation: ne },
  kok: { translation: kok },
};

// Check non-sensitive stored language preference, fallback to 'en'
const savedLanguage = localStorage.getItem('ai_legal_guardian_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Handle RTL text direction dynamically for Urdu
export const updateDocumentDirection = (lang: string) => {
  if (lang === 'ur') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ur');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }
};

updateDocumentDirection(savedLanguage);

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('ai_legal_guardian_lang', lng);
  } catch {
    // Ignore storage errors
  }
  updateDocumentDirection(lng);
});

export default i18n;
