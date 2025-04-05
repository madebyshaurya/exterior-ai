"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TextInputProps {
  onTranscriptGenerated: (transcript: string) => void;
  onImageGenerated: (
    imageUrl: string,
    responseText: string,
    displayUrl?: string,
    deleteUrl?: string
  ) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  textInput: string;
  setTextInput: (text: string) => void;
}

export default function TextInput({
  onTranscriptGenerated,
  onImageGenerated,
  isGenerating,
  setIsGenerating,
  textInput,
  setTextInput,
}: TextInputProps) {
  const generateImage = async () => {
    if (!textInput.trim()) {
      toast.error("Please provide a description first");
      return;
    }

    try {
      setIsGenerating(true);

      const originalImageUrl = document
        .querySelector(".project-image img")
        ?.getAttribute("src");

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textInput,
          originalImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        onTranscriptGenerated(textInput);
        onImageGenerated(
          data.imageUrl,
          data.responseText || "",
          data.displayUrl,
          data.deleteUrl
        );
      } else {
        throw new Error(data.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4">
        <Textarea
          placeholder="Describe your dream exterior design..."
          className="min-h-[120px] resize-none"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          disabled={isGenerating}
        />

        <Button
          onClick={generateImage}
          disabled={!textInput.trim() || isGenerating}
          className="bg-purple-600 hover:bg-purple-700 w-full"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Image
        </Button>

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center space-x-2 mt-4"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating image...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
