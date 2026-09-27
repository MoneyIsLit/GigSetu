import React, { createContext, useContext, useState } from 'react';
import { getTranslation, supportedLanguages } from '../i18n/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('gigsetu_language') || 'en');

  const setLanguage = (lang) => {
    localStorage.setItem('gigsetu_language', lang);
    setLanguageState(lang);
  };

  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
