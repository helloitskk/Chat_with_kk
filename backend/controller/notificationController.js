const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModels");
const Notifications = require("../models/notificationModel");
const User = require("../models/userModel");
const sendNotifications = expressAsyncHandler(async (req, res) => {
  //   console.log("request");
  //   console.log(req);
  //   return res.json({ akhil: "akhil" });
  const { content, chatId, users } = req.body;
  if (!content || !chatId || !users) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newNotification = {
    //   ye teeno fields ek message me hongi as i made in messageModel
    sender: req.user._id,
    content: content,
    chat: chatId,
    users: JSON.parse(req.body.users),
    // users: users,
  };
  // console.log("start");
  // console.log(chatId);
  try {
    var notification = await Notifications.create(newNotification);
    notification = await notification.populate("sender", "name pic");
    notification = await notification.populate("chat");
    notification = await User.populate(notification, {
      path: "chat.users",
      select: "name pic email",
    });

    // console.log(content);
    res.json(notification);
  } catch (error) {
    res.status(400);
    throw newError(error.message);
  }
});
const allNotifications = expressAsyncHandler(async (req, res) => {
  // console.log(req.user._id);
  // console.log(req);
  try {
    // console.log(req.params.userId);
    // console.log(req.user._id);

    const notifications = await Notifications.find({
      users: { $elemMatch: { $eq: req.params.userId } },
    })
      .populate("sender", "name pic email")
      .populate("chat");
    // // console.log(notifications);

    res.status(200).send(notifications);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw newError(error.message);
  }
});
const removeNotifications = expressAsyncHandler(async (req, res) => {
  const { chatId } = req.body;
  console.log(req.user._id);

  const removed = await Notifications.updateMany(
    { chat: chatId },
    {
      $pull: { users: req.user._id },
    },
    {
      new: true,
    }
  );
  if (!removed) {
    res.status(404);
    throw new Error("Notification with this user Not Found");
  } else {
    res.json(removed);
  }
});
module.exports = { sendNotifications, allNotifications, removeNotifications };
