import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaMicrophone, FaStop, FaDownload, FaTrash } from 'react-icons/fa';
import VirtualizedList from './VirtualizedList';

const SpeechToText = () => {
  const { currentLanguage, translations } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [currentText, setCurrentText] = useState('');
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = currentLanguage;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setCurrentText(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecordingRef.current) {
          // Restart recognition if it stops unexpectedly
          recognitionRef.current.start();
        }
      };
    } else {
      console.error("Speech Recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLanguage]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const handleStartRecording = useCallback(() => {
    if (recognitionRef.current) {
      setCurrentText('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      if (currentText) {
        setTranscriptions(prev => [...prev, {
          id: Date.now(),
          text: currentText,
          language: currentLanguage,
          timestamp: new Date().toISOString()
        }]);
        setCurrentText('');
      }
    }
  }, [currentText, currentLanguage]);

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
          {currentText || (isRecording ? 'Listening...' : 'Click "Start Recording" to begin...')}
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
