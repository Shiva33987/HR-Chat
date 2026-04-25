const ChatModel = require("../models/chatModel");
const LeaveModel = require("../models/leaveModel");
const ExpenseModel = require("../models/expenseModel");

// HR policy knowledge base
const HR_POLICIES = {
  annual_leave: {
    days: 20,
    description: "Full-time employees are entitled to 20 days of annual leave per year. Leave must be approved by your manager at least 2 weeks in advance."
  },
  sick_leave: {
    days: 10,
    description: "Employees are entitled to 10 days of paid sick leave per year. A medical certificate is required for absences longer than 3 consecutive days."
  },
  maternity_leave: {
    days: 90,
    description: "Female employees are entitled to 90 days of paid maternity leave. Must be applied at least 4 weeks before the expected due date."
  },
  paternity_leave: {
    days: 10,
    description: "Male employees are entitled to 10 days of paid paternity leave within 30 days of the child's birth."
  },
  personal_leave: {
    days: 5,
    description: "Employees may take up to 5 days of personal leave per year for personal matters. Requires manager approval."
  },
  expense_policy: {
    description: "Expense claims must be submitted within 30 days of the expense. Receipts are required for all claims above $25. Travel expenses require pre-approval for amounts over $500."
  },
  remote_work: {
    description: "Employees may work remotely up to 2 days per week with manager approval. Full remote arrangements require HR and department head approval."
  },
  working_hours: {
    description: "Standard working hours are 9 AM to 6 PM, Monday to Friday. Flexible working arrangements can be discussed with your manager."
  }
};

// Simple intent detection
function detectIntent(message) {
  const lower = message.toLowerCase();

  if (/(apply|request|submit|take|book).*(leave|vacation|time off|holiday|sick|annual)/i.test(message)) {
    return "apply_leave";
  }
  if (/(submit|claim|request|file).*(expense|reimbursement|receipt)/i.test(message)) {
    return "submit_expense";
  }
  if (/(check|view|see|show|list|status|my).*(leave|request|application)/i.test(message)) {
    return "check_leave_status";
  }
  if (/(check|view|see|show|list|status|my).*(expense|claim|reimbursement)/i.test(message)) {
    return "check_expense_status";
  }
  if (/(policy|policies|rule|guideline|entitlement|how many|how much|allowed)/i.test(message)) {
    return "ask_policy";
  }
  if (/(sick leave|annual leave|maternity|paternity|personal leave)/i.test(message)) {
    return "ask_policy";
  }
  if (/(remote|work from home|wfh)/i.test(message)) {
    return "ask_policy";
  }
  if (/(working hours|office hours|schedule)/i.test(message)) {
    return "ask_policy";
  }
  if (/(hello|hi|hey|help|what can you|what do you)/i.test(message)) {
    return "greeting";
  }

  return "general";
}

