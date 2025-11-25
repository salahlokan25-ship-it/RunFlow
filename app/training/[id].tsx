import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getTrainingPlanById } from '../../src/services/TrainingPlanService';
import { startTrainingPlan } from '../../src/services/ProgressService';
import { TrainingPlan } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

export default function TrainingPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    if (id) {
      const trainingPlan = getTrainingPlanById(id);
      setPlan(trainingPlan);
    }
  }, [id]);

  const handleStartPlan = async () => {
    if (!plan) return;
    
    Alert.alert(
      'Start Training Plan',
      `Are you ready to start the ${plan.name} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await startTrainingPlan(plan.id);
              Alert.alert('Success', 'Training plan started! Check your progress.');
              router.push('/training/progress');
            } catch (error) {
              Alert.alert('Error', 'Failed to start training plan.');
            }
          },
        },
      ]
    );
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'easy':
        return 'walk';
      case 'tempo':
        return 'speedometer';
      case 'intervals':
        return 'flash';
      case 'long':
        return 'time';
      case 'rest':
        return 'bed';
      default:
        return 'fitness';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plan.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Plan Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.planDistance}>{plan.distance}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={20} color={THEME.colors.primary} />
              <Text style={styles.statText}>{plan.durationWeeks} weeks</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={20} color={THEME.colors.primary} />
              <Text style={styles.statText}>{plan.level}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startPlanButton} onPress={handleStartPlan}>
            <Text style={styles.startPlanText}>Start This Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Breakdown */}
        <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
        {plan.weeks.map((week) => (
          <View key={week.weekNumber} style={styles.weekCard}>
            <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>
            {week.workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutRow}>
                <View style={styles.workoutLeft}>
                  <Ionicons
                    name={getWorkoutIcon(workout.type) as any}
                    size={20}
                    color={THEME.colors.primary}
                  />
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDescription}>{workout.description}</Text>
                  </View>
                </View>
                <Text style={styles.workoutDuration}>
                  {workout.duration ? formatDuration(workout.duration) : `${(workout.distance || 0) / 1000}km`}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: THEME.colors.text,
    textAlign: 'center',
    marginTop: 50,
  },
  overviewCard: {
    backgroundColor: THEME.colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  planDistance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: THEME.colors.text,
    textTransform: 'capitalize',
  },
  startPlanButton: {
    backgroundColor: THEME.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startPlanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  weekCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  workoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  workoutDescription: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  workoutDuration: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
});
