import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "youroute.firebaseapp.com",
  projectId: "youroute",
  storageBucket: "youroute.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
