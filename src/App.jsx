import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import SpeechToText from "./components/SpeechToText";
import TextProcessing from "./components/TextProcessing";
import TextToSpeech from "./components/TextToSpeech";
import { FaMicrophone, FaRobot, FaBrain, FaServer } from 'react-icons/fa';
import "./App.css";

const AppContent = () => {
  const { translations } = useLanguage();
  const [stats] = useState({});

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <FaRobot size={32} />
            <h1>NexusVoice AI</h1>
          </div>
          <div className="header-controls">
            <nav className="main-nav">
              <Link to="/" className="nav-link">{translations.home}</Link>
              <Link to="/speech-to-text" className="nav-link">{translations.speechToText}</Link>
              <Link to="/text-processing" className="nav-link">{translations.textProcessing}</Link>
              <Link to="/text-to-speech" className="nav-link">{translations.textToSpeech}</Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speech-to-text" element={<SpeechToText />} />
          <Route path="/text-processing" element={<TextProcessing />} />
          <Route path="/text-to-speech" element={<TextToSpeech />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{translations.supportedLanguages}</h3>
            <ul>
              <li>English 🇺🇸</li>
              <li>Spanish 🇪🇸</li>
              <li>French 🇫🇷</li>
              <li>German 🇩🇪</li>
              <li>Italian 🇮🇹</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>{translations.contact}</h3>
            <p>{translations.enterpriseSolutions}</p>
            <a href="mailto:contact@nexusvoice.ai">contact@nexusvoice.ai</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 NexusVoice AI. {translations.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

const Home = () => {
  const { translations } = useLanguage();

  return (
    <div className="home-container">
      <section className="hero-section">
        <h2>{translations.transformTitle}</h2>
        <p className="hero-subtitle">{translations.transformSubtitle}</p>
        <div className="feature-grid">
          <div className="feature-card">
            <FaMicrophone className="feature-icon" />
            <h3>{translations.realTimeRecognition}</h3>
            <p>{translations.realTimeDesc}</p>
          </div>
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>{translations.naturalVoice}</h3>
            <p>{translations.naturalVoiceDesc}</p>
          </div>
          <div className="feature-card">
            <FaBrain className="feature-icon" />
            <h3>{translations.advancedProcessing}</h3>
            <p>{translations.advancedProcessingDesc}</p>
          </div>
          <div className="feature-card">
            <FaServer className="feature-icon" />
            <h3>{translations.enterpriseReady}</h3>
            <p>{translations.enterpriseDesc}</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h3>{translations.readyToTransform}</h3>
        <p>{translations.experiencePower}</p>
        <div className="cta-buttons">
          <Link to="/speech-to-text" className="cta-button primary">
            {translations.trySpeechToText}
          </Link>
          <Link to="/text-to-speech" className="cta-button secondary">
            {translations.tryTextToSpeech}
          </Link>
        </div>
      </section>
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;