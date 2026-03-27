import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';

/**
 * Protects a route by:
 * 1. Redirecting unauthenticated users to /auth/login
 * 2. Optionally enforcing a specific role — if the user's role doesn't match, redirect to their own dashboard
 */
export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const dashboardMap = {
      patient:  '/dashboard/patient',
      doctor:   '/dashboard/doctor',
      nurse:    '/dashboard/nurse',
      pharmacy: '/dashboard/pharmacy',
    };
    return <Navigate to={dashboardMap[role] ?? '/'} replace />;
  }

  return <Outlet />;
}
