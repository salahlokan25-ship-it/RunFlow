import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeq4rHOiTlzUPcilBfbF9XsDNBl61ievQ",
  authDomain: "saif-3a830.firebaseapp.com",
  projectId: "saif-3a830",
  storageBucket: "saif-3a830.firebasestorage.app",
  messagingSenderId: "644355960426",
  appId: "1:644355960426:web:9f01ba419a129cbe6de413",
  measurementId: "G-FHY2QKWR77"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with Persistence
// Try to use initializeAuth for persistence, fallback to getAuth if already initialized (though getApps check handles this)
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // If initializeAuth fails (e.g. already initialized), fall back to existing instance
  auth = getAuth(app);
}

// Initialize services
export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
