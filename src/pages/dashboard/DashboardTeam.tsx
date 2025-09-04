import { useReduxUsers } from "@/hooks/useReduxUsers";
import { TeamTable } from "@/components/team-table";
import React from "react";
import { TeamSectionCards, type CardData } from "@/components/team-section-cards";


export default function DashboardTeam() {
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

  const cards = React.useMemo<CardData[]>(
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
    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
      <div className="@container/main flex flex-1 flex-col gap-2 ">
        <div className="flex flex-col gap-4 py-0 md:gap-6 md:py-0">
          <div className="flex justify-between items-center px-6 ">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Team Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organization's teams and members
              </p>
            </div>
          </div>
          <TeamSectionCards cards={cards} />

          <TeamTable team={teamData} />
        </div>
      </div>
    </div>
  );
}
