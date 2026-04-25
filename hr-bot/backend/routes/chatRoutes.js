const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/", chatController.chat);
router.get("/sessions", chatController.getSessions);
router.get("/history/:session_id", chatController.getHistory);
router.delete("/history/:session_id", chatController.clearHistory);

module.exports = router;
