const db = require("../db/database");
const { v4: uuidv4 } = require("uuid");

const ExpenseModel = {
  create(data) {
    const record = {
      id: uuidv4(),
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get("expense_requests").push(record).write();
    return record;
  },

  findById(id) {
    return db.get("expense_requests").find({ id }).value() || null;
  },

  findAll({ employee_id, status, limit = 50, offset = 0 } = {}) {
    let chain = db.get("expense_requests");
    if (employee_id) chain = chain.filter({ employee_id });
    if (status) chain = chain.filter({ status });
    return chain
      .orderBy(["created_at"], ["desc"])
      .slice(offset, offset + limit)
      .value();
  },

  updateStatus(id, status) {
    db.get("expense_requests")
      .find({ id })
      .assign({ status, updated_at: new Date().toISOString() })
      .write();
    return this.findById(id);
  },

  delete(id) {
    db.get("expense_requests").remove({ id }).write();
    return true;
  }
};

module.exports = ExpenseModel;
