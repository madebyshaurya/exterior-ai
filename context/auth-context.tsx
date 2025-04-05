"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  debugAuthState: () => string; // Add the debug function to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "Auth state changed:",
        user ? `User: ${user.uid}` : "No user"
      );

      if (user) {
        // Log detailed user information for debugging
        console.log("Auth state user details:", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: user.providerId,
          providerData: user.providerData.map((p) => ({
            providerId: p.providerId,
            uid: p.uid,
            displayName: p.displayName,
            email: p.email,
          })),
        });

        setUser(user);

        try {
          // Check if user exists in Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          // Get provider information
          const providerData =
            user.providerData && user.providerData.length > 0
              ? user.providerData[0]
              : null;
          const providerId = providerData?.providerId || "unknown";

          // If user doesn't exist in Firestore, create a new document
          if (!userSnap.exists()) {
            console.log(
              "Creating new user in Firestore from auth state change"
            );
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              authProvider: providerId,
              signInMethod: "auth_state_change",
            });
            console.log("User created successfully in Firestore");
          } else {
            // Update last login time
            await setDoc(
              userRef,
              {
                lastLogin: serverTimestamp(),
                authProvider: providerId,
                // Only update these fields if they're empty or missing
                ...(user.displayName && !userSnap.data()?.displayName
                  ? { displayName: user.displayName }
                  : {}),
                ...(user.photoURL && !userSnap.data()?.photoURL
                  ? { photoURL: user.photoURL }
                  : {}),
              },
              { merge: true }
            );
            console.log("Updated user's information in Firestore");
          }
        } catch (firestoreError) {
          console.error("Error managing user in Firestore:", firestoreError);
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

      // Configure the Google provider with the client ID
      provider.setCustomParameters({
        client_id:
          "297570152235-mo74ve6qfpoelloi6k89hgk71k95om7e.apps.googleusercontent.com",
        prompt: "select_account",
      });

      // Add scopes for better user data
      provider.addScope("profile");
      provider.addScope("email");

      console.log("Starting Google sign-in with popup...");

      // Use popup method for more reliable auth in development
      const result = await signInWithPopup(auth, provider);

      console.log("Google sign-in successful:", {
        user: result.user
          ? {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
            }
          : null,
        credential: result.providerId ? "Credential received" : "No credential",
      });

      // Process the user data
      if (result.user) {
        // Explicitly set the user in our state
        setUser(result.user);

        try {
          // Check if user exists in Firestore
          const userRef = doc(db, "users", result.user.uid);
          const userSnap = await getDoc(userRef);

          // If user doesn't exist in Firestore, create a new document
          if (!userSnap.exists()) {
            console.log(
              "Creating new user document in Firestore from popup sign-in"
            );
            await setDoc(userRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              authProvider: "google.com",
              signInMethod: "popup",
            });
            console.log("User document created successfully");
          } else {
            // Update last login time
            await setDoc(
              userRef,
              {
                lastLogin: serverTimestamp(),
                authProvider: "google.com",
                signInMethod: "popup",
              },
              { merge: true }
            );
            console.log("Updated existing user in Firestore");
          }
        } catch (firestoreError) {
          console.error("Error saving user to Firestore:", firestoreError);
        }
      }

      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Add email/password authentication methods
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by onAuthStateChanged
    } catch (error) {
      console.error("Error signing in with email/password:", error);
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<User> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Auth state change will be handled by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up with email/password:", error);
      setLoading(false);
      throw error;
    }
  };

  // Debug function to help diagnose auth issues
  const debugAuthState = () => {
    console.log("Current auth state:", {
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous,
            emailVerified: user.emailVerified,
            providerData: user.providerData.map((p) => p.providerId),
          }
        : null,
      loading,
      authInstance: auth ? "Auth instance exists" : "No auth instance",
    });

    return "Auth state logged to console";
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    debugAuthState, // Add the debug function to the context
  };

  useEffect(() => {
    async function getRedirectResultHandler() {
      try {
        setLoading(true);
        console.log("Checking for redirect result...");

        // Get the redirect result
        const result = await getRedirectResult(auth);

        if (result) {
          // User successfully signed in
          console.log("Redirect sign-in successful", result.user);
          console.log("User details:", {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            providerId: result.providerId,
            operationType: result.operationType,
          });

          // Explicitly set the user in our state
          setUser(result.user);

          try {
            // Check if user exists in Firestore
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);

            // If user doesn't exist in Firestore, create a new document
            if (!userSnap.exists()) {
              console.log("Creating new user document in Firestore");
              await setDoc(userRef, {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                authProvider: result.providerId || "google.com",
                signInMethod: "redirect",
              });
              console.log("User document created successfully");
            } else {
              // Update last login time
              await setDoc(
                userRef,
                {
                  lastLogin: serverTimestamp(),
                  authProvider: result.providerId || "google.com",
                  signInMethod: "redirect",
                },
                { merge: true }
              );
              console.log("Updated existing user in Firestore");
            }
          } catch (firestoreError) {
            console.error("Error saving user to Firestore:", firestoreError);
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
