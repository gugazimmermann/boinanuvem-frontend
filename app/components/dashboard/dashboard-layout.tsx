import { Outlet } from "react-router";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />
      <div className="flex h-[calc(100vh-3rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

