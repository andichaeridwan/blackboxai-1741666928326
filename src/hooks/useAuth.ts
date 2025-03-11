import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUser, setLoading, setError, logout } from '../store/slices/authSlice';
import { authService } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const user = await authService.login(email, password);
        dispatch(setUser({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
        }));
      } catch (error: any) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const user = await authService.register(email, password);
        dispatch(setUser({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
        }));
      } catch (error: any) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await authService.logout();
      dispatch(logout());
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    signOut,
  };
};
