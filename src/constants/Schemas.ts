import z from "zod";

// Program Schema
export const programSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  createdAt: z.string(),
});

// Video Schema
export const videoSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(100, "Description is required"),
  resolution: z.string().optional(),
  duration: z.number(),
  videoUrl: z.union([z.url("Invalid URL"), z.literal("")]).optional(),
  thumbnailUrl: z.union([z.url("Invalid URL"), z.literal("")]).optional(),
  isApproved: z.boolean(),
  createdAt: z.string(),
  category: z.string(),
  format: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]),
  views: z.number(),
  size: z.number(),
  tags: z.array(z.string()).min(1, "At least one tag is required").optional(),

  programId: z.number().optional(),
  program: programSchema.optional(),
  isFeatured: z.boolean(),
  allowComments: z.boolean(),
  monetization: z.string(),
  codec: z.string(),
  uploadedById: z.number(),
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
