/**
 * Main app: routing and global providers.
 * Add React Router and store provider here when ready.
 */
import { SignUpLayout } from './components/layout/SignUpLayout';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth';
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // or a spinner
  if (!user) return <Navigate to="/signup" replace />; // or "/signup"
  return <Outlet />;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<SignUpLayout />} /> {/* Change to DashboardLayout when ready */}
        </Route>
        <Route path="/signup" element={<SignUpLayout />} />
        <Route path="*" element={<SignUpLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
