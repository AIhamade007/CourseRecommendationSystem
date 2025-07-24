import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateCourseRecommendation } from '../config/gemini';
import { ChatMessage } from '../types/User';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentUser, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when component mounts
    if (currentUser && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Hello ${currentUser.name}! I'm your course recommendation assistant. I know you're interested in ${currentUser.subjectInterests.join(', ')} and teach ${currentUser.gradeLevel} level. How can I help you find relevant courses or professional development opportunities today?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [currentUser, messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading || !currentUser) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const userProfile = {
        name: currentUser.name,
        subjectInterests: currentUser.subjectInterests,
        gradeLevel: currentUser.gradeLevel,
        experience: currentUser.experience
      };

      const response = await generateCourseRecommendation(inputMessage, userProfile);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  }

  // Tailwind keyframes for typing animation
  const typingKeyframes = `
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.7; }
      40% { transform: scale(1); opacity: 1; }
    }
  `;
  if (typeof document !== 'undefined' && !document.getElementById('typing-keyframes')) {
    const style = document.createElement('style');
    style.id = 'typing-keyframes';
    style.innerHTML = typingKeyframes;
    document.head.appendChild(style);
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100">
      <header className="bg-blue-600 text-white p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-md">
        <div className="flex-1 mb-2 sm:mb-0">
          <h2 className="text-2xl font-bold mb-1">Course Recommendation Chat</h2>
          <p className="text-sm opacity-90">
            Welcome, {currentUser.name} | {currentUser.gradeLevel} | {currentUser.subjectInterests.join(', ')}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/30 transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </header>

      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{scrollbarWidth: 'thin'}}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm break-words whitespace-pre-wrap text-sm flex flex-col ${
                  message.isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                <div>{message.content}</div>
                <div className="text-xs mt-1 opacity-70 self-end">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[70%] px-4 py-3 rounded-2xl shadow-sm bg-white">
                <div className="flex gap-1 items-center h-5">
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#bbb',
                    display: 'inline-block',
                    animation: 'typingBounce 1.4s infinite both',
                  }}></span>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#bbb',
                    display: 'inline-block',
                    animation: 'typingBounce 1.4s infinite both',
                    animationDelay: '0.2s',
                  }}></span>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#bbb',
                    display: 'inline-block',
                    animation: 'typingBounce 1.4s infinite both',
                    animationDelay: '0.4s',
                  }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex p-4 bg-white border-t border-gray-200 gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about courses, professional development, or teaching resources..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;