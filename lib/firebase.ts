// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzV3W_Vo_BN2o9s-Rk6ReJDAMMIJlgbm4",
  authDomain: "exteriorai-5eaeb.firebaseapp.com",
  projectId: "exteriorai-5eaeb",
  storageBucket: "exteriorai-5eaeb.appspot.com",
  messagingSenderId: "297570152235",
  appId: "1:297570152235:web:4418ab3b6deb3837915f6e",
  measurementId: "G-L628103MMR",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Log Firebase initialization
console.log("Firebase initialized with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appInitialized: !!app,
  authInitialized: !!auth,
});

export { app, auth, db, storage };
