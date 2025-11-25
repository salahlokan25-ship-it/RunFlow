import React from 'react';
import MapView, { Polyline } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { GPSPoint } from '../types';
import * as Location from 'expo-location';

interface MapComponentProps {
  currentLocation: Location.LocationObject | null;
  runPoints: GPSPoint[];
  isTracking: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({ currentLocation, runPoints, isTracking }) => {
  return (
    <MapView
      style={styles.map}
      showsUserLocation={true}
      followsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={
        currentLocation
          ? {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }
          : undefined
      }
    >
      {runPoints.length > 0 && (
        <Polyline
          coordinates={runPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
          strokeWidth={5}
          strokeColor="#f97316"
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});
