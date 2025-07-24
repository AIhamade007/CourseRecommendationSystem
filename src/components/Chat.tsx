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

  const [isHovered, setIsHovered] = useState(false);


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
        content: `Hello ${currentUser.name}! I'm your course recommendation assistant. How can I help you today?`,
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
            Welcome, {currentUser.name} 
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
                  backgroundColor: message.isUser ? '#4e54c8' : '#f1f3f5',
                  color: message.isUser ? 'white' : '#212529',
                  alignSelf: message.isUser ? 'flex-end' : 'flex-start'
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
                  <span style={styles.dot}></span>
                  <span style={{ ...styles.dot, ...styles.dot2 }}></span>
                  <span style={{ ...styles.dot, ...styles.dot3 }}></span>
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
            style={{
              ...styles.sendButton,
              opacity: isHovered ? 0.9 : 1,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    backgroundImage: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    backgroundColor: '#7a35d5', // optional fallback color
    color: 'white',
    padding: '24px 32px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  userInfo: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600
  },
  userDetails: {
    margin: '8px 0 0 0',
    fontSize: '15px',
    fontWeight: 500,
    opacity: 0.85
  },
  logoutButton: {
    backgroundImage: 'linear-gradient(to right, #7a35d5)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundImage: 'url("/GBG1.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat', 
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', 
    backdropFilter: 'blur(2px)', 
    padding: '20px 0',
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
    width: '100%',
    animation: 'fadeIn 0.3s ease-in-out'
  },
  message: {
    maxWidth: '75%',
    padding: '14px 18px',
    borderRadius: '20px',
    wordWrap: 'break-word' as const,
    boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease'
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
    gap: '4px',
    alignItems: 'center',
    height: '20px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ccc',
    display: 'inline-block',
    animation: 'typingBounce 1.4s infinite ease-in-out',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  inputForm: {
    position: 'absolute' as 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    padding: '20px',
    backgroundColor: 'white',
    borderTop: '1px solid #e9ecef',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
    zIndex: 1
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    border: '1px solid #ccc',
    borderRadius: '999px',
    fontSize: '15px',
    outline: 'none',
    marginRight: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.2s ease'
  },
  sendButton: {
    backgroundImage: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  }
};

const typingKeyframes = `
@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}`;

const messageFadeIn = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`;

if (typeof document !== 'undefined' && !document.getElementById('typing-keyframes')) {
  const style = document.createElement('style');
  style.id = 'typing-keyframes';
  style.innerHTML = typingKeyframes;
  document.head.appendChild(style);
}

if (typeof document !== 'undefined' && !document.getElementById('fade-in-keyframes')) {
  const style2 = document.createElement('style');
  style2.id = 'fade-in-keyframes';
  style2.innerHTML = messageFadeIn;
  document.head.appendChild(style2);
}


export default Chat;