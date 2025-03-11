import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setRoutes,
  addFavorite,
  removeFavorite,
  setSelectedRoute,
  setLoading,
  setError,
} from '../store/slices/routesSlice';
import { routesService } from '../services/api';

export const useRoutes = () => {
  const dispatch = useDispatch();
  const { routes, favorites, selectedRoute, loading, error } = useSelector(
    (state: RootState) => state.routes
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchRoutes = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const routesData = await routesService.getRoutes();
      dispatch(setRoutes(routesData));
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const subscribeToRoute = useCallback((routeId: string) => {
    return routesService.subscribeToVehicleUpdates(routeId, (vehicleData) => {
      // Update route with real-time vehicle data
      dispatch(setSelectedRoute({
        ...selectedRoute!,
        vehicleLocation: vehicleData,
      }));
    });
  }, [dispatch, selectedRoute]);

  const toggleFavorite = useCallback(async (routeId: string) => {
    if (!user) return;

    try {
      if (favorites.includes(routeId)) {
        dispatch(removeFavorite(routeId));
      } else {
        await routesService.addFavoriteRoute(user.id, routeId);
        dispatch(addFavorite(routeId));
      }
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  }, [dispatch, favorites, user]);

  const selectRoute = useCallback((route: any) => {
    dispatch(setSelectedRoute(route));
  }, [dispatch]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return {
    routes,
    favorites,
    selectedRoute,
    loading,
    error,
    fetchRoutes,
    subscribeToRoute,
    toggleFavorite,
    selectRoute,
  };
};
