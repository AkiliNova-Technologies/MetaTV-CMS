export type LivestreamStatus = "LIVE" | "SCHEDULED" | "ENDED" | "PREPARING";

export interface Livestream {
  id: number;
  title: string;
  description?: string | null;
  status: LivestreamStatus;

  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;

  streamKey: string;
  streamUrl: string;
  thumbnailUrl?: string | null;

  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  isRecording: boolean;

  currentViewers: number;
  peakViewers?: number | null;
  totalViews: number;
  duration?: number | null; // in seconds

  quality?: string | null;
  category?: string | null;
  tags?: string[];

  programId?: number | null;
  program?: {
    id: number;
    name: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}
