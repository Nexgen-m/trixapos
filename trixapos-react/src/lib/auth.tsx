import { useFrappeAuth, useFrappeGetDoc } from "frappe-react-sdk";
import { useState, useEffect } from "react";

export function useAuth() {
  const { currentUser, isLoading: authLoading, login, logout } = useFrappeAuth();
  const [username, setUsername] = useState<string>("");

  // ✅ Fetch full user details from Frappe
  const { data: userDetails, error: userError } = useFrappeGetDoc(
    "User",
    currentUser || "", // Get user details based on logged-in user
    { fields: ["full_name"] }
  );

  useEffect(() => {
    if (userDetails?.full_name) {
      setUsername(userDetails.full_name);
    } else if (currentUser) {
      setUsername(currentUser);
    }
  }, [userDetails, currentUser]);

  // ✅ Function to Verify Password Before Logout
  const verifyUserPassword = async (password: string): Promise<boolean> => {
    try {
      // Use `login()` method to verify password (without saving session)
      await login({ username: currentUser || "", password });

      console.log("✅ Password verification successful.");
      return true;
    } catch (error) {
      console.error("❌ Password verification failed:", error);
      return false;
    }
  };

  // ✅ Function to Logout User
  const logoutUser = async () => {
    try {
      await logout(); // Clears session
      localStorage.clear();
      sessionStorage.clear();
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  return {
    username,
    authLoading,
    currentUser,
    verifyUserPassword,
    logoutUser,
  };
}
