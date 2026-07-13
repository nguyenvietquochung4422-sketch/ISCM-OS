import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from './translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en'); // 'vi' | 'en'

  const t = useCallback(
    (key) => {
      const dict = translations[lang] ?? translations['vi'];
      return dict[key] ?? translations['en'][key] ?? key;
    },
    [lang]
  );

  const toggle = () => setLang((prev) => (prev === 'vi' ? 'en' : 'vi'));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
