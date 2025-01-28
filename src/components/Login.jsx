import React, { useState, useContext } from "react";
import axios from "../api/apiService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const { login } = useContext(AuthContext); // Get login function from AuthContext
    const navigate = useNavigate(); // To redirect after login

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setIsLoading(true); // Start loading state
        try {
            const response = await axios.post("/api/auth/login", { email, password });
            
            // Save user data in AuthContext and localStorage
            const userData = response.data;
            login(userData); // Update AuthContext with user data
            localStorage.setItem("user", JSON.stringify(userData)); // Save user info
            localStorage.setItem("token", userData.token); // Save token

            navigate("/chat"); // Redirect to chat page
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Try again.");
        } finally {
            setIsLoading(false); // Stop loading state
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white p-6 rounded shadow-md"
            >
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full p-2 rounded ${
                        isLoading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                >
                    {isLoading ? "Loading..." : "Login"}
                </button>
                <p className="text-sm text-center mt-4">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-500 hover:underline">
                        Register
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Login;
