import React, { useState, useEffect } from "react";
import { getLeaves, getExpenses, updateLeaveStatus, updateExpenseStatus, deleteLeave, deleteExpense } from "../api.js";
import "./HistoryPanel.css";

const TABS = [
  { id: "leaves", label: "Leave Requests" },
  { id: "expenses", label: "Expense Claims" }
];

const STATUS_COLORS = {
  pending: { bg: "#fef9c3", text: "#854d0e", label: "Pending" },
  approved: { bg: "#dcfce7", text: "#166534", label: "Approved" },
  rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" }
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span
      className="status-badge"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}

export default function HistoryPanel({ backendOnline }) {
  const [activeTab, setActiveTab] = useState("leaves");
  const [leaves, setLeaves] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (backendOnline !== false) loadData();
  }, [backendOnline]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [leavesRes, expensesRes] = await Promise.all([
        getLeaves(),
        getExpenses()
      ]);
      setLeaves(leavesRes.data || []);
      setExpenses(expensesRes.data || []);
    } catch (err) {
      setError("Cannot reach the backend. Make sure it's running: cd hr-bot/backend && node app.js");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveStatus(id, status) {
    setActionLoading(id + status);
    try {
      const { data } = await updateLeaveStatus(id, status);
      setLeaves(prev => prev.map(l => l.id === id ? data : l));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteLeave(id) {
    if (!confirm("Delete this leave request?")) return;
    setActionLoading(id + "delete");
    try {
      await deleteLeave(id);
      setLeaves(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExpenseStatus(id, status) {
    setActionLoading(id + status);
    try {
      const { data } = await updateExpenseStatus(id, status);
      setExpenses(prev => prev.map(e => e.id === id ? data : e));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteExpense(id) {
    if (!confirm("Delete this expense claim?")) return;
    setActionLoading(id + "delete");
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="history-panel">
      <header className="history-header">
        <h1 className="history-title">Request History</h1>
        <button className="refresh-btn" onClick={loadData} disabled={loading} aria-label="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "spin" : ""}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </header>

      <div className="history-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`history-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.id === "leaves" ? leaves.length : expenses.length}
            </span>
          </button>
        ))}
      </div>

      <div className="history-content" role="tabpanel">
        {loading && (
          <div className="history-empty">
            <div className="loading-spinner" aria-label="Loading" />
            <p>Loading...</p>
          </div>
        )}

        {error && !loading && (
          <div className="history-empty history-empty--error">
            <p>{error}</p>
            <button className="btn btn--primary" onClick={loadData}>Retry</button>
          </div>
        )}

        {!loading && !error && activeTab === "leaves" && (
          leaves.length === 0 ? (
            <div className="history-empty">
              <p>No leave requests yet.</p>
            </div>
          ) : (
            <div className="history-list">
              {leaves.map(leave => (
                <div key={leave.id} className="history-card">
                  <div className="history-card-header">
                    <div>
                      <span className="history-card-type">{leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave</span>
                      <span className="history-card-id">#{leave.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>

                  <div className="history-card-body">
                    <div className="history-card-row">
                      <span className="history-card-label">Employee</span>
                      <span className="history-card-value">{leave.employee_name} ({leave.employee_id})</span>
                    </div>
                    <div className="history-card-row">
                      <span className="history-card-label">Dates</span>
                      <span className="history-card-value">{formatDate(leave.start_date)} → {formatDate(leave.end_date)}</span>
                    </div>
                    <div className="history-card-row">
                      <span className="history-card-label">Duration</span>
                      <span className="history-card-value">{leave.days_count} business day(s)</span>
                    </div>
                    {leave.reason && (
                      <div className="history-card-row">
                        <span className="history-card-label">Reason</span>
                        <span className="history-card-value">{leave.reason}</span>
                      </div>
                    )}
                    <div className="history-card-row">
                      <span className="history-card-label">Submitted</span>
                      <span className="history-card-value">{formatDate(leave.created_at)}</span>
                    </div>
                  </div>

                  {leave.status === "pending" ? (
                    <div className="history-card-actions">
                      <button
                        className="action-btn action-btn--approve"
                        onClick={() => handleLeaveStatus(leave.id, "approved")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === leave.id + "approved" ? "..." : "Approve"}
                      </button>
                      <button
                        className="action-btn action-btn--reject"
                        onClick={() => handleLeaveStatus(leave.id, "rejected")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === leave.id + "rejected" ? "..." : "Reject"}
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDeleteLeave(leave.id)}
                        disabled={!!actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="history-card-actions">
                      <button
                        className="action-btn action-btn--reset"
                        onClick={() => handleLeaveStatus(leave.id, "pending")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === leave.id + "pending" ? "..." : "↩ Reset to Pending"}
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDeleteLeave(leave.id)}
                        disabled={!!actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {!loading && !error && activeTab === "expenses" && (
          expenses.length === 0 ? (
            <div className="history-empty">
              <p>No expense claims yet.</p>
            </div>
          ) : (
            <div className="history-list">
              {expenses.map(expense => (
                <div key={expense.id} className="history-card">
                  <div className="history-card-header">
                    <div>
                      <span className="history-card-type">{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</span>
                      <span className="history-card-id">#{expense.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <StatusBadge status={expense.status} />
                  </div>

                  <div className="history-card-body">
                    <div className="history-card-row">
                      <span className="history-card-label">Employee</span>
                      <span className="history-card-value">{expense.employee_name} ({expense.employee_id})</span>
                    </div>
                    <div className="history-card-row">
                      <span className="history-card-label">Amount</span>
                      <span className="history-card-value history-card-amount">{expense.currency} {parseFloat(expense.amount).toFixed(2)}</span>
                    </div>
                    <div className="history-card-row">
                      <span className="history-card-label">Receipt Date</span>
                      <span className="history-card-value">{formatDate(expense.receipt_date)}</span>
                    </div>
                    <div className="history-card-row">
                      <span className="history-card-label">Description</span>
                      <span className="history-card-value">{expense.description}</span>
                    </div>
                    <div className="history-card-row">
                      <span className="history-card-label">Submitted</span>
                      <span className="history-card-value">{formatDate(expense.created_at)}</span>
                    </div>
                  </div>

                  {expense.status === "pending" ? (
                    <div className="history-card-actions">
                      <button
                        className="action-btn action-btn--approve"
                        onClick={() => handleExpenseStatus(expense.id, "approved")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === expense.id + "approved" ? "..." : "Approve"}
                      </button>
                      <button
                        className="action-btn action-btn--reject"
                        onClick={() => handleExpenseStatus(expense.id, "rejected")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === expense.id + "rejected" ? "..." : "Reject"}
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={!!actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="history-card-actions">
                      <button
                        className="action-btn action-btn--reset"
                        onClick={() => handleExpenseStatus(expense.id, "pending")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === expense.id + "pending" ? "..." : "↩ Reset to Pending"}
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={!!actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
