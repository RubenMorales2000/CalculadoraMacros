// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBcz_JkoFgFOENzsprsFLuRIMna6WgbT-4",
  authDomain: "macrocalculator-8a67e.firebaseapp.com",
  projectId: "macrocalculator-8a67e",
  storageBucket: "macrocalculator-8a67e.firebasestorage.app",
  messagingSenderId: "825204941283",
  appId: "1:825204941283:web:fe18301ff955c3f79a00d6",
  measurementId: "G-DZXWMWZ5S5"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
