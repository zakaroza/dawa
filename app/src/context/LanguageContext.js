import React, { createContext, useContext, useState } from 'react';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const toggle = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
