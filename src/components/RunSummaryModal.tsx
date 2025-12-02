import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Share2, MapPin, Clock, Zap, Flame } from 'lucide-react-native';
import { THEME } from '../theme';
import { Run } from '../types';

interface RunSummaryModalProps {
    visible: boolean;
    runData: Run | null;
    onShare: (caption?: string) => void;
    onDismiss: () => void;
}

export const RunSummaryModal: React.FC<RunSummaryModalProps> = ({
    visible,
    runData,
    onShare,
    onDismiss,
}) => {
    console.log('RunSummaryModal props:', { visible, runData: !!runData });
    const [caption, setCaption] = useState('');

    if (!runData) return null;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDistance = (meters: number) => {
        return (meters / 1000).toFixed(2);
    };

    const formatPace = (paceValue: number) => {
        if (paceValue === 0) return '--:--';
        const mins = Math.floor(paceValue);
        const secs = Math.round((paceValue - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Run Complete! 🎉</Text>
                        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                            <X size={24} color={THEME.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Map Preview */}
                    <View style={styles.mapContainer}>
                        <MapPin size={48} color={THEME.colors.primary} />
                        <Text style={styles.mapText}>Route Map</Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statRow}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <MapPin size={20} color={THEME.colors.primary} />
                                </View>
                                <Text style={styles.statValue}>{formatDistance(runData.distance)}</Text>
                                <Text style={styles.statLabel}>km</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Clock size={20} color={THEME.colors.secondary} />
                                </View>
                                <Text style={styles.statValue}>{formatDuration(runData.duration)}</Text>
                                <Text style={styles.statLabel}>time</Text>
                            </View>
                        </View>

                        <View style={styles.statRow}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Zap size={20} color={THEME.colors.accent} />
                                </View>
                                <Text style={styles.statValue}>{formatPace(runData.avgPace)}</Text>
                                <Text style={styles.statLabel}>min/km</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Flame size={20} color={THEME.colors.warning} />
                                </View>
                                <Text style={styles.statValue}>{runData.calories}</Text>
                                <Text style={styles.statLabel}>kcal</Text>
                            </View>
                        </View>
                    </View>

                    {/* Caption Input */}
                    <View style={styles.captionContainer}>
                        <TextInput
                            style={styles.captionInput}
                            placeholder="Add a caption... (optional)"
                            placeholderTextColor={THEME.colors.textTertiary}
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            maxLength={150}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.shareButton} onPress={() => onShare(caption)}>
                            <LinearGradient
                                colors={[THEME.colors.primary, THEME.colors.primaryHighlight]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.shareButtonGradient}
                            >
                                <Share2 size={20} color="#fff" />
                                <Text style={styles.shareButtonText}>Share to Feed</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                            <Text style={styles.dismissButtonText}>Not Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 24,
        width: '100%',
        maxWidth: 400,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        height: 150,
        backgroundColor: THEME.colors.background,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    mapText: {
        marginTop: 8,
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    statsContainer: {
        marginBottom: 24,
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        textTransform: 'uppercase',
    },
    captionContainer: {
        marginBottom: 20,
    },
    captionInput: {
        backgroundColor: THEME.colors.background,
        borderRadius: 12,
        padding: 16,
        color: THEME.colors.text,
        fontSize: 15,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    actions: {
        gap: 12,
    },
    shareButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    shareButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    dismissButton: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    dismissButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.colors.text,
    },
});
