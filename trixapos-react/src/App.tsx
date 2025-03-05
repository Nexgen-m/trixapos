import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { FrappeProvider } from "frappe-react-sdk";

import { router } from "./routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FrappeProvider
        siteName={import.meta.env.VITE_SITENAME}
        socketPort={import.meta.env.VITE_SOCKET_PORT}
      >
        <RouterProvider router={router} />
      </FrappeProvider>
    </QueryClientProvider>
  );
}

export default App;