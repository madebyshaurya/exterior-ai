"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  createProject,
  getUserProjects,
  deleteProject as dbDeleteProject,
  updateProject as dbUpdateProject,
  createActivityLog,
  type Project,
} from "@/lib/db";
// Import from imgbb-storage for free image hosting
import { uploadProjectImage, deleteFile } from "./imgbb-storage";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch projects when user changes
  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userProjects = await getUserProjects(user.uid);
        setProjects(userProjects);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch projects")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  // Add a new project
  const addProject = async (
    projectData: Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">,
    file?: File
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      console.log("Starting project creation process...");
      console.log("Project data:", projectData);
      console.log("File provided:", file ? "Yes" : "No");

      // Create project in Firestore
      console.log("Creating project document in Firestore...");
      const projectId = await createProject({
        ...projectData,
        userId: user.uid,
      });
      console.log("Project created with ID:", projectId);

      // Upload image if provided
      let thumbnailUrl = undefined;
      if (file) {
        console.log("File provided, starting upload process...");
        try {
          // Upload the image to Firebase Storage
          thumbnailUrl = await uploadProjectImage(user.uid, projectId, file);
          console.log("Image uploaded successfully, URL:", thumbnailUrl);

          // Update the project with the thumbnail URL
          console.log("Updating project with thumbnail URL...");
          await dbUpdateProject(projectId, { thumbnail: thumbnailUrl });
          console.log("Project updated with thumbnail URL");
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with project creation even if image upload fails
          console.log(
            "Continuing with project creation despite image upload failure"
          );
        }
      }

      // Log activity
      try {
        await createActivityLog(
          user.uid,
          `Created project: ${projectData.name}`,
          projectId,
          projectData.name
        );
        console.log("Activity log created");
      } catch (activityError) {
        console.error("Error creating activity log:", activityError);
        // Non-critical error, continue
      }

      // Update local state
      const newProject: Project = {
        id: projectId,
        ...projectData,
        userId: user.uid,
        thumbnail: thumbnailUrl,
        createdAt: { toDate: () => new Date() } as any,
        updatedAt: { toDate: () => new Date() } as any,
      };

      console.log("Updating local state with new project:", newProject);
      setProjects((prev) => [newProject, ...prev]);
      console.log("Project creation process completed successfully");
      return projectId;
    } catch (err) {
      console.error("Error adding project:", err);
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      throw err;
    }
  };

  // Update a project
  const updateProject = async (
    projectId: string,
    data: Partial<Project>,
    file?: File
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // Upload new image if provided
      if (file) {
        const thumbnailUrl = await uploadProjectImage(
          user.uid,
          projectId,
          file
        );
        data.thumbnail = thumbnailUrl;
      }

      // Update in Firestore
      await dbUpdateProject(projectId, data);

      // Log activity
      await createActivityLog(
        user.uid,
        `Updated project: ${data.name || ""}`,
        projectId,
        data.name
      );

      // Update local state
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                ...data,
                updatedAt: { toDate: () => new Date() } as any,
              }
            : project
        )
      );
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string, projectName: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // Delete from Firestore
      await dbDeleteProject(projectId);

      // Log activity
      await createActivityLog(
        user.uid,
        `Deleted project: ${projectName}`,
        projectId,
        projectName
      );

      // Update local state
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      throw err;
    }
  };

  return { projects, loading, error, addProject, updateProject, deleteProject };
}
