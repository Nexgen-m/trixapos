import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { POSScreen } from "./screens/POSScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { useFrappeAuth } from "frappe-react-sdk";
import { useEffect,JSX } from "react";

// ✅ Authentication Guard
const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { currentUser, isLoading, updateCurrentUser } = useFrappeAuth();

  useEffect(() => {
    updateCurrentUser(); // ✅ Calls `/api/method/frappe.auth.get_user_info`
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

// ✅ Updated Router
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/trixapos" />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/trixapos" element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route index element={<POSScreen />} />
      </Route>
      <Route path="*" element={<div className="text-center p-10">404 - Page Not Found</div>} />
    </>
  ),
  { basename: "/trixapos" }
);
