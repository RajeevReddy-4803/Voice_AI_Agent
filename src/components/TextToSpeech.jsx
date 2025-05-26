import React, { useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaPlay, FaPause, FaVolumeUp, FaDownload, FaHistory } from 'react-icons/fa';
import VirtualizedList from './VirtualizedList';

const TextToSpeech = () => {
  const { translations } = useLanguage();
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US');
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedPitch, setSelectedPitch] = useState(1);
  const [history, setHistory] = useState([]);

  const voices = [
    { id: 'en-US', name: 'English (US)', gender: 'Female' },
    { id: 'es-ES', name: 'Spanish', gender: 'Male' },
    { id: 'fr-FR', name: 'French', gender: 'Female' }
  ];

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handlePlay = useCallback(() => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang === selectedVoice);
    utterance.rate = selectedSpeed;
    utterance.pitch = selectedPitch;

    utterance.onend = () => {
      setIsPlaying(false);
      setHistory(prev => [{
        id: Date.now(),
        text,
        voice: selectedVoice,
        speed: selectedSpeed,
        pitch: selectedPitch,
        timestamp: new Date().toISOString()
      }, ...prev]);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text, selectedVoice, selectedSpeed, selectedPitch]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const handleDownload = useCallback((item) => {
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang === item.voice);
    utterance.rate = item.speed;
    utterance.pitch = item.pitch;

    // Create audio blob and download
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speech-${item.id}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    window.speechSynthesis.speak(utterance);
    mediaRecorder.stop();
  }, []);

  const renderHistoryItem = useCallback((item) => (
    <div className="history-item">
      <div className="history-content">
        <div className="history-header">
          <span className="voice-badge">{voices.find(v => v.id === item.voice)?.name}</span>
          <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
        </div>
        <p className="history-text">{item.text}</p>
        <div className="voice-settings">
          <span>Speed: {item.speed}x</span>
          <span>Pitch: {item.pitch}</span>
        </div>
      </div>
      <div className="history-actions">
        <button
          className="action-button play"
          onClick={() => {
            setText(item.text);
            setSelectedVoice(item.voice);
            setSelectedSpeed(item.speed);
            setSelectedPitch(item.pitch);
            handlePlay();
          }}
          title="Play"
        >
          <FaPlay />
        </button>
        <button
          className="action-button download"
          onClick={() => handleDownload(item)}
          title="Download"
        >
          <FaDownload />
        </button>
      </div>
    </div>
  ), [voices, handlePlay, handleDownload]);

  return (
    <div className="text-to-speech-container">
      <div className="control-panel">
        <div className="voice-settings-panel">
          <div className="setting-group">
            <label>Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="voice-select"
            >
              {voices.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.gender})
                </option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label>Speed</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={selectedSpeed}
              onChange={(e) => setSelectedSpeed(parseFloat(e.target.value))}
              className="range-input"
            />
            <span>{selectedSpeed}x</span>
          </div>
          <div className="setting-group">
            <label>Pitch</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={selectedPitch}
              onChange={(e) => setSelectedPitch(parseFloat(e.target.value))}
              className="range-input"
            />
            <span>{selectedPitch}</span>
          </div>
        </div>
      </div>

      <div className="text-input-panel">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text to convert to speech..."
          className="text-input"
        />
        <div className="text-actions">
          <button
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={isPlaying ? handleStop : handlePlay}
          >
            {isPlaying ? (
              <>
                <FaPause /> Stop
              </>
            ) : (
              <>
                <FaPlay /> Play
              </>
            )}
          </button>
        </div>
      </div>

      <div className="history-panel">
        <div className="history-header">
          <h3>
            <FaHistory /> History
          </h3>
        </div>
        <div className="virtualized-container">
          <VirtualizedList
            items={history}
            renderItem={renderHistoryItem}
            itemHeight={150}
          />
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
