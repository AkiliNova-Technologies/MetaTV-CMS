import { SectionCards } from "@/components/section-cards";
import {
  VideoSectionCards,
  type CardData as VideoCardData,
} from "@/components/video-section-cards";
import {
  TeamSectionCards,
  type CardData as TeamCardData,
} from "@/components/team-section-cards";

import type { videoSchema } from "@/constants/Schemas";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import React from "react";
import type z from "zod";

const getTrend = (value: number): "up" | "down" => (value > 0 ? "up" : "down");

type VideoTableVideo = z.infer<typeof videoSchema> & { programId?: number };

export default function DashboardHome() {
  const { videos } = useReduxVideos();

  const { users } = useReduxUsers();

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
          <SectionCards />
          <div>
            <VideoSectionCards
              cards={videoCards}
              videos={videos as VideoTableVideo[]}
            />
          </div>
          <div>
            <TeamSectionCards cards={teamCards} />
          </div>
        </div>
      </div>
    </div>
  );
}
