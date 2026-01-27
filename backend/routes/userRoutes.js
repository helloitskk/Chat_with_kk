const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controller/userController");
const router = express.Router();
// // router.route for multiple request chaining
// go through protect middle ware before allUsers
router.route("/").post(registerUser).get(protect, allUsers);
// // another way of writing same thing without multiple chaining
router.post("/login", authUser);
module.exports = router;
