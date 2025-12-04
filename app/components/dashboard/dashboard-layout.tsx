import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useAuth } from "~/contexts/auth-context";
import { ROUTES } from "~/routes.config";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("[data-hamburger-button]")
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex h-[calc(100vh-3rem)]">
        {isSidebarOpen && (
          <div
            className="fixed top-12 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
        )}
        <div ref={sidebarRef}>
          <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          <div className="p-4 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
