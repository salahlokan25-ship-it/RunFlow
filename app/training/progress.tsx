import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getActiveTrainingPlan, getCompletedWorkouts, getWeeklyProgress } from '../../src/services/ProgressService';
import { getTrainingPlanById, getCurrentWeekWorkouts } from '../../src/services/TrainingPlanService';
import { UserTrainingPlan, TrainingPlan, Workout, CompletedWorkout } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

export default function ProgressScreen() {
  const [activePlan, setActivePlan] = useState<UserTrainingPlan | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [weekWorkouts, setWeekWorkouts] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(new Set());
  const [weekProgress, setWeekProgress] = useState({ completed: 0, total: 0 });

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    const active = await getActiveTrainingPlan();
    if (!active) {
      setActivePlan(null);
      return;
    }

    setActivePlan(active);
    
    const trainingPlan = getTrainingPlanById(active.planId);
    setPlan(trainingPlan);

    if (trainingPlan) {
      const workouts = getCurrentWeekWorkouts(active.planId, active.currentWeek);
      setWeekWorkouts(workouts);

      const completed = await getCompletedWorkouts();
      setCompletedWorkouts(new Set(completed.map((w) => w.workoutId)));

      const progress = await getWeeklyProgress(
        active.planId,
        active.currentWeek,
        workouts.map((w) => w.id)
      );
      setWeekProgress(progress);
    }
  };

  if (!activePlan || !plan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={64} color={THEME.colors.textSecondary} />
          <Text style={styles.emptyText}>No Active Training Plan</Text>
          <Text style={styles.emptySubtext}>Start a plan to track your progress</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/training')}
          >
            <Text style={styles.browseButtonText}>Browse Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const progressPercentage = weekProgress.total > 0
    ? (weekProgress.completed / weekProgress.total) * 100
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Active Plan Card */}
        <View style={styles.planCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDistance}>{plan.distance}</Text>
          <View style={styles.weekIndicator}>
            <Text style={styles.weekText}>Week {activePlan.currentWeek} of {plan.durationWeeks}</Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>This Week's Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {weekProgress.completed} of {weekProgress.total} workouts completed
          </Text>
        </View>

        {/* Workouts List */}
        <View style={styles.workoutsCard}>
          <Text style={styles.sectionTitle}>This Week's Workouts</Text>
          {weekWorkouts.map((workout) => {
            const isCompleted = completedWorkouts.has(workout.id);
            return (
              <View key={workout.id} style={styles.workoutRow}>
                <View style={styles.workoutLeft}>
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={isCompleted ? THEME.colors.secondary : THEME.colors.textSecondary}
                  />
                  <View style={styles.workoutInfo}>
                    <Text style={[styles.workoutName, isCompleted && styles.completedText]}>
                      {workout.name}
                    </Text>
                    <Text style={styles.workoutType}>{workout.type}</Text>
                  </View>
                </View>
                {!isCompleted && (
                  <TouchableOpacity
                    style={styles.startWorkoutButton}
                    onPress={() => {
                      // Navigate to start screen with workout
                      router.push('/(tabs)/');
                    }}
                  >
                    <Text style={styles.startWorkoutText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  browseButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: THEME.colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  planDistance: {
    fontSize: 18,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  weekIndicator: {
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  weekText: {
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  workoutsCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
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
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textSecondary,
  },
  workoutType: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textTransform: 'capitalize',
  },
  startWorkoutButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startWorkoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
