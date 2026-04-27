import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar.jsx";
import ChatUI from "./components/ChatUI.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import HRDashboard from "./components/HRDashboard.jsx";
import Login from "./pages/Login.jsx";
import { checkHealth } from "./api.js";
import "./App.css";

function createSession() {
  const id = uuidv4();
  sessionStorage.setItem("hr_session_id", id);
  return id;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hr_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeView, setActiveView] = useState(() => {
    return user?.role === 'admin' ? "dashboard" : "chat";
  });
  const [backendOnline, setBackendOnline] = useState(null);
  // chatKey forces ChatUI to fully remount on new chat
  const [chatKey, setChatKey] = useState(() => {
    return sessionStorage.getItem("hr_session_id") || createSession();
  });

  useEffect(() => {
    async function ping() {
      const ok = await checkHealth();
      setBackendOnline(ok);
    }
    ping();
    const interval = setInterval(ping, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNewChat = useCallback(() => {
    const newId = createSession();
    setChatKey(newId);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("hr_user");
    setUser(null);
  }, []);

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        activeView={activeView}
        onNavigate={setActiveView}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
      />
      <main className="app-main">
        {backendOnline === false && (
          <div className="backend-banner" role="alert">
            <span className="backend-banner-dot" />
            Backend offline — start it with <code>cd hr-bot/backend &amp;&amp; node app.js</code>
          </div>
        )}
        {user.role === 'admin' ? (
          <HRDashboard backendOnline={backendOnline} />
        ) : (
          activeView === "chat" ? (
            <ChatUI key={chatKey} sessionId={chatKey} backendOnline={backendOnline} user={user} />
          ) : (
            <HistoryPanel backendOnline={backendOnline} user={user} />
          )
        )}
      </main>
    </div>
  );
}
