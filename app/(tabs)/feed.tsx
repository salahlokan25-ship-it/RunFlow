import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/theme';
import { auth } from '../../src/config/firebase';

import { getSharedRuns, SharedRun, deleteSharedRun, shareRunToFeed } from '../../src/services/SocialService';
import { StoryViewer } from '../../src/components/StoryViewer';
import { RouteMapPreview } from '../../src/components/RouteMapPreview';
import { CreatePostModal } from '../../src/components/CreatePostModal';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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

  mapImage?: string; // Optional now, since we might have user image
  userImage?: string; // New field for uploaded images
  stats?: { // Optional for text/image-only posts
    distance: string;
    pace: string;
    time: string;
  };
  caption: string;
  likes: number;
  comments: number;
  runPoints?: any[]; // For map preview
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
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [createMode, setCreateMode] = useState<'post' | 'story'>('post');
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    loadSharedRuns();
  }, []);

  // Refresh shared runs when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSharedRuns();
    }, [])
  );

  const loadSharedRuns = async () => {
    const runs = await getSharedRuns();
    // Stories: type='story' AND recent (<24h). Posts: type='post' (permanent)
    setSharedRuns(runs);
  };

  // Filter for stories (circles)
  const activeStories = sharedRuns.filter(run => {
    const isRecent = (Date.now() - run.sharedAt) < 24 * 60 * 60 * 1000;
    return run.type === 'story' && isRecent; // Strict: only manual 'story' type appears in ring
  });

  // Filter for posts (feed)
  const postRuns = sharedRuns.filter(run => run.type === 'post'); // Permanent posts

  const openStoryViewer = (index: number = 0) => {
    if (activeStories.length > 0) {
      setStoryIndex(index);
      setShowStoryViewer(true);
    }
  };

  const handleAddStory = () => {
    setCreateMode('story');
    setShowCreatePostModal(true);
  };

  const handleOpenCreatePost = () => {
    setCreateMode('post');
    setShowCreatePostModal(true);
  };

  const handleCreatePost = async (caption: string, imageUri?: string) => {
    // If mocking a run, we can attach the optional image
    const dummyRun: any = {
      id: Date.now().toString(),
      distance: 0,
      duration: 0,
      calories: 0,
      avgPace: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      points: [],
      activityType: 'Post',
      imageUri: imageUri // Use this in conversion
    };

    await shareRunToFeed(dummyRun, caption, createMode);
    loadSharedRuns();
    setShowCreatePostModal(false);
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSharedRun(postId);
          loadSharedRuns();
        }
      }
    ]);
  };

  // Convert shared runs to posts
  const sharedRunPosts: Post[] = postRuns.map((run) => {
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDistance = (meters: number) => {
      return `${(meters / 1000).toFixed(2)} km`;
    };

    const formatPace = (paceValue: number) => {
      if (paceValue === 0) return '--:--';
      const mins = Math.floor(paceValue);
      const secs = Math.round((paceValue - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')} min/km`;
    };

    const formatTimeAgo = (timestamp: number) => {
      const now = Date.now();
      const diff = now - timestamp;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Just now';
      if (hours === 1) return '1h ago';
      if (hours < 24) return `${hours}h ago`;
      return '1d ago';
    };

    return {
      id: run.id,
      user: { name: 'You', avatar: 'https://via.placeholder.com/100' },
      timeAgo: formatTimeAgo(run.sharedAt),
      mapImage: 'https://via.placeholder.com/400x300',
      userImage: (run as any).imageUri, // Cast to any since Run doesn't strictly have imageUri yet in types, but we saved it
      stats: run.distance > 0 ? {
        distance: formatDistance(run.distance),
        pace: formatPace(run.avgPace),
        time: formatDuration(run.duration),
      } : undefined,
      caption: run.caption || '',
      likes: 0,
      comments: 0,
      runPoints: run.points,
    };
  });

  // Combine shared runs with existing posts
  const allPosts = [...sharedRunPosts, ...posts];

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

  const renderStory = ({ item }: { item: Story }) => {
    const isYourStory = item.id === '1';
    const hasSharedRuns = activeStories.length > 0;

    return (
      <TouchableOpacity
        style={styles.storyContainer}
        onPress={() => {
          if (isYourStory) {
            if (hasSharedRuns) openStoryViewer(0);
            else handleAddStory();
          }
        }}
      >
        <View style={[
          styles.storyRing,
          item.hasStory && styles.storyRingActive,
          isYourStory && hasSharedRuns && styles.storyRingActive,
          isYourStory && styles.storyRingYourStory
        ]}>
          <View style={styles.storyAvatarContainer}>
            <View style={styles.storyAvatar}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          </View>
          {isYourStory && hasSharedRuns && (
            <View style={styles.addStoryButton}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
          {isYourStory && !hasSharedRuns && (
            <View style={styles.addStoryButton}>
              <Ionicons name="add" size={14} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.storyName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

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

        {/* Map or User Image */}
        <View style={styles.postMapContainer}>
          {item.userImage ? (
            <Image source={{ uri: item.userImage }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : item.runPoints && item.runPoints.length > 0 ? (
            <RouteMapPreview points={item.runPoints} />
          ) : (
            <View style={styles.postMapPlaceholder}>
              <Ionicons name="image-outline" size={48} color={THEME.colors.textSecondary} />
              <Text style={styles.postMapText}>No visual content</Text>
            </View>
          )}
        </View>

        {/* Stats - Only show if valid run stats exist */}
        {item.stats && (
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
        )}

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
          {item.user.name === 'You' && (
            <TouchableOpacity
              style={[styles.actionButton, { marginLeft: 16 }]}
              onPress={() => handleDeletePost(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
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
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={handleOpenCreatePost}
        >
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

      {/* Story Viewer */}
      <StoryViewer
        visible={showStoryViewer}
        stories={activeStories}
        initialIndex={storyIndex}
        onClose={() => setShowStoryViewer(false)}
      />

      {/* Posts */}
      <FlatList
        data={allPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsContent}
        showsVerticalScrollIndicator={false}
      />

      <CreatePostModal
        visible={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={handleCreatePost}
        mode={createMode}
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
