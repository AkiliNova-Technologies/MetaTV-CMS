// import React from "react";
// import { ProgramTable } from "@/components/program-table";
// import { useReduxPrograms } from "@/hooks/useReduxPrograms";
// import { ProgramSectionCards } from "@/components/program-section-cards";
import type { CardData } from "@/components/music-section-cards";
import { MusicSectionCards } from "@/components/music-section-cards";
import { MusicTable } from "@/components/music-table";
import type { musicSchema } from "@/constants/Schemas";
import React from "react";
import type z from "zod";

const mockMusicData = [
  {
    id: 1,
    title: "Echoes of Tomorrow",
    artist: "Luna Waves",
    audioUrl: "https://example.com/audio/echoes-of-tomorrow.mp3",
    thumbnailUrl: "https://example.com/thumbnails/echoes.jpg",
    duration: 214,
    plays: 12893,
    genre: ["Electronic", "Chillwave"],
    visibility: "PUBLIC" as const,
    released: "2023-05-14",
    licensed: "CC-BY",
    createdAt: "2023-06-01T10:23:45.000Z",
    uploadedBy: {
      id: 101,
      name: "Admin User",
    },
    likes: [
      { id: 201, name: "Alice" },
      { id: 202, name: "Bob" },
      { id: 203, name: "Charlie" },
    ],
  },
  {
    id: 2,
    title: "Silent Horizon",
    artist: "Eclipse Avenue",
    audioUrl: "https://example.com/audio/silent-horizon.mp3",
    thumbnailUrl: "https://example.com/thumbnails/horizon.jpg",
    duration: 185,
    plays: 5432,
    genre: ["Indie", "Alternative"],
    visibility: "PUBLIC" as const,
    released: "2022-09-09",
    licensed: "All Rights Reserved",
    createdAt: "2022-09-10T14:02:11.000Z",
    uploadedBy: {
      id: 102,
      name: "MusicUploader",
    },
    likes: [
      { id: 204, name: "Diana" },
      { id: 205, name: "Ethan" },
    ],
  },
  {
    id: 3,
    title: "Neon Skyline",
    artist: "The Midnight Riders",
    audioUrl: "https://example.com/audio/neon-skyline.mp3",
    thumbnailUrl: "https://example.com/thumbnails/neon.jpg",
    duration: 247,
    plays: 22015,
    genre: ["Synthwave", "Retro"],
    visibility: "UNLISTED" as const,
    released: "2021-12-01",
    licensed: "CC-BY-NC",
    createdAt: "2021-12-02T08:40:00.000Z",
    uploadedBy: {
      id: 103,
      name: "SynthMaster",
    },
    likes: [
      { id: 206, name: "Fiona" },
      { id: 207, name: "George" },
      { id: 208, name: "Henry" },
      { id: 209, name: "Ivy" },
    ],
  },
  {
    id: 4,
    title: "Wandering Souls",
    artist: "Aurora Lane",
    audioUrl: "https://example.com/audio/wandering-souls.mp3",
    thumbnailUrl: "https://example.com/thumbnails/souls.jpg",
    duration: 199,
    plays: 7821,
    genre: ["Acoustic", "Folk"],
    visibility: "PRIVATE" as const,
    released: null,
    licensed: "CC0",
    createdAt: "2023-11-21T17:33:59.000Z",
    uploadedBy: {
      id: 104,
      name: "FolkArtist",
    },
    likes: [{ id: 210, name: "Jack" }],
  },
  {
    id: 5,
    title: "Crimson Skies",
    artist: "Velvet Dawn",
    audioUrl: "https://example.com/audio/crimson-skies.mp3",
    thumbnailUrl: "https://example.com/thumbnails/crimson.jpg",
    duration: 261,
    plays: 15762,
    genre: ["Rock", "Alternative"],
    visibility: "PUBLIC" as const,
    released: "2024-03-15",
    licensed: "All Rights Reserved",
    createdAt: "2024-03-16T12:15:22.000Z",
    uploadedBy: {
      id: 105,
      name: "RockUploader",
    },
    likes: [
      { id: 211, name: "Karen" },
      { id: 212, name: "Leo" },
      { id: 213, name: "Mona" },
    ],
  },
];


type MusicTableSong = z.infer<typeof musicSchema>;

export default function DashboardMusic() {
  // const { music, loading } = useReduxMusic();
  const music = mockMusicData;
  const [filters, setFilters] = React.useState<{ key: string; value: string | number } | null>(null);

  const musicData = React.useMemo(() => {
    if (!Array.isArray(music)) return [];

    let filteredMusic = music as MusicTableSong[];
    if (filters) {
      if (filters.key === "visibility") {
        filteredMusic = music.filter((m) => m.visibility === filters.value);
      } else if (filters.key === "createdAt") {
        filteredMusic = music.filter(
          (m) => new Date(m.createdAt) >= new Date(filters.value as string)
        );
      }
    }

    return filteredMusic;
  }, [music, filters]);

  const getTrend = (value: number): "up" | "down" => (value > 0 ? "up" : "down");

  const cards = React.useMemo<CardData[]>(
    () => [
      {
        title: "Total Songs",
        value: music.length,
        trend: getTrend(music.length),
        percentage: "+10%",
        footerMain: "Library growth",
        footerSub: "All songs in your catalog",
      },
      {
        title: "Public Songs",
        value: music.filter((m) => m.visibility === "PUBLIC").length,
        trend: getTrend(music.filter((m) => m.visibility === "PUBLIC").length),
        percentage: "+6%",
        footerMain: "Good reach",
        footerSub: "Songs visible to the public",
      },
      {
        title: "New Songs",
        value: music.filter(
          (m) =>
            new Date(m.createdAt) >= new Date(new Date().setMonth(new Date().getMonth() - 1))
        ).length,
        trend: getTrend(
          music.filter(
            (m) =>
              new Date(m.createdAt) >= new Date(new Date().setMonth(new Date().getMonth() - 1))
          ).length
        ),
        percentage: "+3%",
        footerMain: "Fresh uploads",
        footerSub: "Songs added in the last 30 days",
      },
      {
        title: "Total Plays",
        value: music.reduce((acc, m) => acc + (m.plays || 0), 0),
        trend: getTrend(music.reduce((acc, m) => acc + (m.plays || 0), 0)),
        percentage: "-2%",
        footerMain: "Audience activity",
        footerSub: "Plays tracked across catalog",
      },
    ],
    [music]
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Music Management</h1>
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
              <MusicSectionCards
                cards={cards}
                music={music as MusicTableSong[]}
              />
              <MusicTable music={musicData} />
            </>
          
        </div>
      </div>
    </div>
  );
}