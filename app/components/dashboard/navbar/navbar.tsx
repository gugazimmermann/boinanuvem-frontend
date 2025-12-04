import { Link } from "react-router";
import { COLORS } from "../../site/constants";
import { ROUTES } from "../../../routes.config";
import { UserDropdown } from "./user-dropdown";

interface NavbarProps {
  readonly onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center gap-3">
            <button
              data-hamburger-button
              onClick={onToggleSidebar}
              className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link
              to={ROUTES.DASHBOARD}
              className="text-xl font-bold cursor-pointer"
              style={{ color: COLORS.secondary }}
            >
              Boi na Nuvem
            </Link>
          </div>

          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}
