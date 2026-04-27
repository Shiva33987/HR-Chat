const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");

router.post("/", leaveController.create);
router.get("/", leaveController.getAll);
router.get("/stats/:employee_id", leaveController.getStats);
router.get("/balances/:employee_id", leaveController.getBalances);
router.get("/:id", leaveController.getById);
router.patch("/:id/status", leaveController.updateStatus);
router.delete("/:id", leaveController.delete);

module.exports = router;
