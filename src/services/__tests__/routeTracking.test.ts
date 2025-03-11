import { routeTrackingService } from '../routeTracking';
import { database } from '../../config/firebase';
import { ref, onValue, off, set, get } from 'firebase/database';
import { Vehicle, Route, Stop } from '../../types';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  database: {}
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
  set: jest.fn(),
  get: jest.fn()
}));

describe('RouteTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribeToVehicle', () => {
    it('should subscribe to vehicle updates', () => {
      const mockVehicle: Vehicle = {
        id: 'vehicle-1',
        type: 'bus',
        location: {
          latitude: 1.234,
          longitude: 5.678
        },
        heading: 90,
        speed: 50,
        capacity: {
          total: 50,
          current: 30
        },
        status: 'active'
      };

      const mockCallback = jest.fn();
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (onValue as jest.Mock).mockImplementation((ref, callback) => {
        callback({
          val: () => mockVehicle
        });
      });

      const unsubscribe = routeTrackingService.subscribeToVehicle('vehicle-1', mockCallback);

      expect(ref).toHaveBeenCalledWith(database, 'vehicleLocations/vehicle-1');
      expect(onValue).toHaveBeenCalledWith(mockRef, expect.any(Function));
      expect(mockCallback).toHaveBeenCalledWith(mockVehicle);

      // Test unsubscribe
      unsubscribe();
      expect(off).toHaveBeenCalledWith(mockRef);
    });

    it('should not call callback if no data exists', () => {
      const mockCallback = jest.fn();
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (onValue as jest.Mock).mockImplementation((ref, callback) => {
        callback({
          val: () => null
        });
      });

      routeTrackingService.subscribeToVehicle('vehicle-1', mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToRoute', () => {
    it('should subscribe to route updates', () => {
      const mockRoute: Route = {
        id: 'route-1',
        name: 'Test Route',
        type: 'bus',
        stops: [],
        schedule: {
          weekday: [],
          weekend: []
        },
        fare: {
          base: 2.5,
          perKm: 0.5,
          currency: 'USD'
        },
        status: 'active'
      };

      const mockCallback = jest.fn();
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (onValue as jest.Mock).mockImplementation((ref, callback) => {
        callback({
          val: () => mockRoute
        });
      });

      const unsubscribe = routeTrackingService.subscribeToRoute('route-1', mockCallback);

      expect(ref).toHaveBeenCalledWith(database, 'routes/route-1');
      expect(onValue).toHaveBeenCalledWith(mockRef, expect.any(Function));
      expect(mockCallback).toHaveBeenCalledWith(mockRoute);

      // Test unsubscribe
      unsubscribe();
      expect(off).toHaveBeenCalledWith(mockRef);
    });
  });

  describe('getNearbyStops', () => {
    it('should return nearby stops within radius', async () => {
      const mockStops = {
        'stop-1': {
          id: 'stop-1',
          name: 'Near Stop',
          location: {
            latitude: 1.234,
            longitude: 5.678
          },
          arrivalTime: '10:00',
          departureTime: '10:05',
          facilities: ['shelter']
        },
        'stop-2': {
          id: 'stop-2',
          name: 'Far Stop',
          location: {
            latitude: 2.234,
            longitude: 6.678
          },
          arrivalTime: '10:30',
          departureTime: '10:35',
          facilities: ['bench']
        }
      };

      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (get as jest.Mock).mockResolvedValue({
        val: () => mockStops
      });

      const nearbyStops = await routeTrackingService.getNearbyStops(1.234, 5.678, 5);

      expect(ref).toHaveBeenCalledWith(database, 'stops');
      expect(get).toHaveBeenCalledWith(mockRef);
      expect(nearbyStops).toHaveLength(1);
      expect(nearbyStops[0].id).toBe('stop-1');
    });

    it('should return empty array when no stops exist', async () => {
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (get as jest.Mock).mockResolvedValue({
        val: () => null
      });

      const nearbyStops = await routeTrackingService.getNearbyStops(1.234, 5.678, 5);

      expect(nearbyStops).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (get as jest.Mock).mockRejectedValue(new Error('Database error'));

      console.error = jest.fn();

      const nearbyStops = await routeTrackingService.getNearbyStops(1.234, 5.678, 5);

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching nearby stops:',
        expect.any(Error)
      );
      expect(nearbyStops).toEqual([]);
    });
  });

  describe('updateVehicleLocation', () => {
    it('should update vehicle location in database', async () => {
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (set as jest.Mock).mockResolvedValue(undefined);

      const now = Date.now();
      Date.now = jest.fn(() => now);

      await routeTrackingService.updateVehicleLocation(
        'vehicle-1',
        1.234,
        5.678,
        90,
        50
      );

      expect(ref).toHaveBeenCalledWith(database, 'vehicleLocations/vehicle-1');
      expect(set).toHaveBeenCalledWith(mockRef, {
        latitude: 1.234,
        longitude: 5.678,
        heading: 90,
        speed: 50,
        timestamp: now
      });
    });

    it('should handle update errors', async () => {
      const mockRef = {};
      (ref as jest.Mock).mockReturnValue(mockRef);
      (set as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(
        routeTrackingService.updateVehicleLocation('vehicle-1', 1.234, 5.678, 90, 50)
      ).rejects.toThrow('Update failed');
    });
  });
});
