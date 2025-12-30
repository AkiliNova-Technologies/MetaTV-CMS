import { z } from "zod";

// User Schema (simplified for video relations)
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatar: z.string().optional(),
  email: z.string().optional(),
  channelDetailsName: z.string().optional(),
  channelDescription: z.string().optional(),
  channelBannerImage: z.string().optional(),
  totalSubscribers: z.number().optional(),
});

// Comment Schema
const commentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number(),
    text: z.string(),
    isEdited: z.boolean().default(false),
    createdAt: z.string(),
    updatedAt: z.string(),
    userId: z.number(),
    videoId: z.number().optional(),
    parentCommentId: z.number().optional().nullable(),
    user: z.object({
      id: z.number(),
      username: z.string(),
      avatar: z.string(),
    }),
    likes: z.array(userSchema).optional(),
    replies: z.array(commentSchema).optional(),
  })
);

// Program Schema (simplified)
export const programSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  _count: z
    .object({
      videos: z.number(),
      subscribers: z.number(),
    })
    .optional(),
});

// Video Schema - Complete
export const videoSchema = z.object({
  // Basic fields
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url("Invalid video URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),

  // Video metadata
  duration: z.number().min(0, "Duration must be positive"),
  size: z.number().optional().nullable(),
  format: z.string().optional().nullable(),
  codec: z.string().optional().nullable(),
  resolution: z.enum(["SD", "HD", "FOUR_K"]).optional().nullable(),

  // Content classification
  tags: z.array(z.string()).default([]),
  category: z.array(z.string()).default([]),

  // Settings
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).default("PUBLIC"),
  isApproved: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  scheduledPublish: z.string().optional().nullable(),

  // Metrics
  views: z.number().default(0),

  // Relations
  programId: z.number().optional().nullable(),
  uploadedById: z.number(),

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),

  // Optional relations (populated from backend)
  program: programSchema.optional(),
  uploadedBy: userSchema.optional(),
  comments: z.array(commentSchema).optional(),

  // Like/Dislike data - flexible format
  // Can be either a count (number) or array of users
  likes: z.union([z.number(), z.array(userSchema)]).optional(),
  dislikes: z.union([z.number(), z.array(userSchema)]).optional(),
  savedBy: z.array(userSchema).optional(),

  // Count structure from Prisma
  _count: z
    .object({
      likes: z.number(),
      dislikes: z.number(),
      comments: z.number(),
    })
    .optional(),
});

// Video creation/update schemas
export const videoCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  videoUrl: z.string().url("Invalid video URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  duration: z.number().min(0, "Duration must be positive"),
  size: z.number().optional(),
  format: z.string().optional(),
  codec: z.string().optional(),
  resolution: z.enum(["SD", "HD", "FOUR_K"]).optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  category: z.array(z.string()).min(1, "At least one category is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).default("PUBLIC"),
  allowComments: z.boolean().default(true),
  scheduledPublish: z.string().optional(),
  programId: z.number().optional(),
  uploadedById: z.number(),
});

export const videoUpdateSchema = videoCreateSchema.partial().extend({
  id: z.number(),
  isApproved: z.boolean().optional(),
});

// Video search schema
export const videoSearchSchema = z.object({
  query: z.string().optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  programId: z.number().optional(),
  uploadedById: z.number().optional(),
  minDuration: z.number().optional(),
  maxDuration: z.number().optional(),
  resolution: z.enum(["SD", "HD", "FOUR_K"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
  isApproved: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  minViews: z.number().optional(),
  maxViews: z.number().optional(),
  minLikes: z.number().optional(),
  maxLikes: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum(["views", "likes", "createdAt", "duration", "title"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

// Helper schemas for API responses
export const likeStatusSchema = z.object({
  isLiked: z.boolean(),
  isDisliked: z.boolean(),
  likes: z.number(),
  dislikes: z.number(),
});

export const videoWithLikeStatusSchema = videoSchema.extend({
  isLiked: z.boolean().optional(),
  isDisliked: z.boolean().optional(),
  likeCount: z.number().optional(),
  dislikeCount: z.number().optional(),
});

export const musicSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: z.string(),
  audioUrl: z.string(),
  thumbnailUrl: z.string(),
  duration: z.number(),
  plays: z.number(),
  genre: z.array(z.string()),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]),
  released: z.string().nullable(),
  licensed: z.string(),
  createdAt: z.string(),
  uploadedBy: z.object({
    id: z.number(),
    name: z.string(),
  }),
  likes: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});

export const livestreamSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),

  status: z.enum(["LIVE", "SCHEDULED", "ENDED", "PREPARING"]),

  scheduledAt: z.string().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  endedAt: z.string().nullable().optional(),

  streamKey: z.string(),
  streamUrl: z.string(),
  thumbnailUrl: z.string().nullable().optional(),

  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]),
  isRecording: z.boolean(),

  currentViewers: z.number(),
  peakViewers: z.number().nullable().optional(),
  totalViews: z.number(),
  duration: z.number().nullable().optional(),

  quality: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),

  programId: z.number().nullable().optional(),
  program: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

// Type exports
export type Video = z.infer<typeof videoSchema>;
export type VideoCreate = z.infer<typeof videoCreateSchema>;
export type VideoUpdate = z.infer<typeof videoUpdateSchema>;
export type VideoSearch = z.infer<typeof videoSearchSchema>;
export type LikeStatus = z.infer<typeof likeStatusSchema>;
export type VideoWithLikeStatus = z.infer<typeof videoWithLikeStatusSchema>;
export type User = z.infer<typeof userSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Program = z.infer<typeof programSchema>;
export type Music = z.infer<typeof musicSchema>;
export type Livestream = z.infer<typeof livestreamSchema>;
