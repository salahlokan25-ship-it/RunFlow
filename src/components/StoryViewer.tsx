import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Animated,
    PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, MapPin, Clock, Zap, Flame } from 'lucide-react-native';
import { THEME } from '../theme';
import { SharedRun } from '../services/SocialService';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerProps {
    visible: boolean;
    stories: SharedRun[];
    initialIndex?: number;
    onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
    visible,
    stories,
    initialIndex = 0,
    onClose,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (visible && stories.length > 0) {
            setCurrentIndex(initialIndex);
            startProgress();
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [visible, initialIndex]);

    const startProgress = () => {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: STORY_DURATION,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                goToNext();
            }
        });
    };

    const goToNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            startProgress();
        } else {
            onClose();
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            startProgress();
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 20;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    onClose();
                }
            },
        })
    ).current;

    if (!visible || stories.length === 0) return null;

    const currentStory = stories[currentIndex];

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

    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={false}>
            <View style={styles.container} {...panResponder.panHandlers}>
                {/* Background Gradient */}
                <LinearGradient
                    colors={['#1a1a1a', '#0a0a0a']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Progress Bars */}
                <View style={styles.progressContainer}>
                    {stories.map((_, index) => (
                        <View key={index} style={styles.progressBarBackground}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width:
                                            index === currentIndex
                                                ? progressAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                })
                                                : index < currentIndex
                                                    ? '100%'
                                                    : '0%',
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>You</Text>
                        </View>
                        <View>
                            <Text style={styles.username}>Your Story</Text>
                            <Text style={styles.timeAgo}>{formatTimeAgo(currentStory.sharedAt)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Navigation Areas */}
                <TouchableOpacity
                    style={styles.leftTap}
                    activeOpacity={1}
                    onPress={goToPrevious}
                />
                <TouchableOpacity
                    style={styles.rightTap}
                    activeOpacity={1}
                    onPress={goToNext}
                />

                {/* Content */}
                <View style={styles.content}>
                    {/* Map Placeholder */}
                    <View style={styles.mapContainer}>
                        <MapPin size={64} color={THEME.colors.primary} />
                        <Text style={styles.mapText}>Run Route</Text>
                    </View>

                    {/* Stats Overlay */}
                    <View style={styles.statsOverlay}>
                        <LinearGradient
                            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                            style={styles.statsGradient}
                        >
                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <MapPin size={24} color={THEME.colors.primary} />
                                    <Text style={styles.statValue}>{formatDistance(currentStory.distance)}</Text>
                                    <Text style={styles.statLabel}>km</Text>
                                </View>

                                <View style={styles.statBox}>
                                    <Clock size={24} color={THEME.colors.secondary} />
                                    <Text style={styles.statValue}>{formatDuration(currentStory.duration)}</Text>
                                    <Text style={styles.statLabel}>time</Text>
                                </View>

                                <View style={styles.statBox}>
                                    <Zap size={24} color={THEME.colors.accent} />
                                    <Text style={styles.statValue}>{formatPace(currentStory.avgPace)}</Text>
                                    <Text style={styles.statLabel}>min/km</Text>
                                </View>

                                <View style={styles.statBox}>
                                    <Flame size={24} color={THEME.colors.warning} />
                                    <Text style={styles.statValue}>{currentStory.calories}</Text>
                                    <Text style={styles.statLabel}>kcal</Text>
                                </View>
                            </View>

                            {currentStory.caption && (
                                <Text style={styles.caption}>{currentStory.caption}</Text>
                            )}
                        </LinearGradient>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 50,
        gap: 4,
        zIndex: 10,
    },
    progressBarBackground: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    username: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeAgo: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftTap: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: width * 0.3,
        zIndex: 5,
    },
    rightTap: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: width * 0.3,
        zIndex: 5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        width: width * 0.9,
        height: height * 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    mapText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        marginTop: 12,
    },
    statsOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    statsGradient: {
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statBox: {
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    caption: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
});
