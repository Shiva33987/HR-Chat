import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, getChatHistory } from "../api.js";
import LeaveForm from "./LeaveForm.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import "./ChatUI.css";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I am your HR Assistant. How can I help you today? You can ask me about company policies, apply for leave, or submit a reimbursement.",
  created_at: new Date().toISOString()
};

// Simple markdown-like renderer
function renderContent(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <React.Fragment key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PolicyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const QUICK_ACTIONS = [
  {
    id: "leave",
    icon: <CalendarIcon />,
    title: "Apply for Leave",
    subtitle: "Book time off or sick leave",
    message: "I want to apply for leave"
  },
  {
    id: "expense",
    icon: <ReceiptIcon />,
    title: "Submit Expense",
    subtitle: "Claim reimbursements",
    message: "I want to submit an expense"
  },
  {
    id: "policy",
    icon: <PolicyIcon />,
    title: "Ask Policy",
    subtitle: "Query HR guidelines",
    message: "What are the HR policies?"
  }
];

export default function ChatUI({ backendOnline, sessionId, user }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load history for this session on mount
  useEffect(() => {
    getChatHistory(sessionId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(data);
        }
      })
      .catch(() => {/* use welcome message */});
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      role,
      content,
      created_at: new Date().toISOString()
    }]);
  }, []);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    addMessage("user", msg);
    setLoading(true);

    try {
      const { data } = await sendMessage(msg, sessionId);
      addMessage("assistant", data.message);

      // Handle actions from bot
      if (data.action === "open_leave_form") {
        setTimeout(() => setModal("leave"), 400);
      } else if (data.action === "open_expense_form") {
        setTimeout(() => setModal("expense"), 400);
      }
    } catch (err) {
      if (err.message === "NETWORK_ERROR") {
        addMessage("assistant", "⚠️ Cannot reach the backend server. Please make sure it's running:\n\n`cd hr-bot/backend && node app.js`");
      } else {
        addMessage("assistant", "Sorry, something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, addMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    if (action.id === "leave") {
      setModal("leave");
    } else if (action.id === "expense") {
      setModal("expense");
    } else {
      handleSend(action.message);
    }
  };

  const handleLeaveSuccess = (leave) => {
    setModal(null);
    addMessage("assistant",
      `✅ Your **${leave.leave_type} leave** request has been submitted successfully!\n\n` +
      `📋 **Reference ID**: ${leave.id.slice(0, 8).toUpperCase()}\n` +
      `📅 **Dates**: ${leave.start_date} to ${leave.end_date}\n` +
      `🗓️ **Duration**: ${leave.days_count} business day(s)\n` +
      `📊 **Status**: Pending approval\n\n` +
      `You'll be notified once your manager reviews the request.`
    );
  };

  const handleExpenseSuccess = (expense) => {
    setModal(null);
    addMessage("assistant",
      `✅ Your expense claim has been submitted successfully!\n\n` +
      `📋 **Reference ID**: ${expense.id.slice(0, 8).toUpperCase()}\n` +
      `💰 **Amount**: ${expense.currency} ${parseFloat(expense.amount).toFixed(2)}\n` +
      `🏷️ **Category**: ${expense.category}\n` +
      `📊 **Status**: Pending approval\n\n` +
      `Your claim will be reviewed within 3-5 business days.`
    );
  };

  const showQuickActions = messages.length <= 1;

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-avatar">HR</div>
        <div className="chat-header-info">
          <h1 className="chat-header-title">HR Assistant</h1>
          <span className="chat-header-status">
            <span className="status-dot" />
            Online
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role === "user" ? "chat-message--user" : "chat-message--assistant"}`}
          >
            {msg.role === "assistant" && (
              <div className="chat-avatar chat-avatar--bot" aria-hidden="true">HR</div>
            )}
            <div className="chat-bubble">
              <p className="chat-text">{renderContent(msg.content)}</p>
            </div>
            {msg.role === "user" && (
              <div className="chat-avatar chat-avatar--user" aria-hidden="true">You</div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message chat-message--assistant">
            <div className="chat-avatar chat-avatar--bot" aria-hidden="true">HR</div>
            <div className="chat-bubble chat-bubble--typing" aria-label="HR Assistant is typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" role="group" aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            className="quick-action-card"
            onClick={() => handleQuickAction(action)}
            aria-label={action.title}
          >
            <span className="quick-action-icon" aria-hidden="true">{action.icon}</span>
            <div className="quick-action-text">
              <span className="quick-action-title">{action.title}</span>
              <span className="quick-action-subtitle">{action.subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Message input"
            maxLength={500}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* Modals */}
      {modal === "leave" && (
        <LeaveForm
          user={user}
          onClose={() => setModal(null)}
          onSuccess={handleLeaveSuccess}
        />
      )}
      {modal === "expense" && (
        <ExpenseForm
          user={user}
          onClose={() => setModal(null)}
          onSuccess={handleExpenseSuccess}
        />
      )}
    </div>
  );
}
