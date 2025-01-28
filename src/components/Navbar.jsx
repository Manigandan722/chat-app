import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import GradientText from "./GradientText";

function Navbar() {
  const { user, logout } = useContext(AuthContext); // Access user and logout method

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">Chat App</h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="px-3"
              >
                Welcome, {user.username}
              </GradientText>
             
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
