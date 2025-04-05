import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

// Upload a file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    console.log(`Starting file upload to path: ${path}`);
    const storageRef = ref(storage, path);

    // Upload the file
    console.log("Uploading bytes to Firebase Storage...");
    const uploadResult = await uploadBytes(storageRef, file);
    console.log("Upload successful:", uploadResult);

    // Get the download URL
    console.log("Getting download URL...");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL obtained:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Upload a project image
export async function uploadProjectImage(
  userId: string,
  projectId: string,
  file: File
): Promise<string> {
  console.log(
    `Uploading project image for user ${userId}, project ${projectId}`
  );
  console.log("File details:", {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(2)} KB`,
  });

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const path = `users/${userId}/projects/${projectId}/${fileName}`;
  console.log(`Generated storage path: ${path}`);

  return uploadFile(file, path);
}

// Delete a file from Firebase Storage
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
