import { Outlet } from "react-router-dom";

export default function LiveStreamLayout() {
  return (
    <div className="flex flex-1 flex-col px-4 md:p-6 pt-0">
      <Outlet />
    </div>
  );
}
