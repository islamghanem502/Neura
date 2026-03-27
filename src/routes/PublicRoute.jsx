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
  const { isAuthenticated, role } = useAuthContext();

  if (isAuthenticated && role) {
    return <Navigate to={ROLE_ROUTES[role] ?? '/'} replace />;
  }

  return <Outlet />;
}
