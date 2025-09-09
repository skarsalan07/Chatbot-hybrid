import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChatWindow from "./ChatWindow";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // 🔹 Your deployed backend API base URL
  const API_URL = "https://chatbot-hybrid.onrender.com";

  // 🔹 On first load, restore history from localStorage OR show greeting
  useEffect(() => {
    inputRef.current?.focus();
    const saved = localStorage.getItem("chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ question: "", answer: "Hello 👋! How can I help you today?" }]);
    }
  }, []);

  // 🔹 Always persist the last 10 messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_history", JSON.stringify(messages.slice(-10)));
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user's message immediately for better UX
    const userMessage = { question: input, answer: "" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Call your Render backend /ask
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();

      // Append bot's reply
      const newAnswer = { question: input, answer: data.answer };
      const newMessages = [...messages, newAnswer].slice(-10); // keep last 10
      setMessages(newMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      // Update last message with error reply
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          answer:
            "Sorry 😢, I'm having trouble connecting to the server. Please try again later.",
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

  // 🔹 Clear chat locally (localStorage only, stateless backend)
  const clearChat = () => {
    const greeting = { question: "", answer: "Hello 👋! How can I help you today?" };
    setMessages([greeting]);
    localStorage.setItem("chat_history", JSON.stringify([greeting]));
  };

  return (
    <div className="app-container">
      <motion.div
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h1>Mohur AI</h1>
          </div>
          <motion.button
            className="clear-btn"
            onClick={clearChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={messages.length === 0}
          >
            <i className="fas fa-trash-alt"></i>
            Clear Chat
          </motion.button>
        </div>
        <p className="subtitle">Your intelligent Assistant</p>
      </motion.div>

      <ChatWindow messages={messages} />

      <motion.div
        className="input-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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

      <motion.footer
        className="app-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      ></motion.footer>
    </div>
  );
}

export default App;
