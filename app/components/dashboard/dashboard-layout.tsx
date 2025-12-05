import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useAuth } from "~/contexts/auth-context";
import { ROUTES } from "~/routes.config";
import { TrialBanner } from "~/components/ui";
import { useCompanyTrial } from "~/hooks/use-company-trial";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isOnTrial, trialDaysRemaining } = useCompanyTrial();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    // This is intentional - we need to set state after mount to prevent hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isMounted, isAuthenticated, navigate]);

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

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted || !isAuthenticated) {
    return null;
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {isOnTrial && <TrialBanner daysRemaining={trialDaysRemaining} />}
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
