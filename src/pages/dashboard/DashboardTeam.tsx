import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import data from "@/assets/dummies/data.json";

export default function DashboardTeam() {
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
          <SectionCards />
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
