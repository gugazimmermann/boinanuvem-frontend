import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useAuth } from "~/contexts/auth-context";
import { ROUTES } from "~/routes.config";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />
      <div className="flex h-[calc(100vh-3rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          <div className="p-4 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
