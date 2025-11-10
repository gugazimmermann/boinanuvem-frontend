import { Link } from "react-router";
import { COLORS } from "../../site/constants";
import { ROUTES } from "../../../routes.config";
import { UserDropdown } from "./user-dropdown";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center">
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

