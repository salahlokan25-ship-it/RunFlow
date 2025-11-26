import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { saveUserProfile } from '../../src/services/OnboardingService';
import { useAuth } from '../../src/context/AuthContext';

type Step = 'welcome' | 'experience' | 'frequency' | 'goal' | 'distance' | 'activities' | 'notifications';

interface OnboardingData {
  experienceLevel: string;
  activityFrequency: string;
  primaryGoal: string;
  targetDistance: string;
  preferredActivities: string[];
  notificationPreferences: string[];
}

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [data, setData] = useState<OnboardingData>({
    experienceLevel: '',
    activityFrequency: '',
    primaryGoal: '',
    targetDistance: '',
    preferredActivities: [],
    notificationPreferences: [],
  });

  const steps: Step[] = ['welcome', 'experience', 'frequency', 'goal', 'distance', 'activities', 'notifications'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = currentStepIndex / (steps.length - 1);

  const handleNext = (key: keyof OnboardingData, value: string | string[]) => {
    setData({ ...data, [key]: value });
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    await saveUserProfile({
      userId: user.uid,
      ...data,
      onboardingCompleted: true,
    });

    router.replace('/(tabs)/');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/');
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Image
        source={require('../../assets/splash-logo.png')}
        style={styles.welcomeLogo}
        resizeMode="contain"
      />
      <Text style={styles.welcomeTitle}>Welcome to RunFlow!</Text>
      <Text style={styles.welcomeSubtitle}>
        Let's personalize your experience with a few quick questions
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setCurrentStep('experience')}
      >
        <Text style={styles.primaryButtonText}>Let's Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderExperience = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.questionTitle}>What's your running experience?</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: 'beginner', label: 'Beginner', subtitle: 'Just starting out', icon: 'walk' },
          { value: 'intermediate', label: 'Intermediate', subtitle: 'Run regularly', icon: 'fitness' },
          { value: 'advanced', label: 'Advanced', subtitle: 'Experienced runner', icon: 'trophy' },
          { value: 'elite', label: 'Elite', subtitle: 'Competitive athlete', icon: 'medal' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionCard}
            onPress={() => handleNext('experienceLevel', option.value)}
          >
            <Ionicons name={option.icon as any} size={32} color="#f97316" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFrequency = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.questionTitle}>How often do you currently run?</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: 'rarely', label: 'Rarely', subtitle: 'Less than once a week' },
          { value: 'occasionally', label: 'Occasionally', subtitle: '1-2 times per week' },
          { value: 'regularly', label: 'Regularly', subtitle: '3-4 times per week' },
          { value: 'frequently', label: 'Frequently', subtitle: '5+ times per week' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionCard}
            onPress={() => handleNext('activityFrequency', option.value)}
          >
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGoal = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.questionTitle}>What's your main running goal?</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: 'lose_weight', label: 'Lose Weight', icon: 'scale' },
          { value: 'build_endurance', label: 'Build Endurance', icon: 'heart' },
          { value: 'get_faster', label: 'Get Faster', icon: 'speedometer' },
          { value: 'train_for_race', label: 'Train for a Race', icon: 'flag' },
          { value: 'stay_healthy', label: 'Stay Healthy', icon: 'fitness' },
          { value: 'just_for_fun', label: 'Just for Fun', icon: 'happy' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionCard}
            onPress={() => {
              handleNext('primaryGoal', option.value);
              if (option.value === 'train_for_race') {
                // Will show distance selection next
              } else {
                // Skip distance selection
                setCurrentStep('activities');
              }
            }}
          >
            <Ionicons name={option.icon as any} size={28} color="#f97316" />
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDistance = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.questionTitle}>What distance are you training for?</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: '5k', label: '5K' },
          { value: '10k', label: '10K' },
          { value: 'half_marathon', label: 'Half Marathon' },
          { value: 'marathon', label: 'Marathon' },
          { value: 'ultra', label: 'Ultra Marathon' },
          { value: 'other', label: 'Other' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionCard}
            onPress={() => {
              handleNext('targetDistance', option.value);
              setCurrentStep('activities');
            }}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActivities = () => {
    const activities = [
      'Running', 'Walking', 'Cycling', 'Hiking', 'Swimming', 
      'Gym workouts', 'Yoga', 'Other sports'
    ];

    const toggleActivity = (activity: string) => {
      const current = data.preferredActivities;
      if (current.includes(activity)) {
        setData({ ...data, preferredActivities: current.filter(a => a !== activity) });
      } else {
        setData({ ...data, preferredActivities: [...current, activity] });
      }
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.questionTitle}>What activities interest you?</Text>
        <Text style={styles.questionSubtitle}>Select all that apply</Text>
        <View style={styles.optionsContainer}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity}
              style={[
                styles.multiSelectCard,
                data.preferredActivities.includes(activity) && styles.multiSelectCardActive
              ]}
              onPress={() => toggleActivity(activity)}
            >
              <Text style={[
                styles.multiSelectLabel,
                data.preferredActivities.includes(activity) && styles.multiSelectLabelActive
              ]}>
                {activity}
              </Text>
              {data.preferredActivities.includes(activity) && (
                <Ionicons name="checkmark-circle" size={20} color="#f97316" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 20 }]}
          onPress={() => setCurrentStep('notifications')}
          disabled={data.preferredActivities.length === 0}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderNotifications = () => {
    const options = [
      { value: 'daily_reminders', label: 'Daily Reminders' },
      { value: 'weekly_reports', label: 'Weekly Progress Reports' },
      { value: 'achievements', label: 'Achievement Notifications' },
      { value: 'training_tips', label: 'Training Tips' },
      { value: 'all', label: 'All of the Above' },
      { value: 'none', label: 'None (I\'ll track on my own)' },
    ];

    const toggleNotification = (value: string) => {
      if (value === 'all') {
        setData({ ...data, notificationPreferences: ['daily_reminders', 'weekly_reports', 'achievements', 'training_tips'] });
      } else if (value === 'none') {
        setData({ ...data, notificationPreferences: [] });
      } else {
        const current = data.notificationPreferences;
        if (current.includes(value)) {
          setData({ ...data, notificationPreferences: current.filter(n => n !== value) });
        } else {
          setData({ ...data, notificationPreferences: [...current, value] });
        }
      }
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.questionTitle}>How can we help you stay motivated?</Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.multiSelectCard,
                data.notificationPreferences.includes(option.value) && styles.multiSelectCardActive
              ]}
              onPress={() => toggleNotification(option.value)}
            >
              <Text style={[
                styles.multiSelectLabel,
                data.notificationPreferences.includes(option.value) && styles.multiSelectLabelActive
              ]}>
                {option.label}
              </Text>
              {data.notificationPreferences.includes(option.value) && (
                <Ionicons name="checkmark-circle" size={20} color="#f97316" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 20 }]}
          onPress={handleComplete}
        >
          <Text style={styles.primaryButtonText}>Complete Setup</Text>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'experience': return renderExperience();
      case 'frequency': return renderFrequency();
      case 'goal': return renderGoal();
      case 'distance': return renderDistance();
      case 'activities': return renderActivities();
      case 'notifications': return renderNotifications();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {currentStep !== 'welcome' && (
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{currentStepIndex}/{steps.length - 1}</Text>
          </View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  progressContainer: { flex: 1, marginRight: 20 },
  progressBar: { height: 4, backgroundColor: THEME.colors.surface, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#f97316' },
  progressText: { fontSize: 12, color: THEME.colors.textSecondary, marginTop: 8 },
  skipButton: { padding: 8 },
  skipText: { fontSize: 14, color: '#f97316', fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  stepContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeLogo: { width: 120, height: 120, marginBottom: 32 },
  welcomeTitle: { fontSize: 32, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 12, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: THEME.colors.textSecondary, textAlign: 'center', marginBottom: 48, paddingHorizontal: 20 },
  questionTitle: { fontSize: 24, fontWeight: 'bold', color: THEME.colors.text, marginBottom: 8, textAlign: 'center' },
  questionSubtitle: { fontSize: 14, color: THEME.colors.textSecondary, marginBottom: 32, textAlign: 'center' },
  optionsContainer: { width: '100%', gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: THEME.colors.border, gap: 16 },
  optionTextContainer: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: THEME.colors.text },
  optionSubtitle: { fontSize: 13, color: THEME.colors.textSecondary, marginTop: 2 },
  multiSelectCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.colors.surface, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: THEME.colors.border },
  multiSelectCardActive: { borderColor: '#f97316', backgroundColor: '#f9731610' },
  multiSelectLabel: { fontSize: 15, fontWeight: '500', color: THEME.colors.text },
  multiSelectLabelActive: { color: '#f97316', fontWeight: '600' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f97316', borderRadius: 16, padding: 18, gap: 8, width: '100%' },
  primaryButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
