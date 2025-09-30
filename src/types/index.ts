// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface GalleryItem {
  id: string;
  uri: string;
  displayUri?: string; // Add this for display purposes
  caption: string;
  createdAt: number;
  createdBy: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}