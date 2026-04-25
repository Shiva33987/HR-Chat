import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar.jsx";
import ChatUI from "./components/ChatUI.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import { checkHealth } from "./api.js";
import "./App.css";

function createSession() {
  const id = uuidv4();
  sessionStorage.setItem("hr_session_id", id);
  return id;
}

export default function App() {
  const [activeView, setActiveView] = useState("chat");
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

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onNewChat={handleNewChat}
      />
      <main className="app-main">
        {backendOnline === false && (
          <div className="backend-banner" role="alert">
            <span className="backend-banner-dot" />
            Backend offline — start it with <code>cd hr-bot/backend &amp;&amp; node app.js</code>
          </div>
        )}
        {activeView === "chat" ? (
          <ChatUI key={chatKey} sessionId={chatKey} backendOnline={backendOnline} />
        ) : (
          <HistoryPanel backendOnline={backendOnline} />
        )}
      </main>
    </div>
  );
}
