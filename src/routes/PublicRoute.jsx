import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';

const ROLE_ROUTES = {
  patient:  '/dashboard/patient',
  doctor:   '/dashboard/doctor',
  nurse:    '/dashboard/nurse',
  pharmacy: '/dashboard/pharmacy',
};

/**
 * Redirects already-authenticated users away from public pages (login, register, landing).
 */
export default function PublicRoute() {
  const { isAuthenticated, role, user } = useAuthContext();

  if (isAuthenticated && role) {
    let route = ROLE_ROUTES[role] ?? '/';
    if (role === 'doctor' && user && !user.isVerified) {
      route = '/dashboard/doctor/profile';
    }
    return <Navigate to={route} replace />;
  }

  return <Outlet />;
}
