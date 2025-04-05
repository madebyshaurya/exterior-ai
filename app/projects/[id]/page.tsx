"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import {
  getProject,
  updateProject,
  getProjectTransformations,
  addTransformationRecord,
} from "@/lib/db";
import {
  Mic,
  MicOff,
  Save,
  ArrowLeft,
  Loader2,
  Share2,
  Edit,
  Download,
  Camera,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceInput from "@/components/voice-input";
import ImageComparison from "@/components/image-comparison";
import TransformationHistory from "@/components/transformation-history";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Logo from "@/components/logo";
import { toast } from "sonner";
import { TransformationRecord } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processingVoice, setProcessingVoice] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [stylePreference, setStylePreference] = useState<number[]>([50]);
  const [saving, setSaving] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(
    null
  );

  // Image comparison states
  const [showComparison, setShowComparison] = useState(false);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);

  // Transformation history state
  const [transformationHistory, setTransformationHistory] = useState<
    TransformationRecord[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);

  // Reference for speech recognition
  const recognitionRef = useRef<any>(null);

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      if (!user) return;

      try {
        setLoading(true);
        const projectData = await getProject(unwrappedParams.id);
        setProject(projectData);

        // Fetch transformation history
        const transformations = await getProjectTransformations(
          unwrappedParams.id
        );
        setTransformationHistory(transformations);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchProject();
    }
  }, [unwrappedParams.id, user, authLoading]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // @ts-ignore - WebkitSpeechRecognition is not in the types
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // If we're still supposed to be recording, restart
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleProcessVoiceCommand = async () => {
    if (!transcript.trim()) {
      toast.error("Please say something first");
      return;
    }

    setProcessingVoice(true);

    try {
      // Here you would process the voice command
      // For now, we'll just simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Voice command processed successfully");

      // Update project status to in-progress
      if (project) {
        await updateProject(project.id, { status: "in-progress" });
        setProject({
          ...project,
          status: "in-progress",
        });
      }

      setTranscript("");
    } catch (err) {
      console.error("Error processing voice command:", err);
      toast.error("Failed to process voice command");
    } finally {
      setProcessingVoice(false);
    }
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared-projects/${unwrappedParams.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
    setShowShareDialog(false);
  };

  const handleEdit = () => {
    if (project) {
      setEditName(project.name);
      setEditType(project.type);
      setStylePreference([project.stylePreference]);
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!project || !editName) return;

    try {
      setSaving(true);

      await updateProject(project.id, {
        name: editName,
        type: editType || project.type,
        stylePreference: stylePreference[0],
      });

      // Update local state
      setProject({
        ...project,
        name: editName,
        type: editType || project.type,
        stylePreference: stylePreference[0],
      });

      toast.success("Project updated successfully");
      setShowEditDialog(false);
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!project?.thumbnail) {
      toast.error("No image available to download");
      return;
    }

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = project.thumbnail;
    link.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Image downloaded successfully");
  };

  const handleGenerateNew = () => {
    setShowGenerateDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!project) return;

    try {
      setGenerating(true);

      // Simulate AI generation process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update project with new transformation count
      await updateProject(project.id, {
        transformations: (project.transformations || 0) + 1,
        status: "in-progress",
      });

      // Update local state
      setProject({
        ...project,
        transformations: (project.transformations || 0) + 1,
        status: "in-progress",
      });

      toast.success("New transformation generated");
      setShowGenerateDialog(false);
      setUploadedFile(null);
      setUploadedFilePreview(null);
    } catch (err) {
      console.error("Error generating transformation:", err);
      toast.error("Failed to generate transformation");
    } finally {
      setGenerating(false);
    }
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={goBack}>Go Back to Dashboard</Button>
      </div>
    );
  }

  // No project found
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Project Not Found
        </h1>
        <p className="text-gray-700 mb-6">
          The project you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button onClick={goBack}>Go Back to Dashboard</Button>
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
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <div>
            <Badge
              className={`
                ${project.status === "completed" ? "bg-green-500" : ""}
                ${project.status === "in-progress" ? "bg-blue-500" : ""}
                ${project.status === "draft" ? "bg-gray-500" : ""}
                text-white
              `}
            >
              {project.status.charAt(0).toUpperCase() +
                project.status.slice(1).replace("-", " ")}
            </Badge>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Project Image */}
          <Card className="overflow-hidden project-image">
            <div className="aspect-video relative">
              {previousImage && newImage ? (
                // Show comparison slider when we have both images
                <div className="w-full h-full">
                  <ImageComparison
                    beforeImage={previousImage}
                    afterImage={newImage || project.thumbnail}
                    beforeLabel="Before"
                    afterLabel="After"
                  />
                </div>
              ) : (
                // Show regular image when no comparison is available
                <motion.div
                  className="w-full h-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={
                      project.thumbnail ||
                      "/placeholder.svg?height=600&width=800"
                    }
                    alt={project.name}
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              )}
            </div>
            <CardFooter className="p-4 flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardFooter>
          </Card>

          {/* Project Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {project.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Project Type
                  </h3>
                  <p className="text-gray-900">
                    {project.type.charAt(0).toUpperCase() +
                      project.type.slice(1)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Style Preference
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${project.stylePreference}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Natural</span>
                    <span>Modern</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Transformations
                  </h3>
                  <p className="text-gray-900">{project.transformations}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-gray-900">
                    {project.createdAt?.toDate
                      ? new Date(
                          project.createdAt.toDate()
                        ).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="text-gray-900">
                    {project.updatedAt?.toDate
                      ? new Date(
                          project.updatedAt.toDate()
                        ).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voice/Text Input Section */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Generate New Transformation
              </h2>

              <div className="bg-white rounded-lg p-4">
                <VoiceInput
                  onTranscriptGenerated={(text) => setTranscript(text)}
                  onImageGenerated={async (
                    url,
                    text,
                    displayUrl,
                    deleteUrl
                  ) => {
                    try {
                      // Save the previous image for comparison
                      if (project && project.thumbnail) {
                        setPreviousImage(project.thumbnail);
                      }

                      // Set the new image
                      setNewImage(url);

                      // Update the project with the new image
                      if (project) {
                        // Now we're using ImgBB URLs which are much smaller and won't exceed Firestore limits
                        await updateProject(project.id, {
                          thumbnail: url, // This is now a regular URL, not a data URL
                          transformations: (project.transformations || 0) + 1,
                          status: "completed",
                        });

                        // Add to transformation history
                        const transformationId = await addTransformationRecord(
                          project.id,
                          {
                            imageUrl: url,
                            prompt: text || transcript,
                            previousImageUrl: project.thumbnail,
                          }
                        );

                        // Fetch updated transformation history
                        const updatedHistory = await getProjectTransformations(
                          project.id
                        );
                        setTransformationHistory(updatedHistory);

                        // Update local state
                        setProject({
                          ...project,
                          thumbnail: url,
                          transformations: (project.transformations || 0) + 1,
                          status: "completed",
                        });

                        // No need to show a popup comparison anymore
                        // The comparison is now integrated into the thumbnail

                        toast.success("New transformation generated!");
                      }
                    } catch (err) {
                      console.error("Error updating project:", err);
                      toast.error(
                        "Failed to save transformation: " +
                          (err instanceof Error ? err.message : "Unknown error")
                      );
                    }
                  }}
                  isGenerating={processingVoice}
                  setIsGenerating={setProcessingVoice}
                  inputMode={inputMode}
                  setInputMode={setInputMode}
                  textInput={transcript}
                  setTextInput={setTranscript}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transformation History Section */}
        {transformationHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 max-w-4xl mx-auto mb-8"
          >
            <TransformationHistory
              transformations={transformationHistory}
              onCompare={(before, after) => {
                setPreviousImage(before);
                setNewImage(after);
              }}
            />
          </motion.div>
        )}
      </main>

      {/* Image comparison is now integrated directly in the thumbnail */}

      {/* Dialogs */}
      <ShareDialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onCopy={handleCopyShareLink}
      />

      <EditDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        name={editName}
        setName={setEditName}
        type={editType}
        setType={setEditType}
        stylePreference={stylePreference}
        setStylePreference={setStylePreference}
        onSave={handleSaveEdit}
        saving={saving}
      />

      <GenerateDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onFileChange={handleFileChange}
        filePreview={uploadedFilePreview}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}

