import React, { useState } from "react";
import { createLeave } from "../api.js";
import "./Modal.css";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "unpaid", label: "Unpaid Leave" }
];

const today = new Date().toISOString().split("T")[0];

export default function LeaveForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    employee_name: "",
    employee_id: "",
    leave_type: "annual",
    start_date: today,
    end_date: today,
    reason: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.employee_name.trim()) errs.employee_name = "Name is required";
    if (!form.employee_id.trim()) errs.employee_id = "Employee ID is required";
    if (!form.start_date) errs.start_date = "Start date is required";
    if (!form.end_date) errs.end_date = "End date is required";
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      errs.end_date = "End date must be after start date";
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
      const { data } = await createLeave(form);
      onSuccess(data);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to submit leave request" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-form-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="leave-form-title" className="modal-title">Apply for Leave</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close form">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employee_name" className="form-label">Full Name <span aria-hidden="true">*</span></label>
              <input
                id="employee_name"
                name="employee_name"
                type="text"
                className={`form-input ${errors.employee_name ? "form-input--error" : ""}`}
                value={form.employee_name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.employee_name && <span className="form-error" role="alert">{errors.employee_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="employee_id" className="form-label">Employee ID <span aria-hidden="true">*</span></label>
              <input
                id="employee_id"
                name="employee_id"
                type="text"
                className={`form-input ${errors.employee_id ? "form-input--error" : ""}`}
                value={form.employee_id}
                onChange={handleChange}
                placeholder="EMP001"
              />
              {errors.employee_id && <span className="form-error" role="alert">{errors.employee_id}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="leave_type" className="form-label">Leave Type <span aria-hidden="true">*</span></label>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date" className="form-label">Start Date <span aria-hidden="true">*</span></label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                className={`form-input ${errors.start_date ? "form-input--error" : ""}`}
                value={form.start_date}
                onChange={handleChange}
              />
              {errors.start_date && <span className="form-error" role="alert">{errors.start_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_date" className="form-label">End Date <span aria-hidden="true">*</span></label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                className={`form-input ${errors.end_date ? "form-input--error" : ""}`}
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date}
              />
              {errors.end_date && <span className="form-error" role="alert">{errors.end_date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason <span className="form-label--optional">(optional)</span></label>
            <textarea
              id="reason"
              name="reason"
              className="form-input form-textarea"
              value={form.reason}
              onChange={handleChange}
              placeholder="Briefly describe the reason for your leave..."
              rows={3}
            />
          </div>

          {errors.submit && (
            <div className="form-error form-error--block" role="alert">{errors.submit}</div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
