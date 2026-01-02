import { useReduxUsers } from "@/hooks/useReduxUsers";
import React from "react";
import {
  TeamSectionCards,
  type CardData,
} from "@/components/team-section-cards";
import { UserTable } from "@/components/audience-table";

export default function DashboardAudience() {
  const { users } = useReduxUsers();

  // Filter function to get only regular users (not admins, creators, etc.)
  const getRegularUsers = React.useCallback(() => {
    if (!Array.isArray(users)) return [];
    
    return users.filter(
      (user) =>
        user.role !== "SUPER_ADMIN" &&
        user.role !== "ADMIN" &&
        user.role !== "CREATOR" &&
        user.role !== "MODERATOR"
    );
  }, [users]);

  const teamData = React.useMemo(() => {
    const regularUsers = getRegularUsers();
    
    return regularUsers.map((user) => ({
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
  }, [getRegularUsers]);

  const cards = React.useMemo<CardData[]>(
    () => {
      const regularUsers = getRegularUsers();
      const activeUsers = regularUsers.filter((u) => u.status === "ACTIVE");
      const newUsers = regularUsers.filter(
        (u) =>
          new Date(u.createdAt) >=
          new Date(new Date().setMonth(new Date().getMonth() - 1))
      );
      const recentLoginUsers = regularUsers.filter(
        (u) =>
          u.lastLogin &&
          new Date(u.lastLogin) >=
            new Date(new Date().setDate(new Date().getDate() - 7))
      );

      return [
        {
          title: "Total Members",
          value: regularUsers.length,
          trend: "up",
          percentage: "+8%",
          footerMain: "Growing steadily",
          footerSub: "All regular users in your organization",
        },
        {
          title: "Active Members",
          value: activeUsers.length,
          trend: "up",
          percentage: "+12%",
          footerMain: "Good engagement",
          footerSub: "Regular users active this month",
        },
        {
          title: "New Members",
          value: newUsers.length,
          trend: "up",
          percentage: "+5%",
          footerMain: "New signups",
          footerSub: "In the last 30 days",
        },
        {
          title: "Recent Logins",
          value: recentLoginUsers.length,
          trend: "down",
          percentage: "-3%",
          footerMain: "Weekly engagement",
          footerSub: "Regular users logged in past 7 days",
        },
      ];
    },
    [getRegularUsers]
  );

  return (
    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
      <div className="@container/main flex flex-1 flex-col gap-2 ">
        <div className="flex flex-col gap-4 py-0 md:gap-6 md:py-0">
          <div className="flex justify-between items-center px-6 ">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your audience in one place
              </p>
            </div>
          </div>

          <div className="px-6">
            <TeamSectionCards cards={cards} layout="auto" />
          </div>

          <UserTable user={teamData} />
        </div>
      </div>
    </div>
  );
}