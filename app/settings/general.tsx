import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Moon, Bell, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../src/theme';

const GENERAL_STORAGE_KEY = '@runflow_general';

export default function GeneralScreen() {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(GENERAL_STORAGE_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                setDarkMode(settings.darkMode ?? true);
                setNotifications(settings.notifications ?? true);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveSettings = async () => {
        try {
            const settings = {
                darkMode,
                notifications,
            };
            await AsyncStorage.setItem(GENERAL_STORAGE_KEY, JSON.stringify(settings));
            Alert.alert('Success', 'Settings saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>General Settings</Text>
            </View>

            {/* Dark Mode */}
            <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                    <View style={styles.iconBox}>
                        <Moon size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Dark Mode</Text>
                        <Text style={styles.settingSubtitle}>Use dark theme</Text>
                    </View>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: THEME.colors.surfaceHighlight, true: THEME.colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* Notifications */}
            <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                    <View style={styles.iconBox}>
                        <Bell size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Notifications</Text>
                        <Text style={styles.settingSubtitle}>Enable push notifications</Text>
                    </View>
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: THEME.colors.surfaceHighlight, true: THEME.colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* Language (Placeholder) */}
            <TouchableOpacity style={styles.settingCard}>
                <View style={styles.settingRow}>
                    <View style={styles.iconBox}>
                        <Globe size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Language</Text>
                        <Text style={styles.settingSubtitle}>English (US)</Text>
                    </View>
                    <Text style={styles.comingSoonBadge}>Coming Soon</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
                <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: THEME.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    settingCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    comingSoonBadge: {
        fontSize: 12,
        color: THEME.colors.textTertiary,
        fontStyle: 'italic',
    },
    saveButton: {
        backgroundColor: THEME.colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
