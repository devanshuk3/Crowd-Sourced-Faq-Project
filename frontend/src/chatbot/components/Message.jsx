import { Link } from '@tanstack/react-router';

export default function Message({ role, text, source, status }) {
  const isUser = role === 'user';

  return (
    <div className={`chat-message chat-message--${role}`}>
      <span className="chat-message__label">{isUser ? 'You' : 'Bot'}</span>
      <div className="chat-message__bubble">
        {text}
        {!isUser && source && (
          <div className="chat-message__source">
            <span className="chat-message__source-badge">Source</span>
            <Link to={`/faq/${source.id}`}>{source.title}</Link>
            {status === 'Unanswered' && (
              <span className="chat-status-unanswered">Unanswered</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
