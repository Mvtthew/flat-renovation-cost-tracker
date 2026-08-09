import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOokKnIjJJbGVS7Q8iWNhoWkge8uJYbYs",
  authDomain: "flat-renovation-cost-tracker.firebaseapp.com",
  databaseURL:
    "https://flat-renovation-cost-tracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "flat-renovation-cost-tracker",
  storageBucket: "flat-renovation-cost-tracker.firebasestorage.app",
  messagingSenderId: "1011715875638",
  appId: "1:1011715875638:web:4195f4a117a72b26944997",
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
