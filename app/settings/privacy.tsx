import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

export default function PrivacyScreen() {
    const [publicProfile, setPublicProfile] = useState(true);
    const [shareActivity, setShareActivity] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const [allowTagging, setAllowTagging] = useState(true);

    const PrivacyToggle = ({ title, description, value, onValueChange }: any) => (
        <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>{title}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionHeader}>Profile Visibility</Text>
                <View style={styles.section}>
                    <PrivacyToggle
                        title="Public Profile"
                        description="Allow others to find and view your profile"
                        value={publicProfile}
                        onValueChange={setPublicProfile}
                    />
                    <View style={styles.divider} />
                    <PrivacyToggle
                        title="Share Activity"
                        description="Automatically share your runs to the feed"
                        value={shareActivity}
                        onValueChange={setShareActivity}
                    />
                </View>

                <Text style={styles.sectionHeader}>Map & Location</Text>
                <View style={styles.section}>
                    <PrivacyToggle
                        title="Show Map on Feed"
                        description="Display your running route on shared posts"
                        value={showMap}
                        onValueChange={setShowMap}
                    />
                </View>

                <Text style={styles.sectionHeader}>Social</Text>
                <View style={styles.section}>
                    <PrivacyToggle
                        title="Allow Tagging"
                        description="Let friends tag you in their runs"
                        value={allowTagging}
                        onValueChange={setAllowTagging}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
                    <Text style={styles.infoText}>
                        Your privacy is important to us. You can change these settings at any time.
                        Changes apply to future activities only.
                    </Text>
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
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.colors.textSecondary,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    toggleInfo: {
        flex: 1,
        paddingRight: 16,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    toggleDescription: {
        fontSize: 13,
        color: THEME.colors.textSecondary,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: THEME.colors.border,
        marginLeft: 16,
    },
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: '#f9731610',
        borderRadius: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: THEME.colors.text,
        lineHeight: 20,
    },
});
