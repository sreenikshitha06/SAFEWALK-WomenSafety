// ---------------------------------------------------------------
// Firebase setup. This is the ONLY file where you paste your keys.
// Get these from: Firebase console > Project settings > Your apps > Web app
// ---------------------------------------------------------------

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDHIbhnMhKu1f7J6l1tzdxcwzHi8qi1twg",
  authDomain: "safewalk-342d8.firebaseapp.com",
  projectId: "safewalk-342d8",
  storageBucket: "safewalk-342d8.firebasestorage.app",
  messagingSenderId: "1042048371821",
  appId: "1:1042048371821:web:260cc877a5b9e90f168364",
  measurementId: "G-X466D7Y9EW"
};

const app = initializeApp(firebaseConfig);

// initializeAuth (not getAuth) so the user stays logged in after closing the app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
