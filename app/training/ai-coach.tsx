import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Send, Sparkles, Bot } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../src/theme';
import { AICoachService, ChatMessage } from '../../src/services/AICoachService';

export default function AICoachScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const dailyTip = AICoachService.getDailyTip();

  useEffect(() => {
    setMessages(AICoachService.getInitialMessages());
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Dismiss keyboard immediately
    Keyboard.dismiss();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await AICoachService.sendMessage(userMessage.text);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Bot size={20} color="#fff" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAI]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipContainer}>
        <LinearGradient
          colors={[THEME.colors.primary, THEME.colors.primaryHighlight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tipCard}
        >
          <View style={styles.tipHeader}>
            <Sparkles size={20} color="#fff" />
            <Text style={styles.tipTitle}>Daily Insight</Text>
          </View>
          <Text style={styles.tipText}>{dailyTip}</Text>
        </LinearGradient>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.botAvatarSmall}>
            <Bot size={16} color="#fff" />
          </View>
          <Text style={styles.typingText}>AI Coach is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about training, nutrition..."
          placeholderTextColor={THEME.colors.textTertiary}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  tipContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    fontWeight: '500',
  },
  chatContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: THEME.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextAI: {
    color: THEME.colors.text,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  typingText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME.colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: THEME.colors.surfaceHighlight,
  },
});
