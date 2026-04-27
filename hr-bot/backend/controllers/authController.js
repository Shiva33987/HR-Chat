const UserModel = require("../models/userModel");

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = UserModel.findByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ success: true, data: userWithoutPassword });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = authController;
