import React, { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import axios from "axios";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import { toast } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  // this is our header component

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };
  const toast = useToast();
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Search Field cannot be empty",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    // console.log(user);
    try {
      // console.log(user);
      setLoading(true);
      // console.log(user);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // console.log(user);
      // console.log(user.token);

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
      // console.log(data);
    } catch (error) {
      // console.log(error.message);
      toast({
        title: "Some Error has occured!",
        description: "Could not load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      //creating new chat
      const { data } = await axios.post("api/chat", { userId }, config);
      //agar wo nayi chat h to current chats me append kr do
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      // to cloose the chat drawer once chat is loading
      onClose();
    } catch (error) {
      toast({
        title: "Some Error has occured while fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const removeNotifications = async () => {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    //creating new chat
    const chatId = selectedChat._id;
    const { data } = await axios.put(
      "api/message/notification",
      { chatId },
      config
    );
    setNotification(
      notification.filter((n) => n.chat._id !== selectedChat._id)
    );
  };
  useEffect(() => {
    if (selectedChat) {
      removeNotifications();
    }
  }, [selectedChat]);

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="orange"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i class="fas fa-search" aria-hidden="true"></i>
            {/* choti screen pe mat dikho ,md ya badi pe dikhao */}
            <Text d={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Let's Chat
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize="2xl" m={1} />
              {notification.length > 0 && (
                <span color="blue">{notification.length}</span>
              )}
            </MenuButton>
            {/* render all notifications */}
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}

              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    // click krte hi wo notification wali chat pe jaoo aur us notification ko current notificatin se hata do
                    setSelectedChat(notif.chat);

                    // setNotification(
                    //   notification.filter((n) => n.chat._id !== notif.chat._id)
                    // );
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${notif.sender.name}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              alignItems="center"
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
              Your Profile
            </MenuButton>

            <MenuList>
              <ProfileModal user={user}>
                {/* <MenuItem>My Profile</MenuItem> */}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
