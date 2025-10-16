import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useHomeAssistant } from '../Context/HomeAssistantContext';
import { DEFAULT_LOCALE } from '../../config';

export default function AIStreamDisplay({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wsRef = useRef(null);

  // Auto-scroll to bottom - nur innerhalb der Komponente
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  // Simulierte WebSocket Verbindung (ersetze mit echter WebSocket URL)
  useEffect(() => {
    // Simuliere eingehende Nachrichten für Demo
    const simulateStream = () => {
    const demoMessages = [
      "Welcome to the OGB Recommendations Stream! Establishing connection...",
      "🤖 OGB Recommendation System is ready and waiting for requests.",
      "Analyzing incoming data...",
      "Generating response based on current parameters...",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "🔄 Processing new request...",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "✅ Task completed successfully. Ready for next input.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    ];

      let messageIndex = 0;
      
      const addMessage = () => {
        if (messageIndex < demoMessages.length) {
        const message = {
          
          text: demoMessages[messageIndex],
          timestamp: new Date(),
          type: messageIndex === 0 ? 'system' : 'ai'
        };
          setMessages(prev => [...prev, message]);
          messageIndex++;
          
          // Random delay between messages (1-4 seconds)
          setTimeout(addMessage, Math.random() * 3000 + 1000);
        } else {
          // Simulate typing indicator
          setTimeout(() => {
            setCurrentMessage("Typing...");
            setTimeout(() => {
              setCurrentMessage("");
              messageIndex = 1; // Reset to continue loop
              setTimeout(addMessage, 2000);
            }, 2000);
          }, 3000);
        }
      };

      setIsConnected(true);
      setTimeout(addMessage, 1000);
    };

    simulateStream();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString(DEFAULT_LOCALE, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <StatusIndicator>
            <StatusDot />
            <ConnectionStatus $connected={isConnected} />
          </StatusIndicator>
          <HeaderInfo>
            <Title>OGB Recomendation</Title>
            <StatusText>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </StatusText>
          </HeaderInfo>
        </HeaderLeft>
        
        {onClose && (
          <CloseButton onClick={onClose} title="Close">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CloseButton>
        )}
      </Header>

      {/* Messages Area */}
      <MessagesContainer ref={messagesContainerRef}>
        {messages.map((message) => (
          <MessageWrapper key={message.id} $type={message.type}>
            <MessageBubble $type={message.type}>
              <MessageHeader>
                <Avatar $type={message.type}>
                  {message.type === 'system' ? '⚙️' : '🤖'}
                </Avatar>
                <MessageMeta>
                  <SenderName>
                    {message.type === 'system' ? 'System' : 'AI Assistant'}
                  </SenderName>
                  <Timestamp>
                    {formatTime(message.timestamp)}
                  </Timestamp>
                </MessageMeta>
              </MessageHeader>
              
              <MessageContent>
                {message.text}
              </MessageContent>
            </MessageBubble>
          </MessageWrapper>
        ))}

        {/* Current/Typing Message */}
        {currentMessage && (
          <MessageWrapper $type="ai">
            <MessageBubble $type="ai">
              <MessageHeader>
                <Avatar $type="ai">🤖</Avatar>
                <MessageMeta>
                  <SenderName>AI Assistant</SenderName>
                  <Timestamp>{formatTime(new Date())}</Timestamp>
                </MessageMeta>
              </MessageHeader>
              
              <MessageContent>
                <TypingContainer>
                  <span>{currentMessage}</span>
                  <TypingDots>
                    <TypingDot $delay="0ms" />
                    <TypingDot $delay="150ms" />
                    <TypingDot $delay="300ms" />
                  </TypingDots>
                </TypingContainer>
              </MessageContent>
            </MessageBubble>
          </MessageWrapper>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Status Bar */}
      <StatusBar>
        <StatusLeft>
          <StatusItem>Messages: {messages.length}</StatusItem>
          <StatusDivider>•</StatusDivider>
          <StatusItem>Status: {isConnected ? 'Streaming' : 'Reconnecting...'}</StatusItem>
        </StatusLeft>
        <StatusRight>
          Last update: {new Date().toLocaleTimeString(DEFAULT_LOCALE)}
        </StatusRight>
      </StatusBar>
    </Container>
  );
}

// Animations
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const ping = keyframes`
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(2); opacity: 0; }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

// Styled Components
const Container = styled.div`
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  height: 82vh;
  width: 40vw;
  max-height: 100vh;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--main-text-color, #e2e8f0);


    @media (max-width: 1024px) {
        transition: color 0.3s ease;
    }

    @media (max-width: 768px) {
        width:100%;
        transition: color 0.3s ease;
    }

    @media (max-width: 480px) {
      flex-direction:column;
      width:95vw;  
      transition: color 0.3s ease;

    }

`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusIndicator = styled.div`
  position: relative;
`;

const StatusDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(45deg, #60a5fa, #a855f7);
  animation: ${pulse} 2s infinite;
`;

const ConnectionStatus = styled.div`
  position: absolute;
  inset: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $connected }) => $connected ? '#10b981' : '#ef4444'};
  opacity: 0.75;
  animation: ${({ $connected }) => $connected ? ping : pulse} 2s infinite;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #60a5fa, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const StatusText = styled.p`
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scroll-behavior: smooth;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $type }) => $type === 'system' ? 'center' : 'flex-start'};
  animation: ${fadeIn} 0.3s ease-out;
`;

const MessageBubble = styled.div`
  position: relative;
  max-width: 80%;
  background: ${({ $type }) => 
    $type === 'system' 
      ? 'linear-gradient(45deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))'
      : 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))'
  };
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $type }) => 
    $type === 'system' 
      ? 'rgba(234, 179, 8, 0.3)'
      : 'rgba(59, 130, 246, 0.3)'
  };
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 1rem;
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05));
    pointer-events: none;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) => 
    $type === 'system' 
      ? 'linear-gradient(45deg, #eab308, #f97316)'
      : 'linear-gradient(45deg, #60a5fa, #a855f7)'
  };
  font-size: 1rem;
`;

const MessageMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const SenderName = styled.span`
  font-weight: 500;
  color: #f8fafc;
  font-size: 0.875rem;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const MessageContent = styled.div`
  color: #e2e8f0;
  line-height: 1.6;
  white-space: pre-wrap;
  padding-left: 2.75rem;
`;

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background: #60a5fa;
  border-radius: 50%;
  animation: ${bounce} 1.4s infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const StatusBar = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(71, 85, 105, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #94a3b8;
  flex-shrink: 0;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusItem = styled.span``;

const StatusDivider = styled.span``;

const StatusRight = styled.div`
  font-size: 0.75rem;
`;