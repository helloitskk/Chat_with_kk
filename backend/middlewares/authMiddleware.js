const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
//next to move over to next operation
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // token with start with bearer sdfdf so we have take off first bearer
      token = req.headers.authorization.split(" ")[1];
      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //return user without password
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      // console.log("in authorization catch block");
      // console.log(error.message);
      // console.log("token");
      // console.log(token);
      throw new Error("Not authorized ,token failed");
    }
  }
  // console.log("token");
  // console.log(token);
  if (!token) {
    res.status(401);

    throw new Error("Not authorized, no token");
  }
});
module.exports = { protect };
