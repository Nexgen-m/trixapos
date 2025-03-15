// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { LoginScreen } from "./screens/LoginScreen";
// import { POSScreen } from "./screens/POSScreen";
// import { UnauthorizedScreen } from "./screens/UnauthorizedScreen";
// import { POSProfileCheck } from "./components/POSProfileCheck";
// import { AuthGuard } from "./components/AuthGuard"; // Assuming you have an auth guard component

// function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginScreen />} />
//         <Route path="/unauthorized" element={<UnauthorizedScreen />} />
        
//         {/* Protected POS route with profile check */}
//         <Route 
//           path="/trixapos" 
//           element={
//             <AuthGuard> {/* This ensures user is logged in */}
//               <POSProfileCheck>
//                 <POSScreen />
//               </POSProfileCheck>
//             </AuthGuard>
//           } 
//         />
        
//         {/* Redirect root to POS */}
//         <Route path="/" element={<Navigate to="/trixapos" replace />} />
        
//         {/* Catch all route */}
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginScreen } from "./screens/LoginScreen";
import { POSScreen } from "./screens/POSScreen";
import { UnauthorizedScreen } from "./screens/UnauthorizedScreen";
import { POSProfileCheck } from "./components/POSProfileCheck";
import { AuthGuard } from "./components/AuthGuard";
import { MainLayout } from "./components/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/trixapos/login",
    element: <LoginScreen />
  },
  {
    path: "/trixapos/unauthorized",
    element: <UnauthorizedScreen />
  },
  {
    path: "/trixapos",
    element: (
      <AuthGuard>
        <POSProfileCheck>
          <MainLayout />
        </POSProfileCheck>
      </AuthGuard>
    ),
    children: [
      {
        index: true, // Default child route
        element: <POSScreen />
      },
      // Add other child routes here if needed
      // Example:
      // {
      //   path: "reports",
      //   element: <ReportsScreen />
      // },
    ]
  },
  {
    path: "/",
    element: <Navigate to="/trixapos" replace />
  },
  {
    // For old /login path - redirect to new path
    path: "/login",
    element: <Navigate to="/trixapos/login" replace />
  },
  {
    // For old /unauthorized path - redirect to new path
    path: "/unauthorized",
    element: <Navigate to="/trixapos/unauthorized" replace />
  },
  {
    // Catch-all route
    path: "*",
    element: <Navigate to="/trixapos/login" replace />
  }
]);