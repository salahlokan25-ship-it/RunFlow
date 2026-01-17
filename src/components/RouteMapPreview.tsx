import React from 'react';
import MapView, { Polyline } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { GPSPoint } from '../types';
import { THEME } from '../theme';

interface RouteMapPreviewProps {
    points: GPSPoint[];
}

export const RouteMapPreview: React.FC<RouteMapPreviewProps> = ({ points }) => {
    if (!points || points.length === 0) {
        return <View style={styles.emptyContainer} />;
    }

    // Calculate region to fit the route
    const lats = points.map(p => p.latitude);
    const longs = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLong = Math.min(...longs);
    const maxLong = Math.max(...longs);

    const midLat = (minLat + maxLat) / 2;
    const midLong = (minLong + maxLong) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add some padding
    const longDelta = (maxLong - minLong) * 1.5;

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                initialRegion={{
                    latitude: midLat,
                    longitude: midLong,
                    latitudeDelta: Math.max(latDelta, 0.005),
                    longitudeDelta: Math.max(longDelta, 0.005),
                }}
                liteMode={true} // Use Lite mode for better performance in lists
            >
                <Polyline
                    coordinates={points.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
                    strokeWidth={4}
                    strokeColor={THEME.colors.primary}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    emptyContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
        borderRadius: 16,
    },
});
