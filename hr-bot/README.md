# HR Bot

A full-stack HR Assistant chatbot with leave management and expense reimbursement features.

## Features

- **Chat Interface** — Conversational HR assistant with intent detection
- **Apply for Leave** — Submit annual, sick, personal, maternity, paternity, or unpaid leave
- **Submit Expenses** — Claim reimbursements across categories (travel, meals, equipment, etc.)
- **HR Policies** — Ask about leave entitlements, remote work, working hours
- **History Panel** — View, approve, reject, and delete leave/expense requests
- **Chat History** — Persisted across sessions via SQLite

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, plain CSS |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |

## Project Structure

```
hr-bot/
├── backend/
│   ├── db/database.js          # SQLite setup & schema
│   ├── models/
│   │   ├── leaveModel.js
│   │   ├── expenseModel.js
│   │   └── chatModel.js
│   ├── controllers/
│   │   ├── leaveController.js
│   │   ├── expenseController.js
│   │   └── chatController.js
│   ├── routes/
│   │   ├── leaveRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── chatRoutes.js
│   ├── app.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatUI.jsx
│   │   │   ├── LeaveForm.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   └── HistoryPanel.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Getting Started

### 1. Install backend dependencies

```bash
cd hr-bot/backend
npm install
```

### 2. Start the backend

```bash
npm run dev
# Runs on http://localhost:5000
```

### 3. Install frontend dependencies

```bash
cd hr-bot/frontend
npm install
```

### 4. Start the frontend

```bash
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

### Chat
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Send a message |
| GET | `/api/chat/history/:session_id` | Get chat history |
| GET | `/api/chat/sessions` | List all sessions |
| DELETE | `/api/chat/history/:session_id` | Clear session |

### Leaves
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/leaves` | Create leave request |
| GET | `/api/leaves` | List all leaves |
| GET | `/api/leaves/:id` | Get leave by ID |
| PATCH | `/api/leaves/:id/status` | Update status |
| DELETE | `/api/leaves/:id` | Delete leave |

### Expenses
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/expenses` | Create expense claim |
| GET | `/api/expenses` | List all expenses |
| GET | `/api/expenses/:id` | Get expense by ID |
| PATCH | `/api/expenses/:id/status` | Update status |
| DELETE | `/api/expenses/:id` | Delete expense |
