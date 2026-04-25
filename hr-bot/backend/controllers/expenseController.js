const ExpenseModel = require("../models/expenseModel");

const expenseController = {
  // POST /api/expenses
  async create(req, res) {
    try {
      const { employee_name, employee_id, category, amount, currency, description, receipt_date } = req.body;

      if (!employee_name || !employee_id || !category || !amount || !description || !receipt_date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const validCategories = ["travel", "meals", "accommodation", "equipment", "training", "other"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      const expense = ExpenseModel.create({
        employee_name,
        employee_id,
        category,
        amount: parseFloat(amount),
        currency: currency || "USD",
        description,
        receipt_date
      });

      res.status(201).json({ success: true, data: expense });
    } catch (err) {
      console.error("Error creating expense:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/expenses
  async getAll(req, res) {
    try {
      const { employee_id, status, limit, offset } = req.query;
      const expenses = ExpenseModel.findAll({
        employee_id,
        status,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      });
      res.json({ success: true, data: expenses, count: expenses.length });
    } catch (err) {
      console.error("Error fetching expenses:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/expenses/:id
  async getById(req, res) {
    try {
      const expense = ExpenseModel.findById(req.params.id);
      if (!expense) return res.status(404).json({ error: "Expense request not found" });
      res.json({ success: true, data: expense });
    } catch (err) {
      console.error("Error fetching expense:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // PATCH /api/expenses/:id/status
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }

      const expense = ExpenseModel.findById(req.params.id);
      if (!expense) return res.status(404).json({ error: "Expense request not found" });

      const updated = ExpenseModel.updateStatus(req.params.id, status);
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error("Error updating expense status:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // DELETE /api/expenses/:id
  async delete(req, res) {
    try {
      const expense = ExpenseModel.findById(req.params.id);
      if (!expense) return res.status(404).json({ error: "Expense request not found" });

      ExpenseModel.delete(req.params.id);
      res.json({ success: true, message: "Expense request deleted" });
    } catch (err) {
      console.error("Error deleting expense:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = expenseController;
