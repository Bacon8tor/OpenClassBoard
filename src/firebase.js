// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Runtime env vars (injected by Docker entrypoint via /config.js -> window.__ENV__)
// take priority over build-time Vite vars (used for local dev via .env file).
const getEnv = (key) => window.__ENV__?.[key] || import.meta.env[key];

const firebaseConfig = {
  apiKey:            getEnv('VITE_FIREBASE_API_KEY'),
  authDomain:        getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL:       getEnv('VITE_FIREBASE_DATABASE_URL'),
  projectId:         getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket:     getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId:             getEnv('VITE_FIREBASE_APP_ID'),
  measurementId:     getEnv('VITE_FIREBASE_MEASUREMENT_ID'),
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

const missingKeys = requiredKeys.filter(k => !getEnv(k));

export const firebaseConfigured = missingKeys.length === 0;

let database = null;

if (firebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} else if (import.meta.env.DEV) {
  console.warn(
    'Firebase not configured. Copy .env.example to .env and fill in your credentials.\n' +
    'Missing: ' + missingKeys.join(', ')
  );
}

export { database };
