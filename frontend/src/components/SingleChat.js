import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Text } from "@chakra-ui/layout";
import {
  FormControl,
  IconButton,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellanous/ProfileModal";
import UpdateGroupChatModal from "./miscellanous/updateGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import animationData from "../animations/typing.json";

const ENDPOINT = "https://letuschat22.herokuapp.com/";
var socket, selectedChatCompare;
// chat page banae k liye  jispe baad me messages aayenge
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setnewMessage] = useState();
  const [socketConnected, setsocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      // console.log(messages);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Some Error has occured!",
        description: "Could not load Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setsocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);
  useEffect(() => {
    fetchMessages();
    //create backup of selectedChat state
    selectedChatCompare = selectedChat;
  }, [selectedChat]);
  console.log(notification, "------------------");
  // we want to run this usestate if every timestate changes
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        //give notification in case of agar wo chat nhi khuli h jisse notice nhi aaya h
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          //naya message aaya to chat fir fetch kro
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  const sendNotifications = async (content1, chatId, users) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/message/notification",
        {
          content: content1,
          chatId: chatId,
          users: users,
        },
        config
      );
    } catch (error) {
      toast({
        title: "Some Error has occured!",
        description: "Could not send the notifications",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      const content1 = newMessage;
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        //done before request to make ui more intiuitve as message is being sent make it empty
        setnewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        // console.log(data);
        socket.emit("new message", data);
        setMessages([...messages, data]);
        const users = JSON.stringify(selectedChat.users);
        sendNotifications(content1, selectedChat._id, users);
      } catch (error) {
        toast({
          title: "Some Error has occured!",
          description: "Could not send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  //this function runs every time user types submit it is based on onChange
  const typingHandler = (e) => {
    setnewMessage(e.target.value);
    // Typing Indicator Logic
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        // agar time difference over ho chuka ho and isse pehle typing ho rahi ho to
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                {
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                }
              </>
            )}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {/* messages will be here */}
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                {/* Messages */}
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <Box>
                  <span
                    style={{
                      backgroundColor: "white",
                      borderRadius: "20px",
                      padding: "5px 15px",
                      maxWidth: "75%",
                      marginLeft: "33px",
                      marginTop: "10px",
                      color: "green",
                    }}
                  >
                    ...Typing
                  </span>
                </Box>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} FontFamily="work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
