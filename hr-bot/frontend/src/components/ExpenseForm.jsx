import React, { useState } from "react";
import { createExpense } from "../api.js";
import "./Modal.css";

const CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals & Entertainment" },
  { value: "accommodation", label: "Accommodation" },
  { value: "equipment", label: "Equipment & Supplies" },
  { value: "training", label: "Training & Education" },
  { value: "other", label: "Other" }
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"];

const today = new Date().toISOString().split("T")[0];

export default function ExpenseForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    employee_name: "",
    employee_id: "",
    category: "travel",
    amount: "",
    currency: "USD",
    description: "",
    receipt_date: today
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.employee_name.trim()) errs.employee_name = "Name is required";
    if (!form.employee_id.trim()) errs.employee_id = "Employee ID is required";
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      errs.amount = "Enter a valid amount greater than 0";
    }
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.receipt_date) errs.receipt_date = "Receipt date is required";
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
      const { data } = await createExpense({ ...form, amount: parseFloat(form.amount) });
      onSuccess(data);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to submit expense claim" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="expense-form-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="expense-form-title" className="modal-title">Submit Expense Claim</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close form">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp_employee_name" className="form-label">Full Name <span aria-hidden="true">*</span></label>
              <input
                id="exp_employee_name"
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
              <label htmlFor="exp_employee_id" className="form-label">Employee ID <span aria-hidden="true">*</span></label>
              <input
                id="exp_employee_id"
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
            <label htmlFor="category" className="form-label">Category <span aria-hidden="true">*</span></label>
            <select
              id="category"
              name="category"
              className="form-input form-select"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount" className="form-label">Amount <span aria-hidden="true">*</span></label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.amount ? "form-input--error" : ""}`}
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
              {errors.amount && <span className="form-error" role="alert">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currency" className="form-label">Currency</label>
              <select
                id="currency"
                name="currency"
                className="form-input form-select"
                value={form.currency}
                onChange={handleChange}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="receipt_date" className="form-label">Receipt Date <span aria-hidden="true">*</span></label>
            <input
              id="receipt_date"
              name="receipt_date"
              type="date"
              className={`form-input ${errors.receipt_date ? "form-input--error" : ""}`}
              value={form.receipt_date}
              onChange={handleChange}
              max={today}
            />
            {errors.receipt_date && <span className="form-error" role="alert">{errors.receipt_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description <span aria-hidden="true">*</span></label>
            <textarea
              id="description"
              name="description"
              className={`form-input form-textarea ${errors.description ? "form-input--error" : ""}`}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the expense and business purpose..."
              rows={3}
            />
            {errors.description && <span className="form-error" role="alert">{errors.description}</span>}
          </div>

          {errors.submit && (
            <div className="form-error form-error--block" role="alert">{errors.submit}</div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
