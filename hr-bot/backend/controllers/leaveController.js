const LeaveModel = require("../models/leaveModel");

// Calculate business days between two dates
function calcDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

const leaveController = {
  // POST /api/leaves
  async create(req, res) {
    try {
      const { employee_name, employee_id, leave_type, start_date, end_date, reason } = req.body;

      if (!employee_name || !employee_id || !leave_type || !start_date || !end_date) {
        return res.status(400).json({ error: "Missing required fields: employee_name, employee_id, leave_type, start_date, end_date" });
      }

      const validTypes = ["annual", "sick", "personal", "maternity", "paternity", "unpaid"];
      if (!validTypes.includes(leave_type)) {
        return res.status(400).json({ error: `Invalid leave_type. Must be one of: ${validTypes.join(", ")}` });
      }

      if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ error: "start_date must be before or equal to end_date" });
      }

      const days_count = calcDays(start_date, end_date);

      const leave = LeaveModel.create({
        employee_name,
        employee_id,
        leave_type,
        start_date,
        end_date,
        days_count,
        reason: reason || null
      });

      res.status(201).json({ success: true, data: leave });
    } catch (err) {
      console.error("Error creating leave:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/leaves
  async getAll(req, res) {
    try {
      const { employee_id, status, limit, offset } = req.query;
      const leaves = LeaveModel.findAll({
        employee_id,
        status,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      });
      res.json({ success: true, data: leaves, count: leaves.length });
    } catch (err) {
      console.error("Error fetching leaves:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/leaves/:id
  async getById(req, res) {
    try {
      const leave = LeaveModel.findById(req.params.id);
      if (!leave) return res.status(404).json({ error: "Leave request not found" });
      res.json({ success: true, data: leave });
    } catch (err) {
      console.error("Error fetching leave:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // PATCH /api/leaves/:id/status
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }

      const leave = LeaveModel.findById(req.params.id);
      if (!leave) return res.status(404).json({ error: "Leave request not found" });

      const updated = LeaveModel.updateStatus(req.params.id, status);
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error("Error updating leave status:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // DELETE /api/leaves/:id
  async delete(req, res) {
    try {
      const leave = LeaveModel.findById(req.params.id);
      if (!leave) return res.status(404).json({ error: "Leave request not found" });

      LeaveModel.delete(req.params.id);
      res.json({ success: true, message: "Leave request deleted" });
    } catch (err) {
      console.error("Error deleting leave:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/leaves/stats/:employee_id
  async getStats(req, res) {
    try {
      const stats = LeaveModel.getStats(req.params.employee_id);
      res.json({ success: true, data: stats });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = leaveController;
