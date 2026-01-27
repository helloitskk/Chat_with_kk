import { ChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/layout";
import SideDrawer from "../components/miscellanous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const ChatPage = () => {
  //currly braces is used for writng javascript in react
  //chatstate to import state form data layer context api
  const history = useHistory();
  const toast = useToast();

  const { user, notification, setNotification } = ChatState();
  const fetchNotifications = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      //creating new chat
      console.log(user._id);
      const { data } = await axios.get(
        `/api/message/notification/${user._id}`,
        config
      );
      console.log(data);
      setNotification(data.filter((n) => n.sender._id !== user._id));
    } catch (error) {
      toast({
        title: "Some Error has occured while fetching the notifications",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  useEffect(() => {
    // console.log(11);
    // const {data}
    if (user) {
      // console.log("homepage");
      // console.log(user);
      fetchNotifications();
    }
  }, [user]);
  //creating a parent state for updating chat in its childrens like mychat,chatbox
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="5">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
