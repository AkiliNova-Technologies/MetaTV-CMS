export interface Music{
  id: number,
  title: string,
  artist: string,
  audioUrl: string,
  thumbnailUrl: string,
  duration: number,
  plays: number,
  genre: string[],
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED" ,
  released: string | null,
  licensed: string,
  createdAt: string,
  uploadedBy: {
    id: number,
    name: string,
    avatar: string | null,
  },
  likes: {
    id: number,
    name: string,
  }[],
};