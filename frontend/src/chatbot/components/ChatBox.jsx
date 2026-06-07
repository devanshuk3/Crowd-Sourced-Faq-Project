import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../services/chatService';
import Message from './Message';
import SuggestedQuestions from './SuggestedQuestions';

const STARTER_QUESTIONS = [
  'What is VINS?',
  'Registration deadline?',
  'Is accommodation available?',
  'What is Rosetta?',
];

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = useCallback(async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInput('');
    setSuggestions([]);
    setLoading(true);

    try {
      const data = await sendChatMessage(query);

      const botMsg = {
        role: 'bot',
        text: data.answer || data.message,
        source: data.source,
        status: data.source?.status,
      };

      setMessages(prev => [...prev, botMsg]);

      if (data.relatedQuestions && data.relatedQuestions.length > 0) {
        setSuggestions(data.relatedQuestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Something went wrong. Please try again.' },
      ]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (title) => {
    handleSend(title);
  };

  // Empty / welcome state
  if (messages.length === 0 && !loading) {
    return (
      <>
        <div className="chat-welcome">
          <div className="chat-welcome__icon">💬</div>
          <h3>Ask anything about Samagama</h3>
          <p>I'll search our community FAQ database and find the best answer for you.</p>
          <div className="chat-welcome__starters">
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                className="chat-suggestion-chip"
                onClick={() => handleSend(q)}
                type="button"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-input-area">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            autoComplete="off"
          />
          <button onClick={() => handleSend()} disabled={!input.trim()}>
            Send →
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <Message
            key={i}
            role={msg.role}
            text={msg.text}
            source={msg.source}
            status={msg.status}
          />
        ))}
        {loading && (
          <div className="chat-loading">
            <div className="chat-loading__dot" />
            <div className="chat-loading__dot" />
            <div className="chat-loading__dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <SuggestedQuestions questions={suggestions} onSelect={handleSuggestionClick} />

      <div className="chat-input-area">
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask another question..."
          autoComplete="off"
        />
        <button onClick={() => handleSend()} disabled={!input.trim() || loading}>
          Send →
        </button>
      </div>
    </>
  );
}
