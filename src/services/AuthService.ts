import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  followers: string[];
  following: string[];
  subscriptionStatus: 'free' | 'premium';
  createdAt: number;
}

export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    followers: [],
    following: [],
    subscriptionStatus: 'free',
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);

  return user;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const deleteAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  // 1. Delete user document from Firestore
  await deleteDoc(doc(db, 'users', user.uid));

  // 2. Delete user authentication account
  await user.delete();
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, updates, { merge: true });
};
