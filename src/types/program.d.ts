import type { Video } from "./video";

export interface Program {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  
  // Relations
  videos?: Video[];
  subscribers?: User[];
  
  _count?: {
    videos: number;
    subscribers: number;
  };
  
  videoCount?: number;
  subscriberCount?: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
}
