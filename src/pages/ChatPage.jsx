import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";

function ChatPage() {
    const { user } = useContext(AuthContext); // Access user data
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login"); // Redirect to login if not authenticated
        }
    }, [user, navigate]);
  
    if (!user) {
        return null; // Prevent rendering if user is not authenticated
    }
   console.log(user);
    return (
        <div className="p-4 bg-gray-100">
            {/* <h1 className="text-2xl font-semibold mb-4">Welcome, {user.username}</h1> */}
            <ChatBox />
        </div>
    );
}

export default ChatPage;
