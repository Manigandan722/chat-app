import React, { useState, useEffect, useContext, useRef } from "react";
import io from "socket.io-client";
import axios from "../api/apiService";
import { AuthContext } from "../context/AuthContext";
import { Grid } from "react-loading-icons";
import SplitText from "./SplitText";
import ShinyText from "./ShinyText";
import GradientText from "./GradientText";

const socket = io("https://websocket-server-production-4b30.up.railway.app/", {
  transports: ["websocket", "polling"],
});

function ChatBox() {
  const { user } = useContext(AuthContext);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatGroup, setChatGroup] = useState("");
  const [newChatGroup, setNewChatGroup] = useState(""); // State for changing group
  const messagesEndRef = useRef(null); // Ref to manage auto-scrolling
  const [loading, setLoading] = useState(false);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted");
          } else {
            console.log("Notification permission denied");
          }
        });
      }
    } else {
      console.log("Your browser does not support notifications");
    }
  };

  // Function to trigger notification
  const triggerNotification = (message) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("New Message", {
        body: `${message.sender.username}: ${message.content}`,
        // Optional: Path to an icon
      });

      // Optional: Add click behavior
      notification.onclick = () => {
        window.open("https://chat-app-mani.vercel.app/"); // Open your chat page
      };
    }
  };

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!chatId) return;
    requestNotificationPermission();
    axios
      .get(`/api/chat/${chatId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((response) => {
        setMessages(response.data);
        scrollToBottom();
      })
      .catch((error) => {
        console.error("Failed to load messages:", error);
      });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
      triggerNotification(message);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    return () => {
      socket.off("message");
    };
  }, [chatId]);

  const sendMessage = () => {
    setLoading(true);

    if (!newMessage.trim()) return;

    axios
      .post(
        "/api/chat/send",
        { content: newMessage, chatId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((response) => {
        socket.emit("message", response.data);
        setNewMessage("");
        setLoading(false);
        scrollToBottom();
      })
      .catch((error) => {
        console.error("Failed to send message:", error);
      });
  };

  const joinChatGroup = () => {
    if (!chatGroup.trim()) {
      alert("Please enter a chat group name!");
      return;
    }
    setChatId(chatGroup.trim());
    setMessages([]);
  };

  // Handle changing the chat group
  const changeChatGroup = () => {
    if (!newChatGroup.trim()) {
      alert("Please enter a new chat group name!");
      return;
    }
    setChatGroup(newChatGroup.trim());
    setNewChatGroup(""); // Clear the new chat group input
    setMessages([]); // Clear messages for the new group
    setChatId(newChatGroup.trim()); // Switch to the new group
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      {chatId && (
        <header className="bg-blue-600 text-white py-4 px-6 shadow-md flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{`Group: ${chatId}`}</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newChatGroup}
              onChange={(e) => setNewChatGroup(e.target.value)}
              className="px-3 py-2 rounded-md text-white border-green-400 focus:outline-cyan-50 focus:ring-2 focus:ring-yellow-400"
              placeholder="New group name"
            />
            <button
              onClick={changeChatGroup}
              className="bg-yellow-500 text-sm px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Change Group
            </button>
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              Add a splash of color!
            </GradientText>
          </div>
        </header>
      )}

      {/* Chat Group Input */}
      {!chatId && (
        <div className="p-6">
          <input
            type="text"
            value={chatGroup}
            onChange={(e) => setChatGroup(e.target.value)}
            className="w-full px-4 py-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter chat group name"
          />
          <button
            onClick={joinChatGroup}
            className="mt-4 w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-all"
          >
            Join Group
          </button>
        </div>
      )}

      {/* Messages and Input */}
      {chatId && (
        <div className="flex flex-col flex-grow">
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 bg-white space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 max-w-xs lg:max-w-md rounded-lg  ${
                  msg.sender?.username === user.username
                    ? "bg-blue-500 text-white ml-auto drop-shadow-xl "
                    : "bg-gray-300 text-black mr-auto shadow-md "
                }`}
              >
                <p className="text-sm font-bold">
                  {msg.sender?.username === user.username
                    ? "You"
                    : msg.sender?.username || "Anonymous"}
                </p>
                {/* <p className="mt-2 text-base">{msg.content}</p> */}
                <SplitText
                  text={msg.content}
                  className=" text-center"
                  delay={50}
                  animationFrom={{
                    opacity: 0,
                    transform: "translate3d(0,50px,0)",
                  }}
                  animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
                  easing="easeOutCubic"
                  threshold={0.2}
                  rootMargin="-50px"
                  // onLetterAnimationComplete={handleAnimationComplete}
                />
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Auto-scroll target */}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-100 border-t shadow-md">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="flex-grow px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-200 hover:border hover:border-blue-600 transition-all disabled:opacity-50"
                disabled={loading} // Disable the button while loading
              >
                {loading ? (
                  <div className="relative w-6 h-6">
                  <div className="absolute border-4 border-t-transparent border-blue-500 rounded-full w-full h-full animate-spin"></div>
                </div>
                ) : (
                  <GradientText
                  colors={["#40ffaa", "#fa1707", "#07fa0f", "#4079ff", "#07c4fa"]}
                  animationSpeed={3}
                  showBorder={false}
                  className="custom-class"
                >
                   send
                </GradientText>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
