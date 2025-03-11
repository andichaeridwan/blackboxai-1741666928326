import { Vehicle, Route, Stop } from '../types';

type MessageType = 'location_update' | 'route_update' | 'stop_update' | 'notification';

interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private subscribers: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();

  constructor(private url: string) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifySubscribers(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        this.reconnectTimeout *= 2; // Exponential backoff
        this.connect();
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(type: MessageType, callback: (message: WebSocketMessage) => void) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifySubscribers(message: WebSocketMessage) {
    const callbacks = this.subscribers.get(message.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  // Send vehicle location update
  sendVehicleLocation(vehicle: Vehicle) {
    this.sendMessage({
      type: 'location_update',
      data: vehicle,
      timestamp: Date.now(),
    });
  }

  // Send route update
  sendRouteUpdate(route: Route) {
    this.sendMessage({
      type: 'route_update',
      data: route,
      timestamp: Date.now(),
    });
  }

  // Send stop update
  sendStopUpdate(stop: Stop) {
    this.sendMessage({
      type: 'stop_update',
      data: stop,
      timestamp: Date.now(),
    });
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService('wss://api.youroute.com/ws');
