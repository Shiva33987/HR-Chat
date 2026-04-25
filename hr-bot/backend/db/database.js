const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const DB_PATH = path.join(__dirname, "hr_bot.json");

const adapter = new FileSync(DB_PATH);
const db = low(adapter);

// Set defaults
db.defaults({
  leave_requests: [],
  expense_requests: [],
  chat_history: []
}).write();

module.exports = db;
