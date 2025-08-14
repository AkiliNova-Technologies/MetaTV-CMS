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
  name: z.string(),
  type: z.enum(["user", "team"]),
  role: z.string(),
  status: z.enum(["active", "inactive", "pending"]),
  members: z.number(),
  lastActive: z.string(),
  avatarUrl: z.url,
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
