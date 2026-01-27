const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controller/chatController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();
//protect ka use kr rahe h unauthorized access se bachane k liye yaad rakhio is /chat pehle se append hoga
router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);
module.exports = router;
