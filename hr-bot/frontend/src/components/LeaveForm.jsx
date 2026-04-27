import React, { useState, useEffect } from "react";
import { createLeave, getLeaveBalances } from "../api.js";
import "./Modal.css";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "unpaid", label: "Unpaid Leave" }
];

const Icons = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  ),
  ID: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect></svg>
  )
};

const today = new Date().toISOString().split("T")[0];

export default function LeaveForm({ onClose, onSuccess, user }) {
  const [balances, setBalances] = useState(null);
  const [pendingCounts, setPendingCounts] = useState({});
  const [form, setForm] = useState({
    employee_name: user?.name || "",
    employee_id: user?.id || "",
    leave_type: "annual",
    start_date: today,
    end_date: today,
    reason: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form with user prop when it changes
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        employee_name: user.name || prev.employee_name,
        employee_id: user.id || prev.employee_id
      }));
    }
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const [balRes, leavesRes] = await Promise.all([
          getLeaveBalances(user.id),
          import("../api").then(api => api.getLeaves())
        ]);
        
        setBalances(balRes.data);
        const employeeLeaves = (leavesRes.data || []).filter(l => l.employee_id === user.id);
        const counts = {
          annual: employeeLeaves.filter(l => l.leave_type === 'annual' && l.status === 'pending').length,
          sick: employeeLeaves.filter(l => l.leave_type === 'sick' && l.status === 'pending').length,
          personal: employeeLeaves.filter(l => l.leave_type === 'personal' && l.status === 'pending').length
        };
        setPendingCounts(counts);
      } catch (err) {
        console.error("Failed to fetch form data", err);
      }
    }
    fetchData();
  }, [user?.id]);

  const validate = () => {
    const errs = {};
    if (!form.employee_name.trim()) errs.employee_name = "Full name is required";
    if (!form.employee_id.trim()) errs.employee_id = "Employee ID is required";
    if (!form.start_date) errs.start_date = "Start date is required";
    if (!form.end_date) errs.end_date = "End date is required";
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      errs.end_date = "End date cannot be before start date";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      if (balances) {
        const type = form.leave_type;
        const available = balances[type] || 0;
        const d1 = new Date(form.start_date);
        const d2 = new Date(form.end_date);
        let requested = 0;
        const cur = new Date(d1);
        while (cur <= d2) {
          if (cur.getDay() !== 0 && cur.getDay() !== 6) requested++;
          cur.setDate(cur.getDate() + 1);
        }

        if (requested > available) {
          setErrors({ submit: `Insufficient balance for ${type} leave. Available: ${available} days. Requested: ${requested} days.` });
          setSubmitting(false);
          return;
        }
      }

      const { data } = await createLeave(form);
      onSuccess(data);
    } catch (err) {
      setErrors({ submit: err.message || "An error occurred during submission" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-form-title">
      <div className="modal">
        <div className="modal-header">
          <div className="header-top">
            <h2 id="leave-form-title" className="modal-title">Request Absence</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <Icons.Close />
            </button>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employee_name" className="form-label">
                <Icons.User /> Full Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="employee_name"
                name="employee_name"
                type="text"
                className={`form-input ${errors.employee_name ? "form-input--error" : ""}`}
                value={form.employee_name}
                onChange={handleChange}
                placeholder="Name loading..."
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="employee_id" className="form-label">
                <Icons.ID /> Employee ID <span aria-hidden="true">*</span>
              </label>
              <input
                id="employee_id"
                name="employee_id"
                type="text"
                className={`form-input ${errors.employee_id ? "form-input--error" : ""}`}
                value={form.employee_id}
                onChange={handleChange}
                placeholder="ID loading..."
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="leave_type" className="form-label">Absence Category <span aria-hidden="true">*</span></label>
            <select
              id="leave_type"
              name="leave_type"
              className="form-input form-select"
              value={form.leave_type}
              onChange={handleChange}
            >
              {LEAVE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {pendingCounts[form.leave_type] > 0 && (
              <div className="form-pending-info">
                You currently have {pendingCounts[form.leave_type]} pending request(s) for {LEAVE_TYPES.find(t => t.value === form.leave_type)?.label}.
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date" className="form-label">
                <Icons.Calendar /> Start Date <span aria-hidden="true">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                className={`form-input ${errors.start_date ? "form-input--error" : ""}`}
                value={form.start_date}
                onChange={handleChange}
              />
              {errors.start_date && <span className="form-error">{errors.start_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_date" className="form-label">
                <Icons.Calendar /> End Date <span aria-hidden="true">*</span>
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                className={`form-input ${errors.end_date ? "form-input--error" : ""}`}
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date}
              />
              {errors.end_date && <span className="form-error">{errors.end_date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason" className="form-label">Justification <span className="form-label--optional">(Optional)</span></label>
            <textarea
              id="reason"
              name="reason"
              className="form-input form-textarea"
              value={form.reason}
              onChange={handleChange}
              placeholder="Please provide a brief justification for your absence request..."
              rows={4}
            />
          </div>

          {errors.submit && (
            <div className="form-error form-error--block" role="alert">
              <strong>Submission Error:</strong> {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


