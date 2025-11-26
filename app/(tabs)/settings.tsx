import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { auth } from '../../src/config/firebase';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllNotifications } from '../../src/services/NotificationService';
import HealthKitService from '../../src/services/HealthKitService';

export default function SettingsScreen() {
  const [useKm, setUseKm] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(false);
  const [aiCoach, setAiCoach] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check if notifications are already enabled
    // This is a simplified check - in production you'd check actual permission status
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Notifications enabled! You can now customize your preferences below.');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
      }
    } else {
      setNotificationsEnabled(false);
      setDailyReminder(false);
      setWeeklyReports(false);
      await cancelAllNotifications();
    }
  };

  const handleDailyReminderToggle = async (value: boolean) => {
    if (value && notificationsEnabled) {
      // Schedule for 9 AM by default
      const scheduled = await scheduleDailyReminder(9, 0);
      if (scheduled) {
        setDailyReminder(true);
        Alert.alert('Reminder Set', 'Daily reminder scheduled for 9:00 AM. You can change this time in settings.');
      }
    } else {
      setDailyReminder(false);
      await cancelAllNotifications();
    }
  };

  const handleHealthSyncToggle = async (value: boolean) => {
    if (value) {
      if (Platform.OS !== 'ios') {
        Alert.alert('Not Available', 'Apple Health is only available on iOS devices.');
        return;
      }

      const granted = await HealthKitService.requestPermissions();
      if (granted) {
        setHealthSyncEnabled(true);
        Alert.alert('Success', 'Apple Health sync enabled! Your workouts will now be saved to Health.');
      } else {
        Alert.alert('Permission Denied', 'Please enable Health access in your device settings.');
      }
    } else {
      setHealthSyncEnabled(false);
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

  const SettingRow = ({ icon, title, value, onPress, showChevron = true }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={THEME.colors.text} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showChevron && <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, value, onValueChange, disabled = false }: any) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={disabled ? THEME.colors.textSecondary : THEME.colors.text} />
        <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3e3e3e', true: '#f97316' }}
        thumbColor="#fff"
        disabled={disabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{auth.currentUser?.email?.split('@')[0] || 'Runner'}</Text>
            <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}
          >
            <Ionicons name="create-outline" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* Health & Sync */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Sync</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon="heart"
              title="Sync with Apple Health"
              value={healthSyncEnabled}
              onValueChange={handleHealthSyncToggle}
            />
            {healthSyncEnabled && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color="#f97316" />
                <Text style={styles.infoText}>Your workouts will be automatically saved to Apple Health</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon="notifications"
              title="Enable Notifications"
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
            />
            <SettingToggle
              icon="alarm"
              title="Daily Reminder"
              value={dailyReminder}
              onValueChange={handleDailyReminderToggle}
              disabled={!notificationsEnabled}
            />
            <SettingToggle
              icon="stats-chart"
              title="Weekly Progress Reports"
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              disabled={!notificationsEnabled}
            />
            <SettingToggle
              icon="trophy"
              title="Achievement Alerts"
              value={achievementAlerts}
              onValueChange={setAchievementAlerts}
              disabled={!notificationsEnabled}
            />
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon="speedometer"
              title="Use Kilometers"
              value={useKm}
              onValueChange={setUseKm}
            />
          </View>
        </View>

        {/* AI Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon="sparkles"
              title="AI Coach"
              value={aiCoach}
              onValueChange={setAiCoach}
            />
            <SettingToggle
              icon="shield-checkmark"
              title="Safety Alerts"
              value={safetyAlerts}
              onValueChange={setSafetyAlerts}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              icon="person-circle"
              title="Edit Profile"
              onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}
            />
            <SettingRow
              icon="lock-closed"
              title="Privacy"
              onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
            />
            <SettingRow
              icon="help-circle"
              title="Help & Support"
              onPress={() => Alert.alert('Help', 'Support coming soon!')}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: THEME.colors.text },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: THEME.colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 4 },
  profileEmail: { fontSize: 13, color: THEME.colors.textSecondary },
  editButton: { padding: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: THEME.colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingsGroup: { backgroundColor: THEME.colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: THEME.colors.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  settingRowDisabled: { opacity: 0.5 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTitle: { fontSize: 15, color: THEME.colors.text, fontWeight: '500' },
  settingTitleDisabled: { color: THEME.colors.textSecondary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 14, color: THEME.colors.textSecondary },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#f9731610', marginHorizontal: 16, marginVertical: 8, borderRadius: 8 },
  infoText: { flex: 1, fontSize: 12, color: THEME.colors.text, lineHeight: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: THEME.colors.surface, borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#ef4444' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  version: { textAlign: 'center', fontSize: 12, color: THEME.colors.textSecondary, marginTop: 24 },
});
