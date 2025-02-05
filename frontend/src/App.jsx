import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SpeechToText from "./components/SpeechToText";
import TextProcessing from "./components/TextProcessing";
import TextToSpeech from "./components/TextToSpeech";
import "./App.css";

const App = () => {
  return (
    
      <div className="app-container">
        <header className="header">
          <h1>AI Voice Assistant</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/speech-to-text">Speech to Text</Link>
            <Link to="/text-processing">Text Processing</Link>
            <Link to="/text-to-speech">Text to Speech</Link>
          </nav>
        </header>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/speech-to-text" element={<SpeechToText />} />
            <Route path="/text-processing" element={<TextProcessing />} />
            <Route path="/text-to-speech" element={<TextToSpeech />} />
          </Routes>
        </div>

        <footer className="footer">
          <p>&copy; 2023 AI Voice Assistant. All rights reserved.</p>
        </footer>
      </div>
    
  );
};

const Home = () => (
  <div className="container">
    <h2>The Future of Voice Interaction is Here</h2>
    <p>Transforming how you create, communicate, and interact.</p>
    <p>Seamless speech-to-text, advanced text processing, and natural-sounding text-to-speech.</p>
  </div>
);

export default App;