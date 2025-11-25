import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { getAllRuns } from '../../src/services/RunService';
import { Run } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    const allRuns = await getAllRuns();
    setRuns(allRuns);
  };

  const getFilteredRuns = () => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    if (selectedPeriod === 'week') return runs.filter(r => r.startTime >= weekAgo);
    if (selectedPeriod === 'month') return runs.filter(r => r.startTime >= monthAgo);
    return runs;
  };

  const filteredRuns = getFilteredRuns();
  const totalDistance = filteredRuns.reduce((sum, r) => sum + r.distance, 0) / 1000;
  const avgPace = filteredRuns.length > 0 ? filteredRuns.reduce((sum, r) => sum + r.pace, 0) / filteredRuns.length : 0;
  const totalCalories = filteredRuns.reduce((sum, r) => sum + r.calories, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      <View style={styles.tabs}>
        {(['week', 'month', 'all'] as const).map(period => (
          <TouchableOpacity
            key={period}
            style={[styles.tab, selectedPeriod === period && styles.tabActive]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.tabText, selectedPeriod === period && styles.tabTextActive]}>
              {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Overview Card */}
        <LinearGradient
          colors={['#f97316', '#ea580c']}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.overviewTitle}>
            {selectedPeriod === 'week' ? 'This Week' : selectedPeriod === 'month' ? 'This Month' : 'All Time'}
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.overviewLabel}>km</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{avgPace.toFixed(2)}</Text>
              <Text style={styles.overviewLabel}>avg pace</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{totalCalories}</Text>
              <Text style={styles.overviewLabel}>calories</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Chart Area */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Pace Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="trending-down" size={32} color="#3b82f6" />
            <Text style={styles.chartText}>Line chart coming soon</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distance per Run</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={32} color="#f97316" />
            <Text style={styles.chartText}>Bar chart coming soon</Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Ionicons name="bulb" size={20} color="#f97316" />
            <Text style={styles.insightsTitle}>AI Insights</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={16} color="#10b981" />
            <Text style={styles.insightText}>Your pace improved 8% vs last week</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="sunny" size={16} color="#f59e0b" />
            <Text style={styles.insightText}>You run faster on cooler days</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="time" size={16} color="#3b82f6" />
            <Text style={styles.insightText}>Morning runs show 12% better performance</Text>
          </View>
        </View>

        {/* Achievement Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
            {[
              { icon: 'flame', color: '#ef4444', label: '7-Day Streak' },
              { icon: 'trophy', color: '#f59e0b', label: '50km Month' },
              { icon: 'star', color: '#eab308', label: 'Personal Best' },
              { icon: 'rocket', color: '#8b5cf6', label: 'Speed Demon' },
            ].map((badge, index) => (
              <View key={index} style={styles.badgeCard}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color + '20' }]}>
                  <Ionicons name={badge.icon as any} size={24} color={badge.color} />
                </View>
                <Text style={styles.badgeLabel}>{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: THEME.colors.text },
  tabs: { flexDirection: 'row', backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#f97316' },
  tabText: { fontSize: 14, fontWeight: '600', color: THEME.colors.textSecondary },
  tabTextActive: { color: '#f97316' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  overviewCard: { borderRadius: 20, padding: 24, marginBottom: 16 },
  overviewTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 16, opacity: 0.9 },
  overviewStats: { flexDirection: 'row' },
  overviewStat: { flex: 1, alignItems: 'center' },
  overviewValue: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  overviewLabel: { fontSize: 12, color: '#fff', opacity: 0.8 },
  overviewDivider: { width: 1, backgroundColor: '#fff', opacity: 0.3, marginHorizontal: 12 },
  chartCard: { backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.colors.border },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 12 },
  chartPlaceholder: { height: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background, borderRadius: 12 },
  chartText: { fontSize: 13, color: THEME.colors.textSecondary, marginTop: 8 },
  insightsCard: { backgroundColor: '#f973161a', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f9731640' },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  insightsTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.colors.text },
  insightItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  insightText: { fontSize: 14, color: THEME.colors.text, flex: 1 },
  badgesSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 12 },
  badgesScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  badgeCard: { alignItems: 'center', marginRight: 16, width: 100 },
  badgeIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeLabel: { fontSize: 12, color: THEME.colors.text, textAlign: 'center', fontWeight: '500' },
});
