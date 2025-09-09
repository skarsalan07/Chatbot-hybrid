import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ChatWindow({ messages }) {
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
    
    // Simulate typing indicator for new bot responses
    if (messages.length > 0 && !messages[messages.length - 1].answer) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Format message with links and line breaks
  const formatMessage = (text) => {
    if (!text) return "";
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      style={{
        height: "500px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          padding: "16px 20px",
          background: "rgba(0, 0, 0, 0.2)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#10b981",
              marginRight: "10px",
            }}
          />
          <h3 style={{ margin: 0, color: "white", fontWeight: "600" }}>
            AI Assistant
          </h3>
        </div>
        <div style={{ display: "flex" }}>
          {["#ef4444", "#f59e0b", "#10b981"].map((color) => (
            <div
              key={color}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: color,
                marginLeft: "8px",
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Messages container */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "scroll",
          background: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <React.Fragment key={idx}>
              {/* User message */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "18px 18px 5px 18px",
                    maxWidth: "70%",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    wordBreak: "break-word",
                  }}
                >
                  {m.question}
                </div>
              </motion.div>
              
              {/* Bot message */}
              {m.answer && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      color: "white",
                      padding: "12px 16px",
                      borderRadius: "18px 18px 18px 5px",
                      maxWidth: "70%",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      wordBreak: "break-word",
                    }}
                  >
                    <div>{formatMessage(m.answer)}</div>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;