import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Activity, Route, Timer, Zap } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { THEME } from '../../src/theme';
import { getAllRuns } from '../../src/services/RunService';
import { Run } from '../../src/types';
import { formatDistance, formatDuration, formatPace, formatDate, formatTime } from '../../src/utils/formatters';

export default function DiaryScreen() {
  const [filter, setFilter] = useState<'All' | 'Runs' | 'Races'>('All');
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadRuns();
    }, [])
  );

  const loadRuns = async () => {
    try {
      const allRuns = await getAllRuns();
      setRuns(allRuns);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setLoading(false);
    }
  };

  // For now, we assume all activities are "Runs" as we don't distinguish yet
  const filteredRuns = filter === 'All' ? runs : runs;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Diary</Text>
        <Text style={styles.headerSubtitle}>Your running history</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['All', 'Runs', 'Races'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activities List */}
      <View style={styles.activitiesList}>
        {filteredRuns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No runs recorded yet.</Text>
            <Text style={styles.emptyStateSubtext}>Go to the Training tab to start your first run!</Text>
          </View>
        ) : (
          filteredRuns.map((run) => (
            <TouchableOpacity key={run.id} style={styles.activityCard}>
              <View style={styles.cardHeader}>
                <View style={styles.activityInfo}>
                  <View style={styles.iconBox}>
                    <Activity size={24} color={THEME.colors.primaryHighlight} />
                  </View>
                  <View>
                    <Text style={styles.activityTitle}>Run</Text>
                    <Text style={styles.activityDate}>{formatDate(run.startTime)} • {formatTime(run.startTime)}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Route size={16} color={THEME.colors.primaryHighlight} style={styles.statIcon} />
                  <Text style={styles.statValue}>{formatDistance(run.distance)}</Text>
                  <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statItem}>
                  <Timer size={16} color={THEME.colors.primaryHighlight} style={styles.statIcon} />
                  <Text style={styles.statValue}>{formatDuration(run.duration)}</Text>
                  <Text style={styles.statLabel}>time</Text>
                </View>
                <View style={styles.statItem}>
                  <Activity size={16} color={THEME.colors.primaryHighlight} style={styles.statIcon} />
                  <Text style={styles.statValue}>{formatPace(run.avgPace)}</Text>
                  <Text style={styles.statLabel}>/km</Text>
                </View>
                <View style={styles.statItem}>
                  <Zap size={16} color={THEME.colors.primaryHighlight} style={styles.statIcon} />
                  <Text style={styles.statValue}>{run.calories}</Text>
                  <Text style={styles.statLabel}>kcal</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  filterTabActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  activitiesList: {
    gap: 16,
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.success,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
});
