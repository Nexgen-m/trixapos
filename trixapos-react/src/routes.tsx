import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { POSScreen } from './screens/POSScreen';
import { LoginScreen } from './screens/LoginScreen';
import { useFrappeAuth } from 'frappe-react-sdk';

// Authentication Guard
const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { currentUser, isLoading } = useFrappeAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/trixapos" />} /> {/* Redirect root to /trixapos */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/trixapos" element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route index element={<POSScreen />} />
      </Route>
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </>
  )
);
