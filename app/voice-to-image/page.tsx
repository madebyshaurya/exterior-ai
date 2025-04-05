"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceInput from "@/components/voice-input";
import ImageResult from "@/components/image-result";
import { useAuth } from "@/context/auth-context";

export default function VoiceToImagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [transcript, setTranscript] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [textInput, setTextInput] = useState("");

  const handleTranscriptGenerated = (text: string) => {
    setTranscript(text);
  };

  const handleImageGenerated = (url: string, text: string) => {
    setImageUrl(url);
    setResponseText(text);
  };

  const handleCloseResult = () => {
    setImageUrl("");
    setResponseText("");
  };

  const goBack = () => {
    router.push("/dashboard");
  };

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Voice to Image</h1>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {/* Introduction */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block p-3 bg-purple-100 rounded-full mb-4"
            >
              <Sparkles className="h-8 w-8 text-purple-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Transform Your Exterior with AI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Describe your dream exterior design using voice or text, and our
              AI will generate a realistic visualization. Choose your preferred
              input method and let your imagination come to life.
            </p>
          </div>

          {/* Voice Input Section */}
          <div className="mb-12">
            <AnimatePresence mode="wait">
              {!imageUrl ? (
                <motion.div
                  key="voice-input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-8"
                >
                  <VoiceInput
                    onTranscriptGenerated={handleTranscriptGenerated}
                    onImageGenerated={handleImageGenerated}
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    textInput={textInput}
                    setTextInput={setTextInput}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="image-result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ImageResult
                    imageUrl={imageUrl}
                    responseText={responseText}
                    onClose={handleCloseResult}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Example Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              Example Prompts to Try:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (inputMode === "text") {
                    setTextInput(
                      "Transform my backyard into a modern zen garden with a water feature and minimalist landscaping."
                    );
                  }
                }}
              >
                <p className="text-sm">
                  "Transform my backyard into a modern zen garden with a water
                  feature and minimalist landscaping."
                </p>
              </div>
              <div
                className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (inputMode === "text") {
                    setTextInput(
                      "Redesign my front yard with a cottage garden style, colorful flowers, and a stone pathway."
                    );
                  }
                }}
              >
                <p className="text-sm">
                  "Redesign my front yard with a cottage garden style, colorful
                  flowers, and a stone pathway."
                </p>
              </div>
              <div
                className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (inputMode === "text") {
                    setTextInput(
                      "Create a cozy patio area with outdoor furniture, string lights, and potted plants."
                    );
                  }
                }}
              >
                <p className="text-sm">
                  "Create a cozy patio area with outdoor furniture, string
                  lights, and potted plants."
                </p>
              </div>
              <div
                className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (inputMode === "text") {
                    setTextInput(
                      "Design a modern farmhouse exterior with a wrap-around porch and landscaped entrance."
                    );
                  }
                }}
              >
                <p className="text-sm">
                  "Design a modern farmhouse exterior with a wrap-around porch
                  and landscaped entrance."
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Click any example to use it in text input mode
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
