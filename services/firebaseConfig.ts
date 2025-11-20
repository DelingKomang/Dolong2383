
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// KONFIGURASI FIREBASE
// Silakan ganti nilai di bawah ini dengan konfigurasi dari Firebase Console Anda.
// Caranya: Buka Console -> Project Settings -> General -> Scroll ke bawah ke "Your apps" -> Config
const firebaseConfig = {
  apiKey: "AIzaSyA9p0B2gHI6K_ActxYRzZUIusoIQipPbuo",
  authDomain: "dolong23.firebaseapp.com",
  projectId: "dolong23",
  storageBucket: "dolong23.firebasestorage.app",
  messagingSenderId: "292694688136",
  appId: "1:292694688136:web:e394a367f16cc53282ba3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
