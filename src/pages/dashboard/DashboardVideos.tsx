import React from "react";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import { VideoTable } from "@/components/video-table";
import { VideoSectionCards } from "@/components/video-section-cards";
// import { IconAlertCircle } from "@tabler/icons-react";
// import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { videoSchema } from "@/constants/Schemas";
import { z } from "zod";
import type { CardData } from "@/components/video-section-cards";
// import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Extend videoSchema to make programId optional
type VideoTableVideo = z.infer<typeof videoSchema> & { programId?: number };

export default function DashboardVideos() {
  const { videos, loading } = useReduxVideos();
  const [filters, setFilters] = React.useState<{ key: string; value: string | number } | null>(null);

  const videoData = React.useMemo(() => {
    if (!Array.isArray(videos)) return [];

    let filteredVideos = videos as VideoTableVideo[];
    if (filters) {
      if (filters.key === "visibility") {
        filteredVideos = videos.filter((v) => v.visibility === filters.value);
      } else if (filters.key === "createdAt") {
        filteredVideos = videos.filter(
          (v) => new Date(v.createdAt) >= new Date(filters.value as string)
        );
      }
    }

    return filteredVideos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description || "",
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      tags: video.tags,
      resolution: video.resolution,
      views: video.views,
      isApproved: video.isApproved,
      visibility: video.visibility as "PUBLIC" | "PRIVATE" | "UNLISTED",
      createdAt: video.createdAt,
      format: video.format,
      size: video.size,
      program: video.program,
      category: video.category,
      programId: video.programId || video.program?.id || undefined, // Fallback to program.id or undefined
    }));
  }, [videos, filters]);

  const getTrend = (value: number): "up" | "down" => (value > 0 ? "up" : "down");

  const cards = React.useMemo<CardData[]>(
    () => [
      {
        title: "Total Videos",
        value: videos.length,
        trend: getTrend(videos.length),
        percentage: "+8%",
        footerMain: "Growing steadily",
        footerSub: "All videos in your organization",
      },
      {
        title: "Public Videos",
        value: videos.filter((v) => v.visibility === "PUBLIC").length,
        trend: getTrend(videos.filter((v) => v.visibility === "PUBLIC").length),
        percentage: "+12%",
        footerMain: "Good engagement",
        footerSub: "Videos active this month",
      },
      {
        title: "New Videos",
        value: videos.filter(
          (v) =>
            new Date(v.createdAt) >=
            new Date(new Date().setMonth(new Date().getMonth() - 1))
        ).length,
        trend: getTrend(
          videos.filter(
            (v) =>
              new Date(v.createdAt) >=
              new Date(new Date().setMonth(new Date().getMonth() - 1))
          ).length
        ),
        percentage: "+5%",
        footerMain: "New videos added",
        footerSub: "In the last 30 days",
      },
      {
        title: "Total Views",
        value: videos.reduce((acc, v) => acc + (v.views || 0), 0),
        trend: getTrend(videos.reduce((acc, v) => acc + (v.views || 0), 0)),
        percentage: "-3%",
        footerMain: "Weekly engagement",
        footerSub: "Total views in past 7 days",
      },
    ],
    [videos]
  );

  const handleFilterChange = (filter: { key: string; value: string | number }) => {
    setFilters(filter);
  };

  const handleClearFilters = () => {
    setFilters(null);
  };

  return (
    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-0 md:gap-6 md:py-0">
          <div className="flex justify-between items-center px-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Video Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organization's videos and content
              </p>
            </div>
            {filters && (
              <button
                className="text-sm text-primary hover:underline"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          
              <VideoSectionCards
                cards={cards}
                videos={videos as VideoTableVideo[]}
                onFilterChange={handleFilterChange}
              />
              <VideoTable videos={videoData} />
          
        </div>
      </div>
    </div>
  );
}