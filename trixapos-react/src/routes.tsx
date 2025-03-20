// import React from "react";
// import { createBrowserRouter, Navigate } from "react-router-dom";
// import { LoginScreen } from "./screens/LoginScreen";
// import { POSScreen } from "./screens/POSScreen";
// import { UnauthorizedScreen } from "./screens/UnauthorizedScreen";
// import { POSProfileCheck } from "./components/POSProfileCheck";
// import { AuthGuard } from "./components/AuthGuard";
// import { MainLayout } from "./components/MainLayout";
// import { OrderPage } from "./screens/OrdersPage";

// export const router = createBrowserRouter([
//   {
//     path: "/trixapos/login",
//     element: <LoginScreen />
//   },
//   {
//     path: "/trixapos/unauthorized",
//     element: <UnauthorizedScreen />
//   },
//   {
//     path: "/trixapos",
//     element: (
//       <AuthGuard>
//         <POSProfileCheck>
//           <MainLayout />
//         </POSProfileCheck>
//       </AuthGuard>
//     ),
//     children: [
//       {
//         index: true, // Default child route
//         element: <POSScreen />
//       },
//       {
//         // index: true, // Default child route
//         path: "/trixapos/OrderPage",
//         element: <OrderPage />
//       },
//       // {
//       //   // index: true, // Default child route
//       //   path: "/trixapos/OrderPage",
//       //   element: <OrderPage />
//       // },
//       // Add other child routes here if needed
//       // Example:
//       // {
//       //   path: "reports",
//       //   element: <ReportsScreen />
//       // },
//     ]
//   },

//   {
//     path: "/",
//     element: <Navigate to="/trixapos" replace />
//   },
//   {
//     // For old /login path - redirect to new path
//     path: "/login",
//     element: <Navigate to="/trixapos/login" replace />
//   },
//   {
//     // For old /unauthorized path - redirect to new path
//     path: "/unauthorized",
//     element: <Navigate to="/trixapos/unauthorized" replace />
//   },
//   {
//     // Catch-all route
//     path: "*",
//     element: <Navigate to="/trixapos/login" replace />
//   }
// ]);

import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginScreen } from "./screens/LoginScreen";
import { POSScreen } from "./screens/POSScreen";
import { VerticalPOSScreen } from "./screens/VerticalPOSScreen"; // Added Vertical Screen
import { UnauthorizedScreen } from "./screens/UnauthorizedScreen";
import { POSProfileCheck } from "./components/POSProfileCheck";
import { AuthGuard } from "./components/AuthGuard";
import { MainLayout } from "./components/MainLayout";
import { OrderScreen } from "./screens/OrderScreen";

export const router = createBrowserRouter([
  {
    path: "/trixapos/login",
    element: <LoginScreen />,
  },
  {
    path: "/trixapos/unauthorized",
    element: <UnauthorizedScreen />,
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
        index: true, // Default route
        element: <POSScreen />,
      },
     
      // {
      //   // index: true, // Default child route
      //   path: "/trixapos/OrderPage",
      //   element: <OrderPage />
      // },
      // Add other child routes here if needed
      // Example:
      // {
      //   path: "reports",
      //   element: <ReportsScreen />
      // },
      {
        path: "vertical", // New Vertical POS Route
        element: <VerticalPOSScreen />,
      },
    ],
  },
  {
    path: "/trixapos/OrderScreen",
    element: <OrderScreen />,
  },

  {
    path: "/",
    element: <Navigate to="/trixapos" replace />,
  },
  {
    path: "/login",
    element: <Navigate to="/trixapos/login" replace />,
  },
  {
    path: "/unauthorized",
    element: <Navigate to="/trixapos/unauthorized" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/trixapos/login" replace />,
  },
]);
