const db = require("../db/database");

const UserModel = {
  findByEmail(email) {
    return db.get("users").find({ email }).value() || null;
  },

  findById(id) {
    return db.get("users").find({ id }).value() || null;
  }
};

module.exports = UserModel;
