// // import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
// // import { MainLayout } from "./components/MainLayout";
// // import { POSScreen } from "./screens/POSScreen";
// // import { LoginScreen } from "./screens/LoginScreen";
// // import { useFrappeAuth } from "frappe-react-sdk";
// // import { useEffect, JSX } from "react";

// // // ✅ Authentication Guard
// // const AuthGuard = ({ children }: { children: JSX.Element }) => {
// //   const { currentUser, isLoading, updateCurrentUser } = useFrappeAuth();

// //   useEffect(() => {
// //     updateCurrentUser(); // ✅ Calls `/api/method/frappe.auth.get_user_info`
// //   }, []);

// //   if (isLoading) {
// //     return <div className="flex justify-center items-center h-screen">Loading...</div>;
// //   }

// //   return currentUser ? children : <Navigate to="/login" />;
// // };

// // // ✅ Updated Router
// // export const router = createBrowserRouter(
// //   createRoutesFromElements(
// //     <>
// //       <Route path="/" element={<Navigate to="/trixapos" />} />
// //       <Route path="/login" element={<LoginScreen />} />
// //       <Route path="/trixapos" element={<AuthGuard><MainLayout /></AuthGuard>}>
// //         <Route index element={<POSScreen />} />
// //       </Route>
// //       <Route path="*" element={<div className="text-center p-10">404 - Page Not Found</div>} />
// //     </>
// //   ),
// //   { basename: "/trixapos" }
// // );


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
    path: "/login",
    element: <LoginScreen />
  },
  {
    path: "/unauthorized",
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
    // Catch-all route
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);