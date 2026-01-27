const express = require("express");
const { sendMessage, allMessages } = require("../controller/messageController");
const {
  sendNotifications,
  allNotifications,
  removeNotifications,
} = require("../controller/notificationController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();
router.route("/notification").post(protect, sendNotifications);
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/notification/:userId").get(protect, allNotifications);
router.route("/notification/").put(protect, removeNotifications);
module.exports = router;
