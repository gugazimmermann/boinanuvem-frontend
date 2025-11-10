import { Outlet } from "react-router";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

