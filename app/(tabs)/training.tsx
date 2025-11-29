import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Zap, Route, Timer, ChevronRight, Trophy, Lightbulb, Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '../../src/theme';
import { getTrainingPlans } from '../../src/services/TrainingPlanService';
import { TrainingPlan } from '../../src/types';

export default function TrainingScreen() {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);

    useEffect(() => {
        setPlans(getTrainingPlans());
    }, []);

    const QuickAction = ({ icon: Icon, label, color, onPress }: any) => (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
                <Icon size={24} color={color} />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ready to Run</Text>
                <Text style={styles.headerSubtitle}>Let's crush your goals today</Text>
            </View>

            {/* Start Run Card */}
            <TouchableOpacity
                style={styles.startRunCardContainer}
                onPress={() => router.push('/(tabs)/index')}
            >
                <LinearGradient
                    colors={[THEME.colors.primary, THEME.colors.primaryHighlight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startRunCard}
                >
                    <View style={styles.decorativeCircle1} />
                    <View style={styles.decorativeCircle2} />

                    <View style={styles.startRunContent}>
                        <View style={styles.startRunHeader}>
                            <View style={styles.iconBox}>
                                <Zap size={28} color="#fff" fill="currentColor" />
                            </View>
                            <View>
                                <Text style={styles.startRunTitle}>Start Run</Text>
                                <Text style={styles.startRunSubtitle}>Track your performance</Text>
                            </View>
                        </View>

                        <View style={styles.beginButton}>
                            <Play size={20} color={THEME.colors.primary} fill="currentColor" />
                            <Text style={styles.beginButtonText}>Begin Training</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickAction
                        icon={Route}
                        label="Distance"
                        color={THEME.colors.secondary}
                        onPress={() => router.push({ pathname: '/(tabs)/index', params: { mode: 'distance' } })}
                    />
                    <QuickAction
                        icon={Timer}
                        label="Time"
                        color={THEME.colors.accent}
                        onPress={() => router.push({ pathname: '/(tabs)/index', params: { mode: 'time' } })}
                    />
                    <QuickAction
                        icon={Flame}
                        label="Intervals"
                        color={THEME.colors.warning}
                        onPress={() => router.push({ pathname: '/(tabs)/index', params: { mode: 'intervals' } })}
                    />
                </View>
            </View>

            {/* Daily Tip */}
            <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                    <Lightbulb size={20} color={THEME.colors.warning} />
                    <Text style={styles.tipTitle}>Daily Tip</Text>
                </View>
                <Text style={styles.tipText}>
                    Consistency is key. Even a short 15-minute run is better than skipping a workout entirely. Listen to your body and rest when needed.
                </Text>
            </View>

            {/* Challenges */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Challenges</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengesList}>
                    <TouchableOpacity
                        style={styles.challengeCard}
                        onPress={() => router.push('/challenges/december-50k')}
                    >
                        <LinearGradient
                            colors={['#4F46E5', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.challengeGradient}
                        >
                            <View style={styles.challengeContent}>
                                <View>
                                    <View style={styles.challengeTag}>
                                        <Text style={styles.challengeTagText}>MONTHLY</Text>
                                    </View>
                                    <Text style={styles.challengeTitle}>December 50K</Text>
                                    <Text style={styles.challengeSubtitle}>Run 50km this month</Text>
                                </View>
                                <Trophy size={32} color="#FFD700" />
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '45%' }]} />
                            </View>
                            <Text style={styles.challengeProgress}>22.5 / 50 km</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.challengeCard}
                        onPress={() => router.push('/challenges/speed-demon')}
                    >
                        <LinearGradient
                            colors={['#059669', '#10B981']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.challengeGradient}
                        >
                            <View style={styles.challengeContent}>
                                <View>
                                    <View style={styles.challengeTag}>
                                        <Text style={styles.challengeTagText}>SPEED</Text>
                                    </View>
                                    <Text style={styles.challengeTitle}>Speed Demon</Text>
                                    <Text style={styles.challengeSubtitle}>Fastest 5K</Text>
                                </View>
                                <Flame size={32} color="#FCD34D" />
                            </View>
                            <Text style={styles.challengeStat}>Best: 24:30</Text>
                            <Text style={styles.challengeGoal}>Goal: Sub 24:00</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.challengeCard}
                        onPress={() => router.push('/challenges/streak-7day')}
                    >
                        <LinearGradient
                            colors={['#DC2626', '#EF4444']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.challengeGradient}
                        >
                            <View style={styles.challengeContent}>
                                <View>
                                    <View style={styles.challengeTag}>
                                        <Text style={styles.challengeTagText}>STREAK</Text>
                                    </View>
                                    <Text style={styles.challengeTitle}>7 Day Streak</Text>
                                    <Text style={styles.challengeSubtitle}>Run every day</Text>
                                </View>
                                <Zap size={32} color="#FEF08A" />
                            </View>
                            <View style={styles.streakDots}>
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <View
                                        key={day}
                                        style={[
                                            styles.streakDot,
                                            day <= 4 && styles.streakDotActive
                                        ]}
                                    />
                                ))}
                            </View>
                            <Text style={styles.challengeProgress}>4 / 7 days</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Training Plans */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Training Plans</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.plansList}>
                    {plans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={styles.planCard}
                            onPress={() => router.push(`/training/${plan.id}`)}
                        >
                            <View style={styles.planContent}>
                                <View style={styles.planInfo}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <Text style={styles.planDetails}>{plan.durationWeeks} weeks • {plan.level}</Text>
                                    <View style={styles.planTags}>
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>{plan.weeks[0].workouts.length} days/week</Text>
                                        </View>
                                    </View>
                                </View>
                                <ChevronRight size={20} color={THEME.colors.textTertiary} />
                            </View>
                        </TouchableOpacity>
                    ))}
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
        paddingTop: 60,
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
    startRunCardContainer: {
        marginBottom: 24,
        borderRadius: 24,
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    startRunCard: {
        borderRadius: 24,
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -64,
        left: -64,
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    startRunContent: {
        zIndex: 1,
    },
    startRunHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    startRunTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    startRunSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    beginButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    beginButtonText: {
        color: THEME.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickAction: {
        flex: 1,
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: THEME.colors.text,
    },
    tipCard: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber tint
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: THEME.colors.warning,
    },
    tipText: {
        fontSize: 14,
        color: THEME.colors.text,
        lineHeight: 20,
    },
    challengesList: {
        gap: 16,
        paddingRight: 20,
    },
    challengeCard: {
        width: 280,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    challengeGradient: {
        borderRadius: 20,
        padding: 20,
        height: 180,
        justifyContent: 'space-between',
    },
    challengeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    challengeTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    challengeTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    challengeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    challengeSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    challengeProgress: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
    },
    challengeStat: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    challengeGoal: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    streakDots: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    streakDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    streakDotActive: {
        backgroundColor: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.colors.primaryHighlight,
    },
    plansList: {
        gap: 12,
    },
    planCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    planContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    planDetails: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        marginBottom: 12,
    },
    planTags: {
        flexDirection: 'row',
    },
    tag: {
        backgroundColor: 'rgba(234, 88, 12, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        color: THEME.colors.primaryHighlight,
    },
});
