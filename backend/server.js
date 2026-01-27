const express = require("express");
const { chats } = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");
dotenv.config();
connectDB();
const app = express();
// to tell backend to take json from frontend
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// deployment

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

//deployment

//api error handing
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
//starting a server
const server = app.listen(
  PORT,
  console.log(`yey server has started on port ${PORT} wow`.yellow.bold)
);
const io = require("socket.io")(server, {
  // close connection if user does not message for 60 sec to save bandwidth
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket io");
  // TAKING DATA FROM FRONTEND TO JOIN GROUP OR INDIVIDUAL,exclusive room to user who is logged in
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room:" + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not  defined or there");
    //if message is sent ini a group then we only have to send it to other no the one sending the message
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    //leave room created for that user after he goes to save bandwidth off it
    socket.leave(userData._id);
  });
});
