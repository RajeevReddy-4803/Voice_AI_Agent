import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSpeak = async () => {
    if (!text.trim()) {
      alert("Please enter text first!");
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || "https://voice-ai-agent.onrender.com"; // Use environment variable or fallback
      const response = await axios.post(
        `${API_URL}/tts`,  // Use the Render backend URL
        { text },
        { responseType: "blob" }
      );

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Text-to-speech error:", error);
      alert("Text-to-speech conversion failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Text to Speech</h1>
      <p>Convert written text into natural-sounding speech.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak..."
      />

      <div className="button-group">
        <button onClick={handleSpeak} disabled={isLoading}>
          {isLoading ? "Generating..." : "Speak"}
        </button>
      </div>
    </div>
  );
};

export default TextToSpeech;
