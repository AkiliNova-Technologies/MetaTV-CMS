import React from "react";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import { VideoTable } from "@/components/video-table";
import { VideoSectionCards } from "@/components/video-section-cards";
import type { CardData } from "@/components/video-section-cards";
// import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


export default function DashboardVideos() {
  const { videos } = useReduxVideos();
  const [filters, setFilters] = React.useState<{ key: string; value: string | number } | null>(null);

  // Ensure all required fields are present for VideoSectionCards and VideoTable
  const fullVideos = React.useMemo(() => {
    if (!Array.isArray(videos)) return [];
    return videos.map((v) => ({
      ...v,
      allowComments: v.allowComments ?? true,
      codec: v.codec ?? "",
      isFeatured: v.isFeatured ?? false,
      monetization: v.monetization ?? "",
      uploadedById: v.uploadedById ?? 0,

    }));
  }, [videos]);

  const filteredVideos = React.useMemo(() => {
    if (!Array.isArray(fullVideos)) return [];

    let filtered = fullVideos;
    if (filters) {
      if (filters.key === "visibility") {
        filtered = fullVideos.filter((v) => v.visibility === filters.value);
      } else if (filters.key === "createdAt") {
        filtered = fullVideos.filter(
          (v) => new Date(v.createdAt) >= new Date(filters.value as string)
        );
      }
    }
    return filtered;
  }, [fullVideos, filters]);

  const getTrend = (value: number): "up" | "down" => (value > 0 ? "up" : "down");

  const cards = React.useMemo<CardData[]>(
    () => [
      {
        title: "Total Videos",
        value: fullVideos.length,
        trend: getTrend(fullVideos.length),
        percentage: "+8%",
        footerMain: "Growing steadily",
        footerSub: "All videos in your organization",
      },
      {
        title: "Public Videos",
        value: fullVideos.filter((v) => v.visibility === "PUBLIC").length,
        trend: getTrend(fullVideos.filter((v) => v.visibility === "PUBLIC").length),
        percentage: "+12%",
        footerMain: "Good engagement",
        footerSub: "Videos active this month",
      },
      {
        title: "New Videos",
        value: fullVideos.filter(
          (v) =>
            new Date(v.createdAt) >=
            new Date(new Date().setMonth(new Date().getMonth() - 1))
        ).length,
        trend: getTrend(
          fullVideos.filter(
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
        value: fullVideos.reduce((acc, v) => acc + (v.views || 0), 0),
        trend: getTrend(fullVideos.reduce((acc, v) => acc + (v.views || 0), 0)),
        percentage: "-3%",
        footerMain: "Weekly engagement",
        footerSub: "Total views in past 7 days",
      },
    ],
    [fullVideos]
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
            videos={fullVideos}
            onFilterChange={handleFilterChange}
          />
          <VideoTable videos={filteredVideos} />
        </div>
      </div>
    </div>
  );
}