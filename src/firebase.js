// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase config (get this from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBTp6AK5k1fJH8PVp7r7gjC0pPx5UR2is0",
  authDomain: "openclassboard-4e9b2.firebaseapp.com",
  databaseURL: "https://openclassboard-4e9b2-default-rtdb.firebaseio.com",
  projectId: "openclassboard-4e9b2",
  storageBucket: "openclassboard-4e9b2.firebasestorage.app",
  messagingSenderId: "162660173154",
  appId: "1:162660173154:web:68dd93a03fa9f32044983b",
  measurementId: "G-NQVNYE5Z8J"
};

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