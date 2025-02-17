import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { FrappeProvider } from 'frappe-react-sdk'
import { router } from './routes'
function App() {
	return (
	  <FrappeProvider
	  	siteName={import.meta.env.VITE_FRAPPE_SITE_NAME}
        socketPort={import.meta.env.VITE_SOCKET_PORT}
      >
		<RouterProvider router={router} />
	  </FrappeProvider>
	);
  }

export default App
