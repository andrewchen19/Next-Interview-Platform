import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhl0-sJFNxl57t6OMOg7Myx60gjTU_q5Y",
  authDomain: "interview-platform-b5894.firebaseapp.com",
  projectId: "interview-platform-b5894",
  storageBucket: "interview-platform-b5894.firebasestorage.app",
  messagingSenderId: "891988782406",
  appId: "1:891988782406:web:b821ffebf7c1a0728a4947",
  measurementId: "G-LKRENM7P7T",
};

// safety check that ensures firebase is initialized only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
