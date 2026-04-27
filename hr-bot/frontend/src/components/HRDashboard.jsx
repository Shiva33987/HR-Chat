import React, { useState, useEffect } from "react";
import { getLeaves, getExpenses, updateLeaveStatus, updateExpenseStatus } from "../api.js";
import "./HRDashboard.css";

const STATUS_COLORS = {
  pending: { bg: "rgba(234, 179, 8, 0.1)", text: "#eab308", label: "Pending Review" },
  approved: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", label: "Approved" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", label: "Rejected" }
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className="hr-status-pill" style={{ background: s.bg, color: s.text }}>
      <span className="status-dot" style={{ background: s.text }} />
      {s.label}
    </span>
  );
}

export default function HRDashboard({ backendOnline }) {
  const [data, setData] = useState({ leaves: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leaves");

  useEffect(() => {
    if (backendOnline !== false) loadData();
  }, [backendOnline]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [l, e] = await Promise.all([getLeaves(), getExpenses()]);
      setData({ leaves: l.data || [], expenses: e.data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (type, id, status) => {
    try {
      if (type === "leave") {
        const { data: updated } = await updateLeaveStatus(id, status);
        setData(prev => ({ ...prev, leaves: prev.leaves.map(item => item.id === id ? updated : item) }));
      } else {
        const { data: updated } = await updateExpenseStatus(id, status);
        setData(prev => ({ ...prev, expenses: prev.expenses.map(item => item.id === id ? updated : item) }));
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const stats = {
    pendingAnnual: data.leaves.filter(l => l.status === "pending" && l.leave_type === "annual").length,
    pendingSick: data.leaves.filter(l => l.status === "pending" && l.leave_type === "sick").length,
    approvedLeaves: data.leaves.filter(l => l.status === "approved").length,
    rejected: data.leaves.filter(l => l.status === "rejected").length + data.expenses.filter(e => e.status === "rejected").length,
    total: data.leaves.length + data.expenses.length
  };

  return (
    <div className="hr-dashboard">
      <header className="hr-dash-header">
        <div className="header-text">
          <h1>Management Command Center</h1>
          <p>Review and approve employee requests with clinical precision.</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Pending</span>
            <span className="stat-value text-yellow">
              {data.leaves.filter(l => l.status === "pending").length + data.expenses.filter(e => e.status === "pending").length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Approved Total</span>
            <span className="stat-value text-green">
              {data.leaves.filter(l => l.status === "approved").length + data.expenses.filter(e => e.status === "approved").length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Applications</span>
            <span className="stat-value text-purple">{data.leaves.length + data.expenses.length}</span>
          </div>
        </div>
      </header>

      <div className="hr-content-card">
        <div className="hr-tabs">
          <button className={`hr-tab ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
            Leave Management <span>{data.leaves.length}</span>
          </button>
          <button className={`hr-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
            Expense Claims <span>{data.expenses.length}</span>
          </button>
        </div>

        <div className="hr-table-wrapper">
          {activeTab === 'leaves' ? (
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.leaves.map(leave => (
                  <tr key={leave.id}>
                    <td>
                      <div className="emp-info">
                        <span className="emp-name">
                          {leave.employee_name}
                          {data.leaves.filter(l => l.employee_id === leave.employee_id && l.status === 'pending').length > 0 && (
                            <span className="pending-badge-mini">
                              {data.leaves.filter(l => l.employee_id === leave.employee_id && l.status === 'pending').length} Pending
                            </span>
                          )}
                        </span>
                        <span className="emp-id">{leave.employee_id}</span>
                      </div>
                    </td>
                    <td className="capitalize">{leave.leave_type}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>{leave.days_count} Days</td>
                    <td className="table-desc">{leave.reason || "—"}</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>
                      {leave.status === 'pending' && (
                        <div className="row-actions">
                          <button className="btn-approve" onClick={() => handleStatusChange('leave', leave.id, 'approved')}>Approve</button>
                          <button className="btn-reject" onClick={() => handleStatusChange('leave', leave.id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>
                      <div className="emp-info">
                        <span className="emp-name">
                          {expense.employee_name}
                          {data.leaves.filter(l => l.employee_id === expense.employee_id && l.status === 'pending').length > 0 && (
                            <span className="pending-badge-mini">
                              {data.leaves.filter(l => l.employee_id === expense.employee_id && l.status === 'pending').length} Pending
                            </span>
                          )}
                        </span>
                        <span className="emp-id">{expense.employee_id}</span>
                      </div>
                    </td>
                    <td className="capitalize">{expense.category}</td>
                    <td className="font-bold">{expense.currency} {expense.amount}</td>
                    <td className="table-desc">{expense.description}</td>
                    <td><StatusBadge status={expense.status} /></td>
                    <td>
                      {expense.status === 'pending' && (
                        <div className="row-actions">
                          <button className="btn-approve" onClick={() => handleStatusChange('expense', expense.id, 'approved')}>Approve</button>
                          <button className="btn-reject" onClick={() => handleStatusChange('expense', expense.id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
