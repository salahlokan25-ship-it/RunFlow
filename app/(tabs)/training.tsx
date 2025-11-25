import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getTrainingPlans } from '../../src/services/TrainingPlanService';
import { TrainingPlan } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { router } from 'expo-router';

export default function TrainingScreen() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const allPlans = getTrainingPlans();
    setPlans(allPlans);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return THEME.colors.secondary;
      case 'intermediate':
        return THEME.colors.warning;
      case 'advanced':
        return THEME.colors.error;
      default:
        return THEME.colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plans</Text>
        <Text style={styles.headerSubtitle}>
          Structured programs to help you reach your goals
        </Text>
      </View>

      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={styles.planCard}
          onPress={() => router.push(`/training/${plan.id}`)}
        >
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDistance}>{plan.distance}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(plan.level) }]}>
              <Text style={styles.levelText}>{plan.level.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.planDescription}>{plan.description}</Text>

          <View style={styles.planStats}>
            <View style={styles.planStat}>
              <Ionicons name="calendar" size={16} color={THEME.colors.textSecondary} />
              <Text style={styles.planStatText}>{plan.durationWeeks} weeks</Text>
            </View>
            <View style={styles.planStat}>
              <Ionicons name="fitness" size={16} color={THEME.colors.textSecondary} />
              <Text style={styles.planStatText}>{plan.weeks.reduce((acc, w) => acc + w.workouts.length, 0)} workouts</Text>
            </View>
          </View>

          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>View Plan</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  planCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  planDistance: {
    fontSize: 16,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  planStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planStatText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  startButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
