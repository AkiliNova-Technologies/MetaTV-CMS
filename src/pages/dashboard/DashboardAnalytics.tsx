import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Label,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Import your existing hooks and types
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import { useReduxLiveStreams } from "@/hooks/useReduxLiveStreams";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { useReduxMusic } from "@/hooks/useReduxMusic";
import type z from "zod";
import type { musicSchema } from "@/constants/Schemas";

// Define types for the chart data

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface TimeSeriesData {
  date: string;
  videos: number;
  streams: number;
  music: number;
  users: number;
}

// Chart configurations
const areaChartConfig = {
  videos: {
    label: "Videos",
    color: "var(--chart-1)",
  },
  streams: {
    label: "Streams",
    color: "var(--chart-2)",
  },
  music: {
    label: "Music",
    color: "var(--chart-3)",
  },
  users: {
    label: "Users",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const barChartConfig = {
  value: {
    label: "Count",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  value: {
    label: "Count",
  },
} satisfies ChartConfig;

// User growth chart configuration
const userGrowthConfig = {
  users: {
    label: "Users",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function DashboardAnalytics() {
  const { videos } = useReduxVideos();
  const { music: musicResponse } = useReduxMusic();
  const { users } = useReduxUsers();
  const { livestreams } = useReduxLiveStreams();
  const { programs } = useReduxPrograms();

  // State for time range filters
  const [userGrowthTimeRange, setUserGrowthTimeRange] = React.useState("1m");
  const [contentGrowthTimeRange, setContentGrowthTimeRange] =
    React.useState("1m");

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
      return (
        (musicResponse as { music: z.infer<typeof musicSchema>[] }).music || []
      );
    }
    return [];
  }, [musicResponse]);

  // Prepare detailed user data for filtering
  const detailedUserData = React.useMemo(() => {
    return users.map((user) => ({
      date: new Date(user.createdAt),
      count: 1,
    }));
  }, [users]);

  // Prepare detailed content data for filtering
  const detailedContentData = React.useMemo(() => {
    const allData: { date: Date; type: keyof TimeSeriesData }[] = [];

    users.forEach((user) =>
      allData.push({ date: new Date(user.createdAt), type: "users" })
    );
    videos.forEach((video) =>
      allData.push({ date: new Date(video.createdAt), type: "videos" })
    );
    livestreams.forEach((stream) =>
      allData.push({ date: new Date(stream.createdAt), type: "streams" })
    );
    music.forEach((song) =>
      allData.push({ date: new Date(song.createdAt), type: "music" })
    );

    return allData;
  }, [users, videos, livestreams, music]);

  // Filter data based on time range
  const filterDataByTimeRange = <T extends { date: Date }>(
    data: T[],
    timeRange: string
  ): T[] => {
    const now = new Date();
    const filtered = data.filter((item) => {
      const itemDate = item.date;
      const startDate = new Date();

      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "1m":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      return itemDate >= startDate;
    });

    return filtered;
  };

  // Prepare filtered user growth data
  const filteredUserGrowthData = React.useMemo(() => {
    const filtered = filterDataByTimeRange(
      detailedUserData,
      userGrowthTimeRange
    );

    // Group by appropriate time unit based on selected range
    const groupedData: Record<string, number> = {};

    filtered.forEach((item) => {
      let key: string;

      if (userGrowthTimeRange === "7d") {
        // Group by day of week
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        key = dayNames[item.date.getDay()];
      } else if (userGrowthTimeRange === "1m") {
        // Group by week
        const week = Math.floor(item.date.getDate() / 7) + 1;
        key = `Week ${week}`;
      } else {
        // Group by month
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        key = monthNames[item.date.getMonth()];
      }

      groupedData[key] = (groupedData[key] || 0) + item.count;
    });

    return Object.entries(groupedData).map(([date, users]) => ({
      date,
      users,
    }));
  }, [detailedUserData, userGrowthTimeRange]);

  // Prepare filtered content growth data
  const filteredContentGrowthData = React.useMemo(() => {
    const filtered = filterDataByTimeRange(
      detailedContentData,
      contentGrowthTimeRange
    );

    // Group by appropriate time unit and type
    const groupedData: Record<string, TimeSeriesData> = {};

    filtered.forEach((item) => {
      let key: string;

      if (contentGrowthTimeRange === "7d") {
        // Group by day of week
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        key = dayNames[item.date.getDay()];
      } else if (contentGrowthTimeRange === "1m") {
        // Group by week
        const week = Math.floor(item.date.getDate() / 7) + 1;
        key = `Week ${week}`;
      } else {
        // Group by month
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        key = monthNames[item.date.getMonth()];
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          videos: 0,
          streams: 0,
          music: 0,
          users: 0,
        };
      }

      // Use type-safe access with type assertion
      const itemWithType = item as { date: Date; type: keyof TimeSeriesData };
      switch (itemWithType.type) {
        case "videos":
          groupedData[key].videos += 1;
          break;
        case "streams":
          groupedData[key].streams += 1;
          break;
        case "music":
          groupedData[key].music += 1;
          break;
        case "users":
          groupedData[key].users += 1;
          break;
      }
    });

    return Object.values(groupedData);
  }, [detailedContentData, contentGrowthTimeRange]);

  // Prepare data for content distribution
  const contentDistributionData = React.useMemo<ChartData[]>(() => {
    return [
      { name: "Videos", value: videos.length, fill: "var(--chart-1)" },
      {
        name: "Live Streams",
        value: livestreams.length,
        fill: "var(--chart-2)",
      },
      { name: "Music", value: music.length, fill: "var(--chart-3)" },
      { name: "Programs", value: programs.length, fill: "var(--chart-4)" },
    ];
  }, [videos, livestreams, music, programs]);

  // Prepare data for video views by category
  const videoViewsByCategory = React.useMemo<ChartData[]>(() => {
    const categories: Record<string, number> = {};

    videos.forEach((video) => {
      const category = video.category || "Uncategorized";
      categories[category] = (categories[category] || 0) + (video.views || 0);
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [videos]);

  // Prepare data for user roles distribution
  const userRolesData = React.useMemo<ChartData[]>(() => {
    const roles: Record<string, number> = {};

    users.forEach((user) => {
      roles[user.role] = (roles[user.role] || 0) + 1;
    });

    return Object.entries(roles).map(([name, value]) => ({
      name,
      value,
      fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }));
  }, [users]);

  // Prepare data for top performing videos
  const topPerformingVideos = React.useMemo<ChartData[]>(() => {
    return videos
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((video) => ({
        name:
          video.title.length > 15
            ? `${video.title.substring(0, 15)}...`
            : video.title,
        value: video.views || 0,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }));
  }, [videos]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-0">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 md:py-0">
          <div className="px-3 lg:px-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Analysis of MetaTV's performance and engagement
            </p>
          </div>

          {/* User Growth Area Chart */}
          <div className="px-4 lg:px-6">
            <Card className="@container/card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    User registration trends over time
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleGroup
                    type="single"
                    value={userGrowthTimeRange}
                    onValueChange={setUserGrowthTimeRange}
                    variant="outline"
                    className="hidden *:data-[slot=toggle-group-item]:!px-3 sm:flex"
                  >
                    <ToggleGroupItem value="7d">7D</ToggleGroupItem>
                    <ToggleGroupItem value="1m">1M</ToggleGroupItem>
                    <ToggleGroupItem value="1y">1Y</ToggleGroupItem>
                  </ToggleGroup>
                  <Select
                    value={userGrowthTimeRange}
                    onValueChange={setUserGrowthTimeRange}
                  >
                    <SelectTrigger className="w-20 sm:hidden">
                      <SelectValue placeholder="7D" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                  config={userGrowthConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <AreaChart data={filteredUserGrowthData}>
                    <defs>
                      <linearGradient
                        id="fillUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-users)"
                          stopOpacity={1.0}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-users)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={userGrowthTimeRange === "7d" ? 8 : 4}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Area
                      dataKey="users"
                      type="natural"
                      fill="url(#fillUsers)"
                      stroke="var(--color-users)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  User base growing steadily <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  {users.length} total users registered
                </div>
              </CardFooter>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="px-4 lg:px-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Content Growth Area Chart */}
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Content Growth Over Time</CardTitle>
                      <CardDescription>Content creation trends</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleGroup
                        type="single"
                        value={contentGrowthTimeRange}
                        onValueChange={setContentGrowthTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-3 sm:flex"
                      >
                        <ToggleGroupItem value="7d">7D</ToggleGroupItem>
                        <ToggleGroupItem value="1m">1M</ToggleGroupItem>
                        <ToggleGroupItem value="1y">1Y</ToggleGroupItem>
                      </ToggleGroup>
                      <Select
                        value={contentGrowthTimeRange}
                        onValueChange={setContentGrowthTimeRange}
                      >
                        <SelectTrigger className="w-20 sm:hidden">
                          <SelectValue placeholder="7D" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">7 Days</SelectItem>
                          <SelectItem value="1m">1 Month</SelectItem>
                          <SelectItem value="1y">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={areaChartConfig}
                      className="h-[300px]"
                    >
                      <AreaChart data={filteredContentGrowthData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={contentGrowthTimeRange === "7d" ? 8 : 4}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Area
                          dataKey="videos"
                          type="natural"
                          fill="var(--color-videos)"
                          stroke="var(--color-videos)"
                          stackId="a"
                        />
                        <Area
                          dataKey="streams"
                          type="natural"
                          fill="var(--color-streams)"
                          stroke="var(--color-streams)"
                          stackId="a"
                        />
                        <Area
                          dataKey="music"
                          type="natural"
                          fill="var(--color-music)"
                          stroke="var(--color-music)"
                          stackId="a"
                        />
                        <Area
                          dataKey="users"
                          type="natural"
                          fill="var(--color-users)"
                          stroke="var(--color-users)"
                          stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                      Content growing steadily{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Showing content creation trends
                    </div>
                  </CardFooter>
                </Card>

                {/* Content Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>Breakdown by content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={pieChartConfig}
                      className="h-[300px]"
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={contentDistributionData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (
                                viewBox &&
                                "cx" in viewBox &&
                                "cy" in viewBox
                              ) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-3xl font-bold"
                                    >
                                      {contentDistributionData
                                        .reduce(
                                          (acc, curr) => acc + curr.value,
                                          0
                                        )
                                        .toLocaleString()}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="fill-muted-foreground"
                                    >
                                      Total Items
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 leading-none font-medium">
                      Videos dominate content library{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Showing distribution of content types
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Video Views by Category Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Video Views by Category</CardTitle>
                    <CardDescription>Most viewed categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={barChartConfig}
                      className="h-[300px]"
                    >
                      <BarChart data={videoViewsByCategory}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="value" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                      Entertainment leads views{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Showing views by video category
                    </div>
                  </CardFooter>
                </Card>

                {/* Top Performing Videos Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Videos</CardTitle>
                    <CardDescription>Most viewed content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={barChartConfig}
                      className="h-[300px]"
                    >
                      <BarChart data={topPerformingVideos}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="value" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                      High engagement on top content{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Showing top 5 most viewed videos
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* User Roles Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution by Role</CardTitle>
                    <CardDescription>Breakdown of user roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={pieChartConfig}
                      className="h-[300px]"
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={userRolesData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (
                                viewBox &&
                                "cx" in viewBox &&
                                "cy" in viewBox
                              ) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-3xl font-bold"
                                    >
                                      {users.length}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="fill-muted-foreground"
                                    >
                                      Total Users
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 leading-none font-medium">
                      Diverse user roles <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Showing distribution of user roles
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
