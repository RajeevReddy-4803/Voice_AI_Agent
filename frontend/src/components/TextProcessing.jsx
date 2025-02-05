import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const ConversationPlayer = () => {
  const [conversation, setConversation] = useState([
    { speaker: "Alice", text: "Hello, how are you?" },
    { speaker: "Bob", text: "I'm doing well, thanks! How about you?" },
    { speaker: "Charlie", text: "I'm great, thanks for asking!" },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handlePlayConversation = async () => {
    setIsPlaying(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || "https://voice-ai-agent.onrender.com"; // Use environment variable or fallback
      const response = await axios.post(    `${API_URL}/tts`,  // Use the Render backend URL
 
      {
        conversation,
      }, { responseType: "blob" });

      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error playing conversation:", error);
      alert("Failed to generate conversation audio");
    } finally {
      setIsPlaying(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedConversation = [...conversation];
    updatedConversation[index][field] = value;
    setConversation(updatedConversation);
  };

  const handleAddLine = () => {
    setConversation([...conversation, { speaker: "", text: "" }]);
  };

  return (
    <div className="container">
      <h1>AI Voice Conversation</h1>
      <p>Enter a conversation and listen to AI-generated voices.</p>

      {conversation.map((entry, index) => (
        <div key={index} className="conversation-entry">
          <input
            type="text"
            value={entry.speaker}
            onChange={(e) => handleChange(index, "speaker", e.target.value)}
            placeholder="Speaker"
          />
          <input
            type="text"
            value={entry.text}
            onChange={(e) => handleChange(index, "text", e.target.value)}
            placeholder="Text"
          />
        </div>
      ))}

      <button onClick={handleAddLine}>Add Line</button>
      <button onClick={handlePlayConversation} disabled={isPlaying}>
        {isPlaying ? "Generating..." : "Play Conversation"}
      </button>
      
      {/* Place the audio player below the button */}
      {audioUrl && (
        <div className="audio-player">
          <audio controls src={audioUrl} autoPlay />
        </div>
      )}
    </div>
  );
};

export default ConversationPlayer;
