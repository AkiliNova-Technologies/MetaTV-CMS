export interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  tags: string[] | undefined;
  resolution: string;
  views: number;
  isApproved: true;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  createdAt: string;
  format: string;
  size: number;
  uploadedById: number;
  program: { id: number; name: string; createdAt: string };
  programId: number;
  category: string;
  isFeatured: false;
  monetization: string;
  allowComments: boolean;
  codec: string;
  
}
