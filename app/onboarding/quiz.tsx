import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { completeOnboarding } from '../../src/services/OnboardingService';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Questions data
interface QuestionOption {
    id: string;
    label: string;
    icon: string;
    description?: string;
}

interface Question {
    id: string;
    title: string;
    subtitle: string;
    type: 'select' | 'input';
    options?: QuestionOption[];
    placeholder?: string;
    unit?: string;
    keyboardType?: string;
}

const QUESTIONS: Question[] = [
    {
        id: 'gender',
        title: 'What is your gender?',
        subtitle: 'This helps us calculate calories more accurately.',
        type: 'select',
        options: [
            { id: 'male', label: 'Male', icon: 'male' },
            { id: 'female', label: 'Female', icon: 'female' },
            { id: 'other', label: 'Other', icon: 'body' },
        ]
    },
    {
        id: 'weight',
        title: 'What is your weight?',
        subtitle: 'Used for calorie burn estimation.',
        type: 'input',
        placeholder: 'e.g., 75',
        unit: 'kg',
        keyboardType: 'numeric'
    },
    {
        id: 'level',
        title: 'What is your running experience?',
        subtitle: 'We will tailor suggestions for you.',
        type: 'select',
        options: [
            { id: 'beginner', label: 'Beginner', description: 'I just started running', icon: 'walk' },
            { id: 'intermediate', label: 'Intermediate', description: 'I run occasionally', icon: 'fitness' },
            { id: 'advanced', label: 'Advanced', description: 'I run frequently and train hard', icon: 'flash' },
        ]
    },
    {
        id: 'goal',
        title: 'What is your main goal?',
        subtitle: 'Focus your training path.',
        type: 'select',
        options: [
            { id: 'lose_weight', label: 'Weight Loss', description: 'Burn calories and get lean', icon: 'flame' },
            { id: 'distance', label: 'Run Further', description: 'Increase my endurance', icon: 'map' },
            { id: 'speed', label: 'Run Faster', description: 'Improve my pace', icon: 'speedometer' },
            { id: 'health', label: 'Just Health', description: 'Stay active and fit', icon: 'heart' },
        ]
    }
];

export default function OnboardingQuiz() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [inputValue, setInputValue] = useState('');

    const currentQuestion = QUESTIONS[currentStep];
    const isLastQuestion = currentStep === QUESTIONS.length - 1;

    const handleSelect = async (optionId: string) => {
        const newAnswers = { ...answers, [currentQuestion.id]: optionId };
        setAnswers(newAnswers);

        if (isLastQuestion) {
            await finishQuiz(newAnswers);
        } else {
            nextStep();
        }
    };

    const handleInputSubmit = async () => {
        if (!inputValue) return;
        const newAnswers = { ...answers, [currentQuestion.id]: inputValue };
        setAnswers(newAnswers);
        setInputValue('');

        if (isLastQuestion) {
            await finishQuiz(newAnswers);
        } else {
            nextStep();
        }
    };

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const finishQuiz = async (finalAnswers: Record<string, any>) => {
        try {
            // Save answers to AsyncStorage (or Firestore in real app)
            await AsyncStorage.setItem('user_profile', JSON.stringify(finalAnswers));

            if (user) {
                await completeOnboarding(user.uid);
            }

            router.replace('/(tabs)/');
        } catch (error) {
            console.error('Error saving quiz:', error);
            Alert.alert('Error', 'Failed to save your profile.');
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[THEME.colors.background, '#1a1a2e']}
                style={styles.gradient}
            >
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <TouchableOpacity onPress={prevStep} style={styles.backButton} disabled={currentStep === 0}>
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={currentStep === 0 ? 'transparent' : THEME.colors.textSecondary}
                        />
                    </TouchableOpacity>

                    <Text style={styles.title}>{currentQuestion.title}</Text>
                    <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>

                    {currentQuestion.type === 'select' && (
                        <ScrollView style={styles.optionsList}>
                            {currentQuestion.options?.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.optionCard}
                                    onPress={() => handleSelect(option.id)}
                                >
                                    <View style={styles.optionIcon}>
                                        <Ionicons name={option.icon as any} size={24} color={THEME.colors.primary} />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={styles.optionLabel}>{option.label}</Text>
                                        {option.description && (
                                            <Text style={styles.optionDescription}>{option.description}</Text>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color={THEME.colors.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {currentQuestion.type === 'input' && (
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    placeholder={currentQuestion.placeholder}
                                    placeholderTextColor={THEME.colors.textTertiary}
                                    keyboardType={currentQuestion.keyboardType as any}
                                    autoFocus
                                />
                                <Text style={styles.unitText}>{currentQuestion.unit}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.nextButton, !inputValue && styles.nextButtonDisabled]}
                                onPress={handleInputSubmit}
                                disabled={!inputValue}
                            >
                                <LinearGradient
                                    colors={inputValue ? [THEME.colors.primary, THEME.colors.primaryHighlight] : ['#333', '#444']}
                                    style={styles.nextButtonGradient}
                                >
                                    <Text style={styles.nextButtonText}>Next</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    gradient: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    progressContainer: {
        marginBottom: 40,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: THEME.colors.primary,
        borderRadius: 3,
    },
    content: {
        flex: 1,
    },
    backButton: {
        marginBottom: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: THEME.colors.textSecondary,
        marginBottom: 40,
    },
    optionsList: {
        flex: 1,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    inputContainer: {
        flex: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 24,
        borderColor: THEME.colors.primary,
        borderWidth: 1,
        marginBottom: 32,
    },
    input: {
        flex: 1,
        height: 64,
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 24,
        color: THEME.colors.textSecondary,
        fontWeight: '600',
        marginLeft: 8,
    },
    nextButton: {
        borderRadius: 16,
        overflow: 'hidden',
        height: 56,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});
