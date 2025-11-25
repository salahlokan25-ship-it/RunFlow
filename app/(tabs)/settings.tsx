import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { auth } from '../../src/config/firebase';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

export default function SettingsScreen() {
  const [useKm, setUseKm] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [aiCoach, setAiCoach] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

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

  const SettingToggle = ({ icon, title, value, onValueChange }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={THEME.colors.text} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3e3e3e', true: '#f97316' }}
        thumbColor="#fff"
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
            <Text style={styles.profileName}>{auth.currentUser?.email || 'Runner'}</Text>
            <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}
          >
            <Ionicons name="create-outline" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* Main Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon="speedometer"
              title="Use Kilometers"
              value={useKm}
              onValueChange={setUseKm}
            />
            <SettingToggle
              icon="notifications"
              title="Notifications"
              value={notifications}
              onValueChange={setNotifications}
            />
            <SettingRow
              icon="location"
              title="GPS Permissions"
              value="Allowed"
              onPress={() => Alert.alert('GPS', 'Permissions managed in system settings.')}
            />
            <SettingRow
              icon="watch"
              title="Connected Devices"
              value="None"
              onPress={() => Alert.alert('Devices', 'Device pairing coming soon!')}
            />
          </View>
        </View>

        {/* AI Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color="#f97316" />
            <Text style={styles.sectionTitle}>AI Features</Text>
          </View>
          <View style={styles.settingsGroup}>
            <SettingToggle
              icon="mic"
              title="AI Coach"
              value={aiCoach}
              onValueChange={setAiCoach}
            />
            <SettingToggle
              icon="shield-checkmark"
              title="Route Safety Alerts"
              value={safetyAlerts}
              onValueChange={setSafetyAlerts}
            />
            <SettingRow
              icon="fitness"
              title="Personalized Plans"
              value="Enabled"
              onPress={() => Alert.alert('Plans', 'Manage your plans in the Training tab.')}
            />
            <SettingRow
              icon="medical"
              title="Injury Prediction"
              value="Active"
              onPress={() => Alert.alert('Injury Prediction', 'Analysis running in background.')}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              icon="information-circle"
              title="About RunFlow"
              value="v1.0.0"
              onPress={() => Alert.alert('About', 'RunFlow v1.0.0\nThe most advanced running app.')}
            />
            <SettingRow
              icon="help-circle"
              title="Help & Support"
              onPress={() => Alert.alert('Support', 'Contact support@runflow.app')}
            />
            <SettingRow
              icon="shield"
              title="Privacy Policy"
              onPress={() => Alert.alert('Privacy', 'Your data is safe with us.')}
            />
            <SettingRow
              icon="document-text"
              title="Terms of Service"
              onPress={() => Alert.alert('Terms', 'Standard terms apply.')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>RunFlow v1.0.0 • Made with ❤️</Text>
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
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: THEME.colors.textSecondary },
  editButton: { padding: 8 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 12 },
  settingsGroup: { backgroundColor: THEME.colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: THEME.colors.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTitle: { fontSize: 15, color: THEME.colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 14, color: THEME.colors.textSecondary },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: THEME.colors.surface, borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#ef4444' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  footer: { textAlign: 'center', fontSize: 12, color: THEME.colors.textSecondary, marginTop: 24 },
});
