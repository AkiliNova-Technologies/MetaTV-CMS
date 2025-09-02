import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "@/assets/dummies/data.json";

export default function DashboardAnalytics() {
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
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
