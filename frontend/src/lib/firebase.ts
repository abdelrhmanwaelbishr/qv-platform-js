import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBVdVtcycGAsVxGS89S9Cz4-Q_lPAJxdy0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'qv-platform.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'qv-platform',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'qv-platform.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '953715594448',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:953715594448:web:2ef49575fe321002343ad5',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-NCR1K0Q59N',
};

export const isFirebaseConfigured = true;

const app: FirebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
const authInstance: Auth = getAuth(app);
const dbInstance: Firestore = getFirestore(app);

export const firebaseApp = app;
export const auth = authInstance;
export const db = dbInstance;
