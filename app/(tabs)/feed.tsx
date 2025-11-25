import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  stats?: { distance: number; pace: number; duration: number };
  likes: string[];
  comments: any[];
  timestamp: number;
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTab, setSelectedTab] = useState<'friends' | 'foryou'>('friends');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (postId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await updateDoc(doc(db, 'posts', postId), {
      likes: arrayUnion(userId)
    });
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const renderPost = (post: Post) => {
    const isLiked = post.likes?.includes(auth.currentUser?.uid || '');
    
    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.postTime}>{formatTime(post.timestamp)}</Text>
            </View>
          </View>
        </View>

        {post.content && <Text style={styles.postContent}>{post.content}</Text>}

        {post.imageUrl && (
          <View style={styles.postImage}>
            <Ionicons name="image" size={48} color={THEME.colors.textSecondary} />
          </View>
        )}

        {post.stats && (
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={14} color="#f97316" />
              <Text style={styles.statText}>{(post.stats.distance / 1000).toFixed(2)} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="speedometer" size={14} color="#3b82f6" />
              <Text style={styles.statText}>{post.stats.pace.toFixed(2)}/km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color="#10b981" />
              <Text style={styles.statText}>{Math.floor(post.stats.duration / 60)}m</Text>
            </View>
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#ef4444" : THEME.colors.textSecondary} />
            <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Comments', 'Comments feature coming soon!')}
          >
            <Ionicons name="chatbubble-outline" size={20} color={THEME.colors.textSecondary} />
            <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Share', 'Sharing feature coming soon!')}
          >
            <Ionicons name="share-social-outline" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'friends' && styles.tabActive]}
          onPress={() => setSelectedTab('friends')}
        >
          <Text style={[styles.tabText, selectedTab === 'friends' && styles.tabTextActive]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'foryou' && styles.tabActive]}
          onPress={() => setSelectedTab('foryou')}
        >
          <Text style={[styles.tabText, selectedTab === 'foryou' && styles.tabTextActive]}>For You (AI)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {selectedTab === 'foryou' && (
          <View style={styles.aiSuggestionCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color="#f97316" />
              <Text style={styles.aiTitle}>AI Suggestion</Text>
            </View>
            <Text style={styles.aiText}>Based on your last 5 runs, try this new route to improve your pace by 8%</Text>
            <TouchableOpacity 
              style={styles.aiButton}
              onPress={() => Alert.alert('Route', 'Route preview coming soon!')}
            >
              <Text style={styles.aiButtonText}>View Route</Text>
              <Ionicons name="arrow-forward" size={16} color="#f97316" />
            </TouchableOpacity>
          </View>
        )}

        {posts.map(renderPost)}

        {posts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color={THEME.colors.textSecondary} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Follow friends to see their runs!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: THEME.colors.text },
  tabs: { flexDirection: 'row', backgroundColor: THEME.colors.surface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#f97316' },
  tabText: { fontSize: 14, fontWeight: '600', color: THEME.colors.textSecondary },
  tabTextActive: { color: '#f97316' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  aiSuggestionCard: { backgroundColor: '#f973161a', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f9731640' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.colors.text },
  aiText: { fontSize: 14, color: THEME.colors.text, marginBottom: 12, lineHeight: 20 },
  aiButton: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  aiButtonText: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  postCard: { backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.colors.border },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: 'bold', color: THEME.colors.text },
  postTime: { fontSize: 12, color: THEME.colors.textSecondary },
  postContent: { fontSize: 14, color: THEME.colors.text, marginBottom: 12, lineHeight: 20 },
  postImage: { height: 200, backgroundColor: THEME.colors.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statsStrip: { flexDirection: 'row', backgroundColor: THEME.colors.background, borderRadius: 12, padding: 12, marginBottom: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  statText: { fontSize: 13, color: THEME.colors.text, fontWeight: '500' },
  statDivider: { width: 1, height: 16, backgroundColor: THEME.colors.border },
  postActions: { flexDirection: 'row', gap: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: THEME.colors.textSecondary, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: THEME.colors.text, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: THEME.colors.textSecondary, marginTop: 4 },
});
