import { useEffect } from 'react';
import { SignUpLayout } from './components/layout/SignUpLayout';
import {
  MemoryRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from './api/axiosInstance';
import { AuthService } from './features/auth/services/authService';
import { LoginLayout } from './components/layout/LogInLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Homepage } from './features/dashboard/components/Homepage';

type ThemeMode = 'system' | 'light' | 'dark';
const THEME_KEY = 'auggie-mode';
// Applies saved theme when the app starts
const applySavedThemeOnLoad = () => {
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  const root = document.documentElement;

  // Force light/dark mode if user selected one of the options
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  } else {
    // system/default mode
    root.removeAttribute('data-theme');
  }
};

export const ProtectedRoute = () => {
  if (!AuthService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function SessionExpiredListener(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const onExpired = () => navigate('/login', { replace: true });
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [navigate]);

  return null;
}

function App() {
  const initialPath = AuthService.isAuthenticated() ? '/' : '/login';

  // Run once the app loads so that the theme is correctly applied
  useEffect(() => {
    applySavedThemeOnLoad();
  }, []);

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <SessionExpiredListener />
      <Routes>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Homepage />} />
          </Route>
        </Route>

        {/* Public routes */}
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/signup" element={<SignUpLayout />} />

        {/* Default/fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
