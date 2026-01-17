import { useEffect, useRef, useState } from 'react';
import { FaComments, FaPaperPlane, FaRobot, FaTimes, FaUser } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { aiService } from '../services/api';
import './AIAssistantPage.css';


const MessageWithLinks = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        part.match(urlRegex) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="ai-link"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const allowedPages = ['/', '/home', '/products'];
  const isAllowedPage = allowedPages.includes(location.pathname);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiService.chatWithAI(userMessage);
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: response.reply || response.response || 'No response received'
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { type: 'error', content: 'Sorry, something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAllowedPage) return null;

  return (
    <>
  
      <button
        className={`btn btn-nut-brown rounded-circle shadow-lg position-fixed ${isOpen ? 'd-none' : ''}`}
        style={{ bottom: 30, right: 30, width: 60, height: 60, zIndex: 1050 }}
        onClick={() => setIsOpen(true)}
      >
        <FaComments size={24} />
      </button>

      
      <div
        className={`card ai-chat position-fixed shadow-lg ${isOpen ? 'd-flex' : 'd-none'}`}
        style={{ bottom: 30, right: 30, width: 380, height: 600, zIndex: 1050 }}
      >
     
        <div className="card-header bg-nut-brown text-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div className="ai-avatar">
              <FaRobot />
            </div>
            <div>
              <strong>AI Assistant</strong>
              <div className="small opacity-75">Online</div>
            </div>
          </div>
          <button className="btn btn-link text-white fs-4" onClick={() => setIsOpen(false)}>
            <FaTimes />
          </button>
        </div>

    
        <div className="card-body ai-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`d-flex mb-3 ${msg.type === 'user' ? 'justify-content-end' : ''}`}
            >
              {msg.type !== 'user' && <div className="ai-bubble-icon"><FaRobot /></div>}

              <div className={`ai-bubble ${msg.type}`}>
                <MessageWithLinks text={msg.content} />
              </div>

              {msg.type === 'user' && <div className="user-bubble-icon"><FaUser /></div>}
            </div>
          ))}

          {loading && <div className="ai-bubble ai">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="card-footer">
          <form onSubmit={handleSendMessage} className="d-flex gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button className="btn btn-nut-brown btn-sm" disabled={loading}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIAssistantPage;
