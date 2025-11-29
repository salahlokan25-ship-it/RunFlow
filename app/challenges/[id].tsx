import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Trophy, Flame, Zap, Users, ChevronLeft, Target } from 'lucide-react-native';
import { THEME } from '../../src/theme';

const CHALLENGES = {
    'december-50k': {
        id: 'december-50k',
        name: 'December 50K',
        description: 'Run a total of 50 kilometers throughout December',
        colors: ['#4F46E5', '#7C3AED'],
        icon: Trophy,
        iconColor: '#FFD700',
        progress: 22.5,
        goal: 50,
        unit: 'km',
        participants: 1247,
        daysLeft: 15,
        joined: false,
    },
    'speed-demon': {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Achieve your fastest 5K time',
        colors: ['#059669', '#10B981'],
        icon: Flame,
        iconColor: '#FCD34D',
        progress: 24.5,
        goal: 24.0,
        unit: 'min',
        best: '24:30',
        target: 'Sub 24:00',
        participants: 892,
        daysLeft: 30,
        joined: false,
    },
    'streak-7day': {
        id: 'streak-7day',
        name: '7 Day Streak',
        description: 'Run at least once every day for 7 consecutive days',
        colors: ['#DC2626', '#EF4444'],
        icon: Zap,
        iconColor: '#FEF08A',
        progress: 4,
        goal: 7,
        unit: 'days',
        participants: 2103,
        daysLeft: 3,
        joined: true,
    },
};

export default function ChallengeDetailsScreen() {
    const { id } = useLocalSearchParams();
    const challenge = CHALLENGES[id as keyof typeof CHALLENGES];
    const [joined, setJoined] = useState(challenge?.joined || false);

    if (!challenge) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Challenge not found</Text>
            </View>
        );
    }

    const Icon = challenge.icon;
    const progressPercent = (challenge.progress / challenge.goal) * 100;

    const handleJoinToggle = () => {
        setJoined(!joined);
        Alert.alert(
            joined ? 'Left Challenge' : 'Joined Challenge',
            joined ? `You've left ${challenge.name}` : `You've joined ${challenge.name}!`
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ChevronLeft size={24} color={THEME.colors.text} />
            </TouchableOpacity>

            {/* Hero Card */}
            <LinearGradient
                colors={challenge.colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                <View style={styles.heroContent}>
                    <Icon size={48} color={challenge.iconColor} />
                    <Text style={styles.heroTitle}>{challenge.name}</Text>
                    <Text style={styles.heroDescription}>{challenge.description}</Text>
                </View>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Users size={20} color={THEME.colors.primaryHighlight} />
                    <Text style={styles.statValue}>{challenge.participants.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Participants</Text>
                </View>
                <View style={styles.statBox}>
                    <Target size={20} color={THEME.colors.primaryHighlight} />
                    <Text style={styles.statValue}>{challenge.daysLeft}</Text>
                    <Text style={styles.statLabel}>Days Left</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressCard}>
                <Text style={styles.cardTitle}>Your Progress</Text>
                <View style={styles.progressStats}>
                    <Text style={styles.progressText}>
                        {challenge.progress} / {challenge.goal} {challenge.unit}
                    </Text>
                    <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <LinearGradient
                        colors={challenge.colors as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${Math.min(100, progressPercent)}%` }]}
                    />
                </View>
            </View>

            {/* Leaderboard Preview */}
            <View style={styles.leaderboardCard}>
                <Text style={styles.cardTitle}>Top Performers</Text>
                {[
                    { rank: 1, name: 'Sarah M.', value: '50.0 km' },
                    { rank: 2, name: 'Mike T.', value: '48.5 km' },
                    { rank: 3, name: 'Alex K.', value: '45.2 km' },
                ].map((entry) => (
                    <View key={entry.rank} style={styles.leaderboardEntry}>
                        <View style={styles.leaderboardLeft}>
                            <View style={[styles.rankBadge, entry.rank === 1 && styles.rankBadgeGold]}>
                                <Text style={[styles.rankText, entry.rank === 1 && styles.rankTextGold]}>
                                    {entry.rank}
                                </Text>
                            </View>
                            <Text style={styles.leaderboardName}>{entry.name}</Text>
                        </View>
                        <Text style={styles.leaderboardValue}>{entry.value}</Text>
                    </View>
                ))}
            </View>

            {/* Join/Leave Button */}
            <TouchableOpacity
                style={[styles.actionButton, joined && styles.actionButtonJoined]}
                onPress={handleJoinToggle}
            >
                <Text style={[styles.actionButtonText, joined && styles.actionButtonTextJoined]}>
                    {joined ? 'Leave Challenge' : 'Join Challenge'}
                </Text>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: THEME.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    heroCard: {
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        alignItems: 'center',
    },
    heroContent: {
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    heroDescription: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
    },
    progressCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 16,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressText: {
        fontSize: 16,
        color: THEME.colors.text,
    },
    progressPercent: {
        fontSize: 16,
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
    leaderboardCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    leaderboardEntry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    leaderboardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: THEME.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankBadgeGold: {
        backgroundColor: 'rgba(234, 88, 12, 0.2)',
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    rankTextGold: {
        color: THEME.colors.primaryHighlight,
    },
    leaderboardName: {
        fontSize: 16,
        color: THEME.colors.text,
    },
    leaderboardValue: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.colors.textSecondary,
    },
    actionButton: {
        backgroundColor: THEME.colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionButtonJoined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: THEME.colors.primary,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionButtonTextJoined: {
        color: THEME.colors.primary,
    },
    errorText: {
        fontSize: 18,
        color: THEME.colors.text,
        textAlign: 'center',
        marginTop: 100,
    },
});
