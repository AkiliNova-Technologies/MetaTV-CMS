import React from "react";

// import type { Livestream } from "@/types/livestream";
import {
  LivestreamSectionCards,
  type CardData as StreamCardData,
} from "@/components/livestream-section-cards";
import { LiveStreamTable } from "@/components/livestream-table";
import { useReduxLiveStreams } from "@/hooks/useReduxLiveStreams";

export default function LivestreamDashboard() {
  const { livestreams } = useReduxLiveStreams();
  const [filters, setFilters] = React.useState<{
    key: string;
    value: string | number;
  } | null>(null);

  console.log("Livestreams in Dashboard:", livestreams);

  const getTrend = (value: number): "up" | "down" =>
    value > 0 ? "up" : "down";

  const cards = React.useMemo<StreamCardData[]>(
    () => [
      {
        title: "Active Streams",
        value: livestreams.filter((s) => s.status === "LIVE").length,
        trend: getTrend(livestreams.filter((s) => s.status === "LIVE").length),
        percentage: "+2",
        footerMain: "Currently streaming",
        footerSub: "Live broadcasts right now",
      },
      {
        title: "Total Viewers",
        value: livestreams.reduce((acc, s) => acc + s.currentViewers, 0),
        trend: getTrend(
          livestreams.reduce((acc, s) => acc + s.currentViewers, 0)
        ),
        percentage: "+15%",
        footerMain: "Watching now",
        footerSub: "Across all active streams",
      },
      {
        title: "Scheduled Streams",
        value: livestreams.filter((s) => s.status === "SCHEDULED").length,
        trend: getTrend(
          livestreams.filter((s) => s.status === "SCHEDULED").length
        ),
        percentage: "+1",
        footerMain: "Coming up",
        footerSub: "Streams scheduled for today",
      },
      {
        title: "Total Views",
        value: livestreams.reduce((acc, s) => acc + s.totalViews, 0),
        trend: getTrend(livestreams.reduce((acc, s) => acc + s.totalViews, 0)),
        percentage: "+8%",
        footerMain: "All-time views",
        footerSub: "Across all streams",
      },
    ],
    [livestreams]
  );

  const handleFilterChange = (filter: {
    key: string;
    value: string | number;
  }) => {
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
                Livestream Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your live streams and broadcast content
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

          <div className="px-6">
            <LivestreamSectionCards
              cards={cards}
              livestreams={livestreams}
              onFilterChange={handleFilterChange}
              layout="auto"
            />
          </div>

          <LiveStreamTable livestreams={livestreams} />
        </div>
      </div>
    </div>
  );
}
