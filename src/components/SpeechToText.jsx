import React, { useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaMicrophone, FaStop, FaDownload, FaTrash } from 'react-icons/fa';
import VirtualizedList from './VirtualizedList';

const SpeechToText = () => {
  const { translations } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    // Initialize speech recognition here
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (currentText) {
      setTranscriptions(prev => [...prev, {
        id: Date.now(),
        text: currentText,
        language: selectedLanguage,
        timestamp: new Date().toISOString()
      }]);
      setCurrentText('');
    }
  }, [currentText, selectedLanguage]);

  const handleDownload = useCallback((transcription) => {
    const blob = new Blob([transcription.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${transcription.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDelete = useCallback((id) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
  }, []);

  const renderTranscription = useCallback((transcription) => (
    <div className="transcription-item">
      <div className="transcription-content">
        <div className="transcription-header">
          <span className="language-badge">{transcription.language}</span>
          <span className="timestamp">{new Date(transcription.timestamp).toLocaleString()}</span>
        </div>
        <p className="transcription-text">{transcription.text}</p>
      </div>
      <div className="transcription-actions">
        <button
          className="action-button download"
          onClick={() => handleDownload(transcription)}
          title="Download"
        >
          <FaDownload />
        </button>
        <button
          className="action-button delete"
          onClick={() => handleDelete(transcription.id)}
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  ), [handleDownload, handleDelete]);

  return (
    <div className="speech-to-text-container">
      <div className="control-panel">
        <div className="language-selector">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-select"
          >
            <option value="en">English 🇺🇸</option>
            <option value="es">Español 🇪🇸</option>
            <option value="fr">Français 🇫🇷</option>
          </select>
        </div>
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? (
            <>
              <FaStop /> Stop Recording
            </>
          ) : (
            <>
              <FaMicrophone /> Start Recording
            </>
          )}
        </button>
      </div>

      <div className="current-transcription">
        <h3>Current Transcription</h3>
        <div className="transcription-box">
          {currentText || 'Start speaking...'}
        </div>
      </div>

      <div className="transcriptions-list">
        <h3>Previous Transcriptions</h3>
        <div className="virtualized-container">
          <VirtualizedList
            items={transcriptions}
            renderItem={renderTranscription}
            itemHeight={120}
          />
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
