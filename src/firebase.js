// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingKeys = requiredKeys.filter(k => !import.meta.env[k]);

// Export a flag so the rest of the app can gate Firebase-dependent features
export const firebaseConfigured = missingKeys.length === 0;

let database = null;

if (firebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} else {
  if (import.meta.env.DEV) {
    console.warn(
      'Firebase not configured. Copy .env.example to .env and fill in your credentials.\n' +
      'Missing: ' + missingKeys.join(', ')
    );
  }
}

export { database };

// Poll data structure:
// polls/
//   {pollId}/
//     title: "Poll Title"
//     options: ["Option A", "Option B", "Option C"]
//     votes: { "Option A": 5, "Option B": 3 }
//     voters: { "voter-id-1": "Option A" }
//     created: <timestamp>
//     isLive: true
