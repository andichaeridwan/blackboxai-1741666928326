import { useState, useEffect } from 'react';
import { routeTrackingService } from '../services/routeTracking';
import { Vehicle, Route, Stop } from '../types';
import { useGeolocation } from './useGeolocation';

interface RouteTrackingState {
  vehicle: Vehicle | null;
  route: Route | null;
  nearbyStops: Stop[];
  loading: boolean;
  error: string | null;
}

export const useRouteTracking = (routeId?: string) => {
  const { location } = useGeolocation();
  const [state, setState] = useState<RouteTrackingState>({
    vehicle: null,
    route: null,
    nearbyStops: [],
    loading: false,
    error: null,
  });

  // Subscribe to route updates
  useEffect(() => {
    if (!routeId) {
      setState(prev => ({ ...prev, route: null }));
      return;
    }

    const unsubscribe = routeTrackingService.subscribeToRoute(routeId, (data) => {
      setState(prev => ({ ...prev, route: data }));
    });

    return () => unsubscribe();
  }, [routeId]);

  // Fetch nearby stops when location changes
  useEffect(() => {
    if (!location) return;

    const fetchNearbyStops = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const stops = await routeTrackingService.getNearbyStops(
          location.latitude,
          location.longitude
        );
        setState(prev => ({ ...prev, nearbyStops: stops, loading: false }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to fetch nearby stops',
          loading: false,
        }));
      }
    };

    fetchNearbyStops();
  }, [location]);

  // Subscribe to vehicle updates if route is selected
  useEffect(() => {
    if (!routeId || !state.route?.id) return;

    const unsubscribe = routeTrackingService.subscribeToVehicle(state.route.id, (data) => {
      setState(prev => ({ ...prev, vehicle: data }));
    });

    return () => unsubscribe();
  }, [routeId, state.route]);

  return state;
};
