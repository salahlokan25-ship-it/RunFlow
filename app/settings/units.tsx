import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Ruler, Gauge } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../src/theme';

const UNITS_STORAGE_KEY = '@runflow_units';

export default function UnitsScreen() {
    const [useKilometers, setUseKilometers] = useState(true);
    const [useMetricPace, setUseMetricPace] = useState(true);

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        try {
            const stored = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
            if (stored) {
                const units = JSON.parse(stored);
                setUseKilometers(units.useKilometers ?? true);
                setUseMetricPace(units.useMetricPace ?? true);
            }
        } catch (error) {
            console.error('Failed to load units:', error);
        }
    };

    const saveUnits = async () => {
        try {
            const units = {
                useKilometers,
                useMetricPace,
            };
            await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units));
            Alert.alert('Success', 'Unit preferences saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save preferences');
        }
    };

    const handleDistanceToggle = (value: boolean) => {
        setUseKilometers(value);
    };

    const handlePaceToggle = (value: boolean) => {
        setUseMetricPace(value);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Units & Display</Text>
            </View>

            {/* Distance Unit */}
            <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                    <View style={styles.iconBox}>
                        <Ruler size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Distance Unit</Text>
                        <Text style={styles.settingSubtitle}>
                            {useKilometers ? 'Kilometers (km)' : 'Miles (mi)'}
                        </Text>
                    </View>
                    <Switch
                        value={useKilometers}
                        onValueChange={handleDistanceToggle}
                        trackColor={{ false: THEME.colors.surfaceHighlight, true: THEME.colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* Pace Unit */}
            <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                    <View style={styles.iconBox}>
                        <Gauge size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Pace Unit</Text>
                        <Text style={styles.settingSubtitle}>
                            {useMetricPace ? 'Minutes per kilometer (min/km)' : 'Minutes per mile (min/mi)'}
                        </Text>
                    </View>
                    <Switch
                        value={useMetricPace}
                        onValueChange={handlePaceToggle}
                        trackColor={{ false: THEME.colors.surfaceHighlight, true: THEME.colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveUnits}>
                <Text style={styles.saveButtonText}>Save Preferences</Text>
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
    settingHeader: {
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
