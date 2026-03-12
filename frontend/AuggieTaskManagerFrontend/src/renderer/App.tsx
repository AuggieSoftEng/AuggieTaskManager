/**
 * Main app: routing and global providers.
 * Add React Router and store provider here when ready.
 */
import { SignUpLayout } from './components/layout/SignUpLayout';
import { MemoryRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthService } from './features/auth/services/authService';

export const ProtectedRoute = () => {
  if (!AuthService.isAuthenticated()) return <Navigate to="/signup" replace />;
  return <Outlet />;
};

function App() {
  return (
    <MemoryRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Dashboard placeholder</div>} />
        </Route>
        <Route path="/signup" element={<SignUpLayout />} />
        <Route path="/login" element={<div>Login placeholder</div>} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
