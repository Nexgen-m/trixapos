import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginScreen } from './screens/LoginScreen';
import { POSScreen } from './screens/POSScreen';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/trixapos-react/login" element={<LoginScreen />} />
      <Route path="/trixapos-react" element={<MainLayout />}>
        <Route index element={<POSScreen />} />
      </Route>
    </>
  ),
);
