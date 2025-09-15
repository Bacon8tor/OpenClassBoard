// test-firebase.js - Run this to test your Firebase connection
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase.js';

// Test function
export const testFirebaseConnection = () => {
  console.log('Testing Firebase connection...');
  
  // Create a test poll
  const testPollRef = ref(database, 'polls/test_poll');
  
  set(testPollRef, {
    title: "Test Poll",
    options: ["Option A", "Option B"],
    votes: { "Option A": 0, "Option B": 0 },
    voters: {},
    created: Date.now()
  }).then(() => {
    console.log('Successfully wrote to Firebase!');
    
    // Now read it back
    onValue(testPollRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Successfully read from Firebase:', data);
    }, {
      onlyOnce: true
    });
    
  }).catch((error) => {
    console.error('Firebase connection failed:', error);
  });
};

// Call this function to test (you can do this in your browser console)
 testFirebaseConnection();