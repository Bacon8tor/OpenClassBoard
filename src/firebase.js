// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase config from environment variables (Vite style)
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

// Validate required Firebase configuration
const requiredConfig = {
  'VITE_FIREBASE_API_KEY': firebaseConfig.apiKey,
  'VITE_FIREBASE_AUTH_DOMAIN': firebaseConfig.authDomain,
  'VITE_FIREBASE_DATABASE_URL': firebaseConfig.databaseURL,
  'VITE_FIREBASE_PROJECT_ID': firebaseConfig.projectId,
  'VITE_FIREBASE_STORAGE_BUCKET': firebaseConfig.storageBucket,
  'VITE_FIREBASE_MESSAGING_SENDER_ID': firebaseConfig.messagingSenderId,
  'VITE_FIREBASE_APP_ID': firebaseConfig.appId
};

const missingConfig = Object.entries(requiredConfig).filter(([key, value]) => !value);

if (missingConfig.length > 0) {
  console.error('Missing required Firebase environment variables:', missingConfig.map(([key]) => key));
  console.error('Please copy .env.example to .env and fill in your Firebase configuration');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Poll data structure:
// polls/
//   {pollId}/
//     title: "Poll Title"
//     options: ["Option A", "Option B", "Option C"]
//     votes: {
//       "Option A": 5,
//       "Option B": 3,
//       "Option C": 2
//     }
//     voters: {
//       "voter-id-1": "Option A",
//       "voter-id-2": "Option B"
//     }