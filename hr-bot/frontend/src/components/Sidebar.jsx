import React from "react";
import "./Sidebar.css";

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Sidebar({ activeView, onNavigate, onNewChat }) {
  const handleNewChat = () => {
    onNewChat();
    onNavigate("chat");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BuildingIcon />
        </div>
        <span className="sidebar-logo-text">HR Assistant</span>
      </div>

      {/* New Chat button */}
      <div className="sidebar-new-chat">
        <button className="new-chat-btn" onClick={handleNewChat} aria-label="Start new chat">
          <PlusIcon />
          New Chat
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${activeView === "chat" ? "active" : ""}`}
          onClick={() => onNavigate("chat")}
          aria-current={activeView === "chat" ? "page" : undefined}
        >
          <ChatIcon />
          <span>Chat</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeView === "history" ? "active" : ""}`}
          onClick={() => onNavigate("history")}
          aria-current={activeView === "history" ? "page" : undefined}
        >
          <HistoryIcon />
          <span>History</span>
        </button>
      </nav>
    </aside>
  );
}
