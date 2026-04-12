import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, registerUser } from '../api/authService';
import { useAuthContext } from '../providers/AuthProvider';
import decodeToken from '../utils/decodeToken';

/** Maps role to the correct dashboard route */
const ROLE_ROUTES = {
  patient:  '/dashboard/patient',
  doctor:   '/dashboard/doctor',
  nurse:    '/dashboard/nurse',
  pharmacy: '/dashboard/pharmacy',
};

export function useLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      const accessToken = res.data?.accessToken || res.data?.token || res.accessToken || res.token;
      if (!accessToken) {
        toast.error('Authentication failed: No token received from server.');
        return;
      }
      const decodedUser = decodeToken(accessToken) || {};
      
      // The backend login response only gives accessToken, no user object.
      // E.g. message = "Welcome back, Ashraf Samir!"
      let firstName = decodedUser.email?.split('@')[0] || 'User';
      let lastName = '';
      if (res.message?.startsWith('Welcome back, ')) {
        const fullName = res.message.replace('Welcome back, ', '').replace('!', '').trim();
        const parts = fullName.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      const userFromRes = res.data?.user || res.user || {};
      const userObj = { ...decodedUser, firstName, lastName, ...userFromRes };
      
      login(accessToken, userObj);
      toast.success(res.message || `Welcome back, ${firstName}!`);
      
      let route = ROLE_ROUTES[userObj.role] ?? '/';
      if (userObj.role === 'doctor' && !userObj.isVerified) {
        route = '/dashboard/doctor/profile';
      }
      navigate(route, { replace: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? err.message ?? 'Login failed. Please try again.';
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (res) => {
      const accessToken = res.data?.accessToken || res.data?.token || res.accessToken || res.token;
      const user = res.data?.user || res.user || {};
      
      if (!accessToken) {
        toast.error('Registration failed: No token received from server.');
        return;
      }

      const decodedUser = decodeToken(accessToken) || {};
      const fullUser = { ...decodedUser, ...user };

      login(accessToken, fullUser);
      toast.success(res.message || `Account created! Welcome to NEURA, ${fullUser.firstName || ''}.`);
      
      let route = ROLE_ROUTES[fullUser.role] ?? '/';
      if (fullUser.role === 'doctor' && !fullUser.isVerified) {
        route = '/dashboard/doctor/profile';
      }
      navigate(route, { replace: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? err.message ?? 'Registration failed. Please try again.';
      toast.error(msg);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('neura_doctor_submitted');
    logout();
    toast.success('Signed out successfully.');
    navigate('/auth/login', { replace: true });
  };

  return { logout: handleLogout };
}
