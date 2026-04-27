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

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export default function Sidebar({ user, activeView, onNavigate, onNewChat, onLogout }) {
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
      {user.role === 'employee' && (
        <div className="sidebar-new-chat">
          <button className="new-chat-btn" onClick={handleNewChat} aria-label="Start new chat">
            <PlusIcon />
            New Chat
          </button>
        </div>
      )}

      <nav className="sidebar-nav">
        {user.role === 'admin' ? (
          <button
            className={`sidebar-nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => onNavigate("dashboard")}
          >
            <HistoryIcon />
            <span>Dashboard</span>
          </button>
        ) : (
          <>
            <button
              className={`sidebar-nav-item ${activeView === "chat" ? "active" : ""}`}
              onClick={() => onNavigate("chat")}
            >
              <ChatIcon />
              <span>Chat</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeView === "history" ? "active" : ""}`}
              onClick={() => onNavigate("history")}
            >
              <HistoryIcon />
              <span>My History</span>
            </button>
          </>
        )}
      </nav>

      {/* User profile and logout */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user.name.split(' ').map(n => n[0]).join('')}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role.toUpperCase()}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
