"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Download,
  Leaf,
  LogOut,
  Plus,
  Search,
  Settings,
  Upload,
  User,
  X,
  Filter,
  Grid,
  List,
  Calendar,
  Trash2,
  Share2,
  Edit,
  Maximize2,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { useProjects } from "@/hooks/use-projects";
import { useActivity } from "@/hooks/use-activity";
import { format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const {
    projects,
    loading: projectsLoading,
    addProject,
    deleteProject: removeProject,
  } = useProjects();
  const { activity, loading: activityLoading } = useActivity(5);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(
    null
  );
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [stylePreference, setStylePreference] = useState<number[]>([50]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    console.log("File upload handler called with file:", file.name);

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      console.error("File is not an image:", file.type);
      setError("Please upload an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("File is too large:", file.size);
      setError("File size must be less than 10MB");
      return;
    }

    console.log("File passed validation, setting as uploaded file");
    setUploadedFile(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("FileReader loaded file successfully");
      setUploadedFilePreview(e.target?.result as string);
    };
    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      setError("Failed to preview image");
    };

    console.log("Starting FileReader to read file as data URL");
    reader.readAsDataURL(file);

    setError(null);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleCreateProject = async () => {
    if (!projectName) {
      setError("Project name is required");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a project");
      return;
    }

    if (!uploadedFile) {
      setError("Please upload an image for your project");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Creating project with image:", uploadedFile.name);

      const projectId = await addProject(
        {
          name: projectName,
          type: projectType || "other",
          status: "draft",
          stylePreference: stylePreference[0],
          transformations: 0,
        },
        uploadedFile // Now required
      );

      console.log("Project created successfully with ID:", projectId);

      // Reset form and loading state before navigation
      setIsLoading(false);
      setShowNewProjectModal(false);
      setProjectName("");
      setProjectType("");
      setUploadedFile(null);
      setUploadedFilePreview(null);
      setStylePreference([50]);

      // Small delay before navigation to ensure state updates are processed
      setTimeout(() => {
        // Redirect to the project page
        router.push(`/projects/${projectId}`);
      }, 100);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    try {
      await removeProject(projectId, projectName);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // If still loading auth, show loading state
  if (authLoading) {
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

  // If no user and not loading, the useEffect will redirect to login

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
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-gray-900">ExteriorAI</span>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-gray-50 border-gray-200 transition-all focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-purple-50 border-purple-200 hover:bg-purple-100"
                    onClick={() => router.push("/voice-to-image")}
                  >
                    <Mic className="h-5 w-5 text-purple-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice to Image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some((n) => !n.read) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                      >
                        {notifications.filter((n) => !n.read).length}
                      </motion.span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-medium">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs h-8"
                    >
                      Mark all as read
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-3 border-b border-gray-100 last:border-0 flex items-start gap-3 ${
                            !notification.read ? "bg-green-50" : ""
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.read
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">
                              {notification.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 group-hover:bg-green-100 transition-colors">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL || "/placeholder.svg"}
                        alt={user.displayName || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden md:inline-block">
                    {user?.displayName || user?.email || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and create new outdoor visualizations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? "bg-green-50 text-green-600" : ""}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter projects</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center border rounded-md overflow-hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-none h-9 w-9 ${
                        viewMode === "grid" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Grid view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-none h-9 w-9 ${
                        viewMode === "list" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-green-600 hover:bg-green-700 group"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="date" className="w-full" />
                    <span>to</span>
                    <Input type="date" className="w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <select className="w-full rounded-md border border-gray-300 p-2">
                    <option value="">All Types</option>
                    <option value="backyard">Backyard</option>
                    <option value="frontyard">Front Yard</option>
                    <option value="garden">Garden</option>
                    <option value="patio">Patio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        className="rounded text-green-600"
                      />
                      <span className="text-sm">Completed</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        className="rounded text-green-600"
                      />
                      <span className="text-sm">In Progress</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        className="rounded text-green-600"
                      />
                      <span className="text-sm">Draft</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" className="mr-2">
                  Reset Filters
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          {projectsLoading ? (
            <div className="flex justify-center py-12">
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
          ) : (
            <>
              <TabsContent value="all" className="mt-6">
                {filteredProjects.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProjects.map((project) => (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                    >
                      <Search className="h-8 w-8 text-gray-400" />
                    </motion.div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No projects found
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : "Create your first project to get started"}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setShowNewProjectModal(true)}
                        className="mt-4 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects
                      .filter((p) => p.status === "completed")
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects
                      .filter((p) => p.status === "completed")
                      .map((project) => (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="mt-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects
                      .filter((p) => p.status === "in-progress")
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects
                      .filter((p) => p.status === "in-progress")
                      .map((project) => (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects
                      .filter((p) => p.status === "draft")
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects
                      .filter((p) => p.status === "draft")
                      .map((project) => (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          onClick={() => router.push(`/projects/${project.id}`)}
                          isSelected={selectedProject === project.id}
                          onDelete={() =>
                            handleDeleteProject(project.id, project.name)
                          }
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {/* New Project Modal */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Upload photos of your outdoor space to start visualizing
              transformations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 overflow-y-auto">
            <div className="space-y-2">
              <label
                htmlFor="project-name"
                className="block text-sm font-medium text-gray-700"
              >
                Project Name
              </label>
              <Input
                id="project-name"
                placeholder="e.g., Backyard Renovation"
                className="w-full"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Photos (Required)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive
                    ? "border-green-500 bg-green-50"
                    : uploadedFilePreview
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!uploadedFilePreview ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-600 hover:text-green-700"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*"
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600 mt-2">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedFilePreview || "/placeholder.svg"}
                      alt="Uploaded preview"
                      className="mx-auto max-h-48 rounded-md"
                    />
                    <div className="text-center mt-3 text-sm text-green-600">
                      <span>✓ Image uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={removeUploadedFile}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <p className="text-xs text-gray-500 mt-2">
                An image is required to create a project. This will be used as
                the base for transformations.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Type
              </label>
              <RadioGroup value={projectType} onValueChange={setProjectType}>
                <div className="grid grid-cols-2 gap-4">
                  {["backyard", "frontyard", "garden", "patio"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <label htmlFor={type} className="capitalize">
                        {type === "frontyard" ? "Front Yard" : type}
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Style Preference
              </label>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Natural</span>
                  <span>Modern</span>
                </div>
                <Slider
                  value={stylePreference}
                  onValueChange={setStylePreference}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Advanced Options
                </label>
                <Switch id="advanced-options" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewProjectModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCreateProject}
              disabled={isLoading || !projectName}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="mr-2"
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  onClick,
  isSelected,
  onDelete,
}: {
  project: any;
  onClick: () => void;
  isSelected: boolean;
  onDelete: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group cursor-pointer ${
        isSelected ? "ring-2 ring-green-500 ring-offset-2" : ""
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnail || "/placeholder.svg?height=300&width=400"}
            alt={project.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Badge
              className={`
                ${project.status === "completed" ? "bg-green-500" : ""}
                ${project.status === "in-progress" ? "bg-blue-500" : ""}
                ${project.status === "draft" ? "bg-gray-500" : ""}
              `}
            >
              {project.status === "in-progress"
                ? "In Progress"
                : project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
            </Badge>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white hover:bg-gray-100"
                >
                  <Maximize2 className="h-4 w-4 mr-1" />
                  View
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {project.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {project.createdAt?.toDate
                ? format(project.createdAt.toDate(), "MMM d, yyyy")
                : "Recent"}
            </p>
            <p className="text-sm text-gray-500">
              {project.transformations || 0} transformations
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Project List Item Component
function ProjectListItem({
  project,
  onClick,
  isSelected,
  onDelete,
}: {
  project: any;
  onClick: () => void;
  isSelected: boolean;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all ${
        isSelected ? "ring-2 ring-green-500" : ""
      }`}
      onClick={onClick}
      whileHover={{ x: 5 }}
    >
      <div className="flex items-center p-4">
        <div className="h-16 w-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
          <img
            src={project.thumbnail || "/placeholder.svg?height=300&width=400"}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">
              {project.name}
            </h3>
            <Badge
              className={`ml-2 ${
                project.status === "completed" ? "bg-green-500" : ""
              } ${project.status === "in-progress" ? "bg-blue-500" : ""} ${
                project.status === "draft" ? "bg-gray-500" : ""
              }`}
            >
              {project.status === "in-progress"
                ? "In Progress"
                : project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {project.createdAt?.toDate
                ? format(project.createdAt.toDate(), "MMM d, yyyy")
                : "Recent"}
            </span>
            <span className="mx-2">•</span>
            <span>{project.transformations || 0} transformations</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
