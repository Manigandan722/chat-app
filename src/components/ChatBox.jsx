import React, { useState, useEffect, useContext, useRef } from "react";
import io from "socket.io-client";
import axios from "../api/apiService";
import { AuthContext } from "../context/AuthContext";

const socket = io("https://websocket-server-production-4b30.up.railway.app/", {
    transports: ["websocket", "polling"],
});

function ChatBox() {
    const { user } = useContext(AuthContext);
    const [chatId, setChatId] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatGroup, setChatGroup] = useState("");
    const messagesEndRef = useRef(null); // Ref to manage auto-scrolling

    // Auto-scroll to the latest message
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (!chatId) return;

        // Load initial messages
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
            });

        // Listen for new messages
        socket.on("message", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            scrollToBottom();
        });

        // Cleanup on unmount
        return () => {
            socket.off("message");
            socket.disconnect();
        };
    }, [chatId]);

    const sendMessage = () => {
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

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-500 text-white p-4">
                <div className="text-xl font-bold">
                    {chatId ? `Group: ${chatId}` : "Join a Chat Group"}
                </div>
            </div>

            {/* Chat Group Input */}
            {!chatId && (
                <div className="p-4">
                    <input
                        type="text"
                        value={chatGroup}
                        onChange={(e) => setChatGroup(e.target.value)}
                        className="border p-2 rounded w-full"
                        placeholder="Enter chat group name"
                    />
                    <button
                        onClick={joinChatGroup}
                        className="bg-green-500 text-white px-4 py-2 mt-2 rounded hover:bg-green-600 w-full"
                    >
                        Join Group
                    </button>
                </div>
            )}

            {/* Messages */}
            {chatId && (
                <div className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow overflow-y-auto p-4 bg-white">
                        {messages.map((msg, idx) => (
                            <div
                            key={idx}
                            className={`p-3 rounded-lg mb-4 ${
                                msg.sender?.username === user.username
                                    ? "bg-gradient-to-r from-orange-000 to-teal-700 text-white self-end text-right"
                                    : "bg-gradient-to-r from-amber-700 to-indigo-100 self-start text-left text-white"
                            }`}
                        ><div>
                                <strong>{msg.sender?.username === user.username ?"You":""|| msg.sender?.username|| "Anonymous"}:</strong>
                                <p className=""> {msg.content}</p>
                               
                            </div>
                                
                            </div>
                        ))}
                        <div ref={messagesEndRef} className="mb-16" /> {/* Auto-scroll target */}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="border flex-grow p-2 rounded"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage(); // Trigger sendMessage when Enter is pressed
                                    }
                                }}
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBox;
