export default function SuggestedQuestions({ questions, onSelect }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="chat-suggestions">
      <div className="chat-suggestions__label">Related Questions</div>
      <div className="chat-suggestions__list">
        {questions.map((q) => (
          <button
            key={q.id}
            className="chat-suggestion-chip"
            onClick={() => onSelect(q.title)}
            type="button"
          >
            {q.title}
          </button>
        ))}
      </div>
    </div>
  );
}
