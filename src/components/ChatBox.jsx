import React, { useState, useEffect, useContext, useRef } from "react";
import io from "socket.io-client";
import axios from "../api/apiService";
import { AuthContext } from "../context/AuthContext";
import GradientText from "./GradientText";
import logo from "../../public/logo.png";

const socket = io("https://websocket-server-production-4b30.up.railway.app/", {
  transports: ["websocket", "polling"],
});

function ChatBox() {
  const { user } = useContext(AuthContext);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatGroup, setChatGroup] = useState("");
  const [newChatGroup, setNewChatGroup] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const triggerNotification = (message) => {
    if (Notification.permission === "granted" && message.chat === chatId) {
      const notification = new Notification("New Message", {
        body: `${message.sender.username}: ${message.content}`,
        icon: logo,
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("New Message", {
          body: `${message.sender.username}: ${message.content}`,
          icon: logo,
          vibrate: [200, 100, 200],
          tag: message.chatId,
        });
      });

      notification.onclick = () => {
        window.open("https://chat-app-mani.vercel.app", "_blank");
      };
    }
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) =>
        console.log("Service Worker Registration Failed", error)
      );
    }
  }, []);

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
      if (message.chat === chatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();

        if (message.sender.username !== user.username) {
          triggerNotification(message);
        }
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

  // 🌐 ThingSpeak IoT Data Integration
  useEffect(() => {
    if (chatId !== "iot-data") return;

    const fetchThingSpeakData = async () => {
      try {
        const res = await fetch(
          "https://api.thingspeak.com/channels/2908951/fields/1.json?results=1"
        );
        const data = await res.json();
        const feed = data.feeds[0];

        if (feed) {
          const fakeMessage = {
            _id: `ts-${feed.entry_id}`,
            content: `🌡️ Sensor Reading: ${feed.field1}`,
            createdAt: feed.created_at,
            sender: {
              username: "ThingSpeakBot",
            },
            chat: "iot-data",
          };

          setMessages((prev) => {
            const exists = prev.find((msg) => msg._id === fakeMessage._id);
            if (exists) return prev;
            return [...prev, fakeMessage];
          });

          scrollToBottom();
        }
      } catch (error) {
        console.error("Error fetching ThingSpeak data:", error);
      }
    };

    fetchThingSpeakData();

    const interval = setInterval(fetchThingSpeakData, 8000);
    return () => clearInterval(interval);
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
        setLoading(false);
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

  const changeChatGroup = () => {
    if (!newChatGroup.trim()) {
      alert("Please enter a new chat group name!");
      return;
    }
    setChatGroup(newChatGroup.trim());
    setNewChatGroup("");
    setMessages([]);
    setChatId(newChatGroup.trim());
  };

  const formatDate = (timestamp) => {
    const createdAt = new Date(timestamp);
    const now = new Date();

    const createdDate = createdAt.toDateString();
    const todayDate = now.toDateString();
    const yesterdayDate = new Date(now.setDate(now.getDate() - 1)).toDateString();

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
        <header className="bg-blue-600 text-white py-4 px-4 md:px-6 shadow-md flex flex-wrap items-center justify-between rounded-md">
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-0">{`Group: ${chatId}`}</h1>
          <div className="flex flex-wrap items-center space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              value={newChatGroup}
              onChange={(e) => setNewChatGroup(e.target.value)}
              className="px-3 py-2 rounded-md text-white border border-gray-300 shadow-lg focus:border-cyan-500 focus:ring-yellow-400 outline-none"
              placeholder="New group name"
            />
            <button
              onClick={changeChatGroup}
              className="bg-yellow-500 text-sm px-4 py-2 rounded-md hover:bg-yellow-600"
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
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-3 h-[calc(100vh-120px)] max-h-full">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 md:p-4 max-w-[75%] sm:max-w-md rounded-xl shadow ${
                  msg.sender?.username === user.username
                    ? "bg-blue-500 text-white ml-auto"
                    : msg.sender?.username === "ThingSpeakBot"
                    ? "bg-green-200 text-black mr-auto"
                    : "bg-gray-200 text-gray-800 mr-auto"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {msg.sender?.username === user.username
                      ? "You"
                      : msg.sender?.username || "Anonymous"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} className="mb-20" />
          </div>

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
                className="flex-grow px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-200 hover:border hover:border-blue-600 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="relative w-6 h-6 mx-auto">
                    <div className="absolute border-4 border-t-transparent border-blue-500 rounded-full w-full h-full animate-spin"></div>
                  </div>
                ) : (
                  <GradientText
                    colors={["#40ffaa", "#fa1707", "#07fa0f", "#4079ff", "#07c4fa"]}
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
