import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { POSScreen } from "./screens/POSScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { useFrappeAuth } from "frappe-react-sdk";
import { JSX } from "react";

// Authentication Guard
const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { currentUser, isLoading } = useFrappeAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

// Detect the correct base path
const getBasePath = () => {
  return import.meta.env.MODE === "development" ? "/" : "/trixapos";
};

// ✅ Fix: Use createBrowserRouter instead of exporting <AppRouter>
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/trixapos" />} /> {/* Redirect root to /trixapos */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/trixapos" element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route index element={<POSScreen />} />
      </Route>
      <Route path="*" element={<div className="text-center p-10">404 - Page Not Found</div>} />
    </>
  ),
  { basename: getBasePath() }
);
