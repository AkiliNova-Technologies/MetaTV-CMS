export interface Video {
  id: number;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  tags: string[];
  resolution?: "SD" | "HD" | "FOUR_K" | null;
  views: number;
  isApproved: boolean;
  allowComments: boolean;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  scheduledPublish?: string | null;
  createdAt: string;
  updatedAt: string;
  size?: number | null;
  format?: string | null;
  codec?: string | null;
  category: string[];
  programId?: number | null;
  uploadedById: number;

  // Relations (may be included from backend)
  program?: {
    id: number;
    name: string;
    description?: string;
  };
  
  uploadedBy?: {
    id: number;
    username: string;
    channelDetailsName?: string;
    channelDescription?: string;
    channelBannerImage?: string;
    totalSubscribers?: number;
    avatar: string;
  };

  comments?: Comment[];
  
  // Like/Dislike data - these can come in different formats from backend
  likes?: number | User[]; // Can be count or array of users
  dislikes?: number | User[]; // Can be count or array of users
  
  // Counts from backend _count field
  _count?: {
    likes: number;
    dislikes: number;
    comments: number;
  };
  
  // Saved videos
  savedBy?: User[];
}

export interface User {
  id: number;
  username: string;
  avatar?: string;
  email?: string;
}

export interface Comment {
  id: number;
  text: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  videoId?: number;
  parentCommentId?: number;
  
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  
  likes?: User[];
  replies?: Comment[];
}

// Helper type for video with like status
export interface VideoWithLikeStatus extends Video {
  isLiked?: boolean;
  isDisliked?: boolean;
  likeCount: number;
  dislikeCount: number;
}