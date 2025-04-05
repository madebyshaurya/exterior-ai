"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { UserCredential } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    debugAuthState,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    console.log("Login page auth state:", { user: !!user, authLoading });
    if (user && !authLoading) {
      console.log("User is logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Add a separate effect to handle initial loading
  useEffect(() => {
    // This will run once when the component mounts
    const checkAuthState = async () => {
      try {
        // Log detailed auth state for debugging
        console.log(debugAuthState());

        // Wait a moment to ensure Firebase auth has initialized
        if (!authLoading && user) {
          console.log(
            "Initial check: User is logged in, redirecting to dashboard"
          );
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
    };

    checkAuthState();
  }, []); // Empty dependency array means this runs once on mount

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setAuthError("");
      console.log("Starting Google login process...");

      // Log auth state before attempting login
      console.log("Auth state before login:", debugAuthState());

      // Using popup authentication now
      const result: UserCredential = await signInWithGoogle();
      console.log(
        "Google login successful",
        result ? "with result" : "but no result"
      );

      // Set success state
      setIsSuccess(true);

      // Check if we have a user and redirect to dashboard
      if (result?.user) {
        console.log("User authenticated, redirecting to dashboard");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000); // Short delay to show success message
      } else {
        console.log("Authentication successful but no user data");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setAuthError("Failed to sign in with Google. Please try again.");

      setIsLoading(false);

      // Log auth state after error
      console.log("Auth state after error:", debugAuthState());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <div className="container mx-auto py-6 px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md relative overflow-hidden"
        >
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-50 blur-xl"
            animate={{
              x: [0, 10, 0],
              y: [0, -10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 8,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-100 rounded-full opacity-40 blur-xl"
            animate={{
              x: [0, -10, 0],
              y: [0, 10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 10,
              ease: "easeInOut",
            }}
          />

          <div className="flex justify-center mb-6 relative z-10">
            <motion.div
              className="flex items-center gap-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <Logo size="lg" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Login Successful!
                </h2>
                <p className="text-gray-600 mt-2">
                  Redirecting to dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.div>
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-6 relative z-10">
                  Log in to your account
                </h1>

                {authError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-6 relative z-10">
                  <p className="text-center text-gray-600">
                    Sign in with your Google account to access your projects and
                    create new visualizations.
                  </p>

                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 h-12 hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    {isLoading ? "Signing in..." : "Continue with Google"}
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    By continuing, you agree to ExteriorAI's Terms of Service
                    and Privacy Policy.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
