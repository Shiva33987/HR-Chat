const db = require("../db/database");
const { v4: uuidv4 } = require("uuid");

const ChatModel = {
  addMessage(session_id, role, content) {
    const record = {
      id: uuidv4(),
      session_id,
      role,
      content,
      created_at: new Date().toISOString()
    };
    db.get("chat_history").push(record).write();
    return record;
  },

  getHistory(session_id, limit = 50) {
    return db.get("chat_history")
      .filter({ session_id })
      .orderBy(["created_at"], ["asc"])
      .takeRight(limit)
      .value();
  },

  getAllSessions() {
    const all = db.get("chat_history").value();
    const sessions = {};
    for (const msg of all) {
      if (!sessions[msg.session_id]) {
        sessions[msg.session_id] = {
          session_id: msg.session_id,
          started_at: msg.created_at,
          last_message_at: msg.created_at,
          message_count: 0,
          first_message: null
        };
      }
      const s = sessions[msg.session_id];
      s.message_count++;
      if (new Date(msg.created_at) > new Date(s.last_message_at)) {
        s.last_message_at = msg.created_at;
      }
      if (msg.role === "user" && !s.first_message) {
        s.first_message = msg.content;
      }
    }
    return Object.values(sessions)
      .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
      .slice(0, 20);
  },

  clearSession(session_id) {
    db.get("chat_history").remove({ session_id }).write();
  }
};

module.exports = ChatModel;
