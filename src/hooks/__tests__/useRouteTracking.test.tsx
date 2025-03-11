import { renderHook, act } from '@testing-library/react-native';
import { useRouteTracking } from '../useRouteTracking';
import { routeTrackingService } from '../../services/routeTracking';
import { useGeolocation } from '../useGeolocation';

// Mock dependencies
jest.mock('../useGeolocation');
jest.mock('../../services/routeTracking');

describe('useRouteTracking', () => {
  const mockLocation = {
    latitude: 1.234,
    longitude: 5.678,
    accuracy: 10,
    altitude: 100,
    heading: 90,
    speed: 30,
    timestamp: Date.now(),
  };

  const mockRoute = {
    id: 'test-route',
    name: 'Test Route',
    type: 'bus',
    stops: [
      {
        id: 'stop-1',
        name: 'Stop 1',
        location: {
          latitude: 1.235,
          longitude: 5.679,
        },
        arrivalTime: '10:00',
        departureTime: '10:05',
        facilities: ['shelter', 'bench'],
      },
    ],
    schedule: {
      weekday: [],
      weekend: [],
    },
    fare: {
      base: 2.5,
      perKm: 0.5,
      currency: 'USD',
    },
    status: 'active',
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useGeolocation
    (useGeolocation as jest.Mock).mockReturnValue({
      location: mockLocation,
      error: null,
      loading: false,
    });

    // Mock routeTrackingService methods
    (routeTrackingService.subscribeToRoute as jest.Mock).mockImplementation((routeId, callback) => {
      callback(mockRoute);
      return jest.fn(); // Return unsubscribe function
    });

    (routeTrackingService.getNearbyStops as jest.Mock).mockResolvedValue([mockRoute.stops[0]]);
  });

  it('should subscribe to route updates when routeId is provided', () => {
    const { result } = renderHook(() => useRouteTracking('test-route'));

    expect(routeTrackingService.subscribeToRoute).toHaveBeenCalledWith(
      'test-route',
      expect.any(Function)
    );
    expect(result.current.route).toEqual(mockRoute);
  });

  it('should fetch nearby stops when location changes', async () => {
    const { result } = renderHook(() => useRouteTracking());

    // Wait for async operations
    await act(async () => {
      await Promise.resolve();
    });

    expect(routeTrackingService.getNearbyStops).toHaveBeenCalledWith(
      mockLocation.latitude,
      mockLocation.longitude
    );
    expect(result.current.nearbyStops).toEqual([mockRoute.stops[0]]);
  });

  it('should handle errors when fetching nearby stops', async () => {
    const error = new Error('Failed to fetch stops');
    (routeTrackingService.getNearbyStops as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useRouteTracking());

    // Wait for async operations
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe(error.message);
  });

  it('should unsubscribe from route updates on unmount', () => {
    const unsubscribe = jest.fn();
    (routeTrackingService.subscribeToRoute as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useRouteTracking('test-route'));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should not subscribe to route updates when routeId is not provided', () => {
    renderHook(() => useRouteTracking());
    expect(routeTrackingService.subscribeToRoute).not.toHaveBeenCalled();
  });

  it('should not fetch nearby stops when location is not available', async () => {
    (useGeolocation as jest.Mock).mockReturnValue({
      location: null,
      error: null,
      loading: false,
    });

    renderHook(() => useRouteTracking());

    // Wait for async operations
    await act(async () => {
      await Promise.resolve();
    });

    expect(routeTrackingService.getNearbyStops).not.toHaveBeenCalled();
  });
});
