import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';

/**
 * Protects a route by:
 * 1. Redirecting unauthenticated users to /auth/login
 * 2. Optionally enforcing a specific role — if the user's role doesn't match, redirect to their own dashboard
 */
export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role, user } = useAuthContext();
  const location = useLocation();

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

  // Doctor activation and onboarding route checks
  if (role === 'doctor') {
    const isActive = user?.isActive === true || user?.isVerified === true;
    const isOnboardingRoute = location.pathname === '/dashboard/doctor/onboarding';

    if (!isActive && !isOnboardingRoute) {
      return <Navigate to="/dashboard/doctor/onboarding" replace />;
    }
    if (isActive && isOnboardingRoute) {
      return <Navigate to="/dashboard/doctor" replace />;
    }
  }

  return <Outlet />;
}
