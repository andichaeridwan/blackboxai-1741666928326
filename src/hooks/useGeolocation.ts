import { useState, useEffect } from 'react';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (watchPosition: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'YouRoute needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };

  const transformPosition = (position: GeoPosition): Location => ({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: position.timestamp,
  });

  useEffect(() => {
    let watchId: number;

    const getLocation = async () => {
      try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          setState(prev => ({
            ...prev,
            error: 'Location permission denied',
            loading: false,
          }));
          return;
        }

        if (watchPosition) {
          watchId = Geolocation.watchPosition(
            position => {
              setState({
                location: transformPosition(position),
                error: null,
                loading: false,
              });
            },
            error => {
              setState({
                location: null,
                error: error.message,
                loading: false,
              });
            },
            {
              enableHighAccuracy: true,
              distanceFilter: 10, // Minimum distance (meters) between updates
              interval: 5000, // Minimum time (milliseconds) between updates
              fastestInterval: 2000, // Fastest rate at which your app can handle updates
            }
          );
        } else {
          Geolocation.getCurrentPosition(
            position => {
              setState({
                location: transformPosition(position),
                error: null,
                loading: false,
              });
            },
            error => {
              setState({
                location: null,
                error: error.message,
                loading: false,
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            }
          );
        }
      } catch (error) {
        setState({
          location: null,
          error: error instanceof Error ? error.message : 'Failed to get location',
          loading: false,
        });
      }
    };

    getLocation();

    return () => {
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchPosition]);

  return state;
};
