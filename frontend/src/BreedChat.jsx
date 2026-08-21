import React, { useState } from 'react';
import './BreedChat.css';

export default function BreedChat({ backendUrl }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatResult, setChatResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/breed-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setChatResult(data);
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="breed-chat-card">
      <div className="chat-header">
        <h3>💬 Ask Breed Assistant</h3>
        <p>Ask about personality, grooming, hypoallergenic traits, and apartment suitability.</p>
      </div>

      <form onSubmit={handleSearch} className="chat-input-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Are Maine Coons friendly with kids? or Tell me about Ragdolls"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Ask Assistant"}
        </button>
      </form>

      {chatResult && (
        <div className="chat-response-container">
          <div className="breed-image-wrapper">
            <img 
              src={chatResult.image_url} 
              alt={chatResult.detected_breed || "Cat Breed"} 
              loading="lazy"
            />
            {chatResult.detected_breed && (
              <span className="breed-badge">{chatResult.detected_breed}</span>
            )}
          </div>
          <div className="breed-text-wrapper">
            <div className="chat-bubble">
              <p>{chatResult.answer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}