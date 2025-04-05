import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Project type definition
export interface Project {
  id: string;
  name: string;
  userId: string;
  type: string;
  status: "draft" | "in-progress" | "completed";
  stylePreference: number;
  transformations: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail?: string;
}

// Convert Firestore document to Project
export function projectFromFirestore(
  doc: QueryDocumentSnapshot<DocumentData>
): Project {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    userId: data.userId,
    type: data.type,
    status: data.status,
    stylePreference: data.stylePreference,
    transformations: data.transformations,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    thumbnail: data.thumbnail,
  };
}

// Create a new project
export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
) {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

// Get all projects for a user
export async function getUserProjects(userId: string) {
  try {
    let q;
    try {
      // Try with ordering (requires index)
      q = query(
        collection(db, "projects"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
    } catch (indexError) {
      console.warn(
        "Index not available for projects, falling back to basic query:",
        indexError
      );
      // Fallback to basic query without ordering
      q = query(collection(db, "projects"), where("userId", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(projectFromFirestore);

    // If we couldn't use orderBy in the query, sort the results in memory
    if (!q.toString().includes("orderBy")) {
      projects.sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(0);
        const dateB = b.updatedAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // descending order
      });
    }

    return projects;
  } catch (error) {
    console.error("Error getting user projects:", error);
    throw error;
  }
}

// Get a single project by ID
export async function getProject(projectId: string) {
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as Project;
    } else {
      throw new Error("Project not found");
    }
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
}

// Update a project
export async function updateProject(projectId: string, data: Partial<Project>) {
  try {
    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

// Delete a project
export async function deleteProject(projectId: string) {
  try {
    const docRef = doc(db, "projects", projectId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

// Create a new activity log
export async function createActivityLog(
  userId: string,
  action: string,
  projectId?: string,
  projectName?: string
) {
  try {
    await addDoc(collection(db, "activity"), {
      userId,
      action,
      projectId,
      projectName,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    // Don't throw here to prevent disrupting the main flow
  }
}

// Get user activity logs
export async function getUserActivity(userId: string, limit = 10) {
  try {
    let q;
    try {
      // Try with ordering (requires index)
      q = query(
        collection(db, "activity"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
    } catch (indexError) {
      console.warn(
        "Index not available for activity, falling back to basic query:",
        indexError
      );
      // Fallback to basic query without ordering
      q = query(collection(db, "activity"), where("userId", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If we couldn't use orderBy in the query, sort the results in memory
    if (!q.toString().includes("orderBy")) {
      activities.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || new Date(0);
        const dateB = b.timestamp?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // descending order
      });
    }

    // Apply limit after sorting
    return activities.slice(0, limit);
  } catch (error) {
    console.error("Error getting user activity:", error);
    throw error;
  }
}
