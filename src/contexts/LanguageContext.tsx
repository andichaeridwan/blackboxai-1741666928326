import React, { createContext, useContext, useState, useCallback } from 'react';
import i18n from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: () => {},
  availableLanguages: [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesia' },
  ],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesia' },
  ];

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
