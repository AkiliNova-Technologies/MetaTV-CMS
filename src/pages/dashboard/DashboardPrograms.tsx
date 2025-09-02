import React from "react";
import { ProgramTable } from "@/components/program-table";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { ProgramSectionCards } from "@/components/program-section-cards";
import type { CardData } from "@/components/program-section-cards";

export default function DashboardPrograms() {
  const { programs } = useReduxPrograms();

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

  // Calculate metrics for cards
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

  const getTrend = (value: number): "up" | "down" =>
    value > 0 ? "up" : "down";

  const cards = React.useMemo<CardData[]>(
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
    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-0 md:gap-6 md:py-0">
          <div className="flex justify-between items-center px-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Program Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organization's programs
              </p>
            </div>
          </div>
          <ProgramSectionCards cards={cards} />
          <ProgramTable programs={programData} />
        </div>
      </div>
    </div>
  );
}
