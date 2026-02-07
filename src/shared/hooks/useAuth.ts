import { useAppSelector } from '@/store';

/**
 * Custom hook for accessing authentication state
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    isAdmin: user?.role === 'admin',
  };
};
