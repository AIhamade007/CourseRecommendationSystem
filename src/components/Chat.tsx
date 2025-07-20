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
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.userInfo}>
          <h2 style={styles.title}>Course Recommendation Chat</h2>
          <p style={styles.userDetails}>
            Welcome, {currentUser.name} | {currentUser.gradeLevel} | {currentUser.subjectInterests.join(', ')}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.chatContainer}>
        <div style={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.messageWrapper,
                justifyContent: message.isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.message,
                  backgroundColor: message.isUser ? '#007bff' : '#f1f1f1',
                  color: message.isUser ? 'white' : '#333'
                }}
              >
                <div style={styles.messageContent}>{message.content}</div>
                <div style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}>
              <div style={{ ...styles.message, backgroundColor: '#f1f1f1' }}>
                <div style={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about courses, professional development, or teaching resources..."
            style={styles.input}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !inputMessage.trim()}
            style={styles.sendButton}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  userInfo: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '24px'
  },
  userDetails: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    opacity: 0.9
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#f8f9fa'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    wordWrap: 'break-word' as const,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap' as const
  },
  timestamp: {
    fontSize: '11px',
    marginTop: '4px',
    opacity: 0.7
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px'
  },
  inputForm: {
    display: 'flex',
    padding: '20px',
    backgroundColor: 'white',
    borderTop: '1px solid #e9ecef'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    marginRight: '10px'
  },
  sendButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold' as const
  }
};

export default Chat;