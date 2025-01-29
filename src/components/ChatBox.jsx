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
      if (message.chatId === chatId) {
      const notification = new Notification("New Message", {
        body: `${message.sender.username}: ${message.content}`,
        // Optional: Path to an icon
      })

      notification.onclick = () => {
        window.open("https://chat-app-mani.vercel.app", "_blank"); // Open your chat page
      };
    };

      // Optional: Add click behavior
     
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
      // Only process the message if it's for the current active chat group
     
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
        // Only trigger notification if the sender is not the current user
        if (message.sender.username !== user.username) {
          triggerNotification(message);
        }
     
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
  // console.log(messages);

  const formatDate = (timestamp) => {
    const createdAt = new Date(timestamp);
    const now = new Date();

    // Get date parts
    const createdDate = createdAt.toDateString();
    const todayDate = now.toDateString();
    const yesterdayDate = new Date(
      now.setDate(now.getDate() - 1)
    ).toDateString();

    if (createdDate === todayDate) {
      return `Today, ${createdAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (createdDate === yesterdayDate) {
      return `Yesterday, ${createdAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return createdAt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      {chatId && (
        <header className="bg-blue-600 rounded-lg text-white py-4 px-4 md:px-6 shadow-md flex flex-wrap items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-0">{`Group: ${chatId}`}</h1>
          <div className="flex flex-wrap items-center space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              value={newChatGroup}
              onChange={(e) => setNewChatGroup(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-md text-white border border-gray-300 shadow-lg focus:border-cyan-500 focus:ring-yellow-400 outline-none"
              placeholder="New group name"
            />

            <button
              onClick={changeChatGroup}
              className="bg-yellow-500 text-sm px-4 py-2 rounded-md hover:bg-yellow-600 w-full md:w-auto"
            >
              Change Group
            </button>
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
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-3 h-[calc(100vh-120px)] max-h-full">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 md:p-4 max-w-[75%] sm:max-w-md rounded-xl shadow ${
                  msg.sender?.username === user.username
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-gray-800 mr-auto"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {msg.sender?.username === user.username
                      ? "You"
                      : msg.sender?.username || "Anonymous"}
                  </p>
                  <span
                    className={`text-xs ${
                      msg.sender?.username === user.username
                        ? "text-gray-100"
                        : msg.sender
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} className="mb-20" />{" "}
            {/* Auto-scroll target */}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-100 border-t shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="flex-grow px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-200 hover:border hover:border-blue-600 transition-all disabled:opacity-50 w-full sm:w-auto"
                disabled={loading} // Disable the button while loading
              >
                {loading ? (
                  <div className="relative w-6 h-6 mx-auto sm:mx-0">
                    <div className="absolute border-4 border-t-transparent border-blue-500 rounded-full w-full h-full animate-spin"></div>
                  </div>
                ) : (
                  <GradientText
                    colors={[
                      "#40ffaa",
                      "#fa1707",
                      "#07fa0f",
                      "#4079ff",
                      "#07c4fa",
                    ]}
                    animationSpeed={3}
                    showBorder={false}
                    className="custom-class"
                  >
                    Send
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
