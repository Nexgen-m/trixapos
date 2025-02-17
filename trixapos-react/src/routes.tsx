import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoginScreen } from './screens/LoginScreen';
import { POSScreen } from './screens/POSScreen';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginScreen />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <POSScreen />,
      },
    ],
  },
]);