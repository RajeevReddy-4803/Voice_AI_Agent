import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const TextProcessing = () => {
  const [text, setText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessText = async () => {
    if (!text.trim()) {
      alert("Please enter text first!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/process-text",  // Update this endpoint as per your backend
        { text }
      );
      setProcessedText(response.data.processedText);  // Assuming response contains 'processedText'
    } catch (error) {
      console.error("Text processing error:", error);
      alert("Text processing failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Text Processing</h1>
      <p>Enhance your text with various processing tools.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text for processing..."
      />

      <div className="button-group">
        <button onClick={handleProcessText} disabled={isLoading}>
          {isLoading ? "Processing..." : "Process Text"}
        </button>
      </div>

      <div className="output-box">
        <h2>Processed Output</h2>
        <p>{processedText || "Processed results will appear here..."}</p>
      </div>
    </div>
  );
};

export default TextProcessing;