// Badge component
function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

// Share Dialog
function ShareDialog({
  open,
  onClose,
  onCopy,
}: {
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Share your project with others using this link.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            Anyone with this link can view your project:
          </p>
          <div className="flex items-center">
            <Input
              readOnly
              value="https://exteriorai.com/shared-projects/123"
              className="flex-1 mr-2"
            />
            <Button onClick={onCopy}>Copy</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit Dialog
function EditDialog({
  open,
  onClose,
  name,
  setName,
  type,
  setType,
  stylePreference,
  setStylePreference,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (name: string) => void;
  type: string;
  setType: (type: string) => void;
  stylePreference: number[];
  setStylePreference: (value: number[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="house">House</option>
              <option value="garden">Garden</option>
              <option value="patio">Patio</option>
              <option value="landscape">Landscape</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style Preference
            </label>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Natural</span>
                <span>Modern</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stylePreference[0]}
                onChange={(e) => setStylePreference([parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!name || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Generate Dialog
function GenerateDialog({
  open,
  onClose,
  onFileChange,
  filePreview,
  onGenerate,
  generating,
}: {
  open: boolean;
  onClose: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filePreview: string | null;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New Transformation</DialogTitle>
          <DialogDescription>
            Upload a reference image or use AI to generate a new transformation.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="ai">AI Generate</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {filePreview ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-[200px] mx-auto rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                      onClick={() => onClose()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Camera className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Drag and drop an image, or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        as="span"
                      >
                        Browse Files
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="ai" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Let AI generate a new transformation based on your current
                  project.
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium">AI will consider:</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Your current project image</li>
                    <li>
                      • Project type: <span className="font-medium">House</span>
                    </li>
                    <li>
                      • Style preference:{" "}
                      <span className="font-medium">Modern</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
