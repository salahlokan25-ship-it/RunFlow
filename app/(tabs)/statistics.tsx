import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { TrendingUp, Clock, Award, Target } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { THEME } from '../../src/theme';
import { getAllRuns } from '../../src/services/RunService';
import { Run } from '../../src/types';
import { formatDistance, formatDuration, formatPace } from '../../src/utils/formatters';

export default function StatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalTime: 0,
    avgPace: 0,
    runCount: 0,
    fastest5k: 0,
    longestRun: 0,
    bestPace: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const runs = await getAllRuns();

      if (runs.length === 0) {
        setStats({
          totalDistance: 0,
          totalTime: 0,
          avgPace: 0,
          runCount: 0,
          fastest5k: 0,
          longestRun: 0,
          bestPace: 0,
        });
        return;
      }

      const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0);
      const totalTime = runs.reduce((acc, run) => acc + run.duration, 0);
      const avgPace = runs.reduce((acc, run) => acc + run.avgPace, 0) / runs.length;

      // Personal Bests
      const longestRun = Math.max(...runs.map(r => r.distance));
      const bestPace = Math.min(...runs.map(r => r.avgPace));

      // Fastest 5K logic (simplified: best pace * 5km)
      // In a real app, you'd scan split data for the fastest contiguous 5k segment
      const runsOver5k = runs.filter(r => r.distance >= 5000);
      const fastest5k = runsOver5k.length > 0
        ? Math.min(...runsOver5k.map(r => r.duration * (5000 / r.distance)))
        : 0;

      setStats({
        totalDistance,
        totalTime,
        avgPace,
        runCount: runs.length,
        fastest5k,
        longestRun,
        bestPace,
      });

      // Prepare Line Chart Data (Last 10 runs pace/distance)
      const lastRuns = runs.slice(0, 10).reverse();
      const lineData = lastRuns.map(r => ({
        value: r.distance / 1000, // Distance in km
        label: new Date(r.startTime).getDate().toString(),
        dataPointText: (r.distance / 1000).toFixed(1)
      }));
      setChartData(lineData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const barData = [
    { value: 65, label: 'Mon' },
    { value: 45, label: 'Tue' },
    { value: 75, label: 'Wed' },
    { value: 55, label: 'Thu' },
    { value: 85, label: 'Fri' },
    { value: 70, label: 'Sat' },
    { value: 95, label: 'Sun' },
  ];

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
        <Text style={styles.headerTitle}>Performance</Text>
        <Text style={styles.headerSubtitle}>Track your progress</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <LinearGradient
          colors={[THEME.colors.primary, '#C2410C']}
          style={styles.metricCardPrimary}
        >
          <TrendingUp size={24} color="#FED7AA" style={styles.metricIcon} />
          <Text style={styles.metricValuePrimary}>{formatDistance(stats.totalDistance)}</Text>
          <Text style={styles.metricLabelPrimary}>Total Distance (km)</Text>
          <View style={styles.metricBadgePrimary}>
            <Text style={styles.metricBadgeTextPrimary}>{stats.runCount} runs total</Text>
          </View>
        </LinearGradient>

        <View style={styles.metricCardSecondary}>
          <Clock size={24} color={THEME.colors.primaryHighlight} style={styles.metricIcon} />
          <Text style={styles.metricValueSecondary}>{formatDuration(stats.totalTime)}</Text>
          <Text style={styles.metricLabelSecondary}>Total Time</Text>
        </View>
      </View>

      {/* Performance Chart */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Distance Trend</Text>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>Last 7 days</Text>
          </View>
        </View>

        <BarChart
          data={barData}
          barWidth={22}
          spacing={14}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: THEME.colors.textTertiary }}
          noOfSections={3}
          maxValue={100}
          frontColor={THEME.colors.primaryHighlight}
          gradientColor={THEME.colors.primary}
          showGradient
          xAxisLabelTextStyle={{ color: THEME.colors.textTertiary, fontSize: 10 }}
        />
      </View>

      {/* Progress Line Chart */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Distance Trend (Last 10 Runs)</Text>
        </View>
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            color={THEME.colors.primary}
            thickness={3}
            curved
            hideRules
            hideYAxisText
            yAxisThickness={0}
            xAxisThickness={0}
            areaChart
            startFillColor={THEME.colors.primary}
            startOpacity={0.2}
            endOpacity={0.0}
            initialSpacing={10}
            noOfSections={3}
            xAxisLabelTextStyle={{ color: THEME.colors.textTertiary, fontSize: 10 }}
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: 'lightgray',
              pointerStripWidth: 2,
              pointerColor: 'lightgray',
              radius: 6,
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: false,
              //   pointerLabelComponent: items => {
              //     return (
              //       <View
              //         style={{
              //           height: 90,
              //           width: 100,
              //           justifyContent: 'center',
              //           marginTop: -30,
              //           marginLeft: -40,
              //         }}>
              //         <Text style={{color: 'white', fontSize: 14, marginBottom:6, textAlign:'center'}}>
              //           {items[0].date}
              //         </Text>
              //         <View style={{paddingHorizontal:14,paddingVertical:6, borderRadius:16, backgroundColor:'white'}}>
              //           <Text style={{fontWeight: 'bold',textAlign:'center'}}>
              //             {items[0].value + 'km'}
              //           </Text>
              //         </View>
              //       </View>
              //     );
              //   },
            }}
          />
        ) : (
          <Text style={{ color: THEME.colors.textSecondary, textAlign: 'center', padding: 20 }}>No runs recorded yet</Text>
        )}
      </View>

      {/* Personal Bests */}
      <View style={styles.pbCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Award size={20} color={THEME.colors.primaryHighlight} />
            <Text style={styles.cardTitle}>Personal Bests</Text>
          </View>
        </View>

        <View style={styles.pbList}>
          <View style={styles.pbItem}>
            <View>
              <Text style={styles.pbLabel}>Fastest 5K</Text>
              <Text style={styles.pbValue}>{stats.fastest5k > 0 ? formatDuration(stats.fastest5k) : '--:--'}</Text>
            </View>
          </View>

          <View style={styles.pbItem}>
            <View>
              <Text style={styles.pbLabel}>Longest Run</Text>
              <Text style={styles.pbValue}>{formatDistance(stats.longestRun)} km</Text>
            </View>
          </View>

          <View style={styles.pbItem}>
            <View>
              <Text style={styles.pbLabel}>Best Pace</Text>
              <Text style={styles.pbValue}>{stats.bestPace > 0 ? formatPace(stats.bestPace) : '--:--'} /km</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Monthly Goals */}
      <View style={styles.goalCard}>
        <View style={styles.cardTitleRow}>
          <Target size={20} color={THEME.colors.primaryHighlight} />
          <Text style={styles.cardTitle}>Monthly Goal</Text>
        </View>

        <View style={styles.goalContent}>
          <View style={styles.goalStats}>
            <Text style={styles.goalProgress}>{formatDistance(stats.totalDistance)} km / 200 km</Text>
            <Text style={styles.goalPercentage}>{Math.min(100, Math.round((stats.totalDistance / 200000) * 100))}%</Text>
          </View>

          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[THEME.colors.primary, THEME.colors.primaryHighlight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${Math.min(100, (stats.totalDistance / 200000) * 100)}%` }]}
            />
          </View>

          <Text style={styles.goalRemaining}>
            {Math.max(0, 200 - (stats.totalDistance / 1000)).toFixed(1)} km to reach your goal
          </Text>
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metricCardPrimary: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  metricCardSecondary: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Gray 800
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  metricIcon: {
    marginBottom: 12,
  },
  metricValuePrimary: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  metricLabelPrimary: {
    fontSize: 12,
    color: '#FED7AA', // Orange 200
  },
  metricBadgePrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  metricBadgeTextPrimary: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  metricValueSecondary: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  metricLabelSecondary: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  chartCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  dropdown: {
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  dropdownText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  pbCard: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)', // Orange tint
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pbList: {
    gap: 12,
  },
  pbItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.5)', // Gray 900 with opacity
    padding: 12,
    borderRadius: 12,
  },
  pbLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  pbValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  goalCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  goalContent: {
    gap: 12,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalProgress: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.primaryHighlight,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  goalRemaining: {
    fontSize: 12,
    color: THEME.colors.textTertiary,
    textAlign: 'center',
  },
});
