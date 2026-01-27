import { VStack } from "@chakra-ui/layout";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import React, { useState } from "react";
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
const Login = () => {
  const toast = useToast();
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const handleClick = () => setShow(!show);
  const submitHandler = async () => {
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Please enter all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error has Occured",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };
  return (
    <VStack spacing="5px" color="black">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            // changing type of field based of value of show
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            // it come from guest user credential if user add that set user se
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="orange"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      <Button
        varian="solid"
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={() => {
          setEmail("guest@new.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
// {"_id":"6220f120aa79c6e713436d6d","name":"Test Akhil","email":"Test_Akhil@gmail.com","pic":"http://res.cloudinary.com/uploadchatimage/image/upload/v1646326046/qyvmvdgywv3rd2mrkrxl.jpg","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMjBmMTIwYWE3OWM2ZTcxMzQzNmQ2ZCIsImlhdCI6MTY0NjMyNjA0OSwiZXhwIjoxNjQ3MTkwMDQ5fQ.pUF4oh_KeTFQtEomcYTbnWWvTUoH5rNYqZY6i5LF_co"}
