import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext); // Access user and logout method

    return (
        <nav className="p-4 bg-blue-500 text-white flex justify-between">
            <h1 className="text-lg font-bold">Chat App</h1>
            <div>
                {user ? (
                    <button
                        onClick={logout}
                        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                ) : (
                    <a href="/login" className="bg-white text-blue-500 px-4 py-2 rounded">
                        Login
                    </a>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
