import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;

    onSubmit: (caption: string, imageUri?: string) => void;
    mode?: 'post' | 'story';
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onSubmit, mode = 'post' }) => {
    const [caption, setCaption] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        if (!caption.trim() && !imageUri) {
            Alert.alert('Error', 'Please enter a caption or select an image');
            return;
        }
        onSubmit(caption, imageUri || undefined);
        setCaption('');
        setImageUri(null);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardAvoidingView}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{mode === 'story' ? 'Add to Story' : 'New Post'}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={THEME.colors.text} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="What's on your mind?"
                                placeholderTextColor={THEME.colors.textTertiary}
                                multiline
                                value={caption}
                                onChangeText={setCaption}
                                autoFocus
                            />

                            {imageUri && (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                                    <Ionicons name="image" size={24} color={THEME.colors.primary} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                    <LinearGradient
                                        colors={[THEME.colors.primary, THEME.colors.primaryHighlight]}
                                        style={styles.submitGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.submitText}>Post</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardAvoidingView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: THEME.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 300,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.colors.text,
    },
    input: {
        color: THEME.colors.text,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mediaButton: {
        padding: 12,
        backgroundColor: THEME.colors.background,
        borderRadius: 12,
    },
    submitButton: {
        borderRadius: 24,
        overflow: 'hidden',
        minWidth: 120,
    },
    submitGradient: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    imagePreviewContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
});
