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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Video,
  Music,
  Users,
  Calendar,
  Eye,
  Activity,
} from "lucide-react";
import { IconBroadcast } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { videos } = useReduxVideos();
  const { music: musicResponse } = useReduxMusic();
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

  // Quick stats for hero section
  // const quickStats = React.useMemo(
  //   () => ({
  //     totalContent: videos.length + music.length + livestreams.length,
  //     totalViews:
  //       videos.reduce((acc, v) => acc + (v.views || 0), 0) +
  //       livestreams.reduce((acc, s) => acc + s.totalViews, 0),
  //     activeNow: livestreams.filter((s) => s.status === "LIVE").length,
  //     teamSize: users.length,
  //   }),
  //   [videos, music, livestreams, users]
  // );

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b px-6 py-12">
        <div className="absolute inset-0  opacity-5" />
        <div className="relative max-w-8xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Activity className="size-3 animate-pulse" />
                  Live Dashboard
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <Eye className="size-3" />
                  Real-time Data
                </Badge>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  Welcome Back
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Here's what's happening with your content today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-8xl mx-auto space-y-12">
        {/* Livestream Section - Full Width for Prominence */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <IconBroadcast className="size-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold">Livestream Activity</h2>
              </div>
              <p className="text-sm text-muted-foreground ml-[52px]">
                Monitor your live broadcasts and viewer engagement
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={()=> navigate("/dashboard/livestream")}>
              View All
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <LivestreamSectionCards
            livestreams={livestreams}
            cards={streamCards}
            layout="2x2"
          />
        </section>

        {/* Video & Music Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Video className="size-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Video Content</h2>
                </div>
                <p className="text-sm text-muted-foreground ml-[52px]">
                  Video library analytics
                </p>
              </div>
            </div>
            <VideoSectionCards
              cards={videoCards}
              videos={videos as VideoTableVideo[]}
              layout="2x2"
            />
          </div>

          {/* Music Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Music className="size-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Music Library</h2>
                </div>
                <p className="text-sm text-muted-foreground ml-[52px]">
                  Audio catalog insights
                </p>
              </div>
            </div>
            <MusicSectionCards
              cards={musicCards}
              music={music as MusicTableSong[]}
              layout="2x2"
            />
          </div>
        </section>

        {/* Programs Section - Full Width */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                  <Calendar className="size-5 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold">Programs Overview</h2>
              </div>
              <p className="text-sm text-muted-foreground ml-[52px]">
                Track your program performance and growth
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={()=> navigate("/dashboard/programs")}>
              Manage Programs
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <ProgramSectionCards cards={programCards} layout="auto" />
        </section>

        {/* Team Section - Full Width */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Users className="size-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Team Members</h2>
              </div>
              <p className="text-sm text-muted-foreground ml-[52px]">
                Monitor team activity and collaboration
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={()=> navigate("/dashboard/team")}>
              Manage Team
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <TeamSectionCards cards={teamCards} layout="2x2" />
        </section>

        {/* Insights Card */}
        <Card className="border-dashed bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 flex-col md:flex-row">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="size-8 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold">Performance Insights</h3>
                <p className="text-muted-foreground text-lg">
                  Your content is performing well! Video views are up 8% and
                  music plays increased by 10% this month. Keep up the great
                  work!
                </p>
                <div className="flex gap-3 pt-2">
                  <Button className="gap-2">
                    <TrendingUp className="size-4" />
                    View Detailed Analytics
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <ArrowRight className="size-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
