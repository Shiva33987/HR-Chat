const db = require("../db/database");
const { v4: uuidv4 } = require("uuid");

const LeaveModel = {
  create(data) {
    const record = {
      id: uuidv4(),
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get("leave_requests").push(record).write();
    return record;
  },

  findById(id) {
    return db.get("leave_requests").find({ id }).value() || null;
  },

  findAll({ employee_id, status, limit = 50, offset = 0 } = {}) {
    let chain = db.get("leave_requests");
    if (employee_id) chain = chain.filter({ employee_id });
    if (status) chain = chain.filter({ status });
    return chain
      .orderBy(["created_at"], ["desc"])
      .slice(offset, offset + limit)
      .value();
  },

  updateStatus(id, status) {
    db.get("leave_requests")
      .find({ id })
      .assign({ status, updated_at: new Date().toISOString() })
      .write();
    return this.findById(id);
  },

  delete(id) {
    db.get("leave_requests").remove({ id }).write();
    return true;
  },

  getStats(employee_id) {
    const records = db.get("leave_requests").filter({ employee_id }).value();
    const stats = {};
    for (const r of records) {
      const key = `${r.leave_type}_${r.status}`;
      if (!stats[key]) stats[key] = { leave_type: r.leave_type, status: r.status, count: 0, total_days: 0 };
      stats[key].count++;
      stats[key].total_days += r.days_count;
    }
    return Object.values(stats);
  },
  
  getBalances(employee_id) {
    const balance = db.get("leave_balances").find({ employee_id }).value();
    if (!balance) {
      // Default balance if none exists
      return { employee_id, annual: 20, sick: 10, personal: 5 };
    }
    return balance;
  }
};

module.exports = LeaveModel;
