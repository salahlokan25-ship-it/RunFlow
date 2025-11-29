import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Trophy, Lock, Award as AwardIcon, Target, Flame } from 'lucide-react-native';
import { THEME } from '../../src/theme';

const ACHIEVEMENTS = [
    {
        id: 'first-run',
        name: 'First Steps',
        description: 'Complete your first run',
        icon: Trophy,
        color: '#FFD700',
        unlocked: true,
        unlockedDate: '2024-11-15',
    },
    {
        id: '10k-club',
        name: '10K Club',
        description: 'Run 10 kilometers in a single session',
        icon: Target,
        color: '#10B981',
        unlocked: true,
        unlockedDate: '2024-11-20',
    },
    {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Run 5K under 25 minutes',
        icon: Flame,
        color: '#EF4444',
        unlocked: false,
    },
    {
        id: 'marathon',
        name: 'Marathon Finisher',
        description: 'Complete a full marathon (42.2km)',
        icon: AwardIcon,
        color: '#8B5CF6',
        unlocked: false,
    },
    {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Run 7 days in a row',
        icon: Trophy,
        color: '#F59E0B',
        unlocked: false,
    },
];

export default function AchievementsScreen() {
    const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Achievements</Text>
                    <Text style={styles.headerSubtitle}>
                        {unlockedCount} of {ACHIEVEMENTS.length} unlocked
                    </Text>
                </View>
            </View>

            <View style={styles.achievementsList}>
                {ACHIEVEMENTS.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                        <View
                            key={achievement.id}
                            style={[
                                styles.achievementCard,
                                !achievement.unlocked && styles.achievementCardLocked,
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconBox,
                                    { backgroundColor: `${achievement.color}20` },
                                    !achievement.unlocked && styles.iconBoxLocked,
                                ]}
                            >
                                {achievement.unlocked ? (
                                    <Icon size={32} color={achievement.color} />
                                ) : (
                                    <Lock size={32} color={THEME.colors.textTertiary} />
                                )}
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text
                                    style={[
                                        styles.achievementName,
                                        !achievement.unlocked && styles.achievementNameLocked,
                                    ]}
                                >
                                    {achievement.name}
                                </Text>
                                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                                {achievement.unlocked && achievement.unlockedDate && (
                                    <Text style={styles.unlockedDate}>
                                        Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                })}
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
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    achievementsList: {
        gap: 16,
    },
    achievementCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    achievementCardLocked: {
        opacity: 0.6,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxLocked: {
        backgroundColor: THEME.colors.surfaceHighlight,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    achievementNameLocked: {
        color: THEME.colors.textSecondary,
    },
    achievementDescription: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        marginBottom: 4,
    },
    unlockedDate: {
        fontSize: 12,
        color: THEME.colors.primaryHighlight,
        fontStyle: 'italic',
    },
});
