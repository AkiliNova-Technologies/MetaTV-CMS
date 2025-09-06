import React from "react";
import type z from "zod";
import type { musicSchema, videoSchema } from "@/constants/Schemas";
import {
  VideoSectionCards,
  type CardData as VideoCardData,
} from "@/components/video-section-cards";
import {
  TeamSectionCards,
  type CardData as TeamCardData,
} from "@/components/team-section-cards";
import {
  LivestreamSectionCards,
  type CardData as StreamCardData,
} from "@/components/livestream-section-cards";
import {
  ProgramSectionCards,
  type CardData as ProgramCardData,
} from "@/components/program-section-cards";
import {
  MusicSectionCards,
  type CardData as MusicCardData,
} from "@/components/music-section-cards";

import { useReduxUsers } from "@/hooks/useReduxUsers";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import { useReduxLiveStreams } from "@/hooks/useReduxLiveStreams";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { useReduxMusic } from "@/hooks/useReduxMusic";

const getTrend = (value: number): "up" | "down" => (value > 0 ? "up" : "down");

type VideoTableVideo = z.infer<typeof videoSchema> & { programId?: number };

type MusicTableSong = z.infer<typeof musicSchema>;

interface MusicResponse {
  music: z.infer<typeof musicSchema>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function DashboardHome() {
  const { videos } = useReduxVideos();
  const { music: musicResponse } = useReduxMusic(); // Rename to musicResponse
  const { users } = useReduxUsers();
  const { livestreams } = useReduxLiveStreams();
  const { programs } = useReduxPrograms();

  // Extract the music array from the response
  const music = React.useMemo(() => {
    if (Array.isArray(musicResponse)) {
      return musicResponse;
    }
    if (
      musicResponse &&
      typeof musicResponse === "object" &&
      "music" in musicResponse
    ) {
      return (musicResponse as MusicResponse).music || [];
    }
    return [];
  }, [musicResponse]);

  const teamData = React.useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      lastLogin: user.lastLogin,
      avatarUrl: user.avatar,
      status: user.status,
    }));
  }, [users]);

  const programData = React.useMemo(() => {
    if (!Array.isArray(programs)) return [];

    return programs.map((program) => ({
      id: program.id,
      name: program.name,
      description: program.description,
      createdAt: program.createdAt,
      videos: program.videos,
      subscribers: program.subscribers,
    }));
  }, [programs]);

  const totalPrograms = programData.length;
  const totalVideos = programData.reduce(
    (sum, program) => sum + (program.videos?.length || 0),
    0
  );
  const totalSubscribers = programData.reduce(
    (sum, program) => sum + (program.subscribers?.length || 0),
    0
  );
  const recentPrograms = programData.filter(
    (program) =>
      new Date(program.createdAt) >=
      new Date(new Date().setMonth(new Date().getMonth() - 1))
  ).length;

  const streamCards = React.useMemo<StreamCardData[]>(
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

  const videoCards = React.useMemo<VideoCardData[]>(
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

  const musicCards = React.useMemo<MusicCardData[]>(
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
        value: music.filter((m: MusicTableSong) => m.visibility === "PUBLIC")
          .length,
        trend: getTrend(
          music.filter((m: MusicTableSong) => m.visibility === "PUBLIC").length
        ),
        percentage: "+6%",
        footerMain: "Good reach",
        footerSub: "Songs visible to the public",
      },
      {
        title: "New Songs",
        value: music.filter(
          (m: MusicTableSong) =>
            new Date(m.createdAt) >=
            new Date(new Date().setMonth(new Date().getMonth() - 1))
        ).length,
        trend: getTrend(
          music.filter(
            (m: MusicTableSong) =>
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
        value: music.reduce(
          (acc: number, m: MusicTableSong) => acc + (m.plays || 0),
          0
        ),
        trend: getTrend(
          music.reduce(
            (acc: number, m: MusicTableSong) => acc + (m.plays || 0),
            0
          )
        ),
        percentage: "-2%",
        footerMain: "Audience activity",
        footerSub: "Plays tracked across catalog",
      },
    ],
    [music]
  );

  const teamCards = React.useMemo<TeamCardData[]>(
    () => [
      {
        title: "Total Members",
        value: teamData.length,
        trend: "up",
        percentage: "+8%",
        footerMain: "Growing steadily",
        footerSub: "All users in your organization",
      },
      {
        title: "Active Members",
        value: users.filter((u) => u.status === "ACTIVE").length,
        trend: "up",
        percentage: "+12%",
        footerMain: "Good engagement",
        footerSub: "Users active this month",
      },
      {
        title: "New Members",
        value: users.filter(
          (u) =>
            new Date(u.createdAt) >=
            new Date(new Date().setMonth(new Date().getMonth() - 1))
        ).length,
        trend: "up",
        percentage: "+5%",
        footerMain: "New hires onboarded",
        footerSub: "In the last 30 days",
      },
      {
        title: "Recent Logins",
        value: users.filter(
          (u) =>
            u.lastLogin &&
            new Date(u.lastLogin) >=
              new Date(new Date().setDate(new Date().getDate() - 7))
        ).length,
        trend: "down",
        percentage: "-3%",
        footerMain: "Weekly engagement",
        footerSub: "Users logged in past 7 days",
      },
    ],
    [teamData, users]
  );

  const programCards = React.useMemo<ProgramCardData[]>(
    () => [
      {
        title: "Total Programs",
        value: totalPrograms,
        trend: getTrend(totalPrograms),
        percentage: "+5%",
        footerMain: "Program portfolio",
        footerSub: "All programs in your organization",
      },
      {
        title: "Total Videos",
        value: totalVideos,
        trend: getTrend(totalVideos),
        percentage: "+10%",
        footerMain: "Content growth",
        footerSub: "Videos across all programs",
      },
      {
        title: "Total Subscribers",
        value: totalSubscribers,
        trend: getTrend(totalSubscribers),
        percentage: "+8%",
        footerMain: "Audience reach",
        footerSub: "Subscribers across all programs",
      },
      {
        title: "Recent Programs",
        value: recentPrograms,
        trend: getTrend(recentPrograms),
        percentage: recentPrograms > 0 ? "+3%" : "-2%",
        footerMain: "New initiatives",
        footerSub: "Programs created in the last 30 days",
      },
    ],
    [totalPrograms, totalVideos, totalSubscribers, recentPrograms]
  );

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-0">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 md:py-0">
          <div className="px-3 lg:px-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Summary of MetaTV's performance
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Members
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Team metrics
              </span>
            </div>
            <div className="px-4">
              <TeamSectionCards cards={teamCards} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Programs
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Performance metrics
              </span>
            </div>
            <div className="px-4">
              <ProgramSectionCards cards={programCards} />
            </div>
          </div>

          {/* Video and Music Sections with Headings */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-4 lg:px-6">
            {/* Video Section with right border */}
            <div className="space-y-4 md:pr-6 md:border-r md:border-gray-200 dark:md:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Video Content
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Performance metrics
                </span>
              </div>
              <VideoSectionCards
                cards={videoCards}
                videos={videos as VideoTableVideo[]}
                layout="2x2"
              />
            </div>

            {/* Music Section with left padding */}
            <div className="space-y-4 md:pl-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Music Content
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Performance metrics
                </span>
              </div>
              <MusicSectionCards
                cards={musicCards}
                music={music as MusicTableSong[]}
                layout="2x2"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                LiveStream Content
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Performance metrics
              </span>
            </div>
            <div className="px-4">
              <LivestreamSectionCards
                livestreams={livestreams}
                cards={streamCards}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
