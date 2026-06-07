import { useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import ChatBox from './ChatBox';
import '../chatbot.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Don't show widget on the dedicated chat page
  if (pathname === '/chat') return null;

  return (
    <>
      {/* Mini chat window */}
      {open && (
        <div className="chat-widget__window">
          <div className="chat-widget__header">
            <span className="chat-widget__title">
              <span className="chat-widget__title-icon">💬</span>
              Samagama Bot
            </span>
            <button
              className="chat-widget__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="chat-widget__body">
            <ChatBox />
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        className={`chat-widget__fab ${open ? 'chat-widget__fab--open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        type="button"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
