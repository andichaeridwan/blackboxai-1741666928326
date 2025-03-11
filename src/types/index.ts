export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Vehicle {
  id: string;
  type: 'bus' | 'train' | 'other';
  location: {
    latitude: number;
    longitude: number;
  };
  heading: number;
  speed: number;
  capacity: {
    total: number;
    current: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Stop {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  arrivalTime: string;
  departureTime: string;
  facilities: string[];
}

export interface Route {
  id: string;
  name: string;
  type: 'bus' | 'train' | 'other';
  stops: Stop[];
  schedule: {
    weekday: Array<{
      departureTime: string;
      frequency: number;
    }>;
    weekend: Array<{
      departureTime: string;
      frequency: number;
    }>;
  };
  fare: {
    base: number;
    perKm: number;
    currency: string;
  };
  status: 'active' | 'suspended' | 'modified';
  vehicleLocation?: Vehicle;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface RoutesState {
  routes: Route[];
  favorites: string[];
  selectedRoute: Route | null;
  loading: boolean;
  error: string | null;
}
