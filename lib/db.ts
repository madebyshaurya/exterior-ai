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
import { TransformationRecord } from "@/types";

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
    // Create query with ordering (requires index)
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(projectFromFirestore);
    } catch (indexError) {
      console.warn(
        "Index not available for projects, falling back to basic query:",
        indexError
      );

      // If we get a FirebaseError about missing index, fall back to basic query
      if (indexError.toString().includes("The query requires an index")) {
        // Show the index creation link in console for developers
        console.info(
          "Create the required index here:",
          indexError
            .toString()
            .match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0] || ""
        );

        // Fallback to basic query without ordering
        const basicQuery = query(
          collection(db, "projects"),
          where("userId", "==", userId)
        );
        const basicSnapshot = await getDocs(basicQuery);
        const projects = basicSnapshot.docs.map(projectFromFirestore);

        // Sort the results in memory
        projects.sort((a, b) => {
          const dateA = a.updatedAt?.toDate?.() || new Date(0);
          const dateB = b.updatedAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime(); // descending order
        });

        return projects;
      } else {
        // If it's not an index error, rethrow
        throw indexError;
      }
    }
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
    // Create query with ordering (requires index)
    const q = query(
      collection(db, "activity"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    try {
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply limit
      return activities.slice(0, limit);
    } catch (indexError) {
      console.warn(
        "Index not available for activity, falling back to basic query:",
        indexError
      );

      // If we get a FirebaseError about missing index, fall back to basic query
      if (indexError.toString().includes("The query requires an index")) {
        // Show the index creation link in console for developers
        console.info(
          "Create the required index here:",
          indexError
            .toString()
            .match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0] || ""
        );

        // Fallback to basic query without ordering
        const basicQuery = query(
          collection(db, "activity"),
          where("userId", "==", userId)
        );
        const basicSnapshot = await getDocs(basicQuery);
        const activities = basicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort the results in memory
        activities.sort((a, b) => {
          const dateA = a.timestamp?.toDate?.() || new Date(0);
          const dateB = b.timestamp?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime(); // descending order
        });

        // Apply limit after sorting
        return activities.slice(0, limit);
      } else {
        // If it's not an index error, rethrow
        throw indexError;
      }
    }
  } catch (error) {
    console.error("Error getting user activity:", error);
    throw error;
  }
}

// Add a transformation record to a project's history
export async function addTransformationRecord(
  projectId: string,
  record: Omit<TransformationRecord, "id" | "timestamp">
) {
  try {
    const transformationsRef = collection(
      db,
      "projects",
      projectId,
      "transformations"
    );
    const docRef = await addDoc(transformationsRef, {
      ...record,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding transformation record:", error);
    throw error;
  }
}

// Get all transformation records for a project
export async function getProjectTransformations(projectId: string) {
  try {
    // Create query with ordering
    const transformationsRef = collection(
      db,
      "projects",
      projectId,
      "transformations"
    );
    const q = query(transformationsRef, orderBy("timestamp", "desc"));

    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TransformationRecord[];
    } catch (indexError) {
      console.warn(
        "Index not available for transformations, falling back to basic query:",
        indexError
      );

      // Fallback to basic query without ordering
      const basicSnapshot = await getDocs(transformationsRef);
      const transformations = basicSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TransformationRecord[];

      // Sort the results in memory
      transformations.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || new Date(0);
        const dateB = b.timestamp?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // descending order
      });

      return transformations;
    }
  } catch (error) {
    console.error("Error getting project transformations:", error);
    throw error;
  }
}
