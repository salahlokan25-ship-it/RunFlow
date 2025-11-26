import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, FlatList, Switch } from 'react-native';
import { useRunTracking } from '../../src/hooks/useRunTracking';
import { MapComponent } from '../../src/components/MapComponent';
import { saveRun } from '../../src/services/RunService';
import { SavedRoutesService, SavedRoute } from '../../src/services/SavedRoutesService';
import { AICoachService } from '../../src/services/AICoachService';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import HealthKitService from '../../src/services/HealthKitService';
import { sendAchievementNotification } from '../../src/services/NotificationService';

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

  // Modals State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // Data State
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);
  const [goal, setGoal] = useState<{ type: 'distance' | 'duration' | 'none', value: number }>({ type: 'none', value: 0 });
  const [aiCoachEnabled, setAiCoachEnabled] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activityType, setActivityType] = useState('Running');

  const activities = [
    'Running', 'Walking', 'Cycling', 'Hiking', 'Treadmill', 'Trail Running',
    'Aerobics', 'Climbing', 'Cross Trainer', 'Cross-Country Skiing', 'Ergometer',
    'Football', 'Gardening', 'Golfing', 'Gymnastics', 'Handbike', 'Ice Skating',
    'Inline Skating', 'Longboarding', 'Martial Arts', 'Mountain Biking', 'Nordic Walking',
    'Horse Riding', 'Rowing Machine', 'Scooter', 'Ski Touring', 'Skiing', 'Sledging',
    'Snowboarding', 'Swimming', 'Tennis', 'Volleyball', 'Walking the Dog', 'Wheelchair',
    'Workout', 'Yoga', 'Zumba'
  ];

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const routes = await SavedRoutesService.getAllRoutes();
    setSavedRoutes(routes);
  };

  const handleStart = () => {
    startTracking();
  };

  const handleStop = async () => {
    stopTracking();
    if (distance > 0) {
      try {
        const runData = {
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
          activityType,
        };

        // Save to local database
        await saveRun(runData);

        // Try to save to Apple Health
        const healthSaved = await HealthKitService.saveWorkout({
          type: activityType,
          startDate: new Date(runData.startTime),
          endDate: new Date(runData.endTime),
          duration: runData.duration,
          distance: runData.distance,
          calories: runData.calories,
          route: currentRunPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
        });

        // Check for achievements and send notifications
        if (distance > 5000) {
          await sendAchievementNotification('5K Milestone!', `You just completed ${(distance / 1000).toFixed(2)} km!`);
        }

        Alert.alert(
          'Activity Saved', 
          `Your ${activityType} session has been saved!${healthSaved ? '\n✓ Synced to Apple Health' : ''}`
        );
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to save activity.');
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

  // --- Modals ---

  const ActivityModal = () => (
    <Modal visible={showActivityModal} animationType="slide" transparent={true} onRequestClose={() => setShowActivityModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <Text style={styles.modalTitle}>Choose Activity</Text>
          <FlatList
            data={activities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.modalOption, item === activityType && { backgroundColor: '#f9731620' }]} 
                onPress={() => { setActivityType(item); setShowActivityModal(false); }}
              >
                <Ionicons 
                  name={item === 'Running' ? 'walk' : item === 'Cycling' ? 'bicycle' : 'fitness'} 
                  size={24} 
                  color={item === activityType ? "#f97316" : THEME.colors.text} 
                />
                <Text style={[styles.modalOptionText, item === activityType && { color: "#f97316", fontWeight: 'bold' }]}>{item}</Text>
                {item === activityType && <Ionicons name="checkmark" size={20} color="#f97316" />}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowActivityModal(false)}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const GoalModal = () => (
    <Modal visible={showGoalModal} animationType="slide" transparent={true} onRequestClose={() => setShowGoalModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set a Goal</Text>
          <TouchableOpacity style={styles.modalOption} onPress={() => { setGoal({ type: 'distance', value: 5000 }); setShowGoalModal(false); }}>
            <Ionicons name="navigate" size={24} color="#f97316" />
            <Text style={styles.modalOptionText}>5 km Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => { setGoal({ type: 'distance', value: 10000 }); setShowGoalModal(false); }}>
            <Ionicons name="navigate" size={24} color="#f97316" />
            <Text style={styles.modalOptionText}>10 km Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => { setGoal({ type: 'duration', value: 1800 }); setShowGoalModal(false); }}>
            <Ionicons name="time" size={24} color="#f97316" />
            <Text style={styles.modalOptionText}>30 min Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowGoalModal(false)}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const RoutesModal = () => (
    <Modal visible={showRoutesModal} animationType="slide" transparent={true} onRequestClose={() => setShowRoutesModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose a Route</Text>
          {savedRoutes.length === 0 ? (
            <Text style={styles.emptyText}>No saved routes yet.</Text>
          ) : (
            <FlatList
              data={savedRoutes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedRoute(item); setShowRoutesModal(false); }}>
                  <Ionicons name="map" size={24} color="#f97316" />
                  <View>
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                    <Text style={styles.modalOptionSubtext}>{(item.distance / 1000).toFixed(2)} km</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRoutesModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AICoachModal = () => (
    <Modal visible={showAICoachModal} animationType="slide" transparent={true} onRequestClose={() => setShowAICoachModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>AI Coach Settings</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Voice Coach</Text>
            <Switch value={aiCoachEnabled} onValueChange={setAiCoachEnabled} trackColor={{ false: '#767577', true: '#f97316' }} />
          </View>
          <Text style={styles.modalDescription}>
            The AI Coach will give you real-time feedback on your pace, cadence, and form during your run.
          </Text>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAICoachModal(false)}>
            <Text style={styles.modalCloseText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const MusicModal = () => (
    <Modal visible={showMusicModal} animationType="slide" transparent={true} onRequestClose={() => setShowMusicModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Music Control</Text>
          <View style={styles.musicControls}>
            <TouchableOpacity onPress={() => Alert.alert('Prev', 'Previous track')}>
              <Ionicons name="play-skip-back" size={32} color={THEME.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsPlayingMusic(!isPlayingMusic)}>
              <Ionicons name={isPlayingMusic ? "pause-circle" : "play-circle"} size={64} color="#f97316" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Next', 'Next track')}>
              <Ionicons name="play-skip-forward" size={32} color={THEME.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.musicStatus}>{isPlayingMusic ? 'Now Playing: High Energy Mix' : 'Music Paused'}</Text>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowMusicModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header with Weather */}
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              onPress={() => setShowActivityModal(true)}
            >
              <Text style={styles.headerTitle}>{activityType}</Text>
              <Ionicons name="chevron-down" size={24} color="#f97316" />
            </TouchableOpacity>
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
            <View style={styles.mapOverlay} pointerEvents="none">
              <Ionicons name="location" size={32} color="#f97316" />
              <Text style={styles.mapOverlayText}>Ready to track your run</Text>
            </View>
          )}
        </View>

        {/* Stats Quick Bar (2x2 Grid) */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
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
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
              <Text style={styles.statUnit}>time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>CALORIES</Text>
              <Text style={styles.statValue}>{calories}</Text>
              <Text style={styles.statUnit}>kcal</Text>
            </View>
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
              <Text style={styles.startButtonText}>START {activityType.toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Ionicons name="stop" size={24} color="#fff" />
            <Text style={styles.stopButtonText}>STOP</Text>
          </TouchableOpacity>
        )}

        {/* Sub-actions */}
        {!isTracking && (
          <View style={styles.subActions}>
            <TouchableOpacity 
              style={styles.subAction}
              onPress={() => setShowGoalModal(true)}
            >
              <Ionicons name="flag" size={18} color="#f97316" />
              <Text style={styles.subActionText}>{goal.type !== 'none' ? `${goal.value} ${goal.type}` : 'Set Goal'}</Text>
            </TouchableOpacity>
            <View style={styles.subActionDivider} />
            <TouchableOpacity 
              style={styles.subAction}
              onPress={() => setShowRoutesModal(true)}
            >
              <Ionicons name="map" size={18} color="#f97316" />
              <Text style={styles.subActionText}>{selectedRoute ? selectedRoute.name : 'Choose Route'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Mini Menu */}
        <View style={styles.miniMenu}>
          <TouchableOpacity 
            style={styles.miniMenuItem}
            onPress={() => setShowRoutesModal(true)}
          >
            <Ionicons name="navigate-circle" size={24} color={THEME.colors.textSecondary} />
            <Text style={styles.miniMenuText}>Routes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.miniMenuItem}
            onPress={() => setShowAICoachModal(true)}
          >
            <Ionicons name="sparkles" size={24} color={aiCoachEnabled ? "#f97316" : THEME.colors.textSecondary} />
            <Text style={[styles.miniMenuText, aiCoachEnabled && { color: "#f97316" }]}>AI Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.miniMenuItem}
            onPress={() => setShowMusicModal(true)}
          >
            <Ionicons name="musical-notes" size={24} color={THEME.colors.textSecondary} />
            <Text style={styles.miniMenuText}>Music</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <ActivityModal />
      <GoalModal />
      <RoutesModal />
      <AICoachModal />
      <MusicModal />
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
  statsGrid: { padding: 16, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.border },
  statLabel: { fontSize: 11, fontWeight: '600', color: THEME.colors.textSecondary, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#f97316', marginBottom: 2 },
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
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: THEME.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 20, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  modalOptionText: { fontSize: 16, color: THEME.colors.text, fontWeight: '500', flex: 1 },
  modalOptionSubtext: { fontSize: 12, color: THEME.colors.textSecondary },
  modalCloseButton: { marginTop: 24, padding: 16, alignItems: 'center', backgroundColor: THEME.colors.background, borderRadius: 12 },
  modalCloseText: { fontSize: 16, fontWeight: '600', color: THEME.colors.text },
  emptyText: { textAlign: 'center', color: THEME.colors.textSecondary, marginTop: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  switchLabel: { fontSize: 16, color: THEME.colors.text },
  modalDescription: { fontSize: 14, color: THEME.colors.textSecondary, lineHeight: 20, textAlign: 'center' },
  musicControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32, marginBottom: 24 },
  musicStatus: { textAlign: 'center', color: '#f97316', fontSize: 14, fontWeight: '500' },
});
