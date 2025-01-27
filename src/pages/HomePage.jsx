import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div className="flex items-center justify-center h-screen bg-blue-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to the Chat App</h1>
                <Link to="/chat">
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600">
                        Go to Chat
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
