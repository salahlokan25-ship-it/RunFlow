import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Target, Calendar, Zap } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../src/theme';

const GOALS_STORAGE_KEY = '@runflow_goals';

export default function GoalsScreen() {
    const [monthlyDistance, setMonthlyDistance] = useState('200');
    const [weeklyRuns, setWeeklyRuns] = useState('4');
    const [targetPace, setTargetPace] = useState('5:30');

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
            if (stored) {
                const goals = JSON.parse(stored);
                setMonthlyDistance(goals.monthlyDistance || '200');
                setWeeklyRuns(goals.weeklyRuns || '4');
                setTargetPace(goals.targetPace || '5:30');
            }
        } catch (error) {
            console.error('Failed to load goals:', error);
        }
    };

    const saveGoals = async () => {
        try {
            const goals = {
                monthlyDistance,
                weeklyRuns,
                targetPace,
            };
            await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
            Alert.alert('Success', 'Goals saved successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save goals');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Goals & Targets</Text>
            </View>

            {/* Monthly Distance Goal */}
            <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.iconBox}>
                        <Target size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>Monthly Distance</Text>
                        <Text style={styles.goalSubtitle}>Set your monthly running target</Text>
                    </View>
                </View>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={monthlyDistance}
                        onChangeText={setMonthlyDistance}
                        keyboardType="numeric"
                        placeholder="200"
                        placeholderTextColor={THEME.colors.textTertiary}
                    />
                    <Text style={styles.inputUnit}>km</Text>
                </View>
            </View>

            {/* Weekly Runs Goal */}
            <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.iconBox}>
                        <Calendar size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>Weekly Runs</Text>
                        <Text style={styles.goalSubtitle}>How many times per week?</Text>
                    </View>
                </View>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={weeklyRuns}
                        onChangeText={setWeeklyRuns}
                        keyboardType="numeric"
                        placeholder="4"
                        placeholderTextColor={THEME.colors.textTertiary}
                    />
                    <Text style={styles.inputUnit}>runs/week</Text>
                </View>
            </View>

            {/* Target Pace Goal */}
            <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.iconBox}>
                        <Zap size={24} color={THEME.colors.primaryHighlight} />
                    </View>
                    <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>Target Pace</Text>
                        <Text style={styles.goalSubtitle}>Your goal pace per kilometer</Text>
                    </View>
                </View>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={targetPace}
                        onChangeText={setTargetPace}
                        placeholder="5:30"
                        placeholderTextColor={THEME.colors.textTertiary}
                    />
                    <Text style={styles.inputUnit}>min/km</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveGoals}>
                <Text style={styles.saveButtonText}>Save Goals</Text>
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
    goalCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    goalSubtitle: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: THEME.colors.surfaceHighlight,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: THEME.colors.text,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    inputUnit: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        fontWeight: '600',
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
