import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateCourseRecommendation } from '../config/gemini';
import { ChatMessage } from '../types/User';
import axios from 'axios';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [chatTitleInput, setChatTitleInput] = useState('');

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

  // Fetch chats for the user
  useEffect(() => {
    if (currentUser) {
      axios.get(`http://localhost:4000/chats?userId=${currentUser.uid}`)
        .then(res => {
          setChats(res.data);
          if (res.data.length > 0 && selectedChatId === null) {
            setSelectedChatId(res.data[0].id);
          }
        });
    }
  }, [currentUser]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (selectedChatId) {
      axios.get(`http://localhost:4000/chats/${selectedChatId}/messages`)
        .then(res => {
          setMessages(res.data.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            isUser: msg.sender === 'user',
            timestamp: new Date(msg.timestamp)
          })));
        });
    }
  }, [selectedChatId]);

  // Create new chat
  const handleCreateChat = async () => {
    if (!currentUser) return;
    const res = await axios.post('http://localhost:4000/chats', {
      userId: currentUser.uid,
      title: chatTitleInput || 'New Chat'
    });
    setChats([res.data, ...chats]);
    setSelectedChatId(res.data.id);
    setChatTitleInput('');
    setMessages([]);
  };

  // Delete chat
  const handleDeleteChat = async (chatId: number) => {
    await axios.delete(`http://localhost:4000/chats/${chatId}`);
    setChats(chats.filter(c => c.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(chats.length > 1 ? chats.find(c => c.id !== chatId)?.id || null : null);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading || !currentUser || !selectedChatId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Save user message to backend
    await axios.post(`http://localhost:4000/chats/${selectedChatId}/messages`, {
      sender: 'user',
      content: userMessage.content
    });

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
      // Save assistant message to backend
      await axios.post(`http://localhost:4000/chats/${selectedChatId}/messages`, {
        sender: 'assistant',
        content: assistantMessage.content
      });
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      await axios.post(`http://localhost:4000/chats/${selectedChatId}/messages`, {
        sender: 'assistant',
        content: errorMessage.content
      });
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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar for chat history */}
      <div style={{ width: 260, background: '#f4f6fb', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
          <input
            type="text"
            value={chatTitleInput}
            onChange={e => setChatTitleInput(e.target.value)}
            placeholder="New chat title"
            style={{ width: '70%', padding: 6, borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }}
          />
          <button onClick={handleCreateChat} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#4e54c8', color: 'white', fontWeight: 600 }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map(chat => (
            <div key={chat.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: selectedChatId === chat.id ? '#e6e9f8' : 'transparent', cursor: 'pointer', borderBottom: '1px solid #ececec' }}>
              <div onClick={() => setSelectedChatId(chat.id)} style={{ flex: 1, fontWeight: selectedChatId === chat.id ? 700 : 500 }}>{chat.title || 'Untitled Chat'}</div>
              <button onClick={() => handleDeleteChat(chat.id)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#c00', fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
    backgroundImage: 'linear-gradient(to right, #4e54c8, #8f94fb)',
    backgroundColor: '#4e54c8', // optional fallback color
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
    backgroundImage: 'linear-gradient(to right, #4e54c8, #8f94fb)',
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
    display: 'flex',
    padding: '20px',
    backgroundColor: 'white',
    borderTop: '1px solid #e9ecef'
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
    backgroundImage: 'linear-gradient(to right, #4e54c8, #8f94fb)',
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