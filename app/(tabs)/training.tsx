import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Zap, Route, Timer, Activity, TrendingUp, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '../../src/theme';
import { getTrainingPlans } from '../../src/services/TrainingPlanService';
import { TrainingPlan } from '../../src/types';

export default function TrainingScreen() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);

  useEffect(() => {
    setPlans(getTrainingPlans());
  }, []);

  const weeklyStats = {
    totalDistance: '45.8 km',
    totalTime: '4h 12m',
    avgPace: '5:12 /km',
    runs: 5,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ready to Run</Text>
        <Text style={styles.headerSubtitle}>Let's crush your goals today</Text>
      </View>

      {/* Start Run Card */}
      <TouchableOpacity
        style={styles.startRunCardContainer}
        onPress={() => router.push('/(tabs)/index')} // Assuming index is the run tracking screen
      >
        <LinearGradient
          colors={[THEME.colors.primary, THEME.colors.primaryHighlight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startRunCard}
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <View style={styles.startRunContent}>
            <View style={styles.startRunHeader}>
              <View style={styles.iconBox}>
                <Zap size={28} color="#fff" fill="currentColor" />
              </View>
              <View>
                <Text style={styles.startRunTitle}>Start Run</Text>
                <Text style={styles.startRunSubtitle}>Track your performance</Text>
              </View>
            </View>

            <View style={styles.beginButton}>
              <Play size={20} color={THEME.colors.primary} fill="currentColor" />
              <Text style={styles.beginButtonText}>Begin Training</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Weekly Summary */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <Text style={styles.runCount}>{weeklyStats.runs} runs</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Route size={20} color={THEME.colors.primaryHighlight} style={styles.statIcon} />
            <Text style={styles.statValue}>{weeklyStats.totalDistance}</Text>
            <Text style={styles.statLabel}>Total Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Timer size={20} color={THEME.colors.primaryHighlight} style={styles.statIcon} />
            <Text style={styles.statValue}>{weeklyStats.totalTime}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        <View style={styles.paceCard}>
          <View style={styles.paceContent}>
            <View style={styles.paceInfo}>
              <Activity size={20} color={THEME.colors.primaryHighlight} />
              <View>
                <Text style={styles.paceLabel}>Average Pace</Text>
                <Text style={styles.paceValue}>{weeklyStats.avgPace}</Text>
              </View>
            </View>
            <TrendingUp size={24} color={THEME.colors.success} />
          </View>
        </View>
      </View>

      {/* Training Plans */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Training Plans</Text>
          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.plansList}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              onPress={() => router.push(`/training/${plan.id}`)}
            >
              <View style={styles.planContent}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDetails}>{plan.durationWeeks} weeks • {plan.level}</Text>
                  <View style={styles.planTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{plan.weeks[0].workouts.length} days/week</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={THEME.colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  startRunCardContainer: {
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  startRunCard: {
    borderRadius: 24,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -64,
    left: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  startRunContent: {
    zIndex: 1,
  },
  startRunHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startRunTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  startRunSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  beginButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  beginButtonText: {
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  runCount: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primaryHighlight,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Gray 800 with opacity
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  paceCard: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)', // Orange tint
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  paceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  paceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primaryHighlight,
  },
  plansList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
  },
  planTags: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primaryHighlight,
  },
});
