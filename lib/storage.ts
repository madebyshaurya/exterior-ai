import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

// Upload a file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Upload a project image
export async function uploadProjectImage(userId: string, projectId: string, file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
  const path = `users/${userId}/projects/${projectId}/${fileName}`
  return uploadFile(file, path)
}

// Delete a file from Firebase Storage
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

