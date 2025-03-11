import { websocketService } from '../websocket';
import { Vehicle, Route, Stop } from '../../types';

describe('WebSocketService', () => {
  let mockWebSocket: WebSocket;

  beforeEach(() => {
    // Create a complete mock WebSocket
    mockWebSocket = {
      binaryType: 'blob',
      bufferedAmount: 0,
      extensions: '',
      protocol: '',
      url: '',
      readyState: WebSocket.OPEN,
      CONNECTING: WebSocket.CONNECTING,
      OPEN: WebSocket.OPEN,
      CLOSING: WebSocket.CLOSING,
      CLOSED: WebSocket.CLOSED,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    } as unknown as WebSocket;

    // Mock WebSocket constructor
    global.WebSocket = jest.fn(() => mockWebSocket) as any;

    // Reset the service connection
    websocketService.disconnect();
    websocketService.connect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to WebSocket server', () => {
    expect(global.WebSocket).toHaveBeenCalledWith('wss://api.youroute.com/ws');
  });

  it('should handle incoming messages', () => {
    const mockCallback = jest.fn();
    const testMessage = {
      type: 'location_update' as const,
      data: { id: '123', location: { latitude: 0, longitude: 0 } },
      timestamp: Date.now()
    };

    websocketService.subscribe('location_update', mockCallback);

    // Simulate receiving a message
    if (mockWebSocket.onmessage) {
      mockWebSocket.onmessage(new MessageEvent('message', {
        data: JSON.stringify(testMessage)
      }));
    }

    expect(mockCallback).toHaveBeenCalledWith(testMessage);
  });

  it('should handle subscription and unsubscription', () => {
    const mockCallback = jest.fn();
    const unsubscribe = websocketService.subscribe('route_update', mockCallback);

    const testMessage = {
      type: 'route_update' as const,
      data: { id: '123', name: 'Test Route' },
      timestamp: Date.now()
    };

    // Simulate message before unsubscribe
    if (mockWebSocket.onmessage) {
      mockWebSocket.onmessage(new MessageEvent('message', {
        data: JSON.stringify(testMessage)
      }));
    }
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Unsubscribe and verify no more calls
    unsubscribe();
    if (mockWebSocket.onmessage) {
      mockWebSocket.onmessage(new MessageEvent('message', {
        data: JSON.stringify(testMessage)
      }));
    }
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should send vehicle location updates', () => {
    const vehicle: Vehicle = {
      id: '123',
      type: 'bus',
      location: { latitude: 1.234, longitude: 5.678 },
      heading: 90,
      speed: 50,
      capacity: {
        total: 50,
        current: 30
      },
      status: 'active'
    };

    websocketService.sendVehicleLocation(vehicle);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'location_update',
        data: vehicle,
        timestamp: expect.any(Number)
      })
    );
  });

  it('should send route updates', () => {
    const route: Route = {
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

    websocketService.sendRouteUpdate(route);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'route_update',
        data: route,
        timestamp: expect.any(Number)
      })
    );
  });

  it('should send stop updates', () => {
    const stop: Stop = {
      id: 'stop-1',
      name: 'Test Stop',
      location: {
        latitude: 1.234,
        longitude: 5.678
      },
      arrivalTime: '10:00',
      departureTime: '10:05',
      facilities: ['shelter', 'bench']
    };

    websocketService.sendStopUpdate(stop);

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'stop_update',
        data: stop,
        timestamp: expect.any(Number)
      })
    );
  });

  it('should handle connection errors', () => {
    console.error = jest.fn();

    if (mockWebSocket.onerror) {
      mockWebSocket.onerror(new Event('error'));
    }

    expect(console.error).toHaveBeenCalledWith('WebSocket error:', expect.any(Event));
  });

  it('should attempt reconnection on close', () => {
    jest.useFakeTimers();

    if (mockWebSocket.onclose) {
      mockWebSocket.onclose(new CloseEvent('close'));
    }

    // Fast-forward past the first reconnection attempt
    jest.advanceTimersByTime(1000);

    expect(global.WebSocket).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('should not send messages when disconnected', () => {
    // Create a new mock with CLOSED state
    const closedMockWebSocket = {
      ...mockWebSocket,
      readyState: WebSocket.CLOSED
    } as WebSocket;

    // Replace the service's WebSocket instance
    (websocketService as any).ws = closedMockWebSocket;

    const vehicle: Vehicle = {
      id: '123',
      type: 'bus',
      location: { latitude: 1.234, longitude: 5.678 },
      heading: 90,
      speed: 50,
      capacity: {
        total: 50,
        current: 30
      },
      status: 'active'
    };

    console.error = jest.fn();
    websocketService.sendVehicleLocation(vehicle);

    expect(mockWebSocket.send).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('WebSocket is not connected');
  });

  it('should handle malformed incoming messages', () => {
    console.error = jest.fn();

    if (mockWebSocket.onmessage) {
      // Simulate receiving malformed JSON
      mockWebSocket.onmessage(new MessageEvent('message', {
        data: 'invalid json'
      }));
    }

    expect(console.error).toHaveBeenCalledWith(
      'Error parsing WebSocket message:',
      expect.any(Error)
    );
  });
});
