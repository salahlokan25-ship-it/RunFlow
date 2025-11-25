import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
