import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import MessageNotification from "./components/MessageNotification";
import './App.css'

function App() {
    return (
      <>
      <Navbar />
        <Router>
            <div className="bg-gray-100 min-h-screen">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
            <MessageNotification />
        </Router>
        </>
    );
}

export default App;
