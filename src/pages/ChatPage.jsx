import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";

function ChatPage() {
    const { user, setUser } = useContext(AuthContext) || {}; // Safe fallback
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser?.(parsedUser); // Use optional chaining
                } catch (error) {
                    console.error("Failed to parse user from localStorage:", error);
                }
            } else {
                navigate("/login"); // Redirect to login if no user exists
            }
        }
    }, [user, navigate, setUser]);

    if (!user) {
        return null; // Prevent rendering if user is not authenticated
    }

    return (
        <div className="p-4 bg-gray-100">
            <ChatBox />
        </div>
    );
}

export default ChatPage;
