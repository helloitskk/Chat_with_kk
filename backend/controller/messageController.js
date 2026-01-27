const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModels");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const sendMessage = expressAsyncHandler(async (req, res) => {
  //   console.log("request");
  //   console.log(req);

  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  var newMessage = {
    //   ye teeno fields ek message me hongi as i made in messageModel
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  // console.log("start");
  // console.log(chatId);
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    // console.log(message);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw newError(error.message);
  }
});
const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw newError(error.message);
  }
});
module.exports = { sendMessage, allMessages };
