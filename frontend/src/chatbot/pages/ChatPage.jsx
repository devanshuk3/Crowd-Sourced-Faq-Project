import ChatBox from '../components/ChatBox';
import '../chatbot.css';

export default function ChatPage() {
  return (
    <div className="chat-page">
      <div className="container">
        <div className="page-header">
          <h1>
            Ask the <em>Bot</em>
          </h1>
          <p>
            Get instant answers from our community FAQ database. Ask anything about Samagama, VINS, or the internship program.
          </p>
        </div>
      </div>
      <div className="container">
        <div className="chat-container">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
