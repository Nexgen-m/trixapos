import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePOSProfile } from "../hooks/fetchers/usePOSProfile";

export function POSProfileCheck({ children }: { children: React.ReactNode }) {
  const { posProfile, isLoading, error } = usePOSProfile();
  const navigate = useNavigate();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    // Only run the check when the loading is complete
    if (!isLoading) {
      if (error || !posProfile) {
        console.error("❌ POS Profile error:", error);
        navigate("/unauthorized", { 
          replace: true,
          state: { error: error || "No POS Profile assigned to your account." }
        });
      } else if (posProfile.disabled === 1) {
        console.error("❌ POS Profile is disabled:", posProfile.name);
        navigate("/unauthorized", { 
          replace: true,
          state: { error: "Your assigned POS Profile is disabled. Please contact your administrator." }
        });
      } else {
        console.log("✅ Active POS Profile found:", posProfile.name);
        setProfileChecked(true);
      }
    }
  }, [isLoading, error, posProfile, navigate]);

  // Show a loading state while checking profile
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">
          Checking POS profile...
        </div>
      </div>
    );
  }

  // Only render children (MainLayout and its children) if profile check passed
  return profileChecked ? <>{children}</> : null;
}