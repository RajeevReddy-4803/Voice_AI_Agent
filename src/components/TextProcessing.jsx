import React, { useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaFileUpload, FaDownload, FaTrash, FaChartBar, FaLanguage, FaMagic, FaHistory, FaServer } from 'react-icons/fa';
import VirtualizedList from './VirtualizedList';

const TextProcessing = () => {
  const { currentLanguage, translations } = useLanguage();
  const [text, setText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [processingType, setProcessingType] = useState('summarize');

  const processingOptions = [
    { id: 'summarize', name: 'Summarize', icon: <FaChartBar /> },
    { id: 'translate', name: 'Translate', icon: <FaLanguage /> },
    { id: 'enhance', name: 'Enhance', icon: <FaMagic /> },
    { id: 'n8n', name: 'n8n Workflow', icon: <FaServer /> }
  ];

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  }, []);

  const processText = useCallback(async () => {
    if (!text) return;

    setAnalysis({ status: 'processing' });
    const startTime = Date.now();

    try {
      const response = await fetch('http://localhost:5000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: currentLanguage,
          type: processingType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const endTime = Date.now();

      const analysisResult = {
        processedText: result.processed_text,
        metrics: {
          wordCount: text.split(/\s+/).filter(Boolean).length,
          charCount: text.length,
          processingTime: endTime - startTime,
        },
        language: result.language,
        status: 'completed'
      };

      setProcessedText(result.processed_text);
      setAnalysis(analysisResult);
      setHistory(prev => [{
        id: Date.now(),
        originalText: text,
        processedText: result.processed_text,
        metrics: analysisResult.metrics,
        type: processingType,
        language: result.language,
        timestamp: new Date().toISOString()
      }, ...prev]);

    } catch (error) {
      console.error("Error processing text:", error);
      setAnalysis({ status: 'error', message: error.message });
    }
  }, [text, currentLanguage, processingType]);

  const handleDownload = useCallback((item) => {
    const content = `Original Text:\n${item.originalText}\n\nProcessed Text:\n${item.processedText}\n\nMetrics:\nWord Count: ${item.metrics.wordCount}\nCharacter Count: ${item.metrics.charCount}\nSentence Count: ${item.metrics.sentenceCount}\nProcessing Time: ${item.metrics.processingTime}ms`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-processing-${item.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDelete = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const renderHistoryItem = useCallback((item) => (
    <div className="history-item">
      <div className="history-content">
        <div className="history-header">
          <span className="processing-badge">
            {processingOptions.find(opt => opt.id === item.type)?.icon}
            {processingOptions.find(opt => opt.id === item.type)?.name}
          </span>
          <span className="language-badge">{item.language}</span>
          <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
        </div>
        <div className="text-preview">
          <p className="original-text">{item.originalText.substring(0, 100)}...</p>
          <p className="processed-text">{item.processedText.substring(0, 100)}...</p>
        </div>
        <div className="metrics">
          <span>Words: {item.metrics.wordCount}</span>
          <span>Chars: {item.metrics.charCount}</span>
          <span>Sentences: {item.metrics.sentenceCount}</span>
          <span>Time: {item.metrics.processingTime}ms</span>
        </div>
      </div>
      <div className="history-actions">
        <button
          className="action-button download"
          onClick={() => handleDownload(item)}
          title="Download"
        >
          <FaDownload />
        </button>
        <button
          className="action-button delete"
          onClick={() => handleDelete(item.id)}
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  ), [processingOptions, handleDownload, handleDelete]);

  return (
    <div className="text-processing-container">
      <div className="control-panel">
        <div className="processing-options">
          {processingOptions.map(option => (
            <button
              key={option.id}
              className={`processing-option ${processingType === option.id ? 'active' : ''}`}
              onClick={() => setProcessingType(option.id)}
            >
              {option.icon}
              {option.name}
            </button>
          ))}
        </div>
        <div className="language-selector">
          <select
            value={currentLanguage}
            disabled
            className="language-select"
          >
            <option value="en">English 🇺🇸</option>
            <option value="es">Español 🇪🇸</option>
            <option value="fr">Français 🇫🇷</option>
            <option value="de">German 🇩🇪</option>
            <option value="it">Italian 🇮🇹</option>
          </select>
        </div>
      </div>

      <div className="text-input-panel">
        <div className="file-upload">
          <label className="upload-button">
            <FaFileUpload />
            Upload Text File
            <input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter or paste your text here..."
          className="text-input"
        />
        <button
          className="process-button"
          onClick={processText}
          disabled={!text || analysis?.status === 'processing'}
        >
          {analysis?.status === 'processing' ? 'Processing...' : 'Process Text'}
        </button>
      </div>

      {analysis && analysis.status !== 'processing' && (
        <div className="analysis-panel">
          <div className="processed-text">
            <h3>Processed Result</h3>
            <div className="result-box">
              {processedText}
            </div>
          </div>
          <div className="metrics-panel">
            <h3>Text Analysis</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-value">{analysis.metrics?.wordCount}</span>
                <span className="metric-label">Words</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{analysis.metrics?.charCount}</span>
                <span className="metric-label">Characters</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{analysis.metrics?.sentenceCount}</span>
                <span className="metric-label">Sentences</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{analysis.metrics?.processingTime}ms</span>
                <span className="metric-label">Processing Time</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="history-panel">
        <div className="history-header">
          <h3>
            <FaHistory /> Processing History
          </h3>
        </div>
        <div className="virtualized-container">
          <VirtualizedList
            items={history}
            renderItem={renderHistoryItem}
            itemHeight={180}
          />
        </div>
      </div>
    </div>
  );
};

export default TextProcessing;
