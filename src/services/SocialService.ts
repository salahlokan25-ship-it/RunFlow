import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Run } from '../types';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  runId?: string;
  caption: string;
  timestamp: number;
  likes: string[];
  comments: Comment[];
  distance?: number;
  duration?: number;
}

export interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export const createPost = async (
  userId: string,
  userName: string,
  caption: string,
  runId?: string,
  distance?: number,
  duration?: number
): Promise<string> => {
  const post = {
    userId,
    userName,
    caption,
    runId,
    distance,
    duration,
    timestamp: Date.now(),
    likes: [],
    comments: [],
  };

  const docRef = await addDoc(collection(db, 'posts'), post);
  return docRef.id;
};

export const getFeed = async (limitCount: number = 20): Promise<Post[]> => {
  const q = query(
    collection(db, 'posts'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
  });
};

export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
  });
};

export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  text: string
): Promise<void> => {
  const postRef = doc(db, 'posts', postId);
  const comment: Comment = {
    userId,
    userName,
    text,
    timestamp: Date.now(),
  };

  await updateDoc(postRef, {
    comments: arrayUnion(comment),
  });
};

export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  await updateDoc(currentUserRef, {
    following: arrayUnion(targetUserId),
  });

  await updateDoc(targetUserRef, {
    followers: arrayUnion(currentUserId),
  });
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  await updateDoc(currentUserRef, {
    following: arrayRemove(targetUserId),
  });

  await updateDoc(targetUserRef, {
    followers: arrayRemove(currentUserId),
  });
};

// Local storage for shared runs (stories)
const SHARED_RUNS_KEY = '@shared_runs';

export interface SharedRun extends Run {
  sharedAt: number;
  caption?: string;
}

export const shareRunToFeed = async (runData: Run, caption?: string): Promise<void> => {
  try {
    const sharedRun: SharedRun = {
      ...runData,
      sharedAt: Date.now(),
      caption,
    };

    // Get existing shared runs
    const existingData = await AsyncStorage.getItem(SHARED_RUNS_KEY);
    const sharedRuns: SharedRun[] = existingData ? JSON.parse(existingData) : [];

    // Add new run at the beginning
    sharedRuns.unshift(sharedRun);

    // Keep only last 50 shared runs
    const trimmedRuns = sharedRuns.slice(0, 50);

    // Save back to storage
    await AsyncStorage.setItem(SHARED_RUNS_KEY, JSON.stringify(trimmedRuns));
  } catch (error) {
    console.error('Error sharing run to feed:', error);
    throw error;
  }
};

export const getSharedRuns = async (): Promise<SharedRun[]> => {
  try {
    const data = await AsyncStorage.getItem(SHARED_RUNS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting shared runs:', error);
    return [];
  }
};

export const deleteSharedRun = async (runId: string): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(SHARED_RUNS_KEY);
    if (!data) return;

    const sharedRuns: SharedRun[] = JSON.parse(data);
    const filteredRuns = sharedRuns.filter(run => run.id !== runId);

    await AsyncStorage.setItem(SHARED_RUNS_KEY, JSON.stringify(filteredRuns));
  } catch (error) {
    console.error('Error deleting shared run:', error);
    throw error;
  }
};

