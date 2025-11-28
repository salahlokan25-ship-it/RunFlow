import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { auth } from '../../src/config/firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfileScreen() {
    const [name, setName] = useState(auth.currentUser?.displayName || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!auth.currentUser) return;

        if (name.trim().length === 0) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: name.trim()
            });
            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color="#fff" />
                    </View>
                    <TouchableOpacity style={styles.changeAvatarButton} onPress={() => Alert.alert('Coming Soon', 'Avatar upload will be available soon!')}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={THEME.colors.textSecondary}
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={auth.currentUser?.email || ''}
                            editable={false}
                        />
                        <Text style={styles.helperText}>Email cannot be changed</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
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
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: THEME.colors.text,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: THEME.colors.background,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.colors.textSecondary,
        marginLeft: 4,
    },
    input: {
        backgroundColor: THEME.colors.surface,
        borderRadius: 12,
        padding: 16,
        color: THEME.colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    inputDisabled: {
        opacity: 0.7,
        backgroundColor: THEME.colors.background,
    },
    helperText: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: THEME.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
