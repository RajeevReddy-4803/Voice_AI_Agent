import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

const SpeechToText = () => {
  const [transcribedText, setTranscribedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");

  // Initialize media recorder and get user media
  useEffect(() => {
    if (navigator.mediaDevices && window.MediaRecorder) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          setAudioBlob(e.data);
          const audioUrl = URL.createObjectURL(e.data); // Generate URL for playback
          setAudioURL(audioUrl);
        };
        setMediaRecorder(recorder);
      }).catch((error) => {
        console.error("Error accessing microphone:", error);
      });
    } else {
      console.error("MediaRecorder API is not supported in this browser.");
    }
  }, []);

  // Toggle listening (start/stop recording)
  const toggleListening = () => {
    if (isListening) {
      mediaRecorder.stop();  // Stop recording
    } else {
      setTranscribedText("");  // Clear the previous transcription
      mediaRecorder.start();  // Start recording
    }
    setIsListening(!isListening);
  };

  // Handle sending audio data to the backend for transcription
  const handleSpeechInput = async () => {
    if (!audioBlob) {
      alert("No audio recorded to process.");
      return;
    }
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");  // Append the audio blob

    try {
      const API_URL = process.env.REACT_APP_API_URL || "https://voice-ai-agent.onrender.com"; // Use environment variable or fallback

      const response = await axios.post(
        `${API_URL}/stt`,  // Use the Render backend URL
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if(response.data && response.data.text){
        setTranscribedText(response.data.text);  // Display transcribed text
    } else{
        alert("Transcription failed.please try again");
    }
  }
      catch (error) {
      console.error("Error processing speech:", error);
      alert("Failed to transcribe speech. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="container">
      <h1>Speech to Text</h1>
      <p>Instantly convert spoken words into written text.</p>

      <div className="button-group">
        <button 
          onClick={toggleListening}
          style={{ backgroundColor: isListening ? '#c62828' : '#009688' }}
        >
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          onClick={handleSpeechInput}
          disabled={isTranscribing || !audioBlob}
        >
          {isTranscribing ? 'Transcribing...' : 'Send for Transcription'}
        </button>
      </div>

      <div className="output-box">
        <h2>Transcribed Text</h2>
        <p>{transcribedText || "Speak to see transcription..."}</p>
      </div>

      {/* Playback for the recorded audio */}
      {audioURL && (
        <div className="audio-preview">
          <h3>Audio Preview</h3>
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
