import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { auth } from '../../src/config/firebase';
import { getSharedRuns, SharedRun } from '../../src/services/SocialService';

interface Story {
  id: string;
  name: string;
  avatar: string;
  hasStory: boolean;
}

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  mapImage: string;
  stats: {
    distance: string;
    pace: string;
    time: string;
  };
  caption: string;
  likes: number;
  comments: number;
}

export default function FeedScreen() {
  const [stories] = useState<Story[]>([
    { id: '1', name: 'Your Story', avatar: 'https://via.placeholder.com/100', hasStory: false },
    { id: '2', name: 'Alex', avatar: 'https://via.placeholder.com/100', hasStory: true },
    { id: '3', name: 'Maria', avatar: 'https://via.placeholder.com/100', hasStory: true },
    { id: '4', name: 'Jordan', avatar: 'https://via.placeholder.com/100', hasStory: true },
    { id: '5', name: 'Sam', avatar: 'https://via.placeholder.com/100', hasStory: true },
  ]);

  const [posts] = useState<Post[]>([
    {
      id: '1',
      user: { name: 'Maria', avatar: 'https://via.placeholder.com/100' },
      timeAgo: '2h ago',
      mapImage: 'https://via.placeholder.com/400x300',
      stats: { distance: '5.2 km', pace: '4:30 min/km', time: '24:18' },
      caption: 'Great run to start the day! Felt strong and beat my personal best.',
      likes: 128,
      comments: 12,
    },
    {
      id: '2',
      user: { name: 'Alex', avatar: 'https://via.placeholder.com/100' },
      timeAgo: '8h ago',
      mapImage: 'https://via.placeholder.com/400x300',
      stats: { distance: '8.1 km', pace: '5:15 min/km', time: '42:31' },
      caption: 'Exploring the new trail. A bit muddy but worth it for the views!',
      likes: 256,
      comments: 34,
    },
  ]);

  const [sharedRuns, setSharedRuns] = useState<SharedRun[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSharedRuns();
  }, []);

  const loadSharedRuns = async () => {
    const runs = await getSharedRuns();
    setSharedRuns(runs);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const renderStory = ({ item }: { item: Story }) => (
    <TouchableOpacity style={styles.storyContainer}>
      <View style={[
        styles.storyRing,
        item.hasStory && styles.storyRingActive,
        item.id === '1' && styles.storyRingYourStory
      ]}>
        <View style={styles.storyAvatarContainer}>
          <View style={styles.storyAvatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        </View>
        {item.id === '1' && sharedRuns.length > 0 && (
          <View style={styles.addStoryButton}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
        {item.id === '1' && sharedRuns.length === 0 && (
          <View style={styles.addStoryButton}>
            <Ionicons name="add" size={14} color="#fff" />
          </View>
        )}
      </View>
      <Text style={styles.storyName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = likedPosts.has(item.id);

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postUserAvatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={styles.postUserInfo}>
            <Text style={styles.postUserName}>{item.user.name}</Text>
            <Text style={styles.postTimeAgo}>{item.timeAgo}</Text>
          </View>
        </View>

        {/* Map Image */}
        <View style={styles.postMapContainer}>
          <View style={styles.postMapPlaceholder}>
            <Ionicons name="map" size={48} color="#f97316" />
            <Text style={styles.postMapText}>Run Route Map</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{item.stats.distance}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{item.stats.pace}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{item.stats.time}</Text>
          </View>
        </View>

        {/* Caption */}
        <View style={styles.postCaption}>
          <Text style={styles.postCaptionText}>{item.caption}</Text>
        </View>

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#ef4444" : THEME.colors.textSecondary}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
              {item.likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={THEME.colors.textSecondary} />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.headerAddButton}>
          <Ionicons name="add-circle-outline" size={28} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stories */}
      <View style={styles.storiesSection}>
        <FlatList
          horizontal
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContent}
        />
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101422',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#101422',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    letterSpacing: -0.3,
  },
  headerAddButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stories
  storiesSection: {
    paddingVertical: 12,
    backgroundColor: '#101422',
  },
  storiesContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 80,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#4a5568',
  },
  storyRingActive: {
    borderWidth: 0,
    padding: 2,
  },
  storyRingYourStory: {
    borderColor: '#4a5568',
  },
  storyAvatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#1A1E2C',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d3748',
  },
  addStoryButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#101422',
  },
  storyName: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },

  // Posts
  postsContent: {
    padding: 16,
    gap: 16,
  },
  postCard: {
    backgroundColor: '#1A1E2C',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  postUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  postTimeAgo: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  postMapContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0f1419',
  },
  postMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  postMapText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2d3748',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#2d3748',
  },
  content: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  postCaption: {
    padding: 16,
    paddingTop: 8,
  },
  postCaptionText: {
    fontSize: 14,
    color: THEME.colors.text,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  actionTextLiked: {
    color: '#ef4444',
  },
});
