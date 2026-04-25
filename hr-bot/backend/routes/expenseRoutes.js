const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.post("/", expenseController.create);
router.get("/", expenseController.getAll);
router.get("/:id", expenseController.getById);
router.patch("/:id/status", expenseController.updateStatus);
router.delete("/:id", expenseController.delete);

module.exports = router;
