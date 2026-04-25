export const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (err) {
    // Distinguish network errors (backend down) from API errors
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("NETWORK_ERROR");
    }
    throw err;
  }
}

// Health check
export const checkHealth = () =>
  fetch(`${BASE_URL}/health`).then(r => r.ok).catch(() => false);

// Chat
export const sendMessage = (message, session_id) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id })
  });

export const getChatHistory = (session_id) =>
  request(`/chat/history/${session_id}`);

export const getChatSessions = () =>
  request("/chat/sessions");

export const clearChatHistory = (session_id) =>
  request(`/chat/history/${session_id}`, { method: "DELETE" });

// Leaves
export const createLeave = (data) =>
  request("/leaves", { method: "POST", body: JSON.stringify(data) });

export const getLeaves = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/leaves${qs ? "?" + qs : ""}`);
};

export const updateLeaveStatus = (id, status) =>
  request(`/leaves/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

export const deleteLeave = (id) =>
  request(`/leaves/${id}`, { method: "DELETE" });

// Expenses
export const createExpense = (data) =>
  request("/expenses", { method: "POST", body: JSON.stringify(data) });

export const getExpenses = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/expenses${qs ? "?" + qs : ""}`);
};

export const updateExpenseStatus = (id, status) =>
  request(`/expenses/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

export const deleteExpense = (id) =>
  request(`/expenses/${id}`, { method: "DELETE" });
