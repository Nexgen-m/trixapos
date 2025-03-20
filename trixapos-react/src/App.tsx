import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { FrappeProvider } from "frappe-react-sdk";

import { router } from "./routes";
import { usePOSStore } from "./hooks/Stores/usePOSStore";

const queryClient = new QueryClient();

function App() {
  // initialize the heldOrders state from IndexedDB when the app loads
  const initializeHeldOrders = usePOSStore(
    (state) => state.initializeHeldOrders
  );
  useEffect(() => {
    initializeHeldOrders();
  }, [initializeHeldOrders]);

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
