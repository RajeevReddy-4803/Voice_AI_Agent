import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaGlobe } from 'react-icons/fa';

const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷'
};

const languageNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français'
};

const LanguageSwitcher = () => {
  const { currentLanguage, setCurrentLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <FaGlobe className="globe-icon" />
        <span className="current-language">
          {languageFlags[currentLanguage]} {languageNames[currentLanguage]}
        </span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              className={`language-option ${lang === currentLanguage ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              <span className="language-flag">{languageFlags[lang]}</span>
              <span className="language-name">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 