import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { getAllRuns } from '../../src/services/RunService';
import { Run } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

export default function DiaryScreen() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    const allRuns = await getAllRuns();
    setRuns(allRuns);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  const formatPace = (paceValue: number) => {
    const mins = Math.floor(paceValue);
    const secs = Math.round((paceValue - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const renderRunCard = ({ item }: { item: Run }) => (
    <TouchableOpacity
      style={styles.runCard}
      onPress={() => router.push(`/run/${item.id}`)}
    >
      <View style={styles.runCardHeader}>
        <Text style={styles.runDate}>{formatDate(item.startTime)}</Text>
        <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="navigate" size={16} color="#f97316" />
          <Text style={styles.statText}>{formatDistance(item.distance)} km</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color="#3b82f6" />
          <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="speedometer" size={16} color="#10b981" />
          <Text style={styles.statText}>{formatPace(item.pace)}/km</Text>
        </View>
      </View>

      <View style={styles.miniMapPlaceholder}>
        <Ionicons name="map" size={24} color={THEME.colors.textSecondary} />
        <Text style={styles.miniMapText}>Route Preview</Text>
      </View>

      <View style={styles.runCardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="flame" size={14} color="#ef4444" />
          <Text style={styles.footerText}>{item.calories} cal</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="heart" size={14} color="#ec4899" />
          <Text style={styles.footerText}>-- bpm</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diary</Text>
        <TouchableOpacity onPress={() => Alert.alert('Filter', 'Filter options coming soon!')}>
          <Ionicons name="filter" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.monthSelector}
        contentContainerStyle={styles.monthSelectorContent}
      >
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthButton,
              selectedMonth === index && styles.monthButtonActive,
            ]}
            onPress={() => setSelectedMonth(index)}
          >
            <Text
              style={[
                styles.monthText,
                selectedMonth === index && styles.monthTextActive,
              ]}
            >
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Run List */}
      <FlatList
        data={runs}
        renderItem={renderRunCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.runList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="footsteps" size={64} color={THEME.colors.textSecondary} />
            <Text style={styles.emptyText}>No runs yet</Text>
            <Text style={styles.emptySubtext}>Start your first run to see it here!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: THEME.colors.text },
  monthSelector: { backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  monthSelectorContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  monthButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: THEME.colors.background },
  monthButtonActive: { backgroundColor: '#f97316' },
  monthText: { fontSize: 14, fontWeight: '600', color: THEME.colors.textSecondary },
  monthTextActive: { color: '#fff' },
  runList: { padding: 16 },
  runCard: { backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.colors.border },
  runCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  runDate: { fontSize: 16, fontWeight: 'bold', color: THEME.colors.text },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  statText: { fontSize: 13, color: THEME.colors.text, fontWeight: '500' },
  statDivider: { width: 1, height: 16, backgroundColor: THEME.colors.border },
  miniMapPlaceholder: { height: 80, backgroundColor: THEME.colors.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniMapText: { fontSize: 12, color: THEME.colors.textSecondary, marginTop: 4 },
  runCardFooter: { flexDirection: 'row', gap: 16 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: THEME.colors.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: THEME.colors.text, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: THEME.colors.textSecondary, marginTop: 4 },
});
