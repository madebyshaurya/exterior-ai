"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Settings as SettingsIcon,
  Loader2,
  ArrowLeft,
  Bell,
  Lock,
  Palette,
  Globe,
  Save,
  Moon,
  Sun,
} from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    appearance: {
      theme: "system",
      reducedMotion: false,
    },
    privacy: {
      publicProfile: true,
      shareActivity: true,
    },
    language: "en",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch user settings
  useEffect(() => {
    async function fetchUserSettings() {
      if (!user) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error("Error fetching user settings:", err);
        setError("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchUserSettings();
    }
  }, [user, authLoading]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        settings,
        updatedAt: new Date(),
      });

      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateLanguage = (value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      language: value,
    }));
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Loader2 className="h-8 w-8 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-30"
      >
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="sm" />
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2"
            >
              My Profile
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive email updates about your projects
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          updateSettings("notifications", "email", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Push Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) =>
                          updateSettings("notifications", "push", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Marketing Emails</h3>
                        <p className="text-sm text-gray-500">
                          Receive updates about new features and offers
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) =>
                          updateSettings("notifications", "marketing", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div
                          className={`border rounded-md p-4 cursor-pointer flex flex-col items-center ${
                            settings.appearance.theme === "light"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                          onClick={() =>
                            updateSettings("appearance", "theme", "light")
                          }
                        >
                          <Sun className="h-6 w-6 mb-2 text-yellow-500" />
                          <span>Light</span>
                        </div>
                        <div
                          className={`border rounded-md p-4 cursor-pointer flex flex-col items-center ${
                            settings.appearance.theme === "dark"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                          onClick={() =>
                            updateSettings("appearance", "theme", "dark")
                          }
                        >
                          <Moon className="h-6 w-6 mb-2 text-blue-700" />
                          <span>Dark</span>
                        </div>
                        <div
                          className={`border rounded-md p-4 cursor-pointer flex flex-col items-center ${
                            settings.appearance.theme === "system"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                          onClick={() =>
                            updateSettings("appearance", "theme", "system")
                          }
                        >
                          <div className="h-6 w-6 mb-2 flex">
                            <div className="w-1/2 flex items-center justify-center bg-yellow-500 rounded-l-full">
                              <Sun className="h-3 w-3 text-white" />
                            </div>
                            <div className="w-1/2 flex items-center justify-center bg-blue-700 rounded-r-full">
                              <Moon className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <span>System</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Reduced Motion</h3>
                        <p className="text-sm text-gray-500">
                          Minimize animations throughout the interface
                        </p>
                      </div>
                      <Switch
                        checked={settings.appearance.reducedMotion}
                        onCheckedChange={(checked) =>
                          updateSettings("appearance", "reducedMotion", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Public Profile</h3>
                        <p className="text-sm text-gray-500">
                          Allow others to view your profile
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.publicProfile}
                        onCheckedChange={(checked) =>
                          updateSettings("privacy", "publicProfile", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Share Activity</h3>
                        <p className="text-sm text-gray-500">
                          Share your activity with other users
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.shareActivity}
                        onCheckedChange={(checked) =>
                          updateSettings("privacy", "shareActivity", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language">
              <Card>
                <CardHeader>
                  <CardTitle>Language Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div>
                    <h3 className="font-medium mb-2">Interface Language</h3>
                    <Select
                      value={settings.language}
                      onValueChange={updateLanguage}
                    >
                      <SelectTrigger className="w-full md:w-[250px]">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
