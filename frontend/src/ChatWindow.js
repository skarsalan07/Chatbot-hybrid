import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
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
            style={{ color: '#60a5fa', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      // Preserve line breaks
      return part.split('\n').map((line, i) => (
        <React.Fragment key={`${index}-${i}`}>
          {line}
          {i < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div
      style={{
        height: "520px",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
        borderRadius: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          padding: "18px 24px",
          background: "rgba(0, 0, 0, 0.25)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px #10b981",
              animation: "pulse 2s infinite",
            }}
          />
          <h3 style={{ margin: 0, color: "white", fontWeight: "600", fontSize: "16px" }}>
            AI Assistant Online
          </h3>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { color: "#ef4444", label: "close" },
            { color: "#f59e0b", label: "minimize" },
            { color: "#10b981", label: "maximize" }
          ].map((btn) => (
            <div
              key={btn.color}
              title={btn.label}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: btn.color,
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.2)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
          ))}
        </div>
      </div>
      
      {/* Messages container */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          background: "rgba(0, 0, 0, 0.15)",
        }}
      >
        <AnimatePresence mode="sync">
          {messages.map((m, idx) => (
            <React.Fragment key={`${idx}-${m.timestamp || idx}`}>
              {/* User message */}
              {m.question && !m.isGreeting && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "white",
                      padding: "14px 18px",
                      borderRadius: "20px 20px 4px 20px",
                      maxWidth: "75%",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                      wordBreak: "break-word",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {m.question}
                  </div>
                </motion.div>
              )}
              
              {/* Bot message */}
              {m.answer && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", maxWidth: "75%" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      🤖
                    </div>
                    <div
                      style={{
                        background: m.isError 
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        color: m.isError ? "#fca5a5" : "white",
                        padding: "14px 18px",
                        borderRadius: "20px 20px 20px 4px",
                        border: `1px solid ${m.isError ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                        wordBreak: "break-word",
                        fontSize: "15px",
                        lineHeight: "1.6",
                      }}
                    >
                      {formatMessage(m.answer)}
                    </div>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          ))}
          
          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    padding: "14px 18px",
                    borderRadius: "20px 20px 20px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#60a5fa",
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#60a5fa",
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#60a5fa",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Add pulse animation for online indicator */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ChatWindow;