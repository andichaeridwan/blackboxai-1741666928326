import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { websocketService } from '../services/websocket';
import { updateRoutes, updateSelectedRoute } from '../store/slices/routesSlice';
import { Vehicle, Route, Stop } from '../types';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export const useWebSocket = () => {
  const dispatch = useDispatch();

  // Handle vehicle location updates
  const handleLocationUpdate = useCallback((message: WebSocketMessage) => {
    const vehicle = message.data as Vehicle;
    dispatch(updateSelectedRoute((currentRoute: Route | null) => {
      if (!currentRoute) return null;
      return {
        ...currentRoute,
        vehicleLocation: vehicle,
      };
    }));
  }, [dispatch]);

  // Handle route updates
  const handleRouteUpdate = useCallback((message: WebSocketMessage) => {
    const updatedRoute = message.data as Route;
    dispatch(updateRoutes((currentRoutes: Route[]) => 
      currentRoutes.map((route) => 
        route.id === updatedRoute.id ? updatedRoute : route
      )
    ));
  }, [dispatch]);

  // Handle stop updates
  const handleStopUpdate = useCallback((message: WebSocketMessage) => {
    const updatedStop = message.data as Stop;
    dispatch(updateSelectedRoute((currentRoute: Route | null) => {
      if (!currentRoute) return null;
      return {
        ...currentRoute,
        stops: currentRoute.stops.map((stop) => 
          stop.id === updatedStop.id ? updatedStop : stop
        ),
      };
    }));
  }, [dispatch]);

  // Set up WebSocket subscriptions
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to different types of updates
    const unsubscribeLocation = websocketService.subscribe('location_update', handleLocationUpdate);
    const unsubscribeRoute = websocketService.subscribe('route_update', handleRouteUpdate);
    const unsubscribeStop = websocketService.subscribe('stop_update', handleStopUpdate);

    // Cleanup subscriptions
    return () => {
      unsubscribeLocation();
      unsubscribeRoute();
      unsubscribeStop();
      websocketService.disconnect();
    };
  }, [handleLocationUpdate, handleRouteUpdate, handleStopUpdate]);

  // Return methods to send updates
  return {
    sendVehicleLocation: useCallback((vehicle: Vehicle) => {
      websocketService.sendVehicleLocation(vehicle);
    }, []),
    sendRouteUpdate: useCallback((route: Route) => {
      websocketService.sendRouteUpdate(route);
    }, []),
    sendStopUpdate: useCallback((stop: Stop) => {
      websocketService.sendStopUpdate(stop);
    }, []),
  };
};
