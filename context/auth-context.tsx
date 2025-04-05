"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Check if user exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // If user doesn't exist in Firestore, create a new document
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Add scopes for better user data
      provider.addScope("profile");
      provider.addScope("email");

      console.log("Starting Google sign-in redirect...");
      // Use redirect method instead of popup for more reliable auth in development
      await signInWithRedirect(auth, provider);

      // Note: The page will redirect to Google at this point, so the code below won't execute
      // until the user returns to the app. The redirect result is handled in the useEffect.
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false); // Only set loading to false if there's an error
      throw error;
    }
    // Don't set loading to false here as the page will redirect
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  useEffect(() => {
    async function getRedirectResultHandler() {
      try {
        setLoading(true);
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in
          console.log("Redirect sign-in successful", result.user);

          // Explicitly set the user in our state
          setUser(result.user);

          // Check if user exists in Firestore
          const userRef = doc(db, "users", result.user.uid);
          const userSnap = await getDoc(userRef);

          // If user doesn't exist in Firestore, create a new document
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              createdAt: serverTimestamp(),
            });
          }
        } else {
          console.log("No redirect result");
        }
      } catch (error) {
        console.error("Error with redirect sign-in:", error);
      } finally {
        setLoading(false);
      }
    }

    // Always check for redirect result when the component mounts
    getRedirectResultHandler();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
