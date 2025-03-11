import { database } from '../config/firebase';
import { ref, onValue, off, set, get } from 'firebase/database';
import { Vehicle, Route, Stop } from '../types';

export const routeTrackingService = {
  // Subscribe to real-time vehicle updates
  subscribeToVehicle: (vehicleId: string, callback: (data: Vehicle) => void) => {
    const vehicleRef = ref(database, `vehicleLocations/${vehicleId}`);
    onValue(vehicleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data as Vehicle);
      }
    });

    // Return unsubscribe function
    return () => off(vehicleRef);
  },

  // Subscribe to route updates
  subscribeToRoute: (routeId: string, callback: (data: Route) => void) => {
    const routeRef = ref(database, `routes/${routeId}`);
    onValue(routeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data as Route);
      }
    });

    return () => off(routeRef);
  },

  // Get nearby stops
  getNearbyStops: async (latitude: number, longitude: number, radius: number = 5): Promise<Stop[]> => {
    try {
      const stopsRef = ref(database, 'stops');
      const snapshot = await get(stopsRef);
      const stops = snapshot.val();

      if (!stops) {
        return [];
      }

      // Convert object to array and ensure type safety
      const stopsArray = Object.values(stops) as Stop[];

      // Filter stops within radius (in kilometers)
      return stopsArray.filter((stop: Stop) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          stop.location.latitude,
          stop.location.longitude
        );
        return distance <= radius;
      });
    } catch (error) {
      console.error('Error fetching nearby stops:', error);
      return [];
    }
  },

  // Update vehicle location
  updateVehicleLocation: async (
    vehicleId: string,
    latitude: number,
    longitude: number,
    heading: number,
    speed: number
  ) => {
    const locationRef = ref(database, `vehicleLocations/${vehicleId}`);
    await set(locationRef, {
      latitude,
      longitude,
      heading,
      speed,
      timestamp: Date.now(),
    });
  },
};

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};
