import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRunTracking } from '../../src/hooks/useRunTracking';
import { MapComponent } from '../../src/components/MapComponent';
import { saveRun } from '../../src/services/RunService';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function StartScreen() {
  const {
    isTracking,
    isPaused,
    currentRunPoints,
    currentLocation,
    distance,
    duration,
    splits,
    elevationGain,
    elevationLoss,
    startTracking,
    stopTracking,
  } = useRunTracking();

  const pace = distance > 0 ? (duration / 60) / (distance / 1000) : 0;
  const calories = Math.floor(distance * 0.06);
  const [weather] = useState({ temp: 18, condition: 'partly-cloudy' });

  const handleStart = () => {
    startTracking();
  };

  const handleStop = async () => {
    stopTracking();
    if (distance > 0) {
      try {
        await saveRun({
          startTime: Date.now() - duration * 1000,
          endTime: Date.now(),
          duration,
          distance,
          avgPace: pace,
          calories,
          points: currentRunPoints,
          splits,
          elevationGain,
          elevationLoss,
        });
        Alert.alert('Run Saved', 'Your run has been saved!');
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to save run.');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  const formatPace = (paceValue: number) => {
    if (paceValue === 0) return '--:--';
    const mins = Math.floor(paceValue);
    const secs = Math.round((paceValue - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with Weather */}
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Start Running</Text>
            <View style={styles.weatherRow}>
              <Ionicons name="partly-sunny" size={16} color="#f97316" />
              <Text style={styles.weatherText}>{weather.temp}°C • Partly Cloudy</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Large Map */}
        <View style={styles.mapContainer}>
          <MapComponent
            currentLocation={currentLocation}
            runPoints={currentRunPoints}
            isTracking={isTracking}
          />
          {!isTracking && (
            <View style={styles.mapOverlay}>
              <Ionicons name="location" size={32} color="#f97316" />
              <Text style={styles.mapOverlayText}>Ready to track your run</Text>
            </View>
          )}
        </View>

        {/* Stats Quick Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PACE</Text>
            <Text style={styles.statValue}>{formatPace(pace)}</Text>
            <Text style={styles.statUnit}>min/km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <Text style={styles.statValue}>{formatDistance(distance)}</Text>
            <Text style={styles.statUnit}>km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CALORIES</Text>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>
        </View>

        {/* Big Orange Start Button */}
        {!isTracking ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play" size={32} color="#fff" />
              <Text style={styles.startButtonText}>START RUN</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Ionicons name="stop" size={24} color="#fff" />
            <Text style={styles.stopButtonText}>STOP RUN</Text>
          </TouchableOpacity>
        )}

        {/* Sub-actions */}
        {!isTracking && (
          <View style={styles.subActions}>
            <TouchableOpacity 
              style={styles.subAction}
              onPress={() => Alert.alert('Set Goal', 'Goal setting feature coming soon!')}
            >
              <Ionicons name="flag" size={18} color="#f97316" />
              <Text style={styles.subActionText}>Set Goal</Text>
            </TouchableOpacity>
            <View style={styles.subActionDivider} />
            <TouchableOpacity 
              style={styles.subAction}
              onPress={() => Alert.alert('Choose Route', 'Route selection coming soon!')}
            >
              <Ionicons name="map" size={18} color="#f97316" />
              <Text style={styles.subActionText}>Choose Route</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Mini Menu */}
        <View style={styles.miniMenu}>
          <TouchableOpacity 
            style={styles.miniMenuItem}
            onPress={() => Alert.alert('Routes', 'Saved routes feature coming soon!')}
          >
            <Ionicons name="navigate-circle" size={24} color={THEME.colors.textSecondary} />
            <Text style={styles.miniMenuText}>Routes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.miniMenuItem}
            onPress={() => Alert.alert('AI Coach', 'AI Coach settings coming soon!')}
          >
            <Ionicons name="sparkles" size={24} color={THEME.colors.textSecondary} />
            <Text style={styles.miniMenuText}>AI Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.miniMenuItem}
            onPress={() => Alert.alert('Music', 'Music integration coming soon!')}
          >
            <Ionicons name="musical-notes" size={24} color={THEME.colors.textSecondary} />
            <Text style={styles.miniMenuText}>Music</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weatherText: { fontSize: 13, color: '#9ca3af' },
  scrollView: { flex: 1 },
  mapContainer: { height: 300, backgroundColor: '#1a1a1a', position: 'relative' },
  mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  mapOverlayText: { color: '#fff', marginTop: 8, fontSize: 14 },
  statsBar: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.border },
  statLabel: { fontSize: 11, fontWeight: '600', color: THEME.colors.textSecondary, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#f97316', marginBottom: 2 },
  statUnit: { fontSize: 12, color: THEME.colors.textSecondary },
  startButton: { marginHorizontal: 16, marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  startButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  startButtonText: { fontSize: 20, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  stopButton: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#ef4444', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  stopButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subActions: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, padding: 12, backgroundColor: THEME.colors.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.colors.border },
  subAction: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16 },
  subActionText: { fontSize: 14, color: THEME.colors.text, fontWeight: '500' },
  subActionDivider: { width: 1, height: 20, backgroundColor: THEME.colors.border },
  miniMenu: { flexDirection: 'row', marginHorizontal: 16, marginTop: 24, marginBottom: 32, justifyContent: 'space-around' },
  miniMenuItem: { alignItems: 'center', gap: 6 },
  miniMenuText: { fontSize: 12, color: THEME.colors.textSecondary },
});
