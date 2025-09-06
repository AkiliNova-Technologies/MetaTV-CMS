import type { CardData } from "@/components/music-section-cards";
import { MusicSectionCards } from "@/components/music-section-cards";
import { MusicTable } from "@/components/music-table";
import type { musicSchema } from "@/constants/Schemas";
import { useReduxMusic } from "@/hooks/useReduxMusic";
import React from "react";
import type z from "zod";

interface MusicResponse {
  music: z.infer<typeof musicSchema>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

type MusicTableSong = z.infer<typeof musicSchema>;

export default function DashboardMusic() {
  const { music } = useReduxMusic();

  const safeMusic = React.useMemo(() => {
    if (Array.isArray(music)) {
      return music;
    }
    
    // If music is not an array, check if it's a MusicResponse object
    if (music && typeof music === 'object' && 'music' in music) {
      const musicResponse = music as MusicResponse;
      if (Array.isArray(musicResponse.music)) {
        return musicResponse.music;
      }
    }
    
    return [];
  }, [music]);

  const [filters, setFilters] = React.useState<{
    key: string;
    value: string | number;
  } | null>(null);

  const musicData = React.useMemo(() => {
    let filteredMusic = safeMusic;
    
    if (filters) {
      if (filters.key === "visibility") {
        filteredMusic = safeMusic.filter((m: MusicTableSong) => m.visibility === filters.value);
      } else if (filters.key === "createdAt") {
        filteredMusic = safeMusic.filter((m: MusicTableSong) =>
          new Date(m.createdAt) >= new Date(filters.value as string)
        );
      }
    }

    return filteredMusic;
  }, [safeMusic, filters]);

  const getTrend = (value: number): "up" | "down" =>
    value > 0 ? "up" : "down";

  const cards = React.useMemo<CardData[]>(
    () => [
      {
        title: "Total Songs",
        value: safeMusic.length,
        trend: getTrend(safeMusic.length),
        percentage: "+10%",
        footerMain: "Library growth",
        footerSub: "All songs in your catalog",
      },
      {
        title: "Public Songs",
        value: safeMusic.filter((m: MusicTableSong) => m.visibility === "PUBLIC").length,
        trend: getTrend(safeMusic.filter((m: MusicTableSong) => m.visibility === "PUBLIC").length),
        percentage: "+6%",
        footerMain: "Good reach",
        footerSub: "Songs visible to the public",
      },
      {
        title: "New Songs",
        value: safeMusic.filter((m: MusicTableSong) =>
          new Date(m.createdAt) >=
          new Date(new Date().setMonth(new Date().getMonth() - 1))
        ).length,
        trend: getTrend(
          safeMusic.filter((m: MusicTableSong) =>
            new Date(m.createdAt) >=
            new Date(new Date().setMonth(new Date().getMonth() - 1))
          ).length
        ),
        percentage: "+3%",
        footerMain: "Fresh uploads",
        footerSub: "Songs added in the last 30 days",
      },
      {
        title: "Total Plays",
        value: safeMusic.reduce((acc: number, m: MusicTableSong) => acc + (m.plays || 0), 0),
        trend: getTrend(safeMusic.reduce((acc: number, m: MusicTableSong) => acc + (m.plays || 0), 0)),
        percentage: "-2%",
        footerMain: "Audience activity",
        footerSub: "Plays tracked across catalog",
      },
    ],
    [safeMusic]
  );

  const handleClearFilters = () => {
    setFilters(null);
  };

  return (
    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-center px-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Music Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organization's music catalog
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

          <>
          <div className="px-6">
            <MusicSectionCards
              cards={cards}
              music={safeMusic}
              layout="auto"
            />
          </div>
            <MusicTable music={musicData} />
          </>
        </div>
      </div>
    </div>
  );
}