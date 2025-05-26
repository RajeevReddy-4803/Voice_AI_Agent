import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { FaMicrophone, FaRobot, FaChartBar } from 'react-icons/fa';

const Header = () => {
  const { translations } = useLanguage();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <FaRobot size={32} />
          <h1>Voice AI Assistant</h1>
        </div>

        <div className="header-controls">
          <nav className="main-nav">
            <Link to="/" className="nav-link">
              <FaMicrophone /> {translations.home}
            </Link>
            <Link to="/speech-to-text" className="nav-link">
              <FaMicrophone /> {translations.speechToText}
            </Link>
            <Link to="/text-to-speech" className="nav-link">
              <FaRobot /> {translations.textToSpeech}
            </Link>
            <Link to="/text-processing" className="nav-link">
              <FaChartBar /> {translations.textProcessing}
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header; 