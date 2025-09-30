// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyA4OweFL8MA8LQw_8XCgc_MdiY2bQA0QDM",
  authDomain: "my-gallery-app-f3fd5.firebaseapp.com",
  projectId: "my-gallery-app-f3fd5",
  storageBucket: "my-gallery-app-f3fd5.firebasestorage.app",
  messagingSenderId: "872350048893",
  appId: "1:872350048893:web:661cad3eb3442564e84714",
  measurementId: "G-KV4242EZE9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUserToUser(result.user);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

const mapFirebaseUserToUser = (firebaseUser: any): User => ({
  id: firebaseUser.uid,
  name: firebaseUser.displayName || 'Unknown User',
  email: firebaseUser.email || '',
  photoURL: firebaseUser.photoURL || undefined
});

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUserToUser(firebaseUser));
    } else {
      callback(null);
    }
  });  
};