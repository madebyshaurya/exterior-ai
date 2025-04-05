"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Wand2, Keyboard, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscriptGenerated: (transcript: string) => void;
  onImageGenerated: (
    imageUrl: string,
    responseText: string,
    displayUrl?: string,
    deleteUrl?: string
  ) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  inputMode: "voice" | "text";
  setInputMode: (mode: "voice" | "text") => void;
  textInput: string;
  setTextInput: (text: string) => void;
}

export default function VoiceInput({
  onTranscriptGenerated,
  onImageGenerated,
  isGenerating,
  setIsGenerating,
  inputMode,
  setInputMode,
  textInput,
  setTextInput,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      audioChunksRef.current = [];

      // Request microphone permission explicitly
      toast.info("Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      console.log("Microphone access granted, creating MediaRecorder");

      // Create media recorder with specific options
      const options = { mimeType: "audio/webm" };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available event:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        console.log("MediaRecorder started");
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Recording error occurred");
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, creating audio blob");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        console.log("Audio blob created, size:", audioBlob.size);
        setAudioBlob(audioBlob);

        // Stop all tracks of the stream
        stream.getTracks().forEach((track) => {
          console.log("Stopping track:", track.kind);
          track.stop();
        });

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Start recording with timeslice to get data periodically
      console.log("Starting MediaRecorder...");
      mediaRecorder.start(1000); // Get data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        `Microphone access denied: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      toast.error("No audio recorded");
      return;
    }

    try {
      setIsTranscribing(true);
      console.log("Starting transcription, audio blob size:", audioBlob.size);

      // Convert to proper format if needed
      let processedBlob = audioBlob;

      // Create a form with the audio file
      const formData = new FormData();
      formData.append("audio", processedBlob, "recording.webm");

      console.log("Sending audio to transcription API...");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log("Transcription API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Transcription API error response:", errorText);
        throw new Error(
          `Transcription failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Transcription result:", data);

      if (data.success && data.transcript) {
        console.log("Transcription successful:", data.transcript);
        setTranscript(data.transcript);
        onTranscriptGenerated(data.transcript);
        toast.success("Transcription complete");
      } else {
        throw new Error(data.error || "Failed to transcribe audio");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error(
        `Transcription failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateImage = async (promptText?: string) => {
    // Use provided promptText, or use transcript for voice mode, or textInput for text mode
    const prompt =
      promptText || (inputMode === "voice" ? transcript : textInput);

    if (!prompt) {
      toast.error("Please provide a description first");
      return;
    }

    try {
      setIsGenerating(true);

      // Get the project's original image URL if available
      const originalImageUrl = document
        .querySelector(".project-image img")
        ?.getAttribute("src");

      console.log("Original image URL:", originalImageUrl || "Not found");

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          originalImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // If this was from text input, also update the transcript for consistency
        if (inputMode === "text" && textInput) {
          setTranscript(textInput);
          onTranscriptGenerated(textInput);
        }

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

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle recording and transcription flow
  const handleRecordClick = async () => {
    console.log(
      "Record button clicked, current state:",
      isRecording ? "recording" : "not recording"
    );

    if (isRecording) {
      console.log("Stopping recording...");
      stopRecording();

      // Automatically transcribe after stopping
      console.log("Setting timeout for transcription...");
      setTimeout(async () => {
        console.log("Timeout fired, starting transcription...");
        await transcribeAudio();
      }, 1000); // Increased timeout to ensure recording is properly stopped
    } else {
      console.log("Starting new recording...");
      setTranscript("");
      try {
        await startRecording();
      } catch (error) {
        console.error("Error in handleRecordClick:", error);
        toast.error(
          "Failed to start recording. Please check microphone permissions."
        );
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Input Mode Tabs */}
      <Tabs
        defaultValue="voice"
        value={inputMode}
        onValueChange={(value) => setInputMode(value as "voice" | "text")}
        className="w-full max-w-2xl mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice Input
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text Input
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-lg p-4 mb-6 shadow-md"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Your request:
            </h3>
            <p className="text-gray-800">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Controls */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {inputMode === "voice" ? (
            <motion.div
              key="voice-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              {/* Recording Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleRecordClick}
                  disabled={isTranscribing || isGenerating}
                  className={`rounded-full w-16 h-16 flex items-center justify-center ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
              </motion.div>

              {/* Recording Status */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    />
                    <span className="text-sm font-medium">
                      {formatTime(recordingTime)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing Status */}
              <AnimatePresence>
                {isTranscribing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Transcribing...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <AnimatePresence>
                {transcript &&
                  !isGenerating &&
                  !isTranscribing &&
                  !isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Button
                        onClick={() => generateImage()}
                        className="bg-purple-600 hover:bg-purple-700 mt-4"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Image
                      </Button>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="text-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-4"
            >
              {/* Text Input */}
              <Textarea
                placeholder="Describe your dream exterior design..."
                className="min-h-[120px] resize-none"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isGenerating}
              />

              {/* Generate Button */}
              <Button
                onClick={() => generateImage()}
                disabled={!textInput.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Image
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation Status */}
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
