const asyncHandler = require("express-async-handler");
const res = require("express/lib/response");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !password || !email) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  //   above user will be returned by user.create
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      //give jwt token to user
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Could not create User");
  }
});
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      //give jwt token to user
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});
///api/user giving data using serach query which is ?search=akhil for example
//allUsers me khood ko nhi dikhana kyoki hume baki groups and chat chahiye
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          // i means casee sensitive
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  //we want all user but not who is logged in so using ne and before using find we need to  authorize the user who is logged in and get his jwt token ye user protect middleware se aayega
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  // console.log(keyword);
  res.send(users);
});
module.exports = { registerUser, authUser, allUsers };
