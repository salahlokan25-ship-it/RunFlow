import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

export default function HelpScreen() {
    const handleContactSupport = () => {
        Linking.openURL('mailto:support@runflow.app');
    };

    const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
        <View style={styles.faqItem}>
            <Text style={styles.question}>{question}</Text>
            <Text style={styles.answer}>{answer}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.supportCard}>
                    <Ionicons name="headset" size={48} color={THEME.colors.primary} />
                    <Text style={styles.supportTitle}>Need help?</Text>
                    <Text style={styles.supportText}>
                        Our support team is here to assist you with any questions or issues you may have.
                    </Text>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                        <Text style={styles.contactButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <FAQItem
                    question="How do I track a run?"
                    answer="Go to the 'Run' tab and press the 'Start Run' button. Make sure you have granted location permissions."
                />
                <FAQItem
                    question="Can I sync with Apple Health?"
                    answer="Yes! Go to Settings > Health & Sync and enable 'Sync with Apple Health'. This is currently only available on iOS."
                />
                <FAQItem
                    question="How do I change my profile picture?"
                    answer="Currently, you can only view your profile picture. We are working on adding the ability to upload custom photos in a future update."
                />
                <FAQItem
                    question="Is RunFlow free?"
                    answer="RunFlow is currently free to use. We may introduce premium features in the future."
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>RunFlow v1.0.0</Text>
                    <Text style={styles.footerText}>Made with ❤️ for runners</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: THEME.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    supportCard: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.border,
        marginBottom: 32,
    },
    supportTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    supportText: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    contactButton: {
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 16,
    },
    faqItem: {
        marginBottom: 20,
        backgroundColor: THEME.colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
    },
});
