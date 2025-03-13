import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useFrappeAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Checking authentication...</div>;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
}