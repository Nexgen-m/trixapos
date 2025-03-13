import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";

export function UnauthorizedScreen() {
  const navigate = useNavigate();
  const { logout } = useFrappeAuth();
  const location = useLocation();
  
  // Get the error message from location state or use default message
  const errorMessage = location.state?.error || "No POS Profile assigned to your account. Please contact your Supervisor.";
  
  const handleLogout = async () => {
    await logout();
    console.log("🔄 Logging out user and returning to login...");
    navigate("/login", { replace: true });
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
        <p className="text-lg mt-4">
          {errorMessage}
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}