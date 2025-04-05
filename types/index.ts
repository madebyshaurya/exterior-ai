export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: "draft" | "in-progress" | "completed";
  userId: string;
  thumbnail?: string;
  stylePreference?: number;
  transformations: number;
  createdAt: any;
  updatedAt: any;
  transformationHistory?: TransformationRecord[];
}

export interface TransformationRecord {
  id: string;
  imageUrl: string;
  prompt?: string;
  timestamp: any;
  previousImageUrl?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: any;
  projectId?: string;
  projectName?: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
}
