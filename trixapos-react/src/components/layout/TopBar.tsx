import React, { useEffect, useState } from "react";
import { Menu, Clock } from "lucide-react";
import { OptionsMenu } from "./OptionsMenu";
// import { useNavigate } from "react-router-dom";

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  username: string;
  route: string;
}

export function TopBar({ isSidebarOpen, setIsSidebarOpen, username, route }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  const isOrderPage = route === "/trixapos/OrderPage";

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString();
      const formattedDate = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentTime(`${formattedTime} | ${formattedDate}`);
    };

    updateClock(); // Initial call
    const interval = setInterval(updateClock, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="bg-blue-600 text-white flex items-center justify-between px-4 py-2 relative">
      {/* Left Side - Sidebar Toggle and Title */}
      <div className="flex items-center gap-4">
        {isOrderPage ? (<div className="hidden"></div>) : (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        ) }
        <span className="text-lg font-bold">TRIXAPOS</span>
      </div>

      {/* Centered Clock */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        <span>{currentTime}</span>
      </div>

      {/* Right Side - User Info and Settings */}
      <div className="flex items-center gap-4">
        <span>Welcome, {username}</span>
        <div className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          <OptionsMenu/>  {/* ✅ FIX: Wrapped in <div> instead of <button> */}
        </div>
      </div>
    </div>
  );
}
