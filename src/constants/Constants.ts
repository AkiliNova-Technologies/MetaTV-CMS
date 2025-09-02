import { z } from "zod";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

export const teamSchema = z.object({
  id: z.number(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
  website: z.url("Invalid URL").optional().or(z.literal('')),
  avatar: z.string().optional(),
  channelDetailsName: z.string().optional(),
  channelDescription: z.string().optional(),
  channelBannerImage: z.string().optional(),
  socialWebsite: z.url("Invalid URL").optional().or(z.literal('')),
  socialFacebook: z.url("Invalid URL").optional().or(z.literal('')),
  socialTwitter: z.url("Invalid URL").optional().or(z.literal('')),
  lastLogin: z.string().min(1, "Last active is required"),
});

export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string().min(2).max(100),
  excerpt: z.string().min(10).max(200),
  content: z.string().min(100).max(5000),
  author: z.string().min(2).max(100),
  authorAvatar: z.url().optional(),
  status: z.enum(["draft", "published", "archived"]),
  category: z.string().min(2).max(100),
  tags: z.array(z.string().min(2).max(100)),
  createdAt: z.string().min(10).max(100),
  publishedAt: z.string().min(10).max(100).optional(),
  views: z.number().min(0),
  readTime: z.number().min(0),
  featured: z.boolean(),
});
export type BlogPost = z.infer<typeof blogPostSchema>;
