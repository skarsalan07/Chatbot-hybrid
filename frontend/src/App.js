import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChatWindow from "./ChatWindow";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const API_URL = "http://localhost:5000"; // Change to your backend URL

  // Load chat history on startup
  useEffect(() => {
    inputRef.current?.focus();
    const saved = localStorage.getItem("chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ question: "", answer: "Hello 👋! How can I help you today?" }]);
    }
  }, []);

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_history", JSON.stringify(messages.slice(-10)));
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { question: input, answer: "" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();

      // ✅ FIX: Use functional update to get latest state
      setMessages(prev => {
        const newMessages = [...prev.slice(0, -1), { question: input, answer: data.answer }];
        return newMessages.slice(-10); // Keep last 10 messages
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // ✅ FIX: Use functional update for error case too
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          question: input,
          answer: "Sorry 😢, I'm having trouble connecting to the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const greeting = { question: "", answer: "Hello 👋! How can I help you today?" };
    setMessages([greeting]);
    localStorage.setItem("chat_history", JSON.stringify([greeting]));
  };

  return (
    <div className="app-container">
      <motion.div className="app-header" /* ... */ >
        {/* Header content remains same */}
      </motion.div>

      <ChatWindow messages={messages} isLoading={isLoading} />

      <motion.div className="input-container" /* ... */ >
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            placeholder="Ask me anything..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <motion.button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-paper-plane"></i>
            {isLoading ? " ..." : " Send"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default App;