// Generate a contextual response
function generateResponse(intent, message, context = {}) {
  const lower = message.toLowerCase();

  switch (intent) {
    case "greeting":
      return {
        text: "Hello! I'm your HR Assistant. I can help you with:\n\n• **Apply for Leave** — Book annual, sick, or personal leave\n• **Submit Expense** — Claim reimbursements for work expenses\n• **HR Policies** — Ask about leave entitlements, remote work, working hours\n• **Check Status** — View your leave or expense requests\n\nWhat would you like to do today?",
        action: null
      };

    case "apply_leave":
      return {
        text: "I can help you apply for leave. Please fill out the leave request form below.",
        action: "open_leave_form"
      };

    case "submit_expense":
      return {
        text: "I can help you submit an expense claim. Please fill out the expense form below.",
        action: "open_expense_form"
      };

    case "check_leave_status":
      return {
        text: "To check your leave requests, I'll need your employee ID. Could you please provide it? Or you can view all your requests in the History section.",
        action: "check_leave"
      };

    case "check_expense_status":
      return {
        text: "To check your expense claims, I'll need your employee ID. Could you please provide it? Or you can view all your requests in the History section.",
        action: "check_expense"
      };

    case "ask_policy": {
      let policyText = "";

      if (/annual|vacation|holiday/i.test(message)) {
        policyText = `**Annual Leave Policy**\n${HR_POLICIES.annual_leave.description}\n\n📅 Entitlement: **${HR_POLICIES.annual_leave.days} days/year**`;
      } else if (/sick/i.test(message)) {
        policyText = `**Sick Leave Policy**\n${HR_POLICIES.sick_leave.description}\n\n🏥 Entitlement: **${HR_POLICIES.sick_leave.days} days/year**`;
      } else if (/maternity/i.test(message)) {
        policyText = `**Maternity Leave Policy**\n${HR_POLICIES.maternity_leave.description}\n\n👶 Entitlement: **${HR_POLICIES.maternity_leave.days} days**`;
      } else if (/paternity/i.test(message)) {
        policyText = `**Paternity Leave Policy**\n${HR_POLICIES.paternity_leave.description}\n\n👶 Entitlement: **${HR_POLICIES.paternity_leave.days} days**`;
      } else if (/personal/i.test(message)) {
        policyText = `**Personal Leave Policy**\n${HR_POLICIES.personal_leave.description}\n\n📋 Entitlement: **${HR_POLICIES.personal_leave.days} days/year**`;
      } else if (/expense|reimbursement/i.test(message)) {
        policyText = `**Expense Policy**\n${HR_POLICIES.expense_policy.description}`;
      } else if (/remote|wfh|work from home/i.test(message)) {
        policyText = `**Remote Work Policy**\n${HR_POLICIES.remote_work.description}`;
      } else if (/working hours|office hours|schedule/i.test(message)) {
        policyText = `**Working Hours Policy**\n${HR_POLICIES.working_hours.description}`;
      } else {
        policyText = `Here's a summary of our key HR policies:\n\n` +
          `📅 **Annual Leave**: ${HR_POLICIES.annual_leave.days} days/year\n` +
          `🏥 **Sick Leave**: ${HR_POLICIES.sick_leave.days} days/year\n` +
          `👶 **Maternity Leave**: ${HR_POLICIES.maternity_leave.days} days\n` +
          `👶 **Paternity Leave**: ${HR_POLICIES.paternity_leave.days} days\n` +
          `📋 **Personal Leave**: ${HR_POLICIES.personal_leave.days} days/year\n\n` +
          `Ask me about any specific policy for more details!`;
      }

      return { text: policyText, action: null };
    }

    default:
      return {
        text: "I'm here to help with HR-related queries. You can ask me about:\n\n• Leave policies and applications\n• Expense reimbursements\n• Company HR guidelines\n• Working hours and remote work policies\n\nWhat would you like to know?",
        action: null
      };
  }
}

const chatController = {
  // POST /api/chat
  async chat(req, res) {
    try {
      const { message, session_id } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }
      if (!session_id) {
        return res.status(400).json({ error: "session_id is required" });
      }

      // Save user message
      ChatModel.addMessage(session_id, "user", message.trim());

      // Detect intent and generate response
      const intent = detectIntent(message);
      const response = generateResponse(intent, message);

      // Save assistant response
      ChatModel.addMessage(session_id, "assistant", response.text);

      res.json({
        success: true,
        data: {
          message: response.text,
          action: response.action,
          intent
        }
      });
    } catch (err) {
      console.error("Error in chat:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/chat/history/:session_id
  async getHistory(req, res) {
    try {
      const history = ChatModel.getHistory(req.params.session_id);
      res.json({ success: true, data: history });
    } catch (err) {
      console.error("Error fetching chat history:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/chat/sessions
  async getSessions(req, res) {
    try {
      const sessions = ChatModel.getAllSessions();
      res.json({ success: true, data: sessions });
    } catch (err) {
      console.error("Error fetching sessions:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // DELETE /api/chat/history/:session_id
  async clearHistory(req, res) {
    try {
      ChatModel.clearSession(req.params.session_id);
      res.json({ success: true, message: "Chat history cleared" });
    } catch (err) {
      console.error("Error clearing chat history:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = chatController;
