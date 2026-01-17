import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Settings, Award, Target, Activity, MapPin } from 'lucide-react-native';
import { THEME } from '../../src/theme';
import { auth } from '../../src/config/firebase';
import { signOut } from 'firebase/auth';
import { deleteAccount } from '../../src/services/AuthService';
import { getAllRuns } from '../../src/services/RunService';
import { formatPace } from '../../src/utils/formatters';

export default function SettingsScreen() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    runCount: 0,
    totalDistance: 0,
    avgPace: 0,
  });

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || '');
      setUserName(auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Runner');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const runs = await getAllRuns();
      if (runs.length > 0) {
        const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0);
        const avgPace = runs.reduce((acc, run) => acc + run.avgPace, 0) / runs.length;
        setStats({
          runCount: runs.length,
          totalDistance: totalDistance / 1000, // Convert to km
          avgPace,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const performDeletion = async () => {
    setDeleting(true);
    try {
      console.log('🔴 DELETION STARTED');

      // Step 1: Delete user data from Firestore
      await deleteAccount();
      console.log('✅ Firestore data deleted');

      // Step 2: Sign out (this also deletes auth user)
      await signOut(auth);
      console.log('✅ Signed out successfully');

      // Step 3: Navigate to login
      router.replace('/auth/login');
      console.log('✅ Navigation complete');

    } catch (error: any) {
      console.error('❌ DELETION ERROR:', error);
      setDeleting(false);

      // Show specific error messages
      if (error?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Re-authentication Required',
          'For security, you must sign out and sign back in, then try deleting again.',
          [
            {
              text: 'Sign Out Now',
              onPress: async () => {
                await signOut(auth);
                router.replace('/auth/login');
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Deletion Failed',
          `Error: ${error?.message || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleDeleteAccount = () => {
    if (deleting) return; // Prevent multiple taps

    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            // Execute immediately, not in async callback
            performDeletion();
          },
        },
      ]
    );
  };


  const SettingRow = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>
          <Icon size={20} color={THEME.colors.primaryHighlight} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color={THEME.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      {/* Profile Card */}
      <TouchableOpacity
        style={styles.profileCardContainer}
        onPress={() => router.push('/settings/profile')}
      >
        <LinearGradient
          colors={[THEME.colors.primary, '#C2410C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
            <View style={styles.editIcon}>
              <ChevronRight size={20} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.runCount}</Text>
          <Text style={styles.statLabel}>Runs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalDistance.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total KM</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgPace > 0 ? formatPace(stats.avgPace) : '--:--'}</Text>
          <Text style={styles.statLabel}>Avg Pace</Text>
        </View>
      </View>

      {/* Settings Groups */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon={Target}
            title="Goals & Targets"
            onPress={() => router.push('/settings/goals')}
          />
          <SettingRow
            icon={Activity}
            title="Units & Display"
            onPress={() => router.push('/settings/units')}
          />
          <SettingRow
            icon={MapPin}
            title="Privacy & Location"
            onPress={() => router.push('/settings/privacy')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>APP</Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon={Settings}
            title="General Settings"
            onPress={() => router.push('/settings/general')}
          />
          <SettingRow
            icon={Award}
            title="Achievements"
            onPress={() => router.push('/settings/achievements')}
          />
        </View>
      </View>

      {/* Sign Out */}
      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: '#fff' }]}>Sign Out</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            backgroundColor: THEME.colors.error,
            borderColor: THEME.colors.error,
            marginTop: 12,
            opacity: deleting ? 0.5 : 1
          }
        ]}
        onPress={handleDeleteAccount}
        disabled={deleting}
      >
        <Text style={[styles.logoutText, { color: '#fff' }]}>
          {deleting ? 'Deleting Account...' : 'Delete Account'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
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
  profileCardContainer: {
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textTertiary,
    marginBottom: 12,
    paddingHorizontal: 8,
    letterSpacing: 1,
  },
  settingsGroup: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: THEME.colors.textTertiary,
  },
});
