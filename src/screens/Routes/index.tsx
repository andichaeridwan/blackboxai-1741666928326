import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useRouteTracking } from '../../hooks/useRouteTracking';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Stop } from '../../types';

const { width, height } = Dimensions.get('window');

export const Routes = () => {
  const { t } = useTranslation();
  const { location } = useGeolocation(true); // Enable continuous tracking
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>();
  const { vehicle, route, nearbyStops, loading, error } = useRouteTracking(selectedRouteId);
  const { sendVehicleLocation } = useWebSocket();

  // Update vehicle location when user's location changes
  useEffect(() => {
    if (location && vehicle) {
      sendVehicleLocation({
        ...vehicle,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        heading: location.heading || 0,
        speed: location.speed || 0,
      });
    }
  }, [location, vehicle, sendVehicleLocation]);

  const renderStopMarker = (stop: Stop) => (
    <Marker
      key={stop.id}
      coordinate={{
        latitude: stop.location.latitude,
        longitude: stop.location.longitude,
      }}
      title={stop.name}
      description={`Arrival: ${stop.arrivalTime}`}
    />
  );

  const renderVehicleMarker = () => {
    if (!vehicle?.location) return null;
    return (
      <Marker
        coordinate={{
          latitude: vehicle.location.latitude,
          longitude: vehicle.location.longitude,
        }}
        title={t('routes.currentLocation')}
        rotation={vehicle.heading}
      />
    );
  };

  const renderRoute = () => {
    if (!route?.stops) return null;
    return (
      <Polyline
        coordinates={route.stops.map(stop => ({
          latitude: stop.location.latitude,
          longitude: stop.location.longitude,
        }))}
        strokeColor="#2196F3"
        strokeWidth={3}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.error}>{error}</Text>
        <Button mode="contained" onPress={() => setSelectedRouteId(undefined)}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 37.78825,
          longitude: location?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        followsUserLocation
      >
        {route?.stops?.map(renderStopMarker)}
        {renderVehicleMarker()}
        {renderRoute()}
      </MapView>

      <Card style={styles.routeCard}>
        <Card.Content>
          <Text variant="titleMedium">{t('routes.availableRoutes')}</Text>
          {nearbyStops.map((stop) => (
            <Button
              key={stop.id}
              mode="outlined"
              style={styles.stopButton}
              onPress={() => setSelectedRouteId(stop.id)}
            >
              {stop.name}
            </Button>
          ))}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    width,
    height: height * 0.7,
  },
  routeCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  stopButton: {
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  error: {
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
});